export const ORGANIZATIONS_NAVIGATION_SCRIPT = `        function openOrganizationPage() {
          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setSidebarWorkspaceMode("configure");
          setActivePage("organization");
        }

        function openOrganizationOverviewPage() {
          setOrganizationPageSelectedOrganizationId("");
          setOrganizationPageActiveTab("members");
          setOrganizationPageSelectedRoleId("member");
          setOrganizationPagePendingDestination(null);
          setOrganizationPageMembers([]);
          setOrganizationPageInvitations([]);
          setOrganizationPageResources([]);
          openOrganizationPage();
        }

        function openOrganizationBillingPage(tab = "billing", billingSection = "costs-plans", options = {}) {
          const normalizedTab = tab === "usage" ? "usage" : "billing";
          const normalizedBillingSection = ["costs-plans", "costs-plan-options", "costs-records"].includes(billingSection)
            ? billingSection
            : "costs-plans";
          const viewedOrganizationId = activePage === "organization"
            ? String(organizationPageSelectedOrganizationId || "").trim()
            : "";
          const personalOrganizationId = String(getOrganizationPagePersonalOrganization(organizationPageOrganizations)?.id || "").trim();
          const targetOrganizationId = String(
            options?.organizationId
            || viewedOrganizationId
            || activeOrganizationId
            || personalOrganizationId
            || "",
          ).trim();

          setAccountMenuOpen(false);
          setNotificationsOpen(false);
          setProfileEditorOpen(false);
          setSidebarWorkspaceMode("configure");
          setOrganizationPageActiveTab(normalizedTab);
          setOrganizationPageBillingSection(normalizedBillingSection);
          setSettingsBillingError("");
          setSettingsBillingSuccess("");
          setSettingsBillingPeriodOffset(0);
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
`;
