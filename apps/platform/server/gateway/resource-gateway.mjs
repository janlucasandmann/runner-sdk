import { readResponseJson } from "./http-utils.mjs";
import {
    extractPlatformOverviewItems as extractPlaygroundOverviewItems,
    normalizePlatformOverviewServerKind as normalizePlaygroundOverviewServerKind,
    resolvePlatformOverviewDurationMs as resolvePlaygroundOverviewDurationMs,
    resolvePlatformOverviewTimestampMs as resolvePlaygroundOverviewTimestampMs,
} from "./resource-overview-domain.mjs";

export function createResourceGateway(bindings) {
    const { aiosOrigin, defaultUpstreamOrigin, fetchAiosCloud, hasAiosSession, normalizeBackendUrl, parseUpstreamUrl, readHeader, readOptionalApiKey, readRequestBody, sendJson, withProxyOrganizationHeader, } = bindings;
    async function fetchUpstreamOverviewJson(req, upstreamPath) {
        const upstreamUrl = parseUpstreamUrl(req, {});
        const apiKey = readOptionalApiKey(req, {});
        if (apiKey) {
            const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: withProxyOrganizationHeader(req, {}, {
                    "X-API-Key": apiKey,
                }),
            });
            const parsed = await readResponseJson(upstream);
            return { status: upstream.status, data: parsed };
        }
        if (hasAiosSession(req)) {
            const normalizedPath = upstreamPath.startsWith("/") ? upstreamPath : `/${upstreamPath}`;
            const [pathname, queryString = ""] = normalizedPath.split("?");
            const targetUrl = new URL(`${aiosOrigin}/api/playground/cloud${pathname}`);
            targetUrl.search = queryString ? `?${queryString}` : "";
            const upstream = await fetch(targetUrl.toString(), {
                method: "GET",
                headers: withProxyOrganizationHeader(req, {}, {
                    cookie: req.headers.cookie || "",
                    authorization: req.headers.authorization || "",
                }),
            });
            const parsed = await readResponseJson(upstream);
            return { status: upstream.status, data: parsed };
        }
        return {
            status: 401,
            data: {
                error: "Unauthorized",
                message: "Sign in with Computer Agents or provide an API key.",
            },
        };
    }
    async function sendDatabaseBootstrap(req, res, databaseId, documentsLimit = 25) {
        const startedAt = performance.now();
        const timings = {};
        const timedFetch = async (name, path) => {
            const requestStartedAt = performance.now();
            const response = await fetchUpstreamOverviewJson(req, path);
            timings[name] = performance.now() - requestStartedAt;
            return response;
        };
        try {
            const encodedDatabaseId = encodeURIComponent(databaseId);
            const collectionsResponse = await timedFetch("collections", `/databases/${encodedDatabaseId}/collections`);
            timings.database = 0;
            timings.analytics = 0;
            if (collectionsResponse.status >= 400) {
                return sendJson(res, collectionsResponse.status, collectionsResponse.data);
            }
            const collections = extractPlaygroundOverviewItems(collectionsResponse.data, ["collections", "data"]);
            const selectedCollectionId = String(collections[0]?.id || "").trim();
            timings.documents = 0;
            timings.total = performance.now() - startedAt;
            const serverTiming = ["database", "analytics", "collections", "documents", "total"]
                .map((name) => `${name};dur=${Math.max(0, Number(timings[name] || 0)).toFixed(1)}`)
                .join(", ");
            return sendJson(res, 200, {
                database: null,
                analytics: null,
                collections,
                selectedCollectionId,
                documents: [],
                documentsLimit,
                hasMoreDocuments: false,
            }, {
                "Server-Timing": serverTiming,
            });
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to bootstrap database",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function sendEnvironmentOverviewAnalytics(req, res) {
        try {
            const bucketCount = 24;
            const now = new Date();
            now.setMinutes(0, 0, 0);
            const bucketStartMs = now.getTime() - ((bucketCount - 1) * 60 * 60 * 1000);
            const createdAfter = new Date(bucketStartMs).toISOString();
            const [threadsResponse, serversResponse, databasesResponse,] = await Promise.all([
                fetchUpstreamOverviewJson(req, `/threads?createdAfter=${encodeURIComponent(createdAfter)}&limit=2000`),
                fetchUpstreamOverviewJson(req, "/servers"),
                fetchUpstreamOverviewJson(req, "/databases"),
            ]);
            if (threadsResponse.status >= 400) {
                return sendJson(res, threadsResponse.status, threadsResponse.data);
            }
            const threadItems = extractPlaygroundOverviewItems(threadsResponse.data, ["data"]);
            const serverItems = serversResponse.status < 400
                ? extractPlaygroundOverviewItems(serversResponse.data, ["servers", "data"])
                : [];
            const databaseItems = databasesResponse.status < 400
                ? extractPlaygroundOverviewItems(databasesResponse.data, ["databases", "data"])
                : [];
            const computerBuckets = Array.from({ length: bucketCount }, (_, index) => {
                const startMs = bucketStartMs + (index * 60 * 60 * 1000);
                const startDate = new Date(startMs);
                return {
                    bucketStart: startDate.toISOString(),
                    label: `${String(startDate.getHours()).padStart(2, "0")}:00`,
                    activeMinutes: 0,
                };
            });
            const resourceBuckets = computerBuckets.map((bucket) => ({
                ...bucket,
                activeMinutes: 0,
            }));
            const bucketIndexByHourKey = new Map(computerBuckets.map((bucket, index) => [String(bucket.bucketStart || "").slice(0, 13), index]));
            let totalActiveMinutes24h = 0;
            let totalRuns24h = 0;
            let totalResourceActiveMinutes24h = 0;
            threadItems.forEach((thread) => {
                if (!thread?.environmentId) {
                    return;
                }
                const timestampMs = resolvePlaygroundOverviewTimestampMs(thread);
                if (timestampMs == null || timestampMs < bucketStartMs) {
                    return;
                }
                const normalizedBucketStartMs = bucketStartMs
                    + Math.floor((timestampMs - bucketStartMs) / (60 * 60 * 1000)) * 60 * 60 * 1000;
                const bucketIndex = Math.floor((normalizedBucketStartMs - bucketStartMs) / (60 * 60 * 1000));
                if (bucketIndex < 0 || bucketIndex >= computerBuckets.length) {
                    return;
                }
                totalRuns24h += 1;
                const durationMs = resolvePlaygroundOverviewDurationMs(thread);
                if (typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0) {
                    const durationMinutes = durationMs / 60000;
                    computerBuckets[bucketIndex].activeMinutes += durationMinutes;
                    totalActiveMinutes24h += durationMinutes;
                }
            });
            await Promise.allSettled([
                ...serverItems.map(async (server) => {
                    const serverId = String(server?.id || "").trim();
                    if (!serverId) {
                        return;
                    }
                    const normalizedKind = normalizePlaygroundOverviewServerKind(server?.kind);
                    if (normalizedKind === "agent_runtime") {
                        const response = await fetchUpstreamOverviewJson(req, `/servers/${encodeURIComponent(serverId)}/runs?limit=200`);
                        if (response.status >= 400) {
                            return;
                        }
                        const runs = extractPlaygroundOverviewItems(response.data, ["runs", "data"]);
                        runs.forEach((run) => {
                            const timestampMs = resolvePlaygroundOverviewTimestampMs(run);
                            if (timestampMs == null || timestampMs < bucketStartMs) {
                                return;
                            }
                            const normalizedBucketStartMs = bucketStartMs
                                + Math.floor((timestampMs - bucketStartMs) / (60 * 60 * 1000)) * 60 * 60 * 1000;
                            const bucketIndex = Math.floor((normalizedBucketStartMs - bucketStartMs) / (60 * 60 * 1000));
                            if (bucketIndex < 0 || bucketIndex >= resourceBuckets.length) {
                                return;
                            }
                            const durationMs = resolvePlaygroundOverviewDurationMs(run);
                            if (typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0) {
                                const durationMinutes = durationMs / 60000;
                                resourceBuckets[bucketIndex].activeMinutes += durationMinutes;
                                totalResourceActiveMinutes24h += durationMinutes;
                            }
                        });
                        return;
                    }
                    if (normalizedKind === "auth") {
                        const response = await fetchUpstreamOverviewJson(req, `/servers/${encodeURIComponent(serverId)}/auth-users?limit=1000`);
                        if (response.status >= 400) {
                            return;
                        }
                        const users = extractPlaygroundOverviewItems(response.data, ["users", "data"]);
                        const activeMinuteSets = resourceBuckets.map(() => new Set());
                        users.forEach((user) => {
                            [user?.createdAt, user?.lastSignInAt].forEach((candidate) => {
                                const timestampMs = Date.parse(String(candidate || ""));
                                if (!Number.isFinite(timestampMs) || timestampMs < bucketStartMs) {
                                    return;
                                }
                                const hourKey = new Date(timestampMs).toISOString().slice(0, 13);
                                const bucketIndex = bucketIndexByHourKey.get(hourKey);
                                if (typeof bucketIndex !== "number") {
                                    return;
                                }
                                activeMinuteSets[bucketIndex].add(Math.floor(timestampMs / 60000));
                            });
                        });
                        activeMinuteSets.forEach((minuteSet, bucketIndex) => {
                            const activeMinutes = minuteSet.size;
                            if (activeMinutes <= 0) {
                                return;
                            }
                            resourceBuckets[bucketIndex].activeMinutes += activeMinutes;
                            totalResourceActiveMinutes24h += activeMinutes;
                        });
                        return;
                    }
                    if (normalizedKind === "secrets" || normalizedKind === "payments") {
                        return;
                    }
                    const response = await fetchUpstreamOverviewJson(req, `/servers/${encodeURIComponent(serverId)}/analytics`);
                    if (response.status >= 400) {
                        return;
                    }
                    const trafficBuckets = Array.isArray(response.data?.charts?.traffic24h)
                        ? response.data.charts.traffic24h
                        : Array.isArray(response.data?.analytics?.charts?.traffic24h)
                            ? response.data.analytics.charts.traffic24h
                            : [];
                    trafficBuckets.forEach((entry) => {
                        const hourKey = String(entry?.bucketStart || entry?.timestamp || "").slice(0, 13);
                        const bucketIndex = bucketIndexByHourKey.get(hourKey);
                        if (typeof bucketIndex !== "number") {
                            return;
                        }
                        const exactActiveMinutes = Number(entry?.activeMinutes);
                        const fallbackActiveMinutes = Math.min(60, Math.max(0, Number(entry?.total || 0)));
                        const activeMinutes = Number.isFinite(exactActiveMinutes) && exactActiveMinutes >= 0
                            ? exactActiveMinutes
                            : fallbackActiveMinutes;
                        if (activeMinutes <= 0) {
                            return;
                        }
                        resourceBuckets[bucketIndex].activeMinutes += activeMinutes;
                        totalResourceActiveMinutes24h += activeMinutes;
                    });
                }),
                ...databaseItems.map(async (database) => {
                    const databaseId = String(database?.id || "").trim();
                    if (!databaseId) {
                        return;
                    }
                    const response = await fetchUpstreamOverviewJson(req, `/databases/${encodeURIComponent(databaseId)}/analytics`);
                    if (response.status >= 400) {
                        return;
                    }
                    const operationBuckets = Array.isArray(response.data?.analytics?.charts?.operations24h)
                        ? response.data.analytics.charts.operations24h
                        : Array.isArray(response.data?.charts?.operations24h)
                            ? response.data.charts.operations24h
                            : [];
                    operationBuckets.forEach((entry) => {
                        const hourKey = String(entry?.bucketStart || entry?.timestamp || "").slice(0, 13);
                        const bucketIndex = bucketIndexByHourKey.get(hourKey);
                        if (typeof bucketIndex !== "number") {
                            return;
                        }
                        const exactActiveMinutes = Number(entry?.activeMinutes);
                        const operationCount = Math.max(0, Number(entry?.reads || 0))
                            + Math.max(0, Number(entry?.writes || 0))
                            + Math.max(0, Number(entry?.deletes || 0));
                        const activeMinutes = Number.isFinite(exactActiveMinutes) && exactActiveMinutes >= 0
                            ? exactActiveMinutes
                            : Math.min(60, operationCount);
                        if (activeMinutes <= 0) {
                            return;
                        }
                        resourceBuckets[bucketIndex].activeMinutes += activeMinutes;
                        totalResourceActiveMinutes24h += activeMinutes;
                    });
                }),
            ]);
            return sendJson(res, 200, {
                available: true,
                summary: {
                    totalActiveMinutes24h: Math.round(totalActiveMinutes24h * 10) / 10,
                    totalRuns24h,
                    totalResourceActiveMinutes24h: Math.round(totalResourceActiveMinutes24h * 10) / 10,
                },
                charts: {
                    computerRuntime24h: computerBuckets.map((bucket) => ({
                        ...bucket,
                        activeMinutes: Math.round(bucket.activeMinutes * 10) / 10,
                    })),
                    resourceActiveMinutes24h: resourceBuckets.map((bucket) => ({
                        ...bucket,
                        activeMinutes: Math.round(bucket.activeMinutes * 10) / 10,
                    })),
                },
            });
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to load environment overview analytics",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    const ENVIRONMENT_START_PROXY_TIMEOUT_MS = 7500;
    async function proxyEnvironmentStart(req, res, environmentId) {
        try {
            const body = await readRequestBody(req);
            const upstreamUrl = parseUpstreamUrl(req, body);
            const apiKey = readOptionalApiKey(req, body);
            const upstreamPath = `/environments/${encodeURIComponent(environmentId)}/start`;
            let upstreamPromise;
            if (apiKey) {
                upstreamPromise = fetch(`${upstreamUrl}${upstreamPath}`, {
                    method: "POST",
                    headers: withProxyOrganizationHeader(req, body, {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    }),
                    body: JSON.stringify(body),
                });
            }
            else if (hasAiosSession(req)) {
                upstreamPromise = fetchAiosCloud(req, upstreamPath, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(body),
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            let timeoutId;
            const timeoutResult = Symbol("environment-start-timeout");
            const upstream = await Promise.race([
                upstreamPromise,
                new Promise((resolve) => {
                    timeoutId = setTimeout(() => resolve(timeoutResult), ENVIRONMENT_START_PROXY_TIMEOUT_MS);
                }),
            ]);
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            if (upstream === timeoutResult) {
                console.warn("[platform-gateway] Environment start is still running; returning warm-up placeholder without aborting upstream.", {
                    environmentId,
                });
                upstreamPromise
                    .then(async (upstreamResponse) => {
                    const text = await upstreamResponse.text().catch(() => "");
                    console.info("[platform-gateway] Background environment start completed", {
                        environmentId,
                        status: upstreamResponse.status,
                        message: text ? text.slice(0, 200) : "",
                    });
                })
                    .catch((error) => {
                    console.warn("[platform-gateway] Background environment start failed", {
                        environmentId,
                        error: error instanceof Error ? error.message : String(error),
                    });
                });
                return sendJson(res, 200, {
                    ok: true,
                    warming: true,
                    message: "Environment warm-up is still pending; continuing with thread execution.",
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
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to start environment via upstream backend",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyEnvironmentGuiSession(req, res, environmentId) {
        try {
            const upstreamUrl = normalizeBackendUrl(readHeader(req, "X-Runner-Upstream-Url") || defaultUpstreamOrigin);
            const body = await readRequestBody(req);
            const apiKey = readOptionalApiKey(req, body);
            let upstream;
            if (apiKey) {
                upstream = await fetch(`${upstreamUrl}/environments/${encodeURIComponent(environmentId)}/gui/session`, {
                    method: "POST",
                    headers: withProxyOrganizationHeader(req, body, {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    }),
                    body: JSON.stringify(body || {}),
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchAiosCloud(req, `/environments/${encodeURIComponent(environmentId)}/gui/session`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(body || {}),
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
            if (upstream.ok && parsed && typeof parsed === "object") {
                const websocketPath = typeof parsed.websocketPath === "string" ? parsed.websocketPath.trim() : "";
                if (websocketPath) {
                    const upstreamWsTarget = new URL(websocketPath, upstreamUrl);
                    upstreamWsTarget.protocol = upstreamWsTarget.protocol === "https:"
                        ? "wss:"
                        : upstreamWsTarget.protocol === "http:"
                            ? "ws:"
                            : upstreamWsTarget.protocol;
                    parsed.websocketPath = `/api/real/ws/vnc?upstream=${encodeURIComponent(upstreamWsTarget.toString())}`;
                }
            }
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to create desktop session",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({
        fetchUpstreamOverviewJson,
        proxyEnvironmentGuiSession,
        proxyEnvironmentStart,
        sendDatabaseBootstrap,
    });
}
