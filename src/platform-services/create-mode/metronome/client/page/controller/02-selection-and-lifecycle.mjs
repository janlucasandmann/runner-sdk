export const METRONOME_CONTROLLER_02_FRAGMENT = String.raw`                }
              );
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after save", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : nextDeployments,
                updatedVersion.id || updatedDeployment.id
              );
              resetActiveMetronomeVisitBaseline(
                hydratedWorkflow,
                hydratedWorkflow.nodes || persistedNodes,
                hydratedWorkflow.edges || persistedEdges
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to save current workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeMetronomeEditorWorkflow, activeWorkflow, activeWorkflowId, activeWorkflowDeployment, nodes, edges, saveActiveWorkflowVersion, replaceMetronomeWorkflowInEditableState]);

          const openCreateWorkflowVersionModal = useCallback(() => {
            if (!activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const nextVersion = existingDeployments.reduce(
              (maxVersion, deployment) => Math.max(
                maxVersion,
                normalizeMetronomeVersionNumber(deployment.version, 0)
              ),
              -1
            ) + 1;
            setWorkflowVersionNameDraft(formatMetronomeVersionLabel(nextVersion));
            setWorkflowVersionDescriptionDraft("");
            setIsWorkflowVersionDescriptionEditing(false);
            openWorkflowVersionModal({ mode: "create" });
          }, [activeWorkflow, openWorkflowVersionModal]);

          const openEditWorkflowVersionModal = useCallback((deploymentId) => {
            if (!activeWorkflow) return;
            const normalizedDeploymentId = String(deploymentId || "").trim();
            const targetDeployment = readMetronomeWorkflowDeployments(activeWorkflow).find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            setWorkflowVersionNameDraft(formatMetronomeVersionLabel(targetDeployment.version));
            setWorkflowVersionDescriptionDraft(String(targetDeployment.description || "").trim());
            setIsWorkflowVersionDescriptionEditing(false);
            openWorkflowVersionModal({ mode: "edit", deploymentId: targetDeployment.id });
          }, [activeWorkflow, openWorkflowVersionModal]);

          const updateWorkflowVersionDetails = useCallback(async (deploymentId, versionDetails = {}) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            if (existingDeployments.length <= 1) return;
            const targetDeployment = existingDeployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const now = new Date().toISOString();
            const nextDeployments = normalizeMetronomeDeployments(existingDeployments.map((deployment) => {
              if (deployment.id !== normalizedDeploymentId) return deployment;
              return normalizeMetronomeDeploymentVersion({
                ...deployment,
                label: formatMetronomeVersionLabel(deployment.version),
                description: String(versionDetails?.description || "").trim().slice(0, 240),
                updatedAt: now,
                updated_at: now,
              });
            }));
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || activeWorkflow.metadata?.active_deployment_id || "").trim();
            const activeDeployment = nextDeployments.find((deployment) => deployment.id === activeDeploymentId)
              || nextDeployments.find((deployment) => deployment.status === "active")
              || null;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const selectedDeployment = nextDeployments.find((deployment) => deployment.id === selectedDeploymentId)
              || (selectedDeploymentId ? null : activeDeployment);
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: activeDeployment?.id || "",
              active_deployment_id: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              active_deployment_version: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              published_at: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              restoredFromDeploymentId: selectedDeployment?.id || selectedDeploymentId || "",
              restored_from_deployment_id: selectedDeployment?.id || selectedDeploymentId || "",
              restoredFromDeploymentVersion: selectedDeployment?.version || activeWorkflow.metadata?.restoredFromDeploymentVersion || 0,
              restored_from_deployment_version: selectedDeployment?.version || activeWorkflow.metadata?.restored_from_deployment_version || 0,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              deployments: nextDeployments,
              activeDeploymentId: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              const updatedVersion = await updateMetronomeVersionApi(
                workflowIdForVersion,
                normalizedDeploymentId,
                nextWorkflow,
                targetDeployment.nodes,
                targetDeployment.edges,
                {
                  description: String(versionDetails?.description || "").trim().slice(0, 240),
                },
                { includeDefinition: false }
              );
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after edit", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : nextDeployments,
                updatedVersion.id || normalizedDeploymentId
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to edit workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, replaceMetronomeWorkflowInEditableState]);

          const deleteWorkflowVersion = useCallback(async (deploymentId) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const existingDeployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const targetDeployment = existingDeployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const targetTitle = formatMetronomeVersionTitle(
              targetDeployment.version,
              targetDeployment.description
            );
            const confirmed = window.confirm("Delete \"" + targetTitle + "\"? This version history entry cannot be undone.");
            if (!confirmed) return;
            const nextDeployments = normalizeMetronomeDeployments(existingDeployments.filter((deployment) => deployment.id !== normalizedDeploymentId));
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || activeWorkflow.metadata?.active_deployment_id || "").trim();
            const deletedActiveDeployment = targetDeployment.id === activeDeploymentId || targetDeployment.status === "active";
            const nextActiveDeployment = deletedActiveDeployment
              ? null
              : nextDeployments.find((deployment) => deployment.id === activeDeploymentId)
                || nextDeployments.find((deployment) => deployment.status === "active")
                || null;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const deletedSelectedDeployment = targetDeployment.id === selectedDeploymentId;
            const fallbackSelectedDeployment = nextDeployments.find((deployment) => deployment.id === nextActiveDeployment?.id)
              || nextDeployments[0]
              || null;
            const nextSelectedDeployment = deletedSelectedDeployment
              ? fallbackSelectedDeployment
              : nextDeployments.find((deployment) => deployment.id === selectedDeploymentId) || fallbackSelectedDeployment;
            const nextNodes = deletedSelectedDeployment && nextSelectedDeployment
              ? createMetronomePersistedNodes(nextSelectedDeployment.nodes || nextSelectedDeployment.definition?.nodes || [])
              : createMetronomePersistedNodes(nodes);
            const nextEdges = deletedSelectedDeployment && nextSelectedDeployment
              ? createMetronomePersistedEdges(nextSelectedDeployment.edges || nextSelectedDeployment.definition?.edges || [])
              : createMetronomePersistedEdges(edges);
            const now = new Date().toISOString();
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: nextActiveDeployment?.id || "",
              active_deployment_id: nextActiveDeployment?.id || "",
              activeDeploymentVersion: nextActiveDeployment?.version || 0,
              active_deployment_version: nextActiveDeployment?.version || 0,
              publishedAt: nextActiveDeployment?.publishedAt || "",
              published_at: nextActiveDeployment?.publishedAt || "",
              restoredFromDeploymentId: nextSelectedDeployment?.id || "",
              restored_from_deployment_id: nextSelectedDeployment?.id || "",
              restoredFromDeploymentVersion: nextSelectedDeployment?.version || 0,
              restored_from_deployment_version: nextSelectedDeployment?.version || 0,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: nextActiveDeployment ? activeWorkflow.status : "draft",
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: deriveMetronomeTriggerSummary(nextNodes),
              deployments: nextDeployments,
              activeDeploymentId: nextActiveDeployment?.id || "",
              activeDeploymentVersion: nextActiveDeployment?.version || 0,
              publishedAt: nextActiveDeployment?.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            if (deletedSelectedDeployment) {
              setNodes(nextNodes);
              setEdges(nextEdges);
              setSelectedNodeId("");
            }
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              await deleteMetronomeVersionApi(activeWorkflowId, normalizedDeploymentId);
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after delete", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                savedWorkflow,
                versions.length ? versions : nextDeployments,
                nextSelectedDeployment?.id || ""
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to delete workflow version", error);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              if (deletedSelectedDeployment) {
                setNodes(createMetronomePersistedNodes(activeWorkflow.nodes || []));
                setEdges(createMetronomePersistedEdges(activeWorkflow.edges || []));
              }
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, setNodes, setEdges, replaceMetronomeWorkflowInEditableState]);

          const commitWorkflowVersionModal = useCallback(async () => {
            if (!workflowVersionModal) return;
            const description = workflowVersionDescriptionDraft.trim().slice(0, 240);
            if (workflowVersionModal.mode === "edit") {
              await updateWorkflowVersionDetails(workflowVersionModal.deploymentId, { description });
            } else {
              await saveActiveWorkflowVersion({ description });
            }
            closeWorkflowVersionModal();
          }, [workflowVersionModal, workflowVersionDescriptionDraft, saveActiveWorkflowVersion, updateWorkflowVersionDetails, closeWorkflowVersionModal]);

          const publishMetronomeDeploymentVersion = useCallback(async (deploymentId) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const deployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const targetDeployment = deployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const shouldPublishCurrentEditor = targetDeployment.id === selectedDeploymentId;
            const nextNodes = shouldPublishCurrentEditor
              ? createMetronomePersistedNodes(nodes)
              : createMetronomePersistedNodes(targetDeployment.nodes || targetDeployment.definition?.nodes || []);
            const nextEdges = shouldPublishCurrentEditor
              ? createMetronomePersistedEdges(edges)
              : createMetronomePersistedEdges(targetDeployment.edges || targetDeployment.definition?.edges || []);
            const definitionForPublish = shouldPublishCurrentEditor
              ? createMetronomeWorkflowDefinition(activeWorkflow, nextNodes, nextEdges)
              : targetDeployment.definition && typeof targetDeployment.definition === "object"
                ? targetDeployment.definition
                : createMetronomeWorkflowDefinition(activeWorkflow, nextNodes, nextEdges);
            const canPublish = await validateMetronomeDefinitionForPublishUi(definitionForPublish, { showLoading: true });
            if (!canPublish) return;
            const now = new Date().toISOString();
            const deploymentForPublish = normalizeMetronomeDeploymentVersion({
              ...targetDeployment,
              nodes: nextNodes,
              edges: nextEdges,
              definition: definitionForPublish,
              triggerSummary: deriveMetronomeTriggerSummary(nextNodes),
              nodeCount: nextNodes.length,
              edgeCount: nextEdges.length,
              updatedAt: now,
              updated_at: now,
            });
            const nextDeployments = deployments.map((deployment) => {
              if (deployment.id === targetDeployment.id) {
                return {
                  ...deploymentForPublish,
                  status: "active",
                  publishedAt: now,
                };
              }
              return {
                ...deployment,
                status: deployment.status === "active" ? "superseded" : deployment.status,
              };
            });
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: targetDeployment.id,
              active_deployment_id: targetDeployment.id,
              activeDeploymentVersion: targetDeployment.version,
              active_deployment_version: targetDeployment.version,
              publishedAt: now,
              published_at: now,
              restoredFromDeploymentId: targetDeployment.id,
              restored_from_deployment_id: targetDeployment.id,
              restoredFromDeploymentVersion: targetDeployment.version,
              restored_from_deployment_version: targetDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: "active",
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: deploymentForPublish.triggerSummary || deriveMetronomeTriggerSummary(nextNodes),
              deployments: nextDeployments,
              activeDeploymentId: targetDeployment.id,
              activeDeploymentVersion: targetDeployment.version,
              publishedAt: now,
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const workflowToSave = normalizeMetronomeWorkflow({
                ...nextWorkflow,
                status: activeWorkflow.status || "draft",
                publishedAt: activeWorkflow.publishedAt || "",
              });
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(workflowToSave);
              const workflowIdForVersion = savedWorkflow.id || nextWorkflow.id;
              let versionIdForPublish = targetDeployment.id;
              const targetDeploymentIsPublished = String(targetDeployment.status || "").toLowerCase() === "active"
                || Boolean(String(targetDeployment.publishedAt || "").trim());
              if (!targetDeploymentIsPublished) {
                try {
                  await updateMetronomeVersionApi(
                    workflowIdForVersion,
                    targetDeployment.id,
                    { ...nextWorkflow, id: workflowIdForVersion },
                    nextNodes,
                    nextEdges,
                    {
                      description: deploymentForPublish.description,
                    }
                  );
                } catch (versionUpdateError) {
                  if (versionUpdateError?.status === 404) {
                    const createdVersion = await createMetronomeVersionApi(workflowIdForVersion, { ...nextWorkflow, id: workflowIdForVersion }, nextNodes, nextEdges, {
                      description: deploymentForPublish.description,
                    });
                    versionIdForPublish = createdVersion.id || versionIdForPublish;
                  } else {
                    throw versionUpdateError;
                  }
                }
              }
              const publishedWorkflow = await publishMetronomeVersionApi(
                workflowIdForVersion,
                versionIdForPublish,
                targetDeploymentIsPublished && shouldPublishCurrentEditor
                  ? {
                      definition: definitionForPublish,
                      label: deploymentForPublish.label,
                      description: deploymentForPublish.description,
                    }
                  : {}
              );
              let versions = [];
              try {
                versions = await fetchMetronomeVersionsApi(publishedWorkflow.id || workflowIdForVersion);
              } catch (versionLoadError) {
                console.warn("[Metronome] Failed to refresh versions after publish", versionLoadError);
              }
              const hydratedWorkflow = createMetronomeWorkflowWithVersionList(
                publishedWorkflow,
                versions.length ? versions : nextDeployments,
                versionIdForPublish
              );
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, hydratedWorkflow);
              if (hydratedWorkflow.id && hydratedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(hydratedWorkflow.id);
              }
              await refreshMetronomeDeploymentEvents(hydratedWorkflow.id || publishedWorkflow.id || workflowIdForVersion);
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to publish saved version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setNodes(createMetronomePersistedNodes(activeWorkflow.nodes || []));
              setEdges(createMetronomePersistedEdges(activeWorkflow.edges || []));
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, setNodes, setEdges, refreshMetronomeDeploymentEvents, validateMetronomeDefinitionForPublishUi, replaceMetronomeWorkflowInEditableState]);

          const restoreActiveWorkflowVersion = useCallback(async (deploymentId) => {
            const normalizedDeploymentId = String(deploymentId || "").trim();
            if (!normalizedDeploymentId || !activeWorkflowId || !activeWorkflow) return;
            const deployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const targetDeployment = deployments.find((deployment) => deployment.id === normalizedDeploymentId);
            if (!targetDeployment) return;
            const nextNodes = createMetronomePersistedNodes(targetDeployment.nodes || targetDeployment.definition?.nodes || []);
            const nextEdges = createMetronomePersistedEdges(targetDeployment.edges || targetDeployment.definition?.edges || []);
            const activeDeploymentId = String(activeWorkflow.activeDeploymentId || activeWorkflow.metadata?.activeDeploymentId || "").trim();
            const activeDeployment = deployments.find((deployment) => deployment.id === activeDeploymentId)
              || deployments.find((deployment) => deployment.status === "active")
              || null;
            const now = new Date().toISOString();
            const nextMetadata = {
              ...(activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {}),
              deployments,
              metronomeDeployments: deployments,
              activeDeploymentId: activeDeployment?.id || "",
              active_deployment_id: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              active_deployment_version: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              published_at: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              restoredFromDeploymentId: targetDeployment.id,
              restored_from_deployment_id: targetDeployment.id,
              restoredFromDeploymentVersion: targetDeployment.version,
              restored_from_deployment_version: targetDeployment.version,
            };
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              nodes: nextNodes,
              edges: nextEdges,
              triggerSummary: targetDeployment.triggerSummary || deriveMetronomeTriggerSummary(nextNodes),
              deployments,
              activeDeploymentId: activeDeployment?.id || "",
              activeDeploymentVersion: activeDeployment?.version || 0,
              publishedAt: activeDeployment?.publishedAt || activeWorkflow.publishedAt || "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              resetActiveMetronomeVisitBaseline(savedWorkflow, nextNodes, nextEdges);
              setIsMetronomeCodeDirty(false);
              setMetronomeCodeFilesDraft([]);
              setMetronomeCodeUndoStack([]);
              setMetronomeCodeRedoStack([]);
              setMetronomeCodeRunState({ status: "idle", message: "" });
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, savedWorkflow);
              if (savedWorkflow.id && savedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(savedWorkflow.id);
              }
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to restore workflow version", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              setNodes(createMetronomePersistedNodes(activeWorkflow.nodes || []));
              setEdges(createMetronomePersistedEdges(activeWorkflow.edges || []));
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, setNodes, setEdges, replaceMetronomeWorkflowInEditableState]);

          const revertActiveWorkflowToLastSavedVersion = useCallback(async () => {
            if (!activeWorkflow) return;
            const selectedDeploymentId = readMetronomeSelectedDeploymentId(activeWorkflow);
            const fallbackDeployment = activeWorkflowDeployment || activeWorkflowDeployments[0] || null;
            const deploymentId = selectedDeploymentId || fallbackDeployment?.id || "";
            if (!deploymentId) return;
            await restoreActiveWorkflowVersion(deploymentId);
          }, [activeWorkflow, activeWorkflowDeployment, activeWorkflowDeployments, restoreActiveWorkflowVersion]);

          const requestMetronomeNavigation = useCallback((continuation) => {
            if (typeof continuation !== "function") {
              return false;
            }
            if (typeof onNavigationRequest === "function") {
              return onNavigationRequest(continuation);
            }
            continuation();
            return true;
          }, [onNavigationRequest]);

          const hasUnsavedMetronomeChanges = Boolean(
            isEditor
            && activeWorkflow
            && !isActiveWorkflowBuiltIn
            && activeMetronomeVersionChanges
          );

          useEffect(() => {
            if (typeof onNavigationGuardChange !== "function") {
              return;
            }
            const workflowName = String(activeWorkflow?.name || "").trim() || "this Metronome workflow";
            onNavigationGuardChange(hasUnsavedMetronomeChanges
              ? {
                  id: "metronome-details-unsaved-changes",
                  active: true,
                  title: "Leave without saving?",
                  description: "Your changes to " + workflowName + " have not been saved. If you leave now, they will be lost.",
                  onDiscard: discardActiveMetronomeDraft,
                }
              : null
            );
          }, [activeWorkflow?.id, activeWorkflow?.name, discardActiveMetronomeDraft, hasUnsavedMetronomeChanges, onNavigationGuardChange]);

          useEffect(() => {
            if (typeof onNavigationGuardChange !== "function") {
              return undefined;
            }
            return () => onNavigationGuardChange(null);
          }, [onNavigationGuardChange]);

          const unpublishActiveWorkflow = useCallback(async () => {
            if (!activeWorkflowId || !activeWorkflow) return;
            const deployments = readMetronomeWorkflowDeployments(activeWorkflow);
            const activeDeployment = deployments.find((deployment) => deployment.status === "active")
              || deployments.find((deployment) => deployment.id === String(activeWorkflow.activeDeploymentId || "").trim())
              || null;
            if (!activeDeployment && activeWorkflow.status !== "active") return;
            const confirmed = window.confirm("Unpublish this Metronome workflow? Version history will be kept, but production triggers will stop using it.");
            if (!confirmed) return;
            const now = new Date().toISOString();
            const nextDeployments = deployments.map((deployment) => ({
              ...deployment,
              status: deployment.status === "active" || deployment.id === activeDeployment?.id ? "unpublished" : deployment.status,
            }));
            const baseMetadata = activeWorkflow.metadata && typeof activeWorkflow.metadata === "object" ? activeWorkflow.metadata : {};
            const nextMetadata = {
              ...baseMetadata,
              deployments: nextDeployments,
              metronomeDeployments: nextDeployments,
              activeDeploymentId: "",
              active_deployment_id: "",
              activeDeploymentVersion: 0,
              active_deployment_version: 0,
              unpublishedAt: now,
              unpublished_at: now,
            };
            delete nextMetadata.publishedAt;
            delete nextMetadata.published_at;
            const nextWorkflow = normalizeMetronomeWorkflow({
              ...activeWorkflow,
              status: "draft",
              nodes,
              edges,
              deployments: nextDeployments,
              activeDeploymentId: "",
              activeDeploymentVersion: 0,
              publishedAt: "",
              metadata: nextMetadata,
              updatedAt: now,
            });
            setMetronomePublishState({ status: "loading", message: "" });
            replaceMetronomeWorkflowInEditableState(activeWorkflowId, nextWorkflow);
            try {
              const savedWorkflow = await saveEditableMetronomeWorkflowApi(nextWorkflow);
              const unpublishedWorkflow = await publishMetronomeWorkflowApi(savedWorkflow.id || nextWorkflow.id, false);
              replaceMetronomeWorkflowInEditableState(nextWorkflow.id, unpublishedWorkflow);
              if (unpublishedWorkflow.id && unpublishedWorkflow.id !== activeWorkflowId) {
                setActiveWorkflowId(unpublishedWorkflow.id);
              }
              await refreshMetronomeDeploymentEvents(unpublishedWorkflow.id || savedWorkflow.id || nextWorkflow.id);
              setIsMetronomeApiAvailable(true);
              setMetronomePublishState({ status: "idle", message: "" });
            } catch (error) {
              console.warn("[Metronome] Failed to unpublish workflow", error);
              if (!error?.status || error.status >= 500) setIsMetronomeApiAvailable(false);
              replaceMetronomeWorkflowInEditableState(activeWorkflowId, activeWorkflow);
              setMetronomePublishState(getMetronomePublishErrorState(error));
            }
          }, [activeWorkflow, activeWorkflowId, nodes, edges, refreshMetronomeDeploymentEvents, replaceMetronomeWorkflowInEditableState]);

          const createWorkflowCopy = useCallback(async (sourceWorkflow, options = {}) => {
            if (!sourceWorkflow) return;
            const nextWorkflow = createMetronomeWorkflowCopy(sourceWorkflow, options);
            if (isMetronomeApiAvailable) {
              try {
                const savedWorkflow = await createMetronomeWorkflowApi(nextWorkflow);
                setWorkflows((current) => replaceMetronomeWorkflow(current, savedWorkflow));
                setActiveWorkflowId(savedWorkflow.id);
                return;
              } catch (error) {
                console.warn("[Metronome] Failed to duplicate persisted workflow", error);
                setIsMetronomeApiAvailable(false);
              }
            }
            setWorkflows((current) => [nextWorkflow, ...current]);
            setActiveWorkflowId(nextWorkflow.id);
          }, [isMetronomeApiAvailable]);

          const copyBuiltInWorkflow = useCallback(async (workflow) => {
            if (!workflow) return;
            await createWorkflowCopy(workflow, {
              name: (workflow.name || "Default workflow") + " copy",
              creator: currentMetronomeUserCreator,
            });
          }, [createWorkflowCopy, currentMetronomeUserCreator]);

          const duplicateWorkflow = useCallback(async (workflow) => {
            if (!workflow) return;
            if (isMetronomeWorkflowBuiltIn(workflow)) {
              await copyBuiltInWorkflow(workflow);
              return;
            }
            let sourceWorkflow = workflow;
            if (
              isMetronomeWorkflowTeamShared(sourceWorkflow)
              && (!hasMetronomeWorkflowGraphNodes(sourceWorkflow) || !hasMetronomeWorkflowGraphEdges(sourceWorkflow))
            ) {
              try {
                sourceWorkflow = await hydrateTeamSharedMetronomeWorkflow(sourceWorkflow);
              } catch (error) {
                console.warn("[Metronome] Failed to hydrate team-shared workflow before copying", error);
              }
              if (!hasMetronomeWorkflowGraphNodes(sourceWorkflow)) {
                window.alert(getMetronomeTeamShareMissingGraphMessage(workflow));
                return;
              }
            }
            const workflowId = String(sourceWorkflow.id || "").trim();
            await createWorkflowCopy(sourceWorkflow, {
              nodes: workflowId && workflowId === activeWorkflowId ? (nodes || sourceWorkflow.nodes || []) : (sourceWorkflow.nodes || []),
              edges: workflowId && workflowId === activeWorkflowId ? (edges || sourceWorkflow.edges || []) : (sourceWorkflow.edges || []),
              creator: currentMetronomeUserCreator,
            });
          }, [activeWorkflowId, nodes, edges, createWorkflowCopy, copyBuiltInWorkflow, hydrateTeamSharedMetronomeWorkflow, currentMetronomeUserCreator]);

          const duplicateActiveWorkflow = useCallback(async () => {
            if (!activeWorkflow) return;
            await duplicateWorkflow(activeWorkflow);
          }, [activeWorkflow, duplicateWorkflow]);

          const deleteWorkflow = useCallback((workflow) => {
            if (!workflow || isMetronomeWorkflowBuiltIn(workflow)) return;
            const workflowId = String(workflow.id || "").trim();
            if (!workflowId) return;
            const confirmed = window.confirm("Delete \"" + (workflow.name || "Untitled Metronome") + "\"? This cannot be undone.");
            if (!confirmed) return;
            setWorkflows((current) => current.filter((workflow) => workflow.id !== workflowId));
            if (workflowId === activeWorkflowId) {
              setActiveWorkflowId("");
              setSelectedNodeId("");
            }
            if (isMetronomeApiAvailable) {
              void deleteMetronomeWorkflowApi(workflowId)
                .catch((error) => {
                  console.warn("[Metronome] Failed to delete persisted workflow", error);
                  setIsMetronomeApiAvailable(false);
                });
            }
          }, [activeWorkflowId, isMetronomeApiAvailable]);

          const hideTeamSharedMetronomeWorkflowFromList = useCallback((workflow) => {
            if (!workflow || !isMetronomeWorkflowTeamShared(workflow)) return;
            const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(workflow);
            if (!hiddenKey) return;
            const workflowId = String(workflow.id || "").trim();
            setHiddenTeamSharedMetronomeWorkflowKeys((currentKeys) => {
              const nextKeys = normalizeMetronomeHiddenTeamSharedWorkflowKeys([...(Array.isArray(currentKeys) ? currentKeys : []), hiddenKey]);
              writeMetronomeHiddenTeamSharedWorkflowKeys(metronomeHiddenTeamSharedWorkflowStorageScope, nextKeys);
              return nextKeys;
            });
            if (workflowId && workflowId === activeWorkflowId) {
              setActiveWorkflowId("");
              setSelectedNodeId("");
            }
          }, [activeWorkflowId, metronomeHiddenTeamSharedWorkflowStorageScope]);

          const restoreTeamSharedMetronomeWorkflowToList = useCallback((workflow) => {
            if (!workflow || !isMetronomeWorkflowTeamShared(workflow)) return;
            const hiddenKey = getMetronomeTeamSharedWorkflowHiddenKey(workflow);
            if (!hiddenKey) return;
            setHiddenTeamSharedMetronomeWorkflowKeys((currentKeys) => {
              const nextKeys = normalizeMetronomeHiddenTeamSharedWorkflowKeys(currentKeys)
                .filter((key) => key !== hiddenKey);
              writeMetronomeHiddenTeamSharedWorkflowKeys(metronomeHiddenTeamSharedWorkflowStorageScope, nextKeys);
              return nextKeys;
            });
          }, [metronomeHiddenTeamSharedWorkflowStorageScope]);

          const deleteActiveWorkflow = useCallback(() => {
            if (!activeWorkflowId || !activeWorkflow || isActiveWorkflowBuiltIn) return;
            deleteWorkflow(activeWorkflow);
          }, [activeWorkflow, activeWorkflowId, isActiveWorkflowBuiltIn, deleteWorkflow]);

          const openMetronomeShareWorkflowModal = useCallback((workflow) => {
            if (!workflow || isMetronomeWorkflowBuiltIn(workflow)) return;
            const workflowId = String(workflow.id || "").trim();
            if (!workflowId) return;
            setMetronomeShareWorkflowId(workflowId);
            setMetronomeShareAccessLevel("use");
            setMetronomeShareState({ status: "idle", message: "" });
          }, []);

          const closeMetronomeShareWorkflowModal = useCallback(() => {
            if (metronomeShareState.status === "loading" || metronomeShareState.status === "sharing") return;
            setMetronomeShareWorkflowId("");
            setMetronomeShareTeamId("");
            setMetronomeShareAccessLevel("use");
            setMetronomeShareState({ status: "idle", message: "" });
          }, [metronomeShareState.status]);

          const shareMetronomeWorkflowWithTeam = useCallback(async () => {
            if (!metronomeShareWorkflow || isMetronomeWorkflowBuiltIn(metronomeShareWorkflow)) return;
            const normalizedTeamId = String(metronomeShareTeamId || "").trim();
            const normalizedWorkflowId = String(metronomeShareWorkflow.id || "").trim();
            if (!normalizedTeamId || !normalizedWorkflowId) return;
            let normalizedBackendUrl = String(backendUrl || "/api/real").trim() || "/api/real";
            normalizedBackendUrl = normalizedBackendUrl.replace(new RegExp("/+$"), "");
            if (!normalizedBackendUrl) {
              setMetronomeShareState({ status: "error", message: "Team sharing is unavailable in this session." });
              return;
            }
            let workflowForShare = metronomeShareWorkflow;
            if (!hasMetronomeWorkflowGraphNodes(workflowForShare) || !hasMetronomeWorkflowGraphEdges(workflowForShare)) {
              try {
                const loadedWorkflow = await fetchMetronomeWorkflowWithGraphFromApi(normalizedWorkflowId, readMetronomeSelectedDeploymentId(workflowForShare));
                if (loadedWorkflow?.id) {
                  workflowForShare = mergeMetronomeWorkflowGraphFallback(workflowForShare, loadedWorkflow);
                  setWorkflows((current) => replaceMetronomeWorkflowById(current, normalizedWorkflowId, workflowForShare));
                }
              } catch (error) {
                console.warn("[Metronome] Failed to hydrate workflow before team sharing", error);
              }
            }
            if (!hasMetronomeWorkflowGraphNodes(workflowForShare)) {
              setMetronomeShareState({ status: "error", message: "The selected Metronome workflow graph could not be loaded. Save the workflow and try sharing it again." });
              return;
            }
            const isSharingActiveWorkflow = normalizedWorkflowId === activeWorkflowId;
            const shareNodes = isSharingActiveWorkflow ? (nodes || workflowForShare.nodes || []) : (workflowForShare.nodes || []);
            const shareEdges = isSharingActiveWorkflow ? (edges || workflowForShare.edges || []) : (workflowForShare.edges || []);
            const shareWorkflow = normalizeMetronomeWorkflow({
              ...workflowForShare,
              nodes: createMetronomePersistedNodes(shareNodes),
              edges: createMetronomePersistedEdges(shareEdges),
              triggerSummary: deriveMetronomeTriggerSummary(shareNodes),
            });
            let shareVersions = readMetronomeWorkflowDeployments(shareWorkflow);
            if (isMetronomeApiAvailable) {
              try {
                const fetchedVersions = await fetchMetronomeVersionsApi(normalizedWorkflowId);
                if (Array.isArray(fetchedVersions) && fetchedVersions.length) {
                  shareVersions = fetchedVersions;
                }
              } catch (versionError) {
                console.warn("[Metronome] Failed to load workflow versions before team sharing", versionError);
              }
            }
            const accessLevel = ["use", "edit", "manage"].includes(String(metronomeShareAccessLevel || "").trim())
              ? String(metronomeShareAccessLevel || "").trim()
              : "use";
            setMetronomeShareState({ status: "sharing", message: "" });
            try {
              const headers = new Headers(requestHeaders || {});
              headers.set("Content-Type", "application/json");
              if (apiKey) headers.set("X-API-Key", apiKey);
              const shareCreator = normalizeMetronomeWorkflowCreator(shareWorkflow) || currentMetronomeUserCreator;
              const shareCreatorMetadata = buildMetronomeWorkflowCreatorMetadata(shareCreator);
              const shareDefinition = createMetronomeWorkflowDefinition(shareWorkflow, shareWorkflow.nodes, shareWorkflow.edges);
              const workflowGraphSnapshot = {
                definition: shareDefinition,
                nodes: shareDefinition.nodes,
                edges: shareDefinition.edges,
              };
              const shareMetadata = {
                resourceType: "metronome_workflow",
                resourceKind: "metronome_workflow",
                definition: shareDefinition,
                nodes: shareDefinition.nodes,
                edges: shareDefinition.edges,
                workflowGraphSnapshot,
                graphSnapshot: workflowGraphSnapshot,
                deployments: shareVersions,
                metronomeDeployments: shareVersions,
                versions: shareVersions,
                ...shareCreatorMetadata,
                workflow: {
                  id: normalizedWorkflowId,
                  name: shareWorkflow.name || "Untitled Metronome",
                  description: shareWorkflow.description || "",
                  status: shareWorkflow.status || "draft",
                  triggerSummary: shareWorkflow.triggerSummary || "Manual",
                  projectId: readMetronomeWorkflowProjectId(shareWorkflow),
                  projectName: readMetronomeWorkflowProjectName(shareWorkflow),
                  nodeCount: shareWorkflow.nodes.length,
                  edgeCount: shareWorkflow.edges.length,
                  definition: shareDefinition,
                  nodes: shareDefinition.nodes,
                  edges: shareDefinition.edges,
                  workflowGraphSnapshot,
                  graphSnapshot: workflowGraphSnapshot,
                  deployments: shareVersions,
                  metronomeDeployments: shareVersions,
                  versions: shareVersions,
                  ...shareCreatorMetadata,
                },
              };
              const postSharePayload = (payload) => fetch(
                normalizedBackendUrl + "/teams/" + encodeURIComponent(normalizedTeamId) + "/resource-shares",
                {
                  method: "POST",
                  headers,
                  credentials: "include",
                  cache: "no-store",
                  body: JSON.stringify(payload),
                }
              );
              const basePayload = {
                resourceType: "metronome_workflow",
                resourceId: normalizedWorkflowId,
                accessLevel,
                metadata: shareMetadata,
              };
              let response = await postSharePayload(basePayload);
              let data = await response.json().catch(() => ({}));
              if (!response.ok && [400, 404, 409, 500].includes(Number(response.status || 0))) {
                response = await postSharePayload({
                  ...basePayload,
                  resourceType: "imagine_template",
                  metadata: {
                    ...shareMetadata,
                    backendCompatibilityResourceType: "imagine_template",
                  },
                });
                data = await response.json().catch(() => ({}));
              }
              if (!response.ok) {
                throw new Error(data?.message || data?.error || "Failed to share workflow.");
              }
              setMetronomeShareWorkflowId("");
              setMetronomeShareTeamId("");
              setMetronomeShareAccessLevel("use");
              setMetronomeShareState({ status: "idle", message: "" });
            } catch (error) {
              setMetronomeShareState({ status: "error", message: error?.message || "Failed to share workflow." });
            }
          }, [metronomeShareWorkflow, metronomeShareTeamId, metronomeShareAccessLevel, backendUrl, apiKey, requestHeaders, activeWorkflowId, nodes, edges, currentMetronomeUserCreator]);

          const handleMetronomeCodeFileSelect = useCallback((path) => {
            const normalizedPath = String(path || "").trim();
            if (normalizedPath) setActiveMetronomeCodeFilePath(normalizedPath);
          }, []);

          const cloneMetronomeCodeFiles = (files) => (Array.isArray(files) ? files : [])
            .map((file) => ({ ...file }));
          const areMetronomeCodeFilesEqual = (leftFiles, rightFiles) => {
            const left = Array.isArray(leftFiles) ? leftFiles : [];
            const right = Array.isArray(rightFiles) ? rightFiles : [];
            if (left.length !== right.length) return false;
            const rightByPath = new Map(right.map((file) => [String(file?.path || ""), String(file?.value || "")]));
            return left.every((file) => (
              rightByPath.get(String(file?.path || "")) === String(file?.value || "")
            ));
          };

          const handleMetronomeCodeFileChange = useCallback((nextCode) => {
            if (isActiveWorkflowBuiltIn) return;
            const activePath = String(activeMetronomeCodeFile?.path || activeMetronomeCodeFilePath || "main.py");
            const baseFiles = metronomeCodeFiles.length
              ? cloneMetronomeCodeFiles(metronomeCodeFiles)
              : generatedMetronomePythonFiles.map((file) => ({ ...file, originalValue: file.value }));
            const normalizedNextCode = String(nextCode || "");
            const activeFile = baseFiles.find((file) => file.path === activePath);
            if (String(activeFile?.value || "") === normalizedNextCode) return;
            setMetronomeCodeUndoStack((current) => [...current, cloneMetronomeCodeFiles(baseFiles)].slice(-100));
            setMetronomeCodeRedoStack([]);
            setMetronomeCodeFilesDraft(baseFiles.map((file) => file.path === activePath
              ? { ...file, value: normalizedNextCode }
              : file
            ));
            setIsMetronomeCodeDirty(true);
            setMetronomeCodeRunState({ status: "idle", message: "" });
          }, [isActiveWorkflowBuiltIn, activeMetronomeCodeFile, activeMetronomeCodeFilePath, generatedMetronomePythonFiles, metronomeCodeFiles]);

          const handleMetronomeCodeUndo = useCallback(() => {
            if (isActiveWorkflowBuiltIn || metronomeCodeUndoStack.length === 0) return;
            const previousFiles = cloneMetronomeCodeFiles(metronomeCodeUndoStack[metronomeCodeUndoStack.length - 1]);
            setMetronomeCodeUndoStack((current) => current.slice(0, -1));
            setMetronomeCodeRedoStack((current) => [
              ...current,
              cloneMetronomeCodeFiles(metronomeCodeFiles),
            ].slice(-100));
            setMetronomeCodeFilesDraft(previousFiles);
            setIsMetronomeCodeDirty(!areMetronomeCodeFilesEqual(previousFiles, generatedMetronomePythonFiles));
            setMetronomeCodeRunState({ status: "idle", message: "" });
          }, [generatedMetronomePythonFiles, isActiveWorkflowBuiltIn, metronomeCodeFiles, metronomeCodeUndoStack]);

          const handleMetronomeCodeRedo = useCallback(() => {
            if (isActiveWorkflowBuiltIn || metronomeCodeRedoStack.length === 0) return;
            const nextFiles = cloneMetronomeCodeFiles(metronomeCodeRedoStack[metronomeCodeRedoStack.length - 1]);
            setMetronomeCodeRedoStack((current) => current.slice(0, -1));
            setMetronomeCodeUndoStack((current) => [
              ...current,
              cloneMetronomeCodeFiles(metronomeCodeFiles),
            ].slice(-100));
            setMetronomeCodeFilesDraft(nextFiles);
            setIsMetronomeCodeDirty(!areMetronomeCodeFilesEqual(nextFiles, generatedMetronomePythonFiles));
            setMetronomeCodeRunState({ status: "idle", message: "" });
          }, [generatedMetronomePythonFiles, isActiveWorkflowBuiltIn, metronomeCodeFiles, metronomeCodeRedoStack]);

          const applyMetronomeCodeDraftToGraph = useCallback((options = {}) => {
            if (isActiveWorkflowBuiltIn) {
              throw new Error("Copy this default workflow before editing generated code.");
            }
            if (!activeWorkflowId || !activeWorkflow) {
              throw new Error("Open a Metronome workflow before applying code.");
            }
            const parsed = parseMetronomePythonSdkFiles(
              metronomeCodeFiles,
              activeMetronomeEditorWorkflow?.name || activeWorkflow.name
            );
            const nextNodes = Array.isArray(parsed.nodes) ? parsed.nodes : [];
            const nextEdges = normalizeMetronomeEdgesForNodes(parsed.edges, nextNodes);
            pushGraphHistory();
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
            const nextName = String(parsed.name || activeWorkflow.name || "Untitled Metronome").trim() || "Untitled Metronome";
            setMetronomeWorkflowNameDraft(nextName);
            setIsMetronomeCodeDirty(false);
            setMetronomeCodeUndoStack([]);
            setMetronomeCodeRedoStack([]);
            const nextFiles = generateMetronomePythonSdkFiles({ ...activeWorkflow, name: nextName }, nextNodes, nextEdges)
              .map((file) => ({ ...file, originalValue: file.value }));
            setMetronomeCodeFilesDraft(nextFiles);
            setActiveMetronomeCodeFilePath((currentPath) => nextFiles.some((file) => file.path === currentPath) ? currentPath : "main.py");
            if (!options.silent) {
              setMetronomeCodeRunState({ status: "success", message: "Code applied to the visual editor." });
            }
            return { name: nextName, nodes: nextNodes, edges: nextEdges };
          }, [isActiveWorkflowBuiltIn, activeWorkflow, activeWorkflowId, activeMetronomeEditorWorkflow?.name, metronomeCodeFiles, pushGraphHistory, setNodes, setEdges]);

          const setMetronomeEditorModeFromNav = useCallback((nextMode) => {
            const normalizedMode = nextMode === "runs" ? "runs" : nextMode === "code" ? "code" : "edit";
            if (normalizedMode !== "code" && metronomeEditorMode === "code" && isMetronomeCodeDirty) {
              try {
                applyMetronomeCodeDraftToGraph({ silent: true });
              } catch (error) {
                setMetronomeCodeRunState({ status: "error", message: error?.message || "Fix code errors before returning to the visual editor." });
                return;
              }
            }
            setMetronomeRunInlineDetailId("");
            setMetronomeEditorMode(normalizedMode);
          }, [metronomeEditorMode, isMetronomeCodeDirty, applyMetronomeCodeDraftToGraph]);

          const handleCopyGeneratedMetronomeCode = useCallback(() => {
            if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
              void navigator.clipboard.writeText(String(activeMetronomeCodeFile?.value || ""));
            }
          }, [activeMetronomeCodeFile]);

          const performReturnToMetronomeOverview = useCallback(() => {
            discardActiveMetronomeDraft();
            setActiveWorkflowId("");
            setSelectedNodeId("");
            setMetronomeRunInlineDetailId("");
          }, [discardActiveMetronomeDraft]);

          const returnToMetronomeOverview = useCallback(() => (
            requestMetronomeNavigation(performReturnToMetronomeOverview)
          ), [performReturnToMetronomeOverview, requestMetronomeNavigation]);

          const openMetronomeVersionSaveDialog = useCallback((options = {}) => {
            if (!activeWorkflow || isActiveWorkflowBuiltIn) return false;
            const hasPendingChanges = isMetronomeCodeDirty || hasActiveMetronomeVersionChanges();
            if (!hasPendingChanges) return false;
            if (isMetronomeCodeDirty) {
              try {
                applyMetronomeCodeDraftToGraph({ silent: true });
              } catch (error) {
                setMetronomeCodeRunState({
                  status: "error",
                  message: error?.message || "Fix code errors before saving this workflow.",
                });
                return false;
              }
            }
            setSelectedNodeId("");
            setMetronomePublishState({ status: "idle", message: "" });
            setWorkflowVersionSaveDialog({
              initialMode: options?.mode === "current" ? "current" : "new",
              key: Date.now().toString(36) + Math.random().toString(36).slice(2),
            });
            return true;
          }, [
            activeWorkflow,
            applyMetronomeCodeDraftToGraph,
            isActiveWorkflowBuiltIn,
            isMetronomeCodeDirty,
          ]);

          const publishActiveWorkflowFromTopNav = useCallback(() => {
            return openMetronomeVersionSaveDialog();
          }, [openMetronomeVersionSaveDialog]);

          useEffect(() => {
            if (!isEditor || isActiveWorkflowBuiltIn || !activeWorkflow) {
              return undefined;
            }
            const handleMetronomeVersionShortcut = (event) => {
              if (!(event.metaKey || event.ctrlKey)) return;
              if (workflowVersionSaveDialog || workflowVersionModal || workflowNameModal) return;
              const key = String(event.key || "").toLowerCase();
              if (key !== "s" && key !== "p") return;
              if (!hasActiveMetronomeVersionChanges()) return;
              event.preventDefault();
              openMetronomeVersionSaveDialog({
                mode: event.shiftKey ? "new" : undefined,
              });
            };
            window.addEventListener("keydown", handleMetronomeVersionShortcut, true);
            return () => window.removeEventListener("keydown", handleMetronomeVersionShortcut, true);
          }, [
            activeWorkflow,
            isActiveWorkflowBuiltIn,
            isEditor,
            openMetronomeVersionSaveDialog,
            workflowNameModal,
            workflowVersionModal,
            workflowVersionSaveDialog,
          ]);

          useEffect(() => {
            if (!topNavActionsRef) return;
            topNavActionsRef.current = activeWorkflow
              ? isActiveWorkflowBuiltIn
                ? {
                    edit: null,
                    rename: null,
                    duplicate: duplicateActiveWorkflow,
                    share: null,
                    delete: null,
                    publish: null,
                    revertVersion: null,
                    goOverview: returnToMetronomeOverview,
                    setMode: setMetronomeEditorModeFromNav,
                    selectVersion: null,
                    createVersion: null,
                    openVersionHistory: null,
                  }
                : {
                    edit: openEditWorkflowModal,
                    rename: openEditWorkflowModal,
                    duplicate: duplicateActiveWorkflow,
                    share: isActiveWorkflowTeamShared ? null : () => openMetronomeShareWorkflowModal(activeWorkflow),
                    delete: isActiveWorkflowTeamShared ? null : deleteActiveWorkflow,
                    publish: publishActiveWorkflowFromTopNav,
                    revertVersion: revertActiveWorkflowToLastSavedVersion,
                    goOverview: returnToMetronomeOverview,
                    setMode: setMetronomeEditorModeFromNav,
                    selectVersion: restoreActiveWorkflowVersion,
                    createVersion: () => openMetronomeVersionSaveDialog({ mode: "new" }),
                    openVersionHistory: openMetronomeVersionHistorySidebar,
                  }
              : {
                  edit: null,
                  rename: null,
                  duplicate: null,
                  share: null,
                  delete: null,
                  publish: null,
                  revertVersion: null,
                  goOverview: returnToMetronomeOverview,
                  setMode: null,
                  selectVersion: null,
                  createVersion: null,
                  openVersionHistory: null,
                };
          }, [topNavActionsRef, activeWorkflow, isActiveWorkflowBuiltIn, isActiveWorkflowTeamShared, openEditWorkflowModal, duplicateActiveWorkflow, deleteActiveWorkflow, openMetronomeShareWorkflowModal, publishActiveWorkflowFromTopNav, revertActiveWorkflowToLastSavedVersion, returnToMetronomeOverview, setMetronomeEditorModeFromNav, restoreActiveWorkflowVersion, openMetronomeVersionSaveDialog, openMetronomeVersionHistorySidebar]);

          useEffect(() => {
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(Boolean(isMetronomeVersionHistorySidebarOpen));
            }
          }, [onNodeDetailOpenChange, isMetronomeVersionHistorySidebarOpen]);

          useEffect(() => {
            if (typeof onTopNavStateChange !== "function") return;
            if (!activeWorkflow) {
              if (metronomeTopNavStateKeyRef.current) {
                metronomeTopNavStateKeyRef.current = "";
                onTopNavStateChange(null);
              }
              return;
            }
            const activeDeploymentId = String(
              activeWorkflowDeployment?.id
              || activeWorkflow?.activeDeploymentId
              || ""
            ).trim();
            const selectedDeploymentId = String(
              activeWorkflow?.metadata?.restoredFromDeploymentId
              || activeWorkflow?.metadata?.restored_from_deployment_id
              || activeDeploymentId
              || ""
            ).trim();
            const selectedVersion = activeWorkflowDeployments.find(
              (deployment) => String(deployment?.id || "").trim() === selectedDeploymentId
            )
              || activeWorkflowDeployments[0]
              || null;
            const latestVersionNumber = activeWorkflowDeployments.reduce(
              (highest, deployment) => Math.max(
                highest,
                normalizeMetronomeVersionNumber(deployment?.version, 0)
              ),
              0
            );
            const selectedVersionNumber = normalizeMetronomeVersionNumber(
              selectedVersion?.version,
              latestVersionNumber
            );
            const nextTopNavState = {
              mode: "editor",
              workflowId: activeWorkflow.id,
              runId: selectedMetronomeRunId || "",
              title: activeWorkflow.name || "Untitled Metronome",
              status: isActiveWorkflowTeamShared ? "shared" : isActiveWorkflowBuiltIn ? "default" : activeWorkflow.status === "active" ? "active" : "draft",
              readOnly: isActiveWorkflowBuiltIn,
              editorMode: metronomeEditorMode === "runs" ? "runs" : metronomeEditorMode === "code" ? "code" : "edit",
              showPublish: !isActiveWorkflowBuiltIn
                && !metronomeVersionChangesState
                && (metronomeEditorMode === "edit" || metronomeEditorMode === "code"),
              publishBusy: metronomePublishState.status === "loading",
              publishDisabled: metronomePublishState.status === "loading" || !activeMetronomeVersionChanges,
              canRevertVersion: activeWorkflowDeployments.length > 0 && activeMetronomeVersionChanges,
              showVersions: !isActiveWorkflowBuiltIn,
              versionsBusy: metronomePublishState.status === "loading",
              versionNumber: selectedVersionNumber,
              versionIsLatest: selectedVersionNumber === latestVersionNumber,
            };
            const nextTopNavStateKey = JSON.stringify(nextTopNavState);
            if (metronomeTopNavStateKeyRef.current === nextTopNavStateKey) return;
            metronomeTopNavStateKeyRef.current = nextTopNavStateKey;
            onTopNavStateChange(nextTopNavState);
          }, [onTopNavStateChange, activeWorkflow?.id, activeWorkflow?.name, activeWorkflow?.status, activeWorkflow?.activeDeploymentId, activeWorkflow?.metadata?.restoredFromDeploymentId, activeWorkflow?.metadata?.restored_from_deployment_id, activeWorkflowDeployment?.id, activeWorkflowDeployments, activeMetronomeVersionChanges, isActiveWorkflowBuiltIn, isActiveWorkflowTeamShared, metronomePublishState.status, metronomeEditorMode, metronomeVersionChangesState, selectedMetronomeRunId]);

          useEffect(() => () => {
            if (metronomeVersionComparisonTimerRef.current) {
              window.clearTimeout(metronomeVersionComparisonTimerRef.current);
              metronomeVersionComparisonTimerRef.current = null;
            }
            metronomeVersionComparisonTokenRef.current += 1;
            if (topNavActionsRef) {
              topNavActionsRef.current = { edit: null, rename: null, duplicate: null, share: null, delete: null, publish: null, revertVersion: null, goOverview: null, setMode: null, selectVersion: null, createVersion: null, openVersionHistory: null };
            }
            if (typeof onTopNavStateChange === "function") {
              metronomeTopNavStateKeyRef.current = "";
              onTopNavStateChange(null);
            }
            if (typeof onNodeDetailOpenChange === "function") {
              onNodeDetailOpenChange(false);
            }
          }, []);

          const handleConnect = useCallback((params) => {
            if (isActiveWorkflowBuiltIn) return;
            const sourceId = String(params?.source || "").trim();
            const targetId = String(params?.target || "").trim();
            const sourceHandle = String(params?.sourceHandle || "").trim();
            const targetHandle = String(params?.targetHandle || "").trim();
            const sourceNode = nodes.find((node) => String(node?.id || "") === sourceId) || null;
            const targetNode = nodes.find((node) => String(node?.id || "") === targetId) || null;
            const sourceIsLoop = isMetronomeLoopNode(sourceNode);
            const targetIsLoop = isMetronomeLoopNode(targetNode);
            const targetIsInsideSourceLoop = sourceIsLoop && String(targetNode?.parentId || "") === sourceId;
            const sourceIsInsideTargetLoop = targetIsLoop && String(sourceNode?.parentId || "") === targetId;
            const nextParams = { ...params };
            if (targetIsInsideSourceLoop && sourceHandle === "loop-left") {
              nextParams.targetHandle = "node-input";
            }
	            if (sourceIsInsideTargetLoop && targetHandle === "loop-right") {
	              nextParams.sourceHandle = nextParams.sourceHandle || "node-output";
	            }
	            const nodeById = new Map(nodes.map((node) => [String(node?.id || ""), node]));
	            const nextEdges = repairMetronomeLoopBoundaryEdge({
	              ...nextParams,
	              id: "edge_" + sourceId + "_" + targetId + "_" + Date.now(),
	            }, nodeById, 0);
	            if (!nextEdges.length) {
	              return;
	            }
	            pushGraphHistory();
	            setEdges((current) => {
	              const withNextEdges = nextEdges.reduce((acc, edge) => (
	                addEdge({ ...edge, type: "metronomeOutput" }, acc)
	              ), current);
	              return normalizeMetronomeEdgesForNodes(withNextEdges, nodes);
	            });
	          }, [isActiveWorkflowBuiltIn, nodes, setEdges, pushGraphHistory]);

          const handleDragStart = useCallback((event, item) => {
            const paletteItem = item && typeof item === "object" ? item : { kind: String(item || "action") };
            event.dataTransfer.setData("application/metronome-node-kind", paletteItem.kind || "action");
            event.dataTransfer.setData("application/metronome-node-payload", JSON.stringify({
              kind: paletteItem.kind || "action",
              subtype: paletteItem.subtype || "",
              label: paletteItem.label || "",
              copy: paletteItem.copy || "",
            }));
            event.dataTransfer.effectAllowed = "move";
          }, []);

	          const handleCreateNode = useCallback((nextNode) => {
	            if (isActiveWorkflowBuiltIn) return;
	            if (!nextNode) return;
	            pushGraphHistory();
	            setNodes((current) => normalizeMetronomeNodeOrder([...current, nextNode]));
	            const nextKind = String(nextNode?.data?.kind || "").trim();
	            setSelectedNodeId(nextKind === "note" || nextKind === "end" ? "" : nextNode.id);
	          }, [isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const handleMetronomeNodeDragStop = useCallback((_event, node) => {
            if (isActiveWorkflowBuiltIn) return;
            const nodeId = String(node?.id || "").trim();
            if (!nodeId) return;
            let didChange = false;
            let nextNodesValue = null;
            setNodes((current) => {
              const result = reparentMetronomeNodeByDrop(current, nodeId);
              didChange = Boolean(result.changed);
              nextNodesValue = result.nodes;
              return result.changed ? result.nodes : current;
            });
            if (didChange) {
              pushGraphHistory();
            }
          }, [isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const updateSelectedNodeData = useCallback((patch) => {
            if (!selectedNodeId || isActiveWorkflowBuiltIn) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              const nextData = { ...(node.data || {}), ...patch };
              return { ...node, data: nextData };
            }));
          }, [selectedNodeId, isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const updateSelectedNodeConfig = useCallback((key, value) => {
            if (!selectedNodeId || isActiveWorkflowBuiltIn) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    [key]: value,
                  },
                },
              };
            }));
          }, [selectedNodeId, isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const updateSelectedNodeConfigPatch = useCallback((patch) => {
            if (!selectedNodeId || isActiveWorkflowBuiltIn) return;
            pushGraphHistory();
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    ...(patch || {}),
                  },
                },
              };
            }));
          }, [selectedNodeId, isActiveWorkflowBuiltIn, setNodes, pushGraphHistory]);

          const deleteSelectedNode = useCallback(() => {
            const normalizedNodeId = String(selectedNodeId || "").trim();
            if (!normalizedNodeId || isActiveWorkflowBuiltIn) return;
            const nodeToDelete = nodes.find((node) => String(node?.id || "") === normalizedNodeId) || null;
            const isDeletingTrigger = String(nodeToDelete?.data?.kind || nodeToDelete?.kind || "").trim() === "trigger";
            if (isDeletingTrigger) {
              const triggerCount = nodes.filter((node) => String(node?.data?.kind || node?.kind || "").trim() === "trigger").length;
              if (triggerCount <= 1) return;
            }
            const nextNodes = normalizeMetronomeNodeOrder(
              nodes.filter((node) => String(node?.id || "") !== normalizedNodeId)
            );
            const nextEdges = normalizeMetronomeEdgesForNodes(
              edges.filter((edge) => (
                String(edge?.source || "") !== normalizedNodeId
                && String(edge?.target || "") !== normalizedNodeId
              )),
              nextNodes
            );
            pushGraphHistory();
            setNodes(nextNodes);
            setEdges(nextEdges);
            setSelectedNodeId("");
          }, [selectedNodeId, isActiveWorkflowBuiltIn, nodes, edges, setNodes, setEdges, pushGraphHistory]);

          const handleMetronomeFunctionTestInvoke = useCallback(() => {
            if (isActiveWorkflowBuiltIn || !selectedNode || selectedNode.data?.kind !== "function") return;
            const nodeId = String(selectedNode.id || "").trim();
            const functionConfig = createDefaultMetronomeFunctionConfig(selectedNode.data?.config || {});
            if (functionConfig.functionMode !== "computer_agents_function") return;
            const functionId = String(functionConfig.functionId || "").trim();
            const payloadJson = functionConfig.payloadJson || "";
            setMetronomeFunctionInvokeState({
              nodeId,
              status: "loading",
              error: "",
              resultText: "",
            });
            void invokeMetronomeFunctionResourceApi(functionId, payloadJson)
              .then((result) => {
                setMetronomeFunctionInvokeState({
                  nodeId,
                  status: "success",
                  error: "",
                  resultText: JSON.stringify(result ?? null, null, 2),
                });
              })
              .catch((error) => {
                setMetronomeFunctionInvokeState({
                  nodeId,
                  status: "error",
                  error: error?.message || "Failed to invoke function.",
                  resultText: "",
                });
              });
          }, [isActiveWorkflowBuiltIn, selectedNode]);

          useEffect(() => {
            if (isActiveWorkflowBuiltIn || !selectedNodeId || selectedNode?.data?.kind !== "action") return;
            const currentConfig = selectedNode.data?.config && typeof selectedNode.data.config === "object"
              ? selectedNode.data.config
              : {};
            const patch = {};
            const hasFallbackAgent = currentConfig.agentId === METRONOME_FALLBACK_AGENTS[0].id && defaultMetronomeAgentOption?.id !== METRONOME_FALLBACK_AGENTS[0].id;
            if ((!currentConfig.agentId || hasFallbackAgent) && defaultMetronomeAgentOption?.id) {
              patch.agentId = defaultMetronomeAgentOption.id;
              patch.agentName = defaultMetronomeAgentOption.name || "Assistant";
            }
            const contextType = currentConfig.contextType === "project" ? "project" : "computer";
            const hasFallbackComputer = currentConfig.environmentId === METRONOME_FALLBACK_COMPUTERS[0].id && defaultMetronomeComputerOption?.id !== METRONOME_FALLBACK_COMPUTERS[0].id;
            if (contextType === "computer" && (!currentConfig.environmentId || hasFallbackComputer) && defaultMetronomeComputerOption?.id) {
              patch.contextType = "computer";
              patch.resource = "computer";
              patch.environmentId = defaultMetronomeComputerOption.id;
              patch.environmentName = defaultMetronomeComputerOption.name || "Default";
            }
            if (!Object.keys(patch).length) return;
            setNodes((current) => current.map((node) => {
              if (node.id !== selectedNodeId) return node;
              return {
                ...node,
                data: {
                  ...(node.data || {}),
                  config: {
                    ...((node.data || {}).config || {}),
                    ...patch,
                  },
                },
              };
            }));
          }, [isActiveWorkflowBuiltIn, selectedNodeId, selectedNode, defaultMetronomeAgentOption, defaultMetronomeComputerOption, setNodes]);
`;
