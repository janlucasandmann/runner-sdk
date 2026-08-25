export type BatchTargetKind =
  | "thread_run"
  | "metronome_run"
  | "evaluation_run"
  | "agent_optimization"
  | "project_ticket_action";

export type BatchSelectableTargetKind = Extract<
  BatchTargetKind,
  "metronome_run" | "evaluation_run" | "agent_optimization"
>;

export interface BatchTargetResourceOption {
  id: string;
  targetKind: BatchSelectableTargetKind;
  name: string;
  description: string;
  status: string | null;
  versionId: string | null;
  definition?: Record<string, unknown> | null;
  nodes?: readonly unknown[];
  edges?: readonly unknown[];
}

export interface BatchMetronomeManualRunContext {
  workflow: Record<string, unknown>;
  definition: Record<string, unknown>;
  versionId: string;
  nodes: readonly unknown[];
  edges: readonly unknown[];
  functionOptions: readonly { id: string; name: string; kind?: string }[];
  webAppOptions: readonly { id: string; name: string; kind?: string }[];
  databaseOptions: readonly { id: string; name: string; kind?: string }[];
  authOptions: readonly { id: string; name: string; kind?: string }[];
}

export interface BatchProjectOption {
  id: string;
  name: string;
  description: string;
  status: string | null;
}

export interface BatchProjectTicketOption {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: string | null;
  ticketNumber: string | null;
  disabled: boolean;
}

export interface BatchPreparedProjectTicket {
  threadId: string;
  threadTitle: string;
  taskPrompt: string;
  batchJob: BatchJob;
}

export interface BatchCreatorIdentity {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
}

export type BatchStartPolicy = "manual" | "stay_on_shelf" | "when_capacity_available";

export type BatchJobStatus =
  | "held"
  | "queued"
  | "dispatching"
  | "running"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface BatchJob {
  id: string;
  userId: string;
  organizationId: string | null;
  createdByUserId: string | null;
  name: string;
  description: string;
  targetKind: BatchTargetKind;
  targetResourceId: string | null;
  targetVersionId: string | null;
  definition: Record<string, unknown>;
  startPolicy: BatchStartPolicy;
  status: BatchJobStatus;
  queueLane: string;
  priority: number;
  position: number;
  maxAttempts: number;
  attemptCount: number;
  executionGeneration: number;
  availableAt: string;
  waitReason: string | null;
  nativeResourceType: string | null;
  nativeResourceId: string | null;
  sourceProjectId: string | null;
  sourceTicketId: string | null;
  permissionSet: string;
  idempotencyKey: string | null;
  leaseOwner: string | null;
  leaseExpiresAt: string | null;
  heartbeatAt: string | null;
  lastError: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  queuedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface BatchJobEvent {
  id: string;
  batchJobId: string;
  eventType: string;
  fromStatus: BatchJobStatus | null;
  toStatus: BatchJobStatus | null;
  actorType: "user" | "scheduler" | "system";
  actorId: string | null;
  message: string;
  details: Record<string, unknown>;
  createdAt: string;
}

export interface BatchJobAttempt {
  id: string;
  batchJobId: string;
  executionGeneration: number;
  attemptNumber: number;
  workerId: string | null;
  status: "running" | "succeeded" | "failed" | "deferred";
  nativeResourceType: string | null;
  nativeResourceId: string | null;
  errorClassification: "transient" | "permanent" | null;
  errorMessage: string | null;
  startedAt: string;
  completedAt: string | null;
  metadata: Record<string, unknown>;
}

export interface BatchJobDraft {
  name?: string;
  description?: string;
  targetKind?: BatchTargetKind;
  targetResourceId?: string | null;
  targetVersionId?: string | null;
  definition?: Record<string, unknown>;
  startPolicy?: BatchStartPolicy;
  sourceProjectId?: string | null;
  sourceTicketId?: string | null;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown>;
}

export interface BatchCapacity {
  available: boolean;
  reason: string | null;
  pool: {
    containers: number;
    maxContainers: number;
    pendingContainerStarts: number;
    activeExecutions: number;
    maxActiveExecutions: number;
  };
  maintenance: boolean;
  diskPressure: boolean;
}
