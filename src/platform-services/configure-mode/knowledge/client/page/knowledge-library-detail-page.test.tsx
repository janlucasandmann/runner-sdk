// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { KnowledgeApi } from "../api/index.js";
import type { KnowledgeDocument, KnowledgeLibrary } from "../domain/index.js";
import { KnowledgeLibraryDetailPage } from "./knowledge-library-detail-page.js";

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(() => ({
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    clip: vi.fn(),
    createConicGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    fill: vi.fn(),
    measureText: () => ({ width: 0 }),
    rect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
  }) as unknown as CanvasRenderingContext2D);
});

afterEach(cleanup);
afterAll(() => vi.restoreAllMocks());

const documents: KnowledgeDocument[] = [
  {
    id: "document-home",
    libraryId: "library-1",
    revisionId: "revision-home",
    currentRevisionId: "revision-home",
    parentDocumentId: "",
    slug: "overview",
    sortOrder: 0,
    archived: false,
    title: "Overview",
    name: "Overview",
    summary: "Library overview",
    description: "",
    markdown: "# Overview",
    content: "# Overview",
    contentHash: "hash-home",
    provenance: {},
    createdByUserId: "user-1",
    revisionCreatedByUserId: "user-1",
    createdAt: "2026-08-17T08:00:00.000Z",
    revisionCreatedAt: "2026-08-17T08:00:00.000Z",
    updatedAt: "2026-08-17T08:00:00.000Z",
  },
  {
    id: "document-runbooks",
    libraryId: "library-1",
    revisionId: "revision-runbooks",
    currentRevisionId: "revision-runbooks",
    parentDocumentId: "",
    slug: "runbooks",
    sortOrder: 1,
    archived: false,
    title: "Runbooks",
    name: "Runbooks",
    summary: "Operational procedures",
    description: "",
    markdown: "# Runbooks",
    content: "# Runbooks",
    contentHash: "hash-runbooks",
    provenance: {},
    createdByUserId: "user-1",
    revisionCreatedByUserId: "user-1",
    createdAt: "2026-08-17T08:00:00.000Z",
    revisionCreatedAt: "2026-08-17T08:00:00.000Z",
    updatedAt: "2026-08-17T08:00:00.000Z",
  },
];

const library = {
  id: "library-1",
  name: "Product handbook",
  description: "Shared product conventions and decisions.",
  homeDocumentId: "document-home",
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
  createdAt: "2026-08-17T08:00:00.000Z",
  updatedAt: "2026-08-17T08:00:00.000Z",
  currentVersionId: "version-1",
  currentVersionNumber: 1,
  publishedVersionId: "",
  metadata: {},
  permissionSet: null,
  documents,
  versions: [{
    id: "version-1",
    number: 1,
    versionNumber: 1,
    name: "Version 1",
    description: "Initial version",
    status: "saved",
    fingerprint: "fingerprint-1",
    publishedAt: "",
    createdAt: "2026-08-17T08:00:00.000Z",
    updatedAt: "2026-08-17T08:00:00.000Z",
  }],
} satisfies KnowledgeLibrary;

describe("KnowledgeLibraryDetailPage", () => {
  it("uses the shared Skill-style Markdown workspace with documents in its sidebar", async () => {
    const updateLibrary = vi.fn(async (_libraryId: string, input: Partial<KnowledgeLibrary>) => ({
      ...library,
      ...input,
    }));
    const createVersion = vi.fn(async () => ({
      ...library,
      currentVersionId: "version-2",
      currentVersionNumber: 2,
    }));
    const onReload = vi.fn(async () => undefined);
    const onVersionsSidebarOpenChange = vi.fn();
    const { container } = render(
      <>
        <div id="knowledge-controls" />
        <div id="knowledge-sections" />
        <div id="knowledge-title-actions" />
        <KnowledgeLibraryDetailPage
          library={library}
          api={{ updateLibrary, createVersion } as unknown as KnowledgeApi}
          controlsPortalId="knowledge-controls"
          sectionControlsPortalId="knowledge-sections"
          titleActionsPortalId="knowledge-title-actions"
          onVersionsSidebarOpenChange={onVersionsSidebarOpenChange}
          onLibraryChange={vi.fn()}
          onReload={onReload}
        />
      </>,
    );

    expect(container.querySelector(".file-resource-detail-page.is-code-tab")).not.toBeNull();
    expect(container.querySelector("[data-platform-code-editor-workspace='true']")).not.toBeNull();
    expect(screen.getByText("Documents")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Overview" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Runbooks" })).not.toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(
      container.querySelector("#knowledge-controls button")?.textContent,
    ).toContain("Save Changes");
    expect(
      (screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Open Knowledge library version history" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open Knowledge library version history" }));
    await waitFor(() => expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(true));
    fireEvent.click(await screen.findByRole("button", { name: "Close version history" }));
    await waitFor(() => expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(false));

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    expect(container.querySelector(".knowledge-detail-page.file-resource-detail-page.is-settings-tab")).not.toBeNull();
    expect(container.querySelector(".knowledge-detail-page__settings-content")).not.toBeNull();
    expect(container.querySelector(".knowledge-detail-sidebar.playground-agents-detail-sidebar")).not.toBeNull();
    expect(screen.getByText("Location")).not.toBeNull();
    expect(screen.getByText("Updated")).not.toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "General" }));

    fireEvent.click(screen.getByRole("button", { name: "Knowledge Library actions" }));
    expect(screen.getByRole("menuitem", { name: /Information/ })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Show version history" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: /Share/ })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Copy Knowledge Library ID" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Knowledge Library actions" }));

    const selectAll = screen.getByRole("checkbox", { name: "Select all documents" });
    const homeSelection = screen.getByRole("checkbox", { name: "Select Overview" });
    expect((homeSelection as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(selectAll);
    expect(
      screen.getByRole("checkbox", { name: "Deselect Runbooks" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(homeSelection.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(screen.getByRole("button", { name: "Runbooks" }));
    expect(
      (screen.getByRole("textbox", { name: "Knowledge document title" }) as HTMLInputElement).value,
    ).toBe("Runbooks");

    fireEvent.change(screen.getByRole("textbox", { name: "Knowledge library name" }), {
      target: { value: "Product handbook 2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    const saveDialog = screen.getByRole("dialog", { name: "Review changes" });
    expect(saveDialog).not.toBeNull();
    expect(screen.getByText("Create new version")).not.toBeNull();
    expect(screen.getByText("Current version")).not.toBeNull();
    fireEvent.click(within(saveDialog).getByRole("button", { name: "Save Changes" }));
    await waitFor(() => {
      expect(updateLibrary).toHaveBeenCalledWith("library-1", {
        name: "Product handbook 2",
        description: library.description,
      });
      expect(createVersion).toHaveBeenCalledWith("library-1", { description: "" });
      expect(onReload).toHaveBeenCalledTimes(1);
    });
  });

  it("uses the full content width for a focused team access page", async () => {
    const accessLibrary: KnowledgeLibrary = {
      ...library,
      metadata: {
        sharedTeamIds: ["team-platform"],
      },
    };
    const { container } = render(
      <>
        <div id="knowledge-access-sections" />
        <KnowledgeLibraryDetailPage
          library={accessLibrary}
          api={{} as KnowledgeApi}
          sectionControlsPortalId="knowledge-access-sections"
          workspaceTeams={[
            {
              id: "team-platform",
              name: "Platform",
              roleId: "admin",
              profileImageUrl: "/img/teams/platform.webp",
            },
          ]}
          workspaceTeamMembersTeamId="team-platform"
          workspaceTeamMembers={[
            {
              id: "membership-john",
              role: "member",
              user: {
                userId: "user-2",
              },
              profile: {
                displayName: "John Smith",
                email: "john@example.com",
                photoURL: "/img/profiles/john.webp",
              },
            },
          ]}
          onLibraryChange={vi.fn()}
          onReload={vi.fn(async () => undefined)}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    expect(screen.getByText("Location")).not.toBeNull();
    fireEvent.click(
      screen.getByRole("row", { name: "Edit permissions for Platform" }),
    );

    await waitFor(() => {
      expect(
        container.querySelector('[data-platform-resource-access-view="team"]'),
      ).not.toBeNull();
    });
    const page = container.querySelector(".knowledge-detail-page");
    expect(page?.classList.contains("is-sidebar-empty")).toBe(true);
    expect(page?.classList.contains("has-sidebar")).toBe(false);
    expect(page?.classList.contains("is-access-detail-view")).toBe(true);
    expect(
      container.querySelector(
        ".knowledge-detail-sidebar.playground-agents-detail-sidebar",
      ),
    ).toBeNull();
    expect(
      container.querySelector(".platform-role-permissions-page__details-sidebar"),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: "Member assigned members" })).not.toBeNull();
    expect(
      container.querySelector(
        '.platform-role-permissions-page__assigned-avatar img[src="/img/profiles/john.webp"]',
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(".knowledge-settings-layout.is-access-detail-view"),
    ).not.toBeNull();
    expect(screen.queryByText("Location")).toBeNull();
  });

  it("enables ownership transfer with the resolved active organization", async () => {
    const listOrganizationMembers = vi.fn(async () => ([
      {
        userId: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
      },
    ]));
    const updateLibrary = vi.fn(async () => ({
      ...library,
      ownerId: "user-2",
      ownerUserId: "user-2",
      ownerName: "John Smith",
      ownerEmail: "john@example.com",
      ownerAvatarUrl: "/img/profiles/john.webp",
    }));

    render(
      <>
        <div id="knowledge-owner-sections" />
        <KnowledgeLibraryDetailPage
          library={{
            ...library,
            metadata: { sharedTeamIds: ["team-platform"] },
          }}
          api={{ listOrganizationMembers, updateLibrary } as unknown as KnowledgeApi}
          sectionControlsPortalId="knowledge-owner-sections"
          workspaceTeams={[
            {
              id: "team-platform",
              name: "Platform",
              roleId: "admin",
            },
          ]}
          workspaceTeamMembersTeamId="team-platform"
          workspaceTeamMembers={[
            {
              id: "membership-john",
              role: "member",
              user: {
                userId: "user-2",
              },
              profile: {
                displayName: "John Smith",
                email: "john@example.com",
                photoURL: "/img/profiles/john.webp",
              },
            },
          ]}
          activeOrganizationId="organization-personal-1"
          onLibraryChange={vi.fn()}
          onReload={vi.fn(async () => undefined)}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    const ownerSelector = screen.getByRole("button", {
      name: "Choose Knowledge library owner",
    });
    expect((ownerSelector as HTMLButtonElement).disabled).toBe(false);

    fireEvent.click(ownerSelector);
    await waitFor(() => {
      expect(listOrganizationMembers).toHaveBeenCalledWith("organization-personal-1");
    });
    fireEvent.click(await screen.findByRole("option", {
      name: "John Smith, john@example.com",
    }));
    expect(screen.getByRole("alertdialog")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Transfer Ownership" }));

    await waitFor(() => {
      expect(updateLibrary).toHaveBeenCalledWith(
        "library-1",
        expect.objectContaining({
          metadata: expect.objectContaining({
            ownerId: "user-2",
            ownerUserId: "user-2",
            ownerName: "John Smith",
            ownerEmail: "john@example.com",
          }),
          permissionSet: null,
        }),
      );
    });
  });

  it("creates a document before the first explicit save without discarding unsaved drafts", async () => {
    const createdDocument: KnowledgeDocument = {
      ...documents[1],
      id: "document-untitled",
      revisionId: "revision-untitled",
      currentRevisionId: "revision-untitled",
      slug: "untitled-document",
      sortOrder: 2,
      title: "Untitled document",
      name: "Untitled document",
      summary: "",
      description: "",
      markdown: "",
      content: "",
      contentHash: "hash-untitled",
    };
    const createDocument = vi.fn(async () => ({
      library: {
        ...library,
        documents: undefined,
        updatedAt: "2026-08-19T08:00:00.000Z",
      },
      document: createdDocument,
      version: library.versions[0],
    }));
    const onReload = vi.fn(async () => undefined);

    function Harness() {
      const [currentLibrary, setCurrentLibrary] = useState<KnowledgeLibrary>(library);
      return (
        <KnowledgeLibraryDetailPage
          library={currentLibrary}
          api={{ createDocument } as unknown as KnowledgeApi}
          onLibraryChange={setCurrentLibrary}
          onReload={onReload}
        />
      );
    }

    render(<Harness />);

    const nameInput = screen.getByRole("textbox", { name: "Knowledge library name" });
    fireEvent.change(nameInput, { target: { value: "Unsaved handbook name" } });

    const addDocumentButton = screen.getByRole("button", { name: "Add document" });
    expect((addDocumentButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(addDocumentButton);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Create Document" }));

    await waitFor(() => expect(createDocument).toHaveBeenCalledWith("library-1", {
      title: "Untitled document",
      markdown: "",
      sortOrder: 2,
    }));
    const documentNameInput = await screen.findByRole("textbox", {
      name: "Rename Untitled document",
    });
    expect(document.activeElement).toBe(documentNameInput);
    fireEvent.change(documentNameInput, { target: { value: "Incident response" } });
    fireEvent.keyDown(documentNameInput, { key: "Enter" });
    expect(await screen.findByRole("button", { name: "Incident response" })).not.toBeNull();
    expect(
      (screen.getByRole("textbox", { name: "Knowledge document title" }) as HTMLInputElement).value,
    ).toBe("Incident response");
    expect((nameInput as HTMLInputElement).value).toBe("Unsaved handbook name");
    expect(onReload).not.toHaveBeenCalled();
  });
});
