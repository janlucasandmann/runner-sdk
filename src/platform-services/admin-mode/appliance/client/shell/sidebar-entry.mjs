export const APPLIANCE_ADMIN_SIDEBAR_ENTRY_SCRIPT = `              {
                id: "admin-appliance",
                label: "Appliance",
                Icon: Server,
                active: activePage === "organization" && organizationPageActiveTab === "appliance",
                onClick: () => openOrganizationAdminPage("appliance"),
              },
`;
