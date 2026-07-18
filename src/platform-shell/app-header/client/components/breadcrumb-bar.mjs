const APP_HEADER_BREADCRUMB_BAR_TEMPLATE = `        function renderAppHeaderBreadcrumbs(pathItems) {
          const safeItems = (Array.isArray(pathItems) ? pathItems : [])
            .map((item) => {
              if (typeof item === "string") {
                return { label: item };
              }
              return item && typeof item === "object" ? item : null;
            })
            .filter((item) => String(item?.label || "").trim());
          const firstItemLabel = String(safeItems[0]?.label || "").trim().toLowerCase();
          const visibleItems = ["create", "configure", "develop"].includes(firstItemLabel)
            ? safeItems.slice(1)
            : safeItems;
          const effectiveItems = visibleItems.length > 0 ? visibleItems : [{ label: selectedThreadTitle || "Home" }];

          return React.createElement("div", { className: "playground-top-nav-path", "aria-label": "Page path" },
            effectiveItems.map((item, index) => {
              const label = String(item.label || "").trim();
              const isCurrent = index === effectiveItems.length - 1;
              const key = String(index) + ":" + label;
              const isClickable = typeof item.onClick === "function" && (!isCurrent || item.allowCurrentClick === true);
              const itemContent = React.createElement("span", { className: "playground-top-nav-path-label" }, label);
              const itemNode = item.node != null
                ? item.node
                : isClickable
                  ? React.createElement("button", {
                      type: "button",
                      className: "playground-top-nav-path-item" + (isCurrent ? " is-current" : ""),
                      onClick: () => requestPlatformNavigation(item.onClick),
                      title: label,
                    }, itemContent)
                  : React.createElement("span", {
                      className: "playground-top-nav-path-item" + (isCurrent ? " is-current" : ""),
                      title: label,
                    }, itemContent);
              const itemWithTrailing = item.trailing
                ? React.createElement("span", {
                    className: "playground-top-nav-path-item-group" + (isCurrent ? " is-current" : ""),
                  },
                    itemNode,
                    item.trailing
                  )
                : itemNode;
              return React.createElement(React.Fragment, { key },
                index > 0
                  ? React.createElement(ChevronRight, {
                      className: "playground-top-nav-path-separator",
                      width: 12,
                      height: 12,
                      strokeWidth: 1.8,
                      "aria-hidden": "true",
                    })
                  : null,
                itemWithTrailing
              );
            })
          );
        }
`;

export function createAppHeaderBreadcrumbBarScript() {
  return APP_HEADER_BREADCRUMB_BAR_TEMPLATE;
}
