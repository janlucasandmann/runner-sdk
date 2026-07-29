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
import { useEffect, useMemo, useState } from "react";
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
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "../../../../../platform-ui/pages/details/index.js";
import type {
  TestCaseResult,
  TestPlan,
  TestRun,
  TestRunArtifact,
  TestWorkspaceResourceOption,
} from "../domain/index.js";

interface TestRunDetailPageProps {
  run: TestRun;
  plan: TestPlan;
  projects: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  agents: readonly TestWorkspaceResourceOption[];
  controlsPortalId?: string;
  refreshing?: boolean;
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

export function TestRunDetailPage({
  run,
  plan,
  projects,
  environments,
  agents,
  controlsPortalId,
  refreshing = false,
  onRefresh,
  onRunAgain,
}: TestRunDetailPageProps) {
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

  const resultAnalytics = {
    ariaLabel: "Test run analytics",
    metrics: [
      {
        id: "total",
        label: "Cases",
        value: String(run.totalCount),
        color: "#8fc4ff",
      },
      {
        id: "passed",
        label: "Passed",
        value: String(run.passedCount),
        color: "#9ff6ce",
      },
      {
        id: "failed",
        label: "Failed",
        value: String(run.failedCount + run.errorCount),
        color: "#ff9b9b",
      },
      {
        id: "duration",
        label: "Duration",
        value: formatDuration(run.durationMs),
        color: "#7657ff",
      },
    ],
    labels: results.map((result) => result.name),
    hasData: results.length > 0,
    series: [
      {
        id: "outcome",
        label: "Case outcome",
        values: results.map((result) => result.status === "passed" ? 100 : 0),
        color: "#8fc4ff",
        valueKind: "percent" as const,
      },
      {
        id: "duration",
        label: "Duration",
        values: results.map((result) => Math.max(0, Number(result.durationMs) || 0)),
        color: "#9ff6ce",
        axis: "secondary" as const,
        valueKind: "duration" as const,
      },
    ],
  };
  const properties = (
    <PlatformServiceDetailPropertyList>
      <PlatformServiceDetailProperty label="Status">
        <span className={`tests-status-label is-${run.status}`}>
          {formatStatus(run.status)}
        </span>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Environment">
        {environmentLabel}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Executor">
        {agentLabel}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Project">
        {projectLabel}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Trigger">
        {formatStatus(run.triggerType)}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Evidence">
        <span className={`tests-status-label ${trustedEvidence ? "is-passed" : "is-warning"}`}>
          {trustedEvidence ? "Worker verified" : "Self-reported"}
        </span>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Plan version" title={run.versionId || ""}>
        {run.versionId || "Unknown"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Commit" title={run.commitSha || ""}>
        {run.commitSha || "Not pinned"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Thread" title={executorThreadId}>
        {executorThreadId || "Pending"}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Started">
        {formatTimestamp(run.startedAt)}
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Duration">
        {formatDuration(run.durationMs)}
      </PlatformServiceDetailProperty>
      <PlatformPrimaryButton
        size="small"
        fullWidth
        className="tests-detail-run-button"
        onClick={onRunAgain}
      >
        Run Again
      </PlatformPrimaryButton>
    </PlatformServiceDetailPropertyList>
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
      <PlatformServiceDetailPage
        variant="run"
        properties={properties}
        ariaLabel={`${plan.name} test run`}
        sidebarAriaLabel="Test run information"
        className="tests-detail-page is-run"
        contentClassName="tests-detail-content"
        sidebarClassName="tests-detail-sidebar"
        propertiesCardClassName="tests-detail-sidebar-card"
      >
        <div className="tests-detail-stack">
          <PlatformUiCard
            as="section"
            cardTitle="Execution evidence"
            className={`tests-run-evidence-card ${fingerprint && !trustedEvidence ? "is-untrusted" : trustedEvidence ? "is-trusted" : "is-pending"}`}
          >
            <div className="tests-evidence-banner-copy">
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
            <dl className="tests-run-evidence-grid">
              <div><dt>Evidence</dt><dd title={fingerprint}>{fingerprint || "Pending"}</dd></div>
              <div><dt>Plan</dt><dd title={planFingerprint}>{planFingerprint || plan.planFingerprint || "Unknown"}</dd></div>
              <div><dt>Trust</dt><dd>{formatStatus(evidenceTrustLevel)}</dd></div>
              <div><dt>Verification</dt><dd>{formatStatus(evidenceVerificationStatus)}</dd></div>
            </dl>
          </PlatformUiCard>

          <PlatformAnalyticsSection
            variant="default"
            title="Analytics"
            analytics={resultAnalytics}
            className="tests-detail-analytics"
            showXAxisLabels
          />

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
      </PlatformServiceDetailPage>
    </>
  );
}
