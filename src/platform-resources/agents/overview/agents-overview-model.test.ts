import { describe, expect, it } from "vitest";

import { normalizeAgentOverviewRows } from "./agents-overview-model.js";

describe("agents overview model", () => {
  it("normalizes agent, squad, creator, model, and analytics fields", () => {
    const rows = normalizeAgentOverviewRows(
      [
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
      ],
      [
        {
          agentId: "agent-1",
          runCount: 2,
          tokenCount: 1234,
          costUsd: 1,
          lastUsedAt: "2026-07-16T10:00:00.000Z",
        },
      ],
    );

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

  it("classifies Mission Control metadata as a managed functional agent", () => {
    const rows = normalizeAgentOverviewRows([
      {
        id: "agent-mission-control",
        name: "Mission Control",
        metadata: {
          profile: {
            photoURL: "/img/agent-profile-pics/assistantastro-1.webp",
          },
          runnerPlayground: {
            role: "mission_control",
          },
        },
      },
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      id: "agent-mission-control",
      isFunctional: true,
      isSystem: true,
      creatorName: "Computer Agents",
      avatarUrl: "/img/agent-profile-pics/assistantastro-1.webp",
    });
  });

  it("normalizes persisted Threads API actors as editable functional agents with their configured models", () => {
    const records = [
      {
        id: "agent-thread-orchestrator-user-1",
        name: "Orchestrator",
        model: "minimax-m3",
        isSystem: true,
        metadata: {
          runnerPlayground: {
            role: "thread_orchestrator",
          },
        },
      },
      {
        id: "agent-thread-communicator-user-1",
        name: "Communicator",
        model: "deepseek-v4-flash",
        isSystem: true,
        metadata: {
          runnerPlayground: {
            role: "thread_communicator",
          },
        },
      },
    ];
    const rows = normalizeAgentOverviewRows(records);

    expect(records.map((record) => record.id)).toEqual([
      "agent-thread-orchestrator-user-1",
      "agent-thread-communicator-user-1",
    ]);
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.name)).toEqual([
      "Orchestrator",
      "Communicator",
    ]);
    expect(rows).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "agent-thread-orchestrator-user-1",
          isFunctional: true,
          isSystem: true,
          creatorName: "Computer Agents",
          modelLabel: "minimax-m3",
        }),
        expect.objectContaining({
          id: "agent-thread-communicator-user-1",
          isFunctional: true,
          isSystem: true,
          creatorName: "Computer Agents",
          modelLabel: "deepseek-v4-flash",
        }),
      ]),
    );
  });
});
