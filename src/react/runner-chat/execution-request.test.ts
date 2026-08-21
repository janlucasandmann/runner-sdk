import { describe, expect, it } from "vitest";
import {
  buildRunnerExecutionMessageMetadata,
  buildRunnerExecutionPrompt,
  buildRunnerThreadMessageRequestBody,
} from "./execution-request.js";

describe("runner execution request", () => {
  it("keeps hidden execution context separate from visible content", () => {
    const prompt = buildRunnerExecutionPrompt({
      taskText: "Build the page",
      hiddenSystemPrompt: "Use the project design system.",
      resourceCreationCommand: {
        action: "computer",
        label: "Computer",
      },
      resourceCreationHiddenPrompt: () => "Create a durable database resource.",
    });

    expect(prompt.executionTaskText).toContain("Use the project design system.");
    expect(prompt.executionTaskText).toContain("Create a durable database resource.");
    expect(prompt.executionTaskText).toContain("Build the page");
    expect(prompt.agentGuardrailsHiddenPromptText).toBe("");
  });

  it("builds creation metadata once from normalized command settings", () => {
    expect(buildRunnerExecutionMessageMetadata({
      slideCreationCommand: { action: "slides", label: "Slides" },
      loopCommand: { action: "loop", label: "/loop" },
      adCreationCommand: {
        action: "ad",
        label: "Ad",
        style: "clean",
        quality: "high",
        aspectRatio: "16:9",
        variants: 2,
      },
    })).toMatchObject({
      slideCreationCommand: {
        action: "slides",
      },
      loopCommand: {
        action: "loop",
        label: "/loop",
      },
      adCreationCommand: {
        action: "ad",
        style: "clean",
        quality: "high",
        aspectRatio: "16:9",
        variants: 2,
      },
    });
  });

  it("carries /loop as first-class thread message metadata", () => {
    const body = buildRunnerThreadMessageRequestBody({
      taskText: "Improve the result until it passes",
      visibleTaskText: "Improve the result until it passes",
      executionTaskText: "Improve the result until it passes",
      loopCommand: { action: "loop", label: "/loop" },
    });

    expect(body.messageMetadata).toMatchObject({
      loopCommand: { action: "loop", label: "/loop" },
    });
  });

  it("constructs the thread request body without leaking empty option fields", () => {
    const body = buildRunnerThreadMessageRequestBody({
      taskText: "internal task",
      visibleTaskText: "Visible task",
      executionTaskText: "hidden context\nVisible task",
      agentGuardrailsHiddenPromptText: "guardrail",
      reasoningEffort: "high",
      enabledSkills: { webSearch: true },
      connectors: { linear: { enabled: true } },
      backlogCommand: {
        action: "subtask",
        ticketNumber: "PROJ-12",
        label: "PROJ-12",
      },
      persistFileChanges: false,
    });

    expect(body).toEqual({
      content: "Visible task",
      reasoningEffort: "high",
      executionContent: "hidden context\nVisible task",
      useExecutionContentForUpstream: true,
      messageMetadata: {
        runnerConnectorIds: ["linear"],
      },
      persistFileChanges: false,
      enabledSkills: { webSearch: true },
      connectors: { linear: { enabled: true } },
      backlogTaskCommand: {
        action: "subtask",
        parentTicketNumber: "PROJ-12",
      },
    });
  });

  it("sends a version-pinned Knowledge context at the top level", () => {
    const body = buildRunnerThreadMessageRequestBody({
      taskText: "Find the project convention",
      visibleTaskText: "Find the project convention",
      executionTaskText: "Find the project convention",
      reasoningEffort: "medium",
      knowledgeContext: {
        schemaVersion: "computer_agents_knowledge_context_v1",
        enabled: true,
        libraryIds: ["library-a"],
        bindings: [{ libraryId: "library-a", versionId: "version-4", versionNumber: 4 }],
        mode: "read",
      },
    });

    expect(body.knowledgeContext).toEqual({
      schemaVersion: "computer_agents_knowledge_context_v1",
      enabled: true,
      libraryIds: ["library-a"],
      bindings: [{ libraryId: "library-a", versionId: "version-4", versionNumber: 4 }],
      mode: "read",
    });
  });
});
