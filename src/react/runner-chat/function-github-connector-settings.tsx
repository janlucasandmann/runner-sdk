import { Check, GitBranch, Plus } from "../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useState } from "react";
import {
  PlatformConnectorPreviewCard,
  PlatformConnectorSettingsModal,
} from "../../platform-ui/components/composite/connector-settings/index.js";
import { PlatformEmptyState } from "../../platform-ui/components/composite/empty-state/index.js";
import type { PlatformGitHubAutomationAgentOption } from "../../platform-ui/components/composite/github-automations/index.js";
import { disconnectPlatformResourceSourceControl } from "../../platform-ui/components/composite/resource-source-control/index.js";
import { PlatformSecondaryButton } from "../../platform-ui/components/ui/button/index.js";
import { RunnerFileBrowserDialog } from "./file-browser-dialog.js";
import { IconGithub, IconGitlab } from "./icons.js";
import { RunnerResourceGithubRepositorySettings } from "./project-github-repository-settings.js";
import type { RunnerChatGithubConfig } from "./public-types.js";
import type { RunnerChatFileNode } from "./workspace-files.js";

export interface RunnerSourceGithubRepository {
  id?: string;
  name?: string;
  repoFullName: string;
  ref?: string;
  accountId?: string;
  branchPrefix?: string;
  createPullRequests?: boolean;
  forcePushCommits?: boolean;
}

export type RunnerSourceGithubResourceKind =
  | "function"
  | "web_app"
  | "skill"
  | "agent"
  | "computer";

interface RunnerSourceGithubConnectorSettingsBaseProps {
  repository?: RunnerSourceGithubRepository | null;
  github?: RunnerChatGithubConfig | null;
  apiBaseUrl?: string;
  requestHeaders?: Record<string, string> | null;
  automationAgentOptions?: readonly PlatformGitHubAutomationAgentOption[];
  automationEnvironmentId?: string;
  disabled?: boolean;
  onCreateRepository?: (input: {
    name: string;
    accountId?: string;
  }) => Promise<RunnerSourceGithubRepository>;
  onRepositoryChange: (repository: RunnerSourceGithubRepository | null) => void | Promise<void>;
  onViewAllConnectors?: () => void;
}

export interface RunnerSourceGithubConnectorSettingsProps
  extends RunnerSourceGithubConnectorSettingsBaseProps {
  resourceId: string;
  resourceKind: RunnerSourceGithubResourceKind;
  resourceName?: string;
}

export interface RunnerFunctionGithubConnectorSettingsProps
  extends RunnerSourceGithubConnectorSettingsBaseProps {
  functionId: string;
  functionName?: string;
}

export type RunnerFunctionGithubRepository = RunnerSourceGithubRepository;

const EMPTY_CONNECTION = { connected: false } as const;
type RunnerSourceRepositoryProvider = "github" | "gitlab";

type RunnerConnectorNavigationGlobal = typeof globalThis & {
  computerAgentsOpenConnectors?: () => void;
};

function normalizeRepositoryName(item: RunnerChatFileNode): string {
  return String(item.repoFullName || item.name || "").trim();
}

export function RunnerSourceGithubConnectorSettings({
  resourceId,
  resourceKind,
  resourceName,
  repository,
  github,
  apiBaseUrl,
  requestHeaders,
  automationAgentOptions,
  automationEnvironmentId,
  disabled = false,
  onCreateRepository,
  onRepositoryChange,
  onViewAllConnectors,
}: RunnerSourceGithubConnectorSettingsProps) {
  const resourceLabel = resourceKind === "web_app"
    ? "Web App"
    : resourceKind === "skill"
      ? "Skill"
      : resourceKind === "agent"
        ? "Agent"
        : resourceKind === "computer"
          ? "Computer"
          : "Function";
  const exactRevisionAction = resourceKind === "function" || resourceKind === "web_app"
    ? "deployments"
    : "updates";
  const automationScopeType = ["function", "web_app", "skill"].includes(resourceKind)
    ? resourceKind as "function" | "web_app" | "skill"
    : undefined;
  const automationKinds = resourceKind === "function"
    ? (["security_scan", "pull_request_review", "deploy_function"] as const)
    : resourceKind === "web_app"
      ? (["security_scan", "pull_request_review", "deploy_web_app"] as const)
      : resourceKind === "skill"
        ? (["security_scan", "pull_request_review"] as const)
        : undefined;
  const connectorTitleId = `source-connectors-title-${resourceKind}-${resourceId}`;
  const defaultAccountId = String(
    repository?.accountId ||
      github?.selectedAccountId ||
      github?.accounts?.find((account) => account.isDefault)?.id ||
      github?.accounts?.[0]?.id ||
      "",
  ).trim();
  const [open, setOpen] = useState(false);
  const [explorerProvider, setExplorerProvider] = useState<RunnerSourceRepositoryProvider>("github");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeRepositoryId, setActiveRepositoryId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [items, setItems] = useState<RunnerChatFileNode[]>([]);
  const [selectedRepositoryName, setSelectedRepositoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (!open) return;
    if (explorerProvider !== "github") {
      setItems([]);
      setLoading(false);
      setError("");
      return;
    }
    if (!github?.connected || !github.fetchItems) return;
    let active = true;
    setLoading(true);
    setError("");
    void github
      .fetchItems("root", accountId ? { accountId } : undefined)
      .then((nextItems) => {
        if (!active) return;
        setItems(
          (Array.isArray(nextItems) ? nextItems : []).filter((item) =>
            Boolean(item?.isFolder && normalizeRepositoryName(item)),
          ),
        );
      })
      .catch((loadError) => {
        if (!active) return;
        setItems([]);
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load GitHub repositories.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accountId, explorerProvider, github?.connected, github?.fetchItems, open]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.name} ${normalizeRepositoryName(item)}`.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  function openManager(provider: RunnerSourceRepositoryProvider) {
    setExplorerProvider(provider);
    setSelectedRepositoryName(String(repository?.repoFullName || "").trim());
    setAccountId(String(repository?.accountId || defaultAccountId).trim());
    setSearchQuery("");
    setError("");
    setCreateError("");
    setSettingsOpen(false);
    setOpen(true);
  }

  async function disconnectRepository() {
    try {
      await disconnectPlatformResourceSourceControl({
        apiBaseUrl,
        requestHeaders,
        resourceKind,
        resourceId,
      });
      await onRepositoryChange(null);
    } catch (disconnectError) {
      const message = disconnectError instanceof Error
        ? disconnectError.message
        : `Failed to disconnect the ${resourceLabel} repository.`;
      setError(message);
      throw disconnectError;
    }
  }

  async function createRepositoryForResource() {
    if (!onCreateRepository) return;
    setCreating(true);
    setCreateError("");
    try {
      const createdRepository = await onCreateRepository({
        name: String(
          resourceName ||
            `${resourceKind === "web_app" ? "web-app" : resourceKind}-${resourceId.slice(-8)}`,
        ).trim(),
        accountId: accountId || undefined,
      });
      await onRepositoryChange({
        ...createdRepository,
        accountId,
        ref: createdRepository.ref || "main",
        branchPrefix: createdRepository.branchPrefix ?? "computer-agents/",
        createPullRequests: createdRepository.createPullRequests !== false,
        forcePushCommits: createdRepository.forcePushCommits === true,
      });
      setOpen(false);
    } catch (createRepositoryError) {
      setCreateError(
        createRepositoryError instanceof Error
          ? createRepositoryError.message
          : `Failed to create the ${resourceLabel} repository.`,
      );
    } finally {
      setCreating(false);
    }
  }

  async function applySelection() {
    setSaving(true);
    setError("");
    try {
      const selected = items.find(
        (item) =>
          normalizeRepositoryName(item).toLowerCase() === selectedRepositoryName.toLowerCase(),
      );
      if (!selectedRepositoryName) {
        await disconnectRepository();
      } else if (!selected) {
        if (repository?.repoFullName?.toLowerCase() !== selectedRepositoryName.toLowerCase()) {
          throw new Error("Wait for the selected GitHub repository to finish loading.");
        }
        await onRepositoryChange({ ...repository, accountId });
      } else {
        const isCurrentRepository =
          repository?.repoFullName?.toLowerCase() === selectedRepositoryName.toLowerCase();
        await onRepositoryChange({
          id: selected.id,
          name: selected.name,
          repoFullName: selectedRepositoryName,
          ref: selected.ref || (isCurrentRepository ? repository?.ref : "") || "main",
          accountId,
          branchPrefix: isCurrentRepository ? repository?.branchPrefix : "computer-agents/",
          createPullRequests: isCurrentRepository ? repository?.createPullRequests !== false : true,
          forcePushCommits: isCurrentRepository ? repository?.forcePushCommits === true : false,
        });
      }
      setOpen(false);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : `Failed to update the ${resourceLabel} connector.`,
      );
    } finally {
      setSaving(false);
    }
  }

  const githubConnection = {
    connected: Boolean(github?.connected),
    accounts: github?.accounts,
    selectedAccountId: accountId,
    onAccountChange: (nextAccountId: string) => {
      setAccountId(nextAccountId);
      github?.onAccountChange?.(nextAccountId);
    },
    onConnect: github?.onConnect,
    onDisconnect: github?.onDisconnect,
  };

  function openConnectorSettings(connectorId: "github" | "gitlab") {
    setActiveRepositoryId(
      connectorId === "github" && repository?.repoFullName
        ? `github:${repository.repoFullName}`
        : "",
    );
    setSettingsOpen(true);
  }

  function viewAllConnectors() {
    setOpen(false);
    if (onViewAllConnectors) {
      setSettingsOpen(false);
      onViewAllConnectors();
      return;
    }
    const openConnectors = (globalThis as RunnerConnectorNavigationGlobal)
      .computerAgentsOpenConnectors;
    if (typeof openConnectors === "function") {
      setSettingsOpen(false);
      openConnectors();
      return;
    }
    setActiveRepositoryId(
      repository?.repoFullName ? `github:${repository.repoFullName}` : "",
    );
    setSettingsOpen(true);
  }

  return (
    <section
      className="playground-source-connector-settings"
      aria-labelledby={connectorTitleId}
      data-source-connector-kind={resourceKind}
    >
      <div className="playground-source-connector-settings__heading">
        <h2 id={connectorTitleId}>Connectors</h2>
        <p>
          Synchronize this {resourceLabel} with a GitHub or GitLab repository and automate exact-revision {exactRevisionAction}.
        </p>
      </div>

      <div className="playground-source-connector-settings__previews">
        <PlatformConnectorPreviewCard
          className="playground-source-connector-settings__preview"
          connectorName="GitHub"
          title="GitHub"
          description={`Automate exact-revision ${exactRevisionAction}.`}
          icon={<IconGithub />}
          backgroundImageSrc="/img/bg/blur.webp"
          activeConnectionCount={repository?.repoFullName ? 1 : 0}
          aria-label="Open GitHub connector settings"
          disabled={disabled}
          onOpenSettings={() => repository?.repoFullName
            ? openConnectorSettings("github")
            : openManager("github")}
          onViewAllConnectors={viewAllConnectors}
        />
        <PlatformConnectorPreviewCard
          className="playground-source-connector-settings__preview"
          connectorName="GitLab"
          title="GitLab"
          description={`Automate exact-revision ${exactRevisionAction}.`}
          icon={<IconGitlab />}
          backgroundImageSrc="/img/bg/blur3.webp"
          activeConnectionCount={0}
          aria-label="Open GitLab connector settings"
          disabled={disabled}
          onOpenSettings={() => openManager("gitlab")}
          onViewAllConnectors={viewAllConnectors}
        />
      </div>

      <PlatformConnectorSettingsModal
        open={settingsOpen}
        title="Connectors"
        ariaLabel={`${resourceLabel} connector settings`}
        activeItemId={activeRepositoryId}
        onActiveItemChange={setActiveRepositoryId}
        onClose={() => setSettingsOpen(false)}
        primaryAction={{
          label: "Add another repo",
          disabled: disabled || saving,
          options: [
            {
              id: "github",
              label: "GitHub",
              icon: <IconGithub />,
              onSelect: () => openManager("github"),
            },
            {
              id: "gitlab",
              label: "GitLab",
              icon: <IconGitlab />,
              onSelect: () => openManager("gitlab"),
            },
          ],
        }}
        emptyState={(
          <div className="playground-source-connector-settings__modal-empty">
            <PlatformEmptyState
              icon={GitBranch}
              title="No repositories connected"
              description={`Add a GitHub or GitLab repository to synchronize this ${resourceLabel} and configure exact-revision ${exactRevisionAction}.`}
            />
            {error && !open ? (
              <p className="playground-source-connector-settings__error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        )}
        groups={[
          {
            id: "github",
            label: "GitHub",
            icon: <IconGithub />,
            items: repository?.repoFullName ? [
              {
                id: `github:${repository.repoFullName}`,
                label: repository.repoFullName,
                onDisconnect: disconnectRepository,
                content: (
                  <div className="platform-connector-settings-modal__repository-content">
                    <RunnerResourceGithubRepositorySettings
                      accountId={repository.accountId || accountId || undefined}
                      repoFullName={repository.repoFullName}
                      refName={repository.ref || "main"}
                      branchPrefix={repository.branchPrefix}
                      createPullRequests={repository.createPullRequests}
                      forcePushCommits={repository.forcePushCommits}
                      apiBaseUrl={apiBaseUrl}
                      requestHeaders={requestHeaders}
                      automationScopeType={automationScopeType}
                      sourceControlResourceKind={resourceKind}
                      sourceControlResourceId={resourceId}
                      automationScopeId={resourceId}
                      automationKinds={automationKinds}
                      automationEnvironmentId={automationEnvironmentId}
                      automationAgentOptions={automationAgentOptions}
                      fetchBranches={github?.fetchBranches}
                      onChange={(patch) => onRepositoryChange({ ...repository, ...patch })}
                      onDisconnect={disconnectRepository}
                    />
                    {error && !open ? (
                      <p className="playground-source-connector-settings__error" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                ),
              },
            ] : [],
          },
          {
            id: "gitlab",
            label: "GitLab",
            icon: <IconGitlab />,
            items: [],
          },
        ]}
      />

      <RunnerFileBrowserDialog
        open={open}
        apiKeyPromptOpen={false}
        source={explorerProvider}
        showSourceSidebar={false}
        showFilterTabs={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        environments={[]}
        selectedEnvironmentId={null}
        onEnvironmentSelect={() => undefined}
        onSourceChange={() => undefined}
        connections={{
          github: githubConnection,
          gitlab: {
            connected: false,
            onConnect: viewAllConnectors,
          },
          notion: EMPTY_CONNECTION,
          atlassian: EMPTY_CONNECTION,
          "google-drive": EMPTY_CONNECTION,
          "one-drive": EMPTY_CONNECTION,
        }}
        authSource={explorerProvider === "github"
          ? github?.connected ? null : "github"
          : "gitlab"}
        path={[{ id: null, name: explorerProvider === "github" ? "GitHub" : "GitLab" }]}
        historyIndex={0}
        historyLength={1}
        onBack={() => undefined}
        onForward={() => undefined}
        onBreadcrumbSelect={() => undefined}
        googleDriveItemCount={0}
        isGoogleDrivePickerLoading={false}
        loading={loading}
        error={error || null}
        showGoogleDrivePickerPrompt={false}
        items={explorerProvider === "github" ? filteredItems : []}
        renderItem={(item) => {
          const repoFullName = normalizeRepositoryName(item);
          const selected = repoFullName.toLowerCase() === selectedRepositoryName.toLowerCase();
          return (
            <button
              type="button"
              aria-pressed={selected}
              key={item.id}
              className={`tb-file-browser-item${selected ? " selected" : ""}`}
              onClick={() => setSelectedRepositoryName(selected ? "" : repoFullName)}
            >
              <span
                className={`tb-file-browser-check${selected ? " selected" : ""}`}
                aria-hidden="true"
              >
                {selected ? (
                  <Check className="tb-file-browser-check-icon" strokeWidth={2.2} />
                ) : null}
              </span>
              {explorerProvider === "github" ? (
                <IconGithub className="tb-file-browser-item-icon tb-file-browser-source-brand-icon" />
              ) : (
                <IconGitlab className="tb-file-browser-item-icon tb-file-browser-source-brand-icon" />
              )}
              <span className="tb-file-browser-item-name" title={repoFullName}>
                {item.name}
              </span>
              <span className="tb-file-browser-item-meta">{repoFullName}</span>
            </button>
          );
        }}
        listFooter={
          explorerProvider === "github" && onCreateRepository && github?.connected ? (
            <div className="playground-source-connector-settings__create-repository">
              <PlatformSecondaryButton
                type="button"
                size="small"
                className="playground-source-connector-settings__create-repository-button"
                disabled={disabled || loading || saving || creating}
                onClick={() => void createRepositoryForResource()}
              >
                {creating ? (
                  <span
                    className="runner-spinner playground-source-connector-settings__create-repository-spinner"
                    aria-hidden="true"
                  />
                ) : (
                  <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
                )}
                <span>
                  {creating
                    ? "Creating repository..."
                    : `Create repository for this ${resourceLabel}`}
                </span>
              </PlatformSecondaryButton>
              {createError ? (
                <span
                  className="playground-source-connector-settings__create-repository-error"
                  role="alert"
                >
                  {createError}
                </span>
              ) : null}
            </div>
          ) : null
        }
        previewItem={null}
        previewContent={null}
        previewKind={null}
        isPreviewLoading={false}
        renderPreviewIcon={() => null}
        selectedItemCount={explorerProvider === "github" && selectedRepositoryName ? 1 : 0}
        selectedItemLabel="Repository"
        allowEmptySelection={explorerProvider === "github" && Boolean(repository?.repoFullName)}
        isAttaching={saving}
        onAttach={explorerProvider === "github" ? applySelection : () => undefined}
        onPreviewClose={() => undefined}
        onClose={() => setOpen(false)}
        onApiKeyPromptClose={() => setOpen(false)}
      />
    </section>
  );
}

export function RunnerFunctionGithubConnectorSettings({
  functionId,
  functionName,
  ...props
}: RunnerFunctionGithubConnectorSettingsProps) {
  return (
    <RunnerSourceGithubConnectorSettings
      {...props}
      resourceId={functionId}
      resourceKind="function"
      resourceName={functionName}
    />
  );
}
