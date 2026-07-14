export const METRONOME_APP_TEAM_SHARING_SCRIPT = `
        function getTeamPageMetronomeWorkflowId(workflow) {
          const source = workflow && typeof workflow === "object" && !Array.isArray(workflow) ? workflow : {};
          return String(
            source.id
            || source.workflowId
            || source.workflow_id
            || source.metronomeId
            || source.metronome_id
            || source.resourceId
            || source.resource_id
            || ""
          ).trim();
        }

        function findTeamPageMetronomeWorkflowRecord(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) {
            return null;
          }
          const candidates = [];
          (Array.isArray(teamPageMetronomeWorkflows) ? teamPageMetronomeWorkflows : []).forEach((workflow) => {
            candidates.push(workflow);
          });
          Object.values(teamPageProjectResourceIndexes || {}).forEach((entry) => {
            const data = entry?.data && typeof entry.data === "object" && !Array.isArray(entry.data) ? entry.data : null;
            if (!data) {
              return;
            }
            ["metronomes", "workflows", "schedules"].forEach((key) => {
              if (Array.isArray(data[key])) {
                data[key].forEach((workflow) => candidates.push(workflow));
              }
            });
          });
          return candidates.find((workflow) => getTeamPageMetronomeWorkflowId(workflow) === normalizedWorkflowId) || null;
        }

        function getTeamPageMetronomeApiWorkflowRecord(data) {
          const source = data && typeof data === "object" && !Array.isArray(data) ? data : {};
          const candidate = source.data && typeof source.data === "object" && !Array.isArray(source.data)
            ? source.data
            : source.metronome && typeof source.metronome === "object" && !Array.isArray(source.metronome)
              ? source.metronome
              : source.workflow && typeof source.workflow === "object" && !Array.isArray(source.workflow)
                ? source.workflow
                : source;
          return candidate && typeof candidate === "object" && !Array.isArray(candidate) ? candidate : null;
        }

        function getTeamPageMetronomeVersionArray(data) {
          const source = data && typeof data === "object" && !Array.isArray(data) ? data : {};
          if (Array.isArray(source.data)) return source.data;
          if (Array.isArray(source.versions)) return source.versions;
          if (Array.isArray(source.deployments)) return source.deployments;
          if (Array.isArray(source.items)) return source.items;
          if (Array.isArray(data)) return data;
          return [];
        }

        function getTeamPageMetronomeGraphVersionSortValue(version, fallbackIndex = 0) {
          const parsedVersion = Number(version?.version || version?.versionNumber || version?.version_number || 0) || 0;
          if (parsedVersion) return parsedVersion * 1000000000000;
          const parsedTime = new Date(version?.updatedAt || version?.updated_at || version?.publishedAt || version?.published_at || version?.createdAt || version?.created_at || "").getTime();
          return Number.isFinite(parsedTime) ? parsedTime : fallbackIndex;
        }

        function selectTeamPageMetronomeGraphVersion(versions, workflow) {
          const metadata = workflow?.metadata && typeof workflow.metadata === "object" && !Array.isArray(workflow.metadata) ? workflow.metadata : {};
          const preferredDeploymentId = String(
            workflow?.restoredFromDeploymentId
            || workflow?.restored_from_deployment_id
            || workflow?.activeDeploymentId
            || workflow?.active_deployment_id
            || metadata.restoredFromDeploymentId
            || metadata.restored_from_deployment_id
            || metadata.activeDeploymentId
            || metadata.active_deployment_id
            || ""
          ).trim();
          const candidates = (Array.isArray(versions) ? versions : [])
            .map((version, index) => ({ version, index, definition: getPlaygroundMetronomeWorkflowDefinition(version) }))
            .filter((entry) => entry.version && Array.isArray(entry.definition.nodes) && entry.definition.nodes.length);
          if (!candidates.length) return null;
          return (preferredDeploymentId
            ? candidates.find((entry) => String(entry.version?.id || entry.version?.deploymentId || entry.version?.deployment_id || "").trim() === preferredDeploymentId)
            : null)
            || candidates.find((entry) => String(entry.version?.status || "").trim().toLowerCase() === "active")
            || candidates.sort((left, right) => getTeamPageMetronomeGraphVersionSortValue(right.version, right.index) - getTeamPageMetronomeGraphVersionSortValue(left.version, left.index))[0]
            || null;
        }

        function mergeTeamPageMetronomeWorkflowGraphSnapshot(workflow, graphSource, versions = []) {
          const base = workflow && typeof workflow === "object" && !Array.isArray(workflow) ? workflow : {};
          const source = graphSource && typeof graphSource === "object" && !Array.isArray(graphSource) ? graphSource : {};
          const graph = getPlaygroundMetronomeWorkflowDefinition(source);
          if (!Array.isArray(graph.nodes) || !graph.nodes.length) {
            return base;
          }
          const baseDefinition = base.definition && typeof base.definition === "object" && !Array.isArray(base.definition) ? base.definition : {};
          const sourceDefinition = source.definition && typeof source.definition === "object" && !Array.isArray(source.definition) ? source.definition : {};
          const baseMetadata = base.metadata && typeof base.metadata === "object" && !Array.isArray(base.metadata) ? base.metadata : {};
          const sourceMetadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata) ? source.metadata : {};
          const deploymentId = String(source.id || source.deploymentId || source.deployment_id || sourceMetadata.activeDeploymentId || sourceMetadata.active_deployment_id || "").trim();
          return {
            ...base,
            ...source,
            id: getTeamPageMetronomeWorkflowId(base) || getTeamPageMetronomeWorkflowId(source),
            name: source.name || source.title || base.name || base.title,
            projectId: source.projectId || source.project_id || base.projectId || base.project_id || sourceMetadata.projectId || baseMetadata.projectId || "",
            projectName: source.projectName || source.project_name || base.projectName || base.project_name || sourceMetadata.projectName || baseMetadata.projectName || "",
            metadata: {
              ...baseMetadata,
              ...sourceMetadata,
              ...(Array.isArray(versions) && versions.length ? { deployments: versions, metronomeDeployments: versions } : {}),
              ...(deploymentId ? { activeDeploymentId: deploymentId, active_deployment_id: deploymentId } : {}),
            },
            definition: {
              ...baseDefinition,
              ...sourceDefinition,
              nodes: graph.nodes,
              edges: Array.isArray(graph.edges) ? graph.edges : [],
            },
            nodes: graph.nodes,
            edges: Array.isArray(graph.edges) ? graph.edges : [],
          };
        }

        function buildTeamPageMetronomeWorkflowRecordFromShare(share) {
          const safeShare = share && typeof share === "object" && !Array.isArray(share) ? share : {};
          const metadata = parseTeamResourceShareMetadata(safeShare);
          const workflow = metadata.workflow && typeof metadata.workflow === "object" && !Array.isArray(metadata.workflow)
            ? metadata.workflow
            : metadata.metronomeWorkflow && typeof metadata.metronomeWorkflow === "object" && !Array.isArray(metadata.metronomeWorkflow)
              ? metadata.metronomeWorkflow
              : metadata.metronome && typeof metadata.metronome === "object" && !Array.isArray(metadata.metronome)
                ? metadata.metronome
                : {};
          const definition = workflow.definition && typeof workflow.definition === "object" && !Array.isArray(workflow.definition)
            ? workflow.definition
            : metadata.definition && typeof metadata.definition === "object" && !Array.isArray(metadata.definition)
              ? metadata.definition
              : metadata.workflowGraphSnapshot?.definition && typeof metadata.workflowGraphSnapshot.definition === "object" && !Array.isArray(metadata.workflowGraphSnapshot.definition)
                ? metadata.workflowGraphSnapshot.definition
                : metadata.graphSnapshot?.definition && typeof metadata.graphSnapshot.definition === "object" && !Array.isArray(metadata.graphSnapshot.definition)
                  ? metadata.graphSnapshot.definition
                  : {};
          const graphSnapshot = metadata.workflowGraphSnapshot && typeof metadata.workflowGraphSnapshot === "object" && !Array.isArray(metadata.workflowGraphSnapshot)
            ? metadata.workflowGraphSnapshot
            : metadata.graphSnapshot && typeof metadata.graphSnapshot === "object" && !Array.isArray(metadata.graphSnapshot)
              ? metadata.graphSnapshot
              : {};
          const nodes = Array.isArray(workflow.nodes)
            ? workflow.nodes
            : Array.isArray(definition.nodes)
              ? definition.nodes
              : Array.isArray(metadata.nodes)
                ? metadata.nodes
                : Array.isArray(graphSnapshot.nodes)
                  ? graphSnapshot.nodes
                  : [];
          const edges = Array.isArray(workflow.edges)
            ? workflow.edges
            : Array.isArray(definition.edges)
              ? definition.edges
              : Array.isArray(metadata.edges)
                ? metadata.edges
                : Array.isArray(graphSnapshot.edges)
                  ? graphSnapshot.edges
                  : [];
          return {
            ...workflow,
            id: String(workflow.id || safeShare.resourceId || safeShare.resource_id || "").trim(),
            name: String(workflow.name || workflow.title || getTeamResourceShareMetadataTitle(safeShare) || safeShare.resourceId || "Metronome Workflow").trim(),
            description: String(workflow.description || metadata.description || "").trim(),
            status: String(workflow.status || metadata.status || "draft").trim() || "draft",
            triggerSummary: String(workflow.triggerSummary || workflow.trigger_summary || metadata.triggerSummary || metadata.trigger_summary || "Manual").trim() || "Manual",
            projectId: String(workflow.projectId || workflow.project_id || metadata.projectId || metadata.project_id || "").trim(),
            projectName: String(workflow.projectName || workflow.project_name || metadata.projectName || metadata.project_name || "").trim(),
            updatedAt: String(workflow.updatedAt || workflow.updated_at || safeShare.updatedAt || safeShare.updated_at || "").trim(),
            metadata,
            definition: {
              ...definition,
              nodes,
              edges,
            },
            nodes,
            edges,
          };
        }

        async function loadTeamPageMetronomeWorkflowForShare(workflowId) {
          const normalizedWorkflowId = String(workflowId || "").trim();
          if (!normalizedWorkflowId) return null;
          let workflow = findTeamPageMetronomeWorkflowRecord(normalizedWorkflowId) || { id: normalizedWorkflowId };
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/metronomes/" + encodeURIComponent(normalizedWorkflowId), {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000);
            if (response.ok) {
              const detail = getTeamPageMetronomeApiWorkflowRecord(data);
              if (detail) {
                workflow = {
                  ...workflow,
                  ...detail,
                  id: getTeamPageMetronomeWorkflowId(detail) || normalizedWorkflowId,
                };
              }
            }
          } catch (error) {
            console.warn("[teams] Failed to load Metronome workflow detail before sharing", error);
          }
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/metronomes/" + encodeURIComponent(normalizedWorkflowId) + "/versions", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000);
            if (response.ok) {
              const versions = getTeamPageMetronomeVersionArray(data);
              const selectedVersion = selectTeamPageMetronomeGraphVersion(versions, workflow);
              if (selectedVersion?.version) {
                workflow = mergeTeamPageMetronomeWorkflowGraphSnapshot(workflow, selectedVersion.version, versions);
              } else if (versions.length) {
                const workflowMetadata = workflow?.metadata && typeof workflow.metadata === "object" && !Array.isArray(workflow.metadata) ? workflow.metadata : {};
                workflow = {
                  ...workflow,
                  deployments: versions,
                  metronomeDeployments: versions,
                  versions,
                  metadata: {
                    ...workflowMetadata,
                    deployments: versions,
                    metronomeDeployments: versions,
                    versions,
                  },
                };
              }
            }
          } catch (error) {
            console.warn("[teams] Failed to load Metronome workflow versions before sharing", error);
          }
          return workflow;
        }

        function buildTeamPageMetronomeWorkflowShareMetadata(workflowId, workflowOverride = null) {
          const workflow = workflowOverride || findTeamPageMetronomeWorkflowRecord(workflowId);
          if (!workflow) {
            return {
              resourceType: "metronome_workflow",
              resourceKind: "metronome_workflow",
              workflow: {
                id: String(workflowId || "").trim(),
                name: "Metronome Workflow",
              },
            };
          }
          const normalizedWorkflow = normalizePlaygroundCalendarMetronomeWorkflow(workflow);
          const source = workflow && typeof workflow === "object" && !Array.isArray(workflow) ? workflow : {};
          const metadata = source.metadata && typeof source.metadata === "object" && !Array.isArray(source.metadata)
            ? source.metadata
            : {};
          const sourceCreator = source.creator && typeof source.creator === "object" && !Array.isArray(source.creator)
            ? source.creator
            : metadata.creator && typeof metadata.creator === "object" && !Array.isArray(metadata.creator)
              ? metadata.creator
              : {};
          const creatorUserId = String(
            sourceCreator.userId
            || sourceCreator.user_id
            || source.creatorUserId
            || source.creator_user_id
            || metadata.creatorUserId
            || metadata.creator_user_id
            || sessionState.userId
            || ""
          ).trim();
          const creatorName = String(
            sourceCreator.name
            || sourceCreator.displayName
            || sourceCreator.display_name
            || source.creatorName
            || source.creator_name
            || metadata.creatorName
            || metadata.creator_name
            || accountName
            || accountEmail
            || ""
          ).trim();
          const creatorAvatarUrl = String(
            sourceCreator.avatarUrl
            || sourceCreator.avatarURL
            || sourceCreator.photoUrl
            || sourceCreator.photoURL
            || source.creatorAvatarUrl
            || source.creator_avatar_url
            || metadata.creatorAvatarUrl
            || metadata.creator_avatar_url
            || accountAvatarUrl
            || ""
          ).trim();
          const creator = {
            type: String(sourceCreator.type || sourceCreator.kind || "user").trim() || "user",
            id: String(sourceCreator.id || creatorUserId || accountEmail || accountName || "").trim(),
            userId: creatorUserId,
            name: creatorName,
            email: String(sourceCreator.email || source.creatorEmail || source.creator_email || metadata.creatorEmail || metadata.creator_email || accountEmail || "").trim(),
            avatarUrl: creatorAvatarUrl,
            photoUrl: creatorAvatarUrl,
          };
          const description = String(
            source.description
            || source.summary
            || metadata.description
            || metadata.summary
            || ""
          ).trim();
          const triggerSummary = String(
            source.triggerSummary
            || source.trigger_summary
            || metadata.triggerSummary
            || metadata.trigger_summary
            || source.schedule
            || source.cron
            || source.cronExpression
            || source.cron_expression
            || "Manual"
          ).trim() || "Manual";
          const workflowDefinition = {
            version: 1,
            name: normalizedWorkflow.name || String(source.name || source.title || "Untitled Metronome").trim() || "Untitled Metronome",
            metadata: {
              ...(metadata && typeof metadata === "object" && !Array.isArray(metadata) ? metadata : {}),
              ...(normalizedWorkflow.projectId ? { projectId: normalizedWorkflow.projectId, project_id: normalizedWorkflow.projectId } : {}),
              ...(normalizedWorkflow.projectName ? { projectName: normalizedWorkflow.projectName, project_name: normalizedWorkflow.projectName } : {}),
            },
            nodes: Array.isArray(normalizedWorkflow.nodes) ? normalizedWorkflow.nodes : [],
            edges: Array.isArray(normalizedWorkflow.edges) ? normalizedWorkflow.edges : [],
          };
          const workflowGraphSnapshot = {
            definition: workflowDefinition,
            nodes: workflowDefinition.nodes,
            edges: workflowDefinition.edges,
          };
          const workflowVersions = getTeamPageMetronomeVersionArray(source);
          return {
            resourceType: "metronome_workflow",
            resourceKind: "metronome_workflow",
            definition: workflowDefinition,
            nodes: workflowDefinition.nodes,
            edges: workflowDefinition.edges,
            workflowGraphSnapshot,
            graphSnapshot: workflowGraphSnapshot,
            deployments: workflowVersions,
            metronomeDeployments: workflowVersions,
            versions: workflowVersions,
            creator,
            creatorType: creator.type,
            creator_type: creator.type,
            ...(creator.id ? { creatorId: creator.id, creator_id: creator.id } : {}),
            ...(creator.userId ? { creatorUserId: creator.userId, creator_user_id: creator.userId } : {}),
            ...(creator.name ? { creatorName: creator.name, creator_name: creator.name } : {}),
            ...(creator.email ? { creatorEmail: creator.email, creator_email: creator.email } : {}),
            ...(creator.avatarUrl ? { creatorAvatarUrl: creator.avatarUrl, creator_avatar_url: creator.avatarUrl } : {}),
            workflow: {
              id: normalizedWorkflow.id || String(workflowId || "").trim(),
              name: normalizedWorkflow.name || String(source.name || source.title || "Untitled Metronome").trim() || "Untitled Metronome",
              description,
              status: normalizedWorkflow.status || String(source.status || source.state || "draft").trim() || "draft",
              triggerSummary,
              projectId: normalizedWorkflow.projectId || String(source.projectId || source.project_id || metadata.projectId || metadata.project_id || "").trim(),
              projectName: normalizedWorkflow.projectName || String(source.projectName || source.project_name || metadata.projectName || metadata.project_name || "").trim(),
              updatedAt: normalizedWorkflow.updatedAt || String(source.updatedAt || source.updated_at || metadata.updatedAt || metadata.updated_at || "").trim(),
              nodeCount: workflowDefinition.nodes.length,
              edgeCount: workflowDefinition.edges.length,
              definition: workflowDefinition,
              nodes: workflowDefinition.nodes,
              edges: workflowDefinition.edges,
              workflowGraphSnapshot,
              graphSnapshot: workflowGraphSnapshot,
              deployments: workflowVersions,
              metronomeDeployments: workflowVersions,
              versions: workflowVersions,
              creator,
              creatorType: creator.type,
              creator_type: creator.type,
              ...(creator.id ? { creatorId: creator.id, creator_id: creator.id } : {}),
              ...(creator.userId ? { creatorUserId: creator.userId, creator_user_id: creator.userId } : {}),
              ...(creator.name ? { creatorName: creator.name, creator_name: creator.name } : {}),
              ...(creator.email ? { creatorEmail: creator.email, creator_email: creator.email } : {}),
              ...(creator.avatarUrl ? { creatorAvatarUrl: creator.avatarUrl, creator_avatar_url: creator.avatarUrl } : {}),
            },
          };
        }

`;
