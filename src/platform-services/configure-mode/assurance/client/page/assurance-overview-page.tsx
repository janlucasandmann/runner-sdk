import { ChevronRight, Plus, ShieldCheck } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
} from "../../../../../platform-ui/pages/overview/index.js";
import { AssuranceOverviewGuide } from "./assurance-overview-guide.js";

export interface AssurancePolicyOverviewRow {
  id: string;
  name: string;
  description: string;
  projectLabel: string;
  gateCount: number;
  runCount: number;
  passedRunCount: number;
  blockedRunCount: number;
  lastRunStatus: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  updatedAt: number;
  searchText?: string;
}

interface AssuranceOverviewPageProps {
  rows: readonly AssurancePolicyOverviewRow[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (row: AssurancePolicyOverviewRow) => void;
  onCreate: () => void;
}

export function AssuranceOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
}: AssuranceOverviewPageProps) {
  const columns = useMemo(
    () => createResourceOverviewColumns<AssurancePolicyOverviewRow>({
      name: {
        getVisual: () => ({
          icon: <ShieldCheck width={16} height={16} strokeWidth={1.8} />,
          iconClassName: "is-assurance",
        }),
      },
    }),
    [],
  );
  const actions = (
    row: AssurancePolicyOverviewRow,
  ): readonly PlatformDataTableAction<AssurancePolicyOverviewRow>[] => [
    {
      id: "open",
      label: "Open",
      icon: ChevronRight,
      onSelect: () => onOpen(row),
    },
  ];
  return (
    <ResourceOverviewPage<AssurancePolicyOverviewRow>
      heroContent={<AssuranceOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-assurance"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Assurance Policies",
        className: "resource-overview-table is-assurance",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search Assurance Policies",
            getSearchText: (row) => row.searchText || `${row.name} ${row.projectLabel}`,
          },
          primaryAction: {
            label: "Assurance Policy",
            icon: Plus,
            onClick: onCreate,
          },
        },
        getRowActions: actions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={ShieldCheck}
            title="No Assurance Policies yet"
            description="Create an evidence-bound release policy for a project or autonomous delivery workflow."
            primaryAction={{ label: "Create Assurance Policy", onClick: onCreate }}
          />
        ),
        noResultsState: "No Assurance Policies match this view.",
      }}
    />
  );
}
