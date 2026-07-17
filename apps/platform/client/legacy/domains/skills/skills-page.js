        function PlaygroundSkillsPage({
          skills,
          fetchSkills,
          backendUrl,
          requestHeaders,
          environments,
          projectId,
          apiKey,
          upstreamUrl,
          topNavActionsPortalId,
          onToolsSkillsHeaderChange,
          backRequestToken,
          openSkillRequest = null,
          enabledSkillIds = [],
          onSkillsChange = null,
        }) {
          const searchPopupInputRef = useRef(null);
          const skillCodeFileInputRef = useRef(null);
          const skillComposerCodeFileInputRef = useRef(null);
          const skillActionsPopoverRef = useRef(null);
          const skillDetailIconPickerRef = useRef(null);
          const skillDeepResearchModelPopoverRef = useRef(null);
          const skillDeepResearchModelTriggerRef = useRef(null);
          const skillImageGenerationModelPopoverRef = useRef(null);
          const skillImageGenerationModelTriggerRef = useRef(null);
          const skillImageGenerationQualityPopoverRef = useRef(null);
          const skillImageGenerationQualityTriggerRef = useRef(null);
          const skillVideoGenerationModelPopoverRef = useRef(null);
          const skillVideoGenerationModelTriggerRef = useRef(null);
          const skillRenameInputRef = useRef(null);
          const skillEditTitleInputRef = useRef(null);
          const skillEditDescriptionTextareaRef = useRef(null);
          const skillComposerDescriptionTextareaRef = useRef(null);
          function buildPlaygroundDefaultSkillComposerDraft() {
            return {
              name: "New Skill",
              description: "",
              icon: getPlaygroundSkillIconId("code"),
              codeFiles: [],
            };
          }
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
          const [skillComposerOpen, setSkillComposerOpen] = useState(false);
          const [skillComposerDraft, setSkillComposerDraft] = useState(() => buildPlaygroundDefaultSkillComposerDraft());
          const [skillComposerSaveState, setSkillComposerSaveState] = useState({
            isSaving: false,
            error: "",
          });
          const [topNavActionsContainer, setTopNavActionsContainer] = useState(null);
          const [skillsPageMode, setSkillsPageMode] = useState("overview");
          const [skillsOverviewChartTimescale, setSkillsOverviewChartTimescale] = useState("month");
          const [skillDetailTab, setSkillDetailTab] = useState("general");
          const [SkillCodeEditorComponent, setSkillCodeEditorComponent] = useState(null);
          const [skillCodeEditorState, setSkillCodeEditorState] = useState({
            fileId: "",
            value: "",
            initialValue: "",
            isSaving: false,
            error: "",
            message: "",
          });
          const [isSkillComposerDescriptionEditing, setIsSkillComposerDescriptionEditing] = useState(false);
          const [skillComposerIconPickerOpen, setSkillComposerIconPickerOpen] = useState(false);
          const [skillDetailIconPickerOpen, setSkillDetailIconPickerOpen] = useState(false);
          const [isSkillComposerCodeDragging, setIsSkillComposerCodeDragging] = useState(false);
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
          const [skillDeepResearchModelPopoverOpen, setSkillDeepResearchModelPopoverOpen] = useState(false);
          const [skillDeepResearchDefaultModel, setSkillDeepResearchDefaultModel] = useState(() => getDemoDefaultDeepResearchModel(readDemoSettingsPlatformConfig()));
          const [skillImageGenerationModelPopoverOpen, setSkillImageGenerationModelPopoverOpen] = useState(false);
          const [skillImageGenerationDefaultModel, setSkillImageGenerationDefaultModel] = useState(() => getDemoDefaultImageGenerationModel(readDemoSettingsPlatformConfig()));
          const [skillImageGenerationQualityPopoverOpen, setSkillImageGenerationQualityPopoverOpen] = useState(false);
          const [skillImageGenerationDefaultQuality, setSkillImageGenerationDefaultQuality] = useState(() => getDemoDefaultImageGenerationQuality(readDemoSettingsPlatformConfig()));
          const [skillVideoGenerationModelPopoverOpen, setSkillVideoGenerationModelPopoverOpen] = useState(false);
          const [skillVideoGenerationDefaultModel, setSkillVideoGenerationDefaultModel] = useState(() => getDemoDefaultVideoGenerationModel(readDemoSettingsPlatformConfig()));
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
              name: typeof skill?.name === "string" && skill.name.trim()
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
              statusLabel: isCustomSkill ? "Custom" : "System",
              category: typeof skill?.category === "string" && skill.category.trim() ? skill.category.trim() : "",
              isActive: skill?.isActive !== false,
              createdAt: typeof skill?.createdAt === "string" ? skill.createdAt : "",
              updatedAt: typeof skill?.updatedAt === "string" ? skill.updatedAt : "",
            };
          }, [projectId, skillCatalogMetaById]);
  
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
              codeFiles: normalizedNext.codeFiles.length > 0 ? normalizedNext.codeFiles : normalizedBase.codeFiles,
              isCustom: normalizedBase.isCustom && normalizedNext.isCustom,
              isSystem: normalizedBase.isSystem || normalizedNext.isSystem,
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
            setSkillDetailTab("general");
          }, [selectedSkillId]);
  
          useEffect(() => {
            if (!selectedSkill?.isSystem) {
              return;
            }
            void loadSystemSkillSource(selectedSkill.systemFamilyId || selectedSkill.id);
          }, [loadSystemSkillSource, selectedSkill?.id, selectedSkill?.isSystem, selectedSkill?.systemFamilyId]);
  
          useEffect(() => {
            if (skillDetailTab !== "sourceFiles") {
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
              setLoadedSkills(normalizedSkills);
              setSkillsLoaded(true);
            } catch (error) {
              setLoadedSkills([]);
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
  
          useLayoutEffect(() => {
            if (!skillComposerOpen) {
              return;
            }
            resizeSkillTextarea(skillComposerDescriptionTextareaRef.current);
          }, [skillComposerDraft.description, skillComposerOpen]);
  
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
            if (!skillDeepResearchModelPopoverOpen) {
              return undefined;
            }
  
            function handleSkillDeepResearchModelPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target) {
                return;
              }
              if (skillDeepResearchModelPopoverRef.current && skillDeepResearchModelPopoverRef.current.contains(target)) {
                return;
              }
              if (skillDeepResearchModelTriggerRef.current && skillDeepResearchModelTriggerRef.current.contains(target)) {
                return;
              }
              setSkillDeepResearchModelPopoverOpen(false);
            }
  
            function handleSkillDeepResearchModelPopoverEscape(event) {
              if (event.key === "Escape") {
                setSkillDeepResearchModelPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSkillDeepResearchModelPopoverPointerDown);
            window.addEventListener("keydown", handleSkillDeepResearchModelPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleSkillDeepResearchModelPopoverPointerDown);
              window.removeEventListener("keydown", handleSkillDeepResearchModelPopoverEscape);
            };
          }, [skillDeepResearchModelPopoverOpen]);
  
          useEffect(() => {
            if (!skillImageGenerationModelPopoverOpen) {
              return undefined;
            }
  
            function handleSkillImageGenerationModelPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target) {
                return;
              }
              if (skillImageGenerationModelPopoverRef.current && skillImageGenerationModelPopoverRef.current.contains(target)) {
                return;
              }
              if (skillImageGenerationModelTriggerRef.current && skillImageGenerationModelTriggerRef.current.contains(target)) {
                return;
              }
              setSkillImageGenerationModelPopoverOpen(false);
            }
  
            function handleSkillImageGenerationModelPopoverEscape(event) {
              if (event.key === "Escape") {
                setSkillImageGenerationModelPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSkillImageGenerationModelPopoverPointerDown);
            window.addEventListener("keydown", handleSkillImageGenerationModelPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleSkillImageGenerationModelPopoverPointerDown);
              window.removeEventListener("keydown", handleSkillImageGenerationModelPopoverEscape);
            };
          }, [skillImageGenerationModelPopoverOpen]);
  
          useEffect(() => {
            if (!skillImageGenerationQualityPopoverOpen) {
              return undefined;
            }
  
            function handleSkillImageGenerationQualityPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target) {
                return;
              }
              if (skillImageGenerationQualityPopoverRef.current && skillImageGenerationQualityPopoverRef.current.contains(target)) {
                return;
              }
              if (skillImageGenerationQualityTriggerRef.current && skillImageGenerationQualityTriggerRef.current.contains(target)) {
                return;
              }
              setSkillImageGenerationQualityPopoverOpen(false);
            }
  
            function handleSkillImageGenerationQualityPopoverEscape(event) {
              if (event.key === "Escape") {
                setSkillImageGenerationQualityPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSkillImageGenerationQualityPopoverPointerDown);
            window.addEventListener("keydown", handleSkillImageGenerationQualityPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleSkillImageGenerationQualityPopoverPointerDown);
              window.removeEventListener("keydown", handleSkillImageGenerationQualityPopoverEscape);
            };
          }, [skillImageGenerationQualityPopoverOpen]);
  
          useEffect(() => {
            if (!skillVideoGenerationModelPopoverOpen) {
              return undefined;
            }
  
            function handleSkillVideoGenerationModelPopoverPointerDown(event) {
              const target = event?.target instanceof Node ? event.target : null;
              if (!target) {
                return;
              }
              if (skillVideoGenerationModelPopoverRef.current && skillVideoGenerationModelPopoverRef.current.contains(target)) {
                return;
              }
              if (skillVideoGenerationModelTriggerRef.current && skillVideoGenerationModelTriggerRef.current.contains(target)) {
                return;
              }
              setSkillVideoGenerationModelPopoverOpen(false);
            }
  
            function handleSkillVideoGenerationModelPopoverEscape(event) {
              if (event.key === "Escape") {
                setSkillVideoGenerationModelPopoverOpen(false);
              }
            }
  
            document.addEventListener("mousedown", handleSkillVideoGenerationModelPopoverPointerDown);
            window.addEventListener("keydown", handleSkillVideoGenerationModelPopoverEscape);
            return () => {
              document.removeEventListener("mousedown", handleSkillVideoGenerationModelPopoverPointerDown);
              window.removeEventListener("keydown", handleSkillVideoGenerationModelPopoverEscape);
            };
  	        }, [skillVideoGenerationModelPopoverOpen]);
  
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
            const selectedSkillFamilyId = String(selectedSkill?.systemFamilyId || selectedSkill?.id || "").trim().toLowerCase();
            if (selectedSkillFamilyId !== "deep_research" && selectedSkillFamilyId !== "research") {
              return;
            }
            setSkillDeepResearchDefaultModel(getDemoDefaultDeepResearchModel(readDemoSettingsPlatformConfig()));
          }, [selectedSkill?.id, selectedSkill?.systemFamilyId]);
  
          useEffect(() => {
            const selectedSkillFamilyId = String(selectedSkill?.systemFamilyId || selectedSkill?.id || "").trim().toLowerCase();
            if (selectedSkillFamilyId !== "image_generation") {
              return;
            }
            const currentConfig = readDemoSettingsPlatformConfig();
            setSkillImageGenerationDefaultModel(getDemoDefaultImageGenerationModel(currentConfig));
            setSkillImageGenerationDefaultQuality(getDemoDefaultImageGenerationQuality(currentConfig));
          }, [selectedSkill?.id, selectedSkill?.systemFamilyId]);
  
          useEffect(() => {
            const selectedSkillFamilyId = String(selectedSkill?.systemFamilyId || selectedSkill?.id || "").trim().toLowerCase();
            if (selectedSkillFamilyId !== "video_generation") {
              return;
            }
            setSkillVideoGenerationDefaultModel(getDemoDefaultVideoGenerationModel(readDemoSettingsPlatformConfig()));
          }, [selectedSkill?.id, selectedSkill?.systemFamilyId]);
  
          useEffect(() => {
            if (typeof onToolsSkillsHeaderChange !== "function") {
              return;
            }
            onToolsSkillsHeaderChange(
              skillsPageMode === "detail"
                ? {
                    mode: "detail",
                    title: String(selectedSkill?.name || "Skill").trim() || "Skill",
                    skillId: String(selectedSkill?.id || selectedSkillId || "").trim(),
                  }
                : {
                    mode: "overview",
                    title: "",
                    skillId: "",
                  }
            );
          }, [onToolsSkillsHeaderChange, selectedSkill?.id, selectedSkill?.name, selectedSkillId, skillsPageMode]);
  
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
            const requestedSkillId = String(openSkillRequest?.skillId || "").trim();
            if (!requestedSkillId) {
              return;
            }
            setSkillListMode("system");
            handleSkillSelect(requestedSkillId);
          }, [openSkillRequest?.token, openSkillRequest?.skillId]);
  
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
            setSkillImageGenerationModelPopoverOpen(false);
            setSkillImageGenerationQualityPopoverOpen(false);
            setSkillDeepResearchModelPopoverOpen(false);
            setSkillVideoGenerationModelPopoverOpen(false);
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
                if (!response.ok) {
                  throw new Error(data?.message || data?.error || "Failed to load environment files.");
                }
                if (controller.signal.aborted) {
                  return;
                }
                setSkillEnvironmentFilePickerInventory(normalizePlaygroundEnvironmentInventory(data?.files || data?.items || data));
                setSkillEnvironmentFilePickerState({
                  status: "ready",
                  error: "",
                });
              })
              .catch((error) => {
                if (controller.signal.aborted) {
                  return;
                }
                setSkillEnvironmentFilePickerInventory([]);
                setSkillEnvironmentFilePickerState({
                  status: "error",
                  error: error instanceof Error ? error.message : "Failed to load environment files.",
                });
              });
  
            return () => controller.abort();
          }, [backendUrl, requestHeaders, selectedSkillEnvironment?.id, skillEnvironmentFilePickerOpen]);
  
          function toggleToolbarPopover(nextValue) {
            setToolbarPopover((current) => current === nextValue ? "" : nextValue);
          }
  
  	        function openSkillComposer() {
  	          setToolbarPopover("");
  	          setSkillListActionMenuState(null);
  	          setSkillListMode("custom");
            setSkillsPageMode("overview");
            setSkillComposerDraft(buildPlaygroundDefaultSkillComposerDraft());
            setSkillComposerSaveState({
              isSaving: false,
              error: "",
            });
            setSkillCodeFilesTransferState({
              isProcessing: false,
              error: "",
            });
            setIsSkillComposerDescriptionEditing(false);
            setSkillComposerIconPickerOpen(false);
            setIsSkillComposerCodeDragging(false);
            setSkillEnvironmentFilePickerOpen(false);
            setSkillEnvironmentPopoverOpen(false);
            setSkillEnvironmentFilePickerSelectedPaths([]);
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerTarget("detail");
            setSkillComposerOpen(true);
          }
  
          function closeSkillComposer() {
            if (skillComposerSaveState.isSaving) {
              return;
            }
            setSkillComposerOpen(false);
            setSkillComposerDraft(buildPlaygroundDefaultSkillComposerDraft());
            setSkillComposerSaveState({
              isSaving: false,
              error: "",
            });
            setSkillCodeFilesTransferState({
              isProcessing: false,
              error: "",
            });
            setIsSkillComposerDescriptionEditing(false);
            setSkillComposerIconPickerOpen(false);
            setIsSkillComposerCodeDragging(false);
            setSkillEnvironmentFilePickerOpen(false);
            setSkillEnvironmentPopoverOpen(false);
            setSkillEnvironmentFilePickerSelectedPaths([]);
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerTarget("detail");
          }
  
          function updateSkillComposerField(field, value) {
            setSkillComposerDraft((current) => ({
              ...current,
              [field]: value,
            }));
            setSkillComposerSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
  	        function handleSkillSelect(skillId) {
  	          setToolbarPopover("");
  	          setSkillListActionMenuState(null);
  	          setSelectedSkillId(PLAYGROUND_RUNNER_SKILL_ID_ALIASES[String(skillId || "").trim()] || String(skillId || "").trim());
            setSkillsPageMode("detail");
          }
  
          function handleSkillListModeChange(nextMode) {
            const normalizedMode = nextMode === "custom" ? "custom" : "system";
            setSkillListMode(normalizedMode);
  	          setToolbarPopover("");
  	          setSkillListActionMenuState(null);
  	        }
  
          function handleBackToSkillsOverview() {
            setToolbarPopover("");
  	          setSkillActionsPopoverOpen(false);
  	          setSkillDetailIconPickerOpen(false);
  	          setSkillsPageMode("overview");
          }
  
          function closeSkillListActionMenu() {
            setSkillListActionMenuState(null);
          }
  
  	        function getSkillListContextMenuPosition(event, menuHeight = 150) {
  	          const menuWidth = 220;
  	          const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 0;
  	          const viewportHeight = window.innerHeight || document.documentElement?.clientHeight || 0;
  	          const gutter = 12;
  	          const maxLeft = Math.max(gutter, viewportWidth - menuWidth - gutter);
  	          const maxTop = Math.max(gutter, viewportHeight - menuHeight - gutter);
  	          return {
  	            top: Math.max(gutter, Math.min(maxTop, Number(event?.clientY || 0))),
  	            left: Math.max(gutter, Math.min(maxLeft, Number(event?.clientX || 0))),
  	          };
  	        }
  
  	        function getSkillListActionMenuStyle(menuState) {
  	          const menuStyle = {
  	            position: "fixed",
  	            top: Number(menuState?.top || 0) + "px",
  	          };
  	          if (Number.isFinite(menuState?.right)) {
  	            menuStyle.right = Number(menuState.right) + "px";
  	            menuStyle.left = "auto";
  	          } else {
  	            menuStyle.left = Number(menuState?.left || 0) + "px";
  	            menuStyle.right = "auto";
  	          }
  	          return menuStyle;
  	        }
  
  	        function openSkillListActionMenu(event, skill, options = {}) {
  	          if (!skill?.id) {
  	            return;
  	          }
  	          event.preventDefault();
  	          event.stopPropagation();
  	          const menuHeight = skill.isCustom ? 180 : 64;
  	          const position = options?.context
  	            ? getSkillListContextMenuPosition(event, menuHeight)
  	            : getSideActionMenuPosition(event, menuHeight, 220);
  	          setSkillListActionMenuState((current) =>
  	            current?.skillId === skill.id && !options?.context
  	              ? null
  	              : {
  	                  skillId: skill.id,
  	                  skill,
  	                  ...position,
  	                }
  	          );
  	        }
  
          function getPlaygroundSkillIconComponent(skill) {
            const normalizedCustomIcon = String(skill?.icon || "default").trim().toLowerCase();
            const systemSkillFamilyId = String(
              skill?.systemFamilyId
              || getPlaygroundSkillFamilyId(skill?.id)
              || skill?.id
              || ""
            ).trim().toLowerCase();
            if (skill?.isCustom) {
              if (normalizedCustomIcon === "sparkles") return Sparkles;
              if (normalizedCustomIcon === "brain") return Brain;
              if (normalizedCustomIcon === "zap") return Zap;
              if (normalizedCustomIcon === "telescope" || normalizedCustomIcon === "research") return Telescope;
              if (normalizedCustomIcon === "search" || normalizedCustomIcon === "globe") return Globe;
              if (normalizedCustomIcon === "image") return ImageIcon;
              if (normalizedCustomIcon === "code") return Code;
              if (normalizedCustomIcon === "terminal") return Terminal;
              if (normalizedCustomIcon === "file-text") return FileText;
              if (normalizedCustomIcon === "database") return Database;
              if (normalizedCustomIcon === "pen-tool") return PenTool;
              if (normalizedCustomIcon === "palette") return Paintbrush;
              if (normalizedCustomIcon === "slash") return Slash;
              if (normalizedCustomIcon === "message") return MessageSquare;
              if (normalizedCustomIcon === "mail") return Mail;
              if (normalizedCustomIcon === "calendar") return CalendarIcon;
              if (normalizedCustomIcon === "calculator") return Calculator;
              if (normalizedCustomIcon === "shield" || normalizedCustomIcon === "lock") return Shield;
              if (normalizedCustomIcon === "cloud") return Cloud;
              if (normalizedCustomIcon === "server") return Server;
              if (normalizedCustomIcon === "cpu") return Cpu;
              if (normalizedCustomIcon === "git") return GitCommitHorizontal;
              if (normalizedCustomIcon === "package") return Package;
              if (normalizedCustomIcon === "list") return ListTodo;
              return Wand2;
            }
            if (systemSkillFamilyId === "browser") return Globe;
            if (systemSkillFamilyId === "image_generation") return ImageIcon;
            if (systemSkillFamilyId === "video_generation") return Film;
            if (systemSkillFamilyId === "web_search") return Search;
            if (systemSkillFamilyId === "research" || systemSkillFamilyId === "deep_research") return Telescope;
            if (systemSkillFamilyId === "pdf") return FileText;
            if (systemSkillFamilyId === "frontend_design") return Slash;
            if (systemSkillFamilyId === "pptx") return Layers;
            if (systemSkillFamilyId === "memory") return Brain;
            if (systemSkillFamilyId === "task_management") return ListTodo;
            if (systemSkillFamilyId === "app_platform") return Server;
            if (systemSkillFamilyId === "computer_agents") return Cpu;
            if (systemSkillFamilyId === "email") return Mail;
            return Layers;
          }
  
          function renderSkillIcon(skill, className) {
            const systemSkillFamilyId = String(
              skill?.systemFamilyId
              || getPlaygroundSkillFamilyId(skill?.id)
              || skill?.id
              || ""
            ).trim().toLowerCase();
            if (systemSkillFamilyId === "computer_agents") {
              return React.createElement("img", {
                src: RUNNER_TRANSPARENT_LOGO_URL,
                alt: "",
                "aria-hidden": "true",
                draggable: false,
                className,
                style: { objectFit: "contain" },
              });
            }
            const Icon = getPlaygroundSkillIconComponent(skill);
            return React.createElement(Icon, { className, strokeWidth: 1.8 });
          }
  
          function renderSkillFactRow(label, value) {
            return React.createElement("div", { className: "playground-tasks-detail-fact", key: label },
              React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
              React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                React.createElement("div", { className: "playground-environments-editor-fact-value" }, value)
              )
            );
          }
  
          function getSkillDeepResearchModelMeta(modelId) {
            return PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.find((option) => option.id === modelId)
              || PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS[0];
          }
  
          function getSkillImageGenerationModelMeta(modelId) {
            return getPlaygroundImageGenerationModelMeta(modelId);
          }
  
          function getSkillImageGenerationQualityMeta(qualityId) {
            return getPlaygroundImageGenerationQualityMeta(qualityId);
          }
  
          function getSkillVideoGenerationModelMeta(modelId) {
            return getPlaygroundVideoGenerationModelMeta(modelId);
          }
  
          function getSkillImageGenerationCostLabel(modelId, qualityId) {
            const computeTokens = getPlaygroundImageGenerationComputeTokensPerImage(modelId, qualityId);
            return formatSettingsComputeTokens(computeTokens) + " / image";
          }
  
          function renderSkillPopoverMenu(anchorRef, popoverRef, content) {
            if (!content) {
              return null;
            }
            if (typeof document === "undefined" || !document.body) {
              return content;
            }
            const anchorElement = anchorRef?.current;
            if (!anchorElement || typeof anchorElement.getBoundingClientRect !== "function") {
              return content;
            }
            const rect = anchorElement.getBoundingClientRect();
            const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1280;
            const menuWidth = Math.min(320, Math.max(240, rect.width || 280));
            const left = Math.max(20, Math.min(viewportWidth - menuWidth - 20, rect.right - menuWidth));
            const top = rect.bottom + 8;
            return createPortal(
              React.createElement("div", {
                  ref: popoverRef,
                  className: "playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal",
                  style: { top: top + "px", left: left + "px" },
                },
                content
              ),
              document.body
            );
          }
  
          function updateSkillDeepResearchDefaultModel(nextModelId) {
            const normalizedModelId = getSkillDeepResearchModelMeta(nextModelId)?.id || PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                deepResearchModel: normalizedModelId,
              },
            });
            setSkillDeepResearchDefaultModel(normalizedModelId);
            setSkillDeepResearchModelPopoverOpen(false);
          }
  
          function updateSkillImageGenerationDefaultModel(nextModelId) {
            const normalizedModelId = getSkillImageGenerationModelMeta(nextModelId)?.id || PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                imageGenerationModel: normalizedModelId,
              },
            });
            setSkillImageGenerationDefaultModel(normalizedModelId);
            setSkillImageGenerationModelPopoverOpen(false);
          }
  
          function updateSkillImageGenerationDefaultQuality(nextQualityId) {
            const normalizedQualityId = getSkillImageGenerationQualityMeta(nextQualityId)?.id || "medium";
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                imageGenerationQuality: normalizedQualityId,
              },
            });
            setSkillImageGenerationDefaultQuality(normalizedQualityId);
            setSkillImageGenerationQualityPopoverOpen(false);
          }
  
          function updateSkillVideoGenerationDefaultModel(nextModelId) {
            const normalizedModelId = getSkillVideoGenerationModelMeta(nextModelId)?.id || PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS[0].id;
            const currentConfig = readDemoSettingsPlatformConfig();
            writeDemoSettingsPlatformConfig({
              ...currentConfig,
              skills: {
                ...(currentConfig?.skills && typeof currentConfig.skills === "object" ? currentConfig.skills : {}),
                videoGenerationModel: normalizedModelId,
              },
            });
            setSkillVideoGenerationDefaultModel(normalizedModelId);
            setSkillVideoGenerationModelPopoverOpen(false);
          }
  
          function buildPlaygroundSkillCodeFileRecord(name, content, language = "") {
            const normalizedName = String(name || "").trim();
            return {
              id: "code-file-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8),
              name: normalizedName,
              content: typeof content === "string" ? content : "",
              language: language || getPlaygroundCodeEditorLanguage({ path: normalizedName, isDirectory: false, mimeType: "" }) || "plaintext",
            };
          }
  
          function mergePlaygroundSkillCodeFiles(currentCodeFiles, nextCodeFiles) {
            const mergedByName = new Map();
            normalizeSkillCodeFiles(currentCodeFiles).forEach((file) => {
              mergedByName.set(normalizeHistoryPath(file.name).toLowerCase(), file);
            });
            normalizeSkillCodeFiles(nextCodeFiles).forEach((file) => {
              mergedByName.set(normalizeHistoryPath(file.name).toLowerCase(), file);
            });
            return Array.from(mergedByName.values()).sort((left, right) => String(left.name || "").localeCompare(String(right.name || "")));
          }
  
          function applySkillComposerDescriptionSelection(nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            updateSkillComposerField("description", nextValue);
            window.requestAnimationFrame(() => {
              const textarea = skillComposerDescriptionTextareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeSkillTextarea(textarea);
            });
          }
  
          function handleSkillComposerDescriptionFormat(formatType) {
            const textarea = skillComposerDescriptionTextareaRef.current;
            if (!textarea) {
              return;
            }
            const currentValue = String(skillComposerDraft.description || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : currentValue.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildSkillMarkdownListEdit(currentValue, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            applySkillComposerDescriptionSelection(edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          function updateLoadedSkillRecord(skillId, nextSkill) {
            setLoadedSkills((current) => {
              let replaced = false;
              const next = current.map((skill) => {
                if (skill.id !== skillId) {
                  return skill;
                }
                replaced = true;
                return nextSkill;
              });
              return replaced ? next : next.concat(nextSkill);
            });
          }
  
          async function handleSkillComposerSubmit(event) {
            event.preventDefault();
            const nextName = String(skillComposerDraft.name || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setSkillComposerSaveState({
                isSaving: false,
                error: "Skill name cannot be empty.",
              });
              return;
            }
  
            if (!baseSkillProjectId) {
              setSkillComposerSaveState({
                isSaving: false,
                error: "Project scope is unavailable for skill creation.",
              });
              return;
            }
  
            setSkillComposerSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(baseSkillProjectId) + "/skills",
                {
                  method: "POST",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                    ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                  },
                  body: JSON.stringify({
                    name: nextName,
                    description: String(skillComposerDraft.description || ""),
                    markdown: computePlaygroundSkillMarkdownFromSections(nextName, {
                      usage: "Describe when this skill should be invoked...",
                      process: "1. Step one\n2. Step two",
                      outputFormat: "Describe what this skill should return...",
                      configuration: "Add configuration notes here...",
                      examplePrompts: "- Example prompt",
                    }),
                    codeFiles: normalizeSkillCodeFiles(skillComposerDraft.codeFiles).map((file) => ({
                      id: file.id,
                      name: file.name,
                      content: file.content,
                      language: file.language,
                    })),
                    icon: getPlaygroundSkillIconId(skillComposerDraft.icon),
                    category: "custom",
                    isActive: true,
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to create skill.");
              }
  
              const normalizedCreatedSkill = normalizeSkillRecord(data?.skill || {
                id: data?.id,
                projectId: baseSkillProjectId,
                name: nextName,
                description: String(skillComposerDraft.description || ""),
                category: "custom",
                icon: getPlaygroundSkillIconId(skillComposerDraft.icon),
                codeFiles: normalizeSkillCodeFiles(skillComposerDraft.codeFiles),
                isActive: true,
                isSystem: false,
                isDefault: false,
              });
              if (!normalizedCreatedSkill) {
                throw new Error("Skill creation response was empty.");
              }
  
              setLoadedSkills((current) => [normalizedCreatedSkill, ...current.filter((skill) => skill.id !== normalizedCreatedSkill.id)]);
              setSkillListMode("custom");
              setSelectedSkillId(normalizedCreatedSkill.id);
              setSkillsPageMode("detail");
              setSkillComposerOpen(false);
              setSkillComposerDraft(buildPlaygroundDefaultSkillComposerDraft());
              setSkillComposerSaveState({
                isSaving: false,
                error: "",
              });
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: "",
              });
              setIsSkillComposerDescriptionEditing(false);
              setSkillComposerIconPickerOpen(false);
              setIsSkillComposerCodeDragging(false);
              setSkillEnvironmentFilePickerOpen(false);
              setSkillEnvironmentPopoverOpen(false);
              setSkillEnvironmentFilePickerSelectedPaths([]);
              setSkillEnvironmentFilePickerSearch("");
              setSkillEnvironmentFilePickerTarget("detail");
              void loadSkills({ force: true });
            } catch (error) {
              setSkillComposerSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to create skill.",
              });
            }
          }
  
          function updateSelectedSkillLocal(updater) {
            if (!selectedSkill?.id) {
              return;
            }
            setLoadedSkills((current) =>
              current.map((skill) => {
                if (skill.id !== selectedSkill.id) {
                  return skill;
                }
                return typeof updater === "function" ? updater(skill) : updater;
              })
            );
            setSkillSaveState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function closeSkillRenameDialog() {
            setSkillRenameState(null);
            setSkillRenameValue("");
            setSkillRenameError("");
          }
  
          function openSkillRenameDialog(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom) {
              return;
            }
            setSelectedSkillId(targetSkill.id);
            closeSkillListActionMenu();
            setSkillActionsPopoverOpen(false);
            setSkillRenameState({
              skillId: targetSkill.id,
              originalName: String(targetSkill.name || "").trim(),
            });
            setSkillRenameValue(String(targetSkill.name || ""));
            setSkillRenameError("");
          }
  
          function closeSkillEditDialog() {
            setSkillEditState(null);
            setSkillEditTitleValue("");
            setSkillEditDescriptionValue("");
            setSkillEditError("");
          }
  
          function openSkillEditDialog(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom) {
              return;
            }
            setSelectedSkillId(targetSkill.id);
            closeSkillListActionMenu();
            setSkillActionsPopoverOpen(false);
            setSkillEditState({
              skillId: targetSkill.id,
              originalName: String(targetSkill.name || "").trim(),
              originalDescription: String(targetSkill.description || ""),
            });
            setSkillEditTitleValue(String(targetSkill.name || ""));
            setSkillEditDescriptionValue(String(targetSkill.description || ""));
            setSkillEditError("");
          }
  
          async function patchSelectedSkillFields(partial) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              throw new Error("Only custom skills can be updated.");
            }
  
            const response = await fetch(
              "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/" + encodeURIComponent(selectedSkill.id),
              {
                method: "PATCH",
                credentials: "include",
                headers: {
                  "Content-Type": "application/json",
                  ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                  ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                },
                body: JSON.stringify(partial),
              }
            );
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to save skill.");
            }
            const normalizedUpdatedSkill = normalizeSkillRecord(data?.skill || {
              ...selectedSkill,
              ...partial,
            });
            if (normalizedUpdatedSkill) {
              updateLoadedSkillRecord(selectedSkill.id, normalizedUpdatedSkill);
            }
            return normalizedUpdatedSkill;
          }
  
          async function saveSelectedSkillFields(partial) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
  
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              await patchSelectedSkillFields(partial);
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            } catch (error) {
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to save skill.",
              });
            }
          }
  
          function handleSelectedSkillTitleCommit() {
            if (!selectedSkill?.isCustom) {
              return;
            }
            const currentName = String(selectedSkill.name || "").trim();
            const nextName = String(skillTitleDraft || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setSkillTitleDraft(currentName);
              return;
            }
            if (nextName === currentName) {
              setSkillTitleDraft(nextName);
              return;
            }
            updateSelectedSkillLocal((current) => ({
              ...current,
              name: nextName,
            }));
            void saveSelectedSkillFields({
              name: nextName,
            });
          }
  
          function handleSelectedSkillIconChange(iconId) {
            if (!selectedSkill?.isCustom) {
              return;
            }
            const normalizedIconId = getPlaygroundSkillIconId(iconId);
            updateSelectedSkillLocal((current) => ({
              ...current,
              icon: normalizedIconId,
            }));
            setSkillDetailIconPickerOpen(false);
            void saveSelectedSkillFields({
              icon: normalizedIconId,
            });
          }
  
          async function handleSkillRenameSubmit(event) {
            event.preventDefault();
            if (!skillRenameState?.skillId || !selectedSkill?.isCustom) {
              return;
            }
  
            const nextName = String(skillRenameValue || "").trim().replace(/\s+/g, " ");
            if (!nextName) {
              setSkillRenameError("Skill name cannot be empty.");
              return;
            }
  
            if (nextName === skillRenameState.originalName) {
              closeSkillRenameDialog();
              return;
            }
  
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
            setSkillRenameError("");
  
            try {
              await patchSelectedSkillFields({
                name: nextName,
              });
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
              closeSkillRenameDialog();
            } catch (error) {
              setSkillRenameError(error instanceof Error ? error.message : "Failed to rename skill.");
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            }
          }
  
          async function handleSkillEditSubmit(event) {
            event.preventDefault();
            if (!skillEditState?.skillId || !selectedSkill?.isCustom) {
              return;
            }
  
            const nextName = String(skillEditTitleValue || "").trim().replace(/\s+/g, " ");
            const nextDescription = String(skillEditDescriptionValue || "");
            if (!nextName) {
              setSkillEditError("Skill title cannot be empty.");
              return;
            }
  
            if (
              nextName === skillEditState.originalName
              && nextDescription === skillEditState.originalDescription
            ) {
              closeSkillEditDialog();
              return;
            }
  
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
            setSkillEditError("");
  
            try {
              await patchSelectedSkillFields({
                name: nextName,
                description: nextDescription,
              });
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
              closeSkillEditDialog();
            } catch (error) {
              setSkillEditError(error instanceof Error ? error.message : "Failed to save skill.");
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            }
          }
  
          async function handleDeleteSelectedSkill(targetSkill = selectedSkill) {
            if (!targetSkill?.id || !targetSkill.isCustom) {
              return;
            }
            setSelectedSkillId(targetSkill.id);
            closeSkillListActionMenu();
            if (!window.confirm("Delete this skill?")) {
              return;
            }
  
            const deletingSkillId = targetSkill.id;
            const nextSelectedCustomSkillId = normalizedCustomSkills.find((skill) => skill.id !== deletingSkillId)?.id || "";
            setSkillSaveState({
              isSaving: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/" + encodeURIComponent(deletingSkillId),
                {
                  method: "DELETE",
                  credentials: "include",
                  headers: {
                    ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                    ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                  },
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to delete skill.");
              }
  
              setLoadedSkills((current) => current.filter((skill) => skill.id !== deletingSkillId));
              setSelectedSkillId(nextSelectedCustomSkillId);
              if (!nextSelectedCustomSkillId) {
                setSkillsPageMode("overview");
              }
              setSkillActionsPopoverOpen(false);
              closeSkillRenameDialog();
              setSkillSaveState({
                isSaving: false,
                error: "",
              });
            } catch (error) {
              setSkillSaveState({
                isSaving: false,
                error: error instanceof Error ? error.message : "Failed to delete skill.",
              });
            }
          }
  
          function getSkillTextareaRef(sectionId) {
            if (sectionId === "description") return skillDescriptionTextareaRef;
            if (sectionId === "usage") return skillUsageTextareaRef;
            if (sectionId === "process") return skillProcessTextareaRef;
            if (sectionId === "outputFormat") return skillOutputTextareaRef;
            if (sectionId === "configuration") return skillConfigurationTextareaRef;
            return skillExamplesTextareaRef;
          }
  
          function applySkillMarkdownSelection(sectionId, nextValue, nextSelectionStart, nextSelectionEnd = nextSelectionStart) {
            const textareaRef = getSkillTextareaRef(sectionId);
            if (sectionId === "description") {
              updateSelectedSkillLocal((current) => ({
                ...current,
                description: nextValue,
              }));
            } else {
              updateSelectedSkillLocal((current) => {
                const currentSections = parsePlaygroundSkillMarkdownSections(current?.markdown || "");
                const nextSections = {
                  ...currentSections,
                  [sectionId]: nextValue,
                };
                return {
                  ...current,
                  markdown: computePlaygroundSkillMarkdownFromSections(current?.name || "Skill", nextSections),
                };
              });
            }
  
            window.requestAnimationFrame(() => {
              const textarea = textareaRef.current;
              if (!textarea) {
                return;
              }
              const maxLength = nextValue.length;
              const safeSelectionStart = Math.max(0, Math.min(nextSelectionStart, maxLength));
              const safeSelectionEnd = Math.max(safeSelectionStart, Math.min(nextSelectionEnd, maxLength));
              textarea.focus();
              textarea.setSelectionRange(safeSelectionStart, safeSelectionEnd);
              resizeSkillTextarea(textarea);
            });
          }
  
          function buildWrappedSkillMarkdownEdit(value, selectionStart, selectionEnd, prefix, suffix = prefix) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const selectedText = value.slice(safeStart, safeEnd);
            if (safeStart !== safeEnd) {
              if (
                selectedText.startsWith(prefix)
                && selectedText.endsWith(suffix)
                && selectedText.length >= prefix.length + suffix.length
              ) {
                const unwrappedText = selectedText.slice(prefix.length, selectedText.length - suffix.length);
                return {
                  value: value.slice(0, safeStart) + unwrappedText + value.slice(safeEnd),
                  selectionStart: safeStart,
                  selectionEnd: safeStart + unwrappedText.length,
                };
              }
  
              const surroundingPrefix = value.slice(Math.max(0, safeStart - prefix.length), safeStart);
              const surroundingSuffix = value.slice(safeEnd, safeEnd + suffix.length);
              if (surroundingPrefix === prefix && surroundingSuffix === suffix) {
                return {
                  value: value.slice(0, safeStart - prefix.length) + selectedText + value.slice(safeEnd + suffix.length),
                  selectionStart: safeStart - prefix.length,
                  selectionEnd: safeStart - prefix.length + selectedText.length,
                };
              }
  
              const wrappedText = prefix + selectedText + suffix;
              return {
                value: value.slice(0, safeStart) + wrappedText + value.slice(safeEnd),
                selectionStart: safeStart + prefix.length,
                selectionEnd: safeStart + prefix.length + selectedText.length,
              };
            }
  
            const insertedText = prefix + suffix;
            return {
              value: value.slice(0, safeStart) + insertedText + value.slice(safeEnd),
              selectionStart: safeStart + prefix.length,
              selectionEnd: safeStart + prefix.length,
            };
          }
  
          function buildSkillMarkdownListEdit(value, selectionStart, selectionEnd) {
            const safeStart = Math.max(0, selectionStart);
            const safeEnd = Math.max(safeStart, selectionEnd);
            const lineStart = value.lastIndexOf("\n", Math.max(0, safeStart - 1)) + 1;
            let lineEnd = value.indexOf("\n", safeEnd);
            if (lineEnd === -1) {
              lineEnd = value.length;
            }
            const block = value.slice(lineStart, lineEnd);
            const lines = block.split("\n");
            const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
            const shouldRemoveList = nonEmptyLines.length > 0 && nonEmptyLines.every((line) => /^(\s*)-\s+/.test(line));
            const nextLines = lines.map((line) => {
              if (!line.trim()) {
                return shouldRemoveList ? line : "- ";
              }
              if (shouldRemoveList) {
                return line.replace(/^(\s*)-\s+/, "$1");
              }
              if (/^(\s*)-\s+/.test(line)) {
                return line;
              }
              return line.replace(/^(\s*)/, "$1- ");
            });
            const nextBlock = nextLines.join("\n");
            const collapsedSelection = safeStart === safeEnd;
            const nextCaretOffset = shouldRemoveList
              ? Math.max(0, safeStart - lineStart - 2)
              : safeStart - lineStart + 2;
            return {
              value: value.slice(0, lineStart) + nextBlock + value.slice(lineEnd),
              selectionStart: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart,
              selectionEnd: collapsedSelection ? lineStart + Math.max(0, nextCaretOffset) : lineStart + nextBlock.length,
            };
          }
  
          function handleSkillMarkdownFormat(sectionId, formatType) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
            const textareaRef = getSkillTextareaRef(sectionId);
            const textarea = textareaRef.current;
            if (!textarea) {
              return;
            }
  
            const currentValue = sectionId === "description"
              ? String(selectedSkill.description || "")
              : String(selectedSkillSections?.[sectionId] || "");
            const selectionStart = typeof textarea.selectionStart === "number" ? textarea.selectionStart : currentValue.length;
            const selectionEnd = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : selectionStart;
            let edit = null;
            if (formatType === "bold") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "**");
            } else if (formatType === "italic") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "*");
            } else if (formatType === "underline") {
              edit = buildWrappedSkillMarkdownEdit(currentValue, selectionStart, selectionEnd, "++");
            } else if (formatType === "list") {
              edit = buildSkillMarkdownListEdit(currentValue, selectionStart, selectionEnd);
            }
  
            if (!edit) {
              return;
            }
  
            setSkillSectionEditing((current) => ({
              ...current,
              [sectionId]: true,
            }));
            applySkillMarkdownSelection(sectionId, edit.value, edit.selectionStart, edit.selectionEnd);
          }
  
          async function saveSelectedSkillCodeFiles(nextCodeFiles) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return false;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const response = await fetch(
                "/api/aios/projects/" + encodeURIComponent(selectedSkillProjectId) + "/skills/" + encodeURIComponent(selectedSkill.id),
                {
                  method: "PATCH",
                  credentials: "include",
                  headers: {
                    "Content-Type": "application/json",
                    ...(apiKey && String(apiKey).trim() ? { "X-API-Key": String(apiKey).trim() } : {}),
                    ...(upstreamUrl ? { "X-Runner-Upstream-Url": upstreamUrl } : {}),
                  },
                  body: JSON.stringify({
                    codeFiles: normalizeSkillCodeFiles(nextCodeFiles).map((file) => ({
                      id: file.id,
                      name: file.name,
                      content: file.content,
                      language: file.language,
                    })),
                  }),
                }
              );
              const data = await response.json().catch(() => ({}));
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to save skill code files.");
              }
  
              const normalizedUpdatedSkill = normalizeSkillRecord(data?.skill || {
                ...selectedSkill,
                codeFiles: nextCodeFiles,
              });
              if (normalizedUpdatedSkill) {
                updateLoadedSkillRecord(selectedSkill.id, normalizedUpdatedSkill);
              }
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: "",
              });
              return true;
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to save skill code files.",
              });
              return false;
            }
          }
  
          async function handleSkillCodeFileSelection(fileList) {
            if (!selectedSkill || !selectedSkill.isCustom || !fileList?.length) {
              return;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const nextFiles = await Promise.all(
                Array.from(fileList).map(async (file) => {
                  const content = await file.text();
                  return buildPlaygroundSkillCodeFileRecord(file.name, content);
                })
              );
              const mergedFiles = mergePlaygroundSkillCodeFiles(selectedSkill.codeFiles, nextFiles);
              await saveSelectedSkillCodeFiles(mergedFiles);
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to add code files.",
              });
            }
          }
  
          async function handleSkillComposerCodeFileSelection(fileList) {
            if (!fileList?.length) {
              return;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const nextFiles = await Promise.all(
                Array.from(fileList).map(async (file) => {
                  const content = await file.text();
                  return buildPlaygroundSkillCodeFileRecord(file.name, content);
                })
              );
              setSkillComposerDraft((current) => ({
                ...(current || buildPlaygroundDefaultSkillComposerDraft()),
                codeFiles: mergePlaygroundSkillCodeFiles(current?.codeFiles || [], nextFiles),
              }));
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: "",
              });
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to add code files.",
              });
            }
          }
  
          async function handleSkillCodeFileInputChange(event) {
            try {
              await handleSkillCodeFileSelection(event.target.files);
            } finally {
              if (event.target) {
                event.target.value = "";
              }
            }
          }
  
          async function handleSkillComposerCodeFileInputChange(event) {
            try {
              await handleSkillComposerCodeFileSelection(event.target.files);
            } finally {
              if (event.target) {
                event.target.value = "";
              }
            }
          }
  
          async function handleSkillCodeFileDrop(event) {
            event.preventDefault();
            setIsSkillCodeDragging(false);
            if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) {
              return;
            }
            await handleSkillCodeFileSelection(event.dataTransfer?.files);
          }
  
          async function handleSkillComposerCodeFileDrop(event) {
            event.preventDefault();
            setIsSkillComposerCodeDragging(false);
            if (skillCodeFilesTransferState.isProcessing) {
              return;
            }
            await handleSkillComposerCodeFileSelection(event.dataTransfer?.files);
          }
  
          async function handleAttachSkillEnvironmentFiles() {
            const isComposerTarget = skillEnvironmentFilePickerTarget === "composer";
            if (!selectedSkillEnvironment?.id || (!isComposerTarget && (!selectedSkill || !selectedSkill.isCustom))) {
              return;
            }
  
            const selectedEntries = skillEnvironmentFilePickerInventory.filter((entry) =>
              !entry.isFolder && skillEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
            );
            if (selectedEntries.length === 0) {
              return;
            }
  
            setSkillCodeFilesTransferState({
              isProcessing: true,
              error: "",
            });
  
            try {
              const nextCodeFiles = await Promise.all(
                selectedEntries.map(async (entry) => {
                  const response = await fetch(
                    buildPlaygroundEnvironmentDownloadUrl(backendUrl, selectedSkillEnvironment.id, entry.path),
                    {
                      method: "GET",
                      headers: requestHeaders,
                    }
                  );
                  if (!response.ok) {
                    const text = await response.text().catch(() => "");
                    throw new Error(text || ("Failed to load " + entry.name));
                  }
                  const content = await response.text();
                  return buildPlaygroundSkillCodeFileRecord(entry.path, content);
                })
              );
              if (isComposerTarget) {
                setSkillComposerDraft((current) => ({
                  ...(current || buildPlaygroundDefaultSkillComposerDraft()),
                  codeFiles: mergePlaygroundSkillCodeFiles(current?.codeFiles || [], nextCodeFiles),
                }));
                setSkillCodeFilesTransferState({
                  isProcessing: false,
                  error: "",
                });
              } else {
                const mergedFiles = mergePlaygroundSkillCodeFiles(selectedSkill.codeFiles, nextCodeFiles);
                await saveSelectedSkillCodeFiles(mergedFiles);
              }
              setSkillEnvironmentFilePickerOpen(false);
              setSkillEnvironmentPopoverOpen(false);
              setSkillEnvironmentFilePickerSelectedPaths([]);
              setSkillEnvironmentFilePickerSearch("");
              setSkillEnvironmentFilePickerTarget("detail");
            } catch (error) {
              setSkillCodeFilesTransferState({
                isProcessing: false,
                error: error instanceof Error ? error.message : "Failed to add environment files.",
              });
            }
          }
  
          function handleRemoveSkillCodeFile(codeFileId) {
            if (!selectedSkill || !selectedSkill.isCustom) {
              return;
            }
            const nextCodeFiles = normalizeSkillCodeFiles(selectedSkill.codeFiles).filter((file) => file.id !== codeFileId);
            void saveSelectedSkillCodeFiles(nextCodeFiles);
          }
  
          function handleRemoveSkillComposerCodeFile(codeFileId) {
            setSkillComposerDraft((current) => ({
              ...(current || buildPlaygroundDefaultSkillComposerDraft()),
              codeFiles: normalizeSkillCodeFiles(current?.codeFiles).filter((file) => file.id !== codeFileId),
            }));
            setSkillCodeFilesTransferState((current) => ({
              ...current,
              error: "",
            }));
          }
  
          function openSkillCodeFilePicker() {
            if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) {
              return;
            }
            skillCodeFileInputRef.current?.click?.();
          }
  
          function openSkillEnvironmentFilePicker() {
            if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing || availableSkillEnvironments.length === 0) {
              return;
            }
            setSkillEnvironmentFilePickerTarget("detail");
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerOpen(true);
          }
  
          function openSkillComposerEnvironmentFilePicker() {
            if (skillCodeFilesTransferState.isProcessing || availableSkillEnvironments.length === 0) {
              return;
            }
            setSkillEnvironmentFilePickerTarget("composer");
            setSkillEnvironmentFilePickerSearch("");
            setSkillEnvironmentFilePickerOpen(true);
          }
  
          function toggleSkillEnvironmentFileSelection(path) {
            const normalizedPath = normalizeHistoryPath(path);
            setSkillEnvironmentFilePickerSelectedPaths((current) => {
              if (current.includes(normalizedPath)) {
                return current.filter((value) => value !== normalizedPath);
              }
              return current.concat(normalizedPath);
            });
          }
  
          function toggleSkillEnvironmentFileFolder(path) {
            const normalizedPath = normalizeHistoryPath(path);
            setSkillEnvironmentFilePickerExpandedFolders((current) =>
              current.includes(normalizedPath)
                ? current.filter((value) => value !== normalizedPath)
                : current.concat(normalizedPath)
            );
          }
  
          function renderSkillMarkdownSection({ sectionId, title, content, emptyLabel }) {
            const textareaRef = getSkillTextareaRef(sectionId);
            const isEditing = Boolean(skillSectionEditing[sectionId]);
            const canEdit = isSelectedSkillEditable;
  
            return React.createElement("div", { className: "playground-tasks-detail-description playground-environments-editor-description", key: sectionId },
              React.createElement("div", { className: "playground-tasks-detail-section-header" },
                React.createElement("div", { className: "playground-tasks-detail-section-title" }, title),
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
                      disabled: !canEdit,
                      onMouseDown: (event) => event.preventDefault(),
                      onClick: () => handleSkillMarkdownFormat(sectionId, action.id),
                    }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                  )
                )
              ),
              React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isEditing ? " is-editing" : " is-preview") },
                React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                  String(content || "").trim()
                    ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                        content: content,
                        className: "playground-tasks-detail-description-preview tb-message-markdown",
                      })
                    : React.createElement("div", {
                        className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                      }, emptyLabel)
                ),
                React.createElement("textarea", {
                  ref: textareaRef,
                  className: "playground-tasks-detail-description-input " + (isEditing ? "is-editing" : "is-preview"),
                  rows: 1,
                  placeholder: isEditing ? emptyLabel : "",
                  value: content || "",
                  readOnly: !canEdit,
                  onFocus: () => {
                    if (!canEdit) {
                      return;
                    }
                    setSkillSectionEditing((current) => ({
                      ...current,
                      [sectionId]: true,
                    }));
                  },
                  onChange: (event) => {
                    const nextValue = event.target.value;
                    if (sectionId === "description") {
                      updateSelectedSkillLocal((current) => ({
                        ...current,
                        description: nextValue,
                      }));
                    } else {
                      updateSelectedSkillLocal((current) => {
                        const currentSections = parsePlaygroundSkillMarkdownSections(current?.markdown || "");
                        const nextSections = {
                          ...currentSections,
                          [sectionId]: nextValue,
                        };
                        return {
                          ...current,
                          markdown: computePlaygroundSkillMarkdownFromSections(current?.name || "Skill", nextSections),
                        };
                      });
                    }
                    resizeSkillTextarea(event.currentTarget);
                  },
                  onBlur: (event) => {
                    setSkillSectionEditing((current) => ({
                      ...current,
                      [sectionId]: false,
                    }));
                    if (!canEdit) {
                      return;
                    }
                    if (sectionId === "description") {
                      void saveSelectedSkillFields({
                        description: event.currentTarget.value,
                      });
                      return;
                    }
                    const nextSections = {
                      ...parsePlaygroundSkillMarkdownSections(selectedSkill?.markdown || ""),
                      [sectionId]: event.currentTarget.value,
                    };
                    void saveSelectedSkillFields({
                      markdown: computePlaygroundSkillMarkdownFromSections(selectedSkill?.name || "Skill", nextSections),
                    });
                  },
                })
              )
            );
          }
  
          function renderSkillCodeFileChip(codeFile, options = {}) {
            const removable = options?.removable !== false;
            const onRemove = typeof options?.onRemove === "function" ? options.onRemove : null;
            return React.createElement("div", {
                key: codeFile.id,
                className: "runner-attachment runner-attachment-file",
              },
              React.createElement("div", {
                className: "runner-attachment-file-button",
                title: codeFile.name,
              },
                React.createElement("span", { className: "runner-attachment-file-icon-slot", "aria-hidden": "true" },
                  React.createElement("img", {
                    src: PLAYGROUND_TEXT_FILE_ICON_URL,
                    alt: "",
                    draggable: false,
                    className: "runner-attachment-file-icon",
                  })
                ),
                React.createElement("div", { className: "runner-attachment-file-name" }, codeFile.name)
              ),
              removable && onRemove
                ? React.createElement("button", {
                    type: "button",
                    className: "runner-attachment-remove runner-attachment-remove-file",
                    onClick: (event) => {
                      event.stopPropagation();
                      onRemove(codeFile.id);
                    },
                    "aria-label": "Remove " + codeFile.name,
                  }, React.createElement(X, { className: "runner-attachment-remove-icon", strokeWidth: 2 }))
                : null
            );
          }
  
          function renderSkillEnvironmentFilePickerIcon(entry) {
            if (entry?.isFolder) {
              return React.createElement("img", {
                src: PLAYGROUND_FOLDER_ICON_URL,
                alt: "",
                draggable: false,
                className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
              });
            }
            return React.createElement("img", {
              src: PLAYGROUND_TEXT_FILE_ICON_URL,
              alt: "",
              draggable: false,
              className: "tb-file-browser-item-icon tb-file-browser-icon-asset",
            });
          }
  
          function renderSkillEnvironmentFilePickerRow(row) {
            const entry = row.entry;
            const normalizedPath = normalizeHistoryPath(entry.path);
            const isSelected = skillEnvironmentFilePickerSelectedPaths.includes(normalizedPath);
            const isExpanded = skillEnvironmentFilePickerExpandedFolders.includes(normalizedPath);
            const metaValue = row.searchMatch
              ? getPlaygroundEntryParentPath(normalizedPath) || "Root"
              : formatPlaygroundFileDate(entry.modifiedTime || entry.createdTime);
  
            return React.createElement("div", { key: normalizedPath || entry.id },
              React.createElement("div", {
                className: "tb-file-browser-item" + (isSelected ? " selected" : ""),
                role: "button",
                tabIndex: 0,
                onClick: () => {
                  if (entry.isFolder && !row.searchMatch) {
                    toggleSkillEnvironmentFileFolder(normalizedPath);
                    return;
                  }
                  toggleSkillEnvironmentFileSelection(normalizedPath);
                },
                onKeyDown: (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    if (entry.isFolder && !row.searchMatch) {
                      toggleSkillEnvironmentFileFolder(normalizedPath);
                      return;
                    }
                    toggleSkillEnvironmentFileSelection(normalizedPath);
                  }
                },
                style: row.searchMatch ? undefined : { paddingLeft: String(12 + row.level * 20) + "px" },
              },
                entry.isFolder && !row.searchMatch
                  ? React.createElement("button", {
                      type: "button",
                      className: "tb-file-browser-item-leading",
                      onClick: (event) => {
                        event.stopPropagation();
                        toggleSkillEnvironmentFileFolder(normalizedPath);
                      },
                    },
                      isExpanded
                        ? React.createElement(ChevronDown, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                        : React.createElement(ChevronRight, { className: "tb-file-browser-folder-chevron", strokeWidth: 1.75 })
                    )
                  : React.createElement("div", {
                      className: "tb-file-browser-check" + (isSelected ? " selected" : ""),
                      onClick: (event) => {
                        event.stopPropagation();
                        toggleSkillEnvironmentFileSelection(normalizedPath);
                      },
                    },
                      isSelected ? React.createElement(Check, { className: "tb-file-browser-check-icon", strokeWidth: 2.2 }) : null
                    ),
                renderSkillEnvironmentFilePickerIcon(entry),
                React.createElement("span", { className: "tb-file-browser-item-name", title: entry.name }, entry.name),
                React.createElement("span", { className: "tb-file-browser-item-meta", title: metaValue }, metaValue || "-"),
                React.createElement("span", { className: "tb-file-browser-item-size" }, entry.isFolder ? "" : formatPlaygroundFileSize(entry.size))
              )
            );
          }
  
          function renderSkillEnvironmentFilePicker() {
            if (!skillEnvironmentFilePickerOpen) {
              return null;
            }
  
            const selectedFilesCount = skillEnvironmentFilePickerInventory.filter((entry) =>
              !entry.isFolder && skillEnvironmentFilePickerSelectedPaths.includes(normalizeHistoryPath(entry.path))
            ).length;
  
            return React.createElement("div", { className: "tb-runner-chat" },
              React.createElement(PlatformModalBackdrop, {
                className: "tb-file-browser-scrim",
                onClick: () => {
                  setSkillEnvironmentFilePickerOpen(false);
                  setSkillEnvironmentPopoverOpen(false);
                },
              },
                React.createElement(PlatformModalSurface, {
                  className: "tb-file-browser-modal",
                  onClick: (event) => event.stopPropagation(),
                },
                  React.createElement("div", { className: "tb-file-browser-main" },
                    React.createElement("div", { className: "tb-file-browser-header" },
                      React.createElement("button", {
                        type: "button",
                        className: "tb-file-browser-nav-button",
                        onClick: () => {
                          setSkillEnvironmentFilePickerOpen(false);
                          setSkillEnvironmentPopoverOpen(false);
                        },
                        "aria-label": "Close environment files",
                      }, React.createElement(X, { className: "tb-file-browser-nav-icon", strokeWidth: 1.9 })),
                      React.createElement("div", { className: "tb-file-browser-header-icon" },
                        React.createElement(Cloud, { className: "tb-file-browser-source-icon", strokeWidth: 1.75 })
                      ),
                      React.createElement("div", { className: "tb-file-browser-breadcrumbs" },
                        availableSkillEnvironments.length > 1
                          ? React.createElement("div", {
                              className: "playground-environments-runtime-popup-shell playground-tasks-toolbar-popup-shell" + (skillEnvironmentPopoverOpen ? " is-open" : ""),
                            },
                              React.createElement("button", {
                                type: "button",
                                className: "playground-environments-runtime-value-button",
                                onClick: () => setSkillEnvironmentPopoverOpen((current) => !current),
                              },
                                React.createElement("span", { className: "playground-environments-runtime-value-label" }, selectedSkillEnvironment?.name || "Environment"),
                                React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                              ),
                              skillEnvironmentPopoverOpen
                                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                                    availableSkillEnvironments.map((environment) =>
                                      React.createElement("button", {
                                          key: environment.id,
                                          type: "button",
                                          className: "tb-popup-row tb-popup-row-select" + (environment.id === skillEnvironmentSelectionId ? " selected" : ""),
                                          onClick: () => {
                                            setSkillEnvironmentSelectionId(environment.id);
                                            setSkillEnvironmentPopoverOpen(false);
                                          },
                                        },
                                          React.createElement("span", { className: "tb-popup-check-slot" },
                                            environment.id === skillEnvironmentSelectionId
                                              ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                              : null
                                          ),
                                          React.createElement("span", null, environment.name || "Environment")
                                        )
                                    )
                                  )
                                : null
                            )
                          : React.createElement("span", { className: "tb-file-browser-breadcrumb-chip" },
                              React.createElement("span", { className: "tb-file-browser-breadcrumb active" }, selectedSkillEnvironment?.name || "Environment")
                            )
                      ),
                      React.createElement("div", { className: "tb-file-browser-count" }, selectedFilesCount + (selectedFilesCount === 1 ? " file selected" : " files selected"))
                    ),
                    React.createElement("div", { className: "tb-file-browser-search-wrap" },
                      React.createElement("div", { className: "tb-file-browser-search" },
                        React.createElement(Search, { className: "tb-file-browser-search-icon", strokeWidth: 1.9 }),
                        React.createElement("input", {
                          className: "tb-file-browser-search-input",
                          value: skillEnvironmentFilePickerSearch,
                          placeholder: "Search files...",
                          onChange: (event) => setSkillEnvironmentFilePickerSearch(event.target.value),
                        }),
                        skillEnvironmentFilePickerSearch
                          ? React.createElement("button", {
                              type: "button",
                              className: "tb-file-browser-search-clear",
                              onClick: () => setSkillEnvironmentFilePickerSearch(""),
                              "aria-label": "Clear search",
                            }, React.createElement(X, { className: "tb-file-browser-search-clear-icon", strokeWidth: 1.9 }))
                          : null
                      )
                    ),
                    React.createElement("div", { className: "tb-file-browser-list" },
                      skillEnvironmentFilePickerState.status === "loading"
                        ? React.createElement("div", { className: "tb-file-browser-empty" }, "Loading environment files...")
                        : skillEnvironmentFilePickerState.error
                          ? React.createElement("div", { className: "tb-file-browser-empty" }, skillEnvironmentFilePickerState.error)
                          : skillEnvironmentFilePickerRows.length === 0
                            ? React.createElement("div", { className: "tb-file-browser-empty" }, skillEnvironmentFilePickerSearch.trim() ? "No matching files found." : "No files found in this environment.")
                            : React.createElement("div", { className: "tb-file-browser-list-inner" },
                                skillEnvironmentFilePickerRows.map((row) => renderSkillEnvironmentFilePickerRow(row))
                              )
                    )
                  ),
                  React.createElement("div", { className: "tb-file-browser-footer" },
                    React.createElement(PlatformSecondaryButton, {
                      type: "button",
                      className: "tb-file-browser-footer-button tb-file-browser-footer-button-secondary",
                      onClick: () => {
                        setSkillEnvironmentFilePickerOpen(false);
                        setSkillEnvironmentPopoverOpen(false);
                      },
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      type: "button",
                      className: "tb-file-browser-footer-button tb-file-browser-footer-button-primary",
                      onClick: () => void handleAttachSkillEnvironmentFiles(),
                      disabled: selectedFilesCount === 0 || skillCodeFilesTransferState.isProcessing,
                    },
                      React.createElement("span", { className: "tb-file-browser-footer-button-content" },
                        skillCodeFilesTransferState.isProcessing
                          ? React.createElement("span", { className: "runner-spinner tb-file-browser-footer-button-spinner" })
                          : null,
                        React.createElement("span", { className: "tb-file-browser-footer-button-label" },
                          skillCodeFilesTransferState.isProcessing ? "Adding Files..." : "Add Files"
                        )
                      )
                    )
                  )
                )
              )
            );
          }
  
          function renderSkillRenameModal() {
            if (!skillRenameState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!skillSaveState.isSaving) {
                    closeSkillRenameDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleSkillRenameSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Rename Skill"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Choose a new name for this skill."),
                  React.createElement("input", {
                    ref: skillRenameInputRef,
                    className: "sidebar-thread-rename-input",
                    value: skillRenameValue,
                    onChange: (event) => setSkillRenameValue(event.target.value),
                    placeholder: "Skill name",
                    disabled: skillSaveState.isSaving,
                  }),
                  skillRenameError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, skillRenameError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeSkillRenameDialog,
                      disabled: skillSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: skillSaveState.isSaving,
                    }, skillSaveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
          function renderSkillEditModal() {
            if (!skillEditState) {
              return null;
            }
  
            return React.createElement(PlatformModalBackdrop, {
                className: "sidebar-thread-rename-scrim",
                onClick: () => {
                  if (!skillSaveState.isSaving) {
                    closeSkillEditDialog();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                  as: "form",
                  className: "sidebar-thread-rename-modal playground-skills-edit-modal",
                  onClick: (event) => event.stopPropagation(),
                  onSubmit: (event) => {
                    void handleSkillEditSubmit(event);
                  },
                },
                  React.createElement("div", { className: "sidebar-thread-rename-title" }, "Edit Skill"),
                  React.createElement("div", { className: "sidebar-thread-rename-copy" }, "Update the title and description agents see when this skill is available."),
                  React.createElement("label", { className: "playground-skills-edit-field" },
                    React.createElement("span", { className: "playground-skills-edit-label" }, "Title"),
                    React.createElement("input", {
                      ref: skillEditTitleInputRef,
                      className: "sidebar-thread-rename-input playground-skills-edit-title-input",
                      value: skillEditTitleValue,
                      onChange: (event) => {
                        setSkillEditTitleValue(event.target.value);
                        setSkillEditError("");
                      },
                      placeholder: "Skill title",
                      disabled: skillSaveState.isSaving,
                    })
                  ),
                  React.createElement("div", { className: "playground-skills-edit-description" },
                    React.createElement("div", { className: "playground-tasks-detail-section-header" },
                      React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description")
                    ),
                    React.createElement("div", { className: "playground-tasks-detail-description-editor is-editing playground-skills-edit-description-editor" },
                      React.createElement("textarea", {
                        ref: skillEditDescriptionTextareaRef,
                        className: "playground-tasks-detail-description-input is-editing playground-skills-edit-description-input",
                        value: skillEditDescriptionValue,
                        onChange: (event) => {
                          setSkillEditDescriptionValue(event.target.value);
                          setSkillEditError("");
                          resizeSkillTextarea(event.currentTarget);
                        },
                        placeholder: "Describe when this skill should be used.",
                        disabled: skillSaveState.isSaving,
                        rows: 4,
                      })
                    )
                  ),
                  skillEditError
                    ? React.createElement("div", { className: "sidebar-thread-rename-error" }, skillEditError)
                    : null,
                  React.createElement("div", { className: "sidebar-thread-rename-actions" },
                    React.createElement(PlatformSecondaryButton, {
                      size: "large",
                      type: "button",
                      className: "sidebar-thread-rename-button is-secondary",
                      onClick: closeSkillEditDialog,
                      disabled: skillSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "large",
                      type: "submit",
                      className: "sidebar-thread-rename-button is-primary",
                      disabled: skillSaveState.isSaving,
                    }, skillSaveState.isSaving ? "Saving..." : "Save")
                  )
                )
              );
          }
  
  	        function renderSkillListActionMenu() {
  	          if (!skillListActionMenuState || !skillListActionTarget) {
  	            return null;
  	          }
  
  	          const isDeleting = skillSaveState.isSaving && selectedSkillId === skillListActionTarget.id;
  	          const menuElement = React.createElement(PlatformPopupDismissLayer, {
  	              className: "sidebar-thread-popup-scrim",
  	              style: { zIndex: 9000 },
  	              onClick: closeSkillListActionMenu,
  	            },
  	              React.createElement("div", {
  	                className: "playground-platform-popup-shell playground-tasks-toolbar-popup-shell playground-tasks-toolbar-popup-shell-portal playground-agents-list-action-menu-shell is-open",
  	                style: getSkillListActionMenuStyle(skillListActionMenuState),
  	                onClick: (event) => event.stopPropagation(),
  	              },
  	                React.createElement(PlatformPopupSurface, {
  	                    className: "playground-tasks-toolbar-popup-menu playground-platform-popup-menu playground-agents-list-action-menu playground-agents-overview-toolbar-menu playground-tasks-toolbar-popup-menu-animate-down-in",
  	                    role: "menu",
  	                  },
  	                React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row",
  	                  onClick: () => {
  	                    closeSkillListActionMenu();
  	                    handleSkillSelect(skillListActionTarget.id);
  	                  },
  	                },
  	                  React.createElement(ChevronRight, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, "Open"))
  	                ),
  	                skillListActionTarget.isCustom ? React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row",
  	                  onClick: () => openSkillEditDialog(skillListActionTarget),
  	                },
  	                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, "Edit"))
  	                ) : null,
  	                skillListActionTarget.isCustom ? React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row",
  	                  onClick: () => openSkillRenameDialog(skillListActionTarget),
  	                },
  	                  React.createElement(SquarePen, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, "Rename"))
  	                ) : null,
  	                skillListActionTarget.isCustom ? React.createElement("button", {
  	                  type: "button",
  	                  role: "menuitem",
  	                  className: "tb-popup-row is-danger",
  	                  onClick: () => {
  	                    void handleDeleteSelectedSkill(skillListActionTarget);
  	                  },
  	                  disabled: isDeleting,
  	                },
  	                  React.createElement(Trash2, { className: "tb-popup-icon", width: 14, height: 14, strokeWidth: 1.8 }),
  	                  React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" }, React.createElement("span", null, isDeleting ? "Deleting..." : "Delete"))
  	                ) : null
  	                )
  	              )
  	            );
  	          return typeof createPortal === "function" && typeof document !== "undefined" && document.body
  	            ? createPortal(menuElement, document.body)
  	            : menuElement;
  	        }
  
          function renderCurrentSkillDetail() {
            const skillsSearchAction = React.createElement("div", {
                className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-environments-search-shell",
              },
              React.createElement("button", {
                type: "button",
                className: "playground-files-header-icon-button is-plain" + (toolbarPopover === "search" ? " is-active" : ""),
                onClick: () => toggleToolbarPopover("search"),
                title: skillListMode === "custom" ? "Search custom skills" : skillListMode === "system" ? "Search system skills" : "Search skills",
                "aria-label": skillListMode === "custom" ? "Search custom skills" : skillListMode === "system" ? "Search system skills" : "Search skills",
              }, React.createElement(Search, { width: 16, height: 16, strokeWidth: 1.8 })),
              toolbarPopover === "search"
                ? React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-project-search-menu playground-tasks-toolbar-popup-menu-animate-down-in" },
                    React.createElement("div", { className: "playground-tasks-project-search-header" },
                      React.createElement("div", { className: "playground-tasks-project-search-title" }, skillListMode === "custom" ? "Search Custom Skills" : skillListMode === "system" ? "Search System Skills" : "Search Skills"),
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-project-search-close",
                        onClick: () => setToolbarPopover(""),
                      }, React.createElement(X, { strokeWidth: 1.8, width: 14, height: 14 }))
                    ),
                    React.createElement("div", { className: "playground-tasks-project-search-body" },
                      React.createElement("div", { className: "playground-files-search-field" },
                        React.createElement(Search, { className: "playground-files-search-field-icon", strokeWidth: 1.8 }),
                        React.createElement("input", {
                          ref: searchPopupInputRef,
                          type: "text",
                          className: "playground-files-search-field-input",
                          placeholder: skillListMode === "custom"
                            ? "Search custom skills by name or description..."
                            : skillListMode === "system"
                              ? "Search system skills by name or description..."
                              : "Search skills by name or description...",
                          value: searchPopupQuery,
                          onChange: (event) => setSearchPopupQuery(event.target.value),
                        })
                      ),
                      searchPopupQuery.trim()
                        ? searchResults.length > 0
                          ? React.createElement("div", { className: "playground-files-search-results" },
                              searchResults.map((skill) =>
                                React.createElement("button", {
                                    key: skill.id,
                                    type: "button",
                                    className: "playground-files-search-result",
                                    onClick: () => handleSkillSelect(skill.id),
                                  },
                                    renderSkillIcon(skill, "playground-files-entry-icon"),
                                    React.createElement("div", { className: "playground-files-search-result-copy" },
                                      React.createElement("div", { className: "playground-files-search-result-name" }, skill.name || skill.id),
                                      React.createElement("div", { className: "playground-files-search-result-path" }, skill.description || skill.id)
                                    )
                                  )
                              )
                            )
                          : React.createElement("div", { className: "playground-files-search-empty" }, skillListMode === "custom" ? "No matching custom skills found." : skillListMode === "system" ? "No matching system skills found." : "No matching skills found.")
                        : React.createElement("div", { className: "playground-tasks-project-search-hint" }, skillListMode === "custom" ? "Type a custom skill name or description to search." : skillListMode === "system" ? "Type a system skill name or description to search." : "Type a skill name or description to search.")
                    )
                  )
                : null
            );
            const skillsCreateAction = React.createElement("button", {
              type: "button",
              className: "playground-top-nav-private-chat-button playground-skills-top-nav-action-button",
              onClick: openSkillComposer,
              title: "Create custom skill",
              "aria-label": "Create custom skill",
              disabled: skillComposerSaveState.isSaving || !baseSkillProjectId,
            },
              React.createElement(Plus, { width: 14, height: 14, strokeWidth: 1.8 }),
              React.createElement("span", null, "Skill")
            );
            const skillDetailTopNavAction = !selectedSkill || !selectedSkill.isCustom
              ? null
              : React.createElement("button", {
                  type: "button",
                  className: "playground-top-nav-private-chat-button playground-skills-top-nav-action-button",
                  onClick: () => openSkillEditDialog(selectedSkill),
                  title: "Edit skill",
                  "aria-label": "Edit skill",
                  disabled: skillSaveState.isSaving,
                },
                  React.createElement(SquarePen, { width: 14, height: 14, strokeWidth: 1.8 }),
                  React.createElement("span", null, "Edit")
                );
            const skillsTopNavActions = topNavActionsContainer
              ? createPortal(React.createElement(React.Fragment, null,
                  skillsPageMode === "detail" ? skillDetailTopNavAction : null,
                  skillsCreateAction
                ), topNavActionsContainer)
              : null;
  
            if (!selectedSkill) {
              return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main" },
                skillsTopNavActions,
                React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
                  React.createElement("div", { className: "playground-files-state" },
                    skillsLoading
                      ? React.createElement(Loader2, { className: "playground-files-state-loader", strokeWidth: 1.75 })
                      : null,
                    React.createElement("span", null,
                      skillListMode === "custom"
                        ? (skillsLoading ? "Loading skills..." : "Select a skill")
                        : "Select a system skill"
                    )
                  )
                )
              );
            }
  
            const selectedSkillFamilyId = String(selectedSkill.systemFamilyId || selectedSkill.id || "").trim().toLowerCase();
            const selectedSkillToggleId = normalizePlaygroundEnabledSkillIds([selectedSkill.systemFamilyId || selectedSkill.id])[0] || selectedSkillFamilyId;
            const normalizedEnabledSkillIds = normalizePlaygroundEnabledSkillIds(enabledSkillIds);
            const isSelectedSkillEnabled = selectedSkillToggleId
              ? normalizedEnabledSkillIds.includes(selectedSkillToggleId)
              : Boolean(selectedSkill.isActive);
            function handleToggleSelectedSkillEnabled() {
              if (!selectedSkillToggleId || typeof onSkillsChange !== "function") {
                return;
              }
              const currentEnabledSkillIds = normalizePlaygroundEnabledSkillIds(enabledSkillIds);
              const nextEnabledSkillIds = currentEnabledSkillIds.includes(selectedSkillToggleId)
                ? currentEnabledSkillIds.filter((skillId) => skillId !== selectedSkillToggleId)
                : [...currentEnabledSkillIds, selectedSkillToggleId];
              onSkillsChange(nextEnabledSkillIds);
            }
  	          const selectedSkillCodeFiles = normalizeSkillCodeFiles(selectedSkill.codeFiles);
            const activeSkillCodeFile = selectedSkillCodeFiles.find((file) => file.id === skillCodeEditorState.fileId) || selectedSkillCodeFiles[0] || null;
            const activeSkillCodeFileEntry = activeSkillCodeFile
              ? { name: activeSkillCodeFile.name, path: activeSkillCodeFile.name, isFolder: false, mimeType: "" }
              : null;
            const skillCodeEditorIsDirty = skillCodeEditorState.value !== skillCodeEditorState.initialValue;
  
            function selectSkillCodeFile(fileId) {
              const nextFile = selectedSkillCodeFiles.find((file) => file.id === fileId) || selectedSkillCodeFiles[0] || null;
              setSkillCodeEditorState({
                fileId: nextFile?.id || "",
                value: nextFile?.content || "",
                initialValue: nextFile?.content || "",
                isSaving: false,
                error: "",
                message: "",
              });
            }
  
            function handleSkillCodeEditorChange(value) {
              setSkillCodeEditorState((current) => ({
                ...current,
                value: typeof value === "string" ? value : "",
                error: "",
                message: "",
              }));
            }
  
            function handleSkillCodeEditorRevert() {
              setSkillCodeEditorState((current) => ({
                ...current,
                value: current.initialValue,
                error: "",
                message: "",
              }));
            }
  
            async function handleSkillCodeEditorSave() {
              if (!activeSkillCodeFile || !isSelectedSkillCodeFilesEditable || !skillCodeEditorIsDirty) {
                return;
              }
              setSkillCodeEditorState((current) => ({
                ...current,
                isSaving: true,
                error: "",
                message: "",
              }));
              const nextFiles = selectedSkillCodeFiles.map((file) =>
                file.id === activeSkillCodeFile.id
                  ? {
                      ...file,
                      content: skillCodeEditorState.value,
                      language: file.language || getPlaygroundCodeEditorLanguage({ name: file.name, path: file.name }),
                    }
                  : file
              );
              const didSave = await saveSelectedSkillCodeFiles(nextFiles);
              setSkillCodeEditorState((current) => ({
                ...current,
                isSaving: false,
                initialValue: didSave ? current.value : current.initialValue,
                error: didSave ? "" : (skillCodeFilesTransferState.error || "Failed to save code file."),
                message: didSave ? "Saved" : "",
              }));
            }
  
            function renderSkillCodeFileRow(codeFile) {
              const isActive = activeSkillCodeFile?.id === codeFile.id;
              return React.createElement("button", {
                  key: codeFile.id,
                  type: "button",
                  className: "playground-servers-code-file-row" + (isActive ? " is-active" : ""),
                  onClick: () => selectSkillCodeFile(codeFile.id),
                },
                React.createElement("span", { className: "playground-servers-code-file-chevron", "aria-hidden": "true" }),
                React.createElement("span", { className: "playground-servers-code-file-icon", "aria-hidden": "true" },
                  React.createElement(PlaygroundFileIcon, { entry: { name: codeFile.name, path: codeFile.name, isFolder: false }, className: "playground-skills-code-file-icon" })
                ),
                React.createElement("span", { className: "playground-servers-code-file-name" }, codeFile.name || "Untitled")
              );
            }
  
            function renderSkillCodeEditorBody() {
              if (!activeSkillCodeFile) {
                return React.createElement("div", { className: "playground-servers-code-empty" },
                  isSelectedSkillCodeFilesEditable ? "Add a file to start editing this skill." : "No source files available for this skill."
                );
              }
              if (SkillCodeEditorComponent) {
                return React.createElement("div", { className: "playground-code-preview-editor-shell playground-servers-code-editor-shell" },
                  React.createElement(SkillCodeEditorComponent, {
                    path: activeSkillCodeFile.name,
                    height: "100%",
                    language: activeSkillCodeFile.language || getPlaygroundCodeEditorLanguage(activeSkillCodeFileEntry),
                    theme: PLAYGROUND_CODE_EDITOR_THEME_NAME,
                    value: skillCodeEditorState.value,
                    onChange: handleSkillCodeEditorChange,
                    beforeMount: ensurePlaygroundCodeEditorTheme,
                    options: {
                      automaticLayout: true,
                      minimap: { enabled: false },
                      scrollBeyondLastLine: false,
                      smoothScrolling: true,
                      readOnly: !isSelectedSkillCodeFilesEditable,
                      fontSize: 12,
                      lineHeight: 20,
                      tabSize: 2,
                      insertSpaces: true,
                      renderLineHighlight: "gutter",
                      lineNumbersMinChars: 3,
                      overviewRulerBorder: false,
                      hideCursorInOverviewRuler: true,
                      wordWrap: "off",
                      padding: { top: 12, bottom: 12 },
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    },
                  })
                );
              }
              return React.createElement("textarea", {
                className: "playground-code-preview-textarea playground-servers-source-editor-textarea playground-servers-code-editor-shell",
                value: skillCodeEditorState.value,
                onChange: (event) => handleSkillCodeEditorChange(event.target.value),
                readOnly: !isSelectedSkillCodeFilesEditable,
                spellCheck: false,
                wrap: "off",
              });
            }
  
            const skillSourceFilesSection = React.createElement("div", {
                className: "playground-servers-code-workspace playground-skills-code-workspace" + (isSkillCodeDragging ? " is-dragging" : ""),
                onDragOver: (event) => {
                  event.preventDefault();
                  if (!isSelectedSkillCodeFilesEditable || skillCodeFilesTransferState.isProcessing) {
                    return;
                  }
                  setIsSkillCodeDragging(true);
                },
                onDragLeave: (event) => {
                  if (event.currentTarget.contains(event.relatedTarget)) {
                    return;
                  }
                  setIsSkillCodeDragging(false);
                },
                onDrop: (event) => void handleSkillCodeFileDrop(event),
              },
              isSelectedSkillCodeFilesEditable
                ? React.createElement("input", {
                    ref: skillCodeFileInputRef,
                    type: "file",
                    multiple: true,
                    hidden: true,
                    onChange: (event) => void handleSkillCodeFileInputChange(event),
                  })
                : null,
              React.createElement("aside", { className: "playground-servers-code-sidebar" },
                React.createElement("div", { className: "playground-servers-code-sidebar-header" },
                  React.createElement("div", { className: "playground-servers-code-sidebar-title" }, "Files"),
                  isSelectedSkillCodeFilesEditable
                    ? React.createElement("button", {
                        type: "button",
                        className: "playground-environments-action-button playground-servers-code-add-file-button",
                        onClick: openSkillCodeFilePicker,
                        disabled: skillCodeFilesTransferState.isProcessing,
                      },
                        React.createElement(Plus, { width: 13, height: 13, strokeWidth: 1.8 }),
                        React.createElement("span", null, "Add File")
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-servers-code-file-list" },
                  selectedSkillCodeFiles.length > 0
                    ? selectedSkillCodeFiles.map((codeFile) => renderSkillCodeFileRow(codeFile))
                    : React.createElement("div", { className: "playground-servers-code-empty" },
                        isSelectedSkillCodeFilesEditable ? "No source files yet." : "No source files."
                      )
                )
              ),
              React.createElement("section", { className: "playground-servers-code-editor-main" },
                React.createElement("div", { className: "playground-servers-code-editor-body" }, renderSkillCodeEditorBody()),
                React.createElement("div", { className: "playground-servers-code-editor-statusbar" },
                  React.createElement("div", {
                      className: "playground-servers-source-preview-status" + ((skillCodeEditorState.error || skillCodeFilesTransferState.error) ? " is-error" : ""),
                    },
                    skillCodeEditorState.error
                      || skillCodeFilesTransferState.error
                      || (skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing
                        ? "Saving..."
                        : skillCodeEditorState.message
                          ? skillCodeEditorState.message
                          : activeSkillCodeFile
                            ? (isSelectedSkillCodeFilesEditable
                              ? (skillCodeEditorIsDirty ? "Unsaved changes" : formatPlaygroundCodeEditorLanguageLabel(activeSkillCodeFileEntry))
                              : "Read-only")
                            : "")
                  ),
                  isSelectedSkillCodeFilesEditable
                    ? React.createElement("div", { className: "playground-servers-code-editor-status-actions" },
                        React.createElement("button", {
                          type: "button",
                          className: "playground-environments-action-button",
                          onClick: handleSkillCodeEditorRevert,
                          disabled: !skillCodeEditorIsDirty || skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing,
                        }, React.createElement("span", null, "Revert")),
                        React.createElement(PlatformPrimaryButton, {
                          size: "medium",
                          type: "button",
                          className: "playground-environments-action-button is-primary",
                          onClick: () => void handleSkillCodeEditorSave(),
                          disabled: !skillCodeEditorIsDirty || skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing,
                        },
                          skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing
                            ? React.createElement(Loader2, { width: 14, height: 14, strokeWidth: 1.8, className: "playground-files-state-loader" })
                            : React.createElement(HardDrive, { width: 14, height: 14, strokeWidth: 1.8 }),
                          React.createElement("span", null, skillCodeEditorState.isSaving || skillCodeFilesTransferState.isProcessing ? "Saving..." : "Save")
                        )
                      )
                    : null
                )
              )
            );
  
            const skillHeroPreview = React.createElement("section", { className: "playground-plugin-detail-carousel playground-skills-detail-hero-preview" },
              React.createElement("div", { className: "playground-plugin-detail-carousel-copy" },
                React.createElement("span", { className: "playground-plugin-detail-carousel-eyebrow" }, selectedSkill.isCustom ? "Custom Skill" : "System Skill"),
                React.createElement("h3", { className: "playground-plugin-detail-carousel-title" }, selectedSkill.name || "Skill workspace"),
                React.createElement("p", { className: "playground-plugin-detail-carousel-description" },
                  selectedSkill.description || "Use this skill to extend what agents can do during a run."
                )
              )
            );
  
            function renderSkillDefaultOptionsMenu(options, currentId, onSelect) {
              return React.createElement(PlatformPopupSurface, { className: "playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                options.map((option) =>
                  React.createElement("button", {
                      key: option.id,
                      type: "button",
                      className: "tb-popup-row tb-popup-row-select" + (currentId === option.id ? " selected" : ""),
                      onClick: () => onSelect(option.id),
                    },
                    React.createElement("span", { className: "tb-popup-check-slot" },
                      currentId === option.id
                        ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                        : null
                    ),
                    React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                      React.createElement("span", null, option.label || option.id),
                      option.description
                        ? React.createElement("small", null, option.description)
                        : null
                    )
                  )
                )
              );
            }
  
            function renderSkillDefaultSelectRow({ label, value, currentId, triggerRef, popoverRef, isOpen, setOpen, options, onSelect }) {
              return React.createElement("div", { key: label, className: "playground-tasks-detail-fact playground-skills-defaults-row" },
                React.createElement("div", { className: "playground-tasks-detail-fact-label" }, label),
                React.createElement("div", { className: "playground-tasks-detail-fact-control" },
                  React.createElement("button", {
                      ref: triggerRef,
                      type: "button",
                      className: "playground-tasks-detail-fact-button playground-tasks-detail-select-trigger",
                      onClick: () => setOpen((current) => !current),
                    },
                    React.createElement("span", null, value),
                    React.createElement(ChevronDown, { width: 14, height: 14, strokeWidth: 1.8 })
                  ),
                  isOpen
                    ? renderSkillPopoverMenu(
                        triggerRef,
                        popoverRef,
                        renderSkillDefaultOptionsMenu(options, currentId, onSelect)
                      )
                    : null
                )
              );
            }
  
            function renderSkillDefaultModelSettings() {
              if (selectedSkillFamilyId !== "image_generation" && selectedSkillFamilyId !== "video_generation" && selectedSkillFamilyId !== "deep_research" && selectedSkillFamilyId !== "research") {
                return null;
              }
              const deepResearchMeta = getSkillDeepResearchModelMeta(skillDeepResearchDefaultModel);
              const imageModelMeta = getSkillImageGenerationModelMeta(skillImageGenerationDefaultModel);
              const imageQualityMeta = getSkillImageGenerationQualityMeta(skillImageGenerationDefaultQuality);
              const videoModelMeta = getSkillVideoGenerationModelMeta(skillVideoGenerationDefaultModel);
              const rows = [];
              if (selectedSkillFamilyId === "image_generation") {
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Model",
                  value: imageModelMeta?.label || skillImageGenerationDefaultModel,
                  currentId: imageModelMeta?.id || skillImageGenerationDefaultModel,
                  triggerRef: skillImageGenerationModelTriggerRef,
                  popoverRef: skillImageGenerationModelPopoverRef,
                  isOpen: skillImageGenerationModelPopoverOpen,
                  setOpen: setSkillImageGenerationModelPopoverOpen,
                  options: PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS,
                  onSelect: updateSkillImageGenerationDefaultModel,
                }));
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Quality",
                  value: imageQualityMeta?.label || skillImageGenerationDefaultQuality,
                  currentId: imageQualityMeta?.id || skillImageGenerationDefaultQuality,
                  triggerRef: skillImageGenerationQualityTriggerRef,
                  popoverRef: skillImageGenerationQualityPopoverRef,
                  isOpen: skillImageGenerationQualityPopoverOpen,
                  setOpen: setSkillImageGenerationQualityPopoverOpen,
                  options: PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS,
                  onSelect: updateSkillImageGenerationDefaultQuality,
                }));
              } else if (selectedSkillFamilyId === "video_generation") {
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Model",
                  value: videoModelMeta?.label || skillVideoGenerationDefaultModel,
                  currentId: videoModelMeta?.id || skillVideoGenerationDefaultModel,
                  triggerRef: skillVideoGenerationModelTriggerRef,
                  popoverRef: skillVideoGenerationModelPopoverRef,
                  isOpen: skillVideoGenerationModelPopoverOpen,
                  setOpen: setSkillVideoGenerationModelPopoverOpen,
                  options: PLAYGROUND_SKILL_VIDEO_MODEL_OPTIONS,
                  onSelect: updateSkillVideoGenerationDefaultModel,
                }));
              } else {
                rows.push(renderSkillDefaultSelectRow({
                  label: "Default Model",
                  value: deepResearchMeta?.label || skillDeepResearchDefaultModel,
                  currentId: deepResearchMeta?.id || skillDeepResearchDefaultModel,
                  triggerRef: skillDeepResearchModelTriggerRef,
                  popoverRef: skillDeepResearchModelPopoverRef,
                  isOpen: skillDeepResearchModelPopoverOpen,
                  setOpen: setSkillDeepResearchModelPopoverOpen,
                  options: PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS,
                  onSelect: updateSkillDeepResearchDefaultModel,
                }));
              }
              return React.createElement("section", { className: "playground-tasks-detail-facts playground-environments-editor-facts playground-server-details-card playground-skills-defaults-card" },
                React.createElement("div", { className: "playground-tasks-detail-facts-body playground-skills-defaults-body" },
                  React.createElement("div", { className: "playground-skills-defaults-heading" },
                    React.createElement("div", null,
                      React.createElement("h3", { className: "playground-skills-defaults-title" }, "Default generation settings"),
                      React.createElement("p", { className: "playground-skills-defaults-description" },
                        "Agents use these defaults unless a thread prompt asks for another model or quality."
                      )
                    )
                  ),
                  ...rows
                )
              );
            }
  
  	          const skillDetailTabs = [
  	            { id: "general", label: "General" },
  	            { id: "sourceFiles", label: "Source Files" },
  	          ];
            const skillDetailTabsElement = React.createElement("div", {
                className: "playground-agents-overview-tabs playground-agents-detail-tabs playground-server-detail-tabs playground-skills-detail-tabs",
              },
              React.createElement("div", { className: "playground-project-overview-chart-tabs" },
                skillDetailTabs.map((tab) =>
                  React.createElement("button", {
                    key: tab.id,
                    type: "button",
                    className: "playground-project-overview-chart-tab" + (skillDetailTab === tab.id ? " is-active" : ""),
                    onClick: () => setSkillDetailTab(tab.id),
                  }, tab.label)
                )
              )
            );
  
  	          const generalTabContent = React.createElement(React.Fragment, null,
  	            skillHeroPreview,
  	            renderSkillDefaultModelSettings(),
  	            renderSkillMarkdownSection({
  	              sectionId: "usage",
  	              title: "Usage",
                content: selectedSkillSections.usage,
                emptyLabel: "Add Usage here",
              }),
              renderSkillMarkdownSection({
                sectionId: "process",
                title: "Process",
                content: selectedSkillSections.process,
                emptyLabel: "Add Process here",
              }),
              renderSkillMarkdownSection({
                sectionId: "outputFormat",
                title: "Output",
                content: selectedSkillSections.outputFormat,
                emptyLabel: "Add Output guidance here",
              }),
              renderSkillMarkdownSection({
                sectionId: "configuration",
                title: "Config",
                content: selectedSkillSections.configuration,
                emptyLabel: "Add Config here",
              }),
              renderSkillMarkdownSection({
                sectionId: "examplePrompts",
                title: "Examples",
                content: selectedSkillSections.examplePrompts,
                emptyLabel: "Add Examples here",
  	            })
  	          );
  	          const activeSkillDetailTabContent = skillDetailTab === "sourceFiles"
  	            ? skillSourceFilesSection
  	            : generalTabContent;
  
  	          return React.createElement("div", { className: "playground-environments-editor-main playground-tasks-detail-main playground-skills-detail-page" + (skillDetailTab === "sourceFiles" ? " is-source-files-tab" : "") },
  	            skillsTopNavActions,
  	            React.createElement("div", { className: "playground-environments-detail-scroll playground-tasks-detail-scroll playground-environments-editor-scroll" },
  	              React.createElement("div", { className: "playground-skills-detail-content" },
  	                React.createElement("div", { className: "playground-project-overview-summary-title-row playground-develop-header playground-develop-server-kind-header playground-plugin-detail-title-row" },
  	                  React.createElement("div", { className: "playground-plugin-detail-title-main" },
  	                    React.createElement("div", { className: "playground-plugin-detail-header-icon-shell playground-skills-detail-header-icon-shell" },
  	                      renderSkillIcon(selectedSkill, "playground-skills-detail-header-icon")
  	                    ),
  	                    React.createElement("h1", { className: "playground-project-overview-summary-title playground-develop-title playground-plugin-detail-title" }, selectedSkill.name || selectedSkill.id || "Untitled skill")
  	                  ),
  	                  React.createElement("div", { className: "playground-project-overview-summary-title-actions playground-develop-header-actions" },
  	                    React.createElement(PlatformSecondaryButton, {
  	                      type: "button",
  	                      className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-develop-server-metrics-add-button playground-plugin-detail-connect-button playground-skills-detail-enable-button" + (isSelectedSkillEnabled ? " is-destructive" : ""),
  	                      onClick: handleToggleSelectedSkillEnabled,
  	                      disabled: !selectedSkillToggleId || typeof onSkillsChange !== "function",
  	                    }, isSelectedSkillEnabled ? "Disable" : "Enable")
  	                  )
  	                ),
                  skillsError && skillListMode === "custom"
                    ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, skillsError)
                    : null,
                  skillSaveState.error
                    ? React.createElement("div", { className: "playground-environments-error playground-environments-editor-notice" }, skillSaveState.error)
                    : null,
                  skillDetailTabsElement,
                  activeSkillDetailTabContent
                )
              ),
            );
          }
  
          function renderSkillsOverviewPage() {
            const rows = displaySkills.map((skill) => {
              const updatedAt = Date.parse(String(skill?.updatedAt || skill?.createdAt || ""));
              return {
                ...skill,
                id: String(skill?.id || ""),
                name: String(skill?.name || skill?.id || "Skill"),
                searchText: [skill?.name, skill?.description, skill?.id].filter(Boolean).join(" "),
                icon: renderSkillIcon(skill, "playground-environments-list-item-icon"),
                isActive: skill?.isActive !== false,
                isCustom: Boolean(skill?.isCustom),
                updatedAt: Number.isFinite(updatedAt) ? updatedAt : 0,
                updatedLabel: formatRelativeThreadTime(skill?.updatedAt || skill?.createdAt) || (skill?.isCustom ? "Recently" : "System"),
              };
            });
  
            return React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page" },
              React.createElement("div", { className: "playground-environments-detail-scroll playground-settings-detail-scroll" },
                React.createElement(SkillsOverviewPage, {
                  rows,
                  mode: skillListMode,
                  onModeChange: handleSkillListModeChange,
                  period: skillsOverviewChartTimescale,
                  onPeriodChange: setSkillsOverviewChartTimescale,
                  controlsPortalId: "playground-tools-overview-controls",
                  loading: skillsLoading && !skillsLoaded,
                  mutating: skillSaveState.isSaving || skillComposerSaveState.isSaving,
                  onOpen: (skill) => handleSkillSelect(skill.id),
                  onCreate: openSkillComposer,
                  onEdit: openSkillEditDialog,
                  onRename: openSkillRenameDialog,
                  onDelete: (skillsToDelete) => {
                    const [skill] = skillsToDelete;
                    if (skill) void handleDeleteSelectedSkill(skill);
                  },
                })
              )
            );
          }
  
          function renderSkillComposerDialog() {
            if (!skillComposerOpen) {
              return null;
            }
  
            const selectedSkillComposerIcon = getPlaygroundSkillIconConfig(skillComposerDraft.icon);
            const SelectedSkillComposerIcon = selectedSkillComposerIcon.icon;
            const composerCodeFiles = normalizeSkillCodeFiles(skillComposerDraft.codeFiles);
  
            return React.createElement(PlatformModalBackdrop, {
                className: "playground-tasks-project-modal-backdrop",
                onClick: () => {
                  if (!skillComposerSaveState.isSaving) {
                    closeSkillComposer();
                  }
                },
              },
                React.createElement(PlatformModalSurface, {
                    as: "form",
                    className: "playground-tasks-project-modal playground-skill-composer-modal",
                    onClick: (event) => event.stopPropagation(),
                    onKeyDown: handleComposerSubmitShortcut,
                    onSubmit: (event) => void handleSkillComposerSubmit(event),
                  },
                  React.createElement("div", { className: "playground-tasks-project-modal-top" },
                    React.createElement("div", { className: "playground-tasks-project-modal-name-row" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-tasks-project-modal-icon-trigger" + (skillComposerIconPickerOpen ? " is-active" : ""),
                        onClick: (event) => {
                          event.preventDefault();
                          setSkillComposerIconPickerOpen((current) => !current);
                        },
                        title: "Choose skill icon",
                      },
                        React.createElement(SelectedSkillComposerIcon, { width: 18, height: 18, strokeWidth: 1.9 })
                      ),
                      React.createElement("input", {
                        className: "playground-tasks-project-modal-name-input",
                        value: skillComposerDraft.name,
                        onChange: (event) => updateSkillComposerField("name", event.target.value),
                        placeholder: "Skill name",
                        autoFocus: true,
                        disabled: skillComposerSaveState.isSaving,
                      }),
                      skillComposerIconPickerOpen
                        ? React.createElement("div", { className: "playground-tasks-project-icon-picker" },
                            PLAYGROUND_SKILL_ICON_OPTIONS.map((option) => {
                              const Icon = option.icon;
                              const isActive = getPlaygroundSkillIconId(skillComposerDraft.icon) === option.id;
                              return React.createElement("button", {
                                key: option.id,
                                type: "button",
                                className: "playground-tasks-project-icon-option" + (isActive ? " is-active" : ""),
                                title: option.label,
                                onClick: (event) => {
                                  event.preventDefault();
                                  updateSkillComposerField("icon", option.id);
                                  setSkillComposerIconPickerOpen(false);
                                },
                              },
                                React.createElement(Icon, { width: 18, height: 18, strokeWidth: 1.9 })
                              );
                            })
                          )
                        : null
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-settings-icon-button playground-tasks-project-modal-close",
                      onClick: closeSkillComposer,
                      title: "Close",
                      disabled: skillComposerSaveState.isSaving,
                    }, React.createElement(X, { width: 16, height: 16, strokeWidth: 1.8 }))
                  ),
                  React.createElement("div", { className: "playground-skill-composer-modal-body" },
                    React.createElement("div", { className: "playground-tasks-detail-description playground-tasks-project-modal-description" },
                      React.createElement("div", { className: "playground-tasks-detail-section-header" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Description"),
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
                              disabled: skillComposerSaveState.isSaving,
                              onMouseDown: (event) => event.preventDefault(),
                              onClick: () => handleSkillComposerDescriptionFormat(action.id),
                            }, React.createElement(action.icon, { width: 14, height: 14, strokeWidth: 1.8 }))
                          )
                        )
                      ),
                      React.createElement("div", { className: "playground-tasks-detail-description-editor" + (isSkillComposerDescriptionEditing ? " is-editing" : " is-preview") },
                        !isSkillComposerDescriptionEditing
                          ? React.createElement("div", { className: "playground-tasks-detail-description-preview-scope tb-runner-chat" },
                              String(skillComposerDraft.description || "").trim()
                                ? React.createElement(PlaygroundTaskDescriptionMarkdown, {
                                    content: skillComposerDraft.description,
                                    className: "playground-tasks-detail-description-preview tb-message-markdown",
                                  })
                                : React.createElement("div", {
                                    className: "playground-tasks-detail-description-preview playground-tasks-detail-description-placeholder",
                                  }, "Add a short description for this custom skill.")
                            )
                          : null,
                        React.createElement("textarea", {
                          ref: skillComposerDescriptionTextareaRef,
                          className: "playground-tasks-detail-description-input " + (isSkillComposerDescriptionEditing ? "is-editing" : "is-preview"),
                          rows: 1,
                          placeholder: isSkillComposerDescriptionEditing ? "Add a short description for this custom skill." : "",
                          value: skillComposerDraft.description,
                          disabled: skillComposerSaveState.isSaving,
                          onFocus: () => setIsSkillComposerDescriptionEditing(true),
                          onChange: (event) => {
                            updateSkillComposerField("description", event.target.value);
                            resizeSkillTextarea(event.currentTarget);
                          },
                          onBlur: () => setIsSkillComposerDescriptionEditing(false),
                        })
                      )
                    ),
                    React.createElement("div", { className: "playground-tasks-attachments" },
                      React.createElement("div", { className: "playground-tasks-attachments-toolbar" },
                        React.createElement("div", { className: "playground-tasks-detail-section-title" }, "Code Files"),
                        React.createElement("div", { className: "playground-tasks-attachments-actions" },
                          React.createElement("button", {
                            type: "button",
                            className: "playground-environments-action-button playground-tasks-attachments-environment-button",
                            onClick: openSkillComposerEnvironmentFilePicker,
                            disabled: skillCodeFilesTransferState.isProcessing || availableSkillEnvironments.length === 0,
                            title: availableSkillEnvironments.length > 0
                              ? "Add files from " + (selectedSkillEnvironment?.name || "an environment")
                              : "No environments available",
  	                        }, "From Environment")
                        )
                      ),
                      React.createElement("input", {
                        ref: skillComposerCodeFileInputRef,
                        type: "file",
                        multiple: true,
                        hidden: true,
                        onChange: (event) => void handleSkillComposerCodeFileInputChange(event),
                      }),
                      React.createElement("div", { className: "playground-tasks-attachments-surface tb-runner-chat" },
                        React.createElement("div", {
                          className: "tb-popup-dropzone playground-tasks-attachments-dropzone" + (isSkillComposerCodeDragging ? " dragging" : "") + (composerCodeFiles.length > 0 ? " is-filled" : ""),
                          onDragOver: (event) => {
                            event.preventDefault();
                            if (skillCodeFilesTransferState.isProcessing) {
                              return;
                            }
                            setIsSkillComposerCodeDragging(true);
                          },
                          onDragLeave: (event) => {
                            if (event.currentTarget.contains(event.relatedTarget)) {
                              return;
                            }
                            setIsSkillComposerCodeDragging(false);
                          },
                          onDrop: (event) => void handleSkillComposerCodeFileDrop(event),
                        },
                          composerCodeFiles.length > 0
                            ? React.createElement(React.Fragment, null,
                                React.createElement("div", { className: "playground-tasks-attachments-topline" },
                                  React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                  React.createElement("span", null, isSkillComposerCodeDragging ? "Drop files here" : "Drop files to attach, or"),
                                  React.createElement("button", {
                                    type: "button",
                                    className: "playground-tasks-attachments-browse",
                                    disabled: skillCodeFilesTransferState.isProcessing,
                                    onClick: () => skillComposerCodeFileInputRef.current?.click?.(),
                                  }, "browse.")
                                ),
                                React.createElement("div", { className: "runner-attachments" },
                                  composerCodeFiles.map((codeFile) => renderSkillCodeFileChip(codeFile, {
                                    removable: true,
                                    onRemove: handleRemoveSkillComposerCodeFile,
                                  }))
                                )
                              )
                            : React.createElement("button", {
                                type: "button",
                                className: "playground-tasks-attachments-empty-button",
                                disabled: skillCodeFilesTransferState.isProcessing,
                                onClick: () => skillComposerCodeFileInputRef.current?.click?.(),
                              },
                                React.createElement(ArrowUpFromLine, { className: "tb-popup-dropzone-icon", strokeWidth: 1.75 }),
                                React.createElement("span", { className: "tb-popup-dropzone-title" }, isSkillComposerCodeDragging ? "Drop files here" : "Drag & drop files here"),
                                React.createElement("span", { className: "tb-popup-dropzone-copy" }, "or click to browse")
                              )
                        )
                      ),
                      skillCodeFilesTransferState.isProcessing
                        ? React.createElement("div", { className: "playground-tasks-attachments-status" }, "Adding code files...")
                        : null,
                      skillCodeFilesTransferState.error
                        ? React.createElement("div", { className: "playground-environments-error" }, skillCodeFilesTransferState.error)
                        : null
                    )
                  ),
                  skillComposerSaveState.error
                    ? React.createElement("div", { className: "playground-tasks-project-modal-error" }, skillComposerSaveState.error)
                    : null,
                  React.createElement("div", { className: "playground-tasks-project-modal-actions" },
                    React.createElement("button", {
                      type: "button",
                      className: "playground-environments-action-button",
                      onClick: closeSkillComposer,
                      disabled: skillComposerSaveState.isSaving,
                    }, "Cancel"),
                    React.createElement(PlatformPrimaryButton, {
                      size: "medium",
                      type: "submit",
                      className: "playground-environments-action-button is-primary",
                      disabled: skillComposerSaveState.isSaving || !String(skillComposerDraft.name || "").trim() || !baseSkillProjectId,
                    }, skillComposerSaveState.isSaving ? "Creating..." : "Create Skill")
                  )
                )
              );
          }
  
          return React.createElement(React.Fragment, null,
            toolbarPopover
              ? React.createElement(PlatformPopupDismissLayer, {
                  className: "playground-files-search-backdrop",
                  onClick: () => setToolbarPopover(""),
                })
              : null,
            skillsPageMode === "detail"
              ? React.createElement("section", { className: "playground-environments-detail playground-plugins-detail playground-skills-page" },
                  renderCurrentSkillDetail()
                )
              : renderSkillsOverviewPage(),
            renderSkillListActionMenu(),
            renderSkillRenameModal(),
            renderSkillEditModal(),
            renderSkillEnvironmentFilePicker(),
            renderSkillComposerDialog()
          );
        }
  
