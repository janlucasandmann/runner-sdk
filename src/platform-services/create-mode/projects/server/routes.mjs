function encodePathSegment(value) {
  return encodeURIComponent(decodeURIComponent(value));
}

function startRequest(handler) {
  void handler;
  return true;
}

export function createProjectsRequestHandler({
  proxyAiosJsonRequest,
  proxyProjectResourceIndexGet,
  proxyTaskStartThread,
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
  proxyUpstreamTaskJsonRequest,
}) {
  const dependencies = {
    proxyAiosJsonRequest,
    proxyProjectResourceIndexGet,
    proxyTaskStartThread,
    proxyUpstreamGet,
    proxyUpstreamJsonRequest,
    proxyUpstreamTaskJsonRequest,
  };
  for (const [name, value] of Object.entries(dependencies)) {
    if (typeof value !== "function") {
      throw new TypeError(`Projects service requires a ${name} adapter.`);
    }
  }

  return function handleProjectsRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    const pathname = url.pathname;

    const aiosProjectSkillsMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/skills$/);
    if (["GET", "POST"].includes(method) && aiosProjectSkillsMatch) {
      return startRequest(proxyAiosJsonRequest(req, res, `/api/projects/${aiosProjectSkillsMatch[1]}/skills`, method));
    }

    const aiosProjectSkillMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/skills\/([^/]+)$/);
    if (["GET", "PUT", "PATCH", "DELETE"].includes(method) && aiosProjectSkillMatch) {
      return startRequest(proxyAiosJsonRequest(
        req,
        res,
        `/api/projects/${aiosProjectSkillMatch[1]}/skills/${aiosProjectSkillMatch[2]}`,
        method,
      ));
    }

    const aiosProjectBudgetMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/budget$/);
    if (method === "GET" && aiosProjectBudgetMatch) {
      return startRequest(proxyAiosJsonRequest(req, res, `/api/projects/${aiosProjectBudgetMatch[1]}/budget`, "GET"));
    }

    const aiosProjectCostsSummaryMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/costs\/summary$/);
    if (method === "GET" && aiosProjectCostsSummaryMatch) {
      return startRequest(proxyAiosJsonRequest(req, res, `/api/projects/${aiosProjectCostsSummaryMatch[1]}/costs/summary`, "GET"));
    }

    const aiosProjectCostsBreakdownMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/costs\/breakdown$/);
    if (method === "GET" && aiosProjectCostsBreakdownMatch) {
      return startRequest(proxyAiosJsonRequest(req, res, `/api/projects/${aiosProjectCostsBreakdownMatch[1]}/costs/breakdown`, "GET"));
    }

    const aiosProjectTriggersMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/triggers$/);
    if (["GET", "POST"].includes(method) && aiosProjectTriggersMatch) {
      return startRequest(proxyAiosJsonRequest(req, res, `/api/projects/${aiosProjectTriggersMatch[1]}/triggers`, method));
    }

    const aiosProjectTriggerMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/triggers\/([^/]+)$/);
    if (["PATCH", "DELETE"].includes(method) && aiosProjectTriggerMatch) {
      return startRequest(proxyAiosJsonRequest(
        req,
        res,
        `/api/projects/${aiosProjectTriggerMatch[1]}/triggers/${aiosProjectTriggerMatch[2]}`,
        method,
      ));
    }

    const aiosProjectTriggerTestMatch = pathname.match(/^\/api\/aios\/projects\/([^/]+)\/triggers\/([^/]+)\/test$/);
    if (method === "POST" && aiosProjectTriggerTestMatch) {
      return startRequest(proxyAiosJsonRequest(
        req,
        res,
        `/api/projects/${aiosProjectTriggerTestMatch[1]}/triggers/${aiosProjectTriggerTestMatch[2]}/test`,
        "POST",
      ));
    }

    if (pathname === "/api/real/projects" && method === "GET") {
      return startRequest(proxyUpstreamGet(req, res, "/projects"));
    }
    if (pathname === "/api/real/projects" && method === "POST") {
      return startRequest(proxyUpstreamJsonRequest(req, res, "/projects", "POST"));
    }

    const projectResourceIndexMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/resource-index$/);
    if (method === "GET" && projectResourceIndexMatch) {
      return startRequest(proxyProjectResourceIndexGet(req, res, decodeURIComponent(projectResourceIndexMatch[1])));
    }

    const projectDetailMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && projectDetailMatch) {
      const upstreamPath = `/projects/${encodePathSegment(projectDetailMatch[1])}`;
      return method === "GET"
        ? startRequest(proxyUpstreamGet(req, res, upstreamPath))
        : startRequest(proxyUpstreamJsonRequest(req, res, upstreamPath, method));
    }

    if (pathname === "/api/real/tasks" && ["GET", "POST"].includes(method)) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, "/tasks", method));
    }
    if (pathname === "/api/real/tasks/releases" && ["GET", "POST"].includes(method)) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, "/tasks/releases", method));
    }
    if (pathname === "/api/real/tasks/sprints" && ["GET", "POST"].includes(method)) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, "/tasks/sprints", method));
    }

    const taskReleaseMatch = pathname.match(/^\/api\/real\/tasks\/releases\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && taskReleaseMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/releases/${encodePathSegment(taskReleaseMatch[1])}`, method));
    }

    const taskSprintMatch = pathname.match(/^\/api\/real\/tasks\/sprints\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && taskSprintMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/sprints/${encodePathSegment(taskSprintMatch[1])}`, method));
    }

    const taskStartThreadMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/start-thread$/);
    if (method === "POST" && taskStartThreadMatch) {
      return startRequest(proxyTaskStartThread(req, res, decodeURIComponent(taskStartThreadMatch[1])));
    }

    const taskCommentsMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/comments$/);
    if (["GET", "POST"].includes(method) && taskCommentsMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/${encodePathSegment(taskCommentsMatch[1])}/comments`, method));
    }

    const taskMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && taskMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/${encodePathSegment(taskMatch[1])}`, method));
    }

    return false;
  };
}
