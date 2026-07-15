export const DEVELOP_HOME_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "develop") {
            openDevelopHome({
              section: entry.developSection || "overview",
            });
            return;
          }
`;
