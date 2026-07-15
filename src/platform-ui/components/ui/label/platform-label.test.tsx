// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { createRef } from "react";
import { PlatformLabel } from "./platform-label.js";

afterEach(cleanup);

describe("PlatformLabel", () => {
  it("defaults to the gray label contract", () => {
    render(<PlatformLabel>Light</PlatformLabel>);

    const label = screen.getByText("Light");
    expect(label.classList.contains("platform-label")).toBe(true);
    expect(label.classList.contains("is-gray")).toBe(true);
    expect(label.dataset.platformLabelVariant).toBe("gray");
  });

  it("supports every color variant and native span attributes", () => {
    const ref = createRef<HTMLSpanElement>();
    render(<PlatformLabel ref={ref} variant="green" title="Desktop profile">Desktop</PlatformLabel>);

    expect(ref.current).toBe(screen.getByText("Desktop"));
    expect(ref.current?.classList.contains("is-green")).toBe(true);
    expect(ref.current?.title).toBe("Desktop profile");
  });
});
