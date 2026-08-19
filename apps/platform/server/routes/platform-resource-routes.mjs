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
        if (req.method === "GET" && url.pathname === "/api/real/account/data-controls") {
            void proxyUpstreamGet(req, res, "/account/data-controls");
            return true;
        }
        const accountDataControlMatch = url.pathname.match(/^\/api\/real\/account\/data-controls\/([^/]+)$/);
        if (req.method === "DELETE" && accountDataControlMatch) {
            void proxyUpstreamJsonRequest(
                req,
                res,
                `/account/data-controls/${encodeURIComponent(decodeURIComponent(accountDataControlMatch[1]))}`,
                "DELETE",
            );
            return true;
        }
        return false;
    };
}
