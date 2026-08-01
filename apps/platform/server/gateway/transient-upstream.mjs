const TRANSIENT_UPSTREAM_STATUSES = new Set([408, 425, 429, 500, 502, 503, 504]);

export function isTransientUpstreamStatus(status) {
  return TRANSIENT_UPSTREAM_STATUSES.has(Number(status));
}

function readRequestMethod(input, init) {
  if (init?.method) return String(init.method).toUpperCase();
  if (typeof Request !== "undefined" && input instanceof Request) {
    return String(input.method || "GET").toUpperCase();
  }
  return "GET";
}

function createAbortError(signal) {
  if (signal?.reason instanceof Error) return signal.reason;
  const error = new Error("The upstream request was aborted.");
  error.name = "AbortError";
  return error;
}

function readRetryAfterMs(response, maximumDelayMs) {
  const raw = response.headers.get("retry-after");
  if (!raw) return null;

  const seconds = Number(raw);
  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.min(maximumDelayMs, Math.round(seconds * 1000));
  }

  const dateMs = Date.parse(raw);
  if (!Number.isFinite(dateMs)) return null;
  return Math.min(maximumDelayMs, Math.max(0, dateMs - Date.now()));
}

function waitForRetry(delayMs, signal) {
  if (signal?.aborted) return Promise.reject(createAbortError(signal));

  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      signal?.removeEventListener("abort", handleAbort);
      callback();
    };
    const handleAbort = () => finish(() => reject(createAbortError(signal)));
    const timeoutId = setTimeout(() => finish(resolve), delayMs);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
}

export async function fetchWithTransientRetry(input, init = {}, options = {}) {
  const method = readRequestMethod(input, init);
  const idempotent = method === "GET" || method === "HEAD";
  const maximumAttempts = idempotent
    ? Math.max(1, Math.min(4, Math.floor(Number(options.maxAttempts) || 2)))
    : 1;
  const baseDelayMs = Math.max(0, Math.floor(Number(options.baseDelayMs) || 80));
  const maximumDelayMs = Math.max(
    baseDelayMs,
    Math.floor(Number(options.maximumDelayMs) || 1000),
  );
  const fetchImpl = options.fetchImpl || globalThis.fetch;
  let lastError;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      const response = await fetchImpl(input, init);
      if (!isTransientUpstreamStatus(response.status) || attempt === maximumAttempts) {
        return response;
      }

      const retryAfterMs = readRetryAfterMs(response, maximumDelayMs);
      await response.body?.cancel().catch(() => undefined);
      const backoffMs = Math.min(maximumDelayMs, baseDelayMs * (2 ** (attempt - 1)));
      await waitForRetry(retryAfterMs ?? backoffMs, init.signal);
    }
    catch (error) {
      lastError = error;
      if (init.signal?.aborted || attempt === maximumAttempts) throw error;
      const backoffMs = Math.min(maximumDelayMs, baseDelayMs * (2 ** (attempt - 1)));
      await waitForRetry(backoffMs, init.signal);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Transient upstream request failed.");
}

