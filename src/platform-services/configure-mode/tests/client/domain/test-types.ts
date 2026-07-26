export type TestPlanStatus = "draft" | "active" | "archived";
export type TestRunStatus =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "completed_with_errors"
  | "cancelled";
export type TestCaseKind =
  | "command"
  | "contract"
  | "integration"
  | "browser"
  | "agent"
  | "security"
  | "custom";

export interface TestCaseDefinition {
  id: string;
  name: string;
  description: string;
  kind: TestCaseKind;
  command: string;
  workingDirectory: string;
  timeoutMs: number;
  retries: number;
  env: Record<string, string>;
  secretRefs: string[];
  request: Record<string, unknown>;
  assertions: unknown[];
  agentId: string;
  enabled: boolean;
  tags: string[];
}

export interface TestPlanDefinition {
  schemaVersion: string;
  setup: Record<string, unknown> | null;
  cases: TestCaseDefinition[];
  teardown: Record<string, unknown> | null;
  concurrency: number;
  stopOnFailure: boolean;
  retryPolicy: {
    maxAttempts: number;
    backoffMs: number;
  };
  evidencePolicy: {
    retainLogs: boolean;
    retainScreenshots: boolean;
    retainTraces: boolean;
    retainArtifacts: boolean;
    redactSecrets: boolean;
  };
}

export interface TestPlanVersion {
  id: string;
  testPlanId: string;
  version: number;
  label: string;
  description: string;
  status: string;
  snapshot: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestRun {
  id: string;
  testPlanId: string;
  versionId: string | null;
  projectId: string | null;
  taskId: string | null;
  releaseId: string | null;
  environmentId: string | null;
  agentId: string | null;
  triggerType: string;
  commitSha: string | null;
  status: TestRunStatus;
  totalCount: number;
  passedCount: number;
  failedCount: number;
  skippedCount: number;
  errorCount: number;
  durationMs: number | null;
  evidence: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  execution: {
    owner: string | null;
    attempt: number;
    leaseExpiresAt: string | null;
    heartbeatAt: string | null;
  };
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  results?: TestCaseResult[];
  artifacts?: TestRunArtifact[];
}

export interface TestCaseResult {
  id: string;
  testRunId: string;
  caseId: string;
  name: string;
  kind: TestCaseKind;
  status: "queued" | "running" | "passed" | "failed" | "skipped" | "error";
  attempt: number;
  durationMs: number | null;
  exitCode: number | null;
  summary: string;
  diagnostics: Record<string, unknown>;
  evidence: Record<string, unknown>;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TestRunArtifact {
  id: string;
  testRunId: string;
  testCaseResultId: string | null;
  type: string;
  name: string;
  uri: string;
  contentType: string | null;
  sizeBytes: number | null;
  sha256: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface TestPlan {
  id: string;
  projectId: string | null;
  name: string;
  description: string;
  status: TestPlanStatus;
  targetType: string;
  targetId: string | null;
  defaultEnvironmentId: string | null;
  definition: TestPlanDefinition;
  caseCount: number;
  planFingerprint: string;
  publishedVersionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  versions?: TestPlanVersion[];
  runs?: TestRun[];
}

export interface TestPlanCreateInput {
  name: string;
  description?: string;
  projectId?: string;
  targetType?: string;
  targetId?: string;
  defaultEnvironmentId?: string;
  definition: Partial<TestPlanDefinition> & {
    cases: Partial<TestCaseDefinition>[];
  };
  metadata?: Record<string, unknown>;
}

export interface TestRunCreateInput {
  environmentId: string;
  agentId?: string;
  projectId?: string;
  taskId?: string;
  releaseId?: string;
  commitSha?: string;
  triggerType?: string;
}

export interface TestWorkspaceResourceOption {
  id: string;
  name: string;
  description?: string;
}

export function asTestRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function normalizeTestWorkspaceOption(
  value: unknown,
  fallbackLabel: string,
): TestWorkspaceResourceOption | null {
  const source = asTestRecord(value);
  const metadata = asTestRecord(source.metadata);
  const id = String(
    source.id
    || source.value
    || source.projectId
    || source.environmentId
    || source.agentId
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
  };
}
