export const DEVELOP_HOME_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "develop") {
            openDevelopHome();
            return;
          }
          if (entry.page === "develop-webhooks") {
            openDevelopWebhooksPage();
            if (entry.resourceId) {
              setSettingsSelectedTriggerId(String(entry.resourceId || "").trim());
            }
            return;
          }
`;
