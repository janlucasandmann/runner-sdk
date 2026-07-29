          function getSelectedSkillIconColor(metadata = selectedSkill?.metadata) {
            const normalizedMetadata = metadata
              && typeof metadata === "object"
              && !Array.isArray(metadata)
              ? metadata
              : {};
            const requestedColor = String(
              normalizedMetadata.iconColor
              || normalizedMetadata.skillIconColor
              || ""
            ).trim();
            return /^#[0-9a-f]{6}$/i.test(requestedColor)
              ? requestedColor
              : "#ffffff";
          }

          async function handleSelectedSkillIdentityChange(nextIdentity) {
            if (!selectedSkill?.isCustom) {
              return false;
            }
            const previousSkill = selectedSkill;
            const previousMetadata = selectedSkill.metadata
              && typeof selectedSkill.metadata === "object"
              && !Array.isArray(selectedSkill.metadata)
              ? selectedSkill.metadata
              : {};
            const normalizedIconId = getPlaygroundSkillIconId(nextIdentity?.icon);
            const requestedColor = String(nextIdentity?.color || "").trim();
            const normalizedColor = /^#[0-9a-f]{6}$/i.test(requestedColor)
              ? requestedColor
              : getSelectedSkillIconColor(previousMetadata);
            const nextMetadata = {
              ...previousMetadata,
              iconColor: normalizedColor,
            };
            updateSelectedSkillLocal((current) => ({
              ...current,
              icon: normalizedIconId,
              metadata: nextMetadata,
            }));
            if (selectedSkill.isDraft) {
              return true;
            }

            setSkillSaveState({ isSaving: true, error: "" });
            try {
              await patchSelectedSkillFields({
                icon: normalizedIconId,
                metadata: nextMetadata,
              });
              setSkillSaveState({ isSaving: false, error: "" });
              return true;
            } catch (error) {
              updateSelectedSkillLocal((current) => ({
                ...current,
                icon: previousSkill.icon,
                metadata: previousMetadata,
              }));
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save skill icon.",
              });
              return false;
            }
          }

          function getSelectedSkillDeploymentRegion(metadata = selectedSkill?.metadata) {
            const normalizedMetadata = metadata
              && typeof metadata === "object"
              && !Array.isArray(metadata)
              ? metadata
              : {};
            return String(
              normalizedMetadata.deploymentRegion
              || normalizedMetadata.region
              || normalizedMetadata.location
              || "europe-west1"
            ).trim() || "europe-west1";
          }

          function getSelectedSkillOwnerIdentity(skill = selectedSkill) {
            const metadata = skill?.metadata
              && typeof skill.metadata === "object"
              && !Array.isArray(skill.metadata)
              ? skill.metadata
              : {};
            const nestedOwner = metadata.owner
              && typeof metadata.owner === "object"
              && !Array.isArray(metadata.owner)
              ? metadata.owner
              : {};
            const ownerId = String(
              skill?.ownerId
              || nestedOwner.id
              || nestedOwner.userId
              || metadata.ownerId
              || ""
            ).trim();
            const normalizedOwnerId = ownerId.toLowerCase();
            const currentIdentityIds = [
              String(currentUserId || "").trim().toLowerCase(),
              String(currentUserEmail || "").trim().toLowerCase(),
            ].filter(Boolean);
            const creatorId = String(skill?.creatorId || "").trim().toLowerCase();
            const ownerIsCreator = Boolean(
              normalizedOwnerId
              && creatorId
              && normalizedOwnerId === creatorId
            );
            const ownerIsCurrentUser = !normalizedOwnerId
              || currentIdentityIds.includes(normalizedOwnerId);
            const explicitOwnerName = readSkillCreatorString([nestedOwner, metadata], [
              "name",
              "displayName",
              "display_name",
              "ownerName",
              "owner_name",
            ]);
            const explicitOwnerAvatarUrl = readSkillCreatorString([nestedOwner, metadata], [
              "avatarUrl",
              "avatar_url",
              "photoUrl",
              "photoURL",
              "ownerAvatarUrl",
              "owner_avatar_url",
            ]);

            if (skill?.isSystem) {
              return {
                id: ownerId || "computer-agents",
                name: "Computer Agents",
                avatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
              };
            }
            if (ownerIsCreator) {
              return {
                id: ownerId || skill?.creatorId || "",
                name: explicitOwnerName || skill?.creatorName || ownerId || "Owner",
                avatarUrl: explicitOwnerAvatarUrl || skill?.creatorAvatarUrl || "",
              };
            }
            if (ownerIsCurrentUser) {
              return {
                id: ownerId || currentUserId || currentUserEmail || "",
                name: explicitOwnerName || currentUserName || currentUserEmail || "You",
                avatarUrl: explicitOwnerAvatarUrl || currentUserAvatarUrl || "",
              };
            }
            return {
              id: ownerId,
              name: explicitOwnerName || ownerId || "Owner",
              avatarUrl: explicitOwnerAvatarUrl,
            };
          }

          function renderSkillDetailIdentityValue(identity) {
            const label = String(identity?.name || identity?.id || "Unknown").trim() || "Unknown";
            return React.createElement("span", {
                className: "playground-team-member-cell skill-detail-page__identity-value",
              },
              React.createElement(AccountAvatar, {
                className: "playground-team-member-avatar",
                imageClassName: "playground-team-member-avatar-image",
                fallbackLabel: getAccountInitials(label),
                photoUrl: String(identity?.avatarUrl || ""),
              }),
              React.createElement("span", { className: "playground-team-member-copy" },
                React.createElement("span", {
                  className: "playground-team-table-title",
                  title: label,
                }, label)
              )
            );
          }

          function renderSkillDetailSidebarValue(value, className = "") {
            return React.createElement("span", {
              className: "playground-environments-editor-fact-value" + (className ? " " + className : ""),
              title: String(value || ""),
            }, value || "Not set");
          }

          function renderSkillDetailSidebarRow(label, valueNode, options = {}) {
            return React.createElement("div", {
                key: label,
                className: "playground-project-overview-sidebar-row"
                  + (options.className ? " " + options.className : ""),
              },
              React.createElement("div", {
                className: "playground-project-overview-sidebar-row-label",
              }, label),
              React.createElement("div", {
                className: "playground-project-overview-sidebar-row-value"
                  + (options.valueClassName ? " " + options.valueClassName : ""),
              }, valueNode)
            );
          }

          function renderSkillIdentitySection(skillResourceMetadata) {
            return React.createElement("section", {
                className: "skill-detail-page__identity",
                "aria-label": "Skill identity",
              },
              React.createElement(ProjectIconPicker, {
                projectName: selectedSkill.name || "Skill",
                icon: getPlaygroundSkillIconId(selectedSkill.icon),
                color: getSelectedSkillIconColor(skillResourceMetadata),
                iconOptions: PLAYGROUND_SKILL_ICON_OPTIONS,
                colorOptions: ["#ffffff", ...PLAYGROUND_PROJECT_ACCENT_COLORS],
                showProjectName: false,
                disabled: !selectedSkill.isCustom,
                onChange: handleSelectedSkillIdentityChange,
                className: "skill-detail-page__icon-picker",
                resourceLabel: "skill",
              }),
              React.createElement("div", {
                  className: "skill-detail-page__identity-copy",
                },
                React.createElement("input", {
                  type: "text",
                  ref: skillTitleInputRef,
                  className: "skill-detail-page__name-input",
                  value: skillTitleDraft,
                  onChange: (event) => setSkillTitleDraft(event.target.value),
                  onBlur: handleSelectedSkillTitleCommit,
                  placeholder: selectedSkill.isDraft ? "new-skill" : undefined,
                  readOnly: !selectedSkill.isCustom,
                  "aria-label": "Skill name",
                }),
                React.createElement("input", {
                  type: "text",
                  className: "file-resource-detail-page__description-input skill-detail-page__description-input",
                  value: selectedSkill.description || "",
                  onChange: selectedSkill.isCustom
                    ? (event) => updateSelectedSkillLocal((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    : undefined,
                  onBlur: selectedSkill.isCustom
                    ? (event) => void saveSelectedSkillFields({
                        description: event.target.value,
                      })
                    : undefined,
                  readOnly: !selectedSkill.isCustom,
                  placeholder: "Describe when agents should use this skill.",
                  "aria-label": "Skill description",
                })
              )
            );
          }

          function renderSkillSettingsComposition(accessSettings, skillResourceMetadata) {
            const deploymentRegion = getSelectedSkillDeploymentRegion(skillResourceMetadata);
            const creatorIdentity = {
              id: selectedSkill.creatorId || "",
              name: selectedSkill.creatorName || "Unknown",
              avatarUrl: selectedSkill.creatorAvatarUrl || "",
            };
            const ownerIdentity = getSelectedSkillOwnerIdentity(selectedSkill);
            const settingsContent = React.createElement("div", {
                className: "playground-server-detail-content skill-detail-page__settings-content",
              },
              React.createElement("div", {
                  className: "playground-server-settings-tab is-function-settings-tab skill-detail-page__settings",
                },
                React.createElement(PlatformDeploymentMap, {
                  regionCode: deploymentRegion,
                  title: "Deployment region",
                  className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map skill-detail-page__deployment-map",
                }),
                accessSettings
              )
            );
            const settingsSidebar = React.createElement(PlatformUiCard, {
                as: "section",
                variant: "sidebar",
                cardTitle: undefined,
                className: "playground-project-overview-sidebar-card playground-server-detail-properties-card skill-detail-page__properties-card",
              },
              React.createElement("div", {
                  className: "playground-project-overview-sidebar-rows",
                },
                renderSkillDetailSidebarRow("Status",
                  React.createElement(PlatformLabel, {
                    variant: selectedSkill.isActive === false ? "gray" : "green",
                  }, selectedSkill.isActive === false ? "Inactive" : "Active")
                ),
                renderSkillDetailSidebarRow("Region",
                  renderSkillDetailSidebarValue(deploymentRegion)
                ),
                renderSkillDetailSidebarRow("Creator",
                  renderSkillDetailIdentityValue(creatorIdentity),
                  { valueClassName: "playground-server-detail-sidebar-identity-cell" }
                ),
                renderSkillDetailSidebarRow("Created",
                  renderSkillDetailSidebarValue(formatPlaygroundFileDate(selectedSkill.createdAt))
                ),
                renderSkillDetailSidebarRow("Updated",
                  renderSkillDetailSidebarValue(formatPlaygroundFileDate(selectedSkill.updatedAt))
                ),
                renderSkillDetailSidebarRow("Owner",
                  renderSkillDetailIdentityValue(ownerIdentity),
                  {
                    className: "playground-server-detail-sidebar-owner-row",
                    valueClassName: "playground-server-detail-sidebar-owner-cell",
                  }
                )
              )
            );
            return {
              content: settingsContent,
              sidebar: settingsSidebar,
            };
          }
