import path from "node:path";

import { resolveLegacyBrowserSourcePath } from "./legacy-source-resolution.mjs";

/**
 * Source files concatenated into dist/platform-ui/pages/styles.css for
 * production. Development serves them individually so Vite can hot-update the
 * exact file being edited.
 */
export const PLATFORM_PAGE_STYLE_SOURCE_PATHS = Object.freeze([
  "src/platform-ui/components/composite/popup/popup.css",
  "src/platform-ui/components/ui/selector/selector.css",
  "src/platform-ui/components/composite/data-table/data-table.css",
  "src/platform-ui/components/composite/analytics/analytics.css",
  "src/platform-ui/components/composite/empty-state/empty-state.css",
  "src/platform-ui/components/composite/loading-state/loading-state.css",
  "src/platform-ui/components/composite/code-preview-box/code-preview-box.css",
  "src/platform-ui/components/composite/page-hero/page-hero.css",
  "src/platform-ui/components/composite/ui-card/ui-card.css",
  "src/platform-ui/pages/home/platform-home.css",
  "src/platform-ui/pages/overview/resource-overview.css",
  "src/platform-ui/components/composite/detail-tab-bar/detail-tab-bar.css",
  "src/platform-ui/components/composite/detail-sidebar/detail-sidebar.css",
  "src/platform-ui/components/composite/instructions-editor/instructions-editor.css",
  "src/platform-ui/components/composite/settings-section/settings-section.css",
  "src/platform-ui/pages/details/resource-detail.css",
  "src/platform-ui/pages/permissions/permission-page.css",
  "src/platform-resources/agents/detail/agent-publish-control.css",
]);

const AGGREGATE_STYLE_SOURCES = new Map([
  ["/dist/platform-ui/pages/styles.css", PLATFORM_PAGE_STYLE_SOURCE_PATHS],
]);

export function resolveDevelopmentStyleSourcePaths(packageRoot, specifier) {
  const cleanSpecifier = String(specifier || "").split("?")[0];
  const aggregateSources = AGGREGATE_STYLE_SOURCES.get(cleanSpecifier);
  if (aggregateSources) {
    return aggregateSources.map((relativePath) => path.resolve(packageRoot, relativePath));
  }
  const directSource = resolveLegacyBrowserSourcePath(packageRoot, cleanSpecifier);
  return directSource ? [directSource] : [];
}
