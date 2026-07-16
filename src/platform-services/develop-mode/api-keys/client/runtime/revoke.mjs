export const API_KEYS_REVOKE_SCRIPT = `        async function handleSettingsRevokeApiKey(keyId) {
          if (!keyId) {
            return;
          }

          setSettingsRevokingKeyId(keyId);
          setSettingsApiKeysError("");
          try {
            const response = await fetch("/api/aios/user/api-keys/" + encodeURIComponent(keyId) + "/revoke", {
              method: "POST",
              credentials: "include",
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to revoke API key.");
            }

            invalidateApiKeysOverviewAnalytics({
              backendUrl: proxyBackendBase,
              headers: authRequestHeaders,
              identity: String(sessionState.userId || sessionState.email || accountEmail || "session"),
            });
            setDevelopApiKeysAnalyticsRefreshToken((current) => current + 1);
            await loadSettingsApiKeys({ force: true });
          } catch (error) {
            setSettingsApiKeysError(error instanceof Error ? error.message : "Failed to revoke API key.");
          } finally {
            setSettingsRevokingKeyId("");
          }
        }
`;
