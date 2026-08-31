import { ChevronRight, Plus, ShieldCheck, SquarePen, Trash2 } from "../../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { GuardrailsOverviewGuide } from "./guardrails-overview-guide.js";

export interface GuardrailOverviewRow {
  id: string;
  name: string;
  description: string;
  type: "default" | "custom";
  typeLabel: string;
  creatorName: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  updatedAt: number;
  searchText?: string;
}

export interface GuardrailsOverviewPageProps {
  rows: readonly GuardrailOverviewRow[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (row: GuardrailOverviewRow) => void;
  onCreate: () => void;
  onRename: (row: GuardrailOverviewRow) => void;
  onDelete: (rows: readonly GuardrailOverviewRow[]) => void;
}

export function GuardrailsOverviewPage({
  rows,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onRename,
  onDelete,
}: GuardrailsOverviewPageProps) {
  const columns = useMemo(
    () => createResourceOverviewColumns<GuardrailOverviewRow>({
      name: {
        getVisual: () => ({
          icon: <ShieldCheck width={16} height={16} strokeWidth={1.8} />,
          iconClassName: "is-guardrail",
        }),
      },
    }),
    [],
  );

  const getRowActions = (
    row: GuardrailOverviewRow,
    state: { targetRows: readonly GuardrailOverviewRow[] },
  ): readonly PlatformDataTableAction<GuardrailOverviewRow>[] => [
    { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(row) },
    {
      id: "rename",
      label: "Rename",
      icon: SquarePen,
      hidden: row.type === "default",
      onSelect: () => onRename(row),
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      hidden: row.type === "default",
      danger: true,
      separatorBefore: true,
      onSelect: () => onDelete([row]),
      selectedRows: {
        label: "Delete selected",
        danger: true,
        hidden: !state.targetRows.some((target) => target.type !== "default"),
        onSelect: ({ rows: selectedRows }) =>
          onDelete(selectedRows.filter((target) => target.type !== "default")),
      },
    },
  ];

  return (
    <ResourceOverviewPage<GuardrailOverviewRow>
      heroContent={<GuardrailsOverviewGuide />}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-guardrails"
      table={{
        rows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Guardrail sets",
        className: "resource-overview-table is-guardrails",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search guardrails",
            getSearchText: (row) =>
              row.searchText ||
              `${row.name} ${row.description} ${row.typeLabel} ${row.creatorName}`,
          },
          primaryAction: { label: "New Set", icon: Plus, onClick: onCreate },
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: "No guardrails yet.",
        noResultsState: "No guardrails match this view.",
      }}
    />
  );
}
