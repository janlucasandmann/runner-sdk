import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformConfirmationModal } from "../../../../../platform-ui/components/composite/modal/index.js";
import type { PlatformVersionNavigationGuardRegistrar } from "../../../../../platform-ui/components/composite/versioning/index.js";
import { PlatformServiceDetailFrame } from "../../../../../platform-ui/pages/details/index.js";
import {
  filterPlatformResourcesByOverviewScope,
  normalizePlatformResourceOverviewScope,
  type PlatformResourceOverviewScope,
} from "../../../../../platform-ui/pages/overview/index.js";
import { TestsApi } from "../api/index.js";
import {
  getTestPlanCreatorIdentity,
  initializeTestPlanIdentityMetadata,
  normalizeTestWorkspaceOption,
  type TestCaseDefinition,
  type TestPersonIdentityInput,
  type TestPlan,
  type TestPlanCatalogEntry,
  type TestPlanCreateInput,
  type TestPlanDefinition,
  type TestRun,
  type TestRunCreateInput,
  type TestWorkspaceResourceOption,
} from "../domain/index.js";
import { TestCaseDetailPage } from "./test-case-detail-page.js";
import { TestPlanCreateModal } from "./test-plan-create-modal.js";
import { TestPlanDetailPage } from "./test-plan-detail-page.js";
import { TestPlanRawConfigurationPage } from "./test-plan-raw-configuration-page.js";
import { TestRunCreateModal } from "./test-run-create-modal.js";
import { TestRunDetailPage } from "./test-run-detail-page.js";
import { TestRunTechnicalDetailsPage } from "./test-run-technical-details-page.js";
import { TestsOverviewPage, type TestPlanOverviewRow } from "./tests-overview-page.js";

export type TestsWorkspaceMode =
  | "overview"
  | "detail"
  | "configuration"
  | "case"
  | "run"
  | "run-technical";

export interface TestsWorkspacePageProps {
  shouldLoadData?: boolean;
  backendUrl: string;
  requestHeaders?: Readonly<Record<string, string>>;
  mode?: TestsWorkspaceMode;
  overviewScope?: PlatformResourceOverviewScope;
  selectedTestPlanId?: string;
  selectedTestCaseId?: string;
  selectedTestRunId?: string;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  titleActionsPortalId?: string;
  versionsDrawerPortalId?: string;
  defaultProjectId?: string;
  defaultEnvironmentId?: string;
  defaultAgentId?: string;
  projects?: readonly unknown[];
  environments?: readonly unknown[];
  agents?: readonly unknown[];
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  workspaceTeamsRequiresPlan?: boolean;
  onWorkspaceTeamsRequest?: () => void;
  activeOrganizationId?: string;
  currentUser?: TestPersonIdentityInput;
  onOpenPlan: (planId: string, planName?: string) => void;
  onOpenRawConfiguration: (planId: string, planName?: string) => void;
  onPlanDeleted?: (planId: string) => void;
  onOpenCase: (
    planId: string,
    caseId: string,
    planName?: string,
    caseName?: string,
  ) => void;
  onOpenRun: (planId: string, runId: string, planName?: string) => void;
  onOpenRunTechnicalDetails: (
    planId: string,
    runId: string,
    planName?: string,
    runName?: string,
  ) => void;
  onIdentityChange?: (identity: {
    planId: string;
    planName: string;
    caseId?: string;
    caseName?: string;
    runId?: string;
    runLabel?: string;
  }) => void;
  onVersionsSidebarOpenChange?: (open: boolean) => void;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
  onNavigationRequest?: (continuation: () => void) => boolean;
}

interface ActiveTestCaseContext {
  plan: TestPlan;
  testCase: TestCaseDefinition;
}

const TEST_OVERVIEW_INITIAL_PAGE_SIZE = 20;
const TEST_OVERVIEW_PAGE_INCREMENT = 10;

interface TestOverviewPaginationState {
  hasMore: boolean;
  loadingMore: boolean;
  nextOffset: number;
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
  overviewScope = "all",
  selectedTestPlanId = "",
  selectedTestCaseId = "",
  selectedTestRunId = "",
  controlsPortalId,
  sectionControlsPortalId,
  titleActionsPortalId,
  versionsDrawerPortalId,
  defaultProjectId = "",
  defaultEnvironmentId = "",
  defaultAgentId = "",
  projects = [],
  environments = [],
  agents = [],
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  workspaceTeamsRequiresPlan = false,
  onWorkspaceTeamsRequest,
  activeOrganizationId = "",
  currentUser = {},
  onOpenPlan,
  onOpenRawConfiguration,
  onPlanDeleted,
  onOpenRun,
  onOpenRunTechnicalDetails,
  onIdentityChange,
  onVersionsSidebarOpenChange,
  onNavigationGuardChange,
  onNavigationRequest,
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
  const [plans, setPlans] = useState<TestPlanCatalogEntry[]>([]);
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
  const [deletePlans, setDeletePlans] = useState<readonly TestPlanCatalogEntry[]>([]);
  const [overviewPagination, setOverviewPagination] = useState<TestOverviewPaginationState>({
    hasMore: false,
    loadingMore: false,
    nextOffset: 0,
  });
  const overviewLoadMoreRef = useRef(false);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    overviewLoadMoreRef.current = false;
    setOverviewPagination({ hasMore: false, loadingMore: false, nextOffset: 0 });
    try {
      const page = await api.listPlanPage(0, TEST_OVERVIEW_INITIAL_PAGE_SIZE);
      setPlans(page.plans);
      setRuns([]);
      setOverviewPagination({
        hasMore: page.hasMore,
        loadingMore: false,
        nextOffset: page.nextOffset,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load Tests.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadMoreOverview = useCallback(async () => {
    if (overviewLoadMoreRef.current || !overviewPagination.hasMore) return;
    overviewLoadMoreRef.current = true;
    setOverviewPagination((current) => ({ ...current, loadingMore: true }));
    try {
      const page = await api.listPlanPage(
        overviewPagination.nextOffset,
        TEST_OVERVIEW_PAGE_INCREMENT,
      );
      setPlans((current) => {
        const byId = new Map(current.map((plan) => [plan.id, plan]));
        page.plans.forEach((plan) => byId.set(plan.id, plan));
        return [...byId.values()];
      });
      setOverviewPagination({
        hasMore: page.hasMore,
        loadingMore: false,
        nextOffset: page.nextOffset,
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load more Tests.");
      setOverviewPagination((current) => ({ ...current, loadingMore: false }));
      throw nextError;
    } finally {
      overviewLoadMoreRef.current = false;
    }
  }, [api, overviewPagination.hasMore, overviewPagination.nextOffset]);

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
      if (Array.isArray(nextPlan.runs)) {
        setRuns((current) => {
          const byId = new Map(current.map((run) => [run.id, run]));
          nextPlan.runs?.forEach((run) => byId.set(run.id, run));
          return [...byId.values()];
        });
      }
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
    if (
      (mode === "detail" || mode === "configuration" || mode === "case")
      && selectedTestPlanId
    ) {
      void loadPlan(selectedTestPlanId);
      return;
    }
    if ((mode === "run" || mode === "run-technical") && selectedTestRunId) {
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
    const scopedPlans = filterPlatformResourcesByOverviewScope(
      plans,
      normalizePlatformResourceOverviewScope(overviewScope),
      currentUser,
      (plan) => getTestPlanCreatorIdentity(plan),
    );
    return scopedPlans.map((plan) => {
      const creator = getTestPlanCreatorIdentity(plan, currentUser);
      const loadedPlanRuns = "runs" in plan && Array.isArray(plan.runs)
        ? plan.runs
        : [];
      const planRuns = [
        ...(runsByPlan.get(plan.id) || []),
        ...loadedPlanRuns,
      ].filter((run, index, entries) => (
        entries.findIndex((candidate) => candidate.id === run.id) === index
      )).sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
      );
      const lastRun = planRuns[0];
      const summaryRunCount = "runCount" in plan ? plan.runCount : null;
      const summaryPassedRunCount = "passedRunCount" in plan
        ? plan.passedRunCount
        : null;
      const summaryLastRunStatus = "lastRunStatus" in plan
        ? plan.lastRunStatus
        : null;
      return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        creatorName: creator.name,
        creatorAvatarUrl: creator.avatarUrl,
        projectLabel:
          normalizedProjects.find((project) => project.id === plan.projectId)?.name
          || "Unassigned",
        caseCount: plan.caseCount,
        runCount: summaryRunCount ?? planRuns.length,
        passedRunCount: summaryPassedRunCount
          ?? planRuns.filter((run) => run.status === "passed").length,
        lastRunStatus:
          summaryLastRunStatus
          || lastRun?.status
          || (summaryRunCount === null ? "unknown" : ""),
        updatedAt: Date.parse(plan.updatedAt) || 0,
        searchText: `${plan.name} ${plan.description} ${plan.projectId || ""}`,
      };
    });
  }, [currentUser, normalizedProjects, overviewScope, plans, runs]);

  const requestWorkspaceNavigation = useCallback((continuation: () => void) => {
    if (typeof onNavigationRequest === "function") {
      return onNavigationRequest(continuation);
    }
    continuation();
    return true;
  }, [onNavigationRequest]);

  async function createPlan(input: TestPlanCreateInput): Promise<TestPlan> {
    const created = await api.createPlan({
      ...input,
      metadata: initializeTestPlanIdentityMetadata(input.metadata, currentUser),
    });
    setPlans((current) => [created, ...current]);
    setOverviewPagination((current) => ({
      ...current,
      nextOffset: current.nextOffset + 1,
    }));
    onOpenPlan(created.id, created.name);
    return created;
  }

  async function openRunModal(planId: string): Promise<void> {
    setError("");
    try {
      const plan = await api.getPlan(planId);
      setPlans((current) => [
        plan,
        ...current.filter((candidate) => candidate.id !== plan.id),
      ]);
      if (Array.isArray(plan.runs)) {
        setRuns((current) => {
          const byId = new Map(current.map((run) => [run.id, run]));
          plan.runs?.forEach((run) => byId.set(run.id, run));
          return [...byId.values()];
        });
      }
      setRunPlan(plan);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the test plan.");
    }
  }

  async function startRun(
    plan: TestPlan,
    input: TestRunCreateInput,
  ): Promise<TestRun> {
    const created = await api.createRun(plan.id, input);
    setRuns((current) => [created, ...current]);
    setActiveRun(created);
    setActiveRunPlan(plan);
    requestWorkspaceNavigation(() => onOpenRun(plan.id, created.id, plan.name));
    return created;
  }

  async function tryScenarios(
    plan: TestPlan,
    definition: TestPlanDefinition,
    scenarioIds: string[],
  ): Promise<void> {
    const created = await api.createPreviewRun(plan.id, {
      definition,
      scenarioIds,
      environmentId: plan.defaultEnvironmentId || defaultEnvironmentId || undefined,
      agentId: defaultAgentId || undefined,
      projectId: plan.projectId || undefined,
      metadata: { source: "scenario_workspace" },
    });
    setRuns((current) => [created, ...current.filter((run) => run.id !== created.id)]);
    setActiveRun(created);
    setActiveRunPlan(plan);
    requestWorkspaceNavigation(() => onOpenRun(plan.id, created.id, plan.name));
  }

  function replacePlan(nextPlan: TestPlan) {
    setActivePlan(nextPlan);
    identityChangeRef.current?.({
      planId: nextPlan.id,
      planName: nextPlan.name,
    });
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
            workspaceTeamsLoading={workspaceTeamsLoading}
            workspaceTeamsRequiresPlan={workspaceTeamsRequiresPlan}
            onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
            activeOrganizationId={activeOrganizationId}
            currentUser={currentUser}
            controlsPortalId={controlsPortalId}
            sectionControlsPortalId={sectionControlsPortalId}
            titleActionsPortalId={titleActionsPortalId}
            versionsDrawerPortalId={versionsDrawerPortalId}
            onVersionsSidebarOpenChange={onVersionsSidebarOpenChange}
            onNavigationGuardChange={onNavigationGuardChange}
            onPlanChange={replacePlan}
            onDeleted={(deletedPlan) => {
              setActivePlan(null);
              setPlans((current) => current.filter((plan) => plan.id !== deletedPlan.id));
              setRuns((current) => current.filter((run) => run.testPlanId !== deletedPlan.id));
              onPlanDeleted?.(deletedPlan.id);
            }}
            onReload={() => loadPlan(activePlan.id)}
            onRun={setRunPlan}
            onOpenRawConfiguration={() => requestWorkspaceNavigation(() => (
              onOpenRawConfiguration(activePlan.id, activePlan.name)
            ))}
            onOpenRun={(run) => requestWorkspaceNavigation(() => (
              onOpenRun(activePlan.id, run.id, activePlan.name)
            ))}
            onTryScenarios={(definition, scenarioIds) => (
              tryScenarios(activePlan, definition, scenarioIds)
            )}
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

  if (mode === "configuration") {
    if (detailLoading || !activePlan || activePlan.id !== selectedTestPlanId) {
      return (
        <div className="tests-centered-state">
          {error ? <p className="tests-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading test configuration…" />
          )}
        </div>
      );
    }

    return (
      <TestPlanRawConfigurationPage
        plan={activePlan}
        api={api}
        controlsPortalId={controlsPortalId}
        onNavigationGuardChange={onNavigationGuardChange}
        onPlanChange={replacePlan}
        onReload={() => loadPlan(activePlan.id)}
      />
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
          ? "The selected scenario no longer exists."
          : ""
      );
      return (
        <div className="tests-centered-state">
          {caseError ? <p className="tests-page-error" role="alert">{caseError}</p> : (
            <PlatformLoadingState centered message="Loading scenario…" />
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
            environments={normalizedEnvironments}
            controlsPortalId={controlsPortalId}
            refreshing={refreshingRun}
            onRefresh={() => void loadRun(activeRun.id, true)}
            onRunAgain={() => setRunPlan(activeRunPlan)}
            onCancel={async () => {
              const cancelled = await api.cancelRun(activeRun.id);
              setActiveRun(cancelled);
              setRuns((current) => [
                cancelled,
                ...current.filter((run) => run.id !== cancelled.id),
              ]);
            }}
            onRetryFailed={(scenarioIds) => tryScenarios(
              activeRunPlan,
              activeRunPlan.definition,
              scenarioIds,
            )}
            onOpenTechnicalDetails={() => requestWorkspaceNavigation(() => (
              onOpenRunTechnicalDetails(
                activeRunPlan.id,
                activeRun.id,
                activeRunPlan.name,
                `Run ${activeRun.id.slice(-8)}`,
              )
            ))}
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

  if (mode === "run-technical") {
    if (
      detailLoading
      || !activeRun
      || !activeRunPlan
      || activeRun.id !== selectedTestRunId
    ) {
      return (
        <div className="tests-centered-state">
          {error ? <p className="tests-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading technical details…" />
          )}
        </div>
      );
    }

    return (
      <TestRunTechnicalDetailsPage
        run={activeRun}
        plan={activeRunPlan}
      />
    );
  }

  return (
    <>
      <TestsOverviewPage
        rows={overviewRows}
        loading={loading}
        error={error}
        incrementalLoading={{
          hasMore: overviewPagination.hasMore,
          loading: overviewPagination.loadingMore,
          loadingMessage: "Loading more tests...",
          onLoadMore: loadMoreOverview,
        }}
        controlsPortalId={controlsPortalId}
        onOpen={(row) => onOpenPlan(row.id, row.name)}
        onCreate={() => setCreateOpen(true)}
        onRun={(row) => void openRunModal(row.id)}
        onDelete={(rows) => {
          const selectedIds = new Set(rows.map((row) => row.id));
          setDeletePlans(plans.filter((candidate) => selectedIds.has(candidate.id)));
        }}
      />
      <TestPlanCreateModal
        open={createOpen}
        api={api}
        projects={normalizedProjects}
        environments={normalizedEnvironments}
        agents={normalizedAgents}
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
        open={deletePlans.length > 0}
        title={deletePlans.length === 1 ? "Delete Test Plan?" : `Delete ${deletePlans.length} Test Plans?`}
        description={deletePlans.length === 1
          ? `This permanently deletes ${deletePlans[0]?.name}, its versions, runs, results, and retained artifacts.`
          : "This permanently deletes the selected test plans, their versions, runs, results, and retained artifacts."}
        confirmLabel={deletePlans.length === 1 ? "Delete Test Plan" : "Delete Test Plans"}
        confirmingLabel="Deleting…"
        tone="destructive"
        onCancel={() => setDeletePlans([])}
        onConfirm={async () => {
          if (!deletePlans.length) return;
          const results = await Promise.allSettled(
            deletePlans.map((plan) => api.deletePlan(plan.id)),
          );
          const deletedIds = new Set(
            deletePlans
              .filter((_, index) => results[index]?.status === "fulfilled")
              .map((plan) => plan.id),
          );
          const failedPlans = deletePlans.filter(
            (_, index) => results[index]?.status === "rejected",
          );
          if (deletedIds.size) {
            setPlans((current) => current.filter((plan) => !deletedIds.has(plan.id)));
            setRuns((current) => current.filter((run) => !deletedIds.has(run.testPlanId)));
            setOverviewPagination((current) => ({
              ...current,
              nextOffset: Math.max(0, current.nextOffset - deletedIds.size),
            }));
            deletedIds.forEach((id) => onPlanDeleted?.(id));
          }
          setDeletePlans(failedPlans);
          if (failedPlans.length) {
            throw new Error(
              failedPlans.length === 1
                ? `Failed to delete ${failedPlans[0]?.name || "the test plan"}.`
                : `Failed to delete ${failedPlans.length} test plans.`,
            );
          }
        }}
      />
    </>
  );
}
