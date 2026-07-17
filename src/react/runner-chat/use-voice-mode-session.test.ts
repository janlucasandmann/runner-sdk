// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRunnerVoiceModeSession } from "./use-voice-mode-session.js";

describe("useRunnerVoiceModeSession", () => {
  it("keeps the session idle and reports missing authorization", async () => {
    const onError = vi.fn();
    const { result } = renderHook(() =>
      useRunnerVoiceModeSession({
        agent: {
          id: "agent_1",
          name: "Communicator",
          voiceMode: "web",
        },
        agentId: "agent_1",
        agentName: "Communicator",
        apiKey: "",
        backendUrl: "https://platform.example.test",
        currentThreadId: "thread_1",
        disabled: false,
        environmentId: "environment_1",
        isDictationListening: false,
        isLegacyTranscriptFallback: false,
        isPreparingRun: false,
        onError,
        onLegacyTranscript: vi.fn(),
        onThreadIdChange: vi.fn(),
        stopDictation: vi.fn(async () => undefined),
      }),
    );
    onError.mockClear();

    await act(async () => {
      await result.current.start();
    });

    expect(onError).toHaveBeenCalledWith(
      "Enter an API key to start voice mode.",
    );
    expect(result.current.state.status).toBe("idle");
  });
});
