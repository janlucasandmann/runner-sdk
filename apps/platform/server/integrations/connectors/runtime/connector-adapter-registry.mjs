import { createAtlassianConnectorAdapter } from "./atlassian-connector-adapter.mjs";
import { createDropboxConnectorAdapter } from "./dropbox-connector-adapter.mjs";

export function createConnectorAdapterRegistry({
  envFileCandidates = [],
  fetchImpl = globalThis.fetch,
  adapters = [],
} = {}) {
  const configuredAdapters = [
    createAtlassianConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createDropboxConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    ...adapters,
  ];
  const byId = new Map();
  for (const adapter of configuredAdapters) {
    const aliases = [adapter?.id, ...(Array.isArray(adapter?.aliases) ? adapter.aliases : [])];
    for (const alias of aliases) {
      const id = normalizeConnectorId(alias);
      if (id) byId.set(id, adapter);
    }
  }

  function get(connectorId) {
    return byId.get(normalizeConnectorId(connectorId)) || null;
  }

  function listCapabilities(connectorId) {
    const adapter = get(connectorId);
    if (typeof adapter?.listCapabilities !== "function") return [];
    return Object.freeze([...adapter.listCapabilities()]);
  }

  return Object.freeze({
    get,
    list: () => Object.freeze([...new Set(byId.values())]),
    listCapabilities,
  });
}

function normalizeConnectorId(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();
  return /^[a-z0-9][a-z0-9-]{0,79}$/.test(normalized) ? normalized : "";
}
