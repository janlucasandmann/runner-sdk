const FINE_TUNING_JOB_TTL_MS = 1000 * 60 * 60 * 8;

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizePersonIdentity(rawValue = {}) {
  const source = rawValue && typeof rawValue === "object" && !Array.isArray(rawValue) ? rawValue : {};
  return {
    id: normalizeString(source.id || source.userId || source.user_id || source.uid || source.email),
    userId: normalizeString(source.userId || source.user_id || source.uid),
    name: normalizeString(source.name || source.displayName || source.display_name || source.label || source.title),
    email: normalizeString(source.email || source.mail),
    avatarUrl: normalizeString(source.avatarUrl || source.avatar_url || source.photoUrl || source.photoURL || source.imageUrl || source.imageURL || source.avatar),
  };
}

function createRuntimeError(message, status = 500) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function createFineTuningId(prefix = "fine_tune_job") {
  return prefix + "_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 9);
}

function clampScore(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(0, Math.min(1, numeric));
}

function normalizeTokenCount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.round(numeric)) : 0;
}

function normalizeEvaluationRun(rawRun = {}) {
  const source = rawRun && typeof rawRun === "object" && !Array.isArray(rawRun) ? rawRun : {};
  const cases = Array.isArray(source.cases) ? source.cases : [];
  const averageScore = source.averageScore ?? source.average_score;
  return {
    id: normalizeString(source.id || source.runId || source.run_id),
    label: normalizeString(source.label || source.name || source.title || "Run"),
    averageScore: clampScore(averageScore, cases.length > 0
      ? cases.reduce((sum, item) => sum + Number(item?.score || 0), 0) / cases.length
      : 0
    ),
    costTokens: normalizeTokenCount(source.costTokens ?? source.cost_tokens ?? source.costCT ?? source.cost_ct),
    createdAt: normalizeString(source.createdAt || source.created_at || source.completedAt || source.completed_at),
    status: normalizeString(source.status || "completed") || "completed",
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
    targetAgentVersionId: normalizeString(source.targetAgentVersionId || source.target_agent_version_id || source.agentVersionId || source.agent_version_id),
    targetAgentVersionNumber: Math.max(0, Number(source.targetAgentVersionNumber || source.target_agent_version_number || source.agentVersionNumber || source.agent_version_number || 0) || 0),
    targetAgentVersionLabel: normalizeString(source.targetAgentVersionLabel || source.target_agent_version_label || source.agentVersionLabel || source.agent_version_label),
  };
}

function normalizeEvaluationSet(rawSet = {}, fallbackIndex = 0) {
  const source = rawSet && typeof rawSet === "object" && !Array.isArray(rawSet) ? rawSet : {};
  const dataRows = Array.isArray(source.dataRows)
    ? source.dataRows
    : Array.isArray(source.data_rows)
      ? source.data_rows
      : [];
  const runs = (Array.isArray(source.runs) ? source.runs : [])
    .map((run) => normalizeEvaluationRun(run))
    .filter((run) => run.id || run.label);
  const selectedRun = normalizeEvaluationRun(source.selectedRun || source.selected_run || {});
  const selectedRunId = normalizeString(source.fineTuningRunId || source.fine_tuning_run_id || source.selectedRunId || source.selected_run_id || selectedRun.id);
  return {
    id: normalizeString(source.id || source.evaluationSetId || source.evaluation_set_id) || "evaluation_" + (fallbackIndex + 1),
    name: normalizeString(source.name || source.title || "Evaluation " + (fallbackIndex + 1)),
    description: String(source.description || ""),
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || ""),
    targetAgentId: normalizeString(source.targetAgentId || source.target_agent_id || source.agentId || source.agent_id),
    targetAgentName: normalizeString(source.targetAgentName || source.target_agent_name || source.agentName || source.agent_name),
    targetAgentPhotoUrl: normalizeString(source.targetAgentPhotoUrl || source.target_agent_photo_url || source.agentPhotoUrl || source.agent_photo_url || source.photoUrl || source.photoURL),
    dataRows,
    runs,
    selectedRunId,
    selectedRun: selectedRun.id ? selectedRun : null,
    activeVersionId: normalizeString(source.activeVersionId || source.active_version_id || source.evaluationVersionId || source.evaluation_version_id),
    activeVersionNumber: Math.max(0, Number(source.activeVersionNumber || source.active_version_number || source.evaluationVersionNumber || source.evaluation_version_number || 0) || 0),
    activeVersionLabel: normalizeString(source.activeVersionLabel || source.active_version_label || source.evaluationVersionLabel || source.evaluation_version_label),
  };
}

function getLatestEvaluationRun(set) {
  const runs = Array.isArray(set?.runs) ? set.runs : [];
  return runs.slice().sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || 0) || 0;
    const rightTime = Date.parse(right.createdAt || 0) || 0;
    return rightTime - leftTime;
  })[0] || null;
}

function getFineTuningBaselineRun(set) {
  const selectedRunId = normalizeString(set?.selectedRunId || set?.fineTuningRunId || set?.fine_tuning_run_id);
  const runs = Array.isArray(set?.runs) ? set.runs : [];
  return (selectedRunId ? runs.find((run) => normalizeString(run?.id || run?.runId || run?.run_id) === selectedRunId) : null)
    || (set?.selectedRun && set.selectedRun.id ? set.selectedRun : null)
    || getLatestEvaluationRun(set);
}

function calculateAverageScore(sets) {
  const scores = (Array.isArray(sets) ? sets : [])
    .map((set) => getFineTuningBaselineRun(set)?.averageScore)
    .filter((score) => Number.isFinite(Number(score)));
  if (!scores.length) return 0;
  return clampScore(scores.reduce((sum, score) => sum + Number(score || 0), 0) / scores.length);
}

function normalizeAgent(rawAgent = {}) {
  const source = rawAgent && typeof rawAgent === "object" && !Array.isArray(rawAgent) ? rawAgent : {};
  const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
    ? source.metadata
    : {};
  return {
    ...source,
    id: normalizeString(source.id || source.agentId || source.agent_id),
    name: normalizeString(source.name || source.label || source.title || "Agent"),
    model: normalizeString(source.model || source.modelId || source.model_id || metadata.model || ""),
    instructions: String(source.instructions || source.systemPrompt || source.system_prompt || metadata.instructions || ""),
    description: String(source.description || metadata.description || ""),
    photoUrl: normalizeString(source.photoUrl || source.photoURL || source.avatarUrl || source.avatarURL || metadata.photoUrl || metadata.photoURL),
    isDefault: source.isDefault === true || source.is_default === true || metadata.isDefault === true || metadata.is_default === true,
    isSystem: source.isSystem === true || source.is_system === true || metadata.isSystem === true || metadata.is_system === true,
    agentType: normalizeString(source.agentType || source.agent_type || metadata.agentType || metadata.agent_type || ""),
    metadata,
  };
}

function normalizeEnvironment(rawEnvironment = {}) {
  const source = rawEnvironment && typeof rawEnvironment === "object" && !Array.isArray(rawEnvironment) ? rawEnvironment : {};
  return {
    ...source,
    id: normalizeString(source.id || source.environmentId || source.environment_id || source.computerId || source.computer_id),
    name: normalizeString(source.name || source.label || source.title || "Computer"),
  };
}

function isProtectedFineTuningTargetAgent(agent) {
  const normalizedId = normalizeString(agent?.id || agent?.agentId || agent?.agent_id).toLowerCase();
  const metadata = agent?.metadata && typeof agent.metadata === "object" && !Array.isArray(agent.metadata) ? agent.metadata : {};
  return Boolean(
    agent?.isDefault === true
    || agent?.is_default === true
    || agent?.isSystem === true
    || agent?.is_system === true
    || metadata.isDefault === true
    || metadata.is_default === true
    || metadata.isSystem === true
    || metadata.is_system === true
    || normalizedId === "agent_assistant"
    || normalizedId === "agent_default"
    || normalizedId === "agent_research"
    || normalizedId.startsWith("agent-default-")
  );
}

function resolveFineTuningTargetFromEvaluationSets(evaluationSets) {
  const targets = [];
  for (const set of Array.isArray(evaluationSets) ? evaluationSets : []) {
    const baselineRun = getFineTuningBaselineRun(set);
    const id = normalizeString(baselineRun?.targetAgentId || baselineRun?.target_agent_id || set?.targetAgentId || set?.target_agent_id);
    if (!id) continue;
    targets.push({
      id,
      name: normalizeString(baselineRun?.targetAgentName || baselineRun?.target_agent_name || set?.targetAgentName || set?.target_agent_name),
      photoUrl: normalizeString(baselineRun?.targetAgentPhotoUrl || baselineRun?.target_agent_photo_url || set?.targetAgentPhotoUrl || set?.target_agent_photo_url),
      versionId: normalizeString(baselineRun?.targetAgentVersionId || baselineRun?.target_agent_version_id),
      versionNumber: Math.max(0, Number(baselineRun?.targetAgentVersionNumber || baselineRun?.target_agent_version_number || 0) || 0),
      versionLabel: normalizeString(baselineRun?.targetAgentVersionLabel || baselineRun?.target_agent_version_label),
      evaluationSetId: set?.id || "",
      evaluationSetName: set?.name || "",
      runId: baselineRun?.id || "",
      runLabel: baselineRun?.label || "",
    });
  }
  const uniqueIds = Array.from(new Set(targets.map((target) => target.id).filter(Boolean)));
  if (uniqueIds.length > 1) {
    return {
      error: "Selected evaluation runs target different agents. Select runs for one target agent before starting fine-tuning.",
      targets,
    };
  }
  return {
    target: targets[0] || null,
    targets,
  };
}

function buildFineTuningPrompt({ targetAgent, fineTunerAgent, environment, evaluationSets, instructions, verifyAfter, jobId, nextVersionNumber }) {
  const caseCount = evaluationSets.reduce((sum, set) => sum + (Array.isArray(set.dataRows) ? set.dataRows.length : 0), 0);
  const evaluationSummary = evaluationSets.map((set, index) => {
    const latestRun = getFineTuningBaselineRun(set);
    const rows = (Array.isArray(set.dataRows) ? set.dataRows : []).slice(0, 8).map((row, rowIndex) => ({
      index: rowIndex + 1,
      input: String(row?.input || "").slice(0, 1200),
      expectedOutput: String(row?.expectedOutput || row?.expected_output || "").slice(0, 1200),
      evaluationGuidance: String(row?.evaluationGuidance || row?.evaluation_guidance || "").slice(0, 800),
      runCount: Number(row?.runCount || row?.run_count || 1) || 1,
    }));
    return {
      index: index + 1,
      id: set.id,
      name: set.name,
      activeVersionId: set.activeVersionId,
      activeVersionNumber: set.activeVersionNumber,
      latestRun,
      caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
      sampleCases: rows,
    };
  });
  return [
    "You are running a fine-tuning analysis job for an AI agent platform.",
    "Your job is to create and publish a safer, higher-performing version of the target agent from the selected evaluation evidence.",
    "This is an execution task, not a recommendation task. The user approved this exact publish action by starting the fine-tune job.",
    "Do not ask whether to continue, do not browse unrelated platform state, and do not stop after an analysis plan.",
    "Focus on concrete instruction changes, missing constraints, failure modes, and evaluation-driven improvements.",
    "",
    "Required execution path:",
    "1. Adapt the target agent instructions directly from the evidence below.",
    "2. Write the complete improved target-agent instructions to /tmp/fine-tuned-agent-instructions.md.",
    "3. Run exactly this publish command:",
    "   python3 /workspace/.claude/skills/computer-agents/scripts/computer-agents.py fine-tuning publish-agent-version --target-agent-id " + targetAgent.id + " --instructions-file /tmp/fine-tuned-agent-instructions.md --job-id " + (jobId || "fine_tune_job") + " --label \"Fine-Tuned Version\" --description \"Generated by fine-tuning job " + (jobId || "") + "\"",
    "4. If the command succeeds, return a concise summary of the evidence, the exact instruction changes, and the published version id.",
    "5. If the command fails, return the exact command error. Do not switch to curl or hand-written API calls.",
    "",
    "Do not run agents list, threads list, evaluations list, versions list, or generic API discovery unless the required publish command fails because a required ID is invalid. All required IDs and evaluation evidence are included here.",
    "",
    "Target agent:",
    JSON.stringify({
      id: targetAgent.id,
      name: targetAgent.name,
      model: targetAgent.model,
      description: targetAgent.description,
      instructions: targetAgent.instructions,
      nextVersionNumber,
    }, null, 2),
    "",
    "Fine-tuner agent executing this job:",
    JSON.stringify({
      id: fineTunerAgent.id,
      name: fineTunerAgent.name,
      model: fineTunerAgent.model,
    }, null, 2),
    "",
    "Execution computer:",
    JSON.stringify({ id: environment.id, name: environment.name }, null, 2),
    "",
    "User focus:",
    instructions ? instructions : "No extra focus supplied.",
    "",
    "Evaluation data:",
    JSON.stringify({
      evaluationSetCount: evaluationSets.length,
      caseCount,
      verifyAfter: Boolean(verifyAfter),
      evaluationSets: evaluationSummary,
    }, null, 2),
    "",
    "Return the final fine-tuning summary only after the version creation command has succeeded or failed with a concrete error."
  ].join("\n");
}

function decodeMaybeEscapedText(value) {
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

function sanitizeFineTuningAnalysisText(value) {
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

function extractStringFromPayloadValue(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(extractStringFromPayloadValue).filter(Boolean).join("");
  }
  if (value && typeof value === "object") {
    return extractTextFromStreamPayload(value);
  }
  return "";
}

function extractTextFromStreamPayload(payload) {
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

function extractStreamSummary(streamText) {
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

function buildProposedInstructions(agent, evaluationSets, instructions, analysis) {
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

function buildAgentSnapshot(agent, instructions) {
  return {
    name: agent.name,
    description: agent.description,
    model: agent.model,
    instructions,
    enabledSkills: Array.isArray(agent.enabledSkills) ? agent.enabledSkills : [],
    guardrails: Array.isArray(agent.guardrails) ? agent.guardrails : Array.isArray(agent.metadata?.guardrails) ? agent.metadata.guardrails : [],
    metadata: {
      ...(agent.metadata || {}),
    },
  };
}

function buildFineTuningDiffFilesFromSnapshots(beforeSnapshot, afterSnapshot) {
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

function buildFineTuningDiffFiles(agent, proposedInstructions) {
  return buildFineTuningDiffFilesFromSnapshots(
    buildAgentSnapshot(agent, String(agent.instructions || "")),
    buildAgentSnapshot(agent, proposedInstructions)
  );
}

function buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore) {
  return evaluationSets.map((set, index) => {
    const beforeRun = getFineTuningBaselineRun(set);
    const beforeScore = clampScore(beforeRun?.averageScore || 0);
    return {
      evaluationSetId: set.id,
      evaluationSetName: set.name,
      beforeRunId: beforeRun?.id || "",
      beforeRunLabel: beforeRun?.label || "",
      beforeScore,
      afterRunId: "",
      afterRunLabel: "",
      afterScore: 0,
      status: verifyAfter ? "pending" : "not_run",
    };
  });
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text().catch(() => "");
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    throw createRuntimeError(normalizeString(data?.message || data?.error || fallbackMessage || "Request failed"), response.status);
  }
  return data;
}

function extractAgentVersionRecord(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.version, source.agentVersion, source.agent_version, source.data?.version, source.data?.agentVersion, source.data, source.item, source.record, source];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const id = normalizeString(candidate.id || candidate.versionId || candidate.version_id);
      if (id) return { ...candidate, id };
    }
  }
  return null;
}

function extractAgentVersionRecords(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.versions, source.agentVersions, source.agent_versions, source.data?.versions, source.data?.agentVersions, source.data?.agent_versions, source.data, payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map((version) => extractAgentVersionRecord(version))
        .filter(Boolean);
    }
  }
  return [];
}

function findFineTuningVersionInList(versions, fineTuningJobId) {
  const normalizedJobId = normalizeString(fineTuningJobId);
  if (!normalizedJobId) return null;
  for (const version of Array.isArray(versions) ? versions : []) {
    const metadata = version?.metadata && typeof version.metadata === "object" && !Array.isArray(version.metadata)
      ? version.metadata
      : {};
    if (
      normalizeString(version?.fineTuningJobId || version?.fine_tuning_job_id) === normalizedJobId
      || normalizeString(metadata.fineTuningJobId || metadata.fine_tuning_job_id) === normalizedJobId
    ) {
      return version;
    }
  }
  return null;
}

function extractThreadRecord(payload) {
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

export function createPlaygroundFineTuningRuntime(deps = {}) {
  const {
    sendJson,
    readRequestBody,
    parseUpstreamUrl,
    readOptionalApiKey,
    withProxyOrganizationHeader,
    hasAiosSession,
    fetchAiosApi,
    fetchAiosCloud,
    enrichThreadPayloadWithAgentGuardrails,
  } = deps;
  const jobsById = new Map();

  function pruneJobs() {
    const now = Date.now();
    for (const [jobId, record] of jobsById.entries()) {
      if (now - Number(record.updatedAtMs || 0) > FINE_TUNING_JOB_TTL_MS) {
        jobsById.delete(jobId);
      }
    }
  }

  function storeJob(job) {
    jobsById.set(job.id, {
      job,
      updatedAtMs: Date.now(),
    });
  }

  async function createHiddenThread(record, { title, agentId, environmentId, metadata }) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = {
      title,
      appId: "runner-web-sdk-demo",
      agentId,
      environmentId,
      hidden: true,
      sidebarHidden: true,
      enabledSkills: {
        computerAgents: true,
      },
      metadata,
    };
    const enrichedPayload = typeof enrichThreadPayloadWithAgentGuardrails === "function"
      ? await enrichThreadPayloadWithAgentGuardrails(requestContext, upstreamUrl, apiKey, payload)
      : payload;
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/threads`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(enrichedPayload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, "/threads", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(enrichedPayload),
          })
        : await fetchAiosApi(requestContext, "/api/threads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(enrichedPayload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create fine-tuning thread.");
    const thread = extractThreadRecord(data);
    if (!thread?.id) {
      throw createRuntimeError("Thread creation succeeded but no thread id was returned.", 502);
    }
    return {
      ...thread,
      hidden: true,
      sidebarHidden: true,
      metadata: {
        ...(metadata || {}),
        ...(thread.metadata && typeof thread.metadata === "object" ? thread.metadata : {}),
      },
    };
  }

  async function runThreadMessage(record, threadId, content) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = {
      content,
      task: content,
      enabledSkills: {
        computerAgents: true,
      },
    };
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/threads/${encodeURIComponent(threadId)}/messages`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/threads/${encodeURIComponent(threadId)}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    if (!response.ok) {
      await readJsonResponse(response, "Failed to start fine-tuning thread.");
    }
    const text = await response.text().catch(() => "");
    return extractStreamSummary(text);
  }

  async function findExistingAgentVersionForFineTuning(record, agent, fineTuningJobId) {
    const normalizedJobId = normalizeString(fineTuningJobId);
    if (!agent?.id || !normalizedJobId) return null;
    const { requestContext, upstreamUrl, apiKey, body } = record;
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "GET",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "GET",
            headers: { "content-type": "application/json" },
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "GET",
            headers: { "content-type": "application/json" },
          });
    } else {
      return null;
    }
    if (!response.ok) {
      return null;
    }
    const data = await response.json().catch(() => ({}));
    return findFineTuningVersionInList(extractAgentVersionRecords(data), normalizedJobId);
  }

  async function createAgentVersion(record, agent, versionDraft) {
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const fineTuningJobId = normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id);
    const existingVersion = await findExistingAgentVersionForFineTuning(record, agent, fineTuningJobId).catch(() => null);
    if (existingVersion?.id) {
      return existingVersion;
    }
    const snapshot = versionDraft?.snapshot && typeof versionDraft.snapshot === "object" && !Array.isArray(versionDraft.snapshot)
      ? versionDraft.snapshot
      : {};
    const payload = {
      label: normalizeString(versionDraft?.label || "Fine-Tuned Version"),
      description: normalizeString(versionDraft?.description || ""),
      status: "published",
      source: "fine_tuning",
      fineTuningJobId: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
      snapshot,
      agent: {
        id: agent.id,
        agentId: agent.id,
        name: snapshot.name || agent.name,
        description: snapshot.description || agent.description || "",
        model: snapshot.model || agent.model || "",
        instructions: snapshot.instructions || "",
        enabledSkills: Array.isArray(snapshot.enabledSkills) ? snapshot.enabledSkills : [],
        guardrailSetIds: Array.isArray(snapshot.guardrailSetIds) ? snapshot.guardrailSetIds : [],
        guardrails: Array.isArray(snapshot.guardrails) ? snapshot.guardrails : [],
        promptAdaptations: Array.isArray(snapshot.promptAdaptations) ? snapshot.promptAdaptations : [],
        invisiblePromptAdaptations: Array.isArray(snapshot.invisiblePromptAdaptations) ? snapshot.invisiblePromptAdaptations : [],
        metadata: snapshot.metadata || {},
      },
      metadata: {
        ...(versionDraft?.metadata && typeof versionDraft.metadata === "object" && !Array.isArray(versionDraft.metadata) ? versionDraft.metadata : {}),
        fineTuningJobId: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
        fine_tuning_job_id: normalizeString(versionDraft?.fineTuningJobId || versionDraft?.fine_tuning_job_id),
      },
    };
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to create fine-tuned agent version.");
    const version = extractAgentVersionRecord(data);
    if (!version?.id) {
      throw createRuntimeError("Agent version creation succeeded but no version id was returned.", 502);
    }
    return version;
  }

  async function publishAgentVersion(record, agent, version, snapshot) {
    const versionId = normalizeString(version?.id || version?.versionId || version?.version_id);
    if (!agent?.id || !versionId) {
      throw createRuntimeError("Agent version publish failed because no version id was returned.", 502);
    }
    const { requestContext, upstreamUrl, apiKey, body } = record;
    const payload = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)
      ? { snapshot }
      : {};
    let response;
    if (apiKey) {
      response = await fetch(`${upstreamUrl}/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
        method: "POST",
        headers: withProxyOrganizationHeader(requestContext, body, {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        }),
        body: JSON.stringify(payload),
      });
    } else if (hasAiosSession(requestContext)) {
      const cloudFetch = typeof fetchAiosCloud === "function" ? fetchAiosCloud : null;
      response = cloudFetch
        ? await cloudFetch(requestContext, `/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetchAiosApi(requestContext, `/api/agents/${encodeURIComponent(agent.id)}/versions/${encodeURIComponent(versionId)}/publish`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(payload),
          });
    } else {
      throw createRuntimeError("Sign in to Computer Agents or provide an API key.", 401);
    }
    const data = await readJsonResponse(response, "Failed to publish fine-tuned agent version.");
    const publishedVersion = extractAgentVersionRecord(data);
    return {
      ...(version && typeof version === "object" && !Array.isArray(version) ? version : {}),
      ...(publishedVersion || {}),
      id: publishedVersion?.id || versionId,
      status: normalizeString(publishedVersion?.status || "published") || "published",
      publishedAt: normalizeString(publishedVersion?.publishedAt || publishedVersion?.published_at || new Date().toISOString()),
      published_at: normalizeString(publishedVersion?.published_at || publishedVersion?.publishedAt || new Date().toISOString()),
    };
  }

  async function handleCreateJob(req, res) {
    try {
      pruneJobs();
      const body = await readRequestBody(req);
      const upstreamUrl = parseUpstreamUrl(req, body);
      const apiKey = readOptionalApiKey(req, body);
      const requestContext = req;
      if (!apiKey && !hasAiosSession(requestContext)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Computer Agents or provide an API key.",
        });
      }
      const submittedAgent = normalizeAgent(body.agent || {});
      const fineTunerAgent = normalizeAgent(body.fineTunerAgent || body.fine_tuner_agent || body.runnerAgent || body.runner_agent || body.agent || {});
      const environment = normalizeEnvironment(body.environment || {});
      const evaluationSets = (Array.isArray(body.evaluationSets) ? body.evaluationSets : [])
        .map((set, index) => normalizeEvaluationSet(set, index))
        .filter((set) => set.id);
      const instructions = String(body.instructions || body.focus || "");
      const verifyAfter = true;
      const evaluationTarget = resolveFineTuningTargetFromEvaluationSets(evaluationSets);
      if (evaluationTarget.error) {
        return sendJson(res, 400, { error: evaluationTarget.error });
      }
      const explicitTargetAgent = normalizeAgent(body.targetAgent || body.target_agent || {});
      const targetFromRun = evaluationTarget.target || null;
      if (targetFromRun?.id && explicitTargetAgent.id && explicitTargetAgent.id !== targetFromRun.id) {
        return sendJson(res, 400, { error: "The submitted target agent does not match the selected evaluation run target." });
      }
      const targetAgentSource = targetFromRun
        ? {
            ...(submittedAgent.id === targetFromRun.id ? submittedAgent : {}),
            ...(explicitTargetAgent.id === targetFromRun.id ? explicitTargetAgent : {}),
            id: targetFromRun.id,
            name: targetFromRun.name || explicitTargetAgent.name || submittedAgent.name || "Target Agent",
            photoUrl: targetFromRun.photoUrl || explicitTargetAgent.photoUrl || submittedAgent.photoUrl || "",
          }
        : explicitTargetAgent.id
          ? explicitTargetAgent
          : submittedAgent;
      const targetAgent = normalizeAgent(targetAgentSource);
      if (!fineTunerAgent.id) {
        return sendJson(res, 400, { error: "Select a fine-tuner agent before starting fine-tuning." });
      }
      if (!targetAgent.id) {
        return sendJson(res, 400, { error: "The selected evaluation run does not contain a target agent. Run the evaluation first, then start fine-tuning from that run." });
      }
      if (isProtectedFineTuningTargetAgent(targetAgent)) {
        return sendJson(res, 400, { error: "Default agents cannot be fine-tuned. Create or select a custom agent evaluation run first." });
      }
      if (!environment.id) {
        return sendJson(res, 400, { error: "Select a computer before starting fine-tuning." });
      }
      if (!evaluationSets.length) {
        return sendJson(res, 400, { error: "Select at least one evaluation set." });
      }
      const nowIso = new Date().toISOString();
      const jobId = normalizeString(body.id || body.jobId || body.job_id) || createFineTuningId();
      const conductedBy = normalizePersonIdentity(body.conductedBy || body.conducted_by || body.createdBy || body.created_by || {});
      const metadata = {
        fineTuning: {
          jobId,
          agentId: targetAgent.id,
          targetAgentId: targetAgent.id,
          fineTunerAgentId: fineTunerAgent.id,
          environmentId: environment.id,
          evaluationSetIds: evaluationSets.map((set) => set.id),
          hidden: true,
          sidebarHidden: true,
        },
        runnerPlayground: {
          type: "fine_tuning_job",
          fineTuningJobId: jobId,
          hidden: true,
          sidebarHidden: true,
        },
      };
      let thread = {
        id: "",
        title: "Fine-Tune · " + targetAgent.name,
      };
      let threadStartupError = "";
      try {
        thread = await createHiddenThread({
          requestContext,
          upstreamUrl,
          apiKey,
        body,
        }, {
          title: "Fine-Tune · " + targetAgent.name,
          agentId: fineTunerAgent.id,
          environmentId: environment.id,
          metadata,
        });
      } catch (error) {
        threadStartupError = error?.message || String(error);
      }
      const prompt = buildFineTuningPrompt({
        targetAgent,
        fineTunerAgent,
        environment,
        evaluationSets,
        instructions,
        verifyAfter,
        jobId,
        nextVersionNumber: Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0,
      });
      const beforeScore = calculateAverageScore(evaluationSets);
      const improvementScore = 0;
      const afterScore = verifyAfter ? beforeScore : 0;
      const beforeSnapshot = buildAgentSnapshot(targetAgent, String(targetAgent.instructions || ""));
      const nextVersionNumber = Math.max(
        1,
        Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0
      ) || 1;
      const evaluationRuns = buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore);
      const initialVersion = {
        id: createFineTuningId("agent_version"),
        version: nextVersionNumber,
        label: "Fine-Tuned Version",
        description: "Generated by fine-tuning job " + jobId,
        status: "pending",
        snapshot: null,
        createdAt: nowIso,
        fineTuningJobId: jobId,
        metadata: {
          fineTuningJobId: jobId,
          fine_tuning_job_id: jobId,
          targetAgentId: targetAgent.id,
          target_agent_id: targetAgent.id,
          fineTunerAgentId: fineTunerAgent.id,
          fine_tuner_agent_id: fineTunerAgent.id,
          evaluationSetIds: evaluationSets.map((set) => set.id),
          evaluation_set_ids: evaluationSets.map((set) => set.id),
        },
      };
      const initialJob = {
        id: jobId,
        name: normalizeString(body.name || "Fine-Tune " + targetAgent.name),
        status: "running",
        createdAt: nowIso,
        updatedAt: nowIso,
        agentId: targetAgent.id,
        targetAgentId: targetAgent.id,
        agentName: targetAgent.name,
        targetAgentName: targetAgent.name,
        agentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
        targetAgentPhotoUrl: normalizeString(targetAgent.photoUrl || targetAgent.photoURL || targetAgent.avatarUrl || targetAgent.avatarURL),
        conductedBy,
        createdBy: conductedBy,
        fineTunerAgentId: fineTunerAgent.id,
        fineTunerAgentName: fineTunerAgent.name,
        fineTunerAgentPhotoUrl: normalizeString(fineTunerAgent.photoUrl || fineTunerAgent.photoURL || fineTunerAgent.avatarUrl || fineTunerAgent.avatarURL),
        environmentId: environment.id,
        environmentName: environment.name,
        evaluationSets: evaluationSets.map((set) => ({
          id: set.id,
          name: set.name,
          activeVersionId: set.activeVersionId,
          activeVersionNumber: set.activeVersionNumber,
          activeVersionLabel: set.activeVersionLabel,
          fineTuningRunId: normalizeString(getFineTuningBaselineRun(set)?.id || set.selectedRunId || ""),
          fineTuningRunLabel: normalizeString(getFineTuningBaselineRun(set)?.label || ""),
          caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
        })),
        instructions,
        verifyAfter,
        threadId: thread.id,
        threadTitle: thread.title || "Fine-Tune · " + targetAgent.name,
        beforeScore,
        afterScore: 0,
        improvementScore: 0,
        costTokens: normalizeTokenCount(Math.ceil(prompt.length / 4)),
        analysisSummary: thread.id
          ? "Fine-tuning analysis is running."
          : "Fine-tuning analysis thread could not be created: " + threadStartupError,
        evaluationRuns,
        beforeAgentSnapshot: beforeSnapshot,
        afterAgentSnapshot: beforeSnapshot,
        diffFiles: [],
        createdAgentVersion: initialVersion,
        createdAgentVersionId: "",
        agentVersionCreationStatus: "pending",
      };
      storeJob(initialJob);
      sendJson(res, 202, {
        object: "fine_tuning_job",
        job: initialJob,
      });
      void (async () => {
        try {
          const analysisSummary = thread.id
            ? await runThreadMessage({
                requestContext,
                upstreamUrl,
                apiKey,
                body,
              }, thread.id, prompt).catch((error) => {
                return "Fine-tuning analysis thread was created, but the analysis response was not available: " + (error?.message || String(error));
              })
            : "Fine-tuning analysis thread could not be created, so a version was generated from the selected evaluation context: " + threadStartupError;
          const proposedInstructions = buildProposedInstructions(targetAgent, evaluationSets, instructions, analysisSummary);
          const diffFiles = buildFineTuningDiffFiles(targetAgent, proposedInstructions);
          const afterSnapshot = buildAgentSnapshot(targetAgent, proposedInstructions);
          const finishedAtIso = new Date().toISOString();
          const costTokens = normalizeTokenCount(
            Math.ceil(prompt.length / 4)
            + Math.ceil(String(analysisSummary || "").length / 5)
            + evaluationSets.reduce((sum, set) => sum + (Array.isArray(set.dataRows) ? set.dataRows.length : 0), 0) * 18
          );
          const proposedVersion = {
            ...initialVersion,
            status: "proposed",
            snapshot: afterSnapshot,
          };
          let createdAgentVersion = proposedVersion;
          let agentVersionCreationStatus = "proposed";
          try {
            const savedVersion = await createAgentVersion({
              requestContext,
              upstreamUrl,
              apiKey,
              body,
            }, targetAgent, proposedVersion);
            const publishedVersion = await publishAgentVersion({
              requestContext,
              upstreamUrl,
              apiKey,
              body,
            }, targetAgent, savedVersion, proposedVersion.snapshot);
            createdAgentVersion = {
              ...proposedVersion,
              ...publishedVersion,
              status: normalizeString(publishedVersion.status || "published") || "published",
              snapshot: publishedVersion.snapshot || savedVersion.snapshot || proposedVersion.snapshot,
            };
            agentVersionCreationStatus = "published";
          } catch (error) {
            createdAgentVersion = {
              ...proposedVersion,
              error: error?.message || String(error),
            };
          }
          const publishedSnapshot = createdAgentVersion?.snapshot && typeof createdAgentVersion.snapshot === "object" && !Array.isArray(createdAgentVersion.snapshot)
            ? createdAgentVersion.snapshot
            : afterSnapshot;
          const publishedDiffFiles = buildFineTuningDiffFilesFromSnapshots(beforeSnapshot, publishedSnapshot);
          storeJob({
            ...initialJob,
            status: "completed",
            updatedAt: finishedAtIso,
            afterScore,
            improvementScore: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
            costTokens,
            analysisSummary,
            evaluationRuns,
            afterAgentSnapshot: publishedSnapshot,
            diffFiles: publishedDiffFiles.length ? publishedDiffFiles : diffFiles,
            createdAgentVersion,
            createdAgentVersionId: createdAgentVersion.id || "",
            agentVersionCreationStatus,
          });
        } catch (error) {
          const currentJob = jobsById.get(jobId)?.job || initialJob;
          const message = error?.message || String(error);
          storeJob({
            ...currentJob,
            status: "error",
            error: message,
            analysisSummary: currentJob.analysisSummary || message,
            agentVersionCreationStatus: ["saved", "published"].includes(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionCreationStatus : "error",
            agentVersionError: ["saved", "published"].includes(currentJob.agentVersionCreationStatus) ? currentJob.agentVersionError : message,
            createdAgentVersion: ["saved", "published"].includes(currentJob.agentVersionCreationStatus)
              ? currentJob.createdAgentVersion
              : {
                  ...(currentJob.createdAgentVersion || initialVersion),
                  status: "error",
                  error: message,
                },
            updatedAt: new Date().toISOString(),
          });
        }
      })();
      return;
    } catch (error) {
      return sendJson(res, Number(error?.status || 500), {
        error: "Failed to start fine-tuning job",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function handleRequest(req, res, url) {
    if (req.method === "POST" && url.pathname === "/api/real/fine-tuning/jobs") {
      void handleCreateJob(req, res);
      return true;
    }
    const jobMatch = url.pathname.match(/^\/api\/real\/fine-tuning\/jobs\/([^/]+)$/);
    if (req.method === "GET" && jobMatch) {
      pruneJobs();
      const job = jobsById.get(decodeURIComponent(jobMatch[1]))?.job || null;
      if (!job) {
        sendJson(res, 404, { error: "Fine-tuning job not found." });
        return true;
      }
      sendJson(res, 200, { object: "fine_tuning_job", job });
      return true;
    }
    return false;
  }

  return {
    handleRequest,
  };
}
