/**
 * Shared visual primitive for every item in the sidebar thread list.
 *
 * Domain adapters (ordinary threads and workflow-run overview groups) own
 * their data and navigation behavior. This component owns the row contract:
 * one optional leading visual, one truncated title, one contextual time label,
 * and exactly one trailing control.
 */
export const APP_SIDEBAR_THREAD_LIST_ITEM_SCRIPT = `
        function SidebarThreadListItem(props = {}) {
          const variant = props.variant === "workflow-overview" ? "workflow-overview" : "thread";
          const isWorkflowOverview = variant === "workflow-overview";
          const showRunningIndicator = Boolean(props.running) && !isWorkflowOverview;
          const hasMenuAction = !isWorkflowOverview && props.trailingAction === "menu";
          const hasChevronAction = isWorkflowOverview && props.trailingAction === "chevron";
          const hasTrailingAction = hasMenuAction || hasChevronAction;
          const rootClassName = [
            "sidebar-thread-list-item",
            isWorkflowOverview
              ? "sidebar-metronome-run-item is-workflow-overview"
              : (props.pinned ? "sidebar-pinned-button" : "sidebar-thread-item"),
            props.active ? "is-active" : "",
            props.attention ? "has-permission-attention" : "",
            props.nested ? "is-metronome-child" : "",
            props.menuOpen ? "is-menu-open" : "",
            props.timeLabel ? "has-time" : "",
            hasTrailingAction ? "has-trailing-action" : "",
            String(props.className || "").trim(),
          ].filter(Boolean).join(" ");
          const mainClassName = "sidebar-thread-list-item__main "
            + (isWorkflowOverview ? "sidebar-metronome-run-main" : "sidebar-thread-main");
          const leadingClassName = [
            "sidebar-thread-list-item__leading",
            isWorkflowOverview ? "sidebar-metronome-run-icon" : "",
            String(props.leadingClassName || "").trim(),
          ].filter(Boolean).join(" ");
          const leadingVisual = showRunningIndicator
            ? React.createElement("img", {
                className: "sidebar-thread-running-indicator",
                src: "/img/spinner.svg",
                alt: "",
                "aria-hidden": "true",
              })
            : props.leadingIcon
              ? props.leadingIcon
              : props.pinned
                ? React.createElement(Pin, { strokeWidth: 1.75 })
                : null;

          const trailingControl = hasMenuAction
            ? React.createElement("button", {
                type: "button",
                className: "sidebar-thread-list-item__action sidebar-thread-menu-button" + (props.menuOpen ? " is-open" : ""),
                onClick: props.onMenuClick,
                "aria-label": props.menuAriaLabel || "Thread actions",
                "aria-expanded": props.menuOpen ? "true" : "false",
                "aria-busy": props.menuBusy ? "true" : "false",
                disabled: Boolean(props.menuDisabled),
              }, React.createElement(EllipsisVertical, {
                className: "sidebar-thread-menu-icon",
                strokeWidth: 1.85,
              }))
            : hasChevronAction
              ? React.createElement("button", {
                  type: "button",
                  className: "sidebar-thread-list-item__action sidebar-metronome-run-toggle" + (props.expanded ? " is-expanded" : ""),
                  onClick: props.onChevronClick,
                  "aria-label": props.chevronAriaLabel || (props.expanded ? "Collapse workflow threads" : "Expand workflow threads"),
                  "aria-expanded": props.expanded ? "true" : "false",
                  "aria-busy": props.chevronBusy ? "true" : "false",
                }, React.createElement(ChevronRight, { strokeWidth: 1.8 }))
              : null;

          return React.createElement("div", {
            className: rootClassName,
            onContextMenu: props.onContextMenu,
          },
            React.createElement("button", {
              type: "button",
              className: mainClassName,
              onClick: props.onSelect,
              "aria-label": props.selectAriaLabel || ("Open " + String(props.title || "thread")),
              "aria-current": props.active ? "page" : undefined,
            },
              React.createElement("span", { className: "sidebar-thread-list-item__content sidebar-thread-content" },
                React.createElement("span", { className: "sidebar-thread-list-item__title-row sidebar-thread-title-row" },
                  leadingVisual
                    ? React.createElement("span", {
                        className: leadingClassName,
                        title: props.leadingTitle || undefined,
                        style: props.leadingStyle,
                      }, leadingVisual)
                    : null,
                  props.attention
                    ? React.createElement("span", { className: "sidebar-thread-attention-dot", title: "Permission needed" })
                    : null,
                  React.createElement("span", { className: "sidebar-thread-list-item__copy sidebar-thread-title-copy" },
                    props.ticketNumber
                      ? React.createElement("span", { className: "sidebar-thread-ticket-number" }, props.ticketNumber)
                      : null,
                    React.createElement("span", {
                      className: "sidebar-thread-list-item__title " + (isWorkflowOverview ? "sidebar-metronome-run-title" : "sidebar-thread-title"),
                    }, props.title || "Untitled thread")
                  )
                )
              )
            ),
            React.createElement("span", {
              className: "sidebar-thread-list-item__side " + (isWorkflowOverview ? "sidebar-metronome-run-side" : "sidebar-thread-side"),
            },
              props.timeLabel
                ? React.createElement("span", {
                    className: "sidebar-thread-list-item__time " + (isWorkflowOverview ? "sidebar-metronome-run-time" : "sidebar-thread-hover-meta"),
                    title: props.timeTitle || undefined,
                  }, props.timeLabel)
                : null,
              trailingControl
            )
          );
        }

`;
