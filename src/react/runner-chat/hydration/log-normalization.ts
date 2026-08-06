import type { RunnerLog } from "../../../types.js";
import {
  isBrowserSkillLaunchCommand,
  shouldRenderRunnerReasoningLog,
} from "../../../platform-ui/components/thread-components/log-boxes/index.js";
import { stripRunnerSystemTags as stripSystemTags } from "../../runner-markdown.js";
import { isInternalFileChangeLog } from "./file-paths.js";

const imageGenerationIdentityCache = new WeakMap<RunnerLog, string | null>();
const videoGenerationIdentityCache = new WeakMap<RunnerLog, string | null>();
const generatedVideoPathCache = new WeakMap<RunnerLog, string>();
const MEDIA_LOG_TEXT_SCAN_LIMIT = 200_000;

export function stableRunnerLogValue(value: unknown): string {
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

function shouldScanMediaLogText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= MEDIA_LOG_TEXT_SCAN_LIMIT;
}

function isGenericShellCommand(command: string): boolean {
  const normalized = String(command || "").trim().replace(/^\$\s*/, "").toLowerCase();
  return (
    normalized === "bash" ||
    normalized === "sh" ||
    normalized === "zsh" ||
    normalized === "/bin/bash" ||
    normalized === "/bin/sh"
  );
}

function sanitizeGenerationPrompt(value: unknown): string {
  let normalized = String(value || "").trim();
  if (!normalized) {
    return "";
  }

  normalized = normalized.replace(/\\n/g, "\n");
  const markerMatch = normalized.match(
    /\r?\n\s*(?:quality|generated with|openai size request|image saved to|size):/i,
  );
  if (markerMatch) {
    normalized = normalized.slice(0, markerMatch.index).trim();
  }
  normalized = normalized.split(/\r?\n/)[0]?.trim() || "";
  return normalized.replace(/^["'`]+|["'`,\s]+$/g, "").trim();
}

function extractImagePromptFromCommand(command?: string): string {
  const normalized = String(command || "").trim();
  if (!normalized) {
    return "";
  }

  const directPromptMatch = normalized.match(/generate-image\.py\s+(?:"([^"]+)"|'([^']+)')/);
  const directPrompt = sanitizeGenerationPrompt(directPromptMatch?.[1] || directPromptMatch?.[2] || "");
  if (directPrompt) {
    return directPrompt;
  }

  const quotedValues = [
    ...normalized.matchAll(/"([^"]+)"/g),
    ...normalized.matchAll(/'([^']+)'/g),
  ]
    .map((match) => sanitizeGenerationPrompt(match[1]))
    .filter(
      (value) =>
        value.length >= 3 &&
        !value.match(/\.(png|jpg|jpeg|gif|webp|py|sh|txt|md)$/i) &&
        !value.startsWith("/") &&
        !value.startsWith(".") &&
        !value.startsWith("-") &&
        !value.match(/^\d+:\d+$/) &&
        !value.match(/^(1K|2K|4K)$/i),
    );
  return quotedValues.length > 0
    ? quotedValues.reduce((longest, current) => (current.length > longest.length ? current : longest))
    : "";
}

function extractImagePromptIdentity(log: RunnerLog): string {
  const commandPrompt = extractImagePromptFromCommand(
    typeof log.metadata?.command === "string" ? log.metadata.command : log.message,
  );
  if (commandPrompt) {
    return commandPrompt;
  }

  const args = log.metadata?.args && typeof log.metadata.args === "object"
    ? (log.metadata.args as Record<string, unknown>)
    : null;
  const toolInput = log.metadata?.toolInput && typeof log.metadata.toolInput === "object"
    ? (log.metadata.toolInput as Record<string, unknown>)
    : null;
  for (const candidate of [args?.prompt, args?.text, toolInput?.prompt, toolInput?.text]) {
    const prompt = sanitizeGenerationPrompt(candidate);
    if (prompt) {
      return prompt;
    }
  }

  const output = typeof log.metadata?.output === "string" ? log.metadata.output : log.message;
  const promptMatch = shouldScanMediaLogText(output)
    ? output.match(/(?:Generating|Editing) image with [^:]+:\s*(.+?)(?:\.\.\.)?(?:\r?\n|$)/i)
    : null;
  return sanitizeGenerationPrompt(promptMatch?.[1] || "");
}

function normalizedImageGenerationIdentity(log: RunnerLog): string | null {
  if (imageGenerationIdentityCache.has(log)) {
    return imageGenerationIdentityCache.get(log) ?? null;
  }

  const command = typeof log.metadata?.command === "string" ? log.metadata.command.trim() : "";
  const output = typeof log.metadata?.output === "string" ? log.metadata.output : "";
  const savedImagePath =
    typeof log.metadata?.savedImagePath === "string" ? log.metadata.savedImagePath.trim() : "";
  const filePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.filter(
        (value): value is string => typeof value === "string" && value.trim().length > 0,
      )
    : [];
  const looksLikeImageGeneration =
    Boolean(log.metadata?.isImageGeneration) ||
    command.includes("generate-image.py") ||
    command.includes(".claude/skills/image-generation/") ||
    Boolean(savedImagePath) ||
    filePaths.some((filePath) => /\.(?:png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(filePath)) ||
    (shouldScanMediaLogText(output) &&
      /(?:Generating|Editing) image with|Generated with|Image saved to:/i.test(output)) ||
    (shouldScanMediaLogText(log.message) &&
      /(?:Generating|Editing) image with|Generated with|Image saved to:/i.test(log.message));
  if (!looksLikeImageGeneration) {
    imageGenerationIdentityCache.set(log, null);
    return null;
  }

  const prompt = extractImagePromptIdentity(log);
  const args = log.metadata?.args && typeof log.metadata.args === "object"
    ? (log.metadata.args as Record<string, unknown>)
    : null;
  const inputPath = typeof args?.inputPath === "string" ? args.inputPath.trim() : "";
  const identity = stableRunnerLogValue({
    kind: "image_generation",
    prompt,
    inputPath,
    command:
      prompt || inputPath || savedImagePath || filePaths.length > 0
        ? ""
        : command || String(log.message || "").trim(),
  });
  imageGenerationIdentityCache.set(log, identity);
  return identity;
}

function extractVideoPromptIdentity(log: RunnerLog): string {
  const args = log.metadata?.args && typeof log.metadata.args === "object"
    ? (log.metadata.args as Record<string, unknown>)
    : null;
  const toolInput = log.metadata?.toolInput && typeof log.metadata.toolInput === "object"
    ? (log.metadata.toolInput as Record<string, unknown>)
    : null;
  for (const candidate of [args?.prompt, args?.text, toolInput?.prompt, toolInput?.text]) {
    const prompt = sanitizeGenerationPrompt(candidate);
    if (prompt) {
      return prompt;
    }
  }

  const output = typeof log.metadata?.output === "string" ? log.metadata.output : log.message;
  const promptMatch = shouldScanMediaLogText(output)
    ? output.match(/Generating video(?:\s+with [^:]+)?:\s*(.+?)(?:\.\.\.)?(?:\r?\n|$)/i) ||
      output.match(/^\s*Video Generation\s+(.+?)(?:\s+generating\.{3}|(?:\r?\n|$))/i)
    : null;
  const promptFromOutput = sanitizeGenerationPrompt(promptMatch?.[1] || "");
  if (promptFromOutput) {
    return promptFromOutput;
  }

  const command = typeof log.metadata?.command === "string" ? log.metadata.command : log.message || "";
  const quoted = [
    ...String(command || "").matchAll(/"([^"]+)"/g),
    ...String(command || "").matchAll(/'([^']+)'/g),
  ]
    .map((match) => sanitizeGenerationPrompt(match[1]))
    .filter(
      (value) =>
        value.length >= 3 &&
        !value.match(/\.(mp4|mov|webm|mkv|avi|png|jpg|jpeg|gif|webp|py|sh|txt|md)$/i) &&
        !value.startsWith("/") &&
        !value.startsWith(".") &&
        !value.startsWith("-") &&
        !value.match(/^\d+:\d+$/) &&
        !value.match(/^(720P|1080P)$/i),
    );
  return quoted.length > 0
    ? quoted.reduce((longest, current) => (current.length > longest.length ? current : longest))
    : "";
}

export function isRunnerHydratedVideoFilePath(filePath?: string | null): boolean {
  return /\.(?:mp4|mov|webm|mkv|avi)$/i.test(
    String(filePath || "").trim().split(/[?#]/)[0] || "",
  );
}

function normalizeGeneratedVideoPath(value: unknown): string {
  return String(value || "")
    .trim()
    .replace(/^\/workspace\//, "")
    .replace(/^workspace\//, "");
}

function extractVideoPathFromOutput(output: unknown): string {
  if (typeof output !== "string" || !output.trim()) {
    return "";
  }
  const patterns = [
    /video saved to:\s*["']?([^\s"'\n]+\.(?:mp4|mov|webm|mkv|avi))["']?/i,
    /saved to:\s*["']?([^\s"'\n]+\.(?:mp4|mov|webm|mkv|avi))["']?/i,
    /((?:\/workspace\/|workspace\/)?[A-Za-z0-9_./-]+\.(?:mp4|mov|webm|mkv|avi))/i,
  ];
  for (const pattern of patterns) {
    const match = output.match(pattern);
    const candidate = normalizeGeneratedVideoPath(match?.[1] || "");
    if (isRunnerHydratedVideoFilePath(candidate)) {
      return candidate;
    }
  }
  return "";
}

function extractVideoPathFromStructuredResult(result: unknown): string {
  const candidates: string[] = [];
  const visit = (value: unknown): void => {
    if (!value) {
      return;
    }
    if (typeof value === "string") {
      const direct = normalizeGeneratedVideoPath(value);
      if (isRunnerHydratedVideoFilePath(direct)) {
        candidates.push(direct);
      } else {
        const fromText = extractVideoPathFromOutput(value);
        if (fromText) {
          candidates.push(fromText);
        }
      }
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value === "object") {
      Object.values(value as Record<string, unknown>).forEach(visit);
    }
  };
  visit(result);
  return candidates[0] || "";
}

function extractDirectVideoPathFromMetadata(log: RunnerLog): string {
  const metadata =
    log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata)
      ? (log.metadata as Record<string, unknown>)
      : null;
  if (!metadata) {
    return "";
  }
  for (const candidate of [
    metadata.savedVideoPath,
    metadata.saved_video_path,
    metadata.outputVideoPath,
    metadata.output_video_path,
  ]) {
    const normalized = normalizeGeneratedVideoPath(candidate);
    if (isRunnerHydratedVideoFilePath(normalized)) {
      return normalized;
    }
  }
  return "";
}

function extractGeneratedVideoPath(log: RunnerLog): string {
  const cached = generatedVideoPathCache.get(log);
  if (typeof cached === "string") {
    return cached;
  }

  const directPath = extractDirectVideoPathFromMetadata(log);
  if (directPath) {
    generatedVideoPathCache.set(log, directPath);
    return directPath;
  }
  const filePath = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths
        .map((value) => normalizeGeneratedVideoPath(value))
        .find((value) => isRunnerHydratedVideoFilePath(value))
    : "";
  if (filePath) {
    generatedVideoPathCache.set(log, filePath);
    return filePath;
  }

  const output = shouldScanMediaLogText(log.metadata?.output) ? log.metadata?.output : undefined;
  const message = shouldScanMediaLogText(log.message) ? log.message : undefined;
  const resolvedPath =
    extractVideoPathFromStructuredResult(log.metadata?.result) ||
    extractVideoPathFromStructuredResult(output) ||
    extractVideoPathFromOutput(output) ||
    extractVideoPathFromOutput(message);
  generatedVideoPathCache.set(log, resolvedPath);
  return resolvedPath;
}

function normalizedVideoGenerationIdentity(log: RunnerLog): string | null {
  if (videoGenerationIdentityCache.has(log)) {
    return videoGenerationIdentityCache.get(log) ?? null;
  }

  const command = typeof log.metadata?.command === "string" ? log.metadata.command.trim() : "";
  const rawLog = log as RunnerLog & { event_type?: unknown; type?: unknown };
  const eventType = String(rawLog.eventType || rawLog.event_type || rawLog.type || "").trim().toLowerCase();
  const toolName = String(log.metadata?.toolName || log.metadata?.toolId || "").trim().toLowerCase();
  const serverName = String(log.metadata?.serverName || "").trim().toLowerCase();
  const filePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths.filter(
        (value): value is string =>
          typeof value === "string" && isRunnerHydratedVideoFilePath(value),
      )
    : [];
  const directPath = extractDirectVideoPathFromMetadata(log);
  const hasExplicitSignal = Boolean(
    log.metadata?.isVideoGeneration ||
      eventType === "video_generation_skill" ||
      eventType === "video_generation" ||
      eventType === "generate_video" ||
      toolName === "generate_video" ||
      toolName === "video_generation" ||
      serverName === "video-generation-skill" ||
      serverName === "video_generation_skill" ||
      directPath ||
      command.includes("generate-video.py") ||
      command.includes(".claude/skills/video-generation/"),
  );
  if (!hasExplicitSignal) {
    videoGenerationIdentityCache.set(log, null);
    return null;
  }

  const savedVideoPath = extractGeneratedVideoPath(log);
  const prompt = extractVideoPromptIdentity(log);
  const args = log.metadata?.args && typeof log.metadata.args === "object"
    ? (log.metadata.args as Record<string, unknown>)
    : null;
  const inputPath = typeof args?.inputPath === "string" ? args.inputPath.trim() : "";
  const identity = stableRunnerLogValue({
    kind: "video_generation",
    prompt,
    inputPath,
    savedVideoPath: prompt || inputPath ? "" : savedVideoPath || filePaths[0] || "",
    command:
      prompt || inputPath || savedVideoPath || filePaths.length > 0
        ? ""
        : command || String(log.message || "").trim(),
  });
  videoGenerationIdentityCache.set(log, identity);
  return identity;
}

export function normalizeHydratedLog(log: RunnerLog): RunnerLog {
  const rawLog = log as RunnerLog & Record<string, unknown>;
  const rawMetadata =
    log.metadata && typeof log.metadata === "object" && !Array.isArray(log.metadata)
      ? log.metadata
      : rawLog.metadata && typeof rawLog.metadata === "object" && !Array.isArray(rawLog.metadata)
        ? (rawLog.metadata as RunnerLog["metadata"])
        : undefined;
  const metadata =
    rawMetadata &&
    typeof (rawMetadata as { duration_ms?: unknown }).duration_ms === "number" &&
    typeof rawMetadata.durationMs !== "number"
      ? {
          ...rawMetadata,
          durationMs: (rawMetadata as { duration_ms: number }).duration_ms,
        }
      : rawMetadata;
  const eventType =
    typeof log.eventType === "string"
      ? log.eventType
      : typeof rawLog.event_type === "string"
        ? (rawLog.event_type as RunnerLog["eventType"])
        : undefined;
  const createdAt =
    typeof log.createdAt === "string" && log.createdAt.trim()
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
  if (
    typeof rawLog.is_reasoning === "boolean" &&
    typeof normalizedLog.isReasoning !== "boolean"
  ) {
    normalizedLog.isReasoning = rawLog.is_reasoning;
  }
  if (
    typeof rawLog.is_planning === "boolean" &&
    typeof normalizedLog.isPlanning !== "boolean"
  ) {
    normalizedLog.isPlanning = rawLog.is_planning;
  }
  if (
    typeof rawLog.is_llm_response === "boolean" &&
    typeof normalizedLog.isLLMResponse !== "boolean"
  ) {
    normalizedLog.isLLMResponse = rawLog.is_llm_response;
  }
  return normalizedLog;
}

function normalizedToolIdentity(log: RunnerLog): string | null {
  const imageIdentity = normalizedImageGenerationIdentity(log);
  if (imageIdentity) {
    return imageIdentity;
  }
  const videoIdentity = normalizedVideoGenerationIdentity(log);
  if (videoIdentity) {
    return videoIdentity;
  }

  if (log.eventType === "command_execution") {
    const command = typeof log.metadata?.command === "string" ? log.metadata.command.trim() : "";
    const normalizedCommand = command || log.message.replace(/^Executed:\s*/i, "").trim();
    if (!normalizedCommand) {
      return null;
    }
    if (isGenericShellCommand(normalizedCommand)) {
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
    const filePath =
      Array.isArray(log.metadata?.filePaths) && typeof log.metadata.filePaths[0] === "string"
        ? log.metadata.filePaths[0].trim()
        : "";
    const changeKind =
      Array.isArray(log.metadata?.changeKinds) && typeof log.metadata.changeKinds[0] === "string"
        ? log.metadata.changeKinds[0].trim().toLowerCase()
        : "";
    const normalizedPath =
      filePath ||
      log.message
        .replace(/^(created|modified|update|updated|deleted):\s*/i, "")
        .replace(/\s+\((update|created|modified|deleted)\)$/i, "")
        .trim();
    const normalizedKind =
      changeKind ||
      (/^\s*(created|modified|update|updated|deleted):/i.exec(log.message)?.[1]?.toLowerCase() ??
        /\((update|created|modified|deleted)\)\s*$/i.exec(log.message)?.[1]?.toLowerCase() ??
        "");
    if (!normalizedPath) {
      return null;
    }
    const canonicalKind = normalizedKind === "updated" ? "update" : normalizedKind;
    return `file:${canonicalKind}:${normalizedPath}`;
  }

  return null;
}

function normalizeIdentityPart(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function getRunnerLogSubagentInvocationIdentity(log: RunnerLog): string {
  const metadata = log.metadata;
  const invocation = metadata?.subagentInvocation;
  const invocationId =
    normalizeIdentityPart(invocation?.invocationId) ||
    normalizeIdentityPart(invocation?.parentToolUseId);
  if (invocationId) {
    return invocationId;
  }

  const source = normalizeIdentityPart(metadata?.source).toLowerCase();
  const parentToolUseId = normalizeIdentityPart(metadata?.parentToolUseId);
  if (
    parentToolUseId &&
    (source === "claw_subagent_artifact" || source === "subagent_run_summary")
  ) {
    return parentToolUseId;
  }

  const actor = metadata?.actor;
  if (actor?.kind === "subagent") {
    const actorInvocationId =
      normalizeIdentityPart(actor.invocationId) ||
      normalizeIdentityPart(actor.parentToolUseId);
    if (actorInvocationId) {
      return actorInvocationId;
    }

    const actorIdentity = [
      normalizeIdentityPart(actor.teamAgentId),
      normalizeIdentityPart(actor.agentId),
      normalizeIdentityPart(actor.subagentType),
      normalizeIdentityPart(actor.agentName),
    ]
      .filter(Boolean)
      .join(":");
    if (actorIdentity) {
      return `subagent:${actorIdentity}`;
    }
  }

  const delegatedTo = metadata?.delegatedTo;
  if (delegatedTo?.kind === "subagent") {
    const delegatedInvocationId =
      normalizeIdentityPart(delegatedTo.invocationId) ||
      normalizeIdentityPart(delegatedTo.parentToolUseId);
    if (delegatedInvocationId) {
      return delegatedInvocationId;
    }
  }

  return "";
}

export function runnerLogSignature(log: RunnerLog): string {
  const eventType =
    log.eventType === "setup" || log.eventType === "startup"
      ? "session_start"
      : log.eventType === "reasoning" ||
          log.eventType === "planning" ||
          log.isReasoning ||
          log.isPlanning
        ? "thinking"
        : log.eventType || "";
  const message = eventType === "session_start" ? "Starting session" : log.message || "";
  const toolIdentity = normalizedToolIdentity(log);
  const thinkingActorIdentity =
    eventType === "thinking" ? getRunnerLogSubagentInvocationIdentity(log) : "";
  const metadata =
    eventType === "thinking"
      ? thinkingActorIdentity
        ? { subagentInvocationId: thinkingActorIdentity }
        : {}
      : eventType === "session_start" || toolIdentity
        ? {}
        : log.metadata || {};
  return [
    toolIdentity ? "" : log.type || "",
    eventType,
    toolIdentity || stripSystemTags(message).replace(/\s+/g, " ").trim(),
    stableRunnerLogValue(metadata),
  ].join("|");
}

function metadataWeight(log: RunnerLog): number {
  if (!log.metadata || typeof log.metadata !== "object" || Array.isArray(log.metadata)) {
    return 0;
  }
  return Object.keys(log.metadata).length;
}

function replacementScore(log: RunnerLog): number {
  let score = metadataWeight(log);
  const imageIdentity = normalizedImageGenerationIdentity(log);
  if (imageIdentity) {
    const savedImagePath =
      typeof log.metadata?.savedImagePath === "string" ? log.metadata.savedImagePath.trim() : "";
    const filePaths = Array.isArray(log.metadata?.filePaths)
      ? log.metadata.filePaths.filter(
          (value): value is string => typeof value === "string" && value.trim().length > 0,
        )
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
  const videoIdentity = normalizedVideoGenerationIdentity(log);
  if (videoIdentity) {
    if (extractGeneratedVideoPath(log)) {
      score += 100;
    }
    if (log.metadata?.status === "completed") {
      score += 10;
    }
    if (typeof log.metadata?.output === "string" && /Video saved to:/i.test(log.metadata.output)) {
      score += 20;
    }
    if (log.metadata?.error) {
      score += 30;
    }
  }
  return score;
}

function pruneSupersededMediaGenerationLogs(logs: RunnerLog[]): RunnerLog[] {
  const bestScoreByIdentity = new Map<string, number>();
  const keptFromEnd: RunnerLog[] = [];

  for (let index = logs.length - 1; index >= 0; index -= 1) {
    const log = logs[index];
    const identity =
      normalizedImageGenerationIdentity(log) || normalizedVideoGenerationIdentity(log);
    if (!identity) {
      keptFromEnd.push(log);
      continue;
    }

    const score = replacementScore(log);
    const bestSeenScore = bestScoreByIdentity.get(identity);
    if (typeof bestSeenScore === "number" && bestSeenScore > score) {
      continue;
    }
    bestScoreByIdentity.set(identity, score);
    keptFromEnd.push(log);
  }

  const kept = keptFromEnd.reverse();
  const laterCompletedVideoCounts = new Array<number>(kept.length).fill(0);
  let completedVideoLogsToRight = 0;
  for (let index = kept.length - 1; index >= 0; index -= 1) {
    laterCompletedVideoCounts[index] = completedVideoLogsToRight;
    const log = kept[index];
    if (normalizedVideoGenerationIdentity(log) && extractGeneratedVideoPath(log)) {
      completedVideoLogsToRight += 1;
    }
  }
  const videoPathsCoveredByCommandLogs = new Set<string>();
  for (const log of kept) {
    if (log.eventType === "file_change" || !normalizedVideoGenerationIdentity(log)) {
      continue;
    }
    const path = extractGeneratedVideoPath(log);
    if (path) {
      videoPathsCoveredByCommandLogs.add(path);
    }
  }

  return kept.filter((log, index) => {
    const videoIdentity = normalizedVideoGenerationIdentity(log);
    if (
      videoIdentity &&
      log.eventType !== "file_change" &&
      !extractGeneratedVideoPath(log) &&
      laterCompletedVideoCounts[index] > 0
    ) {
      return false;
    }
    if (log.eventType !== "file_change" || !videoIdentity) {
      return true;
    }
    if (videoPathsCoveredByCommandLogs.size === 0) {
      return true;
    }
    const path = extractGeneratedVideoPath(log);
    return !path || !videoPathsCoveredByCommandLogs.has(path);
  });
}

const RUNNER_STREAM_FRAGMENT_SOURCES = new Set([
  "assistant_text",
  "provider_reasoning",
]);

const RUNNER_STREAM_FRAGMENT_EVENTS = new Set([
  "assistant_delta",
  "content_block_delta",
  "content_delta",
  "message_delta",
  "stream_chunk",
  "text_delta",
  "token",
  "token_delta",
]);

function normalizeRunnerStreamIdentityPart(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function readRunnerStreamMetadataValue(
  log: RunnerLog,
  keys: readonly string[],
): string {
  const metadata = log.metadata as Record<string, unknown> | null | undefined;
  const runtime = metadata?.runtime && typeof metadata.runtime === "object"
    ? (metadata.runtime as Record<string, unknown>)
    : null;
  for (const source of [metadata, runtime]) {
    if (!source) continue;
    for (const key of keys) {
      const value = source[key];
      if (typeof value === "string" && value.trim()) {
        return value.trim();
      }
    }
  }
  return "";
}

export function isRunnerStreamingFragmentLog(log: RunnerLog): boolean {
  const source = normalizeRunnerStreamIdentityPart(log.metadata?.source);
  if (RUNNER_STREAM_FRAGMENT_SOURCES.has(source)) {
    return true;
  }

  const runtimeEvent = normalizeRunnerStreamIdentityPart(
    readRunnerStreamMetadataValue(log, [
      "runtimeEventType",
      "runtime_event_type",
      "eventType",
      "event_type",
      "type",
    ]),
  ).replace(/[.\s-]+/g, "_");
  return RUNNER_STREAM_FRAGMENT_EVENTS.has(runtimeEvent);
}

function getRunnerStreamingFragmentIdentity(log: RunnerLog): string {
  if (!isRunnerStreamingFragmentLog(log)) {
    return "";
  }
  const source = normalizeRunnerStreamIdentityPart(log.metadata?.source) || "stream";
  const runId = readRunnerStreamMetadataValue(log, ["runId", "run_id"]);
  const runtime = readRunnerStreamMetadataValue(log, ["runtime", "adapter", "provider"]);
  const actor = getRunnerLogSubagentInvocationIdentity(log) || readRunnerStreamMetadataValue(
    log,
    ["actorParticipantId", "actor_participant_id", "agentId", "agent_id"],
  );
  return [source, runId, runtime, actor].map((value) => String(value || "").trim()).join("|");
}

function appendRunnerStreamingFragment(previous: string, next: string): string {
  if (!previous) return next;
  if (!next) return previous;
  if (next.startsWith(previous)) return next;
  if (previous.startsWith(next)) return previous;
  if (/\s$/.test(previous) || /^\s/.test(next)) return previous + next;
  if (/^[,.;:!?%)}\]>]/.test(next)) return previous + next;
  if (/[({[<]$/.test(previous)) return previous + next;
  if (/^['’]/.test(next) || /['’]$/.test(previous)) return previous + next;
  return `${previous} ${next}`;
}

export function coalesceRunnerStreamingLogs(logs: RunnerLog[]): RunnerLog[] {
  const coalesced: RunnerLog[] = [];
  let activeIdentity = "";
  let activeIndex = -1;
  let activeFragmentCount = 0;

  for (const log of logs) {
    const identity = getRunnerStreamingFragmentIdentity(log);
    if (!identity || identity !== activeIdentity || activeIndex < 0) {
      coalesced.push(log);
      activeIdentity = identity;
      activeIndex = identity ? coalesced.length - 1 : -1;
      activeFragmentCount = identity ? 1 : 0;
      continue;
    }

    const previous = coalesced[activeIndex];
    activeFragmentCount += 1;
    const previousMetadata = (previous.metadata || {}) as Record<string, unknown>;
    const nextMetadata = (log.metadata || {}) as Record<string, unknown>;
    const firstRuntimeSequence =
      previousMetadata.firstRuntimeSequence ||
      previousMetadata.runtimeSequence ||
      previousMetadata.runtime_sequence ||
      nextMetadata.runtimeSequence ||
      nextMetadata.runtime_sequence;
    const lastRuntimeSequence =
      nextMetadata.runtimeSequence ||
      nextMetadata.runtime_sequence ||
      previousMetadata.lastRuntimeSequence ||
      previousMetadata.runtimeSequence ||
      previousMetadata.runtime_sequence;
    coalesced[activeIndex] = {
      ...previous,
      ...log,
      createdAt: previous.createdAt || log.createdAt,
      time: previous.time || log.time,
      message: appendRunnerStreamingFragment(previous.message || "", log.message || ""),
      metadata: {
        ...previousMetadata,
        ...nextMetadata,
        streamCoalesced: true,
        fragmentCount: activeFragmentCount,
        ...(firstRuntimeSequence !== undefined ? { firstRuntimeSequence } : {}),
        ...(lastRuntimeSequence !== undefined ? { lastRuntimeSequence } : {}),
      } as RunnerLog["metadata"],
    };
  }

  return coalesced;
}

export function dedupeAdjacentRunnerLogs(logs: RunnerLog[]): RunnerLog[] {
  const prunedLogs = pruneSupersededMediaGenerationLogs(
    coalesceRunnerStreamingLogs(logs),
  );
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
      if (previousLog && replacementScore(log) >= replacementScore(previousLog)) {
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
  if (
    log.eventType !== "reasoning" &&
    log.eventType !== "planning" &&
    !log.isReasoning &&
    !log.isPlanning
  ) {
    return false;
  }

  const metadata = log.metadata as Record<string, unknown> | null | undefined;
  const source = typeof metadata?.source === "string" ? metadata.source.trim().toLowerCase() : "";
  return (
    metadata?.synthetic === true ||
    (typeof metadata?.synthetic === "string" &&
      metadata.synthetic.trim().toLowerCase() === "true") ||
    source === "synthetic_progress"
  );
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
    return (
      normalized === "sendusermessage" ||
      normalized === "send_user_message" ||
      normalized === "send-user-message"
    );
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

function isReasoningLikeTimelineLog(log: RunnerLog): boolean {
  return (
    log.eventType === "reasoning" ||
    log.eventType === "planning" ||
    Boolean(log.isReasoning || log.isPlanning)
  );
}

export function shouldDisplayTimelineLog(log: RunnerLog): boolean {
  const normalizedMessage = stripSystemTags(log.message || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  if (log.eventType === "turn_completed") return false;
  if (log.eventType === "action_summary") return false;
  if (log.eventType === "agent_message" || log.eventType === "llm_response") return false;
  if (log.eventType === "setup" || log.eventType === "startup") return false;
  if (isInternalFileChangeLog(log)) return false;
  if (isSyntheticProgressReasoningLog(log)) return false;
  if (isReasoningLikeTimelineLog(log) && !shouldRenderRunnerReasoningLog(log)) return false;
  if (isInternalUserMessageToolLog(log)) return false;
  if (isTrivialSkillLaunchLog(log)) return false;
  if (
    log.eventType === "command_execution" &&
    isBrowserSkillLaunchCommand(log.metadata?.command || log.message || "")
  ) {
    return false;
  }
  if (normalizedMessage === "starting session" || normalizedMessage === "starting session...") {
    return false;
  }
  if (normalizedMessage === "thinking" || normalizedMessage === "thinking...") {
    return false;
  }
  return true;
}

export function normalizeDuplicateSummaryText(value: string): string {
  return stripSystemTags(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isDuplicateAssistantSummaryTimelineLog(
  log: RunnerLog,
  agentMessage?: RunnerLog,
): boolean {
  if (!agentMessage?.message || !isReasoningLikeTimelineLog(log)) {
    return false;
  }

  const logText = normalizeDuplicateSummaryText(log.message || "")
    .replace(/^run summary:?\s*/i, "")
    .trim();
  const assistantText = normalizeDuplicateSummaryText(agentMessage.message || "");
  return Boolean(logText && assistantText && logText === assistantText);
}
