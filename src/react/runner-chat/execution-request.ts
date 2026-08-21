import type { RunnerQuotedSelection } from "./turn-types.js";
import type { RunnerAttachment } from "./attachment-types.js";
import {
  buildRunnerAdCreationHiddenPrompt,
  buildRunnerAdCreationLabel,
  buildRunnerParseCreationHiddenPrompt,
  buildRunnerParseCreationLabel,
  buildRunnerResearchCreationHiddenPrompt,
  buildRunnerResearchCreationLabel,
  buildRunnerScrapeCreationHiddenPrompt,
  buildRunnerScrapeCreationLabel,
  buildRunnerSlideCreationHiddenPrompt,
  buildRunnerSlideCreationLabel,
  buildRunnerLoopLabel,
  getRunnerAdCreationQualityComputeTokensPerImage,
  normalizeRunnerAdCreationSettings,
  type RunnerAgentCreationCommandType,
  type RunnerResourceCreationCommandType,
  type RunnerSkillCreationCommandType,
  type StagedAdCreationCommand,
  type StagedAgentCreationCommand,
  type StagedBacklogCommand,
  type StagedParseCreationCommand,
  type StagedResearchCreationCommand,
  type StagedResourceCreationCommand,
  type StagedScrapeCreationCommand,
  type StagedSkillCreationCommand,
  type StagedSlideCreationCommand,
  type StagedLoopCommand,
} from "./composer-commands.js";
import {
  buildRunnerAgentGuardrailsHiddenPrompt,
  buildRunnerExecutionPromptWithHiddenContext,
  type RunnerChatOption,
} from "./agent-options.js";
import {
  getRunnerConnectorIdsFromPayload,
  RUNNER_CONNECTOR_IDS_METADATA_KEY,
} from "./composer-connectors.js";
import {
  normalizeRunnerKnowledgeContext,
  type RunnerKnowledgeContext,
} from "./knowledge-context.js";

export interface RunnerExecutionCreationCommands {
  backlogCommand?: StagedBacklogCommand | null;
  resourceCreationCommand?: StagedResourceCreationCommand | null;
  agentCreationCommand?: StagedAgentCreationCommand | null;
  skillCreationCommand?: StagedSkillCreationCommand | null;
  slideCreationCommand?: StagedSlideCreationCommand | null;
  researchCreationCommand?: StagedResearchCreationCommand | null;
  scrapeCreationCommand?: StagedScrapeCreationCommand | null;
  parseCreationCommand?: StagedParseCreationCommand | null;
  adCreationCommand?: StagedAdCreationCommand | null;
  loopCommand?: StagedLoopCommand | null;
}

export interface RunnerExecutionMessageMetadataOptions
  extends RunnerExecutionCreationCommands {
  connectors?: Record<string, unknown> | null;
}

export interface RunnerExecutionPromptOptions extends RunnerExecutionCreationCommands {
  taskText: string;
  selectedAgent?: RunnerChatOption | null;
  hiddenSystemPrompt?: string | null;
  resourceCreationHiddenPrompt?: (
    commandType: RunnerResourceCreationCommandType,
  ) => string;
  agentCreationHiddenPrompt?: (
    commandType: RunnerAgentCreationCommandType,
  ) => string;
  skillCreationHiddenPrompt?: (
    commandType: RunnerSkillCreationCommandType,
  ) => string;
}

export interface RunnerExecutionPrompt {
  executionTaskText: string;
  agentGuardrailsHiddenPromptText: string;
}

export function buildRunnerExecutionPrompt(
  options: RunnerExecutionPromptOptions,
): RunnerExecutionPrompt {
  const agentGuardrailsHiddenPromptText =
    buildRunnerAgentGuardrailsHiddenPrompt(options.selectedAgent);
  const hiddenSystemPromptText = String(options.hiddenSystemPrompt || "").trim();
  const resourceCreationHiddenPromptText = options.resourceCreationCommand
    ? String(
        options.resourceCreationHiddenPrompt?.(
          options.resourceCreationCommand.action,
        ) || "",
      ).trim()
    : "";
  const agentCreationHiddenPromptText = options.agentCreationCommand
    ? String(
        options.agentCreationHiddenPrompt?.(
          options.agentCreationCommand.action,
        ) || "",
      ).trim()
    : "";
  const skillCreationHiddenPromptText = options.skillCreationCommand
    ? String(
        options.skillCreationHiddenPrompt?.(
          options.skillCreationCommand.action,
        ) || "",
      ).trim()
    : "";

  const executionTaskText = buildRunnerExecutionPromptWithHiddenContext(
    [
      agentGuardrailsHiddenPromptText,
      hiddenSystemPromptText,
      resourceCreationHiddenPromptText,
      agentCreationHiddenPromptText,
      skillCreationHiddenPromptText,
      options.slideCreationCommand ? buildRunnerSlideCreationHiddenPrompt() : "",
      options.researchCreationCommand
        ? buildRunnerResearchCreationHiddenPrompt()
        : "",
      options.scrapeCreationCommand ? buildRunnerScrapeCreationHiddenPrompt() : "",
      options.parseCreationCommand ? buildRunnerParseCreationHiddenPrompt() : "",
      options.adCreationCommand
        ? buildRunnerAdCreationHiddenPrompt(options.adCreationCommand)
        : "",
    ],
    options.taskText,
  );

  return {
    executionTaskText,
    agentGuardrailsHiddenPromptText,
  };
}

export function buildRunnerExecutionMessageMetadata(
  commands: RunnerExecutionMessageMetadataOptions,
): Record<string, unknown> | undefined {
  const connectorIds = getRunnerConnectorIdsFromPayload(commands.connectors);
  if (
    !commands.slideCreationCommand
    && !commands.researchCreationCommand
    && !commands.scrapeCreationCommand
    && !commands.parseCreationCommand
    && !commands.adCreationCommand
    && !commands.loopCommand
    && connectorIds.length === 0
  ) {
    return undefined;
  }

  const adSettings = commands.adCreationCommand
    ? normalizeRunnerAdCreationSettings(commands.adCreationCommand)
    : null;

  return {
    ...(connectorIds.length > 0
      ? { [RUNNER_CONNECTOR_IDS_METADATA_KEY]: connectorIds }
      : {}),
    ...(commands.loopCommand
      ? {
          loopCommand: {
            action: "loop" as const,
            label: buildRunnerLoopLabel(),
          },
        }
      : {}),
    ...(commands.slideCreationCommand
      ? {
          slideCreationCommand: {
            action: "slides" as const,
            label: buildRunnerSlideCreationLabel(),
          },
        }
      : {}),
    ...(commands.researchCreationCommand
      ? {
          researchCreationCommand: {
            action: "research" as const,
            label: buildRunnerResearchCreationLabel(),
          },
        }
      : {}),
    ...(commands.scrapeCreationCommand
      ? {
          scrapeCreationCommand: {
            action: "scrape" as const,
            label: buildRunnerScrapeCreationLabel(),
          },
        }
      : {}),
    ...(commands.parseCreationCommand
      ? {
          parseCreationCommand: {
            action: "parse" as const,
            label: buildRunnerParseCreationLabel(),
          },
        }
      : {}),
    ...(adSettings
      ? {
          adCreationCommand: {
            action: "ad" as const,
            label: buildRunnerAdCreationLabel(),
            style: adSettings.style,
            quality: adSettings.quality,
            aspectRatio: adSettings.aspectRatio,
            variants: adSettings.variants,
            computeTokensPerImage:
              getRunnerAdCreationQualityComputeTokensPerImage(adSettings.quality),
          },
        }
      : {}),
  };
}

export interface RunnerThreadMessageRequestOptions
  extends RunnerExecutionCreationCommands {
  taskText: string;
  visibleTaskText: string;
  executionTaskText: string;
  agentGuardrailsHiddenPromptText?: string;
  reasoningEffort: string;
  attachments?: RunnerAttachment[];
  githubRepo?: {
    repoFullName: string;
    repoName: string;
    branch: string;
  } | null;
  truncateAtMessageIndex?: number;
  persistFileChanges?: boolean;
  quotedSelection?: RunnerQuotedSelection | null;
  enabledSkills?: Record<string, unknown> | null;
  connectors?: Record<string, unknown> | null;
  knowledgeContext?: RunnerKnowledgeContext | null;
}

export function buildRunnerThreadMessageRequestBody(
  options: RunnerThreadMessageRequestOptions,
): Record<string, unknown> {
  const content = options.visibleTaskText || options.taskText;
  const messageMetadata = buildRunnerExecutionMessageMetadata(options);
  const subtaskBacklogCommand =
    options.backlogCommand?.action === "subtask"
      ? options.backlogCommand
      : null;
  const knowledgeContext = normalizeRunnerKnowledgeContext(options.knowledgeContext);

  return {
    content,
    reasoningEffort: options.reasoningEffort,
    ...(options.executionTaskText !== content
      ? { executionContent: options.executionTaskText }
      : {}),
    ...(options.agentGuardrailsHiddenPromptText
      ? { useExecutionContentForUpstream: true }
      : {}),
    ...(messageMetadata ? { messageMetadata } : {}),
    ...(options.attachments ? { attachments: options.attachments } : {}),
    ...(options.githubRepo ? { githubRepo: options.githubRepo } : {}),
    ...(typeof options.truncateAtMessageIndex === "number"
      ? { truncateAtMessageIndex: options.truncateAtMessageIndex }
      : {}),
    ...(typeof options.persistFileChanges === "boolean"
      ? { persistFileChanges: options.persistFileChanges }
      : {}),
    ...(options.quotedSelection
      ? { quotedSelection: options.quotedSelection }
      : {}),
    ...(options.enabledSkills
      ? { enabledSkills: options.enabledSkills }
      : {}),
    ...(options.connectors ? { connectors: options.connectors } : {}),
    ...(knowledgeContext ? { knowledgeContext } : {}),
    ...(subtaskBacklogCommand
      ? {
          backlogTaskCommand: {
            action: "subtask" as const,
            parentTicketNumber: subtaskBacklogCommand.ticketNumber,
          },
        }
      : {}),
  };
}
