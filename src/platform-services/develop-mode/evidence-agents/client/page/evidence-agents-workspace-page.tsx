import {
  AlertTriangle,
  ArrowLeft,
  BookOpenCheck,
  CheckCircle2,
  Database,
  FileCheck2,
  RefreshCw,
  SearchCheck,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { PlatformDataTableColumn } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformDataTable } from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  type PlatformHomeFeatureCard,
  PlatformHomeFeatureGrid,
} from "../../../../../platform-ui/pages/home/index.js";
import { useEvidenceAgentsRepository } from "../api/index.js";
import type {
  EvidenceDirection,
  EvidenceReviewOverview,
  EvidenceReviewTaskDetail,
  EvidenceReviewTaskRow,
  EvidenceServiceResource,
} from "../domain/index.js";

export interface DevelopEvidenceAgentsWorkspacePageProps {
  onResourcesHeaderChange?: (state: Record<string, unknown>) => void;
}

const DIRECTIONS: readonly EvidenceDirection[] = [
  "increase",
  "decrease",
  "positive",
  "negative",
  "no_difference",
  "no_association",
  "mixed",
  "not_applicable",
  "unknown",
];

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : String(error || "The evidence service request failed.");
}

function titleCase(value: string) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatTimestamp(value: string) {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Unknown";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(parsed));
}

function severityVariant(
  severity: EvidenceReviewTaskRow["severity"],
): "gray" | "yellow" | "red" {
  if (severity === "critical" || severity === "high") return "red";
  if (severity === "medium") return "yellow";
  return "gray";
}

function EvidenceServiceUnavailable({
  onRetry,
  error,
}: {
  onRetry: () => void;
  error?: string;
}) {
  return (
    <div className="develop-evidence-agents__empty">
      <PlatformEmptyState
        icon={error ? AlertTriangle : Database}
        title={error ? "Evidence Agents are unavailable" : "Connect an evidence service"}
        description={
          error
            ? error
            : "Deploy the Equal Care evidence function with a connected canonical database. It will appear here automatically for this organization."
        }
        primaryAction={{
          label: "Check again",
          icon: RefreshCw,
          onClick: onRetry,
        }}
      />
    </div>
  );
}

function EvidenceReviewDetail({
  service,
  review,
  busy,
  error,
  onBack,
  onApprove,
  onReject,
}: {
  service: EvidenceServiceResource;
  review: EvidenceReviewTaskDetail;
  busy: boolean;
  error: string;
  onBack: () => void;
  onApprove: (
    rationale: string,
    patch: { normalized_statement: string; direction: EvidenceDirection },
  ) => Promise<void>;
  onReject: (rationale: string) => Promise<void>;
}) {
  const [statement, setStatement] = useState(review.candidate.normalized_statement);
  const [direction, setDirection] = useState(review.candidate.direction);
  const [rationale, setRationale] = useState("");
  const rationaleValid = rationale.trim().length >= 10;
  const source = review.source_spans[0] || null;

  return (
    <main className="develop-evidence-agents develop-evidence-agents--detail">
      <PlatformPageHero
        title="Review finding"
        description={review.publication.title || review.publication.publication_id}
        actionsContent={(
          <PlatformSecondaryButton size="small" onClick={onBack} disabled={busy}>
            <ArrowLeft width={15} height={15} aria-hidden="true" />
            Back to queue
          </PlatformSecondaryButton>
        )}
      />

      <div className="develop-evidence-agents__detail-grid">
        <section className="develop-evidence-agents__detail-main">
          <PlatformUiCard className="develop-evidence-agents__review-card">
            <header className="develop-evidence-agents__card-header">
              <div>
                <span className="develop-evidence-agents__eyebrow">Normalized finding</span>
                <h2>Scientific claim</h2>
              </div>
              <PlatformLabel variant={severityVariant(review.severity)}>
                {titleCase(review.severity)}
              </PlatformLabel>
            </header>
            <label className="develop-evidence-agents__field">
              <span>Finding statement</span>
              <textarea
                rows={5}
                value={statement}
                disabled={busy}
                onChange={(event) => setStatement(event.target.value)}
              />
            </label>
            <div className="develop-evidence-agents__field">
              <span>Direction</span>
              <PlatformSelector
                value={direction}
                ariaLabel="Finding direction"
                fullWidth
                disabled={busy}
                options={DIRECTIONS.map((value) => ({
                  value,
                  label: titleCase(value),
                }))}
                onValueChange={(value) => setDirection(value)}
              />
            </div>
          </PlatformUiCard>

          <PlatformUiCard className="develop-evidence-agents__review-card">
            <header className="develop-evidence-agents__card-header">
              <div>
                <span className="develop-evidence-agents__eyebrow">Exact provenance</span>
                <h2>Source evidence</h2>
              </div>
              <PlatformLabel variant="green">
                {source ? titleCase(source.verification_status) : "Unavailable"}
              </PlatformLabel>
            </header>
            {source ? (
              <>
                <blockquote className="develop-evidence-agents__quote">
                  {source.exact_quote}
                </blockquote>
                <p className="develop-evidence-agents__source-location">
                  {[
                    source.location.section_title,
                    source.location.table_label,
                    source.location.page_start
                      ? `Page ${source.location.page_start}`
                      : null,
                  ].filter(Boolean).join(" · ") || titleCase(source.location_type)}
                </p>
              </>
            ) : (
              <PlatformEmptyState
                icon={AlertTriangle}
                title="No source span"
                description="This candidate cannot be approved without exact source evidence."
              />
            )}
          </PlatformUiCard>

          <PlatformUiCard className="develop-evidence-agents__review-card">
            <header className="develop-evidence-agents__card-header">
              <div>
                <span className="develop-evidence-agents__eyebrow">Decision record</span>
                <h2>Reviewer rationale</h2>
              </div>
            </header>
            <label className="develop-evidence-agents__field">
              <span>Rationale</span>
              <textarea
                rows={4}
                value={rationale}
                disabled={busy}
                placeholder="Record why the finding should be accepted or rejected."
                onChange={(event) => setRationale(event.target.value)}
              />
            </label>
            {error ? (
              <p className="develop-evidence-agents__error" role="alert">{error}</p>
            ) : null}
            <div className="develop-evidence-agents__decision-actions">
              <PlatformPrimaryButton
                size="medium"
                disabled={busy || !review.can_approve || !rationaleValid || !statement.trim()}
                onClick={() => onApprove(rationale, {
                  normalized_statement: statement.trim(),
                  direction,
                })}
              >
                Approve and publish
              </PlatformPrimaryButton>
              <PlatformSecondaryButton
                size="medium"
                disabled={busy || !review.can_reject || !rationaleValid}
                onClick={() => onReject(rationale)}
              >
                Reject candidate
              </PlatformSecondaryButton>
            </div>
          </PlatformUiCard>
        </section>

        <aside className="develop-evidence-agents__detail-sidebar">
          <PlatformUiCard variant="sidebar">
            <h2>Review details</h2>
            <dl className="develop-evidence-agents__properties">
              <div><dt>Service</dt><dd>{service.name}</dd></div>
              <div><dt>Confidence</dt><dd>{Math.round(review.candidate.extraction_confidence * 100)}%</dd></div>
              <div><dt>Finding type</dt><dd>{titleCase(review.candidate.finding_kind)}</dd></div>
              <div><dt>Schema</dt><dd>{titleCase(review.candidate.schema_validation_status)}</dd></div>
              <div><dt>Provenance</dt><dd>{titleCase(review.candidate.provenance_validation_status)}</dd></div>
              <div><dt>Created</dt><dd>{formatTimestamp(review.created_at)}</dd></div>
            </dl>
          </PlatformUiCard>
          <PlatformUiCard variant="sidebar">
            <h2>Publication</h2>
            <dl className="develop-evidence-agents__properties">
              <div><dt>Journal</dt><dd>{review.publication.journal || "Unknown"}</dd></div>
              <div><dt>Year</dt><dd>{review.publication.publication_year || "Unknown"}</dd></div>
              <div><dt>PMID</dt><dd>{review.publication.pmid || "—"}</dd></div>
              <div><dt>DOI</dt><dd>{review.publication.doi || "—"}</dd></div>
              <div><dt>Study</dt><dd>{titleCase(review.study.study_kind)}</dd></div>
            </dl>
          </PlatformUiCard>
          <PlatformUiCard variant="sidebar">
            <h2>Extraction</h2>
            <div className="develop-evidence-agents__assertion-list">
              {review.candidate.variable_assertions.map((assertion, index) => (
                <div key={`${assertion.role}-${assertion.label}-${index}`}>
                  <span>{titleCase(assertion.role)}</span>
                  <strong>{assertion.normalized_value || assertion.raw_value || assertion.label}</strong>
                </div>
              ))}
              {review.candidate.statistic_assertions.map((statistic, index) => (
                <div key={`${statistic.kind}-${index}`}>
                  <span>{titleCase(statistic.kind)}</span>
                  <strong>{statistic.raw_text}</strong>
                </div>
              ))}
            </div>
          </PlatformUiCard>
        </aside>
      </div>
    </main>
  );
}

export function DevelopEvidenceAgentsWorkspacePage({
  onResourcesHeaderChange,
}: DevelopEvidenceAgentsWorkspacePageProps) {
  const repository = useEvidenceAgentsRepository();
  const [services, setServices] = useState<EvidenceServiceResource[]>([]);
  const [service, setService] = useState<EvidenceServiceResource | null>(null);
  const [overview, setOverview] = useState<EvidenceReviewOverview | null>(null);
  const [reviews, setReviews] = useState<EvidenceReviewTaskRow[]>([]);
  const [selectedReview, setSelectedReview] = useState<EvidenceReviewTaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("open,in_review");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const nextServices = await repository.listServices(signal);
      const nextService = nextServices.find((item) => item.status === "deployed")
        || nextServices[0]
        || null;
      setServices(nextServices);
      setService(nextService);
      if (!nextService) {
        setOverview(null);
        setReviews([]);
        return;
      }
      const [nextOverview, nextReviews] = await Promise.all([
        repository.getOverview(nextService.id, signal),
        repository.listReviews(nextService.id, {
          status,
          query: search,
          limit: 100,
        }, signal),
      ]);
      setOverview(nextOverview);
      setReviews(nextReviews.data);
    } catch (nextError) {
      if ((nextError as { name?: string })?.name !== "AbortError") {
        setError(errorMessage(nextError));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [repository, search, status]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => {
    onResourcesHeaderChange?.({
      mode: selectedReview ? "detail" : "overview",
      resourceType: "evidence_review",
      title: selectedReview?.publication.title || "Evidence Agents",
      onOverviewClick: selectedReview ? () => setSelectedReview(null) : undefined,
    });
  }, [onResourcesHeaderChange, selectedReview]);

  const openReview = useCallback(async (row: EvidenceReviewTaskRow) => {
    if (!service) return;
    setDetailLoading(true);
    setDetailError("");
    try {
      setSelectedReview(await repository.getReview(service.id, row.review_task_id));
    } catch (nextError) {
      setDetailError(errorMessage(nextError));
    } finally {
      setDetailLoading(false);
    }
  }, [repository, service]);

  const decide = useCallback(async (
    kind: "approve" | "reject",
    rationale: string,
    patch?: { normalized_statement: string; direction: EvidenceDirection },
  ) => {
    if (!service || !selectedReview) return;
    setBusy(true);
    setDetailError("");
    try {
      const result = kind === "approve"
        ? await repository.approveReview(service.id, selectedReview.review_task_id, {
          rationale,
          candidate_patch: patch,
        })
        : await repository.rejectReview(service.id, selectedReview.review_task_id, {
          rationale,
        });
      if (!result.ok) {
        const blockers = (result.blockers || []).map((blocker) => (
          typeof blocker === "string" ? blocker : blocker.message || blocker.code
        )).filter(Boolean);
        throw new Error(blockers.join(" ") || "The review still has unresolved blockers.");
      }
      setSelectedReview(null);
      await load();
    } catch (nextError) {
      setDetailError(errorMessage(nextError));
    } finally {
      setBusy(false);
    }
  }, [load, repository, selectedReview, service]);

  const columns = useMemo<readonly PlatformDataTableColumn<EvidenceReviewTaskRow>[]>(() => [
    {
      id: "finding",
      header: "Finding",
      accessor: (row) => row.candidate?.normalized_statement || "",
      cell: ({ row }) => (
        <div className="develop-evidence-agents__finding-cell">
          <strong>{row.candidate?.normalized_statement || "Candidate unavailable"}</strong>
          <span>{titleCase(row.candidate?.finding_kind || "unknown")}</span>
        </div>
      ),
      sortable: true,
      width: "42%",
    },
    {
      id: "publication",
      header: "Publication",
      accessor: (row) => row.publication?.title || "",
      cell: ({ row }) => (
        <div className="develop-evidence-agents__publication-cell">
          <strong>{row.publication?.title || row.publication?.publication_id || "Unknown"}</strong>
          <span>{[row.publication?.journal, row.publication?.publication_year].filter(Boolean).join(" · ")}</span>
        </div>
      ),
      sortable: true,
      width: "30%",
    },
    {
      id: "confidence",
      header: "Confidence",
      accessor: (row) => row.candidate?.extraction_confidence || 0,
      cell: ({ row }) => `${Math.round((row.candidate?.extraction_confidence || 0) * 100)}%`,
      sortable: true,
      width: "110px",
    },
    {
      id: "severity",
      header: "Severity",
      accessor: "severity",
      cell: ({ row }) => (
        <PlatformLabel variant={severityVariant(row.severity)}>
          {titleCase(row.severity)}
        </PlatformLabel>
      ),
      sortable: true,
      width: "120px",
    },
    {
      id: "created",
      header: "Created",
      accessor: "created_at",
      cell: ({ row }) => formatTimestamp(row.created_at),
      sortable: true,
      width: "180px",
    },
  ], []);

  if (detailLoading) {
    return (
      <div className="develop-evidence-agents__loading">
        <PlatformLoadingState centered message="Loading evidence review..." />
      </div>
    );
  }
  if (selectedReview && service) {
    return (
      <EvidenceReviewDetail
        service={service}
        review={selectedReview}
        busy={busy}
        error={detailError}
        onBack={() => setSelectedReview(null)}
        onApprove={(rationale, patch) => decide("approve", rationale, patch)}
        onReject={(rationale) => decide("reject", rationale)}
      />
    );
  }

  const featureCards: readonly PlatformHomeFeatureCard[] = [
    {
      id: "workflow",
      title: "Review scientific evidence",
      description:
        "Evidence Agents turn complete papers into atomic, structured findings without losing the exact text, document revision, or extraction history.",
      icon: SearchCheck,
      iconTone: "blue",
      links: [
        { id: "source", label: "Exact source spans", meta: "Required" },
        { id: "structure", label: "Typed variables and statistics", meta: "Strict schema" },
        { id: "boundary", label: "Human publication boundary", meta: "Atomic" },
      ],
    },
    {
      id: "metrics",
      title: service ? "Evidence status" : "Service status",
      description: service
        ? `${service.name} is connected. Only accepted findings enter the verified evidence projection.`
        : "Deploy and bind the Equal Care evidence service to begin reviewing extracted findings.",
      icon: service ? FileCheck2 : Database,
      iconTone: service ? "violet" : "white",
      links: service ? [
        { id: "pending", label: "Pending reviews", meta: String(overview?.pending_reviews || 0) },
        { id: "critical", label: "Critical reviews", meta: String(overview?.critical_reviews || 0) },
        { id: "facts", label: "Verified findings", meta: String(overview?.verified_findings || 0) },
        { id: "publications", label: "Publications", meta: String(overview?.publications || 0) },
      ] : [
        { id: "function", label: "Evidence function", meta: "Required" },
        { id: "database", label: "Canonical database", meta: "Required" },
        { id: "permission", label: "Promotion permission", meta: "Owner / admin" },
      ],
    },
  ];

  return (
    <main className="develop-evidence-agents">
      <PlatformPageHero
        title="Evidence Agents"
        description="Human review and publication control for traceable scientific evidence."
        actionsContent={service ? (
          <PlatformSecondaryButton size="small" onClick={() => void load()} disabled={loading}>
            <RefreshCw width={15} height={15} aria-hidden="true" />
            Refresh
          </PlatformSecondaryButton>
        ) : null}
      />
      <PlatformHomeFeatureGrid
        cards={featureCards}
        ariaLabel="Evidence Agents capabilities and status"
        className="develop-evidence-agents__features"
      />

      {loading && !service ? (
        <div className="develop-evidence-agents__loading">
          <PlatformLoadingState centered message="Loading Evidence Agents..." />
        </div>
      ) : !service || error ? (
        <EvidenceServiceUnavailable onRetry={() => void load()} error={error} />
      ) : (
        <section className="develop-evidence-agents__queue" aria-labelledby="evidence-review-queue">
          <PlatformDataTable
            rows={reviews}
            columns={columns}
            getRowId={(row) => row.review_task_id}
            ariaLabel="Evidence review queue"
            onRowActivate={(row) => void openReview(row)}
            loading={loading}
            surface="plain"
            variant="minimalistic-ui"
            pagination={{ defaultValue: { pageIndex: 0, pageSize: 20 } }}
            toolbar={{
              title: <h2 id="evidence-review-queue">Review queue</h2>,
              search: {
                value: search,
                onChange: setSearch,
                placeholder: "Search findings or publications",
                ariaLabel: "Search evidence reviews",
                manual: true,
              },
              filters: [{
                id: "status",
                label: "Status",
                value: status,
                options: [
                  { id: "open,in_review", label: "Pending" },
                  { id: "resolved", label: "Approved" },
                  { id: "rejected", label: "Rejected" },
                  { id: "all", label: "All" },
                ],
                onChange: setStatus,
              }],
            }}
            emptyState={(
              <PlatformEmptyState
                icon={CheckCircle2}
                title="Review queue is clear"
                description="New extraction candidates will appear here before they can enter the verified evidence view."
              />
            )}
            noResultsState={(
              <PlatformEmptyState
                icon={BookOpenCheck}
                title="No matching reviews"
                description="Try another search term or status filter."
              />
            )}
          />
        </section>
      )}
      {detailError && !selectedReview ? (
        <p className="develop-evidence-agents__error" role="alert">{detailError}</p>
      ) : null}
      {services.length > 1 ? (
        <p className="develop-evidence-agents__service-note">
          Using {service?.name}. {services.length - 1} additional Equal Care service
          {services.length === 2 ? "" : "s"} detected.
        </p>
      ) : null}
    </main>
  );
}
