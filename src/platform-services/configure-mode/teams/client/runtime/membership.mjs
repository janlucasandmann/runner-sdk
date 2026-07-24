export const TEAMS_MEMBERSHIP_ACTIONS_SCRIPT = `        async function handleCreateTeam() {
          const name = String(teamPageCreateName || "").trim();
          if (!name) {
            return;
          }
          const inviteEmails = String(teamPageCreateInviteEmails || "")
            .split(/[\\s,;]+/)
            .map((email) => email.trim())
            .filter(Boolean);
          setTeamPageActionId("create-team");
          setTeamPageError("");
          try {
            const metadata = buildTeamPageMetadataWithProfileImage({}, teamPageCreateProfileImageUrl);
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name, metadata }),
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create team.");
            }
            setTeamPageCreateName("");
            setTeamPageCreateProfileImageUrl(PLATFORM_PROFILE_IMAGE_PRESET_OPTIONS[0]?.url || "");
            setTeamPageCreateInviteEmails("");
            setTeamPageCreateInviteRole("member");
            setTeamPageCreateModalOpen(false);
            const team = data?.data || data?.team || null;
            const teamId = String(team?.id || "").trim();
            let invitationErrorMessage = "";
            if (teamId && inviteEmails.length > 0) {
              const invitationResults = await Promise.allSettled(inviteEmails.map((email) =>
                fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/invitations", {
                  method: "POST",
                  credentials: "include",
                  cache: "no-store",
                  headers: {
                    ...requestHeaders,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email, role: getPlaygroundTeamRoleApiValue(teamPageCreateInviteRole) }),
                }, 8000)
              ));
              const failedInvitation = invitationResults.find((result) =>
                result.status === "rejected" || (result.value && !result.value.response?.ok)
              );
              if (failedInvitation) {
                invitationErrorMessage = "Team created, but one or more invitations could not be sent.";
              }
            }
            if (team?.id) {
              setTeamPageSelectedTeamId(team.id);
            }
            await loadTeamPageData({ selectedTeamId: team?.id || "" });
            if (invitationErrorMessage) {
              setTeamPageError(invitationErrorMessage);
            }
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to create team.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleSendTeamInvite() {
          const email = String(teamPageInviteEmail || "").trim();
          const teamId = String(teamPageSelectedTeamId || "").trim();
          if (!email || !teamId) {
            return;
          }
          setTeamPageActionId("invite");
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/invitations", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, role: getPlaygroundTeamRoleApiValue(teamPageInviteRole) }),
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to invite team member.");
            }
            setTeamPageInviteEmail("");
            closeTeamPageInviteModal({ force: true });
            await loadTeamPageData();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to invite team member.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleRevokeTeamInvitation(invitationId) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const normalizedInvitationId = String(invitationId || "").trim();
          if (!teamId || !normalizedInvitationId) {
            return;
          }
          setTeamPageActionId("revoke:" + normalizedInvitationId);
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/invitations/" + encodeURIComponent(normalizedInvitationId) + "/revoke", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...requestHeaders,
                "Content-Type": "application/json",
              },
              body: "{}",
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to revoke invitation.");
            }
            await loadTeamPageData();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to revoke invitation.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleUpdateTeamMemberRole(memberId, role) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const normalizedMemberId = String(memberId || "").trim();
          const normalizedRole = normalizePlaygroundTeamRoleId(role, "");
          if (!teamId || !normalizedMemberId || !normalizedRole) {
            return;
          }
          setTeamPageActionId("member-role:" + normalizedMemberId);
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
              body: JSON.stringify({ role: getPlaygroundTeamRoleApiValue(normalizedRole) }),
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update team member.");
            }
            await loadTeamPageData();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to update team member.");
          } finally {
            setTeamPageActionId("");
          }
        }

        async function handleRemoveTeamMember(memberId) {
          const teamId = String(teamPageSelectedTeamId || "").trim();
          const normalizedMemberId = String(memberId || "").trim();
          if (!teamId || !normalizedMemberId) {
            return;
          }
          const confirmed = window.confirm("Remove this member from the team?");
          if (!confirmed) {
            return;
          }
          setTeamPageActionId("member-remove:" + normalizedMemberId);
          setTeamPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/teams/" + encodeURIComponent(teamId) + "/members/" + encodeURIComponent(normalizedMemberId), {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: requestHeaders,
            }, 8000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to remove team member.");
            }
            await loadTeamPageData();
          } catch (error) {
            setTeamPageError(error instanceof Error ? error.message : "Failed to remove team member.");
          } finally {
            setTeamPageActionId("");
          }
        }

`;
