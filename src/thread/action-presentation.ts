import type { RunnerThreadAction } from "./types.js";
import { isRunnerThreadGenericActivityGroupLabel } from "./working-label.js";

export type RunnerThreadActionIconKind =
  | "browser"
  | "code"
  | "connector"
  | "database"
  | "file"
  | "file_add"
  | "file_delete"
  | "generic"
  | "git"
  | "search"
  | "subagent"
  | "terminal"
  | "test"
  | "todo"
  | "web";

export type RunnerThreadActionPresentationCategory =
  | "browser"
  | "code"
  | "connector"
  | "database"
  | "file"
  | "git"
  | "search"
  | "subagent"
  | "terminal"
  | "test"
  | "todo"
  | "web"
  | "work";

export interface RunnerThreadActionPresentation {
  title: string;
  iconKind: RunnerThreadActionIconKind;
  category: RunnerThreadActionPresentationCategory;
}

export interface DescribeRunnerThreadActivityGroupInput {
  title?: unknown;
  status?: unknown;
  category?: unknown;
  actions: readonly RunnerThreadAction[];
}

const GENERIC_ACTION_LABELS = new Set([
  "action",
  "action summary",
  "command",
  "command execution",
  "completed an action",
  "executed unknown",
  "function",
  "function call",
  "recorded action",
  "tool",
  "tool call",
  "tool execution",
  "unknown",
  "unknown tool",
  "worker action",
]);

const GENERIC_TERMINAL_LABELS = new Set([
  "execute command",
  "execute local command",
  "run command",
  "run local command",
  "run local commands",
  "run terminal command",
  "running local command",
  "running local commands",
]);

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== "string" || !value.trim().startsWith("{")) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function normalizeLabel(value: unknown): string {
  return text(value)
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function recordText(
  records: readonly (Record<string, unknown> | null)[],
  ...keys: string[]
): string {
  for (const record of records) {
    for (const key of keys) {
      const value = text(record?.[key]);
      if (value) return value;
    }
  }
  return "";
}

function filename(value: string): string {
  return value.split(/[\\/]/).filter(Boolean).at(-1) || "file";
}

function sentenceCase(value: string): string {
  const normalized = value.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  return normalized
    ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`
    : "Completed an action";
}

function isCompleted(action: RunnerThreadAction): boolean {
  return ["completed", "succeeded", "success"].includes(
    normalizeLabel(action.status),
  );
}

function isUsefulValue(value: string): boolean {
  const normalized = normalizeLabel(value);
  return Boolean(normalized && normalized !== "unknown" && normalized !== "null");
}

function isHumanLabel(value: string, toolName = ""): boolean {
  const normalized = normalizeLabel(value);
  if (!normalized || GENERIC_ACTION_LABELS.has(normalized)) return false;
  if (normalized === normalizeLabel(toolName)) return false;
  if (/^(?:executed|completed|running)\s+unknown$/.test(normalized)) return false;
  if (/^[a-z0-9]+(?:_[a-z0-9]+)+$/.test(value.trim())) return false;
  return true;
}

function presentationRecords(action: RunnerThreadAction): {
  input: Array<Record<string, unknown> | null>;
  output: Array<Record<string, unknown> | null>;
  metadata: Record<string, unknown> | null;
} {
  const metadata = asRecord(action.metadata);
  const metadataInput = asRecord(metadata?.toolInput)
    || asRecord(metadata?.input)
    || asRecord(metadata?.args);
  const metadataOutput = asRecord(metadata?.output)
    || asRecord(metadata?.result);
  return {
    input: [asRecord(action.input), metadataInput, metadata],
    output: [asRecord(action.output), metadataOutput, metadata],
    metadata,
  };
}

function scalarInputText(action: RunnerThreadAction): string {
  const metadata = asRecord(action.metadata);
  for (const candidate of [
    action.input,
    metadata?.toolInput,
    metadata?.input,
    metadata?.args,
  ]) {
    if (typeof candidate === "string" && candidate.trim() && !candidate.trim().startsWith("{")) {
      return candidate.trim();
    }
  }
  return "";
}

function commonCommandPresentation(
  command: string,
  completed: boolean,
): RunnerThreadActionPresentation {
  const normalized = command.trim();
  if (/\b(?:vitest|jest|pytest|npm\s+(?:run\s+)?test|pnpm\s+(?:run\s+)?test|cargo\s+test)\b/i.test(normalized)) {
    return {
      title: completed ? "Ran tests" : "Running tests",
      iconKind: "test",
      category: "test",
    };
  }
  if (/\b(?:tsc|typecheck|lint|build)\b/i.test(normalized)) {
    return {
      title: completed ? "Ran validation checks" : "Running validation checks",
      iconKind: "code",
      category: "code",
    };
  }
  if (/(?:^|[;&|]\s*)(?:rg|grep)\b/i.test(normalized)) {
    return {
      title: completed ? "Searched files" : "Searching files",
      iconKind: "search",
      category: "search",
    };
  }
  if (/(?:^|[;&|]\s*)(?:find|fd|ls|tree)\b/i.test(normalized)) {
    return {
      title: completed ? "Listed files" : "Listing files",
      iconKind: "file",
      category: "file",
    };
  }
  if (/(?:^|[;&|]\s*)(?:cat|head|tail|sed)\b/i.test(normalized)) {
    return {
      title: completed ? "Read files" : "Reading files",
      iconKind: "file",
      category: "file",
    };
  }
  if (/^\s*git\s+(?:status|diff|show|log)\b/i.test(normalized)) {
    return {
      title: completed ? "Inspected repository changes" : "Inspecting repository changes",
      iconKind: "git",
      category: "git",
    };
  }
  if (/^\s*git\s+commit\b/i.test(normalized)) {
    return {
      title: completed ? "Created a git commit" : "Creating a git commit",
      iconKind: "git",
      category: "git",
    };
  }
  if (/\b(?:apply_patch|write_file|edit_file)\b/i.test(normalized)) {
    return {
      title: completed ? "Updated workspace files" : "Updating workspace files",
      iconKind: "file",
      category: "file",
    };
  }
  if (/(?:^|[;&|]\s*)(?:curl|wget)\b/i.test(normalized)) {
    return {
      title: completed ? "Reviewed a web source" : "Reviewing a web source",
      iconKind: "web",
      category: "web",
    };
  }
  return {
    title: completed ? "Ran Bash Command" : "Running Bash Command",
    iconKind: "terminal",
    category: "terminal",
  };
}

export function presentRunnerThreadAction(
  action: RunnerThreadAction,
): RunnerThreadActionPresentation {
  const records = presentationRecords(action);
  const metadata = records.metadata;
  const completed = isCompleted(action);
  const toolName = text(action.toolName)
    || recordText([metadata], "toolName", "tool_name", "tool");
  const permissionActionId = recordText(
    [metadata],
    "permissionActionId",
    "permission_action_id",
  );
  const permissionActionLabel = recordText(
    [metadata],
    "permissionActionLabel",
    "permission_action_label",
  );
  const searchable = normalizeLabel([
    action.type,
    action.title,
    action.summary,
    toolName,
    permissionActionId,
    permissionActionLabel,
  ]
    .map(text)
    .join(" "));
  const description = recordText(
    records.input,
    "description",
    "label",
    "summary",
  );
  const command = recordText(records.input, "command", "cmd", "script");
  const scalarInput = scalarInputText(action);
  const scalarFilePath = /read file|write file|edit file|create file|delete file/.test(searchable)
    && /^(?:[./~]|[A-Za-z]:[\\/])/.test(scalarInput)
    ? scalarInput
    : "";
  const path = recordText(
    records.output,
    "filePath",
    "file_path",
    "path",
  ) || recordText(records.input, "filePath", "file_path", "path")
    || scalarFilePath
    || text(action.touchedResources?.[0]?.path);
  const fileName = path ? filename(path) : "";
  const changeKind = normalizeLabel(
    recordText(records.output, "type", "changeKind", "change_kind"),
  );

  if (/todo(?: write)?|task list|list todo/.test(searchable)) {
    return {
      title: completed ? "Updated the task list" : "Updating the task list",
      iconKind: "todo",
      category: "todo",
    };
  }

  const query = recordText(records.output, "query", "searchQuery", "search_query")
    || recordText(records.input, "query", "searchQuery", "search_query")
    || (/websearch|web search|searching web|internet search/.test(searchable) ? scalarInput : "");
  if (query || /websearch|web search|searching web|internet search/.test(searchable)) {
    return {
      title: query ? `Searched the web for “${query}”` : "Searched the web",
      iconKind: "search",
      category: "search",
    };
  }

  const url = recordText(records.output, "url", "uri")
    || recordText(records.input, "url", "uri")
    || (/webfetch|web fetch|fetching web|http request/.test(searchable) ? scalarInput : "");
  if (url || /webfetch|web fetch|fetching web|http request/.test(searchable)) {
    if (url) {
      try {
        return {
          title: `Reviewed ${new URL(url).hostname.replace(/^www\./, "")}`,
          iconKind: "web",
          category: "web",
        };
      } catch {
        // Use the stable fallback below for non-URL runtime values.
      }
    }
    return {
      title: "Reviewed a web source",
      iconKind: "web",
      category: "web",
    };
  }

  const isFileDelete = changeKind === "delete"
    || changeKind === "deleted"
    || /delete file|remove file|unlink file/.test(searchable);
  const isFileCreate = changeKind === "create"
    || changeKind === "created"
    || /create file|write new file/.test(searchable);
  const isFileWrite = /write file|edit file|update file|file write|file change|apply patch/.test(searchable);
  const isFileRead = /read file|read files|file read/.test(searchable);
  const isFileSearch = /grep|search files|search file/.test(searchable);
  const isFileList = /glob|list files|find files/.test(searchable);

  if (isFileSearch) {
    return {
      title: fileName ? `Searched ${fileName}` : "Searched files",
      iconKind: "search",
      category: "search",
    };
  }
  if (isFileList) {
    return {
      title: "Listed files",
      iconKind: "file",
      category: "file",
    };
  }
  if (isFileRead) {
    return {
      title: `${completed ? "Read" : "Reading"} ${fileName || "a file"}`,
      iconKind: "file",
      category: "file",
    };
  }
  if (path || isFileWrite || isFileCreate || isFileDelete) {
    const target = fileName || "a file";
    if (isFileCreate) {
      return {
        title: `${completed ? "Created" : "Creating"} ${target}`,
        iconKind: "file_add",
        category: "file",
      };
    }
    if (isFileDelete) {
      return {
        title: `${completed ? "Deleted" : "Deleting"} ${target}`,
        iconKind: "file_delete",
        category: "file",
      };
    }
    return {
      title: `${completed ? "Updated" : "Updating"} ${target}`,
      iconKind: "file",
      category: "file",
    };
  }

  if (/database|sql|firestore|postgres/.test(searchable)) {
    const label = isHumanLabel(text(action.title), toolName)
      ? text(action.title)
      : permissionActionLabel || "Queried a database";
    return { title: sentenceCase(label), iconKind: "database", category: "database" };
  }

  if (/subagent|delegate|agent invocation/.test(searchable)) {
    const label = isHumanLabel(text(action.title), toolName)
      ? text(action.title)
      : description || "Delegated work";
    return { title: sentenceCase(label), iconKind: "subagent", category: "subagent" };
  }

  if (/connector|mcp|webhook/.test(searchable)) {
    const label = isHumanLabel(text(action.title), toolName)
      ? text(action.title)
      : permissionActionLabel || description || "Used a connector";
    return { title: sentenceCase(label), iconKind: "connector", category: "connector" };
  }

  if (/browser|computer action|computer_action/.test(searchable)) {
    const label = isHumanLabel(text(action.title), toolName)
      ? text(action.title)
      : permissionActionLabel || description || "Used the browser";
    return { title: sentenceCase(label), iconKind: "browser", category: "browser" };
  }

  const usefulCommand = isUsefulValue(command)
    ? command
    : isUsefulValue(scalarInput) && /terminal|shell|command|local_shell/.test(searchable)
      ? scalarInput
      : "";
  if (usefulCommand || /terminal|shell|command|local_shell/.test(searchable)) {
    const deleteMatch = /^\s*rm(?:\s+-\S+)*\s+([^;&|]+)/i.exec(usefulCommand);
    if (deleteMatch?.[1]) {
      return {
        title: `Deleted ${filename(deleteMatch[1].trim())}`,
        iconKind: "file_delete",
        category: "file",
      };
    }
    if (usefulCommand) return commonCommandPresentation(usefulCommand, completed);
    const label = isHumanLabel(description, toolName)
      ? description
      : isHumanLabel(text(action.title), toolName)
        ? text(action.title)
        : isHumanLabel(permissionActionLabel, toolName)
          ? permissionActionLabel
          : "";
    const genericLabel = GENERIC_TERMINAL_LABELS.has(normalizeLabel(label));
    return {
      title: label && !genericLabel
        ? sentenceCase(label)
        : completed ? "Ran Bash Command" : "Running Bash Command",
      iconKind: "terminal",
      category: "terminal",
    };
  }

  if (/function|code|script/.test(searchable)) {
    const label = isHumanLabel(text(action.title), toolName)
      ? text(action.title)
      : description || permissionActionLabel || "Ran code";
    return { title: sentenceCase(label), iconKind: "code", category: "code" };
  }

  const title = [
    text(action.title),
    permissionActionLabel,
    description,
    text(action.summary),
    toolName,
  ].find((candidate) => isHumanLabel(candidate, toolName));
  return {
    title: sentenceCase(title || toolName || action.type || "Completed an action"),
    iconKind: "generic",
    category: "work",
  };
}

export function describeRunnerThreadAction(action: RunnerThreadAction): string {
  return presentRunnerThreadAction(action).title;
}

function categoryGroupTitle(
  category: RunnerThreadActionPresentationCategory,
  count: number,
): string {
  if (category === "terminal") return count > 1 ? `Ran ${count} local commands` : "Ran local commands";
  if (category === "test") return "Ran tests and checks";
  if (category === "git") return "Worked with repository changes";
  if (category === "file") return count > 1 ? `Updated ${count} workspace files` : "Updated a workspace file";
  if (category === "search" || category === "web") return "Researched external sources";
  if (category === "todo") return "Updated the task plan";
  if (category === "connector") return "Worked with connected services";
  if (category === "database") return "Worked with database records";
  if (category === "subagent") return "Delegated work to agents";
  if (category === "browser") return "Worked in the browser";
  if (category === "code") return "Executed application code";
  return "Completed recorded actions";
}

function observerCategoryTitle(category: unknown, status: unknown): string {
  const normalizedCategory = normalizeLabel(category);
  const completed = ["completed", "sealed", "success", "succeeded"].includes(
    normalizeLabel(status),
  );
  if (normalizedCategory === "investigate") {
    return completed ? "Inspected workspace context" : "Inspecting workspace context";
  }
  if (normalizedCategory === "research") {
    return completed ? "Researched external sources" : "Researching external sources";
  }
  if (normalizedCategory === "implement") {
    return completed ? "Updated workspace files" : "Updating workspace files";
  }
  if (normalizedCategory === "verify") {
    return completed ? "Ran tests and checks" : "Running tests and checks";
  }
  if (normalizedCategory === "delegate") {
    return completed ? "Delegated work to agents" : "Delegating work to agents";
  }
  if (normalizedCategory === "publish") {
    return completed ? "Published changes" : "Publishing changes";
  }
  if (normalizedCategory === "generate") {
    return completed ? "Generated media" : "Generating media";
  }
  return completed ? "Completed task execution" : "Executing the task plan";
}

export function describeRunnerThreadActivityGroup({
  title,
  status,
  category,
  actions,
}: DescribeRunnerThreadActivityGroupInput): string {
  const existingTitle = text(title);
  if (!isRunnerThreadGenericActivityGroupLabel(existingTitle)) return existingTitle;
  if (actions.length === 0) return observerCategoryTitle(category, status);

  const presentations = actions.map(presentRunnerThreadAction);
  const uniqueTitles = [...new Set(presentations.map((entry) => entry.title).filter(Boolean))];
  if (uniqueTitles.length === 1) return uniqueTitles[0] || existingTitle || "Recorded activity";

  const categories = [...new Set(presentations.map((entry) => entry.category))];
  if (categories.length === 1 && categories[0]) {
    return categoryGroupTitle(categories[0], actions.length);
  }

  const concrete = presentations.find((entry) =>
    ["file", "search", "web", "database", "connector", "subagent"].includes(entry.category),
  );
  return concrete?.title || uniqueTitles[0] || observerCategoryTitle(category, status);
}
