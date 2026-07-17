import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useComputerResourceRepository,
} from "../../platform-resources/computers/client/index.js";
import {
  createComputersOverviewAnalytics,
  normalizeComputerOverviewRows,
} from "../../platform-resources/computers/overview/computers-overview-model.js";
import {
  normalizeComputersOverviewAnalyticsPayload,
} from "../../platform-resources/computers/overview/computers-overview-analytics-client.js";
import type {
  ComputerOverviewRow,
} from "../../platform-resources/computers/overview/computers-overview-page.js";
import type {
  ResourceOverviewPeriod,
} from "../../platform-ui/pages/overview/index.js";
import { ComputersOverviewPage } from "../routing/platform-lazy-pages.js";
import { usePlatformApiClient } from "../runtime/platform-api-provider.js";

export interface ComputersOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load computers.";
}

export function ComputersOverviewRoute({
  onOpenLegacy,
}: ComputersOverviewRouteProps) {
  const apiClient = usePlatformApiClient();
  const repository = useComputerResourceRepository();
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [records, setRecords] = useState<readonly unknown[]>([]);
  const [analyticsPayload, setAnalyticsPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    setAnalyticsError("");
    const [recordsResult, analyticsResult] = await Promise.allSettled([
      repository.list(signal),
      apiClient.get("/environments/analytics/overview", {
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
      setAnalyticsPayload(analyticsResult.value);
    } else {
      setAnalyticsPayload(null);
      setAnalyticsError(readErrorMessage(analyticsResult.reason));
    }
    setLoading(false);
  }, [apiClient, period, repository]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rows = useMemo(
    () => normalizeComputerOverviewRows(records),
    [records],
  );
  const analyticsSnapshot = useMemo(
    () => normalizeComputersOverviewAnalyticsPayload(
      analyticsPayload,
      period,
    ),
    [analyticsPayload, period],
  );
  const analytics = useMemo(() => createComputersOverviewAnalytics({
    rows,
    title: "Computer activity",
    labels: analyticsSnapshot.buckets.map((bucket) => bucket.label),
    costValuesUsd: analyticsSnapshot.buckets.map(
      (bucket) => bucket.computerCostUsd,
    ),
    totalCostUsd: analyticsSnapshot.totalComputerCostUsd,
    formatCurrency: (value) => new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value),
    loading,
    error: analyticsError,
  }), [analyticsError, analyticsSnapshot, loading, rows]);

  const handleDelete = useCallback(async (
    selectedRows: readonly ComputerOverviewRow[],
  ) => {
    const deletableRows = selectedRows.filter((row) => !row.isSystem);
    if (!deletableRows.length) return;
    if (
      typeof globalThis.confirm === "function"
      && !globalThis.confirm(
        `Delete ${deletableRows.length === 1
          ? deletableRows[0].name
          : `${deletableRows.length} computers`}?`,
      )
    ) {
      return;
    }
    setMutating(true);
    setError("");
    try {
      await Promise.all(deletableRows.map((row) => repository.delete(row.id)));
      await load();
    } catch (deleteError) {
      setError(readErrorMessage(deleteError));
    } finally {
      setMutating(false);
    }
  }, [load, repository]);

  return (
    <ComputersOverviewPage
      rows={rows}
      period={period}
      onPeriodChange={setPeriod}
      analytics={analytics}
      loading={loading}
      error={error || undefined}
      mutating={mutating}
      onOpen={(row) => onOpenLegacy("open", row.id)}
      onCreate={() => onOpenLegacy("create")}
      onRename={(row) => onOpenLegacy("rename", row.id)}
      onShare={(selectedRows) => onOpenLegacy("share", selectedRows[0]?.id)}
      onCopy={(row) => onOpenLegacy("copy", row.id)}
      onDelete={handleDelete}
    />
  );
}
