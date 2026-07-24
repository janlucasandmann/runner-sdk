import assert from "node:assert/strict";
import test from "node:test";

import { createPlaygroundEvaluationsRuntime } from "./runtime.mjs";
import { createEvaluationRunPersistenceCoordinator } from "./run-persistence.mjs";

test("evaluation run persistence coalesces queued snapshots without losing waiters", async () => {
  let releaseFirstWrite;
  const firstWriteGate = new Promise((resolve) => {
    releaseFirstWrite = resolve;
  });
  const persistedRevisions = [];
  const coordinator = createEvaluationRunPersistenceCoordinator({
    persist: async (_record, run) => {
      persistedRevisions.push(run.revision);
      if (run.revision === 1) {
        await firstWriteGate;
      }
      return run.revision;
    },
  });

  const first = coordinator.enqueue({ run: { id: "run_1" } }, { id: "run_1", revision: 1 });
  await Promise.resolve();
  const second = coordinator.enqueue({ run: { id: "run_1" } }, { id: "run_1", revision: 2 });
  const third = coordinator.enqueue({ run: { id: "run_1" } }, { id: "run_1", revision: 3 });
  releaseFirstWrite();

  assert.deepEqual(await Promise.all([first, second, third]), [1, 3, 3]);
  assert.deepEqual(persistedRevisions, [1, 3]);
  await coordinator.waitForIdle("run_1");
});

test("evaluation run persistence retries transient backend failures", async () => {
  let attempts = 0;
  const delays = [];
  const coordinator = createEvaluationRunPersistenceCoordinator({
    maxAttempts: 4,
    retryDelaysMs: [10, 20, 30],
    sleep: async (delayMs) => {
      delays.push(delayMs);
    },
    persist: async () => {
      attempts += 1;
      if (attempts < 3) {
        const error = new Error("Temporary backend failure");
        error.status = 503;
        throw error;
      }
      return "persisted";
    },
  });

  const result = await coordinator.enqueue({ run: { id: "run_2" } }, { id: "run_2" });
  assert.equal(result, "persisted");
  assert.equal(attempts, 3);
  assert.deepEqual(delays, [10, 20]);
});

test("evaluation run persistence fails fast for permanent errors and can recover", async () => {
  let shouldFail = true;
  let attempts = 0;
  const coordinator = createEvaluationRunPersistenceCoordinator({
    persist: async (_record, run) => {
      attempts += 1;
      if (shouldFail) {
        const error = new Error("Forbidden");
        error.status = 403;
        throw error;
      }
      return run.revision;
    },
  });

  await assert.rejects(
    coordinator.enqueue({ run: { id: "run_3" } }, { id: "run_3", revision: 1 }),
    /Forbidden/,
  );
  assert.equal(attempts, 1);
  await assert.rejects(coordinator.waitForIdle("run_3"), /Forbidden/);

  shouldFail = false;
  assert.equal(
    await coordinator.enqueue({ run: { id: "run_3" } }, { id: "run_3", revision: 2 }),
    2,
  );
  await coordinator.waitForIdle("run_3");
});

test("evaluation run creation is not acknowledged before the initial run is durable", async () => {
  let releaseCreateWrite;
  const createWriteGate = new Promise((resolve) => {
    releaseCreateWrite = resolve;
  });
  const backendWrites = [];
  let resolveResponse;
  const responsePromise = new Promise((resolve) => {
    resolveResponse = resolve;
  });
  const runtime = createPlaygroundEvaluationsRuntime({
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async (_requestContext, path, init = {}) => {
      backendWrites.push({ path, method: init.method || "GET" });
      if (init.method === "PATCH") {
        return new Response(JSON.stringify({ error: "Evaluation run not found" }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      }
      if (init.method === "POST" && path === "/api/evaluations/evaluation_1/runs") {
        await createWriteGate;
        return new Response(JSON.stringify({ run: { id: "run_durable" } }), {
          status: 202,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    fetchAiosCloud: async () => new Response(JSON.stringify({ error: "Execution intentionally stopped" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    }),
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://runner.example.test/v1",
    readOptionalApiKey: () => "",
    readRequestBody: async () => ({
      evaluationSet: {
        id: "evaluation_1",
        name: "Durability test",
        targetAgentId: "agent_1",
        environmentId: "computer_1",
        evaluator: { type: "exact" },
        dataRows: [{
          id: "case_1",
          input: "Say hi",
          expectedOutput: "Hi",
        }],
      },
      runOptions: {
        id: "run_durable",
        targetAgentId: "agent_1",
        environmentId: "computer_1",
        evaluator: { type: "exact" },
      },
    }),
    sendJson: (_res, status, payload) => resolveResponse({ status, payload }),
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  });

  assert.equal(runtime.handleRequest(
    { method: "POST", headers: {}, url: "/api/real/evaluations/runs" },
    {},
    new URL("http://localhost/api/real/evaluations/runs"),
  ), true);

  await new Promise((resolve) => setImmediate(resolve));
  let responseSettled = false;
  void responsePromise.then(() => {
    responseSettled = true;
  });
  await Promise.resolve();
  assert.equal(responseSettled, false);
  assert.deepEqual(backendWrites.slice(0, 2), [
    { path: "/api/evaluations/runs/run_durable", method: "PATCH" },
    { path: "/api/evaluations/evaluation_1/runs", method: "POST" },
  ]);

  releaseCreateWrite();
  const response = await responsePromise;
  assert.equal(response.status, 202);
  assert.equal(response.payload?.run?.id, "run_durable");
});

test("evaluation execution preserves its thread and completes summary collection", async () => {
  let latestPersistedRun = null;
  let createResponse = null;
  const runtime = createPlaygroundEvaluationsRuntime({
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async (_requestContext, path, init = {}) => {
      if (init.method === "PATCH" && path === "/api/evaluations/runs/run_success") {
        const payload = JSON.parse(String(init.body || "{}"));
        latestPersistedRun = payload.run || null;
        return new Response(JSON.stringify({ run: latestPersistedRun }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_success/steps")) {
        return new Response(JSON.stringify({ steps: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_success/logs")) {
        return new Response(JSON.stringify({ logs: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_success/messages")) {
        return new Response(JSON.stringify({ messages: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/threads/thread_success") {
        return new Response(JSON.stringify({
          thread: {
            id: "thread_success",
            status: "completed",
            content: "Hi",
          },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    fetchAiosCloud: async (_requestContext, path) => {
      if (path === "/threads") {
        return new Response(JSON.stringify({ thread: { id: "thread_success" } }), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/threads/thread_success/messages") {
        return new Response("Hi", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    },
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://runner.example.test/v1",
    readOptionalApiKey: () => "",
    readRequestBody: async () => ({
      evaluationSet: {
        id: "evaluation_success",
        name: "Successful evaluation",
        targetAgentId: "agent_1",
        environmentId: "computer_1",
        evaluator: { type: "exact" },
        dataRows: [{
          id: "case_1",
          input: "Say hi",
          expectedOutput: "Hi",
        }],
      },
      runOptions: {
        id: "run_success",
        targetAgentId: "agent_1",
        environmentId: "computer_1",
        evaluator: { type: "exact" },
      },
    }),
    sendJson: (_res, status, payload) => {
      createResponse = { status, payload };
    },
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  });

  assert.equal(runtime.handleRequest(
    { method: "POST", headers: {}, url: "/api/real/evaluations/runs" },
    {},
    new URL("http://localhost/api/real/evaluations/runs"),
  ), true);

  for (let attempt = 0; attempt < 100 && latestPersistedRun?.status !== "completed"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  assert.equal(createResponse?.status, 202);
  assert.equal(latestPersistedRun?.status, "completed");
  assert.equal(latestPersistedRun?.cases?.[0]?.status, "passed");
  assert.equal(latestPersistedRun?.cases?.[0]?.threadId, "thread_success");
  assert.equal(latestPersistedRun?.cases?.[0]?.error, "");
  assert.equal(latestPersistedRun?.cases?.[0]?.executionStage, "");
  assert.equal(latestPersistedRun?.cases?.[0]?.failureStage, "");
});

test("agent evaluation persists candidate and evaluator threads with the parsed score", async () => {
  let latestPersistedRun = null;
  let createdThreadCount = 0;
  const evaluatorOutput = '{"score":1,"reason":"The candidate output matches the expected output."}';
  const runtime = createPlaygroundEvaluationsRuntime({
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async (_requestContext, path, init = {}) => {
      if (init.method === "PATCH" && path === "/api/evaluations/runs/run_agent") {
        const payload = JSON.parse(String(init.body || "{}"));
        latestPersistedRun = payload.run || null;
        return new Response(JSON.stringify({ run: latestPersistedRun }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      const isEvaluatorThread = path.includes("thread_evaluator");
      if (path.includes("/steps")) {
        return new Response(JSON.stringify({ steps: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.includes("/logs")) {
        return new Response(JSON.stringify({ logs: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.includes("/messages")) {
        return new Response(JSON.stringify({
          messages: isEvaluatorThread
            ? [{ role: "assistant", content: evaluatorOutput }]
            : [],
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/threads/thread_candidate") {
        return new Response(JSON.stringify({
          thread: { id: "thread_candidate", status: "completed", content: "Hi" },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/threads/thread_evaluator") {
        return new Response(JSON.stringify({
          thread: { id: "thread_evaluator", status: "completed", content: evaluatorOutput },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
    fetchAiosCloud: async (_requestContext, path) => {
      if (path === "/threads") {
        createdThreadCount += 1;
        const id = createdThreadCount === 1 ? "thread_candidate" : "thread_evaluator";
        return new Response(JSON.stringify({ thread: { id } }), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/threads/thread_candidate/messages") {
        return new Response("Hi", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }
      if (path === "/threads/thread_evaluator/messages") {
        return new Response(evaluatorOutput, {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    },
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://runner.example.test/v1",
    readOptionalApiKey: () => "",
    readRequestBody: async () => ({
      evaluationSet: {
        id: "evaluation_agent",
        name: "Agent evaluation",
        targetAgentId: "agent_candidate",
        environmentId: "computer_1",
        evaluator: { type: "agent", agentId: "agent_evaluator" },
        dataRows: [{
          id: "case_agent",
          input: "Say hi",
          expectedOutput: "Hi",
        }],
      },
      runOptions: {
        id: "run_agent",
        targetAgentId: "agent_candidate",
        environmentId: "computer_1",
        evaluator: { type: "agent", agentId: "agent_evaluator" },
      },
    }),
    sendJson: () => {},
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  });

  assert.equal(runtime.handleRequest(
    { method: "POST", headers: {}, url: "/api/real/evaluations/runs" },
    {},
    new URL("http://localhost/api/real/evaluations/runs"),
  ), true);

  for (let attempt = 0; attempt < 100 && latestPersistedRun?.status !== "completed"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const completedCase = latestPersistedRun?.cases?.[0];
  assert.equal(latestPersistedRun?.status, "completed");
  assert.equal(completedCase?.status, "passed");
  assert.equal(completedCase?.score, 1);
  assert.equal(completedCase?.threadId, "thread_candidate");
  assert.equal(completedCase?.evaluatorThreadId, "thread_evaluator");
  assert.equal(completedCase?.evaluatorParseStatus, "parsed_json");
  assert.equal(completedCase?.error, "");
});
