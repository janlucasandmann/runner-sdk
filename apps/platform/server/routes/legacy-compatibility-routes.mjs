export function createLegacyCompatibilityRoutes(bindings) {
    const { proxyCreateThread, proxyThreadMessages, proxyThreadMessagesGet, } = bindings;
    return function handleLegacyCompatibilityRoutes(req, res, url) {
        if (req.method === "POST" && url.pathname === "/api/real/create-thread") {
            void proxyCreateThread(req, res);
            return true;
        }
        const legacyMessagesMatch = url.pathname.match(/^\/api\/real\/thread[s]?\/([^/]+)\/messages$/);
        if (req.method === "GET" && legacyMessagesMatch) {
            void proxyThreadMessagesGet(req, res, decodeURIComponent(legacyMessagesMatch[1]));
            return true;
        }
        if (req.method === "POST" && legacyMessagesMatch) {
            void proxyThreadMessages(req, res, decodeURIComponent(legacyMessagesMatch[1]));
            return true;
        }
        return false;
    };
}
