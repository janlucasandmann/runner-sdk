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
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
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

function statusLabelVariant(value: string): PlatformLabelVariant {
  if (value === "passed" || value === "active") return "green";
  if (["failed", "error", "completed_with_errors"].includes(value)) return "red";
  if (["running", "queued"].includes(value)) return "blue";
  if (value === "warning") return "yellow";
  return "gray";
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
  const publishedVersion = plan.versions?.find((version) => version.id === run.versionId);
  const versionLabel = publishedVersion ? `v${publishedVersion.version}` : run.versionId || "Unknown";
  const problemCount = run.failedCount + run.errorCount;
  const caseCount = run.totalCount || results.length;
  const inProgress = ["queued", "running"].includes(run.status);
  const outcomeTitle = run.status === "queued"
    ? "Waiting to start"
    : run.status === "running"
      ? `Running ${caseCount || "the"} ${caseCount === 1 ? "case" : "cases"}`
      : run.status === "passed"
        ? `${run.passedCount || caseCount} of ${caseCount} ${caseCount === 1 ? "case" : "cases"} passed`
        : run.status === "cancelled"
          ? "Run cancelled"
          : `${problemCount} of ${caseCount} ${caseCount === 1 ? "case needs" : "cases need"} attention`;
  const outcomeDescription = run.status === "queued"
    ? `This run will use ${versionLabel} of ${plan.name} in ${environmentLabel}.`
    : run.status === "running"
      ? `Computer Agents is running ${versionLabel} of ${plan.name} in ${environmentLabel}. Results appear as each case finishes.`
      : run.status === "passed"
        ? `Every recorded case in ${versionLabel} of ${plan.name} completed successfully in ${environmentLabel}.`
        : run.status === "cancelled"
          ? `Execution stopped before every case in ${versionLabel} of ${plan.name} could finish.`
          : `Review the failed cases below to see what happened in ${versionLabel} of ${plan.name}.`;

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
            <strong>{row.name}</strong>
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
          <PlatformLabel variant={statusLabelVariant(row.status)}>
            {formatStatus(row.status)}
          </PlatformLabel>
        ),
      },
      {
        id: "summary",
        header: "Summary",
        accessor: "summary",
        width: "minmax(220px, 1fr)",
        cell: ({ row }) => (
          <span className="tests-table-summary">
            {row.summary || (row.status === "passed" ? "Completed successfully" : "Open output for details")}
          </span>
        ),
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
    ariaLabel: "Test run summary",
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
    labels: [],
    hasData: false,
    series: [],
  };
  const properties = (
    <PlatformServiceDetailPropertyList>
      <PlatformServiceDetailProperty label="Status">
        <PlatformLabel variant={statusLabelVariant(run.status)}>
          {formatStatus(run.status)}
        </PlatformLabel>
      </PlatformServiceDetailProperty>
      <PlatformServiceDetailProperty label="Test version" title={run.versionId || ""}>
        {versionLabel}
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
          <PlatformUiCard as="section" className={`tests-run-summary-card is-${run.status}`}>
            <div className="tests-run-summary-card__content">
              <span className="tests-run-summary-card__icon" aria-hidden="true">
                {run.status === "passed" ? (
                  <CheckCircle2 width={20} height={20} />
                ) : ["failed", "completed_with_errors"].includes(run.status) ? (
                  <XCircle width={20} height={20} />
                ) : (
                  <Clock3 width={20} height={20} />
                )}
              </span>
              <div>
                <span className="tests-section-kicker">Run summary</span>
                <h2>{outcomeTitle}</h2>
                <p>{outcomeDescription}</p>
              </div>
              <PlatformLabel variant={statusLabelVariant(run.status)}>
                {formatStatus(run.status)}
              </PlatformLabel>
            </div>
          </PlatformUiCard>

          <PlatformAnalyticsSection
            variant="default"
            title="Result totals"
            analytics={resultAnalytics}
            className="tests-detail-analytics"
            showChart={false}
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
            toolbar={{
              title: "Case results",
              search: {
                placeholder: "Search case results",
                getSearchText: (result) => `${result.name} ${result.status} ${result.summary}`,
              },
            }}
            emptyState={(
              <PlatformEmptyState
                icon={Clock3}
                title={inProgress ? "Test execution in progress" : "No case results"}
                description={
                  inProgress
                    ? "Results appear here as the worker completes each case."
                    : "This run finished without recording individual case results."
                }
              />
            )}
          />

          {results.length > 0 ? (
            <PlatformSettingsSectionList>
              <PlatformSettingsSection
                title="Case output"
                description="Open a case only when you need its command output or diagnostics."
              >
                <div className="tests-run-case-output-list">
                  {results.map((result) => (
                    <details key={result.id} className={`tests-run-case-output is-${result.status}`}>
                      <summary>
                        <span className="tests-run-case-output__icon" aria-hidden="true">
                          {result.status === "passed" ? (
                            <CheckCircle2 width={16} height={16} />
                          ) : ["failed", "error"].includes(result.status) ? (
                            <XCircle width={16} height={16} />
                          ) : (
                            <Clock3 width={16} height={16} />
                          )}
                        </span>
                        <span className="tests-run-case-output__copy">
                          <strong>{result.name}</strong>
                          <small>{result.summary || `${formatStatus(result.status)} on attempt ${result.attempt}.`}</small>
                        </span>
                        <PlatformLabel variant={statusLabelVariant(result.status)}>
                          {formatStatus(result.status)}
                        </PlatformLabel>
                      </summary>
                      <div className="tests-run-case-output__body">
                        <dl className="tests-run-case-metadata">
                          <div><dt>Attempt</dt><dd>{result.attempt}</dd></div>
                          <div><dt>Exit code</dt><dd>{result.exitCode ?? "—"}</dd></div>
                          <div><dt>Duration</dt><dd>{formatDuration(result.durationMs)}</dd></div>
                        </dl>
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
                      </div>
                    </details>
                  ))}
                </div>
              </PlatformSettingsSection>
            </PlatformSettingsSectionList>
          ) : null}

          <PlatformUiCard
            as="section"
            className={`tests-run-verification-card ${trustedEvidence ? "is-trusted" : fingerprint ? "is-recorded" : "is-pending"}`}
          >
            <ShieldCheck width={19} height={19} aria-hidden="true" />
            <div>
              <h2>Run evidence</h2>
              <p>
                {!fingerprint
                  ? "Evidence is created when the run finishes."
                  : trustedEvidence
                    ? "The execution worker verified that these results and artifacts belong to this exact run."
                    : "The result is fingerprinted, but the worker did not independently attest its execution."}
              </p>
            </div>
            <PlatformLabel variant={!fingerprint ? "gray" : trustedEvidence ? "green" : "yellow"}>
              {!fingerprint ? "Pending" : trustedEvidence ? "Worker verified" : "Recorded"}
            </PlatformLabel>
          </PlatformUiCard>

          <PlatformSettingsSectionList>
            <PlatformSettingsSection
              title="Artifacts"
              description="Files, screenshots, traces, and reports retained by this run."
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
                    description="No files or reports were saved for this run. Case output may still be available above."
                  />
                )}
              />
            </PlatformSettingsSection>
          </PlatformSettingsSectionList>

          <details className="tests-run-technical-details">
            <summary>
              <span>
                <strong>Technical details</strong>
                <small>Fingerprints, execution identifiers, and the raw evidence object</small>
              </span>
            </summary>
            <div className="tests-run-technical-details__body">
              <dl className="tests-evidence-identity">
                <div><dt>Run ID</dt><dd>{run.id}</dd></div>
                <div><dt>Run fingerprint</dt><dd>{fingerprint || "Pending"}</dd></div>
                <div><dt>Plan fingerprint</dt><dd>{planFingerprint || plan.planFingerprint || "Unknown"}</dd></div>
                <div><dt>Published version</dt><dd>{run.versionId || "Unknown"}</dd></div>
                <div><dt>Trigger</dt><dd>{formatStatus(run.triggerType)}</dd></div>
                <div><dt>Commit SHA</dt><dd>{run.commitSha || "Not pinned"}</dd></div>
                <div><dt>Executor thread</dt><dd>{executorThreadId || "Pending"}</dd></div>
                <div><dt>Evidence source</dt><dd>{formatStatus(String(provenance.source || "legacy import"))}</dd></div>
                <div><dt>Trust level</dt><dd>{formatStatus(evidenceTrustLevel)}</dd></div>
                <div><dt>Verification</dt><dd>{formatStatus(evidenceVerificationStatus)}</dd></div>
                <div><dt>Attestation</dt><dd>{String(attestation.attestationId || "None")}</dd></div>
                <div><dt>Generated</dt><dd>{formatTimestamp(String(run.evidence?.generatedAt || run.completedAt || ""))}</dd></div>
              </dl>
              <details className="tests-run-raw-evidence">
                <summary>Show raw evidence JSON</summary>
                <pre className="tests-evidence-json">{JSON.stringify(run.evidence || {}, null, 2)}</pre>
              </details>
            </div>
          </details>
        </div>
      </PlatformServiceDetailPage>
    </>
  );
}
