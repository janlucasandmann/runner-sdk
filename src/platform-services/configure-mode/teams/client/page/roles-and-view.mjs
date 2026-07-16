export const TEAMS_PAGE_ROLES_AND_VIEW_SCRIPT = `          const renderRolesTab = () => {
            const rolePermissionSets = normalizePlaygroundTeamRolePermissionSets(selectedTeam?.rolePermissionSets);
            const selectedRoleDefinition = getPlaygroundTeamRoleDefinition(selectedTeamRoleId);
            const selectedRolePermissionSet = normalizePlaygroundPermissionSet(rolePermissionSets[selectedRoleDefinition.id], "team_role");
            const selectedRoleActionId = "team-role-permissions:" + selectedRoleDefinition.id;
            const isSelectedOwnerRole = selectedRoleDefinition.id === "owner";
            const visibleRoleDefinitions = canManageTeam
              ? PLAYGROUND_TEAM_ROLE_DEFINITIONS
              : PLAYGROUND_TEAM_ROLE_DEFINITIONS.filter((role) => role.id === currentMemberRoleId || role.id === "owner");
            const getAssignedRowsForRole = (roleId) => memberRows.filter((row) =>
              roleId === "owner"
                ? row.kind === "member" && isTeamOwnerMember(row.item, false)
                : row.kind === "member"
                  && !isTeamOwnerMember(row.item, false)
                  && normalizePlaygroundTeamRoleId(row.item?.role, "member") === roleId
            );
            const getRoleRowCount = (roleId) => getAssignedRowsForRole(roleId).length;
            const renderAssignedUsersPopup = (role) => {
              const assignedRows = getAssignedRowsForRole(role.id);
              return React.createElement(PlatformPopupSurface, {
                  className: "playground-team-role-assigned-popup",
                  onMouseDown: (event) => event.stopPropagation(),
                },
                React.createElement("div", { className: "playground-team-role-assigned-popup-title" }, role.label + " users"),
                assignedRows.length > 0
                  ? React.createElement("div", { className: "playground-team-role-assigned-list" },
                      assignedRows.map((row) =>
                        React.createElement("div", { key: row.kind + ":" + row.id, className: "playground-team-role-assigned-row" },
                          renderTeamMemberIdentityCell(row.item, getTeamMemberRowDisplayName(row), getTeamMemberRowDetail(row), false),
                          React.createElement("span", { className: "playground-team-role-assigned-status" }, row.item?.status || "active")
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-team-role-assigned-empty" }, "No users assigned to this role.")
              );
            };
            const renderAssignedUsersButton = (role) => {
              const assignedCount = getRoleRowCount(role.id);
              const isOpen = teamPageRoleMembersPopover === role.id;
              return React.createElement("div", { className: "playground-team-role-assigned-shell" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-team-badge playground-team-role-assigned-button" + (isOpen ? " is-open" : ""),
                  onClick: () => setTeamPageRoleMembersPopover((current) => current === role.id ? "" : role.id),
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
                  meta: getRoleRowCount(role.id) + " assigned",
                })),
                value: selectedRoleDefinition.id,
                onValueChange: (roleId) => {
                  setTeamPageSelectedRoleId(roleId);
                  setTeamPageRoleMembersPopover("");
                },
                roleAriaLabel: "Team roles",
                roleHeaderAction: renderAssignedUsersButton(selectedRoleDefinition),
                readOnly: isSelectedOwnerRole || !canManageTeam,
                permissionSet: selectedRolePermissionSet,
                accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                subjectType: "team_role",
                animationKey: teamPermissionChartAnimationKey,
                disabled: teamPageActionId === selectedRoleActionId,
                onRingAccessChange: (ringId, access) => updateTeamRolePermissionRingAccess(selectedRoleDefinition.id, ringId, access),
                onActionRingChange: (actionId, ringId) => updateTeamRolePermissionActionRing(selectedRoleDefinition.id, actionId, ringId),
                onActionAccessChange: (actionId, access) => updateTeamRolePermissionActionAccess(selectedRoleDefinition.id, actionId, access),
              })
            );
          };

          return React.createElement("div", { className: "playground-team-page" + (selectedTeam ? "" : " is-team-overview-page"), ref: teamPageRef },
            React.createElement("div", { className: "playground-team-shell" },
              selectedTeam
                ? React.createElement(React.Fragment, null,
                    React.createElement("button", {
                      type: "button",
                      className: "playground-resource-detail-back-button playground-team-back-button",
                      onClick: () => {
                        setTeamPageSelectedTeamId("");
                        setTeamPageMembers([]);
                        setTeamPageInvitations([]);
                        setTeamPageShares([]);
                        setTeamPageResourceFilter("all");
                        setTeamPageResourceSearchQuery("");
                        setTeamPageResourceToolbarPopover("");
                        setTeamPageResourceMenuId("");
                      },
                    }, React.createElement(ArrowLeft, { width: 12, height: 12, strokeWidth: 1.8 }), "Teams"),
                    React.createElement("div", { className: "playground-team-detail-header" },
                      React.createElement("h1", { className: "playground-team-detail-title" }, selectedTeam.name || "Team"),
                      React.createElement("div", { className: "playground-team-detail-actions" },
                        canManageTeam
                          ? renderTeamActionButton("Edit", () => {
                              setTeamPageRenameName(selectedTeam.name || "");
                              setTeamPageRenameModalOpen(true);
                            }, { icon: React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8 }) })
                          : null,
                      )
                    ),
                    React.createElement("div", { className: "playground-agents-overview-tabs playground-project-overview-tabs playground-develop-tabs playground-develop-server-kind-tabs playground-team-detail-tabs" },
                      React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                        [
                          { id: "members", label: "Team members" },
                          { id: "resources", label: "Resources" },
                          { id: "roles", label: "Roles" },
                        ].map((tab) =>
                          React.createElement("button", {
                            key: tab.id,
                            type: "button",
                            className: "playground-project-overview-chart-tab playground-develop-tab" + (teamPageActiveTab === tab.id ? " is-active" : ""),
                            "aria-pressed": teamPageActiveTab === tab.id ? "true" : "false",
                            onClick: () => setTeamPageActiveTab(tab.id),
                          }, tab.label)
                        )
                      )
                    ),
                    teamPageError
                      ? React.createElement("div", { className: "playground-team-error" }, teamPageError)
                      : null,
                    teamPageActiveTab === "resources"
                      ? renderResourcesTab()
                      : teamPageActiveTab === "roles" || teamPageActiveTab === "permissions"
                        ? renderRolesTab()
                        : renderMembersTab()
                    ,
                    renderRenameTeamModal(),
                    renderInviteTeamModal(),
                    renderShareResourceModal()
                  )
                : renderTeamOverview()
            )
          );
        }
`;
