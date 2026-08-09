export const ORGANIZATIONS_PAGE_MEMBERS_SCRIPT = `          const renderInvitationIdentity = (invitation) => {
            const email = String(invitation?.email || invitation?.emailNormalized || invitation?.email_normalized || "").trim();
            return React.createElement("div", { className: "playground-team-member-cell" },
              renderAccountAvatar(
                "playground-team-member-avatar",
                "playground-team-member-avatar-image",
                getAccountInitials(email || "Invite"),
                ""
              ),
              React.createElement("div", { className: "playground-team-member-copy" },
                React.createElement("div", { className: "playground-team-table-title" }, email || "Pending invitation"),
                React.createElement("div", { className: "playground-team-table-meta" }, "Invitation pending")
              )
            );
          };

          const renderMembers = () => {
            const memberRows = (Array.isArray(organizationPageMembers) ? organizationPageMembers : [])
              .map((member) => ({ kind: "member", id: String(member?.id || member?.userId || member?.user_id || ""), item: member }))
              .filter((row) => row.id);
            const invitationRows = (Array.isArray(organizationPageInvitations) ? organizationPageInvitations : [])
              .filter((invitation) => String(invitation?.status || "").toLowerCase() === "pending")
              .map((invitation) => ({ kind: "invitation", id: String(invitation?.id || ""), item: invitation }))
              .filter((row) => row.id);
            const getOrganizationMemberDisplayName = (row) => row?.kind === "invitation"
              ? String(row?.item?.email || row?.item?.emailNormalized || row?.item?.email_normalized || "Pending invitation").trim()
              : getMemberDisplayName(row?.item || {});
            const getOrganizationMemberDetail = (row) => {
              if (row?.kind === "invitation") return "Invitation pending";
              const member = row?.item || {};
              const email = readTeamPageIdentityEmail(member);
              const displayName = getOrganizationMemberDisplayName(row);
              return email && displayName.toLowerCase() !== email.toLowerCase() ? email : "";
            };
            const getOrganizationMemberRoleLabel = (row) => formatRole(row?.item?.role);
            const getOrganizationMemberStatusLabel = (row) => row?.kind === "invitation"
              ? "pending"
              : String(row?.item?.status || "active").trim().toLowerCase();
            const activeMemberRows = memberRows.filter((row) => getOrganizationMemberStatusLabel(row) === "active");
            const activeMemberMode = organizationMemberFilter === "pending" ? "pending" : "active";
            const rowsForActiveMode = activeMemberMode === "pending" ? invitationRows : activeMemberRows;
            const normalizedOrganizationMemberSortDirection = organizationMemberSortDirection === "desc" ? "desc" : "asc";
            const normalizedOrganizationMemberSearchQuery = String(organizationMemberSearchQuery || "").trim().toLowerCase();
            const organizationWorkspaceName = selectedOrganization
              ? getOrganizationPageDisplayName(selectedOrganization)
              : "Organization workspace";
            const getOrganizationMemberSortValue = (row, sortKey) => {
              if (sortKey === "role") return getOrganizationMemberRoleLabel(row);
              if (sortKey === "workspace") return organizationWorkspaceName;
              return getOrganizationMemberDisplayName(row);
            };
            const compareOrganizationMemberSortValues = (left, right, sortKey) => {
              const textComparison = String(getOrganizationMemberSortValue(left, sortKey) || "").localeCompare(
                String(getOrganizationMemberSortValue(right, sortKey) || ""),
                undefined,
                { numeric: true, sensitivity: "base" }
              );
              if (textComparison !== 0) return textComparison;
              return getOrganizationMemberDisplayName(left).localeCompare(
                getOrganizationMemberDisplayName(right),
                undefined,
                { numeric: true, sensitivity: "base" }
              );
            };
            const visibleOrganizationMemberRows = rowsForActiveMode
              .filter((row) => {
                if (!normalizedOrganizationMemberSearchQuery) return true;
                return [
                  getOrganizationMemberDisplayName(row),
                  getOrganizationMemberDetail(row),
                  getOrganizationMemberRoleLabel(row),
                  organizationWorkspaceName,
                  row?.id || "",
                ].join(" ").toLowerCase().includes(normalizedOrganizationMemberSearchQuery);
              })
              .slice()
              .sort((left, right) => {
                const comparison = compareOrganizationMemberSortValues(left, right, organizationMemberSort);
                return normalizedOrganizationMemberSortDirection === "desc" ? -comparison : comparison;
              });
            const getOrganizationMemberSelectionId = (row) => String(row?.kind || "member") + ":" + String(row?.id || "");
            const renderMemberTabLabel = (label, count) => React.createElement("span", {
                className: "playground-organization-members-tab-label",
              },
              React.createElement("span", null, label),
              React.createElement("span", { className: "playground-organization-members-tab-count" }, String(count))
            );
            const organizationMemberColumns = [
              {
                id: "user",
                header: "User",
                accessor: getOrganizationMemberDisplayName,
                sortable: true,
                width: "minmax(260px, 1.35fr)",
                cell: ({ row }) => row.kind === "invitation" ? renderInvitationIdentity(row.item || {}) : renderMemberIdentity(row.item || {}),
              },
              {
                id: "role",
                header: "Role",
                accessor: getOrganizationMemberRoleLabel,
                sortable: true,
                width: "minmax(150px, 0.62fr)",
                cell: ({ row }) => {
                  const isInvitation = row.kind === "invitation";
                  const item = row.item || {};
                  const displayName = getOrganizationMemberDisplayName(row);
                  const isOwner = !isInvitation && (
                    normalizeOrganizationRoleId(item.role, "member") === "owner"
                    || String(item.userId || item.user_id || "").trim() === String(selectedOrganization?.ownerUserId || "").trim()
                  );
                  return !isInvitation && canManageOrganization && !isOwner
                    ? React.createElement(PlatformSelector, {
                        className: "playground-organization-member-role-selector",
                        value: normalizeOrganizationRoleId(item.role, "member"),
                        options: organizationRoleOptions.map((role) => ({ value: role.id, label: role.label, description: role.description })),
                        onValueChange: (nextRole) => handleUpdateOrganizationMemberRole(item.id, nextRole),
                        ariaLabel: "Role for " + displayName,
                        popupAlignment: "left",
                        popupWidth: 230,
                        disabled: organizationPageActionId === "organization-member-role:" + item.id,
                      })
                    : React.createElement("span", {
                        className: "playground-team-badge playground-team-role-label playground-organization-member-role-label",
                      }, getOrganizationMemberRoleLabel(row));
                },
              },
              {
                id: "workspace",
                header: "Workspaces",
                accessor: () => organizationWorkspaceName,
                sortable: true,
                width: "minmax(170px, 0.72fr)",
                hideBelow: 720,
                cell: () => React.createElement(PlatformLabel, {
                  variant: "gray",
                  className: "playground-organization-member-workspace-label",
                }, organizationWorkspaceName),
              },
            ];
            const getOrganizationMemberActions = (row) => {
              if (!canManageOrganization) return [];
              const isInvitation = row?.kind === "invitation";
              const item = row?.item || {};
              const isOwner = !isInvitation && (
                normalizeOrganizationRoleId(item.role, "member") === "owner"
                || String(item.userId || item.user_id || "").trim() === String(selectedOrganization?.ownerUserId || "").trim()
              );
              if (isOwner) return [];
              const actionId = isInvitation ? "revoke-organization-invite:" + row.id : "organization-member-remove:" + row.id;
              return [{
                id: "remove",
                label: organizationPageActionId === actionId ? (isInvitation ? "Revoking..." : "Removing...") : (isInvitation ? "Revoke invitation" : "Remove member"),
                icon: Trash2,
                danger: true,
                disabled: organizationPageActionId === actionId,
                onSelect: () => isInvitation ? handleRevokeOrganizationInvitation(row.id) : handleRemoveOrganizationMember(row.id),
              }];
            };
            const organizationMembersEmptyState = React.createElement(PlatformEmptyState, {
              icon: activeMemberMode === "pending" ? Mail : UsersRound,
              title: normalizedOrganizationMemberSearchQuery
                ? "No matching users"
                : (activeMemberMode === "pending" ? "No pending invitations" : "No organization members yet"),
              description: normalizedOrganizationMemberSearchQuery
                ? "Try a different name or email address."
                : (activeMemberMode === "pending"
                    ? "Invitations awaiting acceptance will appear here."
                    : "Invite people to work in this organization."),
            });
            const organizationMembersDataTable = React.createElement(PlatformDataTable, {
              rows: visibleOrganizationMemberRows,
              columns: organizationMemberColumns,
              getRowId: getOrganizationMemberSelectionId,
              ariaLabel: activeMemberMode === "pending" ? "Invited organization users" : "Active organization users",
              className: "playground-organization-members-platform-data-table",
              surface: "plain",
              variant: "minimalistic-ui",
              sorting: {
                value: { id: organizationMemberSort, direction: normalizedOrganizationMemberSortDirection },
                manual: true,
                onChange: (nextSorting) => {
                  if (!nextSorting) return;
                  setOrganizationMemberSort(nextSorting.id);
                  setOrganizationMemberSortDirection(nextSorting.direction);
                },
              },
              selection: {
                enabled: true,
                value: selectedOrganizationMemberIds,
                onChange: ({ selectedIds }) => setSelectedOrganizationMemberIds(new Set(selectedIds)),
                ariaLabel: (row) => "Select " + getOrganizationMemberDisplayName(row),
              },
              pagination: {
                defaultValue: { pageIndex: 0, pageSize: 20 },
                pageSizeOptions: [10, 20, 50],
              },
              getRowActions: getOrganizationMemberActions,
              getRowAriaLabel: getOrganizationMemberDisplayName,
              loading: organizationPageLoading && memberRows.length === 0 && invitationRows.length === 0,
              emptyState: organizationMembersEmptyState,
              noResultsState: organizationMembersEmptyState,
            });

            return React.createElement("section", { className: "playground-organization-members-card" },
              React.createElement("header", { className: "playground-organization-members-header" },
                React.createElement("div", { className: "playground-organization-members-heading" },
                  React.createElement("h1", { className: "playground-organization-members-title" }, "Organization Members"),
                  React.createElement("p", { className: "playground-organization-members-description" }, "Manage your organization members, roles, and subscriptions.")
                ),
                canInviteOrganization
                  ? React.createElement(PlatformPrimaryButton, {
                      type: "button",
                      className: "playground-organization-members-invite-button",
                      onClick: () => setOrganizationPageInviteModalOpen(true),
                    }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }), "Invite Members")
                  : null
              ),
              React.createElement("div", { className: "playground-organization-members-tabs" },
                React.createElement(PlatformDetailTabBar, {
                  tabs: [
                    { id: "active", label: renderMemberTabLabel("Active Users", activeMemberRows.length) },
                    { id: "pending", label: renderMemberTabLabel("Invited Users", invitationRows.length) },
                  ],
                  value: activeMemberMode,
                  onValueChange: (nextMode) => {
                    setOrganizationMemberFilter(nextMode);
                    setSelectedOrganizationMemberIds(new Set());
                  },
                  ariaLabel: "Organization member status",
                  showDivider: true,
                  className: "playground-organization-members-tab-bar",
                })
              ),
              React.createElement("div", { className: "playground-organization-members-controls" },
                React.createElement(PlatformSearch, {
                  className: "playground-organization-members-search",
                  value: organizationMemberSearchQuery,
                  onChange: (event) => setOrganizationMemberSearchQuery(event.target.value),
                  placeholder: "Search by name or email address",
                  "aria-label": "Search organization users",
                })
              ),
              React.createElement("div", { className: "playground-organization-members-table" }, organizationMembersDataTable)
            );
          };
`;
