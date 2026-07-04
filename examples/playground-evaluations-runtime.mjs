const EVALUATION_RUN_TTL_MS = 1000 * 60 * 60 * 6;

function createEvaluationId(prefix = "eval") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeEvaluator(rawEvaluator = {}) {
  const source = rawEvaluator && typeof rawEvaluator === "object" && !Array.isArray(rawEvaluator) ? rawEvaluator : {};
  const rawType = normalizeString(source.type || source.evaluatorType).toLowerCase();
  return {
    type: ["agent", "code", "exact"].includes(rawType) ? rawType : "exact",
    agentId: normalizeString(source.agentId || source.agent_id),
    code: String(source.code || ""),
  };
}

function normalizePersonIdentity(rawValue = {}) {
  if (typeof rawValue === "string") {
    const value = normalizeString(rawValue);
    return {
      id: value,
      userId: "",
      name: value.includes("@") ? "" : value,
      email: value.includes("@") ? value : "",
      avatarUrl: "",
    };
  }
  const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
  return {
    id: normalizeString(source.id || source.userId || source.user_id || source.uid || source.email),
    userId: normalizeString(source.userId || source.user_id || source.uid),
    name: normalizeString(source.name || source.displayName || source.display_name || source.label || source.title),
    email: normalizeString(source.email || source.mail),
    avatarUrl: normalizeString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
  };
}

function getCreatorIdentity(source = {}) {
  const record = source && typeof source === "object" && !Array.isArray(source) ? source : {};
  const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  const nested = record.creator || record.createdBy || record.created_by || metadata.creator || metadata.createdBy || metadata.created_by || record.owner || metadata.owner || null;
  const direct = normalizePersonIdentity({
    id: record.creatorId || record.creator_id || record.createdById || record.created_by_id || metadata.creatorId || metadata.creator_id || metadata.createdById || metadata.created_by_id || record.userId || record.user_id,
    userId: record.creatorUserId || record.creator_user_id || metadata.creatorUserId || metadata.creator_user_id || record.userId || record.user_id,
    name: record.creatorName || record.creator_name || record.createdByName || record.created_by_name || metadata.creatorName || metadata.creator_name || metadata.createdByName || metadata.created_by_name,
    email: record.creatorEmail || record.creator_email || record.createdByEmail || record.created_by_email || metadata.creatorEmail || metadata.creator_email || metadata.createdByEmail || metadata.created_by_email,
    avatarUrl: record.creatorAvatarUrl || record.creator_avatar_url || record.createdByAvatarUrl || record.created_by_avatar_url || metadata.creatorAvatarUrl || metadata.creator_avatar_url || metadata.createdByAvatarUrl || metadata.created_by_avatar_url,
  });
  const nestedIdentity = normalizePersonIdentity(nested || {});
  return {
    id: nestedIdentity.id || direct.id,
    userId: nestedIdentity.userId || direct.userId,
    name: nestedIdentity.name || direct.name,
    email: nestedIdentity.email || direct.email,
    avatarUrl: nestedIdentity.avatarUrl || direct.avatarUrl,
  };
}

function normalizePassThreshold(value, fallback = 0.8) {
  const fallbackScore = Math.max(0, Math.min(1, Number(fallback) || 0.8));
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallbackScore;
  const normalizedValue = numericValue > 1 ? numericValue / 100 : numericValue;
  return Math.max(0, Math.min(1, normalizedValue));
}

function normalizeTokenCount(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : 0;
}

function normalizeRunCount(value, fallback = 1) {
  const fallbackCount = Math.max(1, Math.min(50, Math.round(Number(fallback) || 1)));
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallbackCount;
  return Math.max(1, Math.min(50, Math.round(numericValue)));
}

function readComputeTokenValue(source) {
  if (!source || typeof source !== "object") return 0;
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const usage = source.usage && typeof source.usage === "object" && !Array.isArray(source.usage) ? source.usage : {};
  const candidates = [
    source.costTokens,
    source.cost_tokens,
    source.costCt,
    source.costCT,
    source.cost_ct,
    source.computeTokens,
    source.compute_tokens,
    source.totalCT,
    source.totalCt,
    source.total_ct,
    source.ct,
    usage.costTokens,
    usage.cost_tokens,
    usage.costCt,
    usage.costCT,
    usage.cost_ct,
    usage.computeTokens,
    usage.compute_tokens,
    usage.totalCT,
    usage.totalCt,
    usage.total_ct,
    usage.ct,
    metadata.costTokens,
    metadata.cost_tokens,
    metadata.costCt,
    metadata.costCT,
    metadata.cost_ct,
    metadata.computeTokens,
    metadata.compute_tokens,
    metadata.totalCT,
    metadata.totalCt,
    metadata.total_ct,
    metadata.ct,
  ];
  for (const candidate of candidates) {
    const tokenCount = normalizeTokenCount(candidate);
    if (tokenCount > 0) return tokenCount;
  }
  return 0;
}

function normalizeDataRow(row, fallbackIndex = 0) {
  const source = row && typeof row === "object" && !Array.isArray(row) ? row : {};
  const input = typeof source.input === "string"
    ? source.input
    : typeof source.prompt === "string"
      ? source.prompt
      : source.input !== undefined
        ? JSON.stringify(source.input)
        : "";
  const expectedOutput = typeof source.expectedOutput === "string"
    ? source.expectedOutput
    : typeof source.expected_output === "string"
      ? source.expected_output
      : typeof source.output === "string"
        ? source.output
        : source.expected !== undefined
          ? JSON.stringify(source.expected)
          : "";
  return {
    id: normalizeString(source.id || source.caseId || source.case_id) || createEvaluationId("eval_case"),
    input,
    expectedOutput,
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
    runCount: normalizeRunCount(source.runCount ?? source.run_count ?? source.runs ?? source.repeatCount ?? source.repeat_count ?? source.repetitions ?? 1),
    sourceThreadId: normalizeString(source.sourceThreadId || source.source_thread_id || source.metadata?.sourceThreadId || source.metadata?.source_thread_id),
    sourceThreadTitle: normalizeString(source.sourceThreadTitle || source.source_thread_title || source.metadata?.sourceThreadTitle || source.metadata?.source_thread_title),
    sourceAgentId: normalizeString(source.sourceAgentId || source.source_agent_id || source.metadata?.sourceAgentId || source.metadata?.source_agent_id),
    sourceAgentName: normalizeString(source.sourceAgentName || source.source_agent_name || source.metadata?.sourceAgentName || source.metadata?.source_agent_name),
    sourceEnvironmentId: normalizeString(source.sourceEnvironmentId || source.source_environment_id || source.metadata?.sourceEnvironmentId || source.metadata?.source_environment_id),
    sourceEnvironmentName: normalizeString(source.sourceEnvironmentName || source.source_environment_name || source.metadata?.sourceEnvironmentName || source.metadata?.source_environment_name),
    sourceCreatedAt: normalizeString(source.sourceCreatedAt || source.source_created_at || source.metadata?.sourceCreatedAt || source.metadata?.source_created_at),
    sourceUpdatedAt: normalizeString(source.sourceUpdatedAt || source.source_updated_at || source.metadata?.sourceUpdatedAt || source.metadata?.source_updated_at),
    reviewStatus: ["draft", "ready", "needs_review"].includes(normalizeString(source.reviewStatus || source.review_status).toLowerCase())
      ? normalizeString(source.reviewStatus || source.review_status).toLowerCase()
      : "",
    metadata: source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null,
    createdAt: normalizeString(source.createdAt || source.created_at) || new Date(Date.now() + fallbackIndex).toISOString(),
    updatedAt: normalizeString(source.updatedAt || source.updated_at || source.createdAt || source.created_at) || new Date().toISOString(),
  };
}

function normalizeEvaluationSet(record = {}) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null;
  const creator = getCreatorIdentity(source);
  const dataRows = Array.isArray(source.dataRows)
    ? source.dataRows
    : Array.isArray(source.data_rows)
      ? source.data_rows
      : Array.isArray(source.data)
        ? source.data
        : [];
  return {
    id: normalizeString(source.id || source.evaluationId || source.evaluation_id) || createEvaluationId("eval_set"),
    name: normalizeString(source.name || source.title) || "Untitled Evaluation",
    description: String(source.description || ""),
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
    passThreshold: normalizePassThreshold(source.passThreshold ?? source.pass_threshold ?? source.threshold ?? 0.8),
    evaluator: normalizeEvaluator(source.evaluator),
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
    environmentType: normalizeString(source.environmentType || source.environment_type).toLowerCase() === "project" ? "project" : "computer",
    environmentId: normalizeString(source.environmentId || source.environment_id || source.computerId || source.computer_id),
    projectId: normalizeString(source.projectId || source.project_id),
    dataRows: dataRows.map((row, index) => normalizeDataRow(row, index)),
    creator,
    createdBy: creator,
    metadata,
    createdAt: normalizeString(source.createdAt || source.created_at),
    updatedAt: normalizeString(source.updatedAt || source.updated_at),
  };
}

function normalizeComparable(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function clampScore(value) {
  const numericScore = Number(value);
  if (!Number.isFinite(numericScore)) return null;
  return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
}

function normalizeRunCase(rawCase = {}, fallbackIndex = 0) {
  const source = rawCase && typeof rawCase === "object" && !Array.isArray(rawCase) ? rawCase : {};
  const score = clampScore(source.score);
  const status = normalizeString(source.status).toLowerCase();
  return {
    id: normalizeString(source.id || source.caseRunId || source.case_run_id) || createEvaluationId("eval_run_case"),
    dataRowId: normalizeString(source.dataRowId || source.data_row_id || source.caseId || source.case_id),
    dataRowRunIndex: normalizeRunCount(source.dataRowRunIndex ?? source.data_row_run_index ?? source.repeatIndex ?? source.repeat_index ?? 1),
    dataRowRunCount: normalizeRunCount(source.dataRowRunCount ?? source.data_row_run_count ?? source.repeatCount ?? source.repeat_count ?? 1),
    threadId: normalizeString(source.threadId || source.thread_id),
    evaluatorThreadId: normalizeString(source.evaluatorThreadId || source.evaluator_thread_id),
    input: String(source.input || ""),
    expectedOutput: String(source.expectedOutput || source.expected_output || ""),
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
    actualOutput: String(source.actualOutput || source.actual_output || ""),
    evaluatorOutput: String(source.evaluatorOutput || source.evaluator_output || ""),
    evaluatorReason: String(source.evaluatorReason || source.evaluator_reason || ""),
    evaluatorParseStatus: String(source.evaluatorParseStatus || source.evaluator_parse_status || ""),
    snapshotVersion: String(source.snapshotVersion || source.snapshot_version || ""),
    score: score === null ? 0 : score,
    costTokens: readComputeTokenValue(source),
    costSource: normalizeString(source.costSource || source.cost_source),
    status: [
      "queued",
      "running",
      "running_case",
      "waiting_for_case_summary",
      "running_evaluator",
      "scoring",
      "completed",
      "passed",
      "failed",
      "error",
    ].includes(status) ? status : "queued",
    latencyMs: Math.max(0, Number(source.latencyMs || source.latency_ms || 0) || 0),
    error: String(source.error || ""),
    createdAt: normalizeString(source.createdAt || source.created_at) || new Date(Date.now() + fallbackIndex).toISOString(),
    completedAt: normalizeString(source.completedAt || source.completed_at),
  };
}

function recomputeRun(nextRun) {
  const cases = Array.isArray(nextRun.cases) ? nextRun.cases.map((item, index) => normalizeRunCase(item, index)) : [];
  const activeStatuses = new Set(["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]);
  const activeCount = cases.filter((item) => activeStatuses.has(item.status)).length;
  const errorCount = cases.filter((item) => item.status === "error").length;
  const passThreshold = normalizePassThreshold(nextRun.passThreshold ?? nextRun.pass_threshold ?? 0.8);
  const averageScore = cases.length > 0
    ? cases.reduce((sum, item) => sum + Number(item.score || 0), 0) / cases.length
    : 0;
  const costTokens = cases.reduce((sum, item) => sum + normalizeTokenCount(item.costTokens), 0);
  const costSource = costTokens > 0 && cases.some((item) => item.costSource === "thread_usage_ct")
    ? "thread_usage_ct"
    : normalizeString(nextRun.costSource || nextRun.cost_source);
  return {
    ...nextRun,
    cases,
    passThreshold,
    costTokens,
    costSource,
    averageScore: Math.max(0, Math.min(1, averageScore)),
    passedCount: cases.filter((item) => !activeStatuses.has(item.status) && item.status !== "error" && Number(item.score || 0) >= passThreshold).length,
    totalCount: cases.length,
    status: activeCount > 0 ? "running" : errorCount === cases.length && cases.length > 0 ? "failed" : "completed",
    completedAt: activeCount > 0 ? String(nextRun.completedAt || "") : (String(nextRun.completedAt || "") || new Date().toISOString()),
  };
}

function createEvaluationRun(evaluationSet, options = {}) {
  const nowIso = new Date().toISOString();
  const evaluator = normalizeEvaluator(options.evaluator || evaluationSet.evaluator);
  const datasetVersion = normalizeString(evaluationSet.updatedAt || evaluationSet.updated_at || evaluationSet.createdAt || evaluationSet.created_at) || nowIso;
  const evaluatorVersion = `evaluator_v1:${evaluator.type}:${evaluator.agentId || "builtin"}`;
  const run = {
    id: normalizeString(options.id || options.runId || options.run_id) || createEvaluationId("eval_run"),
    evaluationSetId: evaluationSet.id,
    evaluationVersionId: normalizeString(options.evaluationVersionId || options.evaluation_version_id),
    evaluationVersionNumber: Math.max(0, Number(options.evaluationVersionNumber || options.evaluation_version_number || 0) || 0),
    evaluationVersionLabel: normalizeString(options.evaluationVersionLabel || options.evaluation_version_label),
    label: normalizeString(options.label || options.name) || "Run",
    status: "running",
    createdAt: nowIso,
    completedAt: "",
    targetAgentId: normalizeString(options.targetAgentId || evaluationSet.targetAgentId),
    targetAgentName: normalizeString(options.targetAgentName || options.target_agent_name),
    targetAgentPhotoUrl: normalizeString(options.targetAgentPhotoUrl || options.target_agent_photo_url),
    targetAgentVersionId: normalizeString(options.targetAgentVersionId || options.target_agent_version_id || options.agentVersionId || options.agent_version_id),
    targetAgentVersionNumber: Math.max(0, Number(options.targetAgentVersionNumber || options.target_agent_version_number || options.agentVersionNumber || options.agent_version_number || 0) || 0),
    targetAgentVersionLabel: normalizeString(options.targetAgentVersionLabel || options.target_agent_version_label || options.agentVersionLabel || options.agent_version_label),
    targetAgentVersionRevisionId: normalizeString(options.targetAgentVersionRevisionId || options.target_agent_version_revision_id || options.agentVersionRevisionId || options.agent_version_revision_id),
    environmentType: normalizeString(options.environmentType || evaluationSet.environmentType).toLowerCase() === "project" ? "project" : "computer",
    environmentId: normalizeString(options.environmentId || evaluationSet.environmentId),
    environmentName: normalizeString(options.environmentName || options.environment_name),
    projectId: normalizeString(options.projectId || evaluationSet.projectId),
    projectName: normalizeString(options.projectName || options.project_name),
    evaluator,
    passThreshold: normalizePassThreshold(options.passThreshold ?? options.pass_threshold ?? evaluationSet.passThreshold ?? evaluationSet.pass_threshold ?? 0.8),
    datasetVersion,
    evaluatorVersion,
    cases: evaluationSet.dataRows
      .flatMap((row) => {
        const runCount = normalizeRunCount(row.runCount);
        return Array.from({ length: runCount }, (_item, repeatIndex) => ({ row, repeatIndex, runCount }));
      })
      .map(({ row, repeatIndex, runCount }, index) => normalizeRunCase({
        id: createEvaluationId("eval_run_case"),
        dataRowId: row.id,
        dataRowRunIndex: repeatIndex + 1,
        dataRowRunCount: runCount,
        input: row.input,
        expectedOutput: row.expectedOutput,
        evaluationGuidance: row.evaluationGuidance,
        status: "queued",
        createdAt: nowIso,
      }, index)),
  };
  return recomputeRun(run);
}

function extractThreadRecord(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.thread, source.data?.thread, source.data, source.item, source.record, source];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const id = normalizeString(candidate.id || candidate.threadId || candidate.thread_id);
      if (id) return { ...candidate, id };
    }
  }
  return null;
}

function normalizeResponseArray(data, keys = []) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function readRecordText(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map(readRecordText).filter(Boolean).join("\n").trim();
  }
  if (!value || typeof value !== "object") return "";
  const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata) ? value.metadata : {};
  const response = value.response && typeof value.response === "object" && !Array.isArray(value.response) ? value.response : {};
  const result = value.result && typeof value.result === "object" && !Array.isArray(value.result) ? value.result : {};
  const candidates = [
    value.summary,
    value.runSummary,
    value.run_summary,
    value.output,
    value.outputText,
    value.output_text,
    value.content,
    value.text,
    value.message,
    value.body,
    response.output_text,
    response.outputText,
    response.summary,
    result.output_text,
    result.outputText,
    result.summary,
    result.text,
    metadata.summary,
    metadata.runSummary,
    metadata.run_summary,
    metadata.output,
    metadata.outputText,
    metadata.output_text,
    metadata.result,
    metadata.response,
    metadata.content,
    metadata.text,
    metadata.message,
  ];
  for (const candidate of candidates) {
    const text = readRecordText(candidate);
    if (text) return text;
  }
  if (Object.prototype.hasOwnProperty.call(value, "score") || Object.prototype.hasOwnProperty.call(value, "reason")) {
    try {
      return JSON.stringify(value);
    } catch {}
  }
  return "";
}

function getRecordType(record) {
  const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  return normalizeString(record?.eventType || record?.event_type || record?.stepKind || record?.step_kind || record?.type || record?.kind || metadata.eventType || metadata.type).toLowerCase();
}

function getRecordTimestamp(record) {
  return normalizeString(record?.createdAt || record?.created_at || record?.timestamp || record?.updatedAt || record?.updated_at);
}

function extractFinalSummaryFromRecords(records) {
  const orderedRecords = (Array.isArray(records) ? records : [])
    .filter((record) => record && typeof record === "object")
    .sort((left, right) => getRecordTimestamp(left).localeCompare(getRecordTimestamp(right)));
  const preferredRecords = orderedRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary");
  });
  const candidates = preferredRecords.length > 0 ? preferredRecords : orderedRecords;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const text = readRecordText(candidates[index]);
    if (text) return text;
  }
  return "";
}

function normalizeSourceThreadRecord(record = {}, fallbackThreadId = "") {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
    ? metadata.runnerPlayground
    : {};
  const taskPreview = runnerPlayground.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
    ? runnerPlayground.taskPreview
    : {};
  const agent = source.agent && typeof source.agent === "object" && !Array.isArray(source.agent) ? source.agent : {};
  const environment = source.environment && typeof source.environment === "object" && !Array.isArray(source.environment)
    ? source.environment
    : source.computer && typeof source.computer === "object" && !Array.isArray(source.computer)
      ? source.computer
      : {};
  return {
    id: normalizeString(source.id || source.threadId || source.thread_id || fallbackThreadId),
    title: normalizeString(source.title || source.name || source.subject || taskPreview.title) || "Untitled thread",
    status: normalizeString(source.status || source.state),
    agentId: normalizeString(source.agentId || source.agent_id || agent.id || metadata.agentId || metadata.agent_id || runnerPlayground.agentId || taskPreview.agentId),
    agentName: normalizeString(source.agentName || source.agent_name || agent.name || agent.label || metadata.agentName || metadata.agent_name || runnerPlayground.agentName || taskPreview.agentName),
    environmentId: normalizeString(source.environmentId || source.environment_id || source.computerId || source.computer_id || environment.id || metadata.environmentId || metadata.environment_id || runnerPlayground.environmentId || taskPreview.environmentId),
    environmentName: normalizeString(source.environmentName || source.environment_name || source.computerName || source.computer_name || environment.name || environment.label || metadata.environmentName || metadata.environment_name || runnerPlayground.environmentName || taskPreview.environmentName),
    createdAt: normalizeString(source.createdAt || source.created_at),
    updatedAt: normalizeString(source.updatedAt || source.updated_at || source.completedAt || source.completed_at || source.finishedAt || source.finished_at || source.createdAt || source.created_at),
  };
}

function takeSourceThreadContext(records, headCount = 6, tailCount = 18) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter(Boolean);
  if (sourceRecords.length <= headCount + tailCount) {
    return sourceRecords;
  }
  const head = sourceRecords.slice(0, headCount);
  const tail = sourceRecords.slice(-tailCount);
  const seen = new Set();
  return [...head, ...tail].filter((record, index) => {
    const key = normalizeString(record?.id || record?.createdAt || record?.text) || String(index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function parseJsonObjectFromText(value) {
  const text = normalizeString(value);
  if (!text) return null;
  const fencedJsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const objectJsonMatch = text.match(/\{[\s\S]*\}/);
  const candidates = [
    fencedJsonMatch && fencedJsonMatch[1],
    objectJsonMatch && objectJsonMatch[0],
    text,
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }
  return null;
}

function normalizeCaseRefinementResult(value) {
  const parsed = parseJsonObjectFromText(value);
  if (!parsed) {
    return null;
  }
  const input = normalizeString(parsed.input || parsed.caseInput || parsed.case_input || parsed.userInput || parsed.user_input);
  const expectedOutput = normalizeString(parsed.expectedOutput || parsed.expected_output || parsed.referenceOutput || parsed.reference_output || parsed.output);
  const evaluationGuidance = normalizeString(parsed.evaluationGuidance || parsed.evaluation_guidance || parsed.scoringGuidance || parsed.scoring_guidance || parsed.rubric);
  const rawAssessment = normalizeString(parsed.sourceAssessment || parsed.source_assessment || parsed.historicalRunAssessment || parsed.historical_run_assessment || parsed.assessment).toLowerCase();
  const sourceAssessment = ["successful", "partially_successful", "failed", "unclear"].includes(rawAssessment)
    ? rawAssessment
    : "unclear";
  const confidence = clampScore(parsed.confidence);
  const needsReview = typeof parsed.needsReview === "boolean"
    ? parsed.needsReview
    : typeof parsed.needs_review === "boolean"
      ? parsed.needs_review
      : sourceAssessment !== "successful";
  return {
    input,
    expectedOutput,
    evaluationGuidance,
    sourceAssessment,
    sourceFailureReason: normalizeString(parsed.sourceFailureReason || parsed.source_failure_reason || parsed.failureReason || parsed.failure_reason),
    caseIntent: normalizeString(parsed.caseIntent || parsed.case_intent || parsed.intent),
    confidence: confidence === null ? null : confidence,
    needsReview,
    raw: parsed,
  };
}

function isUsableCaseRefinementResult(result) {
  return Boolean(
    result
    && normalizeString(result.input)
    && normalizeString(result.expectedOutput)
    && normalizeString(result.evaluationGuidance)
  );
}

function buildCaseRefinementPrompt({ evaluationSet, snapshot }) {
  return [
    "You are converting a historical Computer Agents thread into a reusable evaluation case.",
    "Analyze the source thread deeply. The historical run may be correct, partially correct, or wrong.",
    "Your job is not to copy the historical result blindly. Your job is to infer the user's intended task and define what a future correct agent run should do.",
    "If the historical agent failed, identify the failure and write expectedOutput for the correct behavior that should have happened.",
    "Return only valid JSON in this exact shape:",
    "{\"input\":\"clean user task for the eval case\",\"expectedOutput\":\"reference behavior or output for a correct future run\",\"evaluationGuidance\":\"specific scoring rubric, including partial credit and failure conditions\",\"sourceAssessment\":\"successful|partially_successful|failed|unclear\",\"sourceFailureReason\":\"short reason when not successful\",\"caseIntent\":\"short intent label\",\"confidence\":0.0,\"needsReview\":true}",
    "Guidelines:",
    "- input should be the clean task that should be replayed in a future evaluation thread. Remove channel noise, repeated quoted replies, and irrelevant history unless needed.",
    "- expectedOutput should describe the desired correct result. It can be behavioral if exact wording is not important.",
    "- evaluationGuidance must tell the evaluator exactly what to check and how to score partial success.",
    "- Mark needsReview true if the source thread is ambiguous, failed, or lacks enough evidence.",
    "- Do not include Markdown fences. Do not include commentary outside the JSON object.",
    `Evaluation set: ${evaluationSet.name || "Untitled Evaluation"}`,
    `Dataset evaluator guidance:\n${String(evaluationSet.evaluationGuidance || "") || "None"}`,
    `Source thread ID: ${snapshot.thread?.id || snapshot.threadId || ""}`,
    "Inspect the source thread through available thread APIs if needed. A compact snapshot is included below for orientation.",
    `Compact source thread snapshot:\n${JSON.stringify(snapshot, null, 2)}`,
  ].join("\n\n");
}

function isCaseRefinementPromptText(text) {
  const normalized = String(text || "");
  return normalized.includes("You are converting a historical Computer Agents thread into a reusable evaluation case")
    && normalized.includes("Return only valid JSON in this exact shape");
}

function extractStreamSummary(text) {
  let latestText = "";
  String(text || "").split(/\n\n+/).forEach((block) => {
    const data = block
      .split(/\r?\n/)
      .map((line) => line.startsWith("data:") ? line.slice(5).trimStart() : "")
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!data || data === "[DONE]") return;
    try {
      const parsed = JSON.parse(data);
      const response = parsed?.response && typeof parsed.response === "object" ? parsed.response : {};
      const outputText = normalizeString(
        parsed?.summary
        || parsed?.output_text
        || parsed?.outputText
        || response?.output_text
        || response?.outputText
        || response?.summary
        || ""
      );
      if (outputText) latestText = outputText;
    } catch {}
  });
  return latestText;
}

function compactSnapshotRecord(record) {
  if (!record || typeof record !== "object") return null;
  const text = readRecordText(record);
  return {
    id: normalizeString(record.id || record.messageId || record.message_id || record.stepId || record.step_id),
    type: getRecordType(record),
    createdAt: getRecordTimestamp(record),
    text: text.length > 1800 ? `${text.slice(0, 1800).trimEnd()}...` : text,
  };
}

function readNestedComputeTokenValue(value, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) {
    return 0;
  }
  seen.add(value);
  const directValue = readComputeTokenValue(value);
  if (directValue > 0) return directValue;
  const candidates = [];
  [
    value.usage,
    value.tokenUsage,
    value.token_usage,
    value.metrics,
    value.billing,
    value.cost,
    value.result,
    value.response,
    value.metadata,
  ].forEach((candidate) => {
    const tokenCount = readNestedComputeTokenValue(candidate, depth + 1, seen);
    if (tokenCount > 0) candidates.push(tokenCount);
  });
  return candidates.length > 0 ? Math.max(...candidates) : 0;
}

function extractThreadCostTokens(records) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter((record) => record && typeof record === "object");
  const explicitThreadTotals = sourceRecords
    .map((record) => {
      const metadata = record.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
      return normalizeTokenCount(
        record.totalCT
        ?? record.totalCt
        ?? record.total_ct
        ?? record.totalCostCT
        ?? record.total_cost_ct
        ?? record.threadCT
        ?? record.threadCt
        ?? record.thread_ct
        ?? metadata.totalCT
        ?? metadata.totalCt
        ?? metadata.total_ct
        ?? metadata.totalCostCT
        ?? metadata.total_cost_ct
        ?? metadata.threadCT
        ?? metadata.threadCt
        ?? metadata.thread_ct
      );
    })
    .filter((count) => count > 0);
  if (explicitThreadTotals.length > 0) {
    return Math.max(...explicitThreadTotals);
  }
  const preferredRecords = sourceRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const recordsForCost = preferredRecords.length > 0 ? preferredRecords : sourceRecords;
  const seenCostKeys = new Set();
  return recordsForCost.reduce((sum, record, index) => {
    const tokenCount = readNestedComputeTokenValue(record);
    if (tokenCount <= 0) return sum;
    const timestamp = getRecordTimestamp(record);
    const type = getRecordType(record);
    const key = timestamp || type
      ? [timestamp, type, String(tokenCount)].join("|")
      : [normalizeString(record.id || record.logId || record.log_id || record.stepId || record.step_id) || String(index), String(tokenCount)].join("|");
    if (seenCostKeys.has(key)) return sum;
    seenCostKeys.add(key);
    return sum + tokenCount;
  }, 0);
}

function parseEvaluatorResult(value) {
  const text = normalizeString(value);
  const fallback = { score: 0, reason: "", confidence: null, passed: false, parseStatus: "missing_output", raw: text };
  if (!text) return fallback;
  const fencedJsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const objectJsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonCandidate = (fencedJsonMatch && fencedJsonMatch[1]) || (objectJsonMatch && objectJsonMatch[0]) || "";
  if (jsonCandidate) {
    try {
      const parsed = JSON.parse(jsonCandidate);
      const score = clampScore(parsed?.score ?? parsed?.grade ?? parsed?.rating ?? parsed?.result?.score);
      if (score !== null) {
        return {
          score,
          reason: normalizeString(parsed.reason || parsed.rationale || parsed.explanation || parsed.message),
          confidence: clampScore(parsed.confidence),
          passed: typeof parsed.passed === "boolean" ? parsed.passed : score >= 0.8,
          parseStatus: "parsed_json",
          raw: text,
        };
      }
    } catch {}
  }
  const percentMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*(100|[0-9]{1,2}(?:\.[0-9]+)?)\s*%/i);
  if (percentMatch) {
    const score = clampScore(Number(percentMatch[1]) / 100);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_percent" };
  }
  const fractionMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*([01](?:\.[0-9]+)?|0?\.[0-9]+)\s*\/\s*1\b/i);
  if (fractionMatch) {
    const score = clampScore(fractionMatch[1]);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_fraction" };
  }
  const numberMatch = text.match(/(?:score|grade|rating)\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (numberMatch) {
    const score = clampScore(numberMatch[1]);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_number" };
  }
  const naturalScoreMatch = text.match(/\bscor(?:e|ed|ing)\b[\s\S]{0,80}?\b(100|[0-9]{1,2}(?:\.[0-9]+)?|[01](?:\.[0-9]+)?)\b/i);
  if (naturalScoreMatch) {
    const score = clampScore(naturalScoreMatch[1]);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_natural_language" };
  }
  return { ...fallback, parseStatus: "unparsed" };
}

function isParsedEvaluatorResult(parsed) {
  const parseStatus = normalizeString(parsed?.parseStatus).toLowerCase();
  return Boolean(parsed && parseStatus && parseStatus !== "missing_output" && parseStatus !== "unparsed");
}

function isEvaluatorPromptText(text) {
  const normalized = String(text || "");
  return normalized.includes("You are the evaluator for an agent evaluation run")
    && normalized.includes("Return only valid JSON in this exact shape");
}

function isUserLikeRecord(record) {
  const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  const values = [
    record?.role,
    record?.sender,
    record?.authorRole,
    record?.author_role,
    record?.eventType,
    record?.event_type,
    record?.type,
    metadata.role,
    metadata.sender,
    metadata.eventType,
    metadata.type,
  ].map((value) => normalizeString(value).toLowerCase());
  return values.some((value) => value === "user" || value === "user_message" || value === "human");
}

function isAssistantLikeRecord(record) {
  const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  const values = [
    record?.role,
    record?.sender,
    record?.authorRole,
    record?.author_role,
    record?.eventType,
    record?.event_type,
    record?.type,
    record?.kind,
    metadata.role,
    metadata.sender,
    metadata.eventType,
    metadata.type,
    metadata.kind,
  ].map((value) => normalizeString(value).toLowerCase());
  return values.some((value) => (
    value === "assistant"
    || value === "assistant_message"
    || value === "agent_message"
    || value === "turn_completed"
    || value === "run_summary"
    || value.includes("summary")
  ));
}

function buildEvaluatorScoringCandidates(records, fallback = "") {
  const candidates = [];
  (Array.isArray(records) ? records : []).forEach((record, index) => {
    const text = readRecordText(record);
    if (!text || isEvaluatorPromptText(text) || isUserLikeRecord(record)) {
      return;
    }
    const type = getRecordType(record);
    const assistantLike = isAssistantLikeRecord(record);
    candidates.push({
      text,
      timestamp: getRecordTimestamp(record),
      index,
      priority: assistantLike ? 3 : type === "turn_completed" || type.includes("summary") ? 2 : 1,
    });
  });
  const fallbackText = normalizeString(fallback);
  if (fallbackText && !isEvaluatorPromptText(fallbackText)) {
    candidates.push({
      text: fallbackText,
      timestamp: "",
      index: Number.MAX_SAFE_INTEGER,
      priority: 2,
    });
  }
  return candidates.sort((left, right) => {
    if (right.priority !== left.priority) return right.priority - left.priority;
    const timestampCompare = String(right.timestamp || "").localeCompare(String(left.timestamp || ""));
    if (timestampCompare !== 0) return timestampCompare;
    return right.index - left.index;
  });
}

function buildEvaluatorPrompt({ evaluationSet, run, caseRun, row, snapshot }) {
  return [
    "You are the evaluator for an agent evaluation run. Score the completed evaluation thread by inspecting it through the thread APIs and tools available to you.",
    "Return only valid JSON in this exact shape: {\"score\": 0.0, \"reason\": \"short explanation\", \"passed\": false, \"confidence\": 0.0}.",
    "The score must be a number between 0 and 1. Use 1 for fully correct, 0 for completely wrong, and partial values for partially correct.",
    "Apply the dataset and row evaluator guidance when present. Row guidance is more specific than dataset guidance. If guidance defines partial credit floors or special scoring rules, apply them.",
    "Do not solve the original task yourself. Only evaluate what happened in the evaluation thread.",
    "Use the evaluation thread id below as the source of truth. Inspect the thread's user messages, assistant run summary, working logs, and artifacts yourself instead of relying on this prompt to contain the full thread data.",
    `Evaluation set: ${evaluationSet.name || "Untitled Evaluation"}`,
    `Run: ${run.label || "Evaluation Run"}`,
    `Case ID: ${caseRun.id || ""}`,
    `Evaluation thread ID: ${snapshot.threadId || ""}`,
    `Input:\n${String(row.input || "")}`,
    `Expected output:\n${String(row.expectedOutput || "")}`,
    `Dataset evaluator guidance:\n${String(evaluationSet.evaluationGuidance || "") || "None"}`,
    `Row evaluator guidance:\n${String(row.evaluationGuidance || "") || "None"}`,
  ].join("\n\n");
}

function cloneRequestContext(req) {
  return {
    url: req.url || "/",
    headers: {
      cookie: req.headers.cookie || "",
      authorization: req.headers.authorization || "",
      "x-api-key": req.headers["x-api-key"] || "",
      "x-runner-upstream-url": req.headers["x-runner-upstream-url"] || "",
      "x-computer-agents-organization": req.headers["x-computer-agents-organization"] || "",
    },
  };
}

function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
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
  }

  function patchRun(runId, updater) {
    const record = runsById.get(runId);
    if (!record) return null;
    const nextRun = recomputeRun(typeof updater === "function" ? updater(record.run) : record.run);
    const nextRecord = { ...record, run: nextRun, updatedAtMs: Date.now() };
    runsById.set(runId, nextRecord);
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

  async function createHiddenThread(record, { title, agentId, environmentId, projectId, metadata }) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
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
      metadata,
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
    return {
      version: "evaluation_snapshot_v1",
      generatedAt: new Date().toISOString(),
      threadId,
      costTokens,
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
      cases.push(normalizeRunCase({
        ...caseItem,
        costTokens: caseThreadCost + evaluatorThreadCost,
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

  function handleGetRun(_req, res, runId) {
    pruneRuns();
    const record = runsById.get(normalizeString(runId));
    if (!record) {
      return sendJson(res, 404, {
        error: "Evaluation run not found",
        message: "The evaluation run is no longer available in the local runtime.",
      });
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
      handleGetRun(req, res, decodeURIComponent(runMatch[1]));
      return true;
    }
    return false;
  }

  return {
    handleRequest,
  };
}
