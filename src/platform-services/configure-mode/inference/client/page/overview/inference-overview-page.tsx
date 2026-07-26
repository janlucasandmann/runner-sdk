import { ChevronRight, CloudCog, HardDrive, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformLabel } from "../../../../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import {
  buildInferenceEndpointRows,
  type InferenceEndpointCollectionSnapshot,
  type InferenceEndpointRow,
  type InferenceLocalRunnersSnapshot,
} from "../inference-endpoint-model.js";
import {
  CreateInferenceEndpointModal,
  type CreateInferenceEndpointInput,
} from "./create-inference-endpoint-modal.js";
import { InferenceOverviewGuide } from "./inference-overview-guide.js";

export interface InferenceOverviewPageProps {
  endpoints: InferenceEndpointCollectionSnapshot;
  localRunners: InferenceLocalRunnersSnapshot;
  controlsPortalId?: string;
  canConfigure?: boolean;
  creatingEndpoint?: boolean;
  createError?: string;
  onPlanRequired?: () => void;
  onOpenEndpoint: (endpointId: string) => void;
  onConfigureEndpoint: (
    input: CreateInferenceEndpointInput,
  ) => boolean | void | Promise<boolean | void>;
}

export function InferenceOverviewPage({
  endpoints,
  localRunners,
  controlsPortalId,
  canConfigure = true,
  creatingEndpoint = false,
  createError = "",
  onPlanRequired,
  onOpenEndpoint,
  onConfigureEndpoint,
}: InferenceOverviewPageProps) {
  const [kindFilter, setKindFilter] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const rows = useMemo(
    () => buildInferenceEndpointRows(endpoints, localRunners),
    [endpoints, localRunners],
  );
  const filteredRows = useMemo(
    () => rows.filter((row) => kindFilter === "all" || row.kind === kindFilter),
    [kindFilter, rows],
  );
  const externalCount = rows.filter((row) => row.kind === "external").length;
  const localCount = rows.filter((row) => row.kind === "local").length;

  const columns = useMemo<PlatformDataTableColumn<InferenceEndpointRow>[]>(
    () => [
      {
        id: "endpoint",
        header: "Endpoint",
        accessor: "name",
        sortable: true,
        width: "minmax(250px, 1.25fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.name}
            icon={row.kind === "local" ? HardDrive : CloudCog}
            iconClassName="is-connection"
            size="compact"
          />
        ),
      },
      {
        id: "provider",
        header: "Provider",
        accessor: "providerLabel",
        sortable: true,
        width: "minmax(150px, 0.76fr)",
        cell: ({ row }) => <ResourceOverviewValue>{row.providerLabel}</ResourceOverviewValue>,
      },
      {
        id: "runtime",
        header: "Runtime",
        accessor: "runtimeLabel",
        sortable: true,
        width: "minmax(130px, 0.65fr)",
        hideBelow: 760,
        cell: ({ row }) => (
          <ResourceOverviewValue>
            {row.isDefault ? `${row.runtimeLabel} · Default` : row.runtimeLabel}
          </ResourceOverviewValue>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessor: "statusLabel",
        sortable: true,
        width: "minmax(130px, 0.62fr)",
        cell: ({ row }) => (
          <PlatformLabel variant={row.statusVariant}>{row.statusLabel}</PlatformLabel>
        ),
      },
      {
        id: "models",
        header: "Models",
        accessor: "modelCount",
        sortable: true,
        width: "minmax(95px, 0.46fr)",
        hideBelow: 900,
        cell: ({ row }) => <ResourceOverviewValue>{row.modelCount}</ResourceOverviewValue>,
      },
      {
        id: "checked",
        header: "Last Checked",
        accessor: "lastCheckedAt",
        sortable: true,
        sortDescFirst: true,
        width: "minmax(135px, 0.68fr)",
        hideBelow: 1080,
        cell: ({ row }) => <ResourceOverviewValue>{row.lastCheckedLabel}</ResourceOverviewValue>,
      },
    ],
    [],
  );

  const getRowActions = (
    row: InferenceEndpointRow,
  ): readonly PlatformDataTableAction<InferenceEndpointRow>[] => [
    {
      id: "open",
      label: row.readOnly ? "Inspect Endpoint" : "Manage Endpoint",
      icon: ChevronRight,
      onSelect: () => onOpenEndpoint(row.id),
    },
  ];

  const scrollToTable = () => {
    if (typeof document === "undefined") return;
    const table = document.querySelector(
      ".resource-overview-page.is-inference .resource-overview-page__table-section",
    );
    if (typeof table?.scrollIntoView === "function") {
      table.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const browseAll = () => {
    setKindFilter("all");
    scrollToTable();
  };

  const browseLocal = () => {
    setKindFilter("local");
    scrollToTable();
  };

  return (
    <>
      <ResourceOverviewPage<InferenceEndpointRow>
        heroContent={
          <InferenceOverviewGuide
            externalCount={externalCount}
            localCount={localCount}
            onConfigureExternal={() => setCreateModalOpen(true)}
            onBrowseAll={browseAll}
            onBrowseLocal={browseLocal}
          />
        }
        showPeriodSelector={false}
        controlsPortalId={controlsPortalId}
        className="is-inference"
        table={{
          rows: filteredRows,
          columns,
          getRowId: (row) => row.id,
          ariaLabel: "Inference endpoints",
          className: "resource-overview-table is-inference",
          sorting: { defaultValue: { id: "endpoint", direction: "asc" } },
          pagination: false,
          toolbar: {
            title: "All Endpoints",
            search: {
              placeholder: "Search endpoints",
              getSearchText: (row) => row.searchText,
            },
            filters: [{
              id: "runtime",
              label: "Runtime",
              value: kindFilter,
              onChange: setKindFilter,
              options: [
                { id: "all", label: "All Endpoints" },
                { id: "external", label: "External Endpoints" },
                { id: "local", label: "Local Endpoints" },
              ],
            }],
            primaryAction: {
              label: "New Endpoint",
              icon: Plus,
              onClick: () => {
                if (!canConfigure) {
                  onPlanRequired?.();
                  return;
                }
                setCreateModalOpen(true);
              },
            },
          },
          getRowActions,
          onRowActivate: (row) => onOpenEndpoint(row.id),
          getRowAriaLabel: (row) => row.name,
          loading: localRunners.status === "loading" && rows.length === 0,
          error: rows.length === 0 && localRunners.status === "error"
            ? localRunners.error || "Inference endpoints could not be loaded."
            : undefined,
          emptyState: "No inference endpoints yet.",
          noResultsState: "No endpoints match this view.",
        }}
      />

      <CreateInferenceEndpointModal
        open={createModalOpen}
        submitting={creatingEndpoint}
        error={createError}
        existingEndpointCount={externalCount}
        onClose={() => setCreateModalOpen(false)}
        onSubmit={onConfigureEndpoint}
      />
    </>
  );
}
