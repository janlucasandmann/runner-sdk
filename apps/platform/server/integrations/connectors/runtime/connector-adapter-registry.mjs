import { createAsanaConnectorAdapter } from "./asana-connector-adapter.mjs";
import { canonicalizeConnectorId } from "../../connector-identity.mjs";
import { createAtlassianConnectorAdapter } from "./atlassian-connector-adapter.mjs";
import { createBigQueryConnectorAdapter } from "./bigquery-connector-adapter.mjs";
import { createBoxConnectorAdapter } from "./box-connector-adapter.mjs";
import { createDropboxConnectorAdapter } from "./dropbox-connector-adapter.mjs";
import { createFigmaConnectorAdapter } from "./figma-connector-adapter.mjs";
import { createLinearConnectorAdapter } from "./linear-connector-adapter.mjs";
import {
  createMicrosoftTeamsConnectorAdapter,
  createOutlookCalendarConnectorAdapter,
  createOutlookConnectorAdapter,
} from "./microsoft-graph-connector-adapters.mjs";
import { createSlackConnectorAdapter } from "./slack-connector-adapter.mjs";

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
    createAsanaConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createBigQueryConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createBoxConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createFigmaConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createLinearConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createMicrosoftTeamsConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createOutlookConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createOutlookCalendarConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    createSlackConnectorAdapter({
      fetchImpl,
      envFileCandidates,
    }),
    ...adapters,
  ];
  const byId = new Map();
  for (const adapter of configuredAdapters) {
    const aliases = [adapter?.id, ...(Array.isArray(adapter?.aliases) ? adapter.aliases : [])];
    for (const alias of aliases) {
      const id = canonicalizeConnectorId(alias);
      if (id) byId.set(id, adapter);
    }
  }

  function get(connectorId) {
    return byId.get(canonicalizeConnectorId(connectorId)) || null;
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
