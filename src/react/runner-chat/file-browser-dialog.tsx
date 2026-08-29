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
import { PlatformSelector } from "../../platform-ui/components/ui/selector/index.js";
import { getBrowserFileType } from "./attachment-utils.js";
import {
  IconAtlassian,
  IconFolderPlus,
  IconGithub,
  IconGoogleDrive,
  IconLoader2,
  IconNotion,
  IconOneDrive,
} from "./icons.js";
import type { RunnerChatConnectorAccount } from "./public-types.js";
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
  | "github"
  | "atlassian";

type RunnerFileBrowserIntegrationSource = Exclude<RunnerFileBrowserSource, "workspace">;

interface RunnerFileBrowserConnection {
  connected: boolean;
  accounts?: RunnerChatConnectorAccount[];
  selectedAccountId?: string;
  onAccountChange?: (accountId: string) => void;
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
  /** Narrows a shared provider catalog to the product being configured. */
  resourceScope?: "jira" | "confluence";
  /** Keeps the shared explorer chrome while allowing scoped flows to omit source navigation. */
  showSourceSidebar?: boolean;
  /** Keeps scoped explorer flows focused by omitting the file-type filter strip. */
  showFilterTabs?: boolean;
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
  /** Optional scoped action area rendered at the bottom of the resource list. */
  listFooter?: ReactNode;
  previewItem: RunnerChatFileNode | null;
  previewContent: string | null;
  previewKind: "image" | "video" | "text" | null;
  isPreviewLoading: boolean;
  renderPreviewIcon: (item: RunnerChatFileNode) => ReactNode;
  selectedItemCount: number;
  selectedItemLabel: string;
  /** Allows a scoped Manage flow to persist removal of its final selected resource. */
  allowEmptySelection?: boolean;
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
  atlassian: "Atlassian",
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
  if (source === "atlassian") return <IconAtlassian className={className} />;
  return <IconGithub className={className} />;
}

function getFileBrowserAuthCopy(source: RunnerFileBrowserIntegrationSource): string {
  if (source === "google-drive") return "Connect your Google Drive to browse and attach files.";
  if (source === "notion") return "Connect your Notion workspace to browse and select databases.";
  if (source === "one-drive") return "Connect your OneDrive to browse and attach files.";
  if (source === "atlassian") return "Connect Atlassian to select the Jira projects and Confluence spaces available to this project.";
  return "Connect your GitHub to browse and attach repository files.";
}

const DEFAULT_ACCOUNT_VALUE = "__default__";

function normalizeFileBrowserAccounts(
  connection: RunnerFileBrowserConnection | null,
  sourceLabel: string,
): RunnerChatConnectorAccount[] {
  if (!connection?.connected) return [];
  const accounts = (Array.isArray(connection.accounts) ? connection.accounts : [])
    .map((account) => ({
      ...account,
      id: String(account?.id || "").trim(),
      name: String(account?.name || account?.identity || "Connected account").trim(),
      identity: String(account?.identity || account?.name || "Connected").trim(),
    }))
    .filter((account) => account.id && account.name);
  if (accounts.length > 0) {
    return accounts.slice().sort((left, right) => {
      if (Boolean(left.isDefault) !== Boolean(right.isDefault)) {
        return left.isDefault ? -1 : 1;
      }
      return left.name.localeCompare(right.name);
    });
  }
  return [{
    id: DEFAULT_ACCOUNT_VALUE,
    name: `${sourceLabel} account`,
    identity: "Default account",
    isDefault: true,
  }];
}

export function RunnerFileBrowserDialog({
  open,
  apiKeyPromptOpen,
  source,
  resourceScope,
  showSourceSidebar = true,
  showFilterTabs = true,
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
  listFooter,
  previewItem,
  previewContent,
  previewKind,
  isPreviewLoading,
  renderPreviewIcon,
  selectedItemCount,
  selectedItemLabel,
  allowEmptySelection = false,
  isAttaching,
  onAttach,
  onPreviewClose,
  onClose,
  onApiKeyPromptClose,
}: RunnerFileBrowserDialogProps) {
  if (typeof document === "undefined") return null;

  const selectedConnection = source === "workspace" ? null : connections[source];
  const sourceLabel = source === "workspace" ? "Workspace" : SOURCE_LABELS[source];
  const accountOptions = normalizeFileBrowserAccounts(selectedConnection, sourceLabel);
  const selectedAccountId = selectedConnection?.selectedAccountId;
  const selectedAccount = accountOptions.find((account) => account.id === selectedAccountId)
    || accountOptions.find((account) => account.isDefault)
    || accountOptions[0]
    || null;
  const accountSelector = selectedConnection && accountOptions.length > 0 ? (
    <PlatformSelector
      value={selectedAccount?.id || DEFAULT_ACCOUNT_VALUE}
      options={accountOptions.map((account) => ({
        value: account.id,
        label: account.identity || account.name,
        description:
          account.name && account.name !== (account.identity || account.name)
            ? account.name
            : account.isDefault
              ? "Default account"
              : undefined,
        disabled: account.disabled,
        title: account.name,
      }))}
      ariaLabel={`Select ${sourceLabel} account`}
      popupAriaLabel={`${sourceLabel} accounts`}
      triggerClassName="tb-file-browser-account-selector-trigger"
      popupClassName="tb-file-browser-account-selector-popup"
      onValueChange={(accountId) => selectedConnection.onAccountChange?.(
        accountId === DEFAULT_ACCOUNT_VALUE ? "" : accountId,
      )}
    />
  ) : null;
  const headerBreadcrumbs = accountSelector
    ? path.slice(1).map((crumb, index) => ({
        id: `${crumb.id || "root"}:${index + 1}`,
        label: crumb.name,
        onSelect: () => onBreadcrumbSelect(index + 1),
      }))
    : path.map((crumb, index) => ({
        id: `${crumb.id || "root"}:${index}`,
        label: crumb.name,
        onSelect: () => onBreadcrumbSelect(index),
      }));
  const usesScopedResources = source === "notion" || source === "atlassian";
  const actionVerb = usesScopedResources ? "Use" : "Attach";
  const defaultSelectionLabel = source === "notion"
    ? "Database"
    : source === "atlassian"
      ? resourceScope === "jira"
        ? "Projects"
        : resourceScope === "confluence"
          ? "Spaces"
          : "Resources"
      : "Files";
  const filterContextKey = `${source}:${selectedEnvironmentId || ""}:${path
    .map((entry) => `${entry.id || "root"}:${entry.name}`)
    .join("/")}`;
  const authenticatedIntegrationSources = (
    ["google-drive", "notion", "one-drive", "github", "atlassian"] as const
  ).filter((integrationSource) => connections[integrationSource].connected);
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
      items: authenticatedIntegrationSources.map((integrationSource) => ({
        id: integrationSource,
        label: SOURCE_LABELS[integrationSource],
        icon: (
          <RunnerFileBrowserSourceIcon
            source={integrationSource}
            className="tb-file-browser-source-brand-icon"
          />
        ),
        active: source === integrationSource,
        onSelect: () => onSourceChange(integrationSource),
      })),
    },
  ];
  const requiresAtlassianReauthorization = source === "atlassian"
    && typeof error === "string"
    && error.toLowerCase().includes("atlassian")
    && (
      error.toLowerCase().includes("permission")
      || error.toLowerCase().includes("authorization")
      || error.toLowerCase().includes("reconnect")
    );
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
  ) : requiresAtlassianReauthorization ? (
    <div className="tb-file-browser-auth-screen">
      <div className="tb-file-browser-auth-card">
        <div className="tb-file-browser-auth-icon-wrap">
          <IconAtlassian className="tb-file-browser-auth-icon" />
        </div>
        <h3 className="tb-file-browser-auth-title">Update Atlassian permissions</h3>
        <p className="tb-file-browser-auth-copy">{error}</p>
        <PlatformPrimaryButton type="button" onClick={selectedConnection?.onConnect}>
          Update permissions
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
                showSidebar={showSourceSidebar}
                showFilterTabs={showFilterTabs}
                backdropClassName="tb-file-browser-scrim"
                className="tb-file-browser-modal"
                onClose={onClose}
                closeButtonLabel="Close file browser"
                sourceGroups={sourceGroups}
                breadcrumbs={headerBreadcrumbs}
                searchQuery={searchQuery}
                onSearchQueryChange={onSearchQueryChange}
                searchPlaceholder={source === "notion"
                  ? "Search Databases"
                  : source === "atlassian"
                    ? resourceScope === "jira"
                      ? "Search Jira projects"
                      : resourceScope === "confluence"
                        ? "Search Confluence spaces"
                        : "Search Jira and Confluence"
                    : "Search Files"}
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
                headerTitle={accountSelector}
                headerActions={toolbarActions}
                filterContextKey={filterContextKey}
                items={items}
                renderItem={renderItem}
                listFooter={listFooter}
                getItemKind={(item) => {
                  if (item.isFolder) return "folder";
                  const kind = getBrowserFileType(item.mimeType, item.name);
                  if (kind === "image" || kind === "pdf") return kind;
                  return "file";
                }}
                getItemTimestamp={(item) => item.modifiedTime || item.createdTime}
                loading={loading}
                loadingMessage={`Loading ${sourceLabel} ${
                  source === "notion"
                    ? "databases"
                    : source === "atlassian"
                      ? resourceScope === "jira"
                        ? "projects"
                        : resourceScope === "confluence"
                          ? "spaces"
                          : "resources"
                      : "files"
                }...`}
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
                            : source === "atlassian"
                              ? resourceScope === "jira"
                                ? "No Jira projects found"
                                : resourceScope === "confluence"
                                  ? "No Confluence spaces found"
                                  : "No Jira projects or Confluence spaces found"
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
                confirmDisabled={(!allowEmptySelection && selectedItemCount === 0) || isAttaching}
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
