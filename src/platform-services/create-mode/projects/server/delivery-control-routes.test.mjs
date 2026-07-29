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
  const req = { method, url: requestPath, headers: {} };
  const res = {};
  const handled = handler(req, res, new URL(requestPath, "http://localhost"));
  assert.equal(handled, true);
  assert.equal(calls.length, 1);
  return calls[0];
}

let call = dispatch(
  "POST",
  "/api/real/projects/project%201/delivery-design/preview",
);
assert.equal(call.adapter, "json");
assert.equal(
  call.args[2],
  "/projects/project%201/delivery-design/preview",
);
assert.equal(call.args[3], "POST");

call = dispatch("GET", "/api/real/projects/project%201/delivery-design");
assert.equal(call.adapter, "get");
assert.equal(call.args[2], "/projects/project%201/delivery-design");

call = dispatch("PUT", "/api/real/projects/project%201/delivery-design");
assert.equal(call.adapter, "json");
assert.equal(call.args[2], "/projects/project%201/delivery-design");
assert.equal(call.args[3], "PUT");

call = dispatch(
  "POST",
  "/api/real/projects/project%201/delivery-design/apply",
);
assert.equal(call.adapter, "json");
assert.equal(call.args[2], "/projects/project%201/delivery-design/apply");
assert.equal(call.args[3], "POST");

call = dispatch(
  "GET",
  "/api/real/optimization-campaigns?projectId=project%201&limit=20",
);
assert.equal(call.adapter, "get");
assert.equal(
  call.args[2],
  "/optimization-campaigns?projectId=project%201&limit=20",
);

call = dispatch("GET", "/api/real/optimization-campaigns/campaign%201");
assert.equal(call.adapter, "get");
assert.equal(call.args[2], "/optimization-campaigns/campaign%201");

for (const action of ["start", "cancel"]) {
  call = dispatch(
    "POST",
    `/api/real/optimization-campaigns/campaign%201/${action}`,
  );
  assert.equal(call.adapter, "json");
  assert.equal(
    call.args[2],
    `/optimization-campaigns/campaign%201/${action}`,
  );
  assert.equal(call.args[3], "POST");
}

call = dispatch(
  "POST",
  "/api/real/optimization-campaigns/campaign%201/attempts/attempt%201/promote",
);
assert.equal(call.adapter, "json");
assert.equal(
  call.args[2],
  "/optimization-campaigns/campaign%201/attempts/attempt%201/promote",
);
assert.equal(call.args[3], "POST");

console.log("Project delivery-control routes passed.");
