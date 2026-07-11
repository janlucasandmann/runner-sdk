const THREAD_V2_PREFIX = "/api/real/threads/";

function canonicalSegment(value) {
  try {
    return encodeURIComponent(decodeURIComponent(value));
  } catch {
    return null;
  }
}

function route(transport, upstreamPath, method = "GET") {
  return { transport, upstreamPath, method };
}

/**
 * Maps the browser-facing demo API to the canonical Thread v2 backend.
 * Query parameters are forwarded by the proxy transport, not encoded here.
 */
export function matchDemoThreadV2ProxyRoute(rawMethod, pathname) {
  const method = String(rawMethod || "GET").toUpperCase();
  if (!String(pathname || "").startsWith(THREAD_V2_PREFIX)) return null;

  const suffix = String(pathname).slice(THREAD_V2_PREFIX.length);
  const segments = suffix.split("/").filter(Boolean);
  const threadId = canonicalSegment(segments[0] || "");
  if (!threadId) return null;

  if (method === "GET" && segments.length === 2 && segments[1] === "timeline") {
    return route("json", `/threads/${threadId}/timeline`);
  }
  if (method === "GET" && segments.length === 2 && segments[1] === "events") {
    return route("event-stream-or-json", `/threads/${threadId}/events`);
  }
  if (method === "GET" && segments.length === 2 && segments[1] === "runs") {
    return route("json", `/threads/${threadId}/runs`);
  }
  if (method === "GET" && segments.length === 2 && segments[1] === "activity-groups") {
    return route("json", `/threads/${threadId}/activity-groups`);
  }
  if (method === "GET" && segments.length === 2 && segments[1] === "actions") {
    return route("json", `/threads/${threadId}/actions`);
  }
  if (method === "POST" && segments.length === 3 && segments[1] === "activity" && segments[2] === "classify") {
    return route("json", `/threads/${threadId}/activity/classify`, method);
  }
  if (method === "POST" && segments.length === 3 && segments[1] === "activity" && segments[2] === "messages") {
    return route("json", `/threads/${threadId}/activity/messages`, method);
  }

  const runId = canonicalSegment(segments[2] || "");
  if (method === "POST" && segments.length === 4 && segments[1] === "runs" && runId && segments[3] === "steering") {
    return route("json", `/threads/${threadId}/runs/${runId}/steering`, method);
  }
  if (method === "POST" && segments.length === 4 && segments[1] === "runs" && runId && segments[3] === "control") {
    return route("json", `/threads/${threadId}/runs/${runId}/control`, method);
  }

  return null;
}

export function wantsDemoThreadEventStream(req, url) {
  if (url?.searchParams?.get("stream") === "1" || url?.searchParams?.get("stream") === "true") return true;
  const accept = String(req?.headers?.accept || "").toLowerCase();
  return accept.includes("text/event-stream");
}
