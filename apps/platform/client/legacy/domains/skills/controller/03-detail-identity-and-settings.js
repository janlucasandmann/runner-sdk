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

          function normalizeSkillOwnerIdentity(value, fallback = {}) {
            const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
            const nested = [source.user, source.profile, source.account, source.member, source.identity]
              .find((candidate) => candidate && typeof candidate === "object" && !Array.isArray(candidate)) || {};
            const read = (...keys) => {
              for (const key of keys) {
                const direct = String(source[key] || "").trim();
                if (direct) return direct;
                const nestedValue = String(nested[key] || "").trim();
                if (nestedValue) return nestedValue;
              }
              return "";
            };
            const fallbackSource = fallback && typeof fallback === "object" ? fallback : {};
            const valueId = read("userId", "user_id", "uid", "id", "memberId", "member_id");
            const email = read("email", "emailAddress", "email_address", "mail").toLowerCase();
            const fallbackValue = String(
              fallbackSource.value
              || fallbackSource.userId
              || fallbackSource.id
              || fallbackSource.email
              || ""
            ).trim();
            const valueKey = valueId || email || fallbackValue || "skill-owner";
            const explicitName = read(
              "name",
              "displayName",
              "display_name",
              "fullName",
              "full_name",
              "username",
              "userName"
            );
            const fallbackName = String(
              fallbackSource.name || currentUserName || currentUserEmail || "Unknown user"
            ).trim() || "Unknown user";
            const fallbackKeys = [
              fallbackSource.value,
              fallbackSource.id,
              fallbackSource.userId,
              fallbackSource.email,
            ]
              .map((entry) => String(entry || "").trim().toLowerCase())
              .filter(Boolean);
            const isFallbackIdentity = !valueId
              || fallbackKeys.includes(valueId.toLowerCase())
              || fallbackKeys.includes(email);
            const name = explicitName && !["you", "me", "current user"].includes(explicitName.toLowerCase())
              ? explicitName
              : isFallbackIdentity
                ? fallbackName
                : email || valueId || "Unknown user";
            return {
              value: valueKey,
              id: valueId || valueKey,
              userId: read("userId", "user_id", "uid") || valueId || valueKey,
              name,
              email: email || String(fallbackSource.email || "").trim().toLowerCase(),
              avatarUrl: read(
                "avatarUrl",
                "avatar_url",
                "photoUrl",
                "photoURL",
                "picture",
                "imageUrl",
                "imageURL"
              ) || String(fallbackSource.avatarUrl || "").trim(),
            };
          }

          function getSelectedSkillCreatorIdentity(skill = selectedSkill) {
            const metadata = skill?.metadata
              && typeof skill.metadata === "object"
              && !Array.isArray(skill.metadata)
              ? skill.metadata
              : {};
            const nestedCreator = metadata.creator
              && typeof metadata.creator === "object"
              && !Array.isArray(metadata.creator)
              ? metadata.creator
              : {};
            if (skill?.isSystem) {
              return {
                value: "computer-agents",
                id: "computer-agents",
                userId: "computer-agents",
                name: "Computer Agents",
                email: "",
                avatarUrl: COMPUTER_AGENTS_CREATOR_PROFILE_URL,
              };
            }
            return normalizeSkillOwnerIdentity({
              ...nestedCreator,
              id: skill?.creatorId || nestedCreator.id,
              userId: skill?.creatorId || nestedCreator.userId,
              name: skill?.creatorName || nestedCreator.name,
              email: skill?.creatorEmail || nestedCreator.email,
              avatarUrl: skill?.creatorAvatarUrl || nestedCreator.avatarUrl,
            }, {
              value: currentUserId || currentUserEmail,
              id: currentUserId,
              userId: currentUserId,
              name: currentUserName,
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            });
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
            const explicitOwnerName = readSkillCreatorString([nestedOwner], [
              "name",
              "displayName",
              "display_name",
            ]) || readSkillCreatorString([skill, metadata], [
              "ownerName",
              "owner_name",
            ]);
            const explicitOwnerAvatarUrl = readSkillCreatorString([nestedOwner], [
              "avatarUrl",
              "avatar_url",
              "photoUrl",
              "photoURL",
            ]) || readSkillCreatorString([skill, metadata], [
              "ownerAvatarUrl",
              "owner_avatar_url",
            ]);

            const creatorIdentity = getSelectedSkillCreatorIdentity(skill);
            if (skill?.isSystem) return creatorIdentity;
            const currentUserIdentity = normalizeSkillOwnerIdentity({
              id: currentUserId,
              userId: currentUserId,
              name: currentUserName,
              email: currentUserEmail,
              avatarUrl: currentUserAvatarUrl,
            }, creatorIdentity);
            const fallbackOwnerIdentity = ownerIsCreator
              ? creatorIdentity
              : ownerIsCurrentUser
                ? currentUserIdentity
                : creatorIdentity;
            const explicitOwnerEmail = readSkillCreatorString([nestedOwner], [
              "email",
              "emailAddress",
              "email_address",
            ]) || readSkillCreatorString([skill, metadata], ["ownerEmail", "owner_email"]);
            return normalizeSkillOwnerIdentity({
              ...nestedOwner,
              id: ownerId,
              userId: nestedOwner.userId || ownerId,
              name: explicitOwnerName
                || (ownerIsCreator ? creatorIdentity.name : "")
                || (ownerIsCurrentUser ? currentUserName || currentUserEmail : "")
                || ownerId,
              email: explicitOwnerEmail
                || (ownerIsCreator ? creatorIdentity.email : "")
                || (ownerIsCurrentUser ? currentUserEmail : ""),
              avatarUrl: explicitOwnerAvatarUrl
                || (ownerIsCreator ? creatorIdentity.avatarUrl : "")
                || (ownerIsCurrentUser ? currentUserAvatarUrl : ""),
            }, fallbackOwnerIdentity);
          }

          function getSkillOwnerCandidateRecords(payload) {
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload?.data)) return payload.data;
            if (Array.isArray(payload?.members)) return payload.members;
            if (Array.isArray(payload?.organizationMembers)) return payload.organizationMembers;
            if (Array.isArray(payload?.organization_members)) return payload.organization_members;
            return [];
          }

          async function loadSkillOwnerCandidates() {
            if (
              !selectedSkill?.id
              || selectedSkill.isDraft
              || !selectedSkill.isCustom
              || skillOwnerCandidatesRequestRef.current
            ) {
              return;
            }
            const skillId = String(selectedSkill.id);
            skillOwnerCandidatesRequestRef.current = true;
            setSkillOwnerCandidateState((current) => ({
              skillId,
              status: "loading",
              candidates: current.skillId === skillId ? current.candidates : [],
            }));
            try {
              const organizationId = String(activeOrganizationId || "").trim();
              let payload = [];
              if (organizationId) {
                const response = await fetch(
                  "/api/real/organizations/" + encodeURIComponent(organizationId)
                    + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account",
                  {
                    method: "GET",
                    credentials: "same-origin",
                    headers: {
                      Accept: "application/json",
                      ...(requestHeaders && typeof requestHeaders === "object" ? requestHeaders : {}),
                    },
                  }
                );
                payload = await response.json().catch(() => ({}));
                if (!response.ok) {
                  throw new Error(payload?.message || payload?.error || "Failed to load organization members.");
                }
              }
              const byKey = new Map();
              [getSelectedSkillCreatorIdentity(selectedSkill), getSelectedSkillOwnerIdentity(selectedSkill)]
                .concat(getSkillOwnerCandidateRecords(payload).map((candidate) => (
                  normalizeSkillOwnerIdentity(candidate, {
                    value: currentUserId || currentUserEmail,
                    id: currentUserId,
                    userId: currentUserId,
                    name: currentUserName,
                    email: currentUserEmail,
                    avatarUrl: currentUserAvatarUrl,
                  })
                )))
                .forEach((candidate) => {
                  const key = String(candidate?.value || candidate?.email || candidate?.id || "")
                    .trim()
                    .toLowerCase();
                  if (key && !byKey.has(key)) byKey.set(key, candidate);
                });
              setSkillOwnerCandidateState({
                skillId,
                status: "ready",
                candidates: Array.from(byKey.values()),
              });
            } catch {
              setSkillOwnerCandidateState({
                skillId,
                status: "ready",
                candidates: [getSelectedSkillOwnerIdentity(selectedSkill)],
              });
            } finally {
              skillOwnerCandidatesRequestRef.current = false;
            }
          }

          function handleSkillOwnerSelectorOpenChange(nextOpen) {
            if (
              nextOpen
              && (
                selectedSkill?.isDraft
                || !selectedSkill?.isCustom
                || skillSaveState.isSaving
                || hasSelectedSkillVersionChanges()
              )
            ) {
              return;
            }
            setSkillOwnerSelectorOpen(Boolean(nextOpen));
            if (nextOpen) void loadSkillOwnerCandidates();
          }

          async function transferSelectedSkillOwner(nextValue, option) {
            if (
              !selectedSkill?.id
              || selectedSkill.isDraft
              || !selectedSkill.isCustom
              || skillSaveState.isSaving
              || hasSelectedSkillVersionChanges()
            ) {
              return;
            }
            const nextOwner = normalizeSkillOwnerIdentity({
              ...(option?.data?.identity || option || {}),
              id: option?.data?.identity?.id || option?.id || nextValue,
              userId: option?.data?.identity?.userId || option?.userId || nextValue,
            }, getSelectedSkillOwnerIdentity(selectedSkill));
            const currentMetadata = selectedSkill.metadata
              && typeof selectedSkill.metadata === "object"
              && !Array.isArray(selectedSkill.metadata)
              ? selectedSkill.metadata
              : {};
            const nextMetadata = {
              ...currentMetadata,
              owner: {
                id: nextOwner.id,
                userId: nextOwner.userId,
                name: nextOwner.name,
                email: nextOwner.email,
                avatarUrl: nextOwner.avatarUrl,
              },
              ownerId: nextOwner.id,
              ownerUserId: nextOwner.userId,
              ownerName: nextOwner.name,
              ownerEmail: nextOwner.email,
              ownerAvatarUrl: nextOwner.avatarUrl,
            };
            setSkillSaveState({ isSaving: true, error: "" });
            try {
              await patchSelectedSkillFields({ metadata: nextMetadata });
              setSkillSaveState({ isSaving: false, error: "" });
              setSkillOwnerSelectorOpen(false);
              setSkillOwnerCandidateState((current) => ({
                ...current,
                candidates: current.candidates.some((candidate) => candidate.value === nextOwner.value)
                  ? current.candidates
                  : [nextOwner, ...current.candidates],
              }));
            } catch (error) {
              const normalizedError = error instanceof Error
                ? error
                : new Error("Failed to change the skill owner.");
              setSkillSaveState({ isSaving: false, error: normalizedError.message });
              throw normalizedError;
            }
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

          function renderSkillSettingsComposition(
            accessSettings,
            skillResourceMetadata,
            accessDetailFocused = false
          ) {
            const deploymentRegion = getSelectedSkillDeploymentRegion(skillResourceMetadata);
            const creatorIdentity = getSelectedSkillCreatorIdentity(selectedSkill);
            const ownerIdentity = getSelectedSkillOwnerIdentity(selectedSkill);
            const ownerCandidates = skillOwnerCandidateState.skillId === String(selectedSkill?.id || "")
              ? skillOwnerCandidateState.candidates
              : [ownerIdentity];
            const ownerOptionsByValue = new Map();
            [ownerIdentity, creatorIdentity, ...ownerCandidates].forEach((candidate) => {
              const value = String(candidate?.value || candidate?.id || candidate?.email || "").trim();
              const key = value.toLowerCase();
              if (!key || ownerOptionsByValue.has(key)) return;
              ownerOptionsByValue.set(key, {
                value,
                name: String(candidate?.name || candidate?.email || "Unknown user"),
                email: String(candidate?.email || ""),
                avatarUrl: String(candidate?.avatarUrl || ""),
                data: { identity: candidate },
              });
            });
            const ownerOptions = Array.from(ownerOptionsByValue.values());
            const ownerSelectionBlocked = Boolean(
              selectedSkill.isDraft
              || !selectedSkill.isCustom
              || skillSaveState.isSaving
              || hasSelectedSkillVersionChanges()
            );
            if (accessDetailFocused) {
              return {
                content: React.createElement("div", {
                    className: "skill-detail-page__settings-content skill-detail-page__settings skill-detail-page__access-detail-view",
                  },
                  accessSettings
                ),
                sidebar: null,
              };
            }
            const settingsContent = React.createElement("div", {
                className: "skill-detail-page__settings-content skill-detail-page__settings",
              },
              React.createElement(PlatformDeploymentMap, {
                regionCode: deploymentRegion,
                title: "Deployment region",
                className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map skill-detail-page__deployment-map",
              }),
              accessSettings
            );
            const settingsSidebar = React.createElement(PlatformServiceDetailPropertyList, null,
              React.createElement(PlatformServiceDetailProperty, {
                label: "Status",
              },
                React.createElement(PlatformLabel, {
                  variant: selectedSkill.isActive === false ? "gray" : "green",
                }, selectedSkill.isActive === false ? "Inactive" : "Active")
              ),
              React.createElement(PlatformServiceDetailProperty, {
                label: "Creator",
                className: "skill-detail-page__creator-row",
                title: creatorIdentity.email || creatorIdentity.name || creatorIdentity.id || "Unknown",
              }, renderSkillDetailIdentityValue(creatorIdentity)),
              React.createElement(PlatformServiceDetailProperty, {
                label: "Created",
                title: formatPlaygroundFileDate(selectedSkill.createdAt),
              }, formatPlaygroundFileDate(selectedSkill.createdAt)),
              React.createElement(PlatformServiceDetailProperty, {
                label: "Updated",
                title: formatPlaygroundFileDate(selectedSkill.updatedAt),
              }, formatPlaygroundFileDate(selectedSkill.updatedAt)),
              React.createElement(PlatformServiceDetailProperty, {
                label: "Owner",
                className: "skill-detail-page__owner-row",
                title: ownerIdentity.email || ownerIdentity.name || ownerIdentity.id || "Unknown",
              },
                React.createElement(PlatformOwnerSelector, {
                  owner: {
                    value: String(ownerIdentity.value || ownerIdentity.id || ownerIdentity.email || "skill-owner"),
                    name: String(ownerIdentity.name || ownerIdentity.email || "Unknown user"),
                    email: String(ownerIdentity.email || ""),
                    avatarUrl: String(ownerIdentity.avatarUrl || ""),
                  },
                  options: ownerOptions,
                  open: skillOwnerSelectorOpen,
                  onOpenChange: handleSkillOwnerSelectorOpenChange,
                  onTransfer: transferSelectedSkillOwner,
                  ariaLabel: "Choose skill owner",
                  resourceLabel: "skill",
                  alignment: "end",
                  popupAlignment: "right",
                  fullWidth: true,
                  disabled: ownerSelectionBlocked,
                  loading: skillOwnerCandidateState.skillId === String(selectedSkill?.id || "")
                    && skillOwnerCandidateState.status === "loading",
                  loadingContent: "Loading organization members...",
                  emptyContent: "No organization members are available.",
                  popupWidth: 260,
                  popupMaxHeight: "min(320px, calc(100vh - 180px))",
                  className: "skill-detail-page__owner-selector",
                  triggerClassName: "skill-detail-page__owner-trigger",
                  popupClassName: "skill-detail-page__owner-menu",
                  optionClassName: "skill-detail-page__owner-option",
                  title: hasSelectedSkillVersionChanges()
                    ? "Save skill changes before changing the owner."
                    : undefined,
                })
              ),
              React.createElement(PlatformPrimaryButton, {
                type: "button",
                size: "small",
                fullWidth: true,
                className: "skill-detail-page__test-skill-button",
                disabled: selectedSkill.isDraft || typeof onTestSkill !== "function",
                title: selectedSkill.isDraft ? "Save this skill before testing it." : undefined,
                onClick: () => onTestSkill?.(selectedSkill),
              }, "Test Skill")
            );
            return {
              content: settingsContent,
              sidebar: settingsSidebar,
            };
          }
