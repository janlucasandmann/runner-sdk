export const DEVELOP_HOME_SELECTED_TITLE_SCRIPT = `          if (activePage === "develop") {
            return "Home";
          }
          if (activePage === "develop-webhooks") {
            return settingsSelectedTrigger?.name || "Webhooks";
          }
`;
