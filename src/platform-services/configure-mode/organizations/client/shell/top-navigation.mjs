export const ORGANIZATIONS_TOP_NAVIGATION_SCRIPT = `        function renderOrganizationPageNav() {
	          const selectedOrganization = organizationPageOrganizations.find((organization) => (
	            String(organization?.id || "").trim() === String(organizationPageSelectedOrganizationId || "").trim()
	          ));
	          const organizationTabLabel = {
	            members: "Members",
	            resources: "Resources",
	            roles: "Roles",
	            billing: "Billing",
	            usage: "Usage",
	          }[organizationPageActiveTab] || "Members";
          return renderAppHeader({
            className: "playground-settings-top-navbar",
	            pathItems: selectedOrganization
	              ? [
	                  { label: "Configure" },
	                  {
	                    label: "Organizations",
	                    onClick: () => {
	                      setOrganizationPageSelectedOrganizationId("");
	                      setOrganizationPagePendingDestination(null);
	                    },
	                  },
	                  { label: getOrganizationPageDisplayName(selectedOrganization) },
	                  { label: organizationTabLabel },
	                ]
	              : [{ label: "Configure" }, { label: "Organizations" }],
          });
        }
`;
