import {
  BadgeCheck,
  Ban,
  CheckCircle2,
  CircleDot,
  Clock3,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState } from "react";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformConfirmationModal,
} from "../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../platform-ui/components/composite/settings-section/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "../../../../../platform-ui/pages/details/index.js";
import type { AssuranceApi } from "../api/index.js";
import type {
  AssuranceGateResult,
  AssurancePolicy,
  AssuranceRun,
  AssuranceRunEvent,
  AssuranceWorkspaceOption,
} from "../domain/index.js";

interface AssuranceRunDetailPageProps {
  run: AssuranceRun;
  policy: AssurancePolicy;
  api: AssuranceApi;
  projects: readonly AssuranceWorkspaceOption[];
  controlsPortalId?: string;
  refreshing?: boolean;
  onRunChange: (run: AssuranceRun) => void;
  onRefresh: () => void;
  onRunAgain: () => void;
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

export function AssuranceRunDetailPage({
  run,
  policy,
  api,
  projects,
  controlsPortalId,
  refreshing = false,
  onRunChange,
  onRefresh,
  onRunAgain,
}: AssuranceRunDetailPageProps) {
  const [busyAction, setBusyAction] = useState("");
  const [confirmAction, setConfirmAction] = useState<"approve" | "cancel" | "">("");
  const [error, setError] = useState("");
  const portalTarget = usePortalTarget(controlsPortalId);
  const gates = Array.isArray(run.evidence?.gates) ? run.evidence.gates : [];
  const events = Array.isArray(run.events) ? run.events : [];
  const evidenceFingerprint = String(run.evidence?.fingerprint || "").trim();
  const decisionFingerprint = String(run.decision?.fingerprint || "").trim();
  const decisionOutcome = String(run.decision?.outcome || run.status || "").trim();
  const technicalOutcome = String(run.decision?.technicalOutcome || "").trim();
  const totalCostUsd = Number(run.evidence?.cost?.totalCostUsd);
  const projectLabel = projects.find((project) => project.id === run.projectId)?.name
    || run.projectId
    || "Unassigned";
  const passedGateCount = gates.filter((gate) => gate.status === "passed").length;
  const failedGateCount = gates.filter((gate) => gate.status === "failed").length;
  const pendingGateCount = gates.filter((gate) => gate.status === "pending").length;

  const gateColumns = useMemo<PlatformDataTableColumn<AssuranceGateResult>[]>(
    () => [
      {
        id: "gate",
        header: "Gate",
        accessor: "id",
        width: "minmax(220px, 1fr)",
        cell: ({ row }) => (
          <span className="assurance-table-identity">
            {row.status === "passed"
              ? <CheckCircle2 width={15} height={15} aria-hidden="true" />
              : row.status === "failed"
                ? <XCircle width={15} height={15} aria-hidden="true" />
                : <Clock3 width={15} height={15} aria-hidden="true" />}
            <span><strong>{row.id}</strong><small>{formatStatus(row.kind)}</small></span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(130px, .55fr)",
        cell: ({ row }) => (
          <span className={`assurance-status-label is-${row.status}`}>
            {formatStatus(row.status)}
          </span>
        ),
      },
      {
        id: "reason",
        header: "Decision reason",
        accessor: "reason",
        width: "minmax(300px, 1.5fr)",
      },
      {
        id: "evidence",
        header: "Evidence",
        accessor: (row) => row.evidenceId || "",
        width: "minmax(210px, .9fr)",
        cell: ({ row }) => row.evidenceId || "Pending",
      },
    ],
    [],
  );
  const eventColumns = useMemo<PlatformDataTableColumn<AssuranceRunEvent>[]>(
    () => [
      {
        id: "event",
        header: "Event",
        accessor: "type",
        sortable: true,
        width: "minmax(180px, .7fr)",
        cell: ({ row }) => (
          <span className="assurance-table-identity">
            <CircleDot width={15} height={15} aria-hidden="true" />
            <span><strong>{formatStatus(row.type)}</strong><small>{row.id}</small></span>
          </span>
        ),
      },
      {
        id: "actor",
        header: "Actor",
        accessor: (row) => row.actorUserId || "",
        width: "minmax(180px, .75fr)",
        cell: ({ row }) => row.actorUserId || "Control plane",
      },
      {
        id: "time",
        header: "Timestamp",
        accessor: (row) => Date.parse(row.createdAt) || 0,
        sortable: true,
        sortDescFirst: true,
        width: "minmax(180px, .75fr)",
        cell: ({ row }) => formatTimestamp(row.createdAt),
      },
      {
        id: "payload",
        header: "Audit payload",
        accessor: (row) => JSON.stringify(row.payload),
        width: "minmax(280px, 1.3fr)",
        cell: ({ row }) => (
          <code className="assurance-event-payload">{JSON.stringify(row.payload)}</code>
        ),
      },
    ],
    [],
  );

  async function evaluate() {
    if (busyAction) return;
    setBusyAction("evaluate");
    setError("");
    try {
      onRunChange(await api.evaluateRun(run.id));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to evaluate the run.");
    } finally {
      setBusyAction("");
    }
  }

  async function approve() {
    if (busyAction || !evidenceFingerprint) return;
    setBusyAction("approve");
    setError("");
    try {
      onRunChange(await api.approveRun(run.id, evidenceFingerprint));
      setConfirmAction("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to approve the run.");
      throw nextError;
    } finally {
      setBusyAction("");
    }
  }

  async function cancel() {
    if (busyAction) return;
    setBusyAction("cancel");
    setError("");
    try {
      onRunChange(await api.cancelRun(run.id));
      setConfirmAction("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to cancel the run.");
      throw nextError;
    } finally {
      setBusyAction("");
    }
  }

  const terminal = ["passed", "failed", "cancelled"].includes(run.status);
  const runAnalytics = {
    ariaLabel: "Assurance Run analytics",
    metrics: [
      {
        id: "passed",
        label: "Passed Gates",
        value: String(passedGateCount),
        color: "#9ff6ce",
      },
      {
        id: "failed",
        label: "Failed Gates",
        value: String(failedGateCount),
        color: "#ff9b9b",
      },
      {
        id: "pending",
        label: "Pending Gates",
        value: String(pendingGateCount),
        color: "#8fc4ff",
      },
      {
        id: "cost",
        label: "Evidence Cost",
        value: Number.isFinite(totalCostUsd) ? `$${totalCostUsd.toFixed(2)}` : "—",
        color: "#7657ff",
      },
    ],
    labels: gates.map((gate) => gate.id),
    hasData: gates.length > 0,
    series: [
      {
        id: "outcome",
        label: "Gate outcome",
        values: gates.map((gate) => gate.status === "passed" ? 100 : 0),
        color: "#8fc4ff",
        valueKind: "percent" as const,
      },
    ],
  };
  const properties = (
    <PlatformServiceDetailPropertyList>
      <PlatformServiceDetailProperty label="Status">
        <span className={`assurance-status-label is-${run.status}`}>
          {formatStatus(run.status)}
        </span>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Project">
        {projectLabel}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Release" title={run.releaseId || ""}>
        {run.releaseId || "Not linked"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Commit" title={run.commitSha || ""}>
        {run.commitSha || "Not pinned"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Policy">
        {policy.name}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Version" title={run.policyVersionId}>
        {run.policyVersionId}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Evidence" title={evidenceFingerprint}>
        {evidenceFingerprint ? `${evidenceFingerprint.slice(0, 18)}…` : "Pending"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Decision" title={decisionFingerprint}>
        {decisionFingerprint ? `${decisionFingerprint.slice(0, 18)}…` : "Pending"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Completed">
        {formatTimestamp(run.completedAt)}
      </PlatformServiceDetailProperty>
      <PlatformPrimaryButton
        size="small"
        fullWidth
        className="assurance-detail-run-button"
        onClick={onRunAgain}
      >
        Run Again
      </PlatformPrimaryButton>
    </PlatformServiceDetailPropertyList>
  );
  const sidebarActions = (
    <div className="platform-service-detail-page__sidebar-actions">
      {!terminal ? (
        <PlatformSecondaryButton
          size="small"
          disabled={Boolean(busyAction)}
          onClick={() => void evaluate()}
        >
          <ShieldCheck width={14} height={14} aria-hidden="true" />
          {busyAction === "evaluate" ? "Evaluating…" : "Evaluate"}
        </PlatformSecondaryButton>
      ) : null}
      {run.status === "blocked" ? (
        <PlatformPrimaryButton
          size="small"
          disabled={Boolean(busyAction) || !evidenceFingerprint}
          onClick={() => setConfirmAction("approve")}
        >
          <BadgeCheck width={14} height={14} aria-hidden="true" />
          Approve Release
        </PlatformPrimaryButton>
      ) : null}
      {!terminal ? (
        <PlatformSecondaryButton
          size="small"
          className="assurance-danger-button"
          disabled={Boolean(busyAction)}
          onClick={() => setConfirmAction("cancel")}
        >
          <Ban width={14} height={14} aria-hidden="true" />
          Cancel
        </PlatformSecondaryButton>
      ) : null}
    </div>
  );
  const headerActions = (
    <PlatformSecondaryButton
      size="small"
      disabled={refreshing || Boolean(busyAction)}
      onClick={onRefresh}
    >
      <RefreshCw
        className={refreshing ? "assurance-spin" : ""}
        width={14}
        height={14}
        aria-hidden="true"
      />
      Refresh
    </PlatformSecondaryButton>
  );

  return (
    <>
      {portalTarget ? createPortal(headerActions, portalTarget) : null}
      <PlatformServiceDetailPage
        variant="run"
        properties={properties}
        actions={sidebarActions}
        ariaLabel={`${policy.name} Assurance Run`}
        sidebarAriaLabel="Assurance Run information"
        className="assurance-detail-page is-run"
        contentClassName="assurance-detail-content"
        sidebarClassName="assurance-detail-sidebar"
        propertiesCardClassName="assurance-detail-sidebar-card"
        actionsCardClassName="assurance-detail-sidebar-card"
      >
        {error ? (
          <PlatformUiCard as="div" className="assurance-inline-error" role="alert">
            {error}
          </PlatformUiCard>
        ) : null}

        <div className="assurance-detail-stack">
          <PlatformUiCard
            as="section"
            cardTitle="Execution evidence"
            className={`assurance-run-evidence-card ${evidenceFingerprint ? "is-trusted" : "is-pending"}`}
          >
            <div className="assurance-run-evidence-summary">
              <Fingerprint width={21} height={21} aria-hidden="true" />
              <div>
                <strong>{evidenceFingerprint ? "Canonical evidence fingerprinted" : "Evidence pending"}</strong>
                <span>
                  Manual approval is valid only for the exact evidence fingerprint shown here.
                </span>
              </div>
            </div>
            <dl className="assurance-run-evidence-grid">
              <div><dt>Evidence</dt><dd title={evidenceFingerprint}>{evidenceFingerprint || "Pending"}</dd></div>
              <div><dt>Decision</dt><dd title={decisionFingerprint}>{decisionFingerprint || "Pending"}</dd></div>
              <div><dt>Policy version</dt><dd>{run.policyVersionId}</dd></div>
              <div><dt>Approval</dt><dd>{run.approval.approvedAt ? formatTimestamp(run.approval.approvedAt) : "Not approved"}</dd></div>
            </dl>
          </PlatformUiCard>

          <div className={`assurance-decision-banner is-${run.status}`}>
            <BadgeCheck width={21} height={21} aria-hidden="true" />
            <div>
              <strong>{formatStatus(decisionOutcome || run.status)}</strong>
              <span>
                {technicalOutcome
                  ? `Technical outcome: ${formatStatus(technicalOutcome)}.`
                  : "The control plane is waiting for sufficient canonical evidence."}
              </span>
            </div>
          </div>

          <PlatformAnalyticsSection
            variant="default"
            title="Analytics"
            analytics={runAnalytics}
            className="assurance-detail-analytics"
            showXAxisLabels
          />

          <PlatformDataTable
            rows={gates}
            columns={gateColumns}
            getRowId={(gate) => `${gate.kind}:${gate.id}`}
            ariaLabel="Assurance gate decisions"
            variant="minimalistic-ui"
            surface="plain"
            sticky={false}
            pagination={false}
            emptyState={(
              <PlatformEmptyState
                icon={Clock3}
                title="Evidence evaluation pending"
                description="Evaluate this run after its canonical evidence references are available."
              />
            )}
          />

          <PlatformSettingsSectionList>
            <PlatformSettingsSection title="Evidence references">
              <dl className="assurance-evidence-identity">
                <div>
                  <dt>Test Runs</dt>
                  <dd>{run.evidenceReferences.testRunIds.join(", ") || "None"}</dd>
                </div>
                <div>
                  <dt>Evaluation Runs</dt>
                  <dd>{run.evidenceReferences.evaluationRunIds.join(", ") || "None"}</dd>
                </div>
                <div>
                  <dt>Optimization Jobs</dt>
                  <dd>{run.evidenceReferences.optimizationJobIds.join(", ") || "None"}</dd>
                </div>
                <div><dt>Evidence fingerprint</dt><dd>{evidenceFingerprint || "Pending"}</dd></div>
                <div><dt>Decision fingerprint</dt><dd>{decisionFingerprint || "Pending"}</dd></div>
              </dl>
            </PlatformSettingsSection>
            <PlatformSettingsSection
              title="Canonical evidence envelope"
              description="Read-only server-derived evidence. Browser-authored summaries are never release proof."
            >
              <pre className="assurance-evidence-json">{JSON.stringify(run.evidence || {}, null, 2)}</pre>
            </PlatformSettingsSection>
            <PlatformSettingsSection
              title="Canonical decision envelope"
              description="The decision fingerprint binds the policy version, evidence, release, project, and approval."
            >
              <pre className="assurance-evidence-json">{JSON.stringify(run.decision || {}, null, 2)}</pre>
            </PlatformSettingsSection>
          </PlatformSettingsSectionList>

          <PlatformDataTable
            rows={events}
            columns={eventColumns}
            getRowId={(event) => event.id}
            ariaLabel="Assurance Run audit log"
            variant="minimalistic-ui"
            surface="plain"
            sticky={false}
            pagination={false}
            sorting={{ defaultValue: { id: "time", direction: "asc" } }}
            toolbar={{ title: "Audit Log" }}
            emptyState={(
              <PlatformEmptyState
                icon={CircleDot}
                title="No audit events retained"
                description="Control-plane mutations will appear here with actor and fingerprint context."
              />
            )}
          />
        </div>
      </PlatformServiceDetailPage>

      <PlatformConfirmationModal
        open={confirmAction === "approve"}
        title="Approve this release evidence?"
        description={`Approval is permanently bound to ${evidenceFingerprint || "the current evidence fingerprint"}. Changed evidence requires a new approval.`}
        confirmLabel="Approve Release"
        confirmingLabel="Approving…"
        onCancel={() => setConfirmAction("")}
        onConfirm={approve}
      />
      <PlatformConfirmationModal
        open={confirmAction === "cancel"}
        title="Cancel this Assurance Run?"
        description="The run becomes terminal and cannot accept additional evidence."
        confirmLabel="Cancel Run"
        confirmingLabel="Cancelling…"
        tone="destructive"
        onCancel={() => setConfirmAction("")}
        onConfirm={cancel}
      />
    </>
  );
}
