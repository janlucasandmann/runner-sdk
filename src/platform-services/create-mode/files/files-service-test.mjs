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
assert.match(FILES_DOMAIN_FRAGMENTS.inventory, /function buildPlaygroundEnvironmentTree/);
assert.match(FILES_DOMAIN_FRAGMENTS.transfer, /function createPlaygroundZipBlob/);
assert.match(FILES_DOMAIN_FRAGMENTS.filename, /function buildPlaygroundProtectedFilename/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /function PlaygroundFileIcon/);
assert.match(FILES_PREVIEW_COMPONENTS_SCRIPT, /function PlaygroundCodeEditorPreview/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function PlaygroundImageSelectionMaskOverlay/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function PlaygroundFilesPage/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /function renderFilesBrowserContent/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSwitch/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformSearch/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /React\.createElement\(PlatformButtonSelector/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /requestedAction === "create-file"/);
assert.match(FILES_PAGE_RUNTIME_SCRIPT, /lastHandledFilesNavigationActionTokenRef/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.playground-files-page/);
assert.match(FILES_STYLE_FRAGMENTS.foundation, /\.playground-files-browser[\s\S]*margin: 0;[\s\S]*border: 0;[\s\S]*border-radius: 0;/);
assert.match(FILES_STYLE_FRAGMENTS.preview, /\.playground-files-image-mask-overlay/);
assert.match(FILES_STYLE_FRAGMENTS.editor, /\.playground-code-preview-editor-shell/);
assert.match(FILES_STYLE_FRAGMENTS.responsive, /@media \(max-width: 980px\)[\s\S]*\.playground-files-shell/);

const platformEntrySource = await readPlatformCompositionSource();
assert.match(platformEntrySource, /from "\.\.\/\.\.\/\.\.\/src\/platform-services\/create-mode\/files\/index\.mjs"/);
assert.match(platformEntrySource, /filesService\.handleRequest\(req, res, url\)/);
assert.match(platformEntrySource, /\$\{FILES_PAGE_RUNTIME_SCRIPT\}/);
assert.match(platformEntrySource, /import \{ PlatformSearch \} from "\/dist\/platform-ui\/components\/ui\/search\/index\.js"/);
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
