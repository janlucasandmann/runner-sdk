export const CONFIGURE_HOME_HISTORY_CAPTURE_SCRIPT = `          if (activePage === "configure") {
            return {
              page: "configure",
              mode: configureHomeTab === "notifications" ? "notifications" : "overview",
            };
          }

`;
