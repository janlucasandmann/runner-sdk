// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { KnowledgeApi } from "./knowledge-api.js";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("KnowledgeApi editor attachments", () => {
  it("adapts the appliance draft proposal response without leaking unsupported fields", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      status: "draft",
      library: { id: "library-1" },
      version: { id: "version-2", versionNumber: 2 },
      document: {
        id: "document-1",
        libraryId: "library-1",
        provenance: { source: "evaluation" },
      },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const api = new KnowledgeApi("/api/real");

    await expect(api.createProposal("library-1", {
      operation: "create_document",
      markdown: "# Updated runbook",
      provenance: { source: "evaluation", runId: "run-1" },
    })).resolves.toMatchObject({
      id: "document-1",
      operation: "create_document",
      status: "draft",
      documentId: "document-1",
    });

    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/real/knowledge/library-1/proposals");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      markdown: "# Updated runbook",
      provenance: { source: "evaluation", runId: "run-1" },
    });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).not.toHaveProperty("operation");
  });

  it("sends operation-aware update proposals without leaking undefined fields", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({
      status: "draft",
      operation: "update_document",
      documentId: "document-1",
      library: { id: "library-1" },
      version: { id: "version-3", versionNumber: 3 },
      document: { id: "document-1", libraryId: "library-1" },
    }), { status: 201, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const api = new KnowledgeApi("/api/real");
    await expect(api.createProposal("library-1", {
      operation: "update_document",
      documentId: "document-1",
      markdown: "# Updated runbook",
      baseRevisionId: "revision-2",
    })).resolves.toMatchObject({
      operation: "update_document",
      documentId: "document-1",
      version: { id: "version-3" },
    });
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      operation: "update_document",
      documentId: "document-1",
      baseRevisionId: "revision-2",
      markdown: "# Updated runbook",
    });
  });

  it("uploads files through the shared attachment service and resolves previews", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        attachment: {
          id: "attachment-1",
          filename: "guide.txt",
          mimeType: "text/plain",
          size: 5,
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        blob: vi.fn(async () => new Blob(["hello"], { type: "text/plain" })),
      });
    vi.stubGlobal("fetch", fetchMock);
    const api = new KnowledgeApi("/api/real", { "X-Test-Identity": "user-1" });

    const [attachment] = await api.uploadEditorAttachments([
      new File(["hello"], "guide.txt", { type: "text/plain" }),
    ]);

    expect(attachment).toMatchObject({
      src: "/api/real/attachments/attachment-1",
      name: "guide.txt",
      size: 5,
      mimeType: "text/plain",
      attachmentId: "attachment-1",
    });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("/api/real/attachments/upload");
    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toMatchObject({
      filename: "guide.txt",
      mimeType: "text/plain",
      data: "aGVsbG8=",
    });

    const preview = await api.resolveEditorAttachmentPreview(
      attachment,
      new AbortController().signal,
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe("/api/real/attachments/attachment-1");
    expect(preview).toBeInstanceOf(Blob);
    expect(preview?.size).toBe(5);
  });

  it("stores version descriptions and falls back only for an older strict API", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        message: "Request body contains unsupported fields: description.",
      }), { status: 400, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        library: { id: "library-1" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const api = new KnowledgeApi("/api/real");

    await api.createVersion("library-1", { description: "Documented the new runbook." });

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      description: "Documented the new runbook.",
    });
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({});
  });

  it("reads organization members from the canonical nested response envelope", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          members: [
            {
              id: "membership-2",
              userId: "user-2",
              email: "john@example.com",
            },
          ],
        },
      }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        profiles: [
          {
            userId: "user-2",
            displayName: "John Smith",
            email: "john@example.com",
            photoURL: "/img/profiles/john.webp",
          },
        ],
      }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const api = new KnowledgeApi("/api/real");

    await expect(api.listOrganizationMembers("organization-1")).resolves.toEqual([
      expect.objectContaining({
        userId: "user-2",
        profile: expect.objectContaining({
          displayName: "John Smith",
          email: "john@example.com",
        }),
      }),
    ]);
    expect(fetchMock.mock.calls[0]?.[0]).toContain(
      "/api/real/organizations/organization-1/members?includeProfiles=1",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toContain(
      "/api/real/organizations/organization-1/member-profiles/lookup",
    );
    expect(JSON.parse(String(fetchMock.mock.calls[1]?.[1]?.body))).toEqual({
      members: [expect.objectContaining({ userId: "user-2" })],
    });
  });
});
