import { describe, expect, it, vi } from "vitest";
import { RunnerClient } from "./client.js";

describe("RunnerClient agent versions", () => {
  it("publishes the snapshot and optional version description together", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      agent: {
        id: "agent_123",
        name: "Research Agent",
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    await client.publishAgentVersion({
      backendUrl: "https://api.example.com",
      agentId: "agent_123",
      versionId: "agent_version_456",
      snapshot: {
        name: "Research Agent",
        instructions: "Use the verified workflow.",
      },
      description: "Verified production instructions",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.com/agents/agent_123/versions/agent_version_456/publish",
    );
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      snapshot: {
        name: "Research Agent",
        instructions: "Use the verified workflow.",
      },
      description: "Verified production instructions",
    });
  });
});
