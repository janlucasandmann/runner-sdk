export const MARKETPLACE_APP_PAGE_VIEW_SCRIPT = `        function getPlaygroundResourceTemplateMetronomePreviewWorkflowId(templateId) {
          const normalizedTemplateId = String(templateId || "")
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_+|_+$/g, "");
          return normalizedTemplateId ? "builtin_template_" + normalizedTemplateId : "";
        }

        function renderResourceTemplatesPage() {
          const projectOptions = (Array.isArray(realProjects) ? realProjects : [])
            .map((project) => ({
              id: String(project?.id || "").trim(),
              name: String(project?.name || project?.title || "Untitled Project").trim() || "Untitled Project",
            }))
            .filter((project) => project.id);
          async function publishResourceTemplateToProject(template, projectOption) {
            const normalizedProjectId = String(projectOption?.id || "").trim();
            const normalizedTemplateId = String(template?.id || "").trim();
            if (!normalizedProjectId || !normalizedTemplateId) {
              throw new Error("Select a project and template first.");
            }
            const existingProject = (Array.isArray(realProjects) ? realProjects : [])
              .find((project) => String(project?.id || "").trim() === normalizedProjectId);
            const normalizedProject = normalizePlaygroundProjectRecord(existingProject || projectOption);
            if (!normalizedProject?.id) {
              throw new Error("Project could not be resolved.");
            }
            const currentMetadata = normalizedProject.metadata && typeof normalizedProject.metadata === "object" && !Array.isArray(normalizedProject.metadata)
              ? normalizedProject.metadata
              : {};
            const currentPublishedTemplates = Array.isArray(currentMetadata.resourceTemplates)
              ? currentMetadata.resourceTemplates
              : [];
            const templateEntry = {
              id: normalizedTemplateId,
              templateId: normalizedTemplateId,
              type: String(template?.type || "file").trim() || "file",
              typeLabel: String(template?.typeLabel || "").trim(),
              title: String(template?.title || "Template").trim() || "Template",
              summary: String(template?.summary || template?.description || "").trim(),
              difficulty: String(template?.difficulty || "").trim(),
              estimatedSetup: String(template?.estimatedSetup || "").trim(),
              publishedAt: new Date().toISOString(),
            };
            const nextPublishedTemplates = [
              templateEntry,
              ...currentPublishedTemplates.filter((item) => (
                String(item?.templateId || item?.id || "").trim() !== normalizedTemplateId
              )),
            ];
            const nextMetadata = {
              ...currentMetadata,
              resourceTemplates: nextPublishedTemplates,
            };
            const normalizedProjectAttachments = normalizePlaygroundTaskAttachmentList(normalizedProject.attachments || currentMetadata.attachments);
            const normalizedProjectConnectors = normalizePlaygroundTaskConnectorSelections(normalizedProject.connectors || currentMetadata.connectors);
            const response = await fetch(proxyBackendBase + "/projects/" + encodeURIComponent(normalizedProject.id), {
              method: "PATCH",
              headers: {
                ...authRequestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: normalizedProject.name || String(projectOption?.name || "Untitled Project").trim() || "Untitled Project",
                description: normalizedProject.description || "",
                projectType: normalizedProject.projectType || normalizedProject.type || currentMetadata.projectType || currentMetadata.blueprintId || "blank",
                type: normalizedProject.type || normalizedProject.projectType || currentMetadata.type || currentMetadata.projectType || "blank",
                color: normalizedProject.color || undefined,
                defaultEnvironmentId: normalizedProject.defaultEnvironmentId || currentMetadata.defaultEnvironmentId || undefined,
                leadUserId: normalizedProject.leadUserId || currentMetadata.leadUserId || currentMetadata.lead?.userId || undefined,
                leadName: normalizedProject.leadName || currentMetadata.leadName || currentMetadata.lead?.name || undefined,
                leadEmail: normalizedProject.leadEmail || currentMetadata.leadEmail || currentMetadata.lead?.email || undefined,
                leadAvatarUrl: normalizedProject.leadAvatarUrl || currentMetadata.leadAvatarUrl || currentMetadata.lead?.avatarUrl || undefined,
                attachments: normalizedProjectAttachments,
                connectors: normalizedProjectConnectors,
                metadata: nextMetadata,
              }),
            });
            const data = await response.json().catch(() => ({}));
            if (isUnauthorizedStatus(response.status)) {
              triggerPlatformSessionRecovery();
              throw new Error("Please sign in again to publish templates.");
            }
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to publish template.");
            }
            const fallbackProject = {
              ...normalizedProject,
              metadata: nextMetadata,
            };
            const updatedProject = getPlaygroundProjectResponseRecord(data, fallbackProject) || normalizePlaygroundProjectRecord(fallbackProject);
            if (!updatedProject?.id) {
              throw new Error("Template publish failed.");
            }
            setRealProjects((current) => {
              const projects = Array.isArray(current) ? current : [];
              const existingIndex = projects.findIndex((project) => project.id === updatedProject.id);
              if (existingIndex === -1) {
                return sortPlaygroundProjectsByRecent([updatedProject, ...projects]);
              }
              return sortPlaygroundProjectsByRecent(projects.map((project) => (
                project.id === updatedProject.id
                  ? mergePlaygroundProjectRecords(updatedProject, project) || updatedProject
                  : project
              )));
            });
            setResourceTemplateNotice("Published " + templateEntry.title + " to " + (updatedProject.name || normalizedProject.name || "project") + ".");
            void refreshProjects();
          }
          return renderPlaygroundResourceTemplatesPage({
            templates: Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_DATA) ? PLAYGROUND_RESOURCE_TEMPLATE_DATA : [],
            types: Array.isArray(PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA) ? PLAYGROUND_RESOURCE_TEMPLATE_TYPE_DATA : [],
            projectOptions,
            activeType: resourceTemplateTypeFilter,
            setActiveType: setResourceTemplateTypeFilter,
            searchQuery: resourceTemplateSearchQuery,
            setSearchQuery: setResourceTemplateSearchQuery,
            selectedTemplateId: resourceTemplateSelectedId,
            setSelectedTemplateId: setResourceTemplateSelectedId,
            publishTemplateId: resourceTemplatePublishId,
            setPublishTemplateId: setResourceTemplatePublishId,
            notice: resourceTemplateNotice,
            setNotice: setResourceTemplateNotice,
            onPublishTemplate: publishResourceTemplateToProject,
            onPreviewTemplate: (template) => {
              const normalizedTemplateId = String(template?.id || "").trim();
              const normalizedTemplateType = String(template?.type || "").trim();
              if (!normalizedTemplateId) {
                setResourceTemplateSelectedId(normalizedTemplateId);
                return;
              }
              if (PLAYGROUND_RESOURCE_TEMPLATE_PREVIEW_TYPES.has(normalizedTemplateType)) {
                const previewResourceId = getPlaygroundResourceTemplatePreviewResourceId(template);
                const previewResourceType = getPlaygroundResourceTemplatePreviewResourceType(template);
                if (!previewResourceId || !previewResourceType) {
                  setResourceTemplateSelectedId(normalizedTemplateId);
                  return;
                }
                setResourceTemplateSelectedId("");
                setResourceTemplatePublishId("");
                openResourcesView("servers", {
                  serverKind: normalizedTemplateType,
                  resourceType: previewResourceType,
                  resourceId: previewResourceId,
                  preserveSidebarMode: true,
                });
                return;
              }
              if (normalizedTemplateType !== "metronome") {
                setResourceTemplateSelectedId(normalizedTemplateId);
                return;
              }
              const previewWorkflowId = getPlaygroundResourceTemplateMetronomePreviewWorkflowId(normalizedTemplateId);
              if (!previewWorkflowId) {
                setResourceTemplateSelectedId(normalizedTemplateId);
                return;
              }
              setResourceTemplateSelectedId("");
              setResourceTemplatePublishId("");
              openMetronomePage({
                workflowId: previewWorkflowId,
                mode: "edit",
              });
            },
          });
        }

`;
