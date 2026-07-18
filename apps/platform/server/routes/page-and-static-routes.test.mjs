import assert from "node:assert/strict";

import { createPageAndStaticRoutes } from "./page-and-static-routes.mjs";

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

const handler = createPageAndStaticRoutes({
  platformDocumentHtml: "<!doctype html><div id=\"app\"></div>",
  platformOrigin: "http://localhost:4177",
  platformViteOrigin: "",
  isGithubApiRequestPath: () => false,
});

for (const pathname of ["/", "/compat", "/compat/"]) {
  const response = createResponseRecorder();
  const handled = handler(
    { method: "GET", headers: {} },
    response,
    new URL(pathname, "http://localhost:4177"),
  );

  assert.equal(handled, true, `${pathname} should be handled`);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers["Content-Type"], "text/html; charset=utf-8");
  assert.match(String(response.body), /id="app"/);
}

const headResponse = createResponseRecorder();
assert.equal(
  handler(
    { method: "HEAD", headers: {} },
    headResponse,
    new URL("http://localhost:4177/compat"),
  ),
  true,
);
assert.equal(headResponse.statusCode, 200);
assert.equal(headResponse.body, undefined);

console.log("Platform compatibility document route contracts passed.");
