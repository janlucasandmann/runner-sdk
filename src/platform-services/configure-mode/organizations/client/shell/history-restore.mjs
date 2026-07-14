export const ORGANIZATIONS_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "organization") {
            openOrganizationPage();
            setOrganizationPageSelectedOrganizationId(String(entry.organizationId || "").trim());
	            setOrganizationPageActiveTab(
	              ["members", "resources", "roles", "billing", "usage"].includes(entry.organizationTab)
	                ? entry.organizationTab
	                : "members",
	            );
	            setOrganizationPageBillingSection(
	              ["costs-plans", "costs-plan-options", "costs-records"].includes(entry.organizationBillingSection)
	                ? entry.organizationBillingSection
	                : "costs-plans",
	            );
            return;
          }
`;
