import { ExternalAgentError } from "./domain.mjs";

const ORGANIZATION_HEADER = "x-computer-agents-organization";
const WRITE_ROLES = new Set(["owner", "admin"]);
const ACTIVE_STATUSES = new Set(["active", "accepted", "member"]);

export function createExternalAgentMembershipService({
  identityService,
  fetchOrganizationApi,
  upstreamOrigin,
  resolveExecutionApiKey,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (typeof identityService?.readPrincipal !== "function") {
    throw new TypeError("External-agent membership requires identityService.readPrincipal.");
  }
  if (typeof fetchOrganizationApi !== "function") {
    throw new TypeError("External-agent membership requires an organization API transport.");
  }
  const origin = String(upstreamOrigin || "").trim().replace(/\/+$/, "");

  async function authorizeRequest(req, organizationId, { write = false } = {}) {
    const normalizedOrganizationId = normalizeId(organizationId);
    if (!normalizedOrganizationId) {
      throw new ExternalAgentError(400, "organization_required", "Select an organization first.");
    }
    const requestedOrganizationId = normalizeId(readHeader(req, ORGANIZATION_HEADER));
    if (requestedOrganizationId && requestedOrganizationId !== normalizedOrganizationId) {
      throw new ExternalAgentError(
        409,
        "organization_scope_mismatch",
        "The requested resource does not belong to the active organization.",
      );
    }
    const principal = await readPrincipal(identityService, req);
    const response = await fetchOrganizationApi(req, "/organizations", {
      method: "GET",
      headers: { accept: "application/json" },
    });
    const payload = await readResponseJson(response);
    if (!response?.ok) {
      throw new ExternalAgentError(
        Number(response?.status) || 502,
        "organization_lookup_failed",
        "Unable to verify organization membership.",
      );
    }
    const organization = normalizeOrganizations(payload).find((item) => item.id === normalizedOrganizationId);
    const role = organization ? resolveRole(organization, principal.userId) : "";
    if (!organization || !role) {
      throw new ExternalAgentError(
        403,
        "organization_membership_required",
        "You must be an active organization member to access this integration.",
      );
    }
    if (write && !WRITE_ROLES.has(role)) {
      throw new ExternalAgentError(
        403,
        "organization_admin_required",
        "Only organization owners and admins can change external-agent integrations.",
      );
    }
    return Object.freeze({ organization, organizationId: normalizedOrganizationId, principal, role });
  }

  async function resolveOrganizationMembers(organizationId) {
    const normalizedOrganizationId = normalizeId(organizationId);
    const apiKey = String(
      typeof resolveExecutionApiKey === "function" ? await resolveExecutionApiKey() : "",
    ).trim();
    if (!origin || !apiKey) {
      throw new ExternalAgentError(
        503,
        "external_membership_service_unconfigured",
        "External-agent membership verification is not configured.",
      );
    }
    const response = await fetchImpl(
      `${origin}/organizations/${encodeURIComponent(normalizedOrganizationId)}/members?includeProfiles=0`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
          "x-computer-agents-organization": normalizedOrganizationId,
        },
        signal: AbortSignal.timeout(15_000),
      },
    );
    const payload = await readResponseJson(response);
    if (!response.ok) {
      throw new ExternalAgentError(
        Number(response.status) || 502,
        "external_membership_lookup_failed",
        "Organization membership could not be verified.",
      );
    }
    return normalizeMembers(payload);
  }

  return Object.freeze({ authorizeRequest, resolveOrganizationMembers });
}

async function readPrincipal(identityService, req) {
  let principal;
  try {
    principal = await identityService.readPrincipal(req);
  } catch (cause) {
    throw new ExternalAgentError(401, "authentication_required", "A verified session is required.", {
      cause: cause instanceof Error ? cause.message : String(cause),
    });
  }
  const userId = normalizeId(principal?.uid || principal?.userId);
  if (!userId) {
    throw new ExternalAgentError(401, "authentication_required", "A verified session is required.");
  }
  return Object.freeze({ ...principal, uid: userId, userId });
}

function normalizeOrganizations(payload) {
  return findArray(payload, ["organizations", "items", "data", "results"]).flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = normalizeId(item.id || item.organizationId || item.organization_id);
    return id ? [{ ...item, id }] : [];
  });
}

function normalizeMembers(payload) {
  return findArray(payload, ["members", "items", "data", "results"]).flatMap((item) => {
    if (!isRecord(item)) return [];
    const user = isRecord(item.user) ? item.user : {};
    const userId = normalizeId(item.userId || item.user_id || item.uid || user.id || user.uid || item.id);
    if (!userId) return [];
    const status = String(item.status || item.membershipStatus || "active").trim().toLowerCase();
    if (status && !ACTIVE_STATUSES.has(status)) return [];
    return [{
      ...item,
      userId,
      role: String(item.role || item.organizationRole || "member").trim().toLowerCase(),
      status: status || "active",
    }];
  });
}

function resolveRole(organization, principalId) {
  const direct = normalizeRole(
    organization.role
    || organization.currentUserRole
    || organization.viewerRole
    || organization.membership?.role,
  );
  if (direct) return direct;
  const ownerId = normalizeId(
    organization.ownerId || organization.owner?.id || organization.createdById,
  );
  if (ownerId && ownerId === principalId) return "owner";
  const memberships = Array.isArray(organization.memberships)
    ? organization.memberships
    : Array.isArray(organization.members)
      ? organization.members
      : [];
  const membership = memberships.find((item) => normalizeId(
    item?.userId || item?.uid || item?.user?.id || item?.id,
  ) === principalId);
  return normalizeRole(membership?.role);
}

async function readResponseJson(response) {
  if (typeof response?.json === "function") {
    try {
      return await response.json();
    } catch {}
  }
  const text = typeof response?.text === "function" ? await response.text().catch(() => "") : "";
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function findArray(value, keys) {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];
  for (const key of keys) {
    if (Array.isArray(value[key])) return value[key];
    if (isRecord(value[key])) {
      const nested = findArray(value[key], keys);
      if (nested.length) return nested;
    }
  }
  return [];
}

function readHeader(req, name) {
  const value = req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || "").trim() : String(value || "").trim();
}

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  return ["owner", "admin", "developer", "contributor", "member", "billing", "viewer"].includes(role)
    ? role
    : "";
}

function normalizeId(value) {
  return String(value || "").trim().slice(0, 300);
}

function isRecord(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}
