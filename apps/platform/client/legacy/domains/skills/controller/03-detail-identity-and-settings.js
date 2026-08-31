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

          function getSelectedSkillGithubRepository(metadata = selectedSkill?.metadata) {
            const normalizedMetadata = metadata
              && typeof metadata === "object"
              && !Array.isArray(metadata)
              ? metadata
              : {};
            const connector = normalizedMetadata.skillGithubConnector
              && typeof normalizedMetadata.skillGithubConnector === "object"
              && !Array.isArray(normalizedMetadata.skillGithubConnector)
              ? normalizedMetadata.skillGithubConnector
              : {};
            return connector.repository
              && typeof connector.repository === "object"
              && !Array.isArray(connector.repository)
              ? connector.repository
              : null;
          }

          async function updateSelectedSkillGithubConnector(repository) {
            if (!selectedSkill?.id || !selectedSkill.isCustom || selectedSkill.isDraft) {
              throw new Error("Save this Skill before configuring its GitHub connector.");
            }
            const previousMetadata = selectedSkill.metadata
              && typeof selectedSkill.metadata === "object"
              && !Array.isArray(selectedSkill.metadata)
              ? selectedSkill.metadata
              : {};
            const normalizedRepository = repository && typeof repository === "object"
              ? {
                  id: String(repository.id || "").trim(),
                  name: String(repository.name || "").trim(),
                  repoFullName: String(repository.repoFullName || "").trim(),
                  ref: String(repository.ref || "main").trim() || "main",
                  accountId: String(repository.accountId || "").trim(),
                  branchPrefix: String(repository.branchPrefix ?? "computer-agents/").trim(),
                  createPullRequests: repository.createPullRequests !== false,
                  forcePushCommits: repository.forcePushCommits === true,
                }
              : null;
            if (normalizedRepository && !/^[^/\s]+\/[^/\s]+$/.test(normalizedRepository.repoFullName)) {
              throw new Error("Choose a valid GitHub repository.");
            }
            const nextMetadata = { ...previousMetadata };
            if (normalizedRepository) {
              nextMetadata.skillGithubConnector = {
                schemaVersion: "1",
                repository: normalizedRepository,
              };
            } else {
              delete nextMetadata.skillGithubConnector;
            }
            updateSelectedSkillLocal((current) => ({ ...current, metadata: nextMetadata }));
            setSkillSaveState({ isSaving: true, error: "" });
            try {
              const savedSkill = await patchSelectedSkillFields({ metadata: nextMetadata });
              setSkillSaveState({ isSaving: false, error: "" });
              return savedSkill;
            } catch (error) {
              updateSelectedSkillLocal((current) => ({ ...current, metadata: previousMetadata }));
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save the Skill connector.",
              });
              throw error;
            }
          }

          async function createSelectedSkillGithubRepository(options = {}) {
            if (!selectedSkill?.id || !selectedSkill.isCustom || selectedSkill.isDraft) {
              throw new Error("Save this Skill before creating its GitHub repository.");
            }
            const createRepository = github?.createRepository;
            if (typeof createRepository !== "function") {
              throw new Error("GitHub repository creation is unavailable. Reconnect GitHub and try again.");
            }
            const snapshot = buildCurrentSkillVersionSnapshot(selectedSkill);
            const normalizedFiles = normalizeSkillCodeFiles(snapshot.codeFiles);
            const filesByPath = new Map();
            normalizedFiles.forEach((file) => {
              const filePath = normalizeHistoryPath(file.name);
              if (!filePath) return;
              filesByPath.set(filePath, {
                path: filePath,
                content: filePath.toLowerCase() === "skill.md"
                  ? String(snapshot.markdown || file.content || "")
                  : String(file.content || ""),
              });
            });
            if (![...filesByPath.keys()].some((filePath) => filePath.toLowerCase() === "skill.md")) {
              filesByPath.set("SKILL.md", {
                path: "SKILL.md",
                content: String(snapshot.markdown || ""),
              });
            }
            filesByPath.set(".computer-agents/resource.json", {
              path: ".computer-agents/resource.json",
              content: JSON.stringify({
                schemaVersion: 1,
                provider: "computer-agents",
                resourceKind: "skill",
                resourceId: String(selectedSkill.id),
                name: selectedSkill.name,
                description: selectedSkill.description,
                icon: selectedSkill.icon,
                category: selectedSkill.category,
              }, null, 2) + "\n",
            });
            const resourceName = String(options?.name || selectedSkill.name || "Computer Agents Skill").trim();
            const createdRepository = await createRepository({
              name: resourceName,
              description: String(selectedSkill.description || "").trim()
                || "Source for the " + resourceName + " Computer Agents Skill.",
              resourceId: String(selectedSkill.id || "").trim(),
              resourceKind: "skill",
              skillId: String(selectedSkill.id || "").trim(),
              private: true,
              commitMessage: "Initialize " + resourceName + " Skill source",
              files: Array.from(filesByPath.values()),
            }, {
              accountId: String(options?.accountId || "").trim() || undefined,
            });
            return {
              id: String(createdRepository?.id || "").trim(),
              name: String(createdRepository?.name || "").trim(),
              repoFullName: String(createdRepository?.repoFullName || "").trim(),
              ref: String(createdRepository?.ref || "main").trim() || "main",
              accountId: String(options?.accountId || "").trim(),
              branchPrefix: "computer-agents/",
              createPullRequests: true,
              forcePushCommits: false,
            };
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
            return React.createElement(PlatformFileResourceIdentity, {
              className: "skill-detail-page__identity",
              ariaLabel: "Skill identity",
              icon: React.createElement(ProjectIconPicker, {
                projectName: selectedSkill.name || "Skill",
                icon: getPlaygroundSkillIconId(selectedSkill.icon),
                color: getSelectedSkillIconColor(skillResourceMetadata),
                iconOptions: PLAYGROUND_SKILL_ICON_OPTIONS,
                colorOptions: ["#ffffff", ...PLAYGROUND_PROJECT_ACCENT_COLORS],
                showProjectName: false,
                disabled: !selectedSkill.isCustom,
                onChange: handleSelectedSkillIdentityChange,
                resourceLabel: "skill",
              }),
              title: skillTitleDraft,
              description: selectedSkill.description || "",
              onTitleChange: selectedSkill.isCustom ? setSkillTitleDraft : undefined,
              onTitleBlur: selectedSkill.isCustom ? handleSelectedSkillTitleCommit : undefined,
              onDescriptionChange: selectedSkill.isCustom
                ? (value) => updateSelectedSkillLocal((current) => ({
                    ...current,
                    description: value,
                  }))
                : undefined,
              onDescriptionBlur: selectedSkill.isCustom
                ? (value) => void saveSelectedSkillFields({ description: value })
                : undefined,
              titleRef: skillTitleInputRef,
              titlePlaceholder: selectedSkill.isDraft ? "new-skill" : undefined,
              descriptionPlaceholder: "Describe when agents should use this skill.",
              titleAriaLabel: "Skill name",
              descriptionAriaLabel: "Skill description",
              readOnly: !selectedSkill.isCustom,
            });
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
            const skillGithubRepository = getSelectedSkillGithubRepository(skillResourceMetadata);
            const skillConnectorsSection = selectedSkill.isCustom
              ? React.createElement(RunnerSourceGithubConnectorSettings, {
                  resourceId: String(selectedSkill.id || "").trim(),
                  resourceKind: "skill",
                  resourceName: String(selectedSkill.name || "").trim(),
                  repository: skillGithubRepository,
                  github,
                  apiBaseUrl: backendUrl,
                  requestHeaders,
                  automationEnvironmentId: String(skillEnvironmentSelectionId || "").trim(),
                  automationAgentOptions: (Array.isArray(agents) ? agents : [])
                    .filter((agent) => agent?.id)
                    .map((agent) => ({
                      id: String(agent.id),
                      label: String(agent.name || agent.displayName || agent.id),
                    })),
                  disabled: selectedSkill.isDraft || skillSaveState.isSaving,
                  onCreateRepository: createSelectedSkillGithubRepository,
                  onRepositoryChange: updateSelectedSkillGithubConnector,
                })
              : null;
            return {
              ariaLabel: "Skill settings",
              className: "skill-detail-page__settings-content skill-detail-page__settings",
              identity: {
                icon: React.createElement(ProjectIconPicker, {
                  projectName: selectedSkill.name || "Skill",
                  icon: getPlaygroundSkillIconId(selectedSkill.icon),
                  color: getSelectedSkillIconColor(skillResourceMetadata),
                  iconOptions: PLAYGROUND_SKILL_ICON_OPTIONS,
                  colorOptions: ["#ffffff", ...PLAYGROUND_PROJECT_ACCENT_COLORS],
                  showProjectName: false,
                  disabled: !selectedSkill.isCustom,
                  onChange: handleSelectedSkillIdentityChange,
                  resourceLabel: "skill",
                }),
                iconAriaHidden: false,
                iconClassName: "file-resource-identity__icon",
                title: skillTitleDraft,
                description: String(selectedSkill.description || ""),
                onTitleChange: selectedSkill.isCustom ? setSkillTitleDraft : undefined,
                onTitleBlur: selectedSkill.isCustom ? handleSelectedSkillTitleCommit : undefined,
                onDescriptionChange: selectedSkill.isCustom
                  ? (value) => updateSelectedSkillLocal((current) => ({ ...current, description: value }))
                  : undefined,
                onDescriptionBlur: selectedSkill.isCustom
                  ? (value) => void saveSelectedSkillFields({ description: value })
                  : undefined,
                titleRef: skillTitleInputRef,
                titlePlaceholder: selectedSkill.isDraft ? "new-skill" : "Skill",
                descriptionPlaceholder: "Describe when agents should use this skill.",
                titleAriaLabel: "Skill name",
                descriptionAriaLabel: "Skill description",
                readOnly: !selectedSkill.isCustom,
              },
              details: {
                variant: "standard",
                updatedAt: selectedSkill.isCustom
                  ? selectedSkill.updatedAt || selectedSkill.createdAt || null
                  : null,
                creator: {
                  value: String(creatorIdentity.value || creatorIdentity.id || creatorIdentity.email || "skill-creator"),
                  name: String(creatorIdentity.name || creatorIdentity.email || "Unknown user"),
                  email: String(creatorIdentity.email || ""),
                  avatarUrl: String(creatorIdentity.avatarUrl || ""),
                },
                owner: {
                  value: String(ownerIdentity.value || ownerIdentity.id || ownerIdentity.email || "skill-owner"),
                  name: String(ownerIdentity.name || ownerIdentity.email || "Unknown user"),
                  email: String(ownerIdentity.email || ""),
                  avatarUrl: String(ownerIdentity.avatarUrl || ""),
                },
                ownerOptions,
                onOwnerTransfer: selectedSkill.isCustom ? transferSelectedSkillOwner : undefined,
                ownerSelectorProps: {
                  open: skillOwnerSelectorOpen,
                  onOpenChange: handleSkillOwnerSelectorOpenChange,
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
                  title: hasSelectedSkillVersionChanges()
                    ? "Save skill changes before changing the owner."
                    : undefined,
                },
                scope: false,
                primaryActions: [{
                  id: "test-skill",
                  label: "Test Skill",
                  onSelect: typeof onTestSkill === "function"
                    ? () => onTestSkill(selectedSkill)
                    : undefined,
                  disabled: selectedSkill.isDraft || typeof onTestSkill !== "function",
                  title: selectedSkill.isDraft ? "Save this skill before testing it." : undefined,
                }],
                className: "skill-detail-page__properties-card",
              },
              location: React.createElement(PlatformDeploymentMap, {
                regionCode: deploymentRegion,
                title: "Deployment region",
                className: "playground-managed-server-deployment-map playground-source-server-deployment-map playground-function-deployment-map skill-detail-page__deployment-map",
              }),
              connectors: skillConnectorsSection,
              access: accessSettings,
              accessDetailOpen: accessDetailFocused,
              detailsSidebarAriaLabel: "Skill properties",
              detailsSidebarClassName: "skill-detail-page__sidebar",
            };
          }
