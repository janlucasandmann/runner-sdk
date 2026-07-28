import { createHash } from "node:crypto";

const RUN_LEASE_TTL_MS = 90_000;
const RUN_HEARTBEAT_MS = 25_000;
const TERMINAL_THREAD_STATUSES = new Set(["completed", "failed", "cancelled"]);

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  const source = asRecord(value);
  for (const key of ["data", "items", "results", "agents", "messages", "steps", "logs"]) {
    if (Array.isArray(source[key])) return source[key];
  }
  return [];
}

function text(value, maximum = 20_000) {
  return String(value || "").trim().slice(0, maximum);
}

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableJson(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    const source = value;
    return `{${Object.keys(source).sort().map(
      (key) => `${JSON.stringify(key)}:${stableJson(source[key])}`,
    ).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return createHash("sha256").update(stableJson(value)).digest("hex");
}

function boundedInteger(value, fallback, minimum, maximum) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.round(numeric)));
}

function normalizeRequestedTopology(value) {
  const source = asRecord(value);
  const entrypoint = text(source.entrypoint, 200);
  const resourceIds = Array.isArray(source.resourceIds)
    ? source.resourceIds
        .slice(0, 50)
        .map((entry) => text(entry, 300))
        .filter(Boolean)
    : [];
  if (
    text(source.kind, 100).toLowerCase() !== "service_topology"
    || !entrypoint
    || resourceIds.length === 0
  ) {
    return null;
  }
  return {
    kind: "service_topology",
    entrypoint,
    resourceIds,
  };
}

function normalizeDeterministicContractRequest(value) {
  const source = asRecord(value);
  const structuredTarget = asRecord(source.target);
  if (text(structuredTarget.kind, 100).toLowerCase() === "service_topology") {
    const resources = Array.isArray(structuredTarget.resources)
      ? structuredTarget.resources.slice(0, 50).map(asRecord)
      : [];
    const entrypointKey = text(
      structuredTarget.entrypoint || structuredTarget.entrypointResourceKey,
      200,
    );
    const entrypoint = resources.find(
      (resource) => text(resource.key, 200) === entrypointKey,
    );
    const entrypointKind = text(entrypoint?.kind, 100).toLowerCase();
    const entrypointId = text(entrypoint?.id || entrypoint?.resourceId, 300);
    if (!entrypointKey || !entrypointId) return null;
    const invocation = asRecord(source.invocation || structuredTarget.invocation);
    if (entrypointKind === "metronome") {
      return {
        target: "metronome_workflow",
        workflowId: entrypointId,
        workflowVersionId: text(
          entrypoint.versionId || entrypoint.version_id,
          300,
        ) || null,
        input: source.input ?? source.body ?? null,
        timeoutMs: boundedInteger(
          source.timeoutMs || invocation.timeoutMs,
          5 * 60_000,
          1_000,
          30 * 60_000,
        ),
        requestedTopology: {
          kind: "service_topology",
          entrypoint: entrypointKey,
          resourceIds: resources
            .map((resource) => text(resource.id || resource.resourceId, 300))
            .filter(Boolean),
        },
      };
    }
    if (entrypointKind === "function") {
      const method = text(invocation.method || source.method || "POST", 20)
        .toUpperCase();
      const requestPath = text(invocation.path || source.path || "/", 2_000);
      if (
        !["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)
        || !requestPath.startsWith("/")
        || requestPath.startsWith("//")
        || requestPath.includes("\\")
      ) {
        return null;
      }
      return {
        target: "computer_agents_function",
        functionId: entrypointId,
        method,
        path: requestPath,
        body: source.input ?? source.body ?? null,
        timeoutMs: boundedInteger(
          source.timeoutMs || invocation.timeoutMs,
          120_000,
          1_000,
          10 * 60_000,
        ),
        requestedTopology: {
          kind: "service_topology",
          entrypoint: entrypointKey,
          resourceIds: resources
            .map((resource) => text(resource.id || resource.resourceId, 300))
            .filter(Boolean),
        },
      };
    }
    return null;
  }
  const target = text(source.target, 100).toLowerCase();
  if (target === "control_plane_readiness") {
    return {
      target,
      requireDatabase: source.requireDatabase === true,
      requireAgentRuntime: source.requireAgentRuntime === true,
    };
  }
  if (target === "computer_agents_function") {
    const functionId = text(source.functionId, 300);
    const method = text(source.method || "POST", 20).toUpperCase();
    const requestPath = text(source.path || "/", 2_000);
    if (
      !functionId
      || !["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)
      || !requestPath.startsWith("/")
      || requestPath.startsWith("//")
      || requestPath.includes("\\")
    ) {
      return null;
    }
    const requestedTopology = normalizeRequestedTopology(
      source.requestedTopology,
    );
    return {
      target,
      functionId,
      method,
      path: requestPath,
      body: source.body ?? null,
      timeoutMs: boundedInteger(
        source.timeoutMs,
        120_000,
        1_000,
        10 * 60_000,
      ),
      ...(requestedTopology ? { requestedTopology } : {}),
    };
  }
  if (target === "service_topology") {
    if (!Array.isArray(source.steps) || source.steps.length === 0 || source.steps.length > 50) {
      return null;
    }
    const steps = source.steps.map((entry) => {
      const step = asRecord(entry);
      const id = text(step.id, 200);
      const request = normalizeDeterministicContractRequest(step.request);
      if (
        !id
        || !/^[a-z][a-z0-9_-]*$/.test(id)
        || !request
        || request.target === "service_topology"
      ) {
        return null;
      }
      return {
        id,
        name: text(step.name || id, 500),
        request,
        assertions: Array.isArray(step.assertions)
          ? step.assertions.slice(0, 100).map(asRecord)
          : [],
      };
    });
    if (
      steps.some((step) => !step)
      || new Set(steps.map((step) => step.id)).size !== steps.length
    ) {
      return null;
    }
    return {
      target,
      steps,
      stopOnFailure: source.stopOnFailure !== false,
    };
  }
  if (target === "metronome_workflow") {
    const workflowId = text(source.workflowId, 300);
    if (!workflowId) return null;
    const requestedTopology = normalizeRequestedTopology(
      source.requestedTopology,
    );
    return {
      target,
      workflowId,
      workflowVersionId: text(
        source.workflowVersionId || source.workflow_version_id,
        300,
      ) || null,
      input: source.input ?? null,
      timeoutMs: boundedInteger(
        source.timeoutMs,
        5 * 60_000,
        1_000,
        30 * 60_000,
      ),
      ...(requestedTopology ? { requestedTopology } : {}),
    };
  }
  return null;
}

function redactEvidenceValue(value, key = "", depth = 0) {
  if (depth > 8) return "[truncated]";
  if (/secret|token|password|authorization|api[_-]?key|cookie/i.test(key)) {
    return "[redacted]";
  }
  if (Array.isArray(value)) {
    return value.slice(0, 100).map(
      (entry) => redactEvidenceValue(entry, "", depth + 1),
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .slice(0, 200)
        .map(([entryKey, entry]) => [
          entryKey,
          redactEvidenceValue(entry, entryKey, depth + 1),
        ]),
    );
  }
  if (typeof value === "string") return value.slice(0, 20_000);
  return value ?? null;
}

function resolveAssertionPath(value, pathValue) {
  const path = text(pathValue, 1_000)
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .map((entry) => entry.trim())
    .filter(Boolean);
  let current = value;
  for (const segment of path) {
    if (["__proto__", "prototype", "constructor"].includes(segment)) {
      return { found: false, value: undefined };
    }
    if (
      current === null
      || current === undefined
      || (typeof current !== "object" && !Array.isArray(current))
      || !Object.hasOwn(current, segment)
    ) {
      return { found: false, value: undefined };
    }
    current = current[segment];
  }
  return { found: true, value: current };
}

function valuesEqual(left, right) {
  return stableJson(left) === stableJson(right);
}

function safePattern(value) {
  const pattern = text(value, 256);
  if (
    !pattern
    || /\(\?/.test(pattern)
    || /\\[1-9]/.test(pattern)
    || /(?:\*|\+|\{[^}]+\})(?:\*|\+|\{)/.test(pattern)
  ) {
    return null;
  }
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

function evaluateAssertions(response, assertionsValue) {
  const assertions = Array.isArray(assertionsValue) ? assertionsValue : [];
  return assertions.map((assertionValue, index) => {
    const assertion = asRecord(assertionValue);
    const path = text(assertion.path, 1_000);
    const shorthandOperator = [
      "equals",
      "not_equals",
      "contains",
      "matches",
      "gte",
      "lte",
    ].find((candidate) => Object.hasOwn(assertion, candidate));
    const operator = text(
      assertion.operator || shorthandOperator || "equals",
      100,
    ).toLowerCase();
    const resolved = resolveAssertionPath(response, path);
    const expected = Object.hasOwn(assertion, "expected")
      ? assertion.expected
      : shorthandOperator
        ? assertion[shorthandOperator]
        : undefined;
    let passed = false;
    if (operator === "exists") passed = resolved.found;
    else if (operator === "truthy") passed = resolved.found && Boolean(resolved.value);
    else if (operator === "equals") {
      passed = resolved.found && valuesEqual(resolved.value, expected);
    } else if (operator === "not_equals") {
      passed = resolved.found && !valuesEqual(resolved.value, expected);
    } else if (operator === "contains") {
      passed = resolved.found && (
        typeof resolved.value === "string"
          ? resolved.value.includes(String(expected ?? ""))
          : Array.isArray(resolved.value)
            ? resolved.value.some((entry) => valuesEqual(entry, expected))
            : false
      );
    } else if (operator === "matches") {
      const pattern = safePattern(expected);
      passed = Boolean(
        resolved.found
        && pattern
        && pattern.test(text(resolved.value, 20_000)),
      );
    } else if (operator === "gte") {
      passed = resolved.found
        && Number.isFinite(Number(resolved.value))
        && Number(resolved.value) >= Number(expected);
    } else if (operator === "lte") {
      passed = resolved.found
        && Number.isFinite(Number(resolved.value))
        && Number(resolved.value) <= Number(expected);
    }
    return {
      index,
      path,
      operator,
      passed,
      expected: redactEvidenceValue(expected),
      actual: redactEvidenceValue(resolved.value),
    };
  });
}

function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function selfReportedExecutionProvenance(executorThreadId = null) {
  return {
    schemaVersion: "computer_agents_test_run_evidence_provenance_v1",
    source: "computer_agents_thread",
    trustLevel: "self_reported",
    verificationStatus: "unverified",
    executor: {
      kind: "computer_agents_thread",
      id: text(executorThreadId, 300) || null,
    },
    attestation: null,
  };
}

function cloneRequestContext(request) {
  return {
    method: request.method,
    url: request.url,
    headers: { ...(request.headers || {}) },
  };
}

async function readJsonResponse(response, fallbackMessage) {
  const raw = await response.text().catch(() => "");
  let payload = {};
  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    payload = { message: raw };
  }
  if (!response.ok) {
    throw createRuntimeError(
      text(payload?.message || payload?.error || fallbackMessage || "Request failed."),
      response.status,
    );
  }
  return payload;
}

function readRecordText(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(readRecordText).filter(Boolean).join("\n");
  const source = asRecord(value);
  const metadata = asRecord(source.metadata);
  for (const candidate of [
    source.output_text,
    source.outputText,
    source.summary,
    source.content,
    source.text,
    source.message,
    source.body,
    asRecord(source.response).output_text,
    asRecord(source.response).summary,
    asRecord(source.result).output_text,
    asRecord(source.result).summary,
    metadata.output_text,
    metadata.summary,
    metadata.content,
  ]) {
    const result = readRecordText(candidate);
    if (result) return result;
  }
  return "";
}

function recordTimestamp(value) {
  const source = asRecord(value);
  return text(source.createdAt || source.created_at || source.updatedAt || source.updated_at, 100);
}

function extractLatestText(records) {
  const ordered = (Array.isArray(records) ? records : [])
    .filter((entry) => entry && typeof entry === "object")
    .sort((left, right) => recordTimestamp(left).localeCompare(recordTimestamp(right)));
  for (let index = ordered.length - 1; index >= 0; index -= 1) {
    const candidate = readRecordText(ordered[index]);
    if (candidate) return candidate;
  }
  return "";
}

function extractStreamSummary(value) {
  let latest = "";
  String(value || "").split(/\n\n+/).forEach((block) => {
    const data = block
      .split(/\r?\n/)
      .map((line) => line.startsWith("data:") ? line.slice(5).trimStart() : "")
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!data || data === "[DONE]") return;
    try {
      const payload = JSON.parse(data);
      latest = text(
        payload.summary
        || payload.output_text
        || payload.outputText
        || asRecord(payload.response).output_text
        || latest,
        500_000,
      );
    } catch {}
  });
  return latest;
}

function extractJsonCandidates(value) {
  const raw = String(value || "").trim();
  if (!raw) return [];
  const candidates = [];
  const fenced = raw.match(/```test_run_json\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1]);
  const jsonFenced = raw.match(/```json\s*([\s\S]*?)```/i);
  if (jsonFenced?.[1]) candidates.push(jsonFenced[1]);
  const object = raw.match(/\{[\s\S]*\}/);
  if (object?.[0]) candidates.push(object[0]);
  candidates.push(raw);
  return candidates;
}

function normalizeResult(value, index) {
  const source = asRecord(value);
  const statusValue = text(source.status, 100).toLowerCase();
  const status = ["passed", "failed", "skipped", "error"].includes(statusValue)
    ? statusValue
    : "error";
  const exitCodeValue = source.exitCode ?? source.exit_code;
  const exitCode = exitCodeValue === null || exitCodeValue === undefined
    ? null
    : Number.isFinite(Number(exitCodeValue))
      ? Math.round(Number(exitCodeValue))
      : null;
  return {
    caseId: text(source.caseId || source.case_id || `case-${index + 1}`, 300),
    name: text(source.name || source.label || `Case ${index + 1}`, 500),
    kind: text(source.kind || "command", 100).toLowerCase(),
    status,
    attempt: Math.max(1, Math.round(Number(source.attempt || 1) || 1)),
    durationMs: Math.max(0, Math.round(Number(source.durationMs ?? source.duration_ms ?? 0) || 0)),
    exitCode,
    summary: text(source.summary || source.message, 20_000),
    diagnostics: asRecord(source.diagnostics),
    evidence: {
      ...asRecord(source.evidence),
      stdout: text(asRecord(source.evidence).stdout || source.stdout, 100_000),
      stderr: text(asRecord(source.evidence).stderr || source.stderr, 100_000),
      command: text(asRecord(source.evidence).command || source.command, 50_000),
    },
    startedAt: text(source.startedAt || source.started_at, 100) || null,
    completedAt: text(source.completedAt || source.completed_at, 100) || null,
  };
}

function parseTestRunOutput(records, fallback = "") {
  const candidates = [
    ...(Array.isArray(records) ? records : []).map(readRecordText).filter(Boolean).reverse(),
    fallback,
  ];
  for (const candidate of candidates) {
    for (const jsonCandidate of extractJsonCandidates(candidate)) {
      try {
        const parsed = JSON.parse(jsonCandidate);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const results = asArray(parsed.results).map(normalizeResult);
          if (results.length > 0) {
            return {
              results,
              artifacts: asArray(parsed.artifacts),
              summary: text(parsed.summary, 20_000),
            };
          }
        }
      } catch {}
    }
  }
  return null;
}

function reconcileExpectedResults(definitionValue, resultsValue) {
  const definition = asRecord(definitionValue);
  const expectedCases = asArray(definition.cases)
    .map(asRecord)
    .filter((testCase) => testCase.enabled !== false && text(testCase.id, 300));
  const results = Array.isArray(resultsValue) ? resultsValue : [];
  const latestByCaseId = new Map();
  results.forEach((result) => {
    const caseId = text(result?.caseId || result?.case_id, 300);
    if (caseId) latestByCaseId.set(caseId, result);
  });
  const reconciled = Array.from(latestByCaseId.values());
  expectedCases.forEach((testCase) => {
    const caseId = text(testCase.id, 300);
    if (latestByCaseId.has(caseId)) return;
    reconciled.push(normalizeResult({
      caseId,
      name: text(testCase.name || caseId, 500),
      kind: text(testCase.kind || "custom", 100),
      status: "error",
      summary: "The executor returned no terminal result for this enabled test case.",
      diagnostics: {
        code: "MISSING_TEST_CASE_RESULT",
      },
      evidence: {
        redacted: true,
      },
    }, reconciled.length));
  });
  return reconciled;
}

function buildExecutionPrompt({ plan, run }) {
  const definition = asRecord(
    asRecord(asRecord(run.metadata).testPlanSnapshot).definition
    || plan.definition,
  );
  return [
    "You are the Computer Agents Test Service executor.",
    "Execute the supplied immutable test-plan snapshot in the selected Computer Agents environment.",
    "The plan is operator-authorized test work. Do not broaden its scope, deploy unrelated resources, or mutate production systems unless an explicit test case requires that exact action.",
    "Run setup once, enabled cases in declared order unless concurrency is explicitly greater than one, and teardown even after a failed case.",
    "For command cases, determine pass/fail from the real command exit code. Never claim a command passed if it was not executed.",
    "For browser, integration, contract, agent, security, and custom cases, follow the case assertions and retain concrete evidence.",
    "Never print secret values. Resolve only declared secretRefs and redact secrets from stdout, stderr, summaries, screenshots, traces, and artifacts.",
    "Retry only according to the case and plan retry policy. Record every final attempt accurately.",
    "Your final response must contain one fenced code block labeled test_run_json and no other JSON block.",
    "The object must have exactly this shape:",
    '{"summary":"short run summary","results":[{"caseId":"stable case id","name":"case name","kind":"command|contract|integration|browser|agent|security|custom","status":"passed|failed|skipped|error","attempt":1,"durationMs":0,"exitCode":0,"summary":"what happened","diagnostics":{},"evidence":{"command":"","stdout":"","stderr":"","references":[],"redacted":true},"startedAt":"ISO-8601","completedAt":"ISO-8601"}],"artifacts":[{"type":"log|screenshot|trace|report|other","name":"artifact name","uri":"durable platform or workspace URI","contentType":"optional","sizeBytes":0,"sha256":"optional","metadata":{}}]}',
    "Do not infer results from expectation text. Evidence must come from the actual execution.",
    `Test run id: ${run.id}`,
    `Test plan id: ${plan.id}`,
    `Published plan version id: ${run.versionId || ""}`,
    `Project id: ${run.projectId || plan.projectId || ""}`,
    `Task id: ${run.taskId || ""}`,
    `Release id: ${run.releaseId || ""}`,
    `Commit SHA: ${run.commitSha || ""}`,
    `Plan fingerprint: ${text(asRecord(asRecord(run.metadata).testPlanSnapshot).planFingerprint, 128)}`,
    `Test plan snapshot:\n${JSON.stringify(definition, null, 2)}`,
  ].join("\n\n");
}

export function createTestsRuntime(deps = {}) {
  const {
    fetchAiosApi,
    fetchAiosCloud,
    hasAiosSession,
    parseUpstreamUrl,
    readOptionalApiKey,
    withProxyOrganizationHeader,
  } = deps;
  const activeExecutions = new Map();
  const workerId = text(deps.executionOwnerId, 300)
    || `tests-worker:${process.pid}`;
  const fetchImpl = typeof deps.fetch === "function" ? deps.fetch : fetch;

  async function backendRequest(record, path, options = {}) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}${path}`, {
        method: options.method || "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          ...(options.headers || {}),
          "X-API-Key": apiKey,
        }),
        body: options.body,
      });
    } else if (hasAiosSession(requestContext)) {
      response = await fetchAiosApi(requestContext, `/api${path}`, {
        method: options.method || "GET",
        headers: options.headers,
        body: options.body,
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    return await readJsonResponse(response, options.fallbackMessage || "Tests API request failed.");
  }

  function deterministicContractCases(definition) {
    const enabledCases = asArray(asRecord(definition).cases)
      .map(asRecord)
      .filter((testCase) => testCase.enabled !== false);
    if (
      enabledCases.length === 0
      || enabledCases.some((testCase) => (
        text(testCase.kind, 100).toLowerCase() !== "contract"
        || !normalizeDeterministicContractRequest(testCase.request)
      ))
    ) {
      return null;
    }
    return enabledCases;
  }

  async function waitForMetronomeRun(record, workflowId, runId, timeoutMs) {
    const deadline = Date.now() + timeoutMs;
    const pollMs = Math.max(50, Number(deps.contractPollMs) || 1_000);
    while (Date.now() <= deadline) {
      const payload = await backendRequest(
        record,
        `/metronomes/${encodeURIComponent(workflowId)}/runs/${
          encodeURIComponent(runId)
        }`,
        { fallbackMessage: "The Metronome test run could not be inspected." },
      );
      const metronomeRun = asRecord(payload.data || payload.run);
      const status = text(metronomeRun.status, 100).toLowerCase();
      if (["completed", "failed", "cancelled"].includes(status)) {
        return metronomeRun;
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs));
    }
    throw createRuntimeError("The Metronome contract timed out.", 504);
  }

  async function executeDeterministicContractRequest(
    record,
    testCase,
    request,
    run,
  ) {
    if (request.target === "service_topology") {
      const stepResults = [];
      const failures = [];
      for (const step of request.steps) {
        const startedAt = new Date().toISOString();
        try {
          const execution = await executeDeterministicContractRequest(
            record,
            testCase,
            step.request,
            run,
          );
          const assertions = evaluateAssertions(
            execution.response,
            step.assertions,
          );
          const stepFailures = [
            ...execution.defaultFailures,
            ...assertions
              .filter((assertion) => !assertion.passed)
              .map((assertion) => (
                `assertion ${assertion.index + 1} failed at ${assertion.path}`
              )),
          ];
          const status = stepFailures.length === 0 ? "passed" : "failed";
          stepResults.push({
            id: step.id,
            name: step.name,
            target: step.request.target,
            status,
            response: execution.response,
            assertions,
            failures: stepFailures,
            reference: execution.reference,
            method: execution.method,
            startedAt,
            completedAt: new Date().toISOString(),
          });
          failures.push(...stepFailures.map((failure) => `${step.id}: ${failure}`));
          if (stepFailures.length > 0 && request.stopOnFailure) break;
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          stepResults.push({
            id: step.id,
            name: step.name,
            target: step.request.target,
            status: "error",
            response: {},
            assertions: [],
            failures: [message],
            reference: "",
            method: "",
            startedAt,
            completedAt: new Date().toISOString(),
          });
          failures.push(`${step.id}: ${message}`);
          if (request.stopOnFailure) break;
        }
      }
      const skippedSteps = request.steps.slice(stepResults.length);
      for (const step of skippedSteps) {
        stepResults.push({
          id: step.id,
          name: step.name,
          target: step.request.target,
          status: "skipped",
          response: {},
          assertions: [],
          failures: ["Skipped after an earlier topology step failed."],
          reference: "",
          method: "",
          startedAt: null,
          completedAt: null,
        });
      }
      return {
        response: {
          steps: stepResults,
          passedCount: stepResults.filter((step) => step.status === "passed").length,
          failedCount: stepResults.filter((step) => (
            step.status === "failed" || step.status === "error"
          )).length,
          skippedCount: stepResults.filter((step) => step.status === "skipped").length,
        },
        defaultFailures: failures,
        reference: "computer-agents://tests/service-topology",
        method: "COMPOSITE",
      };
    }
    if (request.target === "control_plane_readiness") {
      const readiness = asRecord(await backendRequest(
        record,
        "/ready",
        { fallbackMessage: "The control-plane readiness check failed." },
      ));
      const agentRuntime = asRecord(readiness.agentRuntime);
      const failures = [];
      if (text(readiness.status, 100).toLowerCase() !== "ready") {
        failures.push("control plane is not ready");
      }
      if (request.requireDatabase === true && !text(readiness.database, 200)) {
        failures.push("database readiness is missing");
      }
      if (
        request.requireAgentRuntime === true
        && text(agentRuntime.status, 100).toLowerCase() !== "available"
      ) {
        failures.push("agent runtime is unavailable");
      }
      return {
        response: readiness,
        defaultFailures: failures,
        reference: `${record.upstreamUrl}/ready`,
        method: "GET",
      };
    }
    if (request.target === "computer_agents_function") {
      const response = asRecord(await backendRequest(
        record,
        `/servers/${encodeURIComponent(request.functionId)}/invoke`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            method: request.method,
            path: request.path,
            body: request.body,
          }),
          fallbackMessage: "The Computer Agents Function invocation failed.",
        },
      ));
      return {
        response,
        defaultFailures: response.ok === true
          ? []
          : [`function returned HTTP ${Number(response.status) || "error"}`],
        reference: `/servers/${request.functionId}/invoke`,
        method: request.method,
      };
    }
    let pinnedDefinition;
    if (request.workflowVersionId) {
      const versionPayload = await backendRequest(
        record,
        `/metronomes/${encodeURIComponent(request.workflowId)}/versions`,
        {
          fallbackMessage:
            "The pinned Metronome contract version could not be loaded.",
        },
      );
      const pinnedVersion = asArray(versionPayload).map(asRecord).find(
        (version) => text(version.id, 300) === request.workflowVersionId,
      );
      pinnedDefinition = asRecord(pinnedVersion?.definition);
      if (!pinnedVersion || !Object.keys(pinnedDefinition).length) {
        throw createRuntimeError(
          "The pinned Metronome contract version is unavailable.",
          409,
        );
      }
    }
    const created = await backendRequest(
      record,
      `/metronomes/${encodeURIComponent(request.workflowId)}/test-run`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...(pinnedDefinition ? { definition: pinnedDefinition } : {}),
          input: request.input,
          idempotencyKey: `test-service:${run.id}:${text(testCase.id, 300)}`,
          timeoutMs: request.timeoutMs,
          attachedProjectId: run.projectId || null,
          attachedTicketId: run.taskId || null,
        }),
        fallbackMessage: "The Metronome contract could not be started.",
      },
    );
    const createdRun = asRecord(created.data || created.run);
    const metronomeRunId = text(createdRun.id, 300);
    if (!metronomeRunId) {
      throw createRuntimeError(
        "The Metronome contract returned no run id.",
        502,
      );
    }
    const completed = await waitForMetronomeRun(
      record,
      request.workflowId,
      metronomeRunId,
      request.timeoutMs,
    );
    return {
      response: completed,
      defaultFailures: text(completed.status, 100).toLowerCase() === "completed"
        ? []
        : [`workflow ended with status ${
          text(completed.status, 100) || "unknown"
        }`],
      reference:
        `/metronomes/${request.workflowId}/runs/${metronomeRunId}`,
      method: "POST",
    };
  }

  async function executeDeterministicContractPlan(record, definition, run) {
    const testCases = deterministicContractCases(definition);
    if (!testCases) return null;
    const results = [];
    for (const [index, testCase] of testCases.entries()) {
      const startedAt = new Date().toISOString();
      const startedMs = Date.now();
      const request = normalizeDeterministicContractRequest(testCase.request);
      let response = {};
      let status = "error";
      let summary = "";
      let diagnostics = {};
      let reference = "";
      let method = "";
      try {
        const execution = await executeDeterministicContractRequest(
          record,
          testCase,
          request,
          run,
        );
        response = execution.response;
        reference = execution.reference;
        method = execution.method;
        const assertions = evaluateAssertions(response, testCase.assertions);
        const assertionFailures = assertions.filter(
          (assertion) => !assertion.passed,
        );
        const failures = [
          ...execution.defaultFailures,
          ...assertionFailures.map(
            (assertion) => (
              `assertion ${assertion.index + 1} failed at ${assertion.path}`
            ),
          ),
        ];
        status = failures.length === 0 ? "passed" : "failed";
        summary = failures.length === 0
          ? "The deterministic contract passed."
          : `Deterministic contract failed: ${failures.join("; ")}.`;
        diagnostics = {
          target: request.target,
          assertions,
          failures,
        };
      } catch (error) {
        summary = error instanceof Error ? error.message : String(error);
        diagnostics = {
          target: request?.target || null,
          httpStatus: Number(error?.status || 0) || null,
        };
      }
      const completedAt = new Date().toISOString();
      results.push(normalizeResult({
        caseId: text(testCase.id, 300) || `case-${index + 1}`,
        name: text(testCase.name, 500) || "Deterministic contract",
        kind: "contract",
        status,
        attempt: 1,
        durationMs: Math.max(0, Date.now() - startedMs),
        exitCode: null,
        summary,
        diagnostics,
        evidence: {
          target: request?.target || null,
          method,
          reference,
          requestFingerprint: request ? sha256(request) : null,
          response: redactEvidenceValue(response),
          redacted: true,
        },
        startedAt,
        completedAt,
      }, index));
    }
    return {
      results,
      artifacts: [],
      summary: "Deterministic platform contracts completed.",
      executionMode: "deterministic_contract_worker_v2",
    };
  }

  async function createHiddenThread(record, { run, plan, agentId }) {
    const payload = {
      title: `${plan.name || "Test plan"} · ${run.id}`,
      appId: "runner-web-sdk-demo",
      agentId,
      environmentId: run.environmentId,
      ...(run.projectId || plan.projectId ? {
        projectId: run.projectId || plan.projectId,
      } : {}),
      hidden: true,
      sidebarHidden: true,
      metadata: {
        tests: {
          testRunId: run.id,
          testPlanId: plan.id,
          versionId: run.versionId || "",
          kind: "executor",
        },
        runnerPlayground: {
          testRunId: run.id,
          testPlanId: plan.id,
          sidebarHidden: true,
        },
      },
    };
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}/threads`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "content-type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      response = typeof fetchAiosCloud === "function"
        ? await fetchAiosCloud(requestContext, "/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, "/api/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create the test executor thread.");
    const thread = asRecord(data.thread || data.data || data);
    const id = text(thread.id || thread.threadId || thread.thread_id, 300);
    if (!id) throw createRuntimeError("Test thread creation returned no thread id.", 502);
    return { ...thread, id };
  }

  async function executeThreadMessage(record, threadId, prompt) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = JSON.stringify({ content: prompt, task: prompt });
    let response;
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "content-type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: payload,
      });
    } else if (hasAiosSession(requestContext)) {
      response = typeof fetchAiosCloud === "function"
        ? await fetchAiosCloud(requestContext, `/threads/${encodeURIComponent(threadId)}/messages`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: payload,
          })
        : await fetchAiosApi(requestContext, `/api/threads/${encodeURIComponent(threadId)}/messages`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: payload,
          });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    if (!response.ok) {
      await readJsonResponse(response, "Failed to start the test executor thread.");
    }
    return extractStreamSummary(await response.text().catch(() => ""));
  }

  async function inspectThread(record, threadId) {
    const encoded = encodeURIComponent(threadId);
    const [thread, messages, steps, logs] = await Promise.allSettled([
      backendRequest(record, `/threads/${encoded}`),
      backendRequest(record, `/threads/${encoded}/messages?limit=160&compact=1`),
      backendRequest(record, `/threads/${encoded}/steps?limit=240&compact=1`),
      backendRequest(record, `/threads/${encoded}/logs?compact=1&includeConversation=0&limit=240`),
    ]);
    const threadRecord = thread.status === "fulfilled"
      ? asRecord(thread.value.thread || thread.value.data || thread.value)
      : {};
    return {
      status: text(threadRecord.status, 100).toLowerCase(),
      records: [
        ...(messages.status === "fulfilled" ? asArray(messages.value) : []),
        ...(steps.status === "fulfilled" ? asArray(steps.value) : []),
        ...(logs.status === "fulfilled" ? asArray(logs.value) : []),
        threadRecord,
      ],
    };
  }

  async function waitForThread(record, threadId, fallback) {
    const attempts = Math.max(1, Number(deps.threadPollAttempts) || 180);
    const delayMs = Math.max(100, Number(deps.threadPollMs) || 2_000);
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const inspection = await inspectThread(record, threadId);
      const parsed = parseTestRunOutput(inspection.records, fallback);
      if (parsed && (
        inspection.status === "completed"
        || (!inspection.status && attempt > 1)
      )) {
        return { ...parsed, records: inspection.records };
      }
      if (["failed", "cancelled"].includes(inspection.status)) {
        throw createRuntimeError(
          `The test executor thread ended with status ${inspection.status}.`,
          502,
        );
      }
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
    throw createRuntimeError("The test executor thread timed out.", 504);
  }

  async function resolveExecutorAgent(record, run) {
    if (text(run.agentId, 300)) return text(run.agentId, 300);
    const payload = await backendRequest(record, "/agents?limit=100");
    const agents = asArray(payload);
    const selected = agents.find((agent) => agent?.isDefault && agent?.id)
      || agents.find((agent) => /assistant/i.test(text(agent?.name)))
      || agents.find((agent) => agent?.id);
    const id = text(selected?.id, 300);
    if (!id) {
      throw createRuntimeError(
        "No executor agent is available for this test run.",
        409,
      );
    }
    return id;
  }

  async function acquireLease(record, runId) {
    const payload = await backendRequest(
      record,
      `/test-plans/runs/${encodeURIComponent(runId)}/lease`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: `${workerId}:${runId}`,
          ttlMs: RUN_LEASE_TTL_MS,
        }),
      },
    );
    const lease = asRecord(payload.lease);
    if (!text(lease.owner) || !text(lease.token) || !text(lease.expiresAt)) {
      throw createRuntimeError("The test run lease response was incomplete.", 502);
    }
    return {
      owner: text(lease.owner, 300),
      token: text(lease.token, 500),
      expiresAt: text(lease.expiresAt, 100),
      lost: false,
    };
  }

  async function heartbeatLease(record, runId, lease) {
    const payload = await backendRequest(
      record,
      `/test-plans/runs/${encodeURIComponent(runId)}/lease/heartbeat`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: lease.owner,
          token: lease.token,
          ttlMs: RUN_LEASE_TTL_MS,
        }),
      },
    );
    lease.expiresAt = text(asRecord(payload.lease).expiresAt, 100) || lease.expiresAt;
  }

  async function releaseLease(record, runId, lease) {
    await backendRequest(
      record,
      `/test-plans/runs/${encodeURIComponent(runId)}/lease`,
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ owner: lease.owner, token: lease.token }),
      },
    );
  }

  function startHeartbeat(record, runId, lease) {
    let active = false;
    const timer = setInterval(() => {
      if (active || lease.lost) return;
      active = true;
      heartbeatLease(record, runId, lease)
        .catch((error) => {
          if ([401, 403, 404, 409].includes(Number(error?.status || 0))) {
            lease.lost = true;
          }
          console.error("[tests] Test run heartbeat failed", {
            runId,
            leaseLost: lease.lost,
            message: error instanceof Error ? error.message : String(error),
          });
        })
        .finally(() => {
          active = false;
        });
    }, RUN_HEARTBEAT_MS);
    timer.unref?.();
    return timer;
  }

  async function patchRun(record, runId, lease, patch) {
    return await backendRequest(
      record,
      `/test-plans/runs/${encodeURIComponent(runId)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...patch,
          executionLease: {
            owner: lease.owner,
            token: lease.token,
          },
        }),
      },
    );
  }

  async function execute(record, runId) {
    const payload = await backendRequest(
      record,
      `/test-plans/runs/${encodeURIComponent(runId)}`,
    );
    const run = asRecord(payload.testRun || payload.run);
    const plan = asRecord(payload.testPlan);
    if (!run.id || !plan.id) {
      throw createRuntimeError("The test run snapshot could not be loaded.", 404);
    }
    if (["passed", "failed", "completed_with_errors", "cancelled"].includes(run.status)) {
      return run;
    }
    const lease = await acquireLease(record, runId);
    const timer = startHeartbeat(record, runId, lease);
    const startedAt = text(run.startedAt, 100) || new Date().toISOString();
    let threadId = text(asRecord(run.metadata).executorThreadId, 300);
    let agentId = "";
    let executionMode = "computer_agents_thread_v1";
    try {
      const definition = asRecord(
        asRecord(asRecord(run.metadata).testPlanSnapshot).definition
        || plan.definition,
      );
      let output = null;
      if (deterministicContractCases(definition)) {
        executionMode = "deterministic_contract_worker_v2";
        await patchRun(record, runId, lease, {
          status: "running",
          startedAt,
          metadata: {
            ...asRecord(run.metadata),
            executionMode,
          },
        });
        output = await executeDeterministicContractPlan(
          record,
          definition,
          run,
        );
      } else {
        if (!run.environmentId) {
          throw createRuntimeError(
            "Select a Computer Agents environment before running this test plan.",
            409,
          );
        }
        agentId = await resolveExecutorAgent(record, run);
        const prompt = buildExecutionPrompt({ plan, run });
        if (!threadId) {
          const thread = await createHiddenThread(record, { run, plan, agentId });
          threadId = thread.id;
          await patchRun(record, runId, lease, {
            status: "running",
            startedAt,
            metadata: {
              ...asRecord(run.metadata),
              executorThreadId: threadId,
              executorAgentId: agentId,
              executionMode,
              evidenceProvenance: selfReportedExecutionProvenance(threadId),
            },
          });
          const fallback = await executeThreadMessage(record, threadId, prompt);
          output = await waitForThread(record, threadId, fallback);
        } else {
          const inspection = await inspectThread(record, threadId);
          const parsed = parseTestRunOutput(inspection.records);
          if (parsed && TERMINAL_THREAD_STATUSES.has(inspection.status)) {
            output = { ...parsed, records: inspection.records };
          } else if (["failed", "cancelled"].includes(inspection.status)) {
            throw createRuntimeError(
              `The existing test executor thread ended with status ${inspection.status}.`,
              502,
            );
          } else if (inspection.status === "completed") {
            throw createRuntimeError(
              "The existing test executor thread completed without structured test results.",
              502,
            );
          } else {
            const promptWasSubmitted = inspection.records.some((entry) => (
              readRecordText(entry).includes(`Test run id: ${run.id}`)
            ));
            const fallback = promptWasSubmitted
              ? ""
              : await executeThreadMessage(record, threadId, prompt);
            output = await waitForThread(record, threadId, fallback);
          }
        }
      }
      const results = reconcileExpectedResults(definition, output.results);
      const failedCount = results.filter((result) => result.status === "failed").length;
      const errorCount = results.filter((result) => result.status === "error").length;
      const passedCount = results.filter((result) => result.status === "passed").length;
      const enabledCaseCount = asArray(definition.cases)
        .filter((testCase) => asRecord(testCase).enabled !== false)
        .length;
      const status = errorCount > 0
        ? "completed_with_errors"
        : failedCount > 0
          ? "failed"
          : enabledCaseCount > 0 && passedCount === enabledCaseCount
            ? "passed"
            : "completed_with_errors";
      const completedAt = new Date().toISOString();
      const response = await patchRun(record, runId, lease, {
        status,
        startedAt,
        completedAt,
        durationMs: Math.max(0, Date.parse(completedAt) - Date.parse(startedAt)),
        results: results.map((result) => ({
          ...result,
          startedAt: result.startedAt || startedAt,
          completedAt: result.completedAt || completedAt,
          evidence: {
            ...asRecord(result.evidence),
            executionMode,
            ...(threadId ? {
              executorThreadId: threadId,
              provenance: selfReportedExecutionProvenance(threadId),
            } : {}),
          },
        })),
        artifacts: output.artifacts,
        metadata: {
          ...asRecord(run.metadata),
          executorThreadId: threadId,
          executorAgentId: agentId,
          executionMode,
          ...(threadId ? {
            evidenceProvenance: selfReportedExecutionProvenance(threadId),
          } : {}),
          summary: output.summary,
        },
      });
      return response.testRun || response.run;
    } catch (error) {
      if (!lease.lost) {
        const completedAt = new Date().toISOString();
        await patchRun(record, runId, lease, {
          status: "completed_with_errors",
          startedAt,
          completedAt,
          durationMs: Math.max(0, Date.parse(completedAt) - Date.parse(startedAt)),
          results: [{
            caseId: "test-service-execution",
            name: "Test Service execution",
            kind: "custom",
            status: "error",
            attempt: 1,
            durationMs: Math.max(0, Date.parse(completedAt) - Date.parse(startedAt)),
            exitCode: null,
            summary: error instanceof Error ? error.message : String(error),
            diagnostics: {
              status: Number(error?.status || 0),
              stage: threadId
                ? "executor_thread"
                : executionMode.startsWith("deterministic_contract_worker_")
                  ? "deterministic_contract"
                  : "executor_setup",
            },
            evidence: {
              executorThreadId: threadId || null,
              redacted: true,
              provenance: selfReportedExecutionProvenance(threadId),
            },
            startedAt,
            completedAt,
          }],
          metadata: {
            ...asRecord(run.metadata),
            executorThreadId: threadId || "",
            executionMode,
            ...(threadId ? {
              evidenceProvenance: selfReportedExecutionProvenance(threadId),
            } : {}),
            executionError: error instanceof Error ? error.message : String(error),
          },
        }).catch(() => {});
      }
      throw error;
    } finally {
      clearInterval(timer);
      if (!lease.lost) {
        await releaseLease(record, runId, lease).catch((error) => {
          console.error("[tests] Failed to release test run lease", {
            runId,
            message: error instanceof Error ? error.message : String(error),
          });
        });
      }
    }
  }

  function makeRecord(request, body = {}) {
    return {
      requestContext: cloneRequestContext(request),
      upstreamUrl: parseUpstreamUrl(request, body),
      apiKey: readOptionalApiKey(request, body),
      body,
    };
  }

  function wake(request, runId) {
    const normalizedRunId = text(runId, 300);
    if (!normalizedRunId) {
      return Promise.reject(createRuntimeError("Test run id is required.", 400));
    }
    if (activeExecutions.has(normalizedRunId)) {
      return activeExecutions.get(normalizedRunId);
    }
    const execution = execute(makeRecord(request), normalizedRunId)
      .finally(() => activeExecutions.delete(normalizedRunId));
    activeExecutions.set(normalizedRunId, execution);
    return execution;
  }

  return Object.freeze({
    runs: Object.freeze({
      activeCount: () => activeExecutions.size,
      wake,
    }),
  });
}
