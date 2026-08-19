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
          const currentMissionControl = getPlaygroundProjectMissionControlRecord(normalizedProject);
          const updatedProject = await persistProjectMissionControlRecord(normalizedProject.id, {
            ...currentMissionControl,
            knowledgeLibraryId: knowledgeMetadata.libraryId,
            knowledgeLibraryName: knowledgeMetadata.libraryName,
            updatedAt: new Date().toISOString(),
          }, {
            quiet: true,
            refreshBaseProject: false,
            projectOverrides: {
              knowledgeLibraryId: knowledgeMetadata.libraryId,
            },
            metadataOverrides: {
              knowledgeLibraryId: knowledgeMetadata.libraryId,
              knowledge: knowledgeMetadata,
            },
          });
          return updatedProject?.id ? normalizePlaygroundProjectRecord(updatedProject) : normalizedProject;
        }

        async function ensurePlaygroundProjectKnowledgeLibrary(projectRecord) {
          const normalizedProject = normalizePlaygroundProjectRecord(projectRecord);
          const projectId = String(normalizedProject.id || "").trim();
          if (!projectId) {
            throw new Error("Save the project before preparing its Knowledge library.");
          }
          const pending = projectKnowledgeLibraryEnsurePromisesRef.current.get(projectId);
          if (pending) {
            return pending;
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
            if (getPlaygroundProjectKnowledgeLibraryId(projectRecord) !== String(library.id)) {
              await linkPlaygroundProjectKnowledgeLibrary(normalizedProject, library);
            }
            return getPlaygroundKnowledgeLibrary(library.id).catch(() => library);
          })();
          projectKnowledgeLibraryEnsurePromisesRef.current.set(projectId, promise);
          try {
            return await promise;
          } finally {
            if (projectKnowledgeLibraryEnsurePromisesRef.current.get(projectId) === promise) {
              projectKnowledgeLibraryEnsurePromisesRef.current.delete(projectId);
            }
          }
        }

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
