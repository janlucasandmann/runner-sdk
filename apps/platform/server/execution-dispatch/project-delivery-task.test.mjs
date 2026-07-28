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

test("build prompts require a pinned acceptance Agent to be invoked by exact ID", () => {
  const prompt = buildProjectDeliveryTaskPrompt({
    deliveryStageId: "build",
    targetAgentId: "agent_target",
    topologyResources: [{
      key: "workflow",
      kind: "metronome",
      resourceId: "metronome_1",
      versionId: "metronome_version_1",
    }, {
      key: "target_agent",
      kind: "agent",
      resourceId: "agent_target",
      versionId: "agent_version_4",
    }],
    workflowAcceptanceTarget: {
      kind: "service_topology",
      entrypointResourceKey: "workflow",
      resourceKeys: ["workflow", "target_agent"],
    },
  });

  assert.match(prompt, /invoke target Agent agent_target by exact Agent ID/);
  assert.match(prompt, /fails closed if no executed workflow node uses that pin/);
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

test("build evidence requires managed topology resources but not existing bindings", () => {
  const metadata = {
    deliveryStageId: "build",
    resourceIds: [
      "function_1",
      "function_version_1",
      "metronome_1",
      "metronome_version_1",
      "database_1",
      "agent_1",
      "guardrail_1",
    ],
    topologyResources: [{
      key: "extractor",
      kind: "function",
      lifecycle: "managed",
      resourceId: "function_1",
    }, {
      key: "workflow",
      kind: "metronome",
      lifecycle: "managed",
      resourceId: "metronome_1",
    }, {
      key: "database",
      kind: "database",
      lifecycle: "existing",
      resourceId: "database_1",
    }, {
      key: "target_agent",
      kind: "agent",
      lifecycle: "existing",
      resourceId: "agent_1",
    }],
  };
  const response = [
    "```project_delivery_build_json",
    JSON.stringify({
      schemaVersion: "computer_agents_project_delivery_build_evidence_v1",
      summary: "Managed resources deployed.",
      commitSha: "d".repeat(40),
      resources: [{
        id: "function_1",
        revision: "function-version-2",
        status: "deployed",
      }, {
        id: "metronome_1",
        revision: "workflow-version-3",
        status: "published",
      }],
      healthChecks: [{
        name: "Topology smoke test",
        status: "passed",
      }],
      artifacts: [],
    }),
    "```",
  ].join("\n");

  const evidence = normalizeProjectDeliveryTaskEvidence(response, metadata);
  assert.deepEqual(
    evidence.resources.map((resource) => resource.id),
    ["function_1", "metronome_1"],
  );
  const prompt = buildProjectDeliveryTaskPrompt(metadata);
  assert.match(prompt, /Agent-declared build resources/);
  assert.match(prompt, /must not be fabricated/);
  assert.match(prompt, /Published Metronome versions are immutable/);
  assert.match(prompt, /create and publish a successor version/);
  assert.match(prompt, /real bounded smoke check/);
  assert.match(prompt, /no-paper smoke input/);
});

test("repair build prompts bind trusted diagnostics and prohibit weakening gates", () => {
  const prompt = buildProjectDeliveryTaskPrompt({
    deliveryStageId: "build",
    goal: "Repair the workflow.",
    repairEpisode: {
      schemaVersion: "computer_agents_project_delivery_repair_episode_v1",
      id: "delivery_repair_1",
      repairAttempt: 1,
      maximumAttempts: 2,
      diagnosticFingerprint: `sha256:${"a".repeat(64)}`,
      sourceStage: "test",
      failedRunId: "test_run_failed",
      testPlanVersionId: "test_plan_version_1",
      previousReleaseFingerprint: "release_v1",
      allowedResourceKeys: ["function"],
      failedCases: [{
        caseId: "schema_contract",
        status: "failed",
        message: "Required canonical field is missing.",
      }],
      artifacts: [{
        id: "artifact_1",
        name: "JUnit report",
        uri: "artifact://test_run_failed/junit.xml",
        sha256: `sha256:${"b".repeat(64)}`,
      }],
    },
  });

  assert.match(prompt, /repair attempt 1 of 2/i);
  assert.match(prompt, /test_run_failed/);
  assert.match(prompt, /test_plan_version_1/);
  assert.match(prompt, /schema_contract/);
  assert.match(prompt, /junit\.xml/);
  assert.match(prompt, /Do not edit, weaken, skip, replace, or reclassify/);
  assert.match(prompt, /immutable revision for an allowed target resource only/);
});

test("Evaluation repair prompts carry immutable scores, target identity, and scope", () => {
  const prompt = buildProjectDeliveryTaskPrompt({
    deliveryStageId: "build",
    goal: "Repair the workflow acceptance failure.",
    repairEpisode: {
      schemaVersion: "computer_agents_project_delivery_repair_episode_v1",
      id: "delivery_repair_evaluation_1",
      sourceStage: "acceptance_evaluate",
      repairAttempt: 2,
      maximumAttempts: 3,
      diagnosticFingerprint: `sha256:${"c".repeat(64)}`,
      failedRunId: "evaluation_run_failed",
      evaluationVersionId: "evaluation_version_holdout",
      previousReleaseFingerprint: "release_v2",
      allowedResourceKeys: ["function", "workflow"],
      averageScore: 0.74,
      minimumAverageScore: 0.9,
      passRate: 0.8,
      minimumPassRate: 1,
      failedTargetFingerprint: `sha256:${"d".repeat(64)}`,
      failedCases: [{
        caseId: "paper_4",
        status: "failed",
        score: 0.5,
        message: "Evidence span was not exact.",
      }],
      artifacts: [],
    },
  });

  assert.match(prompt, /Failed gate: acceptance_evaluate/);
  assert.match(prompt, /evaluation_run_failed/);
  assert.match(prompt, /evaluation_version_holdout/);
  assert.match(prompt, /average=0\.74/);
  assert.match(prompt, /paper_4/);
  assert.match(prompt, /function/);
  assert.match(prompt, /out-of-scope resource fails closed/);
});

test("handoff evidence is bound to the passed assurance run", () => {
  const metadata = {
    deliveryStageId: "deliver",
    assuranceRunId: "assurance_run_1",
    resourceIds: ["function_1", "database_1", "guardrail_1"],
    topologyResources: [{
      key: "extractor",
      kind: "function",
      lifecycle: "managed",
      resourceId: "function_1",
    }, {
      key: "database",
      kind: "database",
      lifecycle: "existing",
      resourceId: "database_1",
    }],
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
