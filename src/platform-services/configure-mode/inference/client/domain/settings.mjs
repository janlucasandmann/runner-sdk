export const INFERENCE_DOMAIN_SETTINGS_SCRIPT = `      function normalizeDemoSettingsInferenceSettings(value) {
        const source = value && typeof value === "object" ? value : {};
        const providerType = typeof source.providerType === "string" && source.providerType.trim()
          ? source.providerType.trim()
          : SETTINGS_DEFAULT_INFERENCE_SETTINGS.providerType;
        return {
          enabled: Boolean(source.enabled),
          providerType,
          baseUrl: typeof source.baseUrl === "string" ? source.baseUrl.trim() : "",
          defaultModel: typeof source.defaultModel === "string" ? source.defaultModel.trim() : "",
          availableModels: Array.isArray(source.availableModels)
            ? source.availableModels
              .map((entry) => String(entry || "").trim())
              .filter(Boolean)
              .slice(0, 100)
            : [],
          apiKeyConfigured: Boolean(source.apiKeyConfigured),
          apiKeyPreview: typeof source.apiKeyPreview === "string" ? source.apiKeyPreview.trim() : "",
          lastValidatedAt: typeof source.lastValidatedAt === "string" ? source.lastValidatedAt.trim() : "",
          healthStatus: source.healthStatus === "healthy" || source.healthStatus === "error"
            ? source.healthStatus
            : "idle",
          lastError: typeof source.lastError === "string" ? source.lastError.trim() : "",
        };
      }

      function mergeDemoInferenceModelLists(...lists) {
        return Array.from(
          new Set(
            lists.flatMap((list) =>
              (Array.isArray(list) ? list : [])
                .map((entry) => String(entry || "").trim())
                .filter(Boolean)
            )
          )
        ).slice(0, 100);
      }

      function parseDemoInferenceModelInput(value) {
        return mergeDemoInferenceModelLists(
          String(value || "")
            .split(/[\\n,]+/g)
            .map((entry) => entry.trim())
            .filter(Boolean)
        );
      }

      function buildDemoInferenceApiKeyPreview(value) {
        const normalized = String(value || "").trim();
        if (!normalized) {
          return "";
        }

        return normalized.length > 10
          ? normalized.slice(0, 10) + "..."
          : normalized;
      }
`;

