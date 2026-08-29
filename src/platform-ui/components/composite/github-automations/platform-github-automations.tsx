import { Globe, Rocket, ScanEye, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlatformPrimaryButton, PlatformSecondaryButton } from "../../ui/button/index.js";
import { PlatformSelector } from "../../ui/selector/index.js";
import { PlatformToggle } from "../../ui/toggle/index.js";
import { PlatformModal } from "../modal/index.js";

export type PlatformGitHubAutomationScopeType = "organization" | "project" | "function" | "web_app";
export type PlatformGitHubAutomationKind =
  | "security_scan"
  | "pull_request_review"
  | "deploy_function"
  | "deploy_web_app";

export interface PlatformGitHubAutomationAgentOption {
  id: string;
  label: string;
  description?: string;
}

export interface PlatformGitHubAutomationConfiguration {
  events: string[];
  branches: string[];
  pathIncludes: string[];
  pathExcludes: string[];
  agentId: string;
  environmentId: string;
  instructions: string;
  publishReview: boolean;
}

export interface PlatformGitHubAutomationBinding {
  id: string;
  scopeType: PlatformGitHubAutomationScopeType;
  scopeId: string;
  repositoryFullName: string;
  kind: PlatformGitHubAutomationKind;
  enabled: boolean;
  configuration: PlatformGitHubAutomationConfiguration;
}

export interface PlatformGitHubAutomationsProps {
  apiBaseUrl?: string;
  requestHeaders?: Record<string, string> | null;
  scopeType: PlatformGitHubAutomationScopeType;
  scopeId: string;
  repositoryFullName: string;
  agentOptions?: readonly PlatformGitHubAutomationAgentOption[];
  environmentId?: string;
  defaultBranch?: string;
  automationKinds?: readonly PlatformGitHubAutomationKind[];
  onBindingsChange?: (bindings: readonly PlatformGitHubAutomationBinding[]) => void;
}

interface AutomationDefinition {
  kind: PlatformGitHubAutomationKind;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
}

const AUTOMATIONS: readonly AutomationDefinition[] = [
  {
    kind: "security_scan",
    title: "Security scans",
    description: "Scan immutable commits when pull requests or protected branches change.",
    icon: ShieldCheck,
  },
  {
    kind: "pull_request_review",
    title: "Pull request reviews",
    description: "Start a scoped reviewer Thread and publish structured GitHub feedback.",
    icon: ScanEye,
  },
  {
    kind: "deploy_function",
    title: "Function deployments",
    description: "Create and deploy a new Function version from the exact GitHub revision.",
    icon: Rocket,
  },
  {
    kind: "deploy_web_app",
    title: "Web App deployments",
    description: "Create and deploy a new Web App version from the exact GitHub revision.",
    icon: Globe,
  },
];

const PR_EVENT_OPTIONS = [
  ["pull_request.opened", "Pull request opened"],
  ["pull_request.reopened", "Pull request reopened"],
  ["pull_request.ready_for_review", "Ready for review"],
  ["pull_request.synchronize", "New commits pushed"],
] as const;

const DEPLOY_EVENT_OPTIONS = [
  ["pull_request.merged", "Pull request merged"],
  ["push", "Branch pushed"],
] as const;

function isDeploymentAutomationKind(kind: PlatformGitHubAutomationKind): boolean {
  return kind === "deploy_function" || kind === "deploy_web_app";
}

function defaultConfiguration(
  kind: PlatformGitHubAutomationKind,
  environmentId = "",
  defaultBranch = "",
): PlatformGitHubAutomationConfiguration {
  return {
    events: isDeploymentAutomationKind(kind)
      ? ["pull_request.merged"]
      : [
          ...PR_EVENT_OPTIONS.map(([event]) => event),
          ...(kind === "security_scan" ? ["push"] : []),
        ],
    branches: isDeploymentAutomationKind(kind) && defaultBranch ? [defaultBranch] : [],
    pathIncludes: [],
    pathExcludes: [],
    agentId: "",
    environmentId,
    instructions:
      kind === "pull_request_review"
        ? "Review the pull request for correctness, security, tests, and maintainability. Publish concise, actionable findings."
        : kind === "deploy_function"
          ? "Synchronize the Function from this exact GitHub revision, publish a new immutable version, and deploy it."
          : kind === "deploy_web_app"
            ? "Synchronize the Web App from this exact GitHub revision, publish a new immutable version, and deploy it."
            : "",
    publishReview: kind === "pull_request_review",
  };
}

function normalizeBaseUrl(value: string | undefined): string {
  return String(value || "").replace(/\/+$/, "");
}

function errorMessages(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") {
    const message = value.trim();
    return message ? [prefix ? `${prefix}: ${message}` : message] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((entry) => errorMessages(entry, prefix));
  }
  if (!value || typeof value !== "object") return [];

  return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) => {
    const nextPrefix = key === "formErrors" || key === "fieldErrors" ? prefix : key;
    return errorMessages(entry, nextPrefix);
  });
}

async function responseJson(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => ({}));
  const body =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  if (!response.ok) {
    const [structuredError] = errorMessages(body.error);
    const detail = structuredError
      ? structuredError
      : typeof body?.message === "string"
        ? body.message
        : `Request failed with status ${response.status}.`;
    throw new Error(detail);
  }
  return body;
}

export function PlatformGitHubAutomations({
  apiBaseUrl,
  requestHeaders,
  scopeType,
  scopeId,
  repositoryFullName,
  agentOptions = [],
  environmentId = "",
  defaultBranch = "",
  automationKinds,
  onBindingsChange,
}: PlatformGitHubAutomationsProps) {
  const [bindings, setBindings] = useState<PlatformGitHubAutomationBinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKind, setSavingKind] = useState<PlatformGitHubAutomationKind | null>(null);
  const [activeKind, setActiveKind] = useState<PlatformGitHubAutomationKind | null>(null);
  const [draft, setDraft] = useState<PlatformGitHubAutomationConfiguration | null>(null);
  const [error, setError] = useState("");
  const baseUrl = normalizeBaseUrl(apiBaseUrl);
  const bindingsUrl = `${baseUrl}/github/automations/bindings`;

  const notifyBindings = useCallback(
    (next: PlatformGitHubAutomationBinding[]) => {
      setBindings(next);
      onBindingsChange?.(next);
    },
    [onBindingsChange],
  );

  const loadBindings = useCallback(async () => {
    if (!scopeId || !repositoryFullName) {
      notifyBindings([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ scopeType, scopeId, repositoryFullName });
      const response = await fetch(`${bindingsUrl}?${params.toString()}`, {
        headers: requestHeaders || undefined,
      });
      const payload = await responseJson(response);
      notifyBindings(
        Array.isArray(payload.data) ? (payload.data as PlatformGitHubAutomationBinding[]) : [],
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Failed to load GitHub automations.",
      );
    } finally {
      setLoading(false);
    }
  }, [bindingsUrl, notifyBindings, repositoryFullName, requestHeaders, scopeId, scopeType]);

  useEffect(() => {
    void loadBindings();
  }, [loadBindings]);

  const bindingByKind = useMemo(
    () => new Map(bindings.map((binding) => [binding.kind, binding])),
    [bindings],
  );
  const visibleAutomations = useMemo(() => {
    if (!automationKinds?.length) {
      return AUTOMATIONS.filter((automation) => !isDeploymentAutomationKind(automation.kind));
    }
    const visibleKinds = new Set(automationKinds);
    return AUTOMATIONS.filter((automation) => visibleKinds.has(automation.kind));
  }, [automationKinds]);

  function openAutomation(kind: PlatformGitHubAutomationKind) {
    const binding = bindingByKind.get(kind);
    setDraft(binding?.configuration || defaultConfiguration(kind, environmentId, defaultBranch));
    setActiveKind(kind);
    setError("");
  }

  async function saveBinding(
    kind: PlatformGitHubAutomationKind,
    configuration: PlatformGitHubAutomationConfiguration,
    enabled: boolean,
  ) {
    const existing = bindingByKind.get(kind);
    setSavingKind(kind);
    setError("");
    try {
      const response = await fetch(
        existing ? `${bindingsUrl}/${encodeURIComponent(existing.id)}` : bindingsUrl,
        {
          method: existing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json", ...(requestHeaders || {}) },
          body: JSON.stringify(
            existing
              ? { enabled, configuration }
              : {
                  scopeType,
                  scopeId,
                  repositoryFullName,
                  kind,
                  enabled,
                  configuration,
                },
          ),
        },
      );
      const payload = await responseJson(response);
      const saved = payload.binding as PlatformGitHubAutomationBinding;
      notifyBindings([...bindings.filter((binding) => binding.kind !== saved.kind), saved]);
      return saved;
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save GitHub automation.",
      );
      return null;
    } finally {
      setSavingKind(null);
    }
  }

  async function toggleAutomation(kind: PlatformGitHubAutomationKind, enabled: boolean) {
    const existing = bindingByKind.get(kind);
    const configuration =
      existing?.configuration || defaultConfiguration(kind, environmentId, defaultBranch);
    if (
      (kind === "pull_request_review" || isDeploymentAutomationKind(kind)) &&
      enabled &&
      !configuration.agentId
    ) {
      openAutomation(kind);
      return;
    }
    await saveBinding(kind, configuration, enabled);
  }

  const activeDefinition = visibleAutomations.find((automation) => automation.kind === activeKind);
  const activeBinding = activeKind ? bindingByKind.get(activeKind) : undefined;
  const agentSelectorOptions = agentOptions.map((option) => ({
    value: option.id,
    label: option.label,
    description: option.description,
  }));

  function setEvent(eventName: string, checked: boolean) {
    if (!draft) return;
    const nextEvents = checked
      ? [...new Set([...draft.events, eventName])]
      : draft.events.filter((event) => event !== eventName);
    setDraft({ ...draft, events: nextEvents });
  }

  const modalFooter =
    activeKind && draft ? (
      <>
        <PlatformSecondaryButton onClick={() => setActiveKind(null)}>
          Cancel
        </PlatformSecondaryButton>
        <PlatformPrimaryButton
          disabled={
            savingKind === activeKind ||
            ((activeKind === "pull_request_review" || isDeploymentAutomationKind(activeKind)) &&
              !draft.agentId)
          }
          onClick={async () => {
            if (await saveBinding(activeKind, draft, activeBinding?.enabled !== false)) {
              setActiveKind(null);
            }
          }}
        >
          {savingKind === activeKind ? "Saving…" : "Save automation"}
        </PlatformPrimaryButton>
      </>
    ) : null;

  return (
    <div className="platform-github-automations" data-github-automation-scope={scopeType}>
      <div className="platform-github-automations__heading">
        <strong>Automations</strong>
        <span>Run exact-revision actions when GitHub events occur.</span>
      </div>
      {error ? (
        <div className="platform-github-automations__error" role="alert">
          {error}
        </div>
      ) : null}
      {visibleAutomations.map((automation) => {
        const binding = bindingByKind.get(automation.kind);
        const Icon = automation.icon;
        return (
          <div className="platform-github-automations__row" key={automation.kind}>
            <div className="platform-github-automations__summary">
              <span className="platform-github-automations__icon">
                <Icon size={16} strokeWidth={1.8} />
              </span>
              <span className="platform-github-automations__copy">
                <strong>{automation.title}</strong>
                <span>{automation.description}</span>
              </span>
            </div>
            <div className="platform-github-automations__controls">
              <PlatformSecondaryButton
                size="small"
                aria-label={`Manage ${automation.title}`}
                onClick={() => openAutomation(automation.kind)}
              >
                Manage
              </PlatformSecondaryButton>
              <PlatformToggle
                checked={binding?.enabled === true}
                disabled={loading || savingKind === automation.kind}
                aria-label={`${binding?.enabled ? "Disable" : "Enable"} ${automation.title}`}
                onCheckedChange={(checked) => void toggleAutomation(automation.kind, checked)}
              />
            </div>
          </div>
        );
      })}

      <PlatformModal
        open={Boolean(activeKind && draft)}
        title={activeDefinition?.title || "GitHub automation"}
        description={activeDefinition?.description}
        size="medium"
        footer={modalFooter}
        onClose={() => setActiveKind(null)}
      >
        {activeKind && draft ? (
          <div className="platform-github-automation-configuration">
            <div className="platform-github-automation-configuration__section">
              <strong>Run when</strong>
              {(isDeploymentAutomationKind(activeKind)
                ? DEPLOY_EVENT_OPTIONS
                : PR_EVENT_OPTIONS
              ).map(([eventName, label]) => (
                <div
                  className="platform-github-automation-configuration__toggle-row"
                  key={eventName}
                >
                  <span>{label}</span>
                  <PlatformToggle
                    checked={draft.events.includes(eventName)}
                    aria-label={label}
                    onCheckedChange={(checked) => setEvent(eventName, checked)}
                  />
                </div>
              ))}
              {activeKind === "security_scan" ? (
                <div className="platform-github-automation-configuration__toggle-row">
                  <span>Protected branch pushed</span>
                  <PlatformToggle
                    checked={draft.events.includes("push")}
                    aria-label="Protected branch pushed"
                    onCheckedChange={(checked) => setEvent("push", checked)}
                  />
                </div>
              ) : null}
            </div>

            <label className="platform-github-automation-configuration__field">
              <span>Branches</span>
              <input
                value={draft.branches.join(", ")}
                placeholder="All branches"
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    branches: event.target.value
                      .split(",")
                      .map((value) => value.trim())
                      .filter(Boolean),
                  })
                }
              />
              <small>Comma-separated base branches. Leave empty to include every branch.</small>
            </label>

            {activeKind === "pull_request_review" ? (
              <>
                <div className="platform-github-automation-configuration__field">
                  <span>Reviewer Agent</span>
                  <PlatformSelector
                    fullWidth
                    value={draft.agentId}
                    ariaLabel="Reviewer Agent"
                    placeholder="Select an Agent"
                    options={agentSelectorOptions}
                    onValueChange={(agentId) => setDraft({ ...draft, agentId })}
                  />
                </div>
                <label className="platform-github-automation-configuration__field">
                  <span>Review instructions</span>
                  <textarea
                    rows={5}
                    value={draft.instructions}
                    onChange={(event) => setDraft({ ...draft, instructions: event.target.value })}
                  />
                </label>
                <div className="platform-github-automation-configuration__toggle-row is-standalone">
                  <span>Publish the completed review to GitHub</span>
                  <PlatformToggle
                    checked={draft.publishReview}
                    aria-label="Publish the completed review to GitHub"
                    onCheckedChange={(publishReview) => setDraft({ ...draft, publishReview })}
                  />
                </div>
              </>
            ) : isDeploymentAutomationKind(activeKind) ? (
              <>
                <div className="platform-github-automation-configuration__field">
                  <span>Deployment Agent</span>
                  <PlatformSelector
                    fullWidth
                    value={draft.agentId}
                    ariaLabel="Deployment Agent"
                    placeholder="Select an Agent"
                    options={agentSelectorOptions}
                    onValueChange={(agentId) => setDraft({ ...draft, agentId })}
                  />
                </div>
                <label className="platform-github-automation-configuration__field">
                  <span>Deployment instructions</span>
                  <textarea
                    rows={5}
                    value={draft.instructions}
                    onChange={(event) => setDraft({ ...draft, instructions: event.target.value })}
                  />
                </label>
              </>
            ) : null}
          </div>
        ) : null}
      </PlatformModal>
    </div>
  );
}
