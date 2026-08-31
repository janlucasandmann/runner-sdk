import { useEffect, useState } from "react";
import {
  PlatformConnectorConfiguration,
  PlatformConnectorConfigurationRow,
  PlatformConnectorConfigurationSection,
} from "../../platform-ui/components/composite/connector-configuration/index.js";
import {
  type PlatformGitHubAutomationAgentOption,
  type PlatformGitHubAutomationKind,
  type PlatformGitHubAutomationScopeType,
  PlatformGitHubAutomations,
} from "../../platform-ui/components/composite/github-automations/index.js";
import {
  PlatformResourceSourceControl,
  type PlatformResourceSourceControlKind,
} from "../../platform-ui/components/composite/resource-source-control/index.js";
import { PlatformToggle } from "../../platform-ui/components/ui/toggle/index.js";
import type { RunnerChatOption } from "./agent-options.js";
import { RunnerGithubBranchSelector } from "./github-branch-selector.js";
import type { RunnerChatConnectorFetchOptions } from "./public-types.js";

export interface RunnerProjectGithubRepositorySettingsChange {
  branchPrefix?: string;
  createPullRequests?: boolean;
  forcePushCommits?: boolean;
  ref?: string;
}

export interface RunnerProjectGithubRepositorySettingsProps {
  accountId?: string;
  apiBaseUrl?: string;
  automationAgentOptions?: readonly PlatformGitHubAutomationAgentOption[];
  automationEnvironmentId?: string;
  automationKinds?: readonly PlatformGitHubAutomationKind[];
  automationScopeId?: string;
  automationScopeType?: PlatformGitHubAutomationScopeType;
  branchPrefix?: string | null;
  createPullRequests?: boolean | null;
  forcePushCommits?: boolean | null;
  fetchBranches?: (
    repoFullName: string,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatOption[]>;
  onChange: (change: RunnerProjectGithubRepositorySettingsChange) => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  projectId?: string;
  refName?: string | null;
  repoFullName: string;
  requestHeaders?: Record<string, string> | null;
  sourceControlResourceId?: string;
  sourceControlResourceKind?: PlatformResourceSourceControlKind;
}

export type RunnerGithubRepositorySettingsVariant = "project" | "resource";

export interface RunnerGithubRepositorySettingsProps
  extends RunnerProjectGithubRepositorySettingsProps {
  variant?: RunnerGithubRepositorySettingsVariant;
}

/**
 * Canonical GitHub repository settings surface.
 *
 * Project repositories expose execution policy first. Resource repositories
 * expose durable two-way source lifecycle policy first while retaining the
 * same advanced branch controls and automation implementation underneath.
 */
export function RunnerGithubRepositorySettings({
  accountId,
  apiBaseUrl,
  automationAgentOptions,
  automationEnvironmentId,
  automationKinds,
  automationScopeId,
  automationScopeType,
  branchPrefix,
  createPullRequests,
  forcePushCommits,
  fetchBranches,
  onChange,
  onDisconnect,
  projectId,
  refName,
  repoFullName,
  requestHeaders,
  sourceControlResourceId,
  sourceControlResourceKind,
  variant = "project",
}: RunnerGithubRepositorySettingsProps) {
  const resolvedBranchPrefix = String(branchPrefix ?? "computer-agents/");
  const resolvedAutomationScopeId = String(automationScopeId || projectId || "").trim();
  const resolvedAutomationScopeType = automationScopeType || (projectId ? "project" : undefined);
  const [branchPrefixDraft, setBranchPrefixDraft] = useState(resolvedBranchPrefix);

  useEffect(() => {
    setBranchPrefixDraft(resolvedBranchPrefix);
  }, [resolvedBranchPrefix]);

  function commitBranchPrefix() {
    const normalizedPrefix = branchPrefixDraft.trim();
    if (normalizedPrefix === resolvedBranchPrefix) return;
    void onChange({ branchPrefix: normalizedPrefix });
  }

  const sourceControl = sourceControlResourceKind && sourceControlResourceId ? (
    <PlatformResourceSourceControl
      apiBaseUrl={apiBaseUrl}
      requestHeaders={requestHeaders}
      resourceKind={sourceControlResourceKind}
      resourceId={sourceControlResourceId}
      repositoryFullName={repoFullName}
      baseBranch={refName || "main"}
      branchPrefix={resolvedBranchPrefix}
      createPullRequests={createPullRequests !== false}
      forcePush={forcePushCommits === true}
      showHeading={variant !== "resource"}
    />
  ) : null;

  const automations = resolvedAutomationScopeType && resolvedAutomationScopeId ? (
    <PlatformGitHubAutomations
      apiBaseUrl={apiBaseUrl}
      requestHeaders={requestHeaders}
      scopeType={resolvedAutomationScopeType}
      scopeId={resolvedAutomationScopeId}
      repositoryFullName={repoFullName}
      agentOptions={automationAgentOptions}
      environmentId={automationEnvironmentId}
      defaultBranch={refName || "main"}
      automationKinds={automationKinds}
      showHeading={variant !== "resource"}
    />
  ) : null;

  const baseBranchRow = (
    <PlatformConnectorConfigurationRow
      title="Base branch"
      description={variant === "resource"
        ? "Branch used as the exact-revision boundary for imports and version creation."
        : "Branch agents use as the starting point for work in this repository."}
    >
      <div className="playground-project-github-repository-settings__branch">
        <RunnerGithubBranchSelector
          accountId={accountId}
          repoFullName={repoFullName}
          value={refName || "main"}
          fetchBranches={fetchBranches}
          fullWidth={false}
          triggerClassName="playground-project-github-repository-settings__branch-trigger"
          popupClassName="playground-project-github-repository-settings__branch-popup"
          onValueChange={(ref) => void onChange({ ref })}
        />
      </div>
    </PlatformConnectorConfigurationRow>
  );

  const agentGitBehavior = (
    <>
      <PlatformConnectorConfigurationRow
        title="Branch prefix"
        description="Prefix agents use when they create branches in this repository."
      >
        <input
          className="playground-project-github-repository-settings__input"
          aria-label={`Branch prefix for ${repoFullName}`}
          value={branchPrefixDraft}
          placeholder="computer-agents/"
          onChange={(event) => setBranchPrefixDraft(event.target.value)}
          onBlur={commitBranchPrefix}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
        />
      </PlatformConnectorConfigurationRow>

      <PlatformConnectorConfigurationRow
        title="Pull requests"
        description="Choose whether completed agent changes should be proposed as pull requests."
      >
        <PlatformToggle
          className="playground-project-github-repository-settings__toggle"
          checked={createPullRequests !== false}
          aria-label={`Create pull requests for ${repoFullName}`}
          onCheckedChange={(checked) => void onChange({ createPullRequests: checked })}
        />
      </PlatformConnectorConfigurationRow>

      <PlatformConnectorConfigurationRow
        title="Force-push commits"
        description="Permit a force update only when Computer Agents is selected to resolve a source conflict."
      >
        <PlatformToggle
          className="playground-project-github-repository-settings__toggle"
          checked={forcePushCommits === true}
          aria-label={`Force-push commits for ${repoFullName}`}
          onCheckedChange={(checked) => void onChange({ forcePushCommits: checked })}
        />
      </PlatformConnectorConfigurationRow>
    </>
  );

  return (
    <PlatformConnectorConfiguration
      className={`playground-project-github-repository-settings is-${variant}`}
      data-project-github-repository={repoFullName}
      data-github-repository-settings-variant={variant}
      surface={variant === "resource" ? "plain" : "contained"}
      showHeader={variant !== "resource"}
      title={repoFullName}
      actionLabel={`Actions for ${repoFullName}`}
      onDisconnect={onDisconnect}
    >
      {variant === "resource" ? (
        <>
          <PlatformConnectorConfigurationSection
            title="Version synchronization"
            description="Keep Computer Agents versions aligned with exact revisions on the repository base branch."
          >
            {baseBranchRow}
            {sourceControl}
          </PlatformConnectorConfigurationSection>

          {automations ? (
            <PlatformConnectorConfigurationSection
              title="Automations"
              description="Run checks, reviews, and exact-revision actions when GitHub events occur."
            >
              {automations}
            </PlatformConnectorConfigurationSection>
          ) : null}

          <PlatformConnectorConfigurationSection
            title="Agent Git behavior"
            description="Define how agents create branches, propose changes, and update repository history."
          >
            {agentGitBehavior}
          </PlatformConnectorConfigurationSection>
        </>
      ) : (
        <>
          {baseBranchRow}
          {agentGitBehavior}
          {sourceControl}
          {automations}
        </>
      )}
    </PlatformConnectorConfiguration>
  );
}

export function RunnerProjectGithubRepositorySettings(
  props: RunnerProjectGithubRepositorySettingsProps,
) {
  return <RunnerGithubRepositorySettings {...props} variant="project" />;
}

export function RunnerResourceGithubRepositorySettings(
  props: RunnerProjectGithubRepositorySettingsProps,
) {
  return <RunnerGithubRepositorySettings {...props} variant="resource" />;
}
