import { isPlatformPluginConnectionId } from "./plugin-connection-registry.js";
import type {
  PlatformPluginConnectionId,
  PlatformPluginConnectionReturnTarget,
  PlatformPluginConnectionReturnUrlState,
} from "./plugin-connection-types.js";

const RETURN_QUERY = {
  marker: "connectorAuthReturn",
  provider: "connectorAuthProvider",
  toolsView: "connectorAuthView",
  resourceId: "connectorAuthResource",
  tab: "connectorAuthTab",
  savedAt: "connectorAuthSavedAt",
  credentialId: "connectorAuthCredentialId",
  result: "connectorAuthResult",
  error: "connectorAuthError",
} as const;

export const PLATFORM_PLUGIN_CONNECTION_RETURN_QUERY_PARAMETERS = Object.freeze(
  Object.values(RETURN_QUERY),
);

const RETURN_STATE_MAX_AGE_MS = 30 * 60 * 1000;
const RETURN_STATE_FUTURE_TOLERANCE_MS = 5 * 60 * 1000;

function normalizeResourceId(value: unknown): string {
  const normalized = String(value || "").trim().toLowerCase();
  return /^[a-z0-9][a-z0-9._-]{0,199}$/.test(normalized) ? normalized : "";
}

function normalizeCredentialId(value: unknown): string {
  const normalized = String(value || "").trim();
  return /^[A-Za-z0-9_-]{1,160}$/.test(normalized) ? normalized : "";
}

export function normalizePlatformPluginConnectionReturnTarget(
  value: unknown,
): PlatformPluginConnectionReturnTarget | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = value as Record<string, unknown>;
  const toolsView =
    candidate.toolsView === "tags"
      ? "tags"
      : candidate.toolsView === "plugins"
        ? "plugins"
        : "";
  const resourceId = normalizeResourceId(candidate.resourceId);
  if (!toolsView || !resourceId || candidate.tab !== "authentication") return null;
  return {
    toolsView,
    resourceId,
    tab: "authentication",
  };
}

export function createPlatformPluginConnectionReturnUrlState(
  provider: PlatformPluginConnectionId,
  target: PlatformPluginConnectionReturnTarget,
  savedAt = Date.now(),
): PlatformPluginConnectionReturnUrlState {
  const normalizedTarget = normalizePlatformPluginConnectionReturnTarget(target);
  if (!isPlatformPluginConnectionId(provider) || !normalizedTarget) {
    throw new TypeError("A valid connector return target is required.");
  }
  return {
    provider,
    savedAt,
    ...normalizedTarget,
  };
}

export function buildPlatformPluginConnectionReturnUrl(
  input: string | URL,
  state: PlatformPluginConnectionReturnUrlState,
): string {
  const normalizedTarget = normalizePlatformPluginConnectionReturnTarget(state);
  if (!isPlatformPluginConnectionId(state.provider) || !normalizedTarget) {
    throw new TypeError("A valid connector return state is required.");
  }
  const savedAt = Number(state.savedAt);
  if (!Number.isFinite(savedAt) || savedAt <= 0) {
    throw new TypeError("A valid connector return timestamp is required.");
  }

  const url = input instanceof URL ? new URL(input.toString()) : new URL(input);
  url.searchParams.set(RETURN_QUERY.marker, "1");
  url.searchParams.set(RETURN_QUERY.provider, state.provider);
  url.searchParams.set(RETURN_QUERY.toolsView, normalizedTarget.toolsView);
  url.searchParams.set(RETURN_QUERY.resourceId, normalizedTarget.resourceId);
  url.searchParams.set(RETURN_QUERY.tab, normalizedTarget.tab);
  url.searchParams.set(RETURN_QUERY.savedAt, String(savedAt));
  const credentialId = normalizeCredentialId(state.credentialId);
  if (credentialId) {
    url.searchParams.set(RETURN_QUERY.credentialId, credentialId);
  } else {
    url.searchParams.delete(RETURN_QUERY.credentialId);
  }
  if (state.result === "success" || state.result === "error") {
    url.searchParams.set(RETURN_QUERY.result, state.result);
  } else {
    url.searchParams.delete(RETURN_QUERY.result);
  }
  const error = String(state.error || "").trim().slice(0, 160);
  if (state.result === "error" && error) {
    url.searchParams.set(RETURN_QUERY.error, error);
  } else {
    url.searchParams.delete(RETURN_QUERY.error);
  }
  return url.toString();
}

export function readPlatformPluginConnectionReturnUrlState(
  input: string | URL,
  now = Date.now(),
): PlatformPluginConnectionReturnUrlState | null {
  let url: URL;
  try {
    url = input instanceof URL ? input : new URL(input);
  } catch {
    return null;
  }
  if (url.searchParams.get(RETURN_QUERY.marker) !== "1") return null;

  const provider = url.searchParams.get(RETURN_QUERY.provider) || "";
  const target = normalizePlatformPluginConnectionReturnTarget({
    toolsView: url.searchParams.get(RETURN_QUERY.toolsView),
    resourceId: url.searchParams.get(RETURN_QUERY.resourceId),
    tab: url.searchParams.get(RETURN_QUERY.tab),
  });
  const savedAt = Number(url.searchParams.get(RETURN_QUERY.savedAt) || 0);
  if (
    !isPlatformPluginConnectionId(provider)
    || !target
    || !Number.isFinite(savedAt)
    || savedAt <= 0
    || now - savedAt > RETURN_STATE_MAX_AGE_MS
    || savedAt - now > RETURN_STATE_FUTURE_TOLERANCE_MS
  ) {
    return null;
  }

  const resultValue = url.searchParams.get(RETURN_QUERY.result);
  const result = resultValue === "success" || resultValue === "error"
    ? resultValue
    : undefined;
  const error = String(url.searchParams.get(RETURN_QUERY.error) || "").trim().slice(0, 160);
  const credentialId = normalizeCredentialId(
    url.searchParams.get(RETURN_QUERY.credentialId),
  );
  return {
    provider,
    savedAt,
    ...target,
    ...(credentialId ? { credentialId } : {}),
    ...(result ? { result } : {}),
    ...(result === "error" && error ? { error } : {}),
  };
}

export function clearPlatformPluginConnectionReturnUrlState(
  input: string | URL,
): string {
  const url = input instanceof URL ? new URL(input.toString()) : new URL(input);
  PLATFORM_PLUGIN_CONNECTION_RETURN_QUERY_PARAMETERS.forEach((parameter) => {
    url.searchParams.delete(parameter);
  });
  return url.toString();
}
