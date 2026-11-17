/**
 * Test logic thuần trong src/lib/projectTasks.ts (không gọi API, không DOM).
 * Board task MXH — thiết kế mục 4.5.
 */
import { describe, expect, it } from "vitest";
import {
  groupTasksByStatus,
  moveTaskToStatus,
  normalizeProjectGroupConversation,
  normalizeProjectTask,
  parseProjectGroupConversationList,
  parseProjectGroupConversationSingle,
  parseProjectTaskList,
  projectGroupDisplayName,
  type ProjectGroupConversation,
  type ProjectTask,
} from "../src/lib/projectTasks";

const task = (over: Partial<ProjectTask> = {}): ProjectTask => ({
  id: "1",
  conversationId: "10",
  title: "Làm board Trello",
  status: "todo",
  assignee: "ai_nyx",
  ...over,
});

describe("normalizeProjectTask", () => {
  it("normalize đủ field, id số -> chuỗi", () => {
    expect(
      normalizeProjectTask({ id: 7, conversationId: 10, title: "X", status: "doing" })
    ).toEqual({
      id: "7",
      conversationId: "10",
      title: "X",
      status: "doing",
      assignee: null,
      createdById: null,
      mxhMessageId: null,
      otterTaskId: null,
      createdAt: null,
      updatedAt: null,
    });
  });
  it("status lạ -> todo, thiếu id -> null", () => {
    expect(normalizeProjectTask({ id: "1", title: "X", status: "wip" })?.status).toBe(
      "todo"
    );
    expect(normalizeProjectTask({ title: "X" })).toBeNull();
    expect(normalizeProjectTask(null)).toBeNull();
    expect(normalizeProjectTask("x")).toBeNull();
  });
});

describe("parseProjectTaskList", () => {
  it("trả thẳng mảng, bọc { tasks }, bọc { data } đều parse được", () => {
    const raw = [task(), { id: "2", title: "Y", status: "done" }];
    expect(parseProjectTaskList(raw)).toHaveLength(2);
    expect(parseProjectTaskList({ tasks: raw })).toHaveLength(2);
    expect(parseProjectTaskList({ data: raw })).toHaveLength(2);
    expect(parseProjectTaskList({ tasks: [{ title: "no-id" }] })).toHaveLength(0);
    expect(parseProjectTaskList({})).toEqual([]);
  });
});

describe("groupTasksByStatus", () => {
  it("chia đúng 3 cột", () => {
    const grouped = groupTasksByStatus([
      task({ id: "1", status: "todo" }),
      task({ id: "2", status: "doing" }),
      task({ id: "3", status: "done" }),
      task({ id: "4", status: "todo" }),
    ]);
    expect(grouped.todo.map((t) => t.id)).toEqual(["1", "4"]);
    expect(grouped.doing.map((t) => t.id)).toEqual(["2"]);
    expect(grouped.done.map((t) => t.id)).toEqual(["3"]);
  });
});

describe("moveTaskToStatus", () => {
  it("đổi status đúng task, không sửa task khác, không mutate list gốc", () => {
    const tasks = [task({ id: "1" }), task({ id: "2", status: "doing" })];
    const moved = moveTaskToStatus(tasks, "1", "done");
    expect(moved.find((t) => t.id === "1")?.status).toBe("done");
    expect(moved.find((t) => t.id === "2")?.status).toBe("doing");
    expect(tasks[0].status).toBe("todo");
  });
});

const conv = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: 503,
  name: "Bot test",
  isGroup: true,
  users: [
    { id: "u1", username: "load_001", fullName: "Load 001", avatar: "/a.png" },
    { id: "u2", username: "ai_nyx", fullName: "Nyx", isBot: true },
  ],
  updateAt: "2026-11-15T05:00:00.000Z",
  ...over,
});

describe("normalizeProjectGroupConversation", () => {
  it("normalize đủ field, id số -> chuỗi, giữ cờ isGroup", () => {
    expect(normalizeProjectGroupConversation(conv())).toEqual({
      id: "503",
      name: "Bot test",
      isGroup: true,
      adminId: null,
      users: [
        { id: "u1", username: "load_001", fullName: "Load 001", avatar: "/a.png", isBot: null },
        { id: "u2", username: "ai_nyx", fullName: "Nyx", avatar: null, isBot: true },
      ],
      updateAt: "2026-11-15T05:00:00.000Z",
    });
  });
  it("thiếu id -> null, thiếu users -> [], tên rỗng -> null", () => {
    expect(normalizeProjectGroupConversation({ name: "X" })).toBeNull();
    expect(normalizeProjectGroupConversation(null)).toBeNull();
    expect(
      normalizeProjectGroupConversation(conv({ users: undefined, name: "" }))
    ).toEqual({
      id: "503",
      name: null,
      isGroup: true,
      adminId: null,
      users: [],
      updateAt: "2026-11-15T05:00:00.000Z",
    });
  });
  it("giữ adminId khi có (đổi tên chỉ admin được)", () => {
    expect(
      normalizeProjectGroupConversation(conv({ adminId: "u1" }))?.adminId
    ).toBe("u1");
  });
});

describe("parseProjectGroupConversationSingle", () => {
  it("bọc { conversation }, bọc { data }, trả thẳng đều parse được", () => {
    expect(parseProjectGroupConversationSingle({ conversation: conv() })?.id).toBe("503");
    expect(parseProjectGroupConversationSingle({ data: conv() })?.id).toBe("503");
    expect(parseProjectGroupConversationSingle(conv())?.id).toBe("503");
    expect(parseProjectGroupConversationSingle({})).toBeNull();
    expect(parseProjectGroupConversationSingle(null)).toBeNull();
  });
});

describe("parseProjectGroupConversationList", () => {
  it("trả thẳng mảng, bọc { conversations }, bọc { data } đều parse được", () => {
    const raw = [conv(), conv({ id: 504, isGroup: false })];
    expect(parseProjectGroupConversationList(raw)).toHaveLength(2);
    expect(parseProjectGroupConversationList({ conversations: raw })).toHaveLength(2);
    expect(parseProjectGroupConversationList({ data: raw })).toHaveLength(2);
    expect(parseProjectGroupConversationList({})).toEqual([]);
  });
});

describe("projectGroupDisplayName", () => {
  it("ưu tiên tên nhóm, không có tên thì ghép tên thành viên", () => {
    const named = normalizeProjectGroupConversation(conv()) as ProjectGroupConversation;
    expect(projectGroupDisplayName(named)).toBe("Bot test");
    const unnamed = normalizeProjectGroupConversation(
      conv({ name: null })
    ) as ProjectGroupConversation;
    expect(projectGroupDisplayName(unnamed)).toBe("Load 001, Nyx");
    const empty = normalizeProjectGroupConversation(
      conv({ name: null, users: [] })
    ) as ProjectGroupConversation;
    expect(projectGroupDisplayName(empty)).toBe("");
  });
});

describe("normalizeProjectTask (#18b priority, dueDate, description, ack)", () => {
  it("normalizes priority, dueDate/dueAt, description, labels, ackedAt, ackedBy", () => {
    const t = normalizeProjectTask({
      id: 42,
      conversationId: 503,
      title: "Deploy SSE",
      status: "doing",
      priority: "urgent",
      description: "Stream task.acked",
      dueAt: "2026-11-20T00:00:00.000Z",
      labels: ["backend", "sse"],
      ackedAt: "2026-11-17T15:00:00.000Z",
      ackedBy: "ai_muse002",
    });
    expect(t?.priority).toBe("urgent");
    expect(t?.description).toBe("Stream task.acked");
    expect(t?.dueDate).toBe("2026-11-20T00:00:00.000Z");
    expect(t?.labels).toBe("backend, sse");
    expect(t?.ackedAt).toBe("2026-11-17T15:00:00.000Z");
    expect(t?.ackedBy).toBe("ai_muse002");
  });
});
