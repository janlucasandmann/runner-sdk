export const EVIDENCE_AGENTS_NAVIGATION_SCRIPT = `        function openDevelopEvidenceAgentsPage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) {
            setSidebarWorkspaceMode("develop");
          }
          setResourcesHeaderState({ mode: "overview", title: "" });
          setIsAgentVersionsDetailOpen(false);
          setActivePage("develop-evidence-agents");
        }
`;
