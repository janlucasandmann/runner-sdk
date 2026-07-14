export const IMAGINE_APP_TOP_NAVIGATION_SCRIPT = String.raw`
        function renderImagineModeSwitch() {
          return React.createElement("div", { className: "content-mode-switch playground-thread-mode-switch playground-imagine-top-nav-switch", role: "tablist", "aria-label": "Imagine views" },
            [
              { id: "explore", label: "Explore" },
              { id: "my-templates", label: "My Templates" },
              { id: "favourites", label: "Favourites" },
            ].map((tab) => {
              const isActiveImagineTab = imagineActiveView === tab.id || (tab.id === "my-templates" && imagineActiveView === "create-template");
              return React.createElement("button", {
                key: tab.id,
                type: "button",
                role: "tab",
                className: "content-mode-button" + (isActiveImagineTab ? " is-active" : ""),
                "aria-selected": isActiveImagineTab ? "true" : "false",
                onClick: () => setImagineActiveView(tab.id),
              }, tab.label);
            })
          );
        }

        function renderImagineMediaModeSelector() {
          const options = [
            { id: "image", label: "Image" },
            { id: "video", label: "Video" },
          ];
          const activeOption = options.find((option) => option.id === imagineMediaMode) || options[0];
          return React.createElement("div", { className: "playground-files-toolbar-anchor playground-files-environment-select-shell playground-imagine-media-mode-selector" },
            React.createElement("button", {
              type: "button",
              className: "playground-files-inline-selector" + (imagineMediaModePopover ? " active" : ""),
              onClick: () => {
                setImagineToolbarPopover("");
                setImagineMediaModePopover((current) => !current);
              },
            },
              React.createElement("span", null, activeOption.label),
              React.createElement(ChevronDown, {
                className: "playground-files-inline-selector-chevron",
                strokeWidth: 1.85,
              })
            ),
            imagineMediaModePopover
              ? React.createElement(PlatformPopupSurface, { className: "playground-files-environment-menu playground-imagine-media-mode-menu" },
                  React.createElement("div", { className: "playground-files-environment-menu-title" }, "Mode"),
                  React.createElement("div", { className: "playground-files-environment-menu-body" },
                    options.map((option) =>
                      React.createElement("button", {
                          key: option.id,
                          type: "button",
                          className: "playground-files-environment-menu-row" + (imagineMediaMode === option.id ? " selected" : ""),
                          onClick: () => {
                            setImagineMediaMode(option.id);
                            setImagineMediaModePopover(false);
                          },
                        },
                        React.createElement("span", { className: "playground-files-environment-menu-label" }, option.label),
                        React.createElement("span", { className: "playground-files-environment-menu-check-slot" },
                          imagineMediaMode === option.id
                            ? React.createElement(Check, { className: "playground-files-environment-menu-check", width: 16, height: 16, strokeWidth: 2 })
                            : null
                        )
                      )
                    )
                  )
                )
              : null
          );
        }

        function renderImagineTopNavControls() {
          const filterOptions = [
            { id: "all", label: "All templates", description: "Show every template" },
            { id: "campaign", label: "Campaigns", description: "Ads, launches, and social visuals" },
            { id: "product", label: "Product", description: "Product ads, apps, dashboards, and data visuals" },
            { id: "editorial", label: "Editorial", description: "Stories, blogs, and fashion campaigns" },
            { id: "concept", label: "Concepts", description: "Explainers, concept art, and worlds" },
          ];
          return React.createElement("div", { className: "playground-imagine-top-nav-controls" },
            React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-imagine-filter-shell" },
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button is-backlog-filter" + (imagineToolbarPopover === "filter" || imagineFilterMode !== "all" ? " is-active" : ""),
                onClick: () => setImagineToolbarPopover((current) => current === "filter" ? "" : "filter"),
              },
                React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Categories")
              ),
              imagineToolbarPopover === "filter"
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                    filterOptions.map((option) =>
                      React.createElement("button", {
                          key: option.id,
                          type: "button",
                          className: "tb-popup-row tb-popup-row-select" + (imagineFilterMode === option.id ? " selected" : ""),
                          onClick: () => {
                            setImagineFilterMode(option.id);
                            setImagineToolbarPopover("");
                          },
                        },
                        React.createElement("span", { className: "tb-popup-check-slot" },
                          imagineFilterMode === option.id
                            ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                            : null
                        ),
                        React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                          React.createElement("span", null, option.label)
                        )
                      )
                    )
                  )
                : null
            ),
            React.createElement("button", {
              type: "button",
              className: "playground-files-control-button is-backlog-sort",
              onClick: () => {
                setImagineToolbarPopover("");
                setImagineActiveView("create-template");
              },
            },
              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Template")
            ),
            React.createElement("span", { className: "tb-image-preview-header-divider playground-imagine-top-nav-divider", "aria-hidden": "true" })
          );
        }

`;
