import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { createPlatformDevelopmentAssets } from "./platform-development-assets.mjs";

const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../..",
);
const viteOrigin = "http://127.0.0.1:5173";
const platformSources = {
  documentTemplate: `<!doctype html>
<html>
  <head>
    <link data-platform-compatibility-style />
    <link rel="stylesheet" href="/dist/platform-ui/components/composite/data-table/data-table.css" />
    <link rel="stylesheet" href="/dist/platform-ui/pages/styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" data-platform-compatibility-module></script>
  </body>
</html>`,
  styleSource: "body { color: white; }",
  moduleSource: `
    import { RunnerClient } from "/dist/index.js";
    window.RunnerClient = RunnerClient;
  `,
};

const assets = await createPlatformDevelopmentAssets(platformSources, {
  packageRoot,
  viteOrigin,
});

assert.match(assets.documentHtml, /\/@vite\/client/);
assert.match(assets.documentHtml, /\/@react-refresh/);
assert.match(assets.documentHtml, /RefreshRuntime\.injectIntoGlobalHook\(window\)/);
assert.match(
  assets.documentHtml,
  /window\.__vite_plugin_react_preamble_installed__ = true/,
);
assert.match(assets.documentHtml, /\/platform\/dev\/platform-legacy\.css/);
assert.match(assets.documentHtml, /\/platform\/dev\/platform-legacy\.js/);
assert.ok(
  assets.documentHtml.indexOf("/@react-refresh")
    < assets.documentHtml.indexOf("/platform/dev/platform-legacy.js"),
  "React Refresh preamble must run before the platform module.",
);
assert.doesNotMatch(assets.documentHtml, /data-platform-compatibility-style/);
assert.doesNotMatch(assets.documentHtml, /data-platform-compatibility-module/);
assert.doesNotMatch(assets.documentHtml, /window\.RunnerClient/);
assert.doesNotMatch(assets.documentHtml, /\/dist\/platform-ui\/[^"]+\.css/);
assert.match(
  assets.documentHtml,
  /\/@fs\/.*\/src\/platform-ui\/components\/composite\/data-table\/data-table\.css/,
);
assert.match(
  assets.documentHtml,
  /\/@fs\/.*\/src\/platform-ui\/components\/composite\/page-hero\/page-hero\.css/,
);
assert.match(
  assets.documentHtml,
  /\/@fs\/.*\/src\/platform-ui\/pages\/overview\/resource-overview\.css/,
);
assert.match(
  assets.documentHtml,
  /\/@fs\/.*\/src\/platform-resources\/agents\/detail\/agent-publish-control\.css/,
);

function createResponseRecorder() {
  return {
    status: 0,
    headers: {},
    body: Buffer.alloc(0),
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
    },
    end(body) {
      this.body = body ? Buffer.from(body) : Buffer.alloc(0);
    },
  };
}

const moduleResponse = createResponseRecorder();
assert.equal(
  assets.handleRequest(
    { method: "GET" },
    moduleResponse,
    new URL("http://localhost/platform/dev/platform-legacy.js"),
  ),
  true,
);
assert.equal(moduleResponse.status, 200);
assert.equal(moduleResponse.headers["Cache-Control"], "no-store");
assert.match(moduleResponse.body.toString("utf8"), /\/@fs\/.*\/src\/index\.ts/);

const headResponse = createResponseRecorder();
assert.equal(
  assets.handleRequest(
    { method: "HEAD" },
    headResponse,
    new URL("http://localhost/platform/dev/platform-legacy.css"),
  ),
  true,
);
assert.equal(headResponse.status, 200);
assert.equal(headResponse.body.byteLength, 0);

console.log("Platform development asset and source-rewrite contracts passed.");
