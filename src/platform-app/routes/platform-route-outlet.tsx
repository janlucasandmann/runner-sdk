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
import { NotificationsOverviewRoute } from "./notifications-overview-route.js";
import { SkillsOverviewRoute } from "./skills-overview-route.js";
import { VoiceAgentsOverviewRoute } from "./voice-agents-overview-route.js";

export type PlatformLegacyRouteOpener = (
  action?: string,
  resourceId?: string,
) => void;

interface PlatformRouteRendererProps {
  onOpenLegacy: PlatformLegacyRouteOpener;
}

interface PlatformNativeRouteRenderer {
  compatibilityHandoff: false;
  render: () => ReactNode;
}

interface PlatformHybridRouteRenderer {
  compatibilityHandoff: true;
  render: (props: PlatformRouteRendererProps) => ReactNode;
}

type PlatformRouteRenderer =
  | PlatformNativeRouteRenderer
  | PlatformHybridRouteRenderer;

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
  return {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <DevelopResourceOverviewRouteContainer
        kind={kind}
        onOpenLegacy={(action, resourceId) => (
          onOpenLegacy(action, resourceId)
        )}
      />
    ),
  };
}

export const PLATFORM_TYPED_ROUTE_RENDERERS: Readonly<
  Partial<Record<PlatformRouteId, PlatformRouteRenderer>>
> = Object.freeze({
  "api-keys": {
    compatibilityHandoff: false,
    render: () => <ApiKeysOverviewRoute />,
  },
  agents: {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <AgentsOverviewRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  computers: {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <ComputersOverviewRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  "configure-home": {
    compatibilityHandoff: false,
    render: () => <ConfigureHomeRoute />,
  },
  notifications: {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <NotificationsOverviewRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  "develop-home": {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <DevelopHomeRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  models: {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <ModelsOverviewRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  "voice-agents": {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <VoiceAgentsOverviewRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  skills: {
    compatibilityHandoff: true,
    render: ({ onOpenLegacy }) => (
      <SkillsOverviewRoute
        onOpenLegacy={(action, resourceId) => onOpenLegacy(action, resourceId)}
      />
    ),
  },
  ...Object.fromEntries(
    Object.entries(DEVELOP_ROUTE_KINDS).map(([routeId, kind]) => [
      routeId,
      createDevelopRouteRenderer(kind),
    ]),
  ),
});

export function isPlatformTypedRoute(routeId: PlatformRouteId): boolean {
  return Boolean(PLATFORM_TYPED_ROUTE_RENDERERS[routeId]);
}

export function platformTypedRouteUsesCompatibilityHandoff(
  routeId: PlatformRouteId,
): boolean {
  return PLATFORM_TYPED_ROUTE_RENDERERS[routeId]?.compatibilityHandoff === true;
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
  if (!renderer) {
    return <PlatformPendingRoute route={route} onOpenLegacy={onOpenLegacy} />;
  }
  return renderer.compatibilityHandoff
    ? renderer.render({ onOpenLegacy })
    : renderer.render();
}
