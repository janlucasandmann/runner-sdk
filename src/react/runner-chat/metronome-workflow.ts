import type { RunnerLog } from "../../types.js";
import type { RunnerAttachment } from "./attachment-types.js";

export interface RunnerChatMetronomeWorkflowRunPayload {
  threadId: string;
  workflowId: string;
  runId: string;
  workflowName: string;
  status: string;
  triggerCommand?: string;
  triggerEventId?: string;
  originThreadId?: string;
  sourceThreadId?: string;
  triggerThreadId?: string;
  nodeId?: string;
  isOriginThread?: boolean;
  userMessage?: string;
  activeNodeId?: string;
  activeEdgeId?: string;
  workflowMap?: unknown;
  attachments?: RunnerAttachment[];
  log: RunnerLog;
}

export function buildRunnerMetronomeWorkflowRunPayload(
  log: RunnerLog,
  threadId: string,
  context?: {
    userMessage?: string;
    attachments?: RunnerAttachment[] | null;
  },
): RunnerChatMetronomeWorkflowRunPayload | null {
  if (
    log.eventType !== "metronome_workflow"
    && !log.metadata?.metronomeWorkflow
  ) {
    return null;
  }
  const workflow =
    log.metadata?.metronomeWorkflow
    && typeof log.metadata.metronomeWorkflow === "object"
      ? log.metadata.metronomeWorkflow as Record<string, unknown>
      : null;
  if (!workflow) {
    return null;
  }
  const workflowId = String(
    workflow.metronomeId || workflow.workflowId || workflow.id || "",
  ).trim();
  const runId = String(workflow.runId || workflow.workflowRunId || "").trim();
  if (!workflowId || !runId) {
    return null;
  }
  const nodeId = String(workflow.nodeId || workflow.node_id || "").trim();
  const triggerCommand = String(workflow.triggerCommand || "").trim();
  const triggerEventId = String(workflow.triggerEventId || "").trim();
  const definitionSource = String(workflow.definitionSource || "")
    .trim()
    .toLowerCase();
  const source = String(workflow.source || "").trim().toLowerCase();
  const isOriginThread =
    workflow.isOriginThread === true || workflow.is_origin_thread === true;
  const isExplicitNodeThread =
    Boolean(nodeId)
    || workflow.isOriginThread === false
    || workflow.is_origin_thread === false;
  const hasThreadTriggerMarker = Boolean(
    triggerCommand
    || triggerEventId
    || definitionSource === "thread"
    || definitionSource === "thread_event"
    || source === "thread_event"
    || isOriginThread,
  );
  if (isExplicitNodeThread || !hasThreadTriggerMarker) {
    return null;
  }

  return {
    threadId: String(threadId || "").trim(),
    workflowId,
    runId,
    workflowName: String(
      workflow.metronomeName
      || workflow.workflowName
      || workflow.name
      || "Metronome",
    ).trim() || "Metronome",
    status: String(
      workflow.status || log.metadata?.status || "running",
    ).trim() || "running",
    triggerCommand: triggerCommand || undefined,
    triggerEventId: triggerEventId || undefined,
    originThreadId: String(workflow.originThreadId || "").trim() || undefined,
    sourceThreadId: String(workflow.sourceThreadId || "").trim() || undefined,
    triggerThreadId: String(workflow.triggerThreadId || "").trim() || undefined,
    nodeId: nodeId || undefined,
    isOriginThread: isOriginThread || undefined,
    userMessage: String(
      workflow.userMessage
      || workflow.displayMessage
      || workflow.inputPrompt
      || context?.userMessage
      || "",
    ).trim() || undefined,
    activeNodeId: String(workflow.activeNodeId || "").trim() || undefined,
    activeEdgeId: String(workflow.activeEdgeId || "").trim() || undefined,
    workflowMap: workflow.workflowMap,
    attachments: Array.isArray(context?.attachments)
      ? context.attachments
      : undefined,
    log,
  };
}
