export const APP_SIDEBAR_RESPONSIVE_RULES = `        .playground-shell,
        .playground-shell.sidebar-collapsed {
          grid-template-columns: 1fr;
        }
        .playground-sidebar {
          position: fixed;
          inset: 0 auto 0 0;
          width: min(270px, 100vw);
          z-index: 85;
        }
        .playground-sidebar.is-collapsed {
          width: 64px;
        }
`;
