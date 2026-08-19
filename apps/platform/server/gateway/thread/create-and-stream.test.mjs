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

function createGateway(fetchSessionApi, options = {}) {
  return createThreadMessageGateway({
    fetchSessionApi,
    fetchSessionRunnerApi:
      options.fetchSessionRunnerApi
      || ((request, runnerPath, init) =>
        fetchSessionApi(request, runnerPath, null, init)),
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://api.example.test/v1",
    readOptionalApiKey: () => options.apiKey || "",
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

test("thread creation preserves a canonical Knowledge context and pins versions", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response(JSON.stringify({ id: "thread_knowledge" }), {
      status: 201,
      headers: { "content-type": "application/json" },
    });
  });
  const response = responseRecorder();

  await gateway.proxyCreateThread(requestWithJson({
    title: "Knowledge-aware thread",
    metadata: {
      knowledgeContext: {
        enabled: true,
        libraryIds: ["library-a"],
      },
    },
    knowledgeContext: {
      enabled: true,
      bindings: [{ libraryId: "library-a", versionId: "version-4", versionNumber: 4 }],
      mode: "read",
    },
  }), response);

  const body = JSON.parse(calls[0].init.body);
  assert.deepEqual(body.knowledgeContext, {
    schemaVersion: "computer_agents_knowledge_context_v1",
    enabled: true,
    libraryIds: ["library-a"],
    bindings: [{ libraryId: "library-a", versionId: "version-4", versionNumber: 4 }],
    mode: "read",
  });
});

test("session-backed message streams use the authenticated runner seam", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response("data: {\"type\":\"thread.completed\"}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  });
  const response = responseRecorder();
  const request = requestWithJson({
    content: "Continue the task",
    messageMetadata: { runnerConnectorIds: ["atlassian"] },
  });
  request.url = "/api/real/threads/thread_1/messages";

  await gateway.proxyThreadMessages(request, response, "thread_1");

  assert.equal(response.status, 200);
  assert.match(response.body, /thread\.completed/);
  assert.equal(calls[0].controlPath, "/threads/thread_1/messages");
  assert.equal(calls[0].hostedPath, null);
  const upstreamBody = JSON.parse(calls[0].init.body);
  assert.equal(upstreamBody.content, "Continue the task");
  assert.deepEqual(upstreamBody.messageMetadata, {
    runnerConnectorIds: ["atlassian"],
  });
});

test("capacity-queued thread receipts remain valid SSE through the platform gateway", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response([
      'data: {"type":"log","log":{"eventType":"batch_queued","metadata":{"batchJobId":"batch_1","batchStatus":"queued"}}}\n\n',
      'data: {"type":"stream.completed","queued":true,"batchJobId":"batch_1","admissionReason":"runtime_execution_capacity_exhausted"}\n\n',
    ].join(""), {
      status: 202,
      headers: { "content-type": "text/event-stream" },
    });
  });
  const response = responseRecorder();
  const request = requestWithJson({ content: "Run when capacity is available" });
  request.url = "/api/real/threads/thread_queued/messages";
  request.headers["idempotency-key"] = "thread-turn:thread_queued:turn_1";

  await gateway.proxyThreadMessages(request, response, "thread_queued");

  assert.equal(response.status, 200);
  assert.equal(response.headers["Content-Type"], "text/event-stream; charset=utf-8");
  assert.match(response.body, /"eventType":"batch_queued"/);
  assert.match(response.body, /"queued":true/);
  assert.match(response.body, /"batchJobId":"batch_1"/);
  assert.match(response.body, /runtime_execution_capacity_exhausted/);
  assert.equal(
    calls[0].init.headers["idempotency-key"],
    "thread-turn:thread_queued:turn_1",
  );
});

test("message streams forward Knowledge context even when it arrives in message metadata", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response("data: {\"type\":\"thread.completed\"}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  });
  const response = responseRecorder();
  const request = requestWithJson({
    content: "Use the selected library.",
    messageMetadata: {
      knowledgeContext: {
        enabled: true,
        bindings: [{ libraryId: "library-a", versionNumber: 2 }],
      },
    },
  });
  request.url = "/api/real/threads/thread_knowledge/messages";

  await gateway.proxyThreadMessages(request, response, "thread_knowledge");

  assert.deepEqual(JSON.parse(calls[0].init.body).knowledgeContext, {
    schemaVersion: "computer_agents_knowledge_context_v1",
    enabled: true,
    libraryIds: ["library-a"],
    bindings: [{ libraryId: "library-a", versionNumber: 2 }],
    mode: "read",
  });
});

test("session-backed message streams never forward a client connector authority envelope", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, controlPath, hostedPath, init) => {
    calls.push({ controlPath, hostedPath, init });
    return new Response("data: {\"type\":\"thread.completed\"}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  });
  gateway.setThreadMessagePayloadEnricher(
    async (_request, threadId, _upstreamUrl, _apiKey, payload, context) => {
      assert.equal(threadId, "thread_1");
      assert.equal(context.requestedConnectors.github.credentialId, "credential_attacker");
      assert.deepEqual(context.requestedConnectors.github.allowedActions, ["delete_repository"]);
      return {
        ...payload,
        connectors: {
          github: {
            enabled: true,
            credentialId: "credential_server_selected",
            allowedActions: ["get_file_contents"],
          },
        },
      };
    },
  );
  const response = responseRecorder();
  const request = requestWithJson({
    content: "Inspect the repository",
    connectors: {
      github: {
        enabled: true,
        credentialId: "credential_attacker",
        allowedActions: ["delete_repository"],
      },
    },
    untrustedField: "must not reach upstream",
  });
  request.url = "/api/real/threads/thread_1/messages";

  await gateway.proxyThreadMessages(request, response, "thread_1");

  const upstreamBody = JSON.parse(calls[0].init.body);
  assert.equal(upstreamBody.untrustedField, undefined);
  assert.equal(upstreamBody.connectors.github.credentialId, "credential_server_selected");
  assert.deepEqual(upstreamBody.connectors.github.allowedActions, ["get_file_contents"]);
  assert.deepEqual(upstreamBody.messageMetadata, {
    runnerConnectorIds: ["github"],
  });
});

test("connector selections are omitted unless an authoritative message enricher allows them", async () => {
  const calls = [];
  const gateway = createGateway(async (_request, _controlPath, _hostedPath, init) => {
    calls.push(init);
    return new Response("data: {\"type\":\"thread.completed\"}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  });
  const response = responseRecorder();
  const request = requestWithJson({
    content: "Inspect the repository",
    connectors: {
      github: {
        enabled: true,
        credentialId: "credential_attacker",
        allowedActions: ["delete_repository"],
      },
    },
  });

  await gateway.proxyThreadMessages(request, response, "thread_1");

  assert.equal(JSON.parse(calls[0].body).connectors, undefined);
});

test("API-key message streams use the same authoritative connector envelope", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init });
    return new Response("data: {\"type\":\"thread.completed\"}\n\n", {
      status: 200,
      headers: { "content-type": "text/event-stream" },
    });
  };
  try {
    const gateway = createGateway(
      async () => {
        throw new Error("session transport should not be used");
      },
      { apiKey: "api_key_1" },
    );
    gateway.setThreadMessagePayloadEnricher(
      async (_request, _threadId, _upstreamUrl, apiKey, payload) => ({
        ...payload,
        connectors: apiKey
          ? {
              github: {
                enabled: true,
                credentialId: "credential_service",
                allowedActions: ["get_me"],
              },
            }
          : undefined,
      }),
    );
    const response = responseRecorder();
    const request = requestWithJson({
      content: "Who am I?",
      connectors: {
        github: {
          credentialId: "credential_attacker",
          allowedActions: ["delete_repository"],
        },
      },
    });

    await gateway.proxyThreadMessages(request, response, "thread_1");

    const upstreamBody = JSON.parse(calls[0].init.body);
    assert.equal(upstreamBody.connectors.github.credentialId, "credential_service");
    assert.deepEqual(upstreamBody.connectors.github.allowedActions, ["get_me"]);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("connector policy denials retain their original 4xx status", async () => {
  const gateway = createGateway(async () => {
    throw new Error("upstream must not be called");
  });
  const policyError = new Error("The assigned agent cannot use GitHub.");
  policyError.statusCode = 403;
  policyError.code = "connector_actions_denied";
  gateway.setThreadMessagePayloadEnricher(async () => {
    throw policyError;
  });
  const response = responseRecorder();
  const request = requestWithJson({
    content: "Use GitHub.",
    connectors: {
      github: { enabled: true },
    },
  });

  await gateway.proxyThreadMessages(request, response, "thread_1");

  assert.equal(response.status, 403);
  assert.deepEqual(JSON.parse(response.body), {
    error: "connector_actions_denied",
    message: "The assigned agent cannot use GitHub.",
  });
});
