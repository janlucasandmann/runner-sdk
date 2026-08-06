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
                  className: "playground-team-role-assigned-button" + (isOpen ? " is-open" : ""),
                  onClick: () => setTeamPageRoleMembersPopover((current) => current === role.id ? "" : role.id),
                  "aria-haspopup": "dialog",
                  "aria-expanded": isOpen ? "true" : "false",
                }, React.createElement(PlatformLabel, {
                  variant: "gray",
                  className: "playground-team-role-assigned-label",
                }, assignedCount + " assigned")),
                isOpen ? renderAssignedUsersPopup(role) : null
              );
            };
            return React.createElement("div", { className: "playground-team-detail-panel playground-team-roles-panel" },
              React.createElement(PlatformRolePermissionsPage, {
                roles: visibleRoleDefinitions.map((role) => ({
                  id: role.id,
                  label: role.label,
                  description: role.description,
                  meta: React.createElement(PlatformLabel, {
                    variant: "gray",
                    className: "playground-team-role-assigned-label",
                  }, getRoleRowCount(role.id) + " assigned"),
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

          const normalizedTeamDetailTab = teamPageActiveTab === "permissions"
            ? "roles"
            : ["members", "resources", "roles"].includes(teamPageActiveTab)
              ? teamPageActiveTab
              : "members";
          const teamDetailName = String(selectedTeam?.name || "Team").trim() || "Team";
          const teamDetailProfileImageUrl = getTeamPageProfileImageUrl(selectedTeam);
          const teamDetailMemberCount = visibleTeamMembers.length;
          const selectedTeamCreatorUserId = String(
            selectedTeam?.createdByUserId
            || selectedTeam?.created_by_user_id
            || selectedTeam?.creatorUserId
            || selectedTeam?.creator_user_id
            || selectedTeam?.createdBy?.userId
            || selectedTeam?.createdBy?.id
            || selectedTeam?.creator?.userId
            || selectedTeam?.creator?.id
            || ""
          ).trim();
          const selectedTeamCreatorEmail = String(
            selectedTeam?.createdByEmail
            || selectedTeam?.created_by_email
            || selectedTeam?.creatorEmail
            || selectedTeam?.creator_email
            || selectedTeam?.createdBy?.email
            || selectedTeam?.creator?.email
            || ""
          ).trim().toLowerCase();
          const selectedTeamCreatorRow = memberRows.find((row) => {
            if (row?.kind !== "member") {
              return false;
            }
            const memberUserId = getTeamMemberUserId(row.item);
            const memberEmail = getTeamMemberEmail(row.item);
            return Boolean(
              (selectedTeamCreatorUserId && memberUserId && selectedTeamCreatorUserId === memberUserId)
              || (selectedTeamCreatorEmail && memberEmail && selectedTeamCreatorEmail === memberEmail)
            );
          }) || null;
          const selectedTeamCreatorIsCurrentUser = Boolean(
            (selectedTeamCreatorUserId && selectedTeamCreatorUserId === String(sessionState.userId || "").trim())
            || (selectedTeamCreatorEmail && selectedTeamCreatorEmail === String(accountEmail || sessionState.email || "").trim().toLowerCase())
          );
          const selectedTeamCreatorLabel = String(
            selectedTeam?.createdByName
            || selectedTeam?.created_by_name
            || selectedTeam?.creatorName
            || selectedTeam?.creator_name
            || selectedTeam?.createdBy?.name
            || selectedTeam?.createdBy?.displayName
            || selectedTeam?.creator?.name
            || selectedTeam?.creator?.displayName
            || (selectedTeamCreatorRow ? getTeamMemberRowDisplayName(selectedTeamCreatorRow) : "")
            || (selectedTeamCreatorIsCurrentUser ? getTrustedDisplayName(accountName, accountEmail) : "")
            || selectedTeamCreatorEmail
            || "Unknown"
          ).trim() || "Unknown";
          const rawSelectedTeamCreatorAvatarUrl = String(
            selectedTeam?.createdByAvatarUrl
            || selectedTeam?.createdByPhotoUrl
            || selectedTeam?.createdByPhotoURL
            || selectedTeam?.creatorAvatarUrl
            || selectedTeam?.creatorPhotoUrl
            || selectedTeam?.creatorPhotoURL
            || selectedTeam?.createdBy?.avatarUrl
            || selectedTeam?.createdBy?.photoUrl
            || selectedTeam?.createdBy?.photoURL
            || selectedTeam?.creator?.avatarUrl
            || selectedTeam?.creator?.photoUrl
            || selectedTeam?.creator?.photoURL
            || (selectedTeamCreatorRow ? getTeamMemberAvatarUrl(selectedTeamCreatorRow.item, false) : "")
            || (selectedTeamCreatorIsCurrentUser ? accountAvatarUrl : "")
            || ""
          ).trim();
          const normalizedSelectedTeamCreatorAvatarUrl = normalizeSessionPhotoUrl(rawSelectedTeamCreatorAvatarUrl);
          const selectedTeamCreatorAvatarUrl = canRenderAvatarImage(normalizedSelectedTeamCreatorAvatarUrl)
            ? normalizedSelectedTeamCreatorAvatarUrl
            : "";
          const currentUserIsTeamOwner = currentMemberRoleId === "owner"
            || Boolean(currentMember && isTeamOwnerMember(currentMember, false));
          const teamOwnerCandidateRows = memberRows.filter((row) => {
            if (row?.kind !== "member") {
              return false;
            }
            const status = String(row?.item?.status || "active").trim().toLowerCase();
            return status === "active"
              && Boolean(getTeamMemberUserId(row.item) || getTeamMemberEmail(row.item));
          });
          const selectedTeamOwnerRow = teamOwnerCandidateRows.find((row) => isTeamOwnerMember(row.item, false)) || null;
          const selectedTeamOwnerMemberId = getTeamMemberActionId(selectedTeamOwnerRow)
            || (selectedTeamOwnerUserId ? "owner:" + selectedTeamOwnerUserId : "current-owner");
          const teamOwnerTransferPending = String(teamPageActionId || "").startsWith("team-owner:");
          const teamOwnerOptions = teamOwnerCandidateRows.map((row) => {
            const memberId = getTeamMemberActionId(row);
            const memberLabel = getTeamMemberRowDisplayName(row);
            const memberDetail = getTeamMemberRowDetail(row);
            return {
              value: memberId,
              label: memberLabel,
              description: memberDetail || undefined,
              ariaLabel: memberDetail ? memberLabel + ", " + memberDetail : memberLabel,
              leading: React.createElement(AccountAvatar, {
                className: "playground-team-detail-owner-option-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(memberLabel),
                photoUrl: getTeamMemberAvatarUrl(row.item, false),
              }),
              memberRow: row,
            };
          }).filter((option) => option.value);
          if (!teamOwnerOptions.some((option) => option.value === selectedTeamOwnerMemberId)) {
            teamOwnerOptions.unshift({
              value: selectedTeamOwnerMemberId,
              label: selectedTeamOwnerLabel || "Owner",
              leading: React.createElement(AccountAvatar, {
                className: "playground-team-detail-owner-option-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(selectedTeamOwnerLabel || "Owner"),
                photoUrl: selectedTeamOwnerAvatarUrl,
              }),
              disabled: true,
              memberRow: null,
            });
          }
          const teamOwnerSelector = React.createElement(PlatformSelector, {
            value: selectedTeamOwnerMemberId,
            options: teamOwnerOptions,
            onValueChange: (nextValue) => {
              if (nextValue === selectedTeamOwnerMemberId) {
                return;
              }
              const selectedOption = teamOwnerOptions.find((option) => option.value === nextValue);
              const selectedRow = selectedOption?.memberRow || null;
              const memberId = getTeamMemberActionId(selectedRow);
              if (!selectedRow || !memberId) {
                return;
              }
              void handleTransferTeamOwnership(memberId, getTeamMemberRowDisplayName(selectedRow));
            },
            ariaLabel: "Choose team owner",
            label: React.createElement("span", { className: "playground-team-member-cell playground-team-detail-owner" },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar playground-team-detail-owner-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(selectedTeamOwnerLabel || "Owner"),
                photoUrl: selectedTeamOwnerAvatarUrl,
              }),
              React.createElement("span", { className: "playground-team-table-title" }, selectedTeamOwnerLabel || "Owner")
            ),
            alignment: "end",
            popupAlignment: "right",
            fullWidth: true,
            disabled: !currentUserIsTeamOwner || teamOwnerTransferPending,
            loading: teamOwnerTransferPending,
            loadingContent: "Transferring ownership...",
            emptyContent: "No active team members are available.",
            popupWidth: 260,
            popupMaxHeight: "min(320px, calc(100vh - 180px))",
            className: "playground-team-detail-owner-selector",
            triggerClassName: "playground-team-detail-owner-trigger",
            popupClassName: "playground-agents-detail-owner-menu playground-team-detail-owner-popup",
            optionClassName: "playground-agents-detail-owner-option playground-team-detail-owner-option",
          });
          const teamCreatorValue = React.createElement("span", {
              className: "playground-team-member-cell playground-team-detail-creator",
            },
            React.createElement(AccountAvatar, {
              className: "playground-team-member-avatar playground-team-detail-creator-avatar",
              imageClassName: "playground-team-member-avatar-image",
              fallbackLabel: getAccountInitials(selectedTeamCreatorLabel),
              photoUrl: selectedTeamCreatorAvatarUrl,
            }),
            React.createElement("span", { className: "playground-team-table-title" }, selectedTeamCreatorLabel)
          );
          const renderTeamSidebarFact = (label, value, options = {}) => React.createElement("div", {
              className: "playground-team-detail-sidebar-fact" + (options.isOwner ? " is-owner" : ""),
            },
            React.createElement("span", { className: "playground-team-detail-sidebar-fact-label" }, label),
            React.createElement("span", {
              className: "playground-team-detail-sidebar-fact-value",
              title: options.title || (typeof value === "string" ? value : ""),
            }, value)
          );
          const teamDetailHeader = selectedTeam
            ? React.createElement("div", { className: "playground-agents-profile-section playground-team-detail-profile-section" },
                React.createElement(PlatformProfileImagePicker, {
                  value: teamDetailProfileImageUrl,
                  fallback: getPlatformProfileImageInitials(teamDetailName, "T"),
                  editable: canManageTeam,
                  busy: teamPageActionId === "team-profile-image",
                  ariaLabel: "Choose team profile picture",
                  className: "profile-editor-avatar playground-agents-profile-avatar playground-team-detail-profile-image-picker",
                  onChange: (url) => void handleTeamProfileImageSelection(url),
                }),
                React.createElement("div", { className: "playground-agents-profile-copy" },
                  React.createElement("div", { className: "playground-agents-profile-name-wrap" },
                    React.createElement("h1", {
                      className: "playground-content-title playground-team-detail-title",
                    }, teamDetailName),
                    React.createElement("span", {
                      className: "playground-team-detail-role-label",
                    }, formatRole(currentMemberRoleId))
                  )
                )
              )
            : null;
          const teamDetailAddResourceAction = canManageTeam
            ? React.createElement(PlatformButtonSelector, {
                mode: "popup",
                buttonVariant: "primary",
                buttonSize: "small",
                label: "Add Resource",
                leading: React.createElement(Plus, {
                  width: 14,
                  height: 14,
                  strokeWidth: 1.8,
                  "aria-hidden": "true",
                }),
                closeOnSelect: true,
                popupAriaLabel: "Add team resource",
                popupAlignment: "right",
                popupRole: "menu",
                popupVariant: "minimal",
                popupWidth: 230,
                className: "playground-team-detail-add-resource-selector",
              },
              resourceTypeOptions.map((typeOption) => {
                const typeMeta = getTeamResourceTypeMeta(typeOption.value);
                const TypeIcon = typeMeta?.Icon || Layers;
                return React.createElement("button", {
                    key: typeOption.value,
                    type: "button",
                    role: "menuitem",
                    className: "tb-popup-row",
                    onClick: () => openTeamShareResourceModal(typeOption.value),
                  },
                  React.createElement(TypeIcon, {
                    className: "tb-popup-icon",
                    width: 14,
                    height: 14,
                    strokeWidth: 1.8,
                    "aria-hidden": "true",
                  }),
                  React.createElement("span", null, typeOption.label)
                );
              })
            )
            : null;
          const teamDetailSidebarToggle = ["resources", "roles"].includes(normalizedTeamDetailTab)
            ? null
            : React.createElement("button", {
              type: "button",
              className: "playground-project-overview-sidebar-toggle",
              onClick: () => setTeamPageDetailSidebarCollapsed((current) => !current),
              title: teamPageDetailSidebarCollapsed ? "Show team sidebar" : "Hide team sidebar",
              "aria-label": teamPageDetailSidebarCollapsed ? "Show team sidebar" : "Hide team sidebar",
              "aria-pressed": teamPageDetailSidebarCollapsed ? "true" : "false",
            },
            React.createElement(PanelRight, { width: 15, height: 15, strokeWidth: 1.8 })
          );
          const teamDetailAppHeaderActions = React.createElement(React.Fragment, null,
            teamDetailAddResourceAction,
            teamDetailSidebarToggle
          );
          const teamDetailSidebar = selectedTeam
            ? React.createElement(PlatformUiCard, {
                    variant: "sidebar",
                    cardTitle: "Details",
                    className: "playground-team-detail-sidebar-card",
                  },
                  React.createElement("div", { className: "playground-team-detail-sidebar-facts" },
                    renderTeamSidebarFact("Team ID", selectedTeam.id || "-"),
                    renderTeamSidebarFact("Members", String(teamDetailMemberCount)),
                    renderTeamSidebarFact("Created", selectedTeam.createdAt ? formatDate(selectedTeam.createdAt) : "-"),
                    renderTeamSidebarFact("Creator", teamCreatorValue, { title: selectedTeamCreatorLabel }),
                    React.createElement("div", { className: "playground-team-detail-sidebar-fact playground-team-detail-sidebar-owner-row" },
                      React.createElement("span", { className: "playground-team-detail-sidebar-fact-label" }, "Owner"),
                      React.createElement("div", { className: "playground-team-detail-sidebar-owner-cell" }, teamOwnerSelector)
                    ),
                    React.createElement(PlatformPrimaryButton, {
                      type: "button",
                      size: "small",
                      fullWidth: true,
                      className: "playground-team-detail-invite-button",
                      onClick: () => setTeamPageInviteModalOpen(true),
                      disabled: !canManageTeam,
                    }, "Invite Member")
                  )
                )
            : null;
          const teamDetailContent = normalizedTeamDetailTab === "resources"
            ? renderResourcesTab()
            : normalizedTeamDetailTab === "roles"
              ? renderRolesTab()
              : renderMembersTab();

          return React.createElement("div", { className: "playground-team-page" + (selectedTeam ? "" : " is-team-overview-page"), ref: teamPageRef },
            React.createElement("div", {
              className: "playground-team-shell" + (selectedTeam
                ? " playground-agents-detail-content is-agent-overview-general playground-team-detail-content"
                : ""),
            },
              selectedTeam
                ? React.createElement(React.Fragment, null,
                    React.createElement(TeamDetailPage, {
                        header: teamDetailHeader,
                        appHeaderActions: teamDetailAppHeaderActions,
                        appHeaderActionsPortalId: "playground-team-detail-controls",
                        sidebar: teamDetailSidebar,
                        activeTab: normalizedTeamDetailTab,
                        sidebarCollapsed: teamPageDetailSidebarCollapsed,
                      },
                      teamPageError
                        ? React.createElement("div", { className: "playground-team-error" }, teamPageError)
                        : null,
                      teamDetailContent
                    ),
                    renderRenameTeamModal(),
                    renderInviteTeamModal(),
                    renderShareResourceModal()
                  )
                : renderTeamOverview()
            )
          );
        }
`;
