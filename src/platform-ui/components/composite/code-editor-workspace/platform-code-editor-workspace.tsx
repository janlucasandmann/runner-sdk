import {
  ArrowUpFromLine,
  EllipsisVertical,
  FilePlus2,
  Folder,
  FolderPlus,
  Plus,
  Redo2,
  SquarePen,
  Trash2,
  Undo2,
} from "lucide-react";
import type {
  DragEvent as ReactDragEvent,
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
import {
  PlatformInstructionsEditor,
  type PlatformInstructionsEditorChangeContext,
  type PlatformInstructionsEditorContentVariant,
  type PlatformInstructionsEditorFileUpload,
} from "../instructions-editor/index.js";
import { PlatformCheckbox } from "../../ui/checkbox/index.js";
import { PlatformIconButton } from "../../ui/icon-button/index.js";

export type PlatformCodeEditorStatusTone = "default" | "success" | "error" | "loading";
export type PlatformCodeEditorWorkspaceVariant = "default" | "full-screen";

export interface PlatformCodeEditorFile {
  id: string;
  label?: ReactNode;
  tabLabel?: ReactNode;
  editorMode?: "code" | "markdown";
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
  isFolder?: boolean;
  parentId?: string | null;
  moveDisabled?: boolean;
  dropDisabled?: boolean;
}

export interface PlatformCodeEditorFileSelectionChange {
  selectedIds: ReadonlySet<string>;
  selectedFiles: readonly PlatformCodeEditorFile[];
}

export interface PlatformCodeEditorFileMove {
  files: readonly PlatformCodeEditorFile[];
  destinationFolder: PlatformCodeEditorFile | null;
}

export interface PlatformCodeEditorHistoryControls {
  onUndo?: MouseEventHandler<HTMLButtonElement>;
  onRedo?: MouseEventHandler<HTMLButtonElement>;
  undoDisabled?: boolean;
  redoDisabled?: boolean;
}

export interface PlatformCodeEditorMarkdownEditor {
  value: string;
  onChange: (
    value: string,
    context?: PlatformInstructionsEditorChangeContext,
  ) => void;
  placeholder?: string;
  ariaLabel?: string;
  readOnly?: boolean;
  historyKey?: string | number;
  contentVariant?: PlatformInstructionsEditorContentVariant;
  fileUpload?: PlatformInstructionsEditorFileUpload;
  autoFocus?: boolean;
  className?: string;
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
  onFilesMove?: (move: PlatformCodeEditorFileMove) => void | Promise<void>;
  onCreateFile?: () => void | Promise<void>;
  onUploadFiles?: () => void | Promise<void>;
  onCreateFolder?: () => void | Promise<void>;
  fileCreationDisabled?: boolean;
  sidebarTitle?: ReactNode;
  sidebarActions?: ReactNode;
  /** @deprecated Use sidebarActions. */
  tabBarActions?: ReactNode;
  /** @deprecated File search is no longer rendered in the workspace sidebar. */
  fileSearchValue?: string;
  /** @deprecated File search is no longer rendered in the workspace sidebar. */
  defaultFileSearchValue?: string;
  /** @deprecated File search is no longer rendered in the workspace sidebar. */
  fileSearchPlaceholder?: string;
  /** @deprecated File search is no longer rendered in the workspace sidebar. */
  fileSearchAriaLabel?: string;
  /** @deprecated File search is no longer rendered in the workspace sidebar. */
  onFileSearchChange?: (value: string) => void;
  isLoadingFiles?: boolean;
  loadingFilesMessage?: ReactNode;
  /** @deprecated The workspace renders one active-file header instead of tabs. */
  showTabBar?: boolean;
  /** @deprecated The workspace renders one active-file header instead of tabs. */
  defaultOpenFileIds?: readonly string[];
  /** @deprecated The workspace renders one active-file header instead of tabs. */
  onFileClose?: (fileId: string) => void;
  editor?: ReactNode;
  markdownEditor?: PlatformCodeEditorMarkdownEditor;
  emptyFiles?: ReactNode;
  emptySearchResults?: ReactNode;
  emptyEditor?: ReactNode;
  /** @deprecated The workspace footer has been removed. */
  status?: ReactNode;
  /** @deprecated The workspace footer has been removed. */
  statusTone?: PlatformCodeEditorStatusTone;
  historyControls?: PlatformCodeEditorHistoryControls;
  /** @deprecated The workspace footer has been removed. */
  showFooter?: boolean;
  variant?: PlatformCodeEditorWorkspaceVariant;
  sidebarHidden?: boolean;
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

export function isPlatformCodeEditorMarkdownFile(
  file: PlatformCodeEditorFile | null | undefined,
) {
  if (!file || file.isFolder) return false;
  if (file.editorMode) return file.editorMode === "markdown";
  const candidates = [
    file.id,
    typeof file.label === "string" ? file.label : "",
    typeof file.tabLabel === "string" ? file.tabLabel : "",
    file.ariaLabel,
    file.searchText,
  ];
  return candidates.some((candidate) => {
    const normalizedCandidate = String(candidate || "")
      .trim()
      .split(/[?#]/, 1)[0];
    return /\.(?:md|markdown|mdown|mkd|mkdn)$/i.test(normalizedCandidate);
  });
}

const PLATFORM_CODE_EDITOR_FILE_DRAG_TYPE = "application/x-platform-code-editor-files";

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
  onFilesMove,
  onCreateFile,
  onUploadFiles,
  onCreateFolder,
  fileCreationDisabled = false,
  sidebarTitle = "Files",
  sidebarActions = null,
  tabBarActions = null,
  isLoadingFiles = false,
  loadingFilesMessage = "Loading files...",
  editor = null,
  markdownEditor,
  emptyFiles = "No code files.",
  emptyEditor = "Select a file to edit.",
  historyControls,
  variant = "default",
  sidebarHidden = false,
  ariaLabel = "Code editor",
  className = "",
  onDragOver,
  onDragLeave,
  onDrop,
}: PlatformCodeEditorWorkspaceProps) {
  const [internalSelectedFileIds, setInternalSelectedFileIds] = useState<Set<string>>(
    () => normalizeFileSelection(defaultSelectedFileIds),
  );
  const [createFileMenuOpen, setCreateFileMenuOpen] = useState(false);
  const [draggedFileIds, setDraggedFileIds] = useState<readonly string[]>([]);
  const [dropTargetId, setDropTargetId] = useState<string | null | undefined>(undefined);
  const [fileMenu, setFileMenu] = useState<{
    fileId: string;
    x: number;
    y: number;
    alignment: "start" | "end";
  } | null>(null);
  const createFileMenuRootRef = useRef<HTMLDivElement | null>(null);
  const createFileMenuSurfaceRef = useRef<HTMLDivElement | null>(null);
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
  const fileMoveEnabled = Boolean(onFilesMove);
  const fileCreationMenuEnabled = Boolean(onCreateFile || onUploadFiles);
  const creationControlsDisabled = fileCreationDisabled || isLoadingFiles;
  const activeFile = fileById.get(activeFileId);
  const activeFileTitle = activeFile?.tabLabel ?? activeFile?.label ?? activeFile?.id ?? "";
  const markdownEditorActive = Boolean(
    markdownEditor && isPlatformCodeEditorMarkdownFile(activeFile),
  );
  const draggedFiles = useMemo(
    () => draggedFileIds
      .map((fileId) => fileById.get(fileId))
      .filter((file): file is PlatformCodeEditorFile => Boolean(file)),
    [draggedFileIds, fileById],
  );

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

  useEffect(() => {
    if (!createFileMenuOpen) return;
    const closeCreateFileMenu = () => setCreateFileMenuOpen(false);
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (
        target
        && (
          createFileMenuRootRef.current?.contains(target)
          || createFileMenuSurfaceRef.current?.contains(target)
        )
      ) {
        return;
      }
      closeCreateFileMenu();
    };
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") closeCreateFileMenu();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [createFileMenuOpen]);

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
    setCreateFileMenuOpen(false);
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
    onFileSelect?.(file.id);
  };
  const clearFileDrag = useCallback(() => {
    setDraggedFileIds([]);
    setDropTargetId(undefined);
  }, []);
  const destinationAcceptsDraggedFiles = useCallback((
    destinationFolder: PlatformCodeEditorFile | null,
  ) => {
    if (!fileMoveEnabled || draggedFiles.length === 0) return false;
    if (destinationFolder && (!destinationFolder.isFolder || destinationFolder.dropDisabled)) {
      return false;
    }
    const destinationId = destinationFolder?.id ?? null;
    if (draggedFiles.every((file) => (file.parentId ?? null) === destinationId)) {
      return false;
    }
    for (const draggedFile of draggedFiles) {
      if (!destinationFolder) continue;
      if (
        destinationFolder.id === draggedFile.id
        || destinationFolder.id.startsWith(`${draggedFile.id}/`)
      ) {
        return false;
      }
      let ancestorId = destinationFolder.parentId ?? null;
      while (ancestorId) {
        if (ancestorId === draggedFile.id) return false;
        ancestorId = fileById.get(ancestorId)?.parentId ?? null;
      }
    }
    return true;
  }, [draggedFiles, fileById, fileMoveEnabled]);
  const startFileDrag = useCallback((
    event: ReactDragEvent<HTMLElement>,
    file: PlatformCodeEditorFile,
  ) => {
    if (!fileMoveEnabled || file.moveDisabled) {
      event.preventDefault();
      return;
    }
    const moveFiles = (
      resolvedSelectedFileIds.has(file.id) && resolvedSelectedFileIds.size > 1
        ? files.filter((candidate) => resolvedSelectedFileIds.has(candidate.id))
        : [file]
    ).filter((candidate) => !candidate.moveDisabled);
    if (moveFiles.length === 0) {
      event.preventDefault();
      return;
    }
    const nextDraggedFileIds = moveFiles.map((candidate) => candidate.id);
    setDraggedFileIds(nextDraggedFileIds);
    setDropTargetId(undefined);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      PLATFORM_CODE_EDITOR_FILE_DRAG_TYPE,
      JSON.stringify(nextDraggedFileIds),
    );
    event.stopPropagation();
  }, [fileMoveEnabled, files, resolvedSelectedFileIds]);
  const dragFilesOverDestination = useCallback((
    event: ReactDragEvent<HTMLElement>,
    destinationFolder: PlatformCodeEditorFile | null,
  ) => {
    if (!destinationAcceptsDraggedFiles(destinationFolder)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "move";
    setDropTargetId(destinationFolder?.id ?? null);
  }, [destinationAcceptsDraggedFiles]);
  const dropFilesAtDestination = useCallback((
    event: ReactDragEvent<HTMLElement>,
    destinationFolder: PlatformCodeEditorFile | null,
  ) => {
    if (!destinationAcceptsDraggedFiles(destinationFolder) || !onFilesMove) return;
    event.preventDefault();
    event.stopPropagation();
    const filesToMove = draggedFiles;
    clearFileDrag();
    runFileAction(() => onFilesMove({
      files: filesToMove,
      destinationFolder,
    }));
  }, [
    clearFileDrag,
    destinationAcceptsDraggedFiles,
    draggedFiles,
    onFilesMove,
    runFileAction,
  ]);
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
  const resolvedSidebarActions = sidebarActions ?? tabBarActions;
  const createFileMenu = fileCreationMenuEnabled ? (
    <PlatformPopup
      open={createFileMenuOpen}
      rootRef={createFileMenuRootRef}
      surfaceRef={createFileMenuSurfaceRef}
      rootClassName="platform-code-editor-workspace__create-menu-anchor"
      surfaceClassName="platform-code-editor-workspace__create-menu"
      surfaceProps={{ role: "menu", width: 180 }}
      animation="down-in"
      variant="minimal"
      portal
      placement="bottom-end"
      trigger={({ open }) => (
        <PlatformIconButton
          size="compact"
          active={open}
          aria-label="Add file"
          title="Add file"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={creationControlsDisabled}
          onClick={() => setCreateFileMenuOpen((current) => !current)}
        >
          <Plus aria-hidden="true" />
        </PlatformIconButton>
      )}
    >
      {onCreateFile ? (
        <button
          type="button"
          role="menuitem"
          className="tb-popup-row"
          disabled={creationControlsDisabled}
          onClick={() => runFileAction(onCreateFile)}
        >
          <FilePlus2 className="tb-popup-icon" aria-hidden="true" />
          <span className="tb-popup-label">Create File</span>
        </button>
      ) : null}
      {onUploadFiles ? (
        <button
          type="button"
          role="menuitem"
          className="tb-popup-row"
          disabled={creationControlsDisabled}
          onClick={() => runFileAction(onUploadFiles)}
        >
          <ArrowUpFromLine className="tb-popup-icon" aria-hidden="true" />
          <span className="tb-popup-label">Upload Files</span>
        </button>
      ) : null}
    </PlatformPopup>
  ) : null;

  return (
    <section
      className={joinClassNames(
        "platform-code-editor-workspace",
        variant === "full-screen" && "is-full-screen",
        sidebarHidden && "is-sidebar-hidden",
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
      {!sidebarHidden ? <aside className="platform-code-editor-workspace__sidebar">
        <div
          className={joinClassNames(
            "platform-code-editor-workspace__sidebar-header",
            dropTargetId === null && "is-drop-target",
          )}
          onDragOver={(event) => dragFilesOverDestination(event, null)}
          onDrop={(event) => dropFilesAtDestination(event, null)}
        >
          <span className="platform-code-editor-workspace__sidebar-title">
            {sidebarTitle}
          </span>
          <div className="platform-code-editor-workspace__sidebar-actions">
            {createFileMenu}
            {onCreateFolder ? (
              <PlatformIconButton
                size="compact"
                aria-label="Create folder"
                title="Create folder"
                disabled={creationControlsDisabled}
                onClick={() => runFileAction(onCreateFolder)}
              >
                <FolderPlus aria-hidden="true" />
              </PlatformIconButton>
            ) : null}
            {resolvedSidebarActions}
          </div>
        </div>
        <div
          className={joinClassNames(
            "platform-code-editor-workspace__file-list",
            isLoadingFiles && "is-loading",
            dropTargetId === null && "is-drop-target",
          )}
          onDragOver={(event) => dragFilesOverDestination(event, null)}
          onDrop={(event) => dropFilesAtDestination(event, null)}
        >
          {isLoadingFiles ? (
            <PlatformLoadingState
              className="platform-code-editor-workspace__file-loading"
              message={loadingFilesMessage}
              centered
            />
          ) : files.length > 0 ? (
            files.map((file) => {
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
                    draggedFileIds.includes(file.id) && "is-dragging",
                    dropTargetId === file.id && "is-drop-target",
                  )}
                  style={{
                    paddingInlineStart: `${12 + Math.max(0, Number(file.depth || 0)) * 16}px`,
                  }}
                  draggable={fileMoveEnabled && !file.moveDisabled}
                  aria-grabbed={
                    fileMoveEnabled && !file.moveDisabled
                      ? draggedFileIds.includes(file.id)
                      : undefined
                  }
                  onDragStart={(event) => startFileDrag(event, file)}
                  onDragEnd={clearFileDrag}
                  onDragOver={
                    file.isFolder
                      ? (event) => dragFilesOverDestination(event, file)
                      : undefined
                  }
                  onDrop={
                    file.isFolder
                      ? (event) => dropFilesAtDestination(event, file)
                      : undefined
                  }
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
                    {file.isFolder ? (
                      <Folder
                        className="platform-code-editor-workspace__folder-icon"
                        aria-hidden="true"
                      />
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
              {emptyFiles}
            </div>
          )}
        </div>
      </aside> : null}

      <div
        className={joinClassNames(
          "platform-code-editor-workspace__editor",
          markdownEditorActive && "is-markdown",
        )}
      >
        {markdownEditorActive && markdownEditor ? (
          <PlatformInstructionsEditor
            value={markdownEditor.value}
            onChange={markdownEditor.onChange}
            title={activeFileTitle}
            placeholder={markdownEditor.placeholder || "Write Markdown..."}
            ariaLabel={
              markdownEditor.ariaLabel
              || `${String(activeFile?.ariaLabel || activeFile?.id || "Markdown file")} content`
            }
            readOnly={markdownEditor.readOnly}
            stickyHeader={false}
            historyKey={markdownEditor.historyKey ?? activeFile?.id ?? "markdown"}
            variant="minimalistic-ui"
            contentVariant={markdownEditor.contentVariant}
            fileUpload={markdownEditor.fileUpload}
            autoFocus={markdownEditor.autoFocus}
            className={joinClassNames(
              "platform-code-editor-workspace__markdown-editor",
              markdownEditor.className,
            )}
          />
        ) : (
          <>
            <div className="platform-code-editor-workspace__editor-header">
              <span className="platform-code-editor-workspace__editor-title">
                {activeFileTitle}
              </span>
              {historyControls ? (
                <div className="platform-code-editor-workspace__header-actions">
                  {renderHistoryControls(historyControls)}
                </div>
              ) : null}
            </div>
            <div className="platform-code-editor-workspace__editor-body">
              {editor ? editor : (
                <div className="platform-code-editor-workspace__empty is-editor">{emptyEditor}</div>
              )}
            </div>
          </>
        )}
      </div>

      {fileMenuPopup}
    </section>
  );
}
