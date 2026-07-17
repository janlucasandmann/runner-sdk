import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createDevelopResourceOverviewRows,
  getDevelopResourceDefinition,
} from "../../platform-services/develop-mode/resource-definition-registry.js";
import type {
  DevelopResourceKind,
  DevelopResourceOperationalMetrics,
  DevelopResourceOverviewRow,
} from "../../platform-services/develop-mode/shared/client/domain/index.js";
import {
  useDevelopResourceRepository,
} from "../../platform-services/develop-mode/shared/client/api/index.js";
import type {
  ResourceOverviewPeriod,
} from "../../platform-ui/pages/overview/index.js";
import { DevelopResourceOverviewRoute as DevelopResourceOverviewPage } from "../routing/platform-lazy-pages.js";
import { usePlatformApiClient } from "../runtime/platform-api-provider.js";

type StandardDevelopResourceKind = Exclude<
  DevelopResourceKind,
  "voice_agent"
>;

export interface DevelopResourceOverviewRouteContainerProps {
  kind: StandardDevelopResourceKind;
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readResourceKind(value: unknown): string {
  const record = asRecord(value);
  const metadata = asRecord(record.metadata);
  return String(
    record.kind
      || record.serverKind
      || record.server_kind
      || record.resourceKind
      || record.resource_kind
      || record.type
      || metadata.kind
      || metadata.serverKind
      || "",
  ).trim().toLowerCase().replaceAll("-", "_");
}

function unwrapOperationalMetrics(
  value: unknown,
): DevelopResourceOperationalMetrics | null {
  const envelope = asRecord(value);
  const metrics = asRecord(
    envelope.analytics || envelope.metrics || envelope,
  );
  return Object.keys(metrics).length
    ? metrics as DevelopResourceOperationalMetrics
    : null;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load resources.";
}

export function DevelopResourceOverviewRouteContainer({
  kind,
  onOpenLegacy,
}: DevelopResourceOverviewRouteContainerProps) {
  const apiClient = usePlatformApiClient();
  const repository = useDevelopResourceRepository();
  const definition = getDevelopResourceDefinition(kind);
  const resourceType = kind === "database" ? "database" : "server";
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [records, setRecords] = useState<readonly unknown[]>([]);
  const [operationalMetrics, setOperationalMetrics] =
    useState<DevelopResourceOperationalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [analyticsError, setAnalyticsError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    setAnalyticsError("");
    const analyticsPath = resourceType === "database"
      ? "/databases/analytics/overview"
      : "/servers/analytics/overview";
    const [recordsResult, analyticsResult] = await Promise.allSettled([
      repository.list(resourceType, { kind, signal }),
      apiClient.get(analyticsPath, {
        query: { kind, period },
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
      setOperationalMetrics(unwrapOperationalMetrics(analyticsResult.value));
    } else {
      setOperationalMetrics(null);
      setAnalyticsError(readErrorMessage(analyticsResult.reason));
    }
    setLoading(false);
  }, [apiClient, kind, period, repository, resourceType]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const relevantRecords = useMemo(() => (
    resourceType === "database"
      ? records
      : records.filter((record) => {
          const recordKind = readResourceKind(record);
          return !recordKind || recordKind === kind;
        })
  ), [kind, records, resourceType]);
  const rows = useMemo(
    () => createDevelopResourceOverviewRows(relevantRecords, kind),
    [kind, relevantRecords],
  );

  const handleDelete = useCallback(async (
    selectedRows: readonly DevelopResourceOverviewRow[],
  ) => {
    const deletableRows = selectedRows.filter((row) => !row.isDraft);
    if (!deletableRows.length) return;
    if (
      typeof globalThis.confirm === "function"
      && !globalThis.confirm(
        `Delete ${deletableRows.length === 1
          ? deletableRows[0].name
          : `${deletableRows.length} ${definition.plural.toLowerCase()}`}?`,
      )
    ) {
      return;
    }
    setMutating(true);
    setError("");
    try {
      await Promise.all(deletableRows.map((row) => (
        repository.delete(row.resourceType, row.sourceId)
      )));
      await load();
    } catch (deleteError) {
      setError(readErrorMessage(deleteError));
    } finally {
      setMutating(false);
    }
  }, [definition.plural, load, repository]);

  return (
    <DevelopResourceOverviewPage
      kind={kind}
      rows={rows}
      period={period}
      onPeriodChange={setPeriod}
      operationalMetrics={operationalMetrics}
      analyticsLoading={loading}
      analyticsError={analyticsError}
      loading={loading}
      error={error || undefined}
      mutating={mutating}
      onOpen={(row) => onOpenLegacy("open", row.sourceId)}
      onCreate={() => onOpenLegacy("create")}
      onRename={(row) => onOpenLegacy("rename", row.sourceId)}
      onCopy={(row) => onOpenLegacy("copy", row.sourceId)}
      onDelete={handleDelete}
    />
  );
}
