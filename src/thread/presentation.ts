import {
  isRunnerThreadRunActive,
  selectRunnerThreadActivityGroups,
  selectRunnerThreadCurrentActivityGroup,
  selectRunnerThreadPendingPermissions,
  selectRunnerThreadRunActions,
  selectRunnerThreadRuns,
  selectRunnerThreadRunWorkingLabel,
} from "./selectors.js";
import {
  isRunnerPublicConversationRun,
  resolveRunnerPublicThreadParticipant,
} from "./public-presentation.js";
import type {
  RunnerThreadParticipant,
  RunnerThreadPermissionRing,
  RunnerThreadProjection,
  RunnerThreadRun,
} from "./types.js";

export type RunnerThreadScreenPhase =
  | "queued"
  | "planning"
  | "executing"
  | "waiting_permission"
  | "waiting_input"
  | "paused"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

export interface RunnerThreadRunReceiptMetrics {
  actionCount: number;
  activityGroupCount: number;
  childRunCount: number;
  pendingPermissionCount: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}

export interface RunnerThreadRunReceiptViewModel {
  id: string;
  run: RunnerThreadRun;
  actor: RunnerThreadParticipant | null;
  active: boolean;
  phase: RunnerThreadScreenPhase;
  phaseLabel: string;
  headline: string;
  summary: string;
  originLabel: string;
  workspaceLabel: string;
  startedAt: string;
  endedAt: string | null;
  durationMs: number;
  highestPermissionRing: RunnerThreadPermissionRing | null;
  metrics: RunnerThreadRunReceiptMetrics;
}

export interface RunnerThreadScreenViewModel {
  receipts: RunnerThreadRunReceiptViewModel[];
  defaultRunId: string | null;
  activeRunIds: string[];
  pendingPermissionCount: number;
}

function nonEmptyString(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function metadataLabel(
  metadata: Record<string, unknown> | null | undefined,
  keys: string[],
): string {
  if (!metadata) return "";
  for (const key of keys) {
    const label = nonEmptyString(metadata[key]);
    if (label) return label;
  }
  return "";
}

function parseTime(value?: string | null): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function resolveDurationMs(run: RunnerThreadRun): number {
  const start = parseTime(run.startedAt || run.queuedAt || run.createdAt);
  const end = parseTime(run.completedAt || run.updatedAt || run.createdAt);
  if (start === null || end === null) return 0;
  return Math.max(0, end - start);
}

function phaseFromRun(
  projection: RunnerThreadProjection,
  run: RunnerThreadRun,
): RunnerThreadScreenPhase {
  const status = nonEmptyString(run.status).toLowerCase();
  if (status === "queued") return "queued";
  if (status === "pending") return "planning";
  if (status === "waiting_permission") return "waiting_permission";
  if (status === "waiting" || status === "requires_action") return "waiting_input";
  if (status === "parked") return "paused";
  if (status === "completed") return "completed";
  if (status === "failed") return "failed";
  if (status === "cancelled") return "cancelled";

  const currentGroup = selectRunnerThreadCurrentActivityGroup(projection, run.id);
  const phaseText = [run.projection?.phase, currentGroup?.title]
    .map(nonEmptyString)
    .join(" ")
    .toLowerCase();
  return /verify|review|test|validat|check/.test(phaseText) ? "verifying" : "executing";
}

function phaseLabel(phase: RunnerThreadScreenPhase): string {
  if (phase === "waiting_permission") return "Approval needed";
  if (phase === "waiting_input") return "Input needed";
  if (phase === "paused") return "Paused";
  if (phase === "verifying") return "Verifying";
  if (phase === "completed") return "Completed";
  if (phase === "failed") return "Failed";
  if (phase === "cancelled") return "Cancelled";
  if (phase === "queued") return "Queued";
  if (phase === "planning") return "Planning";
  return "Working";
}

function receiptSummary(projection: RunnerThreadProjection, run: RunnerThreadRun): string {
  const currentGroup = selectRunnerThreadCurrentActivityGroup(projection, run.id);
  const observerSummary = nonEmptyString(run.projection?.summary);
  if (observerSummary) return observerSummary;
  const groupSummary = nonEmptyString(currentGroup?.liveSummary);
  if (groupSummary) return groupSummary;
  return nonEmptyString(currentGroup?.title || run.title);
}

function receiptHeadline(
  projection: RunnerThreadProjection,
  run: RunnerThreadRun,
  phase: RunnerThreadScreenPhase,
): string {
  if (isRunnerThreadRunActive(run)) {
    return selectRunnerThreadRunWorkingLabel(projection, run.id) || phaseLabel(phase);
  }
  return phaseLabel(phase);
}

function receiptMetrics(
  projection: RunnerThreadProjection,
  run: RunnerThreadRun,
): RunnerThreadRunReceiptMetrics {
  const groups = selectRunnerThreadActivityGroups(projection, { runId: run.id });
  const metricGroups = groups.some((group) => !group.parentGroupId)
    ? groups.filter((group) => !group.parentGroupId)
    : groups;
  const counters = run.projection?.counters;
  return {
    actionCount: counters?.actionCount ?? selectRunnerThreadRunActions(projection, run.id).length,
    activityGroupCount: counters?.activityGroupCount ?? groups.length,
    childRunCount:
      counters?.childRunCount ??
      Object.values(projection.runsById).filter((candidate) => candidate.parentRunId === run.id)
        .length,
    pendingPermissionCount:
      counters?.pendingPermissionCount ??
      selectRunnerThreadPendingPermissions(projection, run.id).length,
    inputTokens: metricGroups.reduce(
      (total, group) => total + (group.metrics?.inputTokens || 0),
      0,
    ),
    outputTokens: metricGroups.reduce(
      (total, group) => total + (group.metrics?.outputTokens || 0),
      0,
    ),
    costUsd: metricGroups.reduce((total, group) => total + (group.metrics?.costUsd || 0), 0),
  };
}

export function buildRunnerThreadRunReceiptViewModel(
  projection: RunnerThreadProjection,
  run: RunnerThreadRun,
): RunnerThreadRunReceiptViewModel {
  const phase = phaseFromRun(projection, run);
  return {
    id: run.id,
    run,
    actor: resolveRunnerPublicThreadParticipant(
      projection,
      run.actorParticipantId ? projection.participantsById[run.actorParticipantId] : null,
    ),
    active: isRunnerThreadRunActive(run),
    phase,
    phaseLabel: phaseLabel(phase),
    headline: receiptHeadline(projection, run, phase),
    summary: receiptSummary(projection, run),
    originLabel: nonEmptyString(run.origin?.label || run.origin?.kind),
    workspaceLabel:
      metadataLabel(run.metadata, [
        "projectName",
        "project_name",
        "computerName",
        "computer_name",
        "environmentName",
        "environment_name",
      ]) ||
      metadataLabel(run.projection?.metadata, [
        "projectName",
        "project_name",
        "computerName",
        "computer_name",
        "environmentName",
        "environment_name",
      ]),
    startedAt: run.startedAt || run.queuedAt || run.createdAt,
    endedAt: run.completedAt || (!isRunnerThreadRunActive(run) ? run.updatedAt || null : null),
    durationMs: resolveDurationMs(run),
    highestPermissionRing:
      run.projection?.highestPermissionRing || run.highestPermissionRing || null,
    metrics: receiptMetrics(projection, run),
  };
}

export function buildRunnerThreadScreenViewModel(
  projection: RunnerThreadProjection,
): RunnerThreadScreenViewModel {
  const receipts = selectRunnerThreadRuns(projection)
    .filter(isRunnerPublicConversationRun)
    .map((run) => buildRunnerThreadRunReceiptViewModel(projection, run));
  const activeRunIds = receipts.filter((receipt) => receipt.active).map((receipt) => receipt.id);
  return {
    receipts,
    defaultRunId: activeRunIds.at(-1) || receipts.at(-1)?.id || null,
    activeRunIds,
    pendingPermissionCount: selectRunnerThreadPendingPermissions(projection).length,
  };
}
