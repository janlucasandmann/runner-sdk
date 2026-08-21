export const CALENDAR_APP_TOP_NAVIGATION_SCRIPT = `
        function getCalendarTopNavActiveView() {
          return ["day", "week", "month"].includes(calendarTopNavState?.view)
            ? calendarTopNavState.view
            : "week";
        }

        function renderCalendarTopNavCenter() {
          return React.createElement(PlatformSwitch, {
            className: "playground-tasks-calendar-view-switch playground-calendar-app-header-switch",
            value: getCalendarTopNavActiveView(),
            options: [
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ],
            ariaLabel: "Calendar view",
            onValueChange: (nextView) => calendarTopNavActionsRef.current?.setView?.(nextView),
          });
        }

        function renderCalendarTopNavActions() {
          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-tasks-calendar-nav-group playground-calendar-app-header-nav" },
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-calendar-nav-button",
                onClick: () => calendarTopNavActionsRef.current?.navigate?.("PREV"),
                title: "Previous",
                "aria-label": "Previous",
              }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-calendar-today-button" + (calendarTopNavState?.isTodayActive ? " is-active" : ""),
                onClick: () => calendarTopNavActionsRef.current?.navigate?.("TODAY"),
              }, "Today"),
              React.createElement("button", {
                type: "button",
                className: "playground-tasks-calendar-nav-button",
                onClick: () => calendarTopNavActionsRef.current?.navigate?.("NEXT"),
                title: "Next",
                "aria-label": "Next",
              }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
            ),
            React.createElement(PlatformButtonSelector, {
                mode: "split-action",
                buttonVariant: "primary",
                buttonSize: "small",
                label: "Schedule",
                leading: React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                onAction: () => calendarTopNavActionsRef.current?.create?.("task"),
                actionAriaLabel: "Schedule a task",
                closeOnSelect: true,
                popupAriaLabel: "Choose schedule type",
                popupAlignment: "right",
                popupRole: "menu",
                popupVariant: "minimal",
                popupWidth: 200,
                className: "playground-calendar-app-header-schedule",
              },
              [
                { id: "task", label: "Task", Icon: Bookmark },
                { id: "loop", label: "Loop", Icon: RefreshCw },
                { id: "workflow", label: "Workflow", Icon: Metronome },
                { id: "batch", label: "Batch", Icon: Truck },
              ].map(({ id, label, Icon }) => React.createElement("button", {
                  key: id,
                  type: "button",
                  role: "menuitem",
                  className: "tb-popup-row",
                  onClick: () => calendarTopNavActionsRef.current?.create?.(id),
                },
                React.createElement("span", {
                  className: "playground-tasks-detail-type-badge is-" + id,
                  "aria-hidden": "true",
                }, React.createElement(Icon, { width: 10, height: 10, strokeWidth: 1.9 })),
                React.createElement("span", null, label)
              ))
            )
          );
        }

`;
