export const TEAMS_DELETE_ACTION_SCRIPT = `        async function handleDeleteTeam() {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          if (!teamId) {
            return;
          }
          const team = teamPageTeams.find((item) => item.id === teamId) || null;
          const teamName = String(team?.name || "this team").trim() || "this team";
          const confirmed = window.confirm("Delete " + teamName + "? This removes team membership, invitations, and shared resource access.");
          if (!confirmed) {
            return;
          }
          setTeamPageActionId("delete-team");
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId), {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete team.");
            }
            closeTeamPageRenameModal({ force: true });
            setTeamPageRenameName("");
            setTeamPageSelectedTeamId("");
            setTeamPageMembers([]);
            setTeamPageInvitations([]);
            setTeamPageShares([]);
            await loadTeamPageData({ selectedTeamId: "" });
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to delete team.");
          } finally {
            setTeamPageActionId("");
          }
        }

`;

