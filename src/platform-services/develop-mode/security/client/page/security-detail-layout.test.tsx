// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SecurityDetailLoadingState,
  SecurityDetailPageFrame,
  SecurityResourceDetailPage,
} from "./security-detail-layout.js";

afterEach(cleanup);

describe("Security detail layout", () => {
  it("uses the same viewport and centered content frame as Agent Runtime details", () => {
    const { container } = render(
      <SecurityDetailPageFrame>
        <div>Repository detail</div>
      </SecurityDetailPageFrame>,
    );

    const frame = container.querySelector(
      "[data-security-detail-page-frame='true']",
    );
    expect(frame).not.toBeNull();
    expect(
      frame?.classList.contains("playground-agents-detail-assistant-page"),
    ).toBe(true);
    expect(
      frame?.querySelector(
        ".playground-agents-detail-main-pane > .playground-environments-detail-scroll.playground-settings-detail-scroll",
      ),
    ).not.toBeNull();
    expect(
      frame?.querySelector(
        ".playground-managed-data-detail-main.playground-security-agent-detail-main .playground-agents-detail-content.is-agent-overview-general.develop-security-detail-page-frame__content",
      ),
    ).not.toBeNull();
  });

  it("centers the centralized loading indicator inside the detail content frame", () => {
    const { container } = render(
      <SecurityDetailLoadingState message="Loading security agent…" />,
    );

    const loadingState = screen.getByRole("status", {
      name: "Loading security agent…",
    });
    expect(loadingState.classList.contains("platform-loading-state")).toBe(
      true,
    );
    expect(loadingState.classList.contains("is-centered")).toBe(true);
    expect(
      loadingState.classList.contains("develop-security-detail-loading-state"),
    ).toBe(true);
    expect(
      container
        .querySelector(".develop-security-detail-page-frame__content")
        ?.contains(loadingState),
    ).toBe(true);
  });

  it("uses the shared develop-resource detail grid, tabs, content, and sidebar", () => {
    const { container } = render(
      <SecurityResourceDetailPage
        header={<h1>acme/api</h1>}
        tabs={[{ id: "overview", label: "Overview" }] as const}
        activeTab="overview"
        onTabChange={vi.fn()}
        sidebar={<div>Repository properties</div>}
      >
        <div>Security posture</div>
      </SecurityResourceDetailPage>,
    );

    const page = container.querySelector("[data-resource-detail-page='true']");
    expect(page?.classList.contains("playground-server-detail-page")).toBe(
      true,
    );
    expect(page?.classList.contains("is-security-agent-server-detail")).toBe(
      true,
    );
    expect(
      container.querySelector(
        ".platform-detail-tab-bar.playground-agents-overview-tabs.playground-agents-detail-tabs.playground-server-detail-tabs.develop-security-detail-tabs",
      ),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".resource-detail-page__content.playground-server-detail-page__content.playground-server-detail-content.playground-security-agent-detail-content",
      ),
    ).not.toBeNull();
    const sidebar = screen.getByRole("complementary", {
      name: "Develop resource properties",
    });
    expect(
      sidebar.classList.contains("playground-project-overview-sidebar"),
    ).toBe(true);
    expect(sidebar.classList.contains("playground-agents-detail-sidebar")).toBe(
      true,
    );
    expect(sidebar.classList.contains("playground-server-detail-sidebar")).toBe(
      true,
    );
    expect(
      sidebar.classList.contains("playground-security-agent-detail-sidebar"),
    ).toBe(true);
  });

  it("renders content first when the app header owns the section switch", () => {
    const { container } = render(
      <SecurityResourceDetailPage
        tabs={[]}
        activeTab="runs"
        onTabChange={vi.fn()}
        sidebar={<div>Repository details</div>}
      >
        <div>Runs</div>
      </SecurityResourceDetailPage>,
    );

    const page = container.querySelector("[data-resource-detail-page='true']");
    const children = Array.from(page?.children || []);
    expect(container.querySelector(".resource-detail-page__header")).toBeNull();
    expect(container.querySelector(".platform-detail-tab-bar")).toBeNull();
    expect(
      children[0]?.classList.contains("resource-detail-page__content"),
    ).toBe(true);
  });
});
