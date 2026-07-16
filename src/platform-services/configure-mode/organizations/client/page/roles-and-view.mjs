export const ORGANIZATIONS_PAGE_ROLES_AND_VIEW_SCRIPT = `
	          const renderOrganizationRoles = () => {
	            const rolePermissionSets = normalizePlaygroundOrganizationRolePermissionSets(selectedOrganization?.rolePermissionSets);
	            const requestedRoleId = normalizeOrganizationRoleId(organizationPageSelectedRoleId, "member");
	            const selectedRoleId = canManageOrganization
	              ? requestedRoleId
	              : requestedRoleId === "owner" ? "owner" : currentRoleId;
	            const selectedRoleDefinition = getPlaygroundOrganizationRoleDefinition(selectedRoleId);
	            const selectedRolePermissionSet = normalizePlaygroundPermissionSet(rolePermissionSets[selectedRoleDefinition.id], "organization_role");
	            const selectedRoleActionId = "organization-role-permissions:" + selectedRoleDefinition.id;
	            const isSelectedOwnerRole = selectedRoleDefinition.id === "owner";
	            const visibleRoleDefinitions = canManageOrganization
	              ? PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS
	              : PLAYGROUND_ORGANIZATION_ROLE_DEFINITIONS.filter((role) => role.id === currentRoleId || role.id === "owner");
	            const assignedMembersForRole = (roleId) => organizationPageMembers.filter((member) =>
	              normalizeOrganizationRoleId(member?.role, "member") === roleId
	            );
	            const renderAssignedUsersPopup = (role) => {
	              const assignedMembers = assignedMembersForRole(role.id);
	              return React.createElement(PlatformPopupSurface, {
	                  className: "playground-team-role-assigned-popup",
	                  onMouseDown: (event) => event.stopPropagation(),
	                },
	                React.createElement("div", { className: "playground-team-role-assigned-popup-title" }, role.label + " users"),
	                assignedMembers.length
	                  ? React.createElement("div", { className: "playground-team-role-assigned-list" },
	                      assignedMembers.map((member) => React.createElement("div", { key: member.id, className: "playground-team-role-assigned-row" },
	                        renderMemberIdentity(member),
	                        React.createElement("span", { className: "playground-team-role-assigned-status" }, member.status || "active")
	                      ))
	                    )
	                  : React.createElement("div", { className: "playground-team-role-assigned-empty" }, "No users assigned to this role.")
	              );
	            };
	            const renderAssignedUsersButton = (role) => {
	              const assignedCount = assignedMembersForRole(role.id).length;
	              const isOpen = organizationPageRoleMembersPopover === role.id;
	              return React.createElement("div", { className: "playground-team-role-assigned-shell" },
	                React.createElement("button", {
	                  type: "button",
	                  className: "playground-team-badge playground-team-role-assigned-button" + (isOpen ? " is-open" : ""),
	                  onClick: () => setOrganizationPageRoleMembersPopover((current) => current === role.id ? "" : role.id),
	                  "aria-haspopup": "dialog",
	                  "aria-expanded": isOpen ? "true" : "false",
	                }, assignedCount + " assigned"),
	                isOpen ? renderAssignedUsersPopup(role) : null
	              );
	            };
	            return React.createElement("div", { className: "playground-team-detail-panel playground-team-roles-panel" },
	              React.createElement(PlatformRolePermissionsPage, {
	                roles: visibleRoleDefinitions.map((role) => ({
	                  id: role.id,
	                  label: role.label,
	                  description: role.description,
	                  meta: assignedMembersForRole(role.id).length + " assigned",
	                })),
	                value: selectedRoleDefinition.id,
	                onValueChange: (roleId) => {
	                  setOrganizationPageSelectedRoleId(roleId);
	                  setOrganizationPageRoleMembersPopover("");
	                },
	                roleAriaLabel: "Organization roles",
	                roleHeaderAction: renderAssignedUsersButton(selectedRoleDefinition),
	                readOnly: isSelectedOwnerRole || !canManageOrganization,
	                permissionSet: selectedRolePermissionSet,
	                accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
	                ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
	                actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
	                subjectType: "organization_role",
	                animationKey: organizationPermissionChartAnimationKey,
	                disabled: organizationPageActionId === selectedRoleActionId,
	                onRingAccessChange: (ringId, access) => updateOrganizationRolePermissionRingAccess(selectedRoleDefinition.id, ringId, access),
	                onActionRingChange: (actionId, ringId) => updateOrganizationRolePermissionActionRing(selectedRoleDefinition.id, actionId, ringId),
	                onActionAccessChange: (actionId, access) => updateOrganizationRolePermissionActionAccess(selectedRoleDefinition.id, actionId, access),
	              })
	            );
	          };

          return React.createElement("div", {
              className: "playground-team-page" + (selectedOrganization ? "" : " is-organization-overview-page"),
              ref: organizationPageRef,
            },
            React.createElement("div", { className: "playground-team-shell" },
              selectedOrganization
                ? React.createElement(React.Fragment, null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-resource-detail-back-button playground-team-back-button",
                      onClick: () => {
                        setOrganizationPageSelectedOrganizationId("");
                        setOrganizationPageMembers([]);
                        setOrganizationPageInvitations([]);
                        setOrganizationPageResources([]);
	                        setOrganizationPagePendingDestination(null);
                      },
                    }, React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }), "Organizations"),
                    React.createElement("div", { className: "playground-team-detail-header" },
                      React.createElement("h1", { className: "playground-team-detail-title" }, selectedOrganization.name || "Organization"),
                      React.createElement("div", { className: "playground-team-detail-actions" },
                        canManageOrganization
                          ? renderOrganizationActionButton("Edit", () => {
                              setOrganizationPageRenameName(selectedOrganization.name || "");
                              setOrganizationPageRenameModalOpen(true);
                            }, { icon: React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8 }) })
                          : null
                      )
                    ),
                    React.createElement("div", { className: "playground-agents-overview-tabs playground-project-overview-tabs playground-develop-tabs playground-develop-server-kind-tabs playground-team-detail-tabs" },
                      React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                        [
                          { id: "members", label: "Organization members" },
                          { id: "resources", label: "Resources" },
                          { id: "roles", label: "Roles" },
                          { id: "billing", label: "Billing" },
	                          { id: "usage", label: "Usage" },
                        ].map((tab) => React.createElement("button", {
                            key: tab.id,
                            type: "button",
                            className: "playground-project-overview-chart-tab playground-develop-tab" + (organizationPageActiveTab === tab.id ? " is-active" : ""),
                            "aria-pressed": organizationPageActiveTab === tab.id ? "true" : "false",
                            onClick: () => setOrganizationPageActiveTab(tab.id),
                          }, tab.label)
                        )
                      )
                    ),
                    organizationPageError ? React.createElement("div", { className: "playground-team-error" }, organizationPageError) : null,
                    organizationPageActiveTab === "resources"
                      ? renderOrganizationResources()
                      : organizationPageActiveTab === "roles"
                        ? renderOrganizationRoles()
	                      : organizationPageActiveTab === "usage"
	                        ? renderOrganizationUsageSection()
                        : organizationPageActiveTab === "billing"
                          ? renderOrganizationBillingSection()
                          : renderMembers(),
                    renderOrganizationRenameModal(),
                    renderOrganizationInviteModal()
                  )
                : renderOverview()
            )
          );
        }
`;
