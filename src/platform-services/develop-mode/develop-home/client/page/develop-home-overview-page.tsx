import {
  BookOpen,
  Bot,
  Code2,
  Coins,
  type LucideIcon,
} from "lucide-react";
import {
  type PlatformHomeFeatureCard,
  PlatformHomePage,
  type PlatformHomeSection,
} from "../../../../../platform-ui/pages/home/index.js";

export interface DevelopHomeResourceRow {
  id: string;
  kind: string;
  label: string;
  description: string;
  icon: LucideIcon;
  resourceCount: number;
  resourceCountLabel: string;
  operationCount: number;
  operationCountLabel: string;
  searchText: string;
}

export interface DevelopHomeQuickLink {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface DevelopHomeSupplementaryContent {
  onOpenQuickstart: () => void;
  onOpenAllConcepts: () => void;
  quickLinks: readonly DevelopHomeQuickLink[];
}

export interface DevelopHomeOverviewPageProps {
  rows: readonly DevelopHomeResourceRow[];
  supplementaryContent: DevelopHomeSupplementaryContent;
  onOpen: (row: DevelopHomeResourceRow) => void;
  onOpenPricing: () => void;
  onOpenDocumentation: () => void;
}

const BUILD_RESOURCE_KINDS = new Set([
  "web_app",
  "api",
  "function",
  "database",
  "auth",
]);

function toFeatureLinks(
  rows: readonly DevelopHomeResourceRow[],
  onOpen: (row: DevelopHomeResourceRow) => void,
) {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    meta: row.resourceCount > 0 ? row.resourceCountLabel : undefined,
    onClick: () => onOpen(row),
  }));
}

export function DevelopHomeOverviewPage({
  rows,
  supplementaryContent,
  onOpen,
  onOpenPricing,
  onOpenDocumentation,
}: DevelopHomeOverviewPageProps) {
  const buildRows = rows.filter((row) => BUILD_RESOURCE_KINDS.has(row.kind));
  const operateRows = rows.filter((row) => !BUILD_RESOURCE_KINDS.has(row.kind));

  const featureCards: readonly PlatformHomeFeatureCard[] = [
    {
      id: "build",
      title: "Build",
      description:
        "Create applications, APIs, functions, data stores, and identity services in one workspace.",
      icon: Code2,
      iconTone: "blue",
      links: toFeatureLinks(buildRows, onOpen),
    },
    {
      id: "operate",
      title: "Operate",
      description:
        "Run agents, voice experiences, secrets, and payments on managed infrastructure.",
      icon: Bot,
      iconTone: "violet",
      links: toFeatureLinks(operateRows, onOpen),
    },
  ];

  const sections: readonly PlatformHomeSection[] = [
    {
      id: "quickstart",
      title: "Quickstart",
      items: supplementaryContent.quickLinks,
    },
    {
      id: "documentation",
      title: "Documentation",
      action: {
        id: "all-documentation",
        label: "View all documentation",
        icon: BookOpen,
        onClick: onOpenDocumentation,
      },
      items: [
        {
          id: "developer-quickstart",
          label: "Developer quickstart",
          description: "Create a key, call the API, and ship your first integration.",
          icon: Code2,
          onClick: supplementaryContent.onOpenQuickstart,
        },
        {
          id: "core-concepts",
          label: "Core concepts",
          description: "Understand threads, computers, projects, and deployed resources.",
          icon: Bot,
          onClick: supplementaryContent.onOpenAllConcepts,
        },
        {
          id: "api-reference",
          label: "API reference",
          description: "Explore endpoints, request formats, events, and response contracts.",
          icon: BookOpen,
          onClick: onOpenDocumentation,
        },
      ],
    },
  ];

  return (
    <PlatformHomePage
      title="Develop your Workspace"
      description="Your workspace for building, deploying, and operating applications, APIs, data, and agent infrastructure."
      ariaLabel="Develop Home"
      className="is-develop-home"
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
          icon: BookOpen,
          onClick: onOpenDocumentation,
        },
      ]}
      featureCards={featureCards}
      sections={sections}
    />
  );
}
