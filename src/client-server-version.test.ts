import { describe, expect, it, vi } from "vitest";
import { RunnerClient } from "./client.js";

describe("RunnerClient server versions", () => {
  it("creates and publishes a source-backed version in one request", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      server: {
        id: "server_123",
        name: "Customer Portal",
      },
      version: {
        id: "server_version_2",
        version: 2,
        status: "published",
        description: "Production candidate",
      },
      versions: [
        {
          id: "server_version_2",
          version: 2,
          status: "published",
          description: "Production candidate",
        },
        {
          id: "server_version_1",
          version: 1,
          status: "saved",
          description: "Initial version",
        },
      ],
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    const result = await client.saveServerVersion({
      backendUrl: "https://api.example.com",
      serverId: "server_123",
      version: {
        description: "Production candidate",
        snapshot: {
          name: "Customer Portal",
          kind: "web_app",
          sourceFileContents: {
            "index.html": "<main>Ready</main>",
          },
        },
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/servers/server_123/versions");
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      description: "Production candidate",
      snapshot: {
        name: "Customer Portal",
        kind: "web_app",
        sourceFileContents: {
          "index.html": "<main>Ready</main>",
        },
      },
      publish: true,
    });
    expect(result.version.id).toBe("server_version_2");
    expect(result.versions).toHaveLength(2);
  });

  it("updates and publishes the selected version in one request", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      server: {
        id: "server_123",
        name: "Customer Portal",
      },
      version: {
        id: "server_version_2",
        version: 2,
        status: "published",
      },
      versions: [{
        id: "server_version_2",
        version: 2,
        status: "published",
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    await client.saveServerVersion({
      backendUrl: "https://api.example.com",
      serverId: "server_123",
      versionId: "server_version_2",
      version: {
        description: "Updated production version",
        snapshot: {
          name: "Customer Portal",
        },
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.com/servers/server_123/versions/server_version_2/publish",
    );
    expect(JSON.parse(String(request?.body))).toEqual({
      description: "Updated production version",
      snapshot: {
        name: "Customer Portal",
      },
    });
  });
});
