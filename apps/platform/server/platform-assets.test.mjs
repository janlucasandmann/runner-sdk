import assert from "node:assert/strict";
import { brotliDecompressSync } from "node:zlib";

import { createPlatformDocumentAssets } from "./platform-assets.mjs";

const assets = createPlatformDocumentAssets({
  documentTemplate: `<!doctype html>
<html>
  <head><link data-platform-style /></head>
  <body><div id="app"></div><script type="module" data-platform-module></script></body>
</html>`,
  styleSource: "body { color: white; }",
  moduleSource: 'console.log("platform");',
});

assert.ok(assets.metrics.documentBytes > 0);
assert.ok(assets.metrics.cssBytes > 0);
assert.ok(assets.metrics.moduleBytes > 0);
assert.match(assets.documentHtml, /rel="stylesheet" href="\/platform\/assets\/platform\.[a-f0-9]+\.css"/);
assert.match(assets.documentHtml, /type="module" src="\/platform\/assets\/platform\.[a-f0-9]+\.js"/);
assert.doesNotMatch(assets.documentHtml, /data-platform-style/);
assert.doesNotMatch(assets.documentHtml, /data-platform-module/);
assert.doesNotMatch(assets.documentHtml, /console\.log\("platform"\)/);

function request(pathname, { method = "GET", headers = {} } = {}) {
  const result = { status: 0, headers: {}, body: null };
  const handled = assets.handleRequest(
    { method, headers },
    {
      writeHead(status, responseHeaders) {
        result.status = status;
        result.headers = responseHeaders;
      },
      end(body) {
        result.body = body ?? null;
      },
    },
    new URL(pathname, "http://localhost"),
  );
  return { handled, ...result };
}

let result = request(assets.modulePath, { headers: { "accept-encoding": "br, gzip" } });
assert.equal(result.handled, true);
assert.equal(result.status, 200);
assert.equal(result.headers["Content-Encoding"], "br");
assert.equal(brotliDecompressSync(result.body).toString("utf8").trim(), 'console.log("platform");');
assert.match(result.headers["Cache-Control"], /immutable/);
assert.equal(result.headers.Vary, "Accept-Encoding");

result = request(assets.cssPath, { method: "HEAD" });
assert.equal(result.status, 200);
assert.equal(result.body, null);
assert.equal(result.headers["Content-Type"], "text/css; charset=utf-8");

result = request(assets.cssPath, { headers: { "if-none-match": result.headers.ETag } });
assert.equal(result.status, 304);

assert.equal(request("/platform/assets/missing.js").handled, false);

console.log("Platform document and immutable asset delivery contracts passed.");
