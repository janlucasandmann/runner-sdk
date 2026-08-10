// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestsApi } from "../api/index.js";
import type { TestPlan } from "../domain/index.js";
import { TestPlanRawConfigurationPage } from "./test-plan-raw-configuration-page.js";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    language,
    value,
    onChange,
    options,
  }: {
    language?: string;
    value?: string;
    onChange?: (value: string) => void;
    options?: { ariaLabel?: string };
  }) => (
    <textarea
      data-monaco-editor="true"
      data-monaco-language={language}
      aria-label={options?.ariaLabel}
      value={value}
      onChange={(event) => onChange?.(event.currentTarget.value)}
    />
  ),
}));

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const plan: TestPlan = {
  id: "plan-1",
  projectId: "project-1",
  name: "Release readiness",
  description: "Release verification",
  targetType: "project",
  targetId: "project-1",
  defaultEnvironmentId: "environment-1",
  definition: {
    schemaVersion: "computer_agents_test_plan_v1",
    cases: [],
    concurrency: 1,
    stopOnFailure: false,
    retryPolicy: { maxAttempts: 1 },
    evidencePolicy: {
      retainLogs: true,
      retainScreenshots: true,
      retainTraces: true,
      retainArtifacts: true,
      redactSecrets: true,
    },
  },
  caseCount: 0,
  planFingerprint: "fingerprint",
  publishedVersionId: "version-1",
  metadata: null,
  createdAt: "2026-08-04T08:00:00.000Z",
  updatedAt: "2026-08-04T08:00:00.000Z",
  versions: [],
};

describe("TestPlanRawConfigurationPage", () => {
  it("renders a prompt-style Monaco JSON editor with validation and version guarding", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="test-raw-configuration-actions"></div>',
    );
    const onNavigationGuardChange = vi.fn();
    const { container } = render(
      <TestPlanRawConfigurationPage
        plan={plan}
        api={{} as TestsApi}
        controlsPortalId="test-raw-configuration-actions"
        onNavigationGuardChange={onNavigationGuardChange}
        onPlanChange={vi.fn()}
        onReload={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(container.querySelector(".file-resource-detail-page")).not.toBeNull();
    expect(container.querySelector(".tests-raw-configuration-page")).not.toBeNull();
    expect(screen.getByRole("heading", { name: plan.name })).not.toBeNull();
    expect(screen.getByText(plan.description)).not.toBeNull();
    expect(screen.getByText("test-config.json")).not.toBeNull();

    const editor = await screen.findByLabelText("Raw test configuration JSON");
    expect(editor.getAttribute("data-monaco-editor")).toBe("true");
    expect(editor.getAttribute("data-monaco-language")).toBe("json");
    expect(
      container.querySelector('[data-platform-monaco-code-editor="true"][data-language="json"]'),
    ).not.toBeNull();
    expect((screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled)
      .toBe(true);

    fireEvent.change(editor, { target: { value: '{"cases":' } });
    expect(screen.getByRole("alert").textContent).toContain("JSON");
    expect((screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled)
      .toBe(true);

    fireEvent.change(editor, {
      target: {
        value: JSON.stringify({
          ...plan.definition,
          concurrency: 3,
        }, null, 2),
      },
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect((screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled)
      .toBe(false);
    await waitFor(() => {
      expect(onNavigationGuardChange).toHaveBeenCalledWith(expect.objectContaining({
        id: "test-plan-1-unsaved-version-changes",
        title: "Leave without saving?",
      }));
    });

    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
    expect(screen.getByRole("dialog", { name: "Save test plan" })).not.toBeNull();
  });
});
