import { useEffect, useMemo, useState } from "react";
import {
  PlatformConnectorConfiguration,
  PlatformConnectorConfigurationRow,
} from "../../platform-ui/components/composite/connector-configuration/index.js";
import { PlatformToggle } from "../../platform-ui/components/ui/toggle/index.js";

type StrategySyncStatus = "disabled" | "syncing" | "synced" | "conflict" | "error" | "disconnected";

interface StrategySyncState {
  configured?: boolean;
  enabled?: boolean;
  syncToConfluence?: boolean;
  syncFromConfluence?: boolean;
  status?: StrategySyncStatus;
  conflictCount?: number;
  documentCount?: number;
  lastSyncAt?: number | null;
  error?: string;
}

export interface RunnerProjectConfluenceResourceSettingsChange {
  strategyKnowledgeSyncEnabled: boolean;
  strategyKnowledgeSyncToConfluenceEnabled: boolean;
  strategyKnowledgeSyncFromConfluenceEnabled: boolean;
}

export interface RunnerKnowledgeConfluenceResourceSettingsProps {
  organizationId?: string;
  projectId?: string;
  libraryId?: string;
  promptId?: string;
  requestHeaders?: Headers | Record<string, string> | null;
  resourceId: string;
  resourceName: string;
  spaceId: string;
  cloudId?: string;
  siteUrl?: string;
  knowledgeLabel?: string;
  disabled?: boolean;
  strategyKnowledgeSyncEnabled?: boolean | null;
  strategyKnowledgeSyncToConfluenceEnabled?: boolean | null;
  strategyKnowledgeSyncFromConfluenceEnabled?: boolean | null;
  onChange?: (change: RunnerProjectConfluenceResourceSettingsChange) => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  variant?: "project" | "resource";
}

export type RunnerProjectConfluenceResourceSettingsProps =
  RunnerKnowledgeConfluenceResourceSettingsProps;

function normalizeSyncState(value: StrategySyncState | null | undefined): StrategySyncState {
  const sync = value || {};
  const legacyEnabled = sync.enabled === true;
  const syncToConfluence =
    typeof sync.syncToConfluence === "boolean" ? sync.syncToConfluence : legacyEnabled;
  const syncFromConfluence =
    typeof sync.syncFromConfluence === "boolean" ? sync.syncFromConfluence : legacyEnabled;
  return {
    ...sync,
    enabled: syncToConfluence || syncFromConfluence,
    syncToConfluence,
    syncFromConfluence,
  };
}

export function RunnerKnowledgeConfluenceResourceSettings({
  organizationId,
  projectId = "",
  libraryId = "",
  promptId = "",
  requestHeaders,
  resourceId,
  resourceName,
  spaceId,
  cloudId,
  siteUrl,
  knowledgeLabel = "Strategy Knowledge",
  disabled = false,
  strategyKnowledgeSyncEnabled,
  strategyKnowledgeSyncToConfluenceEnabled,
  strategyKnowledgeSyncFromConfluenceEnabled,
  onChange,
  onDisconnect,
  variant = "project",
}: RunnerKnowledgeConfluenceResourceSettingsProps) {
  const hasTarget = [projectId, libraryId, promptId].filter(Boolean).length === 1;
  const canLoad = Boolean(hasTarget && spaceId && cloudId);
  const canSync = canLoad && !disabled;
  const targetPayload = projectId
    ? { projectId }
    : promptId
      ? { promptId }
      : { libraryId };
  const legacyEnabled = strategyKnowledgeSyncEnabled === true;
  const initialSyncToConfluence =
    typeof strategyKnowledgeSyncToConfluenceEnabled === "boolean"
      ? strategyKnowledgeSyncToConfluenceEnabled
      : legacyEnabled;
  const initialSyncFromConfluence =
    typeof strategyKnowledgeSyncFromConfluenceEnabled === "boolean"
      ? strategyKnowledgeSyncFromConfluenceEnabled
      : legacyEnabled;
  const [sync, setSync] = useState<StrategySyncState>({
    enabled: initialSyncToConfluence || initialSyncFromConfluence,
    syncToConfluence: initialSyncToConfluence,
    syncFromConfluence: initialSyncFromConfluence,
    status: initialSyncToConfluence || initialSyncFromConfluence ? "syncing" : "disabled",
  });
  const [loading, setLoading] = useState(canLoad);
  const [saving, setSaving] = useState(false);
  const syncing = loading || saving || sync.status === "syncing";
  const requestHeadersKey = useMemo(() => {
    const entries =
      typeof Headers !== "undefined" && requestHeaders instanceof Headers
        ? Array.from(requestHeaders.entries())
        : Object.entries(requestHeaders || {});
    const normalizedOrganizationId = String(organizationId || "").trim();
    const normalizedEntries = entries
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, value]) => [String(key).toLowerCase(), value] as [string, string]);
    if (
      normalizedOrganizationId &&
      !normalizedEntries.some(([key]) => key === "x-computer-agents-organization")
    ) {
      normalizedEntries.push(["x-computer-agents-organization", normalizedOrganizationId]);
    }
    return JSON.stringify(normalizedEntries.sort(([left], [right]) => left.localeCompare(right)));
  }, [organizationId, requestHeaders]);
  const headers = useMemo(
    () => ({
      ...Object.fromEntries(JSON.parse(requestHeadersKey || "[]") as [string, string][]),
      "Content-Type": "application/json",
    }),
    [requestHeadersKey],
  );

  useEffect(() => {
    if (!canLoad) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const query = new URLSearchParams();
    query.set(
      projectId ? "projectId" : promptId ? "promptId" : "libraryId",
      projectId || promptId || libraryId,
    );
    query.set("spaceId", spaceId);
    void fetch(`/api/aios/confluence/strategy-sync?${query.toString()}`, {
      headers,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(payload?.error || `Failed to load ${knowledgeLabel} synchronization.`);
        setSync(normalizeSyncState(payload?.sync || { enabled: false, status: "disabled" }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSync((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : `Failed to load ${knowledgeLabel} synchronization.`,
        }));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [canLoad, headers, knowledgeLabel, libraryId, projectId, promptId, spaceId]);

  async function setDirection(direction: "toConfluence" | "fromConfluence", checked: boolean) {
    if (!canSync || saving) return;
    const previous = sync;
    const syncToConfluence =
      direction === "toConfluence" ? checked : sync.syncToConfluence === true;
    const syncFromConfluence =
      direction === "fromConfluence" ? checked : sync.syncFromConfluence === true;
    const enabled = syncToConfluence || syncFromConfluence;
    setSaving(true);
    setSync((current) => ({
      ...current,
      enabled,
      syncToConfluence,
      syncFromConfluence,
      status: enabled ? "syncing" : "disabled",
      error: "",
    }));
    try {
      const response = await fetch("/api/aios/confluence/strategy-sync", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          ...targetPayload,
          spaceId,
          spaceName: resourceName,
          cloudId,
          siteUrl,
          enabled,
          syncToConfluence,
          syncFromConfluence,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload?.error || `Failed to update ${knowledgeLabel} synchronization.`);
      setSync(
        normalizeSyncState(
          payload?.sync || {
            enabled,
            syncToConfluence,
            syncFromConfluence,
            status: enabled ? "synced" : "disabled",
          },
        ),
      );
      await onChange?.({
        strategyKnowledgeSyncEnabled: enabled,
        strategyKnowledgeSyncToConfluenceEnabled: syncToConfluence,
        strategyKnowledgeSyncFromConfluenceEnabled: syncFromConfluence,
      });
    } catch (error) {
      setSync({
        ...previous,
        status: "error",
        error: error instanceof Error ? error.message : `Failed to update ${knowledgeLabel} synchronization.`,
      });
    } finally {
      setSaving(false);
    }
  }

  async function disconnectResource() {
    if (!onDisconnect || saving) return;
    if (canSync && (sync.syncToConfluence === true || sync.syncFromConfluence === true)) {
      setSaving(true);
      try {
        const response = await fetch("/api/aios/confluence/strategy-sync", {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            ...targetPayload,
            spaceId,
            spaceName: resourceName,
            cloudId,
            siteUrl,
            enabled: false,
            syncToConfluence: false,
            syncFromConfluence: false,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(payload?.error || "Failed to stop Strategy Knowledge sync.");
      } catch (error) {
        setSync((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : "Failed to stop Strategy Knowledge sync.",
        }));
        throw error;
      } finally {
        setSaving(false);
      }
    }
    await onDisconnect();
  }

  return (
    <PlatformConnectorConfiguration
      className={`playground-project-confluence-resource-settings playground-project-github-repository-settings is-${variant}`}
      data-project-confluence-resource={resourceId}
      data-knowledge-confluence-resource={resourceId}
      surface={variant === "resource" ? "plain" : "contained"}
      showHeader={variant !== "resource"}
      title={resourceName}
      actionLabel={`Actions for ${resourceName}`}
      onDisconnect={!disabled && onDisconnect ? disconnectResource : undefined}
    >
      <PlatformConnectorConfigurationRow
        title="Sync to Confluence"
        pending={syncing}
        pendingLabel={`Synchronizing ${resourceName}`}
        description={
          <>
            Publish {knowledgeLabel} changes as pages in this Confluence space.
            {sync.error ? (
              <span className="playground-project-notion-resource-settings__error">
                {sync.error}
              </span>
            ) : null}
          </>
        }
      >
        <PlatformToggle
          className="playground-project-github-repository-settings__toggle"
          checked={sync.syncToConfluence === true}
          disabled={!canSync || syncing}
          aria-label={`Sync ${knowledgeLabel} to ${resourceName}`}
          onCheckedChange={(checked) => void setDirection("toConfluence", checked)}
        />
      </PlatformConnectorConfigurationRow>

      <PlatformConnectorConfigurationRow
        title="Sync from Confluence"
        pending={syncing}
        pendingLabel={`Synchronizing ${resourceName}`}
        description={`Import page changes from this Confluence space into ${knowledgeLabel}.`}
      >
        <PlatformToggle
          className="playground-project-github-repository-settings__toggle"
          checked={sync.syncFromConfluence === true}
          disabled={!canSync || syncing}
          aria-label={`Sync ${resourceName} to ${knowledgeLabel}`}
          onCheckedChange={(checked) => void setDirection("fromConfluence", checked)}
        />
      </PlatformConnectorConfigurationRow>
    </PlatformConnectorConfiguration>
  );
}

export const RunnerProjectConfluenceResourceSettings = RunnerKnowledgeConfluenceResourceSettings;
