import { getPlatformResourceProjectScopeIds } from "../../../../../platform-resources/projects/index.js";

export type TestRunStatus =
  | "queued"
  | "running"
  | "passed"
  | "failed"
  | "completed_with_errors"
  | "cancelled";
export type TestTargetType =
  | "project"
  | "workflow"
  | "function"
  | "web_app"
  | "agent"
  | "repository"
  | "custom";
export type TestTechnique =
  | "contract"
  | "service_topology"
  | "command"
  | "browser"
  | "visual";
export type TestScenarioType =
  | "command"
  | "function"
  | "workflow"
  | "browser"
  | "agent"
  | "readiness"
  | "service_topology";
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
  cases: TestCaseDefinition[];
  concurrency: number;
  stopOnFailure: boolean;
  retryPolicy: {
    maxAttempts: number;
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
  executionStatus?: "queued" | "running" | "completed" | "cancelled";
  verdict?: "passed" | "failed" | "error" | "cancelled" | null;
  executionType?: "preview" | "published" | "imported";
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
  resultAttempts?: TestCaseResult[];
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
  classification?: TestCaseResult["status"] | "flaky";
  attemptCount?: number;
  attempts?: TestCaseResult[];
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
  targetType: TestTargetType;
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

export interface TestPlanOverviewSummary {
  id: string;
  projectId: string | null;
  name: string;
  description: string;
  targetType: TestTargetType;
  targetId: string | null;
  defaultEnvironmentId: string | null;
  caseCount: number;
  publishedVersionId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  overviewSummaryVersion: number;
  runCount: number | null;
  passedRunCount: number | null;
  lastRunStatus: TestRunStatus | null;
}

export type TestPlanCatalogEntry = TestPlan | TestPlanOverviewSummary;

export interface TestPlanCreateInput {
  name: string;
  description?: string;
  projectId?: string;
  targetType?: TestTargetType;
  targetId?: string;
  defaultEnvironmentId?: string;
  definition: Partial<TestPlanDefinition> & {
    cases: Partial<TestCaseDefinition>[];
  };
  metadata?: Record<string, unknown>;
  publishInitialVersion?: boolean;
}

export interface TestPreviewRunCreateInput {
  definition?: TestPlanDefinition;
  scenarioIds?: string[];
  environmentId?: string;
  agentId?: string;
  projectId?: string;
  commitSha?: string;
  metadata?: Record<string, unknown>;
}

export type TestReportFormat =
  | "normalized"
  | "junit"
  | "jest"
  | "vitest"
  | "playwright";

export interface TestImportRunCreateInput {
  scenarioId?: string;
  format?: TestReportFormat;
  report?: unknown;
  reports?: Array<{
    scenarioId: string;
    format: TestReportFormat;
    report: unknown;
  }>;
  projectId?: string;
  commitSha?: string;
  metadata?: Record<string, unknown>;
}

export interface TestCapabilities {
  schemaVersion: string;
  productModel: {
    resource: "test";
    childResource: "scenario";
    configuration: "definition";
  };
  targets: Array<{
    id: TestTargetType;
    label: string;
    execution: "deterministic" | "agent" | "hybrid";
    immutableVersionRequired: boolean;
    scenarioTypes?: TestScenarioType[];
    defaultScenarioType?: TestScenarioType;
  }>;
  techniques: Array<{
    id: TestTechnique;
    label: string;
    execution: "deterministic" | "agent";
    trustedVerdict: boolean;
  }>;
  features: Record<string, boolean>;
}

export interface TestRunCreateInput {
  versionId?: string;
  environmentId?: string;
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
  projectIds?: string[];
  linkedResources?: TestWorkspaceLinkedResource[];
}

export interface TestWorkspaceLinkedResource {
  id: string;
  type: string;
}

export function asTestRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function uniqueTestIds(values: readonly unknown[]): string[] {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

export function getTestWorkspaceResourceProjectIds(value: unknown): string[] {
  const source = asTestRecord(value);
  const metadata = asTestRecord(source.metadata);
  const project = asTestRecord(source.project);
  return uniqueTestIds([
    ...getPlatformResourceProjectScopeIds(source),
    ...getPlatformResourceProjectScopeIds(metadata),
    source.attachedProjectId,
    source.attached_project_id,
    project.id,
  ]);
}

export function getTestWorkspaceLinkedResources(value: unknown): TestWorkspaceLinkedResource[] {
  const source = asTestRecord(value);
  const metadata = asTestRecord(source.metadata);
  const rawResources = Array.isArray(source.linkedResources)
    ? source.linkedResources
    : Array.isArray(source.linked_resources)
      ? source.linked_resources
      : Array.isArray(metadata.linkedResources)
        ? metadata.linkedResources
        : Array.isArray(metadata.linked_resources)
          ? metadata.linked_resources
          : [];
  const resources = new Map<string, TestWorkspaceLinkedResource>();
  for (const value of rawResources) {
    const resource = asTestRecord(value);
    const id = String(
      resource.id
      || resource.resourceId
      || resource.resource_id
      || resource.serverId
      || resource.server_id
      || resource.evaluationId
      || resource.evaluation_id
      || "",
    ).trim();
    const type = String(
      resource.type
      || resource.resourceType
      || resource.resource_type
      || resource.kind
      || "",
    ).trim().toLowerCase();
    if (id && type) resources.set(`${type}:${id}`, { id, type });
  }
  return [...resources.values()];
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
  const projectIds = getTestWorkspaceResourceProjectIds(source);
  const linkedResources = getTestWorkspaceLinkedResources(source);
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
    ...(projectIds.length ? { projectIds } : {}),
    ...(linkedResources.length ? { linkedResources } : {}),
  };
}
