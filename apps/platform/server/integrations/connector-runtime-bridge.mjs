import { getConnectorRuntimeEnvValue } from "./connector-oauth-core.mjs";

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
    const connectorEntries = Object.entries(connectors)
      .filter(([, policy]) => policy?.enabled !== false);
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
        connectorId,
        provider: getCredentialProviderId(connectorId),
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

async function resolveRuntimeOrigin({
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
  return `${origin.origin}/`;
}

function createMcpServerName(connectorId) {
  const suffix = String(connectorId || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "_")
    .slice(0, 52);
  return `connector_${suffix || "service"}`;
}

function getCredentialProviderId(connectorId) {
  if (connectorId === "one-drive") return "microsoft";
  if (connectorId === "atlassian") return "jira";
  return connectorId;
}

function isRecord(value) {
  return Boolean(value)
    && typeof value === "object"
    && !Array.isArray(value);
}
