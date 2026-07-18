import { ChevronRight, Plus, ShieldCheck, SquarePen, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { GuardrailsOverviewGuide } from "./guardrails-overview-guide.js";

export interface GuardrailOverviewRow {
  id: string;
  name: string;
  type: "default" | "custom";
  typeLabel: string;
  creatorLabel: string;
  creatorAvatarUrl?: string;
  creatorFallback?: string;
  updatedAt: number;
  updatedLabel: string;
  updatedTitle?: string;
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
  onDelete: (row: GuardrailOverviewRow) => void;
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
  const [typeFilter, setTypeFilter] = useState("all");
  const filteredRows = useMemo(
    () => rows.filter((row) => typeFilter === "all" || row.type === typeFilter),
    [rows, typeFilter],
  );

  const columns = useMemo<PlatformDataTableColumn<GuardrailOverviewRow>[]>(
    () => [
      {
        id: "name",
        header: "Set",
        accessor: "name",
        sortable: true,
        width: "minmax(230px, 1.3fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={ShieldCheck}
            iconClassName="is-connection"
            size="compact"
          />
        ),
      },
      {
        id: "type",
        header: "Type",
        accessor: "typeLabel",
        sortable: true,
        width: "minmax(105px, 0.56fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.typeLabel}</ResourceOverviewValue>,
      },
      {
        id: "creator",
        header: "Creator",
        accessor: "creatorLabel",
        sortable: true,
        width: "minmax(170px, 0.85fr)",
        hideBelow: 760,
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.creatorLabel}
            imageUrl={row.creatorAvatarUrl}
            fallback={row.creatorFallback}
            iconClassName="is-creator"
            size="compact"
          />
        ),
      },
      {
        id: "updated",
        header: "Updated",
        accessor: "updatedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(120px, 0.62fr)",
        hideBelow: 900,
        cell: ({ row }) => (
          <ResourceOverviewValue title={row.updatedTitle}>{row.updatedLabel}</ResourceOverviewValue>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: GuardrailOverviewRow,
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
      onSelect: () => onDelete(row),
    },
  ];

  const scrollToTable = () => {
    if (typeof document === "undefined") return;
    document
      .querySelector(".resource-overview-page.is-guardrails .resource-overview-page__table-section")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const showDefaultSets = () => {
    setTypeFilter("default");
    scrollToTable();
  };

  return (
    <ResourceOverviewPage<GuardrailOverviewRow>
      heroContent={
        <GuardrailsOverviewGuide
          guardrailCount={rows.length}
          onCreate={onCreate}
          onBrowse={scrollToTable}
          onShowDefaults={showDefaultSets}
        />
      }
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-guardrails"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Guardrail sets",
        className: "resource-overview-table is-guardrails",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (row) => `Select ${row.name}` },
        pagination: false,
        toolbar: {
          title: "All Guardrails",
          search: {
            placeholder: "Search guardrails",
            getSearchText: (row) =>
              row.searchText ||
              `${row.name} ${row.typeLabel} ${row.creatorLabel} ${row.updatedLabel}`,
          },
          filters: [
            {
              id: "type",
              label: "Type",
              value: typeFilter,
              onChange: setTypeFilter,
              options: [
                { id: "all", label: "All Sets" },
                { id: "default", label: "Default Sets" },
                { id: "custom", label: "Custom Sets" },
              ],
            },
          ],
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
