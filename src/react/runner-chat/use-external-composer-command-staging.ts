import { useEffect, useRef } from "react";

import type {
  RunnerAgentCreationCommandType,
  RunnerResourceCreationCommandType,
  RunnerSkillCreationCommandType,
} from "./composer-commands.js";

type RunnerExternalCommandToken = string | number;

export interface RunnerExternalBacklogSubtaskCommand {
  token: RunnerExternalCommandToken;
  ticketNumber: string;
}

export interface RunnerExternalBacklogMissionControlCommand {
  token: RunnerExternalCommandToken;
}

export interface RunnerExternalResourceCreationCommand {
  token: RunnerExternalCommandToken;
  type: RunnerResourceCreationCommandType;
}

export interface RunnerExternalAgentCreationCommand {
  token: RunnerExternalCommandToken;
  type: RunnerAgentCreationCommandType;
}

export interface RunnerExternalSkillCreationCommand {
  token: RunnerExternalCommandToken;
  type: RunnerSkillCreationCommandType;
}

export interface UseRunnerExternalComposerCommandStagingOptions {
  backlogSubtask?: RunnerExternalBacklogSubtaskCommand | null;
  backlogMissionControl?: RunnerExternalBacklogMissionControlCommand | null;
  resourceCreation?: RunnerExternalResourceCreationCommand | null;
  agentCreation?: RunnerExternalAgentCreationCommand | null;
  skillCreation?: RunnerExternalSkillCreationCommand | null;
  enableBacklogSubtask: boolean;
  enableBacklogMissionControl: boolean;
  enableResourceCreation: boolean;
  enableAgentCreation: boolean;
  enableSkillCreation: boolean;
  stagedResourceCreationType: RunnerResourceCreationCommandType | null;
  stagedAgentCreationType: RunnerAgentCreationCommandType | null;
  stagedSkillCreationType: RunnerSkillCreationCommandType | null;
  onResourceCreationChange?: (commandType: RunnerResourceCreationCommandType | null) => void;
  onAgentCreationChange?: (commandType: RunnerAgentCreationCommandType | null) => void;
  onSkillCreationChange?: (commandType: RunnerSkillCreationCommandType | null) => void;
  onStage: () => void;
  stageBacklogSubtask: (ticketNumber: string) => void;
  stageBacklogMissionControl: () => void;
  stageResourceCreation: (type: RunnerResourceCreationCommandType) => void;
  stageAgentCreation: (type: RunnerAgentCreationCommandType) => void;
  stageSkillCreation: (type: RunnerSkillCreationCommandType) => void;
}

export function useRunnerExternalComposerCommandStaging({
  backlogSubtask,
  backlogMissionControl,
  resourceCreation,
  agentCreation,
  skillCreation,
  enableBacklogSubtask,
  enableBacklogMissionControl,
  enableResourceCreation,
  enableAgentCreation,
  enableSkillCreation,
  stagedResourceCreationType,
  stagedAgentCreationType,
  stagedSkillCreationType,
  onResourceCreationChange,
  onAgentCreationChange,
  onSkillCreationChange,
  onStage,
  stageBacklogSubtask,
  stageBacklogMissionControl,
  stageResourceCreation,
  stageAgentCreation,
  stageSkillCreation,
}: UseRunnerExternalComposerCommandStagingOptions): void {
  const appliedBacklogSubtaskTokenRef = useRef<RunnerExternalCommandToken | null>(null);
  const appliedBacklogMissionControlTokenRef = useRef<RunnerExternalCommandToken | null>(null);
  const appliedResourceCreationTokenRef = useRef<RunnerExternalCommandToken | null>(null);
  const appliedAgentCreationTokenRef = useRef<RunnerExternalCommandToken | null>(null);
  const appliedSkillCreationTokenRef = useRef<RunnerExternalCommandToken | null>(null);

  useEffect(() => {
    if (!enableBacklogSubtask || !backlogSubtask?.ticketNumber) return;
    if (appliedBacklogSubtaskTokenRef.current === backlogSubtask.token) return;

    appliedBacklogSubtaskTokenRef.current = backlogSubtask.token;
    onStage();
    stageBacklogSubtask(backlogSubtask.ticketNumber);
  }, [backlogSubtask, enableBacklogSubtask, onStage, stageBacklogSubtask]);

  useEffect(() => {
    if (!enableBacklogMissionControl || !backlogMissionControl) return;
    if (appliedBacklogMissionControlTokenRef.current === backlogMissionControl.token) {
      return;
    }

    appliedBacklogMissionControlTokenRef.current = backlogMissionControl.token;
    onStage();
    stageBacklogMissionControl();
  }, [backlogMissionControl, enableBacklogMissionControl, onStage, stageBacklogMissionControl]);

  useEffect(() => {
    if (!enableResourceCreation || !resourceCreation) return;
    if (appliedResourceCreationTokenRef.current === resourceCreation.token) {
      return;
    }

    appliedResourceCreationTokenRef.current = resourceCreation.token;
    onStage();
    stageResourceCreation(resourceCreation.type);
  }, [enableResourceCreation, onStage, resourceCreation, stageResourceCreation]);

  useEffect(() => {
    onResourceCreationChange?.(stagedResourceCreationType);
  }, [onResourceCreationChange, stagedResourceCreationType]);

  useEffect(() => {
    if (!enableAgentCreation || !agentCreation) return;
    if (appliedAgentCreationTokenRef.current === agentCreation.token) return;

    appliedAgentCreationTokenRef.current = agentCreation.token;
    onStage();
    stageAgentCreation(agentCreation.type);
  }, [agentCreation, enableAgentCreation, onStage, stageAgentCreation]);

  useEffect(() => {
    onAgentCreationChange?.(stagedAgentCreationType);
  }, [onAgentCreationChange, stagedAgentCreationType]);

  useEffect(() => {
    if (!enableSkillCreation || !skillCreation) return;
    if (appliedSkillCreationTokenRef.current === skillCreation.token) return;

    appliedSkillCreationTokenRef.current = skillCreation.token;
    onStage();
    stageSkillCreation(skillCreation.type);
  }, [enableSkillCreation, onStage, skillCreation, stageSkillCreation]);

  useEffect(() => {
    onSkillCreationChange?.(stagedSkillCreationType);
  }, [onSkillCreationChange, stagedSkillCreationType]);
}
