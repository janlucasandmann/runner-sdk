import type { RunnerLog } from "../../../../types.js";
import {
  parseStructuredCommandExecutionOutput,
  resolveCommandOutputText,
} from "./structured-command-output.js";

export interface RunnerProjectScopedListDetails {
  projectId: string;
  projectName: string;
  itemCount: number | null;
}

interface RunnerProjectScopedListOptions {
  resource: "tasks" | "releases";
  countLabels: readonly string[];
}

function decodeCommandArgument(value: string): string {
  const normalized = String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/[;&|]+$/, "");
  try {
    return decodeURIComponent(normalized);
  } catch {
    return normalized;
  }
}

function extractProjectName(
  value: unknown,
  projectId: string,
  depth = 0,
): string {
  if (!value || depth > 5) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("[")))
      return "";
    try {
      return extractProjectName(JSON.parse(trimmed), projectId, depth + 1);
    } catch {
      return "";
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const name = extractProjectName(item, projectId, depth + 1);
      if (name) return name;
    }
    return "";
  }
  if (typeof value !== "object") return "";

  const source = value as Record<string, unknown>;
  const recordProjectId = String(
    source.projectId ||
      source.project_id ||
      (source.id === projectId ? source.id : "") ||
      "",
  ).trim();
  for (const key of ["projectName", "project_name"]) {
    const candidate = source[key];
    if (typeof candidate === "string" && candidate.trim())
      return candidate.trim();
  }
  if (recordProjectId === projectId) {
    for (const key of ["name", "title"]) {
      const candidate = source[key];
      if (typeof candidate === "string" && candidate.trim())
        return candidate.trim();
    }
  }
  for (const key of [
    "project",
    "data",
    "result",
    "payload",
    "stdout",
    "output",
    "tasks",
    "releases",
    "milestones",
    "items",
  ]) {
    const name = extractProjectName(source[key], projectId, depth + 1);
    if (name) return name;
  }
  return "";
}

function extractItemCount(
  output: string,
  countLabels: readonly string[],
): number | null {
  for (const label of countLabels) {
    const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const countMatch = output.match(
      new RegExp(`\\b${escapedLabel}\\s+COUNT\\s*:\\s*(\\d+)\\b`, "i"),
    );
    if (countMatch?.[1]) return Number.parseInt(countMatch[1], 10);
  }

  const trimmed = output.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("[")))
    return null;
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed)) return parsed.length;
    if (parsed && typeof parsed === "object") {
      const source = parsed as Record<string, unknown>;
      for (const key of [
        "tasks",
        "releases",
        "milestones",
        "items",
        "data",
        "results",
      ]) {
        if (Array.isArray(source[key])) return source[key].length;
      }
    }
  } catch {
    return null;
  }
  return null;
}

function extractApiProjectId(
  command: string,
  resource: RunnerProjectScopedListOptions["resource"],
): string {
  const queryResource =
    resource === "releases" ? "(?:releases|milestones)" : "tasks";
  const queryMatch = command.match(
    new RegExp(
      `(?:/api/real)?/${queryResource}\\?[^\\s'";&|]*\\bprojectId=([^\\s&'";|]+)`,
      "i",
    ),
  );
  if (queryMatch?.[1]) return queryMatch[1];
  if (resource === "releases") {
    return (
      command.match(
        /(?:\/api\/real)?\/projects\/([^\s/'";&|]+)\/(?:releases|milestones)\b/i,
      )?.[1] || ""
    );
  }
  return "";
}

/** Recognizes a successful, read-only list operation scoped to one project. */
export function parseRunnerProjectScopedListDetails(
  log: RunnerLog,
  options: RunnerProjectScopedListOptions,
): RunnerProjectScopedListDetails | null {
  const command = String(log.metadata?.command || log.message || "").trim();
  if (!command) return null;

  const cliResource = options.resource === "releases" ? "releases" : "tasks";
  const isCliList = new RegExp(
    `manage-tasks(?:\\.py)?\\s+${cliResource}\\s+list\\b`,
    "i",
  ).test(command);
  const apiProjectId = extractApiProjectId(command, options.resource);
  if (!isCliList && !apiProjectId) return null;
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0)
    return null;

  const structuredOutput = parseStructuredCommandExecutionOutput(
    log.metadata?.output,
  );
  if (
    structuredOutput?.interrupted ||
    structuredOutput?.returnCodeInterpretation === "timeout"
  )
    return null;

  const cliProjectMatch = command.match(
    /--project-id(?:=|\s+)(?:"([^"]+)"|'([^']+)'|([^\s|;&]+))/i,
  );
  const projectId = decodeCommandArgument(
    cliProjectMatch?.[1] ||
      cliProjectMatch?.[2] ||
      cliProjectMatch?.[3] ||
      apiProjectId,
  );
  if (!projectId) return null;

  const output = resolveCommandOutputText(log.metadata?.output, "stdout");
  return {
    projectId,
    projectName: extractProjectName(log.metadata?.output, projectId),
    itemCount: extractItemCount(output, options.countLabels),
  };
}
