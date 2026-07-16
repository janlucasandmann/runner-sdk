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

      function getPlaygroundManagedModelProviderIconMeta(tabId, model) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "agent") {
          return getPlaygroundAgentModelProviderIcon(model);
        }
        if (normalizedTabId === "deep_research") {
          return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" };
        }

        const normalizedProvider = String(model?.provider || "").trim().toLowerCase();
        if (normalizedTabId === "image") {
          if (normalizedProvider.includes("google")) {
            return { src: "/img/05-model-provider-icons/gemini.png", alt: "Google", className: "" };
          }
          if (normalizedProvider.includes("openai")) {
            return { src: "/img/05-model-provider-icons/openai.svg", alt: "OpenAI", className: "is-openai" };
          }
        }
        if (normalizedTabId === "video") {
          if (normalizedProvider.includes("bytedance")) {
            return { src: "/img/05-model-provider-icons/bytedance.svg", alt: "ByteDance", className: "" };
          }
          if (normalizedProvider.includes("xai") || normalizedProvider.includes("x.ai")) {
            return { src: "/img/05-model-provider-icons/xai.svg", alt: "xAI", className: "is-openai" };
          }
        }

        return getPlaygroundAgentModelProviderIcon({
          id: model?.baseModelId || model?.id,
          providerType: model?.provider || "",
          source: "managed",
          contextWindow: normalizedTabId === "image" ? "Images" : normalizedTabId === "video" ? "Video" : "Research",
        });
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

      function getPlaygroundManagedModelCategoryLabel(tabId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "image") return "Image model";
        if (normalizedTabId === "video") return "Video model";
        if (normalizedTabId === "deep_research") return "Research model";
        return "Agent model";
      }

      function getPlaygroundManagedModelIntegrationLabel(tabId) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        if (normalizedTabId === "image") return "Image Generation skill";
        if (normalizedTabId === "video") return "Video Generation skill";
        if (normalizedTabId === "deep_research") return "Deep Research skill";
        return "Primary agent model";
      }

      function readPlaygroundManagedModelAvailability(model) {
        const modelId = String(model?.baseModelId || model?.id || "").trim();
        const catalogAvailability = PLAYGROUND_MANAGED_MODEL_AVAILABILITY_BY_ID[modelId] || {};
        const suppliedAvailability = model?.availability
          && typeof model.availability === "object"
          && !Array.isArray(model.availability)
          ? model.availability
          : {};
        return {
          ...catalogAvailability,
          ...suppliedAvailability,
        };
      }

      function createPlaygroundManagedModelDetailFact(label, value, description = "") {
        const normalizedValue = String(value == null ? "" : value).trim();
        if (!normalizedValue) return null;
        const normalizedDescription = String(description || "").trim();
        return {
          label,
          value: normalizedValue,
          ...(normalizedDescription ? { description: normalizedDescription } : {}),
        };
      }

      function compactPlaygroundManagedModelDetailFacts(facts) {
        return facts.filter(Boolean);
      }

      function getPlaygroundManagedModelDetails(tabId, model) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const modelId = String(model?.baseModelId || model?.id || "").trim();
        const availability = readPlaygroundManagedModelAvailability(model);
        const modelProvider = String(
          availability.modelProvider
          || model?.provider
          || getPlaygroundManagedModelProviderLabel(normalizedTabId, model)
          || "Managed"
        ).trim() || "Managed";
        const deliveryProvider = String(
          availability.deliveryProvider
          || (String(model?.source || "").trim().toLowerCase() === "external"
            ? "Workspace external model"
            : normalizedTabId === "agent" && String(model?.description || "").toLowerCase().includes("clawcode")
              ? "Clawcode model gateway"
              : "Platform managed model gateway")
        ).trim();
        const location = String(
          availability.location
          || model?.location
          || "Not exposed by platform"
        ).trim();
        const locationDescription = /not exposed|provider-managed/i.test(location)
          ? "The current model catalog does not expose a fixed inference region."
          : "";
        const runtimeModelId = String(
          availability.runtimeModelId
          || model?.runtimeModelId
          || modelId
        ).trim();
        const dataHandling = String(
          availability.dataHandling
          || model?.dataHandling
          || "Not exposed by platform"
        ).trim();
        const dataHandlingDescription = /not exposed/i.test(dataHandling)
          ? "Retention and residency depend on the configured provider route."
          : "";
        const catalogSource = String(model?.source || "managed").trim().toLowerCase() === "external"
          ? "Workspace external catalog"
          : "Managed model catalog";
        const statusLabel = model?.locked ? "Plan required" : "Available";
        const pricingLabel = getPlaygroundManagedModelPricingLabel(normalizedTabId, model);
        const description = String(model?.description || "").trim()
          || "No model description is available.";
        let overviewFacts = [];
        let fallbackCapabilities = [];

        if (normalizedTabId === "agent") {
          const pricing = getPlaygroundManagedAgentPricingCells(model);
          overviewFacts = compactPlaygroundManagedModelDetailFacts([
            createPlaygroundManagedModelDetailFact("Model ID", modelId),
            createPlaygroundManagedModelDetailFact("Intelligence", model?.intelligence || model?.intelligenceLabel || "Custom"),
            createPlaygroundManagedModelDetailFact("Context window", model?.contextWindow || "Custom"),
            createPlaygroundManagedModelDetailFact(
              "Speed",
              hasPlaygroundManagedAgentModelTps(model)
                ? formatPlaygroundManagedAgentModelTps(model)
                : model?.speed || "Custom"
            ),
            createPlaygroundManagedModelDetailFact("Input", pricing.input + " / mTok"),
            createPlaygroundManagedModelDetailFact("Cached input", pricing.cached + " / mTok"),
            createPlaygroundManagedModelDetailFact("Output", pricing.output + " / mTok"),
          ]);
          fallbackCapabilities = ["Agent execution"];
        } else if (normalizedTabId === "image") {
          overviewFacts = compactPlaygroundManagedModelDetailFacts([
            createPlaygroundManagedModelDetailFact("Model ID", modelId),
            createPlaygroundManagedModelDetailFact("Mode", model?.mode || "Image generation"),
            createPlaygroundManagedModelDetailFact("Quality", model?.contextWindow || "Auto"),
            createPlaygroundManagedModelDetailFact("Speed", model?.speed || "Custom"),
            createPlaygroundManagedModelDetailFact("Pricing", pricingLabel || "Pricing tiers"),
          ]);
          fallbackCapabilities = ["Image generation"];
          if (/edit/i.test(String(model?.mode || ""))) fallbackCapabilities.push("Image editing");
          if (/inpaint/i.test(String(model?.mode || ""))) fallbackCapabilities.push("Inpainting");
        } else if (normalizedTabId === "video") {
          overviewFacts = compactPlaygroundManagedModelDetailFacts([
            createPlaygroundManagedModelDetailFact("Model ID", modelId),
            createPlaygroundManagedModelDetailFact("Maximum duration", model?.maxDuration || "Custom"),
            createPlaygroundManagedModelDetailFact("Resolutions", model?.resolutions || "Custom"),
            createPlaygroundManagedModelDetailFact("Input modalities", model?.inputModalities || "Custom"),
            createPlaygroundManagedModelDetailFact("Pricing", pricingLabel || "Pricing tiers"),
          ]);
          fallbackCapabilities = ["Video generation"].concat(
            String(model?.inputModalities || "")
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean)
              .map((value) => value + " input")
          );
        } else {
          overviewFacts = compactPlaygroundManagedModelDetailFacts([
            createPlaygroundManagedModelDetailFact("Model ID", modelId),
            createPlaygroundManagedModelDetailFact("Mode", model?.mode || "Deep research"),
            createPlaygroundManagedModelDetailFact("Research scope", model?.contextWindow || "Web, files, sources"),
            createPlaygroundManagedModelDetailFact("Speed", model?.speed || "Custom"),
            createPlaygroundManagedModelDetailFact("Pricing", pricingLabel || "Usage-based pricing"),
          ]);
          fallbackCapabilities = ["Deep research", "Source-grounded synthesis"];
        }

        const suppliedCapabilities = Array.isArray(availability.capabilities)
          ? availability.capabilities
          : Array.isArray(model?.capabilities)
            ? model.capabilities
            : fallbackCapabilities;
        const capabilities = Array.from(new Set(
          suppliedCapabilities
            .map((value) => String(value || "").trim())
            .filter(Boolean)
        ));
        const availabilityFacts = compactPlaygroundManagedModelDetailFacts([
          createPlaygroundManagedModelDetailFact("Model provider", modelProvider),
          createPlaygroundManagedModelDetailFact("Delivery provider", deliveryProvider),
          createPlaygroundManagedModelDetailFact("Hosting", availability.hosting || model?.hosting || "Provider-managed"),
          createPlaygroundManagedModelDetailFact("Location", location, locationDescription),
          createPlaygroundManagedModelDetailFact("Runtime model ID", runtimeModelId),
          createPlaygroundManagedModelDetailFact("Data handling", dataHandling, dataHandlingDescription),
          createPlaygroundManagedModelDetailFact("Platform integration", availability.integration || getPlaygroundManagedModelIntegrationLabel(normalizedTabId)),
          createPlaygroundManagedModelDetailFact("Catalog source", catalogSource),
          createPlaygroundManagedModelDetailFact("Access", statusLabel),
        ]);

        return {
          categoryLabel: getPlaygroundManagedModelCategoryLabel(normalizedTabId),
          description,
          providerIcon: getPlaygroundManagedModelProviderIconMeta(normalizedTabId, model) || undefined,
          overviewFacts,
          availabilityFacts,
          capabilities,
          documentationUrl: String(availability.documentationUrl || model?.documentationUrl || "").trim(),
          canCreateAgent: normalizedTabId === "agent" && !model?.locked,
          agentModelId: normalizedTabId === "agent" ? String(model?.id || modelId).trim() : "",
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
