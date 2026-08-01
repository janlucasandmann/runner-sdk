import {
  resolveConnectorCredentialForOrganization,
} from "./connector-oauth-core.mjs";
import {
  canonicalizeConnectorId,
  createConnectorActionPrefix,
  getConnectorCredentialProviderId,
  listConnectorIdentityAliases,
} from "./connector-identity.mjs";
import { resolveProviderGrantAccess } from "./connector-provider-grants.mjs";

const CONNECTOR_POLICY_VERSION = 1;
const ORGANIZATION_HEADER = "x-computer-agents-organization";
const VALID_RING_IDS = new Set(["ring_1", "ring_2", "ring_3"]);
const READ_ACCESS = new Set(["full_access", "read_only"]);
const WRITE_ACCESS = new Set(["full_access"]);
const APPROVAL_ACCESS = "ask_for_permission";
const CONNECTOR_RUNTIME_INSTRUCTION_MARKER =
  "[Platform connector runtime instructions]";

export class ConnectorPolicyError extends Error {
  constructor(statusCode, code, message, details = undefined) {
    super(message);
    this.name = "ConnectorPolicyError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

export function createConnectorExecutionPolicy({
  fetchSessionApi,
  fetchResourceApi,
  fetchOrganizationApi,
  identityService,
  envFileCandidates = [],
  resolveCredential = resolveConnectorCredentialForOrganization,
  listConnectorCapabilities = () => [],
  logger = console,
} = {}) {
  if (typeof fetchSessionApi !== "function") {
    throw new TypeError("Connector execution policy requires fetchSessionApi.");
  }
  if (typeof identityService?.readPrincipal !== "function") {
    throw new TypeError("Connector execution policy requires identityService.readPrincipal.");
  }
  if (
    fetchResourceApi !== undefined
    && typeof fetchResourceApi !== "function"
  ) {
    throw new TypeError(
      "Connector execution policy fetchResourceApi must be a function.",
    );
  }
  if (
    fetchOrganizationApi !== undefined
    && typeof fetchOrganizationApi !== "function"
  ) {
    throw new TypeError(
      "Connector execution policy fetchOrganizationApi must be a function.",
    );
  }
  if (typeof listConnectorCapabilities !== "function") {
    throw new TypeError(
      "Connector execution policy listConnectorCapabilities must be a function.",
    );
  }

  async function enrichThreadMessagePayload(
    req,
    threadId,
    upstreamUrl,
    apiKey,
    payload,
    context = {},
  ) {
    const requestedConnectors = normalizeRequestedConnectors(
      context.requestedConnectors,
    );
    if (!requestedConnectors.length) return payload;

    const principal = await readVerifiedPrincipal(identityService, req);
    const protectedResourceContext = { upstreamUrl, apiKey };
    const organizationTransport = apiKey && upstreamUrl && fetchResourceApi
      ? fetchResourceApi
      : fetchOrganizationApi || fetchResourceApi;
    const [threadPayload, organizationsPayload] = await Promise.all([
      fetchRequiredResourceJson(
        fetchResourceApi,
        fetchSessionApi,
        req,
        `/threads/${encodeURIComponent(threadId)}`,
        `/api/threads/${encodeURIComponent(threadId)}`,
        "thread",
        protectedResourceContext,
      ),
      fetchRequiredResourceJson(
        organizationTransport,
        fetchSessionApi,
        req,
        "/organizations",
        "/api/organizations",
        "organizations",
        protectedResourceContext,
      ),
    ]);
    const thread = unwrapRecord(
      threadPayload,
      ["thread", "item", "data"],
    );
    const agentId = readThreadAgentId(thread);
    if (!agentId) {
      throw new ConnectorPolicyError(
        403,
        "connector_agent_required",
        "Connector execution requires a thread with an assigned agent.",
      );
    }

    const organizations = normalizeOrganizationList(organizationsPayload);
    const organization = resolveRequestOrganization(
      req,
      principal,
      organizations,
    );
    const roleId = resolveOrganizationRole(organization, principal);
    if (!roleId) {
      throw new ConnectorPolicyError(
        403,
        "connector_organization_membership_required",
        "The current user is not an active member of the selected organization.",
      );
    }

    const agentPayload = await fetchRequiredResourceJson(
      fetchResourceApi,
      fetchSessionApi,
      req,
      `/agents/${encodeURIComponent(agentId)}`,
      `/api/agents/${encodeURIComponent(agentId)}`,
      "agent",
      protectedResourceContext,
    );
    const agent = unwrapRecord(agentPayload, ["agent", "item", "data"]);
    const agentPermissionSet = readPermissionSet(agent);
    if (!agentPermissionSet) {
      throw new ConnectorPolicyError(
        403,
        "connector_agent_policy_required",
        "The assigned agent does not have a connector permission policy.",
      );
    }

    const projectId = readThreadProjectId(thread);
    const project = projectId
      ? unwrapRecord(
          await fetchRequiredResourceJson(
            fetchResourceApi,
            fetchSessionApi,
            req,
            `/projects/${encodeURIComponent(projectId)}`,
            `/api/projects/${encodeURIComponent(projectId)}`,
            "project",
            protectedResourceContext,
          ),
          ["project", "item", "data"],
        )
      : null;
    assertProjectOrganization(project, organization.id);

    const evaluatedConnectors = {};
    for (const request of requestedConnectors) {
      const connector = await evaluateRequestedConnector({
        req,
        request,
        principal,
        agentId,
        organization,
        roleId,
        agentPermissionSet,
        project,
        projectId,
        fetchSessionApi,
        resolveCredential,
        envFileCandidates,
        listConnectorCapabilities,
      });
      evaluatedConnectors[request.id] = connector;
    }

    logger?.info?.("[connector-policy] Authorized thread connectors", {
      threadId,
      agentId,
      organizationId: organization.id,
      connectors: Object.entries(evaluatedConnectors).map(([id, policy]) => ({
        id,
        credentialSource: policy.credentialResolution.source,
        allowedActionCount: policy.allowedActions.length,
        approvalActionCount: policy.approvalRequiredActions.length,
      })),
    });

    const executionContent = buildConnectorExecutionContent(
      payload,
      evaluatedConnectors,
    );
    return {
      ...payload,
      connectors: evaluatedConnectors,
      executionContent,
      useExecutionContentForUpstream: true,
    };
  }

  return Object.freeze({
    enrichThreadMessagePayload,
    evaluateRequestedConnector,
  });
}

export function buildConnectorExecutionContent(payload, connectors) {
  const baseContent = String(
    typeof payload?.executionContent === "string"
      && payload.executionContent.trim()
      ? payload.executionContent
      : payload?.content || "",
  ).trim();
  if (!baseContent || !isRecord(connectors) || !Object.keys(connectors).length) {
    return baseContent;
  }
  if (baseContent.includes(CONNECTOR_RUNTIME_INSTRUCTION_MARKER)) {
    return baseContent;
  }

  const connectorLines = Object.entries(connectors)
    .filter(([, policy]) => policy?.enabled !== false)
    .map(([connectorId, policy]) => {
      const actions = Array.isArray(policy?.allowedActions)
        ? policy.allowedActions.map(String).filter(Boolean)
        : [];
      const approvalActions = Array.isArray(policy?.approvalRequiredActions)
        ? policy.approvalRequiredActions.map(String).filter(Boolean)
        : [];
      const actionSummary = [...actions, ...approvalActions].join(", ");
      return `- ${formatConnectorName(connectorId)} (${connectorId})`
        + (actionSummary ? `: ${actionSummary}` : "");
    });

  return [
    baseContent,
    "",
    CONNECTOR_RUNTIME_INSTRUCTION_MARKER,
    "The user explicitly selected the authenticated platform connectors below. "
      + "Their tools are supplied to this run through platform-managed remote MCP servers:",
    ...connectorLines,
    "Use the selected connector tools directly whenever they are relevant to the request. "
      + "Do not inspect local MCP settings, environment files, or secrets to decide whether these connectors are configured.",
    "Never ask the user for provider URLs, API tokens, passwords, or credentials for a selected connector. "
      + "Do not install another connector or bypass it with a direct provider REST script.",
    "If a selected connector tool returns an error, report that platform connector error accurately instead of claiming the connector was not configured.",
  ].join("\n");
}

function formatConnectorName(connectorId) {
  if (connectorId === "atlassian" || connectorId === "jira") {
    return "Atlassian";
  }
  return String(connectorId || "")
    .split(/[-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function normalizeRequestedConnectors(value) {
  const entries = Array.isArray(value)
    ? value.map((item) => {
        if (typeof item === "string") return [item, { enabled: true }];
        if (!isRecord(item)) return ["", {}];
        return [
          item.id || item.connectorId || item.provider,
          item,
        ];
      })
    : isRecord(value)
      ? Object.entries(value)
      : [];
  const normalizedById = new Map();
  for (const [rawId, rawOptions] of entries) {
    const id = canonicalizeConnectorId(rawId);
    const options = isRecord(rawOptions) ? rawOptions : {};
    if (!id || options.enabled === false) continue;
    const requestedId = String(rawId || "").trim().toLowerCase();
    if (normalizedById.has(id) && requestedId !== id) continue;
    normalizedById.set(id, {
      id,
      credentialId: normalizeCredentialId(
        options.credentialId || options.credential_id,
      ),
    });
  }
  return [...normalizedById.values()];
}

export function resolvePermissionAccess(
  permissionSet,
  actionId,
  fallbackRingId,
  { requireConfiguredAction = false } = {},
) {
  if (!isRecord(permissionSet)) return "no_access";
  const actions = isRecord(permissionSet.actions)
    ? permissionSet.actions
    : {};
  const rawAction = actions[actionId];
  if (requireConfiguredAction && rawAction === undefined) return "no_access";
  if (typeof rawAction === "string") {
    return normalizeAccess(rawAction);
  }
  const action = isRecord(rawAction) ? rawAction : {};
  const explicitAccess = normalizeAccess(action.access, "");
  if (explicitAccess) return explicitAccess;
  const ringId = normalizeRingId(action.ringId, fallbackRingId);
  const rings = isRecord(permissionSet.rings) ? permissionSet.rings : {};
  const ring = rings[ringId];
  if (typeof ring === "string") return normalizeAccess(ring);
  if (isRecord(ring)) {
    const ringAccess = normalizeAccess(ring.defaultAccess, "");
    if (ringAccess) return ringAccess;
  }
  return normalizeAccess(permissionSet.defaultAccess, "no_access");
}

export function intersectConnectorActionPolicies({
  accessValues,
  interactive,
}) {
  let requiresApproval = false;
  for (const rawAccess of accessValues) {
    const access = normalizeAccess(rawAccess);
    if (access === APPROVAL_ACCESS) {
      requiresApproval = true;
      continue;
    }
    const allowed = interactive
      ? WRITE_ACCESS.has(access)
      : READ_ACCESS.has(access);
    if (!allowed) return "denied";
  }
  return requiresApproval ? "approval_required" : "allowed";
}

async function evaluateRequestedConnector({
  req,
  request,
  principal,
  agentId,
  organization,
  roleId,
  agentPermissionSet,
  project,
  projectId,
  fetchSessionApi,
  resolveCredential,
  envFileCandidates,
  listConnectorCapabilities,
}) {
  const trustedCapabilities = normalizeTrustedCapabilities(
    listConnectorCapabilities(request.id),
  );
  const configPayload = await fetchConnectorConfigJson(
    fetchSessionApi,
    req,
    request.id,
    {
      allowMissing: trustedCapabilities.length > 0,
    },
  );
  const config = unwrapRecord(
    configPayload,
    ["tag", "plugin", "connector", "config", "item", "data"],
  );
  const connectorPermissionSet =
    readPermissionSet(config) || createDefaultConnectorPermissionSet();
  const capabilities = listConfiguredCapabilities(
    request.id,
    config,
    connectorPermissionSet,
    trustedCapabilities,
  );
  if (!capabilities.length) {
    throw new ConnectorPolicyError(
      403,
      "connector_capabilities_required",
      `${request.id} does not expose any configured capabilities.`,
    );
  }

  const rolePermissionSet = readOrganizationRolePermissionSet(
    config,
    roleId,
    request.id,
  );
  const projectBinding = readProjectConnectorCredentialBinding(
    project,
    request.id,
  );
  const selectedCredentialId =
    request.credentialId || projectBinding.credentialId;
  const credentialSource = request.credentialId
    ? "explicit"
    : projectBinding.credentialId
      ? "project"
      : "organization_default";
  const requestingUserId = String(
    principal.uid || principal.userId || "",
  ).trim();
  const credential = await resolveCredential({
    provider: getConnectorCredentialProviderId(request.id),
    organizationId: organization.id,
    credentialId: selectedCredentialId,
    requestingUserId,
    envFileCandidates,
    encryptionKeyNames: getCredentialEncryptionKeyNames(request.id),
  });
  if (!credential || credential.status === "invalid") {
    const scopedMessage = credentialSource === "project"
      ? `The ${request.id} credentials selected by this project are unavailable.`
      : credentialSource === "explicit"
        ? `The selected ${request.id} credentials are unavailable.`
        : `${request.id} requires valid organization credentials.`;
    throw new ConnectorPolicyError(
      403,
      "connector_credentials_required",
      scopedMessage,
      {
        credentialSource,
        ...(projectId ? { projectId } : {}),
      },
    );
  }
  const credentialOrganizationId = normalizeOrganizationId(
    credential.organizationId,
  );
  if (
    !credentialOrganizationId
    || credentialOrganizationId !== organization.id
  ) {
    throw new ConnectorPolicyError(
      403,
      "connector_credential_organization_mismatch",
      `The selected ${request.id} credentials do not belong to this organization.`,
    );
  }

  const allowedActions = [];
  const approvalRequiredActions = [];
  const actionPolicies = {};
  for (const capability of capabilities) {
    const connectorAccess = resolvePermissionAccess(
      connectorPermissionSet,
      capability.actionId,
      capability.ringId,
    );
    const roleAccess = resolvePermissionAccess(
      rolePermissionSet,
      capability.actionId,
      capability.ringId,
    );
    const agentAccess = resolvePermissionAccess(
      agentPermissionSet,
      capability.actionId,
      capability.ringId,
    );
    const providerAccess = resolveProviderGrantAccess(
      getConnectorCredentialProviderId(request.id),
      capability,
      credential.token,
    );
    const decision = intersectConnectorActionPolicies({
      accessValues: [
        connectorAccess,
        roleAccess,
        agentAccess,
        providerAccess,
      ],
      interactive: capability.interactive,
    });
    if (decision === "allowed") {
      allowedActions.push(capability.capabilityId);
      actionPolicies[capability.capabilityId] = "allowed";
    } else if (decision === "approval_required") {
      approvalRequiredActions.push(capability.capabilityId);
      actionPolicies[capability.capabilityId] = "approval_required";
    }
  }

  if (!allowedActions.length && !approvalRequiredActions.length) {
    throw new ConnectorPolicyError(
      403,
      "connector_actions_denied",
      `The current user and agent do not share permission to use ${request.id}.`,
    );
  }

  return Object.freeze({
    enabled: true,
    agentId,
    actorUserId: requestingUserId,
    credentialId: credential.credentialId,
    organizationId: organization.id,
    credentialResolution: Object.freeze({
      source: credentialSource,
      ...(projectId ? { projectId } : {}),
    }),
    allowedActions: Object.freeze(allowedActions),
    approvalRequiredActions: Object.freeze(approvalRequiredActions),
    actionPolicies: Object.freeze(actionPolicies),
    policyVersion: CONNECTOR_POLICY_VERSION,
  });
}

function listConfiguredCapabilities(
  connectorId,
  config,
  permissionSet,
  trustedCapabilities = [],
) {
  const prefix = createConnectorActionPrefix(connectorId);
  const byId = new Map();
  const hasTrustedCapabilities = trustedCapabilities.length > 0;
  for (const capability of trustedCapabilities) {
    byId.set(capability.capabilityId, {
      ...capability,
      actionId: `${prefix}${capability.capabilityId}`,
    });
  }
  const configuredCapabilities = Array.isArray(config.capabilities)
    ? config.capabilities
    : Array.isArray(config.actions)
      ? config.actions
      : [];
  for (const rawCapability of configuredCapabilities) {
    if (!isRecord(rawCapability)) continue;
    const capabilityId = String(
      rawCapability.id || rawCapability.capabilityId || "",
    ).trim();
    if (!capabilityId) continue;
    if (hasTrustedCapabilities) {
      // A runtime adapter is authoritative for both the capability ID and
      // whether that capability is interactive. Client settings may narrow
      // access, but they cannot introduce or reclassify runtime tools.
      continue;
    }
    const access = String(rawCapability.access || "").trim().toLowerCase();
    const ringId = access === "interactive"
      ? "ring_3"
      : access === "read-only" || access === "read_only"
        ? "ring_1"
        : "";
    if (!ringId) continue;
    byId.set(capabilityId, {
      capabilityId,
      actionId: `${prefix}${capabilityId}`,
      ringId,
      interactive: ringId === "ring_3",
    });
  }

  const actions = isRecord(permissionSet.actions)
    ? permissionSet.actions
    : {};
  for (const [actionId, policy] of Object.entries(actions)) {
    if (!actionId.startsWith(prefix)) continue;
    const capabilityId = actionId.slice(prefix.length);
    if (hasTrustedCapabilities && !byId.has(capabilityId)) continue;
    if (hasTrustedCapabilities) {
      continue;
    }
    const ringId = normalizeRingId(
      isRecord(policy) ? policy.ringId : "",
      byId.get(capabilityId)?.ringId || "",
    );
    if (!capabilityId || !ringId) continue;
    byId.set(capabilityId, {
      capabilityId,
      actionId,
      ringId,
      interactive: ringId === "ring_3",
    });
  }
  return [...byId.values()];
}

function normalizeTrustedCapabilities(value) {
  if (!Array.isArray(value)) return [];
  const capabilities = [];
  const seen = new Set();
  for (const rawCapability of value) {
    if (!isRecord(rawCapability)) continue;
    const capabilityId = String(
      rawCapability.id || rawCapability.capabilityId || "",
    ).trim();
    if (
      !capabilityId
      || seen.has(capabilityId)
      || !/^[a-z0-9][a-z0-9_-]{0,119}$/.test(capabilityId)
    ) {
      continue;
    }
    const access = String(rawCapability.access || "").trim().toLowerCase();
    const ringId = access === "interactive"
      ? "ring_3"
      : access === "read-only" || access === "read_only"
        ? "ring_1"
        : "";
    if (!ringId) continue;
    seen.add(capabilityId);
    capabilities.push({
      capabilityId,
      ringId,
      interactive: ringId === "ring_3",
    });
  }
  return capabilities;
}

function createDefaultConnectorPermissionSet() {
  return {
    defaultAccess: "full_access",
    rings: {
      ring_1: { defaultAccess: "full_access" },
      ring_2: { defaultAccess: "full_access" },
      ring_3: { defaultAccess: "full_access" },
    },
    actions: {},
  };
}

function readOrganizationRolePermissionSet(config, roleId, connectorId) {
  if (roleId === "owner" || roleId === "admin") {
    return {
      defaultAccess: "full_access",
      rings: {
        ring_1: { defaultAccess: "full_access" },
        ring_2: { defaultAccess: "full_access" },
        ring_3: { defaultAccess: "full_access" },
      },
    };
  }
  const metadata = isRecord(config.metadata) ? config.metadata : config;
  const accessControl = isRecord(metadata.accessControl)
    ? metadata.accessControl
    : {};
  const roleSets = isRecord(accessControl.systemPrincipalRolePermissionSets)
    ? accessControl.systemPrincipalRolePermissionSets
    : {};
  const organizationRoleSets = isRecord(roleSets.all_organization_members)
    ? roleSets.all_organization_members
    : isRecord(roleSets["all-organization-members"])
      ? roleSets["all-organization-members"]
      : {};
  const configured = organizationRoleSets[roleId];
  if (isRecord(configured)) return configured;
  return createConservativeRolePermissionSet(roleId, connectorId);
}

function createConservativeRolePermissionSet(roleId) {
  const normalizedRole = String(roleId || "").trim().toLowerCase();
  const canOperate = normalizedRole === "developer"
    || normalizedRole === "contributor";
  const canRead = canOperate
    || normalizedRole === "member"
    || normalizedRole === "viewer"
    || normalizedRole === "billing";
  return {
    defaultAccess: "no_access",
    rings: {
      ring_1: { defaultAccess: canRead ? "read_only" : "no_access" },
      ring_2: {
        defaultAccess: canOperate ? "ask_for_permission" : "no_access",
      },
      ring_3: {
        defaultAccess: canOperate ? "ask_for_permission" : "no_access",
      },
    },
  };
}

async function readVerifiedPrincipal(identityService, req) {
  try {
    const principal = await identityService.readPrincipal(req);
    const userId = String(principal?.uid || principal?.userId || "").trim();
    if (!userId) throw new Error("Principal is missing a user identifier.");
    return { ...principal, uid: userId, userId };
  } catch (error) {
    throw new ConnectorPolicyError(
      401,
      "connector_session_required",
      "Sign in with a verified user session to use connectors.",
      { cause: error instanceof Error ? error.message : String(error) },
    );
  }
}

async function fetchRequiredJson(
  fetchSessionApi,
  req,
  controlPath,
  hostedPath,
  resourceName,
) {
  return readRequiredJsonResponse(
    fetchSessionApi(req, controlPath, hostedPath, {
      method: "GET",
      headers: { accept: "application/json" },
    }),
    resourceName,
  );
}

async function fetchConnectorConfigJson(
  fetchSessionApi,
  req,
  connectorId,
  { allowMissing = false } = {},
) {
  let missingPayload = {};
  for (const alias of listConnectorIdentityAliases(connectorId)) {
    const response = await fetchSessionApi(
      req,
      `/user/tags/${encodeURIComponent(alias)}`,
      `/api/user/tags/${encodeURIComponent(alias)}`,
      {
        method: "GET",
        headers: { accept: "application/json" },
      },
    );
    const payload = await readResponseJson(response);
    if (response?.ok) return payload;
    const status = Number(response?.status) || 502;
    if (status === 404) {
      missingPayload = payload;
      continue;
    }
    throw createResourceLookupError(status, "connector", payload);
  }
  if (allowMissing) return {};
  throw createResourceLookupError(404, "connector", missingPayload);
}

async function fetchRequiredResourceJson(
  fetchResourceApi,
  fetchSessionApi,
  req,
  controlPath,
  hostedPath,
  resourceName,
  context = {},
) {
  const request = {
    method: "GET",
    headers: { accept: "application/json" },
  };
  const responsePromise = typeof fetchResourceApi === "function"
    ? fetchResourceApi(req, controlPath, request, context)
    : fetchSessionApi(
        req,
        controlPath,
        hostedPath,
        request,
      );
  return readRequiredJsonResponse(responsePromise, resourceName);
}

async function readRequiredJsonResponse(responsePromise, resourceName) {
  const response = await responsePromise;
  const payload = await readResponseJson(response);
  if (!response?.ok) {
    const status = Number(response?.status) || 502;
    throw createResourceLookupError(status, resourceName, payload);
  }
  return payload;
}

function createResourceLookupError(status, resourceName, payload) {
  const upstreamMessage = isRecord(payload)
    ? String(payload.message || payload.error || "").trim().slice(0, 300)
    : "";
  return new ConnectorPolicyError(
    status === 401 ? 401 : status === 403 ? 403 : status === 404 ? 404 : 502,
    `connector_${resourceName}_lookup_failed`,
    `Unable to load ${resourceName} data required for connector authorization.`,
    {
      upstreamStatus: status,
      ...(upstreamMessage ? { upstreamMessage } : {}),
    },
  );
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

function resolveRequestOrganization(req, principal, organizations) {
  const requestedId = normalizeOrganizationId(
    readHeader(req, ORGANIZATION_HEADER)
      || principal.organizationId
      || principal.tenant,
  );
  let organization = requestedId
    ? organizations.find((candidate) => candidate.id === requestedId)
    : null;
  if (!organization && !requestedId && organizations.length === 1) {
    [organization] = organizations;
  }
  if (!organization && !requestedId) {
    organization = organizations.find((candidate) => candidate.personal)
      || null;
  }
  if (!organization) {
    throw new ConnectorPolicyError(
      403,
      "connector_organization_required",
      "Select an organization before using connectors.",
    );
  }
  return organization;
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
      candidate.id || candidate.organizationId || candidate.organization_id,
    );
    if (!id) return [];
    return [{
      ...candidate,
      id,
      personal:
        candidate.personal === true
        || candidate.isPersonal === true
        || candidate.type === "personal",
    }];
  });
}

function resolveOrganizationRole(organization, principal) {
  const principalId = String(principal.uid || principal.userId || "").trim();
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
  const membership = memberships.find((candidate) => {
    if (!isRecord(candidate)) return false;
    return String(
      candidate.userId
        || candidate.uid
        || candidate.user?.id
        || candidate.id
        || "",
    ).trim() === principalId;
  });
  return normalizeRoleId(membership?.role);
}

function readThreadAgentId(thread) {
  return String(
    thread.agentId
      || thread.agent_id
      || thread.agent?.id
      || (typeof thread.agent === "string" ? thread.agent : "")
      || thread.metadata?.agentId
      || thread.metadata?.agent_id
      || thread.assigneeAgentId
      || "",
  ).trim();
}

function readThreadProjectId(thread) {
  const metadata = isRecord(thread.metadata) ? thread.metadata : {};
  const context = isRecord(thread.context) ? thread.context : {};
  const project = isRecord(thread.project) ? thread.project : {};
  return normalizeProjectId(
    thread.projectId
      || thread.project_id
      || project.id
      || metadata.projectId
      || metadata.project_id
      || context.projectId
      || context.project_id,
  );
}

function readProjectConnectorCredentialBinding(project, connectorId) {
  if (!isRecord(project)) return { credentialId: "" };
  const metadata = isRecord(project.metadata) ? project.metadata : {};
  const candidates = [
    metadata.connectorCredentialBindings,
    metadata.connector_credential_bindings,
    project.connectorCredentialBindings,
    project.connector_credential_bindings,
  ].filter(isRecord);
  const aliases = [...new Set([
    ...listConnectorIdentityAliases(connectorId),
    ...listConnectorIdentityAliases(connectorId).map((alias) => (
      alias.replaceAll("-", "_")
    )),
    getConnectorCredentialProviderId(connectorId),
  ])];
  for (const bindings of candidates) {
    for (const alias of aliases) {
      const rawBinding = bindings[alias];
      const credentialId = normalizeCredentialId(
        isRecord(rawBinding)
          ? rawBinding.credentialId || rawBinding.credential_id || rawBinding.id
          : rawBinding,
      );
      if (credentialId) {
        return {
          credentialId,
          credentialName: isRecord(rawBinding)
            ? String(rawBinding.credentialName || rawBinding.name || "").trim()
            : "",
        };
      }
    }
  }
  return { credentialId: "" };
}

function assertProjectOrganization(project, organizationId) {
  if (!isRecord(project)) return;
  const metadata = isRecord(project.metadata) ? project.metadata : {};
  const projectOrganizationId = normalizeOrganizationId(
    project.organizationId
      || project.organization_id
      || project.orgId
      || project.org_id
      || metadata.organizationId
      || metadata.organization_id
      || metadata.orgId
      || metadata.org_id,
  );
  if (projectOrganizationId && projectOrganizationId !== organizationId) {
    throw new ConnectorPolicyError(
      403,
      "connector_project_organization_mismatch",
      "The thread project does not belong to the selected organization.",
    );
  }
}

function readPermissionSet(value) {
  if (!isRecord(value)) return null;
  const candidates = [
    value.permissionSet,
    value.permission_set,
    value.permissions,
    value.metadata?.permissionSet,
    value.metadata?.permission_set,
    value.configuration?.permissionSet,
  ];
  return candidates.find(isRecord) || null;
}

function unwrapRecord(value, keys) {
  let current = isRecord(value) ? value : {};
  const visited = new Set();
  while (isRecord(current) && !visited.has(current)) {
    visited.add(current);
    const nextKey = keys.find((key) => isRecord(current[key]));
    if (!nextKey) break;
    current = current[nextKey];
  }
  return current;
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

function getCredentialEncryptionKeyNames(connectorId) {
  const providerId = getConnectorCredentialProviderId(connectorId);
  const prefix = providerId
    .replaceAll("-", "_")
    .toUpperCase();
  return [
    `${prefix}_TOKEN_ENCRYPTION_KEY`,
    `${prefix}_OAUTH_TOKEN_ENCRYPTION_KEY`,
    ...(providerId === "github" ? ["GITHUB_TOKEN_ENCRYPTION_KEY"] : []),
    "CONNECTOR_TOKEN_ENCRYPTION_KEY",
  ];
}

function normalizeCredentialId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,120}$/.test(normalized) ? normalized : "";
}

function normalizeOrganizationId(value) {
  return String(value || "").trim().slice(0, 160);
}

function normalizeProjectId(value) {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,180}$/.test(normalized) ? normalized : "";
}

function normalizeRoleId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return [
    "owner",
    "admin",
    "developer",
    "contributor",
    "member",
    "billing",
    "viewer",
  ].includes(normalized)
    ? normalized
    : "";
}

function normalizeRingId(value, fallback = "") {
  const normalized = String(value || "").trim();
  if (VALID_RING_IDS.has(normalized)) return normalized;
  return VALID_RING_IDS.has(fallback) ? fallback : "";
}

function normalizeAccess(value, fallback = "no_access") {
  const normalized = String(value || "").trim().toLowerCase();
  if (
    normalized === "full_access"
    || normalized === "read_only"
    || normalized === "ask_for_permission"
    || normalized === "no_access"
  ) {
    return normalized;
  }
  return fallback;
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

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
