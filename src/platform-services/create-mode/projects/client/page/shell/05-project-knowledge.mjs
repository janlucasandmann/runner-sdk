export const PROJECTS_SHELL_05_FRAGMENT = `        function getPlaygroundProjectKnowledgeLibraryId(projectRecord) {
          const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
          const knowledge = metadata.knowledge && typeof metadata.knowledge === "object" && !Array.isArray(metadata.knowledge)
            ? metadata.knowledge
            : {};
          const missionControl = getPlaygroundProjectMissionControlRecord(projectRecord);
          return String(
            projectRecord?.knowledgeLibraryId
            || metadata.knowledgeLibraryId
            || knowledge.libraryId
            || missionControl.knowledgeLibraryId
            || ""
          ).trim();
        }

        function normalizePlaygroundProjectLinkedResourceType(value) {
          const normalized = String(value || "").trim().toLowerCase().replace(/[\\s-]+/g, "_");
          if (["knowledge", "knowledges", "library", "libraries", "knowledge_library", "knowledge_libraries"].includes(normalized)) {
            return "knowledge";
          }
          if (normalized === "prompts") return "prompt";
          if (normalized === "evaluations") return "evaluation";
          return normalized.replace(/s$/, "");
        }

        function getPlaygroundProjectLinkedResources(projectRecord) {
          const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
          return Array.isArray(metadata.linkedResources)
            ? metadata.linkedResources.filter((resource) => resource && typeof resource === "object" && !Array.isArray(resource))
            : [];
        }

        function isPlaygroundProjectStrategyKnowledgeResource(resource, libraryId = "") {
          if (!resource || typeof resource !== "object" || Array.isArray(resource)) {
            return false;
          }
          const resourceId = String(resource.id || resource.resourceId || resource.libraryId || "").trim();
          const normalizedLibraryId = String(libraryId || "").trim();
          if (normalizePlaygroundProjectLinkedResourceType(resource.type || resource.resourceType) !== "knowledge") {
            return false;
          }
          if (normalizedLibraryId && resourceId === normalizedLibraryId) {
            return true;
          }
          const metadata = resource.metadata && typeof resource.metadata === "object" && !Array.isArray(resource.metadata)
            ? resource.metadata
            : {};
          return resource.isStrategyKnowledge === true
            || ["project_knowledge", "project_strategy_and_documentation"].includes(String(metadata.purpose || resource.purpose || "").trim());
        }

        function buildPlaygroundProjectKnowledgeLinkedResource(projectRecord, library, existingResource = null) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const libraryId = String(library?.id || "").trim();
          if (!libraryId) {
            return null;
          }
          const libraryMetadata = library?.metadata && typeof library.metadata === "object" && !Array.isArray(library.metadata)
            ? library.metadata
            : {};
          const title = String(library?.name || library?.title || existingResource?.name || existingResource?.title || "Project Strategy").trim()
            || "Project Strategy";
          const description = String(
            library?.description
            || existingResource?.description
            || "Project strategy and durable documentation"
          ).trim();
          return {
            ...(existingResource && typeof existingResource === "object" && !Array.isArray(existingResource) ? existingResource : {}),
            id: libraryId,
            resourceId: libraryId,
            libraryId,
            type: "knowledge",
            resourceType: "knowledge",
            name: title,
            title,
            description,
            status: "Strategy",
            currentVersionNumber: Number(library?.currentVersionNumber || existingResource?.currentVersionNumber || 0),
            createdAt: String(library?.createdAt || existingResource?.createdAt || "").trim(),
            updatedAt: String(library?.updatedAt || existingResource?.updatedAt || library?.createdAt || "").trim(),
            linkedAt: String(existingResource?.linkedAt || new Date().toISOString()).trim(),
            isStrategyKnowledge: true,
            metadata: {
              ...libraryMetadata,
              schemaVersion: "computer_agents_project_knowledge_v1",
              projectId: String(normalizedProject.id || libraryMetadata.projectId || "").trim(),
              projectName: String(normalizedProject.name || libraryMetadata.projectName || "Project").trim() || "Project",
              purpose: "project_knowledge",
              managedBy: String(libraryMetadata.managedBy || "mission_control").trim() || "mission_control",
            },
          };
        }

        function reconcilePlaygroundProjectKnowledgeLinkedResources(projectRecord, library) {
          const libraryId = String(library?.id || "").trim();
          if (!libraryId) {
            return getPlaygroundProjectLinkedResources(projectRecord);
          }
          const currentResources = getPlaygroundProjectLinkedResources(projectRecord);
          const existingResource = currentResources.find((resource) => (
            String(resource.id || resource.resourceId || resource.libraryId || "").trim() === libraryId
            && normalizePlaygroundProjectLinkedResourceType(resource.type || resource.resourceType) === "knowledge"
          )) || currentResources.find((resource) => isPlaygroundProjectStrategyKnowledgeResource(resource));
          const linkedResource = buildPlaygroundProjectKnowledgeLinkedResource(projectRecord, library, existingResource);
          return currentResources
            .filter((resource) => !isPlaygroundProjectStrategyKnowledgeResource(resource, libraryId))
            .concat(linkedResource ? [linkedResource] : []);
        }

        function hasPlaygroundProjectKnowledgeResourceLink(projectRecord, library = null) {
          const libraryId = String(library?.id || getPlaygroundProjectKnowledgeLibraryId(projectRecord) || "").trim();
          if (!libraryId || getPlaygroundProjectKnowledgeLibraryId(projectRecord) !== libraryId) {
            return false;
          }
          const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
          const knowledge = metadata.knowledge && typeof metadata.knowledge === "object" && !Array.isArray(metadata.knowledge)
            ? metadata.knowledge
            : {};
          return String(metadata.knowledgeLibraryId || "").trim() === libraryId
            && String(knowledge.libraryId || "").trim() === libraryId
            && getPlaygroundProjectLinkedResources(projectRecord).some((resource) => (
              String(resource.id || resource.resourceId || resource.libraryId || "").trim() === libraryId
              && normalizePlaygroundProjectLinkedResourceType(resource.type || resource.resourceType) === "knowledge"
            ));
        }

        function normalizePlaygroundProjectKnowledgeDocumentKind(value) {
          const normalized = String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
          const aliases = {
            project_strategy: "strategy",
            strategy_document: "strategy",
            architecture_document: "architecture",
            decisions: "decision_log",
            decision: "decision_log",
            adr: "decision_log",
            runbooks: "runbook",
            research_notes: "research",
            handoff_notes: "handoff",
            docs: "documentation",
            general: "documentation",
          };
          return aliases[normalized] || normalized || "documentation";
        }

        function normalizePlaygroundMissionControlKnowledgeDocuments(value) {
          const candidates = Array.isArray(value)
            ? value
            : value && typeof value === "object" && !Array.isArray(value)
              ? [value]
              : [];
          const documents = [];
          const seenKeys = new Set();
          candidates.slice(0, 24).forEach((candidate, index) => {
            if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
              return;
            }
            const markdown = String(candidate.markdown || candidate.content || candidate.body || "")
              .replaceAll(String.fromCharCode(13), "")
              .trim();
            if (!markdown) {
              return;
            }
            const kind = normalizePlaygroundProjectKnowledgeDocumentKind(candidate.kind || candidate.documentKind);
            const title = String(candidate.title || "").trim().slice(0, 500)
              || (kind === "strategy" ? "Project Strategy" : "Project Documentation " + String(index + 1));
            const documentId = String(candidate.documentId || candidate.id || "").trim();
            const key = documentId || kind + ":" + title.toLowerCase();
            if (seenKeys.has(key)) {
              return;
            }
            seenKeys.add(key);
            documents.push({
              kind,
              title,
              summary: String(candidate.summary || candidate.description || "").trim().slice(0, 2000),
              markdown: markdown.slice(0, 500000),
              ...(documentId ? { documentId } : {}),
            });
          });
          return documents;
        }

        function getPlaygroundLegacyProjectStrategySnapshot(projectRecord) {
          const metadata = projectRecord?.metadata && typeof projectRecord.metadata === "object" && !Array.isArray(projectRecord.metadata)
            ? projectRecord.metadata
            : {};
          const missionControlSources = [projectRecord?.missionControl, metadata.missionControl]
            .filter((value) => value && typeof value === "object" && !Array.isArray(value));
          const missionControl = missionControlSources[0] || {};
          const document = String(missionControl.document || "").trim();
          const brief = normalizePlaygroundProjectStrategyBrief(
            missionControl.strategyBrief || missionControl.structuredStrategy || missionControl.strategy
          );
          return {
            document,
            brief,
            hasLegacyContent: Boolean(document || hasMeaningfulPlaygroundProjectStrategyBrief(brief)),
          };
        }

        function buildPlaygroundProjectKnowledgeHomeMarkdown(projectRecord) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const legacy = getPlaygroundLegacyProjectStrategySnapshot(projectRecord);
          if (legacy.document) {
            return legacy.document;
          }
          const newline = String.fromCharCode(10);
          const projectGoal = String(normalizedProject.description || "").trim();
          const brief = legacy.brief;
          const sections = [
            "# Project Strategy",
            projectGoal ? ("## Goal" + newline + projectGoal) : "",
            brief.inScope.length ? ("## In scope" + newline + brief.inScope.map((item) => "- " + item).join(newline)) : "",
            brief.outOfScope.length ? ("## Out of scope" + newline + brief.outOfScope.map((item) => "- " + item).join(newline)) : "",
            brief.successCriteria.length ? ("## Success criteria" + newline + brief.successCriteria.map((item) => "- " + item).join(newline)) : "",
            brief.risks.length ? ("## Risks and assumptions" + newline + brief.risks.map((item) => "- " + item).join(newline)) : "",
            brief.decisions.length ? ("## Decisions" + newline + brief.decisions.map((item) => "- " + item).join(newline)) : "",
          ].filter(Boolean);
          return sections.join(newline + newline) + newline;
        }

        async function requestPlaygroundKnowledgeJson(path, init = {}, fallbackMessage = "Knowledge request failed.") {
          const response = await fetch(backendUrl + path, {
            credentials: "include",
            cache: "no-store",
            ...init,
            headers: {
              ...requestHeaders,
              ...(init.body ? { "Content-Type": "application/json" } : {}),
              ...(init.headers || {}),
            },
          });
          const raw = await response.text().catch(() => "");
          let data = {};
          try {
            data = raw ? JSON.parse(raw) : {};
          } catch {
            data = { message: raw };
          }
          if (!response.ok) {
            throw new Error(data?.message || data?.error || fallbackMessage);
          }
          return data;
        }

        async function getPlaygroundKnowledgeLibrary(libraryId) {
          const normalizedLibraryId = String(libraryId || "").trim();
          if (!normalizedLibraryId) {
            return null;
          }
          const data = await requestPlaygroundKnowledgeJson(
            "/knowledge/" + encodeURIComponent(normalizedLibraryId),
            {},
            "Failed to load the project Knowledge library."
          );
          return data?.library && typeof data.library === "object" ? data.library : null;
        }

        function isPlaygroundKnowledgeLibraryForProject(library, projectId) {
          if (!library || typeof library !== "object") {
            return false;
          }
          const metadata = library.metadata && typeof library.metadata === "object" && !Array.isArray(library.metadata)
            ? library.metadata
            : {};
          return String(metadata.projectId || "").trim() === String(projectId || "").trim()
            && ["project_knowledge", "project_strategy_and_documentation"].includes(String(metadata.purpose || "project_knowledge").trim());
        }

        async function findPlaygroundProjectKnowledgeLibrary(projectRecord) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const linkedLibraryId = getPlaygroundProjectKnowledgeLibraryId(projectRecord);
          if (linkedLibraryId) {
            try {
              const linkedLibrary = await getPlaygroundKnowledgeLibrary(linkedLibraryId);
              if (linkedLibrary?.id) {
                return linkedLibrary;
              }
            } catch {}
          }
          const data = await requestPlaygroundKnowledgeJson(
            "/knowledge",
            {},
            "Failed to find the project Knowledge library."
          );
          const libraries = Array.isArray(data?.libraries)
            ? data.libraries
            : Array.isArray(data?.data)
              ? data.data
              : [];
          return libraries.find((library) => isPlaygroundKnowledgeLibraryForProject(library, normalizedProject.id)) || null;
        }

        async function linkPlaygroundProjectKnowledgeLibrary(projectRecord, library) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          if (!normalizedProject.id || !library?.id) {
            return normalizedProject;
          }
          const knowledgeMetadata = {
            schemaVersion: "computer_agents_project_knowledge_v1",
            libraryId: String(library.id),
            libraryName: String(library.name || "Project Knowledge"),
            purpose: "project_knowledge",
            updatedAt: new Date().toISOString(),
          };
          const updatedProject = await persistProjectMissionControlRecord(normalizedProject.id, {
            knowledgeLibraryId: knowledgeMetadata.libraryId,
            knowledgeLibraryName: knowledgeMetadata.libraryName,
            updatedAt: new Date().toISOString(),
          }, {
            quiet: true,
            refreshBaseProject: true,
            projectOverrides: {
              knowledgeLibraryId: knowledgeMetadata.libraryId,
            },
            metadataOverrides: (baseProject) => ({
              knowledgeLibraryId: knowledgeMetadata.libraryId,
              knowledgeLibraryName: knowledgeMetadata.libraryName,
              knowledge: knowledgeMetadata,
              linkedResources: reconcilePlaygroundProjectKnowledgeLinkedResources(baseProject, library),
            }),
          });
          return updatedProject?.id ? normalizePlaygroundProjectRecord(updatedProject) : normalizedProject;
        }

        async function ensurePlaygroundProjectKnowledgeLibrary(projectRecord, options = {}) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const projectId = String(normalizedProject.id || "").trim();
          if (!projectId) {
            throw new Error("Save the project before preparing its Knowledge library.");
          }
          const pending = projectKnowledgeLibraryEnsurePromisesRef.current.get(projectId);
          if (pending) {
            const pendingResult = await pending;
            return options.returnProject === true ? pendingResult : pendingResult.library;
          }
          const promise = (async () => {
            let library = await findPlaygroundProjectKnowledgeLibrary(projectRecord);
            if (!library?.id) {
              const projectName = String(normalizedProject.name || "Project").trim() || "Project";
              const data = await requestPlaygroundKnowledgeJson(
                "/knowledge",
                {
                  method: "POST",
                  body: JSON.stringify({
                    name: projectName + " Knowledge",
                    description: "Strategy, decisions, architecture, runbooks, research, handoffs, and durable documentation for " + projectName + ".",
                    homeTitle: "Project Strategy",
                    homeMarkdown: buildPlaygroundProjectKnowledgeHomeMarkdown(projectRecord),
                    metadata: {
                      schemaVersion: "computer_agents_project_knowledge_v1",
                      projectId,
                      projectName,
                      projectIcon: getPlaygroundProjectIconId(normalizedProject.icon),
                      projectColor: String(normalizedProject.color || "#79d0ff").trim() || "#79d0ff",
                      projectType: String(normalizedProject.projectType || normalizedProject.type || "blank").trim() || "blank",
                      purpose: "project_knowledge",
                      managedBy: "mission_control",
                    },
                  }),
                },
                "Failed to create the project Knowledge library."
              );
              library = data?.library && typeof data.library === "object" ? data.library : null;
            }
            if (!library?.id) {
              throw new Error("The project Knowledge library could not be prepared.");
            }
            let linkedProject = normalizedProject;
            if (!hasPlaygroundProjectKnowledgeResourceLink(projectRecord, library)) {
              linkedProject = await linkPlaygroundProjectKnowledgeLibrary(normalizedProject, library);
            }
            const refreshedLibrary = await getPlaygroundKnowledgeLibrary(library.id).catch(() => library);
            return {
              library: refreshedLibrary,
              project: linkedProject,
            };
          })();
          projectKnowledgeLibraryEnsurePromisesRef.current.set(projectId, promise);
          try {
            const result = await promise;
            return options.returnProject === true ? result : result.library;
          } finally {
            if (projectKnowledgeLibraryEnsurePromisesRef.current.get(projectId) === promise) {
              projectKnowledgeLibraryEnsurePromisesRef.current.delete(projectId);
            }
          }
        }

        async function ensurePlaygroundProjectKnowledgeResource(projectRecord, options = {}) {
          const attemptCount = Math.max(1, Math.min(4, Math.round(Number(options.attempts) || 1)));
          let lastError = null;
          for (let attempt = 0; attempt < attemptCount; attempt += 1) {
            try {
              return await ensurePlaygroundProjectKnowledgeLibrary(projectRecord, {
                returnProject: options.returnProject === true,
              });
            } catch (error) {
              lastError = error;
              if (attempt + 1 >= attemptCount) {
                break;
              }
              await new Promise((resolve) => window.setTimeout(resolve, 150 * Math.pow(2, attempt)));
            }
          }
          throw lastError || new Error("The project Knowledge library could not be prepared.");
        }

        const selectedProjectKnowledgeResourceSignature = (() => {
          if (!selectedProject?.id) {
            return "";
          }
          const metadata = selectedProject.metadata && typeof selectedProject.metadata === "object" && !Array.isArray(selectedProject.metadata)
            ? selectedProject.metadata
            : {};
          const knowledge = metadata.knowledge && typeof metadata.knowledge === "object" && !Array.isArray(metadata.knowledge)
            ? metadata.knowledge
            : {};
          const strategyResourceIds = getPlaygroundProjectLinkedResources(selectedProject)
            .filter((resource) => isPlaygroundProjectStrategyKnowledgeResource(resource))
            .map((resource) => String(resource.id || resource.resourceId || resource.libraryId || "").trim())
            .filter(Boolean)
            .sort();
          return [
            String(selectedProject.id || "").trim(),
            getPlaygroundProjectKnowledgeLibraryId(selectedProject),
            String(metadata.knowledgeLibraryId || "").trim(),
            String(knowledge.libraryId || "").trim(),
            strategyResourceIds.join(","),
          ].join("|");
        })();

        useEffect(() => {
          if (!selectedProject?.id || !isPlaygroundProjectDetailRecord(selectedProject)) {
            return undefined;
          }
          if (hasPlaygroundProjectKnowledgeResourceLink(selectedProject)) {
            return undefined;
          }
          let cancelled = false;
          void ensurePlaygroundProjectKnowledgeResource(selectedProject, {
            attempts: 2,
            returnProject: true,
          }).catch((error) => {
            if (!cancelled) {
              console.warn("[project knowledge] Failed to reconcile the Strategy Knowledge resource.", error);
            }
          });
          return () => {
            cancelled = true;
          };
        }, [backendUrl, requestHeadersKey, selectedProject?.id, selectedProjectKnowledgeResourceSignature]);

        function buildPlaygroundProjectKnowledgeContext(library, source = "project") {
          const libraryId = String(library?.id || "").trim();
          if (!libraryId) {
            return null;
          }
          const versionId = String(library?.currentVersionId || "").trim();
          const versionNumber = Number(library?.currentVersionNumber);
          return {
            schemaVersion: "computer_agents_knowledge_context_v1",
            enabled: true,
            libraryIds: [libraryId],
            bindings: [{
              libraryId,
              ...(versionId ? { versionId } : {}),
              ...(Number.isFinite(versionNumber) && versionNumber > 0 ? { versionNumber: Math.round(versionNumber) } : {}),
            }],
            mode: "propose",
            source: String(source || "project").slice(0, 80),
          };
        }

        function buildPlaygroundProjectKnowledgePromptSection(library) {
          if (!library?.id) {
            return "Project Knowledge: unavailable. Stop and report this rather than storing strategy or documentation in project metadata.";
          }
          const documents = Array.isArray(library.documents) ? library.documents.filter((document) => document && !document.archived) : [];
          const documentLines = documents.slice(0, 50).map((document) => {
            const kind = normalizePlaygroundProjectKnowledgeDocumentKind(document?.provenance?.documentKind || document?.provenance?.kind);
            return "- " + String(document.title || document.name || "Untitled document")
              + " [" + String(document.id || "unknown") + "; " + kind + "]";
          });
          const newline = String.fromCharCode(10);
          return [
            "Project Knowledge library (the durable source of truth for strategy and documentation):",
            "- Library: " + String(library.name || "Project Knowledge") + " (" + String(library.id) + ")",
            "- Access mode: propose. Read current documents before planning and submit reviewable document updates instead of writing strategy into project fields.",
            documentLines.length ? "Current documents:" + newline + documentLines.join(newline) : "Current documents: none yet.",
            "Knowledge operating rules:",
            "- Keep Project Strategy current in this library; never store a strategy document or structured strategy brief in project metadata.",
            "- Create or update durable documentation whenever work establishes architecture, decisions, interfaces, runbooks, research, troubleshooting knowledge, or handoff context.",
            "- Prefer updating an existing relevant document over creating a duplicate. Use explicit titles, useful summaries, and complete standalone markdown.",
            "- Do not treat tickets, chat messages, or transient working logs as durable documentation.",
          ].join(newline);
        }

        function findPlaygroundKnowledgeDocumentForUpdate(library, candidate) {
          const documents = Array.isArray(library?.documents) ? library.documents.filter((document) => document && !document.archived) : [];
          const requestedId = String(candidate?.documentId || "").trim();
          if (requestedId) {
            const exact = documents.find((document) => String(document?.id || "").trim() === requestedId);
            if (exact) return exact;
          }
          const normalizedTitle = String(candidate?.title || "").trim().toLowerCase();
          if (normalizedTitle) {
            const exactTitle = documents.find((document) => (
              String(document?.title || document?.name || "").trim().toLowerCase() === normalizedTitle
            ));
            if (exactTitle) return exactTitle;
          }
          const kind = normalizePlaygroundProjectKnowledgeDocumentKind(candidate?.kind);
          if (kind === "strategy") {
            return documents.find((document) => {
              const explicitKind = document?.provenance?.documentKind || document?.provenance?.kind;
              return explicitKind
                && normalizePlaygroundProjectKnowledgeDocumentKind(explicitKind) === "strategy";
            }) || null;
          }
          return null;
        }

        async function applyPlaygroundMissionControlKnowledgeDocuments(options = {}) {
          const projectRecord = normalizePlaygroundProjectRecord(options.projectRecord);
          const library = await getPlaygroundKnowledgeLibrary(options.library?.id || getPlaygroundProjectKnowledgeLibraryId(projectRecord));
          if (!library?.id) {
            throw new Error("Project Knowledge is unavailable.");
          }
          const documents = normalizePlaygroundMissionControlKnowledgeDocuments(options.documents);
          if (!documents.length) {
            throw new Error("Mission Control finished without durable Knowledge documentation.");
          }
          let workingLibrary = library;
          const proposals = [];
          for (const document of documents) {
            const existing = findPlaygroundKnowledgeDocumentForUpdate(workingLibrary, document);
            const operation = existing?.id ? "update_document" : "create_document";
            const body = {
              ...(operation === "update_document" ? { operation } : {}),
              ...(existing?.id ? { documentId: existing.id } : {}),
              ...(workingLibrary.currentVersionId ? { baseVersionId: workingLibrary.currentVersionId } : {}),
              ...(existing?.currentRevisionId || existing?.revisionId
                ? { baseRevisionId: existing.currentRevisionId || existing.revisionId }
                : {}),
              title: document.title,
              summary: document.summary,
              markdown: document.markdown,
              provenance: {
                schemaVersion: "computer_agents_project_documentation_v1",
                source: "mission_control",
                projectId: projectRecord.id,
                projectName: projectRecord.name || "Project",
                documentKind: document.kind,
                threadId: String(options.threadId || ""),
              },
              threadId: String(options.threadId || ""),
            };
            const data = await requestPlaygroundKnowledgeJson(
              "/knowledge/" + encodeURIComponent(library.id) + "/proposals",
              { method: "POST", body: JSON.stringify(body) },
              "Failed to save Mission Control documentation to Knowledge."
            );
            proposals.push(data?.proposal || data?.data || data);
            if (data?.library && typeof data.library === "object") {
              workingLibrary = data.library;
            } else {
              workingLibrary = await getPlaygroundKnowledgeLibrary(library.id).catch(() => workingLibrary);
            }
          }
          return { library: workingLibrary, proposals };
        }

`;
