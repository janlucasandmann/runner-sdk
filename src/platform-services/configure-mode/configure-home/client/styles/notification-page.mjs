export const CONFIGURE_HOME_NOTIFICATION_PAGE_CSS = `      .playground-configure-notifications-section {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-top: 42px;
      }

      .playground-configure-notifications-section .playground-files-control-row .playground-files-control-button {
        --playground-files-control-button-border: linear-gradient(
          -10deg,
          rgba(200, 200, 200, 0.25),
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.15),
          rgba(255, 255, 255, 0.375)
        );
        position: relative;
        z-index: 0;
        overflow: hidden;
        border: 0;
        background: transparent;
      }

      .playground-configure-notifications-section .playground-files-control-row .playground-files-control-button::before {
        content: "";
        pointer-events: none;
        position: absolute;
        inset: 0;
        border-radius: inherit;
        padding: 1px;
        background: var(--playground-files-control-button-border);
        mask-image: linear-gradient(#fff 0 0), linear-gradient(#fff 0 0);
        mask-clip: content-box, border-box;
        mask-composite: exclude;
        mask-origin: content-box, border-box;
        mask-repeat: repeat, repeat;
        mask-size: auto, auto;
      }

      .playground-configure-notifications-section .playground-files-control-row .playground-files-control-button > * {
        position: relative;
        z-index: 1;
      }

      .playground-configure-notifications-section .playground-files-control-button.is-backlog-filter {
        padding-right: 14px;
      }

      .playground-notifications-header {
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        gap: 18px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .playground-notifications-title {
        margin: 0;
        color: rgba(255, 255, 255, 0.96);
        font-size: 18px;
        font-weight: 500;
        line-height: 1.2;
      }

      .playground-notifications-subtitle {
        margin: 0;
        color: rgba(255, 255, 255, 0.52);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
      }

      .playground-notifications-library-header .playground-files-library-title-row {
        align-items: center;
      }

      .playground-notifications-nav-row {
        overflow: visible;
      }

      .playground-notifications-context-row {
        flex: 1 1 auto;
      }

      .playground-configure-notifications-section .playground-files-library-new-button:disabled {
        opacity: 0.45;
        cursor: default;
      }

      .playground-notifications-toolbar {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .playground-notifications-search-anchor {
        flex: 1 1 420px;
        min-width: 220px;
      }

      .playground-notifications-search.playground-files-library-search {
        width: 100%;
      }

      .playground-notifications-toolbar-anchor {
        flex: 0 0 auto;
      }

      .playground-notifications-toolbar-menu {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        min-width: 210px;
        z-index: 10100;
      }

      .playground-notifications-mark-read-button {
        flex: 0 0 auto;
      }

      .playground-notifications-table-shell.playground-team-table-shell {
        border-radius: 10px;
        overflow: visible;
      }

      .playground-auth-users-table.is-secrets-table.playground-notifications-table .playground-notifications-table-col-notification {
        width: 46%;
      }

      .playground-auth-users-table.is-secrets-table.playground-notifications-table .playground-notifications-table-col-type {
        width: 16%;
      }

      .playground-auth-users-table.is-secrets-table.playground-notifications-table .playground-notifications-table-col-status {
        width: 16%;
      }

      .playground-auth-users-table.is-secrets-table.playground-notifications-table .playground-notifications-table-col-time {
        width: 15%;
      }

      .playground-auth-users-table.is-secrets-table.playground-notifications-table .playground-notifications-table-col-actions {
        width: 70px;
      }

      .playground-notifications-table-main {
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .playground-notifications-table-icon-shell {
        width: 28px;
        height: 28px;
        flex: 0 0 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.88);
      }

      .playground-notifications-table-icon {
        width: 14px;
        height: 14px;
      }

      .playground-notifications-table-copy {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .playground-notifications-table-title,
      .playground-notifications-table-meta {
        max-width: 100%;
      }

      .playground-notifications-status-pill {
        display: inline-flex;
        align-items: center;
        min-height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.06);
        color: rgba(255, 255, 255, 0.58);
        font-size: 11px;
        font-weight: 400;
        line-height: 1;
      }

      .playground-notifications-status-pill.is-unread {
        background: rgba(102, 166, 255, 0.14);
        color: #9ec5ff;
      }

      .playground-notifications-row-actions {
        display: inline-flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
      }

      .playground-notifications-row-actions .notification-menu-action-button {
        min-height: 26px;
        padding: 0 8px;
        font-size: 11px;
      }

      .playground-notifications-empty {
        min-height: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        border-top: 0;
        text-align: center;
      }

      .playground-notifications-empty-title {
        color: #fff;
        font-size: 12px;
        font-weight: 400;
        line-height: 1.35;
      }

      .playground-notifications-empty-description {
        max-width: none;
        color: rgba(255, 255, 255, 0.5);
        font-size: 12px;
        font-weight: 400;
        line-height: 1.45;
        white-space: nowrap;
      }

      @media (max-width: 760px) {
        .playground-notifications-header,
        .playground-notifications-toolbar {
          align-items: stretch;
          flex-direction: column;
        }

        .playground-notifications-search-anchor,
        .playground-notifications-mark-read-button {
          width: 100%;
        }
      }

`;
