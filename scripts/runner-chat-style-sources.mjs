import fs from "node:fs/promises";
import path from "node:path";

/**
 * Ordered source manifest for the CSS injected by RunnerChat.
 *
 * Keeping this list outside the build command lets production asset generation
 * and the Vite development runtime consume the exact same cascade.
 */
export const RUNNER_CHAT_STYLE_SOURCE_PATHS = Object.freeze([
  "node_modules/@git-diff-view/react/styles/diff-view-pure.css",
  "src/platform-ui/components/composite/popup/popup.css",
  "src/platform-ui/components/ui/selector/selector.css",
  "src/platform-ui/components/ui/search/search.css",
  "src/platform-ui/components/ui/switch/switch.css",
  "src/platform-ui/components/composite/modal/modal.css",
  "src/react/runner-chat.css",
  "src/react/thread/runner-thread.css",
  "src/platform-ui/components/ui/button/button.css",
  "src/platform-ui/components/ui/label/label.css",
]);

export function resolveRunnerChatStyleSourcePaths(packageRoot) {
  return RUNNER_CHAT_STYLE_SOURCE_PATHS.map((relativePath) => (
    path.resolve(packageRoot, relativePath)
  ));
}

export async function loadRunnerChatCssBundle(packageRoot) {
  const sources = await Promise.all(
    resolveRunnerChatStyleSourcePaths(packageRoot).map((sourcePath) => (
      fs.readFile(sourcePath, "utf8")
    )),
  );
  return sources.join("\n\n");
}
