import Download01Icon from "@hugeicons/core-free-icons/Download01Icon";
import Upload01Icon from "@hugeicons/core-free-icons/Upload01Icon";
import { HugeiconsIcon } from "@hugeicons/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { RefreshCcw } from "../../ui/hugeicons-compat.js";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformSelector } from "../../ui/selector/index.js";
import { PlatformToggle } from "../../ui/toggle/index.js";
import { PlatformConnectorConfigurationRow } from "../connector-configuration/index.js";
import { PlatformModal } from "../modal/index.js";

export type PlatformResourceSourceControlKind =
  | "function"
  | "web_app"
  | "skill"
  | "agent"
  | "computer";
export type PlatformResourceSourceControlDirection =
  | "github_to_resource"
  | "resource_to_github"
  | "bidirectional";
export type PlatformResourceSourceControlConflictPolicy =
  | "fail"
  | "github_wins"
  | "resource_wins";
export type PlatformResourceSourceControlInboundTrigger =
  | "manual"
  | "push"
  | "pull_request.merged"
  | "release.published";
export type PlatformResourceSourceControlOutboundTrigger =
  | "manual"
  | "resource.updated"
  | "resource.published";

interface SourceControlConfiguration {
  inboundTriggers: PlatformResourceSourceControlInboundTrigger[];
  outboundTriggers: PlatformResourceSourceControlOutboundTrigger[];
  branchPrefix: string;
  createPullRequests: boolean;
  forcePush: boolean;
  createVersionOnMerge: boolean;
}

interface SourceControlState {
  lastSyncAt: string;
  lastStatus: string;
  lastError: string;
}

interface SourceControlBinding {
  id: string;
  resourceKind: PlatformResourceSourceControlKind;
  resourceId: string;
  repositoryFullName: string;
  baseBranch: string;
  rootPath: string;
  direction: PlatformResourceSourceControlDirection;
  conflictPolicy: PlatformResourceSourceControlConflictPolicy;
  enabled: boolean;
  configuration: SourceControlConfiguration;
  state: SourceControlState;
}

interface SourceControlExecution {
  id: string;
  status: string;
  error?: string;
}

const DEFAULT_CONFIGURATION: SourceControlConfiguration = {
  inboundTriggers: ["pull_request.merged"],
  outboundTriggers: ["resource.published"],
  branchPrefix: "computer-agents/",
  createPullRequests: true,
  forcePush: false,
  createVersionOnMerge: true,
};

const EMPTY_STATE: SourceControlState = {
  lastSyncAt: "",
  lastStatus: "",
  lastError: "",
};

export interface PlatformResourceSourceControlProps {
  apiBaseUrl?: string;
  requestHeaders?: Record<string, string> | null;
  resourceKind: PlatformResourceSourceControlKind;
  resourceId: string;
  repositoryFullName: string;
  baseBranch?: string;
  branchPrefix?: string;
  createPullRequests?: boolean;
  forcePush?: boolean;
  disabled?: boolean;
  showHeading?: boolean;
  showRepositoryPath?: boolean;
  manualActionsPortalId?: string;
  /** Primarily used by embedded hosts and tests. The browser navigates in-place by default. */
  openSetupUrl?: (url: string) => void;
}

export interface DisconnectPlatformResourceSourceControlInput {
  apiBaseUrl?: string;
  requestHeaders?: Record<string, string> | null;
  resourceKind: PlatformResourceSourceControlKind;
  resourceId: string;
}

const INBOUND_OPTIONS: ReadonlyArray<{
  value: PlatformResourceSourceControlInboundTrigger;
  label: string;
  description: string;
}> = [
  { value: "pull_request.merged", label: "Pull request merged", description: "Import the exact merged revision on the configured base branch." },
  { value: "push", label: "Base branch pushed", description: "Import each direct push to the configured base branch." },
  { value: "release.published", label: "Release published", description: "Import when a GitHub Release is published for this branch." },
];
const OUTBOUND_OPTIONS: ReadonlyArray<{
  value: PlatformResourceSourceControlOutboundTrigger;
  label: string;
  description: string;
}> = [
  { value: "resource.published", label: "Version published", description: "Export immutable published versions to GitHub." },
  { value: "resource.updated", label: "Resource updated", description: "Export every saved resource change to GitHub." },
];

function normalizeBaseUrl(value: string | undefined): string {
  return String(value || "").replace(/\/+$/, "");
}

function errorMessages(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    const message = value.trim();
    return message ? [prefix ? `${prefix}: ${message}` : message] : [];
  }
  if (Array.isArray(value)) return value.flatMap((entry) => errorMessages(entry, prefix));
  if (!value || typeof value !== "object") return [];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => (
    errorMessages(entry, key === "formErrors" || key === "fieldErrors" ? prefix : key)
  ));
}

class PlatformSourceControlRequestError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "PlatformSourceControlRequestError";
    this.code = code;
    this.status = status;
  }
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  const payload: unknown = await response.json().catch(() => ({}));
  const body = payload && typeof payload === "object" && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : {};
  if (!response.ok) {
    const [structuredError] = errorMessages(body.error);
    throw new PlatformSourceControlRequestError(
      structuredError
        ? structuredError
        : typeof body.message === "string"
          ? body.message
          : `Request failed with status ${response.status}.`,
      typeof body.code === "string" ? body.code : "",
      response.status,
    );
  }
  return body;
}

function requestError(error: unknown, fallback: string): { message: string; code: string } {
  return {
    message: error instanceof Error ? error.message : fallback,
    code: error instanceof PlatformSourceControlRequestError ? error.code : "",
  };
}

function currentPlatformPath(): string {
  if (typeof window === "undefined") return "/";
  return `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
}

function defaultOpenSetupUrl(url: string): void {
  if (typeof window !== "undefined") window.location.assign(url);
}

function requiredGitHubInstallUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("The GitHub App setup service did not return an installation URL.");
  }
  const url = new URL(value);
  if (url.protocol !== "https:" || url.hostname.toLowerCase() !== "github.com") {
    throw new Error("The GitHub App setup service returned an invalid installation URL.");
  }
  return url.toString();
}

function sourceControlBinding(value: unknown): SourceControlBinding | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = value as Partial<SourceControlBinding>;
  if (!source.id || !source.resourceId || !source.repositoryFullName) return null;
  return {
    ...source,
    baseBranch: source.baseBranch || "main",
    rootPath: source.rootPath || "",
    direction: source.direction || "bidirectional",
    conflictPolicy: source.conflictPolicy || "fail",
    enabled: source.enabled !== false,
    configuration: {
      ...DEFAULT_CONFIGURATION,
      ...(source.configuration || {}),
    },
    state: {
      ...EMPTY_STATE,
      ...(source.state || {}),
    },
  } as SourceControlBinding;
}

function requiredSourceControlBinding(value: unknown): SourceControlBinding {
  const binding = sourceControlBinding(value);
  if (!binding) throw new Error("The source-control service returned an invalid binding.");
  return binding;
}

function summarizeTriggers(values: readonly string[], options: readonly { value: string; label: string }[]) {
  const labels = options.filter((option) => values.includes(option.value)).map((option) => option.label);
  return labels.length ? labels.join(", ") : "Manual only";
}

function formatSyncTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

/**
 * Remove every source binding owned by a resource before its repository
 * metadata is disconnected. Keeping this operation in the shared module
 * prevents invisible webhook jobs from surviving after a connector is gone.
 */
export async function disconnectPlatformResourceSourceControl({
  apiBaseUrl,
  requestHeaders,
  resourceKind,
  resourceId,
}: DisconnectPlatformResourceSourceControlInput): Promise<void> {
  if (!resourceId) return;
  const baseUrl = normalizeBaseUrl(apiBaseUrl);
  const bindingsUrl = `${baseUrl}/source-control/bindings`;
  const params = new URLSearchParams({ resourceKind, resourceId });
  const response = await fetch(`${bindingsUrl}?${params.toString()}`, {
    headers: requestHeaders || undefined,
  });
  const payload = await responseJson(response);
  const bindings = Array.isArray(payload.data)
    ? payload.data as SourceControlBinding[]
    : [];
  for (const binding of bindings) {
    const deleteResponse = await fetch(`${bindingsUrl}/${encodeURIComponent(binding.id)}`, {
      method: "DELETE",
      headers: requestHeaders || undefined,
    });
    await responseJson(deleteResponse);
  }
}

export function PlatformResourceSourceControl({
  apiBaseUrl,
  requestHeaders,
  resourceKind,
  resourceId,
  repositoryFullName,
  baseBranch = "main",
  branchPrefix = "computer-agents/",
  createPullRequests = true,
  forcePush = false,
  disabled = false,
  showHeading = true,
  showRepositoryPath = true,
  manualActionsPortalId,
  openSetupUrl = defaultOpenSetupUrl,
}: PlatformResourceSourceControlProps) {
  const baseUrl = normalizeBaseUrl(apiBaseUrl);
  const bindingsUrl = `${baseUrl}/source-control/bindings`;
  const [binding, setBinding] = useState<SourceControlBinding | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState<"outbound" | "inbound" | "version" | "">("");
  const [syncing, setSyncing] = useState<"github_to_resource" | "resource_to_github" | "">("");
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [startingGitHubSetup, setStartingGitHubSetup] = useState(false);
  const [configurationOpen, setConfigurationOpen] = useState(false);
  const [draftInbound, setDraftInbound] = useState<PlatformResourceSourceControlInboundTrigger[]>([]);
  const [draftOutbound, setDraftOutbound] = useState<PlatformResourceSourceControlOutboundTrigger[]>([]);
  const [rootPathDraft, setRootPathDraft] = useState("");
  const lastExternalConfiguration = useRef("");
  const requestHeadersRef = useRef(requestHeaders);
  requestHeadersRef.current = requestHeaders;

  const request = useCallback(async (url: string, init?: RequestInit) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...(requestHeadersRef.current || {}),
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers || {}),
      },
    });
    return responseJson(response);
  }, []);

  const createBinding = useCallback(async (signal?: AbortSignal) => {
    const payload = await request(bindingsUrl, {
      method: "POST",
      signal,
      body: JSON.stringify({
        resourceKind,
        resourceId,
        repositoryFullName,
        baseBranch,
        direction: "bidirectional",
        conflictPolicy: "fail",
        configuration: {
          inboundTriggers: ["pull_request.merged"],
          outboundTriggers: [resourceKind === "skill" ? "resource.updated" : "resource.published"],
          branchPrefix,
          createPullRequests,
          forcePush,
          createVersionOnMerge: true,
        },
      }),
    });
    return requiredSourceControlBinding(payload);
  }, [baseBranch, bindingsUrl, branchPrefix, createPullRequests, forcePush, repositoryFullName, request, resourceId, resourceKind]);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!resourceId || !repositoryFullName || disabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setBinding(null);
    setError("");
    setErrorCode("");
    try {
      const params = new URLSearchParams({ resourceKind, resourceId });
      const payload = await request(`${bindingsUrl}?${params.toString()}`, { signal });
      if (signal?.aborted) return;
      const current = Array.isArray(payload.data)
        ? payload.data.map(sourceControlBinding).find(Boolean) || undefined
        : undefined;
      const next = !current || current.repositoryFullName.toLowerCase() !== repositoryFullName.toLowerCase()
        ? await createBinding(signal)
        : current;
      if (signal?.aborted) return;
      setBinding(next);
      setRootPathDraft(next.rootPath || "");
    } catch (loadError) {
      if (signal?.aborted) return;
      const failure = requestError(loadError, "Failed to load source synchronization.");
      setBinding(null);
      setError(failure.message);
      setErrorCode(failure.code);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [bindingsUrl, createBinding, disabled, repositoryFullName, request, resourceId, resourceKind]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const update = useCallback(async (patch: Record<string, unknown>) => {
    if (!binding || saving || disabled) return null;
    setSaving(true);
    setError("");
    setErrorCode("");
    try {
      const payload = await request(`${bindingsUrl}/${encodeURIComponent(binding.id)}`, {
        method: "PATCH",
        body: JSON.stringify(patch),
      });
      const next = requiredSourceControlBinding(payload);
      setBinding(next);
      setRootPathDraft(next.rootPath || "");
      return next;
    } catch (saveError) {
      const failure = requestError(saveError, "Failed to update source synchronization.");
      setError(failure.message);
      setErrorCode(failure.code);
      return null;
    } finally {
      setSaving(false);
    }
  }, [binding, bindingsUrl, disabled, request, saving]);

  useEffect(() => {
    if (!binding) return;
    const key = JSON.stringify({ baseBranch, branchPrefix, createPullRequests, forcePush });
    if (lastExternalConfiguration.current === key) return;
    lastExternalConfiguration.current = key;
    if (
      binding.baseBranch === baseBranch
      && binding.configuration.branchPrefix === branchPrefix
      && binding.configuration.createPullRequests === createPullRequests
      && binding.configuration.forcePush === forcePush
    ) return;
    void update({
      baseBranch,
      configuration: {
        ...binding.configuration,
        branchPrefix,
        createPullRequests,
        forcePush,
      },
    });
  }, [baseBranch, binding, branchPrefix, createPullRequests, forcePush, update]);

  function openConfiguration() {
    if (!binding) return;
    setDraftInbound(binding.configuration.inboundTriggers || []);
    setDraftOutbound(binding.configuration.outboundTriggers || []);
    setConfigurationOpen(true);
  }

  const outboundOptions = resourceKind === "skill"
    ? OUTBOUND_OPTIONS.filter((option) => option.value === "resource.updated")
    : OUTBOUND_OPTIONS;

  async function saveConfiguration() {
    if (!binding) return;
    const next = await update({
      configuration: {
        ...binding.configuration,
        inboundTriggers: draftInbound.length ? draftInbound : ["manual"],
        outboundTriggers: draftOutbound.length ? draftOutbound : ["manual"],
      },
    });
    if (next) setConfigurationOpen(false);
  }

  async function updateLifecyclePolicy(
    configuration: SourceControlConfiguration,
    policy: "outbound" | "inbound" | "version",
    direction?: PlatformResourceSourceControlDirection,
  ) {
    setSavingPolicy(policy);
    try {
      await update({
        ...(direction && direction !== binding?.direction ? { direction } : {}),
        configuration,
      });
    } finally {
      setSavingPolicy("");
    }
  }

  function setOutboundUpdatesEnabled(checked: boolean) {
    if (!binding) return;
    const outboundTriggers = checked
      ? [...new Set([
          ...binding.configuration.outboundTriggers.filter((trigger) => trigger !== "manual"),
          "resource.updated" as const,
        ])]
      : binding.configuration.outboundTriggers.filter((trigger) => trigger !== "resource.updated");
    void updateLifecyclePolicy(
      {
        ...binding.configuration,
        outboundTriggers: outboundTriggers.length ? outboundTriggers : ["manual"],
      },
      "outbound",
      checked && binding.direction === "github_to_resource" ? "bidirectional" : undefined,
    );
  }

  function setMergedImportsEnabled(checked: boolean) {
    if (!binding) return;
    const inboundTriggers = checked
      ? [...new Set([
          ...binding.configuration.inboundTriggers.filter((trigger) => trigger !== "manual"),
          "pull_request.merged" as const,
        ])]
      : binding.configuration.inboundTriggers.filter((trigger) => trigger !== "pull_request.merged");
    void updateLifecyclePolicy(
      {
        ...binding.configuration,
        inboundTriggers: inboundTriggers.length ? inboundTriggers : ["manual"],
      },
      "inbound",
      checked && binding.direction === "resource_to_github" ? "bidirectional" : undefined,
    );
  }

  function setMergeVersionEnabled(checked: boolean) {
    if (!binding) return;
    const inboundTriggers = checked
      ? [...new Set([
          ...binding.configuration.inboundTriggers.filter((trigger) => trigger !== "manual"),
          "pull_request.merged" as const,
        ])]
      : binding.configuration.inboundTriggers;
    void updateLifecyclePolicy(
      {
        ...binding.configuration,
        inboundTriggers,
        createVersionOnMerge: checked,
      },
      "version",
      checked && binding.direction === "resource_to_github" ? "bidirectional" : undefined,
    );
  }

  async function synchronize(direction: "github_to_resource" | "resource_to_github") {
    if (!binding || syncing) return;
    setSyncing(direction);
    setError("");
    setErrorCode("");
    try {
      const queued = await request(`${bindingsUrl}/${encodeURIComponent(binding.id)}/sync`, {
        method: "POST",
        body: JSON.stringify({ direction }),
      }) as unknown as SourceControlExecution;
      for (let attempt = 0; attempt < 50; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1_200));
        const executions = await request(
          `${bindingsUrl}/${encodeURIComponent(binding.id)}/executions?limit=10`,
        );
        const execution = (Array.isArray(executions.data)
          ? executions.data as SourceControlExecution[]
          : []).find((candidate) => candidate.id === queued.id);
        if (execution && !["queued", "running"].includes(execution.status)) {
          if (!["succeeded", "ignored"].includes(execution.status)) {
            throw new Error(execution.error || `Synchronization ${execution.status}.`);
          }
          await load();
          break;
        }
      }
    } catch (syncError) {
      const failure = requestError(syncError, "Synchronization failed.");
      setError(failure.message);
      setErrorCode(failure.code);
    } finally {
      setSyncing("");
    }
  }

  const directionOptions = useMemo(() => [
    { value: "bidirectional" as const, label: "Two-way" },
    { value: "github_to_resource" as const, label: "GitHub to Computer Agents" },
    { value: "resource_to_github" as const, label: "Computer Agents to GitHub" },
  ], []);
  const conflictOptions = useMemo(() => [
    { value: "fail" as const, label: "Stop and report" },
    { value: "github_wins" as const, label: "Prefer GitHub" },
    { value: "resource_wins" as const, label: "Prefer Computer Agents" },
  ], []);

  const outboundUpdatesEnabled = Boolean(
    binding
    && binding.direction !== "github_to_resource"
    && binding.configuration.outboundTriggers.includes("resource.updated"),
  );
  const mergedImportsEnabled = Boolean(
    binding
    && binding.direction !== "resource_to_github"
    && binding.configuration.inboundTriggers.includes("pull_request.merged"),
  );
  const githubSetupRequired = !binding && (
    errorCode === "RESOURCE_SOURCE_CONTROL_REPOSITORY_NOT_CONNECTED"
    || /install the computer agents github app/i.test(error)
  );
  const manualActions = binding ? (
    <div className="platform-resource-source-control__actions">
      {binding.direction !== "resource_to_github" ? (
        <PlatformSecondaryButton type="button" size="small" disabled={disabled || Boolean(syncing)} onClick={() => void synchronize("github_to_resource")}>
          {syncing === "github_to_resource" ? <img src="/img/spinner.svg" alt="" /> : <HugeiconsIcon icon={Download01Icon} aria-hidden="true" />} Import now
        </PlatformSecondaryButton>
      ) : null}
      {binding.direction !== "github_to_resource" ? (
        <PlatformSecondaryButton type="button" size="small" disabled={disabled || Boolean(syncing)} onClick={() => void synchronize("resource_to_github")}>
          {syncing === "resource_to_github" ? <img src="/img/spinner.svg" alt="" /> : <HugeiconsIcon icon={Upload01Icon} aria-hidden="true" />} Publish now
        </PlatformSecondaryButton>
      ) : null}
    </div>
  ) : null;
  const manualActionsPortalTarget = manualActionsPortalId && typeof document !== "undefined"
    ? document.getElementById(manualActionsPortalId)
    : null;

  async function beginGitHubSetup() {
    if (startingGitHubSetup || disabled) return;
    setStartingGitHubSetup(true);
    try {
      const payload = await request(`${baseUrl}/github/security/setup`, {
        method: "POST",
        body: JSON.stringify({ redirectPath: currentPlatformPath() }),
      });
      if (payload.installUrl) {
        openSetupUrl(requiredGitHubInstallUrl(payload.installUrl));
      } else if (payload.connected === true && payload.connectionType === "oauth") {
        await load();
      } else {
        throw new Error("GitHub did not return a repository connection.");
      }
      setStartingGitHubSetup(false);
    } catch (setupError) {
      const failure = requestError(setupError, "Failed to start GitHub App setup.");
      setError(failure.message);
      setErrorCode(failure.code);
      setStartingGitHubSetup(false);
    }
  }

  if (loading) {
    return <div className="platform-resource-source-control__loading"><img src="/img/spinner.svg" alt="Loading source synchronization" /> Loading synchronization...</div>;
  }

  return (
    <>
      <div
      className={`platform-resource-source-control${binding ? " is-ready" : " is-setup-required"}${showHeading ? "" : " without-heading"}`}
      data-platform-resource-source-control="true"
      data-source-control-status={binding ? "ready" : "setup-required"}
    >
      {showHeading ? (
        <div className="platform-resource-source-control__heading">
          <div><strong>Source synchronization</strong><span>Keep this resource and its managed GitHub source aligned.</span></div>
          {binding ? (
              <PlatformSecondaryButton type="button" size="small" disabled={disabled || saving} onClick={openConfiguration}>Manage</PlatformSecondaryButton>
          ) : null}
        </div>
      ) : null}
      <PlatformConnectorConfigurationRow
        title="Push Computer Agents changes to GitHub"
        description="Publish each saved resource change to the connected repository."
        pending={savingPolicy === "outbound"}
        pendingLabel="Updating GitHub publishing policy"
      >
        <PlatformToggle
          checked={outboundUpdatesEnabled}
          aria-label="Push Computer Agents changes to GitHub"
          disabled={disabled || saving || !binding}
          onCheckedChange={setOutboundUpdatesEnabled}
        />
      </PlatformConnectorConfigurationRow>
      <PlatformConnectorConfigurationRow
        title="Import merged GitHub changes"
        description={`Apply the exact revision when a pull request is merged into ${binding?.baseBranch || baseBranch}.`}
        pending={savingPolicy === "inbound"}
        pendingLabel="Updating GitHub import policy"
      >
        <PlatformToggle
          checked={mergedImportsEnabled}
          aria-label="Import merged GitHub changes"
          disabled={disabled || saving || !binding}
          onCheckedChange={setMergedImportsEnabled}
        />
      </PlatformConnectorConfigurationRow>
      <PlatformConnectorConfigurationRow
        title="Create a new version after merge"
        description={`Create a saved Computer Agents version from every imported merge into ${binding?.baseBranch || baseBranch}.`}
        pending={savingPolicy === "version"}
        pendingLabel="Updating merge version policy"
      >
        <PlatformToggle
          checked={Boolean(binding && mergedImportsEnabled && binding.configuration.createVersionOnMerge)}
          aria-label="Create a new version after merge"
          disabled={disabled || saving || !binding || !mergedImportsEnabled}
          onCheckedChange={setMergeVersionEnabled}
        />
      </PlatformConnectorConfigurationRow>
      {!showHeading && binding ? (
        <PlatformConnectorConfigurationRow
          title="Sync triggers"
          description="Choose which events start synchronization."
        >
          <PlatformPrimaryButton
            type="button"
            size="small"
            disabled={disabled || saving}
            onClick={openConfiguration}
          >
            Manage
          </PlatformPrimaryButton>
        </PlatformConnectorConfigurationRow>
      ) : null}
      {githubSetupRequired ? (
        <div className="platform-resource-source-control__setup" role="alert">
          <div>
            <strong>GitHub repository access required</strong>
            <span>Connect this repository to receive merge events and import exact revisions.</span>
          </div>
          <PlatformPrimaryButton
            type="button"
            size="small"
            disabled={disabled || startingGitHubSetup}
            onClick={() => void beginGitHubSetup()}
          >
            {startingGitHubSetup ? "Connecting..." : "Connect repository"}
          </PlatformPrimaryButton>
        </div>
      ) : error ? <p className="platform-resource-source-control__error" role="alert">{error}</p> : null}

      {binding ? (
        <>
          <PlatformConnectorConfigurationRow title="Direction" description="Choose which system can publish source changes.">
            <PlatformSelector
              value={binding.direction}
              ariaLabel="Source synchronization direction"
              options={directionOptions}
              disabled={disabled || saving}
              popupAlignment="right"
              onValueChange={(direction) => void update({ direction })}
            />
          </PlatformConnectorConfigurationRow>
          {showRepositoryPath ? (
            <PlatformConnectorConfigurationRow title="Repository path" description="Optional folder containing this resource in a monorepo.">
              <input
                className="platform-resource-source-control__path"
                value={rootPathDraft}
                disabled={disabled || saving}
                placeholder="Repository root"
                onChange={(event) => setRootPathDraft(event.target.value)}
                onBlur={() => rootPathDraft !== binding.rootPath && void update({ rootPath: rootPathDraft })}
                onKeyDown={(event) => event.key === "Enter" && event.currentTarget.blur()}
              />
            </PlatformConnectorConfigurationRow>
          ) : null}
          <PlatformConnectorConfigurationRow title="Conflicts" description="Stop when both sides changed since the last sync.">
            <PlatformSelector
              value={binding.conflictPolicy}
              ariaLabel="Source synchronization conflict policy"
              options={conflictOptions}
              disabled={disabled || saving}
              popupAlignment="right"
              onValueChange={(conflictPolicy) => void update({ conflictPolicy })}
            />
          </PlatformConnectorConfigurationRow>
          <div className="platform-resource-source-control__status">
            <div>
              <strong>{binding.state.lastStatus ? `Last sync: ${binding.state.lastStatus}` : "Not synchronized yet"}</strong>
              <span>{binding.state.lastError || formatSyncTime(binding.state.lastSyncAt)}</span>
            </div>
            {!manualActionsPortalId ? manualActions : null}
          </div>
        </>
      ) : null}

      <PlatformModal
        open={configurationOpen}
        size="medium"
        title="Source synchronization"
        description="Choose the lifecycle events that move source between GitHub and Computer Agents. Manual synchronization remains available."
        headerLeading={<RefreshCcw aria-hidden="true" />}
        onClose={() => !saving && setConfigurationOpen(false)}
        footer={<><PlatformSecondaryButton type="button" disabled={saving} onClick={() => setConfigurationOpen(false)}>Cancel</PlatformSecondaryButton><PlatformPrimaryButton type="button" disabled={saving} onClick={() => void saveConfiguration()}>{saving ? "Saving..." : "Save"}</PlatformPrimaryButton></>}
      >
        <div className="platform-resource-source-control__modal-section">
          <strong>Import from GitHub</strong>
          <span>{summarizeTriggers(draftInbound, INBOUND_OPTIONS)}</span>
          {INBOUND_OPTIONS.map((option) => (
            <div className="platform-resource-source-control__trigger" key={option.value}>
              <div><strong>{option.label}</strong><span>{option.description}</span></div>
              <PlatformToggle checked={draftInbound.includes(option.value)} aria-label={option.label} onCheckedChange={(checked) => setDraftInbound((current) => checked ? [...new Set([...current.filter((value) => value !== "manual"), option.value])] : current.filter((value) => value !== option.value))} />
            </div>
          ))}
        </div>
        <div className="platform-resource-source-control__modal-section">
          <strong>Publish to GitHub</strong>
          <span>{summarizeTriggers(draftOutbound, outboundOptions)}</span>
          {outboundOptions.map((option) => (
            <div className="platform-resource-source-control__trigger" key={option.value}>
              <div><strong>{option.label}</strong><span>{option.description}</span></div>
              <PlatformToggle checked={draftOutbound.includes(option.value)} aria-label={option.label} onCheckedChange={(checked) => setDraftOutbound((current) => checked ? [...new Set([...current.filter((value) => value !== "manual"), option.value])] : current.filter((value) => value !== option.value))} />
            </div>
          ))}
        </div>
      </PlatformModal>
      </div>
      {manualActions && manualActionsPortalTarget
        ? createPortal(manualActions, manualActionsPortalTarget)
        : null}
    </>
  );
}
