import { Gitlab } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  PlatformFileExplorerBrowserModal,
  type PlatformFileExplorerSourceGroup,
} from "../../platform-ui/components/composite/file-explorer/index.js";
import { PlatformModal } from "../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";
import { getBrowserFileType } from "./attachment-utils.js";
import {
  IconFolderPlus,
  IconGithub,
  IconGoogleDrive,
  IconLoader2,
  IconLogout,
  IconNotion,
  IconOneDrive,
} from "./icons.js";
import {
  formatBrowserFileDate,
  formatBrowserFileSize,
  type RunnerChatFileNode,
} from "./workspace-files.js";

export type RunnerFileBrowserSource =
  | "workspace"
  | "google-drive"
  | "notion"
  | "one-drive"
  | "github";

type RunnerFileBrowserIntegrationSource = Exclude<RunnerFileBrowserSource, "workspace">;

interface RunnerFileBrowserConnection {
  connected: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

interface RunnerFileBrowserEnvironment {
  id: string;
  name: string;
}

export interface RunnerFileBrowserDialogProps {
  open: boolean;
  apiKeyPromptOpen: boolean;
  source: RunnerFileBrowserSource;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  environments: RunnerFileBrowserEnvironment[];
  selectedEnvironmentId: string | null;
  onEnvironmentSelect: (environmentId: string) => void;
  onSourceChange: (source: RunnerFileBrowserSource) => void;
  connections: Record<RunnerFileBrowserIntegrationSource, RunnerFileBrowserConnection>;
  authSource: RunnerFileBrowserIntegrationSource | null;
  path: Array<{ id: string | null; name: string }>;
  historyIndex: number;
  historyLength: number;
  onBack: () => void;
  onForward: () => void;
  onBreadcrumbSelect: (index: number) => void;
  googleDriveItemCount: number;
  onManageGoogleDriveAccess?: () => void;
  isGoogleDrivePickerLoading: boolean;
  loading: boolean;
  error: string | null;
  showGoogleDrivePickerPrompt: boolean;
  items: RunnerChatFileNode[];
  renderItem: (item: RunnerChatFileNode) => ReactNode;
  previewItem: RunnerChatFileNode | null;
  previewContent: string | null;
  previewKind: "image" | "video" | "text" | null;
  isPreviewLoading: boolean;
  renderPreviewIcon: (item: RunnerChatFileNode) => ReactNode;
  selectedItemCount: number;
  selectedItemLabel: string;
  isAttaching: boolean;
  onAttach: () => void | Promise<void>;
  onPreviewClose: () => void;
  onClose: () => void;
  onApiKeyPromptClose: () => void;
}

const SOURCE_LABELS: Record<RunnerFileBrowserIntegrationSource, string> = {
  "google-drive": "Google Drive",
  notion: "Notion",
  "one-drive": "OneDrive",
  github: "GitHub",
};

function RunnerFileBrowserSourceIcon({
  source,
  className,
}: {
  source: RunnerFileBrowserIntegrationSource;
  className: string;
}) {
  if (source === "google-drive") return <IconGoogleDrive className={className} />;
  if (source === "notion") return <IconNotion className={className} />;
  if (source === "one-drive") return <IconOneDrive className={className} />;
  return <IconGithub className={className} />;
}

function getFileBrowserAuthCopy(source: RunnerFileBrowserIntegrationSource): string {
  if (source === "google-drive") return "Connect your Google Drive to browse and attach files.";
  if (source === "notion") return "Connect your Notion workspace to browse and select databases.";
  if (source === "one-drive") return "Connect your OneDrive to browse and attach files.";
  return "Connect your GitHub to browse and attach repository files.";
}

export function RunnerFileBrowserDialog({
  open,
  apiKeyPromptOpen,
  source,
  searchQuery,
  onSearchQueryChange,
  environments,
  selectedEnvironmentId,
  onEnvironmentSelect,
  onSourceChange,
  connections,
  authSource,
  path,
  historyIndex,
  historyLength,
  onBack,
  onForward,
  onBreadcrumbSelect,
  googleDriveItemCount,
  onManageGoogleDriveAccess,
  isGoogleDrivePickerLoading,
  loading,
  error,
  showGoogleDrivePickerPrompt,
  items,
  renderItem,
  previewItem,
  previewContent,
  previewKind,
  isPreviewLoading,
  renderPreviewIcon,
  selectedItemCount,
  selectedItemLabel,
  isAttaching,
  onAttach,
  onPreviewClose,
  onClose,
  onApiKeyPromptClose,
}: RunnerFileBrowserDialogProps) {
  if (typeof document === "undefined") return null;

  const selectedConnection = source === "workspace" ? null : connections[source];
  const sourceLabel = source === "workspace" ? "Workspace" : SOURCE_LABELS[source];
  const actionVerb = source === "notion" ? "Use" : "Attach";
  const defaultSelectionLabel = source === "notion" ? "Database" : "Files";
  const filterContextKey = `${source}:${selectedEnvironmentId || ""}:${path
    .map((entry) => `${entry.id || "root"}:${entry.name}`)
    .join("/")}`;
  const sourceGroups: PlatformFileExplorerSourceGroup[] = [
    {
      id: "computers",
      label: null,
      items: environments.map((environment) => ({
        id: environment.id,
        label: environment.name,
        active: source === "workspace" && selectedEnvironmentId === environment.id,
        onSelect: () => onEnvironmentSelect(environment.id),
      })),
    },
    {
      id: "integrations",
      label: "Integrations",
      items: [
        ...(["google-drive", "notion", "one-drive", "github"] as const).map(
          (integrationSource) => ({
            id: integrationSource,
            label: SOURCE_LABELS[integrationSource],
            icon: (
              <RunnerFileBrowserSourceIcon
                source={integrationSource}
                className="tb-file-browser-source-brand-icon"
              />
            ),
            note: connections[integrationSource].connected ? undefined : "Connect",
            active: source === integrationSource,
            onSelect: () => onSourceChange(integrationSource),
          }),
        ),
        {
          id: "gitlab",
          label: "GitLab",
          icon: <Gitlab className="tb-file-browser-source-brand-icon" aria-hidden="true" />,
          note: "Unavailable",
          disabled: true,
        },
        {
          id: "sharepoint",
          label: "SharePoint",
          icon: (
            <img
              src="/img/plugins/sharepoint.svg"
              alt=""
              aria-hidden="true"
              className="tb-file-browser-source-brand-icon"
              draggable={false}
            />
          ),
          note: "Unavailable",
          disabled: true,
        },
      ],
    },
  ];
  const customContent = authSource ? (
    <div className="tb-file-browser-auth-screen">
      <div className="tb-file-browser-auth-card">
        <div className="tb-file-browser-auth-icon-wrap">
          <RunnerFileBrowserSourceIcon source={authSource} className="tb-file-browser-auth-icon" />
        </div>
        <h3 className="tb-file-browser-auth-title">Connect to {SOURCE_LABELS[authSource]}</h3>
        <p className="tb-file-browser-auth-copy">{getFileBrowserAuthCopy(authSource)}</p>
        <PlatformPrimaryButton type="button" onClick={connections[authSource].onConnect}>
          Connect {SOURCE_LABELS[authSource]}
        </PlatformPrimaryButton>
      </div>
    </div>
  ) : showGoogleDrivePickerPrompt ? (
    <div className="tb-file-browser-empty-state">
      <div className="tb-file-browser-auth-icon-wrap">
        <IconGoogleDrive className="tb-file-browser-auth-icon" />
      </div>
      <h3 className="tb-file-browser-auth-title">Select files to share</h3>
      <p className="tb-file-browser-auth-copy">
        Choose which files and folders from your Google Drive you want to access in Testbase.
      </p>
      <button
        type="button"
        className="tb-file-browser-auth-button"
        onClick={onManageGoogleDriveAccess}
        disabled={isGoogleDrivePickerLoading}
      >
        {isGoogleDrivePickerLoading ? "Opening picker..." : "Select Files from Google Drive"}
      </button>
    </div>
  ) : undefined;
  const preview = previewItem ? (
    <div className="tb-file-browser-preview">
      <div className="tb-file-browser-preview-header">
        <div className="tb-file-browser-preview-art">
          {isPreviewLoading ? (
            <IconLoader2 className="tb-file-browser-preview-loader" />
          ) : previewContent && previewKind === "image" ? (
            <img
              src={previewContent}
              alt={previewItem.name}
              className="tb-file-browser-preview-image"
            />
          ) : previewContent && previewKind === "video" ? (
            // biome-ignore lint/a11y/useMediaCaption: Workspace files do not provide caption tracks alongside arbitrary video previews.
            <video
              src={previewContent}
              className="tb-file-browser-preview-video"
              controls
              playsInline
              preload="metadata"
            />
          ) : previewContent && previewKind === "text" ? (
            <pre className="tb-file-browser-preview-text">{previewContent}</pre>
          ) : (
            renderPreviewIcon(previewItem)
          )}
        </div>
        <h3 className="tb-file-browser-preview-name">{previewItem.name}</h3>
        <p className="tb-file-browser-preview-subtitle">
          {previewItem.isFolder ? "Folder" : formatBrowserFileSize(previewItem.size)}
        </p>
      </div>
      <div className="tb-file-browser-preview-info">
        <div className="tb-file-browser-preview-info-title">Information</div>
        <div className="tb-file-browser-preview-info-row">
          <span>Modified</span>
          <span>{formatBrowserFileDate(previewItem.modifiedTime)}</span>
        </div>
        <div className="tb-file-browser-preview-info-row">
          <span>Created</span>
          <span>{formatBrowserFileDate(previewItem.createdTime)}</span>
        </div>
        <div className="tb-file-browser-preview-info-row">
          <span>Type</span>
          <span>
            {previewItem.isFolder
              ? "folder"
              : getBrowserFileType(previewItem.mimeType, previewItem.name)}
          </span>
        </div>
      </div>
    </div>
  ) : undefined;
  const toolbarActions = (
    <>
      {source === "google-drive" && googleDriveItemCount > 0 && onManageGoogleDriveAccess ? (
        <button
          type="button"
          className="tb-file-browser-toolbar-button"
          onClick={onManageGoogleDriveAccess}
          disabled={isGoogleDrivePickerLoading}
          title="Manage file access"
        >
          {isGoogleDrivePickerLoading ? (
            <IconLoader2 className="tb-file-browser-toolbar-icon tb-file-browser-folder-chevron-spin" />
          ) : (
            <IconFolderPlus className="tb-file-browser-toolbar-icon" />
          )}
        </button>
      ) : null}
      {selectedConnection?.onDisconnect ? (
        <button
          type="button"
          className="tb-file-browser-toolbar-button"
          onClick={selectedConnection.onDisconnect}
          title={`Disconnect ${sourceLabel}`}
        >
          <IconLogout className="tb-file-browser-toolbar-icon" />
        </button>
      ) : null}
    </>
  );

  return (
    <>
      {open
        ? createPortal(
            <div className="tb-runner-chat">
              <PlatformFileExplorerBrowserModal
                open
                visible
                portal={false}
                size="full"
                title="Attach files"
                backdropClassName="tb-file-browser-scrim"
                className="tb-file-browser-modal"
                onClose={onClose}
                closeButtonLabel="Close file browser"
                sourceGroups={sourceGroups}
                breadcrumbs={path.map((crumb, index) => ({
                  id: `${crumb.id || "root"}:${index}`,
                  label: crumb.name,
                  onSelect: () => onBreadcrumbSelect(index),
                }))}
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                searchPlaceholder={source === "notion" ? "Search Databases" : "Search Files"}
                onBack={onBack}
                onForward={onForward}
                canGoBack={historyIndex > 0}
                canGoForward={historyIndex < historyLength - 1}
                headerIcon={
                  source === "workspace" ? undefined : (
                    <RunnerFileBrowserSourceIcon
                      source={source}
                      className="tb-file-browser-source-brand-icon"
                    />
                  )
                }
                headerActions={toolbarActions}
                filterContextKey={filterContextKey}
                items={items}
                renderItem={renderItem}
                getItemKind={(item) => {
                  if (item.isFolder) return "folder";
                  const kind = getBrowserFileType(item.mimeType, item.name);
                  if (kind === "image" || kind === "pdf") return kind;
                  return "file";
                }}
                getItemTimestamp={(item) => item.modifiedTime || item.createdTime}
                loading={loading}
                loadingMessage={`Loading ${sourceLabel} ${source === "notion" ? "databases" : "files"}...`}
                error={error}
                emptyMessage={({ activeFilter, hasSearchQuery }) =>
                  hasSearchQuery
                    ? "No files match your search"
                    : activeFilter === "recent"
                      ? "No recently changed files"
                      : activeFilter === "images"
                        ? "No images in this folder"
                        : activeFilter === "pdfs"
                          ? "No PDFs in this folder"
                          : source === "notion"
                            ? "No Notion databases found"
                            : "This folder is empty"
                }
                content={customContent}
                preview={preview}
                previewTitle="Preview"
                onPreviewClose={onPreviewClose}
                confirmLabel={
                  <span className="tb-file-browser-footer-button-content">
                    {isAttaching ? (
                      <span className="runner-spinner tb-file-browser-footer-button-spinner" />
                    ) : null}
                    <span className="tb-file-browser-footer-button-label">
                      {isAttaching
                        ? "Attaching Files..."
                        : `${actionVerb} ${selectedItemCount > 0 ? selectedItemLabel : defaultSelectionLabel}`}
                    </span>
                  </span>
                }
                confirmDisabled={selectedItemCount === 0 || isAttaching}
                onCancel={onClose}
                onConfirm={onAttach}
              />
            </div>,
            document.body,
          )
        : null}

      {apiKeyPromptOpen
        ? createPortal(
            <div className="tb-runner-chat">
              <PlatformModal
                open
                visible
                portal={false}
                size="compact"
                title="API key required"
                description="Enter an API key in the playground sidebar to browse workspace files."
                backdropClassName="tb-file-browser-scrim"
                className="tb-file-browser-api-key-modal"
                onClose={onApiKeyPromptClose}
                closeButtonLabel="Close API key dialog"
              >
                <div className="tb-file-browser-api-key-footer">
                  <PlatformSecondaryButton
                    type="button"
                    className="tb-file-browser-footer-button tb-file-browser-footer-button-secondary"
                    onClick={onApiKeyPromptClose}
                  >
                    Close
                  </PlatformSecondaryButton>
                </div>
              </PlatformModal>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
