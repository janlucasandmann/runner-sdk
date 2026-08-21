import { useCallback, useState } from "react";

import {
  buildRunnerAgentCreationLabel,
  buildRunnerBacklogSubtaskLabel,
  buildRunnerBatchCreationLabel,
  buildRunnerLoopLabel,
  buildRunnerMissionControlLabel,
  buildRunnerParseCreationLabel,
  buildRunnerResearchCreationLabel,
  buildRunnerResourceCreationLabel,
  buildRunnerScrapeCreationLabel,
  buildRunnerSkillCreationLabel,
  buildRunnerSlideCreationLabel,
  buildStagedRunnerAdCreationCommand,
  normalizeRunnerBacklogTicketNumber,
  parseAutoStageAdCreationCommand,
  parseAutoStageAgentCreationCommand,
  parseAutoStageBacklogMissionControlCommand,
  parseAutoStageBacklogSubtaskCommand,
  parseAutoStageBatchCreationCommand,
  parseAutoStageLoopCommand,
  parseAutoStageParseCreationCommand,
  parseAutoStageResearchCreationCommand,
  parseAutoStageResourceCreationCommand,
  parseAutoStageScrapeCreationCommand,
  parseAutoStageSkillCreationCommand,
  parseAutoStageSlideCreationCommand,
  type RunnerAdCreationSettings,
  type RunnerAgentCreationCommandType,
  type RunnerResourceCreationCommandType,
  type RunnerSkillCreationCommandType,
  type StagedAdCreationCommand,
  type StagedAgentCreationCommand,
  type StagedBacklogMissionControlCommand,
  type StagedBacklogSubtaskCommand,
  type StagedBatchCreationCommand,
  type StagedLoopCommand,
  type StagedParseCreationCommand,
  type StagedResearchCreationCommand,
  type StagedResourceCreationCommand,
  type StagedScrapeCreationCommand,
  type StagedSkillCreationCommand,
  type StagedSlideCreationCommand,
} from "./composer-commands.js";
import {
  parseAutoStageThreadContextCommand,
  type RunnerChatThreadContextAction,
} from "./thread-context-utils.js";

interface RunnerStagedComposerCommands {
  threadContext: RunnerChatThreadContextAction | null;
  resourceCreation: StagedResourceCreationCommand | null;
  agentCreation: StagedAgentCreationCommand | null;
  skillCreation: StagedSkillCreationCommand | null;
  slideCreation: StagedSlideCreationCommand | null;
  researchCreation: StagedResearchCreationCommand | null;
  scrapeCreation: StagedScrapeCreationCommand | null;
  parseCreation: StagedParseCreationCommand | null;
  adCreation: StagedAdCreationCommand | null;
  backlogSubtask: StagedBacklogSubtaskCommand | null;
  backlogMissionControl: StagedBacklogMissionControlCommand | null;
  batchCreation: StagedBatchCreationCommand | null;
  loop: StagedLoopCommand | null;
}

type RunnerStagedComposerCommandKey = keyof RunnerStagedComposerCommands;

const EMPTY_STAGED_COMPOSER_COMMANDS: RunnerStagedComposerCommands = {
  threadContext: null,
  resourceCreation: null,
  agentCreation: null,
  skillCreation: null,
  slideCreation: null,
  researchCreation: null,
  scrapeCreation: null,
  parseCreation: null,
  adCreation: null,
  backlogSubtask: null,
  backlogMissionControl: null,
  batchCreation: null,
  loop: null,
};

const BACKSPACE_DISMISS_ORDER: readonly RunnerStagedComposerCommandKey[] = [
  "threadContext",
  "resourceCreation",
  "agentCreation",
  "skillCreation",
  "slideCreation",
  "researchCreation",
  "scrapeCreation",
  "parseCreation",
  "adCreation",
  "backlogSubtask",
  "backlogMissionControl",
  "batchCreation",
  "loop",
];

export interface UseRunnerStagedComposerCommandsOptions {
  adCreationSettings: RunnerAdCreationSettings;
  getCurrentDraft: () => string;
  onDraftChange: (prompt: string) => void;
}

export interface RunnerComposerAutoStageCapabilities {
  batchCreation?: boolean;
  backlogMissionControl?: boolean;
  backlogSubtask?: boolean;
  agentCreation?: boolean;
  resourceCreation?: boolean;
  skillCreation?: boolean;
}

export function useRunnerStagedComposerCommands({
  adCreationSettings,
  getCurrentDraft,
  onDraftChange,
}: UseRunnerStagedComposerCommandsOptions) {
  const [commands, setCommands] = useState<RunnerStagedComposerCommands>(
    EMPTY_STAGED_COMPOSER_COMMANDS,
  );

  const stageCommand = useCallback(
    <Key extends RunnerStagedComposerCommandKey>(
      key: Key,
      command: RunnerStagedComposerCommands[Key],
      prompt: string,
    ) => {
      setCommands({
        ...EMPTY_STAGED_COMPOSER_COMMANDS,
        [key]: command,
      });
      onDraftChange(prompt);
    },
    [onDraftChange],
  );

  const clearAll = useCallback(() => {
    setCommands(EMPTY_STAGED_COMPOSER_COMMANDS);
  }, []);

  const clearCommand = useCallback((key: RunnerStagedComposerCommandKey) => {
    setCommands((current) => (current[key] === null ? current : { ...current, [key]: null }));
  }, []);

  const setComposerDraft = useCallback(
    (prompt: string) => {
      setCommands((current) => ({
        ...EMPTY_STAGED_COMPOSER_COMMANDS,
        backlogSubtask: current.backlogSubtask,
        backlogMissionControl: current.backlogMissionControl,
      }));
      onDraftChange(prompt);
    },
    [onDraftChange],
  );

  const stageThreadContextCommand = useCallback(
    (action: RunnerChatThreadContextAction, prompt = "") => {
      stageCommand("threadContext", action, prompt);
    },
    [stageCommand],
  );
  const stageBacklogSubtaskCommand = useCallback(
    (ticketNumber: string, prompt?: string) => {
      const normalizedTicketNumber = normalizeRunnerBacklogTicketNumber(ticketNumber);
      if (!normalizedTicketNumber) return;
      stageCommand(
        "backlogSubtask",
        {
          action: "subtask",
          ticketNumber: normalizedTicketNumber,
          label: buildRunnerBacklogSubtaskLabel(normalizedTicketNumber),
        },
        prompt === undefined ? getCurrentDraft() : prompt,
      );
    },
    [getCurrentDraft, stageCommand],
  );
  const stageBacklogMissionControlCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "backlogMissionControl",
        {
          action: "mission_control",
          label: buildRunnerMissionControlLabel(),
        },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageBatchCreationCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "batchCreation",
        { action: "batch", label: buildRunnerBatchCreationLabel() },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageLoopCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "loop",
        { action: "loop", label: buildRunnerLoopLabel() },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageResourceCreationCommand = useCallback(
    (action: RunnerResourceCreationCommandType, prompt = "") => {
      stageCommand(
        "resourceCreation",
        { action, label: buildRunnerResourceCreationLabel(action) },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageAgentCreationCommand = useCallback(
    (action: RunnerAgentCreationCommandType, prompt = "") => {
      stageCommand(
        "agentCreation",
        { action, label: buildRunnerAgentCreationLabel(action) },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageSkillCreationCommand = useCallback(
    (action: RunnerSkillCreationCommandType, prompt = "") => {
      stageCommand(
        "skillCreation",
        { action, label: buildRunnerSkillCreationLabel(action) },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageSlideCreationCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "slideCreation",
        { action: "slides", label: buildRunnerSlideCreationLabel() },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageResearchCreationCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "researchCreation",
        { action: "research", label: buildRunnerResearchCreationLabel() },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageScrapeCreationCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "scrapeCreation",
        { action: "scrape", label: buildRunnerScrapeCreationLabel() },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageParseCreationCommand = useCallback(
    (prompt = "") => {
      stageCommand(
        "parseCreation",
        { action: "parse", label: buildRunnerParseCreationLabel() },
        prompt,
      );
    },
    [stageCommand],
  );
  const stageAdCreationCommand = useCallback(
    (prompt = "") => {
      stageCommand("adCreation", buildStagedRunnerAdCreationCommand(adCreationSettings), prompt);
    },
    [adCreationSettings, stageCommand],
  );

  const refreshStagedAdCreationCommand = useCallback((settings: RunnerAdCreationSettings) => {
    setCommands((current) =>
      current.adCreation
        ? {
            ...current,
            adCreation: buildStagedRunnerAdCreationCommand(settings),
          }
        : current,
    );
  }, []);

  const tryAutoStageInput = useCallback(
    (input: string, capabilities: RunnerComposerAutoStageCapabilities = {}): boolean => {
      if (Object.values(commands).some((command) => command !== null)) {
        return false;
      }

      const threadContext = parseAutoStageThreadContextCommand(input);
      if (threadContext) {
        stageThreadContextCommand(threadContext.action, threadContext.prompt);
        return true;
      }
      const slides = parseAutoStageSlideCreationCommand(input);
      if (slides) {
        stageSlideCreationCommand(slides.prompt);
        return true;
      }
      const ad = parseAutoStageAdCreationCommand(input);
      if (ad) {
        stageAdCreationCommand(ad.prompt);
        return true;
      }
      const research = parseAutoStageResearchCreationCommand(input);
      if (research) {
        stageResearchCreationCommand(research.prompt);
        return true;
      }
      const scrape = parseAutoStageScrapeCreationCommand(input);
      if (scrape) {
        stageScrapeCreationCommand(scrape.prompt);
        return true;
      }
      const parse = parseAutoStageParseCreationCommand(input);
      if (parse) {
        stageParseCreationCommand(parse.prompt);
        return true;
      }
      const loop = parseAutoStageLoopCommand(input);
      if (loop) {
        stageLoopCommand(loop.prompt);
        return true;
      }
      if (capabilities.batchCreation) {
        const batch = parseAutoStageBatchCreationCommand(input);
        if (batch) {
          stageBatchCreationCommand(batch.prompt);
          return true;
        }
      }
      if (capabilities.resourceCreation) {
        const resource = parseAutoStageResourceCreationCommand(input);
        if (resource) {
          stageResourceCreationCommand(resource.action, resource.prompt);
          return true;
        }
      }
      if (capabilities.agentCreation) {
        const agent = parseAutoStageAgentCreationCommand(input);
        if (agent) {
          stageAgentCreationCommand(agent.action, agent.prompt);
          return true;
        }
      }
      if (capabilities.skillCreation) {
        const skill = parseAutoStageSkillCreationCommand(input);
        if (skill) {
          stageSkillCreationCommand(skill.action, skill.prompt);
          return true;
        }
      }
      if (capabilities.backlogSubtask) {
        const subtask = parseAutoStageBacklogSubtaskCommand(input);
        if (subtask) {
          stageBacklogSubtaskCommand(subtask.ticketNumber, subtask.prompt);
          return true;
        }
      }
      if (capabilities.backlogMissionControl) {
        const missionControl = parseAutoStageBacklogMissionControlCommand(input);
        if (missionControl) {
          stageBacklogMissionControlCommand(missionControl.prompt);
          return true;
        }
      }
      return false;
    },
    [
      commands,
      stageAdCreationCommand,
      stageAgentCreationCommand,
      stageBacklogMissionControlCommand,
      stageBacklogSubtaskCommand,
      stageBatchCreationCommand,
      stageLoopCommand,
      stageParseCreationCommand,
      stageResearchCreationCommand,
      stageResourceCreationCommand,
      stageScrapeCreationCommand,
      stageSkillCreationCommand,
      stageSlideCreationCommand,
      stageThreadContextCommand,
    ],
  );

  const dismissActiveCommand = useCallback((): boolean => {
    const activeKey = BACKSPACE_DISMISS_ORDER.find((key) => commands[key] !== null);
    if (!activeKey) return false;
    clearCommand(activeKey);
    return true;
  }, [clearCommand, commands]);

  return {
    stagedThreadContextCommand: commands.threadContext,
    stagedResourceCreationCommand: commands.resourceCreation,
    stagedAgentCreationCommand: commands.agentCreation,
    stagedSkillCreationCommand: commands.skillCreation,
    stagedSlideCreationCommand: commands.slideCreation,
    stagedResearchCreationCommand: commands.researchCreation,
    stagedScrapeCreationCommand: commands.scrapeCreation,
    stagedParseCreationCommand: commands.parseCreation,
    stagedAdCreationCommand: commands.adCreation,
    stagedBacklogSubtaskCommand: commands.backlogSubtask,
    stagedBacklogMissionControlCommand: commands.backlogMissionControl,
    stagedBatchCreationCommand: commands.batchCreation,
    stagedLoopCommand: commands.loop,
    clearAllStagedCommands: clearAll,
    clearStagedCommand: clearCommand,
    dismissActiveCommand,
    refreshStagedAdCreationCommand,
    setComposerDraft,
    tryAutoStageInput,
    stageThreadContextCommand,
    stageBacklogSubtaskCommand,
    stageBacklogMissionControlCommand,
    stageBatchCreationCommand,
    stageLoopCommand,
    stageResourceCreationCommand,
    stageAgentCreationCommand,
    stageSkillCreationCommand,
    stageSlideCreationCommand,
    stageResearchCreationCommand,
    stageScrapeCreationCommand,
    stageParseCreationCommand,
    stageAdCreationCommand,
  };
}
