import type { RunnerChatComposerSubmitPayload } from "../../../../react/runner-chat/public-types.js";
import type { BatchJobDraft, BatchStartPolicy } from "./batches-types.js";

const QUICK_BATCH_NAME_MAX_LENGTH = 96;

export interface BuildBatchThreadJobDraftOptions {
  draft?: BatchJobDraft | null;
  name?: string;
  description?: string;
  targetResourceId?: string | null;
  startPolicy?: BatchStartPolicy;
  metadata?: Record<string, unknown> | null;
}

export type CompleteBatchThreadJobDraft = BatchJobDraft & {
  name: string;
  targetKind: "thread_run";
};

export function buildQuickBatchJobName(prompt: string): string {
  const normalized = String(prompt || "")
    .split(/\r?\n/, 1)[0]
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return "New thread Batch";
  if (normalized.length <= QUICK_BATCH_NAME_MAX_LENGTH) return normalized;
  return `${normalized.slice(0, QUICK_BATCH_NAME_MAX_LENGTH - 1).trimEnd()}…`;
}

export function buildBatchThreadJobDraft(
  payload: RunnerChatComposerSubmitPayload,
  options: BuildBatchThreadJobDraftOptions = {},
): CompleteBatchThreadJobDraft {
  const inheritedDraft = options.draft || {};
  const inheritedDefinition =
    inheritedDraft.targetKind === "thread_run" &&
    inheritedDraft.definition &&
    typeof inheritedDraft.definition === "object" &&
    !Array.isArray(inheritedDraft.definition)
      ? inheritedDraft.definition
      : {};
  const prompt = payload.prompt.trim();
  const explicitName = String(options.name || "").trim();

  return {
    ...inheritedDraft,
    name: explicitName || buildQuickBatchJobName(prompt),
    description: String(options.description ?? inheritedDraft.description ?? "").trim(),
    targetKind: "thread_run",
    targetResourceId: String(options.targetResourceId || "").trim() || null,
    targetVersionId: null,
    sourceProjectId: null,
    sourceTicketId: null,
    startPolicy: options.startPolicy || "manual",
    metadata: {
      ...(inheritedDraft.metadata || {}),
      ...(options.metadata || {}),
    },
    definition: {
      ...inheritedDefinition,
      message: prompt,
      attachments: payload.attachments,
      environmentId: payload.environmentId,
      projectId: payload.projectId || null,
      agentId: payload.agentId,
      agentName: payload.agentName || null,
      reasoningEffort: payload.reasoningEffort || null,
      githubRepo: payload.githubRepo || null,
      enabledSkills: payload.enabledSkills || null,
      connectors: payload.connectors || null,
      knowledgeContext: payload.knowledgeContext || null,
      quotedSelection: payload.quotedSelection || null,
    },
  };
}

export function buildQuickBatchThreadJobDraft(
  payload: RunnerChatComposerSubmitPayload,
): CompleteBatchThreadJobDraft {
  return buildBatchThreadJobDraft(payload, {
    startPolicy: "manual",
    metadata: {
      source: "task_input_slash_command",
      createdFromComposer: true,
    },
  });
}
