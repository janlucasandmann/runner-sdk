export const MODELS_PAGE_CATALOG_SCRIPT = String.raw`
      const PLAYGROUND_MANAGED_MODELS_CT_PER_DOLLAR = 100;
      const PLAYGROUND_MANAGED_AGENT_MODEL_TPS_BY_ID = {
        "claude-haiku-4-5": 97.7,
        "claude-sonnet-4-5": 41.9,
        "claude-opus-4-6": 39.4,
        "claude-opus-4-7": 56.4,
        "claude-opus-4-8": 58.3,
        "gpt-5.5-pro": null,
        "gpt-5.5": 95.6,
        "gpt-5.4": 174.5,
        "gpt-5.4-mini": 180.6,
        "gpt-5.4-nano": 147.0,
        "grok-4.5": 85,
        "gemini-3-flash": 176.9,
        "gemini-3-1-flash": 176.9,
        "gemini-3-1-pro": 132.2,
        "deepseek-v4-pro": 46.0,
        "deepseek-v4-flash": 116.4,
        "minimax-m3": 41.1,
        "kimi-k2.6": 60.1,
        "kimi-k2.7-code": null,
        "glm-5.2": 206.8,
        "qwen3.5-397b-a17b": 137.9,
      };
      const PLAYGROUND_MANAGED_AGENT_MODEL_INTELLIGENCE_BY_ID = {
        "gemini-3-flash": "Good",
        "gemini-3-1-flash": "Good",
        "gemini-3-1-pro": "High",
        "deepseek-v4-pro": "High",
        "minimax-m3": "High",
        "kimi-k2.6": "High",
        "kimi-k2.7-code": "High",
        "glm-5.2": "Highest",
        "qwen3.5-397b-a17b": "High",
        "grok-4.5": "Highest",
      };

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

`;
