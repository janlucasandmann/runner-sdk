import {
  Braces,
  ChevronRight,
  Clapperboard,
  Database,
  FolderOpen,
  Layers,
  Metronome,
  Monitor,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
  PlatformDataTableFilterOption,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../../platform-ui/pages/overview/index.js";
import { MarketplaceOverviewGuide } from "./marketplace-overview-guide.js";

export interface MarketplaceTemplateTypeOption {
  id: string;
  label: string;
}

export interface MarketplaceOverviewRow {
  id: string;
  title: string;
  type: string;
  typeLabel?: string;
  featured?: boolean;
  summary?: string;
  description?: string;
  difficulty?: string;
  estimatedSetup?: string;
  capabilities?: readonly string[];
  workflowSteps?: readonly string[];
  outputs?: readonly string[];
  [key: string]: unknown;
}

export interface MarketplaceOverviewPageProps {
  rows: readonly MarketplaceOverviewRow[];
  types: readonly MarketplaceTemplateTypeOption[];
  controlsPortalId?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onOpen: (row: MarketplaceOverviewRow) => void;
  onPublish: (row: MarketplaceOverviewRow) => void;
  notice?: string;
}

function getMarketplaceTemplateIcon(type: string): LucideIcon {
  if (type === "metronome") return Metronome;
  if (type === "file") return FolderOpen;
  if (type === "web_app") return Monitor;
  if (type === "function") return Braces;
  if (type === "database") return Database;
  if (type === "imagine") return Clapperboard;
  return Layers;
}

function getMarketplaceSearchText(row: MarketplaceOverviewRow): string {
  return [
    row.title,
    row.summary,
    row.description,
    row.typeLabel,
    row.type,
    row.difficulty,
    row.estimatedSetup,
    ...(row.capabilities || []),
  ].filter(Boolean).join(" ");
}

export function MarketplaceOverviewPage({
  rows,
  types,
  controlsPortalId,
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  onOpen,
  onPublish,
  notice = "",
}: MarketplaceOverviewPageProps) {
  const filterOptions = useMemo<readonly PlatformDataTableFilterOption[]>(() => {
    const normalizedTypes = types
      .map((type) => ({
        id: String(type.id || "").trim(),
        label: String(type.label || type.id || "").trim(),
      }))
      .filter((type) => type.id && type.id !== "featured");
    const allOption = normalizedTypes.find((type) => type.id === "all") || {
      id: "all",
      label: "All templates",
    };
    const categoryOptions = normalizedTypes.filter((type) => type.id !== "all");
    return [
      allOption,
      { id: "featured", label: "Featured resources" },
      ...categoryOptions,
    ];
  }, [types]);

  const filteredRows = useMemo(() => {
    const normalizedFilter = String(filterValue || "all").trim() || "all";
    const normalizedSearch = String(searchValue || "").trim().toLowerCase();
    return rows.filter((row) => {
      const matchesFilter = normalizedFilter === "all"
        || (normalizedFilter === "featured" ? Boolean(row.featured) : row.type === normalizedFilter);
      if (!matchesFilter) return false;
      return !normalizedSearch
        || getMarketplaceSearchText(row).toLowerCase().includes(normalizedSearch);
    });
  }, [filterValue, rows, searchValue]);

  const columns = useMemo<PlatformDataTableColumn<MarketplaceOverviewRow>[]>(
    () => [
      {
        id: "resource",
        header: "Resource",
        accessor: "title",
        sortable: true,
        width: "minmax(260px, 1.45fr)",
        cell: ({ row }) => (
          <ResourceOverviewIdentityCell
            title={row.title || "Untitled template"}
            icon={getMarketplaceTemplateIcon(row.type)}
            iconClassName="is-connection"
            size="compact"
          />
        ),
      },
      {
        id: "category",
        header: "Category",
        accessor: (row) => row.typeLabel || row.type || "Template",
        sortable: true,
        width: "minmax(140px, 0.72fr)",
        cell: ({ row }) => (
          <ResourceOverviewValue>{row.typeLabel || row.type || "Template"}</ResourceOverviewValue>
        ),
      },
      {
        id: "difficulty",
        header: "Difficulty",
        accessor: (row) => row.difficulty || "Standard",
        sortable: true,
        width: "minmax(120px, 0.62fr)",
        hideBelow: 760,
        cell: ({ row }) => (
          <ResourceOverviewValue>{row.difficulty || "Standard"}</ResourceOverviewValue>
        ),
      },
      {
        id: "setup",
        header: "Setup",
        accessor: (row) => row.estimatedSetup || "5 min",
        sortable: true,
        width: "minmax(110px, 0.56fr)",
        hideBelow: 900,
        cell: ({ row }) => (
          <ResourceOverviewValue>{row.estimatedSetup || "5 min"}</ResourceOverviewValue>
        ),
      },
    ],
    [],
  );

  const getRowActions = (
    row: MarketplaceOverviewRow,
  ): readonly PlatformDataTableAction<MarketplaceOverviewRow>[] => [
    { id: "open", label: "Open Preview", icon: ChevronRight, onSelect: () => onOpen(row) },
    { id: "publish", label: "Publish", icon: Plus, onSelect: () => onPublish(row) },
  ];

  const scrollToTable = () => {
    if (typeof document === "undefined") return;
    const tableSection = document.querySelector(
      ".resource-overview-page.is-marketplace .resource-overview-page__table-section",
    );
    if (typeof tableSection?.scrollIntoView === "function") {
      tableSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const browseResources = () => {
    onFilterChange("all");
    scrollToTable();
  };

  const browseFeaturedResources = () => {
    onFilterChange("featured");
    scrollToTable();
  };

  return (
    <ResourceOverviewPage<MarketplaceOverviewRow>
      heroContent={
        <MarketplaceOverviewGuide
          resourceCount={rows.length}
          featuredCount={rows.filter((row) => row.featured).length}
          onBrowse={browseResources}
          onBrowseFeatured={browseFeaturedResources}
        />
      }
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-marketplace"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Marketplace resources",
        className: "resource-overview-table is-marketplace",
        sorting: { defaultValue: { id: "resource", direction: "asc" } },
        pagination: false,
        toolbar: {
          title: "All Resources",
          leading: notice
            ? <span className="marketplace-overview__notice" role="status">{notice}</span>
            : undefined,
          search: {
            value: searchValue,
            onChange: onSearchChange,
            placeholder: "Search resources",
            manual: true,
          },
          filters: [{
            id: "resource-type",
            label: "Type",
            value: filterValue,
            onChange: onFilterChange,
            options: filterOptions,
          }],
        },
        getRowActions,
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.title,
        emptyState: "No marketplace resources yet.",
        noResultsState: "No resources match this view.",
      }}
    />
  );
}
