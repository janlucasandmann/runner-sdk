type UnknownRecord = Record<string, unknown>;

export const RUNNER_SPEECH_QUEUE_LIMIT = 128;
export const RUNNER_SPEECH_ACTIVITY_RMS_THRESHOLD = 0.009;
export const RUNNER_SPEECH_ACTIVITY_HANGOVER_MS = 450;

export type RunnerSpeechClientMessage =
  | { type: "audio"; data: string }
  | { type: "activity-start" | "activity-end" };

export type RunnerSpeechServerEvent =
  | { kind: "ready" }
  | { kind: "transcript"; text: string }
  | { kind: "turn-complete" }
  | { kind: "error"; message: string }
  | { kind: "ignored" };

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as UnknownRecord
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function buildRunnerSpeechSocketUrl(
  baseUrl: string,
  apiKey: string,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("apiKey", apiKey.trim());
  return url.toString();
}

export function parseRunnerSpeechServerEvent(
  payload: unknown,
): RunnerSpeechServerEvent {
  const record = asRecord(payload);
  const type = asString(record.type);
  if (type === "ready") return { kind: "ready" };
  if (type === "transcript" && typeof record.text === "string") {
    return { kind: "transcript", text: record.text };
  }
  if (type === "turn-complete") return { kind: "turn-complete" };
  if (type === "error") {
    return {
      kind: "error",
      message: asString(record.message) || "Speech-to-text failed.",
    };
  }
  return { kind: "ignored" };
}

export function normalizeRunnerSpeechAudioChunk(
  value: unknown,
): Float32Array | null {
  if (value instanceof Float32Array) return value;
  if (value instanceof ArrayBuffer) return new Float32Array(value);
  if (!ArrayBuffer.isView(value)) return null;
  return new Float32Array(
    value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength,
    ),
  );
}

export function appendBoundedRunnerSpeechMessage(
  queue: RunnerSpeechClientMessage[],
  message: RunnerSpeechClientMessage,
  limit = RUNNER_SPEECH_QUEUE_LIMIT,
): void {
  queue.push(message);
  const boundedLimit = Math.max(1, Math.floor(limit));
  if (queue.length > boundedLimit) {
    queue.splice(0, queue.length - boundedLimit);
  }
}
