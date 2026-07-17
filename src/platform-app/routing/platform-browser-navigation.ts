import { useSyncExternalStore } from "react";
import {
  getPlatformRoute,
  matchPlatformPathname,
  type PlatformRouteDefinition,
  type PlatformRouteId,
} from "./platform-route-registry.js";

const PLATFORM_NAVIGATION_EVENT = "platform:navigation";

function readPathname(): string {
  return typeof window === "undefined"
    ? "/platform-client/create"
    : window.location.pathname;
}

function subscribePathname(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("popstate", onStoreChange);
  window.addEventListener(PLATFORM_NAVIGATION_EVENT, onStoreChange);
  return () => {
    window.removeEventListener("popstate", onStoreChange);
    window.removeEventListener(PLATFORM_NAVIGATION_EVENT, onStoreChange);
  };
}

export function getPlatformClientRoutePath(
  route: PlatformRouteDefinition | PlatformRouteId,
): string {
  const definition = typeof route === "string"
    ? getPlatformRoute(route)
    : route;
  return `/platform-client${definition.path}`;
}

export function navigatePlatformClient(
  route: PlatformRouteDefinition | PlatformRouteId,
  options: { replace?: boolean } = {},
): void {
  if (typeof window === "undefined") return;
  const path = getPlatformClientRoutePath(route);
  if (options.replace) {
    window.history.replaceState({ platformRoute: true }, "", path);
  } else {
    window.history.pushState({ platformRoute: true }, "", path);
  }
  window.dispatchEvent(new Event(PLATFORM_NAVIGATION_EVENT));
}

export function usePlatformBrowserRoute(): PlatformRouteDefinition {
  const pathname = useSyncExternalStore(
    subscribePathname,
    readPathname,
    () => "/platform-client/create",
  );
  return matchPlatformPathname(pathname) || getPlatformRoute("thread");
}
