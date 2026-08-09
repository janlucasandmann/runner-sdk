export const ORGANIZATIONS_ADMINISTRATION_SCRIPT = `        async function handleCreateOrganization() {
          const name = String(organizationPageCreateName || "").trim();
          if (!name) {
            return;
          }
          setOrganizationPageActionId("create-organization");
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations", {
              method: "POST",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...baseAuthRequestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name }),
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to create organization.");
            }
            const organization = normalizeOrganizationPageRecord(data?.data || data?.organization || data);
            setOrganizationPageCreateName("");
            setOrganizationPageCreateModalOpen(false);
            if (organization.id) {
              setActiveOrganizationFromRecord(organization);
              setOrganizationPageSelectedOrganizationId(organization.id);
            }
            await loadOrganizationPageData({ selectedOrganizationId: organization.id || "" });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to create organization.");
          } finally {
            setOrganizationPageActionId("");
          }
        }

        async function handleSwitchOrganization(organizationId) {
          const normalizedOrganizationId = String(organizationId || "").trim();
          const organization = (Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : [])
            .find((entry) => String(entry?.id || "").trim() === normalizedOrganizationId);
          if (!organization?.id) {
            return;
          }
          const currentOrganizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const isAlreadyActive = isOrganizationPageActiveOrganization(organization)
            && currentOrganizationId === normalizedOrganizationId;
          if (isAlreadyActive) {
            return;
          }
          setOrganizationPageError("");
          setActiveOrganizationFromRecord(organization);
          setOrganizationPageSelectedOrganizationId(normalizedOrganizationId);
          await loadOrganizationPageData({ selectedOrganizationId: normalizedOrganizationId });
        }

        async function handleRenameOrganization() {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const name = String(organizationPageRenameName || "").trim();
          if (!organizationId || !name) {
            return;
          }
          setOrganizationPageActionId("rename-organization");
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId), {
              method: "PATCH",
              credentials: "include",
              cache: "no-store",
              headers: {
                ...baseAuthRequestHeaders,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name }),
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to rename organization.");
            }
            setOrganizationPageRenameModalOpen(false);
            setOrganizationPageRenameName(name);
            setOrganizationPageRenameDraftOrganizationId(organizationId);
            await loadOrganizationPageData({ selectedOrganizationId: organizationId });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to rename organization.");
          } finally {
            setOrganizationPageActionId("");
          }
        }

        async function handleTransferOrganizationOwnership(memberId) {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          const normalizedMemberId = String(memberId || "").trim();
          const actionId = "organization-owner:" + normalizedMemberId;
          if (!organizationId || !normalizedMemberId) {
            throw new Error("Choose an active organization member as the new owner.");
          }
          setOrganizationPageActionId(actionId);
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(
              proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId) + "/transfer-ownership",
              {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                  ...baseAuthRequestHeaders,
                  "Content-Type": "application/json",
                  [PLAYGROUND_ORGANIZATION_HEADER]: organizationId,
                },
                body: JSON.stringify({ memberId: normalizedMemberId }),
              },
              10000
            );
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to transfer organization ownership.");
            }
            setOrganizationPageRoleMembersPopover("");
            await loadOrganizationPageData({ selectedOrganizationId: organizationId, silent: true });
          } catch (error) {
            const normalizedError = error instanceof Error
              ? error
              : new Error("Failed to transfer organization ownership.");
            setOrganizationPageError(normalizedError.message);
            throw normalizedError;
          } finally {
            setOrganizationPageActionId((current) => current === actionId ? "" : current);
          }
        }

        async function handleDeleteOrganization() {
          const organizationId = String(organizationPageSelectedOrganizationId || "").trim();
          if (!organizationId) {
            return;
          }
          const selectedOrganization = (Array.isArray(organizationPageOrganizations) ? organizationPageOrganizations : []).find((organization) => (
            String(organization?.id || "").trim() === organizationId
          ));
          if (isOrganizationPagePersonalOrganization(selectedOrganization || { id: organizationId })) {
            setOrganizationPageDeleteModalOpen(false);
            setOrganizationPageError("Personal organizations cannot be deleted.");
            return;
          }
          setOrganizationPageActionId("delete-organization");
          setOrganizationPageError("");
          try {
            const { response, data } = await fetchJsonWithTimeout(proxyBackendBase + "/organizations/" + encodeURIComponent(organizationId), {
              method: "DELETE",
              credentials: "include",
              cache: "no-store",
              headers: baseAuthRequestHeaders,
            }, 10000);
            if (!response.ok) {
              throw new Error(data?.message || data?.error || "Failed to delete organization.");
            }
            const remainingOrganizations = organizationPageOrganizations.filter((organization) => (
              String(organization?.id || "").trim() !== organizationId
            ));
            const fallbackOrganization = getOrganizationPagePersonalOrganization(remainingOrganizations)
              || remainingOrganizations[0]
              || null;
            setOrganizationPageDeleteModalOpen(false);
            setOrganizationPageRenameName("");
            setOrganizationPageRenameDraftOrganizationId("");
            setOrganizationPageMembers([]);
            setOrganizationPageInvitations([]);
            setOrganizationPageResources([]);
            if (fallbackOrganization?.id) {
              setActiveOrganizationFromRecord(fallbackOrganization);
              setOrganizationPageSelectedOrganizationId(fallbackOrganization.id);
              await loadOrganizationPageData({ selectedOrganizationId: fallbackOrganization.id });
            } else {
              setActiveOrganizationId("");
              setOrganizationPageSelectedOrganizationId("");
              await loadOrganizationPageData({ selectedOrganizationId: "" });
            }
          } catch (error) {
            const normalizedError = error instanceof Error ? error : new Error("Failed to delete organization.");
            setOrganizationPageError(normalizedError.message);
            throw normalizedError;
          } finally {
            setOrganizationPageActionId("");
          }
        }

`;
