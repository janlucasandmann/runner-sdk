import assert from "node:assert/strict";
import test from "node:test";

import { createTestsRuntime } from "./runtime.mjs";

test("built-in readiness contracts execute without an LLM and report through the workload key", async () => {
  const definition = {
    cases: [{
      id: "control-plane-ready",
      name: "Control plane is ready",
      kind: "contract",
      enabled: true,
      request: {
        target: "control_plane_readiness",
        requireDatabase: true,
        requireAgentRuntime: true,
      },
    }],
  };
  const requests = [];
  let terminalReport = null;
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    const headers = new Headers(init.headers || {});
    requests.push({
      method,
      path: url.pathname,
      apiKey: headers.get("X-API-Key"),
      body,
    });

    if (method === "GET" && url.pathname === "/test-plans/runs/test_run_1") {
      return Response.json({
        testRun: {
          id: "test_run_1",
          status: "queued",
          environmentId: null,
          metadata: {
            testPlanSnapshot: { definition },
          },
        },
        testPlan: {
          id: "test_plan_1",
          name: "Readiness",
          definition,
        },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_1",
          token: "opaque-lease-token",
          expiresAt: new Date(Date.now() + 90_000).toISOString(),
        },
      });
    }
    if (method === "GET" && url.pathname === "/ready") {
      return Response.json({
        status: "ready",
        database: "PostgreSQL",
        agentRuntime: { status: "available" },
        timestamp: new Date().toISOString(),
      });
    }
    if (method === "PATCH" && url.pathname === "/test-plans/runs/test_run_1") {
      if (body?.status === "passed") terminalReport = body;
      return Response.json({
        testRun: {
          id: "test_run_1",
          status: body?.status,
        },
      });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_1");

  assert.equal(result.status, "passed");
  assert.ok(terminalReport);
  assert.equal(terminalReport.status, "passed");
  assert.equal(terminalReport.results.length, 1);
  assert.equal(terminalReport.results[0].caseId, "control-plane-ready");
  assert.equal(terminalReport.results[0].kind, "contract");
  assert.equal(terminalReport.results[0].status, "passed");
  assert.equal(
    terminalReport.metadata.executionMode,
    "deterministic_contract_worker_v2",
  );
  assert.match(
    terminalReport.results[0].evidence.requestFingerprint,
    /^[a-f0-9]{64}$/,
  );
  assert.equal(requests.some((request) => request.path.startsWith("/threads")), false);
  assert.equal(
    requests.every((request) => request.apiKey === "dispatch-workload-key"),
    true,
  );
});

test("built-in Function contracts invoke the owned Function and evaluate assertions", async () => {
  const definition = {
    cases: [{
      id: "function-contract",
      name: "Function returns canonical output",
      kind: "contract",
      enabled: true,
      request: {
        target: "computer_agents_function",
        functionId: "server_function_1",
        method: "POST",
        path: "/extract",
        body: { paperId: "PMC1" },
        timeoutMs: 30_000,
      },
      assertions: [
        { path: "ok", operator: "equals", expected: true },
        {
          path: "body.findings[0].source",
          operator: "equals",
          expected: "PMC1",
        },
      ],
    }],
  };
  let terminalReport = null;
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    if (method === "GET" && url.pathname.endsWith("/runs/test_run_function")) {
      return Response.json({
        testRun: {
          id: "test_run_function",
          status: "queued",
          metadata: { testPlanSnapshot: { definition } },
        },
        testPlan: { id: "test_plan_function", definition },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_function",
          token: "lease",
          expiresAt: new Date(Date.now() + 90_000).toISOString(),
        },
      });
    }
    if (
      method === "POST"
      && url.pathname === "/servers/server_function_1/invoke"
    ) {
      assert.deepEqual(body, {
        method: "POST",
        path: "/extract",
        body: { paperId: "PMC1" },
      });
      return Response.json({
        status: 200,
        ok: true,
        body: {
          findings: [{ source: "PMC1" }],
          accessToken: "must-not-leak",
        },
      });
    }
    if (method === "PATCH" && url.pathname.endsWith("/runs/test_run_function")) {
      if (body.status === "passed") terminalReport = body;
      return Response.json({ testRun: { id: "test_run_function", status: body.status } });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_function");

  assert.equal(result.status, "passed");
  assert.equal(terminalReport.results[0].status, "passed");
  assert.equal(
    terminalReport.results[0].evidence.response.body.accessToken,
    "[redacted]",
  );
  assert.equal(
    terminalReport.results[0].evidence.target,
    "computer_agents_function",
  );
});

test("built-in Metronome contracts wait for terminal workflow evidence", async () => {
  const definition = {
    cases: [{
      id: "workflow-contract",
      name: "Workflow completes",
      kind: "contract",
      enabled: true,
      request: {
        target: "metronome_workflow",
        workflowId: "metronome_1",
        input: { paperId: "PMC1" },
        timeoutMs: 1_000,
      },
      assertions: [{
        path: "output.imported",
        operator: "gte",
        expected: 1,
      }],
    }],
  };
  let terminalReport = null;
  let pollCount = 0;
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    if (method === "GET" && url.pathname.endsWith("/runs/test_run_workflow")) {
      return Response.json({
        testRun: {
          id: "test_run_workflow",
          status: "queued",
          projectId: "project_1",
          taskId: "task_1",
          metadata: { testPlanSnapshot: { definition } },
        },
        testPlan: { id: "test_plan_workflow", definition },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_workflow",
          token: "lease",
          expiresAt: new Date(Date.now() + 90_000).toISOString(),
        },
      });
    }
    if (method === "POST" && url.pathname === "/metronomes/metronome_1/test-run") {
      assert.equal(body.idempotencyKey, "test-service:test_run_workflow:workflow-contract");
      return Response.json({ data: { id: "metronome_run_1", status: "queued" } });
    }
    if (
      method === "GET"
      && url.pathname === "/metronomes/metronome_1/runs/metronome_run_1"
    ) {
      pollCount += 1;
      return Response.json({
        data: pollCount > 1
          ? { id: "metronome_run_1", status: "completed", output: { imported: 5 } }
          : { id: "metronome_run_1", status: "running" },
      });
    }
    if (method === "PATCH" && url.pathname.endsWith("/runs/test_run_workflow")) {
      if (body.status === "passed") terminalReport = body;
      return Response.json({ testRun: { id: "test_run_workflow", status: body.status } });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    contractPollMs: 1,
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_workflow");

  assert.equal(result.status, "passed");
  assert.ok(pollCount >= 2);
  assert.equal(terminalReport.results[0].status, "passed");
  assert.equal(
    terminalReport.results[0].evidence.response.output.imported,
    5,
  );
});

test("service-topology contracts execute every component without an LLM", async () => {
  const definition = {
    cases: [{
      id: "equal-care-topology",
      name: "Equal Care service topology",
      kind: "contract",
      enabled: true,
      request: {
        target: "service_topology",
        stopOnFailure: true,
        steps: [{
          id: "readiness",
          name: "Control plane",
          request: {
            target: "control_plane_readiness",
            requireDatabase: true,
          },
        }, {
          id: "extract",
          name: "Extraction Function",
          request: {
            target: "computer_agents_function",
            functionId: "function_equal_care",
            method: "POST",
            path: "/extract",
            body: { paperId: "PMC1" },
          },
          assertions: [{
            path: "body.findingCount",
            operator: "gte",
            expected: 1,
          }],
        }, {
          id: "workflow",
          name: "Extraction workflow",
          request: {
            target: "metronome_workflow",
            workflowId: "metronome_equal_care",
            input: { paperId: "PMC1" },
            timeoutMs: 1_000,
          },
          assertions: [{
            path: "output.persisted",
            operator: "equals",
            expected: true,
          }],
        }],
      },
      assertions: [{
        path: "failedCount",
        operator: "equals",
        expected: 0,
      }, {
        path: "passedCount",
        operator: "equals",
        expected: 3,
      }],
    }],
  };
  const requests = [];
  let terminalReport = null;
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    requests.push({ method, path: url.pathname, body });
    if (method === "GET" && url.pathname.endsWith("/runs/test_run_topology")) {
      return Response.json({
        testRun: {
          id: "test_run_topology",
          status: "queued",
          projectId: "project_equal_care",
          metadata: { testPlanSnapshot: { definition } },
        },
        testPlan: { id: "test_plan_topology", definition },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_topology",
          token: "lease",
          expiresAt: new Date(Date.now() + 90_000).toISOString(),
        },
      });
    }
    if (method === "GET" && url.pathname === "/ready") {
      return Response.json({
        status: "ready",
        database: "PostgreSQL",
        agentRuntime: { status: "available" },
      });
    }
    if (
      method === "POST"
      && url.pathname === "/servers/function_equal_care/invoke"
    ) {
      return Response.json({
        ok: true,
        status: 200,
        body: { findingCount: 2, accessToken: "must-not-leak" },
      });
    }
    if (
      method === "POST"
      && url.pathname === "/metronomes/metronome_equal_care/test-run"
    ) {
      return Response.json({ data: { id: "metronome_topology_run" } });
    }
    if (
      method === "GET"
      && url.pathname
        === "/metronomes/metronome_equal_care/runs/metronome_topology_run"
    ) {
      return Response.json({
        data: {
          id: "metronome_topology_run",
          status: "completed",
          output: { persisted: true },
        },
      });
    }
    if (method === "PATCH" && url.pathname.endsWith("/runs/test_run_topology")) {
      if (body.status === "passed") terminalReport = body;
      return Response.json({
        testRun: { id: "test_run_topology", status: body.status },
      });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    contractPollMs: 1,
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_topology");

  assert.equal(result.status, "passed");
  assert.equal(terminalReport.results[0].status, "passed");
  assert.equal(terminalReport.results[0].evidence.response.failedCount, 0);
  assert.equal(terminalReport.results[0].evidence.response.passedCount, 3);
  assert.equal(
    terminalReport.results[0].evidence.response.steps[1].response.body
      .accessToken,
    "[redacted]",
  );
  assert.equal(
    requests.some((request) => request.path.startsWith("/threads")),
    false,
  );
});

test("Mission Control topology targets execute their pinned Metronome deterministically", async () => {
  const definition = {
    cases: [{
      id: "canonical-evidence-topology-smoke",
      name: "Canonical evidence topology smoke",
      kind: "contract",
      enabled: true,
      request: {
        target: {
          kind: "service_topology",
          resources: [{
            id: "server_equal_care",
            key: "evidence_function",
            kind: "function",
          }, {
            id: "metronome_equal_care",
            key: "evidence_workflow",
            kind: "metronome",
            versionId: "metronome_version_equal_care",
          }],
          entrypoint: "evidence_workflow",
        },
      },
      assertions: [{ path: "status", equals: "completed" }],
    }],
  };
  let terminalReport = null;
  const requests = [];
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    requests.push({ method, path: url.pathname, body });
    if (
      method === "GET"
      && url.pathname.endsWith("/runs/test_run_mission_control")
    ) {
      return Response.json({
        testRun: {
          id: "test_run_mission_control",
          status: "queued",
          metadata: { testPlanSnapshot: { definition } },
        },
        testPlan: { id: "test_plan_mission_control", definition },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_mission_control",
          token: "lease",
          expiresAt: new Date(Date.now() + 90_000).toISOString(),
        },
      });
    }
    if (
      method === "GET"
      && url.pathname === "/metronomes/metronome_equal_care/versions"
    ) {
      return Response.json({
        data: [{
          id: "metronome_version_equal_care",
          status: "published",
          definition: {
            nodes: [{ id: "trigger", type: "trigger", config: {} }],
            edges: [],
          },
        }],
      });
    }
    if (
      method === "POST"
      && url.pathname === "/metronomes/metronome_equal_care/test-run"
    ) {
      assert.equal(body.definition.nodes[0].id, "trigger");
      assert.equal(
        body.idempotencyKey,
        "test-service:test_run_mission_control:canonical-evidence-topology-smoke",
      );
      return Response.json({
        data: { id: "metronome_run_mission_control", status: "queued" },
      });
    }
    if (
      method === "GET"
      && url.pathname
        === "/metronomes/metronome_equal_care/runs/metronome_run_mission_control"
    ) {
      return Response.json({
        data: {
          id: "metronome_run_mission_control",
          status: "completed",
          output: { publishedEvidenceCount: 0 },
        },
      });
    }
    if (
      method === "PATCH"
      && url.pathname.endsWith("/runs/test_run_mission_control")
    ) {
      if (body.status === "passed") terminalReport = body;
      return Response.json({
        testRun: {
          id: "test_run_mission_control",
          status: body.status,
        },
      });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    contractPollMs: 1,
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_mission_control");

  assert.equal(result.status, "passed");
  assert.equal(terminalReport.results[0].status, "passed");
  assert.equal(
    terminalReport.metadata.executionMode,
    "deterministic_contract_worker_v2",
  );
  assert.equal(
    requests.some((request) => request.path.startsWith("/threads")),
    false,
  );
});

test("canonical Mission Control topology requests stay deterministic", async () => {
  const canonicalRequest = {
    target: "metronome_workflow",
    workflowId: "metronome_equal_care",
    workflowVersionId: "metronome_version_equal_care",
    input: null,
    timeoutMs: 300_000,
    requestedTopology: {
      kind: "service_topology",
      entrypoint: "evidence_workflow",
      resourceIds: ["server_equal_care", "metronome_equal_care"],
    },
  };
  const definition = {
    cases: [{
      id: "canonical-evidence-topology-smoke",
      name: "Canonical evidence topology smoke",
      kind: "contract",
      enabled: true,
      request: canonicalRequest,
      assertions: [{ path: "status", equals: "completed" }],
    }],
  };
  let terminalReport = null;
  const requests = [];
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    requests.push({ method, path: url.pathname, body });
    if (
      method === "GET"
      && url.pathname.endsWith("/runs/test_run_canonical_topology")
    ) {
      return Response.json({
        testRun: {
          id: "test_run_canonical_topology",
          status: "queued",
          metadata: { testPlanSnapshot: { definition } },
        },
        testPlan: { id: "test_plan_canonical_topology", definition },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_canonical_topology",
          token: "lease-token",
          expiresAt: "2026-07-27T22:00:00.000Z",
        },
      });
    }
    if (
      method === "GET"
      && url.pathname.endsWith("/metronomes/metronome_equal_care/versions")
    ) {
      return Response.json({
        data: [{
          id: "metronome_version_equal_care",
          definition: {
            nodes: [{ id: "trigger", type: "trigger" }],
            edges: [],
          },
        }],
      });
    }
    if (
      method === "POST"
      && url.pathname.endsWith("/metronomes/metronome_equal_care/test-run")
    ) {
      return Response.json({
        run: {
          id: "metronome_run_canonical_topology",
          status: "completed",
          output: {},
        },
      });
    }
    if (
      method === "GET"
      && url.pathname.endsWith(
        "/metronomes/metronome_equal_care/runs/metronome_run_canonical_topology",
      )
    ) {
      return Response.json({
        run: {
          id: "metronome_run_canonical_topology",
          status: "completed",
          output: {},
        },
      });
    }
    if (
      method === "PATCH"
      && url.pathname.endsWith("/runs/test_run_canonical_topology")
    ) {
      if (body.status === "passed") terminalReport = body;
      return Response.json({ testRun: { id: "test_run_canonical_topology", ...body } });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    contractPollMs: 1,
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_canonical_topology");

  assert.equal(result.status, "passed");
  assert.equal(terminalReport.results[0].status, "passed");
  assert.match(
    terminalReport.results[0].evidence.requestFingerprint,
    /^[a-f0-9]{64}$/,
  );
  assert.equal(
    requests.some((request) => request.path.startsWith("/threads")),
    false,
  );
});

test("mixed plans dispatch each case to its compatible executor and preserve plan order", async () => {
  const definition = {
    cases: [{
      id: "readiness-contract",
      name: "Control plane is ready",
      kind: "contract",
      enabled: true,
      request: {
        target: "control_plane_readiness",
        requireDatabase: true,
        requireAgentRuntime: true,
      },
    }, {
      id: "browser-check",
      name: "User can open the dashboard",
      kind: "browser",
      enabled: true,
      command: "Open the dashboard and verify the project list.",
      request: {},
    }],
  };
  const requests = [];
  let terminalReport = null;
  const delegatedOutput = JSON.stringify({
    summary: "The browser verification passed.",
    results: [{
      caseId: "browser-check",
      name: "User can open the dashboard",
      kind: "browser",
      status: "passed",
      attempt: 1,
      durationMs: 420,
      summary: "Dashboard project list was visible.",
      evidence: { references: ["screenshot://dashboard"], redacted: true },
    }],
    artifacts: [],
  });
  const fetchImpl = async (input, init = {}) => {
    const url = new URL(String(input));
    const method = String(init.method || "GET").toUpperCase();
    const body = init.body ? JSON.parse(String(init.body)) : null;
    requests.push({ method, path: url.pathname, body });

    if (method === "GET" && url.pathname.endsWith("/runs/test_run_hybrid")) {
      return Response.json({
        testRun: {
          id: "test_run_hybrid",
          status: "queued",
          agentId: "agent_test_executor",
          environmentId: "computer_test_environment",
          metadata: { testPlanSnapshot: { definition } },
        },
        testPlan: { id: "test_plan_hybrid", name: "Hybrid plan", definition },
      });
    }
    if (method === "POST" && url.pathname.endsWith("/lease")) {
      return Response.json({
        lease: {
          owner: "tests-worker:test_run_hybrid",
          token: "lease-token",
          expiresAt: new Date(Date.now() + 90_000).toISOString(),
        },
      });
    }
    if (method === "GET" && url.pathname === "/ready") {
      return Response.json({
        status: "ready",
        database: "PostgreSQL",
        agentRuntime: { status: "available" },
      });
    }
    if (method === "POST" && url.pathname === "/threads") {
      assert.equal(body.hidden, true);
      return Response.json({ thread: { id: "thread_test_executor" } });
    }
    if (
      method === "POST"
      && url.pathname === "/threads/thread_test_executor/messages"
    ) {
      assert.match(body.content, /browser-check/);
      assert.doesNotMatch(body.content, /readiness-contract/);
      return new Response("", { status: 200 });
    }
    if (method === "GET" && url.pathname === "/threads/thread_test_executor") {
      return Response.json({ thread: { id: "thread_test_executor", status: "completed" } });
    }
    if (
      method === "GET"
      && url.pathname === "/threads/thread_test_executor/messages"
    ) {
      return Response.json([{ role: "assistant", content: delegatedOutput }]);
    }
    if (
      method === "GET"
      && [
        "/threads/thread_test_executor/steps",
        "/threads/thread_test_executor/logs",
      ].includes(url.pathname)
    ) {
      return Response.json([]);
    }
    if (method === "PATCH" && url.pathname.endsWith("/runs/test_run_hybrid")) {
      if (body.status === "passed") terminalReport = body;
      return Response.json({ testRun: { id: "test_run_hybrid", status: body.status } });
    }
    if (method === "DELETE" && url.pathname.endsWith("/lease")) {
      return Response.json({ released: true });
    }
    return Response.json({ error: "Unexpected request" }, { status: 500 });
  };
  const runtime = createTestsRuntime({
    executionOwnerId: "durable-tests-worker",
    threadPollAttempts: 1,
    fetch: fetchImpl,
    fetchAiosApi: async () => Response.json({}),
    hasAiosSession: () => false,
    parseUpstreamUrl: () => "https://api.example.test",
    readOptionalApiKey: () => "dispatch-workload-key",
    withProxyOrganizationHeader: (_request, _body, headers) => headers,
  });

  const result = await runtime.runs.wake({
    method: "POST",
    url: "/internal/dispatch",
    headers: {},
  }, "test_run_hybrid");

  assert.equal(result.status, "passed");
  assert.ok(terminalReport);
  assert.equal(terminalReport.metadata.executionMode, "hybrid_test_worker_v1");
  assert.deepEqual(terminalReport.metadata.executionModes, [
    "deterministic_contract_worker_v2",
    "computer_agents_thread_v1",
  ]);
  assert.deepEqual(
    terminalReport.results.map((entry) => entry.caseId),
    ["readiness-contract", "browser-check"],
  );
  assert.equal(
    terminalReport.results[0].evidence.executionMode,
    "deterministic_contract_worker_v2",
  );
  assert.equal(terminalReport.results[0].evidence.executorThreadId, undefined);
  assert.equal(
    terminalReport.results[1].evidence.executionMode,
    "computer_agents_thread_v1",
  );
  assert.equal(
    terminalReport.results[1].evidence.executorThreadId,
    "thread_test_executor",
  );
  assert.equal(
    requests.filter((request) => request.path === "/threads").length,
    1,
  );
});
