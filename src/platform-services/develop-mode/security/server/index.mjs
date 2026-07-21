import { createSecurityRequestHandler } from "./routes.mjs";

export function createSecurityService(adapters) {
  return Object.freeze({
    handleRequest: createSecurityRequestHandler(adapters),
  });
}
