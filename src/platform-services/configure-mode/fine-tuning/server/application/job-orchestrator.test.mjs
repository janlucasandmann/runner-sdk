import assert from "node:assert/strict";
import test from "node:test";

import { createFineTuningJobOrchestrator } from "./job-orchestrator.mjs";
import { compactFineTuningJobRecord } from "../domain/jobs.mjs";

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function createEvaluationSet({
  id = "evaluation_support",
  rows = Array.from({ length: 10 }, (_item, index) => ({
    id: `case_train_${index + 1}`,
    input: `Say hello (${index + 1}).`,
    expectedOutput: "Hello.",
    optimizationRole: "train",
  })),
} = {}) {
  return {
    id,
    name: "Support Quality",
    activeVersionId: `${id}_version_1`,
    activeVersionNumber: 1,
    activeVersionLabel: "Version 1",
    passThreshold: 0.8,
    evaluator: { type: "exact" },
    dataRows: rows,
  };
}

function createJob({
  id = "fine_tune_test",
  evaluationSet = createEvaluationSet(),
  baselineMode = "fresh",
  baselineRunId = "",
  budgetUsd = 10,
  maxIterations = 1,
  plateauIterations = 2,
  minimumIterationImprovement = 0.01,
  objective = {
    mode: "custom",
    successPolicy: {
      minimumAverageScore: 0.8,
      requiredPassRate: 0.8,
      minimumImprovement: 0,
      maximumRegression: 0.05,
    },
  },
  publicationPolicy = { mode: "manual", publishBestOnLimit: false },
  phase = "queued",
  status = "running",
  iterations = [],
} = {}) {
  return compactFineTuningJobRecord({
    id,
    name: "Support optimizer",
    phase,
    status,
    createdAt: "2026-07-25T08:00:00.000Z",
    updatedAt: "2026-07-25T08:00:00.000Z",
    configuration: {
      targetAgent: {
        id: "agent_target",
        name: "Support Agent",
        versionId: "agent_version_1",
        versionNumber: 1,
        versionLabel: "Version 1",
        snapshot: {
          id: "agent_target",
          name: "Support Agent",
          instructions: "Answer clearly.",
        },
      },
      fineTunerAgent: {
        id: "agent_optimizer",
        name: "Optimizer",
      },
      environment: {
        type: "computer",
        id: "computer_default",
        name: "Default",
      },
      evaluationTargets: [{
        evaluationSetId: evaluationSet.id,
        evaluationSetName: evaluationSet.name,
        evaluationVersionId: evaluationSet.activeVersionId,
        evaluationVersionNumber: evaluationSet.activeVersionNumber,
        evaluationVersionLabel: evaluationSet.activeVersionLabel,
        baselineMode,
        baselineRunId,
        passThreshold: evaluationSet.passThreshold,
        evaluationSetSnapshot: evaluationSet,
      }],
      objective,
      limits: {
        maxIterations,
        budgetUsd,
        maxDurationMinutes: 120,
        maxTransientRetries: 1,
        plateauIterations,
        minimumIterationImprovement,
      },
      publicationPolicy,
      instructions: "Prefer general improvements.",
    },
    iterations,
    events: [],
    costLedger: [],
  });
}

function createCompletedRun({
  id,
  evaluationSet,
  phase,
  iterationNumber = 0,
  scoreForCase,
  optimizationRoles = [],
  costUsd = 0.1,
  latencyMs = 1_000,
  targetAgentId = "agent_target",
  environmentId = "computer_default",
  evaluationVersionId = evaluationSet.activeVersionId,
}) {
  const roles = optimizationRoles.length
    ? optimizationRoles
    : Array.from(new Set(evaluationSet.dataRows.map((row) => row.optimizationRole || "train")));
  const rows = evaluationSet.dataRows.filter((row) => roles.includes(row.optimizationRole || "train"));
  const cases = rows.map((row, index) => {
    const score = Number(scoreForCase({ row, phase, iterationNumber, index })) || 0;
    return {
      id: `${id}_case_${index + 1}`,
      dataRowId: row.id,
      input: row.input,
      expectedOutput: row.expectedOutput,
      optimizationRole: row.optimizationRole || "train",
      sliceIds: row.sliceIds || [],
      score,
      status: score >= evaluationSet.passThreshold ? "passed" : "failed",
      evaluatorReason: `Scored ${(score * 100).toFixed(0)}%.`,
      threadId: `${id}_thread_${index + 1}`,
      costUsd: rows.length > 0 ? costUsd / rows.length : 0,
      costSource: "thread_usage_ct",
      latencyMs,
    };
  });
  const averageScore = cases.length
    ? cases.reduce((sum, item) => sum + item.score, 0) / cases.length
    : 0;
  const passedCount = cases.filter((item) => item.score >= evaluationSet.passThreshold).length;
  return {
    id,
    label: phase === "baseline" ? "Baseline" : `Iteration ${iterationNumber}`,
    evaluationSetId: evaluationSet.id,
    evaluationVersionId,
    targetAgentId,
    environmentId,
    status: "completed",
    passThreshold: evaluationSet.passThreshold,
    optimizationRoles: roles,
    cases,
    averageScore,
    passRate: cases.length ? passedCount / cases.length : 0,
    passedCount,
    totalCount: cases.length,
    datasetFingerprint: `sha256:dataset:${evaluationSet.id}`,
    caseSelectionFingerprint: `sha256:selection:${evaluationSet.id}:${roles.join(",")}`,
    evaluatorFingerprint: `sha256:evaluator:${evaluationSet.id}`,
    systemFingerprint: `sha256:system:${targetAgentId}:${id}`,
    costUsd,
    costSource: "thread_usage_ct",
    costTokens: Math.round(costUsd * 1000),
  };
}

function createHarness({
  job,
  evaluationSet,
  scores = {
    baseline: { train: 0.4, validation: 0.4, holdout: 0.2 },
    verification: { train: 0.9, validation: 0.9, holdout: 0.9 },
    final_baseline: { train: 0.4, validation: 0.4, holdout: 0.2 },
    final: { train: 0.9, validation: 0.9, holdout: 0.9 },
  },
  evaluationCostUsd = 0.1,
  evaluationCostUsdByPhase = {},
  evaluationLatencyMsByPhase = {},
  optimizerCostUsd = 0.05,
  evaluationCreateFailures = 0,
  seededRuns = [],
} = {}) {
  let currentJob = compactFineTuningJobRecord(job);
  const runs = new Map(seededRuns.map((run) => [run.id, clone(run)]));
  const calls = {
    createdEvaluationRuns: 0,
    evaluationCreateAttempts: 0,
    evaluationRunRequests: [],
    optimizerThreads: 0,
    optimizerExecutions: 0,
    candidateVersions: 0,
    publishedVersions: 0,
    prompts: [],
  };
  const scoreForCase = ({ row, phase, iterationNumber }) => {
    const phaseScores = scores[phase] || scores.verification || {};
    const configured = phaseScores[row.id] ?? phaseScores[row.optimizationRole || "train"];
    if (Array.isArray(configured)) {
      return configured[Math.max(0, iterationNumber - 1)] ?? configured.at(-1) ?? 0;
    }
    return Number(configured ?? phaseScores.default ?? 0);
  };
  const orchestrator = createFineTuningJobOrchestrator({
    async getJob() {
      return clone(currentJob);
    },
    async saveJob(nextJob) {
      currentJob = compactFineTuningJobRecord(nextJob);
      return clone(currentJob);
    },
    async createEvaluationRun(set, options) {
      calls.evaluationCreateAttempts += 1;
      if (calls.evaluationCreateAttempts <= evaluationCreateFailures) {
        throw Object.assign(new TypeError("fetch failed"), {
          cause: { code: "ECONNRESET" },
        });
      }
      calls.evaluationRunRequests.push(clone(options));
      if (runs.has(options.id)) return clone(runs.get(options.id));
      calls.createdEvaluationRuns += 1;
      const phase = options.metadata?.fineTuningPhase || "verification";
      const run = createCompletedRun({
        id: options.id,
        evaluationSet: set,
        phase,
        iterationNumber: options.metadata?.fineTuningIteration || 0,
        scoreForCase,
        optimizationRoles: options.optimizationRoles,
        costUsd: Number(evaluationCostUsdByPhase[phase] ?? evaluationCostUsd),
        latencyMs: Number(evaluationLatencyMsByPhase[phase] ?? 1_000),
      });
      runs.set(run.id, run);
      return clone(run);
    },
    async getEvaluationRun(_jobId, runId) {
      return clone(runs.get(runId) || null);
    },
    async createOptimizerThread(_job, iterationNumber) {
      calls.optimizerThreads += 1;
      return {
        id: `optimizer_thread_${iterationNumber}`,
        title: `Optimizer ${iterationNumber}`,
        createdAt: "2026-07-25T08:01:00.000Z",
      };
    },
    async runOptimizerThread(_threadId, prompt) {
      calls.optimizerExecutions += 1;
      calls.prompts.push(prompt);
      return JSON.stringify({
        instructions: `Answer clearly. Candidate ${calls.optimizerExecutions}.`,
        summary: "Improve the observed failure mode.",
        risks: [],
      });
    },
    async readOptimizerThreadCosts() {
      return {
        costUsd: optimizerCostUsd,
        costTokens: Math.round(optimizerCostUsd * 1000),
      };
    },
    async createCandidateVersion(_job, candidate) {
      calls.candidateVersions += 1;
      return {
        id: `candidate_version_${candidate.iterationNumber}`,
        version: candidate.iterationNumber + 1,
        label: `Candidate ${candidate.iterationNumber}`,
        status: "draft",
      };
    },
    async publishCandidateVersion(_job, version) {
      calls.publishedVersions += 1;
      return { ...version, status: "published" };
    },
    buildFallbackInstructions() {
      return "Fallback instructions.";
    },
    async delay() {},
  });
  return {
    orchestrator,
    calls,
    runs,
    readJob: () => clone(currentJob),
    writeJob(nextJob) {
      currentJob = compactFineTuningJobRecord(nextJob);
    },
  };
}

test("fresh baseline creates a draft candidate and independent verification", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    job: createJob({ evaluationSet }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "awaiting_review");
  assert.equal(result.stopReason, "completed_target_met");
  assert.equal(result.targetMet, true);
  assert.equal(harness.calls.createdEvaluationRuns, 2);
  assert.equal(harness.calls.optimizerThreads, 1);
  assert.equal(harness.calls.optimizerExecutions, 1);
  assert.equal(harness.calls.candidateVersions, 1);
  assert.equal(harness.calls.publishedVersions, 0);
  assert.equal(result.publicationDecision.status, "pending");
  assert.equal(result.publicationDecision.decisionType, "manual_review");
  assert.equal(
    result.publicationDecision.evidenceSchemaVersion,
    "agent_optimization_publication_evidence_v2",
  );
  assert.match(result.publicationDecision.evidenceFingerprint, /^sha256:[a-f0-9]{64}$/);
  assert.deepEqual(result.iterations.map((iteration) => iteration.number), [0, 1]);
  assert.equal(result.iterations[1].caseComparisons[0].cases[0].candidateScore, 0.9);
  assert.equal(harness.calls.evaluationRunRequests[0].targetBinding.kind, "agent");
  assert.equal(harness.calls.evaluationRunRequests[0].targetBinding.candidateAuthority, undefined);
  assert.deepEqual(
    harness.calls.evaluationRunRequests[1].targetBinding.candidateAuthority,
    {
      kind: "agent_optimization_job",
      id: "fine_tune_test",
      purpose: "verification",
      iterationNumber: 1,
    },
  );
  assert.equal(
    harness.calls.evaluationRunRequests[1].targetBinding.targetVersionId,
    "candidate_version_1",
  );
});

test("a completed zero-score baseline remains scoreable optimization evidence", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    scores: {
      baseline: { train: 0 },
      verification: { train: 1 },
      final_baseline: { train: 0 },
      final: { train: 1 },
    },
    job: createJob({
      evaluationSet,
      objective: {
        mode: "custom",
        successPolicy: {
          minimumAverageScore: 1,
          requiredPassRate: 1,
          minimumImprovement: 0.5,
          maximumRegression: 0,
        },
      },
    }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "awaiting_review");
  assert.equal(result.targetMet, true);
  assert.equal(result.iterations[0].metrics.averageScore, 0);
  assert.equal(result.iterations[1].baselineMetrics.averageScore, 0);
  assert.equal(result.iterations[1].metrics.averageScore, 1);
  assert.equal(result.improvementScore, 1);
  assert.equal(harness.calls.optimizerExecutions, 1);
  assert.equal(harness.calls.candidateVersions, 1);
});

test("an explicitly approved manual candidate resumes at publication without rerunning optimization", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    job: createJob({ evaluationSet }),
  });
  const pending = await harness.orchestrator.start("fine_tune_test");
  harness.writeJob({
    ...pending,
    phase: "publishing",
    status: "running",
    publicationDecision: {
      ...pending.publicationDecision,
      status: "approved",
      decisionType: "human_approval",
      actor: {
        id: "user_reviewer",
        type: "user",
        name: "Reviewer",
      },
      evaluatedAt: "2026-07-25T08:05:00.000Z",
    },
  });

  const published = await harness.orchestrator.start("fine_tune_test");

  assert.equal(published.phase, "completed_target_met");
  assert.equal(published.status, "completed");
  assert.equal(published.agentVersionCreationStatus, "published");
  assert.equal(published.publicationDecision.status, "approved");
  assert.equal(published.publicationDecision.actor?.id, "user_reviewer");
  assert.ok(published.publicationDecision.publishedAt);
  assert.equal(harness.calls.createdEvaluationRuns, 2);
  assert.equal(harness.calls.optimizerExecutions, 1);
  assert.equal(harness.calls.candidateVersions, 1);
  assert.equal(harness.calls.publishedVersions, 1);
});

test("automatic publication records the policy decision and evidence before publishing", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    job: createJob({
      evaluationSet,
      publicationPolicy: {
        mode: "auto_on_target",
        publishBestOnLimit: false,
      },
    }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "completed_target_met");
  assert.equal(result.agentVersionCreationStatus, "published");
  assert.equal(harness.calls.publishedVersions, 1);
  assert.equal(result.publicationDecision.status, "approved");
  assert.equal(result.publicationDecision.decisionType, "policy");
  assert.equal(
    result.publicationDecision.evidenceSchemaVersion,
    "agent_optimization_publication_evidence_v2",
  );
  assert.equal(result.publicationDecision.actor?.type, "policy");
  assert.equal(
    result.publicationDecision.candidateVersionId,
    result.createdAgentVersionId,
  );
  assert.match(result.publicationDecision.evidenceFingerprint, /^sha256:[a-f0-9]{64}$/);
});

test("baseline creation retries transient transport failures", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    evaluationCreateFailures: 1,
    job: createJob({ evaluationSet }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "awaiting_review");
  assert.equal(harness.calls.evaluationCreateAttempts, 3);
  assert.equal(harness.calls.createdEvaluationRuns, 2);
});

test("budget exhaustion stops before optimization without losing the baseline", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    evaluationCostUsd: 0.5,
    job: createJob({
      evaluationSet,
      budgetUsd: 0.5,
      maxIterations: 3,
    }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "stopped_budget");
  assert.equal(result.stopReason, "stopped_budget");
  assert.equal(result.iterations.length, 1);
  assert.equal(result.iterations[0].kind, "baseline");
  assert.equal(harness.calls.optimizerExecutions, 0);
  assert.equal(harness.calls.candidateVersions, 0);
});

test("sealed holdout cases never enter optimizer evidence and run alone at final verification", async () => {
  const evaluationSet = createEvaluationSet({
    rows: [
      ...Array.from({ length: 10 }, (_item, index) => ({
        id: `case_train_${index + 1}`,
        input: `Visible training prompt ${index + 1}.`,
        expectedOutput: "Visible expected output.",
        optimizationRole: "train",
      })),
      {
        id: "case_holdout",
        input: "SEALED_HOLDOUT_SECRET",
        expectedOutput: "SEALED_HOLDOUT_ANSWER",
        optimizationRole: "holdout",
      },
      ...Array.from({ length: 9 }, (_item, index) => ({
        id: `case_holdout_${index + 2}`,
        input: `Additional sealed holdout ${index + 2}.`,
        expectedOutput: "Sealed expected output.",
        optimizationRole: "holdout",
      })),
    ],
  });
  const harness = createHarness({
    evaluationSet,
    job: createJob({ evaluationSet }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "awaiting_review");
  assert.equal(harness.calls.evaluationRunRequests.length, 4);
  assert.deepEqual(harness.calls.evaluationRunRequests[0].optimizationRoles, ["train"]);
  assert.deepEqual(harness.calls.evaluationRunRequests[1].optimizationRoles, ["train"]);
  assert.deepEqual(harness.calls.evaluationRunRequests[2].optimizationRoles, ["holdout"]);
  assert.deepEqual(harness.calls.evaluationRunRequests[3].optimizationRoles, ["holdout"]);
  assert.equal(harness.calls.evaluationRunRequests[2].metadata.fineTuningPhase, "final_baseline");
  assert.equal(harness.calls.evaluationRunRequests[3].metadata.fineTuningPhase, "final");
  assert.ok(harness.calls.evaluationRunRequests.every((request) => (
    request.purpose === "optimization"
  )));
  assert.equal(
    harness.calls.evaluationRunRequests[2].targetBinding.candidateAuthority,
    undefined,
  );
  assert.deepEqual(
    harness.calls.evaluationRunRequests[3].targetBinding.candidateAuthority,
    {
      kind: "agent_optimization_job",
      id: "fine_tune_test",
      purpose: "verification",
      iterationNumber: 1,
    },
  );
  assert.equal(harness.calls.prompts.length, 1);
  assert.doesNotMatch(harness.calls.prompts[0], /SEALED_HOLDOUT_SECRET|SEALED_HOLDOUT_ANSWER/);
  assert.match(harness.calls.prompts[0], /"averageScore": 0\.39/);
  assert.equal(result.iterations[1].evaluationRuns[0].phase, "final");
  assert.ok(Math.abs(result.iterations[1].metrics.averageScore - 0.9) < 1e-12);
});

test("candidate-ready jobs resume without creating a duplicate optimizer thread or version", async () => {
  const evaluationSet = createEvaluationSet();
  const baselineRun = createCompletedRun({
    id: "baseline_existing",
    evaluationSet,
    phase: "baseline",
    scoreForCase: () => 0.4,
    costUsd: 0.1,
  });
  const job = createJob({
    evaluationSet,
    phase: "candidate_ready",
    iterations: [
      {
        id: "baseline_iteration",
        number: 0,
        status: "completed_best_effort",
        evaluationRuns: [{
          evaluationSetId: evaluationSet.id,
          evaluationSetName: evaluationSet.name,
          phase: "baseline",
          runId: baselineRun.id,
          status: "completed",
          metrics: {
            averageScore: 0.4,
            passRate: 0,
            totalCount: 1,
            passedCount: 0,
          },
        }],
        metrics: {
          averageScore: 0.4,
          passRate: 0,
          totalCount: 1,
          passedCount: 0,
        },
        accepted: true,
      },
      {
        id: "candidate_iteration",
        number: 1,
        status: "candidate_ready",
        optimizerThreadId: "optimizer_thread_1",
        optimizerThreadTitle: "Optimizer 1",
        candidateVersion: {
          id: "candidate_version_1",
          version: 2,
          label: "Candidate 1",
          status: "draft",
        },
        candidateVersionId: "candidate_version_1",
        candidateSnapshot: {
          id: "agent_target",
          name: "Support Agent",
          instructions: "Restored candidate instructions.",
        },
        analysisSummary: "Restored candidate.",
      },
    ],
  });
  const harness = createHarness({
    evaluationSet,
    job,
    seededRuns: [baselineRun],
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "awaiting_review");
  assert.equal(harness.calls.optimizerThreads, 0);
  assert.equal(harness.calls.optimizerExecutions, 0);
  assert.equal(harness.calls.candidateVersions, 0);
  assert.equal(harness.calls.createdEvaluationRuns, 1);
  assert.equal(result.iterations.filter((iteration) => iteration.number === 1).length, 1);
});

test("an incompatible existing baseline fails before optimizer work starts", async () => {
  const evaluationSet = createEvaluationSet();
  const incompatibleRun = createCompletedRun({
    id: "baseline_wrong_agent",
    evaluationSet,
    phase: "baseline",
    scoreForCase: () => 0.5,
    targetAgentId: "agent_other",
  });
  const harness = createHarness({
    evaluationSet,
    seededRuns: [incompatibleRun],
    job: createJob({
      evaluationSet,
      baselineMode: "existing",
      baselineRunId: incompatibleRun.id,
    }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");

  assert.equal(result.phase, "failed");
  assert.match(result.error, /different agent/i);
  assert.equal(harness.calls.createdEvaluationRuns, 0);
  assert.equal(harness.calls.optimizerExecutions, 0);
});

test("a statistically regressed required slice rejects an otherwise improving candidate", async () => {
  const generalRows = Array.from({ length: 20 }, (_item, index) => ({
    id: `case_general_${index + 1}`,
    input: `General case ${index + 1}`,
    expectedOutput: "Good",
    optimizationRole: "train",
    sliceIds: ["general"],
  }));
  const safetyRows = Array.from({ length: 2 }, (_item, index) => ({
    id: `case_safety_${index + 1}`,
    input: `Safety case ${index + 1}`,
    expectedOutput: "Safe",
    optimizationRole: "train",
    sliceIds: ["safety"],
  }));
  const evaluationSet = createEvaluationSet({
    rows: [...generalRows, ...safetyRows],
  });
  const baselineScores = Object.fromEntries([
    ...generalRows.map((row) => [row.id, 0.2]),
    ...safetyRows.map((row) => [row.id, 0.9]),
  ]);
  const candidateScores = Object.fromEntries([
    ...generalRows.map((row) => [row.id, 0.8]),
    ...safetyRows.map((row) => [row.id, 0.6]),
  ]);
  const harness = createHarness({
    evaluationSet,
    scores: {
      baseline: baselineScores,
      verification: candidateScores,
    },
    job: createJob({
      evaluationSet,
      objective: {
        mode: "custom",
        successPolicy: {
          minimumAverageScore: 0.5,
          requiredPassRate: 0,
          minimumImprovement: 0,
          maximumRegression: 0.05,
          maximumSliceRegression: 0.05,
          minimumPairedCases: 20,
          minimumSlicePairedCases: 2,
          requiredSliceIds: ["safety"],
        },
      },
    }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");
  const candidateIteration = result.iterations.find((iteration) => iteration.number === 1);
  const targetDecision = candidateIteration?.decisionEvidence?.results?.[0];

  assert.equal(candidateIteration?.decision, "rejected");
  assert.equal(candidateIteration?.accepted, false);
  assert.ok(candidateIteration?.metrics?.averageScore > candidateIteration?.baselineMetrics?.averageScore);
  assert.deepEqual(targetDecision?.statisticalGate?.regressedSliceIds, ["safety"]);
  assert.equal(
    candidateIteration?.caseComparisons?.[0]?.statisticalComparison?.schemaVersion,
    "paired_evaluation_comparison_v1",
  );
});

test("an efficiency regression rejects a statistically improving candidate", async () => {
  const evaluationSet = createEvaluationSet();
  const harness = createHarness({
    evaluationSet,
    evaluationCostUsdByPhase: {
      baseline: 0.1,
      verification: 0.2,
    },
    evaluationLatencyMsByPhase: {
      baseline: 1_000,
      verification: 1_050,
    },
    job: createJob({
      evaluationSet,
      objective: {
        mode: "custom",
        successPolicy: {
          minimumAverageScore: 0.8,
          requiredPassRate: 0.8,
          minimumImprovement: 0,
          maximumRegression: 0.05,
          maximumCostIncreaseRatio: 0.1,
          maximumLatencyIncreaseRatio: 0.1,
        },
      },
    }),
  });

  const result = await harness.orchestrator.start("fine_tune_test");
  const candidateIteration = result.iterations.find((iteration) => iteration.number === 1);
  const targetDecision = candidateIteration?.decisionEvidence?.results?.[0];

  assert.equal(candidateIteration?.accepted, false);
  assert.equal(targetDecision?.statisticalGate?.accepted, true);
  assert.equal(targetDecision?.efficiencyGate?.cost?.evidenceMet, true);
  assert.equal(targetDecision?.efficiencyGate?.cost?.accepted, false);
  assert.equal(targetDecision?.efficiencyGate?.latency?.accepted, true);
  assert.ok(
    candidateIteration?.metrics?.averageScore
      > candidateIteration?.baselineMetrics?.averageScore,
  );
});
