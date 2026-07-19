export const MARKETPLACE_APP_NAVIGATION_SCRIPT = `        function openResourceTemplatesPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          const nextType = String(options.type || "all").trim() || "all";
          setResourceTemplateTypeFilter(nextType);
          if (options.templateId) {
            setResourceTemplateSelectedId(String(options.templateId || "").trim());
          }
          setActivePage("resource-templates");
        }

        function openResourceTemplatesOverviewPage() {
          setResourceTemplateSelectedId("");
          setResourceTemplatePublishId("");
          openResourceTemplatesPage({ type: "all" });
        }

`;
