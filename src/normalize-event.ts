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
                sourcesCount: this.optionalNumber(event.sourcesCount),
                sources: this.optionalStringArray(event.sources),
                elapsedSeconds: this.optionalNumber(event.elapsedSeconds),
                errorMessage: this.optionalString(event.errorMessage),
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
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.contentText(item.content),
            type: "info",
            eventType: "reasoning",
            isReasoning: true,
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
          },
        ],
      };
    }

    if (itemType === "tool_call") {
      return this.handleToolCall(item);
    }

    if (itemType === "file_change") {
      const changes = this.asObjectArray(item.changes);
      const filePaths = changes.map((change) => this.asString(change.path)).filter(Boolean);
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

  private handleToolCall(item: Record<string, unknown>): RunnerEventHandleResult {
    const tool = this.asObject(item.tool);
    if (!tool) return { logs: [] };

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
            metadata: {
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
            },
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
            message: this.asString(tool.command, "Read"),
            type: exitCode === 0 ? "success" : "error",
            eventType: "command_execution",
            metadata: {
              command: filePath ? `cat "${filePath}"` : this.asString(tool.command),
              exitCode,
              status: this.asCommandStatus(item.status),
              output: fileContent || output?.trim(),
            },
          },
        ],
      };
    }

    if (toolType === "command_execution" || toolType === "image_generation_skill") {
      const metadata = this.asObject(item.metadata);
      const isImageGeneration = toolType === "image_generation_skill" || Boolean(metadata?.isImageGeneration);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: this.asString(tool.command, "Unknown command"),
            type: this.optionalNumber(tool.exit_code) === 0 ? "success" : "error",
            eventType: "command_execution",
            metadata: {
              command: this.optionalString(tool.command),
              exitCode: this.optionalNumber(tool.exit_code),
              status: this.asCommandStatus(metadata?.status) ?? this.asCommandStatus(item.status),
              output: this.optionalString(tool.output)?.trim(),
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
            },
          },
        ],
      };
    }

    if (toolType === "mcp_tool") {
      const metadata = this.asObject(item.metadata);
      const status = this.asString(item.status);
      return {
        logs: [
          {
            time: this.formatElapsed(),
            message: `${this.asString(tool.server, "MCP")}.${this.asString(tool.name, "unknown")}`,
            type: status === "failed" ? "error" : "success",
            eventType: "mcp_tool_call",
            metadata: {
              serverName: this.optionalString(tool.server),
              toolName: this.optionalString(tool.name),
              status: this.asCommandStatus(item.status),
              durationMs: this.optionalNumber(metadata?.duration_ms),
              result: tool.output,
              error: tool.error,
              args: tool.arguments,
              savedImagePath: this.optionalString(metadata?.savedImagePath),
            },
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
}
