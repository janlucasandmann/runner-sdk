// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { VoiceAgentRepository } from "../api/voice-agent-repository.js";
import { useVoiceAgentManagement } from "./use-voice-agent-management.js";

function createRepository(): VoiceAgentRepository {
  return {
    list: vi.fn().mockResolvedValue([
      {
        agent: { id: "agent-1", name: "Support", description: "Helps users" },
        voice: {
          mode: "web",
          model: "grok-voice-latest",
          voiceId: "eve",
        },
      },
    ]),
    update: vi.fn().mockResolvedValue({
      agent: { id: "agent-1" },
      voice: { mode: "web_and_phone", voiceId: "ara" },
    }),
    provisionPhoneNumber: vi.fn().mockResolvedValue({
      agent: { id: "agent-1" },
      phoneNumber: { phoneNumber: "+15550001111", status: "active" },
    }),
    disablePhoneNumber: vi.fn().mockResolvedValue({
      agent: { id: "agent-1" },
      phoneNumber: null,
    }),
    createTestSession: vi.fn().mockResolvedValue({
      thread: { id: "thread-1" },
      xai: { realtimeUrl: "wss://voice.example.test/session" },
    }),
  };
}

describe("useVoiceAgentManagement", () => {
  it("loads records, keeps drafts local, and saves the normalized contract", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useVoiceAgentManagement(repository));

    await act(() => result.current.load());
    expect(result.current.rows[0]).toMatchObject({
      id: "agent-1",
      mode: "web",
      voiceId: "eve",
    });

    act(() => {
      result.current.updateDraft(result.current.rows[0], {
        mode: "web_and_phone",
        voiceId: "ara",
        instructions: "Answer briefly.",
      });
    });
    expect(result.current.rows[0]).toMatchObject({
      mode: "web_and_phone",
      voiceId: "ara",
      instructions: "Answer briefly.",
    });

    await act(() => result.current.save(result.current.rows[0]));
    expect(repository.update).toHaveBeenCalledWith("agent-1", {
      voiceMode: "web_and_phone",
      voiceProvider: "xai",
      voiceModel: "grok-voice-latest",
      voiceId: "ara",
      voiceLanguageHint: null,
      voiceInstructions: "Answer briefly.",
    });
    expect(result.current.message).toBe("Voice configuration saved.");
  });

  it("persists configuration before creating a test session", async () => {
    const repository = createRepository();
    const { result } = renderHook(() => useVoiceAgentManagement(repository));
    await act(() => result.current.load());

    await act(() => result.current.test(result.current.rows[0]));

    const updateCallOrder = vi.mocked(repository.update).mock.invocationCallOrder[0];
    const sessionCallOrder = vi.mocked(repository.createTestSession).mock.invocationCallOrder[0];
    expect(updateCallOrder).toBeLessThan(sessionCallOrder);
    expect(result.current.rows[0]).toMatchObject({
      sessionThreadId: "thread-1",
      realtimeUrl: "wss://voice.example.test/session",
    });
    expect(result.current.message).toBe("Web voice session created.");
  });
});
