import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import { PlatformServiceDetailFrame } from "../../../../../platform-ui/pages/details/index.js";
import { TestsApi } from "../api/index.js";
import {
  normalizeTestWorkspaceOption,
  type TestCaseDefinition,
  type TestPlan,
  type TestPlanCreateInput,
  type TestPlanDefinition,
  type TestRun,
  type TestRunCreateInput,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import { TestPlanCreateModal } from "./test-plan-create-modal.js";
import { TestPlanDetailPage } from "./test-plan-detail-page.js";
import { TestCaseDetailPage } from "./test-case-detail-page.js";
import { TestRunCreateModal } from "./test-run-create-modal.js";
import { TestRunDetailPage } from "./test-run-detail-page.js";
import {
  TestsOverviewPage,
  type TestPlanOverviewRow,
} from "./tests-overview-page.js";

export type TestsWorkspaceMode = "overview" | "detail" | "case" | "run";

export interface TestsWorkspacePageProps {
  shouldLoadData?: boolean;
  backendUrl: string;
  requestHeaders?: Readonly<Record<string, string>>;
  mode?: TestsWorkspaceMode;
  selectedTestPlanId?: string;
  selectedTestCaseId?: string;
  selectedTestRunId?: string;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  defaultProjectId?: string;
  defaultEnvironmentId?: string;
  defaultAgentId?: string;
  projects?: readonly unknown[];
  environments?: readonly unknown[];
  agents?: readonly unknown[];
  workspaceTeams?: readonly unknown[];
  onOpenPlan: (planId: string, planName?: string) => void;
  onOpenCase: (
    planId: string,
    caseId: string,
    planName?: string,
    caseName?: string,
  ) => void;
  onOpenRun: (planId: string, runId: string, planName?: string) => void;
  onIdentityChange?: (identity: {
    planId: string;
    planName: string;
    caseId?: string;
    caseName?: string;
    runId?: string;
    runLabel?: string;
  }) => void;
}

interface ActiveTestCaseContext {
  plan: TestPlan;
  testCase: TestCaseDefinition;
}

function formatRelativeTimestamp(value: string): string {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "Unknown";
  const delta = Date.now() - timestamp;
  if (delta < 60_000) return "Just now";
  if (delta < 3_600_000) return `${Math.max(1, Math.round(delta / 60_000))}m ago`;
  if (delta < 86_400_000) return `${Math.max(1, Math.round(delta / 3_600_000))}h ago`;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(timestamp));
}

function normalizeOptions(
  values: readonly unknown[] | undefined,
  fallbackLabel: string,
): TestWorkspaceResourceOption[] {
  return (Array.isArray(values) ? values : [])
    .map((value) => normalizeTestWorkspaceOption(value, fallbackLabel))
    .filter((value): value is TestWorkspaceResourceOption => Boolean(value));
}

export function TestsWorkspacePage({
  shouldLoadData = true,
  backendUrl,
  requestHeaders = {},
  mode = "overview",
  selectedTestPlanId = "",
  selectedTestCaseId = "",
  selectedTestRunId = "",
  controlsPortalId,
  sectionControlsPortalId,
  defaultProjectId = "",
  defaultEnvironmentId = "",
  defaultAgentId = "",
  projects = [],
  environments = [],
  agents = [],
  workspaceTeams = [],
  onOpenPlan,
  onOpenCase,
  onOpenRun,
  onIdentityChange,
}: TestsWorkspacePageProps) {
  const api = useMemo(
    () => new TestsApi(backendUrl, requestHeaders),
    [backendUrl, requestHeaders],
  );
  const identityChangeRef = useRef(onIdentityChange);
  useEffect(() => {
    identityChangeRef.current = onIdentityChange;
  }, [onIdentityChange]);
  const normalizedProjects = useMemo(
    () => normalizeOptions(projects, "Project"),
    [projects],
  );
  const normalizedEnvironments = useMemo(
    () => normalizeOptions(environments, "Environment"),
    [environments],
  );
  const normalizedAgents = useMemo(
    () => normalizeOptions(agents, "Agent"),
    [agents],
  );
  const [plans, setPlans] = useState<TestPlan[]>([]);
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [activePlan, setActivePlan] = useState<TestPlan | null>(null);
  const [activeRun, setActiveRun] = useState<TestRun | null>(null);
  const [activeRunPlan, setActiveRunPlan] = useState<TestPlan | null>(null);
  const [activeCaseContext, setActiveCaseContext] = useState<ActiveTestCaseContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshingRun, setRefreshingRun] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [runPlan, setRunPlan] = useState<TestPlan | null>(null);
  const [deletePlan, setDeletePlan] = useState<TestPlan | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextPlans, nextRuns] = await Promise.all([
        api.listPlans(),
        api.listRuns(),
      ]);
      setPlans(nextPlans);
      setRuns(nextRuns);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load Tests.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadPlan = useCallback(async (planId: string) => {
    if (!planId) return;
    setDetailLoading(true);
    setError("");
    try {
      const nextPlan = await api.getPlan(planId);
      setActivePlan(nextPlan);
      identityChangeRef.current?.({
        planId: nextPlan.id,
        planName: nextPlan.name,
      });
      setPlans((current) => [
        nextPlan,
        ...current.filter((plan) => plan.id !== nextPlan.id),
      ]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the test plan.");
      setActivePlan(null);
    } finally {
      setDetailLoading(false);
    }
  }, [api]);

  const loadRun = useCallback(async (runId: string, silent = false) => {
    if (!runId) return;
    if (silent) setRefreshingRun(true);
    else setDetailLoading(true);
    setError("");
    try {
      const payload = await api.getRun(runId);
      setActiveRun(payload.testRun);
      setActiveRunPlan(payload.testPlan);
      identityChangeRef.current?.({
        planId: payload.testPlan.id,
        planName: payload.testPlan.name,
        runId: payload.testRun.id,
        runLabel: `Run ${payload.testRun.id.slice(-8)}`,
      });
      setRuns((current) => [
        payload.testRun,
        ...current.filter((run) => run.id !== payload.testRun.id),
      ]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the test run.");
      if (!silent) {
        setActiveRun(null);
        setActiveRunPlan(null);
      }
    } finally {
      setDetailLoading(false);
      setRefreshingRun(false);
    }
  }, [api]);

  useEffect(() => {
    if (!shouldLoadData) return;
    if (mode === "overview") {
      void loadOverview();
      return;
    }
    if ((mode === "detail" || mode === "case") && selectedTestPlanId) {
      void loadPlan(selectedTestPlanId);
      return;
    }
    if (mode === "run" && selectedTestRunId) {
      void loadRun(selectedTestRunId);
    }
  }, [
    loadOverview,
    loadPlan,
    loadRun,
    mode,
    selectedTestPlanId,
    selectedTestCaseId,
    selectedTestRunId,
    shouldLoadData,
  ]);

  useEffect(() => {
    if (
      mode !== "run"
      || !selectedTestRunId
      || !activeRun
      || !["queued", "running"].includes(activeRun.status)
    ) return undefined;
    const interval = window.setInterval(() => {
      void loadRun(selectedTestRunId, true);
    }, 3_000);
    return () => window.clearInterval(interval);
  }, [activeRun, loadRun, mode, selectedTestRunId]);

  const overviewRows = useMemo<TestPlanOverviewRow[]>(() => {
    const runsByPlan = new Map<string, TestRun[]>();
    runs.forEach((run) => {
      const planRuns = runsByPlan.get(run.testPlanId) || [];
      planRuns.push(run);
      runsByPlan.set(run.testPlanId, planRuns);
    });
    return plans.map((plan) => {
      const planRuns = (runsByPlan.get(plan.id) || []).sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
      );
      const lastRun = planRuns[0];
      return {
        id: plan.id,
        name: plan.name,
        projectLabel:
          normalizedProjects.find((project) => project.id === plan.projectId)?.name
          || "Unassigned",
        caseCount: plan.caseCount,
        runCount: planRuns.length,
        passedRunCount: planRuns.filter((run) => run.status === "passed").length,
        lastRunStatus: lastRun?.status || "",
        updatedAt: Date.parse(plan.updatedAt) || 0,
        updatedLabel: formatRelativeTimestamp(plan.updatedAt),
        searchText: `${plan.name} ${plan.description} ${plan.status} ${plan.projectId || ""}`,
      };
    });
  }, [normalizedProjects, plans, runs]);

  async function createPlan(input: TestPlanCreateInput): Promise<TestPlan> {
    const created = await api.createPlan(input);
    setPlans((current) => [created, ...current]);
    onOpenPlan(created.id, created.name);
    return created;
  }

  async function startRun(
    plan: TestPlan,
    input: TestRunCreateInput,
  ): Promise<TestRun> {
    const created = await api.createRun(plan.id, input);
    setRuns((current) => [created, ...current]);
    setActiveRun(created);
    setActiveRunPlan(plan);
    onOpenRun(plan.id, created.id, plan.name);
    return created;
  }

  function replacePlan(nextPlan: TestPlan) {
    setActivePlan(nextPlan);
    setPlans((current) => [
      nextPlan,
      ...current.filter((plan) => plan.id !== nextPlan.id),
    ]);
  }

  if (mode === "detail") {
    if (detailLoading || !activePlan || activePlan.id !== selectedTestPlanId) {
      return (
        <div className="tests-centered-state">
          {error ? <p className="tests-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading test plan…" />
          )}
        </div>
      );
    }
    return (
      <>
        <PlatformServiceDetailFrame className="tests-detail-frame">
          <TestPlanDetailPage
            plan={activePlan}
            api={api}
            projects={normalizedProjects}
            environments={normalizedEnvironments}
            workspaceTeams={workspaceTeams}
            controlsPortalId={controlsPortalId}
            sectionControlsPortalId={sectionControlsPortalId}
            onPlanChange={replacePlan}
            onReload={() => loadPlan(activePlan.id)}
            onRun={setRunPlan}
            onOpenRun={(run) => onOpenRun(activePlan.id, run.id, activePlan.name)}
            onOpenCase={(testCase, definition: TestPlanDefinition) => {
              const contextPlan: TestPlan = {
                ...activePlan,
                definition,
                caseCount: definition.cases.length,
              };
              setActiveCaseContext({ plan: contextPlan, testCase });
              onOpenCase(
                activePlan.id,
                testCase.id,
                activePlan.name,
                testCase.name,
              );
            }}
          />
        </PlatformServiceDetailFrame>
        <TestRunCreateModal
          open={Boolean(runPlan)}
          plan={runPlan}
          environments={normalizedEnvironments}
          agents={normalizedAgents}
          defaultEnvironmentId={defaultEnvironmentId}
          defaultAgentId={defaultAgentId}
          onClose={() => setRunPlan(null)}
          onRun={startRun}
        />
      </>
    );
  }

  if (mode === "case") {
    const matchingContext = (
      activeCaseContext?.plan.id === selectedTestPlanId
      && activeCaseContext.testCase.id === selectedTestCaseId
    )
      ? activeCaseContext
      : null;
    const casePlan = matchingContext?.plan
      || (
        activePlan?.id === selectedTestPlanId
          ? activePlan
          : null
      );
    const activeCase = matchingContext?.testCase
      || casePlan?.definition.cases.find(
        (testCase) => testCase.id === selectedTestCaseId,
      )
      || null;

    if (
      (!matchingContext && detailLoading)
      || !casePlan
      || !activeCase
    ) {
      const caseError = error || (
        casePlan && !activeCase
          ? "The selected test case no longer exists."
          : ""
      );
      return (
        <div className="tests-centered-state">
          {caseError ? <p className="tests-page-error" role="alert">{caseError}</p> : (
            <PlatformLoadingState centered message="Loading test case…" />
          )}
        </div>
      );
    }

    return (
      <TestCaseDetailPage
        plan={casePlan}
        testCase={activeCase}
        api={api}
        controlsPortalId={controlsPortalId}
        sectionControlsPortalId={sectionControlsPortalId}
        onPlanChange={(nextPlan) => {
          replacePlan(nextPlan);
          const nextCase = nextPlan.definition.cases.find(
            (testCase) => testCase.id === activeCase.id,
          ) || activeCase;
          setActiveCaseContext({ plan: nextPlan, testCase: nextCase });
        }}
        onCaseIdentityChange={(nextCase) => {
          setActiveCaseContext((current) => current
            ? { ...current, testCase: nextCase }
            : { plan: casePlan, testCase: nextCase });
          identityChangeRef.current?.({
            planId: casePlan.id,
            planName: casePlan.name,
            caseId: nextCase.id,
            caseName: nextCase.name,
          });
        }}
        onDeleted={(nextPlan) => {
          replacePlan(nextPlan);
          setActiveCaseContext(null);
          onOpenPlan(nextPlan.id, nextPlan.name);
        }}
      />
    );
  }

  if (mode === "run") {
    if (
      detailLoading
      || !activeRun
      || !activeRunPlan
      || activeRun.id !== selectedTestRunId
    ) {
      return (
        <div className="tests-centered-state">
          {error ? <p className="tests-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading test run…" />
          )}
        </div>
      );
    }
    return (
      <>
        <PlatformServiceDetailFrame className="tests-detail-frame">
          <TestRunDetailPage
            run={activeRun}
            plan={activeRunPlan}
            projects={normalizedProjects}
            environments={normalizedEnvironments}
            agents={normalizedAgents}
            controlsPortalId={controlsPortalId}
            refreshing={refreshingRun}
            onRefresh={() => void loadRun(activeRun.id, true)}
            onRunAgain={() => setRunPlan(activeRunPlan)}
          />
        </PlatformServiceDetailFrame>
        <TestRunCreateModal
          open={Boolean(runPlan)}
          plan={runPlan}
          environments={normalizedEnvironments}
          agents={normalizedAgents}
          defaultEnvironmentId={defaultEnvironmentId}
          defaultAgentId={defaultAgentId}
          onClose={() => setRunPlan(null)}
          onRun={startRun}
        />
      </>
    );
  }

  return (
    <>
      <TestsOverviewPage
        rows={overviewRows}
        loading={loading}
        error={error}
        controlsPortalId={controlsPortalId}
        onOpen={(row) => onOpenPlan(row.id, row.name)}
        onCreate={() => setCreateOpen(true)}
        onRun={(row) => {
          const plan = plans.find((candidate) => candidate.id === row.id);
          if (plan) setRunPlan(plan);
        }}
        onDelete={(row) => {
          const plan = plans.find((candidate) => candidate.id === row.id);
          if (plan) setDeletePlan(plan);
        }}
      />
      <TestPlanCreateModal
        open={createOpen}
        projects={normalizedProjects}
        environments={normalizedEnvironments}
        defaultProjectId={defaultProjectId}
        defaultEnvironmentId={defaultEnvironmentId}
        onClose={() => setCreateOpen(false)}
        onCreate={createPlan}
      />
      <TestRunCreateModal
        open={Boolean(runPlan)}
        plan={runPlan}
        environments={normalizedEnvironments}
        agents={normalizedAgents}
        defaultEnvironmentId={defaultEnvironmentId}
        defaultAgentId={defaultAgentId}
        onClose={() => setRunPlan(null)}
        onRun={startRun}
      />
      <PlatformConfirmationModal
        open={Boolean(deletePlan)}
        title="Delete Test Plan?"
        description={deletePlan
          ? `This permanently deletes ${deletePlan.name}, its versions, runs, results, and retained artifacts.`
          : ""}
        confirmLabel="Delete Test Plan"
        confirmingLabel="Deleting…"
        tone="destructive"
        onCancel={() => setDeletePlan(null)}
        onConfirm={async () => {
          if (!deletePlan) return;
          await api.deletePlan(deletePlan.id);
          setPlans((current) => current.filter((plan) => plan.id !== deletePlan.id));
          setRuns((current) => current.filter((run) => run.testPlanId !== deletePlan.id));
          setDeletePlan(null);
        }}
      />
    </>
  );
}
