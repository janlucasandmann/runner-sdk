// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GuardrailDetailPage } from "./guardrail-detail-page.js";

describe("GuardrailDetailPage", () => {
  afterEach(() => cleanup());

  const settings = {
    identity: {
      icon: <span>G</span>,
      title: "Operational Safety",
      description: "Guardrail description",
      readOnly: true,
    },
    details: {
      variant: "standard" as const,
      customAttributes: [{ id: "prompts", label: "Prompts", value: "Custom set · 3 prompts" }],
      updatedAt: "2026-08-30T10:00:00.000Z",
      creator: { value: "creator", name: "Creator" },
      owner: { value: "owner", name: "Owner" },
      scope: {},
      primaryActions: [{ id: "evaluate", label: "Run Evaluation", onSelect: () => undefined }] as const,
    },
    access: <div>Access settings</div>,
    detailsSidebarClassName: "guardrail-detail-page__sidebar playground-agents-detail-sidebar",
  };

  it("uses the file-resource detail shell for the General workspace", () => {
    render(
      <GuardrailDetailPage
        activeTab="general"
        metadata={<div>Operational Safety</div>}
        general={<div>Prompt workspace</div>}
        evaluation={<div>Evaluation results</div>}
        settings={settings}
        sidebar={<div>Custom set · 3 prompts</div>}
      />,
    );

    const page = screen.getByRole("region", { name: "Guardrail details" });
    expect(page.getAttribute("data-resource-detail-page")).toBe("true");
    expect(screen.getByText("Operational Safety")).toBeTruthy();
    expect(screen.getByText("Prompt workspace")).toBeTruthy();
    expect(screen.queryByText("Evaluation results")).toBeNull();
    expect(screen.queryByText("Access settings")).toBeNull();
    expect(screen.getByText("Custom set · 3 prompts")).toBeTruthy();
    expect(page.classList.contains("is-general-tab")).toBe(true);
    expect(page.classList.contains("is-code-tab")).toBe(true);
    expect(page.classList.contains("is-sidebar-auto-collapsed")).toBe(true);
  });

  it("renders Settings with the shared resource sidebar", () => {
    const { container } = render(
      <GuardrailDetailPage
        activeTab="settings"
        metadata={<div>Operational Safety</div>}
        general={<div>Prompt workspace</div>}
        evaluation={<div>Evaluation results</div>}
        settings={settings}
        sidebar={<div>Custom set · 3 prompts</div>}
      />,
    );

    expect(screen.getByText("Access settings")).toBeTruthy();
    expect(screen.getByText("Custom set · 3 prompts")).toBeTruthy();
    expect(screen.getByDisplayValue("Operational Safety")).toBeTruthy();
    expect(screen.queryByText("Prompt workspace")).toBeNull();
    const page = container.querySelector(".guardrail-detail-page");
    const frame = container.querySelector(".guardrail-detail-page__frame");
    const sidebar = container.querySelector(".guardrail-detail-page__sidebar");
    expect(frame?.getAttribute("data-platform-service-detail-frame")).toBe("true");
    expect(frame?.contains(page)).toBe(true);
    expect(page?.getAttribute("data-platform-resource-settings-page")).toBe("true");
    expect(
      container.querySelector(".platform-resource-settings-page__main"),
    ).not.toBeNull();
    expect(sidebar?.classList.contains("playground-agents-detail-sidebar")).toBe(true);
    expect(page?.contains(sidebar)).toBe(true);
  });

  it("renders Evaluation in the shared settings content frame without the settings sidebar", () => {
    const { container } = render(
      <GuardrailDetailPage
        activeTab="evaluation"
        evaluationScopeKey="guardrail-1"
        metadata={<div>Operational Safety</div>}
        general={<div>Prompt workspace</div>}
        evaluation={<div>Evaluation results</div>}
        settings={settings}
        sidebar={<div>Custom set · 3 prompts</div>}
      />,
    );

    const page = screen.getByRole("region", { name: "Guardrail details" });
    const frame = container.querySelector(".guardrail-detail-page__frame");
    expect(screen.getByText("Evaluation results")).toBeTruthy();
    expect(screen.queryByText("Operational Safety")).toBeNull();
    expect(screen.queryByText("Prompt workspace")).toBeNull();
    expect(screen.queryByText("Access settings")).toBeNull();
    expect(screen.queryByText("Custom set · 3 prompts")).toBeNull();
    expect(page.classList.contains("is-evaluation-tab")).toBe(true);
    expect(page.classList.contains("is-settings-tab")).toBe(true);
    expect(page.classList.contains("playground-agents-detail-overview-layout")).toBe(true);
    expect(frame?.getAttribute("data-platform-service-detail-frame")).toBe("true");
    expect(frame?.contains(page)).toBe(true);
  });
});
