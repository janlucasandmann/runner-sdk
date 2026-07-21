// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EvaluationDetailPage } from "./evaluation-detail-page.js";

describe("EvaluationDetailPage", () => {
  afterEach(cleanup);

  it("composes evaluation content and sidebar cards through ResourceDetailPage", () => {
    render(
      <EvaluationDetailPage
        header={<div>Support quality</div>}
        headerActions={<div>80% pass threshold</div>}
        properties={<div>12 cases</div>}
        actions={<button type="button">Run evaluation</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        activeTab="general"
        onTabChange={vi.fn()}
      >
        <div>Evaluation analytics</div>
      </EvaluationDetailPage>,
    );

    const page = screen.getByRole("region", { name: "Evaluation details" });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(screen.getByText("Support quality")).toBeTruthy();
    expect(screen.getByText("Evaluation analytics")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Properties" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Actions" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "General" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Settings" })).toBeTruthy();
  });
});
