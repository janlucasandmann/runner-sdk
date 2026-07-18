import assert from "node:assert/strict";
import test from "node:test";

import { createThreadRoutes } from "../../routes/thread-routes.mjs";
import {
  THREAD_SEARCH_MAX_RESULTS,
  createThreadSearchGateway,
  limitThreadSearchResponse,
  normalizeThreadSearchLimit,
  normalizeThreadSearchRequestBody,
} from "./search.mjs";

test("normalizes thread search requests to a hard maximum of 20", () => {
  assert.equal(THREAD_SEARCH_MAX_RESULTS, 20);
  assert.equal(normalizeThreadSearchLimit(undefined), 20);
  assert.equal(normalizeThreadSearchLimit(100), 20);
  assert.equal(normalizeThreadSearchLimit("7"), 7);
  assert.equal(normalizeThreadSearchLimit(0), 1);
  assert.equal(normalizeThreadSearchLimit("invalid"), 20);
  assert.deepEqual(
    normalizeThreadSearchRequestBody({
      query: "deployment",
      limit: 200,
      includeMessages: false,
    }),
    {
      query: "deployment",
      limit: 20,
      includeMessages: false,
    },
  );
});

test("limits thread search response collections without changing the total", () => {
  const response = limitThreadSearchResponse(
    {
      results: Array.from({ length: 45 }, (_, index) => ({
        thread: { id: `thread_${index + 1}` },
      })),
      total: 45,
    },
    100,
  );

  assert.equal(response.results.length, 20);
  assert.equal(response.total, 45);
});

test("thread search gateway clamps both the upstream request and API response", async () => {
  let forwardedRequest;
  let sentResponse;
  const gateway = createThreadSearchGateway({
    async readRequestBody() {
      return {
        query: "customer",
        limit: 500,
        offset: 0,
      };
    },
    async fetchUpstreamJsonForProxyExactPath(
      _req,
      upstreamPath,
      method,
      body,
    ) {
      forwardedRequest = { upstreamPath, method, body };
      return {
        status: 200,
        data: {
          results: Array.from({ length: 50 }, (_, index) => ({
            thread: { id: `thread_${index + 1}` },
          })),
          total: 50,
        },
      };
    },
    sendJson(_res, status, payload) {
      sentResponse = { status, payload };
      return true;
    },
  });

  await gateway.proxyThreadSearch({}, {});

  assert.equal(forwardedRequest.upstreamPath, "/threads/search");
  assert.equal(forwardedRequest.method, "POST");
  assert.equal(forwardedRequest.body.limit, 20);
  assert.equal(sentResponse.status, 200);
  assert.equal(sentResponse.payload.results.length, 20);
  assert.equal(sentResponse.payload.total, 50);
});

test("thread search route always uses the bounded gateway", () => {
  const calls = [];
  const handleThreadRoutes = createThreadRoutes({
    proxyThreadSearch() {
      calls.push("bounded-search");
    },
    matchThreadProxyRoute() {
      calls.push("generic-proxy-contract");
      return null;
    },
  });

  assert.equal(
    handleThreadRoutes(
      { method: "POST" },
      {},
      new URL("http://localhost/api/real/threads/search"),
    ),
    true,
  );
  assert.deepEqual(calls, ["bounded-search"]);
});
