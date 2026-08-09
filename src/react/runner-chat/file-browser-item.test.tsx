// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RunnerFileBrowserItem } from "./file-browser-item.js";
import type { RunnerChatFileNode } from "./workspace-files.js";

describe("RunnerFileBrowserItem", () => {
  afterEach(() => cleanup());

  it("renders an expanded hierarchy without parent-owned recursion", () => {
    const folder: RunnerChatFileNode = {
      id: "/workspace",
      name: "workspace",
      isFolder: true,
    };
    const child: RunnerChatFileNode = {
      id: "/workspace/readme.md",
      parentId: "/workspace",
      name: "readme.md",
      isFolder: false,
      mimeType: "text/markdown",
      size: 42,
    };
    const html = renderToStaticMarkup(
      <RunnerFileBrowserItem
        allItems={[folder, child]}
        backendUrl="https://api.example.com"
        branchLoadingRepoFullNames={[]}
        branchesByRepoFullName={{}}
        buildEffectiveGithubRootItem={(item) => item}
        expandedFolderIds={[folder.id]}
        githubLoadingFolderIds={[]}
        googleDriveLoadingFolderIds={[]}
        item={folder}
        onBranchChange={vi.fn()}
        onEnsureBranchesLoaded={vi.fn()}
        onItemClick={vi.fn()}
        onOpenItem={vi.fn()}
        onToggleSelection={vi.fn()}
        onToggleFolder={vi.fn()}
        onToggleGithubSelection={vi.fn()}
        oneDriveLoadingFolderIds={[]}
        previewItemId={null}
        resolveSelectedGithubBranch={() => "main"}
        searchQuery=""
        selectedItemIds={[]}
        source="workspace"
        workspaceFolderErrorsById={{}}
        workspaceEnvironmentId="computer_1"
        workspaceLoadingFolderIds={[]}
      />,
    );

    expect(html).toContain(">workspace</span>");
    expect(html).toContain(">readme.md</span>");
    expect(html).toContain('style="padding-left:32px"');
  });

  it("uses workspace thumbnails for image rows", () => {
    const image: RunnerChatFileNode = {
      id: "assets/hero image.png",
      name: "hero image.png",
      path: "/assets/hero image.png",
      isFolder: false,
      mimeType: "image/png",
    };
    const html = renderToStaticMarkup(
      <RunnerFileBrowserItem
        allItems={[image]}
        backendUrl="https://api.example.com"
        branchLoadingRepoFullNames={[]}
        branchesByRepoFullName={{}}
        buildEffectiveGithubRootItem={(item) => item}
        expandedFolderIds={[]}
        githubLoadingFolderIds={[]}
        googleDriveLoadingFolderIds={[]}
        item={image}
        onBranchChange={vi.fn()}
        onEnsureBranchesLoaded={vi.fn()}
        onItemClick={vi.fn()}
        onOpenItem={vi.fn()}
        onToggleSelection={vi.fn()}
        onToggleFolder={vi.fn()}
        onToggleGithubSelection={vi.fn()}
        oneDriveLoadingFolderIds={[]}
        previewItemId={null}
        resolveSelectedGithubBranch={() => "main"}
        searchQuery=""
        selectedItemIds={[]}
        source="workspace"
        workspaceFolderErrorsById={{}}
        workspaceEnvironmentId="computer a"
        workspaceLoadingFolderIds={[]}
      />,
    );

    expect(html).toContain(
      "https://api.example.com/environments/computer%20a/files/thumbnail/assets/hero%20image.png?w=64&amp;h=64",
    );
    expect(html).toContain("platform-file-explorer__thumbnail");
  });

  it("uses the same folder and document artwork as the Files page", () => {
    const folder: RunnerChatFileNode = {
      id: "documents",
      name: "documents",
      isFolder: true,
    };
    const document: RunnerChatFileNode = {
      id: "documents/report.pdf",
      name: "report.pdf",
      isFolder: false,
      mimeType: "application/pdf",
    };
    const baseProps = {
      allItems: [folder, document],
      backendUrl: "https://api.example.com",
      branchLoadingRepoFullNames: [],
      branchesByRepoFullName: {},
      buildEffectiveGithubRootItem: (item: RunnerChatFileNode) => item,
      expandedFolderIds: [],
      githubLoadingFolderIds: [],
      googleDriveLoadingFolderIds: [],
      onBranchChange: vi.fn(),
      onEnsureBranchesLoaded: vi.fn(),
      onItemClick: vi.fn(),
      onOpenItem: vi.fn(),
      onToggleSelection: vi.fn(),
      onToggleFolder: vi.fn(),
      onToggleGithubSelection: vi.fn(),
      oneDriveLoadingFolderIds: [],
      previewItemId: null,
      resolveSelectedGithubBranch: () => "main",
      searchQuery: "",
      selectedItemIds: [],
      source: "workspace" as const,
      workspaceFolderErrorsById: {},
      workspaceEnvironmentId: "computer_1",
      workspaceLoadingFolderIds: [],
    };

    const folderHtml = renderToStaticMarkup(<RunnerFileBrowserItem {...baseProps} item={folder} />);
    const documentHtml = renderToStaticMarkup(
      <RunnerFileBrowserItem {...baseProps} item={document} />,
    );

    expect(folderHtml).toContain("platform-file-explorer__file-icon");
    expect(folderHtml).toContain("is-folder");
    expect(folderHtml).toContain("folder.png");
    expect(documentHtml).toContain("platform-file-explorer__file-icon");
    expect(documentHtml).toContain("is-pdf");
    expect(documentHtml).toContain("txtfile.png");
    expect(folderHtml).toContain("<img");
    expect(documentHtml).toContain("<img");
    expect(documentHtml).not.toContain("platform-file-explorer__thumbnail");
  });

  it("never uses thumbnails for non-image previews or image-named folders", () => {
    const imageNamedFolder: RunnerChatFileNode = {
      id: "exports/photo.png",
      name: "photo.png",
      path: "/exports/photo.png",
      isFolder: true,
      previewUrl: "/preview/photo.png",
    };
    const documentWithPreview: RunnerChatFileNode = {
      id: "exports/report.pdf",
      name: "report.pdf",
      path: "/exports/report.pdf",
      isFolder: false,
      mimeType: "application/pdf",
      previewUrl: "/preview/report.png",
    };
    const baseProps = {
      allItems: [imageNamedFolder, documentWithPreview],
      backendUrl: "https://api.example.com",
      branchLoadingRepoFullNames: [],
      branchesByRepoFullName: {},
      buildEffectiveGithubRootItem: (item: RunnerChatFileNode) => item,
      expandedFolderIds: [],
      githubLoadingFolderIds: [],
      googleDriveLoadingFolderIds: [],
      onBranchChange: vi.fn(),
      onEnsureBranchesLoaded: vi.fn(),
      onItemClick: vi.fn(),
      onOpenItem: vi.fn(),
      onToggleSelection: vi.fn(),
      onToggleFolder: vi.fn(),
      onToggleGithubSelection: vi.fn(),
      oneDriveLoadingFolderIds: [],
      previewItemId: null,
      resolveSelectedGithubBranch: () => "main",
      searchQuery: "",
      selectedItemIds: [],
      source: "workspace" as const,
      workspaceFolderErrorsById: {},
      workspaceEnvironmentId: "computer_1",
      workspaceLoadingFolderIds: [],
    };

    const folderHtml = renderToStaticMarkup(
      <RunnerFileBrowserItem {...baseProps} item={imageNamedFolder} />,
    );
    const documentHtml = renderToStaticMarkup(
      <RunnerFileBrowserItem {...baseProps} item={documentWithPreview} />,
    );

    expect(folderHtml).not.toContain("platform-file-explorer__thumbnail");
    expect(documentHtml).not.toContain("platform-file-explorer__thumbnail");
    expect(folderHtml).toContain("folder.png");
    expect(documentHtml).toContain("txtfile.png");
  });

  it("selects from the checkbox without opening the preview", () => {
    const file: RunnerChatFileNode = {
      id: "notes.txt",
      name: "notes.txt",
      isFolder: false,
      mimeType: "text/plain",
    };
    const onItemClick = vi.fn();
    const onToggleSelection = vi.fn();
    render(
      <RunnerFileBrowserItem
        allItems={[file]}
        backendUrl="https://api.example.com"
        branchLoadingRepoFullNames={[]}
        branchesByRepoFullName={{}}
        buildEffectiveGithubRootItem={(item) => item}
        expandedFolderIds={[]}
        githubLoadingFolderIds={[]}
        googleDriveLoadingFolderIds={[]}
        item={file}
        onBranchChange={vi.fn()}
        onEnsureBranchesLoaded={vi.fn()}
        onItemClick={onItemClick}
        onOpenItem={vi.fn()}
        onToggleSelection={onToggleSelection}
        onToggleFolder={vi.fn()}
        onToggleGithubSelection={vi.fn()}
        oneDriveLoadingFolderIds={[]}
        previewItemId={null}
        resolveSelectedGithubBranch={() => "main"}
        searchQuery=""
        selectedItemIds={[]}
        source="workspace"
        workspaceFolderErrorsById={{}}
        workspaceEnvironmentId="computer_1"
        workspaceLoadingFolderIds={[]}
      />,
    );

    fireEvent.click(screen.getByRole("checkbox", { name: "Select file" }));

    expect(onToggleSelection).toHaveBeenCalledWith(file);
    expect(onItemClick).not.toHaveBeenCalled();
  });

  it("opens the selected item from the minimal action menu", () => {
    const file: RunnerChatFileNode = {
      id: "notes.txt",
      name: "notes.txt",
      isFolder: false,
      mimeType: "text/plain",
    };
    const onOpenItem = vi.fn();
    render(
      <RunnerFileBrowserItem
        allItems={[file]}
        backendUrl="https://api.example.com"
        branchLoadingRepoFullNames={[]}
        branchesByRepoFullName={{}}
        buildEffectiveGithubRootItem={(item) => item}
        expandedFolderIds={[]}
        githubLoadingFolderIds={[]}
        googleDriveLoadingFolderIds={[]}
        item={file}
        onBranchChange={vi.fn()}
        onEnsureBranchesLoaded={vi.fn()}
        onItemClick={vi.fn()}
        onOpenItem={onOpenItem}
        onRenameItem={vi.fn()}
        onDeleteItem={vi.fn()}
        onToggleSelection={vi.fn()}
        onToggleFolder={vi.fn()}
        onToggleGithubSelection={vi.fn()}
        oneDriveLoadingFolderIds={[]}
        previewItemId={null}
        resolveSelectedGithubBranch={() => "main"}
        searchQuery=""
        selectedItemIds={[]}
        source="workspace"
        workspaceFolderErrorsById={{}}
        workspaceEnvironmentId="computer_1"
        workspaceLoadingFolderIds={[]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions for notes.txt" }));
    expect(screen.getByRole("menu").classList.contains("is-minimal")).toBe(true);
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Delete" })).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Open" }));

    expect(onOpenItem).toHaveBeenCalledWith(file);
  });
});
