export type EvidenceReviewStatus = "open" | "in_review" | "resolved" | "rejected";
export type EvidenceReviewSeverity = "low" | "medium" | "high" | "critical";
export type EvidenceDirection =
  | "increase"
  | "decrease"
  | "positive"
  | "negative"
  | "no_difference"
  | "no_association"
  | "mixed"
  | "not_applicable"
  | "unknown";

export interface EvidenceServiceResource {
  id: string;
  name: string;
  status: string;
  serviceUrl?: string | null;
  metadata?: {
    useCase?: string;
    service?: string;
    serviceVersion?: string;
    [key: string]: unknown;
  } | null;
}

export interface EvidenceReviewCandidateSummary {
  extraction_assertion_id: string;
  normalized_statement: string;
  finding_kind: string;
  direction: EvidenceDirection;
  extraction_confidence: number;
  candidate_status: string;
}

export interface EvidencePublicationSummary {
  publication_id: string;
  title?: string | null;
  doi?: string | null;
  pmid?: string | null;
  pmcid?: string | null;
  journal?: string | null;
  publication_year?: number | null;
}

export interface EvidenceReviewTaskRow {
  review_task_id: string;
  status: EvidenceReviewStatus;
  severity: EvidenceReviewSeverity;
  reason_codes: string[];
  created_at: string;
  assigned_reviewer_id?: string | null;
  candidate: EvidenceReviewCandidateSummary | null;
  publication: EvidencePublicationSummary | null;
}

export interface EvidenceReviewOverview {
  pending_reviews: number;
  critical_reviews: number;
  verified_findings: number;
  publications: number;
  extraction_runs: number;
  scan_limit: number;
  truncated: boolean;
}

export interface EvidenceVariableAssertion {
  role: string;
  label: string;
  raw_value: string | null;
  normalized_value: string | null;
  precision_factor_category: string | null;
}

export interface EvidenceStatisticAssertion {
  kind: string;
  measure: string | null;
  operator: string | null;
  value: number | null;
  unit: string | null;
  raw_text: string;
  parsing_status: string;
}

export interface EvidenceSourceSpan {
  source_span_id: string;
  exact_quote: string;
  location_type: string;
  verification_status: string;
  location: {
    section_title?: string | null;
    table_label?: string | null;
    page_start?: number | null;
    page_end?: number | null;
  };
}

export interface EvidenceReviewTaskDetail extends EvidenceReviewTaskRow {
  task: EvidenceReviewTaskRow & {
    target_id: string;
    resolution?: string | null;
  };
  candidate: EvidenceReviewCandidateSummary & {
    variable_assertions: EvidenceVariableAssertion[];
    statistic_assertions: EvidenceStatisticAssertion[];
    source_span_ids: string[];
    provenance_validation_status: string;
    schema_validation_status: string;
  };
  publication: EvidencePublicationSummary & {
    authors?: string[];
    publication_type_raw?: string | null;
  };
  study: {
    study_id: string;
    name?: string | null;
    study_kind: string;
    design_raw?: string | null;
  };
  source_spans: EvidenceSourceSpan[];
  editable_fields: string[];
  can_approve: boolean;
  can_reject: boolean;
}

export interface EvidenceReviewList {
  object: "list";
  data: EvidenceReviewTaskRow[];
  total_count: number;
  has_more: boolean;
  source_truncated?: boolean;
}

export interface EvidenceReviewDecision {
  ok: boolean;
  outcome: "promoted" | "rejected" | "requires_review";
  review_task_id?: string;
  finding_id?: string;
  finding_version_id?: string;
  blockers?: Array<{ code?: string; message?: string; path?: string } | string>;
}
