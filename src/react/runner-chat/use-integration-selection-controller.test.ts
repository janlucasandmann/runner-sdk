// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerIntegrationSelectionController } from "./use-integration-selection-controller.js";

const githubRepositories = [
  { id: "repository-1", name: "Platform" },
  { id: "repository-2", name: "Backend" },
];
const githubContexts = [
  { id: "main", name: "main" },
  { id: "develop", name: "develop" },
];
const notionDatabases = [
  { id: "database-1", name: "Research" },
  { id: "database-2", name: "Tasks" },
];

describe("useRunnerIntegrationSelectionController", () => {
  it("normalizes controlled selections against available options", () => {
    const { result, rerender } = renderHook(
      ({
        repositoryId,
        contextId,
        databaseId,
      }: {
        repositoryId: string;
        contextId: string;
        databaseId: string;
      }) =>
        useRunnerIntegrationSelectionController({
          githubContexts,
          githubRepositories,
          notionDatabases,
          selectedGithubRepositoryId: repositoryId,
          selectedGithubContextId: contextId,
          selectedNotionDatabaseId: databaseId,
        }),
      {
        initialProps: {
          repositoryId: "repository-2",
          contextId: "develop",
          databaseId: "database-2",
        },
      },
    );

    expect(result.current.selectedGithubRepositoryId).toBe("repository-2");
    expect(result.current.selectedGithubContextId).toBe("develop");
    expect(result.current.selectedNotionDatabaseId).toBe("database-2");

    rerender({
      repositoryId: "missing",
      contextId: "missing",
      databaseId: "missing",
    });

    expect(result.current.selectedGithubRepositoryId).toBe("repository-2");
    expect(result.current.selectedGithubContextId).toBe("develop");
    expect(result.current.selectedNotionDatabaseId).toBe("database-2");
  });

  it("keeps source folder state local and emits explicit selection changes", () => {
    const onGithubRepositoryChange = vi.fn();
    const onGithubContextChange = vi.fn();
    const onNotionDatabaseChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerIntegrationSelectionController({
        githubContexts,
        githubRepositories,
        notionDatabases,
        onGithubRepositoryChange,
        onGithubContextChange,
        onNotionDatabaseChange,
      }),
    );

    act(() => {
      result.current.selectGithubRepository("repository-2");
      result.current.selectGithubContext("develop");
      result.current.selectNotionDatabase("database-2");
      result.current.setGoogleDriveFolderId("drive-folder");
      result.current.setOneDriveFolderId("one-drive-folder");
    });

    expect(onGithubRepositoryChange).toHaveBeenCalledWith("repository-2");
    expect(onGithubContextChange).toHaveBeenCalledWith("develop");
    expect(onNotionDatabaseChange).toHaveBeenCalledWith("database-2");
    expect(result.current.googleDriveFolderId).toBe("drive-folder");
    expect(result.current.oneDriveFolderId).toBe("one-drive-folder");
  });
});
