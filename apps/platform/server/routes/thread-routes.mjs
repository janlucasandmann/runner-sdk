/** Ordered thread compatibility routes. */
export function createThreadRoutes(bindings) {
    const { inferProxyContentTypeFromPath, matchThreadProxyRoute, proxyCreateThread, proxyThreadMessages, proxyThreadMessagesGet, proxyThreadPermissionDecision, proxyThreadStepHtmlPreview, proxyThreadTraceClustersGet, proxyUpstreamBinaryGet, proxyUpstreamGet, proxyUpstreamJsonRequest, proxyUpstreamStreamRequest, wantsThreadEventStream, } = bindings;
    return function handleThreadRoutes(req, res, url) {
        // New proxy shape (matches RunnerChat backend contract)
        if (req.method === "GET" && url.pathname === "/api/real/threads") {
            void proxyUpstreamGet(req, res, "/threads");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/real/threads") {
            void proxyCreateThread(req, res);
            return true;
        }
        const threadV2ProxyRoute = matchThreadProxyRoute(req.method, url.pathname);
        if (threadV2ProxyRoute) {
            if (threadV2ProxyRoute.transport === "event-stream-or-json" && wantsThreadEventStream(req, url)) {
                void proxyUpstreamStreamRequest(req, res, threadV2ProxyRoute.upstreamPath, threadV2ProxyRoute.method);
            }
            else if (threadV2ProxyRoute.method === "GET") {
                void proxyUpstreamGet(req, res, threadV2ProxyRoute.upstreamPath);
            }
            else {
                void proxyUpstreamJsonRequest(req, res, threadV2ProxyRoute.upstreamPath, threadV2ProxyRoute.method);
            }
            return true;
        }
        const threadStepsMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps$/);
        if (req.method === "GET" && threadStepsMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepsMatch[1]))}/steps`);
            return true;
        }
        const threadTraceClustersMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/trace-clusters$/);
        if (req.method === "GET" && threadTraceClustersMatch) {
            void proxyThreadTraceClustersGet(req, res, decodeURIComponent(threadTraceClustersMatch[1]));
            return true;
        }
        const threadStepFilesMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/files$/);
        if (req.method === "GET" && threadStepFilesMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepFilesMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepFilesMatch[2]))}/files`);
            return true;
        }
        const threadStepDiffMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/diff$/);
        if (req.method === "GET" && threadStepDiffMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepDiffMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepDiffMatch[2]))}/diff`);
            return true;
        }
        const threadStepRevertMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/revert$/);
        if (req.method === "POST" && threadStepRevertMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepRevertMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepRevertMatch[2]))}/revert`, "POST");
            return true;
        }
        const threadStepForkMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/fork$/);
        if (req.method === "POST" && threadStepForkMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepForkMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepForkMatch[2]))}/fork`, "POST");
            return true;
        }
        const threadStepFileMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/file$/);
        if (req.method === "GET" && threadStepFileMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepFileMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepFileMatch[2]))}/file`);
            return true;
        }
        const threadStepHtmlPreviewPathMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/file\/preview-html-path\/(.+)$/);
        if (req.method === "GET" && threadStepHtmlPreviewPathMatch) {
            void proxyThreadStepHtmlPreview(req, res, threadStepHtmlPreviewPathMatch[1], threadStepHtmlPreviewPathMatch[2], threadStepHtmlPreviewPathMatch[3]);
            return true;
        }
        const threadStepFileDownloadPathMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/file\/download-path\/(.+)$/);
        if (req.method === "GET" && threadStepFileDownloadPathMatch) {
            const decodedFilePath = threadStepFileDownloadPathMatch[3]
                .split("/")
                .filter(Boolean)
                .map((segment) => decodeURIComponent(segment))
                .join("/");
            const upstreamSearch = new URLSearchParams(url.searchParams);
            upstreamSearch.set("path", decodedFilePath);
            void proxyUpstreamBinaryGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepFileDownloadPathMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepFileDownloadPathMatch[2]))}/file/download?${upstreamSearch.toString()}`, {
                contentType: inferProxyContentTypeFromPath(decodedFilePath),
            });
            return true;
        }
        const threadStepFileDownloadMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/steps\/([^/]+)\/file\/download$/);
        if (req.method === "GET" && threadStepFileDownloadMatch) {
            void proxyUpstreamBinaryGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStepFileDownloadMatch[1]))}/steps/${encodeURIComponent(decodeURIComponent(threadStepFileDownloadMatch[2]))}/file/download${url.search || ""}`);
            return true;
        }
        const threadFileHistoryMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/files\/history$/);
        if (req.method === "GET" && threadFileHistoryMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadFileHistoryMatch[1]))}/files/history`);
            return true;
        }
        const threadStatusMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/status$/);
        if (req.method === "GET" && threadStatusMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadStatusMatch[1]))}/status`);
            return true;
        }
        const threadResearchMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/research$/);
        if (req.method === "GET" && threadResearchMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadResearchMatch[1]))}/research`);
            return true;
        }
        const threadPermissionRequestsMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/permission-requests$/);
        if (req.method === "GET" && threadPermissionRequestsMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadPermissionRequestsMatch[1]))}/permission-requests`);
            return true;
        }
        const threadPermissionDecisionMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/permission-requests\/([^/]+)\/decision$/);
        if (req.method === "POST" && threadPermissionDecisionMatch) {
            void proxyThreadPermissionDecision(req, res, decodeURIComponent(threadPermissionDecisionMatch[1]), decodeURIComponent(threadPermissionDecisionMatch[2]));
            return true;
        }
        const threadFeedbackMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/feedback$/);
        if (req.method === "GET" && threadFeedbackMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadFeedbackMatch[1]))}/feedback`);
            return true;
        }
        if (req.method === "POST" && threadFeedbackMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadFeedbackMatch[1]))}/feedback`, "POST");
            return true;
        }
        const threadFeedbackReportMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/feedback\/report$/);
        if (req.method === "POST" && threadFeedbackReportMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadFeedbackReportMatch[1]))}/feedback/report`, "POST");
            return true;
        }
        const threadCancelMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/cancel$/);
        if (req.method === "POST" && threadCancelMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadCancelMatch[1]))}/cancel`, "POST");
            return true;
        }
        const threadGenerateTitleMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/generate-title$/);
        if (req.method === "POST" && threadGenerateTitleMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadGenerateTitleMatch[1]))}/generate-title`, "POST");
            return true;
        }
        const threadDetailMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)$/);
        if (req.method === "GET" && threadDetailMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadDetailMatch[1]))}`);
            return true;
        }
        if (req.method === "PATCH" && threadDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadDetailMatch[1]))}`, "PATCH");
            return true;
        }
        if (req.method === "DELETE" && threadDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadDetailMatch[1]))}`, "DELETE");
            return true;
        }
        const threadLogsMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/logs$/);
        if (req.method === "GET" && threadLogsMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadLogsMatch[1]))}/logs`);
            return true;
        }
        const threadDiffsMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/diffs$/);
        if (req.method === "GET" && threadDiffsMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadDiffsMatch[1]))}/diffs`);
            return true;
        }
        const newMessagesMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/messages$/);
        if (req.method === "GET" && newMessagesMatch) {
            void proxyThreadMessagesGet(req, res, decodeURIComponent(newMessagesMatch[1]));
            return true;
        }
        if (req.method === "POST" && newMessagesMatch) {
            void proxyThreadMessages(req, res, decodeURIComponent(newMessagesMatch[1]));
            return true;
        }
        const threadCopyMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/copy$/);
        if (req.method === "POST" && threadCopyMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadCopyMatch[1]))}/copy`, "POST");
            return true;
        }
        const forkFromMessageMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/fork-from-message$/);
        if (req.method === "POST" && forkFromMessageMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(forkFromMessageMatch[1]))}/fork-from-message`, "POST");
            return true;
        }
        const threadContextMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/context$/);
        if (req.method === "GET" && threadContextMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadContextMatch[1]))}/context`);
            return true;
        }
        const threadContextDetailsMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/context\/details$/);
        if (req.method === "GET" && threadContextDetailsMatch) {
            void proxyUpstreamGet(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadContextDetailsMatch[1]))}/context/details`);
            return true;
        }
        const threadContextActionMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/context\/actions$/);
        if (req.method === "POST" && threadContextActionMatch) {
            void proxyUpstreamJsonRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadContextActionMatch[1]))}/context/actions`, "POST");
            return true;
        }
        const threadBtwStreamMatch = url.pathname.match(/^\/api\/real\/threads\/([^/]+)\/context\/actions\/btw\/stream$/);
        if (req.method === "POST" && threadBtwStreamMatch) {
            void proxyUpstreamStreamRequest(req, res, `/threads/${encodeURIComponent(decodeURIComponent(threadBtwStreamMatch[1]))}/context/actions/btw/stream`, "POST");
            return true;
        }
        return false;
    };
}
