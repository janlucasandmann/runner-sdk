import {
  Check,
  Copy,
  Eye,
  KeyRound,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import { PlatformEmptyState } from "../../../../../platform-ui/components/composite/empty-state/index.js";
import {
  PlatformLabel,
  type PlatformLabelVariant,
} from "../../../../../platform-ui/components/ui/label/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
  ResourceOverviewValue,
  type ResourceOverviewAnalyticsModel,
  type ResourceOverviewPeriod,
} from "../../../../../platform-ui/pages/overview/index.js";
import type {
  DevelopApiKeyCreatedNotice,
  DevelopApiKeyOverviewRow,
} from "../domain/index.js";

export interface DevelopApiKeysOverviewPageProps {
  rows: readonly DevelopApiKeyOverviewRow[];
  controlsPortalId?: string;
  loading?: boolean;
  error?: string;
  revokingKeyId?: string;
  createdNotice?: DevelopApiKeyCreatedNotice | null;
  period: ResourceOverviewPeriod;
  onPeriodChange: (period: ResourceOverviewPeriod) => void;
  analytics: ResourceOverviewAnalyticsModel;
  onCreate: () => void;
  onReveal: (row: DevelopApiKeyOverviewRow) => void | Promise<void>;
  onDelete: (rows: readonly DevelopApiKeyOverviewRow[]) => void | Promise<void>;
}

const API_KEYS_TABLE_EMPTY_STATE = (
  <PlatformEmptyState
    icon={KeyRound}
    title="No API keys yet"
    description="Create an API key to authenticate SDK and API requests."
  />
);

const API_KEYS_ANALYTICS_EMPTY_STATE = (
  <PlatformEmptyState
    icon={KeyRound}
    title="No API activity yet"
    description="Authenticated API requests will appear here once your keys are used."
  />
);

function getApiKeyPermissionLabelVariant(permissionLabel: string): PlatformLabelVariant {
  switch (permissionLabel.trim().toLowerCase()) {
    case "full access":
      return "green";
    case "execute only":
      return "blue";
    case "read only":
      return "yellow";
    default:
      return "gray";
  }
}

function ApiKeyCreatedNotice({
  notice,
}: {
  notice: DevelopApiKeyCreatedNotice;
}) {
  return (
    <section className="playground-settings-created-key-notice playground-develop-api-keys-created-notice" role="status">
      <div className="playground-settings-created-key-row">
        <div style={{ minWidth: 0, flex: "1 1 auto" }}>
          <p className="playground-settings-created-key-title">API Key Created Successfully</p>
          <p className="playground-settings-created-key-copy">
            Copy this key now or view it again from the API keys table.
          </p>
          <div className="playground-settings-code-row">
            <code className="playground-settings-code">{notice.keyValue}</code>
            <button
              type="button"
              className="playground-settings-icon-button"
              onClick={notice.onCopy}
              title="Copy to clipboard"
              aria-label="Copy newly created API key"
            >
              {notice.copied
                ? <Check width={14} height={14} strokeWidth={1.8} />
                : <Copy width={14} height={14} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
        <button
          type="button"
          className="playground-settings-icon-button"
          onClick={notice.onDismiss}
          aria-label="Dismiss created API key"
        >
          <X width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

export function DevelopApiKeysOverviewPage({
  rows,
  controlsPortalId = "",
  loading = false,
  error = "",
  revokingKeyId = "",
  createdNotice = null,
  period,
  onPeriodChange,
  analytics,
  onCreate,
  onReveal,
  onDelete,
}: DevelopApiKeysOverviewPageProps) {
  const [kindFilter, setKindFilter] = useState("all");
  const activeRows = useMemo(() => rows.filter((row) => {
    if (kindFilter === "standard") return row.isStandard;
    if (kindFilter === "scoped") return !row.isStandard;
    return true;
  }), [kindFilter, rows]);
  const analyticsWithEmptyState = useMemo<ResourceOverviewAnalyticsModel>(() => ({
    ...analytics,
    emptyState: API_KEYS_ANALYTICS_EMPTY_STATE,
  }), [analytics]);
  const columns = useMemo<PlatformDataTableColumn<DevelopApiKeyOverviewRow>[]>(() => [
    {
      id: "name",
      header: "Name",
      accessor: "name",
      sortable: true,
      width: "minmax(210px, 1.25fr)",
      cell: ({ row }) => (
        <div className="playground-settings-api-keys-name-row">
          <span className="resource-overview-identity__title">{row.name}</span>
          {row.isStandard ? <PlatformLabel variant="gray">standard</PlatformLabel> : null}
        </div>
      ),
    },
    {
      id: "secret",
      header: "Secret key",
      accessor: "keyPrefix",
      width: "minmax(150px, 0.82fr)",
      cell: ({ row }) => (
        <ResourceOverviewValue>
          <span className="playground-develop-api-keys-secret">{row.keyPrefix}••••</span>
        </ResourceOverviewValue>
      ),
    },
    {
      id: "created",
      header: "Created",
      accessor: "createdAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.62fr)",
      cell: ({ row }) => <ResourceOverviewValue>{row.createdLabel}</ResourceOverviewValue>,
    },
    {
      id: "lastUsed",
      header: "Last used",
      accessor: "lastUsedAt",
      sortable: true,
      sortDescFirst: true,
      width: "minmax(120px, 0.62fr)",
      hideBelow: 780,
      cell: ({ row }) => <ResourceOverviewValue>{row.lastUsedLabel}</ResourceOverviewValue>,
    },
    {
      id: "creator",
      header: "Creator",
      accessor: "creatorName",
      sortable: true,
      width: "minmax(180px, 0.82fr)",
      hideBelow: 980,
      cell: ({ row }) => (
        <ResourceOverviewIdentityCell
          title={row.creatorName}
          imageUrl={row.creatorAvatarUrl}
          fallback={row.creatorFallback}
          iconClassName="is-creator"
        />
      ),
    },
    {
      id: "permissions",
      header: "Permissions",
      accessor: "permissionsLabel",
      sortable: true,
      width: "minmax(130px, 0.7fr)",
      hideBelow: 680,
      cell: ({ row }) => (
        <PlatformLabel variant={getApiKeyPermissionLabelVariant(row.permissionsLabel)}>
          {row.permissionsLabel}
        </PlatformLabel>
      ),
    },
  ], []);

  const getRowActions = (
    row: DevelopApiKeyOverviewRow,
    state: { targetRows: readonly DevelopApiKeyOverviewRow[] },
  ): readonly PlatformDataTableAction<DevelopApiKeyOverviewRow>[] => {
    const targets = state.targetRows.length ? state.targetRows : [row];
    const deletableTargets = targets.filter((target) => target.canRevoke);
    if (targets.length > 1) {
      return [{
        id: "delete",
        label: "Delete selected",
        icon: Trash2,
        danger: true,
        disabled: Boolean(revokingKeyId) || deletableTargets.length === 0,
        onSelect: () => onDelete(deletableTargets),
      }];
    }
    return [
      {
        id: "view",
        label: "View key",
        icon: Eye,
        onSelect: () => onReveal(row),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        separatorBefore: true,
        disabled: !row.canRevoke || Boolean(revokingKeyId),
        onSelect: () => onDelete([row]),
      },
    ];
  };

  return (
    <ResourceOverviewPage<DevelopApiKeyOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      heroContent={(
        <>
          <PlatformAnalyticsSection analytics={analyticsWithEmptyState} chartType="line" />
          {createdNotice ? <ApiKeyCreatedNotice notice={createdNotice} /> : null}
        </>
      )}
      controlsPortalId={controlsPortalId}
      className="is-develop-api-keys"
      table={{
        rows: activeRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "API keys",
        className: "resource-overview-table is-develop-api-keys",
        sorting: { defaultValue: { id: "name", direction: "asc" } },
        selection: {
          enabled: true,
          isRowSelectable: (row) => row.canRevoke,
          ariaLabel: (row) => `Select ${row.name}`,
        },
        toolbar: {
          title: "All API Keys",
          search: {
            placeholder: "Search API keys",
            getSearchText: (row) => row.searchText,
          },
          filters: [{
            id: "kind",
            label: "Type",
            value: kindFilter,
            onChange: setKindFilter,
            options: [
              { id: "all", label: "All API Keys" },
              { id: "standard", label: "Standard" },
              { id: "scoped", label: "Scoped" },
            ],
          }],
          primaryAction: {
            label: "API Key",
            icon: Plus,
            onClick: onCreate,
          },
        },
        getRowActions,
        getRowAriaLabel: (row) => row.name,
        loading,
        error: error || undefined,
        emptyState: API_KEYS_TABLE_EMPTY_STATE,
        noResultsState: "No matching API keys found.",
      }}
    />
  );
}
