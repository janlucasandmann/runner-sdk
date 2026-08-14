import { useCallback, useEffect, useRef } from "react";

import { buildRunnerHeaders } from "./api-utils.js";
import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import type { RunnerChatConnectorFetchOptions } from "./public-types.js";
import type { RunnerFileBrowserSourceStateController } from "./use-file-browser-source-state.js";
import {
  buildEnvironmentFileListUrl,
  mergeDriveFolderItems,
  normalizeEnvironmentWorkspaceItems,
  normalizeRunnerWorkspaceFolderPath,
  type RunnerChatFileNode,
  type RunnerChatNotionDatabase,
} from "./workspace-files.js";

const WORKSPACE_ENVIRONMENT_REQUIRED_MESSAGE =
  "Select an environment to browse workspace files.";

export interface RunnerFileBrowserLoadOptions {
  inline?: boolean;
}

export interface UseRunnerFileBrowserSourceLoadersOptions {
  apiKey: string;
  backendUrl: string;
  currentFolderId: string | null;
  currentSource: RunnerFileBrowserSource;
  accountId?: string;
  fetchGithubItems?: (folderId: string, options?: RunnerChatConnectorFetchOptions) => Promise<RunnerChatFileNode[]>;
  fetchGoogleDriveItems?: (folderId: string, options?: RunnerChatConnectorFetchOptions) => Promise<RunnerChatFileNode[]>;
  fetchNotionDatabases?: (options?: RunnerChatConnectorFetchOptions) => Promise<RunnerChatNotionDatabase[]>;
  fetchOneDriveItems?: (folderId: string, options?: RunnerChatConnectorFetchOptions) => Promise<RunnerChatFileNode[]>;
  fetchImpl?: typeof fetch;
  githubConnected: boolean;
  googleDriveConnected: boolean;
  hasApiKey: boolean;
  mapGithubRootItem?: (item: RunnerChatFileNode) => RunnerChatFileNode;
  notionConnected: boolean;
  oneDriveConnected: boolean;
  open: boolean;
  requestHeaders?: HeadersInit;
  sourceState: RunnerFileBrowserSourceStateController;
  workspaceEnvironmentId: string;
}

export interface RunnerFileBrowserSourceLoaders {
  loadWorkspaceFolder: (
    folderId: string | null,
    options?: RunnerFileBrowserLoadOptions,
  ) => Promise<void>;
  loadGoogleDriveFolder: (
    folderId: string,
    options?: RunnerFileBrowserLoadOptions,
  ) => Promise<void>;
  loadOneDriveFolder: (folderId: string, options?: RunnerFileBrowserLoadOptions) => Promise<void>;
  loadGithubFolder: (folderId: string, options?: RunnerFileBrowserLoadOptions) => Promise<void>;
}

function readErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

type RunnerFileBrowserFolderSourceActions = Pick<
  RunnerFileBrowserSourceStateController["github"],
  "setItems" | "setLoadedFolderIds" | "setLoadingFolderIds" | "setLoading" | "setError"
>;

function markFolderLoading(
  source: RunnerFileBrowserFolderSourceActions,
  folderId: string,
  inline: boolean,
) {
  if (inline) {
    source.setLoadingFolderIds((current) =>
      current.includes(folderId) ? current : [...current, folderId],
    );
  } else {
    source.setLoading(true);
    source.setError(null);
  }
}

function finishFolderLoading(
  source: RunnerFileBrowserFolderSourceActions,
  folderId: string,
  inline: boolean,
) {
  if (inline) {
    source.setLoadingFolderIds((current) => current.filter((id) => id !== folderId));
  } else {
    source.setLoading(false);
  }
}

export function useRunnerFileBrowserSourceLoaders({
  apiKey,
  backendUrl,
  currentFolderId,
  currentSource,
  accountId,
  fetchGithubItems,
  fetchGoogleDriveItems,
  fetchNotionDatabases,
  fetchOneDriveItems,
  fetchImpl = globalThis.fetch,
  githubConnected,
  googleDriveConnected,
  hasApiKey,
  mapGithubRootItem,
  notionConnected,
  oneDriveConnected,
  open,
  requestHeaders,
  sourceState,
  workspaceEnvironmentId,
}: UseRunnerFileBrowserSourceLoadersOptions): RunnerFileBrowserSourceLoaders {
  const { github, googleDrive, notion, oneDrive, workspace } = sourceState;
  const { setWorkspaceUnavailable } = sourceState;
  const mapGithubRootItemRef = useRef(mapGithubRootItem);
  const workspaceEnvironmentIdentityRef = useRef(workspaceEnvironmentId);
  const workspaceEnvironmentGenerationRef = useRef(0);
  const workspaceStateEnvironmentIdRef = useRef(workspaceEnvironmentId);
  const connectorRequestGenerationRef = useRef(0);

  if (workspaceEnvironmentIdentityRef.current !== workspaceEnvironmentId) {
    workspaceEnvironmentIdentityRef.current = workspaceEnvironmentId;
    workspaceEnvironmentGenerationRef.current += 1;
  }

  useEffect(() => {
    mapGithubRootItemRef.current = mapGithubRootItem;
  }, [mapGithubRootItem]);

  useEffect(() => {
    connectorRequestGenerationRef.current += 1;
  }, [accountId, currentSource]);

  const loadWorkspaceFolder = useCallback(
    async (folderId: string | null, options?: RunnerFileBrowserLoadOptions) => {
      const requestEnvironmentGeneration =
        workspaceEnvironmentGenerationRef.current;
      const normalizedFolderId = normalizeRunnerWorkspaceFolderPath(folderId) || "root";
      const requestUrl = buildEnvironmentFileListUrl(
        backendUrl,
        workspaceEnvironmentId,
        normalizedFolderId === "root" ? "" : normalizedFolderId,
        1,
      );
      if (!requestUrl || typeof fetchImpl !== "function") {
        setWorkspaceUnavailable(WORKSPACE_ENVIRONMENT_REQUIRED_MESSAGE);
        return;
      }

      const inline = Boolean(options?.inline);
      const workspaceActions = {
        setItems: workspace.setItems,
        setLoadedFolderIds: workspace.setLoadedFolderIds,
        setLoadingFolderIds: workspace.setLoadingFolderIds,
        setLoading: workspace.setLoading,
        setError: workspace.setError,
      };
      markFolderLoading(workspaceActions, normalizedFolderId, inline);
      workspace.setFolderErrorsById((current) => ({
        ...current,
        [normalizedFolderId]: "",
      }));

      try {
        const response = await fetchImpl(requestUrl, {
          method: "GET",
          headers: buildRunnerHeaders(requestHeaders, apiKey.trim()),
        });
        const text = await response.text();
        let payload: unknown = {};
        try {
          payload = text ? JSON.parse(text) : {};
        } catch {
          payload = { message: text };
        }
        if (!response.ok) {
          const record =
            payload && typeof payload === "object" && !Array.isArray(payload)
              ? (payload as Record<string, unknown>)
              : {};
          throw new Error(
            String(
              record.message ||
                record.error ||
                `Failed to load workspace files (${response.status})`,
            ),
          );
        }

        if (
          workspaceEnvironmentGenerationRef.current !==
          requestEnvironmentGeneration
        ) {
          return;
        }

        const nextItems = normalizeEnvironmentWorkspaceItems(payload);
        workspace.setItems((current) =>
          mergeDriveFolderItems(current, normalizedFolderId, nextItems),
        );
        workspace.setLoadedFolderIds((current) =>
          current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId],
        );
        workspace.setFolderErrorsById((current) => ({
          ...current,
          [normalizedFolderId]: "",
        }));
        if (!inline) workspace.setError(null);
      } catch (error) {
        if (
          workspaceEnvironmentGenerationRef.current !==
          requestEnvironmentGeneration
        ) {
          return;
        }
        const message = readErrorMessage(error, "Failed to load workspace files.");
        workspace.setFolderErrorsById((current) => ({
          ...current,
          [normalizedFolderId]: message,
        }));
        if (normalizedFolderId === "root" || !inline) {
          workspace.setItems([]);
          workspace.setError(message);
        }
      } finally {
        if (
          workspaceEnvironmentGenerationRef.current ===
          requestEnvironmentGeneration
        ) {
          finishFolderLoading(workspaceActions, normalizedFolderId, inline);
        }
      }
    },
    [
      apiKey,
      backendUrl,
      fetchImpl,
      requestHeaders,
      setWorkspaceUnavailable,
      workspace.setError,
      workspace.setFolderErrorsById,
      workspace.setItems,
      workspace.setLoadedFolderIds,
      workspace.setLoading,
      workspace.setLoadingFolderIds,
      workspaceEnvironmentId,
    ],
  );

  const loadConnectorFolder = useCallback(
    async (
      source: RunnerFileBrowserFolderSourceActions,
      folderId: string,
      fetchItems: ((nextFolderId: string, options?: RunnerChatConnectorFetchOptions) => Promise<RunnerChatFileNode[]>) | undefined,
      fallbackError: string,
      options?: RunnerFileBrowserLoadOptions,
      mapRootItems?: boolean,
    ) => {
      if (!fetchItems) return;
      const requestGeneration = connectorRequestGenerationRef.current;
      const normalizedFolderId = folderId || "root";
      const inline = Boolean(options?.inline);
      markFolderLoading(source, normalizedFolderId, inline);
      try {
        const fetchedItems = await fetchItems(
          normalizedFolderId,
          accountId ? { accountId } : undefined,
        );
        if (connectorRequestGenerationRef.current !== requestGeneration) return;
        const nextItems =
          mapRootItems && normalizedFolderId === "root"
            ? fetchedItems.map((item) => mapGithubRootItemRef.current?.(item) || item)
            : fetchedItems;
        source.setItems((current) => mergeDriveFolderItems(current, normalizedFolderId, nextItems));
        source.setLoadedFolderIds((current) =>
          current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId],
        );
        source.setError(null);
      } catch (error) {
        if (connectorRequestGenerationRef.current !== requestGeneration) return;
        source.setError(readErrorMessage(error, fallbackError));
      } finally {
        if (connectorRequestGenerationRef.current === requestGeneration) {
          finishFolderLoading(source, normalizedFolderId, inline);
        }
      }
    },
    [accountId],
  );

  const loadGoogleDriveFolder = useCallback(
    (folderId: string, options?: RunnerFileBrowserLoadOptions) =>
      loadConnectorFolder(
        {
          setItems: googleDrive.setItems,
          setLoadedFolderIds: googleDrive.setLoadedFolderIds,
          setLoadingFolderIds: googleDrive.setLoadingFolderIds,
          setLoading: googleDrive.setLoading,
          setError: googleDrive.setError,
        },
        folderId,
        fetchGoogleDriveItems,
        "Failed to load Google Drive files.",
        options,
      ),
    [
      fetchGoogleDriveItems,
      googleDrive.setError,
      googleDrive.setItems,
      googleDrive.setLoadedFolderIds,
      googleDrive.setLoading,
      googleDrive.setLoadingFolderIds,
      loadConnectorFolder,
    ],
  );
  const loadOneDriveFolder = useCallback(
    (folderId: string, options?: RunnerFileBrowserLoadOptions) =>
      loadConnectorFolder(
        {
          setItems: oneDrive.setItems,
          setLoadedFolderIds: oneDrive.setLoadedFolderIds,
          setLoadingFolderIds: oneDrive.setLoadingFolderIds,
          setLoading: oneDrive.setLoading,
          setError: oneDrive.setError,
        },
        folderId,
        fetchOneDriveItems,
        "Failed to load OneDrive files.",
        options,
      ),
    [
      fetchOneDriveItems,
      loadConnectorFolder,
      oneDrive.setError,
      oneDrive.setItems,
      oneDrive.setLoadedFolderIds,
      oneDrive.setLoading,
      oneDrive.setLoadingFolderIds,
    ],
  );
  const loadGithubFolder = useCallback(
    (folderId: string, options?: RunnerFileBrowserLoadOptions) =>
      loadConnectorFolder(
        {
          setItems: github.setItems,
          setLoadedFolderIds: github.setLoadedFolderIds,
          setLoadingFolderIds: github.setLoadingFolderIds,
          setLoading: github.setLoading,
          setError: github.setError,
        },
        folderId,
        fetchGithubItems,
        "Failed to load GitHub files.",
        options,
        true,
      ),
    [
      fetchGithubItems,
      github.setError,
      github.setItems,
      github.setLoadedFolderIds,
      github.setLoading,
      github.setLoadingFolderIds,
      loadConnectorFolder,
    ],
  );

  useEffect(() => {
    if (!open || currentSource !== "workspace") {
      workspaceStateEnvironmentIdRef.current = workspaceEnvironmentId;
      return;
    }
    if (
      workspaceStateEnvironmentIdRef.current === workspaceEnvironmentId
    ) {
      return;
    }
    workspaceStateEnvironmentIdRef.current = workspaceEnvironmentId;
    setWorkspaceUnavailable(
      workspaceEnvironmentId
        ? null
        : WORKSPACE_ENVIRONMENT_REQUIRED_MESSAGE,
    );
  }, [
    currentSource,
    open,
    setWorkspaceUnavailable,
    workspaceEnvironmentId,
  ]);

  useEffect(() => {
    if (!open || currentSource !== "workspace") return;
    if (!hasApiKey) {
      if (workspace.error !== null) {
        setWorkspaceUnavailable(null);
      }
      return;
    }
    if (!workspaceEnvironmentId) {
      if (workspace.error !== WORKSPACE_ENVIRONMENT_REQUIRED_MESSAGE) {
        setWorkspaceUnavailable(WORKSPACE_ENVIRONMENT_REQUIRED_MESSAGE);
      }
      return;
    }
    const folderId = currentFolderId || "root";
    if (
      (workspace.error &&
        workspace.error !== WORKSPACE_ENVIRONMENT_REQUIRED_MESSAGE) ||
      workspace.loading ||
      workspace.loadedFolderIds.includes(folderId) ||
      workspace.loadingFolderIds.includes(folderId)
    ) {
      return;
    }
    void loadWorkspaceFolder(folderId);
  }, [
    accountId,
    currentFolderId,
    currentSource,
    hasApiKey,
    loadWorkspaceFolder,
    open,
    setWorkspaceUnavailable,
    workspace.error,
    workspace.loadedFolderIds,
    workspace.loading,
    workspace.loadingFolderIds,
    workspaceEnvironmentId,
  ]);

  useEffect(() => {
    if (
      !open ||
      currentSource !== "google-drive" ||
      !googleDriveConnected ||
      !fetchGoogleDriveItems ||
      googleDrive.error
    ) {
      return;
    }
    const folderId = currentFolderId || "root";
    if (
      googleDrive.loadedFolderIds.includes(folderId) ||
      googleDrive.loadingFolderIds.includes(folderId)
    ) {
      return;
    }
    void loadGoogleDriveFolder(folderId);
  }, [
    accountId,
    currentFolderId,
    currentSource,
    fetchGoogleDriveItems,
    googleDrive.error,
    googleDrive.loadedFolderIds,
    googleDrive.loadingFolderIds,
    googleDriveConnected,
    loadGoogleDriveFolder,
    open,
  ]);

  useEffect(() => {
    if (
      !open ||
      currentSource !== "one-drive" ||
      !oneDriveConnected ||
      !fetchOneDriveItems ||
      oneDrive.error
    ) {
      return;
    }
    const folderId = currentFolderId || "root";
    if (
      oneDrive.loadedFolderIds.includes(folderId) ||
      oneDrive.loadingFolderIds.includes(folderId)
    ) {
      return;
    }
    void loadOneDriveFolder(folderId);
  }, [
    accountId,
    currentFolderId,
    currentSource,
    fetchOneDriveItems,
    loadOneDriveFolder,
    oneDrive.error,
    oneDrive.loadedFolderIds,
    oneDrive.loadingFolderIds,
    oneDriveConnected,
    open,
  ]);

  useEffect(() => {
    if (
      !open ||
      currentSource !== "github" ||
      !githubConnected ||
      !fetchGithubItems ||
      github.error
    ) {
      return;
    }
    const folderId = currentFolderId || "root";
    if (github.loadedFolderIds.includes(folderId) || github.loadingFolderIds.includes(folderId)) {
      return;
    }
    void loadGithubFolder(folderId);
  }, [
    accountId,
    currentFolderId,
    currentSource,
    fetchGithubItems,
    github.error,
    github.loadedFolderIds,
    github.loadingFolderIds,
    githubConnected,
    loadGithubFolder,
    open,
  ]);

  useEffect(() => {
    if (
      !open ||
      currentSource !== "notion" ||
      !notionConnected ||
      !fetchNotionDatabases ||
      notion.loaded ||
      notion.error
    ) {
      return;
    }

    let cancelled = false;
    notion.setLoading(true);
    notion.setError(null);
    void fetchNotionDatabases(accountId ? { accountId } : undefined)
      .then((databases) => {
        if (cancelled) return;
        notion.setDatabases(databases || []);
        notion.setLoaded(true);
        notion.setError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        notion.setDatabases([]);
        notion.setLoaded(false);
        notion.setError(readErrorMessage(error, "Failed to load Notion databases."));
      })
      .finally(() => {
        if (!cancelled) notion.setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    accountId,
    currentSource,
    fetchNotionDatabases,
    notionConnected,
    notion.error,
    notion.loaded,
    notion.setDatabases,
    notion.setError,
    notion.setLoaded,
    notion.setLoading,
    open,
  ]);

  return {
    loadWorkspaceFolder,
    loadGoogleDriveFolder,
    loadOneDriveFolder,
    loadGithubFolder,
  };
}
