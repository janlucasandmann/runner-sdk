const SCHEMA_VERSION = "computer_agents_knowledge_context_v1";

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function id(value) {
  return String(value ?? "").trim();
}

function positiveInteger(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.round(number) : undefined;
}

function normalizeBinding(value) {
  if (!isRecord(value)) return null;
  const libraryId = id(value.libraryId || value.library_id || value.id);
  if (!libraryId) return null;
  const versionId = id(value.versionId || value.version_id || value.libraryVersionId || value.library_version_id);
  const versionNumber = positiveInteger(value.versionNumber || value.version_number || value.libraryVersionNumber || value.library_version_number);
  const fingerprint = id(value.fingerprint || value.libraryFingerprint || value.library_fingerprint);
  return {
    libraryId,
    ...(versionId ? { versionId } : {}),
    ...(versionNumber ? { versionNumber } : {}),
    ...(fingerprint ? { fingerprint } : {}),
  };
}

export function normalizeKnowledgeContext(value, defaults = {}) {
  if (!isRecord(value) || value.enabled === false) return null;
  const candidates = Array.isArray(value.bindings)
    ? value.bindings
    : Array.isArray(value.libraries)
      ? value.libraries
      : [];
  const bindingsByLibraryId = new Map();
  for (const candidate of candidates) {
    const binding = normalizeBinding(candidate);
    if (!binding) continue;
    bindingsByLibraryId.set(binding.libraryId, {
      ...(bindingsByLibraryId.get(binding.libraryId) || {}),
      ...binding,
    });
  }
  const libraryIds = [
    ...(Array.isArray(value.libraryIds) ? value.libraryIds : []),
    ...(Array.isArray(value.library_ids) ? value.library_ids : []),
    ...bindingsByLibraryId.keys(),
  ].map(id).filter((libraryId, index, all) => libraryId && all.indexOf(libraryId) === index);
  if (!libraryIds.length) return null;
  for (const libraryId of libraryIds) {
    if (!bindingsByLibraryId.has(libraryId)) bindingsByLibraryId.set(libraryId, { libraryId });
  }
  const requestedMode = id(value.mode || value.accessMode || value.access_mode || defaults.mode);
  const mode = requestedMode === "write" || requestedMode === "propose" ? requestedMode : "read";
  const source = id(value.source || defaults.source);
  return {
    schemaVersion: SCHEMA_VERSION,
    enabled: true,
    libraryIds,
    bindings: libraryIds.map((libraryId) => bindingsByLibraryId.get(libraryId) || { libraryId }),
    mode,
    ...(source ? { source: source.slice(0, 80) } : {}),
  };
}

export function knowledgeContextFromMetadata(metadata) {
  if (!isRecord(metadata)) return null;
  return normalizeKnowledgeContext(
    metadata.knowledgeContext
      || metadata.knowledge_context
      || metadata.evaluation?.knowledgeContext
      || metadata.evaluation?.knowledge_context
      || metadata.fineTuning?.knowledgeContext
      || metadata.fineTuning?.knowledge_context
      || metadata.runnerPlayground?.knowledgeContext
      || metadata.runnerPlayground?.knowledge_context,
  );
}
