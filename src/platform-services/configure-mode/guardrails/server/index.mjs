import { createGuardrailsThreadEnricher } from "./enrichment.mjs";
import { createGuardrailsRequestHandler } from "./routes.mjs";

/** Creates the complete server-side Guardrails service from host transport adapters. */
export function createGuardrailsService(adapters) {
  return Object.freeze({
    handleRequest: createGuardrailsRequestHandler(adapters),
    enrichThreadPayload: createGuardrailsThreadEnricher(adapters),
  });
}
