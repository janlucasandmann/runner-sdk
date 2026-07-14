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
            setOrganizationPageRenameName("");
            await loadOrganizationPageData({ selectedOrganizationId: organizationId });
          } catch (error) {
            setOrganizationPageError(error instanceof Error ? error.message : "Failed to rename organization.");
          } finally {
            setOrganizationPageActionId("");
          }
        }

`;
