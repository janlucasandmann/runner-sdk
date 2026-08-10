import { ExternalAgentError } from "./domain.mjs";

const ACTIVE_MEMBERSHIP_STATUSES = new Set(["active", "accepted", "member"]);
const DEFAULT_ALLOWED_ROLES = new Set(["owner", "admin", "member", "contributor"]);

export function createExternalAgentPolicy({ resolveOrganizationMembers, logger = console } = {}) {
  if (typeof resolveOrganizationMembers !== "function") {
    throw new TypeError("External-agent policy requires an organization membership resolver.");
  }

  async function authorize({ envelope, installation, binding, identity }) {
    if (!installation?.enabled || installation.id !== envelope.installationId) {
      deny("external_installation_disabled", "The external-agent installation is disabled.");
    }
    if (
      installation.provider !== envelope.provider
      || String(installation.tenantId || "").trim() !== String(envelope.tenantId || "").trim()
    ) {
      deny("external_installation_scope_mismatch", "The event does not belong to this installation.");
    }
    if (!binding?.enabled || binding.installationId !== installation.id) {
      deny("external_binding_unavailable", "No enabled external-agent binding matched this event.");
    }
    if (!Array.isArray(binding.triggerModes) || !binding.triggerModes.includes(envelope.trigger)) {
      deny("external_trigger_not_allowed", "This trigger is not enabled for the external-agent binding.");
    }
    if (envelope.actor.isApplication || envelope.actor.providerUserId === installation.appActorId) {
      deny("external_actor_is_application", "Application-authored events cannot invoke an agent.");
    }
    const explicitAllowlist = normalizeStringSet(binding.allowedExternalUserIds);
    if (
      explicitAllowlist.size
      && !explicitAllowlist.has(String(envelope.actor.providerUserId || "").trim().toLowerCase())
    ) {
      deny("external_actor_not_allowed", "The external actor is not allowed by this binding.");
    }

    if (binding.permissionMode === "external_requester") {
      if (!explicitAllowlist.size) {
        deny(
          "external_requester_allowlist_required",
          "External requester bindings require an explicit actor allowlist.",
        );
      }
      return Object.freeze({ mode: "external_requester", identity: null, membership: null });
    }

    if (!identity?.platformUserId) {
      deny(
        "external_identity_link_required",
        "Link this external identity to an organization member before invoking an agent.",
      );
    }
    let members;
    try {
      members = await resolveOrganizationMembers(installation.organizationId);
    } catch (error) {
      logger?.warn?.("[external-agents] Organization membership lookup failed", {
        organizationId: installation.organizationId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new ExternalAgentError(
        503,
        "external_membership_lookup_failed",
        "Organization membership could not be verified.",
      );
    }
    const membership = normalizeMembers(members).find((member) => (
      member.userId === identity.platformUserId
    ));
    if (!membership || !isActiveMembership(membership)) {
      deny("external_membership_required", "The linked user is not an active organization member.");
    }
    const allowedRoles = normalizeStringSet(binding.allowedOrganizationRoles);
    const role = String(membership.role || "").trim().toLowerCase();
    if (!(allowedRoles.size ? allowedRoles : DEFAULT_ALLOWED_ROLES).has(role)) {
      deny("external_membership_role_denied", "The linked organization role cannot invoke this agent.");
    }
    return Object.freeze({ mode: "linked_member", identity, membership });
  }

  return Object.freeze({ authorize });
}

export function selectExternalAgentBinding({ bindings, installation, envelope }) {
  const candidates = (Array.isArray(bindings) ? bindings : []).filter((binding) => (
    binding?.enabled
    && binding.organizationId === installation.organizationId
    && binding.installationId === installation.id
    && binding.provider === envelope.provider
  ));
  const resourceProjectId = String(envelope.resource.projectId || "").trim();
  const exact = candidates.find((binding) => (
    String(binding.externalProjectId || "").trim() === resourceProjectId
  ));
  return exact || candidates.find((binding) => !String(binding.externalProjectId || "").trim()) || null;
}

export function findExternalAgentIdentity({ identities, installation, envelope }) {
  return (Array.isArray(identities) ? identities : []).find((identity) => (
    identity?.organizationId === installation.organizationId
    && identity.installationId === installation.id
    && identity.provider === envelope.provider
    && identity.providerUserId === envelope.actor.providerUserId
  )) || null;
}

function deny(code, message) {
  throw new ExternalAgentError(403, code, message);
}

function normalizeMembers(payload) {
  const candidates = Array.isArray(payload)
    ? payload
    : [payload?.members, payload?.items, payload?.data, payload?.results].find(Array.isArray) || [];
  return candidates.flatMap((candidate) => {
    if (!candidate || typeof candidate !== "object") return [];
    const user = candidate.user && typeof candidate.user === "object" ? candidate.user : {};
    const userId = String(
      candidate.userId || candidate.user_id || candidate.uid || user.id || user.uid || "",
    ).trim();
    if (!userId) return [];
    return [{
      ...candidate,
      userId,
      role: String(candidate.role || candidate.organizationRole || "member").trim().toLowerCase(),
      status: String(candidate.status || candidate.membershipStatus || "active").trim().toLowerCase(),
    }];
  });
}

function isActiveMembership(membership) {
  const status = String(membership?.status || "active").trim().toLowerCase();
  return !status || ACTIVE_MEMBERSHIP_STATUSES.has(status);
}

function normalizeStringSet(value) {
  return new Set((Array.isArray(value) ? value : [])
    .map((entry) => String(entry || "").trim().toLowerCase())
    .filter(Boolean));
}
