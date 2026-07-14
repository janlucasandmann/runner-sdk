export const ORGANIZATIONS_LOAD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if (!hasRealAccess) {
            setOrganizationPageOrganizations([]);
            setOrganizationPageMembers([]);
            setOrganizationPageInvitations([]);
            return;
          }
          void loadOrganizationPageData({
            selectedOrganizationId: activePage === "organization" ? organizationPageSelectedOrganizationId : "",
            silent: activePage !== "organization",
            listOnly: activePage !== "organization",
          });
        }, [activePage, baseAuthRequestHeaders, hasRealAccess, organizationPageSelectedOrganizationId, proxyBackendBase]);

	        useEffect(() => {
	          if (activePage !== "organization" || !organizationPagePendingDestination || organizationPageSelectedOrganizationId) {
	            return;
	          }
	          const targetOrganization = organizationPageOrganizations.find((organization) => (
	            String(organization?.id || "").trim() === String(activeOrganizationId || "").trim()
	          )) || getOrganizationPagePersonalOrganization(organizationPageOrganizations);
	          const targetOrganizationId = String(targetOrganization?.id || "").trim();
	          if (!targetOrganizationId) {
	            return;
	          }
	          setOrganizationPageActiveTab(organizationPagePendingDestination.tab === "usage" ? "usage" : "billing");
	          setOrganizationPageBillingSection(
	            ["costs-plans", "costs-plan-options", "costs-records"].includes(organizationPagePendingDestination.billingSection)
	              ? organizationPagePendingDestination.billingSection
	              : "costs-plans",
	          );
	          setOrganizationPageSelectedOrganizationId(targetOrganizationId);
	          setOrganizationPagePendingDestination(null);
	        }, [
	          activeOrganizationId,
	          activePage,
	          organizationPageOrganizations,
	          organizationPagePendingDestination,
	          organizationPageSelectedOrganizationId,
	        ]);

        useEffect(() => () => {
          if (organizationPageLoadAbortControllerRef.current) {
            organizationPageLoadAbortControllerRef.current.abort(createFetchAbortReason("AbortError", "Organization page unmounted."));
            organizationPageLoadAbortControllerRef.current = null;
          }
        }, []);
`;
