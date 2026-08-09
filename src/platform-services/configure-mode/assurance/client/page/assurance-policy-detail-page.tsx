import {
  CheckCircle2,
  CircleDot,
  Clock3,
  Play,
  Save,
  ShieldCheck,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../platform-ui/components/composite/settings-section/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  usePlatformVersionNavigationGuard,
  type PlatformVersionNavigationGuardRegistrar,
} from "../../../../../platform-ui/components/composite/versioning/index.js";
import {
  PlatformPrimaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { PlatformSwitch } from "../../../../../platform-ui/components/ui/switch/index.js";
import {
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "../../../../../platform-ui/pages/details/index.js";
import type { AssuranceApi } from "../api/index.js";
import type {
  AssurancePolicy,
  AssurancePolicyDefinition,
  AssurancePolicyVersion,
  AssuranceRun,
  AssuranceWorkspaceOption,
} from "../domain/index.js";
import { AssurancePolicyAccessSettings } from "./assurance-policy-access-settings.js";

type AssurancePolicyTab = "general" | "gates" | "settings";

interface AssurancePolicyDetailPageProps {
  policy: AssurancePolicy;
  api: AssuranceApi;
  projects: readonly AssuranceWorkspaceOption[];
  workspaceTeams?: readonly unknown[];
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  onPolicyChange: (policy: AssurancePolicy) => void;
  onReload: () => Promise<void>;
  onRun: (policy: AssurancePolicy) => void;
  onOpenRun: (run: AssuranceRun) => void;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
}

interface AssuranceGateRow {
  id: string;
  kind: "test" | "evaluation" | "optimization";
  target: string;
  version: string;
  requirement: string;
}

function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Unknown"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}

function formatStatus(value: string): string {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function cloneDefinition(definition: AssurancePolicyDefinition): AssurancePolicyDefinition {
  return JSON.parse(JSON.stringify(definition)) as AssurancePolicyDefinition;
}

function parseDefinition(value: string): {
  definition: AssurancePolicyDefinition | null;
  error: string;
} {
  try {
    const source = JSON.parse(value) as Record<string, unknown>;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      return { definition: null, error: "The policy definition must be a JSON object." };
    }
    if (
      source.schemaVersion !== "computer_agents_assurance_policy_v1"
      || !Array.isArray(source.testGates)
      || !Array.isArray(source.evaluationGates)
      || !Array.isArray(source.optimizationGates)
    ) {
      return {
        definition: null,
        error: "Use the v1 schema with testGates, evaluationGates, and optimizationGates arrays.",
      };
    }
    const count = source.testGates.length
      + source.evaluationGates.length
      + source.optimizationGates.length;
    if (count === 0) {
      return { definition: null, error: "An Assurance Policy requires at least one gate." };
    }
    return { definition: source as unknown as AssurancePolicyDefinition, error: "" };
  } catch (error) {
    return {
      definition: null,
      error: error instanceof Error ? error.message : "The policy definition is invalid JSON.",
    };
  }
}

function usePortalTarget(id: string | undefined): HTMLElement | null {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!id || typeof document === "undefined") {
      setTarget(null);
      return undefined;
    }
    const resolve = () => setTarget(document.getElementById(id));
    resolve();
    const observer = new MutationObserver(resolve);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [id]);
  return target;
}

export function AssurancePolicyDetailPage({
  policy,
  api,
  projects,
  workspaceTeams = [],
  controlsPortalId,
  sectionControlsPortalId,
  onPolicyChange,
  onReload,
  onRun,
  onOpenRun,
  onNavigationGuardChange,
}: AssurancePolicyDetailPageProps) {
  const [activeTab, setActiveTab] = useState<AssurancePolicyTab>("general");
  const [name, setName] = useState(policy.name);
  const [description, setDescription] = useState(policy.description);
  const [status, setStatus] = useState(policy.status);
  const [projectId, setProjectId] = useState(policy.projectId || "");
  const [definitionJson, setDefinitionJson] = useState(
    JSON.stringify(cloneDefinition(policy.definition), null, 2),
  );
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [accessDetailOpen, setAccessDetailOpen] = useState(false);
  const portalTarget = usePortalTarget(controlsPortalId);
  const sectionControlsPortalTarget = usePortalTarget(sectionControlsPortalId);
  const parsedDefinition = useMemo(() => parseDefinition(definitionJson), [definitionJson]);

  useEffect(() => {
    setName(policy.name);
    setDescription(policy.description);
    setStatus(policy.status);
    setProjectId(policy.projectId || "");
    setDefinitionJson(JSON.stringify(cloneDefinition(policy.definition), null, 2));
    setError("");
    setAccessDetailOpen(false);
  }, [policy.id, policy.updatedAt]);

  useEffect(() => {
    if (activeTab !== "settings") setAccessDetailOpen(false);
  }, [activeTab]);

  const baselineDefinition = JSON.stringify(cloneDefinition(policy.definition), null, 2);
  const dirty = (
    name.trim() !== policy.name
    || description.trim() !== policy.description
    || status !== policy.status
    || projectId !== (policy.projectId || "")
    || definitionJson !== baselineDefinition
  );
  const discardUnsavedChanges = useCallback(() => {
    setName(policy.name);
    setDescription(policy.description);
    setStatus(policy.status);
    setProjectId(policy.projectId || "");
    setDefinitionJson(JSON.stringify(cloneDefinition(policy.definition), null, 2));
    setError("");
  }, [policy]);
  usePlatformVersionNavigationGuard({
    dirty,
    resourceId: policy.id,
    resourceName: policy.name,
    resourceType: "Assurance policy",
    onDiscard: discardUnsavedChanges,
    onNavigationGuardChange,
  });
  const versions = Array.isArray(policy.versions) ? policy.versions : [];
  const runs = Array.isArray(policy.runs) ? policy.runs : [];
  const terminalRuns = runs.filter((run) => ["passed", "failed", "cancelled"].includes(run.status));
  const passedRuns = runs.filter((run) => run.status === "passed").length;
  const blockedRuns = runs.filter((run) => run.status === "blocked").length;
  const gateRows = useMemo<AssuranceGateRow[]>(() => {
    const definition = parsedDefinition.definition || policy.definition;
    return [
      ...definition.testGates.map((gate) => ({
        id: gate.id,
        kind: "test" as const,
        target: gate.testPlanId,
        version: gate.versionId || "Published at evaluation",
        requirement: [
          gate.requireCommitSha ? "Exact commit" : "",
          gate.maxAgeHours ? `≤ ${gate.maxAgeHours}h old` : "",
        ].filter(Boolean).join(" · ") || "Passing run",
      })),
      ...definition.evaluationGates.map((gate) => ({
        id: gate.id,
        kind: "evaluation" as const,
        target: gate.evaluationId,
        version: gate.versionId || "Published at evaluation",
        requirement: `Score ≥ ${gate.minimumAverageScore} · Pass rate ≥ ${Math.round(gate.minimumPassRate * 100)}%`,
      })),
      ...definition.optimizationGates.map((gate) => ({
        id: gate.id,
        kind: "optimization" as const,
        target: gate.agentId,
        version: "Canonical job",
        requirement: [
          gate.requireTargetMet ? "Target met" : "",
          gate.requirePublishedCandidate ? "Candidate published" : "",
        ].filter(Boolean).join(" · ") || "Completed job",
      })),
    ];
  }, [parsedDefinition.definition, policy.definition]);
  const projectLabel = projects.find((project) => project.id === policy.projectId)?.name
    || "Unassigned";
  const publishedVersion = versions.find((version) => version.id === policy.publishedVersionId);

  async function savePolicy() {
    if (!dirty || !parsedDefinition.definition || busyAction) return;
    setBusyAction("save");
    setError("");
    try {
      const version = await api.createVersion(policy.id, {
        label: `Version ${versions.length + 1}`,
        description: "Saved and published from the Assurance service.",
        snapshot: {
          name: name.trim(),
          description: description.trim(),
          status,
          projectId: projectId || null,
          definition: parsedDefinition.definition,
          metadata: policy.metadata,
        },
      });
      await api.publishVersion(policy.id, version.id);
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save the policy.");
    } finally {
      setBusyAction("");
    }
  }

  async function publishVersion(version: AssurancePolicyVersion) {
    if (busyAction || version.id === policy.publishedVersionId) return;
    setBusyAction(`publish:${version.id}`);
    setError("");
    try {
      await api.publishVersion(policy.id, version.id);
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to publish the version.");
    } finally {
      setBusyAction("");
    }
  }

  const gateColumns = useMemo<PlatformDataTableColumn<AssuranceGateRow>[]>(
    () => [
      {
        id: "gate",
        header: "Gate",
        accessor: "id",
        width: "minmax(220px, 1fr)",
        cell: ({ row }) => (
          <span className="assurance-table-identity">
            <ShieldCheck width={15} height={15} aria-hidden="true" />
            <span><strong>{row.id}</strong><small>{formatStatus(row.kind)}</small></span>
          </span>
        ),
      },
      {
        id: "target",
        header: "Canonical target",
        accessor: "target",
        width: "minmax(220px, 1fr)",
      },
      {
        id: "version",
        header: "Version",
        accessor: "version",
        width: "minmax(190px, .8fr)",
      },
      {
        id: "requirement",
        header: "Requirement",
        accessor: "requirement",
        width: "minmax(230px, 1fr)",
      },
    ],
    [],
  );
  const versionColumns = useMemo<PlatformDataTableColumn<AssurancePolicyVersion>[]>(
    () => [
      {
        id: "version",
        header: "Version",
        accessor: "version",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(170px, .7fr)",
        cell: ({ row }) => (
          <span className="assurance-version-label">
            v{row.version}
            {row.id === policy.publishedVersionId ? <em>Published</em> : null}
          </span>
        ),
      },
      {
        id: "label",
        header: "Label",
        accessor: "label",
        width: "minmax(200px, 1fr)",
      },
      {
        id: "fingerprint",
        header: "Policy fingerprint",
        accessor: "policyFingerprint",
        width: "minmax(250px, 1.25fr)",
        cell: ({ row }) => <code className="assurance-mono">{row.policyFingerprint}</code>,
      },
      {
        id: "created",
        header: "Created",
        accessor: (row) => Date.parse(row.createdAt) || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(180px, .8fr)",
        cell: ({ row }) => formatTimestamp(row.createdAt),
      },
    ],
    [policy.publishedVersionId],
  );
  const runColumns = useMemo<PlatformDataTableColumn<AssuranceRun>[]>(
    () => [
      {
        id: "run",
        header: "Run",
        accessor: "id",
        width: "minmax(230px, 1.1fr)",
        cell: ({ row }) => (
          <span className="assurance-table-identity">
            <CircleDot width={15} height={15} aria-hidden="true" />
            <span><strong>{row.id}</strong><small>{formatTimestamp(row.createdAt)}</small></span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Decision",
        accessor: "status",
        sortable: true,
        width: "minmax(150px, .65fr)",
        cell: ({ row }) => (
          <span className={`assurance-status-label is-${row.status}`}>
            {formatStatus(row.status)}
          </span>
        ),
      },
      {
        id: "release",
        header: "Release",
        accessor: (row) => row.releaseId || "",
        width: "minmax(150px, .7fr)",
        cell: ({ row }) => row.releaseId || "—",
      },
      {
        id: "commit",
        header: "Commit",
        accessor: (row) => row.commitSha || "",
        width: "minmax(150px, .7fr)",
        cell: ({ row }) => (
          <code className="assurance-mono">{row.commitSha?.slice(0, 12) || "—"}</code>
        ),
      },
    ],
    [],
  );

  const analyticsRuns = runs.slice().reverse();
  const policyPassRate = terminalRuns.length > 0
    ? Math.round((passedRuns / terminalRuns.length) * 100)
    : 0;
  const policyAnalytics = {
    ariaLabel: "Assurance Policy analytics",
    metrics: [
      {
        id: "pass-rate",
        label: "Pass Rate",
        value: terminalRuns.length > 0 ? `${policyPassRate}%` : "—",
        color: "#8fc4ff",
      },
      {
        id: "gates",
        label: "Gates",
        value: String(gateRows.length),
        color: "#7657ff",
      },
      {
        id: "runs",
        label: "Runs",
        value: String(runs.length),
        color: "#7effff",
      },
      {
        id: "blocked",
        label: "Awaiting Approval",
        value: String(blockedRuns),
        color: "#9ff6ce",
      },
    ],
    labels: analyticsRuns.map((_run, index) => `Run ${index + 1}`),
    hasData: analyticsRuns.length > 0,
    series: [
      {
        id: "outcome",
        label: "Decision",
        values: analyticsRuns.map((run) => run.status === "passed" ? 100 : 0),
        color: "#8fc4ff",
        valueKind: "percent" as const,
      },
      {
        id: "evaluated-gates",
        label: "Evaluated gates",
        values: analyticsRuns.map((run) => (
          Array.isArray(run.evidence?.gates) ? run.evidence.gates.length : 0
        )),
        color: "#9ff6ce",
        axis: "secondary" as const,
      },
    ],
  };
  const properties = (
    <PlatformServiceDetailPropertyList>
      <PlatformServiceDetailProperty label="Status">
        <span className={`assurance-status-label is-${policy.status}`}>
          {formatStatus(policy.status)}
        </span>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Project">
        {projectLabel}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Gates">
        {gateRows.length}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Approval">
        {formatStatus(policy.definition.approval.mode)}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Published">
        {publishedVersion ? `v${publishedVersion.version}` : "None"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Updated">
        {formatTimestamp(policy.updatedAt)}
      </PlatformServiceDetailProperty>
      <PlatformPrimaryButton
        size="small"
        fullWidth
        className="assurance-detail-run-button"
        disabled={Boolean(busyAction) || policy.status === "archived" || !policy.publishedVersionId}
        onClick={() => onRun(policy)}
      >
        <Play width={14} height={14} aria-hidden="true" />
        Run Assurance
      </PlatformPrimaryButton>
    </PlatformServiceDetailPropertyList>
  );
  const headerActions = (
    <PlatformPrimaryButton
      size="small"
      disabled={Boolean(busyAction) || !dirty || !parsedDefinition.definition}
      onClick={() => void savePolicy()}
    >
      <Save width={14} height={14} aria-hidden="true" />
      {busyAction === "save" ? "Saving…" : "Save Changes"}
    </PlatformPrimaryButton>
  );
  const sectionSwitch = (
    <PlatformSwitch
      className="assurance-detail-header-switch"
      value={activeTab}
      options={[
        { value: "general", label: "General" },
        { value: "gates", label: "Gates" },
        { value: "settings", label: "Settings" },
      ]}
      onValueChange={(nextTab) => setActiveTab(
        nextTab === "gates"
          ? "gates"
          : nextTab === "settings"
            ? "settings"
            : "general",
      )}
      ariaLabel="Assurance Policy section"
    />
  );

  return (
    <>
      {portalTarget ? createPortal(headerActions, portalTarget) : null}
      {sectionControlsPortalTarget
        ? createPortal(sectionSwitch, sectionControlsPortalTarget)
        : null}
      <PlatformServiceDetailPage
        properties={properties}
        ariaLabel={`${policy.name} Assurance Policy`}
        sidebarAriaLabel="Assurance Policy information"
        className="assurance-detail-page"
        contentClassName="assurance-detail-content"
        sidebarClassName="assurance-detail-sidebar"
        propertiesCardClassName="assurance-detail-sidebar-card"
        sidebarCollapsed={accessDetailOpen}
      >
        {error || parsedDefinition.error ? (
          <PlatformUiCard as="div" className="assurance-inline-error" role="alert">
            {error || `Policy JSON: ${parsedDefinition.error}`}
          </PlatformUiCard>
        ) : null}

        {activeTab === "general" ? (
          <div className="assurance-detail-stack">
            <PlatformAnalyticsSection
              variant="default"
              title="Analytics"
              analytics={policyAnalytics}
              className="assurance-detail-analytics"
            />
            <PlatformDataTable
              rows={runs}
              columns={runColumns}
              getRowId={(run) => run.id}
              ariaLabel="Assurance Runs"
              variant="minimalistic-ui"
              surface="plain"
              sticky={false}
              pagination={{ defaultValue: { pageIndex: 0, pageSize: 20 } }}
              toolbar={{
                title: "Run History",
                search: {
                  placeholder: "Search Assurance Runs",
                  getSearchText: (run) =>
                    `${run.id} ${run.status} ${run.releaseId || ""} ${run.commitSha || ""}`,
                },
                primaryAction: {
                  label: "Run Assurance",
                  icon: Play,
                  onClick: () => onRun(policy),
                  disabled: policy.status === "archived" || !policy.publishedVersionId,
                },
              }}
              onRowActivate={onOpenRun}
              getRowAriaLabel={(run) => `Open Assurance Run ${run.id}`}
              emptyState={(
                <PlatformEmptyState
                  icon={Clock3}
                  title="No Assurance Runs yet"
                  description="Evaluate canonical delivery evidence against the published policy."
                  primaryAction={{ label: "Run Assurance", onClick: () => onRun(policy) }}
                />
              )}
            />
          </div>
        ) : null}

        {activeTab === "gates" ? (
          <div className="assurance-detail-stack">
            <PlatformSettingsSectionList>
              <PlatformSettingsSection
                title="Release gates"
                description="Every run resolves these gates against canonical Test, Evaluation, and Agent Optimization rows."
                bodyPresentation="flush"
              >
                <PlatformDataTable
                  rows={gateRows}
                  columns={gateColumns}
                  getRowId={(gate) => gate.id}
                  ariaLabel="Assurance release gates"
                  variant="minimalistic-ui"
                  surface="plain"
                  sticky={false}
                  pagination={false}
                  emptyState="At least one release gate is required."
                />
              </PlatformSettingsSection>

              <PlatformSettingsSection
                title="Strict policy definition"
                description="Advanced versioned contract. Unknown fields are rejected by the control API."
              >
                <textarea
                  className="assurance-definition-editor"
                  aria-label="Strict Assurance Policy definition JSON"
                  spellCheck={false}
                  value={definitionJson}
                  onChange={(event) => setDefinitionJson(event.currentTarget.value)}
                />
              </PlatformSettingsSection>
            </PlatformSettingsSectionList>
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <div className="assurance-detail-stack">
            <PlatformSettingsSectionList>
              <PlatformSettingsSection
                title="Properties"
                description="Bind this versioned release contract to the project it protects."
              >
                <div className="assurance-form-grid">
                  <label className="assurance-form-field">
                    <span>Name</span>
                    <input value={name} onChange={(event) => setName(event.currentTarget.value)} />
                  </label>
                  <div className="assurance-form-field">
                    <span>Status</span>
                    <PlatformSelector
                      value={status}
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "active", label: "Active" },
                        { value: "archived", label: "Archived" },
                      ]}
                      fullWidth
                      ariaLabel="Assurance Policy status"
                      onValueChange={setStatus}
                    />
                  </div>
                  <label className="assurance-form-field is-span-2">
                    <span>Description</span>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.currentTarget.value)}
                    />
                  </label>
                  <div className="assurance-form-field is-span-2">
                    <span>Project</span>
                    <PlatformSelector
                      value={projectId}
                      options={[
                        { value: "", label: "Unassigned" },
                        ...projects.map((project) => ({
                          value: project.id,
                          label: project.name,
                          description: project.description,
                        })),
                      ]}
                      fullWidth
                      ariaLabel="Assurance Policy project"
                      onValueChange={setProjectId}
                    />
                  </div>
                </div>
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Version history"
                description="Save Changes creates and publishes a new immutable policy snapshot."
                bodyPresentation="flush"
              >
                <PlatformDataTable
                  rows={versions}
                  columns={versionColumns}
                  getRowId={(version) => version.id}
                  ariaLabel="Assurance Policy versions"
                  variant="minimalistic-ui"
                  surface="plain"
                  sticky={false}
                  pagination={false}
                  getRowActions={(version) => [{
                    id: "publish",
                    label: version.id === policy.publishedVersionId ? "Published" : "Publish",
                    icon: CheckCircle2,
                    disabled: version.id === policy.publishedVersionId || Boolean(busyAction),
                    onSelect: () => void publishVersion(version),
                  }]}
                  emptyState="No saved policy versions."
                />
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Trust boundary"
                description="Assurance decisions are derived from version-pinned authoritative evidence."
              >
                <dl className="assurance-evidence-identity">
                  <div><dt>Policy</dt><dd>Immutable version</dd></div>
                  <div><dt>Evidence</dt><dd>Authoritative services</dd></div>
                  <div><dt>Decision</dt><dd>Server derived</dd></div>
                  <div><dt>Approval</dt><dd>Fingerprint bound</dd></div>
                </dl>
              </PlatformSettingsSection>
            </PlatformSettingsSectionList>
            <AssurancePolicyAccessSettings
              policy={policy}
              api={api}
              workspaceTeams={workspaceTeams}
              onPolicyChange={onPolicyChange}
              onPermissionDetailOpenChange={setAccessDetailOpen}
            />
          </div>
        ) : null}
      </PlatformServiceDetailPage>
    </>
  );
}
