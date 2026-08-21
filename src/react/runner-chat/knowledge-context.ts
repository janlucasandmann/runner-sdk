import type { LocalAttachment, RunnerAttachment } from "./attachment-types.js";

/**
 * Stable binding passed to the execution API when a thread is scoped to one or
 * more Knowledge libraries. Versions are optional for backwards compatibility,
 * but callers should provide them whenever a saved library snapshot is known.
 */
export interface RunnerKnowledgeContextBinding {
  libraryId: string;
  versionId?: string;
  versionNumber?: number;
  fingerprint?: string;
}

export type RunnerKnowledgeContextMode = "read" | "propose" | "write";

export interface RunnerKnowledgeContext {
  schemaVersion: "computer_agents_knowledge_context_v1";
  enabled: true;
  libraryIds: string[];
  bindings: RunnerKnowledgeContextBinding[];
  mode: RunnerKnowledgeContextMode;
  source?: string;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function normalizedId(value: unknown): string {
  return typeof value === "string" ? value.trim() : String(value || "").trim();
}

function normalizedPositiveNumber(value: unknown): number | undefined {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : undefined;
}

function normalizeBinding(value: unknown): RunnerKnowledgeContextBinding | null {
  const source = asRecord(value);
  const libraryId = normalizedId(
    source.libraryId || source.library_id || source.id,
  );
  if (!libraryId) return null;
  const versionId = normalizedId(
    source.versionId || source.version_id || source.libraryVersionId || source.library_version_id,
  );
  const fingerprint = normalizedId(source.fingerprint || source.libraryFingerprint || source.library_fingerprint);
  const versionNumber = normalizedPositiveNumber(
    source.versionNumber || source.version_number || source.libraryVersionNumber || source.library_version_number,
  );
  return {
    libraryId,
    ...(versionId ? { versionId } : {}),
    ...(versionNumber ? { versionNumber } : {}),
    ...(fingerprint ? { fingerprint } : {}),
  };
}

/** Normalizes user-provided context without ever emitting empty/undefined fields. */
export function normalizeRunnerKnowledgeContext(
  value: unknown,
  defaults: Partial<Pick<RunnerKnowledgeContext, "mode" | "source">> = {},
): RunnerKnowledgeContext | null {
  const source = asRecord(value);
  if (source.enabled === false) return null;
  const rawBindings = Array.isArray(source.bindings)
    ? source.bindings
    : Array.isArray(source.libraries)
      ? source.libraries
      : [];
  const bindingsByLibraryId = new Map<string, RunnerKnowledgeContextBinding>();
  for (const candidate of rawBindings) {
    const binding = normalizeBinding(candidate);
    if (!binding) continue;
    bindingsByLibraryId.set(binding.libraryId, {
      ...(bindingsByLibraryId.get(binding.libraryId) || {}),
      ...binding,
    });
  }
  const libraryIds = [
    ...(Array.isArray(source.libraryIds) ? source.libraryIds : []),
    ...(Array.isArray(source.library_ids) ? source.library_ids : []),
    ...bindingsByLibraryId.keys(),
  ]
    .map(normalizedId)
    .filter((id, index, all) => id && all.indexOf(id) === index);
  if (!libraryIds.length) return null;
  for (const libraryId of libraryIds) {
    if (!bindingsByLibraryId.has(libraryId)) {
      bindingsByLibraryId.set(libraryId, { libraryId });
    }
  }
  const requestedMode = normalizedId(source.mode || source.accessMode || source.access_mode || defaults.mode);
  const mode: RunnerKnowledgeContextMode = requestedMode === "write" || requestedMode === "propose"
    ? requestedMode
    : "read";
  const sourceLabel = normalizedId(source.source || defaults.source);
  return {
    schemaVersion: "computer_agents_knowledge_context_v1",
    enabled: true,
    libraryIds,
    bindings: libraryIds.map((libraryId) => bindingsByLibraryId.get(libraryId) || { libraryId }),
    mode,
    ...(sourceLabel ? { source: sourceLabel.slice(0, 80) } : {}),
  };
}

export function mergeRunnerKnowledgeContexts(
  ...values: readonly unknown[]
): RunnerKnowledgeContext | null {
  const contexts = values
    .map((value) => normalizeRunnerKnowledgeContext(value))
    .filter((value): value is RunnerKnowledgeContext => Boolean(value));
  if (!contexts.length) return null;
  const bindingsByLibraryId = new Map<string, RunnerKnowledgeContextBinding>();
  const libraryIds: string[] = [];
  for (const context of contexts) {
    for (const libraryId of context.libraryIds) {
      if (!libraryIds.includes(libraryId)) libraryIds.push(libraryId);
    }
    for (const binding of context.bindings) {
      bindingsByLibraryId.set(binding.libraryId, {
        ...(bindingsByLibraryId.get(binding.libraryId) || {}),
        ...binding,
      });
    }
  }
  const last = contexts[contexts.length - 1];
  return normalizeRunnerKnowledgeContext({
    enabled: true,
    libraryIds,
    bindings: libraryIds.map((libraryId) => bindingsByLibraryId.get(libraryId) || { libraryId }),
    mode: last.mode,
    source: last.source || contexts[0].source,
  });
}

export function buildRunnerKnowledgeContextFromAttachments(
  attachments: readonly (LocalAttachment | RunnerAttachment)[] = [],
): RunnerKnowledgeContext | null {
  const bindings = attachments
    .filter((attachment) => attachment?.referenceType === "knowledge")
    .map((attachment) => ({
      libraryId: attachment.knowledgeLibraryId,
      versionId: attachment.knowledgeVersionId,
      versionNumber: attachment.knowledgeVersionNumber,
    }));
  return normalizeRunnerKnowledgeContext({
    enabled: true,
    bindings,
    // Attached Knowledge is an active working context, not a passive file
    // preview. Allow the runtime to propose versioned changes when the user
    // and resource policy permit it; the Knowledge API remains the
    // authoritative per-operation permission boundary.
    mode: "propose",
    source: "composer",
  });
}
