export const MODELS_AGENT_CATALOG_LOADER_SCRIPT = `        const loadAgentModelCatalog = useCallback(async () => {
          try {
            const response = await fetch(backendUrl + "/agents/models", {
              method: "GET",
              headers: requestHeaders,
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok || !Array.isArray(data?.models) || data.models.length === 0) {
              setAgentModelOptions(PLAYGROUND_AGENT_MODEL_OPTIONS);
              return;
            }
            const remoteOptions = data.models
              .map((entry) => ({
                id: String(entry?.id || "").trim(),
                label: String(entry?.label || entry?.id || "").trim(),
                description: String(entry?.description || "").trim(),
                intelligence: String(entry?.intelligence || "").trim() || "Custom",
                contextWindow: String(entry?.contextWindow || "").trim() || "Custom",
                speed: String(entry?.speed || "").trim() || "Custom",
                source: String(entry?.source || "managed").trim(),
                providerType: String(entry?.providerType || "").trim(),
                locked: Boolean(entry?.locked),
              }))
              .filter((entry) => entry.id && entry.label);
            const mergedOptionsById = new Map();
            PLAYGROUND_AGENT_MODEL_OPTIONS.forEach((entry) => {
              if (!entry?.id) return;
              mergedOptionsById.set(entry.id, { ...entry });
            });
            remoteOptions.forEach((entry) => {
              if (!entry?.id) return;
              const existing = mergedOptionsById.get(entry.id) || {};
              mergedOptionsById.set(entry.id, {
                ...existing,
                ...entry,
              });
            });
            const nextOptions = Array.from(mergedOptionsById.values()).filter((entry) => entry?.id && entry?.label);
            setAgentModelOptions(nextOptions.length > 0 ? nextOptions : PLAYGROUND_AGENT_MODEL_OPTIONS);
          } catch {
            setAgentModelOptions(PLAYGROUND_AGENT_MODEL_OPTIONS);
          }
        }, [backendUrl, requestHeaders]);
`;
