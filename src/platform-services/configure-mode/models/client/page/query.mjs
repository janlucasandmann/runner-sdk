export const MODELS_PAGE_QUERY_SCRIPT = String.raw`      function getPlaygroundManagedModelsForTab(tabId, agentModelOptions) {
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
          .filter((model) => model?.id && model?.label)
          .map((model) => {
            const modelId = String(model?.id || "").trim();
            const intelligence = PLAYGROUND_MANAGED_AGENT_MODEL_INTELLIGENCE_BY_ID[modelId];
            return intelligence ? { ...model, intelligence, intelligenceLabel: intelligence } : model;
          });
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
            { id: "provider", label: "Provider", direction: "asc" },
            { id: "name", label: "Name (A-Z)", direction: "asc" },
            { id: "intelligence", label: "Highest intelligence", direction: "desc" },
            { id: "cost-input", label: "Lowest input cost", direction: "asc" },
            { id: "context", label: "Largest context", direction: "desc" },
            { id: "speed", label: "Highest TPS", direction: "desc" },
          ];
        }
        return [
          { id: "provider", label: "Provider", direction: "asc" },
          { id: "name", label: "Name (A-Z)", direction: "asc" },
          { id: "cost", label: "Lowest cost", direction: "asc" },
          { id: "speed", label: "Fastest", direction: "desc" },
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

      function hasPlaygroundManagedAgentModelTps(model) {
        return Object.prototype.hasOwnProperty.call(PLAYGROUND_MANAGED_AGENT_MODEL_TPS_BY_ID, String(model?.id || "").trim());
      }

      function readPlaygroundManagedAgentModelTps(model) {
        const modelId = String(model?.id || "").trim();
        const value = PLAYGROUND_MANAGED_AGENT_MODEL_TPS_BY_ID[modelId];
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
      }

      function formatPlaygroundManagedAgentModelTps(model) {
        const value = readPlaygroundManagedAgentModelTps(model);
        return value === null ? "—" : value.toFixed(1) + " t/s";
      }

      function readPlaygroundManagedModelSpeedRank(model) {
        if (hasPlaygroundManagedAgentModelTps(model)) {
          const tpsValue = readPlaygroundManagedAgentModelTps(model);
          return tpsValue === null ? -1 : tpsValue;
        }
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

      function readPlaygroundManagedAgentPricingNumber(value) {
        const numericValue = Number(value);
        return Number.isFinite(numericValue) ? numericValue : null;
      }

      function getPlaygroundManagedAgentModelPricing(model) {
        const modelId = String(model?.id || "").trim();
        if (!modelId || typeof PLAYGROUND_AGENT_MODEL_PRICING_BY_ID === "undefined") {
          return null;
        }
        return PLAYGROUND_AGENT_MODEL_PRICING_BY_ID[modelId] || null;
      }

      function formatPlaygroundManagedAgentUsdPerMTok(value) {
        const numericValue = readPlaygroundManagedAgentPricingNumber(value);
        if (numericValue === null) {
          return "—";
        }
        const retailValue = numericValue * 1.1;
        const fractionDigits = retailValue > 0 && retailValue < 0.01
          ? 4
          : retailValue > 0 && retailValue < 1
            ? 3
            : 2;
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: fractionDigits,
          maximumFractionDigits: fractionDigits,
        }).format(retailValue);
      }

      function getPlaygroundManagedAgentPricingCells(model) {
        const pricing = getPlaygroundManagedAgentModelPricing(model);
        return {
          input: formatPlaygroundManagedAgentUsdPerMTok(pricing?.input),
          output: formatPlaygroundManagedAgentUsdPerMTok(pricing?.output),
          cached: formatPlaygroundManagedAgentUsdPerMTok(pricing?.cached),
        };
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

`;
