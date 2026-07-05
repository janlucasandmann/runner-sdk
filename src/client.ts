import { RunnerEventNormalizer } from "./normalize-event.js";
import { iterateSseData } from "./sse.js";
import {
  RawRunnerEvent,
  RunnerAgentCreateInput,
  RunnerAgentRecord,
  RunnerAgentUpdateInput,
  RunnerAgentVersion,
  RunnerAgentVersionCompareResult,
  RunnerAgentVersionCreateInput,
  RunnerAgentVersionUpdateInput,
  RunnerApiRequestOptions,
  RunnerVoiceAgentPhoneNumberInput,
  RunnerVoiceAgentRecord,
  RunnerVoiceAgentSessionCreateInput,
  RunnerVoiceAgentSessionCreateResult,
  RunnerVoiceSession,
  RunnerEnvironmentForkResult,
  RunnerEnvironmentSnapshotInitializeResult,
  RunnerEnvironmentSnapshot,
  RunnerEnvironmentSnapshotDiffResult,
  RunnerEnvironmentSnapshotFileResult,
  RunnerEnvironmentVersion,
  RunnerEnvironmentVersionCompareResult,
  RunnerEnvironmentVersionCreateInput,
  RunnerEnvironmentVersionUpdateInput,
  RunnerEvaluationRun,
  RunnerEvaluationRunCreateInput,
  RunnerEvaluationSet,
  RunnerEvaluationSetCreateInput,
  RunnerEvaluationSetUpdateInput,
  RunnerEvaluationVersion,
  RunnerEvaluationVersionCompareResult,
  RunnerEvaluationVersionCreateInput,
  RunnerEvaluationVersionUpdateInput,
  RunnerExecuteOptions,
  RunnerExecuteResult,
  RunnerFineTuningJob,
  RunnerFineTuningJobCreateInput,
  RunnerGuardrailSet,
  RunnerGuardrailSetCreateInput,
  RunnerGuardrailSetUpdateInput,
  RunnerGuardrailVersion,
  RunnerGuardrailVersionCompareResult,
  RunnerGuardrailVersionCreateInput,
  RunnerGuardrailVersionUpdateInput,
  RunnerLog,
  RunnerMetronomeVersion,
  RunnerMetronomeVersionCompareResult,
  RunnerMetronomeVersionCreateInput,
  RunnerMetronomeVersionUpdateInput,
  RunnerRunRequest,
  RunnerServerVersion,
  RunnerServerVersionCompareResult,
  RunnerServerVersionCreateInput,
  RunnerServerVersionUpdateInput,
  RunnerThreadForkResult,
  RunnerThreadFileHistoryResult,
  RunnerThreadRevertResult,
  RunnerSnapshotFileEntry,
  RunnerThreadStep,
  RunnerThreadStepDiffResult,
  RunnerThreadStepFileResult,
} from "./types.js";

type FetchLike = typeof fetch;

const ORGANIZATION_HEADER = "x-computer-agents-organization";

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
      headers: this.withOrganizationHeader(runRequest.headers, runRequest.organizationId ?? options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        name: options.name ?? undefined,
        description: options.description ?? undefined,
      }),
    });
  }

  async listEnvironmentVersions(
    options: RunnerApiRequestOptions & {
      environmentId: string;
    },
  ): Promise<RunnerEnvironmentVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `/environments/${encodeURIComponent(options.environmentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerEnvironmentVersion>(payload, ["versions", "environmentVersions", "environment_versions", "computerVersions", "computer_versions"]);
  }

  async getEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<RunnerEnvironmentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
  }

  async createEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      version: RunnerEnvironmentVersionCreateInput;
    },
  ): Promise<RunnerEnvironmentVersion> {
    const url = this.buildApiUrl(options.backendUrl, `/environments/${encodeURIComponent(options.environmentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
  }

  async updateEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
      version: RunnerEnvironmentVersionUpdateInput;
    },
  ): Promise<RunnerEnvironmentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerEnvironmentVersion>(payload, ["version", "environmentVersion", "environment_version", "computerVersion", "computer_version"]);
  }

  async deleteEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async publishEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
      snapshot?: RunnerEnvironmentVersionCreateInput["snapshot"];
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["environment", "computer"]);
  }

  async unpublishEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}/unpublish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["environment", "computer"]);
  }

  async restoreEnvironmentVersion(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/${encodeURIComponent(options.versionId)}/restore`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["environment", "computer"]);
  }

  async compareEnvironmentVersions(
    options: RunnerApiRequestOptions & {
      environmentId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerEnvironmentVersionCompareResult> {
    const search = new URLSearchParams({
      baseVersionId: options.baseVersionId,
      targetVersionId: options.targetVersionId,
    });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/environments/${encodeURIComponent(options.environmentId)}/versions/compare?${search.toString()}`,
    );
    return this.requestJson<RunnerEnvironmentVersionCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listServerVersions(
    options: RunnerApiRequestOptions & {
      serverId: string;
    },
  ): Promise<RunnerServerVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `/servers/${encodeURIComponent(options.serverId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerServerVersion>(payload, ["versions", "serverVersions", "server_versions"]);
  }

  async getServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<RunnerServerVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
  }

  async createServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      version: RunnerServerVersionCreateInput;
    },
  ): Promise<RunnerServerVersion> {
    const url = this.buildApiUrl(options.backendUrl, `/servers/${encodeURIComponent(options.serverId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
  }

  async updateServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
      version: RunnerServerVersionUpdateInput;
    },
  ): Promise<RunnerServerVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerServerVersion>(payload, ["version", "serverVersion", "server_version"]);
  }

  async deleteServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async publishServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
      snapshot?: RunnerServerVersionCreateInput["snapshot"];
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["server"]);
  }

  async unpublishServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}/unpublish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["server"]);
  }

  async restoreServerVersion(
    options: RunnerApiRequestOptions & {
      serverId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/${encodeURIComponent(options.versionId)}/restore`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<Record<string, unknown>>(payload, ["server"]);
  }

  async compareServerVersions(
    options: RunnerApiRequestOptions & {
      serverId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerServerVersionCompareResult> {
    const search = new URLSearchParams({
      baseVersionId: options.baseVersionId,
      targetVersionId: options.targetVersionId,
    });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/servers/${encodeURIComponent(options.serverId)}/versions/compare?${search.toString()}`,
    );
    return this.requestJson<RunnerServerVersionCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listAgents(options: RunnerApiRequestOptions): Promise<RunnerAgentRecord[]> {
    const url = this.buildApiUrl(options.backendUrl, "/agents");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerAgentRecord>(payload, ["agents"]);
  }

  async getAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async createAgent(
    options: RunnerApiRequestOptions & {
      agent: RunnerAgentCreateInput;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, "/agents");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.agent),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async updateAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
      agent: RunnerAgentUpdateInput;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.agent),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async deleteAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listVoiceAgents(options: RunnerApiRequestOptions): Promise<RunnerVoiceAgentRecord[]> {
    const url = this.buildApiUrl(options.backendUrl, "/voice-agents");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerVoiceAgentRecord>(payload, ["voiceAgents", "voice_agents"]);
  }

  async getVoiceAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async updateVoiceAgent(
    options: RunnerApiRequestOptions & {
      agentId: string;
      voice: RunnerAgentUpdateInput;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.voice),
    });
  }

  async provisionVoiceAgentPhoneNumber(
    options: RunnerApiRequestOptions & {
      agentId: string;
      phoneNumber?: RunnerVoiceAgentPhoneNumberInput;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}/phone-number`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.phoneNumber || {}),
    });
  }

  async disableVoiceAgentPhoneNumber(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerVoiceAgentRecord> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}/phone-number`);
    return this.requestJson<RunnerVoiceAgentRecord>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async createVoiceAgentSession(
    options: RunnerApiRequestOptions & {
      agentId: string;
      session?: RunnerVoiceAgentSessionCreateInput;
    },
  ): Promise<RunnerVoiceAgentSessionCreateResult> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/agents/${encodeURIComponent(options.agentId)}/sessions`);
    return this.requestJson<RunnerVoiceAgentSessionCreateResult>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.session || {}),
    });
  }

  async appendVoiceAgentSessionMessage(
    options: RunnerApiRequestOptions & {
      sessionId: string;
      role: "user" | "assistant";
      content: string;
      event?: Record<string, unknown> | null;
    },
  ): Promise<{ created: boolean }> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/sessions/${encodeURIComponent(options.sessionId)}/messages`);
    return this.requestJson<{ created: boolean }>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({ role: options.role, content: options.content, event: options.event || null }),
    });
  }

  async endVoiceAgentSession(
    options: RunnerApiRequestOptions & {
      sessionId: string;
    },
  ): Promise<RunnerVoiceSession> {
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/sessions/${encodeURIComponent(options.sessionId)}/end`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerVoiceSession>(payload, ["voiceSession", "voice_session"]);
  }

  async listVoiceAgentSessions(
    options: RunnerApiRequestOptions & {
      agentId?: string;
      threadId?: string;
      channel?: "web" | "phone";
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerVoiceSession[]> {
    const search = new URLSearchParams();
    if (options.agentId) search.set("agentId", options.agentId);
    if (options.threadId) search.set("threadId", options.threadId);
    if (options.channel) search.set("channel", options.channel);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const suffix = search.toString() ? `?${search.toString()}` : "";
    const url = this.buildApiUrl(options.backendUrl, `/voice-agents/sessions${suffix}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerVoiceSession>(payload, ["voiceSessions", "voice_sessions"]);
  }

  async listAgentVersions(
    options: RunnerApiRequestOptions & {
      agentId: string;
    },
  ): Promise<RunnerAgentVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerAgentVersion>(payload, ["versions", "agentVersions", "agent_versions"]);
  }

  async getAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<RunnerAgentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerAgentVersion>(payload, ["version", "agentVersion", "agent_version"]);
  }

  async createAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      version: RunnerAgentVersionCreateInput;
    },
  ): Promise<RunnerAgentVersion> {
    const url = this.buildApiUrl(options.backendUrl, `/agents/${encodeURIComponent(options.agentId)}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerAgentVersion>(payload, ["version", "agentVersion", "agent_version"]);
  }

  async updateAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
      version: RunnerAgentVersionUpdateInput;
    },
  ): Promise<RunnerAgentVersion> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.version),
    });
    return this.readObjectResponse<RunnerAgentVersion>(payload, ["version", "agentVersion", "agent_version"]);
  }

  async deleteAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}`,
    );
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async publishAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
      snapshot?: RunnerAgentVersionCreateInput["snapshot"];
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}/publish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.snapshot !== undefined ? { snapshot: options.snapshot } : {}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async unpublishAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}/unpublish`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async restoreAgentVersion(
    options: RunnerApiRequestOptions & {
      agentId: string;
      versionId: string;
    },
  ): Promise<RunnerAgentRecord> {
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/${encodeURIComponent(options.versionId)}/restore`,
    );
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]);
  }

  async compareAgentVersions(
    options: RunnerApiRequestOptions & {
      agentId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerAgentVersionCompareResult> {
    const search = new URLSearchParams({
      baseVersionId: options.baseVersionId,
      targetVersionId: options.targetVersionId,
    });
    const url = this.buildApiUrl(
      options.backendUrl,
      `/agents/${encodeURIComponent(options.agentId)}/versions/compare?${search.toString()}`,
    );
    return this.requestJson<RunnerAgentVersionCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listGuardrails(options: RunnerApiRequestOptions): Promise<RunnerGuardrailSet[]> {
    const url = this.buildApiUrl(options.backendUrl, "/guardrails");
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withJsonContentType(options.headers, options.organizationId),
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
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return payload ? this.readObjectResponse<RunnerAgentRecord>(payload, ["agent"]) : null;
  }

  async listGuardrailVersions(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
    },
  ): Promise<RunnerGuardrailVersion[]> {
    return this.listResourceVersions<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      ["versions", "guardrailVersions", "guardrail_versions"],
    );
  }

  async getGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<RunnerGuardrailVersion> {
    return this.getResourceVersion<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      ["version", "guardrailVersion", "guardrail_version"],
    );
  }

  async createGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      version: RunnerGuardrailVersionCreateInput;
    },
  ): Promise<RunnerGuardrailVersion> {
    return this.createResourceVersion<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.version,
      ["version", "guardrailVersion", "guardrail_version"],
    );
  }

  async updateGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
      version: RunnerGuardrailVersionUpdateInput;
    },
  ): Promise<RunnerGuardrailVersion> {
    return this.updateResourceVersion<RunnerGuardrailVersion>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      options.version,
      ["version", "guardrailVersion", "guardrail_version"],
    );
  }

  async deleteGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<void> {
    await this.deleteResourceVersion(options, `/guardrails/${encodeURIComponent(options.guardrailId)}`, options.versionId);
  }

  async publishGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
      snapshot?: RunnerGuardrailVersionCreateInput["snapshot"];
    },
  ): Promise<RunnerGuardrailSet> {
    return this.actionResourceVersion<RunnerGuardrailSet>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      "publish",
      ["guardrail", "set"],
    );
  }

  async unpublishGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<RunnerGuardrailSet> {
    return this.actionResourceVersion<RunnerGuardrailSet>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      "unpublish",
      ["guardrail", "set"],
    );
  }

  async restoreGuardrailVersion(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      versionId: string;
    },
  ): Promise<RunnerGuardrailSet> {
    return this.actionResourceVersion<RunnerGuardrailSet>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.versionId,
      "restore",
      ["guardrail", "set"],
    );
  }

  async compareGuardrailVersions(
    options: RunnerApiRequestOptions & {
      guardrailId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerGuardrailVersionCompareResult> {
    return this.compareResourceVersions<RunnerGuardrailVersionCompareResult>(
      options,
      `/guardrails/${encodeURIComponent(options.guardrailId)}`,
      options.baseVersionId,
      options.targetVersionId,
    );
  }

  async listEvaluations(
    options: RunnerApiRequestOptions & {
      q?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerEvaluationSet[]> {
    const search = new URLSearchParams();
    if (options.q) search.set("q", options.q);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/evaluations${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerEvaluationSet>(payload, ["evaluations", "sets"]);
  }

  async getEvaluation(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
    },
  ): Promise<RunnerEvaluationSet> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(options.evaluationId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerEvaluationSet>(payload, ["evaluation", "set"]);
  }

  async createEvaluation(
    options: RunnerApiRequestOptions & {
      evaluation: RunnerEvaluationSetCreateInput;
    },
  ): Promise<RunnerEvaluationSet> {
    const url = this.buildApiUrl(options.backendUrl, "/evaluations");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.evaluation),
    });
    return this.readObjectResponse<RunnerEvaluationSet>(payload, ["evaluation", "set"]);
  }

  async updateEvaluation(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      evaluation: RunnerEvaluationSetUpdateInput;
    },
  ): Promise<RunnerEvaluationSet> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(options.evaluationId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(options.evaluation),
    });
    return this.readObjectResponse<RunnerEvaluationSet>(payload, ["evaluation", "set"]);
  }

  async deleteEvaluation(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(options.evaluationId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async runEvaluation(
    options: RunnerApiRequestOptions & {
      run: RunnerEvaluationRunCreateInput;
    },
  ): Promise<RunnerEvaluationRun> {
    const { evaluationId, computerId, environmentId, ...run } = options.run;
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/${encodeURIComponent(evaluationId)}/runs`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...run,
        environmentId: environmentId ?? computerId,
      }),
    });
    return this.readObjectResponse<RunnerEvaluationRun>(payload, ["run"]);
  }

  async listEvaluationRuns(
    options: RunnerApiRequestOptions & {
      evaluationId?: string;
      agentId?: string;
      status?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerEvaluationRun[]> {
    const search = new URLSearchParams();
    if (options.evaluationId) search.set("evaluationId", options.evaluationId);
    if (options.agentId) search.set("agentId", options.agentId);
    if (options.status) search.set("status", options.status);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/runs${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerEvaluationRun>(payload, ["runs"]);
  }

  async getEvaluationRun(
    options: RunnerApiRequestOptions & {
      runId: string;
    },
  ): Promise<RunnerEvaluationRun> {
    const url = this.buildApiUrl(options.backendUrl, `/evaluations/runs/${encodeURIComponent(options.runId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerEvaluationRun>(payload, ["run"]);
  }

  async listEvaluationVersions(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
    },
  ): Promise<RunnerEvaluationVersion[]> {
    return this.listResourceVersions<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      ["versions", "evaluationVersions", "evaluation_versions"],
    );
  }

  async getEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<RunnerEvaluationVersion> {
    return this.getResourceVersion<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      ["version", "evaluationVersion", "evaluation_version"],
    );
  }

  async createEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      version: RunnerEvaluationVersionCreateInput;
    },
  ): Promise<RunnerEvaluationVersion> {
    return this.createResourceVersion<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.version,
      ["version", "evaluationVersion", "evaluation_version"],
    );
  }

  async updateEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
      version: RunnerEvaluationVersionUpdateInput;
    },
  ): Promise<RunnerEvaluationVersion> {
    return this.updateResourceVersion<RunnerEvaluationVersion>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      options.version,
      ["version", "evaluationVersion", "evaluation_version"],
    );
  }

  async deleteEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<void> {
    await this.deleteResourceVersion(options, `/evaluations/${encodeURIComponent(options.evaluationId)}`, options.versionId);
  }

  async publishEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
      snapshot?: RunnerEvaluationVersionCreateInput["snapshot"];
    },
  ): Promise<RunnerEvaluationSet> {
    return this.actionResourceVersion<RunnerEvaluationSet>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      "publish",
      ["evaluation", "set"],
    );
  }

  async unpublishEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<RunnerEvaluationSet> {
    return this.actionResourceVersion<RunnerEvaluationSet>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      "unpublish",
      ["evaluation", "set"],
    );
  }

  async restoreEvaluationVersion(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      versionId: string;
    },
  ): Promise<RunnerEvaluationSet> {
    return this.actionResourceVersion<RunnerEvaluationSet>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.versionId,
      "restore",
      ["evaluation", "set"],
    );
  }

  async compareEvaluationVersions(
    options: RunnerApiRequestOptions & {
      evaluationId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerEvaluationVersionCompareResult> {
    return this.compareResourceVersions<RunnerEvaluationVersionCompareResult>(
      options,
      `/evaluations/${encodeURIComponent(options.evaluationId)}`,
      options.baseVersionId,
      options.targetVersionId,
    );
  }

  async listFineTuningJobs(
    options: RunnerApiRequestOptions & {
      agentId?: string;
      evaluationSetId?: string;
      status?: string;
      q?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<RunnerFineTuningJob[]> {
    const search = new URLSearchParams();
    if (options.agentId) search.set("agentId", options.agentId);
    if (options.evaluationSetId) search.set("evaluationSetId", options.evaluationSetId);
    if (options.status) search.set("status", options.status);
    if (options.q) search.set("q", options.q);
    if (options.limit !== undefined) search.set("limit", String(options.limit));
    if (options.offset !== undefined) search.set("offset", String(options.offset));
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs${search.size > 0 ? `?${search.toString()}` : ""}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<RunnerFineTuningJob>(payload, ["jobs"]);
  }

  async getFineTuningJob(
    options: RunnerApiRequestOptions & {
      jobId: string;
    },
  ): Promise<RunnerFineTuningJob> {
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs/${encodeURIComponent(options.jobId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<RunnerFineTuningJob>(payload, ["job"]);
  }

  async createFineTuningJob(
    options: RunnerApiRequestOptions & {
      job: RunnerFineTuningJobCreateInput;
    },
  ): Promise<RunnerFineTuningJob> {
    const { computerId, environmentId, ...job } = options.job;
    const url = this.buildApiUrl(options.backendUrl, "/fine-tuning/jobs");
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({
        ...job,
        environmentId: environmentId ?? computerId,
      }),
    });
    return this.readObjectResponse<RunnerFineTuningJob>(payload, ["job"]);
  }

  async cancelFineTuningJob(
    options: RunnerApiRequestOptions & {
      jobId: string;
    },
  ): Promise<RunnerFineTuningJob> {
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs/${encodeURIComponent(options.jobId)}/cancel`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify({}),
    });
    return this.readObjectResponse<RunnerFineTuningJob>(payload, ["job"]);
  }

  async deleteFineTuningJob(
    options: RunnerApiRequestOptions & {
      jobId: string;
    },
  ): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `/fine-tuning/jobs/${encodeURIComponent(options.jobId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  async listMetronomeVersions(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
    },
  ): Promise<RunnerMetronomeVersion[]> {
    return this.listResourceVersions<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      ["versions", "metronomeVersions", "metronome_versions", "workflowVersions", "workflow_versions"],
    );
  }

  async getMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<RunnerMetronomeVersion> {
    return this.getResourceVersion<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      ["version", "metronomeVersion", "metronome_version", "workflowVersion", "workflow_version"],
    );
  }

  async createMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      version: RunnerMetronomeVersionCreateInput;
    },
  ): Promise<RunnerMetronomeVersion> {
    return this.createResourceVersion<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.version,
      ["version", "metronomeVersion", "metronome_version", "workflowVersion", "workflow_version"],
    );
  }

  async updateMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
      version: RunnerMetronomeVersionUpdateInput;
    },
  ): Promise<RunnerMetronomeVersion> {
    return this.updateResourceVersion<RunnerMetronomeVersion>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      options.version,
      ["version", "metronomeVersion", "metronome_version", "workflowVersion", "workflow_version"],
    );
  }

  async deleteMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<void> {
    await this.deleteResourceVersion(options, `/metronomes/${encodeURIComponent(options.metronomeId)}`, options.versionId);
  }

  async publishMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
      snapshot?: RunnerMetronomeVersionCreateInput["snapshot"];
    },
  ): Promise<Record<string, unknown>> {
    return this.actionResourceVersion<Record<string, unknown>>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      "publish",
      ["metronome", "workflow"],
    );
  }

  async unpublishMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    return this.actionResourceVersion<Record<string, unknown>>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      "unpublish",
      ["metronome", "workflow"],
    );
  }

  async restoreMetronomeVersion(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      versionId: string;
    },
  ): Promise<Record<string, unknown>> {
    return this.actionResourceVersion<Record<string, unknown>>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.versionId,
      "restore",
      ["metronome", "workflow"],
    );
  }

  async compareMetronomeVersions(
    options: RunnerApiRequestOptions & {
      metronomeId: string;
      baseVersionId: string;
      targetVersionId: string;
    },
  ): Promise<RunnerMetronomeVersionCompareResult> {
    return this.compareResourceVersions<RunnerMetronomeVersionCompareResult>(
      options,
      `/metronomes/${encodeURIComponent(options.metronomeId)}`,
      options.baseVersionId,
      options.targetVersionId,
    );
  }

  private async listResourceVersions<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    collectionKeys: string[],
  ): Promise<TVersion[]> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readListResponse<TVersion>(payload, collectionKeys);
  }

  private async getResourceVersion<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    versionId: string,
    objectKeys: string[],
  ): Promise<TVersion> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
    return this.readObjectResponse<TVersion>(payload, objectKeys);
  }

  private async createResourceVersion<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    version: Record<string, unknown>,
    objectKeys: string[],
  ): Promise<TVersion> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions`);
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(version),
    });
    return this.readObjectResponse<TVersion>(payload, objectKeys);
  }

  private async updateResourceVersion<TVersion>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    versionId: string,
    version: Record<string, unknown>,
    objectKeys: string[],
  ): Promise<TVersion> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}`);
    const payload = await this.requestJson<unknown>(url, {
      method: "PATCH",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(version),
    });
    return this.readObjectResponse<TVersion>(payload, objectKeys);
  }

  private async deleteResourceVersion(options: RunnerApiRequestOptions, resourcePath: string, versionId: string): Promise<void> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}`);
    await this.requestJsonOrEmpty<unknown>(url, {
      method: "DELETE",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  private async actionResourceVersion<TResource>(
    options: RunnerApiRequestOptions & {
      snapshot?: unknown;
    },
    resourcePath: string,
    versionId: string,
    action: "publish" | "unpublish" | "restore",
    objectKeys: string[],
  ): Promise<TResource> {
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/${encodeURIComponent(versionId)}/${action}`);
    const body = action === "publish" && options.snapshot !== undefined
      ? { snapshot: options.snapshot }
      : {};
    const payload = await this.requestJson<unknown>(url, {
      method: "POST",
      headers: this.withJsonContentType(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
      body: JSON.stringify(body),
    });
    return this.readObjectResponse<TResource>(payload, objectKeys);
  }

  private async compareResourceVersions<TCompareResult>(
    options: RunnerApiRequestOptions,
    resourcePath: string,
    baseVersionId: string,
    targetVersionId: string,
  ): Promise<TCompareResult> {
    const search = new URLSearchParams({
      baseVersionId,
      targetVersionId,
    });
    const url = this.buildApiUrl(options.backendUrl, `${resourcePath}/versions/compare?${search.toString()}`);
    return this.requestJson<TCompareResult>(url, {
      method: "GET",
      headers: this.withOrganizationHeader(options.headers, options.organizationId),
      credentials: options.credentials,
      signal: options.signal,
    });
  }

  private async resolveRunRequest(options: RunnerExecuteOptions): Promise<RunnerRunRequest> {
    let runRequest = options.run;
    if (!options.prepare) {
      return runRequest;
    }

    const prepareResponse = await this.fetchImpl(options.prepare.url, {
      method: options.prepare.method ?? "POST",
      headers: this.withOrganizationHeader(options.prepare.headers, options.prepare.organizationId ?? options.organizationId),
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

  private withOrganizationHeader(headers?: HeadersInit, organizationId?: string | null): Headers {
    const normalized = new Headers(headers ?? {});
    const safeOrganizationId = typeof organizationId === "string" ? organizationId.trim() : "";
    if (safeOrganizationId && !normalized.has(ORGANIZATION_HEADER)) {
      normalized.set(ORGANIZATION_HEADER, safeOrganizationId);
    }
    return normalized;
  }

  private withJsonContentType(headers?: HeadersInit, organizationId?: string | null): HeadersInit {
    const normalized = this.withOrganizationHeader(headers, organizationId);
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
