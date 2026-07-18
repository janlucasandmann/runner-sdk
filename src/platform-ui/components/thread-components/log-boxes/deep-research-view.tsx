import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CSSProperties } from "react";
import { Telescope, X } from "lucide-react";

import type { RunnerDeepResearchSession, RunnerLog } from "../../../../types.js";
import {
  getRunnerChatEnterAnimationStyle,
  RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS,
} from "../shared/enter-animation.js";
import { RunnerMarkdown } from "../shared/runner-markdown.js";
import { CompactActionLogLine } from "./compact-action-log-line.js";
import {
  extractResearchTopic,
  getDeepResearchLogState,
  parseDeepResearchOutput,
  type RunnerDeepResearchState,
} from "./deep-research-state.js";
import {
  isRunnerDetailDrawerPinnedToBottom,
  sanitizeSubagentDisplayText,
} from "./presentation-utils.js";

interface RunnerDeepResearchDisplayLog {
  key: string;
  label?: string | null;
  message: string;
  timeLabel?: string;
  tone?: "default" | "success" | "error";
}

function useDeepResearchAnimatedEntryKeys(
  entries: RunnerDeepResearchDisplayLog[],
): Set<string> {
  const [animatedKeys, setAnimatedKeys] = useState<Set<string>>(new Set());
  const seenKeysRef = useRef<Set<string>>(new Set());
  const keySignature = useMemo(
    () => entries.map((entry) => entry.key).join("|"),
    [entries],
  );

  useEffect(() => {
    const previousKeys = seenKeysRef.current;
    const currentKeys = entries.map((entry) => entry.key);
    const addedKeys = currentKeys.filter((key) => !previousKeys.has(key));
    seenKeysRef.current = new Set(currentKeys);
    if (addedKeys.length === 0) return;

    setAnimatedKeys((current) => {
      const next = new Set(current);
      addedKeys.forEach((key) => next.add(key));
      return next;
    });

    const timeoutId = window.setTimeout(() => {
      setAnimatedKeys((current) => {
        const next = new Set(current);
        addedKeys.forEach((key) => next.delete(key));
        return next;
      });
    }, RUNNER_CHAT_ENTER_ANIMATION_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [entries, keySignature]);

  return animatedKeys;
}

function isVisibleDeepResearchDisplayEvent(
  event: string | null | undefined,
): boolean {
  const normalized = String(event || "").trim();
  if (!normalized) return false;
  return ![
    "status",
    "research_complete",
    "complete",
    "error",
    "timeout",
    "connection_timeout",
    "resume_timeout",
    "resume_error",
    "resuming_stream",
    "stream_ended",
    "resolved_runtime",
  ].includes(normalized);
}

function formatDeepResearchDisplayLog(
  log: RunnerLog,
  index: number,
): RunnerDeepResearchDisplayLog | null {
  const deepResearch = log.metadata?.deepResearch;
  if (!deepResearch) return null;

  const timeLabel = typeof log.time === "string" && log.time.trim()
    ? log.time.trim()
    : undefined;
  const event = String(deepResearch.event || "").trim();
  if (!isVisibleDeepResearchDisplayEvent(event)) return null;
  const eventLabel = event.replace(/_/g, " ").trim();
  const key = `${event || "event"}-${index}-${timeLabel || ""}`;

  switch (event) {
    case "start":
      return {
        key,
        label: "Started",
        message: deepResearch.topic || "Starting deep research task.",
        timeLabel,
      };
    case "interaction_started":
      return {
        key,
        label: "Researching",
        message: "Connected the research session and started gathering material.",
        timeLabel,
      };
    case "thinking":
      return {
        key,
        label: null,
        message: deepResearch.thinkingSummary
          || "Analyzing the current research direction.",
        timeLabel,
      };
    case "content":
      return {
        key,
        label: "Finding",
        message: sanitizeSubagentDisplayText(log.message)
          || "Captured additional source material.",
        timeLabel,
      };
    default:
      return {
        key,
        label: eventLabel
          ? eventLabel.charAt(0).toUpperCase() + eventLabel.slice(1)
          : "Update",
        message: sanitizeSubagentDisplayText(log.message)
          || "Deep research updated.",
        timeLabel,
      };
  }
}

function buildDeepResearchDisplayLogs({
  streamingLogs,
  parsed,
}: {
  streamingLogs: RunnerLog[];
  parsed: RunnerDeepResearchState;
}): RunnerDeepResearchDisplayLog[] {
  const formattedStreamingLogs = streamingLogs
    .map((log, index) => formatDeepResearchDisplayLog(log, index))
    .filter((entry): entry is RunnerDeepResearchDisplayLog => Boolean(entry));

  if (formattedStreamingLogs.length > 0) {
    return formattedStreamingLogs;
  }

  return parsed.thinkingSummaries.map((summary, index) => ({
    key: `synthetic-thinking-${index}`,
    label: null,
    message: summary,
  }));
}

function DeepResearchDisplayEventRow({
  entry,
  className,
  style,
}: {
  entry: RunnerDeepResearchDisplayLog;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={`tb-deep-research-log-event ${entry.tone === "error" ? "is-error" : entry.tone === "success" ? "is-success" : ""} ${className || ""}`.trim()}
      style={style}
    >
      {entry.label || entry.timeLabel ? (
        <div className="tb-deep-research-log-event-header">
          {entry.label ? (
            <span className="tb-deep-research-log-event-label">
              {entry.label}
            </span>
          ) : <span />}
          {entry.timeLabel ? (
            <span className="tb-deep-research-log-event-time">
              {entry.timeLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      <RunnerMarkdown
        content={entry.message}
        className="tb-message-markdown tb-message-markdown-summary tb-deep-research-log-event-markdown"
        softBreaks
        disallowHeadings
      />
    </div>
  );
}

function getDeepResearchReportFilename(
  reportPath: string | null | undefined,
): string {
  const normalized = String(reportPath || "").trim().replace(/\\/g, "/");
  if (!normalized) return "";
  const segments = normalized.split("/").filter(Boolean);
  return segments[segments.length - 1] || normalized;
}

function truncateDeepResearchReportFilename(
  value: string,
  maxLength = 44,
): string {
  const normalized = String(value || "").trim();
  if (!normalized || normalized.length <= maxLength) return normalized;
  const extension = normalized.match(/(\.[A-Za-z0-9_-]+)$/)?.[1] || "";
  const baseLength = Math.max(12, maxLength - extension.length - 1);
  return `${normalized.slice(0, baseLength)}…${extension}`;
}

export function DeepResearchEventLogBox({
  log,
  timeLabel,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  void timeLabel;
  const data = log.metadata?.deepResearch;
  if (!isVisibleDeepResearchDisplayEvent(data?.event)) return null;
  const statusLabel = data?.event === "complete"
    || data?.event === "research_complete"
    ? "complete"
    : data?.event === "thinking"
      ? "thinking"
      : data?.event === "error"
        ? "error"
        : data?.event || "starting";
  return (
    <CompactActionLogLine
      icon={(
        <Telescope
          className="tb-log-compact-action-icon-svg"
          strokeWidth={1.6}
        />
      )}
      title="Deep Research"
      detail={
        [String(data?.topic || "").trim(), statusLabel]
          .filter(Boolean)
          .join(" - ")
      }
    />
  );
}

export function DeepResearchCommandLogBox({
  log,
  timeLabel,
}: {
  log: RunnerLog;
  timeLabel?: string;
}) {
  void timeLabel;
  const parsed = parseDeepResearchOutput(String(log.metadata?.output || ""));
  const topic = extractResearchTopic(log.metadata?.command || "")
    || parsed.topic;
  const isError = typeof log.metadata?.exitCode === "number"
    && log.metadata.exitCode !== 0;
  return (
    <CompactActionLogLine
      icon={(
        <Telescope
          className="tb-log-compact-action-icon-svg"
          strokeWidth={1.6}
        />
      )}
      title={isError ? "Deep Research Failed" : "Deep Research"}
      detail={
        [String(topic || "").trim(), parsed.status]
          .filter(Boolean)
          .join(" - ")
      }
    />
  );
}

export interface DeepResearchLogBoxProps {
  log?: RunnerLog;
  logs?: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
  timeLabel?: string;
  onOpenDetails?: () => void;
  isDetailOpen?: boolean;
  fallbackTopic?: string | null;
}

export function DeepResearchLogBox({
  log,
  logs,
  runningCommandLog,
  session,
  timeLabel,
  onOpenDetails,
  isDetailOpen = false,
  fallbackTopic,
}: DeepResearchLogBoxProps) {
  const {
    parsed,
    topic,
    isError,
    statusLabel,
  } = useMemo(
    () => getDeepResearchLogState({ log, logs, runningCommandLog, session }),
    [log, logs, runningCommandLog, session],
  );
  const resolvedTopic = topic
    || parsed.topic
    || String(fallbackTopic || "").trim()
    || null;
  void timeLabel;
  void isDetailOpen;

  return (
    <CompactActionLogLine
      icon={(
        <Telescope
          className="tb-log-compact-action-icon-svg"
          strokeWidth={1.6}
        />
      )}
      title={isError ? "Deep Research Failed" : "Deep Research"}
      detail={[resolvedTopic || "", statusLabel].filter(Boolean).join(" - ")}
      onClick={onOpenDetails}
    />
  );
}

export interface DeepResearchDetailDrawerProps {
  log?: RunnerLog;
  logs?: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
  onClose: () => void;
  fallbackTopic?: string | null;
  onReportFileClick?: (path: string) => void;
}

export function DeepResearchDetailDrawer({
  log,
  logs,
  runningCommandLog,
  session,
  onClose,
  fallbackTopic,
  onReportFileClick,
}: DeepResearchDetailDrawerProps) {
  const {
    streamingLogs,
    parsed,
    topic,
    isError,
    statusLabel,
  } = useMemo(
    () => getDeepResearchLogState({ log, logs, runningCommandLog, session }),
    [log, logs, runningCommandLog, session],
  );
  const displayLogs = useMemo(
    () => buildDeepResearchDisplayLogs({ streamingLogs, parsed }),
    [parsed, streamingLogs],
  );

  const taskCopy = String(
    topic
      || parsed.topic
      || String(fallbackTopic || "").trim()
      || "Deep research task",
  ).trim();
  const reportFilename = getDeepResearchReportFilename(parsed.reportFile);
  const reportFilenameLabel = truncateDeepResearchReportFilename(
    reportFilename,
  );
  const canOpenReportFile = Boolean(
    parsed.reportFile && typeof onReportFileClick === "function",
  );
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const shouldAutoScrollRef = useRef(true);
  const animatedLogKeys = useDeepResearchAnimatedEntryKeys(displayLogs);

  useEffect(() => {
    const scrollElement = bodyRef.current;
    if (!scrollElement) return;

    function handleScroll() {
      shouldAutoScrollRef.current = isRunnerDetailDrawerPinnedToBottom(
        scrollElement!,
      );
    }

    handleScroll();
    scrollElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollElement.removeEventListener("scroll", handleScroll);
  }, []);

  useLayoutEffect(() => {
    const scrollElement = bodyRef.current;
    if (!scrollElement || !shouldAutoScrollRef.current) return;
    scrollElement.scrollTop = scrollElement.scrollHeight;
  }, [
    displayLogs,
    parsed.reportFile,
    parsed.sourcesCount,
    parsed.elapsedSeconds,
    isError,
    parsed.errorMessage,
  ]);

  return (
    <aside className="tb-subagent-detail-drawer tb-deep-research-detail-drawer">
      <div className="tb-subagent-detail-drawer-header">
        <div className="tb-subagent-detail-drawer-header-copy">
          <Telescope
            className="tb-attachment-preview-drawer-header-icon"
            strokeWidth={1.6}
          />
          <div className="tb-subagent-detail-drawer-header-text">
            <div
              className="tb-subagent-detail-drawer-title"
              title="Deep Research"
            >
              Deep Research
            </div>
          </div>
        </div>
        <div className="tb-subagent-detail-drawer-header-actions">
          <button
            type="button"
            className="tb-attachment-preview-drawer-action"
            onClick={onClose}
            aria-label="Close deep research details"
          >
            <X
              className="tb-attachment-preview-drawer-action-icon"
              strokeWidth={1.8}
            />
          </button>
        </div>
      </div>
      <div ref={bodyRef} className="tb-subagent-detail-drawer-body">
        <div className="tb-deep-research-log-shell">
          {taskCopy ? (
            <div className="tb-subagent-log-prompt tb-deep-research-log-task-surface">
              <RunnerMarkdown
                content={taskCopy}
                className="tb-message-markdown tb-message-markdown-user tb-subagent-log-prompt-markdown"
                softBreaks
                disallowHeadings
              />
            </div>
          ) : null}
          <div className="tb-subagent-log-meta">
            <span className="tb-turn-agent-name">Deep Research</span>
            <span
              className={`tb-log-card-pill ${isError ? "is-error" : ""}`.trim()}
            >
              {statusLabel}
            </span>
          </div>
          <div className="tb-deep-research-log-events tb-deep-research-log-events-drawer">
            {displayLogs.length > 0 ? (
              displayLogs.map((entry) => (
                <DeepResearchDisplayEventRow
                  key={entry.key}
                  entry={entry}
                  className={
                    animatedLogKeys.has(entry.key) ? "is-entering" : undefined
                  }
                  style={
                    animatedLogKeys.has(entry.key)
                      ? getRunnerChatEnterAnimationStyle()
                      : undefined
                  }
                />
              ))
            ) : (
              <div className="tb-log-card-empty">No research logs yet.</div>
            )}
          </div>
          {(
            parsed.reportFile
            || parsed.sourcesCount > 0
            || parsed.elapsedSeconds > 0
            || (isError && parsed.errorMessage)
          ) ? (
            <div
              className={`tb-deep-research-log-summary ${isError ? "is-error" : ""}`.trim()}
            >
              {parsed.reportFile ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Report</span>
                  {canOpenReportFile ? (
                    <button
                      type="button"
                      className="tb-deep-research-log-report-link"
                      onClick={() => onReportFileClick?.(parsed.reportFile || "")}
                      title={reportFilename || parsed.reportFile || ""}
                    >
                      {reportFilenameLabel || parsed.reportFile}
                    </button>
                  ) : (
                    <span
                      className="tb-log-meta-value"
                      title={reportFilename || parsed.reportFile || ""}
                    >
                      {reportFilenameLabel || parsed.reportFile}
                    </span>
                  )}
                </div>
              ) : null}
              {parsed.sourcesCount > 0 ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Sources</span>
                  <span className="tb-log-meta-value">
                    {parsed.sourcesCount}
                  </span>
                </div>
              ) : null}
              {parsed.elapsedSeconds > 0 ? (
                <div className="tb-log-meta-row">
                  <span className="tb-log-meta-label">Elapsed</span>
                  <span className="tb-log-meta-value">
                    {parsed.elapsedSeconds}s
                  </span>
                </div>
              ) : null}
              {isError && parsed.errorMessage ? (
                <div className="tb-log-card-state tb-log-card-state-error">
                  {parsed.errorMessage}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
