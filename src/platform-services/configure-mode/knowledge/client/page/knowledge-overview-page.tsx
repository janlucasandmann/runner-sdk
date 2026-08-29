import { ChevronRight, LibraryBig, Plus, Trash2 } from "lucide-react";
import { useMemo } from "react";
import {
  createPlatformProjectIdentityFallback,
  getPlatformProjectReferenceFromKnowledgeMetadata,
  PlatformProjectIdentityIcon,
  type PlatformProjectIdentity,
} from "../../../../../platform-resources/projects/index.js";
import type {
  PlatformDataTableAction,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformLoadingState } from "../../../../../platform-ui/components/composite/loading-state/index.js";
import { PlatformPageHero } from "../../../../../platform-ui/components/composite/page-hero/index.js";
import {
  createResourceOverviewColumns,
  ResourceOverviewPage,
  ResourceOverviewValue,
} from "../../../../../platform-ui/pages/overview/index.js";
import type { KnowledgeLibrary } from "../domain/index.js";

export interface KnowledgeOverviewPageProps {
  libraries: readonly KnowledgeLibrary[];
  loading?: boolean;
  error?: string;
  controlsPortalId?: string;
  projectIdentitiesById?: Readonly<Record<string, PlatformProjectIdentity>>;
  onOpen: (library: KnowledgeLibrary) => void;
  onCreate: () => void;
  onDelete: (libraries: readonly KnowledgeLibrary[]) => void;
}

export function KnowledgeOverviewPage({
  libraries,
  loading = false,
  error = "",
  controlsPortalId,
  projectIdentitiesById = {},
  onOpen,
  onCreate,
  onDelete,
}: KnowledgeOverviewPageProps) {
  const columns = useMemo(() => createResourceOverviewColumns<KnowledgeLibrary>({
    name: {
      className: "knowledge-overview-identity",
      getVisual: (row) => {
        const projectReference = getPlatformProjectReferenceFromKnowledgeMetadata(row.metadata);
        const projectIdentity = projectReference
          ? projectIdentitiesById[projectReference.projectId]
            || createPlatformProjectIdentityFallback(projectReference)
          : null;
        return {
          icon: projectIdentity ? (
            <PlatformProjectIdentityIcon
              icon={projectIdentity.icon}
              size={16}
              strokeWidth={1.8}
            />
          ) : (
            <LibraryBig width={16} height={16} strokeWidth={1.8} />
          ),
          iconClassName: `is-skill${projectIdentity ? " is-project-linked" : ""}`,
          iconStyle: projectIdentity ? {
            "--knowledge-project-icon-color": projectIdentity.color,
          } : undefined,
        };
      },
    },
    extensions: {
      afterName: [{
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
      }],
    },
  }), [projectIdentitiesById]);

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
            onSelect: () => onDelete([library]),
            selectedRows: {
              label: "Delete selected",
              danger: true,
              onSelect: ({ rows: selectedRows }) => onDelete(selectedRows),
            },
          },
        ],
        onRowActivate: onOpen,
        getRowAriaLabel: (library) => library.name,
        loading,
        loadingState: (
          <PlatformLoadingState
            centered
            message="Loading Knowledge libraries…"
          />
        ),
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
