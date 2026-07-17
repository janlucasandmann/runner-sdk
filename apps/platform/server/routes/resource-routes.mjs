import { createComputeResourceRoutes } from "./compute-resource-routes.mjs";
import { createDatabaseRoutes } from "./database-routes.mjs";
import { createAgentResourceRoutes } from "./agent-resource-routes.mjs";
import { createPlatformResourceRoutes } from "./platform-resource-routes.mjs";
import { createLegacyCompatibilityRoutes } from "./legacy-compatibility-routes.mjs";
export function createResourceRoutes(bindings) {
    const handlers = [
        createComputeResourceRoutes(bindings),
        createDatabaseRoutes(bindings),
        createAgentResourceRoutes(bindings),
        createPlatformResourceRoutes(bindings),
        createLegacyCompatibilityRoutes(bindings),
    ];
    return function handleResourceRoutes(req, res, url) {
        for (const handler of handlers) {
            if (handler(req, res, url))
                return true;
        }
        return false;
    };
}
