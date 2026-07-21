import { EllipsisVertical, Redo2, SquarePen, Trash2, Undo2 } from "lucide-react";
import type {
  ChangeEvent,
  DragEventHandler,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MouseEventHandler,
  ReactNode,
} from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PlatformLoadingState } from "../loading-state/index.js";
import { PlatformPopup } from "../popup/index.js";
import { PlatformCheckbox } from "../../ui/checkbox/index.js";
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
  selectable?: boolean;
  renameDisabled?: boolean;
  deleteDisabled?: boolean;
}

export interface PlatformCodeEditorFileSelectionChange {
  selectedIds: ReadonlySet<string>;
  selectedFiles: readonly PlatformCodeEditorFile[];
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
  selectedFileIds?: ReadonlySet<string> | readonly string[];
  defaultSelectedFileIds?: ReadonlySet<string> | readonly string[];
  onFileSelectionChange?: (change: PlatformCodeEditorFileSelectionChange) => void;
  onFileRename?: (file: PlatformCodeEditorFile) => void | Promise<void>;
  onFilesDelete?: (files: readonly PlatformCodeEditorFile[]) => void | Promise<void>;
  /** @deprecated The Explorer heading is no longer rendered. */
  sidebarTitle?: ReactNode;
  /** @deprecated Use tabBarActions. */
  sidebarActions?: ReactNode;
  tabBarActions?: ReactNode;
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

function normalizeFileSelection(
  value: ReadonlySet<string> | readonly string[] | undefined,
) {
  return new Set(
    Array.from(value || [])
      .map((fileId) => String(fileId || "").trim())
      .filter(Boolean),
  );
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
  selectedFileIds,
  defaultSelectedFileIds = [],
  onFileSelectionChange,
  onFileRename,
  onFilesDelete,
  sidebarActions = null,
  tabBarActions,
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
  const [internalSelectedFileIds, setInternalSelectedFileIds] = useState<Set<string>>(
    () => normalizeFileSelection(defaultSelectedFileIds),
  );
  const [fileMenu, setFileMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
    alignment: "start" | "end";
  } | null>(null);
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
  const fileMenuSurfaceRef = useRef<HTMLDivElement | null>(null);
  const selectionControlled = selectedFileIds !== undefined;
  const resolvedSelectedFileIds = useMemo(
    () => selectionControlled
      ? normalizeFileSelection(selectedFileIds)
      : internalSelectedFileIds,
    [internalSelectedFileIds, selectedFileIds, selectionControlled],
  );
  const fileById = useMemo(
    () => new Map(files.map((file) => [file.id, file])),
    [files],
  );
  const fileActionsEnabled = Boolean(onFileRename || onFilesDelete);
  const fileSelectionEnabled = Boolean(onFilesDelete);
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

  useEffect(() => {
    if (selectionControlled) return;
    setInternalSelectedFileIds((current) => {
      const next = new Set(
        Array.from(current).filter((fileId) => {
          const file = fileById.get(fileId);
          return file && file.selectable !== false && !file.deleteDisabled;
        }),
      );
      if (next.size === current.size && Array.from(next).every((fileId) => current.has(fileId))) {
        return current;
      }
      return next;
    });
  }, [fileById, selectionControlled]);

  useEffect(() => {
    if (!fileMenu) return;
    const closeFileMenu = () => setFileMenu(null);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (target && fileMenuSurfaceRef.current?.contains(target)) return;
      closeFileMenu();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeFileMenu();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", closeFileMenu);
    window.addEventListener("scroll", closeFileMenu, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", closeFileMenu);
      window.removeEventListener("scroll", closeFileMenu, true);
    };
  }, [fileMenu]);

  const commitFileSelection = useCallback((next: Set<string>) => {
    if (!selectionControlled) setInternalSelectedFileIds(next);
    onFileSelectionChange?.({
      selectedIds: next,
      selectedFiles: files.filter((file) => next.has(file.id)),
    });
  }, [files, onFileSelectionChange, selectionControlled]);

  const toggleFileSelection = useCallback((file: PlatformCodeEditorFile) => {
    if (!fileSelectionEnabled || file.selectable === false || file.deleteDisabled) return;
    const next = new Set(resolvedSelectedFileIds);
    if (next.has(file.id)) next.delete(file.id);
    else next.add(file.id);
    commitFileSelection(next);
  }, [commitFileSelection, fileSelectionEnabled, resolvedSelectedFileIds]);

  const openFileMenu = useCallback((
    event: ReactMouseEvent<HTMLElement>,
    file: PlatformCodeEditorFile,
    contextMenu = false,
  ) => {
    if (!fileActionsEnabled) return;
    event.preventDefault();
    event.stopPropagation();
    const rect = contextMenu ? null : event.currentTarget.getBoundingClientRect();
    setFileMenu((current) => {
      if (!contextMenu && current?.fileId === file.id) return null;
      return {
        fileId: file.id,
        x: contextMenu ? event.clientX : (rect?.right || event.clientX),
        y: contextMenu ? event.clientY : (rect?.bottom || event.clientY),
        alignment: contextMenu ? "start" : "end",
      };
    });
  }, [fileActionsEnabled]);

  const menuFile = fileMenu ? fileById.get(fileMenu.fileId) : undefined;
  const selectedFiles = useMemo(
    () => files.filter((file) => resolvedSelectedFileIds.has(file.id)),
    [files, resolvedSelectedFileIds],
  );
  const menuTargetFiles = menuFile
    ? resolvedSelectedFileIds.has(menuFile.id) && selectedFiles.length > 1
      ? selectedFiles
      : [menuFile]
    : [];
  const menuTargetsMultipleFiles = menuTargetFiles.length > 1;
  const renameMenuDisabled = !menuFile || menuFile.renameDisabled;
  const deleteMenuDisabled = !menuTargetFiles.length
    || menuTargetFiles.some((file) => file.deleteDisabled);

  const runFileAction = useCallback((action: () => void | Promise<void>) => {
    setFileMenu(null);
    try {
      const result = action();
      if (result && typeof result.catch === "function") {
        result.catch((error) => console.error("[PlatformCodeEditorWorkspace] File action failed", error));
      }
    } catch (error) {
      console.error("[PlatformCodeEditorWorkspace] File action failed", error);
    }
  }, []);

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
  const fileMenuPopup = typeof document !== "undefined" && document.body
    ? createPortal(
        <PlatformPopup
          open={Boolean(fileMenu && menuFile)}
          portal
          portalTarget={document.body}
          variant="minimal"
          placement={fileMenu?.alignment === "end" ? "bottom-end" : "bottom-start"}
          portalOffset={6}
          animation="down-in"
          rootClassName="platform-code-editor-workspace__file-menu-anchor"
          rootProps={{
            style: {
              position: "fixed",
              left: fileMenu?.x ?? 0,
              top: fileMenu?.y ?? 0,
              width: 1,
              height: 1,
              pointerEvents: "none",
            },
          }}
          surfaceRef={fileMenuSurfaceRef}
          surfaceClassName="platform-code-editor-workspace__file-menu"
          surfaceProps={{
            role: "menu",
            width: 180,
            onClick: (event) => event.stopPropagation(),
            onContextMenu: (event) => event.preventDefault(),
          }}
          trigger={<span aria-hidden="true" />}
        >
          {!menuTargetsMultipleFiles && onFileRename ? (
            <button
              type="button"
              role="menuitem"
              className="tb-popup-row"
              disabled={renameMenuDisabled}
              onClick={() => {
                if (!menuFile || renameMenuDisabled) return;
                runFileAction(() => onFileRename(menuFile));
              }}
            >
              <SquarePen className="tb-popup-icon" aria-hidden="true" />
              <span className="tb-popup-label">Rename</span>
            </button>
          ) : null}
          {onFilesDelete ? (
            <button
              type="button"
              role="menuitem"
              className="tb-popup-row"
              disabled={deleteMenuDisabled}
              onClick={() => {
                if (deleteMenuDisabled) return;
                runFileAction(() => onFilesDelete(menuTargetFiles));
              }}
            >
              <Trash2 className="tb-popup-icon" aria-hidden="true" />
              <span className="tb-popup-label">Delete</span>
            </button>
          ) : null}
        </PlatformPopup>,
        document.body,
      )
    : null;

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
              const isSelected = resolvedSelectedFileIds.has(file.id);
              const fileSelectable = fileSelectionEnabled
                && file.selectable !== false
                && !file.deleteDisabled;
              return (
                <div
                  key={file.id}
                  className={joinClassNames(
                    "platform-code-editor-workspace__file",
                    isActive && "is-active",
                    isSelected && "is-selected",
                    fileMenu?.fileId === file.id && "is-menu-open",
                  )}
                  onContextMenu={(event) => openFileMenu(event, file, true)}
                >
                  {fileSelectionEnabled ? (
                    <PlatformCheckbox
                      className="platform-code-editor-workspace__file-checkbox"
                      checked={isSelected}
                      disabled={!fileSelectable}
                      aria-label={`${isSelected ? "Deselect" : "Select"} ${file.ariaLabel || file.id}`}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        toggleFileSelection(file);
                      }}
                    />
                  ) : null}
                  <button
                    type="button"
                    className="platform-code-editor-workspace__file-main"
                    disabled={file.disabled}
                    aria-current={isActive ? "page" : undefined}
                    aria-label={file.ariaLabel}
                    onClick={() => openFile(file)}
                  >
                    {file.leading ? (
                      <span
                        className="platform-code-editor-workspace__file-leading"
                        aria-hidden="true"
                      >
                        {file.leading}
                      </span>
                    ) : null}
                    <span className="platform-code-editor-workspace__file-label">
                      {file.label ?? file.id}
                    </span>
                  </button>
                  {fileActionsEnabled ? (
                    <button
                      type="button"
                      className="platform-code-editor-workspace__file-actions"
                      aria-label={`Open actions for ${file.ariaLabel || file.id}`}
                      aria-haspopup="menu"
                      aria-expanded={fileMenu?.fileId === file.id ? "true" : "false"}
                      onClick={(event) => openFileMenu(event, file)}
                      onContextMenu={(event) => openFileMenu(event, file, true)}
                    >
                      <EllipsisVertical aria-hidden="true" />
                    </button>
                  ) : null}
                </div>
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
            endActions={tabBarActions ?? sidebarActions}
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

      {fileMenuPopup}
    </section>
  );
}
