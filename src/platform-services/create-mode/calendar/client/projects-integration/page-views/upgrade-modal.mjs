export const CALENDAR_PROJECTS_PAGE_UPGRADE_MODAL_SCRIPT = `
        function renderCalendarUpgradeModal() {
          if (!calendarUpgradeModalOpen) {
            return null;
          }

          const calendarUpgradeFeatures = [
            { icon: CalendarIcon, label: "Calendar and scheduled tasks" },
            { icon: Coins, label: "$5 monthly usage credit" },
            { icon: User, label: "Custom agents and cloud computers" },
            { icon: Telescope, label: "Premium models for research, coding, and images" },
            { icon: Code, label: "API access for agent workflows" },
            { icon: Shield, label: "Budget caps and usage history" },
          ];
          const modalElement = React.createElement(PlatformModalBackdrop, {
              className: "playground-calendar-upgrade-backdrop",
              onClick: () => setCalendarUpgradeModalOpen(false),
            },
            React.createElement("button", {
              type: "button",
              className: "playground-files-header-icon-button is-plain playground-calendar-upgrade-close",
              onClick: () => setCalendarUpgradeModalOpen(false),
              title: "Close",
              "aria-label": "Close",
            }, React.createElement(X, { width: 18, height: 18, strokeWidth: 1.8 })),
            React.createElement("div", {
                className: "playground-calendar-upgrade-shell",
                onClick: (event) => event.stopPropagation(),
              },
              React.createElement("h2", {
                id: "playground-calendar-upgrade-title",
                className: "playground-calendar-upgrade-headline",
              },
                "Schedule work with ",
                React.createElement("span", { className: "playground-calendar-upgrade-headline-price" }, "Builder")
              ),
              React.createElement("div", { className: "playground-calendar-upgrade-pill" }, "Schedule tasks, agents, and follow-ups automatically"),
              React.createElement(PlatformModalSurface, {
                  as: "section",
                  className: "playground-calendar-upgrade-modal",
                  role: "dialog",
                  "aria-modal": "true",
                  "aria-labelledby": "playground-calendar-upgrade-title",
                },
                React.createElement("div", { className: "playground-calendar-upgrade-modal-top" },
                  React.createElement("div", { className: "playground-calendar-upgrade-modal-header" },
                    React.createElement("div", { className: "playground-calendar-upgrade-modal-title" }, "Builder"),
                    React.createElement("div", { className: "playground-calendar-upgrade-modal-offer" }, "$5 usage included")
                  ),
                  React.createElement("div", { className: "playground-calendar-upgrade-price-row" },
                    React.createElement("span", { className: "playground-calendar-upgrade-price-new" }, "$24"),
                    React.createElement("span", { className: "playground-calendar-upgrade-price-old" }, " / month")
                  ),
                  React.createElement("p", { className: "playground-calendar-upgrade-modal-copy" },
                    "Unlock calendars, custom agents, projects, workflows, and metered platform services."
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-calendar-upgrade-modal-button",
                    onClick: () => void handleCalendarUpgradeCheckout(),
                    disabled: calendarUpgradeCheckoutLoading || typeof onUpgradeToIndividual !== "function",
                  },
                    calendarUpgradeCheckoutLoading
                      ? React.createElement(React.Fragment, null,
                          React.createElement(Loader2, { className: "playground-files-state-loader", width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Opening checkout...")
                        )
                      : "Upgrade to Builder"
                  )
                ),
                React.createElement("div", { className: "playground-calendar-upgrade-feature-list" },
                  calendarUpgradeFeatures.map((feature) => {
                    const FeatureIcon = feature.icon || Check;
                    return React.createElement("div", {
                      key: feature.label,
                      className: "playground-calendar-upgrade-modal-feature",
                    },
                      React.createElement("span", { className: "playground-calendar-upgrade-modal-feature-icon" },
                        React.createElement(FeatureIcon, { strokeWidth: 1.75 })
                      ),
                      React.createElement("span", null, feature.label)
                    );
                  })
                )
              )
            )
          );

          return typeof document !== "undefined" && document.body
            ? createPortal(modalElement, document.body)
            : modalElement;
        }

`;
