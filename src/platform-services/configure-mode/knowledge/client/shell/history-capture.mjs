export const KNOWLEDGE_APP_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "knowledge") {
            return {
              page: "knowledge",
              mode: knowledgePageMode,
              libraryId: selectedKnowledgeLibraryId,
              libraryName: selectedKnowledgeLibraryName,
              documentId: selectedKnowledgeDocumentId,
              documentName: selectedKnowledgeDocumentName,
              originThreadId: knowledgeOriginThreadId,
              originThreadTitle: knowledgeOriginThreadTitle,
            };
          }

`;
