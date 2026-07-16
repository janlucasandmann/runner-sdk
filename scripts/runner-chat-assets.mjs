import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const cssPath = path.join(packageRoot, "src", "react", "runner-chat.css");
const threadCssPath = path.join(packageRoot, "src", "react", "thread", "runner-thread.css");
const generatedTsPath = path.join(packageRoot, "src", "react", "runner-chat-css.ts");
const distCssPath = path.join(packageRoot, "dist", "react", "runner-chat.css");
const platformDataTableCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "data-table", "data-table.css");
const distPlatformComponentsDataTableCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "data-table", "data-table.css");
const platformDetailSidebarCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "detail-sidebar", "detail-sidebar.css");
const distPlatformDetailSidebarCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "detail-sidebar", "detail-sidebar.css");
const platformDetailTabBarCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "detail-tab-bar", "detail-tab-bar.css");
const distPlatformDetailTabBarCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "detail-tab-bar", "detail-tab-bar.css");
const platformEmptyStateCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "empty-state", "empty-state.css");
const distPlatformEmptyStateCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "empty-state", "empty-state.css");
const platformInstructionsEditorCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "instructions-editor", "instructions-editor.css");
const distPlatformInstructionsEditorCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "instructions-editor", "instructions-editor.css");
const platformAnalyticsCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "analytics", "analytics.css");
const distPlatformComponentsAnalyticsCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "analytics", "analytics.css");
const platformCodePreviewBoxCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "code-preview-box", "code-preview-box.css");
const distPlatformCodePreviewBoxCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "code-preview-box", "code-preview-box.css");
const platformButtonCssPath = path.join(packageRoot, "src", "platform-ui", "components", "ui", "button", "button.css");
const distPlatformComponentsButtonCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "ui", "button", "button.css");
const platformLabelCssPath = path.join(packageRoot, "src", "platform-ui", "components", "ui", "label", "label.css");
const distPlatformComponentsLabelCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "ui", "label", "label.css");
const platformSearchCssPath = path.join(packageRoot, "src", "platform-ui", "components", "ui", "search", "search.css");
const distPlatformComponentsSearchCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "ui", "search", "search.css");
const platformSelectorCssPath = path.join(packageRoot, "src", "platform-ui", "components", "ui", "selector", "selector.css");
const distPlatformComponentsSelectorCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "ui", "selector", "selector.css");
const platformPopupCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "popup", "popup.css");
const distPlatformComponentsPopupCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "popup", "popup.css");
const platformSwitchCssPath = path.join(packageRoot, "src", "platform-ui", "components", "ui", "switch", "switch.css");
const distPlatformComponentsSwitchCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "ui", "switch", "switch.css");
const platformModalCssPath = path.join(packageRoot, "src", "platform-ui", "components", "composite", "modal", "modal.css");
const distPlatformComponentsModalCssPath = path.join(packageRoot, "dist", "platform-ui", "components", "composite", "modal", "modal.css");
const platformOverviewPageCssPath = path.join(packageRoot, "src", "platform-ui", "pages", "overview", "resource-overview.css");
const distPlatformOverviewPageCssPath = path.join(packageRoot, "dist", "platform-ui", "pages", "overview", "resource-overview.css");
const platformDetailPageCssPath = path.join(packageRoot, "src", "platform-ui", "pages", "details", "resource-detail.css");
const distPlatformDetailPageCssPath = path.join(packageRoot, "dist", "platform-ui", "pages", "details", "resource-detail.css");
const platformPermissionsPageCssPath = path.join(packageRoot, "src", "platform-ui", "pages", "permissions", "permission-page.css");
const distPlatformPermissionsPageCssPath = path.join(packageRoot, "dist", "platform-ui", "pages", "permissions", "permission-page.css");
const agentDetailCssPath = path.join(packageRoot, "src", "platform-resources", "agents", "detail", "agent-publish-control.css");
const distPlatformPagesCssPath = path.join(packageRoot, "dist", "platform-ui", "pages", "styles.css");
const assetsSourceDir = path.join(packageRoot, "src", "react", "assets");
const distAssetsDir = path.join(packageRoot, "dist", "react", "assets");
const bundledDiffCssPath = path.join(packageRoot, "node_modules", "@git-diff-view", "react", "styles", "diff-view-pure.css");

function serializeCssAsTs(cssText) {
  const escaped = cssText.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `// This file is generated from RunnerChat and shared platform component CSS by scripts/runner-chat-assets.mjs.\n// Edit the CSS sources instead of modifying this file directly.\n\nexport const runnerChatCss = String.raw\`${escaped}\`;\n`;
}

async function loadBundledCss() {
  const [baseCssText, threadCssText, diffCssText, buttonCssText, labelCssText, searchCssText, selectorCssText, popupCssText, switchCssText, modalCssText] = await Promise.all([
    fs.readFile(cssPath, "utf8"),
    fs.readFile(threadCssPath, "utf8"),
    fs.readFile(bundledDiffCssPath, "utf8"),
    fs.readFile(platformButtonCssPath, "utf8"),
    fs.readFile(platformLabelCssPath, "utf8"),
    fs.readFile(platformSearchCssPath, "utf8"),
    fs.readFile(platformSelectorCssPath, "utf8"),
    fs.readFile(platformPopupCssPath, "utf8"),
    fs.readFile(platformSwitchCssPath, "utf8"),
    fs.readFile(platformModalCssPath, "utf8"),
  ]);
  return `${diffCssText}\n\n${popupCssText}\n\n${selectorCssText}\n\n${searchCssText}\n\n${switchCssText}\n\n${modalCssText}\n\n${baseCssText}\n\n${threadCssText}\n\n${buttonCssText}\n\n${labelCssText}`;
}

async function prepare() {
  const cssText = await loadBundledCss();
  await fs.writeFile(generatedTsPath, serializeCssAsTs(cssText), "utf8");
}

async function copy() {
  const [cssText, platformDataTableCssText, platformDetailSidebarCssText, platformDetailTabBarCssText, platformEmptyStateCssText, platformInstructionsEditorCssText, platformAnalyticsCssText, platformCodePreviewBoxCssText, platformButtonCssText, platformLabelCssText, platformSearchCssText, platformSelectorCssText, platformPopupCssText, platformSwitchCssText, platformModalCssText, platformOverviewPageCssText, platformDetailPageCssText, platformPermissionsPageCssText, agentDetailCssText] = await Promise.all([
    loadBundledCss(),
    fs.readFile(platformDataTableCssPath, "utf8"),
    fs.readFile(platformDetailSidebarCssPath, "utf8"),
    fs.readFile(platformDetailTabBarCssPath, "utf8"),
    fs.readFile(platformEmptyStateCssPath, "utf8"),
    fs.readFile(platformInstructionsEditorCssPath, "utf8"),
    fs.readFile(platformAnalyticsCssPath, "utf8"),
    fs.readFile(platformCodePreviewBoxCssPath, "utf8"),
    fs.readFile(platformButtonCssPath, "utf8"),
    fs.readFile(platformLabelCssPath, "utf8"),
    fs.readFile(platformSearchCssPath, "utf8"),
    fs.readFile(platformSelectorCssPath, "utf8"),
    fs.readFile(platformPopupCssPath, "utf8"),
    fs.readFile(platformSwitchCssPath, "utf8"),
    fs.readFile(platformModalCssPath, "utf8"),
    fs.readFile(platformOverviewPageCssPath, "utf8"),
    fs.readFile(platformDetailPageCssPath, "utf8"),
    fs.readFile(platformPermissionsPageCssPath, "utf8"),
    fs.readFile(agentDetailCssPath, "utf8"),
  ]);
  await fs.mkdir(path.dirname(distCssPath), { recursive: true });
  await fs.writeFile(distCssPath, cssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsDataTableCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsDataTableCssPath, platformDataTableCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformDetailSidebarCssPath), { recursive: true });
  await fs.writeFile(distPlatformDetailSidebarCssPath, platformDetailSidebarCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformDetailTabBarCssPath), { recursive: true });
  await fs.writeFile(distPlatformDetailTabBarCssPath, platformDetailTabBarCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformEmptyStateCssPath), { recursive: true });
  await fs.writeFile(distPlatformEmptyStateCssPath, platformEmptyStateCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformInstructionsEditorCssPath), { recursive: true });
  await fs.writeFile(distPlatformInstructionsEditorCssPath, platformInstructionsEditorCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsAnalyticsCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsAnalyticsCssPath, platformAnalyticsCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformCodePreviewBoxCssPath), { recursive: true });
  await fs.writeFile(distPlatformCodePreviewBoxCssPath, platformCodePreviewBoxCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsButtonCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsButtonCssPath, platformButtonCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsLabelCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsLabelCssPath, platformLabelCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsSearchCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsSearchCssPath, platformSearchCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsSelectorCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformComponentsSelectorCssPath,
    `${platformPopupCssText}\n\n${platformSelectorCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformComponentsPopupCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsPopupCssPath, platformPopupCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsSwitchCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsSwitchCssPath, platformSwitchCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsModalCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsModalCssPath, platformModalCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformOverviewPageCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformOverviewPageCssPath,
    `${platformAnalyticsCssText}\n\n${platformEmptyStateCssText}\n\n${platformOverviewPageCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformDetailPageCssPath), { recursive: true });
  await fs.writeFile(distPlatformDetailPageCssPath, platformDetailPageCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformPermissionsPageCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformPermissionsPageCssPath,
    `${platformPopupCssText}\n\n${platformSelectorCssText}\n\n${platformDataTableCssText}\n\n${platformPermissionsPageCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformPagesCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformPagesCssPath,
    `${platformPopupCssText}\n\n${platformSelectorCssText}\n\n${platformDataTableCssText}\n\n${platformAnalyticsCssText}\n\n${platformEmptyStateCssText}\n\n${platformCodePreviewBoxCssText}\n\n${platformOverviewPageCssText}\n\n${platformDetailTabBarCssText}\n\n${platformDetailSidebarCssText}\n\n${platformInstructionsEditorCssText}\n\n${platformDetailPageCssText}\n\n${platformPermissionsPageCssText}\n\n${agentDetailCssText}`,
    "utf8",
  );
  await fs.mkdir(distAssetsDir, { recursive: true });
  const assets = await fs.readdir(assetsSourceDir);
  await Promise.all(
    assets.map(async (assetName) => {
      await fs.copyFile(path.join(assetsSourceDir, assetName), path.join(distAssetsDir, assetName));
    })
  );
}

const mode = process.argv[2];

if (mode === "prepare") {
  await prepare();
} else if (mode === "copy") {
  await copy();
} else {
  throw new Error(`Unknown mode: ${mode || "<empty>"}. Use "prepare" or "copy".`);
}
