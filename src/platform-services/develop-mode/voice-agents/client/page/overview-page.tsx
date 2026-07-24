import {
  ArrowLeft,
  ChartColumnIncreasing,
  Copy,
  Loader2,
  MessageSquare,
  PanelRight,
  Phone,
  RefreshCw,
  Save,
  Settings,
  Trash2,
  Webhook,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { PlatformAnalyticsSection } from "../../../../../platform-ui/components/composite/analytics/index.js";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformInstructionsEditor } from "../../../../../platform-ui/components/composite/instructions-editor/index.js";
import { PlatformUiCard } from "../../../../../platform-ui/components/composite/ui-card/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { PlatformSelector } from "../../../../../platform-ui/components/ui/selector/index.js";
import {
  ResourceOverviewIdentityCell,
  ResourceOverviewPage,
} from "../../../../../platform-ui/pages/overview/index.js";
import { createDevelopResourceOverviewAnalyticsModel } from "../../../shared/client/domain/index.js";
import { DevelopServerDetailPage } from "../../../shared/client/page/index.js";
import {
  VOICE_AGENTS_RESOURCE_DEFINITION,
  type DevelopVoiceAgentOption,
  type DevelopVoiceAgentOverviewRow,
  type DevelopVoiceAgentsOverviewPageProps,
} from "../domain/index.js";

type VoiceAgentDetailTab = "usage" | "settings";

const VOICE_AGENT_DETAIL_TABS = [
  { id: "usage", label: "Usage", icon: ChartColumnIncreasing },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const VOICE_AGENT_TIMEFRAME_OPTIONS = [
  { value: "day", label: "24H" },
  { value: "week", label: "7D" },
  { value: "month", label: "30D" },
] as const;

function getVoiceModeLabel(mode: string, modeOptions: readonly DevelopVoiceAgentOption[]) {
  return modeOptions.find((option) => option.id === mode)?.label || "Off";
}

function renderVoiceAgentSidebarRow(label: ReactNode, value: ReactNode, className = "") {
  return (
    <div className={`playground-project-overview-sidebar-row${className ? ` ${className}` : ""}`}>
      <span className="playground-project-overview-sidebar-row-label">{label}</span>
      <div className="playground-project-overview-sidebar-row-value">{value}</div>
    </div>
  );
}

function VoiceAgentDetailPage({
  row,
  period,
  onPeriodChange,
  analytics,
  controlsPortalId,
  error,
  message,
  modeOptions,
  modelOptions,
  onBack,
  onChange,
  onSave,
  onTest,
  onProvision,
  onDisablePhone,
  onOpenThread,
}: {
  row: DevelopVoiceAgentOverviewRow;
  period: DevelopVoiceAgentsOverviewPageProps["period"];
  onPeriodChange: DevelopVoiceAgentsOverviewPageProps["onPeriodChange"];
  analytics: ReturnType<typeof createDevelopResourceOverviewAnalyticsModel>;
  controlsPortalId?: string;
  error: string;
  message: string;
  modeOptions: readonly DevelopVoiceAgentOption[];
  modelOptions: readonly DevelopVoiceAgentOption[];
  onBack: () => void;
  onChange: DevelopVoiceAgentsOverviewPageProps["onChange"];
  onSave: DevelopVoiceAgentsOverviewPageProps["onSave"];
  onTest: DevelopVoiceAgentsOverviewPageProps["onTest"];
  onProvision: DevelopVoiceAgentsOverviewPageProps["onProvision"];
  onDisablePhone: DevelopVoiceAgentsOverviewPageProps["onDisablePhone"];
  onOpenThread?: DevelopVoiceAgentsOverviewPageProps["onOpenThread"];
}) {
  const [activeTab, setActiveTab] = useState<VoiceAgentDetailTab>("usage");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [controlsPortalTarget, setControlsPortalTarget] = useState<HTMLElement | null>(null);
  const statusVariant = row.enabled ? "green" : "gray";
  const modeLabel = getVoiceModeLabel(row.mode, modeOptions);
  const creator = row.creator || { name: "Unknown", email: "", avatarUrl: "" };
  const owner = row.owner || creator;

  useEffect(() => {
    if (!controlsPortalId || typeof document === "undefined") {
      setControlsPortalTarget(null);
      return;
    }
    setControlsPortalTarget(document.getElementById(controlsPortalId));
  }, [controlsPortalId]);

  const headerControls = controlsPortalTarget
    ? createPortal(
        <div className="resource-overview-page__controls playground-voice-agent-detail-header-controls">
          <PlatformSecondaryButton
            size="small"
            onClick={() => void onTest(row)}
            disabled={row.isTesting || !row.webEnabled}
          >
            {row.isTesting
              ? <Loader2 width={14} height={14} strokeWidth={1.8} />
              : <MessageSquare width={14} height={14} strokeWidth={1.8} />}
            <span>{row.isTesting ? "Creating Session" : "Test Voice"}</span>
          </PlatformSecondaryButton>
          <PlatformPrimaryButton
            size="small"
            onClick={() => void onSave(row)}
            disabled={row.isSaving}
          >
            {row.isSaving
              ? <Loader2 width={14} height={14} strokeWidth={1.8} />
              : <Save width={14} height={14} strokeWidth={1.8} />}
            <span>{row.isSaving ? "Saving" : "Save Changes"}</span>
          </PlatformPrimaryButton>
        </div>,
        controlsPortalTarget,
      )
    : null;

  const sidebarToggle = (
    <button
      type="button"
      className="playground-project-overview-sidebar-toggle"
      onClick={() => setSidebarCollapsed((current) => !current)}
      title={sidebarCollapsed ? "Show voice agent properties" : "Hide voice agent properties"}
      aria-label={sidebarCollapsed ? "Show voice agent properties" : "Hide voice agent properties"}
      aria-pressed={sidebarCollapsed}
    >
      <PanelRight width={15} height={15} strokeWidth={1.8} />
    </button>
  );

  const sidebar = (
    <>
      <PlatformUiCard
        as="section"
        variant="sidebar"
        cardTitle="Properties"
        className="playground-project-overview-sidebar-card playground-server-detail-properties-card playground-voice-agent-detail-properties-card"
      >
        <div className="playground-project-overview-sidebar-rows">
          {renderVoiceAgentSidebarRow("Status", <PlatformLabel variant={statusVariant}>{row.enabled ? "Enabled" : "Disabled"}</PlatformLabel>)}
          {renderVoiceAgentSidebarRow("Creator", <ResourceOverviewIdentityCell
            title={creator.name || creator.email || "Unknown"}
            imageUrl={creator.avatarUrl}
            fallback={(creator.name || creator.email || "?").slice(0, 1).toUpperCase()}
            size="compact"
          />)}
          {renderVoiceAgentSidebarRow("Mode", modeLabel)}
          {renderVoiceAgentSidebarRow("Model", row.model)}
          {renderVoiceAgentSidebarRow("Voice", row.voiceId || "Default")}
          {renderVoiceAgentSidebarRow("Language", row.languageHint || "Automatic")}
          {renderVoiceAgentSidebarRow("Phone", row.phoneNumber || "Not provisioned")}
          {renderVoiceAgentSidebarRow("Agent ID", <span className="is-id" title={row.id}>{row.id}</span>)}
          {renderVoiceAgentSidebarRow("Owner", <ResourceOverviewIdentityCell
            title={owner.name || owner.email || "Unknown"}
            imageUrl={owner.avatarUrl}
            fallback={(owner.name || owner.email || "?").slice(0, 1).toUpperCase()}
            size="compact"
          />, "playground-server-detail-sidebar-owner-row")}
        </div>
      </PlatformUiCard>
      <PlatformUiCard
        as="section"
        variant="sidebar"
        cardTitle="Actions"
        className="playground-project-overview-sidebar-card playground-voice-agent-detail-actions-card"
      >
        <div className="playground-voice-agent-detail-sidebar-actions">
          <PlatformSecondaryButton
            size="small"
            onClick={() => void onTest(row)}
            disabled={row.isTesting || !row.webEnabled}
          >
            <MessageSquare width={14} height={14} strokeWidth={1.8} />
            <span>{row.isTesting ? "Creating Session" : "Create Web Session"}</span>
          </PlatformSecondaryButton>
          {row.phoneNumber ? (
            <PlatformSecondaryButton
              size="small"
              onClick={() => void onDisablePhone(row)}
              disabled={row.isDisabling}
            >
              <Trash2 width={14} height={14} strokeWidth={1.8} />
              <span>{row.isDisabling ? "Disabling" : "Disable Number"}</span>
            </PlatformSecondaryButton>
          ) : (
            <PlatformSecondaryButton
              size="small"
              onClick={() => void onProvision(row)}
              disabled={row.isProvisioning || !row.phoneEnabled}
              title={row.phoneEnabled ? "Provision phone number" : "Enable phone voice mode first"}
            >
              <Phone width={14} height={14} strokeWidth={1.8} />
              <span>{row.isProvisioning ? "Provisioning" : "Provision Number"}</span>
            </PlatformSecondaryButton>
          )}
        </div>
      </PlatformUiCard>
    </>
  );

  const usageContent = (
    <>
      <PlatformAnalyticsSection
        analytics={analytics}
        chartType="line"
        variant="framed"
        title="Voice Agent Activity"
        timeframe={{
          value: period,
          options: VOICE_AGENT_TIMEFRAME_OPTIONS,
          onValueChange: (value) => onPeriodChange(value as DevelopVoiceAgentsOverviewPageProps["period"]),
          ariaLabel: "Voice agent analytics time frame",
        }}
      />
      {row.sessionThreadId || row.realtimeUrl ? (
        <PlatformUiCard as="section" className="playground-voice-agent-session-card">
          <div className="playground-voice-agent-detail-section-header">
            <div>
              <h2>Latest Web Session</h2>
              <p>The latest test session is ready for inspection or client integration.</p>
            </div>
            <PlatformLabel variant="green">Ready</PlatformLabel>
          </div>
          <div className="playground-voice-agent-session-actions">
            {row.sessionThreadId && onOpenThread ? (
              <PlatformSecondaryButton size="small" onClick={() => onOpenThread(row.sessionThreadId || "")}>
                <MessageSquare width={14} height={14} strokeWidth={1.8} />
                <span>Open Thread</span>
              </PlatformSecondaryButton>
            ) : null}
            {row.realtimeUrl ? (
              <PlatformSecondaryButton size="small" onClick={() => void navigator.clipboard?.writeText(row.realtimeUrl || "")}>
                <Copy width={14} height={14} strokeWidth={1.8} />
                <span>Copy Realtime URL</span>
              </PlatformSecondaryButton>
            ) : null}
          </div>
        </PlatformUiCard>
      ) : null}
    </>
  );

  const settingsContent = (
    <div className="playground-server-settings-tab playground-voice-agent-settings-tab">
      <PlatformInstructionsEditor
        title="Voice Instructions"
        value={row.instructions}
        onChange={(instructions) => onChange(row, { instructions })}
        placeholder="Add instructions for how this agent should speak and respond in voice sessions."
        ariaLabel={`Voice instructions for ${row.name}`}
        historyKey={row.id}
        stickyHeader
      />
      <PlatformUiCard as="section" className="playground-voice-agent-configuration-card">
        <div className="playground-voice-agent-detail-section-header">
          <div>
            <h2>Voice Configuration</h2>
            <p>Choose where voice is available and which realtime model and voice should be used.</p>
          </div>
        </div>
        <div className="playground-voice-agent-configuration-grid">
          <div className="playground-voice-agent-configuration-row">
            <span>Mode</span>
            <PlatformSelector
              value={row.mode}
              options={modeOptions.map((option) => ({ value: option.id, label: option.label }))}
              onValueChange={(mode) => onChange(row, { mode })}
              ariaLabel={`Voice mode for ${row.name}`}
              alignment="end"
              popupAlignment="right"
            />
          </div>
          <div className="playground-voice-agent-configuration-row">
            <span>Model</span>
            <PlatformSelector
              value={row.model}
              options={modelOptions.map((option) => ({ value: option.id, label: option.label }))}
              onValueChange={(model) => onChange(row, { model })}
              ariaLabel={`Voice model for ${row.name}`}
              alignment="end"
              popupAlignment="right"
            />
          </div>
          <label className="playground-voice-agent-configuration-row">
            <span>Voice ID</span>
            <input
              type="text"
              className="playground-settings-input"
              value={row.voiceId}
              onChange={(event) => onChange(row, { voiceId: event.target.value })}
              placeholder="eve"
              aria-label={`Voice id for ${row.name}`}
            />
          </label>
          <label className="playground-voice-agent-configuration-row">
            <span>Language Hint</span>
            <input
              type="text"
              className="playground-settings-input"
              value={row.languageHint}
              onChange={(event) => onChange(row, { languageHint: event.target.value })}
              placeholder="Automatic"
              aria-label={`Language hint for ${row.name}`}
            />
          </label>
        </div>
      </PlatformUiCard>
      <PlatformUiCard as="section" className="playground-voice-agent-phone-card">
        <div className="playground-voice-agent-detail-section-header">
          <div>
            <h2>Phone Channel</h2>
            <p>Provision a managed phone number when the selected voice mode includes phone access.</p>
          </div>
          <PlatformLabel variant={row.phoneNumber ? "green" : "gray"}>
            {row.phoneNumber ? row.phoneStatus || "Active" : "Not Provisioned"}
          </PlatformLabel>
        </div>
        <div className="playground-voice-agent-phone-actions">
          {row.phoneNumber ? (
            <>
              <span className="playground-voice-agent-phone-number">{row.phoneNumber}</span>
              <PlatformSecondaryButton size="small" onClick={() => void onDisablePhone(row)} disabled={row.isDisabling}>
                <Trash2 width={14} height={14} strokeWidth={1.8} />
                <span>{row.isDisabling ? "Disabling" : "Disable Number"}</span>
              </PlatformSecondaryButton>
            </>
          ) : (
            <PlatformSecondaryButton
              size="small"
              onClick={() => void onProvision(row)}
              disabled={row.isProvisioning || !row.phoneEnabled}
              title={row.phoneEnabled ? "Provision phone number" : "Enable phone voice mode first"}
            >
              <Webhook width={14} height={14} strokeWidth={1.8} />
              <span>{row.isProvisioning ? "Provisioning" : "Provision Number"}</span>
            </PlatformSecondaryButton>
          )}
        </div>
      </PlatformUiCard>
    </div>
  );

  return (
    <>
      {headerControls}
      <div className="playground-managed-data-detail-main playground-voice-agent-detail-main">
        <DevelopServerDetailPage<VoiceAgentDetailTab>
          header={(
            <div className="playground-server-detail-profile-section">
              <div className="playground-server-detail-title-row">
                <h1 className="playground-voice-agent-detail-title">{row.name}</h1>
              </div>
            </div>
          )}
          tabs={VOICE_AGENT_DETAIL_TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabBarActions={(
            <PlatformSecondaryButton size="small" onClick={onBack}>
              <ArrowLeft width={14} height={14} strokeWidth={1.8} />
              <span>All Voice Agents</span>
            </PlatformSecondaryButton>
          )}
          sidebarToggle={sidebarToggle}
          sidebar={sidebar}
          sidebarCollapsed={sidebarCollapsed}
          ariaLabel={`Voice Agent details for ${row.name}`}
          sidebarAriaLabel={`${row.name} properties`}
          className="is-voice-agent-detail"
          contentClassName="playground-server-detail-content playground-voice-agent-detail-content"
        >
          {error ? <div className="playground-environments-error playground-environments-editor-notice" role="alert">{error}</div> : null}
          {message ? <div className="playground-environments-success playground-environments-editor-notice" role="status">{message}</div> : null}
          {activeTab === "settings" ? settingsContent : usageContent}
        </DevelopServerDetailPage>
      </div>
    </>
  );
}

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
  const [selectedVoiceAgentId, setSelectedVoiceAgentId] = useState("");
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (statusFilter === "enabled") return row.enabled;
    if (statusFilter === "disabled") return !row.enabled;
    return true;
  }), [rows, statusFilter]);
  const selectedRow = rows.find((row) => row.id === selectedVoiceAgentId) || null;
  const analytics = createDevelopResourceOverviewAnalyticsModel(VOICE_AGENTS_RESOURCE_DEFINITION, operationalMetrics, {
    resourceCount: rows.length,
    publishedCount: rows.filter((row) => row.enabled).length,
    loading: analyticsLoading,
    error: analyticsError,
  });

  useEffect(() => {
    if (selectedVoiceAgentId && !selectedRow) setSelectedVoiceAgentId("");
  }, [selectedRow, selectedVoiceAgentId]);

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
      id: "status",
      header: "Status",
      accessor: (row) => row.enabled ? "enabled" : "disabled",
      sortable: true,
      width: "minmax(100px, 0.75fr)",
      cell: ({ row }) => <PlatformLabel variant={row.enabled ? "green" : "gray"}>{row.enabled ? "Enabled" : "Disabled"}</PlatformLabel>,
    },
    {
      id: "mode",
      header: "Mode",
      accessor: "mode",
      sortable: true,
      width: "minmax(130px, 0.85fr)",
      cell: ({ row }) => getVoiceModeLabel(row.mode, modeOptions),
    },
    {
      id: "model",
      header: "Model",
      accessor: "model",
      sortable: true,
      width: "minmax(180px, 1.2fr)",
      hideBelow: 780,
    },
    {
      id: "phone",
      header: "Phone",
      accessor: "phoneNumber",
      width: "minmax(150px, 1fr)",
      hideBelow: 980,
      cell: ({ row }) => row.phoneNumber || "Not provisioned",
    },
  ], [modeOptions]);

  const getRowActions = (row: DevelopVoiceAgentOverviewRow): readonly PlatformDataTableAction<DevelopVoiceAgentOverviewRow>[] => [
    {
      id: "configure",
      label: "Configure",
      icon: Settings,
      onSelect: () => setSelectedVoiceAgentId(row.id),
    },
    {
      id: "test",
      label: row.isTesting ? "Creating session..." : "Create web voice session",
      icon: row.isTesting ? Loader2 : MessageSquare,
      disabled: row.isTesting || !row.webEnabled,
      onSelect: () => void onTest(row),
    },
  ];

  if (selectedRow) {
    return (
      <VoiceAgentDetailPage
        row={selectedRow}
        period={period}
        onPeriodChange={onPeriodChange}
        analytics={analytics}
        controlsPortalId={controlsPortalId}
        error={error}
        message={message}
        modeOptions={modeOptions}
        modelOptions={modelOptions}
        onBack={() => setSelectedVoiceAgentId("")}
        onChange={onChange}
        onSave={onSave}
        onTest={onTest}
        onProvision={onProvision}
        onDisablePhone={onDisablePhone}
        onOpenThread={onOpenThread}
      />
    );
  }

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
        ariaLabel: "Voice agents",
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
        onRowActivate: (row) => setSelectedVoiceAgentId(row.id),
        getRowAriaLabel: (row) => `Open voice settings for ${row.name}`,
        loading,
        error: error || undefined,
        footer: message ? <div className="playground-environments-success playground-environments-editor-notice">{message}</div> : undefined,
        emptyState: "No agents are available for voice configuration.",
        noResultsState: "No matching voice agents found.",
      }}
    />
  );
}
