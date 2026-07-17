import {
    isUnauthorizedHttpStatus,
    normalizeBackendUrl,
    normalizePlatformApiKey as normalizePlaygroundApiKey,
    readHeader,
    readRawRequestBuffer,
    readRequestBody,
    readResponseJson,
    sendJson,
} from "./http-utils.mjs";
import { summarizeRunnerStreamChunkForLog } from "./runner-stream-utils.mjs";

export function createCoreGateway(bindings) {
    const { aiosOrigin, defaultUpstreamOrigin, port, shouldForwardLocalCloudApiOverride, shouldRetryUpstreamWithAiosSession, } = bindings;
    function parseUpstreamUrl(req, body) {
        const headerUpstream = readHeader(req, "X-Runner-Upstream-Url");
        const bodyUpstream = body && typeof body.backendUrl === "string" ? body.backendUrl : "";
        return normalizeBackendUrl(headerUpstream || bodyUpstream || defaultUpstreamOrigin);
    }
    function readOptionalApiKey(req, body) {
        const headerApiKey = normalizePlaygroundApiKey(readHeader(req, "X-API-Key"));
        const bodyApiKey = body && typeof body.apiKey === "string" ? normalizePlaygroundApiKey(body.apiKey) : "";
        return (headerApiKey || bodyApiKey || "").trim();
    }
    function readOptionalOrganizationId(req, body) {
        const headerOrganizationId = String(readHeader(req, "x-computer-agents-organization") || "").trim();
        const bodyOrganizationId = body && typeof body.organizationId === "string" ? body.organizationId.trim() : "";
        return (headerOrganizationId || bodyOrganizationId || "").trim();
    }
    function withProxyOrganizationHeader(req, body, headers) {
        const organizationId = readOptionalOrganizationId(req, body || {});
        if (!organizationId) {
            return headers;
        }
        return {
            ...headers,
            "X-Computer-Agents-Organization": organizationId,
        };
    }
    function parseApiKey(req, body) {
        const apiKey = readOptionalApiKey(req, body);
        if (!apiKey)
            throw new Error("API key is required");
        return apiKey;
    }
    function hasAiosSession(req) {
        return Boolean((req.headers.cookie || "").trim() || (req.headers.authorization || "").trim());
    }
    function buildAiosCloudTarget(req, upstreamPath) {
        const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
        const normalizedPath = upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`;
        const targetUrl = new URL(`${aiosOrigin}/api/playground/cloud${normalizedPath}`);
        targetUrl.search = requestUrl.search;
        return targetUrl;
    }
    async function fetchAiosCloud(req, upstreamPath, init = {}) {
        const targetUrl = buildAiosCloudTarget(req, upstreamPath);
        const headers = withProxyOrganizationHeader(req, {}, {
            cookie: req.headers.cookie || "",
            authorization: req.headers.authorization || "",
            ...(init.headers || {}),
        });
        if (shouldForwardLocalCloudApiOverride && !headers["x-runner-upstream-url"]) {
            headers["x-runner-upstream-url"] = defaultUpstreamOrigin;
        }
        return fetch(targetUrl.toString(), {
            method: init.method || "GET",
            headers,
            signal: init.signal,
            body: init.body,
        });
    }
    async function fetchAiosApi(req, apiPath, init = {}) {
        const targetUrl = new URL(`${aiosOrigin}${apiPath}`);
        const headers = withProxyOrganizationHeader(req, {}, {
            cookie: req.headers.cookie || "",
            authorization: req.headers.authorization || "",
            ...(init.headers || {}),
        });
        return fetch(targetUrl.toString(), {
            method: init.method || "GET",
            headers,
            signal: init.signal,
            body: init.body,
        });
    }
    async function proxyUpstreamGet(req, res, upstreamPath, options = {}) {
        const controller = new AbortController();
        let didTimeout = false;
        const timeoutMs = Math.max(1000, Number(options?.timeoutMs) || 20000);
        const timeoutId = setTimeout(() => {
            didTimeout = true;
            if (!controller.signal.aborted) {
                controller.abort(new Error(`Upstream request timed out after ${timeoutMs}ms.`));
            }
        }, timeoutMs);
        const abortUpstreamIfClientClosed = () => {
            if (!res.writableEnded && !controller.signal.aborted) {
                controller.abort(new Error("Client request closed before the upstream request completed."));
            }
        };
        res.once("close", abortUpstreamIfClientClosed);
        try {
            const upstreamUrl = parseUpstreamUrl(req, {});
            const apiKey = readOptionalApiKey(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            let upstream;
            if (apiKey) {
                const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
                upstreamTarget.search = requestUrl.search;
                upstream = await fetch(upstreamTarget.toString(), {
                    method: "GET",
                    headers: withProxyOrganizationHeader(req, {}, {
                        "X-API-Key": apiKey,
                    }),
                    signal: controller.signal,
                });
                if (shouldRetryUpstreamWithAiosSession({
                    status: upstream.status,
                    usedApiKey: true,
                    hasSession: hasAiosSession(req),
                })) {
                    await upstream.body?.cancel().catch(() => undefined);
                    upstream = await fetchAiosCloud(req, upstreamPath + requestUrl.search, {
                        method: "GET",
                        signal: controller.signal,
                    });
                }
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, upstreamPath + requestUrl.search, {
                    method: "GET",
                    signal: controller.signal,
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const parsed = await readResponseJson(upstream);
            if (upstream.status === 404 && options?.emptyOn404) {
                return sendJson(res, 200, { data: [] });
            }
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            if (controller.signal.aborted && (res.writableEnded || res.destroyed)) {
                return false;
            }
            return sendJson(res, didTimeout ? 504 : 502, {
                error: didTimeout ? "Upstream GET request timed out" : "Failed to proxy upstream GET request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
        finally {
            clearTimeout(timeoutId);
            res.off("close", abortUpstreamIfClientClosed);
        }
    }
    async function proxyUpstreamJsonRequest(req, res, upstreamPath, method) {
        const controller = new AbortController();
        const abortUpstreamIfClientClosed = () => {
            if (!res.writableEnded && !controller.signal.aborted) {
                controller.abort(new Error("Client request closed before the upstream request completed."));
            }
        };
        res.once("close", abortUpstreamIfClientClosed);
        try {
            const upstreamUrl = parseUpstreamUrl(req, {});
            const body = method === "GET" || method === "HEAD" || method === "DELETE"
                ? undefined
                : await readRequestBody(req);
            const apiKey = readOptionalApiKey(req, body);
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            let upstream;
            if (apiKey) {
                const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
                upstreamTarget.search = requestUrl.search;
                upstream = await fetch(upstreamTarget.toString(), {
                    method,
                    headers: withProxyOrganizationHeader(req, body, {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    }),
                    signal: controller.signal,
                    body: body === undefined ? undefined : JSON.stringify(body),
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, upstreamPath, {
                    method,
                    headers: {
                        "content-type": "application/json",
                    },
                    signal: controller.signal,
                    body: body === undefined ? undefined : JSON.stringify(body),
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const parsed = await readResponseJson(upstream);
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            if (controller.signal.aborted && (res.writableEnded || res.destroyed)) {
                return;
            }
            return sendJson(res, 502, {
                error: `Failed to proxy upstream ${method} request`,
                message: error instanceof Error ? error.message : String(error),
            });
        }
        finally {
            res.off("close", abortUpstreamIfClientClosed);
        }
    }
    async function fetchUpstreamJsonForProxy(req, upstreamPath, method, body) {
        const upstreamUrl = parseUpstreamUrl(req, body || {});
        const apiKey = readOptionalApiKey(req, body || {});
        const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
        let upstream;
        if (apiKey) {
            const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
            upstreamTarget.search = requestUrl.search;
            upstream = await fetch(upstreamTarget.toString(), {
                method,
                headers: withProxyOrganizationHeader(req, body, {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                }),
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        }
        else if (hasAiosSession(req)) {
            upstream = await fetchAiosCloud(req, upstreamPath, {
                method,
                headers: {
                    "content-type": "application/json",
                },
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        }
        else {
            return {
                status: 401,
                data: {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                },
            };
        }
        const data = await readResponseJson(upstream);
        return { status: upstream.status, data };
    }
    async function fetchUpstreamJsonForProxyExactPath(req, upstreamPath, method = "GET", body) {
        const upstreamUrl = parseUpstreamUrl(req, body || {});
        const apiKey = readOptionalApiKey(req, body || {});
        const normalizedPath = upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`;
        let upstream;
        if (apiKey) {
            const upstreamTarget = new URL(`${upstreamUrl}${normalizedPath}`);
            upstream = await fetch(upstreamTarget.toString(), {
                method,
                headers: withProxyOrganizationHeader(req, body, {
                    "Content-Type": "application/json",
                    "X-API-Key": apiKey,
                }),
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        }
        else if (hasAiosSession(req)) {
            const targetUrl = new URL(`${aiosOrigin}/api/playground/cloud${normalizedPath}`);
            const headers = withProxyOrganizationHeader(req, body || {}, {
                cookie: req.headers.cookie || "",
                authorization: req.headers.authorization || "",
                "content-type": "application/json",
            });
            if (shouldForwardLocalCloudApiOverride && !headers["x-runner-upstream-url"]) {
                headers["x-runner-upstream-url"] = defaultUpstreamOrigin;
            }
            upstream = await fetch(targetUrl.toString(), {
                method,
                headers,
                body: body === undefined ? undefined : JSON.stringify(body),
            });
        }
        else {
            return {
                status: 401,
                data: {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                },
            };
        }
        const data = await readResponseJson(upstream);
        return { status: upstream.status, data };
    }
    async function proxyUpstreamRawRequest(req, res, upstreamPath, method) {
        try {
            const upstreamUrl = normalizeBackendUrl(readHeader(req, "X-Runner-Upstream-Url") || defaultUpstreamOrigin);
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const apiKey = normalizePlaygroundApiKey(readHeader(req, "X-API-Key"));
            const rawBody = method === "GET" || method === "HEAD" ? undefined : await readRawRequestBuffer(req);
            const contentType = req.headers["content-type"] || "application/octet-stream";
            let upstream;
            if (apiKey) {
                const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
                upstreamTarget.search = requestUrl.search;
                upstream = await fetch(upstreamTarget.toString(), {
                    method,
                    headers: withProxyOrganizationHeader(req, {}, {
                        "Content-Type": contentType,
                        "X-API-Key": apiKey,
                    }),
                    body: rawBody,
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, upstreamPath, {
                    method,
                    headers: {
                        "content-type": contentType,
                    },
                    body: rawBody,
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const parsed = await readResponseJson(upstream);
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: `Failed to proxy upstream ${method} request`,
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyUpstreamStreamRequest(req, res, upstreamPath, method) {
        const controller = new AbortController();
        let reader = null;
        const abortUpstreamIfClientClosed = () => {
            if (!controller.signal.aborted) {
                controller.abort(new Error("Client request closed before the upstream stream completed."));
            }
        };
        res.once("close", abortUpstreamIfClientClosed);
        try {
            const upstreamUrl = parseUpstreamUrl(req, {});
            const body = method === "GET" ? undefined : await readRequestBody(req);
            const apiKey = readOptionalApiKey(req, body);
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            let upstream;
            if (apiKey) {
                const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
                upstreamTarget.search = requestUrl.search;
                upstream = await fetch(upstreamTarget.toString(), {
                    method,
                    headers: withProxyOrganizationHeader(req, body, {
                        "Content-Type": "application/json",
                        Accept: req.headers.accept || "text/event-stream",
                        ...(req.headers["last-event-id"] ? { "Last-Event-ID": req.headers["last-event-id"] } : {}),
                        "X-API-Key": apiKey,
                    }),
                    signal: controller.signal,
                    body: body === undefined ? undefined : JSON.stringify(body),
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, upstreamPath, {
                    method,
                    headers: {
                        "content-type": "application/json",
                        accept: req.headers.accept || "text/event-stream",
                        ...(req.headers["last-event-id"] ? { "last-event-id": req.headers["last-event-id"] } : {}),
                    },
                    signal: controller.signal,
                    body: body === undefined ? undefined : JSON.stringify(body),
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            if (!upstream.ok) {
                const text = await upstream.text().catch(() => "");
                let parsed = {};
                try {
                    parsed = text ? JSON.parse(text) : {};
                }
                catch {
                    parsed = { message: text || `Upstream stream request failed with status ${upstream.status}` };
                }
                return sendJson(res, upstream.status, parsed);
            }
            if (!upstream.body) {
                const text = await upstream.text().catch(() => "");
                res.writeHead(upstream.status, {
                    "Content-Type": "application/json",
                });
                res.end(text);
                return;
            }
            res.writeHead(upstream.status, {
                "Content-Type": upstream.headers.get("content-type") || "text/event-stream",
                "Cache-Control": upstream.headers.get("cache-control") || "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no",
            });
            if (typeof res.flushHeaders === "function") {
                res.flushHeaders();
            }
            if (res.socket) {
                res.socket.setNoDelay(true);
            }
            reader = upstream.body.getReader();
            while (!res.destroyed && !res.writableEnded) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (value) {
                    res.write(Buffer.from(value));
                    if (typeof res.flush === "function") {
                        try {
                            res.flush();
                        }
                        catch { }
                    }
                }
            }
            if (!res.destroyed && !res.writableEnded)
                res.end();
        }
        catch (error) {
            if (controller.signal.aborted || res.destroyed || res.writableEnded)
                return false;
            return sendJson(res, 502, {
                error: `Failed to proxy upstream ${method} stream request`,
                message: error instanceof Error ? error.message : String(error),
            });
        }
        finally {
            res.off("close", abortUpstreamIfClientClosed);
            if (reader && controller.signal.aborted) {
                try {
                    await reader.cancel();
                }
                catch { }
            }
        }
    }
    function inferProxyContentTypeFromPath(filePath) {
        const normalizedPath = String(filePath || "").split("?")[0].toLowerCase();
        if (normalizedPath.endsWith(".css"))
            return "text/css; charset=utf-8";
        if (normalizedPath.endsWith(".js") || normalizedPath.endsWith(".mjs"))
            return "text/javascript; charset=utf-8";
        if (normalizedPath.endsWith(".html") || normalizedPath.endsWith(".htm"))
            return "text/html; charset=utf-8";
        if (normalizedPath.endsWith(".svg"))
            return "image/svg+xml";
        if (normalizedPath.endsWith(".png"))
            return "image/png";
        if (normalizedPath.endsWith(".jpg") || normalizedPath.endsWith(".jpeg"))
            return "image/jpeg";
        if (normalizedPath.endsWith(".gif"))
            return "image/gif";
        if (normalizedPath.endsWith(".webp"))
            return "image/webp";
        if (normalizedPath.endsWith(".avif"))
            return "image/avif";
        if (normalizedPath.endsWith(".json"))
            return "application/json; charset=utf-8";
        if (normalizedPath.endsWith(".txt"))
            return "text/plain; charset=utf-8";
        return "";
    }
    async function proxyUpstreamBinaryGet(req, res, upstreamPath, options = {}) {
        try {
            const upstreamUrl = parseUpstreamUrl(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const apiKey = readOptionalApiKey(req, {});
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
                upstream = await fetchAiosCloud(req, upstreamPath, {
                    method: "GET",
                });
                if (isUnauthorizedHttpStatus(upstream.status) || upstream.status === 404) {
                    const fallbackApiPath = `/api${upstreamPath}${requestUrl.search}`;
                    const fallbackResponse = await fetchAiosApi(req, fallbackApiPath, {
                        method: "GET",
                    });
                    upstream = fallbackResponse;
                }
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const upstreamContentType = upstream.headers.get("content-type") || "";
            const contentTypeOverride = String(options.contentType || "").trim();
            const responseHeaders = {
                "Content-Type": contentTypeOverride || upstreamContentType || "application/octet-stream",
                "Cache-Control": upstream.headers.get("cache-control") || "no-store",
                "X-Accel-Buffering": "no",
            };
            const contentDisposition = upstream.headers.get("content-disposition");
            if (contentDisposition) {
                responseHeaders["Content-Disposition"] = contentDisposition;
            }
            const acceptRanges = upstream.headers.get("accept-ranges");
            if (acceptRanges) {
                responseHeaders["Accept-Ranges"] = acceptRanges;
            }
            res.writeHead(upstream.status, responseHeaders);
            if (typeof res.flushHeaders === "function") {
                res.flushHeaders();
            }
            if (res.socket) {
                res.socket.setNoDelay(true);
            }
            if (!upstream.body) {
                const arrayBuffer = await upstream.arrayBuffer();
                res.end(Buffer.from(arrayBuffer));
                return;
            }
            const reader = upstream.body.getReader();
            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done || req.destroyed || res.destroyed)
                        break;
                    if (value) {
                        const chunk = Buffer.from(value);
                        if (!res.write(chunk)) {
                            await new Promise((resolve) => {
                                const finish = () => {
                                    res.off("drain", finish);
                                    res.off("close", finish);
                                    res.off("error", finish);
                                    resolve();
                                };
                                res.once("drain", finish);
                                res.once("close", finish);
                                res.once("error", finish);
                            });
                        }
                    }
                }
            }
            finally {
                try {
                    reader.releaseLock();
                }
                catch { }
            }
            if (!res.destroyed) {
                res.end();
            }
        }
        catch (error) {
            if (res.headersSent) {
                res.destroy(error instanceof Error ? error : undefined);
                return;
            }
            return sendJson(res, 502, {
                error: "Failed to proxy upstream binary GET request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({
        fetchAiosApi,
        fetchAiosCloud,
        fetchUpstreamJsonForProxy,
        fetchUpstreamJsonForProxyExactPath,
        hasAiosSession,
        inferProxyContentTypeFromPath,
        isUnauthorizedHttpStatus,
        normalizeBackendUrl,
        normalizePlaygroundApiKey,
        parseUpstreamUrl,
        proxyUpstreamBinaryGet,
        proxyUpstreamGet,
        proxyUpstreamJsonRequest,
        proxyUpstreamRawRequest,
        proxyUpstreamStreamRequest,
        readHeader,
        readOptionalApiKey,
        readRequestBody,
        sendJson,
        summarizeRunnerStreamChunkForLog,
        withProxyOrganizationHeader,
    });
}
