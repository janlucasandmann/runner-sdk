import { createPlaygroundFineTuningRuntime } from "./runtime.mjs";

const REQUIRED_ADAPTERS = [
  "enrichThreadPayloadWithAgentGuardrails",
  "fetchAiosApi",
  "hasAiosSession",
  "parseUpstreamUrl",
  "readOptionalApiKey",
  "readRequestBody",
  "sendJson",
  "withProxyOrganizationHeader",
];

/** Creates the complete server-side Agent Optimization service from host transport adapters. */
export function createFineTuningService(adapters = {}) {
  for (const adapterName of REQUIRED_ADAPTERS) {
    if (typeof adapters[adapterName] !== "function") {
      throw new TypeError(`Agent Optimization service requires the ${adapterName} adapter.`);
    }
  }
  return Object.freeze(createPlaygroundFineTuningRuntime(adapters));
}

export { createPlaygroundFineTuningRuntime } from "./runtime.mjs";
