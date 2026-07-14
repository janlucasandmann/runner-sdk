import { createCalendarRequestHandler } from "./routes.mjs";

/** Creates the server-side Calendar service from host transport adapters. */
export function createCalendarService(adapters) {
  return Object.freeze({
    handleRequest: createCalendarRequestHandler(adapters),
  });
}
