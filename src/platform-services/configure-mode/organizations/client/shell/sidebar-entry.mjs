import { APPLIANCE_ADMIN_SIDEBAR_ENTRY_SCRIPT } from "../../../../admin-mode/appliance/index.mjs";

export const ORGANIZATIONS_ADMIN_PRIMARY_SIDEBAR_ENTRIES_SCRIPT = `              {
                id: "admin-organization",
                label: "Organization",
                Icon: Building2,
                active: activePage === "organization" && organizationPageActiveTab === "organization",
                onClick: () => openOrganizationAdminPage("organization"),
              },
              {
                id: "admin-members",
                label: "Members",
                Icon: Users,
                active: activePage === "organization" && organizationPageActiveTab === "members",
                onClick: () => openOrganizationAdminPage("members"),
              },
`;

export const ORGANIZATIONS_ADMIN_SUBSCRIPTION_SIDEBAR_ENTRIES_SCRIPT = `              {
                id: "admin-subscription-label",
                type: "subtitle",
                label: "Subscription",
              },
              {
                id: "admin-subscription",
                label: "Subscription",
                Icon: DollarSign,
                active: activePage === "organization" && organizationPageActiveTab === "subscription",
                onClick: () => openOrganizationAdminPage("subscription"),
              },
              {
                id: "admin-billing",
                label: "Billing",
                Icon: ReceiptText,
                active: activePage === "organization" && organizationPageActiveTab === "billing",
                onClick: () => openOrganizationAdminPage("billing"),
              },
`;

export const ORGANIZATIONS_ADMIN_USAGE_SIDEBAR_ENTRY_SCRIPT = `              {
                id: "admin-usage",
                label: "Usage",
                Icon: ChartColumnIncreasing,
                active: activePage === "organization" && organizationPageActiveTab === "usage",
                onClick: () => openOrganizationAdminPage("usage"),
              },
`;

export const ORGANIZATIONS_ADMIN_APPLIANCE_SIDEBAR_ENTRY_SCRIPT = APPLIANCE_ADMIN_SIDEBAR_ENTRY_SCRIPT;

export const ORGANIZATIONS_ADMIN_PERMISSIONS_SIDEBAR_ENTRIES_SCRIPT = `              {
                id: "admin-permissions-label",
                type: "subtitle",
                label: "Permissions",
              },
              {
                id: "admin-roles",
                label: "Permissions",
                Icon: ShieldCheck,
                active: activePage === "organization" && organizationPageActiveTab === "roles",
                onClick: () => openOrganizationAdminPage("roles"),
              },
              {
                id: "admin-identity-access",
                label: "Identity & Access",
                Icon: FingerprintPattern,
                active: activePage === "organization" && organizationPageActiveTab === "identity-access",
                onClick: () => openOrganizationAdminPage("identity-access"),
              },
`;
