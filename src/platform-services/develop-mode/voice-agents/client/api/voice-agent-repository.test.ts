import { describe, expect, it, vi } from "vitest";

import { createVoiceAgentRepository } from "./voice-agent-repository.js";

describe("voice agent repository", () => {
  it("unwraps voice-agent lists and encodes command identifiers", async () => {
    const get = vi.fn().mockResolvedValue({
      voiceAgents: [{ agent: { id: "agent-1" } }],
    });
    const patch = vi.fn().mockResolvedValue({ agent: { id: "agent-1" } });
    const post = vi.fn().mockResolvedValue({ created: true });
    const remove = vi.fn().mockResolvedValue({ disabled: true });
    const repository = createVoiceAgentRepository({
      get,
      patch,
      post,
      delete: remove,
    });
    const payload = {
      voiceMode: "web",
      voiceProvider: "xai" as const,
      voiceModel: "grok-voice-latest",
      voiceId: "eve",
      voiceLanguageHint: null,
      voiceInstructions: null,
    };

    await expect(repository.list()).resolves.toEqual([{ agent: { id: "agent-1" } }]);
    await repository.update("agent / 1", payload);
    await repository.provisionPhoneNumber("agent / 1");
    await repository.disablePhoneNumber("agent / 1");
    await repository.createTestSession("agent / 1");

    expect(get).toHaveBeenCalledWith("/voice-agents", { signal: undefined });
    expect(patch).toHaveBeenCalledWith("/voice-agents/agents/agent%20%2F%201", payload);
    expect(post).toHaveBeenNthCalledWith(1, "/voice-agents/agents/agent%20%2F%201/phone-number", {
      origin: "xai_provisioned",
    });
    expect(remove).toHaveBeenCalledWith("/voice-agents/agents/agent%20%2F%201/phone-number");
    expect(post).toHaveBeenNthCalledWith(2, "/voice-agents/agents/agent%20%2F%201/sessions", {
      title: "Voice session",
    });
  });

  it("rejects empty identifiers before issuing commands", async () => {
    const patch = vi.fn();
    const repository = createVoiceAgentRepository({
      get: vi.fn(),
      patch,
      post: vi.fn(),
      delete: vi.fn(),
    });

    await expect(
      repository.update(" ", {
        voiceMode: "off",
        voiceProvider: "xai",
        voiceModel: "grok-voice-latest",
        voiceId: null,
        voiceLanguageHint: null,
        voiceInstructions: null,
      }),
    ).rejects.toThrow("voice agent id");
    expect(patch).not.toHaveBeenCalled();
  });
});
