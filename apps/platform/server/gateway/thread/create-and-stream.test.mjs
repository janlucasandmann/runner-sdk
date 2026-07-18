import assert from "node:assert/strict";
import { Readable } from "node:stream";
import test from "node:test";

import { readRequestBody, sendJson } from "../http-utils.mjs";
import { createThreadMessageGateway } from "./create-and-stream.mjs";

function requestWithJson(payload) {
  const request = Readable.from([Buffer.from(JSON.stringify(payload))]);
  request.headers = {};
  request.url = "/api/real/threads";
  return request;
}

function responseRecorder() {
  return {
    status: 0,
    headers: {},
    body: "",
    destroyed: false,
    headersSent: false,
    writableEnded: false,
    socket: { setNoDelay() {} },
    writeHead(status, headers) {
      this.status = status;
      this.headers = headers;
      this.headersSent = true;
    },
    write(chunk) {
      this.body += Buffer.from(chunk).toString("utf8");
      return true;
    },
    end(chunk = "") {
      if (chunk) this.write(chunk);
      this.writableEnded = true;
    },
    flushHeaders() {},
  };
}

function createGateway(fetchSessionApi) {
  return createThreadMessageGateway({
    fetchSessionApi,
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://api.example.test/v1",
    readOptionalApiKey: () => "",
    readRequestBody,
    sendJson,
    summarizeRunnerStreamChunkForLog: () => [],
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });
}

test("session-backed thread creation uses the topology-aware control seam", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response(JSON.stringify({ id: "thread_1" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  });
  const response = responseRecorder();

  await gateway.proxyCreateThread(requestWithJson({
    title: "Portable thread",
    environmentId: "environment_1",
  }), response);

  assert.equal(response.status, 201);
  assert.deepEqual(JSON.parse(response.body), { id: "thread_1" });
  assert.equal(calls[0].controlPath, "/threads");
  assert.equal(calls[0].hostedPath, "/api/threads");
  assert.equal(JSON.parse(calls[0].init.body).title, "Portable thread");
});

test("session-backed message streams use the topology-aware control seam", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response("data: {\"type\":\"thread.completed\"}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  });
  const response = responseRecorder();
  const request = requestWithJson({ content: "Continue the task" });
  request.url = "/api/real/threads/thread_1/messages";

  await gateway.proxyThreadMessages(request, response, "thread_1");

  assert.equal(response.status, 200);
  assert.match(response.body, /thread\.completed/);
  assert.equal(calls[0].controlPath, "/threads/thread_1/messages");
  assert.equal(calls[0].hostedPath, "/api/threads/thread_1/messages");
  assert.equal(JSON.parse(calls[0].init.body).content, "Continue the task");
});
