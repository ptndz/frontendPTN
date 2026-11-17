import React from "react";
import Link from "next/link";

/**
 * P1.6 — Render #hashtag và @mention trong nội dung bài viết / bình luận
 * thành link: #tag -> /hashtag/[tag], @username -> /[username].
 * Chỉ tách token ở đầu từ (sau khoảng trắng / đầu chuỗi) để không ăn
 * nhầm ký tự #/@ giữa từ, vd email.
 */
const TOKEN_RE = /(^|\s)(#[A-Za-z0-9_À-ỹ]+|@[A-Za-z0-9_.]+)/g;

export function renderRichText(text: string): React.ReactNode[] {
  if (!text) return [];
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const [full, prefix, token] = match;
    const start = match.index + prefix.length;
    if (start > lastIndex) {
      nodes.push(text.slice(lastIndex, start));
    }
    if (token.startsWith("#")) {
      const tag = token.slice(1);
      nodes.push(
        <Link
          key={key++}
          href={`/hashtag/${encodeURIComponent(tag)}`}
          className="text-accent-bright hover:underline font-medium">
          {token}
        </Link>
      );
    } else {
      const username = token.slice(1);
      nodes.push(
        <Link
          key={key++}
          href={`/${username}`}
          className="text-accent-bright hover:underline font-medium">
          {token}
        </Link>
      );
    }
    lastIndex = match.index + full.length;
  }
  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }
  return nodes;
}

const RichText: React.FC<{ text: string }> = ({ text }) => {
  return <>{renderRichText(text)}</>;
};

export default RichText;
