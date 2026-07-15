export const API_KEYS_LOAD_LIFECYCLE_SCRIPT = `        useEffect(() => {
          if ((activePage !== "develop" && activePage !== "develop-api-keys") || !hasSessionAuth) {
            return;
          }

          void loadSettingsApiKeys();
          if (activePage === "develop" && developHomeSection === "webhooks") {
            void loadSettingsTriggers();
          }
        }, [
          activePage,
          developHomeSection,
          hasSessionAuth,
          loadSettingsApiKeys,
          loadSettingsTriggers,
        ]);
`;
