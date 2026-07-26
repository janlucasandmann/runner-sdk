import {
  FINE_TUNING_CT_PER_DOLLAR,
  clampScore,
  compactFineTuningReferenceMetadata,
  computeTokensToUsd,
  hasPlainObjectContent,
  normalizeResponseArray,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readFirstPlainObject,
  readPlainObject,
  sanitizeReferenceText,
} from "./primitives.mjs";

import {
  readComputeTokenValue,
  readUsdCostValue,
} from "./thread-data.mjs";

export function normalizeEvaluationRun(rawRun = {}) {
  const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
  const cases = (Array.isArray(source.cases) ? source.cases : []).map((caseItem) => {
    const rawScore = caseItem?.score;
    const numericScore = rawScore === null || rawScore === undefined || (typeof rawScore === "string" && !rawScore.trim())
      ? null
      : Number(rawScore);
    return {
      ...readPlainObject(caseItem),
      id: normalizeString(caseItem?.id || caseItem?.caseRunId || caseItem?.case_run_id),
      dataRowId: normalizeString(caseItem?.dataRowId || caseItem?.data_row_id || caseItem?.caseId || caseItem?.case_id),
      input: String(caseItem?.input || ""),
      expectedOutput: String(caseItem?.expectedOutput || caseItem?.expected_output || ""),
      evaluationGuidance: String(caseItem?.evaluationGuidance || caseItem?.evaluation_guidance || ""),
      optimizationRole: ["train", "validation", "holdout"].includes(
        normalizeString(caseItem?.optimizationRole || caseItem?.optimization_role).toLowerCase(),
      )
        ? normalizeString(caseItem?.optimizationRole || caseItem?.optimization_role).toLowerCase()
        : "train",
      actualOutput: String(caseItem?.actualOutput || caseItem?.actual_output || ""),
      evaluatorReason: String(caseItem?.evaluatorReason || caseItem?.evaluator_reason || ""),
      evaluatorOutput: String(caseItem?.evaluatorOutput || caseItem?.evaluator_output || ""),
      score: Number.isFinite(numericScore) ? clampScore(numericScore) : null,
      status: normalizeString(caseItem?.status),
      threadId: normalizeString(caseItem?.threadId || caseItem?.thread_id),
      evaluatorThreadId: normalizeString(caseItem?.evaluatorThreadId || caseItem?.evaluator_thread_id),
      costTokens: readComputeTokenValue(caseItem),
      costUsd: readUsdCostValue(caseItem),
      costSource: normalizeString(caseItem?.costSource || caseItem?.cost_source),
      latencyMs: Math.max(0, Number(caseItem?.latencyMs ?? caseItem?.latency_ms ?? 0) || 0),
    };
  });
  const scoredCases = cases.filter((caseItem) => (
    ["completed", "passed", "failed"].includes(normalizeString(caseItem.status).toLowerCase())
    && Number.isFinite(caseItem.score)
  ));
  const explicitAverageScore = source.averageScore ?? source.average_score;
  const parsedExplicitAverageScore = explicitAverageScore === null || explicitAverageScore === undefined || explicitAverageScore === ""
    ? null
    : Number(explicitAverageScore);
  const runCostUsd = readUsdCostValue(source);
  const runCostTokens = readComputeTokenValue(source) || normalizeTokenCount(runCostUsd * FINE_TUNING_CT_PER_DOLLAR);
  const totalCount = Math.max(0, Number(source.totalCount ?? source.total_count ?? cases.length) || cases.length);
  const scoredCount = cases.length
    ? scoredCases.length
    : Math.min(totalCount, Math.max(0, Number(source.scoredCount ?? source.scored_count ?? totalCount) || 0));
  const passThreshold = clampScore(source.passThreshold ?? source.pass_threshold, 0.8);
  const passedCount = Math.max(
    0,
    Math.min(
      scoredCount,
      cases.length
        ? scoredCases.filter((caseItem) => caseItem.score >= passThreshold).length
        : Number(source.passedCount ?? source.passed_count) || 0,
    ),
  );
  return {
    id: normalizeString(source.id || source.runId || source.run_id),
    label: normalizeString(source.label || source.name || source.title || "Run"),
    averageScore: scoredCases.length > 0
      ? scoredCases.reduce((sum, item) => sum + item.score, 0) / scoredCases.length
      : Number.isFinite(parsedExplicitAverageScore)
        ? clampScore(parsedExplicitAverageScore)
        : null,
    costTokens: runCostTokens,
    costUsd: runCostUsd || computeTokensToUsd(runCostTokens),
    costSource: normalizeString(source.costSource || source.cost_source),
    createdAt: normalizeString(source.createdAt || source.created_at || source.completedAt || source.completed_at),
    status: normalizeString(source.status || "completed") || "completed",
    cases,
    totalCount,
    scoredCount,
    passedCount,
    failedCount: Math.max(0, scoredCount - passedCount),
    invalidCount: cases.filter((caseItem) => normalizeString(caseItem.status).toLowerCase() === "invalid").length,
    graderErrorCount: cases.filter((caseItem) => normalizeString(caseItem.status).toLowerCase() === "grader_error").length,
    infrastructureErrorCount: cases.filter((caseItem) => ["infrastructure_error", "error"].includes(normalizeString(caseItem.status).toLowerCase())).length,
    passRate: scoredCount > 0
      ? clampScore(source.passRate ?? source.pass_rate, passedCount / scoredCount)
      : null,
    passThreshold,
    optimizationRoles: (
      Array.isArray(source.optimizationRoles)
        ? source.optimizationRoles
        : Array.isArray(source.optimization_roles)
          ? source.optimization_roles
          : []
    )
      .map((role) => normalizeString(role).toLowerCase())
      .filter((role) => ["train", "validation", "holdout"].includes(role)),
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
    targetAgentVersionId: normalizeString(source.targetAgentVersionId || source.target_agent_version_id || source.agentVersionId || source.agent_version_id),
    targetAgentVersionNumber: Math.max(0, Number(source.targetAgentVersionNumber || source.target_agent_version_number || source.agentVersionNumber || source.agent_version_number || 0) || 0),
    targetAgentVersionLabel: normalizeString(source.targetAgentVersionLabel || source.target_agent_version_label || source.agentVersionLabel || source.agent_version_label),
    runFingerprint: normalizeString(source.runFingerprint || source.run_fingerprint),
    datasetFingerprint: normalizeString(source.datasetFingerprint || source.dataset_fingerprint),
    caseSelectionFingerprint: normalizeString(source.caseSelectionFingerprint || source.case_selection_fingerprint),
    evaluatorFingerprint: normalizeString(source.evaluatorFingerprint || source.evaluator_fingerprint),
    systemFingerprint: normalizeString(source.systemFingerprint || source.system_fingerprint),
    metadata: readPlainObject(source.metadata),
  };
}

export function normalizeEvaluationSet(rawSet = {}, fallbackIndex = 0) {
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
    metadata: readPlainObject(source.metadata),
  };
}

export function getLatestEvaluationRun(set) {
  const runs = Array.isArray(set?.runs) ? set.runs : [];
  return runs.slice().sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || 0) || 0;
    const rightTime = Date.parse(right.createdAt || 0) || 0;
    return rightTime - leftTime;
  })[0] || null;
}

export function getFineTuningBaselineRun(set) {
  const selectedRunId = normalizeString(set?.selectedRunId || set?.fineTuningRunId || set?.fine_tuning_run_id);
  const runs = Array.isArray(set?.runs) ? set.runs : [];
  return (selectedRunId ? runs.find((run) => normalizeString(run?.id || run?.runId || run?.run_id) === selectedRunId) : null)
    || (set?.selectedRun && set.selectedRun.id ? set.selectedRun : null)
    || getLatestEvaluationRun(set);
}

export function calculateAverageScore(sets) {
  const scores = (Array.isArray(sets) ? sets : [])
    .map((set) => getFineTuningBaselineRun(set)?.averageScore)
    .filter((score) => Number.isFinite(Number(score)));
  if (!scores.length) return 0;
  return clampScore(scores.reduce((sum, score) => sum + Number(score || 0), 0) / scores.length);
}

export function normalizeAgent(rawAgent = {}) {
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

export function normalizeEnvironment(rawEnvironment = {}) {
  const source = rawEnvironment && typeof rawEnvironment === "object" && !Array.isArray(rawEnvironment) ? rawEnvironment : {};
  return {
    ...source,
    id: normalizeString(source.id || source.environmentId || source.environment_id || source.computerId || source.computer_id),
    name: normalizeString(source.name || source.label || source.title || "Computer"),
  };
}

export function isProtectedFineTuningTargetAgent(agent) {
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

export function resolveFineTuningTargetFromEvaluationSets(evaluationSets) {
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
