import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  RunnerVoiceModeControl,
  RunnerVoiceModeStatusBar,
} from "./voice-mode-presentation.js";
import type { RunnerVoiceModeState } from "./use-voice-mode-session.js";

function voiceState(
  overrides: Partial<RunnerVoiceModeState> = {},
): RunnerVoiceModeState {
  return {
    status: "idle",
    error: "",
    sessionId: "",
    threadId: "",
    agentId: "",
    agentName: "Communicator",
    lastUserTranscript: "",
    lastAssistantTranscript: "",
    ...overrides,
  };
}

describe("RunnerVoiceModeControl", () => {
  it("renders a start control for a Web-voice agent", () => {
    const html = renderToStaticMarkup(
      <RunnerVoiceModeControl
        agentVoiceMode="web"
        disabled={false}
        enabled
        onStart={vi.fn()}
        onStop={vi.fn()}
        state={voiceState()}
      />,
    );

    expect(html).toContain('aria-label="Start voice mode"');
    expect(html).toContain("task-voice-button");
  });

  it("keeps the active transcript visible in the status strip", () => {
    const html = renderToStaticMarkup(
      <RunnerVoiceModeStatusBar
        enabled
        onStop={vi.fn()}
        state={voiceState({
          status: "connected",
          lastAssistantTranscript: "The worker is checking the migration.",
        })}
      />,
    );

    expect(html).toContain("Voice mode active");
    expect(html).toContain("The worker is checking the migration.");
    expect(html).toContain(">End</button>");
  });
});
