export const SETTINGS_MODAL_NAVIGATION_SCRIPT = String.raw`        function closeSettingsModal() {
          setSettingsModalOpen(false);
        }

        function openSettingsModal(sectionId) {
          const requestedSectionId = typeof sectionId === "string" && sectionId.trim()
            ? sectionId.trim()
            : "profile";
          const normalizedSectionId = requestedSectionId === "api" ? "profile" : requestedSectionId;

          setAccountMenuOpen(false);
          setNotificationsOpen(false);

          if (normalizedSectionId === "inference") {
            setSettingsModalOpen(false);
            openInferencePage();
            return;
          }
          if (normalizedSectionId === "costs-overview") {
            setSettingsModalOpen(false);
            openOrganizationBillingPage("usage");
            return;
          }
          if (["costs-plans", "costs-plan-options", "costs-records"].includes(normalizedSectionId)) {
            setSettingsModalOpen(false);
            openOrganizationBillingPage("billing", normalizedSectionId);
            return;
          }
          if (normalizedSectionId === "integrations") {
            setSettingsModalOpen(false);
            openToolsView("tags");
            return;
          }
          if (normalizedSectionId === "webhooks") {
            setSettingsModalOpen(false);
            openDevelopWebhooksPage();
            return;
          }

          setSettingsSection(
            ["profile", "password", "delete"].includes(normalizedSectionId)
              ? normalizedSectionId
              : "profile"
          );
          setSettingsModalOpen(true);
        }
`;
