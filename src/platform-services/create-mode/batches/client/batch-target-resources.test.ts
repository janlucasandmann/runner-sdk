import { afterEach, describe, expect, it, vi } from "vitest";
import { loadBatchMetronomeManualRunContext } from "./batch-target-resources.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("loadBatchMetronomeManualRunContext", () => {
  it("resolves a pinned Workflow version from the supported versions collection", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/metronomes/met_workflow/versions")) {
        return new Response(
          JSON.stringify({
            data: [
              {
                id: "metver_pinned",
                status: "active",
                definition: {
                  name: "Pinned Workflow",
                  nodes: [
                    {
                      id: "trigger_1",
                      data: {
                        kind: "trigger",
                        subtype: "periodic",
                        config: { triggerType: "periodic" },
                      },
                    },
                  ],
                  edges: [],
                },
              },
            ],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.endsWith("/servers")) {
        return new Response(JSON.stringify({ data: [] }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response("Not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const context = await loadBatchMetronomeManualRunContext("met_workflow", "metver_pinned", {
      baseUrl: "/api/real",
    });

    expect(context.versionId).toBe("metver_pinned");
    expect(context.workflow.name).toBe("Pinned Workflow");
    expect(context.nodes).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/real/metronomes/met_workflow/versions",
      expect.objectContaining({ method: "GET" }),
    );
    expect(
      fetchMock.mock.calls.some(([input]) => String(input).includes("/versions/metver_pinned")),
    ).toBe(false);
  });

  it("fails closed when the pinned version is absent from the collection", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        return new Response(
          JSON.stringify(url.endsWith("/servers") ? { data: [] } : { data: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }),
    );

    await expect(
      loadBatchMetronomeManualRunContext("met_workflow", "metver_missing", {
        baseUrl: "/api/real",
      }),
    ).rejects.toThrow("The pinned Workflow version is no longer available.");
  });
});
