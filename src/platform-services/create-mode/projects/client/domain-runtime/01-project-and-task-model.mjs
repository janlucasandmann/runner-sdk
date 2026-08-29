export const PROJECTS_DOMAIN_RUNTIME_01_FRAGMENT = `
      const PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS = PLAYGROUND_PROJECT_BLUEPRINT_PROFILE_DATA.map((profile) => {
        const iconConfig = getPlaygroundProjectIconConfig(profile.iconId);
        return {
          ...profile,
          Icon: iconConfig.icon || Rocket,
        };
      });
      const PLAYGROUND_SKILL_ICON_OPTIONS = [
        { id: "code", label: "Code", icon: Code },
        { id: "terminal", label: "Terminal", icon: Terminal },
        { id: "globe", label: "Web", icon: Globe },
        { id: "search", label: "Search", icon: Search },
        { id: "telescope", label: "Research", icon: Telescope },
        { id: "brain", label: "Memory", icon: Brain },
        { id: "image", label: "Image", icon: ImageIcon },
        { id: "file-text", label: "Document", icon: FileText },
        { id: "database", label: "Data", icon: Database },
        { id: "palette", label: "Design", icon: Paintbrush },
        { id: "slash", label: "Slash", icon: Slash },
        { id: "calendar", label: "Calendar", icon: CalendarIcon },
        { id: "mail", label: "Mail", icon: Mail },
        { id: "shield", label: "Security", icon: Shield },
        { id: "server", label: "Server", icon: Server },
        { id: "package", label: "Package", icon: Package },
        { id: "list", label: "Tasks", icon: ListTodo },
        { id: "sparkles", label: "Sparkles", icon: Sparkles },
        { id: "zap", label: "Automation", icon: Zap },
      ];
	      const PLAYGROUND_TASK_BOARD_LANES = [
	        { id: "todo", label: "Todo", statuses: ["backlog", "todo"] },
	        { id: "in_progress", label: "In Progress", statuses: ["in_progress"] },
	        { id: "blocked", label: "Blocked", statuses: ["blocked"] },
	        { id: "in_review", label: "In Review", statuses: ["in_review"] },
	        { id: "done", label: "Done", statuses: ["done", "canceled"] },
	      ];

		      function isPlaygroundHumanAssigneeId(value) {
		        return String(value || "").trim() === PLAYGROUND_TASK_HUMAN_ME_ID;
		      }

		      function getPlaygroundIndependentReviewerId(task) {
		        const reviewerId = String(task?.reviewerAgentId || "").trim();
		        if (task?.reviewRequired !== true || !reviewerId) {
		          return "";
		        }
		        return reviewerId;
		      }

		      function hasPlaygroundIndependentReviewer(task) {
		        return Boolean(getPlaygroundIndependentReviewerId(task));
		      }

		      function isPlaygroundDirectResponseTask(task) {
		        const title = String(task?.title || "").trim().toLowerCase();
		        const description = String(task?.description || "").trim().toLowerCase();
		        const text = [title, description].filter(Boolean).join(" ");
		        if (!text) {
		          return false;
		        }
		        return /\\b(just|only)\\s+(say|respond|reply|answer)\\b/.test(text)
		          || /\\bnothing more\\b/.test(text)
		          || /\\bno tools?\\b/.test(text)
		          || /\\bsay\\s+hi\\b/.test(text);
		      }

		      function isPlaygroundHumanAttentionTask(task) {
		        return !isPlaygroundTaskTerminalStatus(task?.status)
		          && (
		            isPlaygroundHumanAssigneeId(task?.assigneeAgentId)
		            || (hasPlaygroundIndependentReviewer(task) && isPlaygroundHumanAssigneeId(task?.reviewerAgentId))
		          );
		      }

      function getPlaygroundTaskColorId(value) {
        const normalized = String(value || "").trim().toLowerCase();
        return PLAYGROUND_TASK_COLOR_OPTIONS.some((option) => option.id === normalized)
          ? normalized
          : PLAYGROUND_TASK_COLOR_OPTIONS[0].id;
      }

      function getPlaygroundTaskColorPresentation(value) {
        return PLAYGROUND_TASK_COLOR_OPTIONS.find((option) => option.id === getPlaygroundTaskColorId(value))
          || PLAYGROUND_TASK_COLOR_OPTIONS[0];
      }

      function getPlaygroundTaskColorStyle(value) {
        const presentation = getPlaygroundTaskColorPresentation(value);
        return {
          "--playground-task-color-accent": presentation.accent,
          "--playground-task-color-surface": presentation.surface,
          "--playground-task-color-surface-hover": presentation.surfaceHover,
          "--playground-task-color-surface-active": presentation.surfaceActive,
          "--playground-task-color-border": presentation.border,
          "--playground-task-color-text": presentation.text,
        };
      }

      function renderPlaygroundTaskColorSwatch(value, className = "") {
        const presentation = getPlaygroundTaskColorPresentation(value);
        return React.createElement("span", {
          className: ["playground-tasks-detail-color-swatch", className].filter(Boolean).join(" "),
          style: {
            "--playground-task-color-accent": presentation.accent,
            "--playground-task-color-border": presentation.border,
          },
          "aria-hidden": "true",
        });
      }

      function renderPlaygroundTaskColorValue(value, className = "") {
        const presentation = getPlaygroundTaskColorPresentation(value);
        return React.createElement("span", {
          className: ["playground-tasks-detail-color-value", className].filter(Boolean).join(" "),
        },
          renderPlaygroundTaskColorSwatch(value),
          React.createElement("span", { className: "playground-tasks-detail-select-trigger-label" }, presentation.label)
        );
      }

      function buildPlaygroundHumanAssigneeOption() {
        return {
          id: PLAYGROUND_TASK_HUMAN_ME_ID,
          name: "Me",
          agentType: "human",
        };
      }
      const PLAYGROUND_TASK_CONNECTOR_OPTIONS = [
        {
          key: "github",
          source: "github",
          label: "GitHub",
          logoUrl: PLAYGROUND_GITHUB_LOGO_URL,
          rootLabel: "Repositories",
        },
        {
          key: "googleDrive",
          source: "google-drive",
          label: "Google Drive",
          logoUrl: PLAYGROUND_GOOGLE_DRIVE_LOGO_URL,
          rootLabel: "My Drive",
        },
        {
          key: "oneDrive",
          source: "one-drive",
          label: "OneDrive",
          logoUrl: PLAYGROUND_ONEDRIVE_LOGO_URL,
          rootLabel: "OneDrive",
        },
        {
          key: "notion",
          source: "notion",
          label: "Notion",
          logoUrl: PLAYGROUND_NOTION_LOGO_URL,
          rootLabel: "Notion",
        },
        {
          key: "atlassian",
          source: "atlassian",
          label: "Atlassian",
          logoUrl: PLAYGROUND_ATLASSIAN_LOGO_URL,
          rootLabel: "Atlassian",
        },
      ];
      const PLAYGROUND_TASK_CONNECTOR_SOURCE_TO_KEY = Object.freeze({
        github: "github",
        "google-drive": "googleDrive",
        googleDrive: "googleDrive",
        google_drive: "googleDrive",
        "one-drive": "oneDrive",
        oneDrive: "oneDrive",
        one_drive: "oneDrive",
        notion: "notion",
        atlassian: "atlassian",
        jira: "atlassian",
        confluence: "atlassian",
      });

      function buildEmptyPlaygroundProjectSummary() {
        return {
          environmentsCount: 0,
          threadsCount: 0,
          activeThreadsCount: 0,
          tasksCount: 0,
          openTasksCount: 0,
          releaseCount: 0,
          activeReleaseCount: 0,
          sprintCount: 0,
          activeSprintCount: 0,
        };
      }

      function buildPlaygroundDefaultTaskConnectors() {
        return {
          github: null,
          googleDrive: null,
          oneDrive: null,
          notion: null,
          atlassian: null,
        };
      }

      function getPlaygroundProjectAccent(project, index = 0) {
        if (typeof project?.color === "string" && project.color.trim()) {
          return project.color.trim();
        }
        return PLAYGROUND_PROJECT_ACCENT_COLORS[index % PLAYGROUND_PROJECT_ACCENT_COLORS.length];
      }

      function getPlaygroundProjectWallpaperId(value, fallbackId = "") {
        const normalized = String(value || "").trim().toLowerCase();
        if (PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.some((option) => option.id === normalized)) {
          return normalized;
        }
        if (!fallbackId) {
          return "";
        }
        const normalizedFallback = String(fallbackId || "").trim().toLowerCase();
        return PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.some((option) => option.id === normalizedFallback)
          ? normalizedFallback
          : PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id;
      }

      function getPlaygroundStableOptionIndex(seed, length, fallbackIndex = 0) {
        const resolvedLength = Number(length) || 0;
        if (resolvedLength <= 0) {
          return 0;
        }
        const normalizedSeed = String(seed || "").trim();
        if (!normalizedSeed) {
          const normalizedFallback = Number.isFinite(fallbackIndex) ? Math.trunc(fallbackIndex) : 0;
          const safeFallback = ((normalizedFallback % resolvedLength) + resolvedLength) % resolvedLength;
          return safeFallback;
        }
        let hash = 0;
        for (let index = 0; index < normalizedSeed.length; index += 1) {
          hash = (hash * 31 + normalizedSeed.charCodeAt(index)) >>> 0;
        }
        return hash % resolvedLength;
      }

      function getPlaygroundProjectWallpaperConfig(projectOrWallpaperId, index = 0) {
        const fallbackSource = projectOrWallpaperId && typeof projectOrWallpaperId === "object" && !Array.isArray(projectOrWallpaperId)
          ? projectOrWallpaperId
          : null;
        const fallbackSeed = [
          typeof fallbackSource?.id === "string" ? fallbackSource.id.trim() : "",
          typeof fallbackSource?.createdAt === "string" ? fallbackSource.createdAt.trim() : "",
          typeof fallbackSource?.name === "string" ? fallbackSource.name.trim() : "",
        ].find(Boolean) || "";
        const fallbackOptionIndex = getPlaygroundStableOptionIndex(
          fallbackSeed,
          PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.length,
          index
        );
        const fallback = PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[fallbackOptionIndex]
          || PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0];
        const wallpaperId = typeof projectOrWallpaperId === "string"
          ? getPlaygroundProjectWallpaperId(projectOrWallpaperId, "")
          : getPlaygroundProjectWallpaperId(projectOrWallpaperId?.wallpaperId || projectOrWallpaperId?.metadata?.wallpaperId, "");
        return PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.find((option) => option.id === wallpaperId) || fallback;
      }

      function getPlaygroundProjectUseCardBackgroundAsWallpaper(...values) {
        for (const value of values) {
          if (typeof value === "boolean") {
            return value;
          }
          if (typeof value === "number") {
            if (value === 1) return true;
            if (value === 0) return false;
          }
          if (typeof value === "string") {
            const normalized = value.trim().toLowerCase();
            if (normalized === "true") return true;
            if (normalized === "false") return false;
          }
        }
        return true;
      }

      function getPlaygroundProjectIconCandidate(value) {
        const rawValue = String(value || "").trim();
        if (rawValue.toLowerCase().startsWith("emoji:")) {
          const emoji = rawValue.slice("emoji:".length).trim();
          if (emoji && !/[\\r\\n]/.test(emoji) && Array.from(emoji).length <= 16) {
            return "emoji:" + emoji;
          }
        }
        const normalized = rawValue.toLowerCase();
        return PLAYGROUND_PROJECT_ICON_OPTIONS.some((option) => option.id === normalized)
          ? normalized
          : "";
      }

      function hasPlaygroundExplicitProjectIcon(projectRecord) {
        if (!projectRecord || typeof projectRecord !== "object" || Array.isArray(projectRecord)) {
          return false;
        }
        const metadata = projectRecord.metadata
          && typeof projectRecord.metadata === "object"
          && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
        if (
          Object.prototype.hasOwnProperty.call(metadata, "icon")
          && Boolean(getPlaygroundProjectIconCandidate(metadata.icon))
        ) {
          return true;
        }
        if (projectRecord.__projectIconExplicit === true) {
          return true;
        }
        if (projectRecord.__projectIconExplicit === false) {
          return false;
        }
        return Object.prototype.hasOwnProperty.call(projectRecord, "icon")
          && Boolean(getPlaygroundProjectIconCandidate(projectRecord.icon));
      }

      function getPlaygroundProjectIconId(value) {
        return getPlaygroundProjectIconCandidate(value)
          || PLAYGROUND_PROJECT_ICON_OPTIONS[0].id;
      }

      function resolvePlaygroundProjectIconId(projectRecord, ...fallbackValues) {
        const metadata = projectRecord?.metadata
          && typeof projectRecord.metadata === "object"
          && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
        if (hasPlaygroundExplicitProjectIcon(projectRecord)) {
          return getPlaygroundProjectIconId(metadata.icon || projectRecord?.icon);
        }
        for (const fallbackValue of fallbackValues) {
          const candidate = getPlaygroundProjectIconCandidate(fallbackValue);
          if (candidate) {
            return candidate;
          }
        }
        return getPlaygroundProjectIconId(metadata.icon || projectRecord?.icon);
      }

      function getPlaygroundProjectIconConfig(iconId) {
        const normalizedIconId = getPlaygroundProjectIconId(iconId);
        if (normalizedIconId.startsWith("emoji:")) {
          const emoji = normalizedIconId.slice("emoji:".length);
          return {
            id: normalizedIconId,
            label: "Emoji",
            emoji,
            icon: function PlaygroundProjectEmojiIcon(props = {}) {
              const {
                width = 16,
                height = 16,
                strokeWidth,
                style,
                ...elementProps
              } = props;
              return React.createElement("span", {
                ...elementProps,
                style: {
                  ...style,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width,
                  height,
                  fontSize: Math.max(12, Math.min(Number(width) || 16, Number(height) || 16) - 1),
                  lineHeight: 1,
                },
              }, emoji);
            },
          };
        }
        return PLAYGROUND_PROJECT_ICON_OPTIONS.find((option) => option.id === normalizedIconId)
          || PLAYGROUND_PROJECT_ICON_OPTIONS[0];
      }

      function getPlaygroundProjectBlueprintId(value) {
        const normalized = String(value || "").trim().toLowerCase().replace(/[\\s-]+/g, "_");
        const candidate = PLAYGROUND_PROJECT_BLUEPRINT_ALIASES[normalized] || normalized || "blank";
        return PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.some((option) => option.id === candidate)
          ? candidate
          : "blank";
      }

      function getPlaygroundProjectBlueprint(value) {
        const blueprintId = getPlaygroundProjectBlueprintId(value);
        return PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS.find((option) => option.id === blueprintId)
          || PLAYGROUND_PROJECT_BLUEPRINT_OPTIONS[0];
      }

      function serializePlaygroundProjectBlueprintRules(blueprint) {
        const rules = Array.isArray(blueprint?.defaultRules) ? blueprint.defaultRules : [];
        return rules
          .map((rule) => String(rule || "").trim())
          .filter(Boolean)
          .map((rule) => "- " + rule)
          .join("\\n");
      }

      function clonePlaygroundProjectBlueprintValue(value, fallback = null) {
        if (value === undefined || value === null) {
          return fallback;
        }
        try {
          return JSON.parse(JSON.stringify(value));
        } catch {
          return fallback;
        }
      }

      function buildPlaygroundProjectOperatingProfileSnapshot(blueprintOrId) {
        const blueprint = getPlaygroundProjectBlueprint(blueprintOrId?.id || blueprintOrId);
        return {
          id: blueprint.id,
          version: Number.isFinite(Number(blueprint.version)) ? Number(blueprint.version) : 1,
          title: blueprint.title,
          shortTitle: blueprint.shortTitle || blueprint.title,
          description: blueprint.description || "",
          useCases: clonePlaygroundProjectBlueprintValue(blueprint.useCases, []),
          setupRecipe: clonePlaygroundProjectBlueprintValue(blueprint.setupRecipe, {}),
          dashboardProfile: clonePlaygroundProjectBlueprintValue(blueprint.dashboardProfile, {}),
          missionControlProfile: clonePlaygroundProjectBlueprintValue(blueprint.missionControlProfile, {}),
          syncProfiles: clonePlaygroundProjectBlueprintValue(blueprint.syncProfiles, []),
          collaborationProfile: clonePlaygroundProjectBlueprintValue(blueprint.collaborationProfile, {}),
          successMetrics: clonePlaygroundProjectBlueprintValue(blueprint.successMetrics, []),
          suggestedFolders: Array.isArray(blueprint.suggestedFolders) ? blueprint.suggestedFolders.slice() : [],
          suggestedResources: Array.isArray(blueprint.suggestedResources) ? blueprint.suggestedResources.slice() : [],
          suggestedSkills: Array.isArray(blueprint.suggestedSkills) ? blueprint.suggestedSkills.slice() : [],
          defaultRules: Array.isArray(blueprint.defaultRules) ? blueprint.defaultRules.slice() : [],
        };
      }

      function buildPlaygroundProjectBlueprintMetadata(blueprintOrId) {
        const blueprint = getPlaygroundProjectBlueprint(blueprintOrId?.id || blueprintOrId);
        const operatingProfile = buildPlaygroundProjectOperatingProfileSnapshot(blueprint);
        return {
          projectType: blueprint.id,
          blueprintId: blueprint.id,
          blueprintTitle: blueprint.title,
          operatingProfileVersion: operatingProfile.version,
          operatingProfileSnapshot: operatingProfile,
          setupRecipe: clonePlaygroundProjectBlueprintValue(blueprint.setupRecipe, {}),
          dashboardProfile: clonePlaygroundProjectBlueprintValue(blueprint.dashboardProfile, {}),
          missionControlProfile: clonePlaygroundProjectBlueprintValue(blueprint.missionControlProfile, {}),
          syncProfiles: clonePlaygroundProjectBlueprintValue(blueprint.syncProfiles, []),
          collaborationProfile: clonePlaygroundProjectBlueprintValue(blueprint.collaborationProfile, {}),
          successMetrics: clonePlaygroundProjectBlueprintValue(blueprint.successMetrics, []),
          suggestedFolders: Array.isArray(blueprint.suggestedFolders) ? blueprint.suggestedFolders.slice() : [],
          suggestedResources: Array.isArray(blueprint.suggestedResources) ? blueprint.suggestedResources.slice() : [],
          suggestedSkills: Array.isArray(blueprint.suggestedSkills) ? blueprint.suggestedSkills.slice() : [],
          blueprintDefaultRules: serializePlaygroundProjectBlueprintRules(blueprint),
        };
      }

      function applyPlaygroundProjectBlueprintToDraft(project, blueprintOrId, options = {}) {
        const blueprint = getPlaygroundProjectBlueprint(blueprintOrId);
        const current = project && typeof project === "object" && !Array.isArray(project)
          ? project
          : {};
        const metadata = current.metadata && typeof current.metadata === "object" && !Array.isArray(current.metadata)
          ? current.metadata
          : {};
        const blueprintRules = serializePlaygroundProjectBlueprintRules(blueprint);
        const previousBlueprintRules = String(metadata.blueprintDefaultRules || "");
        const currentProjectRules = String(current.projectRules || "");
        const shouldReplaceRules = options?.replaceRules === true
          || !currentProjectRules.trim()
          || currentProjectRules === previousBlueprintRules;
        const forceVisualDefaults = options?.forceVisualDefaults === true;
        const blueprintMetadata = buildPlaygroundProjectBlueprintMetadata(blueprint);
        return {
          ...current,
          projectType: blueprint.id,
          type: blueprint.id,
          icon: forceVisualDefaults || !current.icon ? blueprint.iconId : current.icon,
          wallpaperId: forceVisualDefaults || !current.wallpaperId ? blueprint.wallpaperId : current.wallpaperId,
          color: forceVisualDefaults || !current.color ? blueprint.color : current.color,
          projectRules: shouldReplaceRules ? blueprintRules : currentProjectRules,
          metadata: {
            ...metadata,
            ...blueprintMetadata,
            icon: forceVisualDefaults || !metadata.icon ? blueprint.iconId : metadata.icon,
            wallpaperId: forceVisualDefaults || !metadata.wallpaperId ? blueprint.wallpaperId : metadata.wallpaperId,
            color: forceVisualDefaults || !metadata.color ? blueprint.color : metadata.color,
            projectRules: shouldReplaceRules ? blueprintRules : currentProjectRules,
          },
        };
      }

      function getPlaygroundSkillIconId(value) {
        const rawValue = String(value || "").trim();
        const emoji = rawValue.startsWith("emoji:")
          ? rawValue.slice("emoji:".length).trim()
          : "";
        if (emoji) {
          return "emoji:" + emoji;
        }
        const normalized = rawValue.toLowerCase();
        return PLAYGROUND_SKILL_ICON_OPTIONS.some((option) => option.id === normalized)
          ? normalized
          : PLAYGROUND_SKILL_ICON_OPTIONS[0].id;
      }

      function getPlaygroundSkillIconConfig(iconId) {
        return PLAYGROUND_SKILL_ICON_OPTIONS.find((option) => option.id === getPlaygroundSkillIconId(iconId))
          || PLAYGROUND_SKILL_ICON_OPTIONS[0];
      }

      function buildPlaygroundDefaultTaskDraft() {
        const now = new Date().toISOString();
        const defaultTimezone = (() => {
          try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
          } catch {
            return "UTC";
          }
        })();
        return {
          id: "",
          projectId: null,
          releaseId: null,
          ticketNumber: "",
          taskType: "task",
          loop: null,
          parentTaskId: null,
          title: "New Task",
          description: "",
          taskColor: PLAYGROUND_TASK_COLOR_OPTIONS[0].id,
          status: "todo",
	          priority: "medium",
	          sprintId: null,
	          assigneeAgentId: null,
	          reviewRequired: false,
	          reviewerAgentId: null,
	          environmentId: null,
          attachments: [],
          enabledSkills: [],
          connectors: buildPlaygroundDefaultTaskConnectors(),
          comments: [],
          activity: [],
          dependencyIds: [],
          linkedThreadIds: [],
          lastStartedThreadId: null,
          scheduledStartAt: null,
          scheduledEndAt: null,
          scheduleType: "one-time",
          cronExpression: null,
          scheduleTimezone: defaultTimezone,
          scheduleEnabled: true,
          dueAt: null,
          completedAt: null,
          sortOrder: Date.now(),
          metadata: null,
          createdAt: now,
          updatedAt: now,
        };
      }

      function buildPlaygroundDefaultReleaseDraft() {
        const now = new Date().toISOString();
        return {
          id: "",
          projectId: null,
          name: "",
          description: "",
          successCriteria: [],
          successCriteriaInput: "",
          startAt: null,
          endAt: null,
          sortOrder: Date.now(),
          metadata: null,
          taskCount: 0,
          openTaskCount: 0,
          taskIds: [],
          status: "planned",
          createdAt: now,
          updatedAt: now,
        };
      }

      function buildPlaygroundDefaultSprintDraft() {
        const now = new Date().toISOString();
        return {
          id: "",
          projectId: null,
          name: "",
          goal: "",
          status: "planned",
          startAt: null,
          endAt: null,
          sortOrder: Date.now(),
          metadata: null,
          createdAt: now,
          updatedAt: now,
        };
      }

      function buildPlaygroundDefaultProjectDraft() {
        const now = new Date().toISOString();
        const blueprint = getPlaygroundProjectBlueprint("blank");
        return {
          id: "",
          name: "",
          description: "",
          projectType: blueprint.id,
          type: blueprint.id,
          icon: blueprint.iconId,
          wallpaperId: blueprint.wallpaperId,
          useCardBackgroundAsWallpaper: true,
          color: blueprint.color,
          status: "backlog",
          priority: "medium",
          defaultEnvironmentId: null,
          leadUserId: "",
          leadName: "",
          leadEmail: "",
	          leadAvatarUrl: "",
	          ownerUserId: "",
	          ownerName: "",
	          ownerEmail: "",
	          ownerAvatarUrl: "",
	          permissionSet: createPlaygroundDefaultPermissionSet("project"),
		          attachments: [],
		          connectors: buildPlaygroundDefaultTaskConnectors(),
	          projectRules: "",
	          missionControl: buildEmptyPlaygroundProjectMissionControl(),
	          metadata: {
	            ...buildPlaygroundProjectBlueprintMetadata(blueprint),
	            status: "backlog",
	            teamAccessIds: [],
	            teamAccessRemovedIds: [],
	          },
	          summary: buildEmptyPlaygroundProjectSummary(),
          createdAt: now,
          updatedAt: now,
        };
      }

      function buildEmptyPlaygroundProjectMissionControl() {
        return {
          summary: "",
          knowledgeLibraryId: "",
          knowledgeLibraryName: "",
          // Read-only compatibility for projects created before strategy and
          // documentation moved into the Knowledge service.
          document: "",
          instructions: "",
          strategyBrief: buildEmptyPlaygroundProjectStrategyBrief(),
          deliveryContract: null,
          deliveryPlan: null,
          deliveryExecution: null,
          deliveryAssurance: buildEmptyPlaygroundDeliveryAssurance(),
          activity: buildEmptyPlaygroundMissionControlActivity(),
          comments: [],
          lastThreadId: "",
          updatedAt: "",
        };
      }

      function normalizePlaygroundMissionControlActivityEntry(value) {
        const source = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const normalizeIds = (candidate) => {
          const values = Array.isArray(candidate) ? candidate : [];
          return Array.from(new Set(values.map((item) => {
            if (item && typeof item === "object" && !Array.isArray(item)) {
              return String(item.id || item.resourceId || item.resource_id || item.name || item.title || "").trim();
            }
            return String(item || "").trim();
          }).filter(Boolean)));
        };
        const normalizeCount = (...candidates) => {
          for (const candidate of candidates) {
            const number = Number(candidate);
            if (Number.isFinite(number) && number >= 0) {
              return Math.floor(number);
            }
          }
          return null;
        };
        const created = normalizeIds(source.created || source.createdIds || source.created_ids);
        const updated = normalizeIds(source.updated || source.updatedIds || source.updated_ids);
        return {
          created,
          updated,
          createdCount: normalizeCount(source.createdCount, source.created_count),
          updatedCount: normalizeCount(source.updatedCount, source.updated_count),
          count: normalizeCount(source.count, source.total, source.totalCount, source.total_count),
        };
      }

      function buildEmptyPlaygroundMissionControlActivity() {
        return {
          issues: normalizePlaygroundMissionControlActivityEntry(null),
          strategy: normalizePlaygroundMissionControlActivityEntry(null),
          milestones: normalizePlaygroundMissionControlActivityEntry(null),
          knowledge: normalizePlaygroundMissionControlActivityEntry(null),
        };
      }

      function normalizePlaygroundMissionControlActivity(value) {
        const source = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const resolveEntry = (key, aliases = []) => {
          const candidates = [key, ...aliases];
          for (const candidate of candidates) {
            if (Object.prototype.hasOwnProperty.call(source, candidate)) {
              const raw = source[candidate];
              if (typeof raw === "number") {
                return normalizePlaygroundMissionControlActivityEntry({ count: raw });
              }
              return normalizePlaygroundMissionControlActivityEntry(raw);
            }
          }
          return normalizePlaygroundMissionControlActivityEntry(null);
        };
        return {
          issues: resolveEntry("issues", ["tasks", "tickets", "issue"]),
          strategy: resolveEntry("strategy", ["projectStrategy", "project_strategy"]),
          milestones: resolveEntry("milestones", ["releases", "milestone"]),
          knowledge: resolveEntry("knowledge", ["documents", "knowledgeDocuments", "knowledge_documents"]),
        };
      }

      function buildEmptyPlaygroundProjectStrategyBrief() {
        return {
          mission: "",
          outcomes: [],
          inScope: [],
          outOfScope: [],
          successCriteria: [],
          risks: [],
          decisions: [],
        };
      }

      function buildEmptyPlaygroundDeliveryAssurance() {
        return {
          schemaVersion: "mission_control_delivery_assurance_v1",
          testPlan: {
            required: false,
            title: "",
            testPlanId: "",
            caseKinds: [],
            acceptanceCriteria: [],
            linkedTaskIds: [],
            releaseIds: [],
          },
          evaluationPlan: {
            required: false,
            evaluationSetIds: [],
            target: "",
            metrics: [],
            passThreshold: null,
            linkedTaskIds: [],
          },
          optimizationPolicy: {
            enabled: false,
            fineTuningJobId: "",
            targetMetric: "",
            targetValue: null,
            maxIterations: 0,
            stopConditions: [],
            linkedTaskIds: [],
          },
          canonicalAssurance: {
            policyId: "",
            policyVersionId: "",
            runId: "",
          },
          completionPolicy: {
            requireTestsPassing: true,
            requireEvaluationPassing: false,
            requireOptimizationProof: false,
            humanApprovalRequired: false,
            taskIds: [],
          },
          gates: [],
        };
      }

      function normalizePlaygroundDeliveryAssuranceNumber(value, options = {}) {
        if (value === null || value === undefined || value === "") {
          return null;
        }
        const numeric = Number(value);
        if (!Number.isFinite(numeric)) {
          return null;
        }
        const minimum = Number.isFinite(Number(options.minimum)) ? Number(options.minimum) : -Number.MAX_SAFE_INTEGER;
        const maximum = Number.isFinite(Number(options.maximum)) ? Number(options.maximum) : Number.MAX_SAFE_INTEGER;
        const clamped = Math.max(minimum, Math.min(maximum, numeric));
        return options.integer === true ? Math.round(clamped) : clamped;
      }

      function normalizePlaygroundDeliveryAssuranceGate(value, index) {
        const source = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const allowedKinds = new Set(["build", "test", "evaluation", "optimization", "release"]);
        const allowedStatuses = new Set(["planned", "ready", "passed", "failed", "blocked"]);
        const kind = String(source.kind || "").trim().toLowerCase();
        const status = String(source.status || "").trim().toLowerCase();
        return {
          id: String(source.id || ("gate-" + String(index + 1))).trim(),
          kind: allowedKinds.has(kind) ? kind : "test",
          title: normalizePlaygroundStrategyText(source.title || source.name),
          dependsOn: normalizePlaygroundStrategyTextList(source.dependsOn || source.depends_on),
          requiredEvidence: normalizePlaygroundStrategyTextList(source.requiredEvidence || source.required_evidence),
          taskIds: normalizePlaygroundStrategyTextList(source.taskIds || source.task_ids),
          resourceIds: normalizePlaygroundStrategyTextList(source.resourceIds || source.resource_ids),
          status: allowedStatuses.has(status) ? status : "planned",
        };
      }

      function normalizePlaygroundDeliveryAssurance(value) {
        const source = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const testPlan = source.testPlan && typeof source.testPlan === "object" && !Array.isArray(source.testPlan)
          ? source.testPlan
          : {};
        const evaluationPlan = source.evaluationPlan && typeof source.evaluationPlan === "object" && !Array.isArray(source.evaluationPlan)
          ? source.evaluationPlan
          : {};
        const optimizationPolicy = source.optimizationPolicy && typeof source.optimizationPolicy === "object" && !Array.isArray(source.optimizationPolicy)
          ? source.optimizationPolicy
          : {};
        const completionPolicy = source.completionPolicy && typeof source.completionPolicy === "object" && !Array.isArray(source.completionPolicy)
          ? source.completionPolicy
          : {};
        const canonicalAssurance = source.canonicalAssurance && typeof source.canonicalAssurance === "object" && !Array.isArray(source.canonicalAssurance)
          ? source.canonicalAssurance
          : source.canonical_assurance && typeof source.canonical_assurance === "object" && !Array.isArray(source.canonical_assurance)
            ? source.canonical_assurance
            : {};
        const allowedCaseKinds = new Set(["command", "contract", "integration", "browser", "agent", "security", "custom"]);
        return {
          schemaVersion: "mission_control_delivery_assurance_v1",
          testPlan: {
            required: testPlan.required === true,
            title: normalizePlaygroundStrategyText(testPlan.title || testPlan.name),
            testPlanId: normalizePlaygroundStrategyText(testPlan.testPlanId || testPlan.test_plan_id),
            caseKinds: normalizePlaygroundStrategyTextList(testPlan.caseKinds || testPlan.case_kinds)
              .map((kind) => kind.toLowerCase())
              .filter((kind) => allowedCaseKinds.has(kind)),
            acceptanceCriteria: normalizePlaygroundStrategyTextList(testPlan.acceptanceCriteria || testPlan.acceptance_criteria),
            linkedTaskIds: normalizePlaygroundStrategyTextList(testPlan.linkedTaskIds || testPlan.linked_task_ids),
            releaseIds: normalizePlaygroundStrategyTextList(testPlan.releaseIds || testPlan.release_ids),
          },
          evaluationPlan: {
            required: evaluationPlan.required === true,
            evaluationSetIds: normalizePlaygroundStrategyTextList(evaluationPlan.evaluationSetIds || evaluationPlan.evaluation_set_ids),
            target: normalizePlaygroundStrategyText(evaluationPlan.target),
            metrics: normalizePlaygroundStrategyTextList(evaluationPlan.metrics),
            passThreshold: normalizePlaygroundDeliveryAssuranceNumber(
              evaluationPlan.passThreshold ?? evaluationPlan.pass_threshold,
              { minimum: 0, maximum: 100 }
            ),
            linkedTaskIds: normalizePlaygroundStrategyTextList(evaluationPlan.linkedTaskIds || evaluationPlan.linked_task_ids),
          },
          optimizationPolicy: {
            enabled: optimizationPolicy.enabled === true,
            fineTuningJobId: normalizePlaygroundStrategyText(optimizationPolicy.fineTuningJobId || optimizationPolicy.fine_tuning_job_id),
            targetMetric: normalizePlaygroundStrategyText(optimizationPolicy.targetMetric || optimizationPolicy.target_metric),
            targetValue: normalizePlaygroundDeliveryAssuranceNumber(optimizationPolicy.targetValue ?? optimizationPolicy.target_value),
            maxIterations: normalizePlaygroundDeliveryAssuranceNumber(
              optimizationPolicy.maxIterations ?? optimizationPolicy.max_iterations,
              { minimum: 0, maximum: 100, integer: true }
            ) || 0,
            stopConditions: normalizePlaygroundStrategyTextList(optimizationPolicy.stopConditions || optimizationPolicy.stop_conditions),
            linkedTaskIds: normalizePlaygroundStrategyTextList(optimizationPolicy.linkedTaskIds || optimizationPolicy.linked_task_ids),
          },
          canonicalAssurance: {
            policyId: normalizePlaygroundStrategyText(
              canonicalAssurance.policyId
              || canonicalAssurance.policy_id
              || source.assurancePolicyId
              || source.assurance_policy_id
            ),
            policyVersionId: normalizePlaygroundStrategyText(
              canonicalAssurance.policyVersionId
              || canonicalAssurance.policy_version_id
              || canonicalAssurance.versionId
              || canonicalAssurance.version_id
              || source.assurancePolicyVersionId
              || source.assurance_policy_version_id
            ),
            runId: normalizePlaygroundStrategyText(
              canonicalAssurance.runId
              || canonicalAssurance.run_id
              || source.assuranceRunId
              || source.assurance_run_id
            ),
          },
          completionPolicy: {
            requireTestsPassing: completionPolicy.requireTestsPassing !== false,
            requireEvaluationPassing: completionPolicy.requireEvaluationPassing === true,
            requireOptimizationProof: completionPolicy.requireOptimizationProof === true,
            humanApprovalRequired: completionPolicy.humanApprovalRequired === true,
            taskIds: normalizePlaygroundStrategyTextList(
              completionPolicy.taskIds
              || completionPolicy.task_ids
              || source.completionTaskIds
              || source.completion_task_ids
            ),
          },
          gates: (Array.isArray(source.gates) ? source.gates : [])
            .slice(0, 100)
            .map((gate, index) => normalizePlaygroundDeliveryAssuranceGate(gate, index)),
        };
      }

      function hasMeaningfulPlaygroundDeliveryAssurance(value) {
        const assurance = normalizePlaygroundDeliveryAssurance(value);
        return Boolean(
          assurance.testPlan.required
          || assurance.testPlan.testPlanId
          || assurance.testPlan.caseKinds.length > 0
          || assurance.evaluationPlan.required
          || assurance.evaluationPlan.evaluationSetIds.length > 0
          || assurance.optimizationPolicy.enabled
          || assurance.optimizationPolicy.fineTuningJobId
          || assurance.canonicalAssurance.policyId
          || assurance.canonicalAssurance.runId
          || assurance.completionPolicy.taskIds.length > 0
          || assurance.gates.length > 0
        );
      }

      function normalizePlaygroundStrategyText(value) {
        return String(value || "").replaceAll(String.fromCharCode(13), "").trim();
      }

      function normalizePlaygroundStrategyTextList(value) {
        const values = Array.isArray(value)
          ? value
          : String(value || "").replaceAll(String.fromCharCode(13), "").split(String.fromCharCode(10));
        return values
          .map((item) => normalizePlaygroundStrategyText(item))
          .filter(Boolean);
      }

      function normalizePlaygroundStrategyOutcomeReleaseIds(value) {
        const outcome = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const next = [];
        const seen = new Set();
        const addReleaseId = (releaseId) => {
          const normalizedReleaseId = normalizePlaygroundStrategyText(releaseId);
          if (!normalizedReleaseId || seen.has(normalizedReleaseId)) {
            return;
          }
          seen.add(normalizedReleaseId);
          next.push(normalizedReleaseId);
        };
        const addReleaseIds = (releaseIds) => {
          if (Array.isArray(releaseIds)) {
            releaseIds.forEach(addReleaseId);
            return;
          }
          if (typeof releaseIds === "string") {
            releaseIds
              .replaceAll(String.fromCharCode(13), "")
              .split(new RegExp("[" + String.fromCharCode(10) + ",]+"))
              .forEach(addReleaseId);
          }
        };
        addReleaseIds(outcome.releaseIds || outcome.release_ids || outcome.milestoneIds || outcome.milestone_ids);
        addReleaseId(outcome.releaseId || outcome.release_id || outcome.milestoneId || outcome.milestone_id);
        return next;
      }

      function normalizePlaygroundStrategyOutcomeRecord(value, index = 0) {
        const isOutcomeRecord = value && typeof value === "object" && !Array.isArray(value);
        const outcome = isOutcomeRecord
          ? value
          : {};
        const title = normalizePlaygroundStrategyText(outcome.title || outcome.name || (isOutcomeRecord ? "" : value));
        const fallbackId = title
          ? "outcome-" + slugifyPlaygroundAgentEmailLocalPart(title).slice(0, 40)
          : "outcome-" + String(index + 1).padStart(2, "0");
        const releaseIds = normalizePlaygroundStrategyOutcomeReleaseIds(outcome);
        return {
          id: normalizePlaygroundStrategyText(outcome.id || outcome.outcomeId) || fallbackId,
          title,
          description: normalizePlaygroundStrategyText(outcome.description || outcome.summary),
          releaseIds,
          releaseId: releaseIds[0] || "",
          taskIds: normalizePlaygroundIdList(outcome.taskIds || outcome.task_ids),
          successCriteria: normalizePlaygroundStrategyTextList(outcome.successCriteria || outcome.success_criteria || outcome.criteria),
        };
      }

      function normalizePlaygroundProjectStrategyBrief(value) {
        const strategy = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const scope = strategy.scope && typeof strategy.scope === "object" && !Array.isArray(strategy.scope)
          ? strategy.scope
          : {};
        const outcomes = Array.isArray(strategy.outcomes)
          ? strategy.outcomes
          : Array.isArray(strategy.primaryOutcomes)
            ? strategy.primaryOutcomes
            : [];
        return {
          ...buildEmptyPlaygroundProjectStrategyBrief(),
          mission: normalizePlaygroundStrategyText(strategy.goal || strategy.mission || strategy.summary),
          outcomes: outcomes
            .map((outcome, index) => normalizePlaygroundStrategyOutcomeRecord(outcome, index))
            .filter((outcome) => outcome.title || outcome.description),
          inScope: normalizePlaygroundStrategyTextList(strategy.inScope || strategy.in_scope || scope.in || scope.inScope),
          outOfScope: normalizePlaygroundStrategyTextList(strategy.outOfScope || strategy.out_of_scope || scope.out || scope.outOfScope),
          successCriteria: normalizePlaygroundStrategyTextList(strategy.successCriteria || strategy.success_criteria),
          risks: normalizePlaygroundStrategyTextList(strategy.risks || strategy.assumptions || strategy.risksAndAssumptions),
          decisions: normalizePlaygroundStrategyTextList(strategy.decisions || strategy.keyDecisions),
        };
      }

      function normalizePlaygroundCanonicalProjectStrategyBrief(value) {
        const strategy = normalizePlaygroundProjectStrategyBrief(value);
        return {
          mission: strategy.mission,
          inScope: strategy.inScope,
          outOfScope: strategy.outOfScope,
          successCriteria: strategy.successCriteria,
          risks: strategy.risks,
          decisions: strategy.decisions,
        };
      }

      function serializePlaygroundMilestoneSuccessCriteria(value) {
        return normalizePlaygroundStrategyTextList(value).join(String.fromCharCode(10));
      }

      function getPlaygroundLegacyStrategyOutcomeForRelease(strategyBrief, releaseId) {
        const normalizedReleaseId = normalizePlaygroundStrategyText(releaseId);
        if (!normalizedReleaseId) {
          return null;
        }
        return normalizePlaygroundProjectStrategyBrief(strategyBrief).outcomes.find((outcome) =>
          normalizePlaygroundStrategyOutcomeReleaseIds(outcome).includes(normalizedReleaseId)
        ) || null;
      }

      function enrichPlaygroundTaskReleasesWithLegacyStrategy(releaseRecords, projectRecord) {
        const missionControl = getPlaygroundProjectMissionControlRecord(projectRecord);
        const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControl.strategyBrief);
        return (Array.isArray(releaseRecords) ? releaseRecords : []).map((releaseRecord) => {
          const release = normalizePlaygroundTaskReleaseRecord(releaseRecord);
          if (!release.id) {
            return release;
          }
          const legacyOutcome = getPlaygroundLegacyStrategyOutcomeForRelease(strategyBrief, release.id);
          if (!legacyOutcome) {
            return release;
          }
          const legacyDescription = normalizePlaygroundStrategyText(legacyOutcome.description);
          const legacySuccessCriteria = normalizePlaygroundStrategyTextList(legacyOutcome.successCriteria);
          const shouldUseLegacyDescription = !normalizePlaygroundStrategyText(release.description) && Boolean(legacyDescription);
          const shouldUseLegacySuccessCriteria = release.successCriteria.length === 0 && legacySuccessCriteria.length > 0;
          if (!shouldUseLegacyDescription && !shouldUseLegacySuccessCriteria) {
            return release;
          }
          const successCriteria = shouldUseLegacySuccessCriteria
            ? legacySuccessCriteria
            : release.successCriteria;
          return {
            ...release,
            description: shouldUseLegacyDescription ? legacyDescription : release.description,
            successCriteria,
            successCriteriaInput: serializePlaygroundMilestoneSuccessCriteria(successCriteria),
            legacyStrategyOutcomeId: legacyOutcome.id,
          };
        });
      }

      function hasMeaningfulPlaygroundProjectStrategyBrief(value) {
        const strategy = normalizePlaygroundProjectStrategyBrief(value);
        return Boolean(
          String(strategy.mission || "").trim()
          || strategy.outcomes.length > 0
          || strategy.inScope.length > 0
          || strategy.outOfScope.length > 0
          || strategy.successCriteria.length > 0
          || strategy.risks.length > 0
          || strategy.decisions.length > 0
        );
      }

      function normalizePlaygroundProjectMissionControlRecord(value) {
        const missionControl = value && typeof value === "object" && !Array.isArray(value)
          ? value
          : {};
        const rawStrategyBrief = missionControl.strategyBrief || missionControl.structuredStrategy || missionControl.strategy;
        return {
          ...buildEmptyPlaygroundProjectMissionControl(),
          summary: typeof missionControl.summary === "string" ? missionControl.summary : "",
          knowledgeLibraryId: typeof missionControl.knowledgeLibraryId === "string"
            ? missionControl.knowledgeLibraryId
            : typeof missionControl.knowledge_library_id === "string"
              ? missionControl.knowledge_library_id
              : "",
          knowledgeLibraryName: typeof missionControl.knowledgeLibraryName === "string"
            ? missionControl.knowledgeLibraryName
            : typeof missionControl.knowledge_library_name === "string"
              ? missionControl.knowledge_library_name
              : "",
          document: typeof missionControl.document === "string" ? missionControl.document : "",
          instructions: typeof missionControl.instructions === "string" ? missionControl.instructions : "",
          strategyBrief: normalizePlaygroundProjectStrategyBrief(rawStrategyBrief),
          deliveryContract: clonePlaygroundProjectBlueprintValue(
            missionControl.deliveryContract
            || missionControl.delivery_contract,
            null
          ),
          deliveryPlan: clonePlaygroundProjectBlueprintValue(
            missionControl.deliveryPlan
            || missionControl.delivery_plan,
            null
          ),
          deliveryExecution: clonePlaygroundProjectBlueprintValue(
            missionControl.deliveryExecution
            || missionControl.delivery_execution,
            null
          ),
          deliveryAssurance: normalizePlaygroundDeliveryAssurance(
            missionControl.deliveryAssurance
            || missionControl.delivery_assurance
          ),
          activity: normalizePlaygroundMissionControlActivity(
            missionControl.activity
            || missionControl.resourceActivity
            || missionControl.resource_activity
          ),
          comments: normalizePlaygroundTaskCommentList(missionControl.comments),
          lastThreadId: typeof missionControl.lastThreadId === "string" ? missionControl.lastThreadId : "",
          updatedAt: typeof missionControl.updatedAt === "string" ? missionControl.updatedAt : "",
        };
      }

      function getPlaygroundProjectMissionControlRecord(project) {
        return selectPlaygroundProjectMissionControlRecord(project);
      }

      function selectPlaygroundProjectMissionControlRecord(...sources) {
        const knownRecords = [];
        for (const source of sources) {
          if (!source || typeof source !== "object" || Array.isArray(source)) {
            continue;
          }
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {};
          const candidates = [];
          if (Object.prototype.hasOwnProperty.call(source, "missionControl")) {
            candidates.push(source.missionControl);
          }
          if (Object.prototype.hasOwnProperty.call(metadata, "missionControl")) {
            candidates.push(metadata.missionControl);
          }
          for (const candidate of candidates) {
            const normalized = normalizePlaygroundProjectMissionControlRecord(candidate);
            knownRecords.push(normalized);
            if (hasMeaningfulPlaygroundProjectMissionControlRecord(normalized)) {
              return normalized;
            }
          }
        }
        return knownRecords.length > 0
          ? knownRecords[0]
          : buildEmptyPlaygroundProjectMissionControl();
      }

      function hasMeaningfulPlaygroundProjectMissionControlRecord(value) {
        const missionControl = normalizePlaygroundProjectMissionControlRecord(value);
        const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControl.strategyBrief);
        const hasActivity = Object.values(missionControl.activity || {}).some((entry) => {
          const createdCount = Number(entry?.createdCount);
          const updatedCount = Number(entry?.updatedCount);
          const totalCount = Number(entry?.count);
          return (Array.isArray(entry?.created) && entry.created.length > 0)
            || (Array.isArray(entry?.updated) && entry.updated.length > 0)
            || (Number.isFinite(totalCount) && totalCount > 0)
            || (Number.isFinite(createdCount) && createdCount > 0)
            || (Number.isFinite(updatedCount) && updatedCount > 0);
        });
        return Boolean(
          String(missionControl.summary || "").trim()
          || String(missionControl.knowledgeLibraryId || "").trim()
          || String(missionControl.document || "").trim()
          || String(missionControl.instructions || "").trim()
          || String(missionControl.lastThreadId || "").trim()
          || String(missionControl.updatedAt || "").trim()
          || (
            missionControl.deliveryContract
            && typeof missionControl.deliveryContract === "object"
            && !Array.isArray(missionControl.deliveryContract)
          )
          || (
            missionControl.deliveryPlan
            && typeof missionControl.deliveryPlan === "object"
            && !Array.isArray(missionControl.deliveryPlan)
          )
          || (
            missionControl.deliveryExecution
            && typeof missionControl.deliveryExecution === "object"
            && !Array.isArray(missionControl.deliveryExecution)
          )
          || normalizePlaygroundTaskCommentList(missionControl.comments).length > 0
          || hasMeaningfulPlaygroundProjectStrategyBrief(strategyBrief)
          || hasActivity
          || hasMeaningfulPlaygroundDeliveryAssurance(missionControl.deliveryAssurance)
        );
      }

      function buildPlaygroundProjectMissionControlStorageRecord(value) {
        const normalized = normalizePlaygroundProjectMissionControlRecord(value);
        return {
          summary: normalized.summary,
          knowledgeLibraryId: normalized.knowledgeLibraryId,
          knowledgeLibraryName: normalized.knowledgeLibraryName,
          instructions: normalized.instructions,
          deliveryContract: clonePlaygroundProjectBlueprintValue(normalized.deliveryContract, null),
          deliveryPlan: clonePlaygroundProjectBlueprintValue(normalized.deliveryPlan, null),
          deliveryExecution: clonePlaygroundProjectBlueprintValue(normalized.deliveryExecution, null),
          deliveryAssurance: normalizePlaygroundDeliveryAssurance(normalized.deliveryAssurance),
          activity: normalizePlaygroundMissionControlActivity(normalized.activity),
          comments: normalizePlaygroundTaskCommentList(normalized.comments),
          lastThreadId: normalized.lastThreadId,
          updatedAt: normalized.updatedAt,
        };
      }

      function resolvePlaygroundProjectKnowledgeLibraryId(projectRecord) {
        const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
          ? projectRecord.metadata
          : {};
        const knowledge = metadata.knowledge && typeof metadata.knowledge === "object" && !Array.isArray(metadata.knowledge)
          ? metadata.knowledge
          : {};
        const missionControl = selectPlaygroundProjectMissionControlRecord(projectRecord);
        return String(
          projectRecord?.knowledgeLibraryId
          || metadata.knowledgeLibraryId
          || knowledge.libraryId
          || missionControl.knowledgeLibraryId
          || ""
        ).trim();
      }

      function buildPlaygroundProjectKnowledgeRunContext(projectRecord, source = "project_task") {
        const libraryId = resolvePlaygroundProjectKnowledgeLibraryId(projectRecord);
        if (!libraryId) {
          return null;
        }
        return {
          schemaVersion: "computer_agents_knowledge_context_v1",
          enabled: true,
          libraryIds: [libraryId],
          bindings: [{ libraryId }],
          mode: "propose",
          source: String(source || "project_task").slice(0, 80),
        };
      }

      function buildPlaygroundProjectKnowledgeAgentPromptSection(projectRecord) {
        const libraryId = resolvePlaygroundProjectKnowledgeLibraryId(projectRecord);
        if (!libraryId) {
          return [
            "Project Knowledge is not linked yet.",
            "- Do not put strategy or documentation into project metadata.",
            "- Ask Mission Control to prepare the project's Knowledge library before relying on durable project context.",
          ].join(String.fromCharCode(10));
        }
        return [
          "Project Knowledge (durable source of truth): " + libraryId,
          "- Read the attached library before making project decisions.",
          "- Propose updates when work creates or changes strategy, architecture, decisions, interfaces, runbooks, research, troubleshooting guidance, or handoff documentation.",
          "- Update an existing relevant document instead of creating duplicates. Never store strategy or documentation in project metadata, tickets, or transient working logs.",
        ].join(String.fromCharCode(10));
      }

      function buildPlaygroundProjectMissionControlMetadataFragment(project, fallbackProject = null) {
        const projectMetadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : {};
        const fallbackMetadata = fallbackProject?.metadata && typeof fallbackProject.metadata === "object" && !Array.isArray(fallbackProject.metadata)
          ? fallbackProject.metadata
          : {};
        const hasKnownMissionControl = Object.prototype.hasOwnProperty.call(project || {}, "missionControl")
          || Object.prototype.hasOwnProperty.call(projectMetadata, "missionControl")
          || Object.prototype.hasOwnProperty.call(fallbackProject || {}, "missionControl")
          || Object.prototype.hasOwnProperty.call(fallbackMetadata, "missionControl");
        const missionControl = selectPlaygroundProjectMissionControlRecord(project, fallbackProject);
        return hasKnownMissionControl || hasMeaningfulPlaygroundProjectMissionControlRecord(missionControl)
          ? { missionControl }
          : {};
      }

	      function getPlaygroundProjectMissionInstructions(project) {
	        return String(project?.description || "").trim();
	      }

	      function getPlaygroundProjectRules(project) {
	        const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	          ? project.metadata
	          : null;
	        if (typeof project?.projectRules === "string") {
	          return project.projectRules;
	        }
	        if (typeof metadata?.projectRules === "string") {
	          return metadata.projectRules;
	        }
	        return "";
	      }

	      function normalizePlaygroundProjectRuleEntry(value) {
	        return String(value || "").replace(/\\r\\n/g, "\\n").trim();
	      }

	      function normalizePlaygroundProjectRuleTitle(value) {
	        return String(value || "")
	          .replace(/\\r?\\n/g, " ")
	          .replace(/\\s+/g, " ")
	          .trim();
	      }

	      function parsePlaygroundProjectRuleEntry(value, index = 0) {
	        const normalized = normalizePlaygroundProjectRuleEntry(value);
	        if (!normalized) {
	          return {
	            title: "",
	            description: "",
	            serialized: "",
	          };
	        }
	        const lines = normalized.split("\\n");
	        const headingMatch = lines[0].match(/^###\\s+Rule:\\s*(.+)$/i);
	        if (headingMatch) {
	          return {
	            title: normalizePlaygroundProjectRuleTitle(headingMatch[1]),
	            description: normalizePlaygroundProjectRuleEntry(lines.slice(1).join("\\n")),
	            serialized: normalized,
	          };
	        }
	        return {
	          title: "Rule " + String(index + 1),
	          description: normalized,
	          serialized: normalized,
	        };
	      }

	      function createPlaygroundProjectRuleEntry(title, description) {
	        const normalizedTitle = normalizePlaygroundProjectRuleTitle(title);
	        const normalizedDescription = normalizePlaygroundProjectRuleEntry(description);
	        if (!normalizedTitle || !normalizedDescription) {
	          return "";
	        }
	        return "### Rule: " + normalizedTitle + "\\n" + normalizedDescription;
	      }

	      function splitPlaygroundProjectRuleEntries(value) {
	        const normalized = normalizePlaygroundProjectRuleEntry(value);
	        if (!normalized) {
	          return [];
	        }
	        const structuredEntryPattern = /^###\\s+Rule:\\s*.+$/gim;
	        const structuredEntryStarts = [];
	        let structuredEntryMatch = null;
	        while ((structuredEntryMatch = structuredEntryPattern.exec(normalized)) !== null) {
	          structuredEntryStarts.push(structuredEntryMatch.index);
	        }
	        if (structuredEntryStarts.length > 0) {
	          const legacyPrefix = normalizePlaygroundProjectRuleEntry(
	            normalized.slice(0, structuredEntryStarts[0])
	          );
	          const legacyEntries = legacyPrefix
	            ? legacyPrefix
	                .split(/\\n{2,}/)
	                .map((entry) => normalizePlaygroundProjectRuleEntry(entry))
	                .filter(Boolean)
	            : [];
	          const structuredEntries = structuredEntryStarts
	            .map((start, index) => normalizePlaygroundProjectRuleEntry(
	              normalized.slice(start, structuredEntryStarts[index + 1] ?? normalized.length)
	            ))
	            .filter(Boolean);
	          return [...legacyEntries, ...structuredEntries];
	        }
	        return normalized
	          .split(/\\n{2,}/)
	          .map((entry) => normalizePlaygroundProjectRuleEntry(entry))
	          .filter(Boolean);
	      }

	      function serializePlaygroundProjectRuleEntries(entries) {
	        return (Array.isArray(entries) ? entries : [])
	          .map((entry) => normalizePlaygroundProjectRuleEntry(entry))
	          .filter(Boolean)
	          .join("\\n\\n");
	      }

	      function buildPlaygroundProjectRepositoryPolicyRuleEntries(project) {
	        const githubSelection = normalizePlaygroundTaskConnectorSelections(project?.connectors).github;
	        return buildPlaygroundGithubRepoReferencesFromConnectorSelection(githubSelection)
	          .map((repository) => {
	            const repoFullName = String(repository?.repoFullName || "").trim();
	            if (!repoFullName) {
	              return "";
	            }
	            const baseBranch = String(repository?.branch || "main").trim() || "main";
	            const branchPrefix = String(repository?.branchPrefix || "computer-agents/").trim();
	            const policyLines = [
	              "This is a managed repository policy. It cannot be overridden by a ticket or an agent.",
	              "- Repository: " + repoFullName,
	              "- Treat " + baseBranch + " as the base branch and create working branches from it.",
	              branchPrefix
	                ? "- Every new working branch name must start with " + branchPrefix + "."
	                : "- No branch-name prefix is required.",
	              repository?.createPullRequests !== false
	                ? "- When changes are complete, push the working branch and create a pull request. Never commit completed work directly to the base branch."
	                : "- Do not create a pull request. Leave completed changes on the working branch.",
	              repository?.forcePushCommits === true
	                ? "- Update an existing remote working branch with git push --force-with-lease. Never use an unguarded --force push."
	                : "- Never force-push. Use a normal push and stop for user guidance if the remote branch cannot be updated safely.",
	            ];
	            return createPlaygroundProjectRuleEntry(
	              "GitHub · " + repoFullName,
	              policyLines.join(String.fromCharCode(10))
	            );
	          })
	          .filter(Boolean);
	      }

	      function buildPlaygroundProjectRulesPromptSection(project) {
	        const rules = serializePlaygroundProjectRuleEntries([
	          ...buildPlaygroundProjectRepositoryPolicyRuleEntries(project),
	          ...splitPlaygroundProjectRuleEntries(getPlaygroundProjectRules(project)),
	        ]);
	        if (!rules) {
	          return "";
	        }
	        return "Project rules agents must follow:" + String.fromCharCode(10) + rules;
	      }

	      function extractPlaygroundMissionControlSummary(document) {
	        const plainText = String(document || "")
	          .replace(/\\x60\\x60\\x60[\\s\\S]*?\\x60\\x60\\x60/g, " ")
	          .replace(/[\\x60*_>#-]/g, " ")
	          .replace(/\\[(.*?)\\]\\((.*?)\\)/g, "$1")
	          .replace(/\\s+/g, " ")
	          .trim();
	        if (!plainText) {
	          return "";
	        }
	        const sentenceMatches = plainText.match(/[^.!?]+[.!?]+/g) || [plainText];
	        const summary = sentenceMatches.slice(0, 2).join(" ").trim() || plainText;
	        return summary.length > 260 ? summary.slice(0, 257).trimEnd() + "…" : summary;
	      }

	      function getPlaygroundProjectStrategyBriefRecord(project) {
	        const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
	          ? project.metadata
	          : null;
	        const missionControl = getPlaygroundProjectMissionControlRecord(project);
	        const strategyBrief = normalizePlaygroundProjectStrategyBrief(missionControl.strategyBrief);
	        const projectGoal = normalizePlaygroundStrategyText(project?.description || metadata?.description);
	        if (projectGoal) {
	          strategyBrief.mission = projectGoal;
	        } else if (!strategyBrief.mission && missionControl.summary) {
	          strategyBrief.mission = normalizePlaygroundStrategyText(missionControl.summary);
	        }
	        if (!strategyBrief.mission && missionControl.document) {
	          strategyBrief.mission = extractPlaygroundMissionControlSummary(missionControl.document);
	        }
	        return strategyBrief;
	      }

	      function getPlaygroundTaskStrategyOutcomeId(taskRecord) {
	        const metadata = taskRecord?.metadata && typeof taskRecord.metadata === "object" && !Array.isArray(taskRecord.metadata)
	          ? taskRecord.metadata
	          : null;
	        const runnerPlayground = metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
	          ? metadata.runnerPlayground
	          : null;
	        return normalizePlaygroundStrategyText(
	          taskRecord?.strategyOutcomeId
	          || metadata?.strategyOutcomeId
	          || runnerPlayground?.strategyOutcomeId
	        );
	      }

	      function findPlaygroundStrategyOutcomeForTask(strategyBrief, taskRecord) {
	        const normalizedStrategy = normalizePlaygroundProjectStrategyBrief(strategyBrief);
	        const outcomes = normalizedStrategy.outcomes;
	        if (!outcomes.length || !taskRecord) {
	          return null;
	        }
	        const taskOutcomeId = getPlaygroundTaskStrategyOutcomeId(taskRecord);
	        const releaseId = normalizePlaygroundStrategyText(taskRecord.releaseId);
	        if (taskOutcomeId) {
	          const matchedOutcome = outcomes.find((outcome) => outcome.id === taskOutcomeId);
	          if (matchedOutcome) {
	            return matchedOutcome;
	          }
	        }
	        if (releaseId) {
	          const matchedOutcome = outcomes.find((outcome) =>
	            normalizePlaygroundStrategyOutcomeReleaseIds(outcome).includes(releaseId)
	          );
	          if (matchedOutcome) {
	            return matchedOutcome;
	          }
	        }
	        const taskText = normalizePlaygroundStrategyText([taskRecord.title, taskRecord.description].filter(Boolean).join(" ")).toLowerCase();
	        if (taskText) {
	          return outcomes.find((outcome) => {
	            const title = normalizePlaygroundStrategyText(outcome.title).toLowerCase();
	            return title.length >= 8 && taskText.includes(title);
	          }) || null;
	        }
	        return null;
	      }

	      function formatPlaygroundStrategyPromptList(label, values) {
	        const items = normalizePlaygroundStrategyTextList(values);
	        if (!items.length) {
	          return "";
	        }
	        const newline = String.fromCharCode(10);
	        return label + ":" + newline + items.map((item) => "- " + item).join(newline);
	      }

	        function buildPlaygroundProjectStrategyBriefPromptSection(project, options = {}) {
	        const strategyBrief = getPlaygroundProjectStrategyBriefRecord(project);
	        const newline = String.fromCharCode(10);
	        const sections = [];
	        const releaseRecords = (Array.isArray(options?.releaseRecords) ? options.releaseRecords : [])
	          .map((releaseRecord) => normalizePlaygroundTaskReleaseRecord(releaseRecord))
	          .filter((releaseRecord) => releaseRecord.id);
	        if (strategyBrief.mission) {
	          sections.push("Goal: " + strategyBrief.mission);
	        }
	        if (!options?.taskRecord && releaseRecords.length > 0) {
	          sections.push([
	            "Current milestones:",
	            ...releaseRecords.map((release) => {
	              const legacyOutcome = getPlaygroundLegacyStrategyOutcomeForRelease(strategyBrief, release.id);
	              const successCriteria = release.successCriteria.length > 0
	                ? release.successCriteria
	                : normalizePlaygroundStrategyTextList(legacyOutcome?.successCriteria);
	              const details = [
	                release.description || legacyOutcome?.description,
	                successCriteria.length > 0 ? "Success: " + successCriteria.join("; ") : "",
	              ].filter(Boolean).join(" ");
	              return "- " + (release.name || release.id) + (details ? " — " + details : "");
	            }),
	          ].join(newline));
	        }
	        const taskOutcome = findPlaygroundStrategyOutcomeForTask(strategyBrief, options?.taskRecord);
	        const taskReleaseId = normalizePlaygroundStrategyText(options?.taskRecord?.releaseId);
	        const taskRelease = taskReleaseId
	          ? releaseRecords.find((release) => release.id === taskReleaseId) || null
	          : null;
	        const taskMilestoneCriteria = taskRelease?.successCriteria?.length > 0
	          ? taskRelease.successCriteria
	          : normalizePlaygroundStrategyTextList(taskOutcome?.successCriteria);
	        if (taskReleaseId && (taskRelease || taskOutcome)) {
	          sections.push([
	            "Milestone: " + (taskRelease?.name || taskOutcome?.title || taskReleaseId),
	            taskRelease?.description || taskOutcome?.description
	              ? "Milestone context: " + (taskRelease?.description || taskOutcome?.description)
	              : "",
	            taskMilestoneCriteria.length > 0
	              ? "Milestone success criteria:" + newline + taskMilestoneCriteria.map((item) => "- " + item).join(newline)
	              : "",
	          ].filter(Boolean).join(newline));
	        } else if (taskOutcome) {
	          sections.push([
	            "Delivery target: " + (taskOutcome.title || taskOutcome.id),
	            taskOutcome.description ? "Target context: " + taskOutcome.description : "",
	            taskOutcome.successCriteria.length > 0
	              ? "Target success criteria:" + newline + taskOutcome.successCriteria.map((item) => "- " + item).join(newline)
	              : "",
	          ].filter(Boolean).join(newline));
	        }
	        const scopeLines = [
	          formatPlaygroundStrategyPromptList("In scope", strategyBrief.inScope),
	          formatPlaygroundStrategyPromptList("Out of scope", strategyBrief.outOfScope),
	        ].filter(Boolean).join(newline);
	        if (scopeLines) {
	          sections.push("Scope boundaries:" + newline + scopeLines);
	        }
	        [
	          formatPlaygroundStrategyPromptList("Project success criteria", strategyBrief.successCriteria),
	          formatPlaygroundStrategyPromptList("Risks and assumptions", strategyBrief.risks),
	          formatPlaygroundStrategyPromptList("Key decisions", strategyBrief.decisions),
	        ].filter(Boolean).forEach((section) => sections.push(section));
	        if (!sections.length) {
	          return "";
	        }
	        return "Project goal and strategy:" + newline + sections.join(newline + newline);
	      }

\${CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT}
      function normalizePlaygroundIdList(items) {
        const next = [];
        const seen = new Set();
        (Array.isArray(items) ? items : []).forEach((value) => {
          const normalized = String(value || "").trim();
          if (!normalized || seen.has(normalized)) return;
          seen.add(normalized);
          next.push(normalized);
        });
        return next;
      }

      function notionDatabasesToPlaygroundConnectorItems(databases, options = {}) {
        const workspaceItem = {
          id: "__entire_workspace__",
          name: "Entire workspace",
          mimeType: "application/x-notion-workspace",
          isFolder: false,
        };

        const databaseItems = (Array.isArray(databases) ? databases : []).map((database) => ({
          id: typeof database?.id === "string" ? database.id : "",
          name: typeof database?.name === "string" && database.name.trim() ? database.name.trim() : "Untitled database",
          mimeType: "application/x-notion-database",
          isFolder: false,
        })).filter((item) => item.id);

        return options?.includeWorkspace === false
          ? databaseItems
          : [workspaceItem].concat(databaseItems);
      }

      function fileItemsForParent(items, parentId) {
        return (Array.isArray(items) ? items : []).filter((item) => (item?.parentId ?? null) === parentId);
      }

      function childFolderPath(items, rootLabel, folderId) {
        const path = [{ id: null, name: rootLabel }];
        if (!folderId) {
          return path;
        }

        const byId = new Map((Array.isArray(items) ? items : []).map((item) => [item.id, item]));
        const stack = [];
        let current = byId.get(folderId);

        while (current) {
          stack.unshift(current);
          current = current.parentId ? byId.get(current.parentId) : undefined;
        }

        stack.forEach((item) => {
          path.push({
            id: item.id,
            name: item.name,
          });
        });

        return path;
      }

      function mergePlaygroundConnectorFolderItems(current, folderId, nextItems) {
        const normalizedParentId = folderId === "root" ? null : folderId;
        const remaining = (Array.isArray(current) ? current : []).filter((item) => (item?.parentId ?? null) !== normalizedParentId);
        const normalizedNext = (Array.isArray(nextItems) ? nextItems : []).map((item) => ({
          ...item,
          parentId: item?.parentId ?? normalizedParentId,
        }));
        return remaining.concat(normalizedNext);
      }

      function getPlaygroundTaskConnectorOption(value) {
        const normalizedKey = PLAYGROUND_TASK_CONNECTOR_SOURCE_TO_KEY[String(value || "").trim()] || String(value || "").trim();
        return PLAYGROUND_TASK_CONNECTOR_OPTIONS.find((option) => option.key === normalizedKey || option.source === normalizedKey) || null;
      }

      function getPlaygroundTaskConnectorKey(value) {
        return getPlaygroundTaskConnectorOption(value)?.key || "";
      }

      function getPlaygroundTaskConnectorSource(value) {
        return getPlaygroundTaskConnectorOption(value)?.source || "";
      }

      function getPlaygroundIntegrationProvider(value) {
        return getPlaygroundTaskConnectorSource(value) || String(value || "").trim().toLowerCase();
      }

      function normalizePlaygroundTaskConnectorItem(item) {
        if (!item || typeof item !== "object") {
          return null;
        }

        const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : "";
        const name = typeof item.name === "string" && item.name.trim() ? item.name.trim() : "";
        if (!id || !name) {
          return null;
        }

        return {
          id,
          name,
          path: typeof item.path === "string" ? item.path : "",
          parentId: typeof item.parentId === "string" && item.parentId.trim() ? item.parentId.trim() : null,
          isFolder: Boolean(item.isFolder),
          size: Number.isFinite(item.size) ? Number(item.size) : 0,
          modifiedTime: typeof item.modifiedTime === "string" ? item.modifiedTime : "",
          createdTime: typeof item.createdTime === "string" ? item.createdTime : "",
          mimeType: typeof item.mimeType === "string" ? item.mimeType : "",
          previewUrl: typeof item.previewUrl === "string" && item.previewUrl.trim() ? item.previewUrl.trim() : undefined,
          repoFullName: typeof item.repoFullName === "string" && item.repoFullName.trim() ? item.repoFullName.trim() : undefined,
          ref: typeof item.ref === "string" && item.ref.trim() ? item.ref.trim() : undefined,
          branchPrefix: typeof item.branchPrefix === "string" ? item.branchPrefix.trim() : undefined,
          createPullRequests: typeof item.createPullRequests === "boolean" ? item.createPullRequests : undefined,
          forcePushCommits: typeof item.forcePushCommits === "boolean" ? item.forcePushCommits : undefined,
          strategyKnowledgeSyncEnabled: typeof item.strategyKnowledgeSyncEnabled === "boolean"
            ? item.strategyKnowledgeSyncEnabled
            : undefined,
          strategyKnowledgeSyncToNotionEnabled: typeof item.strategyKnowledgeSyncToNotionEnabled === "boolean"
            ? item.strategyKnowledgeSyncToNotionEnabled
            : undefined,
          strategyKnowledgeSyncFromNotionEnabled: typeof item.strategyKnowledgeSyncFromNotionEnabled === "boolean"
            ? item.strategyKnowledgeSyncFromNotionEnabled
            : undefined,
          strategyKnowledgeSyncToConfluenceEnabled: typeof item.strategyKnowledgeSyncToConfluenceEnabled === "boolean"
            ? item.strategyKnowledgeSyncToConfluenceEnabled
            : undefined,
          strategyKnowledgeSyncFromConfluenceEnabled: typeof item.strategyKnowledgeSyncFromConfluenceEnabled === "boolean"
            ? item.strategyKnowledgeSyncFromConfluenceEnabled
            : undefined,
          resourceType: typeof item.resourceType === "string" && item.resourceType.trim() ? item.resourceType.trim() : undefined,
          resourceKey: typeof item.resourceKey === "string" && item.resourceKey.trim() ? item.resourceKey.trim() : undefined,
          spaceKey: typeof item.spaceKey === "string" && item.spaceKey.trim() ? item.spaceKey.trim() : undefined,
          cloudId: typeof item.cloudId === "string" && item.cloudId.trim() ? item.cloudId.trim() : undefined,
          siteUrl: typeof item.siteUrl === "string" && item.siteUrl.trim() ? item.siteUrl.trim() : undefined,
        };
      }

      function buildPlaygroundTaskConnectorValueLabel(source, items) {
        const normalizedSource = getPlaygroundTaskConnectorSource(source);
        const normalizedItems = (Array.isArray(items) ? items : [])
          .map((item) => normalizePlaygroundTaskConnectorItem(item))
          .filter(Boolean);

        if (normalizedItems.length === 0) {
          return "";
        }

        if (normalizedSource === "notion") {
          return normalizedItems.length === 1
            ? normalizedItems[0]?.name || ""
            : normalizedItems.length + " databases";
        }

        if (normalizedSource === "github") {
          const repoName = normalizedItems.find((item) => item?.repoFullName)?.repoFullName || "";
          if (normalizedItems.length === 1) {
            const item = normalizedItems[0];
            if (item.isFolder && !String(item.path || "").trim() && repoName) {
              return repoName;
            }
            return repoName ? repoName + " / " + item.name : item.name;
          }
          return repoName
            ? repoName + " • " + normalizedItems.length + " item" + (normalizedItems.length === 1 ? "" : "s")
            : normalizedItems.length + " item" + (normalizedItems.length === 1 ? "" : "s");
        }

        if (normalizedSource === "atlassian") {
          return normalizedItems.length === 1
            ? normalizedItems[0]?.name || ""
            : normalizedItems.length + " resources";
        }

        if (normalizedItems.length === 1) {
          return normalizedItems[0].name;
        }

        return normalizedItems.length + " file" + (normalizedItems.length === 1 ? "" : "s");
      }

      function buildPlaygroundTaskConnectorSelection(source, items, selectedIds) {
        const option = getPlaygroundTaskConnectorOption(source);
        if (!option) {
          return null;
        }

        const normalizedItems = [];
        const seen = new Set();
        (Array.isArray(items) ? items : []).forEach((item) => {
          const normalizedItem = normalizePlaygroundTaskConnectorItem(item);
          if (!normalizedItem || seen.has(normalizedItem.id)) {
            return;
          }
          seen.add(normalizedItem.id);
          normalizedItems.push(normalizedItem);
        });

        if (normalizedItems.length === 0) {
          return null;
        }

        const normalizedSelectedIds = normalizePlaygroundIdList(selectedIds);
        return {
          source: option.source,
          valueLabel: buildPlaygroundTaskConnectorValueLabel(option.source, normalizedItems),
          items: normalizedItems,
          selectedIds: normalizedSelectedIds.length > 0
            ? normalizedSelectedIds.filter((id) => normalizedItems.some((item) => item.id === id))
            : normalizedItems.map((item) => item.id),
        };
      }

      function buildPlaygroundGithubRepoReferencesFromConnectorSelection(selection) {
        const normalizedItems = (Array.isArray(selection?.items) ? selection.items : [])
          .map((item) => normalizePlaygroundTaskConnectorItem(item))
          .filter((item) => item?.repoFullName);
        const references = [];
        const seen = new Set();
        normalizedItems.forEach((item) => {
          const repoFullName = String(item.repoFullName || "").trim();
          if (!repoFullName) {
            return;
          }
          const branch = String(item.ref || "").trim() || "main";
          const key = repoFullName + "::" + branch;
          if (seen.has(key)) {
            return;
          }
          seen.add(key);
          references.push({
            repoFullName,
            repoName: repoFullName.split("/").pop() || repoFullName,
            branch,
            branchPrefix: typeof item.branchPrefix === "string" ? item.branchPrefix : "computer-agents/",
            createPullRequests: item.createPullRequests !== false,
            forcePushCommits: item.forcePushCommits === true,
          });
        });
        return references;
      }

      function buildPlaygroundGithubRepoReferenceFromConnectorSelection(selection) {
        return buildPlaygroundGithubRepoReferencesFromConnectorSelection(selection)[0] || null;
      }

      function normalizePlaygroundTaskConnectorSelection(source, selection) {
        const option = getPlaygroundTaskConnectorOption(source);
        if (!option || !selection || typeof selection !== "object") {
          return null;
        }

        const normalizedItems = [];
        const seen = new Set();
        (Array.isArray(selection.items) ? selection.items : []).forEach((item) => {
          const normalizedItem = normalizePlaygroundTaskConnectorItem(item);
          if (!normalizedItem || seen.has(normalizedItem.id)) {
            return;
          }
          seen.add(normalizedItem.id);
          normalizedItems.push(normalizedItem);
        });

        if (normalizedItems.length === 0) {
          return null;
        }

        const normalizedSelectedIds = normalizePlaygroundIdList(selection.selectedIds).filter((id) =>
          normalizedItems.some((item) => item.id === id)
        );

        return {
          source: option.source,
          valueLabel: typeof selection.valueLabel === "string" && selection.valueLabel.trim()
            ? selection.valueLabel.trim()
            : buildPlaygroundTaskConnectorValueLabel(option.source, normalizedItems),
          items: normalizedItems,
          selectedIds: normalizedSelectedIds.length > 0 ? normalizedSelectedIds : normalizedItems.map((item) => item.id),
        };
      }

      function normalizePlaygroundTaskConnectorSelections(items) {
        const source = items && typeof items === "object" ? items : {};
        const next = buildPlaygroundDefaultTaskConnectors();
        PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
          next[option.key] = normalizePlaygroundTaskConnectorSelection(
            option.key,
            source[option.key] || source[option.source]
          );
        });
        return next;
      }

      function mergePlaygroundTaskConnectorSelections(baseSelections, overrideSelections) {
        const base = normalizePlaygroundTaskConnectorSelections(baseSelections);
        const overrides = normalizePlaygroundTaskConnectorSelections(overrideSelections);
        const next = buildPlaygroundDefaultTaskConnectors();
        PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
          next[option.key] = overrides[option.key] || base[option.key] || null;
        });
        return next;
      }

      function buildPlaygroundConnectorPromptSection(title, connectors) {
        const normalizedConnectors = normalizePlaygroundTaskConnectorSelections(connectors);
        const lines = [];
        PLAYGROUND_TASK_CONNECTOR_OPTIONS.forEach((option) => {
          const selection = normalizedConnectors[option.key];
          const items = (Array.isArray(selection?.items) ? selection.items : [])
            .map((item) => normalizePlaygroundTaskConnectorItem(item))
            .filter(Boolean);
          if (!items.length) {
            return;
          }
          lines.push("- " + option.label + ": " + (selection.valueLabel || buildPlaygroundTaskConnectorValueLabel(option.source, items)));
          items.forEach((item) => {
            const details = [
              item.repoFullName ? ("repo=" + item.repoFullName) : null,
              item.ref ? ("branch=" + item.ref) : null,
              item.repoFullName ? ("branch-prefix=" + (item.branchPrefix || "computer-agents/")) : null,
              item.repoFullName ? ("pull-requests=" + (item.createPullRequests === false ? "do-not-create" : "create")) : null,
              item.repoFullName ? ("force-push=" + (item.forcePushCommits === true ? "always-with-lease" : "never")) : null,
              item.path ? ("path=" + item.path) : null,
              item.isFolder ? "folder=true" : null,
            ].filter(Boolean);
            lines.push("  - " + item.name + (details.length ? " | " + details.join(" | ") : ""));
          });
        });
        return lines.length
          ? [title + ":", ...lines].join("\\n")
          : title + ": None configured.";
      }

      function hasPlaygroundTaskConnectorSelections(items) {
        const normalized = normalizePlaygroundTaskConnectorSelections(items);
        return PLAYGROUND_TASK_CONNECTOR_OPTIONS.some((option) => Boolean(normalized[option.key]));
      }

      function buildPlaygroundProjectResourcePromptSection(projectRecord, options = {}) {
        const normalizedProject = projectRecord && typeof projectRecord === "object"
          ? projectRecord
          : {};
        const newline = String.fromCharCode(10);
        const normalizedProjectId = String(options?.projectId || normalizedProject.id || "").trim();
        const normalizedProjectName = String(options?.projectName || normalizedProject.name || "").trim();
        const normalizedAttachments = normalizePlaygroundTaskAttachmentList(
          options?.projectAttachments || normalizedProject.attachments
        );
        const normalizedConnectors = normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors);
        const connectorLabels = PLAYGROUND_TASK_CONNECTOR_OPTIONS.map((option) => {
          const selection = normalizedConnectors[option.key];
          if (!selection) {
            return null;
          }
          return option.label;
        }).filter(Boolean);
        const projectLabel = [normalizedProjectName, normalizedProjectId ? "(" + normalizedProjectId + ")" : ""]
          .filter(Boolean)
          .join(" ")
          .trim();

        const resourceLines = [
          projectLabel ? "- Project: " + projectLabel : "",
          normalizedAttachments.length > 0
            ? "- Files: " + normalizedAttachments.length + " project-scoped file" + (normalizedAttachments.length === 1 ? "" : "s") + " listed under Project attachments."
            : "- Files: no project-scoped files are listed in this prompt.",
          connectorLabels.length > 0
            ? "- Connectors: " + connectorLabels.join(", ")
            : "- Connectors: none configured for this project.",
          normalizedProjectId
            ? "- Complete API index: GET /api/real/projects/" + normalizedProjectId + "/resource-index returns files, connectors, server resources, metronomes, and imagine resources for this project."
            : "- Complete API index: GET /api/real/projects/<projectId>/resource-index returns files, connectors, server resources, metronomes, and imagine resources for this project.",
          normalizedProjectId
            ? "- Server resources: use the project id " + normalizedProjectId + " when listing web apps, functions, databases, APIs, agent runtime resources, or secrets."
            : "- Server resources: use the current project id when listing web apps, functions, databases, APIs, agent runtime resources, or secrets.",
          normalizedProjectId
            ? "- Metronomes: use the project id " + normalizedProjectId + " when listing recurring project workflows."
            : "- Metronomes: use the current project id when listing recurring project workflows.",
          normalizedProjectId
            ? "- Imagine Resources: use the project id " + normalizedProjectId + " when listing generated visual assets and reusable imagine resources."
            : "- Imagine Resources: use the current project id when listing generated visual assets and reusable imagine resources.",
        ].filter(Boolean);

        const accessLines = [
          "Resource access rules:",
          "- Treat the project id above as authoritative. Do not list all projects just to discover this project.",
          "- Before creating or mutating a project resource, inspect the complete resource index endpoint first, then use the project-scoped endpoint for the relevant resource type when more detail is needed.",
          "- Keep newly created files, attachments, server resources, metronomes, and imagine resources in the project scope when the work belongs to this ticket.",
          "- If a needed project resource is missing, say exactly what is missing or create the appropriate resource request instead of inventing resource ids.",
        ];

        return [
          "Project resource index:",
          ...resourceLines,
          "",
          ...accessLines,
        ].join(newline);
      }

      function normalizePlaygroundEnabledSkillIds(items) {
        const next = [];
        const seen = new Set();
        const ignoredConfigKeys = new Set([
          "imageGenerationModel",
          "imageGenerationQuality",
          "imageGenerationComputeTokensPerImage",
          "imageGenerationConfig",
          "videoGenerationModel",
          "videoGenerationConfig",
          "deepResearchModel",
          "deepResearchConfig",
        ]);

        function appendSkillId(value) {
          const rawValue = String(value || "").trim();
          if (!rawValue) return;
          const normalized = PLAYGROUND_RUNNER_SKILL_ID_ALIASES[rawValue] || rawValue;
          if (!normalized || normalized === "customSkills" || ignoredConfigKeys.has(normalized) || seen.has(normalized)) {
            return;
          }
          seen.add(normalized);
          next.push(normalized);
        }

        if (Array.isArray(items)) {
          items.forEach((value) => appendSkillId(value));
          return next;
        }

        if (items && typeof items === "object") {
          Object.entries(items).forEach(([key, value]) => {
            if (key === "customSkills") {
              (Array.isArray(value) ? value : []).forEach((skillId) => appendSkillId(skillId));
              return;
            }
            if (value) {
              appendSkillId(key);
            }
          });
        }

        return next;
      }

      function loadPlaygroundRunnerEnabledSkillIds() {
        if (typeof window === "undefined" || !window.localStorage) {
          return PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS;
        }
        try {
          const raw = window.localStorage.getItem(PLAYGROUND_RUNNER_ENABLED_SKILLS_STORAGE_KEY);
          if (!raw) {
            return PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS;
          }
          const parsed = JSON.parse(raw);
          const normalized = normalizePlaygroundEnabledSkillIds(parsed);
          return normalized.length > 0 ? normalized : [];
        } catch {
          return PLAYGROUND_DEFAULT_ENABLED_SKILL_IDS;
        }
      }

      function persistPlaygroundRunnerEnabledSkillIds(skillIds) {
        if (typeof window === "undefined" || !window.localStorage) {
          return;
        }
        try {
          window.localStorage.setItem(
            PLAYGROUND_RUNNER_ENABLED_SKILLS_STORAGE_KEY,
            JSON.stringify(normalizePlaygroundEnabledSkillIds(skillIds))
          );
        } catch {
          // Ignore storage failures; the current page state still reflects the user's choice.
        }
      }

      function normalizePlaygroundTaskAttachmentRecord(attachment) {
        if (!attachment || typeof attachment !== "object") {
          return null;
        }
        if (attachment.isTemporary || attachment.uploadStatus === "uploading") {
          return null;
        }

        const id = typeof attachment.id === "string" && attachment.id.trim() ? attachment.id.trim() : "";
        const filename = typeof attachment.filename === "string" && attachment.filename.trim() ? attachment.filename.trim() : "";
        if (!id || !filename) {
          return null;
        }

        const rawMimeType = typeof attachment.mimeType === "string" && attachment.mimeType.trim()
          ? attachment.mimeType.trim()
          : "";
        const isFolder = Boolean(
          attachment.isFolder
          || attachment.type === "directory"
          || String(attachment.previewKindOverride || "").toLowerCase() === "directory"
          || rawMimeType.toLowerCase() === "inode/directory"
        );
        const mimeType = rawMimeType || (isFolder ? "inode/directory" : "application/octet-stream");
        const previewKindOverride = typeof attachment.previewKindOverride === "string" && attachment.previewKindOverride.trim()
          ? attachment.previewKindOverride.trim()
          : undefined;
        const type = attachment.type === "image" || String(mimeType).toLowerCase().startsWith("image/")
          ? "image"
          : "document";
        const connectorSource = getPlaygroundTaskConnectorSource(attachment.connectorSource || attachment.integrationSource);
        const connectorItemId = typeof attachment.connectorItemId === "string" && attachment.connectorItemId.trim()
          ? attachment.connectorItemId.trim()
          : "";
        const connectorItemPath = typeof attachment.connectorItemPath === "string" && attachment.connectorItemPath.trim()
          ? attachment.connectorItemPath.trim()
          : typeof attachment.path === "string" && attachment.path.trim()
            ? attachment.path.trim()
            : undefined;
        const connectorRepoFullName = typeof attachment.connectorRepoFullName === "string" && attachment.connectorRepoFullName.trim()
          ? attachment.connectorRepoFullName.trim()
          : typeof attachment.repoFullName === "string" && attachment.repoFullName.trim()
            ? attachment.repoFullName.trim()
            : undefined;
        const connectorRef = typeof attachment.connectorRef === "string" && attachment.connectorRef.trim()
          ? attachment.connectorRef.trim()
          : typeof attachment.ref === "string" && attachment.ref.trim()
            ? attachment.ref.trim()
            : undefined;

        return {
          id,
          filename,
          mimeType,
          type,
          isFolder: isFolder || undefined,
          previewKindOverride: isFolder ? "directory" : previewKindOverride,
          size: Number.isFinite(attachment.size) ? Number(attachment.size) : 0,
          uploadedAt: typeof attachment.uploadedAt === "string" && attachment.uploadedAt ? attachment.uploadedAt : "",
          url: typeof attachment.url === "string" && attachment.url.trim() ? attachment.url.trim() : undefined,
          previewUrl: typeof attachment.previewUrl === "string" && attachment.previewUrl.trim() ? attachment.previewUrl.trim() : undefined,
          environmentId: typeof attachment.environmentId === "string" && attachment.environmentId.trim()
            ? attachment.environmentId.trim()
            : typeof attachment.sourceEnvironmentId === "string" && attachment.sourceEnvironmentId.trim()
              ? attachment.sourceEnvironmentId.trim()
              : undefined,
          sourcePath: normalizeHistoryPath(
            typeof attachment.sourcePath === "string" && attachment.sourcePath.trim()
              ? attachment.sourcePath
              : attachment.workspacePath
          ) || undefined,
          workspacePath: typeof attachment.workspacePath === "string" && attachment.workspacePath.trim() ? attachment.workspacePath.trim() : undefined,
          gcsPath: typeof attachment.gcsPath === "string" && attachment.gcsPath.trim() ? attachment.gcsPath.trim() : undefined,
          connectorSource: connectorSource || undefined,
          connectorItemId: connectorItemId || undefined,
          connectorItemPath,
          connectorRepoFullName,
          connectorRef,
          clientUploadId: typeof attachment.clientUploadId === "string" && attachment.clientUploadId.trim()
            ? attachment.clientUploadId.trim()
            : undefined,
          isUploading: Boolean(attachment.isUploading) || undefined,
          uploadPending: Boolean(attachment.uploadPending) || undefined,
        };
      }

      function normalizePlaygroundTaskAttachmentList(items) {
        const next = [];
        const seen = new Set();
        (Array.isArray(items) ? items : []).forEach((attachment) => {
          const normalized = normalizePlaygroundTaskAttachmentRecord(attachment);
          if (!normalized || seen.has(normalized.id)) return;
          seen.add(normalized.id);
          next.push(normalized);
        });
        return next;
      }

      function getPlaygroundAttachmentPromptPath(attachment) {
        const workspacePath = normalizeHistoryPath(attachment?.workspacePath);
        if (workspacePath) {
          return workspacePath;
        }
        const sourcePath = normalizeHistoryPath(attachment?.sourcePath);
        if (sourcePath) {
          return sourcePath;
        }
        return String(attachment?.filename || attachment?.name || "attachment").trim() || "attachment";
      }

      function buildPlaygroundAttachmentPromptSection(title, attachments, options = {}) {
        const newline = String.fromCharCode(10);
        const normalizedAttachments = normalizePlaygroundTaskAttachmentList(attachments);
        if (normalizedAttachments.length === 0) {
          return "";
        }
        const lines = normalizedAttachments.map((attachment) => {
          const attachmentLabel = String(attachment?.filename || attachment?.name || "file").trim() || "file";
          return "- " + attachmentLabel + ": " + getPlaygroundAttachmentPromptPath(attachment);
        });
        return [
          title,
          typeof options.copy === "string" && options.copy.trim() ? options.copy.trim() : "",
          ...lines,
        ].filter(Boolean).join(newline);
      }

      function wrapPlaygroundHiddenSystemPrompt(prompt) {
        const normalizedPrompt = String(prompt || "").trim();
        if (!normalizedPrompt) {
          return "";
        }
        const newline = String.fromCharCode(10);
        return ["<system>", normalizedPrompt, "</system>"].join(newline);
      }

      function getPlaygroundTaskCommentIdentitySources(comment) {
        const source = comment && typeof comment === "object" && !Array.isArray(comment) ? comment : {};
        const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
          ? source.metadata
          : {};
        return [source, source.author, source.user, source.agent, metadata, metadata.author, metadata.user, metadata.agent]
          .filter((value) => value && typeof value === "object" && !Array.isArray(value));
      }

      function readPlaygroundTaskCommentIdentityString(comment, keys) {
        for (const source of getPlaygroundTaskCommentIdentitySources(comment)) {
          for (const key of keys) {
            const value = source[key];
            if (typeof value === "string" && value.trim()) {
              return value.trim();
            }
          }
        }
        return "";
      }

      function normalizePlaygroundTaskCommentRecord(comment) {
        if (!comment || typeof comment !== "object") {
          return null;
        }

        const id = typeof comment.id === "string" && comment.id.trim() ? comment.id.trim() : "";
        const rawText = typeof comment.text === "string"
          ? comment.text
          : typeof comment.body === "string"
            ? comment.body
            : typeof comment.content === "string"
              ? comment.content
              : "";
        const text = rawText
          .replaceAll(String.fromCharCode(13), "")
          .trim();
        if (!id || !text) {
          return null;
        }

        const authorAgentId = readPlaygroundTaskCommentIdentityString(comment, ["authorAgentId", "author_agent_id", "agentId", "agent_id"]) || undefined;
        const authorUserId = readPlaygroundTaskCommentIdentityString(comment, ["authorUserId", "author_user_id", "createdByUserId", "created_by_user_id", "userId", "user_id", "uid"]) || undefined;
        const authorType = comment.authorType === "agent" || comment.authorType === "system" || comment.authorType === "user"
          ? comment.authorType
          : authorAgentId
            ? "agent"
            : "user";
        const explicitAuthorName = readPlaygroundTaskCommentIdentityString(comment, ["authorName", "author_name", "displayName", "display_name", "name", "fullName", "full_name"]);
        const authorName = explicitAuthorName
          ? explicitAuthorName
          : authorType === "agent"
            ? "Agent"
            : authorType === "system"
              ? "System"
              : "User";
        const authorAvatarUrl = readPlaygroundTaskCommentIdentityString(comment, [
          "authorAvatarUrl",
          "author_avatar_url",
          "authorPhotoUrl",
          "author_photo_url",
          "profilePhotoUrl",
          "profile_photo_url",
          "photoURL",
          "photoUrl",
          "photo_url",
          "avatarURL",
          "avatarUrl",
          "avatar_url",
          "avatar",
          "picture",
          "imageUrl",
          "image_url",
        ]) || undefined;
        const sourceThreadId = typeof comment.sourceThreadId === "string" && comment.sourceThreadId.trim()
          ? comment.sourceThreadId.trim()
          : typeof comment.threadId === "string" && comment.threadId.trim()
            ? comment.threadId.trim()
            : undefined;
        const parentCommentId = readPlaygroundTaskCommentIdentityString(comment, [
          "parentCommentId",
          "parent_comment_id",
          "replyToCommentId",
          "reply_to_comment_id",
        ]) || undefined;
        const metadata = comment.metadata && typeof comment.metadata === "object" && !Array.isArray(comment.metadata)
          ? { ...comment.metadata }
          : {};
        const attachments = normalizePlaygroundTaskAttachmentList(
          Array.isArray(comment.attachments)
            ? comment.attachments
            : metadata.attachments
        );
        const commentTimestamp = comment.createdAt
          ?? comment.created_at
          ?? comment.timestamp
          ?? comment.occurredAt
          ?? comment.occurred_at
          ?? comment.updatedAt
          ?? comment.updated_at;
        const createdAt = typeof commentTimestamp === "number" && Number.isFinite(commentTimestamp)
          ? new Date(commentTimestamp < 100000000000 ? commentTimestamp * 1000 : commentTimestamp).toISOString()
          : String(commentTimestamp || "").trim();

        return {
          id,
          text,
          authorType,
          authorAgentId,
          authorUserId,
          authorName,
          authorAvatarUrl,
          sourceThreadId,
          parentCommentId,
          metadata,
          attachments,
          createdAt,
        };
      }

      function normalizePlaygroundTaskCommentList(items) {
        const next = [];
        const seen = new Set();
        (Array.isArray(items) ? items : []).forEach((comment) => {
          const normalized = normalizePlaygroundTaskCommentRecord(comment);
          if (!normalized || seen.has(normalized.id)) {
            return;
          }
          seen.add(normalized.id);
          next.push(normalized);
        });
        return next;
      }

      function normalizePlaygroundTaskActivityRecord(event) {
        if (!event || typeof event !== "object" || Array.isArray(event)) {
          return null;
        }
        const validEventTypes = new Set([
          "created",
          "status_changed",
          "field_changed",
          "thread_started",
          "comment_added",
        ]);
        const eventPayload = event.payload && typeof event.payload === "object" && !Array.isArray(event.payload)
          ? event.payload
          : event.data && typeof event.data === "object" && !Array.isArray(event.data)
            ? event.data
            : {};
        const rawEventType = String(
          event.eventType
            || event.event_type
            || event.activityType
            || event.activity_type
            || event.type
            || event.action
            || event.name
            || eventPayload.eventType
            || eventPayload.event_type
            || eventPayload.type
            || ""
        ).trim().toLowerCase();
        // A few older task activity producers used field-specific event names
        // before the canonical activity contract was introduced. Normalize
        // those aliases here so every consumer (including the ticket detail
        // activity feed) renders the same field-change line.
        const eventTypeAliases = {
          task_created: "created",
          task_create: "created",
          status_change: "status_changed",
          priority_changed: "field_changed",
          priority_change: "field_changed",
          priority_updated: "field_changed",
          task_priority_changed: "field_changed",
          task_status_changed: "status_changed",
          task_status_change: "status_changed",
          status_updated: "status_changed",
          task_updated: "field_changed",
          task_field_changed: "field_changed",
          field_change: "field_changed",
          attribute_changed: "field_changed",
          assignee_changed: "field_changed",
          assignment_changed: "field_changed",
          assignee_updated: "field_changed",
          task_assigned: "field_changed",
          owner_changed: "field_changed",
          reviewer_changed: "field_changed",
          title_changed: "field_changed",
          milestone_changed: "field_changed",
          release_changed: "field_changed",
          milestone_updated: "field_changed",
          release_updated: "field_changed",
          thread_created: "thread_started",
          agent_thread_started: "thread_started",
        };
        const eventType = eventTypeAliases[rawEventType] || rawEventType;
        if (!validEventTypes.has(eventType)) {
          return null;
        }
        const sourceId = String(
          event.sourceId
            || event.source_id
            || eventPayload.sourceId
            || eventPayload.source_id
            || event.commentId
            || event.comment_id
            || event.threadId
            || event.thread_id
            || event.id
            || ""
        ).trim();
        const id = String(event.id || (eventType + ":" + sourceId)).trim();
        if (!id || !sourceId) {
          return null;
        }
        const taskId = String(
          event.taskId
            || event.task_id
            || eventPayload.taskId
            || eventPayload.task_id
            || event.task?.id
            || eventPayload.task?.id
            || ""
        ).trim() || null;
        const actorAgentId = readPlaygroundTaskCommentIdentityString(event, ["actorAgentId", "actor_agent_id"])
          || readPlaygroundTaskCommentIdentityString(eventPayload, ["actorAgentId", "actor_agent_id"])
          || undefined;
        const actorUserId = readPlaygroundTaskCommentIdentityString(event, ["actorUserId", "actor_user_id", "createdByUserId", "created_by_user_id"])
          || readPlaygroundTaskCommentIdentityString(eventPayload, ["actorUserId", "actor_user_id", "createdByUserId", "created_by_user_id"])
          || undefined;
        const actorType = ["user", "agent", "system"].includes(String(event.actorType || event.actor_type || "").trim().toLowerCase())
          ? String(event.actorType || event.actor_type).trim().toLowerCase()
          : actorAgentId
            ? "agent"
            : "user";
        const actorName = readPlaygroundTaskCommentIdentityString(event, ["actorName", "actor_name", "authorName", "author_name", "name"])
          || readPlaygroundTaskCommentIdentityString(eventPayload, ["actorName", "actor_name", "authorName", "author_name", "name"])
          || undefined;
        const actorAvatarUrl = readPlaygroundTaskCommentIdentityString(event, [
          "actorAvatarUrl",
          "actor_avatar_url",
          "authorAvatarUrl",
          "author_avatar_url",
          "photoUrl",
          "photo_url",
          "avatarUrl",
          "avatar_url",
          "picture",
        ])
          || readPlaygroundTaskCommentIdentityString(eventPayload, ["actorAvatarUrl", "actor_avatar_url", "avatarUrl", "avatar_url", "photoUrl", "photo_url"])
          || undefined;
        const eventTimestamp = event.createdAt
          ?? event.created_at
          ?? event.timestamp
          ?? event.occurredAt
          ?? event.occurred_at
          ?? event.metadata?.createdAt
          ?? event.metadata?.created_at
          ?? eventPayload.createdAt
          ?? eventPayload.created_at
          ?? eventPayload.timestamp;
        const timestampObject = eventTimestamp && typeof eventTimestamp === "object" && !Array.isArray(eventTimestamp)
          ? eventTimestamp
          : null;
        const numericTimestamp = typeof eventTimestamp === "number"
          ? eventTimestamp
          : Number(timestampObject?.seconds ?? timestampObject?._seconds ?? timestampObject?.epochSeconds);
        let createdAt = Number.isFinite(numericTimestamp) && numericTimestamp > 0
          ? new Date(numericTimestamp < 100000000000 ? numericTimestamp * 1000 : numericTimestamp).toISOString()
          : "";
        if (!createdAt && eventTimestamp && typeof eventTimestamp.toDate === "function") {
          try {
            const dateValue = eventTimestamp.toDate();
            const dateTimestamp = dateValue instanceof Date
              ? dateValue.getTime()
              : Date.parse(String(dateValue || ""));
            if (Number.isFinite(dateTimestamp)) {
              createdAt = new Date(dateTimestamp).toISOString();
            }
          } catch {}
        }
        if (!createdAt && typeof eventTimestamp === "string") {
          const parsedTimestamp = Date.parse(eventTimestamp.trim());
          if (Number.isFinite(parsedTimestamp)) {
            createdAt = new Date(parsedTimestamp).toISOString();
          }
        }
        const comment = normalizePlaygroundTaskCommentRecord(event.comment);
        const thread = event.thread && typeof event.thread === "object" && !Array.isArray(event.thread)
          ? { ...event.thread }
          : null;

        const rawFieldName = String(
          event.fieldName
            || event.field_name
            || event.field
            || event.fieldKey
            || event.field_key
            || eventPayload.fieldName
            || eventPayload.field_name
            || eventPayload.field
            || ""
        ).trim();
        const fieldNameAliases = {
          status: "status",
          status_id: "status",
          priority: "priority",
          priority_id: "priority",
          assignee: "assigneeAgentId",
          assignee_id: "assigneeAgentId",
          assignee_agent_id: "assigneeAgentId",
          reviewer: "reviewerAgentId",
          reviewer_id: "reviewerAgentId",
          reviewer_agent_id: "reviewerAgentId",
          title: "title",
          name: "title",
          release: "releaseId",
          release_id: "releaseId",
          milestone: "milestoneId",
          milestone_id: "milestoneId",
          due_at: "dueAt",
          scheduled_start_at: "scheduledStartAt",
          scheduled_end_at: "scheduledEndAt",
          schedule_type: "scheduleType",
          cron_expression: "cronExpression",
          schedule_timezone: "scheduleTimezone",
          schedule_enabled: "scheduleEnabled",
          dependency_ids: "dependencyIds",
        };
        const normalizedRawFieldName = rawFieldName
          ? fieldNameAliases[rawFieldName.toLowerCase()]
            || (rawFieldName.includes("_")
              ? rawFieldName.split("_").map((part, index) => index === 0
                ? part
                : part.charAt(0).toUpperCase() + part.slice(1)).join("")
              : rawFieldName)
          : "";
        const aliasedFieldNames = {
          status_change: "status",
          task_status_changed: "status",
          task_status_change: "status",
          priority_changed: "priority",
          priority_change: "priority",
          priority_updated: "priority",
          task_priority_changed: "priority",
          assignee_changed: "assigneeAgentId",
          assignment_changed: "assigneeAgentId",
          title_changed: "title",
          milestone_changed: "milestoneId",
          release_changed: "releaseId",
          status_updated: "status",
        };
        return {
          id,
          eventType,
          sourceId,
          taskId,
          actorType,
          actorUserId,
          actorAgentId,
          actorName,
          actorAvatarUrl,
          fieldName: normalizedRawFieldName
            || String(event.field || event.field_key || "").trim()
            || aliasedFieldNames[rawEventType]
            || null,
          previousValue: event.previousValue
            ?? event.previous_value
            ?? event.oldValue
            ?? event.old_value
            ?? eventPayload.previousValue
            ?? eventPayload.previous_value
            ?? eventPayload.oldValue
            ?? eventPayload.old_value
            ?? null,
          nextValue: event.nextValue
            ?? event.next_value
            ?? event.newValue
            ?? event.new_value
            ?? eventPayload.nextValue
            ?? eventPayload.next_value
            ?? eventPayload.newValue
            ?? eventPayload.new_value
            ?? null,
          threadId: String(event.threadId || event.thread_id || thread?.id || "").trim() || null,
          commentId: String(event.commentId || event.comment_id || comment?.id || "").trim() || null,
          thread,
          comment,
          metadata: event.metadata && typeof event.metadata === "object" && !Array.isArray(event.metadata)
            ? event.metadata
            : null,
          createdAt,
        };
      }

      function normalizePlaygroundTaskActivityList(items) {
        const eventsByKey = new Map();
        (Array.isArray(items) ? items : []).forEach((event) => {
          const normalized = normalizePlaygroundTaskActivityRecord(event);
          if (!normalized) {
            return;
          }
          const key = normalized.eventType + ":" + normalized.sourceId;
          const existing = eventsByKey.get(key);
          eventsByKey.set(key, existing ? { ...existing, ...normalized } : normalized);
        });
        return Array.from(eventsByKey.values()).sort((left, right) => {
          const leftTimestamp = Date.parse(String(left.createdAt || ""));
          const rightTimestamp = Date.parse(String(right.createdAt || ""));
          const timestampDifference = (Number.isFinite(leftTimestamp) ? leftTimestamp : 0)
            - (Number.isFinite(rightTimestamp) ? rightTimestamp : 0);
          return timestampDifference || String(left.id).localeCompare(String(right.id));
        });
      }

      function createPlaygroundTaskCommentRecord(text, author = {}) {
        const normalizedText = String(text || "").replaceAll(String.fromCharCode(13), "").trim();
        if (!normalizedText) {
          return null;
        }

        return normalizePlaygroundTaskCommentRecord({
          id: "task_comment_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8),
          text: normalizedText,
          authorType: author?.authorType || "user",
          authorAgentId: author?.authorAgentId || "",
          authorUserId: author?.authorUserId || "",
          authorName: author?.name || "Computer Agents",
          authorAvatarUrl: author?.avatarUrl || "",
          createdAt: new Date().toISOString(),
        });
      }

      function buildPlaygroundTaskConnectorItemsIndex(items = [], fallbackSelection = null) {
        const next = new Map();
        (Array.isArray(fallbackSelection?.items) ? fallbackSelection.items : []).forEach((item) => {
          const normalizedItem = normalizePlaygroundTaskConnectorItem(item);
          if (normalizedItem?.id) {
            next.set(normalizedItem.id, normalizedItem);
          }
        });
        (Array.isArray(items) ? items : []).forEach((item) => {
          const normalizedItem = normalizePlaygroundTaskConnectorItem(item);
          if (normalizedItem?.id) {
            const mergedItem = { ...(next.get(normalizedItem.id) || {}) };
            Object.entries(normalizedItem).forEach(([key, value]) => {
              if (value !== undefined) mergedItem[key] = value;
            });
            next.set(normalizedItem.id, mergedItem);
          }
        });
        return next;
      }

      function getPlaygroundTaskAttachmentConnectorSource(attachment) {
        return getPlaygroundTaskConnectorSource(attachment?.connectorSource || attachment?.integrationSource);
      }

      function buildPlaygroundTaskAttachmentConnectorMetadata(source, item) {
        const normalizedSource = getPlaygroundTaskConnectorSource(source || item?.connectorSource || item?.integrationSource);
        if (!normalizedSource) {
          return {};
        }
        return {
          connectorSource: normalizedSource,
          connectorItemId: typeof item?.connectorItemId === "string" && item.connectorItemId.trim()
            ? item.connectorItemId.trim()
`;
