export const TEAMS_LOADING_SCRIPT = `        async function loadTeamPageData(options = {}) {
          if (!hasRealAccess) {
            if (teamPageLoadAbortControllerRef.current) {
              teamPageLoadAbortControllerRef.current.abort(createFetchAbortReason("AbortError", "Team page access changed."));
              teamPageLoadAbortControllerRef.current = null;
            }
            return;
          }
          if (teamPageLoadAbortControllerRef.current) {
            teamPageLoadAbortControllerRef.current.abort(createFetchAbortReason("AbortError", "A newer team page load started."));
          }
          const loadAbortController = new AbortController();
          teamPageLoadAbortControllerRef.current = loadAbortController;
          const loadSequenceId = teamPageLoadSequenceRef.current + 1;
          teamPageLoadSequenceRef.current = loadSequenceId;
          const isCurrentLoad = () => (
            teamPageLoadSequenceRef.current === loadSequenceId
            && teamPageLoadAbortControllerRef.current === loadAbortController
          );
          const hasSelectedTeamIdOverride = options
            && typeof options === "object"
            && Object.prototype.hasOwnProperty.call(options, "selectedTeamId");
          const requestedTeamId = String(hasSelectedTeamIdOverride ? options.selectedTeamId : teamPageSelectedTeamId || "").trim();
          setTeamPageLoading(true);
          setTeamPageError("");
          setTeamPageRequiresPlan(false);
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams", {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              signal: loadAbortController.signal,
              // The collection endpoint intentionally ignores the active
              // organization. Do not forward the organization-scoped headers
              // used by the selected team's detail requests here.
              headers: teamListRequestHeaders,
            }, 12000);
            if (!isCurrentLoad()) {
              return;
            }
            if (!response.ok) {
              if (response.status === 403 && String(teamPageOrganizationId || "").trim()) {
                setTeamPageOrganizationId("");
              }
              if (response.status === 402 || data?.requiredPlan === "team") {
                if (response.status !== 402) {
                  requestPlatformPlanGate({
                    entitlement: "squads.use",
                    requiredPlan: "team",
                    featureName: "teams and agent squads",
                    source: "teams",
                  });
                }
                setTeamPageRequiresPlan(true);
                setTeamPageTeams([]);
                setTeamPageMembers([]);
                setTeamPageInvitations([]);
                setTeamPageShares([]);
                return;
              }
              throw new Error(getTeamPageApiErrorMessage(data));
            }
            const teams = (Array.isArray(data?.data) ? data.data : Array.isArray(data?.teams) ? data.teams : [])
              .map((team) => normalizeTeamPageTeamRecord(team));
            setTeamPageTeams(teams);
            const selectedTeam = requestedTeamId
              ? teams.find((team) => team.id === requestedTeamId) || null
              : null;
            const selectedTeamId = selectedTeam?.id || "";
            setTeamPageSelectedTeamId(selectedTeamId);
            if (selectedTeamId !== String(teamPageSelectedTeamId || "").trim()) {
              setTeamPageMembers([]);
              setTeamPageInvitations([]);
              setTeamPageShares([]);
            }
            if (!selectedTeamId) {
              setTeamPageMembers([]);
              setTeamPageInvitations([]);
              setTeamPageShares([]);
              return;
            }
            const [membersResult, invitationsResult, sharesResult] = await Promise.allSettled([
              fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(selectedTeamId) + "/members?includeProfiles=1&includeUsers=1&include=profile,user,account&expand=profile,user,account", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: loadAbortController.signal,
                headers: requestHeaders,
              }, 15000),
              fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(selectedTeamId) + "/invitations", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: loadAbortController.signal,
                headers: requestHeaders,
              }, 10000),
              fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(selectedTeamId) + "/resource-shares", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
                signal: loadAbortController.signal,
                headers: requestHeaders,
              }, 10000),
            ]);
            if (!isCurrentLoad()) {
              return;
            }
            if (membersResult.status === "rejected") {
              throw membersResult.reason;
            }
            if (!membersResult.value.response.ok) {
              throw new Error(getTeamPageApiErrorMessage(membersResult.value.data));
            }
            const rawMembers = Array.isArray(membersResult.value.data?.data) ? membersResult.value.data.data : [];
            const memberProfilesPayload = await fetchTeamPageMemberProfilePayload(selectedTeamId, rawMembers, { signal: loadAbortController.signal });
            if (!isCurrentLoad()) {
              return;
            }
            setTeamPageMembers(mergeTeamPageMemberProfiles(rawMembers, membersResult.value.data, memberProfilesPayload));
            setTeamPageInvitations(
              invitationsResult.status === "fulfilled"
              && invitationsResult.value.response.ok
              && Array.isArray(invitationsResult.value.data?.data)
                ? invitationsResult.value.data.data
                : []
            );
            setTeamPageShares(
              sharesResult.status === "fulfilled"
              && sharesResult.value.response.ok
              && Array.isArray(sharesResult.value.data?.data)
                ? sharesResult.value.data.data
                : []
            );
          } catch (error) {
            if (!isCurrentLoad() || loadAbortController.signal.aborted) {
              return;
            }
            setTeamPageError(getTeamPageApiErrorMessage({
              message: error instanceof Error ? error.message : "",
            }, isFetchAbortError(error)
              ? "Team data is taking longer than expected to load. Refresh the team page to try again."
              : "Failed to load teams."));
          } finally {
            if (isCurrentLoad()) {
              setTeamPageLoading(false);
              teamPageLoadAbortControllerRef.current = null;
            }
          }
        }

`;
