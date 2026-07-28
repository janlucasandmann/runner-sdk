import { normalizeString } from "./primitives.mjs";

const REGISTERED_GRADERS = new Set([
  "json_contract_v1",
  "equal_care_evidence_v1",
]);

function readPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function parseStructuredOutput(value) {
  if (value && typeof value === "object") return value;
  const text = normalizeString(value);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    const firstObject = text.indexOf("{");
    const lastObject = text.lastIndexOf("}");
    if (firstObject >= 0 && lastObject > firstObject) {
      try {
        return JSON.parse(text.slice(firstObject, lastObject + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function clampScore(value) {
  const score = Number(value);
  return Number.isFinite(score) ? Math.max(0, Math.min(1, score)) : 0;
}

function valueAtPath(value, path) {
  return normalizeString(path)
    .split(".")
    .filter(Boolean)
    .reduce((current, part) => {
      if (current === null || current === undefined) return undefined;
      if (Array.isArray(current) && /^\d+$/.test(part)) {
        return current[Number(part)];
      }
      return typeof current === "object" ? current[part] : undefined;
    }, value);
}

function matchesType(value, type) {
  if (type === "array") return Array.isArray(value);
  if (type === "object") {
    return Boolean(value && typeof value === "object" && !Array.isArray(value));
  }
  if (type === "integer") return Number.isInteger(value);
  if (type === "number") return typeof value === "number" && Number.isFinite(value);
  if (type === "null") return value === null;
  return typeof value === type;
}

function gradeJsonContract(actual, configuration) {
  if (actual === null) {
    return {
      score: 0,
      reason: "The target did not return valid JSON.",
      details: { validJson: false },
    };
  }
  const requiredPaths = Array.isArray(configuration.requiredPaths)
    ? configuration.requiredPaths.map(normalizeString).filter(Boolean)
    : [];
  const forbiddenPaths = Array.isArray(configuration.forbiddenPaths)
    ? configuration.forbiddenPaths.map(normalizeString).filter(Boolean)
    : [];
  const types = readPlainObject(configuration.types);
  const requiredResults = requiredPaths.map((path) => ({
    path,
    present: valueAtPath(actual, path) !== undefined,
  }));
  const forbiddenResults = forbiddenPaths.map((path) => ({
    path,
    absent: valueAtPath(actual, path) === undefined,
  }));
  const typeResults = Object.entries(types).map(([path, type]) => ({
    path,
    expected: String(type),
    valid: matchesType(valueAtPath(actual, path), String(type)),
  }));
  const checks = [
    ...requiredResults.map((item) => item.present),
    ...forbiddenResults.map((item) => item.absent),
    ...typeResults.map((item) => item.valid),
  ];
  const score = checks.length
    ? checks.filter(Boolean).length / checks.length
    : 1;
  return {
    score,
    reason: score === 1
      ? "The JSON output satisfies the configured deterministic contract."
      : "The JSON output violates one or more configured contract checks.",
    details: {
      validJson: true,
      requiredPaths: requiredResults,
      forbiddenPaths: forbiddenResults,
      types: typeResults,
    },
  };
}

function findEvidenceBundle(root) {
  const queue = [root];
  const seen = new WeakSet();
  let best = null;
  let bestCollectionCount = -1;
  while (queue.length) {
    const value = queue.shift();
    if (!value || typeof value !== "object" || seen.has(value)) continue;
    seen.add(value);
    if (Array.isArray(value)) {
      queue.push(...value.slice(0, 250));
      continue;
    }
    const collectionCount = [
      "findings",
      "analyses",
      "statistics",
      "source_spans",
      "finding_evidence",
      "source_assets",
      "publications",
      "observations",
      "evidence_spans",
    ].filter((key) => Array.isArray(value[key])).length;
    if (collectionCount > bestCollectionCount) {
      best = value;
      bestCollectionCount = collectionCount;
    }
    queue.push(...Object.values(value).slice(0, 250));
  }
  return readPlainObject(best);
}

function textTokens(value) {
  return Array.from(new Set(
    normalizeString(value)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, " ")
      .split(/\s+/)
      .filter((token) => token.length >= 3)
      .filter((token) => ![
        "and",
        "the",
        "with",
        "from",
        "that",
        "were",
        "was",
        "for",
        "patients",
      ].includes(token)),
  ));
}

function tokenSimilarity(left, right) {
  const leftTokens = textTokens(left);
  const rightTokens = new Set(textTokens(right));
  if (!leftTokens.length || !rightTokens.size) return 0;
  const overlap = leftTokens.filter((token) => rightTokens.has(token)).length;
  const precision = overlap / rightTokens.size;
  const recall = overlap / leftTokens.length;
  return precision + recall
    ? (2 * precision * recall) / (precision + recall)
    : 0;
}

function findingStatement(value) {
  const source = readPlainObject(value);
  return normalizeString(
    source.normalized_statement
      || source.normalizedStatement
      || source["Observation long"]
      || source.statement
      || source.claim,
  );
}

function identifier(value, keys) {
  const source = readPlainObject(value);
  for (const key of keys) {
    const candidate = normalizeString(source[key]);
    if (candidate) return candidate;
  }
  return "";
}

function normalizeEvidenceCollections(bundle) {
  const verified = readPlainObject(
    bundle.verifiedDataset || bundle.verified_dataset,
  );
  const findings = Array.isArray(bundle.findings)
    ? bundle.findings
    : Array.isArray(verified.observations)
      ? verified.observations
      : Array.isArray(bundle.observations)
        ? bundle.observations
        : [];
  const spans = Array.isArray(bundle.source_spans)
    ? bundle.source_spans
    : Array.isArray(verified.evidence_spans)
      ? verified.evidence_spans
      : Array.isArray(bundle.evidence_spans)
        ? bundle.evidence_spans
        : [];
  return {
    findings,
    spans,
    analyses: Array.isArray(bundle.analyses) ? bundle.analyses : [],
    statistics: Array.isArray(bundle.statistics) ? bundle.statistics : [],
    evidenceLinks: Array.isArray(bundle.finding_evidence)
      ? bundle.finding_evidence
      : [],
    sourceAssets: Array.isArray(bundle.source_assets)
      ? bundle.source_assets
      : [],
    publications: Array.isArray(bundle.publications)
      ? bundle.publications
      : [],
    reviewTasks: Array.isArray(bundle.review_tasks)
      ? bundle.review_tasks
      : Array.isArray(verified.review_queue)
        ? verified.review_queue
        : [],
  };
}

function equalCareIntegrity(collections) {
  const analysisIds = new Set(collections.analyses.map((item) => identifier(
    item,
    ["analysis_id", "analysisId", "id"],
  )).filter(Boolean));
  const findingIds = new Set(collections.findings.map((item) => identifier(
    item,
    ["finding_id", "findingId", "Observation ID", "id"],
  )).filter(Boolean));
  const validFindings = collections.findings.filter((item) => {
    const source = readPlainObject(item);
    const findingId = identifier(
      source,
      ["finding_id", "findingId", "Observation ID", "id"],
    );
    const analysisId = identifier(source, ["analysis_id", "analysisId"]);
    return Boolean(
      findingId
      && findingStatement(source)
      && (
        collections.analyses.length === 0
        || (analysisId && analysisIds.has(analysisId))
      ),
    );
  }).length;
  const uniqueFindingIds = findingIds.size === collections.findings.length;
  const findingCoverage = collections.findings.length
    ? validFindings / collections.findings.length
    : 0;
  return {
    score: (findingCoverage * 0.8) + (uniqueFindingIds ? 0.2 : 0),
    findingCount: collections.findings.length,
    validFindingCount: validFindings,
    uniqueFindingIds,
  };
}

function equalCareProvenance(collections) {
  const spanIds = new Set(collections.spans.map((item) => identifier(
    item,
    ["source_span_id", "sourceSpanId", "id"],
  )).filter(Boolean));
  const validSpanIds = new Set(collections.spans.filter((item) => {
    const source = readPlainObject(item);
    const quote = normalizeString(source.exact_quote || source.exactQuote);
    const sourceAssetId = identifier(
      source,
      ["source_asset_id", "sourceAssetId", "source_document_id", "sourceDocumentId"],
    );
    const located = Boolean(
      Number(source.page_number || source.page_start) >= 1
      || normalizeString(source.section_id || source.source_section)
      || normalizeString(source.table_label || source.table_locator),
    );
    return quote.length >= 20 && sourceAssetId && located;
  }).map((item) => identifier(
    item,
    ["source_span_id", "sourceSpanId", "id"],
  )).filter(Boolean));
  const linkedFindingIds = new Set();
  const validLinks = collections.evidenceLinks.filter((item) => {
    const source = readPlainObject(item);
    const findingId = identifier(source, ["finding_id", "findingId"]);
    const spanId = identifier(source, ["source_span_id", "sourceSpanId"]);
    if (findingId && validSpanIds.has(spanId)) linkedFindingIds.add(findingId);
    return findingId && spanIds.has(spanId) && validSpanIds.has(spanId);
  }).length;
  if (collections.evidenceLinks.length === 0) {
    for (const finding of collections.findings) {
      const findingId = identifier(
        finding,
        ["finding_id", "findingId", "Observation ID", "id"],
      );
      const spanId = identifier(finding, ["source_span_id", "sourceSpanId"]);
      if (findingId && validSpanIds.has(spanId)) linkedFindingIds.add(findingId);
    }
  }
  const findingIds = collections.findings.map((item) => identifier(
    item,
    ["finding_id", "findingId", "Observation ID", "id"],
  )).filter(Boolean);
  const findingCoverage = findingIds.length
    ? findingIds.filter((id) => linkedFindingIds.has(id)).length / findingIds.length
    : 0;
  const spanCoverage = collections.spans.length
    ? validSpanIds.size / collections.spans.length
    : 0;
  const linkIntegrity = collections.evidenceLinks.length
    ? validLinks / collections.evidenceLinks.length
    : findingCoverage;
  return {
    score:
      (findingCoverage * 0.55)
      + (spanCoverage * 0.30)
      + (linkIntegrity * 0.15),
    sourceSpanCount: collections.spans.length,
    validSourceSpanCount: validSpanIds.size,
    findingsWithVerifiedEvidence: linkedFindingIds.size,
    findingEvidenceCoverage: findingCoverage,
    linkIntegrity,
  };
}

function equalCareStatistics(collections) {
  if (!collections.statistics.length) {
    return { score: 0, statisticCount: 0, validStatisticCount: 0 };
  }
  const valid = collections.statistics.filter((item) => {
    const source = readPlainObject(item);
    const rawText = normalizeString(source.raw_text || source.rawText);
    const parsingStatus = normalizeString(
      source.parsing_status || source.parsingStatus,
    ).toLowerCase();
    const typed = normalizeString(source.kind);
    const numericOrReviewed = Number.isFinite(Number(source.value))
      || ["partial", "unparsed", "not_applicable"].includes(parsingStatus);
    return rawText && typed && parsingStatus && numericOrReviewed;
  }).length;
  return {
    score: valid / collections.statistics.length,
    statisticCount: collections.statistics.length,
    validStatisticCount: valid,
  };
}

function expectedFindings(value) {
  const parsed = parseStructuredOutput(value);
  if (!parsed) return [];
  return normalizeEvidenceCollections(findEvidenceBundle(parsed)).findings;
}

function equalCareGoldMatch(actualFindings, expected) {
  if (!expected.length) {
    return {
      applicable: false,
      score: 1,
      matchedExpected: 0,
      expectedCount: 0,
      actualCount: actualFindings.length,
    };
  }
  const unused = new Set(actualFindings.map((_item, index) => index));
  let matches = 0;
  for (const target of expected) {
    let bestIndex = -1;
    let bestScore = 0;
    for (const index of unused) {
      const similarity = tokenSimilarity(
        findingStatement(target),
        findingStatement(actualFindings[index]),
      );
      if (similarity > bestScore) {
        bestIndex = index;
        bestScore = similarity;
      }
    }
    if (bestIndex >= 0 && bestScore >= 0.65) {
      unused.delete(bestIndex);
      matches += 1;
    }
  }
  const precision = actualFindings.length ? matches / actualFindings.length : 0;
  const recall = matches / expected.length;
  const score = precision + recall
    ? (2 * precision * recall) / (precision + recall)
    : 0;
  return {
    applicable: true,
    score,
    precision,
    recall,
    matchedExpected: matches,
    expectedCount: expected.length,
    actualCount: actualFindings.length,
  };
}

function equalCareRiskPenalties(root, collections) {
  const serialized = JSON.stringify(root).toLowerCase();
  const abstractOnly = /\babstract[-_ ]only\b/.test(serialized)
    || /"source[_a-z]*"\s*:\s*"abstract"/.test(serialized);
  const unresolvedFindings = collections.findings.filter((item) => {
    const source = readPlainObject(item);
    const confidence = normalizeString(
      source.provenance_confidence
        || source.provenanceConfidence
        || source.confidence_tier,
    ).toLowerCase();
    return ["c", "inferred", "unlocated", "inferred_unlocated"].includes(confidence);
  }).length;
  const openReviews = collections.reviewTasks.filter((item) => ![
    "resolved",
    "closed",
    "verified",
    "accepted",
  ].includes(normalizeString(readPlainObject(item).status).toLowerCase())).length;
  const deduction = Math.min(
    0.6,
    (abstractOnly ? 0.35 : 0)
      + (
        collections.findings.length
          ? (unresolvedFindings / collections.findings.length) * 0.2
          : 0
      )
      + (
        collections.findings.length
          ? Math.min(0.05, openReviews / collections.findings.length)
          : 0
      ),
  );
  return {
    deduction,
    abstractOnly,
    unresolvedFindings,
    openReviews,
  };
}

function gradeEqualCareEvidence(actual, expected) {
  if (actual === null) {
    return {
      score: 0,
      reason: "The Equal Care workflow did not return valid JSON evidence.",
      details: { validJson: false },
    };
  }
  const bundle = findEvidenceBundle(actual);
  const collections = normalizeEvidenceCollections(bundle);
  const integrity = equalCareIntegrity(collections);
  const provenance = equalCareProvenance(collections);
  const statistics = equalCareStatistics(collections);
  const goldMatch = equalCareGoldMatch(
    collections.findings,
    expectedFindings(expected),
  );
  const risks = equalCareRiskPenalties(actual, collections);
  const baseScore =
    (integrity.score * 0.30)
    + (provenance.score * 0.35)
    + (statistics.score * 0.15)
    + (goldMatch.score * 0.20);
  const score = clampScore(baseScore - risks.deduction);
  return {
    score,
    reason: score >= 0.8
      ? "The workflow returned traceable, structured scientific evidence."
      : "The workflow did not satisfy the deterministic Equal Care evidence gate.",
    details: {
      validJson: true,
      integrity,
      provenance,
      statistics,
      goldMatch,
      risks,
      weights: {
        integrity: 0.30,
        provenance: 0.35,
        statistics: 0.15,
        goldMatch: 0.20,
      },
    },
  };
}

export function runDeterministicGrader({
  graderId,
  actualOutput,
  expectedOutput,
  configuration = {},
}) {
  const normalizedGraderId = normalizeString(graderId).toLowerCase();
  if (!REGISTERED_GRADERS.has(normalizedGraderId)) {
    throw new Error(
      `Unknown deterministic Evaluation grader "${normalizedGraderId || "missing"}".`,
    );
  }
  const actual = parseStructuredOutput(actualOutput);
  const result = normalizedGraderId === "json_contract_v1"
    ? gradeJsonContract(actual, readPlainObject(configuration))
    : gradeEqualCareEvidence(actual, expectedOutput);
  return {
    graderId: normalizedGraderId,
    score: clampScore(result.score),
    reason: result.reason,
    details: result.details,
    parseStatus: actual === null ? "invalid_json" : "deterministic",
  };
}

export function listDeterministicGraders() {
  return [...REGISTERED_GRADERS];
}
