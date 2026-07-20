import { describe, expect, it, vi } from "vitest";
import { RunnerClient } from "./client.js";

describe("RunnerClient environment versions", () => {
  it("creates and publishes a new version in one request", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      environment: {
        id: "env_123",
        name: "Research Computer",
      },
      version: {
        id: "environment_version_2",
        version: 2,
        status: "published",
        description: "Faster setup",
      },
      versions: [
        {
          id: "environment_version_2",
          version: 2,
          status: "published",
          description: "Faster setup",
        },
        {
          id: "environment_version_1",
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

    const result = await client.saveEnvironmentVersion({
      backendUrl: "https://api.example.com",
      environmentId: "env_123",
      version: {
        description: "Faster setup",
        snapshot: {
          name: "Research Computer",
          computeProfile: "power",
        },
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/environments/env_123/versions");
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      description: "Faster setup",
      snapshot: {
        name: "Research Computer",
        computeProfile: "power",
      },
      publish: true,
    });
    expect(result.version.id).toBe("environment_version_2");
    expect(result.versions).toHaveLength(2);
  });

  it("updates and publishes the current version in one request", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      environment: {
        id: "env_123",
        name: "Research Computer",
      },
      version: {
        id: "environment_version_2",
        version: 2,
        status: "published",
        description: "Updated description",
      },
      versions: [{
        id: "environment_version_2",
        version: 2,
        status: "published",
        description: "Updated description",
      }],
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    await client.saveEnvironmentVersion({
      backendUrl: "https://api.example.com",
      environmentId: "env_123",
      versionId: "environment_version_2",
      version: {
        description: "Updated description",
        snapshot: {
          name: "Research Computer",
        },
      },
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.com/environments/env_123/versions/environment_version_2/publish",
    );
    expect(JSON.parse(String(request?.body))).toEqual({
      description: "Updated description",
      snapshot: {
        name: "Research Computer",
      },
    });
  });

  it("falls back to the legacy two-request create flow until the API is upgraded", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        version: {
          id: "environment_version_2",
          version: 2,
          status: "saved",
        },
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        environment: {
          id: "env_123",
          name: "Research Computer",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    const result = await client.saveEnvironmentVersion({
      backendUrl: "https://api.example.com",
      environmentId: "env_123",
      version: {
        description: "Compatible save",
        snapshot: {
          name: "Research Computer",
        },
      },
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][0])).toBe(
      "https://api.example.com/environments/env_123/versions/environment_version_2/publish",
    );
    expect(result.environment.id).toBe("env_123");
    expect(result.versions).toEqual([]);
  });

  it("publishes the snapshot and optional version description together", async () => {
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => new Response(JSON.stringify({
      environment: {
        id: "env_123",
        name: "Research Computer",
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }));
    const client = new RunnerClient(fetchMock as typeof fetch);

    await client.publishEnvironmentVersion({
      backendUrl: "https://api.example.com",
      environmentId: "env_123",
      versionId: "environment_version_456",
      snapshot: {
        name: "Research Computer",
        computeProfile: "standard",
      },
      description: "Verified production setup",
    });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, request] = fetchMock.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.example.com/environments/env_123/versions/environment_version_456/publish",
    );
    expect(request?.method).toBe("POST");
    expect(JSON.parse(String(request?.body))).toEqual({
      snapshot: {
        name: "Research Computer",
        computeProfile: "standard",
      },
      description: "Verified production setup",
    });
  });
});
