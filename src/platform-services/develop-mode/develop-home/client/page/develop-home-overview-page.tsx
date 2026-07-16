import {
  BookOpen,
  ChartNoAxesColumnIncreasing,
  Coins,
  Copy,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import type {
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformPopup } from "../../../../../platform-ui/components/composite/popup/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewMenuButton,
  ResourceOverviewPage,
  ResourceOverviewStatus,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../../../platform-ui/pages/overview/index.js";

export interface DevelopHomeResourceRow {
  id: string;
  kind: string;
  label: string;
  description: string;
  icon: LucideIcon;
  resourceCount: number;
  resourceCountLabel: string;
  operationCount: number;
  operationCountLabel: string;
  searchText: string;
}

export interface DevelopHomeQuickstartLanguage {
  id: string;
  label: string;
  lines: readonly string[];
}

export interface DevelopHomeConceptCard {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  onClick: () => void;
}

export interface DevelopHomeQuickLink {
  id: string;
  label: string;
  icon: LucideIcon;
  onClick: () => void;
}

export interface DevelopHomeSupplementaryContent {
  quickstartLanguages: readonly DevelopHomeQuickstartLanguage[];
  activeQuickstartLanguageId: string;
  onQuickstartLanguageChange: (languageId: string) => void;
  onOpenQuickstart: () => void;
  concepts: readonly DevelopHomeConceptCard[];
  onOpenAllConcepts: () => void;
  usageValue: string;
  resourceCountLabel: string;
  apiKeyCountLabel: string;
  onOpenUsage: () => void;
  onCreateApiKey: () => void;
  onOpenResources: () => void;
  onOpenApiKeys: () => void;
  quickLinks: readonly DevelopHomeQuickLink[];
}

export interface DevelopHomeOverviewPageProps {
  rows: readonly DevelopHomeResourceRow[];
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics: ResourceOverviewAnalyticsModel;
  controlsPortalId?: string;
  loading?: boolean;
  supplementaryContent?: DevelopHomeSupplementaryContent;
  onOpen: (row: DevelopHomeResourceRow) => void;
  onShowUsage: () => void;
  onOpenPricing: () => void;
  onOpenDocumentation: () => void;
}

function renderDevelopCodeTokens(line: string): ReactNode {
  const parts: ReactNode[] = [];
  const pattern = /('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|\b(?:import|from|const|new|await|lambda|print)\b|\b(?:ComputerAgentsClient|client|result)\b|\b(?:run|onEvent|on_event|console|log|content|event|type)\b)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(line))) {
    if (match.index > cursor) parts.push(line.slice(cursor, match.index));
    const token = match[0];
    const tokenClass = token.startsWith("'") || token.startsWith("\"")
      ? "is-string"
      : /^(import|from|const|new|await|lambda|print)$/.test(token)
        ? "is-keyword"
        : /^(run|onEvent|on_event|console|log|content|event|type)$/.test(token)
          ? "is-property"
          : "is-identifier";
    parts.push(<span key={`${match.index}:${token}`} className={`playground-develop-docs-code-token ${tokenClass}`}>{token}</span>);
    cursor = match.index + token.length;
  }

  if (cursor < line.length) parts.push(line.slice(cursor));
  return parts.length ? parts : "\u00a0";
}

function DevelopHomeSupplementarySections({
  content,
}: {
  content: DevelopHomeSupplementaryContent;
}) {
  const activeLanguage = content.quickstartLanguages.find((language) => (
    language.id === content.activeQuickstartLanguageId
  )) || content.quickstartLanguages[0];
  const quickstartLines = activeLanguage?.lines || [];
  const handleCopyQuickstart = () => {
    try {
      void navigator.clipboard?.writeText(quickstartLines.join("\n"));
    } catch {
      // Clipboard access is optional in embedded and non-secure contexts.
    }
  };

  return (
    <div className="develop-home-overview__supplementary">
      <section className="playground-develop-docs-quickstart-card">
        <div className="playground-develop-docs-quickstart-inner">
          <div>
            <h2 className="playground-develop-docs-quickstart-title">Developer quickstart</h2>
            <p className="playground-develop-docs-quickstart-text">
              Start ACP in minutes. Create a project, get a computer, run a thread, and ship your first working workflow.
            </p>
            <button type="button" className="playground-develop-docs-quickstart-button" onClick={content.onOpenQuickstart}>
              Get started
            </button>
          </div>
          <div className="playground-develop-docs-code-card">
            <div className="playground-develop-docs-code-toolbar">
              <div className="playground-develop-docs-code-tabs">
                {content.quickstartLanguages.map((language) => (
                  <button
                    key={language.id}
                    type="button"
                    className={`playground-develop-docs-code-tab${activeLanguage?.id === language.id ? " is-active" : ""}`}
                    onClick={() => content.onQuickstartLanguageChange(language.id)}
                  >
                    {language.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="playground-develop-docs-code-copy"
                aria-label="Copy quickstart code"
                title="Copy quickstart code"
                onClick={handleCopyQuickstart}
              >
                <Copy width={16} height={16} strokeWidth={1.9} />
              </button>
            </div>
            <pre className="playground-develop-docs-code-body">
              {quickstartLines.map((line, index) => (
                <span key={`${index}:${line}`} className="playground-develop-docs-code-line">
                  <span className="playground-develop-docs-code-line-number">{index + 1}</span>
                  <span>{renderDevelopCodeTokens(line)}</span>
                </span>
              ))}
            </pre>
          </div>
        </div>
      </section>

      <section className="playground-develop-docs-concepts">
        <div className="playground-develop-docs-concepts-header">
          <div>
            <h2 className="playground-develop-docs-concepts-title">Core concepts</h2>
            <p className="playground-develop-docs-concepts-copy">
              Understand the primitives that define how ACP organizes work, persists state, and executes actions.
            </p>
          </div>
          <button type="button" className="playground-develop-docs-concepts-view-all" onClick={content.onOpenAllConcepts}>
            View all
          </button>
        </div>
        <div className="playground-develop-docs-concepts-grid">
          {content.concepts.map((concept) => (
            <button
              key={concept.id}
              type="button"
              className="playground-develop-docs-concept-card"
              onClick={concept.onClick}
            >
              <div
                className="playground-develop-docs-concept-art"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.06), rgba(0,0,0,0.18)), url(${concept.imageUrl})`,
                }}
              />
              <div className="playground-develop-docs-concept-copy">
                <div className="playground-develop-docs-concept-title">{concept.title}</div>
                <div className="playground-develop-docs-concept-description">{concept.description}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="playground-develop-bottom-grid">
        <section className="playground-develop-section">
          <h2 className="playground-develop-section-title">Usage</h2>
          <div className="playground-develop-usage-card">
            <div className="playground-develop-usage-top">
              <div>
                <div className="playground-develop-usage-label">Current period</div>
                <div className="playground-develop-usage-value">{content.usageValue}</div>
              </div>
              <button
                type="button"
                className="playground-develop-usage-icon"
                onClick={content.onOpenUsage}
                aria-label="Open usage details"
              >
                <ChartNoAxesColumnIncreasing width={20} height={20} strokeWidth={1.8} />
              </button>
            </div>
            <div className="playground-develop-usage-actions">
              <PlatformPrimaryButton
                type="button"
                className="playground-develop-secondary-button is-primary"
                onClick={content.onCreateApiKey}
              >
                <Plus width={14} height={14} strokeWidth={1.8} />
                Create API Key
              </PlatformPrimaryButton>
              <PlatformSecondaryButton
                type="button"
                className="playground-develop-secondary-button"
                onClick={content.onOpenResources}
              >
                {content.resourceCountLabel}
              </PlatformSecondaryButton>
              <PlatformSecondaryButton
                type="button"
                className="playground-develop-secondary-button"
                onClick={content.onOpenApiKeys}
              >
                {content.apiKeyCountLabel}
              </PlatformSecondaryButton>
            </div>
          </div>
        </section>
        <section className="playground-develop-section">
          <h2 className="playground-develop-section-title">Quick Links</h2>
          <div className="playground-develop-quick-links">
            {content.quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <button key={link.id} type="button" className="playground-develop-quick-link" onClick={link.onClick}>
                  <Icon className="playground-develop-quick-link-icon" strokeWidth={1.8} />
                  <span className="playground-develop-quick-link-label">{link.label}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

export function DevelopHomeOverviewPage({
  rows,
  period,
  onPeriodChange,
  analytics,
  controlsPortalId = "",
  loading = false,
  supplementaryContent,
  onOpen,
  onShowUsage,
  onOpenPricing,
  onOpenDocumentation,
}: DevelopHomeOverviewPageProps) {
  const [usageFilter, setUsageFilter] = useState("all");
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const headerMenuRef = useRef<HTMLDivElement | null>(null);
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (usageFilter === "active") return row.resourceCount > 0;
    if (usageFilter === "empty") return row.resourceCount === 0;
    return true;
  }), [rows, usageFilter]);

  useEffect(() => {
    if (!headerMenuOpen) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (!headerMenuRef.current?.contains(event.target as Node)) setHeaderMenuOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setHeaderMenuOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [headerMenuOpen]);

  const columns = useMemo<PlatformDataTableColumn<DevelopHomeResourceRow>[]>(() => [
    {
      id: "resource",
      header: "Resource",
      accessor: "label",
      sortable: true,
      width: "minmax(260px, 1.5fr)",
      cell: ({ row }) => (
        <ResourceOverviewIdentityCell
          title={row.label}
          icon={row.icon}
          iconClassName="is-develop-resource"
        />
      ),
    },
    {
      id: "description",
      header: "Purpose",
      accessor: "description",
      width: "minmax(240px, 1.35fr)",
      hideBelow: 760,
      cell: ({ row }) => <ResourceOverviewValue>{row.description}</ResourceOverviewValue>,
    },
    {
      id: "resources",
      header: "Resources",
      accessor: "resourceCount",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(110px, 0.55fr)",
      cell: ({ row }) => <ResourceOverviewValue>{row.resourceCountLabel}</ResourceOverviewValue>,
    },
    {
      id: "operations",
      header: "Operations",
      accessor: "operationCount",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.6fr)",
      hideBelow: 920,
      cell: ({ row }) => <ResourceOverviewValue>{row.operationCountLabel}</ResourceOverviewValue>,
    },
    {
      id: "status",
      header: "Status",
      accessor: (row) => row.resourceCount > 0 ? 1 : 0,
      sortable: true,
      width: "minmax(110px, 0.5fr)",
      hideBelow: 1080,
      cell: ({ row }) => (
        <ResourceOverviewStatus
          active={row.resourceCount > 0}
          activeLabel="In use"
          inactiveLabel="Not in use"
        />
      ),
    },
  ], []);

  const headerActions = (
    <PlatformPopup
      open={headerMenuOpen}
      variant="minimal"
      rootRef={headerMenuRef}
      rootClassName="playground-tasks-toolbar-popup-shell develop-home-overview__header-menu"
      surfaceClassName="playground-tasks-toolbar-popup-menu develop-home-overview__header-menu-surface"
      surfaceProps={{ role: "menu", "aria-label": "Develop options" }}
      animation="down-in"
      trigger={(
        <ResourceOverviewMenuButton
          label="Develop options"
          expanded={headerMenuOpen}
          onClick={() => setHeaderMenuOpen((current) => !current)}
        />
      )}
    >
      <button
        type="button"
        role="menuitem"
        className="tb-popup-row"
        onClick={() => {
          setHeaderMenuOpen(false);
          onShowUsage();
        }}
      >
        <ChartNoAxesColumnIncreasing className="tb-popup-icon" width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        <span>Show Usage</span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="tb-popup-row"
        onClick={() => {
          setHeaderMenuOpen(false);
          onOpenPricing();
        }}
      >
        <Coins className="tb-popup-icon" width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        <span>API Pricing</span>
      </button>
      <button
        type="button"
        role="menuitem"
        className="tb-popup-row"
        onClick={() => {
          setHeaderMenuOpen(false);
          onOpenDocumentation();
        }}
      >
        <BookOpen className="tb-popup-icon" width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        <span>Documentation</span>
      </button>
    </PlatformPopup>
  );

  return (
    <ResourceOverviewPage<DevelopHomeResourceRow>
      period={period}
      onPeriodChange={onPeriodChange}
      heroContent={(
        <div className="develop-home-overview__content">
          <PlatformAnalyticsSection analytics={analytics} chartType="line" />
          {supplementaryContent ? <DevelopHomeSupplementarySections content={supplementaryContent} /> : null}
        </div>
      )}
      controlsPortalId={controlsPortalId}
      headerActions={headerActions}
      className="is-develop-home"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Develop resources",
        className: "resource-overview-table is-develop-home",
        sorting: { defaultValue: { id: "resource", direction: "asc" } },
        toolbar: {
          title: "All Resources",
          search: {
            placeholder: "Search resources",
            getSearchText: (row) => row.searchText,
          },
          filters: [{
            id: "usage",
            label: "Status",
            value: usageFilter,
            onChange: setUsageFilter,
            options: [
              { id: "all", label: "All resources" },
              { id: "active", label: "In use" },
              { id: "empty", label: "Not in use" },
            ],
          }],
        },
        onRowActivate: onOpen,
        getRowAriaLabel: (row) => row.label,
        loading,
        emptyState: "No Develop resources are available.",
        noResultsState: "No matching Develop resources found.",
      }}
    />
  );
}
