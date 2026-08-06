const DEFAULT_COLLECTION = "user_tag_settings";

export function createConnectorSettingsStore({
  getDocument,
  collection = DEFAULT_COLLECTION,
} = {}) {
  if (typeof getDocument !== "function") {
    throw new TypeError(
      "Connector settings store requires a getDocument method.",
    );
  }
  const normalizedCollection = normalizeCollection(collection);

  async function resolve({
    userId,
    organizationId = "",
    connectorIds = [],
  } = {}) {
    const normalizedUserId = normalizeRequiredIdentifier(userId, "user");
    const normalizedOrganizationId = normalizeIdentifier(organizationId);
    const normalizedConnectorIds = normalizeConnectorIds(connectorIds);
    if (!normalizedConnectorIds.length) return {};

    for (const connectorId of normalizedConnectorIds) {
      const scopedDocument = await getDocument(
        `${normalizedCollection}/${buildConnectorSettingsDocumentId(
          normalizedUserId,
          connectorId,
          normalizedOrganizationId,
        )}`,
      );
      if (scopedDocument !== null && scopedDocument !== undefined) {
        return asRecord(scopedDocument);
      }

      if (normalizedOrganizationId) {
        const legacyDocument = await getDocument(
          `${normalizedCollection}/${buildConnectorSettingsDocumentId(
            normalizedUserId,
            connectorId,
          )}`,
        );
        if (legacyDocument !== null && legacyDocument !== undefined) {
          return asRecord(legacyDocument);
        }
      }
    }
    return {};
  }

  return Object.freeze({ resolve });
}

export function buildConnectorSettingsDocumentId(
  userId,
  connectorId,
  organizationId = "",
) {
  const normalizedUserId = normalizeRequiredIdentifier(userId, "user");
  const normalizedConnectorId = normalizeRequiredConnectorId(connectorId);
  const normalizedOrganizationId = normalizeIdentifier(organizationId);
  return normalizedOrganizationId
    ? `${normalizedUserId}_${normalizedOrganizationId}_${normalizedConnectorId}`
    : `${normalizedUserId}_${normalizedConnectorId}`;
}

function normalizeConnectorIds(value) {
  const candidates = Array.isArray(value) ? value : [value];
  return [...new Set(candidates.map(normalizeConnectorId).filter(Boolean))];
}

function normalizeRequiredConnectorId(value) {
  const normalized = normalizeConnectorId(value);
  if (!normalized) throw new TypeError("A valid connector id is required.");
  return normalized;
}

function normalizeConnectorId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : "";
}

function normalizeRequiredIdentifier(value, label) {
  const normalized = normalizeIdentifier(value);
  if (!normalized) throw new TypeError(`A valid ${label} id is required.`);
  return normalized;
}

function normalizeIdentifier(value) {
  return String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 256);
}

function normalizeCollection(value) {
  const normalized = String(value || "").trim();
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(normalized)) {
    throw new TypeError("A valid connector settings collection is required.");
  }
  return normalized;
}

function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}
