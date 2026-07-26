import {
  clampScore,
  normalizeString,
  normalizeUsdCost,
  readPlainObject,
} from "./primitives.mjs";
import {
  evaluatePairedComparisonGate,
} from "../../../evaluations/server/domain/comparisons.mjs";

export const FINE_TUNING_DEFAULT_MINIMUM_SCORE = 0.8;
export const FINE_TUNING_DEFAULT_REQUIRED_PASS_RATE = 0.8;
export const FINE_TUNING_DEFAULT_MAX_ITERATIONS = 3;
export const FINE_TUNING_DEFAULT_BUDGET_USD = 10;
export const FINE_TUNING_DEFAULT_MAX_DURATION_MINUTES = 120;
export const FINE_TUNING_DEFAULT_MAX_TRANSIENT_RETRIES = 2;
export const FINE_TUNING_DEFAULT_PLATEAU_ITERATIONS = 2;
export const FINE_TUNING_DEFAULT_MINIMUM_ITERATION_IMPROVEMENT = 0.01;
export const FINE_TUNING_DEFAULT_MINIMUM_PAIRED_CASES = 10;
export const FINE_TUNING_DEFAULT_MINIMUM_SLICE_PAIRED_CASES = 5;

function normalizePositiveInteger(value, fallback, minimum = 1, maximum = Number.MAX_SAFE_INTEGER) {
  const numeric = Math.round(Number(value));
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(minimum, Math.min(maximum, numeric));
}

function normalizeOptionalNonNegativeNumber(value, maximum = 100) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? Math.max(0, Math.min(maximum, numeric))
    : null;
}

export function normalizeFineTuningSuccessPolicy(rawPolicy = {}, fallbackPassThreshold = 0.8) {
  const source = readPlainObject(rawPolicy);
  const casePassThreshold = clampScore(
    source.casePassThreshold
      ?? source.case_pass_threshold
      ?? source.passThreshold
      ?? source.pass_threshold
      ?? fallbackPassThreshold,
    FINE_TUNING_DEFAULT_MINIMUM_SCORE,
  );
  const maximumRegression = clampScore(
    source.maximumRegression
      ?? source.maximum_regression
      ?? 0.05,
    0.05,
  );
  const requiredSliceIds = Array.from(new Set(
    (Array.isArray(source.requiredSliceIds)
      ? source.requiredSliceIds
      : Array.isArray(source.required_slice_ids)
        ? source.required_slice_ids
        : [])
      .map(normalizeString)
      .filter(Boolean),
  )).sort();
  const maximumCostIncreaseRatio = normalizeOptionalNonNegativeNumber(
    source.maximumCostIncreaseRatio
      ?? source.maximum_cost_increase_ratio,
  );
  const maximumLatencyIncreaseRatio = normalizeOptionalNonNegativeNumber(
    source.maximumLatencyIncreaseRatio
      ?? source.maximum_latency_increase_ratio,
  );
  return {
    casePassThreshold,
    minimumAverageScore: clampScore(
      source.minimumAverageScore
        ?? source.minimum_average_score
        ?? source.targetScore
        ?? source.target_score
        ?? casePassThreshold,
      FINE_TUNING_DEFAULT_MINIMUM_SCORE,
    ),
    requiredPassRate: clampScore(
      source.requiredPassRate
        ?? source.required_pass_rate
        ?? source.targetPassRate
        ?? source.target_pass_rate
        ?? casePassThreshold,
      FINE_TUNING_DEFAULT_REQUIRED_PASS_RATE,
    ),
    minimumImprovement: clampScore(
      source.minimumImprovement
        ?? source.minimum_improvement
        ?? 0,
      0,
    ),
    maximumRegression,
    maximumSliceRegression: clampScore(
      source.maximumSliceRegression
        ?? source.maximum_slice_regression
        ?? maximumRegression,
      maximumRegression,
    ),
    confidenceLevel: Math.max(
      0.5,
      Math.min(0.999, Number(source.confidenceLevel ?? source.confidence_level ?? 0.95) || 0.95),
    ),
    bootstrapIterations: normalizePositiveInteger(
      source.bootstrapIterations ?? source.bootstrap_iterations,
      2_000,
      200,
      20_000,
    ),
    minimumPairedCases: normalizePositiveInteger(
      source.minimumPairedCases ?? source.minimum_paired_cases,
      FINE_TUNING_DEFAULT_MINIMUM_PAIRED_CASES,
      2,
      100_000,
    ),
    minimumPairedCoverage: Math.max(
      0,
      Math.min(1, Number(source.minimumPairedCoverage ?? source.minimum_paired_coverage ?? 1) || 0),
    ),
    minimumSlicePairedCases: normalizePositiveInteger(
      source.minimumSlicePairedCases ?? source.minimum_slice_paired_cases,
      FINE_TUNING_DEFAULT_MINIMUM_SLICE_PAIRED_CASES,
      2,
      100_000,
    ),
    requiredSliceIds,
    requireComparableFingerprints: source.requireComparableFingerprints !== false
      && source.require_comparable_fingerprints !== false,
    maximumCostIncreaseRatio,
    maximumLatencyIncreaseRatio,
    requireCostEvidence: source.requireCostEvidence === true
      || source.require_cost_evidence === true
      || maximumCostIncreaseRatio !== null,
    requireLatencyEvidence: source.requireLatencyEvidence === true
      || source.require_latency_evidence === true
      || maximumLatencyIncreaseRatio !== null,
  };
}

export function normalizeFineTuningObjective(rawObjective = {}, evaluationTargets = []) {
  const source = readPlainObject(rawObjective);
  const mode = normalizeString(source.mode || source.type).toLowerCase() === "custom"
    ? "custom"
    : "evaluation_targets";
  const fallbackThreshold = Array.isArray(evaluationTargets) && evaluationTargets.length
    ? evaluationTargets.reduce((sum, target) => (
        sum + Number(target?.successPolicy?.casePassThreshold || 0.8)
      ), 0) / evaluationTargets.length
    : FINE_TUNING_DEFAULT_MINIMUM_SCORE;
  return {
    mode,
    successPolicy: normalizeFineTuningSuccessPolicy(
      source.successPolicy || source.success_policy || source,
      fallbackThreshold,
    ),
    requireAllEvaluationTargets: source.requireAllEvaluationTargets !== false
      && source.require_all_evaluation_targets !== false,
  };
}

export function normalizeFineTuningLimits(rawLimits = {}) {
  const source = readPlainObject(rawLimits);
  return {
    maxIterations: normalizePositiveInteger(
      source.maxIterations ?? source.max_iterations,
      FINE_TUNING_DEFAULT_MAX_ITERATIONS,
      1,
      20,
    ),
    budgetUsd: Math.max(
      0.01,
      normalizeUsdCost(
        source.budgetUsd
          ?? source.budget_usd
          ?? source.maximumBudgetUsd
          ?? source.maximum_budget_usd
          ?? FINE_TUNING_DEFAULT_BUDGET_USD,
      ) || FINE_TUNING_DEFAULT_BUDGET_USD,
    ),
    maxDurationMinutes: normalizePositiveInteger(
      source.maxDurationMinutes ?? source.max_duration_minutes,
      FINE_TUNING_DEFAULT_MAX_DURATION_MINUTES,
      5,
      1440,
    ),
    maxTransientRetries: normalizePositiveInteger(
      source.maxTransientRetries ?? source.max_transient_retries,
      FINE_TUNING_DEFAULT_MAX_TRANSIENT_RETRIES,
      0,
      5,
    ),
    plateauIterations: normalizePositiveInteger(
      source.plateauIterations ?? source.plateau_iterations,
      FINE_TUNING_DEFAULT_PLATEAU_ITERATIONS,
      1,
      5,
    ),
    minimumIterationImprovement: clampScore(
      source.minimumIterationImprovement
        ?? source.minimum_iteration_improvement
        ?? FINE_TUNING_DEFAULT_MINIMUM_ITERATION_IMPROVEMENT,
      FINE_TUNING_DEFAULT_MINIMUM_ITERATION_IMPROVEMENT,
    ),
  };
}

export function normalizeFineTuningPublicationPolicy(rawPolicy = {}) {
  const source = readPlainObject(rawPolicy);
  const mode = normalizeString(source.mode || source.type).toLowerCase();
  return {
    mode: mode === "auto_on_target" ? "auto_on_target" : "manual",
    publishBestOnLimit: source.publishBestOnLimit === true || source.publish_best_on_limit === true,
  };
}

export function normalizeFineTuningMetrics(rawMetrics = {}) {
  const source = readPlainObject(rawMetrics);
  const totalCount = Math.max(0, Math.round(Number(source.totalCount ?? source.total_count ?? 0) || 0));
  const passedCount = Math.max(
    0,
    Math.min(totalCount, Math.round(Number(source.passedCount ?? source.passed_count ?? 0) || 0)),
  );
  const explicitPassRate = Number(source.passRate ?? source.pass_rate);
  const costUsd = normalizeUsdCost(source.costUsd ?? source.cost_usd);
  const explicitCostPerCase = normalizeOptionalNonNegativeNumber(
    source.costUsdPerCase ?? source.cost_usd_per_case,
    Number.MAX_SAFE_INTEGER,
  );
  const explicitAverageLatencyMs = normalizeOptionalNonNegativeNumber(
    source.averageLatencyMs ?? source.average_latency_ms,
    Number.MAX_SAFE_INTEGER,
  );
  return {
    averageScore: clampScore(source.averageScore ?? source.average_score ?? source.score ?? 0),
    passRate: Number.isFinite(explicitPassRate)
      ? clampScore(explicitPassRate)
      : totalCount > 0
        ? clampScore(passedCount / totalCount)
        : 0,
    passedCount,
    totalCount,
    costUsd,
    costUsdPerCase: explicitCostPerCase
      ?? (totalCount > 0 ? costUsd / totalCount : null),
    averageLatencyMs: explicitAverageLatencyMs,
    costEvidenceAvailable: source.costEvidenceAvailable === true
      || source.cost_evidence_available === true,
    latencyEvidenceAvailable: source.latencyEvidenceAvailable === true
      || source.latency_evidence_available === true,
  };
}

function evaluateRelativeEfficiencyGate({
  baselineValue,
  candidateValue,
  evidenceAvailable,
  required,
  maximumIncreaseRatio,
}) {
  const enabled = required || maximumIncreaseRatio !== null;
  if (!enabled) {
    return {
      enabled: false,
      evidenceMet: true,
      accepted: true,
      baselineValue,
      candidateValue,
      increaseRatio: null,
      maximumIncreaseRatio,
    };
  }
  const valuesAvailable = evidenceAvailable
    && baselineValue !== null
    && candidateValue !== null;
  let increaseRatio = null;
  if (valuesAvailable) {
    increaseRatio = baselineValue > 0
      ? (candidateValue - baselineValue) / baselineValue
      : candidateValue <= baselineValue
        ? 0
        : null;
  }
  const accepted = valuesAvailable && (
    maximumIncreaseRatio === null
      || (
        baselineValue > 0
          ? increaseRatio <= maximumIncreaseRatio
          : candidateValue <= baselineValue
      )
  );
  return {
    enabled: true,
    evidenceMet: valuesAvailable,
    accepted,
    baselineValue,
    candidateValue,
    increaseRatio,
    maximumIncreaseRatio,
  };
}

export function evaluateFineTuningTarget({
  baselineMetrics,
  candidateMetrics,
  successPolicy,
  statisticalComparison = null,
}) {
  const baseline = normalizeFineTuningMetrics(baselineMetrics);
  const candidate = normalizeFineTuningMetrics(candidateMetrics);
  const policy = normalizeFineTuningSuccessPolicy(successPolicy);
  const scoreDelta = candidate.averageScore - baseline.averageScore;
  const passRateDelta = candidate.passRate - baseline.passRate;
  const regression = Math.max(0, baseline.averageScore - candidate.averageScore);
  const aggregateTargetMet = candidate.averageScore >= policy.minimumAverageScore
    && candidate.passRate >= policy.requiredPassRate
    && scoreDelta >= policy.minimumImprovement
    && regression <= policy.maximumRegression;
  const aggregateAccepted = scoreDelta >= -policy.maximumRegression
    && passRateDelta >= -policy.maximumRegression;
  const statisticalGate = statisticalComparison
    ? evaluatePairedComparisonGate(statisticalComparison, policy)
    : null;
  const costGate = evaluateRelativeEfficiencyGate({
    baselineValue: baseline.costUsdPerCase,
    candidateValue: candidate.costUsdPerCase,
    evidenceAvailable: baseline.costEvidenceAvailable && candidate.costEvidenceAvailable,
    required: policy.requireCostEvidence,
    maximumIncreaseRatio: policy.maximumCostIncreaseRatio,
  });
  const latencyGate = evaluateRelativeEfficiencyGate({
    baselineValue: baseline.averageLatencyMs,
    candidateValue: candidate.averageLatencyMs,
    evidenceAvailable: baseline.latencyEvidenceAvailable && candidate.latencyEvidenceAvailable,
    required: policy.requireLatencyEvidence,
    maximumIncreaseRatio: policy.maximumLatencyIncreaseRatio,
  });
  const efficiencyGate = {
    accepted: costGate.accepted && latencyGate.accepted,
    cost: costGate,
    latency: latencyGate,
  };
  const accepted = aggregateAccepted
    && efficiencyGate.accepted
    && (!statisticalGate || statisticalGate.accepted);
  const targetMet = aggregateTargetMet
    && efficiencyGate.accepted
    && (!statisticalGate || statisticalGate.targetImprovementEstablished);
  return {
    targetMet,
    accepted,
    averageScore: candidate.averageScore,
    passRate: candidate.passRate,
    scoreDelta,
    passRateDelta,
    regression,
    policy,
    statisticalComparison,
    statisticalGate,
    efficiencyGate,
  };
}

export function evaluateFineTuningObjective({
  baselineByTarget = {},
  candidateByTarget = {},
  evaluationTargets = [],
  objective = {},
  comparisonsByTarget = {},
}) {
  const normalizedObjective = normalizeFineTuningObjective(objective, evaluationTargets);
  const results = (Array.isArray(evaluationTargets) ? evaluationTargets : []).map((target) => {
    const targetId = normalizeString(target?.evaluationSetId || target?.id);
    const objectiveEfficiencyPolicy = {
      ...(normalizedObjective.successPolicy.maximumCostIncreaseRatio !== null
        ? {
            maximumCostIncreaseRatio:
              normalizedObjective.successPolicy.maximumCostIncreaseRatio,
          }
        : {}),
      ...(normalizedObjective.successPolicy.maximumLatencyIncreaseRatio !== null
        ? {
            maximumLatencyIncreaseRatio:
              normalizedObjective.successPolicy.maximumLatencyIncreaseRatio,
          }
        : {}),
      ...(normalizedObjective.successPolicy.requireCostEvidence
        ? { requireCostEvidence: true }
        : {}),
      ...(normalizedObjective.successPolicy.requireLatencyEvidence
        ? { requireLatencyEvidence: true }
        : {}),
    };
    const targetPolicy = normalizedObjective.mode === "custom"
      ? normalizedObjective.successPolicy
      : normalizeFineTuningSuccessPolicy(
          {
            ...readPlainObject(target?.successPolicy || target?.success_policy),
            ...objectiveEfficiencyPolicy,
          },
          target?.passThreshold ?? target?.pass_threshold ?? 0.8,
        );
    return {
      evaluationSetId: targetId,
      ...evaluateFineTuningTarget({
        baselineMetrics: baselineByTarget[targetId],
        candidateMetrics: candidateByTarget[targetId],
        successPolicy: targetPolicy,
        statisticalComparison: comparisonsByTarget[targetId] || null,
      }),
    };
  });
  const targetMet = results.length > 0 && (
    normalizedObjective.requireAllEvaluationTargets
      ? results.every((result) => result.targetMet)
      : results.some((result) => result.targetMet)
  );
  const accepted = results.length > 0 && results.every((result) => result.accepted);
  const averageScore = results.length
    ? results.reduce((sum, result) => sum + result.averageScore, 0) / results.length
    : 0;
  const passRate = results.length
    ? results.reduce((sum, result) => sum + result.passRate, 0) / results.length
    : 0;
  const scoreDelta = results.length
    ? results.reduce((sum, result) => sum + result.scoreDelta, 0) / results.length
    : 0;
  return {
    targetMet,
    accepted,
    averageScore: clampScore(averageScore),
    passRate: clampScore(passRate),
    scoreDelta,
    results,
  };
}

export function summarizeFineTuningBudget(job = {}) {
  const limits = normalizeFineTuningLimits(job?.configuration?.limits || job?.limits);
  const ledger = Array.isArray(job?.costLedger) ? job.costLedger : [];
  const spentUsd = ledger.reduce(
    (sum, entry) => sum + normalizeUsdCost(entry?.amountUsd ?? entry?.amount_usd ?? entry?.costUsd),
    0,
  ) || normalizeUsdCost(job?.costUsd ?? job?.cost_usd);
  return {
    budgetUsd: limits.budgetUsd,
    spentUsd,
    remainingUsd: Math.max(0, limits.budgetUsd - spentUsd),
    utilization: limits.budgetUsd > 0 ? Math.min(1, spentUsd / limits.budgetUsd) : 1,
    exhausted: spentUsd >= limits.budgetUsd,
  };
}

export function canStartFineTuningPhase(job, estimatedCostUsd = 0) {
  const budget = summarizeFineTuningBudget(job);
  const estimate = normalizeUsdCost(estimatedCostUsd);
  return {
    allowed: !budget.exhausted && estimate <= budget.remainingUsd,
    estimateUsd: estimate,
    ...budget,
  };
}
