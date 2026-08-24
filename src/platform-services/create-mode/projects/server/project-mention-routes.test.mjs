import assert from "node:assert/strict";
import { createProjectsRequestHandler } from "./routes.mjs";

const calls = [];
const record = (adapter) => (...args) => {
  calls.push({ adapter, args });
};
const handler = createProjectsRequestHandler({
  proxyAiosJsonRequest: record("aios"),
  proxyProjectResourceIndexGet: record("resource-index"),
  proxyUpstreamGet: record("get"),
  proxyUpstreamJsonRequest: record("json"),
  proxyUpstreamTaskJsonRequest: record("task"),
});

function dispatch(method, requestPath) {
  calls.length = 0;
  const request = { method, url: requestPath, headers: {} };
  const response = {};
  const handled = handler(
    request,
    response,
    new URL(requestPath, "http://localhost"),
  );
  assert.equal(handled, true);
  assert.equal(calls.length, 1);
  return calls[0];
}

let call = dispatch(
  "GET",
  "/api/real/projects/project%201/mention-candidates",
);
assert.equal(call.adapter, "get");
assert.equal(call.args[2], "/projects/project%201/mention-candidates");

call = dispatch(
  "POST",
  "/api/real/projects/project%201/activity/event%202/comments",
);
assert.equal(call.adapter, "json");
assert.equal(
  call.args[2],
  "/projects/project%201/activity/event%202/comments",
);
assert.equal(call.args[3], "POST");

call = dispatch(
  "POST",
  "/api/real/projects/project%201/updates/update%202/comments",
);
assert.equal(call.adapter, "json");
assert.equal(
  call.args[2],
  "/projects/project%201/updates/update%202/comments",
);
assert.equal(call.args[3], "POST");

for (const method of ["PATCH", "DELETE"]) {
  call = dispatch(
    method,
    "/api/real/projects/project%201/updates/update%202/comments/comment%203",
  );
  assert.equal(call.adapter, "json");
  assert.equal(
    call.args[2],
    "/projects/project%201/updates/update%202/comments/comment%203",
  );
  assert.equal(call.args[3], method);
}

call = dispatch(
  "PUT",
  "/api/real/projects/project%201/updates/update%202/reactions",
);
assert.equal(call.adapter, "json");
assert.equal(
  call.args[2],
  "/projects/project%201/updates/update%202/reactions",
);
assert.equal(call.args[3], "PUT");

