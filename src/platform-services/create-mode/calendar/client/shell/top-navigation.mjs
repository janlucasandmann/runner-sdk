export const CALENDAR_APP_TOP_NAVIGATION_SCRIPT = `
        function renderCalendarTopNavActions() {
          const activeView = ["day", "week", "month"].includes(calendarTopNavState?.view)
            ? calendarTopNavState.view
            : "week";

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
            React.createElement(PlatformSwitch, {
              className: "playground-tasks-calendar-view-switch playground-calendar-app-header-switch",
              value: activeView,
              options: [
                { value: "day", label: "Day" },
                { value: "week", label: "Week" },
                { value: "month", label: "Month" },
              ],
              ariaLabel: "Calendar view",
              onValueChange: (nextView) => calendarTopNavActionsRef.current?.setView?.(nextView),
            }),
            React.createElement("button", {
              type: "button",
              className: "playground-content-menu-button playground-tasks-calendar-toolbar-plus playground-calendar-app-header-plus",
              onClick: () => calendarTopNavActionsRef.current?.create?.(),
              title: "New scheduled task",
              "aria-label": "New scheduled task",
            }, React.createElement(Plus, { width: 16, height: 16, strokeWidth: 1.8 }))
          );
        }

`;
