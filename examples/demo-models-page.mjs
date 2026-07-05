export const MODELS_PAGE_CSS = String.raw`
      .playground-models-page .playground-files-shell {
        grid-template-columns: minmax(0, 1fr) 0 0;
      }

      .playground-models-page .playground-files-browser {
        margin: 0 5px 5px 0;
      }

      .playground-models-page .playground-files-browser-body {
        display: flex;
        flex-direction: column;
      }

      .playground-models-page .playground-files-library-title-row {
        align-items: center;
      }

      .playground-models-page .playground-files-library-actions {
        flex: 1 1 auto;
        justify-content: flex-end;
      }

      .playground-models-page .playground-files-library-search-anchor {
        flex: 1 1 min(360px, 100%);
        max-width: 360px;
      }

      .playground-models-page .playground-files-library-search {
        width: 100%;
      }

      .playground-models-page .playground-files-library-tabs {
        min-width: 0;
        overflow-x: auto;
        scrollbar-width: none;
      }

      .playground-models-page .playground-files-library-tabs::-webkit-scrollbar {
        display: none;
      }

      .playground-models-page .playground-files-library-tab {
        min-width: max-content;
      }

      .playground-models-table-head,
      .playground-models-entry-row {
        display: grid;
        grid-template-columns:
          minmax(220px, 1.7fr)
          minmax(110px, 0.75fr)
          minmax(116px, 0.85fr)
          minmax(116px, 0.8fr)
          minmax(104px, 0.72fr)
          minmax(112px, 0.72fr);
        align-items: center;
        column-gap: 14px;
      }

      .playground-models-table-head {
        margin-top: 14px;
        padding: 0 0 8px;
        color: rgba(255, 255, 255, 0.38);
        font-size: 11px;
        font-weight: 500;
        line-height: 1;
      }

      .playground-models-table-head span {
        min-width: 0;
        white-space: nowrap;
      }

      .playground-models-table-head .is-right {
        text-align: right;
      }

      .playground-models-entry-list {
        margin-top: 0;
        padding-top: 0;
      }

      .playground-models-entry-row.playground-files-entry-row {
        width: 100%;
        min-height: 48px;
        margin-left: 0;
        margin-right: 0;
        padding: 7px 0;
        border-radius: 0;
        cursor: default;
      }

      .playground-models-entry-row.is-pricing-subrow {
        color: rgba(255, 255, 255, 0.72);
      }

      .playground-models-entry-row.is-pricing-subrow .playground-models-entry-main {
        padding-left: 0;
      }

      .playground-models-entry-row.is-pricing-subrow .playground-files-entry-name {
        color: rgba(255, 255, 255, 0.78);
        font-weight: 400;
      }

      .playground-models-entry-main {
        min-width: 0;
      }

      .playground-models-entry-description {
        min-width: 0;
        max-width: 560px;
        color: rgba(255, 255, 255, 0.44);
        font-size: 12px;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-models-entry-value {
        min-width: 0;
        color: rgba(255, 255, 255, 0.62);
        font-size: 12px;
        line-height: 1.35;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .playground-models-entry-value.is-strong {
        color: rgba(255, 255, 255, 0.84);
      }

      .playground-models-entry-value.is-right {
        text-align: right;
      }

      .playground-models-grid.playground-files-grid {
        grid-template-columns: repeat(auto-fill, minmax(218px, 1fr));
        align-items: stretch;
        margin-top: 14px;
      }

      .playground-models-grid-item.playground-files-grid-item {
        align-items: stretch;
        gap: 12px;
        min-height: 198px;
        padding: 14px;
        border-color: rgba(255, 255, 255, 0.05);
        background: rgba(255, 255, 255, 0.05);
        cursor: default;
      }

      .playground-models-grid-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        min-width: 0;
      }

      .playground-models-grid-provider {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: rgba(255, 255, 255, 0.68);
        font-size: 12px;
        line-height: 1.2;
      }

      .playground-models-grid-provider span {
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .playground-models-grid-price {
        flex: 0 0 auto;
        color: rgba(255, 255, 255, 0.82);
        font-size: 11px;
        line-height: 1.2;
        white-space: nowrap;
      }

      .playground-models-grid-item .playground-files-grid-item-name {
        text-align: left;
        font-size: 13px;
      }

      .playground-models-grid-item .playground-files-grid-item-meta {
        text-align: left;
        line-height: 1.4;
      }

      .playground-models-grid-facts {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        gap: 7px;
        margin-top: auto;
      }

      .playground-models-grid-fact {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        min-width: 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 11px;
        line-height: 1.3;
      }

      .playground-models-grid-fact span:first-child {
        flex: 0 0 auto;
      }

      .playground-models-grid-fact span:last-child {
        min-width: 0;
        color: rgba(255, 255, 255, 0.76);
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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

      @media (max-width: 980px) {
        .playground-models-page .playground-files-library-title-row,
        .playground-models-page .playground-files-library-nav-row {
          align-items: stretch;
          flex-direction: column;
          gap: 12px;
        }

        .playground-models-page .playground-files-library-actions,
        .playground-models-page .playground-files-library-controls {
          width: 100%;
          justify-content: flex-start;
        }

        .playground-models-page .playground-files-library-search-anchor {
          max-width: none;
        }

        .playground-models-table-head {
          display: none;
        }

        .playground-models-entry-row.playground-files-entry-row {
          grid-template-columns: minmax(0, 1fr);
          row-gap: 6px;
          align-items: stretch;
        }

        .playground-models-entry-row.is-pricing-subrow .playground-models-entry-main {
          padding-left: 0;
        }

        .playground-models-entry-value,
        .playground-models-entry-value.is-right {
          text-align: left;
        }
      }
`;

export const MODELS_PAGE_SCRIPT = String.raw`
      const PLAYGROUND_MANAGED_MODELS_CT_PER_DOLLAR = 100;

      function formatPlaygroundManagedLegacyCtPrice(value, unitLabel) {
        const numericValue = Math.max(0, Number(value || 0));
        const dollars = Number.isFinite(numericValue) ? numericValue / PLAYGROUND_MANAGED_MODELS_CT_PER_DOLLAR : 0;
        const smallValue = dollars > 0 && dollars < 1;
        const formatted = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: smallValue ? 4 : 2,
          maximumFractionDigits: smallValue ? 4 : 2,
        }).format(dollars);
        return formatted + (unitLabel ? " / " + unitLabel : "");
      }

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
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(5.5, "sec"),
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
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(8.8, "sec"),
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
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(24.2, "sec"),
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
            pricingLabel: formatPlaygroundManagedLegacyCtPrice(60.5, "sec"),
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
            pricingLabel: isPro ? "Higher cost / research run" : "Lower cost / research run",
            pricingRank: isPro ? 2 : 1,
          };
        });
      }

      function formatPlaygroundManagedImagePricing(modelId) {
        const low = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "low");
        const medium = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "medium");
        const high = getPlaygroundImageGenerationComputeTokensPerImage(modelId, "high");
        if (low === medium && medium === high) {
          return formatPlaygroundManagedLegacyCtPrice(medium, "image");
        }
        return "Low " + formatPlaygroundManagedLegacyCtPrice(low, "image")
          + " · Medium " + formatPlaygroundManagedLegacyCtPrice(medium, "image")
          + " · High " + formatPlaygroundManagedLegacyCtPrice(high, "image");
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
              pricingLabel: formatPlaygroundManagedLegacyCtPrice(computeTokens, "image"),
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
            { id: "cost", label: "Lowest cost" },
            { id: "context", label: "Largest context" },
            { id: "speed", label: "Fastest" },
          ];
        }
        return [
          { id: "provider", label: "Provider" },
          { id: "name", label: "Name (A-Z)" },
          { id: "cost", label: "Lowest cost" },
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
        return String(model?.pricingLabel || "Usage-based pricing").trim() || "Usage-based pricing";
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
        const viewMode = props.viewMode === "cards" ? "cards" : "table";
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
        const capabilityLabel = isVideoTab ? "Max Duration" : activeTab === "agent" ? "Intelligence" : "Mode";
        const scopeLabel = activeTab === "agent" ? "Context" : activeTab === "image" ? "Quality" : activeTab === "video" ? "Resolutions" : "Scope";
        const speedLabel = isVideoTab ? "Input Modalities" : "Speed";
        const pricingLabel = activeTab === "agent" ? "Cost / mTok" : "Pricing";

        const skillSettingsMeta = getPlaygroundManagedModelsSkillSettingsMeta(activeTab);
        const getCapabilityValue = (model) => {
          if (isVideoTab) return model.maxDuration || "Custom";
          if (activeTab === "agent") return renderPlaygroundManagedModelIntelligence(model);
          return model.mode || "Managed";
        };
        const getScopeValue = (model) => isVideoTab ? model.resolutions || "Custom" : model.contextWindow || "Custom";
        const getSpeedValue = (model) => isVideoTab ? model.inputModalities || "Custom" : model.speed || "Custom";
        const getPricingValue = (model) => getPlaygroundManagedModelPricingLabel(activeTab, model) || (model?.isPricingSubrow ? "" : "Pricing tiers");

        const renderSortMenu = () => props.toolbarPopover === "sort"
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
          : null;

        const renderFilterMenu = () => props.toolbarPopover === "filter"
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
          : null;

        const renderModelRow = (model) => {
          const providerLabel = getPlaygroundManagedModelProviderLabel(activeTab, model);
          return React.createElement("div", {
              key: activeTab + ":table:" + model.id,
              className: "playground-files-entry-row playground-models-entry-row" + (model.isPricingSubrow ? " is-pricing-subrow" : ""),
            },
            React.createElement("div", { className: "playground-files-entry-main playground-models-entry-main" },
              model.isPricingSubrow ? null : renderPlaygroundManagedModelProviderIcon(activeTab, model),
              React.createElement("div", { className: "playground-files-entry-copy" },
                React.createElement("div", {
                  className: "playground-files-entry-name",
                  title: model.label || model.id,
                }, model.label || model.id),
                model.isPricingSubrow
                  ? null
                  : React.createElement("div", {
                      className: "playground-models-entry-description",
                      title: model.description || model.id,
                    }, model.description || model.id)
              )
            ),
            React.createElement("div", { className: "playground-models-entry-value is-strong", title: providerLabel }, providerLabel),
            React.createElement("div", { className: "playground-models-entry-value" }, getCapabilityValue(model)),
            React.createElement("div", { className: "playground-models-entry-value", title: getScopeValue(model) }, getScopeValue(model)),
            React.createElement("div", { className: "playground-models-entry-value", title: getSpeedValue(model) }, getSpeedValue(model)),
            React.createElement("div", { className: "playground-models-entry-value is-right is-strong", title: getPricingValue(model) }, getPricingValue(model))
          );
        };

        const renderModelCard = (model) => {
          const providerLabel = getPlaygroundManagedModelProviderLabel(activeTab, model);
          const pricingValue = getPricingValue(model);
          return React.createElement("div", {
              key: activeTab + ":card:" + model.id,
              className: "playground-files-grid-item playground-models-grid-item" + (model.isPricingSubrow ? " is-pricing-subrow" : ""),
            },
            React.createElement("div", { className: "playground-models-grid-card-top" },
              React.createElement("div", { className: "playground-models-grid-provider", title: providerLabel },
                model.isPricingSubrow ? null : renderPlaygroundManagedModelProviderIcon(activeTab, model),
                React.createElement("span", null, providerLabel)
              ),
              pricingValue
                ? React.createElement("div", { className: "playground-models-grid-price", title: pricingValue }, pricingValue)
                : null
            ),
            React.createElement("div", {
              className: "playground-files-grid-item-name",
              title: model.label || model.id,
            }, model.label || model.id),
            React.createElement("div", { className: "playground-models-grid-facts" },
              React.createElement("div", { className: "playground-models-grid-fact" },
                React.createElement("span", null, capabilityLabel),
                React.createElement("span", null, getCapabilityValue(model))
              ),
              React.createElement("div", { className: "playground-models-grid-fact" },
                React.createElement("span", null, scopeLabel),
                React.createElement("span", { title: getScopeValue(model) }, getScopeValue(model))
              ),
              React.createElement("div", { className: "playground-models-grid-fact" },
                React.createElement("span", null, speedLabel),
                React.createElement("span", { title: getSpeedValue(model) }, getSpeedValue(model))
              )
            )
          );
        };

        const renderModelsContent = () => {
          if (visibleRows.length === 0) {
            return React.createElement("div", { className: "playground-files-state" },
              normalizedSearchQuery || providerFilter !== "all" ? "No matching models found." : "No models available."
            );
          }
          if (viewMode === "cards") {
            return React.createElement("div", { className: "playground-files-grid playground-models-grid" }, visibleRows.map(renderModelCard));
          }
          return React.createElement(React.Fragment, null,
            React.createElement("div", { className: "playground-models-table-head", role: "row" },
              React.createElement("span", null, "Model"),
              React.createElement("span", null, "Provider"),
              React.createElement("span", null, capabilityLabel),
              React.createElement("span", null, scopeLabel),
              React.createElement("span", null, speedLabel),
              React.createElement("span", { className: "is-right" }, pricingLabel)
            ),
            React.createElement("div", { className: "playground-files-entry-list playground-models-entry-list" }, visibleRows.map(renderModelRow))
          );
        };

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
        return React.createElement("div", { className: "playground-files-shell playground-models-shell" },
          React.createElement("section", { className: "playground-files-browser playground-models-browser" },
            React.createElement("div", { className: "playground-files-browser-header", ref: props.toolbarRef },
              props.toolbarPopover
                ? React.createElement("div", {
                    className: "playground-files-search-backdrop",
                    onClick: () => props.setToolbarPopover(""),
                  })
                : null,
              React.createElement("div", { className: "playground-files-library-header playground-models-library-header" },
                React.createElement("div", { className: "playground-files-library-title-row" },
                  React.createElement("h1", { className: "playground-files-library-title" }, "Models"),
                  React.createElement("div", { className: "playground-files-library-actions" },
                    React.createElement("div", { className: "playground-files-library-search-anchor" },
                      React.createElement("label", { className: "playground-files-library-search" },
                        React.createElement(Search, { className: "playground-files-library-search-icon", strokeWidth: 1.8 }),
                        React.createElement("input", {
                          type: "search",
                          value: props.searchQuery,
                          onChange: (event) => {
                            props.setSearchQuery(event.target.value);
                            if (props.toolbarPopover) {
                              props.setToolbarPopover("");
                            }
                          },
                          className: "playground-files-library-search-input",
                          placeholder: "Search models",
                          "aria-label": "Search models",
                        })
                      )
                    ),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-library-new-button playground-models-pricing-button",
                      onClick: () => window.open(props.pricingUrl || "/pricing", "_blank", "noopener,noreferrer"),
                    }, React.createElement("span", null, "Pricing"))
                  )
                ),
                React.createElement("div", { className: "playground-files-library-nav-row" },
                  React.createElement("div", { className: "playground-files-library-tabs content-mode-switch", role: "tablist", "aria-label": "Model categories" },
                    getPlaygroundManagedModelsTabs().map((tab) =>
                      React.createElement("button", {
                        key: tab.id,
                        type: "button",
                        role: "tab",
                        className: "playground-files-library-tab" + (activeTab === tab.id ? " is-active" : ""),
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
                  React.createElement("div", { className: "playground-files-library-controls" },
                    React.createElement("div", { className: "playground-files-library-control-anchor playground-tasks-toolbar-popup-shell playground-plugins-sort-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-library-icon-button" + (props.toolbarPopover === "sort" || props.sort !== "provider" ? " is-active" : ""),
                        onClick: () => props.setToolbarPopover((current) => current === "sort" ? "" : "sort"),
                        title: "Sort models",
                        "aria-label": "Sort models",
                        "aria-expanded": props.toolbarPopover === "sort" ? "true" : "false",
                      }, React.createElement(ArrowUpDown, { width: 19, height: 19, strokeWidth: 1.8 })),
                      renderSortMenu()
                    ),
                    React.createElement("div", { className: "playground-files-library-control-anchor playground-tasks-toolbar-popup-shell playground-plugins-filter-shell" },
                      React.createElement("button", {
                        type: "button",
                        className: "playground-files-library-icon-button" + (props.toolbarPopover === "filter" || providerFilter !== "all" ? " is-active" : ""),
                        onClick: () => props.setToolbarPopover((current) => current === "filter" ? "" : "filter"),
                        title: "Filter models",
                        "aria-label": "Filter models",
                        "aria-expanded": props.toolbarPopover === "filter" ? "true" : "false",
                      }, React.createElement(SlidersHorizontal, { width: 19, height: 19, strokeWidth: 1.8 })),
                      renderFilterMenu()
                    ),
                    React.createElement("span", { className: "playground-files-library-divider", "aria-hidden": "true" }),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-library-icon-button" + (viewMode === "cards" ? " is-active" : ""),
                      onClick: () => {
                        if (typeof props.setViewMode === "function") props.setViewMode("cards");
                        props.setToolbarPopover("");
                      },
                      title: "Card view",
                      "aria-label": "Card view",
                    }, React.createElement(Grid3x3, { width: 20, height: 20, strokeWidth: 1.8 })),
                    React.createElement("button", {
                      type: "button",
                      className: "playground-files-library-icon-button" + (viewMode === "table" ? " is-active" : ""),
                      onClick: () => {
                        if (typeof props.setViewMode === "function") props.setViewMode("table");
                        props.setToolbarPopover("");
                      },
                      title: "Table view",
                      "aria-label": "Table view",
                    }, React.createElement(List, { width: 21, height: 21, strokeWidth: 1.8 }))
                  )
                )
              )
            ),
            React.createElement("div", { className: "playground-files-browser-body playground-models-browser-body" },
              renderModelsContent(),
              skillSettingsSection
            )
          )
        );
      }

      function renderPlaygroundModelsPage(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        return React.createElement("div", { className: "playground-files-page playground-models-page" },
          renderPlaygroundManagedModelsTable({
            activeTab,
            setActiveTab: props.setActiveTab,
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
            viewMode: props.viewMode,
            setViewMode: props.setViewMode,
            pricingUrl: props.pricingUrl,
            onOpenSkillSettings: props.onOpenSkillSettings,
          })
        );
      }
`;
