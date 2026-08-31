// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
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

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(screen.getByText("Prompt identity")).not.toBeNull();
    expect(screen.getByText("Prompt Markdown editor")).not.toBeNull();
    expect(
      container.querySelector(".prompt-detail-page")?.classList.contains("is-sidebar-empty"),
    ).toBe(true);
    expect(container.querySelector(".platform-detail-sidebar")).toBeNull();
  });

  it("uses the centralized resource Settings page contract", () => {
    const { container } = render(
      <PromptDetailPage
        activeTab="settings"
        metadata={<div>Prompt identity</div>}
        code={<div>Prompt Markdown editor</div>}
        settings={{
          ariaLabel: "Prompt settings",
          identity: {
            icon: <span>P</span>,
            title: "Research prompt",
            description: "Research current material",
            onTitleChange: () => undefined,
            onDescriptionChange: () => undefined,
          },
          details: {
            variant: "standard",
            updatedAt: "2026-08-29T10:30:00.000Z",
            creator: { value: "creator-1", name: "Creator Name" },
            owner: { value: "owner-1", name: "Owner Name" },
            primaryActions: [{ id: "start", label: "New Thread", onSelect: () => undefined }],
          },
          location: <div>Storage region</div>,
          access: <div>Prompt access settings</div>,
          detailsSidebarAriaLabel: "Prompt properties",
          detailsSidebarClassName:
            "prompt-detail-page__settings-sidebar-frame playground-agents-detail-sidebar",
        }}
      />,
    );

    const page = container.querySelector(".prompt-detail-page");
    const settingsPage = container.querySelector("[data-platform-resource-settings-page='true']");
    const sidebar = container.querySelector(".prompt-detail-page__settings-sidebar-frame");
    expect(page?.classList.contains("is-settings-tab")).toBe(true);
    expect(page?.classList.contains("playground-agents-detail-overview-layout")).toBe(true);
    expect(
      container
        .querySelector(".prompt-detail-page__content")
        ?.classList.contains("playground-agents-detail-overview-main"),
    ).toBe(true);
    expect(settingsPage).not.toBeNull();
    expect(page?.classList.contains("is-sidebar-empty")).toBe(true);
    expect(sidebar?.classList.contains("playground-agents-detail-sidebar")).toBe(true);
    expect(settingsPage?.contains(sidebar)).toBe(true);
    expect(
      (screen.getByRole("textbox", { name: "Resource name" }) as HTMLTextAreaElement).value,
    ).toBe("Research prompt");
    expect(screen.getByText("Storage region")).not.toBeNull();
    expect(screen.getByText("Prompt access settings")).not.toBeNull();
    expect(screen.getByRole("complementary", { name: "Prompt properties" })).not.toBeNull();
    expect(screen.getByText("Scope")).not.toBeNull();
    expect(screen.getByText("Updated")).not.toBeNull();
    expect(screen.getByText("Creator")).not.toBeNull();
    expect(screen.getByText("Owner")).not.toBeNull();
    expect(screen.queryByText("Prompt identity")).toBeNull();
    expect(screen.queryByText("Prompt Markdown editor")).toBeNull();
  });
});
