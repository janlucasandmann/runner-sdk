export const ORGANIZATIONS_TOP_NAVIGATION_SCRIPT = `        function renderOrganizationPageNav() {
	          const organizationTabLabel = {
	            organization: "Organization",
	            members: "Members",
	            subscription: "Subscription",
	            roles: "Permissions",
	            "identity-access": "Identity & Access",
	            billing: "Billing",
	            usage: "Usage",
	          }[organizationPageActiveTab] || "Organization";
          return renderAppHeader({
            className: "playground-settings-top-navbar",
	            pathItems: [{ label: "Admin" }, { label: organizationTabLabel }],
            includeSearchDivider: false,
            extraActions: null,
          });
        }
`;
