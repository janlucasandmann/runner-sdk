import { Redo2, Undo2 } from "lucide-react";
import type {
  ChangeEvent,
  DragEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEventHandler,
  ReactNode,
} from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlatformLoadingState } from "../loading-state/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";
import { PlatformSearch } from "../../ui/search/index.js";
import {
  PlatformCodeEditorTabBar,
  type PlatformCodeEditorTab,
} from "./platform-code-editor-tab-bar.js";

export type PlatformCodeEditorStatusTone = "default" | "success" | "error" | "loading";
export type PlatformCodeEditorWorkspaceVariant = "default" | "full-screen";

export interface PlatformCodeEditorFile {
  id: string;
  label?: ReactNode;
  tabLabel?: ReactNode;
  icon?: ReactNode;
  tabIcon?: ReactNode;
  leading?: ReactNode;
  depth?: number;
  disabled?: boolean;
  openInTab?: boolean;
  dirty?: boolean;
  closable?: boolean;
  ariaLabel?: string;
  searchText?: string;
}

export interface PlatformCodeEditorHistoryControls {
  onUndo?: MouseEventHandler<HTMLButtonElement>;
  onRedo?: MouseEventHandler<HTMLButtonElement>;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
}

export interface PlatformCodeEditorWorkspaceProps {
  files: readonly PlatformCodeEditorFile[];
  activeFileId?: string;
  onFileSelect?: (fileId: string) => void;
  sidebarTitle?: ReactNode;
  sidebarActions?: ReactNode;
  fileSearchValue?: string;
  defaultFileSearchValue?: string;
  fileSearchPlaceholder?: string;
  fileSearchAriaLabel?: string;
  onFileSearchChange?: (value: string) => void;
  isLoadingFiles?: boolean;
  loadingFilesMessage?: ReactNode;
  showTabBar?: boolean;
  defaultOpenFileIds?: readonly string[];
  onFileClose?: (fileId: string) => void;
  editor?: ReactNode;
  emptyFiles?: ReactNode;
  emptySearchResults?: ReactNode;
  emptyEditor?: ReactNode;
  status?: ReactNode;
  statusTone?: PlatformCodeEditorStatusTone;
  historyControls?: PlatformCodeEditorHistoryControls;
  showFooter?: boolean;
  variant?: PlatformCodeEditorWorkspaceVariant;
  ariaLabel?: string;
  className?: string;
  onDragOver?: DragEventHandler<HTMLElement>;
  onDragLeave?: DragEventHandler<HTMLElement>;
  onDrop?: DragEventHandler<HTMLElement>;
}

function joinClassNames(...classNames: Array<string | false | null | undefined>) {
  return classNames
    .filter(
      (className): className is string =>
        typeof className === "string" && Boolean(className.trim()),
    )
    .map((className) => className.trim())
    .join(" ");
}

function stopEditorKeyboardPropagation(event: ReactKeyboardEvent<HTMLElement>) {
  event.stopPropagation();
}

function renderHistoryControls(historyControls: PlatformCodeEditorHistoryControls) {
  return (
    <>
      <PlatformIconButton
        aria-label="Undo"
        title="Undo"
        size="small"
        disabled={historyControls.undoDisabled}
        onClick={historyControls.onUndo}
      >
        <Undo2 />
      </PlatformIconButton>
      <PlatformIconButton
        aria-label="Redo"
        title="Redo"
        size="small"
        disabled={historyControls.redoDisabled}
        onClick={historyControls.onRedo}
      >
        <Redo2 />
      </PlatformIconButton>
    </>
  );
}

export function PlatformCodeEditorWorkspace({
  files,
  activeFileId = "",
  onFileSelect,
  sidebarTitle = "Explorer",
  sidebarActions = null,
  fileSearchValue,
  defaultFileSearchValue = "",
  fileSearchPlaceholder = "Search files",
  fileSearchAriaLabel = "Search code files",
  onFileSearchChange,
  isLoadingFiles = false,
  loadingFilesMessage = "Loading files...",
  showTabBar = true,
  defaultOpenFileIds = [],
  onFileClose,
  editor = null,
  emptyFiles = "No code files.",
  emptySearchResults = "No matching files.",
  emptyEditor = "Select a file to edit.",
  status = null,
  statusTone = "default",
  historyControls,
  showFooter = true,
  variant = "default",
  ariaLabel = "Code editor",
  className = "",
  onDragOver,
  onDragLeave,
  onDrop,
}: PlatformCodeEditorWorkspaceProps) {
  const [internalFileSearchValue, setInternalFileSearchValue] = useState(
    defaultFileSearchValue,
  );
  const [openFileIds, setOpenFileIds] = useState<string[]>(() =>
    Array.from(
      new Set(
        [...defaultOpenFileIds, activeFileId]
          .map((fileId) => String(fileId || "").trim())
          .filter(Boolean),
      ),
    ),
  );
  const closedActiveFileIdRef = useRef("");
  const previousActiveFileIdRef = useRef("");
  const resolvedFileSearchValue =
    fileSearchValue === undefined ? internalFileSearchValue : fileSearchValue;
  const normalizedFileSearchValue = resolvedFileSearchValue.trim().toLocaleLowerCase();
  const visibleFiles = useMemo(() => {
    if (!normalizedFileSearchValue) return files;
    return files.filter((file) => {
      const labelText = typeof file.label === "string" ? file.label : "";
      return [file.id, labelText, file.searchText]
        .filter((value): value is string => typeof value === "string" && Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(normalizedFileSearchValue));
    });
  }, [files, normalizedFileSearchValue]);
  const handleFileSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.currentTarget.value;
    if (fileSearchValue === undefined) setInternalFileSearchValue(nextValue);
    onFileSearchChange?.(nextValue);
  };
  const tabbableFiles = useMemo(
    () => files.filter((file) => file.openInTab !== false && !file.disabled),
    [files],
  );
  const tabbableFileById = useMemo(
    () => new Map(tabbableFiles.map((file) => [file.id, file])),
    [tabbableFiles],
  );
  const openTabs = useMemo<PlatformCodeEditorTab[]>(
    () =>
      openFileIds
        .flatMap((fileId): PlatformCodeEditorTab[] => {
          const file = tabbableFileById.get(fileId);
          if (!file) return [];
          return [
            {
              id: file.id,
              label: file.tabLabel ?? file.label ?? file.id,
              icon: file.tabIcon ?? file.icon,
              dirty: file.dirty,
              closable: file.closable,
              ariaLabel: file.ariaLabel,
            },
          ];
        }),
    [openFileIds, tabbableFileById],
  );

  useEffect(() => {
    const activeFileChanged = previousActiveFileIdRef.current !== activeFileId;
    previousActiveFileIdRef.current = activeFileId;

    setOpenFileIds((current) => {
      let next = isLoadingFiles
        ? current
        : current.filter((fileId) => tabbableFileById.has(fileId));
      const shouldOpenActiveFile =
        Boolean(activeFileId) &&
        tabbableFileById.has(activeFileId) &&
        (activeFileChanged || closedActiveFileIdRef.current !== activeFileId);
      if (shouldOpenActiveFile && !next.includes(activeFileId)) {
        next = [...next, activeFileId];
      }
      if (activeFileChanged && closedActiveFileIdRef.current !== activeFileId) {
        closedActiveFileIdRef.current = "";
      }
      return next.length === current.length && next.every((fileId, index) => fileId === current[index])
        ? current
        : next;
    });
  }, [activeFileId, isLoadingFiles, tabbableFileById]);

  const openFile = (file: PlatformCodeEditorFile) => {
    if (file.openInTab !== false && !file.disabled) {
      closedActiveFileIdRef.current = "";
      setOpenFileIds((current) =>
        current.includes(file.id) ? current : [...current, file.id],
      );
    }
    onFileSelect?.(file.id);
  };

  const selectOpenFile = (fileId: string) => {
    closedActiveFileIdRef.current = "";
    onFileSelect?.(fileId);
  };

  const closeOpenFile = (fileId: string) => {
    const closingIndex = openFileIds.indexOf(fileId);
    if (closingIndex < 0) return;
    const next = openFileIds.filter((currentFileId) => currentFileId !== fileId);
    setOpenFileIds(next);
    if (fileId === activeFileId) {
      closedActiveFileIdRef.current = fileId;
      const nextActiveFileId = next[closingIndex] ?? next[closingIndex - 1] ?? "";
      if (nextActiveFileId) onFileSelect?.(nextActiveFileId);
    }
    onFileClose?.(fileId);
  };

  const activeFileIsOpen = !activeFileId || openFileIds.includes(activeFileId);

  return (
    <section
      className={joinClassNames(
        "platform-code-editor-workspace",
        variant === "full-screen" && "is-full-screen",
        className,
      )}
      aria-label={ariaLabel}
      data-platform-code-editor-workspace="true"
      data-platform-code-editor-workspace-variant={variant}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onKeyDown={stopEditorKeyboardPropagation}
      onKeyUp={stopEditorKeyboardPropagation}
    >
      <aside className="platform-code-editor-workspace__sidebar">
        <div className="platform-code-editor-workspace__sidebar-header">
          <div className="platform-code-editor-workspace__sidebar-heading">
            <div className="platform-code-editor-workspace__sidebar-title">
              {sidebarTitle}
            </div>
            {sidebarActions ? (
              <div className="platform-code-editor-workspace__sidebar-actions">
                {sidebarActions}
              </div>
            ) : null}
          </div>
          <PlatformSearch
            className="platform-code-editor-workspace__sidebar-search"
            value={resolvedFileSearchValue}
            placeholder={fileSearchPlaceholder}
            aria-label={fileSearchAriaLabel}
            onChange={handleFileSearchChange}
            disabled={isLoadingFiles}
          />
        </div>
        <div
          className={joinClassNames(
            "platform-code-editor-workspace__file-list",
            isLoadingFiles && "is-loading",
          )}
        >
          {isLoadingFiles ? (
            <PlatformLoadingState
              className="platform-code-editor-workspace__file-loading"
              message={loadingFilesMessage}
              centered
            />
          ) : visibleFiles.length > 0 ? (
            visibleFiles.map((file) => {
              const isActive = file.id === activeFileId;
              return (
                <button
                  key={file.id}
                  type="button"
                  className={joinClassNames(
                    "platform-code-editor-workspace__file",
                    isActive && "is-active",
                  )}
                  disabled={file.disabled}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={file.ariaLabel}
                  style={{
                    paddingInlineStart: `${14 + Math.max(0, Number(file.depth) || 0) * 16}px`,
                  }}
                  onClick={() => openFile(file)}
                >
                  <span
                    className="platform-code-editor-workspace__file-spacer"
                    aria-hidden="true"
                  >
                    {file.leading}
                  </span>
                  {file.icon ? (
                    <span className="platform-code-editor-workspace__file-icon" aria-hidden="true">
                      {file.icon}
                    </span>
                  ) : null}
                  <span className="platform-code-editor-workspace__file-label">
                    {file.label ?? file.id}
                  </span>
                </button>
              );
            })
          ) : (
            <div className="platform-code-editor-workspace__empty">
              {normalizedFileSearchValue ? emptySearchResults : emptyFiles}
            </div>
          )}
        </div>
      </aside>

      <div className="platform-code-editor-workspace__editor">
        {showTabBar ? (
          <PlatformCodeEditorTabBar
            tabs={openTabs}
            activeTabId={activeFileId}
            onTabSelect={selectOpenFile}
            onTabClose={closeOpenFile}
          />
        ) : null}
        <div className="platform-code-editor-workspace__editor-body">
          {activeFileIsOpen && editor ? editor : (
            <div className="platform-code-editor-workspace__empty is-editor">{emptyEditor}</div>
          )}
        </div>
        {showFooter ? (
          <div className="platform-code-editor-workspace__footer">
            <div
              className={joinClassNames(
                "platform-code-editor-workspace__status",
                statusTone !== "default" && `is-${statusTone}`,
              )}
              role={statusTone === "error" ? "alert" : undefined}
            >
              {status}
            </div>
            {historyControls ? (
              <div className="platform-code-editor-workspace__actions">
                {renderHistoryControls(historyControls)}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
