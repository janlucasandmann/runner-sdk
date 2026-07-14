export const MARKETPLACE_PREVIEW_RESOURCES_SCRIPT = `      function buildPlaygroundResourceTemplatePreviewResources(templates) {
        const now = new Date().toISOString();
        return (Array.isArray(templates) ? templates : [])
          .map((template) => {
            const templateType = String(template?.type || "").trim();
            if (!PLAYGROUND_RESOURCE_TEMPLATE_PREVIEW_TYPES.has(templateType)) {
              return null;
            }
            const resourceId = getPlaygroundResourceTemplatePreviewResourceId(template);
            if (!resourceId) {
              return null;
            }
            const metadata = buildPlaygroundResourceTemplatePreviewMetadata(template);
            const name = String(template?.title || template?.name || "Template Preview").trim() || "Template Preview";
            const description = String(template?.description || template?.summary || "").trim();
            if (templateType === "database") {
              const documentsByCollectionId = getPlaygroundResourceTemplatePreviewDatabaseDocuments(template);
              const collections = Object.entries(documentsByCollectionId).map(([collectionId, documents]) => ({
                id: collectionId,
                name: collectionId,
                documentCount: Array.isArray(documents) ? documents.length : 0,
                createdAt: now,
                updatedAt: now,
              }));
              const database = normalizePlaygroundDatabaseRecord({
                id: resourceId,
                name,
                description,
                location: "eur3",
                status: "active",
                metadata,
                createdAt: now,
                updatedAt: now,
              });
              return {
                id: resourceId,
                resourceType: "database",
                database,
                collections,
                documentsByCollectionId,
              };
            }
            const server = normalizePlaygroundServerRecord({
              id: resourceId,
              name,
              description,
              kind: templateType,
              runtime: "nodejs22",
              authMode: "public",
              status: "draft",
              serviceUrl: "",
              template: "blank",
              metadata,
              createdAt: now,
              updatedAt: now,
            });
            return {
              id: resourceId,
              resourceType: "server",
              server,
              files: getPlaygroundResourceTemplatePreviewServerFiles(template),
            };
          })
          .filter(Boolean);
      }
`;
