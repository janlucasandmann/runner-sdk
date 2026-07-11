import type {
  RunnerRealtimeAudioChunk,
  RunnerRealtimeCommunicatorSession,
  RunnerRealtimeCommunicatorSessionEvent,
  RunnerRealtimeCommunicatorSessionListener,
  RunnerRealtimeCommunicatorSessionOptions,
  RunnerRealtimeCommunicatorSessionSnapshot,
  RunnerRealtimeCommunicatorToolExecutor,
  RunnerRealtimeProviderConnection,
  RunnerRealtimeProviderEvent,
  RunnerRealtimeProviderToolCall,
  RunnerRealtimeProviderToolResult,
  RunnerRealtimeServerCredential,
  RunnerRealtimeSessionStatus,
  RunnerRealtimeToolContext,
  RunnerRealtimeTranscriptItem,
  RunnerRealtimeTranscriptStateSnapshot,
  RunnerRealtimeWorkerControlRequest,
  RunnerRealtimeWorkerSteerRequest,
  RunnerRealtimeWorkerToolGateway,
} from "./types.js";

type RunnerRealtimeLocalSessionEvent = RunnerRealtimeCommunicatorSessionEvent extends infer Event
  ? Event extends RunnerRealtimeCommunicatorSessionEvent
    ? Omit<Event, "sessionId" | "threadId" | "mediaSessionId" | "provider" | "occurredAt">
    : never
  : never;

export const RUNNER_REALTIME_WORKER_TOOL_NAMES = {
  dispatch: "runner.worker.dispatch",
  steer: "runner.worker.steer",
  control: "runner.worker.control",
  status: "runner.worker.status",
} as const;

export interface RunnerRealtimeTranscriptReducerContext {
  threadId: string;
  mediaSessionId: string;
  provider: string;
  now?: () => string;
}

export function createInitialRunnerRealtimeTranscriptState(): RunnerRealtimeTranscriptStateSnapshot {
  return { itemsById: {}, order: [] };
}

function isoNow(): string {
  return new Date().toISOString();
}

function eventTime(event: RunnerRealtimeProviderEvent, context: RunnerRealtimeTranscriptReducerContext): string {
  return String(event.occurredAt || context.now?.() || isoNow());
}

function isTranscriptEvent(
  event: RunnerRealtimeProviderEvent,
): event is Extract<RunnerRealtimeProviderEvent, { type: "transcript.delta" | "transcript.final" | "transcript.interrupted" }> {
  return event.type === "transcript.delta" || event.type === "transcript.final" || event.type === "transcript.interrupted";
}

/**
 * Applies provider transcript events without coupling transcript completion to
 * a request/response turn. Items can remain partial, become final, or be marked
 * interrupted independently of any worker lifecycle.
 */
export function reduceRunnerRealtimeTranscript(
  state: RunnerRealtimeTranscriptStateSnapshot,
  event: RunnerRealtimeProviderEvent,
  context: RunnerRealtimeTranscriptReducerContext,
): RunnerRealtimeTranscriptStateSnapshot {
  if (!isTranscriptEvent(event)) return state;

  const id = String(event.transcriptId || "").trim();
  if (!id) return state;
  const previous = state.itemsById[id];
  const occurredAt = eventTime(event, context);

  let next: RunnerRealtimeTranscriptItem | null = null;
  if (event.type === "transcript.delta") {
    const updateMode = event.updateMode === "replace" ? "replace" : "append";
    const text = updateMode === "replace"
      ? String(event.delta || "")
      : `${previous?.text || ""}${String(event.delta || "")}`;
    next = {
      id,
      threadId: context.threadId,
      mediaSessionId: context.mediaSessionId,
      provider: context.provider,
      providerItemId: event.providerItemId ?? previous?.providerItemId ?? null,
      speaker: event.speaker,
      source: event.source,
      state: "partial",
      text,
      revision: (previous?.revision || 0) + 1,
      messageId: previous?.messageId ?? null,
      startedAt: event.startedAt ?? previous?.startedAt ?? occurredAt,
      updatedAt: occurredAt,
      metadata: { ...(previous?.metadata || {}), ...(event.metadata || {}) },
    };
  } else if (event.type === "transcript.final") {
    next = {
      id,
      threadId: context.threadId,
      mediaSessionId: context.mediaSessionId,
      provider: context.provider,
      providerItemId: event.providerItemId ?? previous?.providerItemId ?? null,
      speaker: event.speaker,
      source: event.source,
      state: "final",
      text: String(event.text ?? previous?.text ?? ""),
      revision: (previous?.revision || 0) + 1,
      messageId: event.messageId ?? previous?.messageId ?? null,
      startedAt: event.startedAt ?? previous?.startedAt ?? occurredAt,
      updatedAt: occurredAt,
      finalizedAt: occurredAt,
      metadata: { ...(previous?.metadata || {}), ...(event.metadata || {}) },
    };
  } else if (previous) {
    next = {
      ...previous,
      providerItemId: event.providerItemId ?? previous.providerItemId ?? null,
      state: "interrupted",
      text: event.text == null ? previous.text : String(event.text),
      revision: previous.revision + 1,
      updatedAt: occurredAt,
      interruptedAt: occurredAt,
      metadata: { ...(previous.metadata || {}), ...(event.metadata || {}) },
    };
  }

  if (!next) return state;
  return {
    itemsById: { ...state.itemsById, [id]: next },
    order: previous ? state.order : [...state.order, id],
  };
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function nullableString(value: unknown): string | null {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized || null;
}

function requiredString(value: unknown, field: string): string {
  const normalized = nullableString(value);
  if (!normalized) throw new Error(`Realtime worker tool requires ${field}.`);
  return normalized;
}

function normalizeWorkerToolName(name: string): keyof typeof RUNNER_REALTIME_WORKER_TOOL_NAMES | null {
  const normalized = String(name || "").trim().toLowerCase().replace(/[-_]/g, ".");
  if (normalized === "runner.worker.dispatch" || normalized === "worker.dispatch" || normalized === "dispatch.worker") {
    return "dispatch";
  }
  if (normalized === "runner.worker.steer" || normalized === "worker.steer" || normalized === "steer.worker") {
    return "steer";
  }
  if (normalized === "runner.worker.control" || normalized === "worker.control" || normalized === "control.worker") {
    return "control";
  }
  if (normalized === "runner.worker.status" || normalized === "worker.status" || normalized === "get.worker.status") {
    return "status";
  }
  return null;
}

/**
 * Creates the short-lived tool executor used by a realtime communicator. The
 * gateway must acknowledge durable dispatch/steering and must not wait for a
 * worker run to complete.
 */
export function createRunnerRealtimeWorkerToolExecutor(
  gateway: RunnerRealtimeWorkerToolGateway,
): RunnerRealtimeCommunicatorToolExecutor {
  return async (call, context) => {
    const operation = normalizeWorkerToolName(call.name);
    const args = asRecord(call.arguments);
    const idempotencyKey = nullableString(args.idempotencyKey) || `${context.mediaSessionId}:${call.id}`;
    let output: unknown;

    if (operation === "dispatch") {
      output = await gateway.dispatch({
        threadId: context.threadId,
        instructions: requiredString(args.instructions ?? args.task ?? args.message, "instructions"),
        requestedByParticipantId: context.communicatorParticipantId,
        sourceMessageId: nullableString(args.sourceMessageId),
        parentRunId: nullableString(args.parentRunId),
        idempotencyKey,
        metadata: asRecord(args.metadata),
      });
    } else if (operation === "steer") {
      const rawMode = nullableString(args.deliveryMode);
      const deliveryMode: RunnerRealtimeWorkerSteerRequest["deliveryMode"] = rawMode === "interrupt"
        ? "interrupt"
        : "checkpoint";
      output = await gateway.steer({
        threadId: context.threadId,
        runId: requiredString(args.runId, "runId"),
        content: requiredString(args.content ?? args.message ?? args.instructions, "content"),
        requestedByParticipantId: context.communicatorParticipantId,
        deliveryMode,
        sourceMessageId: nullableString(args.sourceMessageId),
        idempotencyKey,
        metadata: asRecord(args.metadata),
      });
    } else if (operation === "control") {
      if (!gateway.control) throw new Error("Realtime worker control is not configured.");
      const action = requiredString(args.action, "action") as RunnerRealtimeWorkerControlRequest["action"];
      if (!["pause", "resume", "park", "cancel", "stop"].includes(action)) {
        throw new Error(`Unsupported realtime worker control action: ${action}`);
      }
      output = await gateway.control({
        threadId: context.threadId,
        runId: requiredString(args.runId, "runId"),
        action,
        requestedByParticipantId: context.communicatorParticipantId,
        reason: nullableString(args.reason),
        idempotencyKey,
        metadata: asRecord(args.metadata),
      });
    } else if (operation === "status") {
      if (!gateway.status) throw new Error("Realtime worker status is not configured.");
      output = await gateway.status({
        threadId: context.threadId,
        runId: nullableString(args.runId),
      });
    } else {
      throw new Error(`Unsupported realtime communicator tool: ${call.name}`);
    }

    const accepted = !output || typeof output !== "object" || !("accepted" in output)
      ? true
      : (output as { accepted?: unknown }).accepted !== false;
    return {
      callId: call.id,
      name: call.name,
      output,
      isError: !accepted,
    };
  };
}

function cloneSnapshot(snapshot: RunnerRealtimeCommunicatorSessionSnapshot): RunnerRealtimeCommunicatorSessionSnapshot {
  return {
    ...snapshot,
    transcripts: {
      itemsById: { ...snapshot.transcripts.itemsById },
      order: [...snapshot.transcripts.order],
    },
  };
}

function validateCredential(
  credential: RunnerRealtimeServerCredential,
  options: RunnerRealtimeCommunicatorSessionOptions,
  now: () => string,
): void {
  if (credential.source !== "server") throw new Error("Realtime credentials must be issued by the runner backend.");
  if (!credential.value) throw new Error("Realtime credential is empty.");
  if (credential.provider !== options.config.provider || credential.provider !== options.provider.id) {
    throw new Error(`Realtime credential provider mismatch: expected ${options.config.provider}.`);
  }
  if (options.config.mediaSessionId && credential.mediaSessionId !== options.config.mediaSessionId) {
    throw new Error("Realtime credential belongs to a different media session.");
  }
  const expiresAt = Date.parse(credential.expiresAt);
  const current = Date.parse(now());
  if (Number.isFinite(expiresAt) && Number.isFinite(current) && expiresAt <= current) {
    throw new Error("Realtime credential has expired.");
  }
}

class DefaultRunnerRealtimeCommunicatorSession implements RunnerRealtimeCommunicatorSession {
  readonly config: RunnerRealtimeCommunicatorSessionOptions["config"];

  private readonly options: RunnerRealtimeCommunicatorSessionOptions;
  private readonly now: () => string;
  private readonly listeners = new Set<RunnerRealtimeCommunicatorSessionListener>();
  private readonly activeToolCalls = new Set<string>();
  private readonly completedToolCalls = new Set<string>();
  private connection: RunnerRealtimeProviderConnection | null = null;
  private unsubscribeProvider: (() => void) | null = null;
  private connectPromise: Promise<RunnerRealtimeCommunicatorSessionSnapshot> | null = null;
  private lifecycleGeneration = 0;
  private snapshot: RunnerRealtimeCommunicatorSessionSnapshot;

  constructor(options: RunnerRealtimeCommunicatorSessionOptions) {
    if (options.provider.id !== options.config.provider) {
      throw new Error(`Realtime provider mismatch: expected ${options.config.provider}, received ${options.provider.id}.`);
    }
    this.options = options;
    this.config = options.config;
    this.now = options.now || isoNow;
    const sessionId = options.sessionId || `realtime:${options.config.threadId}:${Date.now().toString(36)}`;
    this.snapshot = {
      sessionId,
      threadId: options.config.threadId,
      mediaSessionId: options.config.mediaSessionId || null,
      communicatorParticipantId: options.config.communicatorParticipantId,
      provider: options.config.provider,
      status: "idle",
      inputSpeechActive: false,
      outputSpeechActive: false,
      inputMuted: false,
      transcripts: createInitialRunnerRealtimeTranscriptState(),
    };
  }

  getSnapshot(): RunnerRealtimeCommunicatorSessionSnapshot {
    return cloneSnapshot(this.snapshot);
  }

  subscribe(listener: RunnerRealtimeCommunicatorSessionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async connect(): Promise<RunnerRealtimeCommunicatorSessionSnapshot> {
    if (this.snapshot.status === "connected") return this.getSnapshot();
    if (this.connectPromise) return this.connectPromise;
    if (this.snapshot.status === "closing" || this.snapshot.status === "closed") {
      throw new Error("A closed realtime communicator session cannot reconnect; create a new media session.");
    }

    const generation = ++this.lifecycleGeneration;
    this.connectPromise = this.connectInternal(generation);
    try {
      return await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async connectInternal(generation: number): Promise<RunnerRealtimeCommunicatorSessionSnapshot> {
    try {
      this.setStatus("requesting_credential");
      const credential = await this.options.credentialBroker.requestCredential({
        threadId: this.config.threadId,
        communicatorParticipantId: this.config.communicatorParticipantId,
        provider: this.config.provider,
        safetyIdentifier: this.config.safetyIdentifier,
        transport: this.config.transport,
        mediaSessionId: this.config.mediaSessionId,
        agentId: this.config.agentId,
        model: this.config.model,
        voice: this.config.voice,
        metadata: this.config.metadata,
      });
      if (!this.isConnectionAttemptActive(generation)) {
        throw new Error("Realtime communicator session closed while requesting credentials.");
      }
      validateCredential(credential, this.options, this.now);
      this.snapshot = { ...this.snapshot, mediaSessionId: credential.mediaSessionId };
      this.setStatus("connecting");
      const connection = await this.options.provider.connect({ config: this.config, credential });
      if (!this.isConnectionAttemptActive(generation)) {
        try {
          await connection.close("session_closed_during_connect");
        } catch {
          // The session is already closed; a late provider cleanup failure is non-fatal.
        }
        throw new Error("Realtime communicator session closed while connecting.");
      }
      this.connection = connection;
      const unsubscribeProvider = connection.subscribe((event) => this.handleProviderEvent(event));
      if (!this.isConnectionAttemptActive(generation)) {
        try {
          unsubscribeProvider();
          await connection.close("session_closed_during_connect");
        } catch {
          // A provider that closed synchronously may reject redundant cleanup.
        }
        throw new Error("Realtime communicator session closed while connecting.");
      }
      this.unsubscribeProvider = unsubscribeProvider;
      this.snapshot = {
        ...this.snapshot,
        providerSessionId: connection.providerSessionId || null,
        connectedAt: this.now(),
      };
      this.setStatus("connected");
      return this.getSnapshot();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (this.isConnectionAttemptActive(generation)) {
        this.snapshot = { ...this.snapshot, lastError: message };
        this.setStatus("failed", message);
      }
      throw error;
    }
  }

  async sendInputAudio(chunk: RunnerRealtimeAudioChunk): Promise<void> {
    await this.requireConnection().sendInputAudio(chunk);
  }

  async commitInputAudio(): Promise<void> {
    const connection = this.requireConnection();
    if (connection.commitInputAudio) await connection.commitInputAudio();
  }

  async sendText(text: string): Promise<void> {
    const normalized = String(text || "").trim();
    if (!normalized) return;
    const connection = this.requireConnection();
    if (!connection.sendText) throw new Error(`Realtime provider ${this.config.provider} does not support text input.`);
    await connection.sendText(normalized);
  }

  async setInputMuted(muted: boolean): Promise<void> {
    const connection = this.requireConnection();
    if (connection.setInputMuted) await connection.setInputMuted(muted);
    this.snapshot = { ...this.snapshot, inputMuted: muted };
  }

  async interruptOutput(reason = "user_request"): Promise<void> {
    const connection = this.requireConnection();
    await connection.interruptOutput(reason);
    const wasActive = this.snapshot.outputSpeechActive;
    this.snapshot = { ...this.snapshot, outputSpeechActive: false };
    if (wasActive) this.emit({ type: "speech.output_interrupted", reason });
  }

  async close(reason = "user_request"): Promise<void> {
    if (this.snapshot.status === "closed" || this.snapshot.status === "closing") return;
    this.lifecycleGeneration += 1;
    this.setStatus("closing", reason);
    if (this.snapshot.outputSpeechActive && this.connection) {
      try {
        await this.connection.interruptOutput("session_closing");
      } finally {
        this.snapshot = { ...this.snapshot, outputSpeechActive: false };
        this.emit({ type: "speech.output_interrupted", reason: "session_closing" });
      }
    }
    try {
      if (this.connection) await this.connection.close(reason);
    } finally {
      this.detachProviderConnection();
      this.snapshot = { ...this.snapshot, inputSpeechActive: false, outputSpeechActive: false, closedAt: this.now() };
      this.setStatus("closed", reason);
    }
  }

  private isConnectionAttemptActive(generation: number): boolean {
    return generation === this.lifecycleGeneration
      && this.snapshot.status !== "closing"
      && this.snapshot.status !== "closed";
  }

  private detachProviderConnection(): void {
    try {
      this.unsubscribeProvider?.();
    } catch {
      // Provider listener cleanup must not prevent session teardown.
    }
    this.unsubscribeProvider = null;
    this.connection = null;
  }

  private requireConnection(): RunnerRealtimeProviderConnection {
    if (!this.connection || (this.snapshot.status !== "connected" && this.snapshot.status !== "reconnecting")) {
      throw new Error("Realtime communicator session is not connected.");
    }
    return this.connection;
  }

  private setStatus(status: RunnerRealtimeSessionStatus, reason?: string): void {
    const previousStatus = this.snapshot.status;
    if (previousStatus === status) return;
    this.snapshot = { ...this.snapshot, status };
    this.emit({ type: "session.state_changed", status, previousStatus, reason });
  }

  private emit(
    event: RunnerRealtimeLocalSessionEvent,
    occurredAt?: string | null,
  ): void {
    const enriched = {
      ...event,
      sessionId: this.snapshot.sessionId,
      threadId: this.snapshot.threadId,
      mediaSessionId: this.snapshot.mediaSessionId,
      provider: this.snapshot.provider,
      occurredAt: occurredAt || this.now(),
    } as RunnerRealtimeCommunicatorSessionEvent;
    for (const listener of this.listeners) {
      try {
        listener(enriched);
      } catch {
        // A UI listener must never interfere with the media session.
      }
    }
  }

  private handleProviderEvent(event: RunnerRealtimeProviderEvent): void {
    const occurredAt = event.occurredAt || this.now();
    if (isTranscriptEvent(event) && this.snapshot.mediaSessionId) {
      const transcripts = reduceRunnerRealtimeTranscript(this.snapshot.transcripts, event, {
        threadId: this.snapshot.threadId,
        mediaSessionId: this.snapshot.mediaSessionId,
        provider: this.snapshot.provider,
        now: this.now,
      });
      if (transcripts !== this.snapshot.transcripts) {
        this.snapshot = { ...this.snapshot, transcripts };
        const transcript = transcripts.itemsById[event.transcriptId];
        if (transcript) this.emit({ type: "transcript.updated", transcript }, occurredAt);
      }
      if (event.type === "transcript.interrupted") {
        this.snapshot = { ...this.snapshot, outputSpeechActive: false };
      }
      return;
    }

    if (event.type === "session.connected") {
      this.snapshot = {
        ...this.snapshot,
        providerSessionId: event.providerSessionId || this.snapshot.providerSessionId || null,
      };
      this.setStatus("connected");
      return;
    }
    if (event.type === "session.reconnecting") {
      this.setStatus("reconnecting", event.reason || undefined);
      return;
    }
    if (event.type === "session.closed") {
      this.lifecycleGeneration += 1;
      this.detachProviderConnection();
      this.snapshot = { ...this.snapshot, inputSpeechActive: false, outputSpeechActive: false, closedAt: occurredAt };
      this.setStatus("closed", event.reason || undefined);
      return;
    }
    if (event.type === "speech.input.started") {
      this.snapshot = { ...this.snapshot, inputSpeechActive: true };
      this.emit({ type: "speech.input_started", transcriptId: event.transcriptId || null }, occurredAt);
      if (
        this.snapshot.outputSpeechActive
        && this.config.bargeIn?.enabled !== false
        && this.config.bargeIn?.interruptOnSpeechStarted !== false
        && this.connection
      ) {
        void Promise.resolve(this.connection.interruptOutput("barge_in")).catch((error: unknown) => {
          this.emit({
            type: "provider.error",
            message: error instanceof Error ? error.message : String(error),
            recoverable: true,
          });
        });
        this.snapshot = { ...this.snapshot, outputSpeechActive: false };
        this.emit({ type: "speech.output_interrupted", reason: "barge_in", transcriptId: event.transcriptId || null }, occurredAt);
      }
      return;
    }
    if (event.type === "speech.input.stopped") {
      this.snapshot = { ...this.snapshot, inputSpeechActive: false };
      this.emit({ type: "speech.input_stopped", transcriptId: event.transcriptId || null }, occurredAt);
      return;
    }
    if (event.type === "speech.output.started") {
      this.snapshot = { ...this.snapshot, outputSpeechActive: true };
      this.emit({ type: "speech.output_started", transcriptId: event.transcriptId || null }, occurredAt);
      return;
    }
    if (event.type === "speech.output.stopped") {
      this.snapshot = { ...this.snapshot, outputSpeechActive: false };
      this.emit({ type: "speech.output_stopped", transcriptId: event.transcriptId || null }, occurredAt);
      return;
    }
    if (event.type === "tool.call") {
      if (this.activeToolCalls.has(event.call.id) || this.completedToolCalls.has(event.call.id)) return;
      this.emit({ type: "tool.requested", call: event.call }, occurredAt);
      void this.executeToolCall(event.call);
      return;
    }
    if (event.type === "error") {
      this.snapshot = { ...this.snapshot, lastError: event.message };
      this.emit({
        type: "provider.error",
        code: event.code || null,
        message: event.message,
        recoverable: event.recoverable !== false,
      }, occurredAt);
      if (event.recoverable === false) this.setStatus("failed", event.message);
      return;
    }
    this.emit({ type: "provider.event", event }, occurredAt);
  }

  private async executeToolCall(call: RunnerRealtimeProviderToolCall): Promise<void> {
    this.activeToolCalls.add(call.id);
    const executor = this.options.toolExecutor;
    const context: RunnerRealtimeToolContext = {
      threadId: this.snapshot.threadId,
      mediaSessionId: this.snapshot.mediaSessionId || "",
      communicatorParticipantId: this.snapshot.communicatorParticipantId,
      provider: this.snapshot.provider,
    };
    let result: RunnerRealtimeProviderToolResult;
    try {
      if (!executor) throw new Error(`No realtime tool executor is configured for ${call.name}.`);
      result = await executor(call, context);
      await this.connection?.submitToolResult(result);
      this.emit({ type: "tool.completed", call, result }, result.completedAt);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result = {
        callId: call.id,
        name: call.name,
        output: { error: message },
        isError: true,
        completedAt: this.now(),
      };
      try {
        await this.connection?.submitToolResult(result);
      } finally {
        this.emit({ type: "tool.failed", call, result, error: message }, result.completedAt);
      }
    } finally {
      this.activeToolCalls.delete(call.id);
      this.completedToolCalls.add(call.id);
      if (this.completedToolCalls.size > 500) {
        const oldestCallId = this.completedToolCalls.values().next().value as string | undefined;
        if (oldestCallId) this.completedToolCalls.delete(oldestCallId);
      }
    }
  }
}

export function createRunnerRealtimeCommunicatorSession(
  options: RunnerRealtimeCommunicatorSessionOptions,
): RunnerRealtimeCommunicatorSession {
  return new DefaultRunnerRealtimeCommunicatorSession(options);
}
