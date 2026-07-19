export const MARKETPLACE_PAGE_VIEW_SCRIPT = String.raw`        return React.createElement(React.Fragment, null,
          React.createElement(MarketplaceOverviewPage, {
            rows: templateList,
            types: typeList,
            controlsPortalId: "playground-marketplace-overview-controls",
            searchValue: String(searchQuery || ""),
            onSearchChange: (value) => {
              if (typeof setSearchQuery === "function") setSearchQuery(value);
            },
            filterValue: normalizedActiveType,
            onFilterChange: (value) => {
              if (typeof setActiveType === "function") setActiveType(value);
            },
            notice: String(notice || ""),
            onOpen: previewTemplate,
            onPublish: (template) => {
              if (typeof setPublishTemplateId === "function") {
                setPublishTemplateId(String(template?.id || ""));
              }
            },
          }),
          renderTemplateModal(selectedTemplate),
          renderPublishModal(publishTemplate)
        );
      }
`;
