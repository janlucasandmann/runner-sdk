export const ORGANIZATIONS_MEMBERSHIP_SCRIPT = `        async function handleSendOrganizationInvite() {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const email = String(organizationPageInviteEmail || "").trim();
          if (!organizationId || !email) {
            return;
          }
          setOrganizationPageActionId("invite-organization");
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId) + "/invitations", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...baseAuthRequestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, role: organizationPageInviteRole || "member" }),
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to invite organization member.");
            }
            setOrganizationPageInviteEmail("");
            setOrganizationPageInviteRole("member");
            setOrganizationPageInviteModalOpen(false);
            await loadOrganizationPageData({ selectedOrganizationId: organizationId });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to invite organization member.");
          } finally {
            setOrganizationPageActionId("");
          }
        }

        async function handleRevokeOrganizationInvitation(invitationId) {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const normalizedInvitationId = String(invitationId || "").trim();
          if (!organizationId || !normalizedInvitationId) {
            return;
          }
          setOrganizationPageActionId("revoke-organization-invite:" + normalizedInvitationId);
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId) + "/invitations/" + encodeURIComponent(normalizedInvitationId) + "/revoke", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...baseAuthRequestHeaders,
                "Content-Type": "application/json",
              },
              body: "{}",
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to revoke organization invitation.");
            }
            await loadOrganizationPageData({ selectedOrganizationId: organizationId });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to revoke organization invitation.");
          } finally {
            setOrganizationPageActionId("");
          }
        }

        async function handleUpdateOrganizationMemberRole(memberId, role) {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const normalizedMemberId = String(memberId || "").trim();
          const normalizedRole = normalizePlaygroundOrganizationRoleId(role, "");
          if (!organizationId || !normalizedMemberId || !normalizedRole || normalizedRole === "owner") {
            return;
          }
          const actionId = "organization-member-role:" + normalizedMemberId;
          setOrganizationPageActionId(actionId);
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId) + "/members/" + encodeURIComponent(normalizedMemberId),
              {
                method: "PATCH",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...baseAuthRequestHeaders,
                  "Content-Type": "application/json",
                  [PLAYGROUND_ORGANIZATION_HEADER]: organizationId,
                },
                body: JSON.stringify({ role: normalizedRole }),
              },
              10000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to update organization member.");
            }
            await loadOrganizationPageData({ selectedOrganizationId: organizationId, silent: true });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to update organization member.");
          } finally {
            setOrganizationPageActionId((current) => current === actionId ? "" : current);
          }
        }

        async function handleRemoveOrganizationMember(memberId) {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const normalizedMemberId = String(memberId || "").trim();
          if (!organizationId || !normalizedMemberId || !window.confirm("Remove this member from the organization?")) {
            return;
          }
          const actionId = "organization-member-remove:" + normalizedMemberId;
          setOrganizationPageActionId(actionId);
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId) + "/members/" + encodeURIComponent(normalizedMemberId),
              {
                method: "DELETE",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...baseAuthRequestHeaders,
                  [PLAYGROUND_ORGANIZATION_HEADER]: organizationId,
                },
              },
              10000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to remove organization member.");
            }
            await loadOrganizationPageData({ selectedOrganizationId: organizationId, silent: true });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to remove organization member.");
          } finally {
            setOrganizationPageActionId((current) => current === actionId ? "" : current);
          }
        }
`;
