export function createThreadPermissionGateway(bindings) {
    const { fetchUpstreamJsonForProxy, readRequestBody, sendJson } = bindings;
    function unwrapProxyDataRecord(data, keys = []) {
        if (!data || typeof data !== "object" || Array.isArray(data)) {
            return {};
        }
        for (const key of keys) {
            const value = data[key];
            if (value && typeof value === "object" && !Array.isArray(value)) {
                return value;
            }
        }
        if (data.data && typeof data.data === "object" && !Array.isArray(data.data)) {
            return data.data;
        }
        return data;
    }
    function normalizeProxyPermissionDecision(value) {
        const normalized = String(value || "").trim().toLowerCase();
        return normalized === "allow" || normalized === "approve" || normalized === "approved" ? "allow" : "deny";
    }
    function isProxyRecord(value) {
        return Boolean(value && typeof value === "object" && !Array.isArray(value));
    }
    function getProxyRecordString(record, keys) {
        for (const key of keys) {
            const value = record?.[key];
            if (typeof value === "string" && value.trim()) {
                return value.trim();
            }
        }
        return "";
    }
    function getProxyPermissionMetadata(log) {
        if (!isProxyRecord(log)) {
            return {};
        }
        if (isProxyRecord(log.metadata)) {
            return log.metadata;
        }
        if (isProxyRecord(log.logMetadata)) {
            return log.logMetadata;
        }
        return {};
    }
    function getProxyLogsArray(data) {
        if (Array.isArray(data?.logs)) {
            return data.logs;
        }
        if (Array.isArray(data?.data)) {
            return data.data;
        }
        return Array.isArray(data) ? data : [];
    }
    function getProxyPermissionLogType(log) {
        if (!isProxyRecord(log)) {
            return "";
        }
        const normalized = getProxyRecordString(log, ["eventType", "event_type", "logType", "log_type", "kind"]).toLowerCase();
        if (normalized) {
            return normalized;
        }
        const type = getProxyRecordString(log, ["type"]).toLowerCase();
        return type === "permission_request" || type === "permission.requested" || type === "permission.resolved"
            ? type
            : "";
    }
    function isProxyPermissionLogRecord(log) {
        if (!isProxyRecord(log)) {
            return false;
        }
        const logType = getProxyPermissionLogType(log);
        if (logType === "permission_request" || logType === "permission.requested" || logType === "permission.resolved") {
            return true;
        }
        const message = getProxyRecordString(log, ["message", "content"]).toLowerCase();
        return message.startsWith("permission requested")
            || message === "permission pending"
            || message.startsWith("permission approved")
            || message.startsWith("permission granted")
            || message.startsWith("permission allowed")
            || message.startsWith("permission denied")
            || message.startsWith("permission rejected");
    }
    function getProxyPermissionRequestId(log) {
        const metadata = getProxyPermissionMetadata(log);
        const requestId = getProxyRecordString(metadata, [
            "permissionRequestId",
            "permission_request_id",
            "requestId",
            "request_id",
        ]) || getProxyRecordString(log, [
            "permissionRequestId",
            "permission_request_id",
            "requestId",
            "request_id",
        ]);
        if (requestId) {
            return requestId;
        }
        const metadataId = getProxyRecordString(metadata, ["id"]);
        return metadataId.startsWith("perm_") ? metadataId : "";
    }
    function normalizeProxyPermissionLogStatus(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (!normalized) {
            return "";
        }
        if (normalized === "pending" || normalized === "requested") {
            return "pending";
        }
        if (normalized === "allow" || normalized === "allowed" || normalized === "approve" || normalized === "approved" || normalized === "granted") {
            return "approved";
        }
        if (normalized === "deny" || normalized === "denied" || normalized === "reject" || normalized === "rejected" || normalized === "cancelled" || normalized === "canceled") {
            return "denied";
        }
        return normalized;
    }
    function getProxyPermissionLogStatus(log) {
        const metadata = getProxyPermissionMetadata(log);
        const explicitStatus = getProxyRecordString(metadata, ["status", "decision", "state"])
            || getProxyRecordString(log, ["status", "decision", "state"]);
        const normalizedStatus = normalizeProxyPermissionLogStatus(explicitStatus);
        if (normalizedStatus) {
            return normalizedStatus;
        }
        const message = getProxyRecordString(log, ["message", "content"]).toLowerCase();
        if (message.startsWith("permission requested") || message === "permission pending") {
            return "pending";
        }
        if (message.startsWith("permission approved") || message.startsWith("permission granted") || message.startsWith("permission allowed")) {
            return "approved";
        }
        if (message.startsWith("permission denied") || message.startsWith("permission rejected")) {
            return "denied";
        }
        return "";
    }
    function safeProxyJsonIncludes(value, needle) {
        if (!needle) {
            return false;
        }
        try {
            return JSON.stringify(value).includes(needle);
        }
        catch {
            return false;
        }
    }
    function collectPersistedPermissionLogMatches(logs, requestId) {
        const normalizedRequestId = String(requestId || "").trim();
        if (!normalizedRequestId) {
            return [];
        }
        return getProxyLogsArray(logs)
            .map((log, index) => {
            if (!isProxyPermissionLogRecord(log)) {
                return null;
            }
            const logRequestId = getProxyPermissionRequestId(log);
            const requestMatches = logRequestId === normalizedRequestId
                || (!logRequestId && safeProxyJsonIncludes(log, normalizedRequestId));
            if (!requestMatches) {
                return null;
            }
            const metadata = getProxyPermissionMetadata(log);
            const createdAt = getProxyRecordString(log, ["createdAt", "created_at", "timestamp", "time"]);
            const createdAtMs = Date.parse(createdAt || "");
            return {
                index,
                createdAt,
                createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : null,
                eventType: getProxyPermissionLogType(log),
                hasRequestId: Boolean(logRequestId),
                metadataKeys: Object.keys(metadata).sort(),
                status: getProxyPermissionLogStatus(log),
            };
        })
            .filter(Boolean)
            .sort((left, right) => {
            if (left.createdAtMs !== null && right.createdAtMs !== null && left.createdAtMs !== right.createdAtMs) {
                return left.createdAtMs - right.createdAtMs;
            }
            return left.index - right.index;
        });
    }
    function getPersistedPermissionLogPendingState(logs, requestId) {
        const matches = collectPersistedPermissionLogMatches(logs, requestId);
        const latestMatch = matches[matches.length - 1] || null;
        return {
            matches,
            isPending: Boolean(latestMatch && (!latestMatch.status || latestMatch.status === "pending")),
        };
    }
    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async function proxyThreadPermissionDecision(req, res, threadId, requestId) {
        try {
            const body = await readRequestBody(req);
            const decision = normalizeProxyPermissionDecision(body?.decision);
            const upstreamPath = `/threads/${encodeURIComponent(threadId)}/permission-requests/${encodeURIComponent(requestId)}/decision`;
            let upstreamResult = await fetchUpstreamJsonForProxy(req, upstreamPath, "POST", {
                ...body,
                decision,
            });
            for (let attempt = 0; upstreamResult.status === 404 && attempt < 4; attempt += 1) {
                await delay(150 + attempt * 150);
                upstreamResult = await fetchUpstreamJsonForProxy(req, upstreamPath, "POST", {
                    ...body,
                    decision,
                });
            }
            if (upstreamResult.status !== 404) {
                return sendJson(res, upstreamResult.status, upstreamResult.data);
            }
            const logsResult = await fetchUpstreamJsonForProxy(req, `/threads/${encodeURIComponent(threadId)}/logs`, "GET", undefined);
            const permissionLogState = getPersistedPermissionLogPendingState(logsResult.data, requestId);
            if (logsResult.status < 200 || logsResult.status >= 300 || !permissionLogState.isPending) {
                console.warn("[platform-gateway] Permission decision fallback did not find a pending persisted request", {
                    threadId,
                    requestId,
                    decision,
                    upstreamStatus: upstreamResult.status,
                    logsStatus: logsResult.status,
                    logsCount: getProxyLogsArray(logsResult.data).length,
                    matches: permissionLogState.matches,
                    upstreamError: upstreamResult.data?.error || upstreamResult.data?.message || "",
                });
                return sendJson(res, upstreamResult.status, upstreamResult.data);
            }
            const resolvedStatus = decision === "allow" ? "approved" : "denied";
            await fetchUpstreamJsonForProxy(req, `/threads/${encodeURIComponent(threadId)}/logs`, "POST", {
                logs: [{
                        message: `Permission ${resolvedStatus}`,
                        type: decision === "allow" ? "success" : "warning",
                        eventType: "permission_request",
                        metadata: {
                            permissionRequestId: requestId,
                            decision: resolvedStatus,
                            status: resolvedStatus,
                            resolvedFromPersistedRequest: true,
                        },
                    }],
            }).catch(() => null);
            await fetchUpstreamJsonForProxy(req, `/threads/${encodeURIComponent(threadId)}`, "PATCH", {
                status: decision === "allow" ? "completed" : "cancelled",
                completedAt: new Date().toISOString(),
            }).catch(() => null);
            console.info("[platform-gateway] Permission decision recorded from persisted request", {
                threadId,
                requestId,
                decision,
                matches: permissionLogState.matches,
            });
            return sendJson(res, 200, {
                ok: true,
                requestId,
                decision,
                active: false,
                message: "Permission decision recorded. The original runtime session is no longer active.",
            });
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy permission decision",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({ proxyThreadPermissionDecision });
}
