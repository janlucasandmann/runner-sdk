export function createComputeResourceRoutes(bindings) {
    const { fetchUpstreamOverviewJson, proxyEnvironmentGuiSession, proxyEnvironmentStart, proxyUpstreamBinaryGet, proxyUpstreamGet, proxyUpstreamJsonRequest, sendJson, sendServerDetailBootstrap, } = bindings;
    return function handleComputeResourceRoutes(req, res, url) {
        if (req.method === "GET" && url.pathname === "/api/real/environments") {
            void proxyUpstreamGet(req, res, "/environments");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/real/environments") {
            void proxyUpstreamJsonRequest(req, res, "/environments", "POST");
            return true;
        }
        const environmentVersionsMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/versions$/);
        if (req.method === "GET" && environmentVersionsMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionsMatch[1]))}/versions`);
            return true;
        }
        if (req.method === "POST" && environmentVersionsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionsMatch[1]))}/versions`, "POST");
            return true;
        }
        const environmentVersionsCompareMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/versions\/compare$/);
        if (req.method === "GET" && environmentVersionsCompareMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionsCompareMatch[1]))}/versions/compare${url.search || ""}`);
            return true;
        }
        const environmentVersionActionMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/versions\/([^/]+)\/(publish|unpublish|restore)$/);
        if (req.method === "POST" && environmentVersionActionMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionActionMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(environmentVersionActionMatch[2]))}/${environmentVersionActionMatch[3]}`, "POST");
            return true;
        }
        const environmentVersionDetailMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/versions\/([^/]+)$/);
        if (req.method === "GET" && environmentVersionDetailMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(environmentVersionDetailMatch[2]))}`);
            return true;
        }
        if ((req.method === "PATCH" || req.method === "PUT") && environmentVersionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(environmentVersionDetailMatch[2]))}`, req.method);
            return true;
        }
        if (req.method === "DELETE" && environmentVersionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(environmentVersionDetailMatch[2]))}`, "DELETE");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/servers") {
            void proxyUpstreamGet(req, res, "/servers" + (url.search || ""));
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/real/servers") {
            void proxyUpstreamJsonRequest(req, res, "/servers", "POST");
            return true;
        }
        const serverVersionsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/versions$/);
        if (req.method === "GET" && serverVersionsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionsMatch[1]))}/versions`);
            return true;
        }
        if (req.method === "POST" && serverVersionsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionsMatch[1]))}/versions`, "POST");
            return true;
        }
        const serverVersionsCompareMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/versions\/compare$/);
        if (req.method === "GET" && serverVersionsCompareMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionsCompareMatch[1]))}/versions/compare${url.search || ""}`);
            return true;
        }
        const serverVersionActionMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/versions\/([^/]+)\/(publish|unpublish|restore)$/);
        if (req.method === "POST" && serverVersionActionMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionActionMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(serverVersionActionMatch[2]))}/${serverVersionActionMatch[3]}`, "POST");
            return true;
        }
        const serverVersionDetailMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/versions\/([^/]+)$/);
        if (req.method === "GET" && serverVersionDetailMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(serverVersionDetailMatch[2]))}`);
            return true;
        }
        if ((req.method === "PATCH" || req.method === "PUT") && serverVersionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(serverVersionDetailMatch[2]))}`, req.method);
            return true;
        }
        if (req.method === "DELETE" && serverVersionDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverVersionDetailMatch[1]))}/versions/${encodeURIComponent(decodeURIComponent(serverVersionDetailMatch[2]))}`, "DELETE");
            return true;
        }
        if (req.method === "POST" && url.pathname === "/api/real/servers/templates/ai-chat-app") {
            void proxyUpstreamJsonRequest(req, res, "/servers/templates/ai-chat-app", "POST");
            return true;
        }
        const serverBootstrapMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/bootstrap$/);
        if (req.method === "GET" && serverBootstrapMatch) {
            void sendServerDetailBootstrap(
                req,
                res,
                decodeURIComponent(serverBootstrapMatch[1]),
                {
                    kind: url.searchParams.get("kind") || "",
                    include: url.searchParams.get("include") || "",
                    authUsersLimit: url.searchParams.get("authUsersLimit") || "",
                    runsLimit: url.searchParams.get("runsLimit") || "",
                    period: url.searchParams.get("period") || "day",
                },
            );
            return true;
        }
        const serverDetailMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)$/);
        if (req.method === "GET" && serverDetailMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverDetailMatch[1]))}`);
            return true;
        }
        if (req.method === "PATCH" && serverDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverDetailMatch[1]))}`, "PATCH");
            return true;
        }
        if (req.method === "DELETE" && serverDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverDetailMatch[1]))}`, "DELETE");
            return true;
        }
        const serverCustomDomainMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/custom-domain$/);
        if (req.method === "GET" && serverCustomDomainMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverCustomDomainMatch[1]))}/custom-domain${url.search || ""}`);
            return true;
        }
        if (req.method === "POST" && serverCustomDomainMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverCustomDomainMatch[1]))}/custom-domain`, "POST");
            return true;
        }
        if (req.method === "DELETE" && serverCustomDomainMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverCustomDomainMatch[1]))}/custom-domain${url.search || ""}`, "DELETE");
            return true;
        }
        const serverCustomDomainCheckMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/custom-domain\/check$/);
        if (req.method === "POST" && serverCustomDomainCheckMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverCustomDomainCheckMatch[1]))}/custom-domain/check`, "POST");
            return true;
        }
        const serverPaymentsConnectMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/payments\/connect-account$/);
        if (req.method === "POST" && serverPaymentsConnectMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverPaymentsConnectMatch[1]))}/payments/connect-account`, "POST");
            return true;
        }
        const serverPaymentsSyncMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/payments\/sync$/);
        if (req.method === "POST" && serverPaymentsSyncMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverPaymentsSyncMatch[1]))}/payments/sync`, "POST");
            return true;
        }
        const serverBindingsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/bindings$/);
        if (req.method === "GET" && serverBindingsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverBindingsMatch[1]))}/bindings`);
            return true;
        }
        const serverContextMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/context$/);
        if (req.method === "GET" && serverContextMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverContextMatch[1]))}/context`);
            return true;
        }
        const serverRuntimeConfigMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/runtime-config$/);
        if (req.method === "GET" && serverRuntimeConfigMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRuntimeConfigMatch[1]))}/runtime-config`);
            return true;
        }
        const serverRuntimeSdkMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/runtime-sdk\/([^/]+)$/);
        if (req.method === "GET" && serverRuntimeSdkMatch) {
            void proxyUpstreamBinaryGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRuntimeSdkMatch[1]))}/runtime-sdk/${encodeURIComponent(decodeURIComponent(serverRuntimeSdkMatch[2]))}`);
            return true;
        }
        const serverBindingTargetMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/bindings\/([^/]+)$/);
        if (req.method === "PUT" && serverBindingTargetMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverBindingTargetMatch[1]))}/bindings/${encodeURIComponent(decodeURIComponent(serverBindingTargetMatch[2]))}`, "PUT");
            return true;
        }
        if (req.method === "DELETE" && serverBindingTargetMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverBindingTargetMatch[1]))}/bindings/${encodeURIComponent(decodeURIComponent(serverBindingTargetMatch[2]))}`, "DELETE");
            return true;
        }
        const serverDeployMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/deploy$/);
        if (req.method === "POST" && serverDeployMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverDeployMatch[1]))}/deploy`, "POST");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/servers/analytics/overview") {
            void proxyUpstreamGet(req, res, `/servers/analytics/overview${url.search || ""}`);
            return true;
        }
        const serverAnalyticsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/analytics$/);
        if (req.method === "GET" && serverAnalyticsMatch) {
            void (async () => {
                try {
                    const response = await fetchUpstreamOverviewJson(req, `/servers/${encodeURIComponent(decodeURIComponent(serverAnalyticsMatch[1]))}/analytics${url.search || ""}`);
                    if (response.status === 401 || response.status === 403) {
                        sendJson(res, response.status, response.data);
                        return true;
                    }
                    if (response.status >= 400) {
                        sendJson(res, 200, {
                            charts: { traffic24h: [] },
                            analytics: { charts: { traffic24h: [] } },
                        });
                        return true;
                    }
                    sendJson(res, response.status, response.data);
                }
                catch {
                    sendJson(res, 200, {
                        charts: { traffic24h: [] },
                        analytics: { charts: { traffic24h: [] } },
                    });
                }
            })();
            return true;
        }
        const serverLogsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/logs$/);
        if (req.method === "GET" && serverLogsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverLogsMatch[1]))}/logs`, { emptyOn404: true });
            return true;
        }
        const serverDeploymentsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/deployments$/);
        if (req.method === "GET" && serverDeploymentsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverDeploymentsMatch[1]))}/deployments`, { emptyOn404: true });
            return true;
        }
        const serverRollbackMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/rollback$/);
        if (req.method === "POST" && serverRollbackMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRollbackMatch[1]))}/rollback`, "POST");
            return true;
        }
        const serverAuthUsersMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/auth-users$/);
        if (req.method === "GET" && serverAuthUsersMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverAuthUsersMatch[1]))}/auth-users${url.search || ""}`);
            return true;
        }
        if (req.method === "POST" && serverAuthUsersMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverAuthUsersMatch[1]))}/auth-users`, "POST");
            return true;
        }
        const serverSecretsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/secrets$/);
        if (req.method === "GET" && serverSecretsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverSecretsMatch[1]))}/secrets`);
            return true;
        }
        if (req.method === "POST" && serverSecretsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverSecretsMatch[1]))}/secrets`, "POST");
            return true;
        }
        const serverSecretDetailMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/secrets\/([^/]+)$/);
        if (req.method === "GET" && serverSecretDetailMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverSecretDetailMatch[1]))}/secrets/${encodeURIComponent(decodeURIComponent(serverSecretDetailMatch[2]))}`);
            return true;
        }
        if (req.method === "PUT" && serverSecretDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverSecretDetailMatch[1]))}/secrets/${encodeURIComponent(decodeURIComponent(serverSecretDetailMatch[2]))}`, "PUT");
            return true;
        }
        if (req.method === "DELETE" && serverSecretDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverSecretDetailMatch[1]))}/secrets/${encodeURIComponent(decodeURIComponent(serverSecretDetailMatch[2]))}`, "DELETE");
            return true;
        }
        const serverRunsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/runs$/);
        if (req.method === "GET" && serverRunsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRunsMatch[1]))}/runs${url.search || ""}`);
            return true;
        }
        if (req.method === "POST" && serverRunsMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRunsMatch[1]))}/runs`, "POST");
            return true;
        }
        const serverRunDetailMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/runs\/([^/]+)$/);
        if (req.method === "GET" && serverRunDetailMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRunDetailMatch[1]))}/runs/${encodeURIComponent(decodeURIComponent(serverRunDetailMatch[2]))}`);
            return true;
        }
        const serverRunEventsMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/runs\/([^/]+)\/events$/);
        if (req.method === "GET" && serverRunEventsMatch) {
            void proxyUpstreamGet(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRunEventsMatch[1]))}/runs/${encodeURIComponent(decodeURIComponent(serverRunEventsMatch[2]))}/events`);
            return true;
        }
        const serverRunCancelMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/runs\/([^/]+)\/cancel$/);
        if (req.method === "POST" && serverRunCancelMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverRunCancelMatch[1]))}/runs/${encodeURIComponent(decodeURIComponent(serverRunCancelMatch[2]))}/cancel`, "POST");
            return true;
        }
        const serverInvokeMatch = url.pathname.match(/^\/api\/real\/servers\/([^/]+)\/invoke$/);
        if (req.method === "POST" && serverInvokeMatch) {
            void proxyUpstreamJsonRequest(req, res, `/servers/${encodeURIComponent(decodeURIComponent(serverInvokeMatch[1]))}/invoke`, "POST");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/environments/default") {
            void proxyUpstreamGet(req, res, "/environments/default");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/environments/analytics/overview") {
            void proxyUpstreamGet(req, res, "/environments/analytics/overview");
            return true;
        }
        if (req.method === "GET" && url.pathname === "/api/real/environments/runtimes/available") {
            void proxyUpstreamGet(req, res, "/environments/runtimes/available");
            return true;
        }
        const environmentDetailMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)$/);
        if (req.method === "GET" && environmentDetailMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentDetailMatch[1]))}`);
            return true;
        }
        if (req.method === "PUT" && environmentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentDetailMatch[1]))}`, "PUT");
            return true;
        }
        if (req.method === "PATCH" && environmentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentDetailMatch[1]))}`, "PATCH");
            return true;
        }
        if (req.method === "DELETE" && environmentDetailMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentDetailMatch[1]))}`, "DELETE");
            return true;
        }
        const environmentSetDefaultMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/set-default$/);
        if (req.method === "POST" && environmentSetDefaultMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentSetDefaultMatch[1]))}/set-default`, "POST");
            return true;
        }
        const environmentDockerfileMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/dockerfile$/);
        if (req.method === "GET" && environmentDockerfileMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentDockerfileMatch[1]))}/dockerfile`);
            return true;
        }
        const environmentStartMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/start$/);
        if (req.method === "POST" && environmentStartMatch) {
            void proxyEnvironmentStart(req, res, decodeURIComponent(environmentStartMatch[1]));
            return true;
        }
        const environmentStopMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/stop$/);
        if (req.method === "POST" && environmentStopMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentStopMatch[1]))}/stop`, "POST");
            return true;
        }
        const environmentStatusMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/status$/);
        if (req.method === "GET" && environmentStatusMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentStatusMatch[1]))}/status`);
            return true;
        }
        const environmentAnalyticsMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/analytics$/);
        if (req.method === "GET" && environmentAnalyticsMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentAnalyticsMatch[1]))}/analytics`);
            return true;
        }
        const environmentGuiScreenshotMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/gui\/screenshot$/);
        if (req.method === "GET" && environmentGuiScreenshotMatch) {
            void proxyUpstreamBinaryGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentGuiScreenshotMatch[1]))}/gui/screenshot`);
            return true;
        }
        const environmentGuiActionMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/gui\/action$/);
        if (req.method === "POST" && environmentGuiActionMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentGuiActionMatch[1]))}/gui/action`, "POST");
            return true;
        }
        const environmentGuiSessionMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/gui\/session$/);
        if (req.method === "POST" && environmentGuiSessionMatch) {
            void proxyEnvironmentGuiSession(req, res, decodeURIComponent(environmentGuiSessionMatch[1]));
            return true;
        }
        const environmentGithubPrepareMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/github\/prepare$/);
        if (req.method === "POST" && environmentGithubPrepareMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentGithubPrepareMatch[1]))}/github/prepare`, "POST");
            return true;
        }
        const environmentSnapshotsMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/snapshots$/);
        if (req.method === "GET" && environmentSnapshotsMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentSnapshotsMatch[1]))}/snapshots`);
            return true;
        }
        const environmentSnapshotDiffMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/snapshots\/([^/]+)\/diff$/);
        if (req.method === "GET" && environmentSnapshotDiffMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentSnapshotDiffMatch[1]))}/snapshots/${encodeURIComponent(decodeURIComponent(environmentSnapshotDiffMatch[2]))}/diff`);
            return true;
        }
        const environmentSnapshotFileMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/snapshots\/([^/]+)\/file$/);
        if (req.method === "GET" && environmentSnapshotFileMatch) {
            const proxySnapshotFilePath = `/environments/${encodeURIComponent(decodeURIComponent(environmentSnapshotFileMatch[1]))}/snapshots/${encodeURIComponent(decodeURIComponent(environmentSnapshotFileMatch[2]))}/file`;
            if (url.searchParams.get("format") === "raw") {
                void proxyUpstreamBinaryGet(req, res, proxySnapshotFilePath);
            }
            else {
                void proxyUpstreamGet(req, res, proxySnapshotFilePath);
            }
            return true;
        }
        const environmentSnapshotForkMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/snapshots\/([^/]+)\/fork$/);
        if (req.method === "POST" && environmentSnapshotForkMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentSnapshotForkMatch[1]))}/snapshots/${encodeURIComponent(decodeURIComponent(environmentSnapshotForkMatch[2]))}/fork`, "POST");
            return true;
        }
        const environmentChangesMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/changes$/);
        if (req.method === "GET" && environmentChangesMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentChangesMatch[1]))}/changes`);
            return true;
        }
        const environmentChangeDiffMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/changes\/([^/]+)\/diff$/);
        if (req.method === "GET" && environmentChangeDiffMatch) {
            void proxyUpstreamGet(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentChangeDiffMatch[1]))}/changes/${encodeURIComponent(decodeURIComponent(environmentChangeDiffMatch[2]))}/diff`);
            return true;
        }
        const environmentChangeFileMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/changes\/([^/]+)\/file$/);
        if (req.method === "GET" && environmentChangeFileMatch) {
            const proxyChangeFilePath = `/environments/${encodeURIComponent(decodeURIComponent(environmentChangeFileMatch[1]))}/changes/${encodeURIComponent(decodeURIComponent(environmentChangeFileMatch[2]))}/file`;
            if (url.searchParams.get("format") === "raw") {
                void proxyUpstreamBinaryGet(req, res, proxyChangeFilePath);
            }
            else {
                void proxyUpstreamGet(req, res, proxyChangeFilePath);
            }
            return true;
        }
        const environmentChangeForkMatch = url.pathname.match(/^\/api\/real\/environments\/([^/]+)\/changes\/([^/]+)\/fork$/);
        if (req.method === "POST" && environmentChangeForkMatch) {
            void proxyUpstreamJsonRequest(req, res, `/environments/${encodeURIComponent(decodeURIComponent(environmentChangeForkMatch[1]))}/changes/${encodeURIComponent(decodeURIComponent(environmentChangeForkMatch[2]))}/fork`, "POST");
            return true;
        }
        return false;
    };
}
