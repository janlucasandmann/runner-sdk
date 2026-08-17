export const KNOWLEDGE_APP_PAGE_VIEW_SCRIPT = String.raw`        function renderKnowledgePage() {
          return React.createElement(KnowledgeWorkspacePage, {
            shouldLoadData: activePage === "knowledge",
            backendUrl: proxyBackendBase,
            requestHeaders,
            mode: knowledgePageMode,
            overviewScope: knowledgeOverviewScope,
            selectedLibraryId: selectedKnowledgeLibraryId,
            selectedDocumentId: selectedKnowledgeDocumentId,
            currentUserId: hasSessionAuth ? (sessionState.userId || "") : "",
            currentUserName: hasSessionAuth ? accountName : "Me",
            currentUserEmail: hasSessionAuth ? accountEmail : "",
            currentUserAvatarUrl: hasSessionAuth ? accountAvatarUrl : "",
            controlsPortalId: knowledgePageMode === "overview"
              ? "playground-knowledge-overview-controls"
              : "playground-knowledge-nav-actions",
            sectionControlsPortalId: knowledgePageMode === "library"
              ? "playground-knowledge-section-controls"
              : undefined,
            titleActionsPortalId: knowledgePageMode === "library"
              ? "playground-knowledge-title-actions"
              : undefined,
            versionsDrawerPortalId: knowledgePageMode === "library"
              ? "playground-agent-versions-drawer-root"
              : undefined,
            workspaceTeams: teamPageTeams,
            workspaceTeamsLoading: teamPageLoading,
            activeOrganizationId,
            onWorkspaceTeamsRequest: () => {
              if (
                !teamPageLoading
                && !teamPageRequiresPlan
                && (!Array.isArray(teamPageTeams) || teamPageTeams.length === 0)
              ) {
                void loadTeamPageData({ selectedTeamId: "" });
              }
            },
            onOpenLibrary: (libraryId, libraryName = "") => {
              requestPlatformNavigation(() => openKnowledgeLibraryPage(libraryId, libraryName));
            },
            onOpenDocument: (libraryId, documentId, libraryName = "", documentName = "") => {
              requestPlatformNavigation(() => openKnowledgeDocumentPage(
                libraryId,
                documentId,
                libraryName,
                documentName
              ));
            },
            onLibraryDeleted: () => openKnowledgeOverviewPage(),
            onIdentityChange: (identity = {}) => {
              if (identity.libraryId) setSelectedKnowledgeLibraryId(String(identity.libraryId));
              if (identity.libraryName) setSelectedKnowledgeLibraryName(String(identity.libraryName));
              if (identity.documentId) setSelectedKnowledgeDocumentId(String(identity.documentId));
              if (identity.documentName) setSelectedKnowledgeDocumentName(String(identity.documentName));
              if (identity.versionNumber) setSelectedKnowledgeVersionNumber(Number(identity.versionNumber) || 1);
            },
            onStartThread: (library) => {
              handleNewThread({
                initialPrompt: "Use the Knowledge library “" + String(library?.name || "Knowledge") + "” as context for this thread.",
                knowledgeLibraryIds: library?.id ? [String(library.id)] : []
              });
            },
          });
        }

`;
