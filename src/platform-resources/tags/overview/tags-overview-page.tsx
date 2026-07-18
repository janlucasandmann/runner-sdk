import type { ComponentProps } from "react";
import { PlatformDetailTabBar } from "../../../platform-ui/components/composite/detail-tab-bar/index.js";
import { ConnectionOverviewPage } from "../../shared/connections/connection-overview-page.js";
import type { ConnectionOverviewRow } from "../../shared/connections/connection-overview-page.js";
import { TagsOverviewGuide } from "./tags-overview-guide.js";

export type TagsOverviewPageProps = Omit<
  ComponentProps<typeof ConnectionOverviewPage>,
  | "kind"
  | "rows"
  | "onOpen"
  | "heroContent"
  | "showPeriodSelector"
  | "pageClassName"
  | "toolbarLeading"
  | "toolbarTitle"
  | "pagination"
> & {
  mode: "tags" | "plugins";
  onModeChange: (mode: "tags" | "plugins") => void;
  tagRows: readonly ConnectionOverviewRow[];
  pluginRows: readonly ConnectionOverviewRow[];
  onOpenTag: (row: ConnectionOverviewRow) => void;
  onOpenPlugin: (row: ConnectionOverviewRow) => void;
};

export function TagsOverviewPage({
  mode,
  onModeChange,
  tagRows,
  pluginRows,
  onOpenTag,
  onOpenPlugin,
  ...props
}: TagsOverviewPageProps) {
  const rows = mode === "plugins" ? pluginRows : tagRows;
  const onOpen = mode === "plugins" ? onOpenPlugin : onOpenTag;
  const modeTabs = (
    <PlatformDetailTabBar<"tags" | "plugins">
      ariaLabel="Tag and plugin categories"
      value={mode}
      tabs={[
        { id: "tags", label: "Tags" },
        { id: "plugins", label: "Plugins" },
      ]}
      onValueChange={onModeChange}
      variant="minimal"
      className="tags-overview-tab-bar"
    />
  );

  return (
    <ConnectionOverviewPage
      {...props}
      kind={mode}
      rows={rows}
      onOpen={onOpen}
      showPeriodSelector={false}
      pageClassName="is-tags is-tags-and-plugins"
      toolbarLeading={modeTabs}
      toolbarTitle={false}
      pagination={false}
      heroContent={(
        <TagsOverviewGuide
          tagRows={tagRows}
          pluginRows={pluginRows}
          onOpenTag={onOpenTag}
          onOpenPlugin={onOpenPlugin}
        />
      )}
    />
  );
}
