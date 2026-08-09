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
	            const getOrganizationRoleMemberId = (member) => String(member?.id || "").trim();
	            const getOrganizationRoleMemberUserId = (member) => String(member?.userId || member?.user_id || member?.uid || "").trim();
	            const getOrganizationRoleMemberAvatarUrl = (member) => {
	              const memberUserId = getOrganizationRoleMemberUserId(member);
	              const avatarUrl = normalizeSessionPhotoUrl(
	                readTeamPageIdentityAvatarUrl(member)
	                || (memberUserId === String(sessionState.userId || "").trim() ? accountAvatarUrl : "")
	              );
	              return canRenderAvatarImage(avatarUrl) ? avatarUrl : "";
	            };
	            const activeOrganizationMembers = (Array.isArray(organizationPageMembers) ? organizationPageMembers : [])
	              .filter((member) => String(member?.status || "active").trim().toLowerCase() === "active")
	              .filter((member) => getOrganizationRoleMemberId(member));
	            const selectedOrganizationOwner = activeOrganizationMembers.find((member) => (
	              normalizeOrganizationRoleId(member?.role, "member") === "owner"
	            )) || activeOrganizationMembers.find((member) => (
	              getOrganizationRoleMemberUserId(member) === String(selectedOrganization?.ownerUserId || "").trim()
	            )) || null;
	            const organizationOwnerIdentity = selectedOrganizationOwner
	              ? {
	                  value: getOrganizationRoleMemberId(selectedOrganizationOwner),
	                  name: getMemberDisplayName(selectedOrganizationOwner),
	                  email: readTeamPageIdentityEmail(selectedOrganizationOwner),
	                  avatarUrl: getOrganizationRoleMemberAvatarUrl(selectedOrganizationOwner),
	                }
	              : {
	                  value: "organization-owner",
	                  name: "Organization owner",
	                  email: "",
	                  avatarUrl: "",
	                };
	            const organizationOwnerOptions = activeOrganizationMembers.map((member) => ({
	              value: getOrganizationRoleMemberId(member),
	              name: getMemberDisplayName(member),
	              email: readTeamPageIdentityEmail(member),
	              avatarUrl: getOrganizationRoleMemberAvatarUrl(member),
	              data: { member },
	            }));
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
	            const renderOrganizationOwnerSelector = () => React.createElement(PlatformOwnerSelector, {
	              owner: organizationOwnerIdentity,
	              options: organizationOwnerOptions,
	              onTransfer: (memberId) => handleTransferOrganizationOwnership(memberId),
	              ariaLabel: "Choose organization owner",
	              resourceLabel: "organization",
	              disabled: currentRoleId !== "owner"
	                || !selectedOrganizationOwner
	                || organizationPageActionId.startsWith("organization-owner:"),
	              loading: organizationPageLoading && organizationOwnerOptions.length === 0,
	              fullWidth: false,
	              alignment: "end",
	              popupAlignment: "right",
	              popupWidth: 280,
	              className: "playground-organization-owner-selector",
	              confirmationTitle: "Transfer organization ownership?",
	              confirmationDescription: (option) => "Transfer ownership to " + option.name + "? You will lose owner privileges and cannot take the owner role back yourself.",
	            });
	            return React.createElement("div", { className: "playground-team-detail-panel playground-team-roles-panel" },
	              React.createElement(PlatformRolePermissionsPage, {
	                roles: visibleRoleDefinitions.map((role) => ({
	                  id: role.id,
	                  label: role.label,
	                  meta: assignedMembersForRole(role.id).length + " assigned",
	                })),
	                value: selectedRoleDefinition.id,
	                onValueChange: (roleId) => {
	                  setOrganizationPageSelectedRoleId(roleId);
	                  setOrganizationPageRoleMembersPopover("");
	                },
	                roleAriaLabel: "Organization roles",
	                roleKicker: null,
	                roleDescription: selectedRoleDefinition.description,
	                roleHeaderAction: isSelectedOwnerRole
	                  ? renderOrganizationOwnerSelector()
	                  : renderAssignedUsersButton(selectedRoleDefinition),
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

	          const renderOrganizationGeneral = () => {
	            const organizationId = String(selectedOrganization?.id || "").trim();
	            const savedOrganizationName = String(selectedOrganization?.name || "").trim();
	            const normalizedDraftName = String(organizationPageRenameName || "").trim();
	            const activeMemberCount = organizationPageMembers.filter((member) => {
	              const status = String(member?.status || "active").trim().toLowerCase();
	              return status !== "disabled" && status !== "inactive" && status !== "removed" && status !== "suspended";
	            }).length;
	            const isSaving = organizationPageActionId === "rename-organization";
	            const isDeleting = organizationPageActionId === "delete-organization";
	            const isPersonalOrganization = isOrganizationPagePersonalOrganization(selectedOrganization);
	            const canSave = canManageOrganization
	              && Boolean(normalizedDraftName)
	              && normalizedDraftName !== savedOrganizationName
	              && !isSaving
	              && !isDeleting;
	            const organizationSwitcher = React.createElement(PlatformButtonSelector, {
	                mode: "popup",
	                buttonVariant: "primary",
	                buttonSize: "small",
	                label: "Switch Organization",
	                leading: React.createElement(Building2, {
	                  width: 14,
	                  height: 14,
	                  strokeWidth: 1.8,
	                  "aria-hidden": "true",
	                }),
	                closeOnSelect: true,
	                popupAriaLabel: "Switch organization",
	                popupAlignment: "right",
	                popupRole: "menu",
	                popupVariant: "minimal",
	                popupWidth: 260,
	                popupMaxHeight: "min(360px, calc(100vh - 32px))",
	                className: "playground-organization-settings-switcher",
	              },
	              (Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : []).map((organization) => {
	                const normalizedOrganization = normalizeOrganizationPageRecord(organization);
	                const isActive = isOrganizationPageActiveOrganization(normalizedOrganization);
	                return React.createElement("button", {
	                    key: normalizedOrganization.id,
	                    type: "button",
	                    role: "menuitemradio",
	                    className: "tb-popup-row playground-organization-settings-switcher-option" + (isActive ? " is-selected" : ""),
	                    "aria-checked": isActive ? "true" : "false",
	                    onClick: () => void handleSwitchOrganization(normalizedOrganization.id),
	                  },
	                  React.createElement(Building2, {
	                    className: "tb-popup-icon",
	                    width: 14,
	                    height: 14,
	                    strokeWidth: 1.8,
	                    "aria-hidden": "true",
	                  }),
	                  React.createElement("span", { className: "playground-organization-settings-switcher-label" }, getOrganizationPageDisplayName(normalizedOrganization)),
	                  isActive
	                    ? React.createElement(Check, {
	                        className: "tb-popup-check",
	                        width: 14,
	                        height: 14,
	                        strokeWidth: 1.8,
	                        "aria-hidden": "true",
	                      })
	                    : null
	                );
	              }),
	              React.createElement("div", { className: "playground-organization-settings-switcher-footer" },
	                React.createElement("button", {
	                    type: "button",
	                    role: "menuitem",
	                    className: "tb-popup-row playground-organization-settings-switcher-create",
	                    onClick: () => {
	                      setOrganizationPageCreateName("");
	                      setOrganizationPageCreateModalOpen(true);
	                    },
	                  },
	                  React.createElement(Plus, {
	                    className: "tb-popup-icon",
	                    width: 14,
	                    height: 14,
	                    strokeWidth: 1.8,
	                    "aria-hidden": "true",
	                  }),
	                  React.createElement("span", null, "Create organization")
	                )
	              )
	            );
	            return React.createElement("div", { className: "playground-organization-settings" },
	              React.createElement("section", { className: "playground-organization-settings-card is-details" },
	                React.createElement("div", { className: "playground-organization-settings-card-content" },
	                  React.createElement("div", { className: "playground-organization-settings-title-row" },
	                    React.createElement("h1", { className: "playground-organization-settings-title" }, "Your Organization"),
	                    organizationSwitcher
	                  ),
	                  React.createElement("div", { className: "playground-organization-settings-member-summary" },
	                    React.createElement("div", { className: "playground-organization-settings-member-copy" },
	                      React.createElement("div", { className: "playground-organization-settings-member-label" }, "Active members"),
	                      React.createElement("div", { className: "playground-organization-settings-member-description" }, "The number of active members in your organization.")
	                    ),
	                    React.createElement("div", { className: "playground-organization-settings-member-count" }, String(activeMemberCount))
	                  ),
	                  React.createElement("div", { className: "playground-organization-settings-fields" },
	                    React.createElement("label", { className: "playground-organization-settings-field", htmlFor: "organization-settings-name" },
	                      React.createElement("span", { className: "playground-organization-settings-field-label" }, "Organization name"),
	                      React.createElement("input", {
	                        id: "organization-settings-name",
	                        className: "playground-organization-settings-input",
	                        value: organizationPageRenameName,
	                        onChange: (event) => setOrganizationPageRenameName(event.target.value),
	                        onKeyDown: (event) => {
	                          if (event.key === "Enter" && canSave) {
	                            event.preventDefault();
	                            void handleRenameOrganization();
	                          }
	                        },
	                        disabled: !canManageOrganization || isSaving || isDeleting,
	                        autoComplete: "organization",
	                      })
	                    ),
	                    React.createElement("div", { className: "playground-organization-settings-field" },
	                      React.createElement("span", { className: "playground-organization-settings-field-label" }, "Organization ID"),
	                      React.createElement("div", { className: "playground-organization-settings-id-control" },
	                        React.createElement("input", {
	                          className: "playground-organization-settings-input is-readonly",
	                          value: organizationId,
	                          readOnly: true,
	                          tabIndex: -1,
	                          "aria-label": "Organization ID",
	                        }),
	                        React.createElement(PlatformIconButton, {
	                          size: "medium",
	                          className: "playground-organization-settings-copy-button",
	                          "aria-label": "Copy organization ID",
	                          title: "Copy organization ID",
	                          disabled: !organizationId,
	                          onClick: async () => {
	                            const copied = await copyTextToClipboard(organizationId);
	                            if (!copied) {
	                              setOrganizationPageError("Could not copy the organization ID.");
	                            }
	                          },
	                        }, React.createElement(Copy, { width: 14, height: 14, strokeWidth: 1.8 }))
	                      )
	                    )
	                  )
	                ),
	                React.createElement("div", { className: "playground-organization-settings-card-footer" },
	                  React.createElement(PlatformPrimaryButton, {
	                    size: "medium",
	                    type: "button",
	                    onClick: () => void handleRenameOrganization(),
	                    disabled: !canSave,
	                  }, isSaving ? "Saving..." : "Save")
	                )
	              ),
	              React.createElement("section", { className: "playground-organization-settings-card is-danger-zone" },
	                React.createElement("div", { className: "playground-organization-settings-card-content" },
	                  React.createElement("h2", { className: "playground-organization-settings-title" }, "Danger zone"),
	                  React.createElement("div", { className: "playground-organization-settings-danger-row" },
	                    React.createElement("div", { className: "playground-organization-settings-danger-copy" },
	                      React.createElement("div", { className: "playground-organization-settings-danger-label" }, "Delete organization"),
	                      React.createElement("div", { className: "playground-organization-settings-danger-description" }, isPersonalOrganization
	                        ? "Personal organizations are permanent and cannot be deleted."
	                        : "Permanently delete this organization and all of its data. Organization members and their user accounts will not be deleted.")
	                    ),
	                    React.createElement(PlatformButton, {
	                      variant: "secondary",
	                      size: "medium",
	                      type: "button",
	                      className: "is-danger playground-organization-settings-delete-button",
	                      onClick: () => {
	                        if (!isPersonalOrganization) setOrganizationPageDeleteModalOpen(true);
	                      },
	                      disabled: isPersonalOrganization || !canManageOrganization || isSaving || isDeleting,
	                      title: isPersonalOrganization ? "Personal organizations cannot be deleted" : "Delete organization",
	                    }, isDeleting ? "Deleting..." : "Delete organization")
	                  )
	                )
	              ),
	              React.createElement(PlatformConfirmationModal, {
	                open: organizationPageDeleteModalOpen && !isPersonalOrganization,
	                title: "Delete this organization?",
	                description: "This permanently deletes " + getOrganizationPageDisplayName(selectedOrganization) + " and all organization-owned data. Member user accounts are not deleted.",
	                confirmLabel: "Delete organization",
	                confirmingLabel: "Deleting...",
	                tone: "destructive",
	                onCancel: () => {
	                  if (!isDeleting) setOrganizationPageDeleteModalOpen(false);
	                },
	                onConfirm: handleDeleteOrganization,
	              })
	            );
	          };

	          const organizationAdminPageLabels = {
	            organization: "Organization",
	            members: "Members",
	            subscription: "Subscription",
	            billing: "Billing",
	            usage: "Usage",
	            roles: "Roles",
	            "identity-access": "Identity & Access",
	          };
	          const normalizedOrganizationAdminPage = normalizeOrganizationAdminPageId(organizationPageActiveTab);
	          const organizationAdminPageLabel = organizationAdminPageLabels[normalizedOrganizationAdminPage] || "Organization";
	          const renderOrganizationAdminPageContent = () => {
	            if (normalizedOrganizationAdminPage === "members") return renderMembers();
	            if (normalizedOrganizationAdminPage === "subscription") return renderOrganizationSubscription();
	            if (normalizedOrganizationAdminPage === "roles") return renderOrganizationRoles();
	            if (normalizedOrganizationAdminPage === "identity-access") return renderOrganizationIdentityAccess();
	            if (normalizedOrganizationAdminPage === "billing") return renderOrganizationBillingSection();
	            if (normalizedOrganizationAdminPage === "usage") return renderOrganizationUsageSection();
	            return renderOrganizationGeneral();
	          };

          return React.createElement("div", {
              className: "playground-team-page playground-organization-admin-page"
                + (normalizedOrganizationAdminPage === "members" ? " is-members-page" : "")
                + (normalizedOrganizationAdminPage === "subscription" ? " is-subscription-page" : "")
                + (normalizedOrganizationAdminPage === "billing" ? " is-billing-page" : ""),
              ref: organizationPageRef,
            },
            React.createElement("div", { className: "playground-team-shell" },
              selectedOrganization
                ? React.createElement(React.Fragment, null,
	                  normalizedOrganizationAdminPage !== "organization"
	                    && normalizedOrganizationAdminPage !== "members"
	                    && normalizedOrganizationAdminPage !== "subscription"
	                    && normalizedOrganizationAdminPage !== "billing"
	                    && normalizedOrganizationAdminPage !== "roles"
	                    ? React.createElement("div", { className: "playground-team-detail-header" },
	                        React.createElement("div", { className: "playground-organization-admin-heading" },
	                          React.createElement("h1", { className: "playground-team-detail-title" }, organizationAdminPageLabel),
	                          React.createElement("div", { className: "playground-organization-admin-context" }, getOrganizationPageDisplayName(selectedOrganization))
	                        )
	                      )
	                    : null,
                    organizationPageError ? React.createElement("div", { className: "playground-team-error" }, organizationPageError) : null,
                    renderOrganizationAdminPageContent(),
                    renderOrganizationInviteModal()
                  )
                : organizationPageError
	                ? React.createElement("div", { className: "playground-team-error" }, organizationPageError)
	                : React.createElement(PlatformLoadingState, {
	                    className: "playground-organization-admin-loading",
	                    message: "Loading organization...",
	                    centered: true,
	                  }),
	            renderOrganizationCreateModal()
            )
          );
        }
`;
