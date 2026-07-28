	        function PlaygroundSkillsPage({
          skills,
          fetchSkills,
          backendUrl,
          requestHeaders,
          environments,
          projectId,
          apiKey,
          upstreamUrl,
          currentUserId = "",
          currentUserName = "",
          currentUserEmail = "",
          currentUserAvatarUrl = "",
          topNavActionsPortalId,
          onToolsSkillsHeaderChange,
          backRequestToken,
          openSkillRequest = null,
          enabledSkillIds = [],
          onSkillsChange = null,
	          workspaceTeams = [],
	        }) {
	          const PLAYGROUND_CUSTOM_SKILL_DRAFT_ID = "__custom_skill_draft__";
	          const searchPopupInputRef = useRef(null);
          const skillCodeFileInputRef = useRef(null);
          const skillActionsPopoverRef = useRef(null);
          const skillDetailIconPickerRef = useRef(null);
          const skillRenameInputRef = useRef(null);
          const skillEditTitleInputRef = useRef(null);
          const skillEditDescriptionTextareaRef = useRef(null);
          const [toolbarPopover, setToolbarPopover] = useState("");
          const [searchPopupQuery, setSearchPopupQuery] = useState("");
          const [skillListMode, setSkillListMode] = useState("system");
          const [selectedSkillId, setSelectedSkillId] = useState("");
          const [skillActionsPopoverOpen, setSkillActionsPopoverOpen] = useState(false);
          const [skillRenameState, setSkillRenameState] = useState(null);
          const [skillRenameValue, setSkillRenameValue] = useState("");
          const [skillRenameError, setSkillRenameError] = useState("");
          const [skillEditState, setSkillEditState] = useState(null);
          const [skillEditTitleValue, setSkillEditTitleValue] = useState("");
          const [skillEditDescriptionValue, setSkillEditDescriptionValue] = useState("");
          const [skillEditError, setSkillEditError] = useState("");
          const [skillTitleDraft, setSkillTitleDraft] = useState("");
          const [loadedSkills, setLoadedSkills] = useState([]);
          const [skillsLoading, setSkillsLoading] = useState(false);
          const [skillsLoaded, setSkillsLoaded] = useState(false);
          const [skillsError, setSkillsError] = useState("");
	          const [topNavActionsContainer, setTopNavActionsContainer] = useState(null);
          const [skillsPageMode, setSkillsPageMode] = useState("overview");
          const [skillsOverviewChartTimescale, setSkillsOverviewChartTimescale] = useState("month");
          const [skillDetailTab, setSkillDetailTab] = useState("code");
          const [skillAccessPrincipalId, setSkillAccessPrincipalId] = useState("");
          const [skillAccessRoleId, setSkillAccessRoleId] = useState("member");
          const [skillAccessTeamMenuOpen, setSkillAccessTeamMenuOpen] = useState(false);
          const [skillAccessSelectedTeamIds, setSkillAccessSelectedTeamIds] = useState(() => new Set());
          const [skillVersionsOpen, setSkillVersionsOpen] = useState(false);
          const [skillPublishMenuOpen, setSkillPublishMenuOpen] = useState(false);
          const [skillVersionState, setSkillVersionState] = useState({
            skillId: "",
            status: "idle",
            error: "",
            versions: [],
            currentVersionId: "",
            publishedVersionId: "",
          });
          const [SkillCodeEditorComponent, setSkillCodeEditorComponent] = useState(null);
          const [skillCodeEditorState, setSkillCodeEditorState] = useState({
            fileId: "",
            value: "",
            initialValue: "",
            isSaving: false,
            error: "",
            message: "",
          });
          const [skillDetailIconPickerOpen, setSkillDetailIconPickerOpen] = useState(false);
          const [skillListActionMenuState, setSkillListActionMenuState] = useState(null);
          const [skillSaveState, setSkillSaveState] = useState({
            isSaving: false,
            error: "",
          });
          const [skillCodeFilesTransferState, setSkillCodeFilesTransferState] = useState({
            isProcessing: false,
            error: "",
          });
          const [skillSectionEditing, setSkillSectionEditing] = useState({
            description: false,
            usage: false,
            process: false,
            outputFormat: false,
            configuration: false,
            examplePrompts: false,
          });
          const [isSkillCodeDragging, setIsSkillCodeDragging] = useState(false);
          const [skillEnvironmentFilePickerOpen, setSkillEnvironmentFilePickerOpen] = useState(false);
          const [skillEnvironmentFilePickerInventory, setSkillEnvironmentFilePickerInventory] = useState([]);
          const [skillEnvironmentFilePickerState, setSkillEnvironmentFilePickerState] = useState({
            status: "idle",
            error: "",
          });
          const [skillEnvironmentFilePickerSearch, setSkillEnvironmentFilePickerSearch] = useState("");
          const [skillEnvironmentFilePickerExpandedFolders, setSkillEnvironmentFilePickerExpandedFolders] = useState([]);
          const [skillEnvironmentFilePickerSelectedPaths, setSkillEnvironmentFilePickerSelectedPaths] = useState([]);
          const [skillEnvironmentSelectionId, setSkillEnvironmentSelectionId] = useState("");
  	        const [skillEnvironmentPopoverOpen, setSkillEnvironmentPopoverOpen] = useState(false);
  	        const [skillEnvironmentFilePickerTarget, setSkillEnvironmentFilePickerTarget] = useState("detail");
          const skillDescriptionTextareaRef = useRef(null);
          const skillUsageTextareaRef = useRef(null);
          const skillProcessTextareaRef = useRef(null);
          const skillOutputTextareaRef = useRef(null);
          const skillConfigurationTextareaRef = useRef(null);
          const skillExamplesTextareaRef = useRef(null);
          const handledBackRequestTokenRef = useRef(backRequestToken);
          const systemSkillSourceRequestRef = useRef(new Map());
          const [systemSkillSourceCatalog, setSystemSkillSourceCatalog] = useState({});
  
          const loadSystemSkillSource = useCallback((skillId) => {
            const normalizedSkillId = getPlaygroundSkillFamilyId(skillId);
            if (!normalizedSkillId || systemSkillSourceCatalog[normalizedSkillId]) {
              return Promise.resolve(systemSkillSourceCatalog[normalizedSkillId] || null);
            }
            if (systemSkillSourceRequestRef.current.has(normalizedSkillId)) {
              return systemSkillSourceRequestRef.current.get(normalizedSkillId);
            }
            const request = fetch("/api/platform/system-skills/" + encodeURIComponent(normalizedSkillId) + "/source", {
              method: "GET",
              headers: { Accept: "application/json" },
              credentials: "same-origin",
            })
              .then(async (response) => {
                const payload = await response.json().catch(() => ({}));
                if (!response.ok || !payload?.source) {
                  throw new Error(payload?.error || "Failed to load system skill source.");
                }
                setSystemSkillSourceCatalog((current) => ({
                  ...current,
                  [normalizedSkillId]: payload.source,
                }));
                return payload.source;
              })
              .catch(() => null)
              .finally(() => {
                systemSkillSourceRequestRef.current.delete(normalizedSkillId);
              });
            systemSkillSourceRequestRef.current.set(normalizedSkillId, request);
            return request;
          }, [systemSkillSourceCatalog]);
  
          const skillCatalogMetaById = useMemo(() => {
            const meta = {
            browser: {
              name: "Browser",
              description: "Open websites visually, navigate pages, and inspect browser state from the agent.",
              icon: "globe",
              markdown: [
                "# Browser Skill",
                "",
                "This skill gives the agent a lightweight visual browser that can navigate pages, click elements, type into fields, scroll, wait for UI state, and capture screenshots.",
                "",
                "## Usage",
                "",
                "Use this skill when the user needs browser interaction such as:",
                "- Opening websites and reading live page state",
                "- Clicking buttons, links, tabs, and menus",
                "- Filling forms and submitting them",
                "- Checking what a page looks like after code or content changes",
                "- Collecting screenshots of browser state during a task",
                "",
                "## Process",
                "",
                "1. Run a `navigate` or `snapshot` command.",
                "2. Inspect the returned screenshot, URL, title, visible text excerpt, and interactive elements.",
                "3. Choose the next `click`, `type`, `press`, `scroll`, or `wait-for` action.",
                "4. Repeat until the task is complete.",
                "",
                "## Output Format",
                "",
                "Each command prints one structured result line prefixed with `BROWSER_SKILL_RESULT::` and includes the current URL, title, screenshot path, and relevant interaction metadata.",
                "",
                "## Configuration",
                "",
                "- **Runtime**: `/workspace/.claude/skills/browser/scripts/browser.mjs`",
                "- **Approach**: Chrome/Chromium via CDP without Playwright or Puppeteer",
                "- **Guidance**: Prefer `snapshot` before interacting with unfamiliar pages and inspect the screenshot after each action",
                "",
                "## Example Prompts",
                "",
                "- Open the staging site and verify the signup flow visually",
                "- Navigate to the dashboard and capture a screenshot of the final state",
              ].join("\n"),
              codeFiles: [
                {
                  id: "browser-runtime",
                  name: "scripts/browser.mjs",
                  content: "// Browser runtime is managed by the platform.",
                  language: "javascript",
                },
              ],
            },
            image_generation: {
              name: "Image Generation",
              description: "Generate and edit images with GPT Image 2 or Gemini 3.1 Flash Image.",
              icon: "image",
            },
            video_generation: {
              name: "Video Generation",
              description: "Generate short videos with Cloudflare video models and save them to the computer file base.",
              icon: "video",
            },
            web_search: {
              name: "Web Search",
              description: "Search the web for up-to-date information with cited results.",
              icon: "search",
            },
            deep_research: {
              name: "Deep Research",
              description: "Enable longer-form research runs with a dedicated research model.",
              icon: "telescope",
            },
            pdf: {
              name: "PDF Processing",
              description: "Read, extract, and reason over PDF documents.",
              icon: "file-text",
            },
            frontend_design: {
              name: "Hallmark Frontend Design",
              description: "Use Hallmark by default for distinctive websites, web apps, landing pages, audits, and redesigns.",
              icon: "slash",
            },
            pptx: {
              name: "PowerPoint / PPTX",
              description: "Create, inspect, and transform PowerPoint presentations.",
              icon: "layers",
            },
            memory: {
              name: "Memory",
              description: "Allow the agent to reuse persistent memory context when available.",
              icon: "brain",
            },
            task_management: {
              name: "Task Management",
              description: "Let the agent create, organize, and comment on planning tasks and projects.",
              icon: "list",
            },
            app_platform: {
              name: "App Platform",
              description: "Create, connect, deploy, and debug web apps, functions, databases, and auth resources.",
              icon: "server",
              markdown: [
                "# App Platform Skill",
                "",
                "This skill manages app-platform resources across web apps, functions, databases, and auth modules.",
                "",
                "## Usage",
                "",
                "Invoke this skill when the user needs to:",
                "- Create a new web app, function, database, or auth resource",
                "- Connect a web app or function to database or auth bindings",
                "- Upload, edit, list, download, or delete server source files",
                "- Deploy a resource and inspect its runtime configuration",
                "- Read runtime context, logs, analytics, and diagnostics",
                "- Manage auth users or database collections and documents",
                "",
                "## Process",
                "",
                "1. Inspect existing resource context before changing bindings or deploying.",
                "2. Use the built-in `app-platform.py` helper instead of handwritten curl requests.",
                "3. Prefer explicit create/connect/deploy steps over implicit assumptions.",
                "4. When debugging, inspect context and logs before editing source files.",
                "",
                "## Configuration",
                "",
                "- **CLI path**: `/workspace/.claude/skills/app-platform/scripts/app-platform.py`",
                "- **Authentication**: `COMPUTER_AGENTS_API_KEY` must be available in the runtime",
                "- **Primary command groups**: `resources`, `servers`, `bindings`, `files`, `deploy`, `logs`, `auth-users`, and `database`",
              ].join("\n"),
              codeFiles: [
                {
                  id: "app-platform-main",
                  name: "app-platform.py",
                  content: "# App Platform runtime is managed by the platform.",
                  language: "python",
                },
              ],
            },
            computer_agents: {
              name: "Computer Agents",
              description: "Inspect and manage agents, environments, skills, and threads from inside the run.",
              icon: "runner",
              markdown: [
                "# Computer Agents Skill",
                "",
                "This skill enables live account-level operations across agents, environments, skills, and threads.",
                "",
                "## Usage",
                "",
                "Invoke this skill when the user needs to:",
                "- Inspect the live list of agents before assigning work",
                "- Review available environments before selecting execution context",
                "- List system and custom skills before attaching them to tasks",
                "- Create new agents, clone environments, or create custom skills",
                "- List recent threads or create a new thread programmatically",
                "",
                "## Process",
                "",
                "1. Start by listing the relevant resource family.",
                "2. Decide whether you need discovery only or a create/clone action.",
                "3. Use the built-in `computer-agents.py` helper instead of handwritten curl requests.",
                "4. Verify returned IDs and metadata before using them later.",
                "",
                "## Output Format",
                "",
                "The skill outputs structured JSON from the Computer Agents API, including resource lists and creation responses for agents, environments, skills, and threads.",
                "",
                "## Configuration",
                "",
                "- **CLI path**: `/workspace/.claude/skills/computer-agents/scripts/computer-agents.py`",
                "- **Authentication**: `COMPUTER_AGENTS_API_KEY` must be available in the runtime",
                "- **Primary command groups**: `skills`, `agents`, `environments`, and `threads`",
                "",
                "## Example Prompts",
                "",
                "- List the available agents and suggest who should own these tickets",
                "- Create a custom skill for milestone planning",
              ].join("\n"),
              codeFiles: [
                {
                  id: "computer-agents-main",
                  name: "computer-agents.py",
                  content: "# Computer Agents runtime is managed by the platform.",
                  language: "python",
                },
              ],
            },
            email: {
              name: "Email",
              description: "Search, read, summarize, and send email through the connected Gmail account.",
              icon: "mail",
              markdown: [
                "# Email Skill",
                "",
                "This skill enables agents to search, read, summarize, and send email through the user's connected Gmail account.",
                "",
                "## Usage",
                "",
                "Invoke this skill when the user explicitly asks to:",
                "- Search or read messages from their connected mailbox",
                "- Summarize recent emails, conversations, receipts, or updates",
                "- Extract structured data from email threads",
                "- Draft or send an email on their behalf",
                "",
                "## Process",
                "",
                "1. Check that the mailbox is connected before reading or sending.",
                "2. Use focused searches, labels, or date windows instead of broad inbox reads.",
                "3. Use the built-in `email.py` helper instead of handwritten Gmail API calls.",
                "4. Only send when the user explicitly requested it and use the helper confirmation flag.",
                "",
                "## Configuration",
                "",
                "- **CLI path**: `/workspace/.claude/skills/email/scripts/email.py`",
                "- **Authentication**: The user must connect Gmail from the Integrations screen",
                "- **Send access**: Sending requires an explicit user request and `--confirm-send`",
              ].join("\n"),
              codeFiles: [
                {
                  id: "email-main",
                  name: "email.py",
                  content: "# Email runtime is managed by the platform.",
                  language: "python",
                },
              ],
            },
            };
            Object.entries(systemSkillSourceCatalog || {}).forEach(([skillId, sourceMeta]) => {
              const normalizedSkillId = String(skillId || "").trim();
              if (!normalizedSkillId || !sourceMeta || typeof sourceMeta !== "object") {
                return;
              }
              meta[normalizedSkillId] = {
                ...(meta[normalizedSkillId] || {}),
                markdown: typeof sourceMeta.markdown === "string" && sourceMeta.markdown.trim()
                  ? sourceMeta.markdown
                  : meta[normalizedSkillId]?.markdown || "",
                codeFiles: Array.isArray(sourceMeta.codeFiles) && sourceMeta.codeFiles.length > 0
                  ? sourceMeta.codeFiles
                  : meta[normalizedSkillId]?.codeFiles || [],
              };
            });
            return meta;
          }, [systemSkillSourceCatalog]);
  
          function getPlaygroundSkillFamilyId(value) {
            const rawSkillId = String(value || "").trim();
            if (!rawSkillId) {
              return "";
            }
  
            const normalizedLower = rawSkillId.toLowerCase();
            const aliasedId = PLAYGROUND_RUNNER_SKILL_ID_ALIASES[rawSkillId] || PLAYGROUND_RUNNER_SKILL_ID_ALIASES[normalizedLower];
            if (aliasedId) {
              return aliasedId;
            }
  
            if (normalizedLower.startsWith("skill-image-generation-")) return "image_generation";
            if (normalizedLower.startsWith("skill-video-generation-")) return "video_generation";
            if (normalizedLower.startsWith("skill-web-search-")) return "web_search";
            if (normalizedLower.startsWith("skill-deep-research-")) return "deep_research";
            if (normalizedLower.startsWith("skill-browser-")) return "browser";
            if (normalizedLower.startsWith("skill-pdf-processing-")) return "pdf";
            if (normalizedLower.startsWith("skill-frontend-design-")) return "frontend_design";
            if (normalizedLower.startsWith("skill-pptx-")) return "pptx";
            if (normalizedLower.startsWith("skill-memory-")) return "memory";
            if (normalizedLower.startsWith("skill-task-management-")) return "task_management";
            if (normalizedLower.startsWith("skill-app-platform-")) return "app_platform";
            if (normalizedLower.startsWith("skill-computer-agents-")) return "computer_agents";
            if (normalizedLower.startsWith("skill-email-")) return "email";
  
            return normalizedLower;
          }
  
          function parsePlaygroundSkillMarkdownSections(markdown) {
            const sections = {
              usage: "",
              process: "",
              outputFormat: "",
              configuration: "",
              examplePrompts: "",
            };
  
            if (!markdown) {
              return sections;
            }
  
            const sectionRegex = new RegExp("##\\s+(Usage|When To Use|Process|Workflow|Practical Guidance|Follow-Up Scraping|Output Format|Output|Configuration|Commands|Guidance|Options|Model Options|Requirements|Example Prompts|Examples)\\s*\\n([\\s\\S]*?)(?=##\\s+|$)", "gi");
            let match;
            while ((match = sectionRegex.exec(markdown)) !== null) {
              const sectionName = String(match[1] || "").toLowerCase();
              const content = String(match[2] || "").trim();
              let targetKey = "";
              if (sectionName === "usage" || sectionName === "when to use") {
                targetKey = "usage";
              } else if (sectionName === "process" || sectionName === "workflow" || sectionName === "practical guidance" || sectionName === "follow-up scraping") {
                targetKey = "process";
              } else if (sectionName === "output format" || sectionName === "output") {
                targetKey = "outputFormat";
              } else if (sectionName === "configuration" || sectionName === "commands" || sectionName === "guidance" || sectionName === "options" || sectionName === "model options" || sectionName === "requirements") {
                targetKey = "configuration";
              } else if (sectionName === "example prompts" || sectionName === "examples") {
                targetKey = "examplePrompts";
              }
  
              if (targetKey) {
                sections[targetKey] = sections[targetKey]
                  ? sections[targetKey] + "\n\n" + content
                  : content;
              }
            }
            return sections;
          }
  
          function hasPlaygroundSkillMarkdownSections(sections) {
            return Boolean(
              String(sections?.usage || "").trim()
              || String(sections?.process || "").trim()
              || String(sections?.outputFormat || "").trim()
              || String(sections?.configuration || "").trim()
              || String(sections?.examplePrompts || "").trim()
            );
          }
  
          function computePlaygroundSkillMarkdownFromSections(skillName, sections) {
            const lines = [];
            lines.push("# " + (String(skillName || "").trim() || "Skill"));
            lines.push("");
            lines.push("## Usage");
            lines.push("");
            lines.push(String(sections?.usage || "").trim() || "Describe when this skill should be invoked...");
            lines.push("");
            lines.push("## Process");
            lines.push("");
            lines.push(String(sections?.process || "").trim() || "1. Step one\n2. Step two");
            lines.push("");
            lines.push("## Output Format");
            lines.push("");
            lines.push(String(sections?.outputFormat || "").trim() || "Describe the expected output format.");
            lines.push("");
            lines.push("## Configuration");
            lines.push("");
            lines.push(String(sections?.configuration || "").trim() || "Nothing");
            lines.push("");
            lines.push("## Example Prompts");
            lines.push("");
            lines.push(String(sections?.examplePrompts || "").trim() || "- Example prompt 1\n- Example prompt 2");
            return lines.join("\n");
          }
  
          function normalizeSkillCodeFiles(codeFiles) {
            return (Array.isArray(codeFiles) ? codeFiles : [])
              .map((file, index) => {
                const name = typeof file?.name === "string" ? file.name.trim() : "";
                if (!name) {
                  return null;
                }
                const languageCandidate = typeof file?.language === "string" && file.language.trim()
                  ? file.language.trim()
                  : getPlaygroundCodeEditorLanguage({ path: name, isDirectory: false, mimeType: "" });
                return {
                  id: typeof file?.id === "string" && file.id.trim()
                    ? file.id.trim()
                    : "code-file-" + index + "-" + name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
                  name,
                  content: typeof file?.content === "string" ? file.content : "",
                  language: languageCandidate || "plaintext",
                };
              })
              .filter(Boolean);
          }
  
          function readSkillCreatorString(sources, keys) {
            for (const source of sources) {
              if (!source || typeof source !== "object" || Array.isArray(source)) {
                continue;
              }
              for (const key of keys) {
                const value = source[key];
                if (typeof value === "string" && value.trim()) {
                  return value.trim();
                }
              }
            }
            return "";
          }

          const normalizeSkillRecord = useCallback((skill) => {
            const rawSkillId = typeof skill?.id === "string" ? skill.id.trim() : "";
            const skillId = rawSkillId ? (PLAYGROUND_RUNNER_SKILL_ID_ALIASES[rawSkillId] || rawSkillId) : "";
            if (!skillId) {
              return null;
            }
  
	            const skillFamilyId = getPlaygroundSkillFamilyId(rawSkillId || skillId);
	            const meta = skillCatalogMetaById[skillFamilyId] || skillCatalogMetaById[skillId] || {};
	            const isSystemSkill = skill?.isSystem === true || skill?.isDefault === true;
	            const isCustomSkill = !isSystemSkill;
	            const isDraft = skill?.isDraft === true;
              const skillMetadata = skill?.metadata
                && typeof skill.metadata === "object"
                && !Array.isArray(skill.metadata)
                ? skill.metadata
                : {};
              const nestedCreator = skill?.creator
                && typeof skill.creator === "object"
                && !Array.isArray(skill.creator)
                ? skill.creator
                : skill?.createdBy
                  && typeof skill.createdBy === "object"
                  && !Array.isArray(skill.createdBy)
                  ? skill.createdBy
                  : skillMetadata.creator
                    && typeof skillMetadata.creator === "object"
                    && !Array.isArray(skillMetadata.creator)
                    ? skillMetadata.creator
                    : skillMetadata.createdBy
                      && typeof skillMetadata.createdBy === "object"
                      && !Array.isArray(skillMetadata.createdBy)
                      ? skillMetadata.createdBy
                      : {};
              const explicitCreatorId =
                readSkillCreatorString([nestedCreator], [
                  "id",
                  "userId",
                  "user_id",
                ])
                || readSkillCreatorString([skill, skillMetadata], [
                  "creatorId",
                  "creator_id",
                  "createdById",
                  "created_by_id",
                ]);
              const normalizedCreatorId = explicitCreatorId.toLowerCase();
              const currentCreatorIds = [
                String(currentUserId || "").trim().toLowerCase(),
                String(currentUserEmail || "").trim().toLowerCase(),
              ].filter(Boolean);
              const isCurrentUserCreator = !normalizedCreatorId
                || currentCreatorIds.includes(normalizedCreatorId);
              const explicitCreatorName =
                readSkillCreatorString([nestedCreator], [
                  "name",
                  "displayName",
                  "display_name",
                ])
                || readSkillCreatorString([skill, skillMetadata], [
                  "creatorName",
                  "creator_name",
                  "createdByName",
                  "created_by_name",
                ]);
              const explicitCreatorAvatarUrl =
                readSkillCreatorString([nestedCreator], [
                  "avatarUrl",
                  "avatar_url",
                  "photoUrl",
                  "photoURL",
                ])
                || readSkillCreatorString([skill, skillMetadata], [
                  "creatorAvatarUrl",
                  "creator_avatar_url",
                  "createdByAvatarUrl",
                  "created_by_avatar_url",
                ]);
              const creatorName = isSystemSkill
                ? "Computer Agents"
                : explicitCreatorName
                  || (isCurrentUserCreator
                    ? String(currentUserName || currentUserEmail || "").trim()
                    : explicitCreatorId)
                  || "You";
              const creatorAvatarUrl = isSystemSkill
                ? COMPUTER_AGENTS_CREATOR_PROFILE_URL
                : explicitCreatorAvatarUrl
                  || (isCurrentUserCreator
                    ? String(currentUserAvatarUrl || "").trim()
                    : "");
  
            const rawMarkdown = typeof skill?.markdown === "string" ? skill.markdown : "";
            const parsedRawMarkdownSections = parsePlaygroundSkillMarkdownSections(rawMarkdown);
            const fallbackMarkdown = typeof meta.markdown === "string" ? meta.markdown : "";
            const effectiveMarkdown = String(rawMarkdown || "").trim() && hasPlaygroundSkillMarkdownSections(parsedRawMarkdownSections)
              ? rawMarkdown
              : fallbackMarkdown || rawMarkdown;
            const normalizedCodeFiles = normalizeSkillCodeFiles(skill?.codeFiles);
            const fallbackCodeFiles = normalizeSkillCodeFiles(meta.codeFiles);
  
            return {
              id: skillId,
              systemFamilyId: skillFamilyId || skillId,
              projectId: typeof skill?.projectId === "string" && skill.projectId.trim()
                ? skill.projectId.trim()
                : String(projectId || "__runner_playground__").trim() || "__runner_playground__",
	              name: isDraft && typeof skill?.name === "string"
	                ? skill.name
	                : typeof skill?.name === "string" && skill.name.trim()
	                ? skill.name.trim()
                : typeof meta.name === "string" && meta.name.trim()
                  ? meta.name.trim()
                  : skillId,
              description: typeof skill?.description === "string" && skill.description.trim()
                ? skill.description.trim()
                : typeof meta.description === "string"
                  ? meta.description
                  : "",
              markdown: effectiveMarkdown,
              codeFiles: normalizedCodeFiles.length > 0 ? normalizedCodeFiles : fallbackCodeFiles,
              icon: typeof skill?.icon === "string" && skill.icon.trim()
                ? skill.icon.trim()
                : typeof meta.icon === "string"
                  ? meta.icon
                  : "",
	              isCustom: isCustomSkill,
	              isSystem: isSystemSkill,
	              isDraft,
              statusLabel: isCustomSkill ? "Custom" : "System",
              category: typeof skill?.category === "string" && skill.category.trim() ? skill.category.trim() : "",
              metadata: skillMetadata,
              permissionSet: skill?.permissionSet && typeof skill.permissionSet === "object" && !Array.isArray(skill.permissionSet)
                ? skill.permissionSet
                : null,
              accessControl: skill?.accessControl && typeof skill.accessControl === "object" && !Array.isArray(skill.accessControl)
                ? skill.accessControl
                : null,
              creatorId: explicitCreatorId,
              creatorName,
              creatorAvatarUrl,
              ownerId: typeof skill?.ownerId === "string" ? skill.ownerId : "",
              currentVersionId: typeof skill?.currentVersionId === "string" ? skill.currentVersionId : "",
              publishedVersionId: typeof skill?.publishedVersionId === "string" ? skill.publishedVersionId : "",
              isActive: skill?.isActive !== false,
              createdAt: typeof skill?.createdAt === "string" ? skill.createdAt : "",
              updatedAt: typeof skill?.updatedAt === "string" ? skill.updatedAt : "",
            };
          }, [
            currentUserAvatarUrl,
            currentUserEmail,
            currentUserId,
            currentUserName,
            projectId,
            skillCatalogMetaById,
          ]);
  
          const mergeSkillRecords = useCallback((baseSkill, nextSkill) => {
            const normalizedBase = normalizeSkillRecord(baseSkill);
            const normalizedNext = normalizeSkillRecord(nextSkill);
            if (!normalizedBase) {
              return normalizedNext;
            }
            if (!normalizedNext) {
              return normalizedBase;
            }
  
            return {
              ...normalizedBase,
              ...normalizedNext,
              id: normalizedNext.id || normalizedBase.id,
              systemFamilyId: normalizedNext.systemFamilyId || normalizedBase.systemFamilyId,
              projectId: normalizedNext.projectId || normalizedBase.projectId,
              name: String(normalizedNext.name || "").trim() || normalizedBase.name,
              description: String(normalizedNext.description || "").trim() || normalizedBase.description,
              markdown: String(normalizedNext.markdown || "").trim() || normalizedBase.markdown,
              icon: String(normalizedNext.icon || "").trim() || normalizedBase.icon,
              category: String(normalizedNext.category || "").trim() || normalizedBase.category,
              metadata: {
                ...(normalizedBase.metadata || {}),
                ...(normalizedNext.metadata || {}),
              },
              permissionSet: normalizedNext.permissionSet || normalizedBase.permissionSet || null,
              accessControl: normalizedNext.accessControl || normalizedBase.accessControl || null,
              creatorId: normalizedNext.creatorId || normalizedBase.creatorId,
              creatorName: normalizedNext.creatorName || normalizedBase.creatorName,
              creatorAvatarUrl: normalizedNext.creatorAvatarUrl || normalizedBase.creatorAvatarUrl,
              ownerId: normalizedNext.ownerId || normalizedBase.ownerId,
              currentVersionId: normalizedNext.currentVersionId || normalizedBase.currentVersionId,
              publishedVersionId: normalizedNext.publishedVersionId || normalizedBase.publishedVersionId,
              codeFiles: normalizedNext.codeFiles.length > 0 ? normalizedNext.codeFiles : normalizedBase.codeFiles,
	              isCustom: normalizedBase.isCustom && normalizedNext.isCustom,
	              isSystem: normalizedBase.isSystem || normalizedNext.isSystem,
	              isDraft: normalizedBase.isDraft || normalizedNext.isDraft,
              statusLabel: normalizedBase.isCustom && normalizedNext.isCustom ? "Custom" : "System",
              isActive: normalizedNext.isActive !== false,
              createdAt: normalizedNext.createdAt || normalizedBase.createdAt,
              updatedAt: normalizedNext.updatedAt || normalizedBase.updatedAt,
            };
          }, [normalizeSkillRecord]);
  
          const availableSkillEnvironments = useMemo(() => {
            return (Array.isArray(environments) ? environments : [])
              .filter((environment) => environment?.id)
              .slice()
              .sort((left, right) => {
                if (Boolean(left?.isDefault) !== Boolean(right?.isDefault)) {
                  return left?.isDefault ? -1 : 1;
                }
                return String(left?.name || "").localeCompare(String(right?.name || ""));
              });
          }, [environments]);
  
          useEffect(() => {
            if (availableSkillEnvironments.length === 0) {
              if (skillEnvironmentSelectionId) {
                setSkillEnvironmentSelectionId("");
              }
              return;
            }
            if (availableSkillEnvironments.some((environment) => environment.id === skillEnvironmentSelectionId)) {
              return;
            }
            setSkillEnvironmentSelectionId(availableSkillEnvironments[0].id);
          }, [availableSkillEnvironments, skillEnvironmentSelectionId]);
  
          const fallbackSystemSkills = useMemo(() => {
            const next = [];
            const seen = new Set();
  
            const appendSkill = (skill) => {
              const normalized = normalizeSkillRecord({ ...skill, isSystem: true, isDefault: true });
              if (!normalized || seen.has(normalized.id)) {
                return;
              }
              seen.add(normalized.id);
              next.push(normalized);
            };
  
            (Array.isArray(skills) ? skills : []).forEach((skill) => appendSkill(skill));
            PLAYGROUND_AGENT_SKILL_OPTIONS.forEach((skill) => appendSkill({
              id: skill.id,
              name: skill.label,
              description: skill.description,
            }));
  
            return next;
          }, [normalizeSkillRecord, skills]);
  
          const normalizedLoadedSkills = useMemo(() => {
            return (Array.isArray(loadedSkills) ? loadedSkills : []).filter(Boolean);
          }, [loadedSkills]);
  
          const systemSkills = useMemo(() => {
            const next = [];
            const indexByFamilyId = new Map();
  
            const appendSkill = (skill, { preferExisting = false } = {}) => {
              const normalized = normalizeSkillRecord({ ...skill, isSystem: true, isDefault: true });
              if (!normalized || normalized.isCustom) {
                return;
              }
              const familyId = normalized.systemFamilyId || normalized.id;
              if (indexByFamilyId.has(familyId)) {
                if (preferExisting) {
                  return;
                }
                const existingIndex = indexByFamilyId.get(familyId);
                next[existingIndex] = mergeSkillRecords(next[existingIndex], normalized);
                return;
              }
              indexByFamilyId.set(familyId, next.length);
              next.push(normalized);
            };
  
            fallbackSystemSkills.forEach((skill) => appendSkill(skill, { preferExisting: true }));
            normalizedLoadedSkills
              .filter((skill) => !skill.isCustom)
              .forEach((skill) => appendSkill(skill));
  
            return next;
          }, [fallbackSystemSkills, mergeSkillRecords, normalizeSkillRecord, normalizedLoadedSkills]);
  
          const normalizedCustomSkills = useMemo(() => {
            return normalizedLoadedSkills.filter((skill) => skill.isCustom);
          }, [normalizedLoadedSkills]);
  
          const allSkills = useMemo(() => {
            const next = [];
            const seen = new Set();
            [...systemSkills, ...normalizedCustomSkills].forEach((skill) => {
              if (!skill?.id || seen.has(skill.id)) {
                return;
              }
              seen.add(skill.id);
              next.push(skill);
            });
            return next;
          }, [normalizedCustomSkills, systemSkills]);
  
          const displaySkills = useMemo(() => {
            if (skillListMode === "custom") {
              return normalizedCustomSkills;
            }
            return systemSkills;
          }, [normalizedCustomSkills, skillListMode, systemSkills]);
  
  	        const skillListActionTarget = useMemo(() => {
  	          if (!skillListActionMenuState?.skillId) {
  	            return null;
  	          }
  	          return allSkills.find((skill) => skill.id === skillListActionMenuState.skillId) || null;
  	        }, [allSkills, skillListActionMenuState]);
  
          const selectedSkill = useMemo(() => {
            return allSkills.find((skill) => skill.id === selectedSkillId) || null;
          }, [allSkills, selectedSkillId]);
  
          const selectedSkillSections = useMemo(() => {
            return parsePlaygroundSkillMarkdownSections(selectedSkill?.markdown || "");
          }, [selectedSkill?.markdown]);
  
          useEffect(() => {
            setSkillDetailTab("code");
            setSkillAccessPrincipalId("");
            setSkillAccessRoleId("member");
            setSkillAccessTeamMenuOpen(false);
            setSkillAccessSelectedTeamIds(new Set());
            setSkillVersionsOpen(false);
            setSkillPublishMenuOpen(false);
          }, [selectedSkillId]);
  
          useEffect(() => {
            if (!selectedSkill?.isSystem) {
              return;
            }
            void loadSystemSkillSource(selectedSkill.systemFamilyId || selectedSkill.id);
          }, [loadSystemSkillSource, selectedSkill?.id, selectedSkill?.isSystem, selectedSkill?.systemFamilyId]);
  
          useEffect(() => {
            if (skillDetailTab !== "code") {
              return;
            }
            let cancelled = false;
            void loadPlaygroundCodeEditorModule()
              .then((module) => {
                if (cancelled) {
                  return;
                }
                setSkillCodeEditorComponent(() => module?.default || null);
              })
              .catch(() => {
                if (!cancelled) {
                  setSkillCodeEditorComponent(null);
                }
              });
            return () => {
              cancelled = true;
            };
          }, [skillDetailTab]);

          useEffect(() => {
	            if (!selectedSkill?.id || !selectedSkill.isCustom || selectedSkill.isDraft || skillsPageMode !== "detail") {
              setSkillVersionState({
                skillId: selectedSkill?.id || "",
                status: "idle",
                error: "",
                versions: [],
                currentVersionId: selectedSkill?.currentVersionId || "",
                publishedVersionId: selectedSkill?.publishedVersionId || "",
              });
              return;
            }
            void loadSelectedSkillVersions(selectedSkill);
	          }, [selectedSkill?.id, selectedSkill?.isCustom, selectedSkill?.isDraft, skillsPageMode]);
  
          useEffect(() => {
            const files = normalizeSkillCodeFiles(selectedSkill?.codeFiles);
            const activeFile = files.find((file) => file.id === skillCodeEditorState.fileId) || files[0] || null;
            const nextFileId = activeFile?.id || "";
            const nextValue = activeFile?.content || "";
            if (
              skillCodeEditorState.fileId === nextFileId
              && skillCodeEditorState.value === nextValue
              && skillCodeEditorState.initialValue === nextValue
              && !skillCodeEditorState.isSaving
              && !skillCodeEditorState.error
              && !skillCodeEditorState.message
            ) {
              return;
            }
            setSkillCodeEditorState({
              fileId: nextFileId,
              value: nextValue,
              initialValue: nextValue,
              isSaving: false,
              error: "",
              message: "",
            });
          }, [selectedSkill?.id, selectedSkill?.codeFiles]);
  
          const searchResults = useMemo(() => {
            const query = searchPopupQuery.trim().toLowerCase();
            if (!query) return [];
            return displaySkills
              .filter((skill) => {
                const haystack = [skill?.name || "", skill?.description || "", skill?.id || ""].join(" ").toLowerCase();
                return haystack.includes(query);
              })
              .slice(0, 12);
          }, [displaySkills, searchPopupQuery]);
  
          const selectedSkillProjectId = String(selectedSkill?.projectId || projectId || "__runner_playground__").trim() || "__runner_playground__";
          const baseSkillProjectId = String(projectId || "").trim();
          const selectedSkillEnvironment = useMemo(() => {
            return availableSkillEnvironments.find((environment) => environment.id === skillEnvironmentSelectionId) || null;
          }, [availableSkillEnvironments, skillEnvironmentSelectionId]);
          const isSelectedSkillCodeFilesEditable = Boolean(selectedSkill?.isCustom);
          const isSelectedSkillEditable = Boolean(selectedSkill?.isCustom);
  
          const skillEnvironmentFilePickerExpandedSet = useMemo(() => {
            return new Set(skillEnvironmentFilePickerExpandedFolders);
          }, [skillEnvironmentFilePickerExpandedFolders]);
  
          const skillEnvironmentFilePickerTree = useMemo(() => {
            return buildPlaygroundEnvironmentTree(skillEnvironmentFilePickerInventory);
          }, [skillEnvironmentFilePickerInventory]);
  
          const skillEnvironmentFilePickerRows = useMemo(() => {
            const searchValue = skillEnvironmentFilePickerSearch.trim().toLowerCase();
            if (searchValue) {
              return skillEnvironmentFilePickerInventory
                .filter((entry) => {
                  const haystack = [entry?.name || "", entry?.path || ""].join(" ").toLowerCase();
                  return haystack.includes(searchValue);
                })
                .map((entry) => ({ entry, level: 0, searchMatch: true }));
            }
            return buildPlaygroundEnvironmentVisibleRows(
              skillEnvironmentFilePickerTree,
              "",
              skillEnvironmentFilePickerExpandedSet
            );
          }, [
            skillEnvironmentFilePickerExpandedSet,
            skillEnvironmentFilePickerInventory,
            skillEnvironmentFilePickerSearch,
            skillEnvironmentFilePickerTree,
          ]);
  
          const loadSkills = useCallback(async ({ force = false } = {}) => {
            if (typeof fetchSkills !== "function") {
              setLoadedSkills([]);
              setSkillsLoaded(true);
              setSkillsError("");
              return;
            }
            if (skillsLoading) {
              return;
            }
            if (skillsLoaded && !force) {
              return;
            }
  
            setSkillsLoading(true);
            setSkillsError("");
            try {
              const nextSkills = await fetchSkills();
              const normalizedSkills = (Array.isArray(nextSkills) ? nextSkills : [])
                .map((skill) => normalizeSkillRecord(skill))
                .filter(Boolean);
              setLoadedSkills((current) => {
                const localDraft = current.find((skill) =>
                  skill?.id === PLAYGROUND_CUSTOM_SKILL_DRAFT_ID && skill?.isDraft
                );
                return localDraft
                  ? [localDraft, ...normalizedSkills.filter((skill) => skill.id !== localDraft.id)]
                  : normalizedSkills;
              });
              setSkillsLoaded(true);
            } catch (error) {
              setLoadedSkills((current) =>
                current.filter((skill) =>
                  skill?.id === PLAYGROUND_CUSTOM_SKILL_DRAFT_ID && skill?.isDraft
                )
              );
              setSkillsLoaded(true);
              setSkillsError(error instanceof Error ? error.message : "Failed to load skills.");
            } finally {
              setSkillsLoading(false);
            }
          }, [fetchSkills, normalizeSkillRecord, skillsLoaded, skillsLoading]);
  
          useEffect(() => {
            void loadSkills();
          }, [loadSkills]);
  
          useEffect(() => {
            if (!toolbarPopover) return;
  
            const focusFrame = toolbarPopover === "search"
              ? window.requestAnimationFrame(() => {
                  if (searchPopupInputRef.current) {
                    searchPopupInputRef.current.focus();
                    searchPopupInputRef.current.select();
                  }
                })
              : 0;
  
            function handleKeyDown(event) {
              if (event.key === "Escape") {
                setToolbarPopover("");
              }
            }
  
            window.addEventListener("keydown", handleKeyDown);
            return () => {
              if (focusFrame) {
                window.cancelAnimationFrame(focusFrame);
              }
              window.removeEventListener("keydown", handleKeyDown);
            };
          }, [toolbarPopover]);
  
          useLayoutEffect(() => {
            if (!topNavActionsPortalId || typeof document === "undefined") {
              setTopNavActionsContainer(null);
              return undefined;
            }
            const updateContainer = () => {
              setTopNavActionsContainer(document.getElementById(topNavActionsPortalId));
            };
            updateContainer();
            const frame = window.requestAnimationFrame(updateContainer);
            return () => window.cancelAnimationFrame(frame);
          }, [topNavActionsPortalId]);
  
          useEffect(() => {
            if (!skillActionsPopoverOpen) {
              return undefined;
            }
  
            function handleSkillActionsPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !skillActionsPopoverRef.current || skillActionsPopoverRef.current.contains(target)) {
                return;
              }
              setSkillActionsPopoverOpen(false);
            }
  
            function handleSkillActionsPopoverEscape(event) {
              if (event.key === "Escape") {
                setSkillActionsPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSkillActionsPopoverPointerDown);
            window.addEventListener("keydown", handleSkillActionsPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleSkillActionsPopoverPointerDown);
              window.removeEventListener("keydown", handleSkillActionsPopoverEscape);
            };
          }, [skillActionsPopoverOpen]);
  
          useEffect(() => {
            if (!skillDetailIconPickerOpen) {
              return undefined;
            }
  
            function handleSkillDetailIconPickerPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target || !skillDetailIconPickerRef.current || skillDetailIconPickerRef.current.contains(target)) {
                return;
              }
              setSkillDetailIconPickerOpen(false);
            }
  
            function handleSkillDetailIconPickerEscape(event) {
              if (event.key === "Escape") {
                setSkillDetailIconPickerOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSkillDetailIconPickerPointerDown);
            window.addEventListener("keydown", handleSkillDetailIconPickerEscape);
            return () => {
              document.removeEventListener("mousedown", handleSkillDetailIconPickerPointerDown);
              window.removeEventListener("keydown", handleSkillDetailIconPickerEscape);
            };
          }, [skillDetailIconPickerOpen]);
  
  	        useEffect(() => {
            if (skillsPageMode !== "detail") {
              return;
            }
            if (selectedSkill) {
              return;
            }
            setSkillsPageMode("overview");
          }, [selectedSkill, skillsPageMode]);
          useEffect(() => {
            if (typeof onToolsSkillsHeaderChange !== "function") {
              return;
            }
            onToolsSkillsHeaderChange(
	              skillsPageMode === "detail"
	                ? {
	                    mode: "detail",
	                    title: selectedSkill?.isDraft
	                      ? "New Skill"
	                      : String(selectedSkill?.name || "Skill").trim() || "Skill",
	                    skillId: selectedSkill?.isDraft
	                      ? ""
	                      : String(selectedSkill?.id || selectedSkillId || "").trim(),
	                    activeTab: skillDetailTab,
	                    onTabChange: setSkillDetailTab,
	                    isSystem: selectedSkill?.isSystem === true,
	                    versionNumber: Number(
	                      selectedSkill?.isDraft
	                        ? 0
	                        : skillVersionState.versions.find((version) =>
	                        String(version?.id || "") === String(skillVersionState.currentVersionId || selectedSkill?.currentVersionId || "")
	                      )?.version
	                      || skillVersionState.versions[0]?.version
	                      || (selectedSkill?.isCustom ? 1 : 0)
	                    ),
	                    versionQualifier: selectedSkill?.isDraft
	                      ? "Draft"
	                      : selectedSkill?.isSystem ? "System" : "Latest",
	                    onOpenVersions: selectedSkill?.isDraft
	                      ? undefined
	                      : () => setSkillVersionsOpen(true),
                  }
                : {
                    mode: "overview",
                    title: "",
                    skillId: "",
                  }
            );
          }, [
            onToolsSkillsHeaderChange,
            selectedSkill?.currentVersionId,
	            selectedSkill?.id,
	            selectedSkill?.isCustom,
	            selectedSkill?.isDraft,
	            selectedSkill?.isSystem,
            selectedSkill?.name,
            selectedSkillId,
            skillDetailTab,
            skillVersionState.currentVersionId,
            skillVersionState.versions,
            skillsPageMode,
          ]);
  
          useEffect(() => {
            if (handledBackRequestTokenRef.current === backRequestToken) {
              return;
            }
            handledBackRequestTokenRef.current = backRequestToken;
            if (skillsPageMode === "detail") {
              handleBackToSkillsOverview();
            }
          }, [backRequestToken, skillsPageMode]);
  
          useEffect(() => {
            const requestedAction = String(openSkillRequest?.action || "").trim();
            if (requestedAction === "create") {
              void createAndOpenCustomSkill();
              return;
            }
            const requestedSkillId = String(openSkillRequest?.skillId || "").trim();
            if (!requestedSkillId) {
              return;
            }
            setSkillListMode("system");
            handleSkillSelect(requestedSkillId);
          }, [openSkillRequest?.token, openSkillRequest?.action, openSkillRequest?.skillId]);
  
          useEffect(() => {
            setSkillTitleDraft(String(selectedSkill?.name || ""));
          }, [selectedSkill?.id, selectedSkill?.name]);
  
          useEffect(() => {
            setSkillActionsPopoverOpen(false);
            setSkillRenameState(null);
            setSkillRenameValue("");
            setSkillRenameError("");
            setSkillEditState(null);
            setSkillEditTitleValue("");
            setSkillEditDescriptionValue("");
            setSkillEditError("");
            setSkillSectionEditing({
              description: false,
              usage: false,
              process: false,
              outputFormat: false,
              configuration: false,
              examplePrompts: false,
            });
            setSkillDetailIconPickerOpen(false);
            setSkillSaveState({
              isSaving: false,
              error: "",
            });
          }, [selectedSkill?.id]);
  
          useEffect(() => {
            if (!skillRenameState || !skillRenameInputRef.current) {
              return undefined;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              skillRenameInputRef.current?.focus();
              skillRenameInputRef.current?.select();
            });
  
            function handleSkillRenameEscape(event) {
              if (event.key === "Escape" && !skillSaveState.isSaving) {
                event.preventDefault();
                setSkillRenameState(null);
                setSkillRenameValue("");
                setSkillRenameError("");
              }
            }
  
            window.addEventListener("keydown", handleSkillRenameEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleSkillRenameEscape);
            };
          }, [skillRenameState, skillSaveState.isSaving]);
  
          useEffect(() => {
            if (!skillEditState || !skillEditTitleInputRef.current) {
              return undefined;
            }
  
            const focusFrame = window.requestAnimationFrame(() => {
              skillEditTitleInputRef.current?.focus();
              skillEditTitleInputRef.current?.select();
              resizeSkillTextarea(skillEditDescriptionTextareaRef.current);
            });
  
            function handleSkillEditEscape(event) {
              if (event.key === "Escape" && !skillSaveState.isSaving) {
                event.preventDefault();
                closeSkillEditDialog();
              }
            }
  
            window.addEventListener("keydown", handleSkillEditEscape);
            return () => {
              window.cancelAnimationFrame(focusFrame);
              window.removeEventListener("keydown", handleSkillEditEscape);
            };
          }, [skillEditState, skillSaveState.isSaving]);
  
          function resizeSkillTextarea(textarea) {
            if (!textarea) return;
            const computedStyles = window.getComputedStyle(textarea);
            const lineHeight = Number.parseFloat(computedStyles.lineHeight) || 21;
            const paddingTop = Number.parseFloat(computedStyles.paddingTop) || 0;
            const paddingBottom = Number.parseFloat(computedStyles.paddingBottom) || 0;
            const borderTopWidth = Number.parseFloat(computedStyles.borderTopWidth) || 0;
            const borderBottomWidth = Number.parseFloat(computedStyles.borderBottomWidth) || 0;
            const singleLineHeight = Math.ceil(lineHeight + paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);
            textarea.style.height = "auto";
            const nextHeight = String(textarea.value || "").trim()
              ? Math.max(singleLineHeight, textarea.scrollHeight)
              : singleLineHeight;
            textarea.style.height = nextHeight + "px";
          }
  
          useEffect(() => {
            const textareas = [
              skillDescriptionTextareaRef.current,
              skillUsageTextareaRef.current,
              skillProcessTextareaRef.current,
              skillOutputTextareaRef.current,
              skillConfigurationTextareaRef.current,
              skillExamplesTextareaRef.current,
            ];
            let frameId = 0;
            const timeoutIds = [];
            const scheduleResize = () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              frameId = window.requestAnimationFrame(() => {
                textareas.forEach((textarea) => resizeSkillTextarea(textarea));
              });
            };
            scheduleResize();
            [120, 240].forEach((delay) => {
              timeoutIds.push(window.setTimeout(scheduleResize, delay));
            });
            return () => {
              if (frameId) {
                window.cancelAnimationFrame(frameId);
              }
              timeoutIds.forEach((timeoutId) => window.clearTimeout(timeoutId));
            };
          }, [selectedSkill?.id, selectedSkill?.description, selectedSkill?.markdown]);
  
          useEffect(() => {
            if (!skillEnvironmentFilePickerOpen) {
              return undefined;
            }
  
            if (!selectedSkillEnvironment?.id) {
              setSkillEnvironmentFilePickerInventory([]);
              setSkillEnvironmentFilePickerState({
                status: "error",
                error: "Select an environment before browsing files.",
              });
              return undefined;
            }
  
            const controller = new AbortController();
            setSkillEnvironmentFilePickerState({
              status: "loading",
              error: "",
            });
            setSkillEnvironmentFilePickerSelectedPaths([]);
            setSkillEnvironmentFilePickerExpandedFolders([]);
  
            void fetch(
              buildPlaygroundEnvironmentFilesListUrl(backendUrl, selectedSkillEnvironment.id, "", -1),
              {
                method: "GET",
                headers: requestHeaders,
                signal: controller.signal,
              }
            )
              .then(async (response) => {
                const data = await response.json().catch(() => ({}));
