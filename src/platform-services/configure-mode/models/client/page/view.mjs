export const MODELS_PAGE_VIEW_SCRIPT = String.raw`      function renderPlaygroundManagedModelsTable(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        const sourceRows = getPlaygroundManagedModelsForTab(activeTab, props.agentModelOptions);
        const normalizedSearchQuery = String(props.searchQuery || "").trim().toLowerCase();
        const providerFilter = String(props.providerFilter || "all").trim() || "all";
        const providerFilterOptions = getPlaygroundManagedModelsProviderFilterOptions(activeTab, sourceRows);
	        const normalizedSortDirection = String(props.sortDirection || "asc").trim().toLowerCase() === "desc" ? "desc" : "asc";
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
            const agentPricingCells = activeTab === "agent" ? getPlaygroundManagedAgentPricingCells(model) : null;
            const agentTpsValue = activeTab === "agent" ? formatPlaygroundManagedAgentModelTps(model) : null;
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
              agentPricingCells?.input,
              agentPricingCells?.output,
              agentPricingCells?.cached,
              agentTpsValue,
            ].join(" ").toLowerCase();
            return haystack.includes(normalizedSearchQuery);
          });
        const visibleRows = sortPlaygroundManagedModels(activeTab, filteredRows, props.sort, normalizedSortDirection)
          .map((model) => ({
            ...model,
            details: getPlaygroundManagedModelDetails(activeTab, model),
          }));
        const isAgentTab = activeTab === "agent";
        const isVideoTab = activeTab === "video";
        const capabilityLabel = isVideoTab ? "Max Duration" : isAgentTab ? "Intelligence" : "Mode";
        const scopeLabel = isAgentTab ? "Context" : activeTab === "image" ? "Quality" : activeTab === "video" ? "Resolutions" : "Scope";
        const speedLabel = isVideoTab ? "Input Modalities" : isAgentTab ? "Speed in TPS" : "Speed";
        const pricingLabel = "Pricing";

        const skillSettingsMeta = getPlaygroundManagedModelsSkillSettingsMeta(activeTab);
        const getCapabilityValue = (model) => {
          if (isVideoTab) return model.maxDuration || "Custom";
          if (isAgentTab) return renderPlaygroundManagedModelIntelligence(model);
          return model.mode || "Managed";
        };
        const getScopeValue = (model) => isVideoTab ? model.resolutions || "Custom" : model.contextWindow || "Custom";
        const getSpeedValue = (model) => {
          if (isVideoTab) return model.inputModalities || "Custom";
          if (isAgentTab) return formatPlaygroundManagedAgentModelTps(model);
          return model.speed || "Custom";
        };
        const getPricingValue = (model) => getPlaygroundManagedModelPricingLabel(activeTab, model) || (model?.isPricingSubrow ? "" : "Pricing tiers");
        const featuredModelDefinitions = [
          {
            id: "deepseek-v4-flash",
            displayName: "DeepSeek V4 Flash",
            badge: "Speed & value",
            description: "Fast, cost-efficient execution for high-volume agents and everyday production work.",
            cardClassName: "is-speed",
            Icon: Zap,
            metrics: [
              { label: "Speed", value: (model) => formatPlaygroundManagedAgentModelTps(model) },
              { label: "Input", value: (model) => getPlaygroundManagedAgentPricingCells(model).input + " / mTok" },
              { label: "Context", value: (model) => model?.contextWindow || "Custom" },
            ],
          },
          {
            id: "kimi-k2.7-code",
            displayName: "Kimi K2.7 Code",
            badge: "Coding",
            description: "Maximum coding performance for complex implementation work and long-horizon engineering.",
            cardClassName: "is-code",
            Icon: Code2,
            metrics: [
              { label: "Intelligence", value: (model) => model?.intelligence || model?.intelligenceLabel || "High" },
              { label: "Context", value: (model) => model?.contextWindow || "Custom" },
              { label: "Input", value: (model) => getPlaygroundManagedAgentPricingCells(model).input + " / mTok" },
            ],
          },
          {
            id: "glm-5.2",
            displayName: "GLM 5.2",
            badge: "Agent value",
            description: "Strong autonomous agent performance with excellent throughput at a low operating cost.",
            cardClassName: "is-agent",
            Icon: Bot,
            metrics: [
              { label: "Intelligence", value: (model) => model?.intelligence || model?.intelligenceLabel || "Highest" },
              { label: "Speed", value: (model) => formatPlaygroundManagedAgentModelTps(model) },
              { label: "Input", value: (model) => getPlaygroundManagedAgentPricingCells(model).input + " / mTok" },
            ],
          },
          {
            id: "grok-4.5",
            displayName: "Grok 4.5",
            badge: "Frontier",
            description: "Maximum performance and efficient token use for demanding agentic and knowledge work.",
            cardClassName: "is-frontier",
            Icon: Sparkles,
            metrics: [
              { label: "Intelligence", value: (model) => model?.intelligence || model?.intelligenceLabel || "Highest" },
              { label: "Speed", value: (model) => formatPlaygroundManagedAgentModelTps(model) },
              { label: "Context", value: (model) => model?.contextWindow || "Custom" },
            ],
          },
        ];
        const agentCatalogRows = getPlaygroundManagedModelsForTab("agent", props.agentModelOptions);
        const featuredModels = featuredModelDefinitions
          .map((definition) => ({
            ...definition,
            model: agentCatalogRows.find((model) => String(model?.id || "") === definition.id) || null,
          }))
          .filter((entry) => entry.model);

        const renderFeaturedModelsSection = () => {
          if (featuredModels.length === 0) return null;
          return React.createElement("section", {
              className: "playground-models-featured-section",
              "aria-label": "Featured Models",
            },
            React.createElement("div", { className: "playground-models-featured-grid" },
              featuredModels.map((entry) => {
                const providerLabel = getPlaygroundManagedModelProviderLabel("agent", entry.model);
                const RecommendationIcon = entry.Icon;
                return React.createElement("article", {
                    key: entry.id,
                    className: "playground-models-featured-card " + entry.cardClassName,
                  },
                  React.createElement("div", { className: "playground-models-featured-card-top" },
                    React.createElement("div", { className: "playground-models-featured-provider" },
                      React.createElement("span", { className: "playground-models-featured-provider-icon", "aria-hidden": "true" },
                        renderPlaygroundManagedModelProviderIcon("agent", entry.model)
                      ),
                      React.createElement("span", { className: "playground-models-featured-provider-label" }, providerLabel)
                    ),
                    React.createElement("span", { className: "playground-models-featured-badge" },
                      React.createElement(RecommendationIcon, { width: 11, height: 11, strokeWidth: 1.9 }),
                      React.createElement("span", null, entry.badge)
                    )
                  ),
                  React.createElement("h3", { className: "playground-models-featured-name" }, entry.displayName),
                  React.createElement("p", { className: "playground-models-featured-description" }, entry.description),
                  React.createElement("div", { className: "playground-models-featured-metrics" },
                    entry.metrics.map((metric) => {
                      const value = metric.value(entry.model);
                      return React.createElement("div", { key: metric.label, className: "playground-models-featured-metric" },
                        React.createElement("span", { className: "playground-models-featured-metric-label" }, metric.label),
                        React.createElement("span", { className: "playground-models-featured-metric-value", title: value }, value)
                      );
                    })
                  )
                );
              })
            )
          );
        };

	        const setModelSort = (sortId, direction) => {
	          props.setSort(sortId);
	          if (typeof props.setSortDirection === "function") {
	            props.setSortDirection(String(direction || "asc").toLowerCase() === "desc" ? "desc" : "asc");
	          }
	        };
	        const renderModelValue = (value, options = {}) => React.createElement("div", {
	          className: "playground-models-entry-value"
	            + (options.strong ? " is-strong" : "")
	            + (options.price ? " is-price" : ""),
	          title: typeof value === "string" ? value : "",
	        }, value);
	        const modelColumns = [
	          {
	            id: "name",
	            header: "Model",
	            accessor: (model) => model.label || model.id,
	            sortable: true,
	            width: "minmax(185px, 1.35fr)",
	            cell: ({ row: model }) => React.createElement("div", { className: "playground-files-entry-main playground-models-entry-main" },
	              model.isPricingSubrow ? null : renderPlaygroundManagedModelProviderIcon(activeTab, model),
	              React.createElement("div", {
	                className: "playground-files-entry-name",
	                title: model.label || model.id,
	              }, model.label || model.id)
	            ),
	          },
	          {
	            id: "provider",
	            header: "Provider",
	            accessor: (model) => getPlaygroundManagedModelProviderLabel(activeTab, model),
	            sortable: true,
	            width: "minmax(105px, 0.72fr)",
	            cell: ({ row: model }) => renderModelValue(getPlaygroundManagedModelProviderLabel(activeTab, model), { strong: true }),
	          },
	          {
	            id: isAgentTab ? "intelligence" : "capability",
	            header: capabilityLabel,
	            accessor: getCapabilityValue,
	            sortable: true,
	            width: "minmax(105px, 0.7fr)",
	            hideBelow: 820,
	            cell: ({ row: model }) => renderModelValue(getCapabilityValue(model)),
	          },
	          {
	            id: isAgentTab ? "context" : "scope",
	            header: scopeLabel,
	            accessor: getScopeValue,
	            sortable: true,
	            width: "minmax(85px, 0.55fr)",
	            hideBelow: 720,
	            cell: ({ row: model }) => renderModelValue(getScopeValue(model)),
	          },
	          {
	            id: "speed",
	            header: speedLabel,
	            accessor: getSpeedValue,
	            sortable: true,
	            width: "minmax(95px, 0.62fr)",
	            hideBelow: 940,
	            cell: ({ row: model }) => renderModelValue(getSpeedValue(model)),
	          },
	          ...(isAgentTab
	            ? [
	                {
	                  id: "cost-input",
	                  header: "Input / mTok",
	                  accessor: (model) => getPlaygroundManagedAgentPricingCells(model).input,
	                  sortable: true,
	                  width: "minmax(100px, 0.58fr)",
	                  align: "end",
	                  cell: ({ row: model }) => renderModelValue(getPlaygroundManagedAgentPricingCells(model).input, { strong: true, price: true }),
	                },
	                {
	                  id: "cost-output",
	                  header: "Output / mTok",
	                  accessor: (model) => getPlaygroundManagedAgentPricingCells(model).output,
	                  sortable: true,
	                  width: "minmax(105px, 0.6fr)",
	                  align: "end",
	                  hideBelow: 1040,
	                  cell: ({ row: model }) => renderModelValue(getPlaygroundManagedAgentPricingCells(model).output, { strong: true, price: true }),
	                },
	                {
	                  id: "cost-cached",
	                  header: "Cached / mTok",
	                  accessor: (model) => getPlaygroundManagedAgentPricingCells(model).cached,
	                  sortable: true,
	                  width: "minmax(105px, 0.6fr)",
	                  align: "end",
	                  hideBelow: 1180,
	                  cell: ({ row: model }) => renderModelValue(getPlaygroundManagedAgentPricingCells(model).cached, { strong: true, price: true }),
	                },
	              ]
	            : [
	                {
	                  id: "cost",
	                  header: pricingLabel,
	                  accessor: getPricingValue,
	                  sortable: true,
	                  width: "minmax(125px, 0.75fr)",
	                  align: "end",
	                  cell: ({ row: model }) => renderModelValue(getPricingValue(model), { strong: true }),
	                },
	              ]),
	        ];
        const skillSettingsSection = skillSettingsMeta
          ? React.createElement("section", { className: "playground-models-skill-settings-section" },
              React.createElement("div", { className: "playground-models-skill-settings-copy" },
                React.createElement("h3", { className: "playground-models-skill-settings-title" }, skillSettingsMeta.title),
                React.createElement("p", { className: "playground-models-skill-settings-description" }, skillSettingsMeta.description)
              ),
              React.createElement(PlatformSecondaryButton, {
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
        return React.createElement(ModelsOverviewPage, {
          rows: visibleRows,
          columns: modelColumns,
          featuredContent: renderFeaturedModelsSection(),
          skillSettingsContent: skillSettingsSection,
          tabs: getPlaygroundManagedModelsTabs(),
          activeTab,
          onTabChange: (tabId) => {
            props.setActiveTab(tabId);
            props.setProviderFilter("all");
            setModelSort("provider", "asc");
          },
          onCreateAgent: (model) => {
            const modelId = String(model?.details?.agentModelId || model?.id || "").trim();
            if (modelId && typeof props.onCreateAgent === "function") {
              props.onCreateAgent(modelId);
            }
          },
          searchValue: props.searchQuery,
          onSearchChange: props.setSearchQuery,
          providerFilter,
          providerFilterOptions,
          onProviderFilterChange: props.setProviderFilter,
          sorting: {
            id: props.sort,
            direction: normalizedSortDirection,
          },
          onSortingChange: (nextSorting) => {
            if (nextSorting) {
              setModelSort(nextSorting.id, nextSorting.direction);
            }
          },
          getRowId: (model) => activeTab + ":" + String(model.id || ""),
          getRowClassName: (model) => model.isPricingSubrow ? "is-pricing-subrow" : "",
          emptyState: "No models available.",
          noResultsState: "No matching models found.",
        });
	      }

      function renderPlaygroundModelsPage(props) {
        const activeTab = normalizePlaygroundManagedModelsTab(props.activeTab);
        return renderPlaygroundManagedModelsTable({
          activeTab,
          setActiveTab: props.setActiveTab,
          agentModelOptions: props.agentModelOptions,
          searchQuery: props.searchQuery,
          setSearchQuery: props.setSearchQuery,
          providerFilter: props.providerFilter,
          setProviderFilter: props.setProviderFilter,
          sort: props.sort,
          setSort: props.setSort,
          sortDirection: props.sortDirection,
          setSortDirection: props.setSortDirection,
          toolbarPopover: props.toolbarPopover,
          setToolbarPopover: props.setToolbarPopover,
          toolbarPopoverClosing: props.toolbarPopoverClosing,
          setToolbarPopoverClosing: props.setToolbarPopoverClosing,
          toolbarRef: props.toolbarRef,
          viewMode: props.viewMode,
          setViewMode: props.setViewMode,
          pricingUrl: props.pricingUrl,
          onOpenSkillSettings: props.onOpenSkillSettings,
          onCreateAgent: props.onCreateAgent,
        });
      }
`;
