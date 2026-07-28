import { Flag, Plus } from "lucide-react";
import { useMemo, type CSSProperties } from "react";
import type { PlatformAnalyticsModel } from "../../../../../platform-ui/components/composite/analytics/index.js";
import {
  PlatformDataTable,
  type PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import { PlatformLabel, type PlatformLabelVariant } from "../../../../../platform-ui/components/ui/label/index.js";

export interface ProjectMilestonesOverviewRow {
  id: string;
  name: string;
  statusLabel: string;
  statusVariant: PlatformLabelVariant;
  statusRank: number;
  progressPercent: number;
  ticketCount: number;
  completedTicketCount: number;
  targetLabel: string;
  updatedLabel: string;
  updatedTimestamp: number;
  searchText?: string;
  source?: unknown;
}

export interface ProjectMilestonesOverviewPageProps {
  rows: readonly ProjectMilestonesOverviewRow[];
  analytics: PlatformAnalyticsModel;
  loading?: boolean;
  error?: string;
  onCreate: () => void;
  onOpen: (row: ProjectMilestonesOverviewRow) => void;
}

function ProjectMilestoneProgress({
  percent,
}: {
  percent: number;
}) {
  const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent || 0)));
  return (
    <span
      className="platform-project-milestone-progress"
      aria-label={`${normalizedPercent}% complete`}
    >
      <span
        className="platform-project-milestone-progress__ring"
        style={{
          "--project-milestone-progress": `${normalizedPercent}%`,
        } as CSSProperties}
        aria-hidden="true"
      />
      <span className="platform-project-milestone-progress__value">
        {normalizedPercent}%
      </span>
    </span>
  );
}

export function ProjectMilestonesOverviewPage({
  rows,
  analytics,
  loading = false,
  error = "",
  onCreate,
  onOpen,
}: ProjectMilestonesOverviewPageProps) {
  const columns = useMemo<PlatformDataTableColumn<ProjectMilestonesOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Milestone",
        accessor: "name",
        sortable: true,
        width: "minmax(190px, 1.4fr)",
        cell: ({ row }) => (
          <span className="platform-project-milestone-name" title={row.name}>
            {row.name}
          </span>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "statusRank",
        sortable: true,
        width: "minmax(100px, 0.62fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={row.statusVariant}>
            {row.statusLabel}
          </PlatformLabel>
        ),
      },
      {
        id: "progress",
        header: "Progress",
        accessor: "progressPercent",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(110px, 0.68fr)",
        cell: ({ row }) => (
          <ProjectMilestoneProgress percent={row.progressPercent} />
        ),
      },
      {
        id: "tickets",
        header: "Tickets",
        accessor: "ticketCount",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(105px, 0.62fr)",
        hideBelow: 720,
        cell: ({ row }) => (
          <span className="platform-project-milestone-value">
            {row.completedTicketCount} of {row.ticketCount}
          </span>
        ),
      },
      {
        id: "target",
        header: "Target",
        accessor: "targetLabel",
        sortable: true,
        width: "minmax(130px, 0.8fr)",
        hideBelow: 860,
        cell: ({ row }) => (
          <span className="platform-project-milestone-value">
            {row.targetLabel}
          </span>
        ),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: "updatedTimestamp",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(115px, 0.68fr)",
        hideBelow: 980,
        cell: ({ row }) => (
          <span className="platform-project-milestone-value">
            {row.updatedLabel}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="platform-project-milestones-overview-page">
      <PlatformAnalyticsSection
        analytics={analytics}
        chartType="line"
        className="platform-project-milestones-overview-page__analytics"
      />
      <section className="platform-project-milestones-overview-page__table">
        <PlatformDataTable<ProjectMilestonesOverviewRow>
          rows={rows}
          columns={columns}
          getRowId={(row) => row.id}
          ariaLabel="Project milestones"
          className="platform-project-milestones-overview-table"
          surface="plain"
          layout="content"
          variant="minimalistic-ui"
          sticky={false}
          sorting={{
            defaultValue: { id: "updated", direction: "desc" },
          }}
          pagination={{
            defaultValue: { pageIndex: 0, pageSize: 20 },
          }}
          toolbar={{
            title: "All Milestones",
            search: {
              placeholder: "Search milestones",
              getSearchText: (row) =>
                row.searchText ||
                `${row.name} ${row.statusLabel} ${row.targetLabel}`,
            },
            primaryAction: {
              label: "Milestone",
              icon: Plus,
              onClick: onCreate,
            },
          }}
          loading={loading}
          error={error || undefined}
          emptyState={
            <PlatformEmptyState
              icon={Flag}
              title="No milestones yet"
              description="Create a milestone to group tickets around a measurable delivery target."
            />
          }
          noResultsState="No milestones match this search."
          onRowActivate={onOpen}
          getRowAriaLabel={(row) => `Open milestone ${row.name}`}
        />
      </section>
    </div>
  );
}
