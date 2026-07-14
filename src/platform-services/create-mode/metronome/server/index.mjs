import { createMetronomeRequestHandler } from "./routes.mjs";

export function createMetronomeService(adapters) {
  return Object.freeze({
    handleRequest: createMetronomeRequestHandler(adapters),
  });
}
