import { createHash } from "node:crypto";

import {
  clampScore,
  isScoredEvaluationCase,
} from "./sets.mjs";
import { normalizeString } from "./primitives.mjs";

const DEFAULT_CONFIDENCE_LEVEL = 0.95;
const DEFAULT_BOOTSTRAP_ITERATIONS = 2_000;
const DEFAULT_MINIMUM_PAIRED_CASES = 10;
const DEFAULT_MINIMUM_SLICE_PAIRED_CASES = 5;

function normalizeConfidenceLevel(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric)
    ? Math.max(0.5, Math.min(0.999, numeric))
    : DEFAULT_CONFIDENCE_LEVEL;
}

function normalizeBootstrapIterations(value) {
  const numeric = Math.round(Number(value));
  return Number.isFinite(numeric)
    ? Math.max(200, Math.min(20_000, numeric))
    : DEFAULT_BOOTSTRAP_ITERATIONS;
}

function createSeededRandom(seedText) {
  const digest = createHash("sha256").update(String(seedText || "")).digest();
  let state = digest.readUInt32LE(0) || 0x6d2b79f5;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

function quantile(sortedValues, probability) {
  if (!sortedValues.length) return null;
  if (sortedValues.length === 1) return sortedValues[0];
  const index = Math.max(0, Math.min(sortedValues.length - 1, probability * (sortedValues.length - 1)));
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  if (lowerIndex === upperIndex) return sortedValues[lowerIndex];
  const weight = index - lowerIndex;
  return sortedValues[lowerIndex] * (1 - weight) + sortedValues[upperIndex] * weight;
}

function mean(values) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function aggregatePairsByDataRow(pairs) {
  const groups = new Map();
  for (const pair of pairs) {
    const dataRowId = pair.baseline.dataRowId;
    const group = groups.get(dataRowId) || {
      dataRowId,
      baselineScores: [],
      candidateScores: [],
      baselinePasses: [],
      candidatePasses: [],
    };
    group.baselineScores.push(pair.baseline.score);
    group.candidateScores.push(pair.candidate.score);
    group.baselinePasses.push(Number(pair.baseline.passed));
    group.candidatePasses.push(Number(pair.candidate.passed));
    groups.set(dataRowId, group);
  }
  return Array.from(groups.values())
    .sort((left, right) => left.dataRowId.localeCompare(right.dataRowId))
    .map((group) => {
      const baselineScore = mean(group.baselineScores);
      const candidateScore = mean(group.candidateScores);
      const baselinePassRate = mean(group.baselinePasses);
      const candidatePassRate = mean(group.candidatePasses);
      return {
        dataRowId: group.dataRowId,
        trialCount: group.baselineScores.length,
        baselineScore,
        candidateScore,
        scoreDelta: candidateScore - baselineScore,
        baselinePassRate,
        candidatePassRate,
        passRateDelta: candidatePassRate - baselinePassRate,
      };
    });
}

function sampleStandardDeviation(values) {
  if (values.length < 2) return 0;
  const average = mean(values);
  const variance = values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function readSliceIds(caseItem) {
  const metadata = caseItem?.metadata && typeof caseItem.metadata === "object" && !Array.isArray(caseItem.metadata)
    ? caseItem.metadata
    : {};
  const values = [
    ...(Array.isArray(caseItem?.sliceIds) ? caseItem.sliceIds : []),
    ...(Array.isArray(caseItem?.slice_ids) ? caseItem.slice_ids : []),
    ...(Array.isArray(metadata.sliceIds) ? metadata.sliceIds : []),
    ...(Array.isArray(metadata.slice_ids) ? metadata.slice_ids : []),
    ...(Array.isArray(metadata.slices) ? metadata.slices : []),
    ...(Array.isArray(metadata.tags) ? metadata.tags : []),
  ];
  return Array.from(new Set(values.map(normalizeString).filter(Boolean))).sort();
}

function casePairIdentity(caseItem, fallbackIndex) {
  const dataRowId = normalizeString(
    caseItem?.dataRowId
      || caseItem?.data_row_id
      || caseItem?.caseId
      || caseItem?.case_id,
  ) || `case_${fallbackIndex + 1}`;
  const runIndex = Math.max(
    1,
    Math.round(Number(caseItem?.dataRowRunIndex ?? caseItem?.data_row_run_index ?? 1) || 1),
  );
  const escapedDataRowId = dataRowId.replaceAll("%", "%25").replaceAll(":", "%3A");
  return {
    dataRowId,
    runIndex,
    key: `${escapedDataRowId}::${runIndex}`,
  };
}

function collectScoredCases(run = {}) {
  const scored = new Map();
  const unscored = [];
  (Array.isArray(run?.cases) ? run.cases : []).forEach((caseItem, index) => {
    const identity = casePairIdentity(caseItem, index);
    const { key } = identity;
    const score = clampScore(caseItem?.score);
    if (!isScoredEvaluationCase(caseItem) || score === null) {
      unscored.push({
        key,
        caseId: normalizeString(caseItem?.id),
        status: normalizeString(caseItem?.status).toLowerCase() || "unknown",
      });
      return;
    }
    if (scored.has(key)) {
      throw new TypeError(`Evaluation run contains duplicate paired case key: ${key}`);
    }
    scored.set(key, {
      key,
      caseId: normalizeString(caseItem?.id),
      dataRowId: identity.dataRowId,
      dataRowRunIndex: identity.runIndex,
      score,
      passed: score >= clampScore(run?.passThreshold ?? run?.pass_threshold ?? 0.8),
      sliceIds: readSliceIds(caseItem),
      optimizationRole: normalizeString(caseItem?.optimizationRole || caseItem?.optimization_role || "train").toLowerCase(),
    });
  });
  return { scored, unscored };
}

function bootstrapPairedStatistics(pairs, options = {}) {
  const confidenceLevel = normalizeConfidenceLevel(options.confidenceLevel);
  const iterations = normalizeBootstrapIterations(options.bootstrapIterations);
  const units = aggregatePairsByDataRow(pairs);
  if (!units.length) {
    return {
      confidenceLevel,
      bootstrapIterations: iterations,
      pairedCount: 0,
      pairedTrialCount: 0,
      baselineMean: null,
      candidateMean: null,
      meanDelta: null,
      passRateDelta: null,
      standardError: null,
      scoreDeltaInterval: { lower: null, upper: null },
      passRateDeltaInterval: { lower: null, upper: null },
      probabilityOfImprovement: null,
    };
  }

  const scoreDeltas = units.map((unit) => unit.scoreDelta);
  const passDeltas = units.map((unit) => unit.passRateDelta);
  const baselineMean = mean(units.map((unit) => unit.baselineScore));
  const candidateMean = mean(units.map((unit) => unit.candidateScore));
  const random = createSeededRandom(options.seed);
  const bootstrappedScoreDeltas = [];
  const bootstrappedPassDeltas = [];
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    let scoreDeltaSum = 0;
    let passDeltaSum = 0;
    for (let draw = 0; draw < units.length; draw += 1) {
      const sampledIndex = Math.min(units.length - 1, Math.floor(random() * units.length));
      scoreDeltaSum += scoreDeltas[sampledIndex];
      passDeltaSum += passDeltas[sampledIndex];
    }
    bootstrappedScoreDeltas.push(scoreDeltaSum / units.length);
    bootstrappedPassDeltas.push(passDeltaSum / units.length);
  }
  bootstrappedScoreDeltas.sort((left, right) => left - right);
  bootstrappedPassDeltas.sort((left, right) => left - right);
  const alpha = (1 - confidenceLevel) / 2;
  const positiveCount = bootstrappedScoreDeltas.filter((delta) => delta > 0).length;
  const equalCount = bootstrappedScoreDeltas.filter((delta) => delta === 0).length;
  return {
    confidenceLevel,
    bootstrapIterations: iterations,
    pairedCount: units.length,
    pairedTrialCount: pairs.length,
    baselineMean,
    candidateMean,
    meanDelta: mean(scoreDeltas),
    passRateDelta: mean(passDeltas),
    standardError: sampleStandardDeviation(scoreDeltas) / Math.sqrt(units.length),
    scoreDeltaInterval: {
      lower: quantile(bootstrappedScoreDeltas, alpha),
      upper: quantile(bootstrappedScoreDeltas, 1 - alpha),
    },
    passRateDeltaInterval: {
      lower: quantile(bootstrappedPassDeltas, alpha),
      upper: quantile(bootstrappedPassDeltas, 1 - alpha),
    },
    probabilityOfImprovement: (positiveCount + (equalCount * 0.5)) / iterations,
  };
}

function buildPairedRecords(baselineRun, candidateRun) {
  const baseline = collectScoredCases(baselineRun);
  const candidate = collectScoredCases(candidateRun);
  const pairedKeys = Array.from(baseline.scored.keys())
    .filter((key) => candidate.scored.has(key))
    .sort();
  const pairs = pairedKeys.map((key) => {
    const baselineCase = baseline.scored.get(key);
    const candidateCase = candidate.scored.get(key);
    return {
      key,
      baseline: baselineCase,
      candidate: candidateCase,
      sliceIds: Array.from(new Set([
        ...baselineCase.sliceIds,
        ...candidateCase.sliceIds,
      ])).sort(),
    };
  });
  return {
    baseline,
    candidate,
    pairs,
    unmatchedBaselineKeys: Array.from(baseline.scored.keys()).filter((key) => !candidate.scored.has(key)).sort(),
    unmatchedCandidateKeys: Array.from(candidate.scored.keys()).filter((key) => !baseline.scored.has(key)).sort(),
  };
}

function readRunFingerprint(run, camelKey, snakeKey) {
  return normalizeString(
    run?.[camelKey]
      || run?.[snakeKey]
      || run?.metadata?.[camelKey]
      || run?.metadata?.[snakeKey],
  );
}

export function buildPairedEvaluationComparison(baselineRun = {}, candidateRun = {}, options = {}) {
  const records = buildPairedRecords(baselineRun, candidateRun);
  const baselineFingerprint = normalizeString(
    baselineRun?.runFingerprint
      || baselineRun?.run_fingerprint
      || baselineRun?.metadata?.runFingerprint
      || baselineRun?.id,
  );
  const candidateFingerprint = normalizeString(
    candidateRun?.runFingerprint
      || candidateRun?.run_fingerprint
      || candidateRun?.metadata?.runFingerprint
      || candidateRun?.id,
  );
  const contractFingerprints = [
    ["dataset", "datasetFingerprint", "dataset_fingerprint"],
    ["case_selection", "caseSelectionFingerprint", "case_selection_fingerprint"],
    ["evaluator", "evaluatorFingerprint", "evaluator_fingerprint"],
  ].map(([kind, camelKey, snakeKey]) => {
    const baseline = readRunFingerprint(baselineRun, camelKey, snakeKey);
    const candidate = readRunFingerprint(candidateRun, camelKey, snakeKey);
    return {
      kind,
      baseline,
      candidate,
      available: Boolean(baseline && candidate),
      matches: Boolean(baseline && candidate && baseline === candidate),
    };
  });
  const missingContractFingerprints = contractFingerprints
    .filter((fingerprint) => !fingerprint.available)
    .map((fingerprint) => fingerprint.kind);
  const contractMismatches = contractFingerprints
    .filter((fingerprint) => fingerprint.available && !fingerprint.matches)
    .map((fingerprint) => fingerprint.kind);
  const seed = normalizeString(options.seed)
    || `${baselineFingerprint}\0${candidateFingerprint}\0paired-bootstrap-v1`;
  const statistics = bootstrapPairedStatistics(records.pairs, {
    ...options,
    seed,
  });
  const possiblePairCount = Math.max(records.baseline.scored.size, records.candidate.scored.size);
  const baselineScoredCaseIds = new Set(Array.from(records.baseline.scored.values()).map((caseItem) => caseItem.dataRowId));
  const candidateScoredCaseIds = new Set(Array.from(records.candidate.scored.values()).map((caseItem) => caseItem.dataRowId));
  const possibleCaseCount = Math.max(baselineScoredCaseIds.size, candidateScoredCaseIds.size);
  const sliceIds = Array.from(new Set(records.pairs.flatMap((pair) => pair.sliceIds))).sort();
  const slices = sliceIds.map((sliceId) => {
    const pairs = records.pairs.filter((pair) => pair.sliceIds.includes(sliceId));
    return {
      sliceId,
      ...bootstrapPairedStatistics(pairs, {
        ...options,
        seed: `${seed}\0slice\0${sliceId}`,
      }),
    };
  });
  return {
    schemaVersion: "paired_evaluation_comparison_v1",
    method: "deterministic_paired_percentile_bootstrap",
    seedFingerprint: createHash("sha256").update(seed).digest("hex"),
    ...statistics,
    contractCompatible: missingContractFingerprints.length === 0 && contractMismatches.length === 0,
    contractFingerprints,
    missingContractFingerprints,
    contractMismatches,
    baselineSystemFingerprint: readRunFingerprint(baselineRun, "systemFingerprint", "system_fingerprint"),
    candidateSystemFingerprint: readRunFingerprint(candidateRun, "systemFingerprint", "system_fingerprint"),
    possiblePairCount,
    pairedCoverage: possiblePairCount > 0 ? records.pairs.length / possiblePairCount : 0,
    possibleCaseCount,
    pairedCaseCoverage: possibleCaseCount > 0 ? statistics.pairedCount / possibleCaseCount : 0,
    baselineScoredCount: records.baseline.scored.size,
    candidateScoredCount: records.candidate.scored.size,
    baselineUnscoredCount: records.baseline.unscored.length,
    candidateUnscoredCount: records.candidate.unscored.length,
    baselineUnscored: records.baseline.unscored,
    candidateUnscored: records.candidate.unscored,
    unmatchedBaselineKeys: records.unmatchedBaselineKeys,
    unmatchedCandidateKeys: records.unmatchedCandidateKeys,
    pairs: records.pairs.map((pair) => ({
      key: pair.key,
      dataRowId: pair.baseline.dataRowId,
      dataRowRunIndex: pair.baseline.dataRowRunIndex,
      optimizationRole: pair.candidate.optimizationRole || pair.baseline.optimizationRole,
      sliceIds: pair.sliceIds,
      baselineScore: pair.baseline.score,
      candidateScore: pair.candidate.score,
      scoreDelta: pair.candidate.score - pair.baseline.score,
      baselinePassed: pair.baseline.passed,
      candidatePassed: pair.candidate.passed,
    })),
    slices,
  };
}

export function evaluatePairedComparisonGate(comparison = {}, policy = {}) {
  const maximumRegression = Math.max(0, Number(policy.maximumRegression ?? policy.maximum_regression ?? 0.05) || 0);
  const maximumSliceRegression = Math.max(
    0,
    Number(policy.maximumSliceRegression ?? policy.maximum_slice_regression ?? maximumRegression) || 0,
  );
  const minimumImprovement = Number(policy.minimumImprovement ?? policy.minimum_improvement ?? 0) || 0;
  const minimumPairedCases = Math.max(
    2,
    Math.round(
      Number(
        policy.minimumPairedCases
          ?? policy.minimum_paired_cases
          ?? DEFAULT_MINIMUM_PAIRED_CASES,
      ) || DEFAULT_MINIMUM_PAIRED_CASES,
    ),
  );
  const minimumPairedCoverage = Math.max(
    0,
    Math.min(1, Number(policy.minimumPairedCoverage ?? policy.minimum_paired_coverage ?? 1) || 0),
  );
  const minimumSlicePairedCases = Math.max(
    2,
    Math.round(
      Number(
        policy.minimumSlicePairedCases
          ?? policy.minimum_slice_paired_cases
          ?? DEFAULT_MINIMUM_SLICE_PAIRED_CASES,
      ) || DEFAULT_MINIMUM_SLICE_PAIRED_CASES,
    ),
  );
  const requiredSliceIds = Array.from(new Set(
    (Array.isArray(policy.requiredSliceIds)
      ? policy.requiredSliceIds
      : Array.isArray(policy.required_slice_ids)
        ? policy.required_slice_ids
        : [])
      .map(normalizeString)
      .filter(Boolean),
  )).sort();
  const requireComparableFingerprints = policy.requireComparableFingerprints !== false
    && policy.require_comparable_fingerprints !== false;
  const lowerScoreDelta = Number(comparison?.scoreDeltaInterval?.lower);
  const lowerPassRateDelta = Number(comparison?.passRateDeltaInterval?.lower);
  const upperScoreDelta = Number(comparison?.scoreDeltaInterval?.upper);
  const hasInterval = Number.isFinite(lowerScoreDelta) && Number.isFinite(lowerPassRateDelta);
  const sampleSizeMet = Number(comparison?.pairedCount || 0) >= minimumPairedCases;
  const coverageMet = Number(comparison?.pairedCoverage || 0) >= minimumPairedCoverage
    && Number(comparison?.pairedCaseCoverage ?? comparison?.pairedCoverage ?? 0) >= minimumPairedCoverage;
  const nonInferiorityEstablished = hasInterval
    && lowerScoreDelta >= -maximumRegression
    && lowerPassRateDelta >= -maximumRegression;
  const improvementEstablished = hasInterval && lowerScoreDelta >= minimumImprovement;
  const regressionDetected = Number.isFinite(upperScoreDelta) && upperScoreDelta < -maximumRegression;
  const sliceById = new Map(
    (Array.isArray(comparison?.slices) ? comparison.slices : [])
      .map((slice) => [normalizeString(slice?.sliceId), slice]),
  );
  const sliceResults = Array.from(sliceById.entries()).map(([sliceId, slice]) => {
    const lower = Number(slice?.scoreDeltaInterval?.lower);
    const enoughPairs = Number(slice?.pairedCount || 0) >= minimumSlicePairedCases;
    return {
      sliceId,
      pairedCount: Number(slice?.pairedCount || 0),
      enoughPairs,
      nonRegressionMet: enoughPairs && Number.isFinite(lower) && lower >= -maximumSliceRegression,
      scoreDeltaInterval: slice?.scoreDeltaInterval || { lower: null, upper: null },
    };
  });
  const missingRequiredSliceIds = requiredSliceIds.filter((sliceId) => {
    const result = sliceResults.find((slice) => slice.sliceId === sliceId);
    return !result?.enoughPairs;
  });
  const regressedSliceIds = sliceResults
    .filter((slice) => slice.enoughPairs && !slice.nonRegressionMet)
    .map((slice) => slice.sliceId);
  const slicesMet = missingRequiredSliceIds.length === 0 && regressedSliceIds.length === 0;
  const contractCompatible = comparison?.contractCompatible === true;
  const contractMet = !requireComparableFingerprints || contractCompatible;
  const accepted = contractMet && sampleSizeMet && coverageMet && nonInferiorityEstablished && slicesMet;
  return {
    accepted,
    targetImprovementEstablished: accepted && improvementEstablished,
    sampleSizeMet,
    coverageMet,
    contractMet,
    contractCompatible,
    nonInferiorityEstablished,
    improvementEstablished,
    regressionDetected,
    slicesMet,
    missingRequiredSliceIds,
    regressedSliceIds,
    sliceResults,
    policy: {
      maximumRegression,
      maximumSliceRegression,
      minimumImprovement,
      minimumPairedCases,
      minimumPairedCoverage,
      minimumSlicePairedCases,
      requiredSliceIds,
      requireComparableFingerprints,
    },
  };
}
