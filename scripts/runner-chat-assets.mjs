import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRunnerChatCssBundle } from "./runner-chat-style-sources.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, "..");
const generatedTsPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "thread-components",
  "styles",
  "thread-component-css.ts",
);
const distCssPath = path.join(packageRoot, "dist", "react", "runner-chat.css");
const platformAttachmentsCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "attachments",
  "attachments.css",
);
const distPlatformAttachmentsCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "attachments",
  "attachments.css",
);
const platformDataTableCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "data-table",
  "data-table.css",
);
const distPlatformComponentsDataTableCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "data-table",
  "data-table.css",
);
const platformDetailSidebarCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "detail-sidebar",
  "detail-sidebar.css",
);
const distPlatformDetailSidebarCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "detail-sidebar",
  "detail-sidebar.css",
);
const platformFloatingSidebarCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "floating-sidebar",
  "floating-sidebar.css",
);
const distPlatformFloatingSidebarCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "floating-sidebar",
  "floating-sidebar.css",
);
const platformVersionHistorySidebarCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "version-history-sidebar",
  "version-history-sidebar.css",
);
const distPlatformVersionHistorySidebarCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "version-history-sidebar",
  "version-history-sidebar.css",
);
const platformVersionSaveDialogCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "versioning",
  "version-save-dialog.css",
);
const distPlatformVersionSaveDialogCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "versioning",
  "version-save-dialog.css",
);
const platformDetailTabBarCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "detail-tab-bar",
  "detail-tab-bar.css",
);
const distPlatformDetailTabBarCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "detail-tab-bar",
  "detail-tab-bar.css",
);
const platformEmptyStateCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "empty-state",
  "empty-state.css",
);
const distPlatformEmptyStateCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "empty-state",
  "empty-state.css",
);
const platformLoadingStateCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "loading-state",
  "loading-state.css",
);
const distPlatformLoadingStateCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "loading-state",
  "loading-state.css",
);
const platformInstructionsEditorCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "instructions-editor",
  "instructions-editor.css",
);
const distPlatformInstructionsEditorCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "instructions-editor",
  "instructions-editor.css",
);
const platformAnalyticsCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "analytics",
  "analytics.css",
);
const distPlatformComponentsAnalyticsCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "analytics",
  "analytics.css",
);
const platformCodeEditorWorkspaceCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "code-editor-workspace",
  "code-editor-workspace.css",
);
const distPlatformCodeEditorWorkspaceCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "code-editor-workspace",
  "code-editor-workspace.css",
);
const platformCodePreviewBoxCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "code-preview-box",
  "code-preview-box.css",
);
const distPlatformCodePreviewBoxCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "code-preview-box",
  "code-preview-box.css",
);
const platformButtonCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "button",
  "button.css",
);
const distPlatformComponentsButtonCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "button",
  "button.css",
);
const platformIconButtonCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "icon-button",
  "icon-button.css",
);
const distPlatformComponentsIconButtonCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "icon-button",
  "icon-button.css",
);
const platformLabelCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "label",
  "label.css",
);
const distPlatformComponentsLabelCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "label",
  "label.css",
);
const platformVersionLabelCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "version-label",
  "version-label.css",
);
const distPlatformComponentsVersionLabelCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "version-label",
  "version-label.css",
);
const platformSearchCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "search",
  "search.css",
);
const distPlatformComponentsSearchCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "search",
  "search.css",
);
const platformSelectorCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "selector",
  "selector.css",
);
const distPlatformComponentsSelectorCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "selector",
  "selector.css",
);
const platformPopupCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "popup",
  "popup.css",
);
const distPlatformComponentsPopupCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "popup",
  "popup.css",
);
const platformSettingsSectionCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "settings-section",
  "settings-section.css",
);
const distPlatformSettingsSectionCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "settings-section",
  "settings-section.css",
);
const platformUiCardCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "ui-card",
  "ui-card.css",
);
const distPlatformUiCardCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "ui-card",
  "ui-card.css",
);
const platformPageHeroCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "page-hero",
  "page-hero.css",
);
const distPlatformPageHeroCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "page-hero",
  "page-hero.css",
);
const platformSwitchCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "ui",
  "switch",
  "switch.css",
);
const distPlatformComponentsSwitchCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "ui",
  "switch",
  "switch.css",
);
const platformModalCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "composite",
  "modal",
  "modal.css",
);
const distPlatformComponentsModalCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "components",
  "composite",
  "modal",
  "modal.css",
);
const platformGlobalSearchModalCssPath = path.join(
  packageRoot,
  "src",
  "platform-shell",
  "app-header",
  "global-search-modal",
  "global-search-modal.css",
);
const distPlatformGlobalSearchModalCssPath = path.join(
  packageRoot,
  "dist",
  "platform-shell",
  "app-header",
  "global-search-modal",
  "global-search-modal.css",
);
const platformHomePageCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "pages",
  "home",
  "platform-home.css",
);
const distPlatformHomePageCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "pages",
  "home",
  "platform-home.css",
);
const platformOverviewPageCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "pages",
  "overview",
  "resource-overview.css",
);
const distPlatformOverviewPageCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "pages",
  "overview",
  "resource-overview.css",
);
const platformDetailPageCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "pages",
  "details",
  "resource-detail.css",
);
const distPlatformDetailPageCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "pages",
  "details",
  "resource-detail.css",
);
const developServerDetailPageCssPath = path.join(
  packageRoot,
  "src",
  "platform-services",
  "develop-mode",
  "shared",
  "client",
  "page",
  "develop-server-detail-page.css",
);
const platformPermissionsPageCssPath = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "pages",
  "permissions",
  "permission-page.css",
);
const distPlatformPermissionsPageCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "pages",
  "permissions",
  "permission-page.css",
);
const agentDetailCssPath = path.join(
  packageRoot,
  "src",
  "platform-resources",
  "agents",
  "detail",
  "agent-publish-control.css",
);
const distPlatformPagesCssPath = path.join(
  packageRoot,
  "dist",
  "platform-ui",
  "pages",
  "styles.css",
);
const assetsSourceDir = path.join(
  packageRoot,
  "src",
  "platform-ui",
  "components",
  "thread-components",
  "assets",
);
const distAssetsDir = path.join(packageRoot, "dist", "react", "assets");

function serializeCssAsTs(cssText) {
  const escaped = cssText.replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
  return `// This file is generated from RunnerChat and shared platform component CSS by scripts/runner-chat-assets.mjs.\n// Edit the CSS sources instead of modifying this file directly.\n\nexport const runnerChatCss = String.raw\`${escaped}\`;\n`;
}

async function loadBundledCss() {
  return loadRunnerChatCssBundle(packageRoot);
}

async function prepare() {
  const cssText = await loadBundledCss();
  await fs.writeFile(generatedTsPath, serializeCssAsTs(cssText), "utf8");
}

async function copy() {
  const [
    cssText,
    platformAttachmentsCssText,
    platformDataTableCssText,
    platformDetailSidebarCssText,
    platformFloatingSidebarCssText,
    platformVersionHistorySidebarCssText,
    platformVersionSaveDialogCssText,
    platformDetailTabBarCssText,
    platformEmptyStateCssText,
    platformLoadingStateCssText,
    platformInstructionsEditorCssText,
    platformAnalyticsCssText,
    platformCodeEditorWorkspaceCssText,
    platformCodePreviewBoxCssText,
    platformButtonCssText,
    platformIconButtonCssText,
    platformLabelCssText,
    platformVersionLabelCssText,
    platformSearchCssText,
    platformSelectorCssText,
    platformPopupCssText,
    platformSettingsSectionCssText,
    platformUiCardCssText,
    platformPageHeroCssText,
    platformSwitchCssText,
    platformModalCssText,
    platformGlobalSearchModalCssText,
    platformHomePageCssText,
    platformOverviewPageCssText,
    platformDetailPageCssText,
    developServerDetailPageCssText,
    platformPermissionsPageCssText,
    agentDetailCssText,
  ] = await Promise.all([
    loadBundledCss(),
    fs.readFile(platformAttachmentsCssPath, "utf8"),
    fs.readFile(platformDataTableCssPath, "utf8"),
    fs.readFile(platformDetailSidebarCssPath, "utf8"),
    fs.readFile(platformFloatingSidebarCssPath, "utf8"),
    fs.readFile(platformVersionHistorySidebarCssPath, "utf8"),
    fs.readFile(platformVersionSaveDialogCssPath, "utf8"),
    fs.readFile(platformDetailTabBarCssPath, "utf8"),
    fs.readFile(platformEmptyStateCssPath, "utf8"),
    fs.readFile(platformLoadingStateCssPath, "utf8"),
    fs.readFile(platformInstructionsEditorCssPath, "utf8"),
    fs.readFile(platformAnalyticsCssPath, "utf8"),
    fs.readFile(platformCodeEditorWorkspaceCssPath, "utf8"),
    fs.readFile(platformCodePreviewBoxCssPath, "utf8"),
    fs.readFile(platformButtonCssPath, "utf8"),
    fs.readFile(platformIconButtonCssPath, "utf8"),
    fs.readFile(platformLabelCssPath, "utf8"),
    fs.readFile(platformVersionLabelCssPath, "utf8"),
    fs.readFile(platformSearchCssPath, "utf8"),
    fs.readFile(platformSelectorCssPath, "utf8"),
    fs.readFile(platformPopupCssPath, "utf8"),
    fs.readFile(platformSettingsSectionCssPath, "utf8"),
    fs.readFile(platformUiCardCssPath, "utf8"),
    fs.readFile(platformPageHeroCssPath, "utf8"),
    fs.readFile(platformSwitchCssPath, "utf8"),
    fs.readFile(platformModalCssPath, "utf8"),
    fs.readFile(platformGlobalSearchModalCssPath, "utf8"),
    fs.readFile(platformHomePageCssPath, "utf8"),
    fs.readFile(platformOverviewPageCssPath, "utf8"),
    fs.readFile(platformDetailPageCssPath, "utf8"),
    fs.readFile(developServerDetailPageCssPath, "utf8"),
    fs.readFile(platformPermissionsPageCssPath, "utf8"),
    fs.readFile(agentDetailCssPath, "utf8"),
  ]);
  await fs.mkdir(path.dirname(distCssPath), { recursive: true });
  await fs.writeFile(distCssPath, cssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformAttachmentsCssPath), { recursive: true });
  await fs.writeFile(distPlatformAttachmentsCssPath, platformAttachmentsCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsDataTableCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsDataTableCssPath, platformDataTableCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformDetailSidebarCssPath), { recursive: true });
  await fs.writeFile(distPlatformDetailSidebarCssPath, platformDetailSidebarCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformFloatingSidebarCssPath), { recursive: true });
  await fs.writeFile(distPlatformFloatingSidebarCssPath, platformFloatingSidebarCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformVersionHistorySidebarCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformVersionHistorySidebarCssPath,
    platformVersionHistorySidebarCssText,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformVersionSaveDialogCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformVersionSaveDialogCssPath,
    platformVersionSaveDialogCssText,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformDetailTabBarCssPath), { recursive: true });
  await fs.writeFile(distPlatformDetailTabBarCssPath, platformDetailTabBarCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformEmptyStateCssPath), { recursive: true });
  await fs.writeFile(distPlatformEmptyStateCssPath, platformEmptyStateCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformLoadingStateCssPath), { recursive: true });
  await fs.writeFile(distPlatformLoadingStateCssPath, platformLoadingStateCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformInstructionsEditorCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformInstructionsEditorCssPath,
    platformInstructionsEditorCssText,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformComponentsAnalyticsCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsAnalyticsCssPath, platformAnalyticsCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformCodeEditorWorkspaceCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformCodeEditorWorkspaceCssPath,
    platformCodeEditorWorkspaceCssText,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformCodePreviewBoxCssPath), { recursive: true });
  await fs.writeFile(distPlatformCodePreviewBoxCssPath, platformCodePreviewBoxCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsButtonCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsButtonCssPath, platformButtonCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsIconButtonCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsIconButtonCssPath, platformIconButtonCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsLabelCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsLabelCssPath, platformLabelCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsVersionLabelCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformComponentsVersionLabelCssPath,
    platformVersionLabelCssText,
    "utf8",
  );
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
  await fs.mkdir(path.dirname(distPlatformSettingsSectionCssPath), { recursive: true });
  await fs.writeFile(distPlatformSettingsSectionCssPath, platformSettingsSectionCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformUiCardCssPath), { recursive: true });
  await fs.writeFile(distPlatformUiCardCssPath, platformUiCardCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformPageHeroCssPath), { recursive: true });
  await fs.writeFile(distPlatformPageHeroCssPath, platformPageHeroCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsSwitchCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsSwitchCssPath, platformSwitchCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformComponentsModalCssPath), { recursive: true });
  await fs.writeFile(distPlatformComponentsModalCssPath, platformModalCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformGlobalSearchModalCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformGlobalSearchModalCssPath,
    `${platformLoadingStateCssText}\n\n${platformGlobalSearchModalCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformHomePageCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformHomePageCssPath,
    `${platformPageHeroCssText}\n\n${platformUiCardCssText}\n\n${platformHomePageCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformOverviewPageCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformOverviewPageCssPath,
    `${platformAnalyticsCssText}\n\n${platformEmptyStateCssText}\n\n${platformLoadingStateCssText}\n\n${platformPageHeroCssText}\n\n${platformUiCardCssText}\n\n${platformOverviewPageCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformDetailPageCssPath), { recursive: true });
  await fs.writeFile(distPlatformDetailPageCssPath, platformDetailPageCssText, "utf8");
  await fs.mkdir(path.dirname(distPlatformPermissionsPageCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformPermissionsPageCssPath,
    `${platformPopupCssText}\n\n${platformSelectorCssText}\n\n${platformDataTableCssText}\n\n${platformSettingsSectionCssText}\n\n${platformPermissionsPageCssText}`,
    "utf8",
  );
  await fs.mkdir(path.dirname(distPlatformPagesCssPath), { recursive: true });
  await fs.writeFile(
    distPlatformPagesCssPath,
    `${platformPopupCssText}\n\n${platformSelectorCssText}\n\n${platformAttachmentsCssText}\n\n${platformDataTableCssText}\n\n${platformAnalyticsCssText}\n\n${platformEmptyStateCssText}\n\n${platformLoadingStateCssText}\n\n${platformCodeEditorWorkspaceCssText}\n\n${platformCodePreviewBoxCssText}\n\n${platformPageHeroCssText}\n\n${platformUiCardCssText}\n\n${platformVersionLabelCssText}\n\n${platformHomePageCssText}\n\n${platformOverviewPageCssText}\n\n${platformDetailTabBarCssText}\n\n${platformDetailSidebarCssText}\n\n${platformFloatingSidebarCssText}\n\n${platformVersionHistorySidebarCssText}\n\n${platformVersionSaveDialogCssText}\n\n${platformInstructionsEditorCssText}\n\n${platformSettingsSectionCssText}\n\n${platformDetailPageCssText}\n\n${developServerDetailPageCssText}\n\n${platformPermissionsPageCssText}\n\n${agentDetailCssText}`,
    "utf8",
  );
  await fs.mkdir(distAssetsDir, { recursive: true });
  const assets = await fs.readdir(assetsSourceDir);
  await Promise.all(
    assets.map(async (assetName) => {
      await fs.copyFile(path.join(assetsSourceDir, assetName), path.join(distAssetsDir, assetName));
    }),
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
