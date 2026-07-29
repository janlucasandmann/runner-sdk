import { isPlatformPluginConnectionId } from "./plugin-connection-registry.js";
import type {
  PlatformPluginConnectionId,
  PlatformPluginConnectionRedirectState,
  PlatformPluginConnectionStatus,
} from "./plugin-connection-types.js";
import { normalizePlatformPluginConnectionReturnTarget } from "./plugin-connection-return.js";
import { normalizePlatformConnectionCredentials } from "../../shared/connections/connection-credentials.js";

export const PLATFORM_PLUGIN_CONNECTION_STATUS_STORAGE_KEY = "runner_demo_integration_status_v1";
export const PLATFORM_PLUGIN_CONNECTION_REDIRECT_STORAGE_KEY =
  "runner_demo_integration_redirect_v1";

function getStorage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? globalThis.localStorage : globalThis.sessionStorage;
  } catch {
    return null;
  }
}

function readObject(storage: Storage | null, key: string): Record<string, unknown> {
  if (!storage) return {};
  try {
    const parsed = JSON.parse(storage.getItem(key) || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

export function readCachedPlatformPluginConnectionStatus(
  id: PlatformPluginConnectionId,
  storage: Storage | null = getStorage("local"),
): PlatformPluginConnectionStatus {
  const value = readObject(storage, PLATFORM_PLUGIN_CONNECTION_STATUS_STORAGE_KEY)[id];
  if (!value || typeof value !== "object" || Array.isArray(value)) return { connected: false };
  const status = value as Record<string, unknown>;
  const profile =
    status.profile && typeof status.profile === "object" && !Array.isArray(status.profile)
      ? (status.profile as Record<string, unknown>)
      : undefined;
  const credentials = normalizePlatformConnectionCredentials(status.credentials);
  return {
    connected: Boolean(status.connected),
    ...(profile ? { profile } : {}),
    ...(credentials.length > 0 ? { credentials } : {}),
    ...(typeof status.defaultCredentialId === "string" && status.defaultCredentialId.trim()
      ? { defaultCredentialId: status.defaultCredentialId.trim() }
      : {}),
  };
}

export function writeCachedPlatformPluginConnectionStatus(
  id: PlatformPluginConnectionId,
  status: PlatformPluginConnectionStatus | null | undefined,
  storage: Storage | null = getStorage("local"),
): void {
  if (!storage) return;
  try {
    const statuses = readObject(storage, PLATFORM_PLUGIN_CONNECTION_STATUS_STORAGE_KEY);
    if (status?.connected) {
      statuses[id] = {
        connected: true,
        ...(status.profile ? { profile: status.profile } : {}),
        ...(status.credentials?.length
          ? { credentials: normalizePlatformConnectionCredentials(status.credentials) }
          : {}),
        ...(status.defaultCredentialId?.trim()
          ? { defaultCredentialId: status.defaultCredentialId.trim() }
          : {}),
      };
    } else {
      delete statuses[id];
    }
    storage.setItem(PLATFORM_PLUGIN_CONNECTION_STATUS_STORAGE_KEY, JSON.stringify(statuses));
  } catch {}
}

export function readPlatformPluginConnectionRedirectState(
  storage: Storage | null = getStorage("session"),
): PlatformPluginConnectionRedirectState | null {
  const value = readObject(storage, PLATFORM_PLUGIN_CONNECTION_REDIRECT_STORAGE_KEY);
  if (!isPlatformPluginConnectionId(String(value.provider || ""))) return null;
  const savedAt = Number(value.savedAt || 0);
  if (!Number.isFinite(savedAt) || savedAt <= 0) return null;
  const returnTarget = normalizePlatformPluginConnectionReturnTarget(value.returnTarget);
  const { returnTarget: _returnTarget, ...rest } = value;
  return {
    ...rest,
    provider: String(value.provider) as PlatformPluginConnectionId,
    savedAt,
    ...(returnTarget ? { returnTarget } : {}),
  } as PlatformPluginConnectionRedirectState;
}

export function writePlatformPluginConnectionRedirectState(
  value: PlatformPluginConnectionRedirectState,
  storage: Storage | null = getStorage("session"),
): void {
  if (!storage) return;
  try {
    storage.setItem(PLATFORM_PLUGIN_CONNECTION_REDIRECT_STORAGE_KEY, JSON.stringify(value));
  } catch {}
}

export function clearPlatformPluginConnectionRedirectState(
  storage: Storage | null = getStorage("session"),
): void {
  try {
    storage?.removeItem(PLATFORM_PLUGIN_CONNECTION_REDIRECT_STORAGE_KEY);
  } catch {}
}
