import { RUNNER_CHAT_VOICE_SAMPLE_RATE } from "./voice-audio.js";

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export interface RunnerVoiceAgentConfiguration {
  voiceId?: string | null;
  voiceLanguageHint?: string | null;
}

export interface RunnerVoiceSessionRequestOptions {
  threadId?: string | null;
  environmentId?: string | null;
  agentName?: string | null;
}

export interface RunnerVoiceSessionConnection {
  sessionId: string;
  threadId: string;
  realtimeUrl: string;
  websocketProtocol: string;
  sessionUpdate: unknown;
}

export type RunnerVoiceRealtimeEvent =
  | { kind: "audio"; audio: string }
  | {
      kind: "transcript";
      role: "user" | "assistant";
      transcript: string;
      raw: UnknownRecord;
    }
  | { kind: "error"; message: string }
  | { kind: "ignored" };

export const RUNNER_VOICE_MEDIA_CONSTRAINTS: MediaStreamConstraints = Object.freeze({
  audio: Object.freeze({
    channelCount: 1,
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  }),
});

export function buildRunnerVoiceHeaders(
  requestHeaders: HeadersInit | undefined,
  apiKey: string,
): Headers {
  const headers = new Headers(requestHeaders || {});
  headers.set("Content-Type", "application/json");
  const normalizedApiKey = apiKey.trim();
  if (normalizedApiKey) {
    headers.set("X-API-Key", normalizedApiKey);
  }
  return headers;
}

export function buildRunnerVoiceSessionRequest(
  options: RunnerVoiceSessionRequestOptions,
): UnknownRecord {
  const threadId = asString(options.threadId);
  const environmentId = asString(options.environmentId);
  const agentName = asString(options.agentName) || "Agent";
  return {
    ...(threadId ? { threadId } : {}),
    ...(environmentId ? { environmentId } : {}),
    title: `Voice session with ${agentName}`,
  };
}

export function readRunnerVoiceSessionConnection(
  payload: unknown,
  fallbackThreadId: string | null | undefined = "",
): RunnerVoiceSessionConnection {
  const record = asRecord(payload);
  const voiceSession = asRecord(record.voiceSession);
  const thread = asRecord(record.thread);
  const realtime = asRecord(record.xai);
  const sessionId = asString(voiceSession.id) || asString(record.voiceSessionId);
  const threadId = asString(thread.id)
    || asString(voiceSession.threadId)
    || asString(fallbackThreadId);
  const realtimeUrl = asString(realtime.realtimeUrl);
  const websocketProtocol = asString(realtime.websocketProtocol);

  if (!sessionId || !realtimeUrl || !websocketProtocol) {
    throw new Error("Voice session was created without realtime credentials.");
  }

  return {
    sessionId,
    threadId,
    realtimeUrl,
    websocketProtocol,
    sessionUpdate: realtime.sessionUpdate,
  };
}

export function buildRunnerVoiceSessionUpdate(
  sessionUpdatePayload: unknown,
  agent: RunnerVoiceAgentConfiguration | null | undefined,
): UnknownRecord {
  const payloadRecord = asRecord(sessionUpdatePayload);
  const payloadSession = asRecord(payloadRecord.session);
  const payloadAudio = asRecord(payloadSession.audio);
  const payloadAudioInput = asRecord(payloadAudio.input);
  const payloadAudioOutput = asRecord(payloadAudio.output);
  const payloadTranscription = asRecord(payloadAudioInput.transcription);
  const languageHint = asString(agent?.voiceLanguageHint)
    || asString(payloadTranscription.language_hint);

  return {
    type: "session.update",
    session: {
      ...payloadSession,
      voice: asString(payloadSession.voice)
        || asString(agent?.voiceId)
        || "eve",
      turn_detection: payloadSession.turn_detection || { type: "server_vad" },
      audio: {
        ...payloadAudio,
        input: {
          ...payloadAudioInput,
          format: {
            type: "audio/pcm",
            rate: RUNNER_CHAT_VOICE_SAMPLE_RATE,
          },
          transcription: {
            model: "grok-transcribe",
            ...payloadTranscription,
            ...(languageHint ? { language_hint: languageHint } : {}),
          },
        },
        output: {
          ...payloadAudioOutput,
          format: {
            type: "audio/pcm",
            rate: RUNNER_CHAT_VOICE_SAMPLE_RATE,
          },
        },
      },
    },
  };
}

export function buildRunnerVoiceAudioAppendEvent(audio: string): UnknownRecord {
  return {
    type: "input_audio_buffer.append",
    audio,
  };
}

export function parseRunnerVoiceRealtimeEvent(
  event: unknown,
): RunnerVoiceRealtimeEvent {
  const record = asRecord(event);
  const type = asString(record.type);
  if (type === "response.output_audio.delta") {
    const audio = asString(record.delta) || asString(record.audio);
    return audio ? { kind: "audio", audio } : { kind: "ignored" };
  }
  if (type === "conversation.item.input_audio_transcription.completed") {
    return {
      kind: "transcript",
      role: "user",
      transcript: asString(record.transcript),
      raw: record,
    };
  }
  if (type === "response.output_audio_transcript.done") {
    return {
      kind: "transcript",
      role: "assistant",
      transcript: asString(record.transcript),
      raw: record,
    };
  }
  if (type === "error") {
    const error = asRecord(record.error);
    return {
      kind: "error",
      message: asString(error.message)
        || asString(record.message)
        || "Voice mode error.",
    };
  }
  return { kind: "ignored" };
}
