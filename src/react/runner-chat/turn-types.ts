import type { RunnerLog } from "../../types.js";
import type { RunnerTurnAttachment } from "./attachment-types.js";
import type {
  StagedAdCreationCommand,
  StagedParseCreationCommand,
  StagedResearchCreationCommand,
  StagedScrapeCreationCommand,
  StagedSlideCreationCommand,
  StagedLoopCommand,
} from "./composer-commands.js";

export type RunnerTurnStatus =
  | "queued"
  | "running"
  | "permission_asked"
  | "completed"
  | "failed"
  | "cancelled";

export type RunnerQuotedSelectionSource =
  | "working_log"
  | "run_summary"
  | "deep_research_report";

export interface RunnerQuotedSelection {
  text: string;
  sourceType: RunnerQuotedSelectionSource;
}

export interface RunnerTurn {
  id: string;
  sourceMessageId?: string | null;
  prompt: string;
  messageMetadata?: Record<string, unknown> | null;
  logs: RunnerLog[];
  startedAtMs: number;
  completedAtMs?: number;
  durationSeconds?: number | null;
  status: RunnerTurnStatus;
  animateOnRender?: boolean;
  isInitialTurn?: boolean;
  agentName?: string | null;
  environmentName?: string | null;
  presentation?: "default" | "context-action-notice" | "btw";
  quotedSelection?: RunnerQuotedSelection | null;
  attachments?: RunnerTurnAttachment[] | null;
  slideCreationCommand?: StagedSlideCreationCommand | null;
  researchCreationCommand?: StagedResearchCreationCommand | null;
  scrapeCreationCommand?: StagedScrapeCreationCommand | null;
  parseCreationCommand?: StagedParseCreationCommand | null;
  adCreationCommand?: StagedAdCreationCommand | null;
  loopCommand?: StagedLoopCommand | null;
}
