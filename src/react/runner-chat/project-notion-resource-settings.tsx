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
  syncToNotion?: boolean;
  syncFromNotion?: boolean;
  status?: StrategySyncStatus;
  conflictCount?: number;
  documentCount?: number;
  lastSyncAt?: number | null;
  error?: string;
}

export interface RunnerProjectNotionResourceSettingsChange {
  strategyKnowledgeSyncEnabled: boolean;
  strategyKnowledgeSyncToNotionEnabled: boolean;
  strategyKnowledgeSyncFromNotionEnabled: boolean;
}

export interface RunnerKnowledgeNotionResourceSettingsProps {
  organizationId?: string;
  projectId?: string;
  libraryId?: string;
  requestHeaders?: Headers | Record<string, string> | null;
  resourceId: string;
  resourceName: string;
  resourceType?: "database" | "workspace";
  knowledgeLabel?: string;
  disabled?: boolean;
  strategyKnowledgeSyncEnabled?: boolean | null;
  strategyKnowledgeSyncToNotionEnabled?: boolean | null;
  strategyKnowledgeSyncFromNotionEnabled?: boolean | null;
  onChange?: (change: RunnerProjectNotionResourceSettingsChange) => void | Promise<void>;
  onDisconnect?: () => void | Promise<void>;
  variant?: "project" | "resource";
}

export type RunnerProjectNotionResourceSettingsProps = RunnerKnowledgeNotionResourceSettingsProps;

function normalizeSyncState(value: StrategySyncState | null | undefined): StrategySyncState {
  const sync = value || {};
  const legacyEnabled = sync.enabled === true;
  const syncToNotion = typeof sync.syncToNotion === "boolean" ? sync.syncToNotion : legacyEnabled;
  const syncFromNotion =
    typeof sync.syncFromNotion === "boolean" ? sync.syncFromNotion : legacyEnabled;
  return {
    ...sync,
    enabled: syncToNotion || syncFromNotion,
    syncToNotion,
    syncFromNotion,
  };
}

export function RunnerKnowledgeNotionResourceSettings({
  organizationId,
  projectId = "",
  libraryId = "",
  requestHeaders,
  resourceId,
  resourceName,
  resourceType = "database",
  knowledgeLabel = "Strategy Knowledge",
  disabled = false,
  strategyKnowledgeSyncEnabled,
  strategyKnowledgeSyncToNotionEnabled,
  strategyKnowledgeSyncFromNotionEnabled,
  onChange,
  onDisconnect,
  variant = "project",
}: RunnerKnowledgeNotionResourceSettingsProps) {
  const hasTarget = Boolean(projectId || libraryId);
  const canLoad = resourceType === "database" && hasTarget && Boolean(resourceId);
  const canSync = canLoad && !disabled;
  const targetPayload = projectId ? { projectId } : { libraryId };
  const initialLegacyEnabled = strategyKnowledgeSyncEnabled === true;
  const initialSyncToNotion =
    typeof strategyKnowledgeSyncToNotionEnabled === "boolean"
      ? strategyKnowledgeSyncToNotionEnabled
      : initialLegacyEnabled;
  const initialSyncFromNotion =
    typeof strategyKnowledgeSyncFromNotionEnabled === "boolean"
      ? strategyKnowledgeSyncFromNotionEnabled
      : initialLegacyEnabled;
  const [sync, setSync] = useState<StrategySyncState>({
    enabled: initialSyncToNotion || initialSyncFromNotion,
    syncToNotion: initialSyncToNotion,
    syncFromNotion: initialSyncFromNotion,
    status: initialSyncToNotion || initialSyncFromNotion ? "syncing" : "disabled",
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
    query.set(projectId ? "projectId" : "libraryId", projectId || libraryId);
    query.set("databaseId", resourceId);
    void fetch(`/api/aios/notion/strategy-sync?${query.toString()}`, {
      headers,
      credentials: "include",
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok)
          throw new Error(payload?.error || "Failed to load Strategy Knowledge sync.");
        setSync(normalizeSyncState(payload?.sync || { enabled: false, status: "disabled" }));
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSync((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : "Failed to load Strategy Knowledge sync.",
        }));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [canLoad, headers, libraryId, projectId, resourceId]);

  async function setDirection(direction: "toNotion" | "fromNotion", checked: boolean) {
    if (!canSync || saving) return;
    const previous = sync;
    const syncToNotion = direction === "toNotion" ? checked : sync.syncToNotion === true;
    const syncFromNotion = direction === "fromNotion" ? checked : sync.syncFromNotion === true;
    const enabled = syncToNotion || syncFromNotion;
    setSaving(true);
    setSync((current) => ({
      ...current,
      enabled,
      syncToNotion,
      syncFromNotion,
      status: enabled ? "syncing" : "disabled",
      error: "",
    }));
    try {
      const response = await fetch("/api/aios/notion/strategy-sync", {
        method: "PUT",
        headers,
        credentials: "include",
        body: JSON.stringify({
          ...targetPayload,
          databaseId: resourceId,
          databaseName: resourceName,
          enabled,
          syncToNotion,
          syncFromNotion,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(payload?.error || "Failed to update Strategy Knowledge sync.");
      setSync(
        normalizeSyncState(
          payload?.sync || {
            enabled,
            syncToNotion,
            syncFromNotion,
            status: enabled ? "synced" : "disabled",
          },
        ),
      );
      await onChange?.({
        strategyKnowledgeSyncEnabled: enabled,
        strategyKnowledgeSyncToNotionEnabled: syncToNotion,
        strategyKnowledgeSyncFromNotionEnabled: syncFromNotion,
      });
    } catch (error) {
      setSync({
        ...previous,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to update Strategy Knowledge sync.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function disconnectResource() {
    if (!onDisconnect || saving) return;
    if (canSync && (sync.syncToNotion === true || sync.syncFromNotion === true)) {
      setSaving(true);
      try {
        const response = await fetch("/api/aios/notion/strategy-sync", {
          method: "PUT",
          headers,
          credentials: "include",
          body: JSON.stringify({
            ...targetPayload,
            databaseId: resourceId,
            databaseName: resourceName,
            enabled: false,
            syncToNotion: false,
            syncFromNotion: false,
          }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "Failed to stop Strategy Knowledge sync.");
        }
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
      className={`playground-project-notion-resource-settings playground-project-github-repository-settings is-${variant}`}
      data-project-notion-resource={resourceId}
      data-knowledge-notion-resource={resourceId}
      surface={variant === "resource" ? "plain" : "contained"}
      showHeader={variant !== "resource"}
      title={resourceName}
      actionLabel={`Actions for ${resourceName}`}
      onDisconnect={!disabled && onDisconnect ? disconnectResource : undefined}
    >
      <PlatformConnectorConfigurationRow
        title="Sync to Notion"
        pending={syncing}
        pendingLabel={`Synchronizing ${resourceName}`}
        description={
          <>
            Publish {knowledgeLabel} changes to this Notion database.
            {sync.error ? (
              <span className="playground-project-notion-resource-settings__error">
                {sync.error}
              </span>
            ) : null}
          </>
        }
      >
        <div className="playground-project-notion-resource-settings__control">
          <PlatformToggle
            className="playground-project-github-repository-settings__toggle"
            checked={sync.syncToNotion === true}
            disabled={!canSync || syncing}
            aria-label={`Sync ${knowledgeLabel} to ${resourceName}`}
            onCheckedChange={(checked) => void setDirection("toNotion", checked)}
          />
        </div>
      </PlatformConnectorConfigurationRow>

      <PlatformConnectorConfigurationRow
        title="Sync from Notion"
        pending={syncing}
        pendingLabel={`Synchronizing ${resourceName}`}
        description={`Import changes from this Notion database into ${knowledgeLabel}.`}
      >
        <div className="playground-project-notion-resource-settings__control">
          <PlatformToggle
            className="playground-project-github-repository-settings__toggle"
            checked={sync.syncFromNotion === true}
            disabled={!canSync || syncing}
            aria-label={`Sync ${resourceName} to ${knowledgeLabel}`}
            onCheckedChange={(checked) => void setDirection("fromNotion", checked)}
          />
        </div>
      </PlatformConnectorConfigurationRow>
    </PlatformConnectorConfiguration>
  );
}

export const RunnerProjectNotionResourceSettings = RunnerKnowledgeNotionResourceSettings;
