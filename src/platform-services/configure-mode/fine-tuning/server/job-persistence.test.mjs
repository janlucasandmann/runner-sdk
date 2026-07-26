import assert from "node:assert/strict";
import test from "node:test";

import { createFineTuningJobPersistenceCoordinator } from "./job-persistence.mjs";
import { createPlaygroundFineTuningRuntime } from "./runtime.mjs";
import { compactFineTuningJobRecord } from "./domain/jobs.mjs";

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
  emulateLegacyBackendCompaction = false,
  evaluationRuns = null,
  executionOwnerId = "",
  jobLeases = new Map(),
  threads = [],
  threadMessages = new Map(),
  sendJson,
  persistenceFailure = null,
  requestLog = [],
}) {
  const compactBackendJob = (job) => {
    if (!emulateLegacyBackendCompaction) return job;
    return {
      id: job.id,
      name: job.name,
      status: job.status,
      agentId: job.agentId,
      targetAgentId: job.targetAgentId,
      agentName: job.agentName,
      targetAgentName: job.targetAgentName,
      agentPhotoUrl: job.agentPhotoUrl,
      targetAgentPhotoUrl: job.targetAgentPhotoUrl,
      environmentId: job.environmentId,
      environmentName: job.environmentName,
      evaluationSetIds: job.evaluationSetIds,
      evaluationSets: job.evaluationSets,
      instructions: job.instructions,
      evaluationRuns: job.evaluationRuns,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt,
      metadata: job.metadata,
    };
  };
  return {
    ...(evaluationRuns ? { evaluationRuns } : {}),
    ...(executionOwnerId ? { executionOwnerId } : {}),
    enrichThreadPayloadWithAgentGuardrails: async (_req, _url, _apiKey, payload) => payload,
    fetchAiosApi: async () => new Response(JSON.stringify({}), {
      status: 200,
      headers: { "content-type": "application/json" },
    }),
    fetchAiosCloud: async (_requestContext, path, init = {}) => {
      const method = init.method || "GET";
      requestLog.push(`${method} ${path}`);
      const leaseMatch = path.match(/^\/fine-tuning\/jobs\/([^/]+)\/lease$/);
      const heartbeatMatch = path.match(/^\/fine-tuning\/jobs\/([^/]+)\/lease\/heartbeat$/);
      if (leaseMatch && method === "POST") {
        const jobId = decodeURIComponent(leaseMatch[1]);
        const job = backendJobs.get(jobId);
        if (!job) {
          return new Response(JSON.stringify({ error: "Fine-tuning job not found" }), {
            status: 404,
            headers: { "content-type": "application/json" },
          });
        }
        const body = JSON.parse(String(init.body || "{}"));
        const currentLease = jobLeases.get(jobId);
        if (
          currentLease
          && currentLease.owner !== body.owner
          && Date.parse(currentLease.expiresAt) > Date.now()
        ) {
          return new Response(JSON.stringify({ error: "Lease held" }), {
            status: 409,
            headers: { "content-type": "application/json" },
          });
        }
        const lease = currentLease?.owner === body.owner
          ? currentLease
          : {
              owner: body.owner,
              token: `lease_${jobId}_${jobLeases.size + 1}`,
              attempt: Math.max(1, Number(currentLease?.attempt || 0) + 1),
              expiresAt: new Date(Date.now() + 90_000).toISOString(),
            };
        lease.expiresAt = new Date(Date.now() + 90_000).toISOString();
        jobLeases.set(jobId, lease);
        return new Response(JSON.stringify({ lease, job }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (heartbeatMatch && method === "POST") {
        const jobId = decodeURIComponent(heartbeatMatch[1]);
        const body = JSON.parse(String(init.body || "{}"));
        const lease = jobLeases.get(jobId);
        if (!lease || lease.owner !== body.owner || lease.token !== body.token) {
          return new Response(JSON.stringify({ error: "Lease lost" }), {
            status: 409,
            headers: { "content-type": "application/json" },
          });
        }
        lease.expiresAt = new Date(Date.now() + 90_000).toISOString();
        return new Response(JSON.stringify({ lease }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (leaseMatch && method === "DELETE") {
        const jobId = decodeURIComponent(leaseMatch[1]);
        const body = JSON.parse(String(init.body || "{}"));
        const lease = jobLeases.get(jobId);
        if (!lease || lease.owner !== body.owner || lease.token !== body.token) {
          return new Response(JSON.stringify({ error: "Lease lost" }), {
            status: 409,
            headers: { "content-type": "application/json" },
          });
        }
        jobLeases.delete(jobId);
        return new Response(JSON.stringify({ released: true, job: backendJobs.get(jobId) }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      if (path === "/threads" && method === "POST") {
        return new Response(JSON.stringify({ error: "Thread execution disabled in persistence test" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
      if (path.startsWith("/threads?") && method === "GET") {
        return new Response(JSON.stringify({ threads }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      const threadMessagesMatch = path.match(/^\/threads\/([^/]+)\/messages(?:\?.*)?$/);
      if (threadMessagesMatch && method === "GET") {
        const threadId = decodeURIComponent(threadMessagesMatch[1]);
        return new Response(JSON.stringify({
          messages: threadMessages.get(threadId) || [],
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      }
      const threadMatch = path.match(/^\/threads\/([^/?]+)$/);
      if (threadMatch && method === "GET") {
        const threadId = decodeURIComponent(threadMatch[1]);
        const thread = threads.find((item) => item.id === threadId);
        return new Response(JSON.stringify(thread ? { thread } : { error: "Not found" }), {
          status: thread ? 200 : 404,
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
        const lease = jobLeases.get(jobId);
        if (
          lease
          && (
            payload.executionLease?.owner !== lease.owner
            || payload.executionLease?.token !== lease.token
          )
        ) {
          return new Response(JSON.stringify({ error: "A valid lease is required" }), {
            status: 409,
            headers: { "content-type": "application/json" },
          });
        }
        const nextJob = compactBackendJob({
          ...existingJob,
          ...(payload.job || payload),
          id: jobId,
        });
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
        const job = compactBackendJob(JSON.parse(String(init.body || "{}")));
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
      const jobMatch = path.match(/^\/fine-tuning\/jobs\/([^/]+)$/);
      if (jobMatch && method === "GET") {
        const job = backendJobs.get(decodeURIComponent(jobMatch[1]));
        return new Response(JSON.stringify(job ? { job } : { error: "Not found" }), {
          status: job ? 200 : 404,
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

test("fine-tuning orchestration state survives legacy backend compaction", async () => {
  const backendJobs = new Map();
  let resolveCreateResponse;
  const createResponsePromise = new Promise((resolve) => {
    resolveCreateResponse = resolve;
  });
  const firstRuntime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    emulateLegacyBackendCompaction: true,
    sendJson: (_res, status, payload) => resolveCreateResponse({ status, payload }),
  }));

  assert.equal(firstRuntime.handleRequest(
    { method: "POST", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs"),
  ), true);

  const createResponse = await createResponsePromise;
  assert.equal(createResponse.status, 202);
  const persistedJob = backendJobs.get("fine_tune_durable");
  assert.equal(persistedJob?.configuration, undefined);
  assert.equal(
    persistedJob?.metadata?.fineTuningOrchestrationState?.configuration?.targetAgent?.id,
    "agent_target",
  );
  let resolveListResponse;
  const listResponsePromise = new Promise((resolve) => {
    resolveListResponse = resolve;
  });
  const freshRuntime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    emulateLegacyBackendCompaction: true,
    sendJson: (_res, status, payload) => resolveListResponse({ status, payload }),
  }));
  assert.equal(freshRuntime.handleRequest(
    { method: "GET", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs?limit=100"),
  ), true);

  const listResponse = await listResponsePromise;
  const restoredJob = listResponse.payload?.jobs?.find((job) => job.id === "fine_tune_durable");
  assert.equal(restoredJob?.configuration?.targetAgent?.id, "agent_target");
  assert.equal(restoredJob?.configuration?.evaluationTargets?.[0]?.evaluationSetId, "evaluation_1");
  assert.equal(Boolean(restoredJob?.phase), true);
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

test("two runtimes cannot execute the same active optimization job concurrently", async () => {
  const backendJobs = new Map();
  const jobLeases = new Map();
  let evaluationCreateCount = 0;
  const blockedEvaluation = new Promise(() => {});
  const evaluationRuns = {
    async create() {
      evaluationCreateCount += 1;
      return await blockedEvaluation;
    },
    async get() {
      return await blockedEvaluation;
    },
  };

  let resolveCreateResponse;
  const createResponsePromise = new Promise((resolve) => {
    resolveCreateResponse = resolve;
  });
  const firstRuntime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    jobLeases,
    evaluationRuns,
    executionOwnerId: "optimization_worker_a",
    sendJson: (_res, status, payload) => resolveCreateResponse({ status, payload }),
  }));
  assert.equal(firstRuntime.handleRequest(
    { method: "POST", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs"),
  ), true);
  assert.equal((await createResponsePromise).status, 202);

  for (let attempt = 0; attempt < 50 && !jobLeases.has("fine_tune_durable"); attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(jobLeases.get("fine_tune_durable")?.owner, "optimization_worker_a:fine_tune_durable");

  let resolveListResponse;
  const listResponsePromise = new Promise((resolve) => {
    resolveListResponse = resolve;
  });
  const secondRuntime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    jobLeases,
    evaluationRuns,
    executionOwnerId: "optimization_worker_b",
    sendJson: (_res, status, payload) => resolveListResponse({ status, payload }),
  }));
  assert.equal(secondRuntime.handleRequest(
    { method: "GET", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs?limit=100"),
  ), true);
  assert.equal((await listResponsePromise).status, 200);

  for (let attempt = 0; attempt < 20; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(evaluationCreateCount, 1);
  assert.equal(jobLeases.get("fine_tune_durable")?.owner, "optimization_worker_a:fine_tune_durable");
});

test("restart recovery reuses a completed optimizer thread instead of creating or dispatching twice", async () => {
  const baselineRun = {
    id: "eval_run_baseline",
    label: "Optimization Baseline",
    status: "completed",
    targetAgentId: "agent_target",
    environmentId: "computer_1",
    evaluationVersionId: "evaluation_version_1",
    averageScore: 0.2,
    passRate: 0,
    scoredCount: 1,
    cases: [{
      id: "baseline_case_1",
      dataRowId: "case_1",
      dataRowRunIndex: 0,
      optimizationRole: "train",
      status: "failed",
      score: 0.2,
    }],
  };
  const job = compactFineTuningJobRecord({
    id: "fine_tune_recover_optimizer",
    name: "Recover optimizer",
    status: "running",
    phase: "optimizing",
    createdAt: "2026-07-25T08:00:00.000Z",
    updatedAt: "2026-07-25T08:01:00.000Z",
    configuration: {
      targetAgent: {
        id: "agent_target",
        name: "Target Agent",
        versionId: "agent_version_1",
        snapshot: {
          name: "Target Agent",
          instructions: "Original instructions",
        },
      },
      fineTunerAgent: {
        id: "agent_tuner",
        name: "Optimizer",
      },
      environment: {
        id: "computer_1",
        name: "Default",
        type: "computer",
      },
      evaluationTargets: [{
        evaluationSetId: "evaluation_1",
        evaluationSetName: "Support quality",
        evaluationVersionId: "evaluation_version_1",
        passThreshold: 0.8,
        successPolicy: {
          minimumAverageScore: 0.9,
          requiredPassRate: 0.9,
        },
        evaluationSetSnapshot: {
          id: "evaluation_1",
          name: "Support quality",
          passThreshold: 0.8,
          dataRows: [{
            id: "case_1",
            input: "Say hi",
            expectedOutput: "Hi",
            optimizationRole: "train",
          }],
        },
      }],
      limits: {
        maxIterations: 1,
        maxTransientRetries: 0,
        maxDurationMinutes: 10,
      },
      publicationPolicy: { mode: "manual" },
    },
    iterations: [{
      id: "fine_tune_baseline_recovered",
      number: 0,
      status: "completed_best_effort",
      evaluationRuns: [{
        evaluationSetId: "evaluation_1",
        evaluationSetName: "Support quality",
        phase: "baseline",
        runId: baselineRun.id,
        status: "completed",
        metrics: {
          averageScore: 0.2,
          passRate: 0,
          totalCount: 1,
        },
      }],
      metrics: {
        averageScore: 0.2,
        passRate: 0,
        totalCount: 1,
      },
    }],
    execution: {
      startedAt: "2026-07-25T08:00:00.000Z",
      deadlineAt: new Date(Date.now() + 10 * 60_000).toISOString(),
    },
  });
  const backendJobs = new Map([[job.id, job]]);
  const optimizerThread = {
    id: "thread_optimizer_recovered",
    status: "completed",
    createdAt: "2026-07-25T08:02:00.000Z",
    updatedAt: "2026-07-25T08:03:00.000Z",
    metadata: {
      fineTuning: {
        jobId: job.id,
        iterationNumber: 1,
      },
      runnerPlayground: {
        type: "fine_tuning_optimizer",
        fineTuningJobId: job.id,
        fineTuningIteration: 1,
      },
    },
  };
  const threadMessages = new Map([[
    optimizerThread.id,
    [{
      id: "message_optimizer_result",
      role: "assistant",
      content: JSON.stringify({
        instructions: "Recovered optimized instructions",
        summary: "Recovered optimizer result.",
      }),
      createdAt: optimizerThread.updatedAt,
    }],
  ]]);
  const requestLog = [];
  let resolveListResponse;
  const listResponsePromise = new Promise((resolve) => {
    resolveListResponse = resolve;
  });
  const runtime = createPlaygroundFineTuningRuntime(createRuntimeAdapters({
    backendJobs,
    threads: [optimizerThread],
    threadMessages,
    requestLog,
    executionOwnerId: "optimization_worker_recovery",
    evaluationRuns: {
      async get(_requestContext, runId) {
        assert.equal(runId, baselineRun.id);
        return baselineRun;
      },
      async create() {
        throw new Error("Candidate evaluation intentionally unavailable after optimizer recovery");
      },
    },
    sendJson: (_res, status, payload) => resolveListResponse({ status, payload }),
  }));

  assert.equal(runtime.handleRequest(
    { method: "GET", headers: { host: "localhost" } },
    {},
    new URL("http://localhost/api/real/fine-tuning/jobs?limit=100"),
  ), true);
  assert.equal((await listResponsePromise).status, 200);

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const persisted = backendJobs.get(job.id);
    if (persisted?.phase === "failed" || persisted?.status === "error") break;
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  assert.equal(
    requestLog.includes("GET /threads?appId=runner-web-sdk-demo&limit=500"),
    true,
  );
  assert.equal(
    requestLog.some((entry) => entry === "POST /threads"),
    false,
  );
  assert.equal(
    requestLog.some((entry) => entry === `POST /threads/${optimizerThread.id}/messages`),
    false,
  );
});
