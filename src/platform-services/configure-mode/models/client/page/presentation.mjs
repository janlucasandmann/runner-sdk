export const MODELS_PAGE_PRESENTATION_SCRIPT = String.raw`      function renderPlaygroundManagedModelProviderIcon(tabId, model) {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const providerIcon = getPlaygroundManagedModelProviderIconMeta(normalizedTabId, model);
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
        const Icon = normalizedTabId === "agent"
          ? Bot
          : normalizedTabId === "image"
            ? ImageIcon
            : normalizedTabId === "video"
              ? Film
              : Telescope;
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

      function sortPlaygroundManagedModels(tabId, rows, sortId, sortDirection = "asc") {
        const normalizedTabId = normalizePlaygroundManagedModelsTab(tabId);
        const normalizedSortId = String(sortId || "provider").trim() || "provider";
        const directionMultiplier = String(sortDirection || "asc").trim().toLowerCase() === "desc" ? -1 : 1;
        const compareRows = (left, right) => {
          let comparison = 0;
          if (normalizedSortId === "name") {
            comparison = String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || ""));
          } else if (normalizedTabId === "agent" && normalizedSortId === "intelligence") {
            const leftLevel = getPlaygroundAgentIntelligenceLevel(left?.intelligence || left?.intelligenceLabel || "");
            const rightLevel = getPlaygroundAgentIntelligenceLevel(right?.intelligence || right?.intelligenceLabel || "");
            comparison = leftLevel - rightLevel;
          } else if (normalizedTabId === "agent" && normalizedSortId.startsWith("cost-")) {
            const priceKey = normalizedSortId === "cost-output" ? "output" : normalizedSortId === "cost-cached" ? "cached" : "input";
            const readPrice = (model) => {
              const value = String(getPlaygroundManagedAgentPricingCells(model)?.[priceKey] || "");
              const match = value.replace(/,/g, "").match(/[0-9]+(?:\.[0-9]+)?/);
              return match ? Number(match[0]) : Number.POSITIVE_INFINITY;
            };
            comparison = readPrice(left) - readPrice(right);
          } else if (normalizedSortId === "cost") {
            const leftCost = getPlaygroundManagedModelPricingRank(normalizedTabId, left);
            const rightCost = getPlaygroundManagedModelPricingRank(normalizedTabId, right);
            comparison = leftCost - rightCost;
          } else if (normalizedTabId === "agent" && normalizedSortId === "context") {
            const leftContext = readPlaygroundManagedModelContextValue(left);
            const rightContext = readPlaygroundManagedModelContextValue(right);
            comparison = leftContext - rightContext;
          } else if (normalizedSortId === "speed") {
            const leftSpeed = readPlaygroundManagedModelSpeedRank(left);
            const rightSpeed = readPlaygroundManagedModelSpeedRank(right);
            comparison = leftSpeed - rightSpeed;
          } else if (normalizedSortId === "capability") {
            comparison = String(
              normalizedTabId === "video"
                ? left?.maxDuration || ""
                : normalizedTabId === "agent"
                  ? left?.intelligence || left?.intelligenceLabel || ""
                  : left?.mode || ""
            ).localeCompare(String(
              normalizedTabId === "video"
                ? right?.maxDuration || ""
                : normalizedTabId === "agent"
                  ? right?.intelligence || right?.intelligenceLabel || ""
                  : right?.mode || ""
            ));
          } else if (normalizedSortId === "scope") {
            comparison = String(
              normalizedTabId === "video" ? left?.resolutions || "" : left?.contextWindow || ""
            ).localeCompare(String(
              normalizedTabId === "video" ? right?.resolutions || "" : right?.contextWindow || ""
            ));
          }
          if (comparison !== 0) return comparison * directionMultiplier;
          const leftProvider = getPlaygroundManagedModelProviderLabel(normalizedTabId, left);
          const rightProvider = getPlaygroundManagedModelProviderLabel(normalizedTabId, right);
          if (leftProvider !== rightProvider) return leftProvider.localeCompare(rightProvider) * directionMultiplier;
          return String(left?.label || left?.id || "").localeCompare(String(right?.label || right?.id || "")) * directionMultiplier;
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
              provider: String(entry?.provider || "").trim(),
              location: String(entry?.location || "").trim(),
              runtimeModelId: String(entry?.runtimeModelId || "").trim(),
              hosting: String(entry?.hosting || "").trim(),
              dataHandling: String(entry?.dataHandling || "").trim(),
              documentationUrl: String(entry?.documentationUrl || "").trim(),
              capabilities: Array.isArray(entry?.capabilities) ? entry.capabilities.slice() : [],
              availability: entry?.availability
                && typeof entry.availability === "object"
                && !Array.isArray(entry.availability)
                ? { ...entry.availability }
                : null,
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

`;
