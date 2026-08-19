// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProjectDetailPage } from "./project-detail-page.js";

afterEach(cleanup);

describe("ProjectDetailPage", () => {
  it("composes a tabless shared detail shell with the project header in the main column", () => {
    const { container } = render(
      <ProjectDetailPage
        header={<h1>Launch Project</h1>}
        sidebar={<div>Project properties</div>}
        activeTab="general"
      >
        <div>Project analytics</div>
      </ProjectDetailPage>,
    );

    expect(container.querySelectorAll("[data-resource-detail-page='true']")).toHaveLength(1);
    expect(container.querySelector("[data-platform-detail-tab-bar='true']")).toBeNull();
    expect(container.querySelectorAll("[data-platform-detail-sidebar='true']")).toHaveLength(1);
    expect(container.querySelector(".resource-detail-page")?.classList.contains("is-tabless")).toBe(true);
    expect(container.querySelector(".resource-detail-page")?.classList.contains("is-headerless")).toBe(true);
    const mainContent = container.querySelector(".resource-detail-page__content");
    expect(mainContent?.firstElementChild?.classList.contains("playground-project-detail-header")).toBe(true);
    expect(screen.getByRole("heading", { name: "Launch Project" })).not.toBeNull();
    expect(screen.getByText("Project properties")).not.toBeNull();
  });

  it("keeps non-home project sections headerless without rendering a tab bar", () => {
    const { container } = render(
      <ProjectDetailPage
        sidebar={<div>Project properties</div>}
        activeTab="permissions"
      >
        <div>Project settings</div>
      </ProjectDetailPage>,
    );

    expect(container.querySelector("[data-platform-detail-tab-bar='true']")).toBeNull();
    expect(container.querySelector(".playground-project-detail-header")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Launch Project" })).toBeNull();
    expect(
      container.querySelector(".resource-detail-page__content")?.classList.contains("is-permissions-tab"),
    ).toBe(true);
  });

  it("removes the details sidebar from the resources tab", () => {
    const { container } = render(
      <ProjectDetailPage
        sidebar={<div>Project properties</div>}
        activeTab="resources"
      >
        <div>Project resources</div>
      </ProjectDetailPage>,
    );

    expect(container.querySelector("[data-platform-detail-sidebar='true']")).toBeNull();
    expect(container.querySelector(".resource-detail-page")?.classList.contains("is-sidebar-empty")).toBe(true);
    expect(screen.getByText("Project resources")).not.toBeNull();
  });
});
