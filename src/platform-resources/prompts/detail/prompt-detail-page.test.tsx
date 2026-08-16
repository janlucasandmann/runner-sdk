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

  it("uses the shared settings frame and resource sidebar contract", () => {
    const { container } = render(
      <PromptDetailPage
        activeTab="settings"
        metadata={<div>Prompt identity</div>}
        code={<div>Prompt Markdown editor</div>}
        settings={<div>Prompt access settings</div>}
        sidebar={<div>Prompt properties</div>}
      />,
    );

    const page = container.querySelector(".prompt-detail-page");
    const sidebar = container.querySelector(".prompt-detail-page__settings-sidebar-frame");
    expect(page?.classList.contains("is-settings-tab")).toBe(true);
    expect(page?.classList.contains("playground-agents-detail-overview-layout")).toBe(true);
    expect(
      container
        .querySelector(".prompt-detail-page__content")
        ?.classList.contains("playground-agents-detail-overview-main"),
    ).toBe(true);
    expect(sidebar?.classList.contains("playground-agents-detail-sidebar")).toBe(true);
    expect(page?.contains(sidebar)).toBe(true);
    expect(screen.getByText("Prompt access settings")).not.toBeNull();
    expect(screen.getByText("Prompt properties")).not.toBeNull();
    expect(screen.queryByText("Prompt identity")).toBeNull();
    expect(screen.queryByText("Prompt Markdown editor")).toBeNull();
  });
});
