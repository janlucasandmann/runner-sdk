import { describe, expect, it } from "vitest";
import {
  buildSelectedGithubRepoReference,
  createGithubBrowserNodeId,
  getAttachmentDisplayName,
  isGithubAttachmentSelection,
  parseGithubBrowserFolderId,
} from "./attachment-utils.js";

describe("runner attachment utilities", () => {
  it("prefers repository context carried by GitHub attachments", () => {
    expect(buildSelectedGithubRepoReference([
      {
        id: "github-1",
        file: new File([""], "README.md"),
        type: "document",
        source: "integration",
        integrationSource: "github",
        githubRepoFullName: "computer-agents/platform",
        githubRef: "feature/refactor",
      },
    ], {
      repositories: [],
      contexts: [],
      selectedRepositoryId: "",
      selectedContextId: "",
    })).toEqual({
      repoFullName: "computer-agents/platform",
      repoName: "platform",
      branch: "feature/refactor",
    });
  });

  it("falls back to the active repository selector", () => {
    expect(buildSelectedGithubRepoReference([], {
      repositories: [{ id: "computer-agents/platform", name: "Platform" }],
      contexts: [{ id: "main-id", name: "main" }],
      selectedRepositoryId: "computer-agents/platform",
      selectedContextId: "main-id",
    })).toEqual({
      repoFullName: "computer-agents/platform",
      repoName: "Platform",
      branch: "main",
    });
  });

  it("round-trips GitHub browser node identities", () => {
    const id = createGithubBrowserNodeId(
      "computer-agents/platform",
      "src/react/runner chat.tsx",
      "feature/refactor"
    );

    expect(parseGithubBrowserFolderId(id)).toEqual({
      repoFullName: "computer-agents/platform",
      path: "src/react/runner chat.tsx",
      ref: "feature/refactor",
      isRoot: false,
    });
  });

  it("uses repository context for GitHub attachment labels", () => {
    const attachment = {
      id: "attachment",
      filename: "runner-chat.tsx",
      mimeType: "text/plain",
      size: 1,
      type: "document" as const,
      uploadedAt: new Date(0).toISOString(),
      integrationSource: "github" as const,
      githubRepoFullName: "computer-agents/platform",
      githubItemPath: "src/react/runner-chat.tsx",
      githubSelectionType: "file" as const,
    };

    expect(isGithubAttachmentSelection(attachment)).toBe(true);
    expect(getAttachmentDisplayName(attachment)).toBe(
      "platform/runner-chat.tsx"
    );
  });
});
