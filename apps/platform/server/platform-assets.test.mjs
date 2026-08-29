import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { brotliDecompressSync } from "node:zlib";

import {
  createLegacyPlatformApplicationSources,
} from "../client/legacy/create-legacy-platform-application.mjs";
import {
  createCloudCompatibilityDeploymentProfile,
} from "./deployment-profile-service.mjs";
import { createPlatformDocumentAssets } from "./platform-assets.mjs";

const assets = await createPlatformDocumentAssets({
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
assert.equal(assets.metrics.moduleGraphInputs, 1);
assert.equal(assets.metrics.moduleChunkCount, 0);
assert.deepEqual(assets.chunkPaths, []);
assert.match(assets.documentHtml, /rel="stylesheet" href="\/platform\/assets\/platform\.[a-f0-9]+\.css"/);
assert.match(assets.documentHtml, /rel="stylesheet"[^>]+fetchpriority="high"/);
assert.match(assets.documentHtml, /type="module"[^>]+fetchpriority="high"/);
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

const fixtureRoot = await mkdtemp(path.join(tmpdir(), "platform-assets-"));
try {
  await mkdir(path.join(fixtureRoot, "dist"), { recursive: true });
  await writeFile(
    path.join(fixtureRoot, "dist", "fixture.js"),
    'export const fixtureValue = "bundled";\n',
  );
  await writeFile(
    path.join(fixtureRoot, "dist", "lazy-fixture.js"),
    'export const lazyFixtureValue = "lazy-bundled";\n',
  );
  const bundledAssets = await createPlatformDocumentAssets(
    {
      documentTemplate: `<!doctype html>
<html>
  <head><link data-platform-style /></head>
  <body><div id="app"></div><script type="module" data-platform-module></script></body>
</html>`,
      styleSource: "body { color: white; }",
      moduleSource: `
        import { fixtureValue } from "/dist/fixture.js";
        console.log(fixtureValue);
        window.loadFixture = () => import("/dist/lazy-fixture.js");
      `,
    },
    {
      packageRoot: fixtureRoot,
    },
  );
  const bundledResult = (() => {
    const response = { status: 0, headers: {}, body: null };
    assert.equal(
      bundledAssets.handleRequest(
        { method: "GET", headers: { "accept-encoding": "br" } },
        {
          writeHead(status, headers) {
            response.status = status;
            response.headers = headers;
          },
          end(body) {
            response.body = body ?? null;
          },
        },
        new URL(bundledAssets.modulePath, "http://localhost"),
      ),
      true,
    );
    return response;
  })();
  const bundledModuleSource = brotliDecompressSync(
    bundledResult.body,
  ).toString("utf8");
  assert.equal(bundledAssets.metrics.moduleGraphInputs, 3);
  assert.equal(bundledAssets.metrics.moduleChunkCount, 1);
  assert.equal(bundledAssets.chunkPaths.length, 1);
  assert.match(bundledModuleSource, /"bundled"/);
  assert.match(bundledModuleSource, /console\.log\(/);
  assert.doesNotMatch(bundledModuleSource, /\/dist\/fixture\.js/);
  const chunkResponse = { status: 0, headers: {}, body: null };
  assert.equal(
    bundledAssets.handleRequest(
      { method: "GET", headers: { "accept-encoding": "br" } },
      {
        writeHead(status, headers) {
          chunkResponse.status = status;
          chunkResponse.headers = headers;
        },
        end(body) {
          chunkResponse.body = body ?? null;
        },
      },
      new URL(bundledAssets.chunkPaths[0], "http://localhost"),
    ),
    true,
  );
  assert.equal(chunkResponse.status, 200);
  assert.match(
    brotliDecompressSync(chunkResponse.body).toString("utf8"),
    /lazy-bundled/,
  );
} finally {
  await rm(fixtureRoot, { recursive: true, force: true });
}

const productionSources = createLegacyPlatformApplicationSources({
  aiosOrigin: "https://computer-agents.example",
  defaultUpstreamOrigin: "http://127.0.0.1:8080",
  deploymentProfileEnvelope: createCloudCompatibilityDeploymentProfile("prod"),
  identityProvider: "oidc",
  platformOrigin: "http://127.0.0.1:4177",
});
const productionAssets = await createPlatformDocumentAssets(productionSources, {
  packageRoot: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../.."),
});
assert.ok(productionAssets.metrics.moduleGraphInputs > 1);
assert.ok(productionAssets.metrics.moduleBytes > 0);

console.log("Platform document and immutable asset delivery contracts passed.");
