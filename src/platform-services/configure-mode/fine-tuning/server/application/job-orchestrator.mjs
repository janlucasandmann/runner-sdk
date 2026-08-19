import { createHash } from "node:crypto";

import {
  appendFineTuningCost,
  appendFineTuningEvent,
  buildFineTuningCaseComparisons,
  buildFineTuningStatisticalComparison,
  buildFineTuningLegacyRunReferences,
  evaluateFineTuningObjective,
  isFineTuningPhaseActive,
  normalizeFineTuningConfiguration,
  normalizeFineTuningIteration,
  normalizeFineTuningMetrics,
  normalizeFineTuningRunReference,
  summarizeFineTuningBudget,
} from "../domain/index.mjs";
import {
  buildFineTuningPublicationDecision,
  resolveFineTuningPublicationCandidate,
} from "../domain/publication.mjs";
import {
  buildFineTuningPrompt,
  parseFineTuningOptimizerResult,
} from "../domain/orchestration.mjs";
import {
  clampScore,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readPlainObject,
} from "../domain/primitives.mjs";

function stableId(prefix, ...parts) {
  const digest = createHash("sha256")
    .update(parts.map((part) => normalizeString(part)).join(":"))
    .digest("hex")
    .slice(0, 20);
  return `${prefix}_${digest}`;
}

function average(values) {
  const numbers = values.map(Number).filter(Number.isFinite);
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function normalizeOptimizationRoles(value) {
  return (Array.isArray(value) ? value : [])
    .map((role) => normalizeString(role).toLowerCase())
    .filter((role) => ["train", "validation", "holdout"].includes(role));
}

function runMetrics(run, requestedRoles = []) {
  const source = readPlainObject(run);
  const explicitRoles = normalizeOptimizationRoles(requestedRoles);
  const runRoles = normalizeOptimizationRoles(source.optimizationRoles || source.optimization_roles);
  const roles = explicitRoles.length ? explicitRoles : runRoles;
  const allCases = Array.isArray(source.cases) ? source.cases : [];
  const cases = roles.length
    ? allCases.filter((caseItem) => roles.includes(
        normalizeString(caseItem?.optimizationRole || caseItem?.optimization_role || "train").toLowerCase(),
      ))
    : allCases;
  const scoredCases = cases.filter((caseItem) => {
    const status = normalizeString(caseItem?.status).toLowerCase();
    const rawScore = caseItem?.score;
    return ["completed", "passed", "failed"].includes(status)
      && rawScore !== null
      && rawScore !== undefined
      && rawScore !== ""
      && Number.isFinite(Number(rawScore));
  });
  const shouldDeriveFromCases = roles.length > 0 || cases.length > 0;
  const passThreshold = clampScore(source.passThreshold ?? source.pass_threshold ?? 0.8, 0.8);
  const totalCount = shouldDeriveFromCases
    ? scoredCases.length
    : Math.max(0, Number(source.scoredCount ?? source.scored_count ?? source.totalCount ?? source.total_count ?? 0) || 0);
  const passedCount = shouldDeriveFromCases
    ? scoredCases.filter((caseItem) => clampScore(caseItem.score) >= passThreshold).length
    : Math.max(0, Number(source.passedCount ?? source.passed_count ?? 0) || 0);
  const averageScore = shouldDeriveFromCases && scoredCases.length
    ? average(scoredCases.map((caseItem) => clampScore(caseItem.score)))
    : source.averageScore ?? source.average_score;
  const latencyValues = scoredCases
    .map((caseItem) => caseItem?.latencyMs ?? caseItem?.latency_ms)
    .filter((value) => Number.isFinite(Number(value)))
    .map(Number);
  const costEvidenceAvailable = source.costEvidenceAvailable === true
    || source.cost_evidence_available === true
    || Boolean(normalizeString(source.costSource || source.cost_source))
    || (
      scoredCases.length > 0
      && scoredCases.every((caseItem) => Boolean(
        normalizeString(caseItem?.costSource || caseItem?.cost_source),
      ))
    );
  const latencyEvidenceAvailable = source.latencyEvidenceAvailable === true
    || source.latency_evidence_available === true
    || (scoredCases.length > 0 && latencyValues.length === scoredCases.length);
  return normalizeFineTuningMetrics({
    averageScore,
    passRate: shouldDeriveFromCases
      ? (totalCount > 0 ? passedCount / totalCount : 0)
      : source.passRate ?? source.pass_rate ?? (totalCount > 0 ? passedCount / totalCount : 0),
    passedCount,
    totalCount,
    costUsd: source.costUsd ?? source.cost_usd,
    averageLatencyMs: latencyEvidenceAvailable
      ? average(latencyValues)
      : null,
    costEvidenceAvailable,
    latencyEvidenceAvailable,
  });
}

function aggregateMetrics(runs, requestedRolesByRun = []) {
  const metrics = (Array.isArray(runs) ? runs : []).map((run, index) => (
    runMetrics(run, requestedRolesByRun[index] || [])
  ));
  const totalCount = metrics.reduce((sum, item) => sum + item.totalCount, 0);
  const totalCostUsd = metrics.reduce((sum, item) => sum + item.costUsd, 0);
  const costEvidenceAvailable = metrics.length > 0
    && metrics.every((item) => item.costEvidenceAvailable);
  const latencyEvidenceAvailable = metrics.length > 0
    && totalCount > 0
    && metrics.every((item) => item.latencyEvidenceAvailable && item.totalCount > 0);
  const passedCount = metrics.reduce((sum, item) => sum + item.passedCount, 0);
  return normalizeFineTuningMetrics({
    averageScore: totalCount > 0
      ? metrics.reduce(
          (sum, item) => sum + item.averageScore * item.totalCount,
          0,
        ) / totalCount
      : 0,
    passRate: totalCount > 0 ? passedCount / totalCount : 0,
    passedCount,
    totalCount,
    costUsd: totalCostUsd,
    costUsdPerCase: costEvidenceAvailable && totalCount > 0
      ? totalCostUsd / totalCount
      : null,
    averageLatencyMs: latencyEvidenceAvailable
      ? metrics.reduce(
          (sum, item) => sum + item.averageLatencyMs * item.totalCount,
          0,
        ) / totalCount
      : null,
    costEvidenceAvailable,
    latencyEvidenceAvailable,
  });
}

function successPolicyForTarget(job, target) {
  const objective = readPlainObject(job?.configuration?.objective);
  return objective.mode === "custom"
    ? readPlainObject(objective.successPolicy)
    : readPlainObject(target?.successPolicy);
}

function statusForPhase(phase) {
  if (phase === "failed") return "error";
  if (phase === "cancelled") return "cancelled";
  if (phase === "awaiting_review") return "awaiting_review";
  if (phase.startsWith("completed_") || phase.startsWith("stopped_")) return "completed";
  return "running";
}

function buildRunReference(target, run, phase, baselineRun = null) {
  const runRoles = normalizeOptimizationRoles(run?.optimizationRoles || run?.optimization_roles);
  return normalizeFineTuningRunReference({
    evaluationSetId: target.evaluationSetId,
    evaluationSetName: target.evaluationSetName,
    phase,
    runId: run?.id,
    runLabel: run?.label,
    baselineRunId: baselineRun?.id,
    baselineRunLabel: baselineRun?.label,
    status: run?.status,
    metrics: runMetrics(run),
    baselineMetrics: runMetrics(baselineRun, runRoles),
    fingerprint: run?.runFingerprint
      || run?.run_fingerprint
      || run?.metadata?.runFingerprint
      || run?.metadata?.run_fingerprint
      || run?.metadata?.fineTuningFingerprint
      || run?.metadata?.fine_tuning_fingerprint,
    error: run?.error,
  });
}

function getTargetCaseRoles(target, phase) {
  const rows = Array.isArray(target?.evaluationSetSnapshot?.dataRows)
    ? target.evaluationSetSnapshot.dataRows
    : Array.isArray(target?.evaluationSetSnapshot?.data_rows)
      ? target.evaluationSetSnapshot.data_rows
      : [];
  const availableRoles = Array.from(new Set(rows.map((row) => {
    const role = normalizeString(row?.optimizationRole || row?.optimization_role || "train").toLowerCase();
    return ["train", "validation", "holdout"].includes(role) ? role : "train";
  })));
  if (phase === "verification") {
    const optimizationRoles = availableRoles.filter((role) => role !== "holdout");
    return optimizationRoles;
  }
  if (phase === "final" || phase === "final_baseline") {
    return availableRoles.includes("holdout")
      ? ["holdout"]
      : availableRoles.filter((role) => role !== "holdout");
  }
  return availableRoles.filter((role) => role !== "holdout");
}

function hasHoldoutCases(job) {
  return job.configuration.evaluationTargets.some((target) => (
    getTargetCaseRoles(target, "final").includes("holdout")
  ));
}

function buildOptimizerEvaluationSetSnapshot(target) {
  const snapshot = readPlainObject(target?.evaluationSetSnapshot);
  const rows = Array.isArray(snapshot.dataRows)
    ? snapshot.dataRows
    : Array.isArray(snapshot.data_rows)
      ? snapshot.data_rows
      : [];
  return {
    ...snapshot,
    dataRows: rows.filter((row) => (
      normalizeString(row?.optimizationRole || row?.optimization_role || "train").toLowerCase() !== "holdout"
    )),
    data_rows: undefined,
  };
}

function buildOptimizerEvaluationRunSnapshot(run) {
  const source = readPlainObject(run);
  const cases = (Array.isArray(source.cases) ? source.cases : []).filter((caseItem) => (
    normalizeString(caseItem?.optimizationRole || caseItem?.optimization_role || "train").toLowerCase() !== "holdout"
  ));
  return {
    ...source,
    cases,
    optimizationRoles: normalizeOptimizationRoles(source.optimizationRoles || source.optimization_roles)
      .filter((role) => role !== "holdout"),
  };
}

function isTransientError(error) {
  const status = Number(error?.status || error?.statusCode || 0);
  if (status === 408 || status === 409 || status === 425 || status === 429 || status >= 500) {
    return true;
  }
  const code = normalizeString(error?.code || error?.cause?.code).toUpperCase();
  if ([
    "ECONNABORTED",
    "ECONNREFUSED",
    "ECONNRESET",
    "EAI_AGAIN",
    "ENETDOWN",
    "ENETUNREACH",
    "EPIPE",
    "ETIMEDOUT",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_SOCKET",
  ].includes(code)) {
    return true;
  }
  const message = normalizeString(error?.message || error).toLowerCase();
  return error instanceof TypeError
    && (
      message.includes("fetch failed")
      || message.includes("network")
      || message.includes("socket")
    );
}

function isEvaluationRunActive(run) {
  return ["queued", "running", "running_case", "waiting_for_case_summary", "running_evaluator", "scoring"]
    .includes(normalizeString(run?.status).toLowerCase());
}

function buildEvaluationRunOptions(job, target, {
  phase,
  iterationNumber,
  candidateVersion = null,
}) {
  const configuration = job.configuration;
  const targetAgent = configuration.targetAgent;
  const environment = configuration.environment;
  const version = readPlainObject(candidateVersion);
  const candidateIteration = (Array.isArray(job.iterations) ? job.iterations : [])
    .find((iteration) => Number(iteration?.number) === Number(iterationNumber));
  const targetAgentSnapshot = (
    phase === "baseline" || phase === "final_baseline"
      ? readPlainObject(targetAgent.snapshot)
      : readPlainObject(
          candidateIteration?.candidateSnapshot
            || candidateIteration?.candidate_snapshot
            || version.snapshot
            || targetAgent.snapshot,
        )
  );
  const optimizationRoles = getTargetCaseRoles(target, phase);
  const fingerprint = [
    job.id,
    target.evaluationSetId,
    target.evaluationVersionId,
    targetAgent.id,
    version.id || targetAgent.versionId || "active",
    environment.type,
    environment.id,
    phase,
    iterationNumber,
  ].join(":");
  const candidateAuthority = (
    ["verification", "final"].includes(phase)
    && version.id
    && Number.isInteger(Number(iterationNumber))
    && Number(iterationNumber) > 0
  )
    ? {
        kind: "agent_optimization_job",
        id: job.id,
        purpose: "verification",
        iterationNumber: Number(iterationNumber),
      }
    : null;
  return {
    id: stableId("eval_run", fingerprint),
    label: phase === "baseline"
      ? "Optimization Baseline"
      : phase === "final_baseline"
        ? "Sealed Holdout Baseline"
        : `Optimization Iteration ${iterationNumber}`,
    fineTuningJobId: job.id,
    fine_tuning_job_id: job.id,
    purpose: "optimization",
    evaluationVersionId: target.evaluationVersionId,
    evaluationVersionNumber: target.evaluationVersionNumber,
    evaluationVersionLabel: target.evaluationVersionLabel,
    ...(configuration.knowledgeContext
      ? { knowledgeContext: configuration.knowledgeContext }
      : {}),
    targetAgentId: targetAgent.id,
    targetAgentName: targetAgent.name,
    targetAgentPhotoUrl: targetAgent.photoUrl,
    targetAgentVersionId: normalizeString(version.id || targetAgent.versionId),
    targetAgentVersionNumber: Math.max(0, Number(version.version || version.versionNumber || targetAgent.versionNumber || 0) || 0),
    targetAgentVersionLabel: normalizeString(version.label || targetAgent.versionLabel),
    targetAgentVersionRevisionId: normalizeString(version.revisionId || version.revision_id),
    targetBinding: {
      kind: "agent",
      targetId: targetAgent.id,
      targetVersionId: normalizeString(version.id || targetAgent.versionId),
      environmentId: environment.id,
      ...(candidateAuthority ? { candidateAuthority } : {}),
    },
    environmentType: environment.type,
    environmentId: environment.id,
    environmentName: environment.name,
    projectId: environment.projectId,
    evaluator: readPlainObject(target.evaluationSetSnapshot?.evaluator),
    passThreshold: target.passThreshold,
    optimizationRoles,
    targetAgentSnapshot,
    environmentSnapshot: {
      type: environment.type,
      id: environment.id,
      name: environment.name,
      projectId: environment.projectId,
      revisionId: normalizeString(
        environment.revisionId || environment.revision_id,
      ),
      imageDigest: normalizeString(
        environment.imageDigest || environment.image_digest,
      ),
    },
    systemSnapshot: {
      agent: {
        id: targetAgent.id,
        versionId: normalizeString(version.id || targetAgent.versionId),
        snapshot: targetAgentSnapshot,
      },
      environment: {
        type: environment.type,
        id: environment.id,
        projectId: environment.projectId,
        revisionId: normalizeString(
          environment.revisionId || environment.revision_id,
        ),
        imageDigest: normalizeString(
          environment.imageDigest || environment.image_digest,
        ),
        snapshot: {
          type: environment.type,
          id: environment.id,
          name: environment.name,
          projectId: environment.projectId,
        },
      },
      runtime: {
        orchestrator: "agent_optimization",
        contractVersion: "agent_optimization_v2",
      },
    },
    metadata: {
      fineTuningJobId: job.id,
      fine_tuning_job_id: job.id,
      fineTuningIteration: iterationNumber,
      fine_tuning_iteration: iterationNumber,
      fineTuningPhase: phase,
      fine_tuning_phase: phase,
      fineTuningFingerprint: stableId("fine_tune_fingerprint", fingerprint),
      fine_tuning_fingerprint: stableId("fine_tune_fingerprint", fingerprint),
      ...(configuration.knowledgeContext
        ? { knowledgeContext: configuration.knowledgeContext }
        : {}),
    },
  };
}

function withEvent(job, event) {
  return {
    ...job,
    events: appendFineTuningEvent(job, event),
    updatedAt: new Date().toISOString(),
  };
}

function withPhase(job, phase, message, metadata = {}) {
  return withEvent({
    ...job,
    phase,
    status: statusForPhase(phase),
  }, {
    type: "phase_changed",
    phase,
    message,
    iterationNumber: metadata.iterationNumber,
    progressCurrent: metadata.progressCurrent,
    progressTotal: metadata.progressTotal,
    metadata,
  });
}

export function createFineTuningJobOrchestrator(operations = {}) {
  const activeJobs = new Map();
  const {
    getJob,
    saveJob,
    createEvaluationRun,
    getEvaluationRun,
    createOptimizerThread,
    runOptimizerThread,
    readOptimizerThreadCosts,
    createCandidateVersion,
    publishCandidateVersion,
    buildFallbackInstructions,
    delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)),
  } = operations;

  async function persist(job) {
    return await saveJob(job);
  }

  async function readJob(jobId) {
    return await getJob(jobId);
  }

  async function assertContinuable(jobId) {
    const current = await readJob(jobId);
    if (!current) throw new Error("Fine-tuning job no longer exists.");
    if (normalizeString(current.status).toLowerCase() === "cancelled" || current.phase === "cancelled") {
      return { job: current, cancelled: true };
    }
    return { job: current, cancelled: false };
  }

  async function runWithTransientRetries(jobId, operation, {
    phase,
    iterationNumber = 0,
    label,
  }) {
    let attempt = 0;
    while (true) {
      try {
        return await operation(attempt);
      } catch (error) {
        const currentJob = await readJob(jobId);
        const maxRetries = currentJob?.configuration?.limits?.maxTransientRetries ?? 0;
        if (!isTransientError(error) || attempt >= maxRetries) throw error;
        attempt += 1;
        await persist(withEvent(currentJob, {
          type: "operation_retry_scheduled",
          phase,
          message: `${label} failed transiently. Retrying (${attempt}/${maxRetries}).`,
          iterationNumber,
          metadata: {
            attempt,
            maxRetries,
            error: error instanceof Error ? error.message : String(error),
          },
        }));
        await delay(Math.min(8000, 750 * (2 ** (attempt - 1))));
      }
    }
  }

  async function waitForRun(jobId, initialRun, deadlineMs) {
    let run = initialRun;
    while (run?.id && isEvaluationRunActive(run)) {
      const continuity = await assertContinuable(jobId);
      if (continuity.cancelled) return { ...run, status: "cancelled" };
      if (Date.now() >= deadlineMs) {
        return {
          ...run,
          status: "error",
          error: "The evaluation run exceeded the fine-tuning time limit.",
        };
      }
      await delay(1500);
      run = await runWithTransientRetries(
        jobId,
        () => getEvaluationRun(jobId, run.id),
        {
          phase: "verifying",
          label: "Evaluation status check",
        },
      );
    }
    return run;
  }

  function assertCompatibleBaselineRun(job, target, run) {
    if (!run?.id) {
      throw new Error(`The selected baseline for ${target.evaluationSetName} no longer exists.`);
    }
    const expectedAgentId = normalizeString(job.configuration.targetAgent.id);
    const actualAgentId = normalizeString(run.targetAgentId || run.target_agent_id);
    if (actualAgentId && actualAgentId !== expectedAgentId) {
      throw new Error(`The selected baseline for ${target.evaluationSetName} targets a different agent.`);
    }
    const expectedEnvironmentId = normalizeString(job.configuration.environment.id);
    const actualEnvironmentId = normalizeString(run.environmentId || run.environment_id);
    if (actualEnvironmentId && actualEnvironmentId !== expectedEnvironmentId) {
      throw new Error(`The selected baseline for ${target.evaluationSetName} used a different environment.`);
    }
    const expectedVersionId = normalizeString(target.evaluationVersionId);
    const actualVersionId = normalizeString(run.evaluationVersionId || run.evaluation_version_id);
    if (expectedVersionId && actualVersionId && actualVersionId !== expectedVersionId) {
      throw new Error(`The selected baseline for ${target.evaluationSetName} used a different evaluation version.`);
    }
    const runStatus = normalizeString(run.status).toLowerCase();
    if (!["completed", "passed", "failed"].includes(runStatus)) {
      throw new Error(`The selected baseline for ${target.evaluationSetName} is not complete.`);
    }
  }

  async function executeEvaluationBatch(job, {
    phase,
    iterationNumber,
    candidateVersion = null,
  }) {
    const targets = job.configuration.evaluationTargets;
    const deadlineMs = Date.parse(job.execution?.deadlineAt || "") || (
      Date.now() + job.configuration.limits.maxDurationMinutes * 60 * 1000
    );
    const completedRuns = [];
    for (let index = 0; index < targets.length; index += 1) {
      const target = targets[index];
      let run;
      if (phase === "baseline" && target.baselineMode === "existing" && target.baselineRunId) {
        run = await runWithTransientRetries(
          job.id,
          () => getEvaluationRun(job.id, target.baselineRunId),
          {
            phase: "baseline_running",
            iterationNumber,
            label: `${target.evaluationSetName} baseline lookup`,
          },
        );
        assertCompatibleBaselineRun(job, target, run);
      } else {
        const budget = summarizeFineTuningBudget(job);
        if (budget.exhausted) {
          throw Object.assign(new Error("Fine-tuning budget exhausted before the next evaluation run."), {
            stopPhase: "stopped_budget",
          });
        }
        const runOptions = buildEvaluationRunOptions(job, target, {
          phase,
          iterationNumber,
          candidateVersion,
        });
        run = await runWithTransientRetries(
          job.id,
          () => createEvaluationRun(
            target.evaluationSetSnapshot,
            runOptions,
          ),
          {
            phase: phase === "baseline" ? "baseline_running" : "verifying",
            iterationNumber,
            label: `${target.evaluationSetName} ${phase} run`,
          },
        );
      }
      const completedRun = await waitForRun(job.id, run, deadlineMs);
      const completedStatus = normalizeString(completedRun?.status).toLowerCase();
      const failedCases = (Array.isArray(completedRun?.cases) ? completedRun.cases : [])
        .filter((caseItem) => ["invalid", "grader_error", "infrastructure_error", "error", "cancelled"].includes(
          normalizeString(caseItem?.status).toLowerCase(),
        ));
      const metrics = runMetrics(completedRun, getTargetCaseRoles(target, phase));
      if (["error", "failed", "cancelled"].includes(completedStatus) || failedCases.length > 0) {
        throw new Error(
          `${target.evaluationSetName} ${phase} was not scoreable`
          + (failedCases.length ? ` because ${failedCases.length} case${failedCases.length === 1 ? "" : "s"} failed.` : "."),
        );
      }
      if (metrics.totalCount < 1) {
        throw new Error(`${target.evaluationSetName} ${phase} produced no scoreable cases.`);
      }
      completedRuns.push(completedRun);
      const runCostUsd = normalizeUsdCost(completedRun?.costUsd ?? completedRun?.cost_usd);
      const runCostTokens = normalizeTokenCount(completedRun?.costTokens ?? completedRun?.cost_tokens);
      job = {
        ...job,
        costLedger: appendFineTuningCost(job, {
          phase,
          iterationNumber,
          evaluationSetId: target.evaluationSetId,
          referenceId: completedRun?.id,
          amountUsd: runCostUsd,
          amountTokens: runCostTokens,
        }),
      };
      job = withEvent(job, {
        type: "evaluation_completed",
        phase: phase === "baseline" ? "baseline_running" : "verifying",
        message: `${target.evaluationSetName} ${phase} completed.`,
        iterationNumber,
        progressCurrent: index + 1,
        progressTotal: targets.length,
        metadata: {
          evaluationSetId: target.evaluationSetId,
          runId: completedRun?.id,
          averageScore: completedRun?.averageScore,
        },
      });
      job = await persist(job);
    }
    return { job, runs: completedRuns };
  }

  async function establishBaseline(job) {
    const existingBaseline = job.iterations.find((iteration) => iteration.number === 0);
    if (existingBaseline?.evaluationRuns?.length && !isFineTuningPhaseActive(existingBaseline.status)) {
      const runs = await Promise.all(existingBaseline.evaluationRuns.map((reference) => (
        getEvaluationRun(job.id, reference.runId)
      )));
      return { job, runs };
    }
    job = await persist(withPhase(job, "baseline_running", "Running baseline evaluations.", {
      progressCurrent: 0,
      progressTotal: job.configuration.evaluationTargets.length,
    }));
    const batch = await executeEvaluationBatch(job, {
      phase: "baseline",
      iterationNumber: 0,
    });
    job = batch.job;
    const baselineRolesByTarget = job.configuration.evaluationTargets.map((target) => getTargetCaseRoles(target, "baseline"));
    const metrics = aggregateMetrics(batch.runs, baselineRolesByTarget);
    const iteration = normalizeFineTuningIteration({
      id: stableId("fine_tune_baseline", job.id),
      number: 0,
      status: "completed_best_effort",
      startedAt: job.createdAt,
      completedAt: new Date().toISOString(),
      inputAgentVersion: job.configuration.targetAgent,
      evaluationRuns: batch.runs.map((run, index) => buildRunReference(
        job.configuration.evaluationTargets[index],
        run,
        "baseline",
      )),
      metrics,
      decision: "baseline",
      accepted: true,
    }, 0);
    job = await persist(withEvent({
      ...job,
      phase: "optimizing",
      status: "running",
      beforeScore: metrics.averageScore,
      iterations: [
        ...job.iterations.filter((item) => item.number !== 0),
        iteration,
      ].sort((left, right) => left.number - right.number),
    }, {
      type: "baseline_completed",
      phase: "optimizing",
      message: "Baseline established.",
      metadata: {
        averageScore: metrics.averageScore,
        passRate: metrics.passRate,
      },
    }));
    return { job, runs: batch.runs };
  }

  async function runIteration(job, baselineRuns, championRuns, iterationNumber, championSnapshot) {
    job = await persist(withPhase(job, "optimizing", `Optimizing candidate ${iterationNumber}.`, {
      iterationNumber,
      progressCurrent: iterationNumber,
      progressTotal: job.configuration.limits.maxIterations,
    }));
    const existingIteration = job.iterations.find((iteration) => iteration.number === iterationNumber) || null;
    const optimizerThread = existingIteration?.optimizerThreadId
      ? {
          id: existingIteration.optimizerThreadId,
          title: existingIteration.optimizerThreadTitle || `Agent Optimization Iteration ${iterationNumber}`,
          createdAt: existingIteration.startedAt,
        }
      : await runWithTransientRetries(
          job.id,
          () => createOptimizerThread(job, iterationNumber),
          {
            phase: "optimizing",
            iterationNumber,
            label: `Optimizer thread ${iterationNumber}`,
          },
        );
    const pendingIteration = normalizeFineTuningIteration({
      ...(existingIteration || {}),
      id: existingIteration?.id || stableId("fine_tune_iteration", job.id, iterationNumber),
      number: iterationNumber,
      status: "optimizing",
      startedAt: existingIteration?.startedAt || optimizerThread.createdAt || new Date().toISOString(),
      optimizerThreadId: optimizerThread.id,
      optimizerThreadTitle: optimizerThread.title,
      inputAgentVersion: iterationNumber === 1
        ? job.configuration.targetAgent
        : job.iterations.find((item) => item.accepted && item.number === iterationNumber - 1)?.candidateVersion,
    }, iterationNumber);
    job = await persist({
      ...job,
      iterations: [
        ...job.iterations.filter((iteration) => iteration.number !== iterationNumber),
        pendingIteration,
      ].sort((left, right) => left.number - right.number),
    });
    const evidenceRuns = championRuns?.length ? championRuns : baselineRuns;
    let optimizerResult;
    let optimizerCosts;
    let candidateInstructions;
    if (existingIteration?.candidateVersionId && existingIteration?.candidateSnapshot?.instructions) {
      optimizerResult = {
        instructions: existingIteration.candidateSnapshot.instructions,
        summary: existingIteration.analysisSummary,
        risks: [],
        parseStatus: "restored_candidate",
      };
      optimizerCosts = {
        costTokens: existingIteration.costTokens,
        costUsd: existingIteration.costUsd,
      };
      candidateInstructions = existingIteration.candidateSnapshot.instructions;
    } else {
      const prompt = buildFineTuningPrompt({
        targetAgent: {
          ...job.configuration.targetAgent,
          snapshot: championSnapshot,
          instructions: championSnapshot.instructions,
        },
        fineTunerAgent: job.configuration.fineTunerAgent,
        environment: job.configuration.environment,
        evaluationSets: job.configuration.evaluationTargets.map(buildOptimizerEvaluationSetSnapshot),
        evaluationRuns: evidenceRuns.map(buildOptimizerEvaluationRunSnapshot),
        instructions: job.configuration.instructions,
        jobId: job.id,
        iterationNumber,
      });
      const optimizerOutput = await runWithTransientRetries(
        job.id,
        () => runOptimizerThread(optimizerThread.id, prompt),
        {
          phase: "optimizing",
          iterationNumber,
          label: `Optimizer execution ${iterationNumber}`,
        },
      );
      optimizerResult = parseFineTuningOptimizerResult(optimizerOutput);
      candidateInstructions = optimizerResult.instructions || buildFallbackInstructions({
        job,
        evaluationRuns: evidenceRuns,
        analysisSummary: optimizerResult.summary,
        currentInstructions: championSnapshot.instructions,
      });
      optimizerCosts = await readOptimizerThreadCosts(optimizerThread.id).catch(() => ({
        costTokens: 0,
        costUsd: 0,
      }));
    }
    if (!normalizeString(candidateInstructions)) {
      throw new Error("The optimizer did not return a usable instruction candidate.");
    }
    if (!existingIteration?.candidateVersionId) {
      job = {
        ...job,
        costLedger: appendFineTuningCost(job, {
          phase: "optimizing",
          iterationNumber,
          referenceId: optimizerThread.id,
          amountUsd: optimizerCosts.costUsd,
          amountTokens: optimizerCosts.costTokens,
        }),
      };
    }
    const candidateSnapshot = {
      ...championSnapshot,
      name: job.configuration.targetAgent.name,
      instructions: candidateInstructions,
    };
    const candidateVersion = existingIteration?.candidateVersionId
      ? existingIteration.candidateVersion
      : await runWithTransientRetries(
          job.id,
          () => createCandidateVersion(job, {
            iterationNumber,
            snapshot: candidateSnapshot,
            analysisSummary: optimizerResult.summary,
          }),
          {
            phase: "candidate_ready",
            iterationNumber,
            label: `Candidate version ${iterationNumber}`,
          },
        );
    const candidateReadyIteration = normalizeFineTuningIteration({
      ...pendingIteration,
      status: "candidate_ready",
      candidateVersion,
      candidateVersionId: candidateVersion.id,
      candidateSnapshot,
      analysisSummary: optimizerResult.summary,
      costTokens: normalizeTokenCount(optimizerCosts.costTokens),
      costUsd: normalizeUsdCost(optimizerCosts.costUsd),
    }, iterationNumber);
    job = await persist({
      ...job,
      phase: "candidate_ready",
      iterations: [
        ...job.iterations.filter((iteration) => iteration.number !== iterationNumber),
        candidateReadyIteration,
      ].sort((left, right) => left.number - right.number),
    });
    job = await persist(withPhase(job, "verifying", `Verifying candidate ${iterationNumber}.`, {
      iterationNumber,
      candidateVersionId: candidateVersion.id,
    }));
    const verification = await executeEvaluationBatch(job, {
      phase: "verification",
      iterationNumber,
      candidateVersion,
    });
    job = verification.job;
    const baselineByTarget = {};
    const candidateByTarget = {};
    const comparisonsByTarget = {};
    const runReferences = [];
    const comparisons = [];
    const verificationRolesByTarget = [];
    job.configuration.evaluationTargets.forEach((target, index) => {
      const verificationRoles = normalizeOptimizationRoles(
        verification.runs[index]?.optimizationRoles
          || verification.runs[index]?.optimization_roles,
      );
      verificationRolesByTarget.push(verificationRoles);
      baselineByTarget[target.evaluationSetId] = runMetrics(
        baselineRuns[index],
        verificationRoles,
      );
      candidateByTarget[target.evaluationSetId] = runMetrics(verification.runs[index]);
      runReferences.push(buildRunReference(
        target,
        verification.runs[index],
        "verification",
        baselineRuns[index],
      ));
      const targetSuccessPolicy = successPolicyForTarget(job, target);
      const statisticalComparison = buildFineTuningStatisticalComparison(
        baselineRuns[index],
        verification.runs[index],
        {
          confidenceLevel: targetSuccessPolicy.confidenceLevel,
          bootstrapIterations: targetSuccessPolicy.bootstrapIterations,
        },
      );
      comparisonsByTarget[target.evaluationSetId] = statisticalComparison;
      comparisons.push({
        evaluationSetId: target.evaluationSetId,
        evaluationSetName: target.evaluationSetName,
        statisticalComparison,
        cases: buildFineTuningCaseComparisons(
          baselineRuns[index],
          verification.runs[index],
        ),
      });
    });
    const decision = evaluateFineTuningObjective({
      baselineByTarget,
      candidateByTarget,
      evaluationTargets: job.configuration.evaluationTargets,
      objective: job.configuration.objective,
      comparisonsByTarget,
    });
    const metrics = aggregateMetrics(verification.runs);
    const iteration = normalizeFineTuningIteration({
      id: stableId("fine_tune_iteration", job.id, iterationNumber),
      number: iterationNumber,
      status: "completed_best_effort",
      startedAt: optimizerThread.createdAt,
      completedAt: new Date().toISOString(),
      inputAgentVersion: iterationNumber === 1
        ? job.configuration.targetAgent
        : job.iterations.find((item) => item.accepted && item.number === iterationNumber - 1)?.candidateVersion,
      optimizerThreadId: optimizerThread.id,
      optimizerThreadTitle: optimizerThread.title,
      candidateVersion,
      candidateVersionId: candidateVersion.id,
      candidateSnapshot,
      analysisSummary: optimizerResult.summary,
      evaluationRuns: runReferences,
      metrics,
      baselineMetrics: aggregateMetrics(baselineRuns, verificationRolesByTarget),
      decision: decision.accepted ? "accepted" : "rejected",
      decisionReason: decision.targetMet
        ? "The configured quality target was met."
        : decision.accepted
          ? "The candidate improved or remained within the regression guardrail."
          : "The candidate exceeded the allowed regression guardrail.",
      targetMet: decision.targetMet,
      accepted: decision.accepted,
      decisionEvidence: decision,
      costTokens: normalizeTokenCount(optimizerCosts.costTokens) + verification.runs.reduce(
        (sum, run) => sum + normalizeTokenCount(run?.costTokens ?? run?.cost_tokens),
        0,
      ),
      costUsd: normalizeUsdCost(optimizerCosts.costUsd) + verification.runs.reduce(
        (sum, run) => sum + normalizeUsdCost(run?.costUsd ?? run?.cost_usd),
        0,
      ),
    }, iterationNumber);
    iteration.caseComparisons = comparisons;
    job = await persist(withEvent({
      ...job,
      phase: "assessing",
      status: "running",
      iterations: [
        ...job.iterations.filter((item) => item.number !== iterationNumber),
        iteration,
      ].sort((left, right) => left.number - right.number),
      currentIteration: iterationNumber,
      afterScore: decision.averageScore,
      improvementScore: Math.max(0, decision.scoreDelta),
      targetMet: decision.targetMet,
      createdAgentVersion: candidateVersion,
      createdAgentVersionId: candidateVersion.id,
      agentVersionCreationStatus: "draft",
      afterAgentSnapshot: candidateSnapshot,
      analysisSummary: optimizerResult.summary,
    }, {
      type: "candidate_assessed",
      phase: "assessing",
      message: decision.targetMet
        ? `Candidate ${iterationNumber} met the target.`
        : `Candidate ${iterationNumber} scored ${(decision.averageScore * 100).toFixed(1)}%.`,
      iterationNumber,
      metadata: decision,
    }));
    return {
      job,
      iteration,
      decision,
      candidateSnapshot,
      candidateVersion,
      verificationRuns: verification.runs,
    };
  }

  async function independentlyVerifyChampion(job, baselineRuns, championIteration) {
    if (!championIteration?.candidateVersionId || !hasHoldoutCases(job)) {
      return { job, championIteration };
    }
    const budget = summarizeFineTuningBudget(job);
    if (budget.exhausted) {
      return {
        job,
        championIteration,
        stopPhase: "stopped_budget",
        stopMessage: "Budget limit reached before holdout verification.",
      };
    }
    job = await persist(withPhase(job, "verifying", "Running sealed holdout verification.", {
      iterationNumber: championIteration.number,
      finalVerification: true,
    }));
    const holdoutBaseline = await executeEvaluationBatch(job, {
      phase: "final_baseline",
      iterationNumber: championIteration.number,
      candidateVersion: null,
    });
    job = holdoutBaseline.job;
    const verification = await executeEvaluationBatch(job, {
      phase: "final",
      iterationNumber: championIteration.number,
      candidateVersion: championIteration.candidateVersion,
    });
    job = verification.job;
    const baselineByTarget = {};
    const candidateByTarget = {};
    const comparisonsByTarget = {};
    const runReferences = [];
    const comparisons = [];
    const finalRolesByTarget = [];
    job.configuration.evaluationTargets.forEach((target, index) => {
      const finalRoles = normalizeOptimizationRoles(
        verification.runs[index]?.optimizationRoles
          || verification.runs[index]?.optimization_roles,
      );
      finalRolesByTarget.push(finalRoles);
      baselineByTarget[target.evaluationSetId] = runMetrics(
        holdoutBaseline.runs[index],
        finalRoles,
      );
      candidateByTarget[target.evaluationSetId] = runMetrics(verification.runs[index]);
      runReferences.push(buildRunReference(
        target,
        verification.runs[index],
        "final",
        holdoutBaseline.runs[index],
      ));
      const targetSuccessPolicy = successPolicyForTarget(job, target);
      const statisticalComparison = buildFineTuningStatisticalComparison(
        holdoutBaseline.runs[index],
        verification.runs[index],
        {
          confidenceLevel: targetSuccessPolicy.confidenceLevel,
          bootstrapIterations: targetSuccessPolicy.bootstrapIterations,
        },
      );
      comparisonsByTarget[target.evaluationSetId] = statisticalComparison;
      comparisons.push({
        evaluationSetId: target.evaluationSetId,
        evaluationSetName: target.evaluationSetName,
        statisticalComparison,
        cases: buildFineTuningCaseComparisons(
          holdoutBaseline.runs[index],
          verification.runs[index],
        ),
      });
    });
    const decision = evaluateFineTuningObjective({
      baselineByTarget,
      candidateByTarget,
      evaluationTargets: job.configuration.evaluationTargets,
      objective: job.configuration.objective,
      comparisonsByTarget,
    });
    const verifiedIteration = normalizeFineTuningIteration({
      ...championIteration,
      evaluationRuns: runReferences,
      caseComparisons: comparisons,
      metrics: aggregateMetrics(verification.runs),
      baselineMetrics: aggregateMetrics(holdoutBaseline.runs, finalRolesByTarget),
      decision: decision.accepted ? "accepted" : "rejected",
      decisionReason: decision.targetMet
        ? "The candidate met the configured target on sealed holdout verification."
        : decision.accepted
          ? "The candidate passed the holdout regression guardrail but did not meet the target."
          : "The candidate failed sealed holdout verification.",
      targetMet: decision.targetMet,
      accepted: decision.accepted,
      decisionEvidence: decision,
      completedAt: new Date().toISOString(),
    }, championIteration.number);
    job = await persist(withEvent({
      ...job,
      phase: "assessing",
      status: "running",
      targetMet: decision.targetMet,
      afterScore: decision.averageScore,
      improvementScore: Math.max(0, decision.scoreDelta),
      iterations: [
        ...job.iterations.filter((iteration) => iteration.number !== verifiedIteration.number),
        verifiedIteration,
      ].sort((left, right) => left.number - right.number),
    }, {
      type: "holdout_verification_completed",
      phase: "assessing",
      message: decision.targetMet
        ? "The best candidate passed sealed holdout verification."
        : "The best candidate did not meet the target on sealed holdout verification.",
      iterationNumber: verifiedIteration.number,
      metadata: decision,
    }));
    return {
      job,
      championIteration: verifiedIteration,
      verificationRuns: verification.runs,
    };
  }

  async function finalizeJob(job, {
    phase,
    championIteration,
    message,
  }) {
    let finalPhase = phase;
    let publishedVersion = championIteration?.candidateVersion || null;
    const publicationPolicy = job.configuration.publicationPolicy;
    const shouldPublish = Boolean(
      championIteration?.candidateVersionId
      && championIteration?.accepted
      && (
        (job.targetMet && publicationPolicy.mode === "auto_on_target")
        || (!job.targetMet && publicationPolicy.publishBestOnLimit)
      )
    );
    const publicationDecision = buildFineTuningPublicationDecision(
      job,
      championIteration,
      shouldPublish,
    );
    if (shouldPublish) {
      job = await persist(withPhase({
        ...job,
        publicationDecision,
      }, "publishing", "Publishing the best verified candidate.", {
        iterationNumber: championIteration.number,
      }));
      publishedVersion = await publishCandidateVersion(
        job,
        championIteration.candidateVersion,
        championIteration.candidateSnapshot,
      );
      finalPhase = job.targetMet ? "completed_target_met" : "completed_best_effort";
    } else if (championIteration?.candidateVersionId) {
      finalPhase = "awaiting_review";
    }
    const finalJob = withPhase({
      ...job,
      phase: finalPhase,
      status: statusForPhase(finalPhase),
      stopReason: phase,
      bestIterationId: championIteration?.id || "",
      createdAgentVersion: publishedVersion,
      createdAgentVersionId: normalizeString(publishedVersion?.id || championIteration?.candidateVersionId),
      agentVersionCreationStatus: shouldPublish ? "published" : championIteration ? "draft" : "not_created",
      afterAgentSnapshot: championIteration?.candidateSnapshot || job.configuration.targetAgent.snapshot,
      evaluationRuns: buildFineTuningLegacyRunReferences(job.iterations),
      completedAt: new Date().toISOString(),
      execution: {
        ...readPlainObject(job.execution),
        completedAt: new Date().toISOString(),
      },
      publicationDecision,
    }, finalPhase, message, {
      iterationNumber: championIteration?.number || 0,
    });
    return await persist(finalJob);
  }

  async function resumeApprovedPublication(job) {
    const {
      championIteration,
      decision,
    } = resolveFineTuningPublicationCandidate(job);
    try {
      const publishedVersion = await publishCandidateVersion(
        job,
        championIteration.candidateVersion,
        championIteration.candidateSnapshot,
      );
      const completedAt = new Date().toISOString();
      const finalPhase = job.targetMet
        ? "completed_target_met"
        : "completed_best_effort";
      return await persist(withPhase({
        ...job,
        phase: finalPhase,
        status: statusForPhase(finalPhase),
        createdAgentVersion: publishedVersion,
        createdAgentVersionId: normalizeString(
          publishedVersion?.id || championIteration.candidateVersionId,
        ),
        agentVersionCreationStatus: "published",
        publicationDecision: {
          ...decision,
          status: "approved",
          publishedAt: completedAt,
        },
        error: "",
        completedAt,
        execution: {
          ...readPlainObject(job.execution),
          completedAt,
        },
      }, finalPhase, "The explicitly approved candidate was published.", {
        iterationNumber: championIteration.number,
        candidateVersionId: championIteration.candidateVersionId,
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return await persist(withEvent({
        ...job,
        phase: "publishing",
        status: "running",
        error: message,
        completedAt: "",
        execution: {
          ...readPlainObject(job.execution),
          completedAt: "",
        },
      }, {
        type: "publication_retry_required",
        phase: "publishing",
        message,
        iterationNumber: championIteration.number,
      }));
    }
  }

  async function execute(jobId) {
    let job = await readJob(jobId);
    if (!job || !isFineTuningPhaseActive(job.phase)) return job;
    try {
      const configuration = normalizeFineTuningConfiguration(job.configuration, job);
      job = await persist({
        ...job,
        configuration,
        execution: {
          ...readPlainObject(job.execution),
          startedAt: job.execution?.startedAt || new Date().toISOString(),
          deadlineAt: job.execution?.deadlineAt || new Date(
            Date.now() + configuration.limits.maxDurationMinutes * 60 * 1000,
          ).toISOString(),
        },
      });
      if (
        normalizeString(job.phase) === "publishing"
        && normalizeString(job?.publicationDecision?.status) === "approved"
      ) {
        return await resumeApprovedPublication(job);
      }
      const baseline = await establishBaseline(job);
      job = baseline.job;
      let championRuns = baseline.runs;
      let championSnapshot = {
        ...readPlainObject(configuration.targetAgent.snapshot),
        name: configuration.targetAgent.name,
        instructions: String(
          configuration.targetAgent.snapshot?.instructions
            || configuration.targetAgent.instructions
            || "",
        ),
      };
      let championIteration = null;
      let plateauCount = 0;
      const baselineRolesByTarget = job.configuration.evaluationTargets.map((target) => getTargetCaseRoles(target, "baseline"));
      let previousBestScore = aggregateMetrics(baseline.runs, baselineRolesByTarget).averageScore;
      let stopPhase = "completed_best_effort";
      let stopMessage = "Maximum iterations completed.";
      const completedIterations = job.iterations
        .filter((iteration) => iteration.number > 0 && !isFineTuningPhaseActive(iteration.status))
        .sort((left, right) => left.number - right.number);
      const existingChampion = completedIterations
        .filter((iteration) => (
          iteration.accepted
          && iteration.candidateVersionId
          && iteration.metrics.averageScore >= previousBestScore
        ))
        .sort((left, right) => (
          right.metrics.averageScore - left.metrics.averageScore
          || right.number - left.number
        ))[0] || null;
      if (existingChampion) {
        championIteration = existingChampion;
        championSnapshot = existingChampion.candidateSnapshot;
        championRuns = await Promise.all(existingChampion.evaluationRuns.map((reference) => (
          getEvaluationRun(job.id, reference.runId)
        )));
        previousBestScore = existingChampion.metrics.averageScore;
      }
      const baselineByTarget = {};
      const baselineCandidateByTarget = {};
      configuration.evaluationTargets.forEach((target, index) => {
        baselineByTarget[target.evaluationSetId] = runMetrics(baseline.runs[index]);
        baselineCandidateByTarget[target.evaluationSetId] = runMetrics(baseline.runs[index]);
      });
      const baselineDecision = evaluateFineTuningObjective({
        baselineByTarget,
        candidateByTarget: baselineCandidateByTarget,
        evaluationTargets: configuration.evaluationTargets,
        objective: configuration.objective,
      });
      if (!completedIterations.length && baselineDecision.targetMet) {
        return await finalizeJob({
          ...job,
          targetMet: true,
          afterScore: baselineDecision.averageScore,
          improvementScore: 0,
        }, {
          phase: "completed_target_met",
          championIteration: null,
          message: "The baseline already meets the configured quality target.",
        });
      }
      let nextIterationNumber = completedIterations.length
        ? Math.max(...completedIterations.map((iteration) => iteration.number)) + 1
        : 1;
      if (completedIterations.some((iteration) => iteration.targetMet)) {
        nextIterationNumber = configuration.limits.maxIterations + 1;
        stopPhase = "completed_target_met";
        stopMessage = "Configured quality target met.";
      }
      const activeIteration = job.iterations.find((iteration) => (
        iteration.number > 0 && isFineTuningPhaseActive(iteration.status)
      ));
      if (activeIteration) nextIterationNumber = activeIteration.number;

      for (
        let iterationNumber = nextIterationNumber;
        iterationNumber <= configuration.limits.maxIterations;
        iterationNumber += 1
      ) {
        const continuity = await assertContinuable(jobId);
        if (continuity.cancelled) return continuity.job;
        job = continuity.job;
        const budget = summarizeFineTuningBudget(job);
        if (budget.exhausted) {
          stopPhase = "stopped_budget";
          stopMessage = "Budget limit reached.";
          break;
        }
        if (Date.now() >= Date.parse(job.execution.deadlineAt)) {
          stopPhase = "stopped_timeout";
          stopMessage = "Time limit reached.";
          break;
        }
        const result = await runIteration(
          job,
          baseline.runs,
          championRuns,
          iterationNumber,
          championSnapshot,
        );
        job = result.job;
        const improvement = result.decision.averageScore - previousBestScore;
        if (
          result.decision.accepted
          && result.decision.averageScore >= previousBestScore
        ) {
          championIteration = result.iteration;
          championRuns = result.verificationRuns;
          championSnapshot = result.candidateSnapshot;
          previousBestScore = result.decision.averageScore;
        }
        if (result.decision.targetMet) {
          stopPhase = "completed_target_met";
          stopMessage = "Configured quality target met.";
          break;
        }
        if (improvement < configuration.limits.minimumIterationImprovement) {
          plateauCount += 1;
        } else {
          plateauCount = 0;
        }
        if (plateauCount >= configuration.limits.plateauIterations) {
          stopPhase = "stopped_plateau";
          stopMessage = "Stopped after repeated iterations without meaningful improvement.";
          break;
        }
      }
      if (championIteration) {
        const finalVerification = await independentlyVerifyChampion(
          job,
          baseline.runs,
          championIteration,
        );
        job = finalVerification.job;
        championIteration = finalVerification.championIteration;
        if (finalVerification.stopPhase) {
          stopPhase = finalVerification.stopPhase;
          stopMessage = finalVerification.stopMessage;
        } else if (championIteration.targetMet) {
          stopPhase = "completed_target_met";
          stopMessage = "Configured quality target met.";
        }
      }
      return await finalizeJob(job, {
        phase: stopPhase,
        championIteration,
        message: stopMessage,
      });
    } catch (error) {
      job = await readJob(jobId) || job;
      const stopPhase = normalizeString(error?.stopPhase) || "failed";
      return await persist(withPhase({
        ...job,
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date().toISOString(),
      }, stopPhase, error instanceof Error ? error.message : String(error)));
    }
  }

  function start(jobId) {
    const normalizedJobId = normalizeString(jobId);
    if (!normalizedJobId) return Promise.resolve(null);
    if (activeJobs.has(normalizedJobId)) return activeJobs.get(normalizedJobId);
    const execution = execute(normalizedJobId)
      .finally(() => activeJobs.delete(normalizedJobId));
    activeJobs.set(normalizedJobId, execution);
    return execution;
  }

  return Object.freeze({
    start,
    isRunning(jobId) {
      return activeJobs.has(normalizeString(jobId));
    },
  });
}
