import { createBatchesRequestHandler } from "./routes.mjs";

export function createBatchesService(adapters) {
  return Object.freeze({
    handleRequest: createBatchesRequestHandler(adapters),
  });
}

