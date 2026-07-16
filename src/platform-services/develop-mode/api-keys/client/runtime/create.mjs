export const API_KEYS_CREATE_SCRIPT = `        async function handleSettingsCreateApiKey() {
          if (!hasSessionAuth) {
            handleSignInWithComputerAgents();
            return;
          }

          const keyName = String(settingsNewKeyName || "").trim();
          if (!keyName) {
            return;
          }

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
                description: String(settingsNewKeyDescription || "").trim() || undefined,
                permissions: SETTINGS_API_KEY_SCOPE_PRESETS[settingsNewKeyScopePreset]?.permissions || ["*"],
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
            setSettingsNewKeyName("");
            setSettingsNewKeyDescription("");
            setSettingsNewKeyScopePreset("full");
            setSettingsApiKeyDialogOpen(false);
            invalidateApiKeysOverviewAnalytics({
              backendUrl: proxyBackendBase,
              headers: authRequestHeaders,
              identity: String(sessionState.userId || sessionState.email || accountEmail || "session"),
            });
            setDevelopApiKeysAnalyticsRefreshToken((current) => current + 1);
            await loadSettingsApiKeys({ force: true });
          } catch (error) {
            setSettingsApiKeysError(error instanceof Error ? error.message : "Failed to create API key.");
          } finally {
            setSettingsCreateKeyLoading(false);
          }
        }
`;
