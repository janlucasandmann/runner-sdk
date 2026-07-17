import { Bot, ChevronRight, Monitor, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { useAgentResourceRepository } from "../../platform-resources/agents/client/index.js";
import { useComputerResourceRepository } from "../../platform-resources/computers/client/index.js";
import { useSkillResourceRepository } from "../../platform-resources/skills/client/index.js";
import type {
  PlatformDataTableAction,
} from "../../platform-ui/components/composite/data-table/index.js";
import { useConfigureHomeRepository } from "../../platform-services/configure-mode/configure-home/client/api/index.js";
import {
  normalizeConfigureHomeNotificationRows,
  selectConfigureHomeNotifications,
} from "../../platform-services/configure-mode/configure-home/client/domain/configure-home-overview-model.js";
import type {
  ConfigureHomeNotificationRow,
  ConfigureHomeNotificationSort,
} from "../../platform-services/configure-mode/configure-home/client/page/configure-home-overview-page.js";
import { ConfigureHomeOverviewPage } from "../routing/platform-lazy-pages.js";
import { navigatePlatformClient } from "../routing/platform-browser-navigation.js";

export interface ConfigureHomeRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Failed to load Configure home.";
}

export function ConfigureHomeRoute({
  onOpenLegacy,
}: ConfigureHomeRouteProps) {
  const repository = useConfigureHomeRepository();
  const agentRepository = useAgentResourceRepository();
  const computerRepository = useComputerResourceRepository();
  const skillRepository = useSkillResourceRepository();
  const [notifications, setNotifications] = useState<readonly unknown[]>([]);
  const [counts, setCounts] = useState({
    agents: 0,
    computers: 0,
    skills: 0,
  });
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [sortValue, setSortValue] =
    useState<ConfigureHomeNotificationSort>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const results = await Promise.allSettled([
      repository.listNotifications(signal),
      agentRepository.list(signal),
      computerRepository.list(signal),
      skillRepository.list(signal),
    ]);
    if (signal?.aborted) return;
    const [notificationResult, agentResult, computerResult, skillResult] =
      results;
    if (notificationResult.status === "fulfilled") {
      setNotifications(notificationResult.value);
    } else {
      setError(readErrorMessage(notificationResult.reason));
    }
    setCounts({
      agents: agentResult.status === "fulfilled" ? agentResult.value.length : 0,
      computers: computerResult.status === "fulfilled"
        ? computerResult.value.length
        : 0,
      skills: skillResult.status === "fulfilled" ? skillResult.value.length : 0,
    });
    setLoading(false);
  }, [
    agentRepository,
    computerRepository,
    repository,
    skillRepository,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const allRows = useMemo(
    () => normalizeConfigureHomeNotificationRows(notifications),
    [notifications],
  );
  const rows = useMemo(() => selectConfigureHomeNotifications(allRows, {
    query: searchValue,
    filter: filterValue,
    sort: sortValue,
  }), [allRows, filterValue, searchValue, sortValue]);
  const cards = useMemo(() => [
    {
      id: "agents",
      title: "Agents",
      description: "Agents available for workspace runs.",
      value: counts.agents.toLocaleString("en-US"),
      icon: Bot,
      onClick: () => navigatePlatformClient("agents"),
    },
    {
      id: "computers",
      title: "Computers",
      description: "Persistent workspaces agents can use.",
      value: counts.computers.toLocaleString("en-US"),
      icon: Monitor,
      onClick: () => navigatePlatformClient("computers"),
    },
    {
      id: "skills",
      title: "Skills",
      description: "Capabilities agents can call during work.",
      value: counts.skills.toLocaleString("en-US"),
      icon: Sparkles,
      onClick: () => navigatePlatformClient("skills"),
    },
  ], [counts]);

  const getNotificationActions = (
    row: ConfigureHomeNotificationRow,
  ): readonly PlatformDataTableAction<ConfigureHomeNotificationRow>[] => [{
    id: "open",
    label: "Open",
    icon: ChevronRight,
    onSelect: () => onOpenLegacy("notification", row.id),
  }];

  return (
    <ConfigureHomeOverviewPage
      cards={cards}
      notifications={rows}
      totalNotificationCount={allRows.length}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filterValue={filterValue}
      onFilterChange={setFilterValue}
      sortValue={sortValue}
      onSortChange={setSortValue}
      onOpenPricing={() => window.open(
        "https://computer-agents.com/pricing",
        "_blank",
        "noopener,noreferrer",
      )}
      onOpenDocumentation={() => onOpenLegacy("documentation")}
      onOpenNotification={(row) => onOpenLegacy("notification", row.id)}
      canOpenNotification={() => true}
      getNotificationActions={getNotificationActions}
      loading={loading}
    />
  );
}
