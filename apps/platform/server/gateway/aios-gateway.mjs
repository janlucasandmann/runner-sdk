import {
    mergeCustomSkillLists,
    normalizeNotionAuthUrl,
    renderBriefingPreviewHtml,
} from "./aios-domain.mjs";
import { readResponseJson } from "./http-utils.mjs";

export function createAiosGateway(bindings) {
    const { aiosOrigin, defaultUpstreamOrigin, isUnauthorizedHttpStatus, normalizeBackendUrl, normalizePlaygroundApiKey, notionOauthCallbackUri, port, readHeader, readRequestBody, sendJson, withProxyOrganizationHeader, } = bindings;
    async function proxyAiosJsonRequest(req, res, upstreamPath, method) {
        try {
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const upstreamTarget = new URL(`${aiosOrigin}${upstreamPath}`);
            upstreamTarget.search = requestUrl.search;
            const headers = {
                cookie: req.headers.cookie || "",
                authorization: req.headers.authorization || "",
                "x-api-key": req.headers["x-api-key"] || "",
                "content-type": req.headers["content-type"] || "application/json",
            };
            const init = {
                method,
                headers,
            };
            if (method !== "GET" && method !== "HEAD") {
                const body = await readRequestBody(req);
                init.body = JSON.stringify(body);
            }
            const upstream = await fetch(upstreamTarget.toString(), init);
            const parsed = await readResponseJson(upstream);
            const responseHeaders = {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
            };
            const setCookie = upstream.headers.get("set-cookie");
            if (setCookie) {
                responseHeaders["Set-Cookie"] = setCookie;
            }
            res.writeHead(upstream.status, responseHeaders);
            res.end(JSON.stringify(parsed));
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy aiOS JSON request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function handleAiosUserSessionRequest(req, res) {
        const baseHeaders = {
            cookie: req.headers.cookie || "",
            authorization: req.headers.authorization || "",
            "x-api-key": req.headers["x-api-key"] || "",
            "content-type": req.headers["content-type"] || "application/json",
        };
        async function fetchAiosSessionJson(upstreamPath) {
            const upstreamTarget = new URL(`${aiosOrigin}${upstreamPath}`);
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: baseHeaders,
            });
            const data = await readResponseJson(upstream);
            return {
                ok: upstream.ok,
                status: upstream.status,
                data,
                setCookie: upstream.headers.get("set-cookie") || "",
            };
        }
        try {
            const [profileResult, streamingResult] = await Promise.all([
                fetchAiosSessionJson("/api/user/profile"),
                fetchAiosSessionJson("/api/user/streaming-key").catch((error) => ({
                    ok: false,
                    status: 502,
                    data: {
                        error: "Failed to load runner access.",
                        message: error instanceof Error ? error.message : String(error),
                    },
                    setCookie: "",
                })),
            ]);
            const responseHeaders = {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
            };
            const setCookieHeaders = [profileResult.setCookie, streamingResult.setCookie].filter(Boolean);
            if (setCookieHeaders.length) {
                responseHeaders["Set-Cookie"] = setCookieHeaders;
            }
            if (!profileResult.ok) {
                res.writeHead(profileResult.status, responseHeaders);
                res.end(JSON.stringify(profileResult.data || {}));
                return;
            }
            res.writeHead(200, responseHeaders);
            res.end(JSON.stringify({
                profile: profileResult.data || {},
                streaming: streamingResult.data || {},
                streamingOk: Boolean(streamingResult.ok),
                streamingStatus: streamingResult.status,
            }));
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to load account session.",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyAiosNotionLoginRequest(req, res) {
        try {
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const upstreamTarget = new URL(`${aiosOrigin}/api/notion/login`);
            upstreamTarget.search = requestUrl.search;
            const headers = {
                cookie: req.headers.cookie || "",
                authorization: req.headers.authorization || "",
                "x-api-key": req.headers["x-api-key"] || "",
                "content-type": req.headers["content-type"] || "application/json",
            };
            const body = await readRequestBody(req);
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "POST",
                headers,
                body: JSON.stringify(body),
            });
            let parsed = await readResponseJson(upstream);
            if (typeof parsed?.authUrl === "string") {
                const normalizedAuthUrl = normalizeNotionAuthUrl(
                    parsed.authUrl,
                    notionOauthCallbackUri,
                );
                if (normalizedAuthUrl !== parsed.authUrl) {
                    console.info("[platform-gateway] Rewrote local Notion OAuth redirect_uri for demo login.", {
                        callbackUri: notionOauthCallbackUri,
                    });
                }
                parsed = {
                    ...parsed,
                    authUrl: normalizedAuthUrl,
                };
            }
            const responseHeaders = {
                "Content-Type": "application/json; charset=utf-8",
                "Cache-Control": "no-store",
            };
            const setCookie = upstream.headers.get("set-cookie");
            if (setCookie) {
                responseHeaders["Set-Cookie"] = setCookie;
            }
            res.writeHead(upstream.status, responseHeaders);
            res.end(JSON.stringify(parsed));
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy Notion login request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyAiosLatestBriefingHtml(req, res) {
        try {
            const briefingMetaResponse = await fetch(new URL("/api/briefing/url", aiosOrigin).toString(), {
                method: "GET",
            });
            const briefingMeta = await readResponseJson(briefingMetaResponse);
            if (!briefingMetaResponse.ok) {
                return sendJson(res, briefingMetaResponse.status, {
                    error: "Failed to resolve briefing URL",
                    message: briefingMeta?.message || briefingMeta?.error || "Failed to load the latest daily briefing.",
                });
            }
            const briefingPublicUrl = typeof briefingMeta?.url === "string" ? briefingMeta.url.trim() : "";
            if (!briefingPublicUrl) {
                return sendJson(res, 404, {
                    error: "No briefing found",
                    message: "No daily briefing is available yet.",
                });
            }
            const briefingHtmlResponse = await fetch(briefingPublicUrl, {
                method: "GET",
            });
            const briefingHtml = await briefingHtmlResponse.text();
            if (!briefingHtmlResponse.ok) {
                return sendJson(res, briefingHtmlResponse.status, {
                    error: "Failed to load briefing HTML",
                    message: briefingHtml || "Unable to load the daily briefing preview.",
                });
            }
            const rewrittenHtml = renderBriefingPreviewHtml(
                briefingHtml,
                briefingPublicUrl,
            );
            res.writeHead(200, {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store",
            });
            res.end(rewrittenHtml);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy latest briefing HTML",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyPlaygroundCustomSkills(req, res) {
        try {
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            let projectId = requestUrl.searchParams.get("projectId")?.trim() || "";
            const cookie = req.headers.cookie || "";
            const authorization = req.headers.authorization || "";
            const apiKey = normalizePlaygroundApiKey(readHeader(req, "x-api-key"));
            let resolvedApiKey = apiKey;
            let aiosSkills = [];
            if (!projectId && (cookie || authorization)) {
                const profileResponse = await fetch(`${aiosOrigin}/api/user/profile`, {
                    method: "GET",
                    headers: {
                        cookie,
                        authorization,
                    },
                });
                if (profileResponse.ok) {
                    const profileData = await profileResponse.json().catch(() => ({}));
                    projectId = typeof profileData?.profile?.projectId === "string"
                        ? profileData.profile.projectId.trim()
                        : "";
                }
            }
            const aiosProjectId = projectId || "__runner_playground__";
            if (projectId || apiKey || cookie || authorization) {
                const aiosTarget = new URL(`${aiosOrigin}/api/projects/${encodeURIComponent(aiosProjectId)}/skills`);
                const aiosResponse = await fetch(aiosTarget.toString(), {
                    method: "GET",
                    headers: withProxyOrganizationHeader(req, {}, {
                        cookie,
                        authorization,
                        ...(apiKey ? { "x-api-key": apiKey } : {}),
                    }),
                });
                const aiosParsed = await readResponseJson(aiosResponse);
                if (aiosResponse.ok) {
                    aiosSkills = Array.isArray(aiosParsed?.skills) ? aiosParsed.skills : [];
                    if (aiosSkills.length > 0 && !apiKey) {
                        return sendJson(res, 200, {
                            skills: mergeCustomSkillLists(aiosSkills),
                            source: "aios",
                        });
                    }
                }
                if (!aiosResponse.ok && !isUnauthorizedHttpStatus(aiosResponse.status)) {
                    return sendJson(res, aiosResponse.status, aiosParsed);
                }
            }
            if (!resolvedApiKey && (cookie || authorization)) {
                const streamingResponse = await fetch(`${aiosOrigin}/api/user/streaming-key`, {
                    method: "GET",
                    headers: {
                        cookie,
                        authorization,
                    },
                });
                if (streamingResponse.ok) {
                    const streamingData = await streamingResponse.json().catch(() => ({}));
                    const nextApiKey = typeof streamingData?.apiKey === "string" ? streamingData.apiKey.trim() : "";
                    if (nextApiKey) {
                        resolvedApiKey = nextApiKey;
                    }
                }
            }
            const upstreamHeader = readHeader(req, "x-runner-upstream-url");
            if (!resolvedApiKey) {
                return sendJson(res, 200, { skills: [], source: "none" });
            }
            const upstreamTarget = new URL(`${normalizeBackendUrl(upstreamHeader || defaultUpstreamOrigin)}/v1/skills`);
            const upstreamResponse = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: withProxyOrganizationHeader(req, {}, {
                    "X-API-Key": resolvedApiKey,
                }),
            });
            const upstreamParsed = await readResponseJson(upstreamResponse);
            if (!upstreamResponse.ok) {
                if (aiosSkills.length > 0) {
                    return sendJson(res, 200, {
                        skills: mergeCustomSkillLists(aiosSkills),
                        source: "aios",
                    });
                }
                return sendJson(res, upstreamResponse.status, upstreamParsed);
            }
            const backendSkills = Array.isArray(upstreamParsed?.data)
                ? upstreamParsed.data
                : Array.isArray(upstreamParsed?.skills)
                    ? upstreamParsed.skills
                    : [];
            return sendJson(res, 200, {
                skills: mergeCustomSkillLists(aiosSkills, backendSkills),
                source: aiosSkills.length > 0 ? "merged" : "backend",
            });
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to load playground custom skills",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({
        handleAiosUserSessionRequest,
        proxyAiosJsonRequest,
        proxyAiosLatestBriefingHtml,
        proxyAiosNotionLoginRequest,
        proxyPlaygroundCustomSkills,
    });
}
