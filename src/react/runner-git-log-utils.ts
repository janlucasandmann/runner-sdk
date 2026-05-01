import type { RunnerLog } from "../types.js";
import { stripRunnerSystemTags } from "./runner-markdown.js";

export type GitStructuredCommandExecutionOutput = {
  stdout: string;
  stderr: string;
  returnCodeInterpretation: string | null;
  interrupted: boolean | null;
};

export function parseGitStructuredCommandExecutionOutput(output: unknown): GitStructuredCommandExecutionOutput | null {
  const visit = (value: unknown): GitStructuredCommandExecutionOutput | null => {
    if (value == null) return null;
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) return nested;
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) return null;
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (typeof value !== "object") return null;

    const record = value as Record<string, unknown>;
    if (Object.prototype.hasOwnProperty.call(record, "stdout") || Object.prototype.hasOwnProperty.call(record, "stderr")) {
      return {
        stdout: typeof record.stdout === "string" ? record.stdout : "",
        stderr: typeof record.stderr === "string" ? record.stderr : "",
        returnCodeInterpretation:
          typeof record.returnCodeInterpretation === "string" && record.returnCodeInterpretation.trim()
            ? record.returnCodeInterpretation.trim()
            : null,
        interrupted: typeof record.interrupted === "boolean" ? record.interrupted : null,
      };
    }

    for (const candidate of [record.result, record.payload, record.data, record.structuredContent, record.structured_content]) {
      const nested = visit(candidate);
      if (nested) return nested;
    }
    return null;
  };

  return visit(output);
}

function extractShellPayload(command: string): string | null {
  const patterns = [
    /^\s*(?:\/bin\/)?bash\s+-lc\s+"([\s\S]*)"\s*$/,
    /^\s*(?:\/bin\/)?bash\s+-lc\s+'([\s\S]*)'\s*$/,
    /^\s*(?:\/bin\/)?sh\s+-lc\s+"([\s\S]*)"\s*$/,
    /^\s*(?:\/bin\/)?sh\s+-lc\s+'([\s\S]*)'\s*$/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (!match?.[1]) continue;
    return match[1]
      .replace(/\\"/g, `"`)
      .replace(/\\'/g, `'`)
      .replace(/\\\\/g, `\\`);
  }
  return null;
}

export function formatShellCommandForGitParsing(command: string): string {
  const payload = extractShellPayload(command);
  return payload ? payload.trim() : command.trim();
}

export function extractGitQuotedArgument(command: string, flagPattern: string): string | null {
  const flagRegex = new RegExp(`(?:${flagPattern})\\s+`, "i");
  const match = command.match(flagRegex);
  if (!match || match.index === undefined) return null;
  const rest = command.slice(match.index + match[0].length);
  const first = rest[0];
  if (first === `"` || first === `'`) {
    let value = "";
    for (let index = 1; index < rest.length; index += 1) {
      const current = rest[index];
      if (current === "\\" && index + 1 < rest.length) {
        value += rest[index + 1];
        index += 1;
        continue;
      }
      if (current === first) break;
      value += current;
    }
    return value.trim();
  }
  const unquoted = rest.match(/^(\S+)/);
  return unquoted ? unquoted[1].trim() : null;
}

function stripRunnerAnsiControlCodes(value: string): string {
  return value.replace(/\u001b\[[0-?]*[ -/]*[@-~]/g, "");
}

export function getGitCommandOutputText(log: RunnerLog): string {
  const parsedOutput = parseGitStructuredCommandExecutionOutput(log.metadata?.output);
  const output = parsedOutput
    ? [parsedOutput.stdout, parsedOutput.stderr].filter((value) => value.trim().length > 0).join("\n")
    : String(log.metadata?.output || "");
  return stripRunnerAnsiControlCodes(stripRunnerSystemTags(output));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function gitCommandIncludesSubcommand(command: string, subcommand: string): boolean {
  const displayCommand = formatShellCommandForGitParsing(stripRunnerSystemTags(command || ""));
  if (!displayCommand) return false;
  const subcommandPattern = escapeRegExp(subcommand);
  return new RegExp(`\\bgit(?:\\s+(?:"[^"]*"|'[^']*'|[^\\s;&|]+))*\\s+${subcommandPattern}\\b`, "i").test(displayCommand);
}

export function isSuccessfulGitCommandLog(log: RunnerLog, subcommand: string): boolean {
  const command = log.metadata?.command || log.message || "";
  if (!gitCommandIncludesSubcommand(command, subcommand)) return false;
  if (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) return false;

  const parsedOutput = parseGitStructuredCommandExecutionOutput(log.metadata?.output);
  if (parsedOutput?.returnCodeInterpretation === "timeout" || parsedOutput?.interrupted) return false;
  return true;
}

export function parsePositiveInteger(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function formatRunnerUnitCount(count: number, singular: string, plural = `${singular}s`): string {
  return `${count.toLocaleString()} ${count === 1 ? singular : plural}`;
}
