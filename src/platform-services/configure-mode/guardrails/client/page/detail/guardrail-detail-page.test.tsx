// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuardrailDetailPage } from "./guardrail-detail-page.js";

describe("GuardrailDetailPage", () => {
  afterEach(() => cleanup());

  it("composes guardrail content and sidebar cards through ResourceDetailPage", () => {
    render(
      <GuardrailDetailPage
        header={<div>Operational Safety</div>}
        headerActions={<button type="button">Publish</button>}
        actions={<button type="button">Version history</button>}
        properties={<div>Custom set · 3 prompts</div>}
        sidebarToggle={<button type="button">Toggle sidebar</button>}
        activeTab="general"
        onTabChange={vi.fn()}
      >
        <div>Description editor</div>
      </GuardrailDetailPage>,
    );

    const page = screen.getByRole("region", { name: "Guardrail details" });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(screen.getByText("Operational Safety")).toBeTruthy();
    expect(screen.getByText("Description editor")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Actions" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Properties" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "About" })).toBeNull();
    expect(screen.getByRole("tab", { name: "General" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Evaluation" })).toBeTruthy();
    expect(screen.getByRole("tab", { name: "Settings" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Toggle sidebar" })).toBeTruthy();
  });
});
