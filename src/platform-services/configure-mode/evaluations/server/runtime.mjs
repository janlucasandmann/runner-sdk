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
  clampScore,
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
  takeSourceThreadContext,
} from "./domain/records.mjs";
import {
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
  buildProxyPromptAdaptationsFromGuardrails,
  normalizeProxyGuardrailSets,
} from "../../guardrails/server/enrichment.mjs";

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

  function pruneRuns() {
    const now = Date.now();
    for (const [runId, record] of runsById.entries()) {
      if (now - Number(record.updatedAtMs || 0) > EVALUATION_RUN_TTL_MS) {
        runsById.delete(runId);
      }
    }
  }

  function storeRun(record) {
    runsById.set(record.run.id, {
      ...record,
      updatedAtMs: Date.now(),
    });
    void persistBackendEvaluationRun(record, record.run).catch(() => {});
  }

  function patchRun(runId, updater) {
    const record = runsById.get(runId);
    if (!record) return null;
    const nextRun = recomputeRun(typeof updater === "function" ? updater(record.run) : record.run);
    const nextRecord = { ...record, run: nextRun, updatedAtMs: Date.now() };
    runsById.set(runId, nextRecord);
    void persistBackendEvaluationRun(nextRecord, nextRun).catch(() => {});
    return nextRecord;
  }

  function patchRunCase(runId, caseId, patch) {
    return patchRun(runId, (run) => ({
      ...run,
      cases: run.cases.map((caseItem) => caseItem.id === caseId
        ? normalizeRunCase({ ...caseItem, ...patch })
        : caseItem),
    }));
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
      const response = await fetch(`${upstreamUrl}${path}`, {
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

  async function requestBackendJson(record, path, options = {}, fallbackMessage = "Backend request failed.") {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    if (apiKey) {
      const response = await fetch(`${upstreamUrl}${path}`, {
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

  function buildEvaluationRunPersistencePayload(run) {
    const normalizedRun = recomputeRun(run);
    return {
      id: normalizedRun.id,
      runId: normalizedRun.id,
      run_id: normalizedRun.id,
      agentId: normalizedRun.targetAgentId,
      agent_id: normalizedRun.targetAgentId,
      environmentId: normalizedRun.environmentId,
      environment_id: normalizedRun.environmentId,
      computerId: normalizedRun.environmentType === "computer" ? normalizedRun.environmentId : "",
      computer_id: normalizedRun.environmentType === "computer" ? normalizedRun.environmentId : "",
      versionId: normalizedRun.evaluationVersionId,
      version_id: normalizedRun.evaluationVersionId,
      status: normalizedRun.status,
      averageScore: normalizedRun.averageScore,
      average_score: normalizedRun.averageScore,
      passRate: normalizedRun.totalCount > 0 ? normalizedRun.passedCount / normalizedRun.totalCount : 0,
      pass_rate: normalizedRun.totalCount > 0 ? normalizedRun.passedCount / normalizedRun.totalCount : 0,
      costCt: normalizedRun.costTokens,
      cost_ct: normalizedRun.costTokens,
      costUsd: normalizedRun.costUsd,
      cost_usd: normalizedRun.costUsd,
      metadata: {
        ...(normalizedRun.metadata && typeof normalizedRun.metadata === "object" && !Array.isArray(normalizedRun.metadata) ? normalizedRun.metadata : {}),
        fineTuningJobId: normalizedRun.fineTuningJobId,
        fine_tuning_job_id: normalizedRun.fine_tuning_job_id,
        targetAgentVersionId: normalizedRun.targetAgentVersionId,
        target_agent_version_id: normalizedRun.targetAgentVersionId,
        targetAgentVersionNumber: normalizedRun.targetAgentVersionNumber,
        target_agent_version_number: normalizedRun.targetAgentVersionNumber,
        targetAgentVersionLabel: normalizedRun.targetAgentVersionLabel,
        target_agent_version_label: normalizedRun.targetAgentVersionLabel,
        targetGuardrailId: normalizedRun.targetGuardrailId,
        target_guardrail_id: normalizedRun.targetGuardrailId,
        targetGuardrailName: normalizedRun.targetGuardrailName,
        target_guardrail_name: normalizedRun.targetGuardrailName,
        targetGuardrailVersionId: normalizedRun.targetGuardrailVersionId,
        target_guardrail_version_id: normalizedRun.targetGuardrailVersionId,
        targetGuardrailVersionNumber: normalizedRun.targetGuardrailVersionNumber,
        target_guardrail_version_number: normalizedRun.targetGuardrailVersionNumber,
        targetGuardrailVersionLabel: normalizedRun.targetGuardrailVersionLabel,
        target_guardrail_version_label: normalizedRun.targetGuardrailVersionLabel,
        run: normalizedRun,
      },
      run: normalizedRun,
    };
  }

  async function persistBackendEvaluationRun(record, run) {
    const normalizedRun = recomputeRun(run);
    if (!normalizedRun.id || !normalizedRun.evaluationSetId) return null;
    const payload = buildEvaluationRunPersistencePayload(normalizedRun);
    try {
      return await requestBackendJson(
        record,
        `/evaluations/runs/${encodeURIComponent(normalizedRun.id)}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
        "Failed to persist evaluation run."
      );
    } catch (error) {
      if (Number(error?.status || 0) !== 404) throw error;
      return await requestBackendJson(
        record,
        `/evaluations/${encodeURIComponent(normalizedRun.evaluationSetId)}/runs`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        },
        "Failed to create persisted evaluation run."
      );
    }
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
    let guardrailRecord = null;
    try {
      const payload = await requestBackendJson(
        record,
        `/guardrails/${encodeURIComponent(guardrailId)}`,
        { method: "GET" },
        "Failed to load the target guardrail."
      );
      guardrailRecord = unwrapGuardrailRecord(payload);
    } catch (error) {
      if (!providedSnapshot) throw error;
    }
    let versionRecord = null;
    if (versionId) {
      try {
        const payload = await requestBackendJson(
          record,
          `/guardrails/${encodeURIComponent(guardrailId)}/versions/${encodeURIComponent(versionId)}`,
          { method: "GET" },
          "Failed to load the target guardrail version."
        );
        versionRecord = unwrapGuardrailRecord(payload);
      } catch (error) {
        if (!providedSnapshot) throw error;
      }
    }
    const versionSnapshot = versionRecord?.snapshot && typeof versionRecord.snapshot === "object"
      ? versionRecord.snapshot
      : null;
    const source = {
      ...(guardrailRecord && typeof guardrailRecord === "object" ? guardrailRecord : {}),
      ...(providedSnapshot || {}),
      ...(versionSnapshot || {}),
      id: guardrailId,
      name: normalizeString(
        runOptions.targetGuardrailName
        || runOptions.target_guardrail_name
        || versionSnapshot?.name
        || providedSnapshot?.name
        || guardrailRecord?.name
      ) || "Guardrail",
      prompts: versionSnapshot?.prompts || providedSnapshot?.prompts || guardrailRecord?.prompts || [],
    };
    const normalized = normalizeProxyGuardrailSets([source])[0] || null;
    if (!normalized) {
      throw createRuntimeError("The target guardrail has no enforceable prompts.", 400);
    }
    return normalized;
  }

  async function createHiddenThread(record, { title, agentId, environmentId, projectId, metadata, guardrail = null }) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
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
      ...(record?.run?.targetAgentVersionId ? {
        agentVersionId: record.run.targetAgentVersionId,
        agent_version_id: record.run.targetAgentVersionId,
        targetAgentVersionId: record.run.targetAgentVersionId,
        target_agent_version_id: record.run.targetAgentVersionId,
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
      metadata: {
        ...(metadata || {}),
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
      response = await fetch(`${upstreamUrl}/threads`, {
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
        const threadText = readRecordText(threadResult.value?.thread || threadResult.value?.data || threadResult.value);
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
      response = await fetch(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
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
      },
    };
  }

  async function runEvaluationCase(record, caseRun, index) {
    const { evaluationSet, run } = record;
    const row = evaluationSet.dataRows.find((item) => item.id === caseRun.dataRowId) || evaluationSet.dataRows[index] || null;
    if (!row) {
      patchRunCase(run.id, caseRun.id, {
        status: "error",
        error: "Evaluation data row could not be resolved.",
        completedAt: new Date().toISOString(),
      });
      return;
    }
    const title = `${evaluationSet.name || "Evaluation"} · ${run.label || "Run"} · Case ${index + 1}`;
    const startedAt = Date.now();
    const caseThread = await createHiddenThread(record, {
      title,
      agentId: run.targetAgentId,
      environmentId: run.environmentId,
      projectId: run.projectId,
      metadata: buildCaseMetadata({ evaluationSet, run, caseRun, row, kind: "case" }),
      guardrail: record.targetGuardrail || null,
    });
    patchRunCase(run.id, caseRun.id, {
      threadId: caseThread.id,
      status: "running_case",
      actualOutput: "Thread started.",
    });
    const actualOutput = await runThreadMessage(record, caseThread.id, row.input);
    patchRunCase(run.id, caseRun.id, {
      status: "waiting_for_case_summary",
      actualOutput: actualOutput || "Thread completed. Open the thread to inspect the run summary.",
    });
    const snapshot = await buildThreadSnapshot(record, {
      threadId: caseThread.id,
      row,
      evaluationSet,
      actualOutput,
    });
    const expected = String(row.expectedOutput || "");
    const evaluator = normalizeEvaluator(run.evaluator || evaluationSet.evaluator);
    const passThreshold = normalizePassThreshold(run.passThreshold ?? evaluationSet.passThreshold ?? 0.8);
    let evaluatorThreadId = "";
    let evaluatorOutput = "";
    let score = 0;
    let status = "completed";
    let evaluatorReason = "";
    let evaluatorParseStatus = "not_required";
    let costTokens = normalizeTokenCount(snapshot.costTokens);
    let costUsd = normalizeUsdCost(snapshot.costUsd) || (costTokens > 0 ? costTokens / EVALUATION_CT_PER_DOLLAR : 0);
    if (evaluator.type === "exact") {
      score = snapshot.finalSummary && expected.trim()
        ? (normalizeComparable(snapshot.finalSummary) === normalizeComparable(expected) ? 1 : 0)
        : 0;
      status = expected.trim() ? (score >= passThreshold ? "passed" : "failed") : "completed";
    } else if (evaluator.type === "code") {
      patchRunCase(run.id, caseRun.id, { status: "scoring" });
      try {
        const evaluatorFn = new Function("input", "expected", "actual", "guidance", "snapshot", String(evaluator.code || "return 0;"));
        const rawScore = evaluatorFn(
          String(row.input || ""),
          expected,
          snapshot.finalSummary || actualOutput,
          { dataset: evaluationSet.evaluationGuidance || "", row: row.evaluationGuidance || "" },
          snapshot,
        );
        const parsed = rawScore && typeof rawScore === "object" && !Array.isArray(rawScore)
          ? parseEvaluatorResult(JSON.stringify(rawScore))
          : { score: clampScore(rawScore) ?? 0, reason: "", parseStatus: "code_numeric" };
        score = parsed.score;
        evaluatorReason = parsed.reason || "";
        evaluatorParseStatus = parsed.parseStatus || "code_numeric";
        status = score >= passThreshold ? "passed" : "failed";
      } catch (error) {
        evaluatorOutput = error instanceof Error ? error.message : String(error);
        score = 0;
        status = "error";
        evaluatorParseStatus = "code_error";
      }
    } else if (evaluator.type === "agent") {
      const evaluatorAgentId = normalizeString(evaluator.agentId);
      if (!evaluatorAgentId) {
        throw createRuntimeError("Select an evaluator agent before running this evaluation.", 400);
      }
      const evaluatorThread = await createHiddenThread(record, {
        title: `${title} · Evaluator`,
        agentId: evaluatorAgentId,
        environmentId: run.environmentId,
        projectId: run.projectId,
        metadata: buildCaseMetadata({ evaluationSet, run, caseRun, row, kind: "evaluator", sourceThreadId: caseThread.id }),
      });
      evaluatorThreadId = evaluatorThread.id;
      patchRunCase(run.id, caseRun.id, {
        evaluatorThreadId,
        status: "running_evaluator",
      });
      const evaluatorMessageSummary = await runThreadMessage(record, evaluatorThreadId, buildEvaluatorPrompt({
        evaluationSet,
        run,
        caseRun,
        row,
        snapshot,
      }));
      costTokens += await fetchThreadCostTokens(record, evaluatorThreadId).catch(() => 0);
      costUsd += await fetchThreadCostUsd(record, evaluatorThreadId).catch(() => 0);
      const evaluatorResult = await waitForEvaluatorResult(record, evaluatorThreadId, evaluatorMessageSummary);
      evaluatorOutput = evaluatorResult.output || evaluatorMessageSummary;
      patchRunCase(run.id, caseRun.id, { status: "scoring", evaluatorOutput });
      const parsed = evaluatorResult.parsed || parseEvaluatorResult(evaluatorOutput);
      score = parsed.score;
      evaluatorReason = parsed.reason || "";
      evaluatorParseStatus = parsed.parseStatus;
      status = parsed.parseStatus === "missing_output" || parsed.parseStatus === "unparsed"
        ? "completed"
        : score >= passThreshold ? "passed" : "failed";
    }
    patchRunCase(run.id, caseRun.id, {
      threadId: caseThread.id,
      evaluatorThreadId,
      actualOutput: snapshot.finalSummary || actualOutput || "Thread completed. Open the thread to inspect the run summary.",
      evaluatorOutput,
      evaluatorReason,
      evaluatorParseStatus,
      snapshotVersion: snapshot.version,
      score,
      costTokens,
      costUsd,
      costSource: "thread_usage_ct",
      status,
      latencyMs: Date.now() - startedAt,
      error: status === "error" ? (evaluatorOutput || "Evaluation scoring failed.") : "",
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
      try {
        patchRunCase(runId, caseRun.id, { status: "running", error: "" });
        await runEvaluationCase(latestRecord, caseRun, index);
      } catch (error) {
        patchRunCase(runId, caseRun.id, {
          status: "error",
          score: 0,
          error: error instanceof Error ? error.message : String(error),
          completedAt: new Date().toISOString(),
        });
      }
    }
    patchRun(runId, (run) => ({
      ...run,
      completedAt: new Date().toISOString(),
    }));
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

  async function handleCreateRun(req, res) {
    try {
      pruneRuns();
      const body = await readRequestBody(req);
      const evaluationSet = normalizeEvaluationSet(body.evaluationSet || body.set || {});
      if (!evaluationSet.dataRows.length) {
        return sendJson(res, 400, { error: "Evaluation set has no data rows." });
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
      const runOptions = body.runOptions && typeof body.runOptions === "object" ? body.runOptions : {};
      const run = createEvaluationRun(evaluationSet, runOptions);
      const existingRecord = runsById.get(run.id);
      if (existingRecord) {
        return sendJson(res, 200, {
          object: "evaluation_run",
          run: existingRecord.run,
          idempotent: true,
        });
      }
      if (!run.targetAgentId || !run.environmentId) {
        return sendJson(res, 400, { error: "Select an agent and environment before running this evaluation." });
      }
      if (run.evaluator.type === "agent" && !run.evaluator.agentId) {
        return sendJson(res, 400, { error: "Select an evaluator agent before running this evaluation." });
      }
      const targetGuardrail = await resolveEvaluationGuardrailTarget({
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      }, runOptions);
      const record = {
        run,
        evaluationSet: {
          ...evaluationSet,
          targetAgentId: run.targetAgentId,
          environmentType: run.environmentType,
          environmentId: run.environmentId,
          projectId: run.projectId,
          evaluator: run.evaluator,
        },
        requestContext,
        upstreamUrl,
        apiKey,
        body,
        targetGuardrail,
      };
      storeRun(record);
      setTimeout(() => {
        executeRun(run.id).catch((error) => {
          patchRun(run.id, (currentRun) => ({
            ...currentRun,
            status: "failed",
            completedAt: new Date().toISOString(),
            cases: currentRun.cases.map((caseItem) => ["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"].includes(caseItem.status)
              ? normalizeRunCase({
                  ...caseItem,
                  status: "error",
                  score: 0,
                  error: error instanceof Error ? error.message : String(error),
                  completedAt: new Date().toISOString(),
                })
              : caseItem),
          }));
        });
      }, 0);
      return sendJson(res, 202, {
        object: "evaluation_run",
        run,
      });
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to start evaluation run",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function handleGetRun(req, res, runId) {
    pruneRuns();
    const normalizedRunId = normalizeString(runId);
    const record = runsById.get(normalizedRunId);
    if (!record) {
      try {
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
          "Failed to load persisted evaluation run."
        );
        return sendJson(res, 200, data);
      } catch (error) {
        return sendJson(res, Number(error?.status || 404), {
          error: "Evaluation run not found",
          message: error instanceof Error ? error.message : "The evaluation run is no longer available in the local runtime.",
        });
      }
    }
    return sendJson(res, 200, {
      object: "evaluation_run",
      run: record.run,
    });
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
    const runMatch = url.pathname.match(/^\/api\/real\/evaluations\/runs\/([^/]+)$/);
    if (req.method === "GET" && runMatch) {
      void handleGetRun(req, res, decodeURIComponent(runMatch[1]));
      return true;
    }
    return false;
  }

  return {
    handleRequest,
  };
}
