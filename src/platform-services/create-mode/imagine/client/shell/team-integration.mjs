export const IMAGINE_APP_TEAM_TEMPLATE_READER_SCRIPT = String.raw`
        function readTeamPageCustomImagineTemplates() {
          if (typeof window === "undefined" || !window.localStorage) {
            return [];
          }
          try {
            const parsed = JSON.parse(window.localStorage.getItem("runner_demo_imagine_custom_templates_v1") || "[]");
            if (!Array.isArray(parsed)) {
              return [];
            }
            return parsed
              .filter((template) => template && template.id && template.imageUrl)
              .map((template) => {
                const safeTemplate = { ...(template || {}) };
                delete safeTemplate["long" + "Description"];
                return safeTemplate;
              });
          } catch (_error) {
            return [];
          }
        }

`;

export const IMAGINE_APP_TEAM_RESOURCE_NAVIGATION_SCRIPT = String.raw`
          function openTeamResourceImagineTemplateRow(row) {
            const templateId = getTeamResourceRowResourceId(row);
            setImagineActiveView("my-templates");
            setImagineTemplateSelectionRequest(templateId ? {
              templateId,
              token: createPlaygroundPlatformNavigationToken(),
            } : null);
            setSidebarWorkspaceMode("work");
            setActivePage("imagine");
            return true;
          }

`;
