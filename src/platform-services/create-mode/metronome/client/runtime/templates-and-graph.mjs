export const METRONOME_TEMPLATES_RUNTIME_SCRIPT = String.raw`
        const METRONOME_TEMPLATE_WORKFLOWS = [
          {
            id: "project-release-watchdog",
            title: "Project release watchdog",
            copy: "When a ticket moves to review, start a reviewer thread, post a project comment, and ask Mission Control for follow-up work.",
            Icon: Bookmark,
            graphFactory: createProjectReleaseWatchdogMetronomeGraph,
          },
          {
            id: "campaign-asset-factory",
            title: "Campaign asset factory",
            copy: "Trigger on @campaign, generate Imagine assets from the brief, attach files to the project, and notify the launch thread.",
            Icon: Clapperboard,
            graphFactory: createCampaignAssetFactoryMetronomeGraph,
          },
          {
            id: "inbound-research-triage",
            title: "Inbound research triage",
            copy: "Route email or Telegram requests into a research thread, summarize sources, and create a ticket when human review is needed.",
            Icon: Search,
            graphFactory: createInboundResearchTriageMetronomeGraph,
          },
          {
            id: "database-enrichment-loop",
            title: "Database enrichment loop",
            copy: "When a database document is added, call a function, enrich the record, and branch to approval if confidence is low.",
            Icon: Database,
            graphFactory: createDatabaseEnrichmentLoopMetronomeGraph,
          },
          {
            id: "restaurant-hyper-enrichment",
            title: "Restaurant enrichment pipeline",
            copy: "Parse a restaurant CSV into batches, search for menu pages with Firecrawl, structure results with a thread, and upsert batch outputs.",
            Icon: Flame,
            graphFactory: createRestaurantHyperEnrichmentMetronomeGraph,
          },
        ];

        const METRONOME_RESOURCE_TEMPLATE_GRAPH_FACTORIES = Object.freeze({
          "customer-support-email-metronome": createCustomerSupportEmailTemplateMetronomeGraph,
          "weekly-executive-briefing": createWeeklyExecutiveBriefingTemplateMetronomeGraph,
          "campaign-content-calendar": createCampaignContentCalendarTemplateMetronomeGraph,
        });

        const METRONOME_BUILT_IN_WORKFLOWS = [
          {
            id: "builtin_loop",
            title: "Loop",
            copy: "A default worker and verifier workflow that iterates on a task until the verifier accepts the result.",
            Icon: RefreshCw,
            graphFactory: createWorkerVerifierLoopMetronomeGraph,
          },
        ];

        function createMetronomeNodeFromPaletteItem(item, position) {
          const normalizedItem = item && typeof item === "object" ? item : {};
          const kind = normalizedItem.kind || "action";
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          return createMetronomeNode(kind, position, {
            subtype: normalizedItem.subtype,
            label: normalizedItem.label || meta.label,
            description: normalizedItem.copy || normalizedItem.description || meta.copy,
          });
        }

        function normalizeMetronomeOptionList(items, fallbackItems = []) {
          const sourceItems = Array.isArray(items) && items.length > 0 ? items : fallbackItems;
          return sourceItems
            .map((item) => {
              if (!item || typeof item !== "object") return null;
              const id = String(
                item.id
                || item.agentId
                || item.agent_id
                || item.value
                || item.key
                || item.slug
                || ""
              ).trim();
              if (!id) return null;
              const name = String(
                item.name
                || item.displayName
                || item.display_name
                || item.title
                || item.label
                || item.email
                || id
              ).trim();
              return { ...item, id, name: name || id };
            })
            .filter(Boolean);
        }

        function getMetronomeTicketStatus(value) {
          if (value && typeof value === "object") {
            return String(
              value.status
              || value.state
              || value.stage
              || value.column
              || value.boardStatus
              || value.board_status
              || value.statusId
              || value.status_id
              || ""
            ).trim();
          }
          return String(value || "").trim();
        }

        function isMetronomeClosedTicketStatus(value) {
          const normalized = getMetronomeTicketStatus(value).toLowerCase().replace(/[\s-]+/g, "_");
          return [
            "done",
            "complete",
            "completed",
            "closed",
            "cancelled",
            "canceled",
            "not_planned",
            "archived",
          ].includes(normalized);
        }

        function normalizeMetronomeTicketOption(item, project = null) {
          if (!item || typeof item !== "object") return null;
          const metadata = item.metadata && typeof item.metadata === "object" ? item.metadata : {};
          const id = String(item.id || item.taskId || item.task_id || item.ticketId || item.ticket_id || item.value || "").trim();
          if (!id) return null;
          const ticketNumber = String(
            item.ticketNumber
            || item.ticket_number
            || item.number
            || item.key
            || metadata.ticketNumber
            || metadata.ticket_number
            || ""
          ).trim();
          const title = String(item.title || item.name || item.summary || item.label || item.description || id).trim();
          const status = getMetronomeTicketStatus(item) || getMetronomeTicketStatus(metadata) || "planned";
          const projectId = String(
            item.projectId
            || item.project_id
            || item.project?.id
            || project?.id
            || ""
          ).trim();
          const projectName = String(
            item.projectName
            || item.project_name
            || item.project?.name
            || project?.name
            || ""
          ).trim();
          return {
            ...item,
            id,
            name: [ticketNumber, title].filter(Boolean).join(" ") || title || id,
            title,
            ticketNumber,
            status,
            projectId,
            projectName,
          };
        }

        function getMetronomeProjectTicketSourceArrays(project) {
          const source = project && typeof project === "object" ? project : {};
          const metadata = source.metadata && typeof source.metadata === "object" ? source.metadata : {};
          const candidates = [
            source.tickets,
            source.tasks,
            source.backlog,
            source.items,
            source.taskItems,
            source.task_items,
            source.ticketItems,
            source.ticket_items,
            metadata.tickets,
            metadata.tasks,
            metadata.backlog,
            source.tasks?.items,
            source.tickets?.items,
            metadata.tasks?.items,
            metadata.tickets?.items,
          ];
          return candidates.filter(Array.isArray);
        }

        function normalizeMetronomeTicketOptions(items, project = null, options = {}) {
          const includeClosed = Boolean(options?.includeClosed);
          const normalized = (Array.isArray(items) ? items : [])
            .map((item) => normalizeMetronomeTicketOption(item, project))
            .filter(Boolean)
            .filter((ticket) => includeClosed || !isMetronomeClosedTicketStatus(ticket.status));
          const seen = new Set();
          return normalized.filter((ticket) => {
            if (seen.has(ticket.id)) return false;
            seen.add(ticket.id);
            return true;
          });
        }

        function extractMetronomeProjectTicketOptions(project, options = {}) {
          const sourceArrays = getMetronomeProjectTicketSourceArrays(project);
          return normalizeMetronomeTicketOptions(sourceArrays.flat(), project, options);
        }

        async function fetchMetronomeProjectTicketsApi(projectId, options = {}) {
          const normalizedProjectId = String(projectId || "").trim();
          if (!normalizedProjectId) return [];
          const headers = {};
          const apiKey = String(options?.apiKey || "").trim();
          if (apiKey) headers["X-API-Key"] = apiKey;
          const response = await fetch("/api/real/tasks?projectId=" + encodeURIComponent(normalizedProjectId), {
            method: "GET",
            credentials: "same-origin",
            headers,
          });
          if (!response.ok) {
            throw new Error("Failed to load project tickets");
          }
          const data = await response.json();
          const rawItems = Array.isArray(data?.tasks)
            ? data.tasks
            : Array.isArray(data?.items)
              ? data.items
              : Array.isArray(data?.data)
                ? data.data
                : Array.isArray(data)
                  ? data
                  : [];
          return normalizeMetronomeTicketOptions(rawItems, { id: normalizedProjectId }, { includeClosed: false });
        }

        function getMetronomeRecordString(record, keys) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : {};
          for (const key of Array.isArray(keys) ? keys : []) {
            const value = source[key];
            if (typeof value === "string" && value.trim()) {
              return value.trim();
            }
            if (typeof value === "number" && Number.isFinite(value)) {
              return String(value);
            }
          }
          return "";
        }

        function normalizeMetronomeRecordObject(value) {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return value;
          }
          if (typeof value === "string" && value.trim()) {
            try {
              const parsed = JSON.parse(value);
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
            } catch {
              return null;
            }
          }
          return null;
        }

        function getMetronomeRecordObject(record, keys) {
          const source = record && typeof record === "object" && !Array.isArray(record) ? record : null;
          if (!source) return null;
          for (const key of Array.isArray(keys) ? keys : []) {
            const value = normalizeMetronomeRecordObject(source[key]);
            if (value) return value;
          }
          return null;
        }

        function getMetronomeProfileImageUrl(record) {
          const directUrl = getMetronomeRecordString(record, [
            "photoUrl",
            "photoURL",
            "avatarUrl",
            "avatarURL",
            "avatar",
            "picture",
          ]);
          if (directUrl) return directUrl;
          const profile = getMetronomeRecordObject(record, ["profile"]);
          const profileUrl = getMetronomeRecordString(profile || {}, [
            "photoUrl",
            "photoURL",
            "avatarUrl",
            "avatarURL",
            "avatar",
            "picture",
          ]);
          if (profileUrl) return profileUrl;
          const metadata = normalizeMetronomeRecordObject(record?.metadata);
          const metadataProfile = getMetronomeRecordObject(metadata, ["profile"]);
          return getMetronomeRecordString(metadata || {}, [
            "photoUrl",
            "photoURL",
            "avatarUrl",
            "avatarURL",
            "avatar",
            "picture",
          ]) || getMetronomeRecordString(metadataProfile || {}, [
            "photoUrl",
            "photoURL",
            "avatarUrl",
            "avatarURL",
            "avatar",
            "picture",
          ]);
        }

        function isMetronomeTeamAgentOption(option) {
          if (!option || typeof option !== "object") return false;
          if (String(option.agentType || "").trim() === "team") return true;
          const metadata = normalizeMetronomeRecordObject(option.metadata);
          if (!metadata) return false;
          const kind = String(metadata.kind || "").trim();
          const team = metadata.team && typeof metadata.team === "object" && !Array.isArray(metadata.team)
            ? metadata.team
            : null;
          return kind === "team" && Boolean(team);
        }

        function isMetronomeHumanAgentOption(option) {
          if (!option || typeof option !== "object") return false;
          if (String(option.agentType || "").trim() === "human") return true;
          const metadata = normalizeMetronomeRecordObject(option.metadata);
          return String(metadata?.kind || "").trim() === "human";
        }

        function getMetronomeAgentSelectorMode(option) {
          if (isMetronomeHumanAgentOption(option)) return "humans";
          return isMetronomeTeamAgentOption(option) ? "teams" : "agents";
        }

        function getMetronomeAgentOptionModelId(option) {
          if (!option || typeof option !== "object") return "";
          const directModel = getMetronomeRecordString(option, [
            "model",
            "modelId",
            "model_id",
            "lastUsedModel",
            "last_used_model",
            "defaultModel",
            "default_model",
          ]);
          if (directModel) return directModel;
          const metadata = normalizeMetronomeRecordObject(option.metadata);
          const metadataModel = getMetronomeRecordString(metadata || {}, [
            "model",
            "modelId",
            "model_id",
            "lastUsedModel",
            "last_used_model",
            "defaultModel",
            "default_model",
          ]);
          if (metadataModel) return metadataModel;
          const nestedModel = getMetronomeRecordObject(metadata, ["model", "modelMeta", "model_meta", "llm", "llmModel", "llm_model"]);
          return getMetronomeRecordString(nestedModel || {}, ["id", "model", "modelId", "model_id", "name"]);
        }

        function getMetronomeAgentOptionExplicitProvider(option) {
          if (!option || typeof option !== "object") return "";
          const directProvider = getMetronomeRecordString(option, [
            "modelProvider",
            "model_provider",
            "modelProviderType",
            "model_provider_type",
            "provider",
            "providerType",
            "provider_type",
            "source",
          ]);
          if (directProvider) return directProvider;
          const metadata = normalizeMetronomeRecordObject(option.metadata);
          const metadataProvider = getMetronomeRecordString(metadata || {}, [
            "modelProvider",
            "model_provider",
            "modelProviderType",
            "model_provider_type",
            "provider",
            "providerType",
            "provider_type",
            "source",
          ]);
          if (metadataProvider) return metadataProvider;
          const nestedModel = getMetronomeRecordObject(metadata, ["model", "modelMeta", "model_meta", "llm", "llmModel", "llm_model"]);
          return getMetronomeRecordString(nestedModel || {}, [
            "modelProvider",
            "model_provider",
            "modelProviderType",
            "model_provider_type",
            "provider",
            "providerType",
            "provider_type",
            "source",
          ]);
        }

        function inferMetronomeAgentProviderTypeFromModelId(modelId) {
          const normalized = String(modelId || "").trim().toLowerCase();
          if (!normalized) return "";
          if (normalized.startsWith("external:")) {
            const parts = normalized.split(":");
            return parts[1] || "";
          }
          if (normalized.startsWith("minimax-") || normalized === "minimax/m3" || normalized.includes("minimax")) return "minimax";
          if (normalized.startsWith("claude-") || normalized.includes("anthropic")) return "anthropic";
          if (normalized.startsWith("gemini-") || normalized.includes("google")) return "google";
          if (normalized.startsWith("gpt-") || normalized.startsWith("o1") || normalized.startsWith("o3") || normalized.startsWith("o4") || normalized.includes("openai")) return "openai";
          if (normalized.startsWith("deepseek-") || normalized.includes("deepseek")) return "deepseek";
          if (normalized.startsWith("kimi-") || normalized.includes("moonshot") || normalized.includes("kimi")) return "kimi";
          if (normalized.startsWith("glm-") || normalized.includes("zai") || normalized.includes("zhipu")) return "zai";
          if (normalized.startsWith("qwen") || normalized.includes("alibaba/qwen")) return "qwen";
          if (normalized.startsWith("grok-") || normalized.includes("xai")) return "xai";
          return "";
        }

        function getMetronomeAgentOptionProviderType(option) {
          const modelProvider = inferMetronomeAgentProviderTypeFromModelId(getMetronomeAgentOptionModelId(option));
          if (modelProvider === "minimax") return modelProvider;
          const explicitProvider = getMetronomeAgentOptionExplicitProvider(option).trim().toLowerCase();
          if (!explicitProvider) return modelProvider;
          if (explicitProvider.includes("minimax")) return "minimax";
          if (explicitProvider.includes("anthropic") || explicitProvider.includes("claude")) return "anthropic";
          if (explicitProvider.includes("google") || explicitProvider.includes("gemini")) return "google";
          if (explicitProvider.includes("openai") || explicitProvider === "open-ai") return "openai";
          if (explicitProvider.includes("deepseek")) return "deepseek";
          if (explicitProvider.includes("moonshot") || explicitProvider.includes("kimi")) return "kimi";
          if (explicitProvider.includes("zai") || explicitProvider.includes("zhipu")) return "zai";
          if (explicitProvider.includes("qwen") || explicitProvider.includes("alibaba")) return "qwen";
          if (explicitProvider.includes("xai") || explicitProvider.includes("grok")) return "xai";
          if (explicitProvider.includes("cloudflare")) return modelProvider || "kimi";
          return modelProvider || explicitProvider;
        }

        function getMetronomeAgentProviderIcon(providerType) {
          const normalized = String(providerType || "").trim().toLowerCase();
          if (normalized === "anthropic") return { src: "/img/05-model-provider-icons/claude.png", alt: "Anthropic" };
          if (normalized === "google" || normalized === "gemini") return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google" };
          if (normalized === "openai") return { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" };
          if (normalized === "deepseek") return { src: "/img/05-model-provider-icons/deepseek.png", alt: "DeepSeek" };
          if (normalized === "minimax") return { src: "/img/05-model-provider-icons/minimax.svg", alt: "MiniMax" };
          if (normalized === "kimi" || normalized === "moonshot" || normalized === "cloudflare") return { src: "/img/05-model-provider-icons/kimi.png", alt: "Moonshot" };
          if (normalized === "zai" || normalized === "z-ai" || normalized === "zhipu") return { src: "/img/05-model-provider-icons/zai.webp", alt: "ZAI" };
          if (normalized === "qwen" || normalized === "alibaba") return { src: "/img/05-model-provider-icons/qwen.svg", alt: "Qwen", className: "is-openai" };
          if (normalized === "xai" || normalized === "grok") return { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI" };
          return null;
        }

        function renderMetronomeAgentOptionIcon(agent) {
          const providerIcon = getMetronomeAgentProviderIcon(getMetronomeAgentOptionProviderType(agent));
          if (!providerIcon) {
            return React.createElement(User, { className: "tb-popup-icon", strokeWidth: 1.75 });
          }
          return React.createElement("img", {
            className: "tb-popup-icon tb-popup-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
            src: providerIcon.src,
            alt: "",
            title: providerIcon.alt,
            "aria-hidden": "true",
            draggable: false,
          });
        }

        function getMetronomeProjectEnvironmentId(project) {
          if (!project || typeof project !== "object") {
            return "";
          }
          const directDefaultEnvironmentId = typeof project.defaultEnvironmentId === "string" ? project.defaultEnvironmentId.trim() : "";
          if (directDefaultEnvironmentId) {
            return directDefaultEnvironmentId;
          }
          const directEnvironmentId = typeof project.environmentId === "string" ? project.environmentId.trim() : "";
          if (directEnvironmentId) {
            return directEnvironmentId;
          }
          const metadata = project.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
            ? project.metadata
            : null;
          const metadataDefaultEnvironmentId =
            metadata && typeof metadata.defaultEnvironmentId === "string" ? metadata.defaultEnvironmentId.trim() : "";
          if (metadataDefaultEnvironmentId) {
            return metadataDefaultEnvironmentId;
          }
          return metadata && typeof metadata.environmentId === "string" ? metadata.environmentId.trim() : "";
        }

        const METRONOME_CONDITION_TYPES = new Set(["previous_output_contains", "database_document_field", "ticket_status", "json"]);
        const METRONOME_LOOP_TYPES = new Set(["fixed_count", "workflow_context_contains", "input_items", "project_tickets", "database_field", "database_documents"]);
        const METRONOME_TICKET_OPERATIONS = new Set(["adapt_ticket", "add_ticket_comment", "move_ticket_status", "start_work_on_ticket", "add_subtask"]);

        function normalizeMetronomeConditionType(value) {
          const candidate = String(value || "").trim();
          return METRONOME_CONDITION_TYPES.has(candidate) ? candidate : "previous_output_contains";
        }

        function normalizeMetronomeLoopType(value) {
          const candidate = String(value || "").trim();
          return METRONOME_LOOP_TYPES.has(candidate) ? candidate : "fixed_count";
        }

        function normalizeMetronomeTicketOperation(value) {
          const candidate = String(value || "").trim();
          if (candidate === "create_or_update_ticket" || candidate === "update_ticket" || candidate === "adapt") {
            return "adapt_ticket";
          }
          if (candidate === "update_ticket_status" || candidate === "change_ticket_status" || candidate === "move_status") {
            return "move_ticket_status";
          }
          if (candidate === "comment" || candidate === "add_comment") {
            return "add_ticket_comment";
          }
          if (candidate === "start_work" || candidate === "work_on_ticket") {
            return "start_work_on_ticket";
          }
          if (candidate === "subtask" || candidate === "create_subtask" || candidate === "add_child_ticket") {
            return "add_subtask";
          }
          return METRONOME_TICKET_OPERATIONS.has(candidate) ? candidate : "adapt_ticket";
        }

        function createDefaultMetronomeLoopConfig(loopType, source = {}) {
          const normalizedLoopType = normalizeMetronomeLoopType(loopType || source.loopType || source.loop_type);
          return {
            loopType: normalizedLoopType,
            iterations: Number(source.iterations || source.count || 5) || 5,
            maxIterations: Number(source.maxIterations || source.max_iterations || 25) || 25,
            contextContainsText: String(source.contextContainsText || source.context_contains || source.contextContains || "").trim(),
            projectId: String(source.projectId || source.project_id || "").trim(),
            projectName: String(source.projectName || source.project_name || "").trim(),
            inputBinding: String(source.inputBinding || source.input_binding || "previous.batches").trim() || "previous.batches",
            ticketStatusValue: String(source.ticketStatusValue || source.ticket_status || source.status || "planned").trim() || "planned",
            databaseId: String(source.databaseId || source.database_id || "").trim(),
            databaseName: String(source.databaseName || source.database_name || "").trim(),
            databaseCollection: String(source.databaseCollection || source.database_collection || source.collection || "").trim(),
            databaseFieldPath: String(source.databaseFieldPath || source.database_field_path || source.fieldPath || "").trim(),
            databaseOperator: String(source.databaseOperator || source.database_operator || "equals").trim() || "equals",
            databaseCompareValue: String(source.databaseCompareValue || source.database_compare_value || source.compareValue || "").trim(),
            ...source,
            loopType: normalizedLoopType,
          };
        }

        function normalizeMetronomeApprovalBranches(value) {
          return [
            { id: "true", label: "True", rule: "true" },
            { id: "false", label: "False", rule: "false" },
          ];
        }

        function normalizeMetronomeConditionBranches(value, conditionType = "previous_output_contains") {
          const normalizedConditionType = normalizeMetronomeConditionType(conditionType);
          if (normalizedConditionType === "database_document_field" || normalizedConditionType === "ticket_status") {
            return [
              { id: "true", label: "True", rule: "true" },
              { id: "false", label: "False", rule: "false" },
            ];
          }
          const sourceBranches = Array.isArray(value) ? value : [];
          const usedIds = new Set();
          const normalized = sourceBranches
            .map((branch, index) => {
              const source = branch && typeof branch === "object"
                ? branch
                : { label: String(branch || "") };
              const rawLabel = String(source.label || source.name || "");
              const normalizedRawLabel = rawLabel.trim().toLowerCase();
              const isElse = String(source.id || "").trim() === "else" || normalizedRawLabel === "else" || normalizedRawLabel === "default";
              const baseId = isElse
                ? "else"
                : String(source.id || "condition-" + (index + 1)).trim() || "condition-" + (index + 1);
              let id = baseId;
              let suffix = 2;
              while (usedIds.has(id) && id !== "else") {
                id = baseId + "-" + suffix;
                suffix += 1;
              }
              if (usedIds.has("else") && id === "else") {
                return null;
              }
              usedIds.add(id);
              return {
                id,
                label: isElse ? "Else" : rawLabel,
                rule: String(source.rule || source.expression || source.value || ""),
              };
            })
            .filter(Boolean);
          const conditionBranches = normalized.filter((branch) => branch.id !== "else");
          if (conditionBranches.length === 0) {
            conditionBranches.push({ id: "condition-1", label: normalizedConditionType === "json" ? "Match" : "", rule: "" });
          }
          const elseBranch = normalized.find((branch) => branch.id === "else") || { id: "else", label: "Else", rule: "" };
          return [
            ...conditionBranches,
            { ...elseBranch, id: "else", label: "Else", rule: "" },
          ];
        }

        function createMetronomeConditionBranchId() {
          return "condition-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6);
        }

        const METRONOME_FALLBACK_AGENTS = [
          { id: "assistant-agent", name: "Assistant" },
        ];

        const METRONOME_FALLBACK_COMPUTERS = [
          { id: "default-computer", name: "Default" },
        ];

        const METRONOME_FALLBACK_PROJECTS = [
          { id: "project-context", name: "Project context" },
        ];

        function getMetronomePreferredOption(options, preferredTerms, fallback) {
          const normalizedOptions = Array.isArray(options) ? options.filter(Boolean) : [];
          const terms = (Array.isArray(preferredTerms) ? preferredTerms : [])
            .map((term) => String(term || "").toLowerCase().trim())
            .filter(Boolean);
          const preferred = normalizedOptions.find((option) => {
            const haystack = String((option?.name || "") + " " + (option?.id || "")).toLowerCase();
            return terms.some((term) => haystack.includes(term));
          });
          return preferred || normalizedOptions[0] || fallback || null;
        }

        function getMetronomeSubtypeLabel(kind, subtype) {
          const options = METRONOME_NODE_KIND_META[kind]?.subtypes || [];
          return options.find((item) => item.id === subtype)?.label || options[0]?.label || "";
        }

        const METRONOME_LOOP_NODE_MIN_WIDTH = 420;
        const METRONOME_LOOP_NODE_MIN_HEIGHT = 170;
        const METRONOME_LOOP_NODE_DEFAULT_WIDTH = 560;
        const METRONOME_LOOP_NODE_DEFAULT_HEIGHT = 230;
        const METRONOME_NOTE_NODE_MIN_WIDTH = 180;
        const METRONOME_NOTE_NODE_MIN_HEIGHT = 96;
        const METRONOME_NOTE_NODE_DEFAULT_WIDTH = 250;
        const METRONOME_NOTE_NODE_DEFAULT_HEIGHT = 132;
        const METRONOME_NODE_DEFAULT_WIDTH = 150;
        const METRONOME_NODE_DEFAULT_HEIGHT = 72;

        function normalizeMetronomeNodeDimension(value, fallback) {
          if (typeof value === "number" && Number.isFinite(value) && value > 0) return value;
          if (typeof value === "string") {
            const trimmed = value.trim();
            if (!trimmed || trimmed.toLowerCase() === "auto") return fallback;
            const parsed = Number.parseFloat(trimmed);
            if (Number.isFinite(parsed) && parsed > 0) return parsed;
          }
          return fallback;
        }

        function normalizeMetronomeLoopNodeStyle(style) {
          const source = style && typeof style === "object" ? style : {};
          return {
            ...source,
            width: normalizeMetronomeNodeDimension(source.width, METRONOME_LOOP_NODE_DEFAULT_WIDTH),
            height: normalizeMetronomeNodeDimension(source.height, METRONOME_LOOP_NODE_DEFAULT_HEIGHT),
          };
        }

        function normalizeMetronomeNoteNodeStyle(style) {
          const source = style && typeof style === "object" ? style : {};
          return {
            ...source,
            width: normalizeMetronomeNodeDimension(source.width, METRONOME_NOTE_NODE_DEFAULT_WIDTH),
            height: normalizeMetronomeNodeDimension(source.height, METRONOME_NOTE_NODE_DEFAULT_HEIGHT),
          };
        }

        function isMetronomeLoopNode(node) {
          return String(node?.data?.kind || node?.kind || "").trim() === "loop";
        }

        function isMetronomeNoteNode(node) {
          return String(node?.data?.kind || node?.kind || "").trim() === "note";
        }

	        function getMetronomeNodeParentId(node) {
	          return String(node?.parentId || node?.parentNode || "").trim();
	        }

	        function getMetronomeNodeLoopParentId(node, nodeMap) {
	          const parentId = getMetronomeNodeParentId(node);
	          if (!parentId) return "";
	          const parentNode = nodeMap?.get?.(parentId);
	          return isMetronomeLoopNode(parentNode) ? parentId : "";
	        }

	        function isMetronomeLoopBoundaryConnectionAllowed(sourceNode, targetNode, nodeMap) {
	          if (!sourceNode || !targetNode) return false;
	          const sourceId = String(sourceNode?.id || "").trim();
	          const targetId = String(targetNode?.id || "").trim();
	          const sourceLoopParentId = getMetronomeNodeLoopParentId(sourceNode, nodeMap);
	          const targetLoopParentId = getMetronomeNodeLoopParentId(targetNode, nodeMap);
	          if (!sourceLoopParentId && !targetLoopParentId) return true;
	          if (sourceLoopParentId && sourceLoopParentId === targetLoopParentId) return true;
	          if (targetLoopParentId && sourceId === targetLoopParentId) return true;
	          if (sourceLoopParentId && targetId === sourceLoopParentId) return true;
	          return false;
	        }

	        function repairMetronomeLoopBoundaryEdge(edge, nodeMap, index = 0) {
	          const sourceNode = nodeMap?.get?.(String(edge?.source || ""));
	          const targetNode = nodeMap?.get?.(String(edge?.target || ""));
	          if (!sourceNode || !targetNode) return [];
	          if (isMetronomeLoopBoundaryConnectionAllowed(sourceNode, targetNode, nodeMap)) {
	            return [edge];
	          }
	          const sourceLoopParentId = getMetronomeNodeLoopParentId(sourceNode, nodeMap);
	          const targetLoopParentId = getMetronomeNodeLoopParentId(targetNode, nodeMap);
	          const edgeId = String(edge?.id || "edge_loop_boundary_" + index).trim() || "edge_loop_boundary_" + index;
	          if (sourceLoopParentId && !targetLoopParentId) {
	            return [
	              {
	                ...edge,
	                id: edgeId + "_to_loop_end",
	                target: sourceLoopParentId,
	                targetHandle: "loop-right",
	              },
	              {
	                ...edge,
	                id: edgeId + "_from_loop_end",
	                source: sourceLoopParentId,
	                sourceHandle: "loop-right",
	              },
	            ];
	          }
	          if (!sourceLoopParentId && targetLoopParentId) {
	            return [
	              {
	                ...edge,
	                id: edgeId + "_to_loop_start",
	                target: targetLoopParentId,
	                targetHandle: "loop-left",
	              },
	              {
	                ...edge,
	                id: edgeId + "_from_loop_start",
	                source: targetLoopParentId,
	                sourceHandle: "loop-left",
	                targetHandle: "node-input",
	              },
	            ];
	          }
	          return [];
	        }

	        function getMetronomeNodeDimensions(node) {
          const style = node?.style && typeof node.style === "object" ? node.style : {};
          const measured = node?.measured && typeof node.measured === "object" ? node.measured : {};
          const defaultWidth = isMetronomeLoopNode(node)
            ? METRONOME_LOOP_NODE_DEFAULT_WIDTH
            : isMetronomeNoteNode(node)
              ? METRONOME_NOTE_NODE_DEFAULT_WIDTH
              : METRONOME_NODE_DEFAULT_WIDTH;
          const defaultHeight = isMetronomeLoopNode(node)
            ? METRONOME_LOOP_NODE_DEFAULT_HEIGHT
            : isMetronomeNoteNode(node)
              ? METRONOME_NOTE_NODE_DEFAULT_HEIGHT
              : METRONOME_NODE_DEFAULT_HEIGHT;
          const width = normalizeMetronomeNodeDimension(style.width || node?.width || measured.width, defaultWidth);
          const height = normalizeMetronomeNodeDimension(style.height || node?.height || measured.height, defaultHeight);
          return {
            width: Number.isFinite(width) && width > 0 ? width : defaultWidth,
            height: Number.isFinite(height) && height > 0 ? height : defaultHeight,
          };
        }

        function getMetronomeNodeAbsolutePosition(node, nodeMap) {
          let x = Number(node?.position?.x) || 0;
          let y = Number(node?.position?.y) || 0;
          let parentId = getMetronomeNodeParentId(node);
          const visited = new Set([String(node?.id || "")]);
          while (parentId && nodeMap?.has?.(parentId) && !visited.has(parentId)) {
            visited.add(parentId);
            const parent = nodeMap.get(parentId);
            x += Number(parent?.position?.x) || 0;
            y += Number(parent?.position?.y) || 0;
            parentId = getMetronomeNodeParentId(parent);
          }
          return { x, y };
        }

        function isMetronomePointInsideNode(point, node, nodeMap, padding = 0) {
          if (!point || !node) return false;
          const position = getMetronomeNodeAbsolutePosition(node, nodeMap);
          const dimensions = getMetronomeNodeDimensions(node);
          return point.x >= position.x + padding
            && point.x <= position.x + dimensions.width - padding
            && point.y >= position.y + padding
            && point.y <= position.y + dimensions.height - padding;
        }

        function findMetronomeLoopNodeAtPoint(nodes, point, excludeNodeId = "") {
          const nodeMap = new Map((Array.isArray(nodes) ? nodes : []).map((node) => [String(node?.id || ""), node]));
          const normalizedExcludeId = String(excludeNodeId || "").trim();
          const loops = (Array.isArray(nodes) ? nodes : [])
            .filter((node) => isMetronomeLoopNode(node) && String(node.id || "") !== normalizedExcludeId)
            .filter((node) => isMetronomePointInsideNode(point, node, nodeMap, 14));
          if (!loops.length) return null;
          return loops.sort((a, b) => {
            const aArea = getMetronomeNodeDimensions(a).width * getMetronomeNodeDimensions(a).height;
            const bArea = getMetronomeNodeDimensions(b).width * getMetronomeNodeDimensions(b).height;
            return aArea - bArea;
          })[0] || null;
        }

        function normalizeMetronomeNodeOrder(nodes) {
          const source = Array.isArray(nodes) ? nodes : [];
          const depthCache = new Map();
          const nodeMap = new Map(source.map((node) => [String(node?.id || ""), node]));
          const getDepth = (node) => {
            const nodeId = String(node?.id || "");
            if (depthCache.has(nodeId)) return depthCache.get(nodeId);
            const parentId = getMetronomeNodeParentId(node);
            const depth = parentId && nodeMap.has(parentId) ? getDepth(nodeMap.get(parentId)) + 1 : 0;
            depthCache.set(nodeId, depth);
            return depth;
          };
          return [...source].sort((a, b) => {
            const depthDelta = getDepth(a) - getDepth(b);
            if (depthDelta !== 0) return depthDelta;
            const aIsLoop = isMetronomeLoopNode(a) ? 0 : 1;
            const bIsLoop = isMetronomeLoopNode(b) ? 0 : 1;
            if (aIsLoop !== bIsLoop) return aIsLoop - bIsLoop;
            return source.indexOf(a) - source.indexOf(b);
          });
        }

        function attachMetronomeNodeToLoop(nodes, nodeId, loopNode) {
          const source = Array.isArray(nodes) ? nodes : [];
          const normalizedNodeId = String(nodeId || "").trim();
          if (!normalizedNodeId || !loopNode?.id) return { nodes: source, changed: false };
          const nodeMap = new Map(source.map((node) => [String(node?.id || ""), node]));
          const node = nodeMap.get(normalizedNodeId);
          if (!node || isMetronomeLoopNode(node)) return { nodes: source, changed: false };
          const currentParentId = getMetronomeNodeParentId(node);
          const nextParentId = String(loopNode.id || "").trim();
          const absolutePosition = getMetronomeNodeAbsolutePosition(node, nodeMap);
          const loopPosition = getMetronomeNodeAbsolutePosition(loopNode, nodeMap);
          const nextPosition = {
            x: Math.max(24, absolutePosition.x - loopPosition.x),
            y: Math.max(48, absolutePosition.y - loopPosition.y),
          };
          const changed = currentParentId !== nextParentId
            || Math.abs((Number(node.position?.x) || 0) - nextPosition.x) > 0.5
            || Math.abs((Number(node.position?.y) || 0) - nextPosition.y) > 0.5
            || node.extent !== "parent";
          if (!changed) return { nodes: source, changed: false };
          const nextNodes = source.map((item) => {
            if (String(item?.id || "") !== normalizedNodeId) return item;
            return {
              ...item,
              parentId: nextParentId,
              parentNode: undefined,
              extent: "parent",
              position: nextPosition,
            };
          });
          return { nodes: normalizeMetronomeNodeOrder(nextNodes), changed: true };
        }

        function detachMetronomeNodeFromLoop(nodes, nodeId) {
          const source = Array.isArray(nodes) ? nodes : [];
          const normalizedNodeId = String(nodeId || "").trim();
          if (!normalizedNodeId) return { nodes: source, changed: false };
          const nodeMap = new Map(source.map((node) => [String(node?.id || ""), node]));
          const node = nodeMap.get(normalizedNodeId);
          if (!node || !getMetronomeNodeParentId(node)) return { nodes: source, changed: false };
          const absolutePosition = getMetronomeNodeAbsolutePosition(node, nodeMap);
          const nextNodes = source.map((item) => {
            if (String(item?.id || "") !== normalizedNodeId) return item;
            const { parentId, parentNode, extent, ...rest } = item;
            return {
              ...rest,
              position: absolutePosition,
            };
          });
          return { nodes: normalizeMetronomeNodeOrder(nextNodes), changed: true };
        }

        function reparentMetronomeNodeByDrop(nodes, nodeId) {
          const source = Array.isArray(nodes) ? nodes : [];
          const nodeMap = new Map(source.map((node) => [String(node?.id || ""), node]));
          const node = nodeMap.get(String(nodeId || ""));
          if (!node || isMetronomeLoopNode(node)) return { nodes: source, changed: false };
          const absolutePosition = getMetronomeNodeAbsolutePosition(node, nodeMap);
          const dimensions = getMetronomeNodeDimensions(node);
          const centerPoint = {
            x: absolutePosition.x + dimensions.width / 2,
            y: absolutePosition.y + dimensions.height / 2,
          };
          const loopNode = findMetronomeLoopNodeAtPoint(source, centerPoint, node.id);
          if (loopNode) {
            return attachMetronomeNodeToLoop(source, node.id, loopNode);
          }
          return detachMetronomeNodeFromLoop(source, node.id);
        }

        function stopMetronomeInputKeyPropagation(event) {
          if (!event || typeof event.stopPropagation !== "function") return;
          event.stopPropagation();
          if (event.nativeEvent && typeof event.nativeEvent.stopImmediatePropagation === "function") {
            event.nativeEvent.stopImmediatePropagation();
          }
        }

        function stopMetronomePointerPropagation(event) {
          if (!event || typeof event.stopPropagation !== "function") return;
          event.stopPropagation();
        }

        function getMetronomeTextInputKeyHandlers(handleKeyDown) {
          return {
            onKeyDownCapture: stopMetronomeInputKeyPropagation,
            onKeyUpCapture: stopMetronomeInputKeyPropagation,
            onKeyDown: (event) => {
              stopMetronomeInputKeyPropagation(event);
              if (typeof handleKeyDown === "function") {
                handleKeyDown(event);
              }
            },
            onKeyUp: stopMetronomeInputKeyPropagation,
          };
        }

        function createMetronomeNode(kind, position, overrides = {}) {
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const overrideConfig = overrides.config || {};
          const subtype = overrides.subtype || meta.subtypes[0]?.id || kind;
          const normalizedSubtype = kind === "trigger" && subtype === "thread"
            ? "thread_event"
            : kind === "loop"
              ? normalizeMetronomeLoopType(subtype)
              : kind === "ticket"
                ? normalizeMetronomeTicketOperation(subtype || overrideConfig.operation)
              : subtype;
          const nodeId = overrides.id || "node_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
          const conditionType = kind === "condition"
            ? normalizeMetronomeConditionType(overrideConfig.conditionType || normalizedSubtype)
            : "";
          const nextNode = {
            id: nodeId,
            type: "metronome",
            position: position || { x: 120, y: 140 },
            data: {
              kind,
              label: normalizeMetronomeNodeLabel(overrides.label || meta.label, kind, normalizedSubtype),
              subtype: normalizedSubtype,
              description: overrides.description || getMetronomeSubtypeLabel(kind, normalizedSubtype),
	              config: kind === "condition"
	                ? {
	                    conditionType,
	                    databaseId: "",
	                    databaseName: "",
	                    databaseCollection: "",
	                    databaseDocumentId: "",
	                    databaseFieldPath: "",
	                    databaseOperator: "equals",
                    databaseCompareValue: "",
                    ticketProjectId: "",
                    ticketProjectName: "",
                    ticketId: "",
                    ticketStatusOperator: "equals",
                    ticketStatusValue: "planned",
                    ...overrideConfig,
                    conditionType,
                    conditions: normalizeMetronomeConditionBranches(overrideConfig.conditions, conditionType),
                  }
                : kind === "trigger"
                  ? {
                      triggerType: normalizedSubtype,
                      threadCommand: "@metronome",
                      promptExtension: "",
                      ...(
                        normalizedSubtype === "periodic"
                          ? buildDefaultMetronomeScheduleConfig(overrideConfig)
                          : {}
                      ),
                      ...(
                        normalizedSubtype === "email"
                          ? buildDefaultMetronomeEmailTriggerConfig(null, { id: nodeId }, overrideConfig)
                          : {}
                      ),
                      ...(
                        normalizedSubtype === "function"
                          ? buildDefaultMetronomeFunctionTriggerConfig(null, { id: nodeId }, overrideConfig)
                          : {}
                      ),
                      ...overrideConfig,
	                    }
	                : kind === "metronome"
                  ? {
                      ...overrideConfig,
                    }
                : kind === "ticket"
                  ? {
                      operation: normalizedSubtype,
                      projectId: "",
                      projectName: "",
                      ticketId: "",
                      ticketTitle: "",
                      ticketStatus: "planned",
                      comment: "",
                      adaptationInstructions: "",
                      subtaskTitle: "",
                      subtaskInstructions: "Create a focused subtask from the workflow context.",
                      workInstructions: "Start work on this ticket and return a short implementation summary.",
                      agentId: METRONOME_FALLBACK_AGENTS[0].id,
                      agentName: METRONOME_FALLBACK_AGENTS[0].name,
                      environmentId: METRONOME_FALLBACK_COMPUTERS[0].id,
                      environmentName: METRONOME_FALLBACK_COMPUTERS[0].name,
                      fieldsJson: "{\n  \"status\": \"planned\"\n}",
                      ...overrideConfig,
                      operation: normalizeMetronomeTicketOperation(overrideConfig.operation || normalizedSubtype),
                    }
                : kind === "function"
                  ? {
                      functionId: "",
                      functionName: "",
                      payloadJson: "",
                      ...overrideConfig,
                    }
                : kind === "firecrawl"
                  ? createDefaultMetronomeFirecrawlConfig(normalizedSubtype, overrideConfig)
                : kind === "table"
                  ? createDefaultMetronomeTableConfig(normalizedSubtype, overrideConfig)
                : kind === "database"
                  ? createDefaultMetronomeDatabaseConfig(normalizedSubtype, overrideConfig)
	                : kind === "imagine"
	                  ? {
	                      mediaMode: "image",
	                      modelId: METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS[0].id,
	                      imageModelId: METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS[0].id,
	                      videoModelId: METRONOME_IMAGINE_VIDEO_MODEL_OPTIONS[0].id,
	                      prompt: "Create an image from this workflow context.",
	                      templateId: "",
	                      templateName: "",
	                      attachments: [],
	                      attachmentsJson: "[]",
	                      projectId: "",
	                      projectName: "",
	                      agentId: METRONOME_FALLBACK_AGENTS[0].id,
	                      agentName: METRONOME_FALLBACK_AGENTS[0].name,
	                      contextType: "computer",
	                      resource: "computer",
	                      environmentId: METRONOME_FALLBACK_COMPUTERS[0].id,
	                      environmentName: METRONOME_FALLBACK_COMPUTERS[0].name,
	                      inputContextScope: "all",
	                      aspectRatio: "",
	                      ...overrideConfig,
	                    }
		                : kind === "loop"
		                  ? createDefaultMetronomeLoopConfig(normalizedSubtype, overrideConfig)
		                : kind === "function"
		                  ? createDefaultMetronomeFunctionConfig(overrideConfig)
		                : kind === "action"
		                  ? {
		                      message: "Review the current project and propose the next action.",
		                      attachments: [],
		                      agentId: METRONOME_FALLBACK_AGENTS[0].id,
		                      agentName: METRONOME_FALLBACK_AGENTS[0].name,
		                      contextType: "computer",
		                      resource: "computer",
		                      environmentId: METRONOME_FALLBACK_COMPUTERS[0].id,
		                      environmentName: METRONOME_FALLBACK_COMPUTERS[0].name,
		                      inputContextScope: "all",
                          ...createDefaultMetronomeThreadOutputConfig(overrideConfig),
			                      ...overrideConfig,
			                    }
		                : kind === "note"
		                  ? {
		                      note: overrideConfig.note || "Hi",
		                      ...overrideConfig,
		                    }
		                : kind === "approval"
		                  ? {
		                      message: "Approve this workflow step before it continues.",
	                      conditions: normalizeMetronomeApprovalBranches(overrideConfig.conditions),
	                      conditionType: "user_approval",
	                      ...overrideConfig,
	                      conditions: normalizeMetronomeApprovalBranches(overrideConfig.conditions),
	                    }
                : overrideConfig,
            },
          };
          if (kind === "loop") {
            nextNode.style = normalizeMetronomeLoopNodeStyle(overrides.style);
            nextNode.data.label = normalizeMetronomeNodeLabel(overrides.label || meta.label, kind, normalizedSubtype);
            nextNode.data.description = overrides.description || getMetronomeSubtypeLabel(kind, normalizedSubtype);
          } else if (kind === "note") {
            nextNode.style = normalizeMetronomeNoteNodeStyle(overrides.style);
          } else if (overrides.style && typeof overrides.style === "object") {
            nextNode.style = overrides.style;
          }
          if (overrides.parentId || overrides.parentNode) {
            nextNode.parentId = String(overrides.parentId || overrides.parentNode);
            nextNode.extent = overrides.extent || "parent";
          }
          return nextNode;
        }

        function createMetronomeEdge(id, source, target, options = {}) {
          return {
            id,
            source,
            target,
            type: "metronomeOutput",
            ...(options.sourceHandle ? { sourceHandle: options.sourceHandle } : {}),
            ...(options.targetHandle ? { targetHandle: options.targetHandle } : {}),
          };
        }

        function createDefaultMetronomeGraph(options = {}) {
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_start",
            subtype: "thread_event",
            label: "Trigger",
            description: "Start when a thread message begins with @workflow.",
            config: {
              triggerType: "thread_event",
              threadCommand: "@workflow",
              promptExtension: "Capture the request, preserve the user's intent, and pass the full context into the workflow.",
            },
          });
          const intakeThread = createMetronomeNode("action", { x: 390, y: 260 }, {
            id: "thread_triage_request",
            subtype: "start_thread",
            label: "Thread",
            description: "Ask an agent to classify the request and decide the next path.",
            config: {
              message: "Triage the incoming workflow request. Return a concise summary and include the word READY if the request is actionable. If the request is missing context, explain what is needed.",
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 720, y: 236 }, {
            id: "condition_request_ready",
            subtype: "previous_output_contains",
            label: "Condition",
            description: "Branch by accumulated workflow context.",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Ready", rule: "READY" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const executeThread = createMetronomeNode("action", { x: 1060, y: 144 }, {
            id: "thread_execute_work",
            subtype: "start_thread",
            label: "Thread",
            description: "Ask an agent to execute the actionable request.",
            config: {
              message: "Use the workflow context to execute the actionable request. Produce a short run summary with the completed work, files, resources, tickets, or follow-up items.",
              inputContextScope: "all",
            },
          });
          const clarifyThread = createMetronomeNode("action", { x: 1060, y: 344 }, {
            id: "thread_request_clarification",
            subtype: "start_thread",
            label: "Thread",
            description: "Ask an agent to prepare a clarification request.",
            config: {
              message: "Use the workflow context to write a concise clarification request. Ask only for the missing details required to continue.",
              inputContextScope: "all",
            },
          });
          const executeEnd = createMetronomeNode("end", { x: 1390, y: 144 }, {
            id: "end_executed",
            subtype: "complete",
            label: "End",
            description: "Finish after the work path completes.",
            config: {},
          });
          const clarifyEnd = createMetronomeNode("end", { x: 1390, y: 344 }, {
            id: "end_clarification",
            subtype: "complete",
            label: "End",
            description: "Finish after the clarification path completes.",
            config: {},
          });
          return {
            nodes: [trigger, intakeThread, condition, executeThread, clarifyThread, executeEnd, clarifyEnd],
            edges: [
              createMetronomeEdge("edge_trigger_triage", "trigger_start", "thread_triage_request"),
              createMetronomeEdge("edge_triage_condition", "thread_triage_request", "condition_request_ready"),
              createMetronomeEdge("edge_ready_execute", "condition_request_ready", "thread_execute_work", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_default_clarify", "condition_request_ready", "thread_request_clarification", { sourceHandle: "else" }),
              createMetronomeEdge("edge_execute_end", "thread_execute_work", "end_executed"),
              createMetronomeEdge("edge_clarify_end", "thread_request_clarification", "end_clarification"),
            ],
          };
        }

        function createProjectReleaseWatchdogMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_ticket_review",
            subtype: "project_ticket",
            label: "Trigger",
            config: {
              triggerType: "project_ticket",
              ticketEventType: "status_changed",
              ticketProjectId: projectId,
              ticketProjectName: projectName,
              ticketFromStatus: "in_progress",
              ticketToStatus: "in_review",
            },
          });
          const reviewer = createMetronomeNode("action", { x: 400, y: 260 }, {
            id: "thread_review_ticket",
            config: {
              message: "Review the ticket that moved into review. Check acceptance criteria, implementation notes, linked files, and deployment context. Return CHANGES REQUESTED if work should go back, otherwise return APPROVED with a concise review summary.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 730, y: 236 }, {
            id: "condition_review_result",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Changes requested", rule: "CHANGES REQUESTED" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const changeComment = createMetronomeNode("ticket", { x: 1080, y: 132 }, {
            id: "ticket_post_review_changes",
            subtype: "add_ticket_comment",
            config: {
              operation: "add_ticket_comment",
              projectId,
              projectName,
              comment: "Review found changes needed. Use the workflow context and previous review summary to write the exact follow-up comment.",
            },
          });
          const approveStatus = createMetronomeNode("ticket", { x: 1080, y: 344 }, {
            id: "ticket_mark_review_done",
            subtype: "move_ticket_status",
            config: {
              operation: "move_ticket_status",
              projectId,
              projectName,
              ticketStatus: "done",
            },
          });
          const endChanges = createMetronomeNode("end", { x: 1410, y: 132 }, { id: "end_changes_requested" });
          const endApproved = createMetronomeNode("end", { x: 1410, y: 344 }, { id: "end_review_approved" });
          return {
            nodes: [trigger, reviewer, condition, changeComment, approveStatus, endChanges, endApproved],
            edges: [
              createMetronomeEdge("edge_ticket_review_thread", "trigger_ticket_review", "thread_review_ticket"),
              createMetronomeEdge("edge_review_condition", "thread_review_ticket", "condition_review_result"),
              createMetronomeEdge("edge_review_changes_comment", "condition_review_result", "ticket_post_review_changes", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_review_approved_status", "condition_review_result", "ticket_mark_review_done", { sourceHandle: "else" }),
              createMetronomeEdge("edge_changes_end", "ticket_post_review_changes", "end_changes_requested"),
              createMetronomeEdge("edge_approved_end", "ticket_mark_review_done", "end_review_approved"),
            ],
          };
        }

        function createCampaignAssetFactoryMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_campaign_command",
            subtype: "thread_event",
            config: {
              triggerType: "thread_event",
              threadCommand: "@campaign",
              promptExtension: "Treat this as a campaign production brief. Preserve brand constraints, audience, offer, channels, and deadline.",
            },
          });
          const imagine = createMetronomeNode("imagine", { x: 390, y: 260 }, {
            id: "imagine_campaign_assets",
            config: {
              mediaMode: "image",
              prompt: "Create campaign-ready image concepts from the workflow brief. Use brand-forward composition, strong visual hierarchy, and enough negative space for copy.",
              templateId: "fashion-campaigns",
              templateName: "Fashion campaigns",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const qualityReview = createMetronomeNode("action", { x: 720, y: 260 }, {
            id: "thread_campaign_quality_review",
            config: {
              message: "Review the generated campaign assets against the brief. Return REVISION if the assets need another pass, otherwise return READY with launch notes and suggested copy.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 1050, y: 236 }, {
            id: "condition_campaign_ready",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Revision", rule: "REVISION" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const revisionThread = createMetronomeNode("action", { x: 1390, y: 132 }, {
            id: "thread_campaign_revision",
            config: {
              message: "Turn the review notes into a precise revision brief for the next asset generation pass.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const launchThread = createMetronomeNode("action", { x: 1390, y: 344 }, {
            id: "thread_campaign_launch_pack",
            config: {
              message: "Prepare the launch handoff: final asset summary, copy options, channel recommendations, and next steps.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const endRevision = createMetronomeNode("end", { x: 1720, y: 132 }, { id: "end_campaign_revision" });
          const endLaunch = createMetronomeNode("end", { x: 1720, y: 344 }, { id: "end_campaign_ready" });
          return {
            nodes: [trigger, imagine, qualityReview, condition, revisionThread, launchThread, endRevision, endLaunch],
            edges: [
              createMetronomeEdge("edge_campaign_trigger_imagine", "trigger_campaign_command", "imagine_campaign_assets"),
              createMetronomeEdge("edge_campaign_imagine_review", "imagine_campaign_assets", "thread_campaign_quality_review"),
              createMetronomeEdge("edge_campaign_review_condition", "thread_campaign_quality_review", "condition_campaign_ready"),
              createMetronomeEdge("edge_campaign_revision", "condition_campaign_ready", "thread_campaign_revision", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_campaign_launch", "condition_campaign_ready", "thread_campaign_launch_pack", { sourceHandle: "else" }),
              createMetronomeEdge("edge_campaign_revision_end", "thread_campaign_revision", "end_campaign_revision"),
              createMetronomeEdge("edge_campaign_launch_end", "thread_campaign_launch_pack", "end_campaign_ready"),
            ],
          };
        }

        function createInboundResearchTriageMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_research_email",
            subtype: "email",
            config: {
              triggerType: "email",
              emailLocalPart: "research",
              emailAddress: buildMetronomeEmailAddress("research"),
              subjectContains: "",
              bodyContains: "",
              promptExtension: "Treat this email as an inbound research request. Extract the ask, urgency, stakeholder, and deliverable format.",
            },
          });
          const researchThread = createMetronomeNode("action", { x: 400, y: 260 }, {
            id: "thread_research_summary",
            config: {
              message: "Research the inbound request, collect useful sources, and produce an executive summary. Return NEEDS HUMAN REVIEW if the request requires approval, pricing judgment, legal review, or unclear scope.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const condition = createMetronomeNode("condition", { x: 735, y: 236 }, {
            id: "condition_research_review",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Human review", rule: "NEEDS HUMAN REVIEW" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const reviewTicket = createMetronomeNode("ticket", { x: 1080, y: 132 }, {
            id: "ticket_research_review",
            subtype: "add_subtask",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Review inbound research request",
              subtaskInstructions: "Create a focused human review task from the research summary and include the unresolved decision.",
            },
          });
          const responseThread = createMetronomeNode("action", { x: 1080, y: 344 }, {
            id: "thread_research_response",
            config: {
              message: "Draft a concise response to the requester with the research summary, source links, and recommended next action.",
              contextType: projectId ? "project" : "computer",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const endReview = createMetronomeNode("end", { x: 1410, y: 132 }, { id: "end_research_review" });
          const endResponse = createMetronomeNode("end", { x: 1410, y: 344 }, { id: "end_research_response" });
          return {
            nodes: [trigger, researchThread, condition, reviewTicket, responseThread, endReview, endResponse],
            edges: [
              createMetronomeEdge("edge_research_email_thread", "trigger_research_email", "thread_research_summary"),
              createMetronomeEdge("edge_research_thread_condition", "thread_research_summary", "condition_research_review"),
              createMetronomeEdge("edge_research_review_ticket", "condition_research_review", "ticket_research_review", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_research_response_thread", "condition_research_review", "thread_research_response", { sourceHandle: "else" }),
              createMetronomeEdge("edge_research_review_end", "ticket_research_review", "end_research_review"),
              createMetronomeEdge("edge_research_response_end", "thread_research_response", "end_research_response"),
            ],
          };
        }

        function createDatabaseEnrichmentLoopMetronomeGraph(options = {}) {
          const trigger = createMetronomeNode("trigger", { x: 90, y: 260 }, {
            id: "trigger_database_document",
            subtype: "database_entry",
            config: {
              triggerType: "database_entry",
              databaseEventType: "document_created",
              databaseCollection: "inbound",
              promptExtension: "Treat the new document as a record that should be validated, enriched, and written back with a clear confidence signal.",
            },
          });
          const enrichmentFunction = createMetronomeNode("function", { x: 410, y: 260 }, {
            id: "function_enrich_record",
            subtype: "invoke_function",
            config: {
              functionName: "enrich-record",
              payloadJson: "{\n  \"record\": \"{{ input }}\",\n  \"source\": \"metronome\"\n}",
            },
          });
          const condition = createMetronomeNode("condition", { x: 735, y: 236 }, {
            id: "condition_enrichment_confidence",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Low confidence", rule: "LOW CONFIDENCE" },
                { id: "else", label: "Default", rule: "" },
              ],
            },
          });
          const verificationThread = createMetronomeNode("action", { x: 1080, y: 132 }, {
            id: "thread_verify_record",
            config: {
              message: "Manually inspect the enriched record. Resolve missing fields if possible and summarize whether it is safe to write back.",
              inputContextScope: "all",
            },
          });
          const updateReviewed = createMetronomeNode("database", { x: 1410, y: 132 }, {
            id: "database_update_reviewed_record",
            subtype: "update_document",
            config: {
              collection: "inbound",
              databaseCollection: "inbound",
              documentId: "{{ input.documentId }}",
              documentJson: "{\n  \"status\": \"reviewed\",\n  \"summary\": \"{{ input }}\"\n}",
            },
          });
          const updateEnriched = createMetronomeNode("database", { x: 1080, y: 344 }, {
            id: "database_update_enriched_record",
            subtype: "update_document",
            config: {
              collection: "inbound",
              databaseCollection: "inbound",
              documentId: "{{ input.documentId }}",
              documentJson: "{\n  \"status\": \"enriched\",\n  \"payload\": \"{{ input }}\"\n}",
            },
          });
          const endReviewed = createMetronomeNode("end", { x: 1740, y: 132 }, { id: "end_database_reviewed" });
          const endEnriched = createMetronomeNode("end", { x: 1410, y: 344 }, { id: "end_database_enriched" });
          return {
            nodes: [trigger, enrichmentFunction, condition, verificationThread, updateReviewed, updateEnriched, endReviewed, endEnriched],
            edges: [
              createMetronomeEdge("edge_database_trigger_function", "trigger_database_document", "function_enrich_record"),
              createMetronomeEdge("edge_function_condition", "function_enrich_record", "condition_enrichment_confidence"),
              createMetronomeEdge("edge_low_confidence_thread", "condition_enrichment_confidence", "thread_verify_record", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_verified_database", "thread_verify_record", "database_update_reviewed_record"),
              createMetronomeEdge("edge_confident_database", "condition_enrichment_confidence", "database_update_enriched_record", { sourceHandle: "else" }),
              createMetronomeEdge("edge_reviewed_end", "database_update_reviewed_record", "end_database_reviewed"),
              createMetronomeEdge("edge_enriched_end", "database_update_enriched_record", "end_database_enriched"),
            ],
          };
        }

        function createRestaurantHyperEnrichmentMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 300 }, {
            id: "trigger_restaurant_csv",
            subtype: "thread_event",
            label: "CSV Input",
            description: "Start from @restaurant-enrichment with an attached restaurant CSV.",
            config: {
              triggerType: "thread_event",
              threadCommand: "@restaurant-enrichment",
              promptExtension: "Use the attached restaurant CSV as the batch input. Preserve Record ID, Company name, Website URL, Country, and City.",
            },
          });
          const table = createMetronomeNode("table", { x: 390, y: 300 }, {
            id: "table_parse_restaurants",
            subtype: "parse_csv",
            label: "Parse CSV",
            description: "Convert the uploaded CSV into restaurant records and batches of 5.",
            config: {
              operation: "parse_csv",
              inputBinding: "workflow.trigger.input.files",
              hasHeader: true,
              batchSize: 5,
              outputKey: "restaurant_table",
            },
          });
          const loop = createMetronomeNode("loop", { x: 700, y: 140 }, {
            id: "loop_restaurant_batches",
            subtype: "input_items",
            label: "Batch Loop",
            description: "Loop through CSV batches so search and extraction can short-circuit per batch.",
            style: { width: 1080, height: 360 },
            config: {
              loopType: "input_items",
              inputBinding: "previous.restaurant_table.batches",
              maxIterations: 500,
              progressSignal: "Each iteration should produce menu-detection records for the current batch.",
              successCriteria: "Every input restaurant in the batch has a structured output record.",
              noProgressLimit: 3,
            },
          });
          const search = createMetronomeNode("firecrawl", { x: 74, y: 128 }, {
            id: "firecrawl_find_menu_pages",
            parentId: "loop_restaurant_batches",
            subtype: "web_search",
            label: "Find Menus",
            description: "Search the web for official menu pages for the current restaurant batch.",
            config: {
              operation: "web_search",
              inputBinding: "current.records",
              query: [
                "Find official menu pages for these restaurants. Prefer official websites, menu URLs, PDF menus, ordering pages, and image menu pages.",
                "Return result pages that help determine whether a menu exists online.",
                "Batch records:",
                "{{ input }}",
              ].join("\\n"),
              limit: 8,
              outputKey: "menu_search",
            },
          });
          const detectMenus = createMetronomeNode("action", { x: 404, y: 128 }, {
            id: "thread_detect_menus",
            parentId: "loop_restaurant_batches",
            subtype: "start_thread",
            label: "Detect Menus",
            description: "Map search results back to the batch and produce structured menu-detection records.",
            config: {
              ...workspaceConfig,
              message: [
                "You are processing one batch in a restaurant enrichment workflow.",
                "Use the current batch records and Firecrawl search results to produce exactly one output record per input restaurant.",
                "Do not invent menu URLs. If the evidence is weak, set menu_found to false and explain briefly.",
                "Preserve the input Record ID / record_id, company name, website URL, country, and city.",
              ].join("\\n"),
              inputContextScope: "all",
              outputMode: "structured",
              requireJsonOutput: true,
              outputKey: "menu_detection",
              outputContractJson: JSON.stringify({
                summary: "",
                records: [
                  {
                    record_id: "",
                    company_name: "",
                    website_url: "",
                    country: "",
                    city: "",
                    menu_found: false,
                    menu_url: null,
                    menu_source_type: null,
                    confidence: 0,
                    evidence_urls: [],
                    notes: "",
                  },
                ],
              }, null, 2),
            },
          });
          const persist = createMetronomeNode("database", { x: 734, y: 128 }, {
            id: "database_upsert_menu_detection",
            parentId: "loop_restaurant_batches",
            subtype: "upsert_many_documents",
            label: "Persist Batch",
            description: "Write structured menu-detection records into a Computer Agents database collection.",
            config: {
              operation: "upsert_many_documents",
              collection: "restaurant_enrichment",
              databaseCollection: "restaurant_enrichment",
              recordsBinding: "previous.menu_detection.records",
              upsertKey: "record_id",
              documentTemplateJson: JSON.stringify({
                step: "menu_detection",
                source: "metronome.restaurant_hyper_enrichment",
                record_id: "{{ input.record_id }}",
                company_name: "{{ input.company_name }}",
                menu_found: "{{ input.menu_found }}",
                menu_url: "{{ input.menu_url }}",
                payload: "{{ input }}",
              }, null, 2),
              outputKey: "persisted_menu_detection",
            },
          });
          const report = createMetronomeNode("action", { x: 1840, y: 620 }, {
            id: "thread_restaurant_run_report",
            subtype: "start_thread",
            label: "Run Report",
            description: "Summarize the batch run and list remaining production steps.",
            config: {
              ...workspaceConfig,
              message: [
                "Summarize this restaurant enrichment workflow run from the structured workflow context.",
                "Report parsed rows, processed batches, menu_found count if available, persisted records, failures, and next implementation steps for extraction, enrichment, outcome.csv, cost report, and accuracy report.",
              ].join("\\n"),
              inputContextScope: "all",
              outputMode: "structured",
              requireJsonOutput: true,
              outputKey: "run_report",
              outputContractJson: JSON.stringify({
                summary: "",
                parsed_rows: null,
                processed_batches: null,
                menu_found_count: null,
                persisted_records: null,
                failures: [],
                next_steps: [],
              }, null, 2),
            },
          });
          const done = createMetronomeNode("end", { x: 2160, y: 620 }, {
            id: "end_restaurant_enrichment",
            subtype: "complete",
            label: "End",
            description: "Finish after the run report is produced.",
            config: {},
          });
          return {
            nodes: [trigger, table, loop, search, detectMenus, persist, report, done],
            edges: [
              createMetronomeEdge("edge_restaurant_trigger_table", "trigger_restaurant_csv", "table_parse_restaurants"),
              createMetronomeEdge("edge_restaurant_table_loop", "table_parse_restaurants", "loop_restaurant_batches", { targetHandle: "loop-left" }),
              createMetronomeEdge("edge_restaurant_loop_search", "loop_restaurant_batches", "firecrawl_find_menu_pages", { sourceHandle: "loop-left", targetHandle: "node-input" }),
              createMetronomeEdge("edge_restaurant_search_detect", "firecrawl_find_menu_pages", "thread_detect_menus"),
              createMetronomeEdge("edge_restaurant_detect_persist", "thread_detect_menus", "database_upsert_menu_detection"),
              createMetronomeEdge("edge_restaurant_persist_loop_end", "database_upsert_menu_detection", "loop_restaurant_batches", { sourceHandle: "node-output", targetHandle: "loop-right" }),
              createMetronomeEdge("edge_restaurant_loop_report", "loop_restaurant_batches", "thread_restaurant_run_report", { sourceHandle: "loop-right", targetHandle: "node-input" }),
              createMetronomeEdge("edge_restaurant_report_end", "thread_restaurant_run_report", "end_restaurant_enrichment"),
            ],
          };
        }

        function createCustomerSupportEmailTemplateMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 280 }, {
            id: "trigger_support_email",
            subtype: "email",
            label: "Support Email",
            description: "Start when a customer support email arrives.",
            config: {
              triggerType: "email",
              emailLocalPart: "support",
              emailAddress: buildMetronomeEmailAddress("support"),
              subjectContains: "",
              bodyContains: "",
              promptExtension: "Treat this email as a customer support request. Extract requester, account, urgency, product area, promised SLA, and the exact question before drafting.",
            },
          });
          const classify = createMetronomeNode("action", { x: 405, y: 280 }, {
            id: "thread_support_classify",
            subtype: "start_thread",
            label: "Classify",
            description: "Classify intent, urgency, account, and product area.",
            config: {
              ...workspaceConfig,
              message: "Classify the incoming support email. Return intent, urgency, customer/account, product area, blockers, and whether the case can be answered from available project context.",
              inputContextScope: "all",
            },
          });
          const research = createMetronomeNode("action", { x: 735, y: 280 }, {
            id: "thread_support_research",
            subtype: "start_thread",
            label: "Research",
            description: "Search project files, knowledge sources, and connected resources.",
            config: {
              ...workspaceConfig,
              message: "Search the project context and connected resources for the support answer. Include exact references, source file names, prior decisions, and missing information.",
              inputContextScope: "all",
            },
          });
          const draft = createMetronomeNode("action", { x: 1065, y: 280 }, {
            id: "thread_support_draft_reply",
            subtype: "start_thread",
            label: "Draft Reply",
            description: "Draft a customer-ready answer with evidence and next steps.",
            config: {
              ...workspaceConfig,
              message: "Draft a concise support reply. Use a helpful tone, cite the evidence gathered, list concrete next steps, and return NEEDS REVIEW if confidence is low, the answer affects billing/legal/security, or source context is missing.",
              inputContextScope: "all",
            },
          });
          const reviewGate = createMetronomeNode("condition", { x: 1395, y: 256 }, {
            id: "condition_support_review_needed",
            label: "Review Gate",
            description: "Route low-confidence replies to human review.",
            config: {
              conditionType: "previous_output_contains",
              conditions: [
                { id: "condition-1", label: "Needs review", rule: "NEEDS REVIEW" },
                { id: "else", label: "Ready", rule: "" },
              ],
            },
          });
          const reviewTask = createMetronomeNode("ticket", { x: 1740, y: 132 }, {
            id: "ticket_support_human_review",
            subtype: "add_subtask",
            label: "Review Task",
            description: "Create a review task for uncertain support replies.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Review support reply",
              subtaskInstructions: "Review the drafted support reply, fill missing context, and approve the final response before it is sent.",
            },
          });
          const sendReply = createMetronomeNode("action", { x: 1740, y: 380 }, {
            id: "thread_support_send_reply",
            subtype: "start_thread",
            label: "Send Reply",
            description: "Prepare the approved response for delivery back to the customer.",
            config: {
              ...workspaceConfig,
              message: "Prepare the final customer reply from the approved draft. Include the response, evidence summary, and any follow-up task that should be tracked.",
              inputContextScope: "all",
            },
          });
          const reviewEnd = createMetronomeNode("end", { x: 2070, y: 132 }, { id: "end_support_review" });
          const sentEnd = createMetronomeNode("end", { x: 2070, y: 380 }, { id: "end_support_sent" });
          return {
            nodes: [trigger, classify, research, draft, reviewGate, reviewTask, sendReply, reviewEnd, sentEnd],
            edges: [
              createMetronomeEdge("edge_support_email_classify", "trigger_support_email", "thread_support_classify"),
              createMetronomeEdge("edge_support_classify_research", "thread_support_classify", "thread_support_research"),
              createMetronomeEdge("edge_support_research_draft", "thread_support_research", "thread_support_draft_reply"),
              createMetronomeEdge("edge_support_draft_gate", "thread_support_draft_reply", "condition_support_review_needed"),
              createMetronomeEdge("edge_support_gate_review", "condition_support_review_needed", "ticket_support_human_review", { sourceHandle: "condition-1" }),
              createMetronomeEdge("edge_support_gate_send", "condition_support_review_needed", "thread_support_send_reply", { sourceHandle: "else" }),
              createMetronomeEdge("edge_support_review_end", "ticket_support_human_review", "end_support_review"),
              createMetronomeEdge("edge_support_send_end", "thread_support_send_reply", "end_support_sent"),
            ],
          };
        }

        function createWeeklyExecutiveBriefingTemplateMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 280 }, {
            id: "trigger_weekly_briefing_schedule",
            subtype: "periodic",
            label: "Weekly Schedule",
            description: "Run every Monday morning.",
            config: {
              triggerType: "periodic",
              scheduleType: "recurring",
              schedulePresetId: "weekly",
              cronExpression: "0 9 * * 1",
              scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              promptExtension: "Prepare a weekly executive briefing for the project using activity, metrics, files, and external changes.",
            },
          });
          const activity = createMetronomeNode("action", { x: 405, y: 280 }, {
            id: "thread_briefing_activity",
            subtype: "start_thread",
            label: "Activity",
            description: "Collect recent project activity.",
            config: {
              ...workspaceConfig,
              message: "Collect recent project activity: completed tickets, open risks, decisions, run summaries, releases, and notable conversations from the last week.",
              inputContextScope: "all",
            },
          });
          const metrics = createMetronomeNode("action", { x: 735, y: 280 }, {
            id: "thread_briefing_metrics",
            subtype: "start_thread",
            label: "Metrics",
            description: "Read KPI files and dashboards.",
            config: {
              ...workspaceConfig,
              message: "Read KPI files, dashboards, and project resources. Extract headline metrics, deltas, anomalies, and missing data that leadership should know about.",
              inputContextScope: "all",
            },
          });
          const research = createMetronomeNode("action", { x: 1065, y: 280 }, {
            id: "thread_briefing_external_context",
            subtype: "start_thread",
            label: "External Context",
            description: "Research external changes if needed.",
            config: {
              ...workspaceConfig,
              message: "Research external market, competitor, customer, or dependency changes that affect this project. Keep only decision-relevant signals.",
              inputContextScope: "all",
            },
          });
          const writeBrief = createMetronomeNode("action", { x: 1395, y: 280 }, {
            id: "thread_briefing_write",
            subtype: "start_thread",
            label: "Write Brief",
            description: "Write a concise weekly executive brief.",
            config: {
              ...workspaceConfig,
              message: "Write the weekly executive brief with: headline summary, progress, key metrics, risks, decisions needed, and next actions. Keep it concise and scannable.",
              inputContextScope: "all",
            },
          });
          const actionItems = createMetronomeNode("ticket", { x: 1725, y: 280 }, {
            id: "ticket_briefing_action_items",
            subtype: "add_subtask",
            label: "Action Items",
            description: "Create follow-up work from briefing actions.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Follow up on weekly executive briefing",
              subtaskInstructions: "Create focused follow-up tasks for any decisions, risks, or action items called out in the weekly brief.",
            },
          });
          const done = createMetronomeNode("end", { x: 2055, y: 280 }, { id: "end_weekly_briefing" });
          return {
            nodes: [trigger, activity, metrics, research, writeBrief, actionItems, done],
            edges: [
              createMetronomeEdge("edge_briefing_schedule_activity", "trigger_weekly_briefing_schedule", "thread_briefing_activity"),
              createMetronomeEdge("edge_briefing_activity_metrics", "thread_briefing_activity", "thread_briefing_metrics"),
              createMetronomeEdge("edge_briefing_metrics_research", "thread_briefing_metrics", "thread_briefing_external_context"),
              createMetronomeEdge("edge_briefing_research_write", "thread_briefing_external_context", "thread_briefing_write"),
              createMetronomeEdge("edge_briefing_write_actions", "thread_briefing_write", "ticket_briefing_action_items"),
              createMetronomeEdge("edge_briefing_actions_end", "ticket_briefing_action_items", "end_weekly_briefing"),
            ],
          };
        }

        function createCampaignContentCalendarTemplateMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? { contextType: "project", resource: "project", projectId, projectName }
            : { contextType: "computer", resource: "computer" };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 280 }, {
            id: "trigger_campaign_calendar_schedule",
            subtype: "periodic",
            label: "Campaign Schedule",
            description: "Run weekly during the campaign.",
            config: {
              triggerType: "periodic",
              scheduleType: "recurring",
              schedulePresetId: "weekly",
              cronExpression: "0 10 * * 1",
              scheduledTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              promptExtension: "Plan campaign content for the next week. Preserve audience, offer, launch date, channels, brand constraints, and review requirements.",
            },
          });
          const brief = createMetronomeNode("action", { x: 405, y: 280 }, {
            id: "thread_campaign_read_brief",
            subtype: "start_thread",
            label: "Read Brief",
            description: "Read the campaign brief and constraints.",
            config: {
              ...workspaceConfig,
              message: "Read the campaign brief, launch plan, target audience, offer, channel constraints, and prior performance notes. Return the working content strategy for this week.",
              inputContextScope: "all",
            },
          });
          const ideas = createMetronomeNode("action", { x: 735, y: 280 }, {
            id: "thread_campaign_content_ideas",
            subtype: "start_thread",
            label: "Ideas",
            description: "Generate weekly content ideas.",
            config: {
              ...workspaceConfig,
              message: "Generate a weekly content plan with post ideas, channels, intended audience, goal, CTA, and required assets.",
              inputContextScope: "all",
            },
          });
          const creative = createMetronomeNode("imagine", { x: 1065, y: 280 }, {
            id: "imagine_campaign_creative_prompts",
            label: "Creative Prompts",
            description: "Draft image prompts for campaign creative.",
            config: {
              mediaMode: "image",
              prompt: "Create campaign creative concepts for the weekly content plan. Keep composition brand-forward, conversion-focused, and channel-ready.",
              templateId: "fashion-campaigns",
              templateName: "Fashion campaigns",
              projectId,
              projectName,
              inputContextScope: "all",
            },
          });
          const posts = createMetronomeNode("action", { x: 1395, y: 280 }, {
            id: "thread_campaign_draft_posts",
            subtype: "start_thread",
            label: "Draft Posts",
            description: "Draft posts and campaign copy.",
            config: {
              ...workspaceConfig,
              message: "Draft channel-specific posts from the content plan and creative prompts. Include headline, caption, CTA, asset direction, and review notes.",
              inputContextScope: "all",
            },
          });
          const approvalTask = createMetronomeNode("ticket", { x: 1725, y: 176 }, {
            id: "ticket_campaign_approval",
            subtype: "add_subtask",
            label: "Approval Task",
            description: "Create approval tasks for the content calendar.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Approve weekly campaign content",
              subtaskInstructions: "Review the generated content calendar, copy, and creative prompts. Approve, request revisions, or assign channel owners.",
            },
          });
          const performanceReview = createMetronomeNode("ticket", { x: 1725, y: 390 }, {
            id: "ticket_campaign_performance_review",
            subtype: "add_subtask",
            label: "Performance Review",
            description: "Schedule follow-up review after launch.",
            config: {
              operation: "add_subtask",
              projectId,
              projectName,
              subtaskTitle: "Review campaign content performance",
              subtaskInstructions: "After the campaign window, review performance by channel and create next-week content recommendations.",
            },
          });
          const approvalEnd = createMetronomeNode("end", { x: 2055, y: 176 }, { id: "end_campaign_approval_ready" });
          const reviewEnd = createMetronomeNode("end", { x: 2055, y: 390 }, { id: "end_campaign_review_scheduled" });
          return {
            nodes: [trigger, brief, ideas, creative, posts, approvalTask, performanceReview, approvalEnd, reviewEnd],
            edges: [
              createMetronomeEdge("edge_campaign_calendar_brief", "trigger_campaign_calendar_schedule", "thread_campaign_read_brief"),
              createMetronomeEdge("edge_campaign_brief_ideas", "thread_campaign_read_brief", "thread_campaign_content_ideas"),
              createMetronomeEdge("edge_campaign_ideas_creative", "thread_campaign_content_ideas", "imagine_campaign_creative_prompts"),
              createMetronomeEdge("edge_campaign_creative_posts", "imagine_campaign_creative_prompts", "thread_campaign_draft_posts"),
              createMetronomeEdge("edge_campaign_posts_approval", "thread_campaign_draft_posts", "ticket_campaign_approval"),
              createMetronomeEdge("edge_campaign_posts_review", "thread_campaign_draft_posts", "ticket_campaign_performance_review"),
              createMetronomeEdge("edge_campaign_approval_end", "ticket_campaign_approval", "end_campaign_approval_ready"),
              createMetronomeEdge("edge_campaign_review_end", "ticket_campaign_performance_review", "end_campaign_review_scheduled"),
            ],
          };
        }

        function createWorkerVerifierLoopMetronomeGraph(options = {}) {
          const projectId = String(options.projectId || "").trim();
          const projectName = String(options.projectName || "").trim();
          const workspaceConfig = projectId
            ? {
                contextType: "project",
                resource: "project",
                projectId,
                projectName,
              }
            : {
                contextType: "computer",
                resource: "computer",
              };
          const trigger = createMetronomeNode("trigger", { x: 90, y: 286 }, {
            id: "trigger_loop_request",
            subtype: "thread_event",
            label: "Trigger",
            description: "Start a worker and verifier Loop from @loop.",
            config: {
              triggerType: "thread_event",
              threadCommand: "@loop",
              promptExtension: "Treat this request as a Loop. Capture the goal, constraints, progress signal, verification criteria, and success criteria before the worker starts.",
            },
          });
          const loop = createMetronomeNode("loop", { x: 390, y: 150 }, {
            id: "loop_worker_verifier",
            subtype: "workflow_context_contains",
            label: "Loop",
            description: "Repeat worker and verifier passes until the verifier accepts the result or the safety limit is reached.",
            style: { width: 760, height: 330 },
            config: {
              loopType: "workflow_context_contains",
              iterations: 6,
              maxIterations: 6,
              contextContainsText: "LOOP COMPLETE",
              containsText: "LOOP COMPLETE",
              progressSignal: "Each iteration must produce measurable movement toward the goal.",
              verificationCriteria: "The verifier can independently inspect the latest worker result and decide whether it satisfies the success criteria.",
              successCriteria: "The requested outcome is complete, verified, and ready to hand back.",
              noProgressLimit: 2,
            },
          });
          const worker = createMetronomeNode("action", { x: 74, y: 116 }, {
            id: "thread_loop_worker",
            parentId: "loop_worker_verifier",
            subtype: "start_thread",
            label: "Worker",
            description: "Execute one meaningful step toward the loop goal.",
            config: {
              ...workspaceConfig,
              message: "Act as the worker agent for this Loop. Use the workflow context to make one concrete step toward the goal. State what changed, what evidence exists, and what remains. Do not declare success unless the verifier criteria are clearly met.",
              inputContextScope: "all",
            },
          });
          const verifier = createMetronomeNode("action", { x: 404, y: 116 }, {
            id: "thread_loop_verifier",
            parentId: "loop_worker_verifier",
            subtype: "start_thread",
            label: "Verifier",
            description: "Review the worker result against the success criteria.",
            config: {
              ...workspaceConfig,
              message: "Act as the verifier agent for this Loop. Inspect the latest worker result against the success criteria and available evidence. Return LOOP COMPLETE only when the result is objectively complete and verified. Otherwise return LOOP CONTINUE with the next correction or missing evidence.",
              inputContextScope: "all",
            },
          });
          const handoff = createMetronomeNode("action", { x: 1220, y: 150 }, {
            id: "thread_loop_handoff",
            subtype: "start_thread",
            label: "Handoff",
            description: "Prepare the verified result for the user or project.",
            config: {
              ...workspaceConfig,
              message: "Prepare the final handoff. Include the verified outcome, evidence, changed files or resources, and any residual risk.",
              inputContextScope: "all",
            },
          });
          const done = createMetronomeNode("end", { x: 1550, y: 150 }, {
            id: "end_loop_complete",
            subtype: "complete",
            label: "End",
            description: "Finish after the verifier accepts the result.",
            config: {},
          });
          return {
            nodes: [trigger, loop, worker, verifier, handoff, done],
            edges: [
	              createMetronomeEdge("edge_loop_trigger_container", "trigger_loop_request", "loop_worker_verifier", { targetHandle: "loop-left" }),
	              createMetronomeEdge("edge_loop_container_worker", "loop_worker_verifier", "thread_loop_worker", { sourceHandle: "loop-left", targetHandle: "node-input" }),
	              createMetronomeEdge("edge_loop_worker_verifier", "thread_loop_worker", "thread_loop_verifier"),
	              createMetronomeEdge("edge_loop_verifier_end", "thread_loop_verifier", "loop_worker_verifier", { targetHandle: "loop-right" }),
	              createMetronomeEdge("edge_loop_container_handoff", "loop_worker_verifier", "thread_loop_handoff", { sourceHandle: "loop-right", targetHandle: "node-input" }),
	              createMetronomeEdge("edge_loop_handoff_end", "thread_loop_handoff", "end_loop_complete"),
	            ],
          };
        }
`;
