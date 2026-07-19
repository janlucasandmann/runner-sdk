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

      function normalizeDemoInferenceEndpoint(value, index = 0, defaultEndpointId = "") {
        const source = value && typeof value === "object" ? value : {};
        const settings = normalizeDemoSettingsInferenceSettings(source);
        const idCandidate = String(source.id || "").trim();
        const id = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(idCandidate)
          ? idCandidate
          : index === 0
            ? SETTINGS_ORGANIZATION_INFERENCE_ENDPOINT_ID
            : "inference-endpoint-" + String(index + 1);
        const providerLabel = settings.providerType === "openai-compatible"
          || settings.providerType === "openai_compatible"
          ? "OpenAI-Compatible"
          : String(settings.providerType || "Inference").toUpperCase();
        return {
          ...settings,
          id,
          name: String(source.name || "").replace(/\\s+/g, " ").trim().slice(0, 120)
            || providerLabel + " Endpoint",
          isDefault: String(defaultEndpointId || "").trim()
            ? id === String(defaultEndpointId || "").trim()
            : Boolean(source.isDefault || index === 0),
          createdAt: typeof source.createdAt === "string" ? source.createdAt : "",
          updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
        };
      }

      function normalizeDemoInferenceEndpointCollection(value, legacyInference = null) {
        const source = value && typeof value === "object" ? value : {};
        const rawEndpoints = Array.isArray(source.endpoints) ? source.endpoints : [];
        const legacySource = legacyInference && typeof legacyInference === "object"
          ? legacyInference
          : {};
        const normalizedLegacy = normalizeDemoSettingsInferenceSettings(legacySource);
        const legacyConfigured = Boolean(
          normalizedLegacy.enabled
          || normalizedLegacy.baseUrl
          || normalizedLegacy.apiKeyConfigured
          || normalizedLegacy.availableModels.length
        );
        const endpointSources = rawEndpoints.length > 0
          ? rawEndpoints
          : legacyConfigured
            ? [{
                ...normalizedLegacy,
                id: SETTINGS_ORGANIZATION_INFERENCE_ENDPOINT_ID,
                name: "Organization Inference Endpoint",
                isDefault: true,
              }]
            : [];
        const configuredDefaultId = String(source.defaultEndpointId || "").trim();
        const preliminaryEndpoints = endpointSources
          .slice(0, 50)
          .map((endpoint, index) => normalizeDemoInferenceEndpoint(
            endpoint,
            index,
            configuredDefaultId,
          ));
        const defaultEndpointId = preliminaryEndpoints.some(
          (endpoint) => endpoint.id === configuredDefaultId
        )
          ? configuredDefaultId
          : preliminaryEndpoints.find((endpoint) => endpoint.isDefault)?.id
            || preliminaryEndpoints[0]?.id
            || "";
        return {
          version: 2,
          defaultEndpointId,
          endpoints: preliminaryEndpoints.map((endpoint) => ({
            ...endpoint,
            isDefault: endpoint.id === defaultEndpointId,
          })),
        };
      }

      function getDemoInferenceEndpoint(collection, endpointId = "") {
        const normalizedCollection = normalizeDemoInferenceEndpointCollection(collection);
        const normalizedEndpointId = String(endpointId || "").trim();
        return normalizedCollection.endpoints.find(
          (endpoint) => endpoint.id === normalizedEndpointId
        ) || null;
      }

      function getDefaultDemoInferenceEndpoint(collection) {
        const normalizedCollection = normalizeDemoInferenceEndpointCollection(collection);
        return normalizedCollection.endpoints.find(
          (endpoint) => endpoint.id === normalizedCollection.defaultEndpointId
        ) || normalizedCollection.endpoints[0] || normalizeDemoInferenceEndpoint(null);
      }

      function upsertDemoInferenceEndpoint(collection, endpointValue) {
        const normalizedCollection = normalizeDemoInferenceEndpointCollection(collection);
        const endpoint = normalizeDemoInferenceEndpoint(
          endpointValue,
          normalizedCollection.endpoints.length,
          endpointValue?.isDefault
            ? String(endpointValue?.id || "")
            : normalizedCollection.defaultEndpointId,
        );
        const existingIndex = normalizedCollection.endpoints.findIndex(
          (entry) => entry.id === endpoint.id
        );
        const endpoints = existingIndex >= 0
          ? normalizedCollection.endpoints.map(
              (entry, index) => index === existingIndex ? endpoint : entry
            )
          : [...normalizedCollection.endpoints, endpoint];
        const defaultEndpointId = endpoint.isDefault || !normalizedCollection.defaultEndpointId
          ? endpoint.id
          : normalizedCollection.defaultEndpointId;
        return normalizeDemoInferenceEndpointCollection({
          version: 2,
          defaultEndpointId,
          endpoints,
        });
      }

      function removeDemoInferenceEndpoint(collection, endpointId) {
        const normalizedCollection = normalizeDemoInferenceEndpointCollection(collection);
        const normalizedEndpointId = String(endpointId || "").trim();
        const endpoints = normalizedCollection.endpoints.filter(
          (endpoint) => endpoint.id !== normalizedEndpointId
        );
        return normalizeDemoInferenceEndpointCollection({
          version: 2,
          defaultEndpointId: normalizedCollection.defaultEndpointId === normalizedEndpointId
            ? endpoints[0]?.id || ""
            : normalizedCollection.defaultEndpointId,
          endpoints,
        });
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
