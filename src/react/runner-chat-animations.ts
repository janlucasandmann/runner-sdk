import type { CSSProperties } from "react";

export const RUNNER_CHAT_ENTER_ANIMATION_NAME = "tb-log-slide-in";
export const RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS = 220;
export const RUNNER_CHAT_ENTER_ANIMATION_TIMING = "ease-out";

export function getRunnerChatEnterAnimationStyle(delayMs = 0): CSSProperties {
  return {
    animationName: RUNNER_CHAT_ENTER_ANIMATION_NAME,
    animationDuration: `${RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS}ms`,
    animationTimingFunction: RUNNER_CHAT_ENTER_ANIMATION_TIMING,
    animationFillMode: "both",
    animationDelay: `${delayMs}ms`,
  };
}
