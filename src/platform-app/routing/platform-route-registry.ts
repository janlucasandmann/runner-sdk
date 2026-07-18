export const PLATFORM_MODES = Object.freeze([
  "create",
  "configure",
  "develop",
] as const);

export type PlatformMode = typeof PLATFORM_MODES[number];

export type PlatformRouteId =
  | "thread"
  | "projects"
  | "calendar"
  | "metronome"
  | "files"
  | "imagine"
  | "agents"
  | "computers"
  | "servers"
  | "plugins"
  | "skills"
  | "tags"
  | "configure-home"
  | "notifications"
  | "models"
  | "marketplace"
  | "guardrails"
  | "evaluations"
  | "fine-tuning"
  | "inference"
  | "teams"
  | "organizations"
  | "develop-home"
  | "api-keys"
  | "webhooks"
  | "web-apps"
  | "apis"
  | "functions"
  | "databases"
  | "authentication"
  | "agent-runtime"
  | "voice-agents"
  | "secrets"
  | "payments";

export interface PlatformLegacyRouteTarget {
  page: string;
  resourceView?: string;
  serverKind?: string;
  toolsView?: string;
}

export interface PlatformRouteDefinition {
  id: PlatformRouteId;
  mode: PlatformMode;
  label: string;
  path: string;
  legacy: PlatformLegacyRouteTarget;
}

type PlatformRouteRegistration = Omit<PlatformRouteDefinition, "path">;

const ROUTES = [
  { id: "thread", mode: "create", label: "Thread", legacy: { page: "thread" } },
  { id: "projects", mode: "create", label: "Projects", legacy: { page: "tasks" } },
  { id: "calendar", mode: "create", label: "Calendar", legacy: { page: "calendar" } },
  { id: "metronome", mode: "create", label: "Metronome", legacy: { page: "metronome" } },
  { id: "files", mode: "create", label: "Files", legacy: { page: "files" } },
  { id: "imagine", mode: "create", label: "Imagine", legacy: { page: "imagine" } },
  { id: "configure-home", mode: "configure", label: "Home", legacy: { page: "configure-home" } },
  { id: "notifications", mode: "configure", label: "Notifications", legacy: { page: "configure-notifications" } },
  { id: "agents", mode: "configure", label: "Agents", legacy: { page: "resources", resourceView: "agents" } },
  { id: "computers", mode: "configure", label: "Computers", legacy: { page: "resources", resourceView: "computers" } },
  { id: "servers", mode: "configure", label: "Servers", legacy: { page: "resources", resourceView: "servers" } },
  { id: "plugins", mode: "configure", label: "Plugins", legacy: { page: "tools", toolsView: "plugins" } },
  { id: "skills", mode: "configure", label: "Skills", legacy: { page: "tools", toolsView: "skills" } },
  { id: "tags", mode: "configure", label: "Tags", legacy: { page: "tools", toolsView: "tags" } },
  { id: "models", mode: "configure", label: "Models", legacy: { page: "models" } },
  { id: "marketplace", mode: "configure", label: "Marketplace", legacy: { page: "marketplace" } },
  { id: "guardrails", mode: "configure", label: "Guardrails", legacy: { page: "guardrails" } },
  { id: "evaluations", mode: "configure", label: "Evaluations", legacy: { page: "evaluations" } },
  { id: "fine-tuning", mode: "configure", label: "Fine-tuning", legacy: { page: "fine-tuning" } },
  { id: "inference", mode: "configure", label: "Inference", legacy: { page: "inference" } },
  { id: "teams", mode: "configure", label: "Teams", legacy: { page: "team" } },
  { id: "organizations", mode: "configure", label: "Organizations", legacy: { page: "organization" } },
  { id: "develop-home", mode: "develop", label: "Home", legacy: { page: "develop-home" } },
  { id: "api-keys", mode: "develop", label: "API keys", legacy: { page: "develop-api-keys" } },
  { id: "webhooks", mode: "develop", label: "Webhooks", legacy: { page: "develop-webhooks" } },
  { id: "web-apps", mode: "develop", label: "Web apps", legacy: { page: "resources", resourceView: "servers", serverKind: "web_app" } },
  { id: "apis", mode: "develop", label: "APIs", legacy: { page: "resources", resourceView: "servers", serverKind: "api" } },
  { id: "functions", mode: "develop", label: "Functions", legacy: { page: "resources", resourceView: "servers", serverKind: "function" } },
  { id: "databases", mode: "develop", label: "Databases", legacy: { page: "resources", resourceView: "servers", serverKind: "database" } },
  { id: "authentication", mode: "develop", label: "Authentication", legacy: { page: "resources", resourceView: "servers", serverKind: "auth" } },
  { id: "agent-runtime", mode: "develop", label: "Agent runtime", legacy: { page: "resources", resourceView: "servers", serverKind: "agent_runtime" } },
  { id: "voice-agents", mode: "develop", label: "Voice agents", legacy: { page: "resources", resourceView: "servers", serverKind: "voice_agent" } },
  { id: "secrets", mode: "develop", label: "Secrets", legacy: { page: "resources", resourceView: "servers", serverKind: "secrets" } },
  { id: "payments", mode: "develop", label: "Payments", legacy: { page: "resources", resourceView: "servers", serverKind: "payments" } },
] as const satisfies readonly PlatformRouteRegistration[];

function createPlatformRoutePath(
  route: PlatformRouteRegistration,
): string {
  if (route.id === "thread") return "/create";
  if (route.id === "configure-home") return "/configure";
  if (route.id === "develop-home") return "/develop";
  return `/${route.mode}/${route.id}`;
}

export const PLATFORM_ROUTE_REGISTRY: readonly PlatformRouteDefinition[] = Object.freeze(
  ROUTES.map((route) => Object.freeze({
    ...route,
    path: createPlatformRoutePath(route),
    legacy: Object.freeze({ ...route.legacy }),
  })),
);

const ROUTES_BY_ID = new Map<PlatformRouteId, PlatformRouteDefinition>(
  PLATFORM_ROUTE_REGISTRY.map((route) => [route.id, route]),
);

export function getPlatformRoute(
  routeId: PlatformRouteId,
): PlatformRouteDefinition {
  const route = ROUTES_BY_ID.get(routeId);
  if (!route) {
    throw new Error(`Unknown platform route: ${routeId}`);
  }
  return route;
}

export function getPlatformRoutesForMode(
  mode: PlatformMode,
): readonly PlatformRouteDefinition[] {
  return PLATFORM_ROUTE_REGISTRY.filter((route) => route.mode === mode);
}

export function matchPlatformPathname(
  pathname: string,
): PlatformRouteDefinition | null {
  const normalizedPath = `/${String(pathname || "")
    .trim()
    .replace(/^\/+|\/+$/g, "")}`
    .replace(/^\/platform-client(?=\/|$)/, "")
    .replace(/\/+$/, "") || "/";
  return PLATFORM_ROUTE_REGISTRY.find((route) => (
    route.path === normalizedPath
  )) || null;
}

export function matchPlatformLegacyRoute(
  target: PlatformLegacyRouteTarget,
): PlatformRouteDefinition | null {
  const page = String(target.page || "").trim();
  const resourceView = String(target.resourceView || "").trim();
  const serverKind = String(target.serverKind || "").trim();
  const toolsView = String(target.toolsView || "").trim();

  const matches = PLATFORM_ROUTE_REGISTRY.filter((route) => (
    route.legacy.page === page
    && (!route.legacy.resourceView || route.legacy.resourceView === resourceView)
    && (!route.legacy.serverKind || route.legacy.serverKind === serverKind)
    && (!route.legacy.toolsView || route.legacy.toolsView === toolsView)
  ));

  return matches.sort((left, right) => {
    const leftSpecificity = Object.keys(left.legacy).length;
    const rightSpecificity = Object.keys(right.legacy).length;
    return rightSpecificity - leftSpecificity;
  })[0] || null;
}
