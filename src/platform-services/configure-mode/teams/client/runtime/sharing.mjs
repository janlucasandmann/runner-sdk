export const TEAMS_SHARING_ACTIONS_SCRIPT = `        async function handleCreateTeamResourceShare() {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const uiResourceType = getTeamResourceUiShareType(teamPageShareResourceType);
          const resourceType = getTeamResourceBackendShareType(uiResourceType);
          const resourceId = String(teamPageShareResourceId || "").trim();
          const accessLevel = String(teamPageShareAccessLevel || "").trim() || "use";
          if (!teamId || !resourceType || !resourceId) {
            return;
          }
          const postSharePayload = (payload) => fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/resource-shares", {
            method: "POST",
            credentials: "include",
            cache: "no-store",
            headers: {
              ...requestHeaders,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }, 8000);
          setTeamPageActionId("share");
          setTeamPageError("");
          try {
            const metronomeWorkflowForShare = uiResourceType === "metronome"
              ? await loadTeamPageMetronomeWorkflowForShare(resourceId)
              : null;
            const metronomeMetadata = uiResourceType === "metronome"
              ? buildTeamPageMetronomeWorkflowShareMetadata(resourceId, metronomeWorkflowForShare)
              : null;
            if (uiResourceType === "metronome" && !getPlaygroundMetronomeWorkflowDefinition(metronomeMetadata).nodes.length) {
              throw new Error("The selected Metronome workflow graph could not be loaded. Save the workflow and try sharing it again.");
            }
            const buildSharePayload = (payloadResourceType) => ({
              resourceType: payloadResourceType,
              resourceId,
              accessLevel,
              ...(uiResourceType === "imagine_template"
                ? {
                    metadata: {
                      template: readTeamPageCustomImagineTemplates().find((template) =>
                        String(template.id || "") === resourceId
                      ) || null,
                    },
                  }
                : uiResourceType === "metronome"
                  ? {
                      metadata: payloadResourceType === "imagine_template"
                        ? {
                            ...metronomeMetadata,
                            backendCompatibilityResourceType: "imagine_template",
                          }
                        : metronomeMetadata,
                    }
                  : {}),
            });
            let { response, data } = await postSharePayload(buildSharePayload(resourceType));
            if (!response.ok && uiResourceType === "metronome" && [400, 404, 409, 500].includes(response.status)) {
              const fallback = await postSharePayload(buildSharePayload("imagine_template"));
              response = fallback.response;
              data = fallback.data;
            }
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to share resource.");
            }
            setTeamPageShareResourceId("");
            closeTeamPageShareModal({ force: true });
            await loadTeamPageData();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to share resource.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleUpdateTeamResourceShareAccess(share, accessLevel) {
          const safeShare = share || {};
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const existingResourceType = String(safeShare.resourceType || safeShare.resource_type || "").trim();
          const uiResourceType = getTeamResourceUiShareType(safeShare) || getTeamResourceUiShareType(existingResourceType);
          const resourceId = String(safeShare.resourceId || safeShare.resource_id || "").trim();
          const storageResourceType = uiResourceType === "metronome"
            ? "imagine_template"
            : existingResourceType || getTeamResourceBackendShareType(uiResourceType);
          const normalizedAccessLevel = String(accessLevel || "").trim() || "use";
          if (!teamId || !storageResourceType || !resourceId) {
            return;
          }
          setTeamPageActionId("share-access:" + String(safeShare.id || storageResourceType + ":" + resourceId));
          setTeamPageError("");
          try {
            const existingMetronomeWorkflowForShare = uiResourceType === "metronome"
              ? buildTeamPageMetronomeWorkflowRecordFromShare(safeShare)
              : null;
            const loadedMetronomeWorkflowForShare = uiResourceType === "metronome"
              ? await loadTeamPageMetronomeWorkflowForShare(resourceId)
              : null;
            const metronomeWorkflowForShare = uiResourceType === "metronome"
              ? mergeTeamPageMetronomeWorkflowGraphSnapshot(
                  existingMetronomeWorkflowForShare || { id: resourceId },
                  loadedMetronomeWorkflowForShare || existingMetronomeWorkflowForShare || { id: resourceId }
                )
              : null;
            const metronomeMetadata = uiResourceType === "metronome"
              ? buildTeamPageMetronomeWorkflowShareMetadata(resourceId, metronomeWorkflowForShare)
              : null;
            if (uiResourceType === "metronome" && !getPlaygroundMetronomeWorkflowDefinition(metronomeMetadata).nodes.length) {
              throw new Error("The selected Metronome workflow graph could not be loaded. Save the workflow and try sharing it again.");
            }
            const postSharePayload = (payload) => fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/resource-shares", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            }, 8000);
            const buildUpdatePayload = (payloadResourceType) => ({
              resourceType: payloadResourceType,
              resourceId,
              accessLevel: normalizedAccessLevel,
              ...(metronomeMetadata
                ? {
                    metadata: payloadResourceType === "imagine_template"
                      ? {
                          ...metronomeMetadata,
                          backendCompatibilityResourceType: "imagine_template",
                        }
                      : metronomeMetadata,
                  }
                : {}),
            });
            const resourceTypeCandidates = uiResourceType === "metronome"
              ? Array.from(new Set([
                  "imagine_template",
                  existingResourceType,
                  getTeamResourceBackendShareType(uiResourceType),
                ].map((value) => String(value || "").trim()).filter(Boolean)))
              : [storageResourceType];
            let response = null;
            let data = {};
            let savedResourceType = storageResourceType;
            for (const candidateResourceType of resourceTypeCandidates) {
              const result = await postSharePayload(buildUpdatePayload(candidateResourceType));
              response = result.response;
              data = result.data;
              if (response.ok) {
                savedResourceType = candidateResourceType;
                break;
              }
              if (uiResourceType !== "metronome" || ![400, 404, 409, 500].includes(Number(response.status || 0))) {
                break;
              }
            }
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update shared resource.");
            }
            const responseShare = data?.data && typeof data.data === "object" && !Array.isArray(data.data)
              ? data.data
              : data?.share && typeof data.share === "object" && !Array.isArray(data.share)
                ? data.share
                : {};
            const responseShareMetadata = parseTeamResourceShareMetadata(responseShare);
            const existingShareMetadata = parseTeamResourceShareMetadata(safeShare);
            const updatedShareMetadata = metronomeMetadata
              || (Object.keys(responseShareMetadata).length > 0 ? responseShareMetadata : existingShareMetadata);
            const updatedShare = {
              ...safeShare,
              ...responseShare,
              id: String(responseShare.id || safeShare.id || "").trim(),
              teamId: String(responseShare.teamId || responseShare.team_id || safeShare.teamId || safeShare.team_id || teamId).trim(),
              resourceType: String(responseShare.resourceType || responseShare.resource_type || savedResourceType).trim() || savedResourceType,
              resourceId: String(responseShare.resourceId || responseShare.resource_id || resourceId).trim() || resourceId,
              accessLevel: String(responseShare.accessLevel || responseShare.access_level || normalizedAccessLevel).trim() || normalizedAccessLevel,
              metadata: updatedShareMetadata,
              updatedAt: String(responseShare.updatedAt || responseShare.updated_at || new Date().toISOString()).trim(),
            };
            const applyUpdatedShareLocally = () => {
              setTeamPageShares((current) => {
                const currentShares = Array.isArray(current) ? current : [];
                let replaced = false;
                const nextShares = currentShares.map((item) => {
                  const itemId = String(item?.id || "").trim();
                  const safeShareId = String(safeShare?.id || "").trim();
                  const updatedShareId = String(updatedShare.id || "").trim();
                  const itemResourceId = String(item?.resourceId || item?.resource_id || "").trim();
                  const itemResourceType = String(item?.resourceType || item?.resource_type || "").trim();
                  const sameShareId = Boolean(
                    updatedShareId && itemId === updatedShareId
                    || safeShareId && itemId === safeShareId
                  );
                  const sameResource = itemResourceId === resourceId && (
                    getTeamResourceUiShareType(item) === uiResourceType
                    || itemResourceType === existingResourceType
                    || itemResourceType === savedResourceType
                  );
                  if (!sameShareId && !sameResource) {
                    return item;
                  }
                  replaced = true;
                  return {
                    ...item,
                    ...updatedShare,
                  };
                });
                return replaced ? nextShares : [updatedShare, ...currentShares];
              });
            };
            applyUpdatedShareLocally();
            await loadTeamPageData();
            applyUpdatedShareLocally();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to update shared resource.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleDeleteTeamResourceShare(shareId) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const normalizedShareId = String(shareId || "").trim();
          if (!teamId || !normalizedShareId) {
            return;
          }
          setTeamPageActionId("share-delete:" + normalizedShareId);
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/resource-shares/" + encodeURIComponent(normalizedShareId), {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to remove shared resource.");
            }
            await loadTeamPageData();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to remove shared resource.");
          } finally {
            setTeamPageActionId("");
          }
        }

`;

