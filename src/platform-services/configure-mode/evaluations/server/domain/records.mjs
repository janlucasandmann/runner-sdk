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

export function extractThreadRecord(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.thread, source.data?.thread, source.data, source.item, source.record, source];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const id = normalizeString(candidate.id || candidate.threadId || candidate.thread_id);
      if (id) return { ...candidate, id };
    }
  }
  return null;
}

export function normalizeResponseArray(data, keys = []) {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(data[key])) return data[key];
  }
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

export function readRecordText(value) {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value).trim();
  }
  if (Array.isArray(value)) {
    return value.map(readRecordText).filter(Boolean).join("\n").trim();
  }
  if (!value || typeof value !== "object") return "";
  const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata) ? value.metadata : {};
  const response = value.response && typeof value.response === "object" && !Array.isArray(value.response) ? value.response : {};
  const result = value.result && typeof value.result === "object" && !Array.isArray(value.result) ? value.result : {};
  const candidates = [
    value.summary,
    value.runSummary,
    value.run_summary,
    value.output,
    value.outputText,
    value.output_text,
    value.content,
    value.text,
    value.message,
    value.body,
    response.output_text,
    response.outputText,
    response.summary,
    result.output_text,
    result.outputText,
    result.summary,
    result.text,
    metadata.summary,
    metadata.runSummary,
    metadata.run_summary,
    metadata.output,
    metadata.outputText,
    metadata.output_text,
    metadata.result,
    metadata.response,
    metadata.content,
    metadata.text,
    metadata.message,
  ];
  for (const candidate of candidates) {
    const text = readRecordText(candidate);
    if (text) return text;
  }
  if (Object.prototype.hasOwnProperty.call(value, "score") || Object.prototype.hasOwnProperty.call(value, "reason")) {
    try {
      return JSON.stringify(value);
    } catch {}
  }
  return "";
}

export function getRecordType(record) {
  const metadata = record?.metadata && typeof record.metadata === "object" && !Array.isArray(record.metadata) ? record.metadata : {};
  return normalizeString(record?.eventType || record?.event_type || record?.stepKind || record?.step_kind || record?.type || record?.kind || metadata.eventType || metadata.type).toLowerCase();
}

export function getRecordTimestamp(record) {
  return normalizeString(record?.createdAt || record?.created_at || record?.timestamp || record?.updatedAt || record?.updated_at);
}

export function extractFinalSummaryFromRecords(records) {
  const orderedRecords = (Array.isArray(records) ? records : [])
    .filter((record) => record && typeof record === "object")
    .sort((left, right) => getRecordTimestamp(left).localeCompare(getRecordTimestamp(right)));
  const preferredRecords = orderedRecords.filter((record) => {
    const type = getRecordType(record);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary");
  });
  const candidates = preferredRecords.length > 0 ? preferredRecords : orderedRecords;
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const text = readRecordText(candidates[index]);
    if (text) return text;
  }
  return "";
}

export function normalizeSourceThreadRecord(record = {}, fallbackThreadId = "") {
  const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
  const runnerPlayground = metadata.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
    ? metadata.runnerPlayground
    : {};
  const taskPreview = runnerPlayground.taskPreview && typeof runnerPlayground.taskPreview === "object" && !Array.isArray(runnerPlayground.taskPreview)
    ? runnerPlayground.taskPreview
    : {};
  const agent = source.agent && typeof source.agent === "object" && !Array.isArray(source.agent) ? source.agent : {};
  const environment = source.environment && typeof source.environment === "object" && !Array.isArray(source.environment)
    ? source.environment
    : source.computer && typeof source.computer === "object" && !Array.isArray(source.computer)
      ? source.computer
      : {};
  return {
    id: normalizeString(source.id || source.threadId || source.thread_id || fallbackThreadId),
    title: normalizeString(source.title || source.name || source.subject || taskPreview.title) || "Untitled thread",
    status: normalizeString(source.status || source.state),
    agentId: normalizeString(source.agentId || source.agent_id || agent.id || metadata.agentId || metadata.agent_id || runnerPlayground.agentId || taskPreview.agentId),
    agentName: normalizeString(source.agentName || source.agent_name || agent.name || agent.label || metadata.agentName || metadata.agent_name || runnerPlayground.agentName || taskPreview.agentName),
    environmentId: normalizeString(source.environmentId || source.environment_id || source.computerId || source.computer_id || environment.id || metadata.environmentId || metadata.environment_id || runnerPlayground.environmentId || taskPreview.environmentId),
    environmentName: normalizeString(source.environmentName || source.environment_name || source.computerName || source.computer_name || environment.name || environment.label || metadata.environmentName || metadata.environment_name || runnerPlayground.environmentName || taskPreview.environmentName),
    createdAt: normalizeString(source.createdAt || source.created_at),
    updatedAt: normalizeString(source.updatedAt || source.updated_at || source.completedAt || source.completed_at || source.finishedAt || source.finished_at || source.createdAt || source.created_at),
  };
}

export function takeSourceThreadContext(records, headCount = 6, tailCount = 18) {
  const sourceRecords = (Array.isArray(records) ? records : []).filter(Boolean);
  if (sourceRecords.length <= headCount + tailCount) {
    return sourceRecords;
  }
  const head = sourceRecords.slice(0, headCount);
  const tail = sourceRecords.slice(-tailCount);
  const seen = new Set();
  return [...head, ...tail].filter((record, index) => {
    const key = normalizeString(record?.id || record?.createdAt || record?.text) || String(index);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function parseJsonObjectFromText(value) {
  const text = normalizeString(value);
  if (!text) return null;
  const fencedJsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const objectJsonMatch = text.match(/\{[\s\S]*\}/);
  const candidates = [
    fencedJsonMatch && fencedJsonMatch[1],
    objectJsonMatch && objectJsonMatch[0],
    text,
  ].filter(Boolean);
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed;
      }
    } catch {}
  }
  return null;
}

export function normalizeCaseRefinementResult(value) {
  const parsed = parseJsonObjectFromText(value);
  if (!parsed) {
    return null;
  }
  const input = normalizeString(parsed.input || parsed.caseInput || parsed.case_input || parsed.userInput || parsed.user_input);
  const expectedOutput = normalizeString(parsed.expectedOutput || parsed.expected_output || parsed.referenceOutput || parsed.reference_output || parsed.output);
  const evaluationGuidance = normalizeString(parsed.evaluationGuidance || parsed.evaluation_guidance || parsed.scoringGuidance || parsed.scoring_guidance || parsed.rubric);
  const rawAssessment = normalizeString(parsed.sourceAssessment || parsed.source_assessment || parsed.historicalRunAssessment || parsed.historical_run_assessment || parsed.assessment).toLowerCase();
  const sourceAssessment = ["successful", "partially_successful", "failed", "unclear"].includes(rawAssessment)
    ? rawAssessment
    : "unclear";
  const confidence = clampScore(parsed.confidence);
  const needsReview = typeof parsed.needsReview === "boolean"
    ? parsed.needsReview
    : typeof parsed.needs_review === "boolean"
      ? parsed.needs_review
      : sourceAssessment !== "successful";
  return {
    input,
    expectedOutput,
    evaluationGuidance,
    sourceAssessment,
    sourceFailureReason: normalizeString(parsed.sourceFailureReason || parsed.source_failure_reason || parsed.failureReason || parsed.failure_reason),
    caseIntent: normalizeString(parsed.caseIntent || parsed.case_intent || parsed.intent),
    confidence: confidence === null ? null : confidence,
    needsReview,
    raw: parsed,
  };
}

export function isUsableCaseRefinementResult(result) {
  return Boolean(
    result
    && normalizeString(result.input)
    && normalizeString(result.expectedOutput)
    && normalizeString(result.evaluationGuidance)
  );
}

export function buildCaseRefinementPrompt({ evaluationSet, snapshot }) {
  return [
    "You are converting a historical Computer Agents thread into a reusable evaluation case.",
    "Analyze the source thread deeply. The historical run may be correct, partially correct, or wrong.",
    "Your job is not to copy the historical result blindly. Your job is to infer the user's intended task and define what a future correct agent run should do.",
    "If the historical agent failed, identify the failure and write expectedOutput for the correct behavior that should have happened.",
    "Return only valid JSON in this exact shape:",
    "{\"input\":\"clean user task for the eval case\",\"expectedOutput\":\"reference behavior or output for a correct future run\",\"evaluationGuidance\":\"specific scoring rubric, including partial credit and failure conditions\",\"sourceAssessment\":\"successful|partially_successful|failed|unclear\",\"sourceFailureReason\":\"short reason when not successful\",\"caseIntent\":\"short intent label\",\"confidence\":0.0,\"needsReview\":true}",
    "Guidelines:",
    "- input should be the clean task that should be replayed in a future evaluation thread. Remove channel noise, repeated quoted replies, and irrelevant history unless needed.",
    "- expectedOutput should describe the desired correct result. It can be behavioral if exact wording is not important.",
    "- evaluationGuidance must tell the evaluator exactly what to check and how to score partial success.",
    "- Mark needsReview true if the source thread is ambiguous, failed, or lacks enough evidence.",
    "- Do not include Markdown fences. Do not include commentary outside the JSON object.",
    `Evaluation set: ${evaluationSet.name || "Untitled Evaluation"}`,
    `Dataset evaluator guidance:\n${String(evaluationSet.evaluationGuidance || "") || "None"}`,
    `Source thread ID: ${snapshot.thread?.id || snapshot.threadId || ""}`,
    "Inspect the source thread through available thread APIs if needed. A compact snapshot is included below for orientation.",
    `Compact source thread snapshot:\n${JSON.stringify(snapshot, null, 2)}`,
  ].join("\n\n");
}

export function isCaseRefinementPromptText(text) {
  const normalized = String(text || "");
  return normalized.includes("You are converting a historical Computer Agents thread into a reusable evaluation case")
    && normalized.includes("Return only valid JSON in this exact shape");
}

export function extractStreamSummary(text) {
  let latestText = "";
  String(text || "").split(/\n\n+/).forEach((block) => {
    const data = block
      .split(/\r?\n/)
      .map((line) => line.startsWith("data:") ? line.slice(5).trimStart() : "")
      .filter(Boolean)
      .join("\n")
      .trim();
    if (!data || data === "[DONE]") return;
    try {
      const parsed = JSON.parse(data);
      const response = parsed?.response && typeof parsed.response === "object" ? parsed.response : {};
      const outputText = normalizeString(
        parsed?.summary
        || parsed?.output_text
        || parsed?.outputText
        || response?.output_text
        || response?.outputText
        || response?.summary
        || ""
      );
      if (outputText) latestText = outputText;
    } catch {}
  });
  return latestText;
}

