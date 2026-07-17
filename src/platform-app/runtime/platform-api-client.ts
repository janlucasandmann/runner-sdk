export type PlatformApiQueryValue =
  | string
  | number
  | boolean
  | null
  | undefined;

export interface PlatformApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Readonly<Record<string, PlatformApiQueryValue>>;
  headers?: HeadersInit;
  body?: unknown;
  signal?: AbortSignal;
}

export interface PlatformApiClient {
  request<T = unknown>(
    path: string,
    options?: PlatformApiRequestOptions,
  ): Promise<T>;
  get<T = unknown>(
    path: string,
    options?: Omit<PlatformApiRequestOptions, "body" | "method">,
  ): Promise<T>;
  post<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<PlatformApiRequestOptions, "body" | "method">,
  ): Promise<T>;
  put<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<PlatformApiRequestOptions, "body" | "method">,
  ): Promise<T>;
  patch<T = unknown>(
    path: string,
    body?: unknown,
    options?: Omit<PlatformApiRequestOptions, "body" | "method">,
  ): Promise<T>;
  delete<T = unknown>(
    path: string,
    options?: Omit<PlatformApiRequestOptions, "body" | "method">,
  ): Promise<T>;
}

export interface CreatePlatformApiClientOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  getHeaders?: () => HeadersInit | undefined;
  credentials?: RequestCredentials;
}

export class PlatformApiRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly payload: unknown;

  constructor(
    message: string,
    options: { status: number; code?: string; payload?: unknown },
  ) {
    super(message);
    this.name = "PlatformApiRequestError";
    this.status = options.status;
    this.code = String(options.code || "");
    this.payload = options.payload;
  }
}

function normalizeBaseUrl(value: string): string {
  return String(value || "").trim().replace(/\/+$/, "");
}

function normalizeRequestPath(path: string): string {
  const value = String(path || "").trim();
  if (!value) throw new Error("A platform API path is required.");
  return value.startsWith("/") ? value : `/${value}`;
}

function appendQuery(
  url: URL,
  query: PlatformApiRequestOptions["query"],
): void {
  if (!query) return;
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
}

async function readResponsePayload(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const text = await response.text().catch(() => "");
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getPayloadString(payload: unknown, key: string): string {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "";
  }
  const value = (payload as Record<string, unknown>)[key];
  return typeof value === "string" ? value.trim() : "";
}

export function createPlatformApiClient({
  baseUrl,
  fetchImpl = globalThis.fetch,
  getHeaders,
  credentials = "include",
}: CreatePlatformApiClientOptions): PlatformApiClient {
  if (typeof fetchImpl !== "function") {
    throw new Error("Fetch is not available for platform API requests.");
  }
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl);

  async function request<T>(
    path: string,
    options: PlatformApiRequestOptions = {},
  ): Promise<T> {
    const url = new URL(
      `${normalizedBaseUrl}${normalizeRequestPath(path)}`,
      normalizedBaseUrl || globalThis.location?.origin || "http://localhost",
    );
    appendQuery(url, options.query);
    const hasBody = options.body !== undefined;
    const headers = new Headers(getHeaders?.() || {});
    new Headers(options.headers || {}).forEach((value, key) => {
      headers.set(key, value);
    });
    if (hasBody && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    const response = await fetchImpl(url.toString(), {
      method: options.method || "GET",
      credentials,
      headers,
      signal: options.signal,
      ...(hasBody ? { body: JSON.stringify(options.body) } : {}),
    });
    const payload = await readResponsePayload(response);
    if (!response.ok) {
      throw new PlatformApiRequestError(
        getPayloadString(payload, "message")
          || getPayloadString(payload, "error")
          || `Platform API request failed (${response.status}).`,
        {
          status: response.status,
          code: getPayloadString(payload, "code"),
          payload,
        },
      );
    }
    return payload as T;
  }

  const client: PlatformApiClient = {
    request,
    get<T>(
      path: string,
      options?: Omit<PlatformApiRequestOptions, "body" | "method">,
    ) {
      return request<T>(path, { ...options, method: "GET" });
    },
    post<T>(
      path: string,
      body?: unknown,
      options?: Omit<PlatformApiRequestOptions, "body" | "method">,
    ) {
      return request<T>(path, { ...options, method: "POST", body });
    },
    put<T>(
      path: string,
      body?: unknown,
      options?: Omit<PlatformApiRequestOptions, "body" | "method">,
    ) {
      return request<T>(path, { ...options, method: "PUT", body });
    },
    patch<T>(
      path: string,
      body?: unknown,
      options?: Omit<PlatformApiRequestOptions, "body" | "method">,
    ) {
      return request<T>(path, { ...options, method: "PATCH", body });
    },
    delete<T>(
      path: string,
      options?: Omit<PlatformApiRequestOptions, "body" | "method">,
    ) {
      return request<T>(path, { ...options, method: "DELETE" });
    },
  };
  return Object.freeze(client);
}
