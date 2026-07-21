import { describe, expect, it } from "vitest";
import { createDevelopVoiceAgentOverviewRows } from "./overview-model.js";

describe("createDevelopVoiceAgentOverviewRows", () => {
  it("keeps the underlying agent creator and owner as separate identities", () => {
    const [row] = createDevelopVoiceAgentOverviewRows([{
      agent: {
        id: "agent_voice",
        name: "Voice Concierge",
        metadata: {
          creator: { id: "user_creator", name: "Creator Person" },
          owner: { id: "user_owner", name: "Owner Person" },
        },
      },
      voice: { mode: "web" },
    }]);

    expect(row.creator).toMatchObject({ id: "user_creator", name: "Creator Person" });
    expect(row.owner).toMatchObject({ id: "user_owner", name: "Owner Person" });
  });
});
