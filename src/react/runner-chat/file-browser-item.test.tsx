import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RunnerFileBrowserItem } from "./file-browser-item.js";
import type { RunnerChatFileNode } from "./workspace-files.js";

describe("RunnerFileBrowserItem", () => {
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
      <RunnerFileBrowserItem {...baseProps} item={folder} />,
    );
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
});
