import { describe, expect, it, vi } from "vitest";
import {
  PlatformApiRequestError,
  createPlatformApiClient,
} from "./platform-api-client.js";

describe("platform API client", () => {
  it("normalizes URLs, query parameters, auth headers, and JSON bodies", async () => {
    let capturedInit: RequestInit | undefined;
    const fetchImpl = vi.fn(async (
      _input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      capturedInit = init;
      return new Response(
        JSON.stringify({ id: "server_1" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    });
    const client = createPlatformApiClient({
      baseUrl: "https://platform.example.test/",
      fetchImpl: fetchImpl as unknown as typeof fetch,
      getHeaders: () => ({ Authorization: "Bearer token" }),
    });

    await expect(client.post("api/real/servers", { name: "API" }, {
      query: { projectId: "project_1", empty: undefined },
      headers: { "X-Request-Id": "request_1" },
    })).resolves.toEqual({ id: "server_1" });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://platform.example.test/api/real/servers?projectId=project_1",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: '{"name":"API"}',
      }),
    );
    const headers = new Headers(capturedInit?.headers);
    expect(headers.get("Authorization")).toBe("Bearer token");
    expect(headers.get("X-Request-Id")).toBe("request_1");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("surfaces structured API errors", async () => {
    const client = createPlatformApiClient({
      baseUrl: "https://platform.example.test",
      fetchImpl: vi.fn(async () => new Response(
        JSON.stringify({ code: "conflict", message: "Already exists." }),
        { status: 409 },
      )) as unknown as typeof fetch,
    });

    const error = await client.get("/api/real/servers")
      .catch((value) => value);
    expect(error).toBeInstanceOf(PlatformApiRequestError);
    expect(error).toMatchObject({
      status: 409,
      code: "conflict",
      message: "Already exists.",
    });
  });
});
