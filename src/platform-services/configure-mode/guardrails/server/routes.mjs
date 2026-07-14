function requireAdapter(adapters, name) {
  if (typeof adapters[name] !== "function") {
    throw new TypeError(`Guardrails service requires a ${name} adapter.`);
  }
  return adapters[name];
}

function encodePath(value) {
  return String(value || "")
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
}

function startRequest(request) {
  void request;
  return true;
}

/** Owns Guardrail Set routes and the Guardrails attachment surface on Agents. */
export function createGuardrailsRequestHandler(adapters) {
  const proxyUpstreamGet = requireAdapter(adapters, "proxyUpstreamGet");
  const proxyUpstreamJsonRequest = requireAdapter(adapters, "proxyUpstreamJsonRequest");

  return function handleGuardrailsRequest(req, res, url) {
    const method = String(req.method || "GET").toUpperCase();
    const pathname = url.pathname;

    const guardrailsMatch = pathname.match(/^\/api\/real\/(?:guardrails|guardrail-sets)(?:\/(.*))?$/);
    if (guardrailsMatch && ["GET", "POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      const suffix = guardrailsMatch[1] ? `/${encodePath(guardrailsMatch[1])}` : "";
      const upstreamMethod = method === "PUT" ? "PATCH" : method;
      if (upstreamMethod === "GET") {
        return startRequest(proxyUpstreamGet(req, res, `/guardrails${suffix}`));
      }
      return startRequest(proxyUpstreamJsonRequest(req, res, `/guardrails${suffix}`, upstreamMethod));
    }

    const agentGuardrailsMatch = pathname.match(/^\/api\/real\/agents\/([^/]+)\/guardrails$/);
    if (method === "GET" && agentGuardrailsMatch) {
      return startRequest(proxyUpstreamGet(
        req,
        res,
        `/agents/${encodePath(agentGuardrailsMatch[1])}/guardrails`,
      ));
    }
    if (["POST", "PUT", "PATCH"].includes(method) && agentGuardrailsMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/agents/${encodePath(agentGuardrailsMatch[1])}/guardrails`,
        method,
      ));
    }

    const agentGuardrailDetailMatch = pathname.match(/^\/api\/real\/agents\/([^/]+)\/guardrails\/([^/]+)$/);
    if (["POST", "PUT", "DELETE"].includes(method) && agentGuardrailDetailMatch) {
      return startRequest(proxyUpstreamJsonRequest(
        req,
        res,
        `/agents/${encodePath(agentGuardrailDetailMatch[1])}/guardrails/${encodePath(agentGuardrailDetailMatch[2])}`,
        method,
      ));
    }

    return false;
  };
}
