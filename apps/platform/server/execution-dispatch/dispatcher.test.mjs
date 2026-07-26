import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeProtectedHeader,
  jwtVerify,
} from "jose";

import {
  createExecutionDispatcher,
} from "./dispatcher.mjs";
import {
  createExecutionWorkerAssertionSigner,
} from "./worker-assertion.mjs";

const secret = "execution-dispatch-test-secret-with-at-least-32-bytes";
const issuer = "computer-agents-platform";
const audience = "computer-agents-control-api";

async function waitForIdle(dispatcher, timeoutMs = 2_000) {
  const deadline = Date.now() + timeoutMs;
  while (dispatcher.activeCount() > 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.equal(dispatcher.activeCount(), 0, "dispatcher did not become idle");
}

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function makeClaim(overrides = {}) {
  return {
    dispatch: {
      id: "dispatch_test",
      kind: "evaluation_run",
      resourceId: "eval_run_test",
      organizationId: "org_test",
      ...overrides.dispatch,
    },
    lease: {
      token: "dispatch_claim_secret",
      expiresAt: new Date(Date.now() + 120_000).toISOString(),
      ...overrides.lease,
    },
    credential: {
      id: "key_test",
      key: "tb_workload_secret",
      expiresAt: new Date(Date.now() + 240_000).toISOString(),
      ...overrides.credential,
    },
  };
}

test("worker assertions are short-lived, typed, and capability-scoped", async () => {
  const signer = createExecutionWorkerAssertionSigner({
    secret: `${secret}\n`,
    issuer,
    audience,
    workerId: "worker:test",
    clock: () => 1_700_000_000_000,
  });
  const token = await signer.sign();
  const header = decodeProtectedHeader(token);
  const verified = await jwtVerify(
    token,
    new TextEncoder().encode(secret),
    {
      issuer,
      audience,
      algorithms: ["HS256"],
      currentDate: new Date(1_700_000_010_000),
    },
  );

  assert.equal(header.typ, "ca-execution-worker+jwt");
  assert.equal(verified.payload.purpose, "execution_dispatch");
  assert.equal(verified.payload.worker_id, "worker:test");
  assert.deepEqual(verified.payload.capabilities, ["execution_dispatch"]);
  assert.equal(verified.payload.exp - verified.payload.iat, 60);
});

test("claims wake services, heartbeat, settle, and never return workload keys to control API", async () => {
  const claim = makeClaim();
  const controlRequests = [];
  const logs = [];
  let claimDelivered = false;
  let receivedRequest = null;
  const fetchImpl = async (url, init) => {
    const parsed = new URL(url);
    const body = JSON.parse(init.body || "{}");
    controlRequests.push({
      path: parsed.pathname,
      body,
      authorization: init.headers.authorization,
    });
    if (parsed.pathname.endsWith("/claims")) {
      if (claimDelivered) return jsonResponse({ claims: [] });
      claimDelivered = true;
      return jsonResponse({ claims: [claim] });
    }
    if (parsed.pathname.endsWith("/heartbeat")) {
      return jsonResponse({ dispatch: claim.dispatch });
    }
    if (parsed.pathname.endsWith("/complete")) {
      return jsonResponse({
        dispatch: { ...claim.dispatch, status: "completed" },
      });
    }
    return jsonResponse({ error: "not found" }, 404);
  };
  const dispatcher = createExecutionDispatcher({
    controlOrigin: "https://control.example.test",
    upstreamOrigin: "https://api.example.test/v1",
    platformLocalOrigin: "http://127.0.0.1:4177",
    secret,
    issuer,
    audience,
    workerId: "worker:test",
    fetchImpl,
    heartbeatIntervalMs: 5,
    evaluationsService: {
      runs: {
        async wake(request, resourceId) {
          receivedRequest = request;
          assert.equal(resourceId, "eval_run_test");
          await new Promise((resolve) => setTimeout(resolve, 20));
          return { id: resourceId, status: "completed" };
        },
      },
    },
    fineTuningService: {
      jobs: { async wake() {} },
    },
    testsService: {
      runs: { async wake() {} },
    },
    logger: {
      info: (...args) => logs.push(args),
      warn: (...args) => logs.push(args),
      error: (...args) => logs.push(args),
    },
  });

  await dispatcher.pollNow();
  await waitForIdle(dispatcher);

  assert.equal(receivedRequest.headers["x-api-key"], claim.credential.key);
  assert.equal(
    receivedRequest.headers["x-computer-agents-organization"],
    "org_test",
  );
  assert.ok(controlRequests.some((request) => request.path.endsWith("/heartbeat")));
  const settlement = controlRequests.find((request) => request.path.endsWith("/complete"));
  assert.equal(settlement.body.outcome, "completed");
  assert.equal(settlement.body.token, claim.lease.token);
  assert.match(controlRequests[0].authorization, /^ComputerAgentsWorker /);
  assert.equal(
    JSON.stringify(controlRequests).includes(claim.credential.key),
    false,
  );
  assert.equal(JSON.stringify(logs).includes(claim.credential.key), false);
});

test("test-run claims wake Tests without crossing service boundaries", async () => {
  const claim = makeClaim({
    dispatch: {
      kind: "test_run",
      resourceId: "test_run_test",
    },
  });
  const settlements = [];
  let evaluationsWakeCount = 0;
  let fineTuningWakeCount = 0;
  let testsWakeCount = 0;
  let receivedRequest = null;
  const fetchImpl = async (url, init) => {
    const parsed = new URL(url);
    const body = JSON.parse(init.body || "{}");
    if (parsed.pathname.endsWith("/claims")) {
      return jsonResponse({ claims: [claim] });
    }
    if (parsed.pathname.endsWith("/complete")) {
      settlements.push(body);
      return jsonResponse({
        dispatch: { ...claim.dispatch, status: "completed" },
      });
    }
    return jsonResponse({ dispatch: claim.dispatch });
  };
  const dispatcher = createExecutionDispatcher({
    controlOrigin: "https://control.example.test",
    upstreamOrigin: "https://api.example.test/v1",
    platformLocalOrigin: "http://127.0.0.1:4177",
    secret,
    issuer,
    audience,
    fetchImpl,
    evaluationsService: {
      runs: {
        async wake() {
          evaluationsWakeCount += 1;
        },
      },
    },
    fineTuningService: {
      jobs: {
        async wake() {
          fineTuningWakeCount += 1;
        },
      },
    },
    testsService: {
      runs: {
        async wake(request, resourceId) {
          testsWakeCount += 1;
          receivedRequest = request;
          assert.equal(resourceId, "test_run_test");
        },
      },
    },
    logger: { info() {}, warn() {}, error() {} },
  });

  await dispatcher.pollNow();
  await waitForIdle(dispatcher);

  assert.equal(evaluationsWakeCount, 0);
  assert.equal(fineTuningWakeCount, 0);
  assert.equal(testsWakeCount, 1);
  assert.equal(receivedRequest.headers["x-api-key"], claim.credential.key);
  assert.equal(settlements.length, 1);
  assert.equal(settlements[0].outcome, "completed");
});

test("project delivery task claims execute the bound task and persist strict evidence", async () => {
  const claim = makeClaim({
    dispatch: {
      kind: "project_delivery_task",
      resourceId: "task_build_1",
      metadata: {
        deliveryExecutionId: "delivery_execution_1",
        deliveryStageId: "build",
        executionAgentId: "agent_builder",
        environmentId: "environment_1",
        resourceIds: ["function_1"],
        goal: "Build and verify the MVP.",
      },
    },
  });
  const workloadRequests = [];
  const settlements = [];
  let claimDelivered = false;
  const fetchImpl = async (url, init) => {
    const parsed = new URL(url);
    const body = JSON.parse(init.body || "{}");
    if (parsed.hostname === "control.example.test") {
      if (parsed.pathname.endsWith("/claims")) {
        if (claimDelivered) return jsonResponse({ claims: [] });
        claimDelivered = true;
        return jsonResponse({ claims: [claim] });
      }
      if (parsed.pathname.endsWith("/complete")) {
        settlements.push(body);
        return jsonResponse({
          dispatch: { ...claim.dispatch, status: "completed" },
        });
      }
      return jsonResponse({ dispatch: claim.dispatch });
    }
    workloadRequests.push({
      method: init.method,
      path: parsed.pathname,
      body,
      apiKey: init.headers["x-api-key"],
    });
    if (parsed.pathname.endsWith("/tasks/task_build_1/run-thread")) {
      return jsonResponse({
        task: {
          id: "task_build_1",
          status: "in_progress",
          metadata: { existing: true },
        },
        execution: {
          success: true,
          response: [
            "```project_delivery_build_json",
            JSON.stringify({
              schemaVersion: "computer_agents_project_delivery_build_evidence_v1",
              summary: "Built and verified.",
              commitSha: "d".repeat(40),
              resources: [{
                id: "function_1",
                revision: "version-1",
                status: "deployed",
                url: "https://function.example.test/health",
              }],
              healthChecks: [{
                name: "Smoke test",
                status: "passed",
                url: "https://function.example.test/health",
              }],
              artifacts: [],
            }),
            "```",
          ].join("\n"),
        },
      }, 201);
    }
    if (parsed.pathname.endsWith("/tasks/task_build_1")) {
      return jsonResponse({
        task: {
          id: "task_build_1",
          status: "done",
          metadata: body.metadata,
        },
      });
    }
    return jsonResponse({ error: "not found" }, 404);
  };
  const dispatcher = createExecutionDispatcher({
    controlOrigin: "https://control.example.test",
    upstreamOrigin: "https://api.example.test/v1",
    platformLocalOrigin: "http://127.0.0.1:4177",
    secret,
    issuer,
    audience,
    fetchImpl,
    evaluationsService: { runs: { async wake() {} } },
    fineTuningService: { jobs: { async wake() {} } },
    testsService: { runs: { async wake() {} } },
    logger: { info() {}, warn() {}, error() {} },
  });

  await dispatcher.pollNow();
  await waitForIdle(dispatcher);

  assert.equal(workloadRequests.length, 2);
  assert.equal(workloadRequests[0].method, "POST");
  assert.match(workloadRequests[0].body.message, /project_delivery_build_json/);
  assert.equal(workloadRequests[0].body.agentId, "agent_builder");
  assert.equal(
    workloadRequests[0].body.idempotencyKey,
    `project-delivery:${claim.dispatch.id}`,
  );
  assert.equal(workloadRequests[0].body.metadata.triggerKind, "automation");
  assert.equal(
    workloadRequests[0].body.metadata.source,
    "mission_control_delivery",
  );
  assert.equal(
    workloadRequests[0].body.metadata.missionControlDeliveryExecutionId,
    "delivery_execution_1",
  );
  assert.equal(
    workloadRequests[0].body.metadata.missionControlDeliveryStageId,
    "build",
  );
  assert.equal(workloadRequests[1].method, "PATCH");
  assert.equal(workloadRequests[1].body.status, "done");
  assert.equal(
    workloadRequests[1].body.metadata.deliveryEvidence.commitSha,
    "d".repeat(40),
  );
  assert.equal(workloadRequests[0].apiKey, claim.credential.key);
  assert.equal(settlements[0].outcome, "completed");
});

test("transient execution failures are returned to the queue as retryable", async () => {
  const claim = makeClaim();
  const settlements = [];
  const fetchImpl = async (url, init) => {
    const parsed = new URL(url);
    const body = JSON.parse(init.body || "{}");
    if (parsed.pathname.endsWith("/claims")) {
      return jsonResponse({ claims: [claim] });
    }
    if (parsed.pathname.endsWith("/complete")) {
      settlements.push(body);
      return jsonResponse({
        dispatch: { ...claim.dispatch, status: "retry_wait" },
      });
    }
    return jsonResponse({ dispatch: claim.dispatch });
  };
  const dispatcher = createExecutionDispatcher({
    controlOrigin: "https://control.example.test",
    upstreamOrigin: "https://api.example.test/v1",
    platformLocalOrigin: "http://127.0.0.1:4177",
    secret,
    issuer,
    audience,
    fetchImpl,
    evaluationsService: {
      runs: {
        async wake() {
          const error = new Error("Service temporarily unavailable");
          error.status = 503;
          throw error;
        },
      },
    },
    fineTuningService: {
      jobs: { async wake() {} },
    },
    testsService: {
      runs: { async wake() {} },
    },
    logger: { info() {}, warn() {}, error() {} },
  });

  await dispatcher.pollNow();
  await waitForIdle(dispatcher);

  assert.equal(settlements.length, 1);
  assert.equal(settlements[0].outcome, "failed");
  assert.equal(settlements[0].classification, "transient");
  assert.equal(settlements[0].status, 503);
});
