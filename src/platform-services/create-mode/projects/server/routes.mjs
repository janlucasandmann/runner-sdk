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
  proxyUpstreamGet,
  proxyUpstreamJsonRequest,
  proxyUpstreamTaskJsonRequest,
}) {
  const dependencies = {
    proxyAiosJsonRequest,
    proxyProjectResourceIndexGet,
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

    const projectHomeMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/home$/);
    if (method === "GET" && projectHomeMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectHomeMatch[1])}/home`,
      ));
    }

    const projectOwnerCandidatesMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/owner-candidates$/);
    if (method === "GET" && projectOwnerCandidatesMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectOwnerCandidatesMatch[1])}/owner-candidates`,
      ));
    }

    const projectOwnerMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/owner$/);
    if (method === "PATCH" && projectOwnerMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/projects/${encodePathSegment(projectOwnerMatch[1])}/owner`,
        "PATCH",
      ));
    }

    const projectWorkGraphMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/work-graph$/);
    if (method === "GET" && projectWorkGraphMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectWorkGraphMatch[1])}/work-graph`,
      ));
    }

    const projectAgentSessionsMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/agent-sessions$/);
    if (method === "GET" && projectAgentSessionsMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectAgentSessionsMatch[1])}/agent-sessions`,
      ));
    }

    const projectAgentSessionSummaryMatch = pathname.match(
      /^\/api\/real\/projects\/([^/]+)\/agent-sessions\/summary$/,
    );
    if (method === "GET" && projectAgentSessionSummaryMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectAgentSessionSummaryMatch[1])}/agent-sessions/summary`,
      ));
    }

    const projectWorkRelationsMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/work-relations$/);
    if (method === "POST" && projectWorkRelationsMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/projects/${encodePathSegment(projectWorkRelationsMatch[1])}/work-relations`,
        "POST",
      ));
    }

    const projectWorkRelationMatch = pathname.match(
      /^\/api\/real\/projects\/([^/]+)\/work-relations\/([^/]+)$/,
    );
    if (method === "DELETE" && projectWorkRelationMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/projects/${encodePathSegment(projectWorkRelationMatch[1])}/work-relations/${encodePathSegment(projectWorkRelationMatch[2])}`,
        "DELETE",
      ));
    }

    const projectUpdatesMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/updates$/);
    if (["GET", "POST"].includes(method) && projectUpdatesMatch) {
      const upstreamPath = `/projects/${encodePathSegment(projectUpdatesMatch[1])}/updates`;
      return method === "GET"
        ? startRequest(proxyUpstreamGet(req, res, upstreamPath))
        : startRequest(proxyUpstreamJsonRequest(req, res, upstreamPath, "POST"));
    }

    const projectDeliveryProvisionMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/delivery-plan\/provision$/);
    if (method === "POST" && projectDeliveryProvisionMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/projects/${encodePathSegment(projectDeliveryProvisionMatch[1])}/delivery-plan/provision`,
        "POST",
      ));
    }

    const projectDeliveryExecutionActionMatch = pathname.match(
      /^\/api\/real\/projects\/([^/]+)\/delivery-plan\/execution\/(start|reconcile|cancel)$/,
    );
    if (method === "POST" && projectDeliveryExecutionActionMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/projects/${encodePathSegment(projectDeliveryExecutionActionMatch[1])}/delivery-plan/execution/${projectDeliveryExecutionActionMatch[2]}`,
        "POST",
      ));
    }

    const projectDeliveryExecutionMatch = pathname.match(
      /^\/api\/real\/projects\/([^/]+)\/delivery-plan\/execution$/,
    );
    if (method === "GET" && projectDeliveryExecutionMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/projects/${encodePathSegment(projectDeliveryExecutionMatch[1])}/delivery-plan/execution`,
      ));
    }

    const projectDeliveryMatch = pathname.match(/^\/api\/real\/projects\/([^/]+)\/delivery-plan$/);
    if (["GET", "PUT"].includes(method) && projectDeliveryMatch) {
      const upstreamPath = `/projects/${encodePathSegment(projectDeliveryMatch[1])}/delivery-plan`;
      return method === "GET"
        ? startRequest(proxyUpstreamGet(req, res, upstreamPath))
        : startRequest(proxyUpstreamJsonRequest(req, res, upstreamPath, "PUT"));
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
    if (pathname === "/api/real/tasks/activity" && method === "GET") {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, "/tasks/activity", method));
    }

    const taskActivityMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/activity$/);
    if (method === "GET" && taskActivityMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(
        req,
        res,
        `/tasks/${encodePathSegment(taskActivityMatch[1])}/activity`,
        method
      ));
    }

    const taskAgentSessionsMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/agent-sessions$/);
    if (method === "GET" && taskAgentSessionsMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(
        req,
        res,
        `/tasks/${encodePathSegment(taskAgentSessionsMatch[1])}/agent-sessions`,
        method,
      ));
    }

    const taskReleaseMatch = pathname.match(/^\/api\/real\/tasks\/releases\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && taskReleaseMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/releases/${encodePathSegment(taskReleaseMatch[1])}`, method));
    }

    const taskSprintMatch = pathname.match(/^\/api\/real\/tasks\/sprints\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && taskSprintMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/sprints/${encodePathSegment(taskSprintMatch[1])}`, method));
    }

    const taskRunThreadMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/run-thread$/);
    if (method === "POST" && taskRunThreadMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(
        req,
        res,
        `/tasks/${encodePathSegment(taskRunThreadMatch[1])}/run-thread`,
        method,
      ));
    }

    const taskCommentsMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/comments$/);
    if (["GET", "POST"].includes(method) && taskCommentsMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/${encodePathSegment(taskCommentsMatch[1])}/comments`, method));
    }

    const taskActivitySubscriptionMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)\/activity-subscription$/);
    if (["GET", "PUT"].includes(method) && taskActivitySubscriptionMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(
        req,
        res,
        `/tasks/${encodePathSegment(taskActivitySubscriptionMatch[1])}/activity-subscription`,
        method
      ));
    }

    const taskMatch = pathname.match(/^\/api\/real\/tasks\/([^/]+)$/);
    if (["GET", "PATCH", "DELETE"].includes(method) && taskMatch) {
      return startRequest(proxyUpstreamTaskJsonRequest(req, res, `/tasks/${encodePathSegment(taskMatch[1])}`, method));
    }

    return false;
  };
}
