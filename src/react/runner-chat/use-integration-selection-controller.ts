import { useCallback, useEffect, useState } from "react";

import type { RunnerChatOption } from "./agent-options.js";
import type { RunnerChatNotionDatabase } from "./workspace-files.js";

export interface UseRunnerIntegrationSelectionControllerOptions {
  githubContexts: readonly RunnerChatOption[];
  githubRepositories: readonly RunnerChatOption[];
  notionDatabases: readonly RunnerChatNotionDatabase[];
  selectedGithubContextId?: string | null;
  selectedGithubRepositoryId?: string | null;
  selectedNotionDatabaseId?: string | null;
  onGithubContextChange?: (contextId: string) => void;
  onGithubRepositoryChange?: (repositoryId: string) => void;
  onNotionDatabaseChange?: (databaseId: string) => void;
}

export function useRunnerIntegrationSelectionController({
  githubContexts,
  githubRepositories,
  notionDatabases,
  selectedGithubContextId: controlledGithubContextId,
  selectedGithubRepositoryId: controlledGithubRepositoryId,
  selectedNotionDatabaseId: controlledNotionDatabaseId,
  onGithubContextChange,
  onGithubRepositoryChange,
  onNotionDatabaseChange,
}: UseRunnerIntegrationSelectionControllerOptions) {
  const [selectedGithubRepositoryId, setSelectedGithubRepositoryId] = useState(
    () => controlledGithubRepositoryId || "",
  );
  const [selectedGithubContextId, setSelectedGithubContextId] = useState(
    () => controlledGithubContextId || "",
  );
  const [selectedNotionDatabaseId, setSelectedNotionDatabaseId] = useState(
    () => controlledNotionDatabaseId || "",
  );
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState<string | null>(null);
  const [oneDriveFolderId, setOneDriveFolderId] = useState<string | null>(null);

  useEffect(() => {
    setSelectedGithubRepositoryId((current) => {
      if (
        controlledGithubRepositoryId &&
        githubRepositories.some((repository) => repository.id === controlledGithubRepositoryId)
      ) {
        return controlledGithubRepositoryId;
      }
      if (current && githubRepositories.some((repository) => repository.id === current)) {
        return current;
      }
      return githubRepositories[0]?.id || "";
    });
  }, [controlledGithubRepositoryId, githubRepositories]);

  useEffect(() => {
    setSelectedGithubContextId((current) => {
      if (
        controlledGithubContextId &&
        githubContexts.some((context) => context.id === controlledGithubContextId)
      ) {
        return controlledGithubContextId;
      }
      if (current && githubContexts.some((context) => context.id === current)) {
        return current;
      }
      return githubContexts[0]?.id || "";
    });
  }, [controlledGithubContextId, githubContexts]);

  useEffect(() => {
    setSelectedNotionDatabaseId((current) => {
      if (
        controlledNotionDatabaseId &&
        notionDatabases.some((database) => database.id === controlledNotionDatabaseId)
      ) {
        return controlledNotionDatabaseId;
      }
      if (current && notionDatabases.some((database) => database.id === current)) {
        return current;
      }
      return "";
    });
  }, [controlledNotionDatabaseId, notionDatabases]);

  const selectGithubRepository = useCallback(
    (repositoryId: string) => {
      setSelectedGithubRepositoryId(repositoryId);
      onGithubRepositoryChange?.(repositoryId);
    },
    [onGithubRepositoryChange],
  );
  const selectGithubContext = useCallback(
    (contextId: string) => {
      setSelectedGithubContextId(contextId);
      onGithubContextChange?.(contextId);
    },
    [onGithubContextChange],
  );
  const selectNotionDatabase = useCallback(
    (databaseId: string) => {
      setSelectedNotionDatabaseId(databaseId);
      onNotionDatabaseChange?.(databaseId);
    },
    [onNotionDatabaseChange],
  );

  return {
    googleDriveFolderId,
    oneDriveFolderId,
    selectedGithubContextId,
    selectedGithubRepositoryId,
    selectedNotionDatabaseId,
    selectGithubContext,
    selectGithubRepository,
    selectNotionDatabase,
    setGoogleDriveFolderId,
    setOneDriveFolderId,
    setSelectedNotionDatabaseId,
  };
}
