export const METRONOME_TRIGGERS_RUNTIME_SCRIPT = String.raw`
        const METRONOME_STORAGE_KEY = "runner_demo_metronomes_v1";
        const METRONOME_HIDDEN_TEAM_SHARED_WORKFLOWS_STORAGE_PREFIX = "runner_demo_metronome_hidden_team_shared_workflows_v1:";
        const METRONOME_IMAGINE_CUSTOM_TEMPLATE_STORAGE_KEY = "runner_demo_imagine_custom_templates_v1";
        const METRONOME_RUNNER_TRANSPARENT_LOGO_URL = "https://computer-agents.com/img/logos/runnertransparent.png";
        const METRONOME_IMAGINE_BUILT_IN_TEMPLATE_OPTIONS = [
          { id: "product-ads", title: "Product ads", mediaType: "image", prompt: "Create a premium product ad with a clean studio setup, soft light, and conversion-focused composition." },
          { id: "astra-ads", title: "AstraFlow ads", mediaType: "image", prompt: "Create a sci-fi SaaS early-access advertisement with an astronaut product hero, luminous platform blocks, bold launch typography, premium dark-blue lighting, concise offer copy, and a polished conversion-focused call to action." },
          { id: "multi-asset-campaign-set", title: "Pitch deck", mediaType: "image", prompt: "Create a modern pitch deck with crisp narrative, strong page hierarchy, premium black/white/blue visual language, and investor-ready copy." },
          { id: "modern-pitch-deck", title: "Modern pitch deck", mediaType: "image", prompt: "Create a modern pitch deck with elegant editorial typography, clean white space, soft green analytical panels, polished metrics, strong platform impact storytelling, and a report-ready slide system." },
          { id: "luxury-watch-ads", title: "Luxury watch ads", mediaType: "image", prompt: "Create a luxury watch advertisement with dramatic lighting, crisp macro detail, bold headline typography, and a premium editorial finish." },
          { id: "video-product-launch", title: "Product launch video", mediaType: "video", prompt: "Create a short cinematic product launch video with premium camera movement, crisp lighting, restrained motion graphics, and a clear brand reveal." },
          { id: "akita-space-video", title: "Akita in space", mediaType: "video", prompt: "Create a playful cinematic video of an Akita floating weightlessly through deep space with gentle camera motion, soft starlight, and a polished sci-fi finish." },
          { id: "cell-division-video", title: "Cell division", mediaType: "video", prompt: "Create a close-up microscopic video of cell division with organic motion, subtle depth, clean scientific detail, and a polished research-film finish." },
          { id: "youtube-intro-video", title: "YouTube intro", mediaType: "video", prompt: "Create a polished YouTube intro video with strong creator branding, cinematic motion, crisp title timing, and a high-retention opening sequence." },
          { id: "video-cinematic-scene", title: "Cinematic scene video", mediaType: "video", prompt: "Create a cinematic short video with atmospheric depth, slow camera movement, natural motion, and a premium filmic finish." },
          { id: "fragrance-ads", title: "Fragrance ads", mediaType: "image", prompt: "Create a moody luxury fragrance advertisement with a glass perfume bottle, tactile environmental texture, cinematic reflections, and refined brand typography." },
          { id: "coffee-ads", title: "Coffee ads", mediaType: "image", prompt: "Create a warm premium coffee advertisement with product bags, lifestyle styling, sunlit texture, polished brand typography, and a clear campaign message." },
          { id: "beauty-ads", title: "Beauty ads", mediaType: "image", prompt: "Create a premium beauty advertisement with an elegant product hero, social-commerce proof, refined editorial typography, and a polished conversion-focused layout." },
          { id: "metal-typography-ads", title: "Metal typography ads", mediaType: "image", prompt: "Create a premium typography-led campaign ad with metallic dimensional lettering, dramatic studio lighting, refined product placement, and a high-end brand finish." },
          { id: "text-led-ads", title: "Text-led ads", mediaType: "image", prompt: "Create a clean text-led advertising poster with confident headline typography, elegant product composition, restrained color, and a premium campaign layout." },
          { id: "payment-ads", title: "Payment ads", mediaType: "image", prompt: "Create a premium fintech payment advertisement with a confident customer hero, secure payment messaging, deep blue brand palette, and a trust-focused call to action." },
          { id: "logo-branding", title: "Logo branding", mediaType: "image", prompt: "Create a premium logo branding visual with a distinctive abstract mark, cinematic brand mood, refined typography, and a polished identity presentation." },
          { id: "furniture-campaigns", title: "Furniture campaigns", mediaType: "image", prompt: "Create a refined furniture campaign poster with a styled interior scene, soft natural light, architectural framing, elegant typography, and premium home brand direction." },
          { id: "sneaker-campaigns", title: "Sneaker campaigns", mediaType: "image", prompt: "Create a premium sneaker campaign advertisement with an athletic hero subject, dramatic outdoor lighting, bold typography, and sportswear brand direction." },
          { id: "brand-campaigns", title: "Brand campaigns", mediaType: "image", prompt: "Design a cinematic brand campaign image with dramatic lighting, clear message, and premium composition." },
          { id: "infographics", title: "Infographics", mediaType: "image", prompt: "Create a polished infographic that explains the main idea with clear hierarchy and simple visual metaphors." },
          { id: "technical-drawings", title: "Technical drawings", mediaType: "image", prompt: "Create a precise technical drawing with an exploded mechanical view, crisp ink detail, clean annotations, and a polished engineering illustration style." },
          { id: "app-screens", title: "App screens", mediaType: "image", prompt: "Create a high-end SaaS dashboard concept with dense but readable product UI and realistic data." },
          { id: "editorial", title: "Editorial images", mediaType: "image", prompt: "Create an editorial hero image with artful composition, cinematic lighting, and premium visual texture." },
          { id: "social-posts", title: "Social posts", mediaType: "image", prompt: "Create a social media campaign visual with bold typography, strong hierarchy, and a premium feed-ready composition." },
          { id: "restaurant-ads", title: "Restaurant ads", mediaType: "image", prompt: "Create a premium restaurant ad for a seasonal dish with appetizing food photography, elegant typography, a price badge, and a clear call to action." },
          { id: "comparison-ads", title: "Comparison ads", mediaType: "image", prompt: "Create a polished before-and-after comparison ad with two clear panels, concise benefit copy, expressive illustration, and premium product branding." },
          { id: "data-visuals", title: "Data visuals", mediaType: "image", prompt: "Create a sophisticated data visualization artwork for a business report, with charts integrated naturally." },
          { id: "fashion-campaigns", title: "Fashion campaigns", mediaType: "image", prompt: "Create a high-end fashion campaign image with editorial styling, premium lighting, and a strong brand-forward composition." },
          { id: "portrait-studio", title: "Portrait studio", mediaType: "image", prompt: "Create a refined studio portrait with natural expression, premium lighting, and a clean personal-brand composition." },
          { id: "animated-characters", title: "Animated characters", mediaType: "image", prompt: "Create a charming animated character image with expressive personality, rich color, and clean storybook composition." },
          { id: "cinematic-wildlife", title: "Cinematic wildlife", mediaType: "image", prompt: "Create a cinematic wildlife image with dramatic lighting, atmospheric depth, and premium editorial composition." },
          { id: "concept-art", title: "Concept art", mediaType: "image", prompt: "Create concept art for a futuristic workspace with cinematic depth and production-ready detail." },
        ];
        const METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS = [
          { id: "gpt-image-2", label: "GPT Image 2", description: "Highest-fidelity OpenAI image generation and editing." },
          { id: "gemini-3.1-flash-image-preview", label: "Gemini 3.1 Flash Image", description: "Fast multimodal image generation and editing preview." },
        ];
        const METRONOME_IMAGINE_VIDEO_MODEL_OPTIONS = [
          { id: "seedance-2.0-fast", label: "Seedance 2.0 Fast", description: "Fast default video drafts and short motion clips." },
          { id: "seedance-2.0", label: "Seedance 2.0", description: "Higher-quality Seedance video generation." },
          { id: "grok-imagine-video", label: "Grok Imagine Video", description: "Alternative video model for imaginative motion." },
        ];
        const METRONOME_SCHEDULE_PRESETS = [
          { id: "daily", label: "Every day", cron: "0 9 * * *" },
          { id: "weekdays", label: "Every weekday", cron: "0 9 * * 1-5" },
          { id: "weekly", label: "Every week", cron: "0 9 * * 1" },
        ];
        const METRONOME_WORKFLOW_FILTER_OPTIONS = [
          { id: "all", label: "All workflows", description: "Visible defaults, owned workflows, and shared workflows." },
          { id: "owned", label: "Owned", description: "Workflows you can edit, publish, and share." },
          { id: "shared", label: "Shared", description: "Visible workflows shared with you through a team." },
          { id: "removed", label: "Removed shared", description: "Team-shared workflows hidden from the main list." },
        ];
        const METRONOME_WORKFLOW_SORT_OPTIONS = [
          { id: "recent", label: "Last run", description: "Newest activity first." },
          { id: "name", label: "Name", description: "Alphabetical by workflow name." },
          { id: "status", label: "Status", description: "Grouped by current workflow state." },
          { id: "creator", label: "Creator", description: "Alphabetical by creator." },
        ];
        const METRONOME_RUN_FILTER_OPTIONS = [
          { id: "all", label: "All runs", description: "Show all workflow runs." },
          { id: "completed", label: "Completed", description: "Only runs that completed successfully." },
          { id: "failed", label: "Failed", description: "Only runs that failed." },
          { id: "running", label: "Running", description: "Only active or queued runs." },
        ];
        const METRONOME_RUN_SORT_OPTIONS = [
          { id: "recent", label: "Started", description: "Newest runs first." },
          { id: "run", label: "Run", description: "Alphabetical by run summary." },
          { id: "status", label: "Status", description: "Grouped by run status." },
          { id: "steps", label: "Steps", description: "Most executed steps first." },
        ];
        const METRONOME_WORKFLOW_WALLPAPER_FALLBACK_OPTIONS = [
          { id: "mountains", name: "Mountains", url: "/img/bg/mountain.avif", thumbnail: "/img/bg/mountain.avif" },
          { id: "aurora", name: "Road", url: "/img/bg/road.avif", thumbnail: "/img/bg/road.avif?auto=compress&cs=tinysrgb&w=300" },
          { id: "desert", name: "Desert", url: "/img/bg/newdesert.avif", thumbnail: "/img/bg/newdesert.avif" },
          { id: "ocean", name: "Ocean", url: "/img/bg/water.avif", thumbnail: "/img/bg/water.avif" },
          { id: "forest", name: "Color Blend", url: "/img/bg/blend.avif", thumbnail: "/img/bg/blend.avif" },
          { id: "night-sky", name: "Dune", url: "/img/bg/dune.avif", thumbnail: "/img/bg/dune.avif" },
          { id: "abstract-dark", name: "Abstract Dark", url: "/img/bg/bg-abstract.avif", thumbnail: "/img/bg/bg-abstract.avif?auto=compress&cs=tinysrgb&w=300" },
          { id: "gradient-orange", name: "Moon", url: "/img/bg/moon.avif", thumbnail: "/img/bg/moon.avif" },
        ];

        function getMetronomeWorkflowWallpaperOptions() {
          if (typeof PLAYGROUND_PROJECT_WALLPAPER_OPTIONS !== "undefined" && Array.isArray(PLAYGROUND_PROJECT_WALLPAPER_OPTIONS) && PLAYGROUND_PROJECT_WALLPAPER_OPTIONS.length) {
            return PLAYGROUND_PROJECT_WALLPAPER_OPTIONS;
          }
          return METRONOME_WORKFLOW_WALLPAPER_FALLBACK_OPTIONS;
        }

        function getMetronomeWorkflowWallpaperId(value, fallbackId = "") {
          const options = getMetronomeWorkflowWallpaperOptions();
          const fallback = String(fallbackId || options[0]?.id || "").trim();
          const source = value && typeof value === "object" && !Array.isArray(value)
            ? value
            : { wallpaperId: value };
          const metadata = source?.metadata && typeof source.metadata === "object" ? source.metadata : {};
          const normalized = String(source?.wallpaperId || metadata.wallpaperId || source?.workflowWallpaperId || metadata.workflowWallpaperId || source?.id || "").trim();
          if (normalized && options.some((option) => option.id === normalized)) {
            return normalized;
          }
          if (fallback && options.some((option) => option.id === fallback)) {
            return fallback;
          }
          return options[0]?.id || "";
        }

        function getMetronomeWorkflowWallpaperConfig(value, fallbackIndex = 0) {
          const options = getMetronomeWorkflowWallpaperOptions();
          const safeIndex = options.length ? Math.max(0, Math.min(options.length - 1, Number(fallbackIndex) || 0)) : 0;
          const fallback = options[safeIndex] || options[0] || { id: "", name: "Background", url: "" };
          const wallpaperId = getMetronomeWorkflowWallpaperId(value, fallback.id);
          return options.find((option) => option.id === wallpaperId) || fallback;
        }

        function buildMetronomeWorkflowWallpaperImage(value, fallbackIndex = 0) {
          if (value && typeof value === "object" && !Array.isArray(value) && value.url) {
            return 'url("' + value.url + '")';
          }
          const wallpaper = getMetronomeWorkflowWallpaperConfig(value, fallbackIndex);
          return wallpaper?.url ? 'url("' + wallpaper.url + '")' : "none";
        }

        function resolveMetronomeWorkflowWallpaperId(rawWorkflow, fallbackId = "") {
          const workflow = rawWorkflow && typeof rawWorkflow === "object" && !Array.isArray(rawWorkflow) ? rawWorkflow : {};
          const definition = workflow.definition && typeof workflow.definition === "object" && !Array.isArray(workflow.definition)
            ? workflow.definition
            : {};
          const metadata = readMetronomeWorkflowMetadata(workflow);
          return getMetronomeWorkflowWallpaperId({
            wallpaperId: workflow.wallpaperId || workflow.workflowWallpaperId || definition.wallpaperId || definition.workflowWallpaperId || metadata.wallpaperId || metadata.workflowWallpaperId,
            workflowWallpaperId: workflow.workflowWallpaperId || definition.workflowWallpaperId || metadata.workflowWallpaperId,
            metadata,
          }, fallbackId);
        }

        function normalizeMetronomeAvatarUrl(value) {
          const normalized = String(value || "").trim();
          if (!normalized) return "";
          if (normalized.startsWith("//")) return "https:" + normalized;
          return normalized;
        }

        function canRenderMetronomeAvatarImage(value) {
          const normalized = normalizeMetronomeAvatarUrl(value);
          return normalized.startsWith("data:image/")
            || /^https?:\/\//i.test(normalized)
            || normalized.startsWith("/img/");
        }

        function getMetronomeOwnerInitials(value, fallback = "ME") {
          const normalized = String(value || "").trim();
          if (!normalized) return fallback;
          const source = normalized.includes("@") ? normalized.split("@")[0] : normalized;
          const parts = source
            .split(/[^a-zA-Z0-9]+/)
            .map((part) => part.trim())
            .filter(Boolean);
          if (parts.length === 0) return source.slice(0, 2).toUpperCase() || fallback;
          if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase() || fallback;
          return (parts[0][0] + parts[1][0]).toUpperCase();
        }

        function toMetronomeDatetimeLocalValue(value) {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
          return localDate.toISOString().slice(0, 16);
        }

        function fromMetronomeDatetimeLocalValue(value) {
          const normalized = String(value || "").trim();
          if (!normalized) return "";
          const date = new Date(normalized);
          return Number.isNaN(date.getTime()) ? "" : date.toISOString();
        }

        function getMetronomeSchedulePreset(presetId) {
          const normalizedPresetId = String(presetId || "").trim();
          return METRONOME_SCHEDULE_PRESETS.find((preset) => preset.id === normalizedPresetId) || METRONOME_SCHEDULE_PRESETS[0];
        }

        function normalizeMetronomeCronParts(expression) {
          const normalizedExpression = String(expression || "").trim();
          const parts = normalizedExpression.split(/\s+/).filter(Boolean);
          if (parts.length === 6) return parts.slice(1);
          if (parts.length === 7) return parts.slice(1, 6);
          return parts.length === 5 ? parts : [];
        }

        function getMetronomeSchedulePresetId(cronExpression) {
          const normalizedCronExpression = String(cronExpression || "").trim();
          const exactPreset = METRONOME_SCHEDULE_PRESETS.find((preset) => preset.cron === normalizedCronExpression);
          if (exactPreset) return exactPreset.id;
          const parts = normalizeMetronomeCronParts(normalizedCronExpression);
          if (parts.length === 5) {
            const dayOfMonth = String(parts[2] || "").trim();
            const month = String(parts[3] || "").trim();
            const dayOfWeek = String(parts[4] || "").trim();
            if (dayOfMonth === "*" && month === "*" && dayOfWeek === "*") return "daily";
            if (dayOfMonth === "*" && month === "*" && dayOfWeek === "1-5") return "weekdays";
            if (dayOfMonth === "*" && month === "*" && dayOfWeek && dayOfWeek !== "*") return "weekly";
          }
          return "";
        }

        function buildMetronomeCronExpressionForPreset(presetId, startValue) {
          const preset = getMetronomeSchedulePreset(presetId);
          const date = new Date(startValue || Date.now());
          if (Number.isNaN(date.getTime())) return preset.cron;
          const minute = String(date.getMinutes());
          const hour = String(date.getHours());
          if (preset.id === "weekdays") return minute + " " + hour + " * * 1-5";
          if (preset.id === "weekly") return minute + " " + hour + " * * " + String(date.getDay());
          return minute + " " + hour + " * * *";
        }

        function formatMetronomeScheduleClockTime(value) {
          const date = value instanceof Date ? value : new Date(value || "");
          if (Number.isNaN(date.getTime())) return "";
          return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
        }

        function formatMetronomeDateTime(value) {
          if (!value) return "";
          const date = new Date(value);
          if (Number.isNaN(date.getTime())) return "";
          return date.toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        }

        function getMetronomeRecurringBaseLabel(cronExpression) {
          const presetLabel = METRONOME_SCHEDULE_PRESETS.find((preset) => preset.cron === String(cronExpression || "").trim())?.label || "";
          if (presetLabel) return presetLabel;
          const presetId = getMetronomeSchedulePresetId(cronExpression);
          if (presetId) return getMetronomeSchedulePreset(presetId).label;
          return "Recurring";
        }

        function formatMetronomeScheduleSummary(config = {}) {
          const scheduleType = config.scheduleType === "recurring" ? "recurring" : "one-time";
          if (scheduleType === "recurring") {
            const baseLabel = getMetronomeRecurringBaseLabel(config.cronExpression);
            const timeLabel = formatMetronomeScheduleClockTime(config.scheduledTime || config.scheduledStartAt || config.nextRunAt);
            return timeLabel ? baseLabel + " at " + timeLabel : baseLabel;
          }
          return formatMetronomeDateTime(config.scheduledTime || config.scheduledStartAt || config.nextRunAt) || "One-time schedule";
        }

        function buildDefaultMetronomeScheduleConfig(overrides = {}) {
          const scheduledTime = String(overrides.scheduledTime || overrides.scheduledStartAt || "").trim()
            || new Date(Date.now() + 60 * 60 * 1000).toISOString();
          const scheduleType = overrides.scheduleType === "recurring" ? "recurring" : "one-time";
          const presetId = overrides.schedulePresetId || getMetronomeSchedulePresetId(overrides.cronExpression) || "daily";
          return {
            scheduleType,
            scheduledTime,
            cronExpression: scheduleType === "recurring"
              ? String(overrides.cronExpression || buildMetronomeCronExpressionForPreset(presetId, scheduledTime)).trim()
              : "",
            schedulePresetId: presetId,
            scheduleTimezone: String(overrides.scheduleTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC").trim() || "UTC",
          };
        }

        const METRONOME_EMAIL_DOMAIN = "agent.computer-agents.com";

        function normalizeMetronomeEmailLocalPart(value, fallback = "workflow") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/@.*$/, "")
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 48);
          return normalized || fallback;
        }

        function buildMetronomeEmailAddress(localPart) {
          return normalizeMetronomeEmailLocalPart(localPart) + "@" + METRONOME_EMAIL_DOMAIN;
        }

        function deriveMetronomeEmailLocalPart(workflow, node, overrides = {}) {
          const explicitAddress = String(overrides.emailAddress || overrides.email_address || "").trim().toLowerCase();
          if (explicitAddress.endsWith("@" + METRONOME_EMAIL_DOMAIN)) {
            return normalizeMetronomeEmailLocalPart(explicitAddress);
          }
          const explicitLocalPart = String(overrides.emailLocalPart || overrides.email_local_part || overrides.localPart || "").trim();
          if (explicitLocalPart) {
            return normalizeMetronomeEmailLocalPart(explicitLocalPart);
          }
          const workflowSlug = normalizeMetronomeEmailLocalPart(workflow?.name || "workflow");
          const workflowId = String(workflow?.id || node?.id || "").replace(/^met_/, "").replace(/^node_/, "").slice(0, 8);
          const shortId = normalizeMetronomeEmailLocalPart(workflowId, String(node?.id || "mailbox").replace(/^node_/, "").slice(0, 8) || "mailbox");
          return (workflowSlug + "-" + shortId).replace(/-+$/g, "").slice(0, 64);
        }

        function buildDefaultMetronomeEmailTriggerConfig(workflow, node, overrides = {}) {
          const localPart = deriveMetronomeEmailLocalPart(workflow, node, overrides);
          return {
            emailLocalPart: localPart,
            emailAddress: buildMetronomeEmailAddress(localPart),
            fromContains: String(overrides.fromContains || overrides.from_contains || ""),
            subjectContains: String(overrides.subjectContains || overrides.subject_contains || ""),
            bodyContains: String(overrides.bodyContains || overrides.body_contains || ""),
          };
        }

        function normalizeMetronomeTelegramCommand(value, fallback = "workflow") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/^@/, "")
            .replace(/^\/+/, "")
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9_]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 48);
          const fallbackCommand = String(fallback || "workflow")
            .trim()
            .toLowerCase()
            .replace(/^@/, "")
            .replace(/^\/+/, "")
            .replace(/[^a-z0-9_]+/g, "_")
            .replace(/^_+|_+$/g, "")
            .slice(0, 48) || "workflow";
          return "/" + (normalized || fallbackCommand);
        }

        function deriveMetronomeTelegramCommand(workflow, node, overrides = {}) {
          const explicitCommand = String(overrides.telegramCommand || overrides.telegram_command || overrides.command || "").trim();
          if (explicitCommand) {
            return normalizeMetronomeTelegramCommand(explicitCommand);
          }
          const workflowSlug = normalizeMetronomeEmailLocalPart(workflow?.name || "workflow").replace(/-/g, "_");
          const workflowId = String(workflow?.id || node?.id || "").replace(/^met_/, "").replace(/^node_/, "").slice(0, 8);
          const shortId = normalizeMetronomeEmailLocalPart(workflowId, String(node?.id || "bot").replace(/^node_/, "").slice(0, 8) || "bot").replace(/-/g, "_");
          return normalizeMetronomeTelegramCommand(workflowSlug + "_" + shortId);
        }

        function buildDefaultMetronomeTelegramTriggerConfig(workflow, node, overrides = {}) {
          return {
            telegramCommand: deriveMetronomeTelegramCommand(workflow, node, overrides),
            telegramFromContains: String(overrides.telegramFromContains || overrides.telegram_from_contains || overrides.fromUsernameContains || overrides.from_username_contains || ""),
            telegramChatId: String(overrides.telegramChatId || overrides.telegram_chat_id || overrides.chatId || overrides.chat_id || ""),
            telegramMessageContains: String(overrides.telegramMessageContains || overrides.telegram_message_contains || overrides.messageContains || overrides.message_contains || ""),
          };
        }

        const METRONOME_GITHUB_EVENT_OPTIONS = [
          { id: "push", label: "Push" },
          { id: "pull_request", label: "Pull request" },
          { id: "issues", label: "Issue" },
          { id: "issue_comment", label: "Issue comment" },
          { id: "pull_request_review", label: "Pull request review" },
          { id: "workflow_run", label: "Workflow run" },
          { id: "release", label: "Release" },
          { id: "any", label: "Any event" },
        ];

        function normalizeMetronomeGitHubEventType(value, fallback = "push") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
          return METRONOME_GITHUB_EVENT_OPTIONS.some((option) => option.id === normalized)
            ? normalized
            : fallback;
        }

        function buildDefaultMetronomeGitHubTriggerConfig(overrides = {}) {
          return {
            githubEventType: normalizeMetronomeGitHubEventType(overrides.githubEventType || overrides.github_event_type || overrides.eventType || overrides.event_type),
            githubRepositoryContains: String(overrides.githubRepositoryContains || overrides.github_repository_contains || overrides.repositoryContains || overrides.repository_contains || ""),
            githubBranchContains: String(overrides.githubBranchContains || overrides.github_branch_contains || overrides.branchContains || overrides.branch_contains || ""),
            githubActorContains: String(overrides.githubActorContains || overrides.github_actor_contains || overrides.actorContains || overrides.actor_contains || ""),
            githubActionContains: String(overrides.githubActionContains || overrides.github_action_contains || overrides.actionContains || overrides.action_contains || ""),
            githubPayloadContains: String(overrides.githubPayloadContains || overrides.github_payload_contains || overrides.payloadContains || overrides.payload_contains || ""),
          };
        }

        const METRONOME_PROJECT_TICKET_EVENT_OPTIONS = [
          { id: "status_changed", label: "Status changed" },
          { id: "comment_added", label: "Comment added" },
        ];

        const METRONOME_PROJECT_TICKET_STATUS_OPTIONS = [
          { id: "any", label: "Any status" },
          { id: "backlog", label: "Backlog" },
          { id: "todo", label: "To do" },
          { id: "in_progress", label: "In progress" },
          { id: "blocked", label: "Blocked" },
          { id: "in_review", label: "In review" },
          { id: "done", label: "Done" },
        ];

        function normalizeMetronomeProjectTicketEventType(value, fallback = "status_changed") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
          return METRONOME_PROJECT_TICKET_EVENT_OPTIONS.some((option) => option.id === normalized)
            ? normalized
            : fallback;
        }

        function normalizeMetronomeProjectTicketStatus(value, fallback = "any") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
          return METRONOME_PROJECT_TICKET_STATUS_OPTIONS.some((option) => option.id === normalized)
            ? normalized
            : fallback;
        }

        function buildDefaultMetronomeProjectTicketTriggerConfig(overrides = {}) {
          return {
            ticketEventType: normalizeMetronomeProjectTicketEventType(overrides.ticketEventType || overrides.ticket_event_type || overrides.projectTicketEventType || overrides.project_ticket_event_type || overrides.eventType || overrides.event_type),
            ticketProjectId: String(overrides.ticketProjectId || overrides.ticket_project_id || overrides.projectId || overrides.project_id || ""),
            ticketProjectName: String(overrides.ticketProjectName || overrides.ticket_project_name || overrides.projectName || overrides.project_name || ""),
            ticketFromStatus: normalizeMetronomeProjectTicketStatus(overrides.ticketFromStatus || overrides.ticket_from_status || overrides.fromStatus || overrides.from_status, "todo"),
            ticketToStatus: normalizeMetronomeProjectTicketStatus(overrides.ticketToStatus || overrides.ticket_to_status || overrides.toStatus || overrides.to_status, "in_review"),
            ticketCommentContains: String(overrides.ticketCommentContains || overrides.ticket_comment_contains || overrides.commentContains || overrides.comment_contains || ""),
          };
        }

        const METRONOME_RESOURCE_EVENT_OPTIONS = [
          { id: "function_deployed", label: "Function deployed" },
          { id: "web_app_deployed", label: "Web app deployed" },
        ];

        function normalizeMetronomeResourceEventType(value, fallback = "function_deployed") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[\s-]+/g, "_");
          if (normalized === "webapp_deployed" || normalized === "website_deployed") return "web_app_deployed";
          return METRONOME_RESOURCE_EVENT_OPTIONS.some((option) => option.id === normalized)
            ? normalized
            : fallback;
        }

        function buildDefaultMetronomeResourceTriggerConfig(overrides = {}) {
          return {
            resourceEventType: normalizeMetronomeResourceEventType(overrides.resourceEventType || overrides.resource_event_type || overrides.deploymentEventType || overrides.deployment_event_type || overrides.eventType || overrides.event_type),
            resourceId: String(overrides.resourceId || overrides.resource_id || overrides.serverId || overrides.server_id || ""),
            resourceName: String(overrides.resourceName || overrides.resource_name || overrides.serverName || overrides.server_name || ""),
            resourceKind: String(overrides.resourceKind || overrides.resource_kind || overrides.serverKind || overrides.server_kind || ""),
            promptExtension: String(overrides.promptExtension || overrides.prompt_extension || ""),
          };
        }

        const METRONOME_DATABASE_ENTRY_EVENT_OPTIONS = [
          { id: "document_created", label: "Document added" },
        ];

        function buildDefaultMetronomeDatabaseEntryTriggerConfig(overrides = {}) {
          return {
            databaseEventType: "document_created",
            databaseId: String(overrides.databaseId || overrides.database_id || ""),
            databaseName: String(overrides.databaseName || overrides.database_name || ""),
            databaseCollection: String(overrides.databaseCollection || overrides.database_collection || overrides.collectionId || overrides.collection_id || overrides.collection || ""),
            promptExtension: String(overrides.promptExtension || overrides.prompt_extension || ""),
          };
        }

        const METRONOME_AUTH_EVENT_OPTIONS = [
          { id: "user_registered", label: "User registered" },
        ];

        function buildDefaultMetronomeAuthTriggerConfig(overrides = {}) {
          return {
            authEventType: "user_registered",
            authResourceId: String(overrides.authResourceId || overrides.auth_resource_id || overrides.resourceId || overrides.resource_id || ""),
            authResourceName: String(overrides.authResourceName || overrides.auth_resource_name || overrides.resourceName || overrides.resource_name || ""),
            authEmailContains: String(overrides.authEmailContains || overrides.auth_email_contains || overrides.emailContains || overrides.email_contains || ""),
            promptExtension: String(overrides.promptExtension || overrides.prompt_extension || ""),
          };
        }

        const METRONOME_FUNCTION_TRIGGER_PAYLOAD_TYPE_OPTIONS = [
          { id: "string", label: "Text" },
          { id: "number", label: "Number" },
          { id: "boolean", label: "Boolean" },
          { id: "array", label: "List" },
          { id: "object", label: "Object" },
        ];

        function normalizeMetronomeFunctionTriggerSlug(value, fallback = "workflow-trigger") {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .normalize("NFKD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 54);
          return normalized || String(fallback || "workflow-trigger").trim() || "workflow-trigger";
        }

        function deriveMetronomeFunctionTriggerSlug(workflow, node, overrides = {}) {
          const explicitSlug = String(
            overrides.functionSlug
            || overrides.function_slug
            || overrides.functionTriggerSlug
            || overrides.function_trigger_slug
            || overrides.endpointSlug
            || overrides.endpoint_slug
            || ""
          ).trim();
          if (explicitSlug) return normalizeMetronomeFunctionTriggerSlug(explicitSlug);
          const workflowSlug = normalizeMetronomeFunctionTriggerSlug(workflow?.name || "workflow");
          const workflowId = String(workflow?.id || node?.id || "").replace(/^met_/, "").replace(/^node_/, "").slice(0, 8);
          const shortId = normalizeMetronomeFunctionTriggerSlug(workflowId, String(node?.id || "function").replace(/^node_/, "").slice(0, 8) || "function");
          return normalizeMetronomeFunctionTriggerSlug(workflowSlug + "-" + shortId);
        }

        function normalizeMetronomeFunctionTriggerPayloadType(value) {
          const normalized = String(value || "").trim().toLowerCase();
          return METRONOME_FUNCTION_TRIGGER_PAYLOAD_TYPE_OPTIONS.some((option) => option.id === normalized)
            ? normalized
            : "string";
        }

        function readMetronomeFunctionTriggerPayloadDefaultText(source) {
          const hasDefaultValue = source && Object.prototype.hasOwnProperty.call(source, "defaultValue");
          const hasDefaultSnake = source && Object.prototype.hasOwnProperty.call(source, "default_value");
          const hasValue = source && Object.prototype.hasOwnProperty.call(source, "value");
          const rawValue = hasDefaultValue
            ? source.defaultValue
            : hasDefaultSnake
              ? source.default_value
              : hasValue
                ? source.value
                : "";
          if (rawValue === undefined || rawValue === null) return "";
          if (typeof rawValue === "object") {
            try {
              return JSON.stringify(rawValue);
            } catch {
              return "";
            }
          }
          return String(rawValue);
        }

        function createMetronomeFunctionTriggerPayloadField(overrides = {}) {
          const source = overrides && typeof overrides === "object" ? overrides : {};
          const rawKey = String(source.key || source.name || source.path || "").trim();
          const type = normalizeMetronomeFunctionTriggerPayloadType(source.type || source.valueType || source.value_type);
          return {
            id: String(source.id || "payload_" + Math.random().toString(36).slice(2, 10)),
            key: rawKey,
            name: rawKey,
            type,
            value: readMetronomeFunctionTriggerPayloadDefaultText(source),
          };
        }

        function normalizeMetronomeFunctionTriggerPayloadFields(value) {
          const rows = [];
          const preserveBlankRows = Array.isArray(value);
          const addRow = (row) => {
            const normalizedRow = createMetronomeFunctionTriggerPayloadField(row);
            if (!preserveBlankRows && !normalizedRow.key && !normalizedRow.value) return;
            rows.push(normalizedRow);
          };
          if (Array.isArray(value)) {
            value.forEach(addRow);
          } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, rawValue]) => {
              if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
                addRow({ key, ...rawValue });
              } else {
                addRow({ key, value: rawValue, type: inferMetronomeDynamicContentValueType(rawValue) });
              }
            });
          } else {
            const text = String(value || "").trim();
            if (text) {
              try {
                const parsed = JSON.parse(text);
                return normalizeMetronomeFunctionTriggerPayloadFields(parsed);
              } catch {
                rows.push(createMetronomeFunctionTriggerPayloadField());
              }
            }
          }
          return rows.length ? rows : [createMetronomeFunctionTriggerPayloadField({ key: "message", type: "string", value: "" })];
        }

        function parseMetronomeFunctionTriggerPayloadDefault(row) {
          const type = normalizeMetronomeFunctionTriggerPayloadType(row?.type);
          const rawValue = String(row?.value ?? "").trim();
          if (!rawValue) {
            if (type === "number") return 0;
            if (type === "boolean") return false;
            if (type === "array") return [];
            if (type === "object") return {};
            return "";
          }
          if (type === "number") {
            const numericValue = Number(rawValue);
            return Number.isFinite(numericValue) ? numericValue : 0;
          }
          if (type === "boolean") {
            return rawValue === "true" || rawValue === "1" || rawValue.toLowerCase() === "yes";
          }
          if (type === "array" || type === "object") {
            try {
              const parsed = JSON.parse(rawValue);
              if (type === "array") return Array.isArray(parsed) ? parsed : [];
              return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
            } catch {
              return type === "array" ? [] : {};
            }
          }
          return rawValue;
        }

        function buildMetronomeFunctionTriggerSamplePayload(rows) {
          const payload = {};
          (Array.isArray(rows) ? rows : []).forEach((row) => {
            const key = String(row?.key || row?.name || "").trim();
            if (!key) return;
            payload[key] = parseMetronomeFunctionTriggerPayloadDefault(row);
          });
          return payload;
        }

        function buildMetronomeFunctionTriggerPayloadSchema(rows) {
          const properties = {};
          (Array.isArray(rows) ? rows : []).forEach((row) => {
            const key = String(row?.key || row?.name || "").trim();
            if (!key) return;
            const type = normalizeMetronomeFunctionTriggerPayloadType(row?.type);
            properties[key] = {
              type,
              default: parseMetronomeFunctionTriggerPayloadDefault(row),
            };
          });
          return {
            type: "object",
            properties,
          };
        }

        function buildMetronomeFunctionTriggerEndpointPath(workflowId, slug) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          const normalizedSlug = normalizeMetronomeFunctionTriggerSlug(slug);
          if (!normalizedWorkflowId || !normalizedSlug) return "";
          return "/metronomes/"
            + encodeURIComponent(normalizedWorkflowId)
            + "/triggers/function/"
            + encodeURIComponent(normalizedSlug);
        }

        function buildDefaultMetronomeFunctionTriggerConfig(workflow, node, overrides = {}) {
          const payloadFields = normalizeMetronomeFunctionTriggerPayloadFields(
            overrides.payloadFields
            || overrides.payload_fields
            || overrides.expectedPayload
            || overrides.expected_payload
            || overrides.payloadSchemaJson
            || overrides.payload_schema_json
            || overrides.payloadSchema
            || overrides.payload_schema
            || overrides.samplePayloadJson
            || overrides.sample_payload_json
          );
          const functionSlug = deriveMetronomeFunctionTriggerSlug(workflow, node, overrides);
          const workflowId = String(workflow?.id || overrides.metronomeId || overrides.metronome_id || "").trim();
          const explicitEndpointPath = String(
            overrides.functionEndpointPath
            || overrides.function_endpoint_path
            || overrides.endpointPath
            || overrides.endpoint_path
          ).trim();
          const endpointPath = explicitEndpointPath && !explicitEndpointPath.includes(":metronomeId")
            ? explicitEndpointPath
            : buildMetronomeFunctionTriggerEndpointPath(workflowId, functionSlug);
          const endpointUrl = String(
            overrides.functionEndpointUrl
            || overrides.function_endpoint_url
            || overrides.endpointUrl
            || overrides.endpoint_url
            || ""
          ).trim();
          const requireApiKey = overrides.functionRequireApiKey === undefined
            && overrides.function_require_api_key === undefined
            && overrides.requireApiKey === undefined
            && overrides.require_api_key === undefined
            && overrides.requiresApiKey === undefined
            && overrides.requires_api_key === undefined
              ? true
              : Boolean(overrides.functionRequireApiKey ?? overrides.function_require_api_key ?? overrides.requireApiKey ?? overrides.require_api_key ?? overrides.requiresApiKey ?? overrides.requires_api_key);
          return {
            ...overrides,
            triggerType: "function",
            functionTriggerType: "cloud_function",
            functionName: String(overrides.functionName || overrides.function_name || "metronome-" + functionSlug).trim(),
            functionSlug,
            functionTriggerSlug: functionSlug,
            functionEndpointPath: endpointPath,
            functionEndpointUrl: endpointUrl,
            endpointPath,
            endpointUrl,
            functionRequireApiKey: requireApiKey,
            requireApiKey,
            authentication: requireApiKey ? "api_key" : "public",
            payloadFields,
            payloadSchemaJson: JSON.stringify(buildMetronomeFunctionTriggerPayloadSchema(payloadFields), null, 2),
            samplePayloadJson: JSON.stringify(buildMetronomeFunctionTriggerSamplePayload(payloadFields), null, 2),
            expectedPayload: buildMetronomeFunctionTriggerSamplePayload(payloadFields),
            promptExtension: String(overrides.promptExtension || overrides.prompt_extension || ""),
          };
        }

        function isMetronomeWorkflowPublished(workflow) {
          const source = workflow && typeof workflow === "object" ? workflow : {};
          const metadata = source.metadata && typeof source.metadata === "object" ? source.metadata : {};
          if (String(source.status || "").trim().toLowerCase() === "active") return true;
          if (String(source.publishedAt || source.published_at || metadata.publishedAt || metadata.published_at || "").trim()) return true;
          return readMetronomeWorkflowDeployments(source).some((deployment) => (
            String(deployment?.status || "").trim().toLowerCase() === "active"
            || Boolean(String(deployment?.publishedAt || "").trim())
          ));
        }

        function resolveMetronomePublicApiBaseUrl(backendUrl = "") {
          const fallback = "https://api.computer-agents.com";
          const rawValue = String(backendUrl || "").trim();
          if (!rawValue || rawValue === "/api/real" || rawValue.endsWith("/api/real")) return fallback;
          try {
            const parsed = new URL(rawValue, typeof window !== "undefined" ? window.location.origin : fallback);
            if (parsed.pathname === "/api/real" || parsed.pathname.startsWith("/api/real/")) return fallback;
            return (parsed.origin + parsed.pathname).replace(new RegExp("/v1/?$"), "").replace(new RegExp("/+$"), "");
          } catch {
            return fallback;
          }
        }

        function resolveMetronomeFunctionTriggerEndpointUrl(workflow, node, config, backendUrl = "") {
          if (!isMetronomeWorkflowPublished(workflow)) return "";
          const normalizedConfig = buildDefaultMetronomeFunctionTriggerConfig(workflow, node, config);
          const explicitUrl = String(
            normalizedConfig.functionEndpointUrl
            || normalizedConfig.endpointUrl
            || ""
          ).trim();
          if (/^https?:\/\//i.test(explicitUrl)) return explicitUrl;
          const workflowId = String(workflow?.id || "").trim();
          let endpointPath = String(
            normalizedConfig.functionEndpointPath
            || normalizedConfig.endpointPath
            || ""
          ).trim();
          if (!workflowId || !endpointPath) return "";
          endpointPath = endpointPath
            .replace(/:metronomeId\b/g, encodeURIComponent(workflowId))
            .replace(/\{metronomeId\}/g, encodeURIComponent(workflowId));
          if (!endpointPath.startsWith("/")) endpointPath = "/" + endpointPath;
          return resolveMetronomePublicApiBaseUrl(backendUrl) + endpointPath;
        }

        const METRONOME_NODE_KIND_META = {
          trigger: {
            label: "Trigger",
            copy: "Start from events, schedules, connectors, and platform changes.",
            color: "#6ee7b7",
            gradient: "linear-gradient(180deg, #4fd18f 0%, #36a86d 100%)",
            iconColor: "#fff",
            iconShadow: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
            Icon: Zap,
            subtypes: [
              { id: "thread_event", label: "Thread event" },
              { id: "periodic", label: "Periodic schedule" },
              { id: "email", label: "Email received" },
              { id: "telegram", label: "Telegram message" },
              { id: "function", label: "Function" },
              { id: "github", label: "GitHub event" },
              { id: "project_ticket", label: "Project ticket event" },
              { id: "resource", label: "Resource event" },
              { id: "database_entry", label: "Database entry added" },
              { id: "auth", label: "Auth event" },
            ],
          },
	          condition: {
	            label: "Condition",
		            copy: "Branch workflow runs by context summaries, database values, or structured rules.",
	            color: "#202AA7",
              gradient: "linear-gradient(180deg, #5565E6 0%, #202AA7 100%)",
              iconColor: "#fff",
	            Icon: Split,
	            subtypes: [
		              { id: "previous_output_contains", label: "Workflow context contains" },
	              { id: "database_document_field", label: "Database Document field" },
	              { id: "ticket_status", label: "Ticket status" },
	              { id: "json", label: "JSON" },
	            ],
          },
          action: {
            label: "Thread",
            copy: "Start or continue agent work inside a computer or project.",
            color: "#66a6ff",
            gradient: "linear-gradient(180deg, #4f7fc5 0%, #1e4585 100%)",
            iconColor: "#fff",
            Icon: Play,
            subtypes: [
              { id: "start_thread", label: "Start a thread" },
            ],
          },
          ticket: {
            label: "Ticket",
            copy: "Create tickets, update status, and write comments in project workflows.",
            color: "#39b877",
            gradient: "linear-gradient(180deg, #39b877 0%, #2b8b59 100%)",
            iconColor: "#fff",
            Icon: Bookmark,
            subtypes: [
              { id: "adapt_ticket", label: "Adapt ticket" },
              { id: "add_ticket_comment", label: "Add comment to ticket" },
              { id: "move_ticket_status", label: "Move ticket status" },
              { id: "start_work_on_ticket", label: "Start work on ticket" },
              { id: "add_subtask", label: "Add Subtask" },
            ],
          },
          imagine: {
            label: "Imagine",
            copy: "Start an Imagine thread with a template, prompt, project context, and attachments.",
            color: "#E21C51",
            gradient: "linear-gradient(180deg, #F7476B 0%, #E21C51 100%)",
            iconColor: "#fff",
            iconShadow: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
            Icon: Clapperboard,
            subtypes: [
              { id: "start_imagine", label: "Start Imagine" },
            ],
          },
          function: {
            label: "Function",
            copy: "Call a Computer Agents function or external API and route its output through the workflow.",
            color: "#0E90FF",
            gradient: "linear-gradient(180deg, #44A6FF 0%, #0E90FF 100%)",
            iconColor: "#fff",
            iconShadow: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
            Icon: FunctionSquare,
            subtypes: [
              { id: "invoke_function", label: "Invoke function" },
            ],
          },
          firecrawl: {
            label: "Firecrawl",
            copy: "Search, scrape, parse, and extract structured data for downstream workflow nodes.",
            color: "#FF4D00",
            gradient: "linear-gradient(180deg, #FF4D00 0%, #B83200 100%)",
            iconColor: "#fff",
            iconShadow: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
            Icon: Flame,
            subtypes: [
              { id: "web_search", label: "Web Search" },
              { id: "scrape_url", label: "Scrape URL" },
              { id: "parse_document", label: "Parse Document" },
              { id: "extract_data", label: "Extract Structured Data" },
            ],
          },
          table: {
            label: "Table",
            copy: "Parse CSV or TSV files into records and batches for database, Firecrawl, thread, and loop nodes.",
            color: "#39B877",
            gradient: "linear-gradient(180deg, #39B877 0%, #2B8B59 100%)",
            iconColor: "#fff",
            iconShadow: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
            Icon: typeof TableProperties !== "undefined" ? TableProperties : Database,
            subtypes: [
              { id: "parse_csv", label: "Parse CSV" },
              { id: "parse_tsv", label: "Parse TSV" },
            ],
          },
          database: {
            label: "Database",
            copy: "Insert, update, or delete documents in a Computer Agents database resource.",
            color: "#027559",
            gradient: "linear-gradient(180deg, #088263 0%, #027559 100%)",
            iconColor: "#fff",
            Icon: Database,
            subtypes: [
              { id: "insert_document", label: "Insert document" },
              { id: "insert_many_documents", label: "Insert many documents" },
              { id: "upsert_many_documents", label: "Upsert many documents" },
              { id: "update_document", label: "Update document" },
              { id: "delete_document", label: "Delete document" },
            ],
          },
          metronome: {
            label: "Metronome",
            copy: "Trigger another Metronome workflow and route its result into this workflow.",
            color: "#0D48FB",
            gradient: "linear-gradient(180deg, #125FFB 0%, #0D48FB 100%)",
            iconColor: "#fff",
            Icon: Metronome,
            subtypes: [
              { id: "run_workflow", label: "Run workflow" },
            ],
          },
          loop: {
            label: "Loop",
            copy: "Repeat enclosed steps by count, workflow context, tickets, or database state.",
            color: "#83C3FF",
            gradient: "linear-gradient(180deg, #8AD2FF 0%, #83C3FF 100%)",
            Icon: RefreshCw,
            subtypes: [
              { id: "fixed_count", label: "Fixed count" },
              { id: "workflow_context_contains", label: "Workflow context contains" },
              { id: "input_items", label: "Input items" },
              { id: "project_tickets", label: "Project tickets" },
              { id: "database_field", label: "Database field" },
              { id: "database_documents", label: "Database documents" },
            ],
          },
          approval: {
            label: "User Approval",
            copy: "Pause work until a human approves, rejects, or edits the run.",
            color: "#f472b6",
            Icon: Shield,
            subtypes: [
              { id: "approve_deploy", label: "Approve deploy" },
              { id: "approve_external_message", label: "Approve external message" },
              { id: "approve_project_write", label: "Approve project update" },
              { id: "approve_ct_spend", label: "Approve spend" },
              { id: "approve_team_resource", label: "Approve team resource write" },
            ],
          },
          note: {
            label: "Note",
            copy: "Add non-executable context, comments, and instructions to the workflow.",
            color: "#FECB0D",
            gradient: "linear-gradient(180deg, #FFD322 0%, #FECB0D 100%)",
            iconColor: "#050505",
            Icon: StickyNote,
            subtypes: [
              { id: "annotation", label: "Workflow note" },
            ],
          },
          end: {
            label: "End",
            copy: "Finish the workflow and stop the current run.",
            color: "#5B6BC9",
            gradient: "linear-gradient(180deg, #6B7AC9 0%, #5B6BC9 100%)",
            iconColor: "#fff",
            iconShadow: "drop-shadow(0px 0px 3px rgba(0,0,0,0.5))",
            Icon: Square,
            subtypes: [
              { id: "complete", label: "Complete workflow" },
            ],
          },
        };

        function getMetronomeDefaultNodeLabel(kind, subtype = "") {
          const normalizedKind = String(kind || "").trim();
          const meta = METRONOME_NODE_KIND_META[normalizedKind] || METRONOME_NODE_KIND_META.action;
          if (normalizedKind === "action") return "Thread";
          if (normalizedKind === "approval") return "User Approval";
          return meta?.label || "Node";
        }

        function normalizeMetronomeNodeLabel(value, kind, subtype = "") {
          const normalizedKind = String(kind || "").trim();
          const normalizedValue = String(value || "").trim();
          if (normalizedKind === "action" && /^start\s+(agent\s+)?thread$/i.test(normalizedValue)) {
            return "Thread";
          }
          if (normalizedKind === "approval" && /^user\s+approval$/i.test(normalizedValue)) {
            return "User Approval";
          }
          return normalizedValue || getMetronomeDefaultNodeLabel(normalizedKind, subtype);
        }

        function getMetronomeNodeDisplayLabel(nodeOrData) {
          const source = nodeOrData && typeof nodeOrData === "object" ? nodeOrData : {};
          const data = source.data && typeof source.data === "object" ? source.data : source;
          const kind = String(data.kind || source.kind || "action").trim() || "action";
          const subtype = String(data.subtype || source.subtype || "").trim();
          return normalizeMetronomeNodeLabel(data.label || source.label || "", kind, subtype);
        }

        function getMetronomeNodeTypeDescription(nodeOrData) {
          const source = nodeOrData && typeof nodeOrData === "object" ? nodeOrData : {};
          const data = source.data && typeof source.data === "object" ? source.data : source;
          const kind = String(data.kind || source.kind || "action").trim() || "action";
          const config = data.config && typeof data.config === "object" ? data.config : {};
          const subtype = String(config.triggerType || data.subtype || source.subtype || "").trim();
          if (kind === "trigger") {
            if (subtype === "periodic") return "Starts the workflow from a recurring schedule.";
            if (subtype === "email") return "Starts the workflow when a matching email arrives.";
            if (subtype === "telegram") return "Starts the workflow from an incoming Telegram message.";
            if (subtype === "function") return "Deploys a callable Computer Agents cloud function endpoint for this workflow.";
            if (subtype === "github") return "Starts the workflow from a GitHub repository event.";
            if (subtype === "project_ticket") return "Starts the workflow from project ticket activity.";
            if (subtype === "database_entry") return "Starts the workflow when a database entry is added.";
            if (subtype === "auth") return "Starts the workflow from an authentication event.";
            if (subtype === "resource") return "Starts the workflow from a selected resource event.";
            return "Defines when this workflow should start running.";
          }
          if (kind === "action") return "Runs an agent thread with the configured prompt, context, agent, and computer.";
          if (kind === "condition") return "Branches the run by evaluating workflow context, data fields, or structured rules.";
          if (kind === "approval") return "Pauses execution until a human approves, rejects, or adjusts the run.";
          if (kind === "ticket") return "Creates or updates project tickets, comments, subtasks, and status transitions.";
          if (kind === "imagine") return "Starts an Imagine generation step using the selected template and prompt.";
          if (kind === "function") return "Calls a Computer Agents function or external API and passes its result to downstream nodes.";
          if (kind === "firecrawl") return "Searches, scrapes, parses, or extracts web data for later workflow steps.";
          if (kind === "table") return "Parses tabular input into records that can feed database, loop, and thread nodes.";
          if (kind === "database") return "Reads or writes documents in a selected database resource.";
          if (kind === "metronome") return "Runs another Metronome workflow and uses its output in this workflow.";
          if (kind === "loop") return "Repeats the nodes inside this container for each configured item or condition.";
          if (kind === "end") return "Marks the workflow path as complete and stops execution for this branch.";
          if (kind === "note") return "Adds non-executable context or documentation to the workflow canvas.";
          return "Configures one step in the workflow execution graph.";
        }

        function getMetronomeSubtypeShortDescription(kind, subtype) {
          const normalizedKind = String(kind || "").trim();
          const normalizedSubtype = String(subtype || "").trim();
          const descriptionsByKind = {
            trigger: {
              thread_event: "Start from a chat command or incoming thread message.",
              periodic: "Run automatically on a recurring schedule.",
              email: "Start when a matching email arrives.",
              telegram: "Start from a Telegram message or command.",
              function: "Expose a callable cloud function endpoint.",
              github: "Start from repository webhook events.",
              project_ticket: "Start from project ticket activity.",
              resource: "Start from selected resource lifecycle events.",
              database_entry: "Start when a database document is created.",
              auth: "Start from authentication lifecycle events.",
            },
            condition: {
              previous_output_contains: "Branch by matching upstream workflow context.",
              database_document_field: "Branch by a field on a database document.",
              ticket_status: "Branch by the current status of a ticket.",
              json: "Branch by evaluating structured JSON rules.",
            },
            action: {
              start_thread: "Start or continue an agent thread.",
            },
            ticket: {
              adapt_ticket: "Update ticket title, description, or metadata.",
              add_ticket_comment: "Write a new comment on a ticket.",
              move_ticket_status: "Move a ticket into another status.",
              start_work_on_ticket: "Start agent work for a selected ticket.",
              add_subtask: "Create a child task on a ticket.",
            },
            imagine: {
              start_imagine: "Create an Imagine generation job.",
            },
            function: {
              invoke_function: "Call a deployed function resource.",
            },
            firecrawl: {
              web_search: "Search the web and return ranked results.",
              scrape_url: "Extract page content from a URL.",
              parse_document: "Parse document content into usable text.",
              extract_data: "Extract structured fields from web content.",
            },
            table: {
              parse_csv: "Parse CSV rows into workflow records.",
              parse_tsv: "Parse TSV rows into workflow records.",
            },
            database: {
              insert_document: "Create one document in a database.",
              insert_many_documents: "Create multiple database documents.",
              upsert_many_documents: "Create or update multiple documents.",
              update_document: "Update fields on an existing document.",
              delete_document: "Remove a document from a database.",
            },
            metronome: {
              run_workflow: "Run another workflow from this workflow.",
            },
            loop: {
              fixed_count: "Repeat a fixed number of times.",
              workflow_context_contains: "Repeat while workflow context matches.",
              input_items: "Repeat once for each input item.",
              project_tickets: "Repeat over tickets in a project.",
              database_field: "Repeat by values from a database field.",
              database_documents: "Repeat over matching database documents.",
            },
            approval: {
              approve_deploy: "Require human approval before deployment.",
              approve_external_message: "Require approval before external messaging.",
              approve_project_write: "Require approval before project changes.",
              approve_ct_spend: "Require approval before compute spend.",
              approve_team_resource: "Require approval before team resource changes.",
            },
            note: {
              annotation: "Add canvas-only workflow documentation.",
            },
            end: {
              complete: "Finish this workflow branch.",
            },
          };
          return descriptionsByKind[normalizedKind]?.[normalizedSubtype] || "";
        }

        const METRONOME_NODE_PALETTE_GROUPS = [
	          {
	            title: "Core",
	            items: [
	              { id: "trigger", kind: "trigger", label: "Trigger" },
	              { id: "action", kind: "action", label: "Thread" },
	              { id: "end", kind: "end", label: "End" },
	              { id: "note", kind: "note", label: "Note" },
	            ],
	          },
	          {
	            title: "Services",
	            items: [
	              { id: "ticket", kind: "ticket", label: "Ticket" },
	              { id: "imagine", kind: "imagine", label: "Imagine" },
	              { id: "function", kind: "function", label: "Function" },
	              { id: "database", kind: "database", label: "Database" },
	              { id: "metronome", kind: "metronome", label: "Metronome" },
	            ],
	          },
            {
              title: "Data & Web",
              items: [
                { id: "firecrawl", kind: "firecrawl", label: "Firecrawl" },
                { id: "table", kind: "table", label: "Table" },
              ],
            },
	          {
	            title: "Logic",
	            items: [
              { id: "condition", kind: "condition", label: "Condition" },
              { id: "loop", kind: "loop", label: "Loop" },
            ],
	          },
        ];

        function normalizeMetronomeImagineMediaMode(value) {
          return String(value || "").trim().toLowerCase() === "video" ? "video" : "image";
        }

        function getMetronomeImagineModelOptions(mediaMode) {
          return normalizeMetronomeImagineMediaMode(mediaMode) === "video"
            ? METRONOME_IMAGINE_VIDEO_MODEL_OPTIONS
            : METRONOME_IMAGINE_IMAGE_MODEL_OPTIONS;
        }

        function normalizeMetronomeImagineModelId(mediaMode, modelId) {
          const options = getMetronomeImagineModelOptions(mediaMode);
          const normalizedModelId = String(modelId || "").trim();
          return (options.find((option) => option.id === normalizedModelId) || options[0]).id;
        }

        function readMetronomeCustomImagineTemplateOptions() {
          if (typeof window === "undefined" || !window.localStorage) {
            return [];
          }
          try {
            const parsed = JSON.parse(window.localStorage.getItem(METRONOME_IMAGINE_CUSTOM_TEMPLATE_STORAGE_KEY) || "[]");
            if (!Array.isArray(parsed)) {
              return [];
            }
            return parsed.map((template) => {
              const id = String(template?.id || "").trim();
              const title = String(template?.title || template?.name || "").trim();
              if (!id || !title) {
                return null;
              }
              const hasVideo = Boolean(template?.videoUrl) || (Array.isArray(template?.assets) && template.assets.some((asset) => String(asset?.type || "").toLowerCase() === "video" || String(asset?.videoUrl || "").trim()));
              return {
                id,
                title,
                mediaType: hasVideo ? "video" : "image",
                prompt: String(template?.prompt || template?.placeholder || title || "").trim(),
              };
            }).filter(Boolean);
          } catch (_error) {
            return [];
          }
        }

        function getMetronomeImagineTemplateOptions() {
          const seen = new Set();
          return METRONOME_IMAGINE_BUILT_IN_TEMPLATE_OPTIONS.concat(readMetronomeCustomImagineTemplateOptions())
            .filter((template) => {
              const id = String(template?.id || "").trim();
              if (!id || seen.has(id)) {
                return false;
              }
              seen.add(id);
              return true;
            });
        }

        function normalizeMetronomeInputContextScope(value) {
          const normalized = String(value || "")
            .trim()
            .toLowerCase()
            .replace(/[_\s-]+/g, "_");
          return normalized === "latest" || normalized === "latest_only" || normalized === "recent"
            ? "latest"
            : "all";
        }

        const METRONOME_WORKFLOW_DATA_BINDING_OPTIONS = [
          { id: "last.text", label: "Previous node text" },
          { id: "last.json", label: "Previous node JSON" },
          { id: "last.urls", label: "Previous node URLs" },
          { id: "last.documents", label: "Previous node documents" },
          { id: "last.records", label: "Previous node records" },
          { id: "last.files", label: "Previous node files" },
          { id: "previous.table.batches", label: "Previous table batches" },
          { id: "previous.thread.records", label: "Previous thread records" },
          { id: "current.records", label: "Current loop records" },
          { id: "current.record", label: "Current loop record" },
          { id: "current.batch", label: "Current loop batch" },
          { id: "workflow.context", label: "Full workflow context" },
          { id: "trigger.input", label: "Trigger input" },
        ];

        const METRONOME_THREAD_OUTPUT_FIELDS = ["text", "json", "urls", "files", "records", "artifacts"];

        function parseMetronomeDynamicContentJsonObject(value) {
          if (value && typeof value === "object" && !Array.isArray(value)) {
            return value;
          }
          const rawValue = String(value || "").trim();
          if (!rawValue) return null;
          try {
            const parsed = JSON.parse(rawValue);
            return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
          } catch (_error) {
            return null;
          }
        }

        function normalizeMetronomeDynamicContentOutputKey(value, fallback = "output") {
          const normalized = String(value || "").trim();
          if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(normalized)) {
            return normalized;
          }
          const sanitized = normalized
            .replace(/[^A-Za-z0-9_$]+/g, "_")
            .replace(/^([^A-Za-z_$])/, "_$1")
            .replace(/_+/g, "_")
            .replace(/^_+|_+$/g, "");
          return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(sanitized)
            ? sanitized
            : String(fallback || "output");
        }

        function splitMetronomeDynamicContentPath(path) {
          return String(path || "")
            .split(".")
            .map((part) => String(part || "").trim())
            .filter(Boolean);
        }

        function formatMetronomeDynamicContentPathExpression(path) {
          const parts = splitMetronomeDynamicContentPath(path);
          if (!parts.length) return "";
          return parts.map((part) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(part)
            ? "." + part
            : "[" + JSON.stringify(part) + "]"
          ).join("");
        }

        function buildMetronomeDynamicContentToken(item) {
          if (!item || typeof item !== "object") return "";
          const scope = String(item.scope || "").trim();
          const path = String(item.path || "").trim();
          if (!path) return "";
          if (scope === "global") {
            return "{{ " + path + " }}";
          }
          const nodeId = String(item.nodeId || "").trim();
          if (!nodeId) return "{{ " + path + " }}";
          return "{{ nodes[" + JSON.stringify(nodeId) + "].outputs" + formatMetronomeDynamicContentPathExpression(path) + " }}";
        }

        function titleCaseMetronomeDynamicContentPathPart(value) {
          const normalized = String(value || "").trim().replace(/[_-]+/g, " ");
          if (!normalized) return "Value";
          return normalized.charAt(0).toUpperCase() + normalized.slice(1);
        }

        function addMetronomeDynamicContentField(fields, seen, path, label, type = "value", description = "") {
          const normalizedPath = splitMetronomeDynamicContentPath(path).join(".");
          if (!normalizedPath || seen.has(normalizedPath)) return;
          seen.add(normalizedPath);
          fields.push({
            path: normalizedPath,
            label: String(label || titleCaseMetronomeDynamicContentPathPart(normalizedPath.split(".").pop())).trim(),
            type: String(type || "value").trim(),
            description: String(description || "").trim(),
          });
        }

        function collectMetronomeDynamicContentJsonPaths(value, prefix = "", depth = 0, output = []) {
          if (!value || typeof value !== "object" || depth > 4 || output.length >= 48) {
            return output;
          }
          if (Array.isArray(value)) {
            const sample = value.find((item) => item && typeof item === "object");
            if (sample) collectMetronomeDynamicContentJsonPaths(sample, prefix, depth + 1, output);
            return output;
          }
          Object.entries(value).forEach(([key, childValue]) => {
            if (output.length >= 48) return;
            const normalizedKey = String(key || "").trim();
            if (!normalizedKey) return;
            const nextPath = prefix ? prefix + "." + normalizedKey : normalizedKey;
            const type = Array.isArray(childValue)
              ? "array"
              : childValue && typeof childValue === "object"
                ? "object"
                : typeof childValue || "value";
            output.push({ path: nextPath, label: titleCaseMetronomeDynamicContentPathPart(normalizedKey), type });
            if (childValue && typeof childValue === "object") {
              collectMetronomeDynamicContentJsonPaths(childValue, nextPath, depth + 1, output);
            }
          });
          return output;
        }

        function getMetronomeDynamicContentNodeOutputFields(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          const kind = String(data.kind || node?.kind || "action").trim() || "action";
          const config = data.config && typeof data.config === "object"
            ? data.config
            : node?.config && typeof node.config === "object"
              ? node.config
              : {};
          const fields = [];
          const seen = new Set();
          const addField = (path, label, type, description) => addMetronomeDynamicContentField(fields, seen, path, label, type, description);
          if (kind === "trigger") {
            const triggerType = String(config.triggerType || data.subtype || node?.subtype || "").trim();
            addField("input", "Trigger input", "object", "The payload that started this workflow.");
            addField("input.prompt", "Prompt", "text", "Prompt or message that started the run.");
            addField("input.files", "Files", "array", "Files included with the trigger.");
            addField("input.subject", "Subject", "text", "Subject from message or email triggers.");
            addField("input.from", "Sender", "text", "Sender from message or email triggers.");
            addField("input.body", "Body", "text", "Body text from message or email triggers.");
            if (triggerType === "function") {
              const payloadFields = normalizeMetronomeFunctionTriggerPayloadFields(config.payloadFields || config.payload_fields || config.payloadSchemaJson || config.payload_schema_json || config.expectedPayload || config.expected_payload);
              addField("payload", "Function payload", "object", "Payload received by the callable function trigger.");
              payloadFields.forEach((field) => {
                const key = String(field?.key || field?.name || "").trim();
                if (!key) return;
                const type = normalizeMetronomeFunctionTriggerPayloadType(field?.type);
                addField("payload." + key, titleCaseMetronomeDynamicContentPathPart(key), type, "Field from the function trigger payload.");
                addField("input." + key, titleCaseMetronomeDynamicContentPathPart(key), type, "Top-level field from the function trigger payload.");
              });
            }
            return fields;
          }
          if (kind === "action") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "thread");
            addField(outputKey + ".text", "Thread text", "text", "The assistant response text.");
            addField(outputKey + ".json", "Thread JSON", "object", "Structured response JSON.");
            addField(outputKey + ".urls", "URLs", "array", "URLs extracted or returned by the thread.");
            addField(outputKey + ".files", "Files", "array", "Files attached or produced by the thread.");
            addField(outputKey + ".records", "Records", "array", "Structured records returned by the thread.");
            addField(outputKey + ".artifacts", "Artifacts", "array", "Generated artifacts from the thread.");
            collectMetronomeDynamicContentJsonPaths(parseMetronomeDynamicContentJsonObject(config.outputContractJson || config.output_contract_json))
              .forEach((field) => {
                addField(outputKey + "." + field.path, field.label, field.type, "Field from this node's structured output contract.");
                addField(outputKey + ".json." + field.path, field.label, field.type, "Field from this node's structured output contract JSON.");
              });
            return fields;
          }
          if (kind === "imagine") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "imagine");
            addField(outputKey + ".summary", "Summary", "text", "Summary of the Imagine generation.");
            addField(outputKey + ".image", "Image", "file", "Generated image output.");
            addField(outputKey + ".video", "Video", "file", "Generated video output.");
            addField(outputKey + ".artifacts", "Artifacts", "array", "Generated media artifacts.");
            addField(outputKey + ".thread", "Thread", "object", "Imagine thread metadata.");
            return fields;
          }
          if (kind === "firecrawl") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "firecrawl");
            addField(outputKey + ".text", "Text", "text", "Readable text extracted from web or document content.");
            addField(outputKey + ".markdown", "Markdown", "text", "Markdown extracted from web or document content.");
            addField(outputKey + ".urls", "URLs", "array", "Discovered or scraped URLs.");
            addField(outputKey + ".documents", "Documents", "array", "Parsed document results.");
            addField(outputKey + ".records", "Records", "array", "Structured extraction records.");
            addField(outputKey + ".artifacts", "Artifacts", "array", "Saved Firecrawl artifacts.");
            collectMetronomeDynamicContentJsonPaths(parseMetronomeDynamicContentJsonObject(config.schemaJson || config.schema_json))
              .forEach((field) => addField(outputKey + ".records." + field.path, field.label, field.type, "Field from this Firecrawl extraction schema."));
            return fields;
          }
          if (kind === "table") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "table");
            addField(outputKey + ".records", "Records", "array", "Parsed table rows.");
            addField(outputKey + ".batches", "Batches", "array", "Rows grouped for loop or batch processing.");
            addField(outputKey + ".columns", "Columns", "array", "Detected table columns.");
            addField(outputKey + ".files", "Files", "array", "Source or generated files.");
            return fields;
          }
          if (kind === "database") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "database");
            addField(outputKey + ".document", "Document", "object", "Single database document result.");
            addField(outputKey + ".documents", "Documents", "array", "Multiple database documents.");
            addField(outputKey + ".records", "Records", "array", "Database records affected or returned.");
            addField(outputKey + ".count", "Count", "number", "Number of affected records.");
            collectMetronomeDynamicContentJsonPaths(parseMetronomeDynamicContentJsonObject(config.documentJson || config.document_json))
              .forEach((field) => addField(outputKey + ".document." + field.path, field.label, field.type, "Field from this database document shape."));
            return fields;
          }
          if (kind === "function") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "function");
            addField(outputKey + ".response", "Response", "object", "Full function response.");
            addField(outputKey + ".body", "Response body", "object", "Function response body.");
            addField(outputKey + ".text", "Text", "text", "Text response from the function.");
            addField(outputKey + ".json", "JSON", "object", "JSON response from the function.");
            addField(outputKey + ".status", "Status", "number", "Function response status.");
            return fields;
          }
          if (kind === "metronome") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "metronome");
            addField(outputKey + ".summary", "Summary", "text", "Summary from the nested workflow run.");
            addField(outputKey + ".output", "Output", "object", "Nested workflow output.");
            addField(outputKey + ".run", "Run", "object", "Nested workflow run metadata.");
            return fields;
          }
          if (kind === "loop") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "loop");
            addField(outputKey + ".items", "Items", "array", "Items iterated by the loop.");
            addField(outputKey + ".records", "Records", "array", "Records emitted by loop iterations.");
            addField(outputKey + ".results", "Results", "array", "Results collected from loop iterations.");
            return fields;
          }
          if (kind === "ticket") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "ticket");
            addField(outputKey + ".ticket", "Ticket", "object", "Ticket created or updated by this node.");
            addField(outputKey + ".status", "Status", "text", "Ticket status after this node runs.");
            addField(outputKey + ".comment", "Comment", "text", "Comment written by this node.");
            return fields;
          }
          if (kind === "approval") {
            const outputKey = normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, "approval");
            addField(outputKey + ".decision", "Decision", "text", "Approval decision.");
            addField(outputKey + ".reason", "Reason", "text", "Human review reason or note.");
            addField(outputKey + ".payload", "Payload", "object", "Payload returned by the reviewer.");
            return fields;
          }
          addField("output", "Output", "object", "Node output.");
          return fields;
        }

        function getMetronomeDynamicContentGlobalItems(selectedNode) {
          const selectedData = selectedNode?.data && typeof selectedNode.data === "object" ? selectedNode.data : {};
          const isInsideLoop = Boolean(selectedNode?.parentId || selectedData.parentId);
          const items = [
            { scope: "global", path: "trigger.input", label: "Trigger input", type: "object", description: "The payload that started this workflow." },
            { scope: "global", path: "trigger.payload", label: "Trigger payload", type: "object", description: "The request payload that started this workflow." },
            { scope: "global", path: "trigger.input.prompt", label: "Trigger prompt", type: "text", description: "The original user message or prompt." },
            { scope: "global", path: "trigger.input.files", label: "Trigger files", type: "array", description: "Files included with the trigger." },
            { scope: "global", path: "workflow.context", label: "Workflow context", type: "object", description: "Full accumulated workflow context." },
            { scope: "global", path: "last.text", label: "Previous node text", type: "text", description: "Text from the latest upstream node." },
            { scope: "global", path: "last.json", label: "Previous node JSON", type: "object", description: "JSON from the latest upstream node." },
            { scope: "global", path: "last.records", label: "Previous node records", type: "array", description: "Records from the latest upstream node." },
          ];
          if (isInsideLoop) {
            items.push(
              { scope: "global", path: "current.record", label: "Current loop record", type: "object", description: "The current loop item." },
              { scope: "global", path: "current.records", label: "Current loop records", type: "array", description: "All records in the current loop batch." },
              { scope: "global", path: "current.batch", label: "Current loop batch", type: "array", description: "The current loop batch." }
            );
          }
          return items.map((item) => ({ ...item, token: buildMetronomeDynamicContentToken(item) }));
        }

        function buildMetronomeDynamicContentGroups(nodes, edges, selectedNodeId) {
          const workflowNodes = Array.isArray(nodes) ? nodes : [];
          const workflowEdges = Array.isArray(edges) ? edges : [];
          const selectedId = String(selectedNodeId || "").trim();
          const nodeById = new Map(workflowNodes.map((node) => [String(node?.id || ""), node]).filter(([id]) => id));
          const selectedNode = nodeById.get(selectedId) || null;
          const groups = [
            {
              id: "workflow",
              title: "Workflow",
              subtitle: "Run context",
              items: getMetronomeDynamicContentGlobalItems(selectedNode),
            },
          ];
          if (!selectedNode) {
            return groups;
          }
          const incomingByTarget = new Map();
          workflowEdges.forEach((edge) => {
            const source = String(edge?.source || "").trim();
            const target = String(edge?.target || "").trim();
            if (!source || !target) return;
            if (!incomingByTarget.has(target)) incomingByTarget.set(target, []);
            incomingByTarget.get(target).push(source);
          });
          const upstreamIds = new Set();
          const stack = [...(incomingByTarget.get(selectedId) || [])];
          while (stack.length) {
            const upstreamId = stack.pop();
            if (!upstreamId || upstreamIds.has(upstreamId) || upstreamId === selectedId) continue;
            upstreamIds.add(upstreamId);
            (incomingByTarget.get(upstreamId) || []).forEach((sourceId) => stack.push(sourceId));
          }
          let parentId = String(selectedNode.parentId || selectedNode?.data?.parentId || "").trim();
          while (parentId && !upstreamIds.has(parentId)) {
            upstreamIds.add(parentId);
            const parentNode = nodeById.get(parentId);
            parentId = String(parentNode?.parentId || parentNode?.data?.parentId || "").trim();
          }
          if (!upstreamIds.size) {
            const selectedIndex = workflowNodes.findIndex((node) => String(node?.id || "") === selectedId);
            workflowNodes.slice(0, selectedIndex >= 0 ? selectedIndex : 0).forEach((node) => {
              const id = String(node?.id || "").trim();
              if (id && id !== selectedId) upstreamIds.add(id);
            });
          }
          workflowNodes
            .filter((node) => upstreamIds.has(String(node?.id || "")))
            .forEach((node) => {
              const nodeContract = getMetronomeNodeIOContract(node);
              const outputFields = Array.isArray(nodeContract.outputs) ? nodeContract.outputs : [];
              if (!outputFields.length) return;
              const nodeId = String(node.id || "").trim();
              groups.push({
                id: "node:" + nodeId,
                title: nodeContract.label || getMetronomeNodeDisplayLabel(node),
                subtitle: nodeContract.kindLabel || titleCaseMetronomeDynamicContentPathPart(nodeContract.kind),
                items: outputFields.map((field) => {
                  const item = {
                    scope: "node",
                    nodeId,
                    path: field.path,
                    label: field.label,
                    type: field.type,
                    description: field.description,
                  };
                  return { ...item, token: buildMetronomeDynamicContentToken(item) };
                }),
              });
            });
          return groups;
        }

        const METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION = 1;
        const METRONOME_DYNAMIC_REFERENCE_PATTERN = /\{\{\s*([^{}]+?)\s*\}\}/g;

        function getMetronomeNodeConfigRecord(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          return data.config && typeof data.config === "object"
            ? data.config
            : node?.config && typeof node.config === "object"
              ? node.config
              : {};
        }

        function getMetronomeNodeKindValue(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          return String(data.kind || node?.kind || "action").trim() || "action";
        }

        function getMetronomeNodeSubtypeValue(node) {
          const data = node?.data && typeof node.data === "object" ? node.data : {};
          return String(data.subtype || node?.subtype || "").trim();
        }

        function inferMetronomeDynamicContentValueType(value) {
          if (Array.isArray(value)) return "array";
          if (value && typeof value === "object") return "object";
          if (typeof value === "number") return "number";
          if (typeof value === "boolean") return "boolean";
          if (value === null) return "null";
          return "string";
        }

        function createMetronomeDynamicContentContractField(path, label, type = "value", description = "") {
          return {
            path: splitMetronomeDynamicContentPath(path).join("."),
            label: String(label || titleCaseMetronomeDynamicContentPathPart(String(path || "").split(".").pop())).trim(),
            type: String(type || "value").trim(),
            description: String(description || "").trim(),
          };
        }

        function getMetronomeDynamicContentNodeInputFields(node) {
          const kind = getMetronomeNodeKindValue(node);
          const config = getMetronomeNodeConfigRecord(node);
          const fields = [];
          const addInput = (path, label, type = "value", binding = "") => fields.push({
            path,
            label,
            type,
            binding: String(binding || config[path] || config[path.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase())] || "").trim(),
          });
          if (kind === "action") {
            addInput("message", "Prompt adaption", "text");
            addInput("inputContextScope", "Input context scope", "enum");
            return fields;
          }
          if (kind === "firecrawl") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("query", "Fallback query", "text");
            addInput("url", "Fallback URL", "url");
            addInput("filePath", "Fallback file path", "path");
            addInput("prompt", "Extraction prompt", "text");
            addInput("schemaJson", "Output schema", "json");
            return fields;
          }
          if (kind === "table") {
            addInput("inputBinding", "Table source", "binding", config.inputBinding || config.input_binding);
            addInput("filePath", "Fallback file path or URL", "path");
            return fields;
          }
          if (kind === "database") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("recordsBinding", "Records binding", "binding", config.recordsBinding || config.records_binding);
            addInput("documentJson", "Document template", "json");
            addInput("documentTemplateJson", "Bulk document template", "json");
            return fields;
          }
          if (kind === "function") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("inputJson", "Function input", "json");
            return fields;
          }
          if (kind === "ticket") {
            addInput("adaptationInstructions", "Adaptation instructions", "text");
            addInput("comment", "Comment", "text");
            addInput("subtaskInstructions", "Subtask instructions", "text");
            addInput("workInstructions", "Work instructions", "text");
            addInput("fieldsJson", "Ticket fields", "json");
            return fields;
          }
          if (kind === "imagine") {
            addInput("prompt", "Prompt adaption", "text");
            return fields;
          }
          if (kind === "metronome") {
            addInput("inputBinding", "Input binding", "binding", config.inputBinding || config.input_binding);
            addInput("inputJson", "Workflow input", "json");
            return fields;
          }
          if (kind === "condition") {
            addInput("conditions", "Branch conditions", "rules");
            return fields;
          }
          if (kind === "approval") {
            addInput("message", "Approval message", "text");
            return fields;
          }
          return fields;
        }

        function getMetronomeNodeIOContract(node) {
          const nodeId = String(node?.id || "").trim();
          const kind = getMetronomeNodeKindValue(node);
          const subtype = getMetronomeNodeSubtypeValue(node);
          const config = getMetronomeNodeConfigRecord(node);
          const meta = METRONOME_NODE_KIND_META[kind] || METRONOME_NODE_KIND_META.action;
          const outputs = getMetronomeDynamicContentNodeOutputFields(node).map((field) => createMetronomeDynamicContentContractField(
            field.path,
            field.label,
            field.type,
            field.description
          ));
          const outputKey = outputs.length
            ? splitMetronomeDynamicContentPath(outputs[0].path)[0] || ""
            : normalizeMetronomeDynamicContentOutputKey(config.outputKey || config.output_key, kind === "action" ? "thread" : kind || "output");
          return {
            version: METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION,
            nodeId,
            kind,
            subtype,
            label: getMetronomeNodeDisplayLabel(node),
            kindLabel: meta?.label || titleCaseMetronomeDynamicContentPathPart(kind),
            outputKey,
            inputs: getMetronomeDynamicContentNodeInputFields(node),
            outputs,
          };
        }

        function parseMetronomeDynamicContentPathExpression(expression) {
          const text = String(expression || "").trim();
          const parts = [];
          let index = 0;
          while (index < text.length) {
            if (text[index] === ".") {
              index += 1;
              const start = index;
              while (index < text.length && /[A-Za-z0-9_$-]/.test(text[index])) index += 1;
              const part = text.slice(start, index).trim();
              if (part) parts.push(part);
              continue;
            }
            if (text[index] === "[") {
              const quote = text[index + 1];
              if (quote === "\"" || quote === "'") {
                let cursor = index + 2;
                let raw = "";
                while (cursor < text.length) {
                  if (text[cursor] === "\\" && cursor + 1 < text.length) {
                    raw += text[cursor + 1];
                    cursor += 2;
                    continue;
                  }
                  if (text[cursor] === quote && text[cursor + 1] === "]") {
                    parts.push(raw);
                    index = cursor + 2;
                    break;
                  }
                  raw += text[cursor];
                  cursor += 1;
                }
                if (index !== cursor + 2) break;
                continue;
              }
              const closeIndex = text.indexOf("]", index);
              if (closeIndex === -1) break;
              const part = text.slice(index + 1, closeIndex).trim();
              if (part) parts.push(part);
              index = closeIndex + 1;
              continue;
            }
            const start = index;
            while (index < text.length && text[index] !== "." && text[index] !== "[") index += 1;
            const part = text.slice(start, index).trim();
            if (part) parts.push(part);
          }
          return parts;
        }

        function parseMetronomeDynamicReferenceExpression(expression) {
          const normalized = String(expression || "").trim();
          if (!normalized) return null;
          const bracketNodeMatch = normalized.match(/^nodes\[(["'])(.*?)\1\]\.outputs(.*)$/);
          if (bracketNodeMatch) {
            return {
              scope: "node",
              nodeId: bracketNodeMatch[2],
              path: parseMetronomeDynamicContentPathExpression(bracketNodeMatch[3] || ""),
              expression: normalized,
            };
          }
          const dotNodeMatch = normalized.match(/^nodes\.([A-Za-z0-9_$-]+)\.outputs(.*)$/);
          if (dotNodeMatch) {
            return {
              scope: "node",
              nodeId: dotNodeMatch[1],
              path: parseMetronomeDynamicContentPathExpression(dotNodeMatch[2] || ""),
              expression: normalized,
            };
          }
          const parts = normalized.split(".").map((part) => part.trim()).filter(Boolean);
          if (!parts.length) return null;
          return {
            scope: parts[0],
            path: parts.slice(1),
            expression: normalized,
          };
        }

        function getMetronomeDynamicContentValueAtPath(value, path) {
          const parts = Array.isArray(path) ? path : splitMetronomeDynamicContentPath(path);
          let current = value;
          for (const part of parts) {
            if (current === undefined || current === null) return undefined;
            if (Array.isArray(current)) {
              const index = Number(part);
              if (!Number.isInteger(index) || index < 0 || index >= current.length) return undefined;
              current = current[index];
              continue;
            }
            if (typeof current !== "object") return undefined;
            if (!Object.prototype.hasOwnProperty.call(current, part)) return undefined;
            current = current[part];
          }
          return current;
        }

        function resolveMetronomeDynamicReferenceValue(parsedReference, context = {}) {
          if (!parsedReference) return undefined;
          const scope = String(parsedReference.scope || "").trim();
          if (scope === "node") {
            const node = context.nodes && typeof context.nodes === "object"
              ? context.nodes[String(parsedReference.nodeId || "")]
              : undefined;
            const outputs = node && typeof node === "object" && Object.prototype.hasOwnProperty.call(node, "outputs")
              ? node.outputs
              : node;
            return getMetronomeDynamicContentValueAtPath(outputs, parsedReference.path || []);
          }
          const source = Object.prototype.hasOwnProperty.call(context, scope)
            ? context[scope]
            : undefined;
          return getMetronomeDynamicContentValueAtPath(source, parsedReference.path || []);
        }

        function stringifyMetronomeDynamicReferenceValue(value) {
          if (value === undefined || value === null) return "";
          if (typeof value === "string") return value;
          if (typeof value === "number" || typeof value === "boolean") return String(value);
          try {
            return JSON.stringify(value);
          } catch (_error) {
            return String(value);
          }
        }

        function resolveMetronomeDynamicContentReferences(value, context = {}, options = {}) {
          if (typeof value === "string") {
            const matches = [...value.matchAll(METRONOME_DYNAMIC_REFERENCE_PATTERN)];
            if (!matches.length) return value;
            const keepUnresolved = options.keepUnresolved !== false;
            if (matches.length === 1 && matches[0].index === 0 && matches[0][0].length === value.length) {
              const parsed = parseMetronomeDynamicReferenceExpression(matches[0][1]);
              const resolved = resolveMetronomeDynamicReferenceValue(parsed, context);
              return resolved === undefined && keepUnresolved ? matches[0][0] : resolved;
            }
            return value.replace(METRONOME_DYNAMIC_REFERENCE_PATTERN, (token, expression) => {
              const parsed = parseMetronomeDynamicReferenceExpression(expression);
              const resolved = resolveMetronomeDynamicReferenceValue(parsed, context);
              return resolved === undefined && keepUnresolved
                ? token
                : stringifyMetronomeDynamicReferenceValue(resolved);
            });
          }
          if (Array.isArray(value)) {
            return value.map((item) => resolveMetronomeDynamicContentReferences(item, context, options));
          }
          if (value && typeof value === "object") {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [
              key,
              resolveMetronomeDynamicContentReferences(item, context, options),
            ]));
          }
          return value;
        }

        function extractMetronomeDynamicContentReferences(value, path = [], output = []) {
          if (typeof value === "string") {
            [...value.matchAll(METRONOME_DYNAMIC_REFERENCE_PATTERN)].forEach((match) => {
              const expression = String(match[1] || "").trim();
              const parsed = parseMetronomeDynamicReferenceExpression(expression);
              if (!parsed) return;
              output.push({
                expression,
                token: match[0],
                path: path.join("."),
                scope: parsed.scope,
                nodeId: parsed.nodeId || "",
                valuePath: Array.isArray(parsed.path) ? parsed.path.join(".") : "",
              });
            });
            return output;
          }
          if (Array.isArray(value)) {
            value.forEach((item, index) => extractMetronomeDynamicContentReferences(item, path.concat(String(index)), output));
            return output;
          }
          if (value && typeof value === "object") {
            Object.entries(value).forEach(([key, item]) => extractMetronomeDynamicContentReferences(item, path.concat(key), output));
          }
          return output;
        }

        function createMetronomeInitialReferenceContext(workflow, definition, inputs = {}) {
          const safeInputs = inputs && typeof inputs === "object" ? inputs : { value: inputs };
          const triggerPayload = safeInputs.payload && typeof safeInputs.payload === "object"
            ? safeInputs.payload
            : safeInputs;
          const workflowContext = {
            workflowId: String(workflow?.id || definition?.id || "").trim(),
            workflowName: String(workflow?.name || definition?.name || "Metronome").trim(),
            input: safeInputs,
            trigger: safeInputs,
            payload: triggerPayload,
          };
          return {
            input: safeInputs,
            trigger: { input: safeInputs, payload: triggerPayload },
            workflow: { context: workflowContext },
            current: {},
            previous: {},
            last: {},
            nodes: {},
          };
        }

        function enrichMetronomeWorkflowDefinitionWithDynamicContent(definition, workflow = null, inputs = {}) {
          const safeDefinition = definition && typeof definition === "object" ? definition : { nodes: [], edges: [] };
          const definitionNodes = Array.isArray(safeDefinition.nodes) ? safeDefinition.nodes : [];
          const enrichedNodes = definitionNodes.map((node) => {
            const config = getMetronomeNodeConfigRecord(node);
            const ioContract = getMetronomeNodeIOContract(node);
            return {
              ...node,
              ioContract,
              dynamicReferences: extractMetronomeDynamicContentReferences(config),
            };
          });
          const nodeContracts = Object.fromEntries(enrichedNodes.map((node) => [String(node.id || ""), node.ioContract]).filter(([id]) => id));
          const references = enrichedNodes.flatMap((node) =>
            (Array.isArray(node.dynamicReferences) ? node.dynamicReferences : []).map((reference) => ({
              ...reference,
              nodeId: String(node.id || ""),
              nodeLabel: getMetronomeNodeDisplayLabel(node),
            }))
          );
          return {
            ...safeDefinition,
            nodes: enrichedNodes,
            dynamicContent: {
              version: METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION,
              syntax: "mustache-expression-v1",
              supportedScopes: ["trigger", "workflow", "nodes", "last", "previous", "current", "input", "record"],
              nodeContracts,
              references,
              initialReferenceContext: createMetronomeInitialReferenceContext(workflow, safeDefinition, inputs),
            },
          };
        }

        function createMetronomeExecutionPayload(workflow, definition, inputs = {}, extra = {}) {
          const context = createMetronomeInitialReferenceContext(workflow, definition, inputs);
          const resolvedInputs = resolveMetronomeDynamicContentReferences(inputs, context, { keepUnresolved: true });
          const enrichedDefinition = enrichMetronomeWorkflowDefinitionWithDynamicContent(definition, workflow, resolvedInputs);
          return {
            ...extra,
            definition: enrichedDefinition,
            inputs: resolvedInputs,
            dynamicContent: {
              version: METRONOME_DYNAMIC_REFERENCE_RUNTIME_VERSION,
              syntax: "mustache-expression-v1",
              resolvedInputReferences: extractMetronomeDynamicContentReferences(inputs),
            },
          };
        }

        function normalizeMetronomeDataBinding(value, fallback = "last.text") {
          const normalized = String(value || "").trim();
          if (normalized === "trigger.input.csvContent") return "workflow.trigger.input.csvContent";
          if (normalized) return normalized;
          return String(fallback || "last.text");
        }

        function normalizeMetronomeFirecrawlOperation(value) {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          return ["web_search", "scrape_url", "parse_document", "extract_data"].includes(normalized)
            ? normalized
            : "web_search";
        }

        function normalizeMetronomeTableOperation(value) {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          return ["parse_csv", "parse_tsv"].includes(normalized)
            ? normalized
            : "parse_csv";
        }

        function normalizeMetronomeFunctionMode(value, fallback = "computer_agents_function") {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          if (["external_api", "api", "http", "http_request", "webhook"].includes(normalized)) return "external_api";
          if (["computer_agents_function", "computer_agent_function", "computer_agents", "function", "server_function"].includes(normalized)) {
            return "computer_agents_function";
          }
          return fallback === "external_api" ? "external_api" : "computer_agents_function";
        }

        function normalizeMetronomeFunctionHttpMethod(value) {
          const normalized = String(value || "").trim().toUpperCase();
          return ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"].includes(normalized) ? normalized : "POST";
        }

        function createMetronomeHeaderRow(overrides = {}) {
          const rawValue = String(overrides.value || "").trim();
          const explicitValueType = String(overrides.valueType || overrides.value_type || overrides.type || "").trim();
          const valueType = explicitValueType === "secret" || rawValue.startsWith("secrets:") ? "secret" : "text";
          const secretRef = String(overrides.secretRef || overrides.secret_ref || rawValue || "").trim();
          const parsedSecretRef = valueType === "secret" ? parseMetronomeSecretCredentialRef(secretRef) : { vaultId: "", secretId: "" };
          return {
            id: String(overrides.id || "header_" + Math.random().toString(36).slice(2, 10)),
            name: String(overrides.name || overrides.key || ""),
            valueType,
            value: valueType === "secret" ? "" : String(overrides.value || ""),
            secretRef: valueType === "secret" ? secretRef : "",
            secretVaultId: String(overrides.secretVaultId || overrides.secret_vault_id || parsedSecretRef.vaultId || ""),
            secretVaultName: String(overrides.secretVaultName || overrides.secret_vault_name || ""),
            secretId: String(overrides.secretId || overrides.secret_id || parsedSecretRef.secretId || ""),
            secretName: String(overrides.secretName || overrides.secret_name || ""),
          };
        }

        function normalizeMetronomeFunctionHeaderRows(value) {
          const rows = [];
          const preserveBlankRows = Array.isArray(value);
          const addRow = (row) => {
            const normalizedRow = createMetronomeHeaderRow(row);
            if (!preserveBlankRows && !normalizedRow.name && !normalizedRow.value && !normalizedRow.secretRef) return;
            rows.push(normalizedRow);
          };
          if (Array.isArray(value)) {
            value.forEach(addRow);
          } else if (value && typeof value === "object") {
            Object.entries(value).forEach(([name, rawValue]) => {
              if (rawValue && typeof rawValue === "object" && !Array.isArray(rawValue)) {
                addRow({ name, ...rawValue });
              } else {
                addRow({ name, value: String(rawValue ?? "") });
              }
            });
          } else {
            const text = String(value || "").trim();
            if (text) {
              try {
                const parsed = JSON.parse(text);
                return normalizeMetronomeFunctionHeaderRows(parsed);
              } catch {
                rows.push(createMetronomeHeaderRow());
              }
            }
          }
          return rows.length ? rows : [createMetronomeHeaderRow()];
        }

        function serializeMetronomeFunctionHeaderRows(rows) {
          const headers = {};
          (Array.isArray(rows) ? rows : []).forEach((row) => {
            const name = String(row?.name || "").trim();
            if (!name) return;
            if (String(row?.valueType || "") === "secret") {
              const secretRef = String(row?.secretRef || "").trim();
              if (secretRef) headers[name] = secretRef;
              return;
            }
            const value = String(row?.value || "");
            if (value) headers[name] = value;
          });
          return JSON.stringify(headers, null, 2);
        }

        function createDefaultMetronomeFunctionConfig(overrides = {}) {
          const inferredFallbackMode = (overrides.url || overrides.requestUrl || overrides.endpoint)
            ? "external_api"
            : "computer_agents_function";
          const functionMode = normalizeMetronomeFunctionMode(
            overrides.functionMode || overrides.function_mode || overrides.mode || overrides.type,
            inferredFallbackMode
          );
          const httpMethod = normalizeMetronomeFunctionHttpMethod(overrides.httpMethod || overrides.http_method || overrides.method);
          const rawHeaders = overrides.requestHeaders || overrides.request_headers || overrides.headersRows || overrides.headers_rows || overrides.requestHeadersJson || overrides.request_headers_json || overrides.headersJson || overrides.headers_json || overrides.headers;
          const rawPayload = overrides.payloadJson !== undefined
            ? overrides.payloadJson
            : overrides.payload_json !== undefined
              ? overrides.payload_json
              : overrides.payload;
          const requestHeaders = normalizeMetronomeFunctionHeaderRows(rawHeaders);
          const requestHeadersJson = rawHeaders && typeof rawHeaders === "object"
            ? serializeMetronomeFunctionHeaderRows(requestHeaders)
            : String(rawHeaders || serializeMetronomeFunctionHeaderRows(requestHeaders));
          const payloadJson = rawPayload !== null && typeof rawPayload === "object"
            ? JSON.stringify(rawPayload, null, 2)
            : rawPayload === undefined || rawPayload === null
              ? ""
              : String(rawPayload);
          const outputKey = String(overrides.outputKey || overrides.output_key || "function");
          return {
            functionMode,
            functionId: String(overrides.functionId || overrides.function_id || ""),
            functionName: String(overrides.functionName || overrides.function_name || ""),
            httpMethod,
            method: httpMethod,
            url: String(overrides.url || overrides.requestUrl || overrides.request_url || overrides.endpoint || ""),
            ...overrides,
            functionMode,
            httpMethod,
            method: httpMethod,
            requestHeaders,
            requestHeadersJson,
            payloadJson,
            outputKey,
          };
        }

        function createDefaultMetronomeThreadOutputConfig(overrides = {}) {
          const outputMode = String(overrides.outputMode || overrides.output_mode || "").trim() === "structured"
            ? "structured"
            : "text";
          return {
            outputMode,
            requireJsonOutput: Boolean(overrides.requireJsonOutput || overrides.require_json_output),
            outputFieldsJson: String(overrides.outputFieldsJson || overrides.output_fields_json || JSON.stringify(METRONOME_THREAD_OUTPUT_FIELDS, null, 2)),
            outputContractJson: String(overrides.outputContractJson || overrides.output_contract_json || "{\n  \"summary\": \"\",\n  \"urls\": [],\n  \"records\": [],\n  \"artifacts\": []\n}"),
            outputKey: String(overrides.outputKey || overrides.output_key || "thread"),
          };
        }

        function createDefaultMetronomeFirecrawlConfig(operation, overrides = {}) {
          const normalizedOperation = normalizeMetronomeFirecrawlOperation(operation || overrides.operation);
          const base = {
            operation: normalizedOperation,
            credentialRef: String(overrides.credentialRef || overrides.credential_ref || "workspace:FIRECRAWL_API_KEY"),
            credentialVaultId: String(overrides.credentialVaultId || overrides.credential_vault_id || ""),
            credentialVaultName: String(overrides.credentialVaultName || overrides.credential_vault_name || ""),
            credentialSecretId: String(overrides.credentialSecretId || overrides.credential_secret_id || ""),
            credentialSecretName: String(overrides.credentialSecretName || overrides.credential_secret_name || ""),
            inputBinding: normalizeMetronomeDataBinding(overrides.inputBinding || overrides.input_binding, normalizedOperation === "web_search" ? "last.text" : "last.urls"),
            query: String(overrides.query || ""),
            url: String(overrides.url || ""),
            filePath: String(overrides.filePath || overrides.file_path || ""),
            prompt: String(overrides.prompt || ""),
            schemaJson: String(overrides.schemaJson || overrides.schema_json || "{\n  \"type\": \"object\",\n  \"properties\": {}\n}"),
            limit: Number.isFinite(Number(overrides.limit)) ? Number(overrides.limit) : 5,
            formats: String(overrides.formats || "markdown,html"),
            saveArtifacts: overrides.saveArtifacts === undefined && overrides.save_artifacts === undefined ? true : Boolean(overrides.saveArtifacts ?? overrides.save_artifacts),
            outputKey: String(overrides.outputKey || overrides.output_key || "firecrawl"),
            ...overrides,
          };
          return {
            ...base,
            operation: normalizedOperation,
            inputBinding: normalizeMetronomeDataBinding(base.inputBinding, normalizedOperation === "web_search" ? "last.text" : "last.urls"),
          };
        }

        function createDefaultMetronomeTableConfig(operation, overrides = {}) {
          const normalizedOperation = normalizeMetronomeTableOperation(operation || overrides.operation);
          return {
            operation: normalizedOperation,
            inputBinding: normalizeMetronomeDataBinding(overrides.inputBinding || overrides.input_binding, "trigger.input.files"),
            filePath: String(overrides.filePath || overrides.file_path || ""),
            delimiter: String(overrides.delimiter || (normalizedOperation === "parse_tsv" ? "\\t" : "")),
            hasHeader: overrides.hasHeader === undefined && overrides.has_header === undefined ? true : Boolean(overrides.hasHeader ?? overrides.has_header),
            batchSize: Number.isFinite(Number(overrides.batchSize || overrides.batch_size)) ? Number(overrides.batchSize || overrides.batch_size) : 5,
            outputKey: String(overrides.outputKey || overrides.output_key || "table"),
            ...overrides,
            operation: normalizedOperation,
          };
        }

        function createDefaultMetronomeDatabaseConfig(operation, overrides = {}) {
          const normalizedOperation = String(operation || overrides.operation || "insert_document").trim() || "insert_document";
          const isBulk = normalizedOperation === "insert_many_documents" || normalizedOperation === "upsert_many_documents";
          return {
            operation: normalizedOperation,
            databaseId: "",
            databaseName: "",
            collection: "",
            documentId: "",
            documentJson: "{\n  \"source\": \"metronome\",\n  \"payload\": \"{{ input }}\"\n}",
            inputBinding: normalizeMetronomeDataBinding(overrides.inputBinding || overrides.input_binding, isBulk ? "last.records" : "last.json"),
            recordsBinding: normalizeMetronomeDataBinding(overrides.recordsBinding || overrides.records_binding, "last.records"),
            documentTemplateJson: String(overrides.documentTemplateJson || overrides.document_template_json || "{\n  \"source\": \"metronome\",\n  \"record\": \"{{ record }}\"\n}"),
            upsertKey: String(overrides.upsertKey || overrides.upsert_key || "id"),
            ...overrides,
            operation: normalizedOperation,
          };
        }

        function isMetronomeDatabasePlainObject(value) {
          return Boolean(value && typeof value === "object" && !Array.isArray(value));
        }

        function parseMetronomeDatabaseDocumentObject(value) {
          try {
            const parsed = typeof value === "string" ? JSON.parse(value || "{}") : value;
            return isMetronomeDatabasePlainObject(parsed) ? parsed : null;
          } catch (_error) {
            return null;
          }
        }

        function cloneMetronomeDatabaseValue(value) {
          if (Array.isArray(value)) {
            return value.map((item) => cloneMetronomeDatabaseValue(item));
          }
          if (isMetronomeDatabasePlainObject(value)) {
            return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, cloneMetronomeDatabaseValue(item)]));
          }
          return value;
        }

        function formatMetronomeDatabaseDocumentJson(value) {
          try {
            return JSON.stringify(value && typeof value === "object" ? value : {}, null, 2);
          } catch (_error) {
            return "{\n}";
          }
        }

        function getMetronomeDatabasePathKey(path) {
          return (Array.isArray(path) ? path : []).map((part) => String(part)).join(".");
        }

        function getMetronomeDatabaseFieldType(value) {
          if (value === null) return "null";
          if (Array.isArray(value)) return "array";
          if (isMetronomeDatabasePlainObject(value)) return "map";
          if (typeof value === "number") return "number";
          if (typeof value === "boolean") return "boolean";
          return "string";
        }

        function getMetronomeDatabaseValueAtPath(rootValue, path) {
          let current = rootValue;
          for (const part of Array.isArray(path) ? path : []) {
            if (!current || typeof current !== "object") return undefined;
            current = current[part];
          }
          return current;
        }

        function setMetronomeDatabaseValueAtPath(rootValue, path, nextValue) {
          const nextRoot = cloneMetronomeDatabaseValue(rootValue || {});
          const normalizedPath = Array.isArray(path) ? path : [];
          if (!normalizedPath.length) return nextValue;
          let current = nextRoot;
          normalizedPath.slice(0, -1).forEach((part) => {
            if (!current[part] || typeof current[part] !== "object") {
              current[part] = {};
            }
            current = current[part];
          });
          current[normalizedPath[normalizedPath.length - 1]] = nextValue;
          return nextRoot;
        }

        function deleteMetronomeDatabaseValueAtPath(rootValue, path) {
          const nextRoot = cloneMetronomeDatabaseValue(rootValue || {});
          const normalizedPath = Array.isArray(path) ? path : [];
          if (!normalizedPath.length) return nextRoot;
          let current = nextRoot;
          normalizedPath.slice(0, -1).forEach((part) => {
            current = current && typeof current === "object" ? current[part] : null;
          });
          if (current && typeof current === "object") {
            delete current[normalizedPath[normalizedPath.length - 1]];
          }
          return nextRoot;
        }

        function createMetronomeDatabaseFieldValue(type, rawValue = "") {
          const normalizedType = String(type || "string").toLowerCase();
          if (normalizedType === "number") {
            const trimmedValue = String(rawValue || "").trim();
            if (!trimmedValue) return 0;
            const numericValue = Number(trimmedValue);
            if (!Number.isFinite(numericValue)) {
              throw new Error("Number value is invalid.");
            }
            return numericValue;
          }
          if (normalizedType === "boolean") return String(rawValue || "").trim() === "true";
          if (normalizedType === "null") return null;
          if (normalizedType === "array") return [];
          if (normalizedType === "map" || normalizedType === "object") return {};
          return String(rawValue || "");
        }

        function coerceMetronomeDatabaseFieldValue(previousValue, rawValue) {
          const previousType = getMetronomeDatabaseFieldType(previousValue);
          if (previousType === "number") {
            const nextNumber = Number(rawValue);
            return Number.isFinite(nextNumber) ? nextNumber : 0;
          }
          if (previousType === "boolean") {
            return String(rawValue) === "true";
          }
          if (previousType === "null") {
            return null;
          }
          return String(rawValue || "");
        }

        function formatMetronomeDatabaseFieldPreview(value) {
          const type = getMetronomeDatabaseFieldType(value);
          if (type === "array") return value.length + " item" + (value.length === 1 ? "" : "s");
          if (type === "map") {
            const count = Object.keys(value || {}).length;
            return count + " field" + (count === 1 ? "" : "s");
          }
          if (type === "null") return "null";
          if (type === "boolean") return value ? "true" : "false";
          if (type === "number") return String(value);
          const text = String(value || "");
          return text.length > 72 ? text.slice(0, 69) + "..." : text;
        }
`;
