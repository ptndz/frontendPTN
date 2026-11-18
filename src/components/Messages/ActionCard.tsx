import React, { useState } from "react";
import {
  FiTerminal,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiClock,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiChevronRight,
  FiCpu,
} from "react-icons/fi";

export interface ActionCardData {
  toolName: string;
  status: "success" | "failed" | "running" | string;
  node?: string;
  executionTimeMs?: number;
  summary?: string;
  output?: string;
  command?: string;
}

export interface ActionCardProps {
  data: ActionCardData;
}

export function parseActionCardData(raw: string): ActionCardData | null {
  if (!raw || typeof raw !== "string") return null;

  // 1. JSON comment metadata: <!-- action-card: {...} -->
  const matchJson = raw.match(/<!--\s*action-card:\s*({[\s\S]*?})\s*-->/);
  if (matchJson) {
    try {
      const parsed = JSON.parse(matchJson[1]);
      if (parsed.toolName) return parsed;
    } catch {}
  }

  // 2. Structured header: [Action: <tool_name> | status: <status> | node: <node>]
  const matchAction = raw.match(
    /\[Action:\s*([a-zA-Z0-9_:\-]+)(?:\s*\|\s*status:\s*([a-zA-Z0-9_]+))?(?:\s*\|\s*node:\s*([a-zA-Z0-9_]+))?[^\]]*\]/
  );
  if (matchAction) {
    const toolName = matchAction[1];
    const status = matchAction[2] || "success";
    const node = matchAction[3] || "local";

    let summary = "";
    let output = "";
    const remaining = raw.replace(matchAction[0], "").trim();

    const codeMatch = remaining.match(/```(?:[a-zA-Z0-9_\-]*\n)?([\s\S]*?)```/);
    if (codeMatch) {
      output = codeMatch[1].trim();
      summary = remaining.replace(codeMatch[0], "").trim();
    } else {
      summary = remaining;
    }

    return {
      toolName,
      status,
      node,
      summary: summary.replace(/^[>\s*-]+/, "").trim(),
      output,
    };
  }

  return null;
}

export const ActionCard: React.FC<ActionCardProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isSuccess = data.status === "success";
  const isRunning = data.status === "running";

  const handleCopy = async () => {
    if (!data.output) return;
    try {
      await navigator.clipboard.writeText(data.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = data.output;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const getToolIcon = () => {
    const name = data.toolName.toLowerCase();
    if (name.includes("terminal") || name.includes("run") || name.includes("cmd")) {
      return <FiTerminal className="w-4 h-4 text-emerald-400" />;
    }
    if (name.includes("screen") || name.includes("desktop") || name.includes("cua")) {
      return <FiCamera className="w-4 h-4 text-sky-400" />;
    }
    return <FiCpu className="w-4 h-4 text-violet-400" />;
  };

  const getStatusBadge = () => {
    if (isSuccess) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <FiCheckCircle className="w-3 h-3" />
          SUCCESS
        </span>
      );
    }
    if (isRunning) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/30 animate-pulse">
          <FiClock className="w-3 h-3" />
          RUNNING
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
        <FiAlertCircle className="w-3 h-3" />
        FAILED
      </span>
    );
  };

  return (
    <div className="my-2 max-w-lg w-full rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-900/95 text-zinc-100 shadow-md backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-zinc-800/80 border-b border-zinc-700/60">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1 rounded bg-zinc-700/50 flex-shrink-0">
            {getToolIcon()}
          </div>
          <span className="font-mono text-xs font-semibold text-zinc-200 truncate">
            {data.toolName}
          </span>
          {data.node ? (
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-zinc-700/60 text-zinc-300">
              node:{data.node}
            </span>
          ) : null}
        </div>
        <div className="flex-shrink-0 ml-2">{getStatusBadge()}</div>
      </div>

      {/* Body / Summary */}
      <div className="p-3 text-xs text-zinc-300 space-y-2">
        {data.command ? (
          <div className="bg-zinc-950 px-2.5 py-1.5 rounded font-mono text-[11px] text-emerald-300 border border-zinc-800">
            $ {data.command}
          </div>
        ) : null}
        {data.summary ? (
          <p className="leading-relaxed whitespace-pre-wrap">{data.summary}</p>
        ) : null}

        {/* Collapsible Output Accordion */}
        {data.output ? (
          <div className="mt-2 pt-2 border-t border-zinc-800">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {expanded ? (
                  <FiChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <FiChevronRight className="w-3.5 h-3.5" />
                )}
                <span>
                  {expanded ? "Thu gọn kết quả" : "Xem chi tiết log kết quả"}
                </span>
                <span className="text-[10px] text-zinc-500">
                  ({data.output.length} ký tự)
                </span>
              </button>

              {expanded ? (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-emerald-400 transition-colors px-2 py-0.5 rounded hover:bg-zinc-800 cursor-pointer"
                  title="Sao chép log"
                >
                  {copied ? (
                    <>
                      <FiCheck className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <FiCopy className="w-3 h-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              ) : null}
            </div>

            {expanded ? (
              <div className="mt-2 rounded-lg bg-zinc-950 border border-zinc-800 p-2.5 max-h-56 overflow-y-auto overflow-x-auto text-[11px] font-mono text-zinc-200 leading-tight whitespace-pre-wrap break-all select-text">
                {data.output}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Footer */}
      {(data.executionTimeMs !== undefined || data.node) && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-950/60 border-t border-zinc-800/60 text-[10px] text-zinc-400 font-mono">
          <span>{data.node ? `Node: ${data.node}` : ""}</span>
          {data.executionTimeMs !== undefined ? (
            <span>⏱️ {data.executionTimeMs}ms</span>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default ActionCard;
