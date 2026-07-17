import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  PlatformModal,
} from "../../platform-ui/components/composite/modal/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";
import {
  IconChevronLeft,
  IconChevronRight,
  IconCloud,
  IconFolderPlus,
  IconGithub,
  IconGoogleDrive,
  IconLoader2,
  IconLogout,
  IconNotion,
  IconOneDrive,
  IconSearch,
  IconX,
} from "./icons.js";
import {
  formatBrowserFileDate,
  formatBrowserFileSize,
  type RunnerChatFileNode,
} from "./workspace-files.js";
import {
  getBrowserFileType,
} from "./attachment-utils.js";

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
  source: RunnerFileBrowserSource;
  className: string;
}) {
  if (source === "google-drive") return <IconGoogleDrive className={className} />;
  if (source === "notion") return <IconNotion className={className} />;
  if (source === "one-drive") return <IconOneDrive className={className} />;
  if (source === "github") return <IconGithub className={className} />;
  return <IconCloud className={className} />;
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
  onClose,
  onApiKeyPromptClose,
}: RunnerFileBrowserDialogProps) {
  if (typeof document === "undefined") {
    return null;
  }

  const selectedConnection = source === "workspace" ? null : connections[source];
  const sourceLabel = source === "workspace" ? "Workspace" : SOURCE_LABELS[source];
  const actionVerb = source === "notion" ? "Use" : "Attach";
  const defaultSelectionLabel = source === "notion" ? "Database" : "Files";

  return (
    <>
      {open
        ? createPortal(
            <div className="tb-runner-chat">
              <PlatformModal
                open
                visible
                portal={false}
                size="full"
                title="Attach files"
                backdropClassName="tb-file-browser-scrim"
                className="tb-file-browser-modal"
                onClose={onClose}
                closeButtonLabel="Close file browser"
              >
                <div className="tb-file-browser-body">
                  <div className="tb-file-browser-sidebar">
                    <div className="tb-file-browser-search-wrap">
                      <div className="tb-file-browser-search">
                        <IconSearch className="tb-file-browser-search-icon" />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={searchQuery}
                          onChange={(event) => onSearchQueryChange(event.target.value)}
                          className="tb-file-browser-search-input"
                        />
                        {searchQuery ? (
                          <button
                            type="button"
                            className="tb-file-browser-search-clear"
                            onClick={() => onSearchQueryChange("")}
                          >
                            <IconX className="tb-file-browser-search-clear-icon" />
                          </button>
                        ) : null}
                      </div>
                    </div>

                    {environments.length > 0 ? (
                      <div className="tb-file-browser-sidebar-section tb-file-browser-sidebar-section-environments">
                        <div className="tb-file-browser-sidebar-title">Environments</div>
                        <div className="tb-file-browser-sidebar-list tb-file-browser-sidebar-list-environments">
                          {environments.map((environment) => (
                            <button
                              key={environment.id}
                              type="button"
                              className={`tb-file-browser-source-row ${
                                source === "workspace" && selectedEnvironmentId === environment.id
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => onEnvironmentSelect(environment.id)}
                            >
                              <IconCloud className="tb-file-browser-source-icon" />
                              <span className="tb-file-browser-source-label">{environment.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="tb-file-browser-sidebar-section">
                      <div className="tb-file-browser-sidebar-title">Integrations</div>
                      <div className="tb-file-browser-sidebar-list">
                        {(["google-drive", "notion", "one-drive", "github"] as const).map(
                          (integrationSource) => (
                            <button
                              key={integrationSource}
                              type="button"
                              className={`tb-file-browser-source-row ${
                                source === integrationSource ? "active" : ""
                              }`}
                              onClick={() => onSourceChange(integrationSource)}
                            >
                              <RunnerFileBrowserSourceIcon
                                source={integrationSource}
                                className="tb-file-browser-source-brand-icon"
                              />
                              <span className="tb-file-browser-source-label">
                                {SOURCE_LABELS[integrationSource]}
                              </span>
                              {!connections[integrationSource].connected ? (
                                <span className="tb-file-browser-source-note">Connect</span>
                              ) : null}
                            </button>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="tb-file-browser-main">
                    {authSource ? (
                      <div className="tb-file-browser-auth-screen">
                        <div className="tb-file-browser-auth-card">
                          <div className="tb-file-browser-auth-icon-wrap">
                            <RunnerFileBrowserSourceIcon
                              source={authSource}
                              className="tb-file-browser-auth-icon"
                            />
                          </div>
                          <h3 className="tb-file-browser-auth-title">
                            Connect to {SOURCE_LABELS[authSource]}
                          </h3>
                          <p className="tb-file-browser-auth-copy">
                            {getFileBrowserAuthCopy(authSource)}
                          </p>
                          <button
                            type="button"
                            className="tb-file-browser-auth-button"
                            onClick={connections[authSource].onConnect}
                          >
                            Connect {SOURCE_LABELS[authSource]}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="tb-file-browser-header">
                          <button
                            type="button"
                            className="tb-file-browser-nav-button"
                            onClick={onBack}
                            disabled={historyIndex <= 0}
                          >
                            <IconChevronLeft className="tb-file-browser-nav-icon" />
                          </button>
                          <button
                            type="button"
                            className="tb-file-browser-nav-button"
                            onClick={onForward}
                            disabled={historyIndex >= historyLength - 1}
                          >
                            <IconChevronRight className="tb-file-browser-nav-icon" />
                          </button>
                          <div className="tb-file-browser-header-icon">
                            <RunnerFileBrowserSourceIcon
                              source={source}
                              className={
                                source === "workspace"
                                  ? "tb-file-browser-source-icon"
                                  : "tb-file-browser-source-brand-icon"
                              }
                            />
                          </div>
                          <div className="tb-file-browser-breadcrumbs">
                            {path.map((crumb, index) => (
                              <span
                                key={crumb.id || crumb.name}
                                className="tb-file-browser-breadcrumb-chip"
                              >
                                {index > 0 ? (
                                  <span className="tb-file-browser-breadcrumb-sep">/</span>
                                ) : null}
                                <button
                                  type="button"
                                  className={`tb-file-browser-breadcrumb ${
                                    index === path.length - 1 ? "active" : ""
                                  }`}
                                  onClick={() => onBreadcrumbSelect(index)}
                                >
                                  {crumb.name}
                                </button>
                              </span>
                            ))}
                          </div>
                          {source === "google-drive"
                          && googleDriveItemCount > 0
                          && onManageGoogleDriveAccess ? (
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
                        </div>

                        <div className="tb-file-browser-list">
                          {loading ? (
                            <div className="tb-file-browser-empty">
                              Loading {sourceLabel} {source === "notion" ? "databases" : "files"}...
                            </div>
                          ) : error ? (
                            <div className="tb-file-browser-empty">{error}</div>
                          ) : showGoogleDrivePickerPrompt ? (
                            <div className="tb-file-browser-empty-state">
                              <div className="tb-file-browser-auth-icon-wrap">
                                <IconGoogleDrive className="tb-file-browser-auth-icon" />
                              </div>
                              <h3 className="tb-file-browser-auth-title">Select files to share</h3>
                              <p className="tb-file-browser-auth-copy">
                                Choose which files and folders from your Google Drive you want to
                                access in Testbase.
                              </p>
                              <button
                                type="button"
                                className="tb-file-browser-auth-button"
                                onClick={onManageGoogleDriveAccess}
                                disabled={isGoogleDrivePickerLoading}
                              >
                                {isGoogleDrivePickerLoading
                                  ? "Opening picker..."
                                  : "Select Files from Google Drive"}
                              </button>
                            </div>
                          ) : items.length === 0 ? (
                            <div className="tb-file-browser-empty">
                              {searchQuery
                                ? "No files match your search"
                                : source === "notion"
                                  ? "No Notion databases found"
                                  : "This folder is empty"}
                            </div>
                          ) : (
                            <div className="tb-file-browser-list-inner">
                              {items.map((item) => renderItem(item))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {previewItem ? (
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
                          {previewItem.isFolder
                            ? "Folder"
                            : formatBrowserFileSize(previewItem.size)}
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
                  ) : null}
                </div>

                <div className="tb-file-browser-footer">
                  <PlatformSecondaryButton
                    type="button"
                    className="tb-file-browser-footer-button tb-file-browser-footer-button-secondary"
                    onClick={onClose}
                  >
                    Cancel
                  </PlatformSecondaryButton>
                  <PlatformPrimaryButton
                    type="button"
                    className="tb-file-browser-footer-button tb-file-browser-footer-button-primary"
                    onClick={() => void onAttach()}
                    disabled={selectedItemCount === 0 || isAttaching}
                  >
                    <span className="tb-file-browser-footer-button-content">
                      {isAttaching ? (
                        <span className="runner-spinner tb-file-browser-footer-button-spinner" />
                      ) : null}
                      <span className="tb-file-browser-footer-button-label">
                        {isAttaching
                          ? "Attaching Files..."
                          : `${actionVerb} ${
                              selectedItemCount > 0
                                ? selectedItemLabel
                                : defaultSelectionLabel
                            }`}
                      </span>
                    </span>
                  </PlatformPrimaryButton>
                </div>
              </PlatformModal>
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
