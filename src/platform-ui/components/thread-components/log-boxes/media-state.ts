import type { RunnerLog } from "../../../../types.js";
import { stripRunnerSystemTags } from "../shared/runner-markdown.js";
import {
  isRunnerLogImageFilePath,
  isRunnerLogVideoFilePath,
  normalizeRunnerFilePath,
} from "./command-parsing.js";
import {
  parseStructuredCommandExecutionOutput,
} from "./structured-command-output.js";

export function extractBase64Image(content: unknown): string | null {
  if (!content) return null;
  if (typeof content === "object") {
    const output = content as {
      content?: Array<{
        type: string;
        text?: string;
        data?: string;
        mimeType?: string;
      }>;
      structured_content?: {
        image_data?: string;
        file_paths?: string[];
      };
    };
    if (Array.isArray(output.content)) {
      for (const item of output.content) {
        if (item.type === "image" && item.data) {
          return `data:${item.mimeType || "image/png"};base64,${item.data}`;
        }
        if (item.type === "text" && item.text) {
          const extracted = extractBase64Image(item.text);
          if (extracted) return extracted;
        }
      }
    }
    if (output.structured_content?.image_data) {
      return `data:image/png;base64,${output.structured_content.image_data}`;
    }
    try {
      return extractBase64Image(JSON.stringify(content));
    } catch {
      return null;
    }
  }
  if (typeof content === "string") {
    const dataUri = content.match(
      /data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+/,
    );
    if (dataUri?.[0]) return dataUri[0];
    const rawBase64 = content.match(
      /(iVBORw0KGgo[A-Za-z0-9+/=]+|\/9j\/[A-Za-z0-9+/=]+)/,
    );
    if (rawBase64?.[1]) {
      const prefix = rawBase64[1].startsWith("iVBOR")
        ? "data:image/png;base64,"
        : "data:image/jpeg;base64,";
      return `${prefix}${rawBase64[1]}`;
    }
  }
  return null;
}

function extractWorkspaceMediaPathFromResult(
  result: unknown,
  matcher: (path: string) => boolean,
  extensionPattern: string,
): string | null {
  const candidates: string[] = [];
  const pathPattern = new RegExp(
    `(?:/workspace/)?([A-Za-z0-9_./-]+\\.(?:${extensionPattern}))`,
    "i",
  );
  const visit = (value: unknown): void => {
    if (!value) return;
    if (typeof value === "string") {
      const matchedPath = value.match(pathPattern)?.[1];
      if (matchedPath) candidates.push(matchedPath);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const structured = record.structuredContent
      && typeof record.structuredContent === "object"
      ? record.structuredContent as Record<string, unknown>
      : record.structured_content
          && typeof record.structured_content === "object"
        ? record.structured_content as Record<string, unknown>
        : null;
    if (structured) {
      visit(structured.workspace_file_paths);
      visit(structured.file_paths);
      visit(structured.original_file_paths);
    }
    Object.values(record).forEach(visit);
  };

  visit(result);
  return candidates
    .map((value) => value.trim().replace(/^\/workspace\//, ""))
    .find(matcher) || null;
}

export function extractWorkspaceImagePathFromResult(
  result: unknown,
): string | null {
  return extractWorkspaceMediaPathFromResult(
    result,
    isRunnerLogImageFilePath,
    "png|jpe?g|gif|webp|svg|avif|bmp",
  );
}

function extractWorkspaceMediaPathFromOutput(
  output: unknown,
  mediaLabel: "image" | "video",
  matcher: (path: string) => boolean,
  extensionPattern: string,
): string | null {
  if (typeof output !== "string" || !output.trim()) return null;
  const candidates: string[] = [];
  const patterns = [
    new RegExp(
      `${mediaLabel} saved to:\\s*["']?([^\\s"'\\n]+\\.(?:${extensionPattern}))["']?`,
      "ig",
    ),
    new RegExp(
      `saved to:\\s*["']?([^\\s"'\\n]+\\.(?:${extensionPattern}))["']?`,
      "ig",
    ),
    new RegExp(
      `((?:/workspace/|workspace/)?[A-Za-z0-9_./-]+\\.(?:${extensionPattern}))`,
      "ig",
    ),
  ];
  for (const pattern of patterns) {
    for (const match of output.matchAll(pattern)) {
      const candidate = String(match[1] || "")
        .trim()
        .replace(/^\/workspace\//, "")
        .replace(/^workspace\//, "");
      if (matcher(candidate)) candidates.push(candidate);
    }
  }
  return candidates[0] || null;
}

export function extractWorkspaceImagePathFromOutput(
  output: unknown,
): string | null {
  return extractWorkspaceMediaPathFromOutput(
    output,
    "image",
    isRunnerLogImageFilePath,
    "png|jpe?g|gif|webp|svg|avif|bmp",
  );
}

export function hasConfirmedGeneratedImagePathText(output: unknown): boolean {
  return typeof output === "string"
    && /(?:generated image|image saved to:|saved image to:|✓\s*image saved to:)/i
      .test(output);
}

function hasStructuredImagePayload(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const record = content as {
    content?: Array<{ type?: string; data?: string }>;
    structured_content?: Record<string, unknown>;
    structuredContent?: Record<string, unknown>;
  };
  if (
    record.content?.some(
      (item) => (
        item?.type === "image"
        && typeof item.data === "string"
        && Boolean(item.data.trim())
      ),
    )
  ) {
    return true;
  }
  const structured = record.structuredContent
    && typeof record.structuredContent === "object"
    ? record.structuredContent
    : record.structured_content
        && typeof record.structured_content === "object"
      ? record.structured_content
      : null;
  if (!structured) return false;
  if (
    typeof structured.image_data === "string"
    && structured.image_data.trim()
  ) {
    return true;
  }
  return [
    structured.workspace_file_paths,
    structured.file_paths,
    structured.original_file_paths,
  ].some(
    (value) => (
      Array.isArray(value)
      && value.some(
        (entry) => (
          typeof entry === "string" && isRunnerLogImageFilePath(entry)
        ),
      )
    ),
  );
}

export function isImageGenerationCommand(command?: string): boolean {
  return Boolean(
    command
    && (
      command.includes(".claude/skills/image-generation/")
      || command.includes("generate-image.py")
    ),
  );
}

export function isLikelyImageGenerationLog(
  log: RunnerLog,
  command?: string,
): boolean {
  const messageHasConfirmedImagePath = hasConfirmedGeneratedImagePathText(
    log.message,
  ) && Boolean(extractWorkspaceImagePathFromOutput(log.message));
  return Boolean(
    (command && isImageGenerationCommand(command))
      || log.metadata?.isImageGeneration
      || (
        typeof log.metadata?.savedImagePath === "string"
        && log.metadata.savedImagePath.trim()
      )
      || hasStructuredImagePayload(log.metadata?.result)
      || hasStructuredImagePayload(log.metadata?.output)
      || messageHasConfirmedImagePath,
  );
}

function isVideoGenerationCommand(command?: string): boolean {
  return Boolean(
    command
    && (
      command.includes(".claude/skills/video-generation/")
      || command.includes("generate-video.py")
    ),
  );
}

export function extractWorkspaceVideoPathFromResult(
  result: unknown,
): string | null {
  return extractWorkspaceMediaPathFromResult(
    result,
    isRunnerLogVideoFilePath,
    "mp4|mov|webm|mkv|avi",
  );
}

export function extractWorkspaceVideoPathFromOutput(
  output: unknown,
): string | null {
  return extractWorkspaceMediaPathFromOutput(
    output,
    "video",
    isRunnerLogVideoFilePath,
    "mp4|mov|webm|mkv|avi",
  );
}

function extractDirectWorkspaceVideoPathFromMetadata(
  metadata: RunnerLog["metadata"],
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;
  for (const candidate of [
    record.savedVideoPath,
    record.saved_video_path,
    record.outputVideoPath,
    record.output_video_path,
  ]) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    const normalized = candidate
      .trim()
      .replace(/^\/workspace\//, "")
      .replace(/^workspace\//, "");
    if (isRunnerLogVideoFilePath(normalized)) return normalized;
  }
  return null;
}

export function extractWorkspaceVideoPathFromMetadata(
  metadata: RunnerLog["metadata"],
): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;
  for (const candidate of [
    record.savedVideoPath,
    record.saved_video_path,
    record.outputPath,
    record.output_path,
    record.path,
  ]) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    const normalized = candidate
      .trim()
      .replace(/^\/workspace\//, "")
      .replace(/^workspace\//, "");
    if (isRunnerLogVideoFilePath(normalized)) return normalized;
  }
  return extractWorkspaceVideoPathFromResult(metadata);
}

function hasExplicitVideoGenerationSource(
  log: RunnerLog,
  command?: string,
): boolean {
  const rawLog = log as RunnerLog & {
    event_type?: unknown;
    type?: unknown;
  };
  const normalizedEventType = String(
    rawLog.eventType || rawLog.event_type || rawLog.type || "",
  ).trim().toLowerCase();
  const metadataToolName = String(
    log.metadata?.toolName || log.metadata?.toolId || "",
  ).trim().toLowerCase();
  const metadataServerName = String(
    log.metadata?.serverName || "",
  ).trim().toLowerCase();
  const normalizedCommand = typeof command === "string" && command.trim()
    ? command.trim()
    : typeof log.metadata?.command === "string"
      ? log.metadata.command.trim()
      : "";
  return Boolean(
    (normalizedCommand && isVideoGenerationCommand(normalizedCommand))
      || normalizedEventType === "video_generation_skill"
      || normalizedEventType === "video_generation"
      || normalizedEventType === "generate_video"
      || metadataToolName === "generate_video"
      || metadataToolName === "video_generation"
      || metadataServerName === "video-generation-skill"
      || metadataServerName === "video_generation_skill"
      || log.metadata?.isVideoGeneration
      || extractDirectWorkspaceVideoPathFromMetadata(log.metadata),
  );
}

function hasConfirmedGeneratedVideoPathText(output: unknown): boolean {
  return typeof output === "string"
    && /(?:generated video|video saved to:|saved video to:|✓\s*video saved to:)/i
      .test(output);
}

function hasStructuredVideoPayload(content: unknown): boolean {
  if (!content || typeof content !== "object") return false;
  const record = content as {
    structured_content?: Record<string, unknown>;
    structuredContent?: Record<string, unknown>;
  };
  const structured = record.structuredContent
    && typeof record.structuredContent === "object"
    ? record.structuredContent
    : record.structured_content
        && typeof record.structured_content === "object"
      ? record.structured_content
      : null;
  if (!structured) return false;
  return [
    structured.workspace_file_paths,
    structured.file_paths,
    structured.original_file_paths,
  ].some(
    (value) => (
      Array.isArray(value)
      && value.some(
        (entry) => (
          typeof entry === "string" && isRunnerLogVideoFilePath(entry)
        ),
      )
    ),
  );
}

export function isVideoFileChangeLog(log: RunnerLog): boolean {
  if (
    log.eventType !== "file_change"
    || !hasExplicitVideoGenerationSource(log)
  ) {
    return false;
  }
  const filePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths
    : [];
  return Boolean(
    extractWorkspaceVideoPathFromMetadata(log.metadata)
      || extractWorkspaceVideoPathFromOutput(log.message)
      || filePaths.some(
        (filePath) => isRunnerLogVideoFilePath(String(filePath || "")),
      ),
  );
}

export function sanitizeImagePromptCandidate(value: unknown): string {
  let normalized = String(value || "").trim();
  if (!normalized) return "";
  normalized = normalized.replace(/\\n/g, "\n");
  const markerMatch = normalized.match(
    /\r?\n\s*(?:quality|generated with|openai size request|image saved to|size):/i,
  );
  if (markerMatch) normalized = normalized.slice(0, markerMatch.index).trim();
  normalized = normalized.split(/\r?\n/)[0]?.trim() || "";
  return normalized.replace(/^["'`]+|["'`,\s]+$/g, "").trim();
}

export function extractVideoPrompt(command?: string): string | undefined {
  if (!command) return undefined;
  const labeledPromptMatch = command.match(
    /Generating video(?:\s+with [^:]+)?:\s*(.+?)(?:\.\.\.)?(?:\r?\n|$)/i,
  ) || command.match(
    /^\s*Video Generation\s+(.+?)(?:\s+generating\.{3}|(?:\r?\n|$))/i,
  );
  const labeledPrompt = sanitizeImagePromptCandidate(
    labeledPromptMatch?.[1] || "",
  );
  if (labeledPrompt) return labeledPrompt;
  const quoted = [
    ...command.matchAll(/"([^"]+)"/g),
    ...command.matchAll(/'([^']+)'/g),
  ]
    .map((match) => sanitizeImagePromptCandidate(match[1]))
    .filter(
      (value) => (
        value.length >= 3
        && !value.match(
          /\.(mp4|mov|webm|mkv|avi|png|jpg|jpeg|gif|webp|py|sh|txt|md)$/i,
        )
        && !value.startsWith("/")
        && !value.startsWith(".")
        && !value.startsWith("-")
        && !value.match(/^\d+:\d+$/)
        && !value.match(/^(720P|1080P)$/i)
      ),
    );
  return quoted.length === 0
    ? undefined
    : quoted.reduce(
        (longest, current) => (
          current.length > longest.length ? current : longest
        ),
      );
}

function extractPromptFromLogMetadata(log: RunnerLog): string | undefined {
  const args = log.metadata?.args
    && typeof log.metadata.args === "object"
    && !Array.isArray(log.metadata.args)
    ? log.metadata.args as Record<string, unknown>
    : null;
  const toolInput = log.metadata?.toolInput
    && typeof log.metadata.toolInput === "object"
    && !Array.isArray(log.metadata.toolInput)
    ? log.metadata.toolInput
    : null;
  for (const candidate of [
    args?.prompt,
    args?.text,
    toolInput?.prompt,
    toolInput?.text,
  ]) {
    if (typeof candidate !== "string" || !candidate.trim()) continue;
    const sanitized = sanitizeImagePromptCandidate(candidate);
    if (sanitized) return sanitized;
  }
  return undefined;
}

export const extractVideoPromptFromLogMetadata = extractPromptFromLogMetadata;

export function isLikelyVideoGenerationLog(
  log: RunnerLog,
  command?: string,
): boolean {
  if (!hasExplicitVideoGenerationSource(log, command)) return false;
  const messageHasConfirmedVideoPath = hasConfirmedGeneratedVideoPathText(
    log.message,
  ) && Boolean(extractWorkspaceVideoPathFromOutput(log.message));
  const messageHasVideoGenerationLabel =
    /\b(?:Video Generation|Generating video)\b/i.test(log.message || "");
  const rawLog = log as RunnerLog & {
    event_type?: unknown;
    type?: unknown;
  };
  const normalizedEventType = String(
    rawLog.eventType || rawLog.event_type || rawLog.type || "",
  ).trim().toLowerCase();
  const metadataToolName = String(
    log.metadata?.toolName || log.metadata?.toolId || "",
  ).trim().toLowerCase();
  const metadataServerName = String(
    log.metadata?.serverName || "",
  ).trim().toLowerCase();
  const normalizedCommand = typeof command === "string" && command.trim()
    ? command.trim()
    : typeof log.metadata?.command === "string"
      ? log.metadata.command.trim()
      : "";
  return Boolean(
    (normalizedCommand && isVideoGenerationCommand(normalizedCommand))
      || normalizedEventType === "video_generation_skill"
      || normalizedEventType === "video_generation"
      || normalizedEventType === "generate_video"
      || metadataToolName === "generate_video"
      || metadataToolName === "video_generation"
      || metadataServerName === "video-generation-skill"
      || metadataServerName === "video_generation_skill"
      || log.metadata?.isVideoGeneration
      || extractDirectWorkspaceVideoPathFromMetadata(log.metadata)
      || extractWorkspaceVideoPathFromMetadata(log.metadata)
      || hasStructuredVideoPayload(log.metadata?.result)
      || hasStructuredVideoPayload(log.metadata?.output)
      || messageHasConfirmedVideoPath
      || messageHasVideoGenerationLabel,
  );
}

export function isImageFileChangeLog(log: RunnerLog): boolean {
  if (log.eventType !== "file_change") return false;
  if (
    log.metadata?.isImageGeneration
    || typeof log.metadata?.savedImagePath === "string"
  ) {
    return true;
  }
  const filePaths = Array.isArray(log.metadata?.filePaths)
    ? log.metadata.filePaths
    : [];
  return filePaths.some(
    (filePath) => isRunnerLogImageFilePath(String(filePath || "")),
  );
}

export function extractImagePrompt(command?: string): string | undefined {
  if (!command) return undefined;
  const quoted = [
    ...command.matchAll(/"([^"]+)"/g),
    ...command.matchAll(/'([^']+)'/g),
  ]
    .map((match) => sanitizeImagePromptCandidate(match[1]))
    .filter(
      (value) => (
        value.length >= 3
        && !value.match(/\.(png|jpg|jpeg|gif|webp|py|sh|txt|md)$/i)
        && !value.startsWith("/")
        && !value.startsWith(".")
        && !value.startsWith("-")
      ),
    );
  return quoted.length === 0
    ? undefined
    : quoted.reduce(
        (longest, current) => (
          current.length > longest.length ? current : longest
        ),
      );
}

export const extractImagePromptFromLogMetadata = extractPromptFromLogMetadata;

export function isImageUnderstandingCommand(command?: string): boolean {
  return Boolean(
    command
    && (
      command.includes("view-image.py")
      || command.includes(".claude/skills/image-understanding/")
      || command.includes("/workspace/.scripts/view-image.py")
    ),
  );
}

function tokenizeImageUnderstandingCommand(command: string): string[] {
  const tokens: string[] = [];
  const pattern = /"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|(\S+)/g;
  let match: RegExpExecArray | null = null;
  while ((match = pattern.exec(command)) !== null) {
    const token = match[1] ?? match[2] ?? match[3] ?? "";
    tokens.push(token.replace(/\\(["'])/g, "$1"));
  }
  return tokens;
}

function collectImageUnderstandingImagePathsFromValue(
  value: unknown,
  paths: string[],
) {
  if (typeof value === "string") {
    const normalized = normalizeRunnerFilePath(value);
    if (normalized && isRunnerLogImageFilePath(normalized)) {
      paths.push(normalized);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(
      (entry) => collectImageUnderstandingImagePathsFromValue(entry, paths),
    );
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  [
    record.path,
    record.filePath,
    record.file_path,
    record.workspacePath,
    record.workspace_path,
    record.imagePath,
    record.image_path,
    record.url,
  ].forEach(
    (entry) => collectImageUnderstandingImagePathsFromValue(entry, paths),
  );
}

export function extractImageUnderstandingImagePaths(
  log: RunnerLog,
  command?: string,
): string[] {
  const paths: string[] = [];
  if (command) {
    tokenizeImageUnderstandingCommand(command)
      .filter(isRunnerLogImageFilePath)
      .forEach((candidate) => {
        const normalized = normalizeRunnerFilePath(candidate);
        if (normalized) paths.push(normalized);
      });
  }
  const metadata = log.metadata as Record<string, unknown> | undefined;
  if (metadata) {
    [
      metadata.imagePath,
      metadata.image_path,
      metadata.imagePaths,
      metadata.image_paths,
      metadata.images,
      metadata.inputs,
      metadata.input,
      metadata.filePaths,
      metadata.file_paths,
      metadata.files,
      metadata.paths,
    ].forEach(
      (entry) => collectImageUnderstandingImagePathsFromValue(entry, paths),
    );
  }
  const seen = new Set<string>();
  return paths.filter((path) => {
    if (seen.has(path)) return false;
    seen.add(path);
    return true;
  });
}

export function resolveImageUnderstandingResultText(log: RunnerLog): string {
  const structuredOutput = parseStructuredCommandExecutionOutput(
    log.metadata?.output,
  );
  const outputText = stripRunnerSystemTags(
    structuredOutput
      ? [structuredOutput.stdout, structuredOutput.stderr]
          .filter(Boolean)
          .join("\n")
      : String(log.metadata?.output || ""),
  ).trim();
  const result = log.metadata?.result;
  if (outputText) return outputText;
  if (typeof result === "string" && result.trim()) {
    return stripRunnerSystemTags(result).trim();
  }
  if (result && typeof result === "object") {
    const record = result as Record<string, unknown>;
    const text = record.text
      || record.output
      || record.message
      || record.description;
    if (typeof text === "string" && text.trim()) {
      return stripRunnerSystemTags(text).trim();
    }
  }
  return stripRunnerSystemTags(log.message || "")
    .replace(/^Executed:\s*/i, "")
    .trim();
}
