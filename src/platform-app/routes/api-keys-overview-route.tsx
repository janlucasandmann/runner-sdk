import { useCallback, useEffect, useMemo, useState } from "react";

import {
  createApiKeysOverviewAnalytics,
  normalizeApiKeysOverviewAnalyticsPayload,
  normalizeApiKeyOverviewRows,
  useApiKeyRepository,
  type ApiKeysOverviewAnalyticsPeriod,
} from "../../platform-services/develop-mode/api-keys/client/index.js";
import type {
  DevelopApiKeyOverviewRow,
} from "../../platform-services/develop-mode/api-keys/client/domain/index.js";
import type {
  ResourceOverviewPeriod,
} from "../../platform-ui/pages/overview/index.js";
import { DevelopApiKeysOverviewPage } from "../routing/platform-lazy-pages.js";

export interface ApiKeysOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load API keys.";
}

function normalizePeriod(
  value: ResourceOverviewPeriod,
): ApiKeysOverviewAnalyticsPeriod {
  return value === "day" || value === "week" ? value : "month";
}

export function ApiKeysOverviewRoute({
  onOpenLegacy,
}: ApiKeysOverviewRouteProps) {
  const repository = useApiKeyRepository();
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [records, setRecords] = useState<readonly unknown[]>([]);
  const [analyticsPayload, setAnalyticsPayload] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [mutatingKeyId, setMutatingKeyId] = useState("");
  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    setAnalyticsError("");
    const analyticsPeriod = normalizePeriod(period);
    const [keysResult, analyticsResult] = await Promise.allSettled([
      repository.list(signal),
      repository.readAnalytics(analyticsPeriod, signal),
    ]);
    if (signal?.aborted) return;
    if (keysResult.status === "fulfilled") {
      setRecords(keysResult.value);
    } else {
      setError(readErrorMessage(keysResult.reason));
    }
    if (analyticsResult.status === "fulfilled") {
      setAnalyticsPayload(analyticsResult.value);
    } else {
      setAnalyticsPayload(null);
      setAnalyticsError(readErrorMessage(analyticsResult.reason));
    }
    setLoading(false);
  }, [period, repository]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const rows = useMemo(
    () => normalizeApiKeyOverviewRows(records),
    [records],
  );
  const analytics = useMemo(() => createApiKeysOverviewAnalytics({
    snapshot: analyticsPayload
      ? normalizeApiKeysOverviewAnalyticsPayload(
          analyticsPayload,
          normalizePeriod(period),
        )
      : null,
    fallbackTotalKeyCount: rows.length,
    fallbackUsedKeyCount: rows.filter((row) => row.lastUsedAt > 0).length,
    loading,
    error: analyticsError,
  }), [analyticsError, analyticsPayload, loading, period, rows]);

  const handleDelete = useCallback(async (
    selectedRows: readonly DevelopApiKeyOverviewRow[],
  ) => {
    const deletableRows = selectedRows.filter((row) => row.canRevoke);
    if (!deletableRows.length) return;
    if (
      typeof globalThis.confirm === "function"
      && !globalThis.confirm(
        `Delete ${deletableRows.length === 1
          ? deletableRows[0].name
          : `${deletableRows.length} API keys`}?`,
      )
    ) {
      return;
    }
    setMutatingKeyId(deletableRows[0].id);
    setError("");
    try {
      for (const row of deletableRows) {
        await repository.revoke(row.id);
      }
      await load();
    } catch (revokeError) {
      setError(readErrorMessage(revokeError));
    } finally {
      setMutatingKeyId("");
    }
  }, [load, repository]);

  return (
    <DevelopApiKeysOverviewPage
      rows={rows}
      period={period}
      onPeriodChange={setPeriod}
      analytics={analytics}
      loading={loading}
      error={error}
      revokingKeyId={mutatingKeyId}
      onCreate={() => onOpenLegacy("create")}
      onReveal={(row) => onOpenLegacy("reveal", row.id)}
      onDelete={handleDelete}
    />
  );
}
