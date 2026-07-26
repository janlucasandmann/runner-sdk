import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateFineTuningObjective,
  evaluateFineTuningTarget,
  normalizeFineTuningSuccessPolicy,
} from "./policies.mjs";

const BASELINE_METRICS = Object.freeze({
  averageScore: 0.8,
  passRate: 0.8,
  passedCount: 8,
  totalCount: 10,
  costUsd: 1,
  costUsdPerCase: 0.1,
  averageLatencyMs: 1_000,
  costEvidenceAvailable: true,
  latencyEvidenceAvailable: true,
});

function evaluate(candidateMetrics, successPolicy = {}) {
  return evaluateFineTuningTarget({
    baselineMetrics: BASELINE_METRICS,
    candidateMetrics: {
      averageScore: 0.9,
      passRate: 0.9,
      passedCount: 9,
      totalCount: 10,
      costUsd: 1.05,
      costUsdPerCase: 0.105,
      averageLatencyMs: 1_050,
      costEvidenceAvailable: true,
      latencyEvidenceAvailable: true,
      ...candidateMetrics,
    },
    successPolicy: {
      minimumAverageScore: 0.85,
      requiredPassRate: 0.85,
      minimumImprovement: 0,
      maximumRegression: 0.05,
      ...successPolicy,
    },
  });
}

test("efficiency limits reject a quality-improving candidate with a cost regression", () => {
  const result = evaluate({
    costUsd: 1.3,
    costUsdPerCase: 0.13,
  }, {
    maximumCostIncreaseRatio: 0.1,
    maximumLatencyIncreaseRatio: 0.1,
  });

  assert.equal(result.efficiencyGate.cost.enabled, true);
  assert.equal(result.efficiencyGate.cost.evidenceMet, true);
  assert.equal(result.efficiencyGate.cost.accepted, false);
  assert.ok(result.efficiencyGate.cost.increaseRatio > 0.29);
  assert.equal(result.efficiencyGate.latency.accepted, true);
  assert.equal(result.accepted, false);
  assert.equal(result.targetMet, false);
});

test("a required efficiency measurement fails closed when evidence is missing", () => {
  const result = evaluate({
    averageLatencyMs: null,
    latencyEvidenceAvailable: false,
  }, {
    requireLatencyEvidence: true,
  });

  assert.equal(result.efficiencyGate.latency.enabled, true);
  assert.equal(result.efficiencyGate.latency.evidenceMet, false);
  assert.equal(result.efficiencyGate.latency.accepted, false);
  assert.equal(result.accepted, false);
});

test("unset and explicitly null limits do not enable an efficiency gate", () => {
  const normalized = normalizeFineTuningSuccessPolicy({
    maximumCostIncreaseRatio: null,
    maximumLatencyIncreaseRatio: null,
  });
  const result = evaluate({
    costEvidenceAvailable: false,
    latencyEvidenceAvailable: false,
  }, normalized);

  assert.equal(normalized.requireCostEvidence, false);
  assert.equal(normalized.requireLatencyEvidence, false);
  assert.equal(result.efficiencyGate.cost.enabled, false);
  assert.equal(result.efficiencyGate.latency.enabled, false);
  assert.equal(result.accepted, true);
  assert.equal(result.targetMet, true);
});

test("efficiency gates accept a candidate within configured limits", () => {
  const result = evaluate({}, {
    maximumCostIncreaseRatio: 0.1,
    maximumLatencyIncreaseRatio: 0.1,
  });

  assert.equal(result.efficiencyGate.cost.accepted, true);
  assert.equal(result.efficiencyGate.latency.accepted, true);
  assert.equal(result.accepted, true);
  assert.equal(result.targetMet, true);
});

test("a positive candidate cost cannot pass a ratio gate against a zero-cost baseline", () => {
  const result = evaluateFineTuningTarget({
    baselineMetrics: {
      ...BASELINE_METRICS,
      costUsd: 0,
      costUsdPerCase: 0,
    },
    candidateMetrics: {
      ...BASELINE_METRICS,
      averageScore: 0.9,
      passRate: 0.9,
      costUsd: 0.1,
      costUsdPerCase: 0.01,
    },
    successPolicy: {
      minimumAverageScore: 0.85,
      requiredPassRate: 0.85,
      maximumCostIncreaseRatio: 1,
    },
  });

  assert.equal(result.efficiencyGate.cost.evidenceMet, true);
  assert.equal(result.efficiencyGate.cost.increaseRatio, null);
  assert.equal(result.efficiencyGate.cost.accepted, false);
  assert.equal(result.accepted, false);
});

test("global efficiency limits also apply when quality thresholds come from evaluation targets", () => {
  const result = evaluateFineTuningObjective({
    baselineByTarget: {
      evaluation_1: BASELINE_METRICS,
    },
    candidateByTarget: {
      evaluation_1: {
        ...BASELINE_METRICS,
        averageScore: 0.9,
        passRate: 0.9,
        costUsd: 1.5,
        costUsdPerCase: 0.15,
      },
    },
    evaluationTargets: [{
      evaluationSetId: "evaluation_1",
      passThreshold: 0.8,
      successPolicy: {
        minimumAverageScore: 0.85,
        requiredPassRate: 0.85,
      },
    }],
    objective: {
      mode: "evaluation_targets",
      successPolicy: {
        maximumCostIncreaseRatio: 0.1,
      },
    },
  });

  assert.equal(result.results[0]?.policy?.minimumAverageScore, 0.85);
  assert.equal(result.results[0]?.efficiencyGate?.cost?.enabled, true);
  assert.equal(result.results[0]?.efficiencyGate?.cost?.accepted, false);
  assert.equal(result.accepted, false);
  assert.equal(result.targetMet, false);
});
