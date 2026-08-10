// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestsApi } from "../api/index.js";
import type { TestCaseDefinition, TestPlan } from "../domain/index.js";
import { TestCaseDetailPage } from "./test-case-detail-page.js";

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
  request: { method: "GET", path: "/ready" },
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
  it("uses Monaco for request JSON inside the centralized case workspace", async () => {
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
    expect(
      (screen.getByLabelText("Case name") as HTMLInputElement).value,
    ).toBe("Readiness contract");
    const requestEditor = await screen.findByLabelText("Test request JSON");
    expect(requestEditor.getAttribute("data-monaco-editor")).toBe("true");
    expect(requestEditor.getAttribute("data-monaco-language")).toBe("json");
    expect(
      container.querySelector('[data-platform-monaco-code-editor="true"][data-language="json"]'),
    ).not.toBeNull();
    expect(screen.queryByRole("tab")).toBeNull();
    expect(
      screen.getByRole("radiogroup", { name: "Test case section" }),
    ).not.toBeNull();
    expect(
      (screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled,
    ).toBe(true);

    fireEvent.change(requestEditor, {
      target: { value: '{"method":"POST","path":"/ready"}' },
    });
    expect(
      (screen.getByRole("button", { name: "Save Changes" }) as HTMLButtonElement).disabled,
    ).toBe(false);

    fireEvent.click(screen.getByRole("radio", { name: "Settings" }));

    expect(screen.getByText("Case Settings")).not.toBeNull();
    expect(screen.getByText("Case ID")).not.toBeNull();
    expect(screen.getByText("Execution method")).not.toBeNull();
    expect(screen.getAllByText("Category").length).toBeGreaterThan(0);
    expect(screen.queryByLabelText("Test request JSON")).toBeNull();
  });
});
