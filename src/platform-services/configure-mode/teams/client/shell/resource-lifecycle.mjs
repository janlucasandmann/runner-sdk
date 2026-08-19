export const TEAMS_RESOURCE_LIFECYCLE_SCRIPT = `	        useEffect(() => {
          const canLoadTeamBatchJobs = !isDemoMode && hasSessionAuth;
          if (!canLoadTeamBatchJobs || teamPageActiveTab !== "resources") {
            setTeamPageBatchJobs([]);
            return undefined;
          }
          let cancelled = false;
          void (async () => {
            const jobsById = new Map();
            let cursor = "";
            for (let page = 0; page < 20 && !cancelled; page += 1) {
              const query = new URLSearchParams({ limit: "250" });
              if (cursor) query.set("cursor", cursor);
              const { response, data } = await fetchJsonWithTimeout(
                proxyBackendBase + "/batch-jobs?" + query.toString(),
                {
                  method: "GET",
                  credentials: "include",
                  cache: "no-store",
                  headers: requestHeaders,
                },
                8000,
              );
              if (!response.ok) throw new Error("Unable to load Batches");
              const jobs = Array.isArray(data?.jobs)
                ? data.jobs
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              jobs.forEach((job) => {
                const id = String(job?.id || "").trim();
                if (id) jobsById.set(id, job);
              });
              const nextCursor = String(data?.nextCursor || "").trim();
              if (!data?.hasMore || !nextCursor || nextCursor === cursor) break;
              cursor = nextCursor;
            }
            if (!cancelled) setTeamPageBatchJobs(Array.from(jobsById.values()));
          })().catch(() => {
            if (!cancelled) {
              setTeamPageBatchJobs([]);
            }
          });
          return () => {
            cancelled = true;
          };
        }, [hasSessionAuth, isDemoMode, proxyBackendBase, requestHeaders, teamPageActiveTab]);
        useEffect(() => {
          const canLoadTeamMetronomeWorkflows = !isDemoMode && hasSessionAuth;
          if (!canLoadTeamMetronomeWorkflows || teamPageActiveTab !== "resources") {
            setTeamPageMetronomeWorkflows([]);
            return undefined;
          }
          let cancelled = false;
          void fetchJsonWithTimeout(proxyBackendBase + "/metronomes", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
            headers: requestHeaders,
          }, 8000).then(({ response, data }) => {
            if (cancelled) {
              return;
            }
            if (!response.ok) {
              setTeamPageMetronomeWorkflows([]);
              return;
            }
            const workflows = getPlaygroundMetronomeListArray(data)
              .map(normalizePlaygroundCalendarMetronomeWorkflow)
              .filter((workflow) => workflow.id);
            setTeamPageMetronomeWorkflows(workflows);
          }).catch(() => {
            if (!cancelled) {
              setTeamPageMetronomeWorkflows([]);
            }
          });
          return () => {
            cancelled = true;
          };
        }, [hasSessionAuth, isDemoMode, proxyBackendBase, requestHeaders, teamPageActiveTab]);
        useEffect(() => {
          const canLoadTeamProjectResourceIndexes = !isDemoMode && hasSessionAuth;
          if (!canLoadTeamProjectResourceIndexes || teamPageActiveTab !== "resources") {
            teamPageProjectResourceIndexLoadKeyRef.current = "";
            return undefined;
          }

          const normalizedTeamId = String(teamPageSelectedTeamId || "").trim();
          if (!normalizedTeamId) {
            teamPageProjectResourceIndexLoadKeyRef.current = "";
            setTeamPageProjectResourceIndexes({});
            return undefined;
          }

          const directProjectShareIds = new Set(
            (Array.isArray(teamPageShares) ? teamPageShares : [])
              .filter((share) => String(share?.resourceType || "").trim() === "project")
              .map((share) => String(share?.resourceId || "").trim())
              .filter(Boolean)
          );
          const hasTeamAccessToProject = (project) => {
            const normalizedProjectId = String(project?.id || "").trim();
            if (!normalizedProjectId) {
              return false;
            }
            if (directProjectShareIds.has(normalizedProjectId)) {
              return true;
            }
            const metadata = project?.metadata && typeof project.metadata === "object" && !Array.isArray(project.metadata)
              ? project.metadata
              : {};
            const removedTeamIds = new Set(
              (Array.isArray(metadata.teamAccessRemovedIds) ? metadata.teamAccessRemovedIds : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            );
            if (removedTeamIds.has(normalizedTeamId)) {
              return false;
            }
            const teamAccessIds = new Set(
              (Array.isArray(metadata.teamAccessIds) ? metadata.teamAccessIds : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            );
            const sharedTeamIds = new Set(
              (Array.isArray(metadata.sharedTeamIds) ? metadata.sharedTeamIds : [])
                .map((value) => String(value || "").trim())
                .filter(Boolean)
            );
            if (teamAccessIds.has(normalizedTeamId) || sharedTeamIds.has(normalizedTeamId)) {
              return true;
            }
            const rolePermissionSets = metadata.teamRolePermissionSets && typeof metadata.teamRolePermissionSets === "object" && !Array.isArray(metadata.teamRolePermissionSets)
              ? metadata.teamRolePermissionSets
              : {};
            const teamPermissionSets = metadata.teamPermissionSets && typeof metadata.teamPermissionSets === "object" && !Array.isArray(metadata.teamPermissionSets)
              ? metadata.teamPermissionSets
              : {};
            return Boolean(rolePermissionSets[normalizedTeamId] || teamPermissionSets[normalizedTeamId]);
          };
          const accessibleProjectIds = (Array.isArray(realProjects) ? realProjects : [])
            .filter(hasTeamAccessToProject)
            .map((project) => String(project?.id || "").trim())
            .filter(Boolean)
            .sort();

          if (!accessibleProjectIds.length) {
            teamPageProjectResourceIndexLoadKeyRef.current = "";
            setTeamPageProjectResourceIndexes({});
            return undefined;
          }

          const requestHeadersKey = [
            String(requestHeaders?.["X-API-Key"] || ""),
            String(requestHeaders?.["X-Runner-Upstream-Url"] || ""),
          ].join("|");
          const loadKey = [
            normalizedTeamId,
            accessibleProjectIds.join(","),
            String(proxyBackendBase || ""),
            requestHeadersKey,
          ].join("|");
          if (teamPageProjectResourceIndexLoadKeyRef.current === loadKey) {
            return undefined;
          }
          teamPageProjectResourceIndexLoadKeyRef.current = loadKey;

          let cancelled = false;
          setTeamPageProjectResourceIndexes((current) => {
            const next = {};
            accessibleProjectIds.forEach((projectId) => {
              if (current && Object.prototype.hasOwnProperty.call(current, projectId)) {
                next[projectId] = current[projectId];
              } else {
                next[projectId] = { status: "loading", data: null, error: "" };
              }
            });
            return next;
          });

          void Promise.allSettled(accessibleProjectIds.map(async (projectId) => {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/projects/" + encodeURIComponent(projectId) + "/resource-index", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to load project resources.");
            }
            return { projectId, data };
          })).then((results) => {
            if (cancelled) {
              return;
            }
            setTeamPageProjectResourceIndexes((current) => {
              const next = {};
              accessibleProjectIds.forEach((projectId, index) => {
                const result = results[index];
                if (result && result.status === "fulfilled") {
                  next[projectId] = { status: "ready", data: result.value.data, error: "" };
                  return;
                }
                next[projectId] = {
                  status: "error",
                  data: current?.[projectId]?.data || null,
                  error: result?.reason instanceof Error ? result.reason.message : "Failed to load project resources.",
                };
              });
              return next;
            });
          });

          return () => {
            cancelled = true;
          };
        }, [hasSessionAuth, isDemoMode, proxyBackendBase, realProjects, requestHeaders, teamPageActiveTab, teamPageSelectedTeamId, teamPageShares, teamPageTeams]);
`;
