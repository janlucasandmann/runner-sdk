import { RunnerEventNormalizer } from "./normalize-event.js";
import { iterateSseData } from "./sse.js";
import {
  normalizeRunnerThreadAction,
  normalizeRunnerThreadActivityGroup,
  normalizeRunnerThreadEvent,
  normalizeRunnerThreadEventPage,
  normalizeRunnerThreadMessage,
  normalizeRunnerThreadRoutingReceipt,
  normalizeRunnerThreadRun,
  normalizeRunnerThreadTimelinePage,
  unwrapRunnerThreadList,
  unwrapRunnerThreadObject,
} from "./thread/normalize.js";
import {
  RunnerThreadAction,
  RunnerThreadActivityClassificationResult,
  RunnerThreadActivityGroup,
  RunnerThreadControlInput,
  RunnerThreadDeliveryMode,
  RunnerThreadEvent,
  RunnerThreadEventPage,
  RunnerThreadRoutedMessageInput,
  RunnerThreadRoutedMessageResult,
  RunnerThreadRun,
  RunnerThreadRunCommandResult,
  RunnerThreadSteeringInput,
  RunnerThreadTimelinePage,
  RunnerThreadTimelineQuery,
} from "./thread/types.js";
import {
  RawRunnerEvent,
  RunnerAgentCreateInput,
  RunnerAgentRecord,
  RunnerAgentUpdateInput,
  RunnerAgentVersion,
  RunnerAgentVersionCompareResult,
  RunnerAgentVersionCreateInput,
  RunnerAgentVersionUpdateInput,
  RunnerApiRequestOptions,
  RunnerVoiceAgentPhoneNumberInput,
  RunnerVoiceAgentRecord,
  RunnerVoiceAgentSessionCreateInput,
  RunnerVoiceAgentSessionCreateResult,
  RunnerVoiceSession,
  RunnerEnvironmentForkResult,
  RunnerEnvironmentSnapshotInitializeResult,
  RunnerEnvironmentSnapshot,
  RunnerEnvironmentSnapshotDiffResult,
  RunnerEnvironmentSnapshotFileResult,
  RunnerEnvironmentVersion,
  RunnerEnvironmentVersionCompareResult,
  RunnerEnvironmentVersionCreateInput,
  RunnerEnvironmentVersionSaveResult,
  RunnerEnvironmentVersionUpdateInput,
  RunnerEvaluationRun,
  RunnerEvaluationRunCreateInput,
  RunnerEvaluationSet,
  RunnerEvaluationSetCreateInput,
  RunnerEvaluationSetUpdateInput,
  RunnerEvaluationVersion,
  RunnerEvaluationVersionCompareResult,
  RunnerEvaluationVersionCreateInput,
  RunnerEvaluationVersionUpdateInput,
  RunnerExecuteOptions,
  RunnerExecuteResult,
  RunnerFineTuningJob,
  RunnerFineTuningJobCreateInput,
  RunnerGuardrailSet,
  RunnerGuardrailSetCreateInput,
  RunnerGuardrailSetUpdateInput,
  RunnerGuardrailVersion,
  RunnerGuardrailVersionCompareResult,
  RunnerGuardrailVersionCreateInput,
  RunnerGuardrailVersionUpdateInput,
  RunnerLog,
  RunnerMetronomeFunctionTriggerInvokeInput,
  RunnerMetronomeRun,
  RunnerMetronomeRunCreateInput,
  RunnerMetronomeVersion,
  RunnerMetronomeVersionCompareResult,
  RunnerMetronomeVersionCreateInput,
  RunnerMetronomeVersionUpdateInput,
  RunnerMetronomeWorkflow,
  RunnerMetronomeWorkflowCreateInput,
  RunnerMetronomeWorkflowUpdateInput,
  RunnerRunRequest,
  RunnerServerVersion,
  RunnerServerVersionCompareResult,
  RunnerServerVersionCreateInput,
  RunnerServerVersionSaveResult,
  RunnerServerVersionUpdateInput,
  RunnerThreadForkResult,
  RunnerThreadFileHistoryResult,
  RunnerThreadRevertResult,
  RunnerSnapshotFileEntry,
  RunnerThreadStep,
  RunnerThreadStepDiffResult,
  RunnerThreadStepFileResult,
} from "./types.js";

type FetchLike = typeof fetch;

const ORGANIZATION_HEADER = "x-computer-agents-organization";

export class RunnerClient {
  private readonly fetchImpl: FetchLike;

  constructor(fetchImpl: FetchLike = fetch) {
    // Browser `window.fetch` must be called with window/globalThis as context.
    // Bind only the global fetch reference to avoid changing custom fetch behavior.
    if (typeof globalThis.fetch === "function" && fetchImpl === globalThis.fetch) {
      this.fetchImpl = globalThis.fetch.bind(globalThis) as FetchLike;
    } else {
      this.fetchImpl = fetchImpl;
    }
  }

  async execute(options: RunnerExecuteOptions): Promise<RunnerExecuteResult> {
    const runRequest = await this.resolveRunRequest(options);
    const response = await this.fetchImpl(runRequest.url, {
      method: runRequest.method ?? "POST",
      headers: this.withOrganizationHeader(runRequest.headers, runRequest.organizationId ?? options.organizationId),
      body: JSON.stringify(runRequest.body),
      credentials: runRequest.credentials,
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Runner stream failed"));
    }

    if (!response.body) {
      throw new Error("Runner stream response has no body");
    }

    const normalizer = new RunnerEventNormalizer();
    const startedAt = Date.now();
    let usage: RunnerExecuteResult["usage"];
    let cancelled = false;
    let queued = false;
    let batchJobId: string | null = null;
    let admissionReason: string | null = null;
    let streamError: Error | undefined;

    for await (const data of iterateSseData(response.body)) {
      if (!data || data === "[DONE]") continue;

      const event = this.parseEvent(data);
      if (!event) continue;

      if (event.type === "stream.keepalive") {
        continue;
      }

      options.onRawEvent?.(event);
      const handled = normalizer.handle(event);

      if (handled.setupComplete) {
        options.onSetupComplete?.();
      }

      if (handled.logs.length > 0) {
        for (const log of handled.logs) {
          options.onLog?.(log);
        }
      }

      if (handled.usage) {
        usage = handled.usage;
      }

      if (handled.cancelled) {
        cancelled = true;
      }

      if (handled.streamError) {
        streamError = handled.streamError;
      }

      if (event.type === "stream.completed") {
        queued = event.queued === true;
        batchJobId = typeof event.batchJobId === "string"
          ? event.batchJobId
          : null;
        admissionReason = typeof event.admissionReason === "string"
          ? event.admissionReason
          : null;
        break;
      }
    }

    const result: RunnerExecuteResult = {
      durationSeconds: Math.floor((Date.now() - startedAt) / 1000),
      usage,
      cancelled,
      queued,
      batchJobId,
      admissionReason,
    };

    if (streamError && (options.throwOnError ?? true)) {
      throw streamError;
    }

    return result;
  }

  async listThreadSteps(
    options: RunnerApiRequestOptions & {
      threadId: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerThreadStep[]> {
    const search = new URLSearchParams();
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerThreadStep[] }>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getThreadLogs(
    options: RunnerApiRequestOptions & {
      threadId: string;
      compact?: boolean;
      includeConversation?: boolean;
    },
  ): Promise<RunnerLog[]> {
    const search = new URLSearchParams();
    if (options.compact) search.set("compact", "1");
    if (options.includeConversation === false) search.set("includeConversation", "0");
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/logs${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerLog[]; logs?: RunnerLog[] }>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.logs) ? payload.logs : Array.isArray(payload.data) ? payload.data : [];
  }

  /** Returns the canonical mixed thread timeline after an optional sequence/cursor. */
  async listThreadTimeline(
    options: RunnerApiRequestOptions & RunnerThreadTimelineQuery & {
      threadId: string;
    },
  ): Promise<RunnerThreadTimelinePage> {
    const search = new URLSearchParams();
    if (options.after !== undefined) search.set("after", String(options.after));
    if (options.before !== undefined) search.set("before", String(options.before));
    if (options.cursor) search.set("cursor", options.cursor);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.includeLegacy === false) search.set("includeLegacy", "0");
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/timeline${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return normalizeRunnerThreadTimelinePage(payload, { threadId: options.threadId, sequence: options.after });
  }

  /** Alias for consumers that use resource-style `get` naming. */
  async getThreadTimeline(
    options: RunnerApiRequestOptions & RunnerThreadTimelineQuery & {
      threadId: string;
    },
  ): Promise<RunnerThreadTimelinePage> {
    return this.listThreadTimeline(options);
  }

  /** Lists durable thread events without opening a streaming connection. */
  async listThreadEvents(
    options: RunnerApiRequestOptions & RunnerThreadTimelineQuery & {
      threadId: string;
    },
  ): Promise<RunnerThreadEventPage> {
    const search = new URLSearchParams();
    if (options.after !== undefined) search.set("after", String(options.after));
    if (options.before !== undefined) search.set("before", String(options.before));
    if (options.cursor) search.set("cursor", options.cursor);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/events${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return normalizeRunnerThreadEventPage(payload, { threadId: options.threadId, sequence: options.after });
  }

  /**
   * Replays and tails the durable thread event stream. Persist the latest
   * yielded `sequence` and pass it back as `after` when reconnecting.
   */
  async *streamThreadEvents(
    options: RunnerApiRequestOptions & RunnerThreadTimelineQuery & {
      threadId: string;
      onOpen?: () => void;
      onEvent?: (event: RunnerThreadEvent) => void;
      onCursor?: (sequence: number) => void;
    },
  ): AsyncGenerator<RunnerThreadEvent> {
    const search = new URLSearchParams({ stream: "1" });
    if (options.after !== undefined) search.set("after", String(options.after));
    if (options.cursor) {
      if (options.after === undefined && /^\d+$/.test(options.cursor)) search.set("after", options.cursor);
      else if (!/^\d+$/.test(options.cursor)) search.set("cursor", options.cursor);
    }
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/events?${search.toString()}`,
    );
    const headers = this.withOrganizationHeader(options.headers, options.organizationId);
    if (!headers.has("Accept")) headers.set("Accept", "text/event-stream");
    const resumeSequence = options.after !== undefined
      ? String(options.after)
      : options.cursor && /^\d+$/.test(options.cursor)
        ? options.cursor
        : "";
    if (resumeSequence && !headers.has("Last-Event-ID")) headers.set("Last-Event-ID", resumeSequence);
    const response = await this.fetchImpl(url, {
      method: "GET",
      headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Thread event stream failed"));
    }
    if (!response.body) throw new Error("Thread event stream response has no body");
    options.onOpen?.();

    for await (const data of iterateSseData(response.body)) {
      const trimmed = data.trim();
      if (!trimmed || trimmed === "[DONE]") continue;
      let raw: unknown;
      try {
        raw = JSON.parse(trimmed) as unknown;
      } catch {
        continue;
      }
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) continue;
      const record = raw as Record<string, unknown>;
      if (
        typeof record.type !== "string" &&
        record.after !== undefined &&
        typeof record.threadId === "string"
      ) {
        // Backend replay streams begin with a `stream.ready` data frame. The
        // lightweight SSE iterator intentionally exposes data only, so detect
        // this cursor handshake by shape instead of projecting a fake event.
        continue;
      }
      if (typeof record.type !== "string" && typeof record.error === "string") {
        throw new Error(record.error);
      }
      const envelopeType = typeof record.type === "string" ? record.type.toLowerCase() : "";
      if (envelopeType === "stream.keepalive" || envelopeType === "thread.keepalive") continue;
      if (envelopeType === "stream.completed" || envelopeType === "thread.stream.completed") break;
      const candidate = record.event && typeof record.event === "object" && !Array.isArray(record.event)
        ? record.event
        : record.data && typeof record.data === "object" && !Array.isArray(record.data)
          ? record.data
          : record;
      const event = normalizeRunnerThreadEvent(candidate, { threadId: options.threadId });
      options.onEvent?.(event);
      options.onCursor?.(event.sequence);
      yield event;
    }
  }

  /** Classifies a message without persisting it, allowing compatibility clients to choose the safe transport. */
  async classifyThreadActivityMessage(
    options: RunnerApiRequestOptions & {
      threadId: string;
      message: Pick<RunnerThreadRoutedMessageInput, "content" | "deliveryMode" | "intendedRoute" | "replyToRunId">;
    },
  ): Promise<RunnerThreadActivityClassificationResult> {
    const url = this.buildApiUrl(options.backendUrl, `/threads/${encodeURIComponent(options.threadId)}/activity/classify`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        content: options.message.content,
        ...(options.message.deliveryMode ? { mode: options.message.deliveryMode } : {}),
        ...(options.message.intendedRoute ? { targetType: options.message.intendedRoute } : {}),
        ...(options.message.replyToRunId ? { replyToRunId: options.message.replyToRunId } : {}),
      }),
    });
    const record = unwrapRunnerThreadObject(payload, ["result"]);
    const rawDecision = record.decision && typeof record.decision === "object" && !Array.isArray(record.decision)
      ? record.decision as Record<string, unknown>
      : {};
    const rawRoute = String(rawDecision.route || "").trim().toLowerCase();
    const route = rawRoute === "worker_checkpoint" || rawRoute === "worker_interrupt"
      ? "worker"
      : rawRoute === "human_fyi"
        ? "human"
        : rawRoute === "conversation_fyi"
          ? "broadcast"
          : rawRoute === "control"
            ? "system"
            : rawRoute || "none";
    const deliveryMode: RunnerThreadDeliveryMode = rawRoute === "worker_interrupt" || rawRoute === "control"
      ? "interrupt"
      : rawRoute === "worker_checkpoint"
        ? "checkpoint"
        : "fyi";
    return {
      threadId: String(record.threadId || record.thread_id || options.threadId),
      decision: {
        route,
        deliveryMode,
        runId: typeof record.targetRunId === "string" ? record.targetRunId : null,
        purpose: typeof rawDecision.intent === "string" ? rawDecision.intent : null,
        reason: typeof rawDecision.reason === "string" ? rawDecision.reason : null,
        confidence: typeof rawDecision.confidence === "number" ? rawDecision.confidence : null,
        deterministic: true,
        metadata: {
          raw: rawDecision,
          rawRoute,
          controlAction: rawDecision.controlAction || rawDecision.control_action || null,
        },
      },
      targetRunId: typeof record.targetRunId === "string" ? record.targetRunId : null,
      targetRunStatus: typeof record.targetRunStatus === "string" ? record.targetRunStatus : null,
      targetRunActive: record.targetRunActive === true,
      suggestedTransport: String(record.suggestedTransport || "legacy_follow_up"),
      shouldPersistWithActivityEndpoint: record.shouldPersistWithActivityEndpoint === true,
      persisted: false,
    };
  }

  /** Stores a participant message and its requested routing semantics without using the legacy worker-execution endpoint. */
  async postThreadRoutedMessage(
    options: RunnerApiRequestOptions & {
      threadId: string;
      message: RunnerThreadRoutedMessageInput;
    },
  ): Promise<RunnerThreadRoutedMessageResult> {
    const url = this.buildApiUrl(options.backendUrl, `/threads/${encodeURIComponent(options.threadId)}/activity/messages`);
    const requestBody = {
      ...options.message,
      ...(options.message.intendedRoute ? { targetType: options.message.intendedRoute } : {}),
      ...(options.message.intendedRecipientId ? { targetId: options.message.intendedRecipientId } : {}),
      ...(options.message.deliveryMode ? { mode: options.message.deliveryMode } : {}),
    };
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(requestBody),
    });
    const record = unwrapRunnerThreadObject(payload, ["result"]);
    const rawMessage = record.message && typeof record.message === "object" && !Array.isArray(record.message)
      ? record.message as Record<string, unknown>
      : record;
    const rawReceipt = record.routingReceipt && typeof record.routingReceipt === "object" && !Array.isArray(record.routingReceipt)
      ? record.routingReceipt
      : record.receipt && typeof record.receipt === "object" && !Array.isArray(record.receipt)
        ? record.receipt
        : record.delivery && typeof record.delivery === "object" && !Array.isArray(record.delivery)
          ? record.delivery
          : null;
    const rawRun = record.run && typeof record.run === "object" && !Array.isArray(record.run) ? record.run : null;
    const rawMainEvent = record.event && typeof record.event === "object" && !Array.isArray(record.event)
      ? record.event as Record<string, unknown>
      : null;
    const participantIdentity = (roleOrType: unknown, authorityId: unknown) => {
      const rawRole = String(roleOrType || "human").trim().toLowerCase();
      const kind = rawRole === "user" || rawRole === "human"
        ? "human"
        : rawRole === "communicator" || rawRole === "observer"
          ? rawRole
          : rawRole === "assistant" || rawRole === "agent" || rawRole === "worker"
            ? "worker"
            : rawRole || "human";
      const id = String(authorityId || "").trim();
      return id
        ? `${options.threadId}:participant:${kind}:${id}`
        : `${options.threadId}:participant:${kind}`;
    };
    const normalizeActivityEvent = (rawEvent: Record<string, unknown> | null): RunnerThreadEvent | null => {
      if (!rawEvent) return null;
      const producer = rawEvent.producer && typeof rawEvent.producer === "object" && !Array.isArray(rawEvent.producer)
        ? rawEvent.producer as Record<string, unknown>
        : {};
      const producerType = String(producer.type || rawEvent.producerType || rawEvent.producer_type || "system");
      const producerId = String(producer.id || rawEvent.producerId || rawEvent.producer_id || "");
      return normalizeRunnerThreadEvent({
        ...rawEvent,
        producer: {
          ...producer,
          type: producerType,
          id: producerId || null,
          participantId: participantIdentity(producerType, producerId),
        },
        actorParticipantId: rawEvent.actorParticipantId || rawEvent.actor_participant_id || participantIdentity(producerType, producerId),
      }, { threadId: options.threadId });
    };
    const mainEvent = normalizeActivityEvent(rawMainEvent);
    const mainProducerType = mainEvent?.producer.type || rawMessage.role || "human";
    const mainProducerId = mainEvent?.producer.id || rawMessage.userId || rawMessage.user_id || rawMessage.authorId || rawMessage.author_id || "";
    const message = normalizeRunnerThreadMessage({
      ...rawMessage,
      threadId: options.threadId,
      sequence: rawMessage.sequence ?? mainEvent?.sequence ?? 0,
      authorParticipantId: rawMessage.authorParticipantId || rawMessage.author_participant_id || participantIdentity(mainProducerType, mainProducerId),
      content: rawMessage.content || rawMessage.message || rawMessage.text || options.message.content,
    }, { threadId: options.threadId, sequence: mainEvent?.sequence ?? 0 });
    const routeDecisionRecord = record.routeDecision && typeof record.routeDecision === "object" && !Array.isArray(record.routeDecision)
      ? record.routeDecision as Record<string, unknown>
      : null;
    const deliveryRecord = rawReceipt as Record<string, unknown> | null;
    const rawDecisionRoute = String(routeDecisionRecord?.route || "").trim().toLowerCase();
    const decisionRouteDefaults = rawDecisionRoute === "worker_interrupt"
      ? { targetType: "worker", mode: "interrupt" }
      : rawDecisionRoute === "worker_checkpoint"
        ? { targetType: "worker", mode: "checkpoint" }
        : rawDecisionRoute === "communicator"
          ? { targetType: "communicator", mode: "fyi" }
          : rawDecisionRoute === "human_fyi"
            ? { targetType: "human", mode: "fyi" }
            : rawDecisionRoute === "conversation_fyi"
              ? { targetType: "broadcast", mode: "fyi" }
              : rawDecisionRoute === "control"
                ? { targetType: "system", mode: "interrupt" }
                : { targetType: "none", mode: "fyi" };
    const targetType = String(
      routeDecisionRecord?.targetType
      || routeDecisionRecord?.target_type
      || deliveryRecord?.targetType
      || deliveryRecord?.target_type
      || decisionRouteDefaults.targetType,
    );
    const targetId = String(
      routeDecisionRecord?.targetId
      || routeDecisionRecord?.target_id
      || deliveryRecord?.targetId
      || deliveryRecord?.target_id
      || "",
    );
    const delivery = rawReceipt ? normalizeRunnerThreadRoutingReceipt({
      ...(rawReceipt as Record<string, unknown>),
      threadId: options.threadId,
      messageId: (rawReceipt as Record<string, unknown>).messageId || (rawReceipt as Record<string, unknown>).message_id || message.id,
      route: targetType,
      deliveryMode: (rawReceipt as Record<string, unknown>).mode || (rawReceipt as Record<string, unknown>).deliveryMode || options.message.deliveryMode,
      recipientParticipantId: targetType !== "none" ? participantIdentity(targetType, targetId) : null,
      sequence: (rawReceipt as Record<string, unknown>).deliveredAtSequence || (rawReceipt as Record<string, unknown>).delivered_at_sequence || mainEvent?.sequence || message.sequence,
    }, { threadId: options.threadId, sequence: mainEvent?.sequence ?? message.sequence }) : null;
    const communicatorRecord = record.communicator && typeof record.communicator === "object" && !Array.isArray(record.communicator)
      ? record.communicator as Record<string, unknown>
      : null;
    const rawCommunicatorEvent = communicatorRecord?.event && typeof communicatorRecord.event === "object" && !Array.isArray(communicatorRecord.event)
      ? communicatorRecord.event as Record<string, unknown>
      : null;
    const communicatorEvent = normalizeActivityEvent(rawCommunicatorEvent);
    const rawCommunicatorMessage = communicatorRecord?.message && typeof communicatorRecord.message === "object" && !Array.isArray(communicatorRecord.message)
      ? communicatorRecord.message as Record<string, unknown>
      : null;
    const communicatorMessage = rawCommunicatorMessage ? normalizeRunnerThreadMessage({
      ...rawCommunicatorMessage,
      threadId: options.threadId,
      sequence: rawCommunicatorMessage.sequence ?? communicatorEvent?.sequence ?? mainEvent?.sequence ?? 0,
      authorParticipantId: rawCommunicatorMessage.authorParticipantId
        || rawCommunicatorMessage.author_participant_id
        || participantIdentity(communicatorEvent?.producer.type || "communicator", communicatorEvent?.producer.id || ""),
      content: rawCommunicatorMessage.content || rawCommunicatorMessage.message || rawCommunicatorMessage.text || "",
    }, { threadId: options.threadId, sequence: communicatorEvent?.sequence ?? mainEvent?.sequence ?? 0 }) : null;
    const normalizedEvents = [
      mainEvent,
      ...((Array.isArray(record.events) ? record.events : []).map((event) => (
        event && typeof event === "object" && !Array.isArray(event) ? normalizeActivityEvent(event as Record<string, unknown>) : null
      ))),
      communicatorEvent,
    ].filter((event): event is RunnerThreadEvent => Boolean(event));
    const events = Array.from(new Map(normalizedEvents.map((event) => [event.id, event])).values());
    return {
      message,
      routingReceipt: delivery,
      delivery,
      routeDecision: routeDecisionRecord ? {
        route: targetType,
        deliveryMode: String(routeDecisionRecord.mode || routeDecisionRecord.deliveryMode || routeDecisionRecord.delivery_mode || delivery?.deliveryMode || decisionRouteDefaults.mode) as RunnerThreadDeliveryMode,
        recipientParticipantId: targetType !== "none" ? participantIdentity(targetType, targetId) : null,
        runId: String(routeDecisionRecord.runId || routeDecisionRecord.run_id || delivery?.runId || "") || null,
        purpose: String(routeDecisionRecord.intent || routeDecisionRecord.purpose || "") || null,
        reason: String(routeDecisionRecord.reason || "") || null,
        confidence: typeof routeDecisionRecord.confidence === "number" ? routeDecisionRecord.confidence : null,
        deterministic: typeof routeDecisionRecord.deterministic === "boolean"
          ? routeDecisionRecord.deterministic
          : routeDecisionRecord.confidence === 1,
        metadata: {
          raw: routeDecisionRecord,
          rawRoute: rawDecisionRoute || null,
          controlAction: routeDecisionRecord.controlAction || routeDecisionRecord.control_action || null,
        },
      } : null,
      communicator: communicatorMessage ? {
        message: communicatorMessage,
        event: communicatorEvent,
        evidence: communicatorRecord?.evidence,
      } : null,
      control: record.control,
      run: rawRun ? normalizeRunnerThreadRun(rawRun, { threadId: options.threadId }) : null,
      events,
      accepted: typeof record.accepted === "boolean" ? record.accepted : undefined,
      delivered: typeof record.delivered === "boolean" ? record.delivered : undefined,
      effectApplied: typeof record.effectApplied === "boolean" ? record.effectApplied : undefined,
      executionStarted: typeof record.executionStarted === "boolean" ? record.executionStarted : undefined,
      coordinatorRequired: typeof record.coordinatorRequired === "boolean" ? record.coordinatorRequired : undefined,
      limitation: typeof record.limitation === "string" ? record.limitation : null,
    };
  }

  async listThreadRuns(
    options: RunnerApiRequestOptions & {
      threadId: string;
      status?: string;
      parentRunId?: string | null;
      limit?: number;
    },
  ): Promise<RunnerThreadRun[]> {
    const search = new URLSearchParams();
    if (options.status) search.set("status", options.status);
    if (options.parentRunId) search.set("parentRunId", options.parentRunId);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/runs${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return unwrapRunnerThreadList(payload, ["runs"]).map((run) => normalizeRunnerThreadRun(run, { threadId: options.threadId }));
  }

  async listThreadActivityGroups(
    options: RunnerApiRequestOptions & {
      threadId: string;
      runId?: string;
      status?: string;
      after?: number;
      limit?: number;
    },
  ): Promise<RunnerThreadActivityGroup[]> {
    const search = new URLSearchParams();
    if (options.runId) search.set("runId", options.runId);
    if (options.status) search.set("status", options.status);
    if (options.after !== undefined) search.set("after", String(options.after));
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/activity-groups${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return unwrapRunnerThreadList(payload, ["activityGroups", "activity_groups", "groups"])
      .map((group) => normalizeRunnerThreadActivityGroup(group, { threadId: options.threadId, runId: options.runId }));
  }

  async listThreadActions(
    options: RunnerApiRequestOptions & {
      threadId: string;
      runId?: string;
      groupId?: string;
      after?: number;
      limit?: number;
    },
  ): Promise<RunnerThreadAction[]> {
    const search = new URLSearchParams();
    if (options.runId) search.set("runId", options.runId);
    if (options.groupId) search.set("groupId", options.groupId);
    if (options.after !== undefined) search.set("after", String(options.after));
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/actions${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return unwrapRunnerThreadList(payload, ["actions", "events"])
      .map((action) => this.normalizeThreadActionListItem(action, options.threadId, options.runId));
  }

  async steerThreadRun(
    options: RunnerApiRequestOptions & {
      threadId: string;
      runId: string;
      steering: RunnerThreadSteeringInput;
    },
  ): Promise<RunnerThreadRunCommandResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/runs/${encodeURIComponent(options.runId)}/steering`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...options.steering,
        ...(options.steering.deliveryMode ? { mode: options.steering.deliveryMode } : {}),
      }),
    });
    return this.normalizeThreadRunCommandResult(payload, options.threadId, options.runId);
  }

  async controlThreadRun(
    options: RunnerApiRequestOptions & {
      threadId: string;
      runId: string;
      control: RunnerThreadControlInput;
    },
  ): Promise<RunnerThreadRunCommandResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/runs/${encodeURIComponent(options.runId)}/control`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.control),
    });
    return this.normalizeThreadRunCommandResult(payload, options.threadId, options.runId);
  }

  async getThreadStepDiff(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      path?: string | null;
    },
  ): Promise<RunnerThreadStepDiffResult> {
    const search = new URLSearchParams();
    if (options.path) search.set("path", options.path);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/diff${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    return this.requestJson<RunnerThreadStepDiffResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listThreadStepFiles(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      prefix?: string | null;
    },
  ): Promise<RunnerSnapshotFileEntry[]> {
    const search = new URLSearchParams();
    if (options.prefix) search.set("prefix", options.prefix);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/files${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerSnapshotFileEntry[] }>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getThreadStepFile(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      path: string;
    },
  ): Promise<RunnerThreadStepFileResult> {
    const search = new URLSearchParams({ path: options.path });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/file?${search.toString()}`,
    );
    return this.requestJson<RunnerThreadStepFileResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listThreadFileHistory(
    options: RunnerApiRequestOptions & {
      threadId: string;
      path: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerThreadFileHistoryResult> {
    const search = new URLSearchParams({ path: options.path });
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/files/history?${search.toString()}`,
    );
    return this.requestJson<RunnerThreadFileHistoryResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async forkThreadFromStep(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      mode: "latest" | "historical";
      title?: string | null;
      environmentName?: string | null;
    },
  ): Promise<RunnerThreadForkResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/fork`,
    );
    return this.requestJson<RunnerThreadForkResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        mode: options.mode,
        title: options.title ?? undefined,
        environmentName: options.environmentName ?? undefined,
      }),
    });
  }

  async forkThreadFromMessage(
    options: RunnerApiRequestOptions & {
      threadId: string;
      truncateAtMessageIndex: number;
      title?: string | null;
      environmentName?: string | null;
      environmentTarget?: "existing_environment" | "new_forked_environment" | null;
      environmentStrategy?: "reuse_current" | "forked_environment" | null;
      targetEnvironmentId?: string | null;
      fileCopyMode?: "all" | "thread_only" | "none" | null;
    },
  ): Promise<RunnerThreadForkResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/copy`,
    );
    return this.requestJson<RunnerThreadForkResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        truncateAtMessageIndex: options.truncateAtMessageIndex,
        title: options.title ?? undefined,
        environmentName: options.environmentName ?? undefined,
        environmentTarget: options.environmentTarget ?? undefined,
        environmentStrategy: options.environmentStrategy ?? undefined,
        targetEnvironmentId: options.targetEnvironmentId ?? undefined,
        fileCopyMode: options.fileCopyMode ?? undefined,
      }),
    });
  }

  async revertThreadToStep(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      historyActionType?: "revert" | "reapply";
      revertedChangeStepId?: string;
      revertedFilePath?: string;
      revertedFileName?: string;
    },
  ): Promise<RunnerThreadRevertResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/revert`,
    );
    return this.requestJson<RunnerThreadRevertResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        historyActionType: options.historyActionType ?? undefined,
        revertedChangeStepId: options.revertedChangeStepId ?? undefined,
        revertedFilePath: options.revertedFilePath ?? undefined,
        revertedFileName: options.revertedFileName ?? undefined,
      }),
    });
  }

  async listEnvironmentSnapshots(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerEnvironmentSnapshot[]> {
    const search = new URLSearchParams();
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerEnvironmentSnapshot[] }>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getEnvironmentSnapshotDiff(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      path?: string | null;
    },
  ): Promise<RunnerEnvironmentSnapshotDiffResult> {
    const search = new URLSearchParams();
    if (options.path) search.set("path", options.path);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/diff${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    return this.requestJson<RunnerEnvironmentSnapshotDiffResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listEnvironmentSnapshotFiles(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      prefix?: string | null;
    },
  ): Promise<RunnerSnapshotFileEntry[]> {
    const search = new URLSearchParams();
    if (options.prefix) search.set("prefix", options.prefix);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/files${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerSnapshotFileEntry[] }>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getEnvironmentSnapshotFile(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      path: string;
    },
  ): Promise<RunnerEnvironmentSnapshotFileResult> {
    const search = new URLSearchParams({ path: options.path });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/file?${search.toString()}`,
    );
    return this.requestJson<RunnerEnvironmentSnapshotFileResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async initializeEnvironmentSnapshots(
    options: RunnerApiRequestOptions & {
      environmentId: string;
    },
  ): Promise<RunnerEnvironmentSnapshotInitializeResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/initialize`,
    );
    return this.requestJson<RunnerEnvironmentSnapshotInitializeResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
  }

  async forkEnvironmentFromSnapshot(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      name?: string | null;
      description?: string | null;
    },
  ): Promise<RunnerEnvironmentForkResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/fork`,
    );
    return this.requestJson<RunnerEnvironmentForkResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        name: options.name ?? undefined,
        description: options.description ?? undefined,
      }),
    });
  }

  async listEnvironmentVersions(
    options: RunnerApiRequestOptions & {
      environmentId: string;
    },
  ): Promise<RunnerEnvironmentVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `/environments/${encodeURIComponent(options.environmentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerEnvironmentVersion>(payload, ["versions", "environmentVersions", "environment_versions", "computerVersions", "computer_versions"]);
  }

  async getEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<RunnerEnvironmentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
  }

  async createEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      version: RunnerEnvironmentVersionCreateInput;
    },
  ): Promise<RunnerEnvironmentVersion> {
    const url = this.buildApiUrl(options.backendUrl, `/environments/${encodeURIComponent(options.environmentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
  }

  async updateEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
      version: RunnerEnvironmentVersionUpdateInput;
    },
  ): Promise<RunnerEnvironmentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
  }

  async saveEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId?: string | null;
      version: RunnerEnvironmentVersionCreateInput;
    },
  ): Promise<RunnerEnvironmentVersionSaveResult> {
    const normalizedVersionId = String(options.versionId || "").trim();
    const basePath = `/environments/${encodeURIComponent(options.environmentId)}/versions`;
    const url = this.buildApiUrl(
      options.backendUrl,
      normalizedVersionId
        ? `${basePath}/${encodeURIComponent(normalizedVersionId)}/publish`
        : basePath,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...options.version,
        ...(!normalizedVersionId ? { publish: true } : {}),
      }),
    });
    const payloadRecord = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as Record<string, unknown>
      : {};
    const rawVersion = [
      payloadRecord.version,
      payloadRecord.environmentVersion,
      payloadRecord.environment_version,
      payloadRecord.computerVersion,
      payloadRecord.computer_version,
    ].find((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
    const version = rawVersion
      ? rawVersion as RunnerEnvironmentVersion
      : normalizedVersionId
        ? {
            id: normalizedVersionId,
            version: 0,
            description: options.version.description,
            snapshot: options.version.snapshot,
          }
        : this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
    const rawEnvironment = [payloadRecord.environment, payloadRecord.computer]
      .find((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
    const environment = rawEnvironment
      ? rawEnvironment as Record<string, unknown>
      : await this.publishEnvironmentVersion({
          ...options,
          versionId: version.id,
          snapshot: options.version.snapshot,
          description: options.version.description,
        });
    return {
      environment,
      version,
      versions: this.readListResponse<RunnerEnvironmentVersion>(payload, ["versions", "environmentVersions", "environment_versions", "computerVersions", "computer_versions"]),
    };
  }

  async deleteEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async publishEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
      snapshot?: RunnerEnvironmentVersionCreateInput["snapshot"];
      description?: RunnerEnvironmentVersionCreateInput["description"];
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
        ...(options.description !== undefined ? { description: options.description } : {}),
      }),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["environment", "computer"]);
  }

  async unpublishEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}/unpublish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["environment", "computer"]);
  }

  async restoreEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}/restore`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["environment", "computer"]);
  }

  async compareEnvironmentVersions(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerEnvironmentVersionCompareResult> {
    const search = new URLSearchParams({
      baseVersionId: options.baseVersionId,
      targetVersionId: options.targetVersionId,
    });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/compare?${search.toString()}`,
    );
    return this.requestJson<RunnerEnvironmentVersionCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listServerVersions(
    options: RunnerApiRequestOptions & {
      serverId: string;
    },
  ): Promise<RunnerServerVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `/servers/${encodeURIComponent(options.serverId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerServerVersion>(payload, ["versions", "serverVersions", "server_versions"]);
  }

  async getServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<RunnerServerVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
  }

  async createServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      version: RunnerServerVersionCreateInput;
    },
  ): Promise<RunnerServerVersion> {
    const url = this.buildApiUrl(options.backendUrl, `/servers/${encodeURIComponent(options.serverId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
  }

  async updateServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
      version: RunnerServerVersionUpdateInput;
    },
  ): Promise<RunnerServerVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
  }

  async saveServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId?: string | null;
      version: RunnerServerVersionCreateInput;
    },
  ): Promise<RunnerServerVersionSaveResult> {
    const normalizedVersionId = String(options.versionId || "").trim();
    const basePath = `/servers/${encodeURIComponent(options.serverId)}/versions`;
    const url = this.buildApiUrl(
      options.backendUrl,
      normalizedVersionId
        ? `${basePath}/${encodeURIComponent(normalizedVersionId)}/publish`
        : basePath,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...options.version,
        ...(!normalizedVersionId ? { publish: true } : {}),
      }),
    });
    const payloadRecord = payload && typeof payload === "object" && !Array.isArray(payload)
      ? payload as Record<string, unknown>
      : {};
    const rawVersion = [
      payloadRecord.version,
      payloadRecord.serverVersion,
      payloadRecord.server_version,
    ].find((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate));
    const version = rawVersion
      ? rawVersion as RunnerServerVersion
      : normalizedVersionId
        ? {
            id: normalizedVersionId,
            version: 0,
            description: options.version.description,
            snapshot: options.version.snapshot,
          }
        : this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
    const rawServer = payloadRecord.server;
    const server = rawServer && typeof rawServer === "object" && !Array.isArray(rawServer)
      ? rawServer as Record<string, unknown>
      : await this.publishServerVersion({
          ...options,
          versionId: version.id,
          snapshot: options.version.snapshot,
          description: options.version.description,
        });
    return {
      server,
      version,
      versions: this.readListResponse<RunnerServerVersion>(payload, ["versions", "serverVersions", "server_versions"]),
    };
  }

  async deleteServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async publishServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
      snapshot?: RunnerServerVersionCreateInput["snapshot"];
      description?: RunnerServerVersionCreateInput["description"];
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
        ...(options.description !== undefined ? { description: options.description } : {}),
      }),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["server"]);
  }

  async unpublishServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}/unpublish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["server"]);
  }

  async restoreServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}/restore`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["server"]);
  }

  async compareServerVersions(
    options: RunnerApiRequestOptions & {
      serverId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerServerVersionCompareResult> {
    const search = new URLSearchParams({
      baseVersionId: options.baseVersionId,
      targetVersionId: options.targetVersionId,
    });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/compare?${search.toString()}`,
    );
    return this.requestJson<RunnerServerVersionCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listAgents(options: RunnerApiRequestOptions): Promise<RunnerAgentRecord[]> {
    const url = this.buildApiUrl(options.backendUrl, "/agents");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerAgentRecord>(payload, ["agents"]);
  }

  async getAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async createAgent(
    options: RunnerApiRequestOptions & {
      agent: RunnerAgentCreateInput;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, "/agents");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.agent),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async updateAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
      agent: RunnerAgentUpdateInput;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.agent),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async deleteAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listVoiceAgents(options: RunnerApiRequestOptions): Promise<RunnerVoiceAgentRecord[]> {
    const url = this.buildApiUrl(options.backendUrl, "/voice-agents");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerVoiceAgentRecord>(payload, ["voiceAgents", "voice_agents"]);
  }

  async getVoiceAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async updateVoiceAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
      voice: RunnerAgentUpdateInput;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.voice),
    });
  }

  async provisionVoiceAgentPhoneNumber(
    options: RunnerApiRequestOptions & {
      agentId: string;
      phoneNumber?: RunnerVoiceAgentPhoneNumberInput;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}/phone-number`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.phoneNumber || {}),
    });
  }

  async disableVoiceAgentPhoneNumber(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}/phone-number`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async createVoiceAgentSession(
    options: RunnerApiRequestOptions & {
      agentId: string;
      session?: RunnerVoiceAgentSessionCreateInput;
    },
  ): Promise<RunnerVoiceAgentSessionCreateResult> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}/sessions`);
    return this.requestJson<RunnerVoiceAgentSessionCreateResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.session || {}),
    });
  }

  async appendVoiceAgentSessionMessage(
    options: RunnerApiRequestOptions & {
      sessionId: string;
      role: "user" | "assistant";
      content: string;
      event?: Record<string, unknown> | null;
    },
  ): Promise<{ created: boolean }> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/sessions/${encodeURIComponent(options.sessionId)}/messages`);
    return this.requestJson<{ created: boolean }>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({ role: options.role, content: options.content, event: options.event || null }),
    });
  }

  async endVoiceAgentSession(
    options: RunnerApiRequestOptions & {
      sessionId: string;
    },
  ): Promise<RunnerVoiceSession> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/sessions/${encodeURIComponent(options.sessionId)}/end`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerVoiceSession>(payload, ["voiceSession", "voice_session"]);
  }

  async listVoiceAgentSessions(
    options: RunnerApiRequestOptions & {
      agentId?: string;
      threadId?: string;
      channel?: "web" | "phone";
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerVoiceSession[]> {
    const search = new URLSearchParams();
    if (options.agentId) search.set("agentId", options.agentId);
    if (options.threadId) search.set("threadId", options.threadId);
    if (options.channel) search.set("channel", options.channel);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/sessions${suffix}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerVoiceSession>(payload, ["voiceSessions", "voice_sessions"]);
  }

  async listAgentVersions(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerAgentVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerAgentVersion>(payload, ["versions", "agentVersions", "agent_versions"]);
  }

  async getAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<RunnerAgentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerAgentVersion>(payload, ["version", "agentVersion", "agent_version"]);
  }

  async createAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      version: RunnerAgentVersionCreateInput;
    },
  ): Promise<RunnerAgentVersion> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerAgentVersion>(payload, ["version", "agentVersion", "agent_version"]);
  }

  async updateAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
      version: RunnerAgentVersionUpdateInput;
    },
  ): Promise<RunnerAgentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerAgentVersion>(payload, ["version", "agentVersion", "agent_version"]);
  }

  async deleteAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async publishAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
      snapshot?: RunnerAgentVersionCreateInput["snapshot"];
      description?: RunnerAgentVersionCreateInput["description"];
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
        ...(options.description !== undefined ? { description: options.description } : {}),
      }),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async unpublishAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}/unpublish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async restoreAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}/restore`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async compareAgentVersions(
    options: RunnerApiRequestOptions & {
      agentId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerAgentVersionCompareResult> {
    const search = new URLSearchParams({
      baseVersionId: options.baseVersionId,
      targetVersionId: options.targetVersionId,
    });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/compare?${search.toString()}`,
    );
    return this.requestJson<RunnerAgentVersionCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listGuardrails(options: RunnerApiRequestOptions): Promise<RunnerGuardrailSet[]> {
    const url = this.buildApiUrl(options.backendUrl, "/guardrails");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerGuardrailSet>(payload, ["guardrails", "sets"]);
  }

  async getGuardrail(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(options.backendUrl, `/guardrails/${encodeURIComponent(options.guardrailId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async createGuardrail(
    options: RunnerApiRequestOptions & {
      guardrail: RunnerGuardrailSetCreateInput;
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(options.backendUrl, "/guardrails");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.guardrail),
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async updateGuardrail(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      guardrail: RunnerGuardrailSetUpdateInput;
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(options.backendUrl, `/guardrails/${encodeURIComponent(options.guardrailId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.guardrail),
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async deleteGuardrail(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/guardrails/${encodeURIComponent(options.guardrailId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listAgentGuardrails(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerGuardrailSet[]> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/guardrails`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerGuardrailSet>(payload, ["guardrails", "sets"]);
  }

  async setAgentGuardrails(
    options: RunnerApiRequestOptions & {
      agentId: string;
      guardrailSetIds: string[];
      guardrails?: RunnerGuardrailSet[];
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/guardrails`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PUT",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        guardrailSetIds: options.guardrailSetIds,
        guardrail_set_ids: options.guardrailSetIds,
        ...(options.guardrails ? { guardrails: options.guardrails } : {}),
      }),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async addAgentGuardrail(
    options: RunnerApiRequestOptions & {
      agentId: string;
      guardrailId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/guardrails/${encodeURIComponent(options.guardrailId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PUT",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async removeAgentGuardrail(
    options: RunnerApiRequestOptions & {
      agentId: string;
      guardrailId: string;
    },
  ): Promise<RunnerAgentRecord | null> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/guardrails/${encodeURIComponent(options.guardrailId)}`,
    );
    const payload = await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return payload ? this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]) : null;
  }

  async listGuardrailVersions(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
    },
  ): Promise<RunnerGuardrailVersion[]> {
    return this.listResourceVersions<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      ["versions", "guardrailVersions", "guardrail_versions"],
    );
  }

  async getGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<RunnerGuardrailVersion> {
    return this.getResourceVersion<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      ["version", "guardrailVersion", "guardrail_version"],
    );
  }

  async createGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      version: RunnerGuardrailVersionCreateInput;
    },
  ): Promise<RunnerGuardrailVersion> {
    return this.createResourceVersion<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.version,
      ["version", "guardrailVersion", "guardrail_version"],
    );
  }

  async updateGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
      version: RunnerGuardrailVersionUpdateInput;
    },
  ): Promise<RunnerGuardrailVersion> {
    return this.updateResourceVersion<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      options.version,
      ["version", "guardrailVersion", "guardrail_version"],
    );
  }

  async deleteGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<void> {
    await this.deleteResourceVersion(options, `/guardrails/${encodeURIComponent(options.guardrailId)}`, options.versionId);
  }

  async publishGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
      snapshot?: RunnerGuardrailVersionCreateInput["snapshot"];
      description?: RunnerGuardrailVersionCreateInput["description"];
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/guardrails/${encodeURIComponent(options.guardrailId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
        ...(options.description !== undefined ? { description: options.description } : {}),
      }),
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async unpublishGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<RunnerGuardrailSet> {
    return this.actionResourceVersion<RunnerGuardrailSet>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      "unpublish",
      ["guardrail", "set"],
    );
  }

  async restoreGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<RunnerGuardrailSet> {
    return this.actionResourceVersion<RunnerGuardrailSet>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      "restore",
      ["guardrail", "set"],
    );
  }

  async compareGuardrailVersions(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerGuardrailVersionCompareResult> {
    return this.compareResourceVersions<RunnerGuardrailVersionCompareResult>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.baseVersionId,
      options.targetVersionId,
    );
  }

  async listEvaluations(
    options: RunnerApiRequestOptions & {
      q?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerEvaluationSet[]> {
    const search = new URLSearchParams();
    if (options.q) search.set("q", options.q);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/evaluations${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerEvaluationSet>(payload, ["evaluations", "sets"]);
  }

  async getEvaluation(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
    },
  ): Promise<RunnerEvaluationSet> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(options.evaluationId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerEvaluationSet>(payload, ["evaluation", "set"]);
  }

  async createEvaluation(
    options: RunnerApiRequestOptions & {
      evaluation: RunnerEvaluationSetCreateInput;
    },
  ): Promise<RunnerEvaluationSet> {
    const url = this.buildApiUrl(options.backendUrl, "/evaluations");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.evaluation),
    });
    return this.readObjectResponse<RunnerEvaluationSet>(payload, ["evaluation", "set"]);
  }

  async updateEvaluation(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      evaluation: RunnerEvaluationSetUpdateInput;
    },
  ): Promise<RunnerEvaluationSet> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(options.evaluationId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.evaluation),
    });
    return this.readObjectResponse<RunnerEvaluationSet>(payload, ["evaluation", "set"]);
  }

  async deleteEvaluation(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(options.evaluationId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async runEvaluation(
    options: RunnerApiRequestOptions & {
      run: RunnerEvaluationRunCreateInput;
    },
  ): Promise<RunnerEvaluationRun> {
    const { evaluationId, computerId, environmentId, ...run } = options.run;
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(evaluationId)}/runs`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...run,
        environmentId: environmentId ?? computerId,
      }),
    });
    return this.readObjectResponse<RunnerEvaluationRun>(payload, ["run"]);
  }

  async listEvaluationRuns(
    options: RunnerApiRequestOptions & {
      evaluationId?: string;
      agentId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerEvaluationRun[]> {
    const search = new URLSearchParams();
    if (options.evaluationId) search.set("evaluationId", options.evaluationId);
    if (options.agentId) search.set("agentId", options.agentId);
    if (options.status) search.set("status", options.status);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/runs${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerEvaluationRun>(payload, ["runs"]);
  }

  async getEvaluationRun(
    options: RunnerApiRequestOptions & {
      runId: string;
    },
  ): Promise<RunnerEvaluationRun> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/runs/${encodeURIComponent(options.runId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerEvaluationRun>(payload, ["run"]);
  }

  async listEvaluationVersions(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
    },
  ): Promise<RunnerEvaluationVersion[]> {
    return this.listResourceVersions<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      ["versions", "evaluationVersions", "evaluation_versions"],
    );
  }

  async getEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<RunnerEvaluationVersion> {
    return this.getResourceVersion<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      ["version", "evaluationVersion", "evaluation_version"],
    );
  }

  async createEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      version: RunnerEvaluationVersionCreateInput;
    },
  ): Promise<RunnerEvaluationVersion> {
    return this.createResourceVersion<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.version,
      ["version", "evaluationVersion", "evaluation_version"],
    );
  }

  async updateEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
      version: RunnerEvaluationVersionUpdateInput;
    },
  ): Promise<RunnerEvaluationVersion> {
    return this.updateResourceVersion<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      options.version,
      ["version", "evaluationVersion", "evaluation_version"],
    );
  }

  async deleteEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<void> {
    await this.deleteResourceVersion(options, `/evaluations/${encodeURIComponent(options.evaluationId)}`, options.versionId);
  }

  async publishEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
      snapshot?: RunnerEvaluationVersionCreateInput["snapshot"];
    },
  ): Promise<RunnerEvaluationSet> {
    return this.actionResourceVersion<RunnerEvaluationSet>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      "publish",
      ["evaluation", "set"],
    );
  }

  async unpublishEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<RunnerEvaluationSet> {
    return this.actionResourceVersion<RunnerEvaluationSet>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      "unpublish",
      ["evaluation", "set"],
    );
  }

  async restoreEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<RunnerEvaluationSet> {
    return this.actionResourceVersion<RunnerEvaluationSet>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      "restore",
      ["evaluation", "set"],
    );
  }

  async compareEvaluationVersions(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerEvaluationVersionCompareResult> {
    return this.compareResourceVersions<RunnerEvaluationVersionCompareResult>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.baseVersionId,
      options.targetVersionId,
    );
  }

  async listFineTuningJobs(
    options: RunnerApiRequestOptions & {
      agentId?: string;
      evaluationSetId?: string;
      status?: string;
      q?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerFineTuningJob[]> {
    const search = new URLSearchParams();
    if (options.agentId) search.set("agentId", options.agentId);
    if (options.evaluationSetId) search.set("evaluationSetId", options.evaluationSetId);
    if (options.status) search.set("status", options.status);
    if (options.q) search.set("q", options.q);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerFineTuningJob>(payload, ["jobs"]);
  }

  async getFineTuningJob(
    options: RunnerApiRequestOptions & {
      jobId: string;
    },
  ): Promise<RunnerFineTuningJob> {
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs/${encodeURIComponent(options.jobId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerFineTuningJob>(payload, ["job"]);
  }

  async createFineTuningJob(
    options: RunnerApiRequestOptions & {
      job: RunnerFineTuningJobCreateInput;
    },
  ): Promise<RunnerFineTuningJob> {
    const { computerId, environmentId, ...job } = options.job;
    const url = this.buildApiUrl(options.backendUrl, "/fine-tuning/jobs");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...job,
        environmentId: environmentId ?? computerId,
      }),
    });
    return this.readObjectResponse<RunnerFineTuningJob>(payload, ["job"]);
  }

  async cancelFineTuningJob(
    options: RunnerApiRequestOptions & {
      jobId: string;
    },
  ): Promise<RunnerFineTuningJob> {
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs/${encodeURIComponent(options.jobId)}/cancel`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerFineTuningJob>(payload, ["job"]);
  }

  async deleteFineTuningJob(
    options: RunnerApiRequestOptions & {
      jobId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs/${encodeURIComponent(options.jobId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listMetronomes(
    options: RunnerApiRequestOptions & {
      projectId?: string | null;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerMetronomeWorkflow[]> {
    const search = new URLSearchParams();
    if (options.projectId) search.set("projectId", options.projectId);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/metronomes${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerMetronomeWorkflow>(payload, ["metronomes", "workflows", "schedules"]);
  }

  async getMetronome(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
    },
  ): Promise<RunnerMetronomeWorkflow> {
    const url = this.buildApiUrl(options.backendUrl, `/metronomes/${encodeURIComponent(options.metronomeId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerMetronomeWorkflow>(payload, ["metronome", "workflow"]);
  }

  async createMetronome(
    options: RunnerApiRequestOptions & {
      workflow: RunnerMetronomeWorkflowCreateInput;
    },
  ): Promise<RunnerMetronomeWorkflow> {
    const url = this.buildApiUrl(options.backendUrl, "/metronomes");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.workflow),
    });
    return this.readObjectResponse<RunnerMetronomeWorkflow>(payload, ["metronome", "workflow"]);
  }

  async updateMetronome(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      workflow: RunnerMetronomeWorkflowUpdateInput;
    },
  ): Promise<RunnerMetronomeWorkflow> {
    const url = this.buildApiUrl(options.backendUrl, `/metronomes/${encodeURIComponent(options.metronomeId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.workflow),
    });
    return this.readObjectResponse<RunnerMetronomeWorkflow>(payload, ["metronome", "workflow"]);
  }

  async deleteMetronome(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/metronomes/${encodeURIComponent(options.metronomeId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listMetronomeRuns(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerMetronomeRun[]> {
    const search = new URLSearchParams();
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/metronomes/${encodeURIComponent(options.metronomeId)}/runs${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerMetronomeRun>(payload, ["runs", "metronomeRuns", "metronome_runs"]);
  }

  async createMetronomeRun(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      run?: RunnerMetronomeRunCreateInput;
    },
  ): Promise<RunnerMetronomeRun> {
    const url = this.buildApiUrl(options.backendUrl, `/metronomes/${encodeURIComponent(options.metronomeId)}/runs`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.run ?? {}),
    });
    return this.readObjectResponse<RunnerMetronomeRun>(payload, ["run", "metronomeRun", "metronome_run"]);
  }

  async triggerMetronomeFunction(
    options: RunnerApiRequestOptions & RunnerMetronomeFunctionTriggerInvokeInput,
  ): Promise<RunnerMetronomeRun> {
    const trigger = String(options.trigger || "function").trim() || "function";
    const endpointUrl = typeof options.endpointUrl === "string" && /^https?:\/\//i.test(options.endpointUrl)
      ? options.endpointUrl
      : "";
    if (!endpointUrl && !options.metronomeId) {
      throw new Error("triggerMetronomeFunction requires either endpointUrl or metronomeId.");
    }
    const url = endpointUrl || this.buildApiUrl(
      options.backendUrl,
      `/metronomes/${encodeURIComponent(String(options.metronomeId || ""))}/triggers/function/${encodeURIComponent(trigger)}`,
    );
    const headers = this.withJsonContentType(options.headers, options.organizationId);
    if (options.apiKey) {
      const normalizedHeaders = new Headers(headers);
      if (!normalizedHeaders.has("X-API-Key")) normalizedHeaders.set("X-API-Key", options.apiKey);
      if (!normalizedHeaders.has("Authorization")) normalizedHeaders.set("Authorization", `Bearer ${options.apiKey}`);
      const payload = await this.requestJson<unknown>(url, {
        method: "POST",
        headers: normalizedHeaders,
        credentials: options.credentials,
        signal: options.signal,
        body: JSON.stringify(options.payload ?? {}),
      });
      return this.readObjectResponse<RunnerMetronomeRun>(payload, ["run", "metronomeRun", "metronome_run"]);
    }
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers,
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.payload ?? {}),
    });
    return this.readObjectResponse<RunnerMetronomeRun>(payload, ["run", "metronomeRun", "metronome_run"]);
  }

  async getMetronomeRun(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      runId: string;
    },
  ): Promise<RunnerMetronomeRun> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/metronomes/${encodeURIComponent(options.metronomeId)}/runs/${encodeURIComponent(options.runId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerMetronomeRun>(payload, ["run", "metronomeRun", "metronome_run"]);
  }

  async deleteMetronomeRun(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      runId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/metronomes/${encodeURIComponent(options.metronomeId)}/runs/${encodeURIComponent(options.runId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listMetronomeVersions(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
    },
  ): Promise<RunnerMetronomeVersion[]> {
    return this.listResourceVersions<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      ["versions", "metronomeVersions", "metronome_versions", "workflowVersions", "workflow_versions"],
    );
  }

  async getMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<RunnerMetronomeVersion> {
    return this.getResourceVersion<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      ["version", "metronomeVersion", "metronome_version", "workflowVersion", "workflow_version"],
    );
  }

  async createMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      version: RunnerMetronomeVersionCreateInput;
    },
  ): Promise<RunnerMetronomeVersion> {
    return this.createResourceVersion<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.version,
      ["version", "metronomeVersion", "metronome_version", "workflowVersion", "workflow_version"],
    );
  }

  async updateMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
      version: RunnerMetronomeVersionUpdateInput;
    },
  ): Promise<RunnerMetronomeVersion> {
    return this.updateResourceVersion<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      options.version,
      ["version", "metronomeVersion", "metronome_version", "workflowVersion", "workflow_version"],
    );
  }

  async deleteMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<void> {
    await this.deleteResourceVersion(options, `/metronomes/${encodeURIComponent(options.metronomeId)}`, options.versionId);
  }

  async publishMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
      snapshot?: RunnerMetronomeVersionCreateInput["snapshot"];
    },
  ): Promise<Record<string, unknown>> {
    return this.actionResourceVersion<Record<string, unknown>>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      "publish",
      ["metronome", "workflow"],
    );
  }

  async unpublishMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    return this.actionResourceVersion<Record<string, unknown>>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      "unpublish",
      ["metronome", "workflow"],
    );
  }

  async restoreMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    return this.actionResourceVersion<Record<string, unknown>>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      "restore",
      ["metronome", "workflow"],
    );
  }

  async compareMetronomeVersions(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerMetronomeVersionCompareResult> {
    return this.compareResourceVersions<RunnerMetronomeVersionCompareResult>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.baseVersionId,
      options.targetVersionId,
    );
  }

  private async listResourceVersions<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    collectionKeys: string[],
  ): Promise<TVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<TVersion>(payload, collectionKeys);
  }

  private async getResourceVersion<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    versionId: string,
    objectKeys: string[],
  ): Promise<TVersion> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<TVersion>(payload, objectKeys);
  }

  private async createResourceVersion<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    version: Record<string, unknown>,
    objectKeys: string[],
  ): Promise<TVersion> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(version),
    });
    return this.readObjectResponse<TVersion>(payload, objectKeys);
  }

  private async updateResourceVersion<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    versionId: string,
    version: Record<string, unknown>,
    objectKeys: string[],
  ): Promise<TVersion> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(version),
    });
    return this.readObjectResponse<TVersion>(payload, objectKeys);
  }

  private async deleteResourceVersion(options: RunnerApiRequestOptions, resourcePath: string, versionId: string): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  private async actionResourceVersion<TResource>(
    options: RunnerApiRequestOptions & {
      snapshot?: unknown;
    },
    resourcePath: string,
    versionId: string,
    action: "publish" | "unpublish" | "restore",
    objectKeys: string[],
  ): Promise<TResource> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}/${action}`);
    const body = action === "publish" && options.snapshot !== undefined
      ? { snapshot: options.snapshot }
      : {};
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(body),
    });
    return this.readObjectResponse<TResource>(payload, objectKeys);
  }

  private async compareResourceVersions<TCompareResult>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    baseVersionId: string,
    targetVersionId: string,
  ): Promise<TCompareResult> {
    const search = new URLSearchParams({
      baseVersionId,
      targetVersionId,
    });
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/compare?${search.toString()}`);
    return this.requestJson<TCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  private async resolveRunRequest(options: RunnerExecuteOptions): Promise<RunnerRunRequest> {
    let runRequest = options.run;
    if (!options.prepare) {
      return runRequest;
    }

    const prepareResponse = await this.fetchImpl(options.prepare.url, {
      method: options.prepare.method ?? "POST",
      headers: this.withOrganizationHeader(options.prepare.headers, options.prepare.organizationId ?? options.organizationId),
      body: JSON.stringify(options.prepare.body),
      credentials: options.prepare.credentials,
      signal: options.signal,
    });

    if (!prepareResponse.ok) {
      const bodyText = await prepareResponse.text().catch(() => "");
      throw new Error(`Runner prepare failed (${prepareResponse.status}): ${bodyText || prepareResponse.statusText}`);
    }

    const preparePayload = (await prepareResponse.json().catch(() => ({}))) as unknown;
    const setupLogs = options.prepare.getSetupLogs?.(preparePayload) ?? this.defaultSetupLogs(preparePayload);
    for (const log of setupLogs) {
      options.onLog?.(log);
    }

    runRequest = options.prepare.buildRunRequest?.(preparePayload, runRequest) ?? this.defaultRunRequest(preparePayload, runRequest);
    return runRequest;
  }

  private defaultSetupLogs(payload: unknown): RunnerLog[] {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
    const setupLogs = (payload as Record<string, unknown>).setupLogs;
    if (!Array.isArray(setupLogs)) return [];

    return setupLogs
      .map((entry): RunnerLog | null => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
        const log = entry as Record<string, unknown>;
        return {
          time: typeof log.time === "string" ? log.time : "00:00",
          message: typeof log.message === "string" ? log.message : "",
          type:
            log.type === "error" || log.type === "success" || log.type === "warning" || log.type === "info"
              ? log.type
              : "info",
          eventType:
            log.eventType === "setup" ||
            log.eventType === "startup" ||
            log.eventType === "planning" ||
            log.eventType === "agent_message" ||
            log.eventType === "reasoning" ||
            log.eventType === "command_execution" ||
            log.eventType === "mcp_tool_call" ||
            log.eventType === "file_change" ||
            log.eventType === "llm_response" ||
            log.eventType === "turn_completed" ||
            log.eventType === "deep_research" ||
            log.eventType === "permission_request"
              ? log.eventType
              : "setup",
        };
      })
      .filter((entry): entry is RunnerLog => Boolean(entry));
  }

  private defaultRunRequest(payload: unknown, currentRunRequest: RunnerRunRequest): RunnerRunRequest {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return currentRunRequest;
    const backendBody = (payload as Record<string, unknown>).backendBody;
    if (backendBody === undefined) return currentRunRequest;
    return { ...currentRunRequest, body: backendBody };
  }

  private normalizeThreadRunCommandResult(
    payload: unknown,
    threadId: string,
    runId: string,
  ): RunnerThreadRunCommandResult {
    const record = unwrapRunnerThreadObject(payload, ["result"]);
    const rawRun = record.run && typeof record.run === "object" && !Array.isArray(record.run)
      ? record.run
      : record.control && typeof record.control === "object" && !Array.isArray(record.control)
        && (record.control as Record<string, unknown>).run
        && typeof (record.control as Record<string, unknown>).run === "object"
        && !Array.isArray((record.control as Record<string, unknown>).run)
          ? (record.control as Record<string, unknown>).run
          : null;
    const rawEvent = record.event && typeof record.event === "object" && !Array.isArray(record.event)
      ? record.event
      : record.control && typeof record.control === "object" && !Array.isArray(record.control)
        && (record.control as Record<string, unknown>).event
        && typeof (record.control as Record<string, unknown>).event === "object"
        && !Array.isArray((record.control as Record<string, unknown>).event)
          ? (record.control as Record<string, unknown>).event
          : null;
    const rawReceipt = record.routingReceipt && typeof record.routingReceipt === "object" && !Array.isArray(record.routingReceipt)
      ? record.routingReceipt
      : record.receipt && typeof record.receipt === "object" && !Array.isArray(record.receipt)
        ? record.receipt
        : record.delivery && typeof record.delivery === "object" && !Array.isArray(record.delivery)
          ? record.delivery
          : null;
    return {
      run: rawRun ? normalizeRunnerThreadRun(rawRun, { threadId, runId }) : null,
      event: rawEvent ? normalizeRunnerThreadEvent(rawEvent, { threadId, runId }) : null,
      routingReceipt: rawReceipt ? normalizeRunnerThreadRoutingReceipt(rawReceipt, { threadId, runId }) : null,
      accepted: typeof record.accepted === "boolean" ? record.accepted : undefined,
      delivered: typeof record.delivered === "boolean" ? record.delivered : undefined,
      effectApplied: typeof record.effectApplied === "boolean" ? record.effectApplied : undefined,
      executionStarted: typeof record.executionStarted === "boolean" ? record.executionStarted : undefined,
      coordinatorRequired: typeof record.coordinatorRequired === "boolean" ? record.coordinatorRequired : undefined,
      limitation: typeof record.limitation === "string" ? record.limitation : null,
    };
  }

  private normalizeThreadActionListItem(
    raw: unknown,
    threadId: string,
    runId?: string,
  ): RunnerThreadAction {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return normalizeRunnerThreadAction(raw, { threadId, runId });
    }
    const record = raw as Record<string, unknown>;
    const payload = record.payload && typeof record.payload === "object" && !Array.isArray(record.payload)
      ? record.payload as Record<string, unknown>
      : {};
    const embeddedAction = payload.action && typeof payload.action === "object" && !Array.isArray(payload.action)
      ? payload.action as Record<string, unknown>
      : null;
    if (embeddedAction) {
      return normalizeRunnerThreadAction({
        ...embeddedAction,
        sourceEventId: embeddedAction.sourceEventId || embeddedAction.source_event_id || record.id,
        sequence: embeddedAction.sequence ?? record.sequence,
        createdAt: embeddedAction.createdAt || embeddedAction.created_at || record.occurredAt || record.occurred_at || record.createdAt || record.created_at,
      }, { threadId, runId: runId || (typeof record.runId === "string" ? record.runId : null) });
    }
    const kind = typeof record.kind === "string" ? record.kind : "";
    const isEvent = kind === "event" || (record.payload !== undefined && typeof record.type === "string");
    if (!isEvent) return normalizeRunnerThreadAction(record, { threadId, runId });
    return normalizeRunnerThreadAction({
      id: payload.actionId || payload.action_id || record.id,
      threadId: record.threadId || record.thread_id || threadId,
      runId: record.runId || record.run_id || runId,
      sequence: record.sequence,
      sourceEventId: record.id,
      activityGroupId: payload.activityGroupId || payload.activity_group_id || payload.groupId || payload.group_id,
      type: payload.actionType || payload.action_type || record.type,
      title: payload.title || record.title || payload.toolName || payload.tool_name || record.type || "Action",
      summary: payload.summary || payload.message || record.summary,
      status: payload.status || "completed",
      toolName: payload.toolName || payload.tool_name || payload.tool,
      input: payload.input || payload.args,
      output: payload.output || payload.result,
      permissionRing: record.permissionRing || record.permission_ring || payload.permissionRing || payload.permission_ring,
      policyDecision: record.policyDecision || record.policy_decision || payload.policyDecision || payload.policy_decision,
      touchedResources: payload.touchedResources || payload.touched_resources || payload.resources,
      snapshotBeforeId: record.snapshotBeforeId || record.snapshot_before_id || payload.snapshotBeforeId || payload.snapshot_before_id,
      snapshotAfterId: record.snapshotAfterId || record.snapshot_after_id || payload.snapshotAfterId || payload.snapshot_after_id,
      createdAt: record.occurredAt || record.occurred_at || record.createdAt || record.created_at,
      metadata: { source: "thread_event_projection", event: record },
    }, { threadId, runId });
  }

  private parseEvent(data: string): RawRunnerEvent | null {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      const event = parsed as Record<string, unknown>;
      if (typeof event.type !== "string") return null;
      return event as RawRunnerEvent;
    } catch {
      return null;
    }
  }

  private buildApiUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBaseUrl}${path}`;
  }

  private withOrganizationHeader(headers?: HeadersInit, organizationId?: string | null): Headers {
    const normalized = new Headers(headers ?? {});
    const safeOrganizationId = typeof organizationId === "string" ? organizationId.trim() : "";
    if (safeOrganizationId && !normalized.has(ORGANIZATION_HEADER)) {
      normalized.set(ORGANIZATION_HEADER, safeOrganizationId);
    }
    return normalized;
  }

  private withJsonContentType(headers?: HeadersInit, organizationId?: string | null): HeadersInit {
    const normalized = this.withOrganizationHeader(headers, organizationId);
    if (!normalized.has("Content-Type")) {
      normalized.set("Content-Type", "application/json");
    }
    return normalized;
  }

  private async readResponseErrorMessage(response: Response, fallback: string): Promise<string> {
    const bodyText = await response.text().catch(() => "");
    let parsed: unknown = null;
    try {
      parsed = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const payload = parsed as Record<string, unknown>;
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message.trim();
      }
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error.trim();
      }
    }

    const trimmedBody = bodyText.trim();
    if (trimmedBody) {
      return trimmedBody;
    }

    return `${fallback} (${response.status || "unknown"}${response.statusText ? ` ${response.statusText}` : ""})`;
  }

  private async requestJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImpl(url, init);
    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Runner API request failed"));
    }
    return response.json() as Promise<T>;
  }

  private async requestJsonOrEmpty<T>(url: string, init: RequestInit): Promise<T | null> {
    const response = await this.fetchImpl(url, init);
    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Runner API request failed"));
    }
    const text = await response.text().catch(() => "");
    if (!text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  }

  private readListResponse<T>(payload: unknown, collectionKeys: string[] = []): T[] {
    if (Array.isArray(payload)) {
      return payload as T[];
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return [];
    }
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return record.data as T[];
    }
    if (Array.isArray(record.items)) {
      return record.items as T[];
    }
    for (const key of collectionKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
    return [];
  }

  private readObjectResponse<T>(payload: unknown, objectKeys: string[] = []): T {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      const record = payload as Record<string, unknown>;
      if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
        return record.data as T;
      }
      for (const key of objectKeys) {
        if (record[key] && typeof record[key] === "object" && !Array.isArray(record[key])) {
          return record[key] as T;
        }
      }
    }
    return payload as T;
  }
}
