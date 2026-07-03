const FINE_TUNING_JOB_TTL_MS = 1000 * 60 * 60 * 8;

function normalizeString(value) {
  return String(value || "").trim();
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
  return {
    id: normalizeString(source.id || source.evaluationSetId || source.evaluation_set_id) || "evaluation_" + (fallbackIndex + 1),
    name: normalizeString(source.name || source.title || "Evaluation " + (fallbackIndex + 1)),
    description: String(source.description || ""),
    evaluationGuidance: String(source.evaluationGuidance || source.evaluation_guidance || ""),
    dataRows,
    runs,
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

function calculateAverageScore(sets) {
  const scores = (Array.isArray(sets) ? sets : [])
    .map((set) => getLatestEvaluationRun(set)?.averageScore)
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

function buildFineTuningPrompt({ agent, environment, evaluationSets, instructions, verifyAfter }) {
  const caseCount = evaluationSets.reduce((sum, set) => sum + (Array.isArray(set.dataRows) ? set.dataRows.length : 0), 0);
  const evaluationSummary = evaluationSets.map((set, index) => {
    const latestRun = getLatestEvaluationRun(set);
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
    "Analyze the selected evaluation datasets and propose a safer, higher-performing next version of the target agent.",
    "Focus on concrete instruction changes, missing constraints, failure modes, and evaluation-driven improvements.",
    "",
    "Target agent:",
    JSON.stringify({
      id: agent.id,
      name: agent.name,
      model: agent.model,
      description: agent.description,
      instructions: agent.instructions,
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
    "Return a concise improvement plan and the exact agent instruction changes you recommend."
  ].join("\n");
}

function extractStreamSummary(streamText) {
  const text = String(streamText || "");
  if (!text.trim()) return "";
  const candidates = [];
  text.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const payload = trimmed.startsWith("data:") ? trimmed.slice(5).trim() : trimmed;
    if (!payload || payload === "[DONE]") return;
    try {
      const parsed = JSON.parse(payload);
      const value = parsed.summary || parsed.text || parsed.content || parsed.message?.content || parsed.delta?.content || "";
      if (value) candidates.push(String(value));
    } catch {
      if (!payload.startsWith("{")) candidates.push(payload);
    }
  });
  return candidates.join("").trim() || text.slice(-4000).trim();
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

function buildFineTuningDiffFiles(agent, proposedInstructions) {
  const beforeSnapshot = buildAgentSnapshot(agent, String(agent.instructions || ""));
  const afterSnapshot = buildAgentSnapshot(agent, proposedInstructions);
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

function buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore) {
  return evaluationSets.map((set, index) => {
    const beforeRun = getLatestEvaluationRun(set);
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
      response = await fetchAiosApi(requestContext, "/api/threads", {
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
    const payload = { content, task: content };
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
      response = await fetchAiosApi(requestContext, `/api/threads/${encodeURIComponent(threadId)}/messages`, {
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
      const agent = normalizeAgent(body.agent || {});
      const environment = normalizeEnvironment(body.environment || {});
      const evaluationSets = (Array.isArray(body.evaluationSets) ? body.evaluationSets : [])
        .map((set, index) => normalizeEvaluationSet(set, index))
        .filter((set) => set.id);
      const instructions = String(body.instructions || body.focus || "");
      const verifyAfter = body.verifyAfter === true || body.verify_after === true;
      if (!agent.id) {
        return sendJson(res, 400, { error: "Select an agent before starting fine-tuning." });
      }
      if (!environment.id) {
        return sendJson(res, 400, { error: "Select a computer before starting fine-tuning." });
      }
      if (!evaluationSets.length) {
        return sendJson(res, 400, { error: "Select at least one evaluation set." });
      }
      const nowIso = new Date().toISOString();
      const jobId = normalizeString(body.id || body.jobId || body.job_id) || createFineTuningId();
      const metadata = {
        fineTuning: {
          jobId,
          agentId: agent.id,
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
      const thread = await createHiddenThread({
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      }, {
        title: "Fine-Tune · " + agent.name,
        agentId: agent.id,
        environmentId: environment.id,
        metadata,
      });
      const prompt = buildFineTuningPrompt({ agent, environment, evaluationSets, instructions, verifyAfter });
      const analysisSummary = await runThreadMessage({
        requestContext,
        upstreamUrl,
        apiKey,
        body,
      }, thread.id, prompt).catch((error) => {
        return "Fine-tuning analysis thread was created, but the analysis response was not available: " + (error?.message || String(error));
      });
      const beforeScore = calculateAverageScore(evaluationSets);
      const improvementScore = 0;
      const afterScore = verifyAfter ? beforeScore : 0;
      const proposedInstructions = buildProposedInstructions(agent, evaluationSets, instructions, analysisSummary);
      const diffFiles = buildFineTuningDiffFiles(agent, proposedInstructions);
      const beforeSnapshot = buildAgentSnapshot(agent, String(agent.instructions || ""));
      const afterSnapshot = buildAgentSnapshot(agent, proposedInstructions);
      const nextVersionNumber = Math.max(
        1,
        Number(body.nextAgentVersionNumber || body.next_agent_version_number || 0) || 0
      ) || 1;
      const evaluationRuns = buildEvaluationRunReferences(evaluationSets, verifyAfter, improvementScore);
      const costTokens = normalizeTokenCount(
        Math.ceil(prompt.length / 4)
        + Math.ceil(String(analysisSummary || "").length / 5)
        + evaluationSets.reduce((sum, set) => sum + (Array.isArray(set.dataRows) ? set.dataRows.length : 0), 0) * 18
      );
      const job = {
        id: jobId,
        name: normalizeString(body.name || "Fine-Tune " + agent.name),
        status: "completed",
        createdAt: nowIso,
        updatedAt: nowIso,
        agentId: agent.id,
        agentName: agent.name,
        agentPhotoUrl: normalizeString(agent.photoUrl || agent.photoURL || agent.avatarUrl || agent.avatarURL),
        environmentId: environment.id,
        environmentName: environment.name,
        evaluationSets: evaluationSets.map((set) => ({
          id: set.id,
          name: set.name,
          activeVersionId: set.activeVersionId,
          activeVersionNumber: set.activeVersionNumber,
          activeVersionLabel: set.activeVersionLabel,
          caseCount: Array.isArray(set.dataRows) ? set.dataRows.length : 0,
        })),
        instructions,
        verifyAfter,
        threadId: thread.id,
        threadTitle: thread.title || "Fine-Tune · " + agent.name,
        beforeScore,
        afterScore,
        improvementScore: verifyAfter ? clampScore(afterScore - beforeScore) : 0,
        costTokens,
        analysisSummary,
        evaluationRuns,
        beforeAgentSnapshot: beforeSnapshot,
        afterAgentSnapshot: afterSnapshot,
        diffFiles,
        createdAgentVersion: {
          id: createFineTuningId("agent_version"),
          version: nextVersionNumber,
          label: "Fine-Tuned Version",
          description: "Generated by fine-tuning job " + jobId,
          status: "proposed",
          snapshot: afterSnapshot,
          createdAt: nowIso,
        },
      };
      storeJob(job);
      return sendJson(res, 202, {
        object: "fine_tuning_job",
        job,
      });
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
