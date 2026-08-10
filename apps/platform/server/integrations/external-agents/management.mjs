import {
  ExternalAgentError,
  createExternalAgentId,
  normalizeDisplayText,
  normalizeExternalAgentProvider,
  normalizeExternalAgentTrigger,
  normalizeIdentifier,
  sanitizeExternalAgentRecord,
} from "./domain.mjs";
import { selectExternalAgentBinding } from "./policy.mjs";
import { createWebhookSecret, sealWebhookSecret } from "./verification.mjs";

const BASE_PATH = "/api/integrations/external-agents";
const COLLECTION_NAMES = new Set(["installations", "bindings", "identities", "events", "deliveries"]);
const PERMISSION_MODES = new Set(["linked_member", "external_requester"]);
const ORGANIZATION_ROLES = new Set(["owner", "admin", "developer", "contributor", "member", "viewer"]);

export function createExternalAgentManagementController({
  repository,
  gateway,
  membershipService,
  adapterRegistry,
  encryptionKey,
  platformOrigin,
  nativeTransports = {},
} = {}) {
  if (typeof repository?.snapshot !== "function" || typeof repository?.transact !== "function") {
    throw new TypeError("External-agent management requires a repository.");
  }
  if (typeof membershipService?.authorizeRequest !== "function") {
    throw new TypeError("External-agent management requires membership authorization.");
  }

  async function handle(req, url) {
    const route = matchManagementRoute(url.pathname);
    if (!route) return null;
    if (req.method === "OPTIONS") {
      return response(204, {}, { Allow: allowedMethods(route).join(", ") });
    }
    if (!allowedMethods(route).includes(req.method)) {
      return response(405, {
        error: "method_not_allowed",
        message: "This operation does not support the requested method.",
      }, { Allow: allowedMethods(route).join(", ") });
    }
    if (route.collection === "health") return handleHealth(req, url);
    if (route.action === "replay") {
      return route.collection === "deliveries"
        ? replayDelivery(req, route.id)
        : replayEvent(req, route.id);
    }
    if (route.id) return handleItem(req, route.collection, route.id);
    return handleCollection(req, url, route.collection);
  }

  async function handleHealth(req, url) {
    const organizationId = requiredOrganizationId(req, url);
    await membershipService.authorizeRequest(req, organizationId);
    const health = await gateway.getHealth(organizationId);
    return response(200, { organizationId, ...health });
  }

  async function handleCollection(req, url, collection) {
    const organizationId = requiredOrganizationId(req, url);
    await membershipService.authorizeRequest(req, organizationId, { write: req.method === "POST" });
    if (req.method === "GET") {
      const snapshot = await repository.snapshot();
      const items = snapshot[collection]
        .filter((item) => resolveRecordOrganizationId(snapshot, item) === organizationId)
        .sort(sortNewest)
        .slice(0, readLimit(url));
      return response(200, {
        organizationId,
        [collection]: items.map((item) => presentRecord(collection, item)),
      });
    }
    const body = await readJsonBody(req);
    if (collection === "installations") return createInstallation({ body, organizationId });
    if (collection === "bindings") return createBinding({ body, organizationId });
    if (collection === "identities") return createIdentity({ body, organizationId });
    throw new ExternalAgentError(405, "method_not_allowed", "Events cannot be created through management APIs.");
  }

  async function handleItem(req, collection, id) {
    const snapshot = await repository.snapshot();
    const existing = snapshot[collection].find((item) => item.id === id);
    if (!existing) throw new ExternalAgentError(404, "external_agent_record_not_found", "The record was not found.");
    const organizationId = resolveRecordOrganizationId(snapshot, existing);
    if (!organizationId) {
      throw new ExternalAgentError(
        409,
        "external_agent_record_organization_missing",
        "The record is not associated with an organization.",
      );
    }
    await membershipService.authorizeRequest(req, organizationId, { write: req.method !== "GET" });
    if (req.method === "GET") return response(200, presentRecord(collection, existing));
    if (req.method === "DELETE") {
      await deleteRecord(collection, existing);
      return response(204, {});
    }
    const body = await readJsonBody(req);
    if (collection === "installations") return updateInstallation(existing, body);
    if (collection === "bindings") return updateBinding(existing, body);
    if (collection === "identities") return updateIdentity(existing, body);
    throw new ExternalAgentError(405, "method_not_allowed", "Events are immutable audit records.");
  }

  async function createInstallation({ body, organizationId }) {
    const provider = requiredProvider(body.provider);
    const tenantId = requiredId(body.tenantId, "tenantId");
    const credentialId = requiredId(body.credentialId, "credentialId");
    const suppliedSecret = normalizeDisplayText(body.webhookSecret, 1_000);
    const verificationSecret = suppliedSecret || createWebhookSecret();
    const secretRef = normalizeSecretRef(body.secretRef);
    const now = new Date().toISOString();
    const installation = {
      id: createExternalAgentId("external_installation"),
      organizationId,
      provider,
      tenantId,
      displayName: normalizeDisplayText(body.displayName, 160) || `${providerLabel(provider)} connection`,
      credentialId,
      siteUrl: normalizeUrl(body.siteUrl),
      appActorId: normalizeIdentifier(body.appActorId),
      mentionAliases: normalizeMentionAliases(body.mentionAliases).length
        ? normalizeMentionAliases(body.mentionAliases)
        : ["computer agents"],
      enabled: body.enabled !== false,
      nativeTransportEnabled: Boolean(body.nativeTransportEnabled && nativeTransports[provider]),
      ...(secretRef
        ? { secretRef }
        : { webhookSecret: sealWebhookSecret(verificationSecret, encryptionKey) }),
      createdAt: now,
      updatedAt: now,
    };
    await repository.transact((store) => {
      if (store.installations.some((item) => (
        item.organizationId === organizationId && item.provider === provider && item.tenantId === tenantId
      ))) {
        throw new ExternalAgentError(
          409,
          "external_installation_exists",
          "This provider tenant is already installed in the organization.",
        );
      }
      store.installations.push(installation);
    });
    return response(201, {
      installation: presentInstallation(installation),
      setup: buildInstallationSetup(installation, secretRef ? "" : verificationSecret),
    });
  }

  async function updateInstallation(existing, body) {
    let rotatedSecret = "";
    const updated = await repository.transact((store) => {
      const installation = store.installations.find((item) => item.id === existing.id);
      if (!installation) return null;
      if (Object.hasOwn(body, "displayName")) {
        installation.displayName = normalizeDisplayText(body.displayName, 160) || installation.displayName;
      }
      if (Object.hasOwn(body, "credentialId")) installation.credentialId = requiredId(body.credentialId, "credentialId");
      if (Object.hasOwn(body, "siteUrl")) installation.siteUrl = normalizeUrl(body.siteUrl);
      if (Object.hasOwn(body, "appActorId")) installation.appActorId = normalizeIdentifier(body.appActorId);
      if (Object.hasOwn(body, "mentionAliases")) {
        installation.mentionAliases = normalizeMentionAliases(body.mentionAliases);
      }
      if (Object.hasOwn(body, "enabled")) installation.enabled = body.enabled === true;
      if (Object.hasOwn(body, "nativeTransportEnabled")) {
        installation.nativeTransportEnabled = Boolean(body.nativeTransportEnabled && nativeTransports[installation.provider]);
      }
      if (body.rotateWebhookSecret === true) {
        rotatedSecret = createWebhookSecret();
        installation.webhookSecret = sealWebhookSecret(rotatedSecret, encryptionKey);
        delete installation.secretRef;
      }
      installation.updatedAt = new Date().toISOString();
      if (installation.enabled === false) {
        cancelInstallationWork(store, installation.id, {
          code: "external_installation_disabled",
          message: "The external-agent installation was disabled.",
          now: installation.updatedAt,
        });
      }
      return installation;
    });
    return response(200, {
      installation: presentInstallation(updated),
      ...(rotatedSecret ? { setup: buildInstallationSetup(updated, rotatedSecret) } : {}),
    });
  }

  async function createBinding({ body, organizationId }) {
    const installationId = requiredId(body.installationId, "installationId");
    const snapshot = await repository.snapshot();
    const installation = snapshot.installations.find((item) => (
      item.id === installationId && item.organizationId === organizationId
    ));
    if (!installation) {
      throw new ExternalAgentError(404, "external_installation_not_found", "The installation was not found.");
    }
    const externalProjectId = normalizeIdentifier(body.externalProjectId);
    const now = new Date().toISOString();
    const binding = normalizeBinding({
      ...body,
      id: createExternalAgentId("external_binding"),
      organizationId,
      installationId,
      provider: installation.provider,
      createdAt: now,
      updatedAt: now,
    });
    validateBindingConnectorActions(binding, adapterRegistry);
    await repository.transact((store) => {
      if (store.bindings.some((item) => (
        item.installationId === installationId
        && String(item.externalProjectId || "") === externalProjectId
        && item.enabled !== false
      ))) {
        throw new ExternalAgentError(
          409,
          "external_binding_exists",
          "An enabled binding already handles this provider project.",
        );
      }
      store.bindings.push(binding);
    });
    return response(201, { binding: presentRecord("bindings", binding) });
  }

  async function updateBinding(existing, body) {
    const updated = await repository.transact((store) => {
      const index = store.bindings.findIndex((item) => item.id === existing.id);
      if (index < 0) return null;
      const immutable = store.bindings[index];
      const next = normalizeBinding({
        ...immutable,
        ...body,
        id: immutable.id,
        organizationId: immutable.organizationId,
        installationId: immutable.installationId,
        provider: immutable.provider,
        createdAt: immutable.createdAt,
        updatedAt: new Date().toISOString(),
      });
      validateBindingConnectorActions(next, adapterRegistry);
      if (next.enabled && store.bindings.some((item) => (
        item.id !== immutable.id
        && item.installationId === next.installationId
        && String(item.externalProjectId || "") === String(next.externalProjectId || "")
        && item.enabled !== false
      ))) {
        throw new ExternalAgentError(
          409,
          "external_binding_exists",
          "An enabled binding already handles this provider project.",
        );
      }
      if (next.enabled === false) {
        cancelBindingWork(store, immutable, {
          code: "external_binding_disabled",
          message: "The external-agent binding was disabled.",
          now: next.updatedAt,
        });
      }
      store.bindings[index] = next;
      return next;
    });
    return response(200, { binding: presentRecord("bindings", updated) });
  }

  async function createIdentity({ body, organizationId }) {
    const installationId = requiredId(body.installationId, "installationId");
    const providerUserId = requiredId(body.providerUserId, "providerUserId");
    const platformUserId = requiredId(body.platformUserId, "platformUserId");
    const snapshot = await repository.snapshot();
    const installation = snapshot.installations.find((item) => (
      item.id === installationId && item.organizationId === organizationId
    ));
    if (!installation) {
      throw new ExternalAgentError(404, "external_installation_not_found", "The installation was not found.");
    }
    const members = await membershipService.resolveOrganizationMembers(organizationId);
    if (!members.some((member) => member.userId === platformUserId)) {
      throw new ExternalAgentError(
        400,
        "external_identity_member_invalid",
        "The linked platform user must be an active organization member.",
      );
    }
    const now = new Date().toISOString();
    const identity = {
      id: createExternalAgentId("external_identity"),
      organizationId,
      installationId,
      provider: installation.provider,
      providerUserId,
      platformUserId,
      displayName: normalizeDisplayText(body.displayName, 200),
      email: normalizeEmail(body.email),
      verifiedAt: now,
      createdAt: now,
      updatedAt: now,
    };
    await repository.transact((store) => {
      const index = store.identities.findIndex((item) => (
        item.installationId === installationId && item.providerUserId === providerUserId
      ));
      if (index >= 0) {
        identity.id = store.identities[index].id;
        identity.createdAt = store.identities[index].createdAt;
        store.identities[index] = identity;
      } else {
        store.identities.push(identity);
      }
    });
    return response(201, { identity: presentRecord("identities", identity) });
  }

  async function updateIdentity(existing, body) {
    const platformUserId = Object.hasOwn(body, "platformUserId")
      ? requiredId(body.platformUserId, "platformUserId")
      : existing.platformUserId;
    if (platformUserId !== existing.platformUserId) {
      const members = await membershipService.resolveOrganizationMembers(existing.organizationId);
      if (!members.some((member) => member.userId === platformUserId)) {
        throw new ExternalAgentError(
          400,
          "external_identity_member_invalid",
          "The linked platform user must be an active organization member.",
        );
      }
    }
    const updated = await repository.transact((store) => {
      const identity = store.identities.find((item) => item.id === existing.id);
      if (!identity) return null;
      identity.platformUserId = platformUserId;
      if (Object.hasOwn(body, "displayName")) identity.displayName = normalizeDisplayText(body.displayName, 200);
      if (Object.hasOwn(body, "email")) identity.email = normalizeEmail(body.email);
      identity.verifiedAt = new Date().toISOString();
      identity.updatedAt = identity.verifiedAt;
      return identity;
    });
    return response(200, { identity: presentRecord("identities", updated) });
  }

  async function replayEvent(req, eventId) {
    const snapshot = await repository.snapshot();
    const existing = snapshot.events.find((item) => item.id === eventId);
    if (!existing) throw new ExternalAgentError(404, "external_event_not_found", "The event was not found.");
    const organizationId = resolveRecordOrganizationId(snapshot, existing);
    if (!organizationId) {
      throw new ExternalAgentError(
        409,
        "external_agent_record_organization_missing",
        "The event is not associated with an organization.",
      );
    }
    await membershipService.authorizeRequest(req, organizationId, { write: true });
    if (["pending", "processing"].includes(existing.status)) {
      throw new ExternalAgentError(409, "external_event_active", "The event is already queued or processing.");
    }
    if (existing.status === "completed") {
      throw new ExternalAgentError(409, "external_event_completed", "Completed events cannot be replayed.");
    }
    const updated = await repository.transact((store) => {
      const event = store.events.find((item) => item.id === eventId);
      event.status = "pending";
      event.attempts = 0;
      event.nextAttemptAt = new Date().toISOString();
      event.updatedAt = event.nextAttemptAt;
      delete event.errorCode;
      delete event.errorMessage;
      const task = store.tasks.find((item) => item.eventId === eventId);
      if (task) {
        task.status = "pending";
        task.attempts = 0;
        task.updatedAt = event.updatedAt;
        delete task.errorCode;
        delete task.errorMessage;
      }
      return event;
    });
    gateway.wake();
    return response(202, { event: presentRecord("events", updated) });
  }

  async function replayDelivery(req, deliveryId) {
    const snapshot = await repository.snapshot();
    const existing = snapshot.deliveries.find((item) => item.id === deliveryId);
    if (!existing) {
      throw new ExternalAgentError(404, "external_delivery_not_found", "The delivery was not found.");
    }
    const organizationId = resolveRecordOrganizationId(snapshot, existing);
    if (!organizationId) {
      throw new ExternalAgentError(
        409,
        "external_agent_record_organization_missing",
        "The delivery is not associated with an organization.",
      );
    }
    await membershipService.authorizeRequest(req, organizationId, { write: true });
    if (["pending", "processing"].includes(existing.status)) {
      throw new ExternalAgentError(409, "external_delivery_active", "The delivery is already queued or processing.");
    }
    if (existing.status === "completed") {
      throw new ExternalAgentError(409, "external_delivery_completed", "Completed deliveries cannot be replayed.");
    }
    const installation = snapshot.installations.find((item) => (
      item.id === existing.installationId && item.enabled !== false
    ));
    const binding = snapshot.bindings.find((item) => (
      item.id === existing.bindingId
      && item.installationId === existing.installationId
      && item.enabled !== false
    ));
    if (!installation || !binding) {
      throw new ExternalAgentError(
        409,
        "external_delivery_configuration_unavailable",
        "Enable the delivery installation and binding before replaying this delivery.",
      );
    }
    const updated = await repository.transact((store) => {
      const delivery = store.deliveries.find((item) => item.id === deliveryId);
      if (!delivery) return null;
      delivery.status = "pending";
      delivery.attempts = 0;
      delivery.nextAttemptAt = new Date().toISOString();
      delivery.updatedAt = delivery.nextAttemptAt;
      delete delivery.errorCode;
      delete delivery.errorMessage;
      delete delivery.cancelledAt;
      delete delivery.completedAt;
      delete delivery.result;
      return delivery;
    });
    gateway.wake();
    return response(202, { delivery: presentRecord("deliveries", updated) });
  }

  async function deleteRecord(collection, existing) {
    await repository.transact((store) => {
      if (collection === "installations") {
        cancelInstallationWork(store, existing.id, {
          code: "external_installation_deleted",
          message: "The external-agent installation was deleted.",
        });
        store.installations = store.installations.filter((item) => item.id !== existing.id);
        store.bindings = store.bindings.filter((item) => item.installationId !== existing.id);
        store.identities = store.identities.filter((item) => item.installationId !== existing.id);
        store.conversations = store.conversations.filter((item) => item.installationId !== existing.id);
        return;
      }
      if (collection === "bindings") {
        cancelBindingWork(store, existing, {
          code: "external_binding_deleted",
          message: "The external-agent binding was deleted.",
        });
        store.bindings = store.bindings.filter((item) => item.id !== existing.id);
        store.conversations = store.conversations.filter((item) => item.bindingId !== existing.id);
        return;
      }
      store.identities = store.identities.filter((item) => item.id !== existing.id);
    });
  }

  function buildInstallationSetup(installation, verificationSecret = "") {
    const origin = String(platformOrigin || "").replace(/\/+$/, "");
    const callbackUrl = `${origin}${BASE_PATH}/webhooks/${installation.provider}/${installation.id}`;
    const setup = {
      callbackUrl,
      ...(installation.nativeTransportEnabled
        ? { nativeCallbackUrl: `${origin}${BASE_PATH}/native/${installation.provider}/${installation.id}` }
        : {}),
      provider: installation.provider,
      tenantId: installation.tenantId,
      verification: installation.provider === "linear" ? "hmac_sha256" : "bearer_token",
      ...(verificationSecret ? { verificationSecret } : {}),
    };
    if (installation.provider === "jira" && verificationSecret) {
      setup.callbackUrlWithToken = `${callbackUrl}?token=${encodeURIComponent(verificationSecret)}`;
    }
    return setup;
  }

  function presentInstallation(installation) {
    return {
      ...presentRecord("installations", installation),
      callbackUrl: `${String(platformOrigin || "").replace(/\/+$/, "")}${BASE_PATH}/webhooks/${installation.provider}/${installation.id}`,
    };
  }

  return Object.freeze({ handle });
}

function cancelInstallationWork(store, installationId, options) {
  cancelActiveWork(store, {
    ...options,
    matchesEvent: (event) => event.envelope?.installationId === installationId,
    matchesDelivery: (delivery) => delivery.installationId === installationId,
  });
}

function cancelBindingWork(store, binding, options) {
  const installation = store.installations.find((item) => item.id === binding.installationId);
  const matchingEventIds = new Set(store.events
    .filter((event) => {
      if (!installation || event.envelope?.installationId !== installation.id) return false;
      return selectExternalAgentBinding({
        bindings: store.bindings,
        installation,
        envelope: event.envelope,
      })?.id === binding.id;
    })
    .map((event) => event.id));
  cancelActiveWork(store, {
    ...options,
    matchesEvent: (event) => matchingEventIds.has(event.id),
    matchesDelivery: (delivery) => delivery.bindingId === binding.id,
  });
}

function cancelActiveWork(store, {
  code,
  message,
  matchesEvent,
  matchesDelivery,
  now = new Date().toISOString(),
}) {
  const cancelledEventIds = new Set();
  for (const event of store.events) {
    if (!["pending", "processing"].includes(event.status) || !matchesEvent(event)) continue;
    event.status = "denied";
    event.errorCode = code;
    event.errorMessage = message;
    event.updatedAt = now;
    event.cancelledAt = now;
    delete event.nextAttemptAt;
    cancelledEventIds.add(event.id);
  }
  for (const task of store.tasks) {
    if (!cancelledEventIds.has(task.eventId)) continue;
    task.status = "denied";
    task.errorCode = code;
    task.errorMessage = message;
    task.updatedAt = now;
    task.cancelledAt = now;
  }
  for (const delivery of store.deliveries) {
    if (!["pending", "processing"].includes(delivery.status) || !matchesDelivery(delivery)) continue;
    delivery.status = "failed";
    delivery.errorCode = code;
    delivery.errorMessage = message;
    delivery.updatedAt = now;
    delivery.cancelledAt = now;
    delete delivery.nextAttemptAt;
  }
}

function matchManagementRoute(pathname) {
  const rest = String(pathname || "").startsWith(`${BASE_PATH}/`)
    ? String(pathname).slice(BASE_PATH.length + 1).replace(/\/+$/, "")
    : "";
  if (rest === "health") return { collection: "health", id: "", action: "" };
  const replay = /^(events|deliveries)\/([^/]+)\/replay$/.exec(rest);
  if (replay) return { collection: replay[1], id: decodeURIComponent(replay[2]), action: "replay" };
  const item = /^(installations|bindings|identities|events|deliveries)\/([^/]+)$/.exec(rest);
  if (item) return { collection: item[1], id: decodeURIComponent(item[2]), action: "" };
  return COLLECTION_NAMES.has(rest) ? { collection: rest, id: "", action: "" } : null;
}

function allowedMethods(route) {
  if (route.collection === "health") return ["GET", "OPTIONS"];
  if (route.action === "replay") return ["POST", "OPTIONS"];
  if (route.id) return ["events", "deliveries"].includes(route.collection)
    ? ["GET", "OPTIONS"]
    : ["GET", "PATCH", "DELETE", "OPTIONS"];
  return ["events", "deliveries"].includes(route.collection)
    ? ["GET", "OPTIONS"]
    : ["GET", "POST", "OPTIONS"];
}

function normalizeBinding(value) {
  const permissionMode = PERMISSION_MODES.has(value.permissionMode) ? value.permissionMode : "linked_member";
  const allowedExternalUserIds = normalizeStringList(value.allowedExternalUserIds, 1_000, 300);
  if (permissionMode === "external_requester" && !allowedExternalUserIds.length) {
    throw new ExternalAgentError(
      400,
      "external_requester_allowlist_required",
      "External requester bindings require at least one allowed provider user.",
    );
  }
  const triggerModes = [...new Set(
    (Array.isArray(value.triggerModes) ? value.triggerModes : ["mention", "assignment", "command"])
      .map((item) => normalizeExternalAgentTrigger(item, ""))
      .filter(Boolean),
  )];
  if (!triggerModes.length) {
    throw new ExternalAgentError(400, "external_trigger_required", "Enable at least one invocation trigger.");
  }
  return {
    id: requiredId(value.id, "id"),
    organizationId: requiredId(value.organizationId, "organizationId"),
    installationId: requiredId(value.installationId, "installationId"),
    provider: requiredProvider(value.provider),
    externalProjectId: normalizeIdentifier(value.externalProjectId),
    displayName: normalizeDisplayText(value.displayName, 160) || normalizeDisplayText(value.agentName, 160),
    agentId: requiredId(value.agentId, "agentId"),
    agentName: normalizeDisplayText(value.agentName, 160),
    environmentId: normalizeIdentifier(value.environmentId),
    projectId: normalizeIdentifier(value.projectId),
    triggerModes,
    permissionMode,
    allowedExternalUserIds,
    allowedOrganizationRoles: normalizeStringList(value.allowedOrganizationRoles, 20, 100)
      .map((role) => role.toLowerCase())
      .filter((role) => ORGANIZATION_ROLES.has(role)),
    allowedConnectorActions: normalizeConnectorActions(value.allowedConnectorActions),
    enabled: value.enabled !== false,
    createdAt: value.createdAt || new Date().toISOString(),
    updatedAt: value.updatedAt || new Date().toISOString(),
  };
}

function normalizeConnectorActions(value) {
  return [...new Set(normalizeStringList(value, 200, 100).filter((action) => (
    !/delete|remove|destroy/i.test(action)
  )))];
}

function validateBindingConnectorActions(binding, adapterRegistry) {
  if (!binding.allowedConnectorActions.length) return;
  const capabilities = adapterRegistry?.listCapabilities?.(binding.provider) || [];
  if (!capabilities.length) return;
  const available = new Set(capabilities.map((capability) => String(capability?.id || "").trim()));
  const unknown = binding.allowedConnectorActions.filter((action) => !available.has(action));
  if (!unknown.length) return;
  throw new ExternalAgentError(
    400,
    "external_connector_action_invalid",
    `Unsupported ${binding.provider} connector actions: ${unknown.join(", ")}.`,
  );
}

function presentRecord(collection, value) {
  if (!value) return null;
  const sanitized = sanitizeExternalAgentRecord(value);
  if (collection === "installations") return sanitized;
  return sanitized;
}

function resolveRecordOrganizationId(snapshot, value) {
  const direct = normalizeIdentifier(value?.organizationId);
  if (direct) return direct;
  const installationId = normalizeIdentifier(value?.installationId || value?.envelope?.installationId);
  if (!installationId) return "";
  return normalizeIdentifier(
    snapshot?.installations?.find((installation) => installation.id === installationId)?.organizationId,
  );
}

function requiredOrganizationId(req, url) {
  const header = readHeader(req, "x-computer-agents-organization");
  const query = String(url.searchParams.get("organizationId") || "").trim();
  return requiredId(header || query, "organizationId");
}

async function readJsonBody(req, maximumBytes = 256 * 1024) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > maximumBytes) {
      throw new ExternalAgentError(413, "request_too_large", "The request body is too large.");
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new ExternalAgentError(400, "invalid_json", "The request body must contain valid JSON.");
  }
}

function readLimit(url) {
  const parsed = Number(url.searchParams.get("limit"));
  return Number.isFinite(parsed) ? Math.max(1, Math.min(500, Math.floor(parsed))) : 100;
}

function requiredProvider(value) {
  const provider = normalizeExternalAgentProvider(value);
  if (!provider) throw new ExternalAgentError(400, "provider_invalid", "Provider must be jira or linear.");
  return provider;
}

function requiredId(value, label) {
  const id = normalizeIdentifier(value);
  if (!id) throw new ExternalAgentError(400, "identifier_invalid", `${label} is required and must be valid.`);
  return id;
}

function normalizeSecretRef(value) {
  const secretRef = String(value || "").trim();
  if (!secretRef) return "";
  if (!/^[A-Z][A-Z0-9_]{1,159}$/.test(secretRef)) {
    throw new ExternalAgentError(400, "secret_reference_invalid", "Secret references must be environment variable names.");
  }
  return secretRef;
}

function normalizeStringList(value, maximumItems, maximumLength) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map((item) => normalizeDisplayText(item, maximumLength))
    .filter(Boolean))]
    .slice(0, maximumItems);
}

function normalizeMentionAliases(value) {
  return normalizeStringList(value, 20, 100)
    .map((alias) => alias.replace(/^@+/, "").trim())
    .filter(Boolean);
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.slice(0, 320) : "";
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  try {
    const url = new URL(text);
    if (!(["https:", "http:"].includes(url.protocol))) throw new Error("invalid protocol");
    return url.toString().replace(/\/$/, "").slice(0, 2_000);
  } catch {
    throw new ExternalAgentError(400, "url_invalid", "The provider site URL is invalid.");
  }
}

function readHeader(req, name) {
  const value = req?.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? String(value[0] || "").trim() : String(value || "").trim();
}

function response(status, body, headers = {}) {
  return Object.freeze({ status, body, headers });
}

function sortNewest(left, right) {
  return String(right.updatedAt || right.createdAt || "").localeCompare(String(left.updatedAt || left.createdAt || ""));
}

function providerLabel(provider) {
  return provider === "jira" ? "Jira" : "Linear";
}

export const EXTERNAL_AGENT_MANAGEMENT_BASE_PATH = BASE_PATH;
