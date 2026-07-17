import { lazy, type ComponentType, type LazyExoticComponent } from "react";

type AnyComponent = ComponentType<any>;

function lazyNamed<
  Module extends Record<string, unknown>,
  Name extends keyof Module,
>(
  loader: () => Promise<Module>,
  name: Name,
): LazyExoticComponent<Extract<Module[Name], AnyComponent>> {
  return lazy(async () => {
    const module = await loader();
    const component = module[name];
    if (typeof component !== "function" && typeof component !== "object") {
      throw new Error(`Lazy platform page export "${String(name)}" is not a component.`);
    }
    return { default: component as Extract<Module[Name], AnyComponent> };
  });
}

export const AgentDetailPage = lazyNamed(
  () => import("../../platform-resources/agents/detail/agent-detail-page.js"),
  "AgentDetailPage",
);
export const AgentPermissionsPage = lazyNamed(
  () => import("../../platform-resources/agents/detail/agent-permissions-page.js"),
  "AgentPermissionsPage",
);
export const AgentsOverviewPage = lazyNamed(
  () => import("../../platform-resources/agents/overview/agents-overview-page.js"),
  "AgentsOverviewPage",
);
export const ComputersOverviewPage = lazyNamed(
  () => import("../../platform-resources/computers/overview/computers-overview-page.js"),
  "ComputersOverviewPage",
);
export const PluginsOverviewPage = lazyNamed(
  () => import("../../platform-resources/plugins/overview/plugins-overview-page.js"),
  "PluginsOverviewPage",
);
export const SkillsOverviewPage = lazyNamed(
  () => import("../../platform-resources/skills/overview/skills-overview-page.js"),
  "SkillsOverviewPage",
);
export const TagsOverviewPage = lazyNamed(
  () => import("../../platform-resources/tags/overview/tags-overview-page.js"),
  "TagsOverviewPage",
);
export const ConfigureHomeOverviewPage = lazyNamed(
  () => import("../../platform-services/configure-mode/configure-home/client/page/configure-home-overview-page.js"),
  "ConfigureHomeOverviewPage",
);
export const ModelsOverviewPage = lazyNamed(
  () => import("../../platform-services/configure-mode/models/client/page/models-overview-page.js"),
  "ModelsOverviewPage",
);
export const DevelopApiKeysOverviewPage = lazyNamed(
  () => import("../../platform-services/develop-mode/api-keys/client/page/api-keys-overview-page.js"),
  "DevelopApiKeysOverviewPage",
);
export const DevelopHomeOverviewPage = lazyNamed(
  () => import("../../platform-services/develop-mode/develop-home/client/page/develop-home-overview-page.js"),
  "DevelopHomeOverviewPage",
);
export const DevelopWebhooksOverviewPage = lazyNamed(
  () => import("../../platform-services/develop-mode/develop-home/client/page/develop-webhooks-overview-page.js"),
  "DevelopWebhooksOverviewPage",
);
export const DevelopResourceOverviewRoute = lazyNamed(
  () => import("../../platform-services/develop-mode/resource-page-registry.js"),
  "DevelopResourceOverviewRoute",
);
export const DevelopVoiceAgentsOverviewPage = lazyNamed(
  () => import("../../platform-services/develop-mode/voice-agents/client/page/overview-page.js"),
  "DevelopVoiceAgentsOverviewPage",
);
