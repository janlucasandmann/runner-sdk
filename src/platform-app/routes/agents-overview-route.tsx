import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useAgentResourceRepository,
} from "../../platform-resources/agents/client/index.js";
import {
  createAgentsOverviewAnalytics,
  normalizeAgentOverviewRows,
  normalizeAgentsOverviewAnalyticsPayload,
  type AgentOverviewRow,
  type AgentsOverviewAnalyticsSnapshot,
} from "../../platform-resources/agents/overview/index.js";
import type {
  ResourceOverviewPeriod,
} from "../../platform-ui/pages/overview/index.js";
import { AgentsOverviewPage } from "../routing/platform-lazy-pages.js";
import { usePlatformApiClient } from "../runtime/platform-api-provider.js";

export interface AgentsOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load agents.";
}

const EMPTY_ANALYTICS: AgentsOverviewAnalyticsSnapshot = {
  period: "month",
  generatedAt: "",
  buckets: [],
  resources: [],
};

export function AgentsOverviewRoute({
  onOpenLegacy,
}: AgentsOverviewRouteProps) {
  const apiClient = usePlatformApiClient();
  const repository = useAgentResourceRepository();
  const [mode, setMode] = useState<"agents" | "squads">("agents");
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [records, setRecords] = useState<readonly unknown[]>([]);
  const [analytics, setAnalytics] =
    useState<AgentsOverviewAnalyticsSnapshot>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const [recordsResult, analyticsResult] = await Promise.allSettled([
      repository.list(signal),
      apiClient.get("/agents/analytics/overview", {
        query: { period },
        signal,
      }),
    ]);
    if (signal?.aborted) return;
    if (recordsResult.status === "fulfilled") {
      setRecords(recordsResult.value);
    } else {
      setError(readErrorMessage(recordsResult.reason));
    }
    if (analyticsResult.status === "fulfilled") {
      setAnalytics(normalizeAgentsOverviewAnalyticsPayload(
        analyticsResult.value,
        period,
      ));
    } else {
      setAnalytics({ ...EMPTY_ANALYTICS, period });
      if (recordsResult.status === "fulfilled") {
        setError(readErrorMessage(analyticsResult.reason));
      }
    }
    setLoading(false);
  }, [apiClient, period, repository]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const allRows = useMemo(
    () => normalizeAgentOverviewRows(records, analytics.resources),
    [analytics.resources, records],
  );
  const rows = useMemo(
    () => allRows.filter((row) => row.isSquad === (mode === "squads")),
    [allRows, mode],
  );
  const analyticsModel = useMemo(() => createAgentsOverviewAnalytics({
    agentCount: allRows.filter((row) => !row.isSquad).length,
    squadCount: allRows.filter((row) => row.isSquad).length,
    buckets: analytics.buckets,
    loading,
    error,
  }), [allRows, analytics.buckets, error, loading]);

  const handleDelete = useCallback(async (
    selectedRows: readonly AgentOverviewRow[],
  ) => {
    const deletableRows = selectedRows.filter((row) => !row.isSystem);
    if (!deletableRows.length) return;
    if (
      typeof globalThis.confirm === "function"
      && !globalThis.confirm(
        `Delete ${deletableRows.length === 1
          ? deletableRows[0].name
          : `${deletableRows.length} agents`}?`,
      )
    ) {
      return;
    }
    setMutating(true);
    setError("");
    try {
      await Promise.all(
        deletableRows.map((row) => repository.delete(row.id)),
      );
      await load();
    } catch (deleteError) {
      setError(readErrorMessage(deleteError));
    } finally {
      setMutating(false);
    }
  }, [load, repository]);

  return (
    <AgentsOverviewPage
      rows={rows}
      mode={mode}
      onModeChange={setMode}
      period={period}
      onPeriodChange={setPeriod}
      analytics={analyticsModel}
      loading={loading}
      mutating={mutating}
      onOpen={(row) => onOpenLegacy("open", row.id)}
      onCreateAgent={() => onOpenLegacy("create-agent")}
      onCreateSquad={() => onOpenLegacy("create-squad")}
      onRename={(row) => onOpenLegacy("rename", row.id)}
      onShare={(selectedRows) => onOpenLegacy("share", selectedRows[0]?.id)}
      onAddToSquad={(selectedRows) => (
        onOpenLegacy("add-to-squad", selectedRows[0]?.id)
      )}
      onCopy={(row) => onOpenLegacy("copy", row.id)}
      onDelete={handleDelete}
    />
  );
}
