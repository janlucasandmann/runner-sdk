import { createAdminAuthorization } from "./admin-authorization.mjs";
import { createDeploymentVmAdminClient } from "./deployment-vm-admin-client.mjs";
import { readResponseJson } from "./http-utils.mjs";

export function createAdminGateway(bindings) {
    const { aiosOrigin, deploymentTopology, deploymentVmAdminClient, deploymentVmNameOverride, deploymentVmNamePrefix, deploymentVmProject, feedbackSummaryAdminEnvFileCandidates, feedbackSummaryAllowedEmail, fetchAiosApi, hasAiosSession, identityService, normalizeBackendUrl, parseUpstreamUrl, platformOrigin, port, sendJson, serveAdminAccessDeniedPage, serveFeedbackSummaryPage, serveProductUsageSummaryPageV2, } = bindings;
    const {
        fetchFeedbackSummaryViaDeploymentVm,
        fetchProductUsageSummaryViaDeploymentVm,
    } = deploymentVmAdminClient || createDeploymentVmAdminClient({
        deploymentVmNameOverride,
        deploymentVmNamePrefix,
        deploymentVmProject,
    });
    const {
        buildFeedbackSummaryLoginUrl,
        buildUsageSummaryLoginUrl,
        extractIdToken: extractFeedbackSummaryIdToken,
        fetchSessionEmail: fetchFeedbackSummarySessionEmail,
        readAdminKey,
        readContactSalesApiToken,
        readFeedbackSummaryAdminKey,
        readFeedbackSummaryAllowedEmails,
        redirectToFeedbackSummaryLogin,
        redirectToUsageSummaryLogin,
    } = createAdminAuthorization({
        aiosOrigin,
        feedbackSummaryAdminEnvFileCandidates,
        feedbackSummaryAllowedEmail,
        fetchAiosApi,
        hasAiosSession,
        identityService,
        platformOrigin,
        port,
    });
    async function proxyUpstreamAdminGet(req, res, upstreamPath) {
        try {
            const adminKey = readAdminKey(req);
            if (!adminKey) {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Provide an admin key.",
                });
            }
            const upstreamUrl = parseUpstreamUrl(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const upstreamTarget = new URL(`${upstreamUrl}${upstreamPath}`);
            upstreamTarget.search = requestUrl.search;
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${adminKey}`,
                    "X-Admin-Key": adminKey,
                },
            });
            const parsed = await readResponseJson(upstream);
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy upstream admin request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyFeedbackSummaryGet(req, res) {
        try {
            const allowedEmails = await readFeedbackSummaryAllowedEmails();
            if (allowedEmails.length === 0) {
                return sendJson(res, 503, {
                    error: "Feedback summary is not configured",
                    message: "PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_EMAILS is missing on the platform server.",
                });
            }
            const session = await fetchFeedbackSummarySessionEmail(req);
            if (session.status === 401 || session.status === 403 || !session.email) {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents to view feedback summary.",
                    loginUrl: buildFeedbackSummaryLoginUrl(req),
                });
            }
            if (!allowedEmails.includes(session.email)) {
                return sendJson(res, 403, {
                    error: "Forbidden",
                    message: "The signed-in account does not have access to feedback summary.",
                    loginUrl: buildFeedbackSummaryLoginUrl(req, { signedOut: true }),
                });
            }
            const adminKey = await readFeedbackSummaryAdminKey();
            if (!adminKey) {
                return sendJson(res, 503, {
                    error: "Feedback summary is not configured",
                    message: "ADMIN_API_KEY is missing on the platform server.",
                });
            }
            const upstreamUrl = parseUpstreamUrl(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const upstreamTarget = new URL(`${upstreamUrl}/admin/feedback-summary`);
            upstreamTarget.search = requestUrl.search;
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${adminKey}`,
                    "X-Admin-Key": adminKey,
                },
            });
            const parsed = await readResponseJson(upstream);
            if ((upstream.status === 401 || upstream.status === 403)
                && process.env.FEEDBACK_SUMMARY_DISABLE_VM_FALLBACK !== "1"
                && normalizeBackendUrl(upstreamUrl) === normalizeBackendUrl("https://api.computer-agents.com/v1")) {
                try {
                    const fallback = await fetchFeedbackSummaryViaDeploymentVm(requestUrl.search);
                    if (fallback.status >= 200 && fallback.status < 300) {
                        const fallbackPayload = fallback.parsed;
                        if (fallbackPayload && typeof fallbackPayload === "object" && !Array.isArray(fallbackPayload)) {
                            fallbackPayload.viewer = { email: session.email };
                        }
                        return sendJson(res, fallback.status, fallbackPayload);
                    }
                }
                catch (fallbackError) {
                    console.warn("Feedback summary VM fallback failed", fallbackError);
                }
            }
            if (upstream.status === 404) {
                return sendJson(res, 502, {
                    error: "Failed to load feedback summary",
                    message: "The upstream feedback summary endpoint is not deployed yet.",
                });
            }
            if (upstream.status === 401 || upstream.status === 403) {
                return sendJson(res, 502, {
                    error: "Failed to load feedback summary",
                    message: "The upstream admin feedback summary request was rejected.",
                });
            }
            if (upstream.ok && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                parsed.viewer = { email: session.email };
            }
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy feedback summary request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyProductUsageSummaryGet(req, res) {
        try {
            const allowedEmails = await readFeedbackSummaryAllowedEmails();
            if (allowedEmails.length === 0) {
                return sendJson(res, 503, {
                    error: "Product usage summary is not configured",
                    message: "PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_EMAILS is missing on the platform server.",
                });
            }
            const session = await fetchFeedbackSummarySessionEmail(req);
            if (session.status === 401 || session.status === 403 || !session.email) {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents to view product usage summary.",
                    loginUrl: buildUsageSummaryLoginUrl(req),
                });
            }
            if (!allowedEmails.includes(session.email)) {
                return sendJson(res, 403, {
                    error: "Forbidden",
                    message: "The signed-in account does not have access to product usage summary.",
                    loginUrl: buildUsageSummaryLoginUrl(req, { signedOut: true }),
                });
            }
            const adminKey = await readFeedbackSummaryAdminKey();
            if (!adminKey) {
                return sendJson(res, 503, {
                    error: "Product usage summary is not configured",
                    message: "ADMIN_API_KEY is missing on the platform server.",
                });
            }
            const upstreamUrl = parseUpstreamUrl(req, {});
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const upstreamTarget = new URL(`${upstreamUrl}/admin/product-usage-summary`);
            upstreamTarget.search = requestUrl.search;
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${adminKey}`,
                    "X-Admin-Key": adminKey,
                },
            });
            const parsed = await readResponseJson(upstream);
            if ((upstream.status === 401 || upstream.status === 403)
                && process.env.PRODUCT_USAGE_SUMMARY_DISABLE_VM_FALLBACK !== "1"
                && normalizeBackendUrl(upstreamUrl) === normalizeBackendUrl("https://api.computer-agents.com/v1")) {
                try {
                    const fallback = await fetchProductUsageSummaryViaDeploymentVm(requestUrl.search);
                    if (fallback.status >= 200 && fallback.status < 300) {
                        const fallbackPayload = fallback.parsed;
                        if (fallbackPayload && typeof fallbackPayload === "object" && !Array.isArray(fallbackPayload)) {
                            fallbackPayload.viewer = { email: session.email };
                        }
                        return sendJson(res, fallback.status, fallbackPayload);
                    }
                    if (fallback.status === 404) {
                        return sendJson(res, 502, {
                            error: "Failed to load product usage summary",
                            message: "The upstream product usage summary endpoint is not deployed yet.",
                        });
                    }
                }
                catch (fallbackError) {
                    console.warn("Product usage summary VM fallback failed", fallbackError);
                }
            }
            if (upstream.status === 404) {
                return sendJson(res, 502, {
                    error: "Failed to load product usage summary",
                    message: "The upstream product usage summary endpoint is not deployed yet.",
                });
            }
            if (upstream.status === 401 || upstream.status === 403) {
                return sendJson(res, 502, {
                    error: "Failed to load product usage summary",
                    message: "The upstream admin product usage summary request was rejected.",
                });
            }
            if (upstream.ok && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                parsed.viewer = { email: session.email };
            }
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy product usage summary request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyApplianceOverviewGet(req, res) {
        if (deploymentTopology !== "on_prem") {
            return sendJson(res, 404, {
                error: "Not Found",
                message: "The appliance overview is only available on an on-prem deployment.",
            });
        }
        try {
            const session = await fetchFeedbackSummarySessionEmail(req);
            if (session.status === 401 || session.status === 403 || !session.email) {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in to view appliance information.",
                });
            }
            const adminKey = await readFeedbackSummaryAdminKey();
            if (!adminKey) {
                return sendJson(res, 503, {
                    error: "Appliance administration is not configured",
                    message: "ADMIN_API_KEY is missing on the platform server.",
                });
            }
            const upstreamUrl = parseUpstreamUrl(req, {});
            const upstreamTarget = new URL("/admin/appliance-overview", upstreamUrl);
            const upstream = await fetch(upstreamTarget.toString(), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${adminKey}`,
                    "X-Admin-Key": adminKey,
                },
            });
            const parsed = await readResponseJson(upstream);
            if (upstream.status === 401 || upstream.status === 403) {
                return sendJson(res, 502, {
                    error: "Failed to load appliance information",
                    message: "The control-plane appliance overview request was rejected.",
                });
            }
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to load appliance information",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function proxyContactSalesSummaryGet(req, res) {
        if (identityService.provider === "oidc") {
            return sendJson(res, 501, {
                error: "Capability unavailable",
                code: "ON_PREM_CONNECTOR_CAPABILITY_UNAVAILABLE",
                message: "The hosted contact-sales connector is not enabled on this appliance.",
            });
        }
        try {
            const allowedEmails = await readFeedbackSummaryAllowedEmails();
            if (allowedEmails.length === 0) {
                return sendJson(res, 503, {
                    error: "Contact sales summary is not configured",
                    message: "PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_EMAILS is missing on the platform server.",
                });
            }
            const session = await fetchFeedbackSummarySessionEmail(req);
            if (session.status === 401 || session.status === 403 || !session.email) {
                return sendJson(res, 401, {
                    error: "Unauthorized",
                    message: "Sign in with Computer Agents to view contact sales requests.",
                    loginUrl: buildUsageSummaryLoginUrl(req),
                });
            }
            if (!allowedEmails.includes(session.email)) {
                return sendJson(res, 403, {
                    error: "Forbidden",
                    message: "The signed-in account does not have access to contact sales summary.",
                    loginUrl: buildUsageSummaryLoginUrl(req, { signedOut: true }),
                });
            }
            const contactToken = await readContactSalesApiToken();
            const token = contactToken || await readFeedbackSummaryAdminKey();
            if (!token) {
                return sendJson(res, 503, {
                    error: "Contact sales summary is not configured",
                    message: "CONTACT_SALES_API_TOKEN or ADMIN_API_KEY is missing on the platform server.",
                });
            }
            const requestUrl = new URL(req.url || "/", `http://localhost:${port}`);
            const targetUrl = new URL(`${aiosOrigin}/api/contact-sales`);
            targetUrl.search = requestUrl.search;
            const upstream = await fetch(targetUrl.toString(), {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "x-internal-api-token": token,
                },
            });
            const parsed = await readResponseJson(upstream);
            if (upstream.ok && parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                parsed.viewer = { email: session.email };
            }
            return sendJson(res, upstream.status, parsed);
        }
        catch (error) {
            return sendJson(res, 502, {
                error: "Failed to proxy contact sales request",
                message: error instanceof Error ? error.message : String(error),
            });
        }
    }
    async function handleFeedbackSummaryPageRequest(req, res) {
        try {
            const allowedEmails = await readFeedbackSummaryAllowedEmails();
            if (allowedEmails.length === 0) {
                sendJson(res, 503, {
                    error: "Feedback summary is not configured",
                    message: "PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_EMAILS is missing on the platform server.",
                });
                return;
            }
            const session = await fetchFeedbackSummarySessionEmail(req);
            if (session.status === 401 || session.status === 403 || !session.email) {
                redirectToFeedbackSummaryLogin(req, res);
                return;
            }
            if (!allowedEmails.includes(session.email)) {
                serveAdminAccessDeniedPage(res);
                return;
            }
            serveFeedbackSummaryPage(res);
        }
        catch {
            redirectToFeedbackSummaryLogin(req, res);
        }
    }
    async function handleProductUsageSummaryPageRequest(req, res) {
        try {
            const allowedEmails = await readFeedbackSummaryAllowedEmails();
            if (allowedEmails.length === 0) {
                sendJson(res, 503, {
                    error: "Product usage summary is not configured",
                    message: "PLATFORM_ADMIN_EMAIL or PLATFORM_ADMIN_EMAILS is missing on the platform server.",
                });
                return;
            }
            const session = await fetchFeedbackSummarySessionEmail(req);
            if (session.status === 401 || session.status === 403 || !session.email) {
                redirectToUsageSummaryLogin(req, res);
                return;
            }
            if (!allowedEmails.includes(session.email)) {
                serveAdminAccessDeniedPage(res);
                return;
            }
            serveProductUsageSummaryPageV2(res);
        }
        catch {
            redirectToUsageSummaryLogin(req, res);
        }
    }
    return Object.freeze({
        extractFeedbackSummaryIdToken,
        handleFeedbackSummaryPageRequest,
        handleProductUsageSummaryPageRequest,
        proxyContactSalesSummaryGet,
        proxyApplianceOverviewGet,
        proxyFeedbackSummaryGet,
        proxyProductUsageSummaryGet,
    });
}
