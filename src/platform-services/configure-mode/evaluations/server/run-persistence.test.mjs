import assert from "node:assert/strict";
import test from "node:test";

import {
  assertEvaluationThreadDidNotFail,
  createPlaygroundEvaluationsRuntime,
} from "./runtime.mjs";
import { createEvaluationRunPersistenceCoordinator } from "./run-persistence.mjs";

test("failed target threads cannot be converted into scored Evaluation output", () => {
  assert.throws(
    () => assertEvaluationThreadDidNotFail({
      id: "thread_failed",
      status: "failed",
      content: "Thread completed. Open the thread to inspect the run summary.",
    }),
    (error) => (
      Number(error?.status) === 502
      && /status failed/i.test(String(error?.message || ""))
    ),
  );
  assert.equal(
    assertEvaluationThreadDidNotFail({ status: "completed" }),
    "completed",
  );
});

function maybeEvaluationLeaseResponse(path, init = {}, runId) {
  const leasePath = `/api/evaluations/runs/${runId}/lease`;
  if (path === `${leasePath}/heartbeat` && init.method === "POST") {
    return new Response(JSON.stringify({
      lease: {
        runId,
        owner: "test-worker",
        attempt: 1,
        expiresAt: new Date(Date.now() + 90_000).toISOString(),
        heartbeatAt: new Date().toISOString(),
      },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  if (path === leasePath && init.method === "POST") {
    const request = JSON.parse(String(init.body || "{}"));
    return new Response(JSON.stringify({
      lease: {
        runId,
        owner: request.owner || "test-worker",
        token: `lease-token-${runId}`,
        attempt: 1,
        expiresAt: new Date(Date.now() + 90_000).toISOString(),
      },
    }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  if (path === leasePath && init.method === "DELETE") {
    return new Response(JSON.stringify({ released: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
  return null;
}

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
      const leaseResponse = maybeEvaluationLeaseResponse(path, init, "run_durable");
      if (leaseResponse) return leaseResponse;
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
  assert.deepEqual(backendWrites.filter(({ path }) => path.startsWith("/api/evaluations")).slice(0, 3), [
    { path: "/api/evaluations/runs/run_durable", method: "GET" },
    { path: "/api/evaluations/runs/run_durable?view=status", method: "PATCH" },
    { path: "/api/evaluations/evaluation_1/runs", method: "POST" },
  ]);

  releaseCreateWrite();
  const response = await responsePromise;
  assert.equal(response.status, 202);
  assert.equal(response.payload?.run?.id, "run_durable");
});

test("evaluation execution preserves its thread and completes summary collection", async () => {
  let latestPersistedReport = null;
  let createResponse = null;
  const runtime = createPlaygroundEvaluationsRuntime({
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async (_requestContext, path, init = {}) => {
      const leaseResponse = maybeEvaluationLeaseResponse(path, init, "run_success");
      if (leaseResponse) return leaseResponse;
      if (init.method === "PATCH" && path === "/api/evaluations/runs/run_success?view=status") {
        const payload = JSON.parse(String(init.body || "{}"));
        latestPersistedReport = payload;
        return new Response(JSON.stringify({ run: payload }), {
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

  for (let attempt = 0; attempt < 100 && latestPersistedReport?.status !== "completed"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  assert.equal(createResponse?.status, 202);
  assert.equal(latestPersistedReport?.status, "completed");
  assert.equal(latestPersistedReport?.results?.[0]?.caseId, "case_1");
  assert.equal(latestPersistedReport?.results?.[0]?.status, "passed");
  assert.equal(latestPersistedReport?.results?.[0]?.metadata?.threadId, "thread_success");
  assert.equal(latestPersistedReport?.results?.[0]?.error, null);
  assert.equal(latestPersistedReport?.metadata?.executionContractVersion, "evaluation_execution_v3");
});

test("agent evaluation persists candidate and evaluator threads with the parsed score", async () => {
  let latestPersistedReport = null;
  let createdThreadCount = 0;
  const createdThreadPayloads = [];
  const evaluatorOutput = '{"score":1,"reason":"The candidate output matches the expected output."}';
  const runtime = createPlaygroundEvaluationsRuntime({
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async (_requestContext, path, init = {}) => {
      const leaseResponse = maybeEvaluationLeaseResponse(path, init, "run_agent");
      if (leaseResponse) return leaseResponse;
      if (init.method === "PATCH" && path === "/api/evaluations/runs/run_agent?view=status") {
        const payload = JSON.parse(String(init.body || "{}"));
        latestPersistedReport = payload;
        return new Response(JSON.stringify({ run: payload }), {
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
    fetchAiosCloud: async (_requestContext, path, init = {}) => {
      if (path === "/threads") {
        createdThreadCount += 1;
        createdThreadPayloads.push(JSON.parse(String(init.body || "{}")));
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
        targetAgentVersionId: "agent_candidate_version_2",
        environmentId: "computer_1",
        evaluator: {
          type: "agent",
          agentId: "agent_evaluator",
          agentVersionId: "agent_evaluator_version_7",
        },
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

  for (let attempt = 0; attempt < 100 && latestPersistedReport?.status !== "completed"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  const completedCase = latestPersistedReport?.results?.[0];
  assert.equal(latestPersistedReport?.status, "completed");
  assert.equal(completedCase?.status, "passed");
  assert.equal(completedCase?.score, 1);
  assert.equal(completedCase?.metadata?.threadId, "thread_candidate");
  assert.equal(completedCase?.metadata?.evaluatorThreadId, "thread_evaluator");
  assert.equal(completedCase?.evaluator?.parseStatus, "parsed_json");
  assert.equal(completedCase?.error, null);
  assert.equal(createdThreadPayloads[0]?.agentId, "agent_candidate");
  assert.equal(createdThreadPayloads[0]?.agentVersionId, "agent_candidate_version_2");
  assert.equal(createdThreadPayloads[1]?.agentId, "agent_evaluator");
  assert.equal(createdThreadPayloads[1]?.agentVersionId, "agent_evaluator_version_7");
});

test("an active persisted run resumes from its durable thread without duplicating creation or dispatch", async () => {
  let latestPersistedReport = null;
  const cloudCalls = [];
  const persistedRun = {
    id: "run_resume",
    evaluationSetId: "evaluation_resume",
    targetAgentId: "agent_1",
    environmentId: "computer_1",
    environmentType: "computer",
    evaluator: { type: "exact" },
    passThreshold: 0.8,
    datasetFingerprint: "sha256:resume-dataset",
    status: "running",
    createdAt: new Date().toISOString(),
    metadata: {
      executionSnapshot: {
        schemaVersion: "evaluation_execution_snapshot_v1",
        datasetFingerprint: "sha256:resume-dataset",
        caseSelectionFingerprint: "sha256:resume-selection",
        evaluatorFingerprint: "sha256:resume-evaluator",
        systemFingerprint: "sha256:resume-system",
        evaluationSet: {
          id: "evaluation_resume",
          name: "Resume evaluation",
          passThreshold: 0.8,
          evaluator: { type: "exact" },
          targetAgentId: "agent_1",
          environmentId: "computer_1",
          dataRows: [{
            id: "case_resume",
            input: "Say hi",
            expectedOutput: "Hi",
            optimizationRole: "holdout",
            runCount: 1,
          }],
        },
        targetGuardrail: null,
      },
    },
    cases: [{
      id: "run_case_resume",
      dataRowId: "case_resume",
      input: "Say hi",
      expectedOutput: "Hi",
      optimizationRole: "holdout",
      status: "running",
      executionStage: "creating_case_thread",
      checkpointedAt: new Date().toISOString(),
    }],
  };
  let responsePayload = null;
  const runtime = createPlaygroundEvaluationsRuntime({
    executionOwnerId: "resume-worker",
    threadRecoveryPollAttempts: 2,
    threadRecoveryPollMs: 1,
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async (_requestContext, path, init = {}) => {
      const leaseResponse = maybeEvaluationLeaseResponse(path, init, "run_resume");
      if (leaseResponse) return leaseResponse;
      if (path === "/api/evaluations/runs/run_resume" && (init.method || "GET") === "GET") {
        return new Response(JSON.stringify({ run: persistedRun }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/evaluations/runs/run_resume?view=status" && init.method === "PATCH") {
        const payload = JSON.parse(String(init.body || "{}"));
        latestPersistedReport = payload;
        return new Response(JSON.stringify({ run: payload }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/threads?appId=runner-web-sdk-demo&limit=500") {
        return new Response(JSON.stringify({
          data: [{
            id: "thread_resume",
            metadata: {
              evaluation: {
                runId: "run_resume",
                caseId: "run_case_resume",
                kind: "case",
              },
            },
          }],
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_resume/messages")) {
        return new Response(JSON.stringify({
          messages: [
            { role: "user", content: "Say hi" },
            { role: "assistant", content: "Hi" },
          ],
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_resume/steps")) {
        return new Response(JSON.stringify({ steps: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_resume/logs")) {
        return new Response(JSON.stringify({ logs: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/api/threads/thread_resume") {
        return new Response(JSON.stringify({
          thread: { id: "thread_resume", status: "completed", content: "Hi" },
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
    fetchAiosCloud: async (_requestContext, path, init = {}) => {
      cloudCalls.push({ path, method: init.method || "GET" });
      return new Response(JSON.stringify({ error: "Unexpected duplicate side effect" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    },
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://runner.example.test/v1",
    readOptionalApiKey: () => "",
    readRequestBody: async () => ({}),
    sendJson: (_res, status, payload) => {
      responsePayload = { status, payload };
    },
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  });

  assert.equal(runtime.handleRequest(
    { method: "GET", headers: {}, url: "/api/real/evaluations/runs/run_resume" },
    {},
    new URL("http://localhost/api/real/evaluations/runs/run_resume"),
  ), true);

  for (let attempt = 0; attempt < 100 && latestPersistedReport?.status !== "completed"; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  assert.equal(responsePayload?.status, 200);
  assert.equal(latestPersistedReport?.status, "completed");
  assert.equal(latestPersistedReport?.results?.[0]?.status, "passed");
  assert.equal(latestPersistedReport?.results?.[0]?.metadata?.threadId, "thread_resume");
  assert.deepEqual(cloudCalls, []);
});

test("a control-plane queued run hydrates immutable canonical cases and reports canonical evidence", async () => {
  const runId = "run_canonical";
  let terminalReport = null;
  let terminalReportCount = 0;
  let terminalReportApiKey = "";
  const persistedRun = {
    id: runId,
    evaluationId: "evaluation_canonical",
    evaluationSetId: "evaluation_canonical",
    versionId: "evaluation_version_1",
    agentId: "agent_bound",
    targetAgentId: "agent_bound",
    targetAgentVersionId: "agent_version_bound",
    targetFingerprint: `sha256:${"c".repeat(64)}`,
    environmentId: "computer_bound",
    status: "queued",
    createdAt: new Date().toISOString(),
    metadata: {
      evaluationSnapshot: {
        schemaVersion: "computer_agents_evaluation_run_binding_v1",
        evaluationId: "evaluation_canonical",
        versionId: "evaluation_version_1",
        versionNumber: 1,
        evaluationFingerprint: `sha256:${"a".repeat(64)}`,
        datasetFingerprint: `sha256:${"b".repeat(64)}`,
        snapshot: {
          schemaVersion: "computer_agents_evaluation_v1",
          name: "Canonical evaluation",
          description: "Hydrated from the control plane.",
          cases: [{
            id: "canonical_case_1",
            name: "Greeting",
            input: "Say hi",
            expectedOutput: "Hi",
            evaluationGuidance: "",
            weight: 1,
            optimizationRole: "holdout",
            metadata: null,
          }],
          metadata: {
            evaluator: { type: "exact" },
            passThreshold: 0.8,
          },
        },
        target: {
          bindingStatus: "control_plane_pinned",
          agentId: "agent_bound",
          agentVersionId: "agent_version_bound",
          agentVersionNumber: 1,
          agentVersionStatus: "published",
          targetFingerprint: `sha256:${"c".repeat(64)}`,
          snapshot: {
            source: "agent_version",
            agentId: "agent_bound",
            agentVersionId: "agent_version_bound",
            snapshot: { model: "test-model", instructions: "Reply exactly." },
          },
          environmentId: "computer_bound",
        },
      },
    },
  };
  const runtime = createPlaygroundEvaluationsRuntime({
    durableExecutionEnabled: true,
    executionOwnerId: "canonical-worker",
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchImpl: async (url, init = {}) => {
      const path = new URL(String(url)).pathname.replace(/^\/v1/, "");
      const leaseResponse = maybeEvaluationLeaseResponse(
        `/api${path}`,
        init,
        runId,
      );
      if (leaseResponse) return leaseResponse;
      if (
        path === `/evaluations/runs/${runId}`
        && (init.method || "GET") === "GET"
      ) {
        return new Response(JSON.stringify({ run: persistedRun }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (
        path === `/evaluations/runs/${runId}`
        && init.method === "PATCH"
      ) {
        const report = JSON.parse(String(init.body || "{}"));
        if (report.status !== "running") {
          terminalReport = report;
          terminalReportCount += 1;
          terminalReportApiKey = String(
            init.headers?.["X-API-Key"]
              || init.headers?.["x-api-key"]
              || "",
          );
        }
        return new Response(JSON.stringify({
          run: report.status === "running"
            ? report
            : {
                ...report,
                evidenceTrustLevel: "verified_worker",
                evidenceVerificationStatus: "verified",
                evidenceProvenanceVerified: true,
                evidenceSignatureStatus: "kms_signed",
              },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/threads" && init.method === "POST") {
        return new Response(JSON.stringify({
          thread: { id: "thread_canonical" },
        }), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      }
      if (
        path === "/threads/thread_canonical/messages"
        && init.method === "POST"
      ) {
        return new Response("Hi", {
          status: 200,
          headers: { "content-type": "text/plain" },
        });
      }
      if (path.endsWith("/messages")) {
        return new Response(JSON.stringify({ messages: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.endsWith("/steps")) {
        return new Response(JSON.stringify({ steps: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.endsWith("/logs")) {
        return new Response(JSON.stringify({ logs: [] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/threads/thread_canonical") {
        return new Response(JSON.stringify({
          thread: {
            id: "thread_canonical",
            status: "completed",
            content: "Hi",
          },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    },
    fetchAiosApi: async (requestContext, path, init = {}) => {
      const leaseResponse = maybeEvaluationLeaseResponse(path, init, runId);
      if (leaseResponse) return leaseResponse;
      if (path === `/api/evaluations/runs/${runId}` && (init.method || "GET") === "GET") {
        return new Response(JSON.stringify({ run: persistedRun }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === `/api/evaluations/runs/${runId}?view=status` && init.method === "PATCH") {
        const report = JSON.parse(String(init.body || "{}"));
        if (report.status !== "running") {
          terminalReport = report;
          terminalReportCount += 1;
          terminalReportApiKey = String(
            requestContext?.headers?.["x-api-key"] || "",
          );
        }
        return new Response(JSON.stringify({
          run: report.status === "running"
            ? report
            : {
                ...report,
                evidenceTrustLevel: "verified_worker",
                evidenceVerificationStatus: "verified",
                evidenceProvenanceVerified: true,
                evidenceSignatureStatus: "kms_signed",
              },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/api/threads/thread_canonical/")) {
        if (path.endsWith("/steps")) {
          return new Response(JSON.stringify({ steps: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (path.endsWith("/logs")) {
          return new Response(JSON.stringify({ logs: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (path.endsWith("/messages")) {
          return new Response(JSON.stringify({ messages: [] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
      }
      if (path === "/api/threads/thread_canonical") {
        return new Response(JSON.stringify({
          thread: {
            id: "thread_canonical",
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
        return new Response(JSON.stringify({
          thread: { id: "thread_canonical" },
        }), {
          status: 201,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/threads/thread_canonical/messages") {
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
    readOptionalApiKey: (request) => String(
      request?.headers?.["x-api-key"] || "",
    ),
    readRequestBody: async () => ({}),
    sendJson: () => {},
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  });

  const queued = await runtime.runs.get({
    method: "GET",
    headers: {},
    url: `/api/real/evaluations/runs/${runId}`,
  }, runId);
  assert.equal(queued.status, "running");
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(
    terminalReport,
    null,
    "durable deployments must wait for an execution-dispatch claim",
  );

  const completed = await runtime.runs.wake({
    method: "POST",
    headers: { "x-api-key": "dispatch-workload-key" },
    url: "/internal/execution-dispatch",
  }, runId);

  assert.equal(completed.status, "completed");
  assert.equal(terminalReport?.status, "completed");
  assert.equal(terminalReport?.results?.length, 1);
  assert.equal(terminalReport?.results?.[0]?.caseId, "canonical_case_1");
  assert.equal(terminalReport?.results?.[0]?.status, "passed");
  assert.equal(terminalReport?.results?.[0]?.output, "Hi");
  assert.equal(terminalReportCount, 1);
  assert.equal(terminalReportApiKey, "dispatch-workload-key");
  assert.equal(completed.evidenceTrustLevel, "verified_worker");
  assert.equal(completed.evidenceVerificationStatus, "verified");
  assert.equal(completed.evidenceProvenanceVerified, true);
  assert.equal(completed.evidenceSignatureStatus, "kms_signed");
  assert.equal(
    terminalReport?.executionLease?.token,
    `lease-token-${runId}`,
  );
});

test("a control-plane Function Evaluation executes its pinned revision without creating an Agent thread", async () => {
  const runId = "run_function_target";
  let terminalReport = null;
  let functionInvocation = null;
  let threadRequests = 0;
  const persistedRun = {
    id: runId,
    evaluationId: "evaluation_function",
    evaluationSetId: "evaluation_function",
    versionId: "evaluation_version_2",
    targetType: "function",
    targetId: "function_equal_care",
    targetVersionId: "function_version_4",
    status: "queued",
    createdAt: new Date().toISOString(),
    metadata: {
      evaluationSnapshot: {
        schemaVersion: "computer_agents_evaluation_run_binding_v2",
        evaluationId: "evaluation_function",
        versionId: "evaluation_version_2",
        versionNumber: 2,
        evaluationFingerprint: `sha256:${"d".repeat(64)}`,
        datasetFingerprint: `sha256:${"e".repeat(64)}`,
        snapshot: {
          schemaVersion: "computer_agents_evaluation_v1",
          name: "Function target",
          description: "",
          cases: [{
            id: "function_case_1",
            name: "Structured response",
            input: JSON.stringify({ pmid: "123" }),
            expectedOutput: "",
            evaluationGuidance: "",
            weight: 1,
            optimizationRole: "holdout",
            metadata: null,
          }],
          metadata: {
            evaluator: {
              type: "deterministic",
              graderId: "json_contract_v1",
              configuration: {
                requiredPaths: ["publication.pmid"],
                types: { "publication.pmid": "string" },
              },
            },
            passThreshold: 1,
          },
        },
        target: {
          bindingStatus: "control_plane_pinned",
          kind: "function",
          targetId: "function_equal_care",
          targetVersionId: "function_version_4",
          targetVersionNumber: 4,
          agentId: null,
          agentVersionId: null,
          agentVersionNumber: null,
          agentVersionStatus: null,
          targetFingerprint: `sha256:${"f".repeat(64)}`,
          environmentId: null,
          invocation: {
            method: "POST",
            path: "/extract",
            timeoutMs: 30_000,
          },
          snapshot: {
            source: "function_version",
            kind: "function",
            functionId: "function_equal_care",
            versionId: "function_version_4",
            versionNumber: 4,
            deployment: {
              revision: "function-revision-4",
            },
            invocation: {
              method: "POST",
              path: "/extract",
              timeoutMs: 30_000,
            },
          },
        },
      },
    },
  };
  const runtime = createPlaygroundEvaluationsRuntime({
    durableExecutionEnabled: true,
    executionOwnerId: "function-worker",
    fetchImpl: async (url, init = {}) => {
      const path = new URL(String(url)).pathname.replace(/^\/v1/, "");
      const leaseResponse = maybeEvaluationLeaseResponse(
        `/api${path}`,
        init,
        runId,
      );
      if (leaseResponse) return leaseResponse;
      if (
        path === `/evaluations/runs/${runId}`
        && (init.method || "GET") === "GET"
      ) {
        return new Response(JSON.stringify({ run: persistedRun }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (
        path === `/evaluations/runs/${runId}`
        && init.method === "PATCH"
      ) {
        const report = JSON.parse(String(init.body || "{}"));
        if (report.status !== "running") terminalReport = report;
        return new Response(JSON.stringify({ run: report }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (
        path === "/servers/function_equal_care/invoke"
        && init.method === "POST"
      ) {
        functionInvocation = JSON.parse(String(init.body || "{}"));
        return new Response(JSON.stringify({
          ok: true,
          status: 200,
          deploymentRevision: "function-revision-4",
          body: { publication: { pmid: "123" } },
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/threads")) threadRequests += 1;
      return new Response(JSON.stringify({ error: "Unexpected request" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    },
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://runner.example.test/v1",
    readOptionalApiKey: () => "dispatch-key",
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  });

  const completed = await runtime.runs.wake({ headers: {} }, runId);

  assert.equal(completed.status, "completed");
  assert.equal(functionInvocation.expectedRevision, "function-revision-4");
  assert.deepEqual(functionInvocation.body, { pmid: "123" });
  assert.equal(threadRequests, 0);
  assert.equal(terminalReport.status, "completed");
  assert.equal(terminalReport.results[0].status, "passed");
  assert.equal(
    terminalReport.results[0].metadata.targetExecution.deploymentRevision,
    "function-revision-4",
  );
});
