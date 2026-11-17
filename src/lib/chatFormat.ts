import { splitMentionText } from "./mentions";

export type RichChatToken =
  | { type: "code_block"; lang: string; code: string }
  | { type: "inline_code"; code: string }
  | { type: "mention"; username: string }
  | { type: "text"; text: string };

function tokenizeInlineAndMentions(text: string, out: RichChatToken[]): void {
  const inlineRegex = /`([^`\n]+)`/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  const pushMentions = (segment: string) => {
    for (const part of splitMentionText(segment)) {
      if (part.type === "mention") {
        out.push({ type: "mention", username: part.username });
      } else if (part.text) {
        out.push({ type: "text", text: part.text });
      }
    }
  };

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      pushMentions(text.slice(lastIdx, match.index));
    }
    out.push({ type: "inline_code", code: match[1] });
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    pushMentions(text.slice(lastIdx));
  }
}

export function tokenizeRichChatText(text: string): RichChatToken[] {
  if (!text) return [];
  const out: RichChatToken[] = [];
  const fenceRegex = /```([a-zA-Z0-9_+-]*)\r?\n?([\s\S]*?)```/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      tokenizeInlineAndMentions(text.slice(lastIdx, match.index), out);
    }
    const lang = (match[1] || "").trim();
    const rawCode = match[2] || "";
    const cleanCode = rawCode.endsWith("\n") ? rawCode.slice(0, -1) : rawCode;
    out.push({ type: "code_block", lang, code: cleanCode });
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    tokenizeInlineAndMentions(text.slice(lastIdx), out);
  }
  return out;
}
