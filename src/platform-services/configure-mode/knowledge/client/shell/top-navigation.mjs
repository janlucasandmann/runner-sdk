export const KNOWLEDGE_APP_TOP_NAVIGATION_SCRIPT = `        function renderKnowledgePageNav() {
          const isOverview = knowledgePageMode === "overview";
          const isLibrary = knowledgePageMode === "library";
          const pathItems = [{ label: "Configure" }, {
            label: "Knowledge",
            onClick: isOverview ? undefined : () => requestPlatformNavigation(openKnowledgeOverviewPage),
          }];
          if (!isOverview) {
            pathItems.push({
              label: selectedKnowledgeLibraryName || "Knowledge Library",
              onClick: knowledgePageMode === "document"
                ? () => requestPlatformNavigation(() => openKnowledgeLibraryPage(
                    selectedKnowledgeLibraryId,
                    selectedKnowledgeLibraryName
                  ))
                : undefined,
              trailing: isLibrary ? React.createElement("span", {
                id: "playground-knowledge-title-actions",
                className: "playground-agent-title-actions-root playground-knowledge-title-actions-root",
              }) : null,
            });
          }
          if (knowledgePageMode === "document") {
            pathItems.push({ label: selectedKnowledgeDocumentName || "Document" });
          }
          return renderAppHeader({
            className: "playground-configure-navbar playground-models-navbar playground-knowledge-navbar",
            pathItems,
            center: isOverview
              ? React.createElement(PlatformSwitch, {
                  className: "playground-knowledge-overview-scope-switch",
                  value: knowledgeOverviewScope === "created"
                    ? "created"
                    : knowledgeOverviewScope === "shared"
                      ? "shared"
                      : "all",
                  options: [
                    { value: "all", label: "All Libraries" },
                    { value: "created", label: "Created by me" },
                    { value: "shared", label: "Shared with me" },
                  ],
                  onValueChange: (nextScope) => setKnowledgeOverviewScope(
                    nextScope === "created" || nextScope === "shared" ? nextScope : "all",
                  ),
                  ariaLabel: "Knowledge library scope",
                })
              : isLibrary
                ? React.createElement("div", {
                    id: "playground-knowledge-section-controls",
                    className: "playground-knowledge-section-controls",
                  })
                : null,
            includeSearchDivider: true,
            extraActions: React.createElement("div", {
              id: isOverview ? "playground-knowledge-overview-controls" : "playground-knowledge-nav-actions",
              className: isOverview ? "playground-tools-overview-controls-slot" : "playground-knowledge-nav-actions",
            }),
          });
        }

`;
