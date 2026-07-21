import type { PlatformPermissionSet } from "../../../../../platform-ui/pages/permissions/index.js";

export type SecuritySeverity = "critical" | "high" | "medium" | "low" | "informational";
export type SecurityFindingStatus = "open" | "accepted" | "risk_accepted" | "false_positive" | "fixed";
export type SecurityRunStatus = "queued" | "running" | "waiting_approval" | "succeeded" | "partial" | "failed" | "cancelled";
export type SecurityRunStage = "ingest" | "checkout" | "inventory" | "scan" | "validate" | "triage" | "remediate" | "verify" | "publish" | "complete";

export interface SecurityRepository {
  id: string;
  githubRepositoryId: string;
  githubInstallationId: string;
  githubNumericRepositoryId: string;
  githubNumericInstallationId: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
  archived: boolean;
  status: "active" | "paused" | "disconnected";
  currentPolicyVersionId: string | null;
  currentThreatModelVersionId: string | null;
  permissionSet: PlatformPermissionSet | null;
  lastRunId: string | null;
  lastRunAt: string | null;
  nextScanAt: string | null;
  metadata: Record<string, unknown> | null;
  findingCounts: { open: number; critical: number; high: number };
  lastRunStatus: SecurityRunStatus | null;
  lastRunStage: SecurityRunStage | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityOverview {
  metrics: {
    repositories: number;
    activeRepositories: number;
    openFindings: number;
    criticalFindings: number;
    highFindings: number;
    fixedFindings: number;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    activeRuns: number;
  };
  repositories: SecurityRepository[];
}

export interface SecurityScanPolicy {
  schemaVersion: 1;
  defaultBranch: string;
  scanMode: "full" | "incremental";
  schedule: { enabled: boolean; cron: string; timezone: string };
  pullRequests: {
    enabled: boolean;
    branches: string[];
    pathIncludes: string[];
    pathExcludes: string[];
    scanForksReadOnly: true;
  };
  push: { enabled: boolean; branches: string[] };
  scanners: string[];
  remediation: {
    mode: "disabled" | "approval_required";
    minimumSeverity: SecuritySeverity;
    draftPullRequestsOnly: true;
    allowWorkflowChanges: false;
    maximumChangedFiles: number;
    maximumPatchBytes: number;
  };
}

export interface SecurityThreatModel {
  schemaVersion: 1;
  summary: string;
  entryPoints: string[];
  untrustedInputs: string[];
  trustBoundaries: string[];
  sensitiveDataPaths: string[];
  privilegedActions: string[];
  priorityAreas: string[];
  exclusions: Array<{ path: string; reason: string }>;
}

export interface SecurityConfigurationVersion<T> {
  id: string;
  version: number;
  source?: "generated" | "user" | "migration";
  value: T;
  changeSummary: string;
  createdAt: string;
}

export interface SecurityRun {
  id: string;
  repositoryId: string;
  repositoryFullName: string;
  triggerType: "manual" | "schedule" | "pull_request" | "push" | "retry";
  triggerEventId: string | null;
  baseSha: string | null;
  headSha: string | null;
  ref: string | null;
  status: SecurityRunStatus;
  stage: SecurityRunStage;
  policyVersionId: string | null;
  threatModelVersionId: string | null;
  promptVersion: string;
  modelVersion: string;
  scannerVersions: Record<string, unknown> | null;
  coverage: Record<string, unknown> | null;
  summary: Record<string, unknown> | null;
  error: Record<string, unknown> | null;
  findingCount: number;
  checkRunUrl: string | null;
  pullRequestUrl: string | null;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityFinding {
  id: string;
  repositoryId: string;
  repositoryFullName: string;
  fingerprint: string;
  ruleId: string;
  title: string;
  summary: string;
  severity: SecuritySeverity;
  confidence: number;
  exploitability: string;
  cwe: string[];
  cvss: number | null;
  status: SecurityFindingStatus;
  firstSeenRunId: string | null;
  lastSeenRunId: string | null;
  assignedToUserId: string | null;
  resolutionReason: string;
  resolutionExpiresAt: string | null;
  fixedAt: string | null;
  metadata: Record<string, unknown> | null;
  occurrenceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityAuditEvent {
  id: string;
  repositoryId: string | null;
  runId: string | null;
  findingId: string | null;
  remediationId: string | null;
  actorType: "user" | "system" | "github" | "agent";
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  correlationId: string;
  payload: Record<string, unknown> | null;
  previousHash: string;
  eventHash: string;
  createdAt: string;
}

export interface SecurityRemediation {
  id: string;
  findingId: string | null;
  runId?: string | null;
  status: string;
  patchDigest: string;
  validation: Record<string, unknown> | null;
  approvedByUserId: string | null;
  approvedAt: string | null;
  branchName: string | null;
  pullRequestId: string | null;
  pullRequestUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityRepositoryDetail {
  repository: SecurityRepository;
  policy: SecurityConfigurationVersion<SecurityScanPolicy> | null;
  threatModel: SecurityConfigurationVersion<SecurityThreatModel> | null;
  runs: SecurityRun[];
  findings: SecurityFinding[];
  auditEvents: SecurityAuditEvent[];
}

export interface SecurityRunDetail {
  run: SecurityRun;
  findings: SecurityFinding[];
  auditEvents: SecurityAuditEvent[];
  artifacts: Array<Record<string, unknown> & { id: string; kind: string; digest: string }>;
  remediations: SecurityRemediation[];
}

export interface SecurityFindingDetail {
  finding: SecurityFinding;
  occurrences: Array<{
    id: string;
    runId: string;
    commitSha: string;
    locations: Array<Record<string, unknown>>;
    evidence: Record<string, unknown> | null;
    validation: Record<string, unknown> | null;
    provenance: Record<string, unknown> | null;
    createdAt: string;
  }>;
  remediations: SecurityRemediation[];
}

export interface SecurityGitHubAppStatus {
  configured: boolean;
  slug: string;
  setupUrl: string;
  requiredPermissions: Record<string, string>;
  requiredEvents: string[];
}

export interface SecurityGitHubInstallation {
  id: string;
  githubInstallationId: string;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
  permissions: Record<string, string>;
  events: string[];
  status: "active" | "suspended" | "uninstalled";
  suspendedAt: string | null;
  repositoryCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityGitHubRepository {
  id: string;
  installationId: string;
  githubRepositoryId: string;
  fullName: string;
  ownerLogin: string;
  name: string;
  defaultBranch: string;
  private: boolean;
  archived: boolean;
  disabled: boolean;
  monitored: boolean;
  securityRepositoryId: string | null;
  syncedAt: string;
  updatedAt: string;
}

export type SecurityWorkspaceRoute =
  | { kind: "overview" }
  | { kind: "repository"; id: string }
  | { kind: "run"; id: string }
  | { kind: "finding"; id: string };
