import { GitBranch, GitPullRequestArrow } from "lucide-react";
import { useEffect, useState } from "react";

import { PlatformSwitch } from "../../platform-ui/components/ui/switch/index.js";
import type { RunnerChatOption } from "./agent-options.js";
import { RunnerGithubBranchSelector } from "./github-branch-selector.js";
import type { RunnerChatConnectorFetchOptions } from "./public-types.js";

export interface RunnerProjectGithubRepositorySettingsChange {
  branchPrefix?: string;
  createPullRequests?: boolean;
  ref?: string;
}

export interface RunnerProjectGithubRepositorySettingsProps {
  accountId?: string;
  branchPrefix?: string | null;
  createPullRequests?: boolean | null;
  fetchBranches?: (
    repoFullName: string,
    options?: RunnerChatConnectorFetchOptions,
  ) => Promise<RunnerChatOption[]>;
  onChange: (change: RunnerProjectGithubRepositorySettingsChange) => void | Promise<void>;
  refName?: string | null;
  repoFullName: string;
}

export function RunnerProjectGithubRepositorySettings({
  accountId,
  branchPrefix,
  createPullRequests,
  fetchBranches,
  onChange,
  refName,
  repoFullName,
}: RunnerProjectGithubRepositorySettingsProps) {
  const resolvedBranchPrefix = String(branchPrefix ?? "computer-agents/");
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
    <section
      className="playground-project-github-repository-settings"
      data-project-github-repository={repoFullName}
    >
      <div className="playground-project-github-repository-settings__heading">
        <div className="playground-project-github-repository-settings__identity">
          <GitBranch aria-hidden="true" />
          <span>{repoFullName}</span>
        </div>
        <div className="playground-project-github-repository-settings__branch">
          <span>Base branch</span>
          <RunnerGithubBranchSelector
            accountId={accountId}
            repoFullName={repoFullName}
            value={refName || "main"}
            fetchBranches={fetchBranches}
            triggerClassName="playground-project-github-repository-settings__branch-trigger"
            popupClassName="playground-project-github-repository-settings__branch-popup"
            onValueChange={(ref) => void onChange({ ref })}
          />
        </div>
      </div>

      <div className="playground-project-github-repository-settings__row">
        <div className="playground-project-github-repository-settings__copy">
          <strong>Branch prefix</strong>
          <span>Prefix agents use when they create branches in this repository.</span>
        </div>
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
      </div>

      <div className="playground-project-github-repository-settings__row">
        <div className="playground-project-github-repository-settings__copy">
          <strong>
            <GitPullRequestArrow aria-hidden="true" /> Pull requests
          </strong>
          <span>Choose whether completed changes should be proposed as pull requests.</span>
        </div>
        <PlatformSwitch
          className="playground-project-github-repository-settings__pr-switch"
          value={createPullRequests === false ? "direct" : "pull-request"}
          ariaLabel={`Pull request behavior for ${repoFullName}`}
          options={[
            { value: "pull-request", label: "Create PR" },
            { value: "direct", label: "Do not create" },
          ]}
          onValueChange={(value) => void onChange({ createPullRequests: value === "pull-request" })}
        />
      </div>
    </section>
  );
}
