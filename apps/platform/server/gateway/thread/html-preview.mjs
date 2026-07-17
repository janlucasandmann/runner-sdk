export function createThreadHtmlPreviewGateway(bindings) {
    const { fetchAiosApi, fetchAiosCloud, hasAiosSession, isUnauthorizedHttpStatus, parseUpstreamUrl, port, readOptionalApiKey, sendJson, withProxyOrganizationHeader } = bindings;
    async function proxyThreadStepHtmlPreview(req, res, threadId, stepId, filePath) {
        try {
            const upstreamUrl = parseUpstreamUrl(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const apiKey = readOptionalApiKey(req, {});
            const normalizedThreadId = encodeURIComponent(decodeURIComponent(threadId));
            const normalizedStepId = encodeURIComponent(decodeURIComponent(stepId));
            const decodedFilePath = filePath
                .split("/")
                .filter(Boolean)
                .map((segment) => decodeURIComponent(segment))
                .join("/");
            const normalizedFilePath = decodedFilePath
                .split("/")
                .filter(Boolean)
                .map((segment) => encodeURIComponent(segment))
                .join("/");
            const upstreamPath = `/threads/${normalizedThreadId}/steps/${normalizedStepId}/file/download`;
            const upstreamSearch = new URLSearchParams(requestUrl.searchParams);
            upstreamSearch.set("path", decodedFilePath);
            let upstream;
            if (apiKey) {
                const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
                upstreamTarget.search = upstreamSearch.toString();
                upstream = await fetch(upstreamTarget.toString(), {
                    method: "GET",
                    headers: withProxyOrganizationHeader(req, {}, {
                        "X-API-Key": apiKey,
                    }),
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, `${upstreamPath}?${upstreamSearch.toString()}`, {
                    method: "GET",
                });
                if (isUnauthorizedHttpStatus(upstream.status) || upstream.status === 404) {
                    upstream = await fetchAiosApi(req, `/api${upstreamPath}?${upstreamSearch.toString()}`, {
                        method: "GET",
                    });
                }
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const responseText = await upstream.text();
            if (!upstream.ok) {
                let parsed = {};
                try {
                    parsed = responseText ? JSON.parse(responseText) : {};
                }
                catch {
                    parsed = { message: responseText };
                }
                return sendJson(res, upstream.status, parsed);
            }
            const normalizedPathSegments = normalizedFilePath.split("/").filter(Boolean);
            const directorySegments = normalizedPathSegments.slice(0, -1);
            const directoryDownloadUrl = new URL(`/api/real/threads/${normalizedThreadId}/steps/${normalizedStepId}/file/download-path/${directorySegments.length ? `${directorySegments.join("/")}/` : ""}`, requestUrl.origin).toString();
            const escapedBaseHref = directoryDownloadUrl
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
            const baseTag = `<base href="${escapedBaseHref}" />`;
            const shellStyles = '<style>html,body{margin:0;padding:0;background:#fff;color:#111;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;}img,svg,video,canvas,iframe{max-width:100%;height:auto;}pre{white-space:pre-wrap;word-break:break-word;}table{max-width:100%;border-collapse:collapse;}*{box-sizing:border-box;}</style>';
            let rewrittenHtml = String(responseText || "");
            if (/<head[\s>]/i.test(rewrittenHtml)) {
                rewrittenHtml = rewrittenHtml.replace(/<head(\s[^>]*)?>/i, (match) => `${match}${baseTag}${shellStyles}`);
            }
            else if (/<html[\s>]/i.test(rewrittenHtml)) {
                rewrittenHtml = rewrittenHtml.replace(/<html(\s[^>]*)?>/i, (match) => `${match}<head>${baseTag}${shellStyles}</head>`);
            }
            else {
                rewrittenHtml = `<!doctype html><html><head><meta charset="utf-8" />${baseTag}${shellStyles}</head><body>${rewrittenHtml}</body></html>`;
            }
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store",
            });
            res.end(rewrittenHtml);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to load thread step HTML preview",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({ proxyThreadStepHtmlPreview });
}
