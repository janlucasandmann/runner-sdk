import { ExternalAgentError, normalizeDisplayText } from "./domain.mjs";
import { buildJiraDelivery } from "./providers/jira.mjs";
import { buildLinearDelivery } from "./providers/linear.mjs";

const JIRA_DELIVERY_PROPERTY_KEY = "computer-agents.delivery";

export function createExternalAgentDeliveryService({
  adapterRegistry,
  platformOrigin = "",
  logger = console,
} = {}) {
  if (typeof adapterRegistry?.get !== "function") {
    throw new TypeError("External-agent delivery requires the connector adapter registry.");
  }

  async function deliver({ delivery, installation, binding }) {
    if (!installation?.credentialId) {
      throw new ExternalAgentError(
        503,
        "external_delivery_credential_missing",
        "The provider installation has no connector credential for reply delivery.",
      );
    }
    const envelope = delivery?.envelope;
    const provider = String(envelope?.provider || delivery?.provider || "").trim().toLowerCase();
    const adapter = adapterRegistry.get(provider);
    if (typeof adapter?.invoke !== "function") {
      throw new ExternalAgentError(
        503,
        "external_delivery_adapter_missing",
        `No delivery adapter is available for ${provider || "this provider"}.`,
      );
    }
    const summary = appendThreadLink({
      summary: delivery.summary,
      threadId: delivery.threadId,
      platformOrigin,
    });
    const deliveryIdentity = createDeliveryIdentity(delivery);
    const deliveryMarker = createDeliveryMarker(deliveryIdentity);
    if (await providerAlreadyContainsMarker({
      adapter,
      provider,
      installation,
      binding,
      delivery,
      identity: deliveryIdentity,
      marker: deliveryMarker,
    })) {
      logger?.info?.("[external-agents] Provider reply already exists", {
        deliveryId: delivery.id,
        eventId: delivery.eventId,
        provider,
      });
      return { duplicateSuppressed: true };
    }
    const request = provider === "jira"
      ? buildJiraDelivery({
          envelope,
          summary,
          properties: [createJiraDeliveryProperty(deliveryIdentity)],
        })
      : provider === "linear"
        ? buildLinearDelivery({ envelope, summary: `${summary}\n\n${deliveryMarker}` })
        : null;
    if (!request) {
      throw new ExternalAgentError(400, "external_delivery_provider_invalid", "The delivery provider is invalid.");
    }
    const result = await adapter.invoke({
      grant: {
        organizationId: installation.organizationId,
        credentialId: installation.credentialId,
        credentialSource: "explicit",
        connectorId: provider,
        provider,
        threadId: delivery.threadId,
        agentId: binding?.agentId || "",
        agentName: binding?.agentName || "",
        actorUserId: delivery.platformUserId || "",
      },
      name: request.action,
      arguments: request.arguments,
    });
    logger?.info?.("[external-agents] Provider reply delivered", {
      deliveryId: delivery.id,
      eventId: delivery.eventId,
      provider,
      threadId: delivery.threadId,
    });
    return result;
  }

  return Object.freeze({ deliver });
}

async function providerAlreadyContainsMarker({
  adapter,
  provider,
  installation,
  binding,
  delivery,
  identity,
  marker,
}) {
  const envelope = delivery?.envelope;
  const action = provider === "jira" ? "list_comments" : "list_issue_comments";
  const arguments_ = provider === "jira"
    ? {
        issueIdOrKey: envelope?.resource?.key || envelope?.resource?.id,
        maxResults: 100,
        expand: "properties",
      }
    : { issueId: envelope?.resource?.id, first: 100 };
  if (!arguments_.issueIdOrKey && !arguments_.issueId) return false;
  try {
    const result = await adapter.invoke({
      grant: createDeliveryGrant({ installation, binding, delivery, provider }),
      name: action,
      arguments: arguments_,
    });
    return provider === "jira"
      ? hasJiraDeliveryProperty(result, identity)
      : JSON.stringify(result).includes(marker);
  } catch {
    // Delivery remains safe when comment lookup is unavailable: the durable
    // outbox and provider APIs still provide the primary retry guarantees.
    return false;
  }
}

function createDeliveryGrant({ installation, binding, delivery, provider }) {
  return {
    organizationId: installation.organizationId,
    credentialId: installation.credentialId,
    credentialSource: "explicit",
    connectorId: provider,
    provider,
    threadId: delivery.threadId,
    agentId: binding?.agentId || "",
    agentName: binding?.agentName || "",
    actorUserId: delivery.platformUserId || "",
  };
}

function createDeliveryIdentity(delivery) {
  return Object.freeze({
    kind: String(delivery?.kind || "completion").replace(/[^a-z0-9_-]/gi, ""),
    eventId: String(delivery?.eventId || "").replace(/[^a-z0-9_-]/gi, ""),
  });
}

function createDeliveryMarker(identity) {
  return `<!-- computer-agents-delivery:${identity.kind}:${identity.eventId} -->`;
}

function createJiraDeliveryProperty(identity) {
  return Object.freeze({
    key: JIRA_DELIVERY_PROPERTY_KEY,
    value: Object.freeze({
      source: "computer-agents",
      version: 1,
      kind: identity.kind,
      eventId: identity.eventId,
    }),
  });
}

function hasJiraDeliveryProperty(value, identity, depth = 0) {
  if (!value || depth > 8) return false;
  if (Array.isArray(value)) {
    return value.some((entry) => hasJiraDeliveryProperty(entry, identity, depth + 1));
  }
  if (typeof value !== "object") return false;
  if (
    value.key === JIRA_DELIVERY_PROPERTY_KEY
    && value.value?.source === "computer-agents"
    && value.value?.kind === identity.kind
    && value.value?.eventId === identity.eventId
  ) {
    return true;
  }
  return Object.values(value).some((entry) => (
    hasJiraDeliveryProperty(entry, identity, depth + 1)
  ));
}

function appendThreadLink({ summary, threadId, platformOrigin }) {
  const normalizedSummary = normalizeDisplayText(summary, 28_000);
  const origin = String(platformOrigin || "").trim().replace(/\/+$/, "");
  if (!origin || !threadId) return normalizedSummary;
  const link = `${origin}/${encodeURIComponent(threadId)}`;
  return `${normalizedSummary}\n\n[Open in Computer Agents](${link})`;
}
