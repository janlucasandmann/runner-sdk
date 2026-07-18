import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from "react";

import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import type { RunnerChatFileNode, RunnerChatNotionDatabase } from "./workspace-files.js";

export interface RunnerFileBrowserFolderSourceState {
  items: RunnerChatFileNode[];
  setItems: Dispatch<SetStateAction<RunnerChatFileNode[]>>;
  loadedFolderIds: string[];
  setLoadedFolderIds: Dispatch<SetStateAction<string[]>>;
  loadingFolderIds: string[];
  setLoadingFolderIds: Dispatch<SetStateAction<string[]>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
}

export interface RunnerWorkspaceFileBrowserSourceState extends RunnerFileBrowserFolderSourceState {
  folderErrorsById: Record<string, string>;
  setFolderErrorsById: Dispatch<SetStateAction<Record<string, string>>>;
}

export interface RunnerNotionFileBrowserSourceState {
  databases: RunnerChatNotionDatabase[];
  setDatabases: Dispatch<SetStateAction<RunnerChatNotionDatabase[]>>;
  loaded: boolean;
  setLoaded: Dispatch<SetStateAction<boolean>>;
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
}

export interface RunnerGoogleDriveFileBrowserSourceState
  extends RunnerFileBrowserFolderSourceState {
  pickerLoading: boolean;
  setPickerLoading: Dispatch<SetStateAction<boolean>>;
}

export interface RunnerFileBrowserSourceStateController {
  workspace: RunnerWorkspaceFileBrowserSourceState;
  googleDrive: RunnerGoogleDriveFileBrowserSourceState;
  oneDrive: RunnerFileBrowserFolderSourceState;
  github: RunnerFileBrowserFolderSourceState;
  notion: RunnerNotionFileBrowserSourceState;
  resetSource: (source: RunnerFileBrowserSource) => void;
  resetAfterClose: () => void;
  setWorkspaceUnavailable: (message: string | null) => void;
}

export function useRunnerFileBrowserSourceState(): RunnerFileBrowserSourceStateController {
  const [workspaceItems, setWorkspaceItems] = useState<RunnerChatFileNode[]>([]);
  const [workspaceLoadedFolderIds, setWorkspaceLoadedFolderIds] = useState<string[]>([]);
  const [workspaceLoadingFolderIds, setWorkspaceLoadingFolderIds] = useState<string[]>([]);
  const [workspaceFolderErrorsById, setWorkspaceFolderErrorsById] = useState<
    Record<string, string>
  >({});
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);

  const [googleDriveItems, setGoogleDriveItems] = useState<RunnerChatFileNode[]>([]);
  const [googleDriveLoadedFolderIds, setGoogleDriveLoadedFolderIds] = useState<string[]>([]);
  const [googleDriveLoadingFolderIds, setGoogleDriveLoadingFolderIds] = useState<string[]>([]);
  const [googleDriveLoading, setGoogleDriveLoading] = useState(false);
  const [googleDriveError, setGoogleDriveError] = useState<string | null>(null);
  const [googleDrivePickerLoading, setGoogleDrivePickerLoading] = useState(false);

  const [oneDriveItems, setOneDriveItems] = useState<RunnerChatFileNode[]>([]);
  const [oneDriveLoadedFolderIds, setOneDriveLoadedFolderIds] = useState<string[]>([]);
  const [oneDriveLoadingFolderIds, setOneDriveLoadingFolderIds] = useState<string[]>([]);
  const [oneDriveLoading, setOneDriveLoading] = useState(false);
  const [oneDriveError, setOneDriveError] = useState<string | null>(null);

  const [githubItems, setGithubItems] = useState<RunnerChatFileNode[]>([]);
  const [githubLoadedFolderIds, setGithubLoadedFolderIds] = useState<string[]>([]);
  const [githubLoadingFolderIds, setGithubLoadingFolderIds] = useState<string[]>([]);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  const [notionDatabases, setNotionDatabases] = useState<RunnerChatNotionDatabase[]>([]);
  const [notionLoaded, setNotionLoaded] = useState(false);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionError, setNotionError] = useState<string | null>(null);

  const resetWorkspace = useCallback(() => {
    setWorkspaceItems([]);
    setWorkspaceLoadedFolderIds([]);
    setWorkspaceLoadingFolderIds([]);
    setWorkspaceFolderErrorsById({});
    setWorkspaceError(null);
  }, []);
  const resetGoogleDrive = useCallback(() => {
    setGoogleDriveItems([]);
    setGoogleDriveLoadedFolderIds([]);
    setGoogleDriveLoadingFolderIds([]);
    setGoogleDriveError(null);
  }, []);
  const resetOneDrive = useCallback(() => {
    setOneDriveItems([]);
    setOneDriveLoadedFolderIds([]);
    setOneDriveLoadingFolderIds([]);
    setOneDriveError(null);
  }, []);
  const resetGithub = useCallback(() => {
    setGithubItems([]);
    setGithubLoadedFolderIds([]);
    setGithubLoadingFolderIds([]);
    setGithubError(null);
  }, []);
  const resetNotion = useCallback(() => {
    setNotionDatabases([]);
    setNotionLoaded(false);
    setNotionError(null);
  }, []);

  const resetSource = useCallback(
    (source: RunnerFileBrowserSource) => {
      if (source === "workspace") resetWorkspace();
      if (source === "google-drive") resetGoogleDrive();
      if (source === "one-drive") resetOneDrive();
      if (source === "github") resetGithub();
      if (source === "notion") resetNotion();
    },
    [resetGithub, resetGoogleDrive, resetNotion, resetOneDrive, resetWorkspace],
  );

  const resetAfterClose = useCallback(() => {
    resetWorkspace();
    setGoogleDriveError(null);
    setOneDriveError(null);
    setGithubError(null);
    setGoogleDrivePickerLoading(false);
  }, [resetWorkspace]);

  const setWorkspaceUnavailable = useCallback((message: string | null) => {
    setWorkspaceItems([]);
    setWorkspaceLoadedFolderIds([]);
    setWorkspaceLoadingFolderIds([]);
    setWorkspaceFolderErrorsById({});
    setWorkspaceError(message);
    setWorkspaceLoading(false);
  }, []);

  const workspace = useMemo<RunnerWorkspaceFileBrowserSourceState>(
    () => ({
      items: workspaceItems,
      setItems: setWorkspaceItems,
      loadedFolderIds: workspaceLoadedFolderIds,
      setLoadedFolderIds: setWorkspaceLoadedFolderIds,
      loadingFolderIds: workspaceLoadingFolderIds,
      setLoadingFolderIds: setWorkspaceLoadingFolderIds,
      folderErrorsById: workspaceFolderErrorsById,
      setFolderErrorsById: setWorkspaceFolderErrorsById,
      loading: workspaceLoading,
      setLoading: setWorkspaceLoading,
      error: workspaceError,
      setError: setWorkspaceError,
    }),
    [
      workspaceError,
      workspaceFolderErrorsById,
      workspaceItems,
      workspaceLoadedFolderIds,
      workspaceLoading,
      workspaceLoadingFolderIds,
    ],
  );
  const googleDrive = useMemo<RunnerGoogleDriveFileBrowserSourceState>(
    () => ({
      items: googleDriveItems,
      setItems: setGoogleDriveItems,
      loadedFolderIds: googleDriveLoadedFolderIds,
      setLoadedFolderIds: setGoogleDriveLoadedFolderIds,
      loadingFolderIds: googleDriveLoadingFolderIds,
      setLoadingFolderIds: setGoogleDriveLoadingFolderIds,
      loading: googleDriveLoading,
      setLoading: setGoogleDriveLoading,
      error: googleDriveError,
      setError: setGoogleDriveError,
      pickerLoading: googleDrivePickerLoading,
      setPickerLoading: setGoogleDrivePickerLoading,
    }),
    [
      googleDriveError,
      googleDriveItems,
      googleDriveLoadedFolderIds,
      googleDriveLoading,
      googleDriveLoadingFolderIds,
      googleDrivePickerLoading,
    ],
  );
  const oneDrive = useMemo<RunnerFileBrowserFolderSourceState>(
    () => ({
      items: oneDriveItems,
      setItems: setOneDriveItems,
      loadedFolderIds: oneDriveLoadedFolderIds,
      setLoadedFolderIds: setOneDriveLoadedFolderIds,
      loadingFolderIds: oneDriveLoadingFolderIds,
      setLoadingFolderIds: setOneDriveLoadingFolderIds,
      loading: oneDriveLoading,
      setLoading: setOneDriveLoading,
      error: oneDriveError,
      setError: setOneDriveError,
    }),
    [
      oneDriveError,
      oneDriveItems,
      oneDriveLoadedFolderIds,
      oneDriveLoading,
      oneDriveLoadingFolderIds,
    ],
  );
  const github = useMemo<RunnerFileBrowserFolderSourceState>(
    () => ({
      items: githubItems,
      setItems: setGithubItems,
      loadedFolderIds: githubLoadedFolderIds,
      setLoadedFolderIds: setGithubLoadedFolderIds,
      loadingFolderIds: githubLoadingFolderIds,
      setLoadingFolderIds: setGithubLoadingFolderIds,
      loading: githubLoading,
      setLoading: setGithubLoading,
      error: githubError,
      setError: setGithubError,
    }),
    [githubError, githubItems, githubLoadedFolderIds, githubLoading, githubLoadingFolderIds],
  );
  const notion = useMemo<RunnerNotionFileBrowserSourceState>(
    () => ({
      databases: notionDatabases,
      setDatabases: setNotionDatabases,
      loaded: notionLoaded,
      setLoaded: setNotionLoaded,
      loading: notionLoading,
      setLoading: setNotionLoading,
      error: notionError,
      setError: setNotionError,
    }),
    [notionDatabases, notionError, notionLoaded, notionLoading],
  );

  return useMemo(
    () => ({
      workspace,
      googleDrive,
      oneDrive,
      github,
      notion,
      resetSource,
      resetAfterClose,
      setWorkspaceUnavailable,
    }),
    [
      github,
      googleDrive,
      notion,
      oneDrive,
      resetAfterClose,
      resetSource,
      setWorkspaceUnavailable,
      workspace,
    ],
  );
}
