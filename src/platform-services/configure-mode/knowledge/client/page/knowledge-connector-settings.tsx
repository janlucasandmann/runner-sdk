import { Check } from "../../../../../platform-ui/components/ui/hugeicons-compat.js";
import { useMemo, useState } from "react";

import { beginPlatformPluginConnection } from "../../../../../platform-resources/plugins/connections/index.js";
import { PlatformPrimaryButton } from "../../../../../platform-ui/components/ui/button/index.js";
import { PlatformLabel } from "../../../../../platform-ui/components/ui/label/index.js";
import { RunnerFileBrowserDialog } from "../../../../../react/runner-chat/file-browser-dialog.js";
import { IconAtlassian, IconNotion } from "../../../../../react/runner-chat/icons.js";
import { RunnerKnowledgeConfluenceResourceSettings } from "../../../../../react/runner-chat/project-confluence-resource-settings.js";
import { RunnerKnowledgeNotionResourceSettings } from "../../../../../react/runner-chat/project-notion-resource-settings.js";
import type { RunnerChatFileNode } from "../../../../../react/runner-chat/workspace-files.js";
import type { KnowledgeApi } from "../api/index.js";
import type { KnowledgeLibrary } from "../domain/index.js";

type KnowledgeConnectorProvider = "notion" | "confluence";

interface KnowledgeConnectorResource extends RunnerChatFileNode {
  provider: KnowledgeConnectorProvider;
  resourceType: "database" | "confluence_space";
  resourceKey?: string;
  cloudId?: string;
  siteUrl?: string;
  strategyKnowledgeSyncEnabled?: boolean;
  strategyKnowledgeSyncToNotionEnabled?: boolean;
  strategyKnowledgeSyncFromNotionEnabled?: boolean;
  strategyKnowledgeSyncToConfluenceEnabled?: boolean;
  strategyKnowledgeSyncFromConfluenceEnabled?: boolean;
}

interface KnowledgeConnectorMetadata {
  schemaVersion: "computer_agents_knowledge_connectors_v1";
  notion: KnowledgeConnectorResource[];
  confluence: KnowledgeConnectorResource[];
}

export interface KnowledgeConnectorSettingsProps {
  library: KnowledgeLibrary;
  api: KnowledgeApi;
  requestHeaders?: Readonly<Record<string, string>>;
  activeOrganizationId?: string;
  onLibraryChange: (library: KnowledgeLibrary) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function normalizeResource(
  provider: KnowledgeConnectorProvider,
  value: unknown,
): KnowledgeConnectorResource | null {
  const source = asRecord(value);
  const id = String(source.id || "").trim();
  if (!id) return null;
  return {
    id,
    name:
      String(source.name || "").trim() ||
      (provider === "notion" ? "Untitled database" : "Untitled Confluence space"),
    provider,
    resourceType: provider === "notion" ? "database" : "confluence_space",
    path: String(source.path || source.resourceKey || id).trim(),
    mimeType:
      provider === "notion"
        ? "application/x-notion-database"
        : "application/x-atlassian-confluence-space",
    resourceKey: String(source.resourceKey || "").trim(),
    cloudId: String(source.cloudId || "").trim(),
    siteUrl: String(source.siteUrl || "").trim(),
    ...(typeof source.strategyKnowledgeSyncEnabled === "boolean"
      ? { strategyKnowledgeSyncEnabled: source.strategyKnowledgeSyncEnabled }
      : {}),
    ...(typeof source.strategyKnowledgeSyncToNotionEnabled === "boolean"
      ? { strategyKnowledgeSyncToNotionEnabled: source.strategyKnowledgeSyncToNotionEnabled }
      : {}),
    ...(typeof source.strategyKnowledgeSyncFromNotionEnabled === "boolean"
      ? { strategyKnowledgeSyncFromNotionEnabled: source.strategyKnowledgeSyncFromNotionEnabled }
      : {}),
    ...(typeof source.strategyKnowledgeSyncToConfluenceEnabled === "boolean"
      ? {
          strategyKnowledgeSyncToConfluenceEnabled: source.strategyKnowledgeSyncToConfluenceEnabled,
        }
      : {}),
    ...(typeof source.strategyKnowledgeSyncFromConfluenceEnabled === "boolean"
      ? {
          strategyKnowledgeSyncFromConfluenceEnabled:
            source.strategyKnowledgeSyncFromConfluenceEnabled,
        }
      : {}),
  };
}

function readConnectorMetadata(library: KnowledgeLibrary): KnowledgeConnectorMetadata {
  const metadata = asRecord(library.metadata.knowledgeConnectors);
  const readResources = (provider: KnowledgeConnectorProvider) =>
    (Array.isArray(metadata[provider]) ? metadata[provider] : [])
      .map((value) => normalizeResource(provider, value))
      .filter((resource): resource is KnowledgeConnectorResource => Boolean(resource));
  return {
    schemaVersion: "computer_agents_knowledge_connectors_v1",
    notion: readResources("notion"),
    confluence: readResources("confluence"),
  };
}

export function isProjectManagedStrategyKnowledgeLibrary(library: KnowledgeLibrary): boolean {
  const metadata = asRecord(library.metadata);
  const projectId = String(metadata.projectId || metadata.project_id || "").trim();
  const purpose = String(metadata.purpose || "").trim();
  const schemaVersion = String(metadata.schemaVersion || metadata.schema_version || "").trim();
  return (
    Boolean(projectId) &&
    (["project_knowledge", "project_strategy_and_documentation"].includes(purpose) ||
      schemaVersion === "computer_agents_project_knowledge_v1")
  );
}

function mergeCatalogWithSelection(
  catalog: readonly KnowledgeConnectorResource[],
  selected: readonly KnowledgeConnectorResource[],
) {
  const byId = new Map(selected.map((resource) => [resource.id, resource]));
  catalog.forEach((resource) => {
    byId.set(resource.id, { ...byId.get(resource.id), ...resource });
  });
  return [...byId.values()];
}

function confluenceSpaceId(resource: KnowledgeConnectorResource) {
  if (resource.resourceKey) return resource.resourceKey;
  if (resource.id.startsWith("atlassian:confluence-space:")) {
    return resource.id.split(":").filter(Boolean).pop() || resource.id;
  }
  return resource.id;
}

export function KnowledgeConnectorSettings({
  library,
  api,
  requestHeaders = {},
  activeOrganizationId = "",
  onLibraryChange,
}: KnowledgeConnectorSettingsProps) {
  const connectorMetadata = useMemo(() => readConnectorMetadata(library), [library]);
  const projectManaged = isProjectManagedStrategyKnowledgeLibrary(library);
  const [browserProvider, setBrowserProvider] = useState<KnowledgeConnectorProvider | null>(null);
  const [catalog, setCatalog] = useState<KnowledgeConnectorResource[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [browserError, setBrowserError] = useState("");
  const [authSource, setAuthSource] = useState<"notion" | "atlassian" | null>(null);
  const [settingsError, setSettingsError] = useState("");
  const headers = useMemo(
    () => ({
      ...requestHeaders,
      ...(activeOrganizationId
        ? {
            "x-computer-agents-organization": activeOrganizationId,
          }
        : {}),
    }),
    [activeOrganizationId, requestHeaders],
  );

  async function loadCatalog(provider: KnowledgeConnectorProvider) {
    setLoading(true);
    setBrowserError("");
    setAuthSource(null);
    try {
      const url =
        provider === "notion"
          ? "/api/aios/notion/databases"
          : "/api/aios/jira/resources?folderId=root&product=confluence";
      const response = await fetch(url, {
        headers,
        credentials: "include",
        cache: "no-store",
      });
      const payload = asRecord(await response.json().catch(() => ({})));
      if (!response.ok) {
        if (response.status === 401) {
          setAuthSource(provider === "notion" ? "notion" : "atlassian");
        }
        throw new Error(
          String(payload.message || payload.error || "Failed to load connector resources."),
        );
      }
      const values =
        provider === "notion"
          ? Array.isArray(payload.databases)
            ? payload.databases
            : []
          : Array.isArray(payload.resources)
            ? payload.resources
            : [];
      const resources = values
        .map((value) => normalizeResource(provider, value))
        .filter((resource): resource is KnowledgeConnectorResource => Boolean(resource));
      setCatalog(mergeCatalogWithSelection(resources, connectorMetadata[provider]));
    } catch (error) {
      setCatalog([...connectorMetadata[provider]]);
      setBrowserError(
        error instanceof Error ? error.message : "Failed to load connector resources.",
      );
    } finally {
      setLoading(false);
    }
  }

  function openBrowser(provider: KnowledgeConnectorProvider) {
    if (projectManaged || saving) return;
    setBrowserProvider(provider);
    setSelectedIds(connectorMetadata[provider].map((resource) => resource.id));
    setCatalog([...connectorMetadata[provider]]);
    setSearchQuery("");
    void loadCatalog(provider);
  }

  function closeBrowser() {
    if (saving) return;
    setBrowserProvider(null);
    setCatalog([]);
    setSelectedIds([]);
    setSearchQuery("");
    setBrowserError("");
    setAuthSource(null);
  }

  async function persistProviderResources(
    provider: KnowledgeConnectorProvider,
    resources: KnowledgeConnectorResource[],
  ) {
    const nextConnectorMetadata: KnowledgeConnectorMetadata = {
      ...connectorMetadata,
      [provider]: resources,
    };
    const nextLibrary = await api.updateLibrary(library.id, {
      metadata: {
        ...library.metadata,
        knowledgeConnectors: nextConnectorMetadata,
      },
    });
    onLibraryChange(nextLibrary);
    return nextLibrary;
  }

  async function saveSelection() {
    if (!browserProvider || saving) return;
    setSaving(true);
    setSettingsError("");
    try {
      const selected = catalog.filter((resource) => selectedIds.includes(resource.id));
      await persistProviderResources(browserProvider, selected);
      setBrowserProvider(null);
      setCatalog([]);
      setSelectedIds([]);
      setSearchQuery("");
      setBrowserError("");
      setAuthSource(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update Knowledge connectors.";
      setBrowserError(message);
      setSettingsError(message);
    } finally {
      setSaving(false);
    }
  }

  async function updateResource(
    provider: KnowledgeConnectorProvider,
    resourceId: string,
    patch: Partial<KnowledgeConnectorResource>,
  ) {
    setSettingsError("");
    try {
      await persistProviderResources(
        provider,
        connectorMetadata[provider].map((resource) =>
          resource.id === resourceId ? { ...resource, ...patch } : resource,
        ),
      );
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Failed to update connector settings.",
      );
      throw error;
    }
  }

  async function disconnectResource(provider: KnowledgeConnectorProvider, resourceId: string) {
    setSettingsError("");
    try {
      await persistProviderResources(
        provider,
        connectorMetadata[provider].filter((resource) => resource.id !== resourceId),
      );
    } catch (error) {
      setSettingsError(
        error instanceof Error ? error.message : "Failed to disconnect connector resource.",
      );
      throw error;
    }
  }

  async function connect(provider: "notion" | "atlassian") {
    const connection = await beginPlatformPluginConnection(
      provider === "atlassian" ? "jira" : "notion",
      {
        redirectTo: typeof window === "undefined" ? "/" : window.location.href,
        organizationId: activeOrganizationId || undefined,
      },
    );
    if (typeof window !== "undefined" && connection.authUrl) {
      window.location.assign(connection.authUrl);
    }
  }

  const currentResources = browserProvider
    ? catalog.filter(
        (resource) =>
          !searchQuery.trim() ||
          resource.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : [];
  const connections = {
    github: { connected: false },
    "google-drive": { connected: false },
    "one-drive": { connected: false },
    notion: {
      connected: authSource !== "notion",
      onConnect: () => void connect("notion"),
    },
    atlassian: {
      connected: authSource !== "atlassian",
      onConnect: () => void connect("atlassian"),
    },
  };

  const renderBrowserItem = (item: RunnerChatFileNode) => {
    const resource = item as KnowledgeConnectorResource;
    const selected = selectedIds.includes(resource.id);
    return (
      <button
        type="button"
        key={resource.id}
        className={`tb-file-browser-item${selected ? " selected" : ""}`}
        onClick={() =>
          setSelectedIds((current) =>
            current.includes(resource.id)
              ? current.filter((id) => id !== resource.id)
              : [...current, resource.id],
          )
        }
      >
        <span className={`tb-file-browser-check${selected ? " selected" : ""}`} aria-hidden="true">
          {selected ? <Check className="tb-file-browser-check-icon" strokeWidth={2.2} /> : null}
        </span>
        {resource.provider === "notion" ? (
          <IconNotion className="tb-file-browser-item-icon tb-file-browser-source-brand-icon" />
        ) : (
          <IconAtlassian className="tb-file-browser-item-icon tb-file-browser-source-brand-icon" />
        )}
        <span className="tb-file-browser-item-name" title={resource.name}>
          {resource.name}
        </span>
        <span className="tb-file-browser-item-meta">
          {resource.provider === "notion" ? "Database" : "Space"}
        </span>
      </button>
    );
  };

  return (
    <section
      className={`knowledge-connector-settings${projectManaged ? " is-project-managed" : ""}`}
      aria-labelledby="knowledge-connectors-title"
      aria-disabled={projectManaged || undefined}
    >
      <div className="knowledge-connector-settings__heading">
        <div className="knowledge-connector-settings__heading-copy">
          <div className="knowledge-connector-settings__title-line">
            <h2 id="knowledge-connectors-title">Connectors</h2>
            {projectManaged ? (
              <PlatformLabel variant="gray">Managed at project level</PlatformLabel>
            ) : null}
          </div>
          <p>
            {projectManaged
              ? "Connector synchronization for this Strategy Knowledge library has to be changed in the project settings."
              : "Keep this Knowledge library synchronized with selected Notion databases and Confluence spaces."}
          </p>
        </div>
      </div>

      <div className="knowledge-connector-settings__providers">
        <div className="knowledge-connector-settings__provider-group">
          <div className="knowledge-connector-settings__provider-row">
            <div className="knowledge-connector-settings__provider-identity">
              <IconNotion className="knowledge-connector-settings__provider-icon" />
              <span>Notion</span>
            </div>
            <PlatformPrimaryButton
              type="button"
              size="small"
              disabled={projectManaged || saving}
              onClick={() => openBrowser("notion")}
            >
              Manage
            </PlatformPrimaryButton>
          </div>
          {!projectManaged && connectorMetadata.notion.length > 0 ? (
            <div className="knowledge-connector-settings__resources">
              {connectorMetadata.notion.map((resource) => (
                <RunnerKnowledgeNotionResourceSettings
                  key={resource.id}
                  organizationId={activeOrganizationId}
                  libraryId={library.id}
                  requestHeaders={requestHeaders}
                  resourceId={resource.id}
                  resourceName={resource.name}
                  resourceType="database"
                  knowledgeLabel="this Knowledge library"
                  strategyKnowledgeSyncEnabled={resource.strategyKnowledgeSyncEnabled}
                  strategyKnowledgeSyncToNotionEnabled={
                    resource.strategyKnowledgeSyncToNotionEnabled
                  }
                  strategyKnowledgeSyncFromNotionEnabled={
                    resource.strategyKnowledgeSyncFromNotionEnabled
                  }
                  onChange={(patch) => updateResource("notion", resource.id, patch)}
                  onDisconnect={() => disconnectResource("notion", resource.id)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="knowledge-connector-settings__provider-group">
          <div className="knowledge-connector-settings__provider-row">
            <div className="knowledge-connector-settings__provider-identity">
              <IconAtlassian className="knowledge-connector-settings__provider-icon" />
              <span>Confluence</span>
            </div>
            <PlatformPrimaryButton
              type="button"
              size="small"
              disabled={projectManaged || saving}
              onClick={() => openBrowser("confluence")}
            >
              Manage
            </PlatformPrimaryButton>
          </div>
          {!projectManaged && connectorMetadata.confluence.length > 0 ? (
            <div className="knowledge-connector-settings__resources">
              {connectorMetadata.confluence.map((resource) => (
                <RunnerKnowledgeConfluenceResourceSettings
                  key={resource.id}
                  organizationId={activeOrganizationId}
                  libraryId={library.id}
                  requestHeaders={requestHeaders}
                  resourceId={resource.id}
                  resourceName={resource.name}
                  spaceId={confluenceSpaceId(resource)}
                  cloudId={resource.cloudId}
                  siteUrl={resource.siteUrl}
                  knowledgeLabel="this Knowledge library"
                  strategyKnowledgeSyncEnabled={resource.strategyKnowledgeSyncEnabled}
                  strategyKnowledgeSyncToConfluenceEnabled={
                    resource.strategyKnowledgeSyncToConfluenceEnabled
                  }
                  strategyKnowledgeSyncFromConfluenceEnabled={
                    resource.strategyKnowledgeSyncFromConfluenceEnabled
                  }
                  onChange={(patch) => updateResource("confluence", resource.id, patch)}
                  onDisconnect={() => disconnectResource("confluence", resource.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {settingsError ? (
        <p className="knowledge-inline-error" role="alert">
          {settingsError}
        </p>
      ) : null}

      <RunnerFileBrowserDialog
        open={Boolean(browserProvider)}
        apiKeyPromptOpen={false}
        source={browserProvider === "confluence" ? "atlassian" : "notion"}
        resourceScope={browserProvider === "confluence" ? "confluence" : undefined}
        showSourceSidebar={false}
        showFilterTabs={false}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        environments={[]}
        selectedEnvironmentId={null}
        onEnvironmentSelect={() => undefined}
        onSourceChange={() => undefined}
        connections={connections}
        authSource={authSource}
        path={[
          {
            id: null,
            name: browserProvider === "confluence" ? "Confluence" : "Notion",
          },
        ]}
        historyIndex={0}
        historyLength={1}
        onBack={() => undefined}
        onForward={() => undefined}
        onBreadcrumbSelect={() => undefined}
        googleDriveItemCount={0}
        isGoogleDrivePickerLoading={false}
        loading={loading}
        error={browserError || null}
        showGoogleDrivePickerPrompt={false}
        items={currentResources}
        renderItem={renderBrowserItem}
        previewItem={null}
        previewContent={null}
        previewKind={null}
        isPreviewLoading={false}
        renderPreviewIcon={() => null}
        selectedItemCount={selectedIds.length}
        selectedItemLabel={`${selectedIds.length} ${
          browserProvider === "confluence"
            ? selectedIds.length === 1
              ? "space"
              : "spaces"
            : selectedIds.length === 1
              ? "database"
              : "databases"
        }`}
        allowEmptySelection
        isAttaching={saving}
        onAttach={saveSelection}
        onPreviewClose={() => undefined}
        onClose={closeBrowser}
        onApiKeyPromptClose={() => undefined}
      />
    </section>
  );
}
