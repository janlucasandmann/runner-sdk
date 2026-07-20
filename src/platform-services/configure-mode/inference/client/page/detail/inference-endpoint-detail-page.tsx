import {
  Activity,
  ArrowLeft,
  Boxes,
  CloudCog,
  HardDrive,
  LayoutGrid,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  RefreshCw,
  ServerCog,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import {
  PlatformDetailSidebarSection,
} from "../../../../../../platform-ui/components/composite/detail-sidebar/index.js";
import {
  PlatformConfirmationModal,
} from "../../../../../../platform-ui/components/composite/modal/index.js";
import {
  PlatformSettingsDataTable,
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../../platform-ui/components/composite/settings-section/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../../platform-ui/components/ui/button/index.js";
import { PlatformIconButton } from "../../../../../../platform-ui/components/ui/icon-button/index.js";
import { PlatformLabel } from "../../../../../../platform-ui/components/ui/label/index.js";
import {
  PlatformSelector,
} from "../../../../../../platform-ui/components/ui/selector/index.js";
import { ResourceDetailPage } from "../../../../../../platform-ui/pages/details/index.js";
import {
  buildInferenceEndpointDraft,
  buildInferenceEndpointRows,
  ORGANIZATION_INFERENCE_ENDPOINT_ID,
  type InferenceEndpointRow,
  type InferenceEndpointCollectionSnapshot,
  type InferenceLocalRunnersSnapshot,
  type InferenceSettingsSnapshot,
} from "../inference-endpoint-model.js";
import { INFERENCE_PROVIDER_OPTIONS } from "../inference-provider-options.js";

type InferenceEndpointDetailTab = "general" | "models" | "runtime";

interface InferenceModelRow {
  id: string;
  source: string;
}

interface InferenceBindingRow {
  id: string;
  name: string;
  environment: string;
  project: string;
  path: string;
}

export interface InferenceEndpointDetailPageProps {
  endpointId: string;
  endpoints: InferenceEndpointCollectionSnapshot;
  settings: InferenceSettingsSnapshot;
  localRunners: InferenceLocalRunnersSnapshot;
  canConfigure?: boolean;
  saving?: boolean;
  testing?: boolean;
  error?: string;
  success?: string;
  apiKeyValue?: string;
  apiKeyConfigured?: boolean;
  runtimeContent?: ReactNode;
  onBack: () => void;
  onSettingsChange: (patch: Partial<InferenceSettingsSnapshot>) => void;
  onApiKeyFocus?: () => void;
  onApiKeyBlur?: () => void;
  onApiKeyChange?: (value: string) => void;
  onRemoveSavedApiKey?: () => void;
  onAddModels: (value: string) => boolean | void;
  onRemoveModel: (modelId: string) => void;
  onTestConnection: () => void | Promise<void>;
  onRemoveEndpoint: () => void | Promise<void>;
  onRefreshLocalRunners?: () => void;
  onUpgrade?: () => void;
}

const DETAIL_TABS = [
  { id: "general", label: "General", icon: LayoutGrid },
  { id: "models", label: "Models", icon: Boxes },
  { id: "runtime", label: "Runtime", icon: ServerCog },
] as const;

function SidebarProperty({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="inference-endpoint-detail__property">
      <span className="inference-endpoint-detail__property-label">{label}</span>
      <span className="inference-endpoint-detail__property-value">{value}</span>
    </div>
  );
}

function ReadOnlyFact({ label, value }: { label: ReactNode; value: ReactNode }) {
  return (
    <div className="inference-endpoint-detail__fact">
      <span className="inference-endpoint-detail__fact-label">{label}</span>
      <span className="inference-endpoint-detail__fact-value">{value}</span>
    </div>
  );
}

function buildModelRows(endpoint: InferenceEndpointRow): InferenceModelRow[] {
  return endpoint.models.map((modelId) => ({
    id: modelId,
    source: endpoint.kind === "local" ? endpoint.providerLabel : "Configured",
  }));
}

function buildBindingRows(endpoint: InferenceEndpointRow): InferenceBindingRow[] {
  return endpoint.bindings.map((binding, index) => ({
    id: String(binding.id || `${endpoint.id}-binding-${index}`),
    name: String(binding.name || "Workspace binding"),
    environment: String(binding.environmentId || "Default"),
    project: String(binding.projectId || "No project"),
    path: String(binding.localPath || binding.syncRoot || "Not reported"),
  }));
}

export function InferenceEndpointDetailPage({
  endpointId,
  endpoints: endpointCollection,
  settings,
  localRunners,
  canConfigure = true,
  saving = false,
  testing = false,
  error = "",
  success = "",
  apiKeyValue = "",
  apiKeyConfigured = false,
  runtimeContent,
  onBack,
  onSettingsChange,
  onApiKeyFocus,
  onApiKeyBlur,
  onApiKeyChange,
  onRemoveSavedApiKey,
  onAddModels,
  onRemoveModel,
  onTestConnection,
  onRemoveEndpoint,
  onRefreshLocalRunners,
  onUpgrade,
}: InferenceEndpointDetailPageProps) {
  const [activeTab, setActiveTab] = useState<InferenceEndpointDetailTab>("general");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modelInput, setModelInput] = useState("");
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const endpoints = useMemo(
    () => buildInferenceEndpointRows(endpointCollection, localRunners),
    [endpointCollection, localRunners],
  );
  const endpoint = endpoints.find((entry) => entry.id === endpointId)
    || (endpointId === ORGANIZATION_INFERENCE_ENDPOINT_ID
      ? buildInferenceEndpointDraft(settings)
      : null);

  useEffect(() => {
    setActiveTab("general");
    setModelInput("");
    setRemoveModalOpen(false);
  }, [endpointId]);

  if (!endpoint) {
    return (
      <div className="inference-endpoint-detail__missing" role="status">
        <p>This inference endpoint is no longer available.</p>
        <PlatformSecondaryButton size="medium" onClick={onBack}>
          <ArrowLeft width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
          <span>Back to Inference</span>
        </PlatformSecondaryButton>
      </div>
    );
  }

  const isExternal = endpoint.kind === "external";
  const configured = Boolean(String(settings.baseUrl || "").trim());
  const modelRows = buildModelRows(endpoint);
  const bindingRows = buildBindingRows(endpoint);
  const providerValue = String(settings.providerType || endpoint.providerType || "openai-compatible");
  const providerOptions = INFERENCE_PROVIDER_OPTIONS.some((option) => option.value === providerValue)
    ? INFERENCE_PROVIDER_OPTIONS
    : [...INFERENCE_PROVIDER_OPTIONS, { value: providerValue, label: endpoint.providerLabel }];
  const disabled = !canConfigure || endpoint.readOnly || saving;

  const modelColumns: PlatformDataTableColumn<InferenceModelRow>[] = [
    {
      id: "model",
      header: "Model",
      accessor: "id",
      sortable: true,
      width: "minmax(240px, 1fr)",
    },
    {
      id: "source",
      header: "Source",
      accessor: "source",
      sortable: true,
      width: "minmax(140px, 0.45fr)",
    },
  ];
  const bindingColumns: PlatformDataTableColumn<InferenceBindingRow>[] = [
    {
      id: "name",
      header: "Binding",
      accessor: "name",
      sortable: true,
      width: "minmax(170px, 0.8fr)",
    },
    {
      id: "environment",
      header: "Environment",
      accessor: "environment",
      sortable: true,
      width: "minmax(140px, 0.65fr)",
    },
    {
      id: "project",
      header: "Project",
      accessor: "project",
      sortable: true,
      width: "minmax(130px, 0.58fr)",
    },
    {
      id: "path",
      header: "Local Path",
      accessor: "path",
      width: "minmax(210px, 1fr)",
    },
  ];

  const modelActions = (
    row: InferenceModelRow,
  ): readonly PlatformDataTableAction<InferenceModelRow>[] => (
    isExternal && canConfigure
      ? [{
          id: "remove",
          label: "Remove Model",
          icon: Trash2,
          onSelect: () => onRemoveModel(row.id),
        }]
      : []
  );

  const submitModel = () => {
    const normalized = modelInput.trim();
    if (!normalized) return;
    const added = onAddModels(normalized);
    if (added !== false) setModelInput("");
  };

  const renderGeneral = () => (
    <PlatformSettingsSectionList>
      {!canConfigure && isExternal ? (
        <PlatformSettingsSection
          title="Plan access required"
          description="External inference endpoints are available on Team, Business, and Enterprise plans."
          icon={<CloudCog />}
          actions={onUpgrade ? (
            <PlatformPrimaryButton size="small" onClick={onUpgrade}>
              Upgrade to Team
            </PlatformPrimaryButton>
          ) : undefined}
        >
          <p className="inference-endpoint-detail__section-copy">
            Upgrade to route compatible model traffic through infrastructure managed by your
            organization.
          </p>
        </PlatformSettingsSection>
      ) : null}

      {isExternal ? (
        <PlatformSettingsSection
          title="Endpoint Configuration"
          description="Connection settings are encrypted and shared at organization scope."
          icon={<CloudCog />}
        >
          <div className="inference-endpoint-detail__form-grid">
            <div className="inference-endpoint-detail__field">
              <label htmlFor="inference-endpoint-name" className="inference-endpoint-detail__field-label">
                Name
              </label>
              <input
                id="inference-endpoint-name"
                type="text"
                className="inference-endpoint-detail__input"
                value={String(settings.name || "")}
                placeholder="Production Inference"
                disabled={disabled}
                onChange={(event) => onSettingsChange({ name: event.target.value })}
              />
            </div>

            <div className="inference-endpoint-detail__field">
              <label className="inference-endpoint-detail__field-label">Provider</label>
              <PlatformSelector
                value={providerValue}
                options={providerOptions}
                onValueChange={(value) => onSettingsChange({
                  providerType: value,
                  healthStatus: "idle",
                  lastValidatedAt: "",
                  lastError: "",
                })}
                ariaLabel="Inference provider"
                fullWidth
                disabled={disabled}
                triggerClassName="inference-endpoint-detail__selector-trigger"
              />
            </div>

            <div className="inference-endpoint-detail__field">
              <label htmlFor="inference-endpoint-url" className="inference-endpoint-detail__field-label">
                Endpoint URL
              </label>
              <input
                id="inference-endpoint-url"
                type="url"
                className="inference-endpoint-detail__input"
                value={String(settings.baseUrl || "")}
                placeholder="https://models.example.com/v1"
                disabled={disabled}
                onChange={(event) => onSettingsChange({
                  baseUrl: event.target.value,
                  healthStatus: "idle",
                  lastValidatedAt: "",
                  lastError: "",
                })}
              />
            </div>

            <div className="inference-endpoint-detail__field is-span-2">
              <label htmlFor="inference-endpoint-api-key" className="inference-endpoint-detail__field-label">
                API Key
              </label>
              <div className="inference-endpoint-detail__input-row">
                <input
                  id="inference-endpoint-api-key"
                  type="password"
                  className="inference-endpoint-detail__input"
                  value={apiKeyValue}
                  placeholder="sk-..."
                  disabled={disabled}
                  onFocus={onApiKeyFocus}
                  onBlur={onApiKeyBlur}
                  onChange={(event) => onApiKeyChange?.(event.target.value)}
                />
                {apiKeyConfigured && onRemoveSavedApiKey ? (
                  <PlatformSecondaryButton
                    size="medium"
                    disabled={disabled}
                    onClick={onRemoveSavedApiKey}
                  >
                    Remove Saved Key
                  </PlatformSecondaryButton>
                ) : null}
              </div>
            </div>
          </div>
        </PlatformSettingsSection>
      ) : (
        <PlatformSettingsSection
          title="Endpoint Configuration"
          description="Local endpoint configuration is reported by the paired runner."
          icon={<HardDrive />}
        >
          <div className="inference-endpoint-detail__facts">
            <ReadOnlyFact label="Runner" value={endpoint.device?.name || "Local Runner"} />
            <ReadOnlyFact label="Host" value={endpoint.hostLabel} />
            <ReadOnlyFact label="Provider" value={endpoint.providerLabel} />
            <ReadOnlyFact label="Platform" value={endpoint.device?.platform || "Unknown"} />
            <ReadOnlyFact label="Daemon" value={endpoint.device?.daemonVersion || "Unknown"} />
            <ReadOnlyFact label="App Version" value={endpoint.device?.appVersion || "Unknown"} />
          </div>
        </PlatformSettingsSection>
      )}

      <PlatformSettingsSection
        title="Health"
        description="Latest endpoint availability and validation state."
        icon={<Activity />}
      >
        <div className="inference-endpoint-detail__facts">
          <ReadOnlyFact
            label="Connection Status"
            value={<PlatformLabel variant={endpoint.statusVariant}>{endpoint.statusLabel}</PlatformLabel>}
          />
          <ReadOnlyFact label="Last Checked" value={endpoint.lastCheckedLabel} />
          <ReadOnlyFact label="Host" value={endpoint.hostLabel} />
          <ReadOnlyFact label="Configured Models" value={endpoint.modelCount} />
          <ReadOnlyFact
            label="API Key"
            value={endpoint.apiKeyConfigured || apiKeyConfigured ? "Configured" : "Not configured"}
          />
          <ReadOnlyFact label="Runtime" value={endpoint.runtimeLabel} />
        </div>
        {endpoint.lastError ? (
          <p className="inference-endpoint-detail__inline-error" role="alert">
            {endpoint.lastError}
          </p>
        ) : null}
      </PlatformSettingsSection>
    </PlatformSettingsSectionList>
  );

  const renderModels = () => (
    <PlatformSettingsSectionList>
      <PlatformSettingsSection
        title="Available Models"
        description={isExternal
          ? "Models discovered from or explicitly assigned to this endpoint."
          : "Models reported by the local inference runtime."}
        icon={<Boxes />}
        bodyPresentation="flush"
      >
        {isExternal && canConfigure ? (
          <div className="inference-endpoint-detail__model-entry">
            <input
              type="text"
              className="inference-endpoint-detail__input"
              value={modelInput}
              placeholder="gpt-oss-120b, qwen2.5-coder-32b"
              disabled={saving}
              onChange={(event) => setModelInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === ",") {
                  event.preventDefault();
                  submitModel();
                }
              }}
            />
            <PlatformSecondaryButton
              size="medium"
              disabled={saving || !modelInput.trim()}
              onClick={submitModel}
            >
              <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Add Model</span>
            </PlatformSecondaryButton>
          </div>
        ) : null}
        <PlatformSettingsDataTable<InferenceModelRow>
          rows={modelRows}
          columns={modelColumns}
          getRowId={(row) => row.id}
          ariaLabel="Inference endpoint models"
          sorting={{ defaultValue: { id: "model", direction: "asc" } }}
          toolbar={{
            search: {
              placeholder: "Search models",
              getSearchText: (row) => `${row.id} ${row.source}`,
            },
          }}
          getRowActions={modelActions}
          emptyState="No models are configured for this endpoint."
          noResultsState="No models match this search."
        />
      </PlatformSettingsSection>
    </PlatformSettingsSectionList>
  );

  const renderRuntime = () => (
    <PlatformSettingsSectionList>
      {isExternal && runtimeContent ? (
        <div className="inference-endpoint-detail__runtime-content">{runtimeContent}</div>
      ) : (
        <>
          <PlatformSettingsSection
            title="Local Runtime"
            description="Runtime identity and workspace placement for this endpoint."
            icon={<HardDrive />}
          >
            <div className="inference-endpoint-detail__facts">
              <ReadOnlyFact label="Runner Status" value={endpoint.device?.status || "Unknown"} />
              <ReadOnlyFact label="Hostname" value={endpoint.device?.hostname || "Unknown"} />
              <ReadOnlyFact label="Platform" value={endpoint.device?.platform || "Unknown"} />
              <ReadOnlyFact label="Bindings" value={bindingRows.length} />
            </div>
          </PlatformSettingsSection>
          <PlatformSettingsSection
            title="Workspace Bindings"
            description="Environments and projects connected to this local runner."
            icon={<ServerCog />}
            bodyPresentation="flush"
          >
            <PlatformSettingsDataTable<InferenceBindingRow>
              rows={bindingRows}
              columns={bindingColumns}
              getRowId={(row) => row.id}
              ariaLabel="Local inference workspace bindings"
              sorting={{ defaultValue: { id: "name", direction: "asc" } }}
              emptyState="No workspace bindings are attached to this runner."
            />
          </PlatformSettingsSection>
        </>
      )}
    </PlatformSettingsSectionList>
  );

  const sidebar = (
    <>
      <PlatformDetailSidebarSection title="Properties">
        <div className="inference-endpoint-detail__properties">
          <SidebarProperty label="Type" value={endpoint.kindLabel} />
          <SidebarProperty label="Provider" value={endpoint.providerLabel} />
          <SidebarProperty label="Runtime" value={endpoint.runtimeLabel} />
          {isExternal ? (
            <SidebarProperty label="Default" value={endpoint.isDefault ? "Yes" : "No"} />
          ) : null}
          <SidebarProperty
            label="Status"
            value={<PlatformLabel variant={endpoint.statusVariant}>{endpoint.statusLabel}</PlatformLabel>}
          />
          <SidebarProperty label="Models" value={endpoint.modelCount} />
          <SidebarProperty label="Last Checked" value={endpoint.lastCheckedLabel} />
        </div>
      </PlatformDetailSidebarSection>

      <PlatformDetailSidebarSection title="Actions">
        <div className="inference-endpoint-detail__actions">
          {isExternal ? (
            <PlatformPrimaryButton
              size="medium"
              fullWidth
              disabled={!canConfigure || testing || !String(settings.baseUrl || "").trim()}
              onClick={() => void onTestConnection()}
            >
              {testing
                ? <RefreshCw className="playground-spin" width={14} height={14} strokeWidth={1.8} />
                : <Activity width={14} height={14} strokeWidth={1.8} />}
              <span>{testing ? "Testing..." : "Test Connection"}</span>
            </PlatformPrimaryButton>
          ) : onRefreshLocalRunners ? (
            <PlatformSecondaryButton
              size="medium"
              fullWidth
              onClick={onRefreshLocalRunners}
            >
              <RefreshCw width={14} height={14} strokeWidth={1.8} />
              <span>Refresh Runner</span>
            </PlatformSecondaryButton>
          ) : null}
          {isExternal && !endpoint.isDefault && canConfigure ? (
            <PlatformSecondaryButton
              size="medium"
              fullWidth
              disabled={saving}
              onClick={() => onSettingsChange({ isDefault: true })}
            >
              <CloudCog width={14} height={14} strokeWidth={1.8} />
              <span>Make Default</span>
            </PlatformSecondaryButton>
          ) : null}
          {isExternal && configured && canConfigure ? (
            <PlatformSecondaryButton
              size="medium"
              fullWidth
              disabled={saving}
              onClick={() => setRemoveModalOpen(true)}
            >
              <Trash2 width={14} height={14} strokeWidth={1.8} />
              <span>Remove Endpoint</span>
            </PlatformSecondaryButton>
          ) : null}
        </div>
      </PlatformDetailSidebarSection>
    </>
  );

  return (
    <>
      {error ? <div className="inference-endpoint-detail__banner is-error" role="alert">{error}</div> : null}
      {success ? <div className="inference-endpoint-detail__banner is-success" role="status">{success}</div> : null}
      <ResourceDetailPage<InferenceEndpointDetailTab>
        header={
          <div className="inference-endpoint-detail__header">
            <PlatformIconButton
              size="small"
              aria-label="Back to inference endpoints"
              onClick={onBack}
            >
              <ArrowLeft width={15} height={15} strokeWidth={1.8} />
            </PlatformIconButton>
            <div className="inference-endpoint-detail__header-copy">
              <h1 className="inference-endpoint-detail__title">{endpoint.name}</h1>
              <PlatformLabel variant={endpoint.kind === "local" ? "blue" : "gray"}>
                {endpoint.kindLabel}
              </PlatformLabel>
            </div>
          </div>
        }
        tabs={DETAIL_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        sidebar={sidebar}
        sidebarCollapsed={sidebarCollapsed}
        sidebarToggle={
          <PlatformIconButton
            size="small"
            aria-label={sidebarCollapsed ? "Open endpoint sidebar" : "Close endpoint sidebar"}
            active={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((current) => !current)}
          >
            {sidebarCollapsed
              ? <PanelRightOpen width={15} height={15} strokeWidth={1.8} />
              : <PanelRightClose width={15} height={15} strokeWidth={1.8} />}
          </PlatformIconButton>
        }
        ariaLabel="Inference endpoint details"
        tabAriaLabel="Inference endpoint sections"
        sidebarAriaLabel="Inference endpoint settings"
        className="playground-project-overview-layout playground-agents-detail-overview-layout inference-endpoint-detail"
        tabBarClassName="playground-agents-overview-tabs playground-agents-detail-tabs inference-endpoint-detail__tabs"
        tabBarActionsClassName="playground-agents-detail-tab-actions inference-endpoint-detail__tab-actions"
        contentClassName="playground-project-overview-main playground-agents-detail-overview-main inference-endpoint-detail__main"
        sidebarClassName="playground-project-overview-sidebar playground-agents-detail-sidebar inference-endpoint-detail__sidebar"
      >
        {activeTab === "general"
          ? renderGeneral()
          : activeTab === "models"
            ? renderModels()
            : renderRuntime()}
      </ResourceDetailPage>

      <PlatformConfirmationModal
        open={removeModalOpen}
        title="Remove inference endpoint?"
        description="Agents will stop routing compatible workloads through this endpoint. The saved API key and configured model list will also be removed."
        confirmLabel="Remove Endpoint"
        confirmingLabel="Removing..."
        tone="destructive"
        onCancel={() => setRemoveModalOpen(false)}
        onConfirm={async () => {
          await onRemoveEndpoint();
          setRemoveModalOpen(false);
        }}
      />
    </>
  );
}
