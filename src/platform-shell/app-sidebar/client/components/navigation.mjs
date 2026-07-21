export function createAppSidebarNavigationScript(options = {}) {
  const configurePrimaryEntries = String(options.configurePrimaryEntries || "");
  const configureGovernanceEntries = String(options.configureGovernanceEntries || "");
  const configureInfrastructureEntries = String(options.configureInfrastructureEntries || "");
  const developPrimaryEntries = String(options.developPrimaryEntries || "");
  const developAgentServiceEntries = String(options.developAgentServiceEntries || "");
  const createPrimaryEntries = String(options.createPrimaryEntries || "");
  return `        function getSidebarNavigationItems() {
          if (sidebarWorkspaceMode === "configure") {
            return [
${configurePrimaryEntries}              {
                id: "configure-resources-label",
                type: "subtitle",
                label: "Resources",
              },
              {
                id: "agents",
                label: "Agents",
                Icon: Bot,
                active: isResourcesPage && activeResourcesView === "agents",
                onClick: handleOpenAgentsShortcut,
              },
              {
                id: "computers",
                label: "Computers",
                Icon: Monitor,
                active: isResourcesPage && activeResourcesView === "computers",
                onClick: handleOpenEnvironmentsShortcut,
              },
              {
                id: "tags",
                label: "Tags and Plugins",
                Icon: Tag,
                active: activePage === "tools" && (toolsView === "tags" || toolsView === "plugins"),
                onClick: handleOpenTagsShortcut,
              },
              {
                id: "skills",
                label: "Skills",
                Icon: Layers,
                active: activePage === "tools" && toolsView === "skills",
                onClick: handleOpenSkillsShortcut,
              },
              {
                id: "configure-governance-label",
                type: "subtitle",
                label: "Governance",
              },
${configureGovernanceEntries}
              {
                id: "configure-infrastructure-label",
                type: "subtitle",
                label: "Infrastructure",
              },
${configureInfrastructureEntries}            ];
          }

          if (sidebarWorkspaceMode === "develop") {
            const developServerPageItems = getDevelopServerPageItems().filter((item) => item.kind !== "api");
            const buildDevelopServerSidebarItem = (item) => ({
              id: "server-" + item.id,
              label: item.label,
              Icon: item.Icon,
              active: isResourcesPage && activeResourcesView === "servers" && activeResourcesServerKind === item.kind,
              onClick: () => openResourcesView("servers", { serverKind: item.kind, forceOverview: true }),
            });
            const agentDevelopServerPageItems = developServerPageItems.filter((item) => item.kind === "agent_runtime" || item.kind === "voice_agent");
            const mainDevelopServerPageItems = developServerPageItems.filter((item) => item.kind !== "agent_runtime" && item.kind !== "voice_agent");
            return [
${developPrimaryEntries}              {
                id: "develop-resources-label",
                type: "subtitle",
                label: "Resources",
              },
              ...mainDevelopServerPageItems.map((item) => buildDevelopServerSidebarItem(item)),
              {
                id: "develop-agent-services-label",
                type: "subcategory",
                label: "Agent Services",
              },
              ...agentDevelopServerPageItems.map((item) => buildDevelopServerSidebarItem(item)),
${developAgentServiceEntries}            ];
          }

          return [
            {
              id: "new-thread",
              label: "New Thread",
              Icon: SquarePen,
              active: showInitialThreadWelcome,
              onClick: hasShellAccess ? handleNewThread : handleSignInWithComputerAgents,
            },
            {
              id: "projects",
              label: "Projects",
              Icon: Rocket,
              active: activePage === "tasks",
              onClick: handleOpenTasksShortcut,
            },
            {
              id: "files",
              label: "Files",
              Icon: FolderOpen,
              active: activePage === "files",
              onClick: handleOpenFilesShortcut,
            },
            {
              id: "create-services-label",
              type: "subtitle",
              label: "Services",
            },
${createPrimaryEntries}
            {
              id: "metronome",
              label: "Metronome",
              Icon: Metronome,
              active: activePage === "metronome",
              onClick: openMetronomeOverviewPage,
            },
            {
              id: "calendar",
              label: "Calendar",
              Icon: CalendarIcon,
              active: activePage === "calendar",
              onClick: openCalendarOverviewPage,
            },
          ];
        }

        function getSidebarFooterNavigationItems() {
          return [];
        }

        function handleSidebarNavigationItemClick(item) {
          requestPlatformNavigation(item?.onClick);
        }

        function renderSidebarNavigationButton(item) {
          if (item?.type === "subtitle") {
            return React.createElement("div", {
              key: item.id,
              className: "sidebar-action-subtitle",
            }, item.label);
          }
          if (item?.type === "subcategory") {
            return React.createElement("div", {
              key: item.id,
              className: "sidebar-action-subtitle",
            }, item.label);
          }
          const Icon = getPlaygroundSafeIconComponent(item.Icon, Circle);
          return React.createElement("button", {
            key: item.id,
            type: "button",
            className: "sidebar-action-button" + (item.active ? " is-active" : "") + (item.id === "search" ? " sidebar-search-trigger" : ""),
            onClick: () => handleSidebarNavigationItemClick(item),
          },
            item.id === "search"
              ? React.createElement(React.Fragment, null,
                  React.createElement("div", { className: "sidebar-search-trigger-main" },
                    React.createElement(Icon, { className: "sidebar-search-trigger-icon", strokeWidth: 1.5 }),
                    React.createElement("span", { className: "sidebar-search-trigger-copy" }, item.label)
                  ),
                  React.createElement("span", { className: "sidebar-search-trigger-shortcut" }, item.shortcut || "")
                )
              : React.createElement(React.Fragment, null,
                  React.createElement(Icon, { className: "sidebar-action-icon", strokeWidth: 1.5 }),
                  React.createElement("span", null, item.label)
                )
          );
        }

`;
}
