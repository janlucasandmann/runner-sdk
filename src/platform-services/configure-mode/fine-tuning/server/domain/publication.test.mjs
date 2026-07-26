import assert from "node:assert/strict";
import test from "node:test";

import {
  buildFineTuningPublicationDecision,
  resolveFineTuningPublicationCandidate,
} from "./publication.mjs";

function fixture() {
  const championIteration = {
    id: "iteration_1",
    number: 1,
    accepted: true,
    targetMet: true,
    candidateVersionId: "agent_version_2",
    candidateVersion: {
      id: "agent_version_2",
      status: "draft",
    },
    candidateSnapshot: {
      name: "Support agent",
      instructions: "Answer clearly.",
    },
    baselineMetrics: {
      averageScore: 0.7,
      costUsdPerCase: 0.01,
    },
    metrics: {
      averageScore: 0.9,
      costUsdPerCase: 0.011,
    },
    decisionEvidence: {
      accepted: true,
      results: [{
        evaluationSetId: "evaluation_1",
        accepted: true,
        efficiencyGate: {
          accepted: true,
          cost: {
            enabled: true,
            evidenceMet: true,
            accepted: true,
            increaseRatio: 0.1,
            maximumIncreaseRatio: 0.2,
          },
        },
      }],
    },
    evaluationRuns: [{
      evaluationSetId: "evaluation_1",
      runId: "run_candidate",
    }],
    caseComparisons: [],
  };
  const job = {
    id: "job_1",
    targetMet: true,
    configuration: {
      targetAgent: {
        id: "agent_1",
        versionId: "agent_version_1",
      },
      objective: {
        mode: "custom",
        successPolicy: {
          maximumCostIncreaseRatio: 0.2,
        },
      },
      publicationPolicy: {
        mode: "manual",
      },
      evaluationTargets: [{
        evaluationSetId: "evaluation_1",
        evaluationVersionId: "evaluation_version_1",
        passThreshold: 0.8,
      }],
    },
    iterations: [championIteration],
  };
  return { job, championIteration };
}

test("publication decisions bind the complete release evidence to schema v2", () => {
  const { job, championIteration } = fixture();
  const decision = buildFineTuningPublicationDecision(
    job,
    championIteration,
    false,
  );
  const approved = resolveFineTuningPublicationCandidate({
    ...job,
    publicationDecision: decision,
  }, decision.evidenceFingerprint);

  assert.equal(
    decision.evidenceSchemaVersion,
    "agent_optimization_publication_evidence_v2",
  );
  assert.match(decision.evidenceFingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.equal(approved.championIteration.id, championIteration.id);
});

test("publication approval rejects evidence changed after review", () => {
  const { job, championIteration } = fixture();
  const decision = buildFineTuningPublicationDecision(
    job,
    championIteration,
    false,
  );
  const tamperedJob = {
    ...job,
    iterations: [{
      ...championIteration,
      metrics: {
        ...championIteration.metrics,
        costUsdPerCase: 0.02,
      },
    }],
    publicationDecision: decision,
  };

  assert.throws(
    () => resolveFineTuningPublicationCandidate(
      tamperedJob,
      decision.evidenceFingerprint,
    ),
    /evidence no longer matches/i,
  );
});
