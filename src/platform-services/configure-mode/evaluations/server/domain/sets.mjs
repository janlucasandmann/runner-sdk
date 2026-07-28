import {
  EVALUATION_CT_PER_DOLLAR,
  createEvaluationFingerprint,
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

const SYSTEM_SNAPSHOT_SECRET_KEYS = new Set([
  "auth",
  "authorization",
  "cookie",
  "password",
  "passphrase",
  "secret",
  "session",
  "token",
]);

const SYSTEM_SNAPSHOT_SECRET_KEY_PARTS = [
  "apikey",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "bearertoken",
  "authtoken",
  "oauthtoken",
  "authorization",
  "authheader",
  "cookie",
  "credential",
  "password",
  "passphrase",
  "privatekey",
  "clientsecret",
  "webhooksecret",
  "signingsecret",
  "sessionid",
  "sessionkey",
  "sessiontoken",
];

function isSystemSnapshotSecretKey(key) {
  const normalized = String(key || "").replace(/[^a-z0-9]/gi, "").toLowerCase();
  return SYSTEM_SNAPSHOT_SECRET_KEYS.has(normalized)
    || SYSTEM_SNAPSHOT_SECRET_KEY_PARTS.some((part) => normalized.includes(part));
}

function readSystemRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function sanitizeSystemContract(value, depth = 0) {
  if (value === null || value === undefined) return null;
  if (depth > 8) return "[depth-limited]";
  if (typeof value === "string") return value;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) {
    return value.slice(0, 500).map((item) => sanitizeSystemContract(item, depth + 1));
  }
  if (typeof value !== "object") return String(value);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !isSystemSnapshotSecretKey(key))
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => [key, sanitizeSystemContract(nestedValue, depth + 1)]),
  );
}

function pruneEmptySystemContract(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value.trim() ? value : null;
  if (Array.isArray(value)) {
    const items = value
      .map((item) => pruneEmptySystemContract(item))
      .filter((item) => item !== null);
    return items.length ? items : null;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, nestedValue]) => [key, pruneEmptySystemContract(nestedValue)])
      .filter(([, nestedValue]) => nestedValue !== null);
    return entries.length ? Object.fromEntries(entries) : null;
  }
  return value;
}

function compactSystemContract(value) {
  return pruneEmptySystemContract(sanitizeSystemContract(value));
}

function systemContractFingerprint(namespace, value, existingFingerprint = "") {
  const normalizedExisting = normalizeString(existingFingerprint);
  if (normalizedExisting) return normalizedExisting;
  const compact = compactSystemContract(value);
  return compact === null
    ? ""
    : createEvaluationFingerprint(namespace, compact);
}

function normalizeSystemContractIds(value) {
  const entries = Array.isArray(value) ? value : value === null || value === undefined ? [] : [value];
  return Array.from(new Set(entries.map((entry) => {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      return normalizeString(entry.id || entry.skillId || entry.skill_id || entry.toolId || entry.tool_id || entry.name);
    }
    return normalizeString(entry);
  }).filter(Boolean))).sort();
}

function buildEvaluationSystemSnapshot(options, targetSnapshot) {
  const provided = readSystemRecord(options.systemSnapshot || options.system_snapshot);
  const providedAgent = readSystemRecord(provided.agent);
  const agentSnapshot = readSystemRecord(
    options.targetAgentSnapshot
      || options.target_agent_snapshot
      || options.agentSnapshot
      || options.agent_snapshot
      || providedAgent.snapshot,
  );
  const agentConfiguration = {
    model: agentSnapshot.model ?? agentSnapshot.modelId ?? agentSnapshot.model_id ?? null,
    provider: agentSnapshot.provider ?? agentSnapshot.modelProvider ?? agentSnapshot.model_provider ?? null,
    reasoningEffort: agentSnapshot.reasoningEffort ?? agentSnapshot.reasoning_effort ?? null,
    deepResearchModel: agentSnapshot.deepResearchModel ?? agentSnapshot.deep_research_model ?? null,
    responseFormat: agentSnapshot.responseFormat ?? agentSnapshot.response_format ?? null,
    permissionSet: agentSnapshot.permissionSet ?? agentSnapshot.permission_set ?? null,
    guardrailSetIds: agentSnapshot.guardrailSetIds ?? agentSnapshot.guardrail_set_ids ?? null,
    promptAdaptations: agentSnapshot.promptAdaptations ?? agentSnapshot.prompt_adaptations ?? null,
    invisiblePromptAdaptations: agentSnapshot.invisiblePromptAdaptations ?? agentSnapshot.invisible_prompt_adaptations ?? null,
  };
  const instructions = String(
    options.targetAgentInstructions
      || options.target_agent_instructions
      || agentSnapshot.instructions
      || agentSnapshot.systemPrompt
      || agentSnapshot.system_prompt
      || "",
  );
  const model = compactSystemContract(
    provided.model
      || options.modelSnapshot
      || options.model_snapshot
      || options.model
      || agentSnapshot.modelConfiguration
      || agentSnapshot.model_configuration
      || agentSnapshot.model
      || agentSnapshot.modelId
      || agentSnapshot.model_id,
  );
  const sampling = compactSystemContract(
    provided.sampling
      || options.samplingSnapshot
      || options.sampling_snapshot
      || options.sampling
      || {
        temperature: agentSnapshot.temperature ?? null,
        topP: agentSnapshot.topP ?? agentSnapshot.top_p ?? null,
        seed: agentSnapshot.seed ?? null,
        maxTokens: agentSnapshot.maxTokens ?? agentSnapshot.max_tokens ?? agentSnapshot.maxOutputTokens ?? agentSnapshot.max_output_tokens ?? null,
      },
  );
  const toolContract = compactSystemContract(
    provided.tools
      || options.toolSnapshot
      || options.tool_snapshot
      || options.tools
      || options.enabledTools
      || options.enabled_tools
      || agentSnapshot.tools
      || agentSnapshot.enabledTools
      || agentSnapshot.enabled_tools,
  );
  const skillContract = compactSystemContract(
    provided.skills
      || options.skillSnapshot
      || options.skill_snapshot
      || options.skills
      || options.enabledSkills
      || options.enabled_skills
      || agentSnapshot.skills
      || agentSnapshot.enabledSkills
      || agentSnapshot.enabled_skills,
  );
  const providedGuardrail = readSystemRecord(provided.guardrail);
  const guardrailSnapshot = compactSystemContract(
    options.targetGuardrailSnapshot
      || options.target_guardrail_snapshot
      || providedGuardrail.snapshot,
  );
  const providedEnvironment = readSystemRecord(provided.environment);
  const environmentSnapshot = compactSystemContract(
    options.environmentSnapshot
      || options.environment_snapshot
      || providedEnvironment.snapshot,
  );
  const runtime = compactSystemContract(
    provided.runtime
      || options.runtimeSnapshot
      || options.runtime_snapshot
      || options.runtime,
  );

  return {
    schemaVersion: "evaluation_system_snapshot_v1",
    agent: {
      id: targetSnapshot.agentId,
      versionId: targetSnapshot.agentVersionId,
      versionNumber: targetSnapshot.agentVersionNumber,
      revisionId: targetSnapshot.agentVersionRevisionId,
      configurationFingerprint: systemContractFingerprint(
        "evaluation_agent_configuration",
        agentConfiguration,
        providedAgent.configurationFingerprint || providedAgent.configuration_fingerprint,
      ),
      instructionsFingerprint: systemContractFingerprint(
        "evaluation_agent_instructions",
        instructions,
        providedAgent.instructionsFingerprint || providedAgent.instructions_fingerprint,
      ),
    },
    model,
    sampling,
    tools: {
      ids: normalizeSystemContractIds(
        readSystemRecord(provided.tools).ids || toolContract,
      ),
      fingerprint: systemContractFingerprint(
        "evaluation_tools",
        toolContract,
        readSystemRecord(provided.tools).fingerprint,
      ),
    },
    skills: {
      ids: normalizeSystemContractIds(
        readSystemRecord(provided.skills).ids || skillContract,
      ),
      fingerprint: systemContractFingerprint(
        "evaluation_skills",
        skillContract,
        readSystemRecord(provided.skills).fingerprint,
      ),
    },
    guardrail: {
      id: targetSnapshot.guardrailId,
      versionId: targetSnapshot.guardrailVersionId,
      snapshotFingerprint: systemContractFingerprint(
        "evaluation_guardrail_snapshot",
        guardrailSnapshot,
        providedGuardrail.snapshotFingerprint || providedGuardrail.snapshot_fingerprint,
      ),
    },
    environment: {
      type: targetSnapshot.environmentType,
      id: targetSnapshot.environmentId,
      projectId: targetSnapshot.projectId,
      revisionId: normalizeString(
        providedEnvironment.revisionId
          || providedEnvironment.revision_id
          || readSystemRecord(environmentSnapshot).revisionId
          || readSystemRecord(environmentSnapshot).revision_id,
      ),
      imageDigest: normalizeString(
        providedEnvironment.imageDigest
          || providedEnvironment.image_digest
          || readSystemRecord(environmentSnapshot).imageDigest
          || readSystemRecord(environmentSnapshot).image_digest,
      ),
      snapshotFingerprint: systemContractFingerprint(
        "evaluation_environment_snapshot",
        environmentSnapshot,
        providedEnvironment.snapshotFingerprint || providedEnvironment.snapshot_fingerprint,
      ),
    },
    runtime,
    completeness: {
      agentSnapshot: Object.keys(agentSnapshot).length > 0 || Boolean(providedAgent.configurationFingerprint),
      agentVersion: !targetSnapshot.agentId || Boolean(targetSnapshot.agentVersionId),
      model: model !== null,
      tools: toolContract !== null,
      skills: skillContract !== null,
      guardrail: !targetSnapshot.guardrailId || guardrailSnapshot !== null || Boolean(providedGuardrail.snapshotFingerprint),
      environment: environmentSnapshot !== null || Boolean(providedEnvironment.snapshotFingerprint),
    },
  };
}

export function normalizeDataRow(row, fallbackIndex = 0) {
  const source = row && typeof row === "object" && !Array.isArray(row) ? row : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
    ? source.metadata
    : null;
  const rawSliceIds = [
    ...(Array.isArray(source.sliceIds) ? source.sliceIds : []),
    ...(Array.isArray(source.slice_ids) ? source.slice_ids : []),
    ...(Array.isArray(source.slices) ? source.slices : []),
    ...(Array.isArray(source.tags) ? source.tags : []),
    ...(Array.isArray(metadata?.sliceIds) ? metadata.sliceIds : []),
    ...(Array.isArray(metadata?.slice_ids) ? metadata.slice_ids : []),
    ...(Array.isArray(metadata?.slices) ? metadata.slices : []),
    ...(Array.isArray(metadata?.tags) ? metadata.tags : []),
    source.slice,
    source.sliceId,
    source.slice_id,
  ];
  const sliceIds = Array.from(new Set(rawSliceIds.map(normalizeString).filter(Boolean))).sort();
  const requestedOptimizationRole = normalizeString(
    source.optimizationRole
      || source.optimization_role
      || source.datasetRole
      || source.dataset_role
      || source.split,
  ).toLowerCase();
  const optimizationRole = ["train", "validation", "holdout"].includes(requestedOptimizationRole)
    ? requestedOptimizationRole
    : "train";
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
    optimizationRole,
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
    sliceIds,
    metadata,
    createdAt: normalizeString(source.createdAt || source.created_at) || new Date(Date.now() + fallbackIndex).toISOString(),
    updatedAt: normalizeString(source.updatedAt || source.updated_at || source.createdAt || source.created_at) || new Date().toISOString(),
  };
}

export function normalizeEvaluationSet(record = {}) {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : null;
  const targetBinding = source.targetBinding
    && typeof source.targetBinding === "object"
    && !Array.isArray(source.targetBinding)
    ? source.targetBinding
    : source.target_binding
      && typeof source.target_binding === "object"
      && !Array.isArray(source.target_binding)
      ? source.target_binding
      : null;
  const creator = getCreatorIdentity(source);
  const dataRows = Array.isArray(source.dataRows)
    ? source.dataRows
    : Array.isArray(source.data_rows)
      ? source.data_rows
      : Array.isArray(source.data)
        ? source.data
        : Array.isArray(source.cases)
          ? source.cases
          : [];
  return {
    id: normalizeString(source.id || source.evaluationId || source.evaluation_id) || createEvaluationId("eval_set"),
    name: normalizeString(source.name || source.title) || "Untitled Evaluation",
    description: String(source.description || ""),
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || source.scoringGuidance || source.scoring_guidance || source.rubric || ""),
    passThreshold: normalizePassThreshold(source.passThreshold ?? source.pass_threshold ?? source.threshold ?? 0.8),
    evaluator: normalizeEvaluator(source.evaluator),
    targetBinding,
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

function normalizeEvaluationExecutionTarget(evaluationSet, options = {}) {
  const requested = options.targetBinding
    || options.target_binding
    || options.executionTarget
    || options.execution_target
    || evaluationSet.targetBinding
    || null;
  const source = requested
    && typeof requested === "object"
    && !Array.isArray(requested)
    ? requested
    : {};
  const requestedKind = normalizeString(
    source.kind
      || options.targetKind
      || options.target_kind,
  ).toLowerCase();
  const legacyAgentId = normalizeString(
    options.targetAgentId
      || options.target_agent_id
      || evaluationSet.targetAgentId,
  );
  const kind = ["agent", "function", "metronome", "service_topology", "none"].includes(requestedKind)
    ? requestedKind
    : legacyAgentId
      ? "agent"
      : "none";
  const snapshot = source.snapshot
    && typeof source.snapshot === "object"
    && !Array.isArray(source.snapshot)
    ? source.snapshot
    : {};
  const invocation = source.invocation
    && typeof source.invocation === "object"
    && !Array.isArray(source.invocation)
    ? source.invocation
    : null;
  const targetId = normalizeString(
    source.targetId
      || source.target_id
      || source.id
      || options.targetId
      || options.target_id
      || (kind === "agent" ? legacyAgentId : ""),
  );
  const targetVersionId = normalizeString(
    source.targetVersionId
      || source.target_version_id
      || source.versionId
      || source.version_id
      || options.targetVersionId
      || options.target_version_id
      || (kind === "agent"
        ? options.targetAgentVersionId
          || options.target_agent_version_id
          || options.agentVersionId
          || options.agent_version_id
        : ""),
  );
  const targetVersionNumber = Math.max(
    0,
    Number(
      source.targetVersionNumber
        || source.target_version_number
        || source.versionNumber
        || source.version_number
        || options.targetVersionNumber
        || options.target_version_number
        || (kind === "agent"
          ? options.targetAgentVersionNumber
            || options.target_agent_version_number
            || options.agentVersionNumber
            || options.agent_version_number
          : 0),
    ) || 0,
  );
  return {
    bindingStatus: normalizeString(
      source.bindingStatus || source.binding_status,
    ),
    kind,
    targetId,
    targetVersionId,
    targetVersionNumber,
    targetFingerprint: normalizeString(
      source.targetFingerprint
        || source.target_fingerprint
        || options.controlPlaneTargetFingerprint
        || options.control_plane_target_fingerprint,
    ),
    snapshot,
    invocation,
    environmentId: normalizeString(
      source.environmentId
        || source.environment_id
        || options.environmentId
        || options.environment_id
        || evaluationSet.environmentId,
    ),
  };
}

export function normalizeComparable(value) {
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

export function clampScore(value) {
  if (value === null || value === undefined || (typeof value === "string" && !value.trim())) return null;
  const numericScore = Number(value);
  if (!Number.isFinite(numericScore)) return null;
  return Math.max(0, Math.min(1, numericScore > 1 ? numericScore / 100 : numericScore));
}

export const EVALUATION_ACTIVE_CASE_STATUSES = Object.freeze([
  "queued",
  "running",
  "running_case",
  "waiting_for_case_summary",
  "running_evaluator",
  "scoring",
]);

export const EVALUATION_SCORED_CASE_STATUSES = Object.freeze([
  "completed",
  "passed",
  "failed",
]);

export const EVALUATION_UNSCORED_CASE_STATUSES = Object.freeze([
  "invalid",
  "grader_error",
  "infrastructure_error",
  "cancelled",
  "error",
]);

export function isScoredEvaluationCase(caseItem) {
  const status = normalizeString(caseItem?.status).toLowerCase();
  return EVALUATION_SCORED_CASE_STATUSES.includes(status) && clampScore(caseItem?.score) !== null;
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
    optimizationRole: ["train", "validation", "holdout"].includes(
      normalizeString(source.optimizationRole || source.optimization_role).toLowerCase(),
    )
      ? normalizeString(source.optimizationRole || source.optimization_role).toLowerCase()
      : "train",
    sliceIds: Array.from(new Set(
      (Array.isArray(source.sliceIds)
        ? source.sliceIds
        : Array.isArray(source.slice_ids)
          ? source.slice_ids
          : [])
        .map(normalizeString)
        .filter(Boolean),
    )).sort(),
    actualOutput: String(source.actualOutput || source.actual_output || ""),
    evaluatorOutput: String(source.evaluatorOutput || source.evaluator_output || ""),
    evaluatorReason: String(source.evaluatorReason || source.evaluator_reason || ""),
    evaluatorParseStatus: String(source.evaluatorParseStatus || source.evaluator_parse_status || ""),
    snapshotVersion: String(source.snapshotVersion || source.snapshot_version || ""),
    targetExecution: source.targetExecution
      && typeof source.targetExecution === "object"
      && !Array.isArray(source.targetExecution)
      ? source.targetExecution
      : source.target_execution
        && typeof source.target_execution === "object"
        && !Array.isArray(source.target_execution)
        ? source.target_execution
        : null,
    sourceAssets: Array.isArray(source.sourceAssets)
      ? source.sourceAssets
      : Array.isArray(source.source_assets)
        ? source.source_assets
        : [],
    executionStage: normalizeString(source.executionStage || source.execution_stage),
    failureStage: normalizeString(source.failureStage || source.failure_stage),
    executionAttempt: Math.max(0, Number(source.executionAttempt || source.execution_attempt || 0) || 0),
    startedAt: normalizeString(source.startedAt || source.started_at),
    checkpointedAt: normalizeString(source.checkpointedAt || source.checkpointed_at),
    caseMessageDispatchedAt: normalizeString(source.caseMessageDispatchedAt || source.case_message_dispatched_at),
    evaluatorMessageDispatchedAt: normalizeString(source.evaluatorMessageDispatchedAt || source.evaluator_message_dispatched_at),
    score,
    costTokens: readComputeTokenValue(source),
    costUsd: readUsdCostValue(source),
    costSource: normalizeString(source.costSource || source.cost_source),
    status: [
      ...EVALUATION_ACTIVE_CASE_STATUSES,
      ...EVALUATION_SCORED_CASE_STATUSES,
      ...EVALUATION_UNSCORED_CASE_STATUSES,
    ].includes(status) ? status : "queued",
    latencyMs: Math.max(0, Number(source.latencyMs || source.latency_ms || 0) || 0),
    error: String(source.error || ""),
    createdAt: normalizeString(source.createdAt || source.created_at) || new Date(Date.now() + fallbackIndex).toISOString(),
    completedAt: normalizeString(source.completedAt || source.completed_at),
  };
}

export function recomputeRun(nextRun) {
  const cases = Array.isArray(nextRun.cases) ? nextRun.cases.map((item, index) => normalizeRunCase(item, index)) : [];
  const activeStatuses = new Set(EVALUATION_ACTIVE_CASE_STATUSES);
  const activeCount = cases.filter((item) => activeStatuses.has(item.status)).length;
  const scoredCases = cases.filter(isScoredEvaluationCase);
  const passThreshold = normalizePassThreshold(nextRun.passThreshold ?? nextRun.pass_threshold ?? 0.8);
  const averageScore = scoredCases.length > 0
    ? scoredCases.reduce((sum, item) => sum + item.score, 0) / scoredCases.length
    : null;
  const passedCount = scoredCases.filter((item) => item.score >= passThreshold).length;
  const failedCount = scoredCases.length - passedCount;
  const invalidCount = cases.filter((item) => item.status === "invalid").length;
  const graderErrorCount = cases.filter((item) => item.status === "grader_error").length;
  const infrastructureErrorCount = cases.filter((item) => ["infrastructure_error", "error"].includes(item.status)).length;
  const cancelledCount = cases.filter((item) => item.status === "cancelled").length;
  const unscoredCount = cases.length - scoredCases.length - activeCount;
  const terminalProblemCount = invalidCount
    + graderErrorCount
    + infrastructureErrorCount
    + cancelledCount;
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
    averageScore,
    passRate: scoredCases.length > 0 ? passedCount / scoredCases.length : null,
    scoredCount: scoredCases.length,
    passedCount,
    failedCount,
    invalidCount,
    graderErrorCount,
    infrastructureErrorCount,
    cancelledCount,
    unscoredCount,
    totalCount: cases.length,
    status: activeCount > 0
      ? "running"
      : cases.length > 0 && scoredCases.length === 0
        ? "failed"
        : terminalProblemCount > 0
          ? "completed_with_errors"
          : "completed",
    completedAt: activeCount > 0 ? String(nextRun.completedAt || "") : (String(nextRun.completedAt || "") || new Date().toISOString()),
  };
}

export function createEvaluationRun(evaluationSet, options = {}) {
  const nowIso = new Date().toISOString();
  const evaluatorSource = normalizeEvaluator(options.evaluator || evaluationSet.evaluator);
  const evaluator = normalizeEvaluator({
    ...evaluatorSource,
    agentVersionId: options.evaluatorAgentVersionId
      || options.evaluator_agent_version_id
      || evaluatorSource.agentVersionId,
    agentVersionNumber: options.evaluatorAgentVersionNumber
      || options.evaluator_agent_version_number
      || evaluatorSource.agentVersionNumber,
    agentVersionLabel: options.evaluatorAgentVersionLabel
      || options.evaluator_agent_version_label
      || evaluatorSource.agentVersionLabel,
    agentVersionRevisionId: options.evaluatorAgentVersionRevisionId
      || options.evaluator_agent_version_revision_id
      || evaluatorSource.agentVersionRevisionId,
  });
  const requestedOptimizationRoles = (
    Array.isArray(options.optimizationRoles)
      ? options.optimizationRoles
      : Array.isArray(options.optimization_roles)
        ? options.optimization_roles
        : Array.isArray(options.caseRoles)
          ? options.caseRoles
          : Array.isArray(options.case_roles)
            ? options.case_roles
            : []
  )
    .map((role) => normalizeString(role).toLowerCase())
    .filter((role) => ["train", "validation", "holdout"].includes(role));
  const optimizationRoles = Array.from(new Set(requestedOptimizationRoles));
  const evaluationRows = optimizationRoles.length
    ? evaluationSet.dataRows.filter((row) => optimizationRoles.includes(row.optimizationRole))
    : evaluationSet.dataRows;
  const executionTarget = normalizeEvaluationExecutionTarget(
    evaluationSet,
    options,
  );
  const targetSnapshot = {
    executionTarget,
    agentId: executionTarget.kind === "agent"
      ? executionTarget.targetId
      : "",
    agentVersionId: executionTarget.kind === "agent"
      ? executionTarget.targetVersionId
      : "",
    agentVersionNumber: executionTarget.kind === "agent"
      ? executionTarget.targetVersionNumber
      : 0,
    agentVersionRevisionId: normalizeString(options.targetAgentVersionRevisionId || options.target_agent_version_revision_id || options.agentVersionRevisionId || options.agent_version_revision_id),
    guardrailId: normalizeString(options.targetGuardrailId || options.target_guardrail_id || options.guardrailId || options.guardrail_id),
    guardrailVersionId: normalizeString(options.targetGuardrailVersionId || options.target_guardrail_version_id || options.guardrailVersionId || options.guardrail_version_id),
    environmentType: normalizeString(options.environmentType || evaluationSet.environmentType).toLowerCase() === "project" ? "project" : "computer",
    environmentId: executionTarget.environmentId,
    projectId: normalizeString(options.projectId || evaluationSet.projectId),
  };
  targetSnapshot.systemSnapshot = buildEvaluationSystemSnapshot(options, targetSnapshot);
  const evaluatorSystemSnapshot = evaluator.type === "agent"
    ? buildEvaluationSystemSnapshot({
        systemSnapshot: options.evaluatorSystemSnapshot
          || options.evaluator_system_snapshot,
        targetAgentSnapshot: options.evaluatorAgentSnapshot
          || options.evaluator_agent_snapshot,
        targetAgentInstructions: options.evaluatorAgentInstructions
          || options.evaluator_agent_instructions,
        modelSnapshot: options.evaluatorModelSnapshot
          || options.evaluator_model_snapshot,
        samplingSnapshot: options.evaluatorSamplingSnapshot
          || options.evaluator_sampling_snapshot,
        toolSnapshot: options.evaluatorToolSnapshot
          || options.evaluator_tool_snapshot,
        skillSnapshot: options.evaluatorSkillSnapshot
          || options.evaluator_skill_snapshot,
        environmentSnapshot: options.environmentSnapshot
          || options.environment_snapshot,
        runtimeSnapshot: options.evaluatorRuntimeSnapshot
          || options.evaluator_runtime_snapshot
          || {
            role: "evaluator",
            executionContractVersion: "evaluation_evaluator_v1",
          },
      }, {
        agentId: evaluator.agentId,
        agentVersionId: evaluator.agentVersionId,
        agentVersionNumber: evaluator.agentVersionNumber,
        agentVersionRevisionId: evaluator.agentVersionRevisionId,
        guardrailId: "",
        guardrailVersionId: "",
        environmentType: targetSnapshot.environmentType,
        environmentId: targetSnapshot.environmentId,
        projectId: targetSnapshot.projectId,
      })
    : null;
  const fingerprintRows = (rows) => rows.map((row) => ({
    id: row.id,
    input: row.input,
    expectedOutput: row.expectedOutput,
    evaluationGuidance: row.evaluationGuidance,
    optimizationRole: row.optimizationRole,
    runCount: row.runCount,
    sliceIds: row.sliceIds,
    metadata: row.metadata || null,
  }));
  const datasetFingerprint = createEvaluationFingerprint("evaluation_dataset", {
    schemaVersion: "evaluation_dataset_v1",
    evaluationSetId: evaluationSet.id,
    name: evaluationSet.name,
    evaluationGuidance: evaluationSet.evaluationGuidance,
    passThreshold: normalizePassThreshold(options.passThreshold ?? options.pass_threshold ?? evaluationSet.passThreshold ?? evaluationSet.pass_threshold ?? 0.8),
    rows: fingerprintRows(evaluationSet.dataRows),
  });
  const caseSelectionFingerprint = createEvaluationFingerprint("evaluation_case_selection", {
    datasetFingerprint,
    optimizationRoles,
    rows: fingerprintRows(evaluationRows),
  });
  const evaluatorFingerprint = createEvaluationFingerprint("evaluation_evaluator", {
    schemaVersion: "evaluation_evaluator_v3",
    type: evaluator.type,
    agentId: evaluator.agentId,
    agentVersionId: evaluator.agentVersionId,
    agentVersionRevisionId: evaluator.agentVersionRevisionId,
    systemSnapshot: evaluatorSystemSnapshot,
    code: evaluator.type === "code" ? evaluator.code : "",
    graderId: evaluator.type === "deterministic" ? evaluator.graderId : "",
    configuration: evaluator.type === "deterministic"
      ? evaluator.configuration
      : null,
  });
  const systemFingerprint = createEvaluationFingerprint("evaluation_system", {
    schemaVersion: "evaluation_system_v1",
    ...targetSnapshot,
  });
  const runFingerprint = createEvaluationFingerprint("evaluation_run", {
    schemaVersion: "evaluation_run_v2",
    datasetFingerprint,
    caseSelectionFingerprint,
    evaluatorFingerprint,
    systemFingerprint,
  });
  const datasetVersion = normalizeString(options.datasetVersion || options.dataset_version) || datasetFingerprint;
  const evaluatorVersion = normalizeString(options.evaluatorVersion || options.evaluator_version) || evaluatorFingerprint;
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
    targetAgentId: targetSnapshot.agentId,
    targetAgentName: normalizeString(options.targetAgentName || options.target_agent_name),
    targetAgentPhotoUrl: normalizeString(options.targetAgentPhotoUrl || options.target_agent_photo_url),
    targetAgentVersionId: targetSnapshot.agentVersionId,
    targetAgentVersionNumber: targetSnapshot.agentVersionNumber,
    targetAgentVersionLabel: normalizeString(options.targetAgentVersionLabel || options.target_agent_version_label || options.agentVersionLabel || options.agent_version_label),
    targetAgentVersionRevisionId: targetSnapshot.agentVersionRevisionId,
    targetType: executionTarget.kind,
    targetId: executionTarget.targetId,
    targetVersionId: executionTarget.targetVersionId,
    targetVersionNumber: executionTarget.targetVersionNumber,
    targetFingerprint: executionTarget.targetFingerprint,
    targetInvocation: executionTarget.invocation,
    targetBinding: executionTarget,
    targetGuardrailId: targetSnapshot.guardrailId,
    targetGuardrailName: normalizeString(options.targetGuardrailName || options.target_guardrail_name || options.guardrailName || options.guardrail_name),
    targetGuardrailVersionId: targetSnapshot.guardrailVersionId,
    targetGuardrailVersionNumber: Math.max(0, Number(options.targetGuardrailVersionNumber || options.target_guardrail_version_number || options.guardrailVersionNumber || options.guardrail_version_number || 0) || 0),
    targetGuardrailVersionLabel: normalizeString(options.targetGuardrailVersionLabel || options.target_guardrail_version_label || options.guardrailVersionLabel || options.guardrail_version_label),
    fineTuningJobId: normalizeString(options.fineTuningJobId || options.fine_tuning_job_id),
    fine_tuning_job_id: normalizeString(options.fine_tuning_job_id || options.fineTuningJobId),
    environmentType: targetSnapshot.environmentType,
    environmentId: targetSnapshot.environmentId,
    environmentName: normalizeString(options.environmentName || options.environment_name),
    projectId: targetSnapshot.projectId,
    projectName: normalizeString(options.projectName || options.project_name),
    systemSnapshot: targetSnapshot.systemSnapshot,
    evaluatorSystemSnapshot,
    evaluator,
    optimizationRoles,
    passThreshold: normalizePassThreshold(options.passThreshold ?? options.pass_threshold ?? evaluationSet.passThreshold ?? evaluationSet.pass_threshold ?? 0.8),
    datasetVersion,
    evaluatorVersion,
    datasetFingerprint,
    caseSelectionFingerprint,
    evaluatorFingerprint,
    systemFingerprint,
    runFingerprint,
    metadata: {
      ...(options.metadata && typeof options.metadata === "object" && !Array.isArray(options.metadata) ? options.metadata : {}),
      fineTuningJobId: normalizeString(options.fineTuningJobId || options.fine_tuning_job_id),
      fine_tuning_job_id: normalizeString(options.fine_tuning_job_id || options.fineTuningJobId),
      targetGuardrailId: normalizeString(options.targetGuardrailId || options.target_guardrail_id || options.guardrailId || options.guardrail_id),
      target_guardrail_id: normalizeString(options.target_guardrail_id || options.targetGuardrailId || options.guardrail_id || options.guardrailId),
      fingerprintSchemaVersion: "evaluation_fingerprint_v1",
      datasetFingerprint,
      caseSelectionFingerprint,
      evaluatorFingerprint,
      systemFingerprint,
      runFingerprint,
    },
    cases: evaluationRows
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
        optimizationRole: row.optimizationRole,
        sliceIds: row.sliceIds,
        status: "queued",
        createdAt: nowIso,
      }, index)),
  };
  return recomputeRun(run);
}
