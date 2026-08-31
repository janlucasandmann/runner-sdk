// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestsApi } from "../api/index.js";
import type { TestCaseDefinition, TestPlan } from "../domain/index.js";
import { TestCaseDetailPage } from "./test-case-detail-page.js";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

const testCase: TestCaseDefinition = {
  id: "case-readiness",
  name: "Readiness contract",
  description: "Verifies the service readiness endpoint.",
  kind: "contract",
  command: "curl -fsS http://localhost:8080/ready",
  workingDirectory: "",
  timeoutMs: 30_000,
  retries: 1,
  env: { NODE_ENV: "test" },
  secretRefs: [],
  request: {
    target: "control_plane_readiness",
    requireDatabase: false,
    requireAgentRuntime: true,
  },
  assertions: [{ path: "status", equals: "ready" }],
  agentId: "",
  enabled: true,
  tags: ["readiness"],
};

const plan: TestPlan = {
  id: "plan-1",
  projectId: "project-1",
  name: "Release readiness",
  description: "Release verification",
  targetType: "project",
  targetId: "project-1",
  defaultEnvironmentId: "environment-1",
  definition: {
    schemaVersion: "1",
    cases: [testCase],
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
  caseCount: 1,
  planFingerprint: "fingerprint",
  publishedVersionId: null,
  metadata: null,
  createdAt: "2026-07-30T08:00:00.000Z",
  updatedAt: "2026-07-30T08:00:00.000Z",
};

describe("TestCaseDetailPage", () => {
  it("keeps Function, Method, and Path in one request row", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="test-case-actions"></div><div id="test-case-sections"></div>',
    );
    const functionCase: TestCaseDefinition = {
      ...testCase,
      id: "case-function",
      name: "Function contract",
      request: {
        target: "computer_agents_function",
        functionId: "function-1",
        method: "POST",
        path: "/health",
        body: null,
      },
    };

    const { container } = render(
      <TestCaseDetailPage
        plan={plan}
        testCase={functionCase}
        api={{ updatePlan: vi.fn() } as unknown as TestsApi}
        controlsPortalId="test-case-actions"
        sectionControlsPortalId="test-case-sections"
        onPlanChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    const requestRow = container.querySelector(
      ".tests-case-builder__form-grid.is-function-request",
    );
    expect(requestRow).not.toBeNull();
    expect(requestRow?.children[0]?.textContent).toContain("Function");
    expect(requestRow?.children[1]?.textContent).toContain("Method");
    expect(requestRow?.children[2]?.textContent).toContain("Path");
    expect(
      screen.queryByText("JSON passed to the selected Function. Use null when no body is required."),
    ).toBeNull();
    expect(
      container.querySelector(".tests-case-builder__request-body-field"),
    ).not.toBeNull();
    expect(
      container.querySelector(
        ".tests-case-builder__request-body-field .platform-instructions-editor__header",
      )?.textContent,
    ).toBe("JSON");
  });

  it("keeps the structured General view and the multi-file Code view synchronized", () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="test-case-actions"></div><div id="test-case-sections"></div>',
    );

    const { container } = render(
      <TestCaseDetailPage
        plan={plan}
        testCase={testCase}
        api={{ updatePlan: vi.fn() } as unknown as TestsApi}
        controlsPortalId="test-case-actions"
        sectionControlsPortalId="test-case-sections"
        onPlanChange={vi.fn()}
        onDeleted={vi.fn()}
      />,
    );

    expect(container.querySelector(".file-resource-detail-page")).not.toBeNull();
    expect(container.querySelector(".tests-case-detail-page")).not.toBeNull();
    expect(container.querySelector(".platform-detail-sidebar")).toBeNull();
    expect(container.querySelector(".tests-case-detail-general__content")).not.toBeNull();
    expect(
      (screen.getByLabelText("Scenario name") as HTMLInputElement).value,
    ).toBe("Readiness contract");
    expect(screen.queryByText("What are you testing?")).toBeNull();
    expect(screen.getByRole("button", { name: "Test type" })).not.toBeNull();
    expect(screen.getByText("Platform readiness")).not.toBeNull();
    expect(screen.getByText("Readiness requirements")).not.toBeNull();
    expect(screen.getByLabelText("Require database readiness")).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Evidence" })).not.toBeNull();
    for (const label of ["Logs", "Screenshots", "Traces", "Artifacts"]) {
      const evidenceToggle = screen.getByRole("switch", {
        name: `${label} evidence retention`,
      }) as HTMLButtonElement;
      expect(evidenceToggle.disabled).toBe(true);
      expect(evidenceToggle.getAttribute("aria-checked")).toBe("true");
    }
    expect(screen.queryByText("Retained")).toBeNull();
    expect(screen.queryByText("Not retained")).toBeNull();
    expect(screen.queryByText("Advanced definition")).toBeNull();
    expect(screen.queryByText(/Secret redaction is/)).toBeNull();
    expect(container.querySelector(".platform-settings-section__icon")).toBeNull();
    expect(screen.getByText("Scenario Settings")).not.toBeNull();
    expect(screen.getByText("Environment variables")).not.toBeNull();
    expect(screen.getByText("Secret references")).not.toBeNull();
    expect(screen.getAllByText("Category").length).toBeGreaterThan(0);
    expect(container.querySelector(".platform-code-editor-workspace")).toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "Test scenario section" }),
    ).not.toBeNull();
    expect(
      (screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      screen.getByRole("button", { name: "Save Changes" }).querySelector(".hugeicons-bookmark"),
    ).not.toBeNull();

    fireEvent.click(screen.getByLabelText("Require database readiness"));
    expect(
      (screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled,
    ).toBe(false);

    fireEvent.click(screen.getByRole("radio", { name: "Code" }));

    expect(container.querySelector(".platform-code-editor-workspace")).not.toBeNull();
    expect((screen.getByLabelText("Scenario name") as HTMLInputElement).value).toBe(
      "Readiness contract",
    );
    expect(
      (screen.getByLabelText("Scenario description") as HTMLInputElement).value,
    ).toBe("Verifies the service readiness endpoint.");
    expect(screen.getByRole("button", { name: "Scenario metadata" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Execution configuration" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Target request" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Assertions" })).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "Environment and secret references" }),
    ).not.toBeNull();
    expect(screen.queryByText("What are you testing?")).toBeNull();
    expect(screen.queryByText("Scenario Settings")).toBeNull();
  });
});
