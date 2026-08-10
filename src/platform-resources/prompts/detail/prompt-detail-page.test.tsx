// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { PromptDetailPage } from "./prompt-detail-page.js";

afterEach(cleanup);

describe("PromptDetailPage", () => {
  it("renders the prompt identity and single-file Markdown editor without a sidebar", () => {
    const { container } = render(
      <PromptDetailPage
        metadata={<div>Prompt identity</div>}
        code={<div>Prompt Markdown editor</div>}
      />,
    );

    expect(
      container.querySelectorAll("[data-resource-detail-page='true']"),
    ).toHaveLength(1);
    expect(screen.getByText("Prompt identity")).not.toBeNull();
    expect(screen.getByText("Prompt Markdown editor")).not.toBeNull();
    expect(
      container.querySelector(".prompt-detail-page")?.classList.contains("is-sidebar-empty"),
    ).toBe(true);
    expect(container.querySelector(".platform-detail-sidebar")).toBeNull();
  });
});
