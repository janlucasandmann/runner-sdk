import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformServiceDetailFrame } from "../../../../../platform-ui/pages/details/index.js";
import { AssuranceApi } from "../api/index.js";
import {
  normalizeAssuranceWorkspaceOption,
  type AssurancePolicy,
  type AssurancePolicyCreateInput,
  type AssuranceRun,
  type AssuranceRunCreateInput,
  type AssuranceWorkspaceOption,
} from "../domain/index.js";
import { AssuranceOverviewPage, type AssurancePolicyOverviewRow } from "./assurance-overview-page.js";
import { AssurancePolicyCreateModal } from "./assurance-policy-create-modal.js";
import { AssurancePolicyDetailPage } from "./assurance-policy-detail-page.js";
import { AssuranceRunCreateModal } from "./assurance-run-create-modal.js";
import { AssuranceRunDetailPage } from "./assurance-run-detail-page.js";

export type AssuranceWorkspaceMode = "overview" | "detail" | "run";

export interface AssuranceWorkspacePageProps {
  shouldLoadData?: boolean;
  backendUrl: string;
  requestHeaders?: Readonly<Record<string, string>>;
  mode?: AssuranceWorkspaceMode;
  selectedPolicyId?: string;
  selectedRunId?: string;
  controlsPortalId?: string;
  sectionControlsPortalId?: string;
  defaultProjectId?: string;
  projects?: readonly unknown[];
  workspaceTeams?: readonly unknown[];
  onOpenPolicy: (policyId: string, policyName?: string) => void;
  onOpenRun: (policyId: string, runId: string, policyName?: string) => void;
  onIdentityChange?: (identity: {
    policyId: string;
    policyName: string;
    runId?: string;
    runLabel?: string;
  }) => void;
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
): AssuranceWorkspaceOption[] {
  return (Array.isArray(values) ? values : [])
    .map((value) => normalizeAssuranceWorkspaceOption(value, fallbackLabel))
    .filter((value): value is AssuranceWorkspaceOption => Boolean(value));
}

export function AssuranceWorkspacePage({
  shouldLoadData = true,
  backendUrl,
  requestHeaders = {},
  mode = "overview",
  selectedPolicyId = "",
  selectedRunId = "",
  controlsPortalId,
  sectionControlsPortalId,
  defaultProjectId = "",
  projects = [],
  workspaceTeams = [],
  onOpenPolicy,
  onOpenRun,
  onIdentityChange,
}: AssuranceWorkspacePageProps) {
  const api = useMemo(
    () => new AssuranceApi(backendUrl, requestHeaders),
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
  const [testPlans, setTestPlans] = useState<AssuranceWorkspaceOption[]>([]);
  const [policies, setPolicies] = useState<AssurancePolicy[]>([]);
  const [runs, setRuns] = useState<AssuranceRun[]>([]);
  const [activePolicy, setActivePolicy] = useState<AssurancePolicy | null>(null);
  const [activeRun, setActiveRun] = useState<AssuranceRun | null>(null);
  const [activeRunPolicy, setActiveRunPolicy] = useState<AssurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [refreshingRun, setRefreshingRun] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [runPolicy, setRunPolicy] = useState<AssurancePolicy | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [nextPolicies, nextRuns, nextTestPlans] = await Promise.all([
        api.listPolicies(),
        api.listRuns(),
        api.listTestPlans(),
      ]);
      setPolicies(nextPolicies);
      setRuns(nextRuns);
      setTestPlans(normalizeOptions(nextTestPlans, "Test Plan"));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load Assurance.");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadPolicy = useCallback(async (policyId: string) => {
    if (!policyId) return;
    setDetailLoading(true);
    setError("");
    try {
      const nextPolicy = await api.getPolicy(policyId);
      setActivePolicy(nextPolicy);
      identityChangeRef.current?.({
        policyId: nextPolicy.id,
        policyName: nextPolicy.name,
      });
      setPolicies((current) => [
        nextPolicy,
        ...current.filter((policy) => policy.id !== nextPolicy.id),
      ]);
      if (Array.isArray(nextPolicy.runs)) {
        setRuns((current) => [
          ...nextPolicy.runs!,
          ...current.filter((run) => run.assurancePolicyId !== nextPolicy.id),
        ]);
      }
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the Assurance Policy.");
      setActivePolicy(null);
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
      setActiveRun(payload.assuranceRun);
      setActiveRunPolicy(payload.assurancePolicy);
      identityChangeRef.current?.({
        policyId: payload.assurancePolicy.id,
        policyName: payload.assurancePolicy.name,
        runId: payload.assuranceRun.id,
        runLabel: `Run ${payload.assuranceRun.id.slice(-8)}`,
      });
      setRuns((current) => [
        payload.assuranceRun,
        ...current.filter((run) => run.id !== payload.assuranceRun.id),
      ]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the Assurance Run.");
      if (!silent) {
        setActiveRun(null);
        setActiveRunPolicy(null);
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
    if (mode === "detail" && selectedPolicyId) {
      void loadPolicy(selectedPolicyId);
      return;
    }
    if (mode === "run" && selectedRunId) {
      void loadRun(selectedRunId);
    }
  }, [
    loadOverview,
    loadPolicy,
    loadRun,
    mode,
    selectedPolicyId,
    selectedRunId,
    shouldLoadData,
  ]);

  useEffect(() => {
    if (
      mode !== "run"
      || !selectedRunId
      || !activeRun
      || activeRun.status !== "running"
    ) return undefined;
    const interval = window.setInterval(() => {
      void loadRun(selectedRunId, true);
    }, 4_000);
    return () => window.clearInterval(interval);
  }, [activeRun, loadRun, mode, selectedRunId]);

  const overviewRows = useMemo<AssurancePolicyOverviewRow[]>(() => {
    const runsByPolicy = new Map<string, AssuranceRun[]>();
    runs.forEach((run) => {
      const policyRuns = runsByPolicy.get(run.assurancePolicyId) || [];
      policyRuns.push(run);
      runsByPolicy.set(run.assurancePolicyId, policyRuns);
    });
    return policies.map((policy) => {
      const policyRuns = (runsByPolicy.get(policy.id) || []).sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
      );
      const lastRun = policyRuns[0];
      return {
        id: policy.id,
        name: policy.name,
        projectLabel:
          normalizedProjects.find((project) => project.id === policy.projectId)?.name
          || "Unassigned",
        gateCount:
          policy.definition.testGates.length
          + policy.definition.evaluationGates.length
          + policy.definition.optimizationGates.length,
        runCount: policyRuns.length,
        passedRunCount: policyRuns.filter((run) => run.status === "passed").length,
        blockedRunCount: policyRuns.filter((run) => run.status === "blocked").length,
        lastRunStatus: lastRun?.status || "",
        updatedAt: Date.parse(policy.updatedAt) || 0,
        updatedLabel: formatRelativeTimestamp(policy.updatedAt),
        searchText: `${policy.name} ${policy.description} ${policy.status} ${policy.projectId || ""}`,
      };
    });
  }, [normalizedProjects, policies, runs]);

  async function createPolicy(input: AssurancePolicyCreateInput): Promise<AssurancePolicy> {
    const created = await api.createPolicy(input);
    setPolicies((current) => [created, ...current]);
    onOpenPolicy(created.id, created.name);
    return created;
  }

  async function startRun(
    policy: AssurancePolicy,
    input: AssuranceRunCreateInput,
  ): Promise<AssuranceRun> {
    const created = await api.createRun(policy.id, input);
    setRuns((current) => [created, ...current]);
    setActiveRun(created);
    setActiveRunPolicy(policy);
    onOpenRun(policy.id, created.id, policy.name);
    return created;
  }

  function replacePolicy(nextPolicy: AssurancePolicy) {
    setActivePolicy(nextPolicy);
    setPolicies((current) => [
      nextPolicy,
      ...current.filter((policy) => policy.id !== nextPolicy.id),
    ]);
  }

  if (mode === "detail") {
    if (detailLoading || !activePolicy || activePolicy.id !== selectedPolicyId) {
      return (
        <div className="assurance-centered-state">
          {error ? <p className="assurance-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading Assurance Policy…" />
          )}
        </div>
      );
    }
    return (
      <>
        <PlatformServiceDetailFrame className="assurance-detail-frame">
          <AssurancePolicyDetailPage
            policy={activePolicy}
            api={api}
            projects={normalizedProjects}
            workspaceTeams={workspaceTeams}
            controlsPortalId={controlsPortalId}
            sectionControlsPortalId={sectionControlsPortalId}
            onPolicyChange={replacePolicy}
            onReload={() => loadPolicy(activePolicy.id)}
            onRun={setRunPolicy}
            onOpenRun={(run) => onOpenRun(activePolicy.id, run.id, activePolicy.name)}
          />
        </PlatformServiceDetailFrame>
        <AssuranceRunCreateModal
          open={Boolean(runPolicy)}
          policy={runPolicy}
          onClose={() => setRunPolicy(null)}
          onCreate={startRun}
        />
      </>
    );
  }

  if (mode === "run") {
    if (
      detailLoading
      || !activeRun
      || !activeRunPolicy
      || activeRun.id !== selectedRunId
    ) {
      return (
        <div className="assurance-centered-state">
          {error ? <p className="assurance-page-error" role="alert">{error}</p> : (
            <PlatformLoadingState centered message="Loading Assurance Run…" />
          )}
        </div>
      );
    }
    return (
      <>
        <PlatformServiceDetailFrame className="assurance-detail-frame">
          <AssuranceRunDetailPage
            run={activeRun}
            policy={activeRunPolicy}
            api={api}
            projects={normalizedProjects}
            controlsPortalId={controlsPortalId}
            refreshing={refreshingRun}
            onRunChange={(nextRun) => {
              setActiveRun(nextRun);
              setRuns((current) => [
                nextRun,
                ...current.filter((run) => run.id !== nextRun.id),
              ]);
              void loadRun(nextRun.id, true);
            }}
            onRefresh={() => void loadRun(activeRun.id, true)}
            onRunAgain={() => setRunPolicy(activeRunPolicy)}
          />
        </PlatformServiceDetailFrame>
        <AssuranceRunCreateModal
          open={Boolean(runPolicy)}
          policy={runPolicy}
          onClose={() => setRunPolicy(null)}
          onCreate={startRun}
        />
      </>
    );
  }

  return (
    <>
      <AssuranceOverviewPage
        rows={overviewRows}
        loading={loading}
        error={error}
        controlsPortalId={controlsPortalId}
        onOpen={(row) => onOpenPolicy(row.id, row.name)}
        onCreate={() => setCreateOpen(true)}
      />
      <AssurancePolicyCreateModal
        open={createOpen}
        projects={normalizedProjects}
        testPlans={testPlans}
        defaultProjectId={defaultProjectId}
        onClose={() => setCreateOpen(false)}
        onCreate={createPolicy}
      />
    </>
  );
}
