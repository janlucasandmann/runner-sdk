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
  "src/platform-ui/components/composite/resource-action-modals/resource-action-modals.css",
  "src/platform-ui/components/composite/resource-header-actions/resource-header-actions.css",
  "src/platform-ui/components/ui/selector/selector.css",
  "src/platform-ui/components/ui/search/search.css",
  "src/platform-ui/components/ui/checkbox/checkbox.css",
  "src/platform-ui/components/ui/switch/switch.css",
  "src/platform-ui/components/ui/toggle/toggle.css",
  "src/platform-ui/components/composite/modal/modal.css",
  "src/platform-ui/components/composite/ui-card/ui-card.css",
  "src/platform-ui/components/composite/attachments/attachments.css",
  "src/platform-ui/components/composite/file-explorer/file-explorer.css",
  "src/platform-ui/components/composite/loading-state/loading-state.css",
  "src/react/runner-chat.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-core.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-resources.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-specialists.css",
  "src/platform-ui/components/thread-components/log-boxes/activity-output.css",
  "src/platform-ui/components/composite/connector-action-detail/connector-action-detail.css",
  "src/react/runner-chat/styles/message-and-attachments.css",
  "src/platform-ui/components/thread-components/document-preview/document-preview.css",
  "src/platform-resources/shared/connections/connection-identity-icon.css",
  "src/react/runner-chat/styles/composer.css",
  "src/react/runner-chat/styles/dialogs-and-file-browser.css",
  "src/react/thread/runner-thread.css",
  "src/platform-ui/components/composite/detail-tab-bar/detail-tab-bar.css",
  "src/platform-ui/components/thread-components/thread-screen/thread-screen.css",
  "src/platform-ui/components/ui/button/button.css",
  "src/platform-ui/components/ui/icon-button/icon-button.css",
  "src/platform-ui/components/ui/label/label.css",
  "src/platform-ui/components/ui/ticket-item/ticket-item.css",
  "src/platform-ui/components/ui/version-label/version-label.css",
]);

export function resolveRunnerChatStyleSourcePaths(packageRoot) {
  return RUNNER_CHAT_STYLE_SOURCE_PATHS.map((relativePath) =>
    path.resolve(packageRoot, relativePath),
  );
}

export async function loadRunnerChatCssBundle(packageRoot) {
  const sources = await Promise.all(
    resolveRunnerChatStyleSourcePaths(packageRoot).map((sourcePath) =>
      fs.readFile(sourcePath, "utf8"),
    ),
  );
  return sources.join("\n\n");
}
