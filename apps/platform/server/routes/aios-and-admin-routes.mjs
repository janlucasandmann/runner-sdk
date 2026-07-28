/** Ordered aios and admin compatibility routes. */
export function createAiosAndAdminRoutes(bindings) {
    const { assuranceService, evaluationsService, fineTuningService, testsService, handleAiosUserSessionRequest, proxyAiosJsonRequest, proxyAiosLatestBriefingHtml, proxyAiosNotionLoginRequest, proxyContactSalesSummaryGet, proxyFeedbackSummaryGet, proxyPlaygroundCustomSkills, proxyProductUsageSummaryGet, } = bindings;
    return function handleAiosAndAdminRoutes(req, res, url) {
        if (req.method === "GET" && (url.pathname === "/api/playground/custom-skills" || url.pathname === "/api/playground/skills")) {
            void proxyPlaygroundCustomSkills(req, res);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/google-drive/user") {
            void proxyAiosJsonRequest(req, res, "/api/google-drive/user", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/gmail/user") {
            void proxyAiosJsonRequest(req, res, "/api/gmail/user", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/github/user") {
            void proxyAiosJsonRequest(req, res, "/api/github/user", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/session") {
            void handleAiosUserSessionRequest(req, res);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/profile") {
            void proxyAiosJsonRequest(req, res, "/api/user/profile", "GET");
            return true;
        }
        const aiosProjectSkillsMatch = url.pathname.match(
            /^\/api\/aios\/projects\/([^/]+)\/skills(?:\/.*)?$/,
        );
        if (
            aiosProjectSkillsMatch
            && ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method)
        ) {
            void proxyAiosJsonRequest(
                req,
                res,
                url.pathname.replace(/^\/api\/aios/, "/api"),
                req.method,
            );
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/streaming-key") {
            void proxyAiosJsonRequest(req, res, "/api/user/streaming-key", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/briefing/url") {
            void proxyAiosJsonRequest(req, res, "/api/briefing/url", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/briefing/latest-html") {
            void proxyAiosLatestBriefingHtml(req, res);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/marketing-consent") {
            void proxyAiosJsonRequest(req, res, "/api/user/marketing-consent", "GET");
            return true;
        }
        if (req.method === "PATCH" && url.pathname === "/api/aios/user/marketing-consent") {
            void proxyAiosJsonRequest(req, res, "/api/user/marketing-consent", "PATCH");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/email") {
            void proxyAiosJsonRequest(req, res, "/api/user/email", "GET");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/user/email") {
            void proxyAiosJsonRequest(req, res, "/api/user/email", "POST");
            return true;
        }
        if (req.method === "PATCH" && url.pathname === "/api/aios/user/email") {
            void proxyAiosJsonRequest(req, res, "/api/user/email", "PATCH");
            return true;
        }
        if (req.method === "DELETE" && url.pathname === "/api/aios/user/email") {
            void proxyAiosJsonRequest(req, res, "/api/user/email", "DELETE");
            return true;
        }
        const aiosUserTagMatch = url.pathname.match(/^\/api\/aios\/user\/tags\/([^/]+)$/);
        if ((req.method === "GET" || req.method === "PATCH") && aiosUserTagMatch) {
            void proxyAiosJsonRequest(req, res, `/api/user/tags/${encodeURIComponent(decodeURIComponent(aiosUserTagMatch[1]))}`, req.method);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/discord") {
            void proxyAiosJsonRequest(req, res, "/api/user/discord", "GET");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/user/discord") {
            void proxyAiosJsonRequest(req, res, "/api/user/discord", "POST");
            return true;
        }
        if (req.method === "PATCH" && url.pathname === "/api/aios/user/discord") {
            void proxyAiosJsonRequest(req, res, "/api/user/discord", "PATCH");
            return true;
        }
        if (req.method === "DELETE" && url.pathname === "/api/aios/user/discord") {
            void proxyAiosJsonRequest(req, res, "/api/user/discord", "DELETE");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/user/telegram") {
            void proxyAiosJsonRequest(req, res, "/api/user/telegram", "GET");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/user/telegram") {
            void proxyAiosJsonRequest(req, res, "/api/user/telegram", "POST");
            return true;
        }
        if (req.method === "PATCH" && url.pathname === "/api/aios/user/telegram") {
            void proxyAiosJsonRequest(req, res, "/api/user/telegram", "PATCH");
            return true;
        }
        if (req.method === "DELETE" && url.pathname === "/api/aios/user/telegram") {
            void proxyAiosJsonRequest(req, res, "/api/user/telegram", "DELETE");
            return true;
        }
        if (req.method === "PATCH" && url.pathname === "/api/aios/user/profile") {
            void proxyAiosJsonRequest(req, res, "/api/user/profile", "PATCH");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/auth/send-verification") {
            void proxyAiosJsonRequest(req, res, "/api/auth/send-verification", "POST");
            return true;
        }
        if (req.method === "DELETE" && url.pathname === "/api/aios/user/account") {
            void proxyAiosJsonRequest(req, res, "/api/user/account", "DELETE");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/lemonsqueezy/invoices") {
            void proxyAiosJsonRequest(req, res, "/api/lemonsqueezy/invoices" + url.search, "GET");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/lemonsqueezy/checkout") {
            void proxyAiosJsonRequest(req, res, "/api/lemonsqueezy/checkout", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/lemonsqueezy/subscription/cancel") {
            void proxyAiosJsonRequest(req, res, "/api/lemonsqueezy/subscription/cancel", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/lemonsqueezy/subscription/reactivate") {
            void proxyAiosJsonRequest(req, res, "/api/lemonsqueezy/subscription/reactivate", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/lemonsqueezy/subscription/update") {
            void proxyAiosJsonRequest(req, res, "/api/lemonsqueezy/subscription/update", "POST");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/notion/user") {
            void proxyAiosJsonRequest(req, res, "/api/notion/user", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/onedrive/user") {
            void proxyAiosJsonRequest(req, res, "/api/onedrive/user", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/google-drive/files") {
            void proxyAiosJsonRequest(req, res, "/api/google-drive/files", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/gmail/messages") {
            void proxyAiosJsonRequest(req, res, "/api/gmail/messages", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/onedrive/files") {
            void proxyAiosJsonRequest(req, res, "/api/onedrive/files", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/notion/databases") {
            void proxyAiosJsonRequest(req, res, "/api/notion/databases", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/github/repos") {
            void proxyAiosJsonRequest(req, res, "/api/github/repos", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/admin/feedback-summary") {
            void proxyFeedbackSummaryGet(req, res);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/admin/product-usage-summary") {
            void proxyProductUsageSummaryGet(req, res);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/admin/contact-sales") {
            void proxyContactSalesSummaryGet(req, res);
            return true;
        }
        const githubRepoMatch = url.pathname.match(/^\/api\/aios\/github\/repos\/(.+)$/);
        if (req.method === "GET" && githubRepoMatch) {
            void proxyAiosJsonRequest(req, res, `/api/github/repos/${githubRepoMatch[1]}`, "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/google-drive/picker-config") {
            void proxyAiosJsonRequest(req, res, "/api/google-drive/picker-config", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/google-drive/download") {
            void proxyAiosJsonRequest(req, res, "/api/google-drive/download", "GET");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/aios/onedrive/download") {
            void proxyAiosJsonRequest(req, res, "/api/onedrive/download", "GET");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/google-drive/login") {
            void proxyAiosJsonRequest(req, res, "/api/google-drive/login", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/gmail/login") {
            void proxyAiosJsonRequest(req, res, "/api/gmail/login", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/github/login") {
            void proxyAiosJsonRequest(req, res, "/api/github/login", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/notion/login") {
            void proxyAiosNotionLoginRequest(req, res);
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/onedrive/login") {
            void proxyAiosJsonRequest(req, res, "/api/onedrive/login", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/google-drive/disconnect") {
            void proxyAiosJsonRequest(req, res, "/api/google-drive/disconnect", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/gmail/disconnect") {
            void proxyAiosJsonRequest(req, res, "/api/gmail/disconnect", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/gmail/send") {
            void proxyAiosJsonRequest(req, res, "/api/gmail/send", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/github/disconnect") {
            void proxyAiosJsonRequest(req, res, "/api/github/disconnect", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/notion/disconnect") {
            void proxyAiosJsonRequest(req, res, "/api/notion/disconnect", "POST");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/aios/onedrive/disconnect") {
            void proxyAiosJsonRequest(req, res, "/api/onedrive/disconnect", "POST");
            return true;
        }
        if (testsService.handleRequest(req, res, url)) {
            return true;
        }
        if (assuranceService.handleRequest(req, res, url)) {
            return true;
        }
        if (evaluationsService.handleRequest(req, res, url)) {
            return true;
        }
        if (fineTuningService.handleRequest(req, res, url)) {
            return true;
        }
        return false;
    };
}
