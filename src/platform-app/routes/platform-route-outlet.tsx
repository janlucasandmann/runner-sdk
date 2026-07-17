import { ArrowUpRight, Blocks } from "lucide-react";
import type { ReactNode } from "react";

import type {
  DevelopResourceKind,
} from "../../platform-services/develop-mode/shared/index.js";
import type {
  PlatformRouteDefinition,
  PlatformRouteId,
} from "../routing/platform-route-registry.js";
import { ApiKeysOverviewRoute } from "./api-keys-overview-route.js";
import { AgentsOverviewRoute } from "./agents-overview-route.js";
import { ComputersOverviewRoute } from "./computers-overview-route.js";
import { ConfigureHomeRoute } from "./configure-home-route.js";
import {
  DevelopResourceOverviewRouteContainer,
} from "./develop-resource-overview-route.js";
import { DevelopHomeRoute } from "./develop-home-route.js";
import { ModelsOverviewRoute } from "./models-overview-route.js";
import { SkillsOverviewRoute } from "./skills-overview-route.js";

export type PlatformLegacyRouteOpener = (
  action?: string,
  resourceId?: string,
) => void;

interface PlatformRouteRendererProps {
  onOpenLegacy: PlatformLegacyRouteOpener;
}

type PlatformRouteRenderer = (
  props: PlatformRouteRendererProps,
) => ReactNode;

const DEVELOP_ROUTE_KINDS: Partial<
  Record<PlatformRouteId, Exclude<DevelopResourceKind, "voice_agent">>
> = Object.freeze({
  "web-apps": "web_app",
  apis: "api",
  functions: "function",
  databases: "database",
  authentication: "auth",
  "agent-runtime": "agent_runtime",
  secrets: "secrets",
  payments: "payments",
});

function createDevelopRouteRenderer(
  kind: Exclude<DevelopResourceKind, "voice_agent">,
): PlatformRouteRenderer {
  return ({ onOpenLegacy }) => (
    <DevelopResourceOverviewRouteContainer
      kind={kind}
      onOpenLegacy={(action, resourceId) => (
        onOpenLegacy(action, resourceId)
      )}
    />
  );
}

export const PLATFORM_TYPED_ROUTE_RENDERERS: Readonly<
  Partial<Record<PlatformRouteId, PlatformRouteRenderer>>
> = Object.freeze({
  "api-keys": ({ onOpenLegacy }) => (
    <ApiKeysOverviewRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  agents: ({ onOpenLegacy }) => (
    <AgentsOverviewRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  computers: ({ onOpenLegacy }) => (
    <ComputersOverviewRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  "configure-home": ({ onOpenLegacy }) => (
    <ConfigureHomeRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  "develop-home": ({ onOpenLegacy }) => (
    <DevelopHomeRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  models: ({ onOpenLegacy }) => (
    <ModelsOverviewRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  skills: ({ onOpenLegacy }) => (
    <SkillsOverviewRoute
      onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
    />
  ),
  ...Object.fromEntries(
    Object.entries(DEVELOP_ROUTE_KINDS).map(([routeId, kind]) => [
      routeId,
      createDevelopRouteRenderer(kind),
    ]),
  ),
});

export function isPlatformTypedRoute(routeId: PlatformRouteId): boolean {
  return typeof PLATFORM_TYPED_ROUTE_RENDERERS[routeId] === "function";
}

function PlatformPendingRoute({
  route,
  onOpenLegacy,
}: {
  route: PlatformRouteDefinition;
  onOpenLegacy: PlatformLegacyRouteOpener;
}) {
  return (
    <section className="platform-client-pending-route">
      <Blocks size={20} aria-hidden="true" />
      <h2>{route.label}</h2>
      <p>
        This route is registered in the typed application boundary and still
        uses the compatibility controller while its data and interaction
        contracts are migrated.
      </p>
      <button
        type="button"
        onClick={() => onOpenLegacy()}
      >
        Open current production surface
        <ArrowUpRight size={15} aria-hidden="true" />
      </button>
    </section>
  );
}

export interface PlatformRouteOutletProps {
  route: PlatformRouteDefinition;
  onOpenLegacy: PlatformLegacyRouteOpener;
}

export function PlatformRouteOutlet({
  route,
  onOpenLegacy,
}: PlatformRouteOutletProps) {
  const renderer = PLATFORM_TYPED_ROUTE_RENDERERS[route.id];
  return renderer
    ? renderer({ onOpenLegacy })
    : <PlatformPendingRoute route={route} onOpenLegacy={onOpenLegacy} />;
}
