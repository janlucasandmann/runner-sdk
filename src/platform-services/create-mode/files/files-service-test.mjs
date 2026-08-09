import assert from "node:assert/strict";
import fs from "node:fs/promises";

import {
  FILES_DOMAIN_FRAGMENTS,
  FILES_PAGE_RUNTIME_SCRIPT,
  FILES_PREVIEW_COMPONENTS_SCRIPT,
  FILES_STYLE_FRAGMENTS,
  createFilesService,
} from "./index.mjs";
import { createEnvironmentHtmlPreviewProxy } from "./server/html-preview.mjs";
import { readPlatformCompositionSource } from "../../../../apps/platform/testing/platform-composition-source.mjs";

assert.match(FILES_DOMAIN_FRAGMENTS.preview, /function getPlaygroundFileKind/);
assert.match(FILES_DOMAIN_FRAGMENTS.preview, /includeFolderMarkers/);
assert.match(FILES_DOMAIN_FRAGMENTS.preview, /pathParts\[pathParts\.length - 1\] === "\.gitkeep"/);
assert.match(FILES_DOMAIN_FRAGMENTS.inventory, /function buildPlaygroundEnvironmentTree/);
assert.match(FILES_DOMAIN_FRAGMENTS.transfer, /function createPlaygroundZipBlob/);
assert.match(FILES_DOMAIN_FRAGMENTS.filename, /function buildPlaygroundProtectedFilename/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /function PlaygroundFileIcon/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /function PlaygroundCodeEditorPreview/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /React\.createElement\(PlatformLoadingState/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function PlaygroundImageSelectionMaskOverlay/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function PlaygroundFilesPage/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function renderFilesBrowserContent/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSwitch/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /\{ value: "changes", label: "Activity" \}/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /\{ value: "connectors", label: "Connectors" \}/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /switchFilesEnvironmentMenuMode\("connectors", event\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /selectFileConnectorSource\(source\.id\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function selectFileConnectorAccount\(credentialId\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /toolbarPopover === "connector-account"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(ChevronRight, \{/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function renderFileConnectorsBrowser\(\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /fetchPlatformPluginFileSourceStatuses\(\{[\s\S]*organizationId: fileConnectorOrganizationId/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /connectorConnectionStatuses\?\.\[source\.id\]/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function normalizeKnownFileConnectorAccounts\(source, knownStatus\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /knownStatus\?\.credentials/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /fetchPlatformPluginFiles\(normalizedSourceId, folderId, \{/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /\.\.\.\(credentialId \? \{ credentialId \} : \{\}\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /return renderEntryRow\(row, \{/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /return renderGridItem\(entry, \{/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /isFilesMode \|\| isConnectorsMode[\s\S]*renderFilesLibraryHeader\(\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /connectorBrowserBreadcrumbs/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /playground-files-library-title-heading is-connector/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /playground-files-library-title-connector-icon/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /playground-files-library-title-connector-identity/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /playground-files-environment-menu-title/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /\+ " Filebase"/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /isChangesMode \? renderChangesFilterMenu\(\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSearch/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformButtonSelector/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /className: "tb-popup-row platform-instructions-editor__slash-option"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /className: "tb-popup-icon"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /className: "tb-popup-label"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /className: "platform-instructions-editor__slash-shortcut"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /"aria-keyshortcuts": "Meta\+N Control\+N"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function handleFilesCreateShortcut\(event\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /window\.addEventListener\("keydown", handleFilesCreateShortcut, true\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function getFileContextActionShortcut\(action\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /className: "platform-resource-actions-menu__shortcut"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /ariaKeyShortcuts: "Meta\+Alt\+S Control\+Alt\+S"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /ariaKeyShortcuts: "Meta\+Alt\+R Control\+Alt\+R"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /ariaKeyShortcuts: "Meta\+Alt\+Backspace Control\+Alt\+Backspace"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function handleFilesResourceActionShortcut\(event\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /window\.addEventListener\("keydown", handleFilesResourceActionShortcut, true\)/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /Start a new file here|Create in the current folder|Add files to this location/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSecondaryButton, \{\s*size: "small",\s*onClick: beginImageSelectionMode/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformPrimaryButton, \{\s*size: "small",\s*onClick: \(\) => void saveImageCropToActivePreview\(\)/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /React\.createElement\(PlatformPrimaryButton, \{\s*size: "small",\s*onClick: \(\) => void handleSave\(\)/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /React\.createElement\(Bookmark, \{ width: 13, height: 13/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /React\.createElement\(PlatformIconButton, \{\s*size: "small",\s*onClick: handleEditorUndo/);
assert.doesNotMatch(FILES_PREVIEW_COMPONENTS_SCRIPT, /playground-code-preview-header-save-button/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformIconButton, \{[\s\S]*?Undo selection stroke/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /playground-files-(?:preview-select|image-selection)-button/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /popupVariant: "minimal"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /popupVariant: options\.popupVariant === "default" \? "default" : "minimal"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformPopup, \{/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /variant: "minimal"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /placement: "bottom-end"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /placement: contextMenu\.placement \|\| "bottom-start"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /pointerAnchor: Boolean\(options\.pointerAnchor\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /anchorPoint: \{ x: event\.clientX, y: event\.clientY \}/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function handleVisibleEntriesCheckboxToggle\(entries, event\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /className: "playground-files-select-all-checkbox"/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /surfaceClassName: "playground-files-environment-actions-menu"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function renderEnvironmentActionsControl\(\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /portalAnchorPoint: contextMenu\.anchorPoint/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /style: isMinimalContextMenu \? \{ zIndex: 10059 \} : undefined/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /hideEnvironmentSelector: true/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformResourceShareModal, \{/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /selectionMode: "multiple"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /selectedTeamIds: fileTeamPickerValues/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /Promise\.allSettled\(normalizedTeamIds\.map/);
assert.doesNotMatch(FILES_PAGE_RUNTIME_SCRIPT, /const composerEnvironments/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /requestedAction === "create-file"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /lastHandledFilesNavigationActionTokenRef/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.playground-files-page/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.playground-files-library-title-connector-icon\s*\{[\s\S]*height: 1em;[\s\S]*max-height: 1em;/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.playground-files-browser[\s\S]*margin: 0;[\s\S]*border: 0;[\s\S]*border-radius: 0;/);
assert.match(FILES_STYLE_FRAGMENTS.content, /\.playground-files-page \.playground-files-browser-body\.is-changes-view\s*\{[\s\S]*width: 100%;[\s\S]*max-width: none;[\s\S]*padding: 0;/);
assert.match(FILES_STYLE_FRAGMENTS.content, /\.playground-files-grid\s*\{[\s\S]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/);
assert.doesNotMatch(FILES_STYLE_FRAGMENTS.content, /\.playground-files-page \.playground-files-browser-body\.is-connectors-view\s*\{[\s\S]*width: 100%;[\s\S]*max-width: none;[\s\S]*padding: 0;/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /variant: "minimal",\s*animation: "down-in",\s*className: "playground-files-environment-menu playground-files-environment-scope-menu"/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /\.playground-files-image-mask-overlay/);
assert.match(FILES_STYLE_FRAGMENTS.contextMenu, /\.playground-files-context-divider\s*\{[\s\S]*?margin: 0;/);
assert.doesNotMatch(FILES_STYLE_FRAGMENTS.editor, /\.playground-code-preview-header-save-button/);
assert.doesNotMatch(FILES_STYLE_FRAGMENTS.toolbar, /\.playground-files-toolbar-menu-item-shortcut\s*\{/);
assert.match(FILES_STYLE_FRAGMENTS.toolbar, /\.playground-files-unified-navbar \.playground-files-inline-selector\s*\{[\s\S]*font-size: 14px;[\s\S]*font-weight: 400;/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /\.playground-files-preview \.tb-attachment-preview-drawer-action\s*\{/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /\.playground-files-preview \.tb-attachment-preview-drawer-action-icon\s*\{/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /> \.playground-files-preview \{[\s\S]*z-index: 10050;/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /\.playground-files-shell\.has-preview \.playground-files-preview::after\s*\{[\s\S]*top: var\(--playground-files-preview-nav-height, 56px\);[\s\S]*background: rgba\(255, 255, 255, 0\.075\);/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /\.playground-files-preview[\s\S]*\.tb-attachment-preview-drawer-header-actions,[\s\S]*opacity: 1;[\s\S]*visibility: visible;/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.tb-attachment-preview-drawer-header\s*\{[\s\S]*border-bottom: 1px solid rgba\(255, 255, 255, 0\.075\);/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.tb-attachment-preview-drawer-name\s*\{[\s\S]*font-size: 14px;/);
assert.match(FILES_STYLE_FRAGMENTS.chat, /\.playground-files-presentation-preview-header\s*\{[\s\S]*border-bottom: 1px solid rgba\(255, 255, 255, 0\.075\);/);
assert.match(FILES_STYLE_FRAGMENTS.editor, /\.playground-code-preview-editor-shell/);
assert.match(FILES_STYLE_FRAGMENTS.responsive, /@media \(max-width: 980px\)[\s\S]*\.playground-files-shell/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/files\/index\.mjs"/);
assert.match(platformEntrySource, /filesService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{FILES_PAGE_RUNTIME_SCRIPT\}/);
assert.match(platformEntrySource, /import \{ PlatformSearch \} from "\/dist\/platform-ui\/components\/ui\/search\/index\.js"/);
assert.match(platformEntrySource, /import \{ PlatformCheckbox \} from "\/dist\/platform-ui\/components\/ui\/checkbox\/index\.js"/);
assert.match(platformEntrySource, /import \{ PlatformResourceShareModal \} from "\/dist\/platform-ui\/components\/composite\/resource-action-modals\/index\.js"/);
assert.match(platformEntrySource, /React\.createElement\(PlatformActivityOverview, \{/);
assert.match(platformEntrySource, /id: "environment-change:" \+ record\.id/);
assert.match(platformEntrySource, /Loading environment activity\.\.\./);
assert.match(platformEntrySource, /className: "playground-files-activity-timeline"/);
assert.match(platformEntrySource, /layout: "inspector"/);
assert.match(platformEntrySource, /titleActions: activityTimelineTitleActions/);
assert.match(platformEntrySource, /headerActions: React\.createElement\(PlatformSearch/);
assert.match(platformEntrySource, /listFooter: activityTimelineListFooter/);
assert.match(platformEntrySource, /onSelectedItemChange: handleActivityTimelineSelection/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function handleEntryCheckboxToggle\(entry, event\)/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformCheckbox, \{/);
assert.ok(FILES_PAGE_RUNTIME_SCRIPT.includes("event?.target?.closest?.('[data-platform-checkbox=\"true\"]')"));
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /showSelection: false/);
assert.match(platformEntrySource, /const activityTimelineListFooter = hasMore[\s\S]*React\.createElement\(PlatformSecondaryButton/);
assert.doesNotMatch(platformEntrySource, /trailing: record\.change\.projectName \|\| record\.actorName/);
assert.doesNotMatch(platformEntrySource, /^\s*function PlaygroundFilesPage/m);
assert.doesNotMatch(platformEntrySource, /^\s*function PlaygroundFileIcon/m);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-files-page\s*\{/m);
assert.doesNotMatch(platformEntrySource, /^\s*\.playground-files-shell\s*\{/m);
assert.doesNotMatch(platformEntrySource, /const environmentFilesUploadMatch/);
assert.doesNotMatch(platformEntrySource, /const serverFilesMatch/);
assert.doesNotMatch(platformEntrySource, /async function proxyEnvironmentHtmlPreview/);

const calls = [];
const baseAdapters = {
  fetchAiosApi: async () => ({ ok: true, status: 200, text: async () => "" }),
  fetchAiosCloud: async () => ({ ok: true, status: 200, text: async () => "" }),
  hasAiosSession: () => false,
  inferProxyContentTypeFromPath: (filePath) => filePath.endsWith(".png") ? "image/png" : "text/plain",
  isUnauthorizedHttpStatus: (status) => status === 401 || status === 403,
  parseUpstreamUrl: () => "https://api.example.test/v1",
  proxyUpstreamBinaryGet: (...args) => calls.push({ adapter: "binary", args }),
  proxyUpstreamGet: (...args) => calls.push({ adapter: "get", args }),
  proxyUpstreamJsonRequest: (...args) => calls.push({ adapter: "json", args }),
  proxyUpstreamRawRequest: (...args) => calls.push({ adapter: "raw", args }),
  readOptionalApiKey: () => "",
  sendJson: (...args) => calls.push({ adapter: "sendJson", args }),
  withProxyOrganizationHeader: (_req, _options, headers) => headers,
};
const filesService = createFilesService(baseAdapters);

function dispatch(method, pathname) {
  calls.length = 0;
  const req = { method, url: pathname, headers: {} };
  const res = {};
  const handled = filesService.handleRequest(req, res, new URL(pathname, "http://localhost"));
  return { handled, call: calls[0] };
}

let result = dispatch("GET", "/api/real/environments/environment%201/files?path=src&depth=1");
assert.equal(result.handled, true);
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/environments/environment%201/files");

result = dispatch("POST", "/api/real/environments/environment_1/files/upload");
assert.equal(result.call.adapter, "raw");
assert.equal(result.call.args[2], "/environments/environment_1/files/upload");
assert.equal(result.call.args[3], "POST");

result = dispatch("POST", "/api/real/environments/environment_1/files/mkdir");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/environments/environment_1/files/mkdir");

result = dispatch("GET", "/api/real/environments/environment_1/files/thumbnail/assets/logo.png?w=64");
assert.equal(result.call.adapter, "binary");
assert.equal(result.call.args[2], "/environments/environment_1/files/thumbnail/assets/logo.png");
assert.deepEqual(result.call.args[3], { contentType: "image/webp" });

result = dispatch("GET", "/api/real/environments/environment_1/files/download/readme.txt");
assert.equal(result.call.adapter, "binary");
assert.deepEqual(result.call.args[3], { contentType: "text/plain" });

result = dispatch("DELETE", "/api/real/environments/environment_1/files/a%20folder/file.txt");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/environments/environment_1/files/a%20folder/file.txt");
assert.equal(result.call.args[3], "DELETE");

result = dispatch("GET", "/api/real/servers/server%201/files");
assert.equal(result.call.adapter, "get");
assert.equal(result.call.args[2], "/servers/server%201/files");

result = dispatch("PUT", "/api/real/servers/server_1/files/content/src/index.js");
assert.equal(result.call.adapter, "json");
assert.equal(result.call.args[2], "/servers/server_1/files/content/src/index.js");
assert.equal(result.call.args[3], "PUT");

result = dispatch("GET", "/api/real/attachments/attachment%201");
assert.equal(result.call.adapter, "binary");
assert.equal(result.call.args[2], "/attachments/attachment%201");

result = dispatch("GET", "/api/real/environments");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

result = dispatch("GET", "/api/real/projects/project_1");
assert.equal(result.handled, false);
assert.equal(result.call, undefined);

const previewResponses = [];
const proxyHtmlPreview = createEnvironmentHtmlPreviewProxy({
  ...baseAdapters,
  readOptionalApiKey: () => "test-key",
  fetchImpl: async () => ({
    ok: true,
    status: 200,
    text: async () => "<html><head><title>Preview</title></head><body>Ready</body></html>",
  }),
});
await proxyHtmlPreview(
  { url: "/api/real/environments/environment_1/files/preview-html/site/index.html", headers: {} },
  {
    writeHead: (status, headers) => previewResponses.push({ status, headers }),
    end: (body) => previewResponses.push({ body }),
  },
  "environment_1",
  "site/index.html",
);
assert.equal(previewResponses[0].status, 200);
assert.match(previewResponses[1].body, /<base href="http:\/\/localhost:4177\/api\/real\/environments\/environment_1\/files\/download\/site\/" \/>/);

assert.throws(
  () => createFilesService({}),
  /fetchAiosApi adapter/,
);

console.log("Files service module, composition, preview, and route contracts passed.");
