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
  normalizePersonIdentity,
} from "./primitives.mjs";

import {
  readComputeTokenValue,
  readUsdCostValue,
} from "./thread-data.mjs";
import {
  buildFineTuningLegacyRunReferences,
  migrateLegacyFineTuningIterations,
  normalizeFineTuningConfiguration,
  normalizeFineTuningCostEntry,
  normalizeFineTuningEvent,
  normalizeFineTuningPhase,
} from "./iterations.mjs";
import {
  summarizeFineTuningBudget,
} from "./policies.mjs";

export function compactAgentVersionReference(version) {
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

function normalizeFineTuningPublicationDecision(value) {
  const source = readPlainObject(value);
  if (!Object.keys(source).length) return {};
  const rawStatus = normalizeString(source.status || source.decision).toLowerCase();
  const status = ["pending", "approved", "rejected", "not_applicable"].includes(rawStatus)
    ? rawStatus
    : "pending";
  const actor = readPlainObject(source.actor);
  return {
    schemaVersion: "agent_optimization_publication_decision_v1",
    status,
    decisionType: normalizeString(
      source.decisionType || source.decision_type,
    ) || (status === "pending" ? "manual_review" : "policy"),
    mode: normalizeString(source.mode),
    reason: sanitizeReferenceText(source.reason, 1000),
    policyId: normalizeString(source.policyId || source.policy_id),
    actor: Object.keys(actor).length
      ? {
          ...normalizePersonIdentity(actor),
          type: normalizeString(actor.type) || "user",
        }
      : null,
    candidateVersionId: normalizeString(
      source.candidateVersionId || source.candidate_version_id,
    ),
    iterationId: normalizeString(source.iterationId || source.iteration_id),
    evidenceFingerprint: normalizeString(
      source.evidenceFingerprint || source.evidence_fingerprint,
    ),
    evidenceSchemaVersion: normalizeString(
      source.evidenceSchemaVersion || source.evidence_schema_version,
    ),
    createdAt: normalizeString(source.createdAt || source.created_at),
    evaluatedAt: normalizeString(source.evaluatedAt || source.evaluated_at),
    publishedAt: normalizeString(source.publishedAt || source.published_at),
  };
}

export function normalizeFineTuningJobEvaluationSetReferences(job) {
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

export function compactFineTuningJobRecord(job) {
  const incomingSource = readPlainObject(job);
  const incomingMetadata = readPlainObject(incomingSource.metadata);
  const persistedOrchestrationState = readPlainObject(
    incomingMetadata.fineTuningOrchestrationState,
  );
  const source = {
    ...persistedOrchestrationState,
    ...incomingSource,
    metadata: incomingMetadata,
  };
  const metadata = compactFineTuningReferenceMetadata(incomingMetadata);
  const createdAgentVersion = compactAgentVersionReference(source.createdAgentVersion || source.created_agent_version);
  const configuration = normalizeFineTuningConfiguration(
    source.configuration || source.config,
    source,
  );
  const configuredEvaluationSets = configuration.evaluationTargets.map((target) => ({
    id: target.evaluationSetId,
    name: target.evaluationSetName,
    activeVersionId: target.evaluationVersionId,
    activeVersionNumber: target.evaluationVersionNumber,
    activeVersionLabel: target.evaluationVersionLabel,
    fineTuningRunId: target.baselineRunId,
    fineTuningRunLabel: target.baselineRunLabel,
    caseCount: target.caseCount,
  }));
  const evaluationSets = normalizeFineTuningJobEvaluationSetReferences(source);
  const resolvedEvaluationSets = evaluationSets.length ? evaluationSets : configuredEvaluationSets;
  const iterations = migrateLegacyFineTuningIterations(source);
  const legacyEvaluationRuns = buildFineTuningLegacyRunReferences(iterations);
  const evaluationRuns = Array.isArray(source.evaluationRuns)
    ? source.evaluationRuns
    : Array.isArray(source.evaluation_runs)
      ? source.evaluation_runs
      : legacyEvaluationRuns;
  const diffFiles = Array.isArray(source.diffFiles)
    ? source.diffFiles
    : Array.isArray(source.diff_files)
      ? source.diff_files
      : [];
  const id = normalizeString(source.id || source.jobId || source.job_id || metadata.fineTuningJobId || metadata.fine_tuning_job_id);
  const nowIso = new Date().toISOString();
  const events = (Array.isArray(source.events) ? source.events : [])
    .map((event, index) => normalizeFineTuningEvent(event, index))
    .slice(-500);
  const costLedger = (Array.isArray(source.costLedger)
    ? source.costLedger
    : Array.isArray(source.cost_ledger)
      ? source.cost_ledger
      : [])
    .map((entry, index) => normalizeFineTuningCostEntry(entry, index));
  const ledgerCostUsd = costLedger.reduce((sum, entry) => sum + entry.amountUsd, 0);
  const jobCostUsd = ledgerCostUsd || readUsdCostValue(source);
  const jobCostTokens = readComputeTokenValue(source) || normalizeTokenCount(jobCostUsd * FINE_TUNING_CT_PER_DOLLAR);
  const phase = normalizeFineTuningPhase(
    source.phase
      || source.executionPhase
      || source.execution_phase
      || source.status,
    "queued",
  );
  const compactJob = {
    id,
    schemaVersion: 2,
    kind: "agent_optimization",
    name: normalizeString(source.name || source.title || metadata.fineTuningJobName || metadata.fine_tuning_job_name || "Optimization Job"),
    status: normalizeString(source.status || metadata.fineTuningStatus || metadata.fine_tuning_status || "running") || "running",
    phase,
    stopReason: normalizeString(source.stopReason || source.stop_reason),
    targetMet: source.targetMet === true || source.target_met === true,
    createdAt: normalizeString(source.createdAt || source.created_at || metadata.fineTuningCreatedAt || metadata.fine_tuning_created_at || nowIso),
    updatedAt: normalizeString(source.updatedAt || source.updated_at || metadata.fineTuningUpdatedAt || metadata.fine_tuning_updated_at || source.createdAt || source.created_at || nowIso),
    agentId: normalizeString(source.agentId || source.agent_id || source.targetAgentId || source.target_agent_id || configuration.targetAgent.id || metadata.targetAgentId || metadata.target_agent_id),
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id || configuration.targetAgent.id || metadata.targetAgentId || metadata.target_agent_id),
    agentName: normalizeString(source.agentName || source.agent_name || source.targetAgentName || source.target_agent_name || configuration.targetAgent.name || metadata.targetAgentName || metadata.target_agent_name || "Agent"),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name || configuration.targetAgent.name || metadata.targetAgentName || metadata.target_agent_name || "Agent"),
    agentPhotoUrl: normalizeString(source.agentPhotoUrl || source.agent_photo_url || source.targetAgentPhotoUrl || source.target_agent_photo_url || configuration.targetAgent.photoUrl || metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || configuration.targetAgent.photoUrl || metadata.targetAgentPhotoUrl || metadata.target_agent_photo_url),
    conductedBy: source.conductedBy || source.conducted_by || metadata.conductedBy || metadata.conducted_by || {},
    createdBy: source.createdBy || source.created_by || metadata.createdBy || metadata.created_by || source.conductedBy || source.conducted_by || metadata.conductedBy || metadata.conducted_by || {},
    fineTunerAgentId: normalizeString(source.fineTunerAgentId || source.fine_tuner_agent_id || configuration.fineTunerAgent.id || metadata.fineTunerAgentId || metadata.fine_tuner_agent_id),
    fineTunerAgentName: normalizeString(source.fineTunerAgentName || source.fine_tuner_agent_name || configuration.fineTunerAgent.name || metadata.fineTunerAgentName || metadata.fine_tuner_agent_name),
    fineTunerAgentPhotoUrl: normalizeString(source.fineTunerAgentPhotoUrl || source.fine_tuner_agent_photo_url || configuration.fineTunerAgent.photoUrl || metadata.fineTunerAgentPhotoUrl || metadata.fine_tuner_agent_photo_url),
    environmentType: configuration.environment.type,
    environmentId: normalizeString(source.environmentId || source.environment_id || source.computerId || source.computer_id || configuration.environment.id || metadata.environmentId || metadata.environment_id),
    environmentName: normalizeString(source.environmentName || source.environment_name || configuration.environment.name || metadata.environmentName || metadata.environment_name || "Computer"),
    projectId: configuration.environment.projectId,
    evaluationSets: resolvedEvaluationSets,
    evaluationSetIds: resolvedEvaluationSets.map((set) => set.id),
    configuration,
    description: sanitizeReferenceText(
      Object.prototype.hasOwnProperty.call(source, "description")
        ? source.description ?? ""
        : metadata.description || "",
      4000,
    ),
    instructions: sanitizeReferenceText(source.instructions, 4000),
    verifyAfter: true,
    threadId: normalizeString(source.threadId || source.thread_id || metadata.threadId || metadata.thread_id || metadata.fineTuningThreadId || metadata.fine_tuning_thread_id),
    threadTitle: normalizeString(source.threadTitle || source.thread_title || metadata.threadTitle || metadata.thread_title || "Optimization Thread"),
    beforeScore: clampScore(source.beforeScore ?? source.before_score ?? metadata.beforeScore ?? metadata.before_score ?? 0),
    afterScore: clampScore(source.afterScore ?? source.after_score ?? metadata.afterScore ?? metadata.after_score ?? 0),
    improvementScore: clampScore(source.improvementScore ?? source.improvement_score ?? metadata.improvementScore ?? metadata.improvement_score ?? 0),
    costTokens: jobCostTokens,
    costUsd: jobCostUsd || computeTokensToUsd(jobCostTokens),
    fineTuningCostUsd: normalizeUsdCost(source.fineTuningCostUsd ?? source.fine_tuning_cost_usd ?? metadata.fineTuningCostUsd ?? metadata.fine_tuning_cost_usd),
    verificationCostUsd: normalizeUsdCost(source.verificationCostUsd ?? source.verification_cost_usd ?? metadata.verificationCostUsd ?? metadata.verification_cost_usd),
    analysisSummary: sanitizeReferenceText(source.analysisSummary || source.analysis_summary || metadata.analysisSummary || metadata.analysis_summary || "", 2400),
    evaluationRuns,
    iterations,
    currentIteration: Math.max(
      0,
      Number(source.currentIteration ?? source.current_iteration)
        || iterations.reduce((maximum, iteration) => Math.max(maximum, iteration.number), 0),
    ),
    bestIterationId: normalizeString(
      source.bestIterationId
        || source.best_iteration_id
        || iterations.filter((iteration) => iteration.accepted).slice(-1)[0]?.id,
    ),
    events,
    costLedger,
    execution: readPlainObject(source.execution),
    diffFiles,
    createdAgentVersion,
    createdAgentVersionId: normalizeString(source.createdAgentVersionId || source.created_agent_version_id || createdAgentVersion?.id || metadata.createdAgentVersionId || metadata.created_agent_version_id),
    agentVersionCreationStatus: normalizeString(source.agentVersionCreationStatus || source.agent_version_creation_status || createdAgentVersion?.status || metadata.agentVersionCreationStatus || metadata.agent_version_creation_status || "pending") || "pending",
    agentVersionError: normalizeString(source.agentVersionError || source.agent_version_error),
    publicationDecision: normalizeFineTuningPublicationDecision(
      source.publicationDecision || source.publication_decision,
    ),
    metadata: {
      ...metadata,
      fineTuningJobId: id,
      fine_tuning_job_id: id,
    },
    error: normalizeString(source.error || source.message),
  };
  compactJob.metadata = {
    ...compactJob.metadata,
    fineTuningOrchestrationState: {
      schemaVersion: compactJob.schemaVersion,
      kind: compactJob.kind,
      phase: compactJob.phase,
      stopReason: compactJob.stopReason,
      targetMet: compactJob.targetMet,
      configuration: compactJob.configuration,
      iterations: compactJob.iterations,
      currentIteration: compactJob.currentIteration,
      bestIterationId: compactJob.bestIterationId,
      events: compactJob.events,
      costLedger: compactJob.costLedger,
      execution: compactJob.execution,
      description: compactJob.description,
      conductedBy: compactJob.conductedBy,
      createdBy: compactJob.createdBy,
      fineTunerAgentPhotoUrl: compactJob.fineTunerAgentPhotoUrl,
      agentVersionCreationStatus: compactJob.agentVersionCreationStatus,
      agentVersionError: compactJob.agentVersionError,
      publicationDecision: compactJob.publicationDecision,
      error: compactJob.error,
    },
  };
  compactJob.budget = summarizeFineTuningBudget(compactJob);
  return compactJob;
}

export function compactFineTuningJobOverviewRecord(job) {
  const compactJob = compactFineTuningJobRecord(job);
  return {
    id: compactJob.id,
    name: compactJob.name,
    status: compactJob.status,
    createdAt: compactJob.createdAt,
    updatedAt: compactJob.updatedAt,
    agentId: compactJob.agentId,
    targetAgentId: compactJob.targetAgentId,
    agentName: compactJob.agentName,
    targetAgentName: compactJob.targetAgentName,
    agentPhotoUrl: compactJob.agentPhotoUrl,
    targetAgentPhotoUrl: compactJob.targetAgentPhotoUrl,
    conductedBy: compactJob.conductedBy,
    createdBy: compactJob.createdBy,
    environmentId: compactJob.environmentId,
    environmentName: compactJob.environmentName,
    evaluationSets: compactJob.evaluationSets,
    evaluationSetIds: compactJob.evaluationSetIds,
    evaluationSetCount: compactJob.evaluationSets.length,
    beforeScore: compactJob.beforeScore,
    afterScore: compactJob.afterScore,
    improvementScore: compactJob.improvementScore,
    phase: compactJob.phase,
    stopReason: compactJob.stopReason,
    targetMet: compactJob.targetMet,
    currentIteration: compactJob.currentIteration,
    bestIterationId: compactJob.bestIterationId,
    budget: compactJob.budget,
  };
}

export function mergeFineTuningJobRecords(existingJob, incomingJob) {
  const incomingSource = readPlainObject(incomingJob);
  const incomingMetadata = readPlainObject(incomingSource.metadata);
  const incomingHasExplicitStatus = Object.prototype.hasOwnProperty.call(incomingSource, "status")
    || Object.prototype.hasOwnProperty.call(incomingSource, "fineTuningStatus")
    || Object.prototype.hasOwnProperty.call(incomingSource, "fine_tuning_status")
    || Object.prototype.hasOwnProperty.call(incomingMetadata, "fineTuningStatus")
    || Object.prototype.hasOwnProperty.call(incomingMetadata, "fine_tuning_status");
  const incomingHasExplicitDescription = Object.prototype.hasOwnProperty.call(incomingSource, "description");
  const incomingHasExplicitInstructions = Object.prototype.hasOwnProperty.call(incomingSource, "instructions");
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
    description: incomingHasExplicitDescription ? incoming.description : existing.description,
    instructions: incomingHasExplicitInstructions ? incoming.instructions : existing.instructions,
    metadata: {
      ...readPlainObject(existing.metadata),
      ...readPlainObject(incoming.metadata),
    },
    threadId: incoming.threadId || existing.threadId,
    threadTitle: incoming.threadTitle || existing.threadTitle,
    evaluationSets: incoming.evaluationSets.length ? incoming.evaluationSets : existing.evaluationSets,
    evaluationRuns: incoming.evaluationRuns.length ? incoming.evaluationRuns : existing.evaluationRuns,
    configuration: incoming.configuration?.evaluationTargets?.length
      ? incoming.configuration
      : existing.configuration,
    iterations: incoming.iterations.length ? incoming.iterations : existing.iterations,
    events: incoming.events.length ? incoming.events : existing.events,
    costLedger: incoming.costLedger.length ? incoming.costLedger : existing.costLedger,
    execution: Object.keys(incoming.execution || {}).length ? incoming.execution : existing.execution,
    publicationDecision: Object.keys(incoming.publicationDecision || {}).length
      ? incoming.publicationDecision
      : existing.publicationDecision,
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
