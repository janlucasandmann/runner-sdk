import { type Dispatch, type SetStateAction, useCallback, useMemo, useState } from "react";

import type { RunnerFileBrowserSource } from "./file-browser-source.js";

export interface RunnerFileBrowserHistoryEntry {
  source: RunnerFileBrowserSource;
  folderId: string | null;
}

export interface RunnerFileBrowserSelectionState {
  workspace: string[];
  "google-drive": string[];
  "one-drive": string[];
  github: string[];
}

const EMPTY_SELECTIONS: RunnerFileBrowserSelectionState = Object.freeze({
  workspace: [],
  "google-drive": [],
  "one-drive": [],
  github: [],
});

export interface RunnerFileBrowserNavigationController {
  open: boolean;
  apiKeyPromptOpen: boolean;
  source: RunnerFileBrowserSource;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  previewId: string | null;
  setPreviewId: Dispatch<SetStateAction<string | null>>;
  expandedFolderIds: string[];
  setExpandedFolderIds: Dispatch<SetStateAction<string[]>>;
  history: RunnerFileBrowserHistoryEntry[];
  historyIndex: number;
  currentEntry: RunnerFileBrowserHistoryEntry;
  selectedWorkspaceFileIds: string[];
  selectedGoogleDriveFileIds: string[];
  selectedOneDriveFileIds: string[];
  selectedGithubFileIds: string[];
  requestOpen: (source: RunnerFileBrowserSource, hasApiKey: boolean) => boolean;
  close: () => void;
  closeApiKeyPrompt: () => void;
  switchSource: (source: RunnerFileBrowserSource) => void;
  navigateToFolder: (folderId: string | null) => void;
  goBack: () => void;
  goForward: () => void;
  replaceHistory: (entry: RunnerFileBrowserHistoryEntry) => void;
  mapHistory: (
    mapper: (entry: RunnerFileBrowserHistoryEntry) => RunnerFileBrowserHistoryEntry,
  ) => void;
  toggleSelection: (source: Exclude<RunnerFileBrowserSource, "notion">, id: string) => void;
  clearSelection: (source?: Exclude<RunnerFileBrowserSource, "notion">) => void;
  setSelectedWorkspaceFileIds: Dispatch<SetStateAction<string[]>>;
  setSelectedGoogleDriveFileIds: Dispatch<SetStateAction<string[]>>;
  setSelectedOneDriveFileIds: Dispatch<SetStateAction<string[]>>;
  setSelectedGithubFileIds: Dispatch<SetStateAction<string[]>>;
}

export function useRunnerFileBrowserNavigation(
  initialSource: RunnerFileBrowserSource = "workspace",
): RunnerFileBrowserNavigationController {
  const [open, setOpen] = useState(false);
  const [apiKeyPromptOpen, setApiKeyPromptOpen] = useState(false);
  const [source, setSource] = useState<RunnerFileBrowserSource>(initialSource);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);
  const [history, setHistory] = useState<RunnerFileBrowserHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [selections, setSelections] = useState<RunnerFileBrowserSelectionState>(EMPTY_SELECTIONS);

  const resetView = useCallback(() => {
    setSearchQuery("");
    setPreviewId(null);
    setExpandedFolderIds([]);
  }, []);

  const replaceHistory = useCallback((entry: RunnerFileBrowserHistoryEntry) => {
    setSource(entry.source);
    setHistory([entry]);
    setHistoryIndex(0);
  }, []);

  const requestOpen = useCallback(
    (nextSource: RunnerFileBrowserSource, hasApiKey: boolean) => {
      if (!hasApiKey) {
        setApiKeyPromptOpen(true);
        return false;
      }
      setSource(nextSource);
      resetView();
      setHistory([{ source: nextSource, folderId: null }]);
      setHistoryIndex(0);
      setOpen(true);
      return true;
    },
    [resetView],
  );

  const close = useCallback(() => {
    setOpen(false);
    resetView();
    setHistory([]);
    setHistoryIndex(-1);
  }, [resetView]);

  const closeApiKeyPrompt = useCallback(() => {
    setApiKeyPromptOpen(false);
  }, []);

  const switchSource = useCallback(
    (nextSource: RunnerFileBrowserSource) => {
      resetView();
      replaceHistory({ source: nextSource, folderId: null });
    },
    [replaceHistory, resetView],
  );

  const navigateToFolder = useCallback(
    (folderId: string | null) => {
      resetView();
      setHistory((currentHistory) => {
        const currentEntry = currentHistory[historyIndex] ?? {
          source,
          folderId: null,
        };
        return [
          ...currentHistory.slice(0, historyIndex + 1),
          { source: currentEntry.source, folderId },
        ];
      });
      setHistoryIndex((current) => current + 1);
    },
    [historyIndex, resetView, source],
  );

  const goBack = useCallback(() => {
    if (historyIndex <= 0) return;
    resetView();
    setHistoryIndex((current) => current - 1);
  }, [historyIndex, resetView]);

  const goForward = useCallback(() => {
    if (historyIndex >= history.length - 1) return;
    resetView();
    setHistoryIndex((current) => current + 1);
  }, [history.length, historyIndex, resetView]);

  const mapHistory = useCallback(
    (mapper: (entry: RunnerFileBrowserHistoryEntry) => RunnerFileBrowserHistoryEntry) => {
      setHistory((current) => current.map(mapper));
    },
    [],
  );

  const toggleSelection = useCallback(
    (selectionSource: Exclude<RunnerFileBrowserSource, "notion">, id: string) => {
      setSelections((current) => {
        const sourceSelection = current[selectionSource];
        return {
          ...current,
          [selectionSource]: sourceSelection.includes(id)
            ? sourceSelection.filter((selectedId) => selectedId !== id)
            : [...sourceSelection, id],
        };
      });
    },
    [],
  );

  const clearSelection = useCallback(
    (selectionSource?: Exclude<RunnerFileBrowserSource, "notion">) => {
      if (!selectionSource) {
        setSelections(EMPTY_SELECTIONS);
        return;
      }
      setSelections((current) => ({
        ...current,
        [selectionSource]: [],
      }));
    },
    [],
  );

  const setSelectedWorkspaceFileIds = useCallback((action: SetStateAction<string[]>) => {
    setSelections((current) => ({
      ...current,
      workspace: typeof action === "function" ? action(current.workspace) : action,
    }));
  }, []);
  const setSelectedGoogleDriveFileIds = useCallback((action: SetStateAction<string[]>) => {
    setSelections((current) => ({
      ...current,
      "google-drive": typeof action === "function" ? action(current["google-drive"]) : action,
    }));
  }, []);
  const setSelectedOneDriveFileIds = useCallback((action: SetStateAction<string[]>) => {
    setSelections((current) => ({
      ...current,
      "one-drive": typeof action === "function" ? action(current["one-drive"]) : action,
    }));
  }, []);
  const setSelectedGithubFileIds = useCallback((action: SetStateAction<string[]>) => {
    setSelections((current) => ({
      ...current,
      github: typeof action === "function" ? action(current.github) : action,
    }));
  }, []);

  const currentEntry = useMemo(
    () => history[historyIndex] ?? { source, folderId: null },
    [history, historyIndex, source],
  );

  return {
    open,
    apiKeyPromptOpen,
    source,
    searchQuery,
    setSearchQuery,
    previewId,
    setPreviewId,
    expandedFolderIds,
    setExpandedFolderIds,
    history,
    historyIndex,
    currentEntry,
    selectedWorkspaceFileIds: selections.workspace,
    selectedGoogleDriveFileIds: selections["google-drive"],
    selectedOneDriveFileIds: selections["one-drive"],
    selectedGithubFileIds: selections.github,
    requestOpen,
    close,
    closeApiKeyPrompt,
    switchSource,
    navigateToFolder,
    goBack,
    goForward,
    replaceHistory,
    mapHistory,
    toggleSelection,
    clearSelection,
    setSelectedWorkspaceFileIds,
    setSelectedGoogleDriveFileIds,
    setSelectedOneDriveFileIds,
    setSelectedGithubFileIds,
  };
}
