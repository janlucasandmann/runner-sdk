/**
 * Provider-neutral contracts for a realtime communicator.
 *
 * A realtime media session belongs to a thread and a communicator participant;
 * it deliberately does not belong to a worker run. Worker runs are dispatched
 * and steered through short-lived tools, then continue independently.
 */

export type RunnerRealtimeTransport = "webrtc" | "websocket" | "sip" | string;

export type RunnerRealtimeSessionStatus =
  | "idle"
  | "requesting_credential"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "closing"
  | "closed"
  | "failed";

export type RunnerRealtimeTranscriptSpeaker = "human" | "communicator" | "system" | string;

export type RunnerRealtimeTranscriptState = "partial" | "final" | "interrupted";

export type RunnerRealtimeTranscriptSource = "input_audio" | "output_audio" | "text" | string;

export interface RunnerRealtimeTranscriptItem {
  id: string;
  threadId: string;
  mediaSessionId: string;
  provider: string;
  providerItemId?: string | null;
  speaker: RunnerRealtimeTranscriptSpeaker;
  source: RunnerRealtimeTranscriptSource;
  state: RunnerRealtimeTranscriptState;
  text: string;
  revision: number;
  /** Durable thread message created from the final transcript, when available. */
  messageId?: string | null;
  startedAt?: string | null;
  updatedAt: string;
  finalizedAt?: string | null;
  interruptedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeTranscriptStateSnapshot {
  itemsById: Record<string, RunnerRealtimeTranscriptItem>;
  order: string[];
}

/**
 * An ephemeral credential minted by the runner backend. Long-lived provider
 * secrets must never be included in the browser/session configuration.
 */
export interface RunnerRealtimeServerCredential {
  source: "server";
  id: string;
  mediaSessionId: string;
  provider: string;
  value: string;
  issuedAt: string;
  expiresAt: string;
  realtimeUrl?: string | null;
  transport?: RunnerRealtimeTransport | null;
  protocol?: string | null;
  providerSessionConfig?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeCredentialRequest {
  threadId: string;
  communicatorParticipantId: string;
  provider: string;
  /** Stable, privacy-preserving end-user identifier bound by the broker when the provider supports it. */
  safetyIdentifier?: string | null;
  transport?: RunnerRealtimeTransport;
  mediaSessionId?: string | null;
  agentId?: string | null;
  model?: string | null;
  voice?: string | null;
  metadata?: Record<string, unknown> | null;
}

/** Implement this with a backend endpoint that returns an ephemeral credential. */
export interface RunnerRealtimeCredentialBroker {
  requestCredential(request: RunnerRealtimeCredentialRequest): Promise<RunnerRealtimeServerCredential>;
}

export interface RunnerRealtimeBargeInConfig {
  enabled?: boolean;
  /** If true, provider output is interrupted as soon as input speech begins. */
  interruptOnSpeechStarted?: boolean;
}

export interface RunnerRealtimeCommunicatorConfig {
  threadId: string;
  communicatorParticipantId: string;
  provider: string;
  /** Stable, privacy-preserving end-user identifier; never use an email address or raw user ID. */
  safetyIdentifier?: string | null;
  transport?: RunnerRealtimeTransport;
  mediaSessionId?: string | null;
  agentId?: string | null;
  model?: string | null;
  voice?: string | null;
  instructions?: string | null;
  languageHint?: string | null;
  turnDetection?: Record<string, unknown> | null;
  transcription?: Record<string, unknown> | null;
  bargeIn?: RunnerRealtimeBargeInConfig;
  metadata?: Record<string, unknown> | null;
}

export type RunnerRealtimeAudioChunk = ArrayBuffer | ArrayBufferView | Blob;

export interface RunnerRealtimeProviderToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  providerItemId?: string | null;
  requestedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeProviderToolResult {
  callId: string;
  name: string;
  output: unknown;
  isError?: boolean;
  completedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeWorkerDispatchRequest {
  threadId: string;
  instructions: string;
  requestedByParticipantId: string;
  sourceMessageId?: string | null;
  parentRunId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Dispatch acknowledges durable acceptance only. It never waits for the worker
 * to finish, which keeps the realtime conversation responsive.
 */
export interface RunnerRealtimeWorkerDispatchResult {
  kind: "worker.dispatch";
  accepted: boolean;
  runId?: string | null;
  status: string;
  routingReceiptId?: string | null;
  acceptedAt?: string | null;
  currentSummary?: string | null;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeWorkerSteerRequest {
  threadId: string;
  runId: string;
  content: string;
  requestedByParticipantId: string;
  deliveryMode: "checkpoint" | "interrupt";
  sourceMessageId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeWorkerSteerResult {
  kind: "worker.steer";
  accepted: boolean;
  runId: string;
  status: string;
  deliveryMode: "checkpoint" | "interrupt";
  routingReceiptId?: string | null;
  deliveredAtSequence?: number | null;
  acceptedAt?: string | null;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeWorkerControlRequest {
  threadId: string;
  runId: string;
  action: "pause" | "resume" | "park" | "cancel" | "stop";
  requestedByParticipantId: string;
  reason?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeWorkerControlResult {
  kind: "worker.control";
  accepted: boolean;
  runId: string;
  action: RunnerRealtimeWorkerControlRequest["action"];
  status: string;
  eventSequence?: number | null;
  error?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerRealtimeWorkerStatusRequest {
  threadId: string;
  runId?: string | null;
}

export interface RunnerRealtimeWorkerStatusResult {
  kind: "worker.status";
  runs: Array<{
    runId: string;
    status: string;
    currentSummary?: string | null;
    latestSequence?: number | null;
    highestPermissionRing?: 1 | 2 | 3 | null;
  }>;
}

export type RunnerRealtimeWorkerToolResult =
  | RunnerRealtimeWorkerDispatchResult
  | RunnerRealtimeWorkerSteerResult
  | RunnerRealtimeWorkerControlResult
  | RunnerRealtimeWorkerStatusResult;

export interface RunnerRealtimeWorkerToolGateway {
  dispatch(request: RunnerRealtimeWorkerDispatchRequest): Promise<RunnerRealtimeWorkerDispatchResult>;
  steer(request: RunnerRealtimeWorkerSteerRequest): Promise<RunnerRealtimeWorkerSteerResult>;
  control?(request: RunnerRealtimeWorkerControlRequest): Promise<RunnerRealtimeWorkerControlResult>;
  status?(request: RunnerRealtimeWorkerStatusRequest): Promise<RunnerRealtimeWorkerStatusResult>;
}

export interface RunnerRealtimeToolContext {
  threadId: string;
  mediaSessionId: string;
  communicatorParticipantId: string;
  provider: string;
}

export type RunnerRealtimeCommunicatorToolExecutor = (
  call: RunnerRealtimeProviderToolCall,
  context: RunnerRealtimeToolContext,
) => Promise<RunnerRealtimeProviderToolResult>;

export type RunnerRealtimeProviderEvent =
  | {
      type: "session.connected";
      providerSessionId?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "session.reconnecting";
      reason?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "session.closed";
      reason?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "speech.input.started" | "speech.input.stopped" | "speech.output.started" | "speech.output.stopped";
      transcriptId?: string | null;
      providerItemId?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "transcript.delta";
      transcriptId: string;
      speaker: RunnerRealtimeTranscriptSpeaker;
      source: RunnerRealtimeTranscriptSource;
      delta: string;
      updateMode?: "append" | "replace";
      providerItemId?: string | null;
      startedAt?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "transcript.final";
      transcriptId: string;
      speaker: RunnerRealtimeTranscriptSpeaker;
      source: RunnerRealtimeTranscriptSource;
      text: string;
      messageId?: string | null;
      providerItemId?: string | null;
      startedAt?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "transcript.interrupted";
      transcriptId: string;
      text?: string | null;
      providerItemId?: string | null;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "tool.call";
      call: RunnerRealtimeProviderToolCall;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: "error";
      code?: string | null;
      message: string;
      recoverable?: boolean;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
    }
  | {
      type: `provider.${string}`;
      occurredAt?: string | null;
      metadata?: Record<string, unknown> | null;
      [key: string]: unknown;
    };

export type RunnerRealtimeProviderEventListener = (event: RunnerRealtimeProviderEvent) => void;

export interface RunnerRealtimeProviderConnection {
  readonly id: string;
  readonly providerSessionId?: string | null;
  subscribe(listener: RunnerRealtimeProviderEventListener): () => void;
  sendInputAudio(chunk: RunnerRealtimeAudioChunk): void | Promise<void>;
  commitInputAudio?(): void | Promise<void>;
  sendText?(text: string): void | Promise<void>;
  setInputMuted?(muted: boolean): void | Promise<void>;
  submitToolResult(result: RunnerRealtimeProviderToolResult): void | Promise<void>;
  interruptOutput(reason?: string): void | Promise<void>;
  close(reason?: string): void | Promise<void>;
}

export interface RunnerRealtimeProviderConnectInput {
  config: RunnerRealtimeCommunicatorConfig;
  credential: RunnerRealtimeServerCredential;
}

export interface RunnerRealtimeCommunicatorProvider {
  readonly id: string;
  connect(input: RunnerRealtimeProviderConnectInput): Promise<RunnerRealtimeProviderConnection>;
}

export interface RunnerRealtimeCommunicatorSessionSnapshot {
  sessionId: string;
  threadId: string;
  mediaSessionId: string | null;
  communicatorParticipantId: string;
  provider: string;
  providerSessionId?: string | null;
  status: RunnerRealtimeSessionStatus;
  inputSpeechActive: boolean;
  outputSpeechActive: boolean;
  inputMuted: boolean;
  transcripts: RunnerRealtimeTranscriptStateSnapshot;
  lastError?: string | null;
  connectedAt?: string | null;
  closedAt?: string | null;
}

interface RunnerRealtimeSessionEventBase {
  sessionId: string;
  threadId: string;
  mediaSessionId: string | null;
  provider: string;
  occurredAt: string;
}

export type RunnerRealtimeCommunicatorSessionEvent =
  | (RunnerRealtimeSessionEventBase & {
      type: "session.state_changed";
      status: RunnerRealtimeSessionStatus;
      previousStatus: RunnerRealtimeSessionStatus;
      reason?: string | null;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "transcript.updated";
      transcript: RunnerRealtimeTranscriptItem;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "speech.input_started" | "speech.input_stopped" | "speech.output_started" | "speech.output_stopped";
      transcriptId?: string | null;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "speech.output_interrupted";
      reason: "barge_in" | "user_request" | "session_closing" | string;
      transcriptId?: string | null;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "tool.requested";
      call: RunnerRealtimeProviderToolCall;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "tool.completed";
      call: RunnerRealtimeProviderToolCall;
      result: RunnerRealtimeProviderToolResult;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "tool.failed";
      call: RunnerRealtimeProviderToolCall;
      result: RunnerRealtimeProviderToolResult;
      error: string;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "provider.error";
      code?: string | null;
      message: string;
      recoverable: boolean;
    })
  | (RunnerRealtimeSessionEventBase & {
      type: "provider.event";
      event: RunnerRealtimeProviderEvent;
    });

export type RunnerRealtimeCommunicatorSessionListener = (event: RunnerRealtimeCommunicatorSessionEvent) => void;

export interface RunnerRealtimeCommunicatorSession {
  readonly config: RunnerRealtimeCommunicatorConfig;
  connect(): Promise<RunnerRealtimeCommunicatorSessionSnapshot>;
  getSnapshot(): RunnerRealtimeCommunicatorSessionSnapshot;
  subscribe(listener: RunnerRealtimeCommunicatorSessionListener): () => void;
  sendInputAudio(chunk: RunnerRealtimeAudioChunk): Promise<void>;
  commitInputAudio(): Promise<void>;
  sendText(text: string): Promise<void>;
  setInputMuted(muted: boolean): Promise<void>;
  interruptOutput(reason?: string): Promise<void>;
  close(reason?: string): Promise<void>;
}

export interface RunnerRealtimeCommunicatorSessionOptions {
  config: RunnerRealtimeCommunicatorConfig;
  provider: RunnerRealtimeCommunicatorProvider;
  credentialBroker: RunnerRealtimeCredentialBroker;
  toolExecutor?: RunnerRealtimeCommunicatorToolExecutor | null;
  sessionId?: string;
  now?: () => string;
}
