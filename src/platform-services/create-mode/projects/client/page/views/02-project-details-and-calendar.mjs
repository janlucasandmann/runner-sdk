export const PROJECTS_VIEWS_02_FRAGMENT = `	          );
        }

        function renderReleaseComposerDialog() {
          if (!releaseComposerOpen) {
            return null;
          }

          const isEditingRelease = releaseComposerMode === "edit" && Boolean(releaseDraft?.id);
          const isReleaseActionPending = releaseSaveState.isSaving || releaseDeletePending;

          return React.createElement(PlatformModal, {
            open: releaseComposerOpen,
            visible: releaseComposerVisible,
            closing: releaseComposerClosing,
            animationDurationMs: releaseComposerAnimationMs,
            onClose: () => closeReleaseComposer(),
            as: "form",
            size: "large",
            maxHeight: "80vh",
            title: isEditingRelease ? "Edit Milestone" : "Create Milestone",
            headerVariant: "search",
            headerLeading: React.createElement("span", {
              className: "playground-tasks-detail-type-badge is-milestone",
              "aria-hidden": "true",
            }, React.createElement(Milestone, { width: 12, height: 12, strokeWidth: 1.9 })),
            headerSearchProps: {
              icon: null,
              value: releaseDraft.name || "",
              placeholder: "Milestone name",
              "aria-label": "Milestone name",
              autoComplete: "off",
              onChange: (event) => setReleaseDraft((current) => ({
                ...current,
                name: event.target.value,
              })),
            },
            className: "playground-project-milestone-modal",
            bodyClassName: "playground-project-milestone-modal__body",
            footerClassName: "playground-project-milestone-modal__footer",
            closeButtonLabel: "Close milestone",
            closeButtonDisabled: isReleaseActionPending,
            surfaceProps: {
              onSubmit: (event) => void handleSaveRelease(event),
            },
            footer: React.createElement(React.Fragment, null,
              isEditingRelease
                ? React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    size: "medium",
                    className: "playground-project-milestone-modal__delete-button",
                    style: { marginRight: "auto" },
                    onClick: () => void handleDeleteRelease(releaseDraft.id),
                    disabled: isReleaseActionPending,
                  }, releaseDeletePending ? "Deleting..." : "Delete")
                : null,
              React.createElement(PlatformSecondaryButton, {
                type: "button",
                size: "medium",
                onClick: () => closeReleaseComposer(),
                disabled: isReleaseActionPending,
              }, "Cancel"),
              React.createElement(PlatformPrimaryButton, {
                size: "medium",
                type: "submit",
                disabled: isReleaseActionPending || !String(releaseDraft.name || "").trim(),
              }, releaseSaveState.isSaving
                ? (isEditingRelease ? "Saving..." : "Creating...")
                : (isEditingRelease ? "Save Milestone" : "Create Milestone"))
            ),
          },
            React.createElement("div", { className: "playground-mission-control-modal-context playground-tasks-release-modal-context" },
              React.createElement(PlatformInstructionsEditor, {
                variant: "minimalistic-ui",
                title: "Description",
                value: releaseDraft.description || "",
                onChange: (nextValue) => setReleaseDraft((current) => ({
                  ...current,
                  description: nextValue,
                })),
                placeholder: "Optional details for this milestone.",
                ariaLabel: "Milestone description",
                historyKey: "project-milestone-description:"
                  + String(selectedProjectId || "")
                  + ":"
                  + String(releaseDraft.id || "new"),
                stickyHeader: false,
                className: "playground-project-milestone-modal__description",
              }),
              React.createElement(PlatformInstructionsEditor, {
                variant: "minimalistic-ui",
                title: "Success criteria",
                value: releaseDraft.successCriteriaInput || "",
                onChange: (nextValue) => setReleaseDraft((current) => ({
                  ...current,
                  successCriteria: normalizePlaygroundStrategyTextList(nextValue),
                  successCriteriaInput: nextValue,
                })),
                placeholder: "One measurable criterion per line",
                ariaLabel: "Milestone success criteria",
                historyKey: "project-milestone-success-criteria:"
                  + String(selectedProjectId || "")
                  + ":"
                  + String(releaseDraft.id || "new"),
                stickyHeader: false,
                className: "playground-project-milestone-modal__success-criteria",
              }),
              releaseSaveState.error
                ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, releaseSaveState.error)
                : null
            )
          );
        }

        function renderProjectWorkingAgentLogoCarousel() {
          function ProjectWorkingAgentLogoCarousel() {
            const [isPulsing, setIsPulsing] = useState(false);
            const containerRef = useRef(null);
            const trackRef = useRef(null);
            const rafRef = useRef(null);
            const lastTriggeredIndexRef = useRef(-1);
            const pulseTimeoutRef = useRef(null);
            const logoPaths = [
              "/img/logos/aios-presentation/logo1.webp",
              "/img/logos/aios-presentation/logo2.webp",
              "/img/logos/aios-presentation/logo3.webp",
              "/img/logos/aios-presentation/logo4.webp",
              "/img/logos/aios-presentation/logo5.webp",
              "/img/logos/aios-presentation/logo6.webp",
              "/img/logos/aios-presentation/logo7.webp",
              "/img/logos/aios-presentation/logo8.png",
              "/img/logos/aios-presentation/logo9.png",
              "/img/logos/aios-presentation/logo10.png",
              "/img/logos/aios-presentation/logo11.png",
              "/img/logos/aios-presentation/logo12.png",
            ];
            const repeatedLogos = logoPaths.concat(logoPaths, logoPaths, logoPaths);

            useEffect(() => {
              let cancelled = false;
              const checkIconPositions = () => {
                if (cancelled) {
                  return;
                }
                const containerElement = containerRef.current;
                const trackElement = trackRef.current;
                if (containerElement && trackElement) {
                  const containerRect = containerElement.getBoundingClientRect();
                  const containerCenterX = containerRect.left + containerRect.width / 2;
                  const icons = trackElement.children;
                  for (let index = 0; index < icons.length; index += 1) {
                    const iconRect = icons[index].getBoundingClientRect();
                    const iconCenterX = iconRect.left + iconRect.width / 2;
                    if (Math.abs(iconCenterX - containerCenterX) < 5 && lastTriggeredIndexRef.current !== index) {
                      lastTriggeredIndexRef.current = index;
                      setIsPulsing(true);
                      if (pulseTimeoutRef.current) {
                        window.clearTimeout(pulseTimeoutRef.current);
                      }
                      pulseTimeoutRef.current = window.setTimeout(() => {
                        setIsPulsing(false);
                        pulseTimeoutRef.current = null;
                      }, 200);
                      break;
                    }
                  }
                }
                rafRef.current = window.requestAnimationFrame(checkIconPositions);
              };

              rafRef.current = window.requestAnimationFrame(checkIconPositions);
              return () => {
                cancelled = true;
                if (rafRef.current) {
                  window.cancelAnimationFrame(rafRef.current);
                }
                if (pulseTimeoutRef.current) {
                  window.clearTimeout(pulseTimeoutRef.current);
                }
              };
            }, []);

            return React.createElement("div", {
                ref: containerRef,
                className: "playground-projects-working-agent-logos",
                "aria-hidden": "true",
              },
              React.createElement("div", {
                className: "playground-projects-logo-carousel-line" + (isPulsing ? " is-pulsing" : ""),
              }),
              React.createElement("div", {
                  className: "playground-projects-logo-carousel-center" + (isPulsing ? " is-pulsing" : ""),
                },
                React.createElement("img", {
                  src: "/img/logos/aios-presentation/logoCentral.png",
                  alt: "",
                  draggable: false,
                })
              ),
              React.createElement("div", { className: "playground-projects-logo-carousel-mask" },
                React.createElement("div", {
                    ref: trackRef,
                    className: "playground-projects-logo-carousel-track",
                  },
                  repeatedLogos.map((logoPath, index) =>
                    React.createElement("div", {
                      key: logoPath + "-" + index,
                      className: "playground-projects-logo-carousel-item",
                    },
                      React.createElement("img", {
                        src: logoPath,
                        alt: "",
                        draggable: false,
                      })
                    )
                  )
                )
              )
            );
          }

          return React.createElement(ProjectWorkingAgentLogoCarousel);
        }

        function renderProjectWorkingAgentEmptyState() {
          const planningRows = [
            {
              title: "Mission Control",
              subtitle: "Turn a short goal into durable Project Knowledge, milestones, tickets, and clear next steps.",
              Icon: Rocket,
            },
            {
              title: "Backlog and board",
              subtitle: "Track planned, active, blocked, in-review, and finished work with owners, priorities, and blockers.",
              Icon: LayoutGrid,
            },
            {
              title: "Milestones",
              subtitle: "Group tasks into concrete milestones so agents work toward measurable delivery targets instead of isolated tickets.",
              Icon: CalendarIcon,
            },
          ];
          const executionRows = [
            {
              title: "Task threads",
              subtitle: "Start agent runs from tickets with project files, comments, reviewers, and previous work attached.",
              Icon: MessageSquare,
            },
            {
              title: "Project resources",
              subtitle: "Let agents create and maintain web apps, functions, databases, auth, secrets, and deployments.",
              Icon: Server,
            },
            {
              title: "Full-auto workflows",
              subtitle: "Run tasks one after another, create follow-ups when gaps appear, and trigger Mission Control when scope changes.",
              Icon: Play,
            },
          ];
          const renderProjectFeatureRow = (row) => {
            const Icon = row.Icon;
            return React.createElement("div", {
                key: row.title,
                className: "playground-projects-feature-row",
                role: "listitem",
              },
              React.createElement("span", { className: "playground-projects-feature-icon", "aria-hidden": "true" },
                React.createElement(Icon, { strokeWidth: 1.75 })
              ),
              React.createElement("span", { className: "playground-projects-feature-copy" },
                React.createElement("span", { className: "playground-projects-feature-title" }, row.title),
                React.createElement("span", { className: "playground-projects-feature-subtitle" }, row.subtitle)
              )
            );
          };

          return React.createElement("div", { className: "playground-projects-working-agent-section" },
            React.createElement("div", { className: "playground-projects-working-agent-card" },
              React.createElement("img", {
                className: "playground-projects-working-agent-image",
                src: "/img/002-hero/projectsheader.webp",
                alt: "",
                width: 1915,
                height: 1277,
                draggable: false,
              }),
              React.createElement("div", { className: "playground-projects-working-agent-overlay" },
                React.createElement("h2", { className: "playground-projects-working-agent-title" },
                  "Not a chat window.",
                  React.createElement("br"),
                  React.createElement("span", { className: "playground-projects-working-agent-title-emphasis" }, "A working agent.")
                ),
                React.createElement("p", { className: "playground-projects-working-agent-copy" },
                  "A project gives every agent the surrounding context: Knowledge, tickets, milestones, files, comments, reviewers, resources, and run history. Agents can return to the same workspace and continue the work instead of restarting from a prompt."
                ),
                renderProjectWorkingAgentLogoCarousel()
              )
            ),
            React.createElement("div", { className: "playground-projects-working-agent-features" },
              React.createElement("div", { className: "playground-projects-feature-grid" },
                React.createElement("section", {
                    className: "playground-projects-feature-column",
                    "aria-label": "Planning capabilities",
                  },
                  React.createElement("div", { className: "playground-projects-feature-list", role: "list" },
                    planningRows.map(renderProjectFeatureRow)
                  )
                ),
                React.createElement("section", {
                    className: "playground-projects-feature-column",
                    "aria-label": "Execution capabilities",
                  },
                  React.createElement("div", { className: "playground-projects-feature-list", role: "list" },
                    executionRows.map(renderProjectFeatureRow)
                  )
                )
              )
            )
          );
        }

        function getProjectListSummary(project) {
          const projectObject = project && typeof project === "object" && !Array.isArray(project) ? project : {};
          const summaryObject = projectObject.summary && typeof projectObject.summary === "object" && !Array.isArray(projectObject.summary)
            ? projectObject.summary
            : {};
          return buildEmptyPlaygroundProjectSummary({
            ...projectObject,
            ...summaryObject,
          });
        }

        function getProjectListBlueprint(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          return getPlaygroundProjectBlueprint(
            project?.projectType
              || project?.type
              || metadata.projectType
              || metadata.blueprintId
              || "blank"
          );
        }

        function getProjectListLead(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const lead = project?.lead && typeof project.lead === "object" && !Array.isArray(project.lead)
            ? project.lead
            : {};
          const leadName = String(
            project?.leadName
              || lead.name
              || lead.displayName
              || metadata.leadName
              || currentUserName
              || "Unassigned"
          ).trim();
          const leadAvatarUrl = String(
            project?.leadAvatarUrl
              || lead.avatarUrl
              || lead.photoURL
              || metadata.leadAvatarUrl
              || currentUserAvatarUrl
              || ""
          ).trim();
          return {
            name: leadName || "Unassigned",
            avatarUrl: leadAvatarUrl,
          };
        }

        function renderProjectListLeadAvatar(lead) {
          if (canRenderAvatarImage(lead.avatarUrl)) {
            return React.createElement("img", {
              className: "playground-projects-list-avatar",
              src: lead.avatarUrl,
              alt: lead.name || "Project lead",
              draggable: false,
            });
          }

          return React.createElement("span", { className: "playground-projects-list-avatar" },
            getAccountInitials(lead.name || "Lead")
          );
        }

        function getProjectListTargetDateLabel(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const targetDate = String(project?.targetDate || project?.dueDate || metadata.targetDate || metadata.dueDate || "").trim();
          return targetDate ? (formatPlaygroundFileDate(targetDate) || targetDate) : "";
        }

        function getProjectListPriorityLevel(project) {
          const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : {};
          const rawPriority = project?.priority || metadata.priority || metadata.priorityLevel || "medium";
          const normalizedPriority = String(rawPriority || "").trim().toLowerCase();
          if (normalizedPriority === "urgent" || normalizedPriority === "critical" || normalizedPriority === "high" || Number(rawPriority) >= 3) {
            return 3;
          }
          if (normalizedPriority === "medium" || Number(rawPriority) === 2) {
            return 2;
          }
          if (normalizedPriority === "low" || Number(rawPriority) === 1) {
            return 1;
          }
          return 2;
        }

        function renderProjectListPriority(level) {
          return React.createElement("span", { className: "playground-projects-list-priority", title: "Priority" },
            [1, 2, 3].map((bar) =>
              React.createElement("span", {
                key: bar,
                className: "playground-projects-list-priority-bar" + (bar <= level ? " is-active" : ""),
              })
            )
          );
        }

        function buildProjectOverviewTableRow(project, index) {
          const source = project && typeof project === "object" && !Array.isArray(project)
            ? project
            : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {};
          const metadataOwner = metadata.owner && typeof metadata.owner === "object" && !Array.isArray(metadata.owner)
            ? metadata.owner
            : {};
          const sourceOwner = source.owner && typeof source.owner === "object" && !Array.isArray(source.owner)
            ? source.owner
            : {};
          const sourceCreator = source.createdBy && typeof source.createdBy === "object" && !Array.isArray(source.createdBy)
            ? source.createdBy
            : source.creator && typeof source.creator === "object" && !Array.isArray(source.creator)
              ? source.creator
              : {};
          const metadataCreator = metadata.createdBy && typeof metadata.createdBy === "object" && !Array.isArray(metadata.createdBy)
            ? metadata.createdBy
            : metadata.creator && typeof metadata.creator === "object" && !Array.isArray(metadata.creator)
              ? metadata.creator
              : {};
          const firstIdentityValue = (values) => values
            .map((value) => String(value || "").trim())
            .find(Boolean) || "";
          const status = normalizePlaygroundProjectStatus(source.status || metadata.status || source.state || "backlog");
          const statusIndex = PLAYGROUND_PROJECT_STATUS_OPTIONS.findIndex((option) => option.id === status);
          const statusOption = PLAYGROUND_PROJECT_STATUS_OPTIONS[statusIndex] || PLAYGROUND_PROJECT_STATUS_OPTIONS[0];
          const blueprint = getProjectListBlueprint(source);
          const projectIconConfig = getPlaygroundProjectIconConfig(
            source.icon || metadata.icon || blueprint?.iconId
          );
          const ProjectIcon = projectIconConfig.icon;
          const ownerUserId = firstIdentityValue([
            source.ownerUserId,
            source.userId,
            sourceOwner.userId,
            sourceOwner.id,
            metadata.ownerUserId,
            metadataOwner.userId,
            metadataOwner.id,
            source.createdByUserId,
            source.creatorUserId,
            sourceCreator.userId,
            sourceCreator.id,
            metadata.createdByUserId,
            metadata.creatorUserId,
            metadataCreator.userId,
            metadataCreator.id,
          ]);
          const ownerEmail = firstIdentityValue([
            source.ownerEmail,
            sourceOwner.email,
            metadata.ownerEmail,
            metadataOwner.email,
            source.createdByEmail,
            source.creatorEmail,
            sourceCreator.email,
            metadata.createdByEmail,
            metadata.creatorEmail,
            metadataCreator.email,
          ]);
          const rawOwnerName = firstIdentityValue([
            source.ownerName,
            sourceOwner.name,
            sourceOwner.displayName,
            metadata.ownerName,
            metadataOwner.name,
            metadataOwner.displayName,
            source.createdByName,
            source.creatorName,
            sourceCreator.name,
            sourceCreator.displayName,
            metadata.createdByName,
            metadata.creatorName,
            metadataCreator.name,
            metadataCreator.displayName,
            source.leadName,
            metadata.leadName,
          ]);
          const currentIdentityTokens = [currentUserId, currentUserEmail, currentUserName]
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean);
          const normalizedOwnerName = ["unknown", "unknown user", "you", "me", "current user"]
            .includes(rawOwnerName.toLowerCase())
              ? ""
              : rawOwnerName;
          const ownerIdentityTokens = [ownerUserId, ownerEmail, normalizedOwnerName]
            .map((value) => String(value || "").trim().toLowerCase())
            .filter(Boolean);
          const isCurrentOwner = ownerIdentityTokens.length === 0
            || ownerIdentityTokens.some((value) => currentIdentityTokens.includes(value));
          const ownerName = isCurrentOwner
            ? formatAccountDisplayName(currentUserName, currentUserEmail, "You")
            : (normalizedOwnerName
                ? formatAccountDisplayName(normalizedOwnerName, ownerEmail, normalizedOwnerName)
                : getProjectCardCreatorName(source) || "User");
          const ownerAvatarUrl = firstIdentityValue([
            source.ownerAvatarUrl,
            source.owner_avatar_url,
            sourceOwner.avatarUrl,
            sourceOwner.avatar_url,
            sourceOwner.photoUrl,
            sourceOwner.photoURL,
            metadata.ownerAvatarUrl,
            metadata.owner_avatar_url,
            metadataOwner.avatarUrl,
            metadataOwner.avatar_url,
            metadataOwner.photoUrl,
            metadataOwner.photoURL,
            source.createdByAvatarUrl,
            source.creatorAvatarUrl,
            sourceCreator.avatarUrl,
            sourceCreator.avatar_url,
            sourceCreator.photoUrl,
            sourceCreator.photoURL,
            metadata.createdByAvatarUrl,
            metadata.creatorAvatarUrl,
            metadataCreator.avatarUrl,
            metadataCreator.avatar_url,
            metadataCreator.photoUrl,
            metadataCreator.photoURL,
            source.leadAvatarUrl,
            metadata.leadAvatarUrl,
            isCurrentOwner ? currentUserAvatarUrl : "",
          ]);
          const updatedValue = String(source.updatedAt || source.createdAt || "").trim();
          const updatedTimestamp = Date.parse(updatedValue);
          const updatedLabel = updatedValue
            ? (formatRelativeThreadTime(updatedValue) || formatPlaygroundFileDate(updatedValue) || updatedValue)
            : "Never";
          const updatedTitle = Number.isFinite(updatedTimestamp)
            ? new Date(updatedTimestamp).toLocaleString()
            : updatedValue;
          const name = String(source.name || "Untitled Project").trim() || "Untitled Project";
          const projectTypeLabel = String(blueprint?.title || blueprint?.shortTitle || "Project").trim() || "Project";
          return {
            id: String(source.id || "project-" + index),
            name,
            description: String(source.description || "").trim(),
            projectTypeLabel,
            icon: React.createElement(ProjectIcon, { width: 16, height: 16, strokeWidth: 1.8 }),
            status,
            statusLabel: statusOption?.label || "Backlog",
            statusRank: statusIndex >= 0 ? statusIndex : 0,
            ownerName,
            ownerAvatarUrl: ownerAvatarUrl || undefined,
            updatedAt: Number.isFinite(updatedTimestamp) ? updatedTimestamp : 0,
            updatedLabel,
            updatedTitle: updatedTitle || undefined,
            searchText: [
              name,
              source.description,
              projectTypeLabel,
              statusOption?.label,
              ownerName,
            ].filter(Boolean).join(" "),
            source,
          };
        }


        function renderProjectsListEmptyState() {
          return React.createElement("div", { className: "playground-projects-list-empty" },
            React.createElement("div", { className: "playground-projects-list-empty-title" }, "No projects yet"),
            React.createElement("div", { className: "playground-projects-list-empty-copy" },
              "Create a project to give agents a shared goal, task backlog, resources, files, and operating context."
            ),
            React.createElement(PlatformPrimaryButton, {
              size: "medium",
              type: "button",
              className: "playground-environments-action-button is-primary",
              onClick: () => openProjectComposer(),
            }, "Add Project")
          );
        }

        function renderProjectsHomeHeader() {
          return React.createElement("div", { className: "playground-files-library-header playground-projects-library-header" },
            React.createElement("div", { className: "playground-files-library-title-row playground-projects-library-title-row" },
              React.createElement("div", { className: "playground-projects-library-heading" },
                React.createElement("h1", { className: "playground-files-library-title playground-projects-library-title" }, "All Projects"),
                React.createElement(PlatformPopup, {
                  open: projectsHomeToolbarPopover === "filter",
                  rootRef: projectsHomeFilterPopupRef,
                  rootClassName: "playground-projects-library-controls",
                  surfaceClassName: "platform-data-table__floating-menu playground-projects-library-filter-menu",
                  surfaceProps: {
                    role: "menu",
                    "aria-label": "Filter projects",
                  },
                  animation: "down-in",
                  variant: "minimal",
                  trigger: React.createElement("button", {
                    type: "button",
                    className: "platform-data-table__toolbar-button is-icon-only" + (projectsHomeToolbarPopover === "filter" ? " is-open" : ""),
                    title: "Filter projects",
                    "aria-label": "Filter projects",
                    "aria-haspopup": "menu",
                    "aria-expanded": projectsHomeToolbarPopover === "filter" ? "true" : "false",
                    onClick: () => setProjectsHomeToolbarPopover((current) => current === "filter" ? "" : "filter"),
                  }, React.createElement(ListFilter, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })),
                },
                  projectsHomeFilterOptions.map((option) =>
                    React.createElement("button", {
                      key: option.id,
                      type: "button",
                      role: "menuitemradio",
                      "aria-checked": projectsHomeFilterMode === option.id ? "true" : "false",
                      className: "platform-data-table__menu-item",
                      onClick: () => {
                        setProjectsHomeFilterMode(option.id);
                        setProjectsHomeToolbarPopover("");
                      },
                    },
                      React.createElement("span", { className: "platform-data-table__menu-icon" },
                        projectsHomeFilterMode === option.id
                          ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" })
                          : null
                      ),
                      React.createElement("span", { className: "platform-data-table__menu-copy" },
                        React.createElement("span", { className: "platform-data-table__menu-label" }, option.label),
                        option.description
                          ? React.createElement("span", { className: "platform-data-table__menu-description" }, option.description)
                          : null
                      )
                    )
                  )
                )
              ),
              React.createElement(PlatformSearch, {
                className: "playground-projects-library-search",
                value: searchQuery,
                onChange: (event) => setSearchQuery(event.target.value),
                placeholder: "Search projects",
                "aria-label": "Search projects",
              })
            )
          );
        }


        function renderNoMatchingProjectsState() {
          return React.createElement("div", { className: "playground-tasks-empty" },
            React.createElement("div", { className: "playground-tasks-empty-title" }, "No projects found"),
            React.createElement("div", { className: "playground-tasks-empty-copy" }, "Adjust the search or filters to find the project you are looking for.")
          );
        }

        function renderProjectLanding() {
          if (projectLoadState.status === "loading" && projects.length === 0) {
            return React.createElement(PlatformLoadingState, {
              className: "playground-projects-loading-state",
              message: "Loading projects...",
              centered: true,
            });
          }

          if (projectLoadState.status === "error" && projects.length === 0) {
            return React.createElement("div", { className: "playground-tasks-empty" },
              React.createElement("div", { className: "playground-tasks-empty-title" }, "Projects unavailable"),
              React.createElement("div", { className: "playground-tasks-empty-copy" }, projectLoadState.error || "The projects API could not be reached."),
              React.createElement(PlatformPrimaryButton, {
                size: "medium",
                type: "button",
                className: "playground-environments-action-button is-primary",
                onClick: () => void loadProjects(),
              }, "Retry")
            );
          }

          const hasProjects = projects.length > 0;
          const overviewRows = filteredProjects.map((project, index) =>
            buildProjectOverviewTableRow(project, index)
          );

          if (hasProjects) {
            return React.createElement(ProjectsOverviewPage, {
              rows: overviewRows,
              loading: projectLoadState.status === "loading",
              error: projectLoadState.status === "error"
                ? (projectLoadState.error || "The projects API could not be reached.")
                : null,
              onOpen: (row) => handleSelectProject(row.id),
              onEdit: (row) => {
                const project = row?.source || projects.find((candidate) => candidate.id === row?.id);
                if (project) openProjectComposerForEdit(project);
              },
              onDelete: (rows) => void handleDeleteProjects(
                (Array.isArray(rows) ? rows : []).map((row) => row?.id)
              ),
            });
          }

          return React.createElement("div", { className: "playground-tasks-view-section playground-projects-overview-surface is-empty-hero" },
            React.createElement("div", { className: "playground-projects-overview-inner" },
              React.createElement(React.Fragment, null,
                React.createElement("div", { className: "playground-projects-overview-title-block" },
                  React.createElement("div", { className: "playground-projects-overview-title-copy" },
                    React.createElement("h1", { className: "playground-project-overview-summary-title" }, "Organize your work in projects")
                  ),
                  React.createElement(PlatformSecondaryButton, {
                    type: "button",
                    className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-projects-overview-add-button",
                    onClick: () => openProjectComposer(),
                  },
                    React.createElement(Plus, { strokeWidth: 1.8, "aria-hidden": "true" }),
                    React.createElement("span", null, "Add Project")
                  )
                ),
                renderProjectWorkingAgentEmptyState()
              )
            )
          );
        }

        function renderProjectContext() {
          if (!selectedProject) {
            return null;
          }

          return React.createElement("div", { className: "playground-tasks-project-context" },
            React.createElement("div", { className: "playground-tasks-project-meta-row" },
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.environmentsCount + " env"),
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.threadsCount + " threads"),
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.openTasksCount + " open tasks"),
              React.createElement("span", { className: "playground-tasks-chip" }, selectedProjectSummary.activeSprintCount + " active sprint" + (selectedProjectSummary.activeSprintCount === 1 ? "" : "s"))
            ),
            React.createElement("div", { className: "playground-tasks-project-panel-grid" },
              React.createElement("div", { className: "playground-tasks-project-panel" },
                React.createElement("div", { className: "playground-tasks-project-panel-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Environments"),
                    React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Attach one or more environments when this project needs a runtime for threads.")
                  )
                ),
                selectedProjectEnvironments.length > 0
                  ? React.createElement("div", { className: "playground-tasks-project-list" },
                      selectedProjectEnvironments.map((environment) =>
                        React.createElement("div", { key: environment.id, className: "playground-tasks-project-row" },
                          React.createElement("div", { className: "playground-tasks-project-row-main" },
                            React.createElement("div", { className: "playground-tasks-project-row-title" }, environment.name || "Untitled Environment"),
                            React.createElement("div", { className: "playground-tasks-project-row-copy" }, "Project runtime computer")
                          ),
                          environment.id === selectedProject.defaultEnvironmentId
                            ? React.createElement("span", { className: "playground-tasks-chip" }, "Default")
                            : null
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "This project has not attached environments yet.")
              ),
              React.createElement("div", { className: "playground-tasks-project-panel" },
                React.createElement("div", { className: "playground-tasks-project-panel-header" },
                  React.createElement("div", null,
                    React.createElement("div", { className: "playground-tasks-project-panel-title" }, "Recent Threads"),
                    React.createElement("div", { className: "playground-tasks-secondary-copy" }, "Threads created from this project stay grouped with its planning context.")
                  )
                ),
                selectedProjectRecentThreads.length > 0
                  ? React.createElement("div", { className: "playground-tasks-project-list" },
                      selectedProjectRecentThreads.map((thread) =>
                        React.createElement("div", { key: thread.id, className: "playground-tasks-project-row" },
                          React.createElement("div", { className: "playground-tasks-project-row-main" },
                            React.createElement("div", { className: "playground-tasks-project-row-title" }, thread.title || "Untitled thread"),
                            React.createElement("div", { className: "playground-tasks-project-row-copy" }, formatRelativeThreadTime(thread.updatedAt || thread.createdAt) || "Recently updated")
                          ),
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button",
                            onClick: () => onThreadStarted && onThreadStarted(thread.id),
                          }, "Open")
                        )
                      )
                    )
                  : React.createElement("div", { className: "playground-tasks-secondary-copy" }, "No project threads yet. Start one from a task or create a new thread while this project is active.")
              )
            )
          );
        }

        function renderProjectAppHeaderMilestoneSelector() {
          const isBoardMilestoneSelector = taskView === "board";
          return React.createElement(PlatformButtonSelector, {
              mode: "popup",
              buttonVariant: "secondary",
              buttonSize: "small",
              label: "Milestones",
              leading: React.createElement(History, {
                width: 14,
                height: 14,
                strokeWidth: 1.8,
                "aria-hidden": "true",
              }),
              closeOnSelect: true,
              popupAriaLabel: "Choose milestone",
              popupAlignment: "right",
              popupRole: "menu",
              popupVariant: "minimal",
              popupWidth: 300,
              popupClassName: "playground-tasks-app-header-milestone-menu",
            },
            React.createElement("button", {
              type: "button",
              role: "menuitemradio",
              "aria-checked": !selectedReleaseId ? "true" : "false",
              className: "platform-data-table__menu-item",
              onClick: () => handleSelectRelease(""),
            },
              React.createElement("span", { className: "platform-data-table__menu-icon" },
                !selectedReleaseId
                  ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                  : null
              ),
              React.createElement("span", { className: "platform-data-table__menu-copy" },
                React.createElement("span", { className: "platform-data-table__menu-label" },
                  isBoardMilestoneSelector ? "All Milestones" : "All Tickets"
                ),
                React.createElement("span", { className: "platform-data-table__menu-description" },
                  isBoardMilestoneSelector
                    ? "Show every milestone on the board."
                    : "Show the full project backlog."
                )
              )
            ),
            sortedReleaseOptions.map((release) => {
              const isSelected = selectedReleaseId === release.id;
              return React.createElement("button", {
                key: release.id,
                type: "button",
                role: "menuitemradio",
                "aria-checked": isSelected ? "true" : "false",
                className: "platform-data-table__menu-item",
                onClick: () => handleSelectRelease(release.id),
              },
                React.createElement("span", { className: "platform-data-table__menu-icon" },
                  isSelected
                    ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                    : null
                ),
                React.createElement("span", { className: "platform-data-table__menu-copy" },
                  React.createElement("span", { className: "platform-data-table__menu-label" }, release.name || "Untitled Milestone"),
                  React.createElement("span", { className: "platform-data-table__menu-description" },
                    release.description || formatPlaygroundTaskReleaseDateRange(release)
                  )
                )
              );
            }),
            React.createElement("button", {
              type: "button",
              role: "menuitem",
              className: "platform-data-table__menu-item has-separator",
              onClick: openReleaseComposer,
            },
              React.createElement("span", { className: "platform-data-table__menu-icon" },
                React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 })
              ),
              React.createElement("span", { className: "platform-data-table__menu-label" }, "Add Milestone")
            )
          );
        }

        function handleProjectWorkViewChange(nextView) {
          const normalizedView = nextView === "board"
            ? "board"
            : "backlog";
          if (normalizedView === taskView) {
            return;
          }
          setBacklogToolbarPopover("");
          setBoardToolbarPopover("");
          setProjectSidebarPopover("");
          setTaskView(normalizedView);
        }

        function renderProjectWorkViewTabs() {
          return React.createElement(PlatformDetailTabBar, {
            value: taskView === "board"
              ? "board"
              : "backlog",
            tabs: [
              { id: "backlog", label: "Backlog" },
              { id: "board", label: "Board" },
            ],
            onValueChange: handleProjectWorkViewChange,
            variant: "minimal",
            ariaLabel: "Project work view",
            className: "playground-project-work-view-tabs",
          });
        }

        function renderBacklogTaskContextMenu() {
          if (!backlogTaskContextMenu?.taskId) {
            return null;
          }
          const contextTask = tasksById[backlogTaskContextMenu.taskId] || null;
          if (!contextTask) {
            return null;
          }
          return React.createElement(PlatformPopup, {
              open: true,
              portal: true,
              variant: "minimal",
              animation: "down-in",
              placement: "bottom-start",
              portalOffset: 0,
              portalCollisionPadding: 12,
              portalAnchorPoint: {
                x: backlogTaskContextMenu.x,
                y: backlogTaskContextMenu.y,
              },
              surfaceRef: backlogTaskContextMenuRef,
              rootClassName: "playground-tasks-backlog-context-menu-anchor",
              surfaceClassName: "playground-tasks-backlog-context-menu",
              surfaceProps: {
                role: "menu",
                "aria-label": "Ticket actions",
                width: 272,
                maxHeight: "min(360px, calc(100vh - 24px))",
                style: {
                  display: "flex",
                  flexDirection: "column",
                  overflowY: "auto",
                },
              },
            },
              backlogTaskContextMenu.useWorkActions === true
                ? React.createElement(React.Fragment, null,
                    React.createElement("button", {
                      type: "button",
                      role: "menuitem",
                      className: "tb-popup-row",
                      onClick: () => {
                        setBacklogTaskContextMenu(null);
                        openProjectTaskDetailScreen(contextTask.id);
                      },
                    },
                      React.createElement(Maximize2, { width: 14, height: 14, strokeWidth: 1.8, "aria-hidden": "true" }),
                      React.createElement("span", null, "Open")
                    ),
                    renderTaskWorkActionMenuItems(contextTask, {
                      closeMenu: () => setBacklogTaskContextMenu(null),
                      includePrimaryAction: true,
                    })
                  )
                : renderTaskActionsMenu(contextTask, {
                    closeMenu: () => setBacklogTaskContextMenu(null),
                    includeOpenAction: backlogTaskContextMenu.includeOpenAction === true,
                  })
          );
        }

        function renderBacklogTaskListView({
          headerTitle,
          headerLeading = null,
          openTaskCount,
          headerAction = null,
          toolbarRef,
          toolbarPopover,
          setToolbarPopover,
          filterMode,
          setFilterMode,
          activeFilterOption,
          taskRoots,
          visibleTaskIds,
          childrenByParentId,
          emptyTitle,
          emptyCopy,
          emptyAction = null,
          showComposer = false,
          composer = null,
          listFooter = null,
          allowManualDrag = true,
          groupRootTasksByRelease = false,
        }) {
          const isBacklogManualSort = allowManualDrag;
          const draggingBacklogTask = backlogDraggingTaskId ? tasksById[backlogDraggingTaskId] || null : null;

          function renderBacklogTaskTree(taskItems, parentTaskId = null, depth = 0) {
            const renderedTaskItems = Array.isArray(taskItems)
              ? taskItems.filter((task) => backlogRenderedTaskIds.has(task?.id))
              : [];
            if (renderedTaskItems.length === 0) {
              return null;
            }

            if (!parentTaskId && depth === 0 && groupRootTasksByRelease) {
              const releaseSections = [];
              const sectionIndexByKey = new Map();
              renderedTaskItems.forEach((task) => {
                const normalizedReleaseId = typeof task?.releaseId === "string" ? task.releaseId.trim() : "";
                const sectionKey = normalizedReleaseId || "__no_release__";
                const releaseRecord = normalizedReleaseId ? (releasesById[normalizedReleaseId] || null) : null;
                const sectionTitle = normalizedReleaseId
                  ? (releaseRecord?.name || "Milestone unavailable")
                  : "All other";
                const sectionCopy = normalizedReleaseId
                  ? (releaseRecord?.description || "")
                  : "All tasks that are not assigned to any milestone";
                let sectionIndex = sectionIndexByKey.get(sectionKey);
                if (sectionIndex === undefined) {
                  sectionIndex = releaseSections.length;
                  sectionIndexByKey.set(sectionKey, sectionIndex);
                  releaseSections.push({
                    key: sectionKey,
                    releaseId: normalizedReleaseId,
                    title: sectionTitle,
                    copy: sectionCopy,
                    tasks: [],
                  });
                }
                releaseSections[sectionIndex].tasks.push(task);
              });

              const orderedReleaseSections = releaseSections
                .slice()
                .sort((left, right) => {
                  const leftIsAllOther = left.key === "__no_release__";
                  const rightIsAllOther = right.key === "__no_release__";
                  if (leftIsAllOther !== rightIsAllOther) {
                    return leftIsAllOther ? 1 : -1;
                  }
                  if (leftIsAllOther && rightIsAllOther) {
                    return 0;
                  }
                  const leftRelease = releasesById[left.key] || { id: left.key, name: left.title };
                  const rightRelease = releasesById[right.key] || { id: right.key, name: right.title };
                  return compareTaskReleaseOrder(leftRelease, rightRelease);
                });

              return React.createElement(React.Fragment, null,
                orderedReleaseSections.map((section) => {
                  const sectionReleaseId = section.key === "__no_release__" ? "" : section.key;
                  const isSectionDropTarget = backlogReleaseDropTargetId === section.key
                    && canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId);
                  return (
                  React.createElement("div", {
                      key: section.key,
                      className: "playground-tasks-backlog-section" + (isSectionDropTarget ? " is-release-drop-target" : ""),
                      onDragOver: (event) => {
                        if (!canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId)) {
                          return;
                        }
                        if (event.target instanceof Element && event.target.closest(".playground-tasks-backlog-item")) {
                          return;
                        }
                        event.preventDefault();
                        if (event.dataTransfer) {
                          event.dataTransfer.dropEffect = "move";
                        }
                        if (backlogReleaseDropTargetId !== section.key) {
                          setBacklogReleaseDropTargetId(section.key);
                        }
                      },
                      onDragEnter: (event) => {
                        if (!canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId)) {
                          return;
                        }
                        if (event.target instanceof Element && event.target.closest(".playground-tasks-backlog-item")) {
                          return;
                        }
                        event.preventDefault();
                        if (backlogReleaseDropTargetId !== section.key) {
                          setBacklogReleaseDropTargetId(section.key);
                        }
                      },
                      onDragLeave: (event) => {
                        const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                        if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                          return;
                        }
                        if (backlogReleaseDropTargetId === section.key) {
                          setBacklogReleaseDropTargetId("");
                        }
                      },
                      onDrop: (event) => {
                        if (!canDropTaskOnBacklogReleaseSection(draggingBacklogTask, sectionReleaseId)) {
                          return;
                        }
                        if (event.target instanceof Element && event.target.closest(".playground-tasks-backlog-item")) {
                          return;
                        }
                        event.preventDefault();
                        void handleBacklogReleaseSectionDrop(sectionReleaseId);
                      },
                    },
                    React.createElement("div", { className: "playground-tasks-backlog-section-header" },
                      React.createElement("div", { className: "playground-tasks-backlog-section-copy-group" },
                        React.createElement("div", { className: "playground-tasks-backlog-section-title" }, section.title)
                      ),
                      renderReleaseHeaderMeta(section.releaseId ? (releasesById[section.releaseId] || null) : null)
                    ),
                    section.tasks.map((task, siblingIndex) =>
                      React.createElement(React.Fragment, { key: task.id },
                        renderBacklogTaskRow(task, depth, null, section.tasks, siblingIndex, sectionReleaseId)
                      )
                    )
                  )
                );
                })
              );
            }

            return React.createElement(React.Fragment, null,
              renderedTaskItems.map((task, siblingIndex) =>
                React.createElement(React.Fragment, { key: task.id },
                  renderBacklogTaskRow(task, depth, parentTaskId, renderedTaskItems, siblingIndex)
                )
              )
            );
          }

          function renderBacklogTaskRow(task, depth = 0, parentTaskId = null, visibleSiblingTasks = [], siblingIndex = 0, releaseSectionId = undefined) {
            const isHumanTask = isHumanAssignedTask(task);
            const isCanceledTask = task.status === "canceled";
            const taskTicketNumber = taskTicketNumbersById[task.id] || task.ticketNumber || "001";
            const visibleChildTasks = (childrenByParentId[task.id] || []).filter((childTask) =>
              visibleTaskIds.has(childTask.id) && backlogRenderedTaskIds.has(childTask.id)
            );
            const taskType = normalizePlaygroundTaskType(task.taskType || task.type);
            const isSubtask = isPlaygroundSubtaskRecord(task);
            const isTitleEditable = selectedTaskId === task.id || backlogEditingTaskId === task.id;
            const TaskTypeIcon = getPlaygroundTaskTypeIcon(taskType);
            const isRowManualSort = isBacklogManualSort;
            const isReleaseSectionDraggable = canDragTaskAcrossReleaseSections(task) && depth === 0;
            const isDraggable = (isRowManualSort || isReleaseSectionDraggable)
              && !saveState.isSaving
              && (!backlogDraggingTaskId || backlogDraggingTaskId === task.id);
            const normalizedParentTaskId = normalizePlaygroundParentTaskId(parentTaskId);
            const canDropOnThisLevel = isRowManualSort && (
              !normalizedParentTaskId
              || (draggingBacklogTask?.id && isPlaygroundSubtaskRecord(draggingBacklogTask) && canBacklogTaskMoveToParentTask(draggingBacklogTask, normalizedParentTaskId))
            );
            const beforeDropTargetKey = getBacklogManualOrderDropTargetKey(normalizedParentTaskId, siblingIndex);
            const afterDropTargetKey = getBacklogManualOrderDropTargetKey(normalizedParentTaskId, siblingIndex + 1);
            const isDropBefore = isRowManualSort
              && backlogDropTargetKey === beforeDropTargetKey
              && siblingIndex === 0
              && backlogDraggingTaskId !== task.id;
            const isDropAfter = isRowManualSort
              && backlogDropTargetKey === afterDropTargetKey
              && backlogDraggingTaskId !== task.id;

            function resolveRowDropTarget(event) {
              if (!isRowManualSort || !draggingBacklogTask?.id || !canDropOnThisLevel) {
                return null;
              }
              const currentTarget = event.currentTarget;
              if (!(currentTarget instanceof Element)) {
                return null;
              }
              const rect = currentTarget.getBoundingClientRect();
              const relativeY = event.clientY - rect.top;
              const shouldInsertBefore = relativeY < rect.height / 2;
              return {
                insertIndex: shouldInsertBefore ? siblingIndex : siblingIndex + 1,
                dropTargetKey: shouldInsertBefore ? beforeDropTargetKey : afterDropTargetKey,
              };
            }

            return React.createElement("div", {
                key: task.id,
                className: "playground-tasks-backlog-tree-node" + (depth > 0 ? " is-subtask-node" : ""),
              },
              React.createElement(PlatformTicketItem, {
                  variant: "list",
                  role: "button",
                  tabIndex: 0,
                  taskType,
                  typeIcon: React.createElement(TaskTypeIcon, { width: 14, height: 14, strokeWidth: 1.9 }),
                  priority: renderPlaygroundTaskPriorityIcon(task.priority, "playground-tasks-backlog-priority"),
                  ticketNumber: taskTicketNumber,
                  title: task.title || "Untitled Task",
                  titleEditor: isTitleEditable
                    ? React.createElement("input", {
                        type: "text",
                        className: "playground-tasks-backlog-title playground-tasks-backlog-title-input",
                        value: backlogEditingTaskId === task.id ? backlogTitleInputValue : (task.title || ""),
                        placeholder: "Untitled Task",
                        "aria-label": "Task title",
                        onFocus: (event) => {
                          event.stopPropagation();
                          handleSelectTask(task.id);
                          beginBacklogTitleEdit(task);
                        },
                        onClick: (event) => event.stopPropagation(),
                        onMouseDown: (event) => event.stopPropagation(),
                        onChange: (event) => {
                          if (backlogEditingTaskId !== task.id) {
                            beginBacklogTitleEdit(task);
                          }
                          setBacklogTitleInputValue(event.target.value);
                        },
                        onBlur: () => {
                          void commitBacklogTaskTitle(task);
                        },
                        onKeyDown: (event) => {
                          event.stopPropagation();
                          if (event.key === "Enter") {
                            event.preventDefault();
                            event.currentTarget.blur();
                            return;
                          }
                          if (event.key === "Escape") {
                            event.preventDefault();
                            backlogTitleSkipCommitRef.current = task.id;
                            cancelBacklogTitleEdit(task);
                            event.currentTarget.blur();
                          }
                        },
                      })
                    : null,
                  completed: task.status === "done",
                  status: renderTaskPreviewStatusControl(task),
                  assignee: renderTaskAssigneeAvatar(task, "playground-tasks-backlog-assignee-avatar"),
                  action: isHumanTask
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-backlog-run-button" + (!isPlaygroundTaskTerminalStatus(task.status) ? " is-human-unchecked" : ""),
                        "aria-label": isCanceledTask
                          ? "Canceled task"
                          : (task.status === "done" ? "Reopen task" : "Complete task"),
                        title: isCanceledTask
                          ? "Canceled"
                          : (task.status === "done" ? "Reopen task" : "Complete task"),
                        onClick: (event) => {
                          void handleToggleTaskDone(task, event);
                        },
                        disabled: isCanceledTask || saveState.isSaving,
                      },
                        task.status === "done"
                          ? React.createElement(Check, {
                              width: 13,
                              height: 13,
                              strokeWidth: 2,
                              "aria-hidden": "true",
                            })
                          : null
                      )
                    : null,
                  active: selectedTaskId === task.id,
                  className: (depth > 0 ? "is-subtask" : "")
                    + (isDraggable ? " is-draggable" : "")
                    + (isTaskPreviewStatusMenuOpen(task.id) ? " is-status-menu-open" : "")
                    + (backlogDraggingTaskId === task.id ? " is-dragging" : "")
                    + (isDropBefore ? " is-drop-before" : "")
                    + (isDropAfter ? " is-drop-after" : ""),
                  style: getPlaygroundTaskColorStyle(task.taskColor),
                  draggable: isDraggable,
                  onClick: () => openProjectTaskDetailScreen(task.id),
                  onContextMenu: (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleSelectTask(task.id);
                    openBacklogTaskContextMenu(task, event);
                  },
                  onKeyDown: (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openProjectTaskDetailScreen(task.id);
                    }
                  },
                  onDragStart: (event) => handleBacklogTaskDragStart(task, event),
                  onDragEnd: handleBacklogTaskDragEnd,
                  onDragOver: (event) => {
                    const dropTarget = resolveRowDropTarget(event);
                    if (!dropTarget) {
                      return;
                    }
                    event.preventDefault();
                    if (event.dataTransfer) {
                      event.dataTransfer.dropEffect = "move";
                    }
                    if (backlogReleaseDropTargetId) {
                      setBacklogReleaseDropTargetId("");
                    }
                    if (backlogDropTargetKey !== dropTarget.dropTargetKey) {
                      setBacklogDropTargetKey(dropTarget.dropTargetKey);
                    }
                  },
                  onDragEnter: (event) => {
                    const dropTarget = resolveRowDropTarget(event);
                    if (!dropTarget) {
                      return;
                    }
                    event.preventDefault();
                    if (backlogReleaseDropTargetId) {
                      setBacklogReleaseDropTargetId("");
                    }
                    if (backlogDropTargetKey !== dropTarget.dropTargetKey) {
                      setBacklogDropTargetKey(dropTarget.dropTargetKey);
                    }
                  },
                  onDragLeave: (event) => {
                    const relatedTarget = event.relatedTarget instanceof Node ? event.relatedTarget : null;
                    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
                      return;
                    }
                    if (isDropBefore || isDropAfter) {
                      setBacklogDropTargetKey("");
                    }
                  },
                  onDrop: (event) => {
                    const dropTarget = resolveRowDropTarget(event);
                    if (!dropTarget) {
                      return;
                    }
                    event.preventDefault();
                    void handleBacklogTaskDrop(
                      normalizedParentTaskId,
                      visibleSiblingTasks.map((item) => item.id),
                      dropTarget.insertIndex,
                      releaseSectionId
                    );
                  },
                }),
              visibleChildTasks.length > 0
                ? React.createElement("div", { className: "playground-tasks-backlog-children" },
                    renderBacklogTaskTree(visibleChildTasks, task.id, depth + 1)
                  )
                : null
            );
          }

          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-tasks-backlog-view" },
              React.createElement("div", {
                  className: "playground-tasks-backlog-header is-backlog-list-header",
                  ref: toolbarRef,
                },
                React.createElement("div", { className: "playground-tasks-backlog-header-row" },
                  React.createElement("div", { className: "playground-tasks-backlog-header-main" },
                    headerLeading || React.createElement("div", { className: "playground-tasks-backlog-heading" }, headerTitle),
                    React.createElement(PlatformPopup, {
                        open: toolbarPopover === "filter",
                        rootClassName: "playground-tasks-backlog-filter-shell is-central-popup",
                        surfaceClassName: "platform-data-table__floating-menu playground-tasks-backlog-filter-menu is-central-popup",
                        surfaceProps: {
                          role: "menu",
                          "aria-label": "Filter backlog",
                        },
                        animation: "down-in",
                        variant: "minimal",
                        placement: "bottom-start",
                        trigger: React.createElement("button", {
                          type: "button",
                          className: "platform-data-table__toolbar-button is-icon-only"
                            + (toolbarPopover === "filter" || filterMode !== "open" && filterMode !== "all" ? " is-open" : ""),
                          onClick: (event) => {
                            event.stopPropagation();
                            setToolbarPopover((current) => current === "filter" ? "" : "filter");
                          },
                          title: "Filter backlog",
                          "aria-label": "Filter backlog",
                          "aria-haspopup": "menu",
                          "aria-expanded": toolbarPopover === "filter" ? "true" : "false",
                        }, React.createElement(ListFilter, {
                          width: 14,
                          height: 14,
                          strokeWidth: 1.8,
                          "aria-hidden": "true",
                        })),
                      },
                      backlogFilterOptions.map((option) =>
                        React.createElement("button", {
                          key: option.id,
                          type: "button",
                          role: "menuitemradio",
                          "aria-checked": filterMode === option.id ? "true" : "false",
                          className: "platform-data-table__menu-item",
                          onClick: () => {
                            setFilterMode(option.id);
                            setToolbarPopover("");
                          },
                        },
                          React.createElement("span", { className: "platform-data-table__menu-icon" },
                            filterMode === option.id
                              ? React.createElement(Check, { width: 14, height: 14, strokeWidth: 1.8 })
                              : null
                          ),
                          React.createElement("span", { className: "platform-data-table__menu-copy" },
                            React.createElement("span", { className: "platform-data-table__menu-label" }, option.label),
                            React.createElement("span", { className: "platform-data-table__menu-description" }, option.description)
                          )
                        )
                      )
                    )
                  ),
                  React.createElement("div", { className: "playground-tasks-backlog-header-actions" },
                    headerAction || null,
                    React.createElement(PlatformSearch, {
                      className: "playground-tasks-backlog-central-search",
                      value: searchQuery,
                      onChange: (event) => setSearchQuery(event.target.value),
                      placeholder: "Search tasks",
                      "aria-label": "Search backlog tasks",
                    })
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-backlog-list" },
                taskRoots.length > 0
                  ? renderBacklogTaskTree(taskRoots, null, 0)
                  : React.createElement("div", { className: "playground-tasks-empty playground-tasks-backlog-empty" },
                      React.createElement("div", { className: "playground-tasks-empty-title" }, emptyTitle),
                      React.createElement("div", { className: "playground-tasks-empty-copy" }, emptyCopy),
                      emptyAction
                    ),
                listFooter,
                backlogHasMoreTasks
                  ? React.createElement("div", {
                      ref: backlogLoadMoreRef,
                      className: "playground-tasks-progressive-list-loading",
                    }, React.createElement(PlatformLoadingState, {
                      as: "span",
                      message: "Loading more tickets...",
                    }))
                  : null
              ),
              showComposer ? composer : null
            ),
            renderBacklogTaskContextMenu()
          );
        }

        function renderBacklogView() {
          const isReleaseBacklogView = Boolean(selectedRelease);
          const scopedBacklogTasks = isReleaseBacklogView ? projectReleaseTasks : tasks;
          const openScopedBacklogTaskCount = scopedBacklogTasks.filter((task) => !isPlaygroundTaskTerminalStatus(task.status)).length;
          const activeBacklogFilterValue = isReleaseBacklogView ? releaseBacklogFilterMode : backlogFilterMode;
          const activeBacklogFilterOptionValue = isReleaseBacklogView ? activeReleaseBacklogFilterOption : activeBacklogFilterOption;
          const activeTaskRoots = isReleaseBacklogView ? releaseTaskRoots : backlogTaskRoots;
          const activeVisibleTaskIds = isReleaseBacklogView ? releaseVisibleTaskIds : backlogVisibleTaskIds;
          const activeChildrenByParentId = isReleaseBacklogView ? releaseTaskChildrenByParentId : taskChildrenByParentId;
          const shouldShowMissionControlEmptyAction = !normalizedSearchQuery
            && activeBacklogFilterValue === "open"
            && activeTaskRoots.length === 0
            && (!isReleaseBacklogView || Boolean(selectedRelease));
          const backlogEmptyTitle = normalizedSearchQuery
            ? (isReleaseBacklogView ? "No matching milestone tasks" : "No matching backlog tasks")
            : activeBacklogFilterValue === "tasks"
              ? "No tasks yet"
              : activeBacklogFilterValue === "subtasks"
                ? "No subtasks yet"
                : activeBacklogFilterValue === "all"
                  ? "No tasks yet"
                  : activeBacklogFilterValue === "done"
                    ? "No completed tasks"
                    : isReleaseBacklogView
                      ? "Milestone backlog is empty"
                      : "Backlog is empty";
          const backlogEmptyCopy = normalizedSearchQuery
            ? (isReleaseBacklogView
                ? "Clear the search or assign more tickets to this milestone."
                : "Clear the project search or add a new task below.")
            : activeBacklogFilterValue === "tasks"
              ? "Top-level tasks for this project will appear here."
              : activeBacklogFilterValue === "subtasks"
                ? "Subtasks will appear here below the tasks they belong to."
                : activeBacklogFilterValue === "all"
                  ? (isReleaseBacklogView
                      ? "Open and completed work from this milestone will appear here."
                      : "Open and completed project tasks will appear here.")
                  : activeBacklogFilterValue === "done"
                    ? (isReleaseBacklogView
                        ? "Completed work for this milestone will appear here."
                        : "Completed work from this project will appear here.")
                    : isReleaseBacklogView
                      ? "Run Mission Control to establish the project Knowledge library and create the initial structured backlog."
                      : shouldShowMissionControlEmptyAction
                        ? "Run Mission Control to establish the project Knowledge library and create the initial structured backlog."
                        : "Add a new task below to start building this project's backlog.";
          const backlogComposerBackendUrl = window.location.origin
            + "/api/task-backlog/" + encodeURIComponent(selectedProjectId)
            + (selectedReleaseId ? ("/releases/" + encodeURIComponent(selectedReleaseId)) : "");
          const backlogHeaderTitle = isReleaseBacklogView
            ? (selectedRelease.name || "Milestone")
            : "Backlog";
          const backlogHeaderAction = isReleaseBacklogView && selectedRelease
            ? React.createElement("button", {
                type: "button",
                className: "playground-files-control-button",
                onClick: () => openReleaseComposerForEdit(selectedRelease),
              },
                React.createElement(Settings2, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, "Settings")
              )
            : null;
          return renderBacklogTaskListView({
            headerTitle: backlogHeaderTitle,
            headerLeading: renderProjectWorkViewTabs(),
            openTaskCount: openScopedBacklogTaskCount,
            headerAction: backlogHeaderAction,
            toolbarRef: backlogToolbarActionsRef,
            toolbarPopover: backlogToolbarPopover,
            setToolbarPopover: setBacklogToolbarPopover,
            filterMode: activeBacklogFilterValue,
            setFilterMode: isReleaseBacklogView ? setReleaseBacklogFilterMode : setBacklogFilterMode,
            activeFilterOption: activeBacklogFilterOptionValue,
            taskRoots: activeTaskRoots,
            visibleTaskIds: activeVisibleTaskIds,
            childrenByParentId: activeChildrenByParentId,
            emptyTitle: backlogEmptyTitle,
            emptyCopy: backlogEmptyCopy,
            emptyAction: shouldShowMissionControlEmptyAction
              ? React.createElement("div", { className: "playground-tasks-empty-actions" },
                  React.createElement(PlatformPrimaryButton, {
                    size: "medium",
                    type: "button",
                    className: "playground-tasks-empty-primary-button playground-tasks-empty-mission-control-button",
                    onClick: () => openMissionControlComposer(),
                  },
                    React.createElement(Rocket, { width: 14, height: 14, strokeWidth: 2 }),
                    React.createElement("span", null, "Run Mission Control")
                  )
                )
              : null,
            allowManualDrag: !isReleaseBacklogView,
            groupRootTasksByRelease: !isReleaseBacklogView,
            showComposer: true,
            listFooter: null,
            composer: React.createElement("div", {
                className: "playground-tasks-backlog-composer-shell" + (projectWallpaperActive ? " is-project-wallpaper-active" : ""),
              },
                React.createElement(RunnerChat, {
                  key: selectedProjectId + ":" + (selectedReleaseId || "__all__") + ":" + backlogComposerKey,
                  className: "playground-tasks-backlog-runner",
                  backendUrl: backlogComposerBackendUrl,
                  apiKey: effectiveApiKey,
                  fetchCustomSkills: fetchProjectCustomSkills,
                  speechToTextUrl: speechToTextUrl || undefined,
                  requestHeaders,
                  appId: "runner-web-sdk-demo",
                  inputMode: "computer-agents",
                  computerAgents: computerAgents,
                  environments: backlogComposerEnvironments,
`;
