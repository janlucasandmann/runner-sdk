export type AssurancePolicyStatus = "draft" | "active" | "archived";
export type AssuranceRunStatus =
  | "running"
  | "blocked"
  | "passed"
  | "failed"
  | "cancelled";

export interface AssuranceTestGate {
  id: string;
  testPlanId: string;
  versionId: string | null;
  requireCommitSha: boolean;
  maxAgeHours: number | null;
}

export interface AssuranceEvaluationGate {
  id: string;
  evaluationId: string;
  versionId: string | null;
  minimumAverageScore: number;
  minimumPassRate: number;
  requireRunFingerprint: boolean;
  maxAgeHours: number | null;
}

export interface AssuranceOptimizationGate {
  id: string;
  agentId: string;
  requireTargetMet: boolean;
  requirePublishedCandidate: boolean;
  maxAgeHours: number | null;
}

export interface AssurancePolicyDefinition {
  schemaVersion: "computer_agents_assurance_policy_v1";
  testGates: AssuranceTestGate[];
  evaluationGates: AssuranceEvaluationGate[];
  optimizationGates: AssuranceOptimizationGate[];
  approval: {
    mode: "none" | "manual";
  };
  budget: {
    maximumTotalCostUsd: number | null;
  };
}

export interface AssurancePolicyVersion {
  id: string;
  assurancePolicyId: string;
  version: number;
  label: string;
  description: string;
  status: string;
  snapshot: Record<string, unknown>;
  policyFingerprint: string;
  metadata: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AssuranceEvidenceReferences {
  testRunIds: string[];
  evaluationRunIds: string[];
  optimizationJobIds: string[];
}

export interface AssuranceGateResult {
  id: string;
  kind: "test" | "evaluation" | "optimization" | "budget";
  status: "passed" | "failed" | "pending";
  reason: string;
  evidenceId: string | null;
  evidenceFingerprint: string | null;
  actual: Record<string, unknown>;
  required: Record<string, unknown>;
}

export interface AssuranceRunEvent {
  id: string;
  type: string;
  actorUserId: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface AssuranceRun {
  id: string;
  assurancePolicyId: string;
  policyVersionId: string;
  projectId: string | null;
  releaseId: string | null;
  commitSha: string | null;
  agentId: string | null;
  agentVersionId: string | null;
  status: AssuranceRunStatus;
  evidenceReferences: AssuranceEvidenceReferences;
  evidence: {
    schemaVersion?: string;
    fingerprint?: string;
    evaluatedAt?: string;
    gates?: AssuranceGateResult[];
    cost?: {
      totalCostUsd?: number;
      complete?: boolean;
    };
    [key: string]: unknown;
  };
  decision: {
    schemaVersion?: string;
    outcome?: string;
    technicalOutcome?: string;
    evidenceFingerprint?: string;
    fingerprint?: string;
    approval?: {
      status?: string;
      actorId?: string | null;
      approvedAt?: string | null;
      evidenceFingerprint?: string | null;
    };
    [key: string]: unknown;
  };
  approval: {
    approvedByUserId: string | null;
    approvedAt: string | null;
    evidenceFingerprint: string | null;
  };
  revision: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  events?: AssuranceRunEvent[];
}

export interface AssurancePolicy {
  id: string;
  projectId: string | null;
  name: string;
  description: string;
  status: AssurancePolicyStatus;
  definition: AssurancePolicyDefinition;
  policyFingerprint: string;
  publishedVersionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  versions?: AssurancePolicyVersion[];
  runs?: AssuranceRun[];
}

export interface AssurancePolicyCreateInput {
  name: string;
  description?: string;
  projectId?: string;
  status?: AssurancePolicyStatus;
  definition: AssurancePolicyDefinition;
  metadata?: Record<string, unknown>;
}

export interface AssuranceRunCreateInput {
  id?: string;
  policyVersionId?: string;
  projectId?: string;
  releaseId?: string;
  commitSha?: string;
  agentId?: string;
  agentVersionId?: string;
  evidenceReferences: AssuranceEvidenceReferences;
  metadata?: Record<string, unknown>;
}

export interface AssuranceWorkspaceOption {
  id: string;
  name: string;
  description?: string;
  publishedVersionId?: string | null;
}

export function asAssuranceRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeAssuranceWorkspaceOption(
  value: unknown,
  fallbackLabel: string,
): AssuranceWorkspaceOption | null {
  const source = asAssuranceRecord(value);
  const metadata = asAssuranceRecord(source.metadata);
  const id = String(
    source.id
    || source.value
    || source.projectId
    || source.testPlanId
    || "",
  ).trim();
  if (!id) return null;
  return {
    id,
    name: String(
      source.name
      || source.title
      || source.label
      || metadata.name
      || `${fallbackLabel} ${id.slice(-6)}`,
    ).trim(),
    description: String(source.description || metadata.description || "").trim(),
    publishedVersionId: String(
      source.publishedVersionId
      || source.published_version_id
      || "",
    ).trim() || null,
  };
}
