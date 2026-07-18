import type { MouseEvent } from "react";
import type { RunnerChatOption } from "./agent-options.js";
import { getBrowserFileType } from "./attachment-utils.js";
import type { RunnerFileBrowserSource } from "./file-browser-source.js";
import {
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconLoader2,
  IconMusic,
  IconNotion,
  IconVideo,
} from "./icons.js";
import {
  fileItemsForParent,
  formatBrowserFileDate,
  formatBrowserFileSize,
  type RunnerChatFileNode,
} from "./workspace-files.js";

const RUNNER_FOLDER_ICON_URL = new URL(
  "../../platform-ui/components/thread-components/assets/folder.png",
  import.meta.url,
).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL(
  "../../platform-ui/components/thread-components/assets/txtfile.png",
  import.meta.url,
).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL(
  "../../platform-ui/components/thread-components/assets/imgicon.webp",
  import.meta.url,
).toString();

export function renderRunnerBrowserFileIcon(
  file: RunnerChatFileNode,
  className: string,
) {
  if (file.isFolder) {
    return (
      <img
        src={RUNNER_FOLDER_ICON_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`${className} tb-file-browser-icon-asset`}
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
  if (fileType === "image") {
    return (
      <img
        src={RUNNER_IMAGE_FILE_ICON_URL}
        alt=""
        aria-hidden="true"
        draggable={false}
        className={`${className} tb-file-browser-icon-asset`}
      />
    );
  }
  if (fileType === "video") {
    return (
      <IconVideo
        className={`${className} tb-file-browser-item-icon-video`}
      />
    );
  }
  if (fileType === "audio") {
    return (
      <IconMusic
        className={`${className} tb-file-browser-item-icon-audio`}
      />
    );
  }
  return (
    <img
      src={RUNNER_TEXT_FILE_ICON_URL}
      alt=""
      aria-hidden="true"
      draggable={false}
      className={`${className} tb-file-browser-icon-asset`}
    />
  );
}

export interface RunnerFileBrowserItemProps {
  allItems: RunnerChatFileNode[];
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
  workspaceLoadingFolderIds: string[];
}

export function RunnerFileBrowserItem(
  props: RunnerFileBrowserItemProps,
) {
  const {
    allItems,
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
          <button
            type="button"
            className={`tb-file-browser-check ${isSelected ? "selected" : ""}`}
            aria-label={isSelected ? "Deselect file" : "Select file"}
            onClick={(event) => {
              event.stopPropagation();
              onItemClick(effectiveItem);
            }}
          >
            {isSelected ? (
              <IconCheck className="tb-file-browser-check-icon" />
            ) : null}
          </button>
        )}
        {showGithubFolderCheckbox ? (
          <button
            type="button"
            className={`tb-file-browser-check ${isSelected ? "selected" : ""}`}
            aria-label={isSelected ? "Deselect folder" : "Select folder"}
            onClick={(event) => {
              event.stopPropagation();
              onToggleGithubSelection(effectiveItemId);
            }}
          >
            {isSelected ? (
              <IconCheck className="tb-file-browser-check-icon" />
            ) : null}
          </button>
        ) : null}
        {renderRunnerBrowserFileIcon(
          effectiveItem,
          "tb-file-browser-item-icon",
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
