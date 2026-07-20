import { beforeEach, describe, expect, it } from "vitest";

import {
  buildPlatformAgentListScopeKey,
  clearCachedPlatformAgentList,
  normalizePlatformAgentListRecords,
  readCachedPlatformAgentList,
  writeCachedPlatformAgentList,
} from "./agent-list-cache.js";

describe("agent list cache", () => {
  beforeEach(() => {
    clearCachedPlatformAgentList();
  });

  it("normalizes supported envelopes and legacy identifiers", () => {
    expect(normalizePlatformAgentListRecords({
      payload: {
        resources: [
          { agentId: "agent-1", name: "Forge" },
          { agent_id: "agent-2", name: "Spark" },
          { name: "Missing id" },
        ],
      },
    })).toEqual([
      { id: "agent-1", agentId: "agent-1", name: "Forge" },
      { id: "agent-2", agent_id: "agent-2", name: "Spark" },
    ]);
  });

  it("isolates cache keys by account and organization", () => {
    const personal = buildPlatformAgentListScopeKey({
      backendUrl: "/api/real/",
      headers: { "X-API-Key": "session-key" },
      identity: "user-1",
    });
    const organization = buildPlatformAgentListScopeKey({
      backendUrl: "/api/real",
      headers: {
        "X-API-Key": "session-key",
        "x-computer-agents-organization": "org-1",
      },
      identity: "user-1",
    });
    const otherUser = buildPlatformAgentListScopeKey({
      backendUrl: "/api/real",
      headers: { "X-API-Key": "session-key" },
      identity: "user-2",
    });

    expect(new Set([personal, organization, otherUser]).size).toBe(3);
  });

  it("returns a freshly cached normalized list", () => {
    writeCachedPlatformAgentList("scope-1", {
      data: [{ agentId: "agent-1", name: "Forge" }],
    });

    expect(readCachedPlatformAgentList("scope-1")).toMatchObject({
      agents: [{ id: "agent-1", agentId: "agent-1", name: "Forge" }],
      isFresh: true,
    });
    expect(readCachedPlatformAgentList("scope-2")).toBeNull();
  });
});
