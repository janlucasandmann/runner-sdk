import {
  clampScore,
  createFineTuningId,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readPlainObject,
  sanitizeReferenceText,
} from "./primitives.mjs";
import {
  normalizeFineTuningLimits,
  normalizeFineTuningMetrics,
  normalizeFineTuningObjective,
  normalizeFineTuningPublicationPolicy,
  normalizeFineTuningSuccessPolicy,
} from "./policies.mjs";

const ACTIVE_PHASES = new Set([
  "queued",
  "snapshotting",
  "baseline_queued",
  "baseline_running",
  "optimizing",
  "candidate_ready",
  "verification_queued",
  "verifying",
  "assessing",
  "publishing",
]);

const INACTIVE_PHASES = new Set([
  "planned",
]);

const TERMINAL_PHASES = new Set([
  "completed_target_met",
  "completed_best_effort",
  "awaiting_review",
  "stopped_budget",
  "stopped_timeout",
  "stopped_plateau",
  "cancelled",
  "failed",
]);

export function normalizeFineTuningPhase(value, fallback = "queued") {
  const normalized = normalizeString(value).toLowerCase().replace(/[\s-]+/g, "_");
  if (
    ACTIVE_PHASES.has(normalized)
    || INACTIVE_PHASES.has(normalized)
    || TERMINAL_PHASES.has(normalized)
  ) return normalized;
  const legacy = {
    running: "optimizing",
    analysis: "optimizing",
    analyzing: "optimizing",
    verifying: "verifying",
    completed: "completed_best_effort",
    complete: "completed_best_effort",
    error: "failed",
    canceled: "cancelled",
  }[normalized];
  return legacy || fallback;
}

export function isFineTuningPhaseActive(value) {
  return ACTIVE_PHASES.has(normalizeFineTuningPhase(value));
}

export function isFineTuningPhaseTerminal(value) {
  return TERMINAL_PHASES.has(normalizeFineTuningPhase(value));
}

export function normalizeFineTuningEvaluationTarget(rawTarget = {}, fallbackIndex = 0) {
  const source = readPlainObject(rawTarget);
  const evaluationSetSnapshot = readPlainObject(
    source.evaluationSetSnapshot
      || source.evaluation_set_snapshot
      || source.snapshot,
  );
  const evaluationSetId = normalizeString(
    source.evaluationSetId
      || source.evaluation_set_id
      || source.id
      || evaluationSetSnapshot.id,
  );
  const baselineMode = normalizeString(
    source.baselineMode
      || source.baseline_mode,
  ).toLowerCase() === "existing"
    ? "existing"
    : "fresh";
  const passThreshold = source.passThreshold
    ?? source.pass_threshold
    ?? evaluationSetSnapshot.passThreshold
    ?? evaluationSetSnapshot.pass_threshold
    ?? 0.8;
  return {
    id: evaluationSetId || "evaluation_" + (fallbackIndex + 1),
    evaluationSetId: evaluationSetId || "evaluation_" + (fallbackIndex + 1),
    evaluationSetName: normalizeString(
      source.evaluationSetName
        || source.evaluation_set_name
        || source.name
        || evaluationSetSnapshot.name
        || "Evaluation " + (fallbackIndex + 1),
    ),
    evaluationVersionId: normalizeString(
      source.evaluationVersionId
        || source.evaluation_version_id
        || source.activeVersionId
        || source.active_version_id
        || evaluationSetSnapshot.activeVersionId
        || evaluationSetSnapshot.active_version_id,
    ),
    evaluationVersionNumber: Math.max(0, Number(
      source.evaluationVersionNumber
        || source.evaluation_version_number
        || source.activeVersionNumber
        || source.active_version_number
        || evaluationSetSnapshot.activeVersionNumber
        || evaluationSetSnapshot.active_version_number
        || 0,
    ) || 0),
    evaluationVersionLabel: normalizeString(
      source.evaluationVersionLabel
        || source.evaluation_version_label
        || source.activeVersionLabel
        || source.active_version_label
        || evaluationSetSnapshot.activeVersionLabel
        || evaluationSetSnapshot.active_version_label,
    ),
    baselineMode,
    baselineRunId: normalizeString(
      source.baselineRunId
        || source.baseline_run_id
        || source.fineTuningRunId
        || source.fine_tuning_run_id
        || source.selectedRunId
        || source.selected_run_id,
    ),
    baselineRunLabel: normalizeString(
      source.baselineRunLabel
        || source.baseline_run_label
        || source.fineTuningRunLabel
        || source.fine_tuning_run_label,
    ),
    baselineRunFingerprint: normalizeString(
      source.baselineRunFingerprint
        || source.baseline_run_fingerprint,
    ),
    caseCount: Math.max(0, Number(
      source.caseCount
        || source.case_count
        || evaluationSetSnapshot.dataRows?.length
        || evaluationSetSnapshot.data_rows?.length
        || 0,
    ) || 0),
    required: source.required !== false,
    weight: Math.max(0, Number(source.weight ?? 1) || 1),
    passThreshold,
    successPolicy: normalizeFineTuningSuccessPolicy(
      source.successPolicy || source.success_policy,
      passThreshold,
    ),
    evaluationSetSnapshot,
  };
}

export function normalizeFineTuningConfiguration(rawConfiguration = {}, legacyJob = {}) {
  const source = readPlainObject(rawConfiguration);
  const targetAgentSource = readPlainObject(
    source.targetAgent
      || source.target_agent
      || legacyJob.targetAgent
      || legacyJob.target_agent,
  );
  const fineTunerAgentSource = readPlainObject(
    source.fineTunerAgent
      || source.fine_tuner_agent
      || legacyJob.fineTunerAgent
      || legacyJob.fine_tuner_agent,
  );
  const environmentSource = readPlainObject(source.environment || legacyJob.environment);
  const evaluationSources = Array.isArray(source.evaluationTargets)
    ? source.evaluationTargets
    : Array.isArray(source.evaluation_targets)
      ? source.evaluation_targets
      : Array.isArray(legacyJob.evaluationSets)
        ? legacyJob.evaluationSets
        : Array.isArray(legacyJob.evaluation_sets)
          ? legacyJob.evaluation_sets
          : [];
  const evaluationTargets = evaluationSources
    .map((target, index) => normalizeFineTuningEvaluationTarget(target, index))
    .filter((target) => target.evaluationSetId);
  return {
    schemaVersion: 2,
    kind: "agent_optimization",
    targetAgent: {
      id: normalizeString(
        targetAgentSource.id
          || targetAgentSource.agentId
          || targetAgentSource.agent_id
          || legacyJob.targetAgentId
          || legacyJob.target_agent_id
          || legacyJob.agentId
          || legacyJob.agent_id,
      ),
      name: normalizeString(
        targetAgentSource.name
          || targetAgentSource.label
          || legacyJob.targetAgentName
          || legacyJob.target_agent_name
          || legacyJob.agentName
          || legacyJob.agent_name
          || "Agent",
      ),
      photoUrl: normalizeString(
        targetAgentSource.photoUrl
          || targetAgentSource.photoURL
          || targetAgentSource.avatarUrl
          || legacyJob.targetAgentPhotoUrl
          || legacyJob.target_agent_photo_url,
      ),
      versionId: normalizeString(
        targetAgentSource.versionId
          || targetAgentSource.version_id
          || targetAgentSource.activeVersionId
          || targetAgentSource.active_version_id,
      ),
      versionNumber: Math.max(0, Number(
        targetAgentSource.versionNumber
          || targetAgentSource.version_number
          || targetAgentSource.activeVersionNumber
          || targetAgentSource.active_version_number
          || 0,
      ) || 0),
      versionLabel: normalizeString(
        targetAgentSource.versionLabel
          || targetAgentSource.version_label
          || targetAgentSource.activeVersionLabel
          || targetAgentSource.active_version_label,
      ),
      snapshot: readPlainObject(targetAgentSource.snapshot),
    },
    fineTunerAgent: {
      id: normalizeString(
        fineTunerAgentSource.id
          || fineTunerAgentSource.agentId
          || fineTunerAgentSource.agent_id
          || legacyJob.fineTunerAgentId
          || legacyJob.fine_tuner_agent_id,
      ),
      name: normalizeString(
        fineTunerAgentSource.name
          || fineTunerAgentSource.label
          || legacyJob.fineTunerAgentName
          || legacyJob.fine_tuner_agent_name,
      ),
      photoUrl: normalizeString(
        fineTunerAgentSource.photoUrl
          || fineTunerAgentSource.photoURL
          || fineTunerAgentSource.avatarUrl
          || legacyJob.fineTunerAgentPhotoUrl
          || legacyJob.fine_tuner_agent_photo_url,
      ),
    },
    environment: {
      type: normalizeString(
        environmentSource.type
          || environmentSource.environmentType
          || environmentSource.environment_type
          || legacyJob.environmentType
          || legacyJob.environment_type,
      ).toLowerCase() === "project" ? "project" : "computer",
      id: normalizeString(
        environmentSource.id
          || environmentSource.environmentId
          || environmentSource.environment_id
          || legacyJob.environmentId
          || legacyJob.environment_id,
      ),
      name: normalizeString(
        environmentSource.name
          || environmentSource.label
          || legacyJob.environmentName
          || legacyJob.environment_name
          || "Computer",
      ),
      projectId: normalizeString(
        environmentSource.projectId
          || environmentSource.project_id
          || legacyJob.projectId
          || legacyJob.project_id,
      ),
      revisionId: normalizeString(
        environmentSource.revisionId
          || environmentSource.revision_id
          || environmentSource.versionId
          || environmentSource.version_id
          || legacyJob.environmentRevisionId
          || legacyJob.environment_revision_id,
      ),
      imageDigest: normalizeString(
        environmentSource.imageDigest
          || environmentSource.image_digest
          || environmentSource.containerImageDigest
          || environmentSource.container_image_digest
          || legacyJob.environmentImageDigest
          || legacyJob.environment_image_digest,
      ),
    },
    evaluationTargets,
    objective: normalizeFineTuningObjective(
      source.objective || legacyJob.objective,
      evaluationTargets,
    ),
    limits: normalizeFineTuningLimits(source.limits || legacyJob.limits),
    publicationPolicy: normalizeFineTuningPublicationPolicy(
      source.publicationPolicy
        || source.publication_policy
        || legacyJob.publicationPolicy
        || legacyJob.publication_policy,
    ),
    instructions: String(
      source.instructions
        ?? legacyJob.instructions
        ?? "",
    ),
  };
}

export function normalizeFineTuningRunReference(rawReference = {}, fallbackIndex = 0) {
  const source = readPlainObject(rawReference);
  return {
    evaluationSetId: normalizeString(
      source.evaluationSetId
        || source.evaluation_set_id
        || "evaluation_" + (fallbackIndex + 1),
    ),
    evaluationSetName: normalizeString(
      source.evaluationSetName
        || source.evaluation_set_name
        || "Evaluation " + (fallbackIndex + 1),
    ),
    phase: normalizeString(source.phase || source.kind || "verification") || "verification",
    runId: normalizeString(source.runId || source.run_id || source.afterRunId || source.after_run_id),
    runLabel: normalizeString(source.runLabel || source.run_label || source.afterRunLabel || source.after_run_label),
    baselineRunId: normalizeString(source.baselineRunId || source.baseline_run_id || source.beforeRunId || source.before_run_id),
    baselineRunLabel: normalizeString(source.baselineRunLabel || source.baseline_run_label || source.beforeRunLabel || source.before_run_label),
    status: normalizeString(source.status || "queued") || "queued",
    metrics: normalizeFineTuningMetrics(source.metrics || {
      averageScore: source.averageScore ?? source.average_score ?? source.afterScore ?? source.after_score,
      passRate: source.passRate ?? source.pass_rate,
      passedCount: source.passedCount ?? source.passed_count,
      totalCount: source.totalCount ?? source.total_count,
      costUsd: source.costUsd ?? source.cost_usd ?? source.afterCostUsd ?? source.after_cost_usd,
    }),
    baselineMetrics: normalizeFineTuningMetrics(source.baselineMetrics || {
      averageScore: source.beforeScore ?? source.before_score,
      passRate: source.beforePassRate ?? source.before_pass_rate,
      passedCount: source.beforePassedCount ?? source.before_passed_count,
      totalCount: source.beforeTotalCount ?? source.before_total_count,
      costUsd: source.beforeCostUsd ?? source.before_cost_usd,
    }),
    fingerprint: normalizeString(source.fingerprint || source.runFingerprint || source.run_fingerprint),
    error: normalizeString(source.error || source.message),
  };
}

export function normalizeFineTuningIteration(rawIteration = {}, fallbackNumber = 1) {
  const source = readPlainObject(rawIteration);
  const number = Math.max(0, Math.round(Number(source.number ?? source.iteration ?? fallbackNumber) || fallbackNumber));
  const runReferences = (Array.isArray(source.evaluationRuns)
    ? source.evaluationRuns
    : Array.isArray(source.evaluation_runs)
      ? source.evaluation_runs
      : Array.isArray(source.runReferences)
        ? source.runReferences
        : [])
    .map((reference, index) => normalizeFineTuningRunReference(reference, index));
  return {
    id: normalizeString(source.id || source.iterationId || source.iteration_id)
      || createFineTuningId(number === 0 ? "fine_tune_baseline" : "fine_tune_iteration"),
    number,
    kind: number === 0 ? "baseline" : "optimization",
    status: normalizeFineTuningPhase(source.status || source.phase, number === 0 ? "baseline_queued" : "queued"),
    startedAt: normalizeString(source.startedAt || source.started_at),
    completedAt: normalizeString(source.completedAt || source.completed_at),
    inputAgentVersion: readPlainObject(source.inputAgentVersion || source.input_agent_version),
    optimizerThreadId: normalizeString(
      source.optimizerThreadId
        || source.optimizer_thread_id
        || source.threadId
        || source.thread_id,
    ),
    optimizerThreadTitle: normalizeString(
      source.optimizerThreadTitle
        || source.optimizer_thread_title
        || source.threadTitle
        || source.thread_title,
    ),
    candidateVersion: readPlainObject(source.candidateVersion || source.candidate_version),
    candidateVersionId: normalizeString(
      source.candidateVersionId
        || source.candidate_version_id
        || source.candidateVersion?.id
        || source.candidate_version?.id,
    ),
    candidateSnapshot: readPlainObject(source.candidateSnapshot || source.candidate_snapshot),
    analysisSummary: sanitizeReferenceText(
      source.analysisSummary || source.analysis_summary,
      8000,
    ),
    evaluationRuns: runReferences,
    caseComparisons: (Array.isArray(source.caseComparisons)
      ? source.caseComparisons
      : Array.isArray(source.case_comparisons)
        ? source.case_comparisons
        : [])
      .map((comparison) => ({
        evaluationSetId: normalizeString(comparison?.evaluationSetId || comparison?.evaluation_set_id),
        evaluationSetName: normalizeString(comparison?.evaluationSetName || comparison?.evaluation_set_name),
        statisticalComparison: readPlainObject(
          comparison?.statisticalComparison || comparison?.statistical_comparison,
        ),
        cases: Array.isArray(comparison?.cases) ? comparison.cases : [],
      })),
    metrics: normalizeFineTuningMetrics(source.metrics),
    baselineMetrics: normalizeFineTuningMetrics(source.baselineMetrics || source.baseline_metrics),
    decision: normalizeString(source.decision || "pending") || "pending",
    decisionReason: normalizeString(source.decisionReason || source.decision_reason),
    decisionEvidence: readPlainObject(source.decisionEvidence || source.decision_evidence),
    targetMet: source.targetMet === true || source.target_met === true,
    accepted: source.accepted === true,
    costTokens: normalizeTokenCount(source.costTokens ?? source.cost_tokens),
    costUsd: normalizeUsdCost(source.costUsd ?? source.cost_usd),
    error: normalizeString(source.error || source.message),
  };
}

export function normalizeFineTuningEvent(rawEvent = {}, fallbackIndex = 0) {
  const source = readPlainObject(rawEvent);
  return {
    id: normalizeString(source.id || source.eventId || source.event_id)
      || createFineTuningId("fine_tune_event"),
    type: normalizeString(source.type || source.event || "status"),
    phase: normalizeFineTuningPhase(source.phase || source.status, "queued"),
    message: normalizeString(source.message || source.label),
    iterationNumber: Math.max(0, Number(source.iterationNumber ?? source.iteration_number ?? 0) || 0),
    progressCurrent: Math.max(0, Number(source.progressCurrent ?? source.progress_current ?? 0) || 0),
    progressTotal: Math.max(0, Number(source.progressTotal ?? source.progress_total ?? 0) || 0),
    createdAt: normalizeString(source.createdAt || source.created_at)
      || new Date(Date.now() + fallbackIndex).toISOString(),
    metadata: readPlainObject(source.metadata),
  };
}

export function normalizeFineTuningCostEntry(rawEntry = {}, fallbackIndex = 0) {
  const source = readPlainObject(rawEntry);
  return {
    id: normalizeString(source.id || source.entryId || source.entry_id)
      || createFineTuningId("fine_tune_cost"),
    phase: normalizeString(source.phase || source.kind || "unknown"),
    iterationNumber: Math.max(0, Number(source.iterationNumber ?? source.iteration_number ?? 0) || 0),
    evaluationSetId: normalizeString(source.evaluationSetId || source.evaluation_set_id),
    referenceId: normalizeString(source.referenceId || source.reference_id || source.runId || source.threadId),
    amountUsd: normalizeUsdCost(source.amountUsd ?? source.amount_usd ?? source.costUsd ?? source.cost_usd),
    amountTokens: normalizeTokenCount(source.amountTokens ?? source.amount_tokens ?? source.costTokens ?? source.cost_tokens),
    createdAt: normalizeString(source.createdAt || source.created_at)
      || new Date(Date.now() + fallbackIndex).toISOString(),
  };
}

export function migrateLegacyFineTuningIterations(job = {}) {
  const source = readPlainObject(job);
  const existingIterations = Array.isArray(source.iterations)
    ? source.iterations.map((iteration, index) => normalizeFineTuningIteration(iteration, index))
    : [];
  if (existingIterations.length) return existingIterations;
  const legacyReferences = Array.isArray(source.evaluationRuns) ? source.evaluationRuns : [];
  const baselineReferences = legacyReferences.map((reference, index) => {
    const normalized = normalizeFineTuningRunReference({
      ...reference,
      phase: "baseline",
      runId: reference?.beforeRunId || reference?.before_run_id,
      runLabel: reference?.beforeRunLabel || reference?.before_run_label,
      averageScore: reference?.beforeScore || reference?.before_score,
      costUsd: reference?.beforeCostUsd || reference?.before_cost_usd,
    }, index);
    return {
      ...normalized,
      status: normalized.runId ? "completed" : "not_run",
    };
  });
  const iterations = [];
  if (baselineReferences.some((reference) => reference.runId)) {
    iterations.push(normalizeFineTuningIteration({
      id: source.id ? source.id + "_baseline" : "",
      number: 0,
      status: "completed_best_effort",
      startedAt: source.createdAt || source.created_at,
      completedAt: source.createdAt || source.created_at,
      evaluationRuns: baselineReferences,
      metrics: {
        averageScore: source.beforeScore ?? source.before_score,
        costUsd: baselineReferences.reduce((sum, reference) => sum + reference.metrics.costUsd, 0),
      },
      decision: "baseline",
      accepted: true,
    }, 0));
  }
  const afterReferences = legacyReferences
    .map((reference, index) => normalizeFineTuningRunReference(reference, index))
    .filter((reference) => reference.runId);
  if (
    afterReferences.length
    || source.threadId
    || source.thread_id
    || source.createdAgentVersionId
    || source.created_agent_version_id
  ) {
    iterations.push(normalizeFineTuningIteration({
      id: source.id ? source.id + "_iteration_1" : "",
      number: 1,
      status: normalizeFineTuningPhase(source.status, "completed_best_effort"),
      startedAt: source.createdAt || source.created_at,
      completedAt: source.updatedAt || source.updated_at,
      optimizerThreadId: source.threadId || source.thread_id,
      optimizerThreadTitle: source.threadTitle || source.thread_title,
      candidateVersion: source.createdAgentVersion || source.created_agent_version,
      candidateVersionId: source.createdAgentVersionId || source.created_agent_version_id,
      candidateSnapshot: source.afterAgentSnapshot || source.after_agent_snapshot,
      analysisSummary: source.analysisSummary || source.analysis_summary,
      evaluationRuns: afterReferences,
      baselineMetrics: {
        averageScore: source.beforeScore ?? source.before_score,
      },
      metrics: {
        averageScore: source.afterScore ?? source.after_score,
        costUsd: source.costUsd ?? source.cost_usd,
      },
      decision: Number(source.afterScore ?? source.after_score ?? 0) >= Number(source.beforeScore ?? source.before_score ?? 0)
        ? "accepted"
        : "rejected",
      accepted: Number(source.afterScore ?? source.after_score ?? 0) >= Number(source.beforeScore ?? source.before_score ?? 0),
    }, 1));
  }
  return iterations;
}

export function appendFineTuningEvent(job, event) {
  const events = [
    ...(Array.isArray(job?.events) ? job.events : []),
    normalizeFineTuningEvent(event),
  ];
  return events.slice(-500);
}

export function appendFineTuningCost(job, entry) {
  const normalizedEntry = normalizeFineTuningCostEntry(entry);
  const existing = Array.isArray(job?.costLedger) ? job.costLedger : [];
  const duplicate = existing.some((candidate) => (
    normalizeString(candidate?.phase) === normalizedEntry.phase
    && Number(candidate?.iterationNumber || 0) === normalizedEntry.iterationNumber
    && normalizeString(candidate?.referenceId) === normalizedEntry.referenceId
    && normalizedEntry.referenceId
  ));
  return duplicate ? existing : [...existing, normalizedEntry];
}

export function buildFineTuningLegacyRunReferences(iterations = []) {
  const normalizedIterations = (Array.isArray(iterations) ? iterations : [])
    .map((iteration, index) => normalizeFineTuningIteration(iteration, index));
  const baselineIteration = normalizedIterations.find((iteration) => iteration.number === 0);
  const candidateIterations = normalizedIterations.filter((iteration) => iteration.number > 0);
  const bestIteration = candidateIterations.find((iteration) => iteration.decision === "accepted" && iteration.targetMet)
    || candidateIterations.filter((iteration) => iteration.accepted).slice(-1)[0]
    || candidateIterations.slice(-1)[0];
  const baselineBySet = new Map(
    (baselineIteration?.evaluationRuns || []).map((reference) => [reference.evaluationSetId, reference]),
  );
  return (bestIteration?.evaluationRuns || baselineIteration?.evaluationRuns || []).map((reference) => {
    const baseline = baselineBySet.get(reference.evaluationSetId) || reference;
    return {
      evaluationSetId: reference.evaluationSetId,
      evaluationSetName: reference.evaluationSetName,
      beforeRunId: baseline.runId || baseline.baselineRunId,
      beforeRunLabel: baseline.runLabel || baseline.baselineRunLabel || "Baseline",
      beforeScore: baseline.metrics.averageScore || baseline.baselineMetrics.averageScore,
      beforeCostUsd: baseline.metrics.costUsd || baseline.baselineMetrics.costUsd,
      afterRunId: bestIteration ? reference.runId : "",
      afterRunLabel: bestIteration ? reference.runLabel : "",
      afterScore: bestIteration ? reference.metrics.averageScore : 0,
      afterCostUsd: bestIteration ? reference.metrics.costUsd : 0,
      status: bestIteration ? reference.status : baseline.status,
      error: reference.error,
    };
  });
}
