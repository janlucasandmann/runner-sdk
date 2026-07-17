import { getRunnerPreviewHeaderValue } from "../runner-document-preview.js";
import { sanitizeBackendUrl } from "./api-utils.js";

export const SPEECH_SAMPLE_RATE = 16000;
export const SPEECH_WORKLET_BUFFER_SIZE = 2048;
export const SPEECH_WORKLET_PROCESSOR_NAME = "tb-runner-speech-capture";

export type RunnerChatVoiceMode = "off" | "web" | "phone" | "web_and_phone";
export type RunnerAgentSelectorMode = "agents" | "teams" | "humans";
export type RunnerWorkspaceSelectorMode = "computers" | "projects";
export type RunnerReasoningEffortId = "minimal" | "low" | "medium" | "high";

export function normalizeRunnerChatVoiceMode(value: unknown): RunnerChatVoiceMode {
  const normalized = String(value || "off").trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (normalized === "web_phone") return "web_and_phone";
  if (normalized === "web" || normalized === "phone" || normalized === "web_and_phone") {
    return normalized;
  }
  return "off";
}

export function isRunnerChatWebVoiceMode(mode: unknown): boolean {
  const normalizedMode = normalizeRunnerChatVoiceMode(mode);
  return normalizedMode === "web" || normalizedMode === "web_and_phone";
}

export const RUNNER_CHAT_VOICE_SAMPLE_RATE = 24000;

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

export function float32ToBase64Pcm16(samples: Float32Array): string {
  const pcm16 = new Int16Array(samples.length);
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] || 0));
    pcm16[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return bytesToBase64(new Uint8Array(pcm16.buffer));
}

export function resampleFloat32ToSampleRate(samples: Float32Array, sourceSampleRate: number, targetSampleRate: number): Float32Array {
  if (!samples.length || sourceSampleRate === targetSampleRate) {
    return samples;
  }
  const ratio = sourceSampleRate / targetSampleRate;
  const targetLength = Math.max(1, Math.round(samples.length / ratio));
  const resampled = new Float32Array(targetLength);
  for (let index = 0; index < targetLength; index += 1) {
    const sourceIndex = index * ratio;
    const leftIndex = Math.floor(sourceIndex);
    const rightIndex = Math.min(samples.length - 1, leftIndex + 1);
    const fraction = sourceIndex - leftIndex;
    const left = samples[leftIndex] || 0;
    const right = samples[rightIndex] || left;
    resampled[index] = left + (right - left) * fraction;
  }
  return resampled;
}

export function base64Pcm16ToFloat32(value: string): Float32Array {
  const bytes = base64ToBytes(value);
  const pcm16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));
  const samples = new Float32Array(pcm16.length);
  for (let index = 0; index < pcm16.length; index += 1) {
    samples[index] = pcm16[index] / 32768;
  }
  return samples;
}

export function resolveSpeechToTextUrl(overrideUrl: string | undefined, backendUrl: string, requestHeaders?: HeadersInit): string | null {
  const upstreamUrl = getRunnerPreviewHeaderValue(
    requestHeaders,
    "X-Runner-Upstream-Url",
  );
  const candidate = overrideUrl?.trim() || upstreamUrl || `${sanitizeBackendUrl(backendUrl)}/ws/speech-to-text`;
  if (!candidate) return null;

  try {
    const base = typeof window === "undefined" ? "http://localhost" : window.location.href;
    const url = new URL(candidate, base);
    if (url.protocol === "http:") {
      url.protocol = "ws:";
    } else if (url.protocol === "https:") {
      url.protocol = "wss:";
    }
    if (url.protocol !== "ws:" && url.protocol !== "wss:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

export function combineInputWithTranscript(baseInput: string, transcript: string): string {
  const trimmedTranscript = transcript.trim();
  if (!trimmedTranscript) {
    return baseInput;
  }
  if (!baseInput.trim()) {
    return trimmedTranscript;
  }
  return /\s$/.test(baseInput) ? `${baseInput}${trimmedTranscript}` : `${baseInput} ${trimmedTranscript}`;
}

export function float32ToInt16Pcm(input: Float32Array): Int16Array {
  const pcm = new Int16Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] || 0));
    pcm[index] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
  }
  return pcm;
}

export function downsampleTo16kHz(input: Float32Array, sourceSampleRate: number): Int16Array {
  if (!input.length) {
    return new Int16Array(0);
  }

  if (sourceSampleRate === SPEECH_SAMPLE_RATE) {
    return float32ToInt16Pcm(input);
  }

  const ratio = sourceSampleRate / SPEECH_SAMPLE_RATE;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const pcm = new Int16Array(outputLength);
  let outputIndex = 0;
  let inputIndex = 0;

  while (outputIndex < outputLength) {
    const nextInputIndex = Math.min(input.length, Math.round((outputIndex + 1) * ratio));
    let sum = 0;
    let count = 0;

    while (inputIndex < nextInputIndex) {
      sum += input[inputIndex] || 0;
      count += 1;
      inputIndex += 1;
    }

    const average = count > 0 ? sum / count : input[Math.min(inputIndex, input.length - 1)] || 0;
    const sample = Math.max(-1, Math.min(1, average));
    pcm[outputIndex] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
    outputIndex += 1;
  }

  return pcm;
}

export function encodePcmChunkBase64(chunk: Int16Array): string {
  const bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary);
}

export function calculateRms(input: Float32Array): number {
  if (input.length === 0) return 0;

  let sum = 0;
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index] || 0;
    sum += value * value;
  }

  return Math.sqrt(sum / input.length);
}

export function createSpeechCaptureWorkletUrl(): string {
  const source = `
class PlatformSpeechCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.bufferSize = options.processorOptions?.bufferSize || ${SPEECH_WORKLET_BUFFER_SIZE};
    this.pending = [];
  }

  process(inputs) {
    const input = inputs[0];
    const channel = input && input[0];
    if (!channel || channel.length === 0) {
      return true;
    }

    for (let index = 0; index < channel.length; index += 1) {
      this.pending.push(channel[index]);
    }

    while (this.pending.length >= this.bufferSize) {
      const chunk = new Float32Array(this.pending.slice(0, this.bufferSize));
      this.pending = this.pending.slice(this.bufferSize);
      this.port.postMessage(chunk);
    }

    return true;
  }
}

registerProcessor(${JSON.stringify(SPEECH_WORKLET_PROCESSOR_NAME)}, PlatformSpeechCaptureProcessor);
`;

  return URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
}
