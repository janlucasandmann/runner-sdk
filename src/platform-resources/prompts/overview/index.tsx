import type { ReactNode } from "react";
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
  > {
  heroContent?: ReactNode;
}

/** Catalog shell for saved, versioned Markdown prompts. */
export function PromptsOverviewPage({
  heroContent = <SkillsOverviewGuide title="Create reusable prompts" />,
  ...props
}: PromptsOverviewPageProps) {
  return (
    <SkillsOverviewPage
      {...props}
      mode="custom"
      onModeChange={() => undefined}
      period="month"
      onPeriodChange={() => undefined}
      resourceName="Prompts"
      customGroupLabel="Prompts"
      systemGroupLabel="Prompts"
      searchPlaceholder="Search prompts"
      emptyState="No prompts available."
      noResultsState="No prompts match this view."
      heroContent={heroContent}
      pageClassName="is-skills is-prompts"
      grouping="flat"
    />
  );
}
