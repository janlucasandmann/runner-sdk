export interface MetronomeManualRunApiOptions {
  baseUrl?: string;
  requestHeaders?: Readonly<Record<string, string>>;
  signal?: AbortSignal;
  transientRetryCount?: number;
  transientRetryDelayMs?: number;
}

export interface MetronomeManualRunContext {
  workflow: Record<string, unknown>;
  definition: Record<string, unknown>;
  versionId: string;
  nodes: readonly unknown[];
  edges: readonly unknown[];
  functionOptions: readonly { id: string; name: string; kind?: string }[];
  webAppOptions: readonly { id: string; name: string; kind?: string }[];
  databaseOptions: readonly { id: string; name: string; kind?: string }[];
  authOptions: readonly { id: string; name: string; kind?: string }[];
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") continue;
    const normalized = String(value).trim();
    if (normalized) return normalized;
  }
  return "";
}

function readResourceList(payload: unknown, keys: readonly string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  const source = asRecord(payload);
  const data = asRecord(source.data);
  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
    if (Array.isArray(data[key])) return data[key] as unknown[];
  }
  for (const candidate of [source.data, source.items, source.records]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

async function readResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (response.ok) return payload;
  const source = asRecord(payload);
  const message =
    readString(source.message, source.error, source.detail) ||
    (typeof payload === "string" ? payload : "") ||
    `Platform API request failed (${response.status}).`;
  throw new Error(message);
}

const TRANSIENT_RESPONSE_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

function abortReason(signal: AbortSignal | null | undefined): unknown {
  if (!signal?.aborted) return null;
  return signal.reason || new DOMException("The request was aborted.", "AbortError");
}

function waitForRetry(delayMs: number, signal?: AbortSignal): Promise<void> {
  const reason = abortReason(signal);
  if (reason) return Promise.reject(reason);
  return new Promise((resolve, reject) => {
    const timeoutId = globalThis.setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, Math.max(0, delayMs));
    const handleAbort = () => {
      globalThis.clearTimeout(timeoutId);
      reject(abortReason(signal));
    };
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

async function fetchManualRunResource(
  input: string,
  init: RequestInit,
  options: MetronomeManualRunApiOptions,
): Promise<Response> {
  const retryCount = Math.max(0, Math.min(3, Number(options.transientRetryCount ?? 2) || 0));
  const retryDelayMs = Math.max(0, Number(options.transientRetryDelayMs ?? 140) || 0);
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    const reason = abortReason(options.signal);
    if (reason) throw reason;
    try {
      const response = await fetch(input, { ...init, signal: options.signal });
      if (!TRANSIENT_RESPONSE_STATUSES.has(response.status) || attempt === retryCount) {
        return response;
      }
      lastError = new Error(`Platform API request failed (${response.status}).`);
      void response.body?.cancel().catch(() => undefined);
    } catch (error) {
      if (abortReason(options.signal)) throw error;
      lastError = error;
      if (attempt === retryCount) throw error;
    }
    await waitForRetry(retryDelayMs * (attempt + 1), options.signal);
  }

  throw lastError || new Error("Workflow inputs could not be loaded.");
}

function readVersionDefinition(rawVersion: unknown): {
  versionId: string;
  definition: Record<string, unknown>;
  nodes: unknown[];
  edges: unknown[];
} {
  const source = asRecord(rawVersion);
  const snapshot = asRecord(source.snapshot);
  const directDefinition = asRecord(source.definition);
  const snapshotDefinition = asRecord(snapshot.definition);
  const definition = Object.keys(directDefinition).length
    ? directDefinition
    : Object.keys(snapshotDefinition).length
      ? snapshotDefinition
      : snapshot;
  const nodes = Array.isArray(source.nodes)
    ? source.nodes
    : Array.isArray(definition.nodes)
      ? definition.nodes
      : Array.isArray(snapshot.nodes)
        ? snapshot.nodes
        : [];
  const edges = Array.isArray(source.edges)
    ? source.edges
    : Array.isArray(definition.edges)
      ? definition.edges
      : Array.isArray(snapshot.edges)
        ? snapshot.edges
        : [];
  return {
    versionId: readString(source.id, source.versionId, source.version_id),
    definition: { ...definition, nodes, edges },
    nodes,
    edges,
  };
}

function normalizedServerKind(rawServer: unknown): string {
  const source = asRecord(rawServer);
  const metadata = asRecord(source.metadata);
  const config = asRecord(source.config);
  const details = asRecord(source.details);
  return (
    [
      source.kind,
      source.type,
      source.serverKind,
      source.server_kind,
      source.resourceKind,
      source.resource_kind,
      source.resourceType,
      source.resource_type,
      source.category,
      source.subtype,
      metadata.kind,
      metadata.type,
      metadata.category,
      metadata.subtype,
      metadata.runtime,
      config.kind,
      config.type,
      config.category,
      config.subtype,
      config.runtime,
      details.kind,
      details.type,
      details.category,
      details.subtype,
      details.runtime,
    ]
      .map((value) =>
        String(value || "")
          .trim()
          .toLowerCase()
          .replace(/[-\s]+/g, "_"),
      )
      .find(Boolean) || ""
  );
}

function classifyServer(rawServer: unknown): "function" | "web_app" | "database" | "auth" | "" {
  const source = asRecord(rawServer);
  const kind = normalizedServerKind(rawServer);
  const searchable = [kind, source.id, source.name, source.title]
    .map((value) => String(value || "").toLowerCase())
    .join(" ");
  if (/\b(auth|authentication|identity|user_auth)\b/.test(searchable) || kind.endsWith("_auth")) {
    return "auth";
  }
  if (
    /\b(database|databases|postgres|postgresql|document_database|sql_database)\b/.test(
      searchable,
    ) || kind.endsWith("_database")
  ) {
    return "database";
  }
  if (
    /\b(web_app|webapp|website|static_site|hosted_app|frontend)\b/.test(searchable) ||
    kind.endsWith("_web_app")
  ) {
    return "web_app";
  }
  if (
    /\b(function|functions|cloud_function|edge_function|nodejs|javascript|typescript)\b/.test(
      searchable,
    ) ||
    kind.endsWith("_function") ||
    String(source.id || "").startsWith("fn_")
  ) {
    return "function";
  }
  return "";
}

function normalizeServerOptions(payload: unknown) {
  const buckets = {
    functionOptions: [] as Array<{ id: string; name: string; kind?: string }>,
    webAppOptions: [] as Array<{ id: string; name: string; kind?: string }>,
    databaseOptions: [] as Array<{ id: string; name: string; kind?: string }>,
    authOptions: [] as Array<{ id: string; name: string; kind?: string }>,
  };
  readResourceList(payload, ["servers", "items", "resources"]).forEach((rawServer) => {
    const source = asRecord(rawServer);
    const id = readString(source.id, source.serverId, source.server_id);
    if (!id) return;
    const item = {
      id,
      name: readString(source.name, source.title, source.label, id),
      kind: normalizedServerKind(rawServer),
    };
    const classification = classifyServer(rawServer);
    if (classification === "function") buckets.functionOptions.push(item);
    else if (classification === "web_app") buckets.webAppOptions.push(item);
    else if (classification === "database") buckets.databaseOptions.push(item);
    else if (classification === "auth") buckets.authOptions.push(item);
  });
  Object.values(buckets).forEach((items) => {
    items.sort((left, right) => left.name.localeCompare(right.name));
  });
  return buckets;
}

/**
 * Load the immutable executable Workflow snapshot and the resource options its
 * trigger contract may reference. Calendar, Batches, and manual-run surfaces
 * intentionally share this single resolver.
 */
export async function loadMetronomeManualRunContext(
  metronomeId: string,
  versionId: string | null | undefined,
  options: MetronomeManualRunApiOptions = {},
): Promise<MetronomeManualRunContext> {
  const normalizedMetronomeId = String(metronomeId || "").trim();
  const normalizedVersionId = String(versionId || "").trim();
  if (!normalizedMetronomeId) throw new Error("Select a Workflow first.");
  const baseUrl = String(options.baseUrl || "/api/real").replace(/\/+$/, "");
  const headers = { ...(options.requestHeaders || {}) };
  const versionsPath = `/metronomes/${encodeURIComponent(normalizedMetronomeId)}/versions`;
  let versionResponse: Response;
  let serversResult: unknown;
  try {
    [versionResponse, serversResult] = await Promise.all([
      fetchManualRunResource(`${baseUrl}${versionsPath}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers,
      }, options),
      fetchManualRunResource(`${baseUrl}/servers`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers,
      }, {
        ...options,
        transientRetryCount: Math.min(1, Number(options.transientRetryCount ?? 1) || 0),
      })
        .then(readResponse)
        .catch(() => null),
    ]);
  } catch (error) {
    if (abortReason(options.signal)) throw error;
    throw new Error("Workflow inputs could not be loaded. Please try again.", { cause: error });
  }
  const versionPayload = await readResponse(versionResponse);
  const versions = readResourceList(versionPayload, [
    "versions",
    "metronomeVersions",
    "metronome_versions",
    "workflowVersions",
    "workflow_versions",
  ]);
  const rawVersion = normalizedVersionId
    ? versions.find((candidate) => {
        const source = asRecord(candidate);
        return readString(source.id, source.versionId, source.version_id) === normalizedVersionId;
      })
    : versions.find((candidate) => {
        const status = readString(asRecord(candidate).status).toLowerCase();
        return status === "active" || status === "published";
      }) || versions[0];
  if (normalizedVersionId && !rawVersion) {
    throw new Error("The pinned Workflow version is no longer available.");
  }
  if (!rawVersion) throw new Error("This Workflow does not have a published version.");
  const version = readVersionDefinition(rawVersion);
  if (!version.versionId && !normalizedVersionId) {
    throw new Error("The published Workflow version could not be resolved.");
  }
  return {
    workflow: {
      id: normalizedMetronomeId,
      name: readString(version.definition.name, `Workflow ${normalizedMetronomeId}`),
      definition: version.definition,
    },
    definition: version.definition,
    versionId: version.versionId || normalizedVersionId,
    nodes: version.nodes,
    edges: version.edges,
    ...normalizeServerOptions(serversResult),
  };
}
