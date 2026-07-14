function encodePathSegment(value) {
  return encodeURIComponent(decodeURIComponent(value));
}

function startRequest(handler) {
  void handler;
  return true;
}

/** Owns standalone and project-scoped Calendar schedule routes. */
export function createCalendarRequestHandler({
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
}) {
  if (typeof proxyUpstreamGet !== "function") {
    throw new TypeError("Calendar service requires a proxyUpstreamGet adapter.");
  }
  if (typeof proxyUpstreamJsonRequest !== "function") {
    throw new TypeError("Calendar service requires a proxyUpstreamJsonRequest adapter.");
  }

  return function handleCalendarRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    const pathname = url.pathname;

    if (pathname === "/api/real/schedules" && method === "GET") {
      return startRequest(proxyUpstreamGet(req, res, "/schedules"));
    }
    if (pathname === "/api/real/schedules" && method === "POST") {
      return startRequest(proxyUpstreamJsonRequest(req, res, "/schedules", "POST"));
    }

    const scheduleTriggerMatch = pathname.match(/^\/api\/real\/schedules\/([^/]+)\/trigger$/);
    if (method === "POST" && scheduleTriggerMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/schedules/${encodePathSegment(scheduleTriggerMatch[1])}/trigger`,
        "POST",
      ));
    }

    const scheduleDetailMatch = pathname.match(/^\/api\/real\/schedules\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && scheduleDetailMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/schedules/${encodePathSegment(scheduleDetailMatch[1])}`,
        method,
      ));
    }

    const projectSchedulesMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/schedules$/);
    if (method === "GET" && projectSchedulesMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectSchedulesMatch[1])}/schedules`,
      ));
    }
    if (method === "POST" && projectSchedulesMatch) {
      return startRequest(proxyUpstreamJsonRequest(req, res, "/schedules", "POST"));
    }

    const projectScheduleTriggerMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/schedules\/([^/]+)\/trigger$/);
    if (method === "POST" && projectScheduleTriggerMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/schedules/${encodePathSegment(projectScheduleTriggerMatch[2])}/trigger`,
        "POST",
      ));
    }

    const projectScheduleMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/schedules\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && projectScheduleMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/schedules/${encodePathSegment(projectScheduleMatch[2])}`,
        method,
      ));
    }

    return false;
  };
}
