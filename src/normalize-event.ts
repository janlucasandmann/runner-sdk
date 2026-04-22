import { RunnerEventHandleResult, RunnerLog, RunnerUsage, RawRunnerEvent } from "./types.js";

type TimeProvider = () => number;

type CompletedEvent = {
  type: "response.completed";
  response?: {
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cached_tokens?: number;
    };
    cost_usd?: number;
  };
};

type FailedEvent = {
  type: "response.failed";
  response?: {
    error?: { message?: string };
    usage?: {
      input_tokens?: number;
      output_tokens?: number;
      cached_tokens?: number;
    };
  };
};

type StreamErrorEvent = {
  type: "stream.error";
  error?: { message?: string };
};

type ToolStartedEvent = {
  type: "tool.started";
  tool?: string;
  toolId?: string;
  description?: string;
  input?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

function normalizeBrowserArtifactPath(filePath?: string | null): string {
  return String(filePath || "").trim().replace(/^\/workspace\//, "").replace(/^workspace\//, "").replace(/^\/+/, "");
}

function isBrowserArtifactPath(filePath?: string | null): boolean {
  const normalized = normalizeBrowserArtifactPath(filePath);
  return normalized === "browser-skill" || normalized.startsWith("browser-skill/");
}

function isBrowserSkillLaunchCommand(command?: string | null): boolean {
  return /\bbrowser\.mjs\s+launch(?:\s|$)/i.test(String(command || ""));
}

function extractDeepResearchCommandResult(output?: string | null) {
  const result = {
    topic: null as string | null,
    interactionId: null as string | null,
    thinkingSummaries: [] as string[],
    reportFile: null as string | null,
    reportManifestFile: null as string | null,
    sourcesCount: 0,
    sources: [] as string[],
    elapsedSeconds: 0,
    errorMessage: null as string | null,
    runtimePath: null as string | null,
  };
  if (!output) {
    return result;
  }

  const segments: string[] = [];
  const pushSegment = (value: unknown) => {
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    segments.push(trimmed);
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
      if (event.event === "interaction_started" && typeof event.interaction_id === "string") {
        result.interactionId = event.interaction_id;
      }
      if (event.event === "thinking" && typeof event.summary === "string" && event.summary.trim()) {
        result.thinkingSummaries.push(event.summary.trim());
      }
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.report_file === "string") {
        result.reportFile = event.report_file;
      }
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.report_manifest_file === "string") {
        result.reportManifestFile = event.report_manifest_file;
      }
      if ((event.event === "research_complete" || event.event === "complete") && typeof event.sources_count === "number") {
        result.sourcesCount = event.sources_count;
      }
      if ((event.event === "research_complete" || event.event === "complete") && Array.isArray(event.sources)) {
        result.sources = event.sources.filter((source): source is string => typeof source === "string");
      }
      if (typeof event.elapsed_seconds === "number") {
        result.elapsedSeconds = event.elapsed_seconds;
      }
      if (event.event === "resolved_runtime" && typeof event.path === "string") {
        result.runtimePath = event.path;
      }
      if (event.event === "error" && typeof event.message === "string") {
        result.errorMessage = event.message;
      }
    } catch {}
  }

  return result;
}

function isDeepResearchCommandOutput(output?: string | null): boolean {
  const parsed = extractDeepResearchCommandResult(output);
  return Boolean(
    parsed.topic ||
      parsed.interactionId ||
      parsed.reportFile ||
      parsed.reportManifestFile ||
      parsed.runtimePath ||
      parsed.errorMessage ||
      parsed.thinkingSummaries.length > 0 ||
      parsed.sourcesCount > 0
  );
}

export class RunnerEventNormalizer {
  private readonly startTimeMs: number;
  private readonly now: TimeProvider;
  private isContainerExecution = false;

  constructor(now: TimeProvider = () => Date.now()) {
    this.now = now;
    this.startTimeMs = this.now();
  }

  handle(event: RawRunnerEvent): RunnerEventHandleResult {
    const type = event.type;
    if (type === "log") {
      return this.handleLogEvent(event);
    }

    if (type === "direct.response") {
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.asString(event.message),
            type: "info",
            eventType: "llm_response",
            isLLMResponse: true,
          },
        ],
      };
    }

    if (type === "computer.starting") {
      this.isContainerExecution = true;
      return {
        logs: [{ time: this.formatElapsed(), message: "Starting computer...", type: "info", eventType: "startup" }],
      };
    }

    if (type === "response.started") {
      const logs: RunnerLog[] = [];
      if (this.isContainerExecution) {
        logs.push({
          time: this.formatElapsed(),
          message: "Starting agent on computer",
          type: "info",
          eventType: "startup",
        });
      }
      return { logs, setupComplete: true };
    }

    if (type === "response.item.completed") {
      return this.handleCompletedItem(event);
    }

    if (type === "tool.started") {
      return this.handleToolStarted(event as ToolStartedEvent);
    }

    if (type === "deep_research") {
      const deepResearchEvent = this.asString(event.event, "status");
      const message = this.asString(event.thinkingSummary, `Deep research: ${deepResearchEvent}`);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message,
            type: "info",
            eventType: "deep_research",
            metadata: {
              deepResearch: {
                sessionId: this.optionalString(event.interactionId),
                event: deepResearchEvent,
                topic: this.optionalString(event.topic),
                interactionId: this.optionalString(event.interactionId),
                thinkingSummary: this.optionalString(event.thinkingSummary),
                reportFile: this.optionalString(event.reportFile),
                reportManifestFile: this.optionalString(event.reportManifestFile),
                sourcesCount: this.optionalNumber(event.sourcesCount),
                sources: this.optionalStringArray(event.sources),
                elapsedSeconds: this.optionalNumber(event.elapsedSeconds),
                errorMessage: this.optionalString(event.errorMessage),
                runtimePath: this.optionalString(event.runtimePath),
                resumeAttempt: this.optionalNumber(event.resumeAttempt),
                reportLength: this.optionalNumber(event.reportLength),
                timestamp: this.optionalString(event.timestamp),
              },
            },
          },
        ],
      };
    }

    if (type === "response.completed") {
      return this.handleResponseCompleted(event as CompletedEvent);
    }

    if (type === "response.failed") {
      return this.handleResponseFailed(event as FailedEvent);
    }

    if (type === "stream.error") {
      return this.handleStreamError(event as StreamErrorEvent);
    }

    return { logs: [] };
  }

  private handleLogEvent(event: RawRunnerEvent): RunnerEventHandleResult {
    const log = this.asObject(event.log);
    if (!log) return { logs: [] };
    const metadata = this.asObject(log.metadata);

    return {
      logs: [
        {
          time: this.asString(log.time, this.formatElapsed()),
          message: this.asString(log.message),
          type: this.asLogType(log.type),
          eventType: this.asEventType(log.eventType),
          metadata: metadata || undefined,
        },
      ],
    };
  }

  private handleCompletedItem(event: RawRunnerEvent): RunnerEventHandleResult {
    const item = this.asObject(event.item);
    if (!item) return { logs: [] };

    const itemType = this.asString(item.type);
    if (itemType === "planning") {
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.contentText(item.content),
            type: "info",
            eventType: "planning",
            isPlanning: true,
          },
        ],
      };
    }

    if (itemType === "reasoning") {
      const metadata = this.asObject(item.metadata);
      const reasoningText = this.contentText(item.content) || this.asString(item.text);
      if (!reasoningText) return { logs: [] };
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: reasoningText,
            type: "info",
            eventType: "reasoning",
            isReasoning: true,
            metadata: metadata || undefined,
          },
        ],
      };
    }

    if (itemType === "message") {
      const text = this.messageText(item.content);
      if (!text) return { logs: [] };
      const metadata = this.asObject(item.metadata);
      const isLLMResponse = Boolean(metadata?.isLLMResponse || metadata?.isDirect);

      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: text,
            type: "info",
            eventType: isLLMResponse ? "llm_response" : "agent_message",
            isLLMResponse: isLLMResponse || undefined,
            metadata: metadata || undefined,
          },
        ],
      };
    }

    if (itemType === "tool_call") {
      return this.handleToolCall(item);
    }

    if (itemType === "file_change") {
      const changes = this.asObjectArray(item.changes).filter((change) => !isBrowserArtifactPath(this.asString(change.path)));
      const filePaths = changes.map((change) => this.asString(change.path)).filter(Boolean);
      if (filePaths.length === 0) {
        return { logs: [] };
      }
      const changeKinds = changes.map((change) => this.asChangeKind(change.kind)).filter(Boolean) as Array<
        "created" | "modified" | "deleted"
      >;
      const fileContents: Record<string, string> = {};
      const diffs: Record<string, { diff?: string; additions?: number; deletions?: number }> = {};

      for (const change of changes) {
        const path = this.asString(change.path);
        const content = this.asString(change.content);
        const diff = this.asString(change.diff);
        const additions = this.optionalNumber(change.additions);
        const deletions = this.optionalNumber(change.deletions);
        if (path && content) {
          fileContents[path] = content;
        }
        if (path && (diff || typeof additions === "number" || typeof deletions === "number")) {
          diffs[path] = {
            ...(diff ? { diff } : {}),
            ...(typeof additions === "number" ? { additions } : {}),
            ...(typeof deletions === "number" ? { deletions } : {}),
          };
        }
      }

      const message = filePaths.map((filePath, index) => `${filePath} (${changeKinds[index] ?? "modified"})`).join(", ");
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message,
            type: "success",
            eventType: "file_change",
            metadata: {
              filePaths,
              changeKinds,
              fileContents,
              diffs: Object.keys(diffs).length > 0 ? diffs : undefined,
            },
          },
        ],
      };
    }

    if (itemType === "setup") {
      const content = this.asObject(item.content);
      const status = this.asString(item.status);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.asString(content?.message),
            type: status === "failed" ? "error" : "info",
            eventType: "setup",
          },
        ],
      };
    }

    if (itemType === "error") {
      const error = this.asObject(item.error);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.asString(error?.message, "Error"),
            type: "error",
          },
        ],
      };
    }

    return { logs: [] };
  }

  private handleToolStarted(event: ToolStartedEvent): RunnerEventHandleResult {
    const metadata = this.asObject(event.metadata);
    const input = this.asObject(event.input);
    const rawDescription = this.asString(event.description, this.asString(event.tool, "Tool"));
    const resolvedDescription = (() => {
      const toolName = this.asString(event.tool).trim().toLowerCase();
      if (toolName !== "bash") {
        return rawDescription;
      }
      const commandCandidate =
        this.optionalString(input?.command) ||
        this.optionalString(input?.cmd) ||
        this.optionalString(input?.script);
      return commandCandidate ? `$ ${commandCandidate}` : rawDescription;
    })();
    const normalizedShellDescription = resolvedDescription.replace(/^\$\s*/, "").trim().toLowerCase();
    const shouldSuppressGenericShellStart =
      this.asString(event.tool).trim().toLowerCase() === "bash" &&
      (normalizedShellDescription === "bash" ||
        normalizedShellDescription === "sh" ||
        normalizedShellDescription === "zsh" ||
        normalizedShellDescription === "/bin/bash" ||
        normalizedShellDescription === "/bin/sh");
    if (shouldSuppressGenericShellStart) {
      return { logs: [] };
    }

    if (!metadata) {
      return resolvedDescription
        ? {
            logs: [
              {
                time: this.formatElapsed(),
                message: resolvedDescription,
                type: "info",
                eventType: "action_summary",
                isActionSummary: true,
                metadata: {
                  toolName: this.optionalString(event.tool),
                  toolId: this.optionalString(event.toolId),
                  status: "started",
                  isToolStarted: true,
                  toolInput: input || undefined,
                },
              },
            ],
          }
        : { logs: [] };
    }

    const delegatedTo = this.asObject(metadata.delegatedTo);
    const invocationMetadata = this.asObject(metadata.subagentInvocation);
    if (!delegatedTo || !invocationMetadata) {
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: resolvedDescription,
            type: "info",
            eventType: "action_summary",
            isActionSummary: true,
            metadata: this.mergeMetadata(metadata, {
              toolName: this.optionalString(event.tool),
              toolId: this.optionalString(event.toolId),
              status: "started",
              isToolStarted: true,
              toolInput: input || undefined,
            }),
          },
        ],
      };
    }

    return {
      logs: [
        {
          time: this.formatElapsed(),
          message: this.asString(event.description, `Delegated to ${this.asString(delegatedTo.agentName, "Subagent")}`),
          type: "info",
          eventType: "subagent_invocation",
          metadata: this.mergeMetadata(metadata, {
            status: "started",
          }),
        },
      ],
    };
  }

  private handleToolCall(item: Record<string, unknown>): RunnerEventHandleResult {
    const tool = this.asObject(item.tool);
    if (!tool) return { logs: [] };
    const metadata = this.asObject(item.metadata);
    const subagentInvocation = this.asObject(metadata?.subagentInvocation);
    if (subagentInvocation) {
      const delegatedTo = this.asObject(metadata?.delegatedTo);
      const agentName =
        this.optionalString(subagentInvocation.agentName) ||
        this.optionalString(delegatedTo?.agentName) ||
        "Subagent";
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: `Completed ${agentName}`,
            type: this.optionalNumber(tool.exit_code) === 0 ? "success" : "error",
            eventType: "subagent_invocation",
            metadata: this.mergeMetadata(metadata, {
              command: this.optionalString(tool.command),
              exitCode: this.optionalNumber(tool.exit_code),
              status: this.asCommandStatus(metadata?.status) ?? this.asCommandStatus(item.status) ?? "completed",
              output: this.optionalString(tool.output)?.trim(),
            }),
          },
        ],
      };
    }

    const toolType = this.asString(tool.type);
    if (toolType === "file_write") {
      const filePath = this.asString(tool.file_path);
      const fileContent = this.asString(tool.file_content);
      const fileDiff = this.asString(tool.file_diff);
      const output = this.asString(tool.output);
      const exitCode = this.optionalNumber(tool.exit_code);
      const additions = this.optionalNumber(tool.additions);
      const deletions = this.optionalNumber(tool.deletions);
      const operationKind = this.asChangeKind(tool.operation_kind) || "created";
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: filePath || this.asString(tool.command, "Write file"),
            type: exitCode === 0 ? "success" : "error",
            eventType: "file_change",
            metadata: this.mergeMetadata(metadata, {
              filePaths: filePath ? [filePath] : [],
              changeKinds: [operationKind],
              diffs:
                filePath && (fileDiff || typeof additions === "number" || typeof deletions === "number")
                  ? {
                      [filePath]: {
                        ...(fileDiff ? { diff: fileDiff } : {}),
                        ...(typeof additions === "number" ? { additions } : {}),
                        ...(typeof deletions === "number" ? { deletions } : {}),
                      },
                    }
                  : undefined,
              fileContents: filePath && fileContent ? { [filePath]: fileContent } : {},
              exitCode,
              output: output?.trim(),
            }),
          },
        ],
      };
    }

    if (toolType === "file_read") {
      const filePath = this.asString(tool.file_path);
      const fileContent = this.asString(tool.file_content);
      const output = this.asString(tool.output);
      const exitCode = this.optionalNumber(tool.exit_code);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: filePath ? `Read: ${filePath}` : this.asString(tool.command, "Read"),
            type: exitCode === 0 ? "success" : "error",
            eventType: "command_execution",
            metadata: this.mergeMetadata(metadata, {
              command: filePath ? `cat "${filePath}"` : this.asString(tool.command),
              filePaths: filePath ? [filePath] : [],
              fileContents:
                filePath && fileContent
                  ? {
                      [filePath]: fileContent,
                    }
                  : {},
              exitCode,
              status: this.asCommandStatus(item.status),
              output: fileContent || output?.trim(),
            }),
          },
        ],
      };
    }

    if (toolType === "command_execution" || toolType === "image_generation_skill") {
      const isImageGeneration = toolType === "image_generation_skill" || Boolean(metadata?.isImageGeneration);
      const command = this.optionalString(tool.command);
      const output = this.optionalString(tool.output)?.trim();
      if (isBrowserSkillLaunchCommand(command)) {
        return { logs: [] };
      }
      if (!isImageGeneration && isDeepResearchCommandOutput(output)) {
        const parsed = extractDeepResearchCommandResult(output);
        const event =
          parsed.errorMessage
            ? "error"
            : parsed.reportFile
              ? "complete"
              : parsed.thinkingSummaries.length > 0
                ? "thinking"
                : parsed.interactionId
                  ? "interaction_started"
                  : parsed.runtimePath
                    ? "resolved_runtime"
                    : "start";
        return {
          logs: [
            {
              time: this.formatElapsed(),
              message: parsed.topic || this.asString(tool.command, "Deep research"),
              type: parsed.errorMessage ? "error" : "info",
              eventType: "deep_research",
              metadata: this.mergeMetadata(metadata, {
                deepResearch: {
                  sessionId: parsed.interactionId || undefined,
                  event,
                  topic: parsed.topic || undefined,
                  interactionId: parsed.interactionId || undefined,
                  thinkingSummary:
                    parsed.thinkingSummaries.length > 0
                      ? parsed.thinkingSummaries[parsed.thinkingSummaries.length - 1]
                      : undefined,
                  reportFile: parsed.reportFile || undefined,
                  reportManifestFile: parsed.reportManifestFile || undefined,
                  sourcesCount: parsed.sourcesCount || undefined,
                  sources: parsed.sources.length > 0 ? parsed.sources : undefined,
                  elapsedSeconds: parsed.elapsedSeconds || undefined,
                  errorMessage: parsed.errorMessage || undefined,
                  runtimePath: parsed.runtimePath || undefined,
                },
                command,
                exitCode: this.optionalNumber(tool.exit_code),
                status: this.asCommandStatus(metadata?.status) ?? this.asCommandStatus(item.status),
                output,
              }),
            },
          ],
        };
      }
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.asString(tool.command, "Unknown command"),
            type: this.optionalNumber(tool.exit_code) === 0 ? "success" : "error",
            eventType: "command_execution",
            metadata: this.mergeMetadata(metadata, {
              command,
              exitCode: this.optionalNumber(tool.exit_code),
              status: this.asCommandStatus(metadata?.status) ?? this.asCommandStatus(item.status),
              output,
              ...(isImageGeneration
                ? {
                    isImageGeneration: true,
                    serverName: this.optionalString(metadata?.serverName) ?? "image-generation-skill",
                    toolName: this.optionalString(metadata?.toolName) ?? "generate_image",
                    args: metadata?.args,
                    savedImagePath: this.optionalString(metadata?.savedImagePath),
                    result: metadata?.result,
                    error: metadata?.error,
                  }
                : {}),
            }),
          },
        ],
      };
    }

    if (toolType === "mcp_tool") {
      const status = this.asString(item.status);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: `${this.asString(tool.server, "MCP")}.${this.asString(tool.name, "unknown")}`,
            type: status === "failed" ? "error" : "success",
            eventType: "mcp_tool_call",
            metadata: this.mergeMetadata(metadata, {
              serverName: this.optionalString(tool.server),
              toolName: this.optionalString(tool.name),
              status: this.asCommandStatus(item.status),
              durationMs: this.optionalNumber(metadata?.duration_ms),
              result: tool.output,
              error: tool.error,
              args: tool.arguments,
              savedImagePath: this.optionalString(metadata?.savedImagePath),
            }),
          },
        ],
      };
    }

    return { logs: [] };
  }

  private handleResponseCompleted(event: CompletedEvent): RunnerEventHandleResult {
    const usage = event.response?.usage;
    if (!usage) return { logs: [] };

    const normalizedUsage: RunnerUsage = {
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      cachedInputTokens: usage.cached_tokens ?? 0,
      totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
      costUsd: event.response?.cost_usd,
    };

    return {
      usage: normalizedUsage,
      logs: [
        {
          time: this.formatElapsed(),
          message: "Run Summary",
          type: "success",
          eventType: "turn_completed",
          metadata: {
            inputTokens: normalizedUsage.inputTokens,
            outputTokens: normalizedUsage.outputTokens,
            cachedInputTokens: normalizedUsage.cachedInputTokens,
            totalTokens: normalizedUsage.totalTokens,
            costUsd: normalizedUsage.costUsd,
          },
        },
      ],
    };
  }

  private handleResponseFailed(event: FailedEvent): RunnerEventHandleResult {
    const errorMessage = event.response?.error?.message ?? "Execution failed";
    const usage = event.response?.usage;

    if (errorMessage === "Execution cancelled by user") {
      return {
        cancelled: true,
        usage: usage
          ? {
              inputTokens: usage.input_tokens ?? 0,
              outputTokens: usage.output_tokens ?? 0,
              cachedInputTokens: usage.cached_tokens ?? 0,
              totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
            }
          : undefined,
        logs: [
          {
            time: this.formatElapsed(),
            message: "Task execution stopped",
            type: "warning",
          },
        ],
      };
    }

    return {
      streamError: new Error(errorMessage),
      usage: usage
        ? {
            inputTokens: usage.input_tokens ?? 0,
            outputTokens: usage.output_tokens ?? 0,
            cachedInputTokens: usage.cached_tokens ?? 0,
            totalTokens: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
          }
        : undefined,
      logs: [
        {
          time: this.formatElapsed(),
          message: errorMessage,
          type: "error",
        },
      ],
    };
  }

  private handleStreamError(event: StreamErrorEvent): RunnerEventHandleResult {
    const errorMessage = event.error?.message ?? "Unknown error";
    if (errorMessage === "Execution cancelled by user") {
      return {
        cancelled: true,
        logs: [
          {
            time: this.formatElapsed(),
            message: "Task execution stopped",
            type: "warning",
          },
        ],
      };
    }

    return {
      streamError: new Error(errorMessage),
      logs: [
        {
          time: this.formatElapsed(),
          message: errorMessage,
          type: "error",
        },
      ],
    };
  }

  private formatElapsed(): string {
    const elapsedMs = Math.max(this.now() - this.startTimeMs, 0);
    const seconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainderSeconds).padStart(2, "0")}`;
  }

  private contentText(content: unknown): string {
    const objectContent = this.asObject(content);
    return this.asString(objectContent?.text);
  }

  private messageText(content: unknown): string {
    const parts = this.asArray(content);
    for (const part of parts) {
      const objectPart = this.asObject(part);
      if (!objectPart) continue;
      if (objectPart.type === "text" && typeof objectPart.text === "string") {
        return objectPart.text;
      }
    }
    return "";
  }

  private asObject(value: unknown): Record<string, unknown> | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) return null;
    return value as Record<string, unknown>;
  }

  private asObjectArray(value: unknown): Array<Record<string, unknown>> {
    const array = this.asArray(value);
    return array.filter((entry): entry is Record<string, unknown> => !!entry && typeof entry === "object");
  }

  private asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
  }

  private asString(value: unknown, fallback = ""): string {
    return typeof value === "string" ? value : fallback;
  }

  private optionalString(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined;
  }

  private optionalStringArray(value: unknown): string[] | undefined {
    if (!Array.isArray(value)) return undefined;
    const parsed = value.filter((entry): entry is string => typeof entry === "string");
    return parsed.length > 0 ? parsed : undefined;
  }

  private optionalNumber(value: unknown): number | undefined {
    return typeof value === "number" ? value : undefined;
  }

  private asLogType(value: unknown): "info" | "error" | "success" | "warning" {
    if (value === "info" || value === "error" || value === "success" || value === "warning") {
      return value;
    }
    return "info";
  }

  private asEventType(value: unknown): RunnerLog["eventType"] {
    if (
      value === "user_message" ||
      value === "agent_message" ||
      value === "reasoning" ||
      value === "subagent_invocation" ||
      value === "command_execution" ||
      value === "mcp_tool_call" ||
      value === "mcp_log" ||
      value === "file_change" ||
      value === "todo_list" ||
      value === "action_summary" ||
      value === "setup" ||
      value === "startup" ||
      value === "turn_completed" ||
      value === "planning" ||
      value === "llm_response" ||
      value === "deep_research"
    ) {
      return value;
    }
    return undefined;
  }

  private asCommandStatus(value: unknown): "running" | "completed" | "failed" | "started" | "output" | undefined {
    if (value === "running" || value === "completed" || value === "failed" || value === "started" || value === "output") {
      return value;
    }
    return undefined;
  }

  private asChangeKind(value: unknown): "created" | "modified" | "deleted" | undefined {
    if (value === "created" || value === "modified" || value === "deleted") {
      return value;
    }
    return undefined;
  }

  private mergeMetadata(
    base: Record<string, unknown> | null,
    extras?: Record<string, unknown>
  ): RunnerLog["metadata"] | undefined {
    const merged = {
      ...(base || {}),
      ...(extras || {}),
    };
    return Object.keys(merged).length > 0 ? (merged as RunnerLog["metadata"]) : undefined;
  }
}
