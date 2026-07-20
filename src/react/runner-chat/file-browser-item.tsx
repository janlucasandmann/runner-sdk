import type { MouseEvent } from "react";
import {
  PlatformFileExplorerFileIcon,
  PlatformFileExplorerThumbnail,
  type PlatformFileExplorerFileKind,
} from "../../platform-ui/components/composite/file-explorer/index.js";
import { PlatformCheckbox } from "../../platform-ui/components/ui/checkbox/index.js";
import type { RunnerChatOption } from "./agent-options.js";
import { getBrowserFileType } from "./attachment-utils.js";
import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import {
  IconChevronDown,
  IconChevronRight,
  IconLoader2,
  IconNotion,
} from "./icons.js";
import {
  buildEnvironmentFileDownloadUrl,
  buildEnvironmentFileThumbnailUrl,
  fileItemsForParent,
  formatBrowserFileDate,
  formatBrowserFileSize,
  type RunnerChatFileNode,
} from "./workspace-files.js";

export function renderRunnerBrowserFileIcon(
  file: RunnerChatFileNode,
  className: string,
) {
  if (file.isFolder) {
    return (
      <PlatformFileExplorerFileIcon
        kind="folder"
        className={`${className} tb-file-browser-item-icon-folder`}
      />
    );
  }

  if (
    file.mimeType === "application/x-notion-database"
    || file.mimeType === "application/x-notion-workspace"
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
  buildEffectiveGithubRootItem: (
    item: RunnerChatFileNode,
  ) => RunnerChatFileNode;
  depth?: number;
  expandedFolderIds: string[];
  githubLoadingFolderIds: string[];
  googleDriveLoadingFolderIds: string[];
  item: RunnerChatFileNode;
  onBranchChange: (item: RunnerChatFileNode, branch: string) => void;
  onEnsureBranchesLoaded: (
    repoFullName: string,
    fallbackRef?: string | null,
  ) => void;
  onItemClick: (item: RunnerChatFileNode) => void;
  onToggleFolder: (
    folderId: string,
    event: MouseEvent<HTMLButtonElement>,
  ) => void;
  onToggleGithubSelection: (itemId: string) => void;
  oneDriveLoadingFolderIds: string[];
  previewItemId: string | null;
  resolveSelectedGithubBranch: (
    repoFullName: string,
    fallbackRef?: string | null,
  ) => string;
  searchQuery: string;
  selectedItemIds: string[];
  source: RunnerFileBrowserSource;
  workspaceFolderErrorsById: Record<string, string>;
  workspaceEnvironmentId: string;
  workspaceLoadingFolderIds: string[];
}

export function RunnerFileBrowserItem(
  props: RunnerFileBrowserItemProps,
) {
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
    onEnsureBranchesLoaded,
    onItemClick,
    onToggleFolder,
    onToggleGithubSelection,
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
  const isGithubRepoRootRow =
    source === "github"
    && item.isFolder
    && depth === 0
    && !item.parentId
    && Boolean(item.repoFullName);
  const effectiveItem = isGithubRepoRootRow
    ? buildEffectiveGithubRootItem(item)
    : item;
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
    source === "workspace"
      ? workspaceFolderErrorsById[effectiveItemId] || ""
      : "";
  const nestedItems = searchQuery.trim()
    ? []
    : fileItemsForParent(allItems, effectiveItemId);
  const showGithubFolderCheckbox =
    source === "github" && item.isFolder;
  const githubRepoFullName =
    String(effectiveItem.repoFullName || "").trim();
  const githubBranchOptions = githubRepoFullName
    ? branchesByRepoFullName[githubRepoFullName] || []
    : [];
  const githubSelectedBranch = githubRepoFullName
    ? resolveSelectedGithubBranch(
        githubRepoFullName,
        effectiveItem.ref,
      )
    : "";
  const isGithubBranchLoading = githubRepoFullName
    ? branchLoadingRepoFullNames.includes(githubRepoFullName)
    : false;
  const githubBranchSelectOptions =
    githubSelectedBranch
    && !githubBranchOptions.some(
      (option) =>
        option.id === githubSelectedBranch
        || option.name === githubSelectedBranch,
    )
      ? [
          {
            id: githubSelectedBranch,
            name: githubSelectedBranch,
          },
          ...githubBranchOptions,
        ]
      : githubBranchOptions;
  const effectiveItemType = getBrowserFileType(
    effectiveItem.mimeType,
    effectiveItem.name,
  );
  const workspaceThumbnailUrl =
    source === "workspace" && effectiveItemType === "image"
      ? buildEnvironmentFileThumbnailUrl(
          backendUrl,
          workspaceEnvironmentId,
          effectiveItem.path,
          64,
        )
      : null;
  const imageThumbnailUrl =
    effectiveItemType === "image"
      ? String(effectiveItem.previewUrl || workspaceThumbnailUrl || "").trim()
      : "";
  const imageThumbnailFallbackUrl =
    source === "workspace" && effectiveItemType === "image"
      ? buildEnvironmentFileDownloadUrl(
          backendUrl,
          workspaceEnvironmentId,
          effectiveItem.path,
        )
      : null;

  return (
    <div>
      <div
        className={`tb-file-browser-item ${isPreviewActive ? "preview" : ""} ${isSelected ? "selected" : ""}`}
        onClick={() => onItemClick(effectiveItem)}
        onKeyDown={(event) => {
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
              onItemClick(effectiveItem);
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
        {effectiveItemType === "image" ? (
          <PlatformFileExplorerThumbnail
            src={imageThumbnailUrl}
            fallbackSrc={imageThumbnailFallbackUrl}
            alt={effectiveItem.name}
            className="tb-file-browser-item-thumbnail"
            draggable={false}
            fallback={renderRunnerBrowserFileIcon(
              effectiveItem,
              "tb-file-browser-item-icon",
            )}
          />
        ) : (
          renderRunnerBrowserFileIcon(
            effectiveItem,
            "tb-file-browser-item-icon",
          )
        )}
        <span className="tb-file-browser-item-name">
          {effectiveItem.name}
        </span>
        {isGithubRepoRootRow ? (
          <div className="tb-file-browser-item-branch-slot">
            <select
              className="tb-file-browser-item-branch-select"
              value={githubSelectedBranch}
              disabled={isGithubBranchLoading}
              onFocus={() => {
                onEnsureBranchesLoaded(
                  githubRepoFullName,
                  effectiveItem.ref,
                );
              }}
              onClick={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onChange={(event) => {
                event.stopPropagation();
                onBranchChange(effectiveItem, event.target.value);
              }}
            >
              {githubBranchSelectOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <span className="tb-file-browser-item-meta">
              {formatBrowserFileDate(effectiveItem.modifiedTime)}
            </span>
            <span className="tb-file-browser-item-size">
              {effectiveItem.isFolder
                ? ""
                : formatBrowserFileSize(effectiveItem.size)}
            </span>
          </>
        )}
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
            <div className="tb-file-browser-empty">
              {workspaceFolderError}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
