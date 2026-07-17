import {
  ArrowUpRight,
  Blocks,
  Code2,
  Hammer,
  Settings2,
} from "lucide-react";
import type { MouseEvent } from "react";
import {
  getPlatformClientRoutePath,
  getPlatformRoutesForMode,
  navigatePlatformClient,
  PLATFORM_MODES,
  PlatformApplicationBoundary,
  PlatformRouteOutlet,
  type PlatformMode,
  type PlatformRouteDefinition,
  type PlatformRuntimeConfig,
  usePlatformBrowserRoute,
} from "../../../../../src/platform-app/index.js";

export interface PlatformClientProps {
  runtime?: Partial<PlatformRuntimeConfig>;
  platformHostUrl?: string;
}

const MODE_ICONS = {
  create: Hammer,
  configure: Settings2,
  develop: Code2,
} as const;

function openLegacyPlatform(
  platformHostUrl: string,
  route: PlatformRouteDefinition,
  action = "",
  resourceId = "",
) {
  const target = new URL(platformHostUrl, window.location.origin);
  target.searchParams.set("typedRoute", route.id);
  if (action) target.searchParams.set("typedAction", action);
  if (resourceId) target.searchParams.set("typedResourceId", resourceId);
  window.location.assign(target.toString());
}

function PlatformRouteContent({
  route,
  platformHostUrl,
}: {
  route: PlatformRouteDefinition;
  platformHostUrl: string;
}) {
  const onOpenLegacy = (action = "", resourceId?: string) => {
    openLegacyPlatform(platformHostUrl, route, action, resourceId);
  };
  return (
    <PlatformRouteOutlet
      route={route}
      onOpenLegacy={onOpenLegacy}
    />
  );
}

function PlatformClientShell({
  platformHostUrl,
}: {
  platformHostUrl: string;
}) {
  const route = usePlatformBrowserRoute();
  const routes = getPlatformRoutesForMode(route.mode);

  const handleRouteClick = (
    event: MouseEvent<HTMLAnchorElement>,
    nextRoute: PlatformRouteDefinition,
  ) => {
    if (
      event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigatePlatformClient(nextRoute);
  };

  const handleModeChange = (mode: PlatformMode) => {
    const target = getPlatformRoutesForMode(mode)[0];
    if (target) navigatePlatformClient(target);
  };

  return (
    <div className="platform-client-shell">
      <aside className="platform-client-sidebar">
        <div className="platform-client-brand">
          <Blocks size={17} aria-hidden="true" />
          <span>Computer Agents</span>
        </div>
        <fieldset
          className="platform-client-mode-selector"
          aria-label="Platform mode"
        >
          {PLATFORM_MODES.map((mode) => {
            const Icon = MODE_ICONS[mode];
            return (
              <button
                key={mode}
                type="button"
                className={route.mode === mode ? "is-active" : ""}
                aria-pressed={route.mode === mode}
                onClick={() => handleModeChange(mode)}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{mode}</span>
              </button>
            );
          })}
        </fieldset>
        <nav className="platform-client-navigation" aria-label={`${route.mode} pages`}>
          {routes.map((item) => (
            <a
              key={item.id}
              href={getPlatformClientRoutePath(item)}
              className={item.id === route.id ? "is-active" : ""}
              aria-current={item.id === route.id ? "page" : undefined}
              onClick={(event) => handleRouteClick(event, item)}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </aside>
      <section className="platform-client-workspace">
        <header className="platform-client-header">
          <div>
            <span>{route.mode}</span>
            <h1>{route.label}</h1>
          </div>
          <a href={platformHostUrl}>
            Current platform
            <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </header>
        <main className="platform-client-content">
          <PlatformRouteContent
            route={route}
            platformHostUrl={platformHostUrl}
          />
        </main>
      </section>
    </div>
  );
}

/**
 * Typed client composition root.
 *
 * Migrated routes execute against the platform API provider directly. Routes
 * still in compatibility mode remain explicit registry entries and hand off
 * to the production surface without coupling the typed shell to legacy state.
 */
export function PlatformClient({
  runtime,
  platformHostUrl = "http://127.0.0.1:4177",
}: PlatformClientProps) {
  return (
    <PlatformApplicationBoundary runtime={runtime}>
      <PlatformClientShell platformHostUrl={platformHostUrl} />
    </PlatformApplicationBoundary>
  );
}
