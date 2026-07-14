const ORGANIZATIONS_PAGE_OVERVIEW_TEMPLATE = `	          const normalizeOrganizationTableSortDirection = (direction) =>
	            direction === "desc" ? "desc" : "asc";
	          const normalizedOrganizationOverviewSortDirection = normalizeOrganizationTableSortDirection(organizationOverviewSortDirection);
	          const getOrganizationOverviewDisplayName = (organization) => getOrganizationPageDisplayName(organization);
	          const getOrganizationOverviewRoleLabel = (organization) => formatRole(organization?.role || organization?.membership?.role);
	          const getOrganizationOverviewTypeLabel = (organization) => formatOrganizationType(organization?.type);
	          const getOrganizationOverviewStatusLabel = (organization) => isOrganizationPageActiveOrganization(organization) ? "Current" : "Available";
	          const getOrganizationOverviewCreatedTimestamp = (organization) => {
	            const timestamp = Date.parse(String(organization?.createdAt || organization?.created_at || ""));
	            return Number.isFinite(timestamp) ? timestamp : 0;
	          };
	          const getOrganizationOverviewSortValue = (organization, sortKey) => {
	            switch (sortKey) {
	              case "role":
	                return getOrganizationOverviewRoleLabel(organization);
	              case "type":
	                return getOrganizationOverviewTypeLabel(organization);
	              case "status":
	                return getOrganizationOverviewStatusLabel(organization);
	              case "created":
	                return getOrganizationOverviewCreatedTimestamp(organization);
	              case "name":
	              default:
	                return getOrganizationOverviewDisplayName(organization);
	            }
	          };
	          const compareOrganizationOverviewSortValues = (left, right, sortKey) => {
	            const leftValue = getOrganizationOverviewSortValue(left, sortKey);
	            const rightValue = getOrganizationOverviewSortValue(right, sortKey);
	            if (typeof leftValue === "number" || typeof rightValue === "number") {
	              const leftNumber = typeof leftValue === "number" && Number.isFinite(leftValue) ? leftValue : 0;
	              const rightNumber = typeof rightValue === "number" && Number.isFinite(rightValue) ? rightValue : 0;
	              if (leftNumber !== rightNumber) {
	                return leftNumber - rightNumber;
	              }
	            } else {
	              const textComparison = String(leftValue || "").localeCompare(String(rightValue || ""), undefined, {
	                numeric: true,
	                sensitivity: "base",
	              });
	              if (textComparison !== 0) {
	                return textComparison;
	              }
	            }
	            return getOrganizationOverviewDisplayName(left).localeCompare(getOrganizationOverviewDisplayName(right), undefined, {
	              numeric: true,
	              sensitivity: "base",
	            });
	          };
	          const normalizedOrganizationOverviewSearchQuery = String(organizationOverviewSearchQuery || "").trim().toLowerCase();
	          const visibleOverviewOrganizations = (Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [])
	            .filter((organization) => {
	              const isActive = isOrganizationPageActiveOrganization(organization);
	              const type = String(organization?.type || "").trim().toLowerCase();
	              if (organizationOverviewFilter === "current" && !isActive) {
	                return false;
	              }
	              if (organizationOverviewFilter === "company" && type === "personal") {
	                return false;
	              }
	              if (organizationOverviewFilter === "personal" && type !== "personal") {
	                return false;
	              }
	              if (!normalizedOrganizationOverviewSearchQuery) {
	                return true;
	              }
	              const haystack = [
	                getOrganizationOverviewDisplayName(organization),
	                getOrganizationOverviewRoleLabel(organization),
	                getOrganizationOverviewTypeLabel(organization),
	                getOrganizationOverviewStatusLabel(organization),
	                organization?.id || "",
	              ].join(" ").toLowerCase();
	              return haystack.includes(normalizedOrganizationOverviewSearchQuery);
	            })
	            .slice()
	            .sort((left, right) => {
	              const baseComparison = compareOrganizationOverviewSortValues(left, right, organizationOverviewSort);
	              return normalizedOrganizationOverviewSortDirection === "desc" ? -baseComparison : baseComparison;
	            });
	          const visibleOverviewOrganizationIds = visibleOverviewOrganizations.map((organization) => String(organization?.id || "").trim()).filter(Boolean);
	          const selectedVisibleOrganizationOverviewIds = visibleOverviewOrganizationIds.filter((organizationId) => selectedOrganizationOverviewIds.has(organizationId));
	          const allVisibleOrganizationsSelected = visibleOverviewOrganizationIds.length > 0 && selectedVisibleOrganizationOverviewIds.length === visibleOverviewOrganizationIds.length;
	          const organizationOverviewFilterOptions = [
	            { id: "all", label: "All Organizations", description: "Show every organization workspace" },
	            { id: "current", label: "Current Organization", description: "Only show the active workspace" },
	            { id: "company", label: "Company Organizations", description: "Only show shared company workspaces" },
	            { id: "personal", label: "Personal Organization", description: "Only show the personal workspace" },
	          ];
		          const organizationOverviewColumns = [
		            {
		              id: "name",
		              header: "Name",
		              accessor: getOrganizationOverviewDisplayName,
		              sortable: true,
		              width: "minmax(220px, 1.35fr)",
		              cell: ({ row: organization }) => React.createElement("div", { className: "playground-agents-overview-name-title" }, getOrganizationOverviewDisplayName(organization)),
		            },
		            {
		              id: "role",
		              header: "Role",
		              accessor: getOrganizationOverviewRoleLabel,
		              sortable: true,
		              width: "minmax(105px, 0.58fr)",
		              cell: ({ row: organization }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getOrganizationOverviewRoleLabel(organization)),
		            },
		            {
		              id: "type",
		              header: "Type",
		              accessor: getOrganizationOverviewTypeLabel,
		              sortable: true,
		              width: "minmax(120px, 0.62fr)",
		              hideBelow: 760,
		              cell: ({ row: organization }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getOrganizationOverviewTypeLabel(organization)),
		            },
		            {
		              id: "status",
		              header: "Status",
		              accessor: getOrganizationOverviewStatusLabel,
		              sortable: true,
		              width: "minmax(110px, 0.56fr)",
		              hideBelow: 900,
		              cell: ({ row: organization }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getOrganizationOverviewStatusLabel(organization)),
		            },
		          ];
		          const getOrganizationOverviewActions = (organization) => {
		            const organizationId = String(organization?.id || "").trim();
		            const isActive = isOrganizationPageActiveOrganization(organization);
		            const roleId = normalizeOrganizationRoleId(organization?.role || organization?.membership?.role, "member");
		            const canRename = roleId === "owner"
		              || roleId === "admin"
		              || String(organization?.ownerUserId || organization?.ownerId || "") === String(sessionState.userId || "");
		            return [
		              { id: "open", label: "Open", icon: ChevronRight, onSelect: () => openOrganizationDetail(organizationId) },
		              { id: "activate", label: "Set active", icon: Check, hidden: isActive, onSelect: () => setActiveOrganizationFromRecord(organization) },
		              {
		                id: "rename",
		                label: "Rename",
		                icon: SquarePen,
		                hidden: !canRename,
		                onSelect: () => {
		                  setOrganizationPageSelectedOrganizationId(organizationId);
		                  setOrganizationPageRenameName(organization?.name || "");
		                  setOrganizationPageRenameModalOpen(true);
		                },
		              },
		            ];
		          };
		          const organizationOverviewDataTable = React.createElement(PlatformDataTable, {
		            rows: visibleOverviewOrganizations,
		            columns: organizationOverviewColumns,
		            getRowId: (organization) => String(organization?.id || ""),
		            ariaLabel: "Organizations",
		            className: "playground-organizations-platform-data-table",
		            surface: "plain",
		            sorting: {
		              value: { id: organizationOverviewSort, direction: normalizedOrganizationOverviewSortDirection },
		              manual: true,
		              onChange: (nextSorting) => {
		                if (!nextSorting) return;
		                setOrganizationOverviewSort(nextSorting.id);
		                setOrganizationOverviewSortDirection(nextSorting.direction);
		                setOrganizationOverviewToolbarPopover("");
		              },
		            },
		            selection: {
		              enabled: true,
		              value: selectedOrganizationOverviewIds,
		              onChange: ({ selectedIds }) => setSelectedOrganizationOverviewIds(new Set(selectedIds)),
		              ariaLabel: (organization) => "Select " + getOrganizationOverviewDisplayName(organization),
		            },
		            toolbar: {
		              search: { value: organizationOverviewSearchQuery, onChange: setOrganizationOverviewSearchQuery, placeholder: "Search organizations", manual: true },
		              showSort: true,
		              filters: [{ id: "type", label: "Type", value: organizationOverviewFilter, options: organizationOverviewFilterOptions, onChange: setOrganizationOverviewFilter }],
		              primaryAction: { label: "New Organization", icon: Plus, onClick: () => setOrganizationPageCreateModalOpen(true) },
		            },
		            getRowActions: getOrganizationOverviewActions,
		            getRowAriaLabel: getOrganizationOverviewDisplayName,
		            onRowActivate: (organization) => openOrganizationDetail(organization.id),
		            loading: organizationPageLoading && visibleOverviewOrganizations.length === 0,
		            emptyState: normalizedOrganizationOverviewSearchQuery || organizationOverviewFilter !== "all"
		              ? "No matching organizations found."
		              : "No organizations yet.",
		          });
		          const renderOverview = () => React.createElement("div", { className: "playground-team-overview-page playground-agents-overview-page playground-organization-overview-page is-develop-configure-page" },
	            React.createElement("div", { className: "playground-environments-home-content playground-team-overview-content playground-organization-overview-content" },
	              React.createElement("section", { className: "playground-environments-home-hero playground-develop-server-kind-hero playground-agents-configure-hero playground-team-overview-hero playground-organization-overview-hero" },
	                React.createElement("div", { className: "playground-organization-overview-hero-intro" },
	                  React.createElement("h1", { className: "playground-organization-overview-hero-title" }, "Organizations"),
	                  React.createElement("p", { className: "playground-organization-overview-hero-description" }, "Bring members, agents, computers, resources, usage, and billing into one company-wide workspace."),
	                  React.createElement("div", { className: "playground-organization-overview-hero-actions" },
	                    React.createElement(PlatformPrimaryButton, {
	                      size: "medium",
	                      type: "button",
	                      className: "playground-functions-empty-button is-primary playground-organization-overview-docs-button",
	                      onClick: () => window.open(__ORGANIZATIONS_DOCUMENTATION_URL__, "_blank", "noopener,noreferrer"),
	                    },
	                      React.createElement("span", null, "Documentation"),
	                      React.createElement(ArrowUpRight, { width: 13, height: 13, strokeWidth: 1.8 })
	                    )
	                  )
	                ),
	                organizationPageError
	                  ? React.createElement("div", { className: "playground-team-error" }, organizationPageError)
	                  : null,
	                React.createElement("section", {
	                    className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-resources-overview-section is-develop-server-kind-list playground-agents-overview-table-section playground-team-overview-table-section playground-organization-overview-table-section",
	                  },
		                  organizationOverviewDataTable
		                )
	              )
	            ),
	            renderOrganizationCreateModal(),
	            renderOrganizationRenameModal()
	          );
`;

export function createOrganizationsPageOverviewScript(documentationUrl) {
  return ORGANIZATIONS_PAGE_OVERVIEW_TEMPLATE.replace(
    "__ORGANIZATIONS_DOCUMENTATION_URL__",
    JSON.stringify(String(documentationUrl || "").trim()),
  );
}
