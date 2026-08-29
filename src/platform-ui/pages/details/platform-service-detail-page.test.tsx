// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  PlatformServiceDetailFrame,
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "./platform-service-detail-page.js";

afterEach(cleanup);

describe("PlatformServiceDetailPage", () => {
  it("renders the shared Evaluation-style detail shell", () => {
    const { container } = render(
      <PlatformServiceDetailFrame>
        <PlatformServiceDetailPage
          ariaLabel="Test plan details"
          properties={(
            <PlatformServiceDetailPropertyList>
              <PlatformServiceDetailProperty label="Status">
                Active
              </PlatformServiceDetailProperty>
            </PlatformServiceDetailPropertyList>
          )}
          actions={<button type="button">Run tests</button>}
        >
          <div>Plan analytics</div>
        </PlatformServiceDetailPage>
      </PlatformServiceDetailFrame>,
    );

    const frame = container.querySelector(
      "[data-platform-service-detail-frame='true']",
    );
    const page = screen.getByRole("region", { name: "Test plan details" });

    expect(frame).not.toBeNull();
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(page.classList.contains("is-headerless")).toBe(true);
    expect(page.classList.contains("is-tabless")).toBe(true);
    expect(screen.getByText("Plan analytics")).not.toBeNull();
    expect(screen.getByText("Active")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Actions" })).not.toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("marks unified run details with the shared run variant", () => {
    render(
      <PlatformServiceDetailPage
        variant="run"
        ariaLabel="Assurance run details"
        properties={<div>Passed</div>}
      >
        <div>Run evidence</div>
      </PlatformServiceDetailPage>,
    );

    const page = screen.getByRole("region", {
      name: "Assurance run details",
    });
    expect(page.classList.contains("is-run-detail")).toBe(true);
    expect(screen.queryByRole("tab")).toBeNull();
  });

  it("accepts a centralized sidebar override without nesting the legacy property card", () => {
    const { container } = render(
      <PlatformServiceDetailPage
        ariaLabel="Custom sidebar details"
        sidebarContent={<aside>Centralized details sidebar</aside>}
      >
        <div>Page content</div>
      </PlatformServiceDetailPage>,
    );

    expect(screen.getByText("Centralized details sidebar")).not.toBeNull();
    expect(container.querySelector(".platform-service-detail-page__sidebar-card")).toBeNull();
  });

  it("hosts the canonical resource settings page without the legacy sidebar", () => {
    const { container } = render(
      <PlatformServiceDetailPage
        ariaLabel="Evaluation details"
        properties={<div>Legacy properties</div>}
        settings={{
          ariaLabel: "Evaluation settings",
          identity: {
            icon: <span>E</span>,
            title: "Quality evaluation",
            description: "Measures response quality",
          },
          details: {
            attributes: [{ id: "updated", label: "Updated", value: "Today" }],
          },
          access: <section>Evaluation access</section>,
        }}
      >
        <div>Evaluation analytics</div>
      </PlatformServiceDetailPage>,
    );

    const page = screen.getByRole("region", { name: "Evaluation details" });
    expect(page.classList.contains("has-resource-settings")).toBe(true);
    expect(screen.getByRole("region", { name: "Evaluation settings" })).not.toBeNull();
    expect(screen.queryByText("Legacy properties")).toBeNull();
    expect(screen.queryByText("Evaluation analytics")).toBeNull();
    expect(container.querySelector(".platform-service-detail-page__sidebar-card")).toBeNull();
    expect(screen.getByRole("complementary", { name: "Resource details" })).not.toBeNull();
  });
});
