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
    <link data-platform-style />
    <link rel="stylesheet" href="/dist/platform-ui/components/composite/data-table/data-table.css" />
    <link rel="stylesheet" href="/dist/platform-ui/pages/styles.css" />
  </head>
  <body>
    <div id="app"></div>
    <script type="module" data-platform-module></script>
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

assert.ok(assets.metrics.moduleBrotliBytes > 0);
assert.ok(assets.metrics.cssBrotliBytes > 0);

assert.match(assets.documentHtml, /\/@vite\/client/);
assert.match(assets.documentHtml, /\/@react-refresh/);
assert.match(assets.documentHtml, /RefreshRuntime\.injectIntoGlobalHook\(window\)/);
assert.match(
  assets.documentHtml,
  /window\.__vite_plugin_react_preamble_installed__ = true/,
);
assert.match(assets.documentHtml, /\/platform\/dev\/platform\.css/);
assert.match(assets.documentHtml, /\/platform\/dev\/platform\.js/);
assert.match(assets.documentHtml, /rel="stylesheet"[^>]+fetchpriority="high"/);
assert.match(assets.documentHtml, /type="module"[^>]+fetchpriority="high"/);
assert.ok(
  assets.documentHtml.indexOf("/@react-refresh")
    < assets.documentHtml.indexOf("/platform/dev/platform.js"),
  "React Refresh preamble must run before the platform module.",
);
assert.doesNotMatch(assets.documentHtml, /data-platform-style/);
assert.doesNotMatch(assets.documentHtml, /data-platform-module/);
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
assert.equal(
  (
    assets.documentHtml.match(
      /\/src\/platform-ui\/components\/composite\/data-table\/data-table\.css/g,
    ) || []
  ).length,
  1,
  "Development styles shared by direct and aggregate entries must be emitted once.",
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
    { method: "GET", headers: {} },
    moduleResponse,
    new URL("http://localhost/platform/dev/platform.js"),
  ),
  true,
);
assert.equal(moduleResponse.status, 200);
assert.equal(moduleResponse.headers["Cache-Control"], "no-cache");
assert.ok(moduleResponse.headers.ETag);
assert.match(moduleResponse.body.toString("utf8"), /\/@fs\/.*\/src\/index\.ts/);
assert.ok(
  moduleResponse.body.toString("utf8").split("\n").length <= 4,
  "The development entry must stay minified so reloads do not repeatedly parse the raw legacy source.",
);
assert.match(
  moduleResponse.body.toString("utf8"),
  /sourceMappingURL=\/platform\/dev\/platform\.js\.map/,
);

const cachedModuleResponse = createResponseRecorder();
assert.equal(
  assets.handleRequest(
    {
      method: "GET",
      headers: { "if-none-match": moduleResponse.headers.ETag },
    },
    cachedModuleResponse,
    new URL("http://localhost/platform/dev/platform.js"),
  ),
  true,
);
assert.equal(cachedModuleResponse.status, 304);
assert.equal(cachedModuleResponse.body.byteLength, 0);

const moduleMapResponse = createResponseRecorder();
assert.equal(
  assets.handleRequest(
    { method: "GET", headers: {} },
    moduleMapResponse,
    new URL("http://localhost/platform/dev/platform.js.map"),
  ),
  true,
);
assert.equal(moduleMapResponse.status, 200);
assert.equal(moduleMapResponse.headers["Content-Encoding"], undefined);
assert.doesNotThrow(() => JSON.parse(moduleMapResponse.body.toString("utf8")));

const headResponse = createResponseRecorder();
assert.equal(
  assets.handleRequest(
    { method: "HEAD", headers: {} },
    headResponse,
    new URL("http://localhost/platform/dev/platform.css"),
  ),
  true,
);
assert.equal(headResponse.status, 200);
assert.equal(headResponse.body.byteLength, 0);

console.log("Platform development asset and source-rewrite contracts passed.");
