export const GUARDRAILS_PERSISTENCE_SCRIPT = `      function readPlaygroundGuardrailSetsFromStorage() {
        if (typeof window === "undefined" || !window.localStorage) {
          return [];
        }
        try {
          const parsed = JSON.parse(window.localStorage.getItem(PLAYGROUND_GUARDRAILS_STORAGE_KEY) || "[]");
          return Array.isArray(parsed)
            ? parsed
                .map((set) => normalizePlaygroundGuardrailSet({ ...set, source: "custom", isDefault: false, readOnly: false, readonly: false }))
                .map((set) => ensurePlaygroundGuardrailInitialVersion(set))
                .filter((set) => !isPlaygroundDefaultGuardrailSet(set))
            : [];
        } catch {
          return [];
        }
      }

      function readPlaygroundGuardrailListFromPayload(payload, keys = []) {
        const source = payload && typeof payload === "object" && !Array.isArray(payload) ? payload : {};
        for (const key of keys) {
          if (Array.isArray(source[key])) return source[key];
          if (Array.isArray(source.data?.[key])) return source.data[key];
        }
        if (Array.isArray(source.data)) return source.data;
        if (Array.isArray(source.items)) return source.items;
        if (Array.isArray(source.records)) return source.records;
        return [];
      }

      function buildPlaygroundGuardrailBackendMetadata(set) {
        const normalizedSet = normalizePlaygroundGuardrailSet(set);
        const existingMetadata = stripPlaygroundGuardrailVersionMetadata(normalizedSet.metadata);
        return {
          ...(existingMetadata && typeof existingMetadata === "object" && !Array.isArray(existingMetadata) ? existingMetadata : {}),
        };
      }

      function buildPlaygroundGuardrailBackendPayload(set) {
        const normalizedSet = normalizePlaygroundGuardrailSet(set);
        return {
          id: normalizedSet.id,
          name: normalizedSet.name,
          description: normalizedSet.description,
          prompts: (Array.isArray(normalizedSet.prompts) ? normalizedSet.prompts : [])
            .map((prompt) => createPlaygroundGuardrailPromptDraft(prompt)),
          metadata: buildPlaygroundGuardrailBackendMetadata(normalizedSet),
        };
      }

      function mergePlaygroundGuardrailSetWithBackendDetails(set, versions = []) {
        const normalizedSet = normalizePlaygroundGuardrailSet(set);
        const normalizedVersions = normalizePlaygroundGuardrailVersions(versions);
        return ensurePlaygroundGuardrailInitialVersion(
          normalizedVersions.length
            ? createPlaygroundGuardrailWithVersionList(normalizedSet, normalizedVersions)
            : normalizedSet
        );
      }

`;
