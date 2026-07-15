export const APP_HEADER_SEARCH_PROJECTION_SCRIPT = `        const searchableThreadItems = useMemo(() => {
          const uniqueThreads = new Map();
          baseThreadItems
            .slice()
            .sort(compareThreadsByRecent)
            .forEach((thread) => {
              if (!thread?.id || uniqueThreads.has(thread.id)) {
                return;
              }
              uniqueThreads.set(thread.id, thread);
            });
          return Array.from(uniqueThreads.values());
        }, [baseThreadItems]);

        const normalizedThreadSearchQuery = threadSearchQuery.trim().toLowerCase();
        const threadSearchFileEnvironmentItems = useMemo(() => {
          if (!hasRealAccess) {
            return [];
          }
          return realEnvironments
            .filter((environment) => String(environment?.id || "").trim())
            .slice(0, 24);
        }, [hasRealAccess, realEnvironments]);

        useEffect(() => {
          if (!threadSearchOpen || !hasRealAccess || !normalizedThreadSearchQuery) {
            return;
          }
          threadSearchFileEnvironmentItems.forEach((environment) => {
            void loadThreadSearchFileInventory(environment.id);
          });
        }, [
          hasRealAccess,
          loadThreadSearchFileInventory,
          normalizedThreadSearchQuery,
          threadSearchFileEnvironmentItems,
          threadSearchOpen,
        ]);

        const filteredThreadSearchFileItems = useMemo(() => {
          if (!normalizedThreadSearchQuery) {
            return [];
          }
          const results = [];
          threadSearchFileEnvironmentItems.forEach((environment) => {
            const inventory = threadSearchFileInventoryByEnvironmentId[environment.id] || [];
            const rows = buildPlaygroundEnvironmentSearchRows(inventory, threadSearchQuery, { filesOnly: true });
            rows.slice(0, 12).forEach((row) => {
              if (!row?.entry || row.entry.isFolder) {
                return;
              }
              results.push({
                key: environment.id + ":" + normalizeHistoryPath(row.entry.path || ""),
                environmentId: environment.id,
                environmentName: environment.name || "Computer",
                entry: row.entry,
              });
            });
          });
          return results.slice(0, 24);
        }, [
          normalizedThreadSearchQuery,
          threadSearchFileEnvironmentItems,
          threadSearchFileInventoryByEnvironmentId,
          threadSearchQuery,
        ]);

        const isThreadSearchFileLoading = Boolean(
          normalizedThreadSearchQuery &&
          threadSearchFileEnvironmentItems.some((environment) => (
            threadSearchFileInventoryLoadingByEnvironmentId[environment.id] ||
            !Array.isArray(threadSearchFileInventoryByEnvironmentId[environment.id])
          ))
        );

        const filteredThreadSearchItems = useMemo(() => {
          return searchableThreadItems.filter((thread) => {
            if (!normalizedThreadSearchQuery) {
              return true;
            }

            const haystack = [
              thread.title || "",
              thread.id || "",
              thread.status || "",
            ]
              .join(" ")
              .toLowerCase();

            return haystack.includes(normalizedThreadSearchQuery);
          });
        }, [normalizedThreadSearchQuery, searchableThreadItems]);

        const groupedThreadSearchItems = useMemo(() => {
          const groupsByKey = new Map();

          filteredThreadSearchItems.forEach((thread) => {
            const bucket = getThreadSearchBucket(resolveThreadSortTimestamp(thread));
            if (!groupsByKey.has(bucket.key)) {
              groupsByKey.set(bucket.key, {
                key: bucket.key,
                label: bucket.label,
                items: [],
              });
            }
            groupsByKey.get(bucket.key).items.push(thread);
          });

          return ["today", "yesterday", "last-7-days", "last-30-days", "older"]
            .map((key) => groupsByKey.get(key))
            .filter(Boolean);
        }, [filteredThreadSearchItems]);
        const threadSearchTotalResultCount = filteredThreadSearchItems.length + filteredThreadSearchFileItems.length;
`;
