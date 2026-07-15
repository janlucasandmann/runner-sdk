import type { ComponentProps } from "react";
import { ConnectionOverviewPage } from "../../shared/connections/connection-overview-page.js";
import { TagsOverviewGuide } from "./tags-overview-guide.js";

export type TagsOverviewPageProps = Omit<
  ComponentProps<typeof ConnectionOverviewPage>,
  "kind" | "heroContent" | "showPeriodSelector"
> & {
  quickstartUrl?: string;
  documentationUrl?: string;
  tutorialUrl?: string;
};

export function TagsOverviewPage({
  rows,
  onOpen,
  quickstartUrl = "/developers/quickstart",
  documentationUrl = "/developers/run-and-scale/webhooks",
  tutorialUrl = "/tutorials/event-driven-triggers",
  ...props
}: TagsOverviewPageProps) {
  return (
    <ConnectionOverviewPage
      {...props}
      kind="tags"
      rows={rows}
      onOpen={onOpen}
      showPeriodSelector={false}
      heroContent={(
        <TagsOverviewGuide
          rows={rows}
          onOpen={onOpen}
          quickstartUrl={quickstartUrl}
          documentationUrl={documentationUrl}
          tutorialUrl={tutorialUrl}
        />
      )}
    />
  );
}
