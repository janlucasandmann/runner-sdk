import {
  EVALUATION_CT_PER_DOLLAR,
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
} from "./primitives.mjs";

export function normalizeDataRow(row, fallbackIndex = 0) {
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

export function normalizeEvaluationSet(record = {}) {
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

export function normalizeComparable(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function clampScore(value) {
  const numericScore = Number(value);
  if (!Number.isFinite(numericScore)) return null;
  return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
}

export function normalizeRunCase(rawCase = {}, fallbackIndex = 0) {
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
    executionStage: normalizeString(source.executionStage || source.execution_stage),
    failureStage: normalizeString(source.failureStage || source.failure_stage),
    score: score === null ? 0 : score,
    costTokens: readComputeTokenValue(source),
    costUsd: readUsdCostValue(source),
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

export function recomputeRun(nextRun) {
  const cases = Array.isArray(nextRun.cases) ? nextRun.cases.map((item, index) => normalizeRunCase(item, index)) : [];
  const activeStatuses = new Set(["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]);
  const activeCount = cases.filter((item) => activeStatuses.has(item.status)).length;
  const errorCount = cases.filter((item) => item.status === "error").length;
  const passThreshold = normalizePassThreshold(nextRun.passThreshold ?? nextRun.pass_threshold ?? 0.8);
  const averageScore = cases.length > 0
    ? cases.reduce((sum, item) => sum + Number(item.score || 0), 0) / cases.length
    : 0;
  const costTokens = cases.reduce((sum, item) => sum + normalizeTokenCount(item.costTokens), 0);
  const costUsd = cases.reduce((sum, item) => sum + normalizeUsdCost(item.costUsd), 0);
  const costSource = costTokens > 0 && cases.some((item) => item.costSource === "thread_usage_ct")
    ? "thread_usage_ct"
    : normalizeString(nextRun.costSource || nextRun.cost_source);
  return {
    ...nextRun,
    cases,
    passThreshold,
    costTokens,
    costUsd,
    costSource,
    averageScore: Math.max(0, Math.min(1, averageScore)),
    passedCount: cases.filter((item) => !activeStatuses.has(item.status) && item.status !== "error" && Number(item.score || 0) >= passThreshold).length,
    totalCount: cases.length,
    status: activeCount > 0 ? "running" : errorCount === cases.length && cases.length > 0 ? "failed" : "completed",
    completedAt: activeCount > 0 ? String(nextRun.completedAt || "") : (String(nextRun.completedAt || "") || new Date().toISOString()),
  };
}

export function createEvaluationRun(evaluationSet, options = {}) {
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
    targetGuardrailId: normalizeString(options.targetGuardrailId || options.target_guardrail_id || options.guardrailId || options.guardrail_id),
    targetGuardrailName: normalizeString(options.targetGuardrailName || options.target_guardrail_name || options.guardrailName || options.guardrail_name),
    targetGuardrailVersionId: normalizeString(options.targetGuardrailVersionId || options.target_guardrail_version_id || options.guardrailVersionId || options.guardrail_version_id),
    targetGuardrailVersionNumber: Math.max(0, Number(options.targetGuardrailVersionNumber || options.target_guardrail_version_number || options.guardrailVersionNumber || options.guardrail_version_number || 0) || 0),
    targetGuardrailVersionLabel: normalizeString(options.targetGuardrailVersionLabel || options.target_guardrail_version_label || options.guardrailVersionLabel || options.guardrail_version_label),
    fineTuningJobId: normalizeString(options.fineTuningJobId || options.fine_tuning_job_id),
    fine_tuning_job_id: normalizeString(options.fine_tuning_job_id || options.fineTuningJobId),
    environmentType: normalizeString(options.environmentType || evaluationSet.environmentType).toLowerCase() === "project" ? "project" : "computer",
    environmentId: normalizeString(options.environmentId || evaluationSet.environmentId),
    environmentName: normalizeString(options.environmentName || options.environment_name),
    projectId: normalizeString(options.projectId || evaluationSet.projectId),
    projectName: normalizeString(options.projectName || options.project_name),
    evaluator,
    passThreshold: normalizePassThreshold(options.passThreshold ?? options.pass_threshold ?? evaluationSet.passThreshold ?? evaluationSet.pass_threshold ?? 0.8),
    datasetVersion,
    evaluatorVersion,
    metadata: {
      ...(options.metadata && typeof options.metadata === "object" && !Array.isArray(options.metadata) ? options.metadata : {}),
      fineTuningJobId: normalizeString(options.fineTuningJobId || options.fine_tuning_job_id),
      fine_tuning_job_id: normalizeString(options.fine_tuning_job_id || options.fineTuningJobId),
      targetGuardrailId: normalizeString(options.targetGuardrailId || options.target_guardrail_id || options.guardrailId || options.guardrail_id),
      target_guardrail_id: normalizeString(options.target_guardrail_id || options.targetGuardrailId || options.guardrail_id || options.guardrailId),
    },
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
