import { describe, expect, it } from "vitest";
import { parseActionCardData } from "../src/components/Messages/ActionCard";
import { SLASH_COMMANDS } from "../src/lib/slashCommands";

describe("Phase #21 Chat UX: ActionCard & SlashCommands", () => {
  it("parses ActionCard from JSON comment metadata", () => {
    const raw = 'Hoàn tất chạy lệnh.\n<!-- action-card: {"toolName": "otter:execute_terminal_command", "status": "success", "node": "local", "executionTimeMs": 35, "summary": "Chạy lệnh thành công", "output": "Hello world"} -->';
    const parsed = parseActionCardData(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.toolName).toBe("otter:execute_terminal_command");
    expect(parsed?.status).toBe("success");
    expect(parsed?.node).toBe("local");
    expect(parsed?.executionTimeMs).toBe(35);
    expect(parsed?.summary).toBe("Chạy lệnh thành công");
    expect(parsed?.output).toBe("Hello world");
  });

  it("parses ActionCard from Markdown structured header", () => {
    const raw = `[Action: otter:browser_engine_status | status: success | node: win]
> Trình duyệt Chrome đã sẵn sàng trên Windows Desktop.
\`\`\`json
{"engine": "chrome", "status": "idle"}
\`\`\``;
    const parsed = parseActionCardData(raw);
    expect(parsed).not.toBeNull();
    expect(parsed?.toolName).toBe("otter:browser_engine_status");
    expect(parsed?.status).toBe("success");
    expect(parsed?.node).toBe("win");
    expect(parsed?.summary).toContain("Trình duyệt Chrome đã sẵn sàng");
    expect(parsed?.output).toContain('{"engine": "chrome"');
  });

  it("returns null for ordinary chat messages", () => {
    expect(parseActionCardData("Chào buổi sáng cả nhóm!")).toBeNull();
    expect(parseActionCardData("Làm việc tiếp nhé @sunny")).toBeNull();
  });

  it("has all 10 unified slash commands registered", () => {
    const ids = SLASH_COMMANDS.map((c) => c.id);
    expect(ids).toContain("task");
    expect(ids).toContain("tasks");
    expect(ids).toContain("done");
    expect(ids).toContain("run");
    expect(ids).toContain("screen");
    expect(ids).toContain("nodes");
    expect(ids).toContain("plan");
    expect(ids).toContain("status");
    expect(ids).toContain("help");
    expect(ids).toContain("info");
  });
});
