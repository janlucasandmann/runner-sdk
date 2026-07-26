import { createHash } from "node:crypto";

import {
  createRuntimeError,
  normalizeString,
  readPlainObject,
} from "./primitives.mjs";

export const FINE_TUNING_PUBLICATION_EVIDENCE_SCHEMA =
  "agent_optimization_publication_evidence_v2";
export const FINE_TUNING_PUBLICATION_DECISION_SCHEMA =
  "agent_optimization_publication_decision_v1";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (!value || typeof value !== "object") {
    if (typeof value === "number" && !Number.isFinite(value)) return null;
    return value === undefined ? null : value;
  }
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .filter((key) => value[key] !== undefined)
      .map((key) => [key, canonicalize(value[key])]),
  );
}

function buildPublicationEvidence(job, championIteration) {
  const configuration = readPlainObject(job?.configuration);
  return canonicalize({
    schemaVersion: FINE_TUNING_PUBLICATION_EVIDENCE_SCHEMA,
    jobId: normalizeString(job?.id),
    targetMet: job?.targetMet === true,
    targetAgent: {
      id: normalizeString(configuration?.targetAgent?.id),
      versionId: normalizeString(configuration?.targetAgent?.versionId),
    },
    objective: readPlainObject(configuration.objective),
    publicationPolicy: readPlainObject(configuration.publicationPolicy),
    evaluationTargets: (
      Array.isArray(configuration.evaluationTargets)
        ? configuration.evaluationTargets
        : []
    ).map((target) => ({
      evaluationSetId: normalizeString(target?.evaluationSetId),
      evaluationVersionId: normalizeString(target?.evaluationVersionId),
      passThreshold: target?.passThreshold,
      successPolicy: readPlainObject(target?.successPolicy),
    })),
    iteration: {
      id: normalizeString(championIteration?.id),
      number: Number(championIteration?.number || 0),
      candidateVersionId: normalizeString(championIteration?.candidateVersionId),
      accepted: championIteration?.accepted === true,
      targetMet: championIteration?.targetMet === true,
      candidateSnapshot: readPlainObject(championIteration?.candidateSnapshot),
      baselineMetrics: readPlainObject(championIteration?.baselineMetrics),
      metrics: readPlainObject(championIteration?.metrics),
      decisionEvidence: readPlainObject(championIteration?.decisionEvidence),
      evaluationRuns: Array.isArray(championIteration?.evaluationRuns)
        ? championIteration.evaluationRuns
        : [],
      caseComparisons: Array.isArray(championIteration?.caseComparisons)
        ? championIteration.caseComparisons
        : [],
    },
  });
}

export function buildFineTuningPublicationEvidenceFingerprint(job, championIteration) {
  const evidence = buildPublicationEvidence(job, championIteration);
  return `sha256:${createHash("sha256").update(JSON.stringify(evidence)).digest("hex")}`;
}

export function buildFineTuningPublicationDecision(
  job,
  championIteration,
  shouldPublish,
) {
  const existing = readPlainObject(job?.publicationDecision);
  const nowIso = new Date().toISOString();
  if (!championIteration?.candidateVersionId) {
    return {
      schemaVersion: FINE_TUNING_PUBLICATION_DECISION_SCHEMA,
      status: "not_applicable",
      decisionType: "policy",
      mode: job?.configuration?.publicationPolicy?.mode || "manual",
      reason: "No verified candidate version was available for publication.",
      policyId: "agent_optimization_publication_policy_v1",
      actor: null,
      candidateVersionId: "",
      iterationId: "",
      evidenceSchemaVersion: FINE_TUNING_PUBLICATION_EVIDENCE_SCHEMA,
      evidenceFingerprint: "",
      createdAt: existing.createdAt || nowIso,
      evaluatedAt: nowIso,
    };
  }
  return {
    schemaVersion: FINE_TUNING_PUBLICATION_DECISION_SCHEMA,
    status: shouldPublish ? "approved" : "pending",
    decisionType: shouldPublish ? "policy" : "manual_review",
    mode: job.configuration.publicationPolicy.mode,
    reason: shouldPublish
      ? "The versioned publication policy approved the independently verified candidate."
      : "The candidate is verified and requires explicit human publication.",
    policyId: "agent_optimization_publication_policy_v1",
    actor: shouldPublish
      ? {
          id: "agent_optimization_publication_policy_v1",
          type: "policy",
          name: "Agent Optimization publication policy",
        }
      : null,
    candidateVersionId: normalizeString(championIteration.candidateVersionId),
    iterationId: normalizeString(championIteration.id),
    evidenceSchemaVersion: FINE_TUNING_PUBLICATION_EVIDENCE_SCHEMA,
    evidenceFingerprint: buildFineTuningPublicationEvidenceFingerprint(
      job,
      championIteration,
    ),
    createdAt: existing.createdAt || nowIso,
    evaluatedAt: nowIso,
  };
}

export function resolveFineTuningPublicationCandidate(
  job,
  expectedEvidenceFingerprint = "",
) {
  const decision = readPlainObject(job?.publicationDecision);
  const iterations = Array.isArray(job?.iterations) ? job.iterations : [];
  const iterationId = normalizeString(decision.iterationId || decision.iteration_id);
  const candidateVersionId = normalizeString(
    decision.candidateVersionId || decision.candidate_version_id,
  );
  const championIteration = iterations.find((iteration) => (
    normalizeString(iteration?.id) === iterationId
  )) || null;
  if (!championIteration || championIteration.accepted !== true) {
    throw createRuntimeError(
      "The publication candidate is missing or no longer passes its release gate.",
      409,
    );
  }
  if (
    !candidateVersionId
    || normalizeString(championIteration.candidateVersionId) !== candidateVersionId
  ) {
    throw createRuntimeError(
      "The publication decision no longer matches the verified candidate version.",
      409,
    );
  }
  const storedEvidenceFingerprint = normalizeString(
    decision.evidenceFingerprint || decision.evidence_fingerprint,
  );
  const expected = normalizeString(expectedEvidenceFingerprint);
  if (expected && expected !== storedEvidenceFingerprint) {
    throw createRuntimeError(
      "The publication evidence changed after this review was opened.",
      409,
    );
  }
  if (
    normalizeString(
      decision.evidenceSchemaVersion || decision.evidence_schema_version,
    ) !== FINE_TUNING_PUBLICATION_EVIDENCE_SCHEMA
  ) {
    throw createRuntimeError(
      "The publication evidence uses an unsupported schema and must be re-evaluated.",
      409,
    );
  }
  const recomputedEvidenceFingerprint =
    buildFineTuningPublicationEvidenceFingerprint(job, championIteration);
  if (
    !storedEvidenceFingerprint
    || recomputedEvidenceFingerprint !== storedEvidenceFingerprint
  ) {
    throw createRuntimeError(
      "The verified evidence no longer matches the publication decision.",
      409,
    );
  }
  return {
    championIteration,
    decision,
    evidenceFingerprint: storedEvidenceFingerprint,
  };
}
