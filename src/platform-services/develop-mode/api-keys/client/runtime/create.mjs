export const API_KEYS_CREATE_SCRIPT = `        async function handleSettingsCreateApiKey(input = {}) {
          if (!hasSessionAuth) {
            handleSignInWithComputerAgents();
            return false;
          }

          const keyName = String(input?.name || "").trim();
          if (!keyName) {
            return false;
          }

          const keyDescription = String(input?.description || "").trim();
          const keyPermissions = Array.isArray(input?.permissions) && input.permissions.length > 0
            ? input.permissions.map((permission) => String(permission || "").trim()).filter(Boolean)
            : ["*"];

          setSettingsCreateKeyLoading(true);
          setSettingsApiKeysError("");
          try {
            const response = await fetch("/api/aios/user/api-keys", {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: keyName,
                description: keyDescription || undefined,
                permissions: keyPermissions.length > 0 ? keyPermissions : ["*"],
              }),
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create API key.");
            }

            setSettingsNewlyCreatedKey(typeof data?.key === "string" ? data.key : "");
            if (typeof data?.id === "string" && data.id.trim() && typeof data?.key === "string" && data.key.trim()) {
              setSettingsRevealableApiKeys((current) => ({ ...current, [data.id.trim()]: data.key.trim() }));
            }
            setSettingsApiKeyDialogOpen(false);
            invalidateApiKeysOverviewAnalytics({
              backendUrl: proxyBackendBase,
              headers: authRequestHeaders,
              identity: String(sessionState.userId || sessionState.email || accountEmail || "session"),
            });
            setDevelopApiKeysAnalyticsRefreshToken((current) => current + 1);
            await loadSettingsApiKeys({ force: true });
            return true;
          } catch (error) {
            setSettingsApiKeysError(error instanceof Error ? error.message : "Failed to create API key.");
            return false;
          } finally {
            setSettingsCreateKeyLoading(false);
          }
        }
`;
