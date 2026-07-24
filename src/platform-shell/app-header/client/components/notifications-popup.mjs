export const APP_HEADER_NOTIFICATIONS_POPUP_SCRIPT = `        function renderProductNotificationHtml(html) {
          const sanitizedHtml = DOMPurify.sanitize(String(html || ""), {
            USE_PROFILES: { html: true },
            FORBID_TAGS: ["script", "style", "iframe", "object", "embed", "form", "input"],
          });
          return React.createElement("div", {
            className: "notification-menu-product-html",
            dangerouslySetInnerHTML: { __html: sanitizedHtml },
          });
        }

        function renderNotificationItem(item) {
	          if (item.kind === "permission") {
            const metaText = item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "";
            return React.createElement("button", {
              key: item.id,
              type: "button",
              className: "notification-menu-item",
              onClick: () => handleOpenPermissionNotification(item.threadId),
            },
              React.createElement(AlertCircle, { className: "notification-menu-icon is-warning", strokeWidth: 1.8 }),
              React.createElement("div", { className: "notification-menu-copy" },
                React.createElement("div", { className: "notification-menu-label" }, "Permission needed"),
                React.createElement("div", { className: "notification-menu-text" }, item.threadTitle || "Untitled thread"),
                React.createElement("div", { className: "notification-menu-meta" },
                  [item.toolName || "Tool access", metaText].filter(Boolean).join(" · ")
                )
              )
	            );
	          }

	          if (item.kind === "human_task") {
	            const metaText = item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "";
	            return React.createElement("button", {
              key: item.id,
              type: "button",
              className: "notification-menu-item",
              onClick: () => handleOpenHumanTaskNotification(item),
	            },
              React.createElement(ListTodo, { className: "notification-menu-icon is-warning", strokeWidth: 1.8 }),
              React.createElement("div", { className: "notification-menu-copy" },
                React.createElement("div", { className: "notification-menu-label" }, item.label || "Task needs you"),
                React.createElement("div", { className: "notification-menu-text" }, item.text || "Open task"),
                React.createElement("div", { className: "notification-menu-meta" },
                  [item.ticketNumber ? ("Ticket " + item.ticketNumber) : "", metaText].filter(Boolean).join(" · ")
                )
              )
	            );
	          }

	          if (item.kind === "task_activity") {
	            const metaText = item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "";
	            return React.createElement("button", {
              key: item.id,
              type: "button",
              className: "notification-menu-item",
              onClick: () => handleOpenTaskActivityNotification(item),
	            },
              React.createElement(ListTodo, { className: "notification-menu-icon", strokeWidth: 1.8 }),
              React.createElement("div", { className: "notification-menu-copy" },
                React.createElement("div", { className: "notification-menu-label" }, item.text || "Ticket updated"),
                React.createElement("div", { className: "notification-menu-text" }, item.title || item.taskTitle || "Open ticket"),
                metaText
                  ? React.createElement("div", { className: "notification-menu-meta" }, metaText)
                  : null
              )
	            );
	          }

	          if (item.kind === "email_verification") {
            return React.createElement("button", {
              key: item.id,
              type: "button",
              className: "notification-menu-item",
              onClick: handleOpenEmailVerificationSettings,
            },
              React.createElement(Mail, { className: "notification-menu-icon is-warning", strokeWidth: 1.8 }),
              React.createElement("div", { className: "notification-menu-copy" },
                React.createElement("div", { className: "notification-menu-label" }, item.label),
                React.createElement("div", { className: "notification-menu-text" }, item.text),
                React.createElement("div", { className: "notification-menu-meta" }, "Open profile settings")
              )
            );
          }

          if (item.kind === "team_invitation") {
            const metaText = item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "";
            const isAccepting = teamPageActionId === item.id + ":accept";
            const isDeclining = teamPageActionId === item.id + ":decline";
            return React.createElement("div", {
              key: item.id,
              className: "notification-menu-item notification-menu-team-invitation",
            },
              React.createElement(UsersRound, { className: "notification-menu-icon", strokeWidth: 1.8 }),
              React.createElement("div", { className: "notification-menu-copy" },
                React.createElement("div", { className: "notification-menu-label" }, "Team invitation"),
                React.createElement("div", { className: "notification-menu-text" }, item.teamName || "Team"),
                React.createElement("div", { className: "notification-menu-meta" },
                  [
                    item.role ? ("Role: " + item.role) : "",
                    item.invitedByEmail ? ("From " + item.invitedByEmail) : "",
                    metaText,
                  ].filter(Boolean).join(" · ")
                ),
                React.createElement("div", { className: "notification-menu-actions" },
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "notification-menu-action-button is-primary",
                    onClick: () => handleTeamInvitationDecision(item, "accept"),
                    disabled: Boolean(teamPageActionId),
                  }, isAccepting ? "Accepting..." : "Accept"),
                  React.createElement("button", {
                    type: "button",
                    className: "notification-menu-action-button",
                    onClick: () => handleTeamInvitationDecision(item, "decline"),
                    disabled: Boolean(teamPageActionId),
                  }, isDeclining ? "Declining..." : "Decline")
                )
              )
            );
          }

          if (item.kind === "organization_invitation") {
            const metaText = item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "";
            const isAccepting = organizationPageActionId === item.id + ":accept";
            const isDeclining = organizationPageActionId === item.id + ":decline";
            return React.createElement("div", {
              key: item.id,
              className: "notification-menu-item notification-menu-team-invitation",
            },
              React.createElement(Building2, { className: "notification-menu-icon", strokeWidth: 1.8 }),
              React.createElement("div", { className: "notification-menu-copy" },
                React.createElement("div", { className: "notification-menu-label" }, "Organization invitation"),
                React.createElement("div", { className: "notification-menu-text" }, item.organizationName || "Organization"),
                React.createElement("div", { className: "notification-menu-meta" },
                  [
                    item.role ? ("Role: " + item.role) : "",
                    item.invitedByEmail ? ("From " + item.invitedByEmail) : "",
                    metaText,
                  ].filter(Boolean).join(" · ")
                ),
                React.createElement("div", { className: "notification-menu-actions" },
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "notification-menu-action-button is-primary",
                    onClick: () => handleOrganizationInvitationDecision(item, "accept"),
                    disabled: Boolean(organizationPageActionId),
                  }, isAccepting ? "Accepting..." : "Accept"),
                  React.createElement("button", {
                    type: "button",
                    className: "notification-menu-action-button",
                    onClick: () => handleOrganizationInvitationDecision(item, "decline"),
                    disabled: Boolean(organizationPageActionId),
                  }, isDeclining ? "Declining..." : "Decline")
                )
              )
            );
          }

          const metaText = item.createdAt ? formatThreadSearchTimestamp(item.createdAt) : "";
          return React.createElement("div", {
            key: item.id,
            className: "notification-menu-item",
          },
            React.createElement(Bell, { className: "notification-menu-icon", strokeWidth: 1.8 }),
            React.createElement("div", { className: "notification-menu-copy" },
              renderProductNotificationHtml(item.html),
              metaText ? React.createElement("div", { className: "notification-menu-meta" }, metaText) : null
            )
          );
        }

	        function renderAppHeaderNotificationsPopup() {
	          if (!notificationsOpen) {
	            return null;
	          }

          return React.createElement(React.Fragment, null,
            React.createElement(PlatformPopupDismissLayer, {
              className: "notification-menu-scrim",
              onClick: () => setNotificationsOpen(false),
            }),
            React.createElement(PlatformPopup, {
              open: true,
              variant: "minimal",
              rootClassName: "notification-menu-root",
              surfaceClassName: "notification-menu",
              animation: "down-in",
              surfaceProps: {
                mode: "fixed",
                role: "dialog",
                "aria-label": "Notifications",
                onClick: (event) => event.stopPropagation(),
              },
            },
              React.createElement("div", { className: "notification-menu-header" },
                React.createElement("h2", { className: "notification-menu-title" }, "Notifications")
              ),
              React.createElement("div", { className: "notification-menu-body" },
                notificationItems.length > 0
                  ? notificationItems.map(renderNotificationItem)
                  : React.createElement(PlatformEmptyState, {
                      className: "notification-menu-empty-state",
                      icon: Bell,
                      title: "No notifications",
                    })
              ),
              React.createElement("div", { className: "notification-menu-footer" },
                React.createElement(PlatformSecondaryButton, {
                  type: "button",
                  size: "medium",
                  className: "notification-menu-footer-button",
                  onClick: openNotificationsPage,
                }, "View all"),
                React.createElement(PlatformPrimaryButton, {
                  type: "button",
                  size: "medium",
                  className: "notification-menu-footer-button",
                  onClick: handleMarkAllNotificationsRead,
                  disabled: notificationItems.length === 0,
                }, "Mark all as read")
              )
            )
          );
	        }
`;
