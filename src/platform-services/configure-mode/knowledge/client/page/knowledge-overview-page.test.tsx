// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  withKnowledgeLibraryCreatorIdentity,
  withKnowledgeLibraryViewerIdentity,
  type KnowledgeLibrary,
} from "../domain/index.js";
import { filterKnowledgeLibrariesByScope } from "./knowledge-overview-model.js";
import { KnowledgeOverviewPage } from "./knowledge-overview-page.js";

afterEach(cleanup);

const library = {
  id: "library-1",
  name: "Product handbook",
  description: "Shared product conventions and decisions.",
  homeDocumentId: "",
  creatorId: "user-1",
  creatorUserId: "user-1",
  creatorName: "Jane Doe",
  creatorEmail: "jane@example.com",
  creatorAvatarUrl: "/jane.png",
  ownerId: "user-1",
  ownerUserId: "user-1",
  ownerName: "Jane Doe",
  ownerEmail: "jane@example.com",
  ownerAvatarUrl: "/jane.png",
  createdAt: "2026-08-17T08:00:00.000Z",
  updatedAt: "2026-08-17T08:00:00.000Z",
  currentVersionId: "version-3",
  currentVersionNumber: 3,
  publishedVersionId: "",
  metadata: {},
  permissionSet: null,
  documents: [],
} satisfies KnowledgeLibrary;

describe("KnowledgeOverviewPage", () => {
  it("persists the signed-in creator and owner identity on new libraries", () => {
    expect(withKnowledgeLibraryCreatorIdentity({
      name: "Product handbook",
      metadata: { retrieval: { mode: "automatic" } },
    }, {
      id: "user-1",
      name: "Jane Doe",
      email: "JANE@example.com",
      avatarUrl: "/jane.png",
    })).toEqual({
      name: "Product handbook",
      metadata: {
        retrieval: { mode: "automatic" },
        creator: {
          id: "user-1",
          userId: "user-1",
          name: "Jane Doe",
          email: "jane@example.com",
          avatarUrl: "/jane.png",
        },
        owner: {
          id: "user-1",
          userId: "user-1",
          name: "Jane Doe",
          email: "jane@example.com",
          avatarUrl: "/jane.png",
        },
      },
    });
  });

  it("repairs legacy Unknown user labels only when the stored IDs match the viewer", () => {
    const sparseLibrary = {
      ...library,
      creatorId: "user-1",
      creatorUserId: "user-1",
      creatorName: "Unknown user",
      creatorEmail: "",
      creatorAvatarUrl: "",
      ownerId: "user-1",
      ownerUserId: "user-1",
      ownerName: "Unknown user",
      ownerEmail: "",
      ownerAvatarUrl: "",
      metadata: {},
    } as KnowledgeLibrary;
    const viewer = {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      avatarUrl: "/jane.png",
    };

    expect(withKnowledgeLibraryViewerIdentity(sparseLibrary, viewer)).toMatchObject({
      creatorName: "Jane Doe",
      creatorEmail: "jane@example.com",
      creatorAvatarUrl: "/jane.png",
      ownerName: "Jane Doe",
      ownerEmail: "jane@example.com",
      ownerAvatarUrl: "/jane.png",
    });
    expect(withKnowledgeLibraryViewerIdentity({
      ...sparseLibrary,
      creatorId: "user-2",
      creatorUserId: "user-2",
      ownerId: "user-2",
      ownerUserId: "user-2",
    }, viewer)).toEqual({
      ...sparseLibrary,
      creatorId: "user-2",
      creatorUserId: "user-2",
      ownerId: "user-2",
      ownerUserId: "user-2",
    });
  });

  it("replaces an email-shaped creator label with the matching viewer name", () => {
    expect(withKnowledgeLibraryViewerIdentity({
      ...library,
      creatorName: "jane@example.com",
      ownerName: "jane@example.com",
    }, {
      id: "user-1",
      name: "Jane Doe",
      email: "jane@example.com",
      avatarUrl: "/jane.png",
    })).toMatchObject({
      creatorName: "Jane Doe",
      ownerName: "Jane Doe",
    });
  });

  it("uses the same overview shell and catalog presentation as Prompts", () => {
    const { container } = render(
      <KnowledgeOverviewPage
        libraries={[library]}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Create reusable knowledge",
      }),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".resource-overview-page.is-skills.is-prompts.is-knowledge",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".resource-overview-table.is-skills.is-prompts.is-knowledge",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".knowledge-overview-identity .resource-overview-identity__visual.is-skill",
      ),
    ).not.toBeNull();
    expect(
      screen.getAllByRole("columnheader").map((header) => header.textContent),
    ).toEqual(["", "Name", "Documents", "Creator", "Updated", ""]);
    expect(screen.getByText("Shared product conventions and decisions.")).not.toBeNull();
    expect(container.querySelector('img[src="/jane.png"]')).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-name-cell")).not.toBeNull();
    expect(container.querySelector(".resource-overview-standard-creator-cell")).not.toBeNull();
    expect(screen.getByPlaceholderText("Search knowledge libraries")).not.toBeNull();
    expect(screen.queryByRole("columnheader", { name: "Version" })).toBeNull();
  });

  it("uses the centralized catalog empty state", () => {
    render(
      <KnowledgeOverviewPage
        libraries={[]}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("No knowledge libraries available.")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Create library" })).not.toBeNull();
  });

  it("centers the centralized loading indicator in the table body", () => {
    const { container } = render(
      <KnowledgeOverviewPage
        libraries={[]}
        loading
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const loadingState = screen.getByRole("status", {
      name: "Loading Knowledge libraries…",
    });
    expect(loadingState.classList.contains("platform-loading-state")).toBe(true);
    expect(loadingState.classList.contains("is-centered")).toBe(true);
    expect(
      container.querySelector(
        '.platform-data-table__state.has-loading-state img[src="/img/spinner.svg"]',
      ),
    ).not.toBeNull();
  });

  it("renders the current project icon for every project-linked library", () => {
    const { container } = render(
      <KnowledgeOverviewPage
        libraries={[{
          ...library,
          metadata: {
            purpose: "project_knowledge",
            projectId: "project-1",
            projectIcon: "rocket",
            projectColor: "#5f6bdc",
          },
        }]}
        projectIdentitiesById={{
          "project-1": {
            id: "project-1",
            name: "Current project",
            icon: "telescope",
            color: "#8d83ff",
            projectType: "research_knowledge",
          },
        }}
        onOpen={vi.fn()}
        onCreate={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    expect(
      container.querySelector("[data-platform-project-icon='telescope']"),
    ).not.toBeNull();
    expect(
      container.querySelector(".knowledge-overview-identity .is-project-linked"),
    ).not.toBeNull();
  });

  it("separates libraries created by the viewer from libraries shared with them", () => {
    const sharedLibrary = {
      ...library,
      id: "library-2",
      name: "Shared handbook",
      creatorUserId: "user-2",
      creatorId: "user-2",
      creatorEmail: "other@example.com",
      creatorName: "Other Person",
    } as KnowledgeLibrary;
    const ownedLibrary = {
      ...library,
      creatorUserId: "user-1",
      creatorId: "user-1",
      creatorEmail: "viewer@example.com",
    } as KnowledgeLibrary;
    const viewer = {
      id: "user-1",
      name: "Jane Doe",
      email: "viewer@example.com",
    };

    expect(
      filterKnowledgeLibrariesByScope(
        [ownedLibrary, sharedLibrary],
        "created",
        viewer,
      ).map((item) => item.id),
    ).toEqual(["library-1"]);
    expect(
      filterKnowledgeLibrariesByScope(
        [ownedLibrary, sharedLibrary],
        "shared",
        viewer,
      ).map((item) => item.id),
    ).toEqual(["library-2"]);
  });
});
