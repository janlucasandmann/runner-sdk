const REGISTRY_COLLECTION = "organization_connector_credentials";

export function createConnectorCredentialRegistry(storage) {
  if (
    typeof storage?.getDocument !== "function"
    || typeof storage?.setDocument !== "function"
    || typeof storage?.deleteDocument !== "function"
    || typeof storage?.listDocuments !== "function"
  ) {
    throw new TypeError(
      "Connector credential registry requires get, set, delete, and list storage methods.",
    );
  }

  async function register({
    organizationId,
    provider,
    credentialId,
    ownerUserId,
    name = "",
    identity = "",
    status = "valid",
    makeDefault = false,
    createdAt = Date.now(),
    updatedAt = Date.now(),
  }) {
    const identifiers = normalizeRegistryIdentifiers({
      organizationId,
      provider,
      credentialId,
      ownerUserId,
    });
    const providerPath = getProviderPath(
      identifiers.organizationId,
      identifiers.provider,
    );
    const providerRecord = await storage.getDocument(providerPath);
    const defaultCredentialId = makeDefault
      ? identifiers.credentialId
      : normalizeCredentialId(providerRecord?.defaultCredentialId)
        || identifiers.credentialId;

    await storage.setDocument(
      getCredentialPath(
        identifiers.organizationId,
        identifiers.provider,
        identifiers.credentialId,
      ),
      {
        organizationId: identifiers.organizationId,
        provider: identifiers.provider,
        credentialId: identifiers.credentialId,
        ownerUserId: identifiers.ownerUserId,
        name: normalizeDisplayValue(name, 120),
        identity: normalizeDisplayValue(identity, 240),
        status: status === "invalid" ? "invalid" : "valid",
        createdAt: normalizeTimestamp(createdAt),
        updatedAt: normalizeTimestamp(updatedAt),
      },
    );
    await storage.setDocument(providerPath, {
      organizationId: identifiers.organizationId,
      provider: identifiers.provider,
      defaultCredentialId,
      updatedAt: Date.now(),
    });

    return {
      ...identifiers,
      defaultCredentialId,
      isDefault: identifiers.credentialId === defaultCredentialId,
    };
  }

  async function unregister({
    organizationId,
    provider,
    credentialId,
  }) {
    const normalizedOrganizationId = normalizeOrganizationId(organizationId);
    const normalizedProvider = normalizeProvider(provider);
    const normalizedCredentialId = normalizeCredentialId(credentialId);
    if (
      !normalizedOrganizationId
      || !normalizedProvider
      || !normalizedCredentialId
    ) {
      return { defaultCredentialId: "" };
    }

    const providerPath = getProviderPath(
      normalizedOrganizationId,
      normalizedProvider,
    );
    await storage.deleteDocument(
      getCredentialPath(
        normalizedOrganizationId,
        normalizedProvider,
        normalizedCredentialId,
      ),
    );

    const providerRecord = await storage.getDocument(providerPath);
    const currentDefaultId = normalizeCredentialId(
      providerRecord?.defaultCredentialId,
    );
    let defaultCredentialId = currentDefaultId;
    if (!defaultCredentialId || defaultCredentialId === normalizedCredentialId) {
      const remaining = await list({
        organizationId: normalizedOrganizationId,
        provider: normalizedProvider,
        repairDefault: false,
      });
      defaultCredentialId = remaining[0]?.credentialId || "";
    }
    await storage.setDocument(providerPath, {
      organizationId: normalizedOrganizationId,
      provider: normalizedProvider,
      defaultCredentialId,
      updatedAt: Date.now(),
    });
    return { defaultCredentialId };
  }

  async function resolve({
    organizationId,
    provider,
    credentialId = "",
  }) {
    const normalizedOrganizationId = normalizeOrganizationId(organizationId);
    const normalizedProvider = normalizeProvider(provider);
    const normalizedCredentialId = normalizeCredentialId(credentialId);
    if (!normalizedOrganizationId || !normalizedProvider) return null;

    if (normalizedCredentialId) {
      return normalizeReference(
        await storage.getDocument(
          getCredentialPath(
            normalizedOrganizationId,
            normalizedProvider,
            normalizedCredentialId,
          ),
        ),
      );
    }

    const providerPath = getProviderPath(
      normalizedOrganizationId,
      normalizedProvider,
    );
    const providerRecord = await storage.getDocument(providerPath);
    const defaultCredentialId = normalizeCredentialId(
      providerRecord?.defaultCredentialId,
    );
    if (defaultCredentialId) {
      const reference = normalizeReference(
        await storage.getDocument(
          getCredentialPath(
            normalizedOrganizationId,
            normalizedProvider,
            defaultCredentialId,
          ),
        ),
      );
      if (reference) return reference;
    }

    const references = await list({
      organizationId: normalizedOrganizationId,
      provider: normalizedProvider,
      repairDefault: false,
    });
    const fallback = references[0] || null;
    if (fallback) {
      await storage.setDocument(providerPath, {
        organizationId: normalizedOrganizationId,
        provider: normalizedProvider,
        defaultCredentialId: fallback.credentialId,
        updatedAt: Date.now(),
      });
    }
    return fallback;
  }

  async function list({
    organizationId,
    provider,
    repairDefault = true,
  }) {
    const normalizedOrganizationId = normalizeOrganizationId(organizationId);
    const normalizedProvider = normalizeProvider(provider);
    if (!normalizedOrganizationId || !normalizedProvider) return [];

    const providerPath = getProviderPath(
      normalizedOrganizationId,
      normalizedProvider,
    );
    const providerRecord = await storage.getDocument(providerPath);
    const configuredDefaultId = normalizeCredentialId(
      providerRecord?.defaultCredentialId,
    );
    const references = (
      await storage.listDocuments(
        getCredentialCollectionPath(
          normalizedOrganizationId,
          normalizedProvider,
        ),
      )
    )
      .map(normalizeReference)
      .filter(Boolean)
      .sort((left, right) => {
        if (left.credentialId === configuredDefaultId) return -1;
        if (right.credentialId === configuredDefaultId) return 1;
        return left.createdAt - right.createdAt
          || left.credentialId.localeCompare(right.credentialId);
      });

    if (
      repairDefault
      && references.length
      && !references.some(
        (reference) => reference.credentialId === configuredDefaultId,
      )
    ) {
      await storage.setDocument(providerPath, {
        organizationId: normalizedOrganizationId,
        provider: normalizedProvider,
        defaultCredentialId: references[0].credentialId,
        updatedAt: Date.now(),
      });
    }
    return references.map((reference, index) => ({
      ...reference,
      isDefault:
        reference.credentialId
        === (configuredDefaultId || references[0]?.credentialId)
      || (!configuredDefaultId && index === 0),
    }));
  }

  async function listProviders({ organizationId }) {
    const normalizedOrganizationId = normalizeOrganizationId(organizationId);
    if (!normalizedOrganizationId) return [];

    return (
      await storage.listDocuments(
        getProviderCollectionPath(normalizedOrganizationId),
      )
    )
      .map(normalizeProviderReference)
      .filter((reference) => (
        reference
        && reference.organizationId === normalizedOrganizationId
      ))
      .sort((left, right) => left.provider.localeCompare(right.provider));
  }

  return Object.freeze({
    register,
    unregister,
    resolve,
    list,
    listProviders,
  });
}

export function getConnectorCredentialRegistryPaths({
  organizationId,
  provider,
  credentialId = "",
}) {
  const normalizedOrganizationId = normalizeOrganizationId(organizationId);
  const normalizedProvider = normalizeProvider(provider);
  const normalizedCredentialId = normalizeCredentialId(credentialId);
  return {
    providerPath:
      normalizedOrganizationId && normalizedProvider
        ? getProviderPath(normalizedOrganizationId, normalizedProvider)
        : "",
    credentialCollectionPath:
      normalizedOrganizationId && normalizedProvider
        ? getCredentialCollectionPath(
            normalizedOrganizationId,
            normalizedProvider,
          )
        : "",
    credentialPath:
      normalizedOrganizationId
      && normalizedProvider
      && normalizedCredentialId
        ? getCredentialPath(
            normalizedOrganizationId,
            normalizedProvider,
            normalizedCredentialId,
          )
        : "",
  };
}

function normalizeRegistryIdentifiers({
  organizationId,
  provider,
  credentialId,
  ownerUserId,
}) {
  const normalized = {
    organizationId: normalizeOrganizationId(organizationId),
    provider: normalizeProvider(provider),
    credentialId: normalizeCredentialId(credentialId),
    ownerUserId: normalizeOwnerUserId(ownerUserId),
  };
  for (const [key, value] of Object.entries(normalized)) {
    if (!value) {
      throw new TypeError(`A valid connector credential ${key} is required.`);
    }
  }
  return normalized;
}

function normalizeReference(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const organizationId = normalizeOrganizationId(value.organizationId);
  const provider = normalizeProvider(value.provider);
  const credentialId = normalizeCredentialId(value.credentialId);
  const ownerUserId = normalizeOwnerUserId(value.ownerUserId);
  if (!organizationId || !provider || !credentialId || !ownerUserId) return null;
  return {
    organizationId,
    provider,
    credentialId,
    ownerUserId,
    name: normalizeDisplayValue(value.name, 120),
    identity: normalizeDisplayValue(value.identity, 240),
    status: value.status === "invalid" ? "invalid" : "valid",
    createdAt: normalizeTimestamp(value.createdAt),
    updatedAt: normalizeTimestamp(value.updatedAt),
  };
}

function normalizeProviderReference(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  if (normalizeCredentialId(value.credentialId)) return null;
  const organizationId = normalizeOrganizationId(value.organizationId);
  const provider = normalizeProvider(value.provider);
  if (!organizationId || !provider) return null;
  return {
    organizationId,
    provider,
    defaultCredentialId: normalizeCredentialId(value.defaultCredentialId),
    updatedAt: normalizeTimestamp(value.updatedAt),
  };
}

function getProviderCollectionPath(organizationId) {
  return `${REGISTRY_COLLECTION}/${encodePathSegment(organizationId)}/providers`;
}

function getProviderPath(organizationId, provider) {
  return `${getProviderCollectionPath(organizationId)}/${encodePathSegment(provider)}`;
}

function getCredentialCollectionPath(organizationId, provider) {
  return `${getProviderPath(organizationId, provider)}/credentials`;
}

function getCredentialPath(organizationId, provider, credentialId) {
  return `${getCredentialCollectionPath(organizationId, provider)}/${encodePathSegment(credentialId)}`;
}

function encodePathSegment(value) {
  return encodeURIComponent(String(value || "").trim());
}

function normalizeOrganizationId(value) {
  return String(value || "").trim().slice(0, 200);
}

function normalizeProvider(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : "";
}

function normalizeCredentialId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,120}$/.test(normalized) ? normalized : "";
}

function normalizeOwnerUserId(value) {
  return String(value || "").trim().slice(0, 240);
}

function normalizeDisplayValue(value, maximumLength) {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, maximumLength);
}

function normalizeTimestamp(value) {
  const normalized = Number(value);
  return Number.isFinite(normalized) && normalized > 0
    ? Math.floor(normalized)
    : Date.now();
}
