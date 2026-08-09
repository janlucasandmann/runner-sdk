export const ORGANIZATIONS_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "organization") {
            openOrganizationAdminPage(entry.organizationTab, {
              organizationId: String(entry.organizationId || "").trim(),
              billingSection: entry.organizationBillingSection,
            });
            return;
          }
`;
