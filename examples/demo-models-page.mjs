export const MODELS_PAGE_CSS = String.raw`
      .playground-models-page .playground-develop-header {
        margin-bottom: 0;
      }

      .playground-models-page .playground-develop-tabs {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-models-section {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .playground-models-page .playground-models-section.playground-auth-users-surface.playground-server-details-card {
        --playground-models-table-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        margin-top: 0;
        position: relative;
        isolation: isolate;
        z-index: 0;
        overflow: hidden;
        border: 0 !important;
        border-radius: 15px;
        background: transparent !important;
        box-shadow: none;
        -webkit-backdrop-filter: blur(50px);
        backdrop-filter: blur(50px);
      }

      .playground-models-page .playground-models-section.playground-auth-users-surface.playground-server-details-card::before {
        content: "";
        display: block;
        pointer-events: none;
        position: absolute;
        inset: 0;
        z-index: 5;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-models-table-border);
        box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.14);
        -webkit-mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        -webkit-mask-composite: xor;
        -webkit-mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        -webkit-mask-clip: content-box, border-box;
        -webkit-mask-composite: xor;
        -webkit-mask-origin: content-box, border-box;
        -webkit-mask-repeat: repeat, repeat;
        -webkit-mask-size: auto, auto;
        mask:
          linear-gradient(#000 0 0) content-box,
          linear-gradient(#000 0 0);
        mask-composite: exclude;
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-models-page .playground-models-section.playground-auth-users-surface.playground-server-details-card > * {
        position: relative;
        z-index: 1;
      }

      .playground-models-section .playground-tasks-detail-facts-body {
        background: transparent;
        border: 0;
      }

      .playground-models-section .playground-auth-users-toolbar {
        margin-bottom: 0;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-models-section .playground-auth-users-table-shell {
        overflow: visible;
        border: 0;
        background: transparent;
        box-shadow: none;
      }

      .playground-models-section .playground-auth-users-table {
        background: transparent;
      }

      .playground-models-section .playground-auth-users-table tbody tr {
        cursor: default;
      }

      .playground-models-section .playground-auth-users-table tbody tr:hover td {
        background: rgba(255, 255, 255, 0.03);
      }

      .playground-models-table-col-model {
        width: 34%;
      }

      .playground-models-table-col-provider {
        width: 16%;
      }

      .playground-models-table-col-capability,
      .playground-models-table-col-scope {
        width: 14%;
      }

      .playground-models-table-col-speed {
        width: 10%;
      }

      .playground-models-table-col-pricing {
        width: 12%;
      }

      .playground-models-model-cell {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .playground-models-model-copy {
        min-width: 0;
        flex: 1 1 auto;
      }

      .playground-models-pricing-value {
        color: rgba(255, 255, 255, 0.86);
      }

      .playground-models-table.is-image-table .playground-models-table-col-model {
        width: 40%;
      }

      .playground-models-table.is-image-table .playground-models-table-col-provider {
        width: 18%;
      }

      .playground-models-table.is-image-table .playground-models-table-col-scope {
        width: 16%;
      }

      .playground-models-table.is-image-table .playground-models-table-col-speed {
        width: 10%;
      }

      .playground-models-table.is-image-table .playground-models-table-col-pricing {
        width: 16%;
      }

      .playground-models-table tr.is-pricing-subrow .playground-models-model-cell {
        padding-left: 28px;
      }

      .playground-models-table tr.is-pricing-subrow .playground-auth-users-secret-name-title {
        color: rgba(255, 255, 255, 0.78);
        font-weight: 400;
      }

      .playground-models-table th.is-right,
      .playground-models-table td.is-right {
        text-align: right;
      }

      .playground-models-skill-settings-section {
        margin-top: 16px;
        padding: 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 18px;
      }

      .playground-models-skill-settings-copy {
        min-width: 0;
      }

      .playground-models-skill-settings-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.94);
        font-size: 14px;
        font-weight: 500;
        line-height: 1.35;
      }

      .playground-models-skill-settings-description {
        margin: 6px 0 0;
        max-width: 720px;
        color: rgba(255, 255, 255, 0.58);
        font-size: 12px;
        line-height: 1.45;
      }

      .playground-models-skill-settings-button {
        flex: 0 0 auto;
        white-space: nowrap;
      }
`;

export const MODELS_PAGE_SCRIPT = String.raw`
      function normalizePlaygroundManagedModelsTab(tabId) {
        const normalizedTabId = String(tabId || "").trim();
        return normalizedTabId === "image" || normalizedTabId === "video" || normalizedTabId === "deep_research"
          ? normalizedTabId
          : "agent";
      }

      function getPlaygroundManagedModelsTabs() {
        return [
          { id: "agent", label: "Agent Models" },
          { id: "image", label: "Image" },
          { id: "video", label: "Video" },
          { id: "deep_research", label: "Deep Research" },
        ];
      }

      function getPlaygroundManagedVideoModelOptions() {
        return [
          {
            id: "grok-imagine-video",
            label: "Grok Imagine Video",
            provider: "xAI",
            description: "Imaginative video generation and stylized motion clips.",
            maxDuration: "15s",
            resolutions: "480p, 720p",
            inputModalities: "Text, Image, Video",
            pricingLabel: "5.5 CT / s",
            pricingRank: 5.5,
          },
          {
            id: "seedance-2.0-fast",
            baseModelId: "seedance-2.0-fast",
            label: "Seedance 2.0 Fast",
            provider: "ByteDance",
            description: "Fast video generation with reference media support.",
            maxDuration: "12s",
            resolutions: "480p, 720p",
            inputModalities: "Text, Image, Video",
            pricingLabel: "8.8 CT / s",
            pricingRank: 8.8,
          },
          {
            id: "seedance-2.0",
            baseModelId: "seedance-2.0",
            label: "Seedance 2.0",
            provider: "ByteDance",
            description: "Higher-quality video generation with 1080p output support.",
            maxDuration: "12s",
            resolutions: "480p, 720p, 1080p",
            inputModalities: "Text, Image, Video",
            pricingLabel: "",
            hidePricingLabel: true,
            pricingRank: 24.2,
          },
          {
            id: "seedance-2.0:standard",
            baseModelId: "seedance-2.0",
            label: "Default / 720p",
            provider: "ByteDance",
            description: "Pricing tier for Seedance 2.0",
            maxDuration: "12s",
            resolutions: "480p, 720p",
            inputModalities: "Text, Image, Video",
            pricingLabel: "24.2 CT / s",
            pricingRank: 24.2,
            subrowRank: 0,
            isPricingSubrow: true,
          },
          {
            id: "seedance-2.0:1080p",
            baseModelId: "seedance-2.0",
            label: "1080p",
            provider: "ByteDance",
            description: "Pricing tier for Seedance 2.0",
            maxDuration: "12s",
            resolutions: "1080p",
            inputModalities: "Text, Image, Video",
            pricingLabel: "60.5 CT / s",
            pricingRank: 60.5,
            subrowRank: 1,
            isPricingSubrow: true,
          },
        ];
      }

      function getPlaygroundManagedDeepResearchModelOptions() {
        return PLAYGROUND_AGENT_DEEP_RESEARCH_MODEL_OPTIONS.map((model) => {
          const normalizedId = String(model?.id || "").trim();
          const isPro = normalizedId.includes("pro");
          return {
            id: normalizedId,
            label: model?.label || normalizedId,
            provider: "Google",
            description: model?.description || "",
            mode: isPro ? "Higher-depth research" : "Fast research",
            contextWindow: "Web, files, sources",
            speed: isPro ? "Fast" : "Very Fast",
            pricingLabel: isPro ? "Higher CT / research run" : "Lower CT / research run",
            pricingRank: isPro ? 2 : 1,
          };
        });
      }

      function formatPlaygroundManagedImagePricing(modelId) {
        const low = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "low");
        const medium = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "medium");
        const high = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "high");
        if (low === medium && medium === high) {
          return String(medium) + " CT / image";
        }
        return "Low " + low + " CT · Medium " + medium + " CT · High " + high + " CT / image";
      }

      function getPlaygroundManagedImageModelOptions() {
        return PLAYGROUND_SKILL_IMAGE_MODEL_OPTIONS.flatMap((model) => {
          const modelId = String(model?.id || "").trim();
          const baseRow = {
            id: modelId,
            baseModelId: modelId,
            label: model?.label || modelId || "",
            provider: model?.provider || "Managed",
            description: model?.description || "",
            mode: String(modelId || "").includes("image-preview") ? "Image generation and editing" : "Image generation and inpainting",
            contextWindow: "Auto",
            speed: String(modelId || "").includes("gemini") ? "Very Fast" : "Fast",
            pricingLabel: formatPlaygroundManagedImagePricing(modelId),
            pricingRank: getPlaygroundImageGenerationComputeTokensPerImage(modelId, "medium"),
          };
          if (modelId !== "gpt-image-2") {
            return [baseRow];
          }
          baseRow.pricingLabel = "";
          baseRow.hidePricingLabel = true;
          const qualityRows = PLAYGROUND_SKILL_IMAGE_QUALITY_OPTIONS.map((quality) => {
            const qualityId = String(quality?.id || "medium").trim() || "medium";
            const qualityLabel = quality?.label || qualityId;
            const computeTokens = getPlaygroundImageGenerationComputeTokensPerImage(modelId, qualityId);
            return {
              ...baseRow,
              id: modelId + ":" + qualityId,
              label: String(qualityLabel || qualityId).trim() || qualityId,
              description: "Quality tier for GPT Image 2",
              contextWindow: String(qualityLabel || "").trim() + " quality",
              pricingLabel: String(computeTokens) + " CT / image",
              hidePricingLabel: false,
              pricingRank: computeTokens,
              subrowRank: qualityId === "low" ? 0 : qualityId === "medium" ? 1 : qualityId === "high" ? 2 : 99,
              qualityId,
              qualityLabel,
              isPricingSubrow: true,
            };
          });
          return [baseRow, ...qualityRows];
        });
      }

      function getPlaygroundManagedModelsForTab(tabId, agentModelOptions) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "image") {
          return getPlaygroundManagedImageModelOptions();
        }
        if (normalizedTabId === "video") {
          return getPlaygroundManagedVideoModelOptions();
        }
        if (normalizedTabId === "deep_research") {
          return getPlaygroundManagedDeepResearchModelOptions();
        }
        return (Array.isArray(agentModelOptions) && agentModelOptions.length > 0 ? agentModelOptions : PLAYGROUND_AGENT_MODEL_OPTIONS)
          .filter((model) => model?.id && model?.label);
      }

      function getPlaygroundManagedModelProviderLabel(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          const providerKey = getPlaygroundAgentModelProviderFilterKey(model);
          return providerKey === "custom" ? "Custom" : getPlaygroundAgentModelProviderLabel(model);
        }
        return String(model?.provider || "Managed").trim() || "Managed";
      }

      function getPlaygroundManagedModelProviderFilterKey(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          return getPlaygroundAgentModelProviderFilterKey(model);
        }
        const normalized = getPlaygroundManagedModelProviderLabel(tabId, model)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        return normalized || "managed";
      }

      function getPlaygroundManagedModelsProviderFilterOptions(tabId, rows) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const options = [{ id: "all", label: "All models" }];
        const seen = new Set();
        rows.forEach((model) => {
          const id = getPlaygroundManagedModelProviderFilterKey(normalizedTabId, model);
          if (!id || seen.has(id)) return;
          seen.add(id);
          options.push({ id, label: getPlaygroundManagedModelProviderLabel(normalizedTabId, model) });
        });
        options.sort((left, right) => {
          if (left.id === "all") return -1;
          if (right.id === "all") return 1;
          return left.label.localeCompare(right.label);
        });
        if (normalizedTabId === "agent") {
          options.push({ id: "available", label: "Available" });
          options.push({ id: "locked", label: "Plan required" });
        }
        return options;
      }

      function getPlaygroundManagedModelsSortOptions(tabId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "agent") {
          return [
            { id: "provider", label: "Provider" },
            { id: "name", label: "Name (A-Z)" },
            { id: "intelligence", label: "Highest intelligence" },
            { id: "cost", label: "Lowest CT cost" },
            { id: "context", label: "Largest context" },
            { id: "speed", label: "Fastest" },
          ];
        }
        return [
          { id: "provider", label: "Provider" },
          { id: "name", label: "Name (A-Z)" },
          { id: "cost", label: "Lowest CT cost" },
          { id: "speed", label: "Fastest" },
        ];
      }

      function readPlaygroundManagedModelContextValue(model) {
        const raw = String(model?.contextWindow || "").trim().toLowerCase();
        const match = raw.match(/([0-9]+(?:\.[0-9]+)?)/);
        if (!match) return 0;
        const value = Number(match[1]);
        if (!Number.isFinite(value)) return 0;
        if (raw.includes("m")) return value * 1000000;
        if (raw.includes("k")) return value * 1000;
        return value;
      }

      function readPlaygroundManagedModelSpeedRank(model) {
        const normalized = String(model?.speed || "").trim().toLowerCase();
        if (normalized.includes("very")) return 4;
        if (normalized.includes("fast")) return 3;
        if (normalized.includes("medium")) return 2;
        if (normalized.includes("slow")) return 1;
        return 0;
      }

      function getPlaygroundManagedModelPricingRank(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          return getPlaygroundAgentModelWeightedCost(model?.id) || Number.POSITIVE_INFINITY;
        }
        const rank = Number(model?.pricingRank);
        return Number.isFinite(rank) ? rank : Number.POSITIVE_INFINITY;
      }

      function getPlaygroundManagedModelPricingLabel(tabId, model) {
        if (model?.hidePricingLabel) {
          return "";
        }
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          return formatPlaygroundAgentModelComputeTokenCost(model?.id);
        }
        return String(model?.pricingLabel || "Usage-based CT").trim() || "Usage-based CT";
      }

      function getPlaygroundManagedModelsSkillSettingsMeta(tabId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "image") {
          return {
            skillId: "image_generation",
            title: "Choose default image models in skill settings",
            description: "Agents use the selected Image Generation defaults unless the thread prompt asks for another image model or quality.",
            buttonLabel: "Image Settings",
          };
        }
        if (normalizedTabId === "video") {
          return {
            skillId: "video_generation",
            title: "Choose default video models in skill settings",
            description: "Agents use the selected Video Generation model by default while still honoring explicit model requests in prompts.",
            buttonLabel: "Video Settings",
          };
        }
        if (normalizedTabId === "deep_research") {
          return {
            skillId: "deep_research",
            title: "Choose default research models in skill settings",
            description: "Agents use the selected Deep Research model by default unless the user asks for a different research model.",
            buttonLabel: "Research Settings",
          };
        }
        return null;
      }

      function renderPlaygroundManagedModelProviderIcon(tabId, model) {
        if (normalizePlaygroundManagedModelsTab(tabId) === "agent") {
          const providerIcon = getPlaygroundAgentModelProviderIcon(model);
          return providerIcon
            ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement("img", {
                  src: providerIcon.src,
                  alt: "",
                  draggable: "false",
                  className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                })
              )
            : React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement(Bot, { width: 16, height: 16, strokeWidth: 1.8 })
              );
        }
        if (normalizePlaygroundManagedModelsTab(tabId) === "image") {
          const normalizedProvider = String(model?.provider || "").trim().toLowerCase();
          const providerIcon = normalizedProvider.includes("google")
            ? { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" }
            : normalizedProvider.includes("openai")
              ? { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" }
              : getPlaygroundAgentModelProviderIcon({
                  id: model?.baseModelId || model?.id,
                  providerType: model?.provider || "",
                  source: "managed",
                  contextWindow: "Images",
                });
          return providerIcon
            ? React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement("img", {
                  src: providerIcon.src,
                  alt: "",
                  draggable: "false",
                  className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
                })
              )
            : React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
                React.createElement(ImageIcon, { width: 16, height: 16, strokeWidth: 1.8 })
              );
        }
        const Icon = tabId === "image" ? ImageIcon : tabId === "video" ? Film : Telescope;
        if (normalizePlaygroundManagedModelsTab(tabId) === "video") {
          const normalizedProvider = String(model?.provider || "").trim().toLowerCase();
          const providerIcon = normalizedProvider.includes("bytedance")
            ? { src: "/img/05-model-provider-icons/bytedance.svg", alt: "ByteDance", className: "" }
            : normalizedProvider.includes("xai") || normalizedProvider.includes("x.ai")
              ? { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI", className: "" }
              : null;
          if (providerIcon) {
            return React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
              React.createElement("img", {
                src: providerIcon.src,
                alt: "",
                draggable: "false",
                className: "playground-agents-model-provider-icon" + (providerIcon.className ? " " + providerIcon.className : ""),
              })
            );
          }
        }
        if (normalizePlaygroundManagedModelsTab(tabId) === "deep_research") {
          return React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
            React.createElement("img", {
              src: "/img/05-model-provider-icons/gemini.png",
              alt: "",
              draggable: "false",
              className: "playground-agents-model-provider-icon",
            })
          );
        }
        return React.createElement("span", { className: "playground-agents-model-provider-icon-shell playground-agents-overview-table-model-icon", "aria-hidden": "true" },
          React.createElement(Icon, { width: 16, height: 16, strokeWidth: 1.8 })
        );
      }

      function renderPlaygroundManagedModelIntelligence(model) {
        const intelligenceLabel = String(model?.intelligence || model?.intelligenceLabel || "Custom").trim() || "Custom";
        const intelligenceLevel = Math.max(1, Math.min(4, getPlaygroundAgentIntelligenceLevel(intelligenceLabel)));
        return React.createElement("span", {
            className: "playground-agents-model-brains",
            title: intelligenceLabel,
            "aria-label": intelligenceLabel + " intelligence, level " + intelligenceLevel + " of 4",
          },
          Array.from({ length: 4 }).map((_, index) =>
            React.createElement(Brain, {
              key: String(model?.id || "model") + "-brain-" + index,
              className: "playground-agents-model-brain" + (index < intelligenceLevel ? " is-active" : ""),
              width: 12,
              height: 12,
              strokeWidth: 1.9,
            })
          )
        );
      }

      function sortPlaygroundManagedModels(tabId, rows, sortId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const normalizedSortId = String(sortId || "provider").trim() || "provider";
        const compareRows = (left, right) => {
          if (normalizedSortId === "name") {
            return String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || ""));
          }
          if (normalizedTabId === "agent" && normalizedSortId === "intelligence") {
            const leftLevel = getPlaygroundAgentIntelligenceLevel(left?.intelligence || left?.intelligenceLabel || "");
            const rightLevel = getPlaygroundAgentIntelligenceLevel(right?.intelligence || right?.intelligenceLabel || "");
            if (leftLevel !== rightLevel) return rightLevel - leftLevel;
          } else if (normalizedSortId === "cost") {
            const leftCost = getPlaygroundManagedModelPricingRank(normalizedTabId, left);
            const rightCost = getPlaygroundManagedModelPricingRank(normalizedTabId, right);
            if (leftCost !== rightCost) return leftCost - rightCost;
          } else if (normalizedTabId === "agent" && normalizedSortId === "context") {
            const leftContext = readPlaygroundManagedModelContextValue(left);
            const rightContext = readPlaygroundManagedModelContextValue(right);
            if (leftContext !== rightContext) return rightContext - leftContext;
          } else if (normalizedSortId === "speed") {
            const leftSpeed = readPlaygroundManagedModelSpeedRank(left);
            const rightSpeed = readPlaygroundManagedModelSpeedRank(right);
            if (leftSpeed !== rightSpeed) return rightSpeed - leftSpeed;
          }
          const leftProvider = getPlaygroundManagedModelProviderLabel(normalizedTabId, left);
          const rightProvider = getPlaygroundManagedModelProviderLabel(normalizedTabId, right);
          if (leftProvider !== rightProvider) return leftProvider.localeCompare(rightProvider);
          return String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || ""));
        };
        if (normalizedTabId !== "image" && normalizedTabId !== "video") {
          return rows.slice().sort(compareRows);
        }
        const parentRows = [];
        const orphanSubrows = [];
        const subrowsByParentId = new Map();
        rows.forEach((row) => {
          if (!row?.isPricingSubrow) {
            parentRows.push(row);
            return;
          }
          const parentId = String(row?.baseModelId || "").trim();
          if (!parentId) {
            orphanSubrows.push(row);
            return;
          }
          const current = subrowsByParentId.get(parentId) || [];
          current.push(row);
          subrowsByParentId.set(parentId, current);
        });
        const sortSubrows = (items) => items.slice().sort((left, right) => {
          const leftRank = Number.isFinite(Number(left?.subrowRank)) ? Number(left.subrowRank) : 99;
          const rightRank = Number.isFinite(Number(right?.subrowRank)) ? Number(right.subrowRank) : 99;
          if (leftRank !== rightRank) return leftRank - rightRank;
          return String(left?.label || "").localeCompare(String(right?.label || ""));
        });
        const orderedRows = [];
        parentRows.slice().sort(compareRows).forEach((row) => {
          orderedRows.push(row);
          const subrows = subrowsByParentId.get(row.id);
          if (Array.isArray(subrows) && subrows.length > 0) {
            orderedRows.push(...sortSubrows(subrows));
            subrowsByParentId.delete(row.id);
          }
        });
        subrowsByParentId.forEach((subrows) => {
          orphanSubrows.push(...subrows);
        });
        return orderedRows.concat(sortSubrows(orphanSubrows));
      }

      async function loadPlaygroundManagedAgentModelCatalog(backendUrl, requestHeaders, setAgentModelOptions) {
        try {
          const response = await fetch(backendUrl + "/agents/models", {
            method: "GET",
            headers: requestHeaders,
          });
          const data = await response.json().catch(() => ({}));
          if (!response.ok || !Array.isArray(data?.models) || data.models.length === 0) {
            setAgentModelOptions(PLAYGROUND_AGENT_MODEL_OPTIONS);
            return;
          }
          const remoteOptions = data.models
            .map((entry) => ({
              id: String(entry?.id || "").trim(),
              label: String(entry?.label || entry?.id || "").trim(),
              description: String(entry?.description || "").trim(),
              intelligence: String(entry?.intelligence || "").trim() || "Custom",
              contextWindow: String(entry?.contextWindow || "").trim() || "Custom",
              speed: String(entry?.speed || "").trim() || "Custom",
              source: String(entry?.source || "managed").trim(),
              providerType: String(entry?.providerType || "").trim(),
              locked: Boolean(entry?.locked),
            }))
            .filter((entry) => entry.id && entry.label);
          const mergedOptionsById = new Map();
          PLAYGROUND_AGENT_MODEL_OPTIONS.forEach((entry) => {
            if (!entry?.id) return;
            mergedOptionsById.set(entry.id, { ...entry });
          });
          remoteOptions.forEach((entry) => {
            if (!entry?.id) return;
            const existing = mergedOptionsById.get(entry.id) || {};
            mergedOptionsById.set(entry.id, {
              ...existing,
              ...entry,
            });
          });
          const nextOptions = Array.from(mergedOptionsById.values()).filter((entry) => entry?.id && entry?.label);
          setAgentModelOptions(nextOptions.length > 0 ? nextOptions : PLAYGROUND_AGENT_MODEL_OPTIONS);
        } catch {
          setAgentModelOptions(PLAYGROUND_AGENT_MODEL_OPTIONS);
        }
      }

      function renderPlaygroundManagedModelsTable(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        const sourceRows = getPlaygroundManagedModelsForTab(activeTab, props.agentModelOptions);
        const normalizedSearchQuery = String(props.searchQuery || "").trim().toLowerCase();
        const providerFilter = String(props.providerFilter || "all").trim() || "all";
        const providerFilterOptions = getPlaygroundManagedModelsProviderFilterOptions(activeTab, sourceRows);
        const sortOptions = getPlaygroundManagedModelsSortOptions(activeTab);
        const filteredRows = sourceRows
          .filter((model) => model?.id && model?.label)
          .filter((model) => {
            const providerKey = getPlaygroundManagedModelProviderFilterKey(activeTab, model);
            if (activeTab === "agent" && providerFilter === "available" && model.locked) return false;
            if (activeTab === "agent" && providerFilter === "locked" && !model.locked) return false;
            if (providerFilter !== "all" && providerFilter !== "available" && providerFilter !== "locked" && providerKey !== providerFilter) {
              return false;
            }
            if (!normalizedSearchQuery) return true;
            const haystack = [
              model.id,
              model.label,
              model.description,
              model.intelligence,
              model.intelligenceLabel,
              model.contextWindow,
              model.qualityId,
              model.qualityLabel,
              model.speed,
              model.mode,
              model.maxDuration,
              model.resolutions,
              model.inputModalities,
              model.source,
              model.providerType,
              getPlaygroundManagedModelProviderLabel(activeTab, model),
              getPlaygroundManagedModelPricingLabel(activeTab, model),
            ].join(" ").toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        const visibleRows = sortPlaygroundManagedModels(activeTab, filteredRows, props.sort);
        const isVideoTab = activeTab === "video";
        const showModeColumn = activeTab !== "image" && !isVideoTab;

        const skillSettingsMeta = getPlaygroundManagedModelsSkillSettingsMeta(activeTab);
        const tableSection = React.createElement("section", { className: "playground-tasks-detail-facts playground-environments-editor-facts playground-server-details-card playground-auth-users-surface playground-models-section" },
          React.createElement("div", { className: "playground-tasks-detail-facts-body" },
            React.createElement("div", { className: "playground-auth-users-toolbar", ref: props.toolbarRef },
              React.createElement("label", { className: "playground-auth-users-search" },
                React.createElement(Search, { className: "playground-auth-users-search-icon", width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("input", {
                  type: "search",
                  value: props.searchQuery,
                  onChange: (event) => props.setSearchQuery(event.target.value),
                  className: "playground-auth-users-search-input",
                  placeholder: "Search models",
                })
              ),
              React.createElement("div", { className: "playground-auth-users-toolbar-actions" },
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-sort" + (props.toolbarPopover === "sort" || props.sort !== "provider" ? " is-active" : ""),
                    onClick: () => props.setToolbarPopover((current) => current === "sort" ? "" : "sort"),
                  },
                    React.createElement(ArrowUpDown, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Sort")
                  ),
                  props.toolbarPopover === "sort"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        sortOptions.map((option) =>
                          React.createElement("button", {
                              key: option.id,
                              type: "button",
                              className: "tb-popup-row tb-popup-row-select" + (props.sort === option.id ? " selected" : ""),
                              onClick: () => {
                                props.setSort(option.id);
                                props.setToolbarPopover("");
                              },
                            },
                            React.createElement("span", { className: "tb-popup-check-slot" },
                              props.sort === option.id
                                ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                : null
                            ),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, option.label)
                            )
                          )
                        )
                      )
                    : null
                ),
                React.createElement("div", { className: "playground-files-toolbar-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                  React.createElement("button", {
                    type: "button",
                    className: "playground-files-control-button is-bare is-backlog-filter" + (props.toolbarPopover === "filter" || providerFilter !== "all" ? " is-active" : ""),
                    onClick: () => props.setToolbarPopover((current) => current === "filter" ? "" : "filter"),
                  },
                    React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                    React.createElement("span", null, "Filter")
                  ),
                  props.toolbarPopover === "filter"
                    ? React.createElement("div", { className: "tb-popup-menu playground-tasks-toolbar-popup-menu playground-tasks-toolbar-popup-menu-wide playground-tasks-toolbar-popup-menu-animate-down-in" },
                        providerFilterOptions.map((option) =>
                          React.createElement("button", {
                              key: option.id,
                              type: "button",
                              className: "tb-popup-row tb-popup-row-select" + (providerFilter === option.id ? " selected" : ""),
                              onClick: () => {
                                props.setProviderFilter(option.id);
                                props.setToolbarPopover("");
                              },
                            },
                            React.createElement("span", { className: "tb-popup-check-slot" },
                              providerFilter === option.id
                                ? React.createElement(Check, { className: "tb-popup-check", width: 14, height: 14, strokeWidth: 1.8 })
                                : null
                            ),
                            React.createElement("div", { className: "playground-tasks-toolbar-popup-item-copy" },
                              React.createElement("span", null, option.label)
                            )
                          )
                        )
                      )
                    : null
                )
              )
            ),
            visibleRows.length === 0
              ? React.createElement("div", { className: "playground-files-state" },
                  normalizedSearchQuery || providerFilter !== "all" ? "No matching models found." : "No models available."
                )
              : React.createElement("div", { className: "playground-auth-users-table-shell playground-models-table-shell" },
                  React.createElement("table", { className: "playground-auth-users-table playground-models-table" + (activeTab === "image" ? " is-image-table" : "") },
                    React.createElement("colgroup", null,
                      React.createElement("col", { className: "playground-models-table-col-model" }),
                      React.createElement("col", { className: "playground-models-table-col-provider" }),
                      isVideoTab
                        ? React.createElement("col", { className: "playground-models-table-col-capability" })
                        : showModeColumn ? React.createElement("col", { className: "playground-models-table-col-capability" }) : null,
                      React.createElement("col", { className: "playground-models-table-col-scope" }),
                      React.createElement("col", { className: "playground-models-table-col-speed" }),
                      React.createElement("col", { className: "playground-models-table-col-pricing" })
                    ),
                    React.createElement("thead", null,
                      React.createElement("tr", null,
                        React.createElement("th", null, "Model"),
                        React.createElement("th", null, "Provider"),
                        isVideoTab
                          ? React.createElement("th", null, "Max Duration")
                          : showModeColumn ? React.createElement("th", null, activeTab === "agent" ? "Intelligence" : "Mode") : null,
                        React.createElement("th", null, activeTab === "agent" ? "Context" : activeTab === "image" ? "Quality" : activeTab === "video" ? "Resolutions" : "Scope"),
                        React.createElement("th", null, activeTab === "video" ? "Input Modalities" : "Speed"),
                        React.createElement("th", { className: "is-right" }, activeTab === "agent" ? "Cost / mTok" : "CT pricing")
                      )
                    ),
                    React.createElement("tbody", null,
                      visibleRows.map((model) => {
                        const providerLabel = getPlaygroundManagedModelProviderLabel(activeTab, model);
                        return React.createElement("tr", {
                            key: activeTab + ":" + model.id,
                            className: model.isPricingSubrow ? "is-pricing-subrow" : "",
                          },
                          React.createElement("td", { className: "playground-auth-users-cell is-identifier is-secret-name" },
                            React.createElement("div", { className: "playground-models-model-cell" },
                              model.isPricingSubrow ? null : renderPlaygroundManagedModelProviderIcon(activeTab, model),
                              React.createElement("div", { className: "playground-models-model-copy" },
                                React.createElement("div", {
                                  className: "playground-auth-users-secret-name-title",
                                  title: model.label || model.id,
                                }, model.label || model.id),
                                model.isPricingSubrow
                                  ? null
                                  : React.createElement("div", {
                                      className: "playground-auth-users-secret-description",
                                      title: model.description || model.id,
                                    }, model.description || model.id)
                              )
                            )
                          ),
                          React.createElement("td", { className: "playground-auth-users-cell" }, providerLabel),
                          showModeColumn ? React.createElement("td", { className: "playground-auth-users-cell" },
                            activeTab === "agent" ? renderPlaygroundManagedModelIntelligence(model) : (model.mode || "Managed")
                          ) : null,
                          isVideoTab ? React.createElement("td", { className: "playground-auth-users-cell" }, model.maxDuration || "Custom") : null,
                          React.createElement("td", { className: "playground-auth-users-cell" }, isVideoTab ? model.resolutions || "Custom" : model.contextWindow || "Custom"),
                          React.createElement("td", { className: "playground-auth-users-cell" }, isVideoTab ? model.inputModalities || "Custom" : model.speed || "Custom"),
                          React.createElement("td", { className: "playground-auth-users-cell is-right playground-models-pricing-value" }, getPlaygroundManagedModelPricingLabel(activeTab, model))
                        );
                      })
                    )
                  )
                )
          )
        );
        const skillSettingsSection = skillSettingsMeta
          ? React.createElement("section", { className: "playground-models-skill-settings-section" },
              React.createElement("div", { className: "playground-models-skill-settings-copy" },
                React.createElement("h3", { className: "playground-models-skill-settings-title" }, skillSettingsMeta.title),
                React.createElement("p", { className: "playground-models-skill-settings-description" }, skillSettingsMeta.description)
              ),
              React.createElement("button", {
                type: "button",
                className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button playground-models-skill-settings-button",
                onClick: () => {
                  if (typeof props.onOpenSkillSettings === "function") {
                    props.onOpenSkillSettings(skillSettingsMeta.skillId);
                  }
                },
              },
                React.createElement(SlidersHorizontal, { width: 14, height: 14, strokeWidth: 1.8 }),
                React.createElement("span", null, skillSettingsMeta.buttonLabel)
              )
            )
          : null;
        return React.createElement(React.Fragment, null, tableSection, skillSettingsSection);
      }

      function renderPlaygroundModelsPage(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        return React.createElement("div", { className: "playground-develop-home playground-models-page" },
          React.createElement("div", { className: "playground-develop-home-inner playground-models-page-inner" },
            React.createElement("div", { className: "playground-develop-header" },
              React.createElement("h1", { className: "playground-develop-title" }, "Models"),
              React.createElement("div", { className: "playground-develop-header-actions" },
                React.createElement("button", {
                  type: "button",
                  className: "playground-files-control-button playground-project-overview-summary-mission-button playground-project-overview-summary-strategy-button playground-develop-link-button",
                  onClick: () => window.open(props.pricingUrl || "/pricing", "_blank", "noopener,noreferrer"),
                }, "Pricing", React.createElement(ArrowUpRight, { width: 14, height: 14, strokeWidth: 1.8 }))
              )
            ),
            React.createElement("div", { className: "playground-develop-tabs", role: "tablist", "aria-label": "Model categories" },
              getPlaygroundManagedModelsTabs().map((tab) =>
                React.createElement("button", {
                  key: tab.id,
                  type: "button",
                  role: "tab",
                  className: "playground-develop-tab" + (activeTab === tab.id ? " is-active" : ""),
                  "aria-selected": activeTab === tab.id ? "true" : "false",
                  onClick: () => {
                    props.setActiveTab(tab.id);
                    props.setToolbarPopover("");
                    props.setProviderFilter("all");
                    props.setSort("provider");
                  },
                }, tab.label)
              )
            ),
            renderPlaygroundManagedModelsTable({
              activeTab,
              agentModelOptions: props.agentModelOptions,
              searchQuery: props.searchQuery,
              setSearchQuery: props.setSearchQuery,
              providerFilter: props.providerFilter,
              setProviderFilter: props.setProviderFilter,
              sort: props.sort,
              setSort: props.setSort,
              toolbarPopover: props.toolbarPopover,
              setToolbarPopover: props.setToolbarPopover,
              toolbarRef: props.toolbarRef,
              onOpenSkillSettings: props.onOpenSkillSettings,
            })
          )
        );
      }
`;
