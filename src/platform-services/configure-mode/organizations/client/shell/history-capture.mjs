export const ORGANIZATIONS_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "organization") {
            return {
              page: "organization",
              organizationId: organizationPageSelectedOrganizationId,
	              organizationTab: organizationPageActiveTab,
	              organizationBillingSection: organizationPageBillingSection,
            };
          }
`;
