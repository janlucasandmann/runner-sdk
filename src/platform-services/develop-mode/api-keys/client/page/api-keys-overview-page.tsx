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
  apiBaseUrl: string;
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
            Copy this key now. It cannot be viewed again after this notice is dismissed.
          </p>
          <div className="playground-settings-created-key-secret">
            <code className="playground-settings-code playground-settings-created-key-value">
              {notice.keyValue}
            </code>
            <button
              type="button"
              className="playground-settings-icon-button playground-settings-created-key-copy-button"
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
          className="playground-settings-icon-button playground-settings-created-key-dismiss-button"
          onClick={notice.onDismiss}
          aria-label="Dismiss created API key"
        >
          <X width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}

function ApiBaseUrlNotice({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [copied, setCopied] = useState(false);
  const normalizedBaseUrl = apiBaseUrl.replace(/\/$/, "");

  const copyBaseUrl = async () => {
    if (!normalizedBaseUrl) return;
    await navigator.clipboard.writeText(normalizedBaseUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="playground-develop-api-keys-base-url" aria-label="Computer Agents API endpoint">
      <div className="playground-develop-api-keys-base-url-copy">
        <p className="playground-develop-api-keys-base-url-title">API base URL</p>
        <p className="playground-develop-api-keys-base-url-description">
          Use this origin with the Computer Agents SDK. Public API routes are served under <code>/v1</code>.
        </p>
      </div>
      <div className="playground-settings-code-row playground-develop-api-keys-base-url-value">
        <code className="playground-settings-code">{normalizedBaseUrl}</code>
        <button
          type="button"
          className="playground-settings-icon-button"
          onClick={() => void copyBaseUrl()}
          title="Copy API base URL"
          aria-label="Copy API base URL"
        >
          {copied
            ? <Check width={14} height={14} strokeWidth={1.8} />
            : <Copy width={14} height={14} strokeWidth={1.8} />}
        </button>
      </div>
    </section>
  );
}

export function DevelopApiKeysOverviewPage({
  rows,
  apiBaseUrl,
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
        selectedRows: {
          label: "Delete selected",
          danger: true,
          onSelect: () => onDelete(deletableTargets),
        },
      }];
    }
    const actions: PlatformDataTableAction<DevelopApiKeyOverviewRow>[] = [];
    if (row.canReveal) {
      actions.push({
        id: "view",
        label: "View key",
        icon: Eye,
        onSelect: () => onReveal(row),
      });
    }
    actions.push({
        id: "delete",
        label: "Delete",
        icon: Trash2,
        danger: true,
        separatorBefore: actions.length > 0,
        disabled: !row.canRevoke || Boolean(revokingKeyId),
        onSelect: () => onDelete([row]),
    });
    return actions;
  };

  return (
    <ResourceOverviewPage<DevelopApiKeyOverviewRow>
      rowActionMode="custom"
      period={period}
      onPeriodChange={onPeriodChange}
      heroContent={(
        <>
          <PlatformAnalyticsSection analytics={analytics} chartType="line" />
          <ApiBaseUrlNotice apiBaseUrl={apiBaseUrl} />
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
