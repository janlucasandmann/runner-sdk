// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PlatformUiCard } from "./platform-ui-card.js";

afterEach(cleanup);

describe("PlatformUiCard", () => {
  it("renders the centralized card surface with a configurable semantic element", () => {
    render(
      <PlatformUiCard as="article" variant="feature" className="example-card">
        Card content
      </PlatformUiCard>,
    );

    const card = screen.getByText("Card content");
    expect(card.tagName).toBe("ARTICLE");
    expect(card.classList.contains("platform-ui-card")).toBe(true);
    expect(card.classList.contains("is-feature")).toBe(true);
    expect(card.classList.contains("example-card")).toBe(true);
    expect(card.getAttribute("data-platform-ui-card-variant")).toBe("feature");
  });
});
