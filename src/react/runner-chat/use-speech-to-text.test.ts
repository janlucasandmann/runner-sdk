// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useRunnerSpeechToText } from "./use-speech-to-text.js";

describe("useRunnerSpeechToText", () => {
  it("rejects dictation before requesting microphone access without an API key", async () => {
    const onError = vi.fn();
    const onInputChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerSpeechToText({
        apiKey: "",
        backendUrl: "https://platform.example.test",
        input: "",
        onError,
        onInputChange,
      }),
    );

    await act(async () => {
      await result.current.start();
    });

    expect(onError).toHaveBeenCalledWith(
      "Enter an API key to enable speech-to-text.",
    );
    expect(result.current.isListening).toBe(false);
    expect(onInputChange).not.toHaveBeenCalled();
  });
});
