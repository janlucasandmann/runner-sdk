import { describe, expect, it } from "vitest";

import { normalizeAgentOverviewRows } from "./agents-overview-model.js";

describe("agents overview model", () => {
  it("normalizes agent, squad, creator, model, and analytics fields", () => {
    const rows = normalizeAgentOverviewRows([
      {
        id: "agent-1",
        name: "Forge",
        model: "gpt-5",
        photoURL: "https://example.com/forge.png",
        creator: {
          name: "Jane",
          avatarUrl: "https://example.com/jane.png",
        },
      },
      {
        id: "squad-1",
        metadata: {
          agentType: "team",
          lastRunAt: "2026-07-15T10:00:00.000Z",
        },
      },
    ], [{
      agentId: "agent-1",
      runCount: 2,
      tokenCount: 1234,
      costUsd: 1,
      lastUsedAt: "2026-07-16T10:00:00.000Z",
    }]);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      id: "agent-1",
      name: "Forge",
      modelLabel: "gpt-5",
      usageTokens: 1234,
      creatorName: "Jane",
      isSquad: false,
      lastUsedAt: Date.parse("2026-07-16T10:00:00.000Z"),
    });
    expect(rows[1]).toMatchObject({
      id: "squad-1",
      name: "Untitled Squad",
      isSquad: true,
    });
  });

  it("recognizes locked system agent identifiers and removes drafts", () => {
    const rows = normalizeAgentOverviewRows([
      { id: "__playground_new_agent__" },
      { id: "agent-default-general", name: "Spark" },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      isSystem: true,
      creatorName: "Computer Agents",
    });
  });
});
