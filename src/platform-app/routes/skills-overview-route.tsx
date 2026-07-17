import { useCallback, useEffect, useMemo, useState } from "react";

import {
  useSkillResourceRepository,
} from "../../platform-resources/skills/client/index.js";
import {
  normalizeSkillOverviewRows,
  type SkillOverviewRow,
} from "../../platform-resources/skills/overview/index.js";
import type {
  ResourceOverviewPeriod,
} from "../../platform-ui/pages/overview/index.js";
import { SkillsOverviewPage } from "../routing/platform-lazy-pages.js";

export interface SkillsOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load skills.";
}

export function SkillsOverviewRoute({
  onOpenLegacy,
}: SkillsOverviewRouteProps) {
  const repository = useSkillResourceRepository();
  const [mode, setMode] = useState<"system" | "custom">("system");
  const [period, setPeriod] = useState<ResourceOverviewPeriod>("month");
  const [records, setRecords] = useState<readonly unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      setRecords(await repository.list(signal));
    } catch (loadError) {
      if (!signal?.aborted) setError(readErrorMessage(loadError));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const allRows = useMemo(
    () => normalizeSkillOverviewRows(records),
    [records],
  );
  const rows = useMemo(
    () => allRows.filter((row) => row.isCustom === (mode === "custom")),
    [allRows, mode],
  );
  const handOff = (action: string, row?: SkillOverviewRow) => {
    onOpenLegacy(action, row?.id);
  };

  return (
    <SkillsOverviewPage
      rows={rows}
      mode={mode}
      onModeChange={setMode}
      period={period}
      onPeriodChange={setPeriod}
      loading={loading}
      onOpen={(row) => handOff("open", row)}
      onCreate={() => handOff("create")}
      onEdit={(row) => handOff("edit", row)}
      onRename={(row) => handOff("rename", row)}
      onDelete={(selectedRows) => handOff("delete", selectedRows[0])}
      headerActions={error ? (
        <span className="platform-client-route-error" role="alert">{error}</span>
      ) : undefined}
    />
  );
}
