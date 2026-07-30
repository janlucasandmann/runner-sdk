import os from "node:os";

import {
  createExecutionWorkerAssertionSigner,
} from "./worker-assertion.mjs";
import {
  buildProjectDeliveryTaskPrompt,
  normalizeProjectDeliveryTaskEvidence,
} from "./project-delivery-task.mjs";

const WORKER_ASSERTION_SCHEME = "ComputerAgentsWorker";
const SUPPORTED_KINDS = new Set([
  "evaluation_run",
  "agent_optimization",
  "test_run",
  "project_delivery_task",
  "project_automation",
  "thread_resume",
  "security_run",
  "security_remediation",
]);

class ExecutionDispatchHttpError extends Error {
  constructor(message, { status = 0, code = "" } = {}) {
    super(message);
    this.name = "ExecutionDispatchHttpError";
    this.status = status;
    this.code = code;
  }
}

function classifyFailure(error) {
  const status = Number(error?.status || 0);
  if (
    [408, 409, 425, 429].includes(status)
    || status >= 500
  ) {
    return "transient";
  }
  if (status >= 400 && status < 500) return "permanent";
  const code = String(error?.code || "").trim().toUpperCase();
  if ([
    "EAI_AGAIN",
    "ECONNABORTED",
    "ECONNREFUSED",
    "ECONNRESET",
    "ENETDOWN",
    "ENETUNREACH",
    "EPIPE",
    "ETIMEDOUT",
    "UND_ERR_CONNECT_TIMEOUT",
    "UND_ERR_HEADERS_TIMEOUT",
    "UND_ERR_SOCKET",
  ].includes(code)) {
    return "transient";
  }
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("fetch failed")
    || message.includes("temporarily unavailable")
    || message.includes("timed out")
    || message.includes("timeout")
  ) ? "transient" : "permanent";
}

function safeError(error) {
  return {
    status: Number(error?.status || 0),
    code: String(error?.code || "").slice(0, 100),
    message: String(
      error instanceof Error ? error.message : error,
    ).slice(0, 2_000),
  };
}

function normalizeOrigin(value) {
  return String(value || "").replace(/\/+$/, "");
}

function createSyntheticRequest({
  apiKey,
  organizationId,
  upstreamOrigin,
  platformLocalOrigin,
}) {
  const platformUrl = new URL(platformLocalOrigin);
  return {
    method: "POST",
    url: "/internal/execution-dispatch",
    headers: {
      host: platformUrl.host,
      "x-forwarded-proto": platformUrl.protocol.slice(0, -1),
      "x-api-key": apiKey,
      "x-runner-upstream-url": upstreamOrigin,
      ...(organizationId ? {
        "x-computer-agents-organization": organizationId,
      } : {}),
    },
  };
}

export function createExecutionDispatcher({
  enabled = true,
  controlOrigin,
  upstreamOrigin,
  platformLocalOrigin,
  secret,
  issuer,
  audience,
  workerId = `platform:${os.hostname()}:${process.pid}`,
  evaluationsService,
  fineTuningService,
  testsService,
  fetchImpl = fetch,
  logger = console,
  pollIntervalMs = 2_000,
  maximumIdlePollIntervalMs = 8_000,
  maximumPollBackoffMs = 60_000,
  random = Math.random,
  heartbeatIntervalMs = 25_000,
  leaseTtlMs = 120_000,
  projectDeliveryReplayPollMs = 5_000,
  projectDeliveryReplayTimeoutMs = 60 * 60_000,
  batchSize = 4,
  maxConcurrency = 4,
}) {
  if (!enabled) {
    return Object.freeze({
      enabled: false,
      activeCount: () => 0,
      pollNow: async () => 0,
      start() {},
      async stop() {},
    });
  }
  const normalizedControlOrigin = normalizeOrigin(controlOrigin);
  const normalizedUpstreamOrigin = normalizeOrigin(upstreamOrigin);
  const normalizedPlatformOrigin = normalizeOrigin(platformLocalOrigin);
  if (!normalizedControlOrigin || !normalizedUpstreamOrigin || !normalizedPlatformOrigin) {
    throw new Error(
      "Execution dispatcher controlOrigin, upstreamOrigin, and platformLocalOrigin are required.",
    );
  }
  if (typeof evaluationsService?.runs?.wake !== "function") {
    throw new Error("Execution dispatcher requires evaluationsService.runs.wake.");
  }
  if (typeof fineTuningService?.jobs?.wake !== "function") {
    throw new Error("Execution dispatcher requires fineTuningService.jobs.wake.");
  }
  if (typeof testsService?.runs?.wake !== "function") {
    throw new Error("Execution dispatcher requires testsService.runs.wake.");
  }
  const assertionSigner = createExecutionWorkerAssertionSigner({
    secret,
    issuer,
    audience,
    workerId,
  });
  const active = new Set();
  let stopped = true;
  let pollTimer = null;
  let pollInFlight = null;
  let consecutivePollFailures = 0;
  let consecutiveEmptyPolls = 0;

  async function requestControl(path, body) {
    const assertion = await assertionSigner.sign();
    const response = await fetchImpl(
      `${normalizedControlOrigin}/internal/execution-dispatch${path}`,
      {
        method: "POST",
        headers: {
          authorization: `${WORKER_ASSERTION_SCHEME} ${assertion}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(body || {}),
      },
    );
    const text = await response.text().catch(() => "");
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
    if (!response.ok) {
      throw new ExecutionDispatchHttpError(
        String(payload?.message || payload?.error || "Execution dispatch request failed."),
        {
          status: response.status,
          code: String(payload?.code || ""),
        },
      );
    }
    return payload;
  }

  async function settleClaim(claim, outcome, error = null) {
    const details = error ? safeError(error) : {};
    return await requestControl(
      `/claims/${encodeURIComponent(claim.dispatch.id)}/complete`,
      {
        token: claim.lease.token,
        outcome,
        ...(error ? {
          error: details.message,
          status: details.status,
          code: details.code,
          classification: classifyFailure(error),
        } : {}),
      },
    );
  }

  async function requestWorkload(claim, path, {
    method = "GET",
    body,
  } = {}) {
    const response = await fetchImpl(
      `${normalizedUpstreamOrigin}${path}`,
      {
        method,
        headers: {
          "x-api-key": claim.credential.key,
          ...(claim.dispatch.organizationId ? {
            "x-computer-agents-organization": claim.dispatch.organizationId,
          } : {}),
          ...(body === undefined ? {} : {
            "content-type": "application/json",
          }),
        },
        ...(body === undefined ? {} : {
          body: JSON.stringify(body),
        }),
      },
    );
    const text = await response.text().catch(() => "");
    let payload = {};
    try {
      payload = text ? JSON.parse(text) : {};
    } catch {
      payload = {};
    }
    if (!response.ok) {
      throw new ExecutionDispatchHttpError(
        String(payload?.message || payload?.error || "Execution workload request failed."),
        {
          status: response.status,
          code: String(payload?.code || ""),
        },
      );
    }
    return payload;
  }

  async function executeProjectDeliveryTask(claim) {
    const metadata = claim.dispatch.metadata
      && typeof claim.dispatch.metadata === "object"
      && !Array.isArray(claim.dispatch.metadata)
      ? claim.dispatch.metadata
      : {};
    const resourceId = String(claim.dispatch.resourceId || "");
    const deliveryStageRetryCount = Math.max(
      0,
      Number(metadata.deliveryStageRetryCount) || 0,
    );
    const prompt = buildProjectDeliveryTaskPrompt(metadata);
    const idempotencyKey =
      `project-delivery:${claim.dispatch.id}:stage-retry:${deliveryStageRetryCount}`;
    const runPath = `/tasks/${encodeURIComponent(resourceId)}/run-thread`;
    const runBody = {
      idempotencyKey,
      agentId: metadata.executionAgentId || undefined,
      environmentId: metadata.environmentId || undefined,
      executionMode: "blocking",
      moveToInProgress: true,
      message: prompt,
      metadata: {
        agentVersionId: metadata.executionAgentVersionId || undefined,
        triggerKind: "automation",
        source: "mission_control_delivery",
        missionControlDeliveryExecutionId:
          metadata.deliveryExecutionId || null,
        missionControlDeliveryStageId:
          metadata.deliveryStageId || null,
      },
    };
    const replayDeadline = Date.now() + Math.max(
      60_000,
      Number(projectDeliveryReplayTimeoutMs) || 60 * 60_000,
    );
    let replayAttempt = 0;
    let executionPayload;
    while (!executionPayload) {
      try {
        executionPayload = await requestWorkload(
          claim,
          runPath,
          {
            method: "POST",
            body: runBody,
          },
        );
      } catch (error) {
        const status = Number(error?.status || 0);
        const recoverable = status === 409
          || classifyFailure(error) === "transient";
        if (!recoverable || Date.now() >= replayDeadline) {
          if (recoverable && Date.now() >= replayDeadline) {
            throw new ExecutionDispatchHttpError(
              "Project delivery task did not finish before its replay deadline.",
              {
                status: 504,
                code: "PROJECT_DELIVERY_TASK_TIMEOUT",
              },
            );
          }
          throw error;
        }
        replayAttempt += 1;
        logger.warn?.(
          "[execution-dispatch] Project delivery task request will be recovered by idempotent replay",
          {
            dispatchId: claim.dispatch.id,
            resourceId,
            replayAttempt,
            ...safeError(error),
          },
        );
        await new Promise((resolve) => setTimeout(
          resolve,
          Math.max(10, Number(projectDeliveryReplayPollMs) || 5_000),
        ));
      }
    }
    const responseText = String(
      executionPayload?.execution?.response
      || executionPayload?.execution?.assistantResponse
      || "",
    );
    let evidence;
    try {
      evidence = normalizeProjectDeliveryTaskEvidence(
        responseText,
        metadata,
      );
    } catch (error) {
      const validationError = new ExecutionDispatchHttpError(
        error instanceof Error ? error.message : String(error),
        {
          status: 422,
          code: "PROJECT_DELIVERY_TASK_EVIDENCE_INVALID",
        },
      );
      throw validationError;
    }
    const task = executionPayload?.task
      && typeof executionPayload.task === "object"
      && !Array.isArray(executionPayload.task)
      ? executionPayload.task
      : {};
    const taskMetadata = task.metadata
      && typeof task.metadata === "object"
      && !Array.isArray(task.metadata)
      ? task.metadata
      : {};
    const updated = await requestWorkload(
      claim,
      `/tasks/${encodeURIComponent(resourceId)}`,
      {
        method: "PATCH",
        body: {
          status: "done",
          metadata: {
            ...taskMetadata,
            deliveryExecutionId: metadata.deliveryExecutionId || null,
            deliveryStageId: metadata.deliveryStageId || null,
            deliveryEvidence: evidence,
          },
        },
      },
    );
    if (String(updated?.task?.status || "").toLowerCase() !== "done") {
      throw new ExecutionDispatchHttpError(
        "Project delivery task did not reach done after evidence validation.",
        {
          status: 409,
          code: "PROJECT_DELIVERY_TASK_NOT_COMPLETED",
        },
      );
    }
    return updated.task;
  }

  async function executeProjectAutomation(claim) {
    const projectId = String(claim.dispatch.parentResourceId || "");
    const runId = String(claim.dispatch.resourceId || "");
    if (!projectId || !runId) {
      throw new ExecutionDispatchHttpError(
        "Project automation dispatch is missing its project or run identity.",
        {
          status: 422,
          code: "PROJECT_AUTOMATION_DISPATCH_IDENTITY_MISSING",
        },
      );
    }
    const runPath = `/projects/${encodeURIComponent(projectId)}/automation-runs/${encodeURIComponent(runId)}`;
    for (let iteration = 0; iteration < 1_000; iteration += 1) {
      const next = await requestWorkload(claim, `${runPath}/next`, {
        method: "POST",
        body: {},
      });
      const run = next?.run
        && typeof next.run === "object"
        && !Array.isArray(next.run)
        ? next.run
        : {};
      const step = next?.step
        && typeof next.step === "object"
        && !Array.isArray(next.step)
        ? next.step
        : null;
      const task = next?.task
        && typeof next.task === "object"
        && !Array.isArray(next.task)
        ? next.task
        : null;
      if (!step || !task) {
        if (["paused", "completed", "failed", "cancelled"].includes(
          String(run.status || "").trim().toLowerCase(),
        )) {
          return run;
        }
        throw new ExecutionDispatchHttpError(
          "Project automation returned no task while the run remained active.",
          {
            status: 409,
            code: "PROJECT_AUTOMATION_NEXT_TASK_MISSING",
          },
        );
      }
      const stepId = String(step.id || "");
      const taskId = String(task.id || "");
      const idempotencyKey = String(task.idempotencyKey || "");
      if (!stepId || !taskId || !idempotencyKey) {
        throw new ExecutionDispatchHttpError(
          "Project automation returned an incomplete task step.",
          {
            status: 422,
            code: "PROJECT_AUTOMATION_STEP_INVALID",
          },
        );
      }
      await requestWorkload(
        claim,
        `/tasks/${encodeURIComponent(taskId)}/run-thread`,
        {
          method: "POST",
          body: {
            executionMode: "blocking",
            idempotencyKey,
            agentId: task.assigneeAgentId || undefined,
            moveToInProgress: true,
            metadata: {
              triggerKind: "automation",
              source: "project_full_auto",
              projectAutomationRunId: runId,
              projectAutomationStepId: stepId,
            },
          },
        },
      );
      const completed = await requestWorkload(
        claim,
        `${runPath}/steps/${encodeURIComponent(stepId)}/complete`,
        {
          method: "POST",
          body: {},
        },
      );
      const completedRun = completed?.automationRun
        && typeof completed.automationRun === "object"
        && !Array.isArray(completed.automationRun)
        ? completed.automationRun
        : {};
      if (["paused", "completed", "failed", "cancelled"].includes(
        String(completedRun.status || "").trim().toLowerCase(),
      )) {
        return completedRun;
      }
    }
    throw new ExecutionDispatchHttpError(
      "Project automation exceeded its bounded task iteration limit.",
      {
        status: 422,
        code: "PROJECT_AUTOMATION_TASK_LIMIT_EXCEEDED",
      },
    );
  }

  async function failActiveProjectAutomation(claim, error) {
    const projectId = String(claim.dispatch.parentResourceId || "");
    const runId = String(claim.dispatch.resourceId || "");
    if (!projectId || !runId) return false;
    const runPath = `/projects/${encodeURIComponent(projectId)}/automation-runs/${encodeURIComponent(runId)}`;
    const next = await requestWorkload(claim, `${runPath}/next`, {
      method: "POST",
      body: {},
    });
    const stepId = String(next?.step?.id || "");
    if (!stepId) return false;
    const details = safeError(error);
    await requestWorkload(
      claim,
      `${runPath}/steps/${encodeURIComponent(stepId)}/fail`,
      {
        method: "POST",
        body: {
          code: details.code || "PROJECT_AUTOMATION_WORKER_FAILED",
          message: details.message,
        },
      },
    );
    return true;
  }

  async function executeThreadResume(claim) {
    const threadId = String(claim.dispatch.parentResourceId || "");
    const runId = String(claim.dispatch.resourceId || "");
    if (!threadId || !runId) {
      throw new ExecutionDispatchHttpError(
        "Thread resume dispatch is missing its thread or run identity.",
        {
          status: 422,
          code: "THREAD_RESUME_DISPATCH_IDENTITY_MISSING",
        },
      );
    }
    return await requestWorkload(
      claim,
      `/threads/${encodeURIComponent(threadId)}/runs/${encodeURIComponent(runId)}/resume-dispatch`,
      {
        method: "POST",
        body: {
          dispatchId: claim.dispatch.id,
        },
      },
    );
  }

  async function executeSecurityRun(claim) {
    const runId = String(claim.dispatch.resourceId || "");
    if (!runId) {
      throw new ExecutionDispatchHttpError(
        "Security run dispatch is missing its run identity.",
        {
          status: 422,
          code: "SECURITY_RUN_DISPATCH_IDENTITY_MISSING",
        },
      );
    }
    return await requestWorkload(
      claim,
      `/security/runs/${encodeURIComponent(runId)}/execute`,
      {
        method: "POST",
        body: {
          dispatchId: claim.dispatch.id,
        },
      },
    );
  }

  function normalizeWorkloadRecords(payload, preferredKeys = []) {
    for (const key of preferredKeys) {
      if (Array.isArray(payload?.[key])) return payload[key];
    }
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload;
    return [];
  }

  function collectWorkloadStrings(value, strings = []) {
    if (typeof value === "string") {
      if (value.trim()) strings.push(value);
      return strings;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => collectWorkloadStrings(entry, strings));
      return strings;
    }
    if (value && typeof value === "object") {
      Object.values(value).forEach((entry) => {
        collectWorkloadStrings(entry, strings);
      });
    }
    return strings;
  }

  function extractSecurityRemediationOutput(payloads) {
    return collectWorkloadStrings(payloads)
      .filter((value) => (
        /```security_remediation_json\s*[\s\S]*?```/i.test(value)
      ))
      .at(-1) || "";
  }

  function extractThreadRecord(payload) {
    const record = payload?.thread || payload?.data || payload;
    return record && typeof record === "object" && !Array.isArray(record)
      ? record
      : {};
  }

  async function inspectSecurityRemediationThread(
    claim,
    threadId,
    remediationId,
  ) {
    const encodedThreadId = encodeURIComponent(threadId);
    const [threadPayload, messagesPayload] = await Promise.all([
      requestWorkload(claim, `/threads/${encodedThreadId}`),
      requestWorkload(
        claim,
        `/threads/${encodedThreadId}/messages?limit=160&compact=1`,
      ),
    ]);
    const thread = extractThreadRecord(threadPayload);
    const messages = normalizeWorkloadRecords(
      messagesPayload,
      ["messages"],
    );
    return {
      status: String(
        thread.status
        || thread.runStatus
        || thread.run_status
        || "",
      ).trim().toLowerCase(),
      promptPersisted: JSON.stringify(messages).includes(remediationId),
      output: extractSecurityRemediationOutput([thread, messages]),
    };
  }

  async function waitForSecurityRemediationThread(
    claim,
    threadId,
    remediationId,
    {
      maxAttempts = 360,
      pollMs = 5_000,
    } = {},
  ) {
    const terminalStatuses = new Set([
      "completed",
      "failed",
      "cancelled",
      "canceled",
      "error",
    ]);
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const inspection = await inspectSecurityRemediationThread(
        claim,
        threadId,
        remediationId,
      );
      if (inspection.output) return inspection.output;
      if (terminalStatuses.has(inspection.status)) {
        throw new ExecutionDispatchHttpError(
          "The remediation agent finished without publishing verifiable pull request evidence.",
          {
            status: 422,
            code: "SECURITY_REMEDIATION_EVIDENCE_MISSING",
          },
        );
      }
      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, pollMs));
      }
    }
    throw new ExecutionDispatchHttpError(
      "The remediation agent did not finish before the worker timeout.",
      {
        status: 504,
        code: "SECURITY_REMEDIATION_THREAD_TIMEOUT",
      },
    );
  }

  async function createSecurityRemediationThread(claim, context) {
    const payload = await requestWorkload(claim, "/threads", {
      method: "POST",
      body: {
        title: `Security remediation · ${context.repositoryFullName}`,
        appId: "runner-web-sdk-demo",
        agentId: context.agentId,
        hidden: true,
        sidebarHidden: true,
        enabledSkills: {
          computerAgents: true,
        },
        metadata: {
          security: {
            kind: "remediation",
            remediationId: context.remediationId,
            runId: context.runId,
            repositoryId: context.repositoryId,
            hidden: true,
            sidebarHidden: true,
          },
          runnerPlayground: {
            type: "security_remediation",
            securityRemediationId: context.remediationId,
            securityRunId: context.runId,
            hidden: true,
            sidebarHidden: true,
          },
        },
      },
    });
    const thread = extractThreadRecord(payload);
    const threadId = String(thread.id || thread.threadId || "").trim();
    if (!threadId) {
      throw new ExecutionDispatchHttpError(
        "The remediation worker created a thread without receiving its identity.",
        {
          status: 502,
          code: "SECURITY_REMEDIATION_THREAD_ID_MISSING",
        },
      );
    }
    await requestWorkload(
      claim,
      `/security/remediations/${encodeURIComponent(context.remediationId)}/thread`,
      {
        method: "POST",
        body: {
          dispatchId: claim.dispatch.id,
          threadId,
        },
      },
    );
    return threadId;
  }

  async function executeSecurityRemediation(claim) {
    const remediationId = String(claim.dispatch.resourceId || "");
    if (!remediationId) {
      throw new ExecutionDispatchHttpError(
        "Security remediation dispatch is missing its identity.",
        {
          status: 422,
          code: "SECURITY_REMEDIATION_DISPATCH_IDENTITY_MISSING",
        },
      );
    }
    const execution = await requestWorkload(
      claim,
      `/security/remediations/${encodeURIComponent(remediationId)}/execute`,
      {
        method: "POST",
        body: {
          dispatchId: claim.dispatch.id,
        },
      },
    );
    if (execution?.terminal) return execution;
    let threadId = String(execution?.workerThreadId || "").trim();
    if (!threadId) {
      threadId = await createSecurityRemediationThread(claim, execution);
    }
    let inspection = await inspectSecurityRemediationThread(
      claim,
      threadId,
      remediationId,
    );
    if (!inspection.output && !inspection.promptPersisted) {
      const repositoryName = String(execution.repositoryFullName || "")
        .split("/")
        .filter(Boolean)
        .at(-1) || String(execution.repositoryFullName || "");
      await requestWorkload(
        claim,
        `/threads/${encodeURIComponent(threadId)}/messages`,
        {
          method: "POST",
          body: {
            content:
              `${execution.message} Remediation ID: ${remediationId}.`,
            task: execution.message,
            executionContent: execution.prompt,
            useExecutionContentForUpstream: true,
            githubRepo: {
              repoFullName: execution.repositoryFullName,
              repoName: repositoryName,
              branch: execution.defaultBranch,
            },
            persistFileChanges: true,
            enabledSkills: {
              computerAgents: true,
            },
          },
        },
      );
      inspection = await inspectSecurityRemediationThread(
        claim,
        threadId,
        remediationId,
      );
    }
    const output = inspection.output || await waitForSecurityRemediationThread(
      claim,
      threadId,
      remediationId,
    );
    return await requestWorkload(
      claim,
      `/security/remediations/${encodeURIComponent(remediationId)}/complete`,
      {
        method: "POST",
        body: {
          dispatchId: claim.dispatch.id,
          threadId,
          output,
        },
      },
    );
  }

  async function failActiveSecurityRemediation(claim, error) {
    const remediationId = String(claim.dispatch.resourceId || "");
    if (!remediationId) return false;
    const details = safeError(error);
    await requestWorkload(
      claim,
      `/security/remediations/${encodeURIComponent(remediationId)}/fail`,
      {
        method: "POST",
        body: {
          dispatchId: claim.dispatch.id,
          code: details.code || "SECURITY_REMEDIATION_WORKER_FAILED",
          message: details.message,
        },
      },
    );
    return true;
  }

  function startClaimHeartbeat(claim, state) {
    let heartbeatInFlight = false;
    const timer = setInterval(() => {
      if (heartbeatInFlight || state.claimLost) return;
      heartbeatInFlight = true;
      requestControl(
        `/claims/${encodeURIComponent(claim.dispatch.id)}/heartbeat`,
        {
          token: claim.lease.token,
          leaseTtlMs,
        },
      )
        .catch((error) => {
          if (Number(error?.status || 0) === 409) {
            state.claimLost = true;
          }
          logger.warn?.("[execution-dispatch] Claim heartbeat failed", {
            dispatchId: claim.dispatch.id,
            kind: claim.dispatch.kind,
            claimLost: state.claimLost,
            ...safeError(error),
          });
        })
        .finally(() => {
          heartbeatInFlight = false;
        });
    }, heartbeatIntervalMs);
    timer.unref?.();
    return timer;
  }

  async function executeClaim(claim) {
    const kind = String(claim?.dispatch?.kind || "");
    const resourceId = String(claim?.dispatch?.resourceId || "");
    if (
      !claim?.dispatch?.id
      || !SUPPORTED_KINDS.has(kind)
      || !resourceId
      || !claim?.lease?.token
      || !claim?.credential?.key
    ) {
      throw new Error("Control API returned an incomplete execution dispatch claim.");
    }
    const request = createSyntheticRequest({
      apiKey: claim.credential.key,
      organizationId: String(claim.dispatch.organizationId || ""),
      upstreamOrigin: normalizedUpstreamOrigin,
      platformLocalOrigin: normalizedPlatformOrigin,
    });
    const state = { claimLost: false };
    const heartbeatTimer = startClaimHeartbeat(claim, state);
    try {
      if (kind === "evaluation_run") {
        await evaluationsService.runs.wake(request, resourceId);
      } else if (kind === "test_run") {
        await testsService.runs.wake(request, resourceId);
      } else if (kind === "project_delivery_task") {
        await executeProjectDeliveryTask(claim);
      } else if (kind === "project_automation") {
        await executeProjectAutomation(claim);
      } else if (kind === "thread_resume") {
        await executeThreadResume(claim);
      } else if (kind === "security_run") {
        await executeSecurityRun(claim);
      } else if (kind === "security_remediation") {
        await executeSecurityRemediation(claim);
      } else {
        await fineTuningService.jobs.wake(request, resourceId);
      }
      if (!state.claimLost) {
        await settleClaim(claim, "completed");
      }
      logger.info?.("[execution-dispatch] Execution completed", {
        dispatchId: claim.dispatch.id,
        kind,
        resourceId,
      });
    } catch (error) {
      const failureClassification = classifyFailure(error);
      const finalAttempt = Number(claim.dispatch.attemptCount || 0)
        >= Number(claim.dispatch.maxAttempts || 1);
      if (
        kind === "project_automation"
        && (failureClassification === "permanent" || finalAttempt)
        && !state.claimLost
      ) {
        try {
          if (await failActiveProjectAutomation(claim, error)) {
            await settleClaim(claim, "completed");
            logger.warn?.("[execution-dispatch] Project automation stopped", {
              dispatchId: claim.dispatch.id,
              kind,
              resourceId,
              ...safeError(error),
            });
            return;
          }
        } catch (recordError) {
          logger.error?.(
            "[execution-dispatch] Failed to persist project automation failure",
            {
              dispatchId: claim.dispatch.id,
              kind,
              resourceId,
              ...safeError(recordError),
            },
          );
        }
      }
      if (
        kind === "security_remediation"
        && (failureClassification === "permanent" || finalAttempt)
        && !state.claimLost
      ) {
        try {
          if (await failActiveSecurityRemediation(claim, error)) {
            await settleClaim(claim, "completed");
            logger.warn?.("[execution-dispatch] Security remediation stopped", {
              dispatchId: claim.dispatch.id,
              kind,
              resourceId,
              ...safeError(error),
            });
            return;
          }
        } catch (recordError) {
          logger.error?.(
            "[execution-dispatch] Failed to persist security remediation failure",
            {
              dispatchId: claim.dispatch.id,
              kind,
              resourceId,
              ...safeError(recordError),
            },
          );
        }
      }
      if (!state.claimLost) {
        const outcome = Number(error?.status || 0) === 404
          ? "cancelled"
          : "failed";
        await settleClaim(claim, outcome, error).catch((settlementError) => {
          logger.error?.("[execution-dispatch] Claim settlement failed", {
            dispatchId: claim.dispatch.id,
            kind,
            resourceId,
            ...safeError(settlementError),
          });
        });
      }
      logger.error?.("[execution-dispatch] Execution failed", {
        dispatchId: claim.dispatch.id,
        kind,
        resourceId,
        claimLost: state.claimLost,
        classification: classifyFailure(error),
        ...safeError(error),
      });
    } finally {
      clearInterval(heartbeatTimer);
    }
  }

  function trackClaim(claim) {
    const execution = executeClaim(claim)
      .finally(() => {
        active.delete(execution);
        // If all slots were occupied, the queue loop may currently be in its
        // idle delay. Re-open capacity immediately when a claim settles.
        if (!stopped && !pollInFlight) {
          consecutiveEmptyPolls = 0;
          schedulePoll(0);
        }
      });
    active.add(execution);
    return execution;
  }

  async function pollNow() {
    const capacity = Math.max(0, maxConcurrency - active.size);
    if (capacity === 0) return 0;
    const payload = await requestControl("/claims", {
      kinds: [...SUPPORTED_KINDS],
      limit: Math.min(batchSize, capacity),
      leaseTtlMs,
    });
    const claims = Array.isArray(payload?.claims)
      ? payload.claims
      : Array.isArray(payload?.data)
        ? payload.data
        : [];
    claims.slice(0, capacity).forEach(trackClaim);
    return claims.length;
  }

  function schedulePoll(delayMs = pollIntervalMs) {
    if (stopped) return;
    if (pollTimer) {
      clearTimeout(pollTimer);
    }
    pollTimer = setTimeout(() => {
      pollTimer = null;
      let nextPollDelayMs = pollIntervalMs;
      pollInFlight = pollNow()
        .then((claimCount) => {
          consecutivePollFailures = 0;
          if (claimCount > 0) {
            consecutiveEmptyPolls = 0;
            return;
          }
          consecutiveEmptyPolls = Math.min(10, consecutiveEmptyPolls + 1);
          nextPollDelayMs = Math.min(
            Math.max(pollIntervalMs, maximumIdlePollIntervalMs),
            pollIntervalMs * (2 ** Math.max(0, consecutiveEmptyPolls - 1)),
          );
        })
        .catch((error) => {
          consecutivePollFailures += 1;
          consecutiveEmptyPolls = 0;
          const exponentialDelayMs = Math.min(
            Math.max(pollIntervalMs, maximumPollBackoffMs),
            pollIntervalMs * (2 ** Math.min(10, consecutivePollFailures - 1)),
          );
          const jitterMultiplier = 0.75 + (Math.max(0, Math.min(1, random())) * 0.5);
          nextPollDelayMs = Math.max(
            pollIntervalMs,
            Math.round(exponentialDelayMs * jitterMultiplier),
          );
          logger.error?.("[execution-dispatch] Queue poll failed", safeError(error));
        })
        .finally(() => {
          pollInFlight = null;
          schedulePoll(nextPollDelayMs);
        });
    }, delayMs);
    pollTimer.unref?.();
  }

  return Object.freeze({
    enabled: true,
    workerId: assertionSigner.workerId,
    activeCount: () => active.size,
    pollNow,
    start() {
      if (!stopped) return;
      stopped = false;
      logger.info?.("[execution-dispatch] Worker started", {
        workerId: assertionSigner.workerId,
        maxConcurrency,
      });
      schedulePoll(0);
    },
    async stop({ wait = true } = {}) {
      stopped = true;
      if (pollTimer) clearTimeout(pollTimer);
      pollTimer = null;
      if (pollInFlight) await pollInFlight.catch(() => {});
      if (wait) await Promise.allSettled([...active]);
    },
  });
}

export {
  ExecutionDispatchHttpError,
  classifyFailure as classifyExecutionDispatcherFailure,
  createSyntheticRequest as createExecutionDispatcherRequest,
};
