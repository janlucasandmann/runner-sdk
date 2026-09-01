// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { TestsApi } from "../api/index.js";
import type { TestPlan } from "../domain/index.js";
import { TestPlanDetailPage } from "./test-plan-detail-page.js";

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
    schemaVersion: "1",
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
  versions: [{
    id: "version-1",
    testPlanId: "plan-1",
    version: 1,
    label: "v1",
    description: "Initial version",
    status: "published",
    snapshot: {},
    metadata: null,
    publishedAt: "2026-08-04T08:00:00.000Z",
    createdAt: "2026-08-04T08:00:00.000Z",
    updatedAt: "2026-08-04T08:00:00.000Z",
  }],
};

function findProperty(container: HTMLElement, label: string): HTMLElement | undefined {
  return Array.from(
    container.querySelectorAll<HTMLElement>(".platform-service-detail-page__property"),
  ).find((row) => (
    row.querySelector(".platform-service-detail-page__property-label")?.textContent === label
  ));
}

describe("TestPlanDetailPage", () => {
  it("shows the intended resource properties and hands the sidebar to version history", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<span id="test-title-actions"></span>'
        + '<span id="test-section-controls"></span>'
        + '<aside id="test-version-drawer"></aside>',
    );
    const projectName = "A human-readable project name that is intentionally very long";
    const environmentName = "A human-readable environment name that is intentionally very long";
    const onVersionsSidebarOpenChange = vi.fn();
    const onNavigationGuardChange = vi.fn();
    const onOpenRawConfiguration = vi.fn();
    const { container } = render(
      <TestPlanDetailPage
        plan={plan}
        api={{} as TestsApi}
        projects={[{ id: "project-1", name: projectName }]}
        environments={[{ id: "environment-1", name: environmentName }]}
        titleActionsPortalId="test-title-actions"
        sectionControlsPortalId="test-section-controls"
        versionsDrawerPortalId="test-version-drawer"
        onVersionsSidebarOpenChange={onVersionsSidebarOpenChange}
        onNavigationGuardChange={onNavigationGuardChange}
        onPlanChange={vi.fn()}
        onDeleted={vi.fn()}
        onReload={vi.fn().mockResolvedValue(undefined)}
        onRun={vi.fn()}
        onOpenRawConfiguration={onOpenRawConfiguration}
        onOpenRun={vi.fn()}
        onOpenCase={vi.fn()}
      />,
    );

    const projectProperty = findProperty(container, "Project");
    const computerProperty = findProperty(container, "Computer");

    expect(projectProperty).toBeDefined();
    expect(computerProperty).toBeDefined();
    expect(findProperty(container, "Environment")).toBeUndefined();
    expect(projectProperty?.textContent).toContain(projectName);
    expect(projectProperty?.textContent).not.toContain("project-1");
    expect(computerProperty?.textContent).toContain(environmentName);
    expect(
      projectProperty?.querySelector(".playground-project-overview-sidebar-selector"),
    ).not.toBeNull();
    expect(
      computerProperty?.querySelector(".playground-project-overview-sidebar-selector"),
    ).not.toBeNull();
    expect(projectProperty?.querySelector('button[aria-label="Test project"]')).not.toBeNull();
    expect(computerProperty?.querySelector('button[aria-label="Test computer"]')).not.toBeNull();
    expect(
      projectProperty?.querySelector(".platform-service-detail-page__property-value")
        ?.getAttribute("title"),
    ).toBe(projectName);
    expect(
      computerProperty?.querySelector(".platform-service-detail-page__property-value")
        ?.getAttribute("title"),
    ).toBe(environmentName);
    expect(findProperty(container, "Published")).toBeUndefined();
    expect(findProperty(container, "Cases")).toBeUndefined();
    const sectionSwitch = await screen.findByRole("radiogroup", { name: "Test plan section" });
    expect(within(sectionSwitch).queryByRole("radio", { name: "Runs" })).toBeNull();

    const detailsSidebar = container.querySelector<HTMLElement>(
      '[data-platform-detail-sidebar="true"]',
    );
    expect(detailsSidebar?.dataset.collapsed).toBe("true");
    expect(container.querySelector(".tests-detail-page")?.classList).toContain(
      "is-cases-tab",
    );
    expect(screen.getByRole("complementary", { name: "Test scenarios" })).not.toBeNull();
    expect(screen.getAllByRole("button", { name: /Add scenario/i }).length).toBeGreaterThan(0);

    fireEvent.click(within(sectionSwitch).getByRole("radio", { name: "Settings" }));
    expect(container.querySelector(".tests-detail-page")?.classList).not.toContain(
      "is-overview-tab",
    );
    expect(container.querySelector(".tests-detail-page")?.classList).toContain(
      "is-settings-tab",
    );
    expect(screen.queryByRole("heading", { name: "How this test works" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Test details" })).toBeNull();
    expect(screen.getByRole("region", { name: "Test settings" })).not.toBeNull();
    expect(
      container.querySelector("[data-platform-resource-settings-page='true']"),
    ).not.toBeNull();
    expect(
      (screen.getByRole("textbox", { name: "Test name" }) as HTMLTextAreaElement).value,
    ).toBe(plan.name);
    expect(
      (screen.getByRole("textbox", { name: "Test description" }) as HTMLTextAreaElement).value,
    ).toBe(plan.description);
    const settingsDetailsSidebar = screen.getByRole("complementary", {
      name: "Test plan information",
    });
    expect(settingsDetailsSidebar.dataset.collapsed).toBe("false");
    expect(within(settingsDetailsSidebar).getByText("Scope")).not.toBeNull();
    expect(within(settingsDetailsSidebar).getByText("Computer")).not.toBeNull();
    expect(screen.queryByText("Status")).toBeNull();
    expect(screen.queryByRole("heading", { name: "Run target" })).toBeNull();
    expect(screen.getByRole("heading", { name: "Run behavior" })).not.toBeNull();
    expect(screen.queryByText("Before the first case (optional)")).toBeNull();
    expect(screen.queryByText("After the final case (optional)")).toBeNull();
    expect(screen.queryByPlaceholderText("Setup command")).toBeNull();
    expect(screen.queryByPlaceholderText("Cleanup command")).toBeNull();
    expect(screen.queryByText("Wait before retrying")).toBeNull();
    const runBehaviorSection = screen.getByRole("heading", { name: "Run behavior" }).closest("section");
    expect(runBehaviorSection?.querySelectorAll(".platform-service-detail-page__property")).toHaveLength(3);
    expect(within(runBehaviorSection as HTMLElement).getByRole("switch", {
      name: "Stop after the first failed scenario",
    })).not.toBeNull();
    const evidenceSection = screen.getByRole("heading", { name: "Evidence to keep" }).closest("section");
    expect(evidenceSection?.querySelectorAll(".platform-service-detail-page__property")).toHaveLength(5);
    expect(within(evidenceSection as HTMLElement).getAllByRole("switch")).toHaveLength(5);
    expect(screen.queryByRole("heading", { name: "Advanced configuration" })).toBeNull();
    expect(screen.queryByText("Edit the underlying JSON only when the form above does not expose a required option. Invalid JSON cannot be saved.")).toBeNull();
    expect(screen.queryByText("Open raw test configuration")).toBeNull();
    expect(screen.queryByRole("textbox", { name: "Strict test-plan definition JSON" })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Version history" })).toBeNull();
    expect(screen.queryByText("Save Version")).toBeNull();

    const descriptionInput = screen.getByRole("textbox", { name: "Test description" });
    fireEvent.change(descriptionInput, { target: { value: "Changed locally" } });
    await waitFor(() => {
      expect(onNavigationGuardChange).toHaveBeenCalledWith(expect.objectContaining({
        id: "test-plan-1-unsaved-version-changes",
        title: "Leave without saving?",
      }));
    });
    expect(screen.queryByText("Runs continue to use the published immutable version")).toBeNull();
    const activeGuard = onNavigationGuardChange.mock.calls
      .map(([guard]) => guard)
      .filter((guard) => Boolean(guard))
      .at(-1);
    act(() => activeGuard?.onDiscard());
    expect((descriptionInput as HTMLTextAreaElement).value).toBe(plan.description);

    fireEvent.click(within(sectionSwitch).getByRole("radio", { name: "Overview" }));
    expect(container.querySelector(".tests-detail-page")?.classList).toContain(
      "is-overview-tab",
    );
    const overviewIdentity = container.querySelector(".tests-overview-identity");
    expect(overviewIdentity).not.toBeNull();
    expect(
      (within(overviewIdentity as HTMLElement).getByRole("textbox", {
        name: "Test name",
      }) as HTMLTextAreaElement).readOnly,
    ).toBe(true);
    expect(
      (within(overviewIdentity as HTMLElement).getByRole("textbox", {
        name: "Test description",
      }) as HTMLTextAreaElement).value,
    ).toBe(plan.description);
    const overviewDetailsSidebar = container.querySelector<HTMLElement>(
      "[data-platform-detail-sidebar='true']",
    );
    expect(overviewDetailsSidebar?.dataset.collapsed).toBe("false");
    expect(screen.getByRole("table", { name: "Test runs" })).not.toBeNull();
    expect(screen.getByText("Run History")).not.toBeNull();
    expect(container.querySelector(".tests-plan-overview-card")).toBeNull();

    expect(screen.getByRole("button", { name: "Open test version history" })).not.toBeNull();
    expect(screen.getByText("v1")).not.toBeNull();
    expect(screen.getByText("Latest")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    const actionsMenu = screen.getByRole("menu", { name: "Test actions" });
    expect(actionsMenu.getAttribute("data-platform-popup-placement")).toBe("bottom-start");
    expect(actionsMenu.getAttribute("data-platform-popup-portaled")).toBe("true");
    expect((actionsMenu as HTMLElement).style.width).toBe("240px");
    expect(screen.queryByText("plan-1")).toBeNull();
    const informationAction = screen.getByRole("menuitem", { name: "Information" });
    expect(screen.getByRole("menuitem", { name: "Show version history" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Share" })).not.toBeNull();
    expect(screen.queryByRole("menuitem", { name: "Copy Test ID" })).toBeNull();
    expect(screen.getByRole("menuitem", { name: "Rename" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Delete" })).not.toBeNull();

    fireEvent.pointerEnter(informationAction);
    const informationPopup = screen.getByRole("dialog", { name: "Test information" });
    expect(informationPopup.getAttribute("data-platform-popup-placement")).toBe("right-start");
    expect(screen.getByText("plan-1")).not.toBeNull();

    fireEvent.click(screen.getByRole("menuitem", { name: "Share" }));
    expect(screen.getByRole("dialog", { name: "Share test with teams" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Show version history" }));
    expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(true);
    expect(await screen.findByRole("heading", { name: "Version history" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "View Changes" })).not.toBeNull();
    expect(overviewDetailsSidebar?.dataset.collapsed).toBe("true");
    expect(screen.queryByRole("radiogroup", { name: "Test plan section" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close version history" }));
    expect(overviewDetailsSidebar?.dataset.collapsed).toBe("false");
    expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("radiogroup", { name: "Test plan section" })).not.toBeNull();

    expect(
      container.querySelector(".tests-detail-run-button .platform-button-selector__action svg"),
    ).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Run test options" }));
    const runOptions = screen.getByRole("menu", { name: "Run test options" });
    expect(runOptions.getAttribute("data-platform-popup-variant")).toBe("minimal");
    fireEvent.click(within(runOptions).getByRole("menuitem", { name: "Raw Configuration" }));
    expect(onOpenRawConfiguration).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(document, {
      key: "ß",
      code: "KeyS",
      metaKey: true,
      altKey: true,
    });
    expect(screen.getByRole("dialog", { name: "Share test with teams" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    fireEvent.keyDown(document, {
      key: "®",
      code: "KeyR",
      metaKey: true,
      altKey: true,
    });
    const renameDialog = screen.getByRole("dialog", { name: "Rename test" });
    expect(renameDialog).not.toBeNull();
    fireEvent.click(within(renameDialog).getByRole("button", { name: "Cancel" }));

    fireEvent.keyDown(document, {
      key: "Backspace",
      code: "Backspace",
      metaKey: true,
      altKey: true,
    });
    expect(screen.getByRole("alertdialog", { name: "Delete Test?" })).not.toBeNull();
  });

  it("persists multiple team resource shares from one shared actions modal submission", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<span id="test-share-title-actions"></span>',
    );
    const addTeamShare = vi.fn().mockImplementation(async (teamId: string) => ({
      id: teamId === "team-1" ? "share-1" : "share-2",
    }));
    const updatePlan = vi.fn().mockResolvedValue({
      ...plan,
      metadata: {
        sharedTeamIds: ["team-1", "team-2"],
        teamAccessShareIds: { "team-1": "share-1", "team-2": "share-2" },
      },
    });
    const onPlanChange = vi.fn();
    const onWorkspaceTeamsRequest = vi.fn();

    render(
      <TestPlanDetailPage
        plan={plan}
        api={{ addTeamShare, updatePlan } as unknown as TestsApi}
        projects={[]}
        environments={[]}
        workspaceTeams={[
          { id: "team-1", name: "Platform" },
          { id: "team-2", name: "Security" },
        ]}
        onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
        titleActionsPortalId="test-share-title-actions"
        onPlanChange={onPlanChange}
        onDeleted={vi.fn()}
        onReload={vi.fn().mockResolvedValue(undefined)}
        onRun={vi.fn()}
        onOpenRun={vi.fn()}
        onOpenCase={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Share" }));
    expect(onWorkspaceTeamsRequest).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("checkbox", { name: /Select Platform/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Select Security/ }));
    fireEvent.click(screen.getByRole("button", { name: "Share with 2 Teams" }));

    await waitFor(() => {
      expect(addTeamShare).toHaveBeenCalledWith(
        "team-1",
        "plan-1",
        expect.objectContaining({ permissionSets: expect.any(Object) }),
      );
      expect(addTeamShare).toHaveBeenCalledWith(
        "team-2",
        "plan-1",
        expect.objectContaining({ permissionSets: expect.any(Object) }),
      );
      expect(updatePlan).toHaveBeenCalledWith(
        "plan-1",
        expect.objectContaining({
          metadata: expect.objectContaining({
            sharedTeamIds: ["team-1", "team-2"],
            teamAccessShareIds: { "team-1": "share-1", "team-2": "share-2" },
          }),
        }),
      );
      expect(onPlanChange).toHaveBeenCalled();
    });
  });

  it("loads teams on demand and enables sharing after a team is selected", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<span id="test-delayed-share-title-actions"></span>',
    );
    const onWorkspaceTeamsRequest = vi.fn();
    const sharedProps = {
      plan,
      api: {} as TestsApi,
      projects: [],
      environments: [],
      titleActionsPortalId: "test-delayed-share-title-actions",
      onWorkspaceTeamsRequest,
      onPlanChange: vi.fn(),
      onDeleted: vi.fn(),
      onReload: vi.fn().mockResolvedValue(undefined),
      onRun: vi.fn(),
      onOpenRun: vi.fn(),
      onOpenCase: vi.fn(),
    };
    const { rerender } = render(
      <TestPlanDetailPage
        {...sharedProps}
        workspaceTeams={[]}
        workspaceTeamsLoading
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Share" }));
    expect(onWorkspaceTeamsRequest).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status", { name: "Loading teams…" })).not.toBeNull();

    rerender(
      <TestPlanDetailPage
        {...sharedProps}
        workspaceTeams={[{
          id: "team-1",
          name: "Platform",
          metadata: {
            profile: { photoURL: "/img/team-platform.webp" },
          },
        }]}
        workspaceTeamsLoading={false}
      />,
    );

    const teamCheckbox = await screen.findByRole("checkbox", { name: /Select Platform/ });
    expect(
      teamCheckbox.parentElement?.querySelector('img[src="/img/team-platform.webp"]'),
    ).not.toBeNull();
    expect((screen.getByRole("button", { name: "Share with 0 Teams" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(teamCheckbox);
    expect((screen.getByRole("button", { name: "Share with 1 Team" }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("renames and deletes a test through the resource actions", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<span id="test-mutation-title-actions"></span>',
    );
    const updatePlan = vi.fn().mockResolvedValue({ ...plan, name: "Production readiness" });
    const deletePlan = vi.fn().mockResolvedValue(undefined);
    const onDeleted = vi.fn();

    render(
      <TestPlanDetailPage
        plan={plan}
        api={{ updatePlan, deletePlan } as unknown as TestsApi}
        projects={[]}
        environments={[]}
        titleActionsPortalId="test-mutation-title-actions"
        onPlanChange={vi.fn()}
        onDeleted={onDeleted}
        onReload={vi.fn().mockResolvedValue(undefined)}
        onRun={vi.fn()}
        onOpenRun={vi.fn()}
        onOpenCase={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    fireEvent.change(screen.getByRole("textbox", { name: "New test name" }), {
      target: { value: "Production readiness" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    await waitFor(() => {
      expect(updatePlan).toHaveBeenCalledWith("plan-1", { name: "Production readiness" });
    });
    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Rename test" })).toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    expect(screen.getByRole("alertdialog", { name: "Delete Test?" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Delete Test" }));
    await waitFor(() => {
      expect(deletePlan).toHaveBeenCalledWith("plan-1");
      expect(onDeleted).toHaveBeenCalledWith(plan);
    });
  });
});
