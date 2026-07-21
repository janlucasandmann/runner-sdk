// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FineTuningDetailPage } from "./fine-tuning-detail-page.js";

describe("FineTuningDetailPage", () => {
  afterEach(cleanup);

  it("composes fine-tuning content and sidebar cards through ResourceDetailPage", () => {
    render(
      <FineTuningDetailPage
        header={<div>Improve support agent</div>}
        headerActions={<div>Completed</div>}
        properties={<div>Support Agent</div>}
        actions={<button type="button">Open thread</button>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        activeTab="general"
        onTabChange={vi.fn()}
      >
        <div>Fine-tuning analytics</div>
      </FineTuningDetailPage>,
    );

    const page = screen.getByRole("region", { name: "Fine-tuning details" });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(screen.getByText("Improve support agent")).toBeTruthy();
    expect(screen.getByText("Fine-tuning analytics")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Properties" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Actions" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "General" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Analysis" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Agent Changes" })).toBeTruthy();
  });
});
