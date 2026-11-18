import React, { useCallback, useEffect, useRef, useState } from "react";
import { GetServerSideProps } from "next";
import axios from "axios";
import { toast } from "react-toastify";
import { getCookie } from "cookies-next/client";
import { getAccessToken } from "../../lib/auth/session";
import Navigation from "../../components/Share/Navigation";
import { getAuthenticatedUser } from "../../lib/pages-router-auth";
import { useStoreUser } from "../../store/user";
import { User } from "../../gql/graphql";

interface IProps {
  userData: User;
}

interface TreeEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  mtimeMs: number;
  ext: string;
}

interface HistoryVersion {
  snapshotId: string;
  timestampMs: number;
  actor: string;
  size: number;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let idx = 0;
  let val = bytes;
  while (val >= 1024 && idx < units.length - 1) {
    val /= 1024;
    idx++;
  }
  return `${val.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

const FilesHubPage: React.FC<IProps> = ({ userData }) => {
  const { setUser } = useStoreUser();
  const [scope, setScope] = useState<string>("shared");
  const [currentDir, setCurrentDir] = useState<string>("");
  const [entries, setEntries] = useState<TreeEntry[]>([]);
  const [loadingTree, setLoadingTree] = useState<boolean>(false);

  const [activeFilePath, setActiveFilePath] = useState<string>("");
  const [fileContent, setFileContent] = useState<string>("");
  const [originalSha256, setOriginalSha256] = useState<string>("");
  const [isBinaryFile, setIsBinaryFile] = useState<boolean>(false);
  const [fileSize, setFileSize] = useState<number>(0);
  const [dirty, setDirty] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  const [historyList, setHistoryList] = useState<HistoryVersion[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);

  const [findText, setFindText] = useState<string>("");
  const [replaceText, setReplaceText] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [runningOtter, setRunningOtter] = useState<boolean>(false);
  const [otterOutput, setOtterOutput] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (userData) setUser(userData);
  }, [userData, setUser]);

  const apiBase = process.env.NEXT_PUBLIC_BASE_URL_API || process.env.NEXT_PUBLIC_API_URL || "";

  const authHeaders = useCallback(() => {
    const token = getAccessToken() || getCookie("token");
    return token ? { Authorization: `Bearer ${String(token)}` } : {};
  }, []);

  const loadTree = useCallback(
    async (dir = currentDir, targetScope = scope) => {
      setLoadingTree(true);
      try {
        const res = await axios.get(`${apiBase}/api/v1/files-hub/tree`, {
          params: { scope: targetScope, path: dir },
          headers: authHeaders(),
        });
        setEntries(res.data?.entries || []);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Không thể tải danh sách thư mục");
      } finally {
        setLoadingTree(false);
      }
    },
    [apiBase, authHeaders, currentDir, scope]
  );

  useEffect(() => {
    void loadTree(currentDir, scope);
  }, [currentDir, scope, loadTree]);

  // Live SSE subscription for realtime file updates from AI bots
  useEffect(() => {
    const token = getAccessToken() || getCookie("token");
    if (!token || typeof window === "undefined") return;
    const url = `${apiBase}/api/v1/events/stream?token=${encodeURIComponent(String(token))}`;
    const es = new EventSource(url);
    es.addEventListener("connected", () => setSseConnected(true));
    es.addEventListener("file.changed", (ev: MessageEvent) => {
      try {
        const parsed = JSON.parse(ev.data);
        if (parsed?.data?.path) {
          void loadTree(currentDir, scope);
        }
      } catch {}
    });
    es.onerror = () => setSseConnected(false);
    return () => es.close();
  }, [apiBase, currentDir, scope, loadTree]);

  const openFile = async (filePath: string) => {
    if (dirty && !window.confirm("Tệp hiện tại có thay đổi chưa lưu. Vẫn chuyển tệp?")) {
      return;
    }
    try {
      const res = await axios.get(`${apiBase}/api/v1/files-hub/read`, {
        params: { scope, path: filePath },
        headers: authHeaders(),
      });
      const d = res.data;
      setActiveFilePath(d.path);
      setIsBinaryFile(Boolean(d.isBinary));
      setFileContent(d.isBinary ? "" : d.rawContent ?? d.content ?? "");
      setOriginalSha256(d.sha256 || "");
      setFileSize(d.size || 0);
      setDirty(false);
      setShowHistory(false);
    } catch (err: any) {
      // Large binary file (>5MB) -> show download card instead of failing
      setActiveFilePath(filePath);
      setIsBinaryFile(true);
      setFileContent("");
      setOriginalSha256("");
      setDirty(false);
      toast.info(err?.response?.data?.message || "Tệp lớn — vui lòng dùng nút Tải về (Streaming)");
    }
  };

  const runInOtter = useCallback(async () => {
    if (!activeFilePath) return;
    setRunningOtter(true);
    setShowConsole(true);
    setOtterOutput("⏳ Đang gửi lệnh thực thi tới Otter Daemon...");
    try {
      if (dirty) {
        await saveFile();
      }
      const ext = activeFilePath.split(".").pop()?.toLowerCase();
      let cmd = "";
      if (ext === "py") cmd = `python3 "${activeFilePath}"`;
      else if (ext === "ts" || ext === "js") cmd = `bun "${activeFilePath}"`;
      else if (ext === "sh") cmd = `bash "${activeFilePath}"`;
      else cmd = `head -n 50 "${activeFilePath}"`;

      const res = await axios.post(
        `${apiBase}/api/v1/tools/call`,
        {
          toolName: "execute_terminal_command",
          arguments: { command: cmd },
        },
        { headers: authHeaders() }
      );
      const text = res.data?.data?.result?.content?.[0]?.text || JSON.stringify(res.data, null, 2);
      setOtterOutput(text);
      toast.success("Thực thi qua Otter hoàn tất!");
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message;
      setOtterOutput(`❌ Lỗi thực thi: ${msg}`);
      toast.error(`Lỗi thực thi: ${msg}`);
    } finally {
      setRunningOtter(false);
    }
  }, [activeFilePath, dirty, apiBase, authHeaders]);

  const saveFile = useCallback(async () => {
    if (!activeFilePath || isBinaryFile) return;
    setSaving(true);
    try {
      const res = await axios.post(
        `${apiBase}/api/v1/files-hub/write`,
        {
          scope,
          path: activeFilePath,
          content: fileContent,
          expectedSha256: originalSha256 || undefined,
        },
        { headers: authHeaders() }
      );
      setOriginalSha256(res.data?.sha256 || "");
      setFileSize(res.data?.size || 0);
      setDirty(false);
      toast.success(`Đã lưu ${activeFilePath}`);
      void loadTree();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi lưu tệp");
    } finally {
      setSaving(false);
    }
  }, [activeFilePath, apiBase, authHeaders, fileContent, isBinaryFile, loadTree, originalSha256, scope]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        if (activeFilePath && !isBinaryFile) {
          e.preventDefault();
          void saveFile();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeFilePath, isBinaryFile, saveFile]);

  const applySearchPatch = async () => {
    if (!activeFilePath || !findText) return;
    try {
      const res = await axios.post(
        `${apiBase}/api/v1/files-hub/edit`,
        {
          scope,
          path: activeFilePath,
          target: findText,
          replacement: replaceText,
          replaceAll: true,
          expectedSha256: originalSha256 || undefined,
        },
        { headers: authHeaders() }
      );
      toast.success(`Đã thay thế ${res.data?.replacementsApplied || 1} vị trí!`);
      setDirty(false);
      await openFile(activeFilePath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không tìm thấy chuỗi cần thay thế");
    }
  };

  const handleCreateNewFile = async () => {
    const name = window.prompt("Nhập tên tệp mới (ví dụ: note.md hoặc script.ts):");
    if (!name || !name.trim()) return;
    const relPath = currentDir ? `${currentDir}/${name.trim()}` : name.trim();
    try {
      await axios.post(
        `${apiBase}/api/v1/files-hub/write`,
        { scope, path: relPath, content: "" },
        { headers: authHeaders() }
      );
      await loadTree();
      await openFile(relPath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể tạo tệp");
    }
  };

  const handleCreateFolder = async () => {
    const name = window.prompt("Nhập tên thư mục mới:");
    if (!name || !name.trim()) return;
    const relPath = currentDir ? `${currentDir}/${name.trim()}` : name.trim();
    try {
      await axios.post(
        `${apiBase}/api/v1/files-hub/mkdir`,
        { scope, path: relPath },
        { headers: authHeaders() }
      );
      await loadTree();
      toast.success(`Đã tạo thư mục ${relPath}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể tạo thư mục");
    }
  };

  const handleDeleteEntry = async (entry: TreeEntry) => {
    if (!window.confirm(`Xóa ${entry.isDir ? "thư mục" : "tệp"} '${entry.name}'?`)) return;
    try {
      await axios.delete(`${apiBase}/api/v1/files-hub/item`, {
        params: { scope, path: entry.path, recursive: entry.isDir ? "true" : "false" },
        headers: authHeaders(),
      });
      if (activeFilePath === entry.path) {
        setActiveFilePath("");
        setFileContent("");
        setDirty(false);
      }
      await loadTree();
      toast.success(`Đã xóa ${entry.name}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi khi xóa");
    }
  };

  const handleLargeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const relPath = currentDir ? `${currentDir}/${file.name}` : file.name;
    setUploadProgress(0);
    try {
      await axios.put(`${apiBase}/api/v1/files-hub/stream`, file, {
        params: { scope, path: relPath },
        headers: {
          ...authHeaders(),
          "Content-Type": "application/octet-stream",
        },
        onUploadProgress: (ev) => {
          if (ev.total) {
            setUploadProgress(Math.round((ev.loaded * 100) / ev.total));
          }
        },
      });
      toast.success(`Đã tải lên thành công ${file.name} (${formatBytes(file.size)})`);
      await loadTree();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tải tệp lớn thất bại");
    } finally {
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const loadHistory = async () => {
    if (!activeFilePath) return;
    try {
      const res = await axios.get(`${apiBase}/api/v1/files-hub/history`, {
        params: { scope, path: activeFilePath },
        headers: authHeaders(),
      });
      setHistoryList(res.data?.versions || []);
      setShowHistory(true);
    } catch {
      toast.error("Không thể tải lịch sử phiên bản");
    }
  };

  const restoreSnapshot = async (snapshotId: string) => {
    if (!activeFilePath) return;
    try {
      await axios.post(
        `${apiBase}/api/v1/files-hub/restore`,
        { scope, path: activeFilePath, snapshotId },
        { headers: authHeaders() }
      );
      toast.success("Đã khôi phục phiên bản!");
      setDirty(false);
      await openFile(activeFilePath);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Khôi phục thất bại");
    }
  };

  const downloadRawUrl = (filePath: string) => {
    const token = getAccessToken() || getCookie("token");
    const q = new URLSearchParams({
      scope,
      path: filePath,
      ...(token ? { token: String(token) } : {}),
    });
    return `${apiBase}/api/v1/files-hub/raw?${q.toString()}`;
  };

  const goParentDir = () => {
    if (!currentDir) return;
    const parts = currentDir.split("/").filter(Boolean);
    parts.pop();
    setCurrentDir(parts.join("/"));
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0" }}>
      <Navigation />
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "16px 20px" }}>
        {/* Header Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 16,
            padding: "12px 16px",
            background: "#1e293b",
            borderRadius: 12,
            border: "1px solid #334155",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
              📂 Kho Tệp Chung & AI Code Workspace
            </h1>
            <span
              style={{
                fontSize: 12,
                padding: "3px 10px",
                borderRadius: 999,
                background: sseConnected ? "rgba(16,185,129,0.2)" : "rgba(148,163,184,0.2)",
                color: sseConnected ? "#34d399" : "#94a3b8",
              }}
            >
              {sseConnected ? "● SSE Live" : "○ SSE Connecting"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <select
              value={scope}
              onChange={(e) => {
                setScope(e.target.value);
                setCurrentDir("");
                setActiveFilePath("");
              }}
              style={{
                background: "#0f172a",
                color: "#f8fafc",
                border: "1px solid #475569",
                borderRadius: 8,
                padding: "6px 10px",
              }}
            >
              <option value="shared">🌐 Kho chung AI (muse-shared)</option>
              <option value="conv:503">💬 Nhóm 503 Workspace</option>
              <option value="user">👤 Thư mục cá nhân của tôi</option>
            </select>

            <button
              onClick={handleCreateNewFile}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Tệp mới
            </button>
            <button
              onClick={handleCreateFolder}
              style={{
                background: "#334155",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
              }}
            >
              + Thư mục
            </button>
            <label
              style={{
                background: "#059669",
                color: "#fff",
                borderRadius: 8,
                padding: "7px 12px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              ⬆ Tải tệp lớn (512MB)
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleLargeUpload}
                style={{ display: "none" }}
              />
            </label>
          </div>
        </div>

        {uploadProgress !== null && (
          <div
            style={{
              marginBottom: 12,
              padding: "8px 14px",
              background: "#1e293b",
              borderRadius: 8,
              border: "1px solid #10b981",
            }}
          >
            Đang stream tệp lớn lên máy chủ: <strong>{uploadProgress}%</strong>
          </div>
        )}

        {/* Main 2-Column Split */}
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16, minHeight: "74vh" }}>
          {/* Left Directory Explorer */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              border: "1px solid #334155",
              padding: 12,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 8,
                marginBottom: 8,
                borderBottom: "1px solid #334155",
                fontSize: 13,
              }}
            >
              <span style={{ fontFamily: "monospace", color: "#93c5fd" }}>
                /{currentDir || ""}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                {currentDir && (
                  <button
                    onClick={goParentDir}
                    style={{
                      background: "#334155",
                      color: "#e2e8f0",
                      border: "none",
                      borderRadius: 6,
                      padding: "3px 8px",
                      cursor: "pointer",
                    }}
                  >
                    ⬅ Lên
                  </button>
                )}
                <button
                  onClick={() => loadTree()}
                  style={{
                    background: "#334155",
                    color: "#e2e8f0",
                    border: "none",
                    borderRadius: 6,
                    padding: "3px 8px",
                    cursor: "pointer",
                  }}
                >
                  ↻
                </button>
              </div>
            </div>

            {loadingTree ? (
              <div style={{ padding: 20, color: "#94a3b8" }}>Đang tải thư mục...</div>
            ) : entries.length === 0 ? (
              <div style={{ padding: 20, color: "#64748b", textAlign: "center" }}>
                Thư mục trống
              </div>
            ) : (
              <div style={{ overflowY: "auto", flex: 1 }}>
                {entries.map((item) => {
                  const isSelected = activeFilePath === item.path;
                  return (
                    <div
                      key={item.path}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "7px 8px",
                        borderRadius: 8,
                        marginBottom: 2,
                        background: isSelected ? "#2563eb33" : "transparent",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (item.isDir) setCurrentDir(item.path);
                        else void openFile(item.path);
                      }}
                    >
                      <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <span style={{ marginRight: 8 }}>{item.isDir ? "📁" : "📄"}</span>
                        <span style={{ fontSize: 14 }}>{item.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                        {!item.isDir && (
                          <span style={{ fontSize: 11, color: "#94a3b8" }}>
                            {formatBytes(item.size)}
                          </span>
                        )}
                        <button
                          onClick={(ev) => {
                            ev.stopPropagation();
                            void handleDeleteEntry(item);
                          }}
                          title="Xóa"
                          style={{
                            background: "transparent",
                            color: "#f87171",
                            border: "none",
                            cursor: "pointer",
                            fontSize: 13,
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Code Editor & File Inspector */}
          <div
            style={{
              background: "#1e293b",
              borderRadius: 12,
              border: "1px solid #334155",
              padding: 14,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {!activeFilePath ? (
              <div style={{ margin: "auto", textAlign: "center", color: "#94a3b8" }}>
                <p style={{ fontSize: 16 }}>Chọn một tệp ở cột bên trái để xem hoặc chỉnh sửa trực tiếp</p>
                <p style={{ fontSize: 13, color: "#64748b" }}>
                  Hỗ trợ Ctrl+S lưu nhanh, Patch Search/Replace kiểu IDE, Lịch sử phiên bản & Tải tệp lớn 512MB
                </p>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    paddingBottom: 10,
                    marginBottom: 10,
                    borderBottom: "1px solid #334155",
                  }}
                >
                  <div>
                    <strong style={{ fontFamily: "monospace", fontSize: 14, color: "#f8fafc" }}>
                      {activeFilePath}
                    </strong>
                    {dirty && (
                      <span style={{ marginLeft: 8, color: "#fbbf24", fontSize: 12 }}>
                        ● Chưa lưu
                      </span>
                    )}
                    <span style={{ marginLeft: 10, fontSize: 12, color: "#94a3b8" }}>
                      ({formatBytes(fileSize)})
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {!isBinaryFile && (
                      <>
                        <button
                          onClick={saveFile}
                          disabled={saving}
                          style={{
                            background: "#2563eb",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          {saving ? "Đang lưu..." : "💾 Lưu (Ctrl+S)"}
                        </button>
                        <button
                          onClick={runInOtter}
                          disabled={runningOtter}
                          style={{
                            background: "#059669",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            cursor: "pointer",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          {runningOtter ? "⏳ Đang chạy..." : "▶️ Run via Otter"}
                        </button>
                        <button
                          onClick={loadHistory}
                          style={{
                            background: "#334155",
                            color: "#e2e8f0",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 10px",
                            cursor: "pointer",
                          }}
                        >
                          🕒 Lịch sử
                        </button>
                      </>
                    )}
                    <a
                      href={downloadRawUrl(activeFilePath)}
                      style={{
                        background: "#0f766e",
                        color: "#fff",
                        textDecoration: "none",
                        borderRadius: 6,
                        padding: "6px 12px",
                        fontSize: 13,
                      }}
                    >
                      ⬇ Tải về
                    </a>
                  </div>
                </div>

                {!isBinaryFile && (
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                    <input
                      placeholder="Tìm chuỗi (target)..."
                      value={findText}
                      onChange={(e) => setFindText(e.target.value)}
                      style={{
                        background: "#0f172a",
                        color: "#f8fafc",
                        border: "1px solid #475569",
                        borderRadius: 6,
                        padding: "5px 10px",
                        flex: 1,
                        fontFamily: "monospace",
                      }}
                    />
                    <input
                      placeholder="Thay bằng (replacement)..."
                      value={replaceText}
                      onChange={(e) => setReplaceText(e.target.value)}
                      style={{
                        background: "#0f172a",
                        color: "#f8fafc",
                        border: "1px solid #475569",
                        borderRadius: 6,
                        padding: "5px 10px",
                        flex: 1,
                        fontFamily: "monospace",
                      }}
                    />
                    <button
                      onClick={applySearchPatch}
                      style={{
                        background: "#4f46e5",
                        color: "#fff",
                        border: "none",
                        borderRadius: 6,
                        padding: "5px 12px",
                        cursor: "pointer",
                      }}
                    >
                      ⚡ Patch API
                    </button>
                  </div>
                )}

                {showHistory && historyList.length > 0 && (
                  <div
                    style={{
                      marginBottom: 10,
                      padding: 10,
                      background: "#0f172a",
                      borderRadius: 8,
                      border: "1px solid #475569",
                      maxHeight: 160,
                      overflowY: "auto",
                    }}
                  >
                    <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6 }}>
                      Các bản sao lưu tự động trước khi sửa:
                    </div>
                    {historyList.map((h) => (
                      <div
                        key={h.snapshotId}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 12,
                          padding: "4px 0",
                          borderBottom: "1px solid #1e293b",
                        }}
                      >
                        <span>
                          {new Date(h.timestampMs).toLocaleString("vi-VN")} — bởi{" "}
                          <strong>@{h.actor}</strong> ({formatBytes(h.size)})
                        </span>
                        <button
                          onClick={() => restoreSnapshot(h.snapshotId)}
                          style={{
                            background: "#334155",
                            color: "#38bdf8",
                            border: "none",
                            borderRadius: 4,
                            padding: "2px 8px",
                            cursor: "pointer",
                          }}
                        >
                          Khôi phục
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {isBinaryFile ? (
                  <div style={{ margin: "auto", textAlign: "center", padding: 32 }}>
                    <p>📦 Đây là tệp nhị phân hoặc tệp dung lượng lớn ({formatBytes(fileSize)}).</p>
                    <a
                      href={downloadRawUrl(activeFilePath)}
                      style={{
                        display: "inline-block",
                        marginTop: 10,
                        background: "#2563eb",
                        color: "#fff",
                        padding: "8px 16px",
                        borderRadius: 8,
                        textDecoration: "none",
                      }}
                    >
                      ⬇ Tải xuống trực tiếp (Streaming Range)
                    </a>
                  </div>
                ) : (
                  <textarea
                    value={fileContent}
                    onChange={(e) => {
                      setFileContent(e.target.value);
                      setDirty(true);
                    }}
                    spellCheck={false}
                    style={{
                      flex: 1,
                      width: "100%",
                      minHeight: 480,
                      background: "#020617",
                      color: "#e2e8f0",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      padding: 12,
                      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                      fontSize: 13.5,
                      lineHeight: 1.55,
                      resize: "vertical",
                    }}
                  />
                )}

                {showConsole && (
                  <div
                    style={{
                      marginTop: 12,
                      background: "#020617",
                      borderRadius: 8,
                      border: "1px solid #334155",
                      padding: 12,
                      fontFamily: "monospace",
                      fontSize: 13,
                      color: "#e2e8f0",
                      maxHeight: 250,
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingBottom: 6,
                        marginBottom: 6,
                        borderBottom: "1px solid #1e293b",
                        color: "#94a3b8",
                        fontSize: 12,
                      }}
                    >
                      <span>📟 Otter Terminal Output</span>
                      <button
                        onClick={() => setShowConsole(false)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                        }}
                      >
                        ✕ Đóng
                      </button>
                    </div>
                    <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                      {otterOutput}
                    </pre>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userData = await getAuthenticatedUser(context);
  if (!userData) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }
  return {
    props: {
      userData,
    },
  };
};

export default FilesHubPage;
