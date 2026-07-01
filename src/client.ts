import { RunnerEventNormalizer } from "./normalize-event.js";
import { iterateSseData } from "./sse.js";
import {
  RawRunnerEvent,
  RunnerAgentRecord,
  RunnerApiRequestOptions,
  RunnerEnvironmentForkResult,
  RunnerEnvironmentSnapshotInitializeResult,
  RunnerEnvironmentSnapshot,
  RunnerEnvironmentSnapshotDiffResult,
  RunnerEnvironmentSnapshotFileResult,
  RunnerExecuteOptions,
  RunnerExecuteResult,
  RunnerGuardrailSet,
  RunnerGuardrailSetCreateInput,
  RunnerGuardrailSetUpdateInput,
  RunnerLog,
  RunnerRunRequest,
  RunnerThreadForkResult,
  RunnerThreadFileHistoryResult,
  RunnerThreadRevertResult,
  RunnerSnapshotFileEntry,
  RunnerThreadStep,
  RunnerThreadStepDiffResult,
  RunnerThreadStepFileResult,
} from "./types.js";

type FetchLike = typeof fetch;

export class RunnerClient {
  private readonly fetchImpl: FetchLike;

  constructor(fetchImpl: FetchLike = fetch) {
    // Browser `window.fetch` must be called with window/globalThis as context.
    // Bind only the global fetch reference to avoid changing custom fetch behavior.
    if (typeof globalThis.fetch === "function" && fetchImpl === globalThis.fetch) {
      this.fetchImpl = globalThis.fetch.bind(globalThis) as FetchLike;
    } else {
      this.fetchImpl = fetchImpl;
    }
  }

  async execute(options: RunnerExecuteOptions): Promise<RunnerExecuteResult> {
    const runRequest = await this.resolveRunRequest(options);
    const response = await this.fetchImpl(runRequest.url, {
      method: runRequest.method ?? "POST",
      headers: runRequest.headers,
      body: JSON.stringify(runRequest.body),
      credentials: runRequest.credentials,
      signal: options.signal,
    });

    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Runner stream failed"));
    }

    if (!response.body) {
      throw new Error("Runner stream response has no body");
    }

    const normalizer = new RunnerEventNormalizer();
    const startedAt = Date.now();
    let usage: RunnerExecuteResult["usage"];
    let cancelled = false;
    let streamError: Error | undefined;

    for await (const data of iterateSseData(response.body)) {
      if (!data || data === "[DONE]") continue;

      const event = this.parseEvent(data);
      if (!event) continue;

      if (event.type === "stream.keepalive") {
        continue;
      }

      options.onRawEvent?.(event);
      const handled = normalizer.handle(event);

      if (handled.setupComplete) {
        options.onSetupComplete?.();
      }

      if (handled.logs.length > 0) {
        for (const log of handled.logs) {
          options.onLog?.(log);
        }
      }

      if (handled.usage) {
        usage = handled.usage;
      }

      if (handled.cancelled) {
        cancelled = true;
      }

      if (handled.streamError) {
        streamError = handled.streamError;
      }

      if (event.type === "stream.completed") {
        break;
      }
    }

    const result: RunnerExecuteResult = {
      durationSeconds: Math.floor((Date.now() - startedAt) / 1000),
      usage,
      cancelled,
    };

    if (streamError && (options.throwOnError ?? true)) {
      throw streamError;
    }

    return result;
  }

  async listThreadSteps(
    options: RunnerApiRequestOptions & {
      threadId: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerThreadStep[]> {
    const search = new URLSearchParams();
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerThreadStep[] }>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getThreadLogs(
    options: RunnerApiRequestOptions & {
      threadId: string;
      compact?: boolean;
      includeConversation?: boolean;
    },
  ): Promise<RunnerLog[]> {
    const search = new URLSearchParams();
    if (options.compact) search.set("compact", "1");
    if (options.includeConversation === false) search.set("includeConversation", "0");
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/logs${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerLog[]; logs?: RunnerLog[] }>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.logs) ? payload.logs : Array.isArray(payload.data) ? payload.data : [];
  }

  async getThreadStepDiff(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      path?: string | null;
    },
  ): Promise<RunnerThreadStepDiffResult> {
    const search = new URLSearchParams();
    if (options.path) search.set("path", options.path);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/diff${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    return this.requestJson<RunnerThreadStepDiffResult>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listThreadStepFiles(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      prefix?: string | null;
    },
  ): Promise<RunnerSnapshotFileEntry[]> {
    const search = new URLSearchParams();
    if (options.prefix) search.set("prefix", options.prefix);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/files${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerSnapshotFileEntry[] }>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getThreadStepFile(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      path: string;
    },
  ): Promise<RunnerThreadStepFileResult> {
    const search = new URLSearchParams({ path: options.path });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/file?${search.toString()}`,
    );
    return this.requestJson<RunnerThreadStepFileResult>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listThreadFileHistory(
    options: RunnerApiRequestOptions & {
      threadId: string;
      path: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerThreadFileHistoryResult> {
    const search = new URLSearchParams({ path: options.path });
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/files/history?${search.toString()}`,
    );
    return this.requestJson<RunnerThreadFileHistoryResult>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async forkThreadFromStep(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      mode: "latest" | "historical";
      title?: string | null;
      environmentName?: string | null;
    },
  ): Promise<RunnerThreadForkResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/fork`,
    );
    return this.requestJson<RunnerThreadForkResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        mode: options.mode,
        title: options.title ?? undefined,
        environmentName: options.environmentName ?? undefined,
      }),
    });
  }

  async forkThreadFromMessage(
    options: RunnerApiRequestOptions & {
      threadId: string;
      truncateAtMessageIndex: number;
      title?: string | null;
      environmentName?: string | null;
      environmentTarget?: "existing_environment" | "new_forked_environment" | null;
      environmentStrategy?: "reuse_current" | "forked_environment" | null;
      targetEnvironmentId?: string | null;
      fileCopyMode?: "all" | "thread_only" | "none" | null;
    },
  ): Promise<RunnerThreadForkResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/copy`,
    );
    return this.requestJson<RunnerThreadForkResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        truncateAtMessageIndex: options.truncateAtMessageIndex,
        title: options.title ?? undefined,
        environmentName: options.environmentName ?? undefined,
        environmentTarget: options.environmentTarget ?? undefined,
        environmentStrategy: options.environmentStrategy ?? undefined,
        targetEnvironmentId: options.targetEnvironmentId ?? undefined,
        fileCopyMode: options.fileCopyMode ?? undefined,
      }),
    });
  }

  async revertThreadToStep(
    options: RunnerApiRequestOptions & {
      threadId: string;
      stepId: string;
      historyActionType?: "revert" | "reapply";
      revertedChangeStepId?: string;
      revertedFilePath?: string;
      revertedFileName?: string;
    },
  ): Promise<RunnerThreadRevertResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/threads/${encodeURIComponent(options.threadId)}/steps/${encodeURIComponent(options.stepId)}/revert`,
    );
    return this.requestJson<RunnerThreadRevertResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        historyActionType: options.historyActionType ?? undefined,
        revertedChangeStepId: options.revertedChangeStepId ?? undefined,
        revertedFilePath: options.revertedFilePath ?? undefined,
        revertedFileName: options.revertedFileName ?? undefined,
      }),
    });
  }

  async listEnvironmentSnapshots(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerEnvironmentSnapshot[]> {
    const search = new URLSearchParams();
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerEnvironmentSnapshot[] }>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getEnvironmentSnapshotDiff(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      path?: string | null;
    },
  ): Promise<RunnerEnvironmentSnapshotDiffResult> {
    const search = new URLSearchParams();
    if (options.path) search.set("path", options.path);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/diff${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    return this.requestJson<RunnerEnvironmentSnapshotDiffResult>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listEnvironmentSnapshotFiles(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      prefix?: string | null;
    },
  ): Promise<RunnerSnapshotFileEntry[]> {
    const search = new URLSearchParams();
    if (options.prefix) search.set("prefix", options.prefix);
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/files${search.size > 0 ? `?${search.toString()}` : ""}`,
    );
    const payload = await this.requestJson<{ data?: RunnerSnapshotFileEntry[] }>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return Array.isArray(payload.data) ? payload.data : [];
  }

  async getEnvironmentSnapshotFile(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      path: string;
    },
  ): Promise<RunnerEnvironmentSnapshotFileResult> {
    const search = new URLSearchParams({ path: options.path });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/file?${search.toString()}`,
    );
    return this.requestJson<RunnerEnvironmentSnapshotFileResult>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async initializeEnvironmentSnapshots(
    options: RunnerApiRequestOptions & {
      environmentId: string;
    },
  ): Promise<RunnerEnvironmentSnapshotInitializeResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/initialize`,
    );
    return this.requestJson<RunnerEnvironmentSnapshotInitializeResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
  }

  async forkEnvironmentFromSnapshot(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      snapshotId: string;
      name?: string | null;
      description?: string | null;
    },
  ): Promise<RunnerEnvironmentForkResult> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/snapshots/${encodeURIComponent(options.snapshotId)}/fork`,
    );
    return this.requestJson<RunnerEnvironmentForkResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        name: options.name ?? undefined,
        description: options.description ?? undefined,
      }),
    });
  }

  async listGuardrails(options: RunnerApiRequestOptions): Promise<RunnerGuardrailSet[]> {
    const url = this.buildApiUrl(options.backendUrl, "/guardrails");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerGuardrailSet>(payload, ["guardrails", "sets"]);
  }

  async getGuardrail(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(options.backendUrl, `/guardrails/${encodeURIComponent(options.guardrailId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async createGuardrail(
    options: RunnerApiRequestOptions & {
      guardrail: RunnerGuardrailSetCreateInput;
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(options.backendUrl, "/guardrails");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.guardrail),
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async updateGuardrail(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      guardrail: RunnerGuardrailSetUpdateInput;
    },
  ): Promise<RunnerGuardrailSet> {
    const url = this.buildApiUrl(options.backendUrl, `/guardrails/${encodeURIComponent(options.guardrailId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.guardrail),
    });
    return this.readObjectResponse<RunnerGuardrailSet>(payload, ["guardrail", "set"]);
  }

  async deleteGuardrail(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/guardrails/${encodeURIComponent(options.guardrailId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listAgentGuardrails(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerGuardrailSet[]> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/guardrails`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerGuardrailSet>(payload, ["guardrails", "sets"]);
  }

  async setAgentGuardrails(
    options: RunnerApiRequestOptions & {
      agentId: string;
      guardrailSetIds: string[];
      guardrails?: RunnerGuardrailSet[];
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/guardrails`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PUT",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        guardrailSetIds: options.guardrailSetIds,
        guardrail_set_ids: options.guardrailSetIds,
        ...(options.guardrails ? { guardrails: options.guardrails } : {}),
      }),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async addAgentGuardrail(
    options: RunnerApiRequestOptions & {
      agentId: string;
      guardrailId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/guardrails/${encodeURIComponent(options.guardrailId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PUT",
      headers: this.withJsonContentType(options.headers),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async removeAgentGuardrail(
    options: RunnerApiRequestOptions & {
      agentId: string;
      guardrailId: string;
    },
  ): Promise<RunnerAgentRecord | null> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/guardrails/${encodeURIComponent(options.guardrailId)}`,
    );
    const payload = await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: options.headers,
      credentials: options.credentials,
      signal: options.signal,
    });
    return payload ? this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]) : null;
  }

  private async resolveRunRequest(options: RunnerExecuteOptions): Promise<RunnerRunRequest> {
    let runRequest = options.run;
    if (!options.prepare) {
      return runRequest;
    }

    const prepareResponse = await this.fetchImpl(options.prepare.url, {
      method: options.prepare.method ?? "POST",
      headers: options.prepare.headers,
      body: JSON.stringify(options.prepare.body),
      credentials: options.prepare.credentials,
      signal: options.signal,
    });

    if (!prepareResponse.ok) {
      const bodyText = await prepareResponse.text().catch(() => "");
      throw new Error(`Runner prepare failed (${prepareResponse.status}): ${bodyText || prepareResponse.statusText}`);
    }

    const preparePayload = (await prepareResponse.json().catch(() => ({}))) as unknown;
    const setupLogs = options.prepare.getSetupLogs?.(preparePayload) ?? this.defaultSetupLogs(preparePayload);
    for (const log of setupLogs) {
      options.onLog?.(log);
    }

    runRequest = options.prepare.buildRunRequest?.(preparePayload, runRequest) ?? this.defaultRunRequest(preparePayload, runRequest);
    return runRequest;
  }

  private defaultSetupLogs(payload: unknown): RunnerLog[] {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return [];
    const setupLogs = (payload as Record<string, unknown>).setupLogs;
    if (!Array.isArray(setupLogs)) return [];

    return setupLogs
      .map((entry): RunnerLog | null => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) return null;
        const log = entry as Record<string, unknown>;
        return {
          time: typeof log.time === "string" ? log.time : "00:00",
          message: typeof log.message === "string" ? log.message : "",
          type:
            log.type === "error" || log.type === "success" || log.type === "warning" || log.type === "info"
              ? log.type
              : "info",
          eventType:
            log.eventType === "setup" ||
            log.eventType === "startup" ||
            log.eventType === "planning" ||
            log.eventType === "agent_message" ||
            log.eventType === "reasoning" ||
            log.eventType === "command_execution" ||
            log.eventType === "mcp_tool_call" ||
            log.eventType === "file_change" ||
            log.eventType === "llm_response" ||
            log.eventType === "turn_completed" ||
            log.eventType === "deep_research" ||
            log.eventType === "permission_request"
              ? log.eventType
              : "setup",
        };
      })
      .filter((entry): entry is RunnerLog => Boolean(entry));
  }

  private defaultRunRequest(payload: unknown, currentRunRequest: RunnerRunRequest): RunnerRunRequest {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return currentRunRequest;
    const backendBody = (payload as Record<string, unknown>).backendBody;
    if (backendBody === undefined) return currentRunRequest;
    return { ...currentRunRequest, body: backendBody };
  }

  private parseEvent(data: string): RawRunnerEvent | null {
    try {
      const parsed = JSON.parse(data) as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
      const event = parsed as Record<string, unknown>;
      if (typeof event.type !== "string") return null;
      return event as RawRunnerEvent;
    } catch {
      return null;
    }
  }

  private buildApiUrl(baseUrl: string, path: string): string {
    const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${normalizedBaseUrl}${path}`;
  }

  private withJsonContentType(headers?: HeadersInit): HeadersInit {
    const normalized = new Headers(headers ?? {});
    if (!normalized.has("Content-Type")) {
      normalized.set("Content-Type", "application/json");
    }
    return normalized;
  }

  private async readResponseErrorMessage(response: Response, fallback: string): Promise<string> {
    const bodyText = await response.text().catch(() => "");
    let parsed: unknown = null;
    try {
      parsed = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      parsed = null;
    }

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const payload = parsed as Record<string, unknown>;
      if (typeof payload.message === "string" && payload.message.trim()) {
        return payload.message.trim();
      }
      if (typeof payload.error === "string" && payload.error.trim()) {
        return payload.error.trim();
      }
    }

    const trimmedBody = bodyText.trim();
    if (trimmedBody) {
      return trimmedBody;
    }

    return `${fallback} (${response.status || "unknown"}${response.statusText ? ` ${response.statusText}` : ""})`;
  }

  private async requestJson<T>(url: string, init: RequestInit): Promise<T> {
    const response = await this.fetchImpl(url, init);
    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Runner API request failed"));
    }
    return response.json() as Promise<T>;
  }

  private async requestJsonOrEmpty<T>(url: string, init: RequestInit): Promise<T | null> {
    const response = await this.fetchImpl(url, init);
    if (!response.ok) {
      throw new Error(await this.readResponseErrorMessage(response, "Runner API request failed"));
    }
    const text = await response.text().catch(() => "");
    if (!text.trim()) {
      return null;
    }
    return JSON.parse(text) as T;
  }

  private readListResponse<T>(payload: unknown, collectionKeys: string[] = []): T[] {
    if (Array.isArray(payload)) {
      return payload as T[];
    }
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return [];
    }
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.data)) {
      return record.data as T[];
    }
    if (Array.isArray(record.items)) {
      return record.items as T[];
    }
    for (const key of collectionKeys) {
      if (Array.isArray(record[key])) {
        return record[key] as T[];
      }
    }
    return [];
  }

  private readObjectResponse<T>(payload: unknown, objectKeys: string[] = []): T {
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      const record = payload as Record<string, unknown>;
      if (record.data && typeof record.data === "object" && !Array.isArray(record.data)) {
        return record.data as T;
      }
      for (const key of objectKeys) {
        if (record[key] && typeof record[key] === "object" && !Array.isArray(record[key])) {
          return record[key] as T;
        }
      }
    }
    return payload as T;
  }
}
