export const METRONOME_TEMPLATES_01_FRAGMENT = String.raw`
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
`;
