import assert from "node:assert/strict";
import test from "node:test";

import { compactFineTuningJobRecord } from "../domain/jobs.mjs";
import { createFineTuningJobOrchestrator } from "./job-orchestrator.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function missionControlJob() {
  const dataRows = Array.from({ length: 4 }, (_value, index) => ({
    id: `case_${index + 1}`,
    input: `Extract evidence ${index + 1}.`,
    expectedOutput: `Grounded finding ${index + 1}.`,
    evaluationGuidance: "Require exact source provenance.",
    optimizationRole: "train",
  }));
  const successPolicy = {
    casePassThreshold: 0.9,
    minimumAverageScore: 0.9,
    requiredPassRate: 0.9,
    minimumImprovement: 0.02,
    maximumRegression: 0.01,
    maximumSliceRegression: 0.01,
    minimumPairedCases: 2,
    minimumPairedCoverage: 0.8,
    requireComparableFingerprints: true,
  };
  return {
    id: "fine_tune_mission_control",
    name: "Mission Control optimization",
    agentId: "agent_target",
    environmentId: "environment_equal_care",
    evaluationSetIds: ["evaluation_equal_care"],
    status: "queued",
    metadata: {
      fineTuningOrchestrationState: {
        schemaVersion: 2,
        kind: "agent_optimization",
        phase: "queued",
        configuration: {
          schemaVersion: 2,
          kind: "agent_optimization",
          targetAgent: {
            id: "agent_target",
            name: "Evidence extractor",
            versionId: "agent_version_7",
            versionNumber: 7,
            versionLabel: "Version 7",
            snapshot: {
              id: "agent_target",
              name: "Evidence extractor",
              instructions: "Extract only source-grounded evidence.",
            },
          },
          fineTunerAgent: {
            id: "agent_optimizer",
            name: "Evidence optimizer",
          },
          environment: {
            type: "computer",
            id: "environment_equal_care",
            name: "Equal Care",
            projectId: "project_equal_care",
            revisionId: "environment_version_3",
            imageDigest: "sha256:environment",
          },
          evaluationTargets: [{
            id: "evaluation_equal_care",
            evaluationSetId: "evaluation_equal_care",
            evaluationSetName: "Equal Care validation",
            evaluationVersionId: "evaluation_version_4",
            evaluationVersionNumber: 4,
            evaluationVersionLabel: "Version 4",
            baselineMode: "fresh",
            caseCount: dataRows.length,
            required: true,
            weight: 1,
            passThreshold: 0.9,
            successPolicy,
            evaluationSetSnapshot: {
              id: "evaluation_equal_care",
              name: "Equal Care validation",
              activeVersionId: "evaluation_version_4",
              activeVersionNumber: 4,
              activeVersionLabel: "Version 4",
              passThreshold: 0.9,
              evaluator: { type: "rubric" },
              dataRows,
            },
          }],
          objective: {
            mode: "evaluation_targets",
            successPolicy,
            requireAllEvaluationTargets: true,
          },
          limits: {
            maxIterations: 2,
            budgetUsd: 5,
            maxDurationMinutes: 120,
            maxTransientRetries: 1,
            plateauIterations: 2,
            minimumIterationImprovement: 0.02,
          },
          publicationPolicy: {
            mode: "auto_on_target",
            publishBestOnLimit: false,
          },
          instructions: "Improve extraction without exposing holdout answers.",
        },
        iterations: [],
        events: [],
        costLedger: [],
      },
    },
  };
}

function completedRun(evaluationSet, options) {
  const phase = options.metadata.fineTuningPhase;
  const score = phase === "baseline" ? 0.3 : 0.95;
  const rows = evaluationSet.dataRows.filter((row) => (
    options.optimizationRoles.includes(row.optimizationRole)
  ));
  const cases = rows.map((row, index) => ({
    id: `${options.id}_case_${index + 1}`,
    dataRowId: row.id,
    input: row.input,
    expectedOutput: row.expectedOutput,
    optimizationRole: row.optimizationRole,
    sliceIds: [],
    score,
    status: score >= options.passThreshold ? "passed" : "failed",
    evaluatorReason: "Deterministic integration score.",
    threadId: `${options.id}_thread_${index + 1}`,
    costUsd: 0.01,
    costSource: "thread_usage_ct",
    latencyMs: 100,
  }));
  return {
    id: options.id,
    label: phase,
    evaluationSetId: evaluationSet.id,
    evaluationVersionId: options.evaluationVersionId,
    targetAgentId: options.targetAgentId,
    environmentId: options.environmentId,
    status: "completed",
    passThreshold: options.passThreshold,
    optimizationRoles: options.optimizationRoles,
    cases,
    averageScore: score,
    passRate: score >= options.passThreshold ? 1 : 0,
    passedCount: score >= options.passThreshold ? cases.length : 0,
    totalCount: cases.length,
    datasetFingerprint: "sha256:equal-care-dataset",
    caseSelectionFingerprint: `sha256:${options.optimizationRoles.join("-")}`,
    evaluatorFingerprint: "sha256:equal-care-evaluator",
    systemFingerprint: `sha256:${options.targetAgentVersionId || "active"}`,
    costUsd: 0.04,
    costTokens: 40,
  };
}

test("a Mission Control persisted job executes through the real optimization orchestrator", async () => {
  let current = compactFineTuningJobRecord(missionControlJob());
  const runs = new Map();
  let optimizerExecutions = 0;
  let publications = 0;
  const orchestrator = createFineTuningJobOrchestrator({
    async getJob() {
      return clone(current);
    },
    async saveJob(job) {
      current = compactFineTuningJobRecord(job);
      return clone(current);
    },
    async createEvaluationRun(evaluationSet, options) {
      const run = completedRun(evaluationSet, options);
      runs.set(run.id, run);
      return clone(run);
    },
    async getEvaluationRun(_jobId, runId) {
      return clone(runs.get(runId) || null);
    },
    async createOptimizerThread(_job, iterationNumber) {
      return {
        id: `optimizer_thread_${iterationNumber}`,
        title: `Optimizer ${iterationNumber}`,
        createdAt: "2026-07-27T08:00:00.000Z",
      };
    },
    async runOptimizerThread() {
      optimizerExecutions += 1;
      return JSON.stringify({
        instructions: "Extract source-grounded evidence with exact spans.",
        summary: "Tightened the provenance invariant.",
        risks: [],
      });
    },
    async readOptimizerThreadCosts() {
      return { costUsd: 0.05, costTokens: 50 };
    },
    async createCandidateVersion(_job, candidate) {
      return {
        id: `candidate_${candidate.iterationNumber}`,
        version: 8,
        label: "Candidate 1",
        status: "saved",
        snapshot: candidate.snapshot,
      };
    },
    async publishCandidateVersion(_job, version) {
      publications += 1;
      return { ...version, status: "published" };
    },
    buildFallbackInstructions() {
      return "Keep exact provenance.";
    },
    async delay() {},
  });

  const result = await orchestrator.start(current.id);

  assert.equal(result.phase, "completed_target_met");
  assert.equal(result.status, "completed");
  assert.equal(result.targetMet, true);
  assert.equal(result.configuration.targetAgent.id, "agent_target");
  assert.equal(
    result.configuration.evaluationTargets[0].evaluationVersionId,
    "evaluation_version_4",
  );
  assert.equal(result.configuration.environment.id, "environment_equal_care");
  assert.equal(result.configuration.limits.maxIterations, 2);
  assert.equal(result.configuration.limits.budgetUsd, 5);
  assert.equal(optimizerExecutions, 1);
  assert.equal(publications, 1);
  assert.equal(result.publicationDecision.status, "approved");
  assert.match(
    result.publicationDecision.evidenceFingerprint,
    /^sha256:[a-f0-9]{64}$/,
  );
});
