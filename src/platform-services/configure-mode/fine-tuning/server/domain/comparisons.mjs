import {
  clampScore,
  normalizeString,
} from "./primitives.mjs";
import {
  buildPairedEvaluationComparison,
} from "../../../evaluations/server/domain/comparisons.mjs";

function standardDeviation(values, average) {
  if (!values.length) return 0;
  const variance = values.reduce((sum, value) => sum + ((value - average) ** 2), 0) / values.length;
  return Math.sqrt(variance);
}

function aggregateRunCases(run = {}, passThreshold = 0.8) {
  const groups = new Map();
  (Array.isArray(run?.cases) ? run.cases : []).forEach((caseItem, index) => {
    const dataRowId = normalizeString(caseItem?.dataRowId || caseItem?.data_row_id || caseItem?.id)
      || "case_" + (index + 1);
    const group = groups.get(dataRowId) || {
      dataRowId,
      input: String(caseItem?.input || ""),
      expectedOutput: String(caseItem?.expectedOutput || caseItem?.expected_output || ""),
      scores: [],
      statuses: [],
      threadIds: [],
      evaluatorThreadIds: [],
      evaluatorReasons: [],
      sliceIds: [],
      unscoredCount: 0,
    };
    const status = normalizeString(caseItem?.status).toLowerCase();
    const rawScore = caseItem?.score;
    const numericScore = rawScore === null || rawScore === undefined || rawScore === ""
      ? null
      : Number(rawScore);
    if (["completed", "passed", "failed"].includes(status) && Number.isFinite(numericScore)) {
      group.scores.push(clampScore(numericScore));
    } else {
      group.unscoredCount += 1;
    }
    group.statuses.push(normalizeString(caseItem?.status));
    group.sliceIds.push(...(
      Array.isArray(caseItem?.sliceIds)
        ? caseItem.sliceIds
        : Array.isArray(caseItem?.slice_ids)
          ? caseItem.slice_ids
          : []
    ).map(normalizeString).filter(Boolean));
    if (caseItem?.threadId || caseItem?.thread_id) {
      group.threadIds.push(normalizeString(caseItem.threadId || caseItem.thread_id));
    }
    if (caseItem?.evaluatorThreadId || caseItem?.evaluator_thread_id) {
      group.evaluatorThreadIds.push(normalizeString(caseItem.evaluatorThreadId || caseItem.evaluator_thread_id));
    }
    const reason = String(caseItem?.evaluatorReason || caseItem?.evaluator_reason || "");
    if (reason) group.evaluatorReasons.push(reason);
    groups.set(dataRowId, group);
  });
  return new Map(Array.from(groups.entries()).map(([dataRowId, group]) => {
    const averageScore = group.scores.length
      ? group.scores.reduce((sum, score) => sum + score, 0) / group.scores.length
      : 0;
    const passedCount = group.scores.filter((score) => score >= passThreshold).length;
    return [dataRowId, {
      ...group,
      sliceIds: Array.from(new Set(group.sliceIds)).sort(),
      averageScore: group.scores.length ? clampScore(averageScore) : null,
      standardDeviation: standardDeviation(group.scores, averageScore),
      passRate: group.scores.length ? passedCount / group.scores.length : null,
      runCount: group.scores.length,
    }];
  }));
}

export function buildFineTuningCaseComparisons(baselineRun = {}, candidateRun = {}) {
  const passThreshold = clampScore(
    candidateRun?.passThreshold
      ?? candidateRun?.pass_threshold
      ?? baselineRun?.passThreshold
      ?? baselineRun?.pass_threshold
      ?? 0.8,
    0.8,
  );
  const baselineCases = aggregateRunCases(baselineRun, passThreshold);
  const candidateCases = aggregateRunCases(candidateRun, passThreshold);
  const ids = Array.from(new Set([...baselineCases.keys(), ...candidateCases.keys()]));
  return ids.map((dataRowId) => {
    const baseline = baselineCases.get(dataRowId) || null;
    const candidate = candidateCases.get(dataRowId) || null;
    const baselineScore = baseline?.averageScore ?? null;
    const candidateScore = candidate?.averageScore ?? null;
    const delta = baselineScore === null || candidateScore === null
      ? null
      : candidateScore - baselineScore;
    return {
      id: dataRowId,
      dataRowId,
      input: candidate?.input || baseline?.input || "",
      expectedOutput: candidate?.expectedOutput || baseline?.expectedOutput || "",
      baseline,
      candidate,
      baselineScore,
      candidateScore,
      delta,
      status: !candidate
        ? "pending"
        : candidateScore === null
          ? "unscored"
          : candidateScore >= passThreshold
          ? "passed"
          : "failed",
      regressed: delta !== null && delta < 0,
      improved: delta !== null && delta > 0,
    };
  });
}

export function buildFineTuningStatisticalComparison(baselineRun = {}, candidateRun = {}, options = {}) {
  return buildPairedEvaluationComparison(baselineRun, candidateRun, options);
}
