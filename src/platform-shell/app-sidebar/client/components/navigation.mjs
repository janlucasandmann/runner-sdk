export function createAppSidebarNavigationScript(options = {}) {
  const configurePrimaryEntries = String(options.configurePrimaryEntries || "");
  const configureContextEntries = String(options.configureContextEntries || "");
  const configureGovernanceEntries = String(options.configureGovernanceEntries || "");
  const configureInfrastructureEntries = String(options.configureInfrastructureEntries || "");
  const developPrimaryEntries = String(options.developPrimaryEntries || "");
  const developAgentServiceEntries = String(options.developAgentServiceEntries || "");
  const createPrimaryEntries = String(options.createPrimaryEntries || "");
  const adminEntries = String(options.adminEntries || "");
  return `        function getSidebarNavigationItemsForMode(targetMode = sidebarWorkspaceMode) {
          const normalizedTargetMode = targetMode === "develop"
            ? "develop"
            : targetMode === "configure"
              ? "configure"
              : targetMode === "admin"
                ? "admin"
                : "work";
          if (normalizedTargetMode === "admin") {
            return [
${adminEntries}            ];
          }

          if (normalizedTargetMode === "configure") {
            return [
${configurePrimaryEntries}
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
                id: "skills",
                label: "Skills",
                Icon: SquareMousePointer,
                active: activePage === "tools" && toolsView === "skills",
                onClick: handleOpenSkillsShortcut,
              },
              {
                id: "configure-context-label",
                type: "subtitle",
                label: "Context",
              },
${configureContextEntries}              {
                id: "prompts",
                label: "Prompts",
                Icon: MessageSquareText,
                active: activePage === "tools" && toolsView === "prompts",
                onClick: handleOpenPromptsShortcut,
              },
              {
                id: "tags",
                label: "Connectors",
                searchAliases: ["Tags", "Plugins", "Tags and Plugins"],
                Icon: Plug,
                active: activePage === "tools" && (toolsView === "tags" || toolsView === "plugins"),
                onClick: handleOpenTagsShortcut,
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

          if (normalizedTargetMode === "develop") {
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

        function getSidebarNavigationItems() {
          return getSidebarNavigationItemsForMode(sidebarWorkspaceMode);
        }

        function normalizeGlobalServiceSearchValue(value) {
          return String(value || "")
            .toLowerCase()
            .replace(/&/g, " and ")
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\\s+/g, " ");
        }

        function getGlobalServiceSearchMatchRank(searchQuery, itemLabel, itemId) {
          const normalizedQuery = normalizeGlobalServiceSearchValue(searchQuery);
          if (!normalizedQuery) {
            return 0;
          }
          const compactQuery = normalizedQuery.replace(/\\s+/g, "");
          const normalizedLabel = normalizeGlobalServiceSearchValue(itemLabel);
          const normalizedId = normalizeGlobalServiceSearchValue(itemId);
          const compactLabel = normalizedLabel.replace(/\\s+/g, "");
          const compactId = normalizedId.replace(/\\s+/g, "");
          if (
            normalizedLabel === normalizedQuery
            || normalizedId === normalizedQuery
            || compactLabel === compactQuery
            || compactId === compactQuery
          ) {
            return 0;
          }
          if (
            normalizedLabel.startsWith(normalizedQuery)
            || compactLabel.startsWith(compactQuery)
          ) {
            return 1;
          }
          if (
            normalizedId.startsWith(normalizedQuery)
            || compactId.startsWith(compactQuery)
          ) {
            return 2;
          }
          if (
            normalizedLabel.includes(normalizedQuery)
            || compactLabel.includes(compactQuery)
          ) {
            return 3;
          }
          if (
            normalizedId.includes(normalizedQuery)
            || compactId.includes(compactQuery)
          ) {
            return 4;
          }
          return null;
        }

        function getGlobalServiceNavigationItems(searchQuery = "") {
          const normalizedQuery = normalizeGlobalServiceSearchValue(searchQuery);
          const modeOptions = [
            { id: "work", label: "Create" },
            { id: "configure", label: "Configure" },
            { id: "develop", label: "Develop" },
            { id: "admin", label: "Admin" },
          ];
          const excludedIds = new Set(["new-thread", "configure-home", "develop-home"]);
          const serviceItems = modeOptions.flatMap((modeOption) => (
            getSidebarNavigationItemsForMode(modeOption.id)
              .filter((item) => (
                item
                && !item.type
                && !excludedIds.has(String(item.id || "").trim())
              ))
              .map((item, itemIndex) => {
                const matchRanks = [
                  item.label,
                  ...(Array.isArray(item.searchAliases) ? item.searchAliases : []),
                ]
                  .map((candidateLabel) => getGlobalServiceSearchMatchRank(
                    normalizedQuery,
                    candidateLabel,
                    item.id
                  ))
                  .filter((rank) => rank !== null);
                const matchRank = matchRanks.length
                  ? Math.min(...matchRanks)
                  : null;
                if (matchRank === null) {
                  return null;
                }
                return {
                  ...item,
                  globalSearchId: "service:" + modeOption.id + ":" + item.id,
                  workspaceMode: modeOption.id,
                  workspaceLabel: modeOption.label,
                  matchRank,
                  sourceOrder: modeOptions.indexOf(modeOption) * 100 + itemIndex,
                };
              })
              .filter(Boolean)
          ));
          return serviceItems.sort((left, right) => (
            left.matchRank - right.matchRank
            || left.sourceOrder - right.sourceOrder
            || String(left.label || "").localeCompare(
              String(right.label || ""),
              undefined,
              { sensitivity: "base" }
            )
          ));
        }

        function handleGlobalServiceNavigationItemClick(globalSearchId) {
          const normalizedGlobalSearchId = String(globalSearchId || "").trim();
          const serviceItem = getGlobalServiceNavigationItems().find(
            (item) => item.globalSearchId === normalizedGlobalSearchId
          );
          if (!serviceItem) {
            return false;
          }
          requestPlatformNavigation(() => {
            setSidebarWorkspaceMode(serviceItem.workspaceMode);
            setSidebarWorkspaceMenuOpen(false);
            serviceItem.onClick?.();
          });
          return true;
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
