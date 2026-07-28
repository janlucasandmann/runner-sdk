import type { ComponentProps } from "react";
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
  | "tableVariant"
  | "showStatusFilter"
  | "selectionEnabled"
  | "rowGrouping"
  | "pagination"
> & {
  tagRows: readonly ConnectionOverviewRow[];
  pluginRows: readonly ConnectionOverviewRow[];
  onOpenTag: (row: ConnectionOverviewRow) => void;
  onOpenPlugin: (row: ConnectionOverviewRow) => void;
};

export function TagsOverviewPage({
  tagRows,
  pluginRows,
  onOpenTag,
  onOpenPlugin,
  ...props
}: TagsOverviewPageProps) {
  const rows: ConnectionOverviewRow[] = [
    ...pluginRows.map((row) => ({
      ...row,
      tableRowId: `plugins:${row.id}`,
      resourceKind: "plugins" as const,
    })),
    ...tagRows.map((row) => ({
      ...row,
      tableRowId: `tags:${row.id}`,
      resourceKind: "tags" as const,
    })),
  ];
  const sourceRows = new Map<string, ConnectionOverviewRow>([
    ...pluginRows.map((row) => [`plugins:${row.id}`, row] as const),
    ...tagRows.map((row) => [`tags:${row.id}`, row] as const),
  ]);
  const onOpen = (row: ConnectionOverviewRow) => {
    const sourceRow = sourceRows.get(row.tableRowId || "") || row;
    if (row.resourceKind === "tags") onOpenTag(sourceRow);
    else onOpenPlugin(sourceRow);
  };

  return (
    <ConnectionOverviewPage
      {...props}
      kind="connections"
      rows={rows}
      onOpen={onOpen}
      showPeriodSelector={false}
      pageClassName="is-tags is-tags-and-plugins"
      toolbarTitle={false}
      tableVariant="catalog-ui"
      showStatusFilter={false}
      selectionEnabled={false}
      rowGrouping={{
        groups: [
          {
            id: "plugins",
            label: "Plugins",
            ariaLabel: "Plugins",
          },
          {
            id: "tags",
            label: "Tags",
            ariaLabel: "Tags",
          },
        ],
        getGroupId: (row) => row.resourceKind || "plugins",
      }}
      pagination={false}
      heroContent={<TagsOverviewGuide />}
    />
  );
}
