import { describe, expect, it, vi } from "vitest";
import { RunnerClient } from "./client.js";

describe("RunnerClient guardrail versions", () => {
  it("publishes the snapshot and optional version description together", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      guardrail: {
        id: "guardrail_123",
        name: "Production safeguards",
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    await client.publishGuardrailVersion({
      backendUrl: "https://api.example.com",
      guardrailId: "guardrail_123",
      versionId: "guardrail_version_456",
      snapshot: {
        name: "Production safeguards",
        description: "Require confirmation before irreversible actions.",
        prompts: [],
      },
      description: "Verified production policy",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.com/guardrails/guardrail_123/versions/guardrail_version_456/publish",
    );
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      snapshot: {
        name: "Production safeguards",
        description: "Require confirmation before irreversible actions.",
        prompts: [],
      },
      description: "Verified production policy",
    });
  });
});
