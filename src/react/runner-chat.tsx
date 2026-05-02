import { CSSProperties, ChangeEvent, DragEvent as ReactDragEvent, Fragment, KeyboardEvent, MouseEvent, PointerEvent as ReactPointerEvent, ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp as LucideArrowUp,
  Bookmark as LucideBookmark,
  Bot as LucideBot,
  Brain as LucideBrain,
  Calendar as LucideCalendar,
  Check as LucideCheck,
  ChevronDown as LucideChevronDown,
  ChevronLeft as LucideChevronLeft,
  Route as LucideRoute,
  Rocket as LucideRocket,
  Cloud as LucideCloud,
  Code as LucideCode,
  Cpu as LucideCpu,
  Database as LucideDatabase,
  ChevronsUp as LucideChevronsUp,
  ChevronRight as LucideChevronRight,
  ChevronUp as LucideChevronUp,
  Clock3 as LucideClock3,
  Calculator as LucideCalculator,
  Equal as LucideEqual,
  FileText as LucideFileText,
  GitBranch as LucideGitBranch,
  Globe as LucideGlobe,
  Images as LucideImages,
  ImageIcon as LucideImageIcon,
  Layers as LucideLayers,
  ListTodo as LucideListTodo,
  Mail as LucideMail,
  MessageCircle as LucideMessageCircle,
  MessageSquare as LucideMessageSquare,
  Minimize2 as LucideMinimize2,
  Monitor as LucideMonitor,
  LoaderCircle as LucideLoaderCircle,
  Package as LucidePackage,
  Palette as LucidePalette,
  Pencil as LucidePencil,
  PenTool as LucidePenTool,
  Minus as LucideMinus,
  Plus as LucidePlus,
  Eraser as LucideEraser,
  Server as LucideServer,
  Shield as LucideShield,
  Sparkles as LucideSparkles,
  Telescope as LucideTelescope,
  Terminal as LucideTerminal,
  TextQuote as LucideTextQuote,
  Upload as LucideUpload,
  Wand2 as LucideWand2,
  X as LucideX,
  Zap as LucideZap,
} from "lucide-react";
import { RunnerDeepResearchSession, RunnerExecuteResult, RunnerLog, RunnerThreadStep, RunnerThreadStepDiffResult } from "../types.js";
import { iterateSseData } from "../sse.js";
import { useRunnerExecution } from "./use-runner-execution.js";
import { RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS, getRunnerChatEnterAnimationStyle } from "./runner-chat-animations.js";
import { mountRunnerChatStyles } from "./runner-chat-styles.js";
import { RunnerDocumentPreviewDrawer } from "./runner-document-preview-drawer.js";
import {
  buildRunnerPreviewHeaders,
  buildRunnerPreviewAttachmentFromPath,
  buildRunnerPreviewDownloadUrl,
  getRunnerPreviewFilename,
  getRunnerPreviewHeaderValue,
  isRunnerDocumentPreviewable,
  normalizeRunnerPreviewPath,
  resolveRunnerPreviewAssetUrl,
  type RunnerPreviewAttachment,
} from "./runner-document-preview.js";
import { RunnerImagePreviewSurface } from "./runner-image-preview-surface.js";
import { BrowserSkillLogBox, ComputerUseDetailDrawer, DeepResearchDetailDrawer, DeepResearchLogBox, InlineStatusLogBox, RunnerWorkLogEntry, SubagentDetailDrawer, SubagentLogBox, collectComputerAgentsCreatedResources, collectRunnerLogFileChangePreviews, isComputerAgentsMutationLog, type RunnerCreatedResourcePreview, hasActiveDeepResearchLogGroup, isBrowserSkillCommand, isBrowserSkillLaunchCommand, isComputerUseMcpLog, isDeepResearchCommand } from "./runner-log-boxes.js";
import { RunnerMarkdown, stripRunnerSystemTags as stripSystemTags } from "./runner-markdown.js";

const RUNNER_FOLDER_ICON_URL = new URL("./assets/folder.png", import.meta.url).toString();
const RUNNER_TEXT_FILE_ICON_URL = new URL("./assets/txtfile.png", import.meta.url).toString();
const RUNNER_IMAGE_FILE_ICON_URL = new URL("./assets/imgicon.webp", import.meta.url).toString();
const RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";
const RUNNER_THINKING_STATUS_FADE_DURATION_MS = 120;
const RUNNER_THINKING_STATUS_REAPPEAR_DELAY_MS = 500;
const RUNNER_THREAD_HISTORY_PREVIEW_LENGTH = 50;
const RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH = 15;
const RUNNER_THREAD_HISTORY_MEDIUM_LINE_WIDTH = 10;
const RUNNER_THREAD_HISTORY_SMALL_LINE_WIDTH = 5;
const RUNNER_WORK_LOG_PAGE_SIZE = 10;

export interface RunnerAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  type: "image" | "document";
  uploadedAt: string;
  url?: string;
  workspacePath?: string;
  gcsPath?: string;
  integrationSource?: "google-drive" | "one-drive" | "github";
  githubRepoFullName?: string;
  githubRef?: string | null;
  githubItemPath?: string;
  githubSelectionType?: "repo" | "file";
  [key: string]: unknown;
}

type RunnerTurnAttachment = RunnerPreviewAttachment;

interface LocalAttachment {
  id: string;
  file: File;
  type: RunnerAttachment["type"];
  previewUrl?: string;
  source: "local" | "workspace" | "integration";
  sourceEnvironmentId?: string | null;
  integrationSource?: "google-drive" | "one-drive" | "github";
  githubRepoFullName?: string;
  githubRef?: string | null;
  githubItemPath?: string;
  githubSelectionType?: "repo" | "file";
  resolvedAttachment?: RunnerAttachment;
  uploadStatus?: "idle" | "uploading" | "uploaded" | "failed";
  uploadError?: string | null;
}

function CollapsibleRunnerUserPrompt({
  content,
  className,
  maxLines = 10,
}: {
  content: string;
  className?: string;
  maxLines?: number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    setIsExpanded(false);
  }, [content]);

  useLayoutEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const measure = () => {
      const computedStyle = window.getComputedStyle(node);
      const lineHeight = Number.parseFloat(computedStyle.lineHeight);
      const collapsedHeight = Number.isFinite(lineHeight) ? lineHeight * maxLines : 0;
      if (collapsedHeight > 0) {
        setIsOverflowing(node.scrollHeight > collapsedHeight + 1);
        return;
      }
      setIsOverflowing(node.scrollHeight > node.clientHeight + 1);
    };

    measure();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(() => {
        measure();
      });
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [content, maxLines]);

  return (
    <>
      <div
        ref={containerRef}
        className={`tb-user-turn-collapsible-copy ${isExpanded ? "is-expanded" : ""}`.trim()}
        style={!isExpanded ? { ["--tb-user-turn-collapsed-lines" as string]: String(maxLines) } : undefined}
      >
        <RunnerMarkdown
          content={content}
          className={className}
          softBreaks
          disallowHeadings
        />
      </div>
      {isOverflowing ? (
        <button
          type="button"
          className="tb-user-turn-show-more"
          onClick={() => setIsExpanded((current) => !current)}
        >
          <span>{isExpanded ? "Show less" : "Show more"}</span>
          {isExpanded ? (
            <LucideChevronUp className="tb-user-turn-show-more-icon" strokeWidth={1.8} />
          ) : (
            <LucideChevronDown className="tb-user-turn-show-more-icon" strokeWidth={1.8} />
          )}
        </button>
      ) : null}
    </>
  );
}

type RunnerTurnStatus = "queued" | "running" | "permission_asked" | "completed" | "failed" | "cancelled";
type RunnerFileBrowserSource = "workspace" | "google-drive" | "one-drive" | "github" | "notion";
type RunnerQuotedSelectionSource = "working_log" | "run_summary" | "deep_research_report";
type RunnerThinkingStatusPhase = "visible" | "fading" | "hidden";

interface RunnerQuotedSelection {
  text: string;
  sourceType: RunnerQuotedSelectionSource;
}

interface RunnerQuotedSelectionPopupState {
  selection: RunnerQuotedSelection;
  x: number;
  y: number;
}

interface RunnerTurn {
  id: string;
  sourceMessageId?: string | null;
  prompt: string;
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
}

export interface RunnerChatAgentTurnClickPayload {
  turnId: string;
  agentId?: string;
  agentName?: string;
}

export interface RunnerChatSummaryWorkspacePathClickPayload {
  path: string;
  turnId: string;
  threadId?: string | null;
  environmentId?: string | null;
  agentName?: string | null;
  sourceType: "run_summary" | "working_log" | "deep_research_report";
}

type RunnerThreadHistoryRole = "user" | "assistant";

interface RunnerThreadHistoryItem {
  id: string;
  turnId: string;
  role: RunnerThreadHistoryRole;
  label: string;
  preview: string;
}

interface PendingRunnerMessage {
  id: string;
  turnId: string;
  prompt: string;
  attachments: LocalAttachment[];
  quotedSelection?: RunnerQuotedSelection | null;
  backlogCommand?: StagedBacklogCommand | null;
  resourceCreationCommand?: StagedResourceCreationCommand | null;
  agentCreationCommand?: StagedAgentCreationCommand | null;
  skillCreationCommand?: StagedSkillCreationCommand | null;
}

interface BaseStagedBacklogCommand {
  label: string;
}

interface StagedBacklogSubtaskCommand extends BaseStagedBacklogCommand {
  action: "subtask";
  ticketNumber: string;
}

interface StagedBacklogMissionControlCommand extends BaseStagedBacklogCommand {
  action: "mission_control";
}

type StagedBacklogCommand = StagedBacklogSubtaskCommand | StagedBacklogMissionControlCommand;
type RunnerResourceCreationCommandType = "computer" | "app" | "function";
type RunnerAgentCreationCommandType = "agent" | "team";
type RunnerSkillCreationCommandType = "skill";

interface StagedResourceCreationCommand extends BaseStagedBacklogCommand {
  action: RunnerResourceCreationCommandType;
}

interface StagedAgentCreationCommand extends BaseStagedBacklogCommand {
  action: RunnerAgentCreationCommandType;
}

interface StagedSkillCreationCommand extends BaseStagedBacklogCommand {
  action: RunnerSkillCreationCommandType;
}

interface RunnerTaskPreview {
  taskId: string;
  projectId: string;
  projectName?: string;
  threadId?: string;
  ticketNumber: string;
  title: string;
  description?: string;
  taskColor?: string;
  status?: string;
  priority?: string;
  taskType?: string;
  assigneeAgentId?: string;
  assigneeName?: string;
  assigneePhotoUrl?: string;
  environmentId?: string;
  environmentName?: string;
  runKind?: string;
  reviewRequest?: boolean;
  showPromptPreview?: boolean;
  reviewCommentId?: string;
  isDeleted?: boolean;
}

interface RunnerMissionControlPreview {
  prompt?: string;
  projectName?: string;
  projectIcon?: ReactNode;
  agentName?: string;
  agentPhotoUrl?: string;
}

type RunnerTurnSummaryPreviewItem =
  | {
      id: string;
      kind: "attachment";
      attachment: RunnerTurnAttachment;
    }
  | {
      id: string;
      kind: "resource";
      resource: RunnerCreatedResourcePreview;
    };

interface PendingEditConfirmation {
  turnId: string;
  nextPrompt: string;
  changedFiles: Array<{
    path: string;
    kind: "created" | "modified" | "deleted";
    additions?: number;
    deletions?: number;
  }>;
}

interface RunnerSelectedSubagentDetail {
  turnId: string;
  invocationId: string;
}

interface RunnerSelectedDeepResearchDetail {
  turnId: string;
}

interface RunnerSelectedComputerUseDetail {
  turnId: string;
  groupId: string;
}

interface RunnerSelectedDeepResearchDetailPresentation {
  turn: RunnerTurn;
  logs: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session: RunnerDeepResearchSession | null;
  timeLabel?: string;
  fallbackTopic?: string | null;
}

type RunnerForkFileCopyMode = "all" | "thread_only" | "none";
type RunnerForkTarget = "existing_environment" | "new_forked_environment";
type RunnerForkExistingEnvironmentFileCopyMode = "thread_only" | "none";

interface PendingForkConfiguration {
  source: "message" | "thread";
  sourceThreadId: string;
  stagedPrompt: string;
  attachments?: LocalAttachment[];
  quotedSelection?: RunnerQuotedSelection | null;
  turn?: RunnerTurn;
  restoreSelectedEnvironmentId?: string | null;
}

function extractDeepResearchSessionIdFromLogs(logs: RunnerLog[], runningCommandLog?: RunnerLog): string | null {
  const sessionIdFromLogs = logs.find(
    (log) => typeof log.metadata?.deepResearch?.sessionId === "string" && log.metadata.deepResearch.sessionId.trim()
  )?.metadata?.deepResearch?.sessionId;
  if (typeof sessionIdFromLogs === "string" && sessionIdFromLogs.trim()) {
    return sessionIdFromLogs.trim();
  }
  const commandSessionId = runningCommandLog?.metadata?.deepResearch?.sessionId;
  return typeof commandSessionId === "string" && commandSessionId.trim() ? commandSessionId.trim() : null;
}

function extractDeepResearchTopicFromGroup(logs: RunnerLog[], runningCommandLog?: RunnerLog): string {
  const topicFromLogs = logs.find(
    (log) => typeof log.metadata?.deepResearch?.topic === "string" && log.metadata.deepResearch.topic.trim()
  )?.metadata?.deepResearch?.topic;
  if (typeof topicFromLogs === "string" && topicFromLogs.trim()) {
    return topicFromLogs.trim();
  }
  const command = typeof runningCommandLog?.metadata?.command === "string" ? runningCommandLog.metadata.command : "";
  const match = command.match(/deep-research\.py\s+["']([^"']+)["']/i);
  return match?.[1]?.trim() || "";
}

function resolveDeepResearchSessionForGroup(params: {
  logs: RunnerLog[];
  runningCommandLog?: RunnerLog;
  turn: RunnerTurn;
  sessions: RunnerDeepResearchSession[];
}): RunnerDeepResearchSession | null {
  const sessionId = extractDeepResearchSessionIdFromLogs(params.logs, params.runningCommandLog);
  if (sessionId) {
    return params.sessions.find((session) => session.id === sessionId) || null;
  }

  const topic = extractDeepResearchTopicFromGroup(params.logs, params.runningCommandLog).toLowerCase();
  const turnStartedAt = params.turn.startedAtMs;
  const candidateSessions = params.sessions.filter((session) => {
    if (topic && session.topic.trim().toLowerCase() === topic) {
      return true;
    }
    const createdAtMs = parseIsoTimestampMs(session.startedAt) ?? parseIsoTimestampMs(session.createdAt);
    return createdAtMs !== null && Math.abs(createdAtMs - turnStartedAt) <= 15 * 60 * 1000;
  });

  if (candidateSessions.length <= 1) {
    return candidateSessions[0] || null;
  }

  return candidateSessions
    .slice()
    .sort((left, right) => {
      const leftMs = parseIsoTimestampMs(left.startedAt) ?? parseIsoTimestampMs(left.createdAt) ?? 0;
      const rightMs = parseIsoTimestampMs(right.startedAt) ?? parseIsoTimestampMs(right.createdAt) ?? 0;
      return Math.abs(leftMs - turnStartedAt) - Math.abs(rightMs - turnStartedAt);
    })[0] || null;
}

function isDeepResearchSessionActive(session: RunnerDeepResearchSession | null | undefined): boolean {
  if (!session) {
    return false;
  }
  const normalizedStatus = typeof session.status === "string" ? session.status.trim().toLowerCase() : "";
  return Boolean(normalizedStatus) &&
    normalizedStatus !== "completed" &&
    normalizedStatus !== "failed" &&
    normalizedStatus !== "timeout" &&
    normalizedStatus !== "cancelled";
}

interface RunnerConversationMessage {
  id?: string;
  role: string;
  content: string;
  createdAt?: string;
  logMetadata?: Record<string, unknown> | null;
}

function getRecordString(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

function sanitizeRunnerBudgetMessage(value: string): string {
  return String(value || "")
    .replace(
      /Insufficient budget:\s*Insufficient balance:\s*\$-?\d+(?:\.\d+)?\.?\s*Please add funds\.?/gi,
      "Insufficient budget: Insufficient balance. Please add Compute Tokens or upgrade your plan to continue."
    )
    .replace(
      /Insufficient balance:\s*\$-?\d+(?:\.\d+)?\.?\s*Please add funds\.?/gi,
      "Insufficient balance. Please add Compute Tokens or upgrade your plan to continue."
    );
}

function normalizeRunnerConversationMessageContent(value: unknown): string {
  if (typeof value === "string") {
    return sanitizeRunnerBudgetMessage(value);
  }
  if (!Array.isArray(value)) {
    return "";
  }
  const normalized = value
    .map((entry) => {
      if (typeof entry === "string") {
        return entry;
      }
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
        return "";
      }
      const record = entry as Record<string, unknown>;
      return getRecordString(record, ["text", "content", "message"]);
    })
    .filter(Boolean)
    .join("\n")
    .trim();
  return sanitizeRunnerBudgetMessage(normalized);
}

function normalizeRunnerConversationMessage(value: unknown): RunnerConversationMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const role = getRecordString(record, ["role", "authorRole", "author_role"]).trim().toLowerCase();
  if (!role) {
    return null;
  }

  const content = normalizeRunnerConversationMessageContent(record.content ?? record.message ?? record.text);
  const logMetadataCandidate =
    record.logMetadata && typeof record.logMetadata === "object" && !Array.isArray(record.logMetadata)
      ? record.logMetadata
      : record.log_metadata && typeof record.log_metadata === "object" && !Array.isArray(record.log_metadata)
        ? record.log_metadata
        : null;
  const directAttachments = Array.isArray(record.attachments) ? record.attachments : null;
  const logMetadata =
    logMetadataCandidate || directAttachments
      ? {
          ...((logMetadataCandidate as Record<string, unknown> | null) || {}),
          ...(directAttachments ? { attachments: directAttachments } : {}),
        }
      : null;

  return {
    id: getRecordString(record, ["id", "messageId", "message_id"]) || undefined,
    role,
    content,
    createdAt: getRecordString(record, ["createdAt", "created_at", "created", "timestamp"]) || undefined,
    logMetadata,
  };
}

function sortRunnerConversationMessagesChronologically(messages: RunnerConversationMessage[]): RunnerConversationMessage[] {
  if (messages.length < 2) {
    return messages;
  }

  const entries = messages.map((message, index) => ({
    message,
    index,
    timestampMs: parseIsoTimestampMs(message.createdAt),
  }));

  const canonicalEntries = entries.filter((entry) => entry.message.role === "user" || entry.message.role === "assistant");
  const canSort =
    entries.every((entry) => entry.timestampMs !== null) ||
    (canonicalEntries.length > 0 && canonicalEntries.every((entry) => entry.timestampMs !== null));
  if (!canSort) {
    return messages;
  }

  return [...entries]
    .sort((left, right) => {
      if (left.timestampMs === null || right.timestampMs === null) {
        if (left.timestampMs === null && right.timestampMs === null) {
          return left.index - right.index;
        }
        return left.timestampMs === null ? 1 : -1;
      }
      if (left.timestampMs !== right.timestampMs) {
        return left.timestampMs - right.timestampMs;
      }
      return left.index - right.index;
    })
    .map((entry) => entry.message);
}

function getRunnerLogAbsoluteTimestampMs(log: RunnerLog): number | null {
  const createdAtMs = parseIsoTimestampMs(log.createdAt);
  if (createdAtMs !== null) {
    return createdAtMs;
  }
  return parseIsoTimestampMs(log.time);
}

function sortRunnerLogsChronologically(logs: RunnerLog[]): RunnerLog[] {
  if (logs.length < 2) {
    return logs;
  }

  const entries = logs.map((log, index) => ({
    log,
    index,
    timestampMs: getRunnerLogAbsoluteTimestampMs(log),
  }));

  if (!entries.every((entry) => entry.timestampMs !== null)) {
    return logs;
  }

  return [...entries]
    .sort((left, right) => {
      if (left.timestampMs !== right.timestampMs) {
        return (left.timestampMs ?? 0) - (right.timestampMs ?? 0);
      }
      return left.index - right.index;
    })
    .map((entry) => entry.log);
}

function isLocalAttachmentRecord(attachment: LocalAttachment | RunnerTurnAttachment): attachment is LocalAttachment {
  return "file" in attachment;
}

function getGithubAttachmentRepoFullName(attachment: LocalAttachment | RunnerTurnAttachment): string {
  if (isLocalAttachmentRecord(attachment)) {
    return String(attachment.githubRepoFullName || "").trim();
  }
  return String(attachment.githubRepoFullName || "").trim();
}

function getGithubAttachmentPath(attachment: LocalAttachment | RunnerTurnAttachment): string {
  if (isLocalAttachmentRecord(attachment)) {
    return String(attachment.githubItemPath || "").trim();
  }
  return String(attachment.githubItemPath || "").trim();
}

function getGithubAttachmentRef(attachment: LocalAttachment | RunnerTurnAttachment): string {
  if (isLocalAttachmentRecord(attachment)) {
    return String(attachment.githubRef || "").trim();
  }
  return String(attachment.githubRef || "").trim();
}

function isGithubAttachmentSelection(attachment: LocalAttachment | RunnerTurnAttachment): boolean {
  const integrationSource = isLocalAttachmentRecord(attachment)
    ? attachment.integrationSource
    : attachment.integrationSource;
  if (integrationSource !== "github" || !getGithubAttachmentRepoFullName(attachment)) {
    return false;
  }
  const selectionType = isLocalAttachmentRecord(attachment)
    ? attachment.githubSelectionType
    : attachment.githubSelectionType;
  const workspacePath = isLocalAttachmentRecord(attachment)
    ? attachment.resolvedAttachment?.workspacePath || ""
    : attachment.workspacePath || "";
  return selectionType === "repo" || selectionType === "file" || String(workspacePath || "").startsWith("/workspace/GitHub/");
}

function getGithubRepoName(repoFullName: string): string {
  const normalized = String(repoFullName || "").trim();
  if (!normalized) {
    return "repository";
  }
  return normalized.split("/").pop() || normalized;
}

function getGithubAttachmentDisplayName(attachment: LocalAttachment | RunnerTurnAttachment): string {
  const repoFullName = getGithubAttachmentRepoFullName(attachment);
  const repoName = getGithubRepoName(repoFullName);
  const selectionPath = getGithubAttachmentPath(attachment);
  if (!selectionPath) {
    return repoName;
  }
  const selectionName = selectionPath.split("/").filter(Boolean).pop() || selectionPath;
  return `${repoName}/${selectionName}`;
}

function getAttachmentDisplayName(attachment: LocalAttachment | RunnerTurnAttachment): string {
  if (isGithubAttachmentSelection(attachment)) {
    return getGithubAttachmentDisplayName(attachment);
  }
  return isLocalAttachmentRecord(attachment) ? attachment.file.name : attachment.filename;
}

function getAttachmentPreviewUrl(attachment: LocalAttachment | RunnerTurnAttachment): string | undefined {
  return isLocalAttachmentRecord(attachment) ? attachment.previewUrl : attachment.previewUrl || attachment.url;
}

function buildRunnerThreadHistoryItemId(turnId: string, role: RunnerThreadHistoryRole): string {
  return `${turnId}:${role}`;
}

function buildRunnerThreadHistoryPreviewText(content: string): string {
  const normalized = stripSystemTags(String(content || "")).replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  if (normalized.length <= RUNNER_THREAD_HISTORY_PREVIEW_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, RUNNER_THREAD_HISTORY_PREVIEW_LENGTH).trimEnd()}…`;
}

function getRunnerThreadHistoryLineWidth(index: number, activeIndex: number): number {
  if (index === activeIndex) {
    return RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH;
  }
  if (index === 0) {
    return RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH;
  }
  return index % 2 === 1
    ? RUNNER_THREAD_HISTORY_MEDIUM_LINE_WIDTH
    : RUNNER_THREAD_HISTORY_SMALL_LINE_WIDTH;
}

function encodeGithubBrowserSegment(value: string | null | undefined): string {
  return encodeURIComponent(String(value || "").trim());
}

function decodeGithubBrowserSegment(value: string | null | undefined): string {
  try {
    return decodeURIComponent(String(value || ""));
  } catch {
    return String(value || "");
  }
}

function createGithubBrowserRepoFolderId(repoFullName: string, ref?: string | null): string {
  return `github-repo:${encodeGithubBrowserSegment(repoFullName)}:${encodeGithubBrowserSegment(ref || "")}`;
}

function createGithubBrowserNodeId(repoFullName: string, path: string, ref?: string | null): string {
  return `github-node:${encodeGithubBrowserSegment(repoFullName)}:${encodeGithubBrowserSegment(ref || "")}:${encodeGithubBrowserSegment(path || "")}`;
}

function parseGithubBrowserFolderId(folderId: string | null | undefined): {
  repoFullName: string;
  path: string;
  ref: string;
  isRoot: boolean;
} {
  if (!folderId || folderId === "root") {
    return { repoFullName: "", path: "", ref: "", isRoot: true };
  }

  if (folderId.startsWith("github-repo:")) {
    const value = folderId.slice("github-repo:".length);
    const separatorIndex = value.indexOf(":");
    if (separatorIndex === -1) {
      return {
        repoFullName: value,
        path: "",
        ref: "",
        isRoot: false,
      };
    }
    return {
      repoFullName: decodeGithubBrowserSegment(value.slice(0, separatorIndex)),
      path: "",
      ref: decodeGithubBrowserSegment(value.slice(separatorIndex + 1)),
      isRoot: false,
    };
  }

  if (folderId.startsWith("github-node:")) {
    const value = folderId.slice("github-node:".length);
    const firstSeparatorIndex = value.indexOf(":");
    if (firstSeparatorIndex === -1) {
      return { repoFullName: value, path: "", ref: "", isRoot: false };
    }
    const secondSeparatorIndex = value.indexOf(":", firstSeparatorIndex + 1);
    if (secondSeparatorIndex === -1) {
      return {
        repoFullName: value.slice(0, firstSeparatorIndex),
        path: value.slice(firstSeparatorIndex + 1),
        ref: "",
        isRoot: false,
      };
    }
    return {
      repoFullName: decodeGithubBrowserSegment(value.slice(0, firstSeparatorIndex)),
      ref: decodeGithubBrowserSegment(value.slice(firstSeparatorIndex + 1, secondSeparatorIndex)),
      path: decodeGithubBrowserSegment(value.slice(secondSeparatorIndex + 1)),
      isRoot: false,
    };
  }

  return { repoFullName: "", path: "", ref: "", isRoot: true };
}

function isAttachmentDocumentPreviewable(attachment: RunnerTurnAttachment): boolean {
  if (isGithubAttachmentSelection(attachment)) {
    return false;
  }
  return isRunnerDocumentPreviewable(attachment);
}

const MAX_QUOTED_SELECTION_LENGTH = 4000;
const QUOTED_SELECTION_PREVIEW_LENGTH = 140;
const COMPOSER_QUOTED_SELECTION_ANIMATION_MS = 220;

interface RunnerThreadHydrationPayload {
  threadId: string;
  threadStatus?: string | null;
  threadUpdatedAt?: string | null;
  threadEnvironmentId?: string | null;
  threadEnvironmentName?: string | null;
  initialPrompt: string;
  logs: RunnerLog[];
  messages: RunnerConversationMessage[];
  durationSeconds?: number | null;
  startedAtMs?: number | null;
  completedAtMs?: number | null;
  agentName?: string | null;
  environmentName?: string | null;
}

interface RunnerThreadDiffEntry {
  path?: string;
  additions?: number;
  deletions?: number;
  changes?: string;
  diff?: string;
  createdAt?: string;
}

interface RunnerParsedThreadStep {
  id: string;
  sequence: number;
  stepKind: string;
  eventType: string | null;
  title: string;
  createdAt: string;
  metadata: Record<string, unknown> | null;
}

interface RunnerTurnFilePreview {
  path: string;
  kind: "created" | "modified" | "deleted";
  content?: string;
  diff?: string;
  additions?: number;
  deletions?: number;
}

export type RunnerChatInputMode = "minimal" | "computer-agents";

export interface RunnerChatOption {
  id: string;
  name: string;
  description?: string;
  isDefault?: boolean;
}

type RunnerAgentSelectorMode = "agents" | "teams" | "humans";
type RunnerWorkspaceSelectorMode = "computers" | "projects";

export interface RunnerChatProjectOption extends RunnerChatOption {
  defaultEnvironmentId?: string | null;
  environmentId?: string | null;
  color?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface RunnerChatProjectsConfig {
  items?: RunnerChatProjectOption[];
  selectedProjectId?: string | null;
  onProjectChange?: (projectId: string) => void;
}

type RunnerAgentOptionRecord = RunnerChatOption & {
  agentType?: string | null;
  photoUrl?: string | null;
  photoURL?: string | null;
  avatarUrl?: string | null;
  avatarURL?: string | null;
  profile?: unknown;
  metadata?: unknown;
};

function orderOptionsWithPinnedTop<T extends RunnerChatOption>(options: T[], pinnedId: string | null): T[] {
  if (!pinnedId) {
    return options;
  }
  const pinnedIndex = options.findIndex((option) => option.id === pinnedId);
  if (pinnedIndex <= 0) {
    return options;
  }
  return [options[pinnedIndex], ...options.slice(0, pinnedIndex), ...options.slice(pinnedIndex + 1)];
}

function mergeRunnerChatOptions(primary: RunnerChatOption[], additions: Array<RunnerChatOption | null | undefined>): RunnerChatOption[] {
  const merged = new Map<string, RunnerChatOption>();
  for (const option of primary) {
    if (option.id.trim()) {
      merged.set(option.id, option);
    }
  }
  for (const option of additions) {
    if (!option || !option.id.trim()) continue;
    const existing = merged.get(option.id);
    merged.set(option.id, existing ? { ...option, ...existing, name: existing.name || option.name } : option);
  }
  return Array.from(merged.values());
}

function getRunnerProjectEnvironmentId(project: RunnerChatProjectOption | null | undefined): string {
  if (!project) {
    return "";
  }
  const directDefaultEnvironmentId = typeof project.defaultEnvironmentId === "string" ? project.defaultEnvironmentId.trim() : "";
  if (directDefaultEnvironmentId) {
    return directDefaultEnvironmentId;
  }
  const directEnvironmentId = typeof project.environmentId === "string" ? project.environmentId.trim() : "";
  if (directEnvironmentId) {
    return directEnvironmentId;
  }
  const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
    ? project.metadata
    : null;
  const metadataDefaultEnvironmentId =
    metadata && typeof metadata.defaultEnvironmentId === "string" ? metadata.defaultEnvironmentId.trim() : "";
  if (metadataDefaultEnvironmentId) {
    return metadataDefaultEnvironmentId;
  }
  return metadata && typeof metadata.environmentId === "string" ? metadata.environmentId.trim() : "";
}

function isRunnerTeamAgentOption(option: RunnerChatOption | null | undefined): boolean {
  if (!option) {
    return false;
  }

  const candidate = option as RunnerAgentOptionRecord;
  if (typeof candidate.agentType === "string" && candidate.agentType.trim() === "team") {
    return true;
  }

  const metadata = candidate.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }

  const kind = "kind" in metadata && typeof metadata.kind === "string" ? metadata.kind.trim() : "";
  const team = "team" in metadata && metadata.team && typeof metadata.team === "object" && !Array.isArray(metadata.team)
    ? metadata.team
    : null;

  return kind === "team" && Boolean(team);
}

function isRunnerHumanAgentOption(option: RunnerChatOption | null | undefined): boolean {
  if (!option) {
    return false;
  }

  const candidate = option as RunnerAgentOptionRecord;
  if (typeof candidate.agentType === "string" && candidate.agentType.trim() === "human") {
    return true;
  }

  const metadata = candidate.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return false;
  }

  const kind = "kind" in metadata && typeof metadata.kind === "string" ? metadata.kind.trim() : "";
  return kind === "human";
}

function getRunnerAgentOptionPhotoUrl(option: RunnerChatOption | null | undefined): string {
  if (!option) {
    return "";
  }

  const candidate = option as RunnerAgentOptionRecord;
  const directPhotoUrl =
    typeof candidate.photoUrl === "string" && candidate.photoUrl.trim()
      ? candidate.photoUrl.trim()
      : typeof candidate.photoURL === "string" && candidate.photoURL.trim()
        ? candidate.photoURL.trim()
        : typeof candidate.avatarUrl === "string" && candidate.avatarUrl.trim()
          ? candidate.avatarUrl.trim()
          : typeof candidate.avatarURL === "string" && candidate.avatarURL.trim()
            ? candidate.avatarURL.trim()
            : "";
  if (directPhotoUrl) {
    return directPhotoUrl;
  }

  const profile = candidate.profile;
  if (profile && typeof profile === "object" && !Array.isArray(profile)) {
    const profilePhotoUrl =
      "photoUrl" in profile && typeof profile.photoUrl === "string" && profile.photoUrl.trim()
        ? profile.photoUrl.trim()
        : "photoURL" in profile && typeof profile.photoURL === "string" && profile.photoURL.trim()
          ? profile.photoURL.trim()
          : "avatarUrl" in profile && typeof profile.avatarUrl === "string" && profile.avatarUrl.trim()
            ? profile.avatarUrl.trim()
            : "";
    if (profilePhotoUrl) {
      return profilePhotoUrl;
    }
  }

  const metadata = candidate.metadata;
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const metadataPhotoUrl =
      "photoUrl" in metadata && typeof metadata.photoUrl === "string" && metadata.photoUrl.trim()
        ? metadata.photoUrl.trim()
        : "photoURL" in metadata && typeof metadata.photoURL === "string" && metadata.photoURL.trim()
          ? metadata.photoURL.trim()
          : "avatarUrl" in metadata && typeof metadata.avatarUrl === "string" && metadata.avatarUrl.trim()
            ? metadata.avatarUrl.trim()
            : "";
    if (metadataPhotoUrl) {
      return metadataPhotoUrl;
    }
    const metadataProfile =
      "profile" in metadata && metadata.profile && typeof metadata.profile === "object" && !Array.isArray(metadata.profile)
        ? metadata.profile
        : null;
    if (metadataProfile) {
      const metadataProfilePhotoUrl =
        "photoUrl" in metadataProfile && typeof metadataProfile.photoUrl === "string" && metadataProfile.photoUrl.trim()
          ? metadataProfile.photoUrl.trim()
          : "photoURL" in metadataProfile && typeof metadataProfile.photoURL === "string" && metadataProfile.photoURL.trim()
            ? metadataProfile.photoURL.trim()
            : "avatarUrl" in metadataProfile && typeof metadataProfile.avatarUrl === "string" && metadataProfile.avatarUrl.trim()
              ? metadataProfile.avatarUrl.trim()
              : "";
      if (metadataProfilePhotoUrl) {
        return metadataProfilePhotoUrl;
      }
    }
  }

  return "";
}

function getRunnerAgentSelectorMode(option: RunnerChatOption | null | undefined): RunnerAgentSelectorMode {
  if (isRunnerHumanAgentOption(option)) {
    return "humans";
  }
  return isRunnerTeamAgentOption(option) ? "teams" : "agents";
}

export interface RunnerChatSkill {
  id: string;
  name: string;
  description?: string;
  enabled?: boolean;
  icon?: string | null;
  isCustom?: boolean;
}

export interface RunnerChatExternalRunRequest {
  token: string | number;
  threadId: string;
  prompt: string;
  displayPrompt?: string | null;
  agentId?: string | null;
  agentName?: string | null;
  attachments?: RunnerAttachment[] | null;
  githubRepo?: {
    repoFullName: string;
    repoName: string;
    branch: string;
  } | null;
  enabledSkills?: Record<string, unknown> | null;
  environmentId?: string | null;
  projectId?: string | null;
  quotedSelection?: RunnerQuotedSelection | null;
}

export interface RunnerChatProjectTaskSubmitPayload {
  prompt: string;
  taskPreview: RunnerTaskPreview;
  attachments: RunnerAttachment[];
  environmentId: string | null;
  projectId?: string | null;
  agentId: string | null;
  agentName?: string | null;
  githubRepo?: {
    repoFullName: string;
    repoName: string;
    branch: string;
  } | null;
  enabledSkills?: Record<string, unknown> | null;
  quotedSelection?: RunnerQuotedSelection | null;
}

export interface RunnerChatFileNode {
  id: string;
  name: string;
  parentId?: string | null;
  isFolder?: boolean;
  hasChildren?: boolean;
  mimeType?: string;
  size?: number;
  modifiedTime?: string;
  createdTime?: string;
  previewUrl?: string;
  path?: string;
  repoFullName?: string;
  ref?: string;
}

export interface RunnerChatNotionDatabase {
  id: string;
  name: string;
  icon?: string | null;
}

export interface RunnerChatSchedulePreset {
  id: string;
  label: string;
  cron?: string;
}

export interface RunnerChatFetchedFileContent {
  content: string;
  mimeType?: string;
  encoding?: "base64" | "text";
  name?: string;
}

export interface RunnerChatGithubConfig {
  connected?: boolean;
  repositories?: RunnerChatOption[];
  selectedRepositoryId?: string;
  contexts?: RunnerChatOption[];
  selectedContextId?: string;
  contextLabel?: string;
  onAttach?: (fileIds: string[]) => void;
  onRepositoryChange?: (repositoryId: string) => void;
  onContextChange?: (contextId: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  fetchItems?: (folderId: string) => Promise<RunnerChatFileNode[]>;
  fetchBranches?: (repoFullName: string) => Promise<RunnerChatOption[]>;
  fetchFileContent?: (file: RunnerChatFileNode) => Promise<RunnerChatFetchedFileContent>;
}

export interface RunnerChatNotionConfig {
  connected?: boolean;
  databases?: RunnerChatNotionDatabase[];
  selectedDatabaseId?: string;
  onDatabaseChange?: (databaseId: string) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  fetchDatabases?: () => Promise<RunnerChatNotionDatabase[]>;
}

export interface RunnerChatDriveConfig {
  connected?: boolean;
  items?: RunnerChatFileNode[];
  rootLabel?: string;
  onAttach?: (fileIds: string[]) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  fetchItems?: (folderId: string) => Promise<RunnerChatFileNode[]>;
  fetchFileContent?: (file: RunnerChatFileNode) => Promise<RunnerChatFetchedFileContent>;
  onManageAccess?: () => Promise<void> | void;
}

export interface RunnerChatWorkspaceConfig {
  items?: RunnerChatFileNode[];
  rootLabel?: string;
  onAttach?: (fileIds: string[]) => void;
}

export interface RunnerChatScheduleConfig {
  enabled?: boolean;
  presets?: RunnerChatSchedulePreset[];
  onQuickSchedule?: (schedule: {
    scheduledTime: Date;
    scheduleType: "one-time" | "recurring";
    cronExpression?: string;
  }) => void;
  onOpenCalendarApp?: () => void;
}

export interface RunnerChatComputerAgentsConfig {
  github?: RunnerChatGithubConfig;
  notion?: RunnerChatNotionConfig;
  googleDrive?: RunnerChatDriveConfig;
  oneDrive?: RunnerChatDriveConfig;
  workspace?: RunnerChatWorkspaceConfig;
  schedule?: RunnerChatScheduleConfig;
  projects?: RunnerChatProjectsConfig;
}

export interface RunnerChatSkillDefaults {
  imageGeneration?: {
    model?: string;
    quality?: string;
    computeTokensPerImage?: number;
  };
}

export interface RunnerChatProps {
  backendUrl: string;
  apiKey: string;
  speechToTextUrl?: string;
  fetchCustomSkills?: () => Promise<RunnerChatSkill[]>;
  requestHeaders?: HeadersInit;
  environmentId?: string;
  projectId?: string | null;
  agentId?: string;
  appId?: string;
  threadId?: string;
  title?: string;
  threadMetadata?: Record<string, unknown> | null;
  placeholder?: string;
  privateMode?: boolean;
  initialTask?: string;
  hiddenSystemPrompt?: string;
  emptyState?: ReactNode;
  emptyStateAfterComposer?: ReactNode;
  className?: string;
  disabled?: boolean;
  autoCreateThread?: boolean;
  maxAttachments?: number;
  showUsageInStatus?: boolean;
  inputMode?: RunnerChatInputMode;
  agents?: RunnerChatOption[];
  hideAgentSelector?: boolean;
  environments?: RunnerChatOption[];
  hideEnvironmentSelector?: boolean;
  skills?: RunnerChatSkill[];
  skillDefaults?: RunnerChatSkillDefaults;
  computerAgents?: RunnerChatComputerAgentsConfig;
  uploadFiles?: (files: File[]) => Promise<RunnerAttachment[]>;
  mapFileToAttachment?: (file: File) => Promise<RunnerAttachment> | RunnerAttachment;
  onThreadIdChange?: (threadId: string) => void;
  onThreadTitleChange?: (threadId: string, title: string) => void;
  onThreadStatusChange?: (threadId: string, status: RunnerTurnStatus) => void;
  onRunStart?: (threadId: string) => void;
  onRunFinish?: (result: RunnerExecuteResult, threadId: string) => void;
  onRunCancel?: (threadId: string) => void;
  onRunError?: (error: Error, threadId?: string) => void;
  onAgentChange?: (agentId: string) => void;
  onEnvironmentChange?: (environmentId: string) => void;
  onSkillsChange?: (skillIds: string[]) => void;
  onContextIndicatorClick?: (context: RunnerChatThreadContext | null) => void;
  onActionSummaryClick?: (summary: RunnerChatActionSummaryClickPayload) => void;
  onSubagentDetailOpenChange?: (isOpen: boolean) => void;
  onDocumentPreviewOpenChange?: (isOpen: boolean) => void;
  onDeepResearchDetailOpenChange?: (isOpen: boolean) => void;
  threadTaskPreview?: RunnerTaskPreview | null;
  threadMissionControlPreview?: RunnerMissionControlPreview | null;
  composerProjectTasks?: RunnerTaskPreview[];
  selectedComposerProjectTask?: RunnerTaskPreview | null;
  showComposerCreateAgentAction?: boolean;
  onComposerCreateAgentClick?: () => void;
  onComposerProjectTaskChange?: (preview: RunnerTaskPreview | null) => void;
  onComposerProjectTaskSubmit?: (payload: RunnerChatProjectTaskSubmitPayload) => Promise<boolean | void> | boolean | void;
  activeTaskPreviewId?: string | null;
  onTaskPreviewClick?: (preview: RunnerTaskPreview) => void;
  onResourcePreviewClick?: (resource: RunnerCreatedResourcePreview) => void;
  onAgentTurnClick?: (payload: RunnerChatAgentTurnClickPayload) => void;
  onSummaryWorkspacePathClick?: (payload: RunnerChatSummaryWorkspacePathClickPayload) => void;
  subagentDetailPortalTarget?: Element | null;
  disableSubagentDetailDrawer?: boolean;
  externalRunRequest?: RunnerChatExternalRunRequest | null;
  onExternalRunRequestHandled?: (token: string | number) => void;
  onExternalRunRequestCreate?: (request: RunnerChatExternalRunRequest) => boolean | void;
  autoFocusComposer?: boolean;
  keepFocusOnSubmit?: boolean;
  enableBacklogSubtaskCommand?: boolean;
  backlogTaskConnectors?: Record<string, unknown> | null;
  backlogSubtaskCommand?: {
    ticketNumber: string;
    token: string | number;
    label?: string;
  } | null;
  enableBacklogMissionControlCommand?: boolean;
  backlogMissionControlCommand?: {
    token: string | number;
    label?: string;
  } | null;
  enableResourceCreationCommand?: boolean;
  resourceCreationCommand?: {
    type: RunnerResourceCreationCommandType;
    token: string | number;
    label?: string;
  } | null;
  resourceCreationCommandHiddenPrompt?: (commandType: RunnerResourceCreationCommandType) => string;
  onResourceCreationCommandChange?: (commandType: RunnerResourceCreationCommandType | null) => void;
  enableAgentCreationCommand?: boolean;
  agentCreationCommand?: {
    type: RunnerAgentCreationCommandType;
    token: string | number;
    label?: string;
  } | null;
  agentCreationCommandHiddenPrompt?: (commandType: RunnerAgentCreationCommandType) => string;
  onAgentCreationCommandChange?: (commandType: RunnerAgentCreationCommandType | null) => void;
  enableSkillCreationCommand?: boolean;
  skillCreationCommand?: {
    type: RunnerSkillCreationCommandType;
    token: string | number;
    label?: string;
  } | null;
  skillCreationCommandHiddenPrompt?: (commandType: RunnerSkillCreationCommandType) => string;
  onSkillCreationCommandChange?: (commandType: RunnerSkillCreationCommandType | null) => void;
  onOpenPluginsOverview?: () => void;
  onBacklogMissionControlSubmit?: (payload: {
    prompt: string;
    attachments: RunnerAttachment[];
    environmentId: string | null;
    projectId?: string | null;
    agentId: string | null;
    githubRepo?: {
      repoFullName: string;
      repoName: string;
      branch: string;
    } | null;
    enabledSkills?: Record<string, unknown> | null;
  }) => Promise<void> | void;
}

export interface RunnerChatActionSummaryClickPayload {
  actionType?: "compact" | "clear" | "fork" | "btw" | "revert" | "reapply";
  message: string;
  revertedChangeStepId?: string | null;
  revertedFilePath?: string | null;
  revertedFileName?: string | null;
}

interface RunnerChatThreadContext {
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

type RunnerChatThreadContextCategoryKey =
  | "system_prompt"
  | "skills"
  | "messages"
  | "free_space"
  | "autocompact_buffer"
  | "other";

interface RunnerChatThreadContextCategory {
  key: RunnerChatThreadContextCategoryKey;
  label: string;
  tokens: number;
  ratio: number;
  kind: "used" | "free" | "buffer" | "other";
}

interface RunnerChatThreadContextDetails extends RunnerChatThreadContext {
  categories: RunnerChatThreadContextCategory[];
  rawText?: string;
  estimate?: RunnerChatThreadContext;
}

type RunnerChatThreadContextAction = "compact" | "clear" | "fork" | "btw" | "revert" | "reapply";
type StagedThreadContextCommandTone = "compact" | "btw" | "fork" | "neutral";

interface RunnerChatThreadContextAvailableActions {
  compact: boolean;
  clear: boolean;
  btw: boolean;
  fork: boolean;
}

interface ParsedThreadContextCommand {
  action: "context" | RunnerChatThreadContextAction;
  prompt?: string;
}

const DEFAULT_COMPUTER_AGENT_SKILLS: RunnerChatSkill[] = [
  { id: "image_generation", name: "Image Generation", enabled: true },
  { id: "web_search", name: "Web Search", enabled: true },
  { id: "deep_research", name: "Deep Research", enabled: true },
  { id: "browser", name: "Browser", enabled: true },
  { id: "pdf", name: "PDF Processing", enabled: true },
  { id: "frontend_design", name: "Frontend Design", enabled: true },
  { id: "pptx", name: "PowerPoint/PPTX", enabled: true },
  { id: "memory", name: "Memory", enabled: true },
  { id: "task_management", name: "Task Management", enabled: true },
  { id: "computer_agents", name: "Computer Agents", enabled: true },
];
const DEFAULT_ENABLED_SKILL_IDS = ["image_generation", "web_search", "deep_research", "browser", "memory", "task_management", "computer_agents"] as const;
const RUNNER_CHAT_SKILL_ID_ALIASES: Record<string, string> = {
  deepResearch: "deep_research",
  deep_research: "deep_research",
  "deep-research": "deep_research",
  research: "deep_research",
};
const RUNNER_CHAT_ENABLED_SKILLS_STORAGE_KEY_PREFIX = "tb_runner_chat_enabled_skills_v2";
const RUNNER_CHAT_WORKSPACE_SELECTION_STORAGE_KEY_PREFIX = "tb_runner_chat_workspace_selection_v1";

const DEFAULT_SCHEDULE_PRESETS: RunnerChatSchedulePreset[] = [
  { id: "daily", label: "Every day", cron: "0 9 * * *" },
  { id: "weekdays", label: "Every weekday", cron: "0 9 * * 1-5" },
  { id: "weekly", label: "Every week", cron: "0 9 * * 1" },
];

const SPEECH_SAMPLE_RATE = 16000;
const SPEECH_WORKLET_BUFFER_SIZE = 2048;
const SPEECH_WORKLET_PROCESSOR_NAME = "tb-runner-speech-capture";
const SPEECH_QUEUE_LIMIT = 128;
const SPEECH_ACTIVITY_RMS_THRESHOLD = 0.009;
const SPEECH_ACTIVITY_HANGOVER_MS = 450;
const ATTACH_FILES_SHORTCUT_KEY = "u";
const SCHEDULE_SHORTCUT_KEY = "s";
const POPUP_ANIMATION_DURATION_MS = 180;
const DEFAULT_THREAD_CONTEXT_ACTIONS: RunnerChatThreadContextAvailableActions = {
  compact: false,
  clear: false,
  btw: true,
  fork: false,
};

const EMPTY_THREAD_CONTEXT_CATEGORIES: RunnerChatThreadContextCategory[] = [
  { key: "system_prompt", label: "System prompt", tokens: 0, ratio: 0, kind: "used" },
  { key: "skills", label: "Skills", tokens: 0, ratio: 0, kind: "used" },
  { key: "messages", label: "Thread context", tokens: 0, ratio: 0, kind: "used" },
  { key: "autocompact_buffer", label: "Autocompact buffer", tokens: 0, ratio: 0, kind: "buffer" },
  { key: "free_space", label: "Free space", tokens: 0, ratio: 0, kind: "free" },
];

type InputPopupId =
  | "main"
  | "context"
  | "skills"
  | "agent"
  | "environment"
  | "github"
  | "notion"
  | "google-drive"
  | "one-drive"
  | "schedule"
  | "attach-files";

type SpeechClientMessage = { type: "audio"; data: string } | { type: "activity-start" | "activity-end" };

type MainPopupRenderId = "main" | "context" | "agent" | "environment";
type SidePopupRenderId = Exclude<InputPopupId, MainPopupRenderId>;
type PopupAnimationPhase = "idle" | "enter" | "exit";
type SidePopupExitDirection = "left" | "down";

function isPlusPopupId(popup: InputPopupId | null): popup is Exclude<InputPopupId, "context" | "agent" | "environment"> {
  return popup === "main" || popup === "skills" || popup === "github" || popup === "notion" || popup === "google-drive" || popup === "one-drive" || popup === "schedule" || popup === "attach-files";
}

function getMainPopupRenderId(popup: InputPopupId | null): MainPopupRenderId | null {
  if (popup === "context" || popup === "agent" || popup === "environment") return popup;
  return isPlusPopupId(popup) ? "main" : null;
}

function getSidePopupRenderId(popup: InputPopupId | null): SidePopupRenderId | null {
  if (!popup || popup === "main" || popup === "context" || popup === "agent" || popup === "environment") {
    return null;
  }
  return popup;
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeBackendUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function getHeaderValue(headers: HeadersInit | undefined, name: string): string {
  return getRunnerPreviewHeaderValue(headers, name);
}

function buildRunnerHeaders(requestHeaders: HeadersInit | undefined, apiKey: string): Headers {
  return buildRunnerPreviewHeaders(requestHeaders, apiKey);
}

function formatCompactTokenCount(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1).replace(/\.0$/, "")}k`;
  }
  return String(value);
}

function deriveThreadContextDisplayMetrics(
  context: RunnerChatThreadContext | RunnerChatThreadContextDetails | null | undefined
): { usedTokens: number; remainingTokens: number; remainingRatio: number; usedRatio: number } {
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

function buildContextIndicatorTitle(
  context: RunnerChatThreadContext | RunnerChatThreadContextDetails | null,
  hasThread: boolean,
  isLoading: boolean
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

function getContextCategoryDisplayTokens(
  category: RunnerChatThreadContextCategory,
  metrics: ReturnType<typeof deriveThreadContextDisplayMetrics>
): number {
  if (category.key === "free_space") {
    return metrics.remainingTokens;
  }
  return Math.max(0, category.tokens);
}

function parseThreadContextCommand(input: string): ParsedThreadContextCommand | null {
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

function threadContextCategoryColor(category: RunnerChatThreadContextCategory): string {
  if (category.key === "system_prompt") return "#67e8f9";
  if (category.key === "skills") return "#60a5fa";
  if (category.key === "messages") return "#f8fafc";
  if (category.key === "autocompact_buffer") return "#fbbf24";
  if (category.key === "free_space") return "rgba(255, 255, 255, 0.18)";
  return "rgba(255, 255, 255, 0.4)";
}

function stagedThreadContextCommandTone(action: RunnerChatThreadContextAction | null): StagedThreadContextCommandTone | null {
  if (action === "compact") return "compact";
  if (action === "btw") return "btw";
  if (action === "fork") return "fork";
  if (action === "clear") return "neutral";
  return null;
}

function stagedThreadContextCommandOffset(action: RunnerChatThreadContextAction | null): string {
  if (action === "compact") return "82px";
  if (action === "clear") return "58px";
  if (action === "fork") return "52px";
  if (action === "btw") return "52px";
  return "16px";
}

function threadContextActionAllowsPrompt(action: RunnerChatThreadContextAction | null): boolean {
  return action === "compact" || action === "btw" || action === "fork";
}

function parseAutoStageThreadContextCommand(input: string): { action: RunnerChatThreadContextAction; prompt: string } | null {
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

function normalizeRunnerBacklogTicketNumber(value: string): string {
  const digits = String(value || "").replace(/\D+/g, "");
  if (!digits) {
    return "";
  }
  return digits.slice(-3).padStart(3, "0");
}

function buildRunnerBacklogSubtaskLabel(ticketNumber: string): string {
  const normalizedTicketNumber = normalizeRunnerBacklogTicketNumber(ticketNumber);
  return normalizedTicketNumber ? `Subtask to ${normalizedTicketNumber}` : "Subtask";
}

function buildRunnerMissionControlLabel(): string {
  return "Mission Control";
}

function buildRunnerResourceCreationLabel(commandType: RunnerResourceCreationCommandType): string {
  return `/${commandType}`;
}

function buildRunnerAgentCreationLabel(commandType: RunnerAgentCreationCommandType): string {
  return `/${commandType}`;
}

function buildRunnerSkillCreationLabel(commandType: RunnerSkillCreationCommandType): string {
  return `/${commandType}`;
}

function parseAutoStageBacklogSubtaskCommand(input: string): { ticketNumber: string; prompt: string } | null {
  const match = input.match(/^\/subtask\s+(\d{3})(?:\s+([\s\S]*))$/i);
  if (!match) {
    return null;
  }
  const ticketNumber = normalizeRunnerBacklogTicketNumber(match[1] || "");
  if (!ticketNumber) {
    return null;
  }
  return {
    ticketNumber,
    prompt: match[2] || "",
  };
}

function parseAutoStageBacklogMissionControlCommand(input: string): { prompt: string } | null {
  const match = input.match(/^\/mission-control(?:\s+([\s\S]*))?$/i);
  if (!match) {
    return null;
  }

  return {
    prompt: match[1] || "",
  };
}

function parseAutoStageResourceCreationCommand(input: string): { action: RunnerResourceCreationCommandType; prompt: string } | null {
  const match = input.match(/^\/(computer|app|function)(?:\s+([\s\S]*))?$/i);
  if (!match) {
    return null;
  }

  const action = String(match[1] || "").trim().toLowerCase() as RunnerResourceCreationCommandType;
  if (action !== "computer" && action !== "app" && action !== "function") {
    return null;
  }

  return {
    action,
    prompt: match[2] || "",
  };
}

function parseAutoStageAgentCreationCommand(input: string): { action: RunnerAgentCreationCommandType; prompt: string } | null {
  const match = input.match(/^\/(agent|team)(?:\s+([\s\S]*))?$/i);
  if (!match) {
    return null;
  }

  const action = String(match[1] || "").trim().toLowerCase() as RunnerAgentCreationCommandType;
  if (action !== "agent" && action !== "team") {
    return null;
  }

  return {
    action,
    prompt: match[2] || "",
  };
}

function parseAutoStageSkillCreationCommand(input: string): { action: RunnerSkillCreationCommandType; prompt: string } | null {
  const match = input.match(/^\/(skill)(?:\s+([\s\S]*))?$/i);
  if (!match) {
    return null;
  }

  return {
    action: "skill",
    prompt: match[2] || "",
  };
}

function normalizeRunnerTaskPreviewStatus(value: string | null | undefined): "todo" | "in_progress" | "blocked" | "done" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "in_progress" || normalized === "blocked" || normalized === "done") {
    return normalized;
  }
  return "todo";
}

function normalizeRunnerTaskPreviewPriority(value: string | null | undefined): "low" | "medium" | "high" | "critical" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high" || normalized === "critical") {
    return normalized;
  }
  return "medium";
}

function normalizeRunnerTaskPreviewType(value: string | null | undefined): "task" | "subtask" {
  return String(value || "").trim().toLowerCase() === "subtask" ? "subtask" : "task";
}

function normalizeRunnerTaskPreviewColor(value: string | null | undefined): "gray" | "blue" | "green" | "amber" | "rose" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "gray" || normalized === "green" || normalized === "amber" || normalized === "rose") {
    return normalized;
  }
  return normalized === "blue" ? "blue" : "gray";
}

function getRunnerTaskPreviewColorStyle(value: string | null | undefined): CSSProperties {
  const normalized = normalizeRunnerTaskPreviewColor(value);
  const presentation = normalized === "gray"
    ? {
        accent: "rgba(255, 255, 255, 0.92)",
        surface: "rgba(255, 255, 255, 0.05)",
        surfaceHover: "rgba(255, 255, 255, 0.07)",
        border: "rgba(255, 255, 255, 0.08)",
      }
    : normalized === "green"
    ? {
        accent: "#2ca36b",
        surface: "rgba(44, 163, 107, 0.12)",
        surfaceHover: "rgba(44, 163, 107, 0.16)",
        border: "rgba(44, 163, 107, 0.2)",
      }
    : normalized === "amber"
      ? {
          accent: "#c98a1f",
          surface: "rgba(201, 138, 31, 0.12)",
          surfaceHover: "rgba(201, 138, 31, 0.16)",
          border: "rgba(201, 138, 31, 0.2)",
        }
      : normalized === "rose"
        ? {
            accent: "#c45b87",
            surface: "rgba(196, 91, 135, 0.12)",
            surfaceHover: "rgba(196, 91, 135, 0.16)",
            border: "rgba(196, 91, 135, 0.2)",
          }
        : {
            accent: "#016bcb",
            surface: "rgba(1, 107, 203, 0.12)",
            surfaceHover: "rgba(1, 107, 203, 0.16)",
            border: "rgba(1, 107, 203, 0.2)",
          };
  return {
    "--tb-task-preview-accent": presentation.accent,
    "--tb-task-preview-surface": presentation.surface,
    "--tb-task-preview-surface-hover": presentation.surfaceHover,
    "--tb-task-preview-border": presentation.border,
  } as CSSProperties;
}

function getRunnerTaskPreviewStatusLabel(value: string | null | undefined): string {
  const normalized = normalizeRunnerTaskPreviewStatus(value);
  if (normalized === "in_progress") return "In doing";
  if (normalized === "blocked") return "Blocked";
  if (normalized === "done") return "Done";
  return "To do";
}

function renderRunnerTaskPreviewPriorityIcon(priority: string | null | undefined, className: string) {
  const normalized = normalizeRunnerTaskPreviewPriority(priority);
  if (normalized === "low") {
    return <LucideChevronDown className={`${className} is-low`} strokeWidth={2} />;
  }
  if (normalized === "high") {
    return <LucideChevronUp className={`${className} is-high`} strokeWidth={2} />;
  }
  if (normalized === "critical") {
    return <LucideChevronsUp className={`${className} is-critical`} strokeWidth={2} />;
  }
  return <LucideEqual className={`${className} is-medium`} strokeWidth={2} />;
}

function renderRunnerTaskPreviewAssigneeAvatar(taskPreview: RunnerTaskPreview) {
  const assigneeName = String(taskPreview?.assigneeName || "").trim();
  if (!assigneeName) {
    return null;
  }
  const assigneePhotoUrl = String(taskPreview?.assigneePhotoUrl || "").trim();

  return (
    <span className="tb-task-preview-assignee-avatar" aria-hidden="true" title={assigneeName}>
      {assigneePhotoUrl
        ? <img
            className="tb-task-preview-assignee-avatar-image"
            src={assigneePhotoUrl}
            alt={assigneeName.charAt(0).toUpperCase()}
          />
        : <span className="tb-task-preview-assignee-avatar-fallback">
            {assigneeName.charAt(0).toUpperCase()}
          </span>}
    </span>
  );
}

function renderTurnAgentAvatar(name: string, photoUrl?: string | null) {
  const normalizedName = String(name || "").trim();
  if (!normalizedName) {
    return null;
  }
  const normalizedPhotoUrl = String(photoUrl || "").trim();
  return (
    <span className="tb-turn-agent-avatar" aria-hidden="true" title={normalizedName}>
      {normalizedPhotoUrl
        ? <img
            className="tb-turn-agent-avatar-image"
            src={normalizedPhotoUrl}
            alt={normalizedName.charAt(0).toUpperCase()}
          />
        : <span className="tb-turn-agent-avatar-fallback">
            {normalizedName.charAt(0).toUpperCase()}
          </span>}
    </span>
  );
}

function renderRunnerTaskPreviewCard(
  taskPreview: RunnerTaskPreview,
  options: {
    onClick?: ((preview: RunnerTaskPreview) => void) | undefined;
  } = {}
) {
  const isTaskPreviewDeleted = Boolean(taskPreview?.isDeleted);

  return (
    <button
      type="button"
      className="tb-task-preview-card"
      style={getRunnerTaskPreviewColorStyle(taskPreview.taskColor)}
      disabled={isTaskPreviewDeleted}
      onClick={() => {
        if (!isTaskPreviewDeleted && typeof options.onClick === "function") {
          options.onClick(taskPreview);
        }
      }}
    >
      <div className="tb-task-preview-card-header">
        <div className="tb-task-preview-title">{taskPreview.title || "Untitled Task"}</div>
        {renderRunnerTaskPreviewAssigneeAvatar(taskPreview)}
      </div>
      <RunnerMarkdown
        content={String(taskPreview.description || "").trim() || "No description"}
        className="tb-task-preview-card-description tb-message-markdown"
        softBreaks
        disallowHeadings
      />
      <div className="tb-task-preview-card-bottom">
        <div className="tb-task-preview-card-meta-left">
          <div className={`tb-task-preview-type-badge ${normalizeRunnerTaskPreviewType(taskPreview.taskType) === "subtask" ? "is-subtask" : "is-task"}`.trim()}>
            {normalizeRunnerTaskPreviewType(taskPreview.taskType) === "subtask"
              ? <LucideCheck className="tb-task-preview-type-icon" strokeWidth={2} />
              : <LucideBookmark className="tb-task-preview-type-icon" strokeWidth={2} />}
          </div>
          {renderRunnerTaskPreviewPriorityIcon(taskPreview.priority, "tb-task-preview-priority-icon")}
          <span className={`tb-task-preview-status tb-task-preview-status-${normalizeRunnerTaskPreviewStatus(taskPreview.status)}`.trim()}>
            {getRunnerTaskPreviewStatusLabel(taskPreview.status)}
          </span>
        </div>
        <span className="tb-task-preview-ticket">{taskPreview.ticketNumber}</span>
      </div>
    </button>
  );
}

function renderRunnerMissionControlPreviewCard(preview: RunnerMissionControlPreview | null | undefined) {
  const prompt = String(preview?.prompt || "").trim() || "Run mission control.";
  const projectName = String(preview?.projectName || "").trim() || "Project";

  return (
    <div className="tb-task-preview-card tb-mission-control-preview-card" role="presentation">
      <div className="tb-mission-control-preview-header">
        <span className="tb-mission-control-preview-title">
          <span>Mission Control</span>
        </span>
      </div>
      <RunnerMarkdown
        content={prompt}
        className="tb-mission-control-preview-copy tb-message-markdown"
        softBreaks
        disallowHeadings
      />
      <div className="tb-mission-control-preview-footer">
        <span className="tb-mission-control-preview-project">
          <span className="tb-mission-control-preview-project-icon" aria-hidden="true">
            {preview?.projectIcon || <LucideRocket strokeWidth={1.8} />}
          </span>
          <span className="tb-mission-control-preview-project-name">{projectName}</span>
        </span>
      </div>
    </div>
  );
}

function getRunnerMissionControlAgentName(preview: RunnerMissionControlPreview | null | undefined) {
  return String(preview?.agentName || "").trim() || "Mission Control";
}

function getRunnerMissionControlAgentPhotoUrl(preview: RunnerMissionControlPreview | null | undefined) {
  return String(preview?.agentPhotoUrl || "").trim();
}

function getRunnerSummaryResourceSubtitle(resource: RunnerCreatedResourcePreview): string {
  if (resource.resourceType === "agent") {
    return [resource.model, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "skill") {
    return [resource.category, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "environment") {
    return [resource.projectName, resource.isDefault ? "Default" : ""].filter(Boolean).join(" · ");
  }
  if (resource.resourceType === "project") {
    return [resource.status, resource.projectName].filter(Boolean).join(" · ");
  }
  return [resource.status, resource.projectName].filter(Boolean).join(" · ");
}

function renderRunnerSummaryResourceIcon(resource: RunnerCreatedResourcePreview) {
  if (resource.resourceType === "agent") {
    return <LucideBot className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  if (resource.resourceType === "skill") {
    return <LucideCpu className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  if (resource.resourceType === "environment") {
    return <LucideCloud className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  if (resource.resourceType === "project") {
    return <LucideRocket className="runner-summary-resource-icon" strokeWidth={1.8} />;
  }
  return <LucideCalendar className="runner-summary-resource-icon" strokeWidth={1.8} />;
}

function getRunnerSummaryResourceChipVerb(resource: RunnerCreatedResourcePreview): string {
  return resource.mutationVerb === "updated" ? "Updated" : "Created";
}

function renderRunnerSummaryResourceChip(
  resource: RunnerCreatedResourcePreview,
  options: { onClick?: (resource: RunnerCreatedResourcePreview) => void } = {},
) {
  const typeLabel =
    resource.resourceType === "agent"
      ? "Agent"
      : resource.resourceType === "skill"
        ? "Skill"
        : resource.resourceType === "environment"
          ? "Environment"
          : resource.resourceType === "project"
            ? "Project"
          : "Release";
  const subtitle = getRunnerSummaryResourceSubtitle(resource);
  const isAgent = resource.resourceType === "agent";
  const className = `runner-summary-resource-chip is-${resource.resourceType} ${options.onClick ? "is-clickable" : ""}`.trim();
  const title = isAgent
    ? `${getRunnerSummaryResourceChipVerb(resource)} ${resource.name}`.trim()
    : [typeLabel, resource.name, subtitle].filter(Boolean).join(" · ");
  const content = isAgent ? (
    <>
      <span className={`runner-summary-resource-icon-slot is-${resource.resourceType}`.trim()} aria-hidden="true">
        {renderRunnerSummaryResourceIcon(resource)}
      </span>
      <span className="runner-summary-resource-inline-text">
        {getRunnerSummaryResourceChipVerb(resource)} {resource.name}
      </span>
    </>
  ) : (
    <>
      <span className={`runner-summary-resource-icon-slot is-${resource.resourceType}`.trim()} aria-hidden="true">
        {renderRunnerSummaryResourceIcon(resource)}
      </span>
      <span className="runner-summary-resource-copy">
        <span className="runner-summary-resource-label">{typeLabel}</span>
        <span className="runner-summary-resource-name">{resource.name}</span>
        {subtitle ? <span className="runner-summary-resource-meta">{subtitle}</span> : null}
      </span>
    </>
  );

  if (options.onClick) {
    return (
      <button
        type="button"
        className={className}
        title={title}
        onClick={() => options.onClick?.(resource)}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={className} title={title}>
      {content}
    </div>
  );
}

function formatThreadContextCommandText(action: RunnerChatThreadContextAction, prompt?: string): string {
  const trimmedPrompt = prompt?.trim();
  if (trimmedPrompt && threadContextActionAllowsPrompt(action)) {
    return `/${action} ${trimmedPrompt}`;
  }
  return `/${action}`;
}

function isThreadContextCommandPrompt(prompt: string, action?: string | null): boolean {
  const trimmed = prompt.trim();
  if (!trimmed.startsWith("/")) {
    return false;
  }
  if (!action) {
    return /^\/(compact|clear|fork|btw)\b/i.test(trimmed);
  }
  return new RegExp(`^/${action}\\b`, "i").test(trimmed);
}

function normalizeEnvironmentWorkspaceItems(input: unknown): RunnerChatFileNode[] {
  const rawItems = Array.isArray(input)
    ? input
    : input && typeof input === "object" && Array.isArray((input as { data?: unknown[] }).data)
      ? (input as { data: unknown[] }).data
      : input && typeof input === "object" && Array.isArray((input as { files?: unknown[] }).files)
        ? (input as { files: unknown[] }).files
      : [];

  const normalized = rawItems
    .map((entry): RunnerChatFileNode | null => {
      if (!entry || typeof entry !== "object") return null;
      const file = entry as Record<string, unknown>;
      const modifiedTime =
        typeof file.modifiedAt === "string"
          ? file.modifiedAt
          : typeof file.lastModified === "string"
            ? file.lastModified
            : typeof file.modifiedTime === "string"
              ? file.modifiedTime
              : typeof file.updatedAt === "string"
                ? file.updatedAt
                : undefined;
      const createdTime =
        typeof file.createdAt === "string"
          ? file.createdAt
          : typeof file.createdTime === "string"
            ? file.createdTime
            : undefined;
      const rawPath = typeof file.path === "string" ? file.path : "";
      const normalizedPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "");
      const explicitName = typeof file.name === "string" ? file.name : "";
      const name = explicitName || normalizedPath.split("/").filter(Boolean).pop() || "";
      if (!name) return null;

      const parentSegments = normalizedPath.split("/").filter(Boolean);
      parentSegments.pop();
      const parentId = parentSegments.length ? parentSegments.join("/") : null;
      const type = typeof file.type === "string" ? file.type : "";
      const isFolder = type === "directory" || type === "folder";
      const hasChildren =
        typeof file.hasChildren === "boolean"
          ? file.hasChildren
          : typeof file.childCount === "number"
            ? file.childCount > 0
            : undefined;

      return {
        id: normalizedPath || name,
        name,
        path: `/${normalizedPath}`,
        parentId,
        isFolder,
        hasChildren,
        mimeType: typeof file.mimeType === "string" ? file.mimeType : undefined,
        size: typeof file.size === "number" ? file.size : undefined,
        modifiedTime,
        createdTime,
      };
    })
    .filter((item): item is RunnerChatFileNode => item !== null);

  return normalized;
}

function getBrowserFileType(mimeType?: string, name?: string): "image" | "video" | "audio" | "pdf" | "code" | "spreadsheet" | "document" | "file" {
  if (!mimeType && !name) return "file";

  const ext = name?.split(".").pop()?.toLowerCase() || "";

  if (mimeType?.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "svg", "webp", "bmp"].includes(ext)) {
    return "image";
  }
  if (mimeType?.startsWith("video/") || ["mp4", "mov", "avi", "webm"].includes(ext)) {
    return "video";
  }
  if (mimeType?.startsWith("audio/") || ["mp3", "wav", "ogg", "m4a"].includes(ext)) {
    return "audio";
  }
  if (["pdf"].includes(ext)) {
    return "pdf";
  }
  if (["ts", "tsx", "js", "jsx", "json", "css", "html", "py", "go", "rs", "java", "cpp", "c", "h"].includes(ext)) {
    return "code";
  }
  if (["xlsx", "xls", "csv"].includes(ext)) {
    return "spreadsheet";
  }
  if (["doc", "docx", "txt", "md"].includes(ext)) {
    return "document";
  }
  return "file";
}

function attachmentTypeForFile(mimeType?: string, name?: string): RunnerAttachment["type"] {
  return getBrowserFileType(mimeType, name) === "image" ? "image" : "document";
}

function isBrowserFilePreviewable(file: RunnerChatFileNode): boolean {
  const fileType = getBrowserFileType(file.mimeType, file.name);
  return fileType === "image" || fileType === "code" || fileType === "document" || file.name.endsWith(".txt") || file.name.endsWith(".md") || file.name.endsWith(".json");
}

function buildEnvironmentFileDownloadUrl(backendUrl: string, environmentId: string, filePath?: string): string | null {
  return buildRunnerPreviewDownloadUrl(backendUrl, environmentId, filePath);
}

function normalizeRunnerWorkspaceFolderPath(folderPath?: string | null): string {
  return String(folderPath || "").trim().replace(/^\/+/, "").replace(/\/+$/, "");
}

function buildEnvironmentFileListUrl(backendUrl: string, environmentId: string, folderPath = "", depth = 1): string | null {
  const normalizedBackendUrl = sanitizeBackendUrl(backendUrl);
  const normalizedEnvironmentId = String(environmentId || "").trim();
  if (!normalizedBackendUrl || !normalizedEnvironmentId) {
    return null;
  }
  const normalizedFolderPath = normalizeRunnerWorkspaceFolderPath(folderPath);
  const params = new URLSearchParams();
  params.set("depth", String(depth));
  if (normalizedFolderPath) {
    params.set("path", normalizedFolderPath);
  }
  return `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/files?${params.toString()}`;
}

function isInternalTurnPreviewPath(filePath: string): boolean {
  const normalized = filePath.replace(/^\/workspace\/?/, "");
  return (
    normalized === ".claude.json" ||
    normalized.startsWith(".claude/") ||
    normalized.startsWith(".cache/") ||
    normalized.startsWith(".npm/") ||
    normalized.startsWith(".local/") ||
    normalized.startsWith("browser-skill/") ||
    normalized.startsWith("tmp/")
  );
}

function isInternalFileChangeLog(log: RunnerLog): boolean {
  if (log.eventType !== "file_change") return false;
  const filePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.filter((value): value is string =>
      typeof value === "string" && value.trim().length > 0 && !isRunnerHydratedNullDevicePath(value)
    )
    : [];
  return filePaths.length > 0 && filePaths.every((filePath) => {
    const normalizedPath = normalizeRunnerPreviewPath(filePath);
    return normalizedPath ? isInternalTurnPreviewPath(normalizedPath) : false;
  });
}

function resolveTurnPreviewMapValue<T>(source: Record<string, T> | undefined, filePath: string): T | undefined {
  if (!source) return undefined;
  return (
    source[filePath] ||
    source[filePath.replace(/^\/workspace\//, "")] ||
    source[filePath.replace(/^\/+/, "")] ||
    source[`/workspace/${filePath.replace(/^\/workspace\//, "").replace(/^\/+/, "")}`]
  );
}

function buildDeletedThreadPreviewDiff(filePath: string, content: string): string {
  const normalizedContent = content.replace(/\r\n/g, "\n");
  const lines = normalizedContent.split("\n");
  const body = lines.map((line) => `-${line}`).join("\n");
  return `--- a/${filePath}\n+++ /dev/null\n@@ -1,${lines.length} +0,0 @@\n${body}`;
}

function collectTurnFilePreviews(logs: RunnerLog[]): RunnerTurnFilePreview[] {
  const previewEntries = new Map<string, RunnerTurnFilePreview & { order: number }>();
  let order = 0;

  for (const log of logs) {
    const previews = collectRunnerLogFileChangePreviews(log);
    if (previews.length === 0) continue;

    for (const preview of previews) {
      const normalizedPath = normalizeRunnerPreviewPath(preview.path);
      if (!normalizedPath || isInternalTurnPreviewPath(normalizedPath)) continue;
      const changeKind = preview.kind;

      if (changeKind === "deleted") {
        const existing = previewEntries.get(normalizedPath);
        const deletedContent = typeof existing?.content === "string" ? existing.content : undefined;
        const deletedDiff =
          typeof preview.diff === "string" && preview.diff.trim().length > 0
            ? preview.diff
            : deletedContent
              ? buildDeletedThreadPreviewDiff(normalizedPath, deletedContent)
              : undefined;
        previewEntries.set(normalizedPath, {
          ...(existing || {}),
          path: normalizedPath,
          kind: "deleted",
          content: deletedContent,
          diff: deletedDiff,
          additions: typeof preview.additions === "number" ? preview.additions : 0,
          deletions:
            typeof preview.deletions === "number"
              ? preview.deletions
              : deletedContent
                ? deletedContent.replace(/\r\n/g, "\n").split("\n").length
                : undefined,
          order,
        });
        order += 1;
        continue;
      }
      const nextPreview: RunnerTurnFilePreview & { order: number } = {
        path: normalizedPath,
        kind: changeKind,
        content: preview.content,
        diff: preview.diff,
        additions: typeof preview.additions === "number" ? preview.additions : undefined,
        deletions: typeof preview.deletions === "number" ? preview.deletions : undefined,
        order,
      };

      const existing = previewEntries.get(normalizedPath);
      previewEntries.set(normalizedPath, {
        ...(existing || {}),
        ...nextPreview,
      });
      order += 1;
    }
  }

  return Array.from(previewEntries.values())
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...preview }) => preview)
    .filter((preview) => {
      const fileType = getBrowserFileType(undefined, getRunnerPreviewFilename(preview.path));
      return fileType !== "file" || Boolean(preview.content || preview.diff);
    });
}

function buildTurnSummaryPreviewAttachment(
  file: RunnerTurnFilePreview,
  options: { backendUrl?: string; environmentId?: string | null }
): RunnerTurnAttachment {
  return {
    ...buildRunnerPreviewAttachmentFromPath(file.path, {
      backendUrl: options.backendUrl,
      environmentId: options.environmentId,
      idPrefix: "summary-preview",
    }),
    workspacePath: file.path,
  };
}

function collectTurnSummaryPreviewAttachments(
  logs: RunnerLog[],
  options: { backendUrl?: string; environmentId?: string | null }
): RunnerTurnAttachment[] {
  return collectTurnFilePreviews(logs).map((file) => buildTurnSummaryPreviewAttachment(file, options));
}

function collectTurnSummaryPreviewResources(logs: RunnerLog[]): RunnerCreatedResourcePreview[] {
  const resources = logs.flatMap((log) => {
    const nextResources: RunnerCreatedResourcePreview[] = [];
    if (isComputerAgentsMutationLog(log)) {
      nextResources.push(
        ...collectComputerAgentsCreatedResources(log).filter((resource) => resource.resourceType === "agent")
      );
    }
    return nextResources;
  });
  const nextByKey = new Map<string, RunnerCreatedResourcePreview>();
  for (const resource of resources) {
    const key = `${resource.resourceType}:${String(resource.id || resource.name || "").trim().toLowerCase()}`;
    if (!key || key.endsWith(":")) continue;
    const existing = nextByKey.get(key);
    nextByKey.set(key, existing ? { ...existing, ...resource } : resource);
  }
  return Array.from(nextByKey.values());
}

function collectTurnSummaryPreviewItems(
  logs: RunnerLog[],
  options: { backendUrl?: string; environmentId?: string | null }
): RunnerTurnSummaryPreviewItem[] {
  const resources = collectTurnSummaryPreviewResources(logs).map((resource) => ({
    id: `resource:${resource.resourceType}:${resource.id}`,
    kind: "resource" as const,
    resource,
  }));
  const attachments = collectTurnSummaryPreviewAttachments(logs, options).map((attachment) => ({
    id: `attachment:${attachment.id}`,
    kind: "attachment" as const,
    attachment,
  }));
  return [...resources, ...attachments];
}

function collectThreadRetainedSummaryPreviewPaths(turns: RunnerTurn[]): Set<string> {
  const retainedPaths = new Set<string>();

  for (const turn of turns) {
    for (const log of turn.logs) {
      const previews = collectRunnerLogFileChangePreviews(log);
      if (previews.length === 0) continue;

      for (const preview of previews) {
        const normalizedPath = normalizeRunnerPreviewPath(preview.path);
        if (!normalizedPath || isInternalTurnPreviewPath(normalizedPath)) continue;
        const changeKind = preview.kind;

        if (changeKind === "deleted") {
          retainedPaths.delete(normalizedPath);
          continue;
        }

        retainedPaths.add(normalizedPath);
      }
    }
  }

  return retainedPaths;
}

function collectTurnChangedFiles(logs: RunnerLog[]): Array<{
  path: string;
  kind: "created" | "modified" | "deleted";
  additions?: number;
  deletions?: number;
}> {
  const changedFiles = new Map<string, {
    path: string;
    kind: "created" | "modified" | "deleted";
    additions?: number;
    deletions?: number;
    order: number;
  }>();
  let order = 0;

  for (const log of logs) {
    const previews = collectRunnerLogFileChangePreviews(log);
    if (previews.length === 0) continue;

    for (const preview of previews) {
      const normalizedPath = normalizeRunnerPreviewPath(preview.path);
      if (!normalizedPath || isInternalTurnPreviewPath(normalizedPath)) continue;
      const changeKind = preview.kind;
      changedFiles.set(normalizedPath, {
        path: normalizedPath,
        kind: changeKind,
        additions: typeof preview.additions === "number" ? preview.additions : undefined,
        deletions: typeof preview.deletions === "number" ? preview.deletions : undefined,
        order,
      });
      order += 1;
    }
  }

  return Array.from(changedFiles.values())
    .sort((left, right) => left.order - right.order)
    .map(({ order: _order, ...changedFile }) => changedFile);
}

function mergeDriveFolderItems(current: RunnerChatFileNode[], folderId: string, nextItems: RunnerChatFileNode[]): RunnerChatFileNode[] {
  const normalizedParentId = folderId === "root" ? null : folderId;
  const remaining = current.filter((item) => (item.parentId ?? null) !== normalizedParentId);
  const normalizedNext = nextItems.map((item) => ({
    ...item,
    parentId: item.parentId ?? normalizedParentId,
  }));

  return [...remaining, ...normalizedNext];
}

function resolveSpeechToTextUrl(overrideUrl: string | undefined, backendUrl: string, requestHeaders?: HeadersInit): string | null {
  const upstreamUrl = getHeaderValue(requestHeaders, "X-Runner-Upstream-Url");
  const candidate = overrideUrl?.trim() || upstreamUrl || `${sanitizeBackendUrl(backendUrl)}/ws/speech-to-text`;
  if (!candidate) return null;

  try {
    const base = typeof window === "undefined" ? "http://localhost" : window.location.href;
    const url = new URL(candidate, base);
    if (url.protocol === "http:") {
      url.protocol = "ws:";
    } else if (url.protocol === "https:") {
      url.protocol = "wss:";
    }
    if (url.protocol !== "ws:" && url.protocol !== "wss:") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

function combineInputWithTranscript(baseInput: string, transcript: string): string {
  const trimmedTranscript = transcript.trim();
  if (!trimmedTranscript) {
    return baseInput;
  }
  if (!baseInput.trim()) {
    return trimmedTranscript;
  }
  return /\s$/.test(baseInput) ? `${baseInput}${trimmedTranscript}` : `${baseInput} ${trimmedTranscript}`;
}

function float32ToInt16Pcm(input: Float32Array): Int16Array {
  const pcm = new Int16Array(input.length);
  for (let index = 0; index < input.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, input[index] || 0));
    pcm[index] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
  }
  return pcm;
}

function downsampleTo16kHz(input: Float32Array, sourceSampleRate: number): Int16Array {
  if (!input.length) {
    return new Int16Array(0);
  }

  if (sourceSampleRate === SPEECH_SAMPLE_RATE) {
    return float32ToInt16Pcm(input);
  }

  const ratio = sourceSampleRate / SPEECH_SAMPLE_RATE;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const pcm = new Int16Array(outputLength);
  let outputIndex = 0;
  let inputIndex = 0;

  while (outputIndex < outputLength) {
    const nextInputIndex = Math.min(input.length, Math.round((outputIndex + 1) * ratio));
    let sum = 0;
    let count = 0;

    while (inputIndex < nextInputIndex) {
      sum += input[inputIndex] || 0;
      count += 1;
      inputIndex += 1;
    }

    const average = count > 0 ? sum / count : input[Math.min(inputIndex, input.length - 1)] || 0;
    const sample = Math.max(-1, Math.min(1, average));
    pcm[outputIndex] = sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff);
    outputIndex += 1;
  }

  return pcm;
}

function encodePcmChunkBase64(chunk: Int16Array): string {
  const bytes = new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength);
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
  }

  return btoa(binary);
}

function calculateRms(input: Float32Array): number {
  if (input.length === 0) return 0;

  let sum = 0;
  for (let index = 0; index < input.length; index += 1) {
    const value = input[index] || 0;
    sum += value * value;
  }

  return Math.sqrt(sum / input.length);
}

function createSpeechCaptureWorkletUrl(): string {
  const source = `
class TestbaseSpeechCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.bufferSize = options.processorOptions?.bufferSize || ${SPEECH_WORKLET_BUFFER_SIZE};
    this.pending = [];
  }

  process(inputs) {
    const input = inputs[0];
    const channel = input && input[0];
    if (!channel || channel.length === 0) {
      return true;
    }

    for (let index = 0; index < channel.length; index += 1) {
      this.pending.push(channel[index]);
    }

    while (this.pending.length >= this.bufferSize) {
      const chunk = new Float32Array(this.pending.slice(0, this.bufferSize));
      this.pending = this.pending.slice(this.bufferSize);
      this.port.postMessage(chunk);
    }

    return true;
  }
}

registerProcessor(${JSON.stringify(SPEECH_WORKLET_PROCESSOR_NAME)}, TestbaseSpeechCaptureProcessor);
`;

  return URL.createObjectURL(new Blob([source], { type: "text/javascript" }));
}

function runStatusLabel(status: "idle" | "running" | "success" | "failed" | "cancelled") {
  if (status === "running") return "Running";
  if (status === "success") return "Completed";
  if (status === "failed") return "Failed";
  if (status === "cancelled") return "Cancelled";
  return "Idle";
}

function statusTone(status: "idle" | "running" | "success" | "failed" | "cancelled"): "neutral" | "success" | "error" {
  if (status === "success") return "success";
  if (status === "failed") return "error";
  return "neutral";
}

function eventGlyph(eventType?: string): string {
  if (eventType === "reasoning" || eventType === "planning") return "↺";
  if (eventType === "command_execution") return ">_";
  if (eventType === "agent_message" || eventType === "llm_response") return "AI";
  if (eventType === "turn_completed") return "CT";
  if (eventType === "setup" || eventType === "startup") return "⚙";
  if (eventType === "file_change") return "FI";
  return "•";
}

function IconLightbulb({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M9 18h6M10 21h4M12 3a7 7 0 0 0-4 12l1.2 1.6A2 2 0 0 1 9.6 18h4.8a2 2 0 0 1 .4-1.4L16 15a7 7 0 0 0-4-12z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconReadFile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v6h6M8 13h8M8 17h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconWriteFile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 3v6h6M12 12v6M9 15h6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFolder({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFolderPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 10v6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 13h6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconVideo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M14 2v4a2 2 0 0 0 2 2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.033 13.44a.647.647 0 0 1 0 1.12l-4.065 2.352a.645.645 0 0 1-.968-.56v-4.704a.645.645 0 0 1 .967-.56z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMusic({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M9 18V5l12-2v13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="18" cy="16" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTerminal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m4 17 6-5-6-5M12 19h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconCloud({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
    </svg>
  );
}

function IconImages({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <rect x="3" y="5" width="14" height="14" rx="2" strokeWidth="1.5" />
      <path d="m3 15 4-4 3 3 3-3 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="1.25" fill="currentColor" stroke="none" />
      <path d="M17 8h2a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9" strokeWidth="1.5" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconTelescope({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m6 21 3.5-7M14.5 6.5 18 14M9.5 14 16 11l-3-7-6.5 3 3 7Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12 7 9.5M15 10.5 20 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFileText({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPalette({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 3a9 9 0 0 0 0 18h1.2a2.8 2.8 0 0 0 0-5.6H12a1.8 1.8 0 0 1 0-3.6h4.5A4.5 4.5 0 0 0 21 7.3 9 9 0 0 0 12 3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconBrain({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M9.5 4a3 3 0 0 0-3 3v.3A3.7 3.7 0 0 0 4 10.8 3.7 3.7 0 0 0 6.5 14v.5a3.5 3.5 0 0 0 6 2.4 3.5 3.5 0 0 0 6-2.4V14a3.7 3.7 0 0 0 2.5-3.2 3.7 3.7 0 0 0-2.5-3.5V7a3 3 0 0 0-5.2-2.1A3.5 3.5 0 0 0 9.5 4Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 10h1M14 8.5h1M8.5 13.5H10M14 13.5h1.5M12 6v12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSearch({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronLeft({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m15 6-6 6 6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronUp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m6 15 6-6 6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m9 6 6 6-6 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 5v14M5 12h14" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPaperclip({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m21.44 11.05-8.49 8.49a5.5 5.5 0 0 1-7.78-7.78l8.49-8.48a3.5 3.5 0 1 1 4.95 4.95l-8.49 8.49a1.5 1.5 0 0 1-2.12-2.12l7.78-7.78" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLayers({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m12 3 9 4.5-9 4.5-9-4.5 9-4.5ZM3 12l9 4.5 9-4.5M3 16.5 12 21l9-4.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconUser({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M18 20a6 6 0 0 0-12 0M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconGoogleDrive({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 87.3 78" aria-hidden="true">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
    </svg>
  );
}

function IconOneDrive({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="https://upload.wikimedia.org/wikipedia/commons/5/59/Microsoft_Office_OneDrive_%282019%E2%80%932025%29.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

function IconNotion({ className }: { className?: string }) {
  return (
    <img
      className={className}
      src="https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg"
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="8" strokeWidth="1.5" />
      <path d="M12 8v5l3 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPlay({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m8 5 11 7-11 7V5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconRepeat({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M17 2v4h-4M7 22v-4h4M20 11a7 7 0 0 0-12-4L7 8M4 13a7 7 0 0 0 12 4l1-1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFolderOpen({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6H9l2 2h7.5A2.5 2.5 0 0 1 21 10.5v6A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-8Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFile({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLoader2({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconLogout({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M15 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconMic({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 11a7 7 0 0 1-14 0M12 18v3M8 21h8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconStop({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <rect x="7.5" y="7.5" width="9" height="9" rx="1.75" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
      <path d="m5 12 5 5L20 7" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function renderBrowserFileIcon(file: RunnerChatFileNode, className: string) {
  if (file.isFolder) {
    return <img src={RUNNER_FOLDER_ICON_URL} alt="" aria-hidden="true" draggable={false} className={`${className} tb-file-browser-icon-asset`} />;
  }

  if (file.mimeType === "application/x-notion-database" || file.mimeType === "application/x-notion-workspace") {
    return <IconNotion className={className} />;
  }

  const fileType = getBrowserFileType(file.mimeType, file.name);
  if (fileType === "image") {
    return <img src={RUNNER_IMAGE_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} className={`${className} tb-file-browser-icon-asset`} />;
  }
  if (fileType === "video") {
    return <IconVideo className={`${className} tb-file-browser-item-icon-video`} />;
  }
  if (fileType === "audio") {
    return <IconMusic className={`${className} tb-file-browser-item-icon-audio`} />;
  }
  return <img src={RUNNER_TEXT_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} className={`${className} tb-file-browser-icon-asset`} />;
}

function notionDatabasesToFileItems(databases: RunnerChatNotionDatabase[]): RunnerChatFileNode[] {
  const workspaceItem: RunnerChatFileNode = {
    id: "__entire_workspace__",
    name: "Entire workspace",
    mimeType: "application/x-notion-workspace",
    isFolder: false,
  };

  const databaseItems = databases.map((database) => ({
    id: database.id,
    name: database.name,
    mimeType: "application/x-notion-database",
    isFolder: false,
  }));

  return [workspaceItem, ...databaseItems];
}

function normalizeComputerAgentSkills(skills: RunnerChatSkill[]): RunnerChatSkill[] {
  const input = skills.length > 0 ? skills : DEFAULT_COMPUTER_AGENT_SKILLS;
  const normalizedInput = input
    .filter((skill): skill is RunnerChatSkill => Boolean(skill?.id))
    .map((skill) => ({
      ...skill,
      id: RUNNER_CHAT_SKILL_ID_ALIASES[String(skill.id || "").trim()] || String(skill.id || "").trim(),
    }))
    .filter((skill) => skill.id);
  const byId = new Map(normalizedInput.map((skill) => [skill.id, skill] as const));
  const core = DEFAULT_COMPUTER_AGENT_SKILLS.map((skill) => ({ ...skill, ...byId.get(skill.id) }));
  const custom = normalizedInput.filter((skill) => !DEFAULT_COMPUTER_AGENT_SKILLS.some((entry) => entry.id === skill.id));
  return [...core, ...custom];
}

function buildEnabledSkillsStorageKey(appId: string): string {
  return `${RUNNER_CHAT_ENABLED_SKILLS_STORAGE_KEY_PREFIX}:${appId || "runner-web-sdk"}`;
}

function buildWorkspaceSelectionStorageKey(appId: string, backendUrl: string): string {
  return `${RUNNER_CHAT_WORKSPACE_SELECTION_STORAGE_KEY_PREFIX}:${appId || "runner-web-sdk"}:${sanitizeBackendUrl(backendUrl) || "default"}`;
}

function normalizeWorkspaceSelectorMode(value: unknown): RunnerWorkspaceSelectorMode {
  return value === "projects" ? "projects" : "computers";
}

function loadPersistedWorkspaceSelection(storageKey: string): {
  mode: RunnerWorkspaceSelectorMode;
  environmentId: string;
  projectId: string;
} | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const record = parsed as Record<string, unknown>;
    return {
      mode: normalizeWorkspaceSelectorMode(record.mode),
      environmentId: typeof record.environmentId === "string" ? record.environmentId.trim() : "",
      projectId: typeof record.projectId === "string" ? record.projectId.trim() : "",
    };
  } catch {
    return null;
  }
}

function persistWorkspaceSelection(
  storageKey: string,
  selection: {
    mode: RunnerWorkspaceSelectorMode;
    environmentId?: string | null;
    projectId?: string | null;
  }
) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        mode: selection.mode,
        environmentId: String(selection.environmentId || "").trim(),
        projectId: String(selection.projectId || "").trim(),
      })
    );
  } catch {
    // Ignore storage failures; the UI still works without persistence.
  }
}

function loadPersistedEnabledSkillIds(storageKey: string): string[] | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return null;
    }
    const normalized = parsed
      .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      .map((value) => RUNNER_CHAT_SKILL_ID_ALIASES[value.trim()] || value.trim());
    return normalized.length > 0 ? [...new Set(normalized)] : [];
  } catch {
    return null;
  }
}

function persistEnabledSkillIds(storageKey: string, skillIds: string[]) {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(storageKey, JSON.stringify([...new Set(skillIds)]));
  } catch {
    // Ignore storage failures; the UI still works without persistence.
  }
}

function areStringArraysEqual(left: string[], right: string[]): boolean {
  if (left.length !== right.length) {
    return false;
  }
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }
  return true;
}

function defaultEnabledSkillIds(skills: RunnerChatSkill[]): string[] {
  const defaultIds = new Set<string>(DEFAULT_ENABLED_SKILL_IDS);
  return skills.filter((skill) => !skill.isCustom && defaultIds.has(skill.id)).map((skill) => skill.id);
}

function customSkillIconComponent(icon?: string | null) {
  const iconKey = (icon || "default").toLowerCase();
  const iconMap = {
    default: LucideWand2,
    sparkles: LucideSparkles,
    brain: LucideBrain,
    zap: LucideZap,
    telescope: LucideTelescope,
    search: LucideGlobe,
    image: LucideImageIcon,
    code: LucideCode,
    terminal: LucideTerminal,
    "file-text": LucideFileText,
    database: LucideDatabase,
    "pen-tool": LucidePenTool,
    palette: LucidePalette,
    message: LucideMessageSquare,
    mail: LucideMail,
    calendar: LucideCalendar,
    calculator: LucideCalculator,
    shield: LucideShield,
    lock: LucideShield,
    cloud: LucideCloud,
    server: LucideServer,
    cpu: LucideCpu,
    monitor: LucideMonitor,
    git: LucideGitBranch,
    package: LucidePackage,
    list: LucideListTodo,
  } as const;
  return iconMap[iconKey as keyof typeof iconMap] || LucideWand2;
}

function buildEnabledSkillsPayload(
  enabledSkillIds: string[],
  displayedSkills: RunnerChatSkill[],
  skillDefaults?: RunnerChatSkillDefaults
) {
  const enabled = new Set(enabledSkillIds);
  const defaultSkillMap: Record<string, string> = {
    image_generation: "imageGeneration",
    web_search: "webSearch",
    deep_research: "deepResearch",
    browser: "browser",
    pdf: "pdf",
    frontend_design: "frontendDesign",
    pptx: "pptx",
    memory: "memory",
    task_management: "taskManagement",
  };

  const payload: Record<string, unknown> = {};
  for (const [id, key] of Object.entries(defaultSkillMap)) {
    payload[key] = enabled.has(id);
  }

  if (enabled.has("image_generation") && skillDefaults?.imageGeneration) {
    const imageGeneration = skillDefaults.imageGeneration;
    const normalizedModel = typeof imageGeneration.model === "string" ? imageGeneration.model.trim() : "";
    const normalizedQuality = typeof imageGeneration.quality === "string" ? imageGeneration.quality.trim() : "";
    const normalizedComputeTokens = Number(imageGeneration.computeTokensPerImage);
    const imageGenerationConfig: Record<string, unknown> = {};
    if (normalizedModel) {
      imageGenerationConfig.model = normalizedModel;
      payload.imageGenerationModel = normalizedModel;
    }
    if (normalizedQuality) {
      imageGenerationConfig.quality = normalizedQuality;
      payload.imageGenerationQuality = normalizedQuality;
    }
    if (Number.isFinite(normalizedComputeTokens) && normalizedComputeTokens > 0) {
      const computeTokensPerImage = Math.max(0, Math.round(normalizedComputeTokens));
      imageGenerationConfig.computeTokensPerImage = computeTokensPerImage;
      payload.imageGenerationComputeTokensPerImage = computeTokensPerImage;
    }
    if (Object.keys(imageGenerationConfig).length > 0) {
      payload.imageGenerationConfig = imageGenerationConfig;
    }
  }

  if (enabled.has("computer_agents")) {
    payload.computerAgents = true;
  }

  const customSkills = displayedSkills
    .filter((skill) => skill.isCustom)
    .map((skill) => skill.id)
    .filter((id) => enabled.has(id));

  if (customSkills.length > 0) {
    payload.customSkills = customSkills;
  }

  return payload;
}

function formatDateTimeLocalValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatScheduleChipLabel(schedule: { scheduledTime: Date; scheduleType: "one-time" | "recurring" }): string {
  if (schedule.scheduleType === "recurring") {
    return "Recurring";
  }

  return `${schedule.scheduledTime.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${schedule.scheduledTime.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

function fileItemsForParent(items: RunnerChatFileNode[], parentId: string | null): RunnerChatFileNode[] {
  return items.filter((item) => (item.parentId ?? null) === parentId);
}

function childFolderPath(items: RunnerChatFileNode[], rootLabel: string, folderId: string | null): Array<{ id: string | null; name: string }> {
  const path: Array<{ id: string | null; name: string }> = [{ id: null, name: rootLabel }];
  if (!folderId) return path;

  const byId = new Map(items.map((item) => [item.id, item] as const));
  const stack: RunnerChatFileNode[] = [];
  let current = byId.get(folderId);

  while (current) {
    stack.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }

  for (const item of stack) {
    path.push({ id: item.id, name: item.name });
  }

  return path;
}

function parseSecondsFromClock(time: string): number | null {
  const hhmmss = time.match(/^(\d{2}):(\d{2}):(\d{2})$/);
  if (hhmmss) {
    const [, hh, mm, ss] = hhmmss;
    return Number(hh) * 3600 + Number(mm) * 60 + Number(ss);
  }
  const mmss = time.match(/^(\d{2}):(\d{2})$/);
  if (mmss) {
    const [, mm, ss] = mmss;
    return Number(mm) * 60 + Number(ss);
  }
  return null;
}

function formatElapsedDurationLabel(secondsValue: number): string {
  const totalSeconds = Math.max(0, Math.round(secondsValue));
  if (totalSeconds < 120) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes < 60) {
    return seconds > 0 ? `${minutes} min ${seconds}s` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes} min` : `${hours}h`;
}

function getRunnerLogTimestampMs(log: RunnerLog, relativeBaseMs?: number | null): number | null {
  const absoluteTimestampMs = getRunnerLogAbsoluteTimestampMs(log);
  if (absoluteTimestampMs !== null) {
    return absoluteTimestampMs;
  }

  const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
  if (relativeSeconds !== null && relativeBaseMs != null && Number.isFinite(relativeBaseMs)) {
    return relativeBaseMs + relativeSeconds * 1000;
  }

  return null;
}

function getRunnerLogRelativeSeconds(log: RunnerLog, startedAtMs?: number | null): number | null {
  const absoluteTimestampMs = getRunnerLogAbsoluteTimestampMs(log);
  if (absoluteTimestampMs !== null && startedAtMs != null && Number.isFinite(startedAtMs)) {
    return Math.max(0, Math.round((absoluteTimestampMs - startedAtMs) / 1000));
  }

  const clockSeconds = log.time ? parseSecondsFromClock(log.time) : null;
  return clockSeconds !== null ? Math.max(0, clockSeconds) : null;
}

function getRunnerLogRangeDurationLabel(startLog: RunnerLog, endLog: RunnerLog, relativeBaseMs?: number | null): string | undefined {
  const startMs = getRunnerLogTimestampMs(startLog, relativeBaseMs);
  const endMs = getRunnerLogTimestampMs(endLog, relativeBaseMs);
  if (startMs === null || endMs === null) {
    return undefined;
  }

  return formatElapsedDurationLabel(Math.max(0, (endMs - startMs) / 1000));
}

function toDurationLabel(log: RunnerLog, startedAtMs?: number | null): string | undefined {
  const relativeSeconds = getRunnerLogRelativeSeconds(log, startedAtMs);
  if (relativeSeconds !== null) {
    return formatElapsedDurationLabel(relativeSeconds);
  }

  const durationMs =
    typeof log.metadata?.durationMs === "number"
      ? log.metadata.durationMs
      : typeof (log.metadata as { duration_ms?: unknown } | undefined)?.duration_ms === "number"
        ? ((log.metadata as { duration_ms: number }).duration_ms)
        : undefined;
  if (typeof durationMs === "number" && durationMs >= 0) {
    return formatElapsedDurationLabel(Math.max(1, Math.round(durationMs / 1000)));
  }
  if (log.time) return log.time;
  return undefined;
}

function formatBrowserFileSize(bytes?: number): string {
  if (!bytes || bytes < 1) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatBrowserFileDate(isoString?: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

function summarizeSkill(command: string): string | null {
  const skillPathMatch = command.match(/\.claude\/skills\/([^/]+)\//);
  if (skillPathMatch?.[1]) {
    return skillPathMatch[1]
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  const launchingMatch = command.match(/[Ll]aunching skill:\s*([^\s\n]+)/);
  if (launchingMatch?.[1]) {
    return launchingMatch[1]
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }
  return null;
}

type CommandRowSummary = {
  label: string;
  detail?: string;
  icon: "read" | "list" | "write" | "terminal";
};

function summarizeCommandRow(log: RunnerLog): CommandRowSummary {
  const command = (log.metadata?.command || log.message || "").trim();
  const skill = summarizeSkill(command);
  if (skill) {
    return { label: `Using ${skill} Skill`, icon: "terminal" };
  }

  const listPath =
    command.match(/\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?["']([^"']+)["']/)?.[1] ||
    command.match(/\b(?:ls|ll)\s+(?:-[a-zA-Z]+\s+)?([^\s|&;>"']+)/)?.[1] ||
    command.match(/\bfind\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\bfind\s+([^\s|&;>"']+)/)?.[1] ||
    command.match(/\brg\s+--files\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\brg\s+--files\s+([^\s|&;>"']+)/)?.[1];
  if (listPath) {
    return { label: "List Files", detail: listPath, icon: "list" };
  }

  const headTailReadPath =
    command.match(/\b(?:head|tail)\s+-n\s+\d+\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\b(?:head|tail)\s+-n\s+\d+\s+([^\s|&;>"']+)/)?.[1] ||
    command.match(/\b(?:head|tail)\s+-\d+\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\b(?:head|tail)\s+-\d+\s+([^\s|&;>"']+)/)?.[1] ||
    command.match(/\b(?:head|tail)\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\b(?:head|tail)\s+([^\s|&;>"']+)/)?.[1];
  const readPath =
    command.match(/sed\s+-n\s+['"][^'"]*['"]\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\b(?:cat|less)\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\b(?:cat|less)\s+([^\s|&;>"']+)/)?.[1] ||
    (headTailReadPath && !headTailReadPath.startsWith("-") ? headTailReadPath : undefined);
  if (readPath) {
    const lines = command.match(/sed\s+-n\s+['"](\d+),(\d+)p['"]/);
    const detail = lines ? `${readPath}  ·  ${lines[1]}-${lines[2]}` : readPath;
    return { label: "Read File", detail, icon: "read" };
  }

  const writePath =
    command.match(/>+\s*["']([^"']+)["']/)?.[1] ||
    command.match(/>+\s*([^\s|&;>"']+)/)?.[1] ||
    command.match(/\btee\s+["']([^"']+)["']/)?.[1] ||
    command.match(/\btee\s+([^\s|&;>"']+)/)?.[1];
  if (writePath) {
    return { label: "Write File", detail: writePath, icon: "write" };
  }

  const trimmed = command.length > 80 ? `${command.slice(0, 77)}...` : command;
  return { label: "Executed", detail: `$ ${trimmed}`, icon: "terminal" };
}

async function createThread(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  title?: string;
  appId?: string;
  environmentId?: string;
  projectId?: string | null;
  agentId?: string;
  metadata?: Record<string, unknown> | null;
  privateMode?: boolean;
}): Promise<{ threadId: string; title: string | null; environmentId: string | null }> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = new Headers(params.requestHeaders || {});
  headers.set("Content-Type", "application/json");
  headers.set("X-API-Key", params.apiKey);
  const baseMetadata =
    params.metadata && typeof params.metadata === "object" && !Array.isArray(params.metadata)
      ? params.metadata
      : undefined;
  const runnerPlaygroundMetadata =
    baseMetadata?.runnerPlayground && typeof baseMetadata.runnerPlayground === "object" && !Array.isArray(baseMetadata.runnerPlayground)
      ? baseMetadata.runnerPlayground
      : {};
  const metadata =
    baseMetadata || params.privateMode
      ? {
          ...(baseMetadata || {}),
          runnerPlayground: {
            ...runnerPlaygroundMetadata,
            ...(params.privateMode
              ? {
                  privateMode: true,
                  privateModeCreatedAt: new Date().toISOString(),
                }
              : {}),
          },
        }
      : undefined;

  const response = await fetch(`${backendUrl}/threads`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      title: params.title,
      appId: params.appId,
      environmentId: params.environmentId,
      projectId: params.projectId || undefined,
      agentId: params.agentId,
      metadata,
    }),
  });

  const body = await response.text();
  let parsed: any = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { message: body };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || parsed?.error || `Failed to create thread (${response.status})`);
  }

  const threadId = parsed?.thread?.id;
  if (!threadId || typeof threadId !== "string") {
    throw new Error("Thread creation succeeded but response.thread.id is missing");
  }

  return {
    threadId,
    title: typeof parsed?.thread?.title === "string" ? parsed.thread.title : null,
    environmentId: typeof parsed?.thread?.environmentId === "string" ? parsed.thread.environmentId : null,
  };
}

const DEFAULT_NEW_THREAD_TITLE = "New Thread";

function isDefaultThreadTitle(title: string | null | undefined): boolean {
  return !title || title.trim().toLowerCase() === DEFAULT_NEW_THREAD_TITLE.toLowerCase();
}

async function generateThreadTitle(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  threadId: string;
  message: string;
}): Promise<string> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = new Headers(params.requestHeaders || {});
  headers.set("Content-Type", "application/json");
  headers.set("X-API-Key", params.apiKey);

  const response = await fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/generate-title`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      message: params.message,
    }),
  });

  const body = await response.text();
  let parsed: any = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { message: body };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || parsed?.error || `Failed to generate thread title (${response.status})`);
  }

  const nextTitle =
    (typeof parsed?.thread?.title === "string" ? parsed.thread.title : "") ||
    (typeof parsed?.title === "string" ? parsed.title : "");
  if (!nextTitle.trim()) {
    throw new Error("Thread title generation succeeded but response title is missing");
  }

  return nextTitle.trim();
}

const environmentStartPromises = new Map<string, Promise<void>>();
const environmentWarmCacheUntilMs = new Map<string, number>();
const ENVIRONMENT_START_CACHE_TTL_MS = 90 * 1000;
const ENVIRONMENT_START_TIMEOUT_MS = 8 * 1000;
const ENVIRONMENT_START_TIMEOUT_ERROR_NAME = "EnvironmentStartTimeoutError";

type SharedEnvironmentWarmCacheStore = Record<string, number>;

function readSharedEnvironmentWarmCacheUntilMs(requestKey: string): number {
  if (typeof window === "undefined") {
    return 0;
  }
  const sharedCache = (window as typeof window & {
    __runnerEnvironmentWarmCacheUntilMs?: SharedEnvironmentWarmCacheStore;
  }).__runnerEnvironmentWarmCacheUntilMs;
  return Number(sharedCache?.[requestKey] || 0);
}

function writeSharedEnvironmentWarmCacheUntilMs(requestKey: string, untilMs: number): void {
  if (typeof window === "undefined") {
    return;
  }
  const nextWindow = window as typeof window & {
    __runnerEnvironmentWarmCacheUntilMs?: SharedEnvironmentWarmCacheStore;
  };
  const sharedCache = nextWindow.__runnerEnvironmentWarmCacheUntilMs || {};
  if (untilMs > Date.now()) {
    sharedCache[requestKey] = untilMs;
  } else {
    delete sharedCache[requestKey];
  }
  nextWindow.__runnerEnvironmentWarmCacheUntilMs = sharedCache;
}

function buildEnvironmentStartRequestKey(params: {
  backendUrl: string;
  environmentId: string;
  agentId?: string;
  enabledSkills?: Record<string, unknown> | null;
}): string {
  return JSON.stringify({
    backendUrl: sanitizeBackendUrl(params.backendUrl),
    environmentId: params.environmentId,
    agentId: params.agentId || null,
  });
}

function createEnvironmentStartTimeoutError(timeoutMs: number): Error {
  const error = new Error(`Environment warm-up timed out after ${Math.round(timeoutMs / 1000)}s.`);
  error.name = ENVIRONMENT_START_TIMEOUT_ERROR_NAME;
  return error;
}

function isEnvironmentStartTimeoutError(error: unknown): error is Error {
  return error instanceof Error && error.name === ENVIRONMENT_START_TIMEOUT_ERROR_NAME;
}

function reportRunnerLifecycleCallbackError(callbackName: string, error: unknown): void {
  console.warn(`[RunnerChat] ${callbackName} callback failed; continuing run execution.`, error);
}

async function startEnvironment(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  environmentId: string;
  agentId?: string;
  enabledSkills?: Record<string, unknown> | null;
  force?: boolean;
}): Promise<void> {
  const requestKey = buildEnvironmentStartRequestKey(params);
  if (!params.force) {
    const cachedUntilMs = Math.max(
      environmentWarmCacheUntilMs.get(requestKey) ?? 0,
      readSharedEnvironmentWarmCacheUntilMs(requestKey),
    );
    if (cachedUntilMs > Date.now()) {
      return;
    }
    environmentWarmCacheUntilMs.delete(requestKey);
    writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
  }
  if (!params.force && environmentStartPromises.has(requestKey)) {
    return environmentStartPromises.get(requestKey);
  }
  const existingPromise = environmentStartPromises.get(requestKey);
  if (existingPromise) {
    return existingPromise;
  }

  const startPromise = (async () => {
    const backendUrl = sanitizeBackendUrl(params.backendUrl);
    const headers = new Headers(params.requestHeaders || {});
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, ENVIRONMENT_START_TIMEOUT_MS);

    headers.set("Content-Type", "application/json");
    headers.set("X-API-Key", params.apiKey);

    try {
      // Do not short-circuit on `/status === running`.
      // The backend `/start` route is the idempotent warm-up trigger that restores workspace,
      // syncs skills, and pre-warms the execution stream. A merely running container is not
      // equivalent to a warm container.
      const response = await fetch(`${backendUrl}/environments/${encodeURIComponent(params.environmentId)}/start`, {
        method: "POST",
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          ...(params.agentId ? { agentId: params.agentId } : {}),
          ...(params.enabledSkills ? { enabledSkills: params.enabledSkills } : {}),
        }),
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        environmentWarmCacheUntilMs.delete(requestKey);
        writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
        throw new Error(bodyText || `Failed to start environment (${response.status})`);
      }
      const nextWarmCacheUntilMs = Date.now() + ENVIRONMENT_START_CACHE_TTL_MS;
      environmentWarmCacheUntilMs.set(requestKey, nextWarmCacheUntilMs);
      writeSharedEnvironmentWarmCacheUntilMs(requestKey, nextWarmCacheUntilMs);
    } catch (error) {
      environmentWarmCacheUntilMs.delete(requestKey);
      writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
      if (didTimeout && error instanceof Error && error.name === "AbortError") {
        throw createEnvironmentStartTimeoutError(ENVIRONMENT_START_TIMEOUT_MS);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  })().finally(() => {
    environmentStartPromises.delete(requestKey);
  });

  environmentStartPromises.set(requestKey, startPromise);
  return startPromise;
}

async function prepareGithubRepositorySelection(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  environmentId: string;
  repoFullName: string;
  branch: string;
}): Promise<void> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = new Headers(params.requestHeaders || {});
  headers.set("Content-Type", "application/json");
  headers.set("X-API-Key", params.apiKey);

  const response = await fetch(
    `${backendUrl}/environments/${encodeURIComponent(params.environmentId)}/github/prepare`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        repoFullName: params.repoFullName,
        branch: params.branch,
      }),
    }
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(bodyText || `Failed to prepare GitHub repository (${response.status})`);
  }
}

async function cancelThreadExecution(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<void> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);

  const response = await fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/cancel`, {
    method: "POST",
    headers,
  });

  const bodyText = await response.text().catch(() => "");
  let parsed: { message?: string; error?: string } = {};
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = { message: bodyText };
  }

  if (!response.ok) {
    const message = parsed.message || parsed.error || `Failed to cancel thread (${response.status})`;
    if (response.status === 400 && /no active execution|no running execution/i.test(message)) {
      return;
    }
    throw new Error(message);
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Failed to encode attachment"));
        return;
      }
      const commaIndex = reader.result.indexOf(",");
      resolve(commaIndex >= 0 ? reader.result.slice(commaIndex + 1) : reader.result);
    };
    reader.onerror = () => reject(reader.error || new Error("Failed to encode attachment"));
    reader.readAsDataURL(blob);
  });
}

function normalizeBase64Content(value: string): string {
  const rawValue = String(value || "");
  const normalizedInput = rawValue.includes("base64,") ? rawValue.slice(rawValue.indexOf("base64,") + "base64,".length) : rawValue;
  const sanitizedValue = normalizedInput.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = sanitizedValue.length % 4 === 0 ? 0 : 4 - (sanitizedValue.length % 4);
  return sanitizedValue + "=".repeat(paddingLength);
}

function decodeBase64ToUint8Array(value: string): Uint8Array {
  const normalizedValue = normalizeBase64Content(value);
  const binaryString = atob(normalizedValue);
  const bytes = new Uint8Array(binaryString.length);
  for (let index = 0; index < binaryString.length; index += 1) {
    bytes[index] = binaryString.charCodeAt(index);
  }
  return bytes;
}

function decodeBase64TextContent(value: string): string {
  try {
    const decodedBytes = decodeBase64ToUint8Array(value);
    return new TextDecoder().decode(decodedBytes);
  } catch {
    return String(value || "");
  }
}

function buildFileFromFetchedContent(item: RunnerChatFileNode, payload: RunnerChatFetchedFileContent): {
  file: File;
  type: RunnerAttachment["type"];
  previewUrl?: string;
} {
  const filename = String(payload?.name || item.name || "file").trim() || "file";
  const mimeType = String(payload?.mimeType || item.mimeType || "application/octet-stream").trim() || "application/octet-stream";
  const base64Bytes = new Uint8Array(Array.from(decodeBase64ToUint8Array(typeof payload?.content === "string" ? payload.content : "")));
  const blob = payload?.encoding === "text"
    ? new Blob([typeof payload?.content === "string" ? payload.content : ""], { type: mimeType })
    : new Blob([base64Bytes], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });
  const type = attachmentTypeForFile(mimeType, filename);
  return {
    file,
    type,
    previewUrl: type === "image" ? URL.createObjectURL(blob) : undefined,
  };
}

async function uploadAttachment(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  file: File;
  environmentId?: string;
}): Promise<RunnerAttachment> {
  return uploadAttachmentContent({
    backendUrl: params.backendUrl,
    apiKey: params.apiKey,
    requestHeaders: params.requestHeaders,
    filename: params.file.name,
    mimeType: params.file.type || "application/octet-stream",
    data: await blobToBase64(params.file),
    environmentId: params.environmentId,
  });
}

async function uploadAttachmentContent(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  filename: string;
  mimeType: string;
  data: string;
  environmentId?: string;
}): Promise<RunnerAttachment> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(`${backendUrl}/attachments/upload`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      filename: params.filename,
      mimeType: params.mimeType || "application/octet-stream",
      data: params.data,
      ...(params.environmentId ? { environmentId: params.environmentId } : {}),
    }),
  });

  const body = await response.text();
  let parsed: any = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = { message: body };
  }

  if (!response.ok) {
    throw new Error(parsed?.message || parsed?.error || `Failed to upload attachment (${response.status})`);
  }

  const attachment = parsed?.attachment;
  if (!attachment || typeof attachment !== "object" || typeof attachment.id !== "string") {
    throw new Error("Attachment upload succeeded but response.attachment is missing");
  }

  return {
    ...attachment,
    url: `${backendUrl}/attachments/${encodeURIComponent(attachment.id)}`,
  };
}

async function fetchAllThreadMessages(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<RunnerConversationMessage[]> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  const pageSize = 200;
  const messages: RunnerConversationMessage[] = [];
  let offset = 0;

  while (true) {
    const response = await fetch(
      `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/messages?limit=${pageSize}&offset=${offset}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    const body = await response.text();
    let parsed: { data?: unknown[]; message?: string; error?: string; has_more?: boolean } = {};
    try {
      parsed = body ? JSON.parse(body) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok) {
      throw new Error(parsed.message || parsed.error || `Failed to load thread messages (${response.status})`);
    }

    const pageItems = Array.isArray(parsed.data)
      ? parsed.data.map(normalizeRunnerConversationMessage).filter((message): message is RunnerConversationMessage => Boolean(message))
      : [];
    messages.push(...pageItems);

    if (!parsed.has_more || pageItems.length === 0) {
      break;
    }

    offset += pageItems.length;
  }

  return sortRunnerConversationMessagesChronologically(messages);
}

async function forkThreadRequest(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  truncateAtMessageIndex?: number;
  environmentTarget?: RunnerForkTarget;
  environmentName?: string;
  targetEnvironmentId?: string;
  fileCopyMode?: RunnerForkFileCopyMode;
  requestHeaders?: HeadersInit;
}): Promise<{ thread: { id: string }; environmentId?: string | null; environmentName?: string | null }> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  headers.set("Content-Type", "application/json");

  const response = await fetch(
    `${backendUrl}/threads/${encodeURIComponent(params.threadId)}/copy`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        ...(typeof params.truncateAtMessageIndex === "number" ? { truncateAtMessageIndex: params.truncateAtMessageIndex } : {}),
        environmentTarget: params.environmentTarget,
        environmentName: params.environmentName,
        targetEnvironmentId: params.targetEnvironmentId,
        fileCopyMode: params.fileCopyMode,
      }),
    }
  );

  const body = await response.text();
  let parsed: { thread?: { id?: string }; environmentId?: string | null; environmentName?: string | null; message?: string; error?: string } = {};
  try {
    parsed = body ? JSON.parse(body) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(parsed.message || parsed.error || `Failed to fork thread (${response.status})`);
  }

  const nextThreadId = parsed.thread?.id;
  if (!nextThreadId || typeof nextThreadId !== "string") {
    throw new Error("Fork completed without returning a new thread.");
  }

  return {
    thread: {
      id: nextThreadId,
    },
    environmentId: typeof parsed.environmentId === "string" && parsed.environmentId.trim() ? parsed.environmentId : null,
    environmentName: typeof parsed.environmentName === "string" && parsed.environmentName.trim() ? parsed.environmentName : null,
  };
}

function normalizeRunnerHydratedFilePath(value: string): string {
  return value.trim().replace(/^\.?\//, "").replace(/^\/workspace\//, "");
}

function isRunnerHydratedNullDevicePath(value?: string | null): boolean {
  const normalized = String(value || "").trim().replace(/^['"`]+|['"`]+$/g, "");
  return normalized === "/dev/null" || normalized === "dev/null";
}

function parseThreadDiffEntries(value: unknown): RunnerThreadDiffEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => (entry && typeof entry === "object" ? (entry as Record<string, unknown>) : null))
    .filter((entry): entry is Record<string, unknown> => !!entry)
    .map((entry) => ({
      path: typeof entry.path === "string" ? entry.path : undefined,
      additions: typeof entry.additions === "number" ? entry.additions : undefined,
      deletions: typeof entry.deletions === "number" ? entry.deletions : undefined,
      changes: typeof entry.changes === "string" ? entry.changes : undefined,
      diff: typeof entry.diff === "string" ? entry.diff : undefined,
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : undefined,
    }))
    .filter((entry) => typeof entry.path === "string" && entry.path.trim().length > 0);
}

function parseThreadSteps(value: unknown): RunnerParsedThreadStep[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (entry && typeof entry === "object" ? (entry as RunnerThreadStep) : null))
    .filter((entry): entry is RunnerThreadStep => !!entry && typeof entry.id === "string")
    .map((entry) => ({
      id: entry.id,
      sequence: typeof entry.sequence === "number" ? entry.sequence : 0,
      stepKind: typeof entry.stepKind === "string" ? entry.stepKind : "",
      eventType: typeof entry.eventType === "string" ? entry.eventType : null,
      title: typeof entry.title === "string" ? entry.title : "",
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : "",
      metadata: entry.metadata && typeof entry.metadata === "object" ? entry.metadata : null,
    }));
}

function formatHydratedRelativeLogTime(createdAt: string, startedAtMs: number | null): string {
  const createdAtMs = Date.parse(createdAt);
  if (!Number.isFinite(createdAtMs) || startedAtMs === null || !Number.isFinite(startedAtMs)) {
    return "";
  }

  const elapsedSeconds = Math.max(0, Math.round((createdAtMs - startedAtMs) / 1000));
  return formatElapsedDurationLabel(elapsedSeconds);
}

function inferHydratedChangeKindFromDiff(entry: RunnerThreadDiffEntry): "created" | "modified" | "deleted" {
  const diffText = entry.diff || entry.changes || "";
  if (/^---\s+\/dev\/null\b/m.test(diffText)) {
    return "created";
  }
  if (/^\+\+\+\s+\/dev\/null\b/m.test(diffText)) {
    return "deleted";
  }
  return "modified";
}

function countDiffLineStats(diffText: string): { additions: number; deletions: number } {
  let additions = 0;
  let deletions = 0;
  for (const line of diffText.split("\n")) {
    if (line.startsWith("+++") || line.startsWith("---")) {
      continue;
    }
    if (line.startsWith("+")) {
      additions += 1;
      continue;
    }
    if (line.startsWith("-")) {
      deletions += 1;
    }
  }
  return { additions, deletions };
}

function parseHydratedStepDiffEntries(diffText: string, createdAt?: string): RunnerThreadDiffEntry[] {
  if (typeof diffText !== "string" || diffText.trim().length === 0) {
    return [];
  }

  const sections = diffText
    .split(/^diff --git\s+/m)
    .map((section) => section.trim())
    .filter((section) => section.length > 0)
    .map((section) => (section.startsWith("a/") ? `diff --git ${section}` : section));

  const entries: RunnerThreadDiffEntry[] = [];
  for (const section of sections) {
      const plusPlusPlusMatch = /^\+\+\+\s+([^\n]+)$/m.exec(section);
      const minusMinusMinusMatch = /^---\s+([^\n]+)$/m.exec(section);
      const plusPath = plusPlusPlusMatch?.[1]?.trim() || "";
      const minusPath = minusMinusMinusMatch?.[1]?.trim() || "";
      const selectedPath = plusPath !== "/dev/null" ? plusPath : minusPath;
      if (isRunnerHydratedNullDevicePath(selectedPath)) {
        continue;
      }
      const normalizedPath = selectedPath.replace(/^[ab]\//, "").trim();
      if (!normalizedPath) {
        continue;
      }
      const { additions, deletions } = countDiffLineStats(section);
      entries.push({
        path: normalizedPath,
        additions,
        deletions,
        diff: section,
        createdAt,
      });
  }
  return entries;
}

async function fetchHydratedStepDiffEntries(params: {
  backendUrl: string;
  threadId: string;
  headers: Headers;
  steps: RunnerParsedThreadStep[];
}): Promise<RunnerThreadDiffEntry[]> {
  const candidateSteps = params.steps.filter((step) => {
    if (step.id.trim().length === 0) {
      return false;
    }
    const metadata = step.metadata || {};
    const hasFilePaths = Array.isArray(metadata.filePaths) && metadata.filePaths.some((value) => typeof value === "string" && value.trim().length > 0);
    const hasInlineDiffs = Boolean(metadata.diffs && typeof metadata.diffs === "object");
    const stepKind = String(step.stepKind || "").toLowerCase();
    const eventType = String(step.eventType || "").toLowerCase();
    return hasFilePaths || hasInlineDiffs || stepKind === "file_change" || eventType === "file_change";
  });
  if (candidateSteps.length === 0) {
    return [];
  }

  const entries = await Promise.all(
    candidateSteps.map(async (step) => {
      try {
        const response = await fetch(
          `${params.backendUrl}/threads/${encodeURIComponent(params.threadId)}/steps/${encodeURIComponent(step.id)}/diff`,
          {
            method: "GET",
            headers: params.headers,
          }
        );
        if (!response.ok) {
          return [];
        }
        const body = (await response.json()) as Partial<RunnerThreadStepDiffResult> | null;
        const parsedDiffEntries = parseHydratedStepDiffEntries(typeof body?.diff === "string" ? body.diff : "", step.createdAt);
        if (parsedDiffEntries.length > 0) {
          return parsedDiffEntries;
        }

        const changedPaths = Array.isArray(body?.changedPaths)
          ? body.changedPaths.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
          : [];
        if (changedPaths.length !== 1) {
          return [];
        }

        return [
          {
            path: changedPaths[0],
            additions: typeof body?.additions === "number" ? body.additions : undefined,
            deletions: typeof body?.deletions === "number" ? body.deletions : undefined,
            diff: typeof body?.diff === "string" ? body.diff : undefined,
            createdAt: step.createdAt,
          } satisfies RunnerThreadDiffEntry,
        ];
      } catch {
        return [];
      }
    })
  );

  return entries.flat();
}

function buildSyntheticFileChangeLog(params: {
  path: string;
  changeKind: "created" | "modified" | "deleted";
  diff?: string;
  changes?: string;
  additions?: number;
  deletions?: number;
  createdAt?: string;
  startedAtMs?: number | null;
}): RunnerLog {
  const normalizedPath = params.path.startsWith("/workspace/") ? params.path : `/workspace/${normalizeRunnerHydratedFilePath(params.path)}`;
  const message =
    params.changeKind === "created"
      ? `Write: ${normalizedPath}`
      : params.changeKind === "deleted"
        ? `Delete: ${normalizedPath}`
        : `Edit: ${normalizedPath}`;

  return {
    ...(params.createdAt ? { createdAt: params.createdAt } : {}),
    time: params.createdAt ? formatHydratedRelativeLogTime(params.createdAt, params.startedAtMs ?? null) : "",
    message,
    type: "info",
    eventType: "file_change",
    metadata: {
      filePaths: [normalizedPath],
      changeKinds: [params.changeKind],
      diffs: {
        [normalizedPath]: {
          ...(params.diff ? { diff: params.diff } : {}),
          ...(params.changes ? { changes: params.changes } : {}),
          ...(typeof params.additions === "number" ? { additions: params.additions } : {}),
          ...(typeof params.deletions === "number" ? { deletions: params.deletions } : {}),
        },
      },
    },
  };
}

function mergeThreadStepsIntoLogs(
  logs: RunnerLog[],
  steps: RunnerParsedThreadStep[],
  diffEntries: RunnerThreadDiffEntry[],
  startedAtMs: number | null
): RunnerLog[] {
  const hasFileChangeLogs = logs.some((log) => log.eventType === "file_change" && !isInternalFileChangeLog(log));
  if (hasFileChangeLogs) {
    return logs;
  }

  const syntheticLogsFromSteps = steps
    .filter((step) => step.eventType === "file_change" || step.stepKind === "file_change")
    .flatMap((step) => {
      const metadata = step.metadata || {};
      const filePaths = Array.isArray(metadata.filePaths)
        ? metadata.filePaths.filter((value): value is string =>
          typeof value === "string" && value.trim().length > 0 && !isRunnerHydratedNullDevicePath(value)
        )
        : [];
      const changeKinds = Array.isArray(metadata.changeKinds)
        ? metadata.changeKinds.filter(
            (value): value is "created" | "modified" | "deleted" =>
              value === "created" || value === "modified" || value === "deleted"
          )
        : [];
      const diffs =
        metadata.diffs && typeof metadata.diffs === "object"
          ? (metadata.diffs as Record<string, { diff?: string; changes?: string; additions?: number; deletions?: number }>)
          : {};

      return filePaths.map((filePath, index) => {
        if (isRunnerHydratedNullDevicePath(filePath)) {
          return null;
        }
        const normalizedPreviewPath = normalizeRunnerPreviewPath(filePath);
        if (normalizedPreviewPath && isInternalTurnPreviewPath(normalizedPreviewPath)) {
          return null;
        }
        const normalizedPath = normalizeRunnerHydratedFilePath(filePath);
        const diffEntry = diffs[filePath] || diffs[normalizedPath];
        return buildSyntheticFileChangeLog({
          path: filePath,
          changeKind: changeKinds[index] || "modified",
          diff: diffEntry?.diff,
          changes: diffEntry?.changes,
          additions: diffEntry?.additions,
          deletions: diffEntry?.deletions,
          createdAt: step.createdAt,
          startedAtMs,
        });
      }).filter((entry): entry is RunnerLog => Boolean(entry));
    });

  const syntheticLogs =
    syntheticLogsFromSteps.length > 0
      ? syntheticLogsFromSteps
        : diffEntries.map((entry) =>
          entry.path && !isRunnerHydratedNullDevicePath(entry.path) && !isInternalTurnPreviewPath(normalizeRunnerHydratedFilePath(entry.path))
            ? buildSyntheticFileChangeLog({
                path: entry.path || "",
                changeKind: inferHydratedChangeKindFromDiff(entry),
                diff: entry.diff,
                changes: entry.changes,
                additions: entry.additions,
                deletions: entry.deletions,
                createdAt: entry.createdAt || steps[steps.length - 1]?.createdAt,
                startedAtMs,
              })
            : null
        ).filter((entry): entry is RunnerLog => Boolean(entry));

  if (syntheticLogs.length === 0) {
    return logs;
  }

  const firstAgentMessageIndex = logs.findIndex((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
  if (firstAgentMessageIndex === -1) {
    return [...logs, ...syntheticLogs];
  }

  return [
    ...logs.slice(0, firstAgentMessageIndex),
    ...syntheticLogs,
    ...logs.slice(firstAgentMessageIndex),
  ];
}

function mergeThreadDiffsIntoLogs(logs: RunnerLog[], diffEntries: RunnerThreadDiffEntry[]): RunnerLog[] {
  if (diffEntries.length === 0) {
    return logs;
  }

  const lastFileLogIndexByPath = new Map<string, number>();
  for (const [index, log] of logs.entries()) {
    if (log.eventType !== "file_change") continue;
    const filePaths = Array.isArray(log.metadata?.filePaths) ? log.metadata.filePaths : [];
    if (filePaths.length !== 1 || typeof filePaths[0] !== "string") continue;
    if (isRunnerHydratedNullDevicePath(filePaths[0])) continue;
    const normalizedPath = normalizeRunnerHydratedFilePath(filePaths[0]);
    if (isInternalTurnPreviewPath(normalizedPath)) continue;
    if (!normalizedPath) continue;
    lastFileLogIndexByPath.set(normalizedPath, index);
  }

  const diffsByPath = new Map<
    string,
    {
      diff?: string;
      changes?: string;
      additions?: number;
      deletions?: number;
    }
  >();

  for (const entry of diffEntries) {
    if (!entry.path) continue;
    if (isRunnerHydratedNullDevicePath(entry.path)) continue;
    const normalizedPath = normalizeRunnerHydratedFilePath(entry.path);
    if (isInternalTurnPreviewPath(normalizedPath)) continue;
    if (!normalizedPath) continue;
    diffsByPath.set(normalizedPath, {
      ...(entry.diff ? { diff: entry.diff } : {}),
      ...(entry.changes ? { changes: entry.changes } : {}),
      ...(typeof entry.additions === "number" ? { additions: entry.additions } : {}),
      ...(typeof entry.deletions === "number" ? { deletions: entry.deletions } : {}),
    });
  }

  return logs.map((log, index) => {
    if (log.eventType !== "file_change") {
      return log;
    }

    const filePaths = Array.isArray(log.metadata?.filePaths) ? log.metadata.filePaths : [];
    if (filePaths.length !== 1 || typeof filePaths[0] !== "string") {
      return log;
    }
    if (isRunnerHydratedNullDevicePath(filePaths[0])) {
      return log;
    }

    const normalizedPath = normalizeRunnerHydratedFilePath(filePaths[0]);
    if (!normalizedPath || lastFileLogIndexByPath.get(normalizedPath) !== index) {
      return log;
    }

    const diff = diffsByPath.get(normalizedPath);
    if (!diff) {
      return log;
    }

    const existingDiffs = log.metadata?.diffs as
      | Record<
          string,
          {
            diff?: string;
            changes?: string;
            additions?: number;
            deletions?: number;
          }
        >
      | undefined;
    if (existingDiffs && (typeof existingDiffs[normalizedPath] === "object" || typeof existingDiffs[filePaths[0]] === "object")) {
      return log;
    }

    return {
      ...log,
      metadata: {
        ...log.metadata,
        diffs: {
          ...(existingDiffs || {}),
          [filePaths[0]]: diff,
        },
      },
    };
  });
}

async function fetchThreadHydrationPayload(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
  messagesPromise?: Promise<RunnerConversationMessage[]>;
}): Promise<RunnerThreadHydrationPayload> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = buildRunnerHeaders(params.requestHeaders, params.apiKey);
  const messagesPromise =
    params.messagesPromise ||
    fetchAllThreadMessages({
      backendUrl,
      apiKey: params.apiKey,
      threadId: params.threadId,
      requestHeaders: params.requestHeaders,
    }).catch(() => []);

  const [threadResponse, logsResponse, diffsResponse, stepsResponse, messages] = await Promise.all([
    fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}`, {
      method: "GET",
      headers,
      cache: "no-store",
    }),
    fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/logs`, {
      method: "GET",
      headers,
      cache: "no-store",
    }),
    fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/diffs`, {
      method: "GET",
      headers,
      cache: "no-store",
    }).catch(() => null),
    fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/steps?limit=500`, {
      method: "GET",
      headers,
      cache: "no-store",
    }).catch(() => null),
    messagesPromise,
  ]);

  const [threadBody, logsBody, diffsBody, stepsBody] = await Promise.all([
    threadResponse.text(),
    logsResponse.text(),
    diffsResponse ? diffsResponse.text() : Promise.resolve(""),
    stepsResponse ? stepsResponse.text() : Promise.resolve(""),
  ]);

  let parsedThread: {
    thread?: {
      id?: string | null;
      title?: string | null;
      status?: string | null;
      task?: string | null;
      environmentId?: string | null;
      duration?: string | number | null;
      startedAt?: string | null;
      completedAt?: string | null;
      updatedAt?: string | null;
      lastMessagePreview?: string | null;
      metadata?: Record<string, unknown> | null;
      agentName?: string | null;
      environmentName?: string | null;
    };
    message?: string;
    error?: string;
  } = {};
  let parsedLogs: {
    logs?: RunnerLog[];
    status?: string | null;
    updatedAt?: string | null;
    duration?: string | number | null;
    agentName?: string | null;
    environmentName?: string | null;
    message?: string;
    error?: string;
  } = {};
  let parsedDiffs: {
    diffs?: RunnerThreadDiffEntry[];
    message?: string;
    error?: string;
  } = {};
  let parsedSteps: {
    data?: RunnerThreadStep[];
    message?: string;
    error?: string;
  } = {};

  try {
    parsedThread = threadBody ? JSON.parse(threadBody) : {};
  } catch {
    parsedThread = {};
  }

  try {
    parsedLogs = logsBody ? JSON.parse(logsBody) : {};
  } catch {
    parsedLogs = {};
  }

  if (diffsResponse?.ok) {
    try {
      parsedDiffs = diffsBody ? JSON.parse(diffsBody) : {};
    } catch {
      parsedDiffs = {};
    }
  }

  if (stepsResponse?.ok) {
    try {
      parsedSteps = stepsBody ? JSON.parse(stepsBody) : {};
    } catch {
      parsedSteps = {};
    }
  }

  if (!threadResponse.ok) {
    throw new Error(parsedThread.message || parsedThread.error || `Failed to load thread (${threadResponse.status})`);
  }

  if (!logsResponse.ok) {
    throw new Error(parsedLogs.message || parsedLogs.error || `Failed to load thread logs (${logsResponse.status})`);
  }

  const startedAtMs = parseIsoTimestampMs(parsedThread.thread?.startedAt);
  const parsedStepsData = parseThreadSteps(parsedSteps.data);
  let diffEntries = parseThreadDiffEntries(parsedDiffs.diffs);
  const completedAtMs = parseIsoTimestampMs(parsedThread.thread?.completedAt);
  const rawThreadStatus =
    typeof parsedLogs.status === "string" && parsedLogs.status.trim()
      ? parsedLogs.status.trim()
      : typeof parsedThread.thread?.status === "string" && parsedThread.thread.status.trim()
        ? parsedThread.thread.status.trim()
        : null;
  const chronologicalMessages = sortRunnerConversationMessagesChronologically(messages);
  const parsedRunnerLogs = Array.isArray(parsedLogs.logs) ? parsedLogs.logs.map(normalizeHydratedLog) : [];
  const chronologicalLogs = sortRunnerLogsChronologically(buildFailedThreadFallbackLogs({
    logs: parsedRunnerLogs,
    threadStatus: rawThreadStatus,
    title: parsedThread.thread?.title,
    task: parsedThread.thread?.task,
    lastMessagePreview: parsedThread.thread?.lastMessagePreview,
    updatedAt: parsedThread.thread?.updatedAt ?? parsedLogs.updatedAt,
    completedAt: parsedThread.thread?.completedAt,
    metadata: parsedThread.thread?.metadata ?? null,
  }).map(normalizeHydratedLog));
  const canonicalConversationMessages = chronologicalMessages.filter(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0
  );
  const hydrationLogs = chronologicalLogs.filter((log) => {
    if (canonicalConversationMessages.length === 0) {
      return true;
    }
    if (log.eventType === "user_message" || (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage) {
      return false;
    }
    if (log.eventType === "agent_message" || log.eventType === "llm_response") {
      return false;
    }
    return true;
  });

  if (hydrationLogs.length === 0 || !hydrationLogs.some((log) => log.eventType === "file_change")) {
    if (diffEntries.length === 0 && parsedStepsData.length > 0) {
      diffEntries = await fetchHydratedStepDiffEntries({
        backendUrl,
        threadId: params.threadId,
        headers,
        steps: parsedStepsData,
      });
    }
  }
  const mergedLogs = mergeThreadStepsIntoLogs(
    mergeThreadDiffsIntoLogs(hydrationLogs, diffEntries),
    parsedStepsData,
    diffEntries,
    startedAtMs
  );

  return {
    threadId: typeof parsedThread.thread?.id === "string" && parsedThread.thread.id.trim() ? parsedThread.thread.id : params.threadId,
    threadStatus: resolveHydratedThreadLifecycleStatus(rawThreadStatus, completedAtMs),
    threadUpdatedAt:
      typeof parsedLogs.updatedAt === "string" && parsedLogs.updatedAt.trim()
        ? parsedLogs.updatedAt
        : null,
    threadEnvironmentId:
      typeof parsedThread.thread?.environmentId === "string" && parsedThread.thread.environmentId.trim()
        ? parsedThread.thread.environmentId
        : null,
    threadEnvironmentName:
      parsedLogs.environmentName ?? parsedThread.thread?.environmentName ?? null,
    initialPrompt: typeof parsedThread.thread?.task === "string" ? parsedThread.thread.task : "",
    logs: mergedLogs,
    messages: chronologicalMessages,
    durationSeconds: parseDurationSecondsValue(parsedLogs.duration ?? parsedThread.thread?.duration),
    startedAtMs,
    completedAtMs,
    agentName: parsedLogs.agentName ?? parsedThread.thread?.agentName ?? null,
    environmentName: parsedLogs.environmentName ?? parsedThread.thread?.environmentName ?? null,
  };
}

async function fetchThreadLogsSnapshot(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<{
  logs: RunnerLog[];
  status: string | null;
  durationSeconds: number | null;
  agentName: string | null;
  environmentName: string | null;
}> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/logs`, {
    method: "GET",
    headers: buildRunnerHeaders(params.requestHeaders, params.apiKey),
    cache: "no-store",
  });

  const bodyText = await response.text();
  let parsed: {
    logs?: RunnerLog[];
    status?: string | null;
    duration?: string | number | null;
    agentName?: string | null;
    environmentName?: string | null;
    message?: string;
    error?: string;
  } = {};

  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(parsed.message || parsed.error || `Failed to load thread logs (${response.status})`);
  }

  const status = typeof parsed.status === "string" && parsed.status.trim() ? parsed.status.trim() : null;
  const parsedRunnerLogs = Array.isArray(parsed.logs) ? parsed.logs.map(normalizeHydratedLog) : [];

  return {
    logs: buildFailedThreadFallbackLogs({
      logs: parsedRunnerLogs,
      threadStatus: status,
    }),
    status,
    durationSeconds: parseDurationSecondsValue(parsed.duration),
    agentName: parsed.agentName ?? null,
    environmentName: parsed.environmentName ?? null,
  };
}

async function fetchThreadStatusSnapshot(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<{
  threadId: string;
  status: string | null;
  updatedAt: string | null;
  completedAt: string | null;
}> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/status`, {
    method: "GET",
    headers: buildRunnerHeaders(params.requestHeaders, params.apiKey),
    cache: "no-store",
  });

  const bodyText = await response.text();
  let parsed: {
    threadId?: string;
    id?: string;
    status?: string | null;
    updatedAt?: string | null;
    completedAt?: string | null;
    message?: string;
    error?: string;
  } = {};

  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(parsed.message || parsed.error || `Failed to load thread status (${response.status})`);
  }

  const completedAt = typeof parsed.completedAt === "string" && parsed.completedAt.trim() ? parsed.completedAt : null;

  return {
    threadId:
      typeof parsed.threadId === "string" && parsed.threadId.trim()
        ? parsed.threadId
        : typeof parsed.id === "string" && parsed.id.trim()
          ? parsed.id
          : params.threadId,
    status: resolveHydratedThreadLifecycleStatus(
      typeof parsed.status === "string" && parsed.status.trim() ? parsed.status.trim() : null,
      parseIsoTimestampMs(completedAt)
    ),
    updatedAt: typeof parsed.updatedAt === "string" && parsed.updatedAt.trim() ? parsed.updatedAt : null,
    completedAt,
  };
}

function normalizeRunnerDeepResearchSession(value: unknown): RunnerDeepResearchSession | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const session = value as Record<string, unknown>;
  const metadata =
    session.metadata && typeof session.metadata === "object" && !Array.isArray(session.metadata)
      ? (session.metadata as Record<string, unknown>)
      : null;
  const metadataSources = Array.isArray(metadata?.sources)
    ? metadata.sources.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];
  const reportManifestPath =
    typeof metadata?.reportManifestPath === "string" && metadata.reportManifestPath.trim()
      ? metadata.reportManifestPath.trim()
      : null;

  return {
    id: typeof session.id === "string" ? session.id : "",
    threadId: typeof session.threadId === "string" ? session.threadId : "",
    userId: typeof session.userId === "string" ? session.userId : "",
    interactionId: typeof session.interactionId === "string" ? session.interactionId : null,
    topic: typeof session.topic === "string" ? session.topic : "",
    status: typeof session.status === "string" ? session.status : "starting",
    createdAt: typeof session.createdAt === "string" ? session.createdAt : "",
    startedAt: typeof session.startedAt === "string" ? session.startedAt : null,
    completedAt: typeof session.completedAt === "string" ? session.completedAt : null,
    elapsedSeconds: typeof session.elapsedSeconds === "number" ? session.elapsedSeconds : null,
    thinkingSummaries: Array.isArray(session.thinkingSummaries)
      ? session.thinkingSummaries
          .map((entry) => {
            if (!entry || typeof entry !== "object") return null;
            const summary = entry as Record<string, unknown>;
            const summaryText = typeof summary.summary === "string" ? summary.summary : "";
            if (!summaryText.trim()) return null;
            return {
              timestamp: typeof summary.timestamp === "string" ? summary.timestamp : "",
              phase: typeof summary.phase === "string" ? summary.phase : "Thinking",
              summary: summaryText,
            };
          })
          .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      : [],
    reportPath: typeof session.reportPath === "string" ? session.reportPath : null,
    reportLength: typeof session.reportLength === "number" ? session.reportLength : null,
    sourcesCount: typeof session.sourcesCount === "number" ? session.sourcesCount : null,
    reportManifestPath,
    sources: metadataSources,
    errorMessage: typeof session.errorMessage === "string" ? session.errorMessage : null,
    metadata,
  };
}

async function fetchThreadResearchSessions(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
}): Promise<RunnerDeepResearchSession[]> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const response = await fetch(`${backendUrl}/threads/${encodeURIComponent(params.threadId)}/research`, {
    method: "GET",
    headers: buildRunnerHeaders(params.requestHeaders, params.apiKey),
    cache: "no-store",
  });

  const bodyText = await response.text();
  let parsed: {
    data?: unknown[];
    message?: string;
    error?: string;
  } = {};

  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = {};
  }

  if (!response.ok) {
    throw new Error(parsed.message || parsed.error || `Failed to load deep research sessions (${response.status})`);
  }

  return Array.isArray(parsed.data)
    ? parsed.data.map((entry) => normalizeRunnerDeepResearchSession(entry)).filter((entry): entry is RunnerDeepResearchSession => Boolean(entry?.id))
    : [];
}

function normalizeThreadLifecycleStatus(status: string | null | undefined): string {
  return typeof status === "string" ? status.trim().toLowerCase() : "";
}

function resolveHydratedThreadLifecycleStatus(status: string | null | undefined, completedAtMs?: number | null): string | null {
  const normalizedStatus = normalizeThreadLifecycleStatus(status);
  if (isPendingPermissionThreadLifecycleStatus(normalizedStatus)) {
    return "permission_asked";
  }
  if (isRunningThreadLifecycleStatus(normalizedStatus) && (normalizedStatus !== "active" || completedAtMs == null)) {
    return normalizedStatus;
  }
  if (completedAtMs != null && !isTerminalThreadLifecycleStatus(normalizedStatus)) {
    return "completed";
  }
  return typeof status === "string" && status.trim() ? status.trim() : null;
}

function buildFailedThreadFallbackLogs(params: {
  logs: RunnerLog[];
  threadStatus: string | null | undefined;
  title?: string | null;
  task?: string | null;
  lastMessagePreview?: string | null;
  updatedAt?: string | null;
  completedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}): RunnerLog[] {
  if (params.logs.length > 0 || normalizeThreadLifecycleStatus(params.threadStatus) !== "failed") {
    return params.logs;
  }

  const task = typeof params.task === "string" ? params.task.trim() : "";
  const preview = typeof params.lastMessagePreview === "string" ? params.lastMessagePreview.trim() : "";
  const scheduleId =
    params.metadata &&
    typeof params.metadata === "object" &&
    !Array.isArray(params.metadata) &&
    typeof params.metadata.scheduleId === "string"
      ? params.metadata.scheduleId.trim()
      : "";
  const title = typeof params.title === "string" ? params.title.trim() : "";
  const isScheduledThread = Boolean(scheduleId || /^scheduled:/i.test(title));
  const fallbackTime =
    (typeof params.completedAt === "string" && params.completedAt.trim()) ||
    (typeof params.updatedAt === "string" && params.updatedAt.trim()) ||
    new Date().toISOString();

  return [{
    createdAt: fallbackTime,
    time: fallbackTime,
    message: preview && preview !== task
      ? preview
      : isScheduledThread
        ? "Scheduled task failed before working logs were recorded."
        : "Thread failed before working logs were recorded.",
    type: "error",
    metadata: {
      status: "failed",
      error: {
        source: isScheduledThread ? "scheduled_task" : "thread",
        synthetic: true,
        ...(scheduleId ? { scheduleId } : {}),
      },
    },
  }];
}

function isRunningThreadLifecycleStatus(status: string | null | undefined): boolean {
  return [
    "queued",
    "pending",
    "starting",
    "running",
    "active",
    "created",
    "ready",
  ].includes(normalizeThreadLifecycleStatus(status));
}

function isPendingPermissionThreadLifecycleStatus(status: string | null | undefined): boolean {
  const normalizedStatus = normalizeThreadLifecycleStatus(status);
  return normalizedStatus === "permission_asked" || normalizedStatus === "permission asked";
}

function isTerminalThreadLifecycleStatus(status: string | null | undefined): boolean {
  return [
    "completed",
    "complete",
    "done",
    "succeeded",
    "success",
    "finished",
    "failed",
    "cancelled",
    "canceled",
    "archived",
    "deleted",
  ].includes(normalizeThreadLifecycleStatus(status));
}

function terminalTurnStatusFromThreadStatus(status: string | null | undefined): RunnerTurnStatus {
  const normalizedStatus = normalizeThreadLifecycleStatus(status);
  if (normalizedStatus === "failed") return "failed";
  if (normalizedStatus === "cancelled" || normalizedStatus === "canceled") return "cancelled";
  return "completed";
}

function threadLifecycleIsTerminal(meta?: {
  threadStatus?: string | null;
  completedAtMs?: number | null;
}): boolean {
  const normalizedStatus = normalizeThreadLifecycleStatus(meta?.threadStatus);
  if (isPendingPermissionThreadLifecycleStatus(normalizedStatus)) {
    return false;
  }
  if (isRunningThreadLifecycleStatus(normalizedStatus) && (normalizedStatus !== "active" || meta?.completedAtMs == null)) {
    return false;
  }
  return isTerminalThreadLifecycleStatus(meta?.threadStatus) || meta?.completedAtMs != null;
}

function settleHydratedTerminalThreadTurns(
  turns: RunnerTurn[],
  meta?: {
    threadStatus?: string | null;
    completedAtMs?: number | null;
  }
): RunnerTurn[] {
  if (!threadLifecycleIsTerminal(meta)) {
    return turns;
  }

  const terminalStatus = terminalTurnStatusFromThreadStatus(meta?.threadStatus);
  let changed = false;
  const nextTurns = turns.map((turn) => {
    if (turn.status !== "queued" && !isActiveTurnStatus(turn.status)) {
      return turn;
    }

    changed = true;
    return {
      ...turn,
      status: terminalStatus,
      completedAtMs: turn.completedAtMs ?? meta?.completedAtMs ?? getTurnLatestProgressTimestampMs(turn),
    };
  });

  return changed ? nextTurns : turns;
}

function buildHydratedTurnsFromMessages(
  messages: RunnerConversationMessage[],
  meta?: {
    agentName?: string | null;
    environmentName?: string | null;
    backendUrl?: string;
    threadStatus?: string | null;
    completedAtMs?: number | null;
  }
): RunnerTurn[] {
  const chronologicalMessages = sortRunnerConversationMessagesChronologically(messages);
  const turns: RunnerTurn[] = [];
  let currentTurn: RunnerTurn | null = null;
  let pendingBtwTurn: RunnerTurn | null = null;

  function commitCurrentTurn() {
    if (!currentTurn) return;
    const hasPrompt = currentTurn.prompt.trim().length > 0;
    const hasResponse = currentTurn.logs.some((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
    if (hasPrompt || hasResponse) {
      turns.push(currentTurn);
    }
    currentTurn = null;
  }

  function commitPendingBtwTurn() {
    if (!pendingBtwTurn) return;
    const hasPrompt = pendingBtwTurn.prompt.trim().length > 0;
    const hasResponse = pendingBtwTurn.logs.some((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
    if (hasPrompt || hasResponse) {
      turns.push(pendingBtwTurn);
    }
    pendingBtwTurn = null;
  }

  for (let index = 0; index < chronologicalMessages.length; index += 1) {
    const message = chronologicalMessages[index];
    const createdAtMs = message.createdAt ? Date.parse(message.createdAt) : Number.NaN;
    const safeTimestamp = Number.isFinite(createdAtMs) ? createdAtMs : Date.now() + index;

    if (message.role === "user") {
      if (isBtwTurnPrompt(message.content || "")) {
        commitPendingBtwTurn();
        pendingBtwTurn = {
          id: message.id || generateId("turn"),
          sourceMessageId: message.id || null,
          prompt: message.content || "",
          logs: [],
          startedAtMs: safeTimestamp,
          completedAtMs: safeTimestamp,
          status: "running",
          animateOnRender: false,
          agentName: meta?.agentName ?? null,
          environmentName: meta?.environmentName ?? null,
          presentation: "btw",
          quotedSelection: normalizeQuotedSelection(message.logMetadata?.quotedSelection),
          attachments: normalizeTurnAttachments(message.logMetadata?.attachments, meta?.backendUrl),
        };
      } else {
        commitPendingBtwTurn();
        commitCurrentTurn();
        currentTurn = {
          id: message.id || generateId("turn"),
          sourceMessageId: message.id || null,
          prompt: message.content || "",
          logs: [],
          startedAtMs: safeTimestamp,
          completedAtMs: safeTimestamp,
          status: "completed",
          animateOnRender: false,
          agentName: meta?.agentName ?? null,
          environmentName: meta?.environmentName ?? null,
          presentation: "default",
          quotedSelection: normalizeQuotedSelection(message.logMetadata?.quotedSelection),
          attachments: normalizeTurnAttachments(message.logMetadata?.attachments, meta?.backendUrl),
        };
      }
      continue;
    }

    if (message.role !== "assistant") {
      continue;
    }

    const assistantBelongsToBtw =
      Boolean(message.logMetadata?.isBTW) ||
      (pendingBtwTurn !== null && turnPresentation(pendingBtwTurn) === "btw");

    if (assistantBelongsToBtw && pendingBtwTurn) {
      const existingResponseIndex = pendingBtwTurn.logs.findIndex(
        (log) => log.eventType === "agent_message" || log.eventType === "llm_response"
      );

      if (existingResponseIndex === -1) {
        pendingBtwTurn.logs.push({
          time: message.createdAt || new Date(safeTimestamp).toISOString(),
          message: message.content || "",
          type: "info",
          eventType: "agent_message",
        });
      } else {
        const existing = pendingBtwTurn.logs[existingResponseIndex];
        pendingBtwTurn.logs[existingResponseIndex] = {
          ...existing,
          message: `${existing.message}\n\n${message.content || ""}`.trim(),
        };
      }

      pendingBtwTurn.completedAtMs = safeTimestamp;
      pendingBtwTurn.status = "completed";
      commitPendingBtwTurn();
      continue;
    }

    if (!currentTurn) {
      continue;
    }

    const existingResponseIndex = currentTurn.logs.findIndex(
      (log) => log.eventType === "agent_message" || log.eventType === "llm_response"
    );

    if (existingResponseIndex === -1) {
      currentTurn.logs.push({
        time: message.createdAt || new Date(safeTimestamp).toISOString(),
        message: message.content || "",
        type: "info",
        eventType: "agent_message",
      });
    } else {
      const existing = currentTurn.logs[existingResponseIndex];
      currentTurn.logs[existingResponseIndex] = {
        ...existing,
        message: `${existing.message}\n\n${message.content || ""}`.trim(),
      };
    }

    currentTurn.completedAtMs = safeTimestamp;
    currentTurn.status = "completed";
  }

  commitPendingBtwTurn();
  commitCurrentTurn();
  const sortedTurns = [...turns].sort((left, right) => {
    if (left.startedAtMs !== right.startedAtMs) {
      return left.startedAtMs - right.startedAtMs;
    }
    return left.id.localeCompare(right.id);
  });
  if (sortedTurns[0]) {
    sortedTurns[0].isInitialTurn = true;
  }
  return applyHydratedRunningThreadState(
    attachHydratedMessageIdsToTurns(sortedTurns, chronologicalMessages, meta?.backendUrl),
    meta
  );
}

function hydratedThreadStatusIsRunning(meta?: {
  threadStatus?: string | null;
  completedAtMs?: number | null;
}): boolean {
  const normalizedStatus = typeof meta?.threadStatus === "string" ? meta.threadStatus.trim().toLowerCase() : "";
  if (isRunningThreadLifecycleStatus(normalizedStatus)) {
    return normalizedStatus !== "active" || meta?.completedAtMs == null;
  }
  if (normalizedStatus) {
    return false;
  }
  if (!meta || !Object.prototype.hasOwnProperty.call(meta, "completedAtMs")) {
    return false;
  }
  return meta.completedAtMs == null;
}

function turnHasResponse(turn: RunnerTurn): boolean {
  return turn.logs.some(isTurnResponseLog);
}

function findLatestUnansweredUserTurnIndex(turns: RunnerTurn[]): number {
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    const turn = turns[index];
    if (!turn || turnPresentation(turn) === "context-action-notice" || !turn.prompt.trim()) {
      continue;
    }
    return turnHasResponse(turn) ? -1 : index;
  }
  return -1;
}

function findStaleCompletedAtRunningTurnIndex(
  turns: RunnerTurn[],
  meta?: {
    threadStatus?: string | null;
    completedAtMs?: number | null;
  }
): number {
  const completedAtMs = meta?.completedAtMs;
  const normalizedStatus = normalizeThreadLifecycleStatus(meta?.threadStatus);
  if (
    completedAtMs == null ||
    (isRunningThreadLifecycleStatus(normalizedStatus) && normalizedStatus !== "active") ||
    isPendingPermissionThreadLifecycleStatus(normalizedStatus)
  ) {
    return -1;
  }

  const latestUnansweredTurnIndex = findLatestUnansweredUserTurnIndex(turns);
  if (latestUnansweredTurnIndex === -1) {
    return -1;
  }

  const latestUnansweredTurn = turns[latestUnansweredTurnIndex];
  if (!latestUnansweredTurn) {
    return -1;
  }

  return latestUnansweredTurn.startedAtMs > completedAtMs + 1000
    ? latestUnansweredTurnIndex
    : -1;
}

function applyHydratedRunningThreadState(
  turns: RunnerTurn[],
  meta?: {
    threadStatus?: string | null;
    completedAtMs?: number | null;
  }
): RunnerTurn[] {
  if (turns.length === 0) {
    return turns;
  }

  const staleCompletedAtRunningTurnIndex = findStaleCompletedAtRunningTurnIndex(turns, meta);
  const terminalSettledTurns = staleCompletedAtRunningTurnIndex === -1
    ? settleHydratedTerminalThreadTurns(turns, meta)
    : turns;
  if (terminalSettledTurns !== turns) {
    return terminalSettledTurns;
  }

  let activeDeepResearchTurnIndex = -1;
  for (let index = turns.length - 1; index >= 0; index -= 1) {
    if (hasActiveDeepResearchLogGroup(turns[index]!.logs)) {
      activeDeepResearchTurnIndex = index;
      break;
    }
  }
  const shouldForceRunningState =
    hydratedThreadStatusIsRunning(meta) ||
    activeDeepResearchTurnIndex !== -1 ||
    staleCompletedAtRunningTurnIndex !== -1;

  if (!shouldForceRunningState) {
    return turns;
  }

  const targetIndex = activeDeepResearchTurnIndex !== -1
    ? activeDeepResearchTurnIndex
    : staleCompletedAtRunningTurnIndex !== -1
      ? staleCompletedAtRunningTurnIndex
      : turns.length - 1;
  const targetTurn = turns[targetIndex];
  if (!targetTurn || targetTurn.status === "failed" || targetTurn.status === "cancelled") {
    return turns;
  }

  const shouldTargetPermissionAsked = isPendingPermissionThreadLifecycleStatus(meta?.threadStatus);
  if (
    targetTurn.completedAtMs == null &&
    (targetTurn.status === "running" || (shouldTargetPermissionAsked && targetTurn.status === "permission_asked"))
  ) {
    return turns;
  }

  const nextTurns = turns.slice();
  nextTurns[targetIndex] = {
    ...targetTurn,
    status: isPendingPermissionThreadLifecycleStatus(meta?.threadStatus) ? "permission_asked" : "running",
    completedAtMs: undefined,
  };
  return nextTurns;
}

function attachHydratedMessageIdsToTurns(
  turns: RunnerTurn[],
  messages: RunnerConversationMessage[],
  backendUrl?: string
): RunnerTurn[] {
  const userMessages = messages.filter(
    (message) =>
      message.role === "user" &&
      typeof message.id === "string" &&
      message.id.trim().length > 0 &&
      typeof message.content === "string"
  );

  if (userMessages.length === 0) {
    return turns;
  }

  let nextUserMessageIndex = 0;

  return turns.map((turn) => {
    let matchedMessage: RunnerConversationMessage | null = null;

    if (typeof turn.sourceMessageId === "string" && turn.sourceMessageId.trim().length > 0) {
      matchedMessage =
        userMessages.find((message) => message.id === turn.sourceMessageId) || null;
    }

    if (!matchedMessage && turn.prompt.trim().length > 0) {
      let matchedMessageIndex = userMessages.findIndex(
        (message, index) => index >= nextUserMessageIndex && message.content.trim() === turn.prompt.trim()
      );

      if (matchedMessageIndex === -1 && nextUserMessageIndex < userMessages.length) {
        matchedMessageIndex = nextUserMessageIndex;
      }

      if (matchedMessageIndex !== -1) {
        matchedMessage = userMessages[matchedMessageIndex] || null;
        nextUserMessageIndex = matchedMessageIndex + 1;
      }
    }

    if (!matchedMessage) {
      return turn;
    }

    return {
      ...turn,
      id: turn.sourceMessageId ? turn.id : matchedMessage.id!,
      sourceMessageId: matchedMessage.id!,
      quotedSelection: normalizeQuotedSelection(matchedMessage.logMetadata?.quotedSelection),
      attachments: normalizeTurnAttachments(matchedMessage.logMetadata?.attachments, backendUrl),
    };
  });
}

function buildHydratedTurnsFromPayload(
  payload: RunnerThreadHydrationPayload,
  fallbackMeta?: { agentName?: string | null; environmentName?: string | null; backendUrl?: string }
): RunnerTurn[] {
  const chronologicalMessages = sortRunnerConversationMessagesChronologically(payload.messages);
  const chronologicalLogs = sortRunnerLogsChronologically(payload.logs.map(normalizeHydratedLog));
  const canonicalMessages = chronologicalMessages.filter(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0
  );
  if (canonicalMessages.length > 0) {
    const messageTurns = buildHydratedTurnsFromMessages(chronologicalMessages, {
      agentName: payload.agentName ?? fallbackMeta?.agentName ?? null,
      environmentName: payload.environmentName ?? fallbackMeta?.environmentName ?? null,
      backendUrl: fallbackMeta?.backendUrl,
      threadStatus: payload.threadStatus,
      completedAtMs: payload.completedAtMs,
    });
    const messageTurnsWithTimeline = mergeHydratedTimelineLogsIntoMessageTurns(messageTurns, chronologicalLogs, {
      startedAtMs: payload.startedAtMs,
    });
    if (messageTurnsWithTimeline) {
      return applyHydratedRunningThreadState(messageTurnsWithTimeline, {
        threadStatus: payload.threadStatus,
        completedAtMs: payload.completedAtMs,
      });
    }
  }

  const turnsFromLogs = buildHydratedTurnsFromLogs(chronologicalLogs, payload.initialPrompt, chronologicalMessages, {
    durationSeconds: payload.durationSeconds,
    startedAtMs: payload.startedAtMs,
    completedAtMs: payload.completedAtMs,
    threadStatus: payload.threadStatus,
    agentName: payload.agentName,
    environmentName: payload.environmentName,
    backendUrl: fallbackMeta?.backendUrl,
  });
  const turnsWithCanonicalMessages = mergeHydratedMessageTurnsIntoTurns(turnsFromLogs, chronologicalMessages, {
    agentName: payload.agentName ?? fallbackMeta?.agentName ?? null,
    environmentName: payload.environmentName ?? fallbackMeta?.environmentName ?? null,
    backendUrl: fallbackMeta?.backendUrl,
    threadStatus: payload.threadStatus,
    completedAtMs: payload.completedAtMs,
  });
  const hasConversationMessages = chronologicalMessages.some(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0
  );
  const hasHydratedConversationTurns = turnsWithCanonicalMessages.some((turn) => {
    if (turn.prompt.trim().length > 0) {
      return true;
    }
    return turn.logs.some((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
  });

  if (hasConversationMessages && !hasHydratedConversationTurns) {
    return buildHydratedTurnsFromMessages(chronologicalMessages, {
      agentName: payload.agentName ?? fallbackMeta?.agentName ?? null,
      environmentName: payload.environmentName ?? fallbackMeta?.environmentName ?? null,
      backendUrl: fallbackMeta?.backendUrl,
      threadStatus: payload.threadStatus,
      completedAtMs: payload.completedAtMs,
    });
  }

  return turnsWithCanonicalMessages;
}

function isBtwTurnPrompt(prompt: string): boolean {
  return /^\/btw\b/i.test(prompt.trim());
}

function normalizeTurnPrompt(prompt: string): string {
  return stripSystemTags(prompt || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function sanitizeQuotedSelectionText(text: string): string {
  const normalized = text.replace(/\r\n?/g, "\n").replace(/\u00a0/g, " ").trim();
  if (normalized.length <= MAX_QUOTED_SELECTION_LENGTH) {
    return normalized;
  }
  return `${normalized.slice(0, MAX_QUOTED_SELECTION_LENGTH - 1).trimEnd()}…`;
}

function previewQuotedSelectionText(text: string): string {
  const singleLine = text.replace(/\s+/g, " ").trim();
  if (singleLine.length <= QUOTED_SELECTION_PREVIEW_LENGTH) {
    return singleLine;
  }
  return `${singleLine.slice(0, QUOTED_SELECTION_PREVIEW_LENGTH - 1).trimEnd()}…`;
}

function normalizeQuotedSelection(
  value: unknown
): RunnerQuotedSelection | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as { text?: unknown; sourceType?: unknown };
  if (typeof candidate.text !== "string") {
    return null;
  }
  const text = sanitizeQuotedSelectionText(candidate.text);
  if (!text) {
    return null;
  }
  const sourceType: RunnerQuotedSelectionSource =
    candidate.sourceType === "run_summary" ? "run_summary" : "working_log";
  return {
    text,
    sourceType,
  };
}

function resolveAttachmentAssetUrl(url: string | undefined, backendUrl?: string, attachmentId?: string): string | undefined {
  return resolveRunnerPreviewAssetUrl(url, backendUrl, attachmentId);
}

function normalizeTurnAttachment(value: unknown, backendUrl?: string): RunnerTurnAttachment | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const candidate = value as {
    id?: unknown;
    filename?: unknown;
    name?: unknown;
    mimeType?: unknown;
    type?: unknown;
    uploadStatus?: unknown;
    url?: unknown;
    previewUrl?: unknown;
    integrationSource?: unknown;
    githubRepoFullName?: unknown;
    githubRef?: unknown;
    githubItemPath?: unknown;
    githubSelectionType?: unknown;
  };
  const attachmentId = typeof candidate.id === "string" && candidate.id.trim() ? candidate.id.trim() : generateId("att");
  const filename =
    typeof candidate.filename === "string" && candidate.filename.trim()
      ? candidate.filename.trim()
      : typeof candidate.name === "string" && candidate.name.trim()
        ? candidate.name.trim()
        : "";
  if (!filename) {
    return null;
  }
  const mimeType = typeof candidate.mimeType === "string" && candidate.mimeType.trim() ? candidate.mimeType.trim() : "application/octet-stream";
  const type: RunnerAttachment["type"] =
    candidate.type === "image" || candidate.type === "document"
      ? candidate.type
      : attachmentTypeForFile(mimeType, filename);
  const url = resolveAttachmentAssetUrl(typeof candidate.url === "string" ? candidate.url : undefined, backendUrl, attachmentId);
  const previewUrl = type === "image"
    ? resolveAttachmentAssetUrl(
        typeof candidate.previewUrl === "string" ? candidate.previewUrl : typeof candidate.url === "string" ? candidate.url : undefined,
        backendUrl,
        attachmentId
      )
    : undefined;
  return {
    id: attachmentId,
    filename,
    mimeType,
    type,
    uploadStatus:
      candidate.uploadStatus === "idle" ||
      candidate.uploadStatus === "uploading" ||
      candidate.uploadStatus === "uploaded" ||
      candidate.uploadStatus === "failed"
        ? candidate.uploadStatus
        : undefined,
    url,
    previewUrl,
    integrationSource:
      candidate.integrationSource === "google-drive" || candidate.integrationSource === "one-drive" || candidate.integrationSource === "github"
        ? candidate.integrationSource
        : undefined,
    githubRepoFullName:
      typeof candidate.githubRepoFullName === "string" && candidate.githubRepoFullName.trim()
        ? candidate.githubRepoFullName.trim()
        : undefined,
    githubRef:
      typeof candidate.githubRef === "string" && candidate.githubRef.trim()
        ? candidate.githubRef.trim()
        : candidate.githubRef === null
          ? null
          : undefined,
    githubItemPath:
      typeof candidate.githubItemPath === "string" && candidate.githubItemPath.trim()
        ? candidate.githubItemPath.trim()
        : undefined,
    githubSelectionType: candidate.githubSelectionType === "repo" || candidate.githubSelectionType === "file"
      ? candidate.githubSelectionType
      : undefined,
  };
}

function normalizeTurnAttachments(value: unknown, backendUrl?: string): RunnerTurnAttachment[] | null {
  if (!Array.isArray(value)) {
    return null;
  }
  const normalized = value
    .map((entry) => normalizeTurnAttachment(entry, backendUrl))
    .filter((attachment): attachment is RunnerTurnAttachment => Boolean(attachment));
  return normalized.length > 0 ? normalized : null;
}

function buildTurnAttachmentsFromRunnerAttachments(
  attachments: RunnerAttachment[] | undefined,
  backendUrl?: string
): RunnerTurnAttachment[] | null {
  if (!attachments || attachments.length === 0) {
    return null;
  }
  return normalizeTurnAttachments(attachments, backendUrl);
}

function buildTurnAttachmentsFromLocalAttachments(attachments: LocalAttachment[]): RunnerTurnAttachment[] | null {
  if (attachments.length === 0) {
    return null;
  }
  return attachments.map((attachment) => ({
    id: attachment.id,
    filename: attachment.file.name,
    mimeType: attachment.file.type || "application/octet-stream",
    type: attachment.type,
    previewUrl: attachment.previewUrl,
    integrationSource: attachment.integrationSource,
    githubRepoFullName: attachment.githubRepoFullName,
    githubRef: attachment.githubRef,
    githubItemPath: attachment.githubItemPath,
    githubSelectionType: attachment.githubSelectionType,
    uploadStatus: attachment.uploadStatus,
  }));
}

function turnAttachmentMatchKey(filename: string, mimeType: string, type: RunnerAttachment["type"]): string {
  return `${filename}\u0000${mimeType}\u0000${type}`;
}

function buildTurnAttachmentsForExecution(
  attachmentEntries: LocalAttachment[],
  resolvedAttachments: RunnerAttachment[] | undefined,
  backendUrl?: string
): RunnerTurnAttachment[] | null {
  const localTurnAttachments = buildTurnAttachmentsFromLocalAttachments(attachmentEntries);
  const resolvedTurnAttachments = buildTurnAttachmentsFromRunnerAttachments(resolvedAttachments, backendUrl);

  if (!resolvedTurnAttachments || resolvedTurnAttachments.length === 0) {
    return localTurnAttachments;
  }
  if (!localTurnAttachments || localTurnAttachments.length === 0) {
    return resolvedTurnAttachments;
  }

  const resolvedBuckets = new Map<string, RunnerTurnAttachment[]>();
  for (const attachment of resolvedTurnAttachments) {
    const key = turnAttachmentMatchKey(attachment.filename, attachment.mimeType, attachment.type);
    const bucket = resolvedBuckets.get(key);
    if (bucket) {
      bucket.push(attachment);
    } else {
      resolvedBuckets.set(key, [attachment]);
    }
  }

  const merged = localTurnAttachments.map((attachment) => {
    const key = turnAttachmentMatchKey(attachment.filename, attachment.mimeType, attachment.type);
    const bucket = resolvedBuckets.get(key);
    const resolvedAttachment = bucket?.shift();
    if (!resolvedAttachment) {
      return attachment;
    }
    if (attachment.type === "image" && attachment.previewUrl) {
      return {
        ...resolvedAttachment,
        previewUrl: attachment.previewUrl,
      };
    }
    return resolvedAttachment;
  });

  for (const bucket of resolvedBuckets.values()) {
    merged.push(...bucket);
  }

  return merged;
}

function pickTurnAttachments(
  preferred?: RunnerTurnAttachment[] | null,
  fallback?: RunnerTurnAttachment[] | null
): RunnerTurnAttachment[] | null {
  if (preferred && preferred.length > 0) {
    return preferred;
  }
  if (fallback && fallback.length > 0) {
    return fallback;
  }
  return null;
}

function requiresAuthenticatedAttachmentPreview(url: string | undefined, backendUrl?: string): boolean {
  if (!url) {
    return false;
  }
  const normalizedUrl = url.trim();
  if (!normalizedUrl) {
    return false;
  }
  const normalizedBackendUrl = backendUrl ? sanitizeBackendUrl(backendUrl) : "";
  const normalizedPath = normalizedUrl.replace(/^https?:\/\/[^/]+/i, "");
  const isEnvironmentDownload = /(?:^|\/)(?:api\/)?environments\/[^/]+\/files\/download\//.test(normalizedPath);
  return (
    normalizedUrl.startsWith("/attachments/") ||
    normalizedUrl.startsWith("/api/attachments/") ||
    normalizedUrl.startsWith("/api/real/attachments/") ||
    isEnvironmentDownload ||
    (normalizedBackendUrl ? normalizedUrl.startsWith(`${normalizedBackendUrl}/attachments/`) : false)
  );
}

function selectionNodeToElement(node: Node | null): Element | null {
  if (!node) return null;
  return node instanceof Element ? node : node.parentElement;
}

function findQuotedSelectionContainer(node: Node | null, root: HTMLElement | null): HTMLElement | null {
  const element = selectionNodeToElement(node);
  if (!element || !root) {
    return null;
  }
  const container = element.closest(".agent-step-content, .tb-turn-summary, .tb-btw-turn-response");
  if (!container || !root.contains(container)) {
    return null;
  }
  if (element.closest(".tb-user-turn-shell, .tb-input-shell, .tb-selection-popup")) {
    return null;
  }
  return container as HTMLElement;
}

function getQuotedSelectionSourceType(container: HTMLElement): RunnerQuotedSelectionSource {
  return container.matches(".tb-turn-summary, .tb-btw-turn-response") ? "run_summary" : "working_log";
}

function getTurnAssistantMessageText(turn: RunnerTurn): string {
  return turn.logs
    .filter((log) => log.eventType === "agent_message" || log.eventType === "llm_response")
    .map((log) => stripSystemTags(log.message || "").trim())
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function turnPresentation(turn: RunnerTurn): RunnerTurn["presentation"] {
  if (turn.presentation) return turn.presentation;
  return isBtwTurnPrompt(turn.prompt) ? "btw" : "default";
}

function turnsLikelyMatch(localTurn: RunnerTurn, hydratedTurn: RunnerTurn): boolean {
  const localPresentation = turnPresentation(localTurn);
  const hydratedPresentation = turnPresentation(hydratedTurn);
  const localPrompt = normalizeTurnPrompt(localTurn.prompt);
  const hydratedPrompt = normalizeTurnPrompt(hydratedTurn.prompt);
  const localAssistantText = normalizeTurnPrompt(getTurnAssistantMessageText(localTurn));
  const hydratedAssistantText = normalizeTurnPrompt(getTurnAssistantMessageText(hydratedTurn));
  const localTimelineCount = localTurn.logs.filter(shouldDisplayTimelineLog).length;
  const hydratedTimelineCount = hydratedTurn.logs.filter(shouldDisplayTimelineLog).length;
  const localSourceMessageId =
    typeof localTurn.sourceMessageId === "string" && localTurn.sourceMessageId.trim()
      ? localTurn.sourceMessageId.trim()
      : "";
  const hydratedSourceMessageId =
    typeof hydratedTurn.sourceMessageId === "string" && hydratedTurn.sourceMessageId.trim()
      ? hydratedTurn.sourceMessageId.trim()
      : "";

  if (localPresentation === "btw" || hydratedPresentation === "btw") {
    if (localPresentation !== "btw" || hydratedPresentation !== "btw") {
      return false;
    }
    if (localPrompt && hydratedPrompt && localPrompt === hydratedPrompt) {
      return true;
    }
    const localAssistantText = getTurnAssistantMessageText(localTurn);
    const hydratedAssistantText = getTurnAssistantMessageText(hydratedTurn);
    if (!localAssistantText || !hydratedAssistantText) {
      return false;
    }
    return (
      localAssistantText === hydratedAssistantText ||
      localAssistantText.startsWith(hydratedAssistantText) ||
      hydratedAssistantText.startsWith(localAssistantText)
    );
  }

  if (localTurn.status === "queued" && localPrompt && hydratedPrompt) {
    return localPrompt === hydratedPrompt;
  }

  if (localPresentation === "context-action-notice" || hydratedPresentation === "context-action-notice") {
    const localActionType = localTurn.logs.find((log) => log.eventType === "action_summary")?.metadata?.actionType;
    const hydratedActionType = hydratedTurn.logs.find((log) => log.eventType === "action_summary")?.metadata?.actionType;
    return Boolean(localActionType && hydratedActionType && localActionType === hydratedActionType);
  }

  if (localSourceMessageId && hydratedSourceMessageId && localSourceMessageId === hydratedSourceMessageId) {
    return true;
  }

  if (localPrompt && hydratedPrompt && localPrompt === hydratedPrompt) {
    const localRawAssistantText = getTurnAssistantMessageText(localTurn);
    const hydratedRawAssistantText = getTurnAssistantMessageText(hydratedTurn);
    if (!localRawAssistantText || !hydratedRawAssistantText) {
      return true;
    }
    return (
      localRawAssistantText === hydratedRawAssistantText ||
      localRawAssistantText.startsWith(hydratedRawAssistantText) ||
        hydratedRawAssistantText.startsWith(localRawAssistantText)
    );
  }

  const oneSideMissingPrompt = (!localPrompt && hydratedPrompt) || (localPrompt && !hydratedPrompt);
  if (oneSideMissingPrompt) {
    const startedAtDeltaMs = Math.abs((localTurn.startedAtMs || 0) - (hydratedTurn.startedAtMs || 0));
    if (startedAtDeltaMs <= 60_000) {
      if (localAssistantText && hydratedAssistantText) {
        const assistantResponseMatches =
          localAssistantText === hydratedAssistantText ||
          localAssistantText.startsWith(hydratedAssistantText) ||
          hydratedAssistantText.startsWith(localAssistantText);
        if (assistantResponseMatches) {
          return true;
        }
      }

      const localHasPrompt = localPrompt.length > 0;
      const hydratedHasPrompt = hydratedPrompt.length > 0;
      const localHasTimeline = localTimelineCount > 0;
      const hydratedHasTimeline = hydratedTimelineCount > 0;
      const promptAndTimelineComplement =
        (localHasPrompt && !localHasTimeline && hydratedHasTimeline) ||
        (hydratedHasPrompt && !hydratedHasTimeline && localHasTimeline) ||
        (localHasPrompt && hydratedHasTimeline) ||
        (hydratedHasPrompt && localHasTimeline);
      if (promptAndTimelineComplement) {
        return true;
      }
    }
  }

  if (!localPrompt && !hydratedPrompt) {
    const localHasTimeline = localTimelineCount > 0;
    const hydratedHasTimeline = hydratedTimelineCount > 0;
    const localHasResponse = localAssistantText.length > 0;
    const hydratedHasResponse = hydratedAssistantText.length > 0;
    const oneSideIsTimelineHeavy =
      (localHasTimeline && !hydratedHasTimeline && hydratedHasResponse) ||
      (hydratedHasTimeline && !localHasTimeline && localHasResponse);

    if (oneSideIsTimelineHeavy) {
      const startedAtDeltaMs = Math.abs((localTurn.startedAtMs || 0) - (hydratedTurn.startedAtMs || 0));
      if (startedAtDeltaMs <= 60_000) {
        return true;
      }
    }
  }

  return false;
}

function isTerminalTurnStatus(status: RunnerTurnStatus): boolean {
  return status === "completed" || status === "failed" || status === "cancelled";
}

function isRunningTurnStatus(status: RunnerTurnStatus): boolean {
  return status === "running";
}

function isActiveTurnStatus(status: RunnerTurnStatus): boolean {
  return status === "running" || status === "permission_asked";
}

function getTurnLatestProgressTimestampMs(turn: RunnerTurn): number {
  let latestTimestampMs = turn.completedAtMs ?? turn.startedAtMs;

  for (const log of turn.logs) {
    const createdAtMs = parseIsoTimestampMs(log.createdAt);
    if (createdAtMs !== null) {
      latestTimestampMs = Math.max(latestTimestampMs, createdAtMs);
      continue;
    }

    const absoluteTimestampMs = parseIsoTimestampMs(log.time);
    if (absoluteTimestampMs !== null) {
      latestTimestampMs = Math.max(latestTimestampMs, absoluteTimestampMs);
      continue;
    }

    const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
    if (relativeSeconds !== null) {
      latestTimestampMs = Math.max(latestTimestampMs, turn.startedAtMs + relativeSeconds * 1000);
    }
  }

  return latestTimestampMs;
}

function turnHasVisibleExecutionProgress(turn: RunnerTurn): boolean {
  if (turn.logs.length > 0) {
    return true;
  }
  return getTurnAssistantMessageText(turn).trim().length > 0;
}

function shouldPreserveLocalTurnProgress(localTurn: RunnerTurn, hydratedTurn: RunnerTurn): boolean {
  const localAssistantText = getTurnAssistantMessageText(localTurn);
  const hydratedAssistantText = getTurnAssistantMessageText(hydratedTurn);
  if (
    localAssistantText.trim().length > 0 &&
    !isFallbackAssistantResponseText(localAssistantText) &&
    isFallbackAssistantResponseText(hydratedAssistantText)
  ) {
    return true;
  }

  const localIsTerminal = isTerminalTurnStatus(localTurn.status);
  const hydratedIsTerminal = isTerminalTurnStatus(hydratedTurn.status);
  if (localIsTerminal !== hydratedIsTerminal) {
    if (!localIsTerminal) {
      return false;
    }

    const localHasProgress = turnHasVisibleExecutionProgress(localTurn);
    const hydratedHasProgress = turnHasVisibleExecutionProgress(hydratedTurn);

    if (!localHasProgress) {
      return false;
    }

    if (hydratedHasProgress) {
      return false;
    }

    return true;
  }

  if (localTurn.logs.length !== hydratedTurn.logs.length) {
    return localTurn.logs.length > hydratedTurn.logs.length;
  }

  const localAssistantTextLength = localAssistantText.length;
  const hydratedAssistantTextLength = hydratedAssistantText.length;
  if (localAssistantTextLength !== hydratedAssistantTextLength) {
    return localAssistantTextLength > hydratedAssistantTextLength;
  }

  const localLastLogMessageLength = String(localTurn.logs[localTurn.logs.length - 1]?.message || "").length;
  const hydratedLastLogMessageLength = String(hydratedTurn.logs[hydratedTurn.logs.length - 1]?.message || "").length;
  if (localLastLogMessageLength !== hydratedLastLogMessageLength) {
    return localLastLogMessageLength > hydratedLastLogMessageLength;
  }

  const localLatestProgressTimestampMs = getTurnLatestProgressTimestampMs(localTurn);
  const hydratedLatestProgressTimestampMs = getTurnLatestProgressTimestampMs(hydratedTurn);
  if (localLatestProgressTimestampMs !== hydratedLatestProgressTimestampMs) {
    return localLatestProgressTimestampMs > hydratedLatestProgressTimestampMs;
  }

  return false;
}

function isTurnResponseLog(log: RunnerLog): boolean {
  return log.eventType === "agent_message" || log.eventType === "llm_response";
}

function isFallbackAssistantResponseText(value: string): boolean {
  const normalized = String(value || "").replace(/\s+/g, " ").trim().toLowerCase();
  return normalized === "[task executed - no detailed response captured]";
}

function replaceTurnResponseLogs(logs: RunnerLog[], nextResponseLogs: RunnerLog[]): RunnerLog[] {
  if (nextResponseLogs.length === 0) {
    return logs;
  }

  const nextLogs: RunnerLog[] = [];
  let insertedResponseLogs = false;

  for (const log of logs) {
    if (isTurnResponseLog(log)) {
      if (!insertedResponseLogs) {
        nextLogs.push(...nextResponseLogs);
        insertedResponseLogs = true;
      }
      continue;
    }
    nextLogs.push(log);
  }

  if (!insertedResponseLogs) {
    nextLogs.push(...nextResponseLogs);
  }

  return nextLogs;
}

function getHydratedTimelineLogTimestampMs(log: RunnerLog, threadStartedAtMs?: number | null): number | null {
  const absoluteTimestampMs = getRunnerLogAbsoluteTimestampMs(log);
  if (absoluteTimestampMs !== null) {
    return absoluteTimestampMs;
  }
  const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
  if (relativeSeconds !== null && threadStartedAtMs != null) {
    return threadStartedAtMs + relativeSeconds * 1000;
  }
  return null;
}

function insertHydratedTimelineLogs(
  turn: RunnerTurn,
  logs: RunnerLog[],
  meta?: { threadStartedAtMs?: number | null }
): RunnerTurn {
  if (logs.length === 0) {
    return turn;
  }

  const visibleLogs: RunnerLog[] = [];
  let status = turn.status;
  let completedAtMs = turn.completedAtMs;
  let durationSeconds = turn.durationSeconds ?? null;

  for (const log of logs) {
    if (log.eventType === "turn_completed") {
      const durationMs = typeof log.metadata?.durationMs === "number" ? log.metadata.durationMs : null;
      if (durationMs !== null && durationMs >= 0) {
        durationSeconds = Math.max(0, Math.round(durationMs / 1000));
        completedAtMs = turn.startedAtMs + durationMs;
      }
      if (log.type === "error") {
        status = "failed";
      } else if (isActiveTurnStatus(status)) {
        status = "completed";
      }
      continue;
    }

    visibleLogs.push(log);

    if (log.eventType === "permission_request") {
      const permissionStatus = String(log.metadata?.status || log.metadata?.decision || "").trim().toLowerCase();
      if (!permissionStatus || permissionStatus === "pending") {
        status = "permission_asked";
        completedAtMs = undefined;
      } else if (status === "permission_asked") {
        status = "running";
      }
      continue;
    }

    if (log.type === "error") {
      status = "failed";
    }
  }

  const latestVisibleLogTimestampMs = visibleLogs.reduce<number | null>((latestTimestampMs, log) => {
    const timestampMs = getRunnerLogTimestampMs(log, meta?.threadStartedAtMs ?? turn.startedAtMs);
    if (timestampMs === null) {
      return latestTimestampMs;
    }
    return latestTimestampMs === null ? timestampMs : Math.max(latestTimestampMs, timestampMs);
  }, null);

  if (
    !isActiveTurnStatus(status) &&
    latestVisibleLogTimestampMs !== null &&
    (completedAtMs == null || completedAtMs <= turn.startedAtMs || latestVisibleLogTimestampMs > completedAtMs)
  ) {
    completedAtMs = latestVisibleLogTimestampMs;
  }

  if (
    (durationSeconds == null || durationSeconds <= 0) &&
    completedAtMs != null &&
    Number.isFinite(turn.startedAtMs) &&
    completedAtMs >= turn.startedAtMs
  ) {
    durationSeconds = Math.max(0, Math.round((completedAtMs - turn.startedAtMs) / 1000));
  }

  const responseIndex = turn.logs.findIndex(isTurnResponseLog);
  const nextLogs =
    responseIndex === -1
      ? [...turn.logs, ...visibleLogs]
      : [
          ...turn.logs.slice(0, responseIndex),
          ...visibleLogs,
          ...turn.logs.slice(responseIndex),
        ];

  return {
    ...turn,
    logs: dedupeAdjacentRunnerLogs(nextLogs),
    status,
    completedAtMs,
    durationSeconds,
  };
}

function mergeHydratedTimelineLogsIntoMessageTurns(
  turns: RunnerTurn[],
  logs: RunnerLog[],
  meta?: {
    startedAtMs?: number | null;
  }
): RunnerTurn[] | null {
  if (turns.length === 0 || logs.length === 0) {
    return turns;
  }

  const timelineLogs = dedupeAdjacentRunnerLogs(
    sortRunnerLogsChronologically(logs.map(normalizeHydratedLog))
  ).filter((log) => {
    if (log.eventType === "user_message" || (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage) {
      return false;
    }
    return !isTurnResponseLog(log);
  });
  if (timelineLogs.length === 0) {
    return turns;
  }

  const assignableTurns = turns
    .map((turn, index) => ({ turn, index }))
    .filter(({ turn }) => turnPresentation(turn) !== "context-action-notice" && turn.prompt.trim().length > 0);

  if (assignableTurns.length === 0) {
    return null;
  }

  const logBuckets = new Map<number, RunnerLog[]>();
  const canAssignByTimestamp =
    assignableTurns.every(({ turn }) => Number.isFinite(turn.startedAtMs)) &&
    timelineLogs.every((log) => getHydratedTimelineLogTimestampMs(log, meta?.startedAtMs) !== null);

  if (!canAssignByTimestamp && assignableTurns.length > 1) {
    return null;
  }

  for (const log of timelineLogs) {
    let targetTurnIndex = assignableTurns[0]!.index;

    if (canAssignByTimestamp) {
      const logTimestampMs = getHydratedTimelineLogTimestampMs(log, meta?.startedAtMs) ?? 0;
      for (const { turn, index } of assignableTurns) {
        if (turn.startedAtMs <= logTimestampMs + 1000) {
          targetTurnIndex = index;
        } else {
          break;
        }
      }
    }

    const bucket = logBuckets.get(targetTurnIndex) || [];
    bucket.push(log);
    logBuckets.set(targetTurnIndex, bucket);
  }

  return turns.map((turn, index) => insertHydratedTimelineLogs(turn, logBuckets.get(index) || [], {
    threadStartedAtMs: meta?.startedAtMs ?? null,
  }));
}

function mergeHydratedMessageTurnsIntoTurns(
  turns: RunnerTurn[],
  messages: RunnerConversationMessage[],
  meta?: {
    agentName?: string | null;
    environmentName?: string | null;
    backendUrl?: string;
    threadStatus?: string | null;
    completedAtMs?: number | null;
  }
): RunnerTurn[] {
  if (turns.length === 0 || messages.length === 0) {
    return turns;
  }

  const messageTurns = buildHydratedTurnsFromMessages(messages, meta);
  if (messageTurns.length === 0) {
    return turns;
  }

  const consumedMessageTurnIndexes = new Set<number>();
  const mergedTurns = turns.map((turn) => {
    const matchedMessageTurnIndex = messageTurns.findIndex(
      (messageTurn, index) => !consumedMessageTurnIndexes.has(index) && turnsLikelyMatch(turn, messageTurn)
    );

    if (matchedMessageTurnIndex === -1) {
      return turn;
    }

    consumedMessageTurnIndexes.add(matchedMessageTurnIndex);
    const messageTurn = messageTurns[matchedMessageTurnIndex]!;
    const messageResponseLogs = messageTurn.logs.filter(isTurnResponseLog);
    const turnResponseText = getTurnAssistantMessageText(turn);
    const messageResponseText = getTurnAssistantMessageText(messageTurn);
    const messageResponseIsFallback = isFallbackAssistantResponseText(messageResponseText);
    const turnResponseIsFallback = isFallbackAssistantResponseText(turnResponseText);
    const shouldPreferMessageResponse =
      messageResponseLogs.length > 0 &&
      !messageResponseIsFallback &&
      (!turnResponseText ||
        turnResponseIsFallback ||
        messageResponseText === turnResponseText ||
        messageResponseText.startsWith(turnResponseText) ||
        messageResponseText.length > turnResponseText.length);

    return {
      ...turn,
      prompt: turn.prompt || messageTurn.prompt,
      sourceMessageId: turn.sourceMessageId ?? messageTurn.sourceMessageId ?? null,
      quotedSelection: turn.quotedSelection ?? messageTurn.quotedSelection ?? null,
      attachments: pickTurnAttachments(turn.attachments, messageTurn.attachments),
      logs: shouldPreferMessageResponse ? replaceTurnResponseLogs(turn.logs, messageResponseLogs) : turn.logs,
      completedAtMs: turn.completedAtMs ?? messageTurn.completedAtMs,
      durationSeconds: turn.durationSeconds ?? messageTurn.durationSeconds ?? null,
      agentName: turn.agentName ?? messageTurn.agentName ?? null,
      environmentName: turn.environmentName ?? messageTurn.environmentName ?? null,
    };
  });

  const unmatchedMessageTurns = messageTurns.filter((_, index) => !consumedMessageTurnIndexes.has(index));
  if (unmatchedMessageTurns.length === 0) {
    return mergedTurns;
  }

  const sortedTurns = [...mergedTurns, ...unmatchedMessageTurns].sort((left, right) => {
    const leftTime = left.startedAtMs || 0;
    const rightTime = right.startedAtMs || 0;
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    return left.id.localeCompare(right.id);
  });

  return sortedTurns.map((turn, index) => ({
    ...turn,
    isInitialTurn: index === 0,
  }));
}

function mergeHydratedTurns(existingTurns: RunnerTurn[], hydratedTurns: RunnerTurn[]): RunnerTurn[] {
  const mergedTurns = [...hydratedTurns];

  for (const localTurn of existingTurns) {
    const localPresentation = turnPresentation(localTurn);
    const shouldCarryForwardIfUnmatched =
      localTurn.status === "queued" ||
      !isTerminalTurnStatus(localTurn.status) ||
      localPresentation === "btw" ||
      Boolean(localTurn.quotedSelection) ||
      Boolean(localTurn.attachments?.length);

    const hydratedIndex = mergedTurns.findIndex((hydratedTurn) => turnsLikelyMatch(localTurn, hydratedTurn));
    if (hydratedIndex === -1) {
      if (shouldCarryForwardIfUnmatched) {
        mergedTurns.push(localTurn);
      }
      continue;
    }

    const hydratedTurn = mergedTurns[hydratedIndex];
    const preferLocalTurn = shouldPreserveLocalTurnProgress(localTurn, hydratedTurn);

    if (preferLocalTurn) {
      mergedTurns[hydratedIndex] = {
        ...hydratedTurn,
        ...localTurn,
        presentation: localPresentation,
        quotedSelection: localTurn.quotedSelection ?? hydratedTurn.quotedSelection ?? null,
        attachments: pickTurnAttachments(localTurn.attachments, hydratedTurn.attachments),
        sourceMessageId: localTurn.sourceMessageId ?? hydratedTurn.sourceMessageId ?? null,
      };
      continue;
    }

    mergedTurns[hydratedIndex] = {
      ...hydratedTurn,
      ...(!hydratedTurn.presentation && localPresentation !== "default" ? { presentation: localPresentation } : {}),
      quotedSelection: hydratedTurn.quotedSelection ?? localTurn.quotedSelection ?? null,
      attachments: pickTurnAttachments(hydratedTurn.attachments, localTurn.attachments),
      sourceMessageId: hydratedTurn.sourceMessageId ?? localTurn.sourceMessageId ?? null,
    };
  }

  const sortedTurns = [...mergedTurns].sort((left, right) => {
    const leftTime = left.startedAtMs || 0;
    const rightTime = right.startedAtMs || 0;
    if (leftTime !== rightTime) {
      return leftTime - rightTime;
    }
    return left.id.localeCompare(right.id);
  });

  return sortedTurns.map((turn, index) => ({
    ...turn,
    isInitialTurn: index === 0,
  }));
}

function mapExpandedTurns(
  previousExpandedTurns: Record<string, boolean>,
  previousTurns: RunnerTurn[],
  nextTurns: RunnerTurn[],
  options?: { defaultLatestExpanded?: boolean; collapseOnNewRunSummary?: boolean }
): Record<string, boolean> {
  if (options?.collapseOnNewRunSummary && hasNewTurnRunSummary(previousTurns, nextTurns)) {
    return nextTurns.reduce<Record<string, boolean>>((accumulator, turn) => {
      accumulator[turn.id] = false;
      return accumulator;
    }, {});
  }

  const latestTurnId = nextTurns.length > 0 ? nextTurns[nextTurns.length - 1]!.id : null;
  return nextTurns.reduce<Record<string, boolean>>((accumulator, turn) => {
    const directExpanded = previousExpandedTurns[turn.id];
    if (typeof directExpanded === "boolean") {
      accumulator[turn.id] = directExpanded;
      return accumulator;
    }

    const matchedPreviousTurn = previousTurns.find((previousTurn) => turnsLikelyMatch(previousTurn, turn));
    if (matchedPreviousTurn && typeof previousExpandedTurns[matchedPreviousTurn.id] === "boolean") {
      accumulator[turn.id] = previousExpandedTurns[matchedPreviousTurn.id]!;
      return accumulator;
    }

    if (options?.defaultLatestExpanded && latestTurnId === turn.id) {
      accumulator[turn.id] = true;
    }
    return accumulator;
  }, {});
}

function getTurnRunSummarySignature(turn: RunnerTurn | null | undefined): string {
  const responseLog = turn?.logs
    ? [...turn.logs].reverse().find(isTurnResponseLog)
    : null;
  const normalizedMessage = normalizeDuplicateSummaryText(responseLog?.message || "");
  if (!normalizedMessage) {
    return "";
  }
  return [
    responseLog?.eventType || "",
    responseLog?.time || "",
    normalizedMessage.length,
    normalizedMessage.slice(0, 160),
  ].join(":");
}

function findMatchingPreviousTurn(previousTurns: RunnerTurn[], nextTurn: RunnerTurn): RunnerTurn | null {
  return previousTurns.find((previousTurn) => previousTurn.id === nextTurn.id)
    || previousTurns.find((previousTurn) => turnsLikelyMatch(previousTurn, nextTurn))
    || null;
}

function hasNewTurnRunSummary(previousTurns: RunnerTurn[], nextTurns: RunnerTurn[]): boolean {
  return nextTurns.some((nextTurn) => {
    const nextSignature = getTurnRunSummarySignature(nextTurn);
    if (!nextSignature) {
      return false;
    }
    const previousTurn = findMatchingPreviousTurn(previousTurns, nextTurn);
    return getTurnRunSummarySignature(previousTurn) !== nextSignature;
  });
}

function parseDurationSecondsValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.trim());
    if (Number.isFinite(parsed)) {
      return Math.max(0, Math.round(parsed));
    }
  }
  return null;
}

function parseIsoTimestampMs(value: unknown): number | null {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveHydrationInitialPrompt(
  turns: RunnerTurn[],
  cachedPayload?: RunnerThreadHydrationPayload | null
): string {
  const cachedPrompt = typeof cachedPayload?.initialPrompt === "string" ? cachedPayload.initialPrompt.trim() : "";
  if (cachedPrompt) {
    return cachedPrompt;
  }

  const firstPromptTurn = turns.find((turn) => {
    const normalizedPrompt = String(turn.prompt || "").trim();
    if (!normalizedPrompt) {
      return false;
    }
    return turnPresentation(turn) !== "context-action-notice";
  });

  return typeof firstPromptTurn?.prompt === "string" ? firstPromptTurn.prompt.trim() : "";
}

async function fetchThreadLiveRefreshPayload(params: {
  backendUrl: string;
  apiKey: string;
  threadId: string;
  requestHeaders?: HeadersInit;
  statusSnapshot: {
    status: string | null;
    updatedAt: string | null;
    completedAt: string | null;
  };
  existingTurns: RunnerTurn[];
  cachedPayload?: RunnerThreadHydrationPayload | null;
}): Promise<RunnerThreadHydrationPayload> {
  const logsSnapshot = await fetchThreadLogsSnapshot({
    backendUrl: params.backendUrl,
    apiKey: params.apiKey,
    threadId: params.threadId,
    requestHeaders: params.requestHeaders,
  });

  const cachedPayload = params.cachedPayload || null;
  const conversationMessages = sortRunnerConversationMessagesChronologically(
    Array.isArray(cachedPayload?.messages) && cachedPayload.messages.length > 0
      ? cachedPayload.messages
      : await fetchAllThreadMessages({
          backendUrl: params.backendUrl,
          apiKey: params.apiKey,
          threadId: params.threadId,
          requestHeaders: params.requestHeaders,
        }).catch(() => [])
  );
  const canonicalConversationMessages = conversationMessages.filter(
    (message) =>
      (message.role === "user" || message.role === "assistant") &&
      typeof message.content === "string" &&
      message.content.trim().length > 0
  );
  const hydrationLogs = sortRunnerLogsChronologically(logsSnapshot.logs.map(normalizeHydratedLog)).filter((log) => {
    if (canonicalConversationMessages.length === 0) {
      return log.eventType !== "user_message" && log.eventType !== "agent_message" && log.eventType !== "llm_response";
    }
    if (log.eventType === "user_message" || (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage) {
      return false;
    }
    if (log.eventType === "agent_message" || log.eventType === "llm_response") {
      return false;
    }
    return true;
  });

  const completedAtMs = parseIsoTimestampMs(params.statusSnapshot.completedAt) ?? cachedPayload?.completedAtMs ?? null;
  const rawThreadStatus = logsSnapshot.status ?? params.statusSnapshot.status ?? cachedPayload?.threadStatus ?? null;

  return {
    threadId: params.threadId,
    threadStatus: resolveHydratedThreadLifecycleStatus(rawThreadStatus, completedAtMs),
    threadUpdatedAt: params.statusSnapshot.updatedAt ?? cachedPayload?.threadUpdatedAt ?? null,
    threadEnvironmentId: cachedPayload?.threadEnvironmentId ?? null,
    threadEnvironmentName:
      logsSnapshot.environmentName
      ?? cachedPayload?.threadEnvironmentName
      ?? cachedPayload?.environmentName
      ?? null,
    initialPrompt: resolveHydrationInitialPrompt(params.existingTurns, cachedPayload),
    logs: hydrationLogs,
    messages: conversationMessages,
    durationSeconds: logsSnapshot.durationSeconds ?? cachedPayload?.durationSeconds ?? null,
    startedAtMs: cachedPayload?.startedAtMs ?? null,
    completedAtMs,
    agentName: logsSnapshot.agentName ?? cachedPayload?.agentName ?? null,
    environmentName:
      logsSnapshot.environmentName
      ?? cachedPayload?.environmentName
      ?? cachedPayload?.threadEnvironmentName
      ?? null,
  };
}

function isGenericShellRunnerCommand(command: string): boolean {
  const normalized = String(command || "").trim().replace(/^\$\s*/, "").toLowerCase();
  return normalized === "bash" || normalized === "sh" || normalized === "zsh" || normalized === "/bin/bash" || normalized === "/bin/sh";
}

function sanitizeImageGenerationPromptCandidate(value: unknown): string {
  let normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  normalized = normalized.replace(/\\n/g, "\n");
  const markerMatch = normalized.match(/\r?\n\s*(?:quality|generated with|openai size request|image saved to|size):/i);
  if (markerMatch) {
    normalized = normalized.slice(0, markerMatch.index).trim();
  }
  normalized = normalized.split(/\r?\n/)[0]?.trim() || "";
  normalized = normalized.replace(/^["'`]+|["'`,\s]+$/g, "").trim();
  return normalized;
}

function extractImageGenerationPromptFromCommand(command?: string): string {
  const normalized = String(command || "").trim();
  if (!normalized) {
    return "";
  }

  const directPromptMatch = normalized.match(/generate-image\.py\s+(?:"([^"]+)"|'([^']+)')/);
  const directPrompt = sanitizeImageGenerationPromptCandidate(directPromptMatch?.[1] || directPromptMatch?.[2] || "");
  if (directPrompt) {
    return directPrompt;
  }

  const quotedValues = [...normalized.matchAll(/"([^"]+)"/g), ...normalized.matchAll(/'([^']+)'/g)]
    .map((match) => sanitizeImageGenerationPromptCandidate(match[1]))
    .filter(
      (value) =>
        value.length >= 3 &&
        !value.match(/\.(png|jpg|jpeg|gif|webp|py|sh|txt|md)$/i) &&
        !value.startsWith("/") &&
        !value.startsWith(".") &&
        !value.startsWith("-") &&
        !value.match(/^\d+:\d+$/) &&
        !value.match(/^(1K|2K|4K)$/i)
    );
  return quotedValues.length > 0
    ? quotedValues.reduce((longest, current) => (current.length > longest.length ? current : longest))
    : "";
}

function extractImageGenerationPromptIdentity(log: RunnerLog): string {
  const commandPrompt = extractImageGenerationPromptFromCommand(
    typeof log.metadata?.command === "string" ? log.metadata.command : log.message
  );
  if (commandPrompt) {
    return commandPrompt;
  }

  const metadataPrompt =
    log.metadata?.args && typeof log.metadata.args === "object" && typeof (log.metadata.args as Record<string, unknown>).prompt === "string"
      ? sanitizeImageGenerationPromptCandidate((log.metadata.args as Record<string, unknown>).prompt)
      : "";
  if (metadataPrompt) {
    return metadataPrompt;
  }
  const metadataText =
    log.metadata?.args && typeof log.metadata.args === "object" && typeof (log.metadata.args as Record<string, unknown>).text === "string"
      ? sanitizeImageGenerationPromptCandidate((log.metadata.args as Record<string, unknown>).text)
      : "";
  if (metadataText) {
    return metadataText;
  }
  const toolInputPrompt =
    log.metadata?.toolInput && typeof log.metadata.toolInput === "object" && typeof (log.metadata.toolInput as Record<string, unknown>).prompt === "string"
      ? sanitizeImageGenerationPromptCandidate((log.metadata.toolInput as Record<string, unknown>).prompt)
      : "";
  if (toolInputPrompt) {
    return toolInputPrompt;
  }
  const toolInputText =
    log.metadata?.toolInput && typeof log.metadata.toolInput === "object" && typeof (log.metadata.toolInput as Record<string, unknown>).text === "string"
      ? sanitizeImageGenerationPromptCandidate((log.metadata.toolInput as Record<string, unknown>).text)
      : "";
  if (toolInputText) {
    return toolInputText;
  }

  const output = typeof log.metadata?.output === "string" ? log.metadata.output : log.message;
  const promptMatch = String(output || "").match(/(?:Generating|Editing) image with [^:]+:\s*(.+?)(?:\.\.\.)?(?:\r?\n|$)/i);
  return sanitizeImageGenerationPromptCandidate(promptMatch?.[1] || "");
}

function normalizedImageGenerationLogIdentity(log: RunnerLog): string | null {
  const command = typeof log.metadata?.command === "string" ? log.metadata.command.trim() : "";
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const savedImagePath = typeof log.metadata?.savedImagePath === "string" ? log.metadata.savedImagePath.trim() : "";
  const metadataFilePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  const looksLikeImageGeneration =
    log.metadata?.isImageGeneration
    || Boolean(savedImagePath)
    || metadataFilePaths.some((filePath) => /\.(?:png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(filePath))
    || /(?:Generating|Editing) image with|Generated with|Image saved to:/i.test(output)
    || /(?:Generating|Editing) image with|Generated with|Image saved to:/i.test(log.message || "")
    || command.includes("generate-image.py")
    || command.includes(".claude/skills/image-generation/");
  if (!looksLikeImageGeneration) {
    return null;
  }

  const prompt = extractImageGenerationPromptIdentity(log);
  const inputPath =
    log.metadata?.args && typeof log.metadata.args === "object" && typeof (log.metadata.args as Record<string, unknown>).inputPath === "string"
      ? String((log.metadata.args as Record<string, unknown>).inputPath).trim()
      : "";

  return stableRunnerLogValue({
    kind: "image_generation",
    prompt,
    inputPath,
    command: prompt || inputPath || savedImagePath || metadataFilePaths.length > 0 ? "" : command || String(log.message || "").trim(),
  });
}

function normalizeHydratedLog(log: RunnerLog): RunnerLog {
  const rawLog = log as RunnerLog & Record<string, unknown>;
  const rawMetadata =
    log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata)
      ? log.metadata
      : rawLog.metadata && typeof rawLog.metadata === "object" && !Array.isArray(rawLog.metadata)
        ? rawLog.metadata as RunnerLog["metadata"]
        : undefined;
  const metadata =
    rawMetadata && typeof (rawMetadata as { duration_ms?: unknown }).duration_ms === "number" && typeof rawMetadata.durationMs !== "number"
      ? {
          ...rawMetadata,
          durationMs: (rawMetadata as { duration_ms: number }).duration_ms,
        }
      : rawMetadata;
  const eventType = typeof log.eventType === "string"
    ? log.eventType
    : typeof rawLog.event_type === "string"
      ? rawLog.event_type as RunnerLog["eventType"]
      : undefined;
  const createdAt = typeof log.createdAt === "string" && log.createdAt.trim()
    ? log.createdAt
    : typeof rawLog.created_at === "string" && rawLog.created_at.trim()
      ? rawLog.created_at
      : typeof rawLog.timestamp === "string" && rawLog.timestamp.trim()
        ? rawLog.timestamp
        : undefined;
  const normalizedLog: RunnerLog = {
    ...log,
    ...(createdAt ? { createdAt } : {}),
    ...(eventType ? { eventType } : {}),
    ...(metadata ? { metadata } : {}),
  };
  if (typeof rawLog.is_reasoning === "boolean" && typeof normalizedLog.isReasoning !== "boolean") {
    normalizedLog.isReasoning = rawLog.is_reasoning;
  }
  if (typeof rawLog.is_planning === "boolean" && typeof normalizedLog.isPlanning !== "boolean") {
    normalizedLog.isPlanning = rawLog.is_planning;
  }
  if (typeof rawLog.is_llm_response === "boolean" && typeof normalizedLog.isLLMResponse !== "boolean") {
    normalizedLog.isLLMResponse = rawLog.is_llm_response;
  }
  return normalizedLog;
}

function stableRunnerLogValue(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableRunnerLogValue(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${key}:${stableRunnerLogValue((value as Record<string, unknown>)[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function normalizedToolLogIdentity(log: RunnerLog): string | null {
  const normalizedImageIdentity = normalizedImageGenerationLogIdentity(log);
  if (normalizedImageIdentity) {
    return normalizedImageIdentity;
  }

  if (log.eventType === "command_execution") {
    const command = typeof log.metadata?.command === "string" ? log.metadata.command.trim() : "";
    const normalizedCommand = command || log.message.replace(/^Executed:\s*/i, "").trim();
    if (!normalizedCommand) {
      return null;
    }
    if (isGenericShellRunnerCommand(normalizedCommand)) {
      const shellSignature = stableRunnerLogValue({
        output: typeof log.metadata?.output === "string" ? log.metadata.output.trim() : "",
        filePaths: Array.isArray(log.metadata?.filePaths) ? log.metadata.filePaths : [],
        changeKinds: Array.isArray(log.metadata?.changeKinds) ? log.metadata.changeKinds : [],
        toolInput: log.metadata?.toolInput,
      });
      return `command:${normalizedCommand}:${shellSignature}`;
    }
    return `command:${normalizedCommand}`;
  }

  if (log.eventType === "file_change") {
    const filePath = Array.isArray(log.metadata?.filePaths) && typeof log.metadata.filePaths[0] === "string"
      ? log.metadata.filePaths[0].trim()
      : "";
    const changeKind = Array.isArray(log.metadata?.changeKinds) && typeof log.metadata.changeKinds[0] === "string"
      ? log.metadata.changeKinds[0].trim().toLowerCase()
      : "";
    const normalizedPath = filePath || log.message.replace(/^(created|modified|update|updated|deleted):\s*/i, "").replace(/\s+\((update|created|modified|deleted)\)$/i, "").trim();
    const normalizedKind = changeKind || (/^\s*(created|modified|update|updated|deleted):/i.exec(log.message)?.[1]?.toLowerCase() ?? /\((update|created|modified|deleted)\)\s*$/i.exec(log.message)?.[1]?.toLowerCase() ?? "");
    if (!normalizedPath) {
      return null;
    }
    const canonicalKind = normalizedKind === "updated" ? "update" : normalizedKind;
    return `file:${canonicalKind}:${normalizedPath}`;
  }

  return null;
}

function runnerLogSignature(log: RunnerLog): string {
  const normalizedEventType =
    log.eventType === "setup" || log.eventType === "startup"
      ? "session_start"
      : log.eventType === "reasoning" || log.eventType === "planning" || log.isReasoning || log.isPlanning
        ? "thinking"
        : log.eventType || "";
  const normalizedMessage = normalizedEventType === "session_start" ? "Starting session" : log.message || "";
  const normalizedToolIdentity = normalizedToolLogIdentity(log);
  const normalizedMetadata =
    normalizedEventType === "thinking" || normalizedEventType === "session_start" || normalizedToolIdentity
      ? {}
      : log.metadata || {};
  return [
    normalizedToolIdentity ? "" : log.type || "",
    normalizedEventType,
    normalizedToolIdentity || stripSystemTags(normalizedMessage).replace(/\s+/g, " ").trim(),
    stableRunnerLogValue(normalizedMetadata),
  ].join("|");
}

function runnerLogMetadataWeight(log: RunnerLog): number {
  if (!log.metadata || typeof log.metadata !== "object" || Array.isArray(log.metadata)) {
    return 0;
  }
  return Object.keys(log.metadata).length;
}

function runnerLogReplacementScore(log: RunnerLog): number {
  let score = runnerLogMetadataWeight(log);
  const imageIdentity = normalizedImageGenerationLogIdentity(log);
  if (imageIdentity) {
    const savedImagePath = typeof log.metadata?.savedImagePath === "string" ? log.metadata.savedImagePath.trim() : "";
    const filePaths = Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter((value): value is string => typeof value === "string" && value.trim().length > 0)
      : [];
    if (savedImagePath || filePaths.length > 0) {
      score += 100;
    }
    if (log.metadata?.status === "completed") {
      score += 10;
    }
    if (typeof log.metadata?.output === "string" && /Image saved to:/i.test(log.metadata.output)) {
      score += 20;
    }
    if (log.metadata?.error) {
      score += 30;
    }
  }
  return score;
}

function pruneSupersededImageGenerationLogs(logs: RunnerLog[]): RunnerLog[] {
  const bestScoreByIdentity = new Map<string, number>();
  const keptFromEnd: RunnerLog[] = [];

  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const log = logs[index];
    const identity = normalizedImageGenerationLogIdentity(log);
    if (!identity) {
      keptFromEnd.push(log);
      continue;
    }

    const score = runnerLogReplacementScore(log);
    const bestSeenScore = bestScoreByIdentity.get(identity);
    if (typeof bestSeenScore === "number" && bestSeenScore > score) {
      continue;
    }

    bestScoreByIdentity.set(identity, score);
    keptFromEnd.push(log);
  }

  return keptFromEnd.reverse();
}

function dedupeAdjacentRunnerLogs(logs: RunnerLog[]): RunnerLog[] {
  const prunedLogs = pruneSupersededImageGenerationLogs(logs);
  const deduped: RunnerLog[] = [];
  let lastSignature = "";

  for (const log of prunedLogs) {
    if (log.eventType === "deep_research") {
      deduped.push(log);
      lastSignature = "";
      continue;
    }
    const signature = runnerLogSignature(log);
    if (signature === lastSignature) {
      const previousLog = deduped[deduped.length - 1];
      if (previousLog && runnerLogReplacementScore(log) >= runnerLogReplacementScore(previousLog)) {
        deduped[deduped.length - 1] = log;
      }
      continue;
    }
    deduped.push(log);
    lastSignature = signature;
  }

  return deduped;
}

function isSyntheticProgressReasoningLog(log: RunnerLog): boolean {
  if (log.eventType !== "reasoning" && log.eventType !== "planning" && !log.isReasoning && !log.isPlanning) {
    return false;
  }

  const metadata = log.metadata as Record<string, unknown> | null | undefined;
  const source = typeof metadata?.source === "string" ? metadata.source.trim().toLowerCase() : "";
  return metadata?.synthetic === true
    || (typeof metadata?.synthetic === "string" && metadata.synthetic.trim().toLowerCase() === "true")
    || source === "synthetic_progress";
}

function isInternalUserMessageToolLog(log: RunnerLog): boolean {
  if (log.eventType !== "command_execution") {
    return false;
  }

  const metadata = log.metadata as Record<string, unknown> | null | undefined;
  const candidates = [
    metadata?.command,
    metadata?.toolName,
    metadata?.tool_name,
    metadata?.name,
    log.message,
  ];

  return candidates.some((candidate) => {
    if (typeof candidate !== "string") {
      return false;
    }
    const normalized = stripSystemTags(candidate)
      .replace(/^\$\s*/, "")
      .trim()
      .toLowerCase();
    return normalized === "sendusermessage" || normalized === "send_user_message" || normalized === "send-user-message";
  });
}

function isTrivialSkillLaunchLog(log: RunnerLog): boolean {
  if (log.eventType !== "command_execution") {
    return false;
  }

  const command = stripSystemTags(String(log.metadata?.command || log.message || ""))
    .replace(/^Executed:\s*/i, "")
    .replace(/^\$\s*/, "")
    .trim();
  const output = stripSystemTags(String(log.metadata?.output || ""))
    .replace(/\r\n/g, "\n")
    .trim();

  return /^Using Skill$/i.test(command) && /^Launching skill:\s*[\w.-]+$/i.test(output);
}

function shouldDisplayTimelineLog(log: RunnerLog): boolean {
  const normalizedMessage = stripSystemTags(log.message || "").replace(/\s+/g, " ").trim().toLowerCase();
  if (log.eventType === "turn_completed") return false;
  if (log.eventType === "action_summary") return false;
  if (log.eventType === "agent_message" || log.eventType === "llm_response") return false;
  if (log.eventType === "setup" || log.eventType === "startup") return false;
  if (isInternalFileChangeLog(log)) return false;
  if (isSyntheticProgressReasoningLog(log)) return false;
  if (isInternalUserMessageToolLog(log)) return false;
  if (isTrivialSkillLaunchLog(log)) return false;
  if (log.eventType === "command_execution" && isBrowserSkillLaunchCommand(log.metadata?.command || log.message || "")) return false;
  if (normalizedMessage === "starting session" || normalizedMessage === "starting session...") return false;
  return true;
}

function isReasoningLikeTimelineLog(log: RunnerLog): boolean {
  return log.eventType === "reasoning" || log.eventType === "planning" || Boolean(log.isReasoning || log.isPlanning);
}

function normalizeDuplicateSummaryText(value: string): string {
  return stripSystemTags(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function isDuplicateAssistantSummaryTimelineLog(log: RunnerLog, agentMessage?: RunnerLog): boolean {
  if (!agentMessage?.message || !isReasoningLikeTimelineLog(log)) {
    return false;
  }

  const logText = normalizeDuplicateSummaryText(log.message || "").replace(/^run summary:?\s*/i, "").trim();
  const assistantText = normalizeDuplicateSummaryText(agentMessage.message || "");
  return Boolean(logText && assistantText && logText === assistantText);
}

function buildHydratedTurnsFromLogs(
  logs: RunnerLog[],
  initialPrompt: string,
  messages: RunnerConversationMessage[],
  meta?: {
    durationSeconds?: number | null;
    startedAtMs?: number | null;
    completedAtMs?: number | null;
    threadStatus?: string | null;
    agentName?: string | null;
    environmentName?: string | null;
    backendUrl?: string;
  }
): RunnerTurn[] {
  const turns: RunnerTurn[] = [];
  const chronologicalMessages = sortRunnerConversationMessagesChronologically(messages);
  const dedupedLogs = dedupeAdjacentRunnerLogs(sortRunnerLogsChronologically(logs.map(normalizeHydratedLog)));
  let pendingBtwTurn: RunnerTurn | null = null;
  let currentTurn: RunnerTurn | null = initialPrompt.trim()
    ? {
        id: generateId("turn"),
        prompt: initialPrompt.trim(),
        logs: [],
        startedAtMs: meta?.startedAtMs ?? Date.now(),
        completedAtMs: meta?.completedAtMs ?? meta?.startedAtMs ?? Date.now(),
        durationSeconds: meta?.durationSeconds ?? null,
        status: "completed",
        animateOnRender: false,
        isInitialTurn: true,
        agentName: meta?.agentName ?? null,
        environmentName: meta?.environmentName ?? null,
      }
    : null;

  function ensureCurrentTurn(index: number): RunnerTurn {
    if (currentTurn) return currentTurn;
    const fallbackTime = Date.now() + index;
    currentTurn = {
      id: generateId("turn"),
      prompt: "",
      logs: [],
      startedAtMs: fallbackTime,
      completedAtMs: fallbackTime,
      status: "completed",
      animateOnRender: false,
      agentName: meta?.agentName ?? null,
      environmentName: meta?.environmentName ?? null,
    };
    return currentTurn;
  }

  function commitCurrentTurn() {
    if (!currentTurn) return;
    const hasPrompt = currentTurn.prompt.trim().length > 0;
    const hasLogs = currentTurn.logs.length > 0;
    if (hasPrompt || hasLogs) {
      turns.push(currentTurn);
    }
    currentTurn = null;
  }

  function commitPendingBtwTurn() {
    if (!pendingBtwTurn) return;
    const hasPrompt = pendingBtwTurn.prompt.trim().length > 0;
    const hasLogs = pendingBtwTurn.logs.length > 0;
    if (hasPrompt || hasLogs) {
      turns.push(pendingBtwTurn);
    }
    pendingBtwTurn = null;
  }

  function getSafeTimestamp(log: RunnerLog, index: number): number {
    const logTimestampMs = parseIsoTimestampMs(log.time);
    if (logTimestampMs !== null) {
      return logTimestampMs;
    }
    const relativeSeconds = log.time ? parseSecondsFromClock(log.time) : null;
    if (relativeSeconds !== null && meta?.startedAtMs != null) {
      return meta.startedAtMs + relativeSeconds * 1000;
    }
    return Date.now() + index;
  }

  for (let index = 0; index < dedupedLogs.length; index += 1) {
    const log = dedupedLogs[index];

    if (log.eventType === "user_message" || (log as RunnerLog & { isUserMessage?: boolean }).isUserMessage) {
      const prompt = stripSystemTags(log.message || "");
      const startedAtMs = getSafeTimestamp(log, index);
      const messageAttachments = normalizeTurnAttachments(
        (log.metadata as Record<string, unknown> | undefined)?.attachments,
        meta?.backendUrl
      );
      if (isBtwTurnPrompt(prompt)) {
        commitPendingBtwTurn();
        pendingBtwTurn = {
          id: generateId("turn"),
          prompt,
          logs: [],
          startedAtMs,
          completedAtMs: startedAtMs,
          status: "running",
          animateOnRender: false,
          agentName: meta?.agentName ?? null,
          environmentName: meta?.environmentName ?? null,
          presentation: "btw",
          attachments: messageAttachments,
        };
      } else {
        commitPendingBtwTurn();
        commitCurrentTurn();
        currentTurn = {
          id: generateId("turn"),
          prompt,
          logs: [],
          startedAtMs,
          completedAtMs: startedAtMs,
          status: "completed",
          animateOnRender: false,
          agentName: meta?.agentName ?? null,
          environmentName: meta?.environmentName ?? null,
          presentation: "default",
          attachments: messageAttachments,
        };
      }
      continue;
    }

    if ((log.eventType === "agent_message" || log.eventType === "llm_response") && pendingBtwTurn) {
      pendingBtwTurn.logs.push(log);
      pendingBtwTurn.completedAtMs = getSafeTimestamp(log, index);
      pendingBtwTurn.status = log.type === "error" ? "failed" : "completed";
      commitPendingBtwTurn();
      continue;
    }

    const actionType = log.metadata?.actionType;
    if (
      log.eventType === "action_summary" &&
      (actionType === "compact" || actionType === "clear" || actionType === "fork" || actionType === "revert" || actionType === "reapply")
    ) {
      let commandPrompt = "";
      if (
        currentTurn &&
        currentTurn.prompt.trim().length > 0 &&
        currentTurn.logs.length === 0 &&
        isThreadContextCommandPrompt(currentTurn.prompt, actionType)
      ) {
        commandPrompt = currentTurn.prompt;
        currentTurn = null;
      } else {
        commitCurrentTurn();
      }
      const logTimestampMs = parseIsoTimestampMs(log.time);
      const safeTimestamp = logTimestampMs ?? Date.now() + index;
      turns.push({
        id: generateId("turn"),
        prompt: commandPrompt,
        logs: [log],
        startedAtMs: safeTimestamp,
        completedAtMs: safeTimestamp,
        status: "completed",
        animateOnRender: false,
        agentName: meta?.agentName ?? null,
        environmentName: meta?.environmentName ?? null,
        presentation: "context-action-notice",
      });
      currentTurn = null;
      continue;
    }

    const turn = ensureCurrentTurn(index);

    if (log.eventType === "turn_completed") {
      const durationMs = typeof log.metadata?.durationMs === "number" ? log.metadata.durationMs : null;
      if (durationMs && durationMs >= 0) {
        turn.durationSeconds = Math.max(0, Math.round(durationMs / 1000));
        turn.completedAtMs = turn.startedAtMs + durationMs;
      }
      if (log.type === "error") {
        turn.status = "failed";
      } else if (isActiveTurnStatus(turn.status)) {
        turn.status = "completed";
      }
      continue;
    }

    turn.logs.push(log);

    if (log.eventType === "permission_request") {
      const permissionStatus = String(log.metadata?.status || log.metadata?.decision || "").trim().toLowerCase();
      if (!permissionStatus || permissionStatus === "pending") {
        turn.status = "permission_asked";
        turn.completedAtMs = undefined;
      } else if (turn.status === "permission_asked") {
        if (isTerminalThreadLifecycleStatus(meta?.threadStatus) || meta?.completedAtMs != null) {
          turn.status = terminalTurnStatusFromThreadStatus(meta?.threadStatus);
          turn.completedAtMs = meta?.completedAtMs ?? getSafeTimestamp(log, index);
        } else {
          turn.status = "running";
        }
      }
      continue;
    }

    if (log.eventType === "agent_message" || log.eventType === "llm_response") {
      const durationMs =
        typeof log.metadata?.durationMs === "number"
          ? log.metadata.durationMs
          : typeof (log.metadata as { duration_ms?: unknown } | undefined)?.duration_ms === "number"
            ? ((log.metadata as { duration_ms: number }).duration_ms)
            : null;
      if (durationMs && durationMs >= 0) {
        turn.durationSeconds = Math.max(0, Math.round(durationMs / 1000));
        turn.completedAtMs = turn.startedAtMs + durationMs;
      }
      turn.status = log.type === "error" ? "failed" : "completed";
      continue;
    }

    if (log.type === "error") {
      turn.status = "failed";
    }
  }

  commitPendingBtwTurn();
  commitCurrentTurn();
  const sortedTurns = [...turns].sort((left, right) => {
    if (left.startedAtMs !== right.startedAtMs) {
      return left.startedAtMs - right.startedAtMs;
    }
    return left.id.localeCompare(right.id);
  });
  for (let index = 0; index < sortedTurns.length; index += 1) {
    const turn = sortedTurns[index];
    if (!turn.agentName) {
      turn.agentName = meta?.agentName ?? null;
    }
    if (!turn.environmentName) {
      turn.environmentName = meta?.environmentName ?? null;
    }
    if (index === 0) {
      turn.isInitialTurn = true;
      if (meta?.durationSeconds != null) {
        turn.durationSeconds = meta.durationSeconds;
      }
      if (meta?.startedAtMs != null) {
        turn.startedAtMs = meta.startedAtMs;
      }
      if (meta?.completedAtMs != null) {
        turn.completedAtMs = meta.completedAtMs;
      }
    }
  }
  return applyHydratedRunningThreadState(
    attachHydratedMessageIdsToTurns(sortedTurns, chronologicalMessages, meta?.backendUrl),
    meta
  );
}

function defaultAttachmentFromFile(file: File): RunnerAttachment {
  return {
    id: generateId("att"),
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    type: file.type.startsWith("image/") ? "image" : "document",
    uploadedAt: new Date().toISOString(),
  };
}

const LOGS_AUTO_SCROLL_BOTTOM_THRESHOLD_PX = 24;
const LOGS_AUTO_SCROLL_SETTLE_FRAME_COUNT = 3;
const REATTACH_RUNNING_THREAD_POLL_INTERVAL_MS = 900;
const REATTACH_THREAD_RETRY_DELAY_MS = 1500;
const REATTACH_THREAD_TERMINAL_SETTLE_POLL_LIMIT = 2;
const REATTACH_THREAD_INITIAL_GRACE_POLL_LIMIT = 30;

function isLogViewportPinnedToBottom(element: HTMLDivElement): boolean {
  return element.scrollHeight - element.scrollTop - element.clientHeight <= LOGS_AUTO_SCROLL_BOTTOM_THRESHOLD_PX;
}

export function RunnerChat({
  backendUrl,
  apiKey,
  speechToTextUrl,
  fetchCustomSkills,
  requestHeaders,
  environmentId,
  projectId,
  agentId,
  appId = "runner-web-sdk",
  threadId,
  title,
  threadMetadata = null,
  placeholder = "What would you like me to do?",
  privateMode = false,
  initialTask = "",
  hiddenSystemPrompt = "",
  emptyState,
  emptyStateAfterComposer,
  className,
  disabled = false,
  autoCreateThread = true,
  maxAttachments = 20,
  showUsageInStatus = true,
  inputMode = "minimal",
  agents = [],
  hideAgentSelector = false,
  environments = [],
  hideEnvironmentSelector = false,
  skills = [],
  skillDefaults,
  computerAgents,
  uploadFiles,
  mapFileToAttachment,
  onThreadIdChange,
  onThreadTitleChange,
  onThreadStatusChange,
  onRunStart,
  onRunFinish,
  onRunCancel,
  onRunError,
  onAgentChange,
  onEnvironmentChange,
  onSkillsChange,
  onContextIndicatorClick,
  onActionSummaryClick,
  onSubagentDetailOpenChange,
  onDocumentPreviewOpenChange,
  onDeepResearchDetailOpenChange,
  threadTaskPreview = null,
  threadMissionControlPreview = null,
  composerProjectTasks = [],
  selectedComposerProjectTask = null,
  showComposerCreateAgentAction = false,
  onComposerCreateAgentClick,
  onComposerProjectTaskChange,
  onComposerProjectTaskSubmit,
  activeTaskPreviewId = null,
  onTaskPreviewClick,
  onResourcePreviewClick,
  onAgentTurnClick,
  onSummaryWorkspacePathClick,
  subagentDetailPortalTarget = null,
  disableSubagentDetailDrawer = false,
  externalRunRequest = null,
  onExternalRunRequestHandled,
  onExternalRunRequestCreate,
  autoFocusComposer = false,
  keepFocusOnSubmit = false,
  enableBacklogSubtaskCommand = false,
  backlogTaskConnectors = null,
  backlogSubtaskCommand = null,
  enableBacklogMissionControlCommand = false,
  backlogMissionControlCommand = null,
  enableResourceCreationCommand = false,
  resourceCreationCommand = null,
  resourceCreationCommandHiddenPrompt,
  onResourceCreationCommandChange,
  enableAgentCreationCommand = false,
  agentCreationCommand = null,
  agentCreationCommandHiddenPrompt,
  onAgentCreationCommandChange,
  enableSkillCreationCommand = false,
  skillCreationCommand = null,
  skillCreationCommandHiddenPrompt,
  onSkillCreationCommandChange,
  onOpenPluginsOverview,
  onBacklogMissionControlSubmit,
}: RunnerChatProps) {
  const [input, setInput] = useState(initialTask);
  const [composerQuotedSelection, setComposerQuotedSelection] = useState<RunnerQuotedSelection | null>(null);
  const [renderedComposerQuotedSelection, setRenderedComposerQuotedSelection] = useState<RunnerQuotedSelection | null>(null);
  const [isComposerQuotedSelectionVisible, setIsComposerQuotedSelectionVisible] = useState(false);
  const [projectTasksPopupOpen, setProjectTasksPopupOpen] = useState(false);
  const [localThreadId, setLocalThreadId] = useState<string | null>(threadId ?? null);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [previewedDocumentAttachment, setPreviewedDocumentAttachment] = useState<RunnerTurnAttachment | null>(null);
  const [selectedSubagentDetail, setSelectedSubagentDetail] = useState<RunnerSelectedSubagentDetail | null>(null);
  const [selectedDeepResearchDetail, setSelectedDeepResearchDetail] = useState<RunnerSelectedDeepResearchDetail | null>(null);
  const [selectedComputerUseDetail, setSelectedComputerUseDetail] = useState<RunnerSelectedComputerUseDetail | null>(null);
  const [documentPreviewDrawerWidth, setDocumentPreviewDrawerWidth] = useState<number | null>(null);
  const [isThreadHistoryLoading, setIsThreadHistoryLoading] = useState(false);
  const [, setInlineError] = useState<string | null>(null);
  const [isPreparingRun, setIsPreparingRun] = useState(false);
  const [turns, setTurns] = useState<RunnerTurn[]>([]);
  const [deepResearchSessions, setDeepResearchSessions] = useState<RunnerDeepResearchSession[]>([]);
  const [hydratedThreadStatus, setHydratedThreadStatus] = useState<string | null>(null);
  const [visibleTimelineItemCountsByTurn, setVisibleTimelineItemCountsByTurn] = useState<Record<string, number>>({});
  const [visibleWorkLogItemCountsByTurn, setVisibleWorkLogItemCountsByTurn] = useState<Record<string, number>>({});
  const [thinkingStatusPhaseByTurn, setThinkingStatusPhaseByTurn] = useState<Record<string, RunnerThinkingStatusPhase>>({});
  const [pendingQueuedMessages, setPendingQueuedMessages] = useState<PendingRunnerMessage[]>([]);
  const [editingTurnId, setEditingTurnId] = useState<string | null>(null);
  const [editingTurnDraft, setEditingTurnDraft] = useState("");
  const [forkingTurnId, setForkingTurnId] = useState<string | null>(null);
  const [pendingForkConfiguration, setPendingForkConfiguration] = useState<PendingForkConfiguration | null>(null);
  const [forkTarget, setForkTarget] = useState<RunnerForkTarget>("existing_environment");
  const [forkTargetEnvironmentId, setForkTargetEnvironmentId] = useState<string>(environmentId ?? "");
  const [forkNewEnvironmentName, setForkNewEnvironmentName] = useState("");
  const [forkNewEnvironmentFileCopyMode, setForkNewEnvironmentFileCopyMode] = useState<RunnerForkFileCopyMode>("all");
  const [forkExistingEnvironmentFileCopyMode, setForkExistingEnvironmentFileCopyMode] = useState<RunnerForkExistingEnvironmentFileCopyMode>("none");
  const [showForkEnvironmentPopup, setShowForkEnvironmentPopup] = useState(false);
  const [forkDialogError, setForkDialogError] = useState<string | null>(null);
  const [pendingEditConfirmation, setPendingEditConfirmation] = useState<PendingEditConfirmation | null>(null);
  const [expandedTurns, setExpandedTurns] = useState<Record<string, boolean>>({});
  const [expandedStepRows, setExpandedStepRows] = useState<Record<string, boolean>>({});
  const [nowMs, setNowMs] = useState<number>(() => Date.now());
  const [activeInputPopup, setActiveInputPopup] = useState<InputPopupId | null>(null);
  const [selectedWorkspaceFileIds, setSelectedWorkspaceFileIds] = useState<string[]>([]);
  const [showFileBrowserModal, setShowFileBrowserModal] = useState(false);
  const [showFileBrowserApiKeyPrompt, setShowFileBrowserApiKeyPrompt] = useState(false);
  const [fileBrowserSource, setFileBrowserSource] = useState<RunnerFileBrowserSource>("workspace");
  const [fileBrowserSearchQuery, setFileBrowserSearchQuery] = useState("");
  const [fileBrowserPreviewId, setFileBrowserPreviewId] = useState<string | null>(null);
  const [expandedFileBrowserFolderIds, setExpandedFileBrowserFolderIds] = useState<string[]>([]);
  const [fileBrowserPreviewContent, setFileBrowserPreviewContent] = useState<string | null>(null);
  const [fileBrowserPreviewKind, setFileBrowserPreviewKind] = useState<"image" | "text" | null>(null);
  const [isFileBrowserPreviewLoading, setIsFileBrowserPreviewLoading] = useState(false);
  const [isFileBrowserAttaching, setIsFileBrowserAttaching] = useState(false);
  const [fileBrowserHistory, setFileBrowserHistory] = useState<Array<{ source: RunnerFileBrowserSource; folderId: string | null }>>([]);
  const [fileBrowserHistoryIndex, setFileBrowserHistoryIndex] = useState(-1);
  const [remoteWorkspaceItems, setRemoteWorkspaceItems] = useState<RunnerChatFileNode[]>([]);
  const [loadedWorkspaceFolderIds, setLoadedWorkspaceFolderIds] = useState<string[]>([]);
  const [loadingWorkspaceFolderIds, setLoadingWorkspaceFolderIds] = useState<string[]>([]);
  const [workspaceFolderErrorsById, setWorkspaceFolderErrorsById] = useState<Record<string, string>>({});
  const [remoteGoogleDriveItems, setRemoteGoogleDriveItems] = useState<RunnerChatFileNode[]>([]);
  const [remoteOneDriveItems, setRemoteOneDriveItems] = useState<RunnerChatFileNode[]>([]);
  const [remoteGithubItems, setRemoteGithubItems] = useState<RunnerChatFileNode[]>([]);
  const [remoteNotionDatabases, setRemoteNotionDatabases] = useState<RunnerChatNotionDatabase[]>([]);
  const [notionDatabasesLoaded, setNotionDatabasesLoaded] = useState(false);
  const [loadedGoogleDriveFolderIds, setLoadedGoogleDriveFolderIds] = useState<string[]>([]);
  const [loadedOneDriveFolderIds, setLoadedOneDriveFolderIds] = useState<string[]>([]);
  const [loadedGithubFolderIds, setLoadedGithubFolderIds] = useState<string[]>([]);
  const [loadingGoogleDriveFolderIds, setLoadingGoogleDriveFolderIds] = useState<string[]>([]);
  const [loadingOneDriveFolderIds, setLoadingOneDriveFolderIds] = useState<string[]>([]);
  const [loadingGithubFolderIds, setLoadingGithubFolderIds] = useState<string[]>([]);
  const [isGoogleDriveBrowserLoading, setIsGoogleDriveBrowserLoading] = useState(false);
  const [isOneDriveBrowserLoading, setIsOneDriveBrowserLoading] = useState(false);
  const [isGithubBrowserLoading, setIsGithubBrowserLoading] = useState(false);
  const [isNotionBrowserLoading, setIsNotionBrowserLoading] = useState(false);
  const [isGoogleDrivePickerLoading, setIsGoogleDrivePickerLoading] = useState(false);
  const [googleDriveBrowserError, setGoogleDriveBrowserError] = useState<string | null>(null);
  const [oneDriveBrowserError, setOneDriveBrowserError] = useState<string | null>(null);
  const [githubBrowserError, setGithubBrowserError] = useState<string | null>(null);
  const [notionBrowserError, setNotionBrowserError] = useState<string | null>(null);
  const [threadContext, setThreadContext] = useState<RunnerChatThreadContext | null>(null);
  const [isThreadContextLoading, setIsThreadContextLoading] = useState(false);
  const [threadContextDetails, setThreadContextDetails] = useState<RunnerChatThreadContextDetails | null>(null);
  const [threadContextDetailsError, setThreadContextDetailsError] = useState<string | null>(null);
  const [threadContextNativeError, setThreadContextNativeError] = useState<string | null>(null);
  const [isThreadContextDetailsLoading, setIsThreadContextDetailsLoading] = useState(false);
  const [threadContextActionLoading, setThreadContextActionLoading] = useState<RunnerChatThreadContextAction | null>(null);
  const [threadContextAvailableActions, setThreadContextAvailableActions] = useState<RunnerChatThreadContextAvailableActions>(DEFAULT_THREAD_CONTEXT_ACTIONS);
  const [isWorkspaceBrowserLoading, setIsWorkspaceBrowserLoading] = useState(false);
  const [workspaceBrowserError, setWorkspaceBrowserError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isScreenFileDragActive, setIsScreenFileDragActive] = useState(false);
  const [scheduleType, setScheduleType] = useState<"one-time" | "recurring">("one-time");
  const [scheduledAtValue, setScheduledAtValue] = useState(() => formatDateTimeLocalValue(new Date(Date.now() + 60 * 60 * 1000)));
  const [selectedSchedulePresetId, setSelectedSchedulePresetId] = useState<string>(() => DEFAULT_SCHEDULE_PRESETS[0]?.id || "");
  const [skillsTab, setSkillsTab] = useState<"system" | "custom">("system");
  const [scheduledTask, setScheduledTask] = useState<{
    scheduledTime: Date;
    scheduleType: "one-time" | "recurring";
    cronExpression?: string;
  } | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => {
    if (agentId) return agentId;
    return agents[0]?.id || "";
  });
  const [agentPopupMode, setAgentPopupMode] = useState<RunnerAgentSelectorMode>(() =>
    getRunnerAgentSelectorMode(agents.find((agent) => agent.id === agentId) || agents[0] || null)
  );
  const [activeThreadEnvironmentId, setActiveThreadEnvironmentId] = useState<string | null>(null);
  const [activeThreadEnvironmentName, setActiveThreadEnvironmentName] = useState<string | null>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string>(() => {
    if (environmentId) return environmentId;
    return environments.find((environment) => environment.isDefault)?.id || environments[0]?.id || "";
  });
  const [workspaceSelectorMode, setWorkspaceSelectorMode] = useState<RunnerWorkspaceSelectorMode>(() => {
    return loadPersistedWorkspaceSelection(buildWorkspaceSelectionStorageKey(appId, backendUrl))?.mode || "computers";
  });
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const persisted = loadPersistedWorkspaceSelection(buildWorkspaceSelectionStorageKey(appId, backendUrl));
    return persisted?.mode === "projects" ? persisted.projectId : "";
  });
  const [initialAgentTopId, setInitialAgentTopId] = useState<string | null>(null);
  const [initialEnvironmentTopId, setInitialEnvironmentTopId] = useState<string | null>(null);
  const [enabledSkillIds, setEnabledSkillIds] = useState<string[]>(() => {
    const storageKey = buildEnabledSkillsStorageKey(appId);
    const persisted = loadPersistedEnabledSkillIds(storageKey);
    if (persisted !== null) {
      return persisted;
    }
    return defaultEnabledSkillIds(normalizeComputerAgentSkills(skills));
  });
  const [selectedGithubRepositoryId, setSelectedGithubRepositoryId] = useState<string>(() => computerAgents?.github?.selectedRepositoryId || "");
  const [selectedGithubContextId, setSelectedGithubContextId] = useState<string>(() => computerAgents?.github?.selectedContextId || "");
  const [selectedNotionDatabaseId, setSelectedNotionDatabaseId] = useState<string>(() => computerAgents?.notion?.selectedDatabaseId || "");
  const [customSkills, setCustomSkills] = useState<RunnerChatSkill[]>([]);
  const [isLoadingCustomSkills, setIsLoadingCustomSkills] = useState(false);
  const [customSkillsLoaded, setCustomSkillsLoaded] = useState(false);
  const [googleDriveFolderId, setGoogleDriveFolderId] = useState<string | null>(null);
  const [oneDriveFolderId, setOneDriveFolderId] = useState<string | null>(null);
  const [selectedGoogleDriveFileIds, setSelectedGoogleDriveFileIds] = useState<string[]>([]);
  const [selectedOneDriveFileIds, setSelectedOneDriveFileIds] = useState<string[]>([]);
  const [selectedGithubFileIds, setSelectedGithubFileIds] = useState<string[]>([]);
  const [githubBranchesByRepoFullName, setGithubBranchesByRepoFullName] = useState<Record<string, RunnerChatOption[]>>({});
  const [githubSelectedBranchByRepoFullName, setGithubSelectedBranchByRepoFullName] = useState<Record<string, string>>({});
  const [githubBranchLoadingRepoFullNames, setGithubBranchLoadingRepoFullNames] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [recordingStartedAtMs, setRecordingStartedAtMs] = useState<number | null>(null);
  const [recordingElapsedSeconds, setRecordingElapsedSeconds] = useState(0);
  const [stagedThreadContextCommand, setStagedThreadContextCommand] = useState<RunnerChatThreadContextAction | null>(null);
  const [stagedResourceCreationCommand, setStagedResourceCreationCommand] = useState<StagedResourceCreationCommand | null>(null);
  const [stagedAgentCreationCommand, setStagedAgentCreationCommand] = useState<StagedAgentCreationCommand | null>(null);
  const [stagedSkillCreationCommand, setStagedSkillCreationCommand] = useState<StagedSkillCreationCommand | null>(null);
  const [stagedBacklogSubtaskCommand, setStagedBacklogSubtaskCommand] = useState<StagedBacklogSubtaskCommand | null>(null);
  const [stagedBacklogMissionControlCommand, setStagedBacklogMissionControlCommand] = useState<StagedBacklogMissionControlCommand | null>(null);
  const [renderedMainPopup, setRenderedMainPopup] = useState<MainPopupRenderId | null>(null);
  const [mainPopupPhase, setMainPopupPhase] = useState<PopupAnimationPhase>("idle");
  const [renderedSidePopup, setRenderedSidePopup] = useState<SidePopupRenderId | null>(null);
  const [sidePopupPhase, setSidePopupPhase] = useState<PopupAnimationPhase>("idle");
  const [sidePopupExitDirection, setSidePopupExitDirection] = useState<SidePopupExitDirection>("left");
  const [quotedSelectionPopup, setQuotedSelectionPopup] = useState<RunnerQuotedSelectionPopupState | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const contentWidthRef = useRef<HTMLDivElement | null>(null);
  const threadHistoryAnchorElementsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const threadHistoryMeasureFrameRef = useRef<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const popupAreaRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const projectTasksPopupRef = useRef<HTMLDivElement | null>(null);
  const forkEnvironmentPopupRef = useRef<HTMLDivElement | null>(null);
  const currentInputRef = useRef(initialTask);
  const speechSocketRef = useRef<WebSocket | null>(null);
  const speechSocketReadyRef = useRef(false);
  const speechPendingChunksRef = useRef<SpeechClientMessage[]>([]);
  const speechBaseInputRef = useRef(initialTask);
  const speechTranscriptRef = useRef("");
  const speechActivityOpenRef = useRef(false);
  const speechLastVoiceMsRef = useRef(0);
  const speechMediaStreamRef = useRef<MediaStream | null>(null);
  const speechAudioContextRef = useRef<AudioContext | null>(null);
  const speechSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const speechProcessorNodeRef = useRef<AudioWorkletNode | null>(null);
  const speechSinkGainNodeRef = useRef<GainNode | null>(null);
  const fileBrowserPreviewObjectUrlRef = useRef<string | null>(null);
  const documentPreviewResizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const mainPopupAnimationTimerRef = useRef<number | null>(null);
  const sidePopupAnimationTimerRef = useRef<number | null>(null);
  const isDrainingQueuedRunsRef = useRef(false);
  const attachmentsRef = useRef<LocalAttachment[]>([]);
  const attachmentUploadPromisesRef = useRef<Record<string, Promise<RunnerAttachment> | undefined>>({});
  const githubPreparationPromisesRef = useRef<Record<string, Promise<void> | undefined>>({});
  const turnsRef = useRef<RunnerTurn[]>([]);
  const threadHydrationCacheRef = useRef<RunnerThreadHydrationPayload | null>(null);
  const initializedThreadHistoryIdRef = useRef<string | null>(null);
  const locallyOwnedExecutionThreadIdRef = useRef<string | null>(null);
  const lastEnvironmentStartRequestKeyRef = useRef<string | null>(null);
  const quotedSelectionPopupRef = useRef<HTMLDivElement | null>(null);
  const composerQuotedSelectionAnimationTimerRef = useRef<number | null>(null);
  const appliedBacklogSubtaskCommandTokenRef = useRef<string | number | null>(null);
  const appliedBacklogMissionControlCommandTokenRef = useRef<string | number | null>(null);
  const appliedResourceCreationCommandTokenRef = useRef<string | number | null>(null);
  const appliedAgentCreationCommandTokenRef = useRef<string | number | null>(null);
  const appliedSkillCreationCommandTokenRef = useRef<string | number | null>(null);
  const handledExternalRunRequestTokenRef = useRef<string | number | null>(null);
  const workspacePreferenceAppliedRef = useRef(false);
  const lastAppliedControlledProjectIdRef = useRef<string | null>(null);
  const stopRequestedThreadIdRef = useRef<string | null>(null);
  const visibleTimelineItemCountsRef = useRef<Record<string, number>>({});
  const thinkingStatusPhaseByTurnRef = useRef<Record<string, RunnerThinkingStatusPhase>>({});
  const thinkingStatusTimersRef = useRef<Record<string, { hideTimer?: number; showTimer?: number }>>({});
  const rawTimelineItemCountsRef = useRef<Record<string, number>>({});
  const thinkingStatusEligibilityRef = useRef<Record<string, boolean>>({});
  const [isStoppingRun, setIsStoppingRun] = useState(false);
  const [activeThreadHistoryItemId, setActiveThreadHistoryItemId] = useState<string | null>(null);
  const [hoveredThreadHistoryItemId, setHoveredThreadHistoryItemId] = useState<string | null>(null);
  const [isThreadHistoryRailHovered, setIsThreadHistoryRailHovered] = useState(false);
  const [isThreadHistoryAtMaxWidth, setIsThreadHistoryAtMaxWidth] = useState(true);
  const shouldAutoScrollLogsRef = useRef(true);
  const isProgrammaticLogsAutoScrollRef = useRef(false);
  const autoScrollAnimationFrameRef = useRef<number | null>(null);
  const previousLogsScrollHeightRef = useRef(0);
  const autoScrollSettleFramesRef = useRef(0);
  const screenFileDragActiveRef = useRef(false);

  const { status, logs, execute, cancel, clear, result } = useRunnerExecution({ clearLogsOnExecute: false });

  const normalizedBackendUrl = useMemo(() => sanitizeBackendUrl(backendUrl), [backendUrl]);
  const resolvedSpeechToTextUrl = useMemo(
    () => resolveSpeechToTextUrl(speechToTextUrl, normalizedBackendUrl, requestHeaders),
    [speechToTextUrl, normalizedBackendUrl, requestHeaders]
  );
  const normalizedSkills = useMemo(() => normalizeComputerAgentSkills(skills), [skills]);
  const displayedSkills = useMemo(() => [...normalizedSkills, ...customSkills], [customSkills, normalizedSkills]);
  const enabledSkillsStorageKey = useMemo(() => buildEnabledSkillsStorageKey(appId), [appId]);
  const workspaceSelectionStorageKey = useMemo(
    () => buildWorkspaceSelectionStorageKey(appId, normalizedBackendUrl),
    [appId, normalizedBackendUrl]
  );
  const systemSkills = useMemo(() => displayedSkills.filter((skill) => !skill.isCustom), [displayedSkills]);
  const customSkillItems = useMemo(() => displayedSkills.filter((skill) => skill.isCustom), [displayedSkills]);
  const githubConfig = computerAgents?.github;
  const notionConfig = computerAgents?.notion;
  const googleDriveConfig = computerAgents?.googleDrive;
  const oneDriveConfig = computerAgents?.oneDrive;
  const workspaceConfig = computerAgents?.workspace;
  const scheduleConfig = computerAgents?.schedule;
  const projectsConfig = computerAgents?.projects;
  const schedulePresets = scheduleConfig?.presets?.length ? scheduleConfig.presets : DEFAULT_SCHEDULE_PRESETS;
  const githubRepositories = githubConfig?.repositories || [];
  const githubContexts = githubConfig?.contexts || [];
  const notionDatabases = notionConfig?.fetchDatabases ? remoteNotionDatabases : notionConfig?.databases || [];
  const googleDriveItems = googleDriveConfig?.fetchItems ? remoteGoogleDriveItems : googleDriveConfig?.items || [];
  const oneDriveItems = oneDriveConfig?.fetchItems ? remoteOneDriveItems : oneDriveConfig?.items || [];
  const githubItems = githubConfig?.fetchItems ? remoteGithubItems : [];
  const notionItems = notionDatabasesToFileItems(notionDatabases);
  const currentThreadId = threadId ?? localThreadId;
  const hasCurrentThread = Boolean(currentThreadId);
  const scopedActiveThreadEnvironmentId = hasCurrentThread ? activeThreadEnvironmentId : null;
  const scopedActiveThreadEnvironmentName = hasCurrentThread ? activeThreadEnvironmentName : null;
  const currentThreadHasMessages = useMemo(
    () => turns.some((turn) => turn.presentation !== "context-action-notice" && turn.prompt.trim().length > 0),
    [turns]
  );
  const currentThreadHasWorkspaceChanges = useMemo(
    () => turns.some((turn) => collectTurnChangedFiles(turn.logs).length > 0),
    [turns]
  );
  const isRunning = status === "running";
  const activeRunningTurn =
    [...turns].reverse().find(
      (turn) => isRunningTurnStatus(turn.status) && turn.presentation !== "btw" && turn.presentation !== "context-action-notice"
    ) || null;
  const hasRunningTurn = Boolean(activeRunningTurn);
  const hydratedThreadIsRunning = isRunningThreadLifecycleStatus(hydratedThreadStatus);
  const activeDeepResearchThreadSession = useMemo(() => {
    const activeSessions = deepResearchSessions.filter((session) => isDeepResearchSessionActive(session));
    if (activeSessions.length === 0) {
      return null;
    }
    return activeSessions
      .slice()
      .sort((left, right) => {
        const leftMs = parseIsoTimestampMs(left.startedAt) ?? parseIsoTimestampMs(left.createdAt) ?? 0;
        const rightMs = parseIsoTimestampMs(right.startedAt) ?? parseIsoTimestampMs(right.createdAt) ?? 0;
        return rightMs - leftMs;
      })[0] || null;
  }, [deepResearchSessions]);
  const hasActiveDeepResearchSession = Boolean(activeDeepResearchThreadSession);
  const hasHydratedReattachActivity = useMemo(
    () => hasActiveDeepResearchSession || turns.some((turn) => isActiveTurnStatus(turn.status) || hasActiveDeepResearchLogGroup(turn.logs)),
    [hasActiveDeepResearchSession, turns]
  );
  const hasRunningTurnLogs = Boolean(activeRunningTurn && activeRunningTurn.logs.length > 0);
  const showRunPreparationIndicator = isPreparingRun && !hasRunningTurn && !isRunning && !isStoppingRun;
  const showActiveRunStopButton =
    !showRunPreparationIndicator &&
    (hasRunningTurn || hydratedThreadIsRunning || hasActiveDeepResearchSession || isRunning || isStoppingRun);
  useEffect(() => {
    if (!currentThreadId || !hasRunningTurn || hydratedThreadIsRunning) {
      return;
    }

    setHydratedThreadStatus("running");
    try {
      onThreadStatusChange?.(currentThreadId, "running");
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
    }
  }, [currentThreadId, hasRunningTurn, hydratedThreadIsRunning, onThreadStatusChange]);
  const trimmedInput = input.trim();
  const hasComposerText = input.length > 0;
  const stagedThreadContextCommandToneValue = stagedThreadContextCommandTone(stagedThreadContextCommand);
  const stagedThreadContextCommandLabel = stagedThreadContextCommand ? `/${stagedThreadContextCommand}` : "";
  const stagedResourceCreationCommandLabel = stagedResourceCreationCommand?.label || "";
  const stagedAgentCreationCommandLabel = stagedAgentCreationCommand?.label || "";
  const stagedSkillCreationCommandLabel = stagedSkillCreationCommand?.label || "";
  const stagedBacklogCommand = stagedBacklogMissionControlCommand || stagedBacklogSubtaskCommand;
  const stagedComposerLabel =
    stagedBacklogCommand?.label
    || stagedSkillCreationCommandLabel
    || stagedAgentCreationCommandLabel
    || stagedResourceCreationCommandLabel
    || stagedThreadContextCommandLabel;
  const stagedComposerToneValue = stagedBacklogCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand ? "compact" : stagedThreadContextCommandToneValue;
  const stagedComposerOffsetValue = stagedBacklogCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand
    ? `${Math.max(
        16,
        Math.round(
          stagedComposerLabel.length * 7
          + 20
          + (stagedResourceCreationCommand?.action === "computer" ? 14 : 0)
        )
      )}px`
    : stagedThreadContextCommandOffset(stagedThreadContextCommand);
  const hasStagedComposerCommand = Boolean(stagedThreadContextCommand || stagedResourceCreationCommand || stagedAgentCreationCommand || stagedSkillCreationCommand || stagedBacklogCommand);
  const slashCommandInputState = useMemo(() => {
    if (hasStagedComposerCommand || !input.startsWith("/")) {
      return null;
    }
    const commandSource = input.slice(1);
    const separatorIndex = commandSource.indexOf(" ");
    const query = (separatorIndex === -1 ? commandSource : commandSource.slice(0, separatorIndex)).trim().toLowerCase();
    const prompt = separatorIndex === -1 ? "" : commandSource.slice(separatorIndex + 1);
    return {
      query,
      prompt,
    };
  }, [hasStagedComposerCommand, input]);
  const availableSlashCommandItems = useMemo(() => {
    const items: Array<{
      id: string;
      command: string;
      description: string;
      icon: ReactNode;
      stage: () => void;
    }> = [];
    if (enableAgentCreationCommand) {
      items.push({
        id: "agent",
        command: "/agent",
        description: "Create agent",
        icon: <LucideBot className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageAgentCreationCommand("agent", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "team",
        command: "/team",
        description: "Create team",
        icon: <LucideLayers className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageAgentCreationCommand("team", slashCommandInputState?.prompt || ""),
      });
    }
    if (enableResourceCreationCommand) {
      items.push({
        id: "computer",
        command: "/computer",
        description: "Create computer",
        icon: <LucideCpu className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("computer", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "app",
        command: "/app",
        description: "Create app",
        icon: <LucideMonitor className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("app", slashCommandInputState?.prompt || ""),
      });
      items.push({
        id: "function",
        command: "/function",
        description: "Create function",
        icon: <LucideCode className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageResourceCreationCommand("function", slashCommandInputState?.prompt || ""),
      });
    }
    if (enableSkillCreationCommand) {
      items.push({
        id: "skill",
        command: "/skill",
        description: "Create skill",
        icon: <LucideWand2 className="tb-popup-icon" strokeWidth={1.75} />,
        stage: () => stageSkillCreationCommand("skill", slashCommandInputState?.prompt || ""),
      });
    }
    return items;
  }, [enableAgentCreationCommand, enableResourceCreationCommand, enableSkillCreationCommand, slashCommandInputState?.prompt]);
  const filteredSlashCommandItems = useMemo(() => {
    if (!slashCommandInputState) {
      return [];
    }
    const query = slashCommandInputState.query;
    if (!query) {
      return availableSlashCommandItems;
    }
    return availableSlashCommandItems.filter((item) => item.id.startsWith(query));
  }, [availableSlashCommandItems, slashCommandInputState]);
  const showSlashCommandPopup = Boolean(
    inputMode === "computer-agents"
    && !activeInputPopup
    && slashCommandInputState
    && availableSlashCommandItems.length > 0
  );
  const canRunStagedThreadContextCommand = stagedThreadContextCommand
    ? stagedThreadContextCommand === "btw"
      ? trimmedInput.length > 0
      : true
    : false;
  const canRunStagedMissionControlCommand = Boolean(stagedBacklogMissionControlCommand && onBacklogMissionControlSubmit);
  const canRun =
    !disabled &&
    !isPreparingRun &&
    (!hasRunningTurn || hasRunningTurnLogs) &&
    (trimmedInput.length > 0 || canRunStagedThreadContextCommand || canRunStagedMissionControlCommand);
  const useComputerAgentsMode = inputMode === "computer-agents";
  const enabledSkillsPayload = useMemo(
    () => (useComputerAgentsMode ? buildEnabledSkillsPayload(enabledSkillIds, displayedSkills, skillDefaults) : null),
    [displayedSkills, enabledSkillIds, skillDefaults, useComputerAgentsMode]
  );
  const hasApiKey = apiKey.trim().length > 0;
  const authenticatedAttachmentFetchHeaders = useMemo(
    () => buildRunnerHeaders(requestHeaders, apiKey.trim()),
    [apiKey, requestHeaders]
  );
  const summaryPreviewEnvironmentId = scopedActiveThreadEnvironmentId || selectedEnvironmentId || environmentId || null;
  const canPreviewSummaryWorkspacePaths = Boolean(summaryPreviewEnvironmentId && onSummaryWorkspacePathClick);
  const retainedSummaryPreviewPaths = useMemo(() => collectThreadRetainedSummaryPreviewPaths(turns), [turns]);
  const workspaceItems = hasApiKey ? remoteWorkspaceItems : workspaceConfig?.items || [];
  const availableEnvironments = useMemo(
    () =>
      mergeRunnerChatOptions(environments, [
        scopedActiveThreadEnvironmentId && scopedActiveThreadEnvironmentName
          ? {
              id: scopedActiveThreadEnvironmentId,
              name: scopedActiveThreadEnvironmentName,
            }
          : null,
        environmentId && !environments.some((environment) => environment.id === environmentId)
          ? {
              id: environmentId,
              name: scopedActiveThreadEnvironmentName || "Current Environment",
            }
          : null,
      ]),
    [environmentId, environments, scopedActiveThreadEnvironmentId, scopedActiveThreadEnvironmentName]
  );
  const availableProjects = useMemo<RunnerChatProjectOption[]>(() => {
    const merged = new Map<string, RunnerChatProjectOption>();
    for (const project of projectsConfig?.items || []) {
      const normalizedProjectId = String(project?.id || "").trim();
      if (!normalizedProjectId) {
        continue;
      }
      merged.set(normalizedProjectId, {
        ...project,
        id: normalizedProjectId,
        name: String(project.name || "").trim() || "Untitled Project",
      });
    }
    return Array.from(merged.values());
  }, [projectsConfig?.items]);
  const selectedProject = useMemo(
    () => availableProjects.find((project) => project.id === selectedProjectId) || null,
    [availableProjects, selectedProjectId]
  );
  const selectedProjectEnvironmentId = getRunnerProjectEnvironmentId(selectedProject);
  const effectiveWorkspaceSelectorMode: RunnerWorkspaceSelectorMode =
    workspaceSelectorMode === "projects" && selectedProject && selectedProjectEnvironmentId
      ? "projects"
      : "computers";
  const effectiveProjectEnvironmentId =
    effectiveWorkspaceSelectorMode === "projects" ? selectedProjectEnvironmentId : "";
  const targetMainPopup = getMainPopupRenderId(activeInputPopup);
  const targetSidePopup = getSidePopupRenderId(activeInputPopup);
  const supportsSpeechToText = useMemo(() => {
    if (!hasApiKey || !resolvedSpeechToTextUrl || typeof window === "undefined" || typeof navigator === "undefined") {
      return false;
    }
    const browserWindow = window as typeof window & {
      webkitAudioContext?: typeof AudioContext;
    };
    return (
      typeof WebSocket !== "undefined" &&
      typeof AudioWorkletNode !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      !!(browserWindow.AudioContext || browserWindow.webkitAudioContext)
    );
  }, [hasApiKey, resolvedSpeechToTextUrl]);
  const effectiveAgentId = useComputerAgentsMode ? selectedAgentId || agentId : agentId;
  const explicitProjectId = typeof projectId === "string" && projectId.trim() ? projectId.trim() : null;
  const effectiveProjectId = explicitProjectId || (
    useComputerAgentsMode && effectiveWorkspaceSelectorMode === "projects" && selectedProject
      ? selectedProject.id
      : null
  );
  const effectiveEnvironmentId = useComputerAgentsMode
    ? effectiveProjectEnvironmentId || selectedEnvironmentId || environmentId
    : environmentId;
  const isPassiveWarmEnvironmentReady = !useComputerAgentsMode || Boolean(effectiveEnvironmentId);
  const isPassiveWarmAgentReady = !useComputerAgentsMode || Boolean(effectiveAgentId);
  const textareaAllowsPromptAfterStagedCommand = threadContextActionAllowsPrompt(stagedThreadContextCommand);
  const hasCustomEmptyStateActive = turns.length === 0 && emptyState !== undefined && emptyState !== null;

  function focusComposerSoon(options?: { preventScroll?: boolean }) {
    if (typeof window === "undefined") {
      return;
    }
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus(options?.preventScroll ? { preventScroll: true } : undefined);
    });
  }

  useEffect(() => {
    if (!privateMode || disabled || typeof window === "undefined") {
      return;
    }
    const focusFrame = window.requestAnimationFrame(() => {
      textareaRef.current?.focus({ preventScroll: true });
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [disabled, privateMode]);

  function isStopRequestedThread(threadIdToMatch?: string | null): boolean {
    const requestedThreadId = String(stopRequestedThreadIdRef.current || "").trim();
    const normalizedThreadId = String(threadIdToMatch || "").trim();
    return Boolean(requestedThreadId && normalizedThreadId && requestedThreadId === normalizedThreadId);
  }

  function isIntentionalStopError(error: Error, threadIdToMatch?: string | null): boolean {
    if (!isStopRequestedThread(threadIdToMatch)) {
      return false;
    }
    if (error.name === "AbortError") {
      return true;
    }
    const message = String(error?.message || "").trim();
    if (!message) {
      return false;
    }
    return (
      /runner stream failed \((?:499|500|502|503|504)\)/i.test(message)
      || /<title>\s*502 Server Error\s*<\/title>/i.test(message)
      || /temporary error and could not complete your request/i.test(message)
      || /the server encountered a temporary error/i.test(message)
      || /failed to fetch/i.test(message)
    );
  }

  function normalizeIntentionalStopError(error: Error, threadIdToMatch?: string | null): Error {
    if (!isIntentionalStopError(error, threadIdToMatch)) {
      return error;
    }
    if (error.name === "AbortError") {
      return error;
    }
    const abortError = new Error("Execution cancelled");
    abortError.name = "AbortError";
    return abortError;
  }

  function consumeIntentionalStopAbort(error: Error, threadIdToMatch?: string | null): boolean {
    if (!isIntentionalStopError(error, threadIdToMatch)) {
      return false;
    }
    stopRequestedThreadIdRef.current = null;
    return true;
  }

  function markRunningTurnsCancelled() {
    const cancelledAtMs = Date.now();
    setTurns((previousTurns) =>
      previousTurns.map((turn) =>
        isRunningTurnStatus(turn.status)
          ? {
              ...turn,
              status: "cancelled",
              completedAtMs: cancelledAtMs,
              durationSeconds:
                typeof turn.durationSeconds === "number" && Number.isFinite(turn.durationSeconds)
                  ? Math.max(0, Math.round(turn.durationSeconds))
                  : Math.max(0, Math.floor((cancelledAtMs - turn.startedAtMs) / 1000)),
            }
          : turn
      )
    );
  }

  async function handleStopActiveRun() {
    if (isStoppingRun) {
      return;
    }

    const threadIdToCancel = String(currentThreadId || "").trim();
    const hasLocalExecution = isRunning;

    if (!threadIdToCancel && !hasLocalExecution) {
      return;
    }

    setInlineError(null);
    setIsPreparingRun(false);
    setPendingQueuedMessages([]);
    setIsStoppingRun(true);

    if (threadIdToCancel) {
      stopRequestedThreadIdRef.current = threadIdToCancel;
    }

    try {
      if (threadIdToCancel && normalizedBackendUrl && hasApiKey) {
        await cancelThreadExecution({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: threadIdToCancel,
          requestHeaders,
        });
      }

      markRunningTurnsCancelled();
      cancel();

      if (!hasLocalExecution) {
        stopRequestedThreadIdRef.current = null;
      }

      if (threadIdToCancel) {
        refreshThreadContextDetailsInBackground(threadIdToCancel);
        try {
          onRunCancel?.(threadIdToCancel);
        } catch (callbackError) {
          reportRunnerLifecycleCallbackError("onRunCancel", callbackError);
        }
      }
    } catch (error) {
      stopRequestedThreadIdRef.current = null;
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to stop agent.");
      try {
        onRunError?.(normalizedError, threadIdToCancel || undefined);
      } catch (callbackError) {
        reportRunnerLifecycleCallbackError("onRunError", callbackError);
      }
    } finally {
      setIsStoppingRun(false);
    }
  }

  function applyHydratedThreadEnvironment(payload: RunnerThreadHydrationPayload) {
    const nextEnvironmentId = payload.threadEnvironmentId ?? null;
    const nextEnvironmentName = payload.threadEnvironmentName ?? payload.environmentName ?? null;
    setActiveThreadEnvironmentId(nextEnvironmentId);
    setActiveThreadEnvironmentName(nextEnvironmentName);
    if (nextEnvironmentId) {
      setSelectedEnvironmentId(nextEnvironmentId);
    }
  }

  function buildSuggestedForkEnvironmentName() {
    const baseName = sourceThreadEnvironmentName || selectedEnvironment?.name || displayedEnvironmentLabel || "Environment";
    return `${baseName} Fork`;
  }

  function resetForkConfiguration() {
    setPendingForkConfiguration(null);
    setForkTarget("existing_environment");
    setForkTargetEnvironmentId(sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || "");
    setForkNewEnvironmentName(buildSuggestedForkEnvironmentName());
    setForkNewEnvironmentFileCopyMode("all");
    setForkExistingEnvironmentFileCopyMode("none");
    setShowForkEnvironmentPopup(false);
    setForkDialogError(null);
  }

  async function fetchThreadContextEstimate(nextThreadId: string): Promise<RunnerChatThreadContext | null> {
    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    const response = await fetch(`${normalizedBackendUrl}/threads/${encodeURIComponent(nextThreadId)}/context`, {
      method: "GET",
      headers,
    });
    const body = await response.text();
    let parsed: { context?: RunnerChatThreadContext; message?: string; error?: string } = {};
    try {
      parsed = body ? JSON.parse(body) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok) {
      throw new Error(parsed.message || parsed.error || `Failed to load thread context (${response.status})`);
    }

    return parsed.context || null;
  }

  async function fetchThreadContextDetails(nextThreadId: string): Promise<{
    context: RunnerChatThreadContextDetails | null;
    availableActions: RunnerChatThreadContextAvailableActions;
    nativeError: string | null;
  }> {
    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    const response = await fetch(`${normalizedBackendUrl}/threads/${encodeURIComponent(nextThreadId)}/context/details`, {
      method: "GET",
      headers,
    });
    const body = await response.text();
    let parsed: {
      context?: RunnerChatThreadContextDetails;
      availableActions?: RunnerChatThreadContextAvailableActions;
      nativeError?: string | null;
      message?: string;
      error?: string;
    } = {};
    try {
      parsed = body ? JSON.parse(body) : {};
    } catch {
      parsed = {};
    }

    if (!response.ok) {
      throw new Error(parsed.message || parsed.error || `Failed to load thread context details (${response.status})`);
    }

    return {
      context: parsed.context || null,
      availableActions: parsed.availableActions || DEFAULT_THREAD_CONTEXT_ACTIONS,
      nativeError: parsed.nativeError || null,
    };
  }

  function appendSyntheticActionTurn(
    promptText: string,
    responseText: string,
    detailLabel: string,
    options?: { presentation?: RunnerTurn["presentation"] }
  ) {
    const turnId = generateId("turn");
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: promptText,
        logs: [
          {
            time: timestamp,
            message: detailLabel,
            type: "info",
            eventType: "setup",
          },
          {
            time: timestamp,
            message: responseText,
            type: "success",
            eventType: "agent_message",
          },
        ],
        startedAtMs: now,
        completedAtMs: now,
        durationSeconds: 0,
        status: "completed",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: options?.presentation || "default",
      },
    ]);
    setExpandedTurns((prev) => ({ ...prev, [turnId]: true }));
  }

  function appendThreadContextActionNotice(action: RunnerChatThreadContextAction, message: string) {
    const turnId = generateId("turn");
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: "",
        logs: [
          {
            time: timestamp,
            message,
            type: "info",
            eventType: "action_summary",
            metadata: {
              actionType: action,
            },
          },
        ],
        startedAtMs: now,
        completedAtMs: now,
        durationSeconds: 0,
        status: "completed",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: "context-action-notice",
      },
    ]);
    return turnId;
  }

  function appendPendingThreadContextActionNotice(
    action: RunnerChatThreadContextAction,
    message: string,
    options?: { prompt?: string }
  ) {
    const turnId = generateId("turn");
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: options?.prompt || "",
        logs: [
          {
            time: timestamp,
            message,
            type: "info",
            eventType: "action_summary",
            metadata: {
              actionType: action,
              isPending: true,
            },
          },
        ],
        startedAtMs: now,
        status: "running",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: "context-action-notice",
      },
    ]);
    return turnId;
  }

  function updateThreadContextActionNotice(
    turnId: string,
    message: string,
    options?: { pending?: boolean; failed?: boolean }
  ) {
    const now = Date.now();
    const timestamp = new Date(now).toISOString();
    setTurns((prev) =>
      prev.map((turn) => {
        if (turn.id !== turnId) {
          return turn;
        }
        const nextLogs = turn.logs.map((log, index) =>
          index === 0 && log.eventType === "action_summary"
            ? {
                ...log,
                time: timestamp,
                message,
                type: (options?.failed ? "error" : "info") as RunnerLog["type"],
                metadata: {
                  ...log.metadata,
                  isPending: options?.pending ?? false,
                  failed: options?.failed ?? false,
                },
              }
            : log
        );
        return {
          ...turn,
          logs: nextLogs,
          status: options?.failed ? "failed" : options?.pending ? "running" : "completed",
          completedAtMs: options?.pending ? undefined : now,
          durationSeconds: options?.pending ? undefined : getTurnDurationSeconds(turn),
        };
      })
    );
  }

  async function refreshThreadContextDetails(nextThreadId?: string) {
    const resolvedThreadId = nextThreadId || currentThreadId;
    if (!resolvedThreadId || !hasApiKey || !normalizedBackendUrl) {
      setThreadContextDetails(null);
      setThreadContextDetailsError(null);
      setThreadContextNativeError(null);
      setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
      return;
    }

    setIsThreadContextDetailsLoading(true);
    setThreadContextDetailsError(null);
    try {
      const details = await fetchThreadContextDetails(resolvedThreadId);
      setThreadContextDetails(details.context);
      setThreadContext(details.context);
      setThreadContextAvailableActions(details.availableActions);
      setThreadContextNativeError(details.nativeError);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setThreadContextDetails(null);
      setThreadContextDetailsError(normalizedError.message || "Failed to load thread context details.");
      setThreadContextNativeError(null);
      setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
    } finally {
      setIsThreadContextDetailsLoading(false);
    }
  }

  function refreshThreadContextDetailsInBackground(nextThreadId?: string) {
    void refreshThreadContextDetails(nextThreadId).catch(() => undefined);
  }

  async function refreshDeepResearchSessions(nextThreadId?: string): Promise<void> {
    const resolvedThreadId = String(nextThreadId || currentThreadId || "").trim();
    if (!resolvedThreadId || !hasApiKey || !normalizedBackendUrl) {
      setDeepResearchSessions([]);
      return;
    }
    try {
      const sessions = await fetchThreadResearchSessions({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        threadId: resolvedThreadId,
        requestHeaders,
      });
      setDeepResearchSessions(sessions);
    } catch {
      // Keep the last known sessions during transient polling failures.
    }
  }

  function handleContextIndicatorClick() {
    onContextIndicatorClick?.(threadContext);
    togglePopup("context");
  }

  function openContextPopup() {
    onContextIndicatorClick?.(threadContext);
    setActiveInputPopup("context");
  }

  function clearComposerDraft(options?: { preserveStagedCommand?: boolean; preserveQuotedSelection?: boolean }) {
    setInput("");
    if (!options?.preserveStagedCommand) {
      setStagedThreadContextCommand(null);
      setStagedResourceCreationCommand(null);
      setStagedAgentCreationCommand(null);
      setStagedSkillCreationCommand(null);
      setStagedBacklogSubtaskCommand(null);
      setStagedBacklogMissionControlCommand(null);
    }
    if (!options?.preserveQuotedSelection) {
      setComposerQuotedSelection(null);
    }
    currentInputRef.current = "";
    speechBaseInputRef.current = "";
    speechTranscriptRef.current = "";
  }

  function clearQuotedSelectionPopup() {
    setQuotedSelectionPopup(null);
  }

  function clearComposerQuotedSelection() {
    setComposerQuotedSelection(null);
  }

  function closeDocumentAttachmentPreview() {
    setPreviewedDocumentAttachment(null);
  }

  function closeDeepResearchDetailDrawer() {
    setSelectedDeepResearchDetail(null);
  }

  function closeComputerUseDetailDrawer() {
    setSelectedComputerUseDetail(null);
  }

  function closeSubagentDetailDrawer() {
    setSelectedSubagentDetail(null);
  }

  function openSubagentDetailDrawer(turnId: string, invocationId: string) {
    if (!turnId || !invocationId) {
      return;
    }
    closeDeepResearchDetailDrawer();
    closeComputerUseDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedSubagentDetail({ turnId, invocationId });
  }

  function openDeepResearchDetailDrawer(turnId: string) {
    if (!turnId) {
      return;
    }
    closeSubagentDetailDrawer();
    closeComputerUseDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedDeepResearchDetail({ turnId });
  }

  function openComputerUseDetailDrawer(turnId: string, groupId: string) {
    if (!turnId || !groupId) {
      return;
    }
    closeSubagentDetailDrawer();
    closeDeepResearchDetailDrawer();
    closeDocumentAttachmentPreview();
    setSelectedComputerUseDetail({ turnId, groupId });
  }

  async function openEnvironmentDesktopWindow(targetEnvironmentId?: string | null, targetEnvironmentName?: string | null) {
    if (typeof window === "undefined" || !normalizedBackendUrl) {
      return;
    }

    const normalizedEnvironmentId = String(
      targetEnvironmentId || scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || ""
    ).trim();
    if (!normalizedEnvironmentId) {
      return;
    }

    const normalizedEnvironmentName = String(
      targetEnvironmentName || scopedActiveThreadEnvironmentName || selectedEnvironment?.name || displayedEnvironmentLabel || "Environment"
    ).trim() || "Environment";
    const desktopWindow = window.open("about:blank", "_blank");

    const renderDesktopWindowMessage = (message: string) => {
      if (!desktopWindow || desktopWindow.closed) {
        return;
      }
      try {
        const nextDocument = desktopWindow.document;
        nextDocument.title = `${normalizedEnvironmentName} Desktop`;
        nextDocument.body.innerHTML = "";
        nextDocument.body.style.margin = "0";
        nextDocument.body.style.background = "#000";
        nextDocument.body.style.color = "rgba(255,255,255,0.92)";
        nextDocument.body.style.fontFamily = "system-ui, sans-serif";
        nextDocument.body.style.display = "flex";
        nextDocument.body.style.alignItems = "center";
        nextDocument.body.style.justifyContent = "center";
        nextDocument.body.style.minHeight = "100vh";
        nextDocument.body.style.padding = "24px";
        const copy = nextDocument.createElement("div");
        copy.style.fontSize = "14px";
        copy.style.lineHeight = "1.5";
        copy.style.textAlign = "center";
        copy.textContent = message;
        nextDocument.body.appendChild(copy);
      } catch {
        // Ignore viewer placeholder rendering failures.
      }
    };

    renderDesktopWindowMessage(`Opening ${normalizedEnvironmentName} Computer...`);

    try {
      const response = await fetch(
        `${normalizedBackendUrl}/environments/${encodeURIComponent(normalizedEnvironmentId)}/gui/session`,
        {
          method: "POST",
          headers: {
            ...buildRunnerHeaders(requestHeaders, apiKey.trim()),
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
          cache: "no-store",
        }
      );
      const data = await response.json().catch(() => ({} as Record<string, unknown>));
      if (!response.ok) {
        throw new Error(
          String((data as { message?: unknown; error?: unknown })?.message || (data as { error?: unknown })?.error || "Failed to open computer.")
        );
      }

      const websocketPath = String((data as { websocketPath?: unknown })?.websocketPath || "").trim();
      if (!websocketPath) {
        throw new Error("Desktop session did not return a websocket path.");
      }

      let viewerWsUrl: URL;
      if (websocketPath.startsWith("/api/real/ws/vnc")) {
        viewerWsUrl = new URL(websocketPath, window.location.origin);
        viewerWsUrl.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      } else {
        const backendTarget = new URL(normalizedBackendUrl, window.location.origin);
        viewerWsUrl = new URL(websocketPath, backendTarget);
        viewerWsUrl.protocol =
          viewerWsUrl.protocol === "https:"
            ? "wss:"
            : viewerWsUrl.protocol === "http:"
              ? "ws:"
              : viewerWsUrl.protocol;
      }

      const viewerUrl = new URL("/environment-gui/viewer", window.location.origin);
      viewerUrl.searchParams.set("wsUrl", viewerWsUrl.toString());
      viewerUrl.searchParams.set("title", normalizedEnvironmentName);
      viewerUrl.searchParams.set("environmentId", normalizedEnvironmentId);
      viewerUrl.searchParams.set("ts", String(Date.now()));

      if (desktopWindow && !desktopWindow.closed) {
        desktopWindow.location.replace(viewerUrl.toString());
      } else {
        window.open(viewerUrl.toString(), "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to open computer.";
      renderDesktopWindowMessage(message);
    }
  }

  function startDocumentPreviewResize(event: ReactPointerEvent<HTMLButtonElement>) {
    if (typeof window === "undefined") {
      return;
    }
    const drawerWidth = event.currentTarget.parentElement?.getBoundingClientRect().width;
    if (!drawerWidth) {
      return;
    }
    documentPreviewResizeStateRef.current = {
      startX: event.clientX,
      startWidth: drawerWidth,
    };
    event.preventDefault();
  }

  function toggleDocumentAttachmentPreview(attachment: RunnerTurnAttachment) {
    if (!isAttachmentDocumentPreviewable(attachment)) {
      return;
    }
    closeDeepResearchDetailDrawer();
    closeSubagentDetailDrawer();
    closeComputerUseDetailDrawer();
    setPreviewedDocumentAttachment((current) => (current?.id === attachment.id ? null : attachment));
  }

  function revokeAttachmentPreview(attachment: Pick<LocalAttachment, "previewUrl">) {
    if (attachment.previewUrl) {
      URL.revokeObjectURL(attachment.previewUrl);
    }
  }

  function pruneWorkspaceAttachmentsForEnvironment(nextEnvironmentId: string) {
    setAttachments((prev) => {
      const removed: LocalAttachment[] = [];
      const kept = prev.filter((attachment) => {
        const shouldRemove =
          attachment.source === "workspace" &&
          Boolean(attachment.sourceEnvironmentId) &&
          attachment.sourceEnvironmentId !== nextEnvironmentId;
        if (shouldRemove) {
          removed.push(attachment);
        }
        return !shouldRemove;
      });
      for (const attachment of removed) {
        revokeAttachmentPreview(attachment);
      }
      return removed.length > 0 ? kept : prev;
    });
  }

  function clearComposerAttachments(entries?: LocalAttachment[], options?: { revokePreviews?: boolean }) {
    const attachmentsToClear = entries || attachments;
    if (options?.revokePreviews !== false) {
      for (const attachment of attachmentsToClear) {
        revokeAttachmentPreview(attachment);
      }
    }
    setAttachments([]);
  }

  function setComposerDraft(prompt: string) {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setInput(prompt);
    currentInputRef.current = prompt;
    speechBaseInputRef.current = prompt;
    speechTranscriptRef.current = "";
  }

  function stageThreadContextCommand(action: RunnerChatThreadContextAction, prompt = "") {
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedThreadContextCommand(action);
    setInput(prompt);
    currentInputRef.current = prompt;
    speechBaseInputRef.current = prompt;
    speechTranscriptRef.current = "";
  }

  function stageBacklogSubtaskCommand(ticketNumber: string, prompt?: string) {
    const normalizedTicketNumber = normalizeRunnerBacklogTicketNumber(ticketNumber);
    if (!normalizedTicketNumber) {
      return;
    }
    const nextPrompt = prompt === undefined ? currentInputRef.current : prompt;
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedBacklogSubtaskCommand({
      action: "subtask",
      ticketNumber: normalizedTicketNumber,
      label: buildRunnerBacklogSubtaskLabel(normalizedTicketNumber),
    });
    setInput(nextPrompt);
    currentInputRef.current = nextPrompt;
    speechBaseInputRef.current = nextPrompt;
    speechTranscriptRef.current = "";
  }

  function stageBacklogMissionControlCommand(prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand({
      action: "mission_control",
      label: buildRunnerMissionControlLabel(),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    speechBaseInputRef.current = prompt;
    speechTranscriptRef.current = "";
  }

  function stageResourceCreationCommand(action: RunnerResourceCreationCommandType, prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedResourceCreationCommand({
      action,
      label: buildRunnerResourceCreationLabel(action),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    speechBaseInputRef.current = prompt;
    speechTranscriptRef.current = "";
  }

  function stageAgentCreationCommand(action: RunnerAgentCreationCommandType, prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedSkillCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedAgentCreationCommand({
      action,
      label: buildRunnerAgentCreationLabel(action),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    speechBaseInputRef.current = prompt;
    speechTranscriptRef.current = "";
  }

  function stageSkillCreationCommand(action: RunnerSkillCreationCommandType, prompt = "") {
    setStagedThreadContextCommand(null);
    setStagedResourceCreationCommand(null);
    setStagedAgentCreationCommand(null);
    setStagedBacklogSubtaskCommand(null);
    setStagedBacklogMissionControlCommand(null);
    setStagedSkillCreationCommand({
      action,
      label: buildRunnerSkillCreationLabel(action),
    });
    setInput(prompt);
    currentInputRef.current = prompt;
    speechBaseInputRef.current = prompt;
    speechTranscriptRef.current = "";
  }

  function handleQuotedSelectionMouseUp(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }
    const { clientX, clientY } = event;
    window.requestAnimationFrame(() => {
      const rootElement = rootRef.current;
      const selection = window.getSelection();
      if (!rootElement || !selection || selection.isCollapsed) {
        setQuotedSelectionPopup(null);
        return;
      }
      const anchorContainer = findQuotedSelectionContainer(selection.anchorNode, rootElement);
      const focusContainer = findQuotedSelectionContainer(selection.focusNode, rootElement);
      if (!anchorContainer || !focusContainer || anchorContainer !== focusContainer) {
        setQuotedSelectionPopup(null);
        return;
      }
      const text = sanitizeQuotedSelectionText(selection.toString());
      if (!text) {
        setQuotedSelectionPopup(null);
        return;
      }
      const popupX = Math.min(Math.max(clientX - 36, 12), window.innerWidth - 184);
      const popupY = Math.max(clientY - 64, 12);
      setQuotedSelectionPopup({
        selection: {
          text,
          sourceType: getQuotedSelectionSourceType(anchorContainer),
        },
        x: popupX,
        y: popupY,
      });
    });
  }

  function handleAddQuotedSelectionToComposer() {
    if (!quotedSelectionPopup) {
      return;
    }
    setComposerQuotedSelection(quotedSelectionPopup.selection);
    setQuotedSelectionPopup(null);
    window.getSelection()?.removeAllRanges();
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function updateTurn(turnId: string, updater: (turn: RunnerTurn) => RunnerTurn) {
    setTurns((prev) => prev.map((turn) => (turn.id === turnId ? updater(turn) : turn)));
  }

  function collapseAllWorkingLogs(extraTurnId?: string) {
    const turnIds = Array.from(new Set([
      ...turnsRef.current.map((turn) => turn.id).filter(Boolean),
      ...(extraTurnId ? [extraTurnId] : []),
    ]));
    if (turnIds.length === 0) {
      return;
    }
    setExpandedTurns((previousExpandedTurns) => {
      let didChange = false;
      const nextExpandedTurns = { ...previousExpandedTurns };
      turnIds.forEach((turnId) => {
        if (nextExpandedTurns[turnId] !== false) {
          nextExpandedTurns[turnId] = false;
          didChange = true;
        }
      });
      return didChange ? nextExpandedTurns : previousExpandedTurns;
    });
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      let didChange = false;
      const nextCounts = { ...previousCounts };
      turnIds.forEach((turnId) => {
        if (turnId in nextCounts) {
          delete nextCounts[turnId];
          didChange = true;
        }
      });
      return didChange ? nextCounts : previousCounts;
    });
  }

  function toggleWorkingLogs(turnId: string, isExpanded: boolean) {
    setExpandedTurns((prev) => ({ ...prev, [turnId]: !isExpanded }));
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      if (!(turnId in previousCounts)) {
        return previousCounts;
      }
      const nextCounts = { ...previousCounts };
      delete nextCounts[turnId];
      return nextCounts;
    });
  }

  function loadMoreWorkingLogs(turnId: string, totalItemCount: number) {
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      const currentCount = previousCounts[turnId] ?? RUNNER_WORK_LOG_PAGE_SIZE;
      const nextCount = Math.min(totalItemCount, currentCount + RUNNER_WORK_LOG_PAGE_SIZE);
      if (nextCount <= currentCount) {
        return previousCounts;
      }
      return { ...previousCounts, [turnId]: nextCount };
    });
  }

  function appendTurnLog(turnId: string, log: RunnerLog) {
    const normalizedLog = normalizeHydratedLog(log);
    const hasAbsoluteTimestamp = getRunnerLogAbsoluteTimestampMs(normalizedLog) !== null;
    const relativeSeconds = normalizedLog.time ? parseSecondsFromClock(normalizedLog.time) : null;
    const timestampedLog =
      hasAbsoluteTimestamp || (relativeSeconds !== null && relativeSeconds > 0)
        ? normalizedLog
        : {
            ...normalizedLog,
            createdAt: new Date().toISOString(),
          };
    updateTurn(turnId, (turn) => ({
      ...turn,
      logs: [...turn.logs, timestampedLog],
    }));
    if (isTurnResponseLog(timestampedLog)) {
      collapseAllWorkingLogs(turnId);
    }
  }

  function upsertTurnAgentMessage(turnId: string, message: string) {
    updateTurn(turnId, (turn) => {
      const nextLogs = [...turn.logs];
      const existingIndex = nextLogs.findIndex((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
      const nextLog: RunnerLog = {
        time: new Date().toISOString(),
        message,
        type: "info",
        eventType: "agent_message",
      };
      if (existingIndex === -1) {
        nextLogs.push(nextLog);
      } else {
        nextLogs[existingIndex] = nextLog;
      }
      return {
        ...turn,
        logs: nextLogs,
      };
    });
    if (message.trim()) {
      collapseAllWorkingLogs(turnId);
    }
  }

  function isEditableUserTurn(turn: RunnerTurn) {
    return (
      turn.presentation !== "btw" &&
      turn.presentation !== "context-action-notice" &&
      (turn.sourceMessageId?.startsWith("msg_") || turn.id.startsWith("msg_")) &&
      turn.prompt.trim().length > 0 &&
      !hasRunningTurn &&
      !isPreparingRun &&
      !forkingTurnId
    );
  }

  function isActionableUserTurn(turn: RunnerTurn) {
    return (
      turn.presentation !== "btw" &&
      turn.presentation !== "context-action-notice" &&
      turn.prompt.trim().length > 0
    );
  }

  function startEditingTurn(turn: RunnerTurn) {
    setEditingTurnId(turn.id);
    setEditingTurnDraft(stripSystemTags(turn.prompt));
  }

  function cancelEditingTurn() {
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setPendingEditConfirmation(null);
  }

  function turnHasFileChanges(turn: RunnerTurn) {
    return collectTurnChangedFiles(turn.logs).length > 0;
  }

  async function resolveEditableTurnBoundary(turnId: string): Promise<{ messageId: string; truncateAtMessageIndex: number }> {
    const targetTurn = turnsRef.current.find((turn) => turn.id === turnId);
    if (!targetTurn) {
      throw new Error("Message not found.");
    }

    const fallbackMessageId =
      typeof targetTurn.sourceMessageId === "string" && targetTurn.sourceMessageId.trim().startsWith("msg_")
        ? targetTurn.sourceMessageId.trim()
        : turnId.startsWith("msg_")
          ? turnId
          : "";

    if (!currentThreadId || !hasApiKey) {
      if (fallbackMessageId) {
        return {
          messageId: fallbackMessageId,
          truncateAtMessageIndex: 0,
        };
      }
      throw new Error("Message not found.");
    }

    const messages = await fetchAllThreadMessages({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      threadId: currentThreadId,
      requestHeaders,
    });

    const canonicalUserMessages = messages.filter(
      (message) =>
        message.role === "user" &&
        typeof message.id === "string" &&
        message.id.trim().startsWith("msg_") &&
        typeof message.content === "string" &&
        !isBtwTurnPrompt(message.content) &&
        !isThreadContextCommandPrompt(message.content)
    );

    if (fallbackMessageId && canonicalUserMessages.some((message) => message.id === fallbackMessageId)) {
      const matchedIndex = messages.findIndex((message) => message.id === fallbackMessageId);
      return {
        messageId: fallbackMessageId,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    const editableConversationTurns = turnsRef.current.filter(
      (turn) =>
        turn.presentation !== "btw" &&
        turn.presentation !== "context-action-notice" &&
        turn.prompt.trim().length > 0
    );
    const editableTurnIndex = editableConversationTurns.findIndex((turn) => turn.id === turnId);
    if (editableTurnIndex !== -1 && editableTurnIndex < canonicalUserMessages.length) {
      const matchedMessageId = canonicalUserMessages[editableTurnIndex]!.id!;
      const matchedIndex = messages.findIndex((message) => message.id === matchedMessageId);
      return {
        messageId: matchedMessageId,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    const promptMatch = canonicalUserMessages.find((message) => message.content.trim() === targetTurn.prompt.trim());
    if (promptMatch?.id) {
      const matchedIndex = messages.findIndex((message) => message.id === promptMatch.id);
      return {
        messageId: promptMatch.id,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    if (canonicalUserMessages.length === 1 && canonicalUserMessages[0]?.id) {
      const matchedIndex = messages.findIndex((message) => message.id === canonicalUserMessages[0]!.id);
      return {
        messageId: canonicalUserMessages[0].id!,
        truncateAtMessageIndex: matchedIndex === -1 ? 0 : matchedIndex,
      };
    }

    if (fallbackMessageId) {
      return {
        messageId: fallbackMessageId,
        truncateAtMessageIndex: 0,
      };
    }

    throw new Error("Message not found.");
  }

  async function submitEditedTurn(turnId: string, nextPrompt: string, persistFileChanges?: boolean) {
    const normalizedPrompt = nextPrompt.trim();
    if (!normalizedPrompt) {
      return;
    }

    const resolvedThreadId = currentThreadId;

    const turnIndex = turnsRef.current.findIndex((turn) => turn.id === turnId);
    if (turnIndex === -1) {
      setInlineError("Message not found.");
      return;
    }

    let editBoundary: { messageId: string; truncateAtMessageIndex: number };
    try {
      editBoundary = await resolveEditableTurnBoundary(turnId);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Message not found.");
      return;
    }

    const nextTurns = turnsRef.current
      .slice(0, turnIndex + 1)
      .map((turn, index) =>
        turn.id === turnId
          ? {
              ...turn,
              prompt: normalizedPrompt,
              logs: [],
              startedAtMs: Date.now(),
              completedAtMs: undefined,
              durationSeconds: null,
              status: "running" as RunnerTurnStatus,
              animateOnRender: false,
              sourceMessageId: editBoundary.messageId,
              isInitialTurn: index === 0,
            }
          : {
              ...turn,
              isInitialTurn: index === 0,
            }
      );

    setTurns(nextTurns);
    setPendingQueuedMessages([]);
    isDrainingQueuedRunsRef.current = false;
    setExpandedTurns((prev) => ({
      ...prev,
      [turnId]: true,
    }));
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setPendingEditConfirmation(null);
    setInlineError(null);
      setIsPreparingRun(true);
      closeAllInputPopups();

    try {
      const quotedSelection = turnsRef.current[turnIndex]?.quotedSelection;
      const execution = await executeThreadRun(normalizedPrompt, [], {
        turnId,
        truncateAtMessageIndex: editBoundary.truncateAtMessageIndex,
        persistFileChanges,
        quotedSelection,
      });
      const executionThreadId = execution.threadId || resolvedThreadId;
      if (executionThreadId && hasApiKey) {
        const payload = await fetchThreadHydrationPayload({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: executionThreadId,
          requestHeaders,
        });
        threadHydrationCacheRef.current = payload;
        applyHydratedThreadEnvironment(payload);
        const hydratedTurns = buildHydratedTurnsFromPayload(payload, {
          agentName: displayedAgentLabel,
          environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
          backendUrl: normalizedBackendUrl,
        });
        setTurns(hydratedTurns);
        setExpandedTurns((previousExpandedTurns) =>
          mapExpandedTurns(previousExpandedTurns, nextTurns, hydratedTurns, {
            defaultLatestExpanded: true,
            collapseOnNewRunSummary: true,
          })
        );
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to resend edited message.");
      if (resolvedThreadId && hasApiKey) {
        void fetchThreadHydrationPayload({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: resolvedThreadId,
          requestHeaders,
        })
          .then((payload) => {
            threadHydrationCacheRef.current = payload;
            applyHydratedThreadEnvironment(payload);
            return buildHydratedTurnsFromPayload(payload, {
              agentName: displayedAgentLabel,
              environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
              backendUrl: normalizedBackendUrl,
            });
          })
          .then((hydratedTurns) => {
            setTurns(hydratedTurns);
            setExpandedTurns((previousExpandedTurns) =>
              mapExpandedTurns(previousExpandedTurns, turnsRef.current, hydratedTurns, {
                defaultLatestExpanded: true,
                collapseOnNewRunSummary: true,
              })
            );
          })
          .catch(() => {
            updateTurn(turnId, (turn) => ({
              ...turn,
              prompt: normalizedPrompt,
              status: "failed",
              completedAtMs: Date.now(),
              durationSeconds: getTurnDurationSeconds(turn),
            }));
          });
      } else {
        updateTurn(turnId, (turn) => ({
          ...turn,
          prompt: normalizedPrompt,
          status: "failed",
          completedAtMs: Date.now(),
          durationSeconds: getTurnDurationSeconds(turn),
        }));
      }
    } finally {
      setIsPreparingRun(false);
    }
  }

  function openForkDialogForTurn(turn: RunnerTurn) {
    if (!currentThreadId) {
      setInlineError("Forking requires a saved thread.");
      return;
    }
    if (!normalizedBackendUrl) {
      setInlineError("backendUrl is required.");
      return;
    }
    if (!hasApiKey) {
      setInlineError("apiKey is required.");
      return;
    }

    setInlineError(null);
    setPendingEditConfirmation(null);
    closeAllInputPopups();

    setPendingForkConfiguration({
      source: "message",
      sourceThreadId: currentThreadId,
      stagedPrompt: turn.prompt,
      quotedSelection: turn.quotedSelection || null,
      turn,
    });
    setForkTarget("existing_environment");
    setForkTargetEnvironmentId(sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || "");
    setForkNewEnvironmentName(buildSuggestedForkEnvironmentName());
    setForkNewEnvironmentFileCopyMode("all");
    setForkExistingEnvironmentFileCopyMode("none");
    setShowForkEnvironmentPopup(false);
    setForkDialogError(null);
  }

  function openForkDialogForCurrentThread(
    prompt: string,
    options?: {
      includeCurrentAttachments?: boolean;
      preselectedTargetEnvironmentId?: string | null;
      restoreSelectedEnvironmentId?: string | null;
      initialExistingEnvironmentFileCopyMode?: RunnerForkExistingEnvironmentFileCopyMode;
    }
  ) {
    if (!currentThreadId) {
      setInlineError("Forking requires a saved thread.");
      return;
    }
    if (!normalizedBackendUrl) {
      setInlineError("backendUrl is required.");
      return;
    }
    if (!hasApiKey) {
      setInlineError("apiKey is required.");
      return;
    }

    setInlineError(null);
    setPendingEditConfirmation(null);
    closeAllInputPopups();

    setPendingForkConfiguration({
      source: "thread",
      sourceThreadId: currentThreadId,
      stagedPrompt: prompt,
      attachments: options?.includeCurrentAttachments === false ? [] : attachments.slice(),
      quotedSelection: composerQuotedSelection,
      restoreSelectedEnvironmentId: options?.restoreSelectedEnvironmentId ?? null,
    });
    setForkTarget("existing_environment");
    setForkTargetEnvironmentId(
      options?.preselectedTargetEnvironmentId || sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || ""
    );
    setForkNewEnvironmentName(buildSuggestedForkEnvironmentName());
    setForkNewEnvironmentFileCopyMode("all");
    setForkExistingEnvironmentFileCopyMode(options?.initialExistingEnvironmentFileCopyMode || "none");
    setShowForkEnvironmentPopup(false);
    setForkDialogError(null);
  }

  function cancelPendingForkConfiguration() {
    const restoreSelectedEnvironmentId = pendingForkConfiguration?.restoreSelectedEnvironmentId;
    resetForkConfiguration();
    if (typeof restoreSelectedEnvironmentId === "string") {
      setSelectedEnvironmentId(restoreSelectedEnvironmentId);
    }
  }

  async function switchToForkedThread(params: {
    nextThreadId: string;
    nextEnvironmentId: string | null;
    nextEnvironmentName: string | null;
    composerDraft?: string;
    composerQuotedSelection?: RunnerQuotedSelection | null;
    autoRunPrompt?: string;
    autoRunAttachments?: LocalAttachment[];
    autoRunQuotedSelection?: RunnerQuotedSelection | null;
  }) {
    clear();
    setTurns([]);
    setExpandedTurns({});
    setExpandedStepRows({});
    setPendingQueuedMessages([]);
    isDrainingQueuedRunsRef.current = false;
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setPendingEditConfirmation(null);
    clearComposerAttachments(params.autoRunAttachments);
    setThreadContext(null);
    setThreadContextDetails(null);
    setThreadContextDetailsError(null);
    setThreadContextNativeError(null);
    setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
    setActiveThreadEnvironmentId(params.nextEnvironmentId || null);
    setActiveThreadEnvironmentName(params.nextEnvironmentName || null);
    if (params.nextEnvironmentId) {
      setSelectedEnvironmentId(params.nextEnvironmentId);
      onEnvironmentChange?.(params.nextEnvironmentId);
    }
    setLocalThreadId(params.nextThreadId);
    try {
      onThreadIdChange?.(params.nextThreadId);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadIdChange", error);
    }

    if (typeof params.composerDraft === "string") {
      setComposerDraft(params.composerDraft);
      setComposerQuotedSelection(params.composerQuotedSelection || null);
    } else {
      clearComposerDraft();
    }

    try {
      try {
        const payload = await fetchThreadHydrationPayload({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: params.nextThreadId,
          requestHeaders,
        });
        threadHydrationCacheRef.current = payload;
        applyHydratedThreadEnvironment(payload);
        const hydratedTurns = buildHydratedTurnsFromPayload(payload, {
          agentName: displayedAgentLabel,
          environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
          backendUrl: normalizedBackendUrl,
        });
        setTurns(hydratedTurns);
        setExpandedTurns(mapExpandedTurns({}, [], hydratedTurns, { collapseOnNewRunSummary: true }));
      } catch {
        setActiveThreadEnvironmentName(params.nextEnvironmentName || null);
        const hydratedTurns = await fetchAllThreadMessages({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: params.nextThreadId,
          requestHeaders,
        }).then((messages) =>
          buildHydratedTurnsFromMessages(messages, {
            agentName: displayedAgentLabel,
            environmentName: params.nextEnvironmentName,
            backendUrl: normalizedBackendUrl,
          })
        );
        setTurns(hydratedTurns);
        setExpandedTurns(mapExpandedTurns({}, [], hydratedTurns, { collapseOnNewRunSummary: true }));
      }

      if (params.autoRunPrompt?.trim()) {
        await executeThreadRun(params.autoRunPrompt.trim(), params.autoRunAttachments || [], {
          threadIdOverride: params.nextThreadId,
          quotedSelection: params.autoRunQuotedSelection || null,
          environmentIdOverride: params.nextEnvironmentId,
        });
      } else {
        refreshThreadContextDetailsInBackground(params.nextThreadId);
        window.requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to load forked thread.");
    }
  }

  async function confirmForkFromPendingConfiguration() {
    const pendingFork = pendingForkConfiguration;
    if (!pendingFork) {
      return;
    }
    if (!pendingFork.sourceThreadId) {
      setForkDialogError("Forking requires a saved thread.");
      return;
    }
    if (!normalizedBackendUrl) {
      setForkDialogError("backendUrl is required.");
      return;
    }
    if (!hasApiKey) {
      setForkDialogError("apiKey is required.");
      return;
    }

    const requestTarget = forkTarget;
    const requestTargetEnvironmentId =
      requestTarget === "existing_environment"
        ? (forkTargetEnvironmentId || sourceThreadEnvironmentId || selectedEnvironmentId || environmentId || "")
        : "";
    const requestEnvironmentName =
      requestTarget === "new_forked_environment"
        ? (forkNewEnvironmentName.trim() || buildSuggestedForkEnvironmentName())
        : "";
    const selectedForkEnvironment =
      availableEnvironments.find((environment) => environment.id === requestTargetEnvironmentId) || null;
    const shouldShowExistingEnvironmentCopyOptions =
      requestTarget === "existing_environment" &&
      Boolean(requestTargetEnvironmentId) &&
      Boolean(sourceThreadEnvironmentId) &&
      requestTargetEnvironmentId !== sourceThreadEnvironmentId;
    const requestFileCopyMode =
      requestTarget === "new_forked_environment"
        ? forkNewEnvironmentFileCopyMode
        : shouldShowExistingEnvironmentCopyOptions
          ? forkExistingEnvironmentFileCopyMode
          : undefined;
    const fallbackForkEnvironmentName =
      requestTarget === "existing_environment"
        ? (selectedForkEnvironment?.name || sourceThreadEnvironmentName || displayedEnvironmentLabel)
        : requestEnvironmentName;

    if (requestTarget === "existing_environment" && !requestTargetEnvironmentId) {
      setForkDialogError("Select an environment for the forked thread.");
      return;
    }
    if (requestTarget === "new_forked_environment" && !requestEnvironmentName.trim()) {
      setForkDialogError("Enter a name for the new forked environment.");
      return;
    }

    setForkDialogError(null);
    setForkingTurnId(pendingFork.turn?.id || "thread-fork");

    let forkResult: Awaited<ReturnType<typeof forkThreadRequest>> | null = null;
    try {
      await stopSpeechToText().catch(() => undefined);
      const truncateAtMessageIndex =
        pendingFork.source === "message" && pendingFork.turn
          ? (await resolveEditableTurnBoundary(pendingFork.turn.id)).truncateAtMessageIndex
          : undefined;
      forkResult = await forkThreadRequest({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        threadId: pendingFork.sourceThreadId,
        truncateAtMessageIndex,
        environmentTarget: requestTarget,
        environmentName: requestTarget === "new_forked_environment" ? requestEnvironmentName : undefined,
        targetEnvironmentId: requestTarget === "existing_environment" ? requestTargetEnvironmentId : undefined,
        fileCopyMode: requestFileCopyMode,
        requestHeaders,
      });
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setForkDialogError(normalizedError.message || "Failed to fork thread.");
      setForkingTurnId(null);
      return;
    }

    const nextThreadId = forkResult.thread.id;
    resetForkConfiguration();
    const nextEnvironmentId =
      forkResult.environmentId ??
      (requestTarget === "existing_environment" ? requestTargetEnvironmentId : sourceThreadEnvironmentId ?? null);
    const nextEnvironmentName = forkResult.environmentName ?? fallbackForkEnvironmentName;
    const autoRunPrompt = pendingFork.source === "thread" ? pendingFork.stagedPrompt.trim() : "";
    const autoRunAttachments = pendingFork.source === "thread" ? pendingFork.attachments || [] : [];
    const pendingForkQuotedSelection = pendingFork.quotedSelection || null;

    try {
      await switchToForkedThread({
        nextThreadId,
        nextEnvironmentId,
        nextEnvironmentName,
        composerDraft: pendingFork.source === "message" ? pendingFork.stagedPrompt : undefined,
        composerQuotedSelection: pendingFork.source === "message" ? pendingForkQuotedSelection : null,
        autoRunPrompt: pendingFork.source === "thread" ? autoRunPrompt : undefined,
        autoRunAttachments,
        autoRunQuotedSelection: pendingFork.source === "thread" ? pendingForkQuotedSelection : null,
      });
    } finally {
      setForkingTurnId(null);
    }
  }

  function handleEditedTurnSend(turnId: string) {
    const normalizedPrompt = editingTurnDraft.trim();
    if (!normalizedPrompt) {
      return;
    }

    const turnIndex = turnsRef.current.findIndex((turn) => turn.id === turnId);
    if (turnIndex === -1) {
      return;
    }

    const affectedTurns = turnsRef.current.slice(turnIndex);
    const changedFiles = affectedTurns.flatMap((turn) => collectTurnChangedFiles(turn.logs));
    const changedFileMap = new Map<string, {
      path: string;
      kind: "created" | "modified" | "deleted";
      additions?: number;
      deletions?: number;
    }>();
    for (const file of changedFiles) {
      changedFileMap.set(file.path, file);
    }

    if (changedFileMap.size > 0) {
      setPendingEditConfirmation({
        turnId,
        nextPrompt: normalizedPrompt,
        changedFiles: Array.from(changedFileMap.values()),
      });
      return;
    }

    void submitEditedTurn(turnId, normalizedPrompt);
  }

  function handleEditedTurnKeyDown(event: KeyboardEvent<HTMLTextAreaElement>, turnId: string) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      event.preventDefault();
      handleEditedTurnSend(turnId);
    }
  }

  async function streamBtwSideQuestion(prompt: string, commandText: string) {
    if (!normalizedBackendUrl) {
      throw new Error("backendUrl is required.");
    }
    if (!apiKey) {
      throw new Error("apiKey is required.");
    }
    const resolvedThreadId = currentThreadId;
    if (!resolvedThreadId) {
      throw new Error("Start a conversation first before using /btw.");
    }

    const turnId = generateId("turn");
    const now = Date.now();
    setTurns((prev) => [
      ...prev,
      {
        id: turnId,
        prompt: commandText,
        logs: [],
        startedAtMs: now,
        status: "running",
        animateOnRender: true,
        isInitialTurn: prev.length === 0,
        agentName: selectedAgent?.name || displayedAgentLabel,
        environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
        presentation: "btw",
      },
    ]);

    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    headers.set("Content-Type", "application/json");
    const hiddenSystemPromptText = hiddenSystemPrompt.trim();
    const executionPrompt =
      hiddenSystemPromptText && prompt
        ? `${hiddenSystemPromptText}\n\n${prompt}`
        : hiddenSystemPromptText || prompt;

    try {
      const response = await fetch(`${normalizedBackendUrl}/threads/${encodeURIComponent(resolvedThreadId)}/context/actions/btw/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: executionPrompt }),
      });

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        throw new Error(bodyText || `Failed to execute /btw (${response.status})`);
      }
      if (!response.body) {
        throw new Error("BTW stream response has no body");
      }

      let fullText = "";
      for await (const data of iterateSseData(response.body)) {
        if (!data || data === "[DONE]") continue;
        let event: Record<string, unknown> | null = null;
        try {
          event = JSON.parse(data) as Record<string, unknown>;
        } catch {
          event = null;
        }
        if (!event) continue;
        if (event.type === "btw.delta" && typeof event.text === "string") {
          fullText = event.text;
          upsertTurnAgentMessage(turnId, fullText);
          continue;
        }
        if (event.type === "btw.completed" && typeof event.message === "string") {
          fullText = event.message;
          upsertTurnAgentMessage(turnId, fullText);
        }
        if (event.type === "stream.error") {
          const errorMessage =
            typeof event.error === "object" && event.error && typeof (event.error as { message?: unknown }).message === "string"
              ? ((event.error as { message: string }).message || "Failed to execute /btw.")
              : "Failed to execute /btw.";
          throw new Error(errorMessage);
        }
      }

      updateTurn(turnId, (turn) => ({
        ...turn,
        status: "completed",
        completedAtMs: Date.now(),
        durationSeconds: getTurnDurationSeconds(turn),
      }));
      refreshThreadContextDetailsInBackground(resolvedThreadId);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      updateTurn(turnId, (turn) => ({
        ...turn,
        status: "failed",
        completedAtMs: Date.now(),
        durationSeconds: getTurnDurationSeconds(turn),
        logs: turn.logs.length > 0
          ? turn.logs
          : [
              {
                time: new Date().toISOString(),
                message: normalizedError.message || "Failed to execute /btw.",
                type: "error",
                eventType: "agent_message",
              },
            ],
      }));
      throw normalizedError;
    }
  }

  function buildSelectedGithubRepoReference(attachmentEntries: LocalAttachment[]): {
    repoFullName: string;
    repoName: string;
    branch: string;
  } | null {
    const githubAttachments = attachmentEntries.filter((entry) => entry.integrationSource === "github" && entry.githubRepoFullName);
    if (githubAttachments.length > 0) {
      const repoFullNames = Array.from(
        new Set(githubAttachments.map((entry) => String(entry.githubRepoFullName || "").trim()).filter(Boolean))
      );
      if (repoFullNames.length === 1) {
        const repoFullName = repoFullNames[0];
        const branch =
          githubAttachments.map((entry) => String(entry.githubRef || "").trim()).find(Boolean)
          || githubContexts.find((context) => context.id === selectedGithubContextId)?.name
          || selectedGithubContextId;
        if (branch) {
          return {
            repoFullName,
            repoName: repoFullName.split("/").pop() || repoFullName,
            branch,
          };
        }
      }
    }

    const selectedRepository = githubRepositories.find((repository) => repository.id === selectedGithubRepositoryId);
    if (!selectedRepository) {
      return null;
    }
    const branch = githubContexts.find((context) => context.id === selectedGithubContextId)?.name || selectedGithubContextId;
    if (!branch) {
      return null;
    }
    return {
      repoFullName: selectedRepository.id,
      repoName: selectedRepository.name || selectedRepository.id,
      branch,
    };
  }

  async function executeThreadRun(
    taskText: string,
    attachmentEntries: LocalAttachment[],
    options?: {
      turnId?: string;
      threadIdOverride?: string;
      truncateAtMessageIndex?: number;
      persistFileChanges?: boolean;
      quotedSelection?: RunnerQuotedSelection | null;
      environmentIdOverride?: string | null;
      agentIdOverride?: string | null;
      agentNameOverride?: string | null;
      backlogCommand?: StagedBacklogCommand | null;
      resourceCreationCommand?: StagedResourceCreationCommand | null;
      agentCreationCommand?: StagedAgentCreationCommand | null;
      skillCreationCommand?: StagedSkillCreationCommand | null;
      resolvedAttachmentsOverride?: RunnerAttachment[] | null;
      githubRepoOverride?: {
        repoFullName: string;
        repoName: string;
        branch: string;
      } | null;
      enabledSkillsOverride?: Record<string, unknown> | null;
      displayPromptOverride?: string | null;
    }
  ) {
    const hiddenSystemPromptText = hiddenSystemPrompt.trim();
    const resourceCreationHiddenPromptText = options?.resourceCreationCommand
      ? String(resourceCreationCommandHiddenPrompt?.(options.resourceCreationCommand.action) || "").trim()
      : "";
    const agentCreationHiddenPromptText = options?.agentCreationCommand
      ? String(agentCreationCommandHiddenPrompt?.(options.agentCreationCommand.action) || "").trim()
      : "";
    const skillCreationHiddenPromptText = options?.skillCreationCommand
      ? String(skillCreationCommandHiddenPrompt?.(options.skillCreationCommand.action) || "").trim()
      : "";
    const executionTaskText =
      [hiddenSystemPromptText, resourceCreationHiddenPromptText, agentCreationHiddenPromptText, skillCreationHiddenPromptText, taskText]
        .filter((part) => typeof part === "string" && part.trim().length > 0)
        .join("\n\n");
    const visibleTaskText =
      options?.displayPromptOverride !== undefined
        ? String(options.displayPromptOverride || "")
        : taskText;
    const hasResolvedThread = Boolean(options?.threadIdOverride || currentThreadId);
    let runEnvironmentId =
      options?.environmentIdOverride !== undefined
        ? options.environmentIdOverride
        : hasResolvedThread
          ? activeThreadEnvironmentId || selectedEnvironment?.id || environmentId || null
          : effectiveEnvironmentId || selectedEnvironment?.id || environmentId || null;
	    const ensuredThread =
	      options?.threadIdOverride
	        ? {
	            threadId: options.threadIdOverride,
	            didCreateThread: false,
	            initialTitle: null,
	            environmentId: runEnvironmentId,
	          }
	        : await ensureThread(taskText, { reserveLocalExecution: true });
    const threadId = ensuredThread.threadId;
    if (!runEnvironmentId && ensuredThread.environmentId) {
      runEnvironmentId = ensuredThread.environmentId;
    }
    const runAgentId =
      options?.agentIdOverride !== undefined
        ? String(options.agentIdOverride || "").trim()
        : String(effectiveAgentId || "").trim();
    const runAgentName = String(options?.agentNameOverride || "").trim() || selectedAgent?.name || displayedAgentLabel;
    initializedThreadHistoryIdRef.current = threadId;
    const githubRepo =
      options?.githubRepoOverride !== undefined
        ? options.githubRepoOverride
        : buildSelectedGithubRepoReference(attachmentEntries);
    const shouldHandoffExternalRun =
      Boolean(onExternalRunRequestCreate)
      && ensuredThread.didCreateThread
      && !options?.threadIdOverride
      && !options?.turnId
      && !currentThreadId;

    if (shouldHandoffExternalRun) {
      const resolvedAttachments =
        options?.resolvedAttachmentsOverride !== undefined
          ? options.resolvedAttachmentsOverride || undefined
          : await resolveAttachmentPayload(attachmentEntries, runEnvironmentId);
      const didHandleExternalRunRequest = onExternalRunRequestCreate?.({
        token: generateId("runreq"),
        threadId,
        prompt: executionTaskText,
        displayPrompt: visibleTaskText || taskText,
        agentId: effectiveAgentId || null,
        agentName: selectedAgent?.name || displayedAgentLabel,
        attachments: resolvedAttachments || [],
        githubRepo: githubRepo || null,
        enabledSkills: enabledSkillsPayload || null,
        environmentId: typeof runEnvironmentId === "string" ? runEnvironmentId : "",
        projectId: effectiveProjectId || null,
        quotedSelection: options?.quotedSelection || null,
      });
      if (didHandleExternalRunRequest !== false) {
        if (locallyOwnedExecutionThreadIdRef.current === threadId) {
          locallyOwnedExecutionThreadIdRef.current = null;
        }
        return {
          threadId,
          executionResult: null,
          turnId: null,
        };
      }
    }

    locallyOwnedExecutionThreadIdRef.current = threadId;

    const initialTurnAttachments = buildTurnAttachmentsFromLocalAttachments(attachmentEntries);
    const turnId = options?.turnId || generateId("turn");
    const startedAtMs = Date.now();
    let releasedPreparationState = false;
    const releasePreparationState = () => {
      if (releasedPreparationState) {
        return;
      }
      releasedPreparationState = true;
      setIsPreparingRun(false);
    };

    if (options?.turnId) {
      updateTurn(turnId, (turn) => ({
        ...turn,
        logs: [],
        startedAtMs,
        completedAtMs: undefined,
        durationSeconds: null,
        status: "running",
        quotedSelection: options?.quotedSelection === undefined ? turn.quotedSelection : options.quotedSelection,
        attachments: pickTurnAttachments(initialTurnAttachments, turn.attachments),
        agentName: runAgentName || turn.agentName || null,
      }));
    } else {
      setTurns((prev) => [
        ...prev,
        {
          id: turnId,
          prompt: visibleTaskText,
          logs: [],
          startedAtMs,
          status: "running",
          animateOnRender: true,
          isInitialTurn: prev.length === 0,
          agentName: runAgentName,
          environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
          quotedSelection: options?.quotedSelection || null,
          attachments: initialTurnAttachments,
        },
      ]);
      setExpandedTurns((prev) => ({ ...prev, [turnId]: true }));
    }

    try {
      onRunStart?.(threadId);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onRunStart", error);
    }
    try {
      if (runEnvironmentId && normalizedBackendUrl && apiKey.trim()) {
        let didEnvironmentWarmupTimeout = false;
        try {
          await startEnvironment({
            backendUrl: normalizedBackendUrl,
            apiKey: apiKey.trim(),
            requestHeaders,
            environmentId: runEnvironmentId,
            ...(runAgentId ? { agentId: runAgentId } : {}),
            ...(options?.enabledSkillsOverride !== undefined
              ? { enabledSkills: options.enabledSkillsOverride }
              : enabledSkillsPayload
                ? { enabledSkills: enabledSkillsPayload }
                : {}),
          });
        } catch (error) {
          if (!isEnvironmentStartTimeoutError(error)) {
            throw error;
          }
          didEnvironmentWarmupTimeout = true;
          console.warn("[RunnerChat] Environment warm-up timed out; continuing with thread execution.", error);
        }
        if (githubRepo?.repoFullName && githubRepo?.branch && !didEnvironmentWarmupTimeout) {
          await prepareGithubRepoForThreadRun(
            {
              repoFullName: githubRepo.repoFullName,
              branch: githubRepo.branch,
            },
            runEnvironmentId
          );
        } else if (githubRepo?.repoFullName && githubRepo?.branch && didEnvironmentWarmupTimeout) {
          console.warn("[RunnerChat] Skipping GitHub preflight because environment warm-up timed out.");
        }
      }

      const resolvedAttachments =
        options?.resolvedAttachmentsOverride !== undefined
          ? options.resolvedAttachmentsOverride || undefined
          : await resolveAttachmentPayload(attachmentEntries, runEnvironmentId);
      const turnAttachments = buildTurnAttachmentsForExecution(attachmentEntries, resolvedAttachments, normalizedBackendUrl);
      if (turnAttachments) {
        updateTurn(turnId, (turn) => ({
          ...turn,
          attachments: pickTurnAttachments(turnAttachments, turn.attachments),
        }));
      }

      if (
        ensuredThread.didCreateThread &&
        !title?.trim() &&
        taskText.trim() &&
        isDefaultThreadTitle(ensuredThread.initialTitle)
      ) {
        void generateThreadTitle({
          backendUrl: normalizedBackendUrl,
          apiKey,
          requestHeaders,
          threadId,
          message: visibleTaskText || taskText,
        })
          .then((nextTitle) => {
            onThreadTitleChange?.(threadId, nextTitle);
          })
          .catch((error) => {
            console.warn("[RunnerChat] Failed to generate thread title", error);
          });
      }

      const subtaskBacklogCommand =
        options?.backlogCommand?.action === "subtask"
          ? options.backlogCommand
          : null;

      const executionResult = await execute({
        run: {
          url: `${normalizedBackendUrl}/threads/${encodeURIComponent(threadId)}/messages`,
          headers: (() => {
            const headers = new Headers(requestHeaders || {});
            headers.set("Content-Type", "application/json");
            headers.set("X-API-Key", apiKey);
            return headers;
          })(),
          body: {
            content: visibleTaskText || taskText,
            ...(executionTaskText !== (visibleTaskText || taskText) ? { executionContent: executionTaskText } : {}),
            ...(resolvedAttachments ? { attachments: resolvedAttachments } : {}),
            ...(githubRepo ? { githubRepo } : {}),
            ...(typeof options?.truncateAtMessageIndex === "number" ? { truncateAtMessageIndex: options.truncateAtMessageIndex } : {}),
            ...(typeof options?.persistFileChanges === "boolean" ? { persistFileChanges: options.persistFileChanges } : {}),
            ...(options?.quotedSelection ? { quotedSelection: options.quotedSelection } : {}),
            ...(options?.enabledSkillsOverride !== undefined
              ? (options.enabledSkillsOverride ? { enabledSkills: options.enabledSkillsOverride } : {})
              : (enabledSkillsPayload ? { enabledSkills: enabledSkillsPayload } : {})),
            ...(backlogTaskConnectors ? { connectors: backlogTaskConnectors } : {}),
            ...(subtaskBacklogCommand
              ? {
                  backlogTaskCommand: {
                    action: "subtask" as const,
                    parentTicketNumber: subtaskBacklogCommand.ticketNumber,
                  },
                }
              : {}),
          },
        },
        onLog: (log) => {
          releasePreparationState();
          if (log.eventType === "permission_request") {
            const permissionStatus = String(log.metadata?.status || log.metadata?.decision || "").trim().toLowerCase();
            const nextTurnStatus: RunnerTurnStatus = !permissionStatus || permissionStatus === "pending" ? "permission_asked" : "running";
            updateTurn(turnId, (turn) => ({
              ...turn,
              status: nextTurnStatus,
              completedAtMs: undefined,
            }));
            try {
              onThreadStatusChange?.(threadId, nextTurnStatus);
            } catch (error) {
              reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
            }
          }
          appendTurnLog(turnId, log);
        },
	      });

	      releasePreparationState();
	      updateTurn(turnId, (turn) => ({
	        ...turn,
	        status: executionResult.cancelled ? "cancelled" : "completed",
	        completedAtMs: Date.now(),
	        durationSeconds: executionResult.durationSeconds,
	      }));

	      refreshThreadContextDetailsInBackground(threadId);
      if (options?.skillCreationCommand && fetchCustomSkills) {
        void fetchCustomSkills()
          .then((loadedSkills) => {
            const filtered = (loadedSkills || []).filter((skill) => skill.isCustom);
            setCustomSkills(filtered);
            setCustomSkillsLoaded(true);
          })
          .catch(() => {
            setCustomSkillsLoaded(false);
          });
      }
      try {
        onRunFinish?.(executionResult, threadId);
      } catch (error) {
        reportRunnerLifecycleCallbackError("onRunFinish", error);
      }
      return { threadId, executionResult, turnId };
    } catch (error) {
      releasePreparationState();
      const normalizedError = normalizeIntentionalStopError(
        error instanceof Error ? error : new Error(String(error)),
        threadId
      );
      updateTurn(turnId, (turn) => ({
        ...turn,
        status: normalizedError.name === "AbortError" ? "cancelled" : "failed",
        completedAtMs: Date.now(),
        durationSeconds: getTurnDurationSeconds(turn),
      }));
      throw normalizedError;
    } finally {
      if (locallyOwnedExecutionThreadIdRef.current === threadId) {
        locallyOwnedExecutionThreadIdRef.current = null;
      }
      releasePreparationState();
    }
  }

  useEffect(() => {
    screenFileDragActiveRef.current = isScreenFileDragActive;
  }, [isScreenFileDragActive]);

  useEffect(() => {
    if (!isScreenFileDragActive) {
      return;
    }
    const clearScreenFileDrag = () => {
      screenFileDragActiveRef.current = false;
      setIsScreenFileDragActive(false);
    };
    window.addEventListener("drop", clearScreenFileDrag);
    window.addEventListener("dragend", clearScreenFileDrag);
    window.addEventListener("blur", clearScreenFileDrag);
    return () => {
      window.removeEventListener("drop", clearScreenFileDrag);
      window.removeEventListener("dragend", clearScreenFileDrag);
      window.removeEventListener("blur", clearScreenFileDrag);
    };
  }, [isScreenFileDragActive]);

  useEffect(() => {
    const normalizedRequestThreadId = String(externalRunRequest?.threadId || "").trim();
    const normalizedPrompt = String(externalRunRequest?.prompt || "").trim();
    const normalizedDisplayPrompt = typeof externalRunRequest?.displayPrompt === "string"
      ? externalRunRequest.displayPrompt
      : undefined;
    const requestToken = externalRunRequest?.token;

    if (
      !externalRunRequest ||
      requestToken === undefined ||
      requestToken === null ||
      handledExternalRunRequestTokenRef.current === requestToken ||
      !normalizedRequestThreadId ||
      normalizedRequestThreadId !== currentThreadId ||
      !normalizedPrompt ||
      !hasApiKey ||
      !normalizedBackendUrl ||
      disabled
    ) {
      return;
    }

    handledExternalRunRequestTokenRef.current = requestToken;
    try {
      onExternalRunRequestHandled?.(requestToken);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onExternalRunRequestHandled", error);
    }

    void (async () => {
      try {
        setInlineError(null);
        setPendingQueuedMessages([]);
        setIsPreparingRun(true);
        closeAllInputPopups();
        await executeThreadRun(normalizedPrompt, [], {
          threadIdOverride: normalizedRequestThreadId,
          environmentIdOverride: externalRunRequest.environmentId ?? undefined,
          agentIdOverride: externalRunRequest.agentId ?? undefined,
          agentNameOverride: externalRunRequest.agentName ?? undefined,
          quotedSelection: externalRunRequest.quotedSelection || null,
          resolvedAttachmentsOverride: Array.isArray(externalRunRequest.attachments) ? externalRunRequest.attachments : undefined,
          githubRepoOverride: externalRunRequest.githubRepo ?? undefined,
          enabledSkillsOverride: externalRunRequest.enabledSkills ?? undefined,
          displayPromptOverride: normalizedDisplayPrompt,
        });
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        if (consumeIntentionalStopAbort(normalizedError, normalizedRequestThreadId)) {
          return;
        }
        setInlineError(normalizedError.message);
        try {
          onRunError?.(normalizedError, normalizedRequestThreadId);
        } catch (callbackError) {
          reportRunnerLifecycleCallbackError("onRunError", callbackError);
        }
      } finally {
        setIsPreparingRun(false);
      }
    })();
  }, [
    currentThreadId,
    disabled,
    externalRunRequest,
    hasApiKey,
    normalizedBackendUrl,
    onExternalRunRequestHandled,
    onRunError,
  ]);

  async function executeThreadContextAction(
    action: RunnerChatThreadContextAction,
    options?: { prompt?: string; commandText?: string }
  ) {
    const resolvedThreadId = currentThreadId;
    if (!normalizedBackendUrl) {
      throw new Error("backendUrl is required.");
    }
    if (!apiKey) {
      throw new Error("apiKey is required.");
    }
    if (!resolvedThreadId) {
      throw new Error("Start a conversation first before using this context action.");
    }

    setThreadContextActionLoading(action);
    setThreadContextDetailsError(null);
    let pendingNoticeTurnId: string | null = null;

    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    headers.set("Content-Type", "application/json");

    try {
      if (action === "compact") {
        pendingNoticeTurnId = appendPendingThreadContextActionNotice("compact", "Compacting context", {
          prompt: options?.commandText || formatThreadContextCommandText("compact", options?.prompt),
        });
      }

      const response = await fetch(`${normalizedBackendUrl}/threads/${encodeURIComponent(resolvedThreadId)}/context/actions`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          action,
          ...(options?.prompt ? { prompt: options.prompt } : {}),
        }),
      });
      const body = await response.text();
      let parsed: {
        action?: {
          type?: RunnerChatThreadContextAction;
          message?: string;
          responseText?: string;
          sessionId?: string | null;
          thread?: { id: string; title?: string };
        };
        message?: string;
        error?: string;
      } = {};
      try {
        parsed = body ? JSON.parse(body) : {};
      } catch {
        parsed = {};
      }

      if (!response.ok) {
        throw new Error(parsed.message || parsed.error || `Failed to execute ${action} (${response.status})`);
      }

      const actionPayload = parsed.action || {};
      const commandText = options?.commandText || `/${action}`;
      const responseText = actionPayload.responseText || actionPayload.message || `Completed /${action}.`;

      if (action === "fork") {
        const nextThreadId = actionPayload.thread?.id;
        if (!nextThreadId) {
          throw new Error("Fork completed without returning a new thread.");
        }
        setLocalThreadId(nextThreadId);
        try {
          onThreadIdChange?.(nextThreadId);
        } catch (error) {
          reportRunnerLifecycleCallbackError("onThreadIdChange", error);
        }
        appendThreadContextActionNotice("fork", "Forked into a new conversation");
        refreshThreadContextDetailsInBackground(nextThreadId);
        return;
      }

      if (action === "clear") {
        setThreadContext(null);
        setThreadContextDetails(null);
        appendThreadContextActionNotice("clear", "Context was cleared");
      } else if (action === "compact") {
        if (pendingNoticeTurnId) {
          updateThreadContextActionNotice(pendingNoticeTurnId, "Context was compacted");
        } else {
          appendThreadContextActionNotice("compact", "Context was compacted");
        }
      } else if (action === "btw") {
        appendSyntheticActionTurn(commandText, responseText, "Asked side question", {
          presentation: "btw",
        });
      }

      refreshThreadContextDetailsInBackground(resolvedThreadId);
    } catch (error) {
      if (action === "compact" && pendingNoticeTurnId) {
        updateThreadContextActionNotice(pendingNoticeTurnId, "Failed to compact context", { failed: true });
      }
      throw error;
    } finally {
      setThreadContextActionLoading(null);
    }
  }

  useEffect(() => {
    mountRunnerChatStyles();
  }, []);

  useEffect(() => {
    turnsRef.current = turns;
  }, [turns]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const className = "tb-runner-document-preview-active";
    document.body.classList.toggle(className, Boolean(previewedDocumentAttachment));
    return () => {
      document.body.classList.remove(className);
    };
  }, [previewedDocumentAttachment]);

  useEffect(() => {
    setDocumentPreviewDrawerWidth(null);
    documentPreviewResizeStateRef.current = null;
  }, [previewedDocumentAttachment?.id]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const resizeState = documentPreviewResizeStateRef.current;
      if (!resizeState) {
        return;
      }
      const minWidth = 360;
      const maxWidth = Math.max(minWidth, Math.min(960, window.innerWidth - 220));
      const nextWidth = Math.max(minWidth, Math.min(maxWidth, resizeState.startWidth + (resizeState.startX - event.clientX)));
      setDocumentPreviewDrawerWidth(nextWidth);
    }

    function stopResize() {
      documentPreviewResizeStateRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (threadHistoryMeasureFrameRef.current !== null) {
        window.cancelAnimationFrame(threadHistoryMeasureFrameRef.current);
      }
      if (mainPopupAnimationTimerRef.current !== null) {
        window.clearTimeout(mainPopupAnimationTimerRef.current);
      }
      if (sidePopupAnimationTimerRef.current !== null) {
        window.clearTimeout(sidePopupAnimationTimerRef.current);
      }
      if (composerQuotedSelectionAnimationTimerRef.current !== null) {
        window.clearTimeout(composerQuotedSelectionAnimationTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (composerQuotedSelectionAnimationTimerRef.current !== null) {
      window.clearTimeout(composerQuotedSelectionAnimationTimerRef.current);
      composerQuotedSelectionAnimationTimerRef.current = null;
    }

    if (composerQuotedSelection) {
      setRenderedComposerQuotedSelection(composerQuotedSelection);
      const animationFrameId = window.requestAnimationFrame(() => {
        setIsComposerQuotedSelectionVisible(true);
      });
      return () => window.cancelAnimationFrame(animationFrameId);
    }

    setIsComposerQuotedSelectionVisible(false);
    if (!renderedComposerQuotedSelection) {
      return;
    }

    composerQuotedSelectionAnimationTimerRef.current = window.setTimeout(() => {
      setRenderedComposerQuotedSelection(null);
      composerQuotedSelectionAnimationTimerRef.current = null;
    }, COMPOSER_QUOTED_SELECTION_ANIMATION_MS);

    return () => {
      if (composerQuotedSelectionAnimationTimerRef.current !== null) {
        window.clearTimeout(composerQuotedSelectionAnimationTimerRef.current);
        composerQuotedSelectionAnimationTimerRef.current = null;
      }
    };
  }, [composerQuotedSelection, renderedComposerQuotedSelection]);

  useEffect(() => {
    if (threadId) {
      if (threadId !== localThreadId) {
        initializedThreadHistoryIdRef.current = null;
        setActiveThreadEnvironmentId(null);
        setActiveThreadEnvironmentName(null);
      }
      setLocalThreadId(threadId);
      setEditingTurnId(null);
      setEditingTurnDraft("");
      setComposerQuotedSelection(null);
      setQuotedSelectionPopup(null);
      setPreviewedDocumentAttachment(null);
      resetForkConfiguration();
    }
  }, [localThreadId, threadId]);

  useEffect(() => {
    if (currentThreadId) {
      return;
    }
    setActiveThreadEnvironmentId(null);
    setActiveThreadEnvironmentName(null);
  }, [currentThreadId]);

  useEffect(() => {
    if (!quotedSelectionPopup) {
      return;
    }

    function handleDocumentMouseDown(event: globalThis.MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) {
        setQuotedSelectionPopup(null);
        return;
      }
      if (quotedSelectionPopupRef.current?.contains(target)) {
        return;
      }
      setQuotedSelectionPopup(null);
    }

    function handleViewportChange() {
      setQuotedSelectionPopup(null);
    }

    document.addEventListener("mousedown", handleDocumentMouseDown);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [quotedSelectionPopup]);

  useEffect(() => {
    let cancelled = false;
    let hydrationApplied = false;
    let previewRendered = false;
    const hasPendingExternalRunForThread =
      Boolean(externalRunRequest)
      && handledExternalRunRequestTokenRef.current !== externalRunRequest?.token
      && String(externalRunRequest?.threadId || "").trim() === String(threadId || "").trim()
      && String(externalRunRequest?.prompt || "").trim().length > 0;
    const isLocallyOwnedExecutionForRequestedThread =
      Boolean(threadId) &&
      locallyOwnedExecutionThreadIdRef.current === threadId;

    if (!threadId || !hasApiKey || hasPendingExternalRunForThread || isLocallyOwnedExecutionForRequestedThread) {
      setIsThreadHistoryLoading(false);
      return () => {
        cancelled = true;
      };
    }

    if (initializedThreadHistoryIdRef.current === threadId && turnsRef.current.length > 0) {
      setIsThreadHistoryLoading(false);
      return () => {
        cancelled = true;
      };
    }

    clear();
    setIsThreadHistoryLoading(true);
    setInlineError(null);
    setExpandedStepRows({});

    const threadMessagesPromise = fetchAllThreadMessages({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      threadId,
      requestHeaders,
    });

    void threadMessagesPromise
      .then((messages) => {
        if (cancelled || hydrationApplied) {
          return;
        }
        const previewTurns = buildHydratedTurnsFromMessages(messages, {
          agentName: displayedAgentLabel,
          environmentName: displayedEnvironmentLabel,
          backendUrl: normalizedBackendUrl,
        });
        if (previewTurns.length === 0) {
          return;
        }
        previewRendered = true;
        initializedThreadHistoryIdRef.current = threadId;
        setTurns(previewTurns);
        setExpandedTurns((previousExpandedTurns) =>
          mapExpandedTurns(previousExpandedTurns, turnsRef.current, previewTurns, { collapseOnNewRunSummary: true })
        );
      })
      .catch(() => undefined);

    void fetchThreadHydrationPayload({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      threadId,
      requestHeaders,
      messagesPromise: threadMessagesPromise.catch(() => []),
    })
      .then((payload) => {
        if (cancelled) return;
        hydrationApplied = true;
        threadHydrationCacheRef.current = payload;
        setHydratedThreadStatus(payload.threadStatus ?? null);
        applyHydratedThreadEnvironment(payload);
        return buildHydratedTurnsFromPayload(payload, {
          agentName: displayedAgentLabel,
          environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
          backendUrl: normalizedBackendUrl,
        });
      })
      .catch(() =>
        fetchAllThreadMessages({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId,
          requestHeaders,
        }).then((messages) =>
          buildHydratedTurnsFromMessages(messages, {
            agentName: displayedAgentLabel,
            environmentName: displayedEnvironmentLabel,
            backendUrl: normalizedBackendUrl,
          })
        )
      )
      .then((hydratedTurns) => {
        if (cancelled || !hydratedTurns) return;
        initializedThreadHistoryIdRef.current = threadId;
        const mergedTurns = mergeHydratedTurns(turnsRef.current, hydratedTurns);
        setTurns(mergedTurns);
        setExpandedTurns((previousExpandedTurns) =>
          mapExpandedTurns(previousExpandedTurns, turnsRef.current, mergedTurns, {
            defaultLatestExpanded: true,
            collapseOnNewRunSummary: true,
          })
        );
      })
      .catch((error) => {
        if (cancelled) return;
        if (previewRendered) {
          return;
        }
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setTurns([]);
        setExpandedTurns({});
        setInlineError(normalizedError.message || "Failed to load thread history.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsThreadHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    apiKey,
    clear,
    externalRunRequest,
    hasApiKey,
    hasRunningTurn,
    isPreparingRun,
    normalizedBackendUrl,
    pendingQueuedMessages.length,
    requestHeaders,
    threadId,
  ]);

  useEffect(() => {
    setThreadContextDetails(null);
    setThreadContextDetailsError(null);
    setThreadContextNativeError(null);
    setThreadContextAvailableActions(DEFAULT_THREAD_CONTEXT_ACTIONS);
    setDeepResearchSessions([]);
    setHydratedThreadStatus(null);
    setPendingQueuedMessages([]);
    stopRequestedThreadIdRef.current = null;
    setIsStoppingRun(false);
    setEditingTurnId(null);
    setEditingTurnDraft("");
    setForkingTurnId(null);
    setPendingEditConfirmation(null);
    isDrainingQueuedRunsRef.current = false;
    if (locallyOwnedExecutionThreadIdRef.current !== currentThreadId) {
      locallyOwnedExecutionThreadIdRef.current = null;
    }
  }, [currentThreadId]);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | null = null;
    const resolvedThreadId = String(currentThreadId || "").trim();

    if (!resolvedThreadId || !hasApiKey || !normalizedBackendUrl) {
      setDeepResearchSessions([]);
      return () => {
        cancelled = true;
      };
    }

    const poll = async () => {
      try {
        await refreshDeepResearchSessions(resolvedThreadId);
      } catch {
        // Keep existing session state on transient fetch failures.
      } finally {
        if (!cancelled) {
          pollTimer = window.setTimeout(poll, 3000);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (pollTimer !== null) {
        window.clearTimeout(pollTimer);
      }
    };
  }, [apiKey, currentThreadId, hasApiKey, normalizedBackendUrl, requestHeaders]);

  useEffect(() => {
    let cancelled = false;

    if (!currentThreadId || !hasApiKey || isRunning) {
      if (!currentThreadId) {
        setThreadContext(null);
      }
      setIsThreadContextLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsThreadContextLoading(true);
    void fetchThreadContextEstimate(currentThreadId)
      .then((context) => {
        if (!cancelled) {
          setThreadContext(context);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setThreadContext(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsThreadContextLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, currentThreadId, hasApiKey, isRunning, normalizedBackendUrl, requestHeaders]);

  useEffect(() => {
    const hasPendingExternalRunForThread =
      Boolean(externalRunRequest)
      && handledExternalRunRequestTokenRef.current !== externalRunRequest?.token
      && String(externalRunRequest?.threadId || "").trim() === String(threadId || "").trim()
      && String(externalRunRequest?.prompt || "").trim().length > 0;
    if (
      !hasApiKey ||
      !normalizedBackendUrl ||
      !effectiveEnvironmentId ||
      !isPassiveWarmEnvironmentReady ||
      !isPassiveWarmAgentReady ||
      isPreparingRun ||
      isRunning ||
      hasPendingExternalRunForThread
    ) {
      lastEnvironmentStartRequestKeyRef.current = null;
      return;
    }
    const requestKey = JSON.stringify({
      environmentId: effectiveEnvironmentId,
      agentId: effectiveAgentId || null,
      enabledSkills: enabledSkillsPayload,
    });
    if (lastEnvironmentStartRequestKeyRef.current === requestKey) {
      return;
    }
    lastEnvironmentStartRequestKeyRef.current = requestKey;
    void startEnvironment({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      requestHeaders,
      environmentId: effectiveEnvironmentId,
      agentId: effectiveAgentId,
      enabledSkills: enabledSkillsPayload,
    }).catch(() => undefined);
  }, [
    apiKey,
    effectiveAgentId,
    effectiveEnvironmentId,
    enabledSkillsPayload,
    externalRunRequest,
    hasApiKey,
    isPassiveWarmAgentReady,
    isPassiveWarmEnvironmentReady,
    isPreparingRun,
    isRunning,
    normalizedBackendUrl,
    requestHeaders,
    threadId,
  ]);

  useEffect(() => {
    if (renderedMainPopup !== "context") {
      return;
    }
    if (threadContextDetails?.threadId === currentThreadId && !threadContextDetailsError) {
      return;
    }
    void refreshThreadContextDetails();
  }, [
    apiKey,
    currentThreadId,
    hasApiKey,
    normalizedBackendUrl,
    renderedMainPopup,
    requestHeaders,
    threadContextDetails?.threadId,
    threadContextDetailsError,
  ]);

  useEffect(() => {
    if (mainPopupAnimationTimerRef.current !== null) {
      window.clearTimeout(mainPopupAnimationTimerRef.current);
      mainPopupAnimationTimerRef.current = null;
    }

    if (targetMainPopup === null) {
      if (renderedMainPopup !== null) {
        setMainPopupPhase("exit");
        mainPopupAnimationTimerRef.current = window.setTimeout(() => {
          setRenderedMainPopup(null);
          setMainPopupPhase("idle");
          mainPopupAnimationTimerRef.current = null;
        }, POPUP_ANIMATION_DURATION_MS);
      }
      return;
    }

    setRenderedMainPopup(targetMainPopup);
    setMainPopupPhase("enter");
    mainPopupAnimationTimerRef.current = window.setTimeout(() => {
      setMainPopupPhase("idle");
      mainPopupAnimationTimerRef.current = null;
    }, POPUP_ANIMATION_DURATION_MS);
  }, [renderedMainPopup, targetMainPopup]);

  useEffect(() => {
    if (sidePopupAnimationTimerRef.current !== null) {
      window.clearTimeout(sidePopupAnimationTimerRef.current);
      sidePopupAnimationTimerRef.current = null;
    }

    if (targetSidePopup === null) {
      if (renderedSidePopup !== null) {
        setSidePopupPhase("exit");
        sidePopupAnimationTimerRef.current = window.setTimeout(() => {
          setRenderedSidePopup(null);
          setSidePopupPhase("idle");
          setSidePopupExitDirection("left");
          sidePopupAnimationTimerRef.current = null;
        }, POPUP_ANIMATION_DURATION_MS);
      }
      return;
    }

    setSidePopupExitDirection("left");
    setRenderedSidePopup(targetSidePopup);
    setSidePopupPhase("enter");
    sidePopupAnimationTimerRef.current = window.setTimeout(() => {
      setSidePopupPhase("idle");
      sidePopupAnimationTimerRef.current = null;
    }, POPUP_ANIMATION_DURATION_MS);
  }, [renderedSidePopup, targetSidePopup]);

  useEffect(() => {
    if (!showForkEnvironmentPopup) {
      return;
    }

    const handlePointerDown = (event: Event) => {
      const target = event.target as Node | null;
      if (forkEnvironmentPopupRef.current && target && !forkEnvironmentPopupRef.current.contains(target)) {
        setShowForkEnvironmentPopup(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showForkEnvironmentPopup]);

  useEffect(() => {
    if (!agents.length) return;
    setSelectedAgentId((current) => {
      if (agentId && agents.some((agent) => agent.id === agentId)) {
        return agentId;
      }
      if (current && agents.some((agent) => agent.id === current)) {
        return current;
      }
      return agents[0]?.id || "";
    });
  }, [agentId, agents]);

  useEffect(() => {
    if (!agents.length) {
      setInitialAgentTopId(null);
      return;
    }
    if (initialAgentTopId && agents.some((agent) => agent.id === initialAgentTopId)) {
      return;
    }
    if (agentId && agents.some((agent) => agent.id === agentId)) {
      setInitialAgentTopId(agentId);
      return;
    }
    if (selectedAgentId && agents.some((agent) => agent.id === selectedAgentId)) {
      setInitialAgentTopId(selectedAgentId);
      return;
    }
    setInitialAgentTopId(agents[0]?.id || null);
  }, [agentId, agents, initialAgentTopId, selectedAgentId]);

  useEffect(() => {
    if (activeInputPopup !== "agent") {
      return;
    }
    const nextSelectedAgent =
      agents.find((agent) => agent.id === selectedAgentId) ||
      (agentId ? agents.find((agent) => agent.id === agentId) : null) ||
      agents[0] ||
      null;
    setAgentPopupMode(getRunnerAgentSelectorMode(nextSelectedAgent));
  }, [activeInputPopup, agentId, agents, selectedAgentId]);

  useEffect(() => {
    if (!availableEnvironments.length) return;
    setSelectedEnvironmentId((current) => {
      if (
        scopedActiveThreadEnvironmentId &&
        availableEnvironments.some((environment) => environment.id === scopedActiveThreadEnvironmentId)
      ) {
        return scopedActiveThreadEnvironmentId;
      }
      if (
        effectiveWorkspaceSelectorMode === "projects" &&
        selectedProjectEnvironmentId &&
        availableEnvironments.some((environment) => environment.id === selectedProjectEnvironmentId)
      ) {
        return selectedProjectEnvironmentId;
      }
      if (current && availableEnvironments.some((environment) => environment.id === current)) {
        return current;
      }
      if (environmentId && availableEnvironments.some((environment) => environment.id === environmentId)) {
        return environmentId;
      }
      return availableEnvironments.find((environment) => environment.isDefault)?.id || availableEnvironments[0]?.id || "";
    });
  }, [availableEnvironments, effectiveWorkspaceSelectorMode, environmentId, scopedActiveThreadEnvironmentId, selectedProjectEnvironmentId]);

  useEffect(() => {
    if (!useComputerAgentsMode) {
      return;
    }

    const configuredProjectId = String(projectsConfig?.selectedProjectId || "").trim();
    if (!configuredProjectId) {
      lastAppliedControlledProjectIdRef.current = configuredProjectId;
      return;
    }
    if (lastAppliedControlledProjectIdRef.current === configuredProjectId) {
      return;
    }

    const persistedWorkspaceSelection = !workspacePreferenceAppliedRef.current
      ? loadPersistedWorkspaceSelection(workspaceSelectionStorageKey)
      : null;
    const hasActiveProjectWorkspaceSelection =
      (workspaceSelectorMode === "projects" && Boolean(selectedProjectId)) ||
      (persistedWorkspaceSelection?.mode === "projects" && Boolean(persistedWorkspaceSelection.projectId));
    if (!hasActiveProjectWorkspaceSelection) {
      lastAppliedControlledProjectIdRef.current = configuredProjectId;
      return;
    }

    const configuredProject = availableProjects.find((project) => project.id === configuredProjectId) || null;
    if (!configuredProject) {
      return;
    }

    const configuredEnvironmentId = getRunnerProjectEnvironmentId(configuredProject);
    if (!configuredEnvironmentId) {
      return;
    }

    lastAppliedControlledProjectIdRef.current = configuredProjectId;
    workspacePreferenceAppliedRef.current = true;
    setWorkspaceSelectorMode("projects");
    setSelectedProjectId(configuredProjectId);
    setSelectedEnvironmentId(configuredEnvironmentId);
    persistWorkspaceSelection(workspaceSelectionStorageKey, {
      mode: "projects",
      projectId: configuredProjectId,
      environmentId: configuredEnvironmentId,
    });
  }, [availableProjects, projectsConfig?.selectedProjectId, selectedProjectId, useComputerAgentsMode, workspaceSelectionStorageKey, workspaceSelectorMode]);

  useEffect(() => {
    if (!useComputerAgentsMode || workspacePreferenceAppliedRef.current) {
      return;
    }

    const persisted = loadPersistedWorkspaceSelection(workspaceSelectionStorageKey);
    if (!persisted) {
      workspacePreferenceAppliedRef.current = true;
      return;
    }

    if (persisted.mode === "projects" && persisted.projectId) {
      if (availableProjects.length === 0) {
        return;
      }
      const persistedProject = availableProjects.find((project) => project.id === persisted.projectId) || null;
      if (persistedProject) {
        const persistedEnvironmentId = getRunnerProjectEnvironmentId(persistedProject);
        if (persistedEnvironmentId) {
          setWorkspaceSelectorMode("projects");
          setSelectedProjectId(persisted.projectId);
          setSelectedEnvironmentId(persistedEnvironmentId);
        }
      }
      workspacePreferenceAppliedRef.current = true;
      return;
    }

    if (persisted.mode === "computers" && persisted.environmentId) {
      if (availableEnvironments.length === 0) {
        return;
      }
      if (availableEnvironments.some((environment) => environment.id === persisted.environmentId)) {
        setWorkspaceSelectorMode("computers");
        setSelectedProjectId("");
        setSelectedEnvironmentId(persisted.environmentId);
      }
    }
    workspacePreferenceAppliedRef.current = true;
  }, [availableEnvironments, availableProjects, useComputerAgentsMode, workspaceSelectionStorageKey]);

  useEffect(() => {
    if (!selectedProjectId || availableProjects.length === 0) {
      return;
    }
    if (availableProjects.some((project) => project.id === selectedProjectId)) {
      return;
    }
    setSelectedProjectId("");
    setWorkspaceSelectorMode("computers");
  }, [availableProjects, selectedProjectId]);

  useEffect(() => {
    if (!availableEnvironments.length) {
      setInitialEnvironmentTopId(null);
      return;
    }
    if (initialEnvironmentTopId && availableEnvironments.some((environment) => environment.id === initialEnvironmentTopId)) {
      return;
    }
    if (
      scopedActiveThreadEnvironmentId &&
      availableEnvironments.some((environment) => environment.id === scopedActiveThreadEnvironmentId)
    ) {
      setInitialEnvironmentTopId(scopedActiveThreadEnvironmentId);
      return;
    }
    if (environmentId && availableEnvironments.some((environment) => environment.id === environmentId)) {
      setInitialEnvironmentTopId(environmentId);
      return;
    }
    if (selectedEnvironmentId && availableEnvironments.some((environment) => environment.id === selectedEnvironmentId)) {
      setInitialEnvironmentTopId(selectedEnvironmentId);
      return;
    }
    setInitialEnvironmentTopId(availableEnvironments.find((environment) => environment.isDefault)?.id || availableEnvironments[0]?.id || null);
  }, [availableEnvironments, environmentId, initialEnvironmentTopId, scopedActiveThreadEnvironmentId, selectedEnvironmentId]);

  useEffect(() => {
    const persisted = loadPersistedEnabledSkillIds(enabledSkillsStorageKey);
    const nextEnabledSkillIds = persisted !== null ? persisted : defaultEnabledSkillIds(normalizedSkills);
    setEnabledSkillIds((current) => (areStringArraysEqual(current, nextEnabledSkillIds) ? current : nextEnabledSkillIds));
  }, [enabledSkillsStorageKey, normalizedSkills]);

  useEffect(() => {
    persistEnabledSkillIds(enabledSkillsStorageKey, enabledSkillIds);
  }, [enabledSkillIds, enabledSkillsStorageKey]);

  useEffect(() => {
    if (activeInputPopup !== "skills" || !fetchCustomSkills || customSkillsLoaded || isLoadingCustomSkills) {
      return;
    }

    let cancelled = false;
    setIsLoadingCustomSkills(true);

    void fetchCustomSkills()
      .then((loadedSkills) => {
        if (cancelled) return;
        const filtered = (loadedSkills || []).filter((skill) => skill.isCustom);
        setCustomSkills(filtered);
        setCustomSkillsLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setCustomSkills([]);
        setCustomSkillsLoaded(true);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCustomSkills(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeInputPopup, customSkillsLoaded, fetchCustomSkills]);

  useEffect(() => {
    setCustomSkills([]);
    setCustomSkillsLoaded(false);
  }, [fetchCustomSkills]);

  useEffect(() => {
    setSelectedGithubRepositoryId((current) => {
      if (githubConfig?.selectedRepositoryId && githubRepositories.some((repository) => repository.id === githubConfig.selectedRepositoryId)) {
        return githubConfig.selectedRepositoryId;
      }
      if (current && githubRepositories.some((repository) => repository.id === current)) {
        return current;
      }
      return githubRepositories[0]?.id || "";
    });
  }, [githubConfig?.selectedRepositoryId, githubRepositories]);

  useEffect(() => {
    setSelectedGithubContextId((current) => {
      if (githubConfig?.selectedContextId && githubContexts.some((context) => context.id === githubConfig.selectedContextId)) {
        return githubConfig.selectedContextId;
      }
      if (current && githubContexts.some((context) => context.id === current)) {
        return current;
      }
      return githubContexts[0]?.id || "";
    });
  }, [githubConfig?.selectedContextId, githubContexts]);

  useEffect(() => {
    setSelectedNotionDatabaseId((current) => {
      if (notionConfig?.selectedDatabaseId && notionDatabases.some((database) => database.id === notionConfig.selectedDatabaseId)) {
        return notionConfig.selectedDatabaseId;
      }
      if (current && notionDatabases.some((database) => database.id === current)) {
        return current;
      }
      return "";
    });
  }, [notionConfig?.selectedDatabaseId, notionDatabases]);

  useEffect(() => {
    setSelectedSchedulePresetId((current) => {
      if (current && schedulePresets.some((preset) => preset.id === current)) return current;
      return schedulePresets[0]?.id || "";
    });
  }, [schedulePresets]);

  useLayoutEffect(() => {
    shouldAutoScrollLogsRef.current = true;
    isProgrammaticLogsAutoScrollRef.current = false;
    previousLogsScrollHeightRef.current = 0;
    autoScrollSettleFramesRef.current = 0;
    threadHydrationCacheRef.current = null;
    if (autoScrollAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollAnimationFrameRef.current);
      autoScrollAnimationFrameRef.current = null;
    }
  }, [currentThreadId]);

  useEffect(() => {
    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }
    const resolvedScrollElement = scrollElement;

    function handleLogViewportScroll() {
      const isPinnedToBottom = isLogViewportPinnedToBottom(resolvedScrollElement);
      if (isProgrammaticLogsAutoScrollRef.current) {
        shouldAutoScrollLogsRef.current = true;
        if (isPinnedToBottom) {
          isProgrammaticLogsAutoScrollRef.current = false;
        }
        return;
      }
      shouldAutoScrollLogsRef.current = isPinnedToBottom;
    }

    function handleLogViewportUserIntent() {
      if (!isLogViewportPinnedToBottom(resolvedScrollElement)) {
        isProgrammaticLogsAutoScrollRef.current = false;
      }
    }

    handleLogViewportScroll();
    resolvedScrollElement.addEventListener("scroll", handleLogViewportScroll, { passive: true });
    resolvedScrollElement.addEventListener("wheel", handleLogViewportUserIntent, { passive: true });
    resolvedScrollElement.addEventListener("touchmove", handleLogViewportUserIntent, { passive: true });

    return () => {
      resolvedScrollElement.removeEventListener("scroll", handleLogViewportScroll);
      resolvedScrollElement.removeEventListener("wheel", handleLogViewportUserIntent);
      resolvedScrollElement.removeEventListener("touchmove", handleLogViewportUserIntent);
    };
  }, [currentThreadId]);

  const scheduleLogsAutoScrollToBottom = useCallback((settleFrames = LOGS_AUTO_SCROLL_SETTLE_FRAME_COUNT) => {
    if (typeof window === "undefined") {
      return;
    }
    if (autoScrollAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(autoScrollAnimationFrameRef.current);
    }
    isProgrammaticLogsAutoScrollRef.current = true;
    autoScrollSettleFramesRef.current = Math.max(settleFrames, 0);

    const applyPinnedLogsAutoScroll = () => {
      const scrollElement = logsRef.current;
      if (!scrollElement || !shouldAutoScrollLogsRef.current) {
        autoScrollAnimationFrameRef.current = null;
        autoScrollSettleFramesRef.current = 0;
        return;
      }

      const prefersReducedMotion =
        typeof window !== "undefined"
        && typeof window.matchMedia === "function"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (typeof scrollElement.scrollTo === "function") {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      } else {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
      previousLogsScrollHeightRef.current = scrollElement.scrollHeight;

      if (autoScrollSettleFramesRef.current > 0) {
        autoScrollSettleFramesRef.current -= 1;
        autoScrollAnimationFrameRef.current = window.requestAnimationFrame(applyPinnedLogsAutoScroll);
        return;
      }

      if (isLogViewportPinnedToBottom(scrollElement)) {
        isProgrammaticLogsAutoScrollRef.current = false;
      }
      autoScrollAnimationFrameRef.current = null;
    };

    autoScrollAnimationFrameRef.current = window.requestAnimationFrame(applyPinnedLogsAutoScroll);
  }, []);

  useLayoutEffect(() => {
    if (!logsRef.current) return;
    if (hasCustomEmptyStateActive) {
      logsRef.current.scrollTop = 0;
      previousLogsScrollHeightRef.current = logsRef.current.scrollHeight;
      return;
    }
    if (!shouldAutoScrollLogsRef.current) return;
    const scrollElement = logsRef.current;
    const nextScrollHeight = scrollElement.scrollHeight;
    previousLogsScrollHeightRef.current = nextScrollHeight;
    scheduleLogsAutoScrollToBottom();
  }, [hasCustomEmptyStateActive, logs, scheduleLogsAutoScrollToBottom, turns]);

  useLayoutEffect(() => {
    const contentElement = contentWidthRef.current;
    if (!contentElement || typeof ResizeObserver === "undefined" || hasCustomEmptyStateActive) {
      return;
    }
    const resolvedContentElement = contentElement;
    const resizeObserver = new ResizeObserver(() => {
      if (!shouldAutoScrollLogsRef.current) {
        return;
      }
      scheduleLogsAutoScrollToBottom();
    });
    resizeObserver.observe(resolvedContentElement);
    return () => {
      resizeObserver.disconnect();
    };
  }, [currentThreadId, hasCustomEmptyStateActive, scheduleLogsAutoScrollToBottom]);

  useEffect(() => {
    return () => {
      if (autoScrollAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(autoScrollAnimationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const hasRunningTurn = turns.some((turn) => isRunningTurnStatus(turn.status));
    if (!hasRunningTurn) return;
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [turns]);

  useEffect(() => {
    if (!isListening || recordingStartedAtMs === null) {
      setRecordingElapsedSeconds(0);
      return;
    }

    setRecordingElapsedSeconds(Math.max(0, Math.floor((Date.now() - recordingStartedAtMs) / 1000)));
    const timer = window.setInterval(() => {
      setRecordingElapsedSeconds(Math.max(0, Math.floor((Date.now() - recordingStartedAtMs) / 1000)));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isListening, recordingStartedAtMs]);

  useEffect(() => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const computed = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const singleRowHeight = Math.ceil(lineHeight + paddingTop + paddingBottom);

    textarea.style.height = "auto";
    textarea.style.height = `${
      input.length === 0
        ? singleRowHeight
        : Math.max(singleRowHeight, Math.min(textarea.scrollHeight, 220))
    }px`;
  }, [input]);

  useEffect(() => {
    if (!editingTextareaRef.current || !editingTurnId) return;
    const textarea = editingTextareaRef.current;
    const computed = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(computed.lineHeight) || 20;
    const paddingTop = Number.parseFloat(computed.paddingTop) || 0;
    const paddingBottom = Number.parseFloat(computed.paddingBottom) || 0;
    const singleRowHeight = Math.ceil(lineHeight + paddingTop + paddingBottom);
    const maxHeight = 300;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(singleRowHeight, Math.min(textarea.scrollHeight, maxHeight))}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  }, [editingTurnDraft, editingTurnId]);

  useEffect(() => {
    attachmentsRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    currentInputRef.current = input;
  }, [input]);

  useEffect(() => {
    if (!autoFocusComposer) {
      return;
    }
    focusComposerSoon({ preventScroll: hasCustomEmptyStateActive });
  }, [autoFocusComposer, hasCustomEmptyStateActive]);

  useEffect(() => {
    if (!enableBacklogSubtaskCommand || !backlogSubtaskCommand?.ticketNumber) {
      return;
    }
    if (appliedBacklogSubtaskCommandTokenRef.current === backlogSubtaskCommand.token) {
      return;
    }
    appliedBacklogSubtaskCommandTokenRef.current = backlogSubtaskCommand.token;
    closeAllInputPopups();
    stageBacklogSubtaskCommand(backlogSubtaskCommand.ticketNumber);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [backlogSubtaskCommand, enableBacklogSubtaskCommand]);

  useEffect(() => {
    if (!enableBacklogMissionControlCommand || !backlogMissionControlCommand) {
      return;
    }
    if (appliedBacklogMissionControlCommandTokenRef.current === backlogMissionControlCommand.token) {
      return;
    }
    appliedBacklogMissionControlCommandTokenRef.current = backlogMissionControlCommand.token;
    closeAllInputPopups();
    stageBacklogMissionControlCommand();
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [backlogMissionControlCommand, enableBacklogMissionControlCommand]);

  useEffect(() => {
    if (!enableResourceCreationCommand || !resourceCreationCommand) {
      return;
    }
    if (appliedResourceCreationCommandTokenRef.current === resourceCreationCommand.token) {
      return;
    }
    appliedResourceCreationCommandTokenRef.current = resourceCreationCommand.token;
    closeAllInputPopups();
    stageResourceCreationCommand(resourceCreationCommand.type);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [enableResourceCreationCommand, resourceCreationCommand]);

  useEffect(() => {
    onResourceCreationCommandChange?.(stagedResourceCreationCommand?.action || null);
  }, [onResourceCreationCommandChange, stagedResourceCreationCommand]);

  useEffect(() => {
    if (!enableAgentCreationCommand || !agentCreationCommand) {
      return;
    }
    if (appliedAgentCreationCommandTokenRef.current === agentCreationCommand.token) {
      return;
    }
    appliedAgentCreationCommandTokenRef.current = agentCreationCommand.token;
    closeAllInputPopups();
    stageAgentCreationCommand(agentCreationCommand.type);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [agentCreationCommand, enableAgentCreationCommand]);

  useEffect(() => {
    onAgentCreationCommandChange?.(stagedAgentCreationCommand?.action || null);
  }, [onAgentCreationCommandChange, stagedAgentCreationCommand]);

  useEffect(() => {
    if (!enableSkillCreationCommand || !skillCreationCommand) {
      return;
    }
    if (appliedSkillCreationCommandTokenRef.current === skillCreationCommand.token) {
      return;
    }
    appliedSkillCreationCommandTokenRef.current = skillCreationCommand.token;
    closeAllInputPopups();
    stageSkillCreationCommand(skillCreationCommand.type);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }, [enableSkillCreationCommand, skillCreationCommand]);

  useEffect(() => {
    onSkillCreationCommandChange?.(stagedSkillCreationCommand?.action || null);
  }, [onSkillCreationCommandChange, stagedSkillCreationCommand]);

  useEffect(() => {
    return () => {
      for (const attachment of attachmentsRef.current) {
        revokeAttachmentPreview(attachment);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      const socket = speechSocketRef.current;
      const processorNode = speechProcessorNodeRef.current;
      const sourceNode = speechSourceNodeRef.current;
      const sinkGainNode = speechSinkGainNodeRef.current;
      const stream = speechMediaStreamRef.current;
      const audioContext = speechAudioContextRef.current;

      speechSocketRef.current = null;
      speechSocketReadyRef.current = false;
      speechPendingChunksRef.current = [];
      speechProcessorNodeRef.current = null;
      speechSourceNodeRef.current = null;
      speechSinkGainNodeRef.current = null;
      speechMediaStreamRef.current = null;
      speechAudioContextRef.current = null;
      speechActivityOpenRef.current = false;
      speechLastVoiceMsRef.current = 0;

      processorNode?.disconnect();
      if (processorNode) {
        processorNode.port.onmessage = null;
      }
      sourceNode?.disconnect();
      sinkGainNode?.disconnect();
      stream?.getTracks().forEach((track) => track.stop());
      if (audioContext) {
        void audioContext.close().catch(() => undefined);
      }

      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        socket.close(1000, "Speech-to-text stopped");
      }
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;
    void stopSpeechToText();
  }, [isRunning]);

  async function ensureThread(taskText: string, options?: { reserveLocalExecution?: boolean }): Promise<{
    threadId: string;
    didCreateThread: boolean;
    initialTitle: string | null;
    environmentId: string | null;
  }> {
    if (currentThreadId) {
      return {
        threadId: currentThreadId,
        didCreateThread: false,
        initialTitle: null,
        environmentId: activeThreadEnvironmentId || selectedEnvironment?.id || environmentId || null,
      };
    }

    if (!autoCreateThread) {
      throw new Error("No threadId available. Provide threadId or enable autoCreateThread.");
    }

    const createdThread = await createThread({
      backendUrl: normalizedBackendUrl,
      apiKey,
      requestHeaders,
      appId,
      environmentId: effectiveEnvironmentId,
      projectId: effectiveProjectId,
      agentId: effectiveAgentId,
      title: title || DEFAULT_NEW_THREAD_TITLE,
      metadata: threadMetadata,
      privateMode,
    });

    initializedThreadHistoryIdRef.current = createdThread.threadId;
    if (options?.reserveLocalExecution) {
      locallyOwnedExecutionThreadIdRef.current = createdThread.threadId;
    }
    setLocalThreadId(createdThread.threadId);
    setActiveThreadEnvironmentId(createdThread.environmentId || effectiveEnvironmentId || null);
    setActiveThreadEnvironmentName(selectedEnvironment?.name || null);
    try {
      onThreadIdChange?.(createdThread.threadId);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadIdChange", error);
    }
    if (createdThread.title) {
      try {
        onThreadTitleChange?.(createdThread.threadId, createdThread.title);
      } catch (error) {
        reportRunnerLifecycleCallbackError("onThreadTitleChange", error);
      }
    }
    return {
      threadId: createdThread.threadId,
      didCreateThread: true,
      initialTitle: createdThread.title,
      environmentId: createdThread.environmentId || effectiveEnvironmentId || null,
    };
  }

  function resolveAttachmentUploadEnvironmentId(): string | null {
    if (currentThreadId) {
      return activeThreadEnvironmentId || selectedEnvironment?.id || environmentId || null;
    }
    return effectiveEnvironmentId || selectedEnvironment?.id || environmentId || null;
  }

  function updateTurnAttachmentState(
    attachmentId: string,
    patch: Partial<RunnerTurnAttachment>
  ) {
    setTurns((prev) =>
      prev.map((turn) => {
        if (!turn.attachments?.some((attachment) => attachment.id === attachmentId)) {
          return turn;
        }
        return {
          ...turn,
          attachments: turn.attachments.map((attachment) =>
            attachment.id === attachmentId
              ? {
                  ...attachment,
                  ...patch,
                }
              : attachment
          ),
        };
      })
    );
  }

  function applyAttachmentStatePatch(
    attachmentId: string,
    patch: Partial<LocalAttachment> & Partial<RunnerTurnAttachment>
  ) {
    setAttachments((prev) =>
      prev.map((entry) =>
        entry.id === attachmentId
          ? {
              ...entry,
              ...patch,
            }
          : entry
      )
    );
    updateTurnAttachmentState(attachmentId, patch);
  }

  async function ensureGithubSelectionPrepared(
    attachment: LocalAttachment,
    targetEnvironmentId: string
  ): Promise<RunnerAttachment> {
    if (!attachment.resolvedAttachment) {
      throw new Error("Missing GitHub attachment metadata.");
    }

    const repoFullName = String(attachment.githubRepoFullName || "").trim();
    const branch = String(attachment.githubRef || "").trim() || "main";
    if (!repoFullName) {
      throw new Error("Missing GitHub repository metadata.");
    }

    if (!normalizedBackendUrl || !apiKey.trim()) {
      return attachment.resolvedAttachment;
    }

    const preparationKey = `${targetEnvironmentId}\u0000${repoFullName}\u0000${branch}`;
    let preparationPromise = githubPreparationPromisesRef.current[preparationKey];
    if (!preparationPromise) {
      preparationPromise = (async () => {
        await startEnvironment({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          ...(selectedAgentId ? { agentId: selectedAgentId } : {}),
          force: true,
        });
        await prepareGithubRepositorySelection({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          requestHeaders,
          environmentId: targetEnvironmentId,
          repoFullName,
          branch,
        });
      })().finally(() => {
        delete githubPreparationPromisesRef.current[preparationKey];
      });
      githubPreparationPromisesRef.current[preparationKey] = preparationPromise;
    }

    await preparationPromise;
    return attachment.resolvedAttachment;
  }

  async function prepareGithubRepoForThreadRun(
    repoSelection: {
      repoFullName: string;
      branch: string;
    },
    targetEnvironmentId: string
  ): Promise<void> {
    const repoFullName = String(repoSelection?.repoFullName || "").trim();
    const branch = String(repoSelection?.branch || "").trim() || "main";
    if (!repoFullName || !targetEnvironmentId || !normalizedBackendUrl || !apiKey.trim()) {
      return;
    }

    const preparationKey = `${targetEnvironmentId}\u0000${repoFullName}\u0000${branch}`;
    let preparationPromise = githubPreparationPromisesRef.current[preparationKey];
    if (!preparationPromise) {
      preparationPromise = prepareGithubRepositorySelection({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        requestHeaders,
        environmentId: targetEnvironmentId,
        repoFullName,
        branch,
      }).finally(() => {
        delete githubPreparationPromisesRef.current[preparationKey];
      });
      githubPreparationPromisesRef.current[preparationKey] = preparationPromise;
    }

    await preparationPromise;
  }

  async function resolveSingleAttachment(
    attachment: LocalAttachment,
    environmentIdOverride?: string | null
  ): Promise<RunnerAttachment> {
    if (attachment.integrationSource === "github") {
      const targetEnvironmentId =
        environmentIdOverride === undefined
          ? resolveAttachmentUploadEnvironmentId()
          : environmentIdOverride;
      if (!targetEnvironmentId) {
        throw new Error("Select an environment before attaching GitHub repositories.");
      }
      return ensureGithubSelectionPrepared(attachment, targetEnvironmentId);
    }

    if (attachment.resolvedAttachment) {
      return attachment.resolvedAttachment;
    }

    if (uploadFiles) {
      const uploaded = await uploadFiles([attachment.file]);
      const uploadedAttachment = uploaded[0];
      if (!uploadedAttachment) {
        throw new Error(`Failed to upload ${attachment.file.name}.`);
      }
      return uploadedAttachment;
    }

    if (mapFileToAttachment) {
      return mapFileToAttachment(attachment.file);
    }

    if (normalizedBackendUrl && apiKey.trim()) {
      return uploadAttachment({
        backendUrl: normalizedBackendUrl,
        apiKey: apiKey.trim(),
        requestHeaders,
        file: attachment.file,
        ...(environmentIdOverride ? { environmentId: environmentIdOverride } : {}),
      });
    }

    return defaultAttachmentFromFile(attachment.file);
  }

  function beginAttachmentUpload(
    attachment: LocalAttachment,
    options?: { environmentIdOverride?: string | null }
  ): Promise<RunnerAttachment> | undefined {
    if (attachment.resolvedAttachment && attachment.integrationSource !== "github") {
      return Promise.resolve(attachment.resolvedAttachment);
    }

    if (attachment.integrationSource === "github" && attachment.resolvedAttachment && attachment.uploadStatus === "uploaded") {
      return Promise.resolve(attachment.resolvedAttachment);
    }

    const existingPromise = attachmentUploadPromisesRef.current[attachment.id];
    if (existingPromise) {
      return existingPromise;
    }

    const uploadPromise = resolveSingleAttachment(
      attachment,
      options?.environmentIdOverride === undefined ? resolveAttachmentUploadEnvironmentId() : options.environmentIdOverride
    )
      .then((resolvedAttachment) => {
        attachment.resolvedAttachment = resolvedAttachment;
        attachment.uploadStatus = "uploaded";
        attachment.uploadError = null;
        applyAttachmentStatePatch(attachment.id, {
          resolvedAttachment,
          uploadStatus: "uploaded",
          uploadError: null,
        });
        return resolvedAttachment;
      })
      .catch((error) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        attachment.uploadStatus = "failed";
        attachment.uploadError = normalizedError.message || `Failed to upload ${attachment.file.name}.`;
        applyAttachmentStatePatch(attachment.id, {
          uploadStatus: "failed",
          uploadError: normalizedError.message || `Failed to upload ${attachment.file.name}.`,
        });
        throw normalizedError;
      })
      .finally(() => {
        delete attachmentUploadPromisesRef.current[attachment.id];
      });

    attachmentUploadPromisesRef.current[attachment.id] = uploadPromise;
    attachment.uploadStatus = "uploading";
    attachment.uploadError = null;
    applyAttachmentStatePatch(attachment.id, {
      uploadStatus: "uploading",
      uploadError: null,
    });

    return uploadPromise;
  }

  function appendFiles(files: File[]) {
    if (!files.length) return;

    const remainingCapacity = Math.max(maxAttachments - attachmentsRef.current.length, 0);
    const incoming = files.slice(0, remainingCapacity).map((file) => ({
      id: generateId("local"),
      file,
      type: attachmentTypeForFile(file.type, file.name),
      previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      source: "local" as const,
      uploadStatus:
        uploadFiles || mapFileToAttachment || (normalizedBackendUrl && apiKey.trim())
          ? ("uploading" as const)
          : ("idle" as const),
      uploadError: null,
    }));
    if (!incoming.length) {
      return;
    }

    setAttachments((prev) => [...prev, ...incoming]);

    for (const attachment of incoming) {
      if (attachment.uploadStatus === "uploading") {
        const uploadPromise = beginAttachmentUpload(attachment);
        if (uploadPromise) {
          void uploadPromise.catch(() => undefined);
        }
      }
    }
  }

  function handleDroppedLocalFiles(files: File[]): boolean {
    const validFiles = Array.from(files || []).filter((file) => file instanceof File);
    if (!validFiles.length) {
      return false;
    }
    appendFiles(validFiles);
    closeAllInputPopups();
    return true;
  }

  function handleAddFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    appendFiles(files);
    if (renderedSidePopup === "attach-files" || activeInputPopup === "attach-files") {
      closeAllInputPopups();
    }

    event.target.value = "";
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) {
        revokeAttachmentPreview(target);
      }
      delete attachmentUploadPromisesRef.current[id];
      return prev.filter((item) => item.id !== id);
    });
  }

  function closeAllInputPopups(mode: "default" | "outside" = "default") {
    const hasStackedPlusPopupsOpen =
      renderedSidePopup !== null &&
      (renderedMainPopup === "main" || isPlusPopupId(activeInputPopup));

    if (mode === "outside" && hasStackedPlusPopupsOpen) {
      setSidePopupExitDirection("down");
    }
    setActiveInputPopup(null);
    setSelectedWorkspaceFileIds([]);
    setIsDraggingOver(false);
    setIsScreenFileDragActive(false);
    setProjectTasksPopupOpen(false);
    clearQuotedSelectionPopup();
  }

  function isExternalFileDrag(event: { dataTransfer?: DataTransfer | null }): boolean {
    const types = event.dataTransfer?.types;
    if (!types) {
      return false;
    }
    return Array.from(types).includes("Files");
  }

  function handleRootFileDragEnter(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    event.preventDefault();
    if (!screenFileDragActiveRef.current) {
      screenFileDragActiveRef.current = true;
      setIsScreenFileDragActive(true);
    }
  }

  function handleRootFileDragOver(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
    if (!screenFileDragActiveRef.current) {
      screenFileDragActiveRef.current = true;
      setIsScreenFileDragActive(true);
    }
  }

  function handleRootFileDragLeave(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    const rootElement = rootRef.current;
    if (!rootElement) {
      screenFileDragActiveRef.current = false;
      setIsScreenFileDragActive(false);
      return;
    }
    const bounds = rootElement.getBoundingClientRect();
    const hasLeftRoot =
      event.clientX < bounds.left
      || event.clientX > bounds.right
      || event.clientY < bounds.top
      || event.clientY > bounds.bottom;
    if (hasLeftRoot) {
      screenFileDragActiveRef.current = false;
      setIsScreenFileDragActive(false);
    }
  }

  function handleRootFileDrop(event: ReactDragEvent<HTMLDivElement>) {
    if (!isExternalFileDrag(event)) {
      return;
    }
    event.preventDefault();
    screenFileDragActiveRef.current = false;
    setIsScreenFileDragActive(false);
    handleDroppedLocalFiles(Array.from(event.dataTransfer.files || []));
  }

  async function createWorkspaceAttachment(item: RunnerChatFileNode, sourceEnvironmentId: string): Promise<LocalAttachment> {
    const downloadUrl = buildEnvironmentFileDownloadUrl(normalizedBackendUrl, sourceEnvironmentId, item.path);
    if (!downloadUrl) {
      throw new Error(`Failed to prepare ${item.name} for attachment.`);
    }

    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    const response = await fetch(downloadUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to load ${item.name} (${response.status})`);
    }

    const blob = await response.blob();
    const mimeType = blob.type || item.mimeType || "application/octet-stream";
    const file = new File([blob], item.name, { type: mimeType });
    const type = attachmentTypeForFile(mimeType, item.name);
    const resolvedAttachment = await uploadAttachment({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      requestHeaders,
      file,
      environmentId: sourceEnvironmentId,
    });

    return {
      id: generateId("workspace"),
      file,
      type,
      previewUrl: type === "image" ? URL.createObjectURL(blob) : undefined,
      source: "workspace",
      sourceEnvironmentId,
      resolvedAttachment,
      uploadStatus: "uploaded",
      uploadError: null,
    };
  }

  async function createIntegrationAttachment(
    item: RunnerChatFileNode,
    source: "google-drive" | "one-drive" | "github",
    targetEnvironmentId: string,
    fetchFileContent: (file: RunnerChatFileNode) => Promise<RunnerChatFetchedFileContent>
  ): Promise<LocalAttachment> {
    const payload = await fetchFileContent(item);
    const filename = String(payload?.name || item.name || "file").trim() || "file";
    const mimeType = String(payload?.mimeType || item.mimeType || "application/octet-stream").trim() || "application/octet-stream";
    const type = attachmentTypeForFile(mimeType, filename);
    const encodedData =
      payload?.encoding === "text"
        ? await blobToBase64(new Blob([typeof payload?.content === "string" ? payload.content : ""], { type: mimeType }))
        : normalizeBase64Content(typeof payload?.content === "string" ? payload.content : "");
    const resolvedAttachment = await uploadAttachmentContent({
      backendUrl: normalizedBackendUrl,
      apiKey: apiKey.trim(),
      requestHeaders,
      filename,
      mimeType,
      data: encodedData,
      environmentId: targetEnvironmentId,
    });
    const file = new File([""], filename, { type: mimeType });
    const resolvedImagePreviewUrl =
      payload?.encoding === "text"
        ? undefined
        : encodedData
          ? `data:${mimeType};base64,${encodedData}`
          : item.previewUrl;
    const previewUrl = type === "image" ? resolvedImagePreviewUrl : undefined;

    return {
      id: generateId("integration"),
      file,
      type,
      previewUrl,
      source: "integration",
      sourceEnvironmentId: targetEnvironmentId,
      integrationSource: source,
      githubRepoFullName: source === "github" ? item.repoFullName : undefined,
      githubRef: source === "github" ? item.ref || null : undefined,
      resolvedAttachment,
      uploadStatus: "uploaded",
      uploadError: null,
    };
  }

  function createGithubIntegrationSelectionAttachment(
    item: RunnerChatFileNode,
    targetEnvironmentId: string,
    options?: { pendingPreparation?: boolean }
  ): LocalAttachment {
    const repoFullName = String(item.repoFullName || "").trim();
    if (!repoFullName) {
      throw new Error("Missing GitHub repository metadata.");
    }

    const repoName = getGithubRepoName(repoFullName);
    const selectedBranch = getGithubSelectedBranchForRepo(repoFullName, item.ref);
    const normalizedItemPath = String(item.path || "").trim().replace(/^\/+/, "");
    const selectionType: "repo" | "file" = item.isFolder && !normalizedItemPath ? "repo" : "file";
    const displayName =
      selectionType === "repo"
        ? repoName
        : `${repoName}/${(normalizedItemPath.split("/").filter(Boolean).pop() || item.name || "file").trim()}`;
    const workspacePath = `/workspace/GitHub/${repoName}${normalizedItemPath ? `/${normalizedItemPath}` : ""}`;
    const selectionMimeType = "application/x-github-selection";
    const file = new File([""], displayName, { type: selectionMimeType });
    const resolvedAttachment: RunnerAttachment = {
      id: generateId("integration"),
      filename: displayName,
      mimeType: selectionMimeType,
      size: 0,
      type: "document",
      uploadedAt: new Date().toISOString(),
      url: "",
      gcsPath: "",
      workspacePath,
      integrationSource: "github",
      githubRepoFullName: repoFullName,
      githubRef: selectedBranch,
      githubItemPath: normalizedItemPath || undefined,
      githubSelectionType: selectionType,
    };

    return {
      id: generateId("integration"),
      file,
      type: "document",
      source: "integration",
      sourceEnvironmentId: targetEnvironmentId,
      integrationSource: "github",
      githubRepoFullName: repoFullName,
      githubRef: selectedBranch,
      githubItemPath: normalizedItemPath || undefined,
      githubSelectionType: selectionType,
      resolvedAttachment,
      uploadStatus: options?.pendingPreparation ? "uploading" : "uploaded",
      uploadError: null,
    };
  }

  function handleAttachFilesMenuClick() {
    setActiveInputPopup("attach-files");
  }

  function closeAttachFilesPopup() {
    setIsDraggingOver(false);
    setActiveInputPopup("main");
  }

  function closeSkillsPopup() {
    setActiveInputPopup("main");
  }

  function closeSchedulePopup() {
    setActiveInputPopup("main");
  }

  function clearScheduledTask() {
    setScheduledTask(null);
  }

  function handleUploadNewFilesClick() {
    fileInputRef.current?.click();
  }

  function openFileBrowserModal(initialSource: RunnerFileBrowserSource) {
    if (!hasApiKey) {
      setShowFileBrowserApiKeyPrompt(true);
      return;
    }
    setActiveInputPopup(null);
    setFileBrowserSource(initialSource);
    setFileBrowserSearchQuery("");
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
    if (initialSource === "workspace") {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError(null);
    } else if (initialSource === "google-drive") {
      setRemoteGoogleDriveItems([]);
      setLoadedGoogleDriveFolderIds([]);
      setLoadingGoogleDriveFolderIds([]);
      setGoogleDriveBrowserError(null);
    } else if (initialSource === "one-drive") {
      setRemoteOneDriveItems([]);
      setLoadedOneDriveFolderIds([]);
      setLoadingOneDriveFolderIds([]);
      setOneDriveBrowserError(null);
    } else if (initialSource === "github") {
      setRemoteGithubItems([]);
      setLoadedGithubFolderIds([]);
      setLoadingGithubFolderIds([]);
      setGithubBrowserError(null);
    } else if (initialSource === "notion") {
      setRemoteNotionDatabases([]);
      setNotionDatabasesLoaded(false);
      setNotionBrowserError(null);
    }
    setFileBrowserHistory([{ source: initialSource, folderId: null }]);
    setFileBrowserHistoryIndex(0);
    setShowFileBrowserModal(true);
  }

  function closeFileBrowserModal() {
    setShowFileBrowserModal(false);
    setFileBrowserSearchQuery("");
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
    setIsFileBrowserAttaching(false);
    setFileBrowserHistory([]);
    setFileBrowserHistoryIndex(-1);
    setRemoteWorkspaceItems([]);
    setLoadedWorkspaceFolderIds([]);
    setLoadingWorkspaceFolderIds([]);
    setWorkspaceFolderErrorsById({});
    setWorkspaceBrowserError(null);
    setGoogleDriveBrowserError(null);
    setOneDriveBrowserError(null);
    setGithubBrowserError(null);
    setIsGoogleDrivePickerLoading(false);
  }

  function closeFileBrowserApiKeyPrompt() {
    setShowFileBrowserApiKeyPrompt(false);
  }

  async function loadWorkspaceFolder(folderId: string | null, options?: { inline?: boolean }) {
    const normalizedFolderId = normalizeRunnerWorkspaceFolderPath(folderId) || "root";
    const requestedFolderPath = normalizedFolderId === "root" ? "" : normalizedFolderId;
    const requestUrl = buildEnvironmentFileListUrl(normalizedBackendUrl, activeWorkspaceEnvironmentId || "", requestedFolderPath, 1);
    if (!requestUrl) {
      setRemoteWorkspaceItems([]);
      setWorkspaceBrowserError("Select an environment to browse workspace files.");
      setIsWorkspaceBrowserLoading(false);
      return;
    }

    if (options?.inline) {
      setLoadingWorkspaceFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsWorkspaceBrowserLoading(true);
      setWorkspaceBrowserError(null);
    }
    setWorkspaceFolderErrorsById((current) => ({
      ...current,
      [normalizedFolderId]: "",
    }));

    try {
      const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
      const response = await fetch(requestUrl, {
        method: "GET",
        headers,
      });
      const text = await response.text();
      let parsed: any = {};
      try {
        parsed = text ? JSON.parse(text) : {};
      } catch {
        parsed = { message: text };
      }

      if (!response.ok) {
        throw new Error(parsed?.message || parsed?.error || `Failed to load workspace files (${response.status})`);
      }

      const nextItems = normalizeEnvironmentWorkspaceItems(parsed);
      setRemoteWorkspaceItems((current) => mergeDriveFolderItems(current, normalizedFolderId, nextItems));
      setLoadedWorkspaceFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setWorkspaceFolderErrorsById((current) => ({
        ...current,
        [normalizedFolderId]: "",
      }));
      if (!options?.inline) {
        setWorkspaceBrowserError(null);
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      const message = normalizedError.message || "Failed to load workspace files.";
      setWorkspaceFolderErrorsById((current) => ({
        ...current,
        [normalizedFolderId]: message,
      }));
      if (normalizedFolderId === "root" || !options?.inline) {
        setRemoteWorkspaceItems([]);
        setWorkspaceBrowserError(message);
      }
    } finally {
      if (options?.inline) {
        setLoadingWorkspaceFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsWorkspaceBrowserLoading(false);
      }
    }
  }

  async function loadGoogleDriveFolder(folderId: string, options?: { inline?: boolean }) {
    if (!googleDriveConfig?.fetchItems) {
      return;
    }

    const normalizedFolderId = folderId || "root";
    if (options?.inline) {
      setLoadingGoogleDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsGoogleDriveBrowserLoading(true);
      setGoogleDriveBrowserError(null);
    }

    try {
      const items = await googleDriveConfig.fetchItems(normalizedFolderId);
      setRemoteGoogleDriveItems((current) => mergeDriveFolderItems(current, normalizedFolderId, items));
      setLoadedGoogleDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setGoogleDriveBrowserError(null);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGoogleDriveBrowserError(normalizedError.message || "Failed to load Google Drive files.");
    } finally {
      if (options?.inline) {
        setLoadingGoogleDriveFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsGoogleDriveBrowserLoading(false);
      }
    }
  }

  async function loadOneDriveFolder(folderId: string, options?: { inline?: boolean }) {
    if (!oneDriveConfig?.fetchItems) {
      return;
    }

    const normalizedFolderId = folderId || "root";
    if (options?.inline) {
      setLoadingOneDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsOneDriveBrowserLoading(true);
      setOneDriveBrowserError(null);
    }

    try {
      const items = await oneDriveConfig.fetchItems(normalizedFolderId);
      setRemoteOneDriveItems((current) => mergeDriveFolderItems(current, normalizedFolderId, items));
      setLoadedOneDriveFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setOneDriveBrowserError(null);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setOneDriveBrowserError(normalizedError.message || "Failed to load OneDrive files.");
    } finally {
      if (options?.inline) {
        setLoadingOneDriveFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsOneDriveBrowserLoading(false);
      }
    }
  }

  async function loadGithubFolder(folderId: string, options?: { inline?: boolean }) {
    if (!githubConfig?.fetchItems) {
      return;
    }

    const normalizedFolderId = folderId || "root";
    if (options?.inline) {
      setLoadingGithubFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
    } else {
      setIsGithubBrowserLoading(true);
      setGithubBrowserError(null);
    }

    try {
      const items = await githubConfig.fetchItems(normalizedFolderId);
      const normalizedItems =
        normalizedFolderId === "root"
          ? items.map((item) => buildGithubEffectiveRootItem(item))
          : items;
      setRemoteGithubItems((current) => mergeDriveFolderItems(current, normalizedFolderId, normalizedItems));
      setLoadedGithubFolderIds((current) => (current.includes(normalizedFolderId) ? current : [...current, normalizedFolderId]));
      setGithubBrowserError(null);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGithubBrowserError(normalizedError.message || "Failed to load GitHub files.");
    } finally {
      if (options?.inline) {
        setLoadingGithubFolderIds((current) => current.filter((id) => id !== normalizedFolderId));
      } else {
        setIsGithubBrowserLoading(false);
      }
    }
  }

  async function ensureGithubBranchesLoaded(repoFullName: string, fallbackRef?: string | null) {
    const normalizedRepoFullName = String(repoFullName || "").trim();
    if (!normalizedRepoFullName) {
      return;
    }

    const initialBranch = getGithubSelectedBranchForRepo(normalizedRepoFullName, fallbackRef);
    if (initialBranch) {
      setGithubSelectedBranchByRepoFullName((current) =>
        current[normalizedRepoFullName]
          ? current
          : {
              ...current,
              [normalizedRepoFullName]: initialBranch,
            }
      );
    }

    if (
      githubBranchesByRepoFullName[normalizedRepoFullName]?.length
      || githubBranchLoadingRepoFullNames.includes(normalizedRepoFullName)
      || !githubConfig?.fetchBranches
    ) {
      return;
    }

    setGithubBranchLoadingRepoFullNames((current) =>
      current.includes(normalizedRepoFullName) ? current : [...current, normalizedRepoFullName]
    );

    try {
      const branches = await githubConfig.fetchBranches(normalizedRepoFullName);
      setGithubBranchesByRepoFullName((current) => ({
        ...current,
        [normalizedRepoFullName]: branches,
      }));
      if (branches.length > 0) {
        setGithubSelectedBranchByRepoFullName((current) =>
          current[normalizedRepoFullName]
            ? current
            : {
                ...current,
                [normalizedRepoFullName]: String(branches[0]?.name || initialBranch || "main").trim() || "main",
              }
        );
      }
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGithubBrowserError(normalizedError.message || "Failed to load GitHub branches.");
    } finally {
      setGithubBranchLoadingRepoFullNames((current) => current.filter((name) => name !== normalizedRepoFullName));
    }
  }

  function handleGithubRepoBranchChange(item: RunnerChatFileNode, nextBranch: string) {
    const repoFullName = String(item.repoFullName || "").trim();
    const normalizedBranch = String(nextBranch || "").trim();
    if (!repoFullName || !normalizedBranch) {
      return;
    }

    const currentRootId = String(item.id || "").trim();
    const nextRootId = createGithubBrowserRepoFolderId(repoFullName, normalizedBranch);

    setGithubSelectedBranchByRepoFullName((current) => ({
      ...current,
      [repoFullName]: normalizedBranch,
    }));

    setRemoteGithubItems((current) => {
      const nextItems: RunnerChatFileNode[] = [];
      let rootUpdated = false;
      for (const currentItem of current) {
        if (String(currentItem.repoFullName || "").trim() !== repoFullName) {
          nextItems.push(currentItem);
          continue;
        }
        if ((currentItem.parentId ?? null) === null) {
          nextItems.push({
            ...currentItem,
            id: nextRootId,
            ref: normalizedBranch,
          });
          rootUpdated = true;
        }
      }
      if (!rootUpdated) {
        nextItems.push({
          ...item,
          id: nextRootId,
          ref: normalizedBranch,
          parentId: null,
        });
      }
      return nextItems;
    });

    setLoadedGithubFolderIds((current) =>
      current.filter((folderId) => parseGithubBrowserFolderId(folderId).repoFullName !== repoFullName)
    );
    setLoadingGithubFolderIds((current) =>
      current.filter((folderId) => parseGithubBrowserFolderId(folderId).repoFullName !== repoFullName)
    );
    setExpandedFileBrowserFolderIds((current) =>
      current
        .filter((folderId) => parseGithubBrowserFolderId(folderId).repoFullName !== repoFullName)
        .concat(current.includes(currentRootId) ? [nextRootId] : [])
    );
    setSelectedGithubFileIds((current) =>
      current.filter((fileId) => parseGithubBrowserFolderId(fileId).repoFullName !== repoFullName)
    );
    setFileBrowserPreviewId((current) => {
      if (!current || parseGithubBrowserFolderId(current).repoFullName !== repoFullName) {
        return current;
      }
      return null;
    });
    setFileBrowserHistory((current) =>
      current.map((entry) => {
        if (entry.source !== "github" || !entry.folderId) {
          return entry;
        }
        const parsedFolder = parseGithubBrowserFolderId(entry.folderId);
        if (parsedFolder.repoFullName !== repoFullName) {
          return entry;
        }
        if (!parsedFolder.path) {
          return {
            ...entry,
            folderId: nextRootId,
          };
        }
        return {
          ...entry,
          folderId: createGithubBrowserNodeId(repoFullName, parsedFolder.path, normalizedBranch),
        };
      })
    );

    if (currentFileBrowserSource === "github" && currentFileBrowserFolderId) {
      const parsedFolder = parseGithubBrowserFolderId(currentFileBrowserFolderId);
      if (parsedFolder.repoFullName === repoFullName) {
        const nextFolderId = parsedFolder.path
          ? createGithubBrowserNodeId(repoFullName, parsedFolder.path, normalizedBranch)
          : nextRootId;
        void loadGithubFolder(nextFolderId);
      }
    }
  }

  async function handleGoogleDriveManageAccess() {
    if (!googleDriveConfig?.onManageAccess) {
      return;
    }

    setIsGoogleDrivePickerLoading(true);
    try {
      await googleDriveConfig.onManageAccess();
      setRemoteGoogleDriveItems([]);
      setLoadedGoogleDriveFolderIds([]);
      setFileBrowserHistory([{ source: "google-drive", folderId: null }]);
      setFileBrowserHistoryIndex(0);
      await loadGoogleDriveFolder("root");
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setGoogleDriveBrowserError(normalizedError.message || "Failed to open Google Drive picker.");
    } finally {
      setIsGoogleDrivePickerLoading(false);
    }
  }

  async function stopSpeechToText() {
    const socket = speechSocketRef.current;
    const processorNode = speechProcessorNodeRef.current;
    const sourceNode = speechSourceNodeRef.current;
    const sinkGainNode = speechSinkGainNodeRef.current;
    const stream = speechMediaStreamRef.current;
    const audioContext = speechAudioContextRef.current;
    const wasActivityOpen = speechActivityOpenRef.current;

    speechSocketRef.current = null;
    speechSocketReadyRef.current = false;
    speechPendingChunksRef.current = [];
    speechProcessorNodeRef.current = null;
    speechSourceNodeRef.current = null;
    speechSinkGainNodeRef.current = null;
    speechMediaStreamRef.current = null;
    speechAudioContextRef.current = null;
    speechTranscriptRef.current = "";
    speechBaseInputRef.current = currentInputRef.current;
    speechActivityOpenRef.current = false;
    speechLastVoiceMsRef.current = 0;

    if (processorNode) {
      processorNode.port.onmessage = null;
      processorNode.disconnect();
    }
    sourceNode?.disconnect();
    sinkGainNode?.disconnect();
    stream?.getTracks().forEach((track) => track.stop());

    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      if (socket.readyState === WebSocket.OPEN && wasActivityOpen) {
        sendSpeechSignal(socket, "activity-end");
        await new Promise((resolve) => window.setTimeout(resolve, 250));
      }
      socket.close(1000, "Speech-to-text stopped");
    }

    if (audioContext) {
      await audioContext.close().catch(() => undefined);
    }

    setRecordingStartedAtMs(null);
    setRecordingElapsedSeconds(0);
    setIsListening(false);
  }

  function flushPendingSpeechChunks(socket: WebSocket) {
    if (!speechPendingChunksRef.current.length || socket.readyState !== WebSocket.OPEN) {
      return;
    }

    for (const message of speechPendingChunksRef.current) {
      socket.send(JSON.stringify(message));
    }
    speechPendingChunksRef.current = [];
  }

  function sendSpeechChunk(socket: WebSocket, chunk: string) {
    if (!chunk) return;

    if (speechSocketReadyRef.current && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "audio", data: chunk }));
      return;
    }

    const queue = speechPendingChunksRef.current;
    queue.push({ type: "audio", data: chunk });
    if (queue.length > SPEECH_QUEUE_LIMIT) {
      queue.splice(0, queue.length - SPEECH_QUEUE_LIMIT);
    }
  }

  function sendSpeechSignal(socket: WebSocket, type: "activity-start" | "activity-end") {
    if (speechSocketReadyRef.current && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type }));
      return;
    }

    if (socket.readyState !== WebSocket.OPEN && socket.readyState !== WebSocket.CONNECTING) {
      return;
    }

    const queue = speechPendingChunksRef.current;
    queue.push({ type });
    if (queue.length > SPEECH_QUEUE_LIMIT) {
      queue.splice(0, queue.length - SPEECH_QUEUE_LIMIT);
    }
  }

  async function startSpeechToText() {
    if (!hasApiKey) {
      setInlineError("Enter an API key to enable speech-to-text.");
      return;
    }
    if (!supportsSpeechToText || !resolvedSpeechToTextUrl) {
      setInlineError("Speech-to-text is not supported in this browser.");
      return;
    }

    await stopSpeechToText();
    setInlineError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      const browserWindow = window as typeof window & {
        webkitAudioContext?: typeof AudioContext;
      };
      const AudioContextConstructor = browserWindow.AudioContext || browserWindow.webkitAudioContext;

      if (!AudioContextConstructor) {
        stream.getTracks().forEach((track) => track.stop());
        throw new Error("Speech-to-text is not supported in this browser.");
      }

      const wsUrl = new URL(resolvedSpeechToTextUrl);
      wsUrl.searchParams.set("apiKey", apiKey.trim());
      const socket = new WebSocket(wsUrl.toString());
      const audioContext = new AudioContextConstructor();
      const workletUrl = createSpeechCaptureWorkletUrl();
      try {
        await audioContext.audioWorklet.addModule(workletUrl);
      } finally {
        URL.revokeObjectURL(workletUrl);
      }
      const sourceNode = audioContext.createMediaStreamSource(stream);
      const processorNode = new AudioWorkletNode(audioContext, SPEECH_WORKLET_PROCESSOR_NAME, {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        processorOptions: {
          bufferSize: SPEECH_WORKLET_BUFFER_SIZE,
        },
      });
      const sinkGainNode = audioContext.createGain();

      sinkGainNode.gain.value = 0;

      speechSocketRef.current = socket;
      speechSocketReadyRef.current = false;
      speechPendingChunksRef.current = [];
      speechMediaStreamRef.current = stream;
      speechAudioContextRef.current = audioContext;
      speechSourceNodeRef.current = sourceNode;
      speechProcessorNodeRef.current = processorNode;
      speechSinkGainNodeRef.current = sinkGainNode;
      speechBaseInputRef.current = currentInputRef.current;
      speechTranscriptRef.current = "";
      speechActivityOpenRef.current = false;
      speechLastVoiceMsRef.current = 0;

      socket.onmessage = (event) => {
        let message: { type?: string; text?: string; message?: string };

        try {
          message = JSON.parse(String(event.data || ""));
        } catch {
          return;
        }

        if (message.type === "ready") {
          speechSocketReadyRef.current = true;
          flushPendingSpeechChunks(socket);
          return;
        }

        if (message.type === "transcript" && typeof message.text === "string") {
          speechTranscriptRef.current = combineInputWithTranscript(speechTranscriptRef.current, message.text);
          setInput(combineInputWithTranscript(speechBaseInputRef.current, speechTranscriptRef.current));
          return;
        }

        if (message.type === "turn-complete") {
          const committedInput = combineInputWithTranscript(speechBaseInputRef.current, speechTranscriptRef.current);
          speechBaseInputRef.current = committedInput;
          speechTranscriptRef.current = "";
          setInput(committedInput);
          return;
        }

        if (message.type === "error") {
          setInlineError(message.message || "Speech-to-text failed.");
          void stopSpeechToText();
        }
      };
      socket.onerror = () => {
        setInlineError("Speech-to-text connection failed.");
        void stopSpeechToText();
      };
      socket.onclose = (event) => {
        const closeReason = event.reason?.trim();
        if (speechSocketRef.current === socket && closeReason && closeReason !== "Speech-to-text stopped") {
          setInlineError(`Speech-to-text stopped: ${closeReason}`);
        }
        if (speechSocketRef.current === socket) {
          void stopSpeechToText();
        }
      };

      processorNode.port.onmessage = (event) => {
        if (socket.readyState !== WebSocket.OPEN) {
          return;
        }

        const channelData = event.data;
        const normalizedChunk =
          channelData instanceof Float32Array
            ? channelData
            : channelData instanceof ArrayBuffer
              ? new Float32Array(channelData)
              : ArrayBuffer.isView(channelData)
                ? new Float32Array(channelData.buffer.slice(channelData.byteOffset, channelData.byteOffset + channelData.byteLength))
                : null;

        if (!normalizedChunk || normalizedChunk.length === 0) {
          return;
        }

        const rms = calculateRms(normalizedChunk);
        const now = Date.now();
        const isSpeechChunk = rms >= SPEECH_ACTIVITY_RMS_THRESHOLD;
        if (isSpeechChunk) {
          speechLastVoiceMsRef.current = now;
          if (!speechActivityOpenRef.current) {
            speechActivityOpenRef.current = true;
            sendSpeechSignal(socket, "activity-start");
          }
        }

        if (!isSpeechChunk && now - speechLastVoiceMsRef.current > SPEECH_ACTIVITY_HANGOVER_MS) {
          if (speechActivityOpenRef.current) {
            speechActivityOpenRef.current = false;
            sendSpeechSignal(socket, "activity-end");
          }
          return;
        }

        const pcmChunk = downsampleTo16kHz(normalizedChunk, audioContext.sampleRate);
        if (!pcmChunk.length) {
          return;
        }

        sendSpeechChunk(socket, encodePcmChunkBase64(pcmChunk));
      };

      sourceNode.connect(processorNode);
      processorNode.connect(sinkGainNode);
      sinkGainNode.connect(audioContext.destination);
      await audioContext.resume();
      setRecordingStartedAtMs(Date.now());
      setRecordingElapsedSeconds(0);
      setIsListening(true);
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message === "Permission denied" ? "Microphone access was blocked." : normalizedError.message || "Speech-to-text failed to start.");
      await stopSpeechToText();
    }
  }

  async function handleMicrophoneClick() {
    if (disabled || isPreparingRun) return;

    if (isListening) {
      await stopSpeechToText();
      return;
    }

    await startSpeechToText();
  }

  function toggleMainMenu() {
    setActiveInputPopup((current) => (isPlusPopupId(current) ? null : "main"));
  }

  function openPlusPopup(popup: Exclude<InputPopupId, "context" | "agent" | "environment">) {
    setActiveInputPopup(popup);
  }

  function togglePopup(popup: InputPopupId) {
    setActiveInputPopup((current) => (current === popup ? null : popup));
  }

  function toggleSkill(skillId: string) {
    setEnabledSkillIds((current) => {
      const next = current.includes(skillId) ? current.filter((id) => id !== skillId) : [...current, skillId];
      onSkillsChange?.(next);
      return next;
    });
  }

  function selectAgent(nextAgentId: string) {
    setSelectedAgentId(nextAgentId);
    onAgentChange?.(nextAgentId);
    setActiveInputPopup(null);
  }

  function selectEnvironment(nextEnvironmentId: string) {
    const previousEnvironmentId = selectedEnvironmentId || sourceThreadEnvironmentId || environmentId || "";
    const threadEnvironmentId = sourceThreadEnvironmentId || environmentId || "";
    const isWorkspaceModeChange = workspaceSelectorMode !== "computers" || Boolean(selectedProjectId);

    if (nextEnvironmentId === previousEnvironmentId && !isWorkspaceModeChange) {
      setActiveInputPopup(null);
      return;
    }

    setWorkspaceSelectorMode("computers");
    setSelectedProjectId("");
    projectsConfig?.onProjectChange?.("");

    if (
      currentThreadId &&
      currentThreadHasMessages &&
      currentThreadHasWorkspaceChanges &&
      threadEnvironmentId &&
      nextEnvironmentId !== threadEnvironmentId
    ) {
      setSelectedEnvironmentId(nextEnvironmentId);
      openForkDialogForCurrentThread("", {
        includeCurrentAttachments: false,
        preselectedTargetEnvironmentId: nextEnvironmentId,
        restoreSelectedEnvironmentId: previousEnvironmentId,
        initialExistingEnvironmentFileCopyMode: "thread_only",
      });
      return;
    }

    setSelectedEnvironmentId(nextEnvironmentId);
    onEnvironmentChange?.(nextEnvironmentId);
    persistWorkspaceSelection(workspaceSelectionStorageKey, {
      mode: "computers",
      environmentId: nextEnvironmentId,
      projectId: "",
    });
    setActiveInputPopup(null);
  }

  function selectProject(nextProjectId: string) {
    const project = availableProjects.find((entry) => entry.id === nextProjectId) || null;
    const nextEnvironmentId = getRunnerProjectEnvironmentId(project);
    if (!project || !nextEnvironmentId) {
      return;
    }

    setWorkspaceSelectorMode("projects");
    setSelectedProjectId(project.id);
    setSelectedEnvironmentId(nextEnvironmentId);
    projectsConfig?.onProjectChange?.(project.id);
    onEnvironmentChange?.(nextEnvironmentId);
    persistWorkspaceSelection(workspaceSelectionStorageKey, {
      mode: "projects",
      projectId: project.id,
      environmentId: nextEnvironmentId,
    });
    setActiveInputPopup(null);
  }

  function selectGithubRepository(nextRepositoryId: string) {
    setSelectedGithubRepositoryId(nextRepositoryId);
    githubConfig?.onRepositoryChange?.(nextRepositoryId);
  }

  function selectGithubContext(nextContextId: string) {
    setSelectedGithubContextId(nextContextId);
    githubConfig?.onContextChange?.(nextContextId);
  }

  function selectNotionDatabase(nextDatabaseId: string) {
    setSelectedNotionDatabaseId(nextDatabaseId);
    notionConfig?.onDatabaseChange?.(nextDatabaseId);
  }

  function toggleFileSelection(selection: string[], nextId: string): string[] {
    return selection.includes(nextId) ? selection.filter((id) => id !== nextId) : [...selection, nextId];
  }

  function handleWorkspaceFileBrowserEnvironmentSelect(nextEnvironmentId: string) {
    setSelectedWorkspaceFileIds([]);
    pruneWorkspaceAttachmentsForEnvironment(nextEnvironmentId);
    setSelectedEnvironmentId(nextEnvironmentId);
    onEnvironmentChange?.(nextEnvironmentId);
    switchFileBrowserSource("workspace");
  }

  async function attachWorkspaceFiles(): Promise<boolean> {
    const selectedItems = workspaceItems.filter((item) => selectedWorkspaceFileIds.includes(item.id) && !item.isFolder);
    if (!selectedItems.length) {
      return false;
    }

    if (!activeWorkspaceEnvironmentId) {
      setWorkspaceBrowserError("Select an environment to browse workspace files.");
      return false;
    }

    const remainingCapacity = Math.max(maxAttachments - attachments.length, 0);
    const itemsToAttach = selectedItems.slice(0, remainingCapacity);
    if (!itemsToAttach.length) {
      return false;
    }

    setInlineError(null);
    setIsFileBrowserAttaching(true);

    try {
      const createdAttachments = await Promise.all(
        itemsToAttach.map((item) => createWorkspaceAttachment(item, activeWorkspaceEnvironmentId))
      );
      setAttachments((prev) => [...prev, ...createdAttachments]);
      workspaceConfig?.onAttach?.(itemsToAttach.map((item) => item.id));
      setSelectedWorkspaceFileIds([]);
      closeAllInputPopups();
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to attach workspace files.");
      return false;
    } finally {
      setIsFileBrowserAttaching(false);
    }
  }

  async function attachIntegrationFiles(source: "google-drive" | "one-drive" | "github"): Promise<boolean> {
    const config =
      source === "google-drive"
        ? googleDriveConfig
        : source === "one-drive"
          ? oneDriveConfig
          : githubConfig;
    const items =
      source === "google-drive"
        ? googleDriveItems
        : source === "one-drive"
          ? oneDriveItems
          : githubItems;
    const selectedIds =
      source === "google-drive"
        ? selectedGoogleDriveFileIds
        : source === "one-drive"
          ? selectedOneDriveFileIds
          : selectedGithubFileIds;
    const selectedItems = items.filter((item) => selectedIds.includes(item.id) && (source === "github" || !item.isFolder));
    if (!selectedItems.length) {
      return false;
    }

    const targetEnvironmentId = resolveAttachmentUploadEnvironmentId();
    if (!targetEnvironmentId) {
      setInlineError("Select an environment before attaching files.");
      return false;
    }
    const fetchFileContent = config?.fetchFileContent;
    if (source !== "github" && !fetchFileContent) {
      setInlineError("This integration does not support file downloads.");
      return false;
    }

    if (source === "github") {
      const selectedRepoFullNames = Array.from(
        new Set(
          selectedItems
            .map((item) => String(item.repoFullName || "").trim())
            .filter(Boolean)
        )
      );
      if (selectedRepoFullNames.length > 1) {
        setInlineError("Attach files from a single GitHub repository per message.");
        return false;
      }
    }

    const remainingCapacity = Math.max(maxAttachments - attachments.length, 0);
    const itemsToAttach = selectedItems.slice(0, remainingCapacity);
    if (!itemsToAttach.length) {
      return false;
    }

    setInlineError(null);
    setIsFileBrowserAttaching(true);

    try {
      const createdAttachments =
        source === "github"
          ? itemsToAttach.map((item) =>
              createGithubIntegrationSelectionAttachment(item, targetEnvironmentId, {
                pendingPreparation: Boolean(normalizedBackendUrl && apiKey.trim()),
              })
            )
          : await Promise.all(
              itemsToAttach.map((item) =>
                createIntegrationAttachment(item, source, targetEnvironmentId, fetchFileContent!)
              )
            );
      setAttachments((prev) => [...prev, ...createdAttachments]);
      if (source === "github") {
        for (const attachment of createdAttachments) {
          const uploadPromise = beginAttachmentUpload(attachment, { environmentIdOverride: targetEnvironmentId });
          if (uploadPromise) {
            void uploadPromise.catch((error) => {
              const normalizedError = error instanceof Error ? error : new Error(String(error));
              setInlineError(normalizedError.message || "Failed to prepare GitHub repository.");
            });
          }
        }
      }
      config?.onAttach?.(itemsToAttach.map((item) => item.id));
      if (source === "google-drive") {
        setSelectedGoogleDriveFileIds([]);
      } else if (source === "one-drive") {
        setSelectedOneDriveFileIds([]);
      } else {
        setSelectedGithubFileIds([]);
      }
      closeAllInputPopups();
      return true;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to attach files.");
      return false;
    } finally {
      setIsFileBrowserAttaching(false);
    }
  }

  function switchFileBrowserSource(nextSource: RunnerFileBrowserSource) {
    setFileBrowserSource(nextSource);
    setFileBrowserPreviewId(null);
    setFileBrowserSearchQuery("");
    setExpandedFileBrowserFolderIds([]);
    if (nextSource === "workspace") {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError(null);
    } else if (nextSource === "google-drive") {
      setRemoteGoogleDriveItems([]);
      setLoadedGoogleDriveFolderIds([]);
      setLoadingGoogleDriveFolderIds([]);
      setGoogleDriveBrowserError(null);
    } else if (nextSource === "one-drive") {
      setRemoteOneDriveItems([]);
      setLoadedOneDriveFolderIds([]);
      setLoadingOneDriveFolderIds([]);
      setOneDriveBrowserError(null);
    } else if (nextSource === "github") {
      setRemoteGithubItems([]);
      setLoadedGithubFolderIds([]);
      setLoadingGithubFolderIds([]);
      setGithubBrowserError(null);
    } else if (nextSource === "notion") {
      setRemoteNotionDatabases([]);
      setNotionDatabasesLoaded(false);
      setNotionBrowserError(null);
    }
    setFileBrowserHistory([{ source: nextSource, folderId: null }]);
    setFileBrowserHistoryIndex(0);
  }

  function navigateFileBrowserToFolder(folderId: string | null) {
    if (fileBrowserSearchQuery.trim()) {
      setFileBrowserSearchQuery("");
    }
    const nextEntry = { source: currentFileBrowserSource, folderId };
    setFileBrowserHistory((current) => [...current.slice(0, fileBrowserHistoryIndex + 1), nextEntry]);
    setFileBrowserHistoryIndex((current) => current + 1);
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
  }

  function navigateFileBrowserToBreadcrumb(index: number) {
    const nextEntry = fileBrowserPath[index];
    if (!nextEntry) return;
    navigateFileBrowserToFolder(nextEntry.id);
  }

  function goFileBrowserBack() {
    if (fileBrowserHistoryIndex <= 0) return;
    setFileBrowserHistoryIndex((current) => current - 1);
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
  }

  function goFileBrowserForward() {
    if (fileBrowserHistoryIndex >= fileBrowserHistory.length - 1) return;
    setFileBrowserHistoryIndex((current) => current + 1);
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);
  }

  async function toggleFileBrowserFolderExpansion(folderId: string, event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (fileBrowserSearchQuery.trim()) {
      setFileBrowserSearchQuery("");
    }
    const isExpanded = expandedFileBrowserFolderIds.includes(folderId);
    if (!isExpanded && currentFileBrowserSource === "workspace" && !loadedWorkspaceFolderIds.includes(folderId)) {
      await loadWorkspaceFolder(folderId, { inline: true });
    }
    if (!isExpanded && currentFileBrowserSource === "google-drive" && googleDriveConfig?.fetchItems && !loadedGoogleDriveFolderIds.includes(folderId)) {
      await loadGoogleDriveFolder(folderId, { inline: true });
    }
    if (!isExpanded && currentFileBrowserSource === "one-drive" && oneDriveConfig?.fetchItems && !loadedOneDriveFolderIds.includes(folderId)) {
      await loadOneDriveFolder(folderId, { inline: true });
    }
    if (!isExpanded && currentFileBrowserSource === "github" && githubConfig?.fetchItems && !loadedGithubFolderIds.includes(folderId)) {
      await loadGithubFolder(folderId, { inline: true });
    }
    setExpandedFileBrowserFolderIds((current) => (current.includes(folderId) ? current.filter((id) => id !== folderId) : [...current, folderId]));
  }

  async function openFileBrowserFolder(item: RunnerChatFileNode) {
    const normalizedFolderId = String(item.id || "").trim();
    if (!normalizedFolderId) {
      return;
    }

    if (fileBrowserSearchQuery.trim()) {
      setFileBrowserSearchQuery("");
    }
    setFileBrowserPreviewId(null);
    setExpandedFileBrowserFolderIds([]);

    const nextEntry = { source: currentFileBrowserSource, folderId: normalizedFolderId };
    setFileBrowserHistory((current) => [...current.slice(0, fileBrowserHistoryIndex + 1), nextEntry]);
    setFileBrowserHistoryIndex((current) => current + 1);

    if (currentFileBrowserSource === "workspace" && !loadedWorkspaceFolderIds.includes(normalizedFolderId)) {
      await loadWorkspaceFolder(normalizedFolderId);
      return;
    }
    if (currentFileBrowserSource === "google-drive" && googleDriveConfig?.fetchItems && !loadedGoogleDriveFolderIds.includes(normalizedFolderId)) {
      await loadGoogleDriveFolder(normalizedFolderId);
      return;
    }
    if (currentFileBrowserSource === "one-drive" && oneDriveConfig?.fetchItems && !loadedOneDriveFolderIds.includes(normalizedFolderId)) {
      await loadOneDriveFolder(normalizedFolderId);
      return;
    }
    if (currentFileBrowserSource === "github" && githubConfig?.fetchItems && !loadedGithubFolderIds.includes(normalizedFolderId)) {
      await loadGithubFolder(normalizedFolderId);
    }
  }

  function handleFileBrowserItemClick(item: RunnerChatFileNode) {
    setFileBrowserPreviewId(item.id);
    if (item.isFolder) {
      void openFileBrowserFolder(item);
      return;
    }

    if (currentFileBrowserSource === "google-drive") {
      setSelectedGoogleDriveFileIds((current) => toggleFileSelection(current, item.id));
      return;
    }

    if (currentFileBrowserSource === "one-drive") {
      setSelectedOneDriveFileIds((current) => toggleFileSelection(current, item.id));
      return;
    }
    if (currentFileBrowserSource === "github") {
      setSelectedGithubFileIds((current) => toggleFileSelection(current, item.id));
      return;
    }
    if (currentFileBrowserSource === "notion") {
      setSelectedNotionDatabaseId((current) => (current === item.id ? "" : item.id));
      return;
    }

    setSelectedWorkspaceFileIds((current) => toggleFileSelection(current, item.id));
  }

  async function handleFileBrowserAttach() {
    if (currentFileBrowserSource === "google-drive") {
      if (await attachIntegrationFiles("google-drive")) {
        closeFileBrowserModal();
      }
      return;
    }
    if (currentFileBrowserSource === "one-drive") {
      if (await attachIntegrationFiles("one-drive")) {
        closeFileBrowserModal();
      }
      return;
    }
    if (currentFileBrowserSource === "github") {
      if (await attachIntegrationFiles("github")) {
        closeFileBrowserModal();
      }
      return;
    }
    if (currentFileBrowserSource === "notion") {
      const nextDatabaseId = selectedNotionDatabaseId || "";
      if (nextDatabaseId) {
        selectNotionDatabase(nextDatabaseId);
      }
      closeFileBrowserModal();
      return;
    }
    if (await attachWorkspaceFiles()) {
      closeFileBrowserModal();
    }
  }

  function handleScheduleSubmit() {
    const scheduledTime = new Date(scheduledAtValue);
    if (Number.isNaN(scheduledTime.getTime())) {
      setInlineError("Pick a valid date and time for the schedule.");
      return;
    }
    const selectedPreset = schedulePresets.find((preset) => preset.id === selectedSchedulePresetId);
    const nextSchedule = {
      scheduledTime,
      scheduleType,
      cronExpression: scheduleType === "recurring" ? selectedPreset?.cron : undefined,
    } as const;
    setScheduledTask(nextSchedule);
    scheduleConfig?.onQuickSchedule?.(nextSchedule);
    closeAllInputPopups();
  }

  async function handleThreadContextCommand(command: ParsedThreadContextCommand, options?: { commandText?: string }) {
    setInlineError(null);
    await stopSpeechToText();

    if (command.action === "context") {
      openContextPopup();
      clearComposerDraft();
      return;
    }

    if (command.action === "btw" && !command.prompt) {
      throw new Error("Provide a side question after /btw.");
    }

    if (command.action === "btw") {
      clearComposerDraft();
      await streamBtwSideQuestion(command.prompt || "", options?.commandText || formatThreadContextCommandText("btw", command.prompt || ""));
      return;
    }

    if (command.action === "fork") {
      openForkDialogForCurrentThread(command.prompt || "");
      return;
    }

    await executeThreadContextAction(command.action, {
      prompt: command.prompt?.trim() || undefined,
      commandText: options?.commandText || input.trim(),
    });
  }

  async function handleContextPopupActionClick(action: RunnerChatThreadContextAction) {
    setInlineError(null);
    setThreadContextDetailsError(null);
    closeAllInputPopups();
    if (action === "clear") {
      void stopSpeechToText().catch((error) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setInlineError(normalizedError.message || "Failed to stop speech-to-text.");
      });
      void executeThreadContextAction("clear").catch((error) => {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setInlineError(normalizedError.message || "Failed to clear thread context.");
      });
      return;
    }
    stageThreadContextCommand(action);
    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
    void stopSpeechToText().catch((error) => {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      setInlineError(normalizedError.message || "Failed to stop speech-to-text.");
    });
  }

  async function resolveAttachmentPayload(
    files: LocalAttachment[],
    environmentIdOverride?: string | null
  ): Promise<RunnerAttachment[] | undefined> {
    if (!files.length) return undefined;

    await Promise.all(
      files
        .map((entry) => attachmentUploadPromisesRef.current[entry.id])
        .filter((uploadPromise): uploadPromise is Promise<RunnerAttachment> => Boolean(uploadPromise))
        .map((uploadPromise) => uploadPromise.catch(() => undefined))
    );

    const resolvedAttachments = files
      .map((entry) => entry.resolvedAttachment)
      .filter((attachment): attachment is RunnerAttachment => Boolean(attachment));
    const unresolvedFiles = files.filter((entry) => !entry.resolvedAttachment);

    if (!unresolvedFiles.length) {
      return resolvedAttachments.length ? resolvedAttachments : undefined;
    }
    const uploadEnvironmentId =
      environmentIdOverride === undefined
        ? resolveAttachmentUploadEnvironmentId()
        : environmentIdOverride;
    const uploaded = await Promise.all(
      unresolvedFiles.map((entry) => beginAttachmentUpload(entry, { environmentIdOverride: uploadEnvironmentId }) || resolveSingleAttachment(entry, uploadEnvironmentId))
    );
    const combined = [...resolvedAttachments, ...uploaded];
    return combined.length ? combined : undefined;
  }

  async function runTask() {
    if (!canRun) return;

    setInlineError(null);
    closeAllInputPopups();
    let ensuredThreadId: string | undefined;

    try {
      if (!normalizedBackendUrl) {
        throw new Error("backendUrl is required.");
      }
      if (!apiKey) {
        throw new Error("apiKey is required.");
      }

      const taskText = trimmedInput;
      const attachmentEntries = attachments;
      const queuedTurnAttachments = buildTurnAttachmentsFromLocalAttachments(attachmentEntries);
      const quotedSelection = composerQuotedSelection;
      const backlogCommand = stagedBacklogCommand;
      const resourceCreationCommand = stagedResourceCreationCommand;
      const agentCreationCommand = stagedAgentCreationCommand;
      const skillCreationCommand = stagedSkillCreationCommand;
      if (stagedThreadContextCommand) {
        const stagedPrompt = textareaAllowsPromptAfterStagedCommand ? taskText : "";
        const shouldPreserveComposerState = stagedThreadContextCommand === "fork";
        if (!shouldPreserveComposerState) {
          clearComposerDraft();
          clearComposerAttachments(attachmentEntries);
        }
        await handleThreadContextCommand(
          {
            action: stagedThreadContextCommand,
            ...(stagedPrompt ? { prompt: stagedPrompt } : {}),
          },
          {
            commandText: formatThreadContextCommandText(stagedThreadContextCommand, stagedPrompt),
          }
        );
        return;
      }
      const threadContextCommand = parseThreadContextCommand(taskText);
      if (threadContextCommand) {
        const shouldPreserveComposerState = threadContextCommand.action === "fork";
        if (!shouldPreserveComposerState) {
          clearComposerDraft();
          clearComposerAttachments(attachmentEntries);
        }
        await handleThreadContextCommand(threadContextCommand);
        return;
      }
      if (selectedComposerProjectTask && onComposerProjectTaskSubmit && taskText) {
        setIsPreparingRun(true);
        const resolvedAttachments = await resolveAttachmentPayload(attachmentEntries);
        const githubRepo = buildSelectedGithubRepoReference(attachmentEntries);
        const didHandleProjectTask = await onComposerProjectTaskSubmit({
          prompt: taskText,
          taskPreview: selectedComposerProjectTask,
          attachments: resolvedAttachments || [],
          environmentId: effectiveEnvironmentId ?? null,
          projectId: effectiveProjectId ?? null,
          agentId: effectiveAgentId ?? null,
          agentName: selectedAgent?.name || displayedAgentLabel || null,
          githubRepo: githubRepo || null,
          enabledSkills: enabledSkillsPayload || null,
          quotedSelection,
        });
        if (didHandleProjectTask !== false) {
          clearComposerDraft();
          clearComposerAttachments(attachmentEntries, {
            revokePreviews: false,
          });
          if (keepFocusOnSubmit) {
            focusComposerSoon();
          }
          await stopSpeechToText();
          return;
        }
        setIsPreparingRun(false);
      }
      if (stagedBacklogMissionControlCommand && onBacklogMissionControlSubmit) {
        const resolvedAttachments = await resolveAttachmentPayload(attachmentEntries);
        const githubRepo = buildSelectedGithubRepoReference(attachmentEntries);
        clearComposerDraft();
        clearComposerAttachments(attachmentEntries, {
          revokePreviews: false,
        });
        if (keepFocusOnSubmit) {
          focusComposerSoon();
        }
        await stopSpeechToText();
        await onBacklogMissionControlSubmit({
          prompt: taskText,
          attachments: resolvedAttachments || [],
          environmentId: effectiveEnvironmentId ?? null,
          projectId: effectiveProjectId ?? null,
          agentId: effectiveAgentId ?? null,
          ...(githubRepo
            ? {
                githubRepo: {
                  repoFullName: githubRepo.repoFullName,
                  repoName: githubRepo.repoName || githubRepo.repoFullName.split("/").pop() || githubRepo.repoFullName,
                  branch: githubRepo.branch || "main",
                },
              }
            : {}),
          ...(enabledSkillsPayload ? { enabledSkills: enabledSkillsPayload } : {}),
        });
        return;
      }

      clearComposerDraft();
      clearComposerAttachments(attachmentEntries, {
        revokePreviews: false,
      });
      if (keepFocusOnSubmit) {
        focusComposerSoon();
      }
      await stopSpeechToText();
      if (hasRunningTurn) {
        const queuedTurnId = generateId("turn");
        setTurns((prev) => [
          ...prev,
          {
            id: queuedTurnId,
            prompt: taskText,
            logs: [],
            startedAtMs: Date.now(),
            status: "queued",
            animateOnRender: true,
            isInitialTurn: prev.length === 0,
            agentName: selectedAgent?.name || displayedAgentLabel,
            environmentName: selectedEnvironment?.name || displayedEnvironmentLabel,
            quotedSelection,
            attachments: queuedTurnAttachments,
          },
        ]);
        setPendingQueuedMessages((prev) => [
          ...prev,
          {
            id: generateId("queue"),
            turnId: queuedTurnId,
            prompt: taskText,
            attachments: attachmentEntries,
            quotedSelection,
            backlogCommand,
            resourceCreationCommand,
            agentCreationCommand,
            skillCreationCommand,
          },
        ]);
        return;
      }

      setIsPreparingRun(true);
        const execution = await executeThreadRun(taskText, attachmentEntries, {
          quotedSelection,
          backlogCommand,
          resourceCreationCommand,
          agentCreationCommand,
          skillCreationCommand,
        });
      ensuredThreadId = execution.threadId;
    } catch (error) {
      const normalizedError = error instanceof Error ? error : new Error(String(error));
      if (consumeIntentionalStopAbort(normalizedError, ensuredThreadId ?? currentThreadId ?? null)) {
        return;
      }
      setInlineError(normalizedError.message);
      try {
        onRunError?.(normalizedError, ensuredThreadId ?? currentThreadId ?? undefined);
      } catch (callbackError) {
        reportRunnerLifecycleCallbackError("onRunError", callbackError);
      }
    } finally {
      setIsPreparingRun(false);
    }
  }

  useEffect(() => {
    if (isPreparingRun || hasRunningTurn || pendingQueuedMessages.length === 0 || isDrainingQueuedRunsRef.current) {
      return;
    }
    const nextQueuedMessage = pendingQueuedMessages[0];
    if (!nextQueuedMessage) {
      return;
    }

    isDrainingQueuedRunsRef.current = true;
    setPendingQueuedMessages((prev) => prev.filter((item) => item.id !== nextQueuedMessage.id));

    void (async () => {
      try {
        setIsPreparingRun(true);
        await executeThreadRun(nextQueuedMessage.prompt, nextQueuedMessage.attachments, {
          turnId: nextQueuedMessage.turnId,
          quotedSelection: nextQueuedMessage.quotedSelection,
          backlogCommand: nextQueuedMessage.backlogCommand,
          resourceCreationCommand: nextQueuedMessage.resourceCreationCommand,
          agentCreationCommand: nextQueuedMessage.agentCreationCommand,
          skillCreationCommand: nextQueuedMessage.skillCreationCommand,
        });
      } catch (error) {
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        if (consumeIntentionalStopAbort(normalizedError, currentThreadId ?? null)) {
          return;
        }
        setInlineError(normalizedError.message);
        try {
          onRunError?.(normalizedError, currentThreadId ?? undefined);
        } catch (callbackError) {
          reportRunnerLifecycleCallbackError("onRunError", callbackError);
        }
      } finally {
        isDrainingQueuedRunsRef.current = false;
      }
    })();
  }, [currentThreadId, hasRunningTurn, isPreparingRun, onRunError, pendingQueuedMessages]);

  function handleInputChange(event: ChangeEvent<HTMLTextAreaElement>) {
    const nextValue = event.target.value;
    if (!stagedThreadContextCommand && !stagedResourceCreationCommand && !stagedAgentCreationCommand && !stagedSkillCreationCommand && !stagedBacklogCommand) {
      const autoStageCommand = parseAutoStageThreadContextCommand(nextValue);
      if (autoStageCommand) {
        stageThreadContextCommand(autoStageCommand.action, autoStageCommand.prompt);
        return;
      }
      if (enableResourceCreationCommand) {
        const autoStageResourceCreationCommand = parseAutoStageResourceCreationCommand(nextValue);
        if (autoStageResourceCreationCommand) {
          stageResourceCreationCommand(autoStageResourceCreationCommand.action, autoStageResourceCreationCommand.prompt);
          return;
        }
      }
      if (enableAgentCreationCommand) {
        const autoStageAgentCreationCommand = parseAutoStageAgentCreationCommand(nextValue);
        if (autoStageAgentCreationCommand) {
          stageAgentCreationCommand(autoStageAgentCreationCommand.action, autoStageAgentCreationCommand.prompt);
          return;
        }
      }
      if (enableSkillCreationCommand) {
        const autoStageSkillCreationCommand = parseAutoStageSkillCreationCommand(nextValue);
        if (autoStageSkillCreationCommand) {
          stageSkillCreationCommand(autoStageSkillCreationCommand.action, autoStageSkillCreationCommand.prompt);
          return;
        }
      }
      if (enableBacklogSubtaskCommand) {
        const autoStageBacklogSubtaskCommand = parseAutoStageBacklogSubtaskCommand(nextValue);
        if (autoStageBacklogSubtaskCommand) {
          stageBacklogSubtaskCommand(autoStageBacklogSubtaskCommand.ticketNumber, autoStageBacklogSubtaskCommand.prompt);
          return;
        }
      }
      if (enableBacklogMissionControlCommand) {
        const autoStageBacklogMissionControlCommand = parseAutoStageBacklogMissionControlCommand(nextValue);
        if (autoStageBacklogMissionControlCommand) {
          stageBacklogMissionControlCommand(autoStageBacklogMissionControlCommand.prompt);
          return;
        }
      }
    }
    setInput(nextValue);

    if (isListening) {
      speechBaseInputRef.current = nextValue;
      speechTranscriptRef.current = "";
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Backspace" && stagedThreadContextCommand && input.length === 0) {
      event.preventDefault();
      setStagedThreadContextCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedResourceCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedResourceCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedAgentCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedAgentCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedSkillCreationCommand && input.length === 0) {
      event.preventDefault();
      setStagedSkillCreationCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedBacklogSubtaskCommand && input.length === 0) {
      event.preventDefault();
      setStagedBacklogSubtaskCommand(null);
      return;
    }
    if (event.key === "Backspace" && stagedBacklogMissionControlCommand && input.length === 0) {
      event.preventDefault();
      setStagedBacklogMissionControlCommand(null);
      return;
    }
    if (event.key !== "Enter") {
      return;
    }
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      if (canRun) {
        void runTask();
      }
      return;
    }
    if (event.shiftKey) {
      return;
    }
    if (!input.includes("\n")) {
      event.preventDefault();
      if (canRun) {
        void runTask();
      }
    }
  }

  function getTurnDurationSeconds(turn: RunnerTurn): number {
    const explicitDurationSeconds =
      typeof turn.durationSeconds === "number" && Number.isFinite(turn.durationSeconds)
        ? Math.max(0, Math.round(turn.durationSeconds))
        : null;
    if (explicitDurationSeconds !== null && explicitDurationSeconds > 0) {
      return explicitDurationSeconds;
    }

    const derivedEndMs = isRunningTurnStatus(turn.status)
      ? nowMs
      : Math.max(
          turn.completedAtMs ?? turn.startedAtMs,
          getTurnLatestProgressTimestampMs(turn)
        );
    const derivedDurationSeconds = Math.max(0, Math.round((derivedEndMs - turn.startedAtMs) / 1000));
    return derivedDurationSeconds > 0 ? derivedDurationSeconds : explicitDurationSeconds ?? derivedDurationSeconds;
  }

  function stepRowKey(turnId: string, index: number, log: RunnerLog): string {
    return `${turnId}-${index}-${log.eventType || "log"}-${(log.message || "").slice(0, 24)}`;
  }

  type RunnerSubagentGroup = {
    invocationLog: RunnerLog;
    logs: RunnerLog[];
    completionLog?: RunnerLog;
  };
  type RunnerComputerUseGroup = {
    id: string;
    startLog: RunnerLog;
    endLog: RunnerLog;
    logs: RunnerLog[];
    sessionLogs: RunnerLog[];
  };
  type RunnerSubagentPresentation = {
    invocationId: string;
    title: string;
    prompt?: string | null;
    environmentName: string;
    running: boolean;
    timeLabel?: string;
    responseMessage?: string | null;
    responseFailed: boolean;
    previewMessage: string;
    workLabel: string;
    nestedItems: RunnerTimelineItem[];
  };
  type RunnerComputerUsePresentation = {
    groupId: string;
    title: string;
    environmentName: string;
    running: boolean;
    timeLabel?: string;
    workLabel: string;
    nestedItems: RunnerTimelineItem[];
  };
  type RunnerTimelineItem =
    | { kind: "log"; log: RunnerLog }
    | { kind: "deep_research_group"; logs: RunnerLog[]; runningCommandLog?: RunnerLog }
    | { kind: "browser_group"; logs: RunnerLog[] }
    | { kind: "computer_use_group"; group: RunnerComputerUseGroup }
    | { kind: "subagent_group"; invocationLog: RunnerLog; logs: RunnerLog[]; completionLog?: RunnerLog };
  type RunnerTurnTimelineState = {
    agentMessage?: RunnerLog;
    displayedTimelineItems: RunnerTimelineItem[];
  };

  function isBrowserTimelineLog(log: RunnerLog): boolean {
    if (log.eventType !== "command_execution") return false;
    const command = log.metadata?.command || log.message || "";
    return isBrowserSkillCommand(command) && !isBrowserSkillLaunchCommand(command);
  }

  function isComputerUseTimelineLog(log: RunnerLog): boolean {
    return isComputerUseMcpLog(log);
  }

  function isTimelineTerminalLog(log: RunnerLog): boolean {
    return (
      log.eventType === "agent_message" ||
      log.eventType === "llm_response" ||
      log.eventType === "turn_completed"
    );
  }

  function getSubagentInvocationMetadata(log: RunnerLog) {
    return log.metadata?.subagentInvocation || null;
  }

  function getSubagentInvocationId(log: RunnerLog): string | null {
    const invocationId = getSubagentInvocationMetadata(log)?.invocationId;
    if (invocationId) {
      return invocationId;
    }
    const actor = log.metadata?.actor;
    if (actor?.kind === "subagent" && typeof actor.invocationId === "string" && actor.invocationId.trim()) {
      return actor.invocationId.trim();
    }
    return null;
  }

  function isSubagentInvocationLog(log: RunnerLog): boolean {
    return log.eventType === "subagent_invocation" && Boolean(getSubagentInvocationMetadata(log));
  }

  function logBelongsToSubagentInvocation(log: RunnerLog, invocationId: string): boolean {
    return getSubagentInvocationId(log) === invocationId;
  }

  function sanitizeSubagentResponseMessage(message: string | null | undefined): string {
    const cleaned = stripSystemTags(String(message || ""))
      .replace(/^\s*agentId:\s.*$/gim, "")
      .replace(/<usage>[\s\S]*?<\/usage>/gi, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return cleaned;
  }

  function buildSubagentTimelineGroups(logs: RunnerLog[]) {
    const groups = new Map<string, RunnerSubagentGroup>();
    const anchoredInvocationIds = new Set<string>();

    for (const log of logs) {
      if (!isSubagentInvocationLog(log)) {
        continue;
      }
      const invocationId = getSubagentInvocationId(log);
      if (invocationId) {
        anchoredInvocationIds.add(invocationId);
      }
    }

    for (const log of logs) {
      const invocationId = getSubagentInvocationId(log);
      if (!invocationId || !anchoredInvocationIds.has(invocationId)) {
        continue;
      }

      const existing = groups.get(invocationId);
      const invocationMetadata = getSubagentInvocationMetadata(log);
      const invocationStatus = invocationMetadata?.status || log.metadata?.status;
      const isCompletionLog = isSubagentInvocationLog(log) && invocationStatus && invocationStatus !== "started";

      if (!existing) {
        groups.set(invocationId, {
          invocationLog: log,
          logs: [],
          completionLog: isCompletionLog ? log : undefined,
        });
        continue;
      }

      if (isSubagentInvocationLog(log) && (!isSubagentInvocationLog(existing.invocationLog) || invocationStatus === "started")) {
        existing.invocationLog = log;
      }
      if (isCompletionLog) {
        existing.completionLog = log;
      }
      existing.logs.push(log);
    }

    for (const group of groups.values()) {
      const completionLog = group.completionLog && group.completionLog !== group.invocationLog ? group.completionLog : undefined;
      group.completionLog = completionLog;
      group.logs = group.logs.filter((log) => {
        if (log === group.invocationLog) {
          return false;
        }
        if (completionLog && log === completionLog) {
          return false;
        }
        return !isSubagentInvocationLog(log);
      });
    }

    return groups;
  }

  function collectBrowserTimelineLogs(logs: RunnerLog[], subagentGroups: Map<string, RunnerSubagentGroup>): RunnerLog[] {
    const browserLogs: RunnerLog[] = [];

    for (const currentLog of logs) {
      const invocationId = getSubagentInvocationId(currentLog);
      if (invocationId && subagentGroups.has(invocationId)) {
        continue;
      }
      if (isBrowserTimelineLog(currentLog)) {
        browserLogs.push(currentLog);
      }
    }

    return browserLogs;
  }

  function collectComputerUseTimelineLogs(logs: RunnerLog[], subagentGroups: Map<string, RunnerSubagentGroup>): RunnerLog[] {
    const computerUseLogs: RunnerLog[] = [];

    for (const currentLog of logs) {
      const invocationId = getSubagentInvocationId(currentLog);
      if (invocationId && subagentGroups.has(invocationId)) {
        continue;
      }
      if (isComputerUseTimelineLog(currentLog)) {
        computerUseLogs.push(currentLog);
      }
    }

    return computerUseLogs;
  }

  function buildComputerUseTimelineGroups(logs: RunnerLog[], subagentGroups: Map<string, RunnerSubagentGroup>) {
    const groups: RunnerComputerUseGroup[] = [];
    let activeGroup: RunnerComputerUseGroup | null = null;

    function closeActiveGroup() {
      if (!activeGroup) {
        return;
      }
      groups.push(activeGroup);
      activeGroup = null;
    }

    for (let index = 0; index < logs.length; index += 1) {
      const currentLog = logs[index];
      const invocationId = getSubagentInvocationId(currentLog);
      const belongsToSubagent = Boolean(invocationId && subagentGroups.has(invocationId));
      const isDeepResearchLog =
        !belongsToSubagent &&
        (currentLog.eventType === "deep_research" || isDeepResearchTimelineCommand(currentLog));
      const isBrowserLog = !belongsToSubagent && isBrowserTimelineLog(currentLog);

      if (belongsToSubagent || isDeepResearchLog || isBrowserLog || isTimelineTerminalLog(currentLog)) {
        closeActiveGroup();
        continue;
      }

      if (isComputerUseTimelineLog(currentLog)) {
        if (!activeGroup) {
          activeGroup = {
            id: `computer-use-${index}-${currentLog.time || "00:00"}`,
            startLog: currentLog,
            endLog: currentLog,
            logs: [currentLog],
            sessionLogs: [currentLog],
          };
        } else {
          activeGroup.logs.push(currentLog);
          activeGroup.sessionLogs.push(currentLog);
          activeGroup.endLog = currentLog;
        }
        continue;
      }

      if (activeGroup) {
        activeGroup.sessionLogs.push(currentLog);
      }
    }

    closeActiveGroup();
    return groups;
  }

  function isDeepResearchTimelineCommand(log: RunnerLog): boolean {
    return (
      log.eventType === "command_execution" &&
      isDeepResearchCommand(log.metadata?.command || log.message || "")
    );
  }

  function collectDeepResearchTimelineLogs(logs: RunnerLog[], subagentGroups: Map<string, RunnerSubagentGroup>): RunnerLog[] {
    const deepResearchLogs: RunnerLog[] = [];

    for (const currentLog of logs) {
      const invocationId = getSubagentInvocationId(currentLog);
      if (invocationId && subagentGroups.has(invocationId)) {
        continue;
      }
      if (currentLog.eventType === "deep_research") {
        deepResearchLogs.push(currentLog);
      }
    }

    return deepResearchLogs;
  }

  function buildTimelineItems(logs: RunnerLog[], options?: { groupComputerUse?: boolean }): RunnerTimelineItem[] {
    const subagentGroups = buildSubagentTimelineGroups(logs);
    const latestPermissionLogIndexById = new Map<string, number>();
    const latestPermissionLogById = new Map<string, RunnerLog>();
    logs.forEach((log, index) => {
      if (log.eventType !== "permission_request") return;
      const requestId = String(log.metadata?.permissionRequestId || "").trim();
      if (!requestId) return;
      latestPermissionLogIndexById.set(requestId, index);
      const previousLog = latestPermissionLogById.get(requestId);
      latestPermissionLogById.set(
        requestId,
        previousLog
          ? {
              ...log,
              metadata: {
                ...(previousLog.metadata || {}),
                ...(log.metadata || {}),
              },
            }
          : log
      );
    });
    const deepResearchLogs = collectDeepResearchTimelineLogs(logs, subagentGroups);
    const deepResearchCommandLog = logs.find((currentLog) => {
      const invocationId = getSubagentInvocationId(currentLog);
      if (invocationId && subagentGroups.has(invocationId)) {
        return false;
      }
      return isDeepResearchTimelineCommand(currentLog);
    });
    const browserLogs = collectBrowserTimelineLogs(logs, subagentGroups);
    const groupComputerUse = options?.groupComputerUse !== false;
    const computerUseLogs = collectComputerUseTimelineLogs(logs, subagentGroups);
    const computerUseGroups = groupComputerUse ? buildComputerUseTimelineGroups(logs, subagentGroups) : [];
    const computerUseGroupsByStartLog = new Map<RunnerLog, RunnerComputerUseGroup>();
    const computerUseSessionLogs = new Set<RunnerLog>();
    for (const group of computerUseGroups) {
      computerUseGroupsByStartLog.set(group.startLog, group);
      for (const sessionLog of group.sessionLogs) {
        computerUseSessionLogs.add(sessionLog);
      }
    }
    const items: RunnerTimelineItem[] = [];
    const shouldShowDeepResearchGroup = deepResearchLogs.length > 0 || Boolean(deepResearchCommandLog);
    let deepResearchGroupInserted = false;
    let browserGroupInserted = false;
    const insertedComputerUseGroupIds = new Set<string>();
    const insertedSubagentInvocations = new Set<string>();

    for (let index = 0; index < logs.length; index += 1) {
      const log = logs[index];
      if (log.eventType === "permission_request") {
        const requestId = String(log.metadata?.permissionRequestId || "").trim();
        if (requestId && latestPermissionLogIndexById.get(requestId) !== index) {
          continue;
        }
        items.push({ kind: "log", log: requestId ? latestPermissionLogById.get(requestId) || log : log });
        continue;
      }
      const invocationId = getSubagentInvocationId(log);
      if (invocationId && subagentGroups.has(invocationId)) {
        const group = subagentGroups.get(invocationId)!;
        if (!insertedSubagentInvocations.has(invocationId) && log === group.invocationLog) {
          items.push({
            kind: "subagent_group",
            invocationLog: group.invocationLog,
            logs: group.logs,
            completionLog: group.completionLog,
          });
          insertedSubagentInvocations.add(invocationId);
        }
        continue;
      }
      if (groupComputerUse && computerUseSessionLogs.has(log) && !computerUseGroupsByStartLog.has(log)) {
        continue;
      }
      if (log.eventType === "deep_research") {
        if (!deepResearchGroupInserted && shouldShowDeepResearchGroup) {
          items.push({ kind: "deep_research_group", logs: deepResearchLogs, runningCommandLog: deepResearchCommandLog });
          deepResearchGroupInserted = true;
        }
        continue;
      }
      if (isDeepResearchTimelineCommand(log)) {
        if (!deepResearchGroupInserted && shouldShowDeepResearchGroup) {
          items.push({ kind: "deep_research_group", logs: deepResearchLogs, runningCommandLog: deepResearchCommandLog || log });
          deepResearchGroupInserted = true;
        }
        continue;
      }
      if (isBrowserTimelineLog(log)) {
        if (!browserGroupInserted) {
          items.push({ kind: "browser_group", logs: browserLogs });
          browserGroupInserted = true;
        }
        continue;
      }
      if (isComputerUseTimelineLog(log)) {
        if (!groupComputerUse) {
          items.push({ kind: "log", log });
          continue;
        }
        const group = computerUseGroupsByStartLog.get(log);
        if (group && !insertedComputerUseGroupIds.has(group.id)) {
          items.push({ kind: "computer_use_group", group });
          insertedComputerUseGroupIds.add(group.id);
        }
        continue;
      }
      items.push({ kind: "log", log });
    }

    if (!deepResearchGroupInserted && shouldShowDeepResearchGroup) {
      items.push({ kind: "deep_research_group", logs: deepResearchLogs, runningCommandLog: deepResearchCommandLog });
    }

    if (!browserGroupInserted && browserLogs.length > 0) {
      items.push({ kind: "browser_group", logs: browserLogs });
    }

    if (groupComputerUse && computerUseLogs.length > 0) {
      for (const group of computerUseGroups) {
        if (!insertedComputerUseGroupIds.has(group.id) && group.logs.length > 0) {
          items.push({ kind: "computer_use_group", group });
        }
      }
    }

    return items;
  }

  function buildSubagentGroupPresentation(turn: RunnerTurn, item: RunnerSubagentGroup): RunnerSubagentPresentation {
    const invocation = getSubagentInvocationMetadata(item.invocationLog);
    const invocationId = getSubagentInvocationId(item.invocationLog) || `subagent-${turn.id}`;
    const fallbackCompletionLog =
      !item.completionLog &&
      isSubagentInvocationLog(item.invocationLog) &&
      getSubagentInvocationMetadata(item.invocationLog)?.status !== "started"
        ? item.invocationLog
        : undefined;
    const completionLog = item.completionLog || fallbackCompletionLog;
    const latestNestedLog = item.logs[item.logs.length - 1] || completionLog || item.invocationLog;
    const subagentTitle =
      invocation?.agentName ||
      item.invocationLog.metadata?.delegatedTo?.agentName ||
      turn.agentName ||
      displayedAgentLabel ||
      "Subagent";
    const subagentEnvironmentLabel = turn.environmentName || displayedEnvironmentLabel || "Environment";
    const isSubagentRunning = isRunningTurnStatus(turn.status) && !completionLog;
    const completionOutput = sanitizeSubagentResponseMessage(
      typeof completionLog?.metadata?.output === "string" ? completionLog.metadata.output : ""
    );
    const completionFailed =
      completionLog?.metadata?.status === "failed" ||
      completionLog?.type === "error" ||
      completionLog?.metadata?.exitCode === 1;
    const previewMessage = completionOutput.trim()
      || (isSubagentRunning ? `${subagentTitle} is working` : completionFailed ? `${subagentTitle} failed` : `${subagentTitle} finished`);
    const nestedDurationLabel =
      completionLog && completionLog !== item.invocationLog
        ? getRunnerLogRangeDurationLabel(item.invocationLog, completionLog, turn.startedAtMs)
        : undefined;
    const nestedWorkLabel = isSubagentRunning
      ? "Working..."
      : `Worked for ${nestedDurationLabel || toDurationLabel(completionLog || latestNestedLog, turn.startedAtMs) || "0s"}`;

    return {
      invocationId,
      title: subagentTitle,
      prompt: invocation?.message || invocation?.description,
      environmentName: subagentEnvironmentLabel,
      running: isSubagentRunning,
      timeLabel: toDurationLabel(completionLog || latestNestedLog, turn.startedAtMs),
      responseMessage: completionOutput,
      responseFailed: completionFailed,
      previewMessage,
      workLabel: nestedWorkLabel,
      nestedItems: buildTimelineItems(item.logs),
    };
  }

  function buildComputerUseGroupPresentation(turn: RunnerTurn, item: RunnerComputerUseGroup): RunnerComputerUsePresentation {
    const computerUseTitle = "Computer Use";
    const computerUseEnvironmentLabel = turn.environmentName || displayedEnvironmentLabel || "Environment";
    const interactionCount = item.logs.length;
    const isComputerUseRunning =
      isRunningTurnStatus(turn.status) &&
      item.endLog.metadata?.status !== "failed" &&
      item.endLog.metadata?.status !== "completed";

    return {
      groupId: item.id,
      title: computerUseTitle,
      environmentName: computerUseEnvironmentLabel,
      running: isComputerUseRunning,
      timeLabel: toDurationLabel(item.endLog || item.startLog, turn.startedAtMs),
      workLabel: `${interactionCount} ${interactionCount === 1 ? "interaction" : "interactions"}`,
      nestedItems: buildTimelineItems(item.sessionLogs, { groupComputerUse: false }),
    };
  }

  function timelineItemKey(turnId: string, index: number, item: RunnerTimelineItem): string {
    if (item.kind === "deep_research_group") {
      const anchorLog = item.logs[0] || item.runningCommandLog;
      return anchorLog ? `${turnId}-deep-research-${stepRowKey(turnId, index, anchorLog)}` : `${turnId}-deep-research-${index}`;
    }
    if (item.kind === "browser_group") {
      const anchorLog = item.logs[0] || item.logs[item.logs.length - 1];
      return anchorLog ? `${turnId}-browser-${stepRowKey(turnId, index, anchorLog)}` : `${turnId}-browser-${index}`;
    }
    if (item.kind === "computer_use_group") {
      const anchorLog = item.group.startLog || item.group.endLog;
      return anchorLog ? `${turnId}-computer-use-${item.group.id}-${stepRowKey(turnId, index, anchorLog)}` : `${turnId}-computer-use-${item.group.id}-${index}`;
    }
    if (item.kind === "subagent_group") {
      const invocationId = getSubagentInvocationMetadata(item.invocationLog)?.invocationId || index;
      return `${turnId}-subagent-${invocationId}-${item.logs.length}`;
    }
    return stepRowKey(turnId, index, item.log);
  }

  function getTurnTimelineState(turn: RunnerTurn): RunnerTurnTimelineState {
    const agentMessage = [...turn.logs]
      .reverse()
      .find((log) => log.eventType === "agent_message" || log.eventType === "llm_response");
    const timelineLogs = dedupeAdjacentRunnerLogs(
      turn.logs.filter((log) => shouldDisplayTimelineLog(log) && !isDuplicateAssistantSummaryTimelineLog(log, agentMessage))
    );
    const displayedTimelineLogs =
      timelineLogs.length === 0 && isRunningTurnStatus(turn.status)
        ? [
            {
              time: "00:00",
              message: "Setting up workspace...",
              type: "info" as const,
              eventType: "setup" as const,
            },
          ]
        : timelineLogs;
    const displayedTimelineItems = buildTimelineItems(displayedTimelineLogs);
    const hasDeepResearchGroup = displayedTimelineItems.some((item) => item.kind === "deep_research_group");
    const fallbackDeepResearchCommandLog = displayedTimelineLogs.find((log) => isDeepResearchTimelineCommand(log));
    const matchedDeepResearchSession = resolveDeepResearchSessionForGroup({
      logs: [],
      runningCommandLog: fallbackDeepResearchCommandLog,
      turn,
      sessions: deepResearchSessions,
    });
    const latestPrimaryTurn =
      [...turns].reverse().find(
        (candidateTurn) => candidateTurn.presentation !== "btw" && candidateTurn.presentation !== "context-action-notice"
      ) || null;
    const fallbackSessionForLatestTurn =
      !matchedDeepResearchSession &&
      latestPrimaryTurn?.id === turn.id
        ? activeDeepResearchThreadSession
        : null;
    const effectiveDeepResearchSession = matchedDeepResearchSession || fallbackSessionForLatestTurn;
    const shouldInjectSessionBackedDeepResearchGroup =
      !hasDeepResearchGroup &&
      Boolean(effectiveDeepResearchSession);

    return {
      agentMessage,
      displayedTimelineItems:
        shouldInjectSessionBackedDeepResearchGroup
          ? [{ kind: "deep_research_group", logs: [], runningCommandLog: fallbackDeepResearchCommandLog }, ...displayedTimelineItems]
          : displayedTimelineItems,
    };
  }

  function clearThinkingStatusTimers(turnId: string) {
    const timers = thinkingStatusTimersRef.current[turnId];
    if (timers?.hideTimer) {
      window.clearTimeout(timers.hideTimer);
    }
    if (timers?.showTimer) {
      window.clearTimeout(timers.showTimer);
    }
    delete thinkingStatusTimersRef.current[turnId];
  }

  function setVisibleTimelineItemCount(turnId: string, nextCount: number) {
    setVisibleTimelineItemCountsByTurn((prev) => {
      if (prev[turnId] === nextCount) {
        return prev;
      }
      const next = { ...prev, [turnId]: nextCount };
      visibleTimelineItemCountsRef.current = next;
      return next;
    });
  }

  function setThinkingStatusPhase(turnId: string, nextPhase: RunnerThinkingStatusPhase) {
    setThinkingStatusPhaseByTurn((prev) => {
      if (prev[turnId] === nextPhase) {
        return prev;
      }
      const next = { ...prev, [turnId]: nextPhase };
      thinkingStatusPhaseByTurnRef.current = next;
      return next;
    });
  }

  function removeThinkingStatusState(turnId: string) {
    setVisibleTimelineItemCountsByTurn((prev) => {
      if (!(turnId in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[turnId];
      visibleTimelineItemCountsRef.current = next;
      return next;
    });
    setThinkingStatusPhaseByTurn((prev) => {
      if (!(turnId in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[turnId];
      thinkingStatusPhaseByTurnRef.current = next;
      return next;
    });
    delete rawTimelineItemCountsRef.current[turnId];
    delete thinkingStatusEligibilityRef.current[turnId];
    clearThinkingStatusTimers(turnId);
  }

  useEffect(() => {
    visibleTimelineItemCountsRef.current = visibleTimelineItemCountsByTurn;
  }, [visibleTimelineItemCountsByTurn]);

  useEffect(() => {
    const activeTurnIds = new Set(turns.map((turn) => turn.id));
    setVisibleWorkLogItemCountsByTurn((previousCounts) => {
      let didChange = false;
      const nextCounts = { ...previousCounts };
      for (const turnId of Object.keys(nextCounts)) {
        if (!activeTurnIds.has(turnId)) {
          delete nextCounts[turnId];
          didChange = true;
        }
      }
      return didChange ? nextCounts : previousCounts;
    });
  }, [turns]);

  useEffect(() => {
    thinkingStatusPhaseByTurnRef.current = thinkingStatusPhaseByTurn;
  }, [thinkingStatusPhaseByTurn]);

  useEffect(() => {
    const activeTurnIds = new Set<string>();

    for (const turn of turns) {
      const { agentMessage, displayedTimelineItems } = getTurnTimelineState(turn);
      const rawItemCount = displayedTimelineItems.length;
      const canShowThinkingStatus = isRunningTurnStatus(turn.status) && rawItemCount > 0 && !agentMessage?.message;
      const visibleItemCount = visibleTimelineItemCountsRef.current[turn.id];
      const thinkingPhase = thinkingStatusPhaseByTurnRef.current[turn.id] ?? "hidden";

      activeTurnIds.add(turn.id);
      rawTimelineItemCountsRef.current[turn.id] = rawItemCount;
      thinkingStatusEligibilityRef.current[turn.id] = canShowThinkingStatus;

      if (visibleItemCount === undefined) {
        setVisibleTimelineItemCount(turn.id, rawItemCount);
      }

      if (!canShowThinkingStatus) {
        clearThinkingStatusTimers(turn.id);
        setVisibleTimelineItemCount(turn.id, rawItemCount);
        setThinkingStatusPhase(turn.id, "hidden");
        continue;
      }

      const currentVisibleItemCount = visibleTimelineItemCountsRef.current[turn.id] ?? rawItemCount;

      if (rawItemCount < currentVisibleItemCount) {
        clearThinkingStatusTimers(turn.id);
        setVisibleTimelineItemCount(turn.id, rawItemCount);
        setThinkingStatusPhase(turn.id, "visible");
        continue;
      }

      if (rawItemCount > currentVisibleItemCount) {
        if (thinkingPhase === "visible") {
          setThinkingStatusPhase(turn.id, "fading");
          clearThinkingStatusTimers(turn.id);
          const timers = thinkingStatusTimersRef.current[turn.id] || {};
          timers.hideTimer = window.setTimeout(() => {
            const latestVisibleItemCount = rawTimelineItemCountsRef.current[turn.id] ?? 0;
            setVisibleTimelineItemCount(turn.id, latestVisibleItemCount);
            setThinkingStatusPhase(turn.id, "hidden");

            const nextTimers = thinkingStatusTimersRef.current[turn.id] || {};
            if (nextTimers.showTimer) {
              window.clearTimeout(nextTimers.showTimer);
            }
            nextTimers.showTimer = window.setTimeout(() => {
              if (thinkingStatusEligibilityRef.current[turn.id]) {
                setThinkingStatusPhase(turn.id, "visible");
              }
            }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS + RUNNER_THINKING_STATUS_REAPPEAR_DELAY_MS);
            thinkingStatusTimersRef.current[turn.id] = nextTimers;
          }, RUNNER_THINKING_STATUS_FADE_DURATION_MS);
          thinkingStatusTimersRef.current[turn.id] = timers;
        } else if (thinkingPhase === "hidden") {
          setVisibleTimelineItemCount(turn.id, rawItemCount);
          const timers = thinkingStatusTimersRef.current[turn.id] || {};
          if (timers.showTimer) {
            window.clearTimeout(timers.showTimer);
          }
          timers.showTimer = window.setTimeout(() => {
            if (thinkingStatusEligibilityRef.current[turn.id]) {
              setThinkingStatusPhase(turn.id, "visible");
            }
          }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS + RUNNER_THINKING_STATUS_REAPPEAR_DELAY_MS);
          thinkingStatusTimersRef.current[turn.id] = timers;
        }
        continue;
      }

      if (thinkingPhase !== "fading" && thinkingPhase !== "visible") {
        setThinkingStatusPhase(turn.id, "visible");
      }
    }

    for (const turnId of Object.keys(rawTimelineItemCountsRef.current)) {
      if (!activeTurnIds.has(turnId)) {
        removeThinkingStatusState(turnId);
      }
    }
  }, [turns]);

  useEffect(() => {
    return () => {
      for (const turnId of Object.keys(thinkingStatusTimersRef.current)) {
        clearThinkingStatusTimers(turnId);
      }
    };
  }, []);

  function renderCommandIcon(icon: CommandRowSummary["icon"]) {
    if (icon === "read") return <IconReadFile className="tb-step-row-icon" />;
    if (icon === "list") return <IconFolder className="tb-step-row-icon" />;
    if (icon === "write") return <IconWriteFile className="tb-step-row-icon" />;
    return <IconTerminal className="tb-step-row-icon" />;
  }

  function renderNestedTimelineItems(turn: RunnerTurn, items: RunnerTimelineItem[]) {
    return items.map((nestedItem, nestedIndex) => (
      <div key={timelineItemKey(turn.id, nestedIndex, nestedItem)} className="agent-step-item">
        <div className="agent-step-content">{renderTimelineItem(turn, nestedItem, nestedIndex, { renderComputerUseMcpAsGeneric: true })}</div>
      </div>
    ));
  }

  async function handlePermissionDecision(log: RunnerLog, decision: "allow" | "deny") {
    const requestId = String(log.metadata?.permissionRequestId || "").trim();
    if (!currentThreadId || !requestId || !normalizedBackendUrl || !apiKey.trim()) {
      return;
    }
    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    headers.set("Content-Type", "application/json");
    const response = await fetch(
      `${normalizedBackendUrl}/threads/${encodeURIComponent(currentThreadId)}/permission-requests/${encodeURIComponent(requestId)}/decision`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({ decision }),
      }
    );
    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new Error(bodyText || `Failed to ${decision === "allow" ? "approve" : "deny"} permission request (${response.status})`);
    }
    const decisionResult = await response.json().catch(() => null) as { active?: boolean } | null;
    const nextTurnStatus: RunnerTurnStatus = decisionResult?.active === false
      ? (decision === "allow" ? "completed" : "cancelled")
      : "running";
    const completedAtMs = decisionResult?.active === false ? Date.now() : undefined;
    setTurns((previousTurns) =>
      previousTurns.map((turn) => ({
        ...turn,
        status: turn.status === "permission_asked" ? nextTurnStatus : turn.status,
        completedAtMs: turn.status === "permission_asked" && completedAtMs ? completedAtMs : turn.completedAtMs,
        logs: turn.logs.map((entry) => {
          if (entry.metadata?.permissionRequestId !== requestId) {
            return entry;
          }
          return {
            ...entry,
            type: decision === "allow" ? "success" : "warning",
            metadata: {
              ...entry.metadata,
              status: decision === "allow" ? "approved" : "denied",
              decision: decision === "allow" ? "approved" : "denied",
            },
          };
        }),
      }))
    );
    try {
      onThreadStatusChange?.(currentThreadId, nextTurnStatus);
    } catch (error) {
      reportRunnerLifecycleCallbackError("onThreadStatusChange", error);
    }
  }

  function renderTimelineItem(turn: RunnerTurn, item: RunnerTimelineItem, index: number, options?: { renderComputerUseMcpAsGeneric?: boolean }) {
    const runnerEnvironmentId = scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null;
    const runnerHeaders = buildRunnerHeaders(requestHeaders, apiKey.trim());

    if (item.kind === "browser_group") {
      const latestLog = item.logs[item.logs.length - 1];
      return (
        <BrowserSkillLogBox
          log={latestLog}
          logs={item.logs}
          timeLabel={latestLog ? toDurationLabel(latestLog, turn.startedAtMs) : undefined}
          backendUrl={normalizedBackendUrl}
          environmentId={runnerEnvironmentId}
          requestHeaders={runnerHeaders}
        />
      );
    }

    if (item.kind === "computer_use_group") {
      const latestLog = item.group.logs[item.group.logs.length - 1] || item.group.endLog;
      const computerUseEnvironmentName =
        turn.environmentName || scopedActiveThreadEnvironmentName || selectedEnvironment?.name || displayedEnvironmentLabel || "Environment";
      return (
        <BrowserSkillLogBox
          log={latestLog}
          logs={item.group.logs}
          timeLabel={latestLog ? toDurationLabel(latestLog, turn.startedAtMs) : undefined}
          backendUrl={normalizedBackendUrl}
          environmentId={runnerEnvironmentId}
          requestHeaders={runnerHeaders}
          environmentName={computerUseEnvironmentName}
          isDetailOpen={
            selectedComputerUseDetail?.turnId === turn.id &&
            selectedComputerUseDetail?.groupId === item.group.id
          }
          onOpenEnvironmentDesktop={() => {
            void openEnvironmentDesktopWindow(runnerEnvironmentId, computerUseEnvironmentName);
          }}
          onOpenDetails={() => openComputerUseDetailDrawer(turn.id, item.group.id)}
        />
      );
    }

    if (item.kind === "deep_research_group") {
      const firstLog = item.logs[0] || item.runningCommandLog;
      const deepResearchSession = resolveDeepResearchSessionForGroup({
        logs: item.logs,
        runningCommandLog: item.runningCommandLog,
        turn,
        sessions: deepResearchSessions,
      });
      return (
        <DeepResearchLogBox
          log={item.runningCommandLog}
          logs={item.logs}
          runningCommandLog={item.runningCommandLog}
          session={deepResearchSession}
          timeLabel={firstLog ? toDurationLabel(firstLog, turn.startedAtMs) : undefined}
          fallbackTopic={extractDeepResearchTopicFromGroup(item.logs, item.runningCommandLog) || turn.prompt || null}
          isDetailOpen={selectedDeepResearchDetail?.turnId === turn.id}
          onOpenDetails={() => openDeepResearchDetailDrawer(turn.id)}
        />
      );
    }

    if (item.kind === "subagent_group") {
      const presentation = buildSubagentGroupPresentation(turn, item);

      return (
        <SubagentLogBox
          title={presentation.title}
          prompt={presentation.prompt}
          timeLabel={presentation.timeLabel}
          running={presentation.running}
          summaryMessage={presentation.previewMessage}
          isDetailOpen={
            selectedSubagentDetail?.turnId === turn.id &&
            selectedSubagentDetail?.invocationId === presentation.invocationId
          }
          onOpenDetails={() => openSubagentDetailDrawer(turn.id, presentation.invocationId)}
        />
      );
    }

    if (!shouldDisplayTimelineLog(item.log)) return null;
    return (
      <RunnerWorkLogEntry
        log={item.log}
        timeLabel={toDurationLabel(item.log, turn.startedAtMs)}
        backendUrl={normalizedBackendUrl}
        environmentId={runnerEnvironmentId}
        requestHeaders={runnerHeaders}
        renderComputerUseMcpAsGeneric={options?.renderComputerUseMcpAsGeneric}
        activeTaskPreviewId={activeTaskPreviewId}
        availableAgents={agents}
        availableEnvironments={availableEnvironments}
        availableProjects={availableProjects}
        onPreviewDocument={(attachment) => toggleDocumentAttachmentPreview(attachment)}
        onTaskPreviewClick={onTaskPreviewClick}
        onAgentPreviewClick={(agent) => {
          if (typeof onAgentTurnClick !== "function") return;
          onAgentTurnClick({
            turnId: turn.id,
            agentId: agent.agentId || undefined,
            agentName: agent.agentName || undefined,
          });
        }}
        onEnvironmentPreviewClick={(environment) => {
          const normalizedEnvironmentId = String(environment.environmentId || "").trim();
          if (!normalizedEnvironmentId) return;
          onResourcePreviewClick?.({
            id: normalizedEnvironmentId,
            name: String(environment.environmentName || "Environment").trim() || "Environment",
            resourceType: "environment",
            description: null,
            model: null,
            category: null,
            projectId: null,
            projectName: null,
            isDefault: false,
            status: null,
          });
        }}
        onProjectPreviewClick={(project) => {
          const normalizedProjectId = String(project.projectId || "").trim();
          if (!normalizedProjectId) return;
          onResourcePreviewClick?.({
            id: normalizedProjectId,
            name: String(project.projectName || "Project").trim() || "Project",
            resourceType: "project",
            description: null,
            model: null,
            category: null,
            projectId: normalizedProjectId,
            projectName: String(project.projectName || "").trim() || null,
            isDefault: false,
            status: null,
          });
        }}
        onPermissionDecision={handlePermissionDecision}
        onWorkspacePathClick={(path) => handleSummaryWorkspacePathClick(turn, path, "working_log")}
      />
    );
  }

  function renderSkillIcon(skill: RunnerChatSkill, className: string) {
    if (skill.isCustom) {
      const CustomSkillIcon = customSkillIconComponent(skill.icon);
      return <CustomSkillIcon className={className} strokeWidth={1.75} />;
    }
    if (skill.id === "image_generation") return <LucideImages className={className} strokeWidth={1.75} />;
    if (skill.id === "web_search") return <LucideGlobe className={className} strokeWidth={1.75} />;
    if (skill.id === "deep_research" || skill.id === "research") return <LucideTelescope className={className} strokeWidth={1.75} />;
    if (skill.id === "browser") return <LucideMonitor className={className} strokeWidth={1.75} />;
    if (skill.id === "pdf") return <LucideFileText className={className} strokeWidth={1.75} />;
    if (skill.id === "frontend_design") return <LucidePalette className={className} strokeWidth={1.75} />;
    if (skill.id === "pptx") return <LucideLayers className={className} strokeWidth={1.75} />;
    if (skill.id === "memory") return <LucideBrain className={className} strokeWidth={1.75} />;
    if (skill.id === "task_management") return <LucideListTodo className={className} strokeWidth={1.75} />;
    if (skill.id === "computer_agents") {
      return <img src={RUNNER_TRANSPARENT_LOGO_URL} alt="" aria-hidden="true" draggable={false} className={className} style={{ objectFit: "contain" }} />;
    }
    return <LucideLayers className={className} strokeWidth={1.75} />;
  }

  function renderAttachmentPreviewChip(
    attachment: LocalAttachment | RunnerTurnAttachment,
    options?: { removable?: boolean; onRemove?: () => void }
  ) {
    const filename = getAttachmentDisplayName(attachment);
    const githubBranch = isGithubAttachmentSelection(attachment) ? getGithubAttachmentRef(attachment) : "";
    const previewUrl = getAttachmentPreviewUrl(attachment);
    const isImage = attachment.type === "image";
    const isGithubAttachment = isGithubAttachmentSelection(attachment);
    const isUploading = attachment.uploadStatus === "uploading";
    const isDocumentPreviewable =
      !isImage && !isGithubAttachment && !options?.removable && !isLocalAttachmentRecord(attachment) && isAttachmentDocumentPreviewable(attachment);
    const isDocumentPreviewActive =
      isDocumentPreviewable && previewedDocumentAttachment?.id === attachment.id;
    const imageFetchHeaders =
      isImage && !isLocalAttachmentRecord(attachment) && requiresAuthenticatedAttachmentPreview(previewUrl, normalizedBackendUrl)
        ? authenticatedAttachmentFetchHeaders
        : undefined;

    return (
      <div
        className={`runner-attachment ${isImage ? "runner-attachment-image" : "runner-attachment-file"} ${isGithubAttachment ? "runner-attachment-github" : ""} ${isUploading ? "runner-attachment-uploading" : ""} ${options?.removable ? "runner-attachment-removable" : "runner-attachment-readonly"} ${isDocumentPreviewable ? "runner-attachment-document-previewable" : ""} ${isDocumentPreviewActive ? "runner-attachment-document-active" : ""}`.trim()}
        key={attachment.id}
      >
        {isImage ? (
          <>
            <span className="runner-attachment-image-frame">
              {previewUrl ? (
                <RunnerImagePreviewSurface
                  src={previewUrl}
                  alt={filename}
                  mimeType={isLocalAttachmentRecord(attachment) ? attachment.file.type : attachment.mimeType}
                  className={`runner-attachment-image-button ${previewUrl ? "is-clickable" : ""}`.trim()}
                  imageClassName="runner-attachment-image-preview"
                  fetchHeaders={imageFetchHeaders}
                />
              ) : (
                <span className="runner-attachment-image-placeholder" aria-hidden="true">
                  <img src={RUNNER_IMAGE_FILE_ICON_URL} alt="" aria-hidden="true" draggable={false} />
                </span>
              )}
              {isUploading ? (
                <span className="runner-attachment-upload-indicator" aria-hidden="true">
                  <LucideLoaderCircle className="runner-attachment-upload-indicator-icon tb-context-action-notice-icon-spinner" strokeWidth={1.9} />
                </span>
              ) : null}
            </span>
            {options?.removable && options.onRemove ? (
              <button
                type="button"
                className="runner-attachment-remove runner-attachment-remove-image"
                onClick={(event) => {
                  event.stopPropagation();
                  options.onRemove?.();
                }}
                aria-label={`Remove ${filename}`}
              >
                <LucideX className="runner-attachment-remove-icon" strokeWidth={2} />
              </button>
            ) : null}
          </>
        ) : (
          <>
            {isDocumentPreviewable ? (
              <button
                type="button"
                className="runner-attachment-file-button"
                onClick={() => toggleDocumentAttachmentPreview(attachment)}
                aria-label={`Preview ${filename}`}
              >
                <span className="runner-attachment-file-icon-slot" aria-hidden="true">
                  {isUploading ? (
                    <LucideLoaderCircle className="runner-attachment-file-upload-indicator tb-context-action-notice-icon-spinner" strokeWidth={1.9} />
                  ) : isGithubAttachment ? (
                    <IconGithub className="runner-attachment-file-brand-icon runner-attachment-file-brand-icon-github" />
                  ) : (
                    <img
                      src={RUNNER_TEXT_FILE_ICON_URL}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="runner-attachment-file-icon"
                    />
                  )}
                </span>
                <div className="runner-attachment-file-copy">
                  <div className="runner-attachment-file-name" title={filename}>
                    {filename}
                  </div>
                  {githubBranch ? (
                    <span className="runner-attachment-file-branch" title={githubBranch}>
                      {githubBranch}
                    </span>
                  ) : null}
                </div>
              </button>
            ) : (
              <>
                <span className="runner-attachment-file-icon-slot" aria-hidden="true">
                  {isUploading ? (
                    <LucideLoaderCircle className="runner-attachment-file-upload-indicator tb-context-action-notice-icon-spinner" strokeWidth={1.9} />
                  ) : isGithubAttachment ? (
                    <IconGithub className="runner-attachment-file-brand-icon runner-attachment-file-brand-icon-github" />
                  ) : (
                    <img
                      src={RUNNER_TEXT_FILE_ICON_URL}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className="runner-attachment-file-icon"
                    />
                  )}
                </span>
                <div className="runner-attachment-file-copy">
                  <div className="runner-attachment-file-name" title={filename}>
                    {filename}
                  </div>
                  {githubBranch ? (
                    <span className="runner-attachment-file-branch" title={githubBranch}>
                      {githubBranch}
                    </span>
                  ) : null}
                </div>
              </>
            )}
            {options?.removable && options.onRemove ? (
              <button
                type="button"
                className="runner-attachment-remove runner-attachment-remove-file"
                onClick={options.onRemove}
                aria-label={`Remove ${filename}`}
              >
                <LucideX className="runner-attachment-remove-icon" strokeWidth={2} />
              </button>
            ) : null}
          </>
        )}
      </div>
    );
  }

  const effectiveStatus = isPreparingRun ? "running" : status;
  const statusToneValue = statusTone(effectiveStatus);
  const selectedAgent = agents.find((agent) => agent.id === selectedAgentId) || agents[0];
  const selectedEnvironment =
    availableEnvironments.find((environment) => environment.id === selectedEnvironmentId) ||
    availableEnvironments.find((environment) => environment.isDefault) ||
    availableEnvironments[0];
  const displayedAgentLabel = hasApiKey ? selectedAgent?.name || "Agent" : "Default Agent";
  const displayedEnvironmentLabel = hasApiKey ? selectedEnvironment?.name || "Default" : "Default";
  const displayedWorkspaceLabel = hasApiKey
    ? effectiveWorkspaceSelectorMode === "projects" && selectedProject
      ? selectedProject.name || "Project"
      : displayedEnvironmentLabel
    : "Default";
  const availableAgentPhotoEntries = useMemo(
    () =>
      agents
        .map((agent) => ({
          label: String(agent?.name || "").trim(),
          photoUrl: getRunnerAgentOptionPhotoUrl(agent),
        }))
        .filter((entry) => entry.label),
    [agents]
  );
  const selectedAgentPhotoUrl = getRunnerAgentOptionPhotoUrl(selectedAgent);
  const resolveTurnAgentPhotoUrl = useCallback((agentLabel: string | null | undefined) => {
    const normalizedLabel = String(agentLabel || "").trim().toLowerCase();
    if (!normalizedLabel) {
      return "";
    }
    const missionControlAgentLabel = getRunnerMissionControlAgentName(threadMissionControlPreview).toLowerCase();
    const missionControlAgentPhotoUrl = getRunnerMissionControlAgentPhotoUrl(threadMissionControlPreview);
    if (normalizedLabel === missionControlAgentLabel && missionControlAgentPhotoUrl) {
      return missionControlAgentPhotoUrl;
    }
    const exactMatch = availableAgentPhotoEntries.find((entry) => entry.label.trim().toLowerCase() === normalizedLabel);
    if (exactMatch?.photoUrl) {
      return exactMatch.photoUrl;
    }
    return String(displayedAgentLabel || "").trim().toLowerCase() === normalizedLabel
      ? selectedAgentPhotoUrl
      : "";
  }, [availableAgentPhotoEntries, displayedAgentLabel, selectedAgentPhotoUrl, threadMissionControlPreview]);
  const handleTurnAgentClick = useCallback((turn: RunnerTurn, turnAgentLabel: string) => {
    if (typeof onAgentTurnClick !== "function") {
      return;
    }
    const normalizedAgentName = String(turnAgentLabel || turn.agentName || "").trim();
    const normalizedSelectedAgentId = String(selectedAgent?.id || effectiveAgentId || agentId || "").trim();
    const normalizedSelectedAgentName = String(selectedAgent?.name || "").trim().toLowerCase();
    const resolvedAgentId =
      normalizedAgentName
      && normalizedSelectedAgentId
      && normalizedSelectedAgentName
      && normalizedAgentName.toLowerCase() === normalizedSelectedAgentName
        ? normalizedSelectedAgentId
        : "";
    onAgentTurnClick({
      turnId: turn.id,
      agentId: resolvedAgentId || undefined,
      agentName: normalizedAgentName || undefined,
    });
  }, [agentId, effectiveAgentId, onAgentTurnClick, selectedAgent]);
  const renderTurnAgentTrigger = useCallback((turn: RunnerTurn, turnAgentLabel: string, turnAgentPhotoUrl: string) => {
    const content = (
      <>
        {renderTurnAgentAvatar(turnAgentLabel, turnAgentPhotoUrl)}
        <span className="tb-turn-agent-name">{turnAgentLabel}</span>
      </>
    );
    if (typeof onAgentTurnClick !== "function" || !String(turnAgentLabel || "").trim()) {
      return <div className="tb-turn-agent">{content}</div>;
    }
    return (
      <button
        type="button"
        className="tb-turn-agent tb-turn-agent-button"
        onClick={() => handleTurnAgentClick(turn, turnAgentLabel)}
        aria-label={`Open agent details for ${turnAgentLabel}`}
        title={`Open ${turnAgentLabel}`}
      >
        {content}
      </button>
    );
  }, [handleTurnAgentClick, onAgentTurnClick]);
  const handleSummaryWorkspacePathClick = useCallback((turn: RunnerTurn, path: string, sourceType: RunnerQuotedSelectionSource) => {
    if (typeof onSummaryWorkspacePathClick !== "function") {
      return;
    }

    const normalizedPath = String(path || "").trim();
    if (!normalizedPath) {
      return;
    }

    onSummaryWorkspacePathClick({
      path: normalizedPath,
      turnId: turn.id,
      threadId: threadId || null,
      environmentId: summaryPreviewEnvironmentId,
      agentName: turn.agentName || null,
      sourceType,
    });
  }, [onSummaryWorkspacePathClick, summaryPreviewEnvironmentId, threadId]);
  const threadHistoryItems = useMemo<RunnerThreadHistoryItem[]>(() => {
    return turns.flatMap((turn, turnIndex) => {
      const items: RunnerThreadHistoryItem[] = [];
      const normalizedPrompt = turn.prompt.trim();
      const isBtwTurn = turn.presentation === "btw" || normalizedPrompt.toLowerCase().startsWith("/btw");
      const taskPreviewForTurn =
        threadTaskPreview &&
        !isBtwTurn &&
        turn.presentation !== "context-action-notice" &&
        (turn.isInitialTurn || turnIndex === 0)
          ? threadTaskPreview
          : null;
      const missionControlPreviewForTurn =
        !taskPreviewForTurn &&
        threadMissionControlPreview &&
        !isBtwTurn &&
        turn.presentation !== "context-action-notice" &&
        (turn.isInitialTurn || turnIndex === 0)
          ? threadMissionControlPreview
          : null;
      const isMissionControlThreadTurn = Boolean(threadMissionControlPreview) && !isBtwTurn && turn.presentation !== "context-action-notice";
      const hasSpecialPromptPreview = Boolean(taskPreviewForTurn || missionControlPreviewForTurn);
      const shouldUseTaskPromptPreview = Boolean(
        (taskPreviewForTurn?.reviewRequest === true || taskPreviewForTurn?.showPromptPreview === true) && normalizedPrompt
      );
      const specialPromptPreviewText = taskPreviewForTurn
        ? `${taskPreviewForTurn.ticketNumber} ${taskPreviewForTurn.title}`
        : (missionControlPreviewForTurn?.prompt || "Run mission control.");
      const promptPreview = buildRunnerThreadHistoryPreviewText(
        shouldUseTaskPromptPreview ? normalizedPrompt : (hasSpecialPromptPreview ? specialPromptPreviewText : normalizedPrompt)
      );
      const turnAgentLabel = isMissionControlThreadTurn
        ? getRunnerMissionControlAgentName(threadMissionControlPreview)
        : turn.agentName || displayedAgentLabel || "Agent";

      if (promptPreview) {
        items.push({
          id: buildRunnerThreadHistoryItemId(turn.id, "user"),
          turnId: turn.id,
          role: "user",
          label: "Me",
          preview: promptPreview,
        });
      }

      if (turn.presentation === "context-action-notice") {
        const actionSummaryLog =
          turn.logs.find((log) => log.eventType === "action_summary" && typeof log.message === "string" && log.message.trim()) || null;
        if (actionSummaryLog?.message) {
          items.push({
            id: buildRunnerThreadHistoryItemId(turn.id, "assistant"),
            turnId: turn.id,
            role: "assistant",
            label: turnAgentLabel,
            preview: buildRunnerThreadHistoryPreviewText(actionSummaryLog.message),
          });
        }
        return items;
      }

      const agentMessage = [...turn.logs]
        .reverse()
        .find((log) => (log.eventType === "agent_message" || log.eventType === "llm_response") && typeof log.message === "string" && log.message.trim());

      if (agentMessage?.message) {
        items.push({
          id: buildRunnerThreadHistoryItemId(turn.id, "assistant"),
          turnId: turn.id,
          role: "assistant",
          label: turnAgentLabel,
          preview: buildRunnerThreadHistoryPreviewText(agentMessage.message),
        });
      }

      return items;
    });
  }, [displayedAgentLabel, threadMissionControlPreview, threadTaskPreview, turns]);
  const threadHistoryUserMessageCount = useMemo(
    () => threadHistoryItems.reduce((count, item) => count + (item.role === "user" ? 1 : 0), 0),
    [threadHistoryItems]
  );
  const shouldRenderThreadHistoryRail = threadHistoryUserMessageCount > 1 && threadHistoryItems.length > 0;
  const shouldDisplayThreadHistoryRail = shouldRenderThreadHistoryRail && isThreadHistoryAtMaxWidth;
  const activeThreadHistoryIndex = threadHistoryItems.findIndex((item) => item.id === activeThreadHistoryItemId);
  const hoveredThreadHistoryIndex = threadHistoryItems.findIndex((item) => item.id === hoveredThreadHistoryItemId);
  const previousThreadHistoryItem =
    activeThreadHistoryIndex > 0 ? threadHistoryItems[activeThreadHistoryIndex - 1] : null;
  const nextThreadHistoryItem =
    activeThreadHistoryIndex >= 0 && activeThreadHistoryIndex < threadHistoryItems.length - 1
      ? threadHistoryItems[activeThreadHistoryIndex + 1]
      : null;
  const areThreadHistoryControlsVisible = isThreadHistoryRailHovered || hoveredThreadHistoryIndex >= 0;

  function setThreadHistoryAnchorElement(itemId: string, element: HTMLDivElement | null) {
    if (element) {
      threadHistoryAnchorElementsRef.current[itemId] = element;
      return;
    }
    delete threadHistoryAnchorElementsRef.current[itemId];
  }

  function updateActiveThreadHistoryItem() {
    if (!shouldDisplayThreadHistoryRail) {
      setActiveThreadHistoryItemId(null);
      return;
    }

    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }
    if (scrollElement.scrollTop <= 8 && threadHistoryItems[0]) {
      setActiveThreadHistoryItemId((current) => current === threadHistoryItems[0].id ? current : threadHistoryItems[0].id);
      return;
    }

    const scrollRect = scrollElement.getBoundingClientRect();
    const viewportCenter = scrollRect.top + scrollRect.height / 2;
    let nextActiveId: string | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const item of threadHistoryItems) {
      const anchor = threadHistoryAnchorElementsRef.current[item.id];
      if (!anchor) {
        continue;
      }
      const anchorRect = anchor.getBoundingClientRect();
      const anchorCenter = anchorRect.top + anchorRect.height / 2;
      const distance = Math.abs(anchorCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nextActiveId = item.id;
      }
    }

    if (!nextActiveId && threadHistoryItems[threadHistoryItems.length - 1]) {
      nextActiveId = threadHistoryItems[threadHistoryItems.length - 1].id;
    }

    setActiveThreadHistoryItemId((current) => current === nextActiveId ? current : nextActiveId);
  }

  function scheduleThreadHistoryMeasurement() {
    if (threadHistoryMeasureFrameRef.current !== null) {
      window.cancelAnimationFrame(threadHistoryMeasureFrameRef.current);
    }
    threadHistoryMeasureFrameRef.current = window.requestAnimationFrame(() => {
      threadHistoryMeasureFrameRef.current = null;
      updateActiveThreadHistoryItem();
    });
  }

  function scrollThreadHistoryItemIntoView(itemId: string) {
    const scrollElement = logsRef.current;
    const anchor = threadHistoryAnchorElementsRef.current[itemId];
    if (!scrollElement || !anchor) {
      return;
    }

    const scrollRect = scrollElement.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const targetCenter = anchorRect.top - scrollRect.top + scrollElement.scrollTop + anchorRect.height / 2;
    const nextScrollTop = Math.max(
      0,
      Math.min(targetCenter - scrollElement.clientHeight / 2, scrollElement.scrollHeight - scrollElement.clientHeight)
    );
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scrollElement.scrollTo({
      top: nextScrollTop,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    setActiveThreadHistoryItemId(itemId);
  }

  function navigateThreadHistory(direction: -1 | 1) {
    if (activeThreadHistoryIndex < 0) {
      return;
    }
    const targetItem = threadHistoryItems[activeThreadHistoryIndex + direction];
    if (!targetItem) {
      return;
    }
    setHoveredThreadHistoryItemId(null);
    scrollThreadHistoryItemIntoView(targetItem.id);
  }

  useLayoutEffect(() => {
    if (!shouldDisplayThreadHistoryRail) {
      return;
    }
    scheduleThreadHistoryMeasurement();
  }, [expandedTurns, logs, shouldDisplayThreadHistoryRail, threadHistoryItems, turns]);

  useEffect(() => {
    if (!shouldDisplayThreadHistoryRail) {
      setHoveredThreadHistoryItemId(null);
      setIsThreadHistoryRailHovered(false);
      setActiveThreadHistoryItemId(null);
      return;
    }

    const scrollElement = logsRef.current;
    if (!scrollElement) {
      return;
    }

    function handleThreadHistoryViewportChange() {
      scheduleThreadHistoryMeasurement();
    }

    scrollElement.addEventListener("scroll", handleThreadHistoryViewportChange, { passive: true });
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          scheduleThreadHistoryMeasurement();
        })
      : null;
    resizeObserver?.observe(scrollElement);
    window.addEventListener("resize", handleThreadHistoryViewportChange);
    scheduleThreadHistoryMeasurement();

    return () => {
      scrollElement.removeEventListener("scroll", handleThreadHistoryViewportChange);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", handleThreadHistoryViewportChange);
    };
  }, [shouldDisplayThreadHistoryRail, threadHistoryItems]);

  useEffect(() => {
    if (activeThreadHistoryItemId && !threadHistoryItems.some((item) => item.id === activeThreadHistoryItemId)) {
      setActiveThreadHistoryItemId(null);
    }
    if (hoveredThreadHistoryItemId && !threadHistoryItems.some((item) => item.id === hoveredThreadHistoryItemId)) {
      setHoveredThreadHistoryItemId(null);
    }
  }, [activeThreadHistoryItemId, hoveredThreadHistoryItemId, threadHistoryItems]);

  useLayoutEffect(() => {
    const contentElement = contentWidthRef.current;
    if (!contentElement) {
      return;
    }
    const resolvedContentElement = contentElement;

    function updateThreadHistoryWidthEligibility() {
      const computedMaxWidth = Number.parseFloat(window.getComputedStyle(resolvedContentElement).maxWidth);
      const actualWidth = resolvedContentElement.getBoundingClientRect().width;
      const nextIsAtMaxWidth =
        Number.isFinite(computedMaxWidth) && computedMaxWidth > 0
          ? actualWidth >= computedMaxWidth - 1
          : true;
      setIsThreadHistoryAtMaxWidth((current) => current === nextIsAtMaxWidth ? current : nextIsAtMaxWidth);
    }

    updateThreadHistoryWidthEligibility();
    const resizeObserver = typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          updateThreadHistoryWidthEligibility();
        })
      : null;
    resizeObserver?.observe(resolvedContentElement);
    window.addEventListener("resize", updateThreadHistoryWidthEligibility);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateThreadHistoryWidthEligibility);
    };
  }, [previewedDocumentAttachment, turns.length]);

  const selectedDeepResearchDetailPresentation = useMemo<RunnerSelectedDeepResearchDetailPresentation | null>(() => {
    if (!selectedDeepResearchDetail) {
      return null;
    }

    const selectedTurn = turns.find((turn) => turn.id === selectedDeepResearchDetail.turnId);
    if (!selectedTurn) {
      return null;
    }

    const timelineState = getTurnTimelineState(selectedTurn);
    const deepResearchGroup = timelineState.displayedTimelineItems.find(
      (item): item is Extract<RunnerTimelineItem, { kind: "deep_research_group" }> => item.kind === "deep_research_group"
    );
    const resolvedLogs = deepResearchGroup?.logs || selectedTurn.logs.filter((log) => log.eventType === "deep_research");
    const resolvedRunningCommandLog = deepResearchGroup?.runningCommandLog || selectedTurn.logs.find((log) => isDeepResearchTimelineCommand(log));
    const session = resolveDeepResearchSessionForGroup({
      logs: resolvedLogs,
      runningCommandLog: resolvedRunningCommandLog,
      turn: selectedTurn,
      sessions: deepResearchSessions,
    });
    if (!deepResearchGroup && resolvedLogs.length === 0 && !resolvedRunningCommandLog && !session) {
      return null;
    }
    const firstLog = resolvedLogs[0] || resolvedRunningCommandLog;
    return {
      turn: selectedTurn,
      logs: resolvedLogs,
      runningCommandLog: resolvedRunningCommandLog,
      session,
      timeLabel: firstLog ? toDurationLabel(firstLog, selectedTurn.startedAtMs) : undefined,
      fallbackTopic: extractDeepResearchTopicFromGroup(resolvedLogs, resolvedRunningCommandLog) || selectedTurn.prompt || null,
    };
  }, [deepResearchSessions, selectedDeepResearchDetail, turns]);
  const lastSelectedDeepResearchDetailPresentationRef = useRef<RunnerSelectedDeepResearchDetailPresentation | null>(null);
  useEffect(() => {
    if (selectedDeepResearchDetailPresentation) {
      lastSelectedDeepResearchDetailPresentationRef.current = selectedDeepResearchDetailPresentation;
    } else if (!selectedDeepResearchDetail) {
      lastSelectedDeepResearchDetailPresentationRef.current = null;
    }
  }, [selectedDeepResearchDetail, selectedDeepResearchDetailPresentation]);
  const effectiveSelectedDeepResearchDetailPresentation =
    selectedDeepResearchDetailPresentation
      || (selectedDeepResearchDetail ? lastSelectedDeepResearchDetailPresentationRef.current : null);

  const selectedComputerUseDetailPresentation = useMemo(() => {
    if (!selectedComputerUseDetail) {
      return null;
    }

    const selectedTurn = turns.find((turn) => turn.id === selectedComputerUseDetail.turnId);
    if (!selectedTurn) {
      return null;
    }

    const timelineState = getTurnTimelineState(selectedTurn);
    const computerUseGroup = timelineState.displayedTimelineItems.find(
      (item): item is Extract<RunnerTimelineItem, { kind: "computer_use_group" }> =>
        item.kind === "computer_use_group" && item.group.id === selectedComputerUseDetail.groupId
    );

    if (!computerUseGroup) {
      return null;
    }

    return {
      turn: selectedTurn,
      ...buildComputerUseGroupPresentation(selectedTurn, computerUseGroup.group),
    };
  }, [displayedEnvironmentLabel, selectedComputerUseDetail, turns]);

  const selectedSubagentDetailPresentation = useMemo(() => {
    if (!selectedSubagentDetail) {
      return null;
    }

    const selectedTurn = turns.find((turn) => turn.id === selectedSubagentDetail.turnId);
    if (!selectedTurn) {
      return null;
    }

    const displayedTimelineLogs = dedupeAdjacentRunnerLogs(
      selectedTurn.logs.filter((log) => shouldDisplayTimelineLog(log))
    );
    const subagentGroups = buildSubagentTimelineGroups(
      displayedTimelineLogs.length === 0 && isRunningTurnStatus(selectedTurn.status)
        ? [
            {
              time: "00:00",
              message: "Setting up workspace...",
              type: "info" as const,
              eventType: "setup" as const,
            },
          ]
        : displayedTimelineLogs
    );
    const selectedGroup = subagentGroups.get(selectedSubagentDetail.invocationId);

    if (!selectedGroup) {
      return null;
    }

    return {
      turn: selectedTurn,
      ...buildSubagentGroupPresentation(selectedTurn, selectedGroup),
    };
  }, [displayedAgentLabel, displayedEnvironmentLabel, selectedSubagentDetail, turns]);
  const orderedAgents = useMemo(() => orderOptionsWithPinnedTop(agents, initialAgentTopId), [agents, initialAgentTopId]);
  const availableAgentPopupModes = useMemo<RunnerAgentSelectorMode[]>(() => {
    const nextModes: RunnerAgentSelectorMode[] = [];
    for (const agent of orderedAgents) {
      const nextMode = getRunnerAgentSelectorMode(agent);
      if (!nextModes.includes(nextMode)) {
        nextModes.push(nextMode);
      }
    }
    return nextModes.length > 0 ? nextModes : ["agents"];
  }, [orderedAgents]);
  const filteredOrderedAgents = useMemo(
    () => orderedAgents.filter((agent) => getRunnerAgentSelectorMode(agent) === agentPopupMode),
    [agentPopupMode, orderedAgents]
  );
  const orderedEnvironments = useMemo(
    () => orderOptionsWithPinnedTop(availableEnvironments, initialEnvironmentTopId),
    [availableEnvironments, initialEnvironmentTopId]
  );
  const orderedProjects = useMemo(
    () => orderOptionsWithPinnedTop(availableProjects, selectedProjectId || null),
    [availableProjects, selectedProjectId]
  );
  const activeWorkspaceEnvironmentId = effectiveEnvironmentId || selectedEnvironment?.id || environmentId || "";
  useEffect(() => {
    if (availableAgentPopupModes.includes(agentPopupMode)) {
      return;
    }
    const nextMode = getRunnerAgentSelectorMode(
      orderedAgents.find((agent) => agent.id === selectedAgentId) || orderedAgents[0] || null
    );
    const fallbackMode = (availableAgentPopupModes[0] || "agents") as RunnerAgentSelectorMode;
    const resolvedMode: RunnerAgentSelectorMode = availableAgentPopupModes.includes(nextMode)
      ? nextMode
      : fallbackMode;
    setAgentPopupMode(resolvedMode);
  }, [agentPopupMode, availableAgentPopupModes, orderedAgents, selectedAgentId]);
  const sourceThreadEnvironmentId = hasCurrentThread
    ? scopedActiveThreadEnvironmentId || selectedEnvironment?.id || environmentId || null
    : null;
  const sourceThreadEnvironmentName = hasCurrentThread
    ? scopedActiveThreadEnvironmentName || selectedEnvironment?.name || null
    : null;
  const selectedForkExistingEnvironment =
    availableEnvironments.find((environment) => environment.id === forkTargetEnvironmentId) ||
    (sourceThreadEnvironmentId && sourceThreadEnvironmentId === forkTargetEnvironmentId
      ? {
          id: sourceThreadEnvironmentId,
          name: sourceThreadEnvironmentName || "Current Environment",
        }
      : null);
  const orderedForkTargetEnvironments = useMemo(
    () => orderOptionsWithPinnedTop(availableEnvironments, forkTargetEnvironmentId || sourceThreadEnvironmentId),
    [availableEnvironments, forkTargetEnvironmentId, sourceThreadEnvironmentId]
  );
  const shouldShowForkExistingEnvironmentCopyOptions =
    forkTarget === "existing_environment" &&
    Boolean(forkTargetEnvironmentId) &&
    Boolean(sourceThreadEnvironmentId) &&
    forkTargetEnvironmentId !== sourceThreadEnvironmentId;
  const githubConnected = githubConfig?.connected ?? false;
  const notionConnected = notionConfig?.connected ?? false;
  const googleDriveConnected = googleDriveConfig?.connected ?? false;
  const oneDriveConnected = oneDriveConfig?.connected ?? false;
  const connectedComposerConnectors = [
    { id: "github", label: "GitHub", source: "github" as const, connected: githubConnected, Icon: IconGithub },
    { id: "notion", label: "Notion", source: "notion" as const, connected: notionConnected, Icon: IconNotion },
    { id: "one-drive", label: "OneDrive", source: "one-drive" as const, connected: oneDriveConnected, Icon: IconOneDrive },
    { id: "google-drive", label: "Google Drive", source: "google-drive" as const, connected: googleDriveConnected, Icon: IconGoogleDrive },
  ].filter((connector) => connector.connected);
  const composerProjectTaskItems = useMemo(
    () => (Array.isArray(composerProjectTasks) ? composerProjectTasks : [])
      .filter((task): task is RunnerTaskPreview => Boolean(task?.taskId && task.title)),
    [composerProjectTasks]
  );
  const selectedComposerProjectTaskId = String(selectedComposerProjectTask?.taskId || "").trim();
  const selectedComposerProjectTaskLabel = String(selectedComposerProjectTask?.title || "").trim();
  useEffect(() => {
    if (!projectTasksPopupOpen) {
      return undefined;
    }

    const handleDocumentPointerDown = (event: Event) => {
      const target = event.target instanceof Node ? event.target : null;
      if (target && projectTasksPopupRef.current?.contains(target)) {
        return;
      }
      setProjectTasksPopupOpen(false);
    };
    const handleDocumentKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setProjectTasksPopupOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleDocumentPointerDown, true);
    document.addEventListener("keydown", handleDocumentKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", handleDocumentPointerDown, true);
      document.removeEventListener("keydown", handleDocumentKeyDown, true);
    };
  }, [projectTasksPopupOpen]);
  const scheduleEnabled = (scheduleConfig?.enabled ?? false) || scheduledTask !== null;
  const githubContextLabel = githubConfig?.contextLabel || "Branch";
  const defaultGithubBranchFromContext = useMemo(() => {
    const selectedContext = githubContexts.find((context) => context.id === selectedGithubContextId);
    return String(selectedContext?.name || selectedGithubContextId || "").trim();
  }, [githubContexts, selectedGithubContextId]);

  function getGithubSelectedBranchForRepo(repoFullName: string, fallbackRef?: string | null): string {
    const normalizedRepoFullName = String(repoFullName || "").trim();
    if (!normalizedRepoFullName) {
      return String(fallbackRef || defaultGithubBranchFromContext || "main").trim() || "main";
    }
    return String(
      githubSelectedBranchByRepoFullName[normalizedRepoFullName]
      || fallbackRef
      || defaultGithubBranchFromContext
      || "main"
    ).trim() || "main";
  }

  function buildGithubEffectiveRootItem(item: RunnerChatFileNode): RunnerChatFileNode {
    if (!item.repoFullName || item.parentId) {
      return item;
    }
    const selectedBranch = getGithubSelectedBranchForRepo(item.repoFullName, item.ref);
    return {
      ...item,
      id: createGithubBrowserRepoFolderId(item.repoFullName, selectedBranch),
      ref: selectedBranch,
    };
  }
  const workspaceRootLabel = workspaceConfig?.rootLabel || "Workspace";
  const googleDriveRootLabel = googleDriveConfig?.rootLabel || "My Drive";
  const oneDriveRootLabel = oneDriveConfig?.rootLabel || "OneDrive";
  const githubRootLabel = "Repositories";
  const notionRootLabel = "Notion";
  const currentFileBrowserEntry = fileBrowserHistory[fileBrowserHistoryIndex] || { source: fileBrowserSource, folderId: null };
  const currentFileBrowserSource = currentFileBrowserEntry.source;
  const currentFileBrowserFolderId = currentFileBrowserEntry.folderId;
  const googleDrivePath = childFolderPath(googleDriveItems, googleDriveRootLabel, googleDriveFolderId);
  const oneDrivePath = childFolderPath(oneDriveItems, oneDriveRootLabel, oneDriveFolderId);
  const visibleGoogleDriveItems = fileItemsForParent(googleDriveItems, googleDriveFolderId);
  const visibleOneDriveItems = fileItemsForParent(oneDriveItems, oneDriveFolderId);
  const fileBrowserRootLabel =
    currentFileBrowserSource === "google-drive"
      ? googleDriveRootLabel
      : currentFileBrowserSource === "github"
        ? githubRootLabel
      : currentFileBrowserSource === "notion"
        ? notionRootLabel
      : currentFileBrowserSource === "one-drive"
        ? oneDriveRootLabel
        : selectedEnvironment?.name || workspaceRootLabel;
  const fileBrowserItems =
    currentFileBrowserSource === "google-drive"
      ? googleDriveItems
      : currentFileBrowserSource === "github"
        ? githubItems
      : currentFileBrowserSource === "notion"
        ? notionItems
      : currentFileBrowserSource === "one-drive"
        ? oneDriveItems
        : workspaceItems;
  const fileBrowserPath = childFolderPath(fileBrowserItems, fileBrowserRootLabel, currentFileBrowserFolderId);
  const visibleFileBrowserItems = fileItemsForParent(fileBrowserItems, currentFileBrowserFolderId);
  const filteredFileBrowserItems = fileBrowserSearchQuery.trim()
    ? visibleFileBrowserItems.filter((item) => item.name.toLowerCase().includes(fileBrowserSearchQuery.trim().toLowerCase()))
    : visibleFileBrowserItems;
  const selectedFileBrowserIds =
    currentFileBrowserSource === "google-drive"
      ? selectedGoogleDriveFileIds
      : currentFileBrowserSource === "github"
        ? selectedGithubFileIds
      : currentFileBrowserSource === "notion"
        ? (selectedNotionDatabaseId ? [selectedNotionDatabaseId] : [])
      : currentFileBrowserSource === "one-drive"
        ? selectedOneDriveFileIds
        : selectedWorkspaceFileIds;
  const selectedFileBrowserItems = fileBrowserItems.filter((item) => selectedFileBrowserIds.includes(item.id));
  const selectedFileBrowserLabel =
    currentFileBrowserSource === "notion" && selectedFileBrowserItems.length > 0
      ? selectedFileBrowserItems[0]?.id === "__entire_workspace__"
        ? "workspace"
        : `${selectedFileBrowserIds.length} ${selectedFileBrowserIds.length === 1 ? "database" : "databases"}`
      : currentFileBrowserSource === "github" && selectedFileBrowserItems.some((item) => item.isFolder)
      ? `${selectedFileBrowserIds.length} ${selectedFileBrowserIds.length === 1 ? "item" : "items"}`
      : `${selectedFileBrowserIds.length} ${selectedFileBrowserIds.length === 1 ? "file" : "files"}`;
  const previewFileBrowserItem = fileBrowserItems.find((item) => item.id === fileBrowserPreviewId) || null;
  const showGoogleDriveAuthScreen = currentFileBrowserSource === "google-drive" && !googleDriveConnected;
  const showGithubAuthScreen = currentFileBrowserSource === "github" && !githubConnected;
  const showNotionAuthScreen = currentFileBrowserSource === "notion" && !notionConnected;
  const showOneDriveAuthScreen = currentFileBrowserSource === "one-drive" && !oneDriveConnected;
  const showGoogleDrivePickerPrompt =
    currentFileBrowserSource === "google-drive" &&
    googleDriveConnected &&
    !isGoogleDriveBrowserLoading &&
    !googleDriveBrowserError &&
    filteredFileBrowserItems.length === 0 &&
    !fileBrowserSearchQuery.trim() &&
    fileBrowserPath.length <= 1 &&
    !!googleDriveConfig?.onManageAccess;
  const hasInputPopupOpen = activeInputPopup !== null;
  const showMainMenu = renderedMainPopup === "main";
  const hasPlusPopupOpen = isPlusPopupId(activeInputPopup) || renderedSidePopup !== null || renderedMainPopup === "main";
  const showContextPopup = renderedMainPopup === "context";
  const showSkillsPopup = renderedSidePopup === "skills";
  const showAgentPopup = renderedMainPopup === "agent";
  const showEnvironmentPopup = renderedMainPopup === "environment";
  const showGithubPopup = renderedSidePopup === "github";
  const showNotionPopup = renderedSidePopup === "notion";
  const showGoogleDrivePopup = renderedSidePopup === "google-drive";
  const showOneDrivePopup = renderedSidePopup === "one-drive";
  const showSchedulePopup = renderedSidePopup === "schedule";
  const showAttachFilesPopup = renderedSidePopup === "attach-files";
  const documentAttachmentPreviewDrawer = previewedDocumentAttachment ? (
    <RunnerDocumentPreviewDrawer
      attachment={previewedDocumentAttachment}
      backendUrl={normalizedBackendUrl}
      requestHeaders={requestHeaders}
      apiKey={apiKey.trim()}
      onClose={closeDocumentAttachmentPreview}
      onResizeStart={startDocumentPreviewResize}
      showResizeHandle
    />
  ) : null;
  const deepResearchDetailDrawerContent = effectiveSelectedDeepResearchDetailPresentation ? (
    <DeepResearchDetailDrawer
      log={effectiveSelectedDeepResearchDetailPresentation.runningCommandLog}
      logs={effectiveSelectedDeepResearchDetailPresentation.logs}
      runningCommandLog={effectiveSelectedDeepResearchDetailPresentation.runningCommandLog}
      session={effectiveSelectedDeepResearchDetailPresentation.session}
      fallbackTopic={effectiveSelectedDeepResearchDetailPresentation.fallbackTopic}
      onReportFileClick={(path) => handleSummaryWorkspacePathClick(
        effectiveSelectedDeepResearchDetailPresentation.turn,
        path,
        "deep_research_report"
      )}
      onClose={closeDeepResearchDetailDrawer}
    />
  ) : null;
  const deepResearchDetailDrawer =
    deepResearchDetailDrawerContent && subagentDetailPortalTarget && typeof document !== "undefined"
      ? createPortal(deepResearchDetailDrawerContent, subagentDetailPortalTarget)
      : deepResearchDetailDrawerContent;
  const computerUseDetailDrawerContent = selectedComputerUseDetailPresentation ? (
    <ComputerUseDetailDrawer
      title={selectedComputerUseDetailPresentation.title}
      environmentName={selectedComputerUseDetailPresentation.environmentName}
      workLabel={selectedComputerUseDetailPresentation.workLabel}
      timeLabel={selectedComputerUseDetailPresentation.timeLabel}
      running={selectedComputerUseDetailPresentation.running}
      onClose={closeComputerUseDetailDrawer}
    >
      {renderNestedTimelineItems(selectedComputerUseDetailPresentation.turn, selectedComputerUseDetailPresentation.nestedItems)}
    </ComputerUseDetailDrawer>
  ) : null;
  const computerUseDetailDrawer =
    computerUseDetailDrawerContent && subagentDetailPortalTarget && typeof document !== "undefined"
      ? createPortal(computerUseDetailDrawerContent, subagentDetailPortalTarget)
      : computerUseDetailDrawerContent;
  const subagentDetailDrawerContent = selectedSubagentDetailPresentation ? (
    <SubagentDetailDrawer
      title={selectedSubagentDetailPresentation.title}
      prompt={selectedSubagentDetailPresentation.prompt}
      environmentName={selectedSubagentDetailPresentation.environmentName}
      workLabel={selectedSubagentDetailPresentation.workLabel}
      timeLabel={selectedSubagentDetailPresentation.timeLabel}
      running={selectedSubagentDetailPresentation.running}
      responseMessage={selectedSubagentDetailPresentation.responseMessage}
      responseFailed={selectedSubagentDetailPresentation.responseFailed}
      onClose={closeSubagentDetailDrawer}
    >
      {renderNestedTimelineItems(selectedSubagentDetailPresentation.turn, selectedSubagentDetailPresentation.nestedItems)}
    </SubagentDetailDrawer>
  ) : null;
  const subagentDetailDrawer =
    subagentDetailDrawerContent && subagentDetailPortalTarget && typeof document !== "undefined"
      ? createPortal(subagentDetailDrawerContent, subagentDetailPortalTarget)
      : subagentDetailDrawerContent;
  const isClosingPopupStackTogether =
    sidePopupPhase === "exit" &&
    mainPopupPhase === "exit" &&
    renderedMainPopup === "main" &&
    renderedSidePopup !== null;
  const mainPopupAnimationClass = mainPopupPhase === "enter"
    ? "tb-popup-menu-animate-up-in"
    : mainPopupPhase === "exit"
      ? "tb-popup-menu-animate-up-out"
      : "";
  const sidePopupAnimationClass = sidePopupPhase === "enter"
    ? "tb-popup-menu-animate-left-in"
    : sidePopupPhase === "exit"
      ? isClosingPopupStackTogether || sidePopupExitDirection === "down"
        ? "tb-popup-menu-animate-down-out"
        : "tb-popup-menu-animate-left-out"
      : "";
  const contextIndicatorSource = threadContextDetails || threadContext;
  const contextIndicatorMetrics = deriveThreadContextDisplayMetrics(contextIndicatorSource);
  const contextUsageRatio = Math.max(0, Math.min(1, contextIndicatorMetrics.usedRatio));
  const contextIndicatorTitle = buildContextIndicatorTitle(contextIndicatorSource, Boolean(currentThreadId), isThreadContextLoading);
  const contextDetails = threadContextDetails || threadContext;
  const fallbackThreadContextDetails: RunnerChatThreadContextDetails = {
    threadId: currentThreadId || "",
    sessionId: null,
    model: currentThreadId ? "Waiting for context data" : "No active thread",
    maxTokens: 0,
    usedTokens: 0,
    remainingTokens: 0,
    remainingRatio: 0,
    source: "empty",
    exact: false,
    categories: EMPTY_THREAD_CONTEXT_CATEGORIES,
  };
  const displayContextDetails = contextDetails || fallbackThreadContextDetails;
  const displayContextMetrics = deriveThreadContextDisplayMetrics(displayContextDetails);
  const contextCategoryOrder: RunnerChatThreadContextCategoryKey[] = ["system_prompt", "skills", "messages", "autocompact_buffer", "free_space", "other"];
  const contextCategories = threadContextDetails?.categories || EMPTY_THREAD_CONTEXT_CATEGORIES;
  const orderedContextCategories = [...contextCategories].sort(
    (left, right) => contextCategoryOrder.indexOf(left.key) - contextCategoryOrder.indexOf(right.key)
  );
  const visibleContextCategories = orderedContextCategories.filter((category) => category.tokens > 0 || category.key === "free_space");
  const hasDisplayContextUsage = Boolean(contextDetails) && displayContextDetails.maxTokens > 0;
  const nativeContextUsedPercent = Math.round((displayContextMetrics.usedTokens / Math.max(displayContextDetails.maxTokens, 1)) * 100);
  const hasReceivedFirstAssistantAnswer =
    Boolean(threadContextDetails?.sessionId || threadContext?.sessionId) ||
    turns.some((turn) => turn.logs.some((log) => log.eventType === "agent_message" || log.eventType === "llm_response"));
  const hasBackendThreadContextActionAvailability =
    threadContextAvailableActions.compact || threadContextAvailableActions.clear || threadContextAvailableActions.fork;
  const canStageThreadContextManagementActions =
    hasReceivedFirstAssistantAnswer || hasBackendThreadContextActionAvailability;
  const canUseBtwThreadContextAction = Boolean(currentThreadId) && currentThreadHasMessages;
  const effectiveThreadContextAvailableActions: RunnerChatThreadContextAvailableActions = {
    compact: canStageThreadContextManagementActions,
    clear: canStageThreadContextManagementActions,
    btw: canUseBtwThreadContextAction,
    fork: canStageThreadContextManagementActions,
  };
  const agentPopupEmptyLabel =
    agentPopupMode === "teams"
      ? "No teams available."
      : agentPopupMode === "humans"
        ? "No humans available."
        : "No agents available.";
  const workspacePopupEmptyLabel =
    workspaceSelectorMode === "projects"
      ? "No projects available."
      : "No computers available.";
  const speechToTextTitle = !hasApiKey
    ? "Enter an API key to enable speech-to-text"
    : supportsSpeechToText
      ? isListening
        ? "Stop speech to text"
        : "Start speech to text"
      : "Speech-to-text is not supported in this browser";

  function renderAgentSelectorControl() {
    if (hideAgentSelector || agents.length === 0) {
      return null;
    }

    return (
      <div className="tb-selector-anchor">
        <button
          type="button"
          className={`tb-inline-selector tb-inline-selector-agent ${showAgentPopup ? "active" : ""}`.trim()}
          onClick={() => togglePopup("agent")}
        >
          <span>{displayedAgentLabel}</span>
          <IconChevronDown className="tb-inline-selector-chevron" />
        </button>

        {showAgentPopup ? (
          <div className={`tb-popup-menu tb-popup-menu-inline tb-popup-menu-inline-agent ${mainPopupAnimationClass}`.trim()}>
            {!hasApiKey ? (
              <div className="tb-popup-note">
                <div className="tb-popup-note-title">API key required</div>
                <div className="tb-popup-note-body">Enter an API key in the playground sidebar to select an agent.</div>
              </div>
            ) : (
              <>
                <div className="tb-popup-menu-title">Agent</div>
                <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                  <div className="tb-popup-nav">
                    {availableAgentPopupModes.includes("agents") ? (
                      <button
                        type="button"
                        className={`tb-popup-nav-button ${agentPopupMode === "agents" ? "active" : ""}`}
                        onClick={() => setAgentPopupMode("agents")}
                      >
                        Agents
                      </button>
                    ) : null}
                    {availableAgentPopupModes.includes("teams") ? (
                      <button
                        type="button"
                        className={`tb-popup-nav-button ${agentPopupMode === "teams" ? "active" : ""}`}
                        onClick={() => setAgentPopupMode("teams")}
                      >
                        Teams
                      </button>
                    ) : null}
                    {availableAgentPopupModes.includes("humans") ? (
                      <button
                        type="button"
                        className={`tb-popup-nav-button ${agentPopupMode === "humans" ? "active" : ""}`}
                        onClick={() => setAgentPopupMode("humans")}
                      >
                        Humans
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-agent">
                  {filteredOrderedAgents.length > 0 ? (
                    filteredOrderedAgents.map((agent) => {
                      const isTeamAgent = getRunnerAgentSelectorMode(agent) === "teams";
                      return (
                        <button
                          key={agent.id}
                          type="button"
                          className={`tb-popup-row tb-popup-row-select tb-popup-row-agent ${selectedAgentId === agent.id ? "selected" : ""}`}
                          onClick={() => selectAgent(agent.id)}
                        >
                          {isTeamAgent ? <IconLayers className="tb-popup-icon" /> : <IconUser className="tb-popup-icon" />}
                          <span className="tb-popup-label">{agent.name}</span>
                          <span className="tb-popup-check-slot">
                            {selectedAgentId === agent.id ? <IconCheck className="tb-popup-check" /> : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="tb-popup-menu-inline-empty">
                      <div className="tb-popup-empty-state">{agentPopupEmptyLabel}</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  function renderEnvironmentSelectorControl() {
    if (hideEnvironmentSelector) {
      return null;
    }

    if (availableEnvironments.length === 0 && availableProjects.length === 0) {
      return null;
    }

    return (
      <div className="tb-selector-anchor">
        <button
          type="button"
          className={`tb-inline-selector ${showEnvironmentPopup ? "active" : ""}`.trim()}
          onClick={() => togglePopup("environment")}
        >
          <span>{displayedWorkspaceLabel}</span>
          <IconChevronDown className="tb-inline-selector-chevron" />
        </button>

        {showEnvironmentPopup ? (
          <div className={`tb-popup-menu tb-popup-menu-inline tb-popup-menu-inline-right tb-popup-menu-inline-workspace ${mainPopupAnimationClass}`.trim()}>
            {!hasApiKey ? (
              <div className="tb-popup-note">
                <div className="tb-popup-note-title">API key required</div>
                <div className="tb-popup-note-body">Enter an API key in the playground sidebar to select a workspace.</div>
              </div>
            ) : (
              <>
                <div className="tb-popup-menu-title">Workspace</div>
                <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                  <div className="tb-popup-nav">
                    <button
                      type="button"
                      className={`tb-popup-nav-button ${workspaceSelectorMode === "computers" ? "active" : ""}`}
                      onClick={() => setWorkspaceSelectorMode("computers")}
                    >
                      Computers
                    </button>
                    <button
                      type="button"
                      className={`tb-popup-nav-button ${workspaceSelectorMode === "projects" ? "active" : ""}`}
                      onClick={() => setWorkspaceSelectorMode("projects")}
                    >
                      Projects
                    </button>
                  </div>
                </div>
                <div className="tb-popup-menu-inline-body tb-popup-menu-inline-body-agent tb-popup-menu-inline-body-workspace">
                  {workspaceSelectorMode === "projects" ? (
                    orderedProjects.length > 0 ? (
                      orderedProjects.map((project) => {
                        const projectEnvironmentId = getRunnerProjectEnvironmentId(project);
                        const isSelectedProject =
                          effectiveWorkspaceSelectorMode === "projects" && selectedProjectId === project.id;
                        return (
                          <button
                            key={project.id}
                            type="button"
                            className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace ${isSelectedProject ? "selected" : ""}`}
                            onClick={() => selectProject(project.id)}
                            disabled={!projectEnvironmentId}
                            title={!projectEnvironmentId ? "This project has no linked computer." : project.name}
                          >
                            <LucideRocket className="tb-popup-icon" strokeWidth={1.75} />
                            <span className="tb-popup-label">{project.name}</span>
                            <span className="tb-popup-check-slot">
                              {isSelectedProject ? <IconCheck className="tb-popup-check" /> : null}
                            </span>
                          </button>
                        );
                      })
                    ) : (
                      <div className="tb-popup-menu-inline-empty">
                        <div className="tb-popup-empty-state">{workspacePopupEmptyLabel}</div>
                      </div>
                    )
                  ) : orderedEnvironments.length > 0 ? (
                    orderedEnvironments.map((environment) => {
                      const isSelectedEnvironment =
                        effectiveWorkspaceSelectorMode === "computers" && selectedEnvironmentId === environment.id;
                      return (
                        <button
                          key={environment.id}
                          type="button"
                          className={`tb-popup-row tb-popup-row-select tb-popup-row-agent tb-popup-row-workspace ${isSelectedEnvironment ? "selected" : ""}`}
                          onClick={() => selectEnvironment(environment.id)}
                        >
                          <LucideMonitor className="tb-popup-icon" strokeWidth={1.75} />
                          <span className="tb-popup-label">{environment.name}</span>
                          <span className="tb-popup-check-slot">
                            {isSelectedEnvironment ? <IconCheck className="tb-popup-check" /> : null}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="tb-popup-menu-inline-empty">
                      <div className="tb-popup-empty-state">{workspacePopupEmptyLabel}</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  useEffect(() => {
    if (selectedSubagentDetail && !selectedSubagentDetailPresentation) {
      setSelectedSubagentDetail(null);
    }
  }, [selectedSubagentDetail, selectedSubagentDetailPresentation]);

  useEffect(() => {
    if (selectedComputerUseDetail && !selectedComputerUseDetailPresentation) {
      setSelectedComputerUseDetail(null);
    }
  }, [selectedComputerUseDetail, selectedComputerUseDetailPresentation]);

  useEffect(() => {
    setSelectedSubagentDetail(null);
    setSelectedDeepResearchDetail(null);
    setSelectedComputerUseDetail(null);
  }, [localThreadId]);

  useEffect(() => {
    if (disableSubagentDetailDrawer && selectedSubagentDetail) {
      setSelectedSubagentDetail(null);
    }
    if (disableSubagentDetailDrawer && selectedDeepResearchDetail) {
      setSelectedDeepResearchDetail(null);
    }
    if (disableSubagentDetailDrawer && selectedComputerUseDetail) {
      setSelectedComputerUseDetail(null);
    }
  }, [disableSubagentDetailDrawer, selectedComputerUseDetail, selectedDeepResearchDetail, selectedSubagentDetail]);

  useEffect(() => {
    onSubagentDetailOpenChange?.(Boolean(selectedSubagentDetailPresentation || selectedComputerUseDetailPresentation));
  }, [onSubagentDetailOpenChange, selectedComputerUseDetailPresentation, selectedSubagentDetailPresentation]);

  useEffect(() => {
    return () => {
      onSubagentDetailOpenChange?.(false);
    };
  }, [onSubagentDetailOpenChange]);

  useEffect(() => {
    onDocumentPreviewOpenChange?.(Boolean(previewedDocumentAttachment));
  }, [onDocumentPreviewOpenChange, previewedDocumentAttachment]);

  useEffect(() => {
    return () => {
      onDocumentPreviewOpenChange?.(false);
    };
  }, [onDocumentPreviewOpenChange]);

  useEffect(() => {
    onDeepResearchDetailOpenChange?.(Boolean(effectiveSelectedDeepResearchDetailPresentation));
  }, [effectiveSelectedDeepResearchDetailPresentation, onDeepResearchDetailOpenChange]);

  useEffect(() => {
    return () => {
      onDeepResearchDetailOpenChange?.(false);
    };
  }, [onDeepResearchDetailOpenChange]);

  useEffect(() => {
    if (!currentThreadId || !hasApiKey || !normalizedBackendUrl) {
      return;
    }

    let cancelled = false;
    let pollInFlight = false;
    let timeoutId: number | null = null;
    let trailingTerminalPollsRemaining = REATTACH_THREAD_TERMINAL_SETTLE_POLL_LIMIT;
    let initialGracePollsRemaining = REATTACH_THREAD_INITIAL_GRACE_POLL_LIMIT;

    const scheduleNextPoll = (delayMs: number) => {
      if (cancelled) {
        return;
      }
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        void pollRunningThread();
      }, delayMs);
    };

    const pollRunningThread = async () => {
      if (cancelled || pollInFlight) {
        return;
      }

      pollInFlight = true;

      try {
        if (locallyOwnedExecutionThreadIdRef.current === currentThreadId) {
          scheduleNextPoll(REATTACH_RUNNING_THREAD_POLL_INTERVAL_MS);
          return;
        }

        const statusSnapshot = await fetchThreadStatusSnapshot({
          backendUrl: normalizedBackendUrl,
          apiKey: apiKey.trim(),
          threadId: currentThreadId,
          requestHeaders,
        });

        if (cancelled) {
          return;
        }
        setHydratedThreadStatus(statusSnapshot.status ?? null);

        const localHasRunningTurn = turnsRef.current.some((turn) => isRunningTurnStatus(turn.status));
        const localHasPendingPermissionTurn = turnsRef.current.some((turn) => turn.status === "permission_asked");
        const localHasActiveDeepResearch = turnsRef.current.some((turn) => hasActiveDeepResearchLogGroup(turn.logs));
        const localHasNoHydratedTurns = turnsRef.current.length === 0;
        const remoteThreadIsRunning = isRunningThreadLifecycleStatus(statusSnapshot.status);
        const remoteThreadHasPendingPermission = isPendingPermissionThreadLifecycleStatus(statusSnapshot.status);
        const shouldHydrateThread =
          remoteThreadIsRunning
          || localHasRunningTurn
          || localHasActiveDeepResearch
          || (remoteThreadHasPendingPermission && !localHasPendingPermissionTurn)
          || (localHasPendingPermissionTurn && !remoteThreadHasPendingPermission)
          || (localHasNoHydratedTurns && initialGracePollsRemaining > 0);

        let nextHasRunningTurn = localHasRunningTurn;
        let nextHasActiveDeepResearch = localHasActiveDeepResearch;

        if (shouldHydrateThread) {
          const cachedPayload =
            threadHydrationCacheRef.current?.threadId === currentThreadId
              ? threadHydrationCacheRef.current
              : null;
          const resolvedInitialPrompt = resolveHydrationInitialPrompt(turnsRef.current, cachedPayload);
          const shouldUseFullHydration =
            !remoteThreadIsRunning
            || (!cachedPayload && !resolvedInitialPrompt);
          const payload = shouldUseFullHydration
            ? await fetchThreadHydrationPayload({
                backendUrl: normalizedBackendUrl,
                apiKey: apiKey.trim(),
                threadId: currentThreadId,
                requestHeaders,
              })
            : await fetchThreadLiveRefreshPayload({
                backendUrl: normalizedBackendUrl,
                apiKey: apiKey.trim(),
                threadId: currentThreadId,
                requestHeaders,
                statusSnapshot,
                existingTurns: turnsRef.current,
                cachedPayload,
              });

          if (cancelled) {
            return;
          }

          threadHydrationCacheRef.current = payload;
          setHydratedThreadStatus(payload.threadStatus ?? statusSnapshot.status ?? null);
          applyHydratedThreadEnvironment(payload);
          const hydratedTurns = buildHydratedTurnsFromPayload(payload, {
            agentName: displayedAgentLabel,
            environmentName: payload.threadEnvironmentName ?? payload.environmentName ?? displayedEnvironmentLabel,
            backendUrl: normalizedBackendUrl,
          });

          if (cancelled) {
            return;
          }

          const mergedTurns = mergeHydratedTurns(turnsRef.current, hydratedTurns);
          nextHasRunningTurn = mergedTurns.some((turn) => isRunningTurnStatus(turn.status));
          nextHasActiveDeepResearch = mergedTurns.some((turn) => hasActiveDeepResearchLogGroup(turn.logs));
          setTurns(mergedTurns);
          setExpandedTurns((previousExpandedTurns) =>
            mapExpandedTurns(previousExpandedTurns, turnsRef.current, mergedTurns, {
              defaultLatestExpanded: true,
              collapseOnNewRunSummary: true,
            })
          );
        }

        if (remoteThreadIsRunning || nextHasRunningTurn || nextHasActiveDeepResearch) {
          trailingTerminalPollsRemaining = REATTACH_THREAD_TERMINAL_SETTLE_POLL_LIMIT;
          initialGracePollsRemaining = REATTACH_THREAD_INITIAL_GRACE_POLL_LIMIT;
          scheduleNextPoll(REATTACH_RUNNING_THREAD_POLL_INTERVAL_MS);
          return;
        }

        if (remoteThreadHasPendingPermission) {
          trailingTerminalPollsRemaining = REATTACH_THREAD_TERMINAL_SETTLE_POLL_LIMIT;
          initialGracePollsRemaining = REATTACH_THREAD_INITIAL_GRACE_POLL_LIMIT;
          scheduleNextPoll(REATTACH_THREAD_RETRY_DELAY_MS);
          return;
        }

        if (shouldHydrateThread && trailingTerminalPollsRemaining > 0) {
          trailingTerminalPollsRemaining -= 1;
          scheduleNextPoll(REATTACH_RUNNING_THREAD_POLL_INTERVAL_MS);
          return;
        }

        if (!shouldHydrateThread && initialGracePollsRemaining > 0) {
          initialGracePollsRemaining -= 1;
          scheduleNextPoll(REATTACH_RUNNING_THREAD_POLL_INTERVAL_MS);
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("[RunnerChat] Failed to refresh hydrated running thread:", error);
          scheduleNextPoll(REATTACH_THREAD_RETRY_DELAY_MS);
        }
      } finally {
        pollInFlight = false;
      }
    };

    void pollRunningThread();

    return () => {
      cancelled = true;
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [
    apiKey,
    currentThreadId,
    displayedAgentLabel,
    displayedEnvironmentLabel,
    hasApiKey,
    hasHydratedReattachActivity,
    hasRunningTurn,
    normalizedBackendUrl,
    requestHeaders,
  ]);

  function renderThreadContextPopup() {
    if (!hasApiKey) {
      return (
        <div className={`tb-popup-menu tb-popup-menu-context ${mainPopupAnimationClass}`.trim()}>
          <div className="tb-popup-menu-title tb-popup-menu-title-context">Thread Context</div>
          <div className="tb-popup-note">
            <div className="tb-popup-note-title">API key required</div>
            <div className="tb-popup-note-body">Enter an API key in the playground sidebar to inspect and manage thread context.</div>
          </div>
        </div>
      );
    }

    return (
      <div className={`tb-popup-menu tb-popup-menu-context ${mainPopupAnimationClass}`.trim()}>
        <div className="tb-popup-menu-title tb-popup-menu-title-context">
          <span>Thread Context</span>
          {hasDisplayContextUsage ? (
            <span className="tb-context-panel-tokens">
              {formatCompactTokenCount(displayContextMetrics.usedTokens)}/{formatCompactTokenCount(displayContextDetails.maxTokens)} tokens ({nativeContextUsedPercent}%)
            </span>
          ) : null}
        </div>
        {isThreadContextDetailsLoading ? (
          <div className="tb-popup-loading-row">
            <span className="tb-popup-loading-spinner" />
            <span className="tb-popup-loading-label">Loading native thread context…</span>
          </div>
        ) : threadContextDetailsError ? (
          <div className="tb-popup-note">
            <div className="tb-popup-note-title">Context unavailable</div>
            <div className="tb-popup-note-body">{threadContextDetailsError}</div>
            <button type="button" className="tb-popup-action tb-popup-action-secondary tb-context-panel-retry" onClick={() => void refreshThreadContextDetails()}>
              Retry
            </button>
          </div>
        ) : (
          <div className="tb-context-panel">
            <div className="tb-context-panel-bar" aria-hidden="true">
              {visibleContextCategories
                .filter((category) => getContextCategoryDisplayTokens(category, displayContextMetrics) > 0)
                .map((category) => (
                  <span
                    key={category.key}
                    className={`tb-context-panel-bar-segment tb-context-panel-bar-segment-${category.kind === "buffer" ? "used" : category.kind}`}
                    style={
                      {
                        "--tb-context-segment-size": String(
                          displayContextDetails.maxTokens > 0
                            ? getContextCategoryDisplayTokens(category, displayContextMetrics) / displayContextDetails.maxTokens
                            : 0
                        ),
                        "--tb-context-segment-color": threadContextCategoryColor(category),
                      } as CSSProperties
                    }
                  />
                ))}
            </div>

            <div className="tb-context-panel-list">
              {visibleContextCategories.map((category) => (
                <div key={category.key} className="tb-context-panel-row">
                  <span className="tb-context-panel-row-main">
                    <span className="tb-context-panel-row-swatch" style={{ background: threadContextCategoryColor(category) }} />
                  <span className="tb-context-panel-row-label">{category.label}</span>
                </span>
                <span className="tb-context-panel-row-value">
                  {!hasDisplayContextUsage && category.key === "free_space"
                    ? "100%"
                    : `${formatCompactTokenCount(getContextCategoryDisplayTokens(category, displayContextMetrics))} tokens`}
                </span>
              </div>
            ))}
            </div>

            <div className="tb-context-panel-actions">
              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.compact || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("compact")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideMinimize2 className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/compact</span>
                </span>
              </button>

              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.clear || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("clear")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideEraser className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/clear</span>
                </span>
              </button>

              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.btw || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("btw")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideMessageCircle className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/btw</span>
                </span>
              </button>

              <button
                type="button"
                className="tb-context-panel-action"
                disabled={!effectiveThreadContextAvailableActions.fork || threadContextActionLoading !== null}
                onClick={() => void handleContextPopupActionClick("fork")}
              >
                <span className="tb-context-panel-action-single">
                  <LucideGitBranch className="tb-context-panel-action-icon" strokeWidth={1.75} />
                  <span>/fork</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderContextIndicatorControl() {
    return (
      <div className="tb-selector-anchor tb-context-indicator-anchor">
        <button
          type="button"
          className={`tb-context-indicator-button ${showContextPopup ? "active" : ""} ${isThreadContextLoading ? "loading" : ""}`.trim()}
          onClick={handleContextIndicatorClick}
          aria-label="Conversation context remaining"
          title={contextIndicatorTitle}
        >
          <span className="tb-context-indicator-ring" style={{ "--tb-context-progress": String(contextUsageRatio) } as CSSProperties} />
        </button>

        {showContextPopup ? renderThreadContextPopup() : null}
      </div>
    );
  }

  function renderFileBrowserItem(item: RunnerChatFileNode, depth = 0) {
    const isGithubRepoRootRow =
      currentFileBrowserSource === "github"
      && item.isFolder
      && depth === 0
      && !item.parentId
      && Boolean(item.repoFullName);
    const effectiveItem = isGithubRepoRootRow ? buildGithubEffectiveRootItem(item) : item;
    const effectiveItemId = effectiveItem.id;
    const isSelected = selectedFileBrowserIds.includes(effectiveItemId);
    const isPreviewActive = previewFileBrowserItem?.id === effectiveItemId;
    const isExpanded = expandedFileBrowserFolderIds.includes(effectiveItemId);
    const isFolderLoading =
      currentFileBrowserSource === "workspace"
        ? loadingWorkspaceFolderIds.includes(effectiveItemId)
        : currentFileBrowserSource === "google-drive"
          ? loadingGoogleDriveFolderIds.includes(effectiveItemId)
          : currentFileBrowserSource === "one-drive"
            ? loadingOneDriveFolderIds.includes(effectiveItemId)
            : currentFileBrowserSource === "github"
              ? loadingGithubFolderIds.includes(effectiveItemId)
              : false;
    const workspaceFolderError =
      currentFileBrowserSource === "workspace"
        ? workspaceFolderErrorsById[effectiveItemId] || ""
        : "";
    const nestedItems = fileBrowserSearchQuery.trim() ? [] : fileItemsForParent(fileBrowserItems, effectiveItemId);
    const showGithubFolderCheckbox = currentFileBrowserSource === "github" && item.isFolder;
    const githubRepoFullName = String(effectiveItem.repoFullName || "").trim();
    const githubBranchOptions = githubRepoFullName
      ? githubBranchesByRepoFullName[githubRepoFullName] || []
      : [];
    const githubSelectedBranch = githubRepoFullName
      ? getGithubSelectedBranchForRepo(githubRepoFullName, effectiveItem.ref)
      : "";
    const isGithubBranchLoading = githubRepoFullName
      ? githubBranchLoadingRepoFullNames.includes(githubRepoFullName)
      : false;
    const githubBranchSelectOptions =
      githubSelectedBranch && !githubBranchOptions.some((option) => option.id === githubSelectedBranch || option.name === githubSelectedBranch)
        ? [{ id: githubSelectedBranch, name: githubSelectedBranch }, ...githubBranchOptions]
        : githubBranchOptions;

    return (
      <div key={effectiveItemId}>
        <div
          className={`tb-file-browser-item ${isPreviewActive ? "preview" : ""} ${isSelected ? "selected" : ""}`}
          onClick={() => handleFileBrowserItemClick(effectiveItem)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleFileBrowserItemClick(effectiveItem);
            }
          }}
          role="button"
          tabIndex={0}
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          {item.isFolder ? (
            <button type="button" className="tb-file-browser-item-leading" onClick={(event) => toggleFileBrowserFolderExpansion(effectiveItemId, event)}>
              {isFolderLoading ? <IconLoader2 className="tb-file-browser-folder-chevron tb-file-browser-folder-chevron-spin" /> : isExpanded ? <IconChevronDown className="tb-file-browser-folder-chevron" /> : <IconChevronRight className="tb-file-browser-folder-chevron" />}
            </button>
          ) : (
            <div
              className={`tb-file-browser-check ${isSelected ? "selected" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                handleFileBrowserItemClick(effectiveItem);
              }}
            >
              {isSelected ? <IconCheck className="tb-file-browser-check-icon" /> : null}
            </div>
          )}
          {showGithubFolderCheckbox ? (
            <div
              className={`tb-file-browser-check ${isSelected ? "selected" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedGithubFileIds((current) => toggleFileSelection(current, effectiveItemId));
              }}
            >
              {isSelected ? <IconCheck className="tb-file-browser-check-icon" /> : null}
            </div>
          ) : null}
          {renderBrowserFileIcon(effectiveItem, "tb-file-browser-item-icon")}
          <span className="tb-file-browser-item-name">{effectiveItem.name}</span>
          {isGithubRepoRootRow ? (
            <div className="tb-file-browser-item-branch-slot">
              <select
                className="tb-file-browser-item-branch-select"
                value={githubSelectedBranch}
                disabled={isGithubBranchLoading}
                onFocus={() => {
                  void ensureGithubBranchesLoaded(githubRepoFullName, effectiveItem.ref);
                }}
                onClick={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onChange={(event) => {
                  event.stopPropagation();
                  handleGithubRepoBranchChange(effectiveItem, event.target.value);
                }}
              >
                {githubBranchSelectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <span className="tb-file-browser-item-meta">{formatBrowserFileDate(effectiveItem.modifiedTime)}</span>
              <span className="tb-file-browser-item-size">{effectiveItem.isFolder ? "" : formatBrowserFileSize(effectiveItem.size)}</span>
            </>
          )}
        </div>

        {item.isFolder && isExpanded ? (
          <div className="tb-file-browser-item-children">
            {nestedItems.length > 0 ? nestedItems.map((nestedItem) => renderFileBrowserItem(nestedItem, depth + 1)) : null}
            {workspaceFolderError && nestedItems.length === 0 ? (
              <div className="tb-file-browser-empty">{workspaceFolderError}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  useEffect(() => {
    return () => {
      if (fileBrowserPreviewObjectUrlRef.current) {
        URL.revokeObjectURL(fileBrowserPreviewObjectUrlRef.current);
        fileBrowserPreviewObjectUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "workspace") {
      return;
    }

    if (!hasApiKey) {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError(null);
      setIsWorkspaceBrowserLoading(false);
      return;
    }

    if (!activeWorkspaceEnvironmentId) {
      setRemoteWorkspaceItems([]);
      setLoadedWorkspaceFolderIds([]);
      setLoadingWorkspaceFolderIds([]);
      setWorkspaceFolderErrorsById({});
      setWorkspaceBrowserError("Select an environment to browse workspace files.");
      setIsWorkspaceBrowserLoading(false);
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedWorkspaceFolderIds.includes(folderId) || loadingWorkspaceFolderIds.includes(folderId)) {
      return;
    }

    void loadWorkspaceFolder(folderId);
  }, [
    apiKey,
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    hasApiKey,
    loadedWorkspaceFolderIds,
    loadingWorkspaceFolderIds,
    normalizedBackendUrl,
    activeWorkspaceEnvironmentId,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "google-drive" || !googleDriveConnected || !googleDriveConfig?.fetchItems) {
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedGoogleDriveFolderIds.includes(folderId) || loadingGoogleDriveFolderIds.includes(folderId)) {
      return;
    }

    void loadGoogleDriveFolder(folderId);
  }, [
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    googleDriveConfig,
    googleDriveConnected,
    loadedGoogleDriveFolderIds,
    loadingGoogleDriveFolderIds,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "one-drive" || !oneDriveConnected || !oneDriveConfig?.fetchItems) {
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedOneDriveFolderIds.includes(folderId) || loadingOneDriveFolderIds.includes(folderId)) {
      return;
    }

    void loadOneDriveFolder(folderId);
  }, [
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    loadedOneDriveFolderIds,
    loadingOneDriveFolderIds,
    oneDriveConfig,
    oneDriveConnected,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "github" || !githubConnected || !githubConfig?.fetchItems) {
      return;
    }

    const folderId = currentFileBrowserFolderId || "root";
    if (loadedGithubFolderIds.includes(folderId) || loadingGithubFolderIds.includes(folderId)) {
      return;
    }

    void loadGithubFolder(folderId);
  }, [
    currentFileBrowserFolderId,
    currentFileBrowserSource,
    githubConfig,
    githubConnected,
    loadedGithubFolderIds,
    loadingGithubFolderIds,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (!showFileBrowserModal || currentFileBrowserSource !== "notion" || !notionConnected || !notionConfig?.fetchDatabases || notionDatabasesLoaded) {
      return;
    }

    let cancelled = false;
    setIsNotionBrowserLoading(true);
    setNotionBrowserError(null);

    void notionConfig.fetchDatabases()
      .then((databases) => {
        if (cancelled) return;
        setRemoteNotionDatabases(databases || []);
        setNotionDatabasesLoaded(true);
        setNotionBrowserError(null);
      })
      .catch((error) => {
        if (cancelled) return;
        const normalizedError = error instanceof Error ? error : new Error(String(error));
        setRemoteNotionDatabases([]);
        setNotionDatabasesLoaded(false);
        setNotionBrowserError(normalizedError.message || "Failed to load Notion databases.");
      })
      .finally(() => {
        if (!cancelled) {
          setIsNotionBrowserLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    currentFileBrowserSource,
    notionConfig?.fetchDatabases,
    notionConnected,
    notionDatabasesLoaded,
    showFileBrowserModal,
  ]);

  useEffect(() => {
    if (fileBrowserPreviewObjectUrlRef.current) {
      URL.revokeObjectURL(fileBrowserPreviewObjectUrlRef.current);
      fileBrowserPreviewObjectUrlRef.current = null;
    }

    if (!previewFileBrowserItem || previewFileBrowserItem.isFolder || !isBrowserFilePreviewable(previewFileBrowserItem)) {
      setFileBrowserPreviewContent(null);
      setFileBrowserPreviewKind(null);
      setIsFileBrowserPreviewLoading(false);
      return;
    }

    const fileType = getBrowserFileType(previewFileBrowserItem.mimeType, previewFileBrowserItem.name);

    const connectorFetchFileContent =
      currentFileBrowserSource === "google-drive"
        ? googleDriveConfig?.fetchFileContent
        : currentFileBrowserSource === "one-drive"
          ? oneDriveConfig?.fetchFileContent
          : currentFileBrowserSource === "github"
            ? githubConfig?.fetchFileContent
            : undefined;

    if (currentFileBrowserSource !== "workspace" && currentFileBrowserSource !== "notion" && connectorFetchFileContent) {

      let cancelled = false;
      setIsFileBrowserPreviewLoading(true);
      setFileBrowserPreviewContent(null);
      setFileBrowserPreviewKind(null);

      void connectorFetchFileContent(previewFileBrowserItem)
        .then((payload) => {
          if (cancelled) return;
          if (!payload?.content) {
            if (fileType === "image" && previewFileBrowserItem.previewUrl) {
              setFileBrowserPreviewKind("image");
              setFileBrowserPreviewContent(previewFileBrowserItem.previewUrl);
            } else {
              setFileBrowserPreviewContent(null);
              setFileBrowserPreviewKind(null);
            }
            return;
          }

          if (fileType === "image") {
            const mimeType = payload.mimeType || previewFileBrowserItem.mimeType || "image/png";
            setFileBrowserPreviewKind("image");
            setFileBrowserPreviewContent(`data:${mimeType};base64,${normalizeBase64Content(payload.content)}`);
            return;
          }

          if (payload.encoding === "base64") {
            const decoded = decodeBase64TextContent(payload.content);
            setFileBrowserPreviewKind("text");
            setFileBrowserPreviewContent(decoded.slice(0, 5000));
            return;
          }

          setFileBrowserPreviewKind("text");
          setFileBrowserPreviewContent(payload.content.slice(0, 5000));
        })
        .catch(() => {
          if (cancelled) return;
          if (fileType === "image" && previewFileBrowserItem.previewUrl) {
            setFileBrowserPreviewKind("image");
            setFileBrowserPreviewContent(previewFileBrowserItem.previewUrl);
          } else {
            setFileBrowserPreviewContent(null);
            setFileBrowserPreviewKind(null);
          }
        })
        .finally(() => {
          if (!cancelled) {
            setIsFileBrowserPreviewLoading(false);
          }
        });

      return () => {
        cancelled = true;
      };
    }

    if (currentFileBrowserSource !== "workspace") {
      if (fileType === "image" && previewFileBrowserItem.previewUrl) {
        setFileBrowserPreviewKind("image");
        setFileBrowserPreviewContent(previewFileBrowserItem.previewUrl);
      } else {
        setFileBrowserPreviewKind(null);
        setFileBrowserPreviewContent(null);
      }
      setIsFileBrowserPreviewLoading(false);
      return;
    }

    const previewUrl = buildEnvironmentFileDownloadUrl(normalizedBackendUrl, activeWorkspaceEnvironmentId, previewFileBrowserItem.path);
    if (!previewUrl) {
      setFileBrowserPreviewContent(null);
      setFileBrowserPreviewKind(null);
      setIsFileBrowserPreviewLoading(false);
      return;
    }

    const controller = new AbortController();
    const headers = buildRunnerHeaders(requestHeaders, apiKey.trim());
    setIsFileBrowserPreviewLoading(true);
    setFileBrowserPreviewContent(null);
    setFileBrowserPreviewKind(null);

    fetch(previewUrl, {
      method: "GET",
      headers,
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load preview (${response.status})`);
        }

        if (fileType === "image") {
          const blob = await response.blob();
          const objectUrl = URL.createObjectURL(blob);
          fileBrowserPreviewObjectUrlRef.current = objectUrl;
          setFileBrowserPreviewKind("image");
          setFileBrowserPreviewContent(objectUrl);
          return;
        }

        const text = await response.text();
        setFileBrowserPreviewKind("text");
        setFileBrowserPreviewContent(text.slice(0, 5000));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setFileBrowserPreviewContent(null);
        setFileBrowserPreviewKind(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsFileBrowserPreviewLoading(false);
        }
      });

    return () => controller.abort();
  }, [
    activeWorkspaceEnvironmentId,
    apiKey,
    currentFileBrowserSource,
    googleDriveConfig,
    githubConfig,
    normalizedBackendUrl,
    oneDriveConfig,
    previewFileBrowserItem,
    requestHeaders,
  ]);

  useEffect(() => {
    if (!hasInputPopupOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (popupAreaRef.current?.contains(target)) return;
      closeAllInputPopups("outside");
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [hasInputPopupOpen]);

  useEffect(() => {
    if (!useComputerAgentsMode || disabled || isPreparingRun || showFileBrowserModal) return;

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if ((!event.metaKey && !event.ctrlKey) || event.altKey || event.shiftKey || event.repeat) {
        return;
      }
      const shortcutKey = event.key.toLowerCase();
      if (shortcutKey === ATTACH_FILES_SHORTCUT_KEY) {
        event.preventDefault();
        setActiveInputPopup("attach-files");
        return;
      }
      if (shortcutKey === SCHEDULE_SHORTCUT_KEY) {
        event.preventDefault();
        setActiveInputPopup("schedule");
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [disabled, isPreparingRun, showFileBrowserModal, useComputerAgentsMode]);

  const hasCustomEmptyState = turns.length === 0 && emptyState !== undefined && emptyState !== null;
  const shouldRenderInlineComposerWithEmptyState =
    hasCustomEmptyState && emptyStateAfterComposer !== undefined && emptyStateAfterComposer !== null;

  return (
    <div
      ref={rootRef}
      className={`tb-runner-chat ${previewedDocumentAttachment ? "tb-runner-chat-document-preview-open" : ""} ${selectedSubagentDetailPresentation || selectedComputerUseDetailPresentation ? "tb-runner-chat-subagent-detail-open" : ""} ${effectiveSelectedDeepResearchDetailPresentation ? "tb-runner-chat-deep-research-detail-open" : ""} ${className || ""}`.trim()}
      onDragEnterCapture={handleRootFileDragEnter}
      onDragOverCapture={handleRootFileDragOver}
      onDragLeaveCapture={handleRootFileDragLeave}
      onDropCapture={handleRootFileDrop}
      style={
        {
          "--tb-document-preview-width": previewedDocumentAttachment
            ? documentPreviewDrawerWidth !== null
              ? `${documentPreviewDrawerWidth}px`
              : "var(--tb-document-preview-max-width)"
            : "0px",
        } as CSSProperties
      }
    >
      <input ref={fileInputRef} type="file" multiple hidden onChange={handleAddFiles} />

      {isScreenFileDragActive ? (
        <div className="tb-screen-file-drop-overlay">
          <div className="tb-screen-file-drop-overlay-panel">
            <div className="tb-screen-file-drop-overlay-illustration" aria-hidden="true">
              <div className="tb-screen-file-drop-overlay-icon-card tb-screen-file-drop-overlay-icon-card-back">
                <LucideCode className="tb-screen-file-drop-overlay-icon" strokeWidth={1.75} />
              </div>
              <div className="tb-screen-file-drop-overlay-icon-card tb-screen-file-drop-overlay-icon-card-front">
                <IconImages className="tb-screen-file-drop-overlay-icon" />
              </div>
              <div className="tb-screen-file-drop-overlay-icon-card tb-screen-file-drop-overlay-icon-card-side">
                <IconFileText className="tb-screen-file-drop-overlay-icon" />
              </div>
            </div>
            <div className="tb-screen-file-drop-overlay-title">Add files</div>
            <div className="tb-screen-file-drop-overlay-copy">Drop files here to add them to the conversation</div>
          </div>
        </div>
      ) : null}

      {quotedSelectionPopup ? (
        <div
          ref={quotedSelectionPopupRef}
          className="tb-selection-popup"
          style={{
            left: `${quotedSelectionPopup.x}px`,
            top: `${quotedSelectionPopup.y}px`,
          }}
        >
          <button
            type="button"
            className="tb-selection-popup-button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleAddQuotedSelectionToComposer}
          >
            <LucideTextQuote className="tb-selection-popup-icon" strokeWidth={1.7} />
            <span>Add to chat</span>
          </button>
        </div>
      ) : null}

      <div className="workinglogsbox">
        <div
          className={`tb-log-scroll ${hasCustomEmptyState ? "is-custom-empty-state" : ""}`.trim()}
          ref={logsRef}
          onMouseUp={handleQuotedSelectionMouseUp}
        >
          <div
            ref={contentWidthRef}
            className={`tb-content-width ${hasCustomEmptyState ? "is-custom-empty-state" : ""}`.trim()}
          >
            {turns.length === 0
              ? hasCustomEmptyState
                ? emptyState
                : (isPreparingRun || hasRunningTurn || pendingQueuedMessages.length > 0 || isThreadHistoryLoading)
                  ? null
                  : <div className="runner-log-empty">No logs yet. Run a task to start streaming.</div>
              : null}
            {turns.map((turn, turnIndex) => {
              const isTurnRunning = isRunningTurnStatus(turn.status);
              const isTurnPermissionAsked = turn.status === "permission_asked";
              const isQueuedTurn = turn.status === "queued";
              const turnSeconds = getTurnDurationSeconds(turn);
              const { agentMessage, displayedTimelineItems: rawDisplayedTimelineItems } = getTurnTimelineState(turn);
              const normalizedPrompt = turn.prompt.trim();
              const isBtwTurn = turn.presentation === "btw" || normalizedPrompt.toLowerCase().startsWith("/btw");
              const isEditingTurn = editingTurnId === turn.id;
              const canEditTurn = isEditableUserTurn(turn);
              const taskPreviewForTurn =
                threadTaskPreview &&
                !isBtwTurn &&
                turn.presentation !== "context-action-notice" &&
                (turn.isInitialTurn || turnIndex === 0)
                  ? threadTaskPreview
                  : null;
              const missionControlPreviewForTurn =
                !taskPreviewForTurn &&
                threadMissionControlPreview &&
                !isBtwTurn &&
                turn.presentation !== "context-action-notice" &&
                (turn.isInitialTurn || turnIndex === 0)
                  ? threadMissionControlPreview
                  : null;
              const isMissionControlThreadTurn = Boolean(threadMissionControlPreview) && !isBtwTurn && turn.presentation !== "context-action-notice";
              const hasSpecialPromptPreview = Boolean(taskPreviewForTurn || missionControlPreviewForTurn);
              const isActionableTurn = isActionableUserTurn(turn);
              const isForkingTurn = forkingTurnId === turn.id;
              const isEditablePromptTurn = canEditTurn && !hasSpecialPromptPreview;
              const showTurnActions = isActionableTurn && !isEditingTurn && !hasSpecialPromptPreview;
              const areTurnActionsDisabled = !canEditTurn || isForkingTurn || hasSpecialPromptPreview;
              const shouldRenderSpecialPreviewPrompt = Boolean(
                (taskPreviewForTurn?.reviewRequest === true || taskPreviewForTurn?.showPromptPreview === true) && normalizedPrompt
              );
              const actionSummaryLog =
                turn.presentation === "context-action-notice"
                  ? turn.logs.find((log) => log.eventType === "action_summary") || null
                  : null;
              const changedFilePathsForTurn = new Set(
                collectTurnChangedFiles(turn.logs)
                  .map((file) => normalizeRunnerPreviewPath(file.path))
                  .filter((value): value is string => Boolean(value))
              );
              const summaryPreviewItems = collectTurnSummaryPreviewItems(turn.logs, {
                backendUrl: normalizedBackendUrl,
                environmentId: summaryPreviewEnvironmentId,
              }).filter((item) => {
                if (item.kind !== "attachment") return true;
                const normalizedPath = normalizeRunnerPreviewPath(item.attachment.workspacePath || "");
                return !normalizedPath || retainedSummaryPreviewPaths.has(normalizedPath) || changedFilePathsForTurn.has(normalizedPath);
              });
              const visibleTimelineItemCount = visibleTimelineItemCountsByTurn[turn.id];
              const revealedTimelineItems =
                visibleTimelineItemCount === undefined
                  ? rawDisplayedTimelineItems
                  : rawDisplayedTimelineItems.slice(0, visibleTimelineItemCount);
              const visibleWorkLogItemCount = visibleWorkLogItemCountsByTurn[turn.id] ?? RUNNER_WORK_LOG_PAGE_SIZE;
              const firstDisplayedTimelineItemIndex = Math.max(0, revealedTimelineItems.length - visibleWorkLogItemCount);
              const displayedTimelineItems = revealedTimelineItems.slice(firstDisplayedTimelineItemIndex);
              const hasMoreWorkingLogs = firstDisplayedTimelineItemIndex > 0;
              const thinkingStatusPhase =
                thinkingStatusPhaseByTurn[turn.id] ??
                (isTurnRunning && rawDisplayedTimelineItems.length > 0 && !agentMessage?.message ? "visible" : "hidden");
              const shouldRenderThinkingStatus =
                isTurnRunning &&
                rawDisplayedTimelineItems.length > 0 &&
                !agentMessage?.message &&
                thinkingStatusPhase !== "hidden";
              const isWorkLogsLoading =
                isThreadHistoryLoading &&
                !isTurnRunning &&
                Boolean(agentMessage?.message) &&
                revealedTimelineItems.length === 0;
              const isExpanded = expandedTurns[turn.id] ?? !isThreadHistoryLoading;
              const baseDelay = turnIndex * 140;
              const promptStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay) : undefined;
              const metaHeaderStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 40) : undefined;
              const workHeaderStyle = turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 60) : undefined;
              const responseStyle = turn.animateOnRender
                ? getRunnerChatEnterAnimationStyle(baseDelay + 150 + displayedTimelineItems.length * 45)
                : undefined;
              const shouldAnimateTimelineRows = turn.animateOnRender || isTurnRunning;
              const turnAgentLabel = isMissionControlThreadTurn
                ? getRunnerMissionControlAgentName(threadMissionControlPreview)
                : turn.agentName || displayedAgentLabel || "Agent";
              const turnAgentPhotoUrl = resolveTurnAgentPhotoUrl(turnAgentLabel);
              const turnEnvironmentLabel = turn.environmentName || displayedEnvironmentLabel || "Environment";
              const workLabel = isWorkLogsLoading
                ? "Loading Working Logs..."
                : turn.status === "permission_asked"
                  ? "Permission asked"
                  : isTurnRunning
                  ? "Working..."
                  : `Worked for ${formatElapsedDurationLabel(turnSeconds)}`;
              const workToggleLabel = isExpanded ? "Collapse" : "Expand";
              const shouldRenderWorkSection = isTurnRunning || isTurnPermissionAsked || revealedTimelineItems.length > 0 || isWorkLogsLoading;
              const userThreadHistoryItemId = buildRunnerThreadHistoryItemId(turn.id, "user");
              const assistantThreadHistoryItemId = buildRunnerThreadHistoryItemId(turn.id, "assistant");

              if (actionSummaryLog) {
                const actionType = actionSummaryLog.metadata?.actionType;
                const isPendingActionSummary = Boolean(actionSummaryLog.metadata?.isPending);
                const isActionSummaryClickable =
                  !isPendingActionSummary &&
                  typeof onActionSummaryClick === "function" &&
                  (actionType === "revert" || actionType === "reapply") &&
                  Boolean(actionSummaryLog.metadata?.revertedChangeStepId || actionSummaryLog.metadata?.revertedFilePath);
                const actionSummaryContent = isActionSummaryClickable ? (
                  <button
                    type="button"
                    className="tb-context-action-notice-copy tb-context-action-notice-copy-button"
                    onClick={() =>
                      onActionSummaryClick?.({
                        actionType,
                        message: actionSummaryLog.message,
                        revertedChangeStepId: actionSummaryLog.metadata?.revertedChangeStepId ?? null,
                        revertedFilePath: actionSummaryLog.metadata?.revertedFilePath ?? null,
                        revertedFileName: actionSummaryLog.metadata?.revertedFileName ?? null,
                      })
                    }
                  >
                    {isPendingActionSummary ? (
                      <LucideLoaderCircle className="tb-context-action-notice-icon tb-context-action-notice-icon-spinner" strokeWidth={1.5} />
                    ) : (
                      <LucideFileText className="tb-context-action-notice-icon" strokeWidth={1.5} />
                    )}
                    <span>{actionSummaryLog.message}</span>
                  </button>
                ) : (
                  <span className="tb-context-action-notice-copy">
                    {isPendingActionSummary ? (
                      <LucideLoaderCircle className="tb-context-action-notice-icon tb-context-action-notice-icon-spinner" strokeWidth={1.5} />
                    ) : (
                      <LucideFileText className="tb-context-action-notice-icon" strokeWidth={1.5} />
                    )}
                    <span>{actionSummaryLog.message}</span>
                  </span>
                );
                return (
                  <div key={turn.id} className="tb-turn tb-turn-context-action-notice">
                    {turn.prompt.trim() ? (
                      <div
                        ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                        className="task-prompt-in-session-context tb-thread-history-anchor"
                        style={promptStyle}
                      >
                        <CollapsibleRunnerUserPrompt
                          content={stripSystemTags(turn.prompt)}
                          className="tb-message-markdown tb-message-markdown-user"
                        />
                      </div>
                    ) : null}
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                      className={`tb-context-action-notice ${actionType ? `tb-context-action-notice-${actionType}` : ""} ${isPendingActionSummary ? "tb-context-action-notice-pending" : ""}`.trim()}
                      style={turn.animateOnRender ? getRunnerChatEnterAnimationStyle(baseDelay + 40) : undefined}
                    >
                      <span className="tb-context-action-notice-line" />
                      {actionSummaryContent}
                      <span className="tb-context-action-notice-line" />
                    </div>
                  </div>
                );
              }

              if (isBtwTurn) {
                return (
                  <div key={turn.id} className="tb-turn tb-turn-btw">
                    <div className="tb-btw-turn-card" style={promptStyle}>
                      <div
                        ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                        className="tb-btw-turn-prompt tb-thread-history-anchor"
                      >
                        <CollapsibleRunnerUserPrompt
                          content={stripSystemTags(turn.prompt)}
                          className="tb-message-markdown tb-message-markdown-user"
                        />
                      </div>
                      {isTurnRunning && !agentMessage?.message ? (
                        <div className="tb-btw-turn-pending tb-thinking-status" style={responseStyle}>
                          <LucideLoaderCircle className="tb-btw-turn-pending-icon tb-context-action-notice-icon-spinner" strokeWidth={1.5} />
                          <span>Thinking...</span>
                        </div>
                      ) : null}
                      {agentMessage?.message ? (
                        <div
                          ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                          className="tb-btw-turn-response tb-thread-history-anchor"
                          style={responseStyle}
                        >
                          <RunnerMarkdown
                            content={stripSystemTags(agentMessage.message)}
                            className="tb-message-markdown tb-message-markdown-summary"
                            softBreaks
                            onWorkspacePathClick={canPreviewSummaryWorkspacePaths ? (path) => handleSummaryWorkspacePathClick(turn, path, "run_summary") : undefined}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              }

              if (hasSpecialPromptPreview && !isEditingTurn) {
                return (
                  <div key={turn.id} className="tb-turn tb-turn-user tb-turn-user-task-preview">
                    <div
                      ref={(node) => {
                        if (!shouldRenderSpecialPreviewPrompt) {
                          setThreadHistoryAnchorElement(userThreadHistoryItemId, node);
                        }
                      }}
                      className="tb-task-preview-turn-shell tb-thread-history-anchor"
                      style={promptStyle}
                    >
                      {taskPreviewForTurn
                        ? renderRunnerTaskPreviewCard(taskPreviewForTurn, { onClick: onTaskPreviewClick })
                        : renderRunnerMissionControlPreviewCard(missionControlPreviewForTurn)}
                    </div>

                    {shouldRenderSpecialPreviewPrompt ? (
                      <div
                        ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                        className="tb-user-turn-shell tb-thread-history-anchor"
                        style={promptStyle}
                      >
                        <div className="task-prompt-in-session-context">
                          <CollapsibleRunnerUserPrompt
                            content={stripSystemTags(turn.prompt)}
                            className="tb-message-markdown tb-message-markdown-user"
                          />
                        </div>
                      </div>
                    ) : null}

                    {!isQueuedTurn ? (
                      <div className="tb-turn-meta" style={metaHeaderStyle}>
                        {renderTurnAgentTrigger(turn, turnAgentLabel, turnAgentPhotoUrl)}
                        <div className="tb-turn-environment-pill">
                          <LucideCloud className="tb-turn-environment-icon" />
                          <span className="tb-turn-environment-label">{turnEnvironmentLabel}</span>
                        </div>
                      </div>
                    ) : null}

                    {shouldRenderWorkSection ? (
                      <>
                        <button
                          type="button"
                          className="tb-work-header"
                          style={workHeaderStyle}
                          aria-expanded={isExpanded}
                          onClick={() => toggleWorkingLogs(turn.id, isExpanded)}
                        >
                          <span className="tb-work-label">{workLabel}</span>
                          <span className="tb-work-toggle">
                            <span className="tb-work-toggle-label">{workToggleLabel}</span>
                            {isExpanded ? <IconChevronUp className="tb-chevron" /> : <IconChevronDown className="tb-chevron" />}
                          </span>
                        </button>

                        <div className={`tb-work-collapse ${isExpanded ? "" : "collapsed"}`}>
                          {isExpanded ? (
                            <div className="tb-work-collapse-inner">
                              <div className="agent-steps-container">
                                <div className="agent-steps-line" />
                                {hasMoreWorkingLogs ? (
                                  <div className="agent-step-item tb-work-load-more-item">
                                    <div className="agent-step-content">
                                      <button
                                        type="button"
                                        className="tb-work-load-more-button"
                                        onClick={() => loadMoreWorkingLogs(turn.id, revealedTimelineItems.length)}
                                      >
                                        <LucidePlus className="tb-work-load-more-icon" strokeWidth={1.8} />
                                        Load more...
                                      </button>
                                    </div>
                                  </div>
                                ) : null}
                                {displayedTimelineItems.map((item, index) => (
                                  <div
                                    key={timelineItemKey(turn.id, firstDisplayedTimelineItemIndex + index, item)}
                                    className="agent-step-item"
                                    style={shouldAnimateTimelineRows ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + index * 45) : undefined}
                                  >
                                    <div className="agent-step-content">{renderTimelineItem(turn, item, firstDisplayedTimelineItemIndex + index)}</div>
                                  </div>
                                ))}
                              </div>
                              {shouldRenderThinkingStatus ? (
                                <div
                                  className={`agent-step-item tb-thinking-status-transition ${thinkingStatusPhase === "fading" ? "is-fading" : ""}`.trim()}
                                  style={shouldAnimateTimelineRows ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + displayedTimelineItems.length * 45) : undefined}
                                >
                                  <div className="agent-step-content">
                                    <InlineStatusLogBox
                                      label="Thinking..."
                                      icon={<LucideTerminal className="tb-log-card-small-icon" strokeWidth={1.5} />}
                                      pending
                                    />
                                  </div>
                                </div>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : null}

                    {agentMessage?.message ? (
                      <div
                        ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                        className="tb-turn-summary tb-thread-history-anchor"
                        style={responseStyle}
                      >
                        {summaryPreviewItems.length > 0 ? (
                          <div className="runner-attachments-summary-strip" aria-label="Created resources and changed files">
                            {summaryPreviewItems.map((item) => (
                              <Fragment key={`${turn.id}:${item.id}`}>
                                {item.kind === "attachment"
                                  ? renderAttachmentPreviewChip(item.attachment)
                                  : renderRunnerSummaryResourceChip(item.resource, { onClick: onResourcePreviewClick })}
                              </Fragment>
                            ))}
                          </div>
                        ) : null}
                        <div className="tb-turn-response">
                          <RunnerMarkdown
                            content={stripSystemTags(agentMessage.message)}
                            className="tb-message-markdown tb-message-markdown-summary"
                            onWorkspacePathClick={canPreviewSummaryWorkspacePaths ? (path) => handleSummaryWorkspacePathClick(turn, path, "run_summary") : undefined}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              }

              return (
                <div key={turn.id} className="tb-turn tb-turn-user">
                  <div
                    ref={(node) => setThreadHistoryAnchorElement(userThreadHistoryItemId, node)}
                    className={`tb-user-turn-shell ${showTurnActions ? "tb-user-turn-shell-has-actions" : ""} ${isEditablePromptTurn ? "tb-user-turn-shell-editable" : ""} ${isEditingTurn ? "tb-user-turn-shell-editing" : ""} ${isForkingTurn ? "tb-user-turn-shell-forking" : ""}`.trim()}
                    style={promptStyle}
                  >
                    {turn.attachments && turn.attachments.length > 0 ? (
                      <div className="runner-attachments runner-attachments-turn">
                        {turn.attachments.map((attachment) => renderAttachmentPreviewChip(attachment))}
                      </div>
                    ) : null}
                    {turn.quotedSelection ? (
                      <div className="tb-user-turn-quote">
                        <LucideTextQuote className="tb-user-turn-quote-icon" strokeWidth={1.6} />
                        <div className="tb-user-turn-quote-text">{turn.quotedSelection.text}</div>
                      </div>
                    ) : null}
                    <div
                      className={`task-prompt-in-session-context ${isEditablePromptTurn ? "tb-user-turn-editable" : ""} ${isEditingTurn ? "tb-user-turn-editing" : ""}`.trim()}
                    >
                      {isEditingTurn ? (
                        <>
                          <textarea
                            ref={editingTextareaRef}
                            className="tb-user-turn-editor"
                            value={editingTurnDraft}
                            onChange={(event) => setEditingTurnDraft(event.target.value)}
                            onKeyDown={(event) => handleEditedTurnKeyDown(event, turn.id)}
                            autoFocus
                          />
                          <div className="tb-user-turn-edit-actions">
                            <button type="button" className="tb-user-turn-edit-button tb-user-turn-edit-button-secondary" onClick={cancelEditingTurn}>
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="tb-user-turn-edit-button tb-user-turn-edit-button-primary"
                              onClick={() => handleEditedTurnSend(turn.id)}
                              disabled={!editingTurnDraft.trim()}
                            >
                              Send
                            </button>
                          </div>
                        </>
                      ) : taskPreviewForTurn ? (
                        renderRunnerTaskPreviewCard(taskPreviewForTurn, { onClick: onTaskPreviewClick })
                      ) : missionControlPreviewForTurn ? (
                        renderRunnerMissionControlPreviewCard(missionControlPreviewForTurn)
                      ) : (
                        <CollapsibleRunnerUserPrompt
                          content={stripSystemTags(turn.prompt)}
                          className="tb-message-markdown tb-message-markdown-user"
                        />
                      )}
                    </div>
                    {showTurnActions ? (
                      <div className="tb-user-turn-actions">
                        <button
                          type="button"
                          className="tb-user-turn-action-trigger"
                          aria-label="Fork from message"
                          onClick={() => openForkDialogForTurn(turn)}
                          disabled={areTurnActionsDisabled}
                        >
                          {isForkingTurn ? (
                            <LucideLoaderCircle className="tb-user-turn-edit-trigger-icon tb-context-action-notice-icon-spinner" strokeWidth={1.75} />
                          ) : (
                            <LucideGitBranch className="tb-user-turn-edit-trigger-icon" strokeWidth={1.75} />
                          )}
                        </button>
                        <button
                          type="button"
                          className="tb-user-turn-action-trigger"
                          aria-label="Edit message"
                          onClick={() => startEditingTurn(turn)}
                          disabled={areTurnActionsDisabled}
                        >
                          <LucidePencil className="tb-user-turn-edit-trigger-icon" strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {!isQueuedTurn ? (
                    <div className="tb-turn-meta" style={metaHeaderStyle}>
                      {renderTurnAgentTrigger(turn, turnAgentLabel, turnAgentPhotoUrl)}
                      <div className="tb-turn-environment-pill">
                        <LucideCloud className="tb-turn-environment-icon" />
                        <span className="tb-turn-environment-label">{turnEnvironmentLabel}</span>
                      </div>
                    </div>
                  ) : null}

                    {shouldRenderWorkSection ? (
                      <>
                        <button
                          type="button"
                          className="tb-work-header"
                          style={workHeaderStyle}
                          aria-expanded={isExpanded}
                          onClick={() => toggleWorkingLogs(turn.id, isExpanded)}
                        >
                          <span className="tb-work-label">{workLabel}</span>
                          <span className="tb-work-toggle">
                            <span className="tb-work-toggle-label">{workToggleLabel}</span>
                            {isExpanded ? <IconChevronUp className="tb-chevron" /> : <IconChevronDown className="tb-chevron" />}
                          </span>
                        </button>

                      <div className={`tb-work-collapse ${isExpanded ? "" : "collapsed"}`}>
                        {isExpanded ? (
                          <div className="tb-work-collapse-inner">
                            <div className="agent-steps-container">
                              <div className="agent-steps-line" />
                              {hasMoreWorkingLogs ? (
                                <div className="agent-step-item tb-work-load-more-item">
                                  <div className="agent-step-content">
                                    <button
                                      type="button"
                                      className="tb-work-load-more-button"
                                      onClick={() => loadMoreWorkingLogs(turn.id, revealedTimelineItems.length)}
                                    >
                                      <LucidePlus className="tb-work-load-more-icon" strokeWidth={1.8} />
                                      Load more...
                                    </button>
                                  </div>
                                </div>
                              ) : null}
                              {displayedTimelineItems.map((item, index) => (
                                <div
                                  key={timelineItemKey(turn.id, firstDisplayedTimelineItemIndex + index, item)}
                                  className="agent-step-item"
                                  style={shouldAnimateTimelineRows ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + index * 45) : undefined}
                                >
                                  <div className="agent-step-content">{renderTimelineItem(turn, item, firstDisplayedTimelineItemIndex + index)}</div>
                                </div>
                              ))}
                            </div>
                            {shouldRenderThinkingStatus ? (
                              <div
                                className={`agent-step-item tb-thinking-status-transition ${thinkingStatusPhase === "fading" ? "is-fading" : ""}`.trim()}
                                style={shouldAnimateTimelineRows ? getRunnerChatEnterAnimationStyle(baseDelay + 80 + displayedTimelineItems.length * 45) : undefined}
                              >
                                <div className="agent-step-content">
                                  <InlineStatusLogBox
                                    label="Thinking..."
                                    icon={<LucideTerminal className="tb-log-card-small-icon" strokeWidth={1.5} />}
                                    pending
                                  />
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}

                  {agentMessage?.message ? (
                    <div
                      ref={(node) => setThreadHistoryAnchorElement(assistantThreadHistoryItemId, node)}
                      className="tb-turn-summary tb-thread-history-anchor"
                      style={responseStyle}
                    >
                      {summaryPreviewItems.length > 0 ? (
                        <div className="runner-attachments-summary-strip" aria-label="Created resources and changed files">
                          {summaryPreviewItems.map((item) => (
                            <Fragment key={`${turn.id}:${item.id}`}>
                              {item.kind === "attachment"
                                ? renderAttachmentPreviewChip(item.attachment)
                                : renderRunnerSummaryResourceChip(item.resource, { onClick: onResourcePreviewClick })}
                            </Fragment>
                          ))}
                        </div>
                      ) : null}
                      <div className="tb-turn-response">
                        <RunnerMarkdown
                          content={stripSystemTags(agentMessage.message)}
                          className="tb-message-markdown tb-message-markdown-summary"
                          onWorkspacePathClick={canPreviewSummaryWorkspacePaths ? (path) => handleSummaryWorkspacePathClick(turn, path, "run_summary") : undefined}
                        />
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        {shouldDisplayThreadHistoryRail ? (
          <div
            className={`tb-thread-history-rail ${areThreadHistoryControlsVisible ? "is-controls-visible" : ""}`.trim()}
            onMouseEnter={() => setIsThreadHistoryRailHovered(true)}
            onMouseLeave={() => {
              setIsThreadHistoryRailHovered(false);
              setHoveredThreadHistoryItemId(null);
            }}
          >
            <button
              type="button"
              className="tb-thread-history-chevron tb-thread-history-chevron-up"
              onClick={() => navigateThreadHistory(-1)}
              disabled={!previousThreadHistoryItem}
              aria-label="Scroll to previous message"
            >
              <LucideChevronUp className="tb-thread-history-chevron-icon" strokeWidth={1.8} />
            </button>

            <div className="tb-thread-history-lines" role="navigation" aria-label="Thread history">
              {threadHistoryItems.map((item, index) => {
                const isActive = item.id === activeThreadHistoryItemId;
                const isHovered = item.id === hoveredThreadHistoryItemId;
                const lineWidth = isHovered
                  ? RUNNER_THREAD_HISTORY_ACTIVE_LINE_WIDTH
                  : getRunnerThreadHistoryLineWidth(index, activeThreadHistoryIndex);

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`tb-thread-history-line-button ${isActive ? "is-active" : ""} ${isHovered ? "is-hovered" : ""}`.trim()}
                    onMouseEnter={() => setHoveredThreadHistoryItemId(item.id)}
                    onMouseLeave={() => setHoveredThreadHistoryItemId((current) => current === item.id ? null : current)}
                    onFocus={() => setHoveredThreadHistoryItemId(item.id)}
                    onBlur={() => setHoveredThreadHistoryItemId((current) => current === item.id ? null : current)}
                    onClick={() => scrollThreadHistoryItemIntoView(item.id)}
                    aria-label={`Scroll to ${item.label}: ${item.preview}`}
                  >
                    {isHovered ? (
                      <div className="tb-thread-history-preview-bubble" aria-hidden="true">
                        <div className="tb-thread-history-preview-label">{item.label}</div>
                        <div className="tb-thread-history-preview-copy">{item.preview}</div>
                      </div>
                    ) : null}
                    <span
                      className="tb-thread-history-line"
                      style={{ width: `${lineWidth}px` }}
                    />
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="tb-thread-history-chevron tb-thread-history-chevron-down"
              onClick={() => navigateThreadHistory(1)}
              disabled={!nextThreadHistoryItem}
              aria-label="Scroll to next message"
            >
              <LucideChevronDown className="tb-thread-history-chevron-icon" strokeWidth={1.8} />
            </button>
          </div>
        ) : null}
      </div>

      <div className="tb-input-shell">
        <div className="tb-input-width">
          <div className="embedded-runner-input">
            <div
              className={`task-input-box ${privateMode ? "task-input-box-private" : ""} ${stagedComposerToneValue ? `task-input-box-thread-context task-input-box-thread-context-${stagedComposerToneValue}` : ""}`.trim()}
            >
              {attachments.length > 0 ? (
                <div className="runner-attachments">
                  {attachments.map((attachment) =>
                    renderAttachmentPreviewChip(attachment, {
                      removable: true,
                      onRemove: () => removeAttachment(attachment.id),
                    })
                  )}
                </div>
              ) : null}

              {renderedComposerQuotedSelection ? (
                <div
                  className={`tb-composer-quoted-selection ${isComposerQuotedSelectionVisible ? "tb-composer-quoted-selection-visible" : ""}`.trim()}
                >
                  <LucideTextQuote className="tb-composer-quoted-selection-icon" strokeWidth={1.7} />
                  <div className="tb-composer-quoted-selection-copy">{previewQuotedSelectionText(renderedComposerQuotedSelection.text)}</div>
                  <button
                    type="button"
                    className="tb-composer-quoted-selection-dismiss"
                    onClick={clearComposerQuotedSelection}
                    aria-label="Remove quoted text"
                  >
                    <LucideX className="tb-composer-quoted-selection-dismiss-icon" strokeWidth={1.75} />
                  </button>
                </div>
              ) : null}

              <div
                className={`tb-composer-textarea-shell ${hasStagedComposerCommand ? "tb-composer-textarea-shell-staged" : ""}`.trim()}
                style={
                  hasStagedComposerCommand
                    ? ({
                        "--tb-staged-thread-command-offset": stagedComposerOffsetValue,
                    } as CSSProperties)
                    : undefined
                }
              >
                {showSlashCommandPopup ? (
                  <div className="tb-popup-menu tb-popup-menu-main tb-popup-menu-slash tb-popup-menu-animate-up-in">
                    {filteredSlashCommandItems.length > 0 ? (
                      filteredSlashCommandItems.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          className="tb-popup-row tb-popup-row-core-action"
                          onMouseDown={(event) => {
                            event.preventDefault();
                          }}
                          onClick={() => {
                            item.stage();
                            window.requestAnimationFrame(() => {
                              textareaRef.current?.focus();
                            });
                          }}
                        >
                          {item.icon}
                          <span className="tb-popup-label">{item.command}</span>
                          <span className="tb-popup-value">{item.description}</span>
                        </button>
                      ))
                    ) : (
                      <div className="tb-popup-menu-slash-empty">
                        <div className="tb-popup-empty-state">No slash commands match that input.</div>
                      </div>
                    )}
                  </div>
                ) : null}
                {hasStagedComposerCommand ? (
                  <span
                    className={`tb-staged-thread-command ${stagedComposerToneValue ? `tb-staged-thread-command-${stagedComposerToneValue}` : ""}`.trim()}
                  >
                    {stagedComposerLabel}
                  </span>
                ) : null}
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className={`sidebar-textarea ${hasStagedComposerCommand ? "sidebar-textarea-staged" : ""}`.trim()}
                  value={input}
                  onChange={handleInputChange}
                  placeholder={hasStagedComposerCommand ? "" : placeholder}
                  onKeyDown={handleKeyDown}
                  readOnly={Boolean(stagedThreadContextCommand && !textareaAllowsPromptAfterStagedCommand)}
                />
              </div>

                {useComputerAgentsMode ? (
                  <div ref={popupAreaRef} className="task-input-controls task-input-controls-full">
                    <div className="tb-selector-anchor">
                      <button
                        type="button"
                        className={`task-attachment-button task-attachment-button-full ${hasPlusPopupOpen ? "active" : ""}`}
                        onClick={toggleMainMenu}
                        disabled={disabled || isPreparingRun}
                        aria-label="More options"
                        title="More options"
                      >
                        <IconPlus className="task-attachment-icon" />
                      </button>

                      {showMainMenu ? (
                        <div className={`tb-popup-menu tb-popup-menu-main ${mainPopupAnimationClass}`.trim()}>
                          <button
                            type="button"
                            className={`tb-popup-row tb-popup-row-divider tb-popup-row-core-action ${showAttachFilesPopup ? "selected" : ""}`}
                            onClick={handleAttachFilesMenuClick}
                          >
                            <IconPaperclip className="tb-popup-icon" />
                            <span className="tb-popup-label">Attach Files</span>
                            <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command U">
                              <span className="tb-popup-shortcut-key">⌘</span>
                              <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{ATTACH_FILES_SHORTCUT_KEY.toUpperCase()}</span>
                            </span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row"
                            onClick={() => openFileBrowserModal("github")}
                          >
                            <IconGithub className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{githubConnected ? "GitHub" : "Connect GitHub"}</span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row"
                            onClick={() => openFileBrowserModal("google-drive")}
                          >
                            <IconGoogleDrive className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{googleDriveConnected ? "Google Drive" : "Connect Google Drive"}</span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row"
                            onClick={() => openFileBrowserModal("one-drive")}
                          >
                            <IconOneDrive className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{oneDriveConnected ? "OneDrive" : "Connect OneDrive"}</span>
                          </button>
                          <button
                            type="button"
                            className="tb-popup-row tb-popup-row-divider"
                            onClick={() => openFileBrowserModal("notion")}
                          >
                            <IconNotion className="tb-popup-icon tb-popup-brand-icon" />
                            <span className="tb-popup-label">{notionConnected ? "Notion" : "Connect Notion"}</span>
                          </button>
                          <button
                            type="button"
                            className={`tb-popup-row tb-popup-row-core-action ${showSkillsPopup ? "selected" : ""}`}
                            onClick={() => openPlusPopup("skills")}
                          >
                            <IconLayers className="tb-popup-icon" />
                            <span className="tb-popup-label">Skills</span>
                            <IconChevronRight className="tb-popup-chevron" />
                          </button>
                          <button
                            type="button"
                            className={`tb-popup-row tb-popup-row-core-action ${showSchedulePopup ? "selected" : ""} ${scheduleEnabled ? "tb-popup-row-accent" : ""}`}
                            onClick={() => openPlusPopup("schedule")}
                          >
                            <IconClock className="tb-popup-icon" />
                            <span className="tb-popup-label">Schedule</span>
                            <span className="tb-popup-shortcut" aria-label="Keyboard shortcut Command S">
                              <span className="tb-popup-shortcut-key">⌘</span>
                              <span className="tb-popup-shortcut-key tb-popup-shortcut-key-letter">{SCHEDULE_SHORTCUT_KEY.toUpperCase()}</span>
                            </span>
                          </button>
                        </div>
                      ) : null}

                      {showSkillsPopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-skills ${sidePopupAnimationClass}`.trim()}>
                          <div className="tb-popup-attach-topbar">
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeSkillsPopup} aria-label="Close skills popup">
                              <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
                            </button>
                            <div className="tb-popup-attach-topbar-title">Skills</div>
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={() => closeAllInputPopups()} aria-label="Done">
                              <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                            <div className="tb-popup-nav">
                              <button type="button" className={`tb-popup-nav-button ${skillsTab === "system" ? "active" : ""}`} onClick={() => setSkillsTab("system")}>
                                System
                              </button>
                              <button type="button" className={`tb-popup-nav-button ${skillsTab === "custom" ? "active" : ""}`} onClick={() => setSkillsTab("custom")}>
                                Custom
                              </button>
                            </div>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced tb-popup-panel-section-skills-body">
                            {(skillsTab === "system" ? systemSkills : customSkillItems).map((skill) => {
                              const isEnabled = enabledSkillIds.includes(skill.id);
                              return (
                                <button
                                  key={skill.id}
                                  type="button"
                                  className={`tb-popup-row tb-popup-row-skill ${isEnabled ? "selected" : ""}`}
                                  onClick={() => toggleSkill(skill.id)}
                                >
                                  {renderSkillIcon(skill, "tb-popup-icon")}
                                  <span className="tb-popup-label">{skill.name}</span>
                                  <span className="tb-popup-check-slot">{isEnabled ? <LucideCheck className="tb-popup-check" strokeWidth={1.75} /> : null}</span>
                                </button>
                              );
                            })}
                            {skillsTab === "custom" && isLoadingCustomSkills ? (
                              <div className="tb-popup-loading-row">
                                <span className="tb-popup-loading-spinner" aria-hidden="true" />
                                <span className="tb-popup-loading-label">Loading custom skills...</span>
                              </div>
                            ) : null}
                            {skillsTab === "custom" && !isLoadingCustomSkills && customSkillItems.length === 0 ? (
                              <div className="tb-popup-empty-state">No custom skills yet.</div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {showGithubPopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-panel ${sidePopupAnimationClass}`.trim()}>
                          {!githubConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">GitHub not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide GitHub auth in your host app to browse repositories and branches." : "Enter an API key in the playground sidebar to connect GitHub."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                githubConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect GitHub
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-panel-section">
                                <label className="tb-popup-field-label">Repository</label>
                                <select className="tb-popup-select" value={selectedGithubRepositoryId} onChange={(event) => selectGithubRepository(event.target.value)}>
                                  <option value="">No repository</option>
                                  {githubRepositories.map((repository) => (
                                    <option key={repository.id} value={repository.id}>
                                      {repository.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="tb-popup-panel-section tb-popup-panel-section-divider">
                                <label className="tb-popup-field-label">{githubContextLabel}</label>
                                <select className="tb-popup-select" value={selectedGithubContextId} onChange={(event) => selectGithubContext(event.target.value)}>
                                  <option value="">{selectedGithubRepositoryId ? `Select ${githubContextLabel.toLowerCase()}...` : "Select repository first"}</option>
                                  {githubContexts.map((context) => (
                                    <option key={context.id} value={context.id}>
                                      {context.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="tb-popup-panel-footer">
                                <button type="button" className="tb-popup-action tb-popup-action-secondary" onClick={() => {
                                  githubConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }}>
                                  <IconLogout className="tb-popup-action-icon" />
                                  Disconnect GitHub
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      {showNotionPopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-panel ${sidePopupAnimationClass}`.trim()}>
                          {!notionConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">Notion not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide Notion auth in your host app to browse databases." : "Enter an API key in the playground sidebar to connect Notion."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                notionConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect Notion
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-panel-section tb-popup-panel-section-divider">
                                <label className="tb-popup-field-label">Notion Database</label>
                                <select className="tb-popup-select" value={selectedNotionDatabaseId} onChange={(event) => selectNotionDatabase(event.target.value)}>
                                  <option value="">No database selected</option>
                                  <option value="__entire_workspace__">Entire workspace</option>
                                  {notionDatabases.map((database) => (
                                    <option key={database.id} value={database.id}>
                                      {database.icon ? `${database.icon} ` : ""}{database.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="tb-popup-panel-footer">
                                <button type="button" className="tb-popup-action tb-popup-action-secondary" onClick={() => {
                                  notionConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }}>
                                  <IconLogout className="tb-popup-action-icon" />
                                  Disconnect Notion
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      {showGoogleDrivePopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-filebrowser ${sidePopupAnimationClass}`.trim()}>
                          {!googleDriveConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">Google Drive not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide Google Drive auth in your host app to browse files." : "Enter an API key in the playground sidebar to connect Google Drive."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                googleDriveConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect Google Drive
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-file-header">
                                <div className="tb-popup-breadcrumbs">
                                  {googleDrivePath.map((folder, index) => (
                                    <span key={`${folder.id || "root"}-${index}`} className="tb-popup-breadcrumb-part">
                                      {index > 0 ? <span>/</span> : null}
                                      <button type="button" className="tb-popup-breadcrumb" onClick={() => setGoogleDriveFolderId(folder.id)}>
                                        {folder.name}
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <button type="button" className="tb-popup-icon-button" onClick={() => {
                                  googleDriveConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }} aria-label="Disconnect Google Drive">
                                  <IconLogout className="tb-popup-icon-button-glyph" />
                                </button>
                              </div>
                              <div className="tb-popup-file-list">
                                {visibleGoogleDriveItems.length === 0 ? (
                                  <div className="tb-popup-empty">This folder is empty</div>
                                ) : (
                                  visibleGoogleDriveItems.map((item) => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      className={`tb-popup-file-row ${selectedGoogleDriveFileIds.includes(item.id) ? "selected" : ""}`}
                                      onClick={() => {
                                        if (item.isFolder) {
                                          setGoogleDriveFolderId(item.id);
                                          return;
                                        }
                                        setSelectedGoogleDriveFileIds((current) => toggleFileSelection(current, item.id));
                                      }}
                                    >
                                      {item.isFolder ? <IconFolderOpen className="tb-popup-icon tb-popup-file-type" /> : <span className={`tb-popup-file-checkbox ${selectedGoogleDriveFileIds.includes(item.id) ? "selected" : ""}`}>{selectedGoogleDriveFileIds.includes(item.id) ? <IconCheck className="tb-popup-file-check" /> : null}</span>}
                                      {!item.isFolder ? <IconFile className="tb-popup-icon tb-popup-file-type tb-popup-file-type-muted" /> : null}
                                      <span className="tb-popup-file-name">{item.name}</span>
                                      {item.isFolder ? <IconChevronRight className="tb-popup-chevron" /> : null}
                                    </button>
                                  ))
                                )}
                              </div>
                              <div className="tb-popup-file-footer">
                                <button type="button" className="tb-popup-action tb-popup-action-primary" disabled={selectedGoogleDriveFileIds.length === 0} onClick={() => void attachIntegrationFiles("google-drive")}>
                                  <IconPaperclip className="tb-popup-action-icon" />
                                  Attach {selectedGoogleDriveFileIds.length > 0 ? `${selectedGoogleDriveFileIds.length} file${selectedGoogleDriveFileIds.length > 1 ? "s" : ""}` : "Files"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      {showOneDrivePopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-filebrowser ${sidePopupAnimationClass}`.trim()}>
                          {!oneDriveConnected ? (
                            <div className="tb-popup-note">
                              <div className="tb-popup-note-title">OneDrive not connected</div>
                              <div className="tb-popup-note-body">
                                {hasApiKey ? "Provide OneDrive auth in your host app to browse files." : "Enter an API key in the playground sidebar to connect OneDrive."}
                              </div>
                              <button type="button" className="tb-popup-action" onClick={() => {
                                oneDriveConfig?.onConnect?.();
                                closeAllInputPopups();
                              }}>
                                Connect OneDrive
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="tb-popup-file-header">
                                <div className="tb-popup-breadcrumbs">
                                  {oneDrivePath.map((folder, index) => (
                                    <span key={`${folder.id || "root"}-${index}`} className="tb-popup-breadcrumb-part">
                                      {index > 0 ? <span>/</span> : null}
                                      <button type="button" className="tb-popup-breadcrumb" onClick={() => setOneDriveFolderId(folder.id)}>
                                        {folder.name}
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <button type="button" className="tb-popup-icon-button" onClick={() => {
                                  oneDriveConfig?.onDisconnect?.();
                                  closeAllInputPopups();
                                }} aria-label="Disconnect OneDrive">
                                  <IconLogout className="tb-popup-icon-button-glyph" />
                                </button>
                              </div>
                              <div className="tb-popup-file-list">
                                {visibleOneDriveItems.length === 0 ? (
                                  <div className="tb-popup-empty">This folder is empty</div>
                                ) : (
                                  visibleOneDriveItems.map((item) => (
                                    <button
                                      key={item.id}
                                      type="button"
                                      className={`tb-popup-file-row ${selectedOneDriveFileIds.includes(item.id) ? "selected" : ""}`}
                                      onClick={() => {
                                        if (item.isFolder) {
                                          setOneDriveFolderId(item.id);
                                          return;
                                        }
                                        setSelectedOneDriveFileIds((current) => toggleFileSelection(current, item.id));
                                      }}
                                    >
                                      {item.isFolder ? <IconFolderOpen className="tb-popup-icon tb-popup-file-type" /> : <span className={`tb-popup-file-checkbox ${selectedOneDriveFileIds.includes(item.id) ? "selected" : ""}`}>{selectedOneDriveFileIds.includes(item.id) ? <IconCheck className="tb-popup-file-check" /> : null}</span>}
                                      {!item.isFolder ? <IconFile className="tb-popup-icon tb-popup-file-type tb-popup-file-type-muted" /> : null}
                                      <span className="tb-popup-file-name">{item.name}</span>
                                      {item.isFolder ? <IconChevronRight className="tb-popup-chevron" /> : null}
                                    </button>
                                  ))
                                )}
                              </div>
                              <div className="tb-popup-file-footer">
                                <button type="button" className="tb-popup-action tb-popup-action-primary" disabled={selectedOneDriveFileIds.length === 0} onClick={() => void attachIntegrationFiles("one-drive")}>
                                  <IconPaperclip className="tb-popup-action-icon" />
                                  Attach {selectedOneDriveFileIds.length > 0 ? `${selectedOneDriveFileIds.length} file${selectedOneDriveFileIds.length > 1 ? "s" : ""}` : "Files"}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : null}

                      {showSchedulePopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-schedule ${sidePopupAnimationClass}`.trim()}>
                          <div className="tb-popup-attach-topbar">
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeSchedulePopup} aria-label="Close schedule popup">
                              <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
                            </button>
                            <div className="tb-popup-attach-topbar-title">Schedule</div>
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={handleScheduleSubmit} aria-label="Confirm schedule">
                              <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                            <div className="tb-popup-nav">
                              <button type="button" className={`tb-popup-nav-button ${scheduleType === "one-time" ? "active" : ""}`} onClick={() => setScheduleType("one-time")}>
                                One-time
                              </button>
                              <button type="button" className={`tb-popup-nav-button ${scheduleType === "recurring" ? "active" : ""}`} onClick={() => setScheduleType("recurring")}>
                                Recurring
                              </button>
                            </div>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced">
                            <>
                              <div className="tb-popup-field-row">
                                <label className="tb-popup-field-label">Run at</label>
                                <button type="button" className="tb-popup-link-button tb-popup-link-button-inline" onClick={() => {
                                  scheduleConfig?.onOpenCalendarApp?.();
                                  closeAllInputPopups();
                                }}>
                                  Open Calendar App
                                  <LucideChevronRight className="tb-popup-link-chevron" strokeWidth={1.75} />
                                </button>
                              </div>
                              <div className="tb-popup-select-wrap tb-popup-select-wrap-schedule">
                                <input
                                  type="datetime-local"
                                  className="tb-popup-select tb-popup-select-schedule"
                                  value={scheduledAtValue}
                                  min={formatDateTimeLocalValue(new Date())}
                                  onChange={(event) => setScheduledAtValue(event.target.value)}
                                />
                              </div>
                              {scheduleType === "recurring" ? (
                                <>
                                  <div className="tb-popup-field-row tb-popup-field-row-followup">
                                    <label className="tb-popup-field-label">Repeat</label>
                                  </div>
                                  <div className="tb-popup-preset-list">
                                    {schedulePresets.map((preset) => (
                                      <button key={preset.id} type="button" className={`tb-popup-preset-row ${selectedSchedulePresetId === preset.id ? "selected" : ""}`} onClick={() => setSelectedSchedulePresetId(preset.id)}>
                                        <span className="tb-popup-check-slot">{selectedSchedulePresetId === preset.id ? <LucideCheck className="tb-popup-check" strokeWidth={1.75} /> : null}</span>
                                        <span>{preset.label}</span>
                                      </button>
                                    ))}
                                  </div>
                                </>
                              ) : null}
                            </>
                          </div>
                        </div>
                      ) : null}

                      {showAttachFilesPopup ? (
                        <div className={`tb-popup-menu tb-popup-menu-side tb-popup-menu-attach ${sidePopupAnimationClass}`.trim()}>
                          <div className="tb-popup-attach-topbar">
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-close" onClick={closeAttachFilesPopup} aria-label="Close attach files popup">
                              <LucideX className="tb-popup-attach-topbar-icon" strokeWidth={1.75} />
                            </button>
                            <div className="tb-popup-attach-topbar-title">Attach Files</div>
                            <button type="button" className="tb-popup-attach-topbar-button tb-popup-attach-topbar-button-confirm" onClick={() => closeAllInputPopups()} aria-label="Done">
                              <LucideCheck className="tb-popup-attach-topbar-icon" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-header">
                            <div className="tb-popup-nav">
                              <button type="button" className="tb-popup-nav-button active" onClick={handleUploadNewFilesClick}>
                                Upload New
                              </button>
                              <button
                                type="button"
                                className="tb-popup-nav-button"
                                onClick={() => {
                                  openFileBrowserModal("workspace");
                                }}
                              >
                                From Workspace
                              </button>
                            </div>
                          </div>
                          <div className="tb-popup-panel-section tb-popup-panel-section-attach-body tb-popup-panel-section-divider tb-popup-panel-section-divider-spaced">
                            <button
                              type="button"
                              className={`tb-popup-dropzone ${isDraggingOver ? "dragging" : ""}`}
                              onClick={handleUploadNewFilesClick}
                              onDragOver={(event) => {
                                event.preventDefault();
                                setIsDraggingOver(true);
                              }}
                              onDragLeave={() => setIsDraggingOver(false)}
                              onDrop={(event) => {
                                event.preventDefault();
                                setIsDraggingOver(false);
                                handleDroppedLocalFiles(Array.from(event.dataTransfer.files || []));
                              }}
                            >
                              <LucideUpload className="tb-popup-dropzone-icon" strokeWidth={1.75} />
                              <span className="tb-popup-dropzone-title">{isDraggingOver ? "Drop files here" : "Drag & drop files here"}</span>
                              <span className="tb-popup-dropzone-copy">or click to browse</span>
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                    {renderContextIndicatorControl()}

                    {renderAgentSelectorControl()}

                    {scheduledTask ? (
                      <div className="tb-schedule-chip">
                        <LucideCalendar className="tb-schedule-chip-icon" strokeWidth={1.75} />
                        <span className="tb-schedule-chip-label">{formatScheduleChipLabel(scheduledTask)}</span>
                        <button type="button" className="tb-schedule-chip-clear" onClick={clearScheduledTask} aria-label="Clear schedule">
                          <LucideX className="tb-schedule-chip-clear-icon" strokeWidth={1.75} />
                        </button>
                      </div>
                    ) : null}

                    <div className="task-input-spacer" />

                    {renderEnvironmentSelectorControl()}

                    {showRunPreparationIndicator ? (
                      <button type="button" className="task-run-button task-run-button-full" disabled>
                        <span className="runner-spinner" />
                      </button>
                    ) : showActiveRunStopButton ? (
                      <button
                        type="button"
                        className="task-run-button task-run-button-full"
                        onClick={() => void handleStopActiveRun()}
                        disabled={disabled || isStoppingRun}
                        aria-label="Stop agent"
                        title="Stop agent"
                      >
                        <span className="task-stop-icon" />
                      </button>
                    ) : hasComposerText ? (
                      <button
                        type="button"
                        className="task-run-button task-run-button-full"
                        onClick={() => void runTask()}
                        disabled={!canRun}
                        aria-label="Send message"
                        title="Send message"
                      >
                        <LucideArrowUp className="task-send-icon" strokeWidth={2.1} />
                      </button>
                    ) : (
                      <>
                        {isListening ? <span className="task-recording-duration">{recordingElapsedSeconds}s</span> : null}
                        <button
                          type="button"
                          className={`task-mic-button task-mic-button-full ${isListening ? "active" : ""}`}
                          onClick={handleMicrophoneClick}
                          disabled={disabled}
                          aria-label={isListening ? "Stop speech to text" : "Start speech to text"}
                          title={speechToTextTitle}
                        >
                          {isListening ? <IconStop className="task-mic-icon" /> : <IconMic className="task-mic-icon" />}
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="task-input-controls">
                    <button
                      type="button"
                      className="task-attachment-button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={disabled || isPreparingRun || attachments.length >= maxAttachments}
                      aria-label="Upload files"
                      title="Upload files"
                    >
                      <IconPlus className="task-attachment-icon" />
                    </button>
                    {renderContextIndicatorControl()}
                    <div className="task-input-spacer" />
                    {showRunPreparationIndicator ? (
                      <button type="button" className="task-run-button" disabled>
                        <span className="runner-spinner" />
                      </button>
                    ) : showActiveRunStopButton ? (
                      <button
                        type="button"
                        className="task-run-button"
                        onClick={() => void handleStopActiveRun()}
                        disabled={disabled || isStoppingRun}
                      >
                        <span className="task-stop-icon" />
                      </button>
                    ) : hasComposerText ? (
                      <button
                        type="button"
                        className="task-run-button"
                        onClick={() => void runTask()}
                        disabled={!canRun}
                        aria-label="Send message"
                        title="Send message"
                      >
                        <LucideArrowUp className="task-send-icon" strokeWidth={2.1} />
                      </button>
                    ) : (
                      <>
                        {isListening ? <span className="task-recording-duration">{recordingElapsedSeconds}s</span> : null}
                        <button
                          type="button"
                          className={`task-mic-button ${isListening ? "active" : ""}`}
                          onClick={handleMicrophoneClick}
                          disabled={disabled}
                          aria-label={isListening ? "Stop speech to text" : "Start speech to text"}
                          title={speechToTextTitle}
                        >
                          {isListening ? <IconStop className="task-mic-icon" /> : <IconMic className="task-mic-icon" />}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {useComputerAgentsMode && shouldRenderInlineComposerWithEmptyState ? (
                <div className="tb-composer-connectors-row" aria-label="Project tasks and plugins">
                  <div className="tb-composer-project-task-area" ref={projectTasksPopupRef}>
                    {showComposerCreateAgentAction ? (
                      <button
                        type="button"
                        className="tb-composer-project-task-button"
                        onClick={() => {
                          setProjectTasksPopupOpen(false);
                          onComposerCreateAgentClick?.();
                        }}
                        disabled={!onComposerCreateAgentClick}
                      >
                        <LucideBot className="tb-composer-project-task-icon" strokeWidth={1.75} />
                        <span>Create an Agent</span>
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          className={`tb-composer-project-task-button ${projectTasksPopupOpen ? "is-open" : ""}`.trim()}
                          onClick={() => setProjectTasksPopupOpen((current) => !current)}
                          aria-haspopup="dialog"
                          aria-expanded={projectTasksPopupOpen}
                        >
                          <LucideListTodo className="tb-composer-project-task-icon" strokeWidth={1.75} />
                          <span>Project Tasks</span>
                        </button>
                        {selectedComposerProjectTask ? (
                          <span className="tb-composer-project-task-chip">
                            <span className="tb-composer-project-task-chip-label">{selectedComposerProjectTaskLabel || "Selected task"}</span>
                            <button
                              type="button"
                              className="tb-composer-project-task-chip-clear"
                              onClick={() => onComposerProjectTaskChange?.(null)}
                              aria-label="Clear selected project task"
                            >
                              <LucideX className="tb-composer-project-task-chip-clear-icon" strokeWidth={1.8} />
                            </button>
                          </span>
                        ) : null}
                        {projectTasksPopupOpen ? (
                          <div className="tb-composer-project-task-menu" role="dialog" aria-label="Choose project task">
                            <div className="tb-composer-project-task-menu-title">Open Tickets</div>
                            <div className="tb-composer-project-task-list">
                              {composerProjectTaskItems.length > 0 ? (
                                composerProjectTaskItems.map((task) => {
                                  const isSelectedTask = String(task.taskId || "").trim() === selectedComposerProjectTaskId;
                                  const ticketLabel = String(task.ticketNumber || "").trim();
                                  return (
                                    <button
                                      key={task.taskId}
                                      type="button"
                                      className={`tb-composer-project-task-row ${isSelectedTask ? "is-selected" : ""}`.trim()}
                                      onClick={() => {
                                        onComposerProjectTaskChange?.(task);
                                        setProjectTasksPopupOpen(false);
                                      }}
                                    >
                                      <LucideBookmark className="tb-composer-project-task-row-icon" strokeWidth={1.8} />
                                      <span className="tb-composer-project-task-row-main">
                                        <span className="tb-composer-project-task-row-title">{task.title || "Untitled task"}</span>
                                        <span className="tb-composer-project-task-row-meta">
                                          {ticketLabel || "Ticket"}
                                        </span>
                                      </span>
                                      {isSelectedTask ? <LucideCheck className="tb-composer-project-task-row-check" strokeWidth={1.8} /> : null}
                                    </button>
                                  );
                                })
                              ) : (
                                <div className="tb-composer-project-task-empty">No open project tickets.</div>
                              )}
                            </div>
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                  <div className="tb-composer-connectors-right">
                    {connectedComposerConnectors.length > 0 ? (
                      <div className="tb-composer-connectors-actions">
                        {connectedComposerConnectors.map((connector) => {
                          const ConnectorIcon = connector.Icon;
                          return (
                            <button
                              key={connector.id}
                              type="button"
                              className="tb-composer-connector-button"
                              onClick={() => openFileBrowserModal(connector.source)}
                            >
                              <ConnectorIcon className="tb-composer-connector-brand-icon" />
                              <span>{connector.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="tb-composer-connectors-link"
                      onClick={onOpenPluginsOverview}
                      disabled={!onOpenPluginsOverview}
                    >
                      <span>Show Plugins</span>
                      <IconChevronRight className="tb-composer-connectors-link-icon" />
                    </button>
                  </div>
                </div>
              ) : null}
          </div>
        </div>
      </div>

      {shouldRenderInlineComposerWithEmptyState ? emptyStateAfterComposer : null}

      {pendingForkConfiguration ? (
        <div
          className="tb-popup-modal-scrim"
          onClick={() => {
            if (forkingTurnId) return;
            cancelPendingForkConfiguration();
          }}
        >
          <div className="tb-popup-modal tb-fork-thread-modal" onClick={(event) => event.stopPropagation()}>
            <div className="tb-popup-modal-header">
              <div className="tb-popup-note-title">Fork Thread</div>
            </div>
            <div className="tb-fork-thread-modal-body">
              <div className="tb-popup-note-body">
                {pendingForkConfiguration.source === "message"
                  ? "Choose where the forked thread should run before opening the new chat. The selected user message will be staged in the composer and not sent automatically."
                  : pendingForkConfiguration.stagedPrompt.trim()
                    ? "Choose where the forked thread should run before opening the new chat. Your /fork prompt will be sent in the new thread after the fork is created."
                    : "Choose where the forked thread should run before opening the new chat. The full conversation will be copied into the new thread."}
              </div>

              <div className="tb-fork-thread-section">
                <div className="tb-fork-thread-section-header">
                  <div className="tb-fork-thread-section-title">Environment</div>
                  <div className="tb-fork-thread-section-copy">Pick an existing Environment or create a new Environment for this branch.</div>
                </div>
                <div className="tb-fork-thread-environment-list">
                  <div
                    className={`tb-popup-row tb-popup-row-select tb-fork-thread-environment-row ${forkTarget === "existing_environment" ? "selected" : ""}`.trim()}
                    role="button"
                    tabIndex={0}
                    aria-pressed={forkTarget === "existing_environment"}
                    onClick={() => {
                      setForkTarget("existing_environment");
                      setForkDialogError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setForkTarget("existing_environment");
                        setForkDialogError(null);
                      }
                    }}
                  >
                    <span className="tb-popup-check-slot">
                      {forkTarget === "existing_environment" ? <IconCheck className="tb-popup-check" /> : null}
                    </span>
                    <span className="tb-fork-thread-environment-main">
                      <span className="tb-fork-thread-environment-copy">
                        <span className="tb-fork-thread-environment-name">Existing Environment</span>
                      </span>
                    </span>
                    <div className="tb-fork-thread-row-control">
                      <div className="tb-fork-thread-selector-anchor" ref={forkEnvironmentPopupRef}>
                        <button
                          type="button"
                          className={`tb-inline-selector tb-fork-thread-inline-selector ${showForkEnvironmentPopup ? "active" : ""}`.trim()}
                          onClick={(event) => {
                            event.stopPropagation();
                            setForkTarget("existing_environment");
                            setShowForkEnvironmentPopup((current) => !current);
                            setForkDialogError(null);
                          }}
                          disabled={Boolean(forkingTurnId) || availableEnvironments.length === 0}
                        >
                          <span>{selectedForkExistingEnvironment?.name || "Select Environment"}</span>
                          <IconChevronDown className="tb-inline-selector-chevron" />
                        </button>

                        {showForkEnvironmentPopup ? (
                          <div className="tb-popup-menu tb-popup-menu-inline tb-fork-thread-environment-popup">
                            <div className="tb-popup-menu-inline-body">
                              {orderedForkTargetEnvironments.map((environment) => (
                                <button
                                  key={environment.id}
                                  type="button"
                                  className={`tb-popup-row tb-popup-row-select ${forkTargetEnvironmentId === environment.id ? "selected" : ""}`}
                                  onClick={() => {
                                    setForkTarget("existing_environment");
                                    setForkTargetEnvironmentId(environment.id);
                                    setForkExistingEnvironmentFileCopyMode("none");
                                    setShowForkEnvironmentPopup(false);
                                    setForkDialogError(null);
                                  }}
                                >
                                  <span className="tb-popup-check-slot">
                                    {forkTargetEnvironmentId === environment.id ? <IconCheck className="tb-popup-check" /> : null}
                                  </span>
                                  <span className="tb-popup-label">{environment.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`tb-popup-row tb-popup-row-select tb-fork-thread-environment-row ${forkTarget === "new_forked_environment" ? "selected" : ""}`.trim()}
                    role="button"
                    tabIndex={0}
                    aria-pressed={forkTarget === "new_forked_environment"}
                    onClick={() => {
                      setForkTarget("new_forked_environment");
                      setShowForkEnvironmentPopup(false);
                      setForkDialogError(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setForkTarget("new_forked_environment");
                        setShowForkEnvironmentPopup(false);
                        setForkDialogError(null);
                      }
                    }}
                  >
                    <span className="tb-popup-check-slot">
                      {forkTarget === "new_forked_environment" ? <IconCheck className="tb-popup-check" /> : null}
                    </span>
                    <span className="tb-fork-thread-environment-main">
                      <span className="tb-fork-thread-environment-copy">
                        <span className="tb-fork-thread-environment-name">Create new Environment</span>
                      </span>
                    </span>
                    <div className="tb-fork-thread-row-control">
                      <input
                        type="text"
                        className="tb-fork-thread-name-input"
                        value={forkNewEnvironmentName}
                        placeholder="Environment name"
                        disabled={Boolean(forkingTurnId)}
                        onClick={(event) => {
                          event.stopPropagation();
                          setForkTarget("new_forked_environment");
                          setShowForkEnvironmentPopup(false);
                        }}
                        onChange={(event) => {
                          setForkTarget("new_forked_environment");
                          setForkNewEnvironmentName(event.target.value);
                          setForkDialogError(null);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {forkTarget === "new_forked_environment" ? (
                <div className="tb-fork-thread-section">
                  <div className="tb-fork-thread-section-header">
                    <div className="tb-fork-thread-section-title">Workspace files</div>
                    <div className="tb-fork-thread-section-copy">Choose what the new Environment should contain.</div>
                  </div>
                  <div className="tb-fork-thread-copy-options">
                    <button
                      type="button"
                      className={`tb-fork-thread-copy-option ${forkNewEnvironmentFileCopyMode === "all" ? "selected" : ""}`.trim()}
                      onClick={() => {
                        setForkNewEnvironmentFileCopyMode("all");
                        setForkDialogError(null);
                      }}
                      disabled={Boolean(forkingTurnId)}
                    >
                      <span className="tb-fork-thread-copy-option-icon-shell">
                        <LucideCloud className="tb-fork-thread-copy-option-icon" strokeWidth={1.75} />
                      </span>
                      <span className="tb-fork-thread-copy-option-main">
                        <span className="tb-fork-thread-copy-option-copy">
                          <span className="tb-fork-thread-copy-option-title">Copy full current workspace</span>
                          <span className="tb-fork-thread-copy-option-description">Create a new Environment from the source thread&apos;s current workspace.</span>
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`tb-fork-thread-copy-option ${forkNewEnvironmentFileCopyMode === "thread_only" ? "selected" : ""}`.trim()}
                      onClick={() => {
                        setForkNewEnvironmentFileCopyMode("thread_only");
                        setForkDialogError(null);
                      }}
                      disabled={Boolean(forkingTurnId)}
                    >
                      <span className="tb-fork-thread-copy-option-icon-shell">
                        <LucideGitBranch className="tb-fork-thread-copy-option-icon" strokeWidth={1.75} />
                      </span>
                      <span className="tb-fork-thread-copy-option-main">
                        <span className="tb-fork-thread-copy-option-copy">
                          <span className="tb-fork-thread-copy-option-title">Copy only thread-touched files</span>
                          <span className="tb-fork-thread-copy-option-description">Start from an empty workspace and bring over only files the thread changed before this message.</span>
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`tb-fork-thread-copy-option ${forkNewEnvironmentFileCopyMode === "none" ? "selected" : ""}`.trim()}
                      onClick={() => {
                        setForkNewEnvironmentFileCopyMode("none");
                        setForkDialogError(null);
                      }}
                      disabled={Boolean(forkingTurnId)}
                    >
                      <span className="tb-fork-thread-copy-option-icon-shell">
                        <LucideServer className="tb-fork-thread-copy-option-icon" strokeWidth={1.75} />
                      </span>
                      <span className="tb-fork-thread-copy-option-main">
                        <span className="tb-fork-thread-copy-option-copy">
                          <span className="tb-fork-thread-copy-option-title">Start with an empty workspace</span>
                          <span className="tb-fork-thread-copy-option-description">Create a fresh Environment with no files copied from the source thread.</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              ) : shouldShowForkExistingEnvironmentCopyOptions ? (
                <div className="tb-fork-thread-section">
                  <div className="tb-fork-thread-section-header">
                    <div className="tb-fork-thread-section-title">Workspace files</div>
                    <div className="tb-fork-thread-section-copy">Decide whether the selected Environment should receive files from the source thread before the fork opens.</div>
                  </div>
                  <div className="tb-fork-thread-copy-options">
                    <button
                      type="button"
                      className={`tb-fork-thread-copy-option ${forkExistingEnvironmentFileCopyMode === "thread_only" ? "selected" : ""}`.trim()}
                      onClick={() => {
                        setForkExistingEnvironmentFileCopyMode("thread_only");
                        setForkDialogError(null);
                      }}
                      disabled={Boolean(forkingTurnId)}
                    >
                      <span className="tb-fork-thread-copy-option-icon-shell">
                        <LucideGitBranch className="tb-fork-thread-copy-option-icon" strokeWidth={1.75} />
                      </span>
                      <span className="tb-fork-thread-copy-option-main">
                        <span className="tb-fork-thread-copy-option-copy">
                          <span className="tb-fork-thread-copy-option-title">Copy thread-touched files</span>
                          <span className="tb-fork-thread-copy-option-description">Overlay files the thread changed before this message onto the selected Environment.</span>
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className={`tb-fork-thread-copy-option ${forkExistingEnvironmentFileCopyMode === "none" ? "selected" : ""}`.trim()}
                      onClick={() => {
                        setForkExistingEnvironmentFileCopyMode("none");
                        setForkDialogError(null);
                      }}
                      disabled={Boolean(forkingTurnId)}
                    >
                      <span className="tb-fork-thread-copy-option-icon-shell">
                        <LucideServer className="tb-fork-thread-copy-option-icon" strokeWidth={1.75} />
                      </span>
                      <span className="tb-fork-thread-copy-option-main">
                        <span className="tb-fork-thread-copy-option-copy">
                          <span className="tb-fork-thread-copy-option-title">Keep the selected Environment as-is</span>
                          <span className="tb-fork-thread-copy-option-description">Do not copy any files from the source thread into the selected Environment.</span>
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}

              {forkDialogError ? <div className="runner-inline-error tb-fork-thread-error">{forkDialogError}</div> : null}

              <div className="tb-edit-confirmation-actions tb-fork-thread-actions">
                <button
                  type="button"
                  className="tb-popup-action tb-popup-action-secondary"
                  onClick={cancelPendingForkConfiguration}
                  disabled={Boolean(forkingTurnId)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`tb-popup-action tb-popup-action-primary ${forkingTurnId ? "loading" : ""}`.trim()}
                  onClick={() => void confirmForkFromPendingConfiguration()}
                  disabled={
                    Boolean(forkingTurnId) ||
                    (forkTarget === "existing_environment"
                      ? !forkTargetEnvironmentId
                      : !forkNewEnvironmentName.trim())
                  }
                >
                  {forkingTurnId ? (
                    <span className="tb-fork-thread-action-loading">
                      <span className="runner-spinner tb-fork-thread-action-spinner" />
                      <span>Creating Fork...</span>
                    </span>
                  ) : (
                    "Create Fork"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {pendingEditConfirmation ? (
        <div className="tb-popup-modal-scrim" onClick={() => setPendingEditConfirmation(null)}>
          <div className="tb-popup-modal tb-edit-confirmation-modal" onClick={(event) => event.stopPropagation()}>
            <div className="tb-popup-modal-header">
              <div className="tb-popup-note-title">File changes detected</div>
            </div>
            <div className="tb-popup-note-body">
              The following files were changed by this message or later messages. Do you want to keep those workspace changes when rerunning from the edited message?
            </div>
            {pendingEditConfirmation.changedFiles.length > 0 ? (
              <div className="tb-edit-confirmation-files">
                {pendingEditConfirmation.changedFiles.map((file) => (
                  <div key={file.path} className="tb-edit-confirmation-file">
                    <div className="tb-edit-confirmation-file-main">
                      <span className={`tb-edit-confirmation-file-kind is-${file.kind}`}>{file.kind}</span>
                      <span className="tb-edit-confirmation-file-path" title={file.path}>{file.path}</span>
                    </div>
                    {(typeof file.additions === "number" || typeof file.deletions === "number") ? (
                      <div className="tb-edit-confirmation-file-stats">
                        {typeof file.additions === "number" ? <span className="tb-edit-confirmation-file-stat is-added">+{file.additions}</span> : null}
                        {typeof file.deletions === "number" ? <span className="tb-edit-confirmation-file-stat is-removed">-{file.deletions}</span> : null}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            <div className="tb-edit-confirmation-actions">
              <button type="button" className="tb-popup-action tb-popup-action-secondary" onClick={() => setPendingEditConfirmation(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="tb-popup-action tb-popup-action-secondary"
                onClick={() => {
                  const confirmation = pendingEditConfirmation;
                  if (!confirmation) return;
                  void submitEditedTurn(confirmation.turnId, confirmation.nextPrompt, false);
                }}
              >
                Revert file changes
              </button>
              <button
                type="button"
                className="tb-popup-action tb-popup-action-primary"
                onClick={() => {
                  const confirmation = pendingEditConfirmation;
                  if (!confirmation) return;
                  void submitEditedTurn(confirmation.turnId, confirmation.nextPrompt, true);
                }}
              >
                Keep file changes
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deepResearchDetailDrawer}
      {computerUseDetailDrawer}
      {subagentDetailDrawer}
      {documentAttachmentPreviewDrawer}

      {showFileBrowserModal && typeof document !== "undefined"
        ? createPortal(
            <div className="tb-runner-chat">
              <div className="tb-file-browser-scrim" onClick={closeFileBrowserModal}>
                <div className="tb-file-browser-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="tb-file-browser-body">
                    <div className="tb-file-browser-sidebar">
                      <div className="tb-file-browser-search-wrap">
                        <div className="tb-file-browser-search">
                          <IconSearch className="tb-file-browser-search-icon" />
                          <input
                            type="text"
                            placeholder="Search files..."
                            value={fileBrowserSearchQuery}
                            onChange={(event) => setFileBrowserSearchQuery(event.target.value)}
                            className="tb-file-browser-search-input"
                          />
                          {fileBrowserSearchQuery ? (
                            <button type="button" className="tb-file-browser-search-clear" onClick={() => setFileBrowserSearchQuery("")}>
                              <IconX className="tb-file-browser-search-clear-icon" />
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {availableEnvironments.length > 0 ? (
                        <div className="tb-file-browser-sidebar-section tb-file-browser-sidebar-section-environments">
                          <div className="tb-file-browser-sidebar-title">Environments</div>
                          <div className="tb-file-browser-sidebar-list tb-file-browser-sidebar-list-environments">
                            {availableEnvironments.map((environment) => (
                              <button
                                key={environment.id}
                                type="button"
                                className={`tb-file-browser-source-row ${currentFileBrowserSource === "workspace" && selectedEnvironmentId === environment.id ? "active" : ""}`}
                                onClick={() => handleWorkspaceFileBrowserEnvironmentSelect(environment.id)}
                              >
                                <IconCloud className="tb-file-browser-source-icon" />
                                <span className="tb-file-browser-source-label">{environment.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      <div className="tb-file-browser-sidebar-section">
                        <div className="tb-file-browser-sidebar-title">Integrations</div>
                        <div className="tb-file-browser-sidebar-list">
                          <button
                            type="button"
                            className={`tb-file-browser-source-row ${currentFileBrowserSource === "google-drive" ? "active" : ""}`}
                            onClick={() => switchFileBrowserSource("google-drive")}
                          >
                            <IconGoogleDrive className="tb-file-browser-source-brand-icon" />
                            <span className="tb-file-browser-source-label">Google Drive</span>
                            {!googleDriveConnected ? <span className="tb-file-browser-source-note">Connect</span> : null}
                          </button>
                          <button
                            type="button"
                            className={`tb-file-browser-source-row ${currentFileBrowserSource === "notion" ? "active" : ""}`}
                            onClick={() => switchFileBrowserSource("notion")}
                          >
                            <IconNotion className="tb-file-browser-source-brand-icon" />
                            <span className="tb-file-browser-source-label">Notion</span>
                            {!notionConnected ? <span className="tb-file-browser-source-note">Connect</span> : null}
                          </button>
                          <button
                            type="button"
                            className={`tb-file-browser-source-row ${currentFileBrowserSource === "one-drive" ? "active" : ""}`}
                            onClick={() => switchFileBrowserSource("one-drive")}
                          >
                            <IconOneDrive className="tb-file-browser-source-brand-icon" />
                            <span className="tb-file-browser-source-label">OneDrive</span>
                            {!oneDriveConnected ? <span className="tb-file-browser-source-note">Connect</span> : null}
                          </button>
                          <button
                            type="button"
                            className={`tb-file-browser-source-row ${currentFileBrowserSource === "github" ? "active" : ""}`}
                            onClick={() => switchFileBrowserSource("github")}
                          >
                            <IconGithub className="tb-file-browser-source-brand-icon" />
                            <span className="tb-file-browser-source-label">GitHub</span>
                            {!githubConnected ? <span className="tb-file-browser-source-note">Connect</span> : null}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="tb-file-browser-main">
                      {showGoogleDriveAuthScreen || showOneDriveAuthScreen || showGithubAuthScreen || showNotionAuthScreen ? (
                        <div className="tb-file-browser-auth-screen">
                          <div className="tb-file-browser-auth-card">
                            <div className="tb-file-browser-auth-icon-wrap">
                              {showGoogleDriveAuthScreen ? (
                                <IconGoogleDrive className="tb-file-browser-auth-icon" />
                              ) : showNotionAuthScreen ? (
                                <IconNotion className="tb-file-browser-auth-icon" />
                              ) : showOneDriveAuthScreen ? (
                                <IconOneDrive className="tb-file-browser-auth-icon" />
                              ) : (
                                <IconGithub className="tb-file-browser-auth-icon" />
                              )}
                            </div>
                            <h3 className="tb-file-browser-auth-title">
                              {showGoogleDriveAuthScreen ? "Connect to Google Drive" : showNotionAuthScreen ? "Connect to Notion" : showOneDriveAuthScreen ? "Connect to OneDrive" : "Connect to GitHub"}
                            </h3>
                            <p className="tb-file-browser-auth-copy">
                              {showGoogleDriveAuthScreen
                                ? "Connect your Google Drive to browse and attach files."
                                : showNotionAuthScreen
                                  ? "Connect your Notion workspace to browse and select databases."
                                : showOneDriveAuthScreen
                                  ? "Connect your OneDrive to browse and attach files."
                                  : "Connect your GitHub to browse and attach repository files."}
                            </p>
                            <button
                              type="button"
                              className="tb-file-browser-auth-button"
                              onClick={() => {
                                if (showGoogleDriveAuthScreen) {
                                  googleDriveConfig?.onConnect?.();
                                  return;
                                }
                                if (showNotionAuthScreen) {
                                  notionConfig?.onConnect?.();
                                  return;
                                }
                                if (showOneDriveAuthScreen) {
                                  oneDriveConfig?.onConnect?.();
                                  return;
                                }
                                githubConfig?.onConnect?.();
                              }}
                            >
                              {showGoogleDriveAuthScreen ? "Connect Google Drive" : showNotionAuthScreen ? "Connect Notion" : showOneDriveAuthScreen ? "Connect OneDrive" : "Connect GitHub"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="tb-file-browser-header">
                            <button type="button" className="tb-file-browser-nav-button" onClick={goFileBrowserBack} disabled={fileBrowserHistoryIndex <= 0}>
                              <IconChevronLeft className="tb-file-browser-nav-icon" />
                            </button>
                            <button type="button" className="tb-file-browser-nav-button" onClick={goFileBrowserForward} disabled={fileBrowserHistoryIndex >= fileBrowserHistory.length - 1}>
                              <IconChevronRight className="tb-file-browser-nav-icon" />
                            </button>
                            <div className="tb-file-browser-header-icon">
                              {currentFileBrowserSource === "google-drive" ? (
                                <IconGoogleDrive className="tb-file-browser-source-brand-icon" />
                              ) : currentFileBrowserSource === "notion" ? (
                                <IconNotion className="tb-file-browser-source-brand-icon" />
                              ) : currentFileBrowserSource === "github" ? (
                                <IconGithub className="tb-file-browser-source-brand-icon" />
                              ) : currentFileBrowserSource === "one-drive" ? (
                                <IconOneDrive className="tb-file-browser-source-brand-icon" />
                              ) : (
                                <IconCloud className="tb-file-browser-source-icon" />
                              )}
                            </div>
                            <div className="tb-file-browser-breadcrumbs">
                              {fileBrowserPath.map((crumb, index) => (
                                <span key={`${crumb.id || "root"}-${index}`} className="tb-file-browser-breadcrumb-chip">
                                  {index > 0 ? <span className="tb-file-browser-breadcrumb-sep">/</span> : null}
                                  <button
                                    type="button"
                                    className={`tb-file-browser-breadcrumb ${index === fileBrowserPath.length - 1 ? "active" : ""}`}
                                    onClick={() => navigateFileBrowserToBreadcrumb(index)}
                                  >
                                    {crumb.name}
                                  </button>
                                </span>
                              ))}
                            </div>
                            {currentFileBrowserSource === "google-drive" && googleDriveItems.length > 0 && googleDriveConfig?.onManageAccess ? (
                              <button type="button" className="tb-file-browser-toolbar-button" onClick={handleGoogleDriveManageAccess} disabled={isGoogleDrivePickerLoading} title="Manage file access">
                                {isGoogleDrivePickerLoading ? <IconLoader2 className="tb-file-browser-toolbar-icon tb-file-browser-folder-chevron-spin" /> : <IconFolderPlus className="tb-file-browser-toolbar-icon" />}
                              </button>
                            ) : null}
                            {currentFileBrowserSource === "google-drive" && googleDriveConfig?.onDisconnect ? (
                              <button type="button" className="tb-file-browser-toolbar-button" onClick={() => googleDriveConfig.onDisconnect?.()} title="Disconnect Google Drive">
                                <IconLogout className="tb-file-browser-toolbar-icon" />
                              </button>
                            ) : null}
                            {currentFileBrowserSource === "notion" && notionConfig?.onDisconnect ? (
                              <button type="button" className="tb-file-browser-toolbar-button" onClick={() => notionConfig.onDisconnect?.()} title="Disconnect Notion">
                                <IconLogout className="tb-file-browser-toolbar-icon" />
                              </button>
                            ) : null}
                            {currentFileBrowserSource === "one-drive" && oneDriveConfig?.onDisconnect ? (
                              <button type="button" className="tb-file-browser-toolbar-button" onClick={() => oneDriveConfig.onDisconnect?.()} title="Disconnect OneDrive">
                                <IconLogout className="tb-file-browser-toolbar-icon" />
                              </button>
                            ) : null}
                            {currentFileBrowserSource === "github" && githubConfig?.onDisconnect ? (
                              <button type="button" className="tb-file-browser-toolbar-button" onClick={() => githubConfig.onDisconnect?.()} title="Disconnect GitHub">
                                <IconLogout className="tb-file-browser-toolbar-icon" />
                              </button>
                            ) : null}
                          </div>

                          <div className="tb-file-browser-list">
                            {currentFileBrowserSource === "workspace" && isWorkspaceBrowserLoading ? (
                              <div className="tb-file-browser-empty">Loading workspace files...</div>
                            ) : currentFileBrowserSource === "workspace" && workspaceBrowserError ? (
                              <div className="tb-file-browser-empty">{workspaceBrowserError}</div>
                            ) : currentFileBrowserSource === "google-drive" && isGoogleDriveBrowserLoading ? (
                              <div className="tb-file-browser-empty">Loading Google Drive files...</div>
                            ) : currentFileBrowserSource === "google-drive" && googleDriveBrowserError ? (
                              <div className="tb-file-browser-empty">{googleDriveBrowserError}</div>
                            ) : currentFileBrowserSource === "notion" && isNotionBrowserLoading ? (
                              <div className="tb-file-browser-empty">Loading Notion databases...</div>
                            ) : currentFileBrowserSource === "notion" && notionBrowserError ? (
                              <div className="tb-file-browser-empty">{notionBrowserError}</div>
                            ) : currentFileBrowserSource === "one-drive" && isOneDriveBrowserLoading ? (
                              <div className="tb-file-browser-empty">Loading OneDrive files...</div>
                            ) : currentFileBrowserSource === "one-drive" && oneDriveBrowserError ? (
                              <div className="tb-file-browser-empty">{oneDriveBrowserError}</div>
                            ) : currentFileBrowserSource === "github" && isGithubBrowserLoading ? (
                              <div className="tb-file-browser-empty">Loading GitHub files...</div>
                            ) : currentFileBrowserSource === "github" && githubBrowserError ? (
                              <div className="tb-file-browser-empty">{githubBrowserError}</div>
                            ) : showGoogleDrivePickerPrompt ? (
                              <div className="tb-file-browser-empty-state">
                                <div className="tb-file-browser-auth-icon-wrap">
                                  <IconGoogleDrive className="tb-file-browser-auth-icon" />
                                </div>
                                <h3 className="tb-file-browser-auth-title">Select files to share</h3>
                                <p className="tb-file-browser-auth-copy">Choose which files and folders from your Google Drive you want to access in Testbase.</p>
                                <button type="button" className="tb-file-browser-auth-button" onClick={handleGoogleDriveManageAccess} disabled={isGoogleDrivePickerLoading}>
                                  {isGoogleDrivePickerLoading ? "Opening picker..." : "Select Files from Google Drive"}
                                </button>
                              </div>
                            ) : filteredFileBrowserItems.length === 0 ? (
                              <div className="tb-file-browser-empty">
                                {fileBrowserSearchQuery ? "No files match your search" : currentFileBrowserSource === "notion" ? "No Notion databases found" : "This folder is empty"}
                              </div>
                            ) : (
                              <div className="tb-file-browser-list-inner">
                                {filteredFileBrowserItems.map((item) => renderFileBrowserItem(item))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    {previewFileBrowserItem ? (
                      <div className="tb-file-browser-preview">
                        <div className="tb-file-browser-preview-header">
                          <div className="tb-file-browser-preview-art">
                            {isFileBrowserPreviewLoading ? (
                              <IconLoader2 className="tb-file-browser-preview-loader" />
                            ) : fileBrowserPreviewContent && fileBrowserPreviewKind === "image" ? (
                              <img src={fileBrowserPreviewContent} alt={previewFileBrowserItem.name} className="tb-file-browser-preview-image" />
                            ) : fileBrowserPreviewContent && fileBrowserPreviewKind === "text" ? (
                              <pre className="tb-file-browser-preview-text">{fileBrowserPreviewContent}</pre>
                            ) : (
                              renderBrowserFileIcon(previewFileBrowserItem, "tb-file-browser-preview-glyph")
                            )}
                          </div>
                          <h3 className="tb-file-browser-preview-name">{previewFileBrowserItem.name}</h3>
                          <p className="tb-file-browser-preview-subtitle">
                            {previewFileBrowserItem.isFolder ? "Folder" : formatBrowserFileSize(previewFileBrowserItem.size)}
                          </p>
                        </div>
                        <div className="tb-file-browser-preview-info">
                          <div className="tb-file-browser-preview-info-title">Information</div>
                          <div className="tb-file-browser-preview-info-row">
                            <span>Modified</span>
                            <span>{formatBrowserFileDate(previewFileBrowserItem.modifiedTime)}</span>
                          </div>
                          <div className="tb-file-browser-preview-info-row">
                            <span>Created</span>
                            <span>{formatBrowserFileDate(previewFileBrowserItem.createdTime)}</span>
                          </div>
                          <div className="tb-file-browser-preview-info-row">
                            <span>Type</span>
                            <span>{previewFileBrowserItem.isFolder ? "folder" : getBrowserFileType(previewFileBrowserItem.mimeType, previewFileBrowserItem.name)}</span>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="tb-file-browser-footer">
                    <button type="button" className="tb-file-browser-footer-button tb-file-browser-footer-button-secondary" onClick={closeFileBrowserModal}>
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="tb-file-browser-footer-button tb-file-browser-footer-button-primary"
                      onClick={() => void handleFileBrowserAttach()}
                      disabled={selectedFileBrowserIds.length === 0 || isFileBrowserAttaching}
                    >
                      <span className="tb-file-browser-footer-button-content">
                        {isFileBrowserAttaching ? <span className="runner-spinner tb-file-browser-footer-button-spinner" /> : null}
                        <span className="tb-file-browser-footer-button-label">
                          {isFileBrowserAttaching
                            ? "Attaching Files..."
                            : `${currentFileBrowserSource === "notion" ? "Use" : "Attach"} ${selectedFileBrowserIds.length > 0 ? selectedFileBrowserLabel : currentFileBrowserSource === "notion" ? "Database" : "Files"}`}
                        </span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
      {showFileBrowserApiKeyPrompt && typeof document !== "undefined"
        ? createPortal(
            <div className="tb-runner-chat">
              <div className="tb-file-browser-scrim" onClick={closeFileBrowserApiKeyPrompt}>
                <div className="tb-file-browser-api-key-modal" onClick={(event) => event.stopPropagation()}>
                  <div className="tb-popup-note">
                    <div className="tb-popup-note-title">API key required</div>
                    <div className="tb-popup-note-body">Enter an API key in the playground sidebar to browse workspace files.</div>
                  </div>
                  <div className="tb-file-browser-api-key-footer">
                    <button type="button" className="tb-file-browser-footer-button tb-file-browser-footer-button-secondary" onClick={closeFileBrowserApiKeyPrompt}>
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export type { RunnerLog };
