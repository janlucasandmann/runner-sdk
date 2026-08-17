export const KNOWLEDGE_APP_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "knowledge") {
            openKnowledgePage({
              libraryId: entry.libraryId || "",
              libraryName: entry.libraryName || "",
              documentId: entry.mode === "document" ? (entry.documentId || "") : "",
              documentName: entry.documentName || "",
            });
            return;
          }

`;

