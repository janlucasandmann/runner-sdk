import assert from "node:assert/strict";
import test from "node:test";
import {
  listDeterministicGraders,
  runDeterministicGrader,
} from "./deterministic-graders.mjs";

function evidenceBundle(overrides = {}) {
  return {
    publications: [{ publication_id: "PUB_1", pmid: "123" }],
    source_assets: [{
      source_asset_id: "ASSET_1",
      sha256: "a".repeat(64),
      immutable: true,
    }],
    analyses: [{ analysis_id: "ANALYSIS_1" }],
    findings: [{
      finding_id: "FINDING_1",
      analysis_id: "ANALYSIS_1",
      normalized_statement:
        "Women had a lower adjusted relapse rate than men.",
    }],
    statistics: [{
      statistic_id: "STAT_1",
      finding_id: "FINDING_1",
      kind: "effect_estimate",
      value: 0.72,
      raw_text: "adjusted rate ratio 0.72",
      parsing_status: "parsed",
    }],
    source_spans: [{
      source_span_id: "SPAN_1",
      source_asset_id: "ASSET_1",
      exact_quote:
        "Women had a significantly lower adjusted annual relapse rate than men.",
      page_start: 7,
    }],
    finding_evidence: [{
      finding_id: "FINDING_1",
      source_span_id: "SPAN_1",
    }],
    ...overrides,
  };
}

test("the Equal Care grader rewards canonical, source-traceable evidence", () => {
  const actual = evidenceBundle();
  const result = runDeterministicGrader({
    graderId: "equal_care_evidence_v1",
    actualOutput: JSON.stringify(actual),
    expectedOutput: JSON.stringify({
      findings: actual.findings,
    }),
  });

  assert.equal(result.graderId, "equal_care_evidence_v1");
  assert.equal(result.score, 1);
  assert.equal(result.details.provenance.findingEvidenceCoverage, 1);
  assert.equal(result.details.statistics.validStatisticCount, 1);
});

test("the Equal Care grader fails unsupported findings without source spans", () => {
  const actual = evidenceBundle({
    source_spans: [],
    finding_evidence: [],
  });
  const result = runDeterministicGrader({
    graderId: "equal_care_evidence_v1",
    actualOutput: actual,
    expectedOutput: JSON.stringify({ findings: actual.findings }),
  });

  assert.ok(result.score < 0.8);
  assert.equal(result.details.provenance.findingEvidenceCoverage, 0);
});

test("the registered JSON contract grader is deterministic and fail-closed", () => {
  const passing = runDeterministicGrader({
    graderId: "json_contract_v1",
    actualOutput: '{"result":{"status":"accepted"},"items":[]}',
    configuration: {
      requiredPaths: ["result.status", "items"],
      forbiddenPaths: ["error"],
      types: {
        "result.status": "string",
        items: "array",
      },
    },
  });
  assert.equal(passing.score, 1);

  const failing = runDeterministicGrader({
    graderId: "json_contract_v1",
    actualOutput: "not-json",
  });
  assert.equal(failing.score, 0);
  assert.equal(failing.parseStatus, "invalid_json");
  assert.deepEqual(listDeterministicGraders(), [
    "json_contract_v1",
    "equal_care_evidence_v1",
  ]);
});
