export function createPlatformResourceRoutes(bindings) {
    const { matchPlaygroundBillingProxyRoute, proxyUpstreamGet, proxyUpstreamJsonRequest, } = bindings;
    return function handlePlatformResourceRoutes(req, res, url) {
        const billingProxyRoute = matchPlaygroundBillingProxyRoute(req.method, url.pathname);
        if (billingProxyRoute) {
            if (billingProxyRoute.method === "GET") {
                void proxyUpstreamGet(req, res, billingProxyRoute.upstreamPath);
            }
            else {
                void proxyUpstreamJsonRequest(req, res, billingProxyRoute.upstreamPath, billingProxyRoute.method);
            }
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/costs/summary") {
            void proxyUpstreamGet(req, res, "/costs/summary");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/costs/breakdown") {
            void proxyUpstreamGet(req, res, "/costs/breakdown");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/skills") {
            void proxyUpstreamGet(req, res, "/v1/skills" + (url.search || ""));
            return true;
        }
        return false;
    };
}
