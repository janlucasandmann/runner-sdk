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
  stockifiPlatformOrigin: "https://stockifi.example.test",
  isGenericConnectorApiRequestPath: () => false,
  isGithubApiRequestPath: () => false,
  isJiraApiRequestPath: () => false,
});

for (const [source, expected] of [
  ["http://localhost:4177/stockifi", "https://stockifi.example.test/"],
  ["http://localhost:4177/stockifi/", "https://stockifi.example.test/"],
  [
    "http://localhost:4177/stockifi/thread_1?source=hosted",
    "https://stockifi.example.test/thread_1?source=hosted",
  ],
]) {
  const response = createResponseRecorder();
  assert.equal(
    handler({ method: "GET", headers: {} }, response, new URL(source)),
    true,
  );
  assert.equal(response.statusCode, 307);
  assert.equal(response.headers.Location, expected);
  assert.equal(response.headers["Cache-Control"], "no-store");
}

for (const pathname of ["/", "/login", "/signup", "/logout"]) {
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

const rootResponse = createResponseRecorder();
assert.equal(
  handler(
    { method: "GET", headers: {} },
    rootResponse,
    new URL("http://localhost:4177/?thread=thread_1"),
  ),
  true,
);
assert.equal(rootResponse.statusCode, 200);
assert.match(String(rootResponse.body), /id="app"/);

const threadResponse = createResponseRecorder();
assert.equal(
  handler(
    { method: "GET", headers: {} },
    threadResponse,
    new URL("http://localhost:4177/thread_abc?source=email"),
  ),
  true,
);
assert.equal(threadResponse.statusCode, 308);
assert.equal(
  threadResponse.headers.Location,
  "http://localhost:4177/?thread=thread_abc&source=email",
);

for (const requestUrl of [
  "http://localhost:4177/compat",
  "http://localhost:4177/compat/",
  "http://localhost:4177/demo",
  "http://localhost:4177/platform-client/configure/agents?selected=1",
  "http://localhost:4177/create?thread=thread_1",
  "http://localhost:4177/configure/computers?selected=1",
  "http://localhost:4177/develop/databases?selected=1",
]) {
  const response = createResponseRecorder();
  assert.equal(
    handler(
      { method: "GET", headers: {} },
      response,
      new URL(requestUrl),
    ),
    true,
  );
  assert.equal(response.statusCode, 308);
  const sourceUrl = new URL(requestUrl);
  assert.equal(
    response.headers.Location,
    `http://localhost:4177/${sourceUrl.search}`,
  );
}

const headResponse = createResponseRecorder();
assert.equal(
  handler(
    { method: "HEAD", headers: {} },
    headResponse,
    new URL("http://localhost:4177/"),
  ),
  true,
);
assert.equal(headResponse.statusCode, 200);
assert.equal(headResponse.body, undefined);

console.log("Platform single-document route contracts passed.");
