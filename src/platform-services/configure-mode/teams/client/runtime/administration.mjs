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

        async function handleTeamProfileImageSelection(nextProfileImageUrl) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const selectedTeamRecord = teamPageTeams.find((team) => String(team?.id || "") === teamId) || null;
          const profileImageUrl = String(nextProfileImageUrl || "").trim();
          if (!teamId || !selectedTeamRecord || !profileImageUrl) {
            return;
          }
          const metadata = buildTeamPageMetadataWithProfileImage(selectedTeamRecord, profileImageUrl);
          setTeamPageActionId("team-profile-image");
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
              body: JSON.stringify({ metadata }),
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update the team profile picture.");
            }
            const updatedTeam = normalizeTeamPageTeamRecord(data?.data || data?.team || {
              ...selectedTeamRecord,
              metadata,
            });
            setTeamPageTeams((current) => current.map((team) =>
              String(team?.id || "") === teamId ? updatedTeam : team
            ));
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to update the team profile picture.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleTransferTeamOwnership(memberId) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const normalizedMemberId = String(memberId || "").trim();
          const selectedTeamRecord = teamPageTeams.find((team) => String(team?.id || "") === teamId) || null;
          if (!teamId || !normalizedMemberId || !selectedTeamRecord) {
            throw new Error("A saved team and active member are required to transfer ownership.");
          }
          const currentOwnerUserId = String(
            selectedTeamRecord?.ownerUserId
            || selectedTeamRecord?.ownerId
            || selectedTeamRecord?.createdByUserId
            || selectedTeamRecord?.owner?.userId
            || selectedTeamRecord?.owner?.id
            || ""
          ).trim();
          const currentOwnerEmail = String(
            selectedTeamRecord?.ownerEmail
            || selectedTeamRecord?.owner?.email
            || ""
          ).trim().toLowerCase();
          const currentUserId = String(sessionState.userId || "").trim();
          const currentUserEmail = String(accountEmail || sessionState.email || "").trim().toLowerCase();
          const currentMember = teamPageMembers.find((member) => {
            const memberUserId = String(
              member?.userId
              || member?.user_id
              || member?.uid
              || member?.user?.id
              || member?.user?.uid
              || ""
            ).trim();
            const memberEmail = readTeamPageIdentityEmail(member);
            return Boolean(
              (currentUserId && memberUserId && memberUserId === currentUserId)
              || (currentUserEmail && memberEmail && memberEmail === currentUserEmail)
            );
          }) || null;
          const currentUserIsOwner = Boolean(
            (currentOwnerUserId && currentUserId && currentOwnerUserId === currentUserId)
            || (currentOwnerEmail && currentUserEmail && currentOwnerEmail === currentUserEmail)
            || normalizePlaygroundTeamRoleId(currentMember?.role, "") === "owner"
          );
          if (!currentUserIsOwner) {
            const error = new Error("Only the current team owner can transfer ownership.");
            setTeamPageError(error.message);
            throw error;
          }
          const targetMember = teamPageMembers.find((member) => String(member?.id || "").trim() === normalizedMemberId) || null;
          if (!targetMember) {
            const error = new Error("The new owner must be an active team member.");
            setTeamPageError(error.message);
            throw error;
          }
          const targetStatus = String(targetMember?.status || "active").trim().toLowerCase();
          if (targetStatus && targetStatus !== "active") {
            const error = new Error("The new owner must be an active team member.");
            setTeamPageError(error.message);
            throw error;
          }
          setTeamPageActionId("team-owner:" + normalizedMemberId);
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/members/" + encodeURIComponent(normalizedMemberId), {
              method: "PATCH",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ role: getPlaygroundTeamRoleApiValue("owner") }),
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to transfer team ownership.");
            }
            await loadTeamPageData({ selectedTeamId: teamId });
          } catch (error) {
            const normalizedError = error instanceof Error ? error : new Error("Failed to transfer team ownership.");
            setTeamPageError(normalizedError.message);
            throw normalizedError;
          } finally {
            setTeamPageActionId("");
          }
        }

`;
