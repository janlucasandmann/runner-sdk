import { ArrowLeft, Cpu, FolderOpen, Plus, Trash2 } from "../../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useEffect, useMemo, useRef, useState } from "react";
import type {
  PlatformDataTableAction,
  PlatformDataTableColumn,
} from "../../../../../../platform-ui/components/composite/data-table/index.js";
import { PlatformAnalyticsSection } from "../../../../../../platform-ui/components/composite/analytics/index.js";
import {
  PlatformConfirmationModal,
  PlatformModal,
} from "../../../../../../platform-ui/components/composite/modal/index.js";
import { PlatformEmptyState } from "../../../../../../platform-ui/components/composite/empty-state/index.js";
import { PlatformDiffViewer } from "../../../../../../platform-ui/components/composite/diff-viewer/index.js";
import type { PlatformOwnerOption } from "../../../../../../platform-ui/components/composite/owner-selector/index.js";
import { PlatformDeploymentMap } from "../../../../../../platform-ui/components/composite/deployment-map/index.js";
import { PlatformResourceDetailSidebar } from "../../../../../../platform-ui/components/composite/resource-detail-sidebar/index.js";
import {
  PlatformSettingsDataTable,
  PlatformSettingsSection,
  PlatformSettingsSectionList,
} from "../../../../../../platform-ui/components/composite/settings-section/index.js";
import {
  PlatformPrimaryButton,
  PlatformSecondaryButton,
} from "../../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../../platform-ui/components/ui/label/index.js";
import {
  PlatformButtonSelector,
  PlatformSelector,
} from "../../../../../../platform-ui/components/ui/selector/index.js";
import {
  PlatformServiceDetailPage,
  PlatformServiceDetailProperty,
  PlatformServiceDetailPropertyList,
} from "../../../../../../platform-ui/pages/details/index.js";
import {
  PlatformVersionChangesModal,
  PlatformVersionHistorySidebar,
  PlatformVersionSaveDialog,
  usePlatformVersionNavigationGuard,
  type PlatformVersionNavigationGuardRegistrar,
  type PlatformVersionSaveDetails,
} from "../../../../../../platform-ui/components/composite/versioning/index.js";
import { PlatformSwitch } from "../../../../../../platform-ui/components/ui/switch/index.js";
import {
  buildInferenceEndpointAnalytics,
  type InferenceEndpointAnalyticsTimeframe,
  type InferenceEndpointUsageAgent,
  type InferenceEndpointUsageThread,
} from "./inference-endpoint-analytics.js";
import {
  getInferenceEndpointCreatorIdentity,
  getInferenceEndpointIdentityKeys,
  getInferenceEndpointOwnerIdentity,
  getInferenceEndpointOwnerKey,
  mergeInferenceEndpointOwnerCandidates,
  normalizeInferenceEndpointIdentity,
  type InferenceEndpointIdentity,
  type InferenceEndpointIdentityInput,
} from "./inference-endpoint-owner.js";
import {
  buildInferenceEndpointDraft,
  buildInferenceEndpointRows,
  ORGANIZATION_INFERENCE_ENDPOINT_ID,
  type InferenceDeploymentProfileSnapshot,
  type InferenceEndpointRow,
  type InferenceEndpointCollectionSnapshot,
  type InferenceLocalRunnersSnapshot,
  type InferenceSettingsSnapshot,
  type InferenceEndpointVersion,
  type InferenceEndpointVersionSnapshot,
} from "../inference-endpoint-model.js";
import { INFERENCE_PROVIDER_OPTIONS } from "../inference-provider-options.js";
import {
  InferenceEndpointAccessSettings,
  type InferenceEndpointAccessTeam,
  type InferenceEndpointTeamShareResult,
} from "./inference-endpoint-access-settings.js";

export type InferenceEndpointDetailTab = "general" | "settings";

interface InferenceModelRow {
  id: string;
  source: string;
}

export interface InferenceEndpointDetailPageProps {
  endpointId: string;
  endpoints: InferenceEndpointCollectionSnapshot;
  settings: InferenceSettingsSnapshot;
  localRunners: InferenceLocalRunnersSnapshot;
  deploymentProfile?: InferenceDeploymentProfileSnapshot | null;
  activeTab?: InferenceEndpointDetailTab;
  usageThreads?: readonly InferenceEndpointUsageThread[];
  usageAgents?: readonly InferenceEndpointUsageAgent[];
  analyticsLoading?: boolean;
  analyticsError?: string;
  analyticsTimeframe?: InferenceEndpointAnalyticsTimeframe;
  onAnalyticsTimeframeChange?: (value: InferenceEndpointAnalyticsTimeframe) => void;
  currentUser?: InferenceEndpointIdentityInput;
  canConfigure?: boolean;
  saving?: boolean;
  testing?: boolean;
  error?: string;
  success?: string;
  apiKeyValue?: string;
  apiKeyConfigured?: boolean;
  selectedVersionId?: string;
  versionsOpen?: boolean;
  versionSaveDialog?: {
    open?: boolean;
    initialMode?: "current" | "new";
    instanceKey?: number;
    error?: string;
  };
  dirty?: boolean;
  onNavigationGuardChange?: PlatformVersionNavigationGuardRegistrar;
  onVersionHistoryOpenChange?: (open: boolean) => void;
  onVersionSelect?: (versionId: string) => void | Promise<void>;
  onVersionPublish?: (versionId: string) => void | Promise<void>;
  onOpenSaveDialog?: (mode?: "current" | "new") => void;
  onCloseSaveDialog?: () => void;
  onSaveVersion?: (details: PlatformVersionSaveDetails) => void | Promise<void>;
  onRevertChanges?: () => void;
  onBack: () => void;
  onSettingsChange: (patch: Partial<InferenceSettingsSnapshot>) => void;
  onApiKeyFocus?: () => void;
  onApiKeyBlur?: () => void;
  onApiKeyChange?: (value: string) => void;
  onRemoveSavedApiKey?: () => void;
  onAddModels: (value: string) => boolean | undefined;
  onRemoveModel: (modelId: string) => void;
  onTestConnection: () => void | Promise<void>;
  onRemoveEndpoint: () => void | Promise<void>;
  onOwnerCandidatesRequest?: () => Promise<readonly unknown[]>;
  onOwnerTransfer?: (owner: InferenceEndpointIdentity) => void | Promise<void>;
  workspaceTeams?: readonly unknown[];
  workspaceTeamsLoading?: boolean;
  onWorkspaceTeamsRequest?: () => void;
  onAccessMetadataChange?: (
    metadata: Record<string, unknown>,
    permissionSet?: Record<string, unknown> | null,
  ) => void | Promise<void>;
  onAddTeamShare?: (
    team: InferenceEndpointAccessTeam,
    metadata: Record<string, unknown>,
  ) => Promise<InferenceEndpointTeamShareResult>;
  onRemoveTeamShare?: (teamId: string, shareId: string) => Promise<void>;
}

function formatTimestamp(value: string | undefined): string {
  const timestamp = value ? Date.parse(value) : Number.NaN;
  if (!Number.isFinite(timestamp)) return "Never";
  return new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function buildVersionSnapshot(
  settings: InferenceSettingsSnapshot,
): InferenceEndpointVersionSnapshot {
  return {
    name: String(settings.name || "Inference Endpoint").trim() || "Inference Endpoint",
    description: String(settings.description || "").trim(),
    enabled: Boolean(settings.enabled),
    providerType: String(settings.providerType || "openai-compatible").trim(),
    baseUrl: String(settings.baseUrl || "").trim(),
    defaultModel: String(settings.defaultModel || "").trim(),
    availableModels: Array.from(
      new Set(
        (Array.isArray(settings.availableModels) ? settings.availableModels : [])
          .map((model) => String(model || "").trim())
          .filter(Boolean),
      ),
    ),
  };
}

function serializeVersionSnapshot(snapshot: InferenceEndpointVersionSnapshot): string {
  return `${JSON.stringify(snapshot, null, 2)}\n`;
}

function buildWholeFileDiff(
  previous: InferenceEndpointVersionSnapshot,
  next: InferenceEndpointVersionSnapshot,
): { diffContent: string; fileContent: string; additions: number; deletions: number } {
  const previousLines = serializeVersionSnapshot(previous).trimEnd().split("\n");
  const nextContent = serializeVersionSnapshot(next);
  const nextLines = nextContent.trimEnd().split("\n");
  if (previousLines.join("\n") === nextLines.join("\n")) {
    return { diffContent: "", fileContent: nextContent, additions: 0, deletions: 0 };
  }
  return {
    diffContent: [
      "--- a/inference-endpoint.json",
      "+++ b/inference-endpoint.json",
      `@@ -1,${previousLines.length} +1,${nextLines.length} @@`,
      ...previousLines.map((line) => `-${line}`),
      ...nextLines.map((line) => `+${line}`),
    ].join("\n"),
    fileContent: nextContent,
    additions: nextLines.length,
    deletions: previousLines.length,
  };
}

function buildModelRows(endpoint: InferenceEndpointRow): InferenceModelRow[] {
  return endpoint.models.map((modelId) => ({
    id: modelId,
    source: endpoint.kind === "local" ? endpoint.providerLabel : "Configured",
  }));
}

export function InferenceEndpointDetailPage({
  endpointId,
  endpoints: endpointCollection,
  settings,
  localRunners,
  deploymentProfile,
  activeTab: controlledActiveTab,
  usageThreads = [],
  usageAgents = [],
  analyticsLoading = false,
  analyticsError = "",
  analyticsTimeframe = "month",
  onAnalyticsTimeframeChange,
  currentUser = {},
  canConfigure = true,
  saving = false,
  testing = false,
  error = "",
  success = "",
  apiKeyValue = "",
  apiKeyConfigured = false,
  selectedVersionId: controlledSelectedVersionId = "",
  versionsOpen = false,
  versionSaveDialog = {},
  dirty = false,
  onNavigationGuardChange,
  onVersionHistoryOpenChange,
  onVersionSelect,
  onVersionPublish,
  onOpenSaveDialog,
  onCloseSaveDialog,
  onSaveVersion,
  onRevertChanges,
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
  onOwnerCandidatesRequest,
  onOwnerTransfer,
  workspaceTeams = [],
  workspaceTeamsLoading = false,
  onWorkspaceTeamsRequest,
  onAccessMetadataChange,
  onAddTeamShare,
  onRemoveTeamShare,
}: InferenceEndpointDetailPageProps) {
  const [modelInput, setModelInput] = useState("");
  const [modelModalOpen, setModelModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [ownerSelectorOpen, setOwnerSelectorOpen] = useState(false);
  const [accessDetailOpen, setAccessDetailOpen] = useState(false);
  const [versionChanges, setVersionChanges] = useState<{
    leftVersionId: string;
    rightVersionId: string;
  } | null>(null);
  const [ownerCandidateState, setOwnerCandidateState] = useState<{
    endpointId: string;
    status: "idle" | "loading" | "ready";
    candidates: InferenceEndpointIdentity[];
  }>({ endpointId, status: "idle", candidates: [] });
  const modelInputRef = useRef<HTMLInputElement>(null);
  const activeTab = controlledActiveTab || "general";
  const endpoints = useMemo(
    () => buildInferenceEndpointRows(endpointCollection, localRunners, deploymentProfile),
    [deploymentProfile, endpointCollection, localRunners],
  );
  const endpoint =
    endpoints.find((entry) => entry.id === endpointId) ||
    (endpointId === ORGANIZATION_INFERENCE_ENDPOINT_ID
      ? buildInferenceEndpointDraft(settings)
      : null);

  useEffect(() => {
    setModelInput("");
    setModelModalOpen(false);
    setRemoveModalOpen(false);
    setOwnerSelectorOpen(false);
    setAccessDetailOpen(false);
    setVersionChanges(null);
    setOwnerCandidateState({ endpointId, status: "idle", candidates: [] });
  }, [endpointId]);

  const versions: InferenceEndpointVersion[] =
    endpoint?.kind === "external" && Array.isArray(endpoint.versions) ? [...endpoint.versions] : [];
  const selectedVersionId =
    controlledSelectedVersionId ||
    endpoint?.currentVersionId ||
    versions[versions.length - 1]?.id ||
    "";
  const selectedVersion =
    versions.find((version) => version.id === selectedVersionId) ||
    versions.find((version) => version.id === endpoint?.currentVersionId) ||
    versions[versions.length - 1] ||
    null;
  const isHistorical = Boolean(
    endpoint?.kind === "external" &&
      selectedVersionId &&
      endpoint.currentVersionId &&
      selectedVersionId !== endpoint.currentVersionId,
  );

  usePlatformVersionNavigationGuard({
    dirty,
    enabled: endpoint?.kind === "external" && !isHistorical,
    guardId: "inference-endpoint-unsaved-changes",
    resourceId: endpointId,
    resourceName: endpoint?.name || "this inference endpoint",
    resourceType: "inference endpoint",
    onDiscard: onRevertChanges,
    onNavigationGuardChange,
  });

  useEffect(() => {
    if (!endpoint || endpoint.kind !== "external" || !onOpenSaveDialog) return undefined;
    const handleSaveShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "s" || (!event.metaKey && !event.ctrlKey)) return;
      event.preventDefault();
      event.stopPropagation();
      if (!dirty || isHistorical || saving || !canConfigure || versionSaveDialog.open) return;
      onOpenSaveDialog("new");
    };
    window.addEventListener("keydown", handleSaveShortcut, true);
    return () => window.removeEventListener("keydown", handleSaveShortcut, true);
  }, [
    canConfigure,
    dirty,
    endpoint,
    isHistorical,
    onOpenSaveDialog,
    saving,
    versionSaveDialog.open,
  ]);

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
  const isDeploymentManaged = Boolean(endpoint.deploymentManaged);
  const canManageAccess = isExternal || isDeploymentManaged;
  const modelRows = buildModelRows(endpoint);
  const providerValue = String(
    settings.providerType || endpoint.providerType || "openai-compatible",
  );
  const providerOptions = INFERENCE_PROVIDER_OPTIONS.some(
    (option) => option.value === providerValue,
  )
    ? INFERENCE_PROVIDER_OPTIONS
    : [...INFERENCE_PROVIDER_OPTIONS, { value: providerValue, label: endpoint.providerLabel }];
  const disabled = !canConfigure || endpoint.readOnly || saving || isHistorical;
  const viewerIdentity = normalizeInferenceEndpointIdentity(currentUser);
  const creatorIdentity = getInferenceEndpointCreatorIdentity(endpoint, viewerIdentity);
  const ownerIdentity = getInferenceEndpointOwnerIdentity(endpoint, creatorIdentity);
  const currentOwnerCandidateState =
    ownerCandidateState.endpointId === endpoint.id
      ? ownerCandidateState
      : { endpointId: endpoint.id, status: "idle" as const, candidates: [] };
  const ownerCandidates = mergeInferenceEndpointOwnerCandidates([
    ownerIdentity,
    creatorIdentity,
    viewerIdentity,
    ...currentOwnerCandidateState.candidates,
  ]);
  const ownerCandidateByValue = new Map(
    ownerCandidates.map((candidate) => [getInferenceEndpointOwnerKey(candidate), candidate]),
  );
  const ownerKeys = new Set(getInferenceEndpointIdentityKeys(ownerIdentity));
  const selectedOwnerCandidate = ownerCandidates.find((candidate) =>
    getInferenceEndpointIdentityKeys(candidate).some((key) => ownerKeys.has(key)),
  );
  const selectedOwnerValue = selectedOwnerCandidate
    ? getInferenceEndpointOwnerKey(selectedOwnerCandidate)
    : getInferenceEndpointOwnerKey(ownerIdentity);
  const canManageOwner =
    isExternal &&
    Boolean(onOwnerTransfer) &&
    getInferenceEndpointIdentityKeys(viewerIdentity).some((key) => ownerKeys.has(key));
  const ownerOptions: PlatformOwnerOption<string, { identity: InferenceEndpointIdentity }>[] =
    ownerCandidates.map((candidate) => ({
      value: getInferenceEndpointOwnerKey(candidate),
      name: candidate.name,
      email: candidate.email,
      avatarUrl: candidate.avatarUrl,
      description:
        candidate.email && candidate.name.toLowerCase() !== candidate.email.toLowerCase()
          ? candidate.email
          : undefined,
      data: { identity: candidate },
    }));
  const analytics = buildInferenceEndpointAnalytics({
    endpoint,
    threads: usageThreads,
    agents: usageAgents,
    timeframe: analyticsTimeframe,
    loading: analyticsLoading,
    error: analyticsError,
  });

  const loadOwnerCandidates = async () => {
    if (!onOwnerCandidatesRequest || currentOwnerCandidateState.status !== "idle") return;
    setOwnerCandidateState({
      endpointId: endpoint.id,
      status: "loading",
      candidates: currentOwnerCandidateState.candidates,
    });
    try {
      const candidates = await onOwnerCandidatesRequest();
      setOwnerCandidateState({
        endpointId: endpoint.id,
        status: "ready",
        candidates: candidates.map((candidate) => normalizeInferenceEndpointIdentity(candidate)),
      });
    } catch {
      setOwnerCandidateState({ endpointId: endpoint.id, status: "ready", candidates: [] });
    }
  };

  const handleOwnerSelectorOpenChange = (open: boolean) => {
    if (open && (!canManageOwner || saving)) return;
    setOwnerSelectorOpen(open);
    if (open) void loadOwnerCandidates();
  };

  const transferOwner = async (
    value: string,
    option?: PlatformOwnerOption<string, { identity: InferenceEndpointIdentity }>,
  ) => {
    const nextOwner = option?.data?.identity
      ? normalizeInferenceEndpointIdentity(option.data.identity)
      : ownerCandidateByValue.get(value);
    if (!nextOwner || !canManageOwner || saving || !onOwnerTransfer) return;
    setOwnerSelectorOpen(false);
    await onOwnerTransfer(nextOwner);
  };

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
  const modelActions = (
    row: InferenceModelRow,
  ): readonly PlatformDataTableAction<InferenceModelRow>[] =>
    isExternal && canConfigure
      ? [
          {
            id: "remove",
            label: "Remove Model",
            icon: Trash2,
            onSelect: () => onRemoveModel(row.id),
          },
        ]
      : [];

  const submitModel = () => {
    const normalized = modelInput.trim();
    if (!normalized) return;
    const added = onAddModels(normalized);
    if (added !== false) {
      setModelInput("");
      setModelModalOpen(false);
    }
  };

  const closeModelModal = () => {
    if (saving) return;
    setModelModalOpen(false);
    setModelInput("");
  };

  const renderGeneral = () => (
    <>
      <section
        className="platform-service-detail-identity inference-endpoint-detail__identity"
        aria-label="Inference endpoint identity"
      >
        <span
          className="platform-service-detail-identity__avatar inference-endpoint-detail__identity-icon"
          aria-hidden="true"
        >
          <Cpu width={22} height={22} strokeWidth={1.7} />
        </span>
        <div className="platform-service-detail-identity__copy">
          <input
            type="text"
            className="platform-service-detail-identity__title-input inference-endpoint-detail__identity-name"
            value={isExternal ? String(settings.name ?? endpoint.name) : endpoint.name}
            placeholder="Inference endpoint"
            aria-label="Inference endpoint name"
            title={isExternal ? String(settings.name ?? endpoint.name) : endpoint.name}
            maxLength={120}
            readOnly={disabled}
            onChange={(event) => onSettingsChange({ name: event.currentTarget.value })}
          />
          <input
            type="text"
            className="platform-service-detail-identity__description-input inference-endpoint-detail__identity-description"
            value={
              isExternal
                ? String(settings.description ?? endpoint.description)
                : endpoint.description
            }
            placeholder="Describe how this inference endpoint should be used"
            aria-label="Inference endpoint description"
            title={
              isExternal
                ? String(settings.description ?? endpoint.description)
                : endpoint.description
            }
            maxLength={280}
            readOnly={disabled}
            onChange={(event) => onSettingsChange({ description: event.currentTarget.value })}
          />
        </div>
        <PlatformSwitch
          className="inference-endpoint-detail__identity-timeframe"
          value={
            analyticsTimeframe === "day" || analyticsTimeframe === "week"
              ? analyticsTimeframe
              : "month"
          }
          options={[
            { value: "day", label: "24H" },
            { value: "week", label: "7D" },
            { value: "month", label: "30D" },
          ]}
          onValueChange={(value) =>
            onAnalyticsTimeframeChange?.(value === "day" || value === "week" ? value : "month")
          }
          ariaLabel="Inference activity time frame"
        />
      </section>
      <PlatformAnalyticsSection
        variant="default"
        title="Activity"
        analytics={analytics}
        className="playground-evaluations-analytics-card inference-endpoint-detail__analytics"
      />
      {renderModelsSection()}
      <PlatformSettingsSectionList>
        {isExternal ? (
          <PlatformSettingsSection
            title="Endpoint Configuration"
            className="inference-endpoint-detail__settings-detail-section inference-endpoint-detail__configuration-section"
            bodyPresentation="flush"
          >
            <PlatformServiceDetailPropertyList className="inference-endpoint-detail__settings-detail-list inference-endpoint-detail__configuration-list">
              <PlatformServiceDetailProperty label="Provider">
                <PlatformSelector
                  value={providerValue}
                  options={providerOptions}
                  onValueChange={(value) =>
                    onSettingsChange({
                      providerType: value,
                      healthStatus: "idle",
                      lastValidatedAt: "",
                      lastError: "",
                    })
                  }
                  ariaLabel="Inference provider"
                  alignment="end"
                  popupAlignment="right"
                  disabled={disabled}
                />
              </PlatformServiceDetailProperty>
              <PlatformServiceDetailProperty label="Endpoint URL">
                <input
                  id="inference-endpoint-url"
                  type="url"
                  className="inference-endpoint-detail__input inference-endpoint-detail__settings-control"
                  value={String(settings.baseUrl || "")}
                  placeholder="https://models.example.com/v1"
                  aria-label="Endpoint URL"
                  disabled={disabled}
                  onChange={(event) =>
                    onSettingsChange({
                      baseUrl: event.target.value,
                      healthStatus: "idle",
                      lastValidatedAt: "",
                      lastError: "",
                    })
                  }
                />
              </PlatformServiceDetailProperty>
              <PlatformServiceDetailProperty label="API Key">
                <div className="inference-endpoint-detail__input-shell inference-endpoint-detail__settings-control">
                  <input
                    id="inference-endpoint-api-key"
                    type="password"
                    className="inference-endpoint-detail__input"
                    value={apiKeyValue}
                    placeholder="sk-..."
                    aria-label="API Key"
                    disabled={disabled}
                    onFocus={onApiKeyFocus}
                    onBlur={onApiKeyBlur}
                    onChange={(event) => onApiKeyChange?.(event.target.value)}
                  />
                  {apiKeyConfigured && onRemoveSavedApiKey ? (
                    <PlatformSecondaryButton
                      size="compact"
                      className="inference-endpoint-detail__input-action"
                      disabled={disabled}
                      onClick={onRemoveSavedApiKey}
                    >
                      Remove
                    </PlatformSecondaryButton>
                  ) : null}
                </div>
              </PlatformServiceDetailProperty>
            </PlatformServiceDetailPropertyList>
          </PlatformSettingsSection>
        ) : (
          <PlatformSettingsSection
            title={
              endpoint.deploymentManaged ? "Deployment Configuration" : "Endpoint Configuration"
            }
            className="inference-endpoint-detail__settings-detail-section inference-endpoint-detail__configuration-section"
            bodyPresentation="flush"
          >
            <PlatformServiceDetailPropertyList className="inference-endpoint-detail__settings-detail-list inference-endpoint-detail__configuration-list">
              <PlatformServiceDetailProperty
                label={endpoint.deploymentManaged ? "Deployment" : "Runner"}
              >
                {endpoint.deploymentManaged
                  ? "Local Appliance"
                  : endpoint.device?.name || "Local Runner"}
              </PlatformServiceDetailProperty>
              <PlatformServiceDetailProperty label="Host">
                {endpoint.hostLabel}
              </PlatformServiceDetailProperty>
              <PlatformServiceDetailProperty label="Provider">
                {endpoint.providerLabel}
              </PlatformServiceDetailProperty>
              {endpoint.deploymentManaged ? (
                <PlatformServiceDetailProperty label="Mode">
                  Fixed deployment model
                </PlatformServiceDetailProperty>
              ) : (
                <>
                  <PlatformServiceDetailProperty label="Platform">
                    {endpoint.device?.platform || "Unknown"}
                  </PlatformServiceDetailProperty>
                  <PlatformServiceDetailProperty label="Daemon">
                    {endpoint.device?.daemonVersion || "Unknown"}
                  </PlatformServiceDetailProperty>
                  <PlatformServiceDetailProperty label="App Version">
                    {endpoint.device?.appVersion || "Unknown"}
                  </PlatformServiceDetailProperty>
                </>
              )}
            </PlatformServiceDetailPropertyList>
          </PlatformSettingsSection>
        )}
      </PlatformSettingsSectionList>
    </>
  );

  const renderModelsSection = () => (
    <PlatformSettingsDataTable<InferenceModelRow>
      className="platform-resource-access-table inference-endpoint-detail__models-table"
      rows={modelRows}
      columns={modelColumns}
      getRowId={(row) => row.id}
      ariaLabel="Inference endpoint models"
      layout="fill"
      sorting={{ defaultValue: { id: "model", direction: "asc" } }}
      toolbar={{
        title: "Available Models",
        controlsLeading:
          isExternal && canConfigure ? (
            <PlatformSecondaryButton
              size="small"
              disabled={disabled}
              onClick={() => setModelModalOpen(true)}
            >
              <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Add Model</span>
            </PlatformSecondaryButton>
          ) : undefined,
        search: {
          placeholder: "Search models",
          getSearchText: (row) => `${row.id} ${row.source}`,
        },
      }}
      getRowActions={modelActions}
      emptyState={
        <PlatformEmptyState
          title="No models are configured for this endpoint."
          className="inference-endpoint-detail__models-empty-state"
        />
      }
      noResultsState="No models match this search."
    />
  );

  const endpointMetadata = endpoint.metadata || {};
  const storageRegion =
    String(
      endpointMetadata.storageRegion ||
        endpointMetadata.deploymentRegion ||
        endpointMetadata.region ||
        endpointMetadata.location ||
        "europe-west1",
    ).trim() || "europe-west1";
  const deploymentRegionLatitude = Number(endpointMetadata.deploymentRegionLatitude);
  const deploymentRegionLongitude = Number(endpointMetadata.deploymentRegionLongitude);
  const deploymentRegionLocation =
    Number.isFinite(deploymentRegionLatitude) && Number.isFinite(deploymentRegionLongitude)
      ? {
          code: storageRegion,
          label:
            String(endpointMetadata.deploymentRegionLabel || storageRegion).trim() || storageRegion,
          latitude: deploymentRegionLatitude,
          longitude: deploymentRegionLongitude,
        }
      : undefined;
  const renderSettings = () => (
    <div className="playground-server-detail-content inference-endpoint-detail__settings-content">
      <div className="playground-server-settings-tab is-function-settings-tab inference-endpoint-detail__settings-layout">
        <PlatformDeploymentMap
          regionCode={storageRegion}
          title="Deployment region"
          location={deploymentRegionLocation}
          className="playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map inference-endpoint-detail__storage-map"
        />
        {canManageAccess && onAccessMetadataChange && onAddTeamShare && onRemoveTeamShare ? (
          <InferenceEndpointAccessSettings
            key={endpoint.id}
            endpoint={endpoint}
            workspaceTeams={workspaceTeams}
            workspaceTeamsLoading={workspaceTeamsLoading}
            onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
            onMetadataChange={onAccessMetadataChange}
            onAddTeamShare={onAddTeamShare}
            onRemoveTeamShare={onRemoveTeamShare}
            onPermissionDetailOpenChange={setAccessDetailOpen}
          />
        ) : (
          <div className="inference-endpoint-detail__access-unavailable">
            Access management is unavailable for this endpoint.
          </div>
        )}
      </div>
    </div>
  );

  const primaryAction = isExternal ? (
    <PlatformButtonSelector
      mode="split-action"
      buttonVariant="primary"
      buttonSize="small"
      label={testing ? "Testing..." : "Test Connection"}
      actionAriaLabel="Test Connection"
      popupAriaLabel="Inference endpoint actions"
      popupAlignment="right"
      popupRole="menu"
      popupVariant="minimal"
      popupWidth={210}
      closeOnSelect
      fullWidth
      className="inference-endpoint-detail__primary-action"
      actionDisabled={testing || !canConfigure || !String(settings.baseUrl || "").trim()}
      popupDisabled={saving || !canConfigure}
      onAction={() => onTestConnection()}
    >
      <button
        type="button"
        role="menuitem"
        className="platform-data-table__menu-item"
        disabled={saving}
        onClick={() => setRemoveModalOpen(true)}
      >
        <Trash2
          className="platform-data-table__menu-icon"
          width={14}
          height={14}
          strokeWidth={1.8}
          aria-hidden="true"
        />
        <span className="platform-data-table__menu-copy">Delete</span>
      </button>
    </PlatformButtonSelector>
  ) : null;
  const sidebarContent = (
    <PlatformResourceDetailSidebar<string, { identity: InferenceEndpointIdentity }>
      attributes={[
        {
          id: "status",
          label: "Status",
          value: (
            <PlatformLabel variant={endpoint.statusVariant}>{endpoint.statusLabel}</PlatformLabel>
          ),
        },
        { id: "models", label: "Models", value: endpoint.modelCount },
        { id: "last-checked", label: "Last Checked", value: endpoint.lastCheckedLabel },
        {
          id: "updated",
          label: "Updated",
          value: formatTimestamp(endpoint.updatedAt),
          hidden: !isExternal,
        },
      ]}
      creator={
        canManageAccess
          ? {
              value: getInferenceEndpointOwnerKey(creatorIdentity),
              name: creatorIdentity.name,
              email: creatorIdentity.email,
              avatarUrl: creatorIdentity.avatarUrl,
            }
          : undefined
      }
      owner={
        canManageAccess
          ? {
              value: selectedOwnerValue,
              name: ownerIdentity.name,
              email: ownerIdentity.email,
              avatarUrl: ownerIdentity.avatarUrl,
            }
          : undefined
      }
      ownerOptions={ownerOptions}
      onOwnerTransfer={isExternal ? (value, option) => transferOwner(value, option) : undefined}
      ownerSelectorProps={{
        open: ownerSelectorOpen,
        onOpenChange: handleOwnerSelectorOpenChange,
        ariaLabel: "Choose inference endpoint owner",
        resourceLabel: "inference endpoint",
        alignment: "end",
        popupAlignment: "right",
        fullWidth: true,
        disabled: saving || !canManageOwner,
        loading: currentOwnerCandidateState.status === "loading",
        loadingContent: "Loading organization members...",
        emptyContent: "No organization members are available.",
        popupWidth: 260,
        popupMaxHeight: "min(320px, calc(100vh - 180px))",
        triggerClassName: "inference-endpoint-detail__owner-trigger",
        popupClassName: "inference-endpoint-detail__owner-menu",
        optionClassName: "inference-endpoint-detail__owner-option",
      }}
      primaryAction={primaryAction}
      className="platform-service-detail-page__sidebar-card playground-evaluations-detail-sidebar-card inference-endpoint-detail__properties"
      propertiesClassName="inference-endpoint-detail__properties-list"
    />
  );
  const endpointProjectId = String(
    endpointMetadata.projectId || endpointMetadata.project_id || "",
  ).trim();
  const endpointProjectName = String(
    endpointMetadata.projectName || endpointMetadata.project_name || endpointProjectId,
  ).trim();
  const accessSettings =
    canManageAccess && onAccessMetadataChange && onAddTeamShare && onRemoveTeamShare ? (
      <InferenceEndpointAccessSettings
        key={endpoint.id}
        endpoint={endpoint}
        workspaceTeams={workspaceTeams}
        workspaceTeamsLoading={workspaceTeamsLoading}
        onWorkspaceTeamsRequest={onWorkspaceTeamsRequest}
        onMetadataChange={onAccessMetadataChange}
        onAddTeamShare={onAddTeamShare}
        onRemoveTeamShare={onRemoveTeamShare}
        onPermissionDetailOpenChange={setAccessDetailOpen}
      />
    ) : (
      <div className="inference-endpoint-detail__access-unavailable">
        Access management is unavailable for this endpoint.
      </div>
    );
  const resourceSettings =
    activeTab === "settings"
      ? {
          ariaLabel: "Inference endpoint settings",
          className: "inference-endpoint-detail__settings-content",
          identity: {
            icon: <Cpu width={24} height={24} strokeWidth={1.7} aria-hidden="true" />,
            title: isExternal ? String(settings.name ?? endpoint.name) : endpoint.name,
            description: isExternal
              ? String(settings.description ?? endpoint.description)
              : endpoint.description,
            onTitleChange:
              isExternal && !disabled
                ? (value: string) => onSettingsChange({ name: value })
                : undefined,
            onDescriptionChange:
              isExternal && !disabled
                ? (value: string) => onSettingsChange({ description: value })
                : undefined,
            titlePlaceholder: "Inference endpoint",
            descriptionPlaceholder: "Describe how this inference endpoint should be used",
            titleAriaLabel: "Inference endpoint name",
            descriptionAriaLabel: "Inference endpoint description",
            readOnly: !isExternal || disabled,
          },
          details: {
            variant: "standard" as const,
            customAttributes: [
              {
                id: "status",
                label: "Status",
                value: (
                  <PlatformLabel variant={endpoint.statusVariant}>
                    {endpoint.statusLabel}
                  </PlatformLabel>
                ),
              },
              { id: "models", label: "Models", value: endpoint.modelCount },
              { id: "last-checked", label: "Last Checked", value: endpoint.lastCheckedLabel },
            ],
            updatedAt: endpoint.updatedAt,
            creator: {
              value: getInferenceEndpointOwnerKey(creatorIdentity) || "inference-creator",
              name: creatorIdentity.name || creatorIdentity.email || "Unknown",
              email: creatorIdentity.email,
              avatarUrl: creatorIdentity.avatarUrl,
            },
            owner: {
              value: selectedOwnerValue || "inference-owner",
              name: ownerIdentity.name || ownerIdentity.email || "Unknown",
              email: ownerIdentity.email,
              avatarUrl: ownerIdentity.avatarUrl,
            },
            ownerOptions,
            onOwnerTransfer: isExternal ? transferOwner : undefined,
            ownerSelectorProps: {
              open: ownerSelectorOpen,
              onOpenChange: handleOwnerSelectorOpenChange,
              ariaLabel: "Choose inference endpoint owner",
              resourceLabel: "inference endpoint",
              alignment: "end" as const,
              popupAlignment: "right" as const,
              fullWidth: true,
              disabled: saving || !canManageOwner,
              loading: currentOwnerCandidateState.status === "loading",
              loadingContent: "Loading organization members...",
              emptyContent: "No organization members are available.",
              popupWidth: 260,
              popupMaxHeight: "min(320px, calc(100vh - 180px))",
            },
            scope: endpointProjectId
              ? {
                  values: [endpointProjectId],
                  options: [
                    {
                      value: endpointProjectId,
                      label: endpointProjectName || endpointProjectId,
                      leading: (
                        <FolderOpen width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
                      ),
                    },
                  ],
                  disabled: true,
                }
              : {},
            primaryActions: [
              {
                id: "test-connection",
                label: testing ? "Testing..." : "Test Connection",
                onSelect: isExternal ? onTestConnection : undefined,
                disabled:
                  !isExternal || testing || !canConfigure || !String(settings.baseUrl || "").trim(),
              },
              ...(isExternal
                ? [
                    {
                      id: "delete",
                      label: "Delete",
                      onSelect: () => setRemoveModalOpen(true),
                      disabled: saving || !canConfigure,
                    },
                  ]
                : []),
            ] as [
              {
                id: string;
                label: string;
                onSelect?: () => void | Promise<void>;
                disabled?: boolean;
              },
              ...Array<{
                id: string;
                label: string;
                onSelect?: () => void | Promise<void>;
                disabled?: boolean;
              }>,
            ],
            className: "inference-endpoint-detail__properties",
            propertiesClassName: "inference-endpoint-detail__properties-list",
          },
          location: (
            <PlatformDeploymentMap
              regionCode={storageRegion}
              title="Deployment region"
              location={deploymentRegionLocation}
              className="playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map inference-endpoint-detail__storage-map"
            />
          ),
          access: accessSettings,
          accessDetailOpen,
          detailsSidebarCollapsed: versionsOpen,
          detailsSidebarAriaLabel: "Inference endpoint settings",
          detailsSidebarClassName:
            "playground-evaluations-detail-sidebar inference-endpoint-detail__sidebar",
        }
      : undefined;
  const draftSnapshot = buildVersionSnapshot(settings);
  const baselineSnapshot = selectedVersion?.snapshot
    ? buildVersionSnapshot(selectedVersion.snapshot)
    : draftSnapshot;
  const saveDiff = buildWholeFileDiff(baselineSnapshot, draftSnapshot);
  const latestVersionNumber = versions.reduce(
    (latest, version) => Math.max(latest, Number(version.number || version.versionNumber || 0)),
    0,
  );
  const sortedVersions = [...versions].sort((left, right) => left.number - right.number);
  const versionSelectorOptions = sortedVersions.map((version) => ({
    value: version.id,
    label: `v${version.number}`,
  }));
  const leftComparisonVersion = versionChanges
    ? versions.find((version) => version.id === versionChanges.leftVersionId) || null
    : null;
  const rightComparisonVersion = versionChanges
    ? versions.find((version) => version.id === versionChanges.rightVersionId) || null
    : null;
  const comparisonDiff =
    leftComparisonVersion && rightComparisonVersion
      ? buildWholeFileDiff(
          buildVersionSnapshot(leftComparisonVersion.snapshot),
          buildVersionSnapshot(rightComparisonVersion.snapshot),
        )
      : null;
  const versionDrawerTarget =
    typeof document !== "undefined"
      ? document.getElementById("playground-agent-versions-drawer-root")
      : null;
  const openVersionChanges = () => {
    const rightVersion =
      versions.find((version) => version.id === selectedVersionId) ||
      sortedVersions[sortedVersions.length - 1];
    if (!rightVersion) return;
    const rightIndex = sortedVersions.findIndex((version) => version.id === rightVersion.id);
    const leftVersion = sortedVersions[Math.max(0, rightIndex - 1)] || rightVersion;
    setVersionChanges({
      leftVersionId: leftVersion.id,
      rightVersionId: rightVersion.id,
    });
    onVersionHistoryOpenChange?.(false);
  };
  const versionChangesModal = versionChanges ? (
    <PlatformVersionChangesModal
      open
      title="Changes"
      subtitle="Compare saved inference endpoint configurations. Credentials are never included in version history."
      files={
        comparisonDiff?.diffContent
          ? [
              {
                id: "inference-endpoint.json",
                filePath: "inference-endpoint.json",
                label: "inference-endpoint.json",
                ...comparisonDiff,
              },
            ]
          : []
      }
      leftSelector={{
        value: versionChanges.leftVersionId,
        options: versionSelectorOptions,
        onValueChange: (value) =>
          setVersionChanges((current) =>
            current ? { ...current, leftVersionId: value } : current,
          ),
        ariaLabel: "Select base inference endpoint version",
      }}
      rightSelector={{
        value: versionChanges.rightVersionId,
        options: versionSelectorOptions,
        onValueChange: (value) =>
          setVersionChanges((current) =>
            current ? { ...current, rightVersionId: value } : current,
          ),
        ariaLabel: "Select target inference endpoint version",
      }}
      onClose={() => setVersionChanges(null)}
      closeButtonLabel="Close inference endpoint changes"
      emptyMessage="No configuration differences between these versions."
      contentClassName="inference-endpoint-detail__version-changes"
    />
  ) : null;

  return (
    <>
      {error ? (
        <div className="inference-endpoint-detail__banner is-error" role="alert">
          {error}
        </div>
      ) : null}
      {success ? (
        <div className="inference-endpoint-detail__banner is-success" role="status">
          {success}
        </div>
      ) : null}
      <PlatformServiceDetailPage
        settings={resourceSettings}
        sidebarContent={sidebarContent}
        sidebarCollapsed={versionsOpen || (activeTab === "settings" && accessDetailOpen)}
        ariaLabel="Inference endpoint details"
        sidebarAriaLabel="Inference endpoint settings"
        className={`playground-evaluations-detail-overview-layout inference-endpoint-detail is-${activeTab}-tab`}
        contentClassName="playground-evaluations-detail-overview-main inference-endpoint-detail__main"
        sidebarClassName="playground-evaluations-detail-sidebar inference-endpoint-detail__sidebar"
      >
        {activeTab === "settings" ? renderSettings() : renderGeneral()}
      </PlatformServiceDetailPage>

      {versionChangesModal}

      <PlatformModal
        open={modelModalOpen}
        title="Add Model"
        onClose={closeModelModal}
        closeOnBackdrop={!saving}
        closeOnEscape={!saving}
        closeButtonDisabled={saving}
        initialFocusRef={modelInputRef}
        as="form"
        size="small"
        className="inference-endpoint-model-modal"
        surfaceProps={{
          onSubmit: (event) => {
            event.preventDefault();
            submitModel();
          },
        }}
        footer={
          <>
            <PlatformSecondaryButton
              size="medium"
              type="button"
              disabled={saving}
              onClick={closeModelModal}
            >
              Cancel
            </PlatformSecondaryButton>
            <PlatformPrimaryButton
              size="medium"
              type="submit"
              disabled={saving || !modelInput.trim()}
            >
              <Plus width={14} height={14} strokeWidth={1.8} aria-hidden="true" />
              <span>Add Model</span>
            </PlatformPrimaryButton>
          </>
        }
      >
        <label className="inference-endpoint-model-modal__field">
          <span>Model name</span>
          <input
            ref={modelInputRef}
            type="text"
            className="inference-endpoint-detail__input"
            value={modelInput}
            placeholder="gpt-oss-120b"
            autoComplete="off"
            disabled={saving}
            onChange={(event) => setModelInput(event.target.value)}
          />
        </label>
      </PlatformModal>

      <PlatformVersionSaveDialog
        open={Boolean(versionSaveDialog.open)}
        title="Review changes"
        currentVersion={endpoint.currentVersionNumber || selectedVersion?.number || 1}
        nextVersion={latestVersionNumber + 1}
        currentDescription={
          versions.find((version) => version.id === endpoint.currentVersionId)?.description || ""
        }
        initialMode={versionSaveDialog.initialMode === "current" ? "current" : "new"}
        canSaveCurrent={Boolean(endpoint.currentVersionId)}
        instanceKey={versionSaveDialog.instanceKey}
        pending={saving}
        error={versionSaveDialog.error || null}
        changes={
          saveDiff.diffContent
            ? [
                {
                  id: "inference-endpoint.json",
                  label: "inference-endpoint.json",
                  content: (
                    <PlatformDiffViewer
                      filePath="inference-endpoint.json"
                      {...saveDiff}
                      hideTopbar
                      embedded
                      defaultExpanded
                      maxHeight={330}
                    />
                  ),
                },
              ]
            : []
        }
        emptyChanges="Only the encrypted credential changed; secrets are intentionally omitted from version history."
        onClose={() => onCloseSaveDialog?.()}
        onSubmit={(details) => onSaveVersion?.(details)}
      />

      <PlatformVersionHistorySidebar<InferenceEndpointVersion>
        open={versionsOpen}
        title="Version history"
        sectionTitle="All Versions"
        versions={versions}
        activeVersionId={endpoint.publishedVersionId}
        selectedVersionId={selectedVersionId}
        busy={saving || dirty}
        portal={Boolean(versionDrawerTarget)}
        portalTarget={versionDrawerTarget}
        width="var(--playground-thread-task-detail-width)"
        onClose={() => {
          setVersionChanges(null);
          onVersionHistoryOpenChange?.(false);
        }}
        onCreateVersion={() => onOpenSaveDialog?.("new")}
        onSelectVersion={(versionId) => {
          setVersionChanges(null);
          return onVersionSelect?.(versionId);
        }}
        onPublishVersion={(versionId) => onVersionPublish?.(versionId)}
        onViewChanges={openVersionChanges}
        canPublishVersion={(version) => version.id !== endpoint.publishedVersionId}
        getVersionCreatedAt={(version) => formatTimestamp(version.createdAt || version.updatedAt)}
        emptyDescription="Save a version to retain a stable inference endpoint configuration."
      />

      <PlatformConfirmationModal
        open={removeModalOpen}
        title="Delete inference endpoint?"
        description="Agents will stop routing compatible workloads through this endpoint. Its saved API key and configured model list will be permanently deleted."
        confirmLabel="Delete Endpoint"
        confirmingLabel="Deleting..."
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
