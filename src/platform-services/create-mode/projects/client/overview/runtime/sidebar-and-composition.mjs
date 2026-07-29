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
              const reconciledProject = normalizePlaygroundProjectRecord({
                ...(updatedProject || nextProjectRecord),
                ...(projectUpdates && typeof projectUpdates === "object" ? projectUpdates : {}),
                metadata: {
                  ...(updatedProject?.metadata && typeof updatedProject.metadata === "object" && !Array.isArray(updatedProject.metadata)
                    ? updatedProject.metadata
                    : nextMetadata),
                  ...(metadataUpdates && typeof metadataUpdates === "object" ? metadataUpdates : {}),
                },
              });
              if (reconciledProject?.id) {
                commitProjectOverviewSidebarProjectRecord(reconciledProject);
              }
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({ isSaving: false, error: "", message: "Saved" });
              }
              return reconciledProject;
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
              trailing: option?.trailing || undefined,
              ariaLabel: option?.ariaLabel,
              disabled: option?.disabled === true,
              selected: option?.selected === true,
              onSelect: option?.onSelect,
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
            const email = String(
              project.ownerEmail
                || metadata.ownerEmail
                || metadataOwner.email
                || (userId && userId === String(currentUserId || "").trim() ? currentUserEmail : "")
                || ""
            ).trim();
            const name = String(
              project.ownerName
                || metadata.ownerName
                || metadataOwner.name
                || metadataOwner.displayName
                || (userId && userId === String(currentUserId || "").trim() ? currentUserName : "")
                || email
                || "Project owner"
            ).trim();
            const avatarUrl = String(
              project.ownerAvatarUrl
                || metadata.ownerAvatarUrl
                || metadataOwner.avatarUrl
                || metadataOwner.photoUrl
                || (userId && userId === String(currentUserId || "").trim() ? currentUserAvatarUrl : "")
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
              if (typeof setProjectSaveState === "function") {
                setProjectSaveState({
                  isSaving: false,
                  error: error instanceof Error ? error.message : "Failed to transfer project ownership.",
                  message: "",
                });
              }
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
                          popupClassName: "playground-project-overview-status-selector-popup",
                          popupHeader: React.createElement(PlatformPopupSearchHeader, {
                            value: projectOverviewSidebarStatusSearchQuery,
                            onChange: (event) => setProjectOverviewSidebarStatusSearchQuery(event.target.value),
                            placeholder: "Change status...",
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
                          onValueChange: (nextStatus) => {
                            const normalizedStatus = normalizePlaygroundProjectStatus(nextStatus);
                            setProjectOverviewSidebarStatusSearchQuery("");
                            updateProjectOverviewSidebarProjectProperty({
                              status: normalizedStatus,
                            }, {
                              status: normalizedStatus,
                            });
                          },
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
                    renderProjectOverviewSidebarRow("Owner", owner.name, {
                      className: "is-owner",
                      editable: true,
                      content: renderProjectOverviewSidebarSelectControl(
                        "owner",
                        selectedOwnerId,
                        React.createElement("span", { className: "playground-project-overview-sidebar-lead" },
                          renderProjectOverviewSidebarAvatar(owner.name, owner.avatarUrl),
                          React.createElement("span", null, owner.name)
                        ),
                        {
                          ariaLabel: "Project owner",
                          disabled: !canTransferOwnership || projectSaveState?.isSaving,
                          loading: ownerCandidatesAreLoading,
                          emptyContent: projectOverviewOwnerCandidatesState?.error || "No eligible organization members.",
                          options: ownerOptions.map((option) => createProjectOverviewSidebarSelectorOption({
                            id: option.userId,
                            label: option.name,
                            description: option.email,
                            selected: option.userId === selectedOwnerId,
                            icon: renderProjectOverviewSidebarAvatar(option.name, option.avatarUrl),
                            onSelect: () => void transferProjectOverviewOwnership(option),
                          })),
                        }
                      ),
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
                      }, fullAutoActionLabel)
                    )
                  )
                )
              ),
              renderProjectOverviewSidebarProgressSection()
            );
          }

          function renderProjectOverviewDescriptionEditor(headerContent = null) {
            return React.createElement(PlatformInstructionsEditor, {
              value: missionControlDocumentDraft,
              onChange: (nextValue) => updateMissionControlDocumentDraftValue(nextValue, {
                previousValue: missionControlDocumentDraft,
              }),
              title: headerContent,
              placeholder: "Add project strategy",
              ariaLabel: "Project strategy",
              historyKey: "project-strategy:" + selectedProject.id,
              variant: "minimalistic-ui",
              stickyHeader: true,
              collapsedLines: 10,
              className: "playground-project-overview-description-editor",
              onEditingChange: (editing) => {
                setIsMissionControlDocumentEditing(editing);
                if (!editing) {
                  commitMissionControlDocumentIfDirty();
                }
              },
            });
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
	            const projectSharedTeamIds = new Set(
	              getPlatformSharedTeamIds(projectMetadata)
	                .map((teamId) => String(teamId || "").trim())
	                .filter((teamId) => teamId && !projectRemovedTeamIds.has(teamId))
	            );
	            const unsharedWorkspaceTeams = availableWorkspaceTeams
	              .map((team) => {
	                const teamId = String(team?.id || "").trim();
	                return teamId
	                  && !isPlatformSystemAccessPrincipalId(teamId)
	                  && !projectSharedTeamIds.has(teamId)
	                    ? { ...team, id: teamId }
	                    : null;
	              })
	              .filter(Boolean);
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
	              unsharedWorkspaceTeams.length
	                ? unsharedWorkspaceTeams.map((team) =>
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
            )
          );
        }
`;
