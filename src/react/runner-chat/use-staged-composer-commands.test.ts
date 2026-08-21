// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { RUNNER_AD_CREATION_DEFAULT_SETTINGS } from "./composer-commands.js";
import { useRunnerStagedComposerCommands } from "./use-staged-composer-commands.js";

describe("useRunnerStagedComposerCommands", () => {
  it("stages commands atomically and forwards their draft", () => {
    const onDraftChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerStagedComposerCommands({
        adCreationSettings: RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        getCurrentDraft: () => "current draft",
        onDraftChange,
      }),
    );

    act(() => result.current.stageResourceCreationCommand("computer", "one"));
    expect(result.current.stagedResourceCreationCommand).toEqual({
      action: "computer",
      label: "/computer",
    });

    act(() => result.current.stageResearchCreationCommand("two"));
    expect(result.current.stagedResourceCreationCommand).toBeNull();
    expect(result.current.stagedResearchCreationCommand?.action).toBe("research");
    expect(onDraftChange).toHaveBeenLastCalledWith("two");
  });

  it("preserves backlog staging for a plain draft and dismisses it on demand", () => {
    const onDraftChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerStagedComposerCommands({
        adCreationSettings: RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        getCurrentDraft: () => "existing",
        onDraftChange,
      }),
    );

    act(() => result.current.stageBacklogSubtaskCommand("TB-42"));
    expect(result.current.stagedBacklogSubtaskCommand?.ticketNumber).toBe("042");
    expect(onDraftChange).toHaveBeenLastCalledWith("existing");

    act(() => result.current.setComposerDraft("replacement"));
    expect(result.current.stagedBacklogSubtaskCommand).not.toBeNull();
    expect(onDraftChange).toHaveBeenLastCalledWith("replacement");

    let dismissed = false;
    act(() => {
      dismissed = result.current.dismissActiveCommand();
    });
    expect(dismissed).toBe(true);
    expect(result.current.stagedBacklogSubtaskCommand).toBeNull();
  });

  it("refreshes an active ad command without staging an inactive one", () => {
    const { result } = renderHook(() =>
      useRunnerStagedComposerCommands({
        adCreationSettings: RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        getCurrentDraft: () => "",
        onDraftChange: vi.fn(),
      }),
    );

    act(() =>
      result.current.refreshStagedAdCreationCommand({
        ...RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        quality: "high",
      }),
    );
    expect(result.current.stagedAdCreationCommand).toBeNull();

    act(() => result.current.stageAdCreationCommand());
    act(() =>
      result.current.refreshStagedAdCreationCommand({
        ...RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        quality: "high",
      }),
    );
    expect(result.current.stagedAdCreationCommand?.quality).toBe("high");
  });

  it("auto-stages supported slash commands in deterministic priority order", () => {
    const onDraftChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerStagedComposerCommands({
        adCreationSettings: RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        getCurrentDraft: () => "",
        onDraftChange,
      }),
    );

    let handled = false;
    act(() => {
      handled = result.current.tryAutoStageInput("/slides Quarterly plan");
    });
    expect(handled).toBe(true);
    expect(result.current.stagedSlideCreationCommand?.action).toBe("slides");
    expect(onDraftChange).toHaveBeenLastCalledWith("Quarterly plan");

    act(() => result.current.clearAllStagedCommands());
    act(() => {
      handled = result.current.tryAutoStageInput("/loop raise the score");
    });
    expect(handled).toBe(true);
    expect(result.current.stagedLoopCommand).toEqual({
      action: "loop",
      label: "/loop",
    });
    expect(onDraftChange).toHaveBeenLastCalledWith("raise the score");

    act(() => {
      handled = result.current.tryAutoStageInput("/research ignored");
    });
    expect(handled).toBe(false);
    expect(result.current.stagedResearchCreationCommand).toBeNull();
  });

  it("gates product-specific auto-staging behind explicit capabilities", () => {
    const { result } = renderHook(() =>
      useRunnerStagedComposerCommands({
        adCreationSettings: RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        getCurrentDraft: () => "",
        onDraftChange: vi.fn(),
      }),
    );

    let handled = true;
    act(() => {
      handled = result.current.tryAutoStageInput("/app Build a dashboard");
    });
    expect(handled).toBe(false);

    act(() => {
      handled = result.current.tryAutoStageInput("/app Build a dashboard", {
        resourceCreation: true,
      });
    });
    expect(handled).toBe(true);
    expect(result.current.stagedResourceCreationCommand).toMatchObject({
      action: "app",
    });
  });

  it("stages Batch creation only when the host exposes the capability", () => {
    const onDraftChange = vi.fn();
    const { result } = renderHook(() =>
      useRunnerStagedComposerCommands({
        adCreationSettings: RUNNER_AD_CREATION_DEFAULT_SETTINGS,
        getCurrentDraft: () => "",
        onDraftChange,
      }),
    );

    let handled = true;
    act(() => {
      handled = result.current.tryAutoStageInput("/Batch audit dependencies");
    });
    expect(handled).toBe(false);

    act(() => {
      handled = result.current.tryAutoStageInput("/Batch audit dependencies", {
        batchCreation: true,
      });
    });
    expect(handled).toBe(true);
    expect(result.current.stagedBatchCreationCommand).toEqual({
      action: "batch",
      label: "/Batch",
    });
    expect(onDraftChange).toHaveBeenLastCalledWith("audit dependencies");
  });
});
