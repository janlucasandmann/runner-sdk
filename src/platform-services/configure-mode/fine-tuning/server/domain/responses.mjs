import {
  FINE_TUNING_CT_PER_DOLLAR,
  clampScore,
  compactFineTuningReferenceMetadata,
  computeTokensToUsd,
  createRuntimeError,
  hasPlainObjectContent,
  normalizeResponseArray,
  normalizeString,
  normalizeTokenCount,
  normalizeUsdCost,
  readFirstPlainObject,
  readPlainObject,
  sanitizeReferenceText,
} from "./primitives.mjs";

export async function readJsonResponse(response, fallbackMessage) {
  const text = await response.text().catch(() => "");
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text };
  }
  if (!response.ok) {
    throw createRuntimeError(normalizeString(data?.message || data?.error || fallbackMessage || "Request failed"), response.status);
  }
  return data;
}

export function extractAgentVersionRecord(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.version, source.agentVersion, source.agent_version, source.data?.version, source.data?.agentVersion, source.data, source.item, source.record, source];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const id = normalizeString(candidate.id || candidate.versionId || candidate.version_id);
      if (id) return { ...candidate, id };
    }
  }
  return null;
}

export function extractAgentVersionRecords(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.versions, source.agentVersions, source.agent_versions, source.data?.versions, source.data?.agentVersions, source.data?.agent_versions, source.data, payload];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate
        .map((version) => extractAgentVersionRecord(version))
        .filter(Boolean);
    }
  }
  return [];
}

export function findFineTuningVersionInList(versions, fineTuningJobId) {
  const normalizedJobId = normalizeString(fineTuningJobId);
  if (!normalizedJobId) return null;
  for (const version of Array.isArray(versions) ? versions : []) {
    const metadata = version?.metadata && typeof version.metadata === "object" && !Array.isArray(version.metadata)
      ? version.metadata
      : {};
    if (
      normalizeString(version?.fineTuningJobId || version?.fine_tuning_job_id) === normalizedJobId
      || normalizeString(metadata.fineTuningJobId || metadata.fine_tuning_job_id) === normalizedJobId
    ) {
      return version;
    }
  }
  return null;
}

export function extractThreadRecord(payload) {
  const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
  const candidates = [source.thread, source.data?.thread, source.data, source.item, source.record, source];
  for (const candidate of candidates) {
    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const id = normalizeString(candidate.id || candidate.threadId || candidate.thread_id);
      if (id) return { ...candidate, id };
    }
  }
  return null;
}

