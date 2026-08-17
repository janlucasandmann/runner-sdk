export const KNOWLEDGE_APP_NAVIGATION_SCRIPT = `        function openKnowledgePage(options = {}) {
          setAccountMenuOpen(false);
          setProfileEditorOpen(false);
          if (!options.preserveSidebarMode) setSidebarWorkspaceMode("configure");
          setResourcesHeaderState({ mode: "overview", title: "" });
          const libraryId = String(options.libraryId || "").trim();
          const documentId = String(options.documentId || "").trim();
          if (libraryId) setSelectedKnowledgeLibraryId(libraryId);
          if (options.libraryName) setSelectedKnowledgeLibraryName(String(options.libraryName));
          if (documentId) setSelectedKnowledgeDocumentId(documentId);
          if (options.documentName) setSelectedKnowledgeDocumentName(String(options.documentName));
          setKnowledgePageMode(documentId ? "document" : libraryId ? "library" : "overview");
          setActivePage("knowledge");
        }

        function openKnowledgeOverviewPage() {
          setSelectedKnowledgeLibraryId("");
          setSelectedKnowledgeLibraryName("");
          setSelectedKnowledgeDocumentId("");
          setSelectedKnowledgeDocumentName("");
          setSelectedKnowledgeVersionNumber(1);
          openKnowledgePage({ mode: "overview" });
        }

        function openKnowledgeLibraryPage(libraryId, libraryName = "") {
          const normalizedId = String(libraryId || "").trim();
          if (!normalizedId) return openKnowledgeOverviewPage();
          setSelectedKnowledgeDocumentId("");
          setSelectedKnowledgeDocumentName("");
          openKnowledgePage({ libraryId: normalizedId, libraryName });
        }

        function openKnowledgeDocumentPage(libraryId, documentId, libraryName = "", documentName = "") {
          const normalizedLibraryId = String(libraryId || "").trim();
          const normalizedDocumentId = String(documentId || "").trim();
          if (!normalizedLibraryId || !normalizedDocumentId) {
            return openKnowledgeLibraryPage(normalizedLibraryId, libraryName);
          }
          openKnowledgePage({
            libraryId: normalizedLibraryId,
            libraryName,
            documentId: normalizedDocumentId,
            documentName,
          });
        }

`;

