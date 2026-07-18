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
	              .map((member) => ({ kind: "member", id: String(member?.id || member?.userId || member?.user_id || ""), item: member }));
	            const invitationRows = (Array.isArray(organizationPageInvitations) ? organizationPageInvitations : [])
	              .filter((invitation) => String(invitation?.status || "").toLowerCase() === "pending")
	              .map((invitation) => ({ kind: "invitation", id: String(invitation?.id || ""), item: invitation }));
	            const rows = [...memberRows, ...invitationRows].filter((row) => row.id);
	            const normalizedOrganizationMemberSortDirection = organizationMemberSortDirection === "desc" ? "desc" : "asc";
	            const getOrganizationMemberDisplayName = (row) => row?.kind === "invitation"
	              ? String(row?.item?.email || row?.item?.emailNormalized || row?.item?.email_normalized || "Pending invitation").trim()
	              : getMemberDisplayName(row?.item || {});
	            const getOrganizationMemberDetail = (row) => {
	              if (row?.kind === "invitation") {
	                return "Invitation pending";
	              }
	              const member = row?.item || {};
	              const email = readTeamPageIdentityEmail(member);
	              const displayName = getOrganizationMemberDisplayName(row);
	              return email && displayName.toLowerCase() !== email.toLowerCase() ? email : "";
	            };
	            const getOrganizationMemberRoleLabel = (row) => formatRole(row?.item?.role);
	            const getOrganizationMemberStatusLabel = (row) => row?.kind === "invitation" ? "pending" : (row?.item?.status || "active");
	            const getOrganizationMemberJoinedValue = (row) => row?.kind === "invitation"
	              ? (row?.item?.createdAt || row?.item?.created_at || "")
	              : (row?.item?.joinedAt || row?.item?.joined_at || row?.item?.createdAt || row?.item?.created_at || "");
	            const getOrganizationMemberJoinedLabel = (row) => formatDate(getOrganizationMemberJoinedValue(row)) || "-";
	            const getOrganizationMemberJoinedTimestamp = (row) => {
	              const timestamp = Date.parse(String(getOrganizationMemberJoinedValue(row) || ""));
	              return Number.isFinite(timestamp) ? timestamp : 0;
	            };
	            const getOrganizationMemberSortValue = (row, sortKey) => {
	              switch (sortKey) {
	                case "role":
	                  return getOrganizationMemberRoleLabel(row);
	                case "status":
	                  return getOrganizationMemberStatusLabel(row);
	                case "joined":
	                  return getOrganizationMemberJoinedTimestamp(row);
	                case "user":
	                default:
	                  return getOrganizationMemberDisplayName(row);
	              }
	            };
	            const compareOrganizationMemberSortValues = (left, right, sortKey) => {
	              const leftValue = getOrganizationMemberSortValue(left, sortKey);
	              const rightValue = getOrganizationMemberSortValue(right, sortKey);
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
	              return getOrganizationMemberDisplayName(left).localeCompare(getOrganizationMemberDisplayName(right), undefined, {
	                numeric: true,
	                sensitivity: "base",
	              });
	            };
	            const normalizedOrganizationMemberSearchQuery = String(organizationMemberSearchQuery || "").trim().toLowerCase();
	            const visibleOrganizationMemberRows = rows
	              .filter((row) => {
	                const normalizedStatus = String(getOrganizationMemberStatusLabel(row) || "").trim().toLowerCase();
	                if (organizationMemberFilter === "active" && (row?.kind === "invitation" || normalizedStatus !== "active")) {
	                  return false;
	                }
	                if (organizationMemberFilter === "pending" && row?.kind !== "invitation" && normalizedStatus !== "pending") {
	                  return false;
	                }
	                if (!normalizedOrganizationMemberSearchQuery) {
	                  return true;
	                }
	                const haystack = [
	                  getOrganizationMemberDisplayName(row),
	                  getOrganizationMemberDetail(row),
	                  getOrganizationMemberRoleLabel(row),
	                  getOrganizationMemberStatusLabel(row),
	                  row?.id || "",
	                ].join(" ").toLowerCase();
	                return haystack.includes(normalizedOrganizationMemberSearchQuery);
	              })
	              .slice()
	              .sort((left, right) => {
	                const baseComparison = compareOrganizationMemberSortValues(left, right, organizationMemberSort);
	                return normalizedOrganizationMemberSortDirection === "desc" ? -baseComparison : baseComparison;
	              });
	            const getOrganizationMemberSelectionId = (row) => String(row?.kind || "member") + ":" + String(row?.id || "");
	            const visibleOrganizationMemberSelectionIds = visibleOrganizationMemberRows
	              .map((row) => getOrganizationMemberSelectionId(row))
	              .filter(Boolean);
	            const selectedVisibleOrganizationMemberIds = visibleOrganizationMemberSelectionIds.filter((memberId) => selectedOrganizationMemberIds.has(memberId));
	            const allVisibleOrganizationMembersSelected = visibleOrganizationMemberSelectionIds.length > 0 && selectedVisibleOrganizationMemberIds.length === visibleOrganizationMemberSelectionIds.length;
	            const organizationMemberFilterOptions = [
	              { id: "all", label: "All Members", description: "Show members and pending invites" },
	              { id: "active", label: "Active Members", description: "Only show active organization members" },
	              { id: "pending", label: "Pending Invites", description: "Only show pending invitations" },
	            ];
		            const organizationMemberColumns = [
		              {
		                id: "user",
		                header: "User",
		                accessor: getOrganizationMemberDisplayName,
		                sortable: true,
		                width: "minmax(230px, 1.25fr)",
		                cell: ({ row }) => row.kind === "invitation" ? renderInvitationIdentity(row.item || {}) : renderMemberIdentity(row.item || {}),
		              },
		              {
		                id: "role",
		                header: "Role",
		                accessor: getOrganizationMemberRoleLabel,
		                sortable: true,
		                width: "minmax(130px, 0.7fr)",
		                cell: ({ row }) => {
		                  const isInvitation = row.kind === "invitation";
		                  const item = row.item || {};
		                  const displayName = getOrganizationMemberDisplayName(row);
		                  const isOwner = !isInvitation && (
		                    normalizeOrganizationRoleId(item.role, "member") === "owner"
		                    || String(item.userId || item.user_id || "").trim() === String(selectedOrganization?.ownerUserId || "").trim()
		                  );
		                  return !isInvitation && canManageOrganization && !isOwner
		                    ? renderOrganizationRoleSelect({
		                        variant: "member-row",
		                        value: item.role,
		                        onChange: (event) => handleUpdateOrganizationMemberRole(item.id, event.target.value),
		                        disabled: organizationPageActionId === "organization-member-role:" + item.id,
		                        "aria-label": "Role for " + displayName,
		                      })
		                    : React.createElement("span", { className: "playground-team-badge playground-team-role-label" }, getOrganizationMemberRoleLabel(row));
		                },
		              },
		              {
		                id: "status",
		                header: "Status",
		                accessor: getOrganizationMemberStatusLabel,
		                sortable: true,
		                width: "minmax(105px, 0.55fr)",
		                hideBelow: 720,
		                cell: ({ row }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getOrganizationMemberStatusLabel(row)),
		              },
		              {
		                id: "joined",
		                header: "Joined",
		                accessor: getOrganizationMemberJoinedTimestamp,
		                sortable: true,
		                sortDescFirst: true,
		                width: "minmax(120px, 0.6fr)",
		                align: "end",
		                hideBelow: 900,
		                cell: ({ row }) => React.createElement("div", { className: "playground-agents-overview-table-value is-right" }, getOrganizationMemberJoinedLabel(row)),
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
		                label: organizationPageActionId === actionId ? (isInvitation ? "Revoking..." : "Removing...") : (isInvitation ? "Revoke" : "Remove member"),
		                icon: Trash2,
		                danger: true,
		                disabled: organizationPageActionId === actionId,
		                onSelect: () => isInvitation ? handleRevokeOrganizationInvitation(row.id) : handleRemoveOrganizationMember(row.id),
		              }];
		            };
		            const organizationMembersDataTable = React.createElement(PlatformDataTable, {
		              rows: visibleOrganizationMemberRows,
		              columns: organizationMemberColumns,
		              getRowId: getOrganizationMemberSelectionId,
		              ariaLabel: "Organization members",
		              className: "playground-organization-members-platform-data-table",
		              surface: "plain",
		              sorting: {
		                value: { id: organizationMemberSort, direction: normalizedOrganizationMemberSortDirection },
		                manual: true,
		                onChange: (nextSorting) => {
		                  if (!nextSorting) return;
		                  setOrganizationMemberSort(nextSorting.id);
		                  setOrganizationMemberSortDirection(nextSorting.direction);
		                  setOrganizationMemberToolbarPopover("");
		                },
		              },
		              selection: {
		                enabled: true,
		                value: selectedOrganizationMemberIds,
		                onChange: ({ selectedIds }) => setSelectedOrganizationMemberIds(new Set(selectedIds)),
		                ariaLabel: (row) => "Select " + getOrganizationMemberDisplayName(row),
		              },
		              toolbar: {
		                search: { value: organizationMemberSearchQuery, onChange: setOrganizationMemberSearchQuery, placeholder: "Search members", manual: true },
		                showSort: true,
		                filters: [{ id: "status", label: "Status", value: organizationMemberFilter, options: organizationMemberFilterOptions, onChange: setOrganizationMemberFilter }],
		                primaryAction: canInviteOrganization ? { label: "Invite Member", icon: Plus, onClick: () => setOrganizationPageInviteModalOpen(true) } : undefined,
		              },
		              getRowActions: getOrganizationMemberActions,
		              loading: organizationPageLoading && rows.length === 0,
		              emptyState: normalizedOrganizationMemberSearchQuery || organizationMemberFilter !== "all" ? "No matching members found." : "No organization members yet.",
		            });
		            return React.createElement("div", { className: "playground-team-detail-panel" },
		              React.createElement("section", {
	                  className: "playground-plugins-section playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-overview-current-tasks-section playground-project-overview-work-list-section playground-project-overview-threads-section playground-agents-detail-threads-section playground-evaluations-runs-section playground-agents-overview-list-section playground-team-grid-table-section playground-team-members-table-section playground-organization-members-table-section",
	                },
		                organizationMembersDataTable
		              )
	            );
	          };
`;
