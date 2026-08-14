// @vitest-environment jsdom

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useRunnerWorkspaceSelectionController } from "./use-workspace-selection-controller.js";

const STORAGE_KEY = "runner-chat:test-workspace-selection";
const environments = [
  { id: "environment-1", name: "Primary", isDefault: true },
  { id: "environment-2", name: "Research" },
];
const projects = [
  {
    id: "project-1",
    name: "Primary project",
    defaultEnvironmentId: "environment-1",
  },
  {
    id: "project-2",
    name: "Research project",
    defaultEnvironmentId: "environment-2",
  },
];

describe("useRunnerWorkspaceSelectionController", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("restores a persisted project workspace", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: "projects",
        projectId: "project-2",
        environmentId: "environment-2",
      }),
    );

    const { result } = renderHook(() =>
      useRunnerWorkspaceSelectionController({
        availableEnvironments: environments,
        availableProjects: projects,
        storageKey: STORAGE_KEY,
        useComputerAgentsMode: true,
      }),
    );

    await waitFor(() => expect(result.current.selectedEnvironmentId).toBe("environment-2"));
    expect(result.current.selectedProjectId).toBe("project-2");
    expect(result.current.effectiveWorkspaceSelectorMode).toBe("projects");
    expect(result.current.effectiveProjectEnvironmentId).toBe("environment-2");
  });

  it("applies a controlled project only when project mode is active", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: "projects",
        projectId: "project-1",
        environmentId: "environment-1",
      }),
    );

    const { result } = renderHook(() =>
      useRunnerWorkspaceSelectionController({
        availableEnvironments: environments,
        availableProjects: projects,
        controlledProjectId: "project-2",
        storageKey: STORAGE_KEY,
        useComputerAgentsMode: true,
      }),
    );

    await waitFor(() => expect(result.current.selectedProjectId).toBe("project-2"));
    expect(result.current.selectedEnvironmentId).toBe("environment-2");
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "{}")).toEqual({
      mode: "projects",
      projectId: "project-2",
      environmentId: "environment-2",
    });
  });

  it("keeps a selected project environment ahead of the active thread environment", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: "projects",
        projectId: "project-2",
        environmentId: "environment-2",
      }),
    );

    const { result } = renderHook(() =>
      useRunnerWorkspaceSelectionController({
        activeThreadEnvironmentId: "environment-1",
        availableEnvironments: environments,
        availableProjects: projects,
        storageKey: STORAGE_KEY,
        useComputerAgentsMode: true,
      }),
    );

    await waitFor(() => expect(result.current.selectedProjectId).toBe("project-2"));
    await waitFor(() => expect(result.current.selectedEnvironmentId).toBe("environment-2"));
    expect(result.current.effectiveWorkspaceSelectorMode).toBe("projects");
  });

  it("repairs a stale project and prioritizes an active thread environment", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        mode: "projects",
        projectId: "missing-project",
        environmentId: "environment-1",
      }),
    );

    const { result } = renderHook(() =>
      useRunnerWorkspaceSelectionController({
        activeThreadEnvironmentId: "environment-2",
        availableEnvironments: environments,
        availableProjects: projects,
        storageKey: STORAGE_KEY,
        useComputerAgentsMode: true,
      }),
    );

    await waitFor(() => expect(result.current.selectedProjectId).toBe(""));
    expect(result.current.workspaceSelectorMode).toBe("computers");
    expect(result.current.selectedEnvironmentId).toBe("environment-2");
    expect(result.current.initialEnvironmentTopId).toBe("environment-2");
  });
});
