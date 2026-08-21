export const KNOWLEDGE_APP_PAGE_VIEW_SCRIPT = String.raw`        function renderKnowledgePage() {
          const knowledgeOrganization = (Array.isArray(organizationPageOrganizations)
            ? organizationPageOrganizations
            : []
          ).find((organization) => isOrganizationPageActiveOrganization(organization))
            || getOrganizationPagePersonalOrganization(organizationPageOrganizations);
          const knowledgeOrganizationId = String(
            knowledgeOrganization?.id || activeOrganizationId || ""
          ).trim();
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
            onVersionsSidebarOpenChange: setIsAgentVersionsDetailOpen,
            workspaceTeams: teamPageTeams,
            workspaceTeamsLoading: teamPageLoading,
            workspaceTeamMembers: teamPageMembers,
            workspaceTeamMembersTeamId: teamPageSelectedTeamId,
            activeOrganizationId: knowledgeOrganizationId,
            onWorkspaceTeamsRequest: () => {
              if (
                !teamPageLoading
                && !teamPageRequiresPlan
                && (!Array.isArray(teamPageTeams) || teamPageTeams.length === 0)
              ) {
                void loadTeamPageData({ selectedTeamId: "" });
              }
            },
            onWorkspaceTeamMembersRequest: (teamId) => {
              const normalizedTeamId = String(teamId || "").trim();
              if (!normalizedTeamId) return Promise.resolve();
              if (
                !teamPageLoading
                && String(teamPageSelectedTeamId || "").trim() === normalizedTeamId
                && Array.isArray(teamPageMembers)
              ) {
                return Promise.resolve();
              }
              return loadTeamPageData({ selectedTeamId: normalizedTeamId });
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
                knowledgeLibraryIds: library?.id ? [String(library.id)] : [],
                knowledgeContext: library?.id
                  ? {
                      schemaVersion: "computer_agents_knowledge_context_v1",
                      enabled: true,
                      libraryIds: [String(library.id)],
                      bindings: [{
                        libraryId: String(library.id),
                        ...(library?.currentVersionId ? { versionId: String(library.currentVersionId) } : {}),
                        ...(Number.isFinite(Number(library?.currentVersionNumber))
                          ? { versionNumber: Number(library.currentVersionNumber) }
                          : {}),
                      }],
                      mode: "read",
                      source: "knowledge-detail",
                    }
                  : null,
              });
            },
          });
        }

`;
