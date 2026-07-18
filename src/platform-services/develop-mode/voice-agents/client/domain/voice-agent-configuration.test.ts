import { describe, expect, it } from "vitest";

import {
  createVoiceAgentUpdatePayload,
  getVoiceAgentRecordId,
  unwrapVoiceAgentRecord,
} from "./voice-agent-configuration.js";

describe("voice agent configuration", () => {
  it("normalizes editable rows into the API contract", () => {
    expect(
      createVoiceAgentUpdatePayload({
        mode: "web_and_phone",
        model: "grok-voice-latest",
        voiceId: " eve ",
        languageHint: " ",
        instructions: " Be concise. ",
      }),
    ).toEqual({
      voiceMode: "web_and_phone",
      voiceProvider: "xai",
      voiceModel: "grok-voice-latest",
      voiceId: "eve",
      voiceLanguageHint: null,
      voiceInstructions: "Be concise.",
    });
  });

  it("unwraps command envelopes without losing agent identity", () => {
    const record = unwrapVoiceAgentRecord({
      data: {
        agent: { id: "agent-1" },
        voice: { mode: "web" },
      },
    });

    expect(getVoiceAgentRecordId(record)).toBe("agent-1");
    expect(record).toMatchObject({ voice: { mode: "web" } });
  });
});
