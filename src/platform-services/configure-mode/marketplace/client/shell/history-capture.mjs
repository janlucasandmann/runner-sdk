export const MARKETPLACE_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "resource-templates") {
            return {
              page: "resource-templates",
              templateType: resourceTemplateTypeFilter,
              templateId: resourceTemplateSelectedId,
            };
          }

`;
