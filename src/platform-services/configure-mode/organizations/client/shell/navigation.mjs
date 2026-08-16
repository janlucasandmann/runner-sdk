export const ORGANIZATIONS_NAVIGATION_SCRIPT = `        function normalizeOrganizationAdminPageId(value) {
          const availablePages = ["organization", "members", "roles", "identity-access"];
          if (platformHasCapability("subscriptions")) availablePages.push("subscription");
          if (platformHasCapability("billing")) availablePages.push("billing");
          if (["billable", "observability_only"].includes(platformDeploymentProfile.product?.usage?.mode)) availablePages.push("usage");
          return availablePages.includes(value)
            ? value
            : "organization";
        }

        function openOrganizationAdminPage(tab = "organization", options = {}) {
          const normalizedTab = normalizeOrganizationAdminPageId(tab);
          const normalizedBillingSection = ["costs-plans", "costs-plan-options", "costs-records"].includes(options?.billingSection)
            ? options.billingSection
            : "costs-plans";
          const activeOrganization = organizationPageOrganizations.find((organization) => (
            String(organization?.id || "").trim() === String(activeOrganizationId || "").trim()
          )) || getOrganizationPagePersonalOrganization(organizationPageOrganizations);
          const targetOrganizationId = String(
            options?.organizationId
            || activeOrganization?.id
            || organizationPageSelectedOrganizationId
            || ""
          ).trim();

          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setSidebarWorkspaceMode("admin");
          setOrganizationPageActiveTab(normalizedTab);
          if (normalizedTab === "billing") {
            setOrganizationPageBillingSection(normalizedBillingSection);
          }
          if (normalizedTab === "subscription" || normalizedTab === "billing" || normalizedTab === "usage") {
            setSettingsBillingError("");
            setSettingsBillingSuccess("");
            setSettingsBillingPeriodOffset(0);
          }
          if (targetOrganizationId) {
            setOrganizationPageSelectedOrganizationId(targetOrganizationId);
            setOrganizationPagePendingDestination(null);
          } else {
            setOrganizationPagePendingDestination({
              tab: normalizedTab,
              billingSection: normalizedBillingSection,
            });
          }
          setActivePage("organization");
        }

        function openOrganizationPage() {
          openOrganizationAdminPage("organization");
        }

        function openOrganizationBillingPage(tab = "billing", billingSection = "costs-plans", options = {}) {
          const normalizedTab = tab === "usage" ? "usage" : "billing";
          if (
            normalizedTab === "billing"
              ? !platformHasCapability("billing")
              : !["billable", "observability_only"].includes(platformDeploymentProfile.product?.usage?.mode)
          ) {
            openOrganizationAdminPage("organization", options);
            return;
          }
          const normalizedBillingSection = ["costs-plans", "costs-plan-options", "costs-records"].includes(billingSection)
            ? billingSection
            : "costs-plans";
          openOrganizationAdminPage(normalizedTab, {
            ...options,
            billingSection: normalizedBillingSection,
          });
        }
`;
