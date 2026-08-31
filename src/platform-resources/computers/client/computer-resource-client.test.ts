import { describe, expect, it, vi } from "vitest";

import {
  createComputerResourceRepository,
  deleteComputerResource,
  loadComputerDockerfile,
  normalizeComputerDockerfileSource,
  saveComputerResource,
} from "./computer-resource-client.js";

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("Computer resource client", () => {
  it("lists computers through an injected platform API client", async () => {
    const get = vi.fn(async () => ({
      environments: [{ id: "computer-1" }],
    }));
    const apiClient = {
      get,
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as Parameters<typeof createComputerResourceRepository>[0];
    const repository = createComputerResourceRepository(apiClient);

    await expect(repository.list()).resolves.toEqual([{ id: "computer-1" }]);
    expect(get).toHaveBeenCalledWith("/environments", { signal: undefined });
  });

  it("loads the authoritative effective Dockerfile", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      response({
        baseImage: "ubuntu:24.04",
        dockerfileExtensions: "RUN apt-get update\n",
        effectiveDockerfile: "FROM ubuntu:24.04\nRUN apt-get update\n",
      }),
    );

    await expect(
      loadComputerDockerfile({
        backendUrl: "https://platform.example/",
        fetchImpl: fetchImpl as typeof fetch,
        computerId: "computer 1",
      }),
    ).resolves.toEqual({
      baseImage: "ubuntu:24.04",
      dockerfileExtensions: "RUN apt-get update\n",
      effectiveDockerfile: "FROM ubuntu:24.04\nRUN apt-get update\n",
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://platform.example/environments/computer%201/dockerfile",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("constructs a compatible full Dockerfile for older extension-only responses", () => {
    expect(
      normalizeComputerDockerfileSource({
        data: {
          base_image: "node:22",
          dockerfile_extensions: "RUN npm install -g pnpm",
        },
      }),
    ).toEqual({
      baseImage: "node:22",
      dockerfileExtensions: "RUN npm install -g pnpm",
      effectiveDockerfile: "FROM node:22\n\nRUN npm install -g pnpm\n",
    });
  });

  it("requires a computer id when loading Dockerfile source", async () => {
    const apiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    } as unknown as Parameters<typeof createComputerResourceRepository>[0];
    await expect(
      createComputerResourceRepository(apiClient).getDockerfile(""),
    ).rejects.toThrow("A computer id is required.");
  });

  it("creates and then fully updates a draft computer", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ environment: { id: "computer 1" } }))
      .mockResolvedValueOnce(
        response({ environment: { id: "computer 1", name: "Build" } }),
      );
    const result = await saveComputerResource({
      backendUrl: "https://platform.example/",
      fetchImpl: fetchImpl as typeof fetch,
      computerId: "draft",
      draftId: "draft",
      createPayload: { name: "Build" },
      updatePayload: { name: "Build", computeProfile: "power" },
    });

    expect(result).toMatchObject({
      isNew: true,
      computerId: "computer 1",
    });
    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://platform.example/environments",
      expect.objectContaining({ method: "POST" }),
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://platform.example/environments/computer%201",
      expect.objectContaining({ method: "PUT" }),
    );
  });

  it("updates existing computers with a single request", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(response({ environment: { id: "computer-1" } }));
    const result = await saveComputerResource({
      backendUrl: "https://platform.example",
      fetchImpl: fetchImpl as typeof fetch,
      computerId: "computer-1",
      createPayload: {},
      updatePayload: { name: "Build" },
    });

    expect(result.isNew).toBe(false);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("uses the upstream delete error", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        response({ error: "Default computers cannot be deleted." }, 409),
      );
    await expect(
      deleteComputerResource({
        backendUrl: "https://platform.example",
        fetchImpl: fetchImpl as typeof fetch,
        computerId: "default",
      }),
    ).rejects.toThrow("Default computers cannot be deleted.");
  });
});
