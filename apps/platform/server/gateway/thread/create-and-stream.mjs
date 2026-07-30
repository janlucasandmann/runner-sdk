import { isAgentAssistantPresetExecutionContent } from "./message-sanitization.mjs";

export function createThreadMessageGateway(bindings) {
    const { fetchSessionApi, hasAiosSession, parseUpstreamUrl, readOptionalApiKey, readRequestBody, sendJson, summarizeRunnerStreamChunkForLog, withProxyOrganizationHeader } = bindings;
    let threadPayloadEnricher = async (_req, _upstreamUrl, _apiKey, payload) => payload;
    let threadMessagePayloadEnricher = async (_req, _threadId, _upstreamUrl, _apiKey, payload) => payload;
    async function proxyCreateThread(req, res) {
        try {
            const body = await readRequestBody(req);
            const upstreamUrl = parseUpstreamUrl(req, body);
            const apiKey = readOptionalApiKey(req, body);
            // Backward compatibility: allow legacy wrapper body shape
            const payload = body.payload && typeof body.payload === "object"
                ? body.payload
                : {
                    title: body.title,
                    appId: body.appId,
                    environmentId: body.environmentId,
                    projectId: body.projectId,
                    agentId: body.agentId,
                    metadata: body.metadata,
                };
            const enrichedPayload = await threadPayloadEnricher(req, upstreamUrl, apiKey, payload);
            let upstream;
            if (apiKey) {
                upstream = await fetch(`${upstreamUrl}/threads`, {
                    method: "POST",
                    headers: withProxyOrganizationHeader(req, body, {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    }),
                    body: JSON.stringify(enrichedPayload),
                });
            }
            else if (hasAiosSession(req)) {
                upstream = await fetchSessionApi(req, "/threads", "/api/threads", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify(enrichedPayload),
                });
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in to Agentic Compute Platform or provide an API key.",
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
                error: "Failed to create thread via upstream backend",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyThreadMessages(req, res, threadId) {
        let upstream;
        let reader;
        try {
            const body = await readRequestBody(req);
            const upstreamUrl = parseUpstreamUrl(req, body);
            const apiKey = readOptionalApiKey(req, body);
            const visibleContent = body.content || body.task;
            const executionContent = typeof body.executionContent === "string" ? body.executionContent : "";
            const shouldUseExecutionContentForUpstream = body.useExecutionContentForUpstream === true || isAgentAssistantPresetExecutionContent(executionContent);
            const payload = {
                content: visibleContent,
                ...(typeof body.reasoningEffort === "string" && body.reasoningEffort.trim()
                    ? { reasoningEffort: body.reasoningEffort.trim() }
                    : {}),
                ...(executionContent ? { executionContent } : {}),
                ...(shouldUseExecutionContentForUpstream ? { useExecutionContentForUpstream: true } : {}),
                ...(body.messageMetadata && typeof body.messageMetadata === "object" && !Array.isArray(body.messageMetadata)
                    ? { messageMetadata: body.messageMetadata }
                    : {}),
                ...(Array.isArray(body.attachments) ? { attachments: body.attachments } : {}),
                ...(body.githubRepo && typeof body.githubRepo === "object" ? { githubRepo: body.githubRepo } : {}),
                ...(body.quotedSelection && typeof body.quotedSelection === "object" ? { quotedSelection: body.quotedSelection } : {}),
                ...(typeof body.truncateAtMessageIndex === "number" ? { truncateAtMessageIndex: body.truncateAtMessageIndex } : {}),
                ...(typeof body.editMessageId === "string" && body.editMessageId.trim() ? { editMessageId: body.editMessageId.trim() } : {}),
                ...(typeof body.persistFileChanges === "boolean" ? { persistFileChanges: body.persistFileChanges } : {}),
                ...(body.enabledSkills && typeof body.enabledSkills === "object" ? { enabledSkills: body.enabledSkills } : {}),
                ...(body.backlogTaskCommand && typeof body.backlogTaskCommand === "object" && !Array.isArray(body.backlogTaskCommand)
                    ? { backlogTaskCommand: body.backlogTaskCommand }
                    : {}),
            };
            if (!payload.content) {
                return sendJson(res, 400, { error: "content or task is required" });
            }
            const enrichedPayload = await threadMessagePayloadEnricher(
                req,
                threadId,
                upstreamUrl,
                apiKey,
                payload,
                {
                    requestedConnectors: body.connectors,
                },
            );
            if (apiKey) {
                console.info("[platform-gateway] Thread message stream start", {
                    threadId,
                    mode: "api-key",
                });
                upstream = await fetch(`${upstreamUrl}/threads/${encodeURIComponent(threadId)}/messages`, {
                    method: "POST",
                    headers: withProxyOrganizationHeader(req, body, {
                        "Content-Type": "application/json",
                        "X-API-Key": apiKey,
                    }),
                    body: JSON.stringify(enrichedPayload),
                });
            }
            else if (hasAiosSession(req)) {
                console.info("[platform-gateway] Thread message stream start", {
                    threadId,
                    mode: "aios-session",
                });
                upstream = await fetchSessionApi(
                    req,
                    `/threads/${encodeURIComponent(threadId)}/messages`,
                    `/api/threads/${encodeURIComponent(threadId)}/messages`,
                    {
                        method: "POST",
                        headers: {
                            "content-type": "application/json",
                        },
                        body: JSON.stringify(enrichedPayload),
                    },
                );
            }
            else {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in to Agentic Compute Platform or provide an API key.",
                });
            }
            console.info("[platform-gateway] Thread message upstream response", {
                threadId,
                status: upstream.status,
                contentType: upstream.headers.get("content-type") || "",
            });
            if (!upstream.ok) {
                const text = await upstream.text().catch(() => "");
                let parsed = {};
                try {
                    parsed = text ? JSON.parse(text) : {};
                }
                catch {
                    parsed = { message: text };
                }
                return sendJson(res, upstream.status, parsed);
            }
            res.writeHead(200, {
                "Content-Type": "text/event-stream; charset=utf-8",
                "Cache-Control": "no-cache, no-transform",
                Connection: "keep-alive",
                "X-Accel-Buffering": "no",
            });
            if (typeof res.flushHeaders === "function") {
                res.flushHeaders();
            }
            if (res.socket) {
                res.socket.setNoDelay(true);
            }
            if (!upstream.body) {
                res.end();
                return;
            }
            reader = upstream.body.getReader();
            const streamStartedAt = Date.now();
            let chunkCount = 0;
            let byteCount = 0;
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                if (res.writableEnded || res.destroyed)
                    break;
                chunkCount += 1;
                byteCount += value?.byteLength || 0;
                if (chunkCount === 1 || chunkCount % 20 === 0) {
                    console.info("[platform-gateway] Thread message upstream chunk", {
                        threadId,
                        chunkCount,
                        byteCount,
                        elapsedMs: Date.now() - streamStartedAt,
                        events: chunkCount === 1 ? summarizeRunnerStreamChunkForLog(value) : undefined,
                    });
                }
                res.write(Buffer.from(value));
                if (typeof res.flush === "function") {
                    try {
                        res.flush();
                    }
                    catch { }
                }
            }
            console.info("[platform-gateway] Thread message stream ended", {
                threadId,
                chunkCount,
                byteCount,
                elapsedMs: Date.now() - streamStartedAt,
            });
            res.end();
        }
        catch (error) {
            if (!res.headersSent) {
                const statusCode = Number(error?.statusCode);
                const isPolicyError = Number.isInteger(statusCode)
                    && statusCode >= 400
                    && statusCode < 500;
                return sendJson(res, isPolicyError ? statusCode : 502, {
                    error: isPolicyError
                        ? String(error?.code || "connector_policy_denied")
                        : "Failed to stream messages from upstream backend",
                    message: error instanceof Error ? error.message : String(error),
                    ...(isPolicyError && error?.details
                        ? { details: error.details }
                        : {}),
                });
            }
            if (!res.writableEnded) {
                try {
                    res.write(`data: ${JSON.stringify({ type: "stream.error", error: { message: error instanceof Error ? error.message : String(error) } })}\n\n`);
                }
                catch { }
                res.end();
            }
        }
        finally {
            if (reader) {
                try {
                    await reader.cancel();
                }
                catch { }
                return;
            }
            if (upstream?.body) {
                try {
                    await upstream.body.cancel();
                }
                catch { }
            }
        }
    }
    return Object.freeze({
        proxyCreateThread,
        proxyThreadMessages,
        setThreadPayloadEnricher(enricher) {
            threadPayloadEnricher = typeof enricher === "function"
                ? enricher
                : async (_req, _upstreamUrl, _apiKey, payload) => payload;
        },
        setThreadMessagePayloadEnricher(enricher) {
            threadMessagePayloadEnricher = typeof enricher === "function"
                ? enricher
                : async (_req, _threadId, _upstreamUrl, _apiKey, payload) => payload;
        },
    });
}
