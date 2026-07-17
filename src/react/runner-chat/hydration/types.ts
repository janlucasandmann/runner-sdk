import type { RunnerLog } from "../../../types.js";
import type { RunnerConversationMessage } from "../conversation-messages.js";

export interface RunnerThreadHydrationPayload {
  threadId: string;
  threadStatus?: string | null;
  threadUpdatedAt?: string | null;
  threadEnvironmentId?: string | null;
  threadEnvironmentName?: string | null;
  threadMetadata?: Record<string, unknown> | null;
  initialPrompt: string;
  logs: RunnerLog[];
  messages: RunnerConversationMessage[];
  durationSeconds?: number | null;
  startedAtMs?: number | null;
  completedAtMs?: number | null;
  agentName?: string | null;
  environmentName?: string | null;
}

export interface RunnerThreadDiffEntry {
  path?: string;
  additions?: number;
  deletions?: number;
  changes?: string;
  diff?: string;
  createdAt?: string;
}

export interface RunnerParsedThreadStep {
  id: string;
  sequence: number;
  stepKind: string;
  eventType: string | null;
  title: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}
