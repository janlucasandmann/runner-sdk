import { type Dispatch, type SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import {
  getRunnerProjectEnvironmentId,
  type RunnerChatOption,
  type RunnerChatProjectOption,
} from "./agent-options.js";
import type { RunnerWorkspaceSelectorMode } from "./voice-audio.js";
import { loadPersistedWorkspaceSelection, persistWorkspaceSelection } from "./workspace-files.js";

export interface UseRunnerWorkspaceSelectionControllerOptions {
  activeThreadEnvironmentId?: string | null;
  availableEnvironments: readonly RunnerChatOption[];
  availableProjects: readonly RunnerChatProjectOption[];
  controlledProjectId?: string | null;
  environmentId?: string | null;
  storageKey: string;
  useComputerAgentsMode: boolean;
}

export interface RunnerWorkspaceSelectionController {
  selectedEnvironmentId: string;
  setSelectedEnvironmentId: Dispatch<SetStateAction<string>>;
  selectedProjectId: string;
  setSelectedProjectId: Dispatch<SetStateAction<string>>;
  workspaceSelectorMode: RunnerWorkspaceSelectorMode;
  setWorkspaceSelectorMode: Dispatch<SetStateAction<RunnerWorkspaceSelectorMode>>;
  selectedProject: RunnerChatProjectOption | null;
  selectedProjectEnvironmentId: string;
  effectiveWorkspaceSelectorMode: RunnerWorkspaceSelectorMode;
  effectiveProjectEnvironmentId: string;
  initialEnvironmentTopId: string | null;
}

export function useRunnerWorkspaceSelectionController({
  activeThreadEnvironmentId,
  availableEnvironments,
  availableProjects,
  controlledProjectId,
  environmentId,
  storageKey,
  useComputerAgentsMode,
}: UseRunnerWorkspaceSelectionControllerOptions): RunnerWorkspaceSelectionController {
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState(() => {
    if (environmentId) return environmentId;
    return (
      availableEnvironments.find((environment) => environment.isDefault)?.id ||
      availableEnvironments[0]?.id ||
      ""
    );
  });
  const [workspaceSelectorMode, setWorkspaceSelectorMode] = useState<RunnerWorkspaceSelectorMode>(
    () => loadPersistedWorkspaceSelection(storageKey)?.mode || "computers",
  );
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const persisted = loadPersistedWorkspaceSelection(storageKey);
    return persisted?.mode === "projects" ? persisted.projectId : "";
  });
  const [initialEnvironmentTopId, setInitialEnvironmentTopId] = useState<string | null>(null);
  const workspacePreferenceAppliedRef = useRef(false);
  const lastAppliedControlledProjectIdRef = useRef<string | null>(null);

  const selectedProject = useMemo(
    () => availableProjects.find((project) => project.id === selectedProjectId) || null,
    [availableProjects, selectedProjectId],
  );
  const selectedProjectEnvironmentId = getRunnerProjectEnvironmentId(selectedProject);
  const effectiveWorkspaceSelectorMode: RunnerWorkspaceSelectorMode =
    workspaceSelectorMode === "projects" && selectedProject && selectedProjectEnvironmentId
      ? "projects"
      : "computers";
  const effectiveProjectEnvironmentId =
    effectiveWorkspaceSelectorMode === "projects" ? selectedProjectEnvironmentId : "";

  useEffect(() => {
    if (!availableEnvironments.length) return;
    setSelectedEnvironmentId((current) => {
      if (
        effectiveWorkspaceSelectorMode === "projects" &&
        selectedProjectEnvironmentId &&
        availableEnvironments.some((environment) => environment.id === selectedProjectEnvironmentId)
      ) {
        return selectedProjectEnvironmentId;
      }
      if (
        activeThreadEnvironmentId &&
        availableEnvironments.some((environment) => environment.id === activeThreadEnvironmentId)
      ) {
        return activeThreadEnvironmentId;
      }
      if (current && availableEnvironments.some((environment) => environment.id === current)) {
        return current;
      }
      if (
        environmentId &&
        availableEnvironments.some((environment) => environment.id === environmentId)
      ) {
        return environmentId;
      }
      return (
        availableEnvironments.find((environment) => environment.isDefault)?.id ||
        availableEnvironments[0]?.id ||
        ""
      );
    });
  }, [
    activeThreadEnvironmentId,
    availableEnvironments,
    effectiveWorkspaceSelectorMode,
    environmentId,
    selectedProjectEnvironmentId,
  ]);

  useEffect(() => {
    if (!useComputerAgentsMode) return;

    const configuredProjectId = String(controlledProjectId || "").trim();
    if (!configuredProjectId) {
      lastAppliedControlledProjectIdRef.current = configuredProjectId;
      return;
    }
    if (lastAppliedControlledProjectIdRef.current === configuredProjectId) {
      return;
    }

    const persistedWorkspaceSelection = !workspacePreferenceAppliedRef.current
      ? loadPersistedWorkspaceSelection(storageKey)
      : null;
    const hasActiveProjectWorkspaceSelection =
      (workspaceSelectorMode === "projects" && Boolean(selectedProjectId)) ||
      (persistedWorkspaceSelection?.mode === "projects" &&
        Boolean(persistedWorkspaceSelection.projectId));
    if (!hasActiveProjectWorkspaceSelection) {
      lastAppliedControlledProjectIdRef.current = configuredProjectId;
      return;
    }

    const configuredProject =
      availableProjects.find((project) => project.id === configuredProjectId) || null;
    const configuredEnvironmentId = getRunnerProjectEnvironmentId(configuredProject);
    if (!configuredProject || !configuredEnvironmentId) return;

    lastAppliedControlledProjectIdRef.current = configuredProjectId;
    workspacePreferenceAppliedRef.current = true;
    setWorkspaceSelectorMode("projects");
    setSelectedProjectId(configuredProjectId);
    setSelectedEnvironmentId(configuredEnvironmentId);
    persistWorkspaceSelection(storageKey, {
      mode: "projects",
      projectId: configuredProjectId,
      environmentId: configuredEnvironmentId,
    });
  }, [
    availableProjects,
    controlledProjectId,
    selectedProjectId,
    storageKey,
    useComputerAgentsMode,
    workspaceSelectorMode,
  ]);

  useEffect(() => {
    if (!useComputerAgentsMode || workspacePreferenceAppliedRef.current) return;

    const persisted = loadPersistedWorkspaceSelection(storageKey);
    if (!persisted) {
      workspacePreferenceAppliedRef.current = true;
      return;
    }

    if (persisted.mode === "projects" && persisted.projectId) {
      if (availableProjects.length === 0) return;
      const persistedProject =
        availableProjects.find((project) => project.id === persisted.projectId) || null;
      const persistedEnvironmentId = getRunnerProjectEnvironmentId(persistedProject);
      if (persistedProject && persistedEnvironmentId) {
        setWorkspaceSelectorMode("projects");
        setSelectedProjectId(persisted.projectId);
        setSelectedEnvironmentId(persistedEnvironmentId);
      }
      workspacePreferenceAppliedRef.current = true;
      return;
    }

    if (
      persisted.mode === "computers" &&
      persisted.environmentId &&
      availableEnvironments.length > 0 &&
      availableEnvironments.some((environment) => environment.id === persisted.environmentId)
    ) {
      setWorkspaceSelectorMode("computers");
      setSelectedProjectId("");
      setSelectedEnvironmentId(persisted.environmentId);
    }
    workspacePreferenceAppliedRef.current = true;
  }, [availableEnvironments, availableProjects, storageKey, useComputerAgentsMode]);

  useEffect(() => {
    if (
      !selectedProjectId ||
      availableProjects.length === 0 ||
      availableProjects.some((project) => project.id === selectedProjectId)
    ) {
      return;
    }
    setSelectedProjectId("");
    setWorkspaceSelectorMode("computers");
  }, [availableProjects, selectedProjectId]);

  useEffect(() => {
    if (!availableEnvironments.length) {
      setInitialEnvironmentTopId(null);
      return;
    }
    if (
      initialEnvironmentTopId &&
      availableEnvironments.some((environment) => environment.id === initialEnvironmentTopId)
    ) {
      return;
    }
    if (
      activeThreadEnvironmentId &&
      availableEnvironments.some((environment) => environment.id === activeThreadEnvironmentId)
    ) {
      setInitialEnvironmentTopId(activeThreadEnvironmentId);
      return;
    }
    if (
      environmentId &&
      availableEnvironments.some((environment) => environment.id === environmentId)
    ) {
      setInitialEnvironmentTopId(environmentId);
      return;
    }
    if (
      selectedEnvironmentId &&
      availableEnvironments.some((environment) => environment.id === selectedEnvironmentId)
    ) {
      setInitialEnvironmentTopId(selectedEnvironmentId);
      return;
    }
    setInitialEnvironmentTopId(
      availableEnvironments.find((environment) => environment.isDefault)?.id ||
        availableEnvironments[0]?.id ||
        null,
    );
  }, [
    activeThreadEnvironmentId,
    availableEnvironments,
    environmentId,
    initialEnvironmentTopId,
    selectedEnvironmentId,
  ]);

  return {
    selectedEnvironmentId,
    setSelectedEnvironmentId,
    selectedProjectId,
    setSelectedProjectId,
    workspaceSelectorMode,
    setWorkspaceSelectorMode,
    selectedProject,
    selectedProjectEnvironmentId,
    effectiveWorkspaceSelectorMode,
    effectiveProjectEnvironmentId,
    initialEnvironmentTopId,
  };
}
