// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import {
  PlatformDiffViewer,
  RunnerFileDiffSurface,
} from "./platform-diff-viewer.js";

afterEach(() => {
  cleanup();
});

describe("PlatformDiffViewer", () => {
  it("renders an embedded empty state through the canonical component", () => {
    const { container } = render(
      <PlatformDiffViewer
        diffContent=""
        emptyMessage="No changes"
        hideTopbar
        embedded
      />,
    );

    expect(screen.getByText("No changes")).not.toBeNull();
    expect(container.querySelector(".platform-diff-viewer")).not.toBeNull();
    expect(container.querySelector(".is-embedded")).not.toBeNull();
  });

  it("preserves the runner export as a compatibility alias", () => {
    expect(RunnerFileDiffSurface).toBe(PlatformDiffViewer);
  });
});
