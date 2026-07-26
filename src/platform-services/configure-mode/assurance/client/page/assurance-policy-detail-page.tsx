import {
  BadgeCheck,
  CheckCircle2,
  CircleDot,
  Clock3,
  Play,
  Save,
  ShieldCheck,
} from "lucide-react";
import { createPortal } from "react-dom";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformDetailSidebarSection } from "../../../../../platform-ui/components/composite/detail-sidebar/index.js";
import {
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../platform-ui/components/composite/settings-section/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type { AssuranceApi } from "../api/index.js";
import type {
  AssurancePolicy,
  AssurancePolicyDefinition,
  AssurancePolicyVersion,
  AssuranceRun,
  AssuranceWorkspaceOption,
} from "../domain/index.js";
import { AssurancePolicyAccessSettings } from "./assurance-policy-access-settings.js";

type AssurancePolicyTab = "policy" | "runs" | "settings";

interface AssurancePolicyDetailPageProps {
  policy: AssurancePolicy;
  api: AssuranceApi;
  projects: readonly AssuranceWorkspaceOption[];
  workspaceTeams?: readonly unknown[];
  controlsPortalId?: string;
  onPolicyChange: (policy: AssurancePolicy) => void;
  onReload: () => Promise<void>;
  onRun: (policy: AssurancePolicy) => void;
  onOpenRun: (run: AssuranceRun) => void;
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

function PropertyRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="assurance-sidebar-property">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

export function AssurancePolicyDetailPage({
  policy,
  api,
  projects,
  workspaceTeams = [],
  controlsPortalId,
  onPolicyChange,
  onReload,
  onRun,
  onOpenRun,
}: AssurancePolicyDetailPageProps) {
  const [activeTab, setActiveTab] = useState<AssurancePolicyTab>("policy");
  const [name, setName] = useState(policy.name);
  const [description, setDescription] = useState(policy.description);
  const [status, setStatus] = useState(policy.status);
  const [projectId, setProjectId] = useState(policy.projectId || "");
  const [definitionJson, setDefinitionJson] = useState(
    JSON.stringify(cloneDefinition(policy.definition), null, 2),
  );
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const portalTarget = usePortalTarget(controlsPortalId);
  const parsedDefinition = useMemo(() => parseDefinition(definitionJson), [definitionJson]);

  useEffect(() => {
    setName(policy.name);
    setDescription(policy.description);
    setStatus(policy.status);
    setProjectId(policy.projectId || "");
    setDefinitionJson(JSON.stringify(cloneDefinition(policy.definition), null, 2));
    setError("");
  }, [policy.id, policy.updatedAt]);

  const baselineDefinition = JSON.stringify(cloneDefinition(policy.definition), null, 2);
  const dirty = (
    name.trim() !== policy.name
    || description.trim() !== policy.description
    || status !== policy.status
    || projectId !== (policy.projectId || "")
    || definitionJson !== baselineDefinition
  );
  const versions = Array.isArray(policy.versions) ? policy.versions : [];
  const runs = Array.isArray(policy.runs) ? policy.runs : [];
  const lastRun = runs[0] || null;
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

  const headerActions = (
    <>
      <PlatformSecondaryButton
        size="small"
        disabled={Boolean(busyAction) || policy.status === "archived" || !policy.publishedVersionId}
        onClick={() => onRun(policy)}
      >
        <Play width={14} height={14} aria-hidden="true" />
        Run Assurance
      </PlatformSecondaryButton>
      <PlatformPrimaryButton
        size="small"
        disabled={Boolean(busyAction) || !dirty || !parsedDefinition.definition}
        onClick={() => void savePolicy()}
      >
        <Save width={14} height={14} aria-hidden="true" />
        {busyAction === "save" ? "Saving…" : "Save Changes"}
      </PlatformPrimaryButton>
    </>
  );

  return (
    <>
      {portalTarget ? createPortal(headerActions, portalTarget) : null}
      <ResourceDetailPage<AssurancePolicyTab>
        tabs={[
          { id: "policy", label: "Policy" },
          { id: "runs", label: "Runs" },
          { id: "settings", label: "Settings" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarAutoCollapseTabs={["settings"]}
        sidebar={(
          <>
            <PlatformDetailSidebarSection title="Details">
              <div className="assurance-sidebar-properties">
                <PropertyRow label="Status">
                  <span className={`assurance-status-label is-${policy.status}`}>
                    {formatStatus(policy.status)}
                  </span>
                </PropertyRow>
                <PropertyRow label="Project">{projectLabel}</PropertyRow>
                <PropertyRow label="Gates">{gateRows.length}</PropertyRow>
                <PropertyRow label="Approval">
                  {formatStatus(policy.definition.approval.mode)}
                </PropertyRow>
                <PropertyRow label="Published version">
                  {publishedVersion ? `v${publishedVersion.version}` : "None"}
                </PropertyRow>
                <PropertyRow label="Updated">{formatTimestamp(policy.updatedAt)}</PropertyRow>
              </div>
            </PlatformDetailSidebarSection>
            <PlatformDetailSidebarSection title="Trust boundary">
              <div className="assurance-sidebar-properties">
                <PropertyRow label="Policy">Immutable version</PropertyRow>
                <PropertyRow label="Evidence">Authoritative services</PropertyRow>
                <PropertyRow label="Decision">Server derived</PropertyRow>
                <PropertyRow label="Approval">Fingerprint bound</PropertyRow>
              </div>
            </PlatformDetailSidebarSection>
          </>
        )}
        ariaLabel={`${policy.name} Assurance Policy`}
        tabAriaLabel="Assurance Policy sections"
        sidebarAriaLabel="Assurance Policy information"
        className="assurance-detail-page"
        tabBarClassName="assurance-detail-tabs"
        contentClassName="assurance-detail-content"
        sidebarClassName="assurance-detail-sidebar"
      >
        {error || parsedDefinition.error ? (
          <PlatformUiCard as="div" className="assurance-inline-error" role="alert">
            {error || `Policy JSON: ${parsedDefinition.error}`}
          </PlatformUiCard>
        ) : null}

        {activeTab === "policy" ? (
          <div className="assurance-detail-stack">
            <div className="assurance-kpi-grid">
              <PlatformUiCard as="article" className="assurance-kpi-card">
                <span>Release gates</span><strong>{gateRows.length}</strong>
                <small>Version-pinned verification contracts</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="assurance-kpi-card is-success">
                <span>Passed runs</span><strong>{passedRuns}</strong>
                <small>{terminalRuns.length} terminal decisions</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="assurance-kpi-card is-warning">
                <span>Awaiting approval</span><strong>{blockedRuns}</strong>
                <small>Human decisions required</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="assurance-kpi-card">
                <span>Last decision</span>
                <strong>{lastRun ? formatStatus(lastRun.status) : "Never"}</strong>
                <small>{lastRun ? formatTimestamp(lastRun.createdAt) : "No evidence evaluated"}</small>
              </PlatformUiCard>
            </div>

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
            </PlatformSettingsSectionList>
          </div>
        ) : null}

        {activeTab === "runs" ? (
          <div className="assurance-detail-stack">
            <div className="assurance-kpi-grid">
              <PlatformUiCard as="article" className="assurance-kpi-card">
                <span>Total runs</span><strong>{runs.length}</strong>
                <small>Project- and version-bound decisions</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="assurance-kpi-card is-success">
                <span>Passed</span><strong>{passedRuns}</strong>
                <small>Eligible release evidence</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="assurance-kpi-card is-warning">
                <span>Blocked</span><strong>{blockedRuns}</strong>
                <small>Awaiting fingerprint-bound approval</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="assurance-kpi-card is-danger">
                <span>Failed</span>
                <strong>{runs.filter((run) => run.status === "failed").length}</strong>
                <small>Failed technical gates</small>
              </PlatformUiCard>
            </div>
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

        {activeTab === "settings" ? (
          <AssurancePolicyAccessSettings
            policy={policy}
            api={api}
            workspaceTeams={workspaceTeams}
            onPolicyChange={onPolicyChange}
          />
        ) : null}
      </ResourceDetailPage>
    </>
  );
}
