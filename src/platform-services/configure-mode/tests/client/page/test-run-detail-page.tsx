import {
  Braces,
  ChevronDown,
  Clock3,
  ExternalLink,
  FileArchive,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableAction,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformResourceDetailSidebar } from "../../../../../platform-ui/components/composite/resource-detail-sidebar/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import { PlatformSecondaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformButtonSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  PlatformServiceDetailPage,
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
  /** Kept for workspace callers that still provide the broader resource context. */
  projects?: readonly TestWorkspaceResourceOption[];
  environments: readonly TestWorkspaceResourceOption[];
  /** Kept for workspace callers that still provide the broader resource context. */
  agents?: readonly TestWorkspaceResourceOption[];
  controlsPortalId?: string;
  refreshing?: boolean;
  onRefresh: () => void;
  onRunAgain: () => void;
  onOpenTechnicalDetails?: () => void;
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
  environments,
  controlsPortalId,
  refreshing = false,
  onRefresh,
  onRunAgain,
  onOpenTechnicalDetails = () => undefined,
}: TestRunDetailPageProps) {
  const portalTarget = usePortalTarget(controlsPortalId);
  const results = Array.isArray(run.results) ? run.results : [];
  const artifacts = Array.isArray(run.artifacts) ? run.artifacts : [];
  const [expandedResultIds, setExpandedResultIds] = useState<Set<string>>(
    () => new Set(),
  );
  const toggleResultExpansion = useCallback((resultId: string) => {
    setExpandedResultIds((current) => {
      const next = new Set(current);
      if (next.has(resultId)) next.delete(resultId);
      else next.add(resultId);
      return next;
    });
  }, []);
  const environmentLabel = environments.find(
    (environment) => environment.id === run.environmentId,
  )?.name || run.environmentId || "Unknown";
  const fingerprint = String(run.evidence?.fingerprint || "").trim();
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
  const publishedVersion = plan.versions?.find((version) => version.id === run.versionId);
  const versionLabel = publishedVersion ? `v${publishedVersion.version}` : "—";
  const inProgress = ["queued", "running"].includes(run.status);

  const resultColumns = useMemo<PlatformDataTableColumn<TestCaseResult>[]>(
    () => [
      {
        id: "case",
        header: "Case",
        accessor: "name",
        width: "minmax(260px, 1fr)",
        cell: ({ row }) => (
          <span className="tests-run-case-output__copy">
            <strong>{row.name}</strong>
            <small>
              {row.summary || `${formatStatus(row.status)} on attempt ${row.attempt}.`}
            </small>
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "status",
        sortable: true,
        width: "minmax(120px, .24fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={statusLabelVariant(row.status)}>
            {formatStatus(row.status)}
          </PlatformLabel>
        ),
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

  let cumulativePassedCount = 0;
  const cumulativePassedCounts = results.map((result) => {
    if (result.status === "passed") cumulativePassedCount += 1;
    return cumulativePassedCount;
  });
  const resultAnalytics = {
    ariaLabel: "Test run analytics",
    metrics: [
      {
        id: "total",
        label: "Cases",
        value: String(run.totalCount || results.length),
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
    labels: results.map((result, index) => `Case ${index + 1}: ${result.name}`),
    hasData: results.length > 0,
    series: [
      {
        id: "pass-rate",
        label: "Pass rate",
        values: cumulativePassedCounts.map((passedCount, index) => (
          Math.round((passedCount / (index + 1)) * 100)
        )),
        color: "#8fc4ff",
        valueKind: "percent" as const,
      },
      {
        id: "passed",
        label: "Passed cases",
        values: cumulativePassedCounts,
        color: "#9ff6ce",
        axis: "secondary" as const,
      },
    ],
  };
  const sidebar = (
    <PlatformResourceDetailSidebar
      className="tests-detail-sidebar-card"
      attributes={[
        {
          id: "status",
          label: "Status",
          value: (
            <PlatformLabel variant={statusLabelVariant(run.status)}>
              {formatStatus(run.status)}
            </PlatformLabel>
          ),
        },
        { id: "test-version", label: "Test version", value: versionLabel },
        { id: "environment", label: "Environment", value: environmentLabel },
        { id: "started", label: "Started", value: formatTimestamp(run.startedAt) },
        { id: "duration", label: "Duration", value: formatDuration(run.durationMs) },
      ]}
      primaryAction={(
        <PlatformButtonSelector
          label="Run Again"
          popupAriaLabel="Test run actions"
          mode="split-action"
          buttonVariant="primary"
          buttonSize="small"
          fullWidth
          closeOnSelect
          className="tests-detail-run-button"
          onAction={onRunAgain}
        >
          <button
            type="button"
            role="menuitem"
            className="tb-popup-row"
            onClick={onOpenTechnicalDetails}
          >
            <Braces className="tb-popup-icon" aria-hidden="true" />
            <span className="tb-popup-label">Technical details</span>
          </button>
        </PlatformButtonSelector>
      )}
    />
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
        sidebarContent={sidebar}
        ariaLabel={`${plan.name} test run`}
        sidebarAriaLabel="Test run information"
        className="tests-detail-page is-run"
        contentClassName="tests-detail-content"
        sidebarClassName="tests-detail-sidebar"
      >
        <div className="tests-detail-stack">
          <PlatformAnalyticsSection
            variant="default"
            title="Result totals"
            analytics={resultAnalytics}
            className="tests-detail-analytics"
            showXAxisLabels={false}
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
            getRowActions={(result): readonly PlatformDataTableAction<TestCaseResult>[] => [{
              id: "expand",
              label: expandedResultIds.has(result.id) ? "Collapse" : "Expand",
              icon: ChevronDown,
              onSelect: () => toggleResultExpansion(result.id),
            }]}
            getRowClassName={(result) => `tests-run-case-output is-${result.status}`}
            getRowAriaLabel={(result) => `${result.name}, ${formatStatus(result.status)}`}
            onRowActivate={(result) => toggleResultExpansion(result.id)}
            isRowExpanded={(result) => expandedResultIds.has(result.id)}
            renderExpandedRow={({ row: result }) => (
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
            )}
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

          <PlatformDataTable
            rows={artifacts}
            columns={artifactColumns}
            getRowId={(artifact) => artifact.id}
            ariaLabel="Test run artifacts"
            variant="minimalistic-ui"
            surface="plain"
            sticky={false}
            pagination={false}
            toolbar={{
              title: "Artifacts",
              search: {
                placeholder: "Search artifacts",
                getSearchText: (artifact) => (
                  `${artifact.name} ${artifact.type} ${artifact.contentType || ""}`
                ),
              },
            }}
            emptyState={(
              <PlatformEmptyState
                icon={FileArchive}
                title="No retained artifacts"
                description="No files or reports were saved for this run. Case diagnostics may still be available in Case results above."
              />
            )}
          />
        </div>
      </PlatformServiceDetailPage>
    </>
  );
}
