// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { KnowledgeApi } from "../api/index.js";
import type { KnowledgeLibrary } from "../domain/index.js";
import { KnowledgeConnectorSettings } from "./knowledge-connector-settings.js";

const library = {
  id: "library-1",
  name: "Product handbook",
  description: "Shared product knowledge.",
  homeDocumentId: "document-1",
  creatorId: "user-1",
  creatorUserId: "user-1",
  creatorName: "Jane Doe",
  creatorEmail: "jane@example.com",
  creatorAvatarUrl: "",
  ownerId: "user-1",
  ownerUserId: "user-1",
  ownerName: "Jane Doe",
  ownerEmail: "jane@example.com",
  ownerAvatarUrl: "",
  createdAt: "2026-08-29T08:00:00.000Z",
  updatedAt: "2026-08-29T08:00:00.000Z",
  currentVersionId: "version-1",
  currentVersionNumber: 1,
  publishedVersionId: "",
  metadata: {},
  permissionSet: null,
  documents: [],
  versions: [],
} satisfies KnowledgeLibrary;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("KnowledgeConnectorSettings", () => {
  it("keeps project Strategy libraries visible but managed from project settings", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    render(
      <KnowledgeConnectorSettings
        library={{
          ...library,
          metadata: {
            projectId: "project-1",
            purpose: "project_knowledge",
          },
        }}
        api={{} as KnowledgeApi}
        onLibraryChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Managed at project level")).toBeTruthy();
    expect(screen.getByText(/has to be changed in the project settings/)).toBeTruthy();
    screen.getAllByRole("button", { name: "Manage" }).forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("selects a Notion database through the centralized explorer and persists it on the library", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          databases: [{ id: "database-1", name: "Product roadmap" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const updateLibrary = vi.fn(async (_libraryId: string, input: Partial<KnowledgeLibrary>) => ({
      ...library,
      ...input,
    }));
    const onLibraryChange = vi.fn();

    render(
      <KnowledgeConnectorSettings
        library={library}
        api={{ updateLibrary } as unknown as KnowledgeApi}
        requestHeaders={{ Authorization: "Bearer test" }}
        activeOrganizationId="organization-1"
        onLibraryChange={onLibraryChange}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Manage" })[0]);
    const resource = await screen.findByText("Product roadmap");
    fireEvent.click(resource.closest("button") as HTMLButtonElement);
    fireEvent.click(screen.getByRole("button", { name: "Use 1 database" }));

    await waitFor(() => {
      expect(updateLibrary).toHaveBeenCalledWith("library-1", {
        metadata: expect.objectContaining({
          knowledgeConnectors: expect.objectContaining({
            schemaVersion: "computer_agents_knowledge_connectors_v1",
            notion: [
              expect.objectContaining({
                id: "database-1",
                name: "Product roadmap",
                resourceType: "database",
              }),
            ],
            confluence: [],
          }),
        }),
      });
      expect(onLibraryChange).toHaveBeenCalledTimes(1);
    });
    expect(document.querySelector(".tb-file-browser-preview")).toBeNull();
  });

  it("selects a Confluence space with the identifiers required by the shared sync engine", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          resources: [
            {
              id: "atlassian:confluence-space:space-1",
              name: "Product strategy",
              resourceKey: "space-1",
              cloudId: "cloud-1",
              siteUrl: "https://example.atlassian.net/wiki",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    const updateLibrary = vi.fn(async (_libraryId: string, input: Partial<KnowledgeLibrary>) => ({
      ...library,
      ...input,
    }));

    render(
      <KnowledgeConnectorSettings
        library={library}
        api={{ updateLibrary } as unknown as KnowledgeApi}
        onLibraryChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Manage" })[1]);
    const resource = await screen.findByText("Product strategy");
    fireEvent.click(resource.closest("button") as HTMLButtonElement);
    fireEvent.click(screen.getByRole("button", { name: "Use 1 space" }));

    await waitFor(() => {
      expect(updateLibrary).toHaveBeenCalledWith("library-1", {
        metadata: expect.objectContaining({
          knowledgeConnectors: expect.objectContaining({
            notion: [],
            confluence: [
              expect.objectContaining({
                id: "atlassian:confluence-space:space-1",
                name: "Product strategy",
                resourceKey: "space-1",
                cloudId: "cloud-1",
                siteUrl: "https://example.atlassian.net/wiki",
                resourceType: "confluence_space",
              }),
            ],
          }),
        }),
      });
    });
  });

  it("preserves saved sync directions when connector discovery refreshes resource metadata", async () => {
    const connectedLibrary: KnowledgeLibrary = {
      ...library,
      metadata: {
        knowledgeConnectors: {
          schemaVersion: "computer_agents_knowledge_connectors_v1",
          notion: [
            {
              id: "database-1",
              name: "Old database name",
              path: "database-1",
              provider: "notion",
              resourceType: "database",
              mimeType: "application/x-notion-database",
              strategyKnowledgeSyncEnabled: true,
              strategyKnowledgeSyncToNotionEnabled: true,
              strategyKnowledgeSyncFromNotionEnabled: false,
            },
          ],
          confluence: [],
        },
      },
    };
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            sync: {
              enabled: true,
              syncToNotion: true,
              syncFromNotion: false,
              status: "synced",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            databases: [{ id: "database-1", name: "Current database name" }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      );
    const updateLibrary = vi.fn(async (_libraryId: string, input: Partial<KnowledgeLibrary>) => ({
      ...connectedLibrary,
      ...input,
    }));

    render(
      <KnowledgeConnectorSettings
        library={connectedLibrary}
        api={{ updateLibrary } as unknown as KnowledgeApi}
        onLibraryChange={vi.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Manage" })[0]);
    await screen.findByText("Current database name");
    fireEvent.click(screen.getByRole("button", { name: "Use 1 database" }));

    await waitFor(() => {
      expect(updateLibrary).toHaveBeenCalledWith("library-1", {
        metadata: expect.objectContaining({
          knowledgeConnectors: expect.objectContaining({
            notion: [
              expect.objectContaining({
                name: "Current database name",
                strategyKnowledgeSyncEnabled: true,
                strategyKnowledgeSyncToNotionEnabled: true,
                strategyKnowledgeSyncFromNotionEnabled: false,
              }),
            ],
          }),
        }),
      });
    });
  });
});
