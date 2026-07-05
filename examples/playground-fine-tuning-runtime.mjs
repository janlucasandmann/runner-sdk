const FINE_TUNING_JOB_TTL_MS = 1000 * 60 * 60 * 8;
const FINE_TUNING_CT_PER_DOLLAR = 100;

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizePersonIdentity(rawValue = {}) {
  const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
  return {
    id: normalizeString(source.id || source.userId || source.user_id || source.uid || source.email),
    userId: normalizeString(source.userId || source.user_id || source.uid),
    name: normalizeString(source.name || source.displayName || source.display_name || source.label || source.title),
    email: normalizeString(source.email || source.mail),
    avatarUrl: normalizeString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
  };
}

function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function createFineTuningId(prefix = "fine_tune_job") {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
}

function clampScore(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

function normalizeTokenCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
}

function normalizeUsdCost(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
}

function isFineTuningRuntimeActiveStatus(status) {
  return new Set([
    "active",
    "analysis",
    "analyzing",
    "creating_agent_version",
    "creating-version",
    "creating_version",
    "evaluating",
    "fine-tuning",
    "fine_tuning",
    "in-progress",
    "in_progress",
    "pending",
    "processing",
    "publishing",
    "publishing_version",
    "queued",
    "running",
    "running_case",
    "running_evaluator",
    "scoring",
    "started",
    "verification",
    "verifying",
    "verifying_evaluation",
    "waiting_for_case_summary",
  ]).has(
    normalizeString(status).toLowerCase()
  );
}

function computeTokensToUsd(value) {
  return normalizeTokenCount(value) / FINE_TUNING_CT_PER_DOLLAR;
}

function normalizeResponseArray(data, keys = []) {
  const source = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  if (Array.isArray(data)) return data;
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key];
    if (Array.isArray(source.data?.[key])) return source.data[key];
  }
  if (Array.isArray(source.items)) return source.items;
  if (Array.isArray(source.data)) return source.data;
  if (Array.isArray(source.records)) return source.records;
  return [];
}

function readPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function hasPlainObjectContent(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}

function readFirstPlainObject(...values) {
  for (const value of values) {
    if (hasPlainObjectContent(value)) return value;
  }
  return {};
}

function sanitizeReferenceText(value, maxLength = 2400) {
  const text = String(value || "");
  if (!maxLength || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\n\n...";
}

function compactFineTuningReferenceMetadata(metadata) {
  const source = readPlainObject(metadata);
  const blockedKeys = new Set([
    "beforeAgentSnapshot",
    "before_agent_snapshot",
    "afterAgentSnapshot",
    "after_agent_snapshot",
    "beforeSnapshot",
    "before_snapshot",
    "afterSnapshot",
    "after_snapshot",
    "baseAgentSnapshot",
    "base_agent_snapshot",
    "snapshot",
    "diffFiles",
    "diff_files",
    "diffs",
    "files",
  ]);
  return Object.fromEntries(
    Object.entries(source).filter(([key]) => !blockedKeys.has(key))
  );
}

function compactAgentVersionReference(version) {
  const source = readPlainObject(version);
  const id = normalizeString(source.id || source.versionId || source.version_id);
  if (!id) return null;
  const metadata = compactFineTuningReferenceMetadata(source.metadata);
  return {
    id,
    version: source.version,
    versionNumber: source.versionNumber || source.version_number,
    version_number: source.version_number || source.versionNumber,
    label: source.label,
    status: source.status,
    createdAt: source.createdAt || source.created_at,
    created_at: source.created_at || source.createdAt,
    updatedAt: source.updatedAt || source.updated_at,
    updated_at: source.updated_at || source.updatedAt,
    publishedAt: source.publishedAt || source.published_at,
    published_at: source.published_at || source.publishedAt,
    metadata,
  };
}

function normalizeFineTuningJobEvaluationSetReferences(job) {
  const source = readPlainObject(job);
  const evaluationSets = Array.isArray(source.evaluationSets)
    ? source.evaluationSets
    : Array.isArray(source.evaluation_sets)
      ? source.evaluation_sets
      : [];
  const explicitIds = Array.isArray(source.evaluationSetIds)
    ? source.evaluationSetIds
    : Array.isArray(source.evaluation_set_ids)
      ? source.evaluation_set_ids
      : [];
  const references = evaluationSets
    .map((set, index) => {
      const setSource = readPlainObject(set);
      const id = normalizeString(setSource.id || setSource.evaluationSetId || setSource.evaluation_set_id || explicitIds[index]);
      return id
        ? {
            id,
            name: normalizeString(setSource.name || setSource.title || "Evaluation " + (index + 1)),
            activeVersionId: normalizeString(setSource.activeVersionId || setSource.active_version_id),
            activeVersionNumber: Math.max(0, Number(setSource.activeVersionNumber || setSource.active_version_number || 0) || 0),
            activeVersionLabel: normalizeString(setSource.activeVersionLabel || setSource.active_version_label),
            fineTuningRunId: normalizeString(setSource.fineTuningRunId || setSource.fine_tuning_run_id || setSource.selectedRunId || setSource.selected_run_id),
            fineTuningRunLabel: normalizeString(setSource.fineTuningRunLabel || setSource.fine_tuning_run_label || setSource.selectedRunLabel || setSource.selected_run_label),
            caseCount: Math.max(0, Number(setSource.caseCount || setSource.case_count || 0) || 0),
          }
        : null;
    })
    .filter(Boolean);
  const existingIds = new Set(references.map((set) => set.id));
  explicitIds.forEach((setId, index) => {
    const id = normalizeString(setId);
    if (id && !existingIds.has(id)) {
      existingIds.add(id);
      references.push({ id, name: "Evaluation " + (index + 1) });
    }
  });
  return references;
}

function compactFineTuningJobRecord(job) {
  const source = readPlainObject(job);
  const metadata = compactFineTuningReferenceMetadata(source.metadata);
  const createdAgentVersion = compactAgentVersionReference(source.createdAgentVersion || source.created_agent_version);
  const evaluationSets = normalizeFineTuningJobEvaluationSetReferences(source);
  const evaluationRuns = Array.isArray(source.evaluationRuns)
    ? source.evaluationRuns
    : Array.isArray(source.evaluation_runs)
      ? source.evaluation_runs
      : [];
  const diffFiles = Array.isArray(source.diffFiles)
    ? source.diffFiles
    : Array.isArray(source.diff_files)
      ? source.diff_files
      : [];
  const id = normalizeString(source.id || source.jobId || source.job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
  const nowIso = new Date().toISOString();
  return {
    id,
    name: normalizeString(source.name || source.title || metadata.fineTuningJobName || metadata.fine_tuning_job_name || "Fine-Tune Job"),
    status: normalizeString(source.status || metadata.fineTuningStatus || metadata.fine_tuning_status || "running") || "running",
    createdAt: normalizeString(source.createdAt || source.created_at || metadata.fineTuningCreatedAt || metadata.fine_tuning_created_at || nowIso),
    updatedAt: normalizeString(source.updatedAt || source.updated_at || metadata.fineTuningUpdatedAt || metadata.fine_tuning_updated_at || source.createdAt || source.created_at || nowIso),
    agentId: normalizeString(source.agentId || source.agent_id || source.targetAgentId || source.target_agent_id || metadata.targetAgentId || metadata.target_agent_id),
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || metadata.targetAgentId || metadata.target_agent_id),
    agentName: normalizeString(source.agentName || source.agent_name || source.targetAgentName || source.target_agent_name || metadata.targetAgentName || metadata.target_agent_name || "Agent"),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || metadata.targetAgentName || metadata.target_agent_name || "Agent"),
    agentPhotoUrl: normalizeString(source.agentPhotoUrl || source.agent_photo_url || source.targetAgentPhotoUrl || source.target_agent_photo_url || metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url),
    conductedBy: source.conductedBy || source.conducted_by || metadata.conductedBy || metadata.conducted_by || {},
    createdBy: source.createdBy || source.created_by || metadata.createdBy || metadata.created_by || source.conductedBy || source.conducted_by || metadata.conductedBy || metadata.conducted_by || {},
    fineTunerAgentId: normalizeString(source.fineTunerAgentId || source.fine_tuner_agent_id || metadata.fineTunerAgentId || metadata.fine_tuner_agent_id),
    fineTunerAgentName: normalizeString(source.fineTunerAgentName || source.fine_tuner_agent_name || metadata.fineTunerAgentName || metadata.fine_tuner_agent_name),
    fineTunerAgentPhotoUrl: normalizeString(source.fineTunerAgentPhotoUrl || source.fine_tuner_agent_photo_url || metadata.fineTunerAgentPhotoUrl || metadata.fine_tuner_agent_photo_url),
    environmentId: normalizeString(source.environmentId || source.environment_id || source.computerId || source.computer_id || metadata.environmentId || metadata.environment_id),
    environmentName: normalizeString(source.environmentName || source.environment_name || metadata.environmentName || metadata.environment_name || "Computer"),
    evaluationSets,
    evaluationSetIds: evaluationSets.map((set) => set.id),
    instructions: sanitizeReferenceText(source.instructions, 4000),
    verifyAfter: true,
    threadId: normalizeString(source.threadId || source.thread_id || metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
    threadTitle: normalizeString(source.threadTitle || source.thread_title || metadata.threadTitle || metadata.thread_title || "Fine-Tuning Thread"),
    beforeScore: clampScore(source.beforeScore ?? source.before_score ?? metadata.beforeScore ?? metadata.before_score ?? 0),
    afterScore: clampScore(source.afterScore ?? source.after_score ?? metadata.afterScore ?? metadata.after_score ?? 0),
    improvementScore: clampScore(source.improvementScore ?? source.improvement_score ?? metadata.improvementScore ?? metadata.improvement_score ?? 0),
    costTokens: normalizeTokenCount(source.costTokens ?? source.cost_tokens ?? source.costCt ?? source.cost_ct),
    costUsd: normalizeUsdCost(source.costUsd ?? source.cost_usd ?? source.totalCostUsd ?? source.total_cost_usd ?? metadata.totalCostUsd ?? metadata.total_cost_usd ?? metadata.costUsd ?? metadata.cost_usd),
    fineTuningCostUsd: normalizeUsdCost(source.fineTuningCostUsd ?? source.fine_tuning_cost_usd ?? metadata.fineTuningCostUsd ?? metadata.fine_tuning_cost_usd),
    verificationCostUsd: normalizeUsdCost(source.verificationCostUsd ?? source.verification_cost_usd ?? metadata.verificationCostUsd ?? metadata.verification_cost_usd),
    analysisSummary: sanitizeReferenceText(source.analysisSummary || source.analysis_summary || metadata.analysisSummary || metadata.analysis_summary || "", 2400),
    evaluationRuns,
    diffFiles,
    createdAgentVersion,
    createdAgentVersionId: normalizeString(source.createdAgentVersionId || source.created_agent_version_id || createdAgentVersion?.id || metadata.createdAgentVersionId || metadata.created_agent_version_id),
    agentVersionCreationStatus: normalizeString(source.agentVersionCreationStatus || source.agent_version_creation_status || createdAgentVersion?.status || metadata.agentVersionCreationStatus || metadata.agent_version_creation_status || "pending") || "pending",
    agentVersionError: normalizeString(source.agentVersionError || source.agent_version_error),
    metadata: {
      ...metadata,
      fineTuningJobId: id,
      fine_tuning_job_id: id,
    },
    error: normalizeString(source.error || source.message),
  };
}

function mergeFineTuningJobRecords(existingJob, incomingJob) {
  const incomingSource = readPlainObject(incomingJob);
  const incomingMetadata = readPlainObject(incomingSource.metadata);
  const incomingHasExplicitStatus = Object.prototype.hasOwnProperty.call(incomingSource, "status")
    || Object.prototype.hasOwnProperty.call(incomingSource, "fineTuningStatus")
    || Object.prototype.hasOwnProperty.call(incomingSource, "fine_tuning_status")
    || Object.prototype.hasOwnProperty.call(incomingMetadata, "fineTuningStatus")
    || Object.prototype.hasOwnProperty.call(incomingMetadata, "fine_tuning_status");
  const existing = compactFineTuningJobRecord(existingJob);
  const incoming = compactFineTuningJobRecord(incomingJob);
  if (!existing.id) return incoming;
  if (!incoming.id) return existing;
  const existingVersion = readPlainObject(existing.createdAgentVersion);
  const incomingVersion = readPlainObject(incoming.createdAgentVersion);
  return compactFineTuningJobRecord({
    ...existing,
    ...incoming,
    status: incomingHasExplicitStatus ? incoming.status : existing.status || incoming.status,
    metadata: {
      ...readPlainObject(existing.metadata),
      ...readPlainObject(incoming.metadata),
    },
    threadId: incoming.threadId || existing.threadId,
    threadTitle: incoming.threadTitle || existing.threadTitle,
    evaluationSets: incoming.evaluationSets.length ? incoming.evaluationSets : existing.evaluationSets,
    evaluationRuns: incoming.evaluationRuns.length ? incoming.evaluationRuns : existing.evaluationRuns,
    diffFiles: incoming.diffFiles.length ? incoming.diffFiles : existing.diffFiles,
    analysisSummary: incoming.analysisSummary || existing.analysisSummary,
    createdAgentVersion: incomingVersion.id
      ? {
          ...existingVersion,
          ...incomingVersion,
          metadata: {
            ...readPlainObject(existingVersion.metadata),
            ...readPlainObject(incomingVersion.metadata),
          },
        }
      : existingVersion,
    createdAgentVersionId: incoming.createdAgentVersionId || existing.createdAgentVersionId,
  });
}

function getRecordType(record) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  return normalizeString(source.eventType || source.event_type || source.type || source.kind || metadata.eventType || metadata.event_type || metadata.type).toLowerCase();
}

function getRecordTimestamp(record) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  return normalizeString(source.timestamp || source.createdAt || source.created_at || source.completedAt || source.completed_at || source.time || source.at);
}

function readFineTuningRecordText(value, depth = 0) {
  if (value === null || value === undefined || depth > 5) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return "";
  if (Array.isArray(value)) {
    return value.map((item) => readFineTuningRecordText(item, depth + 1)).filter(Boolean).join("\n").trim();
  }
  if (typeof value !== "object") return "";
  const source = value;
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const candidates = [
    source.output_text,
    source.outputText,
    source.finalMessage,
    source.final_message,
    source.summary,
    source.runSummary,
    source.run_summary,
    source.result,
    source.output,
    source.response,
    source.content,
    source.text,
    source.message,
    source.message?.content,
    source.data?.content,
    source.data?.message,
    metadata.output_text,
    metadata.outputText,
    metadata.finalMessage,
    metadata.final_message,
    metadata.summary,
    metadata.runSummary,
    metadata.run_summary,
    metadata.result,
    metadata.output,
    metadata.response,
    metadata.content,
    metadata.text,
    metadata.message,
  ];
  for (const candidate of candidates) {
    const text = readFineTuningRecordText(candidate, depth + 1);
    if (text) return text;
  }
  return "";
}

function extractFineTuningThreadSummaryFromRecords(records) {
  const orderedRecords = (Array.isArray(records) ? records : [])
    .filter((record) => record && typeof record === "object")
    .sort((left, right) => getRecordTimestamp(left).localeCompare(getRecordTimestamp(right)));
  const preferredRecords = orderedRecords.filter((record) => {
    const type = getRecordType(record);
    const role = normalizeString(record?.role || record?.messageRole || record?.message_role).toLowerCase();
    return role === "assistant" || type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const candidates = preferredRecords.length ? preferredRecords : orderedRecords;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const text = sanitizeFineTuningAnalysisText(readFineTuningRecordText(candidates[index]));
    if (!text) continue;
    if (text.includes("You are running a fine-tuning analysis job")) continue;
    if (text.includes("Required execution path:")) continue;
    return text;
  }
  return "";
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

function readUsdCostValue(source) {
  if (!source || typeof source !== "object") return 0;
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const usage = source.usage && typeof source.usage === "object" && !Array.isArray(source.usage) ? source.usage : {};
  const candidates = [
    source.costUsd,
    source.costUSD,
    source.cost_usd,
    source.usdCost,
    source.usd_cost,
    source.totalUsd,
    source.totalUSD,
    source.total_usd,
    usage.costUsd,
    usage.costUSD,
    usage.cost_usd,
    usage.usdCost,
    usage.usd_cost,
    usage.totalUsd,
    usage.totalUSD,
    usage.total_usd,
    metadata.costUsd,
    metadata.costUSD,
    metadata.cost_usd,
    metadata.usdCost,
    metadata.usd_cost,
    metadata.totalUsd,
    metadata.totalUSD,
    metadata.total_usd,
  ];
  for (const candidate of candidates) {
    const usdCost = normalizeUsdCost(candidate);
    if (usdCost > 0) return usdCost;
  }
  return 0;
}

function readNestedCostValues(value, depth = 0, seen = new Set()) {
  if (!value || typeof value !== "object" || depth > 5 || seen.has(value)) {
    return { costTokens: 0, costUsd: 0 };
  }
  seen.add(value);
  const directTokens = readComputeTokenValue(value);
  const directUsd = readUsdCostValue(value);
  if (directTokens > 0 || directUsd > 0) {
    return { costTokens: directTokens, costUsd: directUsd };
  }
  const nestedValues = [
    value.usage,
    value.tokenUsage,
    value.token_usage,
    value.metrics,
    value.billing,
    value.cost,
    value.result,
    value.response,
    value.metadata,
  ].map((candidate) => readNestedCostValues(candidate, depth + 1, seen));
  return nestedValues.reduce((best, item) => ({
    costTokens: Math.max(best.costTokens, item.costTokens),
    costUsd: Math.max(best.costUsd, item.costUsd),
  }), { costTokens: 0, costUsd: 0 });
}

function extractThreadCosts(records) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter((record) => record && typeof record === "object");
  const preferredRecords = sourceRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary") || type === "llm_response";
  });
  const recordsForCost = preferredRecords.length > 0 ? preferredRecords : sourceRecords;
  const seenCostKeys = new Set();
  const totals = recordsForCost.reduce((sum, record, index) => {
    const costs = readNestedCostValues(record);
    if (costs.costTokens <= 0 && costs.costUsd <= 0) return sum;
    const timestamp = getRecordTimestamp(record);
    const type = getRecordType(record);
    const key = timestamp || type
      ? [timestamp, type, String(costs.costTokens), String(costs.costUsd)].join("|")
      : [normalizeString(record.id || record.logId || record.log_id || record.stepId || record.step_id) || String(index), String(costs.costTokens), String(costs.costUsd)].join("|");
    if (seenCostKeys.has(key)) return sum;
    seenCostKeys.add(key);
    return {
      costTokens: sum.costTokens + costs.costTokens,
      costUsd: sum.costUsd + costs.costUsd,
    };
  }, { costTokens: 0, costUsd: 0 });
  return {
    costTokens: totals.costTokens,
    costUsd: totals.costUsd || computeTokensToUsd(totals.costTokens),
  };
}

function normalizeEvaluationRun(rawRun = {}) {
  const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
  const cases = Array.isArray(source.cases) ? source.cases : [];
  const averageScore = source.averageScore ?? source.average_score;
  return {
    id: normalizeString(source.id || source.runId || source.run_id),
    label: normalizeString(source.label || source.name || source.title || "Run"),
    averageScore: clampScore(averageScore, cases.length > 0
      ? cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length
      : 0
    ),
    costTokens: normalizeTokenCount(source.costTokens ?? source.cost_tokens ?? source.costCT ?? source.cost_ct),
    costUsd: normalizeUsdCost(source.costUsd ?? source.cost_usd ?? source.usage?.costUsd ?? source.usage?.cost_usd)
      || computeTokensToUsd(source.costTokens ?? source.cost_tokens ?? source.costCT ?? source.cost_ct),
    createdAt: normalizeString(source.createdAt || source.created_at || source.completedAt || source.completed_at),
    status: normalizeString(source.status || "completed") || "completed",
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
    targetAgentVersionId: normalizeString(source.targetAgentVersionId || source.target_agent_version_id || source.agentVersionId || source.agent_version_id),
    targetAgentVersionNumber: Math.max(0, Number(source.targetAgentVersionNumber || source.target_agent_version_number || source.agentVersionNumber || source.agent_version_number || 0) || 0),
    targetAgentVersionLabel: normalizeString(source.targetAgentVersionLabel || source.target_agent_version_label || source.agentVersionLabel || source.agent_version_label),
  };
}

function normalizeEvaluationSet(rawSet = {}, fallbackIndex = 0) {
  const source = rawSet && typeof rawSet === "object" && !Array.isArray(rawSet) ? rawSet : {};
  const dataRows = Array.isArray(source.dataRows)
    ? source.dataRows
    : Array.isArray(source.data_rows)
      ? source.data_rows
      : [];
  const runs = (Array.isArray(source.runs) ? source.runs : [])
    .map((run) => normalizeEvaluationRun(run))
    .filter((run) => run.id || run.label);
  const selectedRun = normalizeEvaluationRun(source.selectedRun || source.selected_run || {});
  const selectedRunId = normalizeString(source.fineTuningRunId || source.fine_tuning_run_id || source.selectedRunId || source.selected_run_id || selectedRun.id);
  return {
    id: normalizeString(source.id || source.evaluationSetId || source.evaluation_set_id) || "evaluation_" + (fallbackIndex + 1),
    name: normalizeString(source.name || source.title || "Evaluation " + (fallbackIndex + 1)),
    description: String(source.description || ""),
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || ""),
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
    dataRows,
    runs,
    selectedRunId,
    selectedRun: selectedRun.id ? selectedRun : null,
    activeVersionId: normalizeString(source.activeVersionId || source.active_version_id || source.evaluationVersionId || source.evaluation_version_id),
    activeVersionNumber: Math.max(0, Number(source.activeVersionNumber || source.active_version_number || source.evaluationVersionNumber || source.evaluation_version_number || 0) || 0),
    activeVersionLabel: normalizeString(source.activeVersionLabel || source.active_version_label || source.evaluationVersionLabel || source.evaluation_version_label),
    environmentType: normalizeString(source.environmentType || source.environment_type),
    environmentId: normalizeString(source.environmentId || source.environment_id),
    environmentName: normalizeString(source.environmentName || source.environment_name),
    projectId: normalizeString(source.projectId || source.project_id),
    projectName: normalizeString(source.projectName || source.project_name),
    evaluator: readPlainObject(source.evaluator),
    passThreshold: source.passThreshold ?? source.pass_threshold,
  };
}

function getLatestEvaluationRun(set) {
  const runs = Array.isArray(set?.runs) ? set.runs : [];
  return runs.slice().sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || 0) || 0;
    const rightTime = Date.parse(right.createdAt || 0) || 0;
    return rightTime - leftTime;
  })[0] || null;
}

function getFineTuningBaselineRun(set) {
  const selectedRunId = normalizeString(set?.selectedRunId || set?.fineTuningRunId || set?.fine_tuning_run_id);
  const runs = Array.isArray(set?.runs) ? set.runs : [];
  return (selectedRunId ? runs.find((run) => normalizeString(run?.id || run?.runId || run?.run_id) === selectedRunId) : null)
    || (set?.selectedRun && set.selectedRun.id ? set.selectedRun : null)
    || getLatestEvaluationRun(set);
}

function calculateAverageScore(sets) {
  const scores = (Array.isArray(sets) ? sets : [])
    .map((set) => getFineTuningBaselineRun(set)?.averageScore)
    .filter((score) => Number.isFinite(Number(score)));
  if (!scores.length) return 0;
  return clampScore(scores.reduce((sum, score) => sum + Number(score || 0), 0) / scores.length);
}

function normalizeAgent(rawAgent = {}) {
  const source = rawAgent && typeof rawAgent === "object" && !Array.isArray(rawAgent) ? rawAgent : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
    ? source.metadata
    : {};
  return {
    ...source,
    id: normalizeString(source.id || source.agentId || source.agent_id),
    name: normalizeString(source.name || source.label || source.title || "Agent"),
    model: normalizeString(source.model || source.modelId || source.model_id || metadata.model || ""),
    instructions: String(source.instructions || source.systemPrompt || source.system_prompt || metadata.instructions || ""),
    description: String(source.description || metadata.description || ""),
    photoUrl: normalizeString(source.photoUrl || source.photoURL || source.avatarUrl || source.avatarURL || metadata.photoUrl || metadata.photoURL),
    isDefault: source.isDefault === true || source.is_default === true || metadata.isDefault === true || metadata.is_default === true,
    isSystem: source.isSystem === true || source.is_system === true || metadata.isSystem === true || metadata.is_system === true,
    agentType: normalizeString(source.agentType || source.agent_type || metadata.agentType || metadata.agent_type || ""),
    metadata,
  };
}

function normalizeEnvironment(rawEnvironment = {}) {
  const source = rawEnvironment && typeof rawEnvironment === "object" && !Array.isArray(rawEnvironment) ? rawEnvironment : {};
  return {
    ...source,
    id: normalizeString(source.id || source.environmentId || source.environment_id || source.computerId || source.computer_id),
    name: normalizeString(source.name || source.label || source.title || "Computer"),
  };
}

function isProtectedFineTuningTargetAgent(agent) {
  const normalizedId = normalizeString(agent?.id || agent?.agentId || agent?.agent_id).toLowerCase();
  const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
  return Boolean(
    agent?.isDefault === true
    || agent?.is_default === true
    || agent?.isSystem === true
    || agent?.is_system === true
    || metadata.isDefault === true
    || metadata.is_default === true
    || metadata.isSystem === true
    || metadata.is_system === true
    || normalizedId === "agent_assistant"
    || normalizedId === "agent_default"
    || normalizedId === "agent_research"
    || normalizedId.startsWith("agent-default-")
  );
}

function resolveFineTuningTargetFromEvaluationSets(evaluationSets) {
  const targets = [];
  for (const set of Array.isArray(evaluationSets) ? evaluationSets : []) {
    const baselineRun = getFineTuningBaselineRun(set);
    const id = normalizeString(baselineRun?.targetAgentId || baselineRun?.target_agent_id || set?.targetAgentId || set?.target_agent_id);
    if (!id) continue;
    targets.push({
      id,
      name: normalizeString(baselineRun?.targetAgentName || baselineRun?.target_agent_name || set?.targetAgentName || set?.target_agent_name),
      photoUrl: normalizeString(baselineRun?.targetAgentPhotoUrl || baselineRun?.target_agent_photo_url || set?.targetAgentPhotoUrl || set?.target_agent_photo_url),
      versionId: normalizeString(baselineRun?.targetAgentVersionId || baselineRun?.target_agent_version_id),
      versionNumber: Math.max(0, Number(baselineRun?.targetAgentVersionNumber || baselineRun?.target_agent_version_number || 0) || 0),
      versionLabel: normalizeString(baselineRun?.targetAgentVersionLabel || baselineRun?.target_agent_version_label),
      evaluationSetId: set?.id || "",
      evaluationSetName: set?.name || "",
      runId: baselineRun?.id || "",
      runLabel: baselineRun?.label || "",
    });
  }
  const uniqueIds = Array.from(new Set(targets.map((target) => target.id).filter(Boolean)));
  if (uniqueIds.length > 1) {
    return {
      error: "Selected evaluation runs target different agents. Select runs for one target agent before starting fine-tuning.",
      targets,
    };
  }
  return {
    target: targets[0] || null,
    targets,
  };
}

function buildFineTuningPrompt({ targetAgent, fineTunerAgent, environment, evaluationSets, instructions, verifyAfter, jobId, nextVersionNumber }) {
  const caseCount = evaluationSets.reduce((sum, set) => sum + (Array.isArray(set.dataRows) ? set.dataRows.length : 0), 0);
  const evaluationSummary = evaluationSets.map((set, index) => {
    const latestRun = getFineTuningBaselineRun(set);
    const rows = (Array.isArray(set.dataRows) ? set.dataRows : []).slice(0, 8).map((row, rowIndex) => ({
      index: rowIndex + 1,
      input: String(row?.input || "").slice(0, 1200),
      expectedOutput: String(row?.expectedOutput || row?.expected_output || "").slice(0, 1200),
      evaluationGuidance: String(row?.evaluationGuidance || row?.evaluation_guidance || "").slice(0, 800),
      runCount: Number(row?.runCount || row?.run_count || 1) || 1,
    }));
    return {
      index: index + 1,
      id: set.id,
      name: set.name,
      activeVersionId: set.activeVersionId,
      activeVersionNumber: set.activeVersionNumber,
      latestRun,
      caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
      sampleCases: rows,
    };
  });
  return [
    "You are running a fine-tuning analysis job for an AI agent platform.",
    "Your job is to create and publish a safer, higher-performing version of the target agent from the selected evaluation evidence.",
    "This is an execution task, not a recommendation task. The user approved this exact publish action by starting the fine-tune job.",
    "Do not ask whether to continue, do not browse unrelated platform state, and do not stop after an analysis plan.",
    "Focus on concrete instruction changes, missing constraints, failure modes, and evaluation-driven improvements.",
    "Immutable target-agent identity: keep the target agent name exactly \"" + (targetAgent.name || "Agent") + "\". Do not rename the agent, change its avatar, owner, model, skills, guardrails, team access, or other configuration. Only improve the instructions.",
    "",
    "Required execution path:",
    "1. Adapt the target agent instructions directly from the evidence below.",
    "2. Write the complete improved target-agent instructions to /tmp/fine-tuned-agent-instructions.md.",
    "3. Run exactly this publish command:",
    "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py fine-tuning publish-agent-version --target-agent-id " + targetAgent.id + " --instructions-file /tmp/fine-tuned-agent-instructions.md --job-id " + (jobId || "fine_tune_job") + " --label \"Fine-Tuned Version\" --description \"Generated by fine-tuning job " + (jobId || "") + "\"",
    "4. If the command succeeds, return a concise summary of the evidence, the exact instruction changes, and the published version id.",
    "5. If the command fails, return the exact command error. Do not switch to curl or hand-written API calls.",
    "",
    "Do not run agents list, threads list, evaluations list, versions list, or generic API discovery unless the required publish command fails because a required ID is invalid. All required IDs and evaluation evidence are included here.",
    "",
    "Target agent:",
    JSON.stringify({
      id: targetAgent.id,
      name: targetAgent.name,
      immutableName: targetAgent.name,
      model: targetAgent.model,
      description: targetAgent.description,
      instructions: targetAgent.instructions,
      nextVersionNumber,
    }, null, 2),
    "",
    "Fine-tuner agent executing this job:",
    JSON.stringify({
      id: fineTunerAgent.id,
      name: fineTunerAgent.name,
      model: fineTunerAgent.model,
    }, null, 2),
    "",
    "Execution computer:",
    JSON.stringify({ id: environment.id, name: environment.name }, null, 2),
    "",
    "User focus:",
    instructions ? instructions : "No extra focus supplied.",
    "",
    "Evaluation data:",
    JSON.stringify({
      evaluationSetCount: evaluationSets.length,
      caseCount,
      verifyAfter: Boolean(verifyAfter),
      evaluationSets: evaluationSummary,
    }, null, 2),
    "",
    "Return the final fine-tuning summary only after the version creation command has succeeded or failed with a concrete error."
  ].join("\n");
}

function decodeMaybeEscapedText(value) {
  let text = String(value || "");
  const escapedNewlineCount = (text.match(/\\n/g) || []).length;
  if (escapedNewlineCount >= 2) {
    text = text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, "\"");
  }
  return text;
}

function sanitizeFineTuningAnalysisText(value) {
  let text = decodeMaybeEscapedText(value)
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  if (!text) return "";

  const rawPayloadIndex = text.search(/(?:^|\s)(?:data|event):\s*\{/);
  if (rawPayloadIndex > 0) {
    text = text.slice(0, rawPayloadIndex).trim();
  }
  text = text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^(event|id|retry):\s*/i.test(trimmed)) return false;
      if (/^data:\s*(?:\{|\[|\"type\")/i.test(trimmed)) return false;
      if (/^\{\"\s*type\"\s*:/.test(trimmed)) return false;
      if (/^\{\"type\":/.test(trimmed)) return false;
      return true;
    })
    .join("\n")
    .trim();
  return text.length > 2400 ? text.slice(0, 2400).trimEnd() + "\n\n..." : text;
}

function extractStringFromPayloadValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(extractStringFromPayloadValue).filter(Boolean).join("");
  }
  if (value && typeof value === "object") {
    return extractTextFromStreamPayload(value);
  }
  return "";
}

function extractTextFromStreamPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";
  const direct = [
    payload.output_text,
    payload.outputText,
    payload.summary,
    payload.text,
    payload.delta,
    payload.content,
    payload.message?.content,
    payload.choices?.[0]?.delta?.content,
    payload.choices?.[0]?.message?.content,
  ].map(extractStringFromPayloadValue).find((value) => String(value || "").trim());
  if (direct) return direct;
  const responseOutputText = extractStringFromPayloadValue(payload.response?.output_text || payload.response?.outputText);
  if (responseOutputText) return responseOutputText;
  const output = payload.response?.output || payload.output || payload.data?.output;
  if (Array.isArray(output)) {
    const value = output.map((item) => {
      if (!item || typeof item !== "object") return "";
      return extractStringFromPayloadValue(item.content || item.text || item.output_text || item.outputText || item);
    }).filter(Boolean).join("");
    if (value) return value;
  }
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return extractTextFromStreamPayload(payload.data);
  }
  return "";
}

function extractStreamSummary(streamText) {
  const text = String(streamText || "");
  if (!text.trim()) return "";
  const deltaCandidates = [];
  const fullCandidates = [];
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "[DONE]") return;
    if (/^(event|id|retry):\s*/i.test(trimmed)) return;
    const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
    if (!payload || payload === "[DONE]") return;
    try {
      const parsed = JSON.parse(payload);
      const value = sanitizeFineTuningAnalysisText(extractTextFromStreamPayload(parsed));
      if (!value) return;
      const type = String(parsed.type || parsed.event || "").toLowerCase();
      if (type.includes("completed") || type.includes("message") || parsed.response || parsed.output) {
        fullCandidates.push(value);
      } else {
        deltaCandidates.push(value);
      }
    } catch {
      if (!payload.startsWith("{") && !payload.startsWith("[") && !/^data:/i.test(payload)) {
        deltaCandidates.push(payload);
      }
    }
  });
  const bestFull = fullCandidates
    .sort((left, right) => right.length - left.length)[0];
  const summary = bestFull || deltaCandidates.join("");
  return sanitizeFineTuningAnalysisText(summary || text);
}

function buildProposedInstructions(agent, evaluationSets, instructions, analysis) {
  const baseInstructions = String(agent.instructions || "").trim() || "You are " + agent.name + ". Complete the user's task carefully and accurately.";
  const focus = normalizeString(instructions);
  const setNames = evaluationSets.map((set) => set.name).filter(Boolean).join(", ");
  const improvementNotes = [
    "",
    "Fine-tuning notes:",
    "- Optimize behavior against: " + (setNames || "the selected evaluation sets") + ".",
    "- Prefer explicit reasoning about expected outputs before finalizing the response.",
    "- When evaluation guidance is present, treat it as a hard scoring rubric.",
    "- Keep answers concise unless the task requires structured detail.",
    focus ? "- User focus: " + focus : "",
    analysis ? "- Analysis summary: " + analysis.replace(/\s+/g, " ").slice(0, 900) : "",
  ].filter(Boolean).join("\n");
  return baseInstructions + "\n" + improvementNotes;
}

function preserveFineTuningAgentName(agent, snapshot = {}) {
  const source = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? snapshot : {};
  return {
    ...source,
    name: normalizeString(agent?.name || source.name || "Agent") || "Agent",
  };
}

function buildAgentSnapshot(agent, instructions) {
  return preserveFineTuningAgentName(agent, {
    name: agent.name,
    description: agent.description,
    model: agent.model,
    instructions,
    enabledSkills: Array.isArray(agent.enabledSkills) ? agent.enabledSkills : [],
    guardrails: Array.isArray(agent.guardrails) ? agent.guardrails : Array.isArray(agent.metadata?.guardrails) ? agent.metadata.guardrails : [],
    metadata: {
      ...(agent.metadata || {}),
    },
  });
}

function buildFineTuningDiffFilesFromSnapshots(beforeSnapshot, afterSnapshot) {
  return [
    {
      id: "instructions",
      filePath: "agent/instructions.md",
      beforeContent: beforeSnapshot.instructions || "",
      afterContent: afterSnapshot.instructions || "",
    },
    {
      id: "configuration",
      filePath: "agent/configuration.json",
      beforeContent: JSON.stringify({
        name: beforeSnapshot.name,
        model: beforeSnapshot.model,
        enabledSkills: beforeSnapshot.enabledSkills,
        guardrails: beforeSnapshot.guardrails,
      }, null, 2) + "\n",
      afterContent: JSON.stringify({
        name: afterSnapshot.name,
        model: afterSnapshot.model,
        enabledSkills: afterSnapshot.enabledSkills,
        guardrails: afterSnapshot.guardrails,
      }, null, 2) + "\n",
    },
  ];
}

function buildFineTuningDiffFiles(agent, proposedInstructions) {
  return buildFineTuningDiffFilesFromSnapshots(
    buildAgentSnapshot(agent, String(agent.instructions || "")),
    buildAgentSnapshot(agent, proposedInstructions)
  );
}

function buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore) {
  return evaluationSets.map((set, index) => {
    const beforeRun = getFineTuningBaselineRun(set);
    const beforeScore = clampScore(beforeRun?.averageScore || 0);
    return {
      evaluationSetId: set.id,
      evaluationSetName: set.name,
      beforeRunId: beforeRun?.id || "",
      beforeRunLabel: beforeRun?.label || "",
      beforeScore,
      beforeCostUsd: normalizeUsdCost(beforeRun?.costUsd || beforeRun?.cost_usd) || computeTokensToUsd(beforeRun?.costTokens || beforeRun?.cost_tokens),
      afterRunId: "",
      afterRunLabel: "",
      afterScore: 0,
      afterCostUsd: 0,
      status: verifyAfter ? "pending" : "not_run",
    };
  });
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

function extractAgentVersionRecord(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.version, source.agentVersion, source.agent_version, source.data?.version, source.data?.agentVersion, source.data, source.item, source.record, source];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const id = normalizeString(candidate.id || candidate.versionId || candidate.version_id);
      if (id) return { ...candidate, id };
    }
  }
  return null;
}

function extractAgentVersionRecords(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.versions, source.agentVersions, source.agent_versions, source.data?.versions, source.data?.agentVersions, source.data?.agent_versions, source.data, payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map((version) => extractAgentVersionRecord(version))
        .filter(Boolean);
    }
  }
  return [];
}

function findFineTuningVersionInList(versions, fineTuningJobId) {
  const normalizedJobId = normalizeString(fineTuningJobId);
  if (!normalizedJobId) return null;
  for (const version of Array.isArray(versions) ? versions : []) {
    const metadata = version?.metadata && typeof version.metadata === "object" && !Array.isArray(version.metadata)
      ? version.metadata
      : {};
    if (
      normalizeString(version?.fineTuningJobId || version?.fine_tuning_job_id) === normalizedJobId
      || normalizeString(metadata.fineTuningJobId || metadata.fine_tuning_job_id) === normalizedJobId
    ) {
      return version;
    }
  }
  return null;
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

export function createPlaygroundFineTuningRuntime(deps = {}) {
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
  const jobsById = new Map();
  const deletedJobIds = new Set();

  function pruneJobs() {
    const now = Date.now();
    for (const [jobId, record] of jobsById.entries()) {
      if (now - Number(record.updatedAtMs || 0) > FINE_TUNING_JOB_TTL_MS) {
        jobsById.delete(jobId);
      }
    }
  }

  function storeJob(job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    deletedJobIds.delete(compactJob.id);
    jobsById.set(compactJob.id, {
      job: compactJob,
      updatedAtMs: Date.now(),
    });
    return compactJob;
  }

  async function requestBackendJson(record, path, init = {}, fallbackMessage = "Backend request failed.") {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const method = init.method || "GET";
    const headers = init.headers || {};
    if (apiKey) {
      const response = await fetch(`${upstreamUrl}${path}`, {
        method,
        headers: withProxyOrganizationHeader(requestContext, body, {
          "X-API-Key": apiKey,
          ...headers,
        }),
        body: init.body,
      });
      return await readJsonResponse(response, fallbackMessage);
    }
    if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      const response = cloudFetch
        ? await cloudFetch(requestContext, path, {
            method,
            headers,
            body: init.body,
          })
        : await fetchAiosApi(requestContext, `/api${path}`, {
            method,
            headers,
            body: init.body,
          });
      return await readJsonResponse(response, fallbackMessage);
    }
    throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
  }

  async function fetchBackendJson(record, path) {
    return await requestBackendJson(record, path, { method: "GET" }, "Failed to load backend resource.");
  }

  async function requestPlatformRuntimeJson(record, path, init = {}, fallbackMessage = "Platform runtime request failed.") {
    const requestContext = record?.requestContext;
    const host = normalizeString(requestContext?.headers?.host);
    if (!host) {
      throw createRuntimeError("Platform runtime host is unavailable.", 502);
    }
    const forwardedProto = normalizeString(requestContext?.headers?.["x-forwarded-proto"]).split(",")[0].trim();
    const protocol = forwardedProto || (host.includes("localhost") || host.startsWith("127.") ? "http" : "https");
    const headers = {
      ...(requestContext?.headers?.cookie ? { cookie: requestContext.headers.cookie } : {}),
      ...(requestContext?.headers?.authorization ? { authorization: requestContext.headers.authorization } : {}),
      ...(record?.apiKey ? { "X-API-Key": record.apiKey } : {}),
      ...(requestContext?.headers?.["x-active-organization-id"] ? { "x-active-organization-id": requestContext.headers["x-active-organization-id"] } : {}),
      ...(requestContext?.headers?.["x-organization-id"] ? { "x-organization-id": requestContext.headers["x-organization-id"] } : {}),
      ...(init.headers || {}),
    };
    const response = await fetch(`${protocol}://${host}${path}`, {
      method: init.method || "GET",
      headers,
      body: init.body,
    });
    return await readJsonResponse(response, fallbackMessage);
  }

  function extractFineTuningJobRecords(payload) {
    return normalizeResponseArray(payload, ["jobs", "fineTuningJobs", "fine_tuning_jobs"])
      .map((job) => compactFineTuningJobRecord(job))
      .filter((job) => job.id);
  }

  function extractFineTuningJobRecord(payload) {
    const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    const candidates = [
      source.job,
      source.fineTuningJob,
      source.fine_tuning_job,
      source.data?.job,
      source.data?.fineTuningJob,
      source.data?.fine_tuning_job,
      source.data,
      source.item,
      source.record,
      source,
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        const compactJob = compactFineTuningJobRecord(candidate);
        if (compactJob.id) return compactJob;
      }
    }
    return null;
  }

  async function fetchBackendFineTuningJobs(record, search = "") {
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs${search || ""}`,
      { method: "GET" },
      "Failed to load fine-tuning jobs."
    );
    return extractFineTuningJobRecords(data);
  }

  async function fetchBackendFineTuningJob(record, jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}`,
      { method: "GET" },
      "Failed to load fine-tuning job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function createBackendFineTuningJob(record, job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    const data = await requestBackendJson(
      record,
      "/fine-tuning/jobs",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(compactJob),
      },
      "Failed to create fine-tuning job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function updateBackendFineTuningJob(record, job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(compactJob.id)}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ job: compactJob }),
      },
      "Failed to update fine-tuning job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function persistBackendFineTuningJob(record, job) {
    const compactJob = compactFineTuningJobRecord(job);
    if (!compactJob.id) return null;
    try {
      return await updateBackendFineTuningJob(record, compactJob);
    } catch (error) {
      if (Number(error?.status || 0) !== 404) throw error;
      return await createBackendFineTuningJob(record, compactJob);
    }
  }

  async function cancelBackendFineTuningJob(record, jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    const data = await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}/cancel`,
      { method: "POST" },
      "Failed to cancel fine-tuning job."
    );
    return extractFineTuningJobRecord(data);
  }

  async function deleteBackendFineTuningJob(record, jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return null;
    return await requestBackendJson(
      record,
      `/fine-tuning/jobs/${encodeURIComponent(normalizedJobId)}`,
      { method: "DELETE" },
      "Failed to delete fine-tuning job."
    );
  }

  async function fetchFineTuningAgentList(record) {
    const data = await fetchBackendJson(record, "/agents").catch(() => ({}));
    return normalizeResponseArray(data, ["agents"])
      .map((agent) => normalizeAgent(agent))
      .filter((agent) => agent.id);
  }

  function buildFineTuningJobFromAgentVersion(agent, version, fallbackIndex = 0) {
    const metadata = readPlainObject(version?.metadata);
    const fineTuningJobId = normalizeString(version?.fineTuningJobId || version?.fine_tuning_job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
    if (!fineTuningJobId) return null;
    const createdAt = normalizeString(metadata.fineTuningCreatedAt || metadata.fine_tuning_created_at || version?.createdAt || version?.created_at || version?.publishedAt || version?.published_at || new Date().toISOString());
    const updatedAt = normalizeString(metadata.fineTuningUpdatedAt || metadata.fine_tuning_updated_at || version?.updatedAt || version?.updated_at || version?.publishedAt || version?.published_at || createdAt);
    const evaluationSetIds = Array.isArray(metadata.evaluationSetIds)
      ? metadata.evaluationSetIds
      : Array.isArray(metadata.evaluation_set_ids)
        ? metadata.evaluation_set_ids
        : [];
    return compactFineTuningJobRecord({
      id: fineTuningJobId,
      name: normalizeString(metadata.fineTuningJobName || metadata.fine_tuning_job_name || version?.label) || "Fine-Tune Job " + (fallbackIndex + 1),
      status: normalizeString(metadata.fineTuningStatus || metadata.fine_tuning_status || version?.status || "completed") || "completed",
      createdAt,
      updatedAt,
      agentId: normalizeString(metadata.targetAgentId || metadata.target_agent_id || agent?.id),
      targetAgentId: normalizeString(metadata.targetAgentId || metadata.target_agent_id || agent?.id),
      agentName: normalizeString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || "Agent"),
      targetAgentName: normalizeString(metadata.targetAgentName || metadata.target_agent_name || agent?.name || "Agent"),
      agentPhotoUrl: normalizeString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl),
      targetAgentPhotoUrl: normalizeString(metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url || agent?.photoUrl),
      conductedBy: metadata.conductedBy || metadata.conducted_by || {},
      createdBy: metadata.createdBy || metadata.created_by || metadata.conductedBy || metadata.conducted_by || {},
      fineTunerAgentId: normalizeString(metadata.fineTunerAgentId || metadata.fine_tuner_agent_id),
      fineTunerAgentName: normalizeString(metadata.fineTunerAgentName || metadata.fine_tuner_agent_name),
      fineTunerAgentPhotoUrl: normalizeString(metadata.fineTunerAgentPhotoUrl || metadata.fine_tuner_agent_photo_url),
      environmentId: normalizeString(metadata.environmentId || metadata.environment_id),
      environmentName: normalizeString(metadata.environmentName || metadata.environment_name || "Computer"),
      evaluationSets: evaluationSetIds.map((setId, index) => ({
        id: normalizeString(setId),
        name: "Evaluation " + (index + 1),
      })).filter((set) => set.id),
      threadId: normalizeString(metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
      threadTitle: normalizeString(metadata.threadTitle || metadata.thread_title || "Fine-Tuning Thread"),
      beforeScore: metadata.beforeScore ?? metadata.before_score ?? 0,
      afterScore: metadata.afterScore ?? metadata.after_score ?? 0,
      improvementScore: metadata.improvementScore ?? metadata.improvement_score ?? 0,
      costUsd: metadata.totalCostUsd ?? metadata.total_cost_usd ?? metadata.costUsd ?? metadata.cost_usd ?? 0,
      fineTuningCostUsd: metadata.fineTuningCostUsd ?? metadata.fine_tuning_cost_usd ?? 0,
      verificationCostUsd: metadata.verificationCostUsd ?? metadata.verification_cost_usd ?? 0,
      analysisSummary: metadata.analysisSummary || metadata.analysis_summary || "",
      evaluationRuns: Array.isArray(metadata.evaluationRuns) ? metadata.evaluationRuns : Array.isArray(metadata.evaluation_runs) ? metadata.evaluation_runs : [],
      createdAgentVersion: version,
      createdAgentVersionId: normalizeString(version?.id || version?.versionId || version?.version_id),
      agentVersionCreationStatus: normalizeString(version?.status || "published") || "published",
      metadata,
    });
  }

  async function recoverFineTuningJobsFromAgentVersions(record) {
    const agents = await fetchFineTuningAgentList(record);
    return agents.flatMap((agent, agentIndex) => {
      const versions = Array.isArray(agent.agentVersions)
        ? agent.agentVersions
        : Array.isArray(agent.agent_versions)
          ? agent.agent_versions
          : Array.isArray(agent.versions)
            ? agent.versions
            : Array.isArray(agent.metadata?.agentVersions)
              ? agent.metadata.agentVersions
              : Array.isArray(agent.metadata?.versions)
                ? agent.metadata.versions
                : [];
      return extractAgentVersionRecords({ versions })
        .map((version, versionIndex) => buildFineTuningJobFromAgentVersion(agent, version, agentIndex + versionIndex))
        .filter(Boolean);
    });
  }

  function mergeFineTuningJobLists(...jobLists) {
    const byId = new Map();
    jobLists.flatMap((jobs) => Array.isArray(jobs) ? jobs : []).forEach((job) => {
      const compactJob = compactFineTuningJobRecord(job);
      if (!compactJob.id) return;
      const existingJob = byId.get(compactJob.id);
      byId.set(compactJob.id, existingJob ? mergeFineTuningJobRecords(existingJob, compactJob) : compactJob);
    });
    return Array.from(byId.values()).sort((left, right) => (Date.parse(right.updatedAt || right.createdAt || 0) || 0) - (Date.parse(left.updatedAt || left.createdAt || 0) || 0));
  }

  function filterFineTuningJobs(jobs, url) {
    const search = url?.searchParams || new URLSearchParams();
    const agentId = normalizeString(search.get("agentId") || search.get("targetAgentId"));
    const evaluationSetId = normalizeString(search.get("evaluationSetId"));
    const status = normalizeString(search.get("status")).toLowerCase();
    const query = normalizeString(search.get("q")).toLowerCase();
    const offset = Math.max(0, Number(search.get("offset") || 0) || 0);
    const limit = Math.max(0, Number(search.get("limit") || 0) || 0);
    const filtered = (Array.isArray(jobs) ? jobs : []).filter((job) => {
      if (agentId && job.agentId !== agentId && job.targetAgentId !== agentId) return false;
      if (evaluationSetId && !((Array.isArray(job.evaluationSets) ? job.evaluationSets : []).some((set) => set.id === evaluationSetId))) return false;
      if (status && normalizeString(job.status).toLowerCase() !== status) return false;
      if (query) {
        const haystack = [
          job.name,
          job.agentName,
          job.targetAgentName,
          job.fineTunerAgentName,
          job.environmentName,
          job.threadId,
        ].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    return limit > 0 ? filtered.slice(offset, offset + limit) : filtered.slice(offset);
  }

  async function fetchFineTuningThreadCosts(record, threadId) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) return { costTokens: 0, costUsd: 0 };
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
    return extractThreadCosts([thread, ...steps, ...logs, ...messages].filter(Boolean));
  }

  async function fetchFineTuningThreadSummary(record, threadId) {
    const normalizedThreadId = normalizeString(threadId);
    if (!normalizedThreadId) return "";
    const encodedThreadId = encodeURIComponent(normalizedThreadId);
    const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
      fetchBackendJson(record, `/threads/${encodedThreadId}`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/steps?limit=180&compact=1`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=180`),
      fetchBackendJson(record, `/threads/${encodedThreadId}/messages?limit=160&compact=1`),
    ]);
    const thread = threadResult.status === "fulfilled" ? (threadResult.value?.thread || threadResult.value?.data || threadResult.value) : null;
    const steps = stepsResult.status === "fulfilled" ? normalizeResponseArray(stepsResult.value, ["steps"]) : [];
    const logs = logsResult.status === "fulfilled" ? normalizeResponseArray(logsResult.value, ["logs"]) : [];
    const messages = messagesResult.status === "fulfilled" ? normalizeResponseArray(messagesResult.value, ["messages"]) : [];
    return extractFineTuningThreadSummaryFromRecords([thread, ...steps, ...logs, ...messages].filter(Boolean));
  }

  async function fetchFineTuningAgentVersions(record, agentId) {
    const normalizedAgentId = normalizeString(agentId);
    if (!normalizedAgentId) return [];
    const data = await fetchBackendJson(record, `/agents/${encodeURIComponent(normalizedAgentId)}/versions`);
    return extractAgentVersionRecords(data);
  }

  function getFineTuningVersionNumber(version) {
    return Math.max(0, Number(version?.version || version?.versionNumber || version?.version_number || 0) || 0);
  }

  function buildFineTuningDiffFilesFromVersion(version, versions = []) {
    const metadata = readPlainObject(version?.metadata);
    const beforeSnapshot = readFirstPlainObject(
      metadata.beforeAgentSnapshot,
      metadata.before_agent_snapshot,
      metadata.beforeSnapshot,
      metadata.before_snapshot,
      metadata.baseAgentSnapshot,
      metadata.base_agent_snapshot
    );
    let resolvedBeforeSnapshot = beforeSnapshot;
    if (!hasPlainObjectContent(resolvedBeforeSnapshot)) {
      const currentVersionNumber = getFineTuningVersionNumber(version);
      const previousVersion = (Array.isArray(versions) ? versions : [])
        .filter((candidate) => normalizeString(candidate?.id || candidate?.versionId || candidate?.version_id) !== normalizeString(version?.id || version?.versionId || version?.version_id))
        .filter((candidate) => getFineTuningVersionNumber(candidate) > 0 && (!currentVersionNumber || getFineTuningVersionNumber(candidate) < currentVersionNumber))
        .sort((left, right) => getFineTuningVersionNumber(right) - getFineTuningVersionNumber(left))[0];
      resolvedBeforeSnapshot = readPlainObject(previousVersion?.snapshot);
    }
    const afterSnapshot = readFirstPlainObject(
      version?.snapshot,
      metadata.afterAgentSnapshot,
      metadata.after_agent_snapshot,
      metadata.afterSnapshot,
      metadata.after_snapshot
    );
    if (!hasPlainObjectContent(resolvedBeforeSnapshot) || !hasPlainObjectContent(afterSnapshot)) return [];
    return buildFineTuningDiffFilesFromSnapshots(resolvedBeforeSnapshot, afterSnapshot);
  }

  async function hydrateFineTuningJobDetails(record, job) {
    const normalizedJob = compactFineTuningJobRecord(job);
    if (!normalizedJob.id) return normalizedJob;
    let hydratedJob = normalizedJob;
    const versions = await fetchFineTuningAgentVersions(record, normalizedJob.agentId || normalizedJob.targetAgentId).catch(() => []);
    const version = findFineTuningVersionInList(versions, normalizedJob.id);
    if (version?.id) {
      const diffFiles = hydratedJob.diffFiles.length ? hydratedJob.diffFiles : buildFineTuningDiffFilesFromVersion(version, versions);
      hydratedJob = mergeFineTuningJobRecords(hydratedJob, {
        createdAgentVersion: version,
        createdAgentVersionId: version.id,
        agentVersionCreationStatus: normalizeString(version.status || hydratedJob.agentVersionCreationStatus || "published"),
        diffFiles,
      });
    }
    if (!hydratedJob.analysisSummary && hydratedJob.threadId) {
      const analysisSummary = await fetchFineTuningThreadSummary(record, hydratedJob.threadId).catch(() => "");
      if (analysisSummary) {
        hydratedJob = mergeFineTuningJobRecords(hydratedJob, { analysisSummary });
      }
    }
    return hydratedJob;
  }

  async function createHiddenThread(record, { title, agentId, environmentId, metadata }) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = {
      title,
      appId: "runner-web-sdk-demo",
      agentId,
      environmentId,
      hidden: true,
      sidebarHidden: true,
      enabledSkills: {
        computerAgents: true,
      },
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
    const data = await readJsonResponse(response, "Failed to create fine-tuning thread.");
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

  async function runThreadMessage(record, threadId, content) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = {
      content,
      task: content,
      enabledSkills: {
        computerAgents: true,
      },
    };
    let response;
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
      await readJsonResponse(response, "Failed to start fine-tuning thread.");
    }
    const text = await response.text().catch(() => "");
    return extractStreamSummary(text);
  }

  async function findExistingAgentVersionForFineTuning(record, agent, fineTuningJobId) {
    const normalizedJobId = normalizeString(fineTuningJobId);
    if (!agent?.id || !normalizedJobId) return null;
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "GET",
            headers: { "content-type": "application/json" },
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "GET",
            headers: { "content-type": "application/json" },
          });
    } else {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    const data = await response.json().catch(() => ({}));
    return findFineTuningVersionInList(extractAgentVersionRecords(data), normalizedJobId);
  }

  async function createAgentVersion(record, agent, versionDraft) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const fineTuningJobId = normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id);
    const existingVersion = await findExistingAgentVersionForFineTuning(record, agent, fineTuningJobId).catch(() => null);
    if (existingVersion?.id) {
      return existingVersion;
    }
    const snapshot = preserveFineTuningAgentName(agent, versionDraft?.snapshot);
    const payload = {
      label: normalizeString(versionDraft?.label || "Fine-Tuned Version"),
      description: normalizeString(versionDraft?.description || ""),
      status: "published",
      source: "fine_tuning",
      fineTuningJobId: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
      snapshot,
      agent: {
        id: agent.id,
        agentId: agent.id,
        name: normalizeString(agent.name || snapshot.name || "Agent") || "Agent",
        description: snapshot.description || agent.description || "",
        model: snapshot.model || agent.model || "",
        instructions: snapshot.instructions || "",
        enabledSkills: Array.isArray(snapshot.enabledSkills) ? snapshot.enabledSkills : [],
        guardrailSetIds: Array.isArray(snapshot.guardrailSetIds) ? snapshot.guardrailSetIds : [],
        guardrails: Array.isArray(snapshot.guardrails) ? snapshot.guardrails : [],
        promptAdaptations: Array.isArray(snapshot.promptAdaptations) ? snapshot.promptAdaptations : [],
        invisiblePromptAdaptations: Array.isArray(snapshot.invisiblePromptAdaptations) ? snapshot.invisiblePromptAdaptations : [],
        metadata: snapshot.metadata || {},
      },
      metadata: {
        ...(versionDraft?.metadata && typeof versionDraft.metadata === "object" && !Array.isArray(versionDraft.metadata) ? versionDraft.metadata : {}),
        fineTuningJobId: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
        fine_tuning_job_id: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
      },
    };
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions`, {
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
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create fine-tuned agent version.");
    const version = extractAgentVersionRecord(data);
    if (!version?.id) {
      throw createRuntimeError("Agent version creation succeeded but no version id was returned.", 502);
    }
    return version;
  }

  async function publishAgentVersion(record, agent, version, snapshot) {
    const versionId = normalizeString(version?.id || version?.versionId || version?.version_id);
    if (!agent?.id || !versionId) {
      throw createRuntimeError("Agent version publish failed because no version id was returned.", 502);
    }
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const safeSnapshot = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
      ? preserveFineTuningAgentName(agent, snapshot)
      : null;
    const payload = safeSnapshot
      ? { snapshot: safeSnapshot }
      : {};
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
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
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to publish fine-tuned agent version.");
    const publishedVersion = extractAgentVersionRecord(data);
    return {
      ...(version && typeof version === "object" && !Array.isArray(version) ? version : {}),
      ...(publishedVersion || {}),
      id: publishedVersion?.id || versionId,
      status: normalizeString(publishedVersion?.status || "published") || "published",
      snapshot: preserveFineTuningAgentName(agent, publishedVersion?.snapshot || version?.snapshot || safeSnapshot || {}),
      metadata: {
        ...(version?.metadata && typeof version.metadata === "object" && !Array.isArray(version.metadata) ? version.metadata : {}),
        ...(publishedVersion?.metadata && typeof publishedVersion.metadata === "object" && !Array.isArray(publishedVersion.metadata) ? publishedVersion.metadata : {}),
      },
      publishedAt: normalizeString(publishedVersion?.publishedAt || publishedVersion?.published_at || new Date().toISOString()),
      published_at: normalizeString(publishedVersion?.published_at || publishedVersion?.publishedAt || new Date().toISOString()),
    };
  }

  function delayRuntime(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function normalizeFineTuningRunReference(rawReference = {}, fallbackIndex = 0) {
    const source = readPlainObject(rawReference);
    return {
      evaluationSetId: normalizeString(source.evaluationSetId || source.evaluation_set_id),
      evaluationSetName: normalizeString(source.evaluationSetName || source.evaluation_set_name || "Evaluation " + (fallbackIndex + 1)),
      beforeRunId: normalizeString(source.beforeRunId || source.before_run_id),
      beforeRunLabel: normalizeString(source.beforeRunLabel || source.before_run_label || "Before"),
      beforeScore: clampScore(source.beforeScore ?? source.before_score ?? 0),
      beforeCostUsd: normalizeUsdCost(source.beforeCostUsd ?? source.before_cost_usd ?? 0),
      afterRunId: normalizeString(source.afterRunId || source.after_run_id),
      afterRunLabel: normalizeString(source.afterRunLabel || source.after_run_label || "After"),
      afterScore: clampScore(source.afterScore ?? source.after_score ?? 0),
      afterCostUsd: normalizeUsdCost(source.afterCostUsd ?? source.after_cost_usd ?? 0),
      status: normalizeString(source.status || "not_run") || "not_run",
      error: normalizeString(source.error || source.message),
    };
  }

  function isFineTuningEvaluationRunActive(status) {
    return isFineTuningRuntimeActiveStatus(status);
  }

  function mergeFineTuningVerificationReferences(job, references, statusOverride = "") {
    const normalizedJob = compactFineTuningJobRecord(job);
    const existingReferences = (Array.isArray(normalizedJob.evaluationRuns) ? normalizedJob.evaluationRuns : [])
      .map((reference, index) => normalizeFineTuningRunReference(reference, index));
    const bySetId = new Map(existingReferences.map((reference) => [reference.evaluationSetId, reference]));
    (Array.isArray(references) ? references : []).forEach((reference, index) => {
      const normalizedReference = normalizeFineTuningRunReference(reference, index);
      if (!normalizedReference.evaluationSetId) return;
      bySetId.set(normalizedReference.evaluationSetId, {
        ...(bySetId.get(normalizedReference.evaluationSetId) || {}),
        ...normalizedReference,
      });
    });
    const nextReferences = Array.from(bySetId.values());
    const beforeScores = nextReferences
      .map((reference) => Number(reference.beforeScore))
      .filter((score) => Number.isFinite(score));
    const finishedReferences = nextReferences.filter((reference) => {
      const status = normalizeString(reference.status).toLowerCase();
      if (!reference.afterRunId) return false;
      if (status === "pending" || status === "not_run") return false;
      return !isFineTuningEvaluationRunActive(status);
    });
    const finishedAfterScores = finishedReferences
      .map((reference) => Number(reference.afterScore))
      .filter((score) => Number.isFinite(score));
    const activeOrPending = nextReferences.some((reference) => {
      const status = normalizeString(reference.status).toLowerCase();
      return status === "pending" || (reference.afterRunId && isFineTuningEvaluationRunActive(status));
    });
    const failedReferences = nextReferences.filter((reference) => {
      const status = normalizeString(reference.status).toLowerCase();
      return status === "error" || status === "failed" || status === "blocked";
    });
    const beforeScore = beforeScores.length
      ? clampScore(beforeScores.reduce((sum, score) => sum + score, 0) / beforeScores.length)
      : normalizedJob.beforeScore;
    const afterScore = finishedAfterScores.length
      ? clampScore(finishedAfterScores.reduce((sum, score) => sum + score, 0) / finishedAfterScores.length)
      : normalizedJob.afterScore || beforeScore;
    const nextStatus = statusOverride
      || (activeOrPending
        ? "verifying"
        : finishedReferences.length || nextReferences.length > failedReferences.length
          ? "completed"
          : failedReferences.length
            ? "error"
            : normalizedJob.status || "completed");
    const verificationCostUsd = finishedReferences
      .reduce((sum, reference) => sum + normalizeUsdCost(reference.afterCostUsd), 0);
    const fineTuningCostUsd = normalizeUsdCost(normalizedJob.fineTuningCostUsd || normalizedJob.costUsd);
    return compactFineTuningJobRecord({
      ...normalizedJob,
      status: nextStatus,
      beforeScore,
      afterScore,
      improvementScore: finishedAfterScores.length ? clampScore(Math.max(0, afterScore - beforeScore)) : normalizedJob.improvementScore,
      fineTuningCostUsd,
      verificationCostUsd,
      costUsd: fineTuningCostUsd + verificationCostUsd,
      evaluationRuns: nextReferences,
      updatedAt: new Date().toISOString(),
    });
  }

  function extractEvaluationRunRecord(payload, fallback = {}) {
    const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
    const candidates = [
      source.run,
      source.evaluationRun,
      source.evaluation_run,
      source.data?.run,
      source.data?.evaluationRun,
      source.data?.evaluation_run,
      source.data,
      source.item,
      source.record,
      source,
    ];
    for (const candidate of candidates) {
      if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
        const run = normalizeEvaluationRun({
          ...(fallback && typeof fallback === "object" && !Array.isArray(fallback) ? fallback : {}),
          ...candidate,
        });
        if (run.id) return run;
      }
    }
    return normalizeEvaluationRun(fallback);
  }

  async function createFineTuningEvaluationRun(record, evaluationSet, runOptions) {
    let data;
    try {
      data = await requestPlatformRuntimeJson(
        record,
        "/api/real/evaluations/runs",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            evaluationSet,
            runOptions,
          }),
        },
        "Failed to start fine-tuning verification run."
      );
    } catch (runtimeError) {
      try {
        if (Number(runtimeError?.status || 0) !== 404) {
          throw runtimeError;
        }
        data = await requestBackendJson(
          record,
          `/evaluations/${encodeURIComponent(evaluationSet.id)}/runs`,
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              id: runOptions.id,
              runId: runOptions.id,
              run_id: runOptions.id,
              agentId: runOptions.targetAgentId,
              environmentId: runOptions.environmentId,
              computerId: runOptions.environmentId,
              versionId: runOptions.evaluationVersionId || evaluationSet.activeVersionId || "",
              status: "queued",
              metadata: {
                ...(runOptions.metadata || {}),
                fineTuningJobId: runOptions.fineTuningJobId,
                fine_tuning_job_id: runOptions.fine_tuning_job_id,
                targetAgentVersionId: runOptions.targetAgentVersionId,
                target_agent_version_id: runOptions.targetAgentVersionId,
                targetAgentVersionNumber: runOptions.targetAgentVersionNumber,
                target_agent_version_number: runOptions.targetAgentVersionNumber,
                targetAgentVersionLabel: runOptions.targetAgentVersionLabel,
                target_agent_version_label: runOptions.targetAgentVersionLabel,
              },
              run: runOptions,
            }),
          },
          "Failed to start fine-tuning verification run."
        );
      } catch (error) {
        throw error;
      }
    }
    return extractEvaluationRunRecord(data, runOptions);
  }

  async function fetchFineTuningEvaluationRun(record, runId) {
    const normalizedRunId = normalizeString(runId);
    if (!normalizedRunId) return null;
    let data;
    try {
      data = await requestPlatformRuntimeJson(
        record,
        `/api/real/evaluations/runs/${encodeURIComponent(normalizedRunId)}`,
        { method: "GET" },
        "Failed to load fine-tuning verification run."
      );
    } catch {
      data = await requestBackendJson(
        record,
        `/evaluations/runs/${encodeURIComponent(normalizedRunId)}`,
        { method: "GET" },
        "Failed to load fine-tuning verification run."
      );
    }
    return extractEvaluationRunRecord(data, { id: normalizedRunId });
  }

  async function waitForFineTuningEvaluationRun(record, initialRun, options = {}) {
    let latestRun = normalizeEvaluationRun(initialRun);
    const maxAttempts = Math.max(1, Number(options.maxAttempts || 360) || 360);
    const intervalMs = Math.max(500, Number(options.intervalMs || 2000) || 2000);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (latestRun.id && !isFineTuningEvaluationRunActive(latestRun.status)) {
        return latestRun;
      }
      await delayRuntime(intervalMs);
      try {
        const fetchedRun = await fetchFineTuningEvaluationRun(record, latestRun.id);
        if (fetchedRun?.id) {
          latestRun = {
            ...latestRun,
            ...fetchedRun,
          };
        }
      } catch {
        // Keep polling. A transient read error should not strand the fine-tune job.
      }
    }
    return {
      ...latestRun,
      status: "error",
      error: "Verification run did not finish before the fine-tuning timeout.",
    };
  }

  async function waitForFineTuningAgentVersion(record, agent, fineTuningJobId, options = {}) {
    const normalizedJobId = normalizeString(fineTuningJobId);
    if (!agent?.id || !normalizedJobId) return null;
    const maxAttempts = Math.max(1, Number(options.maxAttempts || 300) || 300);
    const intervalMs = Math.max(500, Number(options.intervalMs || 2000) || 2000);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const version = await findExistingAgentVersionForFineTuning(record, agent, normalizedJobId).catch(() => null);
      if (version?.id) return version;
      await delayRuntime(intervalMs);
    }
    return null;
  }

  async function resolveFineTuningThreadOutcome(record, thread, prompt, targetAgent, jobId, fallbackMessage) {
    const analysisPromise = thread?.id
      ? runThreadMessage(record, thread.id, prompt)
          .then((summary) => ({ type: "analysis", summary: sanitizeFineTuningAnalysisText(summary) }))
          .catch((error) => ({ type: "analysis", summary: "Fine-tuning analysis thread was created, but the analysis response was not available: " + (error?.message || String(error)) }))
      : Promise.resolve({ type: "analysis", summary: fallbackMessage });
    const versionPromise = thread?.id
      ? waitForFineTuningAgentVersion(record, targetAgent, jobId)
          .then((version) => ({ type: "version", version }))
      : Promise.resolve({ type: "version", version: null });
    const firstResult = await Promise.race([analysisPromise, versionPromise]);
    if (firstResult?.type === "version" && firstResult.version?.id) {
      return {
        analysisSummary: "Fine-tuning agent published version " + firstResult.version.id + ".",
        createdAgentVersion: firstResult.version,
      };
    }
    const analysisSummary = firstResult?.type === "analysis"
      ? firstResult.summary
      : fallbackMessage;
    const createdAgentVersion = await findExistingAgentVersionForFineTuning(record, targetAgent, jobId).catch(() => null);
    return {
      analysisSummary,
      createdAgentVersion,
    };
  }

  async function startFineTuningVerificationRuns(record, job, evaluationSets, targetAgent, environment) {
    const normalizedJob = compactFineTuningJobRecord(job);
    const version = readPlainObject(normalizedJob.createdAgentVersion);
    const versionId = normalizeString(version.id || version.versionId || version.version_id || normalizedJob.createdAgentVersionId);
    if (!versionId) {
      return mergeFineTuningVerificationReferences(normalizedJob, (Array.isArray(evaluationSets) ? evaluationSets : []).map((set) => ({
        evaluationSetId: set.id,
        evaluationSetName: set.name,
        status: "blocked",
        error: "Fine-tuning finished without a published agent version.",
      })), "error");
    }

    const startedRuns = [];
    const references = [];
    for (const set of Array.isArray(evaluationSets) ? evaluationSets : []) {
      const beforeRun = getFineTuningBaselineRun(set);
      const evaluatorSource = readPlainObject(set.evaluator);
      const evaluator = {
        type: normalizeString(evaluatorSource.type || "exact") || "exact",
        agentId: normalizeString(evaluatorSource.agentId || evaluatorSource.agent_id),
        code: String(evaluatorSource.code || ""),
      };
      if (evaluator.type === "agent" && !evaluator.agentId) {
        evaluator.agentId = targetAgent.id;
      }
      const runRequestOptions = {
        id: createFineTuningId("eval_run"),
        label: "Fine-Tune Verification",
        fineTuningJobId: normalizedJob.id,
        fine_tuning_job_id: normalizedJob.id,
        evaluationVersionId: normalizeString(set.activeVersionId),
        evaluationVersionNumber: Math.max(0, Number(set.activeVersionNumber || 0) || 0),
        evaluationVersionLabel: normalizeString(set.activeVersionLabel),
        targetAgentId: targetAgent.id,
        targetAgentName: targetAgent.name || normalizedJob.agentName,
        targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || normalizedJob.agentPhotoUrl),
        targetAgentVersionId: versionId,
        targetAgentVersionNumber: Math.max(0, Number(version.version || version.versionNumber || version.version_number || 0) || 0),
        targetAgentVersionLabel: normalizeString(version.label || (version.version ? "Version " + version.version : "")),
        targetAgentVersionRevisionId: normalizeString(version.revisionId || version.revision_id),
        environmentType: "computer",
        environmentId: environment.id,
        environmentName: environment.name || normalizedJob.environmentName,
        projectId: "",
        projectName: "",
        evaluator,
        passThreshold: set.passThreshold,
        metadata: {
          fineTuningJobId: normalizedJob.id,
          fine_tuning_job_id: normalizedJob.id,
        },
      };
      try {
        const run = await createFineTuningEvaluationRun(record, {
          ...set,
          targetAgentId: runRequestOptions.targetAgentId,
          targetAgentName: runRequestOptions.targetAgentName,
          environmentType: "computer",
          environmentId: runRequestOptions.environmentId,
          environmentName: runRequestOptions.environmentName,
          projectId: "",
          evaluator,
        }, runRequestOptions);
        startedRuns.push({ set, beforeRun, run });
        references.push({
          evaluationSetId: set.id,
          evaluationSetName: set.name,
          beforeRunId: beforeRun?.id || "",
          beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
          beforeScore: clampScore(beforeRun?.averageScore || 0),
          beforeCostUsd: normalizeUsdCost(beforeRun?.costUsd || beforeRun?.cost_usd) || computeTokensToUsd(beforeRun?.costTokens || beforeRun?.cost_tokens),
          afterRunId: run.id,
          afterRunLabel: run.label || "Fine-Tune Verification",
          afterScore: clampScore(run.averageScore || 0),
          afterCostUsd: normalizeUsdCost(run.costUsd || run.cost_usd),
          status: run.status || "running",
        });
      } catch (error) {
        references.push({
          evaluationSetId: set.id,
          evaluationSetName: set.name,
          beforeRunId: beforeRun?.id || "",
          beforeRunLabel: beforeRun?.label || beforeRun?.name || "Before",
          beforeScore: clampScore(beforeRun?.averageScore || 0),
          beforeCostUsd: normalizeUsdCost(beforeRun?.costUsd || beforeRun?.cost_usd) || computeTokensToUsd(beforeRun?.costTokens || beforeRun?.cost_tokens),
          afterRunId: "",
          afterRunLabel: "",
          afterScore: 0,
          afterCostUsd: 0,
          status: "error",
          error: error?.message || String(error),
        });
      }
    }

    let currentJob = storeJob(mergeFineTuningVerificationReferences(normalizedJob, references)) || normalizedJob;
    await persistBackendFineTuningJob(record, currentJob).catch(() => null);

    for (const startedRun of startedRuns) {
      const completedRun = await waitForFineTuningEvaluationRun(record, startedRun.run);
      const nextReference = {
        evaluationSetId: startedRun.set.id,
        evaluationSetName: startedRun.set.name,
        beforeRunId: startedRun.beforeRun?.id || "",
        beforeRunLabel: startedRun.beforeRun?.label || startedRun.beforeRun?.name || "Before",
        beforeScore: clampScore(startedRun.beforeRun?.averageScore || 0),
        beforeCostUsd: normalizeUsdCost(startedRun.beforeRun?.costUsd || startedRun.beforeRun?.cost_usd) || computeTokensToUsd(startedRun.beforeRun?.costTokens || startedRun.beforeRun?.cost_tokens),
        afterRunId: completedRun.id,
        afterRunLabel: completedRun.label || "Fine-Tune Verification",
        afterScore: clampScore(completedRun.averageScore || 0),
        afterCostUsd: normalizeUsdCost(completedRun.costUsd || completedRun.cost_usd),
        status: completedRun.status || "completed",
        error: completedRun.error || "",
      };
      currentJob = storeJob(mergeFineTuningVerificationReferences(currentJob, [nextReference])) || currentJob;
      await persistBackendFineTuningJob(record, currentJob).catch(() => null);
    }

    const finalJob = storeJob(mergeFineTuningVerificationReferences(currentJob, [], "")) || currentJob;
    await persistBackendFineTuningJob(record, finalJob).catch(() => null);
    return finalJob;
  }

  async function handleCreateJob(req, res) {
    try {
      pruneJobs();
      const body = await readRequestBody(req);
      const upstreamUrl = parseUpstreamUrl(req, body);
      const apiKey = readOptionalApiKey(req, body);
      const requestContext = req;
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
      const submittedAgent = normalizeAgent(body.agent || {});
      const fineTunerAgent = normalizeAgent(body.fineTunerAgent || body.fine_tuner_agent || body.runnerAgent || body.runner_agent || body.agent || {});
      const environment = normalizeEnvironment(body.environment || {});
      const evaluationSets = (Array.isArray(body.evaluationSets) ? body.evaluationSets : [])
        .map((set, index) => normalizeEvaluationSet(set, index))
        .filter((set) => set.id);
      const instructions = String(body.instructions || body.focus || "");
      const verifyAfter = true;
      const evaluationTarget = resolveFineTuningTargetFromEvaluationSets(evaluationSets);
      if (evaluationTarget.error) {
        return sendJson(res, 400, { error: evaluationTarget.error });
      }
      const explicitTargetAgent = normalizeAgent(body.targetAgent || body.target_agent || {});
      const targetFromRun = evaluationTarget.target || null;
      if (targetFromRun?.id && explicitTargetAgent.id && explicitTargetAgent.id !== targetFromRun.id) {
        return sendJson(res, 400, { error: "The submitted target agent does not match the selected evaluation run target." });
      }
      const targetAgentSource = targetFromRun
        ? {
            ...(submittedAgent.id === targetFromRun.id ? submittedAgent : {}),
            ...(explicitTargetAgent.id === targetFromRun.id ? explicitTargetAgent : {}),
            id: targetFromRun.id,
            name: targetFromRun.name || explicitTargetAgent.name || submittedAgent.name || "Target Agent",
            photoUrl: targetFromRun.photoUrl || explicitTargetAgent.photoUrl || submittedAgent.photoUrl || "",
          }
        : explicitTargetAgent.id
          ? explicitTargetAgent
          : submittedAgent;
      const targetAgent = normalizeAgent(targetAgentSource);
      if (!fineTunerAgent.id) {
        return sendJson(res, 400, { error: "Select a fine-tuner agent before starting fine-tuning." });
      }
      if (!targetAgent.id) {
        return sendJson(res, 400, { error: "The selected evaluation run does not contain a target agent. Run the evaluation first, then start fine-tuning from that run." });
      }
      if (isProtectedFineTuningTargetAgent(targetAgent)) {
        return sendJson(res, 400, { error: "Default agents cannot be fine-tuned. Create or select a custom agent evaluation run first." });
      }
      if (!environment.id) {
        return sendJson(res, 400, { error: "Select a computer before starting fine-tuning." });
      }
      if (!evaluationSets.length) {
        return sendJson(res, 400, { error: "Select at least one evaluation set." });
      }
      const nowIso = new Date().toISOString();
      const jobId = normalizeString(body.id || body.jobId || body.job_id) || createFineTuningId();
      const conductedBy = normalizePersonIdentity(body.conductedBy || body.conducted_by || body.createdBy || body.created_by || {});
      const metadata = {
        fineTuning: {
          jobId,
          agentId: targetAgent.id,
          targetAgentId: targetAgent.id,
          fineTunerAgentId: fineTunerAgent.id,
          environmentId: environment.id,
          evaluationSetIds: evaluationSets.map((set) => set.id),
          hidden: true,
          sidebarHidden: true,
        },
        runnerPlayground: {
          type: "fine_tuning_job",
          fineTuningJobId: jobId,
          hidden: true,
          sidebarHidden: true,
        },
      };
      let thread = {
        id: "",
        title: "Fine-Tune · " + targetAgent.name,
      };
      let threadStartupError = "";
      try {
        thread = await createHiddenThread(record, {
          title: "Fine-Tune · " + targetAgent.name,
          agentId: fineTunerAgent.id,
          environmentId: environment.id,
          metadata,
        });
      } catch (error) {
        threadStartupError = error?.message || String(error);
      }
      const prompt = buildFineTuningPrompt({
        targetAgent,
        fineTunerAgent,
        environment,
        evaluationSets,
        instructions,
        verifyAfter,
        jobId,
        nextVersionNumber: Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0,
      });
      const beforeScore = calculateAverageScore(evaluationSets);
      const improvementScore = 0;
      const afterScore = verifyAfter ? beforeScore : 0;
      const beforeSnapshot = buildAgentSnapshot(targetAgent, String(targetAgent.instructions || ""));
      const nextVersionNumber = Math.max(
        1,
        Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0
      ) || 1;
      const evaluationRuns = buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore);
      const initialVersion = {
        id: createFineTuningId("agent_version"),
        version: nextVersionNumber,
        label: "Fine-Tuned Version",
        description: "Generated by fine-tuning job " + jobId,
        status: "pending",
        snapshot: null,
        createdAt: nowIso,
        fineTuningJobId: jobId,
        metadata: {
          fineTuningJobId: jobId,
          fine_tuning_job_id: jobId,
          fineTuningJobName: normalizeString(body.name || "Fine-Tune " + targetAgent.name),
          fine_tuning_job_name: normalizeString(body.name || "Fine-Tune " + targetAgent.name),
          fineTuningCreatedAt: nowIso,
          fine_tuning_created_at: nowIso,
          fineTuningStatus: "running",
          fine_tuning_status: "running",
          targetAgentId: targetAgent.id,
          target_agent_id: targetAgent.id,
          targetAgentName: targetAgent.name,
          target_agent_name: targetAgent.name,
          targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
          target_agent_photo_url: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
          fineTunerAgentId: fineTunerAgent.id,
          fine_tuner_agent_id: fineTunerAgent.id,
          fineTunerAgentName: fineTunerAgent.name,
          fine_tuner_agent_name: fineTunerAgent.name,
          fineTunerAgentPhotoUrl: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
          fine_tuner_agent_photo_url: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
          environmentId: environment.id,
          environment_id: environment.id,
          environmentName: environment.name,
          environment_name: environment.name,
          threadId: thread.id,
          thread_id: thread.id,
          fineTuningThreadId: thread.id,
          fine_tuning_thread_id: thread.id,
          threadTitle: thread.title || "Fine-Tune · " + targetAgent.name,
          thread_title: thread.title || "Fine-Tune · " + targetAgent.name,
          evaluationSetIds: evaluationSets.map((set) => set.id),
          evaluation_set_ids: evaluationSets.map((set) => set.id),
          conductedBy,
          conducted_by: conductedBy,
          createdBy: conductedBy,
          created_by: conductedBy,
          beforeAgentSnapshot: beforeSnapshot,
          before_agent_snapshot: beforeSnapshot,
        },
      };
      const initialCostTokens = 0;
      const initialCostUsd = 0;
      const initialJob = {
        id: jobId,
        name: normalizeString(body.name || "Fine-Tune " + targetAgent.name),
        status: "running",
        createdAt: nowIso,
        updatedAt: nowIso,
        agentId: targetAgent.id,
        targetAgentId: targetAgent.id,
        agentName: targetAgent.name,
        targetAgentName: targetAgent.name,
        agentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
        targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
        conductedBy,
        createdBy: conductedBy,
        fineTunerAgentId: fineTunerAgent.id,
        fineTunerAgentName: fineTunerAgent.name,
        fineTunerAgentPhotoUrl: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
        environmentId: environment.id,
        environmentName: environment.name,
        evaluationSets: evaluationSets.map((set) => ({
          id: set.id,
          name: set.name,
          activeVersionId: set.activeVersionId,
          activeVersionNumber: set.activeVersionNumber,
          activeVersionLabel: set.activeVersionLabel,
          fineTuningRunId: normalizeString(getFineTuningBaselineRun(set)?.id || set.selectedRunId || ""),
          fineTuningRunLabel: normalizeString(getFineTuningBaselineRun(set)?.label || ""),
          caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
        })),
        instructions,
        verifyAfter,
        threadId: thread.id,
        threadTitle: thread.title || "Fine-Tune · " + targetAgent.name,
        beforeScore,
        afterScore: 0,
        improvementScore: 0,
        costTokens: initialCostTokens,
        costUsd: initialCostUsd,
        fineTuningCostUsd: initialCostUsd,
        verificationCostUsd: 0,
        analysisSummary: thread.id
          ? "Fine-tuning analysis is running."
          : "Fine-tuning analysis thread could not be created: " + threadStartupError,
        evaluationRuns,
        beforeAgentSnapshot: beforeSnapshot,
        afterAgentSnapshot: beforeSnapshot,
        diffFiles: [],
        createdAgentVersion: initialVersion,
        createdAgentVersionId: "",
        agentVersionCreationStatus: "pending",
      };
      const storedInitialJob = storeJob(initialJob) || initialJob;
      await createBackendFineTuningJob(record, storedInitialJob)
        .catch(() => persistBackendFineTuningJob(record, storedInitialJob).catch(() => null));
      void persistBackendFineTuningJob(record, storedInitialJob).catch(() => {});
      sendJson(res, 202, {
        object: "fine_tuning_job",
        job: storedInitialJob,
      });
      void (async () => {
        try {
          const threadOutcome = await resolveFineTuningThreadOutcome(
            record,
            thread,
            prompt,
            targetAgent,
            jobId,
            "Fine-tuning analysis thread could not be created, so a version was generated from the selected evaluation context: " + threadStartupError
          );
          const analysisSummary = threadOutcome.analysisSummary || "";
          const jobAfterAnalysis = jobsById.get(jobId)?.job || null;
          if (normalizeString(jobAfterAnalysis?.status).toLowerCase() === "cancelled") {
            void persistBackendFineTuningJob(record, jobAfterAnalysis).catch(() => {});
            return;
          }
          const proposedInstructions = buildProposedInstructions(targetAgent, evaluationSets, instructions, analysisSummary);
          const diffFiles = buildFineTuningDiffFiles(targetAgent, proposedInstructions);
          const afterSnapshot = buildAgentSnapshot(targetAgent, proposedInstructions);
          const finishedAtIso = new Date().toISOString();
          const hydratedThreadCosts = thread.id
            ? await fetchFineTuningThreadCosts(record, thread.id).catch(() => ({ costTokens: 0, costUsd: 0 }))
            : { costTokens: 0, costUsd: 0 };
          const fineTuningCostTokens = normalizeTokenCount(hydratedThreadCosts.costTokens);
          const fineTuningCostUsd = normalizeUsdCost(hydratedThreadCosts.costUsd);
          const proposedVersion = {
            ...initialVersion,
            status: "proposed",
            snapshot: afterSnapshot,
            metadata: {
              ...(initialVersion.metadata || {}),
              fineTuningUpdatedAt: finishedAtIso,
              fine_tuning_updated_at: finishedAtIso,
              fineTuningStatus: verifyAfter ? "verifying" : "completed",
              fine_tuning_status: verifyAfter ? "verifying" : "completed",
              beforeScore,
              before_score: beforeScore,
              afterScore,
              after_score: afterScore,
              improvementScore: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
              improvement_score: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
              costUsd: fineTuningCostUsd,
              cost_usd: fineTuningCostUsd,
              fineTuningCostUsd,
              fine_tuning_cost_usd: fineTuningCostUsd,
              verificationCostUsd: 0,
              verification_cost_usd: 0,
              evaluationRuns,
              evaluation_runs: evaluationRuns,
            },
          };
          let createdAgentVersion = proposedVersion;
          let agentVersionCreationStatus = "proposed";
          let agentVersionError = "";
          const threadCreatedVersion = threadOutcome.createdAgentVersion && typeof threadOutcome.createdAgentVersion === "object" && !Array.isArray(threadOutcome.createdAgentVersion)
            ? threadOutcome.createdAgentVersion
            : null;
          if (threadCreatedVersion?.id) {
            createdAgentVersion = {
              ...proposedVersion,
              ...threadCreatedVersion,
              id: threadCreatedVersion.id,
              status: normalizeString(threadCreatedVersion.status || "published") || "published",
              snapshot: preserveFineTuningAgentName(targetAgent, threadCreatedVersion.snapshot || proposedVersion.snapshot),
              metadata: {
                ...(proposedVersion.metadata || {}),
                ...readPlainObject(threadCreatedVersion.metadata),
                fineTuningStatus: verifyAfter ? "verifying" : "completed",
                fine_tuning_status: verifyAfter ? "verifying" : "completed",
              },
            };
            agentVersionCreationStatus = "published";
          } else {
            try {
              const savedVersion = await createAgentVersion(record, targetAgent, proposedVersion);
              const publishedVersion = await publishAgentVersion(record, targetAgent, savedVersion, proposedVersion.snapshot);
              createdAgentVersion = {
                ...proposedVersion,
                ...publishedVersion,
                status: normalizeString(publishedVersion.status || "published") || "published",
                snapshot: preserveFineTuningAgentName(targetAgent, publishedVersion.snapshot || savedVersion.snapshot || proposedVersion.snapshot),
              };
              agentVersionCreationStatus = "published";
            } catch (error) {
              agentVersionError = error?.message || String(error);
              createdAgentVersion = {
                ...proposedVersion,
                status: "error",
                error: agentVersionError,
              };
              agentVersionCreationStatus = "error";
            }
          }
          const publishedSnapshot = createdAgentVersion?.snapshot && typeof createdAgentVersion.snapshot === "object" && !Array.isArray(createdAgentVersion.snapshot)
            ? preserveFineTuningAgentName(targetAgent, createdAgentVersion.snapshot)
            : preserveFineTuningAgentName(targetAgent, afterSnapshot);
          const publishedDiffFiles = buildFineTuningDiffFilesFromSnapshots(beforeSnapshot, publishedSnapshot);
          const jobBeforeCompletion = jobsById.get(jobId)?.job || null;
          if (normalizeString(jobBeforeCompletion?.status).toLowerCase() === "cancelled") {
            void persistBackendFineTuningJob(record, jobBeforeCompletion).catch(() => {});
            return;
          }
          const versionReadyJob = storeJob({
            ...initialJob,
            status: agentVersionCreationStatus === "published"
              ? (verifyAfter ? "verifying" : "completed")
              : "error",
            updatedAt: finishedAtIso,
            afterScore,
            improvementScore: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
            costTokens: fineTuningCostTokens,
            costUsd: fineTuningCostUsd,
            fineTuningCostUsd,
            verificationCostUsd: 0,
            analysisSummary,
            evaluationRuns,
            afterAgentSnapshot: publishedSnapshot,
            diffFiles: publishedDiffFiles.length ? publishedDiffFiles : diffFiles,
            createdAgentVersion,
            createdAgentVersionId: createdAgentVersion.id || "",
            agentVersionCreationStatus,
            agentVersionError,
            error: agentVersionError,
          }) || initialJob;
          await persistBackendFineTuningJob(record, versionReadyJob).catch(() => null);
          if (agentVersionCreationStatus !== "published") {
            return;
          }
          if (verifyAfter) {
            await startFineTuningVerificationRuns(record, versionReadyJob, evaluationSets, targetAgent, environment);
          }
        } catch (error) {
          const currentJob = jobsById.get(jobId)?.job || initialJob;
          const message = error?.message || String(error);
          const failedJob = storeJob({
            ...currentJob,
            status: "error",
            error: message,
            analysisSummary: currentJob.analysisSummary || message,
            agentVersionCreationStatus: ["saved", "published"].includes(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionCreationStatus : "error",
            agentVersionError: ["saved", "published"].includes(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionError : message,
            createdAgentVersion: ["saved", "published"].includes(currentJob.agentVersionCreationStatus)
              ? currentJob.createdAgentVersion
              : {
                  ...(currentJob.createdAgentVersion || initialVersion),
                status: "error",
                error: message,
              },
            updatedAt: new Date().toISOString(),
          }) || currentJob;
          void persistBackendFineTuningJob(record, failedJob).catch(() => {});
        }
      })();
      return;
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to start fine-tuning job",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function handleRequest(req, res, url) {
    if (req.method === "GET" && url.pathname === "/api/real/fine-tuning/jobs") {
      void (async () => {
        try {
          pruneJobs();
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          if (!record.apiKey && !hasAiosSession(req)) {
            sendJson(res, 401, {
              error: "Unauthorized",
              message: "Sign in to Computer Agents or provide an API key.",
            });
            return;
          }
          const backendJobs = await fetchBackendFineTuningJobs(record, url.search).catch(() => []);
          backendJobs.forEach((job) => storeJob(job));
          const memoryJobs = Array.from(jobsById.values()).map((record) => record.job);
          const versionJobs = await recoverFineTuningJobsFromAgentVersions(record).catch(() => []);
          const jobs = mergeFineTuningJobLists(backendJobs, versionJobs, memoryJobs).filter((job) => !deletedJobIds.has(job.id));
          const filteredJobs = filterFineTuningJobs(jobs, url);
          sendJson(res, 200, {
            object: "list",
            jobs: filteredJobs,
            total: jobs.length,
          });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to load fine-tuning jobs",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    if (req.method === "POST" && url.pathname === "/api/real/fine-tuning/jobs") {
      void handleCreateJob(req, res);
      return true;
    }
    const jobMatch = url.pathname.match(/^\/api\/real\/fine-tuning\/jobs\/([^/]+)$/);
    if (req.method === "GET" && jobMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(jobMatch[1]);
          if (deletedJobIds.has(jobId)) {
            sendJson(res, 404, { error: "Fine-tuning job not found." });
            return;
          }
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          let job = jobsById.get(jobId)?.job || null;
          const backendJob = await fetchBackendFineTuningJob(record, jobId).catch(() => null);
          if (backendJob) {
            job = job ? mergeFineTuningJobRecords(backendJob, job) : backendJob;
          }
          const versionJobs = await recoverFineTuningJobsFromAgentVersions(record).catch(() => []);
          const versionJob = versionJobs.find((item) => item.id === jobId) || null;
          if (versionJob) {
            job = job ? mergeFineTuningJobRecords(job, versionJob) : versionJob;
          }
          if (job) {
            job = await hydrateFineTuningJobDetails(record, job).catch(() => job);
          }
          if (job) storeJob(job);
          if (!job) {
            sendJson(res, 404, { error: "Fine-tuning job not found." });
            return;
          }
          sendJson(res, 200, { object: "fine_tuning_job", job });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to load fine-tuning job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    if ((req.method === "PATCH" || req.method === "PUT") && jobMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(jobMatch[1]);
          const body = await readRequestBody(req);
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          const backendJob = await fetchBackendFineTuningJob(record, jobId).catch(() => null);
          const existingJob = mergeFineTuningJobRecords(backendJob || { id: jobId }, jobsById.get(jobId)?.job || { id: jobId });
          const incomingJob = body?.job && typeof body.job === "object" && !Array.isArray(body.job)
            ? body.job
            : body;
          const mergedJob = mergeFineTuningJobRecords(existingJob, {
            ...(incomingJob || {}),
            id: normalizeString(incomingJob?.id || incomingJob?.jobId || incomingJob?.job_id || jobId) || jobId,
            updatedAt: normalizeString(incomingJob?.updatedAt || incomingJob?.updated_at || new Date().toISOString()),
          });
          const storedJob = storeJob(mergedJob) || mergedJob;
          const persistedJob = await persistBackendFineTuningJob(record, storedJob).catch(() => null);
          const responseJob = persistedJob ? (storeJob(mergeFineTuningJobRecords(storedJob, persistedJob)) || persistedJob) : storedJob;
          sendJson(res, 200, { object: "fine_tuning_job", job: responseJob });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to update fine-tuning job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    const cancelMatch = url.pathname.match(/^\/api\/real\/fine-tuning\/jobs\/([^/]+)\/cancel$/);
    if (req.method === "POST" && cancelMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(cancelMatch[1]);
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          const backendJob = await fetchBackendFineTuningJob(record, jobId).catch(() => null);
          const existingJob = mergeFineTuningJobRecords(backendJob || { id: jobId }, jobsById.get(jobId)?.job || { id: jobId });
          const cancelledEvaluationRuns = (Array.isArray(existingJob.evaluationRuns) ? existingJob.evaluationRuns : []).map((reference) => ({
            ...reference,
            status: isFineTuningRuntimeActiveStatus(reference?.status) ? "cancelled" : reference?.status,
          }));
          const mergedJob = mergeFineTuningJobRecords(existingJob, {
            id: jobId,
            status: "cancelled",
            evaluationRuns: cancelledEvaluationRuns,
            updatedAt: new Date().toISOString(),
          });
          const storedJob = storeJob(mergedJob) || mergedJob;
          const threadId = normalizeString(storedJob.threadId || existingJob.threadId);
          if (threadId) {
            await requestBackendJson(
              record,
              `/threads/${encodeURIComponent(threadId)}/cancel`,
              {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({}),
              },
              "Failed to cancel fine-tuning thread."
            ).catch(() => null);
          }
          const persistedJob = await cancelBackendFineTuningJob(record, jobId).catch(() => null);
          const responseJob = persistedJob
            ? (storeJob(mergeFineTuningJobRecords(storedJob, {
                ...persistedJob,
                status: "cancelled",
                evaluationRuns: cancelledEvaluationRuns,
              })) || persistedJob)
            : storedJob;
          sendJson(res, 200, { object: "fine_tuning_job", job: responseJob });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to cancel fine-tuning job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    if (req.method === "DELETE" && jobMatch) {
      void (async () => {
        try {
          pruneJobs();
          const jobId = decodeURIComponent(jobMatch[1]);
          const body = {};
          const record = {
            requestContext: req,
            upstreamUrl: parseUpstreamUrl(req, body),
            apiKey: readOptionalApiKey(req, body),
            body,
          };
          await deleteBackendFineTuningJob(record, jobId).catch(() => null);
          jobsById.delete(jobId);
          deletedJobIds.add(jobId);
          sendJson(res, 200, { object: "fine_tuning_job.deleted", deleted: true });
        } catch (error) {
          sendJson(res, Number(error?.status || 500), {
            error: "Failed to delete fine-tuning job",
            message: error instanceof Error ? error.message : String(error),
          });
        }
      })();
      return true;
    }
    return false;
  }

  return {
    handleRequest,
  };
}
