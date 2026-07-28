import type {
  PlatformPluginConnectionDefinition,
  PlatformPluginConnectionId,
  PlatformPluginConnectionStatus,
} from "./plugin-connection-types.js";

const CONNECTIONS: Readonly<
  Record<PlatformPluginConnectionId, PlatformPluginConnectionDefinition>
> = Object.freeze({
  github: Object.freeze({
    id: "github",
    label: "GitHub",
    category: "Source control",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg",
    statusPath: "/api/aios/github/user",
    loginPath: "/api/aios/github/login",
    disconnectPath: "/api/aios/github/disconnect",
  }),
  notion: Object.freeze({
    id: "notion",
    label: "Notion",
    category: "Knowledge",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg",
    statusPath: "/api/aios/notion/user",
    loginPath: "/api/aios/notion/login",
    disconnectPath: "/api/aios/notion/disconnect",
  }),
  "google-drive": Object.freeze({
    id: "google-drive",
    label: "Google Drive",
    category: "Storage",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg",
    statusPath: "/api/aios/google-drive/user",
    loginPath: "/api/aios/google-drive/login",
    disconnectPath: "/api/aios/google-drive/disconnect",
  }),
  gmail: Object.freeze({
    id: "gmail",
    label: "Gmail",
    category: "Channels",
    logoUrl: "/img/plugins/gmail.svg",
    statusPath: "/api/aios/gmail/user",
    loginPath: "/api/aios/gmail/login",
    disconnectPath: "/api/aios/gmail/disconnect",
  }),
  "one-drive": Object.freeze({
    id: "one-drive",
    label: "OneDrive",
    category: "Storage",
    logoUrl:
      "https://upload.wikimedia.org/wikipedia/commons/e/e7/Microsoft_OneDrive_Icon_%282025_-_present%29.svg",
    statusPath: "/api/aios/onedrive/user",
    loginPath: "/api/aios/onedrive/login",
    disconnectPath: "/api/aios/onedrive/disconnect",
  }),
});

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
  return {
    connected: Boolean(payload.connected),
    ...(profile ? { profile } : {}),
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
        : (["email", "username", "name"] as const);
  return firstProfileText(status.profile, fields) || "Connected";
}
