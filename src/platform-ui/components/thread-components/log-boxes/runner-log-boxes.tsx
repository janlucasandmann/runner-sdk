import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Bot,
  Brain,
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsUp,
  Cloud,
  Copy,
  Cpu,
  Circle,
  CircleCheckBig,
  CircleHelp,
  Ellipsis,
  Equal,
  Eye,
  FileImage,
  FilePlus,
  FileSearch,
  FileText,
  Folder,
  Globe,
  Github,
  HardDrive,
  Lightbulb,
  ListChevronsUpDown,
  ListTodo,
  Mail,
  MessageSquare,
  Monitor,
  MousePointerClick,
  Route,
  Paperclip,
  Rocket,
  Search,
  Server,
  SlidersHorizontal,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  User,
  X,
} from "lucide-react";
import type { RunnerLog } from "../../../../types.js";
import {
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  buildRunnerPreviewHtmlDocument,
  getRunnerDocumentPreviewKind,
  type RunnerPreviewAttachment,
  type RunnerWebSearchPreviewData,
} from "../document-preview/preview-contracts.js";
import { RunnerFileDiffSurface } from "../document-preview/file-diff-surface.js";
import { RunnerImagePreviewSurface } from "../document-preview/image-preview-surface.js";
import { parseComputerAgentsListCommandOutput, parseComputerAgentsListLogDetails, type ComputerAgentsListAgent, type ComputerAgentsListAvailableAgent } from "./agents-list-log-box.js";
import { parseComputerAgentsEnvironmentsListLogDetails } from "./environments-list-log-box.js";
import { parseTaskManagementProjectsListLogDetails } from "./projects-list-log-box.js";
import { parseAppPlatformResourcesListLogDetails } from "./resources-list-log-box.js";
import {
  parseComputerAgentsThreadGetCommandOutput,
  parseComputerAgentsThreadGetLogDetails,
  parseComputerAgentsThreadsListCommandOutput,
  parseComputerAgentsThreadsListLogDetails,
} from "./threads-list-log-box.js";
import { parseGitCommitLogDetails } from "./git-commit-log-box.js";
import { parseGitDiffLogDetails } from "./git-diff-log-box.js";
import { parseGitStatusLogDetails } from "./git-status-log-box.js";
import { LogHeader, LogPanel } from "./log-card.js";
import { RunnerMarkdown, stripRunnerSystemTags } from "../shared/runner-markdown.js";
import { DotLoader } from "../../ui/dot-loader/index.js";
import { LazyMediaPreviewMount } from "../shared/lazy-media-preview.js";
import {
  findRunnerWorkingLogJsonSegments,
} from "./working-log-json.js";
import {
  extractQuotedArgument,
  extractHeadTailReadPath,
  extractReadFilePath,
  extractWorkspacePathFromText,
  formatBytes,
  formatShellCommandForDisplay,
  getFileName,
  isRunnerLogImageFilePath,
  isRunnerLogVideoFilePath,
  isRunnerNullDevicePath,
  looksLikeMarkdown,
  normalizeRunnerFilePath,
  parseRunnerHelpCommandDetails,
  stripShellInlineComments,
  tokenizeShellLikeArguments,
  type RunnerHelpCommandDetails,
} from "./command-parsing.js";
import {
  isRunnerDetailDrawerPinnedToBottom,
  sanitizeSubagentDisplayText,
  truncateSubagentPreviewText,
} from "./presentation-utils.js";
import {
  RunnerWorkingLogJsonContent,
} from "./working-log-json-view.js";
import {
  CompactActionLogLine,
} from "./compact-action-log-line.js";
import { MetronomeWorkflowLogBox } from "./metronome-workflow-view.js";
import { PermissionRequestLogBox } from "./permission-request-view.js";
import {
  isDeepResearchCommand,
} from "./deep-research-state.js";
import {
  DeepResearchCommandLogBox,
  DeepResearchEventLogBox,
} from "./deep-research-view.js";
import {
  extractJsonStringFieldValue,
  parseStructuredCommandExecutionOutput,
  resolveCommandOutputText,
} from "./structured-command-output.js";
import { buildCompactLogPreviewId } from "./preview-id.js";
import {
  extractWorkspaceImagePathFromOutput,
  extractWorkspaceImagePathFromResult,
  isImageFileChangeLog,
  isImageUnderstandingCommand,
  isLikelyImageGenerationLog,
  isLikelyVideoGenerationLog,
  isVideoFileChangeLog,
} from "./media-state.js";
import {
  GenericImagePreviewLoadingState,
  ImageGenerationLogBox,
  ImageUnderstandingLogBox,
  VideoGenerationLogBox,
} from "./media-view.js";
import type { RunnerWorkLogEntryProps } from "./log-entry-types.js";
import {
  isListFilesLog,
  normalizeListFileName,
} from "./list-files-state.js";
import { ListFilesLogBox } from "./list-files-view.js";
export type {
  RunnerTaskPreviewClickPayload,
  RunnerWorkLogEntryProps,
} from "./log-entry-types.js";

export {
  isLikelyImageGenerationLog,
  isLikelyVideoGenerationLog,
} from "./media-state.js";

export { RunnerCodeViewer } from "./code-viewer.js";
export {
  getDeepResearchLogState,
  hasActiveDeepResearchLogGroup,
  hasDeepResearchOutput,
  isDeepResearchCommand,
} from "./deep-research-state.js";
export {
  DeepResearchDetailDrawer,
  DeepResearchLogBox,
} from "./deep-research-view.js";

function formatCompactListCount(count: number, singular: string, plural = `${singular}s`): string {
  const safeCount = Number.isFinite(count) ? Math.max(0, count) : 0;
  return `${safeCount.toLocaleString()} ${safeCount === 1 ? singular : plural}`;
}

function renderComputerAgentsListCompactLog(
  details: NonNullable<ReturnType<typeof parseComputerAgentsListLogDetails>>,
  onAgentPreviewClick?: RunnerWorkLogEntryProps["onAgentPreviewClick"]
) {
  const agents = details.agents || [];
  const firstAgent = agents.length === 1 ? agents[0] : null;
  return (
    <CompactActionLogLine
      icon={<Bot className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Listed Agents"
      detail={firstAgent?.name || formatCompactListCount(agents.length, "agent")}
      onClick={firstAgent ? () => onAgentPreviewClick?.({ agentId: firstAgent.id, agentName: firstAgent.name }) : null}
    />
  );
}

function renderComputerAgentsThreadsListCompactLog(
  details: NonNullable<ReturnType<typeof parseComputerAgentsThreadsListLogDetails>>
) {
  const threads = details.threads || [];
  const firstThread = threads.length === 1 ? threads[0] : null;
  return (
    <CompactActionLogLine
      icon={<MessageSquare className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Listed Threads"
      detail={firstThread?.title || firstThread?.id || formatCompactListCount(threads.length, "thread")}
    />
  );
}

function renderComputerAgentsThreadGetCompactLog(
  details: NonNullable<ReturnType<typeof parseComputerAgentsThreadGetLogDetails>>
) {
  const thread = details.thread;
  return (
    <CompactActionLogLine
      icon={<MessageSquare className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Retrieved Thread"
      detail={thread?.title || thread?.id || ""}
    />
  );
}

function renderAppPlatformResourcesListCompactLog(
  details: NonNullable<ReturnType<typeof parseAppPlatformResourcesListLogDetails>>
) {
  const resources = details.resources || [];
  const firstResource = resources.length === 1 ? resources[0] : null;
  return (
    <CompactActionLogLine
      icon={<Server className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Listed Resources"
      detail={firstResource?.name || formatCompactListCount(resources.length, "resource")}
    />
  );
}

function renderTaskManagementProjectsListCompactLog(
  details: NonNullable<ReturnType<typeof parseTaskManagementProjectsListLogDetails>>,
  onProjectPreviewClick?: RunnerWorkLogEntryProps["onProjectPreviewClick"]
) {
  const projects = details.projects || [];
  const firstProject = projects.length === 1 ? projects[0] : null;
  return (
    <CompactActionLogLine
      icon={<Rocket className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Listed Projects"
      detail={firstProject?.name || formatCompactListCount(projects.length, "project")}
      onClick={firstProject ? () => onProjectPreviewClick?.({ projectId: firstProject.id, projectName: firstProject.name }) : null}
    />
  );
}

function renderComputerAgentsEnvironmentsListCompactLog(
  details: NonNullable<ReturnType<typeof parseComputerAgentsEnvironmentsListLogDetails>>,
  onEnvironmentPreviewClick?: RunnerWorkLogEntryProps["onEnvironmentPreviewClick"]
) {
  const environments = details.environments || [];
  const firstEnvironment = environments.length === 1 ? environments[0] : null;
  return (
    <CompactActionLogLine
      icon={<HardDrive className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Listed Computers"
      detail={firstEnvironment?.name || formatCompactListCount(environments.length, "computer")}
      onClick={firstEnvironment ? () => onEnvironmentPreviewClick?.({ environmentId: firstEnvironment.id, environmentName: firstEnvironment.name }) : null}
    />
  );
}

function renderGitDiffCompactLog(details: NonNullable<ReturnType<typeof parseGitDiffLogDetails>>) {
  const detail = details.filesChanged > 0
    ? `${formatCompactListCount(details.filesChanged, "file")} changed`
    : `${details.linesChanged.toLocaleString()} lines changed`;
  return (
    <CompactActionLogLine
      icon={<Github className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Viewed Git Diff"
      detail={detail}
    />
  );
}

function renderGitCommitCompactLog(details: NonNullable<ReturnType<typeof parseGitCommitLogDetails>>) {
  return (
    <CompactActionLogLine
      icon={<Github className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Created Git Commit"
      detail={[details.shortSha, details.message].filter(Boolean).join(" - ")}
    />
  );
}

function renderGitStatusCompactLog(details: NonNullable<ReturnType<typeof parseGitStatusLogDetails>>) {
  return (
    <CompactActionLogLine
      icon={<Github className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Checked Git Status"
      detail={details.clean ? "Working tree clean" : `${formatCompactListCount(details.totalCount, "file")} changed`}
    />
  );
}

type RunnerFileDiffMetadata = {
  diff?: string;
  changes?: string;
  additions?: number;
  deletions?: number;
};

export type RunnerLogFileChangePreview = {
  path: string;
  kind: "created" | "modified" | "deleted";
  content?: string;
  diff?: string;
  additions?: number;
  deletions?: number;
};

const runnerLogFileChangePreviewCache = new WeakMap<RunnerLog, RunnerLogFileChangePreview[]>();

function resolveFileMapValue<T>(map: Record<string, T> | undefined, filePath?: string): T | undefined {
  if (!map || !filePath) return undefined;
  if (map[filePath] !== undefined) return map[filePath];
  const normalizedPath = filePath.replace(/^\.?\//, "").replace(/^\/workspace\//, "");
  for (const [key, value] of Object.entries(map)) {
    const normalizedKey = key.replace(/^\.?\//, "").replace(/^\/workspace\//, "");
    if (normalizedKey === normalizedPath) {
      return value;
    }
  }
  return undefined;
}

function resolveFileDiffMetadata(log: RunnerLog, filePath?: string): RunnerFileDiffMetadata | null {
  const diffs = log.metadata?.diffs as Record<string, RunnerFileDiffMetadata> | undefined;
  return resolveFileMapValue(diffs, filePath) || null;
}

function countDiffStats(diffText: string): { additions: number; deletions: number } {
  return {
    additions: (diffText.match(/^\+[^+]/gm) || []).length,
    deletions: (diffText.match(/^-[^-]/gm) || []).length,
  };
}

function buildStructuredPatchDiff(
  filePath: string,
  patches: Array<{
    oldStart?: number;
    oldLines?: number;
    newStart?: number;
    newLines?: number;
    lines?: string[];
  }>,
  operation: "created" | "modified" | "deleted"
): string {
  const normalizedPath = String(filePath || "").replace(/^\/+/, "");
  const oldHeaderPath = operation === "created" ? "/dev/null" : `a/${normalizedPath}`;
  const newHeaderPath = operation === "deleted" ? "/dev/null" : `b/${normalizedPath}`;
  const lines = [`--- ${oldHeaderPath}`, `+++ ${newHeaderPath}`];

  for (const patch of patches) {
    const oldStart = Number.isFinite(patch.oldStart) ? Number(patch.oldStart) : 1;
    const oldLines = Number.isFinite(patch.oldLines) ? Number(patch.oldLines) : 0;
    const newStart = Number.isFinite(patch.newStart) ? Number(patch.newStart) : 1;
    const newLines = Number.isFinite(patch.newLines) ? Number(patch.newLines) : 0;
    lines.push(`@@ -${oldStart},${oldLines} +${newStart},${newLines} @@`);
    if (Array.isArray(patch.lines)) {
      lines.push(...patch.lines.map((entry) => String(entry)));
    }
  }

  return lines.join("\n");
}

function buildCreatedFileDiff(filePath: string, content: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const body = lines.map((line) => `+${line}`).join("\n");
  return `--- /dev/null\n+++ b/${filePath}\n@@ -0,0 +1,${lines.length} @@\n${body}`;
}

function buildDeletedFileDiff(filePath: string, content: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const body = lines.map((line) => `-${line}`).join("\n");
  return `--- a/${filePath}\n+++ /dev/null\n@@ -1,${lines.length} +0,0 @@\n${body}`;
}

function resolveWriteDiffPreview(log: RunnerLog, filePath: string | undefined, output: string, operation: "created" | "modified" | "deleted") {
  const diffMetadata = resolveFileDiffMetadata(log, filePath);
  const diffText = stripRunnerSystemTags(
    String(
      diffMetadata?.diff ||
        diffMetadata?.changes ||
        (operation === "created" && filePath && output
          ? buildCreatedFileDiff(filePath, output)
          : operation === "deleted" && filePath && output
            ? buildDeletedFileDiff(filePath, output)
            : "")
    )
  ).trim();
  const fallbackStats = diffText ? countDiffStats(diffText) : null;
  const hasKnownCounts =
    typeof diffMetadata?.additions === "number" ||
    typeof diffMetadata?.deletions === "number" ||
    !!fallbackStats;
  return {
    diffText,
    additions: typeof diffMetadata?.additions === "number" ? diffMetadata.additions : fallbackStats?.additions ?? null,
    deletions: typeof diffMetadata?.deletions === "number" ? diffMetadata.deletions : fallbackStats?.deletions ?? null,
    hasKnownCounts,
  };
}

import {
  ComputerAgentsCreateLogBox,
  ComputerAgentsThreadSnapshotLogBox,
  isComputerAgentsThreadSnapshotLog,
  shouldRenderTaskManagementCommentLog,
  shouldRenderTaskManagementCreateLog,
  shouldRenderTaskManagementReleaseCreateLog,
  shouldRenderTaskManagementUpdateLog,
  TaskManagementCommentLogBox,
  TaskManagementCreateLogBox,
  TaskManagementReleaseCreateLogBox,
  TaskManagementUpdateLogBox,
} from "./platform-action-view.js";
export {
  collectComputerAgentsCreatedResources,
  collectTaskManagementCreatedReleases,
  isComputerAgentsMutationLog,
  shouldRenderComputerAgentsCreateLog,
} from "./platform-action-view.js";
export type {
  RunnerCreatedResourcePreview,
  RunnerCreatedResourceType,
} from "./platform-action-view.js";
import { shouldRenderComputerAgentsCreateLog } from "./platform-action-view.js";

export function getRunnerReasoningLogContent(log: RunnerLog): string {
  return stripRunnerSystemTags(log.message || "").replace(/^\*\*[^*]+\*\*\s*/, "").trim();
}

export function shouldRenderRunnerReasoningLog(log: RunnerLog): boolean {
  return getRunnerReasoningLogContent(log).length > 0;
}

function ReasoningLogBox({
  log,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const content = getRunnerReasoningLogContent(log);
  if (!content) return null;
  return (
    <div className="tb-log-reasoning">
      <RunnerMarkdown content={content} className="tb-log-reasoning-copy tb-message-markdown" onWorkspacePathClick={onWorkspacePathClick} />
    </div>
  );
}

function GenericTextLogBox({
  log,
  label,
  title,
  icon,
  onWorkspacePathClick,
}: {
  log: RunnerLog;
  timeLabel?: string;
  label: string;
  title?: string | null;
  icon: ReactNode;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const content = stripRunnerSystemTags(log.message || log.metadata?.output || "");
  const jsonSegments = useMemo(
    () => findRunnerWorkingLogJsonSegments([content], title || label || "JSON"),
    [content, label, title]
  );
  if (jsonSegments.length > 0) {
    return (
      <RunnerWorkingLogJsonContent
        segments={jsonSegments}
        documentIdPrefix={`generic-${String(title || label || "log").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase()}`}
        onWorkspacePathClick={onWorkspacePathClick}
      />
    );
  }
  const detail = content.replace(/\s+/g, " ").trim();
  return (
    <CompactActionLogLine
      icon={icon}
      title={title || label}
      detail={detail || "No details available."}
    />
  );
}

function stripLineNumbers(text: string): string {
  return text.replace(/^\s*\d+→/gm, "");
}

function isReadFileCommand(command?: string): boolean {
  if (!command) return false;
  if (extractHeadTailReadPath(command)) {
    return true;
  }
  return [
    /app-platform(?:\.py)?\s+files\s+read\b/i,
    /computer-agents(?:\.py)?\s+files\s+read\b/i,
    /^\$?\s*read_file\b/i,
    /^reading:\s+/i,
    /sed\s+-n\s+['"][^'"]*['"]\s+/,
    /\bcat\s+["']?[^|&;]+/,
    /\bless\s+["']?[^|&;]+/,
  ].some((pattern) => pattern.test(command));
}

function tryParseRunnerJson(value: string): unknown {
  const trimmed = String(value || "").trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
    return null;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

function isMkdirCommand(command?: string): boolean {
  if (!command) return false;
  return /(?:^|\n|[;&|]\s*)\$?\s*mkdir\b/i.test(command);
}

function extractMkdirPaths(command?: string): string[] {
  if (!command) return [];
  const normalizedCommand = stripShellInlineComments(command);
  const match = normalizedCommand.match(/(?:^|\n|[;&|]\s*)\$?\s*mkdir\b\s+([^\n;|]+)/i);
  const args = match?.[1]
    ?.replace(/\s+\d?>&\d+[\s\S]*$/g, "")
    ?.replace(/\s+\d?>\s*\S+[\s\S]*$/g, "")
    ?.trim();
  if (!args) return [];
  return tokenizeShellLikeArguments(args)
    .filter((token) => !token.startsWith("-"))
    .filter((token) => !/^\d?>&\d+$/.test(token))
    .filter((token) => token !== "mkdir");
}

function isMkdirLog(log?: RunnerLog): boolean {
  if (!log || (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call")) {
    return false;
  }
  const command = [log.metadata?.command, log.message]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  return isMkdirCommand(command);
}

function extractWaitDurationMsFromValue(value: unknown): number | null {
  const visit = (entry: unknown): number | null => {
    if (entry == null) return null;
    if (Array.isArray(entry)) {
      for (const nested of entry) {
        const result = visit(nested);
        if (result != null) return result;
      }
      return null;
    }
    if (typeof entry === "string") {
      const parsed = tryParseRunnerJson(entry);
      if (parsed) {
        const result = visit(parsed);
        if (result != null) return result;
      }
      const sleptMatch = entry.match(/\bSlept\s+for\s+(\d+(?:\.\d+)?)\s*ms\b/i);
      if (sleptMatch) {
        const milliseconds = Number(sleptMatch[1]);
        return Number.isFinite(milliseconds) ? milliseconds : null;
      }
      return null;
    }
    if (typeof entry !== "object") return null;

    const record = entry as Record<string, unknown>;
    const directDuration =
      typeof record.duration_ms === "number" ? record.duration_ms :
      typeof record.durationMs === "number" ? record.durationMs :
      typeof record.duration === "number" && String(record.unit || "").toLowerCase() === "ms" ? record.duration :
      null;
    const message = typeof record.message === "string" ? record.message : "";
    if (directDuration != null && Number.isFinite(directDuration) && /\bSlept\b|\bWaited\b/i.test(message)) {
      return directDuration;
    }

    const nestedCandidates = [
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
      record.output,
      record.stdout,
    ];
    for (const candidate of nestedCandidates) {
      const result = visit(candidate);
      if (result != null) return result;
    }
    return null;
  };

  return visit(value);
}

function extractWaitDurationSeconds(log?: RunnerLog): number | null {
  if (!log || (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call")) {
    return null;
  }

  const command = stripRunnerSystemTags([log.metadata?.command, log.message]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n"));
  const commandDurationMatch =
    command.match(/(?:^|\n|[;&|]\s*)\$?\s*sleep\s+(\d+(?:\.\d+)?)(ms|s|m)?\b/i) ||
    command.match(/(?:^|\n)\s*\$?\s*Sleep(?:\s+(\d+(?:\.\d+)?)(ms|s|m)?)?\s*$/i);
  const structuredOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const outputDurationMs = [
    log.metadata,
    log.metadata?.output,
    log.metadata?.result,
    structuredOutput?.stdout,
    structuredOutput?.stderr,
    resolveCommandOutputText(log.metadata?.output, "stdout"),
  ]
    .map(extractWaitDurationMsFromValue)
    .find((value): value is number => value != null);

  if (outputDurationMs != null) {
    return Math.max(0, Math.round(outputDurationMs / 1000));
  }

  if (commandDurationMatch) {
    const amount = Number(commandDurationMatch[1] || "");
    if (Number.isFinite(amount)) {
      const unit = String(commandDurationMatch[2] || "s").toLowerCase();
      if (unit === "ms") return Math.max(0, Math.round(amount / 1000));
      if (unit === "m") return Math.max(0, Math.round(amount * 60));
      return Math.max(0, Math.round(amount));
    }
  }

  return null;
}

function isWaitLog(log?: RunnerLog): boolean {
  return extractWaitDurationSeconds(log) != null;
}

function WaitLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void log;
  void timeLabel;
  return null;
}

export function isReadFileLog(log?: RunnerLog): boolean {
  if (!log) return false;
  const command = [log.metadata?.command, log.message]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  const message = String(log.message || "");
  const output = resolveCommandOutputText(log.metadata?.output, "stdout");

  return (
    isReadFileCommand(command) ||
    /^Read:\s+/i.test(message) ||
    Boolean(log.metadata?.fileContents && typeof log.metadata.fileContents === "object") ||
    Boolean(extractStructuredReadFilePayload(log.metadata?.output)) ||
    /"filePath"\s*:/.test(output) ||
    /"content"\s*:/.test(output)
  );
}

function isNoopReadFileSentinelPayload(value: unknown): boolean {
  const visit = (entry: unknown): boolean => {
    if (entry == null) return false;
    if (Array.isArray(entry)) return entry.some(visit);
    if (typeof entry === "string") {
      const parsed = tryParseRunnerJson(entry);
      return parsed ? visit(parsed) : false;
    }
    if (typeof entry !== "object") return false;

    const record = entry as Record<string, unknown>;
    const hasReadSentinelShape =
      Object.prototype.hasOwnProperty.call(record, "numFiles") &&
      Object.prototype.hasOwnProperty.call(record, "filenames") &&
      Object.prototype.hasOwnProperty.call(record, "content");
    if (
      hasReadSentinelShape &&
      Number(record.numFiles) === 0 &&
      Array.isArray(record.filenames) &&
      record.filenames.length === 0 &&
      record.content == null
    ) {
      return true;
    }

    return [
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
      record.output,
      record.stdout,
    ].some(visit);
  };

  return visit(value);
}

function shouldHideNoopReadFileLog(log?: RunnerLog): boolean {
  if (!log || (log.eventType !== "command_execution" && log.eventType !== "mcp_tool_call")) {
    return false;
  }

  const command = [log.metadata?.command, log.message]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  const readPath =
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.file_path) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.path) ||
    normalizeRunnerFilePath(extractReadFilePath(command));
  const basename = readPath ? getFileName(readPath) : "";
  const readsGenericFileTarget = !readPath || basename.toLowerCase() === "file";
  if (!readsGenericFileTarget && !isReadFileCommand(command)) {
    return false;
  }

  const structuredOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const candidates: unknown[] = [
    log.metadata,
    log.metadata?.output,
    log.metadata?.result,
    structuredOutput?.stdout,
    structuredOutput?.stderr,
    resolveCommandOutputText(log.metadata?.output, "stdout"),
  ];

  return candidates.some(isNoopReadFileSentinelPayload);
}

function extractReadLineRange(command?: string): string | null {
  if (!command) return null;
  const sedRange = command.match(/sed\s+-n\s+['"](\d+),(\d+)p['"]/);
  if (sedRange) return `lines ${sedRange[1]}-${sedRange[2]}`;
  const head = command.match(/head\s+-n\s+(\d+)/);
  if (head) return `first ${head[1]} lines`;
  const compactHead = command.match(/head\s+-(\d+)(?:\s|$)/);
  if (compactHead) return `first ${compactHead[1]} lines`;
  const tail = command.match(/tail\s+-n\s+(\d+)/);
  if (tail) return `last ${tail[1]} lines`;
  const compactTail = command.match(/tail\s+-(\d+)(?:\s|$)/);
  if (compactTail) return `last ${compactTail[1]} lines`;
  return null;
}

function normalizeReadFileFailureMessage({
  content,
  output,
  stderr,
  isError,
}: {
  content?: string;
  output?: string;
  stderr?: string;
  isError?: boolean;
}): string | null {
  const candidates = [stderr, output, content]
    .map((value) => stripRunnerSystemTags(String(value || "")).trim())
    .filter(Boolean);
  if (candidates.length === 0) {
    return isError ? "failed to read file" : null;
  }

  const failurePatterns = [
    /file appears to be binary/i,
    /no such file or directory/i,
    /\bis a directory\b/i,
    /permission denied/i,
    /operation not permitted/i,
    /failed to read/i,
    /cannot read/i,
    /unable to read/i,
    /not found/i,
  ];

  for (const candidate of candidates) {
    const lines = candidate
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const matchedLine = lines.find((line) => failurePatterns.some((pattern) => pattern.test(line)));
    if (matchedLine) {
      return matchedLine.length > 180 ? `${matchedLine.slice(0, 177).trimEnd()}...` : matchedLine;
    }
  }

  if (!isError) {
    return null;
  }

  const fallbackLine = candidates[0]
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
  if (!fallbackLine) {
    return "failed to read file";
  }
  return fallbackLine.length > 180 ? `${fallbackLine.slice(0, 177).trimEnd()}...` : fallbackLine;
}

function extractStructuredReadFilePayload(output: unknown): { filePath?: string; content?: string } | null {
  const visit = (value: unknown): { filePath?: string; content?: string } | null => {
    if (value == null) {
      return null;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) {
          return nested;
        }
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const filePathCandidate =
      typeof record.filePath === "string" ? record.filePath
      : typeof record.file_path === "string" ? record.file_path
      : typeof record.path === "string" ? record.path
      : undefined;
    const contentCandidate =
      typeof record.content === "string" ? record.content
      : typeof record.text === "string" ? record.text
      : undefined;

    if (filePathCandidate || contentCandidate !== undefined) {
      return {
        ...(filePathCandidate ? { filePath: filePathCandidate } : {}),
        ...(contentCandidate !== undefined ? { content: contentCandidate } : {}),
      };
    }

    const nestedCandidates = [
      record.file,
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ];
    for (const candidate of nestedCandidates) {
      const nested = visit(candidate);
      if (nested) {
        return nested;
      }
    }
    return null;
  };

  const structured = visit(output);
  if (structured) {
    return structured;
  }

  if (typeof output !== "string") {
    return null;
  }

  const fallbackFilePath = extractJsonStringFieldValue(output, ["filePath", "file_path", "path"]);
  const fallbackContent = extractJsonStringFieldValue(output, ["content", "text"]);
  if (fallbackFilePath || fallbackContent !== null) {
    return {
      ...(fallbackFilePath ? { filePath: fallbackFilePath } : {}),
      ...(fallbackContent !== null ? { content: fallbackContent } : {}),
    };
  }

  return null;
}

function extractStructuredWriteFilePayload(output: string): {
  filePath?: string;
  content?: string;
  operation?: "created" | "modified" | "deleted";
  diffText?: string;
  additions?: number;
  deletions?: number;
} | null {
  const normalizeOperation = (value: unknown): "created" | "modified" | "deleted" | undefined => {
    const normalized = typeof value === "string" ? value.trim().toLowerCase() : "";
    if (!normalized) return undefined;
    if (normalized === "created" || normalized === "create" || normalized === "new" || normalized === "write") {
      return "created";
    }
    if (
      normalized === "modified" ||
      normalized === "modify" ||
      normalized === "updated" ||
      normalized === "update" ||
      normalized === "edit" ||
      normalized === "edited" ||
      normalized === "replace"
    ) {
      return "modified";
    }
    if (normalized === "delete" || normalized === "deleted" || normalized === "remove" || normalized === "removed") {
      return "deleted" as const;
    }
    return undefined;
  };

  const visit = (value: unknown): {
    filePath?: string;
    content?: string;
    operation?: "created" | "modified" | "deleted";
    diffText?: string;
    additions?: number;
    deletions?: number;
  } | null => {
    if (value == null) {
      return null;
    }
    if (Array.isArray(value)) {
      for (const entry of value) {
        const nested = visit(entry);
        if (nested) {
          return nested;
        }
      }
      return null;
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
        return null;
      }
      try {
        return visit(JSON.parse(trimmed));
      } catch {
        return null;
      }
    }
    if (typeof value !== "object") {
      return null;
    }

    const record = value as Record<string, unknown>;
    const filePathCandidate =
      typeof record.filePath === "string" ? record.filePath
      : typeof record.file_path === "string" ? record.file_path
      : typeof record.path === "string" ? record.path
      : undefined;
    const contentCandidate =
      typeof record.content === "string" ? record.content
      : typeof record.text === "string" ? record.text
      : typeof record.newContent === "string" ? record.newContent
      : typeof record.newString === "string" ? record.newString
      : undefined;
    const operationCandidate =
      normalizeOperation(record.operationKind)
      || normalizeOperation(record.operation_kind)
      || normalizeOperation(record.operation)
      || normalizeOperation(record.type)
      || normalizeOperation(record.mode);
    const structuredPatch = Array.isArray(record.structuredPatch)
      ? (record.structuredPatch as Array<{ oldStart?: number; oldLines?: number; newStart?: number; newLines?: number; lines?: string[] }>)
      : Array.isArray(record.structured_patch)
        ? (record.structured_patch as Array<{ oldStart?: number; oldLines?: number; newStart?: number; newLines?: number; lines?: string[] }>)
        : [];
    const gitDiff =
      typeof record.gitDiff === "string" && record.gitDiff.trim()
        ? record.gitDiff
        : typeof record.diff === "string" && record.diff.trim()
          ? record.diff
          : typeof record.changes === "string" && record.changes.trim()
            ? record.changes
            : "";
    const diffText =
      gitDiff ||
      (filePathCandidate && structuredPatch.length > 0
        ? buildStructuredPatchDiff(filePathCandidate, structuredPatch, operationCandidate || "modified")
        : "");
    const stats = diffText ? countDiffStats(diffText) : null;

    if (filePathCandidate || contentCandidate !== undefined || operationCandidate || diffText) {
      return {
        ...(filePathCandidate ? { filePath: filePathCandidate } : {}),
        ...(contentCandidate !== undefined ? { content: contentCandidate } : {}),
        ...(operationCandidate ? { operation: operationCandidate } : {}),
        ...(diffText ? { diffText } : {}),
        ...(stats ? { additions: stats.additions, deletions: stats.deletions } : {}),
      };
    }

    const nestedCandidates = [
      record.file,
      record.result,
      record.payload,
      record.data,
      record.structuredContent,
      record.structured_content,
    ];
    for (const candidate of nestedCandidates) {
      const nested = visit(candidate);
      if (nested) {
        return nested;
      }
    }
    return null;
  };

  const structured = visit(output);
  if (structured) {
    return structured;
  }

  const fallbackFilePath = extractJsonStringFieldValue(output, ["filePath", "file_path", "path"]);
  const fallbackContent = extractJsonStringFieldValue(output, ["content", "text"]);
  const fallbackOperation =
    normalizeOperation(extractJsonStringFieldValue(output, ["operationKind", "operation_kind", "operation", "type", "mode"]));
  if (fallbackFilePath || fallbackContent !== null || fallbackOperation) {
    return {
      ...(fallbackFilePath ? { filePath: fallbackFilePath } : {}),
      ...(fallbackContent !== null ? { content: fallbackContent } : {}),
      ...(fallbackOperation ? { operation: fallbackOperation } : {}),
    };
  }

  return null;
}

export function isWriteFileLog(log?: RunnerLog): boolean {
  if (!log) return false;
  const command = String(log.metadata?.command || "");
  const message = String(log.message || "");
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const structuredWrite = extractStructuredWriteFilePayload(output);
  const candidatePaths = [
    ...(Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : []),
    structuredWrite?.filePath,
    extractWriteFilePath(command),
    extractWorkspacePathFromText(message),
    extractWriteMessagePath(message),
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
  if (candidatePaths.length > 0 && candidatePaths.every((filePath) => isRunnerNullDevicePath(filePath))) {
    return false;
  }

  return (
    isWriteFileCommand(command) ||
    /^Write:\s+/i.test(message) ||
    /^Edit:\s+/i.test(message) ||
    /^Delete:\s+/i.test(message) ||
    /"structuredPatch"\s*:/.test(output) ||
    /"gitDiff"\s*:/.test(output)
  );
}

export function collectRunnerLogFileChangePreviews(log: RunnerLog): RunnerLogFileChangePreview[] {
  if (!log) {
    return [];
  }
  const cached = runnerLogFileChangePreviewCache.get(log);
  if (cached) {
    return cached;
  }
  const cacheAndReturn = (previews: RunnerLogFileChangePreview[]): RunnerLogFileChangePreview[] => {
    runnerLogFileChangePreviewCache.set(log, previews);
    return previews;
  };

  if (log.eventType === "file_change") {
    const filePaths = Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string =>
        typeof value === "string" && value.trim().length > 0 && !isRunnerNullDevicePath(value)
      )
      : [];
    if (filePaths.length === 0) {
      return cacheAndReturn([]);
    }

    const changeKinds = Array.isArray(log.metadata?.changeKinds) ? log.metadata.changeKinds : [];
    const fileContents =
      log.metadata?.fileContents && typeof log.metadata.fileContents === "object"
        ? (log.metadata.fileContents as Record<string, string>)
        : undefined;
    const diffs =
      log.metadata?.diffs && typeof log.metadata.diffs === "object"
        ? (log.metadata.diffs as Record<string, RunnerFileDiffMetadata>)
        : undefined;

    return cacheAndReturn(filePaths.map((filePath, index) => {
      const resolvedDiff = resolveFileMapValue(diffs, filePath);
      const normalizedKind = String(changeKinds[index] || "").trim().toLowerCase();
      const kind: "created" | "modified" | "deleted" =
        normalizedKind === "created"
          ? "created"
          : normalizedKind === "deleted"
            ? "deleted"
            : "modified";
      const content = resolveFileMapValue(fileContents, filePath);
      const diffText = stripRunnerSystemTags(
        String(
          resolvedDiff?.diff ||
            resolvedDiff?.changes ||
            (kind === "created" && filePath && content ? buildCreatedFileDiff(filePath, content) : "")
        )
      ).trim();
      const fallbackStats = diffText ? countDiffStats(diffText) : null;

      return {
        path: filePath,
        kind,
        ...(typeof content === "string" ? { content } : {}),
        ...(diffText ? { diff: diffText } : {}),
        ...(typeof resolvedDiff?.additions === "number"
          ? { additions: resolvedDiff.additions }
          : fallbackStats
            ? { additions: fallbackStats.additions }
            : {}),
        ...(typeof resolvedDiff?.deletions === "number"
          ? { deletions: resolvedDiff.deletions }
          : fallbackStats
            ? { deletions: fallbackStats.deletions }
            : {}),
      };
    }));
  }

  const imageGenerationCommand = typeof log.metadata?.command === "string" ? log.metadata.command : undefined;
  if (
    (log.eventType === "command_execution" || log.eventType === "mcp_tool_call") &&
    isLikelyImageGenerationLog(log, imageGenerationCommand)
  ) {
    const imagePaths = new Set<string>();
    const metadataFilePaths = Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string =>
        typeof value === "string" && value.trim().length > 0 && !isRunnerNullDevicePath(value)
      )
      : [];
    for (const filePath of metadataFilePaths) {
      if (isRunnerLogImageFilePath(filePath)) {
        imagePaths.add(filePath);
      }
    }
    if (typeof log.metadata?.savedImagePath === "string" && log.metadata.savedImagePath.trim()) {
      imagePaths.add(log.metadata.savedImagePath.trim());
    }
    const resultImagePath = extractWorkspaceImagePathFromResult(log.metadata?.result);
    if (resultImagePath) {
      imagePaths.add(resultImagePath);
    }
    const outputImagePath = extractWorkspaceImagePathFromOutput(log.metadata?.output);
    if (outputImagePath) {
      imagePaths.add(outputImagePath);
    }
    const messageImagePath = extractWorkspaceImagePathFromOutput(log.message);
    if (messageImagePath) {
      imagePaths.add(messageImagePath);
    }

    const resolvedImagePaths = Array.from(imagePaths);
    if (resolvedImagePaths.length === 0) {
      return cacheAndReturn([]);
    }

    const normalizedKind = String(log.metadata?.changeKinds?.[0] || "").trim().toLowerCase();
    const kind: "created" | "modified" | "deleted" =
      normalizedKind === "deleted"
        ? "deleted"
        : normalizedKind === "modified"
          ? "modified"
          : "created";

    return cacheAndReturn(resolvedImagePaths.map((filePath) => ({
      path: filePath,
      kind,
    })));
  }

  if (log.eventType !== "command_execution") {
    return cacheAndReturn([]);
  }

  if (!isWriteFileLog(log)) {
    const deletedFilePath = extractDeletedFilePathFromCommandOutput(log);
    if (!deletedFilePath) {
      return cacheAndReturn([]);
    }
    return cacheAndReturn([{
      path: deletedFilePath,
      kind: "deleted",
    }]);
  }

  const command = String(log.metadata?.command || "");
  const output = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const structuredWrite = extractStructuredWriteFilePayload(output);
  const filePath =
    (log.metadata?.filePaths?.[0] as string | undefined) ||
    structuredWrite?.filePath ||
    extractWriteFilePath(command) ||
    extractWorkspacePathFromText(log.message) ||
    extractWriteMessagePath(log.message) ||
    undefined;
  if (!filePath || isRunnerNullDevicePath(filePath)) {
    return cacheAndReturn([]);
  }

  const fileContents = log.metadata?.fileContents as Record<string, string> | undefined;
  const content = resolveFileMapValue(fileContents, filePath) ?? structuredWrite?.content;
  const operation = structuredWrite?.operation || deriveWriteOperation(command, log.metadata?.changeKinds?.[0]);
  const previewSource = typeof content === "string" ? content : output;
  const diffPreview = resolveWriteDiffPreview(log, filePath, previewSource, operation);
  const effectiveDiffText = String(structuredWrite?.diffText || diffPreview.diffText || "").trim();

  return cacheAndReturn([{
    path: filePath,
    kind: operation,
    ...(typeof content === "string" ? { content } : {}),
    ...(effectiveDiffText ? { diff: effectiveDiffText } : {}),
    ...(typeof structuredWrite?.additions === "number"
      ? { additions: structuredWrite.additions }
      : typeof diffPreview.additions === "number"
        ? { additions: diffPreview.additions }
        : {}),
    ...(typeof structuredWrite?.deletions === "number"
      ? { deletions: structuredWrite.deletions }
      : typeof diffPreview.deletions === "number"
        ? { deletions: diffPreview.deletions }
        : {}),
  }]);
}

function extractDeletedFilePathFromCommandOutput(log: RunnerLog): string | null {
  if (log.eventType !== "command_execution") {
    return null;
  }

  const parsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const outputText = [
    parsedOutput?.stdout || "",
    parsedOutput?.stderr || "",
    stripRunnerSystemTags(String(log.metadata?.output || "")),
  ]
    .filter((value) => typeof value === "string" && value.trim().length > 0)
    .join("\n");
  if (!/no such file or directory/i.test(outputText)) {
    return null;
  }

  const pathMatch =
    /cannot access ['"`]([^'"`\n]+)['"`]: No such file or directory/i.exec(outputText) ||
    /cannot remove ['"`]([^'"`\n]+)['"`]: No such file or directory/i.exec(outputText) ||
    /no such file or directory[^\n]*['"`]([^'"`\n]+)['"`]/i.exec(outputText);
  const resolvedPath = normalizeRunnerFilePath(pathMatch?.[1] || "");
  if (!resolvedPath || isRunnerNullDevicePath(resolvedPath)) {
    return null;
  }
  return resolvedPath;
}

function resolveReadDocumentPreviewAttachment(
  filePath: string | undefined,
  content: string,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment | null {
  const normalizedContent = String(content || "");
  const looksLikeHtml =
    /\.html?$/i.test(String(filePath || "")) ||
    /<!doctype\s+html/i.test(normalizedContent) ||
    /<html[\s>]/i.test(normalizedContent) ||
    (/<head[\s>]/i.test(normalizedContent) && /<body[\s>]/i.test(normalizedContent));
  if (!looksLikeHtml) {
    return null;
  }

  const normalizedPath = normalizeRunnerFilePath(filePath) || "/workspace/preview.html";
  const baseAttachment = buildRunnerPreviewAttachmentFromPath(normalizedPath, {
    backendUrl,
    environmentId,
    idPrefix: "log-preview",
  });
  const htmlDocument = buildRunnerPreviewHtmlDocument(normalizedContent);
  return {
    ...baseAttachment,
    filename: getFileName(normalizedPath),
    mimeType: "text/html",
    type: "document",
    htmlPreviewUrl: `data:text/html;charset=utf-8,${encodeURIComponent(htmlDocument)}`,
  };
}

function resolveReadCodePreviewAttachment(
  filePath: string | undefined,
  content: string,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment | null {
  const normalizedContent = String(content || "");
  if (!normalizedContent.trim()) {
    return null;
  }
  const normalizedPath = normalizeRunnerFilePath(filePath) || "/workspace/preview.txt";
  const filename = getFileName(normalizedPath);
  const isMarkdown = looksLikeMarkdown(normalizedContent, normalizedPath);
  const mimeType = isMarkdown ? "text/markdown" : "text/plain";
  return {
    ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
      backendUrl,
      environmentId,
      idPrefix: "log-preview-code",
    }),
    filename,
    mimeType,
    type: "document",
    previewKindOverride: isMarkdown ? "markdown" : "text",
    url: `data:${mimeType};charset=utf-8,${encodeURIComponent(normalizedContent)}`,
    previewUrl: `data:${mimeType};charset=utf-8,${encodeURIComponent(normalizedContent)}`,
  };
}

function isRenderableReadFilePath(filePath?: string | null): filePath is string {
  const normalizedPath = normalizeRunnerFilePath(filePath);
  if (!normalizedPath || isRunnerNullDevicePath(normalizedPath)) {
    return false;
  }

  const fileName = getFileName(normalizedPath).trim().toLowerCase();
  return Boolean(fileName && fileName !== "file");
}

function buildReadFilePreviewAttachment(
  filePath: string,
  content: string,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment {
  const normalizedPath = normalizeRunnerFilePath(filePath) || filePath;
  const normalizedContent = String(content || "").trim().toLowerCase();
  if (
    isRunnerLogImageFilePath(normalizedPath) ||
    normalizedContent === "read completed (no textual content found)."
  ) {
    return {
      ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
        backendUrl,
        environmentId,
        idPrefix: "log-read-file",
      }),
      workspacePath: normalizedPath,
    };
  }

  const documentPreviewAttachment = resolveReadDocumentPreviewAttachment(normalizedPath, content, backendUrl, environmentId);
  if (documentPreviewAttachment) {
    return documentPreviewAttachment;
  }

  const codePreviewAttachment = resolveReadCodePreviewAttachment(normalizedPath, content, backendUrl, environmentId);
  if (codePreviewAttachment) {
    return codePreviewAttachment;
  }

  return {
    ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
      backendUrl,
      environmentId,
      idPrefix: "log-read-file",
    }),
    workspacePath: normalizedPath,
  };
}

function ReadFileLogBox({
  log,
  backendUrl,
  environmentId,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
  onWorkspacePathClick?: (path: string) => void;
}) {
  const command = log.metadata?.command || "";
  const output = stripRunnerSystemTags(resolveCommandOutputText(log.metadata?.output, "stdout"));
  const commandOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const structuredReadPayload = extractStructuredReadFilePayload(log.metadata?.output) ||
    extractStructuredReadFilePayload(output) ||
    extractStructuredReadFilePayload(commandOutput?.stdout || "");
  const filePath =
    normalizeRunnerFilePath(log.metadata?.filePaths?.[0] as string | undefined) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.file_path) ||
    normalizeRunnerFilePath((log.metadata as { file_path?: string; path?: string } | undefined)?.path) ||
    normalizeRunnerFilePath(structuredReadPayload?.filePath) ||
    normalizeRunnerFilePath(extractReadFilePath(command)) ||
    normalizeRunnerFilePath(extractWorkspacePathFromText(log.message)) ||
    normalizeRunnerFilePath(extractWorkspacePathFromText(command));
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;
  const content = stripLineNumbers(structuredReadPayload?.content ?? commandOutput?.stdout ?? output);
  const stderr = stripRunnerSystemTags(commandOutput?.stderr || "");
  const readFailureMessage = normalizeReadFileFailureMessage({ content, output, stderr, isError });

  if (readFailureMessage || isError || !isRenderableReadFilePath(filePath)) {
    return null;
  }

  const normalizedPath = normalizeRunnerFilePath(filePath) || filePath;
  const previewAttachment = buildReadFilePreviewAttachment(normalizedPath, content, backendUrl, environmentId);

  return (
    <CompactActionLogLine
      icon={<FileText className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Read file"
      detail={normalizedPath}
      onClick={onPreviewDocument ? () => onPreviewDocument(previewAttachment) : undefined}
    />
  );
}

function isWriteFileCommand(command?: string): boolean {
  if (!command) return false;
  const isWriteLike = [
    /^\$?\s*write_file\b/i,
    /^\$?\s*edit_file\b/i,
    /\bcat\s+>+\s*/,
    /\becho\s+.*>+\s*/,
    /\bprintf\s+.*>+\s*/,
    /\btee\s+["']?[^|&;]+/,
    /\bsed\s+-i/,
    />\s*["']?\/workspace\//,
    /\bcp\s+.*["']?\/workspace\//,
    /\bmv\s+.*["']?\/workspace\//,
  ].some((pattern) => pattern.test(command));
  if (!isWriteLike) return false;
  const writeTarget = extractWriteFilePath(command);
  return !isRunnerNullDevicePath(writeTarget);
}

function extractWriteFilePath(command?: string): string | null {
  if (!command) return null;
  const patterns = [
    />+\s*["']([^"']+)["']/,
    />+\s*([^\s|&;>"']+)/,
    /\btee\s+["']([^"']+)["']/,
    /\btee\s+([^\s|&;>"']+)/,
    /\bsed\s+-i\s+['"][^'"]*['"]\s+["']([^"']+)["']/,
    /\bsed\s+-i\s+['"][^'"]*['"]\s+([^\s|&;>"']+)/,
    /\b(?:cp|mv)\s+.*\s+["']?([^\s"']+)["']?\s*$/,
    /["']?(\/workspace\/[^"'\s|&;>]+)["']?/,
  ];
  for (const pattern of patterns) {
    const match = command.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractWriteMessagePath(message?: string | null): string | null {
  const match = String(message || "").match(/^\s*(?:Write|Edit|Delete):\s+(.+?)\s*$/i);
  return normalizeRunnerFilePath(match?.[1] || "") || null;
}

function deriveWriteOperation(command?: string, changeKind?: string): "created" | "modified" {
  if (changeKind === "created") return "created";
  if (changeKind === "modified" || changeKind === "update" || changeKind === "updated") return "modified";
  if (!command) return "modified";
  if (command.includes(">>")) return "modified";
  if (/\bsed\s+-i/.test(command)) return "modified";
  if (command.includes(">") && !command.includes(">>")) return "created";
  if (/\b(?:cp|mv)\s+/.test(command)) return "created";
  return "modified";
}

function resolveWriteDocumentPreviewAttachment(
  filePath: string | undefined,
  backendUrl?: string,
  environmentId?: string | null
): RunnerPreviewAttachment | null {
  const normalizedPath = normalizeRunnerFilePath(filePath);
  if (!normalizedPath) {
    return null;
  }

  const attachment = buildRunnerPreviewAttachmentFromPath(normalizedPath, {
    backendUrl,
    environmentId,
    idPrefix: "log-preview",
  });
  if (!attachment.url || attachment.type !== "document") {
    return null;
  }

  const previewKind = getRunnerDocumentPreviewKind(attachment);
  if (previewKind !== "pdf" && previewKind !== "html" && previewKind !== "markdown") {
    return null;
  }

  return attachment;
}

function getWriteFileSummaryTitle(items: RunnerLogFileChangePreview[]): string {
  if (items.length === 0) {
    return "Files updated";
  }
  const kinds = new Set(items.map((item) => item.kind));
  const isSingular = items.length === 1;
  if (kinds.size === 1 && kinds.has("created")) {
    return isSingular ? "File created" : "Files created";
  }
  if (kinds.size === 1 && kinds.has("deleted")) {
    return isSingular ? "File deleted" : "Files deleted";
  }
  return isSingular ? "File updated" : "Files updated";
}

function getWriteFileCompactTitle(items: RunnerLogFileChangePreview[]): string {
  if (items.length === 0) {
    return "Updated files";
  }
  const kinds = new Set(items.map((item) => item.kind));
  const isSingular = items.length === 1;
  if (kinds.size === 1 && kinds.has("created")) {
    return isSingular ? "Created file" : "Created files";
  }
  if (kinds.size === 1 && kinds.has("deleted")) {
    return isSingular ? "Deleted file" : "Deleted files";
  }
  return isSingular ? "Edited file" : "Edited files";
}

function WriteFileLogGroup({
  log,
  backendUrl,
  environmentId,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  backendUrl?: string;
  environmentId?: string | null;
  requestHeaders?: HeadersInit;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const itemsByPath = new Map<string, RunnerLogFileChangePreview>();
  for (const preview of collectRunnerLogFileChangePreviews(log)) {
    const normalizedPath = normalizeRunnerFilePath(preview.path);
    if (!normalizedPath || isRunnerNullDevicePath(normalizedPath)) {
      continue;
    }
    itemsByPath.set(normalizedPath, {
      ...preview,
      path: normalizedPath,
    });
  }
  const items = Array.from(itemsByPath.values());
  if (items.length === 0) {
    return null;
  }

  function openFilePreview(item: RunnerLogFileChangePreview) {
    if (item.kind === "deleted") {
      return;
    }
    const normalizedPath = normalizeRunnerFilePath(item.path);
    if (!normalizedPath) {
      return;
    }
    onPreviewDocument?.({
      ...buildRunnerPreviewAttachmentFromPath(normalizedPath, {
        backendUrl,
        environmentId,
        idPrefix: "log-file-change",
      }),
      workspacePath: normalizedPath,
      changeKind: item.kind,
      ...(typeof item.diff === "string" && item.diff.trim() ? { diffContent: item.diff } : {}),
      ...(typeof item.content === "string" ? { fileContent: item.content } : {}),
      ...(typeof item.additions === "number" ? { diffAdditions: item.additions } : {}),
      ...(typeof item.deletions === "number" ? { diffDeletions: item.deletions } : {}),
    });
  }

  const firstItem = items[0];
  const detail = items.length === 1 && firstItem
    ? firstItem.path
    : `${items.length} files`;
  const canPreview = items.length === 1 && firstItem?.kind !== "deleted";
  const icon = firstItem?.kind === "created"
    ? <FilePlus className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />
    : <FileText className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />;
  return (
    <CompactActionLogLine
      icon={icon}
      title={getWriteFileCompactTitle(items)}
      detail={detail}
      onClick={canPreview && firstItem ? () => openFilePreview(firstItem) : undefined}
    />
  );
}

type GrepSearchMatch = {
  title: string;
  subtitle?: string;
  source?: string;
  lineNumber?: string;
};

function isGrepSearchCommand(command?: string): boolean {
  if (!command) return false;
  if (/\brg\s+--files\b/i.test(command)) {
    return false;
  }
  return /\b(?:grep|rg|ag|git\s+grep)\b/i.test(command);
}

function isGrepSearchLog(log?: RunnerLog): boolean {
  return Boolean(log && log.eventType === "command_execution" && isGrepSearchCommand(String(log.metadata?.command || "")));
}

function extractFirstQuotedShellValue(value: string): string | null {
  for (let index = 0; index < value.length; index += 1) {
    const quote = value[index];
    if (quote !== `"` && quote !== `'`) {
      continue;
    }

    let result = "";
    for (let nextIndex = index + 1; nextIndex < value.length; nextIndex += 1) {
      const current = value[nextIndex];
      if (current === "\\" && nextIndex + 1 < value.length) {
        result += value[nextIndex + 1];
        nextIndex += 1;
        continue;
      }
      if (current === quote) {
        return result.trim();
      }
      result += current;
    }
  }
  return null;
}

function extractGrepSearchPattern(command?: string): string | null {
  if (!command) return null;
  const segmentMatch = /\b(?:grep|rg|ag|git\s+grep)\b([\s\S]*)/i.exec(command);
  const segment = segmentMatch?.[1] || command;
  const quoted = extractFirstQuotedShellValue(segment);
  if (quoted) {
    return quoted;
  }

  const tokens = segment.trim().split(/\s+/);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token) continue;
    if (token === "-e" || token === "--regexp") {
      return tokens[index + 1]?.trim() || null;
    }
    if (token.startsWith("-")) {
      continue;
    }
    return token.replace(/[|&;]+$/, "").trim() || null;
  }
  return null;
}

function formatGrepSearchPattern(pattern?: string | null): string {
  const normalized = String(pattern || "")
    .replace(/\\\\/g, "\\")
    .replace(/\\\./g, ".")
    .replace(/\\-/g, "-")
    .replace(/\\_/g, "_")
    .trim();
  return normalized || "matches";
}

function parseGrepSearchMatches(output: string): GrepSearchMatch[] {
  const lines = output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const matches: GrepSearchMatch[] = [];

  for (const line of lines) {
    const directoryEntry = line.match(/^[d-][rwx-]{9}\s+\d+\s+\S+\s+\S+\s+(\d+)\s+([A-Za-z]{3}\s+\d+\s+[\d:]+)\s+(.+)$/);
    if (directoryEntry) {
      const [, size, modifiedAt, name] = directoryEntry;
      matches.push({
        title: normalizeListFileName(name),
        subtitle: [formatBytes(Number(size)), modifiedAt].filter(Boolean).join(" · "),
      });
      continue;
    }

    const lineMatch = line.match(/^(.+?):(\d+)(?::\d+)?:\s*(.*)$/);
    if (lineMatch) {
      const [, source, lineNumber, content] = lineMatch;
      matches.push({
        title: content || source,
        subtitle: `${source} · line ${lineNumber}`,
        source,
        lineNumber,
      });
      continue;
    }

    const sourceMatch = line.match(/^(.+?):\s*(.+)$/);
    if (sourceMatch && (sourceMatch[1].includes("/") || /\.[A-Za-z0-9]{1,12}$/.test(sourceMatch[1]))) {
      const [, source, content] = sourceMatch;
      matches.push({
        title: content,
        subtitle: source,
        source,
      });
      continue;
    }

    matches.push({ title: normalizeListFileName(line) });
  }

  return matches;
}

function GrepSearchLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  const compactCommand = String(log.metadata?.command || "");
  const compactStdout = resolveCommandOutputText(log.metadata?.output, "stdout");
  const compactPattern = formatGrepSearchPattern(extractGrepSearchPattern(compactCommand));
  const compactMatches = parseGrepSearchMatches(compactStdout);
  const compactExitCode = typeof log.metadata?.exitCode === "number" ? log.metadata.exitCode : null;
  const compactParsedOutput = parseStructuredCommandExecutionOutput(log.metadata?.output);
  const compactStderr = stripRunnerSystemTags(compactParsedOutput?.stderr || "");
  const compactHasError = Boolean(compactStderr.trim()) && compactExitCode !== 1;
  return (
    <CompactActionLogLine
      icon={<Search className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Searched files"
      detail={compactHasError ? "failed" : `${compactPattern}${compactMatches.length > 0 ? ` - ${compactMatches.length} ${compactMatches.length === 1 ? "match" : "matches"}` : ""}`}
    />
  );
}

import {
  isWebSearchCommand,
  isWebSearchOutput,
  WebSearchLogBox,
  isWebScrapeCommand,
  isWebScrapeJsonCommand,
  isWebScrapeOutput,
  parseWebScrapeLog,
  WebScrapeMarkdownLogBox,
  WebScrapeJsonLogBox,
} from "./web-activity-view.js";

function isMemoryCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("search-threads.py") || command.includes(".claude/skills/memory/");
}

function extractMemoryQuery(command?: string): string | null {
  if (!command) return null;
  const quoted = command.match(/search-threads\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/search-threads\.py\s+(\S+)/);
  return unquoted?.[1] && !unquoted[1].startsWith("-") ? unquoted[1] : null;
}

function parseMemoryOutput(output?: string): { total: number; results: Array<{ threadId: string; title: string; createdAt: string; task?: string }>; processingTimeMs?: number } {
  if (!output) return { total: 0, results: [] };
  const total = Number(output.match(/Found (\d+) matching thread/)?.[1] || 0);
  const results: Array<{ threadId: string; title: string; createdAt: string; task?: string }> = [];
  const sections = output.split(/###\s*\d+\./).slice(1);
  for (const section of sections) {
    const title = section.match(/^\s*(.+?)(?=\n)/)?.[1]?.trim() || "Untitled";
    const threadId = section.match(/\*\*Thread ID:\*\*\s*(\S+)/)?.[1];
    if (!threadId) continue;
    results.push({
      threadId,
      title,
      createdAt: section.match(/\*\*Created:\*\*\s*(\d{4}-\d{2}-\d{2})/)?.[1] || "",
      task: section.match(/\*\*Task:\*\*\s*(.+?)(?=\n-|\n###|$)/)?.[1]?.trim(),
    });
  }
  const processingTimeMs = output.match(/Search completed in (\d+)ms/)?.[1];
  return { total, results, processingTimeMs: processingTimeMs ? Number(processingTimeMs) : undefined };
}

function formatRelativeDate(dateStr: string): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

function MemoryLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void timeLabel;
  const query = extractMemoryQuery(log.metadata?.command || "");
  const output = String(log.metadata?.output || log.metadata?.result || "");
  const parsed = parseMemoryOutput(output);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0;

  return (
    <CompactActionLogLine
      icon={<Brain className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Searched Memory"
      detail={isError ? "failed" : isLoading ? "searching..." : query || `${parsed.total} ${parsed.total === 1 ? "result" : "results"}`}
    />
  );
}

function isEmailCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("/workspace/.scripts/send-email.py") || command.includes("send-email.py");
}

function extractAttachments(command?: string): string[] {
  if (!command) return [];
  const attachmentsMatch = command.match(/(?:--attachments|-a)\s+(.+?)(?=\s+--|\s+-[a-z]|$)/i);
  if (!attachmentsMatch) return [];
  const files: string[] = [];
  let current = "";
  let inQuote = false;
  let quoteChar = "";
  for (let index = 0; index < attachmentsMatch[1].length; index += 1) {
    const currentChar = attachmentsMatch[1][index];
    if ((currentChar === `"` || currentChar === `'`) && !inQuote) {
      inQuote = true;
      quoteChar = currentChar;
    } else if (currentChar === quoteChar && inQuote) {
      inQuote = false;
      if (current.trim()) files.push(current.trim());
      current = "";
    } else if (currentChar === " " && !inQuote) {
      if (current.trim()) files.push(current.trim());
      current = "";
    } else {
      current += currentChar;
    }
  }
  if (current.trim()) files.push(current.trim());
  return files;
}

function parseEmailOutput(output?: string): { success: boolean; recipient: string | null; subject: string | null; errorMessage: string | null } {
  const base = { success: false, recipient: null, subject: null, errorMessage: null };
  if (!output) return base;
  const jsonPattern = output.match(/---\s*JSON OUTPUT\s*---\s*(\{[\s\S]*\})/i) || output.match(/(\{[\s\S]*"success"[\s\S]*\})/);
  if (jsonPattern?.[1]) {
    try {
      const data = JSON.parse(jsonPattern[1]);
      const recipient = typeof data.message === "string" ? data.message.match(/to\s+([^\s]+@[^\s]+)/i)?.[1] || null : null;
      return {
        success: data.success === true,
        recipient,
        subject: typeof data.subject === "string" ? data.subject : null,
        errorMessage: typeof data.error === "string" ? data.error : null,
      };
    } catch {}
  }
  return {
    success: output.includes("EMAIL SENT SUCCESSFULLY") || output.includes("Email sent successfully"),
    recipient: output.match(/(?:Sending email to|To):\s*([^\s\n]+@[^\s\n]+)/i)?.[1] || null,
    subject: output.match(/Subject:\s*(.+?)(?:\n|$)/i)?.[1]?.trim() || null,
    errorMessage: output.match(/Error:\s*(.+?)(?:\n|$)/i)?.[1]?.trim() || null,
  };
}

function EmailLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void timeLabel;
  const command = log.metadata?.command || log.message || "";
  const output = String(log.metadata?.output || "");
  const parsed = parseEmailOutput(output);
  const subject = extractQuotedArgument(command, "--subject|-s") || parsed.subject;
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) || Boolean(parsed.errorMessage);

  return (
    <CompactActionLogLine
      icon={<Mail className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Sent Email"
      detail={isError ? (parsed.errorMessage || "failed") : isLoading ? "sending..." : subject || parsed.recipient || "queued"}
    />
  );
}

function isDocumentParseCommand(command?: string): boolean {
  if (!command) return false;
  return (
    command.includes("/workspace/.scripts/document-parse.py") ||
    command.includes("document-parse.py") ||
    command.includes("/workspace/.scripts/pdf-reader.py") ||
    command.includes("pdf-reader.py")
  );
}

function extractDocumentParsePath(command?: string): string | null {
  if (!command) return null;
  const quoted = command.match(/(?:document-parse|pdf-reader)\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/(?:document-parse|pdf-reader)\.py\s+(\S+\.(?:pdf|docx?|xlsx?|odt|rtf|html?|csv|txt))/i);
  return unquoted?.[1] || null;
}

function parseDocumentParseOutput(output?: string): Record<string, unknown> | null {
  if (!output) return null;
  const patterns = [
    /---\s*DOCUMENT PARSE JSON\s*---\s*(\{[\s\S]*?\})\s*---\s*DOCUMENT PARSE MARKDOWN\s*---/i,
    /---\s*JSON OUTPUT\s*---\s*(\{[\s\S]*\})/i,
    /(\{[\s\S]*"success"[\s\S]*\})/,
    /(\{[\s\S]*"file_path"[\s\S]*\})/,
  ];
  for (const pattern of patterns) {
    const match = output.match(pattern);
    if (match?.[1]) {
      try {
        return JSON.parse(match[1]) as Record<string, unknown>;
      } catch {}
    }
  }
  return null;
}

function DocumentParseLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void timeLabel;
  const command = log.metadata?.command || "";
  const output = String(log.metadata?.output || "");
  const parsed = parseDocumentParseOutput(output);
  const fileName =
    (typeof parsed?.file_name === "string" ? parsed.file_name : null) ||
    (typeof parsed?.title === "string" ? parsed.title : null) ||
    extractDocumentParsePath(command);
  const isLoading = log.metadata?.status === "running" || log.metadata?.status === "started";
  const isError = (typeof log.metadata?.exitCode === "number" && log.metadata.exitCode !== 0) || parsed?.success === false;

  return (
    <CompactActionLogLine
      icon={<FileSearch className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Parsed Document"
      detail={isError ? "failed" : isLoading ? "parsing..." : fileName || "document"}
    />
  );
}



import {
  BrowserSkillLogBox,
  ComputerUseDetailDrawer,
  isBrowserSkillCommand,
  isBrowserSkillLaunchCommand,
  isComputerUseMcpLog,
  SubagentDetailDrawer,
  SubagentLogBox,
} from "./visual-interaction-view.js";

export {
  BrowserSkillLogBox,
  ComputerUseDetailDrawer,
  isBrowserSkillCommand,
  isBrowserSkillLaunchCommand,
  isComputerUseMcpLog,
  SubagentDetailDrawer,
  SubagentLogBox,
} from "./visual-interaction-view.js";

function TodoListLogBox({ onOpenTaskList }: { onOpenTaskList?: () => void }) {
  function handleOpenTaskList() {
    if (onOpenTaskList) {
      onOpenTaskList();
      return;
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("playground:open-thread-task-list"));
    }
  }

  return (
    <button
      type="button"
      className="tb-log-task-list-compact"
      onClick={handleOpenTaskList}
      aria-label="Open task list"
    >
      <ListTodo className="tb-log-task-list-compact-icon" strokeWidth={1.6} />
      <span className="tb-log-task-list-compact-title">Updated Task List</span>
    </button>
  );
}

function MkdirLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void log;
  void timeLabel;
  return null;
}

function HelpCommandLogBox({
  details,
  output,
  timeLabel,
  onWorkspacePathClick,
}: {
  details: RunnerHelpCommandDetails;
  output: string;
  timeLabel?: string;
  onWorkspacePathClick?: (path: string) => void;
}) {
  void output;
  void timeLabel;
  void onWorkspacePathClick;

  return (
    <CompactActionLogLine
      icon={<CircleHelp className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Showed Help"
      detail={details.resourceName}
    />
  );
}

function buildBashCommandPreviewText(params: {
  command: string;
  stdout: string;
  stderr: string;
  output: string;
  statusNotice: string | null;
  exitCode: number | null;
  parsedOutput: ReturnType<typeof parseStructuredCommandExecutionOutput>;
}): string {
  const { command, stdout, stderr, output, statusNotice, exitCode, parsedOutput } = params;
  const sections: string[] = [];
  const normalizedCommand = formatShellCommandForDisplay(command).trim();
  if (normalizedCommand) {
    sections.push(["Command", normalizedCommand.startsWith("$") ? normalizedCommand : `$ ${normalizedCommand}`].join("\n"));
  }
  if (parsedOutput) {
    if (stdout.trim()) {
      sections.push(["Output", stdout.trimEnd()].join("\n"));
    }
    if (stderr.trim()) {
      sections.push(["Error output", stderr.trimEnd()].join("\n"));
    }
    if (statusNotice) {
      sections.push(["Status", statusNotice].join("\n"));
    }
  } else if (output.trim()) {
    sections.push(["Output", output.trimEnd()].join("\n"));
  }
  if (typeof exitCode === "number") {
    sections.push(["Exit code", String(exitCode)].join("\n"));
  }
  return sections.length > 0 ? sections.join("\n\n") : "No command output.";
}

function buildBashCommandPreviewAttachment(previewText: string): RunnerPreviewAttachment {
  const previewUrl = `data:text/plain;charset=utf-8,${encodeURIComponent(previewText)}`;
  return {
    ...buildRunnerPreviewAttachmentFromPath("/workspace/bash-command-output.txt", {
      idPrefix: "bash-command-preview",
    }),
    id: buildCompactLogPreviewId("bash-command-preview", previewText),
    filename: "bash-command-output.txt",
    mimeType: "text/plain",
    type: "document",
    previewKindOverride: "text",
    url: previewUrl,
    previewUrl,
  };
}

function GenericCommandLogBox({
  log,
  timeLabel,
  onWorkspacePathClick,
  availableAgents,
  onAgentClick,
  onPreviewDocument,
}: {
  log: RunnerLog;
  timeLabel?: string;
  onWorkspacePathClick?: (path: string) => void;
  availableAgents?: ComputerAgentsListAvailableAgent[];
  onAgentClick?: (agent: ComputerAgentsListAgent) => void;
  onPreviewDocument?: (attachment: RunnerPreviewAttachment) => void;
}) {
  const command = stripRunnerSystemTags(log.metadata?.command || log.message || "");
  const exitCode = typeof log.metadata?.exitCode === "number" ? log.metadata.exitCode : null;
  const parsedOutput = useMemo(
    () => parseStructuredCommandExecutionOutput(log.metadata?.output),
    [log.metadata?.output]
  );
  const rawOutput = stripRunnerSystemTags(String(log.metadata?.output || ""));
  const stdout = stripRunnerSystemTags(parsedOutput?.stdout || "");
  const stderr = stripRunnerSystemTags(parsedOutput?.stderr || "");
  const hasStdout = stdout.trim().length > 0;
  const hasStderr = stderr.trim().length > 0;
  const statusNotice = (() => {
    if (parsedOutput?.backgroundTaskId) {
      return `Backgrounded (${parsedOutput.backgroundTaskId})`;
    }
    if (parsedOutput?.returnCodeInterpretation === "timeout") {
      return "Timed out";
    }
    if (typeof exitCode === "number" && exitCode !== 0 && !hasStdout && !hasStderr) {
      return `Exited with code ${exitCode}`;
    }
    if (parsedOutput?.interrupted && !hasStdout && !hasStderr) {
      return "Interrupted";
    }
    return null;
  })();
  const output = parsedOutput ? "" : rawOutput;
  const isError =
    (typeof exitCode === "number" && exitCode !== 0) ||
    parsedOutput?.returnCodeInterpretation === "timeout" ||
    hasStderr;
  const shellCommand = formatShellCommandForDisplay(command);
  const stdoutDisplay = stdout;
  const stderrDisplay = stderr;
  const outputDisplay = output;
  const copyPayload = useMemo(() => {
    const normalizedCommand = shellCommand.trim()
      ? shellCommand.trim().startsWith("$")
        ? shellCommand.trim()
        : `$ ${shellCommand.trim()}`
      : "";
    const parts = [
      normalizedCommand,
      parsedOutput ? stdout : "",
      parsedOutput ? stderr : "",
      parsedOutput ? statusNotice || "" : output,
    ].filter((value) => typeof value === "string" && value.trim().length > 0);
    return parts.join("\n");
  }, [output, parsedOutput, shellCommand, statusNotice, stderr, stdout]);
  const computerAgentsListDetails = useMemo(() => {
    const commandCandidates = [command, shellCommand, copyPayload].filter((value) => value.trim().length > 0);
    const outputText = [stdout, stderr, output, rawOutput, stdoutDisplay, stderrDisplay, outputDisplay, copyPayload]
      .filter((value) => value.trim().length > 0)
      .join("\n");
    for (const commandCandidate of commandCandidates) {
      const parsedDetails = parseComputerAgentsListCommandOutput(commandCandidate, outputText);
      if (parsedDetails) return parsedDetails;
    }
    return null;
  }, [command, copyPayload, output, outputDisplay, rawOutput, shellCommand, stderr, stderrDisplay, stdout, stdoutDisplay]);
  const computerAgentsThreadsListDetails = useMemo(() => {
    const commandCandidates = [command, shellCommand, copyPayload].filter((value) => value.trim().length > 0);
    const outputText = [stdout, stderr, output, rawOutput, stdoutDisplay, stderrDisplay, outputDisplay, copyPayload]
      .filter((value) => value.trim().length > 0)
      .join("\n");
    for (const commandCandidate of commandCandidates) {
      const parsedDetails = parseComputerAgentsThreadsListCommandOutput(commandCandidate, outputText);
      if (parsedDetails) return parsedDetails;
    }
    return null;
  }, [command, copyPayload, output, outputDisplay, rawOutput, shellCommand, stderr, stderrDisplay, stdout, stdoutDisplay]);
  const computerAgentsThreadGetDetails = useMemo(() => {
    const commandCandidates = [command, shellCommand, copyPayload].filter((value) => value.trim().length > 0);
    const outputText = [stdout, stderr, output, rawOutput, stdoutDisplay, stderrDisplay, outputDisplay, copyPayload]
      .filter((value) => value.trim().length > 0)
      .join("\n");
    for (const commandCandidate of commandCandidates) {
      const parsedDetails = parseComputerAgentsThreadGetCommandOutput(commandCandidate, outputText);
      if (parsedDetails) return parsedDetails;
    }
    return null;
  }, [command, copyPayload, output, outputDisplay, rawOutput, shellCommand, stderr, stderrDisplay, stdout, stdoutDisplay]);
  const helpCommandDetails = useMemo(() => {
    const commandCandidates = [command, shellCommand, copyPayload].filter((value) => value.trim().length > 0);
    for (const commandCandidate of commandCandidates) {
      const parsedDetails = parseRunnerHelpCommandDetails(commandCandidate);
      if (parsedDetails) return parsedDetails;
    }
    return null;
  }, [command, copyPayload, shellCommand]);
  const helpCommandOutput = useMemo(() => {
    const outputParts = parsedOutput
      ? [stdout, stderr, statusNotice || ""]
      : [output || rawOutput];
    return stripRunnerSystemTags(outputParts.filter((value) => value.trim().length > 0).join("\n")).trim();
  }, [output, parsedOutput, rawOutput, statusNotice, stderr, stdout]);
  const bashPreviewText = useMemo(() => buildBashCommandPreviewText({
    command,
    stdout,
    stderr,
    output,
    statusNotice,
    exitCode,
    parsedOutput,
  }), [command, exitCode, output, parsedOutput, statusNotice, stderr, stdout]);
  const bashPreviewAttachment = useMemo(() => buildBashCommandPreviewAttachment(bashPreviewText), [bashPreviewText]);
  const jsonOutputSegments = useMemo(
    () => findRunnerWorkingLogJsonSegments(
      parsedOutput ? [stdout, output, rawOutput] : [output, rawOutput],
      "Command Output"
    ),
    [output, parsedOutput, rawOutput, stdout]
  );

  if (computerAgentsListDetails) {
    return renderComputerAgentsListCompactLog(computerAgentsListDetails, (agent) => onAgentClick?.({
      id: agent.agentId,
      name: agent.agentName,
    } as ComputerAgentsListAgent));
  }

  if (computerAgentsThreadsListDetails) {
    return renderComputerAgentsThreadsListCompactLog(computerAgentsThreadsListDetails);
  }

  if (computerAgentsThreadGetDetails) {
    return renderComputerAgentsThreadGetCompactLog(computerAgentsThreadGetDetails);
  }

  if (helpCommandDetails) {
    return (
      <HelpCommandLogBox
        details={helpCommandDetails}
        output={helpCommandOutput}
        timeLabel={timeLabel}
        onWorkspacePathClick={onWorkspacePathClick}
      />
    );
  }

  if (jsonOutputSegments.length > 0) {
    return (
      <RunnerWorkingLogJsonContent
        segments={jsonOutputSegments}
        documentIdPrefix={`command-${String(command || rawOutput || "output").replace(/[^a-z0-9_-]+/gi, "-").slice(0, 80).toLowerCase()}`}
        onWorkspacePathClick={onWorkspacePathClick}
      />
    );
  }

  return (
    <button
      type="button"
      className={`tb-log-command-compact${isError ? " is-error" : ""}`.trim()}
      onClick={() => onPreviewDocument?.(bashPreviewAttachment)}
      aria-label="Open Bash command output"
    >
      <Terminal className="tb-log-command-compact-icon" strokeWidth={1.6} />
      <span className="tb-log-command-compact-title">Ran Bash Command</span>
    </button>
  );
}

function GenericMcpToolLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void timeLabel;
  const serverName = log.metadata?.serverName || "MCP";
  const toolName = log.metadata?.toolName || "tool";
  const result = log.metadata?.result;
  const error = log.metadata?.error;
  const content = typeof result === "string" ? stripRunnerSystemTags(result) : result ? JSON.stringify(result, null, 2) : error ? String(error) : "";
  const jsonSegments = useMemo(
    () => findRunnerWorkingLogJsonSegments([content], "MCP Result"),
    [content]
  );
  if (jsonSegments.length > 0) {
    return (
      <RunnerWorkingLogJsonContent
        segments={jsonSegments}
        documentIdPrefix={`mcp-${String(serverName || "server").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase()}-${String(toolName || "tool").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase()}`}
      />
    );
  }
  return (
    <CompactActionLogLine
      icon={<Globe className="tb-log-compact-action-icon-svg" strokeWidth={1.6} />}
      title="Called MCP Tool"
      detail={[String(serverName || "").trim(), String(toolName || "").trim()].filter(Boolean).join(" -> ") || (content ? "completed" : "")}
    />
  );
}

function ComputerUseEventLogBox({ log, timeLabel }: { log: RunnerLog; timeLabel?: string }) {
  void log;
  void timeLabel;
  return null;
}

export function InlineStatusLogBox({
  label,
  pending = false,
}: {
  icon: ReactNode;
  label: string;
  pending?: boolean;
}) {
  return (
    <div className={`tb-log-reasoning ${pending ? "tb-log-reasoning-pending" : ""}`.trim()}>
      <div className={`tb-log-reasoning-copy ${pending ? "tb-log-reasoning-copy-pending" : ""}`.trim()}>
        {pending ? (
          <span className="tb-log-inline-status-spinner-slot" aria-hidden="true">
            <DotLoader dotCount={9} dotSize={3} gap={2} className="tb-log-inline-status-dot-loader" />
          </span>
        ) : null}
        <span className={`tb-log-inline-status-copy ${pending ? "tb-log-inline-status-copy-pending" : ""}`.trim()}>{label}</span>
      </div>
    </div>
  );
}

export function RunnerWorkLogEntry({
  log,
  timeLabel,
  backendUrl,
  environmentId,
  requestHeaders,
  renderComputerUseMcpAsGeneric = false,
  renderBrowserSkillAsGeneric = false,
  activeTaskPreviewId,
  availableAgents,
  availableEnvironments,
  availableProjects,
  onPreviewDocument,
  onWorkspacePathClick,
  onPermissionDecision,
  onTaskPreviewClick,
  onAgentPreviewClick,
  onEnvironmentPreviewClick,
  onProjectPreviewClick,
  onOpenTaskList,
}: RunnerWorkLogEntryProps) {
  const normalizedMessage = stripRunnerSystemTags(log.message || "").replace(/\s+/g, " ").trim().toLowerCase();

  if (normalizedMessage === "starting session" || normalizedMessage === "starting session...") {
    return null;
  }

  if (normalizedMessage === "thinking" || normalizedMessage === "thinking...") {
    return <InlineStatusLogBox label="Thinking..." icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} pending />;
  }

  if (log.eventType === "reasoning" || log.eventType === "planning" || log.isReasoning || log.isPlanning) {
    return <ReasoningLogBox log={log} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if ((log as RunnerLog & { isActionSummary?: boolean }).isActionSummary || log.eventType === "action_summary") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Action Summary" icon={<Lightbulb className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if (log.eventType === "permission_request") {
    return <PermissionRequestLogBox log={log} timeLabel={timeLabel} onPermissionDecision={onPermissionDecision} />;
  }

  if (log.eventType === "deep_research" && log.metadata?.deepResearch) {
    return <DeepResearchEventLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "metronome_workflow" || log.metadata?.metronomeWorkflow) {
    return <MetronomeWorkflowLogBox log={log} timeLabel={timeLabel} />;
  }

  const persistedCommand = typeof log.metadata?.command === "string" ? log.metadata.command : "";
  if (isLikelyVideoGenerationLog(log, persistedCommand)) {
    return <VideoGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} onPreviewDocument={onPreviewDocument} />;
  }

  if (log.eventType === "command_execution") {
    const command = log.metadata?.command || "";
    const output = String(log.metadata?.output || "");
    if (shouldHideNoopReadFileLog(log)) return null;
    if (isWaitLog(log)) return <WaitLogBox log={log} timeLabel={timeLabel} />;
    if (isWebScrapeCommand(command) || isWebScrapeOutput(output)) {
      return isWebScrapeJsonCommand(command) || parseWebScrapeLog(log)?.mode === "json"
        ? <WebScrapeJsonLogBox log={log} timeLabel={timeLabel} />
        : <WebScrapeMarkdownLogBox log={log} timeLabel={timeLabel} onPreviewDocument={onPreviewDocument} />;
    }
    if (isWebSearchCommand(command) || isWebSearchOutput(output)) {
      return <WebSearchLogBox log={log} timeLabel={timeLabel} onPreviewDocument={onPreviewDocument} />;
    }
    if (isMemoryCommand(command)) return <MemoryLogBox log={log} timeLabel={timeLabel} />;
    if (isBrowserSkillCommand(command) && !renderBrowserSkillAsGeneric) {
      return <BrowserSkillLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    if (isEmailCommand(command)) return <EmailLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderComputerAgentsCreateLog(log)) {
      return (
        <ComputerAgentsCreateLogBox
          log={log}
          timeLabel={timeLabel}
          onAgentPreviewClick={onAgentPreviewClick}
          onEnvironmentPreviewClick={onEnvironmentPreviewClick}
          onProjectPreviewClick={onProjectPreviewClick}
        />
      );
    }
    const appPlatformResourcesListDetails = parseAppPlatformResourcesListLogDetails(log);
    if (appPlatformResourcesListDetails) {
      return renderAppPlatformResourcesListCompactLog(appPlatformResourcesListDetails);
    }
    const taskManagementProjectsListDetails = parseTaskManagementProjectsListLogDetails(log);
    if (taskManagementProjectsListDetails) {
      return renderTaskManagementProjectsListCompactLog(taskManagementProjectsListDetails, onProjectPreviewClick);
    }
    const computerAgentsEnvironmentsListDetails = parseComputerAgentsEnvironmentsListLogDetails(log);
    if (computerAgentsEnvironmentsListDetails) {
      return renderComputerAgentsEnvironmentsListCompactLog(computerAgentsEnvironmentsListDetails, onEnvironmentPreviewClick);
    }
    const computerAgentsListDetails = parseComputerAgentsListLogDetails(log);
    if (computerAgentsListDetails) {
      return renderComputerAgentsListCompactLog(computerAgentsListDetails, onAgentPreviewClick);
    }
    const computerAgentsThreadsListDetails = parseComputerAgentsThreadsListLogDetails(log);
    if (computerAgentsThreadsListDetails) {
      return renderComputerAgentsThreadsListCompactLog(computerAgentsThreadsListDetails);
    }
    const computerAgentsThreadGetDetails = parseComputerAgentsThreadGetLogDetails(log);
    if (computerAgentsThreadGetDetails) {
      return renderComputerAgentsThreadGetCompactLog(computerAgentsThreadGetDetails);
    }
    if (isComputerAgentsThreadSnapshotLog(log)) return <ComputerAgentsThreadSnapshotLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderTaskManagementReleaseCreateLog(log)) return <TaskManagementReleaseCreateLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderTaskManagementCommentLog(log)) return <TaskManagementCommentLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderTaskManagementUpdateLog(log)) return <TaskManagementUpdateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    if (shouldRenderTaskManagementCreateLog(log)) return <TaskManagementCreateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    if (isGrepSearchLog(log)) return <GrepSearchLogBox log={log} timeLabel={timeLabel} />;
    if (isListFilesLog(log)) {
      return (
        <ListFilesLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onWorkspacePathClick={onWorkspacePathClick}
          onPreviewDocument={onPreviewDocument}
        />
      );
    }
    if (isMkdirLog(log)) {
      return <MkdirLogBox log={log} timeLabel={timeLabel} />;
    }
    if (isReadFileLog(log)) {
      return (
        <ReadFileLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onPreviewDocument={onPreviewDocument}
          onWorkspacePathClick={onWorkspacePathClick}
        />
      );
    }
    if (isWriteFileLog(log)) {
      return (
        <WriteFileLogGroup
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onPreviewDocument={onPreviewDocument}
        />
      );
    }
    if (isDocumentParseCommand(command)) return <DocumentParseLogBox log={log} timeLabel={timeLabel} />;
    if (isImageUnderstandingCommand(command)) {
      return (
        <ImageUnderstandingLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onPreviewDocument={onPreviewDocument}
        />
      );
    }
    if (isLikelyImageGenerationLog(log, command)) {
      return <ImageGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} onPreviewDocument={onPreviewDocument} />;
    }
    if (isLikelyVideoGenerationLog(log, command)) {
      return <VideoGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} onPreviewDocument={onPreviewDocument} />;
    }
    if (isDeepResearchCommand(command)) return <DeepResearchCommandLogBox log={log} timeLabel={timeLabel} />;
    const gitDiffDetails = parseGitDiffLogDetails(log);
    if (gitDiffDetails) return renderGitDiffCompactLog(gitDiffDetails);
    const gitCommitDetails = parseGitCommitLogDetails(log);
    if (gitCommitDetails) return renderGitCommitCompactLog(gitCommitDetails);
    const gitStatusDetails = parseGitStatusLogDetails(log);
    if (gitStatusDetails) return renderGitStatusCompactLog(gitStatusDetails);
    return (
      <GenericCommandLogBox
        log={log}
        timeLabel={timeLabel}
        onWorkspacePathClick={onWorkspacePathClick}
        availableAgents={availableAgents}
        onAgentClick={(agent) => onAgentPreviewClick?.({ agentId: agent.id, agentName: agent.name })}
        onPreviewDocument={onPreviewDocument}
      />
    );
  }

  if (log.eventType === "mcp_tool_call") {
    if (shouldHideNoopReadFileLog(log)) return null;
    if (isWaitLog(log)) return <WaitLogBox log={log} timeLabel={timeLabel} />;
    if (shouldRenderComputerAgentsCreateLog(log)) {
      return (
        <ComputerAgentsCreateLogBox
          log={log}
          timeLabel={timeLabel}
          onAgentPreviewClick={onAgentPreviewClick}
          onEnvironmentPreviewClick={onEnvironmentPreviewClick}
          onProjectPreviewClick={onProjectPreviewClick}
        />
      );
    }
    const appPlatformResourcesListDetails = parseAppPlatformResourcesListLogDetails(log);
    if (appPlatformResourcesListDetails) {
      return renderAppPlatformResourcesListCompactLog(appPlatformResourcesListDetails);
    }
    const computerAgentsListDetails = parseComputerAgentsListLogDetails(log);
    if (computerAgentsListDetails) {
      return renderComputerAgentsListCompactLog(computerAgentsListDetails, onAgentPreviewClick);
    }
    const computerAgentsThreadsListDetails = parseComputerAgentsThreadsListLogDetails(log);
    if (computerAgentsThreadsListDetails) {
      return renderComputerAgentsThreadsListCompactLog(computerAgentsThreadsListDetails);
    }
    const computerAgentsThreadGetDetails = parseComputerAgentsThreadGetLogDetails(log);
    if (computerAgentsThreadGetDetails) {
      return renderComputerAgentsThreadGetCompactLog(computerAgentsThreadGetDetails);
    }
    if (isComputerAgentsThreadSnapshotLog(log)) {
      return <ComputerAgentsThreadSnapshotLogBox log={log} timeLabel={timeLabel} />;
    }
    if (isListFilesLog(log)) {
      return (
        <ListFilesLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onWorkspacePathClick={onWorkspacePathClick}
          onPreviewDocument={onPreviewDocument}
        />
      );
    }
    if (isMkdirLog(log)) {
      return <MkdirLogBox log={log} timeLabel={timeLabel} />;
    }
    if (isReadFileLog(log)) {
      return (
        <ReadFileLogBox
          log={log}
          timeLabel={timeLabel}
          backendUrl={backendUrl}
          environmentId={environmentId}
          requestHeaders={requestHeaders}
          onPreviewDocument={onPreviewDocument}
          onWorkspacePathClick={onWorkspacePathClick}
        />
      );
    }
    if (shouldRenderTaskManagementReleaseCreateLog(log)) {
      return <TaskManagementReleaseCreateLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementCommentLog(log)) {
      return <TaskManagementCommentLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementUpdateLog(log)) {
      return <TaskManagementUpdateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    }
    if (shouldRenderTaskManagementCreateLog(log)) {
      return <TaskManagementCreateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    }
    if (isComputerUseMcpLog(log)) {
      if (renderComputerUseMcpAsGeneric) {
        return <ComputerUseEventLogBox log={log} timeLabel={timeLabel} />;
      }
      return <BrowserSkillLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} />;
    }
    if (isLikelyImageGenerationLog(log)) {
      return <ImageGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} onPreviewDocument={onPreviewDocument} />;
    }
    if (isLikelyVideoGenerationLog(log)) {
      return <VideoGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} onPreviewDocument={onPreviewDocument} />;
    }
    return <GenericMcpToolLogBox log={log} timeLabel={timeLabel} />;
  }

  if (log.eventType === "mcp_log") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="MCP Log" icon={<Globe className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  if (log.eventType === "file_change") {
    if (shouldRenderComputerAgentsCreateLog(log)) {
      return (
        <ComputerAgentsCreateLogBox
          log={log}
          timeLabel={timeLabel}
          onAgentPreviewClick={onAgentPreviewClick}
          onEnvironmentPreviewClick={onEnvironmentPreviewClick}
          onProjectPreviewClick={onProjectPreviewClick}
        />
      );
    }
    if (shouldRenderTaskManagementReleaseCreateLog(log)) {
      return <TaskManagementReleaseCreateLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementCommentLog(log)) {
      return <TaskManagementCommentLogBox log={log} timeLabel={timeLabel} />;
    }
    if (shouldRenderTaskManagementUpdateLog(log)) {
      return <TaskManagementUpdateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    }
    if (shouldRenderTaskManagementCreateLog(log)) {
      return <TaskManagementCreateLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} requestHeaders={requestHeaders} activeTaskPreviewId={activeTaskPreviewId} onTaskPreviewClick={onTaskPreviewClick} />;
    }
    if (isImageFileChangeLog(log)) {
      return null;
    }
    if (isVideoFileChangeLog(log)) {
      return <VideoGenerationLogBox log={log} timeLabel={timeLabel} backendUrl={backendUrl} environmentId={environmentId} requestHeaders={requestHeaders} onPreviewDocument={onPreviewDocument} />;
    }
    return (
      <WriteFileLogGroup
        log={log}
        timeLabel={timeLabel}
        backendUrl={backendUrl}
        environmentId={environmentId}
        requestHeaders={requestHeaders}
        onPreviewDocument={onPreviewDocument}
      />
    );
  }

  if (log.eventType === "todo_list") {
    return <TodoListLogBox onOpenTaskList={onOpenTaskList} />;
  }

  if (log.eventType === "setup" || log.eventType === "startup") {
    return <InlineStatusLogBox label="Starting session" icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} />;
  }

  if (normalizedMessage === "setting up workspace" || normalizedMessage === "setting up workspace...") {
    return <InlineStatusLogBox label="Setting up workspace..." icon={<Terminal className="tb-log-card-small-icon" strokeWidth={1.5} />} pending />;
  }

  if (log.type === "error") {
    return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Error" icon={<AlertCircle className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
  }

  return <GenericTextLogBox log={log} timeLabel={timeLabel} label="Log" icon={<FileText className="tb-log-card-small-icon" strokeWidth={1.5} />} onWorkspacePathClick={onWorkspacePathClick} />;
}
