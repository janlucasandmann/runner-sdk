import { describe, expect, it } from "vitest";
import {
  buildRunnerAdEnabledSkillsPayload,
  buildRunnerBacklogSubtaskLabel,
  buildStagedRunnerAdCreationCommand,
  normalizeAdCreationCommandFromMetadata,
  normalizeRunnerAdCreationSettings,
  parseAutoStageBacklogSubtaskCommand,
  parseAutoStageResourceCreationCommand,
  resolveRunnerSlashCommandInputState,
} from "./composer-commands.js";

describe("runner composer commands", () => {
  it("normalizes ad settings and derives the image-generation payload", () => {
    const command = buildStagedRunnerAdCreationCommand({
      quality: "high",
      variants: 4,
    });

    expect(normalizeRunnerAdCreationSettings(command)).toMatchObject({
      style: "premium",
      quality: "high",
      aspectRatio: "1:1",
      variants: 4,
    });
    expect(buildRunnerAdEnabledSkillsPayload(command, { browser: true })).toMatchObject({
      browser: true,
      imageGeneration: true,
      imageGenerationModel: "gpt-image-2",
      imageGenerationQuality: "high",
      imageGenerationConfig: {
        model: "gpt-image-2",
        quality: "high",
      },
    });
  });

  it("restores staged ad commands from persisted message metadata", () => {
    expect(
      normalizeAdCreationCommandFromMetadata({
        adCreationCommand: {
          action: "ad",
          style: "bold",
          quality: "low",
          aspect_ratio: "9:16",
          variant_count: 2,
        },
      })
    ).toMatchObject({
      action: "ad",
      label: "/ad",
      style: "bold",
      quality: "low",
      aspectRatio: "9:16",
      variants: 2,
    });
  });

  it("parses auto-staged commands without leaking command tokens into the prompt", () => {
    expect(parseAutoStageBacklogSubtaskCommand("/subtask 7 fix tests")).toBeNull();
    expect(parseAutoStageBacklogSubtaskCommand("/subtask 007 fix tests")).toEqual({
      ticketNumber: "007",
      prompt: "fix tests",
    });
    expect(buildRunnerBacklogSubtaskLabel("7")).toBe("Subtask to 007");
    expect(parseAutoStageResourceCreationCommand("/computer persistent build host")).toEqual({
      action: "computer",
      prompt: "persistent build host",
    });
  });

  it("finds the active slash command at the cursor", () => {
    expect(resolveRunnerSlashCommandInputState("Please /rese", 12)).toEqual({
      query: "rese",
      prompt: "Please",
    });
    expect(resolveRunnerSlashCommandInputState("/research market", 12)).toBeNull();
  });
});
