import { MessageSquareText, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { PlatformEmptyState } from "../../../platform-ui/components/composite/empty-state/index.js";
import {
  SkillsOverviewGuide,
  SkillsOverviewPage,
  type SkillOverviewRow,
  type SkillsOverviewIdentityColumn,
  type SkillsOverviewPageProps,
} from "../../skills/overview/index.js";

export type PromptOverviewRow = SkillOverviewRow;

const PROMPT_CREATOR_IDENTITY_COLUMN: SkillsOverviewIdentityColumn = {
  id: "creator",
  header: "Creator",
  getIdentity: (row) => {
    const name = row.creatorName?.trim()
      || (row.isCustom ? "Unknown user" : "Computer Agents");
    return {
      name,
      imageUrl: row.creatorAvatarUrl
        || (row.isCustom
          ? undefined
          : "/img/agent-profile-pics/ca-profilepic.jpg"),
    };
  },
};

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
  rows,
  onCreate,
  emptyState,
  ...props
}: PromptsOverviewPageProps) {
  const promptRows = rows.map((row) => ({
    ...row,
    icon: <MessageSquareText width={16} height={16} strokeWidth={1.8} />,
  }));
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
      rows={promptRows}
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
      identityColumn={PROMPT_CREATOR_IDENTITY_COLUMN}
    />
  );
}
