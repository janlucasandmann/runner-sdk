/**
 * Stateful task execution and ephemeral backlog-composer workflow.
 *
 * The demo shell supplies transport/authentication primitives; this module
 * owns project/task semantics, local capture state, and request routing.
 */
export function createTaskBacklogService({
  fetchAiosTaskApi,
  hasAiosSession,
  inferProxyContentTypeFromPath,
  parseUpstreamUrl,
  proxyUpstreamBinaryGet,
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
  proxyUpstreamRawRequest,
  readOptionalApiKey,
  readRequestBody,
  sendJson,
  withProxyOrganizationHeader,
}) {
  const dependencies = {
    fetchAiosTaskApi,
    hasAiosSession,
    inferProxyContentTypeFromPath,
    parseUpstreamUrl,
    proxyUpstreamBinaryGet,
    proxyUpstreamGet,
    proxyUpstreamJsonRequest,
    proxyUpstreamRawRequest,
    readOptionalApiKey,
    readRequestBody,
    sendJson,
    withProxyOrganizationHeader,
  };
  for (const [name, value] of Object.entries(dependencies)) {
    if (typeof value !== "function") {
      throw new TypeError(`Task backlog service requires a ${name} adapter.`);
    }
  }

  const PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX = "taskbacklog_";
  const backlogComposerResultsByThreadId = new Map();
  const PLAYGROUND_TASK_HUMAN_ME_ID = "__runner_playground_human_me__";

  function isPlaygroundHumanAssigneeId(value) {
    return String(value || "").trim() === PLAYGROUND_TASK_HUMAN_ME_ID;
  }

  function encodePlaygroundTaskBacklogThreadState(value) {
    return Buffer.from(JSON.stringify(value), "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  function decodePlaygroundTaskBacklogThreadState(value) {
    const normalized = String(value || "").trim();
    if (!normalized.startsWith(PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX)) {
      return null;
    }

    const encoded = normalized.slice(PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX.length);
    if (!encoded) {
      return null;
    }

    const normalizedBase64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padding = normalizedBase64.length % 4 === 0
      ? ""
      : "=".repeat(4 - (normalizedBase64.length % 4));

    try {
      const parsed = JSON.parse(Buffer.from(normalizedBase64 + padding, "base64").toString("utf8"));
      return {
        projectId: typeof parsed?.projectId === "string" ? parsed.projectId.trim() : "",
        environmentId: typeof parsed?.environmentId === "string" ? parsed.environmentId.trim() : "",
        agentId: typeof parsed?.agentId === "string" ? parsed.agentId.trim() : "",
      };
    } catch {
      return null;
    }
  }

  function buildPlaygroundTaskBacklogThreadId(payload) {
    return PLAYGROUND_TASK_BACKLOG_THREAD_PREFIX + encodePlaygroundTaskBacklogThreadState(payload);
  }

  function normalizeServerBacklogTicketNumber(value) {
    const digits = String(value || "").replace(/\D+/g, "");
    if (!digits) {
      return "";
    }
    return digits.slice(-3).padStart(3, "0");
  }

  function getServerBacklogTaskRunnerMetadata(task) {
    return task?.metadata?.runnerPlayground && typeof task.metadata.runnerPlayground === "object" && !Array.isArray(task.metadata.runnerPlayground)
      ? task.metadata.runnerPlayground
      : null;
  }

  function getServerBacklogTaskType(task) {
    const metadata = getServerBacklogTaskRunnerMetadata(task);
    const normalized = String(task?.taskType || task?.type || metadata?.taskType || "").trim().toLowerCase();
    if (normalized === "subtask") return "subtask";
    if (normalized === "loop" || normalized === "loop_task" || normalized === "metronome_loop") return "loop";
    return "task";
  }

  function getServerBacklogTaskTicketNumber(task) {
    const metadata = getServerBacklogTaskRunnerMetadata(task);
    return normalizeServerBacklogTicketNumber(task?.ticketNumber || metadata?.ticketNumber);
  }

  function getServerBacklogTaskReviewerAgentId(task) {
    const metadata = getServerBacklogTaskRunnerMetadata(task);
    return String(
      task?.reviewerAgentId
      || task?.reviewer_agent_id
      || task?.reviewerActorId
      || task?.reviewer_actor_id
      || task?.review?.reviewerActorId
      || task?.review?.reviewer_actor_id
      || metadata?.reviewerActorId
      || ""
    ).trim();
  }

  function getServerBacklogTaskReviewRequired(task) {
    const metadata = getServerBacklogTaskRunnerMetadata(task);
    return task?.reviewRequired === true
      || task?.review_required === true
      || task?.review?.reviewRequired === true
      || task?.review?.review_required === true
      || metadata?.reviewRequired === true
      || Boolean(getServerBacklogTaskReviewerAgentId(task));
  }

  function extractServerTaskList(payload) {
    if (Array.isArray(payload)) {
      return payload;
    }
    if (Array.isArray(payload?.data)) {
      return payload.data;
    }
    if (Array.isArray(payload?.tasks)) {
      return payload.tasks;
    }
    return [];
  }

  function extractServerTaskRecord(payload) {
    if (payload?.task && typeof payload.task === "object") {
      return payload.task;
    }
    if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data;
    }
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
  }

  function extractServerThreadRecord(payload) {
    if (payload?.thread && typeof payload.thread === "object") {
      return payload.thread;
    }
    if (payload?.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
      return payload.data;
    }
    return payload && typeof payload === "object" && !Array.isArray(payload) ? payload : null;
  }

  async function resolveProjectTaskByTicketNumber(req, { apiKey, upstreamUrl, projectId, ticketNumber }) {
    const normalizedTicketNumber = normalizeServerBacklogTicketNumber(ticketNumber);
    if (!normalizedTicketNumber || !projectId) {
      return null;
    }

    const taskPath = `/tasks?projectId=${encodeURIComponent(projectId)}`;
    let upstream;

    if (apiKey) {
      upstream = await fetch(`${upstreamUrl}${taskPath}`, {
        method: "GET",
        headers: withProxyOrganizationHeader(req, {}, {
          "X-API-Key": apiKey,
        }),
      });
    } else {
      upstream = await fetchAiosTaskApi(req, taskPath, {
        method: "GET",
      });
    }

    const text = await upstream.text().catch(() => "");
    let parsed = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch {
      parsed = { message: text };
    }

    if (!upstream.ok) {
      throw new Error(parsed?.message || parsed?.error || "Failed to load project tasks.");
    }

    const tasks = extractServerTaskList(parsed);
    return tasks.find((task) =>
      task?.id
        && getServerBacklogTaskTicketNumber(task) === normalizedTicketNumber
        && getServerBacklogTaskType(task) !== "subtask"
    ) || null;
  }

  function buildServerGithubRepoSelectionAttachment(githubRepo) {
    if (!githubRepo || typeof githubRepo !== "object" || Array.isArray(githubRepo)) {
      return null;
    }
    const repoFullName = typeof githubRepo.repoFullName === "string" ? githubRepo.repoFullName.trim() : "";
    const branch = typeof githubRepo.branch === "string" && githubRepo.branch.trim()
      ? githubRepo.branch.trim()
      : "main";
    if (!repoFullName || !repoFullName.includes("/")) {
      return null;
    }
    const repoName = typeof githubRepo.repoName === "string" && githubRepo.repoName.trim()
      ? githubRepo.repoName.trim()
      : repoFullName.split("/").pop() || repoFullName;
    return {
      id: "github-repo:" + repoFullName + ":" + branch,
      filename: repoFullName + " (" + branch + ")",
      mimeType: "application/x-github-repository",
      size: 0,
      type: "document",
      gcsPath: "",
      url: "https://github.com/" + repoFullName,
      uploadedAt: new Date().toISOString(),
      workspacePath: "/workspace/GitHub/" + repoName,
      integrationSource: "github",
      githubRepoFullName: repoFullName,
      githubRef: branch,
      githubItemPath: "",
      githubSelectionType: "repo",
    };
  }

  async function proxyTaskStartThread(req, res, taskId) {
    try {
      const body = await readRequestBody(req);
      const apiKey = readOptionalApiKey(req, body);
      const upstreamUrl = parseUpstreamUrl(req, body);

      if (!apiKey && !hasAiosSession(req)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Agentic Compute Platform or provide an API key.",
        });
      }

      const fetchJsonResponse = async (upstreamResponse, fallbackMessage) => {
        const text = await upstreamResponse.text().catch(() => "");
        let parsed = {};
        try {
          parsed = text ? JSON.parse(text) : {};
        } catch {
          parsed = { message: text };
        }
        if (!upstreamResponse.ok) {
          throw new Error(parsed?.message || parsed?.error || fallbackMessage);
        }
        return parsed;
      };

      const fetchTaskApi = async (path, method, payload) => {
        if (apiKey) {
          const response = await fetch(`${upstreamUrl}${path}`, {
            method,
            headers: withProxyOrganizationHeader(req, payload, {
              "Content-Type": "application/json",
              "X-API-Key": apiKey,
            }),
            body: payload === undefined ? undefined : JSON.stringify(payload),
          });
          return fetchJsonResponse(response, `Task API request failed for ${path}.`);
        }
        const response = await fetchAiosTaskApi(req, path, {
          method,
          headers: {
            "content-type": "application/json",
          },
          body: payload === undefined ? undefined : JSON.stringify(payload),
        });
        return fetchJsonResponse(response, `Task API request failed for ${path}.`);
      };

      const fetchCloudApi = async (path, method, payload) => {
        if (apiKey) {
          const response = await fetch(`${upstreamUrl}${path}`, {
            method,
            headers: withProxyOrganizationHeader(req, payload, {
              "Content-Type": "application/json",
              "X-API-Key": apiKey,
            }),
            body: payload === undefined ? undefined : JSON.stringify(payload),
          });
          return fetchJsonResponse(response, `Cloud API request failed for ${path}.`);
        }
        const response = await fetchAiosCloud(req, path, {
          method,
          headers: {
            "content-type": "application/json",
          },
          body: payload === undefined ? undefined : JSON.stringify(payload),
        });
        return fetchJsonResponse(response, `Cloud API request failed for ${path}.`);
      };

      const taskPayload = await fetchTaskApi(`/tasks/${encodeURIComponent(taskId)}`, "GET");
      const taskRecord = extractServerTaskRecord(taskPayload);
      if (!taskRecord?.id) {
        return sendJson(res, 404, {
          error: "Task not found",
          message: "The selected task could not be loaded.",
        });
      }

      const existingLinkedThreadIds = Array.isArray(taskRecord.linkedThreadIds)
        ? taskRecord.linkedThreadIds.filter((value) => typeof value === "string" && value.trim())
        : Array.isArray(taskRecord.linked_thread_ids)
          ? taskRecord.linked_thread_ids.filter((value) => typeof value === "string" && value.trim())
          : [];
      const taskPreview = body?.taskPreview && typeof body.taskPreview === "object" ? body.taskPreview : null;
      const requestedRunKind = String(body?.runKind || body?.taskRunKind || taskPreview?.runKind || "").trim().toLowerCase();
      const runKind = requestedRunKind === "review" ? "review" : "implementation";
      const isReviewRun = runKind === "review";
      const currentStatus = typeof taskRecord.status === "string" ? taskRecord.status.trim() : "";

      const taskMetadata = getServerBacklogTaskRunnerMetadata(taskRecord) || {};
      const environmentId = String(body?.environmentId || taskRecord.environmentId || taskMetadata.environmentId || "").trim();
      const reviewRequired = getServerBacklogTaskReviewRequired(taskRecord);
      const reviewerAgentId = getServerBacklogTaskReviewerAgentId(taskRecord);
      const requestedAgentId = String(body?.agentId || (isReviewRun ? reviewerAgentId : "") || taskRecord.assigneeAgentId || taskMetadata.assigneeActorId || "").trim();
      const agentId = isPlaygroundHumanAssigneeId(requestedAgentId) ? "" : requestedAgentId;
      const threadTitle = String(body?.title || (taskPreview?.ticketNumber ? `${taskPreview.ticketNumber} ${taskPreview.title || taskRecord.title || "Task"}` : taskRecord.title || "Task")).trim();
      const requestedGithubRepo = body?.githubRepo && typeof body.githubRepo === "object" && !Array.isArray(body.githubRepo)
        ? body.githubRepo
        : null;
      const requestedConnectors = body?.connectors && typeof body.connectors === "object" && !Array.isArray(body.connectors)
        ? body.connectors
        : null;
      const requestedAttachments = Array.isArray(body?.attachments) ? body.attachments : [];
      const githubRepoAttachment = buildServerGithubRepoSelectionAttachment(requestedGithubRepo);
      const threadAttachments = githubRepoAttachment
        ? requestedAttachments.concat(githubRepoAttachment)
        : requestedAttachments;
      if (isPlaygroundHumanAssigneeId(requestedAgentId)) {
        return sendJson(res, 400, {
          error: "Human task cannot start thread",
          message: "Tasks assigned to Me do not start agent threads.",
        });
      }

      const createdThreadPayload = await fetchCloudApi("/threads", "POST", {
        title: threadTitle,
        appId: typeof body?.appId === "string" && body.appId.trim() ? body.appId.trim() : "runner-web-sdk-demo",
        ...(environmentId ? { environmentId } : {}),
        ...(agentId ? { agentId } : {}),
        ...(threadAttachments.length ? { attachments: threadAttachments } : {}),
      });
      const createdThreadRecord = extractServerThreadRecord(createdThreadPayload);
      if (!createdThreadRecord?.id) {
        throw new Error("Thread creation succeeded but no thread id was returned.");
      }

      const currentThreadMetadata = createdThreadRecord?.metadata && typeof createdThreadRecord.metadata === "object" && !Array.isArray(createdThreadRecord.metadata)
        ? createdThreadRecord.metadata
        : {};
      const currentRunnerPlayground = currentThreadMetadata?.runnerPlayground && typeof currentThreadMetadata.runnerPlayground === "object" && !Array.isArray(currentThreadMetadata.runnerPlayground)
        ? currentThreadMetadata.runnerPlayground
        : {};
      const patchedThreadPayload = await fetchCloudApi(`/threads/${encodeURIComponent(createdThreadRecord.id)}`, "PATCH", {
        metadata: {
          ...currentThreadMetadata,
          runnerPlayground: {
            ...currentRunnerPlayground,
            ...(requestedGithubRepo ? { githubRepo: requestedGithubRepo } : {}),
            ...(requestedConnectors ? { connectors: requestedConnectors } : {}),
            taskPreview: taskPreview ? {
              ...taskPreview,
              threadId: createdThreadRecord.id,
              runKind,
            } : undefined,
          },
        },
      });
      const patchedThreadRecord = extractServerThreadRecord(patchedThreadPayload) || createdThreadRecord;

      const nextLinkedThreadIds = Array.from(new Set(existingLinkedThreadIds.concat(createdThreadRecord.id)));
      const shouldReopenCompletedTask = taskPreview?.reviewRequest === true;
      const nextTaskStatus = currentStatus === "done" && !shouldReopenCompletedTask
        ? "done"
        : isReviewRun
          ? "in_review"
          : "in_progress";
      const nextTaskPayload = await fetchTaskApi(`/tasks/${encodeURIComponent(taskId)}`, "PATCH", {
        projectId: taskRecord.projectId,
        ticketNumber: taskRecord.ticketNumber,
        type: taskRecord.taskType || taskRecord.type || "task",
        parentTaskId: taskRecord.parentTaskId || null,
        title: taskRecord.title,
        description: taskRecord.description,
        linkedThreadIds: nextLinkedThreadIds,
        lastStartedThreadId: createdThreadRecord.id,
        priority: taskRecord.priority,
        sprintId: taskRecord.sprintId || null,
        assigneeAgentId: taskRecord.assigneeAgentId || null,
        reviewRequired,
        reviewerAgentId: reviewerAgentId || null,
        environmentId: taskRecord.environmentId || null,
        dependencyIds: Array.isArray(taskRecord.dependencyIds) ? taskRecord.dependencyIds : [],
        scheduledStartAt: taskRecord.scheduledStartAt || null,
        scheduledEndAt: taskRecord.scheduledEndAt || null,
        dueAt: taskRecord.dueAt || null,
        sortOrder: Number.isFinite(taskRecord.sortOrder) ? taskRecord.sortOrder : Date.now(),
        metadata: taskRecord.metadata && typeof taskRecord.metadata === "object" ? taskRecord.metadata : undefined,
        status: nextTaskStatus,
        completedAt: currentStatus === "done" ? taskRecord.completedAt || null : null,
      });
      const updatedTaskRecord = extractServerTaskRecord(nextTaskPayload);
      if (!updatedTaskRecord?.id) {
        throw new Error("Task thread was started, but the task update response was invalid.");
      }

      const responseThreadRecord = {
        ...patchedThreadRecord,
        status: "running",
        updatedAt: new Date().toISOString(),
      };

      return sendJson(res, 200, {
        thread: responseThreadRecord,
        task: updatedTaskRecord,
        executionStarted: false,
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to start task thread",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function proxyTaskBacklogCreateThread(req, res, projectId, releaseId = "") {
    try {
      const body = await readRequestBody(req);
      const apiKey = readOptionalApiKey(req, body);

      if (!apiKey && !hasAiosSession(req)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in to Agentic Compute Platform or provide an API key.",
        });
      }

      const threadId = buildPlaygroundTaskBacklogThreadId({
        projectId,
        environmentId: typeof body?.environmentId === "string" ? body.environmentId.trim() : "",
        agentId: typeof body?.agentId === "string" ? body.agentId.trim() : "",
        createdAt: Date.now(),
      });

      return sendJson(res, 200, {
        thread: {
          id: threadId,
          title: typeof body?.title === "string" ? body.title : "",
          metadata: {
            runnerPlayground: {
              type: "backlog_task_capture",
              projectId,
              releaseId: releaseId || null,
            },
          },
        },
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to initialize backlog task capture",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function proxyTaskBacklogCreateTaskMessage(req, res, projectId, threadId, releaseId = "") {
    try {
      const body = await readRequestBody(req);
      const apiKey = readOptionalApiKey(req, body);
      const upstreamUrl = parseUpstreamUrl(req, body);
      const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);

      if (!apiKey && !hasAiosSession(req)) {
        return sendJson(res, 401, {
          error: "Unauthorized",
          message: "Sign in with Computer Agents or provide an API key.",
        });
      }

      const threadState = decodePlaygroundTaskBacklogThreadState(threadId);
      if (!threadState || threadState.projectId !== projectId) {
        return sendJson(res, 400, {
          error: "Invalid backlog capture thread",
          message: "The backlog composer thread state is missing or invalid.",
        });
      }

      const requestedReleaseId = typeof releaseId === "string" ? releaseId.trim() : "";

      const title = String(body?.content || body?.task || "").trim().replace(/\s+/g, " ");
      if (!title) {
        return sendJson(res, 400, {
          error: "content or task is required",
        });
      }

      const backlogTaskCommand = body?.backlogTaskCommand && typeof body.backlogTaskCommand === "object"
        ? body.backlogTaskCommand
        : null;
      const requestedConnectors = body?.connectors && typeof body.connectors === "object" && !Array.isArray(body.connectors)
        ? body.connectors
        : null;
      const requestedParentTicketNumber = backlogTaskCommand?.action === "subtask"
        ? normalizeServerBacklogTicketNumber(backlogTaskCommand.parentTicketNumber)
        : "";
      const parentTaskRecord = requestedParentTicketNumber
        ? await resolveProjectTaskByTicketNumber(req, {
            apiKey,
            upstreamUrl,
            projectId,
            ticketNumber: requestedParentTicketNumber,
          })
        : null;

      if (requestedParentTicketNumber && !parentTaskRecord?.id) {
        return sendJson(res, 400, {
          error: "Invalid subtask parent",
          message: `Task ${requestedParentTicketNumber} could not be found in this project.`,
        });
      }

      const runnerPlaygroundMetadata = {
        source: "backlog_task_input",
        projectId,
        taskType: parentTaskRecord?.id ? "subtask" : "task",
        parentTaskId: parentTaskRecord?.id || null,
        parentTicketNumber: parentTaskRecord?.id ? requestedParentTicketNumber : null,
        environmentId: threadState.environmentId || null,
        agentId: threadState.agentId || null,
        ...(isPlaygroundHumanAssigneeId(threadState.agentId) ? {
          assigneeActorId: threadState.agentId,
          assigneeActorKind: "human",
        } : {}),
        quotedSelection: body?.quotedSelection && typeof body.quotedSelection === "object"
          ? body.quotedSelection
          : null,
        releaseId: requestedReleaseId || null,
        attachments: Array.isArray(body?.attachments) ? body.attachments : [],
        connectors: requestedConnectors,
        enabledSkills: (() => {
          const next = [];
          const seen = new Set();
          const ignoredConfigKeys = new Set([
            "imageGenerationModel",
            "imageGenerationQuality",
            "imageGenerationComputeTokensPerImage",
            "imageGenerationConfig",
            "videoGenerationModel",
            "videoGenerationConfig",
            "deepResearchModel",
            "deepResearchConfig",
          ]);
          const skillAliases = {
            imageGeneration: "image_generation",
            image_generation: "image_generation",
            videoGeneration: "video_generation",
            video_generation: "video_generation",
            "video-generation": "video_generation",
            webSearch: "web_search",
            web_search: "web_search",
            frontendDesign: "frontend_design",
            frontend_design: "frontend_design",
            hallmark: "frontend_design",
            hallmarkFrontendDesign: "frontend_design",
            hallmark_frontend_design: "frontend_design",
            "hallmark-frontend-design": "frontend_design",
            deepResearch: "deep_research",
            deep_research: "deep_research",
            research: "deep_research",
            pdf: "pdf",
            pptx: "pptx",
            memory: "memory",
            taskManagement: "task_management",
            task_management: "task_management",
            appPlatform: "app_platform",
            app_platform: "app_platform",
            computerAgents: "computer_agents",
            computer_agents: "computer_agents",
          };

          const appendSkillId = (value) => {
            const rawValue = String(value || "").trim();
            if (!rawValue) return;
            const normalized = skillAliases[rawValue] || rawValue;
            if (!normalized || normalized === "customSkills" || ignoredConfigKeys.has(normalized) || seen.has(normalized)) {
              return;
            }
            seen.add(normalized);
            next.push(normalized);
          };

          if (body?.enabledSkills && typeof body.enabledSkills === "object") {
            Object.entries(body.enabledSkills).forEach(([key, value]) => {
              if (key === "customSkills") {
                (Array.isArray(value) ? value : []).forEach((skillId) => appendSkillId(skillId));
                return;
              }
              if (value) {
                appendSkillId(key);
              }
            });
          }

          return next;
        })(),
        capturedAt: new Date().toISOString(),
      };

      const upstreamPayload = {
        projectId,
        ...(requestedReleaseId ? { releaseId: requestedReleaseId } : {}),
        title,
        status: "todo",
        priority: "medium",
        sortOrder: Date.now(),
        type: parentTaskRecord?.id ? "subtask" : "task",
        ...(parentTaskRecord?.id ? { parentTaskId: parentTaskRecord.id } : {}),
        ...(!isPlaygroundHumanAssigneeId(threadState.agentId) && threadState.agentId ? { assigneeAgentId: threadState.agentId } : {}),
        ...(threadState.environmentId ? { environmentId: threadState.environmentId } : {}),
        metadata: {
          runnerPlayground: runnerPlaygroundMetadata,
        },
      };

      let upstream;

      if (apiKey) {
        const upstreamTarget = new URL(`${upstreamUrl}/tasks`);
        upstreamTarget.search = requestUrl.search;
        upstream = await fetch(upstreamTarget.toString(), {
          method: "POST",
          headers: withProxyOrganizationHeader(req, body, {
            "Content-Type": "application/json",
            "X-API-Key": apiKey,
          }),
          body: JSON.stringify(upstreamPayload),
        });
      } else {
        upstream = await fetchAiosTaskApi(req, "/tasks", {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(upstreamPayload),
        });
      }

      const text = await upstream.text().catch(() => "");
      let parsed = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { message: text };
      }

      if (!upstream.ok) {
        return sendJson(res, upstream.status, parsed);
      }

      const createdTaskRecord = extractServerTaskRecord(parsed);
      if (createdTaskRecord?.id) {
        backlogComposerResultsByThreadId.set(threadId, {
          task: createdTaskRecord,
          createdAt: Date.now(),
        });
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });
      res.write(`data: ${JSON.stringify({ type: "stream.completed" })}\n\n`);
      res.end();
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to create backlog task from task input",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function proxyTaskBacklogResult(req, res, projectId, threadId) {
    try {
      const threadState = decodePlaygroundTaskBacklogThreadState(threadId);
      if (!threadState || threadState.projectId !== projectId) {
        return sendJson(res, 400, {
          error: "Invalid backlog capture thread",
          message: "The backlog composer thread state is missing or invalid.",
        });
      }

      const storedResult = backlogComposerResultsByThreadId.get(threadId);
      if (!storedResult?.task?.id) {
        return sendJson(res, 404, {
          error: "Backlog result unavailable",
          message: "No created task result is available for this backlog composer thread.",
        });
      }

      return sendJson(res, 200, {
        task: storedResult.task,
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to load backlog result",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  async function proxyTaskBacklogGenerateTitle(req, res, projectId, threadId) {
    try {
      const threadState = decodePlaygroundTaskBacklogThreadState(threadId);
      if (!threadState || threadState.projectId !== projectId) {
        return sendJson(res, 400, {
          error: "Invalid backlog capture thread",
          message: "The backlog composer thread state is missing or invalid.",
        });
      }

      const body = await readRequestBody(req);
      const rawMessage = String(body?.message || body?.content || "").replace(/\s+/g, " ").trim();
      const nextTitle = rawMessage
        ? rawMessage.slice(0, 120).trim()
        : "New Task";

      return sendJson(res, 200, {
        title: nextTitle,
        thread: {
          id: threadId,
          title: nextTitle,
        },
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to generate backlog thread title",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  function sendTaskBacklogContextResponse(res, threadId) {
    return sendJson(res, 200, {
      context: {
        threadId,
        sessionId: null,
        model: "Backlog capture",
        maxTokens: 0,
        usedTokens: 0,
        remainingTokens: 0,
        remainingRatio: 0,
        source: "playground-backlog",
        exact: false,
      },
    });
  }

  function sendTaskBacklogContextDetailsResponse(res, threadId) {
    return sendJson(res, 200, {
      context: {
        threadId,
        sessionId: null,
        model: "Backlog capture",
        maxTokens: 0,
        usedTokens: 0,
        remainingTokens: 0,
        remainingRatio: 0,
        source: "playground-backlog",
        exact: false,
        categories: [],
        estimate: null,
      },
      availableActions: {
        compact: false,
        clear: false,
        btw: false,
        fork: false,
      },
      nativeError: "Thread context is unavailable for backlog task capture.",
    });
  }

  function handleRequest(req, res, url) {
    const taskBacklogCreateThreadMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/threads$/);
    if (req.method === "POST" && taskBacklogCreateThreadMatch) {
      void proxyTaskBacklogCreateThread(
        req,
        res,
        decodeURIComponent(taskBacklogCreateThreadMatch[1]),
        taskBacklogCreateThreadMatch[2] ? decodeURIComponent(taskBacklogCreateThreadMatch[2]) : "",
      );
      return true;
    }

    const taskBacklogThreadMessagesMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/threads\/([^/]+)\/messages$/);
    if (req.method === "POST" && taskBacklogThreadMessagesMatch) {
      void proxyTaskBacklogCreateTaskMessage(
        req,
        res,
        decodeURIComponent(taskBacklogThreadMessagesMatch[1]),
        decodeURIComponent(taskBacklogThreadMessagesMatch[3]),
        taskBacklogThreadMessagesMatch[2] ? decodeURIComponent(taskBacklogThreadMessagesMatch[2]) : "",
      );
      return true;
    }

    const taskBacklogThreadResultMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/threads\/([^/]+)\/result$/);
    if (req.method === "GET" && taskBacklogThreadResultMatch) {
      void proxyTaskBacklogResult(
        req,
        res,
        decodeURIComponent(taskBacklogThreadResultMatch[1]),
        decodeURIComponent(taskBacklogThreadResultMatch[3]),
      );
      return true;
    }

    const taskBacklogThreadGenerateTitleMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/threads\/([^/]+)\/generate-title$/);
    if (req.method === "POST" && taskBacklogThreadGenerateTitleMatch) {
      void proxyTaskBacklogGenerateTitle(
        req,
        res,
        decodeURIComponent(taskBacklogThreadGenerateTitleMatch[1]),
        decodeURIComponent(taskBacklogThreadGenerateTitleMatch[3]),
      );
      return true;
    }

    const taskBacklogThreadContextDetailsMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/threads\/([^/]+)\/context\/details$/);
    if (req.method === "GET" && taskBacklogThreadContextDetailsMatch) {
      sendTaskBacklogContextDetailsResponse(res, decodeURIComponent(taskBacklogThreadContextDetailsMatch[3]));
      return true;
    }

    const taskBacklogThreadContextMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/threads\/([^/]+)\/context$/);
    if (req.method === "GET" && taskBacklogThreadContextMatch) {
      sendTaskBacklogContextResponse(res, decodeURIComponent(taskBacklogThreadContextMatch[3]));
      return true;
    }

    const taskBacklogEnvironmentFilesUploadMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/environments\/([^/]+)\/files\/upload$/);
    if (req.method === "POST" && taskBacklogEnvironmentFilesUploadMatch) {
      void proxyUpstreamRawRequest(
        req,
        res,
        `/environments/${encodeURIComponent(decodeURIComponent(taskBacklogEnvironmentFilesUploadMatch[3]))}/files/upload`,
        "POST",
      );
      return true;
    }

    const taskBacklogEnvironmentDownloadMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/environments\/([^/]+)\/files\/download\/(.+)$/);
    if (req.method === "GET" && taskBacklogEnvironmentDownloadMatch) {
      const environmentId = encodeURIComponent(decodeURIComponent(taskBacklogEnvironmentDownloadMatch[3]));
      const filePath = taskBacklogEnvironmentDownloadMatch[4]
        .split("/")
        .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
        .join("/");
      void proxyUpstreamBinaryGet(req, res, `/environments/${environmentId}/files/download/${filePath}`, {
        contentType: inferProxyContentTypeFromPath(filePath),
      });
      return true;
    }

    const taskBacklogAttachmentMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?\/attachments\/([^/]+)$/);
    if (req.method === "GET" && taskBacklogAttachmentMatch) {
      void proxyUpstreamBinaryGet(req, res, `/attachments/${encodeURIComponent(decodeURIComponent(taskBacklogAttachmentMatch[3]))}`);
      return true;
    }

    const taskBacklogProxyMatch = url.pathname.match(/^\/api\/task-backlog\/([^/]+)(?:\/releases\/([^/]+))?(\/.+)$/);
    if (taskBacklogProxyMatch) {
      const upstreamPath = taskBacklogProxyMatch[3];

      if (upstreamPath.startsWith("/threads/")) {
        sendJson(res, 404, {
          error: "Unsupported backlog thread route",
          message: "This task composer uses ephemeral threads only for local task capture.",
        });
        return true;
      }

      if (req.method === "GET") {
        void proxyUpstreamGet(req, res, upstreamPath);
        return true;
      }

      if (req.method === "POST" || req.method === "PATCH" || req.method === "PUT" || req.method === "DELETE") {
        void proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
        return true;
      }
    }
    return false;
  }

  return Object.freeze({
    handleRequest,
    proxyTaskStartThread,
  });
}
