import { describe, expect, it } from "vitest";
import {
  buildRunnerVoiceAudioAppendEvent,
  buildRunnerVoiceHeaders,
  buildRunnerVoiceSessionRequest,
  buildRunnerVoiceSessionUpdate,
  parseRunnerVoiceRealtimeEvent,
  readRunnerVoiceSessionConnection,
} from "./voice-realtime-protocol.js";

describe("runner voice realtime protocol", () => {
  it("builds authenticated JSON headers without mutating the input", () => {
    const input = { "X-Request-Id": "request-1" };
    const headers = buildRunnerVoiceHeaders(input, " secret ");
    expect(headers.get("X-Request-Id")).toBe("request-1");
    expect(headers.get("X-API-Key")).toBe("secret");
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(input).toEqual({ "X-Request-Id": "request-1" });
  });

  it("builds the session request and validates connection credentials", () => {
    expect(buildRunnerVoiceSessionRequest({
      threadId: " thread_1 ",
      environmentId: " env_1 ",
      agentName: " Reviewer ",
    })).toEqual({
      threadId: "thread_1",
      environmentId: "env_1",
      title: "Voice session with Reviewer",
    });
    expect(readRunnerVoiceSessionConnection({
      voiceSession: { id: "voice_1", threadId: "thread_1" },
      xai: {
        realtimeUrl: "wss://voice.example.test",
        websocketProtocol: "realtime",
        sessionUpdate: { session: {} },
      },
    })).toMatchObject({
      sessionId: "voice_1",
      threadId: "thread_1",
      realtimeUrl: "wss://voice.example.test",
      websocketProtocol: "realtime",
    });
    expect(() => readRunnerVoiceSessionConnection({})).toThrow(
      "Voice session was created without realtime credentials.",
    );
  });

  it("merges the backend session template with the selected agent voice", () => {
    expect(buildRunnerVoiceSessionUpdate({
      session: {
        instructions: "Be concise",
        audio: {
          input: {
            transcription: { prompt: "Project vocabulary" },
          },
        },
      },
    }, {
      voiceId: "ara",
      voiceLanguageHint: "de",
    })).toMatchObject({
      type: "session.update",
      session: {
        instructions: "Be concise",
        voice: "ara",
        turn_detection: { type: "server_vad" },
        audio: {
          input: {
            format: { type: "audio/pcm", rate: 24000 },
            transcription: {
              model: "grok-transcribe",
              prompt: "Project vocabulary",
              language_hint: "de",
            },
          },
          output: {
            format: { type: "audio/pcm", rate: 24000 },
          },
        },
      },
    });
  });

  it("decodes realtime events into a small stable domain union", () => {
    expect(parseRunnerVoiceRealtimeEvent({
      type: "response.output_audio.delta",
      delta: "audio-data",
    })).toEqual({ kind: "audio", audio: "audio-data" });
    expect(parseRunnerVoiceRealtimeEvent({
      type: "conversation.item.input_audio_transcription.completed",
      transcript: "hello",
    })).toMatchObject({
      kind: "transcript",
      role: "user",
      transcript: "hello",
    });
    expect(parseRunnerVoiceRealtimeEvent({
      type: "error",
      error: { message: "failed" },
    })).toEqual({ kind: "error", message: "failed" });
    expect(buildRunnerVoiceAudioAppendEvent("pcm")).toEqual({
      type: "input_audio_buffer.append",
      audio: "pcm",
    });
  });
});
