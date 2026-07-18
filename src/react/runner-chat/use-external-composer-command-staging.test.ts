// @vitest-environment jsdom

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { useRunnerExternalComposerCommandStaging } from "./use-external-composer-command-staging.js";

const noop = () => {};

describe("useRunnerExternalComposerCommandStaging", () => {
  it("stages each external token once", () => {
    const onStage = vi.fn();
    const stageResourceCreation = vi.fn();
    const { rerender } = renderHook(
      ({ token }) =>
        useRunnerExternalComposerCommandStaging({
          resourceCreation: { token, type: "computer" },
          enableBacklogSubtask: false,
          enableBacklogMissionControl: false,
          enableResourceCreation: true,
          enableAgentCreation: false,
          enableSkillCreation: false,
          stagedResourceCreationType: null,
          stagedAgentCreationType: null,
          stagedSkillCreationType: null,
          onStage,
          stageBacklogSubtask: noop,
          stageBacklogMissionControl: noop,
          stageResourceCreation,
          stageAgentCreation: noop,
          stageSkillCreation: noop,
        }),
      { initialProps: { token: "one" } },
    );

    expect(stageResourceCreation).toHaveBeenCalledOnce();
    expect(stageResourceCreation).toHaveBeenCalledWith("computer");
    expect(onStage).toHaveBeenCalledOnce();

    rerender({ token: "one" });
    expect(stageResourceCreation).toHaveBeenCalledOnce();

    rerender({ token: "two" });
    expect(stageResourceCreation).toHaveBeenCalledTimes(2);
    expect(onStage).toHaveBeenCalledTimes(2);
  });

  it("publishes staged command type changes", () => {
    const onResourceCreationChange = vi.fn();
    const { rerender } = renderHook(
      ({ type }: { type: "app" | null }) =>
        useRunnerExternalComposerCommandStaging({
          enableBacklogSubtask: false,
          enableBacklogMissionControl: false,
          enableResourceCreation: false,
          enableAgentCreation: false,
          enableSkillCreation: false,
          stagedResourceCreationType: type,
          stagedAgentCreationType: null,
          stagedSkillCreationType: null,
          onResourceCreationChange,
          onStage: noop,
          stageBacklogSubtask: noop,
          stageBacklogMissionControl: noop,
          stageResourceCreation: noop,
          stageAgentCreation: noop,
          stageSkillCreation: noop,
        }),
      { initialProps: { type: null as "app" | null } },
    );

    expect(onResourceCreationChange).toHaveBeenLastCalledWith(null);
    rerender({ type: "app" });
    expect(onResourceCreationChange).toHaveBeenLastCalledWith("app");
  });
});
