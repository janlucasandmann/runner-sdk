import {
  CheckCircle2,
  CircleDot,
  Clock3,
  ExternalLink,
  FileArchive,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { ResourceDetailPage } from "../../../../../platform-ui/pages/details/index.js";
import type {
  TestCaseResult,
  TestPlan,
  TestRun,
  TestRunArtifact,
  TestWorkspaceResourceOption,
} from "../domain/index.js";

type TestRunTab = "results" | "evidence";

interface TestRunDetailPageProps {
  run: TestRun;
  plan: TestPlan;
  projects: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  agents: readonly TestWorkspaceResourceOption[];
  controlsPortalId?: string;
  refreshing?: boolean;
  onRefresh: () => void;
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
  if (!Number.isFinite(duration) || duration < 0) return "—";
  if (duration < 1_000) return `${duration} ms`;
  if (duration < 60_000) return `${(duration / 1_000).toFixed(1)} s`;
  return `${Math.floor(duration / 60_000)}m ${Math.round((duration % 60_000) / 1_000)}s`;
}

function formatStatus(value: string): string {
  return String(value || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatBytes(value: number | null): string {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1_024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
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

export function TestRunDetailPage({
  run,
  plan,
  projects,
  environments,
  agents,
  controlsPortalId,
  refreshing = false,
  onRefresh,
}: TestRunDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TestRunTab>("results");
  const portalTarget = usePortalTarget(controlsPortalId);
  const results = Array.isArray(run.results) ? run.results : [];
  const artifacts = Array.isArray(run.artifacts) ? run.artifacts : [];
  const projectLabel = projects.find((project) => project.id === run.projectId)?.name || "Unassigned";
  const environmentLabel = environments.find(
    (environment) => environment.id === run.environmentId,
  )?.name || run.environmentId || "Unknown";
  const agentLabel = agents.find((agent) => agent.id === run.agentId)?.name
    || run.agentId
    || "Platform default";
  const fingerprint = String(run.evidence?.fingerprint || "").trim();
  const planFingerprint = String(run.evidence?.planFingerprint || "").trim();
  const provenance = (
    run.evidence?.provenance
    && typeof run.evidence.provenance === "object"
    && !Array.isArray(run.evidence.provenance)
      ? run.evidence.provenance
      : {}
  ) as Record<string, unknown>;
  const attestation = (
    provenance.attestation
    && typeof provenance.attestation === "object"
    && !Array.isArray(provenance.attestation)
      ? provenance.attestation
      : {}
  ) as Record<string, unknown>;
  const evidenceTrustLevel = String(provenance.trustLevel || "legacy").trim();
  const evidenceVerificationStatus = String(
    provenance.verificationStatus || "unverified",
  ).trim();
  const trustedEvidence = (
    provenance.source === "execution_worker"
    && evidenceTrustLevel === "verified_worker"
    && evidenceVerificationStatus === "verified"
    && Boolean(attestation.attestationId)
  );
  const executorThreadId = String(
    run.metadata?.executorThreadId
    || run.metadata?.executor_thread_id
    || "",
  ).trim();

  const resultColumns = useMemo<PlatformDataTableColumn<TestCaseResult>[]>(
    () => [
      {
        id: "case",
        header: "Case",
        accessor: "name",
        sortable: true,
        width: "minmax(240px, 1.25fr)",
        cell: ({ row }) => (
          <span className="tests-table-identity">
            <CircleDot width={15} height={15} aria-hidden="true" />
            <span>
              <strong>{row.name}</strong>
              <small>{row.caseId}</small>
            </span>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(130px, .6fr)",
        cell: ({ row }) => (
          <span className={`tests-status-label is-${row.status}`}>{formatStatus(row.status)}</span>
        ),
      },
      {
        id: "exit",
        header: "Exit code",
        accessor: (row) => row.exitCode ?? Number.MAX_SAFE_INTEGER,
        width: "minmax(100px, .45fr)",
        cell: ({ row }) => row.exitCode ?? "—",
      },
      {
        id: "attempt",
        header: "Attempt",
        accessor: "attempt",
        width: "minmax(95px, .42fr)",
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
  const artifactColumns = useMemo<PlatformDataTableColumn<TestRunArtifact>[]>(
    () => [
      {
        id: "name",
        header: "Artifact",
        accessor: "name",
        sortable: true,
        width: "minmax(240px, 1.2fr)",
        cell: ({ row }) => (
          <a
            className="tests-artifact-link"
            href={row.uri}
            target="_blank"
            rel="noreferrer"
            onClick={(event) => event.stopPropagation()}
          >
            <FileArchive width={15} height={15} aria-hidden="true" />
            <span>{row.name}</span>
            <ExternalLink width={12} height={12} aria-hidden="true" />
          </a>
        ),
      },
      {
        id: "type",
        header: "Type",
        accessor: "type",
        sortable: true,
        width: "minmax(130px, .6fr)",
      },
      {
        id: "content",
        header: "Content type",
        accessor: (row) => row.contentType || "",
        width: "minmax(170px, .75fr)",
        cell: ({ row }) => row.contentType || "—",
      },
      {
        id: "size",
        header: "Size",
        accessor: (row) => row.sizeBytes || 0,
        sortable: true,
        width: "minmax(100px, .45fr)",
        cell: ({ row }) => formatBytes(row.sizeBytes),
      },
    ],
    [],
  );

  const headerActions = (
    <PlatformSecondaryButton
      size="small"
      disabled={refreshing}
      onClick={onRefresh}
    >
      <RefreshCw
        className={refreshing ? "tests-spin" : ""}
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
      <ResourceDetailPage<TestRunTab>
        tabs={[
          { id: "results", label: "Results" },
          { id: "evidence", label: "Evidence" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebar={(
          <>
            <PlatformDetailSidebarSection title="Run details">
              <div className="tests-sidebar-properties">
                <PropertyRow label="Status">
                  <span className={`tests-status-label is-${run.status}`}>
                    {formatStatus(run.status)}
                  </span>
                </PropertyRow>
                <PropertyRow label="Project">{projectLabel}</PropertyRow>
                <PropertyRow label="Environment">{environmentLabel}</PropertyRow>
                <PropertyRow label="Executor">{agentLabel}</PropertyRow>
                <PropertyRow label="Trigger">{formatStatus(run.triggerType)}</PropertyRow>
                <PropertyRow label="Attempt">{run.execution?.attempt || 1}</PropertyRow>
                <PropertyRow label="Started">{formatTimestamp(run.startedAt)}</PropertyRow>
                <PropertyRow label="Duration">{formatDuration(run.durationMs)}</PropertyRow>
              </div>
            </PlatformDetailSidebarSection>
            <PlatformDetailSidebarSection title="Traceability">
              <div className="tests-sidebar-properties">
                <PropertyRow label="Plan version">{run.versionId || "Unknown"}</PropertyRow>
                <PropertyRow label="Commit">{run.commitSha || "Not pinned"}</PropertyRow>
                <PropertyRow label="Task">{run.taskId || "Not linked"}</PropertyRow>
                <PropertyRow label="Release">{run.releaseId || "Not linked"}</PropertyRow>
                <PropertyRow label="Executor thread">{executorThreadId || "Pending"}</PropertyRow>
                <PropertyRow label="Evidence trust">
                  <span className={`tests-status-label ${trustedEvidence ? "is-passed" : "is-warning"}`}>
                    {trustedEvidence ? "Worker verified" : "Self-reported"}
                  </span>
                </PropertyRow>
              </div>
            </PlatformDetailSidebarSection>
          </>
        )}
        ariaLabel={`${plan.name} test run`}
        tabAriaLabel="Test run sections"
        sidebarAriaLabel="Test run information"
        className="tests-detail-page is-run"
        tabBarClassName="tests-detail-tabs"
        contentClassName="tests-detail-content"
        sidebarClassName="tests-detail-sidebar"
      >
        {activeTab === "results" ? (
          <div className="tests-detail-stack">
            <div className="tests-kpi-grid">
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Total</span>
                <strong>{run.totalCount}</strong>
                <small>Final case results</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card is-success">
                <span>Passed</span>
                <strong>{run.passedCount}</strong>
                <small>Verified successfully</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card is-danger">
                <span>Failed</span>
                <strong>{run.failedCount + run.errorCount}</strong>
                <small>{run.errorCount} execution errors</small>
              </PlatformUiCard>
              <PlatformUiCard as="article" className="tests-kpi-card">
                <span>Duration</span>
                <strong>{formatDuration(run.durationMs)}</strong>
                <small>{run.skippedCount} skipped</small>
              </PlatformUiCard>
            </div>

            <PlatformDataTable
              rows={results}
              columns={resultColumns}
              getRowId={(result) => result.id}
              ariaLabel="Test case results"
              className="tests-results-table"
              variant="minimalistic-ui"
              surface="plain"
              sticky={false}
              pagination={false}
              sorting={{ defaultValue: { id: "case", direction: "asc" } }}
              emptyState={(
                <PlatformEmptyState
                  icon={Clock3}
                  title={["queued", "running"].includes(run.status) ? "Test execution in progress" : "No case results"}
                  description={
                    ["queued", "running"].includes(run.status)
                      ? "The durable worker will add case-level evidence as execution completes."
                      : "This run did not retain case-level results."
                  }
                />
              )}
            />

            {results.length > 0 ? (
              <PlatformSettingsSectionList>
                {results.map((result) => (
                  <PlatformSettingsSection
                    key={result.id}
                    title={result.name}
                    description={result.summary || `${formatStatus(result.status)} on attempt ${result.attempt}.`}
                    icon={result.status === "passed"
                      ? <CheckCircle2 width={17} height={17} />
                      : <XCircle width={17} height={17} />}
                  >
                    <div className="tests-result-evidence-grid">
                      <div>
                        <span>Command</span>
                        <pre>{String(result.evidence?.command || "Not recorded")}</pre>
                      </div>
                      <div>
                        <span>Standard output</span>
                        <pre>{String(result.evidence?.stdout || "No output retained")}</pre>
                      </div>
                      <div>
                        <span>Standard error</span>
                        <pre>{String(result.evidence?.stderr || "No error output retained")}</pre>
                      </div>
                      <div>
                        <span>Diagnostics</span>
                        <pre>{JSON.stringify(result.diagnostics || {}, null, 2)}</pre>
                      </div>
                    </div>
                  </PlatformSettingsSection>
                ))}
              </PlatformSettingsSectionList>
            ) : null}
          </div>
        ) : null}

        {activeTab === "evidence" ? (
          <div className="tests-detail-stack">
            <div className={`tests-evidence-banner ${fingerprint && !trustedEvidence ? "is-untrusted" : ""}`}>
              <ShieldCheck width={21} height={21} aria-hidden="true" />
              <div>
                <strong>
                  {!fingerprint
                    ? "Evidence pending"
                    : trustedEvidence
                      ? "Worker-attested evidence"
                      : "Self-reported evidence"}
                </strong>
                <span>
                  {!fingerprint
                    ? "A terminal run produces a server-derived evidence fingerprint."
                    : trustedEvidence
                      ? "A control-plane verified worker attested the exact result and artifact sets."
                      : "The envelope is integrity-protected, but execution truth was not independently verified."}
                </span>
              </div>
            </div>
            <PlatformSettingsSectionList>
              <PlatformSettingsSection title="Evidence identity">
                <dl className="tests-evidence-identity">
                  <div><dt>Run fingerprint</dt><dd>{fingerprint || "Pending"}</dd></div>
                  <div><dt>Plan fingerprint</dt><dd>{planFingerprint || plan.planFingerprint || "Unknown"}</dd></div>
                  <div><dt>Published version</dt><dd>{run.versionId || "Unknown"}</dd></div>
                  <div><dt>Commit SHA</dt><dd>{run.commitSha || "Not pinned"}</dd></div>
                  <div><dt>Evidence source</dt><dd>{formatStatus(String(provenance.source || "legacy import"))}</dd></div>
                  <div><dt>Trust level</dt><dd>{formatStatus(evidenceTrustLevel)}</dd></div>
                  <div><dt>Verification</dt><dd>{formatStatus(evidenceVerificationStatus)}</dd></div>
                  <div><dt>Attestation</dt><dd>{String(attestation.attestationId || "None")}</dd></div>
                  <div><dt>Generated</dt><dd>{formatTimestamp(String(run.evidence?.generatedAt || run.completedAt || ""))}</dd></div>
                </dl>
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Artifacts"
                description="Durable logs, screenshots, traces, and reports produced by this run."
                bodyPresentation="flush"
              >
                <PlatformDataTable
                  rows={artifacts}
                  columns={artifactColumns}
                  getRowId={(artifact) => artifact.id}
                  ariaLabel="Test run artifacts"
                  variant="minimalistic-ui"
                  surface="plain"
                  sticky={false}
                  pagination={false}
                  emptyState={(
                    <PlatformEmptyState
                      icon={FileArchive}
                      title="No retained artifacts"
                      description="Case-level stdout, stderr, and diagnostics may still be available in Results."
                    />
                  )}
                />
              </PlatformSettingsSection>
              <PlatformSettingsSection
                title="Canonical envelope"
                description="Read-only evidence object returned by the Tests API."
              >
                <pre className="tests-evidence-json">{JSON.stringify(run.evidence || {}, null, 2)}</pre>
              </PlatformSettingsSection>
            </PlatformSettingsSectionList>
          </div>
        ) : null}
      </ResourceDetailPage>
    </>
  );
}
