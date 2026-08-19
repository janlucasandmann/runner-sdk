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

      function buildDemoInferenceVersionSnapshot(value) {
        const source = value && typeof value === "object" ? value : {};
        const settings = normalizeDemoSettingsInferenceSettings(source);
        return {
          name: String(source.name || "Inference Endpoint").replace(/\\s+/g, " ").trim().slice(0, 120) || "Inference Endpoint",
          description: String(source.description || "").replace(/\\s+/g, " ").trim().slice(0, 280),
          enabled: Boolean(settings.enabled),
          providerType: settings.providerType,
          baseUrl: settings.baseUrl,
          defaultModel: settings.defaultModel,
          availableModels: settings.availableModels,
        };
      }

      function normalizeDemoInferenceVersionState(sourceValue, endpointId, endpointSnapshot) {
        const source = sourceValue && typeof sourceValue === "object" ? sourceValue : {};
        const rawVersions = Array.isArray(source.versions) ? source.versions : [];
        const fallbackTimestamp = String(source.createdAt || source.updatedAt || "1970-01-01T00:00:00.000Z");
        const seenIds = new Set();
        const seenNumbers = new Set();
        const versions = rawVersions.map((versionValue, index) => {
          const version = versionValue && typeof versionValue === "object" ? versionValue : {};
          const parsedNumber = Number(version.versionNumber ?? version.number);
          const number = Number.isFinite(parsedNumber) && parsedNumber >= 1
            ? Math.floor(parsedNumber)
            : index + 1;
          const idCandidate = String(version.id || "").trim();
          const id = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(idCandidate)
            ? idCandidate
            : endpointId + ":version:" + String(number);
          if (seenIds.has(id) || seenNumbers.has(number)) return null;
          seenIds.add(id);
          seenNumbers.add(number);
          const publishedAt = String(version.publishedAt || "").trim();
          return {
            id,
            number,
            versionNumber: number,
            label: String(version.label || "v" + String(number)).trim().slice(0, 80) || "v" + String(number),
            description: String(version.description || "").trim().slice(0, 240),
            status: version.status === "published" || publishedAt ? "published" : "saved",
            snapshot: buildDemoInferenceVersionSnapshot({
              ...endpointSnapshot,
              ...(version.snapshot && typeof version.snapshot === "object" ? version.snapshot : {}),
            }),
            createdAt: String(version.createdAt || fallbackTimestamp),
            updatedAt: String(version.updatedAt || version.createdAt || fallbackTimestamp),
            publishedAt: publishedAt || null,
          };
        }).filter(Boolean).sort((left, right) => left.number - right.number);
        if (versions.length === 0) {
          versions.push({
            id: endpointId + ":version:1",
            number: 1,
            versionNumber: 1,
            label: "v1",
            description: "Initial version",
            status: "saved",
            snapshot: buildDemoInferenceVersionSnapshot(endpointSnapshot),
            createdAt: fallbackTimestamp,
            updatedAt: String(source.updatedAt || fallbackTimestamp),
            publishedAt: null,
          });
        }
        const configuredCurrentVersionId = String(source.currentVersionId || "").trim();
        const currentVersion = versions.find((version) => version.id === configuredCurrentVersionId)
          || versions[versions.length - 1];
        const configuredPublishedVersionId = String(source.publishedVersionId || "").trim();
        const publishedVersion = versions.find((version) => version.id === configuredPublishedVersionId)
          || [...versions].reverse().find((version) => version.status === "published");
        const publishedVersionId = publishedVersion?.id || "";
        return {
          currentVersionId: currentVersion.id,
          currentVersionNumber: currentVersion.number,
          publishedVersionId,
          versions: versions.map((version) => ({
            ...version,
            status: version.id === publishedVersionId ? "published" : "saved",
            publishedAt: version.id === publishedVersionId ? version.publishedAt : null,
          })),
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
        const name = typeof source.name === "string"
          ? source.name.slice(0, 120)
          : providerLabel + " Endpoint";
        const description = typeof source.description === "string"
          ? source.description.slice(0, 280)
          : "";
        const versionState = normalizeDemoInferenceVersionState(source, id, {
          ...settings,
          name,
          description,
        });
        return {
          ...settings,
          id,
          name,
          description,
          isDefault: String(defaultEndpointId || "").trim()
            ? id === String(defaultEndpointId || "").trim()
            : Boolean(source.isDefault || index === 0),
          createdAt: typeof source.createdAt === "string" ? source.createdAt : "",
          updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : "",
          creatorId: String(source.creatorId || source.creatorUserId || "").trim(),
          creatorUserId: String(source.creatorUserId || source.creatorId || "").trim(),
          creatorName: String(source.creatorName || "").trim(),
          creatorEmail: String(source.creatorEmail || "").trim(),
          creatorAvatarUrl: String(source.creatorAvatarUrl || "").trim(),
          ownerId: String(source.ownerId || source.ownerUserId || "").trim(),
          ownerUserId: String(source.ownerUserId || source.ownerId || "").trim(),
          ownerName: String(source.ownerName || "").trim(),
          ownerEmail: String(source.ownerEmail || "").trim(),
          ownerAvatarUrl: String(source.ownerAvatarUrl || "").trim(),
          metadata: source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {},
          permissionSet: source.permissionSet && typeof source.permissionSet === "object" && !Array.isArray(source.permissionSet)
            ? source.permissionSet
            : null,
          deploymentManaged: Boolean(source.deploymentManaged),
          ...versionState,
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

      function getDemoInferenceEndpointVersion(endpointValue, versionId = "") {
        if (!endpointValue || typeof endpointValue !== "object") return null;
        const endpoint = normalizeDemoInferenceEndpoint(endpointValue);
        const normalizedVersionId = String(versionId || "").trim();
        return endpoint.versions.find((version) => version.id === normalizedVersionId) || null;
      }

      function applyDemoInferenceVersionSnapshot(endpointValue, versionValue) {
        const endpoint = normalizeDemoInferenceEndpoint(endpointValue);
        const version = versionValue && typeof versionValue === "object" ? versionValue : null;
        if (!version?.snapshot) return endpoint;
        return normalizeDemoInferenceEndpoint({
          ...endpoint,
          ...buildDemoInferenceVersionSnapshot(version.snapshot),
        });
      }

      function areDemoInferenceVersionSnapshotsEqual(leftValue, rightValue) {
        return JSON.stringify(buildDemoInferenceVersionSnapshot(leftValue))
          === JSON.stringify(buildDemoInferenceVersionSnapshot(rightValue));
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
