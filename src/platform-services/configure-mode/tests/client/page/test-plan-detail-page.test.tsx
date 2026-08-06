// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
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
  status: "active",
  targetType: "project",
  targetId: "project-1",
  defaultEnvironmentId: "environment-1",
  definition: {
    schemaVersion: "1",
    setup: null,
    cases: [],
    teardown: null,
    concurrency: 1,
    stopOnFailure: false,
    retryPolicy: { maxAttempts: 1, backoffMs: 0 },
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
        onPlanChange={vi.fn()}
        onDeleted={vi.fn()}
        onReload={vi.fn().mockResolvedValue(undefined)}
        onRun={vi.fn()}
        onOpenRun={vi.fn()}
        onOpenCase={vi.fn()}
      />,
    );

    const projectProperty = findProperty(container, "Project");
    const environmentProperty = findProperty(container, "Environment");

    expect(projectProperty).toBeDefined();
    expect(environmentProperty).toBeDefined();
    expect(projectProperty?.textContent).toContain(projectName);
    expect(projectProperty?.textContent).not.toContain("project-1");
    expect(environmentProperty?.textContent).toContain(environmentName);
    expect(
      projectProperty?.querySelector(".tests-detail-truncated-property__value"),
    ).not.toBeNull();
    expect(
      environmentProperty?.querySelector(".tests-detail-truncated-property__value"),
    ).not.toBeNull();
    expect(
      projectProperty?.querySelector(".platform-service-detail-page__property-value")
        ?.getAttribute("title"),
    ).toBe(projectName);
    expect(
      environmentProperty?.querySelector(".platform-service-detail-page__property-value")
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
    expect(screen.getByRole("table", { name: "Test cases" })).not.toBeNull();
    expect(screen.getByPlaceholderText("Search cases")).not.toBeNull();
    expect(screen.getAllByRole("button", { name: "Add Case" }).length).toBeGreaterThan(0);

    fireEvent.click(within(sectionSwitch).getByRole("radio", { name: "Overview" }));
    expect(detailsSidebar?.dataset.collapsed).toBe("false");
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
    expect(screen.getByRole("menuitem", { name: "Copy Test ID" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Rename" })).not.toBeNull();
    expect(screen.getByRole("menuitem", { name: "Delete" })).not.toBeNull();

    fireEvent.pointerEnter(informationAction);
    const informationPopup = screen.getByRole("dialog", { name: "Test information" });
    expect(informationPopup.getAttribute("data-platform-popup-placement")).toBe("right-start");
    expect(screen.getByText("plan-1")).not.toBeNull();

    fireEvent.click(screen.getByRole("menuitem", { name: "Share" }));
    expect(screen.getByRole("dialog", { name: "Share test with team" })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    fireEvent.click(screen.getByRole("button", { name: "Test actions" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "Show version history" }));
    expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(true);
    expect(await screen.findByRole("heading", { name: "Version history" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "View Changes" })).not.toBeNull();
    expect(detailsSidebar?.dataset.collapsed).toBe("true");
    expect(screen.queryByRole("radiogroup", { name: "Test plan section" })).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close version history" }));
    expect(detailsSidebar?.dataset.collapsed).toBe("false");
    expect(onVersionsSidebarOpenChange).toHaveBeenLastCalledWith(false);
    expect(screen.getByRole("radiogroup", { name: "Test plan section" })).not.toBeNull();

    fireEvent.keyDown(document, {
      key: "ß",
      code: "KeyS",
      metaKey: true,
      altKey: true,
    });
    expect(screen.getByRole("dialog", { name: "Share test with team" })).not.toBeNull();
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

  it("persists a team resource share from the shared actions modal", async () => {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<span id="test-share-title-actions"></span>',
    );
    const addTeamShare = vi.fn().mockResolvedValue({ id: "share-1" });
    const updatePlan = vi.fn().mockResolvedValue({
      ...plan,
      metadata: {
        sharedTeamIds: ["team-1"],
        teamAccessShareIds: { "team-1": "share-1" },
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
    expect(screen.getByRole("radio", { name: /Platform Admin/ })).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    await waitFor(() => {
      expect(addTeamShare).toHaveBeenCalledWith(
        "team-1",
        "plan-1",
        expect.objectContaining({ permissionSets: expect.any(Object) }),
      );
      expect(updatePlan).toHaveBeenCalledWith(
        "plan-1",
        expect.objectContaining({
          metadata: expect.objectContaining({
            sharedTeamIds: ["team-1"],
            teamAccessShareIds: { "team-1": "share-1" },
          }),
        }),
      );
      expect(onPlanChange).toHaveBeenCalled();
    });
  });

  it("loads teams on demand and selects the first manageable result", async () => {
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

    const teamRadio = await screen.findByRole("radio", { name: /Platform Admin/ });
    await waitFor(() => expect((teamRadio as HTMLInputElement).checked).toBe(true));
    expect(
      teamRadio.parentElement?.querySelector('img[src="/img/team-platform.webp"]'),
    ).not.toBeNull();
    expect((screen.getByRole("button", { name: "Share" }) as HTMLButtonElement).disabled).toBe(false);
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
