import { createProjectResourceIndexHandler } from "./resource-index.mjs";
import { createProjectsRequestHandler } from "./routes.mjs";
import { createTaskBacklogService } from "./task-backlog.mjs";
import { createTaskUpstreamGateway } from "./task-upstream.mjs";

/**
 * Creates the server-side Projects service using adapters owned by the demo
 * shell. This keeps authentication, upstream selection, and response transport
 * centralized while project routing and aggregation remain service-owned.
 */
export function createProjectsService(adapters) {
  const proxyProjectResourceIndexGet = createProjectResourceIndexHandler(adapters);
  const taskUpstreamGateway = createTaskUpstreamGateway(adapters);
  const taskBacklogService = createTaskBacklogService({
    ...adapters,
    fetchAiosTaskApi: taskUpstreamGateway.fetchAiosTaskApi,
  });
  const handleProjectsRequest = createProjectsRequestHandler({
    ...adapters,
    proxyProjectResourceIndexGet,
    proxyUpstreamTaskJsonRequest: taskUpstreamGateway.proxyUpstreamTaskJsonRequest,
  });
  return Object.freeze({
    handleRequest(req, res, url) {
      return taskBacklogService.handleRequest(req, res, url)
        || handleProjectsRequest(req, res, url);
    },
  });
}
