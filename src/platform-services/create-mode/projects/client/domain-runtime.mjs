import {
  CALENDAR_DOMAIN_RUNTIME_SCRIPT,
  CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT,
  CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT,
} from "../../calendar/client/domain/index.mjs";
export const PROJECTS_DOMAIN_RUNTIME_SCRIPT = `
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
	        { id: "todo", label: "To do", statuses: ["backlog", "todo"] },
	        { id: "in_progress", label: "In doing", statuses: ["in_progress"] },
	        { id: "blocked", label: "Blocked", statuses: ["blocked"] },
	        { id: "in_review", label: "In Review", statuses: ["in_review"] },
	        { id: "done", label: "Finished", statuses: ["done"] },
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
		        return task?.status !== "done"
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

      function getPlaygroundProjectIconId(value) {
        const normalized = String(value || "").trim().toLowerCase();
        return PLAYGROUND_PROJECT_ICON_OPTIONS.some((option) => option.id === normalized)
          ? normalized
          : PLAYGROUND_PROJECT_ICON_OPTIONS[0].id;
      }

      function getPlaygroundProjectIconConfig(iconId) {
        return PLAYGROUND_PROJECT_ICON_OPTIONS.find((option) => option.id === getPlaygroundProjectIconId(iconId))
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
        const normalized = String(value || "").trim().toLowerCase();
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
          priority: "medium",
          defaultEnvironmentId: null,
          leadUserId: "",
          leadName: "",
          leadEmail: "",
	          leadAvatarUrl: "",
	          permissionSet: createPlaygroundDefaultPermissionSet("project"),
		          attachments: [],
		          connectors: buildPlaygroundDefaultTaskConnectors(),
	          projectRules: "",
	          missionControl: buildEmptyPlaygroundProjectMissionControl(),
	          metadata: buildPlaygroundProjectBlueprintMetadata(blueprint),
	          summary: buildEmptyPlaygroundProjectSummary(),
          createdAt: now,
          updatedAt: now,
        };
      }

      function buildEmptyPlaygroundProjectMissionControl() {
        return {
          summary: "",
          document: "",
          instructions: "",
          strategyBrief: buildEmptyPlaygroundProjectStrategyBrief(),
          comments: [],
          lastThreadId: "",
          updatedAt: "",
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
          document: typeof missionControl.document === "string" ? missionControl.document : "",
          instructions: typeof missionControl.instructions === "string" ? missionControl.instructions : "",
          strategyBrief: normalizePlaygroundProjectStrategyBrief(rawStrategyBrief),
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
        return Boolean(
          String(missionControl.summary || "").trim()
          || String(missionControl.document || "").trim()
          || String(missionControl.instructions || "").trim()
          || String(missionControl.lastThreadId || "").trim()
          || String(missionControl.updatedAt || "").trim()
          || normalizePlaygroundTaskCommentList(missionControl.comments).length > 0
          || hasMeaningfulPlaygroundProjectStrategyBrief(strategyBrief)
        );
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

	      function splitPlaygroundProjectRuleEntries(value) {
	        const normalized = normalizePlaygroundProjectRuleEntry(value);
	        if (!normalized) {
	          return [];
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

	      function buildPlaygroundProjectRulesPromptSection(project) {
	        const rules = serializePlaygroundProjectRuleEntries(splitPlaygroundProjectRuleEntries(getPlaygroundProjectRules(project)));
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
	        if (strategyBrief.mission) {
	          sections.push("Goal: " + strategyBrief.mission);
	        }
	        if (strategyBrief.outcomes.length > 0) {
	          sections.push([
	            "Primary outcomes:",
	            ...strategyBrief.outcomes.map((outcome, index) => {
	              const prefix = String(index + 1) + ". " + (outcome.title || "Outcome");
	              const releaseIds = normalizePlaygroundStrategyOutcomeReleaseIds(outcome);
	              const details = [
	                outcome.description,
	                releaseIds.length > 0 ? "Milestones: " + releaseIds.join(", ") : "",
	                outcome.successCriteria.length > 0 ? "Success: " + outcome.successCriteria.join("; ") : "",
	              ].filter(Boolean).join(" ");
	              return "- " + prefix + (details ? " — " + details : "");
	            }),
	          ].join(newline));
	        }
	        const taskOutcome = findPlaygroundStrategyOutcomeForTask(strategyBrief, options?.taskRecord);
	        if (taskOutcome) {
	          sections.push([
	            "This task supports outcome: " + (taskOutcome.title || taskOutcome.id),
	            taskOutcome.description ? "Outcome context: " + taskOutcome.description : "",
	            taskOutcome.successCriteria.length > 0 ? "Outcome success criteria:" + newline + taskOutcome.successCriteria.map((item) => "- " + item).join(newline) : "",
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

${CALENDAR_SCHEDULE_MODEL_FOUNDATION_SCRIPT}
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

      function notionDatabasesToPlaygroundConnectorItems(databases) {
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

        return [workspaceItem].concat(databaseItems);
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
          return normalizedItems[0]?.name || "";
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

        const authorType = comment.authorType === "agent" || comment.authorType === "system" || comment.authorType === "user"
          ? comment.authorType
          : "user";
        const authorAgentId = typeof comment.authorAgentId === "string" && comment.authorAgentId.trim()
          ? comment.authorAgentId.trim()
          : undefined;
        const authorName = typeof comment.authorName === "string" && comment.authorName.trim()
          ? comment.authorName.trim()
          : authorType === "agent"
            ? "Agent"
            : authorType === "system"
              ? "System"
              : "Computer Agents";
        const authorAvatarUrl = typeof comment.authorAvatarUrl === "string" && comment.authorAvatarUrl.trim()
          ? comment.authorAvatarUrl.trim()
          : comment.author && typeof comment.author === "object" && typeof comment.author.avatarUrl === "string" && comment.author.avatarUrl.trim()
            ? comment.author.avatarUrl.trim()
          : undefined;
        const sourceThreadId = typeof comment.sourceThreadId === "string" && comment.sourceThreadId.trim()
          ? comment.sourceThreadId.trim()
          : typeof comment.threadId === "string" && comment.threadId.trim()
            ? comment.threadId.trim()
            : undefined;
        const createdAt = typeof comment.createdAt === "string" && comment.createdAt
          ? comment.createdAt
          : new Date().toISOString();

        return {
          id,
          text,
          authorType,
          authorAgentId,
          authorName,
          authorAvatarUrl,
          sourceThreadId,
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
            next.set(normalizedItem.id, normalizedItem);
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
            : typeof item?.id === "string" && item.id.trim()
              ? item.id.trim()
              : undefined,
          connectorItemPath: typeof item?.connectorItemPath === "string" && item.connectorItemPath.trim()
            ? item.connectorItemPath.trim()
            : typeof item?.path === "string" && item.path.trim()
              ? item.path.trim()
              : undefined,
          connectorRepoFullName: typeof item?.connectorRepoFullName === "string" && item.connectorRepoFullName.trim()
            ? item.connectorRepoFullName.trim()
            : typeof item?.repoFullName === "string" && item.repoFullName.trim()
              ? item.repoFullName.trim()
              : undefined,
          connectorRef: typeof item?.connectorRef === "string" && item.connectorRef.trim()
            ? item.connectorRef.trim()
            : typeof item?.ref === "string" && item.ref.trim()
              ? item.ref.trim()
              : undefined,
        };
      }

      function resolvePlaygroundTaskConnectorSelectedItems(items, selection, selectedIds) {
        const itemsById = buildPlaygroundTaskConnectorItemsIndex(items, selection);
        return normalizePlaygroundIdList(selectedIds)
          .map((id) => itemsById.get(id) || null)
          .filter(Boolean);
      }

      function getPlaygroundTaskConnectorDesiredFileIds(selectedItems) {
        const next = new Set();
        (Array.isArray(selectedItems) ? selectedItems : []).forEach((item) => {
          const normalizedItem = normalizePlaygroundTaskConnectorItem(item);
          if (!normalizedItem || normalizedItem.isFolder) {
            return;
          }
          next.add(normalizedItem.id);
        });
        return next;
      }

      function getPlaygroundTaskConnectorRemovedAttachments(attachments, source, selectedItems) {
        const normalizedSource = getPlaygroundTaskConnectorSource(source);
        if (!normalizedSource) {
          return [];
        }
        const desiredFileIds = getPlaygroundTaskConnectorDesiredFileIds(selectedItems);
        return normalizePlaygroundTaskAttachmentList(attachments).filter((attachment) => {
          if (getPlaygroundTaskAttachmentConnectorSource(attachment) !== normalizedSource) {
            return false;
          }
          const connectorItemId = String(attachment?.connectorItemId || "").trim();
          return Boolean(connectorItemId) && !desiredFileIds.has(connectorItemId);
        });
      }

      function reconcilePlaygroundTaskConnectorAttachments(currentAttachments, source, selectedItems, uploadedAttachments = []) {
        const normalizedSource = getPlaygroundTaskConnectorSource(source);
        if (!normalizedSource) {
          return normalizePlaygroundTaskAttachmentList(currentAttachments);
        }

        const desiredFileIds = getPlaygroundTaskConnectorDesiredFileIds(selectedItems);
        const nextAttachments = [];
        const seenConnectorItemIds = new Set();
        const normalizedUploadedAttachments = normalizePlaygroundTaskAttachmentList(uploadedAttachments);
        const uploadedAttachmentsByConnectorId = new Map();

        normalizedUploadedAttachments.forEach((attachment) => {
          const connectorItemId = String(attachment?.connectorItemId || "").trim();
          if (!connectorItemId || getPlaygroundTaskAttachmentConnectorSource(attachment) !== normalizedSource) {
            return;
          }
          uploadedAttachmentsByConnectorId.set(connectorItemId, attachment);
        });

        normalizePlaygroundTaskAttachmentList(currentAttachments).forEach((attachment) => {
          const connectorSource = getPlaygroundTaskAttachmentConnectorSource(attachment);
          const connectorItemId = String(attachment?.connectorItemId || "").trim();

          if (connectorSource !== normalizedSource || !connectorItemId) {
            nextAttachments.push(attachment);
            return;
          }

          if (!desiredFileIds.has(connectorItemId) || seenConnectorItemIds.has(connectorItemId)) {
            return;
          }

          nextAttachments.push(uploadedAttachmentsByConnectorId.get(connectorItemId) || attachment);
          seenConnectorItemIds.add(connectorItemId);
          uploadedAttachmentsByConnectorId.delete(connectorItemId);
        });

        uploadedAttachmentsByConnectorId.forEach((attachment, connectorItemId) => {
          if (seenConnectorItemIds.has(connectorItemId) || !desiredFileIds.has(connectorItemId)) {
            return;
          }
          nextAttachments.push(attachment);
          seenConnectorItemIds.add(connectorItemId);
        });

        return normalizePlaygroundTaskAttachmentList(nextAttachments);
      }

      function removePlaygroundAttachmentFromConnectorSelections(connectors, attachment) {
        const connectorSource = getPlaygroundTaskConnectorSource(attachment?.connectorSource || attachment?.integrationSource);
        const connectorKey = getPlaygroundTaskConnectorKey(connectorSource);
        const connectorItemId = typeof attachment?.connectorItemId === "string" && attachment.connectorItemId.trim()
          ? attachment.connectorItemId.trim()
          : "";
        const nextConnectors = normalizePlaygroundTaskConnectorSelections(connectors);

        if (!connectorKey || !connectorItemId || !nextConnectors[connectorKey]) {
          return nextConnectors;
        }

        const currentSelection = nextConnectors[connectorKey];
        const remainingItems = (currentSelection?.items || []).filter((item) => item?.id !== connectorItemId);
        const remainingSelectedIds = (currentSelection?.selectedIds || []).filter((id) => id !== connectorItemId);
        nextConnectors[connectorKey] = remainingItems.length > 0
          ? buildPlaygroundTaskConnectorSelection(connectorSource, remainingItems, remainingSelectedIds)
          : null;
        return nextConnectors;
      }

      function normalizePlaygroundTaskTicketNumber(value) {
        const normalized = String(value || "").trim();
        if (!normalized) return "";
        const digits = Array.from(normalized).filter((character) => character >= "0" && character <= "9").join("");
        const parsed = Number.parseInt(digits || normalized, 10);
        if (!Number.isFinite(parsed) || parsed <= 0) {
          return "";
        }
        return String(parsed).padStart(3, "0");
      }

      function getPlaygroundProjectTicketPrefix(projectRecord) {
        const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
          ? projectRecord.metadata
          : {};
        const source = String(
          projectRecord?.name
            || projectRecord?.title
            || metadata.name
            || metadata.title
            || projectRecord?.slug
            || projectRecord?.id
            || ""
        ).trim();
        const asciiSource = source.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
        const letterPrefix = asciiSource.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 3);
        const fallbackPrefix = asciiSource.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 3);
        return (letterPrefix || fallbackPrefix || "PRJ").padEnd(3, "X");
      }

      function formatPlaygroundProjectTicketNumber(projectRecord, value) {
        const ticketNumber = normalizePlaygroundTaskTicketNumber(value);
        if (!ticketNumber) {
          return "";
        }
        return getPlaygroundProjectTicketPrefix(projectRecord) + "-" + ticketNumber;
      }

      function normalizePlaygroundTaskType(value) {
        const normalized = String(value || "").trim().toLowerCase();
        if (normalized === "subtask") {
          return "subtask";
        }
        if (normalized === "loop" || normalized === "loop_task" || normalized === "metronome_loop") {
          return "loop";
        }
        return "task";
      }

      function normalizePlaygroundParentTaskId(value) {
        const normalized = String(value || "").trim();
        return normalized || null;
      }

      function getPlaygroundTaskTypeLabel(value) {
        const taskType = normalizePlaygroundTaskType(value);
        if (taskType === "subtask") return "Subtask";
        if (taskType === "loop") return "Loop";
        return "Task";
      }

      function getPlaygroundTaskParentTaskId(task) {
        return normalizePlaygroundParentTaskId(task?.parentTaskId);
      }

      function isPlaygroundSubtaskRecord(task) {
        return normalizePlaygroundTaskType(task?.taskType || task?.type) === "subtask"
          && Boolean(getPlaygroundTaskParentTaskId(task));
      }

      function normalizePlaygroundEditableTaskTitle(value, fallback = "New Task") {
        const normalized = String(value || "")
          .replaceAll(String.fromCharCode(13), " ")
          .replaceAll(String.fromCharCode(10), " ")
          .replaceAll(String.fromCharCode(9), " ")
          .split(" ")
          .filter(Boolean)
          .join(" ")
          .trim();
        return normalized || fallback;
      }

      function parsePlaygroundTaskTicketNumber(value) {
        const normalized = normalizePlaygroundTaskTicketNumber(value);
        return normalized ? Number.parseInt(normalized, 10) : 0;
      }

      function getPlaygroundTaskRunnerMetadata(task) {
        const metadata = task?.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata)
          ? task.metadata
          : null;
        return metadata?.runnerPlayground && typeof metadata.runnerPlayground === "object" && !Array.isArray(metadata.runnerPlayground)
          ? metadata.runnerPlayground
          : null;
      }

      function buildPlaygroundTaskMetadata(task, overrides = {}) {
        const currentMetadata = task?.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata)
          ? { ...task.metadata }
          : {};
        const currentRunnerPlayground = currentMetadata.runnerPlayground && typeof currentMetadata.runnerPlayground === "object" && !Array.isArray(currentMetadata.runnerPlayground)
          ? { ...currentMetadata.runnerPlayground }
          : {};
        const nextRunnerPlayground = {
          ...currentRunnerPlayground,
        };

        if (Object.prototype.hasOwnProperty.call(overrides, "ticketNumber")) {
          const nextTicketNumber = normalizePlaygroundTaskTicketNumber(overrides.ticketNumber);
          if (nextTicketNumber) {
            nextRunnerPlayground.ticketNumber = nextTicketNumber;
          } else {
            delete nextRunnerPlayground.ticketNumber;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "taskType")) {
          const nextTaskType = normalizePlaygroundTaskType(overrides.taskType);
          if (nextTaskType === "subtask") {
            nextRunnerPlayground.taskType = "subtask";
          } else {
            delete nextRunnerPlayground.taskType;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "parentTaskId")) {
          const nextParentTaskId = normalizePlaygroundParentTaskId(overrides.parentTaskId);
          if (nextParentTaskId) {
            nextRunnerPlayground.parentTaskId = nextParentTaskId;
          } else {
            delete nextRunnerPlayground.parentTaskId;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "environmentId")) {
          const nextEnvironmentId = typeof overrides.environmentId === "string" && overrides.environmentId.trim()
            ? overrides.environmentId.trim()
            : "";
          if (nextEnvironmentId) {
            nextRunnerPlayground.environmentId = nextEnvironmentId;
          } else {
            delete nextRunnerPlayground.environmentId;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "taskColor")) {
          const nextTaskColor = getPlaygroundTaskColorId(overrides.taskColor);
          if (nextTaskColor) {
            nextRunnerPlayground.taskColor = nextTaskColor;
          } else {
            delete nextRunnerPlayground.taskColor;
          }
        }

	        if (Object.prototype.hasOwnProperty.call(overrides, "assigneeAgentId")) {
	          const nextAssigneeAgentId = typeof overrides.assigneeAgentId === "string" && overrides.assigneeAgentId.trim()
	            ? overrides.assigneeAgentId.trim()
	            : "";
	          if (isPlaygroundHumanAssigneeId(nextAssigneeAgentId)) {
	            nextRunnerPlayground.assigneeActorId = nextAssigneeAgentId;
	            nextRunnerPlayground.assigneeActorKind = "human";
	            nextRunnerPlayground.assigneeName = "Me";
	          } else {
	            delete nextRunnerPlayground.assigneeActorId;
	            delete nextRunnerPlayground.assigneeActorKind;
	            delete nextRunnerPlayground.assigneeName;
	          }
	        }

	        if (Object.prototype.hasOwnProperty.call(overrides, "reviewRequired")) {
	          if (overrides.reviewRequired === true) {
	            nextRunnerPlayground.reviewRequired = true;
	          } else {
	            delete nextRunnerPlayground.reviewRequired;
	            delete nextRunnerPlayground.reviewerActorId;
	            delete nextRunnerPlayground.reviewerActorKind;
	            delete nextRunnerPlayground.reviewerName;
	          }
	        }

	        if (Object.prototype.hasOwnProperty.call(overrides, "reviewerAgentId")) {
	          const nextReviewerAgentId = typeof overrides.reviewerAgentId === "string" && overrides.reviewerAgentId.trim()
	            ? overrides.reviewerAgentId.trim()
	            : "";
	          if (nextReviewerAgentId) {
	            nextRunnerPlayground.reviewRequired = true;
	            nextRunnerPlayground.reviewerActorId = nextReviewerAgentId;
	            nextRunnerPlayground.reviewerActorKind = isPlaygroundHumanAssigneeId(nextReviewerAgentId) ? "human" : "agent";
	            nextRunnerPlayground.reviewerName = isPlaygroundHumanAssigneeId(nextReviewerAgentId) ? "Me" : "";
	            if (!nextRunnerPlayground.reviewerName) {
              delete nextRunnerPlayground.reviewerName;
	            }
	          } else if (overrides.reviewRequired !== true) {
	            delete nextRunnerPlayground.reviewRequired;
	            delete nextRunnerPlayground.reviewerActorId;
	            delete nextRunnerPlayground.reviewerActorKind;
	            delete nextRunnerPlayground.reviewerName;
	          }
	        }

        if (Object.keys(nextRunnerPlayground).length > 0) {
          currentMetadata.runnerPlayground = nextRunnerPlayground;
        } else {
          delete currentMetadata.runnerPlayground;
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "enabledSkills")) {
          const nextEnabledSkills = normalizePlaygroundEnabledSkillIds(overrides.enabledSkills);
          if (nextEnabledSkills.length > 0) {
            nextRunnerPlayground.enabledSkills = nextEnabledSkills;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.enabledSkills;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "attachments")) {
          const nextAttachments = normalizePlaygroundTaskAttachmentList(overrides.attachments);
          if (nextAttachments.length > 0) {
            nextRunnerPlayground.attachments = nextAttachments;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.attachments;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "connectors")) {
          const nextConnectors = normalizePlaygroundTaskConnectorSelections(overrides.connectors);
          if (hasPlaygroundTaskConnectorSelections(nextConnectors)) {
            nextRunnerPlayground.connectors = nextConnectors;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.connectors;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "comments")) {
          const nextComments = normalizePlaygroundTaskCommentList(overrides.comments);
          if (nextComments.length > 0) {
            nextRunnerPlayground.comments = nextComments;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.comments;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "scheduleType")) {
          const nextScheduleType = overrides.scheduleType === "recurring" ? "recurring" : "one-time";
          if (nextScheduleType === "recurring") {
            nextRunnerPlayground.scheduleType = "recurring";
          } else {
            delete nextRunnerPlayground.scheduleType;
          }
          if (Object.keys(nextRunnerPlayground).length > 0) {
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete currentMetadata.runnerPlayground;
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "cronExpression")) {
          const nextCronExpression = typeof overrides.cronExpression === "string" && overrides.cronExpression.trim()
            ? overrides.cronExpression.trim()
            : "";
          if (nextCronExpression) {
            nextRunnerPlayground.cronExpression = nextCronExpression;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.cronExpression;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "scheduleTimezone")) {
          const nextScheduleTimezone = typeof overrides.scheduleTimezone === "string" && overrides.scheduleTimezone.trim()
            ? overrides.scheduleTimezone.trim()
            : "";
          if (nextScheduleTimezone) {
            nextRunnerPlayground.scheduleTimezone = nextScheduleTimezone;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.scheduleTimezone;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (Object.prototype.hasOwnProperty.call(overrides, "scheduleEnabled")) {
          if (overrides.scheduleEnabled === false) {
            nextRunnerPlayground.scheduleEnabled = false;
            currentMetadata.runnerPlayground = nextRunnerPlayground;
          } else {
            delete nextRunnerPlayground.scheduleEnabled;
            if (Object.keys(nextRunnerPlayground).length > 0) {
              currentMetadata.runnerPlayground = nextRunnerPlayground;
            } else {
              delete currentMetadata.runnerPlayground;
            }
          }
        }

        if (nextRunnerPlayground.taskType !== "subtask") {
          delete nextRunnerPlayground.parentTaskId;
        }

        return Object.keys(currentMetadata).length > 0 ? currentMetadata : null;
      }

      function syncPlaygroundTaskRecordMetadata(task) {
        if (!task || typeof task !== "object") {
          return task;
        }

        return {
          ...task,
          metadata: buildPlaygroundTaskMetadata(task, {
            ticketNumber: task.ticketNumber,
	            taskType: task.taskType,
	            parentTaskId: task.parentTaskId,
	            assigneeAgentId: task.assigneeAgentId,
	            reviewRequired: task.reviewRequired,
	            reviewerAgentId: task.reviewerAgentId,
	            environmentId: task.environmentId,
            taskColor: task.taskColor,
            scheduleType: task.scheduleType,
            cronExpression: task.cronExpression,
            scheduleTimezone: task.scheduleTimezone,
            scheduleEnabled: task.scheduleEnabled,
            enabledSkills: task.enabledSkills,
            attachments: task.attachments,
            connectors: task.connectors,
          }),
        };
      }

      function comparePlaygroundTaskTicketOrder(left, right) {
        const leftCreatedAt = Date.parse(left?.createdAt || "") || 0;
        const rightCreatedAt = Date.parse(right?.createdAt || "") || 0;
        if (leftCreatedAt !== rightCreatedAt) {
          return leftCreatedAt - rightCreatedAt;
        }
        const leftSortOrder = Number.isFinite(left?.sortOrder) ? Number(left.sortOrder) : 0;
        const rightSortOrder = Number.isFinite(right?.sortOrder) ? Number(right.sortOrder) : 0;
        if (leftSortOrder !== rightSortOrder) {
          return leftSortOrder - rightSortOrder;
        }
        return String(left?.id || "").localeCompare(String(right?.id || ""));
      }

      function buildPlaygroundTaskTicketNumberMap(tasks, projectRecord = null) {
        const orderedTasks = (Array.isArray(tasks) ? tasks : [])
          .filter((task) => task?.id)
          .slice()
          .sort(comparePlaygroundTaskTicketOrder);
        const next = {};
        let explicitCount = 0;
        let highestTicketNumber = 0;

        orderedTasks.forEach((task) => {
          const ticketNumber = normalizePlaygroundTaskTicketNumber(task?.ticketNumber);
          if (!ticketNumber) return;
          next[task.id] = ticketNumber;
          explicitCount += 1;
          highestTicketNumber = Math.max(highestTicketNumber, parsePlaygroundTaskTicketNumber(ticketNumber));
        });

        let nextTicketNumber = explicitCount === 0 ? 0 : highestTicketNumber;
        orderedTasks.forEach((task) => {
          if (next[task.id]) return;
          nextTicketNumber += 1;
          next[task.id] = String(nextTicketNumber).padStart(3, "0");
        });

        if (projectRecord) {
          Object.keys(next).forEach((taskId) => {
            next[taskId] = formatPlaygroundProjectTicketNumber(projectRecord, next[taskId]) || next[taskId];
          });
        }

        return next;
      }

      function normalizePlaygroundTaskRecord(task) {
        if (!task || typeof task !== "object") {
          return buildPlaygroundDefaultTaskDraft();
        }

        const draft = buildPlaygroundDefaultTaskDraft();
        const runnerPlaygroundMetadata = getPlaygroundTaskRunnerMetadata(task);
        const normalizedLinkedThreadIds = normalizePlaygroundIdList(task.linkedThreadIds || task.linked_thread_ids);
        const normalizedLastStartedThreadId =
          typeof task.lastStartedThreadId === "string" && task.lastStartedThreadId.trim()
            ? task.lastStartedThreadId.trim()
            : typeof task.last_started_thread_id === "string" && task.last_started_thread_id.trim()
              ? task.last_started_thread_id.trim()
              : null;
        const directAssigneeAgentId = typeof task.assigneeAgentId === "string" && task.assigneeAgentId.trim()
          ? task.assigneeAgentId.trim()
          : null;
        const metadataAssigneeActorId = typeof runnerPlaygroundMetadata?.assigneeActorId === "string" && runnerPlaygroundMetadata.assigneeActorId.trim()
          ? runnerPlaygroundMetadata.assigneeActorId.trim()
          : null;
	        const normalizedAssigneeAgentId = directAssigneeAgentId
	          || (isPlaygroundHumanAssigneeId(metadataAssigneeActorId) ? metadataAssigneeActorId : null);
        const directReviewerAgentId = typeof task.reviewerAgentId === "string" && task.reviewerAgentId.trim()
          ? task.reviewerAgentId.trim()
          : typeof task.reviewer_agent_id === "string" && task.reviewer_agent_id.trim()
            ? task.reviewer_agent_id.trim()
          : typeof task.reviewerActorId === "string" && task.reviewerActorId.trim()
            ? task.reviewerActorId.trim()
            : typeof task.reviewer_actor_id === "string" && task.reviewer_actor_id.trim()
              ? task.reviewer_actor_id.trim()
            : task.review?.reviewerActorId && typeof task.review.reviewerActorId === "string" && task.review.reviewerActorId.trim()
              ? task.review.reviewerActorId.trim()
              : null;
	        const metadataReviewerActorId = typeof runnerPlaygroundMetadata?.reviewerActorId === "string" && runnerPlaygroundMetadata.reviewerActorId.trim()
	          ? runnerPlaygroundMetadata.reviewerActorId.trim()
	          : null;
	        const normalizedReviewerAgentId = directReviewerAgentId || metadataReviewerActorId;
        const reviewRequired = task.reviewRequired === true
          || task.review_required === true
          || task.review?.reviewRequired === true
          || task.review?.review_required === true
          || runnerPlaygroundMetadata?.reviewRequired === true
          || Boolean(normalizedReviewerAgentId);
	        const normalizedDependencyIds = normalizePlaygroundIdList(
          Array.isArray(task.dependencyIds)
            ? task.dependencyIds
            : (Array.isArray(runnerPlaygroundMetadata?.dependencyIds) ? runnerPlaygroundMetadata.dependencyIds : [])
        );
        const rawStatus = task.status === "backlog"
          ? "todo"
          : (PLAYGROUND_TASK_STATUS_OPTIONS.some((option) => option.id === task.status) ? task.status : draft.status);
        const baseStatus = rawStatus === "in_progress"
          && !isPlaygroundHumanAssigneeId(normalizedAssigneeAgentId)
          && !normalizedLastStartedThreadId
          && normalizedLinkedThreadIds.length === 0
          ? "todo"
          : rawStatus;
        const status = normalizedDependencyIds.length > 0 && baseStatus !== "done"
          ? "blocked"
          : baseStatus;
        const priority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === task.priority) ? task.priority : draft.priority;
        const createdAt = typeof task.createdAt === "string" && task.createdAt ? task.createdAt : draft.createdAt;
        const updatedAt = typeof task.updatedAt === "string" && task.updatedAt ? task.updatedAt : createdAt;
        const ticketNumber = normalizePlaygroundTaskTicketNumber(task.ticketNumber || runnerPlaygroundMetadata?.ticketNumber);
        const normalizedParentTaskId = normalizePlaygroundParentTaskId(task.parentTaskId || runnerPlaygroundMetadata?.parentTaskId);
        const taskType = normalizePlaygroundTaskType(
          task.taskType
          || (["task", "subtask", "loop"].includes(String(task.type || "").trim().toLowerCase()) ? task.type : "")
          || runnerPlaygroundMetadata?.taskType
        );
        const parentTaskId = taskType === "subtask" && normalizedParentTaskId
          ? normalizedParentTaskId
          : null;
        const environmentId = typeof task.environmentId === "string" && task.environmentId.trim()
          ? task.environmentId.trim()
          : typeof runnerPlaygroundMetadata?.environmentId === "string" && runnerPlaygroundMetadata.environmentId.trim()
            ? runnerPlaygroundMetadata.environmentId.trim()
            : null;
        const rawTaskScheduleType = typeof task.scheduleType === "string" && task.scheduleType.trim()
          ? task.scheduleType.trim().toLowerCase()
          : typeof runnerPlaygroundMetadata?.scheduleType === "string" && runnerPlaygroundMetadata.scheduleType.trim()
            ? runnerPlaygroundMetadata.scheduleType.trim().toLowerCase()
            : "";
        const taskCronExpression = typeof task.cronExpression === "string" && task.cronExpression.trim()
          ? task.cronExpression.trim()
          : typeof runnerPlaygroundMetadata?.cronExpression === "string" && runnerPlaygroundMetadata.cronExpression.trim()
            ? runnerPlaygroundMetadata.cronExpression.trim()
            : null;
        const taskScheduleType = rawTaskScheduleType === "recurring" || taskCronExpression
          ? "recurring"
          : "one-time";
        const taskScheduleTimezone = typeof task.scheduleTimezone === "string" && task.scheduleTimezone.trim()
          ? task.scheduleTimezone.trim()
          : typeof runnerPlaygroundMetadata?.scheduleTimezone === "string" && runnerPlaygroundMetadata.scheduleTimezone.trim()
            ? runnerPlaygroundMetadata.scheduleTimezone.trim()
            : draft.scheduleTimezone;
        const taskScheduleEnabled = task.scheduleEnabled === false
          ? false
          : runnerPlaygroundMetadata?.scheduleEnabled === false
            ? false
            : true;
        const taskColor = getPlaygroundTaskColorId(task.taskColor || runnerPlaygroundMetadata?.taskColor);
        const directEnabledSkills = normalizePlaygroundEnabledSkillIds(task.enabledSkills);
        const metadataEnabledSkills = normalizePlaygroundEnabledSkillIds(runnerPlaygroundMetadata?.enabledSkills);
        const enabledSkills = directEnabledSkills.length > 0
          ? directEnabledSkills
          : metadataEnabledSkills;
        const directAttachments = normalizePlaygroundTaskAttachmentList(task.attachments);
        const metadataAttachments = normalizePlaygroundTaskAttachmentList(runnerPlaygroundMetadata?.attachments);
        const attachments = directAttachments.length > 0
          ? directAttachments
          : metadataAttachments;
        const directConnectors = normalizePlaygroundTaskConnectorSelections(task.connectors);
        const metadataConnectors = normalizePlaygroundTaskConnectorSelections(runnerPlaygroundMetadata?.connectors);
        const connectors = hasPlaygroundTaskConnectorSelections(directConnectors)
          ? directConnectors
          : metadataConnectors;
        const directComments = normalizePlaygroundTaskCommentList(task.comments);
        const metadataComments = normalizePlaygroundTaskCommentList(runnerPlaygroundMetadata?.comments);
        const comments = directComments.length > 0
          ? directComments
          : metadataComments;

        return {
          ...draft,
          ...task,
          id: typeof task.id === "string" ? task.id : draft.id,
          projectId: typeof task.projectId === "string" && task.projectId.trim() ? task.projectId.trim() : null,
          releaseId: typeof task.releaseId === "string" && task.releaseId.trim() ? task.releaseId.trim() : null,
          ticketNumber,
          taskType: parentTaskId ? taskType : "task",
          parentTaskId,
          title: typeof task.title === "string" && task.title.trim() ? task.title.trim() : draft.title,
          description: typeof task.description === "string" ? task.description : draft.description,
          taskColor,
          status,
          priority,
	          sprintId: typeof task.sprintId === "string" && task.sprintId.trim() ? task.sprintId.trim() : null,
	          assigneeAgentId: normalizedAssigneeAgentId,
	          reviewRequired,
	          reviewerAgentId: reviewRequired ? normalizedReviewerAgentId : null,
	          environmentId,
          attachments,
          enabledSkills,
          connectors,
          comments,
          dependencyIds: normalizedDependencyIds,
          linkedThreadIds: normalizedLinkedThreadIds,
          lastStartedThreadId: normalizedLastStartedThreadId,
          scheduledStartAt: typeof task.scheduledStartAt === "string" && task.scheduledStartAt ? task.scheduledStartAt : null,
          scheduledEndAt: typeof task.scheduledEndAt === "string" && task.scheduledEndAt ? task.scheduledEndAt : null,
          scheduleType: taskScheduleType,
          cronExpression: taskCronExpression,
          scheduleTimezone: taskScheduleTimezone,
          scheduleEnabled: taskScheduleEnabled,
          dueAt: typeof task.dueAt === "string" && task.dueAt ? task.dueAt : null,
          completedAt: typeof task.completedAt === "string" && task.completedAt ? task.completedAt : (status === "done" ? updatedAt : null),
          sortOrder: Number.isFinite(task.sortOrder) ? Number(task.sortOrder) : draft.sortOrder,
          metadata: task.metadata && typeof task.metadata === "object" && !Array.isArray(task.metadata) ? task.metadata : null,
          createdAt,
          updatedAt,
        };
      }

      function normalizePlaygroundTaskSprintRecord(sprint) {
        if (!sprint || typeof sprint !== "object") {
          return buildPlaygroundDefaultSprintDraft();
        }

        const draft = buildPlaygroundDefaultSprintDraft();
        const status = ["planned", "active", "completed"].includes(sprint.status) ? sprint.status : draft.status;
        const createdAt = typeof sprint.createdAt === "string" && sprint.createdAt ? sprint.createdAt : draft.createdAt;
        const updatedAt = typeof sprint.updatedAt === "string" && sprint.updatedAt ? sprint.updatedAt : createdAt;

        return {
          ...draft,
          ...sprint,
          id: typeof sprint.id === "string" ? sprint.id : draft.id,
          projectId: typeof sprint.projectId === "string" && sprint.projectId.trim() ? sprint.projectId.trim() : null,
          name: typeof sprint.name === "string" ? sprint.name : draft.name,
          goal: typeof sprint.goal === "string" ? sprint.goal : draft.goal,
          status,
          startAt: typeof sprint.startAt === "string" && sprint.startAt ? sprint.startAt : null,
          endAt: typeof sprint.endAt === "string" && sprint.endAt ? sprint.endAt : null,
          sortOrder: Number.isFinite(sprint.sortOrder) ? Number(sprint.sortOrder) : draft.sortOrder,
          metadata: sprint.metadata && typeof sprint.metadata === "object" && !Array.isArray(sprint.metadata) ? sprint.metadata : null,
          createdAt,
          updatedAt,
        };
      }

      function getPlaygroundTaskReleaseStatus(release) {
        if (!release || typeof release !== "object") {
          return "planned";
        }

        if (typeof release.status === "string" && release.status.trim()) {
          return release.status.trim();
        }

        const nowMs = Date.now();
        const startAtMs = release.startAt ? Date.parse(release.startAt) : null;
        const endAtMs = release.endAt ? Date.parse(release.endAt) : null;

        if (Number.isFinite(endAtMs) && endAtMs < nowMs) {
          return "completed";
        }
        if (Number.isFinite(startAtMs) && startAtMs > nowMs) {
          return "planned";
        }
        return "active";
      }

      function formatPlaygroundTaskReleaseDateRange(release) {
        const startDate = release?.startAt ? new Date(release.startAt) : null;
        const endDate = release?.endAt ? new Date(release.endAt) : null;
        const startLabel = startDate && !Number.isNaN(startDate.getTime()) ? format(startDate, "MMM d, yyyy") : "";
        const endLabel = endDate && !Number.isNaN(endDate.getTime()) ? format(endDate, "MMM d, yyyy") : "";
        if (startLabel && endLabel) {
          const startMs = startDate ? startDate.getTime() : NaN;
          const endMs = endDate ? endDate.getTime() : NaN;
          const orderedLabels = Number.isFinite(startMs) && Number.isFinite(endMs) && startMs > endMs
            ? [endLabel, startLabel]
            : [startLabel, endLabel];
          if (orderedLabels[0] === orderedLabels[1]) {
            return orderedLabels[0];
          }
          return orderedLabels[0] + " - " + orderedLabels[1];
        }
        if (startLabel) {
          return "Starts " + startLabel;
        }
        if (endLabel) {
          return "Ends " + endLabel;
        }
        return "No dates";
      }

      function getPlaygroundTaskReleaseDeadlineLabel(release) {
        if (!release) {
          return "No deadlines";
        }
        const dateRangeLabel = formatPlaygroundTaskReleaseDateRange(release);
        return dateRangeLabel === "No dates" ? "No deadlines" : dateRangeLabel;
      }

      function normalizePlaygroundTaskReleaseRecord(release) {
        if (!release || typeof release !== "object") {
          return buildPlaygroundDefaultReleaseDraft();
        }

        const draft = buildPlaygroundDefaultReleaseDraft();
        const createdAt = typeof release.createdAt === "string" && release.createdAt ? release.createdAt : draft.createdAt;
        const updatedAt = typeof release.updatedAt === "string" && release.updatedAt ? release.updatedAt : createdAt;

        return {
          ...draft,
          ...release,
          id: typeof release.id === "string" ? release.id : draft.id,
          projectId: typeof release.projectId === "string" && release.projectId.trim() ? release.projectId.trim() : null,
          name: typeof release.name === "string" ? release.name : draft.name,
          description: typeof release.description === "string" ? release.description : draft.description,
          startAt: typeof release.startAt === "string" && release.startAt ? release.startAt : null,
          endAt: typeof release.endAt === "string" && release.endAt ? release.endAt : null,
          sortOrder: Number.isFinite(release.sortOrder) ? Number(release.sortOrder) : draft.sortOrder,
          metadata: release.metadata && typeof release.metadata === "object" && !Array.isArray(release.metadata) ? release.metadata : null,
          taskCount: Number.isFinite(release.taskCount) ? Number(release.taskCount) : 0,
          openTaskCount: Number.isFinite(release.openTaskCount) ? Number(release.openTaskCount) : 0,
          taskIds: normalizePlaygroundIdList(release.taskIds),
          status: getPlaygroundTaskReleaseStatus(release),
          createdAt,
          updatedAt,
        };
      }

      function normalizePlaygroundProjectRecord(project) {
        if (!project || typeof project !== "object") {
          return buildPlaygroundDefaultProjectDraft();
        }

        const draft = buildPlaygroundDefaultProjectDraft();
        const createdAt = typeof project.createdAt === "string" && project.createdAt ? project.createdAt : draft.createdAt;
        const updatedAt = typeof project.updatedAt === "string" && project.updatedAt ? project.updatedAt : createdAt;
        const summary = project.summary && typeof project.summary === "object" && !Array.isArray(project.summary)
          ? project.summary
          : {};
        const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : null;
        const projectBlueprint = getPlaygroundProjectBlueprint(
          project.projectType
          || project.type
          || metadata?.projectType
          || metadata?.type
          || metadata?.blueprintId
        );
        const icon = getPlaygroundProjectIconId(project.icon || metadata?.icon || projectBlueprint.iconId);
        const wallpaperId = getPlaygroundProjectWallpaperId(project.wallpaperId || metadata?.wallpaperId || projectBlueprint.wallpaperId, "");
        const useCardBackgroundAsWallpaper = getPlaygroundProjectUseCardBackgroundAsWallpaper(
          project.useCardBackgroundAsWallpaper,
          metadata?.useCardBackgroundAsWallpaper
        );
        const directAttachments = normalizePlaygroundTaskAttachmentList(project.attachments);
        const metadataAttachments = normalizePlaygroundTaskAttachmentList(metadata?.attachments);
        const attachments = directAttachments.length > 0
          ? directAttachments
          : metadataAttachments;
        const directConnectors = normalizePlaygroundTaskConnectorSelections(project.connectors);
        const metadataConnectors = normalizePlaygroundTaskConnectorSelections(metadata?.connectors);
        const connectors = hasPlaygroundTaskConnectorSelections(directConnectors)
          ? directConnectors
          : metadataConnectors;
        const missionControl = getPlaygroundProjectMissionControlRecord(project);
        const directProjectName = typeof project.name === "string" ? project.name.trim() : "";
        const metadataProjectName = typeof metadata?.name === "string" ? metadata.name.trim() : "";
        const isPlaceholderProjectName = (value) => {
          const normalized = String(value || "").trim().replace(/\\s+/g, " ").toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project";
        };
        const resolvedProjectName = directProjectName && (!isPlaceholderProjectName(directProjectName) || !metadataProjectName || isPlaceholderProjectName(metadataProjectName))
          ? project.name
          : (metadataProjectName || (typeof project.name === "string" ? project.name : draft.name));
        const metadataDescription = typeof metadata?.description === "string" ? metadata.description : "";
	        const resolvedProjectDescription = typeof project.description === "string" && (project.description.trim() || !metadataDescription)
	          ? project.description
	          : (metadataDescription || (typeof project.description === "string" ? project.description : draft.description));
        const projectRules = getPlaygroundProjectRules(project);
        const normalizedProjectPriority = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === String(project.priority || metadata?.priority || "").trim().toLowerCase())
          ? String(project.priority || metadata?.priority || "").trim().toLowerCase()
          : "medium";
        const metadataLead = metadata?.lead && typeof metadata.lead === "object" && !Array.isArray(metadata.lead)
          ? metadata.lead
          : {};
        const leadUserId = String(project.leadUserId || metadata?.leadUserId || metadataLead.userId || metadataLead.id || "").trim();
	        const leadName = String(project.leadName || metadata?.leadName || metadataLead.name || "").trim();
	        const leadEmail = String(project.leadEmail || metadata?.leadEmail || metadataLead.email || "").trim();
	        const leadAvatarUrl = String(project.leadAvatarUrl || metadata?.leadAvatarUrl || metadataLead.avatarUrl || metadataLead.photoUrl || "").trim();
	        const projectPermissionSet = normalizePlaygroundPermissionSet(project.permissionSet || metadata?.permissionSet, "project");

		        return {
		          ...draft,
	          ...project,
          id: typeof project.id === "string" ? project.id : draft.id,
          name: resolvedProjectName,
          description: resolvedProjectDescription,
          projectType: projectBlueprint.id,
          type: projectBlueprint.id,
          icon,
          wallpaperId,
          useCardBackgroundAsWallpaper,
          color: typeof project.color === "string" && project.color.trim()
            ? project.color.trim()
            : (typeof metadata?.color === "string" && metadata.color.trim() ? metadata.color.trim() : projectBlueprint.color),
          priority: normalizedProjectPriority,
          defaultEnvironmentId: typeof project.defaultEnvironmentId === "string" && project.defaultEnvironmentId.trim()
            ? project.defaultEnvironmentId.trim()
            : typeof metadata?.defaultEnvironmentId === "string" && metadata.defaultEnvironmentId.trim()
              ? metadata.defaultEnvironmentId.trim()
            : null,
	          attachments,
	          connectors,
	          projectRules,
	          missionControl,
          leadUserId,
	          leadName,
	          leadEmail,
	          leadAvatarUrl,
	          permissionSet: projectPermissionSet,
		          metadata: {
		            ...(metadata && typeof metadata === "object" ? metadata : {}),
		            ...buildPlaygroundProjectBlueprintMetadata(projectBlueprint),
            priority: normalizedProjectPriority,
            leadUserId,
            leadName,
            leadEmail,
            leadAvatarUrl,
            lead: {
              userId: leadUserId,
	              name: leadName,
	              email: leadEmail,
	              avatarUrl: leadAvatarUrl,
	            },
	            permissionSet: projectPermissionSet,
		          },
          summary: {
            ...buildEmptyPlaygroundProjectSummary(),
            environmentsCount: Number(summary.environmentsCount) || 0,
            threadsCount: Number(summary.threadsCount) || 0,
            activeThreadsCount: Number(summary.activeThreadsCount) || 0,
            tasksCount: Number(summary.tasksCount) || 0,
            openTasksCount: Number(summary.openTasksCount) || 0,
            releaseCount: Number(summary.releaseCount) || 0,
            activeReleaseCount: Number(summary.activeReleaseCount) || 0,
            sprintCount: Number(summary.sprintCount) || 0,
            activeSprintCount: Number(summary.activeSprintCount) || 0,
          },
          createdAt,
          updatedAt,
        };
      }

${CALENDAR_SCHEDULE_MODEL_RUNTIME_SCRIPT}
      function parsePlaygroundTaskListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.tasks)
            ? data.tasks
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundTaskRecord);
      }

      function getPlaygroundTaskResponseRecord(data) {
        const source = data?.task || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskRecord({
              ...source,
              comments: Array.isArray(data?.comments)
                ? data.comments
                : source.comments,
            })
          : null;
      }

      function getPlaygroundTaskCommentResponseRecord(data) {
        const source = data?.comment || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskCommentRecord(source)
          : null;
      }

      function parsePlaygroundTaskSprintListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.sprints)
            ? data.sprints
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundTaskSprintRecord);
      }

      function getPlaygroundTaskSprintResponseRecord(data) {
        const source = data?.sprint || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskSprintRecord(source)
          : null;
      }

      function parsePlaygroundTaskReleaseListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.releases)
            ? data.releases
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items.map(normalizePlaygroundTaskReleaseRecord);
      }

      function getPlaygroundTaskReleaseResponseRecord(data) {
        const source = data?.release || data?.data || data;
        return source && typeof source === "object" && typeof source.id === "string"
          ? normalizePlaygroundTaskReleaseRecord(source)
          : null;
      }

      function isVisiblePlaygroundProjectListRecord(project) {
        if (!project || typeof project !== "object") {
          return false;
        }
        if (typeof project.id !== "string" || !project.id.trim()) {
          return false;
        }

        const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : null;
        const summary = project.summary && typeof project.summary === "object" && !Array.isArray(project.summary)
          ? project.summary
          : {};
        const missionControl = project.missionControl && typeof project.missionControl === "object" && !Array.isArray(project.missionControl)
          ? project.missionControl
          : (metadata?.missionControl && typeof metadata.missionControl === "object" && !Array.isArray(metadata.missionControl)
            ? metadata.missionControl
            : null);
        const hasSummaryActivity = [
          summary.environmentsCount,
          summary.threadsCount,
          summary.activeThreadsCount,
          summary.tasksCount,
          summary.openTasksCount,
          summary.releaseCount,
          summary.activeReleaseCount,
          summary.sprintCount,
          summary.activeSprintCount,
        ].some((value) => Number(value) > 0);
        const isPlaceholderProjectName = (value) => {
          const normalized = String(value || "").trim().replace(/\\s+/g, " ").toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project" || normalized === "new project";
        };
        const projectName = String(project.name || metadata?.name || "").trim();

        return Boolean(
          (projectName && !isPlaceholderProjectName(projectName))
          || String(project.description || metadata?.description || "").trim()
          || String(project.defaultEnvironmentId || metadata?.defaultEnvironmentId || "").trim()
          || normalizePlaygroundTaskAttachmentList(project.attachments || metadata?.attachments).length > 0
          || String(project.projectRules || metadata?.projectRules || "").trim()
          || String(missionControl?.summary || "").trim()
          || String(missionControl?.document || "").trim()
          || String(missionControl?.instructions || "").trim()
          || hasSummaryActivity
        );
      }

      function parsePlaygroundProjectListResponse(data) {
        const items = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.projects)
            ? data.projects
            : Array.isArray(data?.items)
              ? data.items
              : [];
        return items
          .filter(isVisiblePlaygroundProjectListRecord)
          .map(normalizePlaygroundProjectRecord);
      }

      function sortPlaygroundProjectsByRecent(projectList) {
        const items = Array.isArray(projectList) ? projectList.slice() : [];
        return items.sort((left, right) => {
          const updatedOrder = String(right?.updatedAt || right?.createdAt || "").localeCompare(String(left?.updatedAt || left?.createdAt || ""));
          if (updatedOrder !== 0) {
            return updatedOrder;
          }
          return String(left?.name || "").localeCompare(String(right?.name || ""));
        });
      }

      function mergePlaygroundProjectRecords(primaryProject, fallbackProject) {
        const hasOwnProjectField = (project, field) =>
          Boolean(project && typeof project === "object" && Object.prototype.hasOwnProperty.call(project, field));
        const normalizeProjectNameForMerge = (value) => String(value || "").trim().replace(/\\s+/g, " ");
        const isPlaceholderProjectNameForMerge = (value) => {
          const normalized = normalizeProjectNameForMerge(value).toLowerCase();
          return !normalized || normalized === "project" || normalized === "untitled project";
        };
        const normalizedPrimary = primaryProject && typeof primaryProject === "object"
          ? normalizePlaygroundProjectRecord(primaryProject)
          : null;
        const normalizedFallback = fallbackProject && typeof fallbackProject === "object"
          ? normalizePlaygroundProjectRecord(fallbackProject)
          : null;

        if (!normalizedPrimary && !normalizedFallback) {
          return null;
        }
        if (!normalizedPrimary) {
          return normalizedFallback;
        }
        if (!normalizedFallback) {
          return normalizedPrimary;
        }

        const rawPrimaryMetadata = primaryProject?.metadata && typeof primaryProject.metadata === "object" && !Array.isArray(primaryProject.metadata)
          ? primaryProject.metadata
          : {};
        const rawFallbackMetadata = fallbackProject?.metadata && typeof fallbackProject.metadata === "object" && !Array.isArray(fallbackProject.metadata)
          ? fallbackProject.metadata
          : {};
        const primaryHasName = hasOwnProjectField(primaryProject, "name") || hasOwnProjectField(rawPrimaryMetadata, "name");
        const fallbackHasName = hasOwnProjectField(fallbackProject, "name") || hasOwnProjectField(rawFallbackMetadata, "name");
        const primaryHasDescription = hasOwnProjectField(primaryProject, "description")
          || hasOwnProjectField(rawPrimaryMetadata, "description");
        const primaryHasColor = hasOwnProjectField(primaryProject, "color");
        const primaryHasDefaultEnvironment = hasOwnProjectField(primaryProject, "defaultEnvironmentId")
          || hasOwnProjectField(rawPrimaryMetadata, "defaultEnvironmentId");
        const primaryHasAttachments = hasOwnProjectField(primaryProject, "attachments")
          || hasOwnProjectField(rawPrimaryMetadata, "attachments");
	        const primaryHasConnectors = hasOwnProjectField(primaryProject, "connectors")
	          || hasOwnProjectField(rawPrimaryMetadata, "connectors");
	        const primaryHasProjectRules = hasOwnProjectField(primaryProject, "projectRules")
	          || hasOwnProjectField(rawPrimaryMetadata, "projectRules");
	        const primaryHasMissionControl = hasOwnProjectField(primaryProject, "missionControl")
	          || hasOwnProjectField(rawPrimaryMetadata, "missionControl");
	        const primaryHasPermissionSet = hasOwnProjectField(primaryProject, "permissionSet")
	          || hasOwnProjectField(rawPrimaryMetadata, "permissionSet");
	        const primaryHasWallpaper = hasOwnProjectField(primaryProject, "wallpaperId")
          || hasOwnProjectField(rawPrimaryMetadata, "wallpaperId");
        const primaryHasIcon = hasOwnProjectField(primaryProject, "icon")
          || hasOwnProjectField(rawPrimaryMetadata, "icon");
        const primaryHasUseCardBackgroundAsWallpaper = hasOwnProjectField(primaryProject, "useCardBackgroundAsWallpaper")
          || hasOwnProjectField(rawPrimaryMetadata, "useCardBackgroundAsWallpaper");
        const primaryHasProjectType = hasOwnProjectField(primaryProject, "projectType")
          || hasOwnProjectField(primaryProject, "type")
          || hasOwnProjectField(rawPrimaryMetadata, "projectType")
          || hasOwnProjectField(rawPrimaryMetadata, "type")
          || hasOwnProjectField(rawPrimaryMetadata, "blueprintId");
        const primaryName = normalizeProjectNameForMerge(primaryHasName ? normalizedPrimary.name : "");
        const fallbackName = normalizeProjectNameForMerge(fallbackHasName ? normalizedFallback.name : "");
        const mergedName = primaryHasName && (!isPlaceholderProjectNameForMerge(primaryName) || isPlaceholderProjectNameForMerge(fallbackName))
          ? normalizedPrimary.name
          : normalizedFallback.name;
        const mergedDescription = primaryHasDescription
          ? normalizedPrimary.description
          : normalizedFallback.description;
        const mergedColor = primaryHasColor ? normalizedPrimary.color : normalizedFallback.color;
        const mergedDefaultEnvironmentId = primaryHasDefaultEnvironment
          ? normalizedPrimary.defaultEnvironmentId
          : normalizedFallback.defaultEnvironmentId;
	        const mergedAttachments = primaryHasAttachments ? normalizedPrimary.attachments : normalizedFallback.attachments;
	        const mergedConnectors = primaryHasConnectors ? normalizedPrimary.connectors : normalizedFallback.connectors;
		        const mergedProjectRules = primaryHasProjectRules ? normalizedPrimary.projectRules : normalizedFallback.projectRules;
		        const mergedPermissionSet = primaryHasPermissionSet ? normalizedPrimary.permissionSet : normalizedFallback.permissionSet;
		        const primaryMissionControlIsMeaningful = hasMeaningfulPlaygroundProjectMissionControlRecord(normalizedPrimary.missionControl);
	        const fallbackMissionControlIsMeaningful = hasMeaningfulPlaygroundProjectMissionControlRecord(normalizedFallback.missionControl);
	        const mergedMissionControl = primaryHasMissionControl
	          ? (primaryMissionControlIsMeaningful || !fallbackMissionControlIsMeaningful
	              ? normalizedPrimary.missionControl
	              : normalizedFallback.missionControl)
	          : normalizedFallback.missionControl;
        const fallbackMetadata = normalizedFallback.metadata && typeof normalizedFallback.metadata === "object" && !Array.isArray(normalizedFallback.metadata)
          ? normalizedFallback.metadata
          : {};
        const primaryMetadata = normalizedPrimary.metadata && typeof normalizedPrimary.metadata === "object" && !Array.isArray(normalizedPrimary.metadata)
          ? normalizedPrimary.metadata
          : {};
        const mergedMetadata = {
          ...fallbackMetadata,
          ...primaryMetadata,
        };
        const mergedWallpaperId = getPlaygroundProjectWallpaperId(
          primaryHasWallpaper
            ? (normalizedPrimary.wallpaperId || primaryMetadata.wallpaperId)
            : (normalizedFallback.wallpaperId || fallbackMetadata.wallpaperId),
          normalizedFallback.wallpaperId || PLAYGROUND_PROJECT_WALLPAPER_OPTIONS[0].id
        );
        const mergedIcon = getPlaygroundProjectIconId(
          primaryHasIcon
            ? (normalizedPrimary.icon || primaryMetadata.icon)
            : (normalizedFallback.icon || fallbackMetadata.icon)
        );
        const mergedUseCardBackgroundAsWallpaper = primaryHasUseCardBackgroundAsWallpaper
          ? getPlaygroundProjectUseCardBackgroundAsWallpaper(
              primaryProject?.useCardBackgroundAsWallpaper,
              rawPrimaryMetadata.useCardBackgroundAsWallpaper,
              normalizedPrimary.useCardBackgroundAsWallpaper
            )
          : getPlaygroundProjectUseCardBackgroundAsWallpaper(
              fallbackProject?.useCardBackgroundAsWallpaper,
              rawFallbackMetadata.useCardBackgroundAsWallpaper,
              normalizedFallback.useCardBackgroundAsWallpaper
            );
        const mergedProjectType = primaryHasProjectType
          ? normalizedPrimary.projectType
          : normalizedFallback.projectType;
        const mergedBlueprint = getPlaygroundProjectBlueprint(mergedProjectType);

        return normalizePlaygroundProjectRecord({
          ...normalizedFallback,
          ...normalizedPrimary,
          name: mergedName,
          description: mergedDescription,
          projectType: mergedBlueprint.id,
          type: mergedBlueprint.id,
          icon: mergedIcon,
          wallpaperId: mergedWallpaperId,
          useCardBackgroundAsWallpaper: mergedUseCardBackgroundAsWallpaper,
          color: mergedColor,
          defaultEnvironmentId: mergedDefaultEnvironmentId,
	          attachments: mergedAttachments,
	          connectors: mergedConnectors,
		          projectRules: mergedProjectRules,
		          permissionSet: mergedPermissionSet,
		          missionControl: mergedMissionControl,
	          metadata: {
            ...mergedMetadata,
            ...buildPlaygroundProjectBlueprintMetadata(mergedBlueprint),
            name: mergedName,
            description: mergedDescription,
            projectType: mergedBlueprint.id,
            blueprintId: mergedBlueprint.id,
            icon: mergedIcon,
            wallpaperId: mergedWallpaperId,
            useCardBackgroundAsWallpaper: mergedUseCardBackgroundAsWallpaper,
            defaultEnvironmentId: mergedDefaultEnvironmentId,
	            attachments: mergedAttachments,
	            connectors: hasPlaygroundTaskConnectorSelections(mergedConnectors) ? mergedConnectors : null,
		            projectRules: mergedProjectRules,
		            permissionSet: mergedPermissionSet,
		            missionControl: mergedMissionControl,
	          },
          summary: {
            ...buildEmptyPlaygroundProjectSummary(),
            ...(normalizedFallback.summary && typeof normalizedFallback.summary === "object" ? normalizedFallback.summary : {}),
            ...(normalizedPrimary.summary && typeof normalizedPrimary.summary === "object" ? normalizedPrimary.summary : {}),
          },
        });
      }

      function getPlaygroundProjectResponseRecord(data, fallbackProject) {
        const source = data?.project || data?.data || data;
        const sourceRecord = source && typeof source === "object" && typeof source.id === "string"
          ? {
              ...source,
              summary: data?.summary && typeof data.summary === "object" ? data.summary : source.summary,
            }
          : null;
        const normalizedSource = sourceRecord ? normalizePlaygroundProjectRecord(sourceRecord) : null;
        return mergePlaygroundProjectRecords(sourceRecord, fallbackProject) || normalizedSource;
      }

      function parsePlaygroundTeamSharedResourceMetadata(share) {
        const metadata = share?.metadata;
        if (!metadata) {
          return {};
        }
        if (typeof metadata === "string") {
          try {
            const parsed = JSON.parse(metadata);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
          } catch {
            return {};
          }
        }
        return metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {};
      }

      function getPlaygroundTeamSharedResourceType(share) {
        const metadata = parsePlaygroundTeamSharedResourceMetadata(share);
        return String(
          share?.resourceType
          || share?.resource_type
          || metadata.resourceType
          || metadata.resource_type
          || metadata.resourceKind
          || metadata.resource_kind
          || metadata.kind
          || metadata.type
          || ""
        ).trim().toLowerCase();
      }

      function getPlaygroundTeamSharedProjectId(share) {
        const metadata = parsePlaygroundTeamSharedResourceMetadata(share);
        const metadataProject = metadata.project && typeof metadata.project === "object" && !Array.isArray(metadata.project)
          ? metadata.project
          : {};
        return String(
          share?.resourceId
          || share?.resource_id
          || metadata.projectId
          || metadata.project_id
          || metadataProject.id
          || ""
        ).trim();
      }

      function markPlaygroundProjectAsTeamShared(project, share, team) {
        if (!project?.id) {
          return project;
        }
        const metadata = parsePlaygroundTeamSharedResourceMetadata(share);
        const existingMetadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : {};
        return normalizePlaygroundProjectRecord({
          ...project,
          sharedWithMe: true,
          isShared: true,
          metadata: {
            ...existingMetadata,
            sharedWithMe: true,
            isShared: true,
            teamShared: true,
            teamShareId: String(share?.id || existingMetadata.teamShareId || "").trim(),
            teamId: String(team?.id || share?.teamId || share?.team_id || metadata.teamId || metadata.team_id || existingMetadata.teamId || "").trim(),
            teamName: String(team?.name || metadata.teamName || metadata.team_name || existingMetadata.teamName || "").trim(),
          },
        });
      }

      function getPlaygroundFallbackTeamSharedProjectRecord(share, team) {
        const metadata = parsePlaygroundTeamSharedResourceMetadata(share);
        const metadataProject = metadata.project && typeof metadata.project === "object" && !Array.isArray(metadata.project)
          ? metadata.project
          : {};
        const projectId = getPlaygroundTeamSharedProjectId(share);
        if (!projectId) {
          return null;
        }
        const projectName = String(
          metadataProject.name
          || metadataProject.title
          || metadata.name
          || metadata.title
          || share?.resourceName
          || share?.resource_name
          || share?.name
          || "Shared project"
        ).trim() || "Shared project";
        const shareUpdatedAt = String(share?.updatedAt || share?.updated_at || share?.createdAt || share?.created_at || "").trim();
        return normalizePlaygroundProjectRecord({
          ...metadataProject,
          id: projectId,
          name: projectName,
          description: String(metadataProject.description || metadata.description || "").trim(),
          updatedAt: shareUpdatedAt || metadataProject.updatedAt || metadata.updatedAt,
          createdAt: String(share?.createdAt || share?.created_at || metadataProject.createdAt || metadata.createdAt || "").trim(),
          metadata: {
            ...(metadataProject.metadata && typeof metadataProject.metadata === "object" && !Array.isArray(metadataProject.metadata) ? metadataProject.metadata : {}),
            ...metadata,
            sharedWithMe: true,
            isShared: true,
            teamShared: true,
            teamShareId: String(share?.id || "").trim(),
            teamId: String(team?.id || share?.teamId || share?.team_id || metadata.teamId || metadata.team_id || "").trim(),
            teamName: String(team?.name || metadata.teamName || metadata.team_name || "").trim(),
          },
        });
      }

      function isPlaygroundProjectTeamSharedWithCurrentUser(project) {
        const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
          ? project.metadata
          : {};
        return Boolean(
          project?.sharedWithMe
          || project?.isShared
          || project?.teamShared
          || project?.teamShareId
          || project?.teamShareSource
          || project?.teamAccessLevel
          || project?.teamId
          || metadata.sharedWithMe
          || metadata.isShared
          || metadata.teamShared
          || metadata.teamShareId
          || metadata.teamShareSource
          || metadata.teamAccessLevel
        );
      }

      async function resolvePlaygroundTeamSharedProjects({ backendUrl, headers, projects = [] }) {
        const projectsById = new Map(
          (Array.isArray(projects) ? projects : [])
            .map((project) => [String(project?.id || "").trim(), project])
            .filter(([projectId]) => projectId)
        );
        if (!backendUrl) {
          return Array.from(projectsById.values());
        }

        const teamsResult = await fetchJsonWithTimeout(backendUrl + "/teams", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers,
        }, 8000).catch(() => null);
        const teams = teamsResult?.response?.ok
          ? (Array.isArray(teamsResult.data?.data) ? teamsResult.data.data : (Array.isArray(teamsResult.data?.teams) ? teamsResult.data.teams : []))
          : [];
        const projectShares = [];

        if (teams.length > 0) {
          const shareResults = await Promise.allSettled(teams.map(async (team) => {
            const teamId = String(team?.id || "").trim();
            if (!teamId) {
              return [];
            }
            const { response, data } = await fetchJsonWithTimeout(backendUrl + "/teams/" + encodeURIComponent(teamId) + "/resource-shares", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers,
            }, 8000);
            if (!response.ok) {
              return [];
            }
            return (Array.isArray(data?.data) ? data.data : [])
              .filter((share) => getPlaygroundTeamSharedResourceType(share) === "project")
              .map((share) => ({ share, team }));
          }));
          shareResults.forEach((result) => {
            if (result.status === "fulfilled" && Array.isArray(result.value)) {
              projectShares.push(...result.value);
            }
          });
        }

        projectShares.forEach(({ share, team }) => {
          const projectId = getPlaygroundTeamSharedProjectId(share);
          if (!projectId || !projectsById.has(projectId)) {
            return;
          }
          const sharedProject = markPlaygroundProjectAsTeamShared(projectsById.get(projectId), share, team);
          if (sharedProject?.id) {
            projectsById.set(projectId, sharedProject);
          }
        });

        const missingSharedProjectIds = Array.from(new Set(projectShares
          .map(({ share }) => getPlaygroundTeamSharedProjectId(share))
          .filter((projectId) => projectId && !projectsById.has(projectId))));

        if (missingSharedProjectIds.length > 0) {
          const detailResults = await Promise.allSettled(missingSharedProjectIds.map(async (projectId) => {
            const detailResponse = await fetch(backendUrl + "/projects/" + encodeURIComponent(projectId), {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers,
            });
            const detailData = await detailResponse.json().catch(() => ({}));
            if (!detailResponse.ok) {
              throw new Error(detailData?.message || detailData?.error || "Failed to load shared project.");
            }
            return getPlaygroundProjectResponseRecord(detailData, { id: projectId }) || normalizePlaygroundProjectRecord({ id: projectId });
          }));

          missingSharedProjectIds.forEach((projectId, index) => {
            const result = detailResults[index];
            let sharedProject = result?.status === "fulfilled" ? result.value : null;
            const matchingShare = projectShares.find(({ share }) => getPlaygroundTeamSharedProjectId(share) === projectId);
            if (!sharedProject && matchingShare) {
              sharedProject = getPlaygroundFallbackTeamSharedProjectRecord(matchingShare.share, matchingShare.team);
            }
            if (sharedProject && matchingShare) {
              sharedProject = markPlaygroundProjectAsTeamShared(sharedProject, matchingShare.share, matchingShare.team);
            }
            if (sharedProject?.id) {
              projectsById.set(projectId, sharedProject);
            }
          });
        }

        return Array.from(projectsById.values());
      }

      function toPlaygroundDatetimeLocalValue(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return localDate.toISOString().slice(0, 16);
      }

      function toPlaygroundDateInputValue(value) {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
        return localDate.toISOString().slice(0, 10);
      }

      function fromPlaygroundDatetimeLocalValue(value) {
        const normalized = String(value || "").trim();
        if (!normalized) return null;
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }

      function fromPlaygroundDateInputValue(value, options = {}) {
        const normalized = String(value || "").trim();
        if (!normalized) return null;
        const timeSuffix = options.endOfDay ? "T23:59:59.999" : "T00:00:00.000";
        const date = new Date(normalized + timeSuffix);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }

      function resolvePlaygroundReleaseDraftDateValue(value, options = {}) {
        const normalized = String(value || "").trim();
	        if (!normalized) return null;
	        if (/^\\d{4}-\\d{2}-\\d{2}$/.test(normalized)) {
          return fromPlaygroundDateInputValue(normalized, options);
        }
        const date = new Date(normalized);
        return Number.isNaN(date.getTime()) ? null : date.toISOString();
      }

${CALENDAR_DOMAIN_RUNTIME_SCRIPT}
      function getPlaygroundTaskStatusLabel(status) {
        if (status === "backlog") {
          return "To do";
        }
        return PLAYGROUND_TASK_STATUS_OPTIONS.find((option) => option.id === status)?.label || "To do";
      }

      function getPlaygroundTaskPriorityLabel(priority) {
        return getPlaygroundTaskPriorityPresentation(priority).label;
      }

      function getPlaygroundTaskPriorityPresentation(priority) {
        const normalized = PLAYGROUND_TASK_PRIORITY_OPTIONS.some((option) => option.id === priority) ? priority : "medium";
        switch (normalized) {
          case "low":
            return { id: "low", label: "Low", level: 1, toneClassName: "is-low" };
          case "high":
            return { id: "high", label: "High", level: 3, toneClassName: "is-high" };
          case "urgent":
            return { id: "urgent", label: "Urgent", level: 3, toneClassName: "is-critical", isUrgent: true };
          default:
            return { id: "medium", label: "Medium", level: 2, toneClassName: "is-medium" };
        }
      }

      function renderPlaygroundTaskPriorityGlyph(priority, className) {
        const presentation = getPlaygroundTaskPriorityPresentation(priority);
        if (presentation.isUrgent) {
          return React.createElement(AlertCircle, {
            className: ["playground-tasks-priority-value-icon", className].filter(Boolean).join(" "),
            strokeWidth: 2,
            "aria-hidden": "true",
          });
        }
        return React.createElement("span", {
            className: ["playground-tasks-priority-value-icon", "playground-tasks-priority-bars-icon", className].filter(Boolean).join(" "),
            "aria-hidden": "true",
          },
          [1, 2, 3].map((barLevel) =>
            React.createElement("span", {
              key: barLevel,
              className: "playground-tasks-priority-bars-bar" + (barLevel <= presentation.level ? " is-active" : ""),
            })
          )
        );
      }

      function renderPlaygroundTaskPriorityLabel(priority, className) {
        const presentation = getPlaygroundTaskPriorityPresentation(priority);
        return React.createElement("span", {
            className: ["playground-tasks-priority-value", presentation.toneClassName, className].filter(Boolean).join(" "),
          },
          renderPlaygroundTaskPriorityGlyph(priority),
          React.createElement("span", { className: "playground-tasks-priority-value-text" }, presentation.label)
        );
      }

      function renderPlaygroundTaskPriorityIcon(priority, className) {
        const presentation = getPlaygroundTaskPriorityPresentation(priority);
        return React.createElement("span", {
            className: ["playground-tasks-priority-value", presentation.toneClassName, className].filter(Boolean).join(" "),
            title: presentation.label,
            "aria-label": presentation.label,
          },
          renderPlaygroundTaskPriorityGlyph(priority)
        );
      }

`;
