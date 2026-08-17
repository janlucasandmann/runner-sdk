import { ChevronRight, LibraryBig, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import type { KnowledgeLibrary } from "../domain/index.js";

export interface KnowledgeOverviewPageProps {
  libraries: readonly KnowledgeLibrary[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  onOpen: (library: KnowledgeLibrary) => void;
  onCreate: () => void;
  onDelete: (library: KnowledgeLibrary) => void;
}

function formatTimestamp(value: string) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(timestamp));
}

function getCreatorFallback(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

export function KnowledgeOverviewPage({
  libraries,
  loading = false,
  error = "",
  controlsPortalId,
  onOpen,
  onCreate,
  onDelete,
}: KnowledgeOverviewPageProps) {
  const columns = useMemo<PlatformDataTableColumn<KnowledgeLibrary>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(320px, 1.5fr)",
      cell: ({ row }) => (
        <div className="resource-overview-identity is-catalog knowledge-overview-identity">
          <span className="resource-overview-identity__visual is-skill" aria-hidden="true">
            <LibraryBig width={16} height={16} strokeWidth={1.8} />
          </span>
          <span className="resource-overview-identity__copy">
            <span className="resource-overview-identity__title">{row.name}</span>
            {row.description ? (
              <span className="resource-overview-identity__description">{row.description}</span>
            ) : null}
          </span>
        </div>
      ),
    },
    {
      id: "documents",
      header: "Documents",
      accessor: (row) => row.documents?.filter((document) => !document.archived).length || 0,
      sortable: true,
      width: "minmax(110px, 0.45fr)",
      cell: ({ row }) => (
        <ResourceOverviewValue>
          {row.documents?.filter((document) => !document.archived).length ?? "—"}
        </ResourceOverviewValue>
      ),
    },
    {
      id: "creator",
      header: "Creator",
      accessor: "creatorName",
      sortable: true,
      width: "minmax(160px, 0.65fr)",
      cell: ({ row }) => {
        const creatorName = row.creatorName || "Unknown";
        return (
          <ResourceOverviewIdentityCell
            title={creatorName}
            imageUrl={row.creatorAvatarUrl || undefined}
            fallback={getCreatorFallback(creatorName)}
            iconClassName="is-creator"
          />
        );
      },
    },
    {
      id: "updated",
      header: "Updated",
      accessor: "updatedAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(140px, 0.55fr)",
      cell: ({ row }) => <ResourceOverviewValue>{formatTimestamp(row.updatedAt)}</ResourceOverviewValue>,
    },
  ], []);

  return (
    <ResourceOverviewPage<KnowledgeLibrary>
      heroContent={(
        <section
          className="skills-overview-guide knowledge-overview-guide"
          aria-label="Get started with Knowledge"
        >
          <PlatformPageHero
            className="skills-overview-guide__hero knowledge-overview-guide__hero"
            title="Create reusable knowledge"
          />
        </section>
      )}
      showPeriodSelector={false}
      controlsPortalId={controlsPortalId}
      className="is-skills is-prompts is-knowledge"
      table={{
        rows: libraries,
        columns,
        getRowId: (library) => library.id,
        ariaLabel: "Knowledge libraries",
        className: "resource-overview-table is-skills is-prompts is-knowledge",
        variant: "catalog-ui",
        sorting: { defaultValue: { id: "updated", direction: "desc" } },
        selection: { enabled: true, ariaLabel: (library) => `Select ${library.name}` },
        pagination: false,
        toolbar: {
          search: {
            placeholder: "Search knowledge libraries",
            getSearchText: (library) => `${library.name} ${library.description} ${library.creatorName}`,
          },
          primaryAction: { label: "New Library", icon: Plus, onClick: onCreate },
        },
        getRowActions: (library): readonly PlatformDataTableAction<KnowledgeLibrary>[] => [
          { id: "open", label: "Open", icon: ChevronRight, onSelect: () => onOpen(library) },
          {
            id: "delete",
            label: "Delete",
            icon: Trash2,
            danger: true,
            separatorBefore: true,
            onSelect: () => onDelete(library),
          },
        ],
        onRowActivate: onOpen,
        getRowAriaLabel: (library) => library.name,
        loading,
        error: error || undefined,
        emptyState: (
          <PlatformEmptyState
            icon={LibraryBig}
            title="No knowledge libraries available."
            description="Create a versioned source of truth that people and agents can read, search, and improve over time."
            primaryAction={{ label: "Create library", icon: Plus, onClick: onCreate }}
          />
        ),
        noResultsState: "No Knowledge libraries match this view.",
      }}
    />
  );
}
