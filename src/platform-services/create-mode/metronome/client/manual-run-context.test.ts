import { afterEach, describe, expect, it, vi } from "vitest";
import { loadMetronomeManualRunContext } from "./manual-run-context.js";

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function publishedVersionResponse() {
  return jsonResponse({
    data: [
      {
        id: "workflow_version_1",
        status: "published",
        definition: {
          name: "Evidence extraction",
          nodes: [{ id: "trigger_1", data: { kind: "trigger" } }],
          edges: [],
        },
      },
    ],
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadMetronomeManualRunContext", () => {
  it("retries a transient Workflow-version network failure", async () => {
    let versionAttempts = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/servers")) return jsonResponse({ data: [] });
      versionAttempts += 1;
      if (versionAttempts === 1) throw new TypeError("Failed to fetch");
      return publishedVersionResponse();
    });
    vi.stubGlobal("fetch", fetchMock);

    const context = await loadMetronomeManualRunContext("workflow_1", null, {
      baseUrl: "/api/real",
      transientRetryDelayMs: 0,
    });

    expect(versionAttempts).toBe(2);
    expect(context.versionId).toBe("workflow_version_1");
    expect(context.workflow.name).toBe("Evidence extraction");
  });

  it("cancels superseded Workflow loads without retrying them", async () => {
    const requestController = new AbortController();
    const fetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => (
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          reject(new DOMException("The request was aborted.", "AbortError"));
        }, { once: true });
      })
    ));
    vi.stubGlobal("fetch", fetchMock);

    const request = loadMetronomeManualRunContext("workflow_1", null, {
      baseUrl: "/api/real",
      signal: requestController.signal,
      transientRetryDelayMs: 0,
    });
    requestController.abort();

    await expect(request).rejects.toMatchObject({ name: "AbortError" });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns a stable user-facing error after transient retries are exhausted", async () => {
    let versionAttempts = 0;
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith("/servers")) return jsonResponse({ data: [] });
      versionAttempts += 1;
      throw new TypeError("Failed to fetch");
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(loadMetronomeManualRunContext("workflow_1", null, {
      baseUrl: "/api/real",
      transientRetryCount: 1,
      transientRetryDelayMs: 0,
    })).rejects.toThrow("Workflow inputs could not be loaded. Please try again.");
    expect(versionAttempts).toBe(2);
  });
});
