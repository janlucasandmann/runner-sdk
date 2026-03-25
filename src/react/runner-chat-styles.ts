import { runnerChatCss } from "./runner-chat-css.js";

export const RUNNER_CHAT_STYLE_ID = "runner-web-sdk-chat-styles-v3";

export function mountRunnerChatStyles(): void {
  if (typeof document === "undefined") {
    return;
  }

  const existing = document.getElementById(RUNNER_CHAT_STYLE_ID);
  const style = existing instanceof HTMLStyleElement ? existing : document.createElement("style");
  style.id = RUNNER_CHAT_STYLE_ID;
  style.textContent = runnerChatCss;

  if (!style.parentNode) {
    document.head.appendChild(style);
  }
}
