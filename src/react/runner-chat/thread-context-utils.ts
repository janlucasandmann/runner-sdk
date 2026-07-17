export interface RunnerChatThreadContext {
  threadId: string;
  sessionId: string | null;
  model: string;
  maxTokens: number;
  usedTokens: number;
  remainingTokens: number;
  remainingRatio: number;
  source: string;
  exact: boolean;
}

export type RunnerChatThreadContextCategoryKey =
  | "system_prompt"
  | "skills"
  | "messages"
  | "free_space"
  | "autocompact_buffer"
  | "other";

export interface RunnerChatThreadContextCategory {
  key: RunnerChatThreadContextCategoryKey;
  label: string;
  tokens: number;
  ratio: number;
  kind: "used" | "free" | "buffer" | "other";
}

export interface RunnerChatThreadContextDetails extends RunnerChatThreadContext {
  categories: RunnerChatThreadContextCategory[];
  rawText?: string;
  estimate?: RunnerChatThreadContext;
}

export type RunnerChatThreadContextAction =
  | "compact"
  | "clear"
  | "fork"
  | "btw"
  | "revert"
  | "reapply";

export type StagedThreadContextCommandTone =
  | "compact"
  | "btw"
  | "fork"
  | "neutral";

export interface RunnerChatThreadContextAvailableActions {
  compact: boolean;
  clear: boolean;
  btw: boolean;
  fork: boolean;
}

export interface ParsedThreadContextCommand {
  action: "context" | RunnerChatThreadContextAction;
  prompt?: string;
}

export interface RunnerChatThreadContextDisplayMetrics {
  usedTokens: number;
  remainingTokens: number;
  remainingRatio: number;
  usedRatio: number;
}

export const DEFAULT_THREAD_CONTEXT_ACTIONS: RunnerChatThreadContextAvailableActions = {
  compact: false,
  clear: false,
  btw: true,
  fork: false,
};

export const EMPTY_THREAD_CONTEXT_CATEGORIES: RunnerChatThreadContextCategory[] = [
  { key: "system_prompt", label: "System prompt", tokens: 0, ratio: 0, kind: "used" },
  { key: "skills", label: "Skills", tokens: 0, ratio: 0, kind: "used" },
  { key: "messages", label: "Thread context", tokens: 0, ratio: 0, kind: "used" },
  { key: "autocompact_buffer", label: "Autocompact buffer", tokens: 0, ratio: 0, kind: "buffer" },
  { key: "free_space", label: "Free space", tokens: 0, ratio: 0, kind: "free" },
];

export function formatCompactTokenCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

export function deriveThreadContextDisplayMetrics(
  context: RunnerChatThreadContext | RunnerChatThreadContextDetails | null | undefined,
): RunnerChatThreadContextDisplayMetrics {
  if (!context) {
    return {
      usedTokens: 0,
      remainingTokens: 0,
      remainingRatio: 0,
      usedRatio: 0,
    };
  }

  let usedTokens = Math.max(0, context.usedTokens);
  let remainingTokens = Math.max(0, context.remainingTokens);

  if ("categories" in context) {
    const explicitFreeCategory = context.categories.find((category) => category.key === "free_space");
    const nonFreeTokens = context.categories
      .filter((category) => category.key !== "free_space")
      .reduce((sum, category) => sum + Math.max(0, category.tokens), 0);

    if (explicitFreeCategory) {
      remainingTokens = Math.max(0, Math.min(context.maxTokens, explicitFreeCategory.tokens));
      usedTokens = Math.max(0, context.maxTokens - remainingTokens);
    } else {
      usedTokens = Math.max(0, Math.min(context.maxTokens, nonFreeTokens));
      remainingTokens = Math.max(0, context.maxTokens - usedTokens);
    }
  }

  const remainingRatio = context.maxTokens > 0 ? remainingTokens / context.maxTokens : 0;

  return {
    usedTokens,
    remainingTokens,
    remainingRatio,
    usedRatio: context.maxTokens > 0 ? usedTokens / context.maxTokens : 0,
  };
}

export function buildContextIndicatorTitle(
  context: RunnerChatThreadContext | RunnerChatThreadContextDetails | null,
  hasThread: boolean,
  isLoading: boolean,
): string {
  if (!hasThread) {
    return "Conversation context remaining";
  }
  if (!context) {
    return isLoading ? "Loading conversation context…" : "Conversation context remaining";
  }

  const displayMetrics = deriveThreadContextDisplayMetrics(context);
  const remainingPercent = Math.round(displayMetrics.remainingRatio * 100);
  const qualifier = context.exact ? "" : " (estimate)";
  return `Conversation context remaining: ${remainingPercent}%${qualifier} • ${formatCompactTokenCount(displayMetrics.remainingTokens)} / ${formatCompactTokenCount(context.maxTokens)} tokens`;
}

export function getContextCategoryDisplayTokens(
  category: RunnerChatThreadContextCategory,
  metrics: RunnerChatThreadContextDisplayMetrics,
): number {
  if (category.key === "free_space") {
    return metrics.remainingTokens;
  }
  return Math.max(0, category.tokens);
}

export function parseThreadContextCommand(input: string): ParsedThreadContextCommand | null {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  if (/^\/context\s*$/i.test(trimmed)) {
    return { action: "context" };
  }
  const compactMatch = trimmed.match(/^\/compact(?:\s+([\s\S]+))?$/i);
  if (compactMatch) {
    return {
      action: "compact",
      prompt: compactMatch[1]?.trim() || "",
    };
  }
  if (/^\/clear\s*$/i.test(trimmed)) {
    return { action: "clear" };
  }
  const forkMatch = trimmed.match(/^\/fork(?:\s+([\s\S]+))?$/i);
  if (forkMatch) {
    return {
      action: "fork",
      prompt: forkMatch[1]?.trim() || "",
    };
  }
  const btwMatch = trimmed.match(/^\/btw(?:\s+([\s\S]+))?$/i);
  if (btwMatch) {
    return {
      action: "btw",
      prompt: btwMatch[1]?.trim() || "",
    };
  }
  return null;
}

export function threadContextCategoryColor(category: RunnerChatThreadContextCategory): string {
  if (category.key === "system_prompt") return "#67e8f9";
  if (category.key === "skills") return "#60a5fa";
  if (category.key === "messages") return "#f8fafc";
  if (category.key === "autocompact_buffer") return "#fbbf24";
  if (category.key === "free_space") return "rgba(255, 255, 255, 0.18)";
  return "rgba(255, 255, 255, 0.4)";
}

export function stagedThreadContextCommandTone(
  action: RunnerChatThreadContextAction | null,
): StagedThreadContextCommandTone | null {
  if (action === "compact") return "compact";
  if (action === "btw") return "btw";
  if (action === "fork") return "fork";
  if (action === "clear") return "neutral";
  return null;
}

export function stagedThreadContextCommandOffset(action: RunnerChatThreadContextAction | null): string {
  if (action === "compact") return "82px";
  if (action === "clear") return "58px";
  if (action === "fork") return "52px";
  if (action === "btw") return "52px";
  return "16px";
}

export function threadContextActionAllowsPrompt(action: RunnerChatThreadContextAction | null): boolean {
  return action === "compact" || action === "btw" || action === "fork";
}

export function parseAutoStageThreadContextCommand(
  input: string,
): { action: RunnerChatThreadContextAction; prompt: string } | null {
  const compactMatch = input.match(/^\/compact(?:\s+([\s\S]*))?$/i);
  if (compactMatch) {
    return {
      action: "compact",
      prompt: compactMatch[1] || "",
    };
  }

  const btwMatch = input.match(/^\/btw(?:\s+([\s\S]*))?$/i);
  if (btwMatch) {
    return {
      action: "btw",
      prompt: btwMatch[1] || "",
    };
  }

  const forkMatch = input.match(/^\/fork(?:\s+([\s\S]*))?$/i);
  if (forkMatch) {
    return {
      action: "fork",
      prompt: forkMatch[1] || "",
    };
  }

  return null;
}

export function formatThreadContextCommandText(
  action: RunnerChatThreadContextAction,
  prompt?: string,
): string {
  const trimmedPrompt = prompt?.trim();
  if (trimmedPrompt && threadContextActionAllowsPrompt(action)) {
    return `/${action} ${trimmedPrompt}`;
  }
  return `/${action}`;
}

export function isThreadContextCommandPrompt(
  prompt: string,
  action?: string | null,
): boolean {
  const trimmed = prompt.trim();
  if (!trimmed.startsWith("/")) {
    return false;
  }
  if (!action) {
    return /^\/(compact|clear|fork|btw)\b/i.test(trimmed);
  }
  const escapedAction = action.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^/${escapedAction}\\b`, "i").test(trimmed);
}
