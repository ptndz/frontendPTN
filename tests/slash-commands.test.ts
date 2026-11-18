/**
 * Test Phase #24c (muse003): Slash Commands Meta (/fb, /ig, /th, /ads).
 * Mo rong tu test Phase #21a (5 lenh Otter/A2A) len du 14 lenh.
 * - 4 lenh Meta (/fb, /ig, /th, /ads) co mat trong slashTrigger.
 * - Chuoi insert dung: ca 4 lenh Meta deu nhan tham so subcommand nen
 *   ket thuc bang khoang trang (giong /run, /plan, /task, /done).
 * - Tong 14 lenh, id/label duy nhat.
 * - Moi descKey + menuLabel/noResults deu co ban dich vi/en (khong roi key).
 */
import { describe, expect, it } from "vitest";
import { SLASH_COMMANDS } from "../src/lib/slashCommands";
import { dictionaries, lookup } from "../src/i18n/dictionaries";

const OTTER_A2A_IDS = ["run", "screen", "nodes", "plan", "status"] as const;
const META_IDS = ["fb", "ig", "th", "ads"] as const;
const ALL_IDS = [
  "task",
  "tasks",
  "done",
  "run",
  "screen",
  "nodes",
  "plan",
  "status",
  "fb",
  "ig",
  "th",
  "ads",
  "help",
  "info",
] as const;

describe("Phase #24c: SlashCommands (Meta)", () => {
  it("co du 14 lenh (10 cu + 4 Meta) trong slashTrigger", () => {
    expect(SLASH_COMMANDS).toHaveLength(14);
    const ids = SLASH_COMMANDS.map((c) => c.id);
    for (const id of ALL_IDS) expect(ids).toContain(id);
  });

  it("co du 5 lenh Otter/A2A trong slashTrigger", () => {
    const ids = SLASH_COMMANDS.map((c) => c.id);
    for (const id of OTTER_A2A_IDS) expect(ids).toContain(id);
  });

  it("co du 4 lenh Meta trong slashTrigger", () => {
    const ids = SLASH_COMMANDS.map((c) => c.id);
    for (const id of META_IDS) expect(ids).toContain(id);
  });

  it("insert bat dau bang label; lenh Meta ket bang khoang trang", () => {
    const byId = new Map(SLASH_COMMANDS.map((c) => [c.id, c]));
    expect(byId.get("fb")?.insert).toBe("/fb ");
    expect(byId.get("ig")?.insert).toBe("/ig ");
    expect(byId.get("th")?.insert).toBe("/th ");
    expect(byId.get("ads")?.insert).toBe("/ads ");
    expect(byId.get("run")?.insert).toBe("/run ");
    expect(byId.get("plan")?.insert).toBe("/plan ");
    expect(byId.get("screen")?.insert).toBe("/screen");
    expect(byId.get("nodes")?.insert).toBe("/nodes");
    expect(byId.get("status")?.insert).toBe("/status");
    for (const c of SLASH_COMMANDS) {
      expect(c.insert.startsWith(c.label)).toBe(true);
    }
  });

  it("id va label la duy nhat", () => {
    const ids = SLASH_COMMANDS.map((c) => c.id);
    const labels = SLASH_COMMANDS.map((c) => c.label);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("moi descKey deu co ban dich vi/en khong rong", () => {
    for (const c of SLASH_COMMANDS) {
      for (const locale of ["vi", "en"] as const) {
        const text = lookup(dictionaries[locale], c.descKey);
        expect(
          text,
          `${c.id}: thieu dich ${locale} cho key ${c.descKey}`
        ).toBeDefined();
        expect(text!.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("menuLabel va noResults cua popover co ban dich vi/en", () => {
    for (const key of [
      "messenger.commands.menuLabel",
      "messenger.commands.noResults",
    ]) {
      for (const locale of ["vi", "en"] as const) {
        const text = lookup(dictionaries[locale], key);
        expect(text, `thieu dich ${locale} cho key ${key}`).toBeDefined();
        expect(text!.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
