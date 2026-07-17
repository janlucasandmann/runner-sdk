import { sanitizeAgentAssistantPresetMessagesPayload } from "./message-sanitization.mjs";

export function createThreadMessageHistoryGateway(bindings) {
    const { fetchAiosCloud, hasAiosSession, parseUpstreamUrl, port, readOptionalApiKey, sendJson, withProxyOrganizationHeader } = bindings;
    async function proxyThreadMessagesGet(req, res, threadId) {
        try {
            const upstreamUrl = parseUpstreamUrl(req, {});
            const apiKey = readOptionalApiKey(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const upstreamPath = `/threads/${encodeURIComponent(threadId)}/messages`;
            const upstreamPathWithSearch = `${upstreamPath}${requestUrl.search || ""}`;
            let upstream;
            if (apiKey) {
                const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
                upstreamTarget.search = requestUrl.search;
                upstream = await fetch(upstreamTarget.toString(), {
                    method: "GET",
                    headers: withProxyOrganizationHeader(req, {}, {
                        "X-API-Key": apiKey,
                    }),
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, upstreamPathWithSearch, {
                    method: "GET",
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const text = await upstream.text();
            let parsed = {};
            try {
                parsed = text ? JSON.parse(text) : {};
            }
            catch {
                parsed = { message: text };
            }
            return sendJson(res, upstream.status, sanitizeAgentAssistantPresetMessagesPayload(parsed));
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy thread messages",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({ proxyThreadMessagesGet });
}
