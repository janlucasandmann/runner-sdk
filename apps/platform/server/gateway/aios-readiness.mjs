import { fetchWithTransientRetry } from "./transient-upstream.mjs";

function isLoopbackOrigin(origin) {
  try {
    return ["localhost", "127.0.0.1", "::1"].includes(new URL(origin).hostname);
  }
  catch {
    return false;
  }
}

export async function waitForLocalAiosBridge(aiosOrigin, options = {}) {
  if (!isLoopbackOrigin(aiosOrigin)) {
    return Object.freeze({ ready: true, skipped: true, status: 0 });
  }

  const timeoutMs = Math.max(1000, Math.floor(Number(options.timeoutMs) || 8000));
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Local AIOS bridge did not become ready within ${timeoutMs}ms.`));
  }, timeoutMs);

  try {
    const target = new URL("/api/playground/cloud/billing/catalog", aiosOrigin);
    const response = await fetchWithTransientRetry(target, {
      method: "GET",
      signal: controller.signal,
    }, {
      maxAttempts: 4,
      baseDelayMs: 120,
      maximumDelayMs: 800,
      fetchImpl: options.fetchImpl,
    });
    await response.body?.cancel().catch(() => undefined);
    return Object.freeze({
      ready: response.status < 500,
      skipped: false,
      status: response.status,
    });
  }
  catch (error) {
    return Object.freeze({
      ready: false,
      skipped: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    });
  }
  finally {
    clearTimeout(timeoutId);
  }
}

