import { afterEach, describe, expect, it, vi } from "vitest";
import { cancelThreadExecution, createThread } from "./thread-api.js";

describe("runner thread API", () => {
  afterEach(() => vi.restoreAllMocks());

  it("sends canonical Knowledge context alongside legacy metadata", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({
        thread: { id: "thread-1", title: "New Thread", environmentId: "computer-1" },
      }), { status: 201, headers: { "content-type": "application/json" } }),
    );

    await createThread({
      backendUrl: "https://platform.example/api",
      apiKey: "api-key",
      metadata: {
        knowledgeContext: {
          enabled: true,
          libraryIds: ["library-a"],
        },
      },
      knowledgeContext: {
        schemaVersion: "computer_agents_knowledge_context_v1",
        enabled: true,
        libraryIds: ["library-a"],
        bindings: [{ libraryId: "library-a", versionId: "version-4" }],
        mode: "read",
      },
    });

    const [, request] = fetchMock.mock.calls[0];
    const payload = JSON.parse(String((request as RequestInit).body));
    expect(payload.knowledgeContext).toMatchObject({
      libraryIds: ["library-a"],
      bindings: [{ libraryId: "library-a", versionId: "version-4" }],
    });
    expect(payload.metadata.knowledgeContext).toMatchObject({
      schemaVersion: "computer_agents_knowledge_context_v1",
      enabled: true,
      libraryIds: ["library-a"],
      bindings: [{ libraryId: "library-a", versionId: "version-4" }],
    });
  });

  it("includes the signed-in session when cancelling without an API key", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await cancelThreadExecution({
      backendUrl: "/api/real",
      apiKey: "",
      threadId: "thread-session-auth",
    });

    const [, request] = fetchMock.mock.calls[0];
    expect(request).toMatchObject({
      method: "POST",
      credentials: "include",
    });
  });
});
