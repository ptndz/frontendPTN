// Story types for the frontendPTN text story.
// ADAPTED from botbanhang/admin/src/components/story/core/types/story.types.ts
// (SlideBackground + the StoryElement text subset).
//
// The botbanhang model is a full slide builder: Story -> slides -> background +
// rich elements (text, shapes, polls, buttons, countdowns, embeds, ...) +
// animations (anime.js/gsap) + audio. That whole model does NOT fit a social
// ephemeral story, so only the background + text subset is reused here:
// a text story = ONE slide with ONE background + ONE centered text element.
// The rest (slides, rich elements, animations, audio, builder UI) is
// deliberately NOT copied.
export type TextStoryBackgroundType = "color" | "gradient";

export interface TextStoryBackground {
  type: TextStoryBackgroundType;
  /** Solid color hex when type="color"; CSS gradient string when type="gradient". */
  value: string;
  /** Gradient stops, kept from botbanhang COLOR_PRESETS.gradients. */
  colors?: string[];
  /** Preset display name (e.g. "Sunset"). */
  name?: string;
}

export interface TextStoryContent {
  text: string;
  /** Font-stack key (see textStoryPresets FONT_OPTIONS). */
  font: string;
  textColor: string;
  align: "left" | "center" | "right";
  /** 0 = small, 1 = medium, 2 = large. */
  size: 0 | 1 | 2;
}

export interface TextStoryDraft {
  background: TextStoryBackground;
  content: TextStoryContent;
  /** Seconds on screen. Default 5, like an image story. */
  duration: number;
}

export const TEXT_STORY_DEFAULT_DURATION = 5;

export function createEmptyTextStoryDraft(): TextStoryDraft {
  return {
    background: { type: "color", value: "#111111", name: "Black" },
    content: {
      text: "",
      font: "onest",
      textColor: "#ffffff",
      align: "center",
      size: 1,
    },
    duration: TEXT_STORY_DEFAULT_DURATION,
  };
}
