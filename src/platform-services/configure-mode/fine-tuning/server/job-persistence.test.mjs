import assert from "node:assert/strict";
import test from "node:test";

import { createFineTuningJobPersistenceCoordinator } from "./job-persistence.mjs";
import { createPlaygroundFineTuningRuntime } from "./runtime.mjs";

test("fine-tuning job persistence coalesces queued snapshots without losing waiters", async () => {
  let releaseFirstWrite;
  const firstWriteGate = new Promise((resolve) => {
    releaseFirstWrite = resolve;
  });
  const persistedRevisions = [];
  const coordinator = createFineTuningJobPersistenceCoordinator({
    persist: async (_record, job) => {
      persistedRevisions.push(job.revision);
      if (job.revision === 1) {
        await firstWriteGate;
      }
      return job.revision;
    },
  });

  const first = coordinator.enqueue({}, { id: "fine_tune_1", revision: 1 });
  await Promise.resolve();
  const second = coordinator.enqueue({}, { id: "fine_tune_1", revision: 2 });
  const third = coordinator.enqueue({}, { id: "fine_tune_1", revision: 3 });
  releaseFirstWrite();

  assert.deepEqual(await Promise.all([first, second, third]), [1, 3, 3]);
  assert.deepEqual(persistedRevisions, [1, 3]);
  await coordinator.waitForIdle("fine_tune_1");
});

test("fine-tuning job persistence retries transient failures but not permanent failures", async () => {
  let transientAttempts = 0;
  const delays = [];
  const transientCoordinator = createFineTuningJobPersistenceCoordinator({
    retryDelaysMs: [10, 20],
    sleep: async (delayMs) => {
      delays.push(delayMs);
    },
    persist: async () => {
      transientAttempts += 1;
      if (transientAttempts < 3) {
        const error = new Error("Temporary backend failure");
        error.status = 503;
        throw error;
      }
      return "persisted";
    },
  });

  assert.equal(
    await transientCoordinator.enqueue({}, { id: "fine_tune_retry" }),
    "persisted",
  );
  assert.equal(transientAttempts, 3);
  assert.deepEqual(delays, [10, 20]);

  let permanentAttempts = 0;
  const permanentCoordinator = createFineTuningJobPersistenceCoordinator({
    persist: async () => {
      permanentAttempts += 1;
      const error = new Error("Forbidden");
      error.status = 403;
      throw error;
    },
  });
  await assert.rejects(
    permanentCoordinator.enqueue({}, { id: "fine_tune_forbidden" }),
    /Forbidden/,
  );
  assert.equal(permanentAttempts, 1);
});

function createFineTuningRequestBody() {
  return {
    id: "fine_tune_durable",
    name: "Durable fine-tune",
    targetAgent: {
      id: "agent_target",
      name: "Target Agent",
      instructions: "Be concise.",
    },
    fineTunerAgent: {
      id: "agent_tuner",
      name: "Fine-Tuner",
    },
    environment: {
      id: "computer_1",
      name: "Default",
    },
    evaluationSets: [{
      id: "evaluation_1",
      name: "Support quality",
      selectedRunId: "evaluation_run_1",
      runs: [{
        id: "evaluation_run_1",
        status: "completed",
        averageScore: 0.7,
        targetAgentId: "agent_target",
        targetAgentName: "Target Agent",
      }],
      dataRows: [{
        id: "case_1",
        input: "Say hi",
        expectedOutput: "Hi",
      }],
    }],
  };
}

function createRuntimeAdapters({
  backendJobs,
  agents = [],
  createWriteGate = null,
  sendJson,
  persistenceFailure = null,
  requestLog = [],
}) {
  return {
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async () => new Response(JSON.stringify({}), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
    fetchAiosCloud: async (_requestContext, path, init = {}) => {
      const method = init.method || "GET";
      requestLog.push(`${method} ${path}`);
      if (path === "/threads" && method === "POST") {
        return new Response(JSON.stringify({ error: "Thread execution disabled in persistence test" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/agents" && method === "GET") {
        return new Response(JSON.stringify({ agents }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/fine-tuning/jobs/") && method === "PATCH") {
        if (persistenceFailure) {
          return new Response(JSON.stringify({ message: persistenceFailure.message }), {
            status: persistenceFailure.status,
            headers: { "content-type": "application/json" },
          });
        }
        const jobId = decodeURIComponent(path.slice("/fine-tuning/jobs/".length));
        const existingJob = backendJobs.get(jobId);
        if (!existingJob) {
          return new Response(JSON.stringify({ error: "Fine-tuning job not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }
        const payload = JSON.parse(String(init.body || "{}"));
        const nextJob = {
          ...existingJob,
          ...(payload.job || payload),
          id: jobId,
        };
        backendJobs.set(jobId, nextJob);
        return new Response(JSON.stringify({ job: nextJob }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/fine-tuning/jobs" && method === "POST") {
        if (persistenceFailure) {
          return new Response(JSON.stringify({ message: persistenceFailure.message }), {
            status: persistenceFailure.status,
            headers: { "content-type": "application/json" },
          });
        }
        if (createWriteGate) {
          await createWriteGate;
        }
        const job = JSON.parse(String(init.body || "{}"));
        backendJobs.set(job.id, job);
        return new Response(JSON.stringify({ job }), {
          status: 202,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/fine-tuning/jobs?") && method === "GET") {
        return new Response(JSON.stringify({ jobs: Array.from(backendJobs.values()) }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    },
    fineTuningPersistenceOptions: {
      maxAttempts: 1,
    },
    hasAiosSession: () => true,
    parseUpstreamUrl: () => "https://runner.example.test/v1",
    readOptionalApiKey: () => "",
    readRequestBody: async () => createFineTuningRequestBody(),
    sendJson,
    withProxyOrganizationHeader: (_req, _body, headers) => headers,
  };
}

test("fine-tuning overview lists compact jobs without legacy recovery requests", async () => {
  const backendJobs = new Map([[
    "fine_tune_overview",
    {
      id: "fine_tune_overview",
      name: "Compact overview job",
      status: "completed",
      createdAt: "2026-07-24T08:00:00.000Z",
      updatedAt: "2026-07-24T09:00:00.000Z",
      targetAgentId: "agent_target",
      targetAgentName: "Target Agent",
      targetAgentPhotoUrl: "https://example.test/agent.png",
      conductedBy: { id: "user_1", name: "Ada" },
      evaluationSets: [{ id: "evaluation_1", name: "Support quality" }],
      instructions: "Large instructions must stay on the detail endpoint.",
      evaluationRuns: [{ id: "evaluation_run_1", score: 1 }],
      diffFiles: [{ path: "agent/config.json" }],
      analysisSummary: "Large detail data.",
      metadata: {
        beforeAgentSnapshot: { instructions: "Before" },
      },
    },
  ]]);
  const requestLog = [];
  let resolveResponse;
  const responsePromise = new Promise((resolve) => {
    resolveResponse = resolve;
  });
  const runtime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    requestLog,
    sendJson: (_res, status, payload) => resolveResponse({ status, payload }),
  }));

  assert.equal(runtime.handleRequest(
    { method: "GET", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs?view=overview&limit=100"),
  ), true);

  const response = await responsePromise;
  assert.equal(response.status, 200);
  assert.equal(response.payload?.view, "overview");
  assert.equal(response.payload?.jobs?.[0]?.id, "fine_tune_overview");
  assert.equal(response.payload?.jobs?.[0]?.evaluationSetCount, 1);
  assert.equal(response.payload?.jobs?.[0]?.instructions, undefined);
  assert.equal(response.payload?.jobs?.[0]?.evaluationRuns, undefined);
  assert.equal(response.payload?.jobs?.[0]?.diffFiles, undefined);
  assert.equal(response.payload?.jobs?.[0]?.metadata, undefined);
  assert.deepEqual(requestLog, [
    "GET /fine-tuning/jobs?view=overview&limit=100",
  ]);
});

test("fine-tuning overview recovers and durably migrates legacy jobs when the job store is empty", async () => {
  const backendJobs = new Map();
  const requestLog = [];
  const agents = [{
    id: "agent_legacy",
    name: "Legacy Agent",
    photoUrl: "https://example.test/legacy-agent.png",
    versions: [{
      id: "agent_version_legacy",
      label: "Improved Legacy Agent",
      status: "published",
      createdAt: "2026-07-20T08:00:00.000Z",
      metadata: {
        fineTuningJobId: "fine_tune_legacy",
        fineTuningJobName: "Legacy fine-tune",
        fineTuningStatus: "completed",
        targetAgentId: "agent_legacy",
        targetAgentName: "Legacy Agent",
        evaluationSetIds: ["evaluation_legacy"],
        beforeScore: 0.5,
        afterScore: 0.9,
        conductedBy: { id: "user_legacy", name: "Legacy Owner" },
      },
    }],
  }];
  let resolveResponse;
  const responsePromise = new Promise((resolve) => {
    resolveResponse = resolve;
  });
  const runtime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    agents,
    backendJobs,
    requestLog,
    sendJson: (_res, status, payload) => resolveResponse({ status, payload }),
  }));

  assert.equal(runtime.handleRequest(
    { method: "GET", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs?view=overview&limit=100"),
  ), true);

  const response = await responsePromise;
  assert.equal(response.status, 200);
  assert.equal(response.payload?.jobs?.[0]?.id, "fine_tune_legacy");
  assert.equal(response.payload?.jobs?.[0]?.name, "Legacy fine-tune");
  assert.equal(requestLog.includes("GET /agents"), true);

  for (let attempt = 0; attempt < 20 && !backendJobs.has("fine_tune_legacy"); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(backendJobs.get("fine_tune_legacy")?.status, "completed");
  assert.equal(
    requestLog.includes("POST /fine-tuning/jobs"),
    true,
  );
});

test("fine-tuning creation waits for durable storage and survives a fresh runtime", async () => {
  const backendJobs = new Map();
  let releaseCreateWrite;
  const createWriteGate = new Promise((resolve) => {
    releaseCreateWrite = resolve;
  });
  let resolveCreateResponse;
  const createResponsePromise = new Promise((resolve) => {
    resolveCreateResponse = resolve;
  });
  const firstRuntime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    createWriteGate,
    sendJson: (_res, status, payload) => resolveCreateResponse({ status, payload }),
  }));

  assert.equal(firstRuntime.handleRequest(
    { method: "POST", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs"),
  ), true);

  await new Promise((resolve) => setImmediate(resolve));
  let createResponseSettled = false;
  void createResponsePromise.then(() => {
    createResponseSettled = true;
  });
  await Promise.resolve();
  assert.equal(createResponseSettled, false);

  releaseCreateWrite();
  const createResponse = await createResponsePromise;
  assert.equal(createResponse.status, 202);
  assert.equal(createResponse.payload?.job?.id, "fine_tune_durable");
  assert.equal(backendJobs.get("fine_tune_durable")?.status, "running");

  let resolveListResponse;
  const listResponsePromise = new Promise((resolve) => {
    resolveListResponse = resolve;
  });
  const freshRuntime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    sendJson: (_res, status, payload) => resolveListResponse({ status, payload }),
  }));
  assert.equal(freshRuntime.handleRequest(
    { method: "GET", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs?limit=100"),
  ), true);

  const listResponse = await listResponsePromise;
  assert.equal(listResponse.status, 200);
  assert.equal(listResponse.payload?.jobs?.some((job) => job.id === "fine_tune_durable"), true);
});

test("fine-tuning creation is rejected when durable storage is unavailable", async () => {
  const backendJobs = new Map();
  let resolveResponse;
  const responsePromise = new Promise((resolve) => {
    resolveResponse = resolve;
  });
  const runtime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    persistenceFailure: {
      status: 503,
      message: "Durable database unavailable",
    },
    sendJson: (_res, status, payload) => resolveResponse({ status, payload }),
  }));

  assert.equal(runtime.handleRequest(
    { method: "POST", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs"),
  ), true);

  const response = await responsePromise;
  assert.equal(response.status, 503);
  assert.match(response.payload?.message || "", /durably created/i);
  assert.equal(backendJobs.size, 0);
});
