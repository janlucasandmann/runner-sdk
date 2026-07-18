import type { PlatformRouteDefinition } from "./platform-route-registry.js";

export interface PlatformCompatibilityTarget {
  compatibilityUrl: string;
  route: PlatformRouteDefinition;
  action?: string;
  resourceId?: string;
  origin?: string;
}

/**
 * Builds an observable compatibility handoff while translating the small set
 * of deep links already understood by the compatibility application.
 */
export function createPlatformCompatibilityUrl({
  compatibilityUrl,
  route,
  action = "",
  resourceId = "",
  origin,
}: PlatformCompatibilityTarget): string {
  const fallbackOrigin =
    origin || (typeof window !== "undefined" ? window.location.origin : "") || "http://localhost";
  const target = new URL(compatibilityUrl, fallbackOrigin);
  target.searchParams.set("typedRoute", route.id);
  if (action) target.searchParams.set("typedAction", action);
  if (resourceId) target.searchParams.set("typedResourceId", resourceId);

  if (resourceId && (route.id === "thread" || action === "open-thread")) {
    target.searchParams.set("threadId", resourceId);
  }

  return target.toString();
}
