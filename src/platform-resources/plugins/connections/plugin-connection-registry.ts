import type {
  PlatformPluginConnectionDefinition,
  PlatformPluginConnectionId,
  PlatformPluginConnectionStatus,
} from "./plugin-connection-types.js";
import { normalizePlatformConnectionCredentials } from "../../shared/connections/connection-credentials.js";
import {
  getPlatformConnectorCatalogEntry,
  listPlatformConnectorCatalogEntries,
} from "../../../platform-integrations/connectors/index.js";

const LEGACY_API_PATHS: Readonly<
  Partial<Record<PlatformPluginConnectionId, string>>
> = Object.freeze({
  github: "github",
  notion: "notion",
  "google-drive": "google-drive",
  gmail: "gmail",
  "one-drive": "onedrive",
  jira: "jira",
});

function createConnectionDefinition(
  id: PlatformPluginConnectionId,
): PlatformPluginConnectionDefinition {
  const catalogEntry = getPlatformConnectorCatalogEntry(id);
  if (!catalogEntry || catalogEntry.kind !== "plugin") {
    throw new TypeError(`Unknown plugin connection provider: ${id}`);
  }
  const legacyPath = LEGACY_API_PATHS[id];
  const basePath = legacyPath
    ? `/api/aios/${legacyPath}`
    : `/api/aios/connectors/${encodeURIComponent(id)}`;
  return Object.freeze({
    id,
    label: catalogEntry.label,
    category: catalogEntry.category,
    logoUrl: catalogEntry.logoUrl || "",
    authentication: catalogEntry.authentication,
    statusPath: `${basePath}/user`,
    loginPath: `${basePath}/login`,
    disconnectPath: `${basePath}/disconnect`,
    credentialsPath: `${basePath}/credentials`,
  });
}

export const PLATFORM_PLUGIN_CONNECTION_IDS = Object.freeze(
  listPlatformConnectorCatalogEntries("plugin").map(
    (entry) => entry.id as PlatformPluginConnectionId,
  ),
) as readonly PlatformPluginConnectionId[];

const CONNECTIONS: Readonly<
  Record<PlatformPluginConnectionId, PlatformPluginConnectionDefinition>
> = Object.freeze(
  Object.fromEntries(
    PLATFORM_PLUGIN_CONNECTION_IDS.map((id) => [
      id,
      createConnectionDefinition(id),
    ]),
  ) as Record<PlatformPluginConnectionId, PlatformPluginConnectionDefinition>,
);

export function isPlatformPluginConnectionId(value: string): value is PlatformPluginConnectionId {
  return Object.hasOwn(CONNECTIONS, value);
}

export function getPlatformPluginConnectionDefinition(
  id: PlatformPluginConnectionId,
): PlatformPluginConnectionDefinition {
  return CONNECTIONS[id];
}

export function listPlatformPluginConnectionDefinitions(): readonly PlatformPluginConnectionDefinition[] {
  return Object.values(CONNECTIONS);
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}

export function normalizePlatformPluginConnectionStatus(
  id: PlatformPluginConnectionId,
  value: unknown,
): PlatformPluginConnectionStatus {
  const payload = asRecord(value) || {};
  const sourceProfile = asRecord(payload.profile);
  const workspace = asRecord(payload.workspace);
  const profile =
    id === "notion" && workspace
      ? { ...(sourceProfile || {}), workspaceName: String(workspace.name || "") }
      : sourceProfile;
  const hasCredentialList = Array.isArray(payload.credentials);
  const credentials = normalizePlatformConnectionCredentials(payload.credentials);
  return {
    connected: Boolean(payload.connected),
    ...(profile ? { profile } : {}),
    ...(hasCredentialList ? { credentials } : {}),
    ...(typeof payload.defaultCredentialId === "string" && payload.defaultCredentialId.trim()
      ? { defaultCredentialId: payload.defaultCredentialId.trim() }
      : {}),
    ...(typeof payload.scope === "string" ? { scope: payload.scope } : {}),
    ...(typeof payload.tokenType === "string" ? { tokenType: payload.tokenType } : {}),
    ...(typeof payload.expiresAt === "number" || payload.expiresAt === null
      ? { expiresAt: payload.expiresAt }
      : {}),
    ...(typeof payload.reason === "string" ? { reason: payload.reason } : {}),
  };
}

function firstProfileText(
  profile: Record<string, unknown> | undefined,
  fields: readonly string[],
): string {
  for (const field of fields) {
    const value = profile?.[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

export function getPlatformPluginConnectionIdentity(
  id: PlatformPluginConnectionId,
  status: PlatformPluginConnectionStatus | null | undefined,
): string {
  if (!status?.connected) return "Not connected";
  const fields =
    id === "github"
      ? (["login", "email", "name"] as const)
      : id === "notion"
        ? (["workspaceName", "name", "email"] as const)
        : id === "jira"
          ? (["siteName", "displayName", "email", "url"] as const)
          : ([
              "email",
              "username",
              "displayName",
              "accountName",
              "workspaceName",
              "teamName",
              "projectName",
              "domain",
              "name",
              "url",
            ] as const);
  return firstProfileText(status.profile, fields) || "Connected";
}
