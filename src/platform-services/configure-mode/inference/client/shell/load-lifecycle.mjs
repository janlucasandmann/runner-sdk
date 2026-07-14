export const INFERENCE_APP_LOAD_LIFECYCLE_SCRIPT = `          if (activePage === "inference") {
            void loadSettingsPlatformConfig();
            void loadSettingsBudgetStatus();
            return;
          }
`;

