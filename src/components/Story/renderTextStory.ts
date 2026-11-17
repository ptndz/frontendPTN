// Render a text-story draft to a PNG image (canvas 1080x1920).
//
// This is the adapter that lets a botbanhang-style "designed slide"
// (background + text) live in the MXH story API without any backend change:
// the backend Story entity only stores mediaUrl + mediaType (image/video),
// so a text story is rendered to an image and uploaded through the same
// POST /image -> POST /stories flow as a photo story.

import type { TextStoryDraft } from "./storyTypes";
import { TEXT_STORY_FONTS, TEXT_STORY_FONT_SIZES } from "./textStoryPresets";

export const TEXT_STORY_CANVAS_WIDTH = 1080;
export const TEXT_STORY_CANVAS_HEIGHT = 1920;

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      lines.push("");
      continue;
    }
    let line = words[0];
    for (const word of words.slice(1)) {
      const test = `${line} ${word}`;
      if (ctx.measureText(test).width <= maxWidth) {
        line = test;
      } else {
        lines.push(line);
        line = word;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function renderTextStoryToBlob(
  draft: TextStoryDraft
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = TEXT_STORY_CANVAS_WIDTH;
  canvas.height = TEXT_STORY_CANVAS_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is not available");

  // Background — solid color or linear gradient (top-left -> bottom-right).
  const bg = draft.background;
  if (bg.type === "gradient" && bg.colors && bg.colors.length >= 2) {
    const grad = ctx.createLinearGradient(
      0,
      0,
      TEXT_STORY_CANVAS_WIDTH,
      TEXT_STORY_CANVAS_HEIGHT
    );
    bg.colors.forEach((color, i) => {
      grad.addColorStop(i / (bg.colors!.length - 1), color);
    });
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = bg.value;
  }
  ctx.fillRect(0, 0, TEXT_STORY_CANVAS_WIDTH, TEXT_STORY_CANVAS_HEIGHT);

  // Text — centered, wrapped, with the draft font/size/color.
  const font =
    TEXT_STORY_FONTS.find((f) => f.key === draft.content.font) ??
    TEXT_STORY_FONTS[0];
  const fontSize = TEXT_STORY_FONT_SIZES[draft.content.size];
  const lineHeight = Math.round(fontSize * 1.3);
  const maxWidth = TEXT_STORY_CANVAS_WIDTH - 160;
  ctx.font = `600 ${fontSize}px ${font.family}`;
  ctx.fillStyle = draft.content.textColor;
  ctx.textAlign = draft.content.align;
  ctx.textBaseline = "middle";

  // Best-effort: wait for the webfont so the canvas uses the real font.
  try {
    await document.fonts.load(`600 ${fontSize}px ${font.family}`);
  } catch {
    // Fallback to whatever the canvas has; the text still renders.
  }

  const lines = wrapText(ctx, draft.content.text.trim(), maxWidth);
  const blockHeight = lines.length * lineHeight;
  const startY =
    TEXT_STORY_CANVAS_HEIGHT / 2 - blockHeight / 2 + lineHeight / 2;
  const x =
    draft.content.align === "left"
      ? 80
      : draft.content.align === "right"
        ? TEXT_STORY_CANVAS_WIDTH - 80
        : TEXT_STORY_CANVAS_WIDTH / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, x, startY + i * lineHeight);
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Failed to render the text story to an image"));
    }, "image/png");
  });
}
