export const ORGANIZATIONS_PAGE_SETUP_SCRIPT = `        function renderOrganizationPage() {
          const formatDate = (value) => {
            if (!value) return "";
            try {
              return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
            } catch {
              return String(value || "");
            }
          };
          const selectedOrganization = organizationPageOrganizations.find((organization) => organization.id === organizationPageSelectedOrganizationId) || null;
          const activeOrganization = organizationPageOrganizations.find((organization) => isOrganizationPageActiveOrganization(organization))
            || getOrganizationPagePersonalOrganization(organizationPageOrganizations);
          const organizationRoleOptions = PLAYGROUND_ASSIGNABLE_ORGANIZATION_ROLE_DEFINITIONS;
          const normalizeOrganizationRoleId = normalizePlaygroundOrganizationRoleId;
          const currentRoleId = normalizeOrganizationRoleId(selectedOrganization?.membership?.role || selectedOrganization?.role, "member");
          const canManageOrganization = Boolean(selectedOrganization)
            && (
              currentRoleId === "owner"
              || currentRoleId === "admin"
              || String(selectedOrganization?.ownerUserId || "") === String(sessionState.userId || "")
            );
          const canInviteOrganization = canManageOrganization;
          const renderEmpty = (text) => React.createElement("div", { className: "playground-team-empty" }, text);
          const renderOrganizationActionButton = (label, onClick, options = {}) => React.createElement(PlatformButton, {
            variant: options.primary ? "primary" : "secondary",
            type: "button",
            className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-team-action-button" + (options.primary ? " is-primary" : ""),
            onClick,
            disabled: Boolean(options.disabled),
          }, options.icon || null, label);
          const formatRole = (role) => {
            const normalized = normalizeOrganizationRoleId(role, "member");
            if (normalized === "owner") return "Owner";
            return organizationRoleOptions.find((option) => option.id === normalized)?.label || "Member";
          };
          const renderOrganizationRoleSelect = (props = {}) => {
            const { variant, className, ...selectProps } = props || {};
            const isMemberRowVariant = variant === "member-row";
            const selectElement = React.createElement("select", {
              className: "playground-team-select"
                + (isMemberRowVariant ? " playground-team-member-role-select" : "")
                + (className ? " " + className : ""),
              ...selectProps,
              value: normalizeOrganizationRoleId(props?.value, "member"),
            }, organizationRoleOptions.map((option) =>
              React.createElement("option", { key: option.id, value: option.id }, option.label)
            ));
            return isMemberRowVariant
              ? React.createElement("span", { className: "playground-team-member-role-select-shell" },
                  selectElement,
                  React.createElement(ChevronsUpDown, {
                    className: "playground-team-member-role-select-icon",
                    width: 13,
                    height: 13,
                    strokeWidth: 1.55,
                    "aria-hidden": "true",
                  })
                )
              : selectElement;
          };
          const formatOrganizationType = (type) => String(type || "").trim().toLowerCase() === "personal" ? "Personal" : "Company";
	          const openOrganizationDetail = (organizationId) => {
	            const normalizedOrganizationId = String(organizationId || "").trim();
	            if (!normalizedOrganizationId) return;
	            setOrganizationPageActiveTab("members");
	            setOrganizationPageBillingSection("costs-plans");
	            setOrganizationPagePendingDestination(null);
	            setOrganizationPageSelectedRoleId("member");
	            setOrganizationPageSelectedOrganizationId(normalizedOrganizationId);
	            setOrganizationPageMembers([]);
	            setOrganizationPageInvitations([]);
	            setOrganizationPageResources([]);
	            setOrganizationMemberSearchQuery("");
	            setOrganizationMemberToolbarPopover("");
	            setOrganizationMemberMenuId("");
	            setSelectedOrganizationMemberIds(new Set());
	          };
          const renderOrganizationCreateModal = () => organizationPageCreateModalOpen
            ? React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop",
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget && organizationPageActionId !== "create-organization") {
                    setOrganizationPageCreateModalOpen(false);
                  }
                },
              },
                React.createElement(PlatformModalSurface, { className: "playground-team-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "organization-create-modal-title" },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "organization-create-modal-title", className: "playground-team-modal-title" }, "Create organization"),
                      React.createElement("p", { className: "playground-team-modal-subtitle" }, "Create a company workspace for shared agents, computers, projects, resources, and usage.")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: () => setOrganizationPageCreateModalOpen(false),
                      disabled: organizationPageActionId === "create-organization",
                      "aria-label": "Close create organization modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-modal-form" },
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "organization-create-name" }, "Organization name"),
                      React.createElement("input", {
                        id: "organization-create-name",
                        className: "playground-team-input",
                        value: organizationPageCreateName,
                        onChange: (event) => setOrganizationPageCreateName(event.target.value),
                        placeholder: "Acme Inc.",
                        disabled: organizationPageActionId === "create-organization",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button",
                        onClick: () => setOrganizationPageCreateModalOpen(false),
                        disabled: organizationPageActionId === "create-organization",
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "large",
                        type: "button",
                        className: "playground-team-button is-primary",
                        onClick: handleCreateOrganization,
                        disabled: organizationPageActionId === "create-organization" || !String(organizationPageCreateName || "").trim(),
                      }, organizationPageActionId === "create-organization" ? "Creating..." : "Create organization")
                    )
                  )
                )
              )
            : null;
          const renderOrganizationRenameModal = () => organizationPageRenameModalOpen
            ? React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop",
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget && organizationPageActionId !== "rename-organization") {
                    setOrganizationPageRenameModalOpen(false);
                  }
                },
              },
                React.createElement(PlatformModalSurface, { className: "playground-team-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "organization-rename-modal-title" },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "organization-rename-modal-title", className: "playground-team-modal-title" }, "Edit organization"),
                      React.createElement("p", { className: "playground-team-modal-subtitle" }, "Rename this workspace for everyone in the organization.")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: () => setOrganizationPageRenameModalOpen(false),
                      disabled: organizationPageActionId === "rename-organization",
                      "aria-label": "Close edit organization modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-modal-form" },
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "organization-rename-name" }, "Organization name"),
                      React.createElement("input", {
                        id: "organization-rename-name",
                        className: "playground-team-input",
                        value: organizationPageRenameName,
                        onChange: (event) => setOrganizationPageRenameName(event.target.value),
                        placeholder: "Acme Inc.",
                        disabled: organizationPageActionId === "rename-organization",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button",
                        onClick: () => setOrganizationPageRenameModalOpen(false),
                        disabled: organizationPageActionId === "rename-organization",
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "large",
                        type: "button",
                        className: "playground-team-button is-primary",
                        onClick: handleRenameOrganization,
                        disabled: organizationPageActionId === "rename-organization" || !String(organizationPageRenameName || "").trim(),
                      }, organizationPageActionId === "rename-organization" ? "Saving..." : "Save changes")
                    )
                  )
                )
              )
            : null;
          const renderOrganizationInviteModal = () => organizationPageInviteModalOpen
            ? React.createElement(PlatformModalBackdrop, {
                className: "playground-team-modal-backdrop",
                onMouseDown: (event) => {
                  if (event.target === event.currentTarget && organizationPageActionId !== "invite-organization") {
                    setOrganizationPageInviteModalOpen(false);
                  }
                },
              },
                React.createElement(PlatformModalSurface, { className: "playground-team-modal", role: "dialog", "aria-modal": "true", "aria-labelledby": "organization-invite-modal-title" },
                  React.createElement("div", { className: "playground-team-modal-header" },
                    React.createElement("div", null,
                      React.createElement("h2", { id: "organization-invite-modal-title", className: "playground-team-modal-title" }, "Invite member"),
                      React.createElement("p", { className: "playground-team-modal-subtitle" }, "Send an invitation and choose the organization role for this person.")
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-team-modal-close",
                      onClick: () => setOrganizationPageInviteModalOpen(false),
                      disabled: organizationPageActionId === "invite-organization",
                      "aria-label": "Close invite organization member modal",
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-team-modal-form" },
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label", htmlFor: "organization-invite-email" }, "Email"),
                      React.createElement("input", {
                        id: "organization-invite-email",
                        className: "playground-team-input",
                        type: "email",
                        value: organizationPageInviteEmail,
                        onChange: (event) => setOrganizationPageInviteEmail(event.target.value),
                        placeholder: "name@company.com",
                        disabled: organizationPageActionId === "invite-organization",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-field" },
                      React.createElement("label", { className: "playground-team-modal-label" }, "Role"),
                      renderOrganizationRoleSelect({
                        value: organizationPageInviteRole,
                        onChange: (event) => setOrganizationPageInviteRole(event.target.value),
                        disabled: organizationPageActionId === "invite-organization",
                      })
                    ),
                    React.createElement("div", { className: "playground-team-modal-actions" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-team-button",
                        onClick: () => setOrganizationPageInviteModalOpen(false),
                        disabled: organizationPageActionId === "invite-organization",
                      }, "Cancel"),
                      React.createElement(PlatformPrimaryButton, {
                        size: "large",
                        type: "button",
                        className: "playground-team-button is-primary",
                        onClick: handleSendOrganizationInvite,
                        disabled: organizationPageActionId === "invite-organization" || !String(organizationPageInviteEmail || "").trim(),
                      }, organizationPageActionId === "invite-organization" ? "Sending..." : "Send invite")
                    )
                  )
                )
              )
            : null;
`;
