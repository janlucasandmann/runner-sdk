export const CONFIGURE_NOTIFICATIONS_PAGE_SCRIPT = `        function renderConfigureNotificationsPage() {
          const configureNotificationRows = visibleNotificationPageItems.map((item) => {
            const timestamp = Date.parse(item.createdAt || "");
            return {
              ...item,
              createdAtTimestamp: Number.isFinite(timestamp) ? timestamp : 0,
              createdAtLabel: item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "—",
            };
          });
          return React.createElement(NotificationsOverviewPage, {
            notifications: configureNotificationRows,
            totalNotificationCount: allNotificationPageItems.length,
            searchValue: notificationsPageSearchQuery,
            onSearchChange: setNotificationsPageSearchQuery,
            filterValue: notificationsPageFilter,
            onFilterChange: setNotificationsPageFilter,
            sortValue: notificationsPageSort,
            onSortChange: setNotificationsPageSort,
            onOpenNotification: handleOpenNotificationPageItem,
            canOpenNotification: canOpenConfigureHomeNotification,
            getNotificationActions: getConfigureHomeNotificationActions,
          });
        }
`;
