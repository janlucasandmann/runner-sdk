export const PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT = String.raw`
          async function persistProjectOverviewSidebarProjectUpdate(projectUpdates = {}, metadataUpdates = {}) {
            const baseProject = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const normalizedProjectId = String(baseProject.id || normalizedSelectedProjectId || "").trim();
            if (!normalizedProjectId) {
              return null;
            }
            const baseMetadata = getProjectOverviewSidebarMetadata(baseProject);
            const nextMetadata = {
              ...baseMetadata,
              ...(metadataUpdates && typeof metadataUpdates === "object" ? metadataUpdates : {}),
            };
            const nextProjectRecord = normalizePlaygroundProjectRecord({
              ...baseProject,
              ...(projectUpdates && typeof projectUpdates === "object" ? projectUpdates : {}),
              metadata: nextMetadata,
              updatedAt: new Date().toISOString(),
            });
            commitProjectOverviewSidebarProjectRecord(nextProjectRecord);
            if (typeof setProjectSaveState === "function") {
              setProjectSaveState({ isSaving: true, error: "", message: "" });
            }
            try {
              const payload = buildPlaygroundProjectSavePayload(nextProjectRecord, metadataUpdates);
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(backendUrl + "/projects/" + encodeURIComponent(normalizedProjectId), {
                method: "PATCH",
                headers,
                body: JSON.stringify(payload),
              });
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to update project.");
              }
              const updatedProject = getPlaygroundProjectResponseRecord(data, nextProjectRecord);
              if (updatedProject?.id) {
                commitProjectOverviewSidebarProjectRecord(updatedProject);
              }
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({ isSaving: false, error: "", message: "Saved" });
              }
              return updatedProject || nextProjectRecord;
            } catch (error) {
              commitProjectOverviewSidebarProjectRecord(baseProject);
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to update project.",
                  message: "",
                });
              }
              return null;
            }
          }

          function updateProjectOverviewSidebarProjectProperty(projectUpdates = {}, metadataUpdates = {}) {
            if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
              setProjectOverviewSidebarPropertyPopover("");
            }
            void persistProjectOverviewSidebarProjectUpdate(projectUpdates, metadataUpdates);
          }

          function getProjectOverviewWallpaperOptions() {
            return typeof PLAYGROUND_PROJECT_WALLPAPER_OPTIONS !== "undefined" && Array.isArray(PLAYGROUND_PROJECT_WALLPAPER_OPTIONS)
              ? PLAYGROUND_PROJECT_WALLPAPER_OPTIONS
              : [];
          }

          function getProjectOverviewWallpaperId(projectRecord = projectOverviewDraft) {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            const fallbackId = wallpaperOptions[0]?.id || "";
            const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
              ? projectRecord.metadata
              : {};
            if (typeof getPlaygroundProjectWallpaperId === "function") {
              return getPlaygroundProjectWallpaperId(projectRecord?.wallpaperId || metadata.wallpaperId, fallbackId);
            }
            return String(projectRecord?.wallpaperId || metadata.wallpaperId || fallbackId || "").trim();
          }

          function getProjectOverviewWallpaperConfig(wallpaperId, projectRecord = projectOverviewDraft) {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            const fallback = wallpaperOptions[0] || { id: "", name: "Background", url: "" };
            if (typeof getPlaygroundProjectWallpaperConfig === "function") {
              return getPlaygroundProjectWallpaperConfig(wallpaperId || projectRecord, 0) || fallback;
            }
            const normalizedWallpaperId = String(wallpaperId || "").trim();
            return wallpaperOptions.find((option) => option.id === normalizedWallpaperId) || fallback;
          }

          function buildProjectOverviewWallpaperBackgroundImage(wallpaperId, projectRecord = projectOverviewDraft) {
            if (typeof buildProjectWallpaperBackgroundImage === "function") {
              return buildProjectWallpaperBackgroundImage(wallpaperId, projectRecord);
            }
            const wallpaper = getProjectOverviewWallpaperConfig(wallpaperId, projectRecord);
            return wallpaper?.url ? "url(" + wallpaper.url + ")" : "";
          }

          function commitProjectOverviewWallpaperDraft(wallpaperId, useCardBackgroundAsWallpaper = true) {
            const normalizedWallpaperId = getProjectOverviewWallpaperId({
              wallpaperId,
              metadata: { wallpaperId },
            });
            if (!normalizedWallpaperId || typeof setProjectDraft !== "function") {
              return;
            }
            setProjectDraft((current) => {
              if (!current || String(current.id || "") !== normalizedSelectedProjectId) {
                return current;
              }
              const currentMetadata = current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                ? current.metadata
                : {};
              return normalizePlaygroundProjectRecord({
                ...current,
                wallpaperId: normalizedWallpaperId,
                useCardBackgroundAsWallpaper,
                metadata: {
                  ...currentMetadata,
                  wallpaperId: normalizedWallpaperId,
                  useCardBackgroundAsWallpaper,
                },
              });
            });
          }

          async function handleProjectOverviewWallpaperStep(direction) {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            if (!wallpaperOptions.length || projectSaveState?.isSaving) {
              return;
            }
            const step = direction === "prev" ? -1 : 1;
            const baseProject = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const currentWallpaperId = getProjectOverviewWallpaperId(baseProject);
            const currentIndex = wallpaperOptions.findIndex((wallpaper) => wallpaper.id === currentWallpaperId);
            const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
            const nextIndex = (safeCurrentIndex + step + wallpaperOptions.length) % wallpaperOptions.length;
            const nextWallpaper = wallpaperOptions[nextIndex] || wallpaperOptions[0];
            if (!nextWallpaper?.id || nextWallpaper.id === currentWallpaperId) {
              return;
            }

            if (projectWallpaperTransitionTimerRef?.current) {
              window.clearTimeout(projectWallpaperTransitionTimerRef.current);
              projectWallpaperTransitionTimerRef.current = null;
            }

            if (typeof setProjectWallpaperTransition === "function") {
              setProjectWallpaperTransition({
                token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                direction: step > 0 ? "next" : "prev",
                from: buildProjectOverviewWallpaperBackgroundImage(currentWallpaperId, baseProject),
                to: buildProjectOverviewWallpaperBackgroundImage(nextWallpaper.id, baseProject),
                fromPreview: "url(" + (wallpaperOptions[safeCurrentIndex]?.url || wallpaperOptions[0]?.url || "") + ")",
                toPreview: "url(" + nextWallpaper.url + ")",
              });
              if (projectWallpaperTransitionTimerRef) {
                projectWallpaperTransitionTimerRef.current = window.setTimeout(() => {
                  setProjectWallpaperTransition(null);
                  projectWallpaperTransitionTimerRef.current = null;
                }, 380);
              }
            }

            if (projectDraftWallpaperIdRef) {
              projectDraftWallpaperIdRef.current = nextWallpaper.id;
            }
            if (projectDraftUseCardBackgroundAsWallpaperRef) {
              projectDraftUseCardBackgroundAsWallpaperRef.current = true;
            }
            commitProjectOverviewWallpaperDraft(nextWallpaper.id, true);

            const updatedProject = await persistProjectOverviewSidebarProjectUpdate({
              wallpaperId: nextWallpaper.id,
              useCardBackgroundAsWallpaper: true,
            }, {
              wallpaperId: nextWallpaper.id,
              useCardBackgroundAsWallpaper: true,
            });
            if (!updatedProject) {
              commitProjectOverviewWallpaperDraft(currentWallpaperId, baseProject.useCardBackgroundAsWallpaper !== false);
            }
          }

          function renderProjectOverviewWallpaperSettingsSection() {
            const wallpaperOptions = getProjectOverviewWallpaperOptions();
            if (!wallpaperOptions.length) {
              return null;
            }
            const currentWallpaperId = getProjectOverviewWallpaperId(projectOverviewDraft);
            const currentWallpaper = getProjectOverviewWallpaperConfig(currentWallpaperId, projectOverviewDraft);
            const previewBackgroundImage = currentWallpaper?.url ? "url(" + currentWallpaper.url + ")" : undefined;
            const isPreviewTransitioning = projectWallpaperTransition
              && typeof projectWallpaperTransition.fromPreview === "string"
              && typeof projectWallpaperTransition.toPreview === "string";
            return React.createElement("section", { className: "playground-project-settings-section playground-project-settings-wallpaper-section" },
              React.createElement("div", { className: "playground-project-overview-strategy-add-row playground-project-overview-rules-inline-title-row" },
                React.createElement("h2", { className: "playground-project-overview-strategy-add-title" }, "Background")
              ),
              React.createElement("div", { className: "playground-tasks-project-wallpaper-picker" },
                React.createElement("div", {
                    className: "playground-tasks-project-wallpaper-picker-preview" + (isPreviewTransitioning ? " is-" + projectWallpaperTransition.direction : ""),
                    style: isPreviewTransitioning ? undefined : { backgroundImage: previewBackgroundImage },
                    "aria-hidden": "true",
                  },
                  isPreviewTransitioning
                    ? React.createElement(React.Fragment, null,
                        React.createElement("div", {
                          className: "playground-tasks-project-wallpaper-picker-preview-image is-outgoing",
                          style: { backgroundImage: projectWallpaperTransition.fromPreview },
                        }),
                        React.createElement("div", {
                          className: "playground-tasks-project-wallpaper-picker-preview-image is-incoming",
                          style: { backgroundImage: projectWallpaperTransition.toPreview },
                        })
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-tasks-project-wallpaper-picker-controls" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-project-wallpaper-picker-button",
                    onClick: () => void handleProjectOverviewWallpaperStep("prev"),
                    disabled: projectSaveState?.isSaving,
                    "aria-label": "Previous background image",
                    title: "Previous background image",
                  }, React.createElement(ChevronLeft, { width: 16, height: 16, strokeWidth: 1.8 })),
                  React.createElement("div", { className: "playground-tasks-project-wallpaper-picker-label" },
                    currentWallpaper?.name || "Background"
                  ),
                  React.createElement("button", {
                    type: "button",
                    className: "playground-tasks-project-wallpaper-picker-button",
                    onClick: () => void handleProjectOverviewWallpaperStep("next"),
                    disabled: projectSaveState?.isSaving,
                    "aria-label": "Next background image",
                    title: "Next background image",
                  }, React.createElement(ChevronRight, { width: 16, height: 16, strokeWidth: 1.8 }))
                )
              )
            );
          }

          function createProjectOverviewSidebarSelectorOption(option) {
            const value = String(option?.value || option?.id || option?.key || option?.label || "").trim();
            const label = String(option?.label || option?.name || value || "Option").trim();
            const description = String(option?.description || option?.email || "").trim();
            return {
              value,
              label,
              description: description || undefined,
              leading: option?.icon || undefined,
              ariaLabel: option?.ariaLabel,
              disabled: option?.disabled === true,
              selected: option?.selected === true,
              onSelect: option?.onSelect,
            };
          }

          function renderProjectOverviewSidebarSelectControl(id, value, content, options = {}) {
            const normalizedId = String(id || "").trim();
            const isOpen = Boolean(normalizedId && projectOverviewSidebarPropertyPopover === normalizedId);
            const selectorOptions = Array.isArray(options.options)
              ? options.options.filter((option) => option?.value)
              : [];
            const selectedOption = selectorOptions.find((option) => option.selected)
              || selectorOptions.find((option) => option.value === String(value || ""));
            const selectedValue = String(selectedOption?.value || value || "");
            return React.createElement(PlatformSelector, {
              value: selectedValue,
              options: selectorOptions,
              onValueChange: (_nextValue, option) => {
                if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
              },
              ariaLabel: String(options.ariaLabel || ("Select project " + normalizedId)),
              label: content,
              placeholder: content,
              open: isOpen,
              onOpenChange: (nextOpen) => {
                if (normalizedId === "lead" && nextOpen && projectOverviewSharedTeamId) {
                  requestProjectOverviewWorkspaceTeams({ teamId: projectOverviewSharedTeamId });
                }
                if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
                  setProjectOverviewSidebarPropertyPopover(nextOpen ? normalizedId : "");
                }
              },
              alignment: "start",
              popupAlignment: "left",
              fullWidth: true,
              emptyContent: options.emptyContent || "No options available.",
              popupWidth: "min(280px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight: "min(320px, calc(100vh - 120px))",
              className: "playground-project-overview-sidebar-selector",
              triggerClassName: "playground-project-overview-sidebar-selector-trigger" + (options.empty ? " is-empty" : ""),
              popupClassName: "playground-project-overview-sidebar-selector-popup",
            });
          }

          function getProjectOverviewLeadCandidateSources(record) {
            const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
            const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
            return [
              source,
              source.user,
              source.profile,
              source.account,
              source.member,
              source.identity,
              source.userProfile,
              source.accountProfile,
              source.publicProfile,
              metadata,
              metadata.user,
              metadata.profile,
              metadata.account,
              metadata.member,
              metadata.identity,
              metadata.userProfile,
              metadata.accountProfile,
              metadata.publicProfile,
            ].filter((value) => value && typeof value === "object" && !Array.isArray(value));
          }

          function readProjectOverviewLeadCandidateString(record, keys = []) {
            for (const source of getProjectOverviewLeadCandidateSources(record)) {
              for (const key of keys) {
                const value = String(source?.[key] || "").replace(/\s+/g, " ").trim();
                if (value) {
                  return value;
                }
              }
            }
            return "";
          }

          function getProjectOverviewLeadCandidateName(record) {
            const directName = readProjectOverviewLeadCandidateString(record, [
              "displayName",
              "display_name",
              "name",
              "fullName",
              "full_name",
              "accountDisplayName",
              "accountName",
              "memberDisplayName",
              "memberName",
              "publicName",
              "username",
              "userName",
              "label",
            ]);
            if (directName) {
              return directName;
            }
            for (const source of getProjectOverviewLeadCandidateSources(record)) {
              const firstName = String(source.firstName || source.first_name || source.givenName || source.given_name || "").trim();
              const lastName = String(source.lastName || source.last_name || source.familyName || source.family_name || "").trim();
              const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
              if (fullName) {
                return fullName;
              }
            }
            return "";
          }

          function getProjectOverviewLeadCandidateEmail(record) {
            return readProjectOverviewLeadCandidateString(record, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "primaryEmail",
              "primary_email",
            ]).toLowerCase();
          }

          function getProjectOverviewLeadCandidateUserId(record) {
            return readProjectOverviewLeadCandidateString(record, [
              "userId",
              "user_id",
              "uid",
              "accountId",
              "account_id",
              "memberUserId",
              "member_user_id",
              "localId",
              "local_id",
            ]);
          }

          function getProjectOverviewLeadCandidateAvatarUrl(record) {
            return readProjectOverviewLeadCandidateString(record, [
              "photoURL",
              "photoUrl",
              "photo_url",
              "avatarUrl",
              "avatarURL",
              "avatar",
              "picture",
              "imageUrl",
              "profileImageUrl",
              "profile_image_url",
            ]);
          }

          function isProjectOverviewAgentLeadCandidate(record) {
            const sources = getProjectOverviewLeadCandidateSources(record);
            const typeValues = [];
            sources.forEach((source) => {
              [
                source.type,
                source.kind,
                source.memberType,
                source.member_type,
                source.actorKind,
                source.actor_kind,
                source.agentType,
                source.agent_type,
                source.resourceType,
                source.resource_type,
                source.subjectType,
                source.subject_type,
                source.entityType,
                source.entity_type,
              ].forEach((value) => {
                const normalized = String(value || "").trim().toLowerCase();
                if (normalized) {
                  typeValues.push(normalized);
                }
              });
            });
            if (typeValues.some((value) => value.includes("agent") || value.includes("bot") || value.includes("assistant") || value.includes("automation"))) {
              return true;
            }
            return sources.some((source) =>
              source.isAgent === true
              || source.agent === true
              || Boolean(String(source.agentId || source.agent_id || source.agentUid || source.agent_uid || "").trim())
            );
          }

          function isProjectOverviewHumanLeadCandidate(record, options = {}) {
            if (options.forceHuman) {
              return true;
            }
            if (isProjectOverviewAgentLeadCandidate(record)) {
              return false;
            }
            if (getProjectOverviewLeadCandidateEmail(record) || getProjectOverviewLeadCandidateUserId(record)) {
              return true;
            }
            return getProjectOverviewLeadCandidateSources(record).some((source) => {
              const normalized = String(source.type || source.kind || source.memberType || source.member_type || source.subjectType || source.subject_type || "").trim().toLowerCase();
              return normalized.includes("human")
                || normalized.includes("user")
                || normalized.includes("person")
                || normalized.includes("account")
                || normalized === "member";
            });
          }

          function collectProjectOverviewLeadCandidateRecords(value, addCandidate) {
            if (Array.isArray(value)) {
              value.forEach((item) => collectProjectOverviewLeadCandidateRecords(item, addCandidate));
              return;
            }
            if (!value || typeof value !== "object") {
              return;
            }
            addCandidate(value);
            const source = value;
            const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
            [
              source.members,
              source.teamMembers,
              source.users,
              source.userMembers,
              source.memberProfiles,
              source.memberships,
              source.collaborators,
              source.sharedWith,
              source.sharedWithUsers,
              source.accessUsers,
              metadata.members,
              metadata.teamMembers,
              metadata.users,
              metadata.userMembers,
              metadata.memberProfiles,
              metadata.memberships,
              metadata.collaborators,
              metadata.sharedWith,
              metadata.sharedWithUsers,
              metadata.accessUsers,
            ].forEach((collection) => {
              if (Array.isArray(collection)) {
                collection.forEach((item) => addCandidate(item));
              }
            });
          }

          function buildProjectOverviewSidebarLeadOptions() {
            const currentLead = getProjectOverviewSidebarLead();
            const options = [];
            const seen = new Set();
            function addOption(option, addOptions = {}) {
              if (!option || typeof option !== "object") {
                return;
              }
              if (option.id !== "__unassigned__" && !isProjectOverviewHumanLeadCandidate(option, addOptions)) {
                return;
              }
              const name = getProjectOverviewLeadCandidateName(option) || String(option?.name || option?.label || "").trim();
              const email = getProjectOverviewLeadCandidateEmail(option) || String(option?.email || "").trim();
              const userId = getProjectOverviewLeadCandidateUserId(option) || String(option?.userId || "").trim();
              const id = String(userId || email || option?.id || name || "").trim();
              if (!id && !name) return;
              const key = (id || email || name).toLowerCase();
              if (seen.has(key)) return;
              seen.add(key);
              options.push({
                id: id || key,
                name: name || email || "Project lead",
                email,
                avatarUrl: getProjectOverviewLeadCandidateAvatarUrl(option) || String(option?.avatarUrl || option?.photoUrl || option?.profilePhotoUrl || "").trim(),
              });
            }
            addOption({
              id: "__unassigned__",
              name: "Unassigned",
            }, { forceHuman: true });
            addOption({
              id: currentLead.id || currentLead.email || currentLead.name,
              userId: currentLead.id,
              name: currentLead.name,
              email: currentLead.email,
              avatarUrl: currentLead.avatarUrl,
            });
            [
              projectOverviewSharedWorkspaceTeam,
              ...projectOverviewSharedTeamMemberRows,
              ...(Array.isArray(workspaceTeams) ? workspaceTeams : []),
            ].forEach((source) => collectProjectOverviewLeadCandidateRecords(source, addOption));
            return options;
          }

          function renderProjectOverviewSidebarRow(label, value, options = {}) {
            const content = options.content || React.createElement("span", null, value || "None");
            return React.createElement("div", { className: "playground-project-overview-sidebar-row" },
              React.createElement("div", { className: "playground-project-overview-sidebar-row-label" }, label),
              React.createElement("div", {
                className: "playground-project-overview-sidebar-row-value"
                  + (!value && !options.content ? " playground-project-overview-sidebar-muted" : "")
                  + (options.editable ? " is-editable" : ""),
              }, content)
            );
          }

          function renderProjectOverviewSidebarActivity() {
            const activityItems = buildProjectOverviewActivityItems().slice(0, 4);
            if (!activityItems.length) {
              return React.createElement("div", { className: "playground-project-overview-sidebar-empty" }, "No recent activity yet.");
            }
            return React.createElement("div", { className: "playground-project-overview-sidebar-activity-list" },
              activityItems.map((item) =>
                React.createElement("div", { key: item.id, className: "playground-project-overview-sidebar-activity-row" },
                  renderProjectOverviewActivityAvatar(item),
                  React.createElement("div", { className: "playground-project-overview-sidebar-activity-copy" },
                    React.createElement("strong", null, item.actor),
                    React.createElement("span", null, " " + item.verb + " "),
                    item.taskId && typeof handleSelectTask === "function"
                      ? React.createElement("button", {
                          type: "button",
                          className: "playground-project-overview-sidebar-activity-object",
                          onClick: (event) => {
                            event.stopPropagation();
                            handleSelectTask(item.taskId);
                          },
                        }, item.object)
                      : React.createElement("strong", null, item.object),
                    item.timeLabel
                      ? React.createElement("span", null, " · " + item.timeLabel)
                      : null
                  )
                )
              )
            );
          }

          function openProjectOverviewSidebarResourceTarget(resourceType) {
            const id = String(resourceType || "").trim();
            if (id === "files") {
              if (typeof onOpenFilesPage === "function") {
                onOpenFilesPage({
                  token: Date.now().toString(36) + Math.random().toString(36).slice(2),
                  projectId: normalizedSelectedProjectId,
                  environmentId: activeProjectAttachmentEnvironmentId || selectedProject?.defaultEnvironmentId || "",
                });
              }
              return;
            }
            if (id === "metronomes") {
              if (typeof onOpenProjectMetronomes === "function") {
                onOpenProjectMetronomes({ projectId: normalizedSelectedProjectId });
              }
              return;
            }
            if (typeof setProjectOverviewHomeTab === "function") {
              setProjectOverviewHomeTab("resources");
            }
            if (typeof setProjectOverviewFilesSubview === "function") {
              const resourceSubviewId = ["web-apps", "functions", "databases", "imagine"].includes(id) ? id : "resources";
              setProjectOverviewFilesSubview(resourceSubviewId);
            }
          }

          function renderProjectOverviewSidebarResourceRow(resource) {
            const Icon = resource.Icon || Server;
            const count = Math.max(0, Number(resource.count || 0));
            return React.createElement("button", {
                key: resource.id,
                type: "button",
                className: "playground-project-overview-sidebar-resource-row",
                onClick: () => openProjectOverviewSidebarResourceTarget(resource.id),
              },
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.85 })
              ),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-label" }, resource.label),
              React.createElement("span", { className: "playground-project-overview-sidebar-resource-count" },
                typeof formatProjectOverviewInteger === "function" ? formatProjectOverviewInteger(count) : String(count)
              )
            );
          }

          function renderProjectOverviewSidebar() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const lead = getProjectOverviewSidebarLead();
            const progressStats = getProjectOverviewProgressStats();
            const operatingProfile = getProjectOverviewOperatingProfile();
            const projectTypeLabel = String(operatingProfile?.label || operatingProfile?.name || metadata.projectTypeLabel || "").trim();
            const targetDateLabel = getProjectOverviewSidebarDateLabel(selectedProject?.targetDate || selectedProject?.dueDate || metadata.targetDate || metadata.dueDate);
            const startDateLabel = getProjectOverviewSidebarDateLabel(selectedProject?.startDate || metadata.startDate || selectedProject?.createdAt);
            const defaultComputerLabel = String(
              activeProjectAttachmentEnvironment?.name
                || selectedProject?.defaultEnvironmentName
                || metadata.defaultEnvironmentName
                || "Default"
            ).trim();
            const issueCount = Math.max(
              0,
              Number(selectedProjectSummary?.openTasksCount) || Number(selectedProjectTaskStatusOverview?.total) || Number(progressStats.scopeCount) || 0
            );
            const releaseSections = overviewCurrentTaskReleaseSections
              .filter((section) => section.key !== "__no_release__");
            const metronomeResourceCount = allOverviewResourceItems.filter((item) => isProjectOverviewMetronomeResource(item)).length;
            const webAppResourceCount = allOverviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewWebAppResource(item))
              .length;
            const functionResourceCount = allOverviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewFunctionResource(item))
              .length;
            const databaseResourceCount = allOverviewResourceItems
              .filter((item) => !isProjectOverviewMetronomeResource(item) && isProjectOverviewDatabaseResource(item))
              .length;
            const sidebarResources = [
              { id: "files", label: "Files", count: allOverviewProjectFileCount, Icon: FolderOpen },
              { id: "metronomes", label: "Metronomes", count: metronomeResourceCount, Icon: Metronome },
              { id: "web-apps", label: "Web Apps", count: webAppResourceCount, Icon: Monitor },
              { id: "functions", label: "Functions", count: functionResourceCount, Icon: FunctionSquare },
              { id: "databases", label: "Databases", count: databaseResourceCount, Icon: Database },
              { id: "imagine", label: "Imagine Resources", count: projectOverviewImagineResources.length, Icon: Clapperboard },
            ];
            const statusOptions = [
              { id: "backlog", label: "Backlog" },
              { id: "in_progress", label: "In progress" },
              { id: "on_track", label: "On track" },
              { id: "at_risk", label: "At risk" },
              { id: "blocked", label: "Blocked" },
              { id: "completed", label: "Completed" },
            ];
            const currentStatusValue = getProjectOverviewSidebarStatusValue();
            const currentStatusOption = statusOptions.find((option) => option.id === currentStatusValue) || statusOptions[0];
            const currentPriorityValue = getProjectOverviewSidebarPriorityValue();
            const currentProjectTypeValue = getProjectOverviewSidebarProjectTypeValue();
            const currentProjectType = typeof getPlaygroundProjectBlueprint === "function"
              ? getPlaygroundProjectBlueprint(currentProjectTypeValue)
              : null;
            const currentProjectTypeLabel = String(currentProjectType?.title || projectTypeLabel || "Blank Project").trim();
            const currentEnvironmentValue = getProjectOverviewSidebarEnvironmentValue();
            const currentEnvironment = projectComposerAvailableEnvironments.find((environment) => String(environment?.id || "") === currentEnvironmentValue)
              || activeProjectAttachmentEnvironment
              || projectComposerAvailableEnvironments[0]
              || null;
            const currentEnvironmentLabel = String(
              currentEnvironment?.name
                || defaultComputerLabel
                || "Default"
            ).trim();
            const startDateInputValue = getProjectOverviewSidebarDateInputValue(selectedProject?.startDate || metadata.startDate);
            const targetDateInputValue = getProjectOverviewSidebarDateInputValue(selectedProject?.targetDate || selectedProject?.dueDate || metadata.targetDate || metadata.dueDate);
            const leadOptions = buildProjectOverviewSidebarLeadOptions();
            const selectedLeadKey = String(lead.id || lead.email || lead.name || "").trim().toLowerCase();
            const renderStatusContent = (option) => React.createElement(React.Fragment, null,
              React.createElement("span", { className: "playground-project-overview-sidebar-status-dot" }),
              React.createElement("span", null, option?.label || "Backlog")
            );
            const renderProjectTypeIcon = (blueprint) => {
              const Icon = blueprint?.Icon || Rocket;
              return React.createElement("span", { className: "playground-project-overview-sidebar-resource-icon", "aria-hidden": "true" },
                React.createElement(Icon, { width: 14, height: 14, strokeWidth: 1.85 })
              );
            };

            return React.createElement(React.Fragment, null,
              React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Properties",
                  className: "playground-project-overview-sidebar-card",
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                  renderProjectOverviewSidebarRow("Priority", getPlaygroundTaskPriorityLabel(currentPriorityValue), {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("priority", currentPriorityValue, renderPlaygroundTaskPriorityLabel(currentPriorityValue), {
                      ariaLabel: "Project priority",
                      options: PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option) => createProjectOverviewSidebarSelectorOption({
                        id: option.id,
                        label: option.label,
                        selected: option.id === currentPriorityValue,
                        icon: renderPlaygroundTaskPriorityIcon(option.id),
                        onSelect: () => updateProjectOverviewSidebarProjectProperty({
                          priority: option.id,
                        }, {
                          priority: option.id,
                        }),
                      })),
                    }),
                  }),
                  renderProjectOverviewSidebarRow("Lead", lead.name, {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("lead", selectedLeadKey, React.createElement("span", { className: "playground-project-overview-sidebar-lead" },
                      renderProjectOverviewSidebarAvatar(lead.name, lead.avatarUrl),
                      React.createElement("span", null, lead.name)
                    ), {
                      empty: !lead.name || lead.name === "Unassigned",
                      ariaLabel: "Project lead",
                      options: leadOptions.map((option) => {
                        const optionKey = String(option.id || option.email || option.name || "").trim().toLowerCase();
                        const isUnassigned = option.id === "__unassigned__";
                        const isSelected = Boolean(optionKey && selectedLeadKey && (optionKey === selectedLeadKey || (isUnassigned && selectedLeadKey === "unassigned")));
                        return createProjectOverviewSidebarSelectorOption({
                          id: option.id,
                          label: option.name,
                          description: option.email,
                          selected: isSelected || (!selectedLeadKey && isUnassigned),
                          icon: renderProjectOverviewSidebarAvatar(option.name, option.avatarUrl),
                          onSelect: () => {
                            const leadRecord = isUnassigned
                              ? null
                              : {
                                  id: option.id,
                                  userId: option.id,
                                  name: option.name,
                                  email: option.email,
                                  avatarUrl: option.avatarUrl,
                                };
                            updateProjectOverviewSidebarProjectProperty({
                              leadUserId: isUnassigned ? "" : option.id,
                              leadName: isUnassigned ? "" : option.name,
                              leadEmail: isUnassigned ? "" : option.email,
                              leadAvatarUrl: isUnassigned ? "" : option.avatarUrl,
                            }, {
                              leadUserId: isUnassigned ? "" : option.id,
                              leadName: isUnassigned ? "" : option.name,
                              leadEmail: isUnassigned ? "" : option.email,
                              leadAvatarUrl: isUnassigned ? "" : option.avatarUrl,
                              lead: leadRecord,
                            });
                          },
                        });
                      }),
                    }),
                  }),
                  renderProjectOverviewSidebarRow("Type", currentProjectTypeLabel, {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("type", getPlaygroundProjectBlueprintId(currentProjectTypeValue), React.createElement(React.Fragment, null,
                      renderProjectTypeIcon(currentProjectType),
                      React.createElement("span", null, currentProjectTypeLabel)
                    ), {
                      ariaLabel: "Project type",
                      options: PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.map((blueprint) => createProjectOverviewSidebarSelectorOption({
                        id: blueprint.id,
                        label: blueprint.title,
                        description: blueprint.description,
                        selected: blueprint.id === getPlaygroundProjectBlueprintId(currentProjectTypeValue),
                        icon: renderProjectTypeIcon(blueprint),
                        onSelect: () => {
                          const blueprintMetadata = typeof buildPlaygroundProjectBlueprintMetadata === "function"
                            ? buildPlaygroundProjectBlueprintMetadata(blueprint)
                            : { projectType: blueprint.id, blueprintId: blueprint.id };
                          updateProjectOverviewSidebarProjectProperty({
                            projectType: blueprint.id,
                            type: blueprint.id,
                          }, {
                            ...blueprintMetadata,
                            projectType: blueprint.id,
                            blueprintId: blueprint.id,
                          });
                        },
                      })),
                    }),
                  }),
                  renderProjectOverviewSidebarRow("Computer", currentEnvironmentLabel, {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("computer", currentEnvironmentValue, React.createElement(React.Fragment, null,
                      React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                      React.createElement("span", null, currentEnvironmentLabel)
                    ), {
                      ariaLabel: "Project computer",
                      emptyContent: "No computers available.",
                      options: projectComposerAvailableEnvironments.length > 0
                        ? projectComposerAvailableEnvironments.map((environment) => {
                            const environmentId = String(environment?.id || "").trim();
                            const environmentName = String(environment?.name || environment?.label || "Computer").trim();
                            return createProjectOverviewSidebarSelectorOption({
                              id: environmentId,
                              label: environmentName,
                              description: environment?.isDefault ? "Default computer" : "",
                              selected: environmentId && environmentId === currentEnvironmentValue,
                              icon: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                              onSelect: () => updateProjectOverviewSidebarProjectProperty({
                                defaultEnvironmentId: environmentId,
                                defaultEnvironmentName: environmentName,
                              }, {
                                defaultEnvironmentId: environmentId || null,
                                defaultEnvironmentName: environmentName,
                              }),
                            });
                          })
                        : []
                    }),
                  }),
                )
              ),
              React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Resources",
                  className: "playground-project-overview-sidebar-card",
                },
                React.createElement("div", { className: "playground-project-overview-sidebar-resource-list" },
                  sidebarResources.map(renderProjectOverviewSidebarResourceRow)
                )
              ),
              React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  cardTitle: "Milestones",
                  className: "playground-project-overview-sidebar-card",
                  headerActions: React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-sidebar-icon-button",
                    onClick: (event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (typeof setProjectOverviewMilestoneMenuId === "function") {
                        setProjectOverviewMilestoneMenuId("");
                      }
                      if (typeof openReleaseComposer === "function") {
                        openReleaseComposer();
                      }
                    },
                    title: "Add milestone",
                    "aria-label": "Add milestone",
                  }, React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }))
                },
                releaseSections.length > 0
                  ? React.createElement("div", { className: "playground-project-overview-sidebar-rows" },
                      releaseSections.map((section) => {
                        const releaseId = String(section.releaseId || "").trim();
                        const menuId = "milestone:" + (releaseId || section.key || "");
                        const isMenuOpen = projectOverviewMilestoneMenuId === menuId;
                        return React.createElement("div", {
                          key: section.key,
                          className: "playground-project-overview-sidebar-row playground-project-overview-sidebar-milestone-row",
                        },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-project-overview-sidebar-milestone-trigger",
                            onClick: () => {
                              if (typeof setSelectedReleaseId === "function") {
                                setSelectedReleaseId(releaseId);
                              }
                              if (typeof setTaskView === "function") {
                                setTaskView("backlog");
                              }
                            },
                          },
                            React.createElement("div", { className: "playground-project-overview-sidebar-row-value is-full" },
                              React.createElement("span", { className: "playground-project-overview-sidebar-chip" },
                                section.title,
                                React.createElement("span", { className: "playground-project-overview-sidebar-muted" }, String(section.tasks.length))
                              )
                            )
                          ),
                          renderPlaygroundPlatformPopup({
                            open: isMenuOpen,
                            shellClassName: "playground-project-overview-sidebar-milestone-menu-shell",
                            menuClassName: "playground-project-overview-sidebar-milestone-menu",
                            menuProps: {
                              onClick: (event) => event.stopPropagation(),
                            },
                            trigger: React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-sidebar-icon-button",
                              onClick: (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                if (typeof setProjectOverviewMilestoneMenuId === "function") {
                                  setProjectOverviewMilestoneMenuId((current) => current === menuId ? "" : menuId);
                                }
                              },
                              title: "Milestone actions",
                              "aria-label": "Milestone actions for " + (section.title || "milestone"),
                              "aria-expanded": isMenuOpen ? "true" : "false",
                            }, React.createElement(EllipsisVertical, { width: 14, height: 14, strokeWidth: 1.8 })),
                            children: React.createElement("button", {
                                    type: "button",
                                    className: "tb-popup-row playground-project-team-menu-item is-danger",
                                    disabled: !releaseId,
                                    onClick: (event) => {
                                      event.preventDefault();
                                      event.stopPropagation();
                                      if (typeof setProjectOverviewMilestoneMenuId === "function") {
                                        setProjectOverviewMilestoneMenuId("");
                                      }
                                      if (releaseId && typeof handleDeleteRelease === "function") {
                                        void handleDeleteRelease(releaseId);
                                      }
                                    },
                                  },
                                    React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }),
                                    React.createElement("span", null, "Delete milestone")
                                  ),
                          })
                        );
                      })
                    )
                  : React.createElement("div", { className: "playground-project-overview-sidebar-empty" }, "No milestone")
              )
            );
          }

          function renderProjectOverviewStrategyPanel() {
            const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControlStrategyDraft);

            function getOutcomeTasks(outcome) {
              const releaseIds = new Set(getProjectOverviewOutcomeReleaseIds(outcome));
              if (releaseIds.size === 0) {
                return [];
              }
              return normalizedOverviewTasks.filter((task) => releaseIds.has(String(task?.releaseId || "").trim()));
            }

            function getOutcomeTaskProgressValue(task) {
              const status = getTaskBoardStatus(task);
              if (status === "done") return 100;
              if (status === "in_review") return 80;
              if (status === "in_progress") return 50;
              return 0;
            }

            function getOutcomeProgressInfo(outcome) {
              const outcomeTasks = getOutcomeTasks(outcome);
              const doneTasks = outcomeTasks.filter((task) => getTaskBoardStatus(task) === "done");
              const progress = outcomeTasks.length > 0
                ? Math.round(outcomeTasks.reduce((sum, task) => sum + getOutcomeTaskProgressValue(task), 0) / outcomeTasks.length)
                : 0;
              return {
                tasks: outcomeTasks,
                doneTasks,
                progress,
                isAchieved: outcomeTasks.length > 0 && doneTasks.length === outcomeTasks.length,
              };
            }

            function openProjectOverviewOutcomeEditor(outcome, index) {
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState({
                  index,
                  draft: buildProjectOverviewOutcomeEditorDraft(outcome, index),
                });
              }
            }

            function openProjectOverviewNewOutcomeEditor() {
              const nextIndex = strategyBrief.outcomes.length;
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState({
                  index: nextIndex,
                  isNew: true,
                  draft: buildProjectOverviewOutcomeEditorDraft({
                    id: "outcome-" + String(nextIndex + 1).padStart(2, "0"),
                    title: "",
                    description: "",
                    successCriteria: [],
                    releaseIds: [],
                    releaseId: "",
                  }, nextIndex),
                });
              }
            }

            function updateProjectOverviewOutcomeEditorDraft(updates) {
              if (typeof setProjectOverviewOutcomeEditorState !== "function") return;
              setProjectOverviewOutcomeEditorState((current) => current
                ? {
                    ...current,
                    draft: {
                      ...(current.draft || {}),
                      ...(updates || {}),
                    },
                  }
                : current
              );
            }

            function buildProjectOverviewOutcomeEditorDraft(outcome, index = 0) {
              const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(outcome, index);
              return {
                ...normalizedDraft,
                successCriteriaInput: serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
              };
            }

            function getProjectOverviewOutcomeEditorDraft(index = 0) {
              const rawDraft = projectOverviewOutcomeEditorState?.draft || {};
              const normalizedDraft = normalizePlaygroundStrategyOutcomeRecord(rawDraft, index);
              return {
                ...normalizedDraft,
                title: typeof rawDraft.title === "string" ? rawDraft.title : normalizedDraft.title,
                description: typeof rawDraft.description === "string" ? rawDraft.description : normalizedDraft.description,
                successCriteriaInput: typeof rawDraft.successCriteriaInput === "string"
                  ? rawDraft.successCriteriaInput
                  : serializePlaygroundStrategyListForInput(normalizedDraft.successCriteria),
              };
            }

            function normalizeProjectOverviewOutcomeEditorDraftForSave(rawDraft, index = 0) {
              return normalizePlaygroundStrategyOutcomeRecord({
                ...(rawDraft || {}),
                taskIds: [],
                successCriteria: typeof rawDraft?.successCriteriaInput === "string"
                  ? normalizePlaygroundStrategyTextList(rawDraft.successCriteriaInput)
                  : rawDraft?.successCriteria,
              }, index);
            }

            async function saveProjectOverviewOutcomeEditor() {
              const index = Number(projectOverviewOutcomeEditorState?.index);
              const draft = normalizeProjectOverviewOutcomeEditorDraftForSave(projectOverviewOutcomeEditorState?.draft, index);
              if (!Number.isInteger(index) || index < 0 || index > strategyBrief.outcomes.length) {
                if (typeof setProjectOverviewOutcomeEditorState === "function") {
                  setProjectOverviewOutcomeEditorState(null);
                }
                return;
              }
              const isNewOutcome = projectOverviewOutcomeEditorState?.isNew === true || index >= strategyBrief.outcomes.length;
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...missionControlStrategyDraft,
                outcomes: isNewOutcome
                  ? strategyBrief.outcomes.concat(draft)
                  : strategyBrief.outcomes.map((outcome, outcomeIndex) => outcomeIndex === index ? draft : outcome),
              });
              if (typeof setMissionControlStrategyDraft === "function") {
                setMissionControlStrategyDraft(nextStrategyBrief);
              }
              try {
                await saveMissionControlStrategyBrief(nextStrategyBrief, { throwOnError: true });
              } catch (error) {
                if (typeof setMissionControlSaveState === "function") {
                  setMissionControlSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to save outcome.",
                    message: "",
                  });
                }
                return;
              }
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState(null);
              }
            }

            function deleteProjectOverviewOutcomeEditor() {
              const index = Number(projectOverviewOutcomeEditorState?.index);
              if (projectOverviewOutcomeEditorState?.isNew !== true && Number.isInteger(index) && index >= 0) {
                removeMissionControlStrategyOutcome(index);
              }
              if (typeof setProjectOverviewOutcomeEditorState === "function") {
                setProjectOverviewOutcomeEditorState(null);
              }
            }

            function updateProjectOverviewOutcomeMilestone(releaseId) {
              const normalizedReleaseId = String(releaseId || "").trim();
              const currentReleaseIds = getProjectOverviewOutcomeReleaseIds(projectOverviewOutcomeEditorState?.draft || {});
              const nextReleaseIds = normalizedReleaseId
                ? (currentReleaseIds.includes(normalizedReleaseId)
                    ? currentReleaseIds.filter((id) => id !== normalizedReleaseId)
                    : currentReleaseIds.concat(normalizedReleaseId))
                : [];
              updateProjectOverviewOutcomeEditorDraft({
                releaseIds: nextReleaseIds,
                releaseId: nextReleaseIds[0] || "",
                taskIds: [],
              });
            }

            function getProjectOverviewOutcomePreviewKey(outcome, index) {
              return String(outcome?.id || "outcome") + ":" + String(index);
            }

            function beginProjectOverviewOutcomeRename(outcome, index) {
              if (typeof setProjectOverviewOutcomeActionMenuId === "function") {
                setProjectOverviewOutcomeActionMenuId("");
              }
              if (typeof setProjectOverviewOutcomeRenameState === "function") {
                setProjectOverviewOutcomeRenameState({
                  key: getProjectOverviewOutcomePreviewKey(outcome, index),
                  index,
                  value: String(outcome?.title || ""),
                  saving: false,
                });
              }
            }

            function cancelProjectOverviewOutcomeRename() {
              if (typeof setProjectOverviewOutcomeRenameState === "function") {
                setProjectOverviewOutcomeRenameState(null);
              }
            }

            async function saveProjectOverviewOutcomeRename() {
              const index = Number(projectOverviewOutcomeRenameState?.index);
              const title = String(projectOverviewOutcomeRenameState?.value || "").trim();
              if (
                projectOverviewOutcomeRenameState?.saving
                || !Number.isInteger(index)
                || index < 0
                || index >= strategyBrief.outcomes.length
                || !title
              ) {
                return;
              }
              if (title === String(strategyBrief.outcomes[index]?.title || "").trim()) {
                cancelProjectOverviewOutcomeRename();
                return;
              }
              const nextStrategyBrief = normalizePlaygroundProjectStrategyBrief({
                ...missionControlStrategyDraft,
                outcomes: strategyBrief.outcomes.map((outcome, outcomeIndex) => outcomeIndex === index
                  ? normalizePlaygroundStrategyOutcomeRecord({ ...outcome, title }, outcomeIndex)
                  : outcome
                ),
              });
              if (typeof setProjectOverviewOutcomeRenameState === "function") {
                setProjectOverviewOutcomeRenameState((current) => current
                  ? { ...current, saving: true }
                  : current
                );
              }
              if (typeof setMissionControlStrategyDraft === "function") {
                setMissionControlStrategyDraft(nextStrategyBrief);
              }
              try {
                await saveMissionControlStrategyBrief(nextStrategyBrief, { throwOnError: true });
              } catch (error) {
                if (typeof setMissionControlStrategyDraft === "function") {
                  setMissionControlStrategyDraft(strategyBrief);
                }
                if (typeof setMissionControlSaveState === "function") {
                  setMissionControlSaveState({
                    isSaving: false,
                    error: error instanceof Error ? error.message : "Failed to rename outcome.",
                    message: "",
                  });
                }
                if (typeof setProjectOverviewOutcomeRenameState === "function") {
                  setProjectOverviewOutcomeRenameState((current) => current
                    ? { ...current, saving: false }
                    : current
                  );
                }
                return;
              }
              cancelProjectOverviewOutcomeRename();
            }

            function renderOutcomePreviewRow(outcome, index) {
              const progressInfo = getOutcomeProgressInfo(outcome);
              const outcomeNumber = String(index + 1).padStart(3, "0");
              const outcomePreviewKey = getProjectOverviewOutcomePreviewKey(outcome, index);
              const isActionMenuOpen = projectOverviewOutcomeActionMenuId === outcomePreviewKey;
              const isRenaming = projectOverviewOutcomeRenameState?.key === outcomePreviewKey;
              const linkedTicketCompletionPercent = progressInfo.tasks.length > 0
                ? Math.round((progressInfo.doneTasks.length / progressInfo.tasks.length) * 100)
                : 0;
              const linkedTicketVisualPercent = linkedTicketCompletionPercent === 0
                ? 2
                : linkedTicketCompletionPercent;
              return React.createElement("div", {
                  key: outcome.id || index,
                  className: "playground-tasks-backlog-item playground-project-overview-outcome-preview",
                  role: "button",
                  tabIndex: 0,
                  onClick: () => openProjectOverviewOutcomeEditor(outcome, index),
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProjectOverviewOutcomeEditor(outcome, index);
                    }
                  },
                },
                React.createElement("div", { className: "playground-tasks-backlog-item-content" },
                  React.createElement("div", { className: "playground-tasks-backlog-leading" },
                    React.createElement(PlaygroundProjectOverviewOutcomeProgressRing, {
                      progress: progressInfo.progress,
                      label: "Outcome " + outcomeNumber + " progress " + String(progressInfo.progress) + "%",
                    }),
                    React.createElement("div", { className: "playground-tasks-backlog-main" },
                      React.createElement("span", { className: "playground-tasks-backlog-ticket" }, "Outcome " + outcomeNumber),
                      isRenaming
                        ? React.createElement("div", {
                            className: "playground-project-overview-outcome-inline-rename",
                            onClick: (event) => event.stopPropagation(),
                          },
                            React.createElement("input", {
                              type: "text",
                              className: "playground-tasks-backlog-title-input playground-project-overview-outcome-inline-rename-input",
                              value: projectOverviewOutcomeRenameState?.value || "",
                              autoFocus: true,
                              disabled: projectOverviewOutcomeRenameState?.saving === true,
                              "aria-label": "Outcome title",
                              onChange: (event) => {
                                if (typeof setProjectOverviewOutcomeRenameState === "function") {
                                  setProjectOverviewOutcomeRenameState((current) => current
                                    ? { ...current, value: event.target.value }
                                    : current
                                  );
                                }
                              },
                              onKeyDown: (event) => {
                                event.stopPropagation();
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void saveProjectOverviewOutcomeRename();
                                } else if (event.key === "Escape") {
                                  event.preventDefault();
                                  cancelProjectOverviewOutcomeRename();
                                }
                              },
                            }),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-outcome-inline-rename-button",
                              disabled: projectOverviewOutcomeRenameState?.saving === true,
                              title: "Cancel rename",
                              "aria-label": "Cancel outcome rename",
                              onClick: (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                cancelProjectOverviewOutcomeRename();
                              },
                            }, React.createElement(X, { width: 13, height: 13, strokeWidth: 1.9 })),
                            React.createElement("button", {
                              type: "button",
                              className: "playground-project-overview-outcome-inline-rename-button",
                              disabled: projectOverviewOutcomeRenameState?.saving === true
                                || !String(projectOverviewOutcomeRenameState?.value || "").trim(),
                              title: "Save rename",
                              "aria-label": "Save outcome rename",
                              onClick: (event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                void saveProjectOverviewOutcomeRename();
                              },
                            }, React.createElement(Check, { width: 13, height: 13, strokeWidth: 2 }))
                          )
                        : React.createElement("span", { className: "playground-tasks-backlog-title" }, outcome.title || "Untitled Outcome")
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-backlog-meta" },
                    React.createElement("div", { className: "playground-project-overview-outcome-preview-trailing" },
                      React.createElement("div", {
                          className: "playground-project-overview-outcome-preview-progress",
                          role: "progressbar",
                          "aria-label": String(progressInfo.doneTasks.length) + " of " + String(progressInfo.tasks.length) + " linked tickets completed",
                          "aria-valuemin": 0,
                          "aria-valuemax": 100,
                          "aria-valuenow": linkedTicketCompletionPercent,
                        },
                        React.createElement("span", {
                          className: "playground-project-overview-outcome-preview-progress-fill",
                          style: { width: String(linkedTicketVisualPercent) + "%" },
                        })
                      ),
                      isActionMenuOpen
                        ? React.createElement(PlatformPopupDismissLayer, {
                            className: "playground-project-overview-outcome-action-menu-dismiss-layer",
                            onClick: (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              if (typeof setProjectOverviewOutcomeActionMenuId === "function") {
                                setProjectOverviewOutcomeActionMenuId("");
                              }
                            },
                          })
                        : null,
                      React.createElement(PlatformPopup, {
                          open: isActionMenuOpen,
                          variant: "minimal",
                          portal: true,
                          placement: "bottom-end",
                          rootClassName: "playground-project-overview-outcome-action-menu-shell",
                          surfaceClassName: "playground-project-overview-outcome-action-menu",
                          surfaceProps: {
                            role: "menu",
                            "aria-label": "Outcome actions",
                            onClick: (event) => event.stopPropagation(),
                            onKeyDown: (event) => {
                              if (event.key === "Escape") {
                                event.preventDefault();
                                event.stopPropagation();
                                if (typeof setProjectOverviewOutcomeActionMenuId === "function") {
                                  setProjectOverviewOutcomeActionMenuId("");
                                }
                              }
                            },
                          },
                          animation: "down-in",
                          trigger: React.createElement("button", {
                            type: "button",
                            className: "playground-project-overview-outcome-action-trigger",
                            title: "Outcome actions",
                            "aria-label": "Outcome actions for " + (outcome.title || "untitled outcome"),
                            "aria-haspopup": "menu",
                            "aria-expanded": isActionMenuOpen ? "true" : "false",
                            onClick: (event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              if (typeof setProjectOverviewOutcomeActionMenuId === "function") {
                                setProjectOverviewOutcomeActionMenuId((current) => current === outcomePreviewKey ? "" : outcomePreviewKey);
                              }
                            },
                          }, React.createElement(EllipsisVertical, { width: 15, height: 15, strokeWidth: 1.8 })),
                        },
                        React.createElement("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tb-popup-row",
                          onClick: (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            beginProjectOverviewOutcomeRename(outcome, index);
                          },
                        },
                          React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Rename")
                        ),
                        React.createElement("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tb-popup-row",
                          onClick: (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (typeof setProjectOverviewOutcomeActionMenuId === "function") {
                              setProjectOverviewOutcomeActionMenuId("");
                            }
                            openProjectOverviewOutcomeEditor(outcome, index);
                          },
                        },
                          React.createElement(Eye, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "View Details")
                        ),
                        React.createElement("button", {
                          type: "button",
                          role: "menuitem",
                          className: "tb-popup-row",
                          onClick: (event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (typeof setProjectOverviewOutcomeActionMenuId === "function") {
                              setProjectOverviewOutcomeActionMenuId("");
                            }
                            if (isRenaming) {
                              cancelProjectOverviewOutcomeRename();
                            }
                            removeMissionControlStrategyOutcome(index);
                          },
                        },
                          React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Delete")
                        )
                      )
                    )
                  )
                )
              );
            }

            function renderProjectOverviewOutcomeEditorModal() {
              return renderSharedProjectOverviewOutcomeEditorModal({
                normalizedOverviewTasks,
                strategyBrief,
              });
            }

            return React.createElement("section", {
                className: "playground-project-overview-strategy-tab",
                ref: projectOverviewStrategySurfaceRef,
              },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-project-overview-strategy-scroll" },
                React.createElement("div", { className: "playground-project-overview-strategy-brief" },
                  React.createElement("section", { className: "playground-project-overview-progress-combo-card playground-project-overview-strategy-progress-card" },
                    React.createElement("div", { className: "playground-project-overview-progress-combo-topbar" },
                      React.createElement("h2", { className: "playground-project-overview-progress-combo-title" }, "Outcomes"),
                      React.createElement("div", { className: "playground-project-overview-progress-combo-actions" },
                        React.createElement(PlatformSecondaryButton, {
                          type: "button",
                          size: "small",
                          className: "playground-project-overview-add-outcome-button",
                          title: "Add Outcome",
                          "aria-label": "Add Outcome",
                          onClick: openProjectOverviewNewOutcomeEditor,
                        },
                          React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, "Outcome")
                        )
                      )
                    ),
                    React.createElement("div", { className: "playground-project-overview-progress-combo-chart" },
                      strategyBrief.outcomes.length > 0
                        ? React.createElement("div", { className: "playground-project-overview-outcome-list" },
                            strategyBrief.outcomes.map((outcome, index) => renderOutcomePreviewRow(outcome, index))
                          )
                        : React.createElement("div", { className: "playground-tasks-empty playground-project-overview-rules-empty" },
                            React.createElement("div", { className: "playground-tasks-empty-title" }, "No outcomes yet"),
                            React.createElement("div", { className: "playground-tasks-empty-copy" },
                              "Add outcomes manually or run Mission Control to turn the strategy into measurable project outcomes."
                            )
                          )
                    )
                  ),
                  React.createElement(PlatformInstructionsEditor, {
                    value: missionControlDocumentDraft,
                    onChange: (nextValue) => updateMissionControlDocumentDraftValue(nextValue, {
                      previousValue: missionControlDocumentDraft,
                    }),
                    title: "Strategy Notes",
                    placeholder: "Run Mission Control first to generate the project strategy and backlog plan.",
                    ariaLabel: "Project strategy notes",
                    historyKey: selectedProject.id,
                    onEditingChange: (editing) => {
                      setIsMissionControlDocumentEditing(editing);
                      if (!editing) {
                        commitMissionControlDocumentIfDirty();
                      }
                    },
                  })
                ),
                renderProjectOverviewOutcomeEditorModal()
              )
	            );
	          }

	          function renderProjectOverviewRulesPanel(options = {}) {
	            const isInline = Boolean(options?.inline);
	            const isReadOnly = Boolean(options?.readOnly);
	            const ruleEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	            const canAddRule = !isReadOnly
	              && Boolean(normalizePlaygroundProjectRuleEntry(projectRuleInputValue))
	              && !projectRulesSaveState.isSaving;

	            function closeProjectOverviewRuleComposer() {
	              if (typeof closeProjectRuleComposer === "function") {
	                closeProjectRuleComposer();
	                return;
	              }
	              setProjectRuleComposerOpen(false);
	              setProjectRuleInputValue("");
	            }

	            function renderProjectOverviewRuleComposerModal() {
	              if (isReadOnly || !projectRuleComposerOpen) {
	                return null;
	              }
	              const content = React.createElement(PlatformModalBackdrop, {
	                  className: "playground-tasks-project-modal-backdrop playground-tasks-project-issue-backdrop playground-project-overview-rule-editor-backdrop"
	                    + (projectRuleComposerVisible ? " is-visible" : "")
	                    + (projectRuleComposerClosing ? " is-closing" : ""),
	                  onClick: (event) => {
	                    if (event.target === event.currentTarget) {
	                      closeProjectOverviewRuleComposer();
	                    }
	                  },
	                },
	                React.createElement(PlatformModalSurface, {
	                    as: "form",
	                    className: "playground-tasks-project-modal playground-tasks-issue-modal playground-tasks-project-issue-modal playground-project-overview-rule-editor-modal"
	                      + (projectRuleComposerVisible ? " is-visible" : "")
	                      + (projectRuleComposerClosing ? " is-closing" : ""),
	                    role: "dialog",
	                    "aria-modal": "true",
	                    "aria-label": "Add Rule",
	                    onMouseDown: (event) => event.stopPropagation(),
	                    onClick: (event) => event.stopPropagation(),
	                    onSubmit: (event) => {
	                      event.preventDefault();
	                      void handleAddProjectRuleEntry();
	                    },
	                  },
	                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
	                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
	                      React.createElement("span", { className: "playground-tasks-project-modal-icon-trigger", "aria-hidden": "true" },
	                        React.createElement(Shield, { width: 18, height: 18, strokeWidth: 1.9 })
	                      ),
	                      React.createElement("div", { className: "playground-content-title playground-tasks-project-modal-name-input", style: { display: "flex", alignItems: "center" } }, "Add Rule")
	                    ),
	                    React.createElement("button", {
	                      type: "button",
	                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
	                      onClick: closeProjectOverviewRuleComposer,
	                      title: "Close",
	                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
	                  ),
	                  React.createElement("div", { className: "playground-tasks-issue-modal-body playground-project-overview-rule-editor-body" },
	                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-initial-setup-goal-editor playground-project-overview-rule-description-editor" },
	                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
	                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Rule"),
	                        React.createElement("div", { className: "playground-tasks-detail-format-actions" },
	                          [
	                            { id: "bold", label: "Bold", icon: Bold },
	                            { id: "italic", label: "Italic", icon: Italic },
	                            { id: "underline", label: "Underline", icon: Underline },
	                            { id: "list", label: "List", icon: List },
	                          ].map((action) =>
	                            React.createElement("button", {
	                              key: action.id,
	                              type: "button",
	                              className: "playground-tasks-detail-format-button",
	                              title: action.label,
	                              "aria-label": action.label,
	                              onMouseDown: (event) => event.preventDefault(),
	                              onClick: () => handleProjectRuleComposerFormat(action.id),
	                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
	                          )
	                        )
	                      ),
	                      React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing" },
	                      React.createElement("textarea", {
	                        ref: projectRuleComposerTextareaRef,
	                          className: "playground-tasks-detail-description-input is-editing playground-project-overview-rule-modal-textarea",
	                        rows: 4,
	                        value: projectRuleInputValue,
	                        placeholder: "Describe the rule agents should follow in this project",
	                        onChange: (event) => {
	                          setProjectRuleInputValue(event.target.value);
	                          resizeTaskDescriptionTextarea(event.currentTarget);
	                        },
	                        onKeyDown: (event) => {
	                          if (event.key === "Escape") {
	                            event.preventDefault();
	                            closeProjectOverviewRuleComposer();
	                          }
	                        },
	                      })
	                      )
	                    )
	                  ),
	                  projectRulesSaveState?.error
	                    ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, projectRulesSaveState.error)
	                    : null,
	                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
	                    React.createElement("button", {
	                      type: "button",
	                      className: "playground-environments-action-button",
	                      onClick: closeProjectOverviewRuleComposer,
	                    }, "Cancel"),
	                    React.createElement(PlatformPrimaryButton, {
	                      size: "medium",
	                      type: "submit",
	                      className: "playground-environments-action-button is-primary",
	                      disabled: !canAddRule,
	                    }, projectRulesSaveState.isSaving ? "Saving..." : "Add Rule")
	                  )
	                )
	              );
	              if (typeof document !== "undefined" && document.body) {
	                return createPortal(content, document.body);
	              }
	              return content;
	            }

	            return React.createElement("section", {
	                className: "playground-project-overview-rules-tab" + (isInline ? " is-inline" : ""),
	                ref: isInline ? null : projectOverviewRulesSurfaceRef,
	              },
	              React.createElement("div", { className: "playground-project-overview-rules-list" },
	                ruleEntries.length > 0
	                  ? ruleEntries.map((entry, index) =>
	                      React.createElement("div", {
	                        key: String(index) + ":" + entry.slice(0, 48),
	                        className: "playground-tasks-backlog-item playground-project-overview-rule-item",
	                      },
	                        React.createElement("div", { className: "playground-tasks-backlog-item-content" },
	                          React.createElement("div", { className: "playground-tasks-backlog-leading" },
	                            React.createElement("span", { className: "playground-tasks-backlog-project-icon is-task" },
	                              React.createElement(Shield, { width: 13, height: 13, strokeWidth: 1.8 })
	                            )
	                          ),
	                          React.createElement("div", { className: "playground-tasks-backlog-main playground-project-overview-rule-main" },
	                            !isReadOnly && projectRuleEditingIndex === index
	                              ? React.createElement("textarea", {
	                                  ref: projectRuleEditTextareaRef,
	                                  rows: 1,
	                                  className: "playground-project-overview-rule-edit-input",
	                                  value: projectRuleEditingValue,
	                                  placeholder: "Add project rule",
	                                  onChange: (event) => {
	                                    setProjectRuleEditingValue(event.target.value);
	                                    resizeTaskDescriptionTextarea(event.currentTarget);
	                                  },
	                                  onBlur: () => {
	                                    void commitProjectRuleEntryEdit(index);
	                                  },
	                                  onKeyDown: (event) => {
	                                    if (event.key === "Enter" && !event.shiftKey) {
	                                      event.preventDefault();
	                                      event.currentTarget.blur();
	                                      return;
	                                    }
	                                    if (event.key === "Escape") {
	                                      event.preventDefault();
	                                      cancelProjectRuleEntryEdit();
	                                    }
	                                  },
	                                })
	                              : React.createElement("div", {
	                                  className: "playground-project-overview-rule-copy tb-runner-chat" + (isReadOnly ? " is-read-only" : ""),
	                                  ...(isReadOnly ? {} : {
	                                    role: "button",
	                                    tabIndex: 0,
	                                    onClick: () => beginProjectRuleEntryEdit(index, entry),
	                                    onKeyDown: (event) => {
	                                      if (event.key === "Enter" || event.key === " ") {
	                                        event.preventDefault();
	                                        beginProjectRuleEntryEdit(index, entry);
	                                      }
	                                    },
	                                  }),
	                                },
	                                  React.createElement(PlaygroundTaskDescriptionMarkdown, {
	                                    content: entry,
	                                    className: "tb-message-markdown",
	                                  })
	                                )
	                          ),
	                          isReadOnly
	                            ? null
	                            : React.createElement("div", { className: "playground-tasks-backlog-meta" },
	                                React.createElement("button", {
	                                  type: "button",
	                                  className: "playground-project-overview-rule-remove",
	                                  onClick: () => void handleRemoveProjectRuleEntry(index),
	                                  disabled: projectRulesSaveState.isSaving,
	                                  title: "Remove rule",
	                                  "aria-label": "Remove rule " + String(index + 1),
	                                }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
	                              )
	                        )
	                      )
	                    )
	                  : React.createElement("div", { className: "playground-tasks-empty playground-tasks-backlog-empty playground-project-overview-rules-empty" },
	                      React.createElement("div", { className: "playground-tasks-empty-title" }, "Rules are empty"),
	                      React.createElement("div", { className: "playground-tasks-empty-copy" },
	                        "Add project rules for repository conventions, deployment expectations, commit policy, communication style, or other operating constraints."
	                      )
	                    ),
	                projectRulesSaveState.error
	                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, projectRulesSaveState.error)
	                  : projectRulesSaveState.isSaving
	                    ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
	                    : null
	              ),
	              renderProjectOverviewRuleComposerModal()
	            );
	          }

	          function renderProjectOverviewSettingsRulesSection(options = {}) {
	            const canEditRules = options?.canEdit !== false;
	            return React.createElement("section", {
	                className: "playground-project-settings-section playground-project-settings-rules-section" + (canEditRules ? "" : " is-read-only"),
	              },
	              React.createElement("div", { className: "playground-project-overview-strategy-add-row playground-project-overview-rules-inline-title-row" },
	                React.createElement("h2", { className: "playground-project-overview-strategy-add-title" }, "Rules"),
	                canEditRules
	                  ? React.createElement(PlatformSecondaryButton, {
	                      type: "button",
	                      size: "small",
	                      className: "playground-project-settings-add-rule-button",
	                      onClick: () => {
	                        if (typeof setProjectRuleInputValue === "function") {
	                          setProjectRuleInputValue("");
	                        }
	                        if (typeof setProjectRuleComposerOpen === "function") {
	                          setProjectRuleComposerOpen(true);
	                        }
	                        window.requestAnimationFrame(() => {
	                          const textarea = projectRuleComposerTextareaRef.current;
	                          if (!textarea) return;
	                          textarea.focus();
	                          resizeTaskDescriptionTextarea(textarea);
	                        });
	                      },
	                    },
	                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
	                      React.createElement("span", null, "Add Rule")
	                    )
	                  : null
	              ),
	              renderProjectOverviewRulesPanel({ inline: true, readOnly: !canEditRules })
	            );
	          }

	          function renderProjectOverviewPermissionsPanel() {
	            if (!canViewProjectSettings) {
	              return null;
	            }
	            const projectPermissionSet = normalizePlaygroundPermissionSet(
	              projectOverviewDraft?.permissionSet
	                || projectOverviewDraft?.metadata?.permissionSet
	                || selectedProject?.permissionSet
	                || selectedProject?.metadata?.permissionSet,
	              "project"
	            );
	            const projectMetadata = projectOverviewDraft?.metadata && typeof projectOverviewDraft.metadata === "object" && !Array.isArray(projectOverviewDraft.metadata)
	              ? projectOverviewDraft.metadata
	              : {};
	            const projectTeamPermissionSets = projectMetadata.teamPermissionSets
	              && typeof projectMetadata.teamPermissionSets === "object"
	              && !Array.isArray(projectMetadata.teamPermissionSets)
	                ? projectMetadata.teamPermissionSets
	                : {};
	            const projectTeamRolePermissionSets = projectMetadata.teamRolePermissionSets
	              && typeof projectMetadata.teamRolePermissionSets === "object"
	              && !Array.isArray(projectMetadata.teamRolePermissionSets)
	                ? projectMetadata.teamRolePermissionSets
	                : {};
	            const availableWorkspaceTeams = Array.isArray(workspaceTeams)
	              ? workspaceTeams
	              : [];
	            const projectRemovedTeamIds = new Set(
	              (Array.isArray(projectMetadata.teamAccessRemovedIds) ? projectMetadata.teamAccessRemovedIds : [])
	                .map((teamId) => String(teamId || "").trim())
	                .filter(Boolean)
	            );
	            const removedWorkspaceTeams = availableWorkspaceTeams
	              .map((team) => {
	                const teamId = String(team?.id || "").trim();
	                return teamId && projectRemovedTeamIds.has(teamId) ? { ...team, id: teamId } : null;
	              })
	              .filter(Boolean);
		            const projectSharedTeams = availableWorkspaceTeams.map((team) => {
		                const teamId = String(team?.id || "").trim();
		                if (!teamId || isPlatformSystemAccessPrincipalId(teamId) || projectRemovedTeamIds.has(teamId)) {
		                  return null;
		                }
	                return {
	                  id: teamId,
	                  name: team?.name || "Untitled team",
	                  profileImageUrl: getPlatformAccessPrincipalProfileImageUrl(team),
	                  meta: team?.memberCount ? String(team.memberCount) + " members" : "Team workspace",
	                  permission: projectTeamRolePermissionSets[teamId]
	                    ? "Project role override"
	                    : projectTeamPermissionSets[teamId]
	                      ? "Migrated role policy"
	                      : "Role policies",
	                  createdAt: team?.createdAt || "",
	                  locked: false,
		                  rolePermissionSets: getProjectTeamRolePermissionSets(projectOverviewDraft || selectedProject, teamId),
		                };
		              }).filter(Boolean);
		            const projectPermissionTeams = composePlatformAccessPrincipalRows(projectSharedTeams);
	            const formatProjectTeamCreatedDate = (value) => {
	              if (!value) {
	                return "";
	              }
	              try {
	                return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(value));
	              } catch {
	                return String(value || "");
	              }
	            };
	            const selectedPermissionTeam = projectPermissionTeams.find((team) =>
	              String(team.id) === String(projectOverviewPermissionTeamId || "")
	            ) || null;
            const renderReducedProjectRoleView = () => {
              const reducedTeamId = projectOverviewSharedTeamId;
              const reducedWorkspaceTeam = reducedTeamId
                ? availableWorkspaceTeams.find((team) => String(team?.id || "").trim() === reducedTeamId)
                : null;
              const reducedTeamName = String(
                projectOverviewSharedTeamName
                || reducedWorkspaceTeam?.name
                || "Team access"
              ).trim() || "Team access";
              const reducedRoleId = normalizePlaygroundTeamRoleId(projectOverviewViewerProjectRoleId, "member");
              const selectedRoleDefinition = getPlaygroundTeamRoleDefinition(reducedRoleId);
              const reducedRolePermissionSets = getProjectTeamRolePermissionSets(projectOverviewDraft || selectedProject, reducedTeamId);
              const selectedRolePermissionSet = normalizePlaygroundPermissionSet(
                reducedRolePermissionSets[selectedRoleDefinition.id],
                "project_team_role"
              );
              const projectRulesViewAction = getPlaygroundPermissionActionDefinition("project_rules_view");
              const projectRulesEditAction = getPlaygroundPermissionActionDefinition("project_rules_edit");
              const projectRulesViewAccess = projectRulesViewAction
                ? getPlaygroundPermissionActionAccess(selectedRolePermissionSet, projectRulesViewAction)
                : "full_access";
              const projectRulesEditAccess = projectRulesEditAction
                ? getPlaygroundPermissionActionAccess(selectedRolePermissionSet, projectRulesEditAction)
                : "no_access";
              const canViewProjectRules = projectRulesViewAccess !== "no_access";
              const canEditProjectRules = projectRulesEditAccess === "full_access";
              const openReducedProjectTeamRolePage = () => {
                if (!reducedTeamId) {
                  return;
                }
                onOpenTeamPage?.(reducedTeamId, {
                  tab: "roles",
                  roleId: selectedRoleDefinition.id,
                });
              };
              return React.createElement("section", {
                  className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root playground-project-settings-reduced-access-root",
                },
                canViewProjectRules
                  ? renderProjectOverviewSettingsRulesSection({ canEdit: canEditProjectRules })
                  : null,
                React.createElement("section", {
                    className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-permissions-section playground-project-teams-section playground-project-settings-reduced-access",
                  },
                  React.createElement("div", { className: "playground-team-role-permission-page playground-project-team-role-permission-page" },
	                    React.createElement("div", { className: "playground-team-role-permission-header playground-project-team-role-permission-header" },
	                      React.createElement("div", null,
	                        React.createElement("h2", { className: "playground-team-role-permission-title" }, selectedRoleDefinition.label + " Role")
                      ),
                      reducedTeamId
                        ? React.createElement("button", {
                            type: "button",
                            className: "playground-project-settings-source-button",
                            onClick: openReducedProjectTeamRolePage,
                          }, reducedTeamName)
                        : React.createElement("span", { className: "playground-project-settings-source-button" }, reducedTeamName)
                    ),
                    React.createElement(PlatformPermissionsPage, {
                      permissionSet: selectedRolePermissionSet,
                      accessOptions: PLAYGROUND_PERMISSION_ACCESS_OPTIONS,
                      ringDefinitions: PLAYGROUND_PERMISSION_RING_DEFINITIONS,
                      actionDefinitions: PLAYGROUND_PERMISSION_ACTION_DEFINITIONS,
                      subjectType: "project_team_role",
                      animationKey: projectPermissionChartAnimationKey,
                      disabled: true,
                    })
                  )
                )
              );
            };
            if (hasReducedProjectSettingsAccess) {
              return renderReducedProjectRoleView();
            }
	            const closeProjectTeamMenu = () => setProjectOverviewTeamMenuId?.("");
	            const handleOpenTeamDetails = (team) => {
	              if (!team || team.locked) {
	                return;
	              }
	              closeProjectTeamMenu();
	              onOpenTeamPage?.(team.id);
	            };
	            const handleRemoveProjectTeam = (team) => {
	              if (!team || team.locked || !hasRealAccess) {
	                return;
	              }
	              closeProjectTeamMenu();
	              if (String(projectOverviewPermissionTeamId || "") === String(team.id || "")) {
	                closeProjectOverviewPermissionDetail();
	              }
	              updateProjectTeamWorkspaceMembership?.(team.id, "remove");
	            };
	            const handleAddProjectTeam = (team) => {
	              if (!team || !hasRealAccess) {
	                return;
	              }
	              closeProjectTeamMenu();
	              updateProjectTeamWorkspaceMembership?.(team.id, "add");
	            };
	            const renderProjectTeamMenu = (team) => {
	              const menuId = "team:" + String(team.id || "");
	              if (projectOverviewTeamMenuId !== menuId) {
	                return null;
	              }
	              return React.createElement(PlatformPopupSurface, {
	                  className: "playground-tasks-toolbar-popup-menu playground-project-team-action-menu playground-tasks-toolbar-popup-menu-animate-down-in",
	                  onClick: (event) => event.stopPropagation(),
	                },
	                team.locked
	                  ? React.createElement("button", {
	                      type: "button",
	                      className: "tb-popup-row playground-project-team-menu-item",
	                      disabled: true,
	                    }, "Default workspace access")
	                  : React.createElement(React.Fragment, null,
	                      React.createElement("button", {
	                        type: "button",
	                        className: "tb-popup-row playground-project-team-menu-item",
	                        onClick: () => handleOpenTeamDetails(team),
	                      },
	                        React.createElement(ExternalLink, { width: 14, height: 14, strokeWidth: 1.8 }),
	                        React.createElement("span", null, "View team")
	                      ),
	                      hasRealAccess
	                        ? React.createElement("button", {
	                            type: "button",
	                            className: "tb-popup-row playground-project-team-menu-item is-danger",
	                            onClick: () => handleRemoveProjectTeam(team),
	                          },
	                            React.createElement(Trash2, { width: 14, height: 14, strokeWidth: 1.8 }),
	                            React.createElement("span", null, "Remove from project")
	                          )
	                        : null
	                    )
	              );
	            };
	            const renderAddProjectTeamsMenuContent = () =>
	              removedWorkspaceTeams.length
	                ? removedWorkspaceTeams.map((team) =>
	                    React.createElement("button", {
	                      key: team.id,
	                      type: "button",
	                      role: "menuitem",
	                      className: "tb-popup-row playground-project-team-menu-item",
	                      onClick: () => handleAddProjectTeam(team),
	                    },
	                      React.createElement(UsersRound, { width: 14, height: 14, strokeWidth: 1.8 }),
	                      React.createElement("span", null, team.name || "Untitled team")
	                    )
	                  )
	                : React.createElement("button", {
	                    type: "button",
	                    role: "menuitem",
	                    className: "tb-popup-row playground-project-team-menu-item",
	                    disabled: true,
	                  }, workspaceTeamsLoading ? "Loading teams..." : "All teams already have access");

	            const renderProjectAccessSettings = () => {
	              const isAddTeamsMenuOpen = projectOverviewTeamMenuId === "add-teams";
	              const addTeamsControl = hasRealAccess
	                ? React.createElement(PlatformPopup, {
	                    open: isAddTeamsMenuOpen,
	                    variant: "minimal",
	                    portal: true,
	                    placement: "bottom-end",
	                    portalOffset: 6,
	                    rootClassName: "playground-project-teams-add-shell",
	                    surfaceClassName: "playground-project-teams-add-menu",
	                    surfaceProps: {
	                      role: "menu",
	                      "aria-label": "Add teams to project",
	                      onClick: (event) => event.stopPropagation(),
	                      onKeyDown: (event) => {
	                        if (event.key === "Escape") {
	                          event.preventDefault();
	                          event.stopPropagation();
	                          closeProjectTeamMenu();
	                        }
	                      },
	                    },
	                    animation: "down-in",
	                    trigger: React.createElement(PlatformSecondaryButton, {
	                      type: "button",
	                      size: "small",
	                      className: "playground-project-teams-add-button",
	                      "aria-haspopup": "menu",
	                      "aria-expanded": isAddTeamsMenuOpen ? "true" : "false",
	                      onClick: (event) => {
	                        event.stopPropagation();
	                        if (!workspaceTeamsLoading) requestProjectOverviewWorkspaceTeams?.();
	                        setProjectOverviewTeamMenuId?.((current) => current === "add-teams" ? "" : "add-teams");
	                      },
	                      disabled: workspaceTeamsLoading,
	                    },
	                      React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
	                      React.createElement("span", null, "Add Teams")
	                    )
	                  },
	                    renderAddProjectTeamsMenuContent()
	                  )
	                : null;
	              const systemPrincipal = getPlatformSystemAccessPrincipal(selectedPermissionTeam?.id);
	              const selectedRoleDefinition = getPlaygroundTeamRoleDefinition(projectOverviewPermissionRoleId);
	              return React.createElement(PlatformResourceAccessSettings, {
	                teams: projectSharedTeams.map((team) => ({ ...team, description: team.meta })),
	                resourceLabel: "Project",
	                selectedPrincipalId: projectOverviewPermissionTeamId,
	                onSelectedPrincipalIdChange: (principalId) => {
	                  const normalizedPrincipalId = String(principalId || "").trim();
	                  if (!normalizedPrincipalId) {
	                    closeProjectOverviewPermissionDetail();
	                    return;
	                  }
	                  const principal = projectPermissionTeams.find((team) =>
	                    String(team.id) === normalizedPrincipalId
	                  );
	                  if (principal) {
	                    openProjectOverviewPermissionDetail(principal, projectOverviewPermissionRoleId);
	                  }
	                },
	                subjectType: "project",
	                teamSubjectType: "project_team_role",
	                systemPermissionSet: getPlatformSystemPrincipalPermissionSet(
	                  projectMetadata,
	                  systemPrincipal?.id || PLATFORM_ALL_AGENTS_PRINCIPAL_ID,
	                  "project",
	                  projectPermissionSet
	                ),
	                onSystemPermissionSetChange: hasRealAccess
	                  ? updateProjectPermissionSet
	                  : undefined,
	                systemRolePermissionSet:
	                  systemPrincipal &&
	                  isPlatformRoleScopedSystemAccessPrincipalId(systemPrincipal.id)
	                    ? getProjectSystemRolePermissionSet(
	                        projectOverviewDraft || selectedProject,
	                        systemPrincipal.id,
	                        selectedRoleDefinition.id
	                      )
	                    : null,
	                onSystemRolePermissionSetChange: hasRealAccess
	                  ? updateProjectSystemRolePermissionSet
	                  : undefined,
	                roles: PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
	                  id: role.id,
	                  label: role.label,
	                  description: role.description,
	                  meta: "Project access",
	                })),
	                selectedRoleId: selectedRoleDefinition.id,
	                onSelectedRoleIdChange: (roleId) => setProjectOverviewPermissionRoleId?.(roleId),
	                teamPermissionSet: selectedPermissionTeam && !systemPrincipal
	                  ? getProjectTeamRolePermissionSet(
	                      projectOverviewDraft || selectedProject,
	                      selectedPermissionTeam.id,
	                      selectedRoleDefinition.id
	                    )
	                  : null,
	                onTeamPermissionSetChange: hasRealAccess && selectedPermissionTeam && !systemPrincipal
	                  ? (roleId, permissionSet) => updateProjectTeamRolePermissionSet(
	                      selectedPermissionTeam.id,
	                      roleId,
	                      permissionSet
	                    )
	                  : undefined,
	                animationKey: projectPermissionChartAnimationKey,
	                disabled: !hasRealAccess,
	                backLabel: "Settings",
	                className: "playground-project-settings-access-section",
	                tableProps: {
	                  className: "playground-project-access-platform-data-table",
	                  trailing: addTeamsControl,
	                  onRemoveTeams: hasRealAccess
	                    ? (teams) => teams.forEach((team) => handleRemoveProjectTeam(team))
	                    : undefined,
	                  formatCreatedAt: (value) => formatProjectTeamCreatedDate(value) || "—",
	                },
	              });
	            }

	            if (selectedPermissionTeam) {
	              return renderProjectAccessSettings();
	            }

	            return React.createElement("section", {
	                className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root",
	              },
	              renderProjectOverviewWallpaperSettingsSection(),
	              renderProjectOverviewPluginsPanel(),
	              renderProjectOverviewSettingsRulesSection(),
	              renderProjectAccessSettings()
	            );
	          }

            const projectOverviewActivePanel = activeProjectOverviewHomeTab === "resources"
                ? renderProjectOverviewResourcesPanel()
                : activeProjectOverviewHomeTab === "strategy"
                  ? renderProjectOverviewStrategyPanel()
                  : activeProjectOverviewHomeTab === "permissions"
                    ? renderProjectOverviewPermissionsPanel()
                    : renderProjectOverviewGeneralPanel();

	          return React.createElement("div", { className: "playground-tasks-view-section playground-project-overview-view is-" + activeProjectOverviewHomeTab },
            React.createElement("div", { className: "playground-project-overview-hero-shell" },
              React.createElement(ProjectDetailPage, {
                  header: React.createElement("div", { className: "playground-project-overview-summary-copy" },
                    React.createElement("div", { className: "playground-project-overview-summary-title-row" },
                      React.createElement("h1", { className: "playground-project-overview-summary-title" }, selectedProject.name || "Untitled Project")
                    )
                  ),
                  tabBarActions: activeProjectOverviewHomeTab === "general"
                    ? React.createElement(PlatformSecondaryButton, {
                        type: "button",
                        className: "playground-files-control-button playground-project-overview-summary-mission-button",
                        onClick: openMissionControlComposer,
                      },
                        React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 1.8 }),
                        React.createElement("span", { className: "playground-project-overview-summary-mission-label" }, "Mission Control")
                      )
                    : null,
                  activeTab: activeProjectOverviewHomeTab,
                  onTabChange: handleProjectOverviewHomeTabChange,
                  showSettings: canViewProjectSettings,
                  sidebarCollapsed: projectOverviewSidebarCollapsed,
                  sidebarToggle: React.createElement("button", {
                    type: "button",
                    className: "playground-project-overview-sidebar-toggle",
                    onClick: () => {
                      projectOverviewSidebarAutoCollapsedForTaskRef.current = false;
                      projectOverviewSidebarAutoCollapsedForPermissionRef.current = false;
                      setProjectOverviewSidebarCollapsed((current) => !current);
                    },
                    title: projectOverviewSidebarCollapsed ? "Show project sidebar" : "Hide project sidebar",
                    "aria-label": projectOverviewSidebarCollapsed ? "Show project sidebar" : "Hide project sidebar",
                    "aria-pressed": projectOverviewSidebarCollapsed ? "true" : "false",
                  },
                    React.createElement(PanelRight, {
                      width: 15,
                      height: 15,
                      strokeWidth: 1.8,
                    })
                  ),
                  sidebar: renderProjectOverviewSidebar(),
                },
                projectOverviewActivePanel
              )
            )
          );
        }
`;
