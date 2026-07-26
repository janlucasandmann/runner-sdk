import {
  FINE_TUNING_CT_PER_DOLLAR,
  clampScore,
  compactFineTuningReferenceMetadata,
  computeTokensToUsd,
  hasPlainObjectContent,
  normalizeResponseArray,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readFirstPlainObject,
  readPlainObject,
  sanitizeReferenceText,
} from "./primitives.mjs";

import {
  getFineTuningBaselineRun,
} from "./evaluations.mjs";

export function buildFineTuningPrompt({
  targetAgent,
  fineTunerAgent,
  environment,
  evaluationSets,
  evaluationRuns = [],
  instructions,
  jobId,
  iterationNumber = 1,
}) {
  const runBySetId = new Map(
    (Array.isArray(evaluationRuns) ? evaluationRuns : [])
      .map((run) => [normalizeString(run?.evaluationSetId || run?.evaluation_set_id), run]),
  );
  const evaluationSummary = evaluationSets.map((set, index) => {
    const run = runBySetId.get(normalizeString(set.id)) || getFineTuningBaselineRun(set) || {};
    const dataRows = Array.isArray(set.dataRows) ? set.dataRows : [];
    const roleByDataRowId = new Map(dataRows.map((row) => {
      const requestedRole = normalizeString(
        row?.optimizationRole || row?.optimization_role || "train",
      ).toLowerCase();
      return [
        normalizeString(row?.id),
        ["train", "validation", "holdout"].includes(requestedRole) ? requestedRole : "train",
      ];
    }));
    const visibleRunCases = (Array.isArray(run?.cases) ? run.cases : []).filter((caseItem) => {
      const dataRowId = normalizeString(caseItem?.dataRowId || caseItem?.data_row_id);
      const requestedRole = normalizeString(
        caseItem?.optimizationRole
          || caseItem?.optimization_role
          || roleByDataRowId.get(dataRowId)
          || "train",
      ).toLowerCase();
      return requestedRole !== "holdout";
    });
    const visibleScores = visibleRunCases.map((caseItem) => clampScore(caseItem?.score || 0));
    const passThreshold = clampScore(set.passThreshold ?? set.pass_threshold ?? 0.8, 0.8);
    const runCasesByDataRowId = new Map();
    visibleRunCases.forEach((caseItem) => {
      const dataRowId = normalizeString(caseItem?.dataRowId || caseItem?.data_row_id);
      if (!dataRowId) return;
      const values = runCasesByDataRowId.get(dataRowId) || [];
      values.push(caseItem);
      runCasesByDataRowId.set(dataRowId, values);
    });
    const cases = dataRows.map((row, rowIndex) => {
      const role = ["train", "validation", "holdout"].includes(
        normalizeString(row?.optimizationRole || row?.optimization_role).toLowerCase(),
      )
        ? normalizeString(row?.optimizationRole || row?.optimization_role).toLowerCase()
        : "train";
      if (role === "holdout") return null;
      const caseRuns = runCasesByDataRowId.get(normalizeString(row?.id)) || [];
      const scores = caseRuns.map((caseItem) => clampScore(caseItem?.score || 0));
      const averageScore = scores.length
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
      const evaluatorReasons = caseRuns
        .map((caseItem) => sanitizeFineTuningAnalysisText(caseItem?.evaluatorReason || ""))
        .filter(Boolean)
        .slice(0, 3);
      return {
        index: rowIndex + 1,
        id: normalizeString(row?.id),
        role,
        input: String(row?.input || "").slice(0, 1600),
        ...(role === "train" ? {
          expectedOutput: String(row?.expectedOutput || row?.expected_output || "").slice(0, 1600),
          evaluationGuidance: String(row?.evaluationGuidance || row?.evaluation_guidance || "").slice(0, 1200),
        } : {}),
        currentScore: averageScore,
        evaluatorReasons,
      };
    }).filter(Boolean);
    return {
      index: index + 1,
      id: set.id,
      name: set.name,
      evaluationVersionId: set.activeVersionId,
      evaluationVersionNumber: set.activeVersionNumber,
      passThreshold,
      averageScore: visibleScores.length
        ? clampScore(visibleScores.reduce((sum, score) => sum + score, 0) / visibleScores.length)
        : 0,
      passRate: visibleScores.length
        ? clampScore(visibleScores.filter((score) => score >= passThreshold).length / visibleScores.length)
        : 0,
      cases,
    };
  });
  return [
    "You are optimizing the instructions of an AI agent from controlled evaluation evidence.",
    "Create one candidate instruction snapshot. Do not publish, update, rename, or otherwise mutate the agent.",
    "The platform will save the candidate as a draft and independently verify it.",
    "Focus on generalizable instruction changes, missing constraints, failure modes, and evaluation-driven improvements.",
    "Do not overfit to individual wording and do not encode expected answers as case-specific rules.",
    "Immutable target-agent identity: keep the target agent name exactly \"" + (targetAgent.name || "Agent") + "\". Do not rename the agent, change its avatar, owner, model, skills, guardrails, team access, or other configuration. Only improve the instructions.",
    "",
    "Evidence policy:",
    "- Training cases include expected outputs and rubrics and may guide the candidate.",
    "- Validation cases omit expected outputs and rubrics. Use only their aggregate failure patterns.",
    "- Holdout cases are sealed and never included in optimizer evidence.",
    "- Preserve correct existing behavior unless evidence clearly requires a change.",
    "",
    "Return only valid JSON in this exact shape:",
    "{\"instructions\":\"complete replacement instructions\",\"summary\":\"concise evidence-based rationale\",\"risks\":[\"risk or tradeoff\"]}",
    "The instructions value must be the complete instruction document, not a patch.",
    "",
    "Target agent:",
    JSON.stringify({
      id: targetAgent.id,
      name: targetAgent.name,
      immutableName: targetAgent.name,
      model: targetAgent.model,
      description: targetAgent.description,
      instructions: targetAgent.instructions,
      jobId,
      iterationNumber,
    }, null, 2),
    "",
    "Fine-tuner agent executing this job:",
    JSON.stringify({
      id: fineTunerAgent.id,
      name: fineTunerAgent.name,
      model: fineTunerAgent.model,
    }, null, 2),
    "",
    "Optimization environment:",
    JSON.stringify({ id: environment.id, name: environment.name }, null, 2),
    "",
    "User focus:",
    instructions ? instructions : "No extra focus supplied.",
    "",
    "Evaluation evidence:",
    JSON.stringify({ evaluationSets: evaluationSummary }, null, 2),
  ].join("\n");
}

export function parseFineTuningOptimizerResult(value) {
  const raw = decodeMaybeEscapedText(value).trim();
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] || "";
  const object = raw.match(/\{[\s\S]*\}/)?.[0] || "";
  for (const candidate of [fenced, object]) {
    if (!candidate) continue;
    try {
      const parsed = JSON.parse(candidate);
      const instructions = String(
        parsed?.instructions
          || parsed?.fullInstructions
          || parsed?.full_instructions
          || "",
      ).trim();
      if (!instructions) continue;
      return {
        instructions,
        summary: sanitizeFineTuningAnalysisText(
          parsed?.summary || parsed?.rationale || parsed?.reason || "",
        ),
        risks: (Array.isArray(parsed?.risks) ? parsed.risks : [])
          .map((risk) => normalizeString(risk))
          .filter(Boolean)
          .slice(0, 12),
        parseStatus: "parsed_json",
        raw,
      };
    } catch {}
  }
  return {
    instructions: "",
    summary: sanitizeFineTuningAnalysisText(raw),
    risks: [],
    parseStatus: raw ? "unparsed" : "missing_output",
    raw,
  };
}

export function decodeMaybeEscapedText(value) {
  let text = String(value || "");
  const escapedNewlineCount = (text.match(/\\n/g) || []).length;
  if (escapedNewlineCount >= 2) {
    text = text
      .replace(/\\r\\n/g, "\n")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\"/g, "\"");
  }
  return text;
}

export function sanitizeFineTuningAnalysisText(value) {
  let text = decodeMaybeEscapedText(value)
    .replace(/\r\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim();
  if (!text) return "";

  const rawPayloadIndex = text.search(/(?:^|\s)(?:data|event):\s*\{/);
  if (rawPayloadIndex > 0) {
    text = text.slice(0, rawPayloadIndex).trim();
  }
  text = text
    .split("\n")
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return true;
      if (/^(event|id|retry):\s*/i.test(trimmed)) return false;
      if (/^data:\s*(?:\{|\[|\"type\")/i.test(trimmed)) return false;
      if (/^\{\"\s*type\"\s*:/.test(trimmed)) return false;
      if (/^\{\"type\":/.test(trimmed)) return false;
      return true;
    })
    .join("\n")
    .trim();
  return text.length > 2400 ? text.slice(0, 2400).trimEnd() + "\n\n..." : text;
}

export function extractStringFromPayloadValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(extractStringFromPayloadValue).filter(Boolean).join("");
  }
  if (value && typeof value === "object") {
    return extractTextFromStreamPayload(value);
  }
  return "";
}

export function extractTextFromStreamPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";
  const direct = [
    payload.output_text,
    payload.outputText,
    payload.summary,
    payload.text,
    payload.delta,
    payload.content,
    payload.message?.content,
    payload.choices?.[0]?.delta?.content,
    payload.choices?.[0]?.message?.content,
  ].map(extractStringFromPayloadValue).find((value) => String(value || "").trim());
  if (direct) return direct;
  const responseOutputText = extractStringFromPayloadValue(payload.response?.output_text || payload.response?.outputText);
  if (responseOutputText) return responseOutputText;
  const output = payload.response?.output || payload.output || payload.data?.output;
  if (Array.isArray(output)) {
    const value = output.map((item) => {
      if (!item || typeof item !== "object") return "";
      return extractStringFromPayloadValue(item.content || item.text || item.output_text || item.outputText || item);
    }).filter(Boolean).join("");
    if (value) return value;
  }
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return extractTextFromStreamPayload(payload.data);
  }
  return "";
}

export function extractStreamSummary(streamText) {
  const text = String(streamText || "");
  if (!text.trim()) return "";
  const deltaCandidates = [];
  const fullCandidates = [];
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed === "[DONE]") return;
    if (/^(event|id|retry):\s*/i.test(trimmed)) return;
    const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
    if (!payload || payload === "[DONE]") return;
    try {
      const parsed = JSON.parse(payload);
      const value = sanitizeFineTuningAnalysisText(extractTextFromStreamPayload(parsed));
      if (!value) return;
      const type = String(parsed.type || parsed.event || "").toLowerCase();
      if (type.includes("completed") || type.includes("message") || parsed.response || parsed.output) {
        fullCandidates.push(value);
      } else {
        deltaCandidates.push(value);
      }
    } catch {
      if (!payload.startsWith("{") && !payload.startsWith("[") && !/^data:/i.test(payload)) {
        deltaCandidates.push(payload);
      }
    }
  });
  const bestFull = fullCandidates
    .sort((left, right) => right.length - left.length)[0];
  const summary = bestFull || deltaCandidates.join("");
  return sanitizeFineTuningAnalysisText(summary || text);
}

export function buildProposedInstructions(agent, evaluationSets, instructions, analysis) {
  const baseInstructions = String(agent.instructions || "").trim() || "You are " + agent.name + ". Complete the user's task carefully and accurately.";
  const focus = normalizeString(instructions);
  const setNames = evaluationSets.map((set) => set.name).filter(Boolean).join(", ");
  const improvementNotes = [
    "",
    "Fine-tuning notes:",
    "- Optimize behavior against: " + (setNames || "the selected evaluation sets") + ".",
    "- Prefer explicit reasoning about expected outputs before finalizing the response.",
    "- When evaluation guidance is present, treat it as a hard scoring rubric.",
    "- Keep answers concise unless the task requires structured detail.",
    focus ? "- User focus: " + focus : "",
    analysis ? "- Analysis summary: " + analysis.replace(/\s+/g, " ").slice(0, 900) : "",
  ].filter(Boolean).join("\n");
  return baseInstructions + "\n" + improvementNotes;
}

export function preserveFineTuningAgentName(agent, snapshot = {}) {
  const source = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) ? snapshot : {};
  return {
    ...source,
    name: normalizeString(agent?.name || source.name || "Agent") || "Agent",
  };
}

export function buildAgentSnapshot(agent, instructions) {
  return preserveFineTuningAgentName(agent, {
    name: agent.name,
    description: agent.description,
    model: agent.model,
    instructions,
    enabledSkills: Array.isArray(agent.enabledSkills) ? agent.enabledSkills : [],
    guardrails: Array.isArray(agent.guardrails) ? agent.guardrails : Array.isArray(agent.metadata?.guardrails) ? agent.metadata.guardrails : [],
    metadata: {
      ...(agent.metadata || {}),
    },
  });
}

export function buildFineTuningDiffFilesFromSnapshots(beforeSnapshot, afterSnapshot) {
  return [
    {
      id: "instructions",
      filePath: "agent/instructions.md",
      beforeContent: beforeSnapshot.instructions || "",
      afterContent: afterSnapshot.instructions || "",
    },
    {
      id: "configuration",
      filePath: "agent/configuration.json",
      beforeContent: JSON.stringify({
        name: beforeSnapshot.name,
        model: beforeSnapshot.model,
        enabledSkills: beforeSnapshot.enabledSkills,
        guardrails: beforeSnapshot.guardrails,
      }, null, 2) + "\n",
      afterContent: JSON.stringify({
        name: afterSnapshot.name,
        model: afterSnapshot.model,
        enabledSkills: afterSnapshot.enabledSkills,
        guardrails: afterSnapshot.guardrails,
      }, null, 2) + "\n",
    },
  ];
}

export function buildFineTuningDiffFiles(agent, proposedInstructions) {
  return buildFineTuningDiffFilesFromSnapshots(
    buildAgentSnapshot(agent, String(agent.instructions || "")),
    buildAgentSnapshot(agent, proposedInstructions)
  );
}

export function buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore) {
  return evaluationSets.map((set, index) => {
    const beforeRun = getFineTuningBaselineRun(set);
    const beforeScore = clampScore(beforeRun?.averageScore || 0);
    return {
      evaluationSetId: set.id,
      evaluationSetName: set.name,
      beforeRunId: beforeRun?.id || "",
      beforeRunLabel: beforeRun?.label || "",
      beforeScore,
      beforeCostUsd: normalizeUsdCost(beforeRun?.costUsd || beforeRun?.cost_usd) || computeTokensToUsd(beforeRun?.costTokens || beforeRun?.cost_tokens),
      afterRunId: "",
      afterRunLabel: "",
      afterScore: 0,
      afterCostUsd: 0,
      status: verifyAfter ? "pending" : "not_run",
    };
  });
}
