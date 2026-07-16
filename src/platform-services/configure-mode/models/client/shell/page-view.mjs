export function createModelsAppPageViewScript({ pricingUrl = "" } = {}) {
  return `        function renderModelsPage() {
          return renderPlaygroundModelsPage({
            activeTab: modelsPageTab,
            setActiveTab: setModelsPageTab,
            searchQuery: modelsPageSearchQuery,
            setSearchQuery: setModelsPageSearchQuery,
            providerFilter: modelsPageProviderFilter,
            setProviderFilter: setModelsPageProviderFilter,
            sort: modelsPageSort,
            setSort: setModelsPageSort,
            sortDirection: modelsPageSortDirection,
            setSortDirection: setModelsPageSortDirection,
            toolbarPopover: modelsPageToolbarPopover,
            setToolbarPopover: setModelsPageToolbarPopover,
            toolbarPopoverClosing: modelsPageToolbarPopoverClosing,
            setToolbarPopoverClosing: setModelsPageToolbarPopoverClosing,
            toolbarRef: modelsPageToolbarRef,
            viewMode: modelsPageViewMode,
            setViewMode: setModelsPageViewMode,
            agentModelOptions: resolvedModelsPageAgentModelOptions,
            pricingUrl: ${JSON.stringify(pricingUrl)},
            onOpenSkillSettings: (skillId) => openToolsView("skills", { skillId, preserveSidebarMode: true }),
            onCreateAgent: (modelId) => openAgentCreationInResources({
              modelId,
              sidebarMode: "configure",
            }),
          });
        }

`;
}
