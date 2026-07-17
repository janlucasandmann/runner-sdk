export function createAgentResourceRoutes(bindings) {
    const { modelsService, proxyUpstreamGet, proxyUpstreamJsonRequest, } = bindings;
    return function handleAgentResourceRoutes(req, res, url) {
        if (req.method === "GET" && url.pathname === "/api/real/agents/analytics/overview") {
            void proxyUpstreamGet(req, res, "/agents/analytics/overview" + (url.search || ""));
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/agents") {
            void proxyUpstreamGet(req, res, "/agents");
            return true;
        }
        if (modelsService.handleRequest(req, res, url)) {
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/real/agents") {
            void proxyUpstreamJsonRequest(req, res, "/agents", "POST");
            return true;
        }
        const voiceAgentsProxyMatch = url.pathname.match(/^\/api\/real\/voice-agents(?:\/(.*))?$/);
        if (voiceAgentsProxyMatch && ["GET", "POST", "PATCH", "PUT", "DELETE"].includes(req.method || "")) {
            const suffix = voiceAgentsProxyMatch[1]
                ? "/" + voiceAgentsProxyMatch[1].split("/").map((segment) => encodeURIComponent(decodeURIComponent(segment))).join("/")
                : "";
            if (req.method === "GET") {
                void proxyUpstreamGet(req, res, "/voice-agents" + suffix);
            }
            else {
                void proxyUpstreamJsonRequest(req, res, "/voice-agents" + suffix, req.method);
            }
            return true;
        }
        const agentAnalyticsMatch = url.pathname.match(/^\/api\/real\/agents\/([^/]+)\/analytics$/);
        if (req.method === "GET" && agentAnalyticsMatch) {
            void proxyUpstreamGet(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentAnalyticsMatch[1]))}/analytics`);
            return true;
        }
        const agentVersionsMatch = url.pathname.match(/^\/api\/real\/agents\/([^/]+)\/versions$/);
        if (req.method === "GET" && agentVersionsMatch) {
            void proxyUpstreamGet(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentVersionsMatch[1]))}/versions`);
            return true;
        }
        if (req.method === "POST" && agentVersionsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentVersionsMatch[1]))}/versions`, "POST");
            return true;
        }
        const agentVersionCompareMatch = url.pathname.match(/^\/api\/real\/agents\/([^/]+)\/versions\/compare$/);
        if (req.method === "GET" && agentVersionCompareMatch) {
            const upstreamPath = `/agents/${encodeURIComponent(decodeURIComponent(agentVersionCompareMatch[1]))}/versions/compare${url.search || ""}`;
            void proxyUpstreamGet(req, res, upstreamPath);
            return true;
        }
        const agentVersionActionMatch = url.pathname.match(/^\/api\/real\/agents\/([^/]+)\/versions\/([^/]+)\/(publish|unpublish|restore)$/);
        if (req.method === "POST" && agentVersionActionMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentVersionActionMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(agentVersionActionMatch[2]))}/${agentVersionActionMatch[3]}`, "POST");
            return true;
        }
        const agentVersionDetailMatch = url.pathname.match(/^\/api\/real\/agents\/([^/]+)\/versions\/([^/]+)$/);
        if (req.method === "GET" && agentVersionDetailMatch) {
            void proxyUpstreamGet(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(agentVersionDetailMatch[2]))}`);
            return true;
        }
        if ((req.method === "PATCH" || req.method === "PUT") && agentVersionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(agentVersionDetailMatch[2]))}`, "PATCH");
            return true;
        }
        if (req.method === "DELETE" && agentVersionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(agentVersionDetailMatch[2]))}`, "DELETE");
            return true;
        }
        const agentDetailMatch = url.pathname.match(/^\/api\/real\/agents\/([^/]+)$/);
        if (req.method === "GET" && agentDetailMatch) {
            void proxyUpstreamGet(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentDetailMatch[1]))}`);
            return true;
        }
        if (req.method === "PATCH" && agentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentDetailMatch[1]))}`, "PATCH");
            return true;
        }
        if (req.method === "PUT" && agentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentDetailMatch[1]))}`, "PATCH");
            return true;
        }
        if (req.method === "DELETE" && agentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/agents/${encodeURIComponent(decodeURIComponent(agentDetailMatch[1]))}`, "DELETE");
            return true;
        }
        return false;
    };
}
