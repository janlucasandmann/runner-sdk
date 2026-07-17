import { describe, expect, it, vi } from "vitest";

import {
  createDevelopResourceRepository,
  deleteDevelopResource,
  saveDevelopResource,
} from "./develop-resource-client.js";

function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("Develop resource client", () => {
  it("lists typed resource collections through the shared API transport", async () => {
    const get = vi.fn(async () => ({
      servers: [{ id: "server-1", kind: "function" }],
    }));
    const apiClient = {
      get,
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    } as unknown as Parameters<typeof createDevelopResourceRepository>[0];
    const repository = createDevelopResourceRepository(apiClient);

    await expect(repository.list("server", { kind: "function" }))
      .resolves.toEqual([{ id: "server-1", kind: "function" }]);
    expect(get).toHaveBeenCalledWith("/servers", {
      query: { kind: "function" },
      signal: undefined,
    });
  });

  it("creates draft servers through the collection endpoint", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ server: { id: "srv" } }));
    const result = await saveDevelopResource({
      backendUrl: "https://platform.example/",
      requestHeaders: { Authorization: "Bearer token" },
      fetchImpl: fetchImpl as unknown as typeof fetch,
      resourceType: "server",
      resourceId: "server-draft",
      draftId: "server-draft",
      payload: { name: "API" },
    });

    expect(result.isNew).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://platform.example/servers",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("patches existing databases", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse({ database: { id: "db 1" } }));
    const result = await saveDevelopResource({
      backendUrl: "https://platform.example",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      resourceType: "database",
      resourceId: "db 1",
      payload: { name: "Primary" },
    });

    expect(result.isNew).toBe(false);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://platform.example/databases/db%201",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("surfaces upstream mutation errors", async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(
      { message: "Resource is protected." },
      { status: 409 },
    ));
    await expect(deleteDevelopResource({
      backendUrl: "https://platform.example",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      resourceType: "server",
      resourceId: "srv",
    })).rejects.toThrow("Resource is protected.");
  });
});
