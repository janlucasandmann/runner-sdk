import type { PlatformRouteId } from "./platform-route-registry.js";

export const PLATFORM_ROUTE_CAPABILITY_KEYS = Object.freeze([
  "presentation",
  "queries",
  "details",
  "commands",
] as const);

export type PlatformRouteCapability = (typeof PLATFORM_ROUTE_CAPABILITY_KEYS)[number];

export type PlatformRouteCapabilityOwner = "native" | "compatibility" | "mixed" | "not-applicable";

export type PlatformRouteMigrationStage = "compatibility" | "hybrid" | "native";

export type PlatformRouteCapabilityOwnership = Readonly<
  Record<PlatformRouteCapability, PlatformRouteCapabilityOwner>
>;

export interface PlatformRouteMigrationReport {
  routeCount: number;
  nativeCapabilityCount: number;
  compatibilityCapabilityCount: number;
  mixedCapabilityCount: number;
  notApplicableCapabilityCount: number;
  routesByStage: Readonly<Record<PlatformRouteMigrationStage, readonly PlatformRouteId[]>>;
}

function ownership(
  presentation: PlatformRouteCapabilityOwner,
  queries: PlatformRouteCapabilityOwner,
  details: PlatformRouteCapabilityOwner,
  commands: PlatformRouteCapabilityOwner,
): PlatformRouteCapabilityOwnership {
  return Object.freeze({
    presentation,
    queries,
    details,
    commands,
  });
}

const COMPATIBILITY_ROUTE = ownership(
  "compatibility",
  "compatibility",
  "compatibility",
  "compatibility",
);

const NATIVE_OVERVIEW_COMPATIBILITY_DETAILS = ownership(
  "native",
  "native",
  "compatibility",
  "mixed",
);

const NATIVE_OVERVIEW_NO_DETAILS = ownership("native", "native", "not-applicable", "compatibility");

/**
 * Records behavioral ownership rather than merely recording whether a typed
 * component can render an overview. A route is only native when every
 * applicable capability is owned by the typed application.
 *
 * Update one entry as part of the same change that migrates and deletes the
 * corresponding compatibility behavior. The migration-budget tests prevent
 * ownership from moving backwards silently.
 */
export const PLATFORM_ROUTE_CAPABILITY_OWNERSHIP = Object.freeze({
  thread: COMPATIBILITY_ROUTE,
  projects: COMPATIBILITY_ROUTE,
  calendar: COMPATIBILITY_ROUTE,
  metronome: COMPATIBILITY_ROUTE,
  files: COMPATIBILITY_ROUTE,
  imagine: COMPATIBILITY_ROUTE,
  agents: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  computers: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  servers: COMPATIBILITY_ROUTE,
  plugins: COMPATIBILITY_ROUTE,
  skills: ownership("native", "native", "compatibility", "compatibility"),
  tags: COMPATIBILITY_ROUTE,
  "configure-home": ownership("native", "native", "not-applicable", "native"),
  notifications: NATIVE_OVERVIEW_NO_DETAILS,
  models: ownership("native", "native", "native", "compatibility"),
  marketplace: COMPATIBILITY_ROUTE,
  guardrails: COMPATIBILITY_ROUTE,
  evaluations: COMPATIBILITY_ROUTE,
  "fine-tuning": COMPATIBILITY_ROUTE,
  inference: COMPATIBILITY_ROUTE,
  teams: COMPATIBILITY_ROUTE,
  organizations: COMPATIBILITY_ROUTE,
  "develop-home": NATIVE_OVERVIEW_NO_DETAILS,
  "api-keys": ownership("native", "native", "not-applicable", "native"),
  webhooks: COMPATIBILITY_ROUTE,
  "web-apps": NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  apis: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  functions: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  databases: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  authentication: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  "agent-runtime": NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  "voice-agents": ownership("native", "native", "native", "mixed"),
  secrets: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
  payments: NATIVE_OVERVIEW_COMPATIBILITY_DETAILS,
} as const satisfies Readonly<Record<PlatformRouteId, PlatformRouteCapabilityOwnership>>);

export function getPlatformRouteCapabilityOwnership(
  routeId: PlatformRouteId,
): PlatformRouteCapabilityOwnership {
  return PLATFORM_ROUTE_CAPABILITY_OWNERSHIP[routeId];
}

export function getPlatformRouteMigrationStage(
  routeId: PlatformRouteId,
): PlatformRouteMigrationStage {
  const owners = Object.values(getPlatformRouteCapabilityOwnership(routeId));
  const applicableOwners = owners.filter((owner) => owner !== "not-applicable");
  if (applicableOwners.every((owner) => owner === "native")) return "native";
  if (applicableOwners.some((owner) => owner === "native" || owner === "mixed")) {
    return "hybrid";
  }
  return "compatibility";
}

export function createPlatformRouteMigrationReport(): PlatformRouteMigrationReport {
  const routesByStage: Record<PlatformRouteMigrationStage, PlatformRouteId[]> = {
    compatibility: [],
    hybrid: [],
    native: [],
  };
  let nativeCapabilityCount = 0;
  let compatibilityCapabilityCount = 0;
  let mixedCapabilityCount = 0;
  let notApplicableCapabilityCount = 0;

  for (const [routeId, capabilities] of Object.entries(PLATFORM_ROUTE_CAPABILITY_OWNERSHIP) as [
    PlatformRouteId,
    PlatformRouteCapabilityOwnership,
  ][]) {
    routesByStage[getPlatformRouteMigrationStage(routeId)].push(routeId);
    for (const owner of Object.values(capabilities)) {
      if (owner === "native") nativeCapabilityCount += 1;
      if (owner === "compatibility") compatibilityCapabilityCount += 1;
      if (owner === "mixed") mixedCapabilityCount += 1;
      if (owner === "not-applicable") notApplicableCapabilityCount += 1;
    }
  }

  return Object.freeze({
    routeCount: Object.keys(PLATFORM_ROUTE_CAPABILITY_OWNERSHIP).length,
    nativeCapabilityCount,
    compatibilityCapabilityCount,
    mixedCapabilityCount,
    notApplicableCapabilityCount,
    routesByStage: Object.freeze({
      compatibility: Object.freeze(routesByStage.compatibility),
      hybrid: Object.freeze(routesByStage.hybrid),
      native: Object.freeze(routesByStage.native),
    }),
  });
}
