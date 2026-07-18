export const THREAD_SEARCH_MAX_RESULTS = 20;

export function normalizeThreadSearchLimit(value) {
  if (value === undefined || value === null || value === "") {
    return THREAD_SEARCH_MAX_RESULTS;
  }

  const numericLimit = Number(value);
  if (!Number.isFinite(numericLimit)) {
    return THREAD_SEARCH_MAX_RESULTS;
  }

  return Math.min(
    THREAD_SEARCH_MAX_RESULTS,
    Math.max(1, Math.floor(numericLimit)),
  );
}

export function normalizeThreadSearchRequestBody(value) {
  const body =
    value && typeof value === "object" && !Array.isArray(value) ? value : {};

  return {
    ...body,
    limit: normalizeThreadSearchLimit(body.limit),
  };
}

export function limitThreadSearchResponse(value, limit) {
  const effectiveLimit = normalizeThreadSearchLimit(limit);

  if (Array.isArray(value)) {
    return value.slice(0, effectiveLimit);
  }
  if (!value || typeof value !== "object") {
    return value;
  }

  return {
    ...value,
    ...(Array.isArray(value.results)
      ? { results: value.results.slice(0, effectiveLimit) }
      : {}),
  };
}

export function createThreadSearchGateway(bindings) {
  const {
    fetchUpstreamJsonForProxyExactPath,
    readRequestBody,
    sendJson,
  } = bindings;

  async function proxyThreadSearch(req, res) {
    let requestBody;
    try {
      requestBody = normalizeThreadSearchRequestBody(
        await readRequestBody(req),
      );
    } catch (error) {
      return sendJson(res, 400, {
        error: "Invalid thread search request",
        message: error instanceof Error ? error.message : String(error),
      });
    }

    try {
      const upstreamResponse = await fetchUpstreamJsonForProxyExactPath(
        req,
        "/threads/search",
        "POST",
        requestBody,
      );
      return sendJson(
        res,
        upstreamResponse.status,
        limitThreadSearchResponse(upstreamResponse.data, requestBody.limit),
      );
    } catch (error) {
      return sendJson(res, 502, {
        error: "Failed to search threads",
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return Object.freeze({ proxyThreadSearch });
}
