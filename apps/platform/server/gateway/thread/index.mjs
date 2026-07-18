import { createThreadMessageGateway } from "./create-and-stream.mjs";
import { createThreadHtmlPreviewGateway } from "./html-preview.mjs";
import { createThreadMessageHistoryGateway } from "./message-history.mjs";
import { createThreadPermissionGateway } from "./permission-decisions.mjs";
import { createThreadSearchGateway } from "./search.mjs";
import { createThreadTraceGateway } from "./trace-clusters.mjs";

export function createThreadGateway(bindings) {
  return Object.freeze({
    ...createThreadMessageGateway(bindings),
    ...createThreadMessageHistoryGateway(bindings),
    ...createThreadPermissionGateway(bindings),
    ...createThreadSearchGateway(bindings),
    ...createThreadTraceGateway(bindings),
    ...createThreadHtmlPreviewGateway(bindings),
  });
}
