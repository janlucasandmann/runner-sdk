export const APP_SIDEBAR_MODE_SELECTOR_SCRIPT = `        function getAppSidebarModeOptions() {
          return [
            {
              id: "work",
              label: "Create",
              description: "Threads, projects, files",
              Icon: PencilRuler,
            },
            {
              id: "configure",
              label: "Configure",
              description: "Agents, computers, plugins, skills",
              Icon: SlidersHorizontal,
            },
            {
              id: "develop",
              label: "Develop",
              description: "Servers, actions, code",
              Icon: Code2,
            },
          ];
        }

        function getAppSidebarModeOption(mode) {
          return getAppSidebarModeOptions().find((option) => option.id === mode) || getAppSidebarModeOptions()[0];
        }

        function renderAppSidebarModeSelector() {
          const activeOption = getAppSidebarModeOption(sidebarWorkspaceMode);
          const shouldRenderModeMenu = sidebarWorkspaceMenuOpen || renderedSidebarWorkspaceMenu;
          const modeMenuAnimation = sidebarWorkspaceMenuOpen
            ? "down-in"
            : renderedSidebarWorkspaceMenu
              ? "down-out"
              : false;

          return React.createElement(PlatformPopup, {
            open: shouldRenderModeMenu,
            rootRef: sidebarWorkspaceMenuRef,
            rootClassName: "app-sidebar-mode-selector",
            animation: modeMenuAnimation,
            variant: "minimal",
            surfaceClassName: "app-sidebar-mode-menu",
            surfaceProps: {
              role: "menu",
              "aria-label": "Platform mode",
            },
            trigger: React.createElement("button", {
              type: "button",
              className: "app-sidebar-mode-trigger" + (sidebarWorkspaceMenuOpen ? " is-open" : ""),
              onClick: () => setSidebarWorkspaceMenuOpen((current) => !current),
              "aria-label": "Switch platform mode",
              "aria-expanded": sidebarWorkspaceMenuOpen ? "true" : "false",
            },
              React.createElement("span", { className: "app-sidebar-mode-label" }, activeOption.label),
              React.createElement(ChevronDown, { className: "app-sidebar-mode-trigger-chevron", strokeWidth: 1.8 })
            ),
          },
            getAppSidebarModeOptions().map((option) => {
              const OptionIcon = getPlaygroundSafeIconComponent(option.Icon, Circle);
              const isActive = option.id === sidebarWorkspaceMode;
              return React.createElement("button", {
                key: option.id,
                type: "button",
                role: "menuitemradio",
                "aria-checked": isActive ? "true" : "false",
                className: "app-sidebar-mode-option" + (isActive ? " is-active" : ""),
                onClick: () => {
                  if (isActive) {
                    setSidebarWorkspaceMenuOpen(false);
                    return;
                  }
                  requestPlatformNavigation(() => handleSidebarWorkspaceModeSelect(option.id));
                },
              },
                React.createElement("span", { className: "app-sidebar-mode-icon-shell" },
                  React.createElement(OptionIcon, { className: "app-sidebar-mode-icon", strokeWidth: 1.8 })
                ),
                React.createElement("span", { className: "app-sidebar-mode-option-copy" },
                  React.createElement("span", { className: "app-sidebar-mode-option-label" }, option.label)
                ),
                isActive
                  ? React.createElement(Check, { className: "app-sidebar-mode-option-check", strokeWidth: 1.9 })
                  : null
              );
            })
          );
        }
`;
