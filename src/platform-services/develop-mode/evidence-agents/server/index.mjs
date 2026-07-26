import { createEvidenceAgentsRequestHandler } from "./routes.mjs";

export function createEvidenceAgentsService(adapters) {
  return Object.freeze({
    handleRequest: createEvidenceAgentsRequestHandler(adapters),
  });
}
