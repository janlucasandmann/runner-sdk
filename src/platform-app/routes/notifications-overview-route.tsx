import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

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
} from "../../platform-services/configure-mode/configure-home/client/page/notifications-overview-page.js";
import { NotificationsOverviewPage } from "../routing/platform-lazy-pages.js";

export interface NotificationsOverviewRouteProps {
  onOpenLegacy: (action: string, resourceId?: string) => void;
}

export function NotificationsOverviewRoute({
  onOpenLegacy,
}: NotificationsOverviewRouteProps) {
  const repository = useConfigureHomeRepository();
  const [notifications, setNotifications] = useState<readonly unknown[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [sortValue, setSortValue] =
    useState<ConfigureHomeNotificationSort>("newest");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const nextNotifications = await repository.listNotifications(signal);
      if (!signal?.aborted) setNotifications(nextNotifications);
    } catch {
      if (!signal?.aborted) setNotifications([]);
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
    () => normalizeConfigureHomeNotificationRows(notifications),
    [notifications],
  );
  const rows = useMemo(() => selectConfigureHomeNotifications(allRows, {
    query: searchValue,
    filter: filterValue,
    sort: sortValue,
  }), [allRows, filterValue, searchValue, sortValue]);

  const getNotificationActions = (
    row: ConfigureHomeNotificationRow,
  ): readonly PlatformDataTableAction<ConfigureHomeNotificationRow>[] => [{
    id: "open",
    label: "Open",
    icon: ChevronRight,
    onSelect: () => onOpenLegacy("notification", row.id),
  }];

  return (
    <NotificationsOverviewPage
      notifications={rows}
      totalNotificationCount={allRows.length}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      filterValue={filterValue}
      onFilterChange={setFilterValue}
      sortValue={sortValue}
      onSortChange={setSortValue}
      onOpenNotification={(row) => onOpenLegacy("notification", row.id)}
      canOpenNotification={() => true}
      getNotificationActions={getNotificationActions}
      loading={loading}
    />
  );
}
