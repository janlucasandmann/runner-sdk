export const ORGANIZATIONS_PAGE_RESOURCES_SCRIPT = `
	          const organizationResourceTypeMeta = {
	            project: { label: "Project", Icon: LayoutDashboard },
	            environment: { label: "Computer", Icon: Monitor },
	            agent: { label: "Agent", Icon: Bot },
	            database: { label: "Database", Icon: Database },
	            server: { label: "Deployed resource", Icon: Code2 },
	          };
	          const organizationResourceRowsAll = (Array.isArray(organizationPageResources) ? organizationPageResources : []).map((resource) => {
	            const type = String(resource?.type || "server").trim().toLowerCase() || "server";
	            const createdByUserId = String(resource?.createdByUserId || "").trim();
	            const ownerLabel = createdByUserId && createdByUserId === String(sessionState.userId || "").trim()
	              ? "Me"
	              : "Organization member";
	            return {
	              key: type + ":" + String(resource?.id || ""),
	              id: String(resource?.id || ""),
	              resourceId: String(resource?.id || ""),
	              type,
	              title: String(resource?.name || resource?.title || resource?.id || "Untitled resource"),
	              subtitle: organizationResourceTypeMeta[type]?.label || "Resource",
	              secondaryLabel: "Organization",
	              updatedLabel: formatDate(resource?.updatedAt || resource?.createdAt) || "-",
	              ownerLabel,
	              ownerAvatarUrl: ownerLabel === "Me" ? accountAvatarUrl : "",
	              record: resource,
	            };
	          }).filter((row) => row.id);
	          const normalizedOrganizationResourceSearchQuery = String(organizationResourceSearchQuery || "").trim().toLowerCase();
	          const getOrganizationResourceSortValue = (row, sortKey) => {
	            if (sortKey === "updated") {
	              const timestamp = Date.parse(String(row?.record?.updatedAt || row?.record?.createdAt || ""));
	              return Number.isFinite(timestamp) ? timestamp : 0;
	            }
	            if (sortKey === "owner") return row?.ownerLabel || "";
	            if (sortKey === "access") return row?.secondaryLabel || "";
	            return row?.title || "";
	          };
	          const organizationResourceRows = organizationResourceRowsAll
	            .filter((row) => organizationResourceFilter === "all" || row.type === organizationResourceFilter)
	            .filter((row) => !normalizedOrganizationResourceSearchQuery || [row.title, row.subtitle, row.ownerLabel]
	              .join(" ").toLowerCase().includes(normalizedOrganizationResourceSearchQuery))
	            .slice()
	            .sort((left, right) => {
	              const leftValue = getOrganizationResourceSortValue(left, organizationResourceSort);
	              const rightValue = getOrganizationResourceSortValue(right, organizationResourceSort);
	              const comparison = typeof leftValue === "number" && typeof rightValue === "number"
	                ? leftValue - rightValue
	                : String(leftValue || "").localeCompare(String(rightValue || ""), undefined, { numeric: true, sensitivity: "base" });
	              return organizationResourceSortDirection === "desc" ? -comparison : comparison;
	            });
	          const organizationResourceTypeFilters = [
	            { id: "all", label: "All" },
	            { id: "project", label: "Projects" },
	            { id: "environment", label: "Computers" },
	            { id: "agent", label: "Agents" },
	            { id: "database", label: "Databases" },
	            { id: "server", label: "Deployed resources" },
	          ].filter((option) => option.id === "all" || organizationResourceRowsAll.some((row) => row.type === option.id));
	          const handleOrganizationResourceSortChange = (nextSortKey) => {
	            const normalizedSortKey = String(nextSortKey || "resource").trim() || "resource";
	            setOrganizationResourceToolbarPopover("");
	            setOrganizationResourceSortDirection((currentDirection) => {
	              if (organizationResourceSort !== normalizedSortKey) {
	                return normalizedSortKey === "updated" ? "desc" : "asc";
	              }
	              return currentDirection === "asc" ? "desc" : "asc";
	            });
	            setOrganizationResourceSort(normalizedSortKey);
	          };
	          const openOrganizationResource = (row) => {
	            const resourceId = String(row?.resourceId || row?.id || "").trim();
	            if (!resourceId) return;
	            if (!isOrganizationPageActiveOrganization(selectedOrganization)) {
	              setActiveOrganizationFromRecord(selectedOrganization);
	            }
	            if (row.type === "project") {
	              setLatestInteractedProjectId(resourceId);
	              setTasksPageNavigationRequest({
	                token: createPlaygroundPlatformNavigationToken(),
	                projectId: resourceId,
	                view: "overview",
	                missionControlAction: "",
	                projectComposerAction: "",
	              });
	              setActivePage("tasks");
	              return;
	            }
	            if (row.type === "environment") {
	              setEnvironmentId(resourceId);
	              openResourcesView("computers");
	              setEnvironmentsNavigationTargetId(resourceId);
	              setEnvironmentsOpenToken((current) => current + 1);
	              return;
	            }
	            if (row.type === "agent") {
	              openResourcesView("agents");
	              setAgentPageSelectionRequest({ agentId: resourceId, token: createPlaygroundPlatformNavigationToken() });
	              return;
	            }
	            const serverKind = row.type === "database"
	              ? "database"
	              : normalizeDevelopServerPageKind(row?.record?.kind || "");
	            openResourcesView("servers", {
	              serverKind,
	              resourceType: row.type === "database" ? "database" : "server",
	              resourceId,
	            });
	          };
	          const renderOrganizationResources = () => React.createElement("div", { className: "playground-team-detail-panel playground-team-resources-panel" },
	            React.createElement(PlaygroundSharedResourcesTab, {
	              rows: organizationResourceRows,
	              allRows: organizationResourceRowsAll,
	              searchQuery: organizationResourceSearchQuery,
	              onSearchQueryChange: setOrganizationResourceSearchQuery,
	              toolbarPopover: organizationResourceToolbarPopover,
	              onToolbarPopoverChange: setOrganizationResourceToolbarPopover,
	              filter: organizationResourceFilter,
	              onFilterChange: setOrganizationResourceFilter,
	              typeFilters: organizationResourceTypeFilters,
	              viewMode: organizationResourceViewMode,
	              onViewModeChange: setOrganizationResourceViewMode,
	              sortKey: organizationResourceSort,
	              sortDirection: organizationResourceSortDirection,
	              sortableColumns: ["resource", "access", "updated", "owner"],
	              onSortChange: handleOrganizationResourceSortChange,
	              getTypeMeta: (type) => organizationResourceTypeMeta[type] || { label: "Resource", Icon: Layers },
	              renderCreator: () => React.createElement("span", { className: "playground-team-badge playground-team-resource-access-label" }, "Organization"),
	              renderOwner: (row) => React.createElement("span", { className: "playground-team-resource-owner-cell" },
	                renderAccountAvatar(
	                  "playground-team-resource-owner-avatar",
	                  "playground-team-resource-owner-avatar-image",
	                  getAccountInitials(row.ownerLabel),
	                  normalizeSessionPhotoUrl(row.ownerAvatarUrl || "")
	                ),
	                React.createElement("span", { className: "playground-team-badge playground-team-resource-owner-label" }, row.ownerLabel)
	              ),
	              onRowOpen: openOrganizationResource,
	              showNewButton: false,
	              showSelectionColumn: false,
	              searchAriaLabel: "Search organization resources",
	              primaryHeader: "Resource",
	              secondaryHeader: "Access",
	              tertiaryHeader: "Updated",
	              ownerHeader: "Owner",
	              emptyLabel: organizationPageLoading ? "Loading resources..." : "No organization resources yet.",
	              noMatchesLabel: "No organization resources match this view yet.",
	            })
	          );
`;
