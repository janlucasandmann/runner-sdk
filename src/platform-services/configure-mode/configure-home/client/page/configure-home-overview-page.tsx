import { HugeiconsIcon } from "@hugeicons/react";
import {
  BookOpen01Icon,
  Robot01Icon,
  ShieldCheckIcon,
} from "@hugeicons/core-free-icons";
import {
  ChartNoAxesColumnIncreasing,
  Coins,
  type LucideIcon,
} from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import {
  type PlatformHomeFeatureCard,
  PlatformHomePage,
  type PlatformHomeSection,
} from "../../../../../platform-ui/pages/home/index.js";

const ConfigureAgentsFeatureIcon: LucideIcon = (props) => (
  <HugeiconsIcon icon={Robot01Icon} {...props} />
);

const ConfigureGovernanceFeatureIcon: LucideIcon = (props) => (
  <HugeiconsIcon icon={ShieldCheckIcon} {...props} />
);

const ConfigureDocumentationIcon: LucideIcon = (props) => (
  <HugeiconsIcon icon={BookOpen01Icon} {...props} />
);

export interface ConfigureHomeTeaserCard {
  id: string;
  title: string;
  description: string;
  value: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface ConfigureHomeOverviewPageProps {
  cards: readonly ConfigureHomeTeaserCard[];
  onOpenNotifications: () => void;
  onOpenEvaluations: () => void;
  onOpenGuardrails: () => void;
  onOpenPricing: () => void;
  onOpenDocumentation: () => void;
}

export function ConfigureHomeOverviewPage({
  cards,
  onOpenNotifications,
  onOpenEvaluations,
  onOpenGuardrails,
  onOpenPricing,
  onOpenDocumentation,
}: ConfigureHomeOverviewPageProps) {
  const featureCards: readonly PlatformHomeFeatureCard[] = [
    {
      id: "create",
      title: "Create",
      description:
        "Build capable agents and give them persistent environments and reusable expertise.",
      icon: ConfigureAgentsFeatureIcon,
      iconTone: "blue",
      links: cards.map((card) => ({
        id: card.id,
        label: card.title,
        meta: card.value,
        onClick: card.onClick,
      })),
    },
    {
      id: "govern",
      title: "Govern",
      description:
        "Monitor incoming work, measure agent quality, and enforce operating boundaries.",
      icon: ConfigureGovernanceFeatureIcon,
      iconTone: "violet",
      links: [
        {
          id: "notifications",
          label: "Notifications",
          onClick: onOpenNotifications,
        },
        {
          id: "evaluations",
          label: "Evaluations",
          onClick: onOpenEvaluations,
        },
        {
          id: "guardrails",
          label: "Guardrails",
          onClick: onOpenGuardrails,
        },
      ],
    },
  ];

  const sections: readonly PlatformHomeSection[] = [
    {
      id: "quickstart",
      title: "Quickstart",
      items: cards.map((card) => ({
        id: `quickstart-${card.id}`,
        label:
          card.id === "agents"
            ? "Create an agent"
            : card.id === "computers"
              ? "Add a computer"
              : "Install a skill",
        description: card.description,
        meta: card.value,
        icon: card.icon,
        onClick: card.onClick,
      })),
    },
    {
      id: "documentation",
      title: "Documentation",
      action: {
        id: "all-documentation",
        label: "View all documentation",
        icon: ConfigureDocumentationIcon,
        onClick: onOpenDocumentation,
      },
      items: [
        {
          id: "agents-documentation",
          label: "Agent configuration",
          description: "Models, instructions, permissions, versions, and publishing.",
          icon: cards.find((card) => card.id === "agents")?.icon,
          onClick: onOpenDocumentation,
        },
        {
          id: "computers-documentation",
          label: "Computer environments",
          description: "Persistent runtimes, packages, setup scripts, and access.",
          icon: cards.find((card) => card.id === "computers")?.icon,
          onClick: onOpenDocumentation,
        },
        {
          id: "governance-documentation",
          label: "Evaluation and governance",
          description: "Measure quality and define how agents may operate.",
          icon: ChartNoAxesColumnIncreasing,
          onClick: onOpenDocumentation,
        },
      ],
    },
  ];

  return (
    <PlatformHomePage
      title="Configure your Workspace"
      description="Your workspace for creating, governing, and managing agents and their environments."
      ariaLabel="Configure Home"
      className="is-configure-home"
      headerActions={[
        {
          id: "pricing",
          label: "Pricing",
          icon: Coins,
          onClick: onOpenPricing,
        },
        {
          id: "documentation",
          label: "Documentation",
          icon: ConfigureDocumentationIcon,
          onClick: onOpenDocumentation,
        },
      ]}
      featureCards={featureCards}
      sections={sections}
    />
  );
}
