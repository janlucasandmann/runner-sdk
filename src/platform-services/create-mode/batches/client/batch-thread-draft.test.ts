import { describe, expect, it } from "vitest";
import { buildBatchThreadJobDraft, buildQuickBatchThreadJobDraft } from "./batch-thread-draft.js";

const payload = {
  prompt: "Review this repository for authentication vulnerabilities",
  attachments: [],
  environmentId: "environment-1",
  projectId: "project-1",
  agentId: "agent-1",
  agentName: "Spark",
  reasoningEffort: "high",
  githubRepo: null,
  enabledSkills: { codeReview: true },
  connectors: { github: true },
  knowledgeContext: null,
  quotedSelection: null,
};

describe("batch thread draft", () => {
  it("builds quick composer jobs as held keep-on-shelf work", () => {
    const draft = buildQuickBatchThreadJobDraft(payload);

    expect(draft.name).toBe(payload.prompt);
    expect(draft.targetKind).toBe("thread_run");
    expect(draft.targetResourceId).toBeNull();
    expect(draft.startPolicy).toBe("manual");
    expect(draft.metadata).toMatchObject({
      source: "task_input_slash_command",
      createdFromComposer: true,
    });
    expect(draft.definition).toMatchObject({
      message: payload.prompt,
      attachments: payload.attachments,
      environmentId: "environment-1",
      projectId: "project-1",
      agentId: "agent-1",
      agentName: "Spark",
      reasoningEffort: "high",
      enabledSkills: { codeReview: true },
      connectors: { github: true },
    });
  });

  it("preserves modal draft metadata and explicit start policies", () => {
    const draft = buildBatchThreadJobDraft(payload, {
      draft: {
        targetKind: "thread_run",
        idempotencyKey: "batch-ui:stable",
        metadata: { origin: "modal" },
        definition: { customBoundary: true },
      },
      name: "Named Batch",
      description: "Reusable work",
      startPolicy: "stay_on_shelf",
      targetResourceId: "thread-existing",
    });

    expect(draft).toMatchObject({
      name: "Named Batch",
      description: "Reusable work",
      idempotencyKey: "batch-ui:stable",
      targetResourceId: "thread-existing",
      startPolicy: "stay_on_shelf",
      metadata: { origin: "modal" },
      definition: { customBoundary: true, message: payload.prompt },
    });
  });
});
