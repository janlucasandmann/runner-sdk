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
  heartbeatIntervalMs = 25_000,
  leaseTtlMs = 120_000,
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
        String(payload?.message || payload?.error || "Project delivery task request failed."),
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
    const prompt = buildProjectDeliveryTaskPrompt(metadata);
    const executionPayload = await requestWorkload(
      claim,
      `/tasks/${encodeURIComponent(resourceId)}/run-thread`,
      {
        method: "POST",
        body: {
          idempotencyKey: `project-delivery:${claim.dispatch.id}`,
          agentId: metadata.executionAgentId || undefined,
          environmentId: metadata.environmentId || undefined,
          moveToInProgress: true,
          message: prompt,
          metadata: {
            triggerKind: "automation",
            source: "mission_control_delivery",
            missionControlDeliveryExecutionId:
              metadata.deliveryExecutionId || null,
            missionControlDeliveryStageId:
              metadata.deliveryStageId || null,
          },
        },
      },
    );
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
      .finally(() => active.delete(execution));
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
    pollTimer = setTimeout(() => {
      pollInFlight = pollNow()
        .catch((error) => {
          logger.error?.("[execution-dispatch] Queue poll failed", safeError(error));
        })
        .finally(() => {
          pollInFlight = null;
          schedulePoll();
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
