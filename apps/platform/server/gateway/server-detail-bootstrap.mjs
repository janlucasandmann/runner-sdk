const SERVER_DETAIL_BOOTSTRAP_INCLUDES = new Set([
  "analytics",
  "auth-users",
  "bindings",
  "context",
  "runs",
  "secrets",
  "versions",
]);

const DEFAULT_SERVER_DETAIL_BOOTSTRAP_INCLUDES = Object.freeze({
  api: ["bindings", "context"],
  auth: ["auth-users"],
  function: ["bindings", "context", "versions"],
  secrets: ["secrets"],
  web_app: ["bindings", "context", "versions"],
});

function clampInteger(value, fallback, minimum, maximum) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.floor(numeric)));
}

export function normalizeServerDetailBootstrapIncludes(value, kind = "") {
  const requested = Array.isArray(value)
    ? value
    : String(value || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  const defaults = DEFAULT_SERVER_DETAIL_BOOTSTRAP_INCLUDES[String(kind || "").trim()] || [];
  const source = requested.length > 0 ? requested : defaults;
  return Array.from(new Set(source.filter((item) => SERVER_DETAIL_BOOTSTRAP_INCLUDES.has(item))));
}

function buildBootstrapResourcePath(serverId, include, options) {
  const basePath = `/servers/${encodeURIComponent(serverId)}`;
  if (include === "analytics") {
    return `${basePath}/analytics?period=${encodeURIComponent(options.period)}`;
  }
  if (include === "auth-users") {
    return `${basePath}/auth-users?limit=${options.authUsersLimit}`;
  }
  if (include === "runs") {
    return `${basePath}/runs?limit=${options.runsLimit}`;
  }
  return `${basePath}/${include}`;
}

function createOptionalResult(response) {
  if (!response || response.status >= 400) {
    return {
      data: null,
      error: {
        status: Math.max(400, Number(response?.status || 502)),
        message: String(
          response?.data?.message
          || response?.data?.error
          || "Optional resource data could not be loaded.",
        ),
      },
    };
  }
  return { data: response.data, error: null };
}

export function createServerDetailBootstrapGateway(bindings) {
  const { fetchUpstreamOverviewJson, sendJson } = bindings;

  return async function sendServerDetailBootstrap(req, res, serverId, options = {}) {
    const normalizedServerId = String(serverId || "").trim();
    if (!normalizedServerId) {
      return sendJson(res, 400, {
        error: "Invalid server id",
        message: "A server id is required.",
      });
    }

    const kind = String(options.kind || "").trim();
    const include = normalizeServerDetailBootstrapIncludes(options.include, kind);
    const requestOptions = {
      authUsersLimit: clampInteger(options.authUsersLimit, 50, 1, 200),
      runsLimit: clampInteger(options.runsLimit, 40, 1, 100),
      period: ["day", "week", "month"].includes(String(options.period || ""))
        ? String(options.period)
        : "day",
    };
    const startedAt = performance.now();
    const timings = {};

    const timedFetch = async (name, path) => {
      const requestStartedAt = performance.now();
      const controller = new AbortController();
      const timeoutMs = name === "server" ? 8_000 : 3_000;
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        return await fetchUpstreamOverviewJson(req, path, { signal: controller.signal });
      } catch (error) {
        return {
          status: controller.signal.aborted ? 504 : 502,
          data: {
            error: controller.signal.aborted ? "Upstream request timed out" : "Upstream request failed",
            message: controller.signal.aborted
              ? `${name} did not respond within ${timeoutMs}ms.`
              : error instanceof Error ? error.message : String(error),
          },
        };
      } finally {
        clearTimeout(timeout);
        timings[name] = performance.now() - requestStartedAt;
      }
    };

    try {
      const detailPath = `/servers/${encodeURIComponent(normalizedServerId)}`;
      const [serverResponse, optionalResponses] = await Promise.all([
        timedFetch("server", detailPath),
        Promise.all(include.map(async (resourceName) => [
          resourceName,
          await timedFetch(
            resourceName,
            buildBootstrapResourcePath(normalizedServerId, resourceName, requestOptions),
          ),
        ])),
      ]);

      if (serverResponse.status >= 400) {
        return sendJson(res, serverResponse.status, serverResponse.data);
      }

      const resources = {};
      const errors = {};
      for (const [resourceName, response] of optionalResponses) {
        const result = createOptionalResult(response);
        resources[resourceName] = result.data;
        if (result.error) errors[resourceName] = result.error;
      }

      timings.total = performance.now() - startedAt;
      const serverTiming = Object.entries(timings)
        .map(([name, duration]) => `${name};dur=${Math.max(0, Number(duration || 0)).toFixed(1)}`)
        .join(", ");

      return sendJson(res, 200, {
        server: serverResponse.data,
        resources,
        errors,
        loadedAt: new Date().toISOString(),
      }, {
        "Server-Timing": serverTiming,
      });
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to bootstrap server details",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  };
}
