/**
 * Canonical, transport-independent thread domain contracts.
 *
 * Messages and execution records intentionally do not imply an alternating
 * request/response transcript. A thread can contain multiple participants and
 * multiple concurrent or background runs, all ordered by a shared sequence.
 */

export type RunnerThreadSequence = number;

export type RunnerThreadPermissionRing = 1 | 2 | 3;

export type RunnerThreadParticipantKind =
  | "human"
  | "communicator"
  | "observer"
  | "worker"
  | "system"
  | "service"
  | string;

export interface RunnerThreadParticipant {
  id: string;
  threadId?: string | null;
  kind: RunnerThreadParticipantKind;
  displayName: string;
  userId?: string | null;
  agentId?: string | null;
  avatarUrl?: string | null;
  active?: boolean;
  capabilities?: string[];
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type RunnerThreadMessageModality = "text" | "voice" | "email" | "system" | string;

export type RunnerThreadMessageStatus =
  | "draft"
  | "routing"
  | "accepted"
  | "delivered"
  | "failed"
  | "cancelled"
  | string;

export type RunnerThreadDeliveryMode = "fyi" | "checkpoint" | "interrupt";

export type RunnerThreadRouteKind =
  | "communicator"
  | "worker"
  | "human"
  | "broadcast"
  | "system"
  | "none"
  | string;

export interface RunnerThreadMessage {
  kind: "message";
  id: string;
  threadId: string;
  sequence: RunnerThreadSequence;
  authorParticipantId: string;
  content: string;
  modality: RunnerThreadMessageModality;
  status?: RunnerThreadMessageStatus;
  intendedRoute?: RunnerThreadRouteKind | null;
  intendedRecipientId?: string | null;
  deliveryMode?: RunnerThreadDeliveryMode | null;
  replyToMessageId?: string | null;
  replyToRunId?: string | null;
  sourceMessageId?: string | null;
  linkedRunIds?: string[];
  routingReceiptId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type RunnerThreadRunStatus =
  | "queued"
  | "pending"
  | "running"
  | "parked"
  | "waiting"
  | "waiting_permission"
  | "requires_action"
  | "completed"
  | "failed"
  | "cancelled"
  | string;

export type RunnerThreadRunKind =
  | "worker"
  | "communicator"
  | "observer"
  | "workflow"
  | "system"
  | string;

export type RunnerThreadRunOriginKind =
  | "message"
  | "schedule"
  | "metronome"
  | "voice"
  | "email"
  | "ticket"
  | "api"
  | "system"
  | string;

export interface RunnerThreadRunOrigin {
  kind: RunnerThreadRunOriginKind;
  id?: string | null;
  label?: string | null;
  sourceThreadId?: string | null;
  sourceMessageId?: string | null;
  scheduleId?: string | null;
  scheduleOccurrenceId?: string | null;
  workflowId?: string | null;
  workflowRunId?: string | null;
  triggerType?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadRunLease {
  ownerId?: string | null;
  ownerType?: string | null;
  acquiredAt?: string | null;
  expiresAt?: string | null;
  heartbeatAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadRunProjectionCounters {
  activityGroupCount?: number;
  actionCount?: number;
  changeCount?: number;
  pendingPermissionCount?: number;
  childRunCount?: number;
}

/** Lightweight observer-maintained state used by collapsed run cards. */
export interface RunnerThreadRunProjection {
  runId: string;
  threadId: string;
  sequence: RunnerThreadSequence;
  status: RunnerThreadRunStatus;
  phase?: string | null;
  summary: string;
  freshnessSequence?: RunnerThreadSequence | null;
  freshnessAt?: string | null;
  highestPermissionRing?: RunnerThreadPermissionRing | null;
  counters?: RunnerThreadRunProjectionCounters | null;
  observerStatus?: string | null;
  observerRevision?: number | null;
  observerModel?: string | null;
  metadata?: Record<string, unknown> | null;
  updatedAt: string;
}

export interface RunnerThreadRun {
  kind: "run";
  id: string;
  threadId: string;
  sequence: RunnerThreadSequence;
  runKind: RunnerThreadRunKind;
  status: RunnerThreadRunStatus;
  actorParticipantId?: string | null;
  parentRunId?: string | null;
  sourceMessageId?: string | null;
  title?: string | null;
  summary?: string | null;
  currentSummary?: string | null;
  origin: RunnerThreadRunOrigin;
  highestPermissionRing?: RunnerThreadPermissionRing | null;
  actionGroupIds?: string[];
  lease?: RunnerThreadRunLease | null;
  projection?: RunnerThreadRunProjection | null;
  metadata?: Record<string, unknown> | null;
  queuedAt?: string | null;
  startedAt?: string | null;
  parkedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type RunnerThreadEventVisibility = "user" | "internal" | "audit" | string;

export type RunnerThreadPolicyDecision = "allow" | "ask" | "deny" | "not_required" | string;

export interface RunnerThreadEventProducer {
  type: string;
  id?: string | null;
  participantId?: string | null;
}

export interface RunnerThreadEvent {
  kind: "event";
  id: string;
  threadId: string;
  runId?: string | null;
  sequence: RunnerThreadSequence;
  type: string;
  producer: RunnerThreadEventProducer;
  actorParticipantId?: string | null;
  visibility?: RunnerThreadEventVisibility;
  payloadVersion?: number;
  causationId?: string | null;
  correlationId?: string | null;
  title?: string | null;
  summary?: string | null;
  permissionRing?: RunnerThreadPermissionRing | null;
  policyDecision?: RunnerThreadPolicyDecision | null;
  snapshotBeforeId?: string | null;
  snapshotAfterId?: string | null;
  payload: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

export type RunnerThreadActionStatus =
  | "queued"
  | "pending"
  | "running"
  | "succeeded"
  | "completed"
  | "failed"
  | "blocked"
  | "cancelled"
  | string;

export interface RunnerThreadActionResource {
  kind?: string | null;
  id?: string | null;
  label?: string | null;
  path?: string | null;
  url?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadAction {
  kind: "action";
  id: string;
  threadId: string;
  runId: string;
  sequence: RunnerThreadSequence;
  activityGroupId?: string | null;
  sourceEventId?: string | null;
  actorParticipantId?: string | null;
  type: string;
  title: string;
  summary?: string | null;
  status: RunnerThreadActionStatus;
  toolName?: string | null;
  input?: unknown;
  output?: unknown;
  permissionRing?: RunnerThreadPermissionRing | null;
  policyDecision?: RunnerThreadPolicyDecision | null;
  touchedResources?: RunnerThreadActionResource[];
  snapshotBeforeId?: string | null;
  snapshotAfterId?: string | null;
  metadata?: Record<string, unknown> | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type RunnerThreadActivityGroupStatus = "open" | "sealed" | "superseded" | string;

export interface RunnerThreadActivityGroupMetrics {
  actionCount?: number;
  durationMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  costCt?: number;
}

export interface RunnerThreadActivityGroup {
  kind: "activity_group";
  id: string;
  threadId: string;
  runId: string;
  sequence: RunnerThreadSequence;
  version: number;
  status: RunnerThreadActivityGroupStatus;
  title: string;
  liveSummary: string;
  rationale?: string | null;
  parentGroupId?: string | null;
  childGroupIds?: string[];
  actionIds: string[];
  eventIds?: string[];
  startSequence: RunnerThreadSequence;
  endSequence?: RunnerThreadSequence | null;
  highestPermissionRing?: RunnerThreadPermissionRing | null;
  supersedesGroupId?: string | null;
  supersededByGroupId?: string | null;
  observerModel?: string | null;
  metrics?: RunnerThreadActivityGroupMetrics | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string | null;
  sealedAt?: string | null;
}

export type RunnerThreadRoutingStatus =
  | "classifying"
  | "queued"
  | "delivered"
  | "answered"
  | "ignored"
  | "corrected"
  | "superseded"
  | "failed"
  | string;

export interface RunnerThreadRoutingReceipt {
  kind: "routing_receipt";
  id: string;
  threadId: string;
  messageId: string;
  sequence: RunnerThreadSequence;
  route: RunnerThreadRouteKind;
  deliveryMode: RunnerThreadDeliveryMode;
  status: RunnerThreadRoutingStatus;
  recipientParticipantId?: string | null;
  runId?: string | null;
  intent?: string | null;
  reason?: string | null;
  confidence?: number | null;
  deliveredAtSequence?: RunnerThreadSequence | null;
  deliveredAtStepId?: string | null;
  correctedFromReceiptId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt?: string | null;
}

export type RunnerThreadPermissionStatus =
  | "pending"
  | "approved"
  | "denied"
  | "expired"
  | "cancelled"
  | string;

export interface RunnerThreadPermissionScope {
  kind: string;
  value?: string | null;
  label?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadPermissionRequest {
  kind: "permission";
  id: string;
  threadId: string;
  runId?: string | null;
  sequence: RunnerThreadSequence;
  actionId?: string | null;
  activityGroupId?: string | null;
  sourceEventId?: string | null;
  status: RunnerThreadPermissionStatus;
  permissionRing: RunnerThreadPermissionRing | null;
  ringLabel?: string | null;
  ringDescription?: string | null;
  actionType?: string | null;
  actionLabel?: string | null;
  actionDescription?: string | null;
  toolName?: string | null;
  input?: unknown;
  reason?: string | null;
  requestedMode?: string | null;
  currentMode?: string | null;
  decision?: "allow" | "deny" | null;
  decisionByParticipantId?: string | null;
  decisionReason?: string | null;
  grantScope?: RunnerThreadPermissionScope | null;
  snapshotBeforeId?: string | null;
  snapshotAfterId?: string | null;
  diffReference?: string | null;
  metadata?: Record<string, unknown> | null;
  requestedAt: string;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

/** A stable union used by timeline projections and renderer integrations. */
export type RunnerThreadTimelineItem =
  | RunnerThreadMessage
  | RunnerThreadRun
  | RunnerThreadEvent
  | RunnerThreadAction
  | RunnerThreadActivityGroup
  | RunnerThreadRoutingReceipt
  | RunnerThreadPermissionRequest;

export type RunnerThreadTimelineItemKind = RunnerThreadTimelineItem["kind"];

export interface RunnerThreadTimelineReference {
  kind: RunnerThreadTimelineItemKind;
  id: string;
  sequence: RunnerThreadSequence;
  createdAt: string;
}

export interface RunnerThreadProjection {
  schemaVersion: 1;
  threadId: string;
  latestSequence: RunnerThreadSequence;
  participantsById: Record<string, RunnerThreadParticipant>;
  messagesById: Record<string, RunnerThreadMessage>;
  runsById: Record<string, RunnerThreadRun>;
  eventsById: Record<string, RunnerThreadEvent>;
  actionsById: Record<string, RunnerThreadAction>;
  activityGroupsById: Record<string, RunnerThreadActivityGroup>;
  routingReceiptsById: Record<string, RunnerThreadRoutingReceipt>;
  permissionsById: Record<string, RunnerThreadPermissionRequest>;
  timeline: RunnerThreadTimelineReference[];
  nextCursor?: string | null;
  streamCursor?: string | null;
  olderCursor?: string | null;
  hasMore?: boolean;
  hasOlder?: boolean;
  hasNewer?: boolean;
}

export interface RunnerThreadProjectionSeed {
  threadId?: string;
  participants?: RunnerThreadParticipant[];
  items?: RunnerThreadTimelineItem[];
  nextCursor?: string | null;
  streamCursor?: string | null;
  olderCursor?: string | null;
  hasMore?: boolean;
  hasOlder?: boolean;
  hasNewer?: boolean;
}

export type RunnerThreadProjectionMutation =
  | { operation: "participant.upsert"; participant: RunnerThreadParticipant }
  | { operation: "timeline.upsert"; item: RunnerThreadTimelineItem }
  | { operation: "timeline.remove"; itemKind: RunnerThreadTimelineItemKind; itemId: string }
  | { operation: "timeline.reset"; threadId?: string; participants?: RunnerThreadParticipant[]; items: RunnerThreadTimelineItem[] }
  | {
      operation: "cursor.update";
      latestSequence?: RunnerThreadSequence;
      nextCursor?: string | null;
      streamCursor?: string | null;
      olderCursor?: string | null;
      hasMore?: boolean;
      hasOlder?: boolean;
      hasNewer?: boolean;
    };

export type RunnerThreadProjectionEvent = RunnerThreadTimelineItem | RunnerThreadProjectionMutation;

export interface RunnerThreadTimelinePage {
  threadId: string;
  items: RunnerThreadTimelineItem[];
  participants?: RunnerThreadParticipant[];
  latestSequence: RunnerThreadSequence;
  nextCursor?: string | null;
  streamCursor?: string | null;
  olderCursor?: string | null;
  hasMore: boolean;
  hasOlder?: boolean;
  hasNewer?: boolean;
  projection?: RunnerThreadProjection | null;
}

export interface RunnerThreadEventPage {
  threadId: string;
  events: RunnerThreadEvent[];
  latestSequence: RunnerThreadSequence;
  nextCursor?: string | null;
  streamCursor?: string | null;
  olderCursor?: string | null;
  hasMore: boolean;
  hasOlder?: boolean;
  hasNewer?: boolean;
}

export interface RunnerThreadTimelineQuery {
  after?: RunnerThreadSequence;
  before?: RunnerThreadSequence;
  cursor?: string;
  limit?: number;
  includeLegacy?: boolean;
}

export interface RunnerThreadRoutedMessageInput {
  id?: string;
  clientMessageId?: string;
  authorParticipantId?: string;
  content: string;
  modality?: RunnerThreadMessageModality;
  intendedRoute?: RunnerThreadRouteKind;
  intendedRecipientId?: string | null;
  deliveryMode?: RunnerThreadDeliveryMode;
  replyToMessageId?: string | null;
  replyToRunId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadRouteDecision {
  route: RunnerThreadRouteKind;
  deliveryMode: RunnerThreadDeliveryMode;
  recipientParticipantId?: string | null;
  runId?: string | null;
  purpose?: string | null;
  reason?: string | null;
  confidence?: number | null;
  deterministic?: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadActivityClassificationResult {
  threadId: string;
  decision: RunnerThreadRouteDecision;
  targetRunId?: string | null;
  targetRunStatus?: string | null;
  targetRunActive: boolean;
  suggestedTransport: "activity_message" | "legacy_control" | "legacy_follow_up" | string;
  shouldPersistWithActivityEndpoint: boolean;
  persisted: false;
}

export interface RunnerThreadCommunicatorResult {
  message: RunnerThreadMessage;
  event?: RunnerThreadEvent | null;
  evidence?: unknown;
}

export interface RunnerThreadRoutedMessageResult {
  message: RunnerThreadMessage;
  routingReceipt?: RunnerThreadRoutingReceipt | null;
  delivery?: RunnerThreadRoutingReceipt | null;
  routeDecision?: RunnerThreadRouteDecision | null;
  communicator?: RunnerThreadCommunicatorResult | null;
  control?: unknown;
  run?: RunnerThreadRun | null;
  events?: RunnerThreadEvent[];
  accepted?: boolean;
  delivered?: boolean;
  effectApplied?: boolean;
  executionStarted?: boolean;
  coordinatorRequired?: boolean;
  limitation?: string | null;
}

export interface RunnerThreadSteeringInput {
  messageId?: string;
  content?: string;
  deliveryMode?: "checkpoint" | "interrupt";
  requestedByParticipantId?: string;
  checkpointAfterSequence?: RunnerThreadSequence | null;
  idempotencyKey?: string;
  metadata?: Record<string, unknown> | null;
}

export type RunnerThreadControlAction = "pause" | "resume" | "park" | "cancel" | "stop";

export interface RunnerThreadControlInput {
  action: RunnerThreadControlAction;
  requestedByParticipantId?: string;
  reason?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerThreadRunCommandResult {
  run: RunnerThreadRun | null;
  event?: RunnerThreadEvent | null;
  routingReceipt?: RunnerThreadRoutingReceipt | null;
  accepted?: boolean;
  delivered?: boolean;
  effectApplied?: boolean;
  executionStarted?: boolean;
  coordinatorRequired?: boolean;
  limitation?: string | null;
}
