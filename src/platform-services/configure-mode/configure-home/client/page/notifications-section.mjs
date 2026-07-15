export const CONFIGURE_HOME_NOTIFICATIONS_SECTION_SCRIPT = `        function getNotificationPageIcon(item) {
          if (item.kind === "permission") return AlertCircle;
          if (item.kind === "human_task") return ListTodo;
          if (item.kind === "team_invitation") return UsersRound;
          if (item.kind === "organization_invitation") return Building2;
          if (item.kind === "email_verification") return Mail;
          return Bell;
        }

        function handleOpenNotificationPageItem(item) {
          if (!item) {
            return;
          }
          if (item.kind === "permission" && item.threadId) {
            handleOpenPermissionNotification(item.threadId);
            return;
          }
          if (item.kind === "human_task") {
            handleOpenHumanTaskNotification(item);
            return;
          }
          if (item.kind === "team_invitation") {
            openTeamPage();
            return;
          }
          if (item.kind === "organization_invitation") {
            openOrganizationPage();
            if (item.organizationId) {
              setOrganizationPageSelectedOrganizationId(String(item.organizationId || "").trim());
            }
            return;
          }
          if (item.kind === "email_verification") {
            handleOpenEmailVerificationSettings();
          }
        }


        function renderConfigureNotificationsSection() {
          const hasNoNotifications = allNotificationPageItems.length === 0;
          const emptyTitle = hasNoNotifications ? "No notifications yet" : "No matching notifications";
          const emptyDescription = hasNoNotifications
            ? "Notifications come from agent activity, permission requests, team invitations, and product updates."
            : "Try adjusting your search or filter settings.";

          const notificationColumns = [
            {
              id: "notification",
              header: "Notification",
              accessor: (item) => item.label || item.kindLabel || "Notification",
              sortable: true,
              width: "minmax(280px, 1.8fr)",
              cell: ({ row: item }) => {
                const Icon = getNotificationPageIcon(item);
                return React.createElement("div", { className: "playground-notifications-table-main" },
                  React.createElement("span", { className: "playground-notifications-table-icon-shell", "aria-hidden": "true" },
                    React.createElement(Icon, { className: "playground-notifications-table-icon", strokeWidth: 1.8 })
                  ),
                  React.createElement("span", { className: "playground-notifications-table-copy" },
                    React.createElement("span", { className: "playground-agents-overview-name-title playground-notifications-table-title" }, item.label || item.kindLabel || "Notification"),
                    React.createElement("span", { className: "playground-agents-overview-name-description playground-notifications-table-meta" }, item.text || item.meta || "Open notification")
                  )
                );
              },
            },
            {
              id: "type",
              header: "Type",
              accessor: (item) => item.kindLabel || "Notification",
              sortable: true,
              width: "minmax(130px, 0.75fr)",
              hideBelow: 780,
              cell: ({ row: item }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, item.kindLabel || "Notification"),
            },
            {
              id: "status",
              header: "Status",
              accessor: (item) => item.statusLabel || (item.unread ? "Unread" : "Read"),
              sortable: true,
              width: "minmax(120px, 0.65fr)",
              hideBelow: 620,
              cell: ({ row: item }) => React.createElement("span", { className: "playground-notifications-status-pill" + (item.unread ? " is-unread" : "") }, item.statusLabel || (item.unread ? "Unread" : "Read")),
            },
            {
              id: "time",
              header: "Time",
              accessor: (item) => {
                const timestamp = Date.parse(item.createdAt || "");
                return Number.isFinite(timestamp) ? timestamp : 0;
              },
              sortable: true,
              sortDescFirst: true,
              width: "minmax(130px, 0.7fr)",
              align: "end",
              cell: ({ row: item }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "—"),
            },
          ];
          const notificationSort = notificationsPageSort === "oldest"
            ? { id: "time", direction: "asc" }
            : notificationsPageSort === "type"
              ? { id: "type", direction: "asc" }
              : { id: "time", direction: "desc" };
          const canOpenNotification = (item) => item.kind === "permission"
            || item.kind === "human_task"
            || item.kind === "team_invitation"
            || item.kind === "organization_invitation"
            || item.kind === "email_verification";
          const notificationFilters = [{
            id: "notification-kind",
            label: "Filter",
            value: notificationsPageFilter,
            onChange: setNotificationsPageFilter,
            options: [
              { id: "all", label: "All notifications" },
              { id: "unread", label: "Unread" },
              { id: "read", label: "Read" },
              { id: "permission", label: "Permission requests" },
              { id: "tasks", label: "Tasks" },
              { id: "team", label: "Teams" },
              { id: "organization", label: "Organizations" },
              { id: "product", label: "Product" },
            ],
          }];
          const notificationsTable = React.createElement(PlatformDataTable, {
            rows: visibleNotificationPageItems,
            columns: notificationColumns,
            getRowId: (item) => item.kind + ":" + item.id,
            ariaLabel: "Notifications",
            className: "playground-notifications-platform-data-table",
            sorting: {
              value: notificationSort,
              manual: true,
              onChange: (next) => {
                if (!next) {
                  setNotificationsPageSort("newest");
                } else if (next.id === "type") {
                  setNotificationsPageSort("type");
                } else {
                  setNotificationsPageSort(next.direction === "asc" ? "oldest" : "newest");
                }
              },
            },
            toolbar: {
              search: {
                value: notificationsPageSearchQuery,
                onChange: setNotificationsPageSearchQuery,
                placeholder: "Search notifications",
                manual: true,
              },
              filters: notificationFilters,
              showSort: true,
              primaryAction: {
                label: "Mark all read",
                icon: Check,
                onClick: handleMarkAllNotificationsRead,
                disabled: notificationItems.length === 0,
              },
            },
            onRowActivate: (item) => {
              if (canOpenNotification(item)) handleOpenNotificationPageItem(item);
            },
            isRowDisabled: (item) => !canOpenNotification(item),
            getRowActions: (item) => {
              if (item.kind === "team_invitation") {
                return [
                  { id: "accept", label: "Accept", icon: Check, disabled: Boolean(teamPageActionId), onSelect: () => handleTeamInvitationDecision(item, "accept") },
                  { id: "decline", label: "Decline", icon: X, disabled: Boolean(teamPageActionId), onSelect: () => handleTeamInvitationDecision(item, "decline") },
                ];
              }
              if (item.kind === "organization_invitation") {
                return [
                  { id: "accept", label: "Accept", icon: Check, disabled: Boolean(organizationPageActionId), onSelect: () => handleOrganizationInvitationDecision(item, "accept") },
                  { id: "decline", label: "Decline", icon: X, disabled: Boolean(organizationPageActionId), onSelect: () => handleOrganizationInvitationDecision(item, "decline") },
                ];
              }
              return canOpenNotification(item)
                ? [{ id: "open", label: "Open", icon: ChevronRight, onSelect: () => handleOpenNotificationPageItem(item) }]
                : [];
            },
            emptyState: React.createElement("div", { className: "playground-plugins-empty playground-notifications-empty" },
              React.createElement("div", { className: "playground-notifications-empty-title" }, emptyTitle),
              React.createElement("div", { className: "playground-notifications-empty-description" }, emptyDescription)
            ),
            noResultsState: React.createElement("div", { className: "playground-plugins-empty playground-notifications-empty" },
              React.createElement("div", { className: "playground-notifications-empty-title" }, "No matching notifications"),
              React.createElement("div", { className: "playground-notifications-empty-description" }, "Try adjusting your search or filter settings.")
            ),
          });

          return React.createElement("section", { className: "playground-configure-notifications-section playground-notifications-scroll" },
            React.createElement("div", { className: "playground-configure-notifications-heading" },
              React.createElement("h2", { className: "playground-develop-server-metrics-title playground-configure-notifications-title" }, "Notifications"),
              React.createElement("div", { className: "playground-notifications-subtitle" }, "Review product updates, human tasks, team invitations, and permission requests.")
            ),
            React.createElement("section", {
                className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-configure-notifications-table-section",
              },
              notificationsTable
            )
          );
        }
`;
