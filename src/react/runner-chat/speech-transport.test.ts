import { describe, expect, it } from "vitest";
import {
  appendBoundedRunnerSpeechMessage,
  buildRunnerSpeechSocketUrl,
  normalizeRunnerSpeechAudioChunk,
  parseRunnerSpeechServerEvent,
  type RunnerSpeechClientMessage,
} from "./speech-transport.js";

describe("runner speech transport", () => {
  it("adds the API key without losing existing websocket query parameters", () => {
    expect(buildRunnerSpeechSocketUrl(
      "wss://speech.example.test/listen?model=fast",
      " secret ",
    )).toBe("wss://speech.example.test/listen?model=fast&apiKey=secret");
  });

  it("projects server messages into stable events", () => {
    expect(parseRunnerSpeechServerEvent({ type: "ready" })).toEqual({
      kind: "ready",
    });
    expect(parseRunnerSpeechServerEvent({
      type: "transcript",
      text: " hello ",
    })).toEqual({ kind: "transcript", text: " hello " });
    expect(parseRunnerSpeechServerEvent({
      type: "error",
      message: "unavailable",
    })).toEqual({ kind: "error", message: "unavailable" });
    expect(parseRunnerSpeechServerEvent({ type: "other" })).toEqual({
      kind: "ignored",
    });
  });

  it("normalizes transferable audio buffers and bounds queued messages", () => {
    const samples = new Float32Array([0.1, 0.2]);
    expect(normalizeRunnerSpeechAudioChunk(samples)).toBe(samples);
    expect(Array.from(normalizeRunnerSpeechAudioChunk(samples.buffer) || []))
      .toEqual(Array.from(samples));

    const queue: RunnerSpeechClientMessage[] = [];
    appendBoundedRunnerSpeechMessage(queue, { type: "activity-start" }, 2);
    appendBoundedRunnerSpeechMessage(queue, { type: "audio", data: "a" }, 2);
    appendBoundedRunnerSpeechMessage(queue, { type: "audio", data: "b" }, 2);
    expect(queue).toEqual([
      { type: "audio", data: "a" },
      { type: "audio", data: "b" },
    ]);
  });
});
