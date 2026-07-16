export const GUARDRAILS_APP_NAVIGATION_SCRIPT = `        function openGuardrailsPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("configure");
          }
          setResourcesHeaderState({
            mode: "overview",
            title: "",
          });
          setGuardrailsToolbarPopover("");
          if (options.guardrailId) {
            setSelectedGuardrailSetId(String(options.guardrailId || "").trim());
          }
          resetGuardrailVersionTransientState();
          const nextGuardrailsPageMode = options.mode === "detail" || options.guardrailId ? "detail" : "overview";
          setGuardrailsPageMode(nextGuardrailsPageMode);
          setActivePage("guardrails");
        }

        function openGuardrailsOverviewPage() {
          setSelectedGuardrailSetId("");
          openGuardrailsPage({ mode: "overview" });
        }

`;
