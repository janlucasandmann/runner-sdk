import {
  listOrganizationConnectorCredentialProviders,
  listOrganizationConnectorCredentials,
} from "./connector-oauth-core.mjs";

const CREDENTIAL_CATALOG_PATH =
  /^\/api\/aios\/organizations\/([^/]+)\/connector-credentials\/?$/;
const ORGANIZATION_HEADER = "x-computer-agents-organization";
const VALID_ROLES = new Set([
  "owner",
  "admin",
  "developer",
  "contributor",
  "member",
  "billing",
  "viewer",
]);

export function createConnectorCredentialCatalogService({
  fetchSessionApi,
  fetchOrganizationApi,
  identityService,
  envFileCandidates = [],
  listCredentials = listOrganizationConnectorCredentials,
  listCredentialProviders = listOrganizationConnectorCredentialProviders,
  logger = console,
} = {}) {
  if (typeof fetchSessionApi !== "function") {
    throw new TypeError(
      "Connector credential catalog requires fetchSessionApi.",
    );
  }
  if (typeof identityService?.readPrincipal !== "function") {
    throw new TypeError(
      "Connector credential catalog requires identityService.readPrincipal.",
    );
  }
  if (
    fetchOrganizationApi !== undefined
    && typeof fetchOrganizationApi !== "function"
  ) {
    throw new TypeError(
      "Connector credential catalog fetchOrganizationApi must be a function.",
    );
  }
  if (typeof listCredentials !== "function") {
    throw new TypeError(
      "Connector credential catalog requires a credential list adapter.",
    );
  }
  if (typeof listCredentialProviders !== "function") {
    throw new TypeError(
      "Connector credential catalog requires a provider list adapter.",
    );
  }

  function handleRequest(req, res, url) {
    const match = CREDENTIAL_CATALOG_PATH.exec(url.pathname);
    if (!match) return false;
    void handleCredentialCatalogRequest({
      req,
      res,
      url,
      organizationId: decodeURIComponent(match[1]),
      fetchSessionApi,
      fetchOrganizationApi,
      identityService,
      envFileCandidates,
      listCredentials,
      listCredentialProviders,
      logger,
    });
    return true;
  }

  return Object.freeze({
    handleRequest,
  });
}

async function handleCredentialCatalogRequest({
  req,
  res,
  url,
  organizationId,
  fetchSessionApi,
  fetchOrganizationApi,
  identityService,
  envFileCandidates,
  listCredentials,
  listCredentialProviders,
  logger,
}) {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      Allow: "GET, OPTIONS",
      "Cache-Control": "no-store",
    });
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendJson(res, 405, {
      error: "method_not_allowed",
      message: "Connector credentials can only be listed with GET.",
    }, { Allow: "GET, OPTIONS" });
    return;
  }

  try {
    const normalizedOrganizationId = normalizeOrganizationId(organizationId);
    const hasProviderFilter = url.searchParams.has("provider");
    const provider = hasProviderFilter
      ? normalizeProviderId(url.searchParams.get("provider"))
      : "";
    if (!normalizedOrganizationId || (hasProviderFilter && !provider)) {
      sendJson(res, 400, {
        error: "invalid_connector_credential_catalog_request",
        message:
          "A valid organization and optional connector provider are required.",
      });
      return;
    }

    const principal = await readPrincipal(identityService, req);
    const organizationRequest = {
      method: "GET",
      headers: { accept: "application/json" },
    };
    const organizationsResponse =
      typeof fetchOrganizationApi === "function"
        ? await fetchOrganizationApi(
            req,
            "/organizations",
            organizationRequest,
          )
        : await fetchSessionApi(
            req,
            "/organizations",
            "/api/organizations",
            organizationRequest,
          );
    const organizationsPayload = await readResponseJson(
      organizationsResponse,
    );
    if (!organizationsResponse?.ok) {
      sendJson(res, Number(organizationsResponse?.status) || 502, {
        error: "organization_lookup_failed",
        message: "Unable to verify organization membership.",
      });
      return;
    }

    const organization = normalizeOrganizationList(
      organizationsPayload,
    ).find((candidate) => candidate.id === normalizedOrganizationId);
    const role = organization
      ? resolveOrganizationRole(organization, principal)
      : "";
    if (!organization || !role) {
      sendJson(res, 403, {
        error: "organization_membership_required",
        message:
          "You must be an active organization member to view its connector credentials.",
      });
      return;
    }

    const requestedOrganizationId = normalizeOrganizationId(
      readHeader(req, ORGANIZATION_HEADER),
    );
    if (
      requestedOrganizationId
      && requestedOrganizationId !== normalizedOrganizationId
    ) {
      sendJson(res, 409, {
        error: "organization_scope_mismatch",
        message:
          "The requested connector credentials do not match the active organization.",
      });
      return;
    }

    if (provider) {
      const credentials = await listCredentials({
        organizationId: normalizedOrganizationId,
        provider,
        envFileCandidates,
      });
      sendJson(res, 200, {
        organizationId: normalizedOrganizationId,
        provider,
        credentials: normalizePublicCredentials(credentials),
      });
      return;
    }

    const providerCatalogs = await listCredentialProviders({
      organizationId: normalizedOrganizationId,
      envFileCandidates,
    });
    const providers = (Array.isArray(providerCatalogs)
      ? providerCatalogs
      : []
    )
      .map(normalizePublicProviderCatalog)
      .filter(Boolean)
      .sort((left, right) => left.provider.localeCompare(right.provider));
    sendJson(res, 200, {
      organizationId: normalizedOrganizationId,
      providers,
    });
  } catch (error) {
    logger?.error?.("[connector-credentials] Unable to list credentials", {
      organizationId,
      error: error instanceof Error ? error.message : String(error),
    });
    const statusCode = Number(error?.statusCode) || 500;
    sendJson(res, statusCode, {
      error: statusCode === 401
        ? "authentication_required"
        : "connector_credential_catalog_failed",
      message: statusCode === 401
        ? "Sign in to view connector credentials."
        : "Unable to load connector credentials.",
    });
  }
}

async function readPrincipal(identityService, req) {
  let principal;
  try {
    principal = await identityService.readPrincipal(req);
  } catch (cause) {
    const error = new Error("A verified session is required.", { cause });
    error.statusCode = 401;
    throw error;
  }
  const userId = String(
    principal?.uid || principal?.userId || "",
  ).trim();
  if (!userId) {
    const error = new Error("A verified session is required.");
    error.statusCode = 401;
    throw error;
  }
  return { ...principal, uid: userId, userId };
}

function normalizeOrganizationList(payload) {
  const candidates = findArray(payload, [
    "organizations",
    "items",
    "data",
    "results",
  ]);
  return candidates.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const id = normalizeOrganizationId(
      candidate.id
        || candidate.organizationId
        || candidate.organization_id,
    );
    return id ? [{ ...candidate, id }] : [];
  });
}

function resolveOrganizationRole(organization, principal) {
  const principalId = String(
    principal.uid || principal.userId || "",
  ).trim();
  const directRole = normalizeRoleId(
    organization.role
      || organization.currentUserRole
      || organization.viewerRole
      || organization.membership?.role,
  );
  if (directRole) return directRole;

  const ownerId = String(
    organization.ownerId
      || organization.owner?.id
      || organization.createdById
      || "",
  ).trim();
  if (ownerId && ownerId === principalId) return "owner";

  const memberships = Array.isArray(organization.memberships)
    ? organization.memberships
    : Array.isArray(organization.members)
      ? organization.members
      : [];
  const membership = memberships.find((candidate) => (
    isRecord(candidate)
    && String(
      candidate.userId
        || candidate.uid
        || candidate.user?.id
        || candidate.id
        || "",
    ).trim() === principalId
  ));
  return normalizeRoleId(membership?.role);
}

function normalizePublicProviderCatalog(value) {
  if (!isRecord(value)) return null;
  const provider = normalizeProviderId(value.provider);
  if (!provider) return null;
  const credentials = normalizePublicCredentials(value.credentials);
  return credentials.length ? { provider, credentials } : null;
}

function normalizePublicCredentials(value) {
  return (Array.isArray(value) ? value : [])
    .map(normalizePublicCredential)
    .filter(Boolean);
}

function normalizePublicCredential(value) {
  if (!isRecord(value)) return null;
  const credentialId = normalizeCredentialId(
    value.credentialId || value.id,
  );
  if (!credentialId) return null;
  return {
    id: credentialId,
    credentialId,
    provider: normalizeProviderId(value.provider),
    name: String(value.name || "").trim().slice(0, 120),
    identity: String(value.identity || "").trim().slice(0, 240),
    status: value.status === "invalid" ? "invalid" : "valid",
    isDefault: value.isDefault === true,
    createdAt: normalizeIsoTimestamp(value.createdAt),
    updatedAt: normalizeIsoTimestamp(value.updatedAt),
  };
}

function normalizeProviderId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  const canonical = normalized === "atlassian" ? "jira" : normalized;
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(canonical)
    ? canonical
    : "";
}

function normalizeOrganizationId(value) {
  return String(value || "").trim().slice(0, 200);
}

function normalizeCredentialId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,120}$/.test(normalized) ? normalized : "";
}

function normalizeRoleId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return VALID_ROLES.has(normalized) ? normalized : "";
}

function normalizeIsoTimestamp(value) {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : "";
}

async function readResponseJson(response) {
  if (typeof response?.json === "function") {
    try {
      return await response.json();
    } catch {}
  }
  if (typeof response?.text === "function") {
    const text = await response.text().catch(() => "");
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  }
  return isRecord(response?.body) ? response.body : {};
}

function findArray(value, keys) {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key];
  }
  for (const key of keys) {
    const nested = findArray(value[key], keys);
    if (nested.length) return nested;
  }
  return [];
}

function readHeader(req, name) {
  if (typeof req?.headers?.get === "function") {
    return req.headers.get(name) || "";
  }
  if (typeof req?.getHeader === "function") {
    return req.getHeader(name) || "";
  }
  return req?.headers?.[name]
    || req?.headers?.[name.toLowerCase()]
    || "";
}

function sendJson(res, statusCode, payload, extraHeaders = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...extraHeaders,
  });
  res.end(JSON.stringify(payload));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
