export const TEAMS_PAGE_MEMBERS_SCRIPT = `          const getTeamMemberUserId = (item) => {
            const source = item && typeof item === "object" && !Array.isArray(item) ? item : {};
            return String(
              source.userId
              || source.uid
              || source.user?.id
              || source.user?.uid
              || source.account?.id
              || source.member?.userId
              || source.member?.id
              || ""
            ).trim();
          };
          const getTeamMemberEmail = (item) => {
            const source = item && typeof item === "object" && !Array.isArray(item) ? item : {};
            return readTeamPageIdentityEmail(source);
          };
          const selectedTeamOwnerUserId = String(
            selectedTeam?.ownerUserId
            || selectedTeam?.ownerId
            || selectedTeam?.createdByUserId
            || selectedTeam?.owner?.userId
            || selectedTeam?.owner?.id
            || ""
          ).trim();
          const selectedTeamOwnerEmail = String(
            selectedTeam?.ownerEmail
            || selectedTeam?.owner?.email
            || ""
          ).trim().toLowerCase();
          const currentAccountEmail = String(accountEmail || sessionState.email || "").trim().toLowerCase();
          const isTeamInvitationAccepted = (invitation) => {
            const status = String(invitation?.status || "").trim().toLowerCase();
            return status === "accepted" || status === "joined" || status === "completed";
          };
          const isTeamOwnerMember = (item, isInvitation = false) => {
            if (isInvitation) {
              return false;
            }
            const memberUserId = getTeamMemberUserId(item);
            const memberEmail = getTeamMemberEmail(item);
            if (selectedTeamOwnerUserId && memberUserId && memberUserId === selectedTeamOwnerUserId) {
              return true;
            }
            if (selectedTeamOwnerEmail && memberEmail && memberEmail === selectedTeamOwnerEmail) {
              return true;
            }
            return !selectedTeamOwnerUserId
              && !selectedTeamOwnerEmail
              && memberUserId
              && memberUserId === String(sessionState.userId || "").trim()
              && ["admin", "owner"].includes(normalizePlaygroundTeamRoleId(selectedTeam?.role, "member"));
          };
          const isCurrentTeamMemberRow = (item, isInvitation = false) => {
            if (isInvitation) {
              return false;
            }
            const memberUserId = getTeamMemberUserId(item);
            const memberEmail = getTeamMemberEmail(item);
            return Boolean(
              (memberUserId && memberUserId === String(sessionState.userId || "").trim())
              || (memberEmail && currentAccountEmail && memberEmail === currentAccountEmail)
            );
          };
          const isRevokedTeamRow = (item) => {
            const status = String(item?.status || "").trim().toLowerCase();
            return status === "revoked";
          };
          const visibleTeamMembers = teamPageMembers.filter((member) => !isRevokedTeamRow(member));
          const visibleTeamInvitations = teamPageInvitations.filter((invitation) =>
            !isTeamInvitationAccepted(invitation) && !isRevokedTeamRow(invitation)
          );
          const memberRows = [
            ...visibleTeamMembers.map((member) => ({ kind: "member", id: member.id, item: member })),
            ...visibleTeamInvitations.map((invitation) => ({ kind: "invitation", id: invitation.id, item: invitation })),
          ];
          const getTeamMemberIdentitySources = (item) => {
            return getTeamPageIdentitySources(item);
          };
          const getTeamMemberRowDisplayName = (row) => {
            const item = row?.item || {};
            const email = getTeamMemberEmail(item);
            if (row?.kind !== "invitation" && isCurrentTeamMemberRow(item, false)) {
              const currentAccountName = getTrustedDisplayName(accountName, currentAccountEmail);
              if (currentAccountName) {
                return currentAccountName;
              }
            }
            const displayName = readTeamPageIdentityDisplayName(item);
            return getTrustedDisplayName(displayName, email)
              || email
              || (row?.kind === "invitation" ? "Invitation" : (getTeamMemberUserId(item) || "Team member"));
          };
          const getTeamMemberRowDetail = (row) => {
            const item = row?.item || {};
            const email = getTeamMemberEmail(item);
            const displayName = getTeamMemberRowDisplayName(row);
            return email && displayName.toLowerCase() !== email.toLowerCase() ? email : "";
          };
	          const getTeamMemberJoinedLabel = (row) => {
	            if (row?.kind === "invitation") {
	              return "-";
	            }
	            const item = row?.item || {};
            const joinedAt = getTeamMemberIdentitySources(item)
              .map((source) => (
                source.joinedAt
                || source.joined_at
                || source.acceptedAt
                || source.accepted_at
                || source.createdAt
                || source.created_at
              ))
	              .find((value) => String(value || "").trim());
	            return formatDate(joinedAt) || "-";
	          };
	          const getTeamMemberJoinedTimestamp = (row) => {
	            if (row?.kind === "invitation") {
	              return 0;
	            }
	            const item = row?.item || {};
	            const joinedAt = getTeamMemberIdentitySources(item)
	              .map((source) => (
	                source.joinedAt
	                || source.joined_at
	                || source.acceptedAt
	                || source.accepted_at
	                || source.createdAt
	                || source.created_at
	              ))
	              .find((value) => String(value || "").trim());
	            const timestamp = Date.parse(String(joinedAt || ""));
	            return Number.isFinite(timestamp) ? timestamp : 0;
	          };
	          const getTeamMemberRoleLabel = (row) => {
	            const item = row?.item || {};
	            return isTeamOwnerMember(item, row?.kind === "invitation")
	              ? "Owner"
	              : formatRole(item.role);
	          };
	          const getTeamMemberStatusLabel = (row) => {
	            const item = row?.item || {};
	            return row?.kind === "invitation"
	              ? (item.status || "pending")
	              : (item.status || "active");
	          };
	          const getTeamMemberSortValue = (row, sortKey) => {
	            switch (sortKey) {
	              case "role":
	                return getTeamMemberRoleLabel(row);
	              case "status":
	                return getTeamMemberStatusLabel(row);
	              case "joined":
	                return getTeamMemberJoinedTimestamp(row);
	              case "user":
	              default:
	                return getTeamMemberRowDisplayName(row);
	            }
	          };
	          const compareTeamMemberSortValues = (left, right, sortKey) => {
	            const leftValue = getTeamMemberSortValue(left, sortKey);
	            const rightValue = getTeamMemberSortValue(right, sortKey);
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
	            return getTeamMemberRowDisplayName(left).localeCompare(getTeamMemberRowDisplayName(right), undefined, {
	              numeric: true,
	              sensitivity: "base",
	            });
	          };
		          const normalizedTeamPageMemberSortDirection = teamPageMemberSortDirection === "desc" ? "desc" : "asc";
	          const normalizedTeamPageMemberSearchQuery = String(teamPageMemberSearchQuery || "").trim().toLowerCase();
	          const visibleTeamMemberRows = memberRows
	            .filter((row) => {
	              const normalizedStatus = String(getTeamMemberStatusLabel(row) || "").trim().toLowerCase();
	              if (teamPageMemberFilter === "active" && (row?.kind === "invitation" || normalizedStatus !== "active")) {
	                return false;
	              }
	              if (teamPageMemberFilter === "pending" && row?.kind !== "invitation" && normalizedStatus !== "pending") {
	                return false;
	              }
	              if (!normalizedTeamPageMemberSearchQuery) {
	                return true;
	              }
	              const haystack = [
	                getTeamMemberRowDisplayName(row),
	                getTeamMemberRowDetail(row),
	                getTeamMemberRoleLabel(row),
	                getTeamMemberStatusLabel(row),
	                row?.id || "",
	              ].join(" ").toLowerCase();
	              return haystack.includes(normalizedTeamPageMemberSearchQuery);
	            })
	            .slice()
	            .sort((left, right) => {
	              const baseComparison = compareTeamMemberSortValues(left, right, teamPageMemberSort);
	              return normalizedTeamPageMemberSortDirection === "desc" ? -baseComparison : baseComparison;
	            });
	          const getTeamMemberSelectionId = (row) => String(row?.kind || "member") + ":" + String(row?.id || row?.item?.id || "");
	          const visibleTeamMemberSelectionIds = visibleTeamMemberRows
	            .map((row) => getTeamMemberSelectionId(row))
	            .filter(Boolean);
	          const selectedVisibleTeamPageMemberIds = visibleTeamMemberSelectionIds.filter((memberId) => selectedTeamPageMemberIds.has(memberId));
	          const allVisibleTeamMembersSelected = visibleTeamMemberSelectionIds.length > 0 && selectedVisibleTeamPageMemberIds.length === visibleTeamMemberSelectionIds.length;
	          const getTeamMemberAvatarUrl = (item, isInvitation = false) => {
	            if (isInvitation) {
	              return "";
	            }
            const source = item && typeof item === "object" && !Array.isArray(item) ? item : {};
            const rawAvatarUrl = getTeamMemberIdentitySources(item)
              .map((value) => (
                value.photoURL
                || value.photoUrl
                || value.photo_url
                || value.avatarUrl
                || value.avatarURL
                || value.avatar
                || value.picture
                || value.imageUrl
                || value.profileImageUrl
                || value.profile_image_url
              ))
              .find((value) => String(value || "").trim());
            const fallbackAvatarUrl = String(source.userId || source.uid || source.id || "") === String(sessionState.userId || "")
              ? accountAvatarUrl
              : "";
            const normalizedAvatarUrl = normalizeSessionPhotoUrl(rawAvatarUrl || fallbackAvatarUrl || "");
            return canRenderAvatarImage(normalizedAvatarUrl) ? normalizedAvatarUrl : "";
          };
	          const getTeamMemberMenuId = (row) => "team-member:" + String(row?.kind || "member") + ":" + String(row?.id || row?.item?.id || "");
	          const getTeamMemberActionId = (row) => String(row?.item?.id || row?.id || "").trim();
	          const canRemoveTeamMemberRow = (row) => {
	            const item = row?.item || {};
	            const rowId = getTeamMemberActionId(row);
	            const isInvitation = row?.kind === "invitation";
	            const isProtectedMember = !isInvitation && (isTeamOwnerMember(item, false) || isCurrentTeamMemberRow(item, false));
	            return Boolean(canManageTeam && rowId && (isInvitation || !isProtectedMember));
	          };
	          const getTeamMemberActionTargetsByIds = (memberIds = []) => {
	            const normalizedIds = new Set((Array.isArray(memberIds) ? memberIds : [])
	              .map((memberId) => String(memberId || "").trim())
	              .filter(Boolean));
	            if (!normalizedIds.size) {
	              return [];
	            }
	            return memberRows.filter((row) => normalizedIds.has(getTeamMemberSelectionId(row)));
	          };
	          function clearTeamPageMemberActionMenuCloseTimer() {
	            if (teamPageMemberActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
	              window.clearTimeout(teamPageMemberActionMenuCloseTimerRef.current);
	              teamPageMemberActionMenuCloseTimerRef.current = null;
	            }
	          }
	          function clearTeamPageMemberBulkActionMenuCloseTimer() {
	            if (teamPageMemberBulkActionMenuCloseTimerRef.current !== null && typeof window !== "undefined") {
	              window.clearTimeout(teamPageMemberBulkActionMenuCloseTimerRef.current);
	              teamPageMemberBulkActionMenuCloseTimerRef.current = null;
	            }
	          }
	          function closeTeamPageMemberActionMenu(options = {}) {
	            if (!teamPageMemberActionMenuState) {
	              return;
	            }
	            clearTeamPageMemberActionMenuCloseTimer();
	            if (options?.animate === false || typeof window === "undefined") {
	              setTeamPageMemberActionMenuClosing(false);
	              setTeamPageMemberActionMenuState(null);
	              return;
	            }
	            setTeamPageMemberActionMenuClosing(true);
	            teamPageMemberActionMenuCloseTimerRef.current = window.setTimeout(() => {
	              teamPageMemberActionMenuCloseTimerRef.current = null;
	              setTeamPageMemberActionMenuClosing(false);
	              setTeamPageMemberActionMenuState(null);
	            }, 90);
	          }
	          function closeTeamPageMemberBulkActionMenu(options = {}) {
	            if (!teamPageMemberBulkActionMenuState) {
	              return;
	            }
	            clearTeamPageMemberBulkActionMenuCloseTimer();
	            if (options?.animate === false || typeof window === "undefined") {
	              setTeamPageMemberBulkActionMenuClosing(false);
	              setTeamPageMemberBulkActionMenuState(null);
	              return;
	            }
	            setTeamPageMemberBulkActionMenuClosing(true);
	            teamPageMemberBulkActionMenuCloseTimerRef.current = window.setTimeout(() => {
	              teamPageMemberBulkActionMenuCloseTimerRef.current = null;
	              setTeamPageMemberBulkActionMenuClosing(false);
	              setTeamPageMemberBulkActionMenuState(null);
	            }, 90);
	          }
	          function getTeamMemberContextMenuPosition(event, menuHeight = 96) {
	            const menuWidth = 220;
	            const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
	            const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
	            const gutter = 12;
	            const maxLeft = Math.max(gutter, viewportWidth - menuWidth - gutter);
	            const maxTop = Math.max(gutter, viewportHeight - menuHeight - gutter);
	            return {
	              top: Math.max(gutter, Math.min(maxTop, Number(event?.clientY || 0))),
	              left: Math.max(gutter, Math.min(maxLeft, Number(event?.clientX || 0))),
	            };
	          }
	          function getTeamMemberActionMenuStyle(menuState) {
	            const menuStyle = {
	              position: "fixed",
	              top: Number(menuState?.top || 0) + "px",
	            };
	            if (Number.isFinite(menuState?.right)) {
	              menuStyle.right = Number(menuState.right) + "px";
	              menuStyle.left = "auto";
	            } else {
	              menuStyle.left = Number(menuState?.left || 0) + "px";
	              menuStyle.right = "auto";
	            }
	            return menuStyle;
	          }
	          function openTeamPageMemberBulkActionMenu(event, memberIds = []) {
	            const selectedIds = (Array.isArray(memberIds) ? memberIds : [])
	              .map((memberId) => String(memberId || "").trim())
	              .filter(Boolean);
	            if (selectedIds.length < 2) {
	              return false;
	            }
	            event.preventDefault();
	            event.stopPropagation();
	            const position = getTeamMemberContextMenuPosition(event, 96);
	            clearTeamPageMemberBulkActionMenuCloseTimer();
	            closeTeamPageMemberActionMenu({ animate: false });
	            setTeamPageMemberMenuId("");
	            setTeamPageResourceMenuId("");
	            setTeamPageResourceToolbarPopover("");
	            setTeamPageMemberBulkActionMenuClosing(false);
	            setTeamPageMemberBulkActionMenuState({
	              memberIds: selectedIds,
	              ...position,
	            });
	            return true;
	          }
	          async function handleRemoveTeamMemberRows(rows = []) {
	            const targets = (Array.isArray(rows) ? rows : []).filter(canRemoveTeamMemberRow);
	            if (!targets.length) {
	              return;
	            }
	            const confirmed = window.confirm("Remove " + targets.length + " selected " + (targets.length === 1 ? "member" : "members") + " from the team?");
	            if (!confirmed) {
	              return;
	            }
	            const teamId = String(teamPageSelectedTeamId || "").trim();
	            if (!teamId) {
	              return;
	            }
	            closeTeamPageMemberBulkActionMenu({ animate: false });
	            closeTeamPageMemberActionMenu({ animate: false });
	            setTeamPageActionId("member-bulk-remove");
	            setTeamPageError("");
	            try {
	              for (const row of targets) {
	                const rowId = getTeamMemberActionId(row);
	                if (!rowId) {
	                  continue;
	                }
	                if (row?.kind === "invitation") {
	                  const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/invitations/" + encodeURIComponent(rowId) + "/revoke", {
	                    method: "POST",
	                    credentials: "include",
	                    cache: "no-store",
	                    headers: {
	                      ...requestHeaders,
	                      "Content-Type": "application/json",
	                    },
	                    body: "{}",
	                  }, 8000);
	                  if (!response.ok) {
	                    throw new Error(data?.message || data?.error || "Failed to revoke invitation.");
	                  }
	                } else {
	                  const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/members/" + encodeURIComponent(rowId), {
	                    method: "DELETE",
	                    credentials: "include",
	                    cache: "no-store",
	                    headers: requestHeaders,
	                  }, 8000);
	                  if (!response.ok) {
	                    throw new Error(data?.message || data?.error || "Failed to remove team member.");
	                  }
	                }
	              }
	              setSelectedTeamPageMemberIds(new Set());
	              await loadTeamPageData();
	            } catch (error) {
	              setTeamPageError(error instanceof Error ? error.message : "Failed to remove selected team members.");
	            } finally {
	              setTeamPageActionId("");
	            }
	          }
          const renderTeamMemberIdentityCell = (item, displayName, detail, isInvitation) =>
            React.createElement("div", { className: "playground-team-member-cell" },
              renderAccountAvatar(
                "playground-team-member-avatar",
                "playground-team-member-avatar-image",
                getAccountInitials(displayName),
                getTeamMemberAvatarUrl(item, isInvitation)
              ),
              React.createElement("div", { className: "playground-team-member-copy" },
                React.createElement("div", { className: "playground-team-table-title" }, displayName),
                detail ? React.createElement("div", { className: "playground-team-table-meta" }, detail) : null
              )
            );

	          const teamPageMemberFilterOptions = [
	            { id: "all", label: "All Members", description: "Show members and pending invites" },
	            { id: "active", label: "Active Members", description: "Only show active team members" },
	            { id: "pending", label: "Pending Invites", description: "Only show pending invitations" },
	          ];


	          const teamMembersDataTableColumns = [
	            {
	              id: "user",
	              header: "User",
	              accessor: getTeamMemberRowDisplayName,
	              sortable: true,
	              width: "minmax(220px, 1.2fr)",
	              cell: ({ row }) => {
	                const item = row.item || {};
	                return renderTeamMemberIdentityCell(
	                  item,
	                  getTeamMemberRowDisplayName(row),
	                  getTeamMemberRowDetail(row),
	                  row.kind === "invitation"
	                );
	              },
	            },
	            {
	              id: "role",
	              header: "Role",
	              accessor: getTeamMemberRoleLabel,
	              sortable: true,
	              width: "minmax(130px, 0.72fr)",
	              cell: ({ row }) => {
	                const item = row.item || {};
	                const isInvitation = row.kind === "invitation";
	                const isOwner = isTeamOwnerMember(item, isInvitation);
	                const isProtectedMember = isOwner || isCurrentTeamMemberRow(item, isInvitation);
	                return isOwner
	                  ? React.createElement("span", { className: "playground-team-badge playground-team-role-label" }, "Owner")
	                  : !isInvitation && canManageTeam && !isProtectedMember
	                    ? renderRoleSelect({
	                        value: item.role || "create",
	                        onChange: (event) => handleUpdateTeamMemberRole(item.id, event.target.value),
	                        disabled: teamPageActionId === "member-role:" + item.id,
	                        variant: "member-row",
	                      })
	                    : React.createElement("span", { className: "playground-team-badge playground-team-role-label" }, formatRole(item.role));
	              },
	            },
	            {
	              id: "status",
	              header: "Status",
	              accessor: getTeamMemberStatusLabel,
	              sortable: true,
	              width: "minmax(110px, 0.58fr)",
	              hideBelow: 720,
	              cell: ({ row }) => React.createElement("div", { className: "playground-agents-overview-table-value" }, getTeamMemberStatusLabel(row)),
	            },
	            {
	              id: "joined",
	              header: "Joined",
	              accessor: getTeamMemberJoinedTimestamp,
	              sortable: true,
	              sortDescFirst: true,
	              width: "minmax(120px, 0.58fr)",
	              align: "end",
	              hideBelow: 900,
	              cell: ({ row }) => React.createElement("div", { className: "playground-agents-overview-table-value is-right" }, getTeamMemberJoinedLabel(row)),
	            },
	          ];
	          const getTeamMemberDataTableActions = (row, actionState) => {
	            const targets = Array.isArray(actionState?.targetRows) && actionState.targetRows.length
	              ? actionState.targetRows
	              : [row];
	            const removableTargets = targets.filter(canRemoveTeamMemberRow);
	            const bulkMode = targets.length > 1;
	            if (bulkMode) {
	              return [{
	                id: "remove-selected",
	                label: teamPageActionId === "member-bulk-remove" ? "Removing..." : "Remove selected",
	                icon: Trash2,
	                danger: true,
	                disabled: teamPageActionId === "member-bulk-remove" || removableTargets.length === 0,
	                onSelect: () => void handleRemoveTeamMemberRows(removableTargets),
	              }];
	            }
	            if (!canRemoveTeamMemberRow(row)) {
	              return [];
	            }
	            const rowId = getTeamMemberActionId(row);
	            const isInvitation = row.kind === "invitation";
	            const actionId = isInvitation ? "revoke:" + rowId : "member-remove:" + rowId;
	            const isRemoving = teamPageActionId === actionId || teamPageActionId === "member-bulk-remove";
	            return [{
	              id: "remove",
	              label: isRemoving ? "Removing..." : (isInvitation ? "Revoke invitation" : "Remove user"),
	              icon: Trash2,
	              danger: true,
	              disabled: isRemoving,
	              onSelect: () => {
	                if (isInvitation) handleRevokeTeamInvitation(rowId);
	                else handleRemoveTeamMember(rowId);
	              },
	            }];
	          };
	          const teamMembersDataTable = React.createElement(PlatformDataTable, {
	            rows: visibleTeamMemberRows,
	            columns: teamMembersDataTableColumns,
	            getRowId: getTeamMemberSelectionId,
	            ariaLabel: "Team members",
	            className: "playground-team-members-platform-data-table",
	            surface: "plain",
	            variant: "minimalistic-ui",
	            sorting: {
	              value: { id: teamPageMemberSort, direction: normalizedTeamPageMemberSortDirection },
	              manual: true,
	              onChange: (nextSorting) => {
	                if (!nextSorting) return;
	                setTeamPageMemberSort(nextSorting.id);
	                setTeamPageMemberSortDirection(nextSorting.direction);
	                setTeamPageMemberToolbarPopover("");
	              },
	            },
	            selection: {
	              enabled: true,
	              value: selectedTeamPageMemberIds,
	              onChange: ({ selectedIds: nextSelectedIds }) => setSelectedTeamPageMemberIds(new Set(nextSelectedIds)),
	              ariaLabel: (row) => "Select " + getTeamMemberRowDisplayName(row),
	            },
	            toolbar: {
	              title: "All Members",
	              search: {
	                value: teamPageMemberSearchQuery,
	                onChange: setTeamPageMemberSearchQuery,
	                placeholder: "Search members",
	                manual: true,
	              },
	              filters: [{
	                id: "member-status",
	                label: "Status",
	                value: teamPageMemberFilter,
	                options: teamPageMemberFilterOptions,
	                onChange: setTeamPageMemberFilter,
	              }],
	              primaryAction: canManageTeam ? {
	                label: "Invite Member",
	                icon: Plus,
	                onClick: () => setTeamPageInviteModalOpen(true),
	              } : undefined,
	            },
	            getRowActions: getTeamMemberDataTableActions,
	            getRowAriaLabel: getTeamMemberRowDisplayName,
	            loading: teamPageLoading && memberRows.length === 0,
	            emptyState: normalizedTeamPageMemberSearchQuery || teamPageMemberFilter !== "all"
	              ? "No matching members found."
	              : "No members yet.",
	          });

	          const renderMembersTab = () => React.createElement("div", {
	              className: "playground-team-detail-panel playground-team-members-table-section",
	            },
	            teamMembersDataTable
	          );

`;
