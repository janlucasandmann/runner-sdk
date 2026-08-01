import assert from "node:assert/strict";
import {
  fetchWithTransientRetry,
  isTransientUpstreamStatus,
} from "./transient-upstream.mjs";
import { waitForLocalAiosBridge } from "./aios-readiness.mjs";

assert.equal(isTransientUpstreamStatus(502), true);
assert.equal(isTransientUpstreamStatus(401), false);

{
  let calls = 0;
  const response = await fetchWithTransientRetry("https://example.test/resource", {
    method: "GET",
  }, {
    baseDelayMs: 1,
    fetchImpl: async () => {
      calls += 1;
      return new Response(JSON.stringify({ ok: calls > 1 }), {
        status: calls > 1 ? 200 : 502,
        headers: { "content-type": "application/json" },
      });
    },
  });
  assert.equal(response.status, 200);
  assert.equal(calls, 2);
}

{
  let calls = 0;
  const response = await fetchWithTransientRetry("https://example.test/resource", {
    method: "GET",
  }, {
    baseDelayMs: 1,
    fetchImpl: async () => {
      calls += 1;
      if (calls === 1) throw new TypeError("temporary socket failure");
      return new Response(null, { status: 204 });
    },
  });
  assert.equal(response.status, 204);
  assert.equal(calls, 2);
}

{
  let calls = 0;
  const response = await fetchWithTransientRetry("https://example.test/resource", {
    method: "POST",
    body: "{}",
  }, {
    baseDelayMs: 1,
    fetchImpl: async () => {
      calls += 1;
      return new Response(null, { status: 502 });
    },
  });
  assert.equal(response.status, 502);
  assert.equal(calls, 1);
}

{
  let calls = 0;
  const response = await fetchWithTransientRetry("https://example.test/resource", {
    method: "GET",
  }, {
    baseDelayMs: 1,
    fetchImpl: async () => {
      calls += 1;
      return new Response(null, { status: 401 });
    },
  });
  assert.equal(response.status, 401);
  assert.equal(calls, 1);
}

{
  let calls = 0;
  const readiness = await waitForLocalAiosBridge("http://127.0.0.1:3001", {
    timeoutMs: 1000,
    fetchImpl: async () => {
      calls += 1;
      return new Response(null, { status: 401 });
    },
  });
  assert.equal(readiness.ready, true);
  assert.equal(readiness.skipped, false);
  assert.equal(calls, 1);
}

{
  let calls = 0;
  const readiness = await waitForLocalAiosBridge("https://computer-agents.example", {
    fetchImpl: async () => {
      calls += 1;
      return new Response(null, { status: 200 });
    },
  });
  assert.equal(readiness.ready, true);
  assert.equal(readiness.skipped, true);
  assert.equal(calls, 0);
}

console.log("Transient upstream retry tests passed.");
