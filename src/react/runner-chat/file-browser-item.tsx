import { Check, Ellipsis, ExternalLink, Pencil, Trash2, X } from "../../platform-ui/components/ui/hugeicons-compat.js";
import { type FormEvent, type MouseEvent, useEffect, useRef, useState } from "react";
import {
  PlatformFileExplorerFileIcon,
  type PlatformFileExplorerFileKind,
  PlatformFileExplorerThumbnail,
} from "../../platform-ui/components/composite/file-explorer/index.js";
import { PlatformPopup } from "../../platform-ui/components/composite/popup/index.js";
import { PlatformCheckbox } from "../../platform-ui/components/ui/checkbox/index.js";
import { PlatformIconButton } from "../../platform-ui/components/ui/icon-button/index.js";
import { PlatformSelector } from "../../platform-ui/components/ui/selector/index.js";
import type { RunnerChatOption } from "./agent-options.js";
import { getBrowserFileType } from "./attachment-utils.js";
import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import { IconChevronDown, IconChevronRight, IconLoader2, IconNotion } from "./icons.js";
import {
  buildEnvironmentFileDownloadUrl,
  buildEnvironmentFileThumbnailUrl,
  fileItemsForParent,
  formatBrowserFileDate,
  formatBrowserFileSize,
  type RunnerChatFileNode,
} from "./workspace-files.js";

export function renderRunnerBrowserFileIcon(file: RunnerChatFileNode, className: string) {
  if (file.isFolder) {
    return (
      <PlatformFileExplorerFileIcon
        kind="folder"
        className={`${className} tb-file-browser-item-icon-folder`}
      />
    );
  }

  if (
    file.mimeType === "application/x-notion-database" ||
    file.mimeType === "application/x-notion-workspace"
  ) {
    return <IconNotion className={className} />;
  }

  const fileType = getBrowserFileType(file.mimeType, file.name);

  return (
    <PlatformFileExplorerFileIcon
      kind={fileType as PlatformFileExplorerFileKind}
      className={`${className} tb-file-browser-item-icon-${fileType}`}
    />
  );
}

export interface RunnerFileBrowserItemProps {
  allItems: RunnerChatFileNode[];
  backendUrl: string;
  branchLoadingRepoFullNames: string[];
  branchesByRepoFullName: Record<string, RunnerChatOption[]>;
  buildEffectiveGithubRootItem: (item: RunnerChatFileNode) => RunnerChatFileNode;
  depth?: number;
  expandedFolderIds: string[];
  githubLoadingFolderIds: string[];
  googleDriveLoadingFolderIds: string[];
  item: RunnerChatFileNode;
  onBranchChange: (item: RunnerChatFileNode, branch: string) => void;
  onEnsureBranchesLoaded: (repoFullName: string, fallbackRef?: string | null) => void;
  onDeleteItem?: (item: RunnerChatFileNode) => void | Promise<void>;
  onItemClick: (item: RunnerChatFileNode) => void;
  onOpenItem: (item: RunnerChatFileNode) => void;
  onRenameItem?: (item: RunnerChatFileNode, nextName: string) => void | Promise<void>;
  onToggleSelection: (item: RunnerChatFileNode) => void;
  onToggleFolder: (folderId: string, event: MouseEvent<HTMLButtonElement>) => void;
  onToggleGithubSelection: (itemId: string) => void;
  oneDriveLoadingFolderIds: string[];
  previewItemId: string | null;
  resolveSelectedGithubBranch: (repoFullName: string, fallbackRef?: string | null) => string;
  searchQuery: string;
  selectedItemIds: string[];
  source: RunnerFileBrowserSource;
  workspaceFolderErrorsById: Record<string, string>;
  workspaceEnvironmentId: string;
  workspaceLoadingFolderIds: string[];
}

export function RunnerFileBrowserItem(props: RunnerFileBrowserItemProps) {
  const {
    allItems,
    backendUrl,
    branchLoadingRepoFullNames,
    branchesByRepoFullName,
    buildEffectiveGithubRootItem,
    depth = 0,
    expandedFolderIds,
    githubLoadingFolderIds,
    googleDriveLoadingFolderIds,
    item,
    onBranchChange,
    onDeleteItem,
    onEnsureBranchesLoaded,
    onItemClick,
    onOpenItem,
    onRenameItem,
    onToggleFolder,
    onToggleGithubSelection,
    onToggleSelection,
    oneDriveLoadingFolderIds,
    previewItemId,
    resolveSelectedGithubBranch,
    searchQuery,
    selectedItemIds,
    source,
    workspaceFolderErrorsById,
    workspaceEnvironmentId,
    workspaceLoadingFolderIds,
  } = props;
  const [actionsOpen, setActionsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameDraft, setRenameDraft] = useState(item.name);
  const [renameError, setRenameError] = useState("");
  const actionRootRef = useRef<HTMLDivElement | null>(null);
  const actionSurfaceRef = useRef<HTMLDivElement | null>(null);
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const isGithubRepoRootRow =
    source === "github" &&
    item.isFolder &&
    depth === 0 &&
    !item.parentId &&
    Boolean(item.repoFullName);
  const effectiveItem = isGithubRepoRootRow ? buildEffectiveGithubRootItem(item) : item;
  const effectiveItemId = effectiveItem.id;
  const isSelected = selectedItemIds.includes(effectiveItemId);
  const isPreviewActive = previewItemId === effectiveItemId;
  const isExpanded = expandedFolderIds.includes(effectiveItemId);
  const isFolderLoading =
    source === "workspace"
      ? workspaceLoadingFolderIds.includes(effectiveItemId)
      : source === "google-drive"
        ? googleDriveLoadingFolderIds.includes(effectiveItemId)
        : source === "one-drive"
          ? oneDriveLoadingFolderIds.includes(effectiveItemId)
          : source === "github"
            ? githubLoadingFolderIds.includes(effectiveItemId)
            : false;
  const workspaceFolderError =
    source === "workspace" ? workspaceFolderErrorsById[effectiveItemId] || "" : "";
  const nestedItems = searchQuery.trim() ? [] : fileItemsForParent(allItems, effectiveItemId);
  const showGithubFolderCheckbox = source === "github" && item.isFolder;
  const githubRepoFullName = String(effectiveItem.repoFullName || "").trim();
  const githubBranchOptions = githubRepoFullName
    ? branchesByRepoFullName[githubRepoFullName] || []
    : [];
  const githubSelectedBranch = githubRepoFullName
    ? resolveSelectedGithubBranch(githubRepoFullName, effectiveItem.ref)
    : "";
  const isGithubBranchLoading = githubRepoFullName
    ? branchLoadingRepoFullNames.includes(githubRepoFullName)
    : false;
  const githubBranchSelectOptions =
    githubSelectedBranch &&
    !githubBranchOptions.some(
      (option) => option.id === githubSelectedBranch || option.name === githubSelectedBranch,
    )
      ? [
          {
            id: githubSelectedBranch,
            name: githubSelectedBranch,
          },
          ...githubBranchOptions,
        ]
      : githubBranchOptions;
  const effectiveItemType = getBrowserFileType(effectiveItem.mimeType, effectiveItem.name);
  const shouldRenderImageThumbnail = !effectiveItem.isFolder && effectiveItemType === "image";
  const workspaceThumbnailUrl =
    source === "workspace" && shouldRenderImageThumbnail
      ? buildEnvironmentFileThumbnailUrl(backendUrl, workspaceEnvironmentId, effectiveItem.path, 64)
      : null;
  const imageThumbnailUrl = shouldRenderImageThumbnail
    ? String(effectiveItem.previewUrl || workspaceThumbnailUrl || "").trim()
    : "";
  const imageThumbnailFallbackUrl =
    source === "workspace" && shouldRenderImageThumbnail
      ? buildEnvironmentFileDownloadUrl(backendUrl, workspaceEnvironmentId, effectiveItem.path)
      : null;

  useEffect(() => {
    if (!actionsOpen || typeof document === "undefined") return undefined;
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (actionRootRef.current?.contains(target) || actionSurfaceRef.current?.contains(target)) {
        return;
      }
      setActionsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActionsOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [actionsOpen]);

  useEffect(() => {
    if (!isRenaming) return;
    renameInputRef.current?.focus();
    renameInputRef.current?.select();
  }, [isRenaming]);

  function beginRename() {
    if (!onRenameItem) return;
    setRenameDraft(effectiveItem.name);
    setRenameError("");
    setActionsOpen(false);
    setIsRenaming(true);
  }

  function cancelRename() {
    setRenameDraft(effectiveItem.name);
    setRenameError("");
    setIsRenaming(false);
  }

  async function submitRename(event?: FormEvent) {
    event?.preventDefault();
    event?.stopPropagation();
    if (!onRenameItem) return;
    const nextName = renameDraft.trim();
    if (!nextName) {
      setRenameError("Enter a file name.");
      return;
    }
    try {
      setRenameError("");
      await onRenameItem(effectiveItem, nextName);
      setIsRenaming(false);
    } catch (error) {
      setRenameError(
        error instanceof Error && error.message ? error.message : "Failed to rename item.",
      );
    }
  }

  async function deleteItem() {
    if (!onDeleteItem || isDeleting) return;
    if (typeof window !== "undefined" && !window.confirm(`Delete "${effectiveItem.name}"?`)) {
      setActionsOpen(false);
      return;
    }
    try {
      setIsDeleting(true);
      setActionsOpen(false);
      await onDeleteItem(effectiveItem);
    } catch {
      // The owning browser surfaces mutation errors next to the file list.
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div
        className={`tb-file-browser-item ${isPreviewActive ? "preview" : ""} ${isSelected ? "selected" : ""}`}
        data-platform-file-preview-anchor={isPreviewActive ? "true" : undefined}
        onClick={(event) => {
          if (
            event.target instanceof Element &&
            event.target.closest("button, input, select, form")
          ) {
            return;
          }
          onItemClick(effectiveItem);
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onItemClick(effectiveItem);
          }
        }}
        role="treeitem"
        aria-expanded={item.isFolder ? isExpanded : undefined}
        aria-selected={isSelected}
        tabIndex={0}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
      >
        {item.isFolder ? (
          <button
            type="button"
            className="tb-file-browser-item-leading"
            onClick={(event) => onToggleFolder(effectiveItemId, event)}
          >
            {isFolderLoading ? (
              <IconLoader2 className="tb-file-browser-folder-chevron tb-file-browser-folder-chevron-spin" />
            ) : isExpanded ? (
              <IconChevronDown className="tb-file-browser-folder-chevron" />
            ) : (
              <IconChevronRight className="tb-file-browser-folder-chevron" />
            )}
          </button>
        ) : (
          <PlatformCheckbox
            checked={isSelected}
            className="tb-file-browser-check"
            aria-label={isSelected ? "Deselect file" : "Select file"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleSelection(effectiveItem);
            }}
          />
        )}
        {showGithubFolderCheckbox ? (
          <PlatformCheckbox
            checked={isSelected}
            className="tb-file-browser-check"
            aria-label={isSelected ? "Deselect folder" : "Select folder"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleGithubSelection(effectiveItemId);
            }}
          />
        ) : null}
        {shouldRenderImageThumbnail ? (
          <PlatformFileExplorerThumbnail
            src={imageThumbnailUrl}
            fallbackSrc={imageThumbnailFallbackUrl}
            alt={effectiveItem.name}
            className="tb-file-browser-item-thumbnail"
            draggable={false}
            fallback={renderRunnerBrowserFileIcon(effectiveItem, "tb-file-browser-item-icon")}
          />
        ) : (
          renderRunnerBrowserFileIcon(effectiveItem, "tb-file-browser-item-icon")
        )}
        {isRenaming ? (
          <form
            className="tb-file-browser-item-rename"
            onSubmit={(event) => void submitRename(event)}
          >
            <input
              ref={renameInputRef}
              className="tb-file-browser-item-rename-input"
              value={renameDraft}
              aria-label={`Rename ${effectiveItem.name}`}
              aria-invalid={Boolean(renameError)}
              title={renameError || undefined}
              onChange={(event) => setRenameDraft(event.target.value)}
              onKeyDown={(event) => {
                event.stopPropagation();
                if (event.key === "Escape") cancelRename();
              }}
            />
            <PlatformIconButton
              type="submit"
              size="compact"
              aria-label="Save name"
              className="tb-file-browser-item-rename-action"
              onClick={(event) => event.stopPropagation()}
            >
              <Check aria-hidden="true" />
            </PlatformIconButton>
            <PlatformIconButton
              size="compact"
              aria-label="Cancel rename"
              className="tb-file-browser-item-rename-action"
              onClick={(event) => {
                event.stopPropagation();
                cancelRename();
              }}
            >
              <X aria-hidden="true" />
            </PlatformIconButton>
          </form>
        ) : (
          <span className="tb-file-browser-item-name">{effectiveItem.name}</span>
        )}
        {isGithubRepoRootRow ? (
          <div className="tb-file-browser-item-branch-slot">
            <PlatformSelector
              value={githubSelectedBranch}
              options={githubBranchSelectOptions.map((option) => ({
                value: option.id,
                label: option.name,
              }))}
              ariaLabel={`Select branch for ${githubRepoFullName}`}
              alignment="start"
              popupAlignment="right"
              fullWidth
              loading={isGithubBranchLoading}
              loadingContent="Loading branches..."
              triggerClassName="tb-file-browser-item-branch-select"
              popupClassName="tb-file-browser-item-branch-popup"
              onOpenChange={(open) => {
                if (open) {
                  onEnsureBranchesLoaded(githubRepoFullName, effectiveItem.ref);
                }
              }}
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
              onValueChange={(branch) => {
                onBranchChange(effectiveItem, branch);
              }}
            />
          </div>
        ) : (
          <>
            <span className="tb-file-browser-item-meta">
              {formatBrowserFileDate(effectiveItem.modifiedTime)}
            </span>
            <span className="tb-file-browser-item-size">
              {effectiveItem.isFolder ? "" : formatBrowserFileSize(effectiveItem.size)}
            </span>
          </>
        )}
        <PlatformPopup
          open={actionsOpen}
          variant="minimal"
          portal
          placement="bottom-end"
          animation="down-in"
          rootRef={actionRootRef}
          surfaceRef={actionSurfaceRef}
          rootClassName="tb-file-browser-item-actions"
          rootProps={{
            onClick: (event) => event.stopPropagation(),
            onPointerDown: (event) => event.stopPropagation(),
          }}
          surfaceClassName="tb-file-browser-item-actions-menu"
          surfaceProps={{
            role: "menu",
            onClick: (event) => event.stopPropagation(),
            onPointerDown: (event) => event.stopPropagation(),
          }}
          trigger={
            <PlatformIconButton
              type="button"
              size="compact"
              active={actionsOpen}
              className="tb-file-browser-item-actions-trigger"
              aria-label={`Actions for ${effectiveItem.name}`}
              aria-haspopup="menu"
              aria-expanded={actionsOpen}
              onClick={(event) => {
                event.stopPropagation();
                setActionsOpen((current) => !current);
              }}
            >
              <Ellipsis aria-hidden="true" />
            </PlatformIconButton>
          }
        >
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            disabled={!onRenameItem}
            onClick={beginRename}
          >
            <Pencil className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">Rename</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            onClick={() => {
              setActionsOpen(false);
              onOpenItem(effectiveItem);
            }}
          >
            <ExternalLink className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">Open</span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            disabled={!onDeleteItem || isDeleting}
            onClick={() => void deleteItem()}
          >
            <Trash2 className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">Delete</span>
          </button>
        </PlatformPopup>
      </div>

      {item.isFolder && isExpanded ? (
        <div className="tb-file-browser-item-children">
          {nestedItems.map((nestedItem) => (
            <RunnerFileBrowserItem
              {...props}
              key={nestedItem.id}
              item={nestedItem}
              depth={depth + 1}
            />
          ))}
          {workspaceFolderError && nestedItems.length === 0 ? (
            <div className="tb-file-browser-empty">{workspaceFolderError}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
