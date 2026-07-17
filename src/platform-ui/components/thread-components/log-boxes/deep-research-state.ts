import type { RunnerDeepResearchSession, RunnerLog } from "../../../../types.js";

export type RunnerDeepResearchStatus =
  | "starting"
  | "thinking"
  | "researching"
  | "complete"
  | "error";

export interface RunnerDeepResearchState {
  status: RunnerDeepResearchStatus;
  topic: string | null;
  interactionId: string | null;
  thinkingSummaries: string[];
  reportFile: string | null;
  reportManifestFile: string | null;
  sourcesCount: number;
  sources: string[];
  elapsedSeconds: number;
  errorMessage: string | null;
  runtimePath?: string | null;
}

export interface RunnerDeepResearchDerivedState {
  streamingLogs: RunnerLog[];
  hasStreamingLogs: boolean;
  effectiveCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
  parsed: RunnerDeepResearchState;
  topic: string | null;
  isError: boolean;
  isComplete: boolean;
  isLoading: boolean;
  statusLabel: string;
}

function createInitialDeepResearchState(): RunnerDeepResearchState {
  return {
    status: "starting",
    topic: null,
    interactionId: null,
    thinkingSummaries: [],
    reportFile: null,
    reportManifestFile: null,
    sourcesCount: 0,
    sources: [],
    elapsedSeconds: 0,
    errorMessage: null,
    runtimePath: null,
  };
}

export function isDeepResearchCommand(command?: string): boolean {
  if (!command) return false;
  return command.includes("/workspace/.scripts/deep-research.py")
    || command.includes("deep-research.py")
    || command.includes(".claude/skills/deep-research/");
}

export function extractResearchTopic(command?: string): string | null {
  if (!command) return null;
  const quoted = command.match(/deep-research\.py\s+["']([^"']+)["']/);
  if (quoted?.[1]) return quoted[1];
  const unquoted = command.match(/deep-research\.py\s+(\S+)/);
  return unquoted?.[1] && !unquoted[1].startsWith("-")
    ? unquoted[1]
    : null;
}

export function parseDeepResearchOutput(
  output?: string,
): RunnerDeepResearchState {
  const result = createInitialDeepResearchState();
  if (!output) return result;
  const segments: string[] = [];
  const pushSegment = (value: unknown) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed) segments.push(trimmed);
  };

  pushSegment(output);
  try {
    const parsed = JSON.parse(output) as Record<string, unknown>;
    pushSegment(parsed?.stdout);
    pushSegment(parsed?.stderr);
    pushSegment(parsed?.output);
  } catch {}

  for (const line of segments.flatMap((segment) => segment.split("\n"))) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("{")) continue;
    try {
      const event = JSON.parse(trimmed) as Record<string, unknown>;
      if (event.event === "start" && typeof event.topic === "string") {
        result.topic = event.topic;
      }
      if (
        event.event === "interaction_started"
        && typeof event.interaction_id === "string"
      ) {
        result.interactionId = event.interaction_id;
        result.status = "thinking";
      }
      if (event.event === "thinking" && typeof event.summary === "string") {
        result.thinkingSummaries.push(event.summary);
        result.status = "thinking";
      }
      if (event.event === "content") result.status = "researching";
      const isCompletion = event.event === "research_complete"
        || event.event === "complete";
      if (isCompletion && typeof event.report_file === "string") {
        result.reportFile = event.report_file;
        result.status = "complete";
      }
      if (
        isCompletion
        && typeof event.report_manifest_file === "string"
      ) {
        result.reportManifestFile = event.report_manifest_file;
      }
      if (isCompletion && typeof event.sources_count === "number") {
        result.sourcesCount = event.sources_count;
      }
      if (isCompletion && Array.isArray(event.sources)) {
        result.sources = event.sources.filter(
          (source): source is string => typeof source === "string",
        );
      }
      if (typeof event.elapsed_seconds === "number") {
        result.elapsedSeconds = event.elapsed_seconds;
      }
      if (event.event === "resolved_runtime" && typeof event.path === "string") {
        result.runtimePath = event.path;
      }
      if (event.event === "error" && typeof event.message === "string") {
        result.status = "error";
        result.errorMessage = event.message;
      }
    } catch {}
  }
  return result;
}

export function hasDeepResearchOutput(output?: string): boolean {
  const parsed = parseDeepResearchOutput(output);
  return Boolean(
    parsed.topic
      || parsed.interactionId
      || parsed.reportFile
      || parsed.reportManifestFile
      || parsed.runtimePath
      || parsed.errorMessage
      || parsed.thinkingSummaries.length > 0
      || parsed.sourcesCount > 0,
  );
}

function buildDeepResearchFromStreamingLogs(
  logs: RunnerLog[],
): RunnerDeepResearchState {
  const result = createInitialDeepResearchState();
  const seenSummaries = new Set<string>();

  for (const log of logs) {
    const deepResearch = log.metadata?.deepResearch;
    if (!deepResearch) continue;

    switch (deepResearch.event) {
      case "start":
        result.topic = deepResearch.topic || result.topic;
        result.status = "starting";
        break;
      case "interaction_started":
        result.interactionId = deepResearch.interactionId
          || result.interactionId;
        result.status = "thinking";
        break;
      case "thinking": {
        const summary = String(deepResearch.thinkingSummary || "").trim();
        if (summary) {
          const signature = summary.slice(0, 100);
          if (!seenSummaries.has(signature)) {
            seenSummaries.add(signature);
            result.thinkingSummaries.push(summary);
          }
        }
        result.status = "thinking";
        break;
      }
      case "status":
        if (
          typeof deepResearch.elapsedSeconds === "number"
          && deepResearch.elapsedSeconds > 0
        ) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "research_complete":
      case "complete":
        result.status = "complete";
        result.reportFile = deepResearch.reportFile || result.reportFile;
        result.reportManifestFile = deepResearch.reportManifestFile
          || result.reportManifestFile;
        if (typeof deepResearch.sourcesCount === "number") {
          result.sourcesCount = deepResearch.sourcesCount;
        }
        if (Array.isArray(deepResearch.sources)) {
          result.sources = deepResearch.sources.filter(
            (source): source is string => typeof source === "string",
          );
        }
        if (
          typeof deepResearch.elapsedSeconds === "number"
          && deepResearch.elapsedSeconds > 0
        ) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "error":
      case "timeout":
      case "connection_timeout":
      case "resume_timeout":
      case "resume_error":
        result.status = "error";
        result.errorMessage = deepResearch.errorMessage
          || deepResearch.thinkingSummary
          || "Unknown error occurred";
        if (
          typeof deepResearch.elapsedSeconds === "number"
          && deepResearch.elapsedSeconds > 0
        ) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "resuming_stream":
        result.status = "thinking";
        if (
          typeof deepResearch.elapsedSeconds === "number"
          && deepResearch.elapsedSeconds > 0
        ) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      case "stream_ended":
        if (
          typeof deepResearch.reportLength === "number"
          && deepResearch.reportLength > 0
        ) {
          result.status = "complete";
        }
        if (
          typeof deepResearch.elapsedSeconds === "number"
          && deepResearch.elapsedSeconds > 0
        ) {
          result.elapsedSeconds = deepResearch.elapsedSeconds;
        }
        break;
      default:
        break;
    }
  }

  return result;
}

function buildDeepResearchFromSession(
  session?: RunnerDeepResearchSession | null,
): RunnerDeepResearchState {
  const metadata = session?.metadata && typeof session.metadata === "object"
    ? session.metadata
    : null;
  const rawSources = metadata
    && Array.isArray((metadata as { sources?: unknown }).sources)
    ? (metadata as { sources?: unknown[] }).sources
    : null;
  const reportManifestPath = metadata
    && typeof (metadata as { reportManifestPath?: unknown }).reportManifestPath
      === "string"
    ? String(
        (metadata as { reportManifestPath?: unknown }).reportManifestPath || "",
      ).trim() || null
    : null;
  return {
    status: session?.status === "completed"
      ? "complete"
      : session?.status === "failed"
          || session?.status === "timeout"
          || session?.status === "cancelled"
        ? "error"
        : session?.thinkingSummaries?.length
          ? "thinking"
          : session
            ? "researching"
            : "starting",
    topic: session?.topic || null,
    interactionId: session?.interactionId || null,
    thinkingSummaries: Array.isArray(session?.thinkingSummaries)
      ? session.thinkingSummaries
          .map((entry) => String(entry?.summary || "").trim())
          .filter(Boolean)
      : [],
    reportFile: session?.reportPath || null,
    reportManifestFile: reportManifestPath,
    sourcesCount: typeof session?.sourcesCount === "number"
      ? session.sourcesCount
      : 0,
    sources: Array.isArray(rawSources)
      ? rawSources.filter(
          (value): value is string => (
            typeof value === "string" && value.trim().length > 0
          ),
        )
      : [],
    elapsedSeconds: typeof session?.elapsedSeconds === "number"
      ? session.elapsedSeconds
      : 0,
    errorMessage: session?.errorMessage || null,
    runtimePath: null,
  };
}

function mergeDeepResearchState(
  base: RunnerDeepResearchState,
  override: RunnerDeepResearchState,
): RunnerDeepResearchState {
  return {
    status: override.status || base.status,
    topic: override.topic || base.topic,
    interactionId: override.interactionId || base.interactionId,
    thinkingSummaries: override.thinkingSummaries.length > 0
      ? override.thinkingSummaries
      : base.thinkingSummaries,
    reportFile: override.reportFile || base.reportFile,
    reportManifestFile: override.reportManifestFile || base.reportManifestFile,
    sourcesCount: override.sourcesCount > 0
      ? override.sourcesCount
      : base.sourcesCount,
    sources: override.sources.length > 0 ? override.sources : base.sources,
    elapsedSeconds: override.elapsedSeconds > 0
      ? override.elapsedSeconds
      : base.elapsedSeconds,
    errorMessage: override.errorMessage || base.errorMessage,
    runtimePath: override.runtimePath || base.runtimePath,
  };
}

function isDeepResearchCommandStatusActive(status: unknown): boolean {
  const normalizedStatus = typeof status === "string"
    ? status.trim().toLowerCase()
    : "";
  return normalizedStatus === "running"
    || normalizedStatus === "started"
    || normalizedStatus === "output";
}

export function getDeepResearchLogState({
  log,
  logs,
  runningCommandLog,
  session,
}: {
  log?: RunnerLog;
  logs?: RunnerLog[];
  runningCommandLog?: RunnerLog;
  session?: RunnerDeepResearchSession | null;
}): RunnerDeepResearchDerivedState {
  const streamingLogs = Array.isArray(logs) ? logs : [];
  const hasStreamingLogs = streamingLogs.length > 0;
  const effectiveCommandLog = runningCommandLog || log;
  const command = effectiveCommandLog?.metadata?.command || "";
  const commandStatus = effectiveCommandLog?.metadata?.status;
  const commandExitCode = effectiveCommandLog?.metadata?.exitCode;
  const commandOutput = typeof effectiveCommandLog?.metadata?.output === "string"
    ? effectiveCommandLog.metadata.output
    : "";

  const sessionParsed = buildDeepResearchFromSession(session);
  const streamingParsed = hasStreamingLogs
    ? buildDeepResearchFromStreamingLogs(streamingLogs)
    : parseDeepResearchOutput(commandOutput);
  const parsed = mergeDeepResearchState(sessionParsed, streamingParsed);

  const topicFromStreamingLogs = streamingLogs.find(
    (entry) => entry.metadata?.deepResearch?.topic,
  )?.metadata?.deepResearch?.topic || null;
  const topic = topicFromStreamingLogs
    || parsed.topic
    || extractResearchTopic(command);

  const hasStreamingError = hasStreamingLogs && streamingLogs.some(
    (entry) => (
      entry.metadata?.deepResearch?.event === "error"
      || entry.metadata?.deepResearch?.event === "timeout"
      || entry.metadata?.deepResearch?.event === "connection_timeout"
    ),
  );
  const hasCommandError = typeof commandExitCode === "number"
    && commandExitCode !== 0;
  const isError = hasStreamingError
    || hasCommandError
    || parsed.status === "error";
  const isStreamingComplete = hasStreamingLogs
    && (
      streamingLogs.some(
        (entry) => (
          entry.metadata?.deepResearch?.event === "research_complete"
          || entry.metadata?.deepResearch?.event === "complete"
        ),
      )
      || streamingLogs.some(
        (entry) => Boolean(entry.metadata?.deepResearch?.reportFile),
      )
      || Boolean(parsed.reportFile)
    );
  const isSessionComplete = session?.status === "completed";
  const isParsedComplete = parsed.status === "complete"
    || Boolean(parsed.reportFile);
  const isComplete = !isError
    && (isStreamingComplete || isSessionComplete || isParsedComplete);
  const isCommandRunning = isDeepResearchCommandStatusActive(commandStatus);
  const isSessionRunning = Boolean(
    session
      && session.status !== "completed"
      && session.status !== "failed"
      && session.status !== "timeout"
      && session.status !== "cancelled",
  );
  const isLoading = !isError
    && !isComplete
    && (hasStreamingLogs || isCommandRunning || isSessionRunning);
  const statusLabel = isError
    ? "error"
    : isComplete
      ? "complete"
      : parsed.status === "researching"
        ? "researching"
        : isLoading
          ? "starting"
          : parsed.status;

  return {
    streamingLogs,
    hasStreamingLogs,
    effectiveCommandLog,
    session,
    parsed,
    topic,
    isError,
    isComplete,
    isLoading,
    statusLabel,
  };
}

export function hasActiveDeepResearchLogGroup(logs: RunnerLog[]): boolean {
  if (!Array.isArray(logs) || logs.length === 0) {
    return false;
  }
  const streamingLogs = logs.filter(
    (entry) => entry.eventType === "deep_research",
  );
  const commandLog = logs.find(
    (entry) => (
      entry.eventType === "command_execution"
      && isDeepResearchCommand(entry.metadata?.command || entry.message || "")
    ),
  );
  if (!commandLog && streamingLogs.length === 0) {
    return false;
  }
  return getDeepResearchLogState({
    logs: streamingLogs,
    runningCommandLog: commandLog,
  }).isLoading;
}
