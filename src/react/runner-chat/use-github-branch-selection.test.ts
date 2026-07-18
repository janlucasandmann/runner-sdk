// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerGithubBranchSelection } from "./use-github-branch-selection.js";

describe("useRunnerGithubBranchSelection", () => {
  it("maps repository roots to the effective branch", () => {
    const { result } = renderHook(() =>
      useRunnerGithubBranchSelection({ defaultBranch: "develop" }),
    );

    expect(
      result.current.buildEffectiveRootItem({
        id: "repo",
        name: "Platform",
        repoFullName: "company/platform",
        isFolder: true,
      }),
    ).toEqual(
      expect.objectContaining({
        id: "github-repo:company%2Fplatform:develop",
        ref: "develop",
      }),
    );
  });

  it("deduplicates concurrent branch requests and caches their result", async () => {
    let resolveBranches: ((branches: Array<{ id: string; name: string }>) => void) | null = null;
    const fetchBranches = vi.fn(
      () =>
        new Promise<Array<{ id: string; name: string }>>((resolve) => {
          resolveBranches = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useRunnerGithubBranchSelection({
        defaultBranch: "main",
        fetchBranches,
      }),
    );

    act(() => {
      void result.current.ensureBranchesLoaded("company/platform");
      void result.current.ensureBranchesLoaded("company/platform");
    });
    expect(fetchBranches).toHaveBeenCalledOnce();

    act(() => {
      resolveBranches?.([{ id: "develop", name: "develop" }]);
    });
    await waitFor(() =>
      expect(result.current.branchesByRepoFullName["company/platform"]).toHaveLength(1),
    );

    await act(async () => {
      await result.current.ensureBranchesLoaded("company/platform");
    });
    expect(fetchBranches).toHaveBeenCalledOnce();
  });
});
