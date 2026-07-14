export const TEAMS_ADMINISTRATION_ACTIONS_SCRIPT = `        async function handleRenameTeam() {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const name = String(teamPageRenameName || "").trim();
          if (!teamId || !name) {
            return;
          }
          setTeamPageActionId("rename-team");
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId), {
              method: "PATCH",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name }),
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to rename team.");
            }
            closeTeamPageRenameModal({ force: true });
            setTeamPageRenameName("");
            await loadTeamPageData({ selectedTeamId: teamId });
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to rename team.");
          } finally {
            setTeamPageActionId("");
          }
        }

`;

