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

  async function backendRequest(record, path, options = {}) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}${path}`, {
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
      response = await fetch(`${upstreamUrl}/threads`, {
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
      response = await fetch(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
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
    try {
      if (!run.environmentId) {
        throw createRuntimeError(
          "Select a Computer Agents environment before running this test plan.",
          409,
        );
      }
      const agentId = await resolveExecutorAgent(record, run);
      const definition = asRecord(
        asRecord(asRecord(run.metadata).testPlanSnapshot).definition
        || plan.definition,
      );
      const prompt = buildExecutionPrompt({ plan, run });
      let output = null;
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
            executionMode: "computer_agents_thread_v1",
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
            executorThreadId: threadId,
            provenance: selfReportedExecutionProvenance(threadId),
          },
        })),
        artifacts: output.artifacts,
        metadata: {
          ...asRecord(run.metadata),
          executorThreadId: threadId,
          executorAgentId: agentId,
          executionMode: "computer_agents_thread_v1",
          evidenceProvenance: selfReportedExecutionProvenance(threadId),
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
              stage: threadId ? "executor_thread" : "executor_setup",
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
            executionMode: "computer_agents_thread_v1",
            evidenceProvenance: selfReportedExecutionProvenance(threadId),
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
