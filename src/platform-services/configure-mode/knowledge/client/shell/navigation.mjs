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
          if (Object.prototype.hasOwnProperty.call(options, "originThreadId")) {
            setKnowledgeOriginThreadId(String(options.originThreadId || "").trim());
            setKnowledgeOriginThreadTitle(String(options.originThreadTitle || "").trim());
          } else if (!options.preserveThreadOrigin) {
            setKnowledgeOriginThreadId("");
            setKnowledgeOriginThreadTitle("");
          }
          setKnowledgePageMode(documentId ? "document" : libraryId ? "library" : "overview");
          setActivePage("knowledge");
        }

        function openKnowledgeOverviewPage() {
          setSelectedKnowledgeLibraryId("");
          setSelectedKnowledgeLibraryName("");
          setSelectedKnowledgeDocumentId("");
          setSelectedKnowledgeDocumentName("");
          setSelectedKnowledgeVersionNumber(1);
          setKnowledgeOriginThreadId("");
          setKnowledgeOriginThreadTitle("");
          openKnowledgePage({ mode: "overview" });
        }

        function openKnowledgeLibraryPage(libraryId, libraryName = "", options = {}) {
          const normalizedId = String(libraryId || "").trim();
          if (!normalizedId) return openKnowledgeOverviewPage();
          setSelectedKnowledgeDocumentId("");
          setSelectedKnowledgeDocumentName("");
          openKnowledgePage({ libraryId: normalizedId, libraryName, ...options });
        }

        function openKnowledgeDocumentPage(libraryId, documentId, libraryName = "", documentName = "", options = {}) {
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
            preserveThreadOrigin: true,
            ...options,
          });
        }

        function openKnowledgeLibraryFromThread(libraryId, libraryName, threadId, threadTitle) {
          const normalizedThreadId = String(threadId || "").trim();
          openKnowledgeLibraryPage(libraryId, libraryName, {
            originThreadId: normalizedThreadId,
            originThreadTitle: String(threadTitle || "Current thread").trim() || "Current thread",
          });
        }

        function returnToKnowledgeOriginThread() {
          const normalizedThreadId = String(knowledgeOriginThreadId || "").trim();
          if (!normalizedThreadId) return;
          setKnowledgeOriginThreadId("");
          setKnowledgeOriginThreadTitle("");
          handleThreadSelect(normalizedThreadId);
        }

`;
