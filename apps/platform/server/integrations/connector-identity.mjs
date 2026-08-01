const CONNECTOR_IDENTITIES = Object.freeze({
  jira: Object.freeze({
    aliases: Object.freeze(["jira", "atlassian"]),
    provider: "jira",
  }),
  "microsoft-teams": Object.freeze({
    aliases: Object.freeze(["microsoft-teams", "teams"]),
    provider: "microsoft-teams",
  }),
  "one-drive": Object.freeze({
    aliases: Object.freeze(["one-drive"]),
    provider: "microsoft",
  }),
});

const CANONICAL_BY_ALIAS = new Map();
for (const [canonicalId, identity] of Object.entries(CONNECTOR_IDENTITIES)) {
  for (const alias of identity.aliases) {
    CANONICAL_BY_ALIAS.set(alias, canonicalId);
  }
}

export function normalizeConnectorId(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : "";
}

export function canonicalizeConnectorId(value) {
  const normalized = normalizeConnectorId(value);
  return normalized ? CANONICAL_BY_ALIAS.get(normalized) || normalized : "";
}

export function listConnectorIdentityAliases(value) {
  const canonicalId = canonicalizeConnectorId(value);
  if (!canonicalId) return Object.freeze([]);
  const configured = CONNECTOR_IDENTITIES[canonicalId]?.aliases || [];
  return Object.freeze([
    canonicalId,
    ...configured.filter((alias) => alias !== canonicalId),
  ]);
}

export function getConnectorCredentialProviderId(value) {
  const canonicalId = canonicalizeConnectorId(value);
  if (!canonicalId) return "";
  return CONNECTOR_IDENTITIES[canonicalId]?.provider || canonicalId;
}

export function createConnectorActionPrefix(value) {
  const canonicalId = canonicalizeConnectorId(value);
  return canonicalId ? `${canonicalId.replaceAll("-", "_")}_action_` : "";
}
