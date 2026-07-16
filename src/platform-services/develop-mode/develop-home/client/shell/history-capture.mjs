export const DEVELOP_HOME_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "develop") {
            return {
              page: "develop",
            };
          }
          if (activePage === "develop-webhooks") {
            return {
              page: "develop-webhooks",
              resourceId: settingsSelectedTriggerId,
            };
          }
`;
