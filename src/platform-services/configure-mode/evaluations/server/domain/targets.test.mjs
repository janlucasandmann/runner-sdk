import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  executeEvaluationTarget,
  hydrateEvaluationSourceAssets,
  normalizeEvaluationTargetBinding,
} from "./targets.mjs";

test("Function Evaluation targets invoke only the pinned deployment revision", async () => {
  const calls = [];
  const result = await executeEvaluationTarget({
    binding: {
      bindingStatus: "control_plane_pinned",
      kind: "function",
      targetId: "function_extract",
      targetVersionId: "function_version_7",
      targetVersionNumber: 7,
      targetFingerprint: `sha256:${"a".repeat(64)}`,
      invocation: { method: "POST", path: "/extract", timeoutMs: 30_000 },
      snapshot: {
        deployment: { revision: "revision-immutable-7" },
      },
    },
    caseInput: JSON.stringify({ pmid: "123" }),
    runId: "run_1",
    caseId: "case_1",
    requestJson: async (path, options) => {
      calls.push({ path, body: JSON.parse(options.body) });
      return {
        ok: true,
        status: 200,
        deploymentRevision: "revision-immutable-7",
        body: { publication: { pmid: "123" } },
      };
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].path, "/servers/function_extract/invoke");
  assert.equal(calls[0].body.expectedRevision, "revision-immutable-7");
  assert.deepEqual(calls[0].body.body, { pmid: "123" });
  assert.equal(result.execution.kind, "function");
  assert.equal(result.execution.deploymentRevision, "revision-immutable-7");
  assert.equal(
    result.actualOutput,
    '{"publication":{"pmid":"123"}}',
  );
});

test("Function Evaluation targets fail closed when the deployment revision drifts", async () => {
  await assert.rejects(
    executeEvaluationTarget({
      binding: {
        bindingStatus: "control_plane_pinned",
        kind: "function",
        targetId: "function_extract",
        targetVersionId: "function_version_7",
        invocation: { method: "POST", path: "/", timeoutMs: 30_000 },
        snapshot: { deployment: { revision: "revision-7" } },
      },
      caseInput: "{}",
      runId: "run_1",
      caseId: "case_1",
      requestJson: async () => ({
        ok: true,
        status: 200,
        deploymentRevision: "revision-8",
        body: {},
      }),
    }),
    /changed after the Evaluation target was pinned/,
  );
});

test("service topology Evaluation targets execute the immutable entrypoint", async () => {
  const result = await executeEvaluationTarget({
    binding: {
      bindingStatus: "control_plane_pinned",
      kind: "service_topology",
      targetId: "workflow_equal_care",
      targetVersionId: "workflow_version_3",
      targetFingerprint: `sha256:${"b".repeat(64)}`,
      invocation: { method: "POST", path: "/", timeoutMs: 30_000 },
      snapshot: {
        entrypoint: "pipeline",
        resources: [{
          key: "pipeline",
          kind: "metronome",
          id: "workflow_equal_care",
          versionId: "workflow_version_3",
          versionNumber: 3,
          fingerprint: `sha256:${"c".repeat(64)}`,
          snapshot: {
            definition: {
              nodes: [{ id: "start", kind: "trigger" }],
              edges: [],
            },
          },
        }, {
          key: "extractor",
          kind: "agent",
          id: "agent_equal_care",
          versionId: "agent_version_9",
          versionNumber: 9,
          fingerprint: `sha256:${"d".repeat(64)}`,
          snapshot: {
            source: "agent_version",
            agentId: "agent_equal_care",
            agentVersionId: "agent_version_9",
          },
        }],
      },
    },
    caseInput: { pmid: "123" },
    runId: "run_1",
    caseId: "case_1",
    pollMs: 1,
    requestJson: async (path, options) => {
      assert.equal(
        path,
        "/metronomes/workflow_equal_care/test-run",
      );
      const body = JSON.parse(options.body);
      assert.deepEqual(body.input, { pmid: "123" });
      assert.deepEqual(body.pinnedAgentVersions, {
        agent_equal_care: "agent_version_9",
      });
      assert.equal(body.versionId, "workflow_version_3");
      assert.equal(body.idempotencyKey, "evaluation:run_1:case_1");
      assert.equal(body.executeImmediately, false);
      return {
        data: {
          id: "metronome_run_1",
          status: "completed",
          output: {
            findings: [],
            pinnedAgentVersions: {
              agent_equal_care: "agent_version_9",
            },
            exercisedPinnedAgentVersions: {
              agent_equal_care: "agent_version_9",
            },
          },
        },
      };
    },
  });

  assert.equal(result.execution.requestedTargetKind, "service_topology");
  assert.equal(result.execution.kind, "metronome");
  assert.deepEqual(result.execution.pinnedAgentVersions, {
    agent_equal_care: "agent_version_9",
  });
  assert.deepEqual(result.execution.exercisedPinnedAgentVersions, {
    agent_equal_care: "agent_version_9",
  });
  assert.deepEqual(JSON.parse(result.actualOutput), {
    exercisedPinnedAgentVersions: {
      agent_equal_care: "agent_version_9",
    },
    findings: [],
    pinnedAgentVersions: {
      agent_equal_care: "agent_version_9",
    },
  });
});

test("Metronome Evaluation targets queue, poll, and recover full structured thread output", async () => {
  const calls = [];
  let runReads = 0;
  const result = await executeEvaluationTarget({
    binding: {
      bindingStatus: "control_plane_pinned",
      kind: "service_topology",
      targetId: "topology_equal_care",
      targetVersionId: "topology_version_4",
      targetFingerprint: `sha256:${"e".repeat(64)}`,
      invocation: { method: "POST", path: "/", timeoutMs: 30_000 },
      snapshot: {
        entrypoint: "workflow",
        resources: [{
          key: "workflow",
          kind: "metronome",
          id: "workflow_equal_care",
          versionId: "workflow_version_4",
          versionNumber: 4,
          fingerprint: `sha256:${"f".repeat(64)}`,
          snapshot: {
            definition: {
              nodes: [{ id: "start", kind: "trigger" }],
              edges: [],
            },
          },
        }, {
          key: "extractor",
          kind: "agent",
          id: "agent_equal_care",
          versionId: "agent_version_10",
          versionNumber: 10,
          fingerprint: `sha256:${"1".repeat(64)}`,
          snapshot: {},
        }],
      },
    },
    caseInput: { paper: "sealed-paper" },
    runId: "evaluation_run_4",
    caseId: "case_4",
    pollMs: 25,
    pollAttempts: 5,
    requestJson: async (path, options) => {
      calls.push({ path, method: options.method });
      if (path.endsWith("/test-run")) {
        const body = JSON.parse(options.body);
        assert.equal(body.executeImmediately, false);
        assert.equal(body.versionId, "workflow_version_4");
        return {
          data: {
            id: "metronome_run_4",
            status: "queued",
            output: {
              pinnedAgentVersions: {
                agent_equal_care: "agent_version_10",
              },
              exercisedPinnedAgentVersions: {},
            },
          },
        };
      }
      if (path.endsWith("/runs/metronome_run_4?view=status")) {
        runReads += 1;
        if (runReads === 1) {
          return {
            data: {
              id: "metronome_run_4",
              status: "running",
              output: {
                pinnedAgentVersions: {
                  agent_equal_care: "agent_version_10",
                },
                exercisedPinnedAgentVersions: {},
              },
            },
          };
        }
        return {
          data: {
            id: "metronome_run_4",
            status: "completed",
            output: {
              pinnedAgentVersions: {
                agent_equal_care: "agent_version_10",
              },
              exercisedPinnedAgentVersions: {
                agent_equal_care: "agent_version_10",
              },
              threads: [{ id: "thread_extract_4" }],
              steps: [{
                id: "extract",
                output: {
                  tracePayload: {
                    truncated: true,
                    originalBytes: 500_000,
                  },
                },
              }],
            },
          },
        };
      }
      assert.equal(
        path,
        "/threads/thread_extract_4/messages?limit=50&order=desc",
      );
      return {
        data: [{
          role: "assistant",
          content: "```json\n{\"findings\":[{\"finding_id\":\"finding_1\"}]}\n```",
        }],
      };
    },
  });

  assert.equal(runReads, 2);
  assert.equal(result.execution.outputSource, "metronome_thread");
  assert.deepEqual(JSON.parse(result.actualOutput), {
    findings: [{ finding_id: "finding_1" }],
  });
  assert.deepEqual(
    calls.map(({ path }) => path),
    [
      "/metronomes/workflow_equal_care/test-run",
      "/metronomes/workflow_equal_care/runs/metronome_run_4?view=status",
      "/metronomes/workflow_equal_care/runs/metronome_run_4?view=status",
      "/threads/thread_extract_4/messages?limit=50&order=desc",
    ],
  );
});

test("topology execution rejects completed runs that do not attest pinned Agent use", async () => {
  await assert.rejects(
    executeEvaluationTarget({
      binding: {
        schemaVersion: "computer_agents_evaluation_run_binding_v2",
        bindingStatus: "control_plane_pinned",
        kind: "service_topology",
        targetId: "workflow_equal_care",
        targetVersionId: "workflow_version_3",
        targetVersionNumber: 3,
        targetFingerprint: `sha256:${"b".repeat(64)}`,
        invocation: {
          method: "POST",
          path: "/",
          timeoutMs: 30_000,
        },
        snapshot: {
          entrypoint: "workflow",
          resources: [{
            key: "workflow",
            kind: "metronome",
            id: "workflow_equal_care",
            versionId: "workflow_version_3",
            versionNumber: 3,
            fingerprint: `sha256:${"c".repeat(64)}`,
            snapshot: {
              definition: {
                nodes: [{ id: "start", kind: "trigger" }],
                edges: [],
              },
            },
          }, {
            key: "extractor",
            kind: "agent",
            id: "agent_equal_care",
            versionId: "agent_version_9",
            fingerprint: `sha256:${"d".repeat(64)}`,
            snapshot: {},
          }],
        },
      },
      caseInput: { pmid: "123" },
      runId: "run_1",
      caseId: "case_1",
      requestJson: async () => ({
        data: {
          id: "metronome_run_1",
          status: "completed",
          output: {
            pinnedAgentVersions: {
              agent_equal_care: "agent_version_9",
            },
            exercisedPinnedAgentVersions: {},
          },
        },
      }),
    }),
    /did not attest execution of pinned Agent agent_equal_care/,
  );
});

test("topology execution rejects Agent resources without immutable versions", async () => {
  await assert.rejects(
    executeEvaluationTarget({
      binding: {
        schemaVersion: "computer_agents_evaluation_run_binding_v2",
        bindingStatus: "control_plane_pinned",
        kind: "service_topology",
        targetId: "workflow_equal_care",
        targetVersionId: "workflow_version_3",
        targetVersionNumber: 3,
        targetFingerprint: `sha256:${"b".repeat(64)}`,
        invocation: {
          method: "POST",
          path: "/",
          timeoutMs: 30_000,
        },
        snapshot: {
          entrypoint: "workflow",
          resources: [{
            key: "workflow",
            kind: "metronome",
            id: "workflow_equal_care",
            versionId: "workflow_version_3",
            versionNumber: 3,
            fingerprint: `sha256:${"c".repeat(64)}`,
            snapshot: {
              definition: {
                nodes: [{ id: "start", kind: "trigger" }],
                edges: [],
              },
            },
          }, {
            key: "extractor",
            kind: "agent",
            id: "agent_equal_care",
            versionId: null,
            fingerprint: `sha256:${"d".repeat(64)}`,
            snapshot: {},
          }],
        },
      },
      caseInput: { pmid: "123" },
      runId: "run_1",
      caseId: "case_1",
      requestJson: async () => {
        throw new Error("must not invoke target");
      },
    }),
    /Agent without an immutable version/,
  );
});

test("immutable Evaluation source assets are digest-verified and hydrated", async () => {
  const source = Buffer.from("complete scientific paper");
  const digest = createHash("sha256").update(source).digest("hex");
  const immutableUri = `evaluation-source-asset://paper-1/sha256/${digest}`;
  const evaluationBinding = {
    evaluationId: "evaluation_1",
    snapshot: {
      metadata: {
        datasetAssets: [{
          id: "dataset_1",
          sourceAssets: [{
            id: "source_1",
            logicalId: "paper-1",
            filename: "paper.pdf",
            contentType: "application/pdf",
            immutableUri,
            sha256: `sha256:${digest}`,
            sizeBytes: source.byteLength,
          }],
        }],
      },
    },
  };
  let requestedPath = "";
  const result = await hydrateEvaluationSourceAssets({
    evaluationBinding,
    caseInput: JSON.stringify({ source: immutableUri }),
    caseMetadata: {},
    requestBytes: async (path) => {
      requestedPath = path;
      return source;
    },
  });

  assert.equal(
    requestedPath,
    "/evaluations/evaluation_1/dataset-assets/dataset_1/source-assets/source_1/content",
  );
  assert.equal(result.sourceAssets[0].sha256, `sha256:${digest}`);
  assert.equal(
    result.input.evaluationSourceAssets[0].dataBase64,
    source.toString("base64"),
  );
});

test("non-Agent targets reject untrusted caller-defined bindings", () => {
  assert.throws(
    () => normalizeEvaluationTargetBinding({
      kind: "function",
      targetId: "function_1",
      targetVersionId: "version_1",
      snapshot: { deployment: { revision: "revision_1" } },
    }),
    /must be pinned by the platform control plane/,
  );
});
