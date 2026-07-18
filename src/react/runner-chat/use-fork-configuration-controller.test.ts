// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { LocalAttachment } from "./attachment-types.js";
import type { RunnerTurn } from "./turn-types.js";
import { useRunnerForkConfigurationController } from "./use-fork-configuration-controller.js";

function createTurn(): RunnerTurn {
  return {
    id: "turn-1",
    prompt: "Continue from here",
    logs: [],
    startedAtMs: 1,
    status: "completed",
    quotedSelection: {
      text: "selected context",
      sourceType: "run_summary",
    },
  };
}

describe("useRunnerForkConfigurationController", () => {
  it("opens message forks with normalized defaults", () => {
    const { result } = renderHook(() =>
      useRunnerForkConfigurationController({
        availableEnvironments: [{ id: "environment-1", name: "Production" }],
        defaultEnvironmentId: "fallback",
        displayedEnvironmentLabel: "Default",
        selectedEnvironmentId: "selected",
        selectedEnvironmentName: "Selected",
        sourceEnvironmentId: "environment-1",
        sourceEnvironmentName: "Production",
      }),
    );
    const turn = createTurn();

    act(() => result.current.openMessageForkConfiguration("thread-1", turn));

    expect(result.current.pendingForkConfiguration).toEqual(
      expect.objectContaining({
        source: "message",
        sourceThreadId: "thread-1",
        stagedPrompt: "Continue from here",
        turn,
      }),
    );
    expect(result.current.forkTargetEnvironmentId).toBe("environment-1");
    expect(result.current.forkNewEnvironmentName).toBe("Production Fork");
  });

  it("preserves thread-fork options and returns restoration state on cancel", () => {
    const { result } = renderHook(() =>
      useRunnerForkConfigurationController({
        availableEnvironments: [],
        selectedEnvironmentId: "environment-1",
        selectedEnvironmentName: "Development",
      }),
    );
    const attachment: LocalAttachment = {
      id: "local-1",
      file: new File(["content"], "report.txt"),
      source: "local",
      type: "document",
    };

    act(() =>
      result.current.openThreadForkConfiguration({
        attachments: [attachment],
        initialExistingEnvironmentFileCopyMode: "thread_only",
        preselectedTargetEnvironmentId: "environment-2",
        quotedSelection: null,
        restoreSelectedEnvironmentId: "environment-1",
        sourceThreadId: "thread-1",
        stagedPrompt: "New direction",
      }),
    );

    expect(result.current.pendingForkConfiguration).toEqual(
      expect.objectContaining({
        attachments: [attachment],
        restoreSelectedEnvironmentId: "environment-1",
        source: "thread",
      }),
    );
    expect(result.current.forkTargetEnvironmentId).toBe("environment-2");
    expect(result.current.forkExistingEnvironmentFileCopyMode).toBe("thread_only");

    let restoredEnvironmentId: string | null = null;
    act(() => {
      restoredEnvironmentId = result.current.cancelPendingForkConfiguration();
    });
    expect(restoredEnvironmentId).toBe("environment-1");
    expect(result.current.pendingForkConfiguration).toBeNull();
  });

  it("derives ordered target environments and copy controls", () => {
    const { result } = renderHook(() =>
      useRunnerForkConfigurationController({
        availableEnvironments: [
          { id: "environment-1", name: "One" },
          { id: "environment-2", name: "Two" },
        ],
        sourceEnvironmentId: "environment-1",
        sourceEnvironmentName: "One",
      }),
    );

    act(() => result.current.setForkTargetEnvironmentId("environment-2"));

    expect(result.current.orderedForkTargetEnvironments[0]?.id).toBe("environment-2");
    expect(result.current.shouldShowForkExistingEnvironmentCopyOptions).toBe(true);
    expect(result.current.selectedForkExistingEnvironment?.name).toBe("Two");
  });
});
