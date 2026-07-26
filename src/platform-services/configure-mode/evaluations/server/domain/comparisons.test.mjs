import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPairedEvaluationComparison,
  evaluatePairedComparisonGate,
} from "./comparisons.mjs";

function run(id, scores, options = {}) {
  return {
    id,
    runFingerprint: `sha256:${id}`,
    datasetFingerprint: options.datasetFingerprint || "sha256:shared-dataset",
    caseSelectionFingerprint: options.caseSelectionFingerprint || "sha256:shared-selection",
    evaluatorFingerprint: options.evaluatorFingerprint || "sha256:shared-evaluator",
    systemFingerprint: options.systemFingerprint || `sha256:${id}-system`,
    passThreshold: options.passThreshold ?? 0.5,
    cases: scores.map((entry, index) => ({
      id: `${id}_case_${index + 1}`,
      dataRowId: entry.dataRowId || `row_${index + 1}`,
      dataRowRunIndex: entry.runIndex || 1,
      score: entry.score,
      status: entry.status || (entry.score >= (options.passThreshold ?? 0.5) ? "passed" : "failed"),
      sliceIds: entry.sliceIds || [],
      optimizationRole: entry.optimizationRole || "holdout",
    })),
  };
}

test("paired bootstrap comparison is deterministic and preserves paired deltas", () => {
  const baseline = run("baseline", [
    { score: 0.2 },
    { score: 0.4 },
    { score: 0.6 },
    { score: 0.8 },
  ]);
  const candidate = run("candidate", [
    { score: 0.3 },
    { score: 0.5 },
    { score: 0.7 },
    { score: 0.9 },
  ]);

  const first = buildPairedEvaluationComparison(baseline, candidate, {
    bootstrapIterations: 1_000,
  });
  const second = buildPairedEvaluationComparison(baseline, candidate, {
    bootstrapIterations: 1_000,
  });

  assert.deepEqual(first, second);
  assert.equal(first.pairedCount, 4);
  assert.equal(first.pairedCoverage, 1);
  assert.ok(Math.abs(first.meanDelta - 0.1) < 1e-12);
  assert.ok(Math.abs(first.scoreDeltaInterval.lower - 0.1) < 1e-12);
  assert.ok(Math.abs(first.scoreDeltaInterval.upper - 0.1) < 1e-12);
  assert.equal(first.probabilityOfImprovement, 1);
});

test("unscored and unmatched cases are disclosed and never imputed as zero", () => {
  const baseline = run("baseline_missing", [
    { dataRowId: "paired", score: 0.4 },
    { dataRowId: "unscored", score: null, status: "grader_error" },
    { dataRowId: "baseline_only", score: 0.9 },
  ]);
  const candidate = run("candidate_missing", [
    { dataRowId: "paired", score: 0.7 },
    { dataRowId: "candidate_only", score: 0.8 },
  ]);

  const comparison = buildPairedEvaluationComparison(baseline, candidate);

  assert.equal(comparison.pairedCount, 1);
  assert.equal(comparison.baselineUnscoredCount, 1);
  assert.deepEqual(comparison.unmatchedBaselineKeys, ["baseline_only::1"]);
  assert.deepEqual(comparison.unmatchedCandidateKeys, ["candidate_only::1"]);
  assert.equal(comparison.pairedCoverage, 0.5);
  assert.ok(Math.abs(comparison.meanDelta - 0.3) < 1e-12);
});

test("repeated trials are paired by repeat and aggregated within dataset row for inference", () => {
  const baseline = run("baseline_repeats", [
    { dataRowId: "row_a", runIndex: 1, score: 0 },
    { dataRowId: "row_a", runIndex: 2, score: 0 },
    { dataRowId: "row_a", runIndex: 3, score: 0 },
    { dataRowId: "row_b", runIndex: 1, score: 0 },
  ]);
  const candidate = run("candidate_repeats", [
    { dataRowId: "row_a", runIndex: 1, score: 1 },
    { dataRowId: "row_a", runIndex: 2, score: 1 },
    { dataRowId: "row_a", runIndex: 3, score: 1 },
    { dataRowId: "row_b", runIndex: 1, score: 0 },
  ]);

  const comparison = buildPairedEvaluationComparison(baseline, candidate);

  assert.equal(comparison.pairedCount, 2);
  assert.equal(comparison.pairedTrialCount, 4);
  assert.equal(comparison.meanDelta, 0.5);
});

test("dataset row identifiers containing pair delimiters remain distinct", () => {
  const baseline = run("baseline_complex_ids", [
    { dataRowId: "row::segment", score: 0.2 },
    { dataRowId: "row", score: 0.4 },
  ]);
  const candidate = run("candidate_complex_ids", [
    { dataRowId: "row::segment", score: 0.4 },
    { dataRowId: "row", score: 0.6 },
  ]);

  const comparison = buildPairedEvaluationComparison(baseline, candidate);

  assert.equal(comparison.pairedCount, 2);
  assert.deepEqual(
    comparison.pairs.map((pair) => pair.dataRowId).sort(),
    ["row", "row::segment"],
  );
});

test("slice non-regression blocks promotion even when the overall mean improves", () => {
  const generalBaseline = Array.from({ length: 20 }, (_item, index) => ({
    dataRowId: `general_${index + 1}`,
    score: 0.2,
    sliceIds: ["general"],
  }));
  const generalCandidate = Array.from({ length: 20 }, (_item, index) => ({
    dataRowId: `general_${index + 1}`,
    score: 0.8,
    sliceIds: ["general"],
  }));
  const baseline = run("baseline_slices", [
    ...generalBaseline,
    { dataRowId: "safety_1", score: 0.9, sliceIds: ["safety"] },
    { dataRowId: "safety_2", score: 0.9, sliceIds: ["safety"] },
  ]);
  const candidate = run("candidate_slices", [
    ...generalCandidate,
    { dataRowId: "safety_1", score: 0.6, sliceIds: ["safety"] },
    { dataRowId: "safety_2", score: 0.6, sliceIds: ["safety"] },
  ]);
  const comparison = buildPairedEvaluationComparison(baseline, candidate);
  const gate = evaluatePairedComparisonGate(comparison, {
    maximumRegression: 0.05,
    maximumSliceRegression: 0.05,
    minimumPairedCases: 20,
    minimumSlicePairedCases: 2,
    requiredSliceIds: ["safety"],
  });

  assert.ok(comparison.meanDelta > 0);
  assert.equal(gate.nonInferiorityEstablished, true);
  assert.equal(gate.slicesMet, false);
  assert.deepEqual(gate.regressedSliceIds, ["safety"]);
  assert.equal(gate.accepted, false);
});

test("paired gate requires configured coverage and required-slice evidence", () => {
  const baseline = run("baseline_coverage", [
    { dataRowId: "paired", score: 0.4, sliceIds: ["general"] },
    { dataRowId: "missing", score: 0.4, sliceIds: ["safety"] },
  ]);
  const candidate = run("candidate_coverage", [
    { dataRowId: "paired", score: 0.8, sliceIds: ["general"] },
  ]);
  const comparison = buildPairedEvaluationComparison(baseline, candidate);
  const gate = evaluatePairedComparisonGate(comparison, {
    minimumPairedCoverage: 1,
    requiredSliceIds: ["safety"],
  });

  assert.equal(gate.coverageMet, false);
  assert.deepEqual(gate.missingRequiredSliceIds, ["safety"]);
  assert.equal(gate.accepted, false);
});

test("comparison gate rejects mismatched evaluator or dataset contracts", () => {
  const baseline = run("baseline_contract", [
    { dataRowId: "paired", score: 0.4 },
  ]);
  const candidate = run("candidate_contract", [
    { dataRowId: "paired", score: 0.9 },
  ], {
    evaluatorFingerprint: "sha256:different-evaluator",
  });
  const comparison = buildPairedEvaluationComparison(baseline, candidate);
  const gate = evaluatePairedComparisonGate(comparison);

  assert.equal(comparison.contractCompatible, false);
  assert.deepEqual(comparison.contractMismatches, ["evaluator"]);
  assert.equal(gate.contractMet, false);
  assert.equal(gate.accepted, false);
});

test("a single paired case can never establish promotion evidence", () => {
  const baseline = run("baseline_single", [
    { dataRowId: "only_case", score: 0 },
  ]);
  const candidate = run("candidate_single", [
    { dataRowId: "only_case", score: 1 },
  ]);
  const comparison = buildPairedEvaluationComparison(baseline, candidate);
  const gate = evaluatePairedComparisonGate(comparison, {
    minimumPairedCases: 1,
  });

  assert.equal(comparison.pairedCount, 1);
  assert.equal(gate.policy.minimumPairedCases, 2);
  assert.equal(gate.sampleSizeMet, false);
  assert.equal(gate.accepted, false);
});
