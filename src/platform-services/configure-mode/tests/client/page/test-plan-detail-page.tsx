import {
  CheckCircle2,
  CircleDot,
  Clock3,
  FlaskConical,
  Play,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import {
  createPortal,
} from "react-dom";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformDetailSidebarSection,
} from "../../../../../platform-ui/components/composite/detail-sidebar/index.js";
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
import type { TestsApi } from "../api/index.js";
import type {
  TestCaseDefinition,
  TestPlan,
  TestPlanDefinition,
  TestPlanVersion,
  TestRun,
  TestWorkspaceResourceOption,
} from "../domain/index.js";
import { TestPlanAccessSettings } from "./test-plan-access-settings.js";

type TestPlanTab = "plan" | "runs" | "settings";

interface TestPlanDetailPageProps {
  plan: TestPlan;
  api: TestsApi;
  projects: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  workspaceTeams?: readonly unknown[];
  controlsPortalId?: string;
  onPlanChange: (plan: TestPlan) => void;
  onReload: () => Promise<void>;
  onRun: (plan: TestPlan) => void;
  onOpenRun: (run: TestRun) => void;
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

function formatDuration(value: number | null | undefined): string {
  const duration = Number(value);
  if (!Number.isFinite(duration) || duration <= 0) return "—";
  if (duration < 1_000) return `${duration} ms`;
  if (duration < 60_000) return `${(duration / 1_000).toFixed(1)} s`;
  return `${Math.floor(duration / 60_000)}m ${Math.round((duration % 60_000) / 1_000)}s`;
}

function formatStatus(value: string): string {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function cloneDefinition(definition: TestPlanDefinition): TestPlanDefinition {
  return JSON.parse(JSON.stringify(definition)) as TestPlanDefinition;
}

function readParsedDefinition(
  value: string,
): { definition: TestPlanDefinition | null; error: string } {
  try {
    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { definition: null, error: "The definition must be a JSON object." };
    }
    if (!Array.isArray(parsed.cases)) {
      return { definition: null, error: "The definition must contain a cases array." };
    }
    return { definition: parsed as TestPlanDefinition, error: "" };
  } catch (error) {
    return {
      definition: null,
      error: error instanceof Error ? error.message : "The definition is not valid JSON.",
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
    <div className="tests-sidebar-property">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

export function TestPlanDetailPage({
  plan,
  api,
  projects,
  environments,
  workspaceTeams = [],
  controlsPortalId,
  onPlanChange,
  onReload,
  onRun,
  onOpenRun,
}: TestPlanDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TestPlanTab>("plan");
  const [name, setName] = useState(plan.name);
  const [description, setDescription] = useState(plan.description);
  const [status, setStatus] = useState(plan.status);
  const [projectId, setProjectId] = useState(plan.projectId || "");
  const [environmentId, setEnvironmentId] = useState(plan.defaultEnvironmentId || "");
  const [definitionJson, setDefinitionJson] = useState(
    JSON.stringify(cloneDefinition(plan.definition), null, 2),
  );
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const portalTarget = usePortalTarget(controlsPortalId);
  const parsedDefinition = useMemo(
    () => readParsedDefinition(definitionJson),
    [definitionJson],
  );

  useEffect(() => {
    setName(plan.name);
    setDescription(plan.description);
    setStatus(plan.status);
    setProjectId(plan.projectId || "");
    setEnvironmentId(plan.defaultEnvironmentId || "");
    setDefinitionJson(JSON.stringify(cloneDefinition(plan.definition), null, 2));
    setError("");
  }, [plan.id, plan.updatedAt]);

  const dirty = (
    name.trim() !== plan.name
    || description.trim() !== plan.description
    || status !== plan.status
    || projectId !== (plan.projectId || "")
    || environmentId !== (plan.defaultEnvironmentId || "")
    || definitionJson !== JSON.stringify(cloneDefinition(plan.definition), null, 2)
  );
  const currentCases = parsedDefinition.definition?.cases || plan.definition.cases || [];
  const runs = Array.isArray(plan.runs) ? plan.runs : [];
  const versions = Array.isArray(plan.versions) ? plan.versions : [];
  const lastRun = runs[0] || null;
  const terminalRuns = runs.filter((run) => (
    ["passed", "failed", "completed_with_errors", "cancelled"].includes(run.status)
  ));
  const passedRuns = terminalRuns.filter((run) => run.status === "passed").length;
  const passRate = terminalRuns.length > 0
    ? Math.round((passedRuns / terminalRuns.length) * 100)
    : 0;
  const projectLabel = projects.find((project) => project.id === plan.projectId)?.name || "Unassigned";
  const environmentLabel = environments.find(
    (environment) => environment.id === plan.defaultEnvironmentId,
  )?.name || "Select when running";

  async function savePlan() {
    if (!dirty || !parsedDefinition.definition || busyAction) return;
    setBusyAction("save");
    setError("");
    try {
      const updated = await api.updatePlan(plan.id, {
        name: name.trim(),
        description: description.trim(),
        status,
        projectId: projectId || null,
        targetType: projectId ? "project" : plan.targetType,
        targetId: projectId || plan.targetId,
        defaultEnvironmentId: environmentId || null,
        definition: parsedDefinition.definition,
      } as Partial<TestPlan>);
      onPlanChange({
        ...plan,
        ...updated,
        versions: plan.versions,
        runs: plan.runs,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to save the test plan.");
    } finally {
      setBusyAction("");
    }
  }

  async function createVersion() {
    if (dirty || busyAction) return;
    setBusyAction("version");
    setError("");
    try {
      await api.createVersion(plan.id, {
        label: `Version ${versions.length + 1}`,
        description: "Saved from the Tests service.",
      });
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to create a version.");
    } finally {
      setBusyAction("");
    }
  }

  async function publishVersion(version: TestPlanVersion) {
    if (busyAction || version.id === plan.publishedVersionId) return;
    setBusyAction(`publish:${version.id}`);
    setError("");
    try {
      await api.publishVersion(plan.id, version.id);
      await onReload();
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to publish the version.");
    } finally {
      setBusyAction("");
    }
  }

  function removeCase(testCase: TestCaseDefinition) {
    const source = parsedDefinition.definition;
    if (!source) return;
    setDefinitionJson(JSON.stringify({
      ...source,
      cases: source.cases.filter((candidate) => candidate.id !== testCase.id),
    }, null, 2));
  }

  function addCase() {
    const source = parsedDefinition.definition;
    if (!source) return;
    let ordinal = source.cases.length + 1;
    let id = `test-case-${ordinal}`;
    const ids = new Set(source.cases.map((testCase) => testCase.id));
    while (ids.has(id)) {
      ordinal += 1;
      id = `test-case-${ordinal}`;
    }
    setDefinitionJson(JSON.stringify({
      ...source,
      cases: [
        ...source.cases,
        {
          id,
          name: `Test case ${ordinal}`,
          description: "",
          kind: "command",
          command: "true",
          workingDirectory: "",
          timeoutMs: 300_000,
          retries: 0,
          env: {},
          secretRefs: [],
          request: {},
          assertions: [],
          agentId: "",
          enabled: true,
          tags: [],
        },
      ],
    }, null, 2));
  }

  const caseColumns = useMemo<PlatformDataTableColumn<TestCaseDefinition>[]>(
    () => [
      {
        id: "name",
        header: "Case",
        accessor: "name",
        sortable: true,
        width: "minmax(220px, 1.25fr)",
        cell: ({ row }) => (
          <span className="tests-table-identity">
            <FlaskConical width={15} height={15} aria-hidden="true" />
            <span>
              <strong>{row.name}</strong>
              <small>{row.id}</small>
            </span>
          </span>
        ),
      },
      {
        id: "kind",
        header: "Type",
        accessor: "kind",
        sortable: true,
        width: "minmax(120px, .55fr)",
        cell: ({ row }) => formatStatus(row.kind),
      },
      {
        id: "timeout",
        header: "Timeout",
        accessor: "timeoutMs",
        sortable: true,
        width: "minmax(110px, .5fr)",
        cell: ({ row }) => formatDuration(row.timeoutMs),
      },
      {
        id: "status",
        header: "State",
        accessor: (row) => row.enabled ? "Enabled" : "Disabled",
        sortable: true,
        width: "minmax(110px, .5fr)",
      },
    ],
    [],
  );
  const runColumns = useMemo<PlatformDataTableColumn<TestRun>[]>(
    () => [
      {
        id: "run",
        header: "Run",
        accessor: "id",
        width: "minmax(220px, 1.15fr)",
        cell: ({ row }) => (
          <span className="tests-table-identity">
            <CircleDot width={15} height={15} aria-hidden="true" />
            <span>
              <strong>{row.id}</strong>
              <small>{formatTimestamp(row.createdAt)}</small>
            </span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(150px, .7fr)",
        cell: ({ row }) => (
          <span className={`tests-status-label is-${row.status}`}>{formatStatus(row.status)}</span>
        ),
      },
      {
        id: "results",
        header: "Results",
        accessor: (row) => row.passedCount,
        width: "minmax(140px, .65fr)",
        cell: ({ row }) => `${row.passedCount} passed · ${row.failedCount + row.errorCount} failed`,
      },
      {
        id: "duration",
        header: "Duration",
        accessor: (row) => row.durationMs || 0,
        sortable: true,
        width: "minmax(110px, .5fr)",
        cell: ({ row }) => formatDuration(row.durationMs),
      },
    ],
    [],
  );
  const versionColumns = useMemo<PlatformDataTableColumn<TestPlanVersion>[]>(
    () => [
      {
        id: "version",
        header: "Version",
        accessor: "version",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(170px, .8fr)",
        cell: ({ row }) => (
          <span className="tests-version-label">
            v{row.version}
            {row.id === plan.publishedVersionId ? <em>Published</em> : null}
          </span>
        ),
      },
      {
        id: "label",
        header: "Label",
        accessor: "label",
        width: "minmax(190px, 1fr)",
      },
      {
        id: "created",
        header: "Created",
        accessor: (row) => Date.parse(row.createdAt) || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(180px, .85fr)",
        cell: ({ row }) => formatTimestamp(row.createdAt),
      },
    ],
    [plan.publishedVersionId],
  );

  const headerActions = (
    <>
      <PlatformSecondaryButton
        size="small"
        disabled={Boolean(busyAction) || status === "archived" || currentCases.length === 0}
        onClick={() => onRun(plan)}
      >
        <Play width={14} height={14} aria-hidden="true" />
        Run Tests
      </PlatformSecondaryButton>
      <PlatformPrimaryButton
        size="small"
        disabled={Boolean(busyAction) || !dirty || !parsedDefinition.definition}
        onClick={() => void savePlan()}
      >
        <Save width={14} height={14} aria-hidden="true" />
        {busyAction === "save" ? "Saving…" : "Save Changes"}
      </PlatformPrimaryButton>
    </>
  );

  return (
    <>
      {portalTarget ? createPortal(headerActions, portalTarget) : null}
      <ResourceDetailPage<TestPlanTab>
        tabs={[
          { id: "plan", label: "Test Plan" },
          { id: "runs", label: "Runs" },
          { id: "settings", label: "Settings" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebarAutoCollapseTabs={["settings"]}
        sidebar={(
          <>
            <PlatformDetailSidebarSection title="Details">
              <div className="tests-sidebar-properties">
                <PropertyRow label="Status">
                  <span className={`tests-status-label is-${plan.status}`}>
                    {formatStatus(plan.status)}
                  </span>
                </PropertyRow>
                <PropertyRow label="Project">{projectLabel}</PropertyRow>
                <PropertyRow label="Environment">{environmentLabel}</PropertyRow>
                <PropertyRow label="Cases">{plan.caseCount}</PropertyRow>
                <PropertyRow label="Published version">
                  {versions.find((version) => version.id === plan.publishedVersionId)
                    ? `v${versions.find((version) => version.id === plan.publishedVersionId)?.version}`
                    : "None"}
                </PropertyRow>
                <PropertyRow label="Updated">{formatTimestamp(plan.updatedAt)}</PropertyRow>
              </div>
            </PlatformDetailSidebarSection>
            <PlatformDetailSidebarSection title="Safety boundary">
              <div className="tests-sidebar-properties">
                <PropertyRow label="Execution">Computer Agents environment</PropertyRow>
                <PropertyRow label="Definition">Immutable published snapshot</PropertyRow>
                <PropertyRow label="Secrets">References only · redacted</PropertyRow>
                <PropertyRow label="Evidence">Server fingerprinted</PropertyRow>
              </div>
            </PlatformDetailSidebarSection>
          </>
        )}
        ariaLabel={`${plan.name} test plan`}
        tabAriaLabel="Test plan sections"
        sidebarAriaLabel="Test plan information"
        className="tests-detail-page"
        tabBarClassName="tests-detail-tabs"
        contentClassName="tests-detail-content"
        sidebarClassName="tests-detail-sidebar"
      >
        {error || parsedDefinition.error ? (
          <PlatformUiCard as="div" className="tests-inline-error" role="alert">
            {error || `Definition JSON: ${parsedDefinition.error}`}
          </PlatformUiCard>
        ) : null}

        {activeTab === "plan" ? (
          <div className="tests-detail-stack">
            <div className="tests-kpi-grid">
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Enabled cases</span>
                <strong>{currentCases.filter((testCase) => testCase.enabled !== false).length}</strong>
                <small>{currentCases.length} total definitions</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Runs</span>
                <strong>{runs.length}</strong>
                <small>{lastRun ? `Last ${formatStatus(lastRun.status)}` : "Never run"}</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Pass rate</span>
                <strong>{terminalRuns.length ? `${passRate}%` : "—"}</strong>
                <small>{terminalRuns.length} completed runs</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Evidence</span>
                <strong>{lastRun?.evidence?.fingerprint ? "Signed" : "Pending"}</strong>
                <small>{lastRun?.commitSha ? lastRun.commitSha.slice(0, 12) : "No commit pinned"}</small>
              </PlatformUiCard>
            </div>

            <PlatformSettingsSectionList>
              <PlatformSettingsSection
                title="Properties"
                description="Connect this verification contract to the project and environment it protects."
              >
                <div className="tests-form-grid">
                  <label className="tests-form-field">
                    <span>Name</span>
                    <input value={name} onChange={(event) => setName(event.currentTarget.value)} />
                  </label>
                  <div className="tests-form-field">
                    <span>Status</span>
                    <PlatformSelector
                      value={status}
                      options={[
                        { value: "draft", label: "Draft" },
                        { value: "active", label: "Active" },
                        { value: "archived", label: "Archived" },
                      ]}
                      fullWidth
                      ariaLabel="Test-plan status"
                      onValueChange={setStatus}
                    />
                  </div>
                  <label className="tests-form-field is-span-2">
                    <span>Description</span>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(event) => setDescription(event.currentTarget.value)}
                    />
                  </label>
                  <div className="tests-form-field">
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
                      ariaLabel="Test-plan project"
                      onValueChange={setProjectId}
                    />
                  </div>
                  <div className="tests-form-field">
                    <span>Default environment</span>
                    <PlatformSelector
                      value={environmentId}
                      options={[
                        { value: "", label: "Select when running" },
                        ...environments.map((environment) => ({
                          value: environment.id,
                          label: environment.name,
                          description: environment.description,
                        })),
                      ]}
                      fullWidth
                      ariaLabel="Default test environment"
                      onValueChange={setEnvironmentId}
                    />
                  </div>
                </div>
              </PlatformSettingsSection>

              <PlatformSettingsSection
                title="Test cases"
                description="Every case is executed from the immutable published snapshot."
                actions={(
                  <PlatformSecondaryButton size="compact" onClick={addCase}>
                    <Plus width={13} height={13} aria-hidden="true" />
                    Add Case
                  </PlatformSecondaryButton>
                )}
                bodyPresentation="flush"
              >
                <PlatformDataTable
                  rows={currentCases}
                  columns={caseColumns}
                  getRowId={(testCase) => testCase.id}
                  ariaLabel="Test cases"
                  variant="minimalistic-ui"
                  surface="plain"
                  sticky={false}
                  pagination={false}
                  getRowActions={(testCase): readonly PlatformDataTableAction<TestCaseDefinition>[] => [
                    {
                      id: "remove",
                      label: "Remove",
                      icon: Trash2,
                      danger: true,
                      onSelect: () => removeCase(testCase),
                    },
                  ]}
                  emptyState={(
                    <PlatformEmptyState
                      icon={FlaskConical}
                      title="No test cases"
                      description="Add at least one executable case before running this plan."
                      primaryAction={{ label: "Add Case", onClick: addCase }}
                    />
                  )}
                />
              </PlatformSettingsSection>

              <PlatformSettingsSection
                title="Strict definition"
                description="Advanced JSON editor for setup, cases, teardown, retry, and evidence-retention policy. Unknown fields are rejected by the API."
              >
                <textarea
                  className="tests-definition-editor"
                  aria-label="Strict test-plan definition JSON"
                  spellCheck={false}
                  value={definitionJson}
                  onChange={(event) => setDefinitionJson(event.currentTarget.value)}
                />
              </PlatformSettingsSection>

              <PlatformSettingsSection
                title="Version history"
                description="New runs always pin the currently published immutable version."
                actions={(
                  <PlatformSecondaryButton
                    size="compact"
                    disabled={dirty || Boolean(busyAction)}
                    onClick={() => void createVersion()}
                  >
                    <Plus width={13} height={13} aria-hidden="true" />
                    Save Version
                  </PlatformSecondaryButton>
                )}
                bodyPresentation="flush"
              >
                <PlatformDataTable
                  rows={versions}
                  columns={versionColumns}
                  getRowId={(version) => version.id}
                  ariaLabel="Test-plan versions"
                  variant="minimalistic-ui"
                  surface="plain"
                  sticky={false}
                  pagination={false}
                  getRowActions={(version) => [
                    {
                      id: "publish",
                      label: version.id === plan.publishedVersionId ? "Published" : "Publish",
                      icon: CheckCircle2,
                      disabled: version.id === plan.publishedVersionId || Boolean(busyAction),
                      onSelect: () => void publishVersion(version),
                    },
                  ]}
                  emptyState="No saved versions."
                />
              </PlatformSettingsSection>
            </PlatformSettingsSectionList>
          </div>
        ) : null}

        {activeTab === "runs" ? (
          <div className="tests-detail-stack">
            <div className="tests-kpi-grid">
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Queued or running</span>
                <strong>{runs.filter((run) => ["queued", "running"].includes(run.status)).length}</strong>
                <small>Durably dispatched</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Passed</span>
                <strong>{passedRuns}</strong>
                <small>{passRate}% completed-run pass rate</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Failed</span>
                <strong>{runs.filter((run) => ["failed", "completed_with_errors"].includes(run.status)).length}</strong>
                <small>Require review</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Last run</span>
                <strong>{lastRun ? formatStatus(lastRun.status) : "Never"}</strong>
                <small>{lastRun ? formatTimestamp(lastRun.createdAt) : "No evidence yet"}</small>
              </PlatformUiCard>
            </div>
            <PlatformDataTable
              rows={runs}
              columns={runColumns}
              getRowId={(run) => run.id}
              ariaLabel="Test runs"
              className="tests-runs-table"
              variant="minimalistic-ui"
              surface="plain"
              sticky={false}
              pagination={{ defaultValue: { pageIndex: 0, pageSize: 20 } }}
              toolbar={{
                title: "Run History",
                search: {
                  placeholder: "Search runs",
                  getSearchText: (run) =>
                    `${run.id} ${run.status} ${run.commitSha || ""} ${run.triggerType}`,
                },
                primaryAction: {
                  label: "Run Tests",
                  icon: Play,
                  onClick: () => onRun(plan),
                  disabled: plan.status === "archived" || plan.caseCount === 0,
                },
              }}
              onRowActivate={onOpenRun}
              getRowAriaLabel={(run) => `Open test run ${run.id}`}
              emptyState={(
                <PlatformEmptyState
                  icon={Clock3}
                  title="No test runs yet"
                  description="Run the published plan to retain case-level verification evidence."
                  primaryAction={{ label: "Run Tests", onClick: () => onRun(plan) }}
                />
              )}
            />
          </div>
        ) : null}

        {activeTab === "settings" ? (
          <TestPlanAccessSettings
            plan={plan}
            api={api}
            workspaceTeams={workspaceTeams}
            onPlanChange={onPlanChange}
          />
        ) : null}
      </ResourceDetailPage>
    </>
  );
}
