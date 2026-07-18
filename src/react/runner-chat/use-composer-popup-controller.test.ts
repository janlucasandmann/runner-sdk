// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POPUP_ANIMATION_DURATION_MS } from "./composer-popup.js";
import { useRunnerComposerPopupController } from "./use-composer-popup-controller.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("useRunnerComposerPopupController", () => {
  it("coordinates a stacked popup and preserves its exit direction", () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useRunnerComposerPopupController({ onClose }));

    act(() => result.current.openPlusPopup("skills"));

    expect(result.current.activeInputPopup).toBe("skills");
    expect(result.current.renderedMainPopup).toBe("main");
    expect(result.current.renderedSidePopup).toBe("skills");
    expect(result.current.mainPopupPhase).toBe("enter");
    expect(result.current.sidePopupPhase).toBe("enter");

    act(() => {
      vi.advanceTimersByTime(POPUP_ANIMATION_DURATION_MS);
    });
    expect(result.current.mainPopupPhase).toBe("idle");
    expect(result.current.sidePopupPhase).toBe("idle");

    act(() => result.current.closeAllInputPopups("outside"));

    expect(onClose).toHaveBeenCalledOnce();
    expect(result.current.activeInputPopup).toBeNull();
    expect(result.current.sidePopupExitDirection).toBe("down");
    expect(result.current.mainPopupPhase).toBe("exit");
    expect(result.current.sidePopupPhase).toBe("exit");

    act(() => {
      vi.advanceTimersByTime(POPUP_ANIMATION_DURATION_MS);
    });
    expect(result.current.renderedMainPopup).toBeNull();
    expect(result.current.renderedSidePopup).toBeNull();
    expect(result.current.sidePopupExitDirection).toBe("left");
  });

  it("closes an existing composer when another composer opens", () => {
    const first = renderHook(() => useRunnerComposerPopupController());
    const second = renderHook(() => useRunnerComposerPopupController());

    act(() => first.result.current.togglePopup("agent"));
    expect(first.result.current.activeInputPopup).toBe("agent");

    act(() => second.result.current.togglePopup("environment"));

    expect(first.result.current.activeInputPopup).toBeNull();
    expect(second.result.current.activeInputPopup).toBe("environment");
  });
});
