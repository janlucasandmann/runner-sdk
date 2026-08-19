import {
  EVALUATION_RUN_TTL_MS,
  createEvaluationId,
  getCreatorIdentity,
  normalizeEvaluator,
  normalizePassThreshold,
  normalizePersonIdentity,
  normalizeRunCount,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readComputeTokenValue,
  readUsdCostValue,
} from "./domain/primitives.mjs";
import {
  createEvaluationRun,
  normalizeComparable,
  normalizeDataRow,
  normalizeEvaluationSet,
  normalizeRunCase,
  recomputeRun,
} from "./domain/sets.mjs";
import {
  buildCaseRefinementPrompt,
  extractFinalSummaryFromRecords,
  extractStreamSummary,
  extractThreadRecord,
  isCaseRefinementPromptText,
  isUsableCaseRefinementResult,
  normalizeCaseRefinementResult,
  normalizeResponseArray,
  normalizeSourceThreadRecord,
  readRecordText,
  takeSourceThreadContext,
} from "./domain/records.mjs";
import {
  compactSnapshotRecord,
  extractThreadCostTokens,
  extractThreadCostUsd,
} from "./domain/costs.mjs";
import {
  buildEvaluatorPrompt,
  buildEvaluatorScoringCandidates,
  cloneRequestContext,
  createRuntimeError,
  isAssistantLikeRecord,
  isEvaluatorPromptText,
  isParsedEvaluatorResult,
  isUserLikeRecord,
  parseEvaluatorResult,
} from "./domain/scoring.mjs";
import {
  executeEvaluationTarget,
  hydrateEvaluationSourceAssets,
  normalizeEvaluationTargetBinding,
} from "./domain/targets.mjs";
import {
  runDeterministicGrader,
} from "./domain/deterministic-graders.mjs";
import {
  buildProxyPromptAdaptationsFromGuardrails,
  normalizeProxyGuardrailSets,
} from "../../guardrails/server/enrichment.mjs";
import { createEvaluationRunPersistenceCoordinator } from "./run-persistence.mjs";
import {
  knowledgeContextFromMetadata,
  normalizeKnowledgeContext,
} from "../../knowledge/server/knowledge-context.mjs";

const EVALUATION_RUN_LEASE_TTL_MS = 90_000;
const EVALUATION_RUN_HEARTBEAT_MS = 25_000;
const TERMINAL_EVALUATION_CASE_STATUSES = new Set([
  "completed",
  "passed",
  "failed",
  "invalid",
  "grader_error",
  "infrastructure_error",
  "cancelled",
  "error",
]);
const ACTIVE_EVALUATION_RUN_STATUSES = new Set(["queued", "running"]);
const TERMINAL_EVALUATION_RUN_STATUSES = new Set([
  "completed",
  "completed_with_errors",
  "failed",
  "cancelled",
]);
const CANONICAL_EVALUATION_RUN_BINDING_SCHEMA_VERSIONS = new Set([
  "computer_agents_evaluation_run_binding_v1",
  "computer_agents_evaluation_run_binding_v2",
  "computer_agents_evaluation_run_binding_v3",
]);

function readPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function assertEvaluationThreadDidNotFail(thread) {
  const threadStatus = normalizeString(thread?.status).toLowerCase();
  if (["failed", "cancelled"].includes(threadStatus)) {
    throw createRuntimeError(
      `The evaluation thread ended with status ${threadStatus}.`,
      502,
    );
  }
  return threadStatus;
}

export function createPlaygroundEvaluationsRuntime(deps = {}) {
  const {
    sendJson,
    readRequestBody,
    parseUpstreamUrl,
    readOptionalApiKey,
    withProxyOrganizationHeader,
    hasAiosSession,
    fetchAiosApi,
    fetchAiosCloud,
    enrichThreadPayloadWithAgentGuardrails,
  } = deps;
  const runsById = new Map();
  const activeExecutions = new Map();
  const runLeasesById = new Map();
  const terminalRunsPersisted = new Set();
  const durableExecutionEnabled = deps.durableExecutionEnabled === true;
  const fetchImpl = typeof deps.fetchImpl === "function" ? deps.fetchImpl : fetch;
  const executionOwnerId = normalizeString(deps.executionOwnerId) || createEvaluationId("evaluation_worker");
  const runPersistence = createEvaluationRunPersistenceCoordinator({
    persist: (record, run) => persistBackendEvaluationRun(record, run),
    onError(error, context) {
      console.error("[evaluations] Failed to persist evaluation run", {
        runId: context?.runId || "",
        message: error instanceof Error ? error.message : String(error),
      });
    },
  });

  function pruneRuns() {
    const now = Date.now();
    for (const [runId, record] of runsById.entries()) {
      if (now - Number(record.updatedAtMs || 0) > EVALUATION_RUN_TTL_MS) {
        runsById.delete(runId);
        runPersistence.forget(runId);
        terminalRunsPersisted.delete(runId);
      }
    }
  }

  function storeRun(record) {
    runsById.set(record.run.id, {
      ...record,
      updatedAtMs: Date.now(),
    });
  }

  function mergePersistedRunEnvelope(runId, payload) {
    const current = runsById.get(runId);
    if (!current) return null;
    const source = readPlainObject(
      payload?.run
        || payload?.evaluationRun
        || payload?.evaluation_run
        || payload?.data
        || payload,
    );
    if (!Object.keys(source).length) return current.run;
    const { cases: _persistedCases, ...envelope } = source;
    const mergedRun = recomputeRun({
      ...current.run,
      ...envelope,
      cases: current.run.cases,
    });
    storeRun({
      ...current,
      run: mergedRun,
    });
    return mergedRun;
  }

  function patchRun(runId, updater) {
    const record = runsById.get(runId);
    if (!record) return null;
    const nextRun = recomputeRun(typeof updater === "function" ? updater(record.run) : record.run);
    const nextRecord = { ...record, run: nextRun, updatedAtMs: Date.now() };
    runsById.set(runId, nextRecord);
    void runPersistence.enqueue(nextRecord, nextRun).catch(() => {});
    return nextRecord;
  }

  async function ensureRunPersisted(record) {
    const runId = normalizeString(record?.run?.id);
    if (!runId) return;
    try {
      await runPersistence.waitForIdle(runId);
    } catch {
      const latestRecord = runsById.get(runId) || record;
      await runPersistence.enqueue(latestRecord, latestRecord.run);
    }
  }

  async function refreshPersistedRunFromBackend(req, record, runId) {
    const body = {};
    const requestRecord = {
      ...record,
      requestContext: cloneRequestContext(req),
      upstreamUrl: parseUpstreamUrl(req, body),
      apiKey: readOptionalApiKey(req, body),
      body,
    };
    const data = await requestBackendJson(
      requestRecord,
      `/evaluations/runs/${encodeURIComponent(runId)}`,
      { method: "GET" },
      "Failed to refresh the persisted evaluation run.",
    );
    const persistedRunSource = data.run
      || data.evaluationRun
      || data.evaluation_run
      || data.data
      || data;
    const persistedMetadata = readPlainObject(persistedRunSource?.metadata);
    const persistedEmbeddedRun = readPlainObject(persistedMetadata.run);
    const persistedCases = Array.isArray(persistedRunSource?.cases)
      ? persistedRunSource.cases
      : Array.isArray(persistedEmbeddedRun.cases)
        ? persistedEmbeddedRun.cases
        : null;
    const persistedRun = recomputeRun({
      ...record.run,
      ...persistedRunSource,
      cases: persistedCases || record.run.cases,
    });
    if (normalizeString(persistedRun.id) !== runId) {
      throw createRuntimeError(
        "The persisted evaluation response did not match the requested run.",
        502,
      );
    }
    storeRun({
      ...record,
      run: persistedRun,
    });
    return persistedRun;
  }

  function patchRunCase(runId, caseId, patch) {
    return patchRun(runId, (run) => ({
      ...run,
      cases: run.cases.map((caseItem) => caseItem.id === caseId
        ? normalizeRunCase({ ...caseItem, ...patch })
        : caseItem),
    }));
  }

  async function patchRunDurably(runId, updater) {
    const record = patchRun(runId, updater);
    if (record) await ensureRunPersisted(record);
    return record;
  }

  async function patchRunCaseDurably(runId, caseId, patch) {
    const record = patchRunCase(runId, caseId, {
      ...patch,
      checkpointedAt: new Date().toISOString(),
    });
    if (record) await ensureRunPersisted(record);
    return record;
  }

  async function readJsonResponse(response, fallbackMessage) {
    const text = await response.text().catch(() => "");
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }
    if (!response.ok) {
      throw createRuntimeError(normalizeString(data?.message || data?.error || fallbackMessage || "Request failed"), response.status);
    }
    return data;
  }

  async function fetchBackendJson(record, path) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    if (apiKey) {
      const response = await fetchImpl(`${upstreamUrl}${path}`, {
        method: "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "X-API-Key": apiKey,
        }),
      });
      return await readJsonResponse(response, "Failed to load evaluation thread data.");
    }
    if (hasAiosSession(requestContext)) {
      const response = await fetchAiosApi(requestContext, `/api${path}`, { method: "GET" });
      return await readJsonResponse(response, "Failed to load evaluation thread data.");
    }
    throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
  }

  async function assertEvaluationActionAllowed(record, evaluationId, actionId) {
    const normalizedEvaluationId = normalizeString(evaluationId);
    const normalizedActionId = normalizeString(actionId);
    if (!normalizedEvaluationId || !normalizedActionId) {
      throw createRuntimeError(
        "A persisted evaluation and access action are required.",
        400,
      );
    }
    await fetchBackendJson(
      record,
      `/evaluations/${encodeURIComponent(normalizedEvaluationId)}`
        + `?accessAction=${encodeURIComponent(normalizedActionId)}`,
    );
  }

  async function requestBackendJson(record, path, options = {}, fallbackMessage = "Backend request failed.") {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    if (apiKey) {
      const response = await fetchImpl(`${upstreamUrl}${path}`, {
        method: options.method || "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          ...(options.headers || {}),
          "X-API-Key": apiKey,
        }),
        body: options.body,
      });
      return await readJsonResponse(response, fallbackMessage);
    }
    if (hasAiosSession(requestContext)) {
      const response = await fetchAiosApi(requestContext, `/api${path}`, {
        method: options.method || "GET",
        headers: options.headers,
        body: options.body,
      });
      return await readJsonResponse(response, fallbackMessage);
    }
    throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
  }

  async function requestBackendBytes(
    record,
    path,
    fallbackMessage = "Backend asset request failed.",
  ) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}${path}`, {
        method: "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "X-API-Key": apiKey,
        }),
      });
    } else if (hasAiosSession(requestContext)) {
      response = await fetchAiosApi(requestContext, `/api${path}`, {
        method: "GET",
      });
    } else {
      throw createRuntimeError(
        "Sign in to Computer Agents or provide an API key.",
        401,
      );
    }
    if (!response.ok) {
      await readJsonResponse(response, fallbackMessage);
    }
    return Buffer.from(await response.arrayBuffer());
  }

  function evaluationTargetCreateRequest(run) {
    const binding = run?.targetBinding
      && typeof run.targetBinding === "object"
      && !Array.isArray(run.targetBinding)
      ? run.targetBinding
      : null;
    if (!binding || binding.kind === "none") return null;
    if (binding.kind === "service_topology") {
      const snapshot = readPlainObject(binding.snapshot);
      const resources = Array.isArray(snapshot.resources)
        ? snapshot.resources.map((resource) => {
            const source = readPlainObject(resource);
            return {
              key: normalizeString(source.key),
              kind: normalizeString(source.kind),
              id: normalizeString(source.id),
              versionId: normalizeString(source.versionId) || undefined,
              ...(source.candidateAuthority
                && typeof source.candidateAuthority === "object"
                && !Array.isArray(source.candidateAuthority)
                ? { candidateAuthority: source.candidateAuthority }
                : {}),
            };
          })
        : [];
      return {
        kind: "service_topology",
        entrypoint: normalizeString(snapshot.entrypoint),
        resources,
        environmentId: binding.environmentId || undefined,
        invocation: binding.invocation || undefined,
      };
    }
    return {
      kind: binding.kind,
      id: binding.targetId,
      versionId: binding.targetVersionId || undefined,
      environmentId: binding.environmentId || undefined,
      invocation: binding.invocation || undefined,
      ...(binding.candidateAuthority
        && typeof binding.candidateAuthority === "object"
        && !Array.isArray(binding.candidateAuthority)
        ? { candidateAuthority: binding.candidateAuthority }
        : {}),
    };
  }

  function buildEvaluationRunCreatePayload(run) {
    const normalizedRun = recomputeRun(run);
    const knowledgeContext = normalizeKnowledgeContext(
      normalizedRun.knowledgeContext
        || knowledgeContextFromMetadata(normalizedRun.metadata),
      { source: "evaluation" },
    );
    const metadata = {
      ...(normalizedRun.metadata
        && typeof normalizedRun.metadata === "object"
        && !Array.isArray(normalizedRun.metadata)
        ? normalizedRun.metadata
        : {}),
      executionContractVersion: "evaluation_execution_v3",
      fineTuningJobId: normalizedRun.fineTuningJobId,
      targetAgentVersionId: normalizedRun.targetAgentVersionId,
      targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber,
      targetGuardrailId: normalizedRun.targetGuardrailId,
      targetGuardrailVersionId: normalizedRun.targetGuardrailVersionId,
      ...(knowledgeContext ? { knowledgeContext } : {}),
    };
    const target = evaluationTargetCreateRequest(normalizedRun);
    return {
      id: normalizedRun.id,
      ...(target ? { target } : {}),
      agentId: normalizedRun.targetAgentId,
      environmentId: normalizedRun.environmentId,
      versionId: normalizedRun.evaluationVersionId,
      purpose: normalizedRun.purpose,
      label: normalizedRun.label,
      metadata,
      ...(knowledgeContext ? { knowledgeContext } : {}),
      run: normalizedRun,
    };
  }

  function canonicalEvaluationCaseStatus(caseItem) {
    const status = normalizeString(caseItem?.status).toLowerCase();
    if (status === "passed" || status === "completed") return "passed";
    if (status === "failed") return "failed";
    if (status === "cancelled") return "skipped";
    return "error";
  }

  function buildCanonicalEvaluationCaseResult(caseItem) {
    const status = canonicalEvaluationCaseStatus(caseItem);
    return {
      caseId: normalizeString(caseItem?.dataRowId || caseItem?.data_row_id),
      status,
      ...(status === "skipped"
        ? { score: null }
        : status === "error"
          ? { score: 0 }
          : { score: Number(caseItem?.score ?? (status === "passed" ? 1 : 0)) }),
      output: caseItem?.actualOutput ?? caseItem?.actual_output ?? null,
      explanation: normalizeString(
        caseItem?.evaluatorReason || caseItem?.evaluator_reason,
      ),
      error: status === "error"
        ? (
            normalizeString(caseItem?.error)
            || normalizeString(caseItem?.evaluatorOutput || caseItem?.evaluator_output)
            || "Evaluation case execution failed."
          )
        : null,
      durationMs: Math.max(
        0,
        Math.round(Number(caseItem?.latencyMs || caseItem?.latency_ms || 0) || 0),
      ),
      evaluator: {
        type: normalizeString(caseItem?.evaluatorType || caseItem?.evaluator_type)
          || "evaluation_runtime",
        parseStatus: normalizeString(
          caseItem?.evaluatorParseStatus || caseItem?.evaluator_parse_status,
        ) || null,
      },
      metadata: {
        caseRunId: normalizeString(caseItem?.id) || null,
        threadId: normalizeString(caseItem?.threadId || caseItem?.thread_id) || null,
        evaluatorThreadId: normalizeString(
          caseItem?.evaluatorThreadId || caseItem?.evaluator_thread_id,
        ) || null,
        optimizationRole: normalizeString(
          caseItem?.optimizationRole || caseItem?.optimization_role,
        ) || null,
        failureStage: normalizeString(
          caseItem?.failureStage || caseItem?.failure_stage,
        ) || null,
        targetExecution:
          caseItem?.targetExecution
          || caseItem?.target_execution
          || null,
        sourceAssets: Array.isArray(
          caseItem?.sourceAssets || caseItem?.source_assets,
        )
          ? (caseItem.sourceAssets || caseItem.source_assets)
          : [],
        executionAttempt: Math.max(
          0,
          Number(caseItem?.executionAttempt || caseItem?.execution_attempt || 0) || 0,
        ),
      },
    };
  }

  function buildEvaluationRunReportPayload(run) {
    const normalizedRun = recomputeRun(run);
    const executionLease = runLeasesById.get(normalizedRun.id);
    const status = TERMINAL_EVALUATION_RUN_STATUSES.has(normalizedRun.status)
      ? normalizedRun.status
      : "running";
    const terminal = TERMINAL_EVALUATION_RUN_STATUSES.has(status);
    return {
      status,
      ...(terminal
        ? {
            results: normalizedRun.cases.map(buildCanonicalEvaluationCaseResult),
            costCt: normalizedRun.costTokens,
            costUsd: normalizedRun.costUsd,
            evaluatorFingerprint: normalizeString(normalizedRun.evaluatorFingerprint) || null,
            systemFingerprint: normalizeString(normalizedRun.systemFingerprint) || null,
          }
        : {}),
      metadata: {
        executionContractVersion: "evaluation_execution_v3",
        runtimeStatus: normalizedRun.status,
        platformVersion: normalizeString(
          deps.platformVersion || deps.runtimeVersion,
        ) || null,
      },
      ...(executionLease ? {
        executionLease: {
          owner: executionLease.owner,
          token: executionLease.token,
        },
      } : {}),
    };
  }

  async function persistBackendEvaluationRun(record, run) {
    const normalizedRun = recomputeRun(run);
    if (!normalizedRun.id || !normalizedRun.evaluationSetId) return null;
    if (terminalRunsPersisted.has(normalizedRun.id)) {
      return {
        object: "evaluation_run",
        run: normalizedRun,
        idempotent: true,
      };
    }
    const reportPayload = buildEvaluationRunReportPayload(normalizedRun);
    try {
      const persisted = await requestBackendJson(
        record,
        `/evaluations/runs/${encodeURIComponent(normalizedRun.id)}?view=status`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(reportPayload),
        },
        "Failed to persist evaluation run."
      );
      if (TERMINAL_EVALUATION_RUN_STATUSES.has(normalizedRun.status)) {
        terminalRunsPersisted.add(normalizedRun.id);
      }
      mergePersistedRunEnvelope(normalizedRun.id, persisted);
      return persisted;
    } catch (error) {
      if (Number(error?.status || 0) !== 404) throw error;
      return await requestBackendJson(
        record,
        `/evaluations/${encodeURIComponent(normalizedRun.evaluationSetId)}/runs`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(buildEvaluationRunCreatePayload(normalizedRun)),
        },
        "Failed to create persisted evaluation run."
      );
    }
  }

  async function acquireRunLease(record, runId, claimId) {
    const payload = await requestBackendJson(
      record,
      `/evaluations/runs/${encodeURIComponent(runId)}/lease`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: claimId,
          ttlMs: EVALUATION_RUN_LEASE_TTL_MS,
        }),
      },
      "Failed to acquire the evaluation run execution lease.",
    );
    const lease = payload?.lease && typeof payload.lease === "object" ? payload.lease : null;
    if (!normalizeString(lease?.token) || !normalizeString(lease?.expiresAt)) {
      throw createRuntimeError("The evaluation run lease response was incomplete.", 502);
    }
    return {
      owner: normalizeString(lease.owner) || claimId,
      token: normalizeString(lease.token),
      attempt: Math.max(1, Number(lease.attempt || 1) || 1),
      expiresAt: normalizeString(lease.expiresAt),
      lost: false,
    };
  }

  async function heartbeatRunLease(record, runId, lease) {
    const payload = await requestBackendJson(
      record,
      `/evaluations/runs/${encodeURIComponent(runId)}/lease/heartbeat`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: lease.owner,
          token: lease.token,
          ttlMs: EVALUATION_RUN_LEASE_TTL_MS,
        }),
      },
      "Failed to renew the evaluation run execution lease.",
    );
    const nextLease = payload?.lease && typeof payload.lease === "object" ? payload.lease : {};
    lease.expiresAt = normalizeString(nextLease.expiresAt) || lease.expiresAt;
    return lease;
  }

  async function releaseRunLease(record, runId, lease) {
    if (!lease?.owner || !lease?.token) return;
    await requestBackendJson(
      record,
      `/evaluations/runs/${encodeURIComponent(runId)}/lease`,
      {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          owner: lease.owner,
          token: lease.token,
        }),
      },
      "Failed to release the evaluation run execution lease.",
    );
  }

  function assertRunLease(runId) {
    const lease = runLeasesById.get(runId);
    const expiresAtMs = Date.parse(normalizeString(lease?.expiresAt));
    if (!lease || lease.lost || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
      throw createRuntimeError("The evaluation run execution lease was lost.", 409);
    }
    return lease;
  }

  function startRunLeaseHeartbeat(record, runId, lease) {
    let heartbeatInFlight = false;
    const timer = setInterval(() => {
      if (heartbeatInFlight || lease.lost) return;
      heartbeatInFlight = true;
      heartbeatRunLease(record, runId, lease)
        .catch((error) => {
          const status = Number(error?.status || 0);
          const expiresAtMs = Date.parse(normalizeString(lease.expiresAt));
          if (status === 401 || status === 403 || status === 404 || status === 409 || !Number.isFinite(expiresAtMs) || expiresAtMs <= Date.now()) {
            lease.lost = true;
          }
          console.error("[evaluations] Evaluation run lease heartbeat failed", {
            runId,
            status,
            leaseLost: lease.lost,
            message: error instanceof Error ? error.message : String(error),
          });
        })
        .finally(() => {
          heartbeatInFlight = false;
        });
    }, EVALUATION_RUN_HEARTBEAT_MS);
    timer.unref?.();
    return timer;
  }

  function unwrapGuardrailRecord(payload) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload.guardrail || payload.version || payload.data?.guardrail || payload.data?.version || payload.data || payload;
  }

  async function resolveEvaluationGuardrailTarget(record, runOptions = {}) {
    const guardrailId = normalizeString(
      runOptions.targetGuardrailId
      || runOptions.target_guardrail_id
      || runOptions.guardrailId
      || runOptions.guardrail_id
    );
    if (!guardrailId) return null;
    const versionId = normalizeString(
      runOptions.targetGuardrailVersionId
      || runOptions.target_guardrail_version_id
      || runOptions.guardrailVersionId
      || runOptions.guardrail_version_id
    );
    const providedSnapshot = runOptions.targetGuardrailSnapshot && typeof runOptions.targetGuardrailSnapshot === "object"
      ? runOptions.targetGuardrailSnapshot
      : runOptions.target_guardrail_snapshot && typeof runOptions.target_guardrail_snapshot === "object"
        ? runOptions.target_guardrail_snapshot
        : null;
    const targetQuery = versionId
      ? `?versionId=${encodeURIComponent(versionId)}`
      : "";
    const targetPayload = await requestBackendJson(
      record,
      `/guardrails/${encodeURIComponent(guardrailId)}/evaluation-target${targetQuery}`,
      { method: "GET" },
      "You do not have permission to evaluate this guardrail."
    );
    const guardrailRecord = unwrapGuardrailRecord(targetPayload?.guardrail);
    const versionRecord = unwrapGuardrailRecord(targetPayload?.version);
    const versionSnapshot = versionRecord?.snapshot && typeof versionRecord.snapshot === "object"
      ? versionRecord.snapshot
      : null;
    const source = {
      ...(providedSnapshot || {}),
      ...(guardrailRecord && typeof guardrailRecord === "object" ? guardrailRecord : {}),
      ...(versionSnapshot || {}),
      id: guardrailId,
      name: normalizeString(
        runOptions.targetGuardrailName
        || runOptions.target_guardrail_name
        || versionSnapshot?.name
        || providedSnapshot?.name
        || guardrailRecord?.name
      ) || "Guardrail",
      prompts: versionSnapshot?.prompts || guardrailRecord?.prompts || providedSnapshot?.prompts || [],
    };
    const normalized = normalizeProxyGuardrailSets([source])[0] || null;
    if (!normalized) {
      throw createRuntimeError("The target guardrail has no enforceable prompts.", 400);
    }
    return normalized;
  }

  async function createHiddenThread(record, {
    title,
    agentId,
    agentVersionId = "",
    environmentId,
    projectId,
    metadata,
    guardrail = null,
  }) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const knowledgeContext = normalizeKnowledgeContext(
      knowledgeContextFromMetadata(metadata),
      { source: "evaluation" },
    );
    const explicitGuardrails = guardrail ? [guardrail] : [];
    const explicitPromptAdaptations = buildProxyPromptAdaptationsFromGuardrails(explicitGuardrails);
    const guardrailMetadata = guardrail ? {
      version: 1,
      guardrailSetIds: [guardrail.id],
      guardrails: explicitGuardrails,
      promptAdaptations: explicitPromptAdaptations,
    } : null;
    const payload = {
      title,
      appId: "runner-web-sdk-demo",
      agentId,
      environmentId,
      ...(projectId ? { projectId } : {}),
      ...(normalizeString(agentVersionId) ? {
        agentVersionId: normalizeString(agentVersionId),
        agent_version_id: normalizeString(agentVersionId),
        targetAgentVersionId: normalizeString(agentVersionId),
        target_agent_version_id: normalizeString(agentVersionId),
      } : {}),
      hidden: true,
      sidebarHidden: true,
      ...(guardrail ? {
        guardrailSetIds: [guardrail.id],
        guardrail_set_ids: [guardrail.id],
        guardrails: explicitGuardrails,
        promptAdaptations: explicitPromptAdaptations,
        prompt_adaptations: explicitPromptAdaptations,
        invisiblePromptAdaptations: explicitPromptAdaptations,
        invisible_prompt_adaptations: explicitPromptAdaptations,
      } : {}),
      ...(knowledgeContext ? { knowledgeContext } : {}),
      metadata: {
        ...(metadata || {}),
        ...(knowledgeContext ? { knowledgeContext } : {}),
        ...(guardrail ? {
          guardrailSetIds: [guardrail.id],
          guardrail_set_ids: [guardrail.id],
          guardrails: explicitGuardrails,
          promptAdaptations: explicitPromptAdaptations,
          invisiblePromptAdaptations: explicitPromptAdaptations,
          runnerGuardrails: guardrailMetadata,
        } : {}),
      },
    };
    const enrichedPayload = typeof enrichThreadPayloadWithAgentGuardrails === "function"
      ? await enrichThreadPayloadWithAgentGuardrails(requestContext, upstreamUrl, apiKey, payload)
      : payload;
    let response;
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}/threads`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(enrichedPayload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, "/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(enrichedPayload),
          })
        : await fetchAiosApi(requestContext, "/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(enrichedPayload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create evaluation thread.");
    const thread = extractThreadRecord(data);
    if (!thread?.id) {
      throw createRuntimeError("Thread creation succeeded but no thread id was returned.", 502);
    }
    return {
      ...thread,
      hidden: true,
      sidebarHidden: true,
      metadata: {
        ...(metadata || {}),
        ...(thread.metadata && typeof thread.metadata === "object" ? thread.metadata : {}),
      },
    };
  }

  function readEvaluationThreadMetadata(thread) {
    const metadata = thread?.metadata && typeof thread.metadata === "object" && !Array.isArray(thread.metadata)
      ? thread.metadata
      : {};
    const evaluation = metadata.evaluation && typeof metadata.evaluation === "object" && !Array.isArray(metadata.evaluation)
      ? metadata.evaluation
      : {};
    const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
      ? metadata.runnerPlayground
      : {};
    return {
      runId: normalizeString(evaluation.runId || runnerPlayground.evaluationRunId),
      caseId: normalizeString(evaluation.caseId || runnerPlayground.evaluationCaseId),
      kind: normalizeString(evaluation.kind || runnerPlayground.evaluationKind),
    };
  }

  async function findExistingEvaluationThread(record, { runId, caseId, kind }) {
    const payload = await fetchBackendJson(
      record,
      "/threads?appId=runner-web-sdk-demo&limit=500",
    ).catch(() => null);
    const threads = normalizeResponseArray(payload, ["threads"]);
    return threads.find((thread) => {
      const metadata = readEvaluationThreadMetadata(thread);
      return metadata.runId === runId && metadata.caseId === caseId && metadata.kind === kind;
    }) || null;
  }

  async function inspectThreadDispatch(record, threadId, content) {
    const encodedThreadId = encodeURIComponent(threadId);
    const [messagesResult, threadResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=160&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
    ]);
    const messages = messagesResult.status === "fulfilled"
      ? normalizeResponseArray(messagesResult.value, ["messages"])
      : [];
    const expectedContent = normalizeString(content);
    const inputPersisted = messages.some((message) => (
      isUserLikeRecord(message)
      && normalizeString(readRecordText(message)) === expectedContent
    ));
    const thread = threadResult.status === "fulfilled"
      ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value)
      : null;
    return {
      inputPersisted,
      messages,
      status: normalizeString(thread?.status).toLowerCase(),
    };
  }

  async function waitForExistingThreadCompletion(record, threadId, content, fallback = "") {
    const maxAttempts = Math.max(1, Number(deps.threadRecoveryPollAttempts) || 120);
    const pollMs = Math.max(50, Number(deps.threadRecoveryPollMs) || 2_500);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const inspection = await inspectThreadDispatch(record, threadId, content);
      const messageSummary = extractFinalSummaryFromRecords(inspection.messages);
      if (["failed", "cancelled"].includes(inspection.status)) {
        throw createRuntimeError(`The evaluation thread ended with status ${inspection.status}.`, 502);
      }
      if (["completed"].includes(inspection.status)) {
        return await waitForFinalSummary(record, threadId, messageSummary || fallback);
      }
      if (messageSummary && !["running", "permission_asked"].includes(inspection.status)) {
        return messageSummary;
      }
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, pollMs));
      }
    }
    throw createRuntimeError(
      "The evaluation thread did not reach a durable terminal state before the recovery timeout.",
      504,
    );
  }

  async function executeThreadMessageOnce(record, threadId, content) {
    const inspection = await inspectThreadDispatch(record, threadId, content);
    if (inspection.inputPersisted || ["running", "permission_asked"].includes(inspection.status)) {
      return await waitForExistingThreadCompletion(record, threadId, content);
    }
    return await runThreadMessage(record, threadId, content);
  }

  async function waitForFinalSummary(record, threadId, fallback = "") {
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const encodedThreadId = encodeURIComponent(threadId);
      const [stepsResult, logsResult, threadResult] = await Promise.allSettled([
        fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=120&compact=1`),
        fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=120`),
        fetchBackendJson(record, `/threads/${encodedThreadId}`),
      ]);
      const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
      const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
      const summary = extractFinalSummaryFromRecords([...steps, ...logs]);
      if (summary) return summary;
      if (threadResult.status === "fulfilled") {
        const threadRecord = threadResult.value?.thread
          || threadResult.value?.data
          || threadResult.value;
        assertEvaluationThreadDidNotFail(threadRecord);
        const threadText = readRecordText(threadRecord);
        if (threadText) return threadText;
      }
      await new Promise((resolve) => setTimeout(resolve, 700 + attempt * 250));
    }
    return normalizeString(fallback);
  }

  async function runThreadMessage(record, threadId, content) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    const payload = { content, task: content };
    if (apiKey) {
      response = await fetchImpl(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/threads/${encodeURIComponent(threadId)}/messages`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    if (!response.ok) {
      await readJsonResponse(response, "Failed to start evaluation thread.");
    }
    const streamText = await response.text().catch(() => "");
    const streamSummary = extractStreamSummary(streamText);
    return await waitForFinalSummary(record, threadId, streamSummary);
  }

  async function waitForEvaluatorResult(record, threadId, fallback = "") {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) {
      const parsed = parseEvaluatorResult(fallback);
      return { output: normalizeString(fallback), parsed };
    }
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const encodedThreadId = encodeURIComponent(normalizedThreadId);
      const [messagesResult, stepsResult, logsResult, threadResult] = await Promise.allSettled([
        fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=80&compact=1`),
        fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=120&compact=1`),
        fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=120`),
        fetchBackendJson(record, `/threads/${encodedThreadId}`),
      ]);
      const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
      const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
      const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
      const threadRecord = threadResult.status === "fulfilled"
        ? [threadResult.value?.thread || threadResult.value?.data || threadResult.value].filter(Boolean)
        : [];
      const candidates = buildEvaluatorScoringCandidates([
        ...messages,
        ...steps,
        ...logs,
        ...threadRecord,
      ], fallback);
      for (const candidate of candidates) {
        const parsed = parseEvaluatorResult(candidate.text);
        if (isParsedEvaluatorResult(parsed)) {
          return { output: candidate.text, parsed };
        }
      }
      const combinedText = candidates.map((candidate) => candidate.text).filter(Boolean).join("\n\n");
      const combinedParsed = parseEvaluatorResult(combinedText);
      if (isParsedEvaluatorResult(combinedParsed)) {
        return { output: combinedText, parsed: combinedParsed };
      }
      if (attempt < 6) {
        await new Promise((resolve) => setTimeout(resolve, 700 + attempt * 250));
      }
    }
    const parsed = parseEvaluatorResult(fallback);
    return { output: normalizeString(fallback), parsed };
  }

  async function fetchThreadCostTokens(record, threadId) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) return 0;
    const encodedThreadId = encodeURIComponent(normalizedThreadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=160&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=160`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=80&compact=1`),
    ]);
    const thread = threadResult.status === "fulfilled" ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value) : null;
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    return extractThreadCostTokens([thread, ...steps, ...logs, ...messages].filter(Boolean));
  }

  async function fetchThreadCostUsd(record, threadId) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) return 0;
    const encodedThreadId = encodeURIComponent(normalizedThreadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=160&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=160`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=80&compact=1`),
    ]);
    const thread = threadResult.status === "fulfilled" ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value) : null;
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    return extractThreadCostUsd([thread, ...steps, ...logs, ...messages].filter(Boolean));
  }

  async function buildThreadSnapshot(record, { threadId, row, evaluationSet, actualOutput }) {
    const encodedThreadId = encodeURIComponent(threadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=160&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=160`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=80&compact=1`),
    ]);
    const thread = threadResult.status === "fulfilled" ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value) : null;
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    const finalSummary = extractFinalSummaryFromRecords([...steps, ...logs]) || normalizeString(actualOutput);
    const costTokens = extractThreadCostTokens([thread, ...steps, ...logs, ...messages].filter(Boolean));
    const costUsd = extractThreadCostUsd([thread, ...steps, ...logs, ...messages].filter(Boolean));
    return {
      version: "evaluation_snapshot_v1",
      generatedAt: new Date().toISOString(),
      threadId,
      costTokens,
      costUsd,
      thread: thread && typeof thread === "object" ? {
        id: normalizeString(thread.id || thread.threadId || thread.thread_id) || threadId,
        title: normalizeString(thread.title || thread.name),
        status: normalizeString(thread.status),
      } : { id: threadId },
      input: row.input,
      expectedOutput: row.expectedOutput,
      datasetGuidance: evaluationSet.evaluationGuidance || "",
      rowGuidance: row.evaluationGuidance || "",
      finalSummary,
      messages: messages.map(compactSnapshotRecord).filter(Boolean).slice(-20),
      steps: steps.map(compactSnapshotRecord).filter(Boolean).slice(-30),
      logs: logs.map(compactSnapshotRecord).filter(Boolean).slice(-30),
    };
  }

  async function buildSourceThreadRefinementSnapshot(record, threadId, fallbackThread = {}) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) {
      throw createRuntimeError("Source thread id is required.", 400);
    }
    const encodedThreadId = encodeURIComponent(normalizedThreadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=180&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=180`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=160&compact=1`),
    ]);
    const fetchedThread = threadResult.status === "fulfilled"
      ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value)
      : null;
    const sourceThread = normalizeSourceThreadRecord(fetchedThread || fallbackThread, normalizedThreadId);
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    const finalSummary = extractFinalSummaryFromRecords([...steps, ...logs]);
    return {
      version: "evaluation_source_thread_snapshot_v1",
      generatedAt: new Date().toISOString(),
      threadId: normalizedThreadId,
      thread: {
        id: sourceThread.id || normalizedThreadId,
        title: sourceThread.title,
        status: sourceThread.status,
        agentId: sourceThread.agentId,
        agentName: sourceThread.agentName,
        environmentId: sourceThread.environmentId,
        environmentName: sourceThread.environmentName,
        createdAt: sourceThread.createdAt,
        updatedAt: sourceThread.updatedAt,
      },
      finalSummary,
      messages: takeSourceThreadContext(messages.map(compactSnapshotRecord).filter(Boolean), 8, 18),
      steps: takeSourceThreadContext(steps.map(compactSnapshotRecord).filter(Boolean), 4, 22),
      logs: takeSourceThreadContext(logs.map(compactSnapshotRecord).filter(Boolean), 4, 22),
    };
  }

  function buildCaseRefinementMetadata({ evaluationSet, sourceThreadId }) {
    return {
      evaluation: {
        setId: evaluationSet.id,
        kind: "case_refinement",
        sourceThreadId,
        hidden: true,
        sidebarHidden: true,
      },
      runnerPlayground: {
        type: "evaluation_case_refinement",
        evaluationSetId: evaluationSet.id,
        evaluationKind: "case_refinement",
        sourceThreadId,
        hidden: true,
        sidebarHidden: true,
        privateMode: true,
      },
    };
  }

  async function waitForCaseRefinementResult(record, threadId, fallback = "") {
    const fallbackText = isCaseRefinementPromptText(fallback) ? "" : normalizeString(fallback);
    const fallbackResult = normalizeCaseRefinementResult(fallbackText);
    if (isUsableCaseRefinementResult(fallbackResult)) {
      return { output: fallbackText, parsed: fallbackResult };
    }
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) {
      return { output: normalizeString(fallback), parsed: fallbackResult };
    }
    for (let attempt = 0; attempt < 6; attempt += 1) {
      const encodedThreadId = encodeURIComponent(normalizedThreadId);
      const [messagesResult, stepsResult, logsResult, threadResult] = await Promise.allSettled([
        fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=80&compact=1`),
        fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=120&compact=1`),
        fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=120`),
        fetchBackendJson(record, `/threads/${encodedThreadId}`),
      ]);
      const records = [
        ...(messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : []),
        ...(stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : []),
        ...(logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : []),
        ...(threadResult.status === "fulfilled" ? [threadResult.value?.thread || threadResult.value?.data || threadResult.value].filter(Boolean) : []),
      ];
      const candidates = buildEvaluatorScoringCandidates(records, fallbackText)
        .map((candidate) => candidate.text)
        .filter((text) => !isCaseRefinementPromptText(text))
        .filter(Boolean);
      for (const candidate of candidates) {
        const parsed = normalizeCaseRefinementResult(candidate);
        if (isUsableCaseRefinementResult(parsed)) {
          return { output: candidate, parsed };
        }
      }
      if (attempt < 5) {
        await new Promise((resolve) => setTimeout(resolve, 700 + attempt * 250));
      }
    }
    return { output: fallbackText, parsed: fallbackResult };
  }

  function buildDataRowFromCaseRefinement({ refinement, snapshot, refinerThreadId }) {
    const sourceThread = normalizeSourceThreadRecord(snapshot.thread || {}, snapshot.threadId);
    const nowIso = new Date().toISOString();
    const metadata = {
      source: "thread",
      sourceThreadId: sourceThread.id,
      sourceThreadTitle: sourceThread.title,
      sourceAgentId: sourceThread.agentId,
      sourceAgentName: sourceThread.agentName,
      sourceEnvironmentId: sourceThread.environmentId,
      sourceEnvironmentName: sourceThread.environmentName,
      sourceCreatedAt: sourceThread.createdAt,
      sourceUpdatedAt: sourceThread.updatedAt,
      generatedAt: nowIso,
      extractionVersion: "thread_case_llm_refine_v1",
      refinement: {
        refinerThreadId,
        sourceAssessment: refinement.sourceAssessment,
        sourceFailureReason: refinement.sourceFailureReason,
        caseIntent: refinement.caseIntent,
        confidence: refinement.confidence,
        needsReview: refinement.needsReview,
      },
    };
    return normalizeDataRow({
      id: createEvaluationId("eval_case"),
      input: refinement.input,
      expectedOutput: refinement.expectedOutput,
      evaluationGuidance: refinement.evaluationGuidance,
      runCount: 1,
      sourceThreadId: sourceThread.id,
      sourceThreadTitle: sourceThread.title,
      sourceAgentId: sourceThread.agentId,
      sourceAgentName: sourceThread.agentName,
      sourceEnvironmentId: sourceThread.environmentId,
      sourceEnvironmentName: sourceThread.environmentName,
      sourceCreatedAt: sourceThread.createdAt,
      sourceUpdatedAt: sourceThread.updatedAt,
      reviewStatus: refinement.needsReview ? "needs_review" : "draft",
      metadata,
      createdAt: nowIso,
      updatedAt: nowIso,
    });
  }

  function buildCaseMetadata({ evaluationSet, run, caseRun, row, kind, sourceThreadId = "" }) {
    const evaluator = normalizeEvaluator(run.evaluator || evaluationSet.evaluator);
    const knowledgeContext = normalizeKnowledgeContext(
      run.knowledgeContext || run.metadata?.knowledgeContext,
      { source: "evaluation" },
    );
    const evaluatorMetadata = kind === "evaluator"
      ? {
          evaluatorAgentId: evaluator.agentId,
          evaluatorAgentVersionId: evaluator.agentVersionId,
          evaluatorAgentVersionNumber: evaluator.agentVersionNumber,
          evaluatorAgentVersionLabel: evaluator.agentVersionLabel,
          evaluatorAgentVersionRevisionId: evaluator.agentVersionRevisionId,
        }
      : {};
    return {
      evaluation: {
        setId: evaluationSet.id,
        runId: run.id,
        caseId: caseRun.id,
        dataRowId: row.id,
        kind,
        sourceThreadId,
        hidden: true,
        sidebarHidden: true,
        environmentType: run.environmentType,
        projectId: run.projectId,
        environmentId: run.environmentId,
        targetAgentVersionId: run.targetAgentVersionId || "",
        targetAgentVersionNumber: run.targetAgentVersionNumber || 0,
        targetAgentVersionLabel: run.targetAgentVersionLabel || "",
        targetAgentVersionRevisionId: run.targetAgentVersionRevisionId || "",
        targetGuardrailId: run.targetGuardrailId || "",
        targetGuardrailName: run.targetGuardrailName || "",
        targetGuardrailVersionId: run.targetGuardrailVersionId || "",
        targetGuardrailVersionNumber: run.targetGuardrailVersionNumber || 0,
        targetGuardrailVersionLabel: run.targetGuardrailVersionLabel || "",
        ...(knowledgeContext ? { knowledgeContext } : {}),
        ...evaluatorMetadata,
      },
      runnerPlayground: {
        type: kind === "evaluator" ? "evaluation_evaluator" : "evaluation_case",
        evaluationSetId: evaluationSet.id,
        evaluationRunId: run.id,
        evaluationCaseId: caseRun.id,
        evaluationDataRowId: row.id,
        evaluationKind: kind,
        sourceThreadId,
        hidden: true,
        sidebarHidden: true,
        environmentType: run.environmentType,
        projectId: run.projectId,
        environmentId: run.environmentId,
        targetAgentVersionId: run.targetAgentVersionId || "",
        targetAgentVersionNumber: run.targetAgentVersionNumber || 0,
        targetAgentVersionLabel: run.targetAgentVersionLabel || "",
        targetAgentVersionRevisionId: run.targetAgentVersionRevisionId || "",
        targetGuardrailId: run.targetGuardrailId || "",
        targetGuardrailName: run.targetGuardrailName || "",
        targetGuardrailVersionId: run.targetGuardrailVersionId || "",
        targetGuardrailVersionNumber: run.targetGuardrailVersionNumber || 0,
        targetGuardrailVersionLabel: run.targetGuardrailVersionLabel || "",
        ...(knowledgeContext ? { knowledgeContext } : {}),
        ...evaluatorMetadata,
      },
    };
  }

  async function runEvaluationCase(record, caseRun, index) {
    const { evaluationSet, run } = record;
    const row = evaluationSet.dataRows.find((item) => item.id === caseRun.dataRowId) || evaluationSet.dataRows[index] || null;
    if (!row) {
      await patchRunCaseDurably(run.id, caseRun.id, {
        status: "infrastructure_error",
        score: null,
        error: "Evaluation data row could not be resolved.",
        executionStage: "",
        failureStage: "resolving_case",
        completedAt: new Date().toISOString(),
      });
      return;
    }
    const title = `${evaluationSet.name || "Evaluation"} · ${run.label || "Run"} · Case ${index + 1}`;
    const startedAtIso = normalizeString(caseRun.startedAt) || new Date().toISOString();
    const startedAtMs = Date.parse(startedAtIso) || Date.now();
    const previousExecutionStage = normalizeString(caseRun.executionStage);
    const targetType = normalizeString(run.targetType).toLowerCase()
      || (run.targetAgentId ? "agent" : "none");
    const agentTarget = targetType === "agent";
    let caseThreadId = normalizeString(caseRun.threadId);
    await patchRunCaseDurably(run.id, caseRun.id, {
      status: "running",
      error: "",
      failureStage: "",
      startedAt: startedAtIso,
      executionAttempt: Math.max(0, Number(caseRun.executionAttempt || 0) || 0) + 1,
      executionStage: agentTarget
        ? (caseThreadId ? previousExecutionStage || "case_thread_ready" : "creating_case_thread")
        : previousExecutionStage || "hydrating_target_input",
    });
    assertRunLease(run.id);

    let actualOutput = "";
    let targetExecution = null;
    let sourceAssets = [];
    let snapshot;
    if (agentTarget) {
      if (!caseThreadId && previousExecutionStage === "creating_case_thread") {
        const recoveredThread = await findExistingEvaluationThread(record, {
          runId: run.id,
          caseId: caseRun.id,
          kind: "case",
        });
        caseThreadId = normalizeString(recoveredThread?.id);
      }
      if (!caseThreadId) {
        const caseThread = await createHiddenThread(record, {
          title,
          agentId: run.targetAgentId,
          agentVersionId: run.targetAgentVersionId,
          environmentId: run.environmentId,
          projectId: run.projectId,
          metadata: buildCaseMetadata({ evaluationSet, run, caseRun, row, kind: "case" }),
          guardrail: record.targetGuardrail || null,
        });
        caseThreadId = caseThread.id;
      }
      await patchRunCaseDurably(run.id, caseRun.id, {
        threadId: caseThreadId,
        status: "running_case",
        executionStage: "case_thread_ready",
        actualOutput: "Thread started.",
      });
      assertRunLease(run.id);
      const latestBeforeCaseDispatch = runsById.get(run.id)?.run?.cases?.find((item) => item.id === caseRun.id);
      await patchRunCaseDurably(run.id, caseRun.id, {
        status: "running_case",
        executionStage: "dispatching_case_message",
        caseMessageDispatchedAt: normalizeString(latestBeforeCaseDispatch?.caseMessageDispatchedAt) || new Date().toISOString(),
      });
      assertRunLease(run.id);
      actualOutput = await executeThreadMessageOnce(
        record,
        caseThreadId,
        row.input,
      );
      await patchRunCaseDurably(run.id, caseRun.id, {
        status: "waiting_for_case_summary",
        executionStage: "collecting_case_summary",
        actualOutput: actualOutput || "Thread completed. Open the thread to inspect the run summary.",
      });
      assertRunLease(run.id);
      snapshot = await buildThreadSnapshot(record, {
        threadId: caseThreadId,
        row,
        evaluationSet,
        actualOutput,
      });
    } else {
      const targetBinding = normalizeEvaluationTargetBinding(
        run.targetBinding || evaluationSet.targetBinding,
      );
      const evaluationBinding = readCanonicalEvaluationRunBinding(run)
        || readCanonicalEvaluationRunBinding(record.run)
        || {
          evaluationId: evaluationSet.id,
          snapshot: { metadata: evaluationSet.metadata || {} },
        };
      const hydrated = await hydrateEvaluationSourceAssets({
        evaluationBinding,
        caseInput: row.input,
        caseMetadata: row.metadata,
        requestBytes: (path, fallbackMessage) => requestBackendBytes(
          record,
          path,
          fallbackMessage,
        ),
        maximumBytes: Number(deps.maximumEvaluationSourceBytes)
          || 150 * 1024 * 1024,
      });
      sourceAssets = hydrated.sourceAssets;
      await patchRunCaseDurably(run.id, caseRun.id, {
        status: "running_case",
        executionStage: "dispatching_target",
        sourceAssets,
      });
      assertRunLease(run.id);
      const targetResult = await executeEvaluationTarget({
        binding: targetBinding,
        caseInput: hydrated.input,
        runId: run.id,
        caseId: caseRun.id,
        requestJson: (path, options, fallbackMessage) => requestBackendJson(
          record,
          path,
          options,
          fallbackMessage,
        ),
        pollAttempts: deps.metronomeEvaluationPollAttempts,
        pollMs: deps.metronomeEvaluationPollMs,
      });
      actualOutput = targetResult.actualOutput;
      targetExecution = targetResult.execution;
      await patchRunCaseDurably(run.id, caseRun.id, {
        status: "waiting_for_case_summary",
        executionStage: "collecting_target_output",
        actualOutput,
        targetExecution,
      });
      assertRunLease(run.id);
      snapshot = {
        version: "evaluation_target_snapshot_v1",
        generatedAt: new Date().toISOString(),
        threadId: "",
        costTokens: 0,
        costUsd: 0,
        target: targetExecution,
        input: row.input,
        expectedOutput: row.expectedOutput,
        datasetGuidance: evaluationSet.evaluationGuidance || "",
        rowGuidance: row.evaluationGuidance || "",
        sourceAssets,
        finalSummary: actualOutput,
        messages: [],
        steps: [],
        logs: [],
      };
    }
    const expected = String(row.expectedOutput || "");
    const evaluator = normalizeEvaluator(run.evaluator || evaluationSet.evaluator);
    const passThreshold = normalizePassThreshold(run.passThreshold ?? evaluationSet.passThreshold ?? 0.8);
    let evaluatorThreadId = "";
    let evaluatorOutput = "";
    let score = null;
    let status = "invalid";
    let evaluatorReason = "";
    let evaluatorParseStatus = "not_required";
    let costTokens = normalizeTokenCount(snapshot.costTokens);
    let costUsd = normalizeUsdCost(snapshot.costUsd) || (costTokens > 0 ? costTokens / EVALUATION_CT_PER_DOLLAR : 0);
    if (evaluator.type === "exact") {
      await patchRunCaseDurably(run.id, caseRun.id, { executionStage: "scoring" });
      if (!expected.trim()) {
        status = "invalid";
        evaluatorReason = "Exact-output evaluation requires a non-empty expected output.";
        evaluatorParseStatus = "expected_output_missing";
      } else {
        score = snapshot.finalSummary && normalizeComparable(snapshot.finalSummary) === normalizeComparable(expected) ? 1 : 0;
        status = score >= passThreshold ? "passed" : "failed";
      }
    } else if (evaluator.type === "code") {
      evaluatorOutput = "Code evaluators are disabled until they can run in an isolated, resource-limited grader sandbox.";
      evaluatorReason = evaluatorOutput;
      evaluatorParseStatus = "sandbox_required";
      score = null;
      status = "grader_error";
    } else if (evaluator.type === "deterministic") {
      await patchRunCaseDurably(run.id, caseRun.id, {
        executionStage: "scoring",
      });
      const graderResult = runDeterministicGrader({
        graderId: evaluator.graderId,
        actualOutput: snapshot.finalSummary,
        expectedOutput: expected,
        configuration: evaluator.configuration,
      });
      score = graderResult.score;
      evaluatorReason = graderResult.reason;
      evaluatorParseStatus = graderResult.parseStatus;
      evaluatorOutput = JSON.stringify({
        graderId: graderResult.graderId,
        score: graderResult.score,
        reason: graderResult.reason,
        details: graderResult.details,
      });
      status = score >= passThreshold ? "passed" : "failed";
    } else if (evaluator.type === "agent") {
      const evaluatorAgentId = normalizeString(evaluator.agentId);
      if (!evaluatorAgentId) {
        throw createRuntimeError("Select an evaluator agent before running this evaluation.", 400);
      }
      const latestBeforeEvaluator = runsById.get(run.id)?.run?.cases?.find((item) => item.id === caseRun.id);
      evaluatorThreadId = normalizeString(latestBeforeEvaluator?.evaluatorThreadId);
      const evaluatorRecoveryStage = normalizeString(latestBeforeEvaluator?.executionStage);
      await patchRunCaseDurably(run.id, caseRun.id, {
        executionStage: evaluatorThreadId ? evaluatorRecoveryStage || "evaluator_thread_ready" : "creating_evaluator_thread",
      });
      assertRunLease(run.id);
      if (!evaluatorThreadId && evaluatorRecoveryStage === "creating_evaluator_thread") {
        const recoveredEvaluatorThread = await findExistingEvaluationThread(record, {
          runId: run.id,
          caseId: caseRun.id,
          kind: "evaluator",
        });
        evaluatorThreadId = normalizeString(recoveredEvaluatorThread?.id);
      }
      if (!evaluatorThreadId) {
        const evaluatorThread = await createHiddenThread(record, {
          title: `${title} · Evaluator`,
          agentId: evaluatorAgentId,
          agentVersionId: evaluator.agentVersionId,
          environmentId: run.environmentId,
          projectId: run.projectId,
          metadata: buildCaseMetadata({
            evaluationSet,
            run,
            caseRun,
            row,
            kind: "evaluator",
            sourceThreadId: caseThreadId,
          }),
        });
        evaluatorThreadId = evaluatorThread.id;
      }
      await patchRunCaseDurably(run.id, caseRun.id, {
        evaluatorThreadId,
        status: "running_evaluator",
        executionStage: "evaluator_thread_ready",
      });
      assertRunLease(run.id);
      const evaluatorPrompt = buildEvaluatorPrompt({
        evaluationSet,
        run,
        caseRun,
        row,
        snapshot,
      });
      const latestBeforeEvaluatorDispatch = runsById.get(run.id)?.run?.cases?.find((item) => item.id === caseRun.id);
      await patchRunCaseDurably(run.id, caseRun.id, {
        status: "running_evaluator",
        executionStage: "dispatching_evaluator_message",
        evaluatorMessageDispatchedAt: normalizeString(latestBeforeEvaluatorDispatch?.evaluatorMessageDispatchedAt) || new Date().toISOString(),
      });
      assertRunLease(run.id);
      const evaluatorMessageSummary = await executeThreadMessageOnce(record, evaluatorThreadId, evaluatorPrompt);
      costTokens += await fetchThreadCostTokens(record, evaluatorThreadId).catch(() => 0);
      costUsd += await fetchThreadCostUsd(record, evaluatorThreadId).catch(() => 0);
      await patchRunCaseDurably(run.id, caseRun.id, { executionStage: "collecting_evaluator_result" });
      assertRunLease(run.id);
      const evaluatorResult = await waitForEvaluatorResult(record, evaluatorThreadId, evaluatorMessageSummary);
      evaluatorOutput = evaluatorResult.output || evaluatorMessageSummary;
      await patchRunCaseDurably(run.id, caseRun.id, { status: "scoring", executionStage: "scoring", evaluatorOutput });
      const parsed = evaluatorResult.parsed || parseEvaluatorResult(evaluatorOutput);
      evaluatorReason = parsed.reason || "";
      evaluatorParseStatus = parsed.parseStatus;
      if (parsed.parseStatus === "missing_output" || parsed.parseStatus === "unparsed") {
        score = null;
        status = "grader_error";
        evaluatorReason = evaluatorReason || "The evaluator did not return a valid score.";
      } else {
        score = parsed.score;
        status = score >= passThreshold ? "passed" : "failed";
      }
    }
    await patchRunCaseDurably(run.id, caseRun.id, {
      threadId: caseThreadId,
      evaluatorThreadId,
      actualOutput: snapshot.finalSummary
        || actualOutput
        || (
          agentTarget
            ? "Thread completed. Open the thread to inspect the run summary."
            : "Evaluation target completed without an output."
        ),
      evaluatorOutput,
      evaluatorReason,
      evaluatorParseStatus,
      snapshotVersion: snapshot.version,
      targetExecution,
      sourceAssets,
      score,
      costTokens,
      costUsd,
      costSource: agentTarget ? "thread_usage_ct" : "target_runtime",
      status,
      executionStage: "",
      failureStage: "",
      latencyMs: Date.now() - startedAtMs,
      error: ["grader_error", "infrastructure_error", "error"].includes(status)
        ? (evaluatorOutput || evaluatorReason || "Evaluation scoring failed.")
        : "",
      completedAt: new Date().toISOString(),
    });
  }

  async function executeRun(runId) {
    const record = runsById.get(runId);
    if (!record) return;
    for (let index = 0; index < record.run.cases.length; index += 1) {
      const latestRecord = runsById.get(runId);
      const caseRun = latestRecord?.run?.cases?.[index];
      if (!latestRecord || !caseRun) continue;
      if (TERMINAL_EVALUATION_CASE_STATUSES.has(normalizeString(caseRun.status).toLowerCase())) {
        continue;
      }
      try {
        assertRunLease(runId);
        await runEvaluationCase(latestRecord, caseRun, index);
      } catch (error) {
        const lease = runLeasesById.get(runId);
        if (lease?.lost || (
          Number(error?.status || 0) === 409
          && normalizeString(error?.message).toLowerCase().includes("lease")
        )) {
          throw error;
        }
        const failedRecord = runsById.get(runId);
        const failedCase = failedRecord?.run?.cases?.find((item) => item.id === caseRun.id);
        const failureStage = normalizeString(failedCase?.executionStage) || "executing_case";
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("[evaluations] Evaluation case execution failed", {
          runId,
          caseId: caseRun.id,
          stage: failureStage,
          threadId: normalizeString(failedCase?.threadId),
          evaluatorThreadId: normalizeString(failedCase?.evaluatorThreadId),
          message: errorMessage,
        });
        await patchRunCaseDurably(runId, caseRun.id, {
          status: "infrastructure_error",
          score: null,
          error: errorMessage,
          executionStage: "",
          failureStage,
          completedAt: new Date().toISOString(),
        });
      }
    }
    const finalRecord = await patchRunDurably(runId, (run) => ({
      ...run,
      completedAt: new Date().toISOString(),
    }));
    return finalRecord?.run || null;
  }

  async function executeRunWithLease(runId) {
    const record = runsById.get(runId);
    if (!record) return;
    const claimId = `${executionOwnerId}:${runId}`;
    let lease = null;
    let heartbeatTimer = null;
    try {
      lease = await acquireRunLease(record, runId, claimId);
      runLeasesById.set(runId, lease);
      heartbeatTimer = startRunLeaseHeartbeat(record, runId, lease);
      await executeRun(runId);
    } catch (error) {
      if (Number(error?.status || 0) !== 409) {
        console.error("[evaluations] Evaluation run execution failed", {
          runId,
          message: error instanceof Error ? error.message : String(error),
        });
        if (lease && !lease.lost) {
          await patchRunDurably(runId, (run) => ({
            ...run,
            completedAt: new Date().toISOString(),
            cases: run.cases.map((caseItem) => TERMINAL_EVALUATION_CASE_STATUSES.has(caseItem.status)
              ? caseItem
              : normalizeRunCase({
                  ...caseItem,
                  status: "infrastructure_error",
                  score: null,
                  error: error instanceof Error ? error.message : String(error),
                  failureStage: normalizeString(caseItem.executionStage) || "executing_run",
                  executionStage: "",
                  completedAt: new Date().toISOString(),
                })),
          })).catch(() => {});
        }
      }
    } finally {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      runLeasesById.delete(runId);
      if (lease) {
        await releaseRunLease(record, runId, lease).catch((error) => {
          console.error("[evaluations] Failed to release evaluation run lease", {
            runId,
            message: error instanceof Error ? error.message : String(error),
          });
        });
      }
    }
  }

  function scheduleRunExecution(runId) {
    if (activeExecutions.has(runId)) return activeExecutions.get(runId);
    const execution = new Promise((resolve) => {
      setTimeout(resolve, 0);
    })
      .then(() => executeRunWithLease(runId))
      .finally(() => {
        activeExecutions.delete(runId);
      });
    activeExecutions.set(runId, execution);
    return execution;
  }

  async function recalculateRunCosts(record, rawRun) {
    const run = recomputeRun(rawRun || {});
    const cases = [];
    for (const caseItem of run.cases) {
      const caseThreadCost = await fetchThreadCostTokens(record, caseItem.threadId).catch(() => 0);
      const evaluatorThreadCost = await fetchThreadCostTokens(record, caseItem.evaluatorThreadId).catch(() => 0);
      const caseThreadCostUsd = await fetchThreadCostUsd(record, caseItem.threadId).catch(() => 0);
      const evaluatorThreadCostUsd = await fetchThreadCostUsd(record, caseItem.evaluatorThreadId).catch(() => 0);
      cases.push(normalizeRunCase({
        ...caseItem,
        costTokens: caseThreadCost + evaluatorThreadCost,
        costUsd: caseThreadCostUsd + evaluatorThreadCostUsd,
        costSource: "thread_usage_ct",
      }));
    }
    return recomputeRun({
      ...run,
      cases,
      costSource: "thread_usage_ct",
    });
  }

  async function handleRecalculateRunCosts(req, res) {
    try {
      const body = await readRequestBody(req);
      const upstreamUrl = parseUpstreamUrl(req, body);
      const apiKey = readOptionalApiKey(req, body);
      const requestContext = cloneRequestContext(req);
      if (!apiKey && !hasAiosSession(requestContext)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Computer Agents or provide an API key.",
        });
      }
      const run = recomputeRun(body.run || body.evaluationRun || body.evaluation_run || {});
      if (!run.id) {
        return sendJson(res, 400, { error: "Evaluation run is required." });
      }
      const record = {
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      };
      const nextRun = await recalculateRunCosts(record, run);
      return sendJson(res, 200, {
        object: "evaluation_run",
        run: nextRun,
      });
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to calculate evaluation run cost",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function handleRefineCaseFromThread(req, res) {
    try {
      const body = await readRequestBody(req);
      const evaluationSet = normalizeEvaluationSet(body.evaluationSet || body.set || {});
      const sourceThreadId = normalizeString(body.threadId || body.thread_id || body.sourceThreadId || body.source_thread_id || body.thread?.id);
      const refinerAgentId = normalizeString(
        body.refinerAgentId
        || body.refiner_agent_id
        || body.agentId
        || body.agent_id
        || evaluationSet.evaluator?.agentId
        || evaluationSet.targetAgentId
      );
      const environmentId = normalizeString(body.environmentId || body.environment_id || body.computerId || body.computer_id || evaluationSet.environmentId);
      const projectId = normalizeString(body.projectId || body.project_id || evaluationSet.projectId);
      if (!sourceThreadId) {
        return sendJson(res, 400, { error: "Source thread id is required." });
      }
      if (!refinerAgentId) {
        return sendJson(res, 400, { error: "Select an agent before generating cases from threads." });
      }
      if (!environmentId) {
        return sendJson(res, 400, { error: "Select an environment before generating cases from threads." });
      }
      const upstreamUrl = parseUpstreamUrl(req, body);
      const apiKey = readOptionalApiKey(req, body);
      const requestContext = cloneRequestContext(req);
      if (!apiKey && !hasAiosSession(requestContext)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Computer Agents or provide an API key.",
        });
      }
      const record = {
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      };
      await assertEvaluationActionAllowed(
        record,
        evaluationSet.id,
        "evaluation_cases_manage",
      );
      const snapshot = await buildSourceThreadRefinementSnapshot(record, sourceThreadId, body.thread || {});
      const refinerThread = await createHiddenThread(record, {
        title: `Evaluation Case Refinement · ${snapshot.thread?.title || sourceThreadId}`,
        agentId: refinerAgentId,
        environmentId,
        projectId,
        metadata: buildCaseRefinementMetadata({ evaluationSet, sourceThreadId }),
      });
      const prompt = buildCaseRefinementPrompt({ evaluationSet, snapshot });
      const refinerSummary = await runThreadMessage(record, refinerThread.id, prompt);
      const refinementResult = await waitForCaseRefinementResult(record, refinerThread.id, refinerSummary);
      if (!isUsableCaseRefinementResult(refinementResult.parsed)) {
        return sendJson(res, 502, {
          error: "Failed to refine evaluation case",
          message: "The refiner did not return a valid case JSON object.",
          refinerThreadId: refinerThread.id,
          output: refinementResult.output || refinerSummary || "",
        });
      }
      const row = buildDataRowFromCaseRefinement({
        refinement: refinementResult.parsed,
        snapshot,
        refinerThreadId: refinerThread.id,
      });
      return sendJson(res, 200, {
        object: "evaluation_case",
        row,
        refinerThreadId: refinerThread.id,
        sourceThreadId,
        refinement: {
          sourceAssessment: refinementResult.parsed.sourceAssessment,
          sourceFailureReason: refinementResult.parsed.sourceFailureReason,
          caseIntent: refinementResult.parsed.caseIntent,
          confidence: refinementResult.parsed.confidence,
          needsReview: refinementResult.parsed.needsReview,
        },
      });
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to refine evaluation case from thread",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function buildExecutionSnapshot(evaluationSet, run, targetGuardrail) {
    return {
      schemaVersion: "evaluation_execution_snapshot_v1",
      datasetFingerprint: run.datasetFingerprint,
      caseSelectionFingerprint: run.caseSelectionFingerprint,
      evaluatorFingerprint: run.evaluatorFingerprint,
      systemFingerprint: run.systemFingerprint,
      systemSnapshot: run.systemSnapshot || null,
      evaluatorSystemSnapshot: run.evaluatorSystemSnapshot || null,
      evaluationSet: {
        id: evaluationSet.id,
        name: evaluationSet.name,
        description: evaluationSet.description,
        evaluationGuidance: evaluationSet.evaluationGuidance,
        passThreshold: evaluationSet.passThreshold,
        evaluator: evaluationSet.evaluator,
        targetBinding: run.targetBinding || evaluationSet.targetBinding || null,
        targetAgentId: run.targetAgentId,
        environmentType: run.environmentType,
        environmentId: run.environmentId,
        projectId: run.projectId,
        dataRows: evaluationSet.dataRows.map((row) => ({
          id: row.id,
          input: row.input,
          expectedOutput: row.expectedOutput,
          evaluationGuidance: row.evaluationGuidance,
          optimizationRole: row.optimizationRole,
          runCount: row.runCount,
          sliceIds: row.sliceIds,
          metadata: row.metadata || null,
        })),
      },
      targetGuardrail: targetGuardrail || null,
    };
  }

  function unwrapPlatformResource(payload, keys = []) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    const candidates = [
      ...keys.map((key) => payload[key]),
      ...keys.map((key) => payload.data?.[key]),
      payload.data,
      payload.item,
      payload.record,
      payload,
    ];
    return candidates.find((candidate) => (
      candidate
      && typeof candidate === "object"
      && !Array.isArray(candidate)
      && Object.keys(candidate).length > 0
    )) || null;
  }

  function readEvaluationAgentVersionId(agent) {
    const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata)
      ? agent.metadata
      : {};
    return normalizeString(
      agent?.activeAgentVersionId
        || agent?.active_agent_version_id
        || agent?.activeVersionId
        || agent?.active_version_id
        || agent?.currentVersionId
        || agent?.current_version_id
        || agent?.publishedVersionId
        || agent?.published_version_id
        || metadata.activeAgentVersionId
        || metadata.active_agent_version_id
        || metadata.activeVersionId
        || metadata.active_version_id,
    );
  }

  function selectEvaluationAgentVersion(versions, requestedVersionId = "") {
    const records = (Array.isArray(versions) ? versions : [])
      .filter((version) => version && typeof version === "object" && !Array.isArray(version));
    const normalizedRequestedVersionId = normalizeString(requestedVersionId);
    if (normalizedRequestedVersionId) {
      const requested = records.find((version) => (
        normalizeString(version.id || version.versionId || version.version_id) === normalizedRequestedVersionId
      ));
      if (requested) return requested;
    }
    return records.find((version) => (
      ["active", "published"].includes(normalizeString(version.status).toLowerCase())
    )) || records.slice().sort((left, right) => (
      Number(right.version || right.versionNumber || right.version_number || 0)
        - Number(left.version || left.versionNumber || left.version_number || 0)
    ))[0] || null;
  }

  async function resolveEvaluationEvaluatorContract(record, run, runOptions) {
    const evaluator = normalizeEvaluator(run.evaluator);
    if (evaluator.type !== "agent" || !evaluator.agentId) {
      return {
        evaluator,
        evaluatorAgentSnapshot: null,
        evaluatorSystemSnapshot: null,
      };
    }
    const providedSystemSnapshot = runOptions.evaluatorSystemSnapshot
      || runOptions.evaluator_system_snapshot
      || run.evaluatorSystemSnapshot
      || null;
    const providedAgentSnapshot = runOptions.evaluatorAgentSnapshot
      || runOptions.evaluator_agent_snapshot
      || providedSystemSnapshot?.agent?.snapshot
      || null;
    const agentPayload = await fetchBackendJson(
      record,
      `/agents/${encodeURIComponent(evaluator.agentId)}`,
    ).catch(() => null);
    const agent = unwrapPlatformResource(agentPayload, ["agent"]);
    let versionId = normalizeString(
      evaluator.agentVersionId
        || runOptions.evaluatorAgentVersionId
        || runOptions.evaluator_agent_version_id
        || readEvaluationAgentVersionId(agent),
    );
    let version = null;
    if (versionId) {
      const versionPayload = await fetchBackendJson(
        record,
        `/agents/${encodeURIComponent(evaluator.agentId)}/versions/${encodeURIComponent(versionId)}`,
      ).catch(() => null);
      version = unwrapPlatformResource(versionPayload, ["version"]);
    }
    if (!version) {
      const versionsPayload = await fetchBackendJson(
        record,
        `/agents/${encodeURIComponent(evaluator.agentId)}/versions`,
      ).catch(() => null);
      const versions = normalizeResponseArray(versionsPayload, [
        "versions",
        "agentVersions",
        "agent_versions",
      ]);
      version = selectEvaluationAgentVersion(versions, versionId);
      versionId = normalizeString(
        version?.id
          || version?.versionId
          || version?.version_id
          || versionId,
      );
    }
    const versionSnapshot = version?.snapshot
      && typeof version.snapshot === "object"
      && !Array.isArray(version.snapshot)
      ? version.snapshot
      : null;
    return {
      evaluator: normalizeEvaluator({
        ...evaluator,
        agentVersionId: versionId,
        agentVersionNumber: version?.version
          || version?.versionNumber
          || version?.version_number
          || evaluator.agentVersionNumber,
        agentVersionLabel: version?.label
          || version?.versionLabel
          || version?.version_label
          || evaluator.agentVersionLabel,
        agentVersionRevisionId: version?.revisionId
          || version?.revision_id
          || evaluator.agentVersionRevisionId,
      }),
      evaluatorAgentSnapshot: versionSnapshot || providedAgentSnapshot || agent,
      evaluatorSystemSnapshot: providedSystemSnapshot,
    };
  }

  async function resolveEvaluationSystemSnapshot(record, run, runOptions, targetGuardrail) {
    const providedSystemSnapshot = runOptions.systemSnapshot
      && typeof runOptions.systemSnapshot === "object"
      && !Array.isArray(runOptions.systemSnapshot)
      ? runOptions.systemSnapshot
      : runOptions.system_snapshot
        && typeof runOptions.system_snapshot === "object"
        && !Array.isArray(runOptions.system_snapshot)
        ? runOptions.system_snapshot
        : {};
    const providedAgentSnapshot = runOptions.targetAgentSnapshot
      || runOptions.target_agent_snapshot
      || runOptions.agentSnapshot
      || runOptions.agent_snapshot
      || providedSystemSnapshot.agent?.snapshot
      || null;
    const providedEnvironmentSnapshot = runOptions.environmentSnapshot
      || runOptions.environment_snapshot
      || providedSystemSnapshot.environment?.snapshot
      || null;

    const agentId = normalizeString(run.targetAgentId);
    const agentVersionId = normalizeString(run.targetAgentVersionId);
    const environmentId = normalizeString(run.environmentId);
    const projectId = normalizeString(run.projectId);
    const [agentResult, versionResult, environmentResult, projectResult] = await Promise.allSettled([
      agentId
        ? fetchBackendJson(record, `/agents/${encodeURIComponent(agentId)}`)
        : Promise.resolve(null),
      agentId && agentVersionId
        ? fetchBackendJson(
            record,
            `/agents/${encodeURIComponent(agentId)}/versions/${encodeURIComponent(agentVersionId)}`,
          )
        : Promise.resolve(null),
      environmentId
        ? fetchBackendJson(record, `/environments/${encodeURIComponent(environmentId)}`)
        : Promise.resolve(null),
      projectId
        ? fetchBackendJson(record, `/projects/${encodeURIComponent(projectId)}`)
        : Promise.resolve(null),
    ]);
    const agent = agentResult.status === "fulfilled"
      ? unwrapPlatformResource(agentResult.value, ["agent"])
      : null;
    const version = versionResult.status === "fulfilled"
      ? unwrapPlatformResource(versionResult.value, ["version"])
      : null;
    const environment = environmentResult.status === "fulfilled"
      ? unwrapPlatformResource(environmentResult.value, ["environment", "computer"])
      : null;
    const project = projectResult.status === "fulfilled"
      ? unwrapPlatformResource(projectResult.value, ["project"])
      : null;
    const resolvedAgentSnapshot = version?.snapshot
      && typeof version.snapshot === "object"
      && !Array.isArray(version.snapshot)
      ? version.snapshot
      : providedAgentSnapshot
        && typeof providedAgentSnapshot === "object"
        && !Array.isArray(providedAgentSnapshot)
        ? providedAgentSnapshot
        : agent;
    const resolvedEnvironmentSnapshot = {
      ...(providedEnvironmentSnapshot && typeof providedEnvironmentSnapshot === "object" && !Array.isArray(providedEnvironmentSnapshot)
        ? providedEnvironmentSnapshot
        : {}),
      ...(environment || {}),
      ...(project ? { project } : {}),
    };
    return {
      ...providedSystemSnapshot,
      agent: {
        ...(providedSystemSnapshot.agent && typeof providedSystemSnapshot.agent === "object"
          ? providedSystemSnapshot.agent
          : {}),
        id: agentId,
        versionId: agentVersionId,
        revisionId: normalizeString(run.targetAgentVersionRevisionId),
        snapshot: resolvedAgentSnapshot || null,
      },
      model: providedSystemSnapshot.model
        || runOptions.modelSnapshot
        || runOptions.model_snapshot
        || resolvedAgentSnapshot?.modelConfiguration
        || resolvedAgentSnapshot?.model_configuration
        || resolvedAgentSnapshot?.model
        || null,
      sampling: providedSystemSnapshot.sampling
        || runOptions.samplingSnapshot
        || runOptions.sampling_snapshot
        || runOptions.sampling
        || null,
      tools: providedSystemSnapshot.tools
        || runOptions.toolSnapshot
        || runOptions.tool_snapshot
        || resolvedAgentSnapshot?.tools
        || resolvedAgentSnapshot?.enabledTools
        || resolvedAgentSnapshot?.enabled_tools
        || null,
      skills: providedSystemSnapshot.skills
        || runOptions.skillSnapshot
        || runOptions.skill_snapshot
        || resolvedAgentSnapshot?.skills
        || resolvedAgentSnapshot?.enabledSkills
        || resolvedAgentSnapshot?.enabled_skills
        || null,
      guardrail: {
        ...(providedSystemSnapshot.guardrail && typeof providedSystemSnapshot.guardrail === "object"
          ? providedSystemSnapshot.guardrail
          : {}),
        id: normalizeString(run.targetGuardrailId),
        versionId: normalizeString(run.targetGuardrailVersionId),
        snapshot: targetGuardrail || null,
      },
      environment: {
        ...(providedSystemSnapshot.environment && typeof providedSystemSnapshot.environment === "object"
          ? providedSystemSnapshot.environment
          : {}),
        type: run.environmentType,
        id: environmentId,
        projectId,
        snapshot: Object.keys(resolvedEnvironmentSnapshot).length
          ? resolvedEnvironmentSnapshot
          : null,
      },
      runtime: {
        ...(providedSystemSnapshot.runtime && typeof providedSystemSnapshot.runtime === "object"
          ? providedSystemSnapshot.runtime
          : {}),
        service: "evaluations",
        executionContractVersion: "evaluation_execution_v2",
        platformVersion: normalizeString(
          deps.platformVersion || deps.runtimeVersion,
        ),
      },
    };
  }

  function readExecutionSnapshot(run) {
    const metadata = run?.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata)
      ? run.metadata
      : {};
    const embeddedRun = metadata.run && typeof metadata.run === "object" && !Array.isArray(metadata.run)
      ? metadata.run
      : {};
    const embeddedRunMetadata = embeddedRun.metadata && typeof embeddedRun.metadata === "object" && !Array.isArray(embeddedRun.metadata)
      ? embeddedRun.metadata
      : {};
    const candidates = [
      run?.executionSnapshot,
      run?.execution_snapshot,
      metadata.executionSnapshot,
      metadata.execution_snapshot,
      embeddedRun.executionSnapshot,
      embeddedRun.execution_snapshot,
      embeddedRunMetadata.executionSnapshot,
      embeddedRunMetadata.execution_snapshot,
    ];
    return candidates.find((candidate) => (
      candidate
      && typeof candidate === "object"
      && !Array.isArray(candidate)
      && candidate.schemaVersion === "evaluation_execution_snapshot_v1"
    )) || null;
  }

  function readCanonicalEvaluationRunBinding(run) {
    const source = readPlainObject(run);
    const metadata = readPlainObject(source.metadata);
    const embeddedRun = readPlainObject(metadata.run);
    const embeddedMetadata = readPlainObject(embeddedRun.metadata);
    const candidates = [
      source.evaluationSnapshot,
      source.evaluation_snapshot,
      metadata.evaluationSnapshot,
      metadata.evaluation_snapshot,
      embeddedRun.evaluationSnapshot,
      embeddedRun.evaluation_snapshot,
      embeddedMetadata.evaluationSnapshot,
      embeddedMetadata.evaluation_snapshot,
    ];
    return candidates.find((candidate) => (
      CANONICAL_EVALUATION_RUN_BINDING_SCHEMA_VERSIONS.has(
        readPlainObject(candidate).schemaVersion,
      )
    )) || null;
  }

  function canonicalEvaluationSetFromBinding(binding) {
    const snapshot = readPlainObject(binding?.snapshot);
    const metadata = readPlainObject(snapshot.metadata);
    const target = readPlainObject(binding?.target);
    const evaluator = readPlainObject(
      metadata.evaluator
      || metadata.evaluationEvaluator
      || metadata.evaluation_evaluator,
    );
    return normalizeEvaluationSet({
      id: normalizeString(binding?.evaluationId),
      name: normalizeString(snapshot.name) || "Evaluation",
      description: String(snapshot.description || ""),
      evaluationGuidance: String(
        metadata.evaluationGuidance
        || metadata.evaluation_guidance
        || metadata.rubric
        || "",
      ),
      passThreshold:
        metadata.passThreshold ?? metadata.pass_threshold ?? 0.8,
      evaluator: Object.keys(evaluator).length ? evaluator : { type: "exact" },
      targetBinding: target,
      targetAgentId: normalizeString(target.agentId),
      environmentType:
        normalizeString(metadata.environmentType || metadata.environment_type)
          .toLowerCase() === "project"
          ? "project"
          : "computer",
      environmentId: normalizeString(target.environmentId),
      projectId: normalizeString(metadata.projectId || metadata.project_id),
      cases: Array.isArray(snapshot.cases)
        ? snapshot.cases.map((caseItem) => ({
            ...readPlainObject(caseItem),
            runCount: 1,
          }))
        : [],
      metadata,
    });
  }

  function isPersistedEvaluationRunActive(run) {
    const status = normalizeString(run?.status).toLowerCase();
    return ACTIVE_EVALUATION_RUN_STATUSES.has(status)
      || isEvaluationRunActive(run);
  }

  function isEvaluationRunActive(run) {
    return Array.isArray(run?.cases) && run.cases.some((caseItem) => (
      !TERMINAL_EVALUATION_CASE_STATUSES.has(normalizeString(caseItem?.status).toLowerCase())
    ));
  }

  async function hydratePersistedRunRecord(requestRecord, persistedRunSource) {
    const canonicalBinding = readCanonicalEvaluationRunBinding(
      persistedRunSource,
    );
    const executionSnapshot = readExecutionSnapshot(persistedRunSource);
    if (!executionSnapshot && !canonicalBinding) return null;
    if (!executionSnapshot && canonicalBinding) {
      const evaluationSet = canonicalEvaluationSetFromBinding(
        canonicalBinding,
      );
      if (!evaluationSet.id || !evaluationSet.dataRows.length) {
        throw createRuntimeError(
          "The canonical Evaluation binding does not contain executable cases.",
          409,
        );
      }
      const target = readPlainObject(canonicalBinding.target);
      const targetBindingSnapshot = readPlainObject(target.snapshot);
      const agentSnapshot = targetBindingSnapshot.source === "agent_version"
        ? readPlainObject(targetBindingSnapshot.snapshot)
        : targetBindingSnapshot;
      const persistedMetadata = readPlainObject(persistedRunSource?.metadata);
      const persistedEmbeddedRun = readPlainObject(persistedMetadata.run);
      const runOptions = {
        ...persistedEmbeddedRun,
        id: normalizeString(
          persistedRunSource?.id
          || persistedRunSource?.runId
          || persistedRunSource?.run_id,
        ),
        evaluationVersionId: normalizeString(canonicalBinding.versionId),
        evaluationVersionNumber: Math.max(
          0,
          Number(canonicalBinding.versionNumber || 0) || 0,
        ),
        targetBinding: target,
        targetAgentId: normalizeString(target.agentId),
        targetAgentVersionId: normalizeString(target.agentVersionId),
        targetAgentVersionNumber: Math.max(
          0,
          Number(target.agentVersionNumber || 0) || 0,
        ),
        targetAgentSnapshot: agentSnapshot,
        environmentId: normalizeString(target.environmentId),
        environmentType: evaluationSet.environmentType,
        projectId: evaluationSet.projectId,
        evaluator: evaluationSet.evaluator,
        passThreshold: evaluationSet.passThreshold,
        metadata: {
          ...readPlainObject(persistedEmbeddedRun.metadata),
          evaluationSnapshot: canonicalBinding,
          controlPlaneDatasetFingerprint:
            normalizeString(canonicalBinding.datasetFingerprint),
          controlPlaneEvaluationFingerprint:
            normalizeString(canonicalBinding.evaluationFingerprint),
          controlPlaneTargetFingerprint:
            normalizeString(target.targetFingerprint),
        },
      };
      let run = createEvaluationRun(evaluationSet, runOptions);
      if (
        run.targetType === "agent"
        && (!run.targetAgentId || !run.environmentId)
      ) {
        throw createRuntimeError(
          "The canonical Evaluation run is missing its target Agent or environment binding.",
          409,
        );
      }
      if (
        ["function", "metronome", "service_topology"].includes(run.targetType)
      ) {
        normalizeEvaluationTargetBinding(run.targetBinding);
      }
      if (
        run.evaluator.type === "agent"
        && !run.environmentId
      ) {
        throw createRuntimeError(
          "An evaluator Agent requires an environment binding.",
          409,
        );
      }
      const targetGuardrail = await resolveEvaluationGuardrailTarget(
        requestRecord,
        runOptions,
      );
      const systemSnapshot = await resolveEvaluationSystemSnapshot(
        requestRecord,
        run,
        runOptions,
        targetGuardrail,
      );
      const evaluatorContract = await resolveEvaluationEvaluatorContract(
        requestRecord,
        run,
        runOptions,
      );
      run = createEvaluationRun(evaluationSet, {
        ...runOptions,
        id: run.id,
        systemSnapshot,
        targetGuardrailSnapshot: targetGuardrail,
        evaluator: evaluatorContract.evaluator,
        evaluatorAgentSnapshot: evaluatorContract.evaluatorAgentSnapshot,
        evaluatorSystemSnapshot: evaluatorContract.evaluatorSystemSnapshot,
      });
      run = recomputeRun({
        ...run,
        createdAt: normalizeString(
          persistedRunSource?.createdAt || persistedRunSource?.created_at,
        ) || run.createdAt,
        metadata: {
          ...readPlainObject(run.metadata),
          evaluationSnapshot: canonicalBinding,
          executionSnapshot: buildExecutionSnapshot(
            evaluationSet,
            run,
            targetGuardrail,
          ),
        },
      });
      const record = {
        ...requestRecord,
        run,
        evaluationSet: {
          ...evaluationSet,
          targetBinding: run.targetBinding,
          targetAgentId: run.targetAgentId,
          environmentType: run.environmentType,
          environmentId: run.environmentId,
          projectId: run.projectId,
          evaluator: run.evaluator,
        },
        targetGuardrail,
      };
      storeRun(record);
      return record;
    }
    const run = recomputeRun(persistedRunSource || {});
    if (
      normalizeString(executionSnapshot.datasetFingerprint)
      && normalizeString(run.datasetFingerprint)
      && normalizeString(executionSnapshot.datasetFingerprint) !== normalizeString(run.datasetFingerprint)
    ) {
      throw createRuntimeError("The persisted evaluation execution snapshot does not match its dataset fingerprint.", 409);
    }
    const evaluationSet = normalizeEvaluationSet(executionSnapshot.evaluationSet || {});
    if (!evaluationSet.dataRows.length || evaluationSet.id !== run.evaluationSetId) {
      throw createRuntimeError("The persisted evaluation run cannot be resumed because its execution snapshot is incomplete.", 409);
    }
    const targetGuardrail = executionSnapshot.targetGuardrail
      || await resolveEvaluationGuardrailTarget(requestRecord, run);
    const record = {
      ...requestRecord,
      run,
      evaluationSet: {
      ...evaluationSet,
        targetBinding: run.targetBinding,
        targetAgentId: run.targetAgentId,
        environmentType: run.environmentType,
        environmentId: run.environmentId,
        projectId: run.projectId,
        evaluator: run.evaluator,
      },
      targetGuardrail,
    };
    storeRun(record);
    return record;
  }

  async function createRunForService(req, body = {}) {
    pruneRuns();
    const evaluationSet = normalizeEvaluationSet(body.evaluationSet || body.set || {});
    if (!evaluationSet.dataRows.length) {
      throw createRuntimeError("Evaluation set has no data rows.", 400);
    }
    const upstreamUrl = parseUpstreamUrl(req, body);
    const apiKey = readOptionalApiKey(req, body);
    const requestContext = cloneRequestContext(req);
    if (!apiKey && !hasAiosSession(requestContext)) {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const runOptions = {
      ...(body.runOptions && typeof body.runOptions === "object" ? body.runOptions : {}),
      ...(body.knowledgeContext || body.knowledge_context
        ? {
            knowledgeContext: body.knowledgeContext || body.knowledge_context,
          }
        : {}),
    };
    let run = createEvaluationRun(evaluationSet, runOptions);
    const existingRecord = runsById.get(run.id);
    if (existingRecord) {
      await ensureRunPersisted(existingRecord);
      if (!durableExecutionEnabled && isEvaluationRunActive(existingRecord.run)) {
        scheduleRunExecution(existingRecord.run.id);
      }
      return {
        run: existingRecord.run,
        idempotent: true,
        statusCode: 200,
      };
    }
    const requestRecord = {
      requestContext,
      upstreamUrl,
      apiKey,
      body,
    };
    if (runOptions.id || runOptions.runId || runOptions.run_id) {
      const persistedPayload = await requestBackendJson(
        requestRecord,
        `/evaluations/runs/${encodeURIComponent(run.id)}`,
        { method: "GET" },
        "Evaluation run not found.",
      ).catch((error) => {
        if (Number(error?.status || 0) === 404) return null;
        throw error;
      });
      if (persistedPayload) {
        const persistedRunSource = persistedPayload.run
          || persistedPayload.evaluationRun
          || persistedPayload.evaluation_run
          || persistedPayload.data
          || persistedPayload;
        const persistedRunId = normalizeString(
          persistedRunSource?.id
            || persistedRunSource?.runId
            || persistedRunSource?.run_id,
        );
        if (persistedRunId === run.id) {
          const hydratedRecord = isPersistedEvaluationRunActive(
            persistedRunSource,
          )
            ? await hydratePersistedRunRecord(requestRecord, persistedRunSource)
            : null;
          const persistedRun = hydratedRecord?.run
            || recomputeRun(persistedRunSource);
          if (hydratedRecord && !durableExecutionEnabled) {
            scheduleRunExecution(persistedRun.id);
          }
          return {
            run: persistedRun,
            idempotent: true,
            persisted: true,
            statusCode: 200,
          };
        }
      }
    }
    if (run.targetType === "agent" && (!run.targetAgentId || !run.environmentId)) {
      throw createRuntimeError(
        "Select an agent and environment before running this evaluation.",
        400,
      );
    }
    if (["function", "metronome", "service_topology"].includes(run.targetType)) {
      normalizeEvaluationTargetBinding(run.targetBinding);
    } else if (run.targetType !== "agent") {
      throw createRuntimeError(
        "Select an Agent, Function, Metronome, or service topology before running this Evaluation.",
        400,
      );
    }
    if (run.evaluator.type === "agent" && !run.evaluator.agentId) {
      throw createRuntimeError("Select an evaluator agent before running this evaluation.", 400);
    }
    if (run.evaluator.type === "agent" && !run.environmentId) {
      throw createRuntimeError(
        "An evaluator Agent requires an environment binding.",
        400,
      );
    }
    if (run.evaluator.type === "deterministic" && !run.evaluator.graderId) {
      throw createRuntimeError(
        "Select a registered deterministic grader before running this Evaluation.",
        400,
      );
    }
    if (run.evaluator.type === "code") {
      throw createRuntimeError(
        "Code evaluators require an isolated grader sandbox and are not available on this deployment.",
        422,
      );
    }
    const targetGuardrail = await resolveEvaluationGuardrailTarget(
      requestRecord,
      runOptions,
    );
    const systemSnapshot = await resolveEvaluationSystemSnapshot(
      requestRecord,
      run,
      runOptions,
      targetGuardrail,
    );
    const evaluatorContract = await resolveEvaluationEvaluatorContract(
      requestRecord,
      run,
      runOptions,
    );
    run = createEvaluationRun(evaluationSet, {
      ...runOptions,
      id: run.id,
      systemSnapshot,
      targetGuardrailSnapshot: targetGuardrail,
      evaluator: evaluatorContract.evaluator,
      evaluatorAgentSnapshot: evaluatorContract.evaluatorAgentSnapshot,
      evaluatorSystemSnapshot: {
        ...(evaluatorContract.evaluatorSystemSnapshot
          && typeof evaluatorContract.evaluatorSystemSnapshot === "object"
          && !Array.isArray(evaluatorContract.evaluatorSystemSnapshot)
          ? evaluatorContract.evaluatorSystemSnapshot
          : {}),
        environment: systemSnapshot.environment || null,
        runtime: {
          role: "evaluator",
          executionContractVersion: "evaluation_evaluator_v1",
          platformVersion: normalizeString(
            deps.platformVersion || deps.runtimeVersion,
          ),
        },
      },
    });
    const executionRun = recomputeRun({
      ...run,
      metadata: {
        ...(run.metadata && typeof run.metadata === "object" && !Array.isArray(run.metadata) ? run.metadata : {}),
        executionSnapshot: buildExecutionSnapshot(evaluationSet, run, targetGuardrail),
      },
    });
    const record = {
      ...requestRecord,
      run: executionRun,
      evaluationSet: {
        ...evaluationSet,
        targetBinding: executionRun.targetBinding,
        targetAgentId: executionRun.targetAgentId,
        environmentType: executionRun.environmentType,
        environmentId: executionRun.environmentId,
        projectId: executionRun.projectId,
        evaluator: executionRun.evaluator,
      },
      targetGuardrail,
    };
    storeRun(record);
    try {
      await runPersistence.enqueue(record, executionRun);
    } catch (error) {
      runsById.delete(run.id);
      runPersistence.forget(run.id);
      throw createRuntimeError(
        `The evaluation run could not be durably created: ${error instanceof Error ? error.message : String(error)}`,
        Number(error?.status || 502) >= 500 ? Number(error?.status || 502) : 502,
      );
    }
    if (!durableExecutionEnabled) {
      scheduleRunExecution(executionRun.id);
    }
    return {
      run: executionRun,
      idempotent: false,
      statusCode: 202,
    };
  }

  async function handleCreateRun(req, res) {
    try {
      const result = await createRunForService(req, await readRequestBody(req));
      return sendJson(res, result.statusCode, {
        object: "evaluation_run",
        run: result.run,
        ...(result.idempotent ? { idempotent: true } : {}),
      });
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to start evaluation run",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function getRunForService(req, runId) {
    pruneRuns();
    const normalizedRunId = normalizeString(runId);
    const record = runsById.get(normalizedRunId);
    if (!record) {
      const body = {};
      const requestRecord = {
        requestContext: cloneRequestContext(req),
        upstreamUrl: parseUpstreamUrl(req, body),
        apiKey: readOptionalApiKey(req, body),
        body,
      };
      const data = await requestBackendJson(
        requestRecord,
        `/evaluations/runs/${encodeURIComponent(normalizedRunId)}`,
        { method: "GET" },
        "Failed to load persisted evaluation run.",
      );
      const persistedRunSource = data.run
        || data.evaluationRun
        || data.evaluation_run
        || data.data
        || data;
      if (isPersistedEvaluationRunActive(persistedRunSource)) {
        const hydratedRecord = await hydratePersistedRunRecord(requestRecord, persistedRunSource);
        if (hydratedRecord) {
          if (!durableExecutionEnabled) {
            scheduleRunExecution(hydratedRecord.run.id);
          }
          return hydratedRecord.run;
        }
      }
      return recomputeRun(persistedRunSource);
    }
    await ensureRunPersisted(record);
    const refreshedRun = await refreshPersistedRunFromBackend(
      req,
      runsById.get(normalizedRunId) || record,
      normalizedRunId,
    );
    if (!durableExecutionEnabled && isEvaluationRunActive(refreshedRun)) {
      scheduleRunExecution(refreshedRun.id);
    }
    return refreshedRun;
  }

  async function wakeRunForService(req, runId) {
    const normalizedRunId = normalizeString(runId);
    const existingRecord = runsById.get(normalizedRunId);
    if (existingRecord) {
      const body = {};
      const apiKey = readOptionalApiKey(req, body);
      if (!apiKey && !hasAiosSession(req)) {
        throw createRuntimeError(
          "The execution-dispatch claim has no workload credential.",
          401,
        );
      }
      storeRun({
        ...existingRecord,
        requestContext: cloneRequestContext(req),
        upstreamUrl: parseUpstreamUrl(req, body),
        apiKey,
      });
    }
    let run = await getRunForService(req, normalizedRunId);
    if (isEvaluationRunActive(run)) {
      scheduleRunExecution(normalizedRunId);
    }
    const execution = activeExecutions.get(normalizedRunId);
    if (execution) await execution;
    const record = runsById.get(normalizedRunId);
    if (record) {
      await ensureRunPersisted(record);
      run = record.run;
    }
    if (isEvaluationRunActive(run)) {
      throw createRuntimeError(
        "The evaluation run remains active because its execution lease is held by another worker.",
        409,
      );
    }
    return run;
  }

  async function handleGetRun(req, res, runId) {
    try {
      const run = await getRunForService(req, runId);
      return sendJson(res, 200, {
        object: "evaluation_run",
        run,
      });
    } catch (error) {
      return sendJson(res, Number(error?.status || 404), {
        error: "Evaluation run not found",
        message: error instanceof Error ? error.message : "The evaluation run is no longer available in the local runtime.",
      });
    }
  }

  function handleRequest(req, res, url) {
    if (req.method === "POST" && url.pathname === "/api/real/evaluations/cases/from-thread") {
      void handleRefineCaseFromThread(req, res);
      return true;
    }
    if (req.method === "POST" && url.pathname === "/api/real/evaluations/runs") {
      void handleCreateRun(req, res);
      return true;
    }
    if (req.method === "POST" && url.pathname === "/api/real/evaluations/runs/costs") {
      void handleRecalculateRunCosts(req, res);
      return true;
    }
    if (req.method === "GET" && url.pathname === "/api/real/evaluations/runs/guardrail-overview") {
      return false;
    }
    const runMatch = url.pathname.match(/^\/api\/real\/evaluations\/runs\/([^/]+)$/);
    if (req.method === "GET" && runMatch) {
      void handleGetRun(req, res, decodeURIComponent(runMatch[1]));
      return true;
    }
    return false;
  }

  return {
    handleRequest,
    runs: Object.freeze({
      create: createRunForService,
      get: getRunForService,
      wake: wakeRunForService,
    }),
  };
}
