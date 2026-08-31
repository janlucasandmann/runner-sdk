// @vitest-environment jsdom

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { SkillDetailPage } from "./skill-detail-page.js";

afterEach(cleanup);

describe("SkillDetailPage", () => {
  const settings = {
    identity: {
      icon: <span>S</span>,
      title: "Skill",
      description: "Skill description",
      readOnly: true,
    },
    details: {
      variant: "standard" as const,
      customAttributes: [{ id: "skill", label: "Skill", value: "Skill properties" }],
      updatedAt: "2026-08-30T10:00:00.000Z",
      creator: { value: "creator", name: "Creator" },
      owner: { value: "owner", name: "Owner" },
      scope: false as const,
      primaryActions: [{ id: "test", label: "Test Skill", onSelect: () => undefined }] as const,
      className: "platform-service-detail-page__sidebar-card",
    },
    access: <div>Skill access settings</div>,
  };

  it("uses the shared detail shell and renders the code workspace", () => {
    const { container } = render(
      <SkillDetailPage
        activeTab="code"
        metadata={<div>Skill identity</div>}
        code={<div>Skill source workspace</div>}
        settings={settings}
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
        settings={settings}
      />,
    );

    expect(screen.getByText("Skill access settings")).not.toBeNull();
    expect(screen.getByText("Skill properties")).not.toBeNull();
    expect(screen.queryByText("Scope")).toBeNull();
    expect(screen.queryByText("Skill source workspace")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      container.querySelectorAll("[data-platform-service-detail-frame='true']"),
    ).toHaveLength(1);
    expect(
      container.querySelector(".platform-service-detail-page__sidebar-card"),
    ).not.toBeNull();
    expect(
      container.querySelector(".platform-service-detail-page__property-list"),
    ).not.toBeNull();
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
