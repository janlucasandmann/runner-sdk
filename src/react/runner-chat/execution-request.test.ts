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
      adCreationCommand: {
        action: "ad",
        style: "clean",
        quality: "high",
        aspectRatio: "16:9",
        variants: 2,
      },
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
      persistFileChanges: false,
      enabledSkills: { webSearch: true },
      connectors: { linear: { enabled: true } },
      backlogTaskCommand: {
        action: "subtask",
        parentTicketNumber: "PROJ-12",
      },
    });
  });
});
