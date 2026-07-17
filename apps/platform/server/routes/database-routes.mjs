export function createDatabaseRoutes(bindings) {
    const { proxyUpstreamGet, proxyUpstreamJsonRequest, sendDatabaseBootstrap, } = bindings;
    return function handleDatabaseRoutes(req, res, url) {
        if (req.method === "GET" && url.pathname === "/api/real/databases") {
            void proxyUpstreamGet(req, res, "/databases");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/real/databases") {
            void proxyUpstreamJsonRequest(req, res, "/databases", "POST");
            return true;
        }
        const databaseBootstrapMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)\/bootstrap$/);
        if (req.method === "GET" && databaseBootstrapMatch) {
            const documentsLimit = Math.max(1, Math.min(100, Number(url.searchParams.get("documentsLimit")) || 25));
            void sendDatabaseBootstrap(req, res, decodeURIComponent(databaseBootstrapMatch[1]), documentsLimit);
            return true;
        }
        const databaseDetailMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)$/);
        if (req.method === "GET" && databaseDetailMatch) {
            void proxyUpstreamGet(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDetailMatch[1]))}`);
            return true;
        }
        if (req.method === "PATCH" && databaseDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDetailMatch[1]))}`, "PATCH");
            return true;
        }
        if (req.method === "DELETE" && databaseDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDetailMatch[1]))}`, "DELETE");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/databases/analytics/overview") {
            void proxyUpstreamGet(req, res, `/databases/analytics/overview${url.search || ""}`);
            return true;
        }
        const databaseAnalyticsMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)\/analytics$/);
        if (req.method === "GET" && databaseAnalyticsMatch) {
            void proxyUpstreamGet(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseAnalyticsMatch[1]))}/analytics${url.search || ""}`);
            return true;
        }
        const databaseCollectionsMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)\/collections$/);
        if (req.method === "GET" && databaseCollectionsMatch) {
            void proxyUpstreamGet(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseCollectionsMatch[1]))}/collections`);
            return true;
        }
        if (req.method === "POST" && databaseCollectionsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseCollectionsMatch[1]))}/collections`, "POST");
            return true;
        }
        const databaseCollectionDetailMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)\/collections\/([^/]+)$/);
        if (req.method === "DELETE" && databaseCollectionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseCollectionDetailMatch[1]))}/collections/${encodeURIComponent(decodeURIComponent(databaseCollectionDetailMatch[2]))}`, "DELETE");
            return true;
        }
        const databaseDocumentsMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)\/collections\/([^/]+)\/documents$/);
        if (req.method === "GET" && databaseDocumentsMatch) {
            void proxyUpstreamGet(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDocumentsMatch[1]))}/collections/${encodeURIComponent(decodeURIComponent(databaseDocumentsMatch[2]))}/documents${url.search || ""}`);
            return true;
        }
        if (req.method === "POST" && databaseDocumentsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDocumentsMatch[1]))}/collections/${encodeURIComponent(decodeURIComponent(databaseDocumentsMatch[2]))}/documents`, "POST");
            return true;
        }
        const databaseDocumentDetailMatch = url.pathname.match(/^\/api\/real\/databases\/([^/]+)\/collections\/([^/]+)\/documents\/([^/]+)$/);
        if (req.method === "GET" && databaseDocumentDetailMatch) {
            void proxyUpstreamGet(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[1]))}/collections/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[2]))}/documents/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[3]))}`);
            return true;
        }
        if (req.method === "PUT" && databaseDocumentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[1]))}/collections/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[2]))}/documents/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[3]))}`, "PUT");
            return true;
        }
        if (req.method === "DELETE" && databaseDocumentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/databases/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[1]))}/collections/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[2]))}/documents/${encodeURIComponent(decodeURIComponent(databaseDocumentDetailMatch[3]))}`, "DELETE");
            return true;
        }
        return false;
    };
}
