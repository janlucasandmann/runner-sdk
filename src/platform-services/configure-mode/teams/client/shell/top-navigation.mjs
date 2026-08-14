export const TEAMS_TOP_NAVIGATION_SCRIPT = `        function renderTeamPageNav() {
          const isTeamOverview = !teamPageSelectedTeamId;
          const selectedTeam = isTeamOverview
            ? null
            : teamPageTeams.find((team) => String(team?.id || "") === String(teamPageSelectedTeamId || "")) || null;
          const renderTeamDetailActions = () => {
            if (!selectedTeam?.id) {
              return null;
            }
            const teamId = String(selectedTeam.id || "").trim();
            const teamName = String(selectedTeam.name || "Team").trim() || "Team";
            const currentSessionUserId = String(sessionState?.userId || "").trim();
            const currentSessionEmail = String(accountEmail || sessionState?.email || "").trim().toLowerCase();
            const currentMember = (Array.isArray(teamPageMembers) ? teamPageMembers : []).find((member) => {
              const memberUserId = String(
                member?.userId
                || member?.user_id
                || member?.uid
                || member?.localId
                || member?.local_id
                || member?.user?.id
                || member?.user?.uid
                || member?.user?.userId
                || member?.user?.user_id
                || ""
              ).trim();
              const memberEmail = String(
                member?.email
                || member?.emailAddress
                || member?.email_address
                || member?.user?.email
                || member?.user?.emailAddress
                || member?.user?.email_address
                || ""
              ).trim().toLowerCase();
              return Boolean(
                (currentSessionUserId && memberUserId && memberUserId === currentSessionUserId)
                || (currentSessionEmail && memberEmail && memberEmail === currentSessionEmail)
              );
            }) || null;
            const currentMemberRoleId = normalizePlaygroundTeamRoleId(
              currentMember?.role
              || selectedTeam.currentUserRole
              || selectedTeam.current_user_role
              || selectedTeam.viewerRole
              || selectedTeam.viewer_role
              || selectedTeam.myRole
              || selectedTeam.my_role
              || selectedTeam.memberRole
              || selectedTeam.member_role
              || selectedTeam.membershipRole
              || selectedTeam.membership_role
              || "",
              "member",
            );
            const selectedTeamOwnerId = String(
              selectedTeam.ownerUserId
              || selectedTeam.ownerId
              || selectedTeam.createdByUserId
              || selectedTeam.owner?.userId
              || selectedTeam.owner?.id
              || ""
            ).trim();
            const canManageTeam = currentMemberRoleId === "owner"
              || currentMemberRoleId === "admin"
              || Boolean(currentSessionUserId && selectedTeamOwnerId && selectedTeamOwnerId === currentSessionUserId);
            const formatTeamDetailDate = (value) => {
              if (!value) return "—";
              try {
                return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
              } catch {
                return String(value || "—");
              }
            };
            const creatorLabel = String(
              selectedTeam.createdByName
              || selectedTeam.created_by_name
              || selectedTeam.creatorName
              || selectedTeam.creator_name
              || selectedTeam.createdBy?.name
              || selectedTeam.createdBy?.displayName
              || selectedTeam.creator?.name
              || selectedTeam.creator?.displayName
              || selectedTeam.createdByEmail
              || selectedTeam.created_by_email
              || selectedTeam.creatorEmail
              || selectedTeam.creator_email
              || "Unknown"
            ).trim() || "Unknown";
            return React.createElement(PlatformResourceHeaderActions, {
                className: "playground-team-detail-breadcrumb-actions",
              },
              React.createElement(PlatformResourceActionsMenu, {
                open: Boolean(teamPageActionsOpen),
                onOpenChange: setTeamPageActionsOpen,
                resourceLabel: "Team",
                width: 280,
                maxWidth: "min(280px, calc(100vw - 16px))",
                shortcutActions: {
                  rename: {
                    onInvoke: () => {
                      setTeamPageActionsOpen(false);
                      setTeamPageRenameName(teamName);
                      setTeamPageRenameModalOpen(true);
                    },
                    disabled: !canManageTeam,
                  },
                  delete: {
                    onInvoke: () => {
                      setTeamPageActionsOpen(false);
                      void handleDeleteTeam();
                    },
                    disabled: !canManageTeam,
                  },
                },
              },
                React.createElement(PlatformResourceActionsInformation, {
                  resourceLabel: "Team",
                  items: [
                    {
                      id: "id",
                      label: "ID",
                      value: teamId,
                      title: teamId,
                      monospace: true,
                      copyValue: teamId,
                      copyAriaLabel: "Copy Team ID",
                    },
                    { id: "members", label: "Members", value: String(Array.isArray(teamPageMembers) ? teamPageMembers.length : 0) },
                    { id: "created", label: "Created", value: formatTeamDetailDate(selectedTeam.createdAt) },
                    { id: "creator", label: "Creator", value: creatorLabel },
                  ],
                }),
                React.createElement(PlatformResourceActionMenuItem, {
                  icon: React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  label: "Copy Team ID",
                  onClick: () => {
                    setTeamPageActionsOpen(false);
                    const copyPromise = navigator.clipboard?.writeText?.(teamId);
                    if (copyPromise) void copyPromise.catch(() => undefined);
                  },
                }),
                React.createElement(PlatformResourceActionsDivider),
                React.createElement(PlatformResourceActionMenuItem, {
                  icon: React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  label: "Rename",
                  shortcut: "rename",
                  disabled: !canManageTeam,
                  onClick: () => {
                    setTeamPageActionsOpen(false);
                    setTeamPageRenameName(teamName);
                    setTeamPageRenameModalOpen(true);
                  },
                }),
                React.createElement(PlatformResourceActionMenuItem, {
                  icon: React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                  label: "Delete",
                  shortcut: "delete",
                  disabled: !canManageTeam,
                  onClick: () => {
                    setTeamPageActionsOpen(false);
                    void handleDeleteTeam();
                  },
                }),
              )
            );
          };
          const activeTeamDetailSection = teamPageActiveTab === "permissions"
            ? "roles"
            : ["members", "resources", "roles"].includes(teamPageActiveTab)
              ? teamPageActiveTab
              : "members";
          return renderAppHeader({
            className: "playground-settings-top-navbar",
            pathItems: isTeamOverview
              ? [{ label: "Admin" }, { label: "Teams" }]
              : [
                  { label: "Admin" },
                  { label: "Teams", onClick: openTeamOverviewPage },
                  {
                    label: String(selectedTeam?.name || "Team"),
                    trailing: renderTeamDetailActions(),
                  },
                ],
            center: isTeamOverview
              ? null
              : React.createElement(PlatformSwitch, {
                  className: "playground-team-detail-header-switch",
                  value: activeTeamDetailSection,
                  options: [
                    { value: "members", label: "Members" },
                    { value: "resources", label: "Resources" },
                    { value: "roles", label: "Roles" },
                  ],
                  onValueChange: (nextSection) => {
                    setTeamPageActiveTab(["members", "resources", "roles"].includes(nextSection)
                      ? nextSection
                      : "members");
                  },
                  ariaLabel: "Team section",
                }),
            includeSearchDivider: true,
            extraActions: isTeamOverview
              ? React.createElement("div", {
                  id: "playground-teams-overview-controls",
                  className: "playground-tools-overview-controls-slot",
                })
              : React.createElement("div", {
                  id: "playground-team-detail-controls",
                  className: "playground-tools-overview-controls-slot playground-team-detail-controls-slot",
                }),
          });
        }
`;
