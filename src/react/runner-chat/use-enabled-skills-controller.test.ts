// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useRunnerEnabledSkillsController } from "./use-enabled-skills-controller.js";

const STORAGE_KEY = "runner-chat:test-enabled-skills";
const skills = [
  { id: "web_search", name: "Web Search", enabled: true },
  { id: "pdf", name: "PDF", enabled: false },
];

describe("useRunnerEnabledSkillsController", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores persisted skills and emits toggles", () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(["pdf"]));
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerEnabledSkillsController({
        controlledEnabledSkillIds: null,
        normalizedSkills: skills,
        onChange,
        storageKey: STORAGE_KEY,
      }),
    );

    expect(result.current.enabledSkillIds).toEqual(["pdf"]);
    act(() => result.current.toggleSkill("web_search"));

    expect(result.current.enabledSkillIds).toEqual(["pdf", "web_search"]);
    expect(onChange).toHaveBeenCalledWith(["pdf", "web_search"]);
  });

  it("synchronizes controlled skill ids", () => {
    const { result, rerender } = renderHook(
      ({ controlled }) =>
        useRunnerEnabledSkillsController({
          controlledEnabledSkillIds: controlled,
          normalizedSkills: skills,
          storageKey: STORAGE_KEY,
        }),
      { initialProps: { controlled: ["web_search"] } },
    );

    rerender({ controlled: ["pdf"] });
    expect(result.current.enabledSkillIds).toEqual(["pdf"]);
  });
});
