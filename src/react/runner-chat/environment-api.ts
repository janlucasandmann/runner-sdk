import { sanitizeBackendUrl } from "./api-utils.js";

const environmentStartPromises = new Map<string, Promise<void>>();
const environmentWarmCacheUntilMs = new Map<string, number>();
const ENVIRONMENT_START_CACHE_TTL_MS = 4 * 60 * 1000;
const ENVIRONMENT_START_TIMEOUT_MS = 8 * 1000;
const ENVIRONMENT_START_TIMEOUT_ERROR_NAME =
  "EnvironmentStartTimeoutError";

type SharedEnvironmentWarmCacheStore = Record<string, number>;
type SharedEnvironmentStartPromiseStore = Record<string, Promise<void>>;

function readSharedEnvironmentWarmCacheUntilMs(
  requestKey: string
): number {
  if (typeof window === "undefined") {
    return 0;
  }
  const sharedCache = (
    window as typeof window & {
      __runnerEnvironmentWarmCacheUntilMs?: SharedEnvironmentWarmCacheStore;
    }
  ).__runnerEnvironmentWarmCacheUntilMs;
  return Number(sharedCache?.[requestKey] || 0);
}

function writeSharedEnvironmentWarmCacheUntilMs(
  requestKey: string,
  untilMs: number
): void {
  if (typeof window === "undefined") {
    return;
  }
  const nextWindow = window as typeof window & {
    __runnerEnvironmentWarmCacheUntilMs?: SharedEnvironmentWarmCacheStore;
  };
  const sharedCache = nextWindow.__runnerEnvironmentWarmCacheUntilMs || {};
  if (untilMs > Date.now()) {
    sharedCache[requestKey] = untilMs;
  } else {
    delete sharedCache[requestKey];
  }
  nextWindow.__runnerEnvironmentWarmCacheUntilMs = sharedCache;
}

function readSharedEnvironmentStartPromise(
  requestKey: string
): Promise<void> | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (
    window as typeof window & {
      __runnerEnvironmentStartPromises?: SharedEnvironmentStartPromiseStore;
    }
  ).__runnerEnvironmentStartPromises?.[requestKey];
}

function writeSharedEnvironmentStartPromise(
  requestKey: string,
  promise: Promise<void> | null
): void {
  if (typeof window === "undefined") {
    return;
  }
  const nextWindow = window as typeof window & {
    __runnerEnvironmentStartPromises?: SharedEnvironmentStartPromiseStore;
  };
  const sharedPromises = nextWindow.__runnerEnvironmentStartPromises || {};
  if (promise) {
    sharedPromises[requestKey] = promise;
  } else {
    delete sharedPromises[requestKey];
  }
  nextWindow.__runnerEnvironmentStartPromises = sharedPromises;
}

function buildEnvironmentStartRequestKey(params: {
  backendUrl: string;
  environmentId: string;
  agentId?: string;
  enabledSkills?: Record<string, unknown> | null;
}): string {
  return JSON.stringify({
    backendUrl: sanitizeBackendUrl(params.backendUrl),
    environmentId: params.environmentId,
    agentId: params.agentId || null,
  });
}

function createEnvironmentStartTimeoutError(timeoutMs: number): Error {
  const error = new Error(
    `Environment warm-up timed out after ${Math.round(timeoutMs / 1000)}s.`
  );
  error.name = ENVIRONMENT_START_TIMEOUT_ERROR_NAME;
  return error;
}

export function isEnvironmentStartTimeoutError(
  error: unknown
): error is Error {
  return (
    error instanceof Error &&
    error.name === ENVIRONMENT_START_TIMEOUT_ERROR_NAME
  );
}

export function reportRunnerLifecycleCallbackError(
  callbackName: string,
  error: unknown
): void {
  console.warn(
    `[RunnerChat] ${callbackName} callback failed; continuing run execution.`,
    error
  );
}

export async function startEnvironment(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  environmentId: string;
  agentId?: string;
  enabledSkills?: Record<string, unknown> | null;
  force?: boolean;
}): Promise<void> {
  const requestKey = buildEnvironmentStartRequestKey(params);
  if (!params.force) {
    const cachedUntilMs = Math.max(
      environmentWarmCacheUntilMs.get(requestKey) ?? 0,
      readSharedEnvironmentWarmCacheUntilMs(requestKey)
    );
    if (cachedUntilMs > Date.now()) {
      return;
    }
    environmentWarmCacheUntilMs.delete(requestKey);
    writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
  }
  if (!params.force && environmentStartPromises.has(requestKey)) {
    return environmentStartPromises.get(requestKey);
  }
  const existingPromise =
    environmentStartPromises.get(requestKey)
    || readSharedEnvironmentStartPromise(requestKey);
  if (existingPromise) {
    return existingPromise;
  }

  const startPromise = (async () => {
    const backendUrl = sanitizeBackendUrl(params.backendUrl);
    const headers = new Headers(params.requestHeaders || {});
    const controller = new AbortController();
    let didTimeout = false;
    const timeoutId = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, ENVIRONMENT_START_TIMEOUT_MS);

    headers.set("Content-Type", "application/json");
    headers.set("X-API-Key", params.apiKey);

    try {
      const response = await fetch(
        `${backendUrl}/environments/${encodeURIComponent(params.environmentId)}/start`,
        {
          method: "POST",
          headers,
          signal: controller.signal,
          body: JSON.stringify({
            ...(params.agentId ? { agentId: params.agentId } : {}),
            ...(params.enabledSkills
              ? { enabledSkills: params.enabledSkills }
              : {}),
          }),
        }
      );

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        environmentWarmCacheUntilMs.delete(requestKey);
        writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
        throw new Error(
          bodyText ||
            `Failed to start environment (${response.status})`
        );
      }
      const nextWarmCacheUntilMs =
        Date.now() + ENVIRONMENT_START_CACHE_TTL_MS;
      environmentWarmCacheUntilMs.set(
        requestKey,
        nextWarmCacheUntilMs
      );
      writeSharedEnvironmentWarmCacheUntilMs(
        requestKey,
        nextWarmCacheUntilMs
      );
    } catch (error) {
      environmentWarmCacheUntilMs.delete(requestKey);
      writeSharedEnvironmentWarmCacheUntilMs(requestKey, 0);
      if (
        didTimeout &&
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw createEnvironmentStartTimeoutError(
          ENVIRONMENT_START_TIMEOUT_MS
        );
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  })().finally(() => {
    if (environmentStartPromises.get(requestKey) === startPromise) {
      environmentStartPromises.delete(requestKey);
    }
    if (readSharedEnvironmentStartPromise(requestKey) === startPromise) {
      writeSharedEnvironmentStartPromise(requestKey, null);
    }
  });

  environmentStartPromises.set(requestKey, startPromise);
  writeSharedEnvironmentStartPromise(requestKey, startPromise);
  return startPromise;
}

export async function prepareGithubRepositorySelection(params: {
  backendUrl: string;
  apiKey: string;
  requestHeaders?: HeadersInit;
  environmentId: string;
  repoFullName: string;
  branch: string;
}): Promise<void> {
  const backendUrl = sanitizeBackendUrl(params.backendUrl);
  const headers = new Headers(params.requestHeaders || {});
  headers.set("Content-Type", "application/json");
  headers.set("X-API-Key", params.apiKey);

  const response = await fetch(
    `${backendUrl}/environments/${encodeURIComponent(params.environmentId)}/github/prepare`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        repoFullName: params.repoFullName,
        branch: params.branch,
      }),
    }
  );

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    throw new Error(
      bodyText ||
        `Failed to prepare GitHub repository (${response.status})`
    );
  }
}
