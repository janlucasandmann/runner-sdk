import { MessageSquareText, Plus } from "lucide-react";
import { useMemo, type ReactNode } from "react";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
import { createResourceOverviewColumns } from "../../../platform-ui/pages/overview/index.js";
import {
  SkillsOverviewGuide,
  SkillsOverviewPage,
  type SkillOverviewRow,
  type SkillsOverviewPageProps,
} from "../../skills/overview/index.js";

export type PromptOverviewRow = SkillOverviewRow;

export interface PromptsOverviewPageProps
  extends Omit<
    SkillsOverviewPageProps,
    | "mode"
    | "onModeChange"
    | "period"
    | "onPeriodChange"
    | "resourceName"
    | "systemGroupLabel"
    | "customGroupLabel"
    | "searchPlaceholder"
    | "heroContent"
    | "pageClassName"
    | "grouping"
    | "columns"
    | "getSearchText"
    | "identityColumn"
  > {
  heroContent?: ReactNode;
}

/** Catalog shell for saved, versioned Markdown prompts. */
export function PromptsOverviewPage({
  heroContent = <SkillsOverviewGuide title="Create reusable prompts" />,
  rows,
  onCreate,
  emptyState,
  ...props
}: PromptsOverviewPageProps) {
  const columns = useMemo(
    () => createResourceOverviewColumns<PromptOverviewRow>({
      name: {
        getVisual: () => ({
          icon: <MessageSquareText width={16} height={16} strokeWidth={1.8} />,
          iconClassName: "is-skill",
        }),
      },
    }),
    [],
  );
  const promptEmptyState = (
    <PlatformEmptyState
      icon={MessageSquareText}
      title={emptyState || "No prompts available."}
      description="Create a reusable prompt to keep instructions consistent across threads."
      primaryAction={{
        label: "Create prompt",
        icon: Plus,
        onClick: onCreate,
      }}
    />
  );

  return (
    <SkillsOverviewPage
      {...props}
      onCreate={onCreate}
      rows={rows}
      mode="custom"
      onModeChange={() => undefined}
      period="month"
      onPeriodChange={() => undefined}
      resourceName="Prompts"
      customGroupLabel="Prompts"
      systemGroupLabel="Prompts"
      searchPlaceholder="Search prompts"
      emptyState={promptEmptyState}
      noResultsState="No prompts match this view."
      heroContent={heroContent}
      pageClassName="is-skills is-prompts"
      grouping="flat"
      columns={columns}
      getSearchText={(row) => (
        `${row.searchText || row.name} ${row.creatorName || ""}`
      )}
    />
  );
}
