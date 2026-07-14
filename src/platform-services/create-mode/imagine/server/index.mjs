import { createImagineRequestHandler } from "./routes.mjs";

/** Creates the server-side Imagine service from host-owned transport adapters. */
export function createImagineService(adapters) {
  return Object.freeze({
    handleRequest: createImagineRequestHandler(adapters),
  });
}
