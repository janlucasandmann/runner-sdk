import { createPlaygroundEvaluationsRuntime } from "./runtime.mjs";

const REQUIRED_ADAPTERS = [
  "enrichThreadPayloadWithAgentGuardrails",
  "fetchAiosApi",
  "hasAiosSession",
  "parseUpstreamUrl",
  "proxyUpstreamJsonRequest",
  "readOptionalApiKey",
  "readRequestBody",
  "sendJson",
  "withProxyOrganizationHeader",
];

/** Creates the complete server-side Evaluations service from host transport adapters. */
export function createEvaluationsService(adapters = {}) {
  for (const adapterName of REQUIRED_ADAPTERS) {
    if (typeof adapters[adapterName] !== "function") {
      throw new TypeError(`Evaluations service requires the ${adapterName} adapter.`);
    }
  }

  const runtime = createPlaygroundEvaluationsRuntime(adapters);
  return Object.freeze({
    runs: runtime.runs,
    handleRequest(req, res, url) {
      if (runtime.handleRequest(req, res, url)) {
        return true;
      }
      if (url.pathname === "/api/real/evaluations" || url.pathname.startsWith("/api/real/evaluations/")) {
        const suffix = url.pathname.slice("/api/real/evaluations".length);
        void adapters.proxyUpstreamJsonRequest(req, res, "/evaluations" + suffix, req.method);
        return true;
      }
      return false;
    },
  });
}

export { createPlaygroundEvaluationsRuntime } from "./runtime.mjs";
export { createEvaluationRunPersistenceCoordinator } from "./run-persistence.mjs";
