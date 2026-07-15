export const API_KEYS_LOADING_SCRIPT = `        const loadSettingsApiKeys = useCallback(async function loadSettingsApiKeys(options = {}) {
          if (!hasSessionAuth) {
            settingsApiKeysSnapshotRef.current = { keys: [], loadedAt: 0, scopeKey: "" };
            settingsApiKeysLoadPromiseRef.current = null;
            setSettingsApiKeys([]);
            setSettingsApiKeysLoading(false);
            return;
          }

          const force = options?.force === true;
          const scopeKey = String(sessionState.userId || "").trim() || "session";
          let snapshot = settingsApiKeysSnapshotRef.current;
          if (snapshot.scopeKey !== scopeKey) {
            snapshot = { keys: [], loadedAt: 0, scopeKey };
            settingsApiKeysSnapshotRef.current = snapshot;
            settingsApiKeysLoadPromiseRef.current = null;
            setSettingsApiKeys([]);
          }
          const cacheAgeMs = Date.now() - Number(snapshot.loadedAt || 0);
          if (!force && snapshot.loadedAt > 0 && cacheAgeMs >= 0 && cacheAgeMs < 60_000) {
            setSettingsApiKeys(snapshot.keys);
            setSettingsApiKeysLoading(false);
            return snapshot.keys;
          }
          if (settingsApiKeysLoadPromiseRef.current) {
            if (!force) {
              return settingsApiKeysLoadPromiseRef.current;
            }
            try {
              await settingsApiKeysLoadPromiseRef.current;
            } catch {}
            snapshot = settingsApiKeysSnapshotRef.current;
          }

          const hasSnapshot = snapshot.loadedAt > 0;
          setSettingsApiKeysLoading(!hasSnapshot);
          setSettingsApiKeysError("");
          const request = (async () => {
            const response = await fetch("/api/aios/user/api-keys", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
            });
            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load API keys.");
            }

            const keys = Array.isArray(data?.keys) ? data.keys : [];
            settingsApiKeysSnapshotRef.current = {
              keys,
              loadedAt: Date.now(),
              scopeKey,
            };
            setSettingsApiKeys(keys);
            return keys;
          })();
          settingsApiKeysLoadPromiseRef.current = request;
          try {
            return await request;
          } catch (error) {
            if (!hasSnapshot) {
              setSettingsApiKeys([]);
            }
            setSettingsApiKeysError(error instanceof Error ? error.message : "Failed to load API keys.");
            return hasSnapshot ? snapshot.keys : [];
          } finally {
            if (settingsApiKeysLoadPromiseRef.current === request) {
              settingsApiKeysLoadPromiseRef.current = null;
              setSettingsApiKeysLoading(false);
            }
          }
        }, [hasSessionAuth, sessionState.userId]);
`;
