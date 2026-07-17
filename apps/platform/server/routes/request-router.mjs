/**
 * Executes route families in explicit precedence order. A route handler returns
 * true as soon as it owns the request.
 */
export function createRequestRouter(routeHandlers) {
    const handlers = Object.freeze(routeHandlers.filter((handler) => typeof handler === "function"));
    return Object.freeze({
        handleRequest(req, res, url) {
            for (const handler of handlers) {
                if (handler(req, res, url))
                    return true;
            }
            return false;
        },
    });
}
