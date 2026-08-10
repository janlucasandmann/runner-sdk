import {
  ExternalAgentError,
  buildExternalAgentExecutionContent,
  buildExternalAgentThreadMetadata,
  normalizeDisplayText,
} from "./domain.mjs";

const TERMINAL_SUCCESS_STATUSES = new Set(["completed", "complete", "succeeded", "success"]);
const TERMINAL_FAILURE_STATUSES = new Set(["failed", "error", "cancelled", "canceled"]);
const ACTIVE_STATUSES = new Set(["pending", "queued", "running", "working", "permission_asked"]);

const DEFAULT_CONNECTOR_ACTIONS = Object.freeze({
  jira: Object.freeze([
    "get_myself",
    "list_projects",
    "get_project",
    "search_issues",
    "get_issue",
    "get_issue_changelog",
    "list_comments",
    "get_transitions",
    "search_users",
    "list_issue_types",
    "list_fields",
    "list_boards",
    "list_sprints",
    "create_issue",
    "update_issue",
    "assign_issue",
    "transition_issue",
    "add_comment",
    "add_worklog",
    "move_issues_to_sprint",
  ]),
  linear: Object.freeze([
    "get_viewer",
    "list_teams",
    "list_projects",
    "get_project",
    "search_issues",
    "get_issue",
    "list_issue_comments",
    "create_issue",
    "update_issue",
    "add_issue_comment",
    "create_project",
    "update_project",
  ]),
});

export function createExternalAgentThreadInvoker({
  upstreamOrigin,
  apiKey,
  resolveApiKey,
  connectorRuntimeBridge,
  adapterRegistry,
  enrichThreadPayload,
  fetchImpl = globalThis.fetch,
  pollIntervalMs = 2_000,
  completionTimeoutMs = 30 * 60 * 1_000,
  logger = console,
} = {}) {
  const normalizedOrigin = String(upstreamOrigin || "").trim().replace(/\/+$/, "");
  if (!normalizedOrigin || typeof fetchImpl !== "function") {
    throw new TypeError("External-agent thread invocation requires an upstream origin and fetch.");
  }

  async function getApiKey() {
    const resolved = typeof resolveApiKey === "function" ? await resolveApiKey() : apiKey;
    const normalized = String(resolved || "").trim();
    if (!normalized) {
      throw new ExternalAgentError(
        503,
        "external_agent_execution_key_missing",
        "External-agent execution is not configured with a runner API key.",
      );
    }
    return normalized;
  }

  async function createThread({ envelope, binding, identity, installation }) {
    const key = await getApiKey();
    const metadata = buildExternalAgentThreadMetadata({ envelope, binding, identity });
    const payload = {
      title: createThreadTitle(envelope),
      appId: "runner-web-sdk-demo",
      agentId: binding.agentId,
      ...(binding.environmentId ? { environmentId: binding.environmentId } : {}),
      ...(binding.projectId ? { projectId: binding.projectId } : {}),
      metadata,
    };
    const enrichedPayload = typeof enrichThreadPayload === "function"
      ? await enrichThreadPayload(createInternalRequest(installation, key), normalizedOrigin, key, payload)
      : payload;
    const response = await fetchImpl(`${normalizedOrigin}/threads`, {
      method: "POST",
      headers: createHeaders({ installation, apiKey: key, idempotencyKey: `external-thread:${envelope.conversationKey}` }),
      body: JSON.stringify(enrichedPayload),
      signal: AbortSignal.timeout(30_000),
    });
    const result = await readJsonResponse(response, "Unable to create the external-agent thread.");
    const thread = extractThreadRecord(result);
    if (!thread?.id) {
      throw new ExternalAgentError(
        502,
        "external_agent_thread_id_missing",
        "Thread creation did not return a thread id.",
      );
    }
    return thread;
  }

  async function hasDispatchedEvent({ envelope, installation, threadId }) {
    const payload = await fetchJson({
      envelope,
      installation,
      path: `/threads/${encodeURIComponent(threadId)}/messages?limit=200&compact=1`,
    }).catch(() => null);
    return normalizeResponseArray(payload, ["messages"]).some((message) => (
      findStringValue(message, [
        "externalAgentEventId",
        "external_agent_event_id",
        "metadata.externalAgentEventId",
        "messageMetadata.externalAgentEventId",
      ]) === envelope.eventId
    ));
  }

  async function runTurn({ envelope, binding, identity, installation, threadId }) {
    const key = await getApiKey();
    if (await hasDispatchedEvent({ envelope, installation, threadId })) {
      return waitForCompletion({ envelope, installation, threadId, fallbackSummary: "" });
    }
    const connectorPayload = await addConnectorRuntime({
      envelope,
      binding,
      identity,
      installation,
      threadId,
    });
    const payload = {
      content: envelope.visibleMessage,
      task: envelope.visibleMessage,
      executionContent: buildExternalAgentExecutionContent({ envelope, binding, identity }),
      useExecutionContentForUpstream: true,
      messageMetadata: {
        externalAgentEventId: envelope.eventId,
        externalAgentProvider: envelope.provider,
        externalAgentResourceId: envelope.resource.id,
      },
      ...connectorPayload,
    };
    const response = await fetchImpl(
      `${normalizedOrigin}/threads/${encodeURIComponent(threadId)}/messages`,
      {
        method: "POST",
        headers: createHeaders({
          installation,
          apiKey: key,
          idempotencyKey: `external-message:${envelope.installationId}:${envelope.eventId}`,
        }),
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(completionTimeoutMs),
      },
    );
    if (!response.ok) {
      await readJsonResponse(response, "Unable to start the external-agent turn.");
    }
    const streamText = await response.text().catch(() => "");
    return waitForCompletion({
      envelope,
      installation,
      threadId,
      fallbackSummary: extractStreamSummary(streamText),
    });
  }

  async function waitForCompletion({ envelope, installation, threadId, fallbackSummary = "" }) {
    const deadline = Date.now() + completionTimeoutMs;
    let latestSummary = normalizeDisplayText(fallbackSummary, 30_000);
    while (Date.now() < deadline) {
      const encoded = encodeURIComponent(threadId);
      const [threadResult, stepsResult, logsResult, messagesResult] = await Promise.allSettled([
        fetchJson({ installation, path: `/threads/${encoded}` }),
        fetchJson({ installation, path: `/threads/${encoded}/steps?limit=160&compact=1` }),
        fetchJson({ installation, path: `/threads/${encoded}/logs?compact=1&includeConversation=0&limit=160` }),
        fetchJson({ installation, path: `/threads/${encoded}/messages?limit=160&compact=1` }),
      ]);
      const thread = threadResult.status === "fulfilled"
        ? extractThreadRecord(threadResult.value) || record(threadResult.value)
        : {};
      const status = String(thread.status || thread.state || "").trim().toLowerCase();
      const records = [stepsResult, logsResult, messagesResult].flatMap((result) => (
        result.status === "fulfilled"
          ? normalizeResponseArray(result.value, ["steps", "logs", "messages"])
          : []
      ));
      latestSummary = extractFinalSummary(records) || readThreadSummary(thread) || latestSummary;
      if (TERMINAL_FAILURE_STATUSES.has(status)) {
        throw new ExternalAgentError(
          502,
          "external_agent_thread_failed",
          `The external-agent thread ended with status ${status}.`,
        );
      }
      if (TERMINAL_SUCCESS_STATUSES.has(status) && latestSummary) {
        return Object.freeze({ threadId, summary: latestSummary, status });
      }
      if (latestSummary && status && !ACTIVE_STATUSES.has(status)) {
        return Object.freeze({ threadId, summary: latestSummary, status });
      }
      await delay(pollIntervalMs);
    }
    throw new ExternalAgentError(
      504,
      "external_agent_thread_timeout",
      "The external-agent thread did not finish before the execution timeout.",
    );
  }

  async function fetchJson({ installation, path }) {
    const key = await getApiKey();
    const response = await fetchImpl(`${normalizedOrigin}${path}`, {
      method: "GET",
      headers: createHeaders({ installation, apiKey: key }),
      signal: AbortSignal.timeout(30_000),
    });
    return readJsonResponse(response, "Unable to inspect the external-agent thread.");
  }

  async function addConnectorRuntime({ envelope, binding, identity, installation, threadId }) {
    if (!installation.credentialId || typeof connectorRuntimeBridge?.addRuntimeServers !== "function") {
      return {};
    }
    const adapterActions = new Set(
      (adapterRegistry?.listCapabilities?.(envelope.provider) || [])
        .map((capability) => String(capability?.id || "").trim())
        .filter(Boolean),
    );
    const requestedActions = Array.isArray(binding.allowedConnectorActions)
      ? binding.allowedConnectorActions
      : DEFAULT_CONNECTOR_ACTIONS[envelope.provider] || [];
    const allowedActions = [...new Set(requestedActions.map(String))]
      .filter((action) => adapterActions.has(action));
    if (!allowedActions.length) {
      logger?.warn?.("[external-agents] No connector actions are available for binding", {
        bindingId: binding.id,
        provider: envelope.provider,
      });
      return {};
    }
    const connectors = {
      [envelope.provider]: {
        enabled: true,
        agentId: binding.agentId,
        actorUserId: identity?.platformUserId || "",
        organizationId: installation.organizationId,
        credentialId: installation.credentialId,
        credentialResolution: { source: "explicit" },
        allowedActions,
        approvalRequiredActions: [],
        policyVersion: 1,
      },
    };
    const withRuntime = await connectorRuntimeBridge.addRuntimeServers({
      threadId,
      payload: { connectors },
    });
    return {
      connectors,
      ...(Array.isArray(withRuntime.mcpServers) ? { mcpServers: withRuntime.mcpServers } : {}),
    };
  }

  return Object.freeze({ createThread, hasDispatchedEvent, runTurn, waitForCompletion });
}

function createHeaders({ installation, apiKey, idempotencyKey = "" }) {
  return {
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
    "x-api-key": apiKey,
    "x-computer-agents-organization": installation?.organizationId || "",
    ...(idempotencyKey ? { "idempotency-key": idempotencyKey } : {}),
  };
}

function createInternalRequest(installation, apiKey) {
  return {
    headers: {
      "x-api-key": apiKey,
      "x-computer-agents-organization": installation?.organizationId || "",
    },
  };
}

function createThreadTitle(envelope) {
  const prefix = envelope.resource.key || envelope.resource.id;
  const title = normalizeDisplayText(envelope.resource.title, 300);
  return normalizeDisplayText(title ? `${prefix}: ${title}` : prefix, 400) || "External agent request";
}

function extractThreadRecord(payload) {
  const source = record(payload);
  for (const candidate of [source.thread, source.data?.thread, source.data, source.item, source]) {
    if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) continue;
    const id = String(candidate.id || candidate.threadId || candidate.thread_id || "").trim();
    if (id) return { ...candidate, id };
  }
  return null;
}

async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text().catch(() => "");
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }
  if (!response.ok) {
    throw new ExternalAgentError(
      Number(response.status) || 502,
      String(payload?.error || payload?.code || "external_agent_upstream_failed"),
      String(payload?.message || fallbackMessage),
    );
  }
  return payload;
}

function extractStreamSummary(text) {
  let latest = "";
  for (const block of String(text || "").split(/\n\n+/)) {
    const data = block.split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n")
      .trim();
    if (!data || data === "[DONE]") continue;
    try {
      const parsed = JSON.parse(data);
      latest = readRecordText(parsed) || latest;
    } catch {}
  }
  return normalizeDisplayText(latest, 30_000);
}

function extractFinalSummary(records) {
  const sorted = (Array.isArray(records) ? records : [])
    .filter((entry) => entry && typeof entry === "object")
    .sort((left, right) => readTimestamp(left).localeCompare(readTimestamp(right)));
  const summaries = sorted.filter((entry) => {
    const type = readType(entry);
    return type === "turn_completed" || type === "run_summary" || type.includes("summary");
  });
  const candidates = summaries.length ? summaries : sorted.filter(isAssistantLike);
  for (let index = candidates.length - 1; index >= 0; index -= 1) {
    const text = readRecordText(candidates[index]);
    if (text) return normalizeDisplayText(text, 30_000);
  }
  return "";
}

function readThreadSummary(thread) {
  const source = record(thread);
  const metadata = record(source.metadata);
  const result = record(source.result);
  const response = record(source.response);
  for (const candidate of [
    source.summary,
    source.runSummary,
    source.run_summary,
    source.finalOutput,
    source.final_output,
    source.outputText,
    source.output_text,
    result.summary,
    result.outputText,
    result.output_text,
    response.summary,
    response.outputText,
    response.output_text,
    metadata.summary,
    metadata.runSummary,
    metadata.run_summary,
  ]) {
    const text = readRecordText(candidate);
    if (text) return normalizeDisplayText(text, 30_000);
  }
  return "";
}

function readRecordText(value, depth = 0) {
  if (depth > 6) return "";
  if (["string", "number", "boolean"].includes(typeof value)) return String(value).trim();
  if (Array.isArray(value)) return value.map((entry) => readRecordText(entry, depth + 1)).filter(Boolean).join("\n");
  if (!value || typeof value !== "object") return "";
  const metadata = record(value.metadata);
  const response = record(value.response);
  const result = record(value.result);
  for (const candidate of [
    value.summary,
    value.runSummary,
    value.run_summary,
    value.outputText,
    value.output_text,
    value.output,
    response.summary,
    response.outputText,
    response.output_text,
    result.summary,
    result.outputText,
    result.output_text,
    metadata.summary,
    metadata.runSummary,
    metadata.run_summary,
    metadata.output,
    value.content,
    value.text,
    value.message,
  ]) {
    const text = readRecordText(candidate, depth + 1);
    if (text) return text;
  }
  return "";
}

function normalizeResponseArray(payload, keys) {
  if (Array.isArray(payload)) return payload;
  const source = record(payload);
  for (const key of keys) if (Array.isArray(source[key])) return source[key];
  for (const candidate of [source.data, source.items, source.results]) if (Array.isArray(candidate)) return candidate;
  return [];
}

function findStringValue(value, paths) {
  for (const path of paths) {
    let current = value;
    for (const part of path.split(".")) current = current?.[part];
    const normalized = String(current || "").trim();
    if (normalized) return normalized;
  }
  return "";
}

function readType(value) {
  return String(
    value?.eventType || value?.event_type || value?.stepKind || value?.step_kind
    || value?.type || value?.kind || value?.metadata?.type || "",
  ).trim().toLowerCase();
}

function readTimestamp(value) {
  return String(value?.createdAt || value?.created_at || value?.timestamp || value?.updatedAt || "");
}

function isAssistantLike(value) {
  const role = String(value?.role || value?.authorRole || value?.author_role || "").toLowerCase();
  const type = readType(value);
  return role === "assistant" || role === "agent" || type.includes("assistant") || type.includes("turn_completed");
}

function record(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, Math.max(0, Number(ms) || 0)));
}
