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
        if (url.pathname === "/api/real/github/automations/bindings") {
            if (req.method === "GET") {
                void proxyUpstreamGet(req, res, "/github/automations/bindings");
                return true;
            }
            if (req.method === "POST") {
                void proxyUpstreamJsonRequest(req, res, "/github/automations/bindings", "POST");
                return true;
            }
        }
        const githubAutomationBindingMatch = url.pathname.match(
            /^\/api\/real\/github\/automations\/bindings\/([^/]+)(\/executions)?$/,
        );
        if (githubAutomationBindingMatch) {
            const bindingId = encodeURIComponent(decodeURIComponent(githubAutomationBindingMatch[1]));
            const executionsSuffix = githubAutomationBindingMatch[2] || "";
            const upstreamPath = `/github/automations/bindings/${bindingId}${executionsSuffix}`;
            if (req.method === "GET" && executionsSuffix) {
                void proxyUpstreamGet(req, res, upstreamPath);
                return true;
            }
            if (!executionsSuffix && ["PATCH", "DELETE"].includes(req.method || "")) {
                void proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
                return true;
            }
        }
        if (url.pathname === "/api/real/source-control/bindings") {
            if (req.method === "GET") {
                void proxyUpstreamGet(req, res, "/source-control/bindings");
                return true;
            }
            if (req.method === "POST") {
                void proxyUpstreamJsonRequest(req, res, "/source-control/bindings", "POST");
                return true;
            }
        }
        const sourceControlBindingMatch = url.pathname.match(
            /^\/api\/real\/source-control\/bindings\/([^/]+)(\/sync|\/executions)?$/,
        );
        if (sourceControlBindingMatch) {
            const bindingId = encodeURIComponent(decodeURIComponent(sourceControlBindingMatch[1]));
            const suffix = sourceControlBindingMatch[2] || "";
            const upstreamPath = `/source-control/bindings/${bindingId}${suffix}`;
            if (req.method === "GET" && suffix === "/executions") {
                void proxyUpstreamGet(req, res, upstreamPath);
                return true;
            }
            if (req.method === "POST" && suffix === "/sync") {
                void proxyUpstreamJsonRequest(req, res, upstreamPath, "POST");
                return true;
            }
            if (!suffix && ["PATCH", "DELETE"].includes(req.method || "")) {
                void proxyUpstreamJsonRequest(req, res, upstreamPath, req.method);
                return true;
            }
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
