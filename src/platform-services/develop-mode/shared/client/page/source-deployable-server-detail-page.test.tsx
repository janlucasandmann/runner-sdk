// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SourceDeployableServerDetailPage } from "./source-deployable-server-detail-page.js";

afterEach(cleanup);

const contentByTab = {
  usage: <div>Usage activity</div>,
  code: <div>Source code</div>,
  settings: <div>Deployment settings</div>,
} as const;

describe("SourceDeployableServerDetailPage", () => {
  it.each([
    ["function", "is-function-server-detail"],
    ["web-app", "is-web-app-server-detail"],
  ] as const)("uses one detail composition for %s resources", (resourceKind, expectedClassName) => {
    const { container } = render(
      <SourceDeployableServerDetailPage
        resourceKind={resourceKind}
        activeTab="usage"
        contentByTab={contentByTab}
        sidebar={<div>Resource owner</div>}
      />,
    );

    expect(screen.getByText("Usage activity")).not.toBeNull();
    expect(container.querySelector(`.${expectedClassName}.is-source-server-usage-tab`)).not.toBeNull();
    expect(screen.queryByRole("navigation", { name: "Resource sections" })).toBeNull();
  });

  it("uses the bounded full-screen code composition for both resource kinds", () => {
    const { container } = render(
      <SourceDeployableServerDetailPage
        resourceKind="web-app"
        activeTab="code"
        contentByTab={contentByTab}
        sidebar={<div>Resource owner</div>}
      />,
    );

    expect(screen.getByText("Source code")).not.toBeNull();
    expect(container.querySelector(".is-source-server-code-tab.is-code-tab")).not.toBeNull();
    expect(screen.getByRole("complementary", { hidden: true }).getAttribute("data-collapsed")).toBe("true");
  });

  it("allows version comparison content to replace the active tab", () => {
    render(
      <SourceDeployableServerDetailPage
        resourceKind="function"
        activeTab="settings"
        contentByTab={contentByTab}
        overrideContent={<div>Version changes</div>}
      />,
    );

    expect(screen.getByText("Version changes")).not.toBeNull();
    expect(screen.queryByText("Deployment settings")).toBeNull();
  });
});
