// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { KnowledgeApi } from "../api/index.js";
import type { KnowledgeDocument, KnowledgeLibrary } from "../domain/index.js";
import { KnowledgeLibraryDetailPage } from "./knowledge-library-detail-page.js";

beforeAll(() => {
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
    () =>
      ({
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
      }) as unknown as CanvasRenderingContext2D,
  );
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
  versions: [
    {
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
    },
  ],
} satisfies KnowledgeLibrary;

describe("KnowledgeLibraryDetailPage", () => {
  it("uses the linked project's current icon and color for project strategy libraries", () => {
    const { container } = render(
      <>
        <div id="knowledge-project-sections" />
        <KnowledgeLibraryDetailPage
          library={{
            ...library,
            metadata: {
              purpose: "project_knowledge",
              projectId: "project-1",
            },
          }}
          relatedProjectIdentity={{
            id: "project-1",
            name: "Research project",
            icon: "telescope",
            color: "#8d83ff",
            projectType: "research_knowledge",
          }}
          api={{} as KnowledgeApi}
          sectionControlsPortalId="knowledge-project-sections"
          onLibraryChange={vi.fn()}
          onReload={vi.fn(async () => undefined)}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));

    expect(screen.getByRole("heading", { name: "Connectors" })).not.toBeNull();
    expect(screen.getByText("Managed at project level")).not.toBeNull();
    expect(
      screen.getByText(
        "Connector synchronization for this Strategy Knowledge library has to be changed in the project settings.",
      ),
    ).not.toBeNull();
    screen.getAllByRole("button", { name: "Manage" }).forEach((button) => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    const identityIcon = container.querySelector(
      "[data-platform-resource-settings-identity='true'] .knowledge-library-identity__icon.is-project-linked",
    );
    expect(identityIcon).not.toBeNull();
    expect(identityIcon?.querySelector("[data-platform-project-icon='telescope']")).not.toBeNull();
    expect(
      (identityIcon as HTMLElement).style.getPropertyValue("--knowledge-project-icon-color"),
    ).toBe("#8d83ff");
  });

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
    expect(
      container.querySelector('[data-platform-code-editor-workspace-variant="minimalistic-ui"]'),
    ).not.toBeNull();
    expect(container.querySelector(".knowledge-detail-page__identity")).toBeNull();
    expect(container.querySelector(".platform-instructions-editor__header")).toBeNull();
    expect(
      container.querySelector('[data-platform-instructions-editor-variant="block-editor"]'),
    ).not.toBeNull();
    expect(screen.getByRole("radio", { name: "Library" })).not.toBeNull();
    expect(screen.getByText("Documents")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Overview" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Runbooks" })).not.toBeNull();
    expect(screen.queryByRole("table")).toBeNull();
    expect(container.querySelector("#knowledge-controls button")?.textContent).toContain(
      "Save Changes",
    );
    expect(
      (screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Open Knowledge library version history" }),
    ).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Open Knowledge library version history" }));
    await waitFor(() => expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(true));
    fireEvent.click(await screen.findByRole("button", { name: "Close version history" }));
    await waitFor(() => expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(false));

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    expect(
      container.querySelector(".knowledge-detail-page.file-resource-detail-page.is-settings-tab"),
    ).not.toBeNull();
    expect(
      container.querySelector(
        "[data-platform-resource-settings-identity='true'].knowledge-library-identity",
      ),
    ).not.toBeNull();
    const libraryName = screen.getByRole("textbox", { name: "Knowledge library name" });
    expect(libraryName.tagName).toBe("TEXTAREA");
    expect((libraryName as HTMLTextAreaElement).rows).toBe(1);
    expect((libraryName as HTMLTextAreaElement).value).toBe("Product handbook");
    expect(
      (screen.getByRole("textbox", { name: "Knowledge library description" }) as HTMLInputElement)
        .value,
    ).toBe("Shared product conventions and decisions.");
    fireEvent.change(screen.getByRole("textbox", { name: "Knowledge library name" }), {
      target: { value: "Product handbook 2" },
    });
    expect(container.querySelector(".knowledge-detail-page__settings-content")).not.toBeNull();
    expect(
      container.querySelector(".knowledge-detail-sidebar.playground-agents-detail-sidebar"),
    ).not.toBeNull();
    expect(screen.getByText("Location")).not.toBeNull();
    expect(screen.getByText("Updated")).not.toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Library" }));

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
    const documentTitle = screen.getByRole("textbox", { name: "Knowledge document title" });
    expect(documentTitle.tagName).toBe("TEXTAREA");
    expect((documentTitle as HTMLTextAreaElement).rows).toBe(1);
    expect((documentTitle as HTMLTextAreaElement).value).toBe("Runbooks");
    expect(screen.getByRole("textbox", { name: "Runbooks content" })).not.toBeNull();
    expect(container.querySelector(".platform-instructions-editor__header")).toBeNull();

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

  it("adds and persists a full-width library cover from the focused document title", async () => {
    const onLibraryChange = vi.fn();
    const updateLibrary = vi.fn(async (_libraryId: string, input: Partial<KnowledgeLibrary>) => ({
      ...library,
      ...input,
    }));
    const uploadLibraryCover = vi.fn(async () => ({
      ...library,
      cover: {
        schemaVersion: "computer_agents_knowledge_cover_v1" as const,
        type: "image" as const,
        assetId: "knowledge-cover-1",
        src: "/knowledge/library-1/cover/image?asset=knowledge-cover-1",
        name: "library-cover.webp",
        mimeType: "image/webp",
        source: "upload" as const,
        positionX: 50,
        positionY: 50,
        zoom: 1,
      },
    }));
    const { container } = render(
      <KnowledgeLibraryDetailPage
        library={library}
        api={{ updateLibrary, uploadLibraryCover } as unknown as KnowledgeApi}
        onLibraryChange={onLibraryChange}
        onReload={vi.fn(async () => undefined)}
      />,
    );

    const title = screen.getByRole("textbox", { name: "Knowledge document title" });
    fireEvent.focus(title);
    fireEvent.click(screen.getByRole("button", { name: "Add Cover" }));

    await waitFor(() => {
      expect(updateLibrary).toHaveBeenCalledWith("library-1", {
        cover: {
          schemaVersion: "computer_agents_knowledge_cover_v1",
          type: "gradient",
          preset: "blue",
        },
      });
    });
    expect(container.querySelector(".knowledge-library-cover")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cover Settings" }));
    expect(screen.getByRole("menu", { name: "Cover settings" })).not.toBeNull();
    fireEvent.click(screen.getByRole("menuitem", { name: "Upload image" }));

    const image = new File(["cover-bytes"], "library-cover.png", { type: "image/png" });
    fireEvent.change(screen.getByLabelText("Upload cover image"), {
      target: { files: [image] },
    });
    const cropModal = await screen.findByRole("dialog", { name: "Adjust cover" });
    expect(uploadLibraryCover).not.toHaveBeenCalled();
    const sourcePreview = cropModal.querySelector(
      ".knowledge-library-cover-crop-modal__source-preview",
    );
    expect(sourcePreview).not.toBeNull();
    fireEvent.load(sourcePreview as HTMLImageElement);
    fireEvent.click(within(cropModal).getByRole("button", { name: "Apply" }));
    await waitFor(() => {
      expect(uploadLibraryCover).toHaveBeenCalledWith("library-1", {
        file: image,
        filename: "library-cover.png",
        source: "upload",
        positionX: 50,
        positionY: 50,
        zoom: 1,
      });
    });
    expect(onLibraryChange).toHaveBeenCalledWith(
      expect.objectContaining({
        cover: expect.objectContaining({ type: "gradient", preset: "blue" }),
      }),
    );
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
    fireEvent.click(screen.getByRole("row", { name: "Edit permissions for Platform" }));

    await waitFor(() => {
      expect(container.querySelector('[data-platform-resource-access-view="team"]')).not.toBeNull();
    });
    const page = container.querySelector(".knowledge-detail-page");
    expect(page?.classList.contains("is-sidebar-empty")).toBe(true);
    expect(page?.classList.contains("has-sidebar")).toBe(false);
    expect(page?.classList.contains("is-access-detail-view")).toBe(true);
    expect(
      container.querySelector(".knowledge-detail-sidebar.playground-agents-detail-sidebar"),
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
      container.querySelector(
        "[data-platform-resource-settings-page='true'].is-access-detail-open",
      ),
    ).not.toBeNull();
    expect(screen.queryByText("Location")).toBeNull();
  });

  it("enables ownership transfer with the resolved active organization", async () => {
    const listOrganizationMembers = vi.fn(async () => [
      {
        userId: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
      },
    ]);
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
    fireEvent.click(
      await screen.findByRole("option", {
        name: "John Smith, john@example.com",
      }),
    );
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

  it("resolves the creator's real organization profile in the details sidebar", async () => {
    const listOrganizationMembers = vi.fn(async () => [
      {
        userId: "user-1",
        profile: {
          displayName: "Jane Doe",
          email: "jane@example.com",
          photoURL: "/img/profiles/jane.webp",
        },
      },
    ]);
    const { container } = render(
      <>
        <div id="knowledge-creator-controls" />
        <div id="knowledge-creator-sections" />
        <KnowledgeLibraryDetailPage
          library={{
            ...library,
            creatorName: "jane@example.com",
            creatorAvatarUrl: "",
            ownerId: "user-2",
            ownerUserId: "user-2",
            ownerName: "Other Owner",
            ownerEmail: "owner@example.com",
          }}
          api={{ listOrganizationMembers } as unknown as KnowledgeApi}
          controlsPortalId="knowledge-creator-controls"
          sectionControlsPortalId="knowledge-creator-sections"
          activeOrganizationId="organization-personal-1"
          onLibraryChange={vi.fn()}
          onReload={vi.fn(async () => undefined)}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    await waitFor(() => {
      expect(listOrganizationMembers).toHaveBeenCalledWith("organization-personal-1");
      expect(
        container.querySelector(".platform-resource-detail-sidebar__creator-row")?.textContent,
      ).toContain("Jane Doe");
    });
    expect(
      container.querySelector(
        '.platform-resource-detail-sidebar__creator-row img[src="/img/profiles/jane.webp"]',
      ),
    ).not.toBeNull();
  });

  it("uses the resolved owner profile for the creator when both identities match", () => {
    const { container } = render(
      <>
        <div id="knowledge-matching-creator-controls" />
        <div id="knowledge-matching-creator-sections" />
        <KnowledgeLibraryDetailPage
          library={{
            ...library,
            creatorName: "JaneLegacyHandle",
            creatorEmail: "",
            ownerName: "Jane Doe",
            ownerEmail: "jane@example.com",
            ownerAvatarUrl: "/img/profiles/jane.webp",
          }}
          api={{} as KnowledgeApi}
          controlsPortalId="knowledge-matching-creator-controls"
          sectionControlsPortalId="knowledge-matching-creator-sections"
          onLibraryChange={vi.fn()}
          onReload={vi.fn(async () => undefined)}
        />
      </>,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    expect(
      container.querySelector(".platform-resource-detail-sidebar__creator-row")?.textContent,
    ).toContain("Jane Doe");
    expect(
      container.querySelector(
        '.platform-resource-detail-sidebar__creator-row img[src="/img/profiles/jane.webp"]',
      ),
    ).not.toBeNull();
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
        <>
          <div id="knowledge-create-document-sections" />
          <KnowledgeLibraryDetailPage
            library={currentLibrary}
            api={{ createDocument } as unknown as KnowledgeApi}
            sectionControlsPortalId="knowledge-create-document-sections"
            onLibraryChange={setCurrentLibrary}
            onReload={onReload}
          />
        </>
      );
    }

    render(<Harness />);

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    const nameInput = screen.getByRole("textbox", { name: "Knowledge library name" });
    fireEvent.change(nameInput, { target: { value: "Unsaved handbook name" } });
    fireEvent.click(screen.getByRole("radio", { name: "Library" }));

    const addDocumentButton = screen.getByRole("button", { name: "Add document" });
    expect((addDocumentButton as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(addDocumentButton);
    fireEvent.click(await screen.findByRole("menuitem", { name: "Create Document" }));

    await waitFor(() =>
      expect(createDocument).toHaveBeenCalledWith("library-1", {
        title: "Untitled document",
        markdown: "",
        sortOrder: 2,
      }),
    );
    const documentNameInput = await screen.findByRole("textbox", {
      name: "Rename Untitled document",
    });
    expect(document.activeElement).toBe(documentNameInput);
    fireEvent.change(documentNameInput, { target: { value: "Incident response" } });
    fireEvent.keyDown(documentNameInput, { key: "Enter" });
    expect(await screen.findByRole("button", { name: "Incident response" })).not.toBeNull();
    expect(screen.getByRole("textbox", { name: "Incident response content" })).not.toBeNull();
    expect(
      (screen.getByRole("textbox", { name: "Knowledge document title" }) as HTMLInputElement).value,
    ).toBe("Incident response");
    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));
    expect(
      (screen.getByRole("textbox", { name: "Knowledge library name" }) as HTMLInputElement).value,
    ).toBe("Unsaved handbook name");
    expect(onReload).not.toHaveBeenCalled();
  });

  it("imports dropped text documents and images into the Knowledge files sidebar", async () => {
    const importedDocuments: KnowledgeDocument[] = [];
    const parseEditorDocument = vi.fn(async () => ({
      object: "knowledge.document_parse" as const,
      markdown: "# Converted report\n\n<!-- page 1 -->\nGrounded evidence.",
      provider: "firecrawl" as const,
      metadata: { title: "Converted report", numPages: 1 },
      conversion: {
        provider: "firecrawl" as const,
        format: "markdown" as const,
        convertedAt: "2026-08-28T08:00:00.000Z",
        zeroDataRetention: true,
        pdfMode: "auto" as const,
        pageMarkers: true,
        creditsUsed: 1,
      },
    }));
    const uploadEditorAttachments = vi.fn(async (files: File[]) =>
      files.map((file, index) => ({
        src: `/api/attachments/attachment-${index + 1}`,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        attachmentId: `attachment-${index + 1}`,
        metadata: {},
      })),
    );
    const resolveEditorAttachmentPreview = vi.fn(async () => "/api/attachments/preview");
    const createDocument = vi.fn(
      async (
        _libraryId: string,
        input: {
          title: string;
          markdown?: string;
          summary?: string;
          sortOrder?: number;
          provenance?: Record<string, unknown>;
        },
      ) => {
        const document: KnowledgeDocument = {
          ...documents[1],
          id: `document-import-${importedDocuments.length + 1}`,
          revisionId: `revision-import-${importedDocuments.length + 1}`,
          currentRevisionId: `revision-import-${importedDocuments.length + 1}`,
          slug: `import-${importedDocuments.length + 1}`,
          sortOrder: input.sortOrder || 0,
          title: input.title,
          name: input.title,
          summary: input.summary || "",
          markdown: input.markdown || "",
          content: input.markdown || "",
          provenance: input.provenance || {},
        };
        importedDocuments.push(document);
        return {
          library: { ...library, documents: [...documents, ...importedDocuments] },
          document,
          version: library.versions[0],
        };
      },
    );

    function Harness() {
      const [currentLibrary, setCurrentLibrary] = useState<KnowledgeLibrary>(library);
      return (
        <KnowledgeLibraryDetailPage
          library={currentLibrary}
          api={
            {
              createDocument,
              parseEditorDocument,
              uploadEditorAttachments,
              resolveEditorAttachmentPreview,
            } as unknown as KnowledgeApi
          }
          onLibraryChange={setCurrentLibrary}
          onReload={vi.fn(async () => undefined)}
        />
      );
    }

    const { container } = render(<Harness />);
    const sidebar = container.querySelector(
      ".platform-code-editor-workspace__sidebar",
    ) as HTMLElement;
    const guide = new File(["# Imported guide\n\nGround every answer."], "guide.md", {
      type: "text/markdown",
    });
    const image = new File(["image-bytes"], "diagram.png", { type: "image/png" });
    const report = new File(["pdf-bytes"], "report.pdf", { type: "application/pdf" });
    const dataTransfer = {
      files: [guide, image, report],
      items: [
        { kind: "file", type: "text/markdown" },
        { kind: "file", type: "image/png" },
        { kind: "file", type: "application/pdf" },
      ],
      types: ["Files"],
      dropEffect: "none",
    };

    fireEvent.dragOver(sidebar, { dataTransfer });
    expect(screen.getByText("Drop files to add")).not.toBeNull();
    fireEvent.drop(sidebar, { dataTransfer });

    await waitFor(() => expect(createDocument).toHaveBeenCalledTimes(3));
    expect(createDocument).toHaveBeenNthCalledWith(
      1,
      "library-1",
      expect.objectContaining({
        title: "guide.md",
        markdown: "# Imported guide\n\nGround every answer.",
        provenance: expect.objectContaining({ sourceKind: "local_file_drop" }),
      }),
    );
    expect(uploadEditorAttachments).toHaveBeenNthCalledWith(1, [image]);
    expect(createDocument).toHaveBeenNthCalledWith(
      2,
      "library-1",
      expect.objectContaining({
        title: "diagram.png",
        markdown: expect.stringContaining("/api/attachments/attachment-1"),
        provenance: expect.objectContaining({ sourceKind: "local_file_drop" }),
      }),
    );
    expect(parseEditorDocument).toHaveBeenCalledWith(report);
    expect(uploadEditorAttachments).toHaveBeenNthCalledWith(2, [report]);
    expect(createDocument).toHaveBeenNthCalledWith(
      3,
      "library-1",
      expect.objectContaining({
        title: "report.md",
        markdown: expect.stringContaining("<!-- page 1 -->"),
        summary: "Imported and converted from report.pdf.",
        provenance: expect.objectContaining({
          sourceKind: "local_file_drop",
          sourceAttachment: expect.objectContaining({ name: "report.pdf" }),
          conversion: expect.objectContaining({ provider: "firecrawl", pageMarkers: true }),
        }),
      }),
    );
    expect(await screen.findByRole("button", { name: "guide.md" })).not.toBeNull();
    expect(await screen.findByRole("button", { name: "diagram.png" })).not.toBeNull();
    expect(await screen.findByRole("button", { name: "report.md" })).not.toBeNull();
  });

  it("surfaces PDF conversion failures instead of silently storing an attachment-only document", async () => {
    const parseEditorDocument = vi.fn(async () => {
      throw new Error("Firecrawl could not convert this PDF.");
    });
    const uploadEditorAttachments = vi.fn();
    const createDocument = vi.fn();

    const { container } = render(
      <KnowledgeLibraryDetailPage
        library={library}
        api={
          {
            createDocument,
            parseEditorDocument,
            uploadEditorAttachments,
          } as unknown as KnowledgeApi
        }
        onLibraryChange={vi.fn()}
        onReload={vi.fn(async () => undefined)}
      />,
    );

    const sidebar = container.querySelector(
      ".platform-code-editor-workspace__sidebar",
    ) as HTMLElement;
    const report = new File(["pdf-bytes"], "report.pdf", { type: "application/pdf" });
    const dataTransfer = {
      files: [report],
      items: [{ kind: "file", type: "application/pdf" }],
      types: ["Files"],
      dropEffect: "none",
    };

    fireEvent.drop(sidebar, { dataTransfer });

    expect(await screen.findByText("Firecrawl could not convert this PDF.")).not.toBeNull();
    expect(parseEditorDocument).toHaveBeenCalledWith(report);
    expect(uploadEditorAttachments).not.toHaveBeenCalled();
    expect(createDocument).not.toHaveBeenCalled();
  });
});
