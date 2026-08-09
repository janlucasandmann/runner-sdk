import { getConnectorRuntimeEnvValue } from "./connector-oauth-core.mjs";
import {
  canonicalizeConnectorId,
  getConnectorCredentialProviderId,
} from "./connector-identity.mjs";

const MCP_PATH = "/api/aios/connectors/mcp";

export function createConnectorRuntimeBridge({
  grantService,
  platformOrigin,
  envFileCandidates = [],
  logger = console,
} = {}) {
  if (typeof grantService?.issue !== "function") {
    throw new TypeError("Connector runtime bridge requires a grant service.");
  }

  let runtimeOriginPromise;
  async function getRuntimeOrigin() {
    if (!runtimeOriginPromise) {
      runtimeOriginPromise = resolveRuntimeOrigin({
        platformOrigin,
        envFileCandidates,
      });
    }
    return runtimeOriginPromise;
  }

  async function addRuntimeServers({ threadId, payload }) {
    const connectors = isRecord(payload?.connectors)
      ? payload.connectors
      : {};
    const connectorEntriesById = new Map();
    for (const [requestedId, policy] of Object.entries(connectors)) {
      if (policy?.enabled === false) continue;
      const connectorId = canonicalizeConnectorId(requestedId);
      if (!connectorId) continue;
      if (
        !connectorEntriesById.has(connectorId)
        || requestedId === connectorId
      ) {
        connectorEntriesById.set(connectorId, policy);
      }
    }
    const connectorEntries = [...connectorEntriesById.entries()];
    if (!connectorEntries.length) return payload;

    const endpoint = new URL(MCP_PATH, await getRuntimeOrigin()).toString();
    const existingServers = Array.isArray(payload.mcpServers)
      ? payload.mcpServers.filter(isRecord)
      : [];
    const byName = new Map(
      existingServers.map((server) => [String(server.name || ""), server]),
    );
    for (const [connectorId, policy] of connectorEntries) {
      const name = createMcpServerName(connectorId);
      const bearerToken = await grantService.issue({
        threadId,
        agentId: policy.agentId,
        agentName: policy.agentName,
        actorUserId: policy.actorUserId,
        connectorId,
        provider: getConnectorCredentialProviderId(connectorId),
        organizationId: policy.organizationId,
        credentialId: policy.credentialId,
        credentialSource: policy.credentialResolution?.source,
        projectId: policy.credentialResolution?.projectId,
        allowedActions: policy.allowedActions,
        approvalRequiredActions: policy.approvalRequiredActions,
        policyVersion: policy.policyVersion,
      });
      byName.set(name, {
        type: "http",
        name,
        url: endpoint,
        bearerToken,
        enabled: true,
        platformManaged: true,
      });
    }
    logger?.info?.("[connector-runtime] Injected connector MCP servers", {
      threadId,
      connectors: connectorEntries.map(([connectorId, policy]) => ({
        connectorId,
        credentialSource: policy.credentialResolution?.source,
      })),
    });
    return {
      ...payload,
      mcpServers: [...byName.values()],
    };
  }

  return Object.freeze({
    addRuntimeServers,
    path: MCP_PATH,
  });
}

export async function resolveRuntimeOrigin({
  platformOrigin,
  envFileCandidates,
}) {
  const configured = await getConnectorRuntimeEnvValue(
    "CONNECTOR_MCP_ORIGIN",
    envFileCandidates,
  );
  const candidate = configured || platformOrigin;
  let origin;
  try {
    origin = new URL(String(candidate || ""));
  } catch {
    throw new Error("Connector MCP origin is not configured.");
  }
  if (
    !["https:", "http:"].includes(origin.protocol)
    || origin.username
    || origin.password
    || origin.search
    || origin.hash
  ) {
    throw new Error("Connector MCP origin is invalid.");
  }
  if (isLoopbackHostname(origin.hostname)) {
    throw new Error(
      "Connector MCP origin must be reachable from the agent runtime. "
        + "Configure CONNECTOR_MCP_ORIGIN with a container-reachable or public platform origin.",
    );
  }
  return `${origin.origin}/`;
}

function isLoopbackHostname(hostname) {
  const normalized = String(hostname || "")
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "");
  return normalized === "localhost"
    || normalized === "::1"
    || normalized === "0:0:0:0:0:0:0:1"
    || normalized.startsWith("127.");
}

function createMcpServerName(connectorId) {
  const suffix = String(connectorId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 52);
  return `connector_${suffix || "service"}`;
}

function isRecord(value) {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value);
}
