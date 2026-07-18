import { type ComponentType, type LazyExoticComponent, lazy } from "react";

// biome-ignore lint/suspicious/noExplicitAny: The concrete component props are preserved by Extract.
type AnyComponent = ComponentType<any>;

function lazyNamed<Module extends Record<string, unknown>, Name extends keyof Module>(
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
export const ComputerDetailPage = lazyNamed(
  () => import("../../platform-resources/computers/detail/computer-detail-page.js"),
  "ComputerDetailPage",
);
export const ProjectDetailPage = lazyNamed(
  () => import("../../platform-services/create-mode/projects/client/detail/project-detail-page.js"),
  "ProjectDetailPage",
);
export const MetronomesOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/create-mode/metronome/client/overview/metronomes-overview-page.js"
    ),
  "MetronomesOverviewPage",
);
export const SkillsOverviewPage = lazyNamed(
  () => import("../../platform-resources/skills/overview/skills-overview-page.js"),
  "SkillsOverviewPage",
);
export const TagsOverviewPage = lazyNamed(
  () => import("../../platform-resources/tags/overview/tags-overview-page.js"),
  "TagsOverviewPage",
);
export const TeamsOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/teams/client/page/overview/teams-overview-page.js"
    ),
  "TeamsOverviewPage",
);
export const OrganizationsOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/organizations/client/page/overview/organizations-overview-page.js"
    ),
  "OrganizationsOverviewPage",
);
export const GuardrailsOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/guardrails/client/page/overview/guardrails-overview-page.js"
    ),
  "GuardrailsOverviewPage",
);
export const EvaluationsOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/evaluations/client/page/overview/evaluations-overview-page.js"
    ),
  "EvaluationsOverviewPage",
);
export const FineTuningOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/fine-tuning/client/page/overview/fine-tuning-overview-page.js"
    ),
  "FineTuningOverviewPage",
);
export const TagDetailPage = lazyNamed(
  () => import("../../platform-resources/tags/detail/tag-detail-page.js"),
  "TagDetailPage",
);
export const ConfigureHomeOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/configure-home/client/page/configure-home-overview-page.js"
    ),
  "ConfigureHomeOverviewPage",
);
export const NotificationsOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/configure-mode/configure-home/client/page/notifications-overview-page.js"
    ),
  "NotificationsOverviewPage",
);
export const ModelsOverviewPage = lazyNamed(
  () => import("../../platform-services/configure-mode/models/client/page/models-overview-page.js"),
  "ModelsOverviewPage",
);
export const DevelopApiKeysOverviewPage = lazyNamed(
  () =>
    import("../../platform-services/develop-mode/api-keys/client/page/api-keys-overview-page.js"),
  "DevelopApiKeysOverviewPage",
);
export const DevelopHomeOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/develop-mode/develop-home/client/page/develop-home-overview-page.js"
    ),
  "DevelopHomeOverviewPage",
);
export const DevelopWebhooksOverviewPage = lazyNamed(
  () =>
    import(
      "../../platform-services/develop-mode/develop-home/client/page/develop-webhooks-overview-page.js"
    ),
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
