export function createThreadTraceGateway(bindings) {
    const { fetchUpstreamJsonForProxyExactPath, port, sendJson } = bindings;
    const PROXY_TRACE_RING_DEFINITIONS = {
        1: {
            ring: "ring_1",
            ringId: 1,
            ringLabel: "Ring 1",
            ringDescription: "Local workspace actions",
        },
        2: {
            ring: "ring_2",
            ringId: 2,
            ringLabel: "Ring 2",
            ringDescription: "Shared workspace or outbound communication actions",
        },
        3: {
            ring: "ring_3",
            ringId: 3,
            ringLabel: "Ring 3",
            ringDescription: "Public publishing or high-impact external actions",
        },
    };
    function normalizeProxyTraceRingId(value) {
        if (typeof value === "number" && Number.isFinite(value)) {
            return Math.min(3, Math.max(1, Math.round(value)));
        }
        const normalized = String(value || "").trim().toLowerCase();
        if (!normalized) {
            return 1;
        }
        if (normalized === "3" || normalized === "ring_3" || normalized === "ring-3" || normalized === "ring 3") {
            return 3;
        }
        if (normalized === "2" || normalized === "ring_2" || normalized === "ring-2" || normalized === "ring 2") {
            return 2;
        }
        return 1;
    }
    function getProxyTraceRingDefinition(value) {
        return PROXY_TRACE_RING_DEFINITIONS[normalizeProxyTraceRingId(value)] || PROXY_TRACE_RING_DEFINITIONS[1];
    }
    function getProxyPlainObject(value) {
        return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    }
    function normalizeProxyTraceArray(data, keys = []) {
        if (Array.isArray(data)) {
            return data;
        }
        if (!data || typeof data !== "object") {
            return [];
        }
        for (const key of keys) {
            if (Array.isArray(data[key])) {
                return data[key];
            }
        }
        if (Array.isArray(data.data))
            return data.data;
        if (Array.isArray(data.items))
            return data.items;
        if (Array.isArray(data.results))
            return data.results;
        return [];
    }
    function readProxyTraceText(value, maxLength = 260) {
        let text = "";
        if (typeof value === "string") {
            text = value;
        }
        else if (value && typeof value === "object") {
            const record = value;
            const metadata = getProxyPlainObject(record.metadata);
            const candidates = [
                record.summary,
                record.message,
                record.text,
                record.title,
                record.eventType,
                record.event_type,
                metadata.summary,
                metadata.message,
                metadata.command,
                metadata.output,
                metadata.result,
            ];
            for (const candidate of candidates) {
                if (typeof candidate === "string" && candidate.trim()) {
                    text = candidate;
                    break;
                }
                if (candidate && typeof candidate === "object") {
                    try {
                        text = JSON.stringify(candidate);
                        break;
                    }
                    catch { }
                }
            }
        }
        const compact = String(text || "").replace(/\s+/g, " ").trim();
        if (compact.length <= maxLength) {
            return compact;
        }
        return `${compact.slice(0, Math.max(0, maxLength - 1)).trim()}...`;
    }
    function readProxyTraceTimestamp(record, fallback = "") {
        const value = (record?.createdAt
            || record?.created_at
            || record?.timestamp
            || record?.updatedAt
            || record?.updated_at
            || fallback);
        const text = String(value || "").trim();
        if (!text) {
            return "";
        }
        const parsed = Date.parse(text);
        return Number.isFinite(parsed) ? new Date(parsed).toISOString() : text;
    }
    function getProxyTraceActionType(record) {
        const metadata = getProxyPlainObject(record?.metadata);
        return String(record?.type
            || record?.eventType
            || record?.event_type
            || record?.tool
            || record?.toolName
            || record?.tool_name
            || metadata.type
            || metadata.eventType
            || metadata.event_type
            || metadata.tool
            || metadata.toolName
            || metadata.tool_name
            || "").trim().toLowerCase();
    }
    function classifyProxyTraceActionRing(record) {
        const metadata = getProxyPlainObject(record?.metadata);
        const directRing = (record?.ringId
            || record?.ring_id
            || record?.ring
            || record?.permissionRing
            || record?.permission_ring
            || metadata.ringId
            || metadata.ring_id
            || metadata.ring
            || metadata.permissionRing
            || metadata.permission_ring);
        if (directRing) {
            return getProxyTraceRingDefinition(directRing);
        }
        const type = getProxyTraceActionType(record);
        const text = [
            type,
            readProxyTraceText(record, 1200),
            typeof metadata.command === "string" ? metadata.command : "",
            typeof metadata.url === "string" ? metadata.url : "",
            typeof metadata.endpoint === "string" ? metadata.endpoint : "",
        ].join(" ").toLowerCase();
        if (/\b(git\s+push|gh\s+release|deploy|publish|production|stripe|payment|public\s+url)\b/.test(text)
            || type.includes("deploy")
            || type.includes("publish")
            || type.includes("payment")) {
            return PROXY_TRACE_RING_DEFINITIONS[3];
        }
        if (/\b(send\s+email|email|gmail|slack|webhook|post\s+https?:|curl\s+-x\s+post|shared|team|database|project|task|ticket)\b/.test(text)
            || type.includes("email")
            || type.includes("message")
            || type.includes("database")
            || type.includes("project")
            || type.includes("task")
            || type.includes("permission")) {
            return PROXY_TRACE_RING_DEFINITIONS[2];
        }
        return PROXY_TRACE_RING_DEFINITIONS[1];
    }
    function getProxyTraceActionCategory(action) {
        const type = String(action?.type || "").toLowerCase();
        if (type.includes("firecrawl") || type.includes("search") || type.includes("web"))
            return "web";
        if (type.includes("file") || type.includes("read") || type.includes("write") || type.includes("list"))
            return "files";
        if (type.includes("bash") || type.includes("command") || type.includes("tool"))
            return "commands";
        if (type.includes("thread") || type.includes("message") || type.includes("llm"))
            return "reasoning";
        if (type.includes("permission"))
            return "permission";
        return type || "activity";
    }
    function getProxyTraceActionTitle(record, fallback = "Trace action") {
        const metadata = getProxyPlainObject(record?.metadata);
        const title = String(record?.title
            || record?.label
            || record?.name
            || metadata.title
            || metadata.label
            || metadata.name
            || "").trim();
        if (title) {
            return title;
        }
        const type = getProxyTraceActionType(record);
        if (type.includes("firecrawl"))
            return "Firecrawl action";
        if (type.includes("web_search") || type.includes("search"))
            return "Web search";
        if (type.includes("file_change"))
            return "Updated files";
        if (type.includes("read_file"))
            return "Read files";
        if (type.includes("bash") || type.includes("command"))
            return "Ran command";
        if (type.includes("permission"))
            return "Permission check";
        return fallback;
    }
    function collectProxyTraceTouchedResources(record) {
        const resources = [];
        const metadata = getProxyPlainObject(record?.metadata);
        const candidates = [
            record?.path,
            record?.filePath,
            record?.file_path,
            record?.resource,
            record?.resourceId,
            metadata.path,
            metadata.filePath,
            metadata.file_path,
            metadata.url,
            metadata.resource,
            metadata.resourceId,
        ];
        for (const candidate of candidates) {
            const text = String(candidate || "").trim();
            if (text)
                resources.push(text);
        }
        for (const list of [record?.files, record?.filePaths, metadata.files, metadata.filePaths]) {
            if (!Array.isArray(list))
                continue;
            for (const item of list) {
                const text = typeof item === "string" ? item : String(item?.path || item?.filePath || item?.id || "").trim();
                if (text)
                    resources.push(text);
            }
        }
        return Array.from(new Set(resources)).slice(0, 12);
    }
    function buildProxyTraceAction(record, options = {}) {
        const source = options.source || "step";
        const metadata = getProxyPlainObject(record?.metadata);
        const sourceId = String(record?.id || record?.stepId || record?.step_id || record?.logId || record?.log_id || options.index || "").trim();
        const timestamp = readProxyTraceTimestamp(record, options.fallbackTimestamp || "");
        const ringDefinition = classifyProxyTraceActionRing(record);
        const durationMs = Number(record?.durationMs
            || record?.duration_ms
            || metadata.durationMs
            || metadata.duration_ms
            || 0);
        const tokenCount = Number(record?.tokenCount
            || record?.token_count
            || record?.tokens
            || metadata.tokenCount
            || metadata.token_count
            || metadata.tokens
            || 0);
        return {
            id: `${source}:${sourceId || options.index || Math.random().toString(36).slice(2)}`,
            source,
            sourceId,
            threadId: options.threadId || record?.threadId || record?.thread_id || "",
            stepId: String(record?.stepId || record?.step_id || (source === "step" ? record?.id : "") || "").trim(),
            stepSequence: Number(record?.sequence || record?.stepSequence || record?.step_sequence || options.index || 0) || 0,
            snapshotBeforeId: record?.snapshotBeforeId || record?.snapshot_before_id || metadata.snapshotBeforeId || metadata.snapshot_before_id || null,
            snapshotAfterId: record?.snapshotAfterId || record?.snapshot_after_id || metadata.snapshotAfterId || metadata.snapshot_after_id || null,
            createdAt: timestamp,
            timestamp,
            type: getProxyTraceActionType(record) || source,
            title: getProxyTraceActionTitle(record, source === "log" ? "Trace log" : "Trace step"),
            summary: readProxyTraceText(record, 320),
            status: String(record?.status || metadata.status || "").trim() || "completed",
            durationMs: Number.isFinite(durationMs) && durationMs > 0 ? durationMs : 0,
            tokenCount: Number.isFinite(tokenCount) && tokenCount > 0 ? tokenCount : 0,
            touchedResources: collectProxyTraceTouchedResources(record),
            ...ringDefinition,
            raw: record,
        };
    }
    function shouldStartProxyTraceSequence(previous, action) {
        if (!previous)
            return true;
        const previousCategory = getProxyTraceActionCategory(previous);
        const nextCategory = getProxyTraceActionCategory(action);
        if (previousCategory !== nextCategory)
            return true;
        if (previous.ringId !== action.ringId && Math.max(previous.ringId || 1, action.ringId || 1) >= 2)
            return true;
        const previousTime = Date.parse(previous.timestamp || previous.createdAt || "");
        const nextTime = Date.parse(action.timestamp || action.createdAt || "");
        if (Number.isFinite(previousTime) && Number.isFinite(nextTime) && nextTime - previousTime > 12 * 60 * 1000) {
            return true;
        }
        return false;
    }
    function buildProxyTraceSequences(actions) {
        const orderedActions = [...actions].sort((left, right) => {
            const leftTime = Date.parse(left.timestamp || left.createdAt || "");
            const rightTime = Date.parse(right.timestamp || right.createdAt || "");
            if (Number.isFinite(leftTime) && Number.isFinite(rightTime) && leftTime !== rightTime) {
                return leftTime - rightTime;
            }
            return (left.stepSequence || 0) - (right.stepSequence || 0);
        });
        const groups = [];
        let current = [];
        for (const action of orderedActions) {
            if (current.length === 0 || shouldStartProxyTraceSequence(current[current.length - 1], action) || current.length >= 10) {
                if (current.length > 0)
                    groups.push(current);
                current = [action];
            }
            else {
                current.push(action);
            }
        }
        if (current.length > 0)
            groups.push(current);
        return groups.map((group, index) => {
            const first = group[0];
            const last = group[group.length - 1] || first;
            const highestRingId = Math.max(...group.map((action) => action.ringId || 1));
            const ringDefinition = getProxyTraceRingDefinition(highestRingId);
            const resources = Array.from(new Set(group.flatMap((action) => Array.isArray(action.touchedResources) ? action.touchedResources : []))).slice(0, 16);
            const durationMs = group.reduce((sum, action) => sum + Math.max(0, Number(action.durationMs || 0)), 0);
            const tokenCount = group.reduce((sum, action) => sum + Math.max(0, Number(action.tokenCount || 0)), 0);
            const category = getProxyTraceActionCategory(first);
            const actionWord = group.length === 1 ? "action" : "actions";
            const titleByCategory = {
                web: "Investigated external information",
                files: "Worked with local files",
                commands: "Ran local commands",
                reasoning: "Reasoned through the task",
                permission: "Checked permissions",
            };
            return {
                id: `trace_sequence:proxy:${index + 1}:${first.sourceId || first.id}`,
                source: "trace_sequence",
                type: "trace_sequence",
                title: titleByCategory[category] || first.title || `Trace sequence ${index + 1}`,
                summary: `${group.length} ${actionWord} grouped from ${ringDefinition.ringLabel.toLowerCase()} activity.`,
                rationale: group.map((action) => action.summary || action.title).filter(Boolean).slice(0, 3).join(" "),
                createdAt: first.createdAt || "",
                timestamp: first.timestamp || first.createdAt || "",
                updatedAt: last.timestamp || last.createdAt || first.createdAt || "",
                actionCount: group.length,
                actionIds: group.map((action) => action.id),
                stepId: first.stepId || "",
                startStepId: first.stepId || "",
                endStepId: last.stepId || first.stepId || "",
                stepSequence: first.stepSequence || 0,
                durationMs,
                tokenCount,
                touchedResources: resources,
                decisionStatus: highestRingId >= 3 ? "needs-review" : "grounded",
                ...ringDefinition,
                raw: {
                    source: "proxy-deterministic-fallback",
                    category,
                    actions: group,
                },
            };
        });
    }
    function getProxyThreadRecord(data) {
        return unwrapProxyDataRecord(data, ["thread"]);
    }
    async function proxyThreadTraceClustersGet(req, res, threadId) {
        const normalizedThreadId = String(threadId || "").trim();
        if (!normalizedThreadId) {
            return sendJson(res, 400, {
                error: "Thread id is required",
                message: "A thread id is required to load trace clusters.",
            });
        }
        const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
        const limit = Math.max(20, Math.min(400, Number(requestUrl.searchParams.get("limit") || 160) || 160));
        const encodedThreadId = encodeURIComponent(normalizedThreadId);
        const upstreamPath = `/threads/${encodedThreadId}/trace-clusters${requestUrl.search || ""}`;
        try {
            const upstreamResponse = await fetchUpstreamJsonForProxyExactPath(req, upstreamPath, "GET");
            if (upstreamResponse.status !== 404) {
                return sendJson(res, upstreamResponse.status, upstreamResponse.data);
            }
            const [threadResponse, stepsResponse, logsResponse] = await Promise.all([
                fetchUpstreamJsonForProxyExactPath(req, `/threads/${encodedThreadId}`, "GET").catch((error) => ({
                    status: 502,
                    data: { error: "Failed to load thread", message: error instanceof Error ? error.message : String(error) },
                })),
                fetchUpstreamJsonForProxyExactPath(req, `/threads/${encodedThreadId}/steps?limit=${encodeURIComponent(String(limit))}&compact=1`, "GET").catch((error) => ({
                    status: 502,
                    data: { error: "Failed to load thread steps", message: error instanceof Error ? error.message : String(error) },
                })),
                fetchUpstreamJsonForProxyExactPath(req, `/threads/${encodedThreadId}/logs?compact=1&includeConversation=0&limit=${encodeURIComponent(String(limit))}`, "GET").catch((error) => ({
                    status: 502,
                    data: { error: "Failed to load thread logs", message: error instanceof Error ? error.message : String(error) },
                })),
            ]);
            if (threadResponse.status === 401 || threadResponse.status === 403 || stepsResponse.status === 401 || stepsResponse.status === 403 || logsResponse.status === 401 || logsResponse.status === 403) {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents or provide an API key.",
                });
            }
            const thread = threadResponse.status < 400 ? getProxyThreadRecord(threadResponse.data) : {};
            const steps = stepsResponse.status < 400 ? normalizeProxyTraceArray(stepsResponse.data, ["steps"]) : [];
            const logs = logsResponse.status < 400 ? normalizeProxyTraceArray(logsResponse.data, ["logs"]) : [];
            if (steps.length === 0 && logs.length === 0 && stepsResponse.status >= 400 && logsResponse.status >= 400) {
                return sendJson(res, stepsResponse.status || logsResponse.status || 502, {
                    error: "Failed to load trace clusters",
                    message: stepsResponse.data?.message || logsResponse.data?.message || "The trace endpoint is not deployed and fallback data could not be loaded.",
                    upstreamTraceStatus: upstreamResponse.status,
                });
            }
            const stepActions = steps.map((step, index) => buildProxyTraceAction(step, {
                source: "step",
                index: index + 1,
                threadId: normalizedThreadId,
            }));
            const stepSourceIds = new Set(stepActions.map((action) => action.sourceId).filter(Boolean));
            const logActions = logs
                .map((log, index) => buildProxyTraceAction(log, {
                source: "log",
                index: index + 1,
                threadId: normalizedThreadId,
            }))
                .filter((action) => {
                if (!action.sourceId || !stepSourceIds.has(action.sourceId)) {
                    return true;
                }
                return action.ringId >= 2;
            });
            const actions = [...stepActions, ...logActions].filter((action) => action.title || action.summary);
            const sequences = buildProxyTraceSequences(actions);
            const generatedAt = new Date().toISOString();
            return sendJson(res, 200, {
                object: "thread.trace_clusters",
                threadId: normalizedThreadId,
                thread: thread && typeof thread === "object" ? {
                    id: thread.id || normalizedThreadId,
                    title: thread.title || thread.name || "",
                    status: thread.status || "",
                } : { id: normalizedThreadId },
                generatedAt,
                observerModel: null,
                observerStatus: "proxy-fallback",
                observerCached: false,
                traceClusters: {
                    source: "proxy-deterministic-fallback",
                    generatedAt,
                    observerStatus: "proxy-fallback",
                    observerModel: null,
                    actions,
                    sequences,
                    decisions: sequences,
                    stats: {
                        actionCount: actions.length,
                        sequenceCount: sequences.length,
                        ring1Count: actions.filter((action) => action.ringId === 1).length,
                        ring2Count: actions.filter((action) => action.ringId === 2).length,
                        ring3Count: actions.filter((action) => action.ringId === 3).length,
                        fallback: true,
                        upstreamTraceStatus: upstreamResponse.status,
                    },
                },
                actions,
                sequences,
                decisions: sequences,
            });
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to load trace clusters",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return Object.freeze({ proxyThreadTraceClustersGet });
}
