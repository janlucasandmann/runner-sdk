import { Check, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { PlatformGitHubAutomationAgentOption } from "../../platform-ui/components/composite/github-automations/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../platform-ui/components/ui/button/index.js";
import { RunnerFileBrowserDialog } from "./file-browser-dialog.js";
import { IconGithub } from "./icons.js";
import { RunnerProjectGithubRepositorySettings } from "./project-github-repository-settings.js";
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

export type RunnerSourceGithubResourceKind = "function" | "web_app";

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
}: RunnerSourceGithubConnectorSettingsProps) {
  const resourceLabel = resourceKind === "web_app" ? "Web App" : "Function";
  const deploymentAutomationKind =
    resourceKind === "web_app" ? "deploy_web_app" : "deploy_function";
  const connectorTitleId = `source-connectors-title-${resourceKind}-${resourceId}`;
  const defaultAccountId = String(
    repository?.accountId ||
      github?.selectedAccountId ||
      github?.accounts?.find((account) => account.isDefault)?.id ||
      github?.accounts?.[0]?.id ||
      "",
  ).trim();
  const [open, setOpen] = useState(false);
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
    if (!open || !github?.connected || !github.fetchItems) return;
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
  }, [accountId, github?.connected, github?.fetchItems, open]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return items;
    return items.filter((item) =>
      `${item.name} ${normalizeRepositoryName(item)}`.toLowerCase().includes(query),
    );
  }, [items, searchQuery]);

  function openManager() {
    setSelectedRepositoryName(String(repository?.repoFullName || "").trim());
    setAccountId(String(repository?.accountId || defaultAccountId).trim());
    setSearchQuery("");
    setError("");
    setCreateError("");
    setOpen(true);
  }

  async function createRepositoryForResource() {
    if (!onCreateRepository) return;
    setCreating(true);
    setCreateError("");
    try {
      const createdRepository = await onCreateRepository({
        name: String(
          resourceName ||
            `${resourceKind === "web_app" ? "web-app" : "function"}-${resourceId.slice(-8)}`,
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
        await onRepositoryChange(null);
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

  return (
    <section
      className="playground-source-connector-settings"
      aria-labelledby={connectorTitleId}
      data-source-connector-kind={resourceKind}
    >
      <div className="playground-source-connector-settings__heading">
        <h2 id={connectorTitleId}>Connectors</h2>
        <p>
          Synchronize this {resourceLabel} with a GitHub repository and automate exact-revision
          deployments.
        </p>
      </div>

      <div className="playground-source-connector-settings__provider-group">
        <div className="playground-source-connector-settings__provider-row">
          <div className="playground-source-connector-settings__provider-identity">
            <IconGithub className="playground-source-connector-settings__provider-icon" />
            <span>GitHub</span>
          </div>
          <PlatformPrimaryButton
            type="button"
            size="small"
            disabled={disabled || saving}
            onClick={openManager}
          >
            Manage
          </PlatformPrimaryButton>
        </div>

        {repository?.repoFullName ? (
          <RunnerProjectGithubRepositorySettings
            accountId={repository.accountId || accountId || undefined}
            repoFullName={repository.repoFullName}
            refName={repository.ref || "main"}
            branchPrefix={repository.branchPrefix}
            createPullRequests={repository.createPullRequests}
            forcePushCommits={repository.forcePushCommits}
            apiBaseUrl={apiBaseUrl}
            requestHeaders={requestHeaders}
            automationScopeType={resourceKind}
            automationScopeId={resourceId}
            automationKinds={["security_scan", "pull_request_review", deploymentAutomationKind]}
            automationEnvironmentId={automationEnvironmentId}
            automationAgentOptions={automationAgentOptions}
            fetchBranches={github?.fetchBranches}
            onChange={(patch) => onRepositoryChange({ ...repository, ...patch })}
            onDisconnect={() => onRepositoryChange(null)}
          />
        ) : null}
      </div>

      {error && !open ? (
        <p className="playground-source-connector-settings__error" role="alert">
          {error}
        </p>
      ) : null}

      <RunnerFileBrowserDialog
        open={open}
        apiKeyPromptOpen={false}
        source="github"
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
          notion: EMPTY_CONNECTION,
          atlassian: EMPTY_CONNECTION,
          "google-drive": EMPTY_CONNECTION,
          "one-drive": EMPTY_CONNECTION,
        }}
        authSource={github?.connected ? null : "github"}
        path={[{ id: null, name: "GitHub" }]}
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
        items={filteredItems}
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
              <IconGithub className="tb-file-browser-item-icon tb-file-browser-source-brand-icon" />
              <span className="tb-file-browser-item-name" title={repoFullName}>
                {item.name}
              </span>
              <span className="tb-file-browser-item-meta">{repoFullName}</span>
            </button>
          );
        }}
        listFooter={
          onCreateRepository && github?.connected ? (
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
        selectedItemCount={selectedRepositoryName ? 1 : 0}
        selectedItemLabel="Repository"
        allowEmptySelection={Boolean(repository?.repoFullName)}
        isAttaching={saving}
        onAttach={applySelection}
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
