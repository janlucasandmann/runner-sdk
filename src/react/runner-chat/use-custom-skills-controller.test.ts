// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerCustomSkillsController } from "./use-custom-skills-controller.js";

describe("useRunnerCustomSkillsController", () => {
  it("loads custom skills once when the custom surface becomes active", async () => {
    const fetchCustomSkills = vi.fn().mockResolvedValue([
      { id: "system", name: "System", isCustom: false },
      { id: "custom", name: "Custom", isCustom: true },
    ]);
    const { result, rerender } = renderHook(
      ({ active }) => useRunnerCustomSkillsController({ active, fetchCustomSkills }),
      { initialProps: { active: false } },
    );

    expect(fetchCustomSkills).not.toHaveBeenCalled();
    rerender({ active: true });

    await waitFor(() => expect(result.current.loaded).toBe(true));
    rerender({ active: false });
    rerender({ active: true });

    expect(fetchCustomSkills).toHaveBeenCalledOnce();
    expect(result.current.customSkills).toEqual([{ id: "custom", name: "Custom", isCustom: true }]);
  });

  it("accepts execution-loaded skills through the same state boundary", () => {
    const { result } = renderHook(() => useRunnerCustomSkillsController({ active: false }));

    act(() => {
      result.current.acceptLoadedSkills([{ id: "runtime", name: "Runtime", isCustom: true }], true);
    });

    expect(result.current.loaded).toBe(true);
    expect(result.current.customSkills).toHaveLength(1);

    act(() => result.current.acceptLoadedSkills(null, false));
    expect(result.current.loaded).toBe(false);
  });
});
