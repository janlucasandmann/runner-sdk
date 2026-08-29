import { useEffect, useState } from "react";
import {
  PlatformConnectorConfiguration,
  PlatformConnectorConfigurationRow,
} from "../../platform-ui/components/composite/connector-configuration/index.js";
import {
  type PlatformGitHubAutomationAgentOption,
  type PlatformGitHubAutomationKind,
  type PlatformGitHubAutomationScopeType,
  PlatformGitHubAutomations,
} from "../../platform-ui/components/composite/github-automations/index.js";
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
}

export function RunnerProjectGithubRepositorySettings({
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
}: RunnerProjectGithubRepositorySettingsProps) {
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

  return (
    <PlatformConnectorConfiguration
      className="playground-project-github-repository-settings"
      data-project-github-repository={repoFullName}
      title={repoFullName}
      actionLabel={`Actions for ${repoFullName}`}
      onDisconnect={onDisconnect}
    >
      <PlatformConnectorConfigurationRow
        title="Base branch"
        description="Branch agents use as the starting point for work in this repository."
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
        description="Choose whether completed changes should be proposed as pull requests."
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
        description="Always use force-with-lease when agents update branches in this repository."
      >
        <PlatformToggle
          className="playground-project-github-repository-settings__toggle"
          checked={forcePushCommits === true}
          aria-label={`Force-push commits for ${repoFullName}`}
          onCheckedChange={(checked) => void onChange({ forcePushCommits: checked })}
        />
      </PlatformConnectorConfigurationRow>

      {resolvedAutomationScopeType && resolvedAutomationScopeId ? (
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
        />
      ) : null}
    </PlatformConnectorConfiguration>
  );
}
