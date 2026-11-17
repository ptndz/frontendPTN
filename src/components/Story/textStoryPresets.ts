// Text-story presets.
// ADAPTED from botbanhang/admin/src/components/story/core/presets/
// (color.presets.ts + font.presets.ts).
//
// Two adaptations:
// - Backgrounds: the botbanhang palette is kept, with the mono colors
//   (black/white/grays) first, because the app theme is monochrome.
// - Fonts: botbanhang lists Inter/Roboto/Playfair/Montserrat/... which are NOT
//   loaded in this app, so the options are limited to fonts the app already
//   has (Onest, system-ui, Georgia serif, JetBrains Mono).

import type { TextStoryBackground } from "./storyTypes";

export const TEXT_STORY_BACKGROUNDS: TextStoryBackground[] = [
  { type: "color", value: "#111111", name: "Black" },
  { type: "color", value: "#ffffff", name: "White" },
  { type: "color", value: "#6b7280", name: "Gray" },
  { type: "color", value: "#ef4444", name: "Red" },
  { type: "color", value: "#f97316", name: "Orange" },
  { type: "color", value: "#f59e0b", name: "Amber" },
  { type: "color", value: "#84cc16", name: "Lime" },
  { type: "color", value: "#10b981", name: "Emerald" },
  { type: "color", value: "#14b8a6", name: "Teal" },
  { type: "color", value: "#3b82f6", name: "Blue" },
  { type: "color", value: "#6366f1", name: "Indigo" },
  { type: "color", value: "#8b5cf6", name: "Violet" },
  { type: "color", value: "#a855f7", name: "Purple" },
  { type: "color", value: "#ec4899", name: "Pink" },
  { type: "color", value: "#f43f5e", name: "Rose" },
  // Gradients — names + stops copied from botbanhang COLOR_PRESETS.gradients.
  {
    type: "gradient",
    value: "linear-gradient(160deg, #f97316, #ec4899)",
    colors: ["#f97316", "#ec4899"],
    name: "Sunset",
  },
  {
    type: "gradient",
    value: "linear-gradient(160deg, #3b82f6, #10b981)",
    colors: ["#3b82f6", "#10b981"],
    name: "Ocean",
  },
  {
    type: "gradient",
    value: "linear-gradient(160deg, #8b5cf6, #ec4899)",
    colors: ["#8b5cf6", "#ec4899"],
    name: "Purple Dream",
  },
  {
    type: "gradient",
    value: "linear-gradient(160deg, #10b981, #84cc16)",
    colors: ["#10b981", "#84cc16"],
    name: "Forest",
  },
  {
    type: "gradient",
    value: "linear-gradient(160deg, #f97316, #f43f5e, #8b5cf6)",
    colors: ["#f97316", "#f43f5e", "#8b5cf6"],
    name: "Neon",
  },
  {
    type: "gradient",
    value: "linear-gradient(160deg, #1f2937, #4f46e5)",
    colors: ["#1f2937", "#4f46e5"],
    name: "Midnight",
  },
];

export const TEXT_STORY_TEXT_COLORS: string[] = [
  "#ffffff",
  "#f3f4f6",
  "#111827",
  "#000000",
];

export interface TextStoryFontOption {
  key: string;
  label: string;
  /** CSS font-family value used by both the DOM preview and the canvas. */
  family: string;
}

export const TEXT_STORY_FONTS: TextStoryFontOption[] = [
  { key: "onest", label: "Onest", family: "Onest, system-ui, sans-serif" },
  { key: "system", label: "System", family: "system-ui, -apple-system, sans-serif" },
  { key: "serif", label: "Serif", family: "Georgia, 'Times New Roman', serif" },
  { key: "mono", label: "Mono", family: "'JetBrains Mono', ui-monospace, monospace" },
];

/** Font size in px at the 1080px-wide render canvas, per draft size 0/1/2. */
export const TEXT_STORY_FONT_SIZES = [64, 96, 128] as const;
