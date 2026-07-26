export const EVIDENCE_AGENTS_TOP_NAVIGATION_SCRIPT = `        function renderDevelopEvidenceAgentsNav() {
          const isEvidenceDetailView = resourcesHeaderState.mode === "detail"
            && resourcesHeaderState.resourceType === "evidence_review";
          const returnToEvidenceOverview = () => {
            if (typeof resourcesHeaderState.onOverviewClick === "function") {
              resourcesHeaderState.onOverviewClick();
              return;
            }
            openDevelopEvidenceAgentsPage({ preserveSidebarMode: true });
          };
          return renderAppHeader({
            className: "playground-develop-navbar playground-develop-evidence-agents-navbar",
            pathItems: isEvidenceDetailView
              ? [
                  { label: "Develop", onClick: () => openDevelopHome() },
                  { label: "Evidence Agents", onClick: returnToEvidenceOverview },
                  { label: resourcesHeaderState.title || "Review" },
                ]
              : [
                  { label: "Develop", onClick: () => openDevelopHome() },
                  { label: "Evidence Agents" },
                ],
            includeSearchDivider: true,
          });
        }
`;
