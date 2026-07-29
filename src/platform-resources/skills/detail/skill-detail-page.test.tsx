// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SkillDetailPage } from "./skill-detail-page.js";

afterEach(cleanup);

describe("SkillDetailPage", () => {
  it("uses the shared detail shell and renders the code workspace", () => {
    const { container } = render(
      <SkillDetailPage
        activeTab="code"
        metadata={<div>Skill identity</div>}
        code={<div>Skill source workspace</div>}
        settings={<div>Skill access settings</div>}
        sidebar={<div>Skill properties</div>}
      />,
    );

    expect(
      container.querySelectorAll("[data-resource-detail-page='true']"),
    ).toHaveLength(1);
    expect(screen.getByText("Skill identity")).not.toBeNull();
    expect(
      container.querySelectorAll("[data-platform-detail-tab-bar='true']"),
    ).toHaveLength(0);
    expect(
      container
        .querySelector(".skill-detail-page")
        ?.classList.contains("is-sidebar-auto-collapsed"),
    ).toBe(true);
    expect(screen.getByText("Skill source workspace")).not.toBeNull();
    expect(screen.queryByText("Skill access settings")).toBeNull();
  });

  it("renders access settings with the shared properties sidebar", () => {
    const { container } = render(
      <SkillDetailPage
        activeTab="settings"
        code={<div>Skill source workspace</div>}
        settings={<div>Skill access settings</div>}
        sidebar={<div>Skill properties</div>}
      />,
    );

    expect(screen.getByText("Skill access settings")).not.toBeNull();
    expect(screen.getByText("Skill properties")).not.toBeNull();
    expect(screen.queryByText("Skill source workspace")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      container
        .querySelector(".skill-detail-page")
        ?.classList.contains("is-settings-tab"),
    ).toBe(true);
    expect(
      container
        .querySelector(".skill-detail-page")
        ?.classList.contains("is-sidebar-collapsed"),
    ).toBe(false);
  });
});
