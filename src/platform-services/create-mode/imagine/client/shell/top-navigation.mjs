export const IMAGINE_APP_TOP_NAVIGATION_SCRIPT = String.raw`
        function renderImagineModeSwitch() {
          const selectedImagineView = imagineActiveView === "create-template"
            ? "my-templates"
            : imagineActiveView;
          return React.createElement(PlatformSwitch, {
            className: "playground-imagine-top-nav-switch",
            value: selectedImagineView,
            options: [
              { value: "explore", label: "All Templates" },
              { value: "my-templates", label: "My Templates" },
              { value: "favourites", label: "Favourites" },
            ],
            onValueChange: setImagineActiveView,
            ariaLabel: "Imagine views",
          });
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
            { id: "all", label: "All templates" },
            { id: "campaign", label: "Campaigns" },
            { id: "product", label: "Product" },
            { id: "editorial", label: "Editorial" },
            { id: "concept", label: "Concepts" },
          ];
          return React.createElement("div", { className: "playground-imagine-top-nav-controls" },
            React.createElement(PlatformPopup, {
                open: imagineToolbarPopover === "filter",
                portal: true,
                placement: "bottom-end",
                animation: "down-in",
                rootClassName: "playground-imagine-filter-shell",
                surfaceClassName: "playground-imagine-category-menu",
                surfaceProps: {
                  role: "menu",
                  "aria-label": "Template categories",
                  width: 240,
                },
                trigger: React.createElement(PlatformSecondaryButton, {
                  size: "small",
                  type: "button",
                  active: imagineToolbarPopover === "filter" || imagineFilterMode !== "all",
                  onClick: () => setImagineToolbarPopover((current) => current === "filter" ? "" : "filter"),
                  "aria-haspopup": "menu",
                  "aria-expanded": imagineToolbarPopover === "filter",
                },
                  React.createElement(Layers, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Categories")
                ),
              },
              filterOptions.map((option) => {
                const isSelected = imagineFilterMode === option.id;
                return React.createElement("button", {
                    key: option.id,
                    type: "button",
                    role: "menuitemradio",
                    "aria-checked": isSelected,
                    className: "tb-popup-row tb-popup-row-select" + (isSelected ? " is-selected" : ""),
                    onClick: () => {
                      setImagineFilterMode(option.id);
                      setImagineToolbarPopover("");
                    },
                  },
                  React.createElement("span", { className: "tb-popup-check-slot", "aria-hidden": "true" },
                    isSelected
                      ? React.createElement(Check, { className: "tb-popup-check", width: 13, height: 13, strokeWidth: 1.8 })
                      : null
                  ),
                  React.createElement("span", { className: "tb-popup-label" }, option.label)
                );
              })
            ),
            React.createElement(PlatformPrimaryButton, {
              size: "small",
              type: "button",
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
