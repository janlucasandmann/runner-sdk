import {
  EVALUATION_CT_PER_DOLLAR,
  createEvaluationId,
  getCreatorIdentity,
  normalizeEvaluator,
  normalizePassThreshold,
  normalizePersonIdentity,
  normalizeRunCount,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readComputeTokenValue,
  readUsdCostValue,
} from "./primitives.mjs";
import {
  clampScore,
  createEvaluationRun,
  normalizeComparable,
  normalizeDataRow,
  normalizeEvaluationSet,
  normalizeRunCase,
  recomputeRun,
} from "./sets.mjs";
import {
  extractFinalSummaryFromRecords,
  extractStreamSummary,
  getRecordTimestamp,
  getRecordType,
  normalizeCaseRefinementResult,
  normalizeResponseArray,
  normalizeSourceThreadRecord,
  readRecordText,
  takeSourceThreadContext,
} from "./records.mjs";
import {
  extractThreadCostTokens,
  extractThreadCostUsd,
} from "./costs.mjs";

export function parseEvaluatorResult(value) {
  const text = normalizeString(value);
  const fallback = { score: 0, reason: "", confidence: null, passed: false, parseStatus: "missing_output", raw: text };
  if (!text) return fallback;
  const fencedJsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const objectJsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonCandidate = (fencedJsonMatch && fencedJsonMatch[1]) || (objectJsonMatch && objectJsonMatch[0]) || "";
  if (jsonCandidate) {
    try {
      const parsed = JSON.parse(jsonCandidate);
      const score = clampScore(parsed?.score ?? parsed?.grade ?? parsed?.rating ?? parsed?.result?.score);
      if (score !== null) {
        return {
          score,
          reason: normalizeString(parsed.reason || parsed.rationale || parsed.explanation || parsed.message),
          confidence: clampScore(parsed.confidence),
          passed: typeof parsed.passed === "boolean" ? parsed.passed : score >= 0.8,
          parseStatus: "parsed_json",
          raw: text,
        };
      }
    } catch {}
  }
  const percentMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*(100|[0-9]{1,2}(?:\.[0-9]+)?)\s*%/i);
  if (percentMatch) {
    const score = clampScore(Number(percentMatch[1]) / 100);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_percent" };
  }
  const fractionMatch = text.match(/(?:score|grade|rating)?\s*[:=]?\s*([01](?:\.[0-9]+)?|0?\.[0-9]+)\s*\/\s*1\b/i);
  if (fractionMatch) {
    const score = clampScore(fractionMatch[1]);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_fraction" };
  }
  const numberMatch = text.match(/(?:score|grade|rating)\s*[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
  if (numberMatch) {
    const score = clampScore(numberMatch[1]);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_number" };
  }
  const naturalScoreMatch = text.match(/\bscor(?:e|ed|ing)\b[\s\S]{0,80}?\b(100|[0-9]{1,2}(?:\.[0-9]+)?|[01](?:\.[0-9]+)?)\b/i);
  if (naturalScoreMatch) {
    const score = clampScore(naturalScoreMatch[1]);
    return { ...fallback, score: score ?? 0, passed: (score ?? 0) >= 0.8, parseStatus: "parsed_natural_language" };
  }
  return { ...fallback, parseStatus: "unparsed" };
}

export function isParsedEvaluatorResult(parsed) {
  const parseStatus = normalizeString(parsed?.parseStatus).toLowerCase();
  return Boolean(parsed && parseStatus && parseStatus !== "missing_output" && parseStatus !== "unparsed");
}

export function isEvaluatorPromptText(text) {
  const normalized = String(text || "");
  return normalized.includes("You are the evaluator for an agent evaluation run")
    && normalized.includes("Return only valid JSON in this exact shape");
}

export function isUserLikeRecord(record) {
  const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  const values = [
    record?.role,
    record?.sender,
    record?.authorRole,
    record?.author_role,
    record?.eventType,
    record?.event_type,
    record?.type,
    metadata.role,
    metadata.sender,
    metadata.eventType,
    metadata.type,
  ].map((value) => normalizeString(value).toLowerCase());
  return values.some((value) => value === "user" || value === "user_message" || value === "human");
}

export function isAssistantLikeRecord(record) {
  const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  const values = [
    record?.role,
    record?.sender,
    record?.authorRole,
    record?.author_role,
    record?.eventType,
    record?.event_type,
    record?.type,
    record?.kind,
    metadata.role,
    metadata.sender,
    metadata.eventType,
    metadata.type,
    metadata.kind,
  ].map((value) => normalizeString(value).toLowerCase());
  return values.some((value) => (
    value === "assistant"
    || value === "assistant_message"
    || value === "agent_message"
    || value === "turn_completed"
    || value === "run_summary"
    || value.includes("summary")
  ));
}

export function buildEvaluatorScoringCandidates(records, fallback = "") {
  const candidates = [];
  (Array.isArray(records) ? records : []).forEach((record, index) => {
    const text = readRecordText(record);
    if (!text || isEvaluatorPromptText(text) || isUserLikeRecord(record)) {
      return;
    }
    const type = getRecordType(record);
    const assistantLike = isAssistantLikeRecord(record);
    candidates.push({
      text,
      timestamp: getRecordTimestamp(record),
      index,
      priority: assistantLike ? 3 : type === "turn_completed" || type.includes("summary") ? 2 : 1,
    });
  });
  const fallbackText = normalizeString(fallback);
  if (fallbackText && !isEvaluatorPromptText(fallbackText)) {
    candidates.push({
      text: fallbackText,
      timestamp: "",
      index: Number.MAX_SAFE_INTEGER,
      priority: 2,
    });
  }
  return candidates.sort((left, right) => {
    if (right.priority !== left.priority) return right.priority - left.priority;
    const timestampCompare = String(right.timestamp || "").localeCompare(String(left.timestamp || ""));
    if (timestampCompare !== 0) return timestampCompare;
    return right.index - left.index;
  });
}

export function buildEvaluatorPrompt({ evaluationSet, run, caseRun, row, snapshot }) {
  return [
    "You are the evaluator for an agent evaluation run. Score the completed evaluation thread by inspecting it through the thread APIs and tools available to you.",
    "Return only valid JSON in this exact shape: {\"score\": 0.0, \"reason\": \"short explanation\", \"passed\": false, \"confidence\": 0.0}.",
    "The score must be a number between 0 and 1. Use 1 for fully correct, 0 for completely wrong, and partial values for partially correct.",
    "Apply the dataset and row evaluator guidance when present. Row guidance is more specific than dataset guidance. If guidance defines partial credit floors or special scoring rules, apply them.",
    "Do not solve the original task yourself. Only evaluate what happened in the evaluation thread.",
    "Use the evaluation thread id below as the source of truth. Inspect the thread's user messages, assistant run summary, working logs, and artifacts yourself instead of relying on this prompt to contain the full thread data.",
    `Evaluation set: ${evaluationSet.name || "Untitled Evaluation"}`,
    `Run: ${run.label || "Evaluation Run"}`,
    `Case ID: ${caseRun.id || ""}`,
    `Evaluation thread ID: ${snapshot.threadId || ""}`,
    `Input:\n${String(row.input || "")}`,
    `Expected output:\n${String(row.expectedOutput || "")}`,
    `Dataset evaluator guidance:\n${String(evaluationSet.evaluationGuidance || "") || "None"}`,
    `Row evaluator guidance:\n${String(row.evaluationGuidance || "") || "None"}`,
  ].join("\n\n");
}

export function cloneRequestContext(req) {
  return {
    url: req.url || "/",
    headers: {
      cookie: req.headers.cookie || "",
      authorization: req.headers.authorization || "",
      "x-api-key": req.headers["x-api-key"] || "",
      "x-runner-upstream-url": req.headers["x-runner-upstream-url"] || "",
      "x-computer-agents-organization": req.headers["x-computer-agents-organization"] || "",
    },
  };
}

export function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

