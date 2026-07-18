import { useCallback, useRef, useState } from "react";

import type { RunnerChatOption } from "./agent-options.js";
import { createGithubBrowserRepoFolderId } from "./attachment-utils.js";
import type { RunnerChatFileNode } from "./workspace-files.js";

export interface UseRunnerGithubBranchSelectionOptions {
  defaultBranch?: string | null;
  fetchBranches?: (repoFullName: string) => Promise<RunnerChatOption[]>;
  onError?: (message: string) => void;
}

export function useRunnerGithubBranchSelection({
  defaultBranch,
  fetchBranches,
  onError,
}: UseRunnerGithubBranchSelectionOptions) {
  const [branchesByRepoFullName, setBranchesByRepoFullName] = useState<
    Record<string, RunnerChatOption[]>
  >({});
  const [selectedBranchByRepoFullName, setSelectedBranchByRepoFullName] = useState<
    Record<string, string>
  >({});
  const [loadingRepoFullNames, setLoadingRepoFullNames] = useState<string[]>([]);
  const loadingReposRef = useRef(new Set<string>());

  const resolveSelectedBranch = useCallback(
    (repoFullName: string, fallbackRef?: string | null): string => {
      const normalizedRepoFullName = String(repoFullName || "").trim();
      if (!normalizedRepoFullName) {
        return String(fallbackRef || defaultBranch || "main").trim() || "main";
      }
      return (
        String(
          selectedBranchByRepoFullName[normalizedRepoFullName] ||
            fallbackRef ||
            defaultBranch ||
            "main",
        ).trim() || "main"
      );
    },
    [defaultBranch, selectedBranchByRepoFullName],
  );

  const buildEffectiveRootItem = useCallback(
    (item: RunnerChatFileNode): RunnerChatFileNode => {
      if (!item.repoFullName || item.parentId) return item;
      const selectedBranch = resolveSelectedBranch(item.repoFullName, item.ref);
      return {
        ...item,
        id: createGithubBrowserRepoFolderId(item.repoFullName, selectedBranch),
        ref: selectedBranch,
      };
    },
    [resolveSelectedBranch],
  );

  const ensureBranchesLoaded = useCallback(
    async (repoFullName: string, fallbackRef?: string | null) => {
      const normalizedRepoFullName = String(repoFullName || "").trim();
      if (!normalizedRepoFullName) return;

      const initialBranch = resolveSelectedBranch(normalizedRepoFullName, fallbackRef);
      if (initialBranch) {
        setSelectedBranchByRepoFullName((current) =>
          current[normalizedRepoFullName]
            ? current
            : {
                ...current,
                [normalizedRepoFullName]: initialBranch,
              },
        );
      }

      if (
        branchesByRepoFullName[normalizedRepoFullName]?.length ||
        loadingReposRef.current.has(normalizedRepoFullName) ||
        !fetchBranches
      ) {
        return;
      }

      loadingReposRef.current.add(normalizedRepoFullName);
      setLoadingRepoFullNames((current) =>
        current.includes(normalizedRepoFullName) ? current : [...current, normalizedRepoFullName],
      );

      try {
        const branches = await fetchBranches(normalizedRepoFullName);
        setBranchesByRepoFullName((current) => ({
          ...current,
          [normalizedRepoFullName]: branches,
        }));
        if (branches.length > 0) {
          setSelectedBranchByRepoFullName((current) =>
            current[normalizedRepoFullName]
              ? current
              : {
                  ...current,
                  [normalizedRepoFullName]:
                    String(branches[0]?.name || initialBranch || "main").trim() || "main",
                },
          );
        }
      } catch (error) {
        onError?.(
          error instanceof Error && error.message
            ? error.message
            : "Failed to load GitHub branches.",
        );
      } finally {
        loadingReposRef.current.delete(normalizedRepoFullName);
        setLoadingRepoFullNames((current) =>
          current.filter((name) => name !== normalizedRepoFullName),
        );
      }
    },
    [branchesByRepoFullName, fetchBranches, onError, resolveSelectedBranch],
  );

  return {
    branchesByRepoFullName,
    buildEffectiveRootItem,
    ensureBranchesLoaded,
    loadingRepoFullNames,
    resolveSelectedBranch,
    setSelectedBranchByRepoFullName,
  };
}
