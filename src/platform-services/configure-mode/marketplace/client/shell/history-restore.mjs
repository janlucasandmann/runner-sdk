export const MARKETPLACE_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "resource-templates") {
            setResourceTemplateSelectedId(entry.templateId || "");
            openResourceTemplatesPage({
              type: entry.templateType || "all",
              templateId: entry.templateId || "",
            });
            return;
          }

`;
