import assert from "node:assert/strict";
import test from "node:test";

import {
  buildProjectDeliveryTaskPrompt,
  normalizeProjectDeliveryTaskEvidence,
} from "./project-delivery-task.mjs";

test("build evidence is closed, resource-bound, and requires real health checks", () => {
  const metadata = {
    deliveryStageId: "build",
    resourceIds: ["function_1", "metronome_1"],
  };
  const evidence = normalizeProjectDeliveryTaskEvidence(
    [
      "Implemented and verified.",
      "```project_delivery_build_json",
      JSON.stringify({
        schemaVersion: "computer_agents_project_delivery_build_evidence_v1",
        summary: "Deployed both resources.",
        commitSha: "a".repeat(40),
        resources: [{
          id: "function_1",
          revision: "function-version-2",
          status: "deployed",
          url: "https://function.example.test/health",
        }, {
          id: "metronome_1",
          revision: "workflow-version-3",
          status: "published",
          url: null,
        }],
        healthChecks: [{
          name: "Function smoke test",
          status: "passed",
          url: "https://function.example.test/health",
        }],
        artifacts: [{
          name: "build manifest",
          uri: "workspace://artifacts/build-manifest.json",
          sha256: `sha256:${"b".repeat(64)}`,
        }],
      }),
      "```",
    ].join("\n"),
    metadata,
  );

  assert.equal(evidence.commitSha, "a".repeat(40));
  assert.deepEqual(
    evidence.resources.map((resource) => resource.id),
    ["function_1", "metronome_1"],
  );
  assert.equal(evidence.healthChecks[0].status, "passed");
  assert.match(
    buildProjectDeliveryTaskPrompt(metadata),
    /project_delivery_build_json/,
  );
});

test("build evidence rejects missing bound resources and failed health checks", () => {
  const response = (healthStatus) => [
    "```project_delivery_build_json",
    JSON.stringify({
      schemaVersion: "computer_agents_project_delivery_build_evidence_v1",
      summary: "Incomplete.",
      commitSha: "c".repeat(40),
      resources: [{
        id: "function_1",
        revision: "version-1",
        status: "deployed",
      }],
      healthChecks: [{
        name: "Smoke test",
        status: healthStatus,
      }],
      artifacts: [],
    }),
    "```",
  ].join("\n");

  assert.throws(
    () => normalizeProjectDeliveryTaskEvidence(
      response("passed"),
      {
        deliveryStageId: "build",
        resourceIds: ["function_1", "metronome_1"],
      },
    ),
    /missing required resources/i,
  );
  assert.throws(
    () => normalizeProjectDeliveryTaskEvidence(
      response("failed"),
      {
        deliveryStageId: "build",
        resourceIds: ["function_1"],
      },
    ),
    /health check/i,
  );
});

test("handoff evidence is bound to the passed assurance run", () => {
  const metadata = {
    deliveryStageId: "deliver",
    assuranceRunId: "assurance_run_1",
  };
  const response = [
    "```project_delivery_handoff_json",
    JSON.stringify({
      schemaVersion: "computer_agents_project_delivery_handoff_evidence_v1",
      summary: "Operational handoff completed.",
      assuranceRunId: "assurance_run_1",
      resources: [{
        id: "function_1",
        revision: "version-2",
        status: "deployed",
        url: "https://function.example.test",
      }],
      handoff: ["Runbook stored with the project."],
      residualRisks: [],
    }),
    "```",
  ].join("\n");

  const evidence = normalizeProjectDeliveryTaskEvidence(response, metadata);
  assert.equal(evidence.assuranceRunId, "assurance_run_1");
  assert.deepEqual(evidence.handoff, ["Runbook stored with the project."]);
  assert.match(buildProjectDeliveryTaskPrompt(metadata), /assurance_run_1/);
  assert.throws(
    () => normalizeProjectDeliveryTaskEvidence(
      response.replace("assurance_run_1", "assurance_run_wrong"),
      metadata,
    ),
    /passed Assurance Run/i,
  );
});
