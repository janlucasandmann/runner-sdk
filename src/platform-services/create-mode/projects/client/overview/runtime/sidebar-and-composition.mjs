export const PROJECT_OVERVIEW_SIDEBAR_COMPOSITION_FRAGMENT = String.raw`
          function updateProjectOverviewNameDraftValue(nextValue) {
            const normalizedProjectId = String(selectedProjectId || selectedProject?.id || "").trim();
            const nextName = String(nextValue ?? "").replace(/\s+/g, " ");
            if (!normalizedProjectId || typeof setProjectDraft !== "function") {
              return;
            }
            setProjectDraft((current) => {
              if (!current || String(current.id || "") !== normalizedProjectId) {
                return current;
              }
              const currentMetadata = current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                ? current.metadata
                : {};
              return normalizePlaygroundProjectRecord({
                ...current,
                name: nextName,
                metadata: {
                  ...currentMetadata,
                  name: nextName,
                },
              });
            });
          }

          async function saveProjectOverviewName(nameOverride) {
            const normalizedProject = normalizePlaygroundProjectRecord(selectedProject);
            const normalizedProjectId = String(normalizedProject.id || selectedProjectId || "").trim();
            const nextName = String(nameOverride ?? normalizedProject.name ?? "")
              .trim()
              .replace(/\s+/g, " ");
            if (!normalizedProjectId || !nextName || nextName === String(normalizedProject.name || "").trim()) {
              return Boolean(normalizedProjectId);
            }
            const updatedProject = await persistProjectOverviewSidebarProjectUpdate({
              name: nextName,
            }, {
              name: nextName,
            });
            if (updatedProject?.id) {
              if (typeof rememberProjectLocalNameOverride === "function") {
                rememberProjectLocalNameOverride(updatedProject.id, nextName);
              }
              return true;
            }
            if (typeof setProjectDraft === "function") {
              setProjectDraft((current) => {
                if (!current || String(current.id || "") !== normalizedProjectId) {
                  return current;
                }
                const currentMetadata = current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
                  ? current.metadata
                  : {};
                return normalizePlaygroundProjectRecord({
                  ...current,
                  name: normalizedProject.name,
                  metadata: {
                    ...currentMetadata,
                    name: normalizedProject.name,
                  },
                });
              });
            }
            return false;
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
              trailing: option?.trailing || undefined,
              ariaLabel: option?.ariaLabel,
              disabled: option?.disabled === true,
              selected: option?.selected === true,
              onSelect: option?.onSelect,
              data: option?.data,
            };
          }

          function getProjectOverviewSidebarOwner(projectRecord = projectOverviewDraft || selectedProject) {
            const project = projectRecord && typeof projectRecord === "object" && !Array.isArray(projectRecord)
              ? projectRecord
              : {};
            const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
              ? project.metadata
              : {};
            const metadataOwner = metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
              ? metadata.owner
              : {};
            const userId = String(
              project.ownerUserId
                || project.userId
                || metadata.ownerUserId
                || metadataOwner.userId
                || metadataOwner.id
                || ""
            ).trim();
            const isCurrentOwner = Boolean(
              userId && userId === String(currentUserId || "").trim()
            );
            const resolvedOwnerCandidate = projectOverviewOwnerCandidatesState?.projectId === String(project.id || "").trim()
              && Array.isArray(projectOverviewOwnerCandidatesState?.items)
                ? projectOverviewOwnerCandidatesState.items
                    .map((candidate) => normalizeProjectOverviewOwnerCandidate(candidate))
                    .find((candidate) => candidate.userId === userId) || null
                : null;
            const email = String(
              (isCurrentOwner ? currentUserEmail : "")
                || resolvedOwnerCandidate?.email
                || project.ownerEmail
                || metadata.ownerEmail
                || metadataOwner.email
                || ""
            ).trim();
            const storedName = String(
              project.ownerName
                || metadata.ownerName
                || metadataOwner.name
                || metadataOwner.displayName
                || ""
            ).trim();
            const storedNameIsGeneric = [
              "project owner",
              "project member",
              "organization member",
              "unknown",
              "unknown user",
            ].includes(storedName.toLowerCase());
            const name = String(
              (isCurrentOwner ? currentUserName : "")
                || resolvedOwnerCandidate?.name
                || (!storedNameIsGeneric ? storedName : "")
                || email
                || storedName
                || "Project owner"
            ).trim();
            const avatarUrl = String(
              (isCurrentOwner ? currentUserAvatarUrl : "")
                || resolvedOwnerCandidate?.avatarUrl
                || project.ownerAvatarUrl
                || metadata.ownerAvatarUrl
                || metadataOwner.avatarUrl
                || metadataOwner.photoUrl
                || ""
            ).trim();
            return {
              id: userId,
              userId,
              name,
              email,
              avatarUrl,
            };
          }

          function normalizeProjectOverviewOwnerCandidate(candidate) {
            const userId = String(
              getProjectOverviewOwnerCandidateUserId(candidate)
                || candidate?.id
                || ""
            ).trim();
            const email = String(
              getProjectOverviewOwnerCandidateEmail(candidate)
                || candidate?.email
                || ""
            ).trim();
            const name = String(
              getProjectOverviewOwnerCandidateName(candidate)
                || candidate?.name
                || email
                || "Organization member"
            ).trim();
            return {
              id: userId,
              userId,
              name,
              email,
              avatarUrl: String(
                getProjectOverviewOwnerCandidateAvatarUrl(candidate)
                  || candidate?.avatarUrl
                  || ""
              ).trim(),
            };
          }

          function buildProjectOverviewSidebarOwnerOptions() {
            const currentOwner = getProjectOverviewSidebarOwner();
            const candidates = projectOverviewOwnerCandidatesState?.projectId === String(selectedProject?.id || "").trim()
              && Array.isArray(projectOverviewOwnerCandidatesState?.items)
                ? projectOverviewOwnerCandidatesState.items
                : [];
            const options = [];
            const seen = new Set();
            [currentOwner, ...candidates].forEach((candidate) => {
              const normalized = normalizeProjectOverviewOwnerCandidate(candidate);
              if (!normalized.userId || seen.has(normalized.userId)) {
                return;
              }
              seen.add(normalized.userId);
              options.push(normalized);
            });
            return options;
          }

          async function requestProjectOverviewOwnerCandidates(options = {}) {
            const projectId = String((projectOverviewDraft || selectedProject)?.id || normalizedSelectedProjectId || "").trim();
            if (!projectId || typeof setProjectOverviewOwnerCandidatesState !== "function") {
              return [];
            }
            const isCurrentProject = projectOverviewOwnerCandidatesState?.projectId === projectId;
            if (
              !options.force
              && isCurrentProject
              && ["loading", "ready"].includes(projectOverviewOwnerCandidatesState?.status)
            ) {
              return Array.isArray(projectOverviewOwnerCandidatesState?.items)
                ? projectOverviewOwnerCandidatesState.items
                : [];
            }
            setProjectOverviewOwnerCandidatesState((current) => ({
              projectId,
              status: "loading",
              error: "",
              items: current?.projectId === projectId && Array.isArray(current.items) ? current.items : [],
            }));
            try {
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId) + "/owner-candidates",
                { headers: requestHeaders }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to load project owners.");
              }
              const items = (Array.isArray(data?.data) ? data.data : [])
                .map((candidate) => normalizeProjectOverviewOwnerCandidate(candidate))
                .filter((candidate) => candidate.userId);
              setProjectOverviewOwnerCandidatesState({
                projectId,
                status: "ready",
                error: "",
                items,
              });
              return items;
            } catch (error) {
              setProjectOverviewOwnerCandidatesState((current) => ({
                projectId,
                status: "error",
                error: error instanceof Error ? error.message : "Failed to load project owners.",
                items: current?.projectId === projectId && Array.isArray(current.items) ? current.items : [],
              }));
              return [];
            }
          }

          async function transferProjectOverviewOwnership(candidate) {
            const nextOwner = normalizeProjectOverviewOwnerCandidate(candidate);
            const baseProject = normalizePlaygroundProjectRecord(projectOverviewDraft || selectedProject);
            const projectId = String(baseProject?.id || normalizedSelectedProjectId || "").trim();
            const currentOwner = getProjectOverviewSidebarOwner(baseProject);
            if (!projectId || !nextOwner.userId || nextOwner.userId === currentOwner.userId) {
              if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
                setProjectOverviewSidebarPropertyPopover("");
              }
              return;
            }
            const baseMetadata = getProjectOverviewSidebarMetadata(baseProject);
            const ownerRecord = {
              userId: nextOwner.userId,
              name: nextOwner.name,
              email: nextOwner.email,
              avatarUrl: nextOwner.avatarUrl,
            };
            const optimisticProject = normalizePlaygroundProjectRecord({
              ...baseProject,
              userId: nextOwner.userId,
              ownerUserId: nextOwner.userId,
              ownerName: nextOwner.name,
              ownerEmail: nextOwner.email,
              ownerAvatarUrl: nextOwner.avatarUrl,
              owner: ownerRecord,
              metadata: {
                ...baseMetadata,
                ownerUserId: nextOwner.userId,
                ownerName: nextOwner.name,
                ownerEmail: nextOwner.email,
                ownerAvatarUrl: nextOwner.avatarUrl,
                owner: ownerRecord,
              },
            });
            if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
              setProjectOverviewSidebarPropertyPopover("");
            }
            commitProjectOverviewSidebarProjectRecord(optimisticProject);
            if (typeof setProjectSaveState === "function") {
              setProjectSaveState({ isSaving: true, error: "", message: "" });
            }
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              const response = await fetch(
                backendUrl + "/projects/" + encodeURIComponent(projectId) + "/owner",
                {
                  method: "PATCH",
                  headers,
                  body: JSON.stringify({ ownerUserId: nextOwner.userId }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to transfer project ownership.");
              }
              const updatedProject = getPlaygroundProjectResponseRecord(data, optimisticProject);
              commitProjectOverviewSidebarProjectRecord(updatedProject || optimisticProject);
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({ isSaving: false, error: "", message: "" });
              }
            } catch (error) {
              commitProjectOverviewSidebarProjectRecord(baseProject);
              const normalizedError = error instanceof Error
                ? error
                : new Error("Failed to transfer project ownership.");
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({
                  isSaving: false,
                  error: normalizedError.message,
                  message: "",
                });
              }
              throw normalizedError;
            }
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
              onValueChange: (nextValue, option) => {
                if (typeof options.onValueChange === "function") {
                  options.onValueChange(nextValue, option);
                } else if (typeof option?.onSelect === "function") {
                  option.onSelect();
                }
              },
              ariaLabel: String(options.ariaLabel || ("Select project " + normalizedId)),
              label: content,
              placeholder: content,
              open: isOpen,
              onOpenChange: (nextOpen) => {
                if (normalizedId === "owner" && nextOpen) {
                  void requestProjectOverviewOwnerCandidates();
                }
                if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
                  setProjectOverviewSidebarPropertyPopover(nextOpen ? normalizedId : "");
                }
                if (typeof options.onOpenChange === "function") {
                  options.onOpenChange(nextOpen);
                }
              },
              disabled: options.disabled === true,
              loading: options.loading === true,
              loadingContent: options.loadingContent || "Loading organization members...",
              alignment: "end",
              popupAlignment: "right",
              fullWidth: true,
              emptyContent: options.emptyContent || "No options available.",
              popupHeader: options.popupHeader || null,
              popupHeaderClassName: options.popupHeaderClassName || "",
              optionClassName: options.optionClassName || "",
              popupWidth: "min(280px, calc(100vw - 48px))",
              popupMaxWidth: "calc(100vw - 48px)",
              popupMaxHeight: "min(320px, calc(100vh - 120px))",
              className: "playground-tasks-detail-central-selector playground-project-overview-sidebar-selector"
                + (options.empty ? " is-empty" : ""),
              triggerClassName: "playground-tasks-detail-central-selector-trigger playground-project-overview-sidebar-selector-trigger"
                + (options.empty ? " is-empty" : ""),
              popupClassName: "playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup"
                + (options.popupClassName ? " " + options.popupClassName : ""),
            });
          }

          function getProjectOverviewOwnerCandidateSources(record) {
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

          function readProjectOverviewOwnerCandidateString(record, keys = []) {
            for (const source of getProjectOverviewOwnerCandidateSources(record)) {
              for (const key of keys) {
                const value = String(source?.[key] || "").replace(/\s+/g, " ").trim();
                if (value) {
                  return value;
                }
              }
            }
            return "";
          }

          function getProjectOverviewOwnerCandidateName(record) {
            const directName = readProjectOverviewOwnerCandidateString(record, [
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
            for (const source of getProjectOverviewOwnerCandidateSources(record)) {
              const firstName = String(source.firstName || source.first_name || source.givenName || source.given_name || "").trim();
              const lastName = String(source.lastName || source.last_name || source.familyName || source.family_name || "").trim();
              const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
              if (fullName) {
                return fullName;
              }
            }
            return "";
          }

          function getProjectOverviewOwnerCandidateEmail(record) {
            return readProjectOverviewOwnerCandidateString(record, [
              "email",
              "emailAddress",
              "email_address",
              "mail",
              "primaryEmail",
              "primary_email",
            ]).toLowerCase();
          }

          function getProjectOverviewOwnerCandidateUserId(record) {
            return readProjectOverviewOwnerCandidateString(record, [
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

          function getProjectOverviewOwnerCandidateAvatarUrl(record) {
            return readProjectOverviewOwnerCandidateString(record, [
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

          function renderProjectOverviewSidebarRow(label, value, options = {}) {
            const content = options.content || React.createElement("span", null, value || "None");
            return React.createElement("div", {
                className: "playground-tasks-detail-fact playground-project-overview-sidebar-row"
                  + (options.className ? " " + options.className : ""),
              },
              React.createElement("div", {
                className: "playground-tasks-detail-fact-label playground-project-overview-sidebar-row-label",
              }, label),
              React.createElement("div", {
                className: "playground-tasks-detail-fact-control playground-project-overview-sidebar-row-value"
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

          function renderProjectOverviewComputerChangeDialog() {
            if (!projectComputerChangeDialog) {
              return null;
            }
            const sourceName = String(projectComputerChangeDialog.sourceEnvironmentName || "the current computer").trim();
            const targetName = String(projectComputerChangeDialog.targetEnvironmentName || "the new computer").trim();
            return React.createElement(PlatformConfirmationModal, {
              open: true,
              title: "Change project computer?",
              description: "Choose whether to clone this project's directory from " + sourceName + " to " + targetName + " before changing the project computer.",
              confirmLabel: "Clone and change",
              confirmingLabel: "Cloning project...",
              secondaryActionLabel: "Change only",
              secondaryActionPendingLabel: "Changing computer...",
              cancelLabel: "Cancel",
              errorFallback: "The project computer could not be changed.",
              onCancel: () => setProjectComputerChangeDialog(null),
              onSecondaryAction: () => confirmProjectOverviewComputerChange(false),
              onConfirm: () => confirmProjectOverviewComputerChange(true),
            });
          }

          function renderProjectOverviewSidebar() {
            const metadata = selectedProject?.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
              ? selectedProject.metadata
              : {};
            const owner = getProjectOverviewSidebarOwner();
            const progressStats = getProjectOverviewProgressStats();
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
            const normalizedStatusSearchQuery = String(projectOverviewSidebarStatusSearchQuery || "").trim().toLowerCase();
            const statusOptions = PLAYGROUND_PROJECT_STATUS_OPTIONS.map((option, index) => ({
              ...option,
              shortcut: String(index + 1),
            }));
            const visibleStatusOptions = statusOptions.filter((option) => (
              !normalizedStatusSearchQuery
              || option.label.toLowerCase().includes(normalizedStatusSearchQuery)
            ));
            const currentStatusValue = getProjectOverviewSidebarStatusValue();
            const currentStatusOption = statusOptions.find((option) => option.id === currentStatusValue) || statusOptions[0];
            const currentPriorityValue = getProjectOverviewSidebarPriorityValue();
            const currentPriorityPresentation = getPlaygroundTaskPriorityPresentation(currentPriorityValue);
            const normalizedPrioritySearchQuery = String(projectOverviewSidebarPrioritySearchQuery || "").trim().toLowerCase();
            const priorityOptions = PLAYGROUND_TASK_PRIORITY_OPTIONS.map((option, index) => ({
              ...option,
              shortcut: String(index + 1),
            }));
            const visiblePriorityOptions = priorityOptions.filter((option) => (
              !normalizedPrioritySearchQuery
              || option.label.toLowerCase().includes(normalizedPrioritySearchQuery)
            ));
            const currentEnvironmentValue = getProjectOverviewSidebarEnvironmentValue();
            const normalizedComputerSearchQuery = String(projectOverviewSidebarComputerSearchQuery || "").trim().toLowerCase();
            const visibleComputerOptions = projectComposerAvailableEnvironments.filter((environment) => {
              if (!normalizedComputerSearchQuery) {
                return true;
              }
              const environmentName = String(environment?.name || environment?.label || "Computer").trim().toLowerCase();
              return environmentName.includes(normalizedComputerSearchQuery);
            });
            const currentEnvironment = projectComposerAvailableEnvironments.find(
              (environment) => getProjectOverviewEnvironmentId(environment) === currentEnvironmentValue,
            )
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
            const ownerOptions = buildProjectOverviewSidebarOwnerOptions();
            const selectedOwnerId = String(owner.userId || "").trim();
            const ownerCandidatesAreLoading = projectOverviewOwnerCandidatesState?.projectId === String(selectedProject?.id || "").trim()
              && projectOverviewOwnerCandidatesState?.status === "loading";
            const ownershipRecord = projectOverviewDraft || selectedProject || {};
            const canTransferOwnership = typeof ownershipRecord.canTransferOwnership === "boolean"
              ? ownershipRecord.canTransferOwnership
              : Boolean(selectedOwnerId && selectedOwnerId === String(currentUserId || "").trim());
            const isMissionControlRunning = typeof isSelectedProjectMissionControlRunning !== "undefined"
              && Boolean(isSelectedProjectMissionControlRunning);
            const canOpenMissionControl = typeof openMissionControlComposer === "function";
            const fullAutoStatus = String(projectFullAutoState?.status || "idle").trim().toLowerCase();
            const fullAutoIsActive = fullAutoStatus === "queued" || fullAutoStatus === "running";
            const fullAutoIsResumable = fullAutoStatus === "paused" || fullAutoStatus === "failed";
            const fullAutoIsPending = Boolean(
              projectFullAutoState?.isLoading || projectFullAutoState?.isSaving,
            );
            const fullAutoActionLabel = fullAutoIsActive
              ? "Pause Full Auto"
              : fullAutoStatus === "failed"
                ? "Retry Full Auto"
                : fullAutoIsResumable
                  ? "Resume Full Auto"
                  : "Full Auto";
            const fullAutoActionDisabled = fullAutoIsPending
              || (!fullAutoIsActive && !fullAutoIsResumable && !canStartThreads);
            const handleFullAutoAction = () => {
              if (fullAutoActionDisabled) {
                return;
              }
              if (fullAutoIsActive) {
                stopProjectFullAutoMode();
                return;
              }
              if (fullAutoIsResumable) {
                resumeProjectFullAutoMode();
                return;
              }
              void startProjectFullAutoMode();
            };
            const renderProjectStatusIcon = (option) => {
              const StatusIcon = option?.icon || Circle;
              return React.createElement(StatusIcon, {
                className: [
                  "playground-tasks-status-icon",
                  option?.toneClassName,
                  "playground-project-overview-status-icon",
                ].filter(Boolean).join(" "),
                strokeWidth: option?.id === "in_progress" ? 1.7 : 2,
                "aria-hidden": "true",
              });
            };
            const renderStatusContent = (option) => React.createElement("span", {
                className: [
                  "playground-tasks-status-value",
                  option?.toneClassName,
                  "playground-project-overview-status-value",
                ].filter(Boolean).join(" "),
              },
              renderProjectStatusIcon(option),
              React.createElement("span", {
                className: "playground-tasks-status-value-label playground-tasks-detail-select-trigger-label",
              }, option?.label || "Backlog")
            );
            const activeMilestoneRows = getProjectOverviewMilestoneRecords()
              .filter((release) => String(getPlaygroundTaskReleaseStatus(release) || "").trim().toLowerCase() === "active")
              .map((release) => ({
                release,
                progress: getProjectOverviewMilestoneProgress(release),
              }));
            return React.createElement(React.Fragment, null,
              React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  className: "playground-project-overview-sidebar-card",
                },
                React.createElement("div", {
                    className: "playground-tasks-detail-facts is-centralized-sidebar-content playground-project-overview-sidebar-facts",
                  },
                  React.createElement("div", {
                      className: "playground-tasks-detail-facts-body playground-project-overview-sidebar-rows",
                    },
                    renderProjectOverviewSidebarRow("Status", currentStatusOption.label, {
                      className: "is-status",
                      editable: true,
                      content: renderProjectOverviewSidebarSelectControl(
                        "status",
                        currentStatusValue,
                        renderStatusContent(currentStatusOption),
                        {
                          ariaLabel: "Project status",
                          popupClassName: "playground-tasks-detail-status-selector-popup playground-project-overview-status-selector-popup",
                          popupHeader: React.createElement(PlatformPopupSearchHeader, {
                            value: projectOverviewSidebarStatusSearchQuery,
                            onChange: (event) => setProjectOverviewSidebarStatusSearchQuery(event.target.value),
                            placeholder: "Change status...",
                            shortcut: "S",
                            autoFocus: projectOverviewSidebarPropertyPopover === "status",
                            "aria-label": "Search project statuses",
                          }),
                          popupHeaderClassName: "is-search-header",
                          emptyContent: "No matching statuses.",
                          onOpenChange: (nextOpen) => {
                            if (!nextOpen) {
                              setProjectOverviewSidebarStatusSearchQuery("");
                            }
                          },
                          onValueChange: (nextStatus) => selectProjectOverviewSidebarStatus(nextStatus),
                          options: visibleStatusOptions.map((option) => createProjectOverviewSidebarSelectorOption({
                            id: option.id,
                            label: option.label,
                            selected: option.id === currentStatusValue,
                            icon: renderProjectStatusIcon(option),
                            trailing: option.shortcut,
                          })),
                        }
                      ),
                    }),
                    renderProjectOverviewSidebarRow("Priority", getPlaygroundTaskPriorityLabel(currentPriorityValue), {
                    editable: true,
                    content: renderProjectOverviewSidebarSelectControl("priority", currentPriorityValue, React.createElement("span", {
                        className: "playground-tasks-priority-value playground-tasks-detail-priority-value " + currentPriorityPresentation.toneClassName,
                      },
                      renderPlaygroundTaskPriorityGlyph(currentPriorityValue),
                      React.createElement("span", {
                        className: "playground-tasks-priority-value-text playground-tasks-detail-select-trigger-label",
                      }, currentPriorityPresentation.label)
                    ), {
                      ariaLabel: "Project priority",
                      popupClassName: "playground-tasks-detail-priority-selector-popup playground-project-overview-priority-selector-popup",
                      popupHeader: React.createElement(PlatformPopupSearchHeader, {
                        value: projectOverviewSidebarPrioritySearchQuery,
                        onChange: (event) => setProjectOverviewSidebarPrioritySearchQuery(event.target.value),
                        placeholder: "Change priority...",
                        shortcut: "P",
                        autoFocus: projectOverviewSidebarPropertyPopover === "priority",
                        "aria-label": "Search project priorities",
                      }),
                      popupHeaderClassName: "is-search-header",
                      emptyContent: "No matching priorities.",
                      onOpenChange: (nextOpen) => {
                        if (!nextOpen) {
                          setProjectOverviewSidebarPrioritySearchQuery("");
                        }
                      },
                      onValueChange: (nextPriority) => selectProjectOverviewSidebarPriority(nextPriority),
                      options: visiblePriorityOptions.map((option) => createProjectOverviewSidebarSelectorOption({
                        id: option.id,
                        label: getPlaygroundTaskPriorityPresentation(option.id).label,
                        selected: option.id === currentPriorityValue,
                        icon: renderPlaygroundTaskPriorityGlyph(option.id),
                        trailing: option.shortcut,
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
                      popupHeader: React.createElement(PlatformPopupSearchHeader, {
                        value: projectOverviewSidebarComputerSearchQuery,
                        onChange: (event) => setProjectOverviewSidebarComputerSearchQuery(event.target.value),
                        placeholder: "Change computer...",
                        autoFocus: projectOverviewSidebarPropertyPopover === "computer",
                        "aria-label": "Search project computers",
                      }),
                      popupHeaderClassName: "is-search-header",
                      emptyContent: normalizedComputerSearchQuery
                        ? "No matching computers."
                        : "No computers available.",
                      onOpenChange: (nextOpen) => {
                        if (!nextOpen) {
                          setProjectOverviewSidebarComputerSearchQuery("");
                        }
                      },
                      onValueChange: (nextEnvironmentId, option) => requestProjectOverviewComputerChange(
                        nextEnvironmentId,
                        option?.data?.environment,
                      ),
                      options: visibleComputerOptions.length > 0
                        ? visibleComputerOptions.map((environment) => {
                            const environmentId = getProjectOverviewEnvironmentId(environment);
                            const environmentName = String(environment?.name || environment?.label || "Computer").trim();
                            return createProjectOverviewSidebarSelectorOption({
                              id: environmentId,
                              label: environmentName,
                              selected: environmentId && environmentId === currentEnvironmentValue,
                              icon: React.createElement(Monitor, { width: 14, height: 14, strokeWidth: 1.85 }),
                              data: { environment },
                            });
                          })
                        : []
                    }),
                    }),
                    renderProjectOverviewSidebarRow("Owner", owner.name, {
                      className: "is-owner platform-resource-detail-sidebar__owner-row",
                      editable: true,
                      content: React.createElement(PlatformOwnerSelector, {
                        owner: {
                          value: selectedOwnerId || "current-owner",
                          name: owner.name,
                          email: owner.email || "",
                          avatarUrl: owner.avatarUrl || "",
                        },
                        options: ownerOptions.map((option) => ({
                          value: option.userId,
                          name: option.name,
                          email: option.email || "",
                          avatarUrl: option.avatarUrl || "",
                          data: { owner: option },
                        })),
                        onTransfer: async (_nextValue, option) => {
                          if (option?.data?.owner) {
                            await transferProjectOverviewOwnership(option.data.owner);
                          }
                        },
                        ariaLabel: "Project owner",
                        resourceLabel: "project",
                        includeOrganizationMembers: true,
                        open: projectOverviewSidebarPropertyPopover === "owner",
                        onOpenChange: (nextOpen) => {
                          if (nextOpen) void requestProjectOverviewOwnerCandidates();
                          if (typeof setProjectOverviewSidebarPropertyPopover === "function") {
                            setProjectOverviewSidebarPropertyPopover(nextOpen ? "owner" : "");
                          }
                        },
                        disabled: !canTransferOwnership || projectSaveState?.isSaving,
                        loading: ownerCandidatesAreLoading,
                        loadingContent: "Loading organization members...",
                        emptyContent: projectOverviewOwnerCandidatesState?.error || "No eligible organization members.",
                        alignment: "end",
                        popupAlignment: "right",
                        fullWidth: true,
                        popupWidth: 260,
                        popupMaxHeight: "min(320px, calc(100vh - 180px))",
                        className: "platform-resource-detail-sidebar__owner-selector playground-tasks-detail-central-selector playground-project-overview-sidebar-selector",
                        triggerClassName: "playground-tasks-detail-central-selector-trigger playground-project-overview-sidebar-selector-trigger",
                        popupClassName: "playground-tasks-detail-central-selector-popup playground-project-overview-sidebar-selector-popup",
                      }),
                    }),
                    React.createElement(PlatformButtonSelector, {
                      mode: "split-action",
                      buttonVariant: "primary",
                      buttonSize: "small",
                      label: isMissionControlRunning ? "Running Mission Control" : "Mission Control",
                      actionAriaLabel: "Run Mission Control",
                      popupAriaLabel: "Project automation options",
                      popupRole: "menu",
                      popupVariant: "minimal",
                      popupAlignment: "left",
                      matchTriggerWidth: true,
                      fullWidth: true,
                      closeOnSelect: true,
                      className: "playground-project-overview-sidebar-mission-button",
                      actionDisabled: !canOpenMissionControl || isMissionControlRunning,
                      popupDisabled: false,
                      onAction: () => {
                        if (canOpenMissionControl) {
                          openMissionControlComposer();
                        }
                      },
                    },
                    React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row",
                        disabled: fullAutoActionDisabled,
                        onClick: handleFullAutoAction,
                      }, fullAutoActionLabel),
                    React.createElement("button", {
                        type: "button",
                        role: "menuitem",
                        className: "tb-popup-row",
                        onClick: () => {
                          if (typeof openProjectOverviewUpdateComposer === "function") {
                            openProjectOverviewUpdateComposer();
                          }
                        },
                      }, "Post Update")
                    )
                  )
                )
              ),
              React.createElement(PlatformUiCard, {
                  as: "section",
                  variant: "sidebar",
                  className: "playground-project-overview-sidebar-card playground-project-overview-milestones-card",
                },
                React.createElement("div", {
                    className: "playground-project-overview-milestones-card__header",
                  },
                  React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-milestones-card__title",
                      onClick: () => handleProjectOverviewHomeTabChange("milestones"),
                    },
                    React.createElement("span", null, "Milestones")
                  ),
                  React.createElement("button", {
                      type: "button",
                      className: "playground-project-overview-milestones-card__add",
                      onClick: () => {
                        if (typeof openReleaseComposer === "function") {
                          openReleaseComposer();
                        }
                      },
                      title: "Add milestone",
                      "aria-label": "Add milestone",
                    },
                    React.createElement(Plus, {
                      width: 16,
                      height: 16,
                      strokeWidth: 1.8,
                      "aria-hidden": "true",
                    })
                  )
                ),
                activeMilestoneRows.length > 0
                  ? React.createElement("div", {
                      className: "playground-project-overview-milestones-card__list",
                    },
                    activeMilestoneRows.map(({ release, progress }) => {
                      const milestoneName = String(release?.name || "Untitled Milestone").trim() || "Untitled Milestone";
                      return React.createElement("div", {
                          key: String(release.id),
                          className: "playground-project-overview-milestones-card__row",
                        },
                        React.createElement("button", {
                            type: "button",
                            className: "playground-project-overview-milestones-card__open",
                            onClick: () => {
                              if (typeof openReleaseComposerForEdit === "function") {
                                openReleaseComposerForEdit(release);
                              }
                            },
                            title: "Open " + milestoneName,
                          },
                          React.createElement("span", {
                            className: "playground-project-overview-milestones-card__progress",
                            style: {
                              "--project-milestone-progress": String(progress.percent) + "%",
                            },
                            "aria-label": String(progress.percent) + "% complete",
                          }),
                          React.createElement("span", {
                            className: "playground-project-overview-milestones-card__name",
                          }, milestoneName),
                          React.createElement("span", {
                            className: "playground-project-overview-milestones-card__meta",
                          }, String(progress.completed) + " of " + String(progress.total))
                        )
                      );
                    })
                  )
                  : React.createElement("div", {
                      className: "playground-project-overview-milestones-card__empty",
                    }, "No active milestones.")
              )
            );
          }

	          function renderProjectOverviewRulesPanel(options = {}) {
	            const isInline = Boolean(options?.inline);
	            const isReadOnly = Boolean(options?.readOnly);
	            const ruleEntries = splitPlaygroundProjectRuleEntries(projectRulesDraft || selectedProjectRules);
	            const canAddRule = !isReadOnly
	              && Boolean(normalizePlaygroundProjectRuleTitle(projectRuleTitleInputValue))
	              && Boolean(normalizePlaygroundProjectRuleEntry(projectRuleInputValue))
	              && !projectRulesSaveState.isSaving;

	            function closeProjectOverviewRuleComposer() {
	              if (typeof closeProjectRuleComposer === "function") {
	                closeProjectRuleComposer();
	                return;
	              }
	              setProjectRuleComposerOpen(false);
	              setProjectRuleTitleInputValue("");
	              setProjectRuleInputValue("");
	              setProjectRuleEditingIndex(-1);
	              setProjectRuleEditingValue("");
	            }

	            function renderProjectOverviewRuleComposerModal() {
	              if (isReadOnly || !projectRuleComposerOpen) {
	                return null;
	              }
	              const isEditingRule = projectRuleEditingIndex >= 0;
	              return React.createElement(PlatformModal, {
	                  open: projectRuleComposerOpen,
	                  visible: projectRuleComposerVisible,
	                  closing: projectRuleComposerClosing,
	                  animationDurationMs: projectRuleComposerAnimationMs,
	                  onClose: () => closeProjectOverviewRuleComposer(),
	                  as: "form",
	                  size: "large",
	                  maxHeight: "80vh",
	                  title: isEditingRule ? "Edit Rule" : "Add Rule",
	                  headerVariant: "search",
	                  headerLeading: React.createElement("span", {
	                    className: "playground-tasks-detail-type-badge is-rule",
	                    "aria-hidden": "true",
	                  }, React.createElement(Shield, { width: 12, height: 12, strokeWidth: 1.9 })),
	                  headerSearchProps: {
	                    icon: null,
	                    value: projectRuleTitleInputValue,
	                    placeholder: "Rule title",
	                    "aria-label": "Rule title",
	                    autoComplete: "off",
	                    onChange: (event) => setProjectRuleTitleInputValue(event.target.value),
	                    onKeyDown: (event) => {
	                      if (
	                        event.key !== "Tab"
	                        || event.shiftKey
	                        || event.metaKey
	                        || event.ctrlKey
	                        || event.altKey
	                      ) {
	                        return;
	                      }
	                      event.preventDefault();
	                      window.requestAnimationFrame(() => {
	                        projectRuleDescriptionEditorRef.current?.focus?.({ preventScroll: true });
	                      });
	                    },
	                  },
	                  className: "playground-project-milestone-modal playground-project-rule-modal",
	                  bodyClassName: "playground-project-milestone-modal__body playground-project-rule-modal__body",
	                  footerClassName: "playground-project-milestone-modal__footer playground-project-rule-modal__footer",
	                  closeButtonLabel: "Close rule",
	                  closeButtonDisabled: projectRulesSaveState.isSaving,
	                  surfaceProps: {
	                    onSubmit: (event) => {
	                      event.preventDefault();
	                      void handleAddProjectRuleEntry();
	                    },
	                    onKeyDown: (event) => {
	                      if (
	                        !(event.metaKey || event.ctrlKey)
	                        || event.key !== "Enter"
	                        || !canAddRule
	                      ) {
	                        return;
	                      }
	                      event.preventDefault();
	                      event.currentTarget?.requestSubmit?.();
	                    },
	                  },
	                  footer: React.createElement(React.Fragment, null,
	                    isEditingRule
	                      ? React.createElement(PlatformSecondaryButton, {
	                          type: "button",
	                          size: "medium",
	                          className: "playground-project-milestone-modal__delete-button playground-project-rule-modal__delete-button",
	                          style: { marginRight: "auto" },
	                          onClick: () => requestProjectRuleEntryDeletion(projectRuleEditingIndex),
	                          disabled: projectRulesSaveState.isSaving || Boolean(projectRuleDeleteDialogState),
	                        }, "Delete")
	                      : null,
	                    React.createElement(PlatformSecondaryButton, {
	                      type: "button",
	                      size: "medium",
	                      onClick: closeProjectOverviewRuleComposer,
	                      disabled: projectRulesSaveState.isSaving,
	                    }, "Cancel"),
	                    React.createElement(PlatformPrimaryButton, {
	                      size: "medium",
	                      type: "submit",
	                      disabled: !canAddRule,
	                    }, projectRulesSaveState.isSaving
	                      ? "Saving..."
	                      : (isEditingRule ? "Save Rule" : "Add Rule"))
	                  ),
	                },
	                React.createElement("div", { className: "playground-mission-control-modal-context playground-project-rule-modal__context" },
	                  React.createElement(PlatformInstructionsEditor, {
	                    variant: "minimalistic-ui",
	                    title: "Description",
	                    value: projectRuleInputValue,
	                    onChange: (nextValue) => setProjectRuleInputValue(nextValue),
	                    placeholder: "Describe the rule agents should follow in this project.",
	                    ariaLabel: "Rule description",
	                    historyKey: "project-rule-description:"
	                      + String(selectedProjectId || "")
	                      + ":"
	                      + String(projectRuleEditingIndex >= 0 ? projectRuleEditingIndex : "new"),
	                    editorRef: projectRuleDescriptionEditorRef,
	                    stickyHeader: false,
	                    className: "playground-project-milestone-modal__description playground-project-rule-modal__description",
	                  }),
	                  projectRulesSaveState?.error
	                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, projectRulesSaveState.error)
	                    : null
	                )
	              );
	            }

	            function renderProjectOverviewRuleDeleteDialog() {
	              if (!projectRuleDeleteDialogState) {
	                return null;
	              }
	              const ruleTitle = String(projectRuleDeleteDialogState.title || "Untitled Rule");
	              return React.createElement(PlatformConfirmationModal, {
	                open: true,
	                title: "Delete " + ruleTitle + "?",
	                description: ruleTitle + " will be permanently deleted. This action cannot be undone.",
	                confirmLabel: "Delete",
	                confirmingLabel: "Deleting...",
	                tone: "default",
	                errorFallback: "Failed to delete rule.",
	                onCancel: () => setProjectRuleDeleteDialogState(null),
	                onConfirm: confirmProjectRuleEntryDeletion,
	              });
	            }

	            return React.createElement("section", {
	                className: "playground-project-overview-rules-tab" + (isInline ? " is-inline" : ""),
	                ref: isInline ? null : projectOverviewRulesSurfaceRef,
	              },
	              React.createElement("div", { className: "playground-project-overview-rules-list" },
	                ruleEntries.length > 0
	                  ? ruleEntries.map((entry, index) => {
	                      const rule = parsePlaygroundProjectRuleEntry(entry, index);
	                      return React.createElement("div", {
	                        key: String(index) + ":" + rule.title,
	                        className: "playground-tasks-backlog-item playground-project-overview-rule-item",
	                      },
	                        React.createElement("div", { className: "playground-tasks-backlog-item-content" },
	                          React.createElement("div", { className: "playground-tasks-backlog-leading" },
	                            React.createElement("span", { className: "playground-tasks-backlog-project-icon is-rule" },
	                              React.createElement(Shield, { width: 13, height: 13, strokeWidth: 1.8 })
	                            )
	                          ),
	                          React.createElement("div", { className: "playground-tasks-backlog-main playground-project-overview-rule-main" },
	                            React.createElement("div", {
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
	                                  React.createElement("div", {
	                                    className: "playground-project-overview-rule-title",
	                                  }, rule.title || "Untitled Rule")
	                                )
	                          ),
	                          isReadOnly
	                            ? null
	                            : React.createElement("div", { className: "playground-tasks-backlog-meta" },
	                                React.createElement("button", {
	                                  type: "button",
	                                  className: "playground-project-overview-rule-remove",
	                                  onClick: () => requestProjectRuleEntryDeletion(index),
	                                  disabled: projectRulesSaveState.isSaving,
	                                  title: "Remove rule",
	                                  "aria-label": "Remove rule " + String(index + 1),
	                                }, React.createElement(Trash2, { width: 13, height: 13, strokeWidth: 1.8 }))
	                              )
	                        )
	                      );
	                    })
	                  : React.createElement(PlatformEmptyState, {
	                      className: "playground-project-overview-rules-empty",
	                      icon: Shield,
	                      title: "No rules yet",
	                      description: "Add project rules for repository conventions, deployment expectations, commit policy, communication style, or other operating constraints.",
	                    }),
	                projectRulesSaveState.error
	                  ? React.createElement("div", { className: "playground-environments-error playground-tasks-comment-feedback" }, projectRulesSaveState.error)
	                  : projectRulesSaveState.isSaving
	                    ? React.createElement("div", { className: "playground-environments-muted playground-tasks-comment-feedback" }, "Saving changes...")
	                    : null
	              ),
	              renderProjectOverviewRuleComposerModal(),
	              renderProjectOverviewRuleDeleteDialog()
	            );
	          }

	          function renderProjectOverviewSettingsRulesSection(options = {}) {
	            const canEditRules = options?.canEdit !== false;
	            return React.createElement("section", {
	                className: "playground-project-settings-section playground-project-settings-rules-section" + (canEditRules ? "" : " is-read-only"),
	              },
	              React.createElement("div", { className: "playground-project-overview-strategy-add-row playground-project-overview-rules-inline-title-row" },
	                React.createElement("div", { className: "playground-project-settings-rules-heading-copy" },
	                  React.createElement("h2", { className: "playground-project-overview-strategy-add-title" }, "Rules"),
	                  React.createElement("p", { className: "playground-project-settings-rules-description" },
	                    "Rules are durable project-specific instructions that agents must follow across tickets and threads."
	                  )
	                ),
	                canEditRules
	                  ? React.createElement(PlatformPrimaryButton, {
	                      type: "button",
	                      size: "small",
	                      className: "playground-project-settings-add-rule-button",
	                      onClick: () => {
	                        if (typeof setProjectRuleEditingIndex === "function") {
	                          setProjectRuleEditingIndex(-1);
	                        }
	                        if (typeof setProjectRuleEditingValue === "function") {
	                          setProjectRuleEditingValue("");
	                        }
	                        if (typeof setProjectRuleTitleInputValue === "function") {
	                          setProjectRuleTitleInputValue("");
	                        }
	                        if (typeof setProjectRuleInputValue === "function") {
	                          setProjectRuleInputValue("");
	                        }
	                        if (typeof setProjectRuleComposerOpen === "function") {
	                          setProjectRuleComposerOpen(true);
	                        }
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

              function renderProjectOverviewSettingsLayout(sections, options = {}) {
                const availableSections = (Array.isArray(sections) ? sections : [])
                  .filter((section) => section && section.id && typeof section.render === "function");
                if (!availableSections.length) {
                  return null;
                }
                const requestedSectionId = String(projectOverviewSettingsSection || "").trim();
                const activeSection = availableSections.find((section) => section.id === requestedSectionId)
                  || availableSections[0];
                const contentId = "project-settings-section-" + activeSection.id;
                const isAccessDetail = activeSection.id === "access"
                  && Boolean(String(projectOverviewPermissionTeamId || "").trim());
                return React.createElement("section", {
                    className: "playground-project-overview-panel-plain playground-project-overview-panel-full playground-project-teams-section playground-project-settings-root playground-project-settings-layout"
                      + (isAccessDetail ? " is-access-detail" : "")
                      + (options.className ? " " + options.className : ""),
                    "data-project-settings-section": activeSection.id,
                  },
                  !isAccessDetail ? React.createElement("aside", {
                      className: "playground-project-settings-navigation",
                      "aria-label": "Project settings sections",
                    },
                    React.createElement("div", { className: "playground-project-settings-navigation__header" },
                      React.createElement("h2", { className: "playground-project-settings-navigation__title" }, "Settings")
                    ),
                    React.createElement("div", {
                        className: "platform-role-permissions-page__roles playground-team-role-list playground-project-settings-navigation__links",
                        role: "tablist",
                        "aria-label": "Project settings sections",
                      },
                      availableSections.map((section) => React.createElement("button", {
                          key: section.id,
                          type: "button",
                          role: "tab",
                          className: "platform-role-permissions-page__role playground-team-role-card playground-project-settings-navigation__link"
                            + (section.id === activeSection.id ? " is-active" : ""),
                          "aria-selected": section.id === activeSection.id,
                          "aria-controls": "project-settings-section-" + section.id,
                          onClick: () => {
                            if (section.id !== "access") {
                              closeProjectOverviewPermissionDetail({ restoreSidebar: false });
                            } else if (typeof requestProjectOverviewWorkspaceTeams === "function") {
                              requestProjectOverviewWorkspaceTeams();
                            }
                            setProjectOverviewSettingsSection(section.id);
                          },
                        },
                        React.createElement("span", { className: "platform-role-permissions-page__role-heading playground-team-role-card-heading" },
                          React.createElement("span", { className: "playground-project-settings-navigation__link-label" },
                            section.icon
                              ? React.createElement(section.icon, {
                                  className: "playground-project-settings-navigation__link-icon",
                                  width: 14,
                                  height: 14,
                                  strokeWidth: 1.8,
                                  "aria-hidden": true,
                                })
                              : null,
                            React.createElement("span", { className: "platform-role-permissions-page__role-title playground-team-role-card-title" }, section.label)
                          )
                        )
                      ))
                    )
                  ) : null,
                  React.createElement("div", {
                      id: contentId,
                      role: "tabpanel",
                      className: "playground-project-settings-content",
                      "aria-label": activeSection.label,
                    },
                    activeSection.render()
                  )
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
	            const projectSharedTeamIds = new Set(
	              getPlatformSharedTeamIds(projectMetadata)
	                .map((teamId) => String(teamId || "").trim())
	                .filter((teamId) => teamId && !projectRemovedTeamIds.has(teamId))
	            );
			            const projectSharedTeams = availableWorkspaceTeams.map((team) => {
		                const teamId = String(team?.id || "").trim();
		                if (
		                  !teamId
		                  || isPlatformSystemAccessPrincipalId(teamId)
		                  || !projectSharedTeamIds.has(teamId)
		                ) {
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
              const renderReducedProjectAccessSection = () => React.createElement("section", {
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
                );
              const reducedSettingsSections = [
                {
                  id: "timeline",
                  label: "Timeline",
                  icon: History,
                  render: () => renderProjectOverviewTimelineSettingsSection({ canEdit: false }),
                },
                canViewProjectRules
                  ? {
                      id: "rules",
                      label: "Rules",
                      icon: ListTodo,
                      render: () => renderProjectOverviewSettingsRulesSection({ canEdit: canEditProjectRules }),
                    }
                  : null,
                {
                  id: "access",
                  label: "Access",
                  icon: KeyRound,
                  render: renderReducedProjectAccessSection,
                },
              ];
              return renderProjectOverviewSettingsLayout(reducedSettingsSections, {
                className: "playground-project-settings-reduced-access-root",
              });
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
	            const renderProjectAccessSettings = () => {
	              const systemPrincipal = getPlatformSystemAccessPrincipal(selectedPermissionTeam?.id);
	              const selectedAccessRoleId = normalizeProjectAccessRoleId(
	                systemPrincipal?.id || selectedPermissionTeam?.id,
	                projectOverviewPermissionRoleId,
	                "member"
	              );
	              return React.createElement(PlatformResourceAccessSettings, {
	                teams: projectSharedTeams.map((team) => ({ ...team, description: team.meta })),
	                resourceLabel: "Project",
	                selectedPrincipalId: projectOverviewPermissionTeamId,
	                onSelectedPrincipalIdChange: (principalId) => {
	                  const normalizedPrincipalId = String(principalId || "").trim();
	                  if (!normalizedPrincipalId) {
	                    closeProjectOverviewPermissionDetail();
	                    if (typeof setTaskView === "function") {
	                      setTaskView("overview");
	                    }
	                    if (typeof setProjectOverviewHomeTab === "function") {
	                      setProjectOverviewHomeTab("permissions");
	                    }
	                    if (typeof setProjectOverviewSettingsSection === "function") {
	                      setProjectOverviewSettingsSection("access");
	                    }
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
	                        selectedAccessRoleId
	                      )
	                    : null,
	                onSystemRolePermissionSetChange: hasRealAccess
	                  ? updateProjectSystemRolePermissionSet
	                  : undefined,
		                roles: systemPrincipal
		                  ? undefined
		                  : PLAYGROUND_TEAM_ROLE_DEFINITIONS.map((role) => ({
		                      id: role.id,
		                      label: role.label,
		                      description: role.description,
		                      meta: "Project access",
		                    })),
	                selectedRoleId: selectedAccessRoleId,
	                onSelectedRoleIdChange: (roleId) => setProjectOverviewPermissionRoleId?.(roleId),
	                teamPermissionSet: selectedPermissionTeam && !systemPrincipal
	                  ? getProjectTeamRolePermissionSet(
	                      projectOverviewDraft || selectedProject,
	                      selectedPermissionTeam.id,
	                      selectedAccessRoleId
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
		                  onRemoveTeams: hasRealAccess
	                    ? (teams) => teams.forEach((team) => handleRemoveProjectTeam(team))
	                    : undefined,
	                  formatCreatedAt: (value) => formatProjectTeamCreatedDate(value) || "—",
	                },
	              });
	            }

	            return renderProjectOverviewSettingsLayout([
                {
                  id: "plugins",
                  label: "Plugins",
                  icon: Plug,
                  render: renderProjectOverviewPluginsPanel,
                },
                {
                  id: "timeline",
                  label: "Timeline",
                  icon: History,
                  render: () => renderProjectOverviewTimelineSettingsSection({ canEdit: canManageProjectAccess }),
                },
                {
                  id: "rules",
                  label: "Rules",
                  icon: ListTodo,
                  render: renderProjectOverviewSettingsRulesSection,
                },
                {
                  id: "access",
                  label: "Access",
                  icon: KeyRound,
                  render: renderProjectAccessSettings,
                },
              ]);
	          }

            const projectOverviewActivePanel = activeProjectOverviewHomeTab === "resources"
                ? renderProjectOverviewResourcesPanel()
                : activeProjectOverviewHomeTab === "milestones"
                    ? renderProjectOverviewMilestonesPanel()
                : activeProjectOverviewHomeTab === "delivery"
                    ? React.createElement(ProjectDeliveryWorkspace, {
                        projectId: selectedProjectId,
                        projectName: selectedProject?.name || "",
                        projectDescription: selectedProject?.description || "",
                        initialRequest:
                          selectedProject?.deliveryDesignRequest
                          || selectedProject?.metadata?.deliveryDesignRequest
                          || null,
                        canManage: canManageProjectAccess,
                      })
                : activeProjectOverviewHomeTab === "permissions"
                    ? renderProjectOverviewPermissionsPanel()
                    : renderProjectOverviewGeneralPanel();

	          return React.createElement("div", { className: "playground-tasks-view-section playground-project-overview-view is-" + activeProjectOverviewHomeTab },
            React.createElement("div", { className: "playground-project-overview-hero-shell" },
              React.createElement(ProjectDetailPage, {
                  header: activeProjectOverviewHomeTab === "general"
                    ? renderProjectOverviewSummaryHeader()
                    : null,
                  activeTab: activeProjectOverviewHomeTab,
                  sidebarCollapsed: projectOverviewSidebarCollapsed,
                  sidebar: renderProjectOverviewSidebar(),
                },
                projectOverviewActivePanel
              )
            ),
            renderProjectOverviewUpdateComposerModal(),
            renderProjectOverviewComputerChangeDialog()
          );
        }
`;
