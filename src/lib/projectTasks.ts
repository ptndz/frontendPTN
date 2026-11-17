/**
 * Board task MXH (thiết kế mục 4.5 — MXH × code/web).
 *
 * API contract (backend làm song song, item 7 — CHƯA verify với backend live):
 * - GET   /messenger/projects/:conversationId/tasks     -> danh sách task của group
 * - PATCH /messenger/projects/:conversationId/tasks/:id -> { status?, assignee? }
 * (router messenger mount ở /messenger — mọi endpoint messenger trong repo
 * đều có prefix này, vd /messenger/conversations/:id/messages.)
 * `[id]` trên route board là conversationId. Response được normalize
 * phòng thủ như src/lib/social.ts (bọc { tasks } / { task } / trả thẳng).
 */
import axios from "axios";

export type ProjectTaskStatus = "todo" | "doing" | "done";

export const PROJECT_TASK_STATUSES: ProjectTaskStatus[] = [
  "todo",
  "doing",
  "done",
];

export interface ProjectTask {
  id: string;
  conversationId: string;
  title: string;
  status: ProjectTaskStatus;
  assignee?: string | null;
  createdById?: string | null;
  mxhMessageId?: number | null;
  otterTaskId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const isRecord = (v: unknown): v is Record<string, any> =>
  typeof v === "object" && v !== null;

const toStringId = (v: unknown): string | null => {
  if (typeof v === "string" && v) return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return null;
};

function isStatus(v: unknown): v is ProjectTaskStatus {
  return v === "todo" || v === "doing" || v === "done";
}

/** Normalize 1 task thô; trả null khi thiếu id (không render được). */
export function normalizeProjectTask(raw: unknown): ProjectTask | null {
  if (!isRecord(raw)) return null;
  const id = toStringId(raw.id);
  if (!id) return null;
  return {
    id,
    conversationId: toStringId(raw.conversationId) ?? "",
    title: typeof raw.title === "string" ? raw.title : "",
    status: isStatus(raw.status) ? raw.status : "todo",
    assignee: typeof raw.assignee === "string" ? raw.assignee : null,
    createdById: toStringId(raw.createdById),
    mxhMessageId:
      typeof raw.mxhMessageId === "number" ? raw.mxhMessageId : null,
    otterTaskId:
      typeof raw.otterTaskId === "string" ? raw.otterTaskId : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function pickArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key] as unknown[];
  }
  return [];
}

/** Parse payload list: trả thẳng mảng, hoặc nằm trong .tasks/.data. */
export function parseProjectTaskList(payload: unknown): ProjectTask[] {
  return pickArray(payload, ["tasks", "data"])
    .map(normalizeProjectTask)
    .filter((t): t is ProjectTask => t !== null);
}

export function groupTasksByStatus(
  tasks: ProjectTask[]
): Record<ProjectTaskStatus, ProjectTask[]> {
  const grouped: Record<ProjectTaskStatus, ProjectTask[]> = {
    todo: [],
    doing: [],
    done: [],
  };
  for (const task of tasks) grouped[task.status].push(task);
  return grouped;
}

/** Đổi status 1 task trong list (pure — dùng cho optimistic UI khi kéo-thả). */
export function moveTaskToStatus(
  tasks: ProjectTask[],
  taskId: string,
  status: ProjectTaskStatus
): ProjectTask[] {
  return tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
}

/** Hình tối thiểu của 1 thành viên nhóm chat (payload `toConversation`). */
export interface ProjectGroupUser {
  id: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  isBot?: boolean | null;
}

/** 1 đoạn group chat, kèm danh sách thành viên (để trang /projects liệt kê). */
export interface ProjectGroupConversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  /** id admin nhóm (backend toConversation trả về) — đổi tên chỉ admin được. */
  adminId?: string | null;
  users: ProjectGroupUser[];
  updateAt?: string | null;
}

function normalizeProjectGroupUser(raw: unknown): ProjectGroupUser | null {
  if (!isRecord(raw)) return null;
  const id = toStringId(raw.id);
  if (!id) return null;
  return {
    id,
    username: typeof raw.username === "string" ? raw.username : "",
    fullName: typeof raw.fullName === "string" ? raw.fullName : "",
    avatar: typeof raw.avatar === "string" ? raw.avatar : null,
    isBot: typeof raw.isBot === "boolean" ? raw.isBot : null,
  };
}

/** Normalize 1 conversation thô; trả null khi thiếu id. */
export function normalizeProjectGroupConversation(
  raw: unknown
): ProjectGroupConversation | null {
  if (!isRecord(raw)) return null;
  const id = toStringId(raw.id);
  if (!id) return null;
  const users = Array.isArray(raw.users)
    ? raw.users
        .map(normalizeProjectGroupUser)
        .filter((u): u is ProjectGroupUser => u !== null)
    : [];
  return {
    id,
    name: typeof raw.name === "string" && raw.name ? raw.name : null,
    isGroup: raw.isGroup === true,
    adminId: toStringId(raw.adminId),
    users,
    updateAt: typeof raw.updateAt === "string" ? raw.updateAt : null,
  };
}

/** Tên hiển thị của nhóm: tên nhóm, nếu không có thì tên các thành viên. */
export function projectGroupDisplayName(
  conv: ProjectGroupConversation
): string {
  if (conv.name) return conv.name;
  const names = conv.users
    .map((u) => u.fullName || u.username)
    .filter((n) => n !== "");
  return names.join(", ");
}

/** Parse payload conversations: trả thẳng mảng, hoặc nằm trong .conversations/.data. */
export function parseProjectGroupConversationList(
  payload: unknown
): ProjectGroupConversation[] {
  return pickArray(payload, ["conversations", "data"])
    .map(normalizeProjectGroupConversation)
    .filter((c): c is ProjectGroupConversation => c !== null);
}

/**
 * Lấy các đoạn group chat của user hiện tại (lọc isGroup từ
 * GET /messenger/getConversations). Chỉ gọi 1 request cho danh sách;
 * số task từng nhóm do trang /projects tự đếm song song.
 */
export async function fetchGroupConversations(): Promise<
  ProjectGroupConversation[]
> {
  const res = await axios.get("/messenger/getConversations");
  return parseProjectGroupConversationList(res.data ?? {}).filter(
    (c) => c.isGroup
  );
}

export async function fetchProjectTasks(
  conversationId: string
): Promise<ProjectTask[]> {
  const res = await axios.get(
    `/messenger/projects/${encodeURIComponent(conversationId)}/tasks`
  );
  return parseProjectTaskList(res.data ?? {});
}

export async function patchProjectTask(
  conversationId: string,
  taskId: string,
  patch: {
    status?: ProjectTaskStatus;
    assignee?: string | null;
    title?: string;
  }
): Promise<ProjectTask | null> {
  const res = await axios.patch(
    `/messenger/projects/${encodeURIComponent(conversationId)}/tasks/${encodeURIComponent(taskId)}`,
    patch
  );
  const payload = res.data ?? {};
  const raw = isRecord(payload.task)
    ? payload.task
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizeProjectTask(raw);
}

/** Parse 1 conversation: bọc { conversation } / { data } hoặc trả thẳng. */
export function parseProjectGroupConversationSingle(
  payload: unknown
): ProjectGroupConversation | null {
  if (!isRecord(payload)) return null;
  const raw = isRecord(payload.conversation)
    ? payload.conversation
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizeProjectGroupConversation(raw);
}

/**
 * Lấy 1 đoạn group chat kèm thành viên + adminId
 * (GET /messenger/conversations/:id — dùng cho dropdown giao task).
 */
export async function fetchProjectGroupConversation(
  conversationId: string
): Promise<ProjectGroupConversation | null> {
  const res = await axios.get(
    `/messenger/conversations/${encodeURIComponent(conversationId)}`
  );
  return parseProjectGroupConversationSingle(res.data ?? {});
}

/**
 * Tạo task tay trên board (POST /messenger/projects/:id/tasks).
 * Backend: title bắt buộc, assignee mặc định "unassigned", status "todo".
 */
export async function createProjectTask(
  conversationId: string,
  input: { title: string; assignee?: string; status?: ProjectTaskStatus }
): Promise<ProjectTask | null> {
  const res = await axios.post(
    `/messenger/projects/${encodeURIComponent(conversationId)}/tasks`,
    input
  );
  const payload = res.data ?? {};
  const raw = isRecord(payload.task)
    ? payload.task
    : isRecord(payload.data)
      ? payload.data
      : payload;
  return normalizeProjectTask(raw);
}

/**
 * Tạo dự án = tạo nhóm chat mới (POST /messenger/groups).
 * Backend: cần ít nhất 2 thành viên khác ngoài người tạo.
 * Trả về conversation đã normalize; throw khi backend báo lỗi.
 */
export async function createProjectGroup(
  name: string,
  memberIds: string[]
): Promise<ProjectGroupConversation> {
  const res = await axios.post("/messenger/groups", { name, memberIds });
  const conv = parseProjectGroupConversationSingle(res.data ?? {});
  if (!conv) throw new Error("create project failed");
  return conv;
}

/**
 * Đổi tên dự án (PATCH /messenger/conversations/:id — admin nhóm only).
 * Trả về conversation đã normalize; throw khi backend báo lỗi (403/404).
 */
export async function renameProjectGroup(
  conversationId: string,
  name: string
): Promise<ProjectGroupConversation> {
  const res = await axios.patch(
    `/messenger/conversations/${encodeURIComponent(conversationId)}`,
    { name }
  );
  const conv = parseProjectGroupConversationSingle(res.data ?? {});
  if (!conv) throw new Error("rename project failed");
  return conv;
}
