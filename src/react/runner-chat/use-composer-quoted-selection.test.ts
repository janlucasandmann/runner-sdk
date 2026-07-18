// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  COMPOSER_QUOTED_SELECTION_ANIMATION_MS,
  useRunnerComposerQuotedSelection,
} from "./use-composer-quoted-selection.js";

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe("useRunnerComposerQuotedSelection", () => {
  it("keeps the rendered selection mounted through its exit animation", () => {
    const { result } = renderHook(() => useRunnerComposerQuotedSelection());
    const selection = {
      text: "selected output",
      sourceType: "working_log" as const,
    };

    act(() => result.current.setSelection(selection));
    expect(result.current.selection).toEqual(selection);
    expect(result.current.renderedSelection).toEqual(selection);

    act(() => result.current.clear());
    expect(result.current.selection).toBeNull();
    expect(result.current.renderedSelection).toEqual(selection);
    expect(result.current.visible).toBe(false);

    act(() => {
      vi.advanceTimersByTime(COMPOSER_QUOTED_SELECTION_ANIMATION_MS);
    });
    expect(result.current.renderedSelection).toBeNull();
  });
});
