// Story playback hook.
// ADAPTED from botbanhang/admin/src/components/story/hooks/useStoryPlayback.ts
// (requestAnimationFrame-driven currentTime, play/pause, reset on slide change).
//
// Adaptations for a social story viewer:
// - botbanhang tracks currentTime in ms against a slide's duration and loops;
//   this hook tracks a 0..1 progress fraction against one story's duration,
//   calls onEnded once when progress reaches 1, and never loops.
// - botbanhang resets on currentSlideId; this resets on storyKey (the id of
//   the story currently shown).
// - Pause is driven by the caller (press-and-hold), not by a play button.

import { useEffect, useRef, useState } from "react";

interface UseStoryPlaybackProps {
  /** Duration of the current story in milliseconds. */
  durationMs: number;
  /** Whether the progress should advance. False = paused (hold). */
  playing: boolean;
  /** Id of the story currently shown; changing it resets progress to 0. */
  storyKey: string | null;
  /** Called once when progress reaches 1. */
  onEnded: () => void;
}

export function useStoryPlayback({
  durationMs,
  playing,
  storyKey,
  onEnded,
}: UseStoryPlaybackProps): { progress: number } {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;
  // Mirror of progress that updates synchronously inside the rAF tick.
  // The reset effect below runs before the rAF effect in the same commit,
  // so the new story's start time is derived from 0 — not from the old
  // story's progress captured in the rAF effect's closure (which made a
  // freshly navigated-to story start part-way and end early).
  const progressRef = useRef(0);

  // Reset progress whenever the shown story changes.
  useEffect(() => {
    progressRef.current = 0;
    setProgress(0);
  }, [storyKey]);

  useEffect(() => {
    if (!playing || !storyKey) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    // Resume from the current progress (not from 0): the start time is
    // derived from how far along the bar already is (read from the ref,
    // which the reset effect zeroes synchronously on story change).
    const startTime = performance.now() - progressRef.current * durationMs;
    const tick = (now: number) => {
      const next = (now - startTime) / durationMs;
      if (next >= 1) {
        progressRef.current = 1;
        setProgress(1);
        rafRef.current = null;
        onEndedRef.current();
        return;
      }
      progressRef.current = next;
      setProgress(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, storyKey, durationMs]);

  return { progress };
}
