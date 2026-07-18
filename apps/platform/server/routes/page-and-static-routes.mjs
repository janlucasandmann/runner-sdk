/** Ordered page and static compatibility routes. */
export function createPageAndStaticRoutes(bindings) {
    const { githubOauthAllowedOrigins, githubOauthEnvFileCandidates, handleFeedbackSummaryPageRequest, handleGithubApiRequest, handleProductUsageSummaryPageRequest, isGithubApiRequestPath, noVncNextRoot, platformDocumentHtml, platformOrigin, platformViteOrigin, serveAiosPublicAsset, serveDistAsset, serveEnvironmentGuiViewerPage, servePlatformClient, serveVendorAsset, xlsxRoot, } = bindings;
    return function handlePageAndStaticRoutes(req, res, url) {
        const rawThreadPathMatch = url.pathname.match(/^\/(thread[_-][A-Za-z0-9_-]+)\/?$/);
        if ((req.method === "GET" || req.method === "HEAD") && rawThreadPathMatch) {
            const target = new URL("/", platformOrigin);
            target.searchParams.set("thread", rawThreadPathMatch[1]);
            url.searchParams.forEach((value, key) => {
                if (key !== "thread") {
                    target.searchParams.append(key, value);
                }
            });
            res.writeHead(308, { Location: target.toString() });
            res.end();
            return true;
        }
        if (isGithubApiRequestPath(url.pathname)) {
            void handleGithubApiRequest({
                req,
                res,
                url,
                platformOrigin,
                envFileCandidates: githubOauthEnvFileCandidates,
                allowedOrigins: githubOauthAllowedOrigins,
            });
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD")
            && (url.pathname === "/"
                || url.pathname === "/demo"
                || url.pathname === "/demo/"
                || url.pathname === "/compat"
                || url.pathname === "/compat/"
                || url.pathname === "/login"
                || url.pathname === "/signup"
                || url.pathname === "/logout")) {
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store",
            });
            res.end(req.method === "HEAD" ? undefined : platformDocumentHtml);
            return true;
        }
        if (req.method === "GET" && (url.pathname === "/feedback-summary" || url.pathname === "/feedback-summary/")) {
            void handleFeedbackSummaryPageRequest(req, res);
            return true;
        }
        if (req.method === "GET" && (url.pathname === "/usage-summary" || url.pathname === "/usage-summary/")) {
            void handleProductUsageSummaryPageRequest(req, res);
            return true;
        }
        if (req.method === "GET" && url.pathname === "/environment-gui/viewer") {
            serveEnvironmentGuiViewerPage(res);
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD") && url.pathname === "/favicon.ico") {
            void serveAiosPublicAsset(req, res, "/img/logos/favicon-32x32.png");
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD") && url.pathname.startsWith("/vendor/novnc-next/")) {
            void serveVendorAsset(req, res, noVncNextRoot, "/vendor/novnc-next/");
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD") && url.pathname.startsWith("/vendor/xlsx/")) {
            void serveVendorAsset(req, res, xlsxRoot, "/vendor/xlsx/");
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD") && url.pathname.startsWith("/dist/")) {
            void serveDistAsset(req, res);
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD")
            && (url.pathname === "/platform-client"
                || url.pathname.startsWith("/platform-client/"))) {
            if (platformViteOrigin) {
                const target = new URL(
                    url.pathname === "/platform-client"
                        ? "/platform-client/"
                        : url.pathname,
                    platformViteOrigin,
                );
                target.search = url.search;
                res.writeHead(307, { Location: target.toString() });
                res.end();
                return true;
            }
            void servePlatformClient(req, res, url);
            return true;
        }
        if ((req.method === "GET" || req.method === "HEAD") && url.pathname.startsWith("/img/")) {
            void serveAiosPublicAsset(req, res);
            return true;
        }
        return false;
    };
}
