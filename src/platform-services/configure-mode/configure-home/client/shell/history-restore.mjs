export const CONFIGURE_HOME_HISTORY_RESTORE_SCRIPT = `          if (entry.page === "configure") {
            openConfigureHome({
              tab: entry.mode === "notifications" ? "notifications" : "overview",
            });
            return;
          }
`;
