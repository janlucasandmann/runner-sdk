import { Copy, Loader2, MessageSquare, RefreshCw, Save, Trash2, Webhook } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
} from "../../../../../platform-ui/pages/overview/index.js";
import { createDevelopResourceOverviewAnalyticsModel } from "../../../shared/client/domain/index.js";
import {
  VOICE_AGENTS_RESOURCE_DEFINITION,
  type DevelopVoiceAgentOverviewRow,
  type DevelopVoiceAgentsOverviewPageProps,
} from "../domain/index.js";

export function DevelopVoiceAgentsOverviewPage({
  rows,
  period,
  onPeriodChange,
  operationalMetrics,
  analyticsLoading = false,
  analyticsError = "",
  controlsPortalId,
  loading = false,
  error = "",
  message = "",
  modeOptions,
  modelOptions,
  onRefresh,
  onChange,
  onSave,
  onTest,
  onProvision,
  onDisablePhone,
  onOpenThread,
}: DevelopVoiceAgentsOverviewPageProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "enabled") return row.enabled;
    if (statusFilter === "disabled") return !row.enabled;
    return true;
  }), [rows, statusFilter]);
  const analytics = createDevelopResourceOverviewAnalyticsModel(VOICE_AGENTS_RESOURCE_DEFINITION, operationalMetrics, {
    resourceCount: rows.length,
    publishedCount: rows.filter((row) => row.enabled).length,
    loading: analyticsLoading,
    error: analyticsError,
  });

  const columns = useMemo<PlatformDataTableColumn<DevelopVoiceAgentOverviewRow>[]>(() => [
    {
      id: "agent",
      header: "Agent",
      accessor: "name",
      sortable: true,
      width: "minmax(210px, 1.45fr)",
      cell: ({ row }) => <ResourceOverviewIdentityCell title={row.name} icon={VOICE_AGENTS_RESOURCE_DEFINITION.icon} iconClassName="is-develop-resource" />,
    },
    {
      id: "mode",
      header: "Mode",
      accessor: "mode",
      sortable: true,
      width: "minmax(120px, 0.8fr)",
      cell: ({ row }) => (
        <select
          className="playground-settings-select"
          value={row.mode}
          onChange={(event) => onChange(row, { mode: event.target.value })}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Voice mode for ${row.name}`}
        >
          {modeOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      ),
    },
    {
      id: "voice",
      header: "Voice",
      accessor: "voiceId",
      sortable: true,
      width: "minmax(120px, 0.9fr)",
      cell: ({ row }) => (
        <input
          type="text"
          className="playground-settings-input"
          value={row.voiceId}
          onChange={(event) => onChange(row, { voiceId: event.target.value })}
          onClick={(event) => event.stopPropagation()}
          placeholder="eve"
          aria-label={`Voice id for ${row.name}`}
        />
      ),
    },
    {
      id: "model",
      header: "Model",
      accessor: "model",
      sortable: true,
      width: "minmax(180px, 1.2fr)",
      hideBelow: 780,
      cell: ({ row }) => (
        <select
          className="playground-settings-select"
          value={row.model}
          onChange={(event) => onChange(row, { model: event.target.value })}
          onClick={(event) => event.stopPropagation()}
          aria-label={`Voice model for ${row.name}`}
        >
          {modelOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
        </select>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      accessor: "phoneNumber",
      width: "minmax(150px, 1fr)",
      hideBelow: 980,
      cell: ({ row }) => row.phoneNumber
        ? <div className="playground-agents-overview-model-copy"><div>{row.phoneNumber}</div><div className="playground-agents-overview-name-description">{row.phoneStatus || "active"}</div></div>
        : <span className="playground-agents-model-access is-locked">No number</span>,
    },
  ], [modeOptions, modelOptions, onChange]);

  const getRowActions = (row: DevelopVoiceAgentOverviewRow): readonly PlatformDataTableAction<DevelopVoiceAgentOverviewRow>[] => [
    {
      id: "save",
      label: row.isSaving ? "Saving..." : "Save configuration",
      icon: row.isSaving ? Loader2 : Save,
      disabled: row.isSaving,
      onSelect: () => void onSave(row),
    },
    {
      id: "test",
      label: row.isTesting ? "Creating session..." : "Create web voice session",
      icon: row.isTesting ? Loader2 : MessageSquare,
      disabled: row.isTesting || !row.webEnabled,
      onSelect: () => void onTest(row),
    },
  ];

  const renderExpandedRow = ({ row }: { row: DevelopVoiceAgentOverviewRow }) => (
    <div className="playground-settings-detail-stack" style={{ gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 180px", gap: 12, alignItems: "start" }}>
        <label className="playground-settings-field">
          <span className="playground-settings-label">Voice instructions</span>
          <textarea
            className="playground-settings-textarea"
            rows={3}
            value={row.instructions}
            onChange={(event) => onChange(row, { instructions: event.target.value })}
            placeholder="Use the agent instructions"
          />
        </label>
        <label className="playground-settings-field">
          <span className="playground-settings-label">Language hint</span>
          <input
            type="text"
            className="playground-settings-input"
            value={row.languageHint}
            onChange={(event) => onChange(row, { languageHint: event.target.value })}
            placeholder="en"
          />
        </label>
      </div>
      <div className="playground-auth-users-toolbar-actions">
        {row.phoneNumber ? (
          <button type="button" className="playground-server-detail-docs-tab" onClick={() => void onDisablePhone(row)} disabled={row.isDisabling}>
            {row.isDisabling ? <Loader2 width={12} height={12} strokeWidth={1.8} /> : <Trash2 width={12} height={12} strokeWidth={1.8} />}
            <span>{row.isDisabling ? "Disabling..." : "Disable Number"}</span>
          </button>
        ) : (
          <button type="button" className="playground-server-detail-docs-tab" onClick={() => void onProvision(row)} disabled={row.isProvisioning || !row.phoneEnabled} title={row.phoneEnabled ? "Provision phone number" : "Enable phone voice mode first"}>
            {row.isProvisioning ? <Loader2 width={12} height={12} strokeWidth={1.8} /> : <Webhook width={12} height={12} strokeWidth={1.8} />}
            <span>{row.isProvisioning ? "Provisioning..." : "Provision Number"}</span>
          </button>
        )}
        <span className={`playground-agents-model-access${row.enabled ? " is-available" : " is-locked"}`}>
          {modeOptions.find((option) => option.id === row.mode)?.label || "Off"}
        </span>
      </div>
      {row.sessionThreadId || row.realtimeUrl ? (
        <div className="playground-environments-success playground-environments-editor-notice">
          <span>Web voice session ready</span>
          {row.sessionThreadId && onOpenThread ? (
            <button type="button" className="playground-server-detail-docs-tab" onClick={() => onOpenThread(row.sessionThreadId || "")}>
              <MessageSquare width={12} height={12} strokeWidth={1.8} /><span>Open Thread</span>
            </button>
          ) : null}
          {row.realtimeUrl ? (
            <button type="button" className="playground-server-detail-docs-tab" onClick={() => void navigator.clipboard?.writeText(row.realtimeUrl || "")}>
              <Copy width={12} height={12} strokeWidth={1.8} /><span>Copy Realtime URL</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );

  const refreshButton = (
    <button type="button" className="playground-files-control-button is-bare" onClick={onRefresh} disabled={loading}>
      <RefreshCw width={14} height={14} strokeWidth={1.8} />
      <span>{loading ? "Refreshing" : "Refresh"}</span>
    </button>
  );

  return (
    <ResourceOverviewPage<DevelopVoiceAgentOverviewRow>
      period={period}
      onPeriodChange={onPeriodChange}
      analytics={analytics}
      controlsPortalId={controlsPortalId}
      className="is-develop-resource is-voice-agent"
      table={{
        rows: filteredRows,
        columns,
        getRowId: (row) => row.id,
        ariaLabel: "Voice agent configuration",
        className: "resource-overview-table is-develop-resource is-voice-agent playground-voice-agents-platform-table",
        sorting: { defaultValue: { id: "agent", direction: "asc" } },
        toolbar: {
          title: "All Voice Agents",
          search: { placeholder: "Search voice agents", getSearchText: (row) => row.searchText },
          filters: [{
            id: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { id: "all", label: "All Voice Agents" },
              { id: "enabled", label: "Enabled" },
              { id: "disabled", label: "Disabled" },
            ],
          }],
          trailing: refreshButton,
        },
        getRowActions,
        getRowAriaLabel: (row) => `Configure voice for ${row.name}`,
        isRowExpanded: () => true,
        renderExpandedRow,
        loading,
        error: error || undefined,
        footer: message ? <div className="playground-environments-success playground-environments-editor-notice">{message}</div> : undefined,
        emptyState: "No agents are available for voice configuration.",
        noResultsState: "No matching voice agents found.",
      }}
    />
  );
}
