import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createStaticAssetService } from "./static-assets.mjs";

function createResponseRecorder() {
  return {
    statusCode: 0,
    headers: {},
    body: undefined,
    writeHead(statusCode, headers = {}) {
      this.statusCode = statusCode;
      this.headers = headers;
    },
    end(body) {
      this.body = body;
    },
  };
}

const packageRoot = await fs.mkdtemp(path.join(os.tmpdir(), "platform-assets-"));
const distRoot = path.join(packageRoot, "dist");
const publicRoot = path.join(packageRoot, "public");
await fs.mkdir(distRoot, { recursive: true });
await fs.mkdir(publicRoot, { recursive: true });
await fs.writeFile(path.join(distRoot, "module.js"), "export const ready = true;\n");

try {
  const assets = createStaticAssetService({
    aiosPublicRoot: publicRoot,
    distRoot,
    packageRoot,
    port: 4177,
  });

  const getResponse = createResponseRecorder();
  await assets.serveDistAsset(
    { method: "GET", url: "/dist/module.js", headers: {} },
    getResponse,
  );
  assert.equal(getResponse.statusCode, 200);
  assert.equal(getResponse.headers["Content-Type"], "text/javascript; charset=utf-8");
  assert.match(String(getResponse.body), /ready = true/);

  const headResponse = createResponseRecorder();
  await assets.serveDistAsset(
    { method: "HEAD", url: "/dist/module.js", headers: {} },
    headResponse,
  );
  assert.equal(headResponse.statusCode, 200);
  assert.equal(headResponse.body, undefined);
  assert.equal(
    Number(headResponse.headers["Content-Length"]),
    Buffer.byteLength("export const ready = true;\n"),
  );

  const missingResponse = createResponseRecorder();
  await assets.serveDistAsset(
    { method: "GET", url: "/dist/not-present.js", headers: {} },
    missingResponse,
  );
  assert.equal(missingResponse.statusCode, 404);

  console.log("Platform static asset containment, MIME, and HEAD contracts passed.");
} finally {
  await fs.rm(packageRoot, { recursive: true, force: true });
}
