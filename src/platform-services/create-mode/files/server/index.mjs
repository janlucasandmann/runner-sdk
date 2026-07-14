import { createEnvironmentHtmlPreviewProxy } from "./html-preview.mjs";
import { createFilesRequestHandler } from "./routes.mjs";

/** Creates the server-side Files service from host-owned transport adapters. */
export function createFilesService(adapters) {
  const proxyEnvironmentHtmlPreview = createEnvironmentHtmlPreviewProxy(adapters);
  return Object.freeze({
    handleRequest: createFilesRequestHandler({
      ...adapters,
      proxyEnvironmentHtmlPreview,
    }),
  });
}
