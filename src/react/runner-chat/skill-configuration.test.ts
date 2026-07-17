import { describe, expect, it } from "vitest";
import {
  areStringArraysEqual,
  buildEnabledSkillsPayload,
  buildEnabledSkillsStorageKey,
  defaultEnabledSkillIds,
  normalizeComputerAgentSkills,
  normalizeEnabledSkillIdList,
  normalizeRunnerSkillId,
} from "./skill-configuration.js";

describe("runner skill configuration", () => {
  it("normalizes legacy aliases and deduplicates controlled selections", () => {
    expect(normalizeRunnerSkillId("deepResearch")).toBe("deep_research");
    expect(normalizeRunnerSkillId("gmail")).toBe("email");
    expect(normalizeEnabledSkillIdList([
      "deepResearch",
      "deep_research",
      "",
      "custom",
    ])).toEqual(["deep_research", "custom"]);
  });

  it("merges backend skills onto the canonical core catalog", () => {
    const skills = normalizeComputerAgentSkills([
      { id: "deepResearch", name: "Research Pro", enabled: false },
      { id: "custom_skill", name: "Custom", isCustom: true },
    ]);
    expect(skills.find((skill) => skill.id === "deep_research")).toMatchObject({
      name: "Research Pro",
      enabled: false,
    });
    expect(skills.at(-1)).toMatchObject({
      id: "custom_skill",
      name: "Custom",
    });
  });

  it("builds the worker payload including model defaults and custom skills", () => {
    expect(buildEnabledSkillsPayload(
      ["image_generation", "deep_research", "computer_agents", "custom_skill"],
      [{ id: "custom_skill", name: "Custom", isCustom: true }],
      {
        imageGeneration: {
          model: " image-model ",
          quality: " high ",
          computeTokensPerImage: 1200.4,
        },
        deepResearch: { model: "research-model" },
      },
    )).toMatchObject({
      imageGeneration: true,
      deepResearch: true,
      computerAgents: true,
      imageGenerationConfig: {
        model: "image-model",
        quality: "high",
        computeTokensPerImage: 1200,
      },
      deepResearchConfig: { model: "research-model" },
      customSkills: ["custom_skill"],
    });
  });

  it("keeps defaults and storage identity deterministic", () => {
    expect(buildEnabledSkillsStorageKey("platform")).toBe(
      "tb_runner_chat_enabled_skills_v3:platform",
    );
    expect(defaultEnabledSkillIds([
      { id: "web_search", name: "Search" },
      { id: "custom", name: "Custom", isCustom: true },
    ])).toEqual(["web_search"]);
    expect(areStringArraysEqual(["a", "b"], ["a", "b"])).toBe(true);
    expect(areStringArraysEqual(["a", "b"], ["b", "a"])).toBe(false);
  });
});
