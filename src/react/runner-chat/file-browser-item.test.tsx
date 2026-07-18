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
        workspaceLoadingFolderIds={[]}
      />,
    );

    expect(html).toContain(">workspace</span>");
    expect(html).toContain(">readme.md</span>");
    expect(html).toContain('style="padding-left:32px"');
  });
});
